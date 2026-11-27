/**
 * Inner Sanctuary Email Dispatch & Routing Configuration
 * Calibrated per President Marlon Smith's instructions.
 * 
 * Routing Policy:
 * 1. hello@innersanctuarywellnessfoundation.org:
 *    - PAUSED FOR NOW per user request so the main org inbox is not overwhelmed.
 * 
 * 2. innersanctuary0@gmail.com & legendofmarlon@gmail.com:
 *    - Receives ALL updates: Grants, Scouts, Sentinel Sweeps, Board Dossiers, and Community RSVPs.
 */

const EMAIL_ROUTING = {
  // Grants, CRA Sponsorships & Venue Scouts (Gmail leadership inboxes only for now)
  scoutAndGrantRecipients: [
    'legendofmarlon@gmail.com',
    'innersanctuary0@gmail.com'
  ],

  // System, Sentinel, Technical, and General Operational logs
  operationsAndSentinelRecipients: [
    'legendofmarlon@gmail.com',
    'innersanctuary0@gmail.com'
  ]
};

function getRecipientsForType(type = 'scout') {
  if (type === 'scout' || type === 'grant') {
    return EMAIL_ROUTING.scoutAndGrantRecipients;
  }
  return EMAIL_ROUTING.operationsAndSentinelRecipients;
}

module.exports = {
  EMAIL_ROUTING,
  getRecipientsForType
};
