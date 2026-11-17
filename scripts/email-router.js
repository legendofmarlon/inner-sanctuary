/**
 * Inner Sanctuary Email Dispatch & Routing Configuration
 * Calibrated per President Marlon Smith's instructions.
 * 
 * Routing Policy:
 * 1. hello@innersanctuarywellnessfoundation.org:
 *    - Filtered STRICTLY for Daily Scout & Grant Findings (Awesome Foundation, CAC, CRA Banks, Venues).
 *    - Protected from automated system noise, sentinel sweeps, or code logs.
 * 
 * 2. innersanctuary0@gmail.com & legendofmarlon@gmail.com:
 *    - Receives ALL updates: Grants, Scouts, Sentinel Sweeps, Board Dossiers, and Community RSVPs.
 */

const EMAIL_ROUTING = {
  // Grants, CRA Sponsorships & Venue Scouts (Clean, high-priority opportunities only)
  scoutAndGrantRecipients: [
    'legendofmarlon@gmail.com',
    'innersanctuary0@gmail.com',
    'hello@innersanctuarywellnessfoundation.org'
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
