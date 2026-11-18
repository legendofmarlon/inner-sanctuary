const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\danie\\OneDrive\\Documents\\GitHub\\inner-sanctuary';
const indexFile = path.join(rootDir, 'index.html');
const scriptFile = path.join(rootDir, 'script.js');

let html = fs.readFileSync(indexFile, 'utf8');
let js = fs.readFileSync(scriptFile, 'utf8');

// =========================================================================
// 1. UPDATE SCRIPT.JS COUNTDOWN TARGET TO SUNDAY, NOV 22, 2026 AT 2:00 PM PST
// =========================================================================
js = js.replace(
  "let targetTime = new Date('2026-11-15T14:00:00-08:00').getTime();",
  "let targetTime = new Date('2026-11-22T14:00:00-08:00').getTime();"
);

// Add calendar download function in script.js
const calendarHelpers = `
  // ------------------------------------------------------------------------
  // CALENDAR (.ICS) GENERATOR & DOWNLOAD HELPER
  // ------------------------------------------------------------------------
  window.downloadEventIcs = function(eventId) {
    const events = {
      'friendsgiving': {
        title: '🍂 Friendsgiving: Good Food, Good Humans & Good Vibes',
        description: 'A RECONNECT × Inner Sanctuary Wellness Foundation Gathering. Good food. Good humans. Alcohol-free creative sanctuary. Details: https://www.meetup.com/socal-creatives-collective/events/317482553/',
        location: 'Our Sanctuary Clubhouse, Orange County, CA',
        start: '20261122T140000',
        end: '20261122T180000'
      },
      'jam-session': {
        title: '🎶 Jam Session: The Unplugged Playground',
        description: 'An Intimate Jam Session with SoCal Creatives Collective & Inner Sanctuary. 10 Humans. A Few Instruments. Endless Possibilities. Details: https://www.meetup.com/socal-creatives-collective/events/317462800/',
        location: '1501 W Alton Ave, Santa Ana, CA 92704',
        start: '20261210T180000',
        end: '20261210T200000'
      }
    };

    const ev = events[eventId];
    if (!ev) return;

    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Inner Sanctuary Wellness Foundation//Calendar Event//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '@innersanctuarywellnessfoundation.org',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      'DTSTART;TZID=America/Los_Angeles:' + ev.start,
      'DTEND;TZID=America/Los_Angeles:' + ev.end,
      'SUMMARY:' + ev.title,
      'DESCRIPTION:' + ev.description,
      'LOCATION:' + ev.location,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\\r\\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', eventId + '-inner-sanctuary.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
`;

if (!js.includes('downloadEventIcs')) {
  js += '\n' + calendarHelpers;
}

fs.writeFileSync(scriptFile, js, 'utf8');
console.log('script.js updated with Nov 22 countdown and downloadEventIcs!');

// =========================================================================
// 2. UPDATE INDEX.HTML COUNTDOWN BANNER & MULTI-EVENT SHOWCASE
// =========================================================================
// Update the date banner above the countdown
html = html.replace(
  '<div class="date-highlight">SUNDAY, NOVEMBER 15, 2026</div>\n            <div class="time-highlight">2:00 PM – 4:00 PM PST</div>',
  '<div class="date-highlight">SUNDAY, NOVEMBER 22, 2026</div>\n            <div class="time-highlight">2:00 PM – 6:00 PM PST</div>'
);

html = html.replace(
  'Next Gathering: <strong>Sunday, November 15, 2026 at 2:00 PM PST</strong> • Our Sanctuary Clubhouse • 100% Free Community Admission',
  'Next Gathering: <strong>Sunday, November 22, 2026 at 2:00 PM PST</strong> • 🍂 Friendsgiving with RECONNECT • 100% Free Community Admission'
);

// Update event title to Friendsgiving
html = html.replace(
  '<h3 style="font-family: \'Cinzel\', serif; font-size: clamp(1.8rem, 3.2vw, 2.4rem); color: #FFFFFF; letter-spacing: 0.08em; margin-bottom: 8px;">\n          Open Mic &amp; Creative Connection Gathering\n        </h3>\n        <p style="color: #CBD7D0; font-size: 0.95rem; margin-bottom: 0;">\n          Hosted by <strong>SoCal Creatives Collective</strong> &amp; <strong>Inner Sanctuary Wellness Foundation</strong>\n        </p>',
  `<h3 style="font-family: 'Cinzel', serif; font-size: clamp(1.8rem, 3.2vw, 2.4rem); color: #FFFFFF; letter-spacing: 0.08em; margin-bottom: 8px;">
          🍂 Friendsgiving: Good Food, Good Humans &amp; Good Vibes
        </h3>
        <p style="color: #F8D98C; font-size: 0.98rem; font-weight: 600; margin-bottom: 0;">
          Co-presented by <strong>RECONNECT</strong> &amp; <strong>Inner Sanctuary Wellness Foundation</strong>
        </p>`
);

