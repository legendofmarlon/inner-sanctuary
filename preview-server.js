const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4'
};

// Live reload clients
const sseClients = new Set();

// Watch for file changes
let reloadTimeout;
fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  // Ignore git, server itself, or temp files
  if (filename.includes('.git') || filename === 'preview-server.js') return;

  clearTimeout(reloadTimeout);
  reloadTimeout = setTimeout(() => {
    console.log(`[LiveReload] Detected change in: ${filename}. Refreshing connected clients...`);
    for (const res of sseClients) {
      try {
        res.write('data: reload\n\n');
      } catch (e) {
        sseClients.delete(res);
      }
    }
  }, 150);
});

const LIVE_RELOAD_SCRIPT = `
<!-- Antigravity Live Preview Reload -->
<script>
(() => {
  const evtSource = new EventSource('/events');
  evtSource.onmessage = (e) => {
    if (e.data === 'reload') {
      console.log('[LiveReload] Refreshing...');
      window.location.reload();
    }
  };
  evtSource.onerror = () => {
    // Reconnect after brief pause
    setTimeout(() => {}, 2000);
  };
})();
</script>
`;

function serveFile(req, res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    if (ext === '.html') {
      fs.readFile(filePath, 'utf8', (readErr, content) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('500 Internal Server Error');
          return;
        }
        // Inject live reload script before </body>
        const injected = content.includes('</body>')
          ? content.replace('</body>', `${LIVE_RELOAD_SCRIPT}</body>`)
          : content + LIVE_RELOAD_SCRIPT;

        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        });
        res.end(injected);
      });
    } else {
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = (end - start) + 1;
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
        });
        fs.createReadStream(filePath, { start, end }).pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': stats.size,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        });
        fs.createReadStream(filePath).pipe(res);
      }
    }
  });
}

function startServer(port) {
  const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // SSE endpoint for live reload
    if (pathname === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      res.write('\n');
      sseClients.add(res);
      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    let safePath = path.normalize(path.join(ROOT_DIR, pathname));
    if (!safePath.startsWith(ROOT_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(safePath, (err, stats) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      if (stats.isDirectory()) {
        safePath = path.join(safePath, 'index.html');
      }

      serveFile(req, res, safePath);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`✨ Inner Sanctuary local preview server is LIVE!`);
    console.log(`🔗 Local URL: http://localhost:${port}`);
    console.log(`👀 Watching for edits in: ${ROOT_DIR}`);
  });
}

startServer(PORT);
