async function getEventDetails(eventId) {
  try {
    const url = `https://www.meetup.com/socal-creatives-collective/events/${eventId}/`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    console.log(`\n=== EVENT ${eventId} ===`);
    console.log('Title:', titleMatch ? titleMatch[1] : 'No title');
    
    // Look for JSON-LD or meta tags
    const descMatch = html.match(/<meta property="og:description" content="(.*?)"/);
    if (descMatch) console.log('OG Desc:', descMatch[1]);
    
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (jsonLdMatch) {
      try {
        const data = JSON.parse(jsonLdMatch[1]);
        console.log('JSON-LD Event:', {
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          location: data.location?.name || data.location?.address,
          attendeeCount: data.offers?.validFrom || data.maximumAttendeeCapacity
        });
      } catch (e) {
        console.log('Snippet:', jsonLdMatch[1].substring(0, 300));
      }
    }
  } catch (err) {
    console.error(`Error ${eventId}:`, err.message);
  }
}

async function run() {
  await getEventDetails('317482553');
  await getEventDetails('317462800');
  await getEventDetails('316432286');
}

run();