// Add the 2-Event Multi-Gathering Showcase right above the photo wheel
const multiEventShowcase = `
      <!-- ==================== UPCOMING GATHERINGS & MEETUP CALENDAR ==================== -->
      <div class="upcoming-calendar-showcase" style="margin: 40px 0 32px;">
        <div style="text-align: center; max-width: 720px; margin: 0 auto 28px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(197, 154, 63, 0.16); border: 1px solid rgba(197, 154, 63, 0.45); border-radius: 999px; padding: 5px 16px; font-size: 0.76rem; font-weight: 700; color: #F5D77F; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">
            <span>📅</span> Verified Meetup Gathering Schedule
          </div>
          <h3 class="serif-brand" style="font-size: clamp(1.6rem, 2.8vw, 2.2rem); color: var(--forest-green); margin-bottom: 8px;">
            Upcoming Gatherings &amp; Circles
          </h3>
          <p style="color: var(--charcoal-muted); font-size: 0.98rem; line-height: 1.6; margin: 0 auto;">
            Explore our upcoming in-person experiences across Orange County. Each event is substance-free, trauma-informed, and 100% free community admission.
          </p>
        </div>

        <div class="calendar-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
          
          <!-- Event 1: Friendsgiving -->
          <div class="calendar-event-card" style="background: rgba(30, 49, 39, 0.96); border: 1.5px solid rgba(197, 154, 63, 0.45); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.25);">
            <div style="position: relative; height: 210px; overflow: hidden;">
              <img src="images/openmic/openmic-nov15-reconnect-sisterhood.jpg" alt="RECONNECT community leaders gathered at Our Sanctuary Clubhouse" style="width: 100%; height: 100%; object-fit: cover;">
              <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(17,29,22,0.85) 100%);"></div>
              <span style="position: absolute; top: 14px; left: 14px; background: #C59A3F; color: #111D16; font-size: 0.72rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.08em; text-transform: uppercase;">✦ NEXT GATHERING</span>
              <span style="position: absolute; bottom: 12px; left: 14px; color: #F8D98C; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.05em;">📍 Our Sanctuary Clubhouse • Orange County</span>
            </div>
            <div style="padding: 22px; display: flex; flex-direction: column; flex-grow: 1;">
              <div style="font-size: 0.78rem; font-weight: 700; color: #86EFAC; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                Sunday, November 22, 2026 • 2:00 PM – 6:00 PM PST
              </div>
              <h4 style="font-family: 'Cinzel', serif; font-size: 1.25rem; color: #FFFFFF; font-weight: 700; margin-bottom: 8px; line-height: 1.35;">
                🍂 Friendsgiving: Good Food, Good Humans &amp; Good Vibes
              </h4>
              <p style="color: #CBD7D0; font-size: 0.88rem; line-height: 1.6; margin-bottom: 18px; flex-grow: 1;">
                A collaborative gathering with <strong>RECONNECT</strong> and Inner Sanctuary. Good food, genuine connection, and unhurried conversation. No masks required.
              </p>
              
              <!-- CTA Button Row -->
              <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: auto;">
                <a href="https://www.meetup.com/socal-creatives-collective/events/317482553/" target="_blank" rel="noopener noreferrer" class="btn btn-gold" style="flex: 1; text-align: center; font-size: 0.82rem; padding: 10px 14px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                  <span>RSVP on Meetup</span> <span>↗</span>
                </a>
                <div style="display: flex; gap: 6px;">
                  <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=%F0%9F%8D%82+Friendsgiving%3A+Good+Food%2C+Good+Humans+%26+Good+Vibes&dates=20261122T220000Z/20261123T020000Z&details=A+RECONNECT+%C3%97+Inner+Sanctuary+Wellness+Foundation+Gathering.+RSVP%3A+https%3A%2F%2Fwww.meetup.com%2Fsocal-creatives-collective%2Fevents%2F317482553%2F&location=Our+Sanctuary+Clubhouse%2C+Orange+County%2C+CA" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size: 0.78rem; padding: 10px 12px; border-color: rgba(197, 154, 63, 0.45); color: #F5D77F;" title="Add to Google Calendar">
                    📅 Google
                  </a>
                  <button type="button" onclick="downloadEventIcs('friendsgiving')" class="btn btn-outline" style="font-size: 0.78rem; padding: 10px 12px; border-color: rgba(197, 154, 63, 0.45); color: #F5D77F; cursor: pointer;" title="Download Apple/Outlook iCal">
                    🍏 Apple
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Event 2: Jam Session -->
          <div class="calendar-event-card" style="background: rgba(30, 49, 39, 0.96); border: 1.5px solid rgba(197, 154, 63, 0.45); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.25);">
            <div style="position: relative; height: 210px; overflow: hidden;">
              <img src="images/openmic/openmic-nov15-djembe-poolside-rhythm.jpg" alt="Acoustic djembe drumming and live open mic rhythm at sunset" style="width: 100%; height: 100%; object-fit: cover;">
              <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(17,29,22,0.85) 100%);"></div>
              <span style="position: absolute; top: 14px; left: 14px; background: rgba(197, 154, 63, 0.25); border: 1px solid #C59A3F; color: #F5D77F; font-size: 0.72rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.08em; text-transform: uppercase;">✦ DECEMBER JAM</span>
              <span style="position: absolute; bottom: 12px; left: 14px; color: #F8D98C; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.05em;">📍 1501 W Alton Ave • Santa Ana, CA</span>
            </div>
            <div style="padding: 22px; display: flex; flex-direction: column; flex-grow: 1;">
              <div style="font-size: 0.78rem; font-weight: 700; color: #86EFAC; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
                Thursday, December 10, 2026 • 6:00 PM – 8:00 PM PST
              </div>
              <h4 style="font-family: 'Cinzel', serif; font-size: 1.25rem; color: #FFFFFF; font-weight: 700; margin-bottom: 8px; line-height: 1.35;">
                🎶 Jam Session: The Unplugged Playground
              </h4>
              <p style="color: #CBD7D0; font-size: 0.88rem; line-height: 1.6; margin-bottom: 18px; flex-grow: 1;">
                10 Humans. A Few Instruments. Endless Possibilities. An intimate unplugged session hosted by SoCal Creatives Collective. Bring an acoustic instrument or just your ears.
              </p>
              
              <!-- CTA Button Row -->
              <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: auto;">
                <a href="https://www.meetup.com/socal-creatives-collective/events/317462800/" target="_blank" rel="noopener noreferrer" class="btn btn-gold" style="flex: 1; text-align: center; font-size: 0.82rem; padding: 10px 14px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                  <span>RSVP on Meetup</span> <span>↗</span>
                </a>
                <div style="display: flex; gap: 6px;">
                  <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=%F0%9F%8E%B6+Jam+Session%3A+The+Unplugged+Playground&dates=20261211T020000Z/20261211T040000Z&details=An+Intimate+Jam+Session+with+SoCal+Creatives+Collective.+RSVP%3A+https%3A%2F%2Fwww.meetup.com%2Fsocal-creatives-collective%2Fevents%2F317462800%2F&location=1501+W+Alton+Ave%2C+Santa+Ana%2C+CA+92704" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size: 0.78rem; padding: 10px 12px; border-color: rgba(197, 154, 63, 0.45); color: #F5D77F;" title="Add to Google Calendar">
                    📅 Google
                  </a>
                  <button type="button" onclick="downloadEventIcs('jam-session')" class="btn btn-outline" style="font-size: 0.78rem; padding: 10px 12px; border-color: rgba(197, 154, 63, 0.45); color: #F5D77F; cursor: pointer;" title="Download Apple/Outlook iCal">
                    🍏 Apple
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
`;

// Insert multiEventShowcase right above <!-- Space-Saving Compact Community Photo Wheel
const photoWheelTarget = '<!-- Space-Saving Compact Community Photo Wheel';
if (html.includes(photoWheelTarget)) {
  html = html.replace(photoWheelTarget, multiEventShowcase + '\n      ' + photoWheelTarget);
  console.log('Inserted multi-event showcase before Photo Wheel!');
} else {
  console.log('Warning: could not find photo wheel target.');
}

// Update the meetup-action-btn href in index.html to Friendsgiving
html = html.replace(
  'https://www.meetup.com/socal-creatives-collective/events/316432286/?_xtd=gqFyqTExNjA3NjU1MqFwo2FwaQ%253D%253D&from=ref',
  'https://www.meetup.com/socal-creatives-collective/events/317482553/'
);

// Cache-bust assets to v5.7
html = html.replace(/styles\.css\?v=[0-9.]+/g, 'styles.css?v=5.7');
html = html.replace(/script\.js\?v=[0-9.]+/g, 'script.js?v=5.7');

fs.writeFileSync(indexFile, html, 'utf8');
console.log('index.html updated successfully with events, images, and calendars!');
