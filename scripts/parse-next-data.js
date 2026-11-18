async function parseNextData() {
  const url = 'https://www.meetup.com/socal-creatives-collective/events/317482553/';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const html = await res.text();
  console.log('HTML size:', html.length);
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (nextDataMatch) {
    try {
      const data = JSON.parse(nextDataMatch[1]);
      console.log('Found NEXT_DATA!');
      const event = data.props?.pageProps?.event;
      if (event) {
        console.log('Event Name:', event.title);
        console.log('Event DateTime:', event.dateTime);
        console.log('Event Venue:', event.venue?.name, event.venue?.address);
        console.log('Event RSVPs:', event.going);
      } else {
        // Search in data
        const str = JSON.stringify(data);
        console.log('Contains dateTime?', str.includes('dateTime'));
        // Find titles
        const titles = str.match(/"title":"(.*?)"/g);
        console.log('Titles:', titles?.slice(0, 5));
      }
    } catch (e) {
      console.log('Parse error:', e.message);
    }
  } else {
    console.log('No NEXT_DATA. Looking for title/meta:');
    const metas = [...html.matchAll(/<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]+)"/g)];
    metas.forEach(m => {
      if (m[1].includes('title') || m[1].includes('description') || m[1].includes('image')) {
        console.log(`${m[1]}: ${m[2]}`);
      }
    });
  }
}

parseNextData();
