const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\danie\\OneDrive\\Documents\\GitHub\\inner-sanctuary';
const indexFile = path.join(rootDir, 'index.html');
const scriptFile = path.join(rootDir, 'script.js');

let html = fs.readFileSync(indexFile, 'utf8');
let js = fs.readFileSync(scriptFile, 'utf8');

// 1. Add Spotify button into soundscape-controls-wrap
const controlsTarget = `<div class="volume-control-pill" title="Adjust Soundscape Volume">`;
const spotifyBtn = `<!-- Spotify Vibe Button -->
          <button id="spotify-toggle-btn" class="spotify-pill-btn" type="button" onclick="toggleSpotifyPlayer()" title="Listen to Sanctuary 432Hz Healing Soundscape on Spotify" style="display: inline-flex; align-items: center; gap: 6px; background: rgba(30, 215, 96, 0.16); border: 1px solid rgba(30, 215, 96, 0.45); color: #86EFAC; padding: 5px 12px; border-radius: 999px; font-size: 0.74rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            <span>Spotify Vibe</span>
          </button>

          <div class="volume-control-pill" title="Adjust Soundscape Volume">`;

if (html.includes(controlsTarget) && !html.includes('spotify-toggle-btn')) {
  html = html.replace(controlsTarget, spotifyBtn);
  console.log('Added Spotify toggle button to soundscape controls!');
}

// 2. Add Spotify Player Tray right after </aside>
const asideTarget = `</aside>`;
const spotifyTray = `</aside>

  <!-- Collapsible Sanctuary Spotify Player Tray -->
  <div id="sanctuarySpotifyTray" class="spotify-player-tray" style="display: none; background: rgba(14, 24, 18, 0.98); border-bottom: 1.5px solid rgba(30, 215, 96, 0.4); padding: 12px 20px; transition: all 0.3s ease;">
    <div class="container" style="display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.3rem;">🎧</span>
        <div>
          <div style="font-size: 0.84rem; font-weight: 700; color: #FFFDF7;">Sanctuary 432Hz Restorative Soundscape &amp; Acoustic Soul</div>
          <div style="font-size: 0.72rem; color: #86EFAC;">Curated meditative and soulful acoustic frequencies for deep somatic pause</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 12px; width: 100%; max-width: 480px;">
        <iframe style="border-radius:12px; width: 100%; height: 80px;" src="https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
        <button type="button" onclick="toggleSpotifyPlayer()" style="background: none; border: none; color: #CBD7D0; font-size: 1.4rem; cursor: pointer; padding: 4px 8px; line-height: 1;" title="Close Spotify Player">&times;</button>
      </div>
    </div>
  </div>`;

if (html.includes(asideTarget) && !html.includes('sanctuarySpotifyTray')) {
  html = html.replace(asideTarget, spotifyTray);
  console.log('Added Spotify player tray under aside!');
}

// Bump asset query strings to v6.2
html = html.replace(/styles\.css\?v=[0-9.]+/g, 'styles.css?v=6.2');
html = html.replace(/script\.js\?v=[0-9.]+/g, 'script.js?v=6.2');

fs.writeFileSync(indexFile, html, 'utf8');

// 3. Update script.js with toggleSpotifyPlayer
const toggleFunction = `
  // ------------------------------------------------------------------------
  // SANCTUARY SPOTIFY PLAYER TRAY CONTROLLER
  // ------------------------------------------------------------------------
  window.toggleSpotifyPlayer = function() {
    const tray = document.getElementById('sanctuarySpotifyTray');
    if (!tray) return;
    const isHidden = tray.style.display === 'none' || !tray.style.display;
    tray.style.display = isHidden ? 'block' : 'none';
  };
`;

if (!js.includes('toggleSpotifyPlayer')) {
  js += '\n' + toggleFunction;
  fs.writeFileSync(scriptFile, js, 'utf8');
  console.log('script.js updated with toggleSpotifyPlayer!');
}

console.log('Spotify integration complete!');
