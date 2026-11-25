/**
 * Netlify Serverless Function: community-signup
 * Direct ingest for Sanctuary Community & Newsletter Subscribers.
 * Persists via Netlify Blobs / Google Sheets webhook / /tmp fallback and
 * dispatches Resend notification when RESEND_API_KEY is configured.
 */

const fs = require('fs');
const path = require('path');
const { corsHeaders, appendLedgerRecord, sendResendNotification } = require('./_persistence');

const TMP_FILE = 'sanctuary-subscribers.json';
const BLOB_KEY = 'subscribers';

exports.handler = async function (event) {
  const headers = corsHeaders('POST, OPTIONS');

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const name = (data.name || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const source = (data.source || 'welcome-popup').trim();
    const state = (data.state || '').trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Please provide a valid email address.' })
      };
    }

    const subscriberRecord = {
      id: `sub_${Date.now()}`,
      name: name || 'Community Member',
      email,
      source,
      somaticState: state || null,
      subscribedAt: new Date().toISOString()
    };

    try {
      const dataDir = path.resolve(__dirname, '../../content');
      const ledgerPath = path.join(dataDir, 'community-subscribers.json');
      if (fs.existsSync(dataDir)) {
        const existing = fs.existsSync(ledgerPath)
          ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8') || '[]')
          : [];
        if (!existing.some((s) => s.email === email)) {
          existing.push(subscriberRecord);
          fs.writeFileSync(ledgerPath, JSON.stringify(existing, null, 2), 'utf8');
        }
      }
    } catch (_) {}

    const persistResult = await appendLedgerRecord(
      'subscriber',
      BLOB_KEY,
      TMP_FILE,
      subscriberRecord,
      { maxItems: 2000 }
    );

    const emailResult = await sendResendNotification({
      to: ['legendofmarlon@gmail.com', 'innersanctuary0@gmail.com'],
      subject: `New Sanctuary Circle Member: ${subscriberRecord.name}`,
      text: `Name: ${subscriberRecord.name}\nEmail: ${subscriberRecord.email}\nSource: ${subscriberRecord.source}\nSubscribed At: ${subscriberRecord.subscribedAt}`
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({
        success: true,
        message: 'Welcome to the Inner Sanctuary community circle!',
        storageMode: persistResult.storageMode,
        webhookForwarded: persistResult.webhookForwarded,
        emailNotified: emailResult.sent,
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
      headers,
      body: JSON.stringify({ error: 'Internal Error', details: err.message })
    };
  }
};
