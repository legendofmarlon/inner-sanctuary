/**
 * Inner Sanctuary Wellness Foundation — Google Apps Script Webhook Receiver
 * Sheet ID: 1p3dK-gpGb3sIP6I-YHsiNGI54wxMar0C5LZiyn7Z1MY
 *
 * Setup (2 minutes):
 * 1. Open your Google Sheet -> Extensions -> Apps Script.
 * 2. Paste this file, save, and click Deploy -> New deployment -> Web app.
 * 3. Execute as: "Me", Who has access: "Anyone".
 * 4. Copy the Web App URL into Netlify env var: SANCTUARY_SHEETS_WEBHOOK_URL.
 */

const SHEET_ID = '1p3dK-gpGb3sIP6I-YHsiNGI54wxMar0C5LZiyn7Z1MY';

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const kind = payload.kind || 'hub_checkin';
    const r = payload.record || {};
    const ss = SpreadsheetApp.openById(SHEET_ID);

    if (kind === 'hub_checkin' || kind === 'pulse') {
      const sheet = ss.getSheetByName('CheckIn_Outcomes') || ss.insertSheet('CheckIn_Outcomes');
      const row = kind === 'pulse'
        ? [
            new Date(r.timestamp || Date.now()).toISOString(),
            'Home Pulse Constellation',
            r.state || 'peace',
            r.state || 'peace',
            'Anonymous pulse origin: ' + (r.origin || 'web'),
            'Netlify Pulse Endpoint'
          ]
        : [
            r.timestamp || new Date().toISOString(),
            r.portal || 'Community Hub Hearth Mirror',
            r.arrivalMood || 'Reflecting in Hub',
            r.postFeeling || 'Calmer & Grounded',
            r.takeawayNote || '',
            r.source || 'Anonymous Hub Check-In'
          ];
      sheet.appendRow(row);
    } else if (kind === 'subscriber') {
      const sheet = ss.getSheetByName('Subscribers') || ss.insertSheet('Subscribers');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Subscribed_At', 'Name', 'Email', 'Source', 'Somatic_State']);
      }
      sheet.appendRow([
        r.subscribedAt || new Date().toISOString(),
        r.name || 'Community Member',
        r.email || '',
        r.source || 'web',
        r.somaticState || ''
      ]);
    } else if (kind === 'openmic_rsvp') {
      const sheet = ss.getSheetByName('OpenMic_Performers') || ss.insertSheet('OpenMic_Performers');
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Registered_At', 'Event', 'Performer_Name', 'Category', 'Slot', 'Piece_Title', 'Email', 'Instagram', 'Tech_Needs']);
      }
      sheet.appendRow([
        r.registeredAt || new Date().toISOString(),
        r.eventTitle || 'Upcoming Open Mic',
        r.name || '',
        r.category || r.artType || '',
        r.slot || '',
        r.pieceTitle || '',
        r.email || '',
        r.instagram || '',
        r.techNeeds || ''
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, kind: kind }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
