/* =========================================================================
   INNER SANCTUARY CLUBHOUSE — LIVE SUPABASE GRATITUDE WALL, PHOTO STORAGE & PLINKO SYNC
   Uses Supabase Publishable Key + Scoped RLS Policies (zero private secrets in browser)
   ========================================================================= */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://xleadnehhbzjltykhtsn.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_QbXx1RuAukuz7M-fgCXH7w_fBOj25wm';
  const PHOTO_BUCKET = 'clubhouse-gratitude-photos';
  const PLINKO_BASE_SEEDS = 124;
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  let posts = [];
  let latestPlinkoTotal = PLINKO_BASE_SEEDS;
  let activeFilter = 'all';
  let selectedPhotoFile = null;
  let selectedPreviewUrl = '';
  let announcer = null;

  function getClientTag() {
    const KEY = 'sanctuary_clubhouse_visitor_tag';
    try {
      let existing = localStorage.getItem(KEY);
      if (!existing) {
        existing = 'nbr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
        localStorage.setItem(KEY, existing);
      }
      return existing;
    } catch (_) {
      return 'nbr_session_' + Math.random().toString(36).slice(2, 8);
    }
  }

  function getLocalWarmedSet() {
    try {
      return new Set(JSON.parse(localStorage.getItem('sanctuary_warmed_posts') || '[]').map(String));
    } catch (_) {
      return new Set();
    }
  }

  function saveLocalWarmedSet(set) {
    try {
      localStorage.setItem('sanctuary_warmed_posts', JSON.stringify([...set]));
    } catch (_) {}
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function formatRelativeTime(iso) {
    if (!iso) return 'In the Clubhouse';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'In the Clubhouse';
    const diffMin = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function categoryMeta(cat) {
    const map = {
      gratitude: { badge: '🌿 Gratitude', label: 'Gratitude' },
      shoutout: { badge: '🎤 Stage Shoutout', label: 'Stage Shoutout' },
      win: { badge: '🏆 Daily Win', label: 'Daily Win' },
      'jam-vibe': { badge: '🎶 Jam Vibe', label: 'Jam Vibe' }
    };
    return map[cat] || map.gratitude;
  }

  function supabaseHeaders(extra) {
    return Object.assign(
      {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json'
      },
      extra || {}
    );
  }

  function ensureAnnouncer() {
    if (announcer) return announcer;
    announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.className = 'visually-hidden';
    document.body.appendChild(announcer);
    return announcer;
  }

  function announcePolite(msg) {
    const el = ensureAnnouncer();
    el.textContent = '';
    setTimeout(() => {
      el.textContent = msg;
    }, 80);
  }

  function linkError(el, shown) {
    const errorId = el && el.dataset ? el.dataset.error : '';
    if (!errorId) return;
    const ids = (el.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && id !== errorId);
    if (shown) ids.push(errorId);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
    else el.removeAttribute('aria-describedby');
  }

  function syncFieldValidation(el, opts) {
    if (!el || !el.matches || !el.matches('input, select, textarea')) return true;
    const options = opts || {};
    const valid = el.checkValidity();
    el.classList.toggle('user-invalid-fallback', !valid && options.interacted);
    el.classList.toggle('user-valid-fallback', valid && options.interacted);
    const shouldFlag = !valid && (options.interacted || el.matches(':user-invalid'));
    el.setAttribute('aria-invalid', shouldFlag ? 'true' : 'false');
    linkError(el, shouldFlag);
    const errEl = el.dataset.error ? document.getElementById(el.dataset.error) : null;
    if (errEl) errEl.classList.toggle('is-shown', shouldFlag);
    if (shouldFlag && options.announce && errEl) {
      announcePolite(errEl.textContent.trim());
    }
    return valid;
  }

  async function compressPhotoForUpload(file) {
    if (!file || file.type === 'image/gif') return file;
    try {
      const bitmap = await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = (err) => {
          URL.revokeObjectURL(url);
          reject(err);
        };
        img.src = url;
      });

      const maxDim = 1400;
      const scale = Math.min(1, maxDim / Math.max(bitmap.width || 1, bitmap.height || 1));
      if (scale === 1 && file.size <= 900 * 1024) {
        return file;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      const targetMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, targetMime, 0.85));
      if (!blob || blob.size > file.size) return file;
      const ext = targetMime === 'image/png' ? 'png' : 'jpg';
      return new File([blob], `sanctuary-${Date.now()}.${ext}`, { type: targetMime });
    } catch (_) {
      return file;
    }
  }

  async function uploadPhotoToSupabaseStorage(rawFile) {
    const fileToSend = await compressPhotoForUpload(rawFile);
    if (fileToSend.size > MAX_IMAGE_BYTES) {
      throw new Error('Please choose a photo under 5 MB.');
    }

    const extMatch = (fileToSend.name || '').toLowerCase().match(/\.(jpe?g|png|webp|gif)$/);
    const extFromMime = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    }[fileToSend.type];
    const ext = (extMatch && extMatch[1]) || extFromMime || 'jpg';
    const safeRand = Math.random().toString(36).slice(2, 9);
    const objectPath = `wall/${Date.now()}-${safeRand}.${ext}`;

    const endpoint = `${SUPABASE_URL}/storage/v1/object/${PHOTO_BUCKET}/${objectPath}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': fileToSend.type || 'image/jpeg'
      },
      body: fileToSend
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Photo upload failed (${res.status}): ${errText || res.statusText}`);
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${objectPath}`;
    return { objectPath, publicUrl };
  }

  async function fetchGratitudePosts() {
    const badgeEl = document.getElementById('gratitudeLiveStatusLabel');
    try {
      const url = `${SUPABASE_URL}/rest/v1/clubhouse_gratitude_posts?select=*,clubhouse_gratitude_reactions(count)&order=created_at.desc&limit=36`;
      const res = await fetch(url, { headers: supabaseHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      posts = Array.isArray(rows) ? rows : [];
      if (badgeEl) {
        badgeEl.textContent = `Live Supabase Sync • ${posts.length} Shared Moment${posts.length === 1 ? '' : 's'}`;
      }
      renderGratitudeFeed();
      renderCommunityBadges();
      syncPostsToTicker(posts);
    } catch (err) {
      if (badgeEl) {
        badgeEl.textContent = 'Offline fallback preview — live posts sync when online';
      }
    }
  }

  function syncPostsToTicker(list) {
    if (!Array.isArray(list) || !list.length) return;
    const tickerEl = document.getElementById('hubLanternWhisperText');
    if (!tickerEl || tickerEl.dataset.userSeeded) return;
    const first = list[0];
    if (first && first.message) {
      const place = first.neighborhood ? ` • ${first.neighborhood}` : '';
      tickerEl.textContent = `"${first.message}" — ${first.author_name}${place}`;
      tickerEl.dataset.userSeeded = '1';
    }
  }

  function renderGratitudeFeed() {
    const feedEl = document.getElementById('gratitudeWallFeed');
    if (!feedEl) return;

    const warmedSet = getLocalWarmedSet();
    const filtered = posts.filter((p) => {
      if (activeFilter === 'photos') return Boolean(p.photo_url);
      if (activeFilter !== 'all') return p.category === activeFilter;
      return true;
    });

    if (!filtered.length) {
      feedEl.innerHTML =
        '<li class="gratitude-post-card" style="grid-column: 1 / -1; padding: 24px; text-align: center;">No Clubhouse notes in this filter yet — share the first intention or photo above!</li>';
      return;
    }

    feedEl.innerHTML = filtered
      .map((post) => {
        const meta = categoryMeta(post.category);
        const rxArr = Array.isArray(post.clubhouse_gratitude_reactions)
          ? post.clubhouse_gratitude_reactions
          : [];
        const rxCount = rxArr[0] && typeof rxArr[0].count === 'number' ? rxArr[0].count : 0;
        const totalWarmth = (Number(post.warmth_base) || 1) + rxCount;
        const isWarmed = warmedSet.has(String(post.id));
        const photoHtml = post.photo_url
          ? `<a href="${escapeHtml(post.photo_url)}" target="_blank" rel="noopener noreferrer" class="gratitude-post-media"><img src="${escapeHtml(post.photo_url)}" alt="Shared Sanctuary moment from ${escapeHtml(post.author_name)}" loading="lazy" /></a>`
          : '';
        const place = post.neighborhood ? ` • ${escapeHtml(post.neighborhood)}` : '';

        return `
          <li class="gratitude-post-card" data-post-id="${post.id}">
            ${photoHtml}
            <div class="gratitude-post-body">
              <span class="gratitude-post-tag">${meta.badge}</span>
              <p class="gratitude-post-quote">"${escapeHtml(post.message)}"</p>
              <div class="gratitude-post-footer">
                <span><strong>${escapeHtml(post.author_name)}</strong>${place} • ${formatRelativeTime(post.created_at)}</span>
                <button type="button" class="gratitude-warmth-btn ${isWarmed ? 'is-warmed' : ''}" data-warmth-post="${post.id}" aria-pressed="${isWarmed ? 'true' : 'false'}">
                  <span aria-hidden="true">🕯️</span>
                  <span>${totalWarmth}</span>
                </button>
              </div>
            </div>
          </li>
        `;
      })
      .join('');
  }

  async function handleWarmthClick(postId, btnEl) {
    const idStr = String(postId);
    const warmedSet = getLocalWarmedSet();
    if (warmedSet.has(idStr)) return;

    btnEl.disabled = true;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/clubhouse_gratitude_reactions`, {
        method: 'POST',
        keepalive: true,
        headers: supabaseHeaders({ Prefer: 'return=minimal' }),
        body: JSON.stringify({
          post_id: Number(postId),
          client_tag: getClientTag()
        })
      });

      if (res.ok || res.status === 409) {
        warmedSet.add(idStr);
        saveLocalWarmedSet(warmedSet);
        await fetchGratitudePosts();
      }
    } finally {
      btnEl.disabled = false;
    }
  }

  function renderCommunityBadges() {
    const gridEl = document.getElementById('clubhouseBadgesGrid');
    const summaryEl = document.getElementById('clubhouseBadgesUnlockedCount');
    if (!gridEl) return;

    const totalPosts = posts.length;
    const photoPosts = posts.filter((p) => Boolean(p.photo_url)).length;
    const totalWarmth = posts.reduce((sum, p) => {
      const rxArr = Array.isArray(p.clubhouse_gratitude_reactions) ? p.clubhouse_gratitude_reactions : [];
      const rxCount = rxArr[0] && typeof rxArr[0].count === 'number' ? rxArr[0].count : 0;
      return sum + (Number(p.warmth_base) || 1) + rxCount;
    }, 0);

    const badges = [
      { icon: '🪵', name: 'Hearth Kindler', cur: totalPosts, target: 1, unit: 'notes' },
      { icon: '📸', name: 'Memory Catcher', cur: photoPosts, target: 1, unit: 'photos' },
      { icon: '🕯️', name: 'Warmth Circle', cur: totalWarmth, target: 50, unit: 'candles' },
      { icon: '🌱', name: 'Seed Sower', cur: latestPlinkoTotal, target: 150, unit: 'seeds' },
      { icon: '🏆', name: 'Full House Jam', cur: totalPosts, target: 10, unit: 'voices' }
    ];

    const unlockedCount = badges.filter((b) => b.cur >= b.target).length;
    if (summaryEl) {
      summaryEl.textContent = `${unlockedCount} / ${badges.length} Lodge Badges Unlocked`;
    }

    gridEl.innerHTML = badges
      .map((b) => {
        const unlocked = b.cur >= b.target;
        const statusText = unlocked ? '✓ Unlocked!' : `${Math.min(b.cur, b.target)} / ${b.target} ${b.unit}`;
        return `
          <li class="clubhouse-badge-tile ${unlocked ? 'is-unlocked' : ''}">
            <span class="clubhouse-badge-icon" aria-hidden="true">${b.icon}</span>
            <span class="clubhouse-badge-name">${escapeHtml(b.name)}</span>
            <span class="clubhouse-badge-progress">${statusText}</span>
          </li>
        `;
      })
      .join('');
  }

  function showFormBanner(msg, isError) {
    const banner = document.getElementById('gratitudeFormStatus');
    if (!banner) return;
    banner.textContent = msg;
    banner.classList.toggle('is-visible', Boolean(msg));
    banner.classList.toggle('is-error', Boolean(isError));
    announcePolite(msg);
  }

  function clearSelectedPhoto() {
    selectedPhotoFile = null;
    if (selectedPreviewUrl) {
      URL.revokeObjectURL(selectedPreviewUrl);
      selectedPreviewUrl = '';
    }
    const fileInput = document.getElementById('gratitudePhotoInput');
    const previewWrap = document.getElementById('gratitudePhotoPreview');
    const previewImg = document.getElementById('gratitudePhotoPreviewImg');
    const metaText = document.getElementById('gratitudePhotoMeta');
    if (fileInput) {
      fileInput.value = '';
      fileInput.setCustomValidity('');
      syncFieldValidation(fileInput, { interacted: false });
    }
    if (previewWrap) previewWrap.classList.remove('has-image');
    if (previewImg) previewImg.removeAttribute('src');
    if (metaText) metaText.textContent = 'Optional: upload JPEG, PNG, WebP, or GIF up to 5 MB.';
  }

  async function syncPlinkoCounterFromSupabase() {
    const counterEl = document.getElementById('plinkoSeedCounter');
    if (!counterEl) return;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/clubhouse_plinko_drops?select=id`, {
        method: 'HEAD',
        headers: supabaseHeaders({ Prefer: 'count=exact' })
      });
      if (!res.ok) return;
      const contentRange = res.headers.get('content-range') || '';
      const totalMatch = contentRange.match(/\/(\d+)$/);
      if (totalMatch) {
        const dbDrops = parseInt(totalMatch[1], 10) || 0;
        const total = PLINKO_BASE_SEEDS + dbDrops;
        latestPlinkoTotal = total;
        counterEl.textContent = String(total);
        renderCommunityBadges();
        try {
          localStorage.setItem('sanctuary_plinko_seeds', String(total));
        } catch (_) {}
      }
    } catch (_) {}
  }

  async function recordPlinkoDropToSupabase(seedFocus) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/clubhouse_plinko_drops`, {
        method: 'POST',
        keepalive: true,
        headers: supabaseHeaders({ Prefer: 'return=minimal' }),
        body: JSON.stringify({
          seed_focus: String(seedFocus || 'Community Care & Calm').slice(0, 80),
          client_tag: getClientTag()
        })
      });
      if (res.ok) {
        await syncPlinkoCounterFromSupabase();
      }
    } catch (_) {}
  }

  function bindGratitudeWall() {
    const form = document.getElementById('clubhouseGratitudeForm');
    if (!form) return;

    const nameInput = document.getElementById('gratitudeAuthorInput');
    const cityInput = document.getElementById('gratitudeCityInput');
    const messageInput = document.getElementById('gratitudeMessageInput');
    const photoInput = document.getElementById('gratitudePhotoInput');
    const removePhotoBtn = document.getElementById('btnRemoveGratitudePhoto');
    const submitBtn = document.getElementById('btnSubmitGratitude');
    const feedEl = document.getElementById('gratitudeWallFeed');

    [nameInput, cityInput, messageInput].forEach((field) => {
      if (!field) return;
      field.setAttribute('aria-invalid', 'false');
      field.addEventListener('blur', () => {
        if (field.value.trim() || field.required) {
          syncFieldValidation(field, { interacted: true, announce: true });
        }
      });
      field.addEventListener('input', () => {
        field.setCustomValidity('');
        if (field.hasAttribute('aria-invalid')) {
          syncFieldValidation(field, { interacted: field.classList.contains('user-invalid-fallback') });
        }
      });
    });

    if (photoInput) {
      photoInput.setAttribute('aria-invalid', 'false');
      photoInput.addEventListener('change', () => {
        photoInput.setCustomValidity('');
        const file = photoInput.files && photoInput.files[0];
        if (!file) {
          clearSelectedPhoto();
          return;
        }
        if (!ALLOWED_MIME.includes(file.type)) {
          photoInput.setCustomValidity('Please upload a JPEG, PNG, WebP, or GIF image.');
          syncFieldValidation(photoInput, { interacted: true, announce: true });
          selectedPhotoFile = null;
          return;
        }
        if (file.size > MAX_IMAGE_BYTES * 3) {
          photoInput.setCustomValidity('That photo is too large. Choose an image under 15 MB.');
          syncFieldValidation(photoInput, { interacted: true, announce: true });
          selectedPhotoFile = null;
          return;
        }
        selectedPhotoFile = file;
        syncFieldValidation(photoInput, { interacted: true });
        if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
        selectedPreviewUrl = URL.createObjectURL(file);
        const previewImg = document.getElementById('gratitudePhotoPreviewImg');
        const previewWrap = document.getElementById('gratitudePhotoPreview');
        const metaText = document.getElementById('gratitudePhotoMeta');
        if (previewImg) previewImg.src = selectedPreviewUrl;
        if (previewWrap) previewWrap.classList.add('has-image');
        if (metaText) {
          const kb = Math.round(file.size / 1024);
          metaText.textContent = `Ready to share: ${file.name} (${kb} KB — auto-optimized on upload)`;
        }
      });
    }

    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', clearSelectedPhoto);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      showFormBanner('', false);

      let firstInvalid = null;
      [nameInput, messageInput, photoInput].forEach((field) => {
        if (!field) return;
        const ok = syncFieldValidation(field, { interacted: true, announce: false });
        if (!ok && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        const errBox = firstInvalid.dataset.error ? document.getElementById(firstInvalid.dataset.error) : null;
        if (errBox) announcePolite(errBox.textContent.trim());
        return;
      }

      const categoryEl = form.querySelector('input[name="gratitudeCategory"]:checked');
      const category = categoryEl ? categoryEl.value : 'gratitude';
      const authorName = (nameInput.value || '').trim().slice(0, 60) || 'Clubhouse Neighbor';
      const neighborhood = (cityInput && cityInput.value ? cityInput.value.trim() : 'Orange County').slice(0, 60);
      const message = (messageInput.value || '').trim().slice(0, 320);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = selectedPhotoFile ? '⏳ Uploading photo & posting...' : '⏳ Sharing to Wall...';
      }

      try {
        let photoUrl = null;
        let photoPath = null;
        if (selectedPhotoFile) {
          const uploaded = await uploadPhotoToSupabaseStorage(selectedPhotoFile);
          photoUrl = uploaded.publicUrl;
          photoPath = uploaded.objectPath;
        }

        const res = await fetch(`${SUPABASE_URL}/rest/v1/clubhouse_gratitude_posts`, {
          method: 'POST',
          headers: supabaseHeaders({ Prefer: 'return=representation' }),
          body: JSON.stringify({
            author_name: authorName,
            neighborhood: neighborhood || 'Orange County',
            category: category,
            message: message,
            photo_url: photoUrl,
            photo_path: photoPath,
            warmth_base: 1
          })
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => '');
          throw new Error(`Could not save post (${res.status}): ${detail || res.statusText}`);
        }

        form.reset();
        clearSelectedPhoto();
        [nameInput, cityInput, messageInput, photoInput].forEach((f) => {
          if (!f) return;
          f.classList.remove('user-invalid-fallback', 'user-valid-fallback');
          f.setAttribute('aria-invalid', 'false');
          linkError(f, false);
        });
        showFormBanner('✓ Shared live to the Sanctuary Gratitude Wall!', false);
        await fetchGratitudePosts();
      } catch (err) {
        showFormBanner(`⚠️ ${err.message || 'Could not reach Supabase right now.'}`, true);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '✨ Post to Shared Gratitude Wall';
        }
      }
    });

    document.querySelectorAll('.gratitude-filter-btn[data-gratitude-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-gratitude-filter') || 'all';
        document.querySelectorAll('.gratitude-filter-btn').forEach((b) => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        renderGratitudeFeed();
      });
    });

    if (feedEl) {
      feedEl.addEventListener('click', (e) => {
        const warmthBtn = e.target.closest('[data-warmth-post]');
        if (warmthBtn) {
          handleWarmthClick(warmthBtn.getAttribute('data-warmth-post'), warmthBtn);
        }
      });
    }
  }

  window.sanctuaryCommunitySync = {
    refresh: fetchGratitudePosts,
    syncPlinko: syncPlinkoCounterFromSupabase,
    recordPlinkoDrop: recordPlinkoDropToSupabase
  };

  document.addEventListener('DOMContentLoaded', () => {
    bindGratitudeWall();
    fetchGratitudePosts();
    syncPlinkoCounterFromSupabase();

    // Auto-sync live community Gratitude Wall & Plinko counts every 20s and when tab returns to focus
    setInterval(() => {
      if (!document.hidden) {
        fetchGratitudePosts();
        syncPlinkoCounterFromSupabase();
      }
    }, 20000);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        fetchGratitudePosts();
        syncPlinkoCounterFromSupabase();
      }
    });

    window.addEventListener('sanctuary:plinko-sprout', (e) => {
      const focus = e && e.detail && e.detail.focus ? e.detail.focus : 'Sanctuary Community Care';
      recordPlinkoDropToSupabase(focus);
    });
  });
})();
