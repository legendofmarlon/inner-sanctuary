async function parseAllEvents() {
  const eventIds = ['317482553', '317462800', '316432286'];
  for (const id of eventIds) {
    try {
      const url = `https://www.meetup.com/socal-creatives-collective/events/${id}/`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const html = await res.text();
      const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (m) {
        const data = JSON.parse(m[1]);
        const event = data.props?.pageProps?.event;
        if (event) {
          console.log(`\n========================================`);
          console.log(`EVENT ID: ${id}`);
          console.log(`Title: ${event.title}`);
          console.log(`DateTime: ${event.dateTime}`);
          console.log(`EndTime: ${event.endTime}`);
          console.log(`Venue: ${event.venue?.name || 'Sanctuary Clubhouse'} - ${event.venue?.address || 'Orange County, CA'}`);
          console.log(`Going / RSVPs: ${event.going || event.rsvpCount || 'Active'}`);
          console.log(`Description Excerpt: ${event.description?.substring(0, 180)}...`);
        }
      }
    } catch (e) {
      console.log(`Error ${id}:`, e.message);
    }
  }
}

parseAllEvents();
