// Inner Sanctuary Companion & Grant Clipper
document.addEventListener('DOMContentLoaded', () => {
  // Tab Switching
  const tabs = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Toast Helper
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  function showToast(text) {
    if (!toast) return;
    toastMsg.textContent = text;
    toast.style.display = 'flex';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2400);
  }

  // Copy Buttons in Auto-Fill Drawer
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.dataset.copy;
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('Copied to clipboard!');
          const orig = btn.textContent;
          btn.textContent = '✓ Copied';
          setTimeout(() => { btn.textContent = orig; }, 1800);
        });
      }
    });
  });

  // Auto-Detect Current Page Information for Tab 1
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const activeTab = tabs[0];
        const titleInput = document.getElementById('clip-title');
        const urlInput = document.getElementById('clip-url');
        
        if (titleInput && activeTab.title) {
          titleInput.value = activeTab.title.replace(/\s*[-|•].*$/, '').trim();
        }
        if (urlInput && activeTab.url) {
          urlInput.value = activeTab.url;
        }

        // Try extracting page text for dollar amounts
        if (chrome.scripting && chrome.scripting.executeScript && activeTab.id && !activeTab.url.startsWith('chrome://')) {
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: () => {
              const text = document.body ? document.body.innerText : '';
              // Match dollar amounts like $25,000 or $1,000
              const moneyMatch = text.match(/\$\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\s*–\s*\$\s*(\d{1,3}(?:,\d{3})+|\d+))?/);
              // Match deadline keywords
              const deadlineMatch = text.match(/(?:deadline|due date|due by|closes on)[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
              return {
                money: moneyMatch ? moneyMatch[0] : '',
                deadline: deadlineMatch ? deadlineMatch[1] : ''
              };
            }
          }).then((results) => {
            if (results && results[0] && results[0].result) {
              const res = results[0].result;
              const amountInput = document.getElementById('clip-amount');
              const deadlineInput = document.getElementById('clip-deadline');
              if (amountInput && res.money && !amountInput.value) {
                amountInput.value = res.money;
              }
              if (deadlineInput && res.deadline && !deadlineInput.value) {
                deadlineInput.value = res.deadline;
              }
            }
          }).catch(() => {
            // Scripting restricted on certain pages; fail silently
          });
        }
      }
    });
  }

  // Save / Copy Clipped Grant Summary
  const btnSaveClip = document.getElementById('btn-save-clip');
  if (btnSaveClip) {
    btnSaveClip.addEventListener('click', () => {
      const title = document.getElementById('clip-title').value.trim() || 'Untitled Opportunity';
      const amount = document.getElementById('clip-amount').value.trim() || 'N/A';
      const deadline = document.getElementById('clip-deadline').value.trim() || 'Rolling / Unspecified';
      const url = document.getElementById('clip-url').value.trim() || 'N/A';
      const notes = document.getElementById('clip-notes').value.trim() || 'Discovered via Inner Sanctuary Companion';

      const formatted = `### 🎯 Grant Lead: ${title}
- **Target Amount:** ${amount}
- **Application Deadline:** ${deadline}
- **Source Link:** ${url}
- **Alignment Notes:** ${notes}
- **501(c)(3) Applicant:** Inner Sanctuary Wellness Foundation (EIN: 39-3757168)`;

      navigator.clipboard.writeText(formatted).then(() => {
        showToast('Grant summary copied to clipboard!');
        btnSaveClip.textContent = '✓ Summary Copied!';
        setTimeout(() => {
          btnSaveClip.innerHTML = '<span>💾 Copy Grant Summary for Bigin / Drive</span>';
        }, 2200);
      });
    });
  }
});
