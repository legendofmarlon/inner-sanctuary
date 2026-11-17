/**
 * Gemini Live 3.8 Bidirectional Voice Bridge
 * Inner Sanctuary Wellness Foundation
 * 
 * Provides low-latency, real-time spoken voice grounding pauses
 * using the official Google Gen AI Live API (WebSocket bidirectional audio streaming).
 */

const { GoogleGenAI } = (() => {
  try {
    return require('@google/genai');
  } catch (e) {
    return { GoogleGenAI: null };
  }
})();

// Sanctuary Live Voice Persona Configuration
const SANCTUARY_LIVE_CONFIG = {
  model: 'gemini-3.8-live',
  generationConfig: {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: 'Aoede' // Warm, soothing, contemplative voice tone
        }
      }
    }
  },
  systemInstruction: {
    parts: [{
      text: `You are the compassionate Live Hearth Guide for Inner Sanctuary Wellness Foundation (IRS 501(c)(3) Public Charity | EIN: 39-3757168).
Our sacred pillars: Pause. Breathe. Remember. Come home to yourself.
Threefold Method: Tune In (witness yourself), Express (honor your voice), Connect (experience belonging).

Guidelines for your spoken voice:
1. Speak in an unhurried, grounded, peaceful cadence.
2. Meet the speaker with authentic tenderness, presence, and respect.
3. Invite them to take conscious breaths and release the tension in their jaw, neck, and shoulders.
4. Never use clinical diagnostic jargon or cold corporate platitudes.
5. Remind the listener: "As within, so without. The journey home to yourself does not have to be walked alone."`
    }]
  }
};

/**
 * Client-Side Browser Web Audio Worklet Configuration Helper
 * Used by web browsers to capture 16kHz PCM mic audio and play back 24kHz PCM output.
 */
function getBrowserLiveAudioClientSnippet() {
  return `
    // Inner Sanctuary Browser Live Audio Worklet Helper
    async function startSanctuaryLiveVoiceSession(apiKey) {
      const wsUrl = \`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=\${apiKey}\`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✦ Connected to Gemini Live 3.8 WebSocket');
        // 1. Send initial session configuration
        ws.send(JSON.stringify({
          setup: ${JSON.stringify(SANCTUARY_LIVE_CONFIG)}
        }));
      };

      ws.onmessage = async (event) => {
        let msg = event.data;
        if (msg instanceof Blob) msg = await msg.text();
        const data = JSON.parse(msg);

        // Receive real-time audio chunk (24kHz PCM)
        if (data.serverContent?.modelTurn?.parts) {
          for (const part of data.serverContent.modelTurn.parts) {
            if (part.inlineData?.mimeType?.startsWith('audio/pcm')) {
              playPcm24kChunk(part.inlineData.data);
            }
          }
        }
      };

      return ws;
    }
  `;
}

console.log('Gemini Live Sanctuary Voice Bridge Configured:');
console.log(`- Model: ${SANCTUARY_LIVE_CONFIG.model}`);
console.log(`- Modality: AUDIO (Bidirectional WebSocket)`);
console.log(`- Persona Voice: Aoede (Unhurried Contemplative Hearth Guide)`);

module.exports = {
  SANCTUARY_LIVE_CONFIG,
  getBrowserLiveAudioClientSnippet
};
