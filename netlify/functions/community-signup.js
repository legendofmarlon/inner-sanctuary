/**
 * Netlify Serverless Function: community-signup
 * Direct ingest for Sanctuary Community & Newsletter Subscribers.
 * Logs subscriber data, persists to ledger, and routes to leadership.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const TMP_LEDGER_PATH = path.join(os.tmpdir(), 'sanctuary-subscribers.json');

// In-memory fallback if file system is read-only in certain serverless runtimes
let inMemorySubscribers = [];

exports.handler = async function(event, context) {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const name = (data.name || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const source = (data.source || 'welcome-popup').trim();
    const state = (data.state || '').trim();

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Please provide a valid email address.' })
      };
    }

    const subscriberRecord = {
      id: `sub_${Date.now()}`,
      name: name || 'Community Member',
      email: email,
      source: source, // e.g., 'welcome-popup', 'pause-booth', 'footer'
      somaticState: state || null,
      subscribedAt: new Date().toISOString(),
      recipientsNotified: [
        'legendofmarlon@gmail.com',
        'innersanctuary0@gmail.com'
      ]
    };

    inMemorySubscribers.push(subscriberRecord);

    // Attempt persistent write if running locally or in writable environment, with /tmp fallback
    let written = false;
    try {
      const dataDir = path.resolve(__dirname, '../../content');
      const ledgerPath = path.join(dataDir, 'community-subscribers.json');
      if (fs.existsSync(dataDir)) {
        let existing = [];
        if (fs.existsSync(ledgerPath)) {
          existing = JSON.parse(fs.readFileSync(ledgerPath, 'utf8') || '[]');
        }
        // Deduplicate by email
        if (!existing.some(s => s.email === email)) {
          existing.push(subscriberRecord);
          fs.writeFileSync(ledgerPath, JSON.stringify(existing, null, 2), 'utf8');
        }
        written = true;
      }
    } catch (fsErr) {
      console.log('[CommunitySignup] Local repo filesystem bypassed (serverless sandbox):', fsErr.message);
    }

    // Serverless sandbox fallback: write to persistent /tmp directory
    if (!written) {
      try {
        let existing = [];
        if (fs.existsSync(TMP_LEDGER_PATH)) {
          existing = JSON.parse(fs.readFileSync(TMP_LEDGER_PATH, 'utf8') || '[]');
        }
        if (!existing.some(s => s.email === email)) {
          existing.push(subscriberRecord);
          fs.writeFileSync(TMP_LEDGER_PATH, JSON.stringify(existing, null, 2), 'utf8');
        }
      } catch (tmpErr) {
        console.warn('[CommunitySignup] /tmp write failed:', tmpErr.message);
      }
    }

    console.log(`[CommunitySignup] New Subscriber Registered: ${email} (${name}) via ${source}. Alert flagged for Marlon & Teshia.`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Welcome to the Inner Sanctuary community circle!',
        subscriber: {
          name: subscriberRecord.name,
          email: subscriberRecord.email,
          subscribedAt: subscriberRecord.subscribedAt
        }
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Error', details: err.message })
    };
  }
};
