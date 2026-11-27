/**
 * Netlify Serverless Function: echo-tts
 * Generates expressive Gemini TTS playback ("Vega" prebuilt voice) for Echo's responses
 * using Gemini 3.8 TTS Interactions API (/v1/interactions -> audio/wav) with automatic
 * fallback to v1beta, gemini-3.8-flash-tts, and clean generateContent.
 * Falls back cleanly with fallback: true when GEMINI_API_KEY is not configured.
 */

const https = require('https');
const { corsHeaders } = require('./_persistence');

const TTS_MODEL = (process.env.GEMINI_ECHO_TTS_MODEL || 'gemini-3.8-flash-lite-tts').trim();
const TTS_FALLBACK_MODEL = 'gemini-3.8-flash-tts';
const TTS_VOICE = (process.env.GEMINI_ECHO_VOICE || 'Vega').trim();
const VEGA_STYLE =
  'soulful, playful, confident, warm rhythmic 90s R&B best-friend energy — expressive, witty, and genuinely uplifting';

function sanitizeForSpeech(rawText) {
  return String(rawText || '')
    .trim()
    .slice(0, 700)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function postJsonHttps(hostname, reqPath, payloadObj, extraHeaders = {}, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payloadObj);
    const req = https.request(
      {
        hostname,
        port: 443,
        path: reqPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          ...extraHeaders
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw || '{}');
            if (res.statusCode < 200 || res.statusCode >= 300) {
              const msg = (parsed.error && parsed.error.message) || `HTTP ${res.statusCode}`;
              return reject(new Error(msg));
            }
            resolve(parsed);
          } catch (_) {
            reject(new Error(`Invalid JSON response (HTTP ${res.statusCode})`));
          }
        });
      }
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Gemini TTS request timed out'));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function requestGeminiTtsInteractions(text, apiKey, model = TTS_MODEL, apiVersion = 'v1') {
  const payload = {
    model,
    input: [
      {
        type: 'user_input',
        content: [
          {
            type: 'text',
            text,
            annotations: [
              {
                type: 'speech_metadata',
                style: VEGA_STYLE
              }
            ]
          }
        ]
      }
    ],
    response_format: {
      type: 'audio'
    },
    generation_config: {
      speech_config: [
        {
          voice: TTS_VOICE
        }
      ]
    }
  };

  const parsed = await postJsonHttps(
    'generativelanguage.googleapis.com',
    `/${apiVersion}/interactions`,
    payload,
    {
      'x-goog-api-key': apiKey,
      'Api-Revision': '2026-05-20'
    }
  );

  const steps = Array.isArray(parsed.steps) ? parsed.steps : [];
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    const step = steps[i];
    if (!step || step.type !== 'model_output' || !Array.isArray(step.content)) continue;
    const audioBlock = step.content.find((c) => c && c.type === 'audio' && c.data);
    if (audioBlock) {
      return {
        modelUsed: model,
        mimeType: audioBlock.mime_type || audioBlock.mimeType || 'audio/wav',
        audioBase64: audioBlock.data
      };
    }
  }

  if (parsed.output_audio && parsed.output_audio.data) {
    return {
      modelUsed: model,
      mimeType: parsed.output_audio.mime_type || 'audio/wav',
      audioBase64: parsed.output_audio.data
    };
  }

  throw new Error('No audio output returned from Gemini Interactions TTS');
}

async function requestGeminiTtsGenerateContent(text, apiKey, model = TTS_MODEL) {
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text }]
      }
    ],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: TTS_VOICE
          }
        }
      }
    }
  };

  const parsed = await postJsonHttps(
    'generativelanguage.googleapis.com',
    `/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    payload,
    { 'x-goog-api-key': apiKey }
  );

  const parts = parsed.candidates?.[0]?.content?.parts || [];
  const audioPart = parts.find((p) => p && (p.inlineData || p.inline_data));
  const inline = audioPart && (audioPart.inlineData || audioPart.inline_data);
  if (!inline || !inline.data) {
    throw new Error('No audio bytes returned from Gemini generateContent TTS');
  }

  return {
    modelUsed: model,
    mimeType: inline.mimeType || inline.mime_type || 'audio/wav',
    audioBase64: inline.data
  };
}

exports.handler = async function (event) {
  const headers = {
    'Content-Type': 'application/json',
    ...corsHeaders('POST, OPTIONS')
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const cleanText = sanitizeForSpeech(body.text);
  if (!cleanText) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Text is required for speech synthesis' }) };
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: false,
        fallback: true,
        voice: TTS_VOICE,
        reason: 'GEMINI_API_KEY not configured'
      })
    };
  }

  const attempts = [
    () => requestGeminiTtsInteractions(cleanText, apiKey, TTS_MODEL, 'v1'),
    () => requestGeminiTtsInteractions(cleanText, apiKey, TTS_MODEL, 'v1beta'),
    () => requestGeminiTtsInteractions(cleanText, apiKey, TTS_FALLBACK_MODEL, 'v1'),
    () => requestGeminiTtsGenerateContent(cleanText, apiKey, TTS_MODEL)
  ];

  let lastErr = null;
  for (const runAttempt of attempts) {
    try {
      const audio = await runAttempt();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          model: audio.modelUsed || TTS_MODEL,
          voice: TTS_VOICE,
          mimeType: audio.mimeType,
          audioBase64: audio.audioBase64
        })
      };
    } catch (err) {
      lastErr = err;
    }
  }

  console.warn('[echo-tts] All live TTS attempts fell back to bowl chime:', lastErr ? lastErr.message : 'unknown');
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: false,
      fallback: true,
      voice: TTS_VOICE,
      reason: 'transient-tts-error',
      detail: lastErr ? String(lastErr.message).slice(0, 180) : ''
    })
  };
};
