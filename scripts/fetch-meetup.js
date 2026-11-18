async function getMeetupEvents() {
  try {
    const res = await fetch('https://www.meetup.com/socal-creatives-collective/events/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    console.log('Status:', res.status);
    const html = await res.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    console.log('Title:', titleMatch ? titleMatch[1] : 'No title');
    
    // Look for JSON-LD structured data
    const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    console.log('JSON-LD count:', jsonLdMatches.length);
    for (const match of jsonLdMatches) {
      if (match[1].includes('Event') || match[1].includes('startDate')) {
        console.log('--- FOUND EVENT JSON ---');
        console.log(match[1].substring(0, 800));
      }
    }

    // Look for event cards or event links
    const eventLinkMatches = [...html.matchAll(/\/socal-creatives-collective\/events\/([0-9]+)/g)];
    const eventIds = [...new Set(eventLinkMatches.map(m => m[1]))];
    console.log('Found event IDs:', eventIds);
  } catch (err) {
    console.error('Error fetching Meetup:', err);
  }
}

getMeetupEvents();
