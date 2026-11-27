/**
 * Netlify Serverless Function: echo-tts
 * Generates warm, live Gemini TTS playback ("Vega" prebuilt voice) for Echo's responses
 * using gemini-3.8-flash-lite-tts on the v1beta endpoint (returns native audio/wav).
 * Falls back cleanly with fallback: true when GEMINI_API_KEY is not configured.
 */

const https = require('https');
const { corsHeaders } = require('./_persistence');

const TTS_MODEL = (process.env.GEMINI_ECHO_TTS_MODEL || 'gemini-3.8-flash-lite-tts').trim();
const TTS_VOICE = (process.env.GEMINI_ECHO_VOICE || 'Vega').trim();

function requestGeminiTts(text, apiKey, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speech_metadata: {
                speaker: TTS_VOICE,
                style: 'soulful, playful, confident, warm rhythmic 90s R&B best-friend energy — expressive, witty, and genuinely uplifting'
              }
            }
          ]
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
    });

    const req = https.request(
      {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1beta/models/${encodeURIComponent(TTS_MODEL)}:generateContent`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'x-goog-api-key': apiKey
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
              const msg = (parsed.error && parsed.error.message) || `Gemini TTS HTTP ${res.statusCode}`;
              return reject(new Error(msg));
            }
            const parts = parsed.candidates?.[0]?.content?.parts || [];
            const audioPart = parts.find((p) => p && (p.inlineData || p.inline_data));
            const inline = audioPart && (audioPart.inlineData || audioPart.inline_data);
            if (!inline || !inline.data) {
              return reject(new Error('No audio bytes returned from Gemini TTS'));
            }
            resolve({
              mimeType: inline.mimeType || inline.mime_type || 'audio/wav',
              audioBase64: inline.data
            });
          } catch (err) {
            reject(new Error(`Invalid Gemini TTS JSON (${res.statusCode})`));
          }
        });
      }
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Gemini TTS request timed out'));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
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

  // Strip emojis for cleaner natural TTS delivery while keeping punctuation & pauses
  const rawText = typeof body.text === 'string' ? body.text.trim().slice(0, 600) : '';
  const cleanText = rawText.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/\s+/g, ' ').trim();

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

  try {
    const audio = await requestGeminiTts(cleanText, apiKey);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        model: TTS_MODEL,
        voice: TTS_VOICE,
        mimeType: audio.mimeType,
        audioBase64: audio.audioBase64
      })
    };
  } catch (err) {
    console.warn('[echo-tts] Falling back to browser speech:', err.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: false,
        fallback: true,
        voice: TTS_VOICE,
        reason: 'transient-tts-error'
      })
    };
  }
};
