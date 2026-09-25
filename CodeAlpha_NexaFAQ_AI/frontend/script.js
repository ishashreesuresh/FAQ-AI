/**
 * NexaFAQ AI - Intelligent FAQ Assistant
 * CodeAlpha Artificial Intelligence Internship - Task 2
 * Client-Side Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const chatContainer = document.getElementById('chatContainer');
  const chatScrollArea = document.getElementById('chatScrollArea');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const historyList = document.getElementById('historyList');
  const categoryList = document.getElementById('categoryList');
  const activeCategoryBadge = document.getElementById('activeCategoryBadge');
  const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
  const sidebar = document.getElementById('sidebar');

  // Application State
  let currentCategory = 'All';
  let isProcessing = false;
  let chatHistory = JSON.parse(localStorage.getItem('nexafaq_history') || '[]');
  let theme = localStorage.getItem('nexafaq_theme') || 'light';

  // Apply Theme
  applyTheme(theme);

  function applyTheme(newTheme) {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('nexafaq_theme', newTheme);
    theme = newTheme;
  }

  themeToggleBtn.addEventListener('click', () => {
    applyTheme(theme === 'light' ? 'dark' : 'light');
  });

  // Mobile sidebar toggle
  if (toggleSidebarBtn && sidebar) {
    toggleSidebarBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Auto-resize textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 140) + 'px';
  });

  // Keydown handler: Enter to send, Shift+Enter for new line
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });

  // Category Filtering
  categoryList.addEventListener('click', (e) => {
    const pill = e.target.closest('.cat-pill');
    if (!pill) return;

    categoryList.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
    pill.classList.add('active');

    currentCategory = pill.dataset.category;
    activeCategoryBadge.innerHTML = `Filtering: <strong>${currentCategory}</strong>`;
  });

  // Suggested questions delegation
  document.addEventListener('click', (e) => {
    const suggestBtn = e.target.closest('.suggest-btn');
    if (suggestBtn && !isProcessing) {
      const query = suggestBtn.dataset.query || suggestBtn.textContent.trim();
      submitQuery(query);
    }
  });

  // Form submission
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isProcessing) return;

    const query = chatInput.value.trim();
    if (!query) return;

    submitQuery(query);
  });

  // Clear chat
  clearChatBtn.addEventListener('click', () => {
    const messages = chatContainer.querySelectorAll('.message:not(.welcome-message)');
    messages.forEach(msg => msg.remove());
    chatInput.value = '';
    chatInput.focus();
  });

  // History Management
  function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = '';

    if (chatHistory.length === 0) {
      historyList.innerHTML = '<div class="empty-state">No recent queries yet</div>';
      return;
    }

    chatHistory.slice(0, 15).forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'history-item';
      btn.textContent = item;
      btn.title = item;
      btn.addEventListener('click', () => {
        if (!isProcessing) {
          chatInput.value = item;
          submitQuery(item);
          if (window.innerWidth < 768 && sidebar) {
            sidebar.classList.remove('open');
          }
        }
      });
      historyList.appendChild(btn);
    });
  }

  function addToHistory(query) {
    chatHistory = [query, ...chatHistory.filter(q => q.toLowerCase() !== query.toLowerCase())].slice(0, 20);
    localStorage.setItem('nexafaq_history', JSON.stringify(chatHistory));
    renderHistory();
  }

  clearHistoryBtn.addEventListener('click', () => {
    chatHistory = [];
    localStorage.removeItem('nexafaq_history');
    renderHistory();
  });

  renderHistory();

  // Scroll to bottom
  function scrollToBottom() {
    chatScrollArea.scrollTop = chatScrollArea.scrollHeight;
  }

  // Append User Bubble
  function appendUserMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message user-message';
    wrapper.innerHTML = `
      <div class="message-avatar">You</div>
      <div class="message-content">
        <div class="user-bubble">${escapeHtml(text)}</div>
      </div>
    `;
    chatContainer.appendChild(wrapper);
    scrollToBottom();
  }

  // Append Typing Indicator
  function showTypingIndicator() {
    const typing = document.createElement('div');
    typing.id = 'typingIndicator';
    typing.className = 'message ai-message';
    typing.innerHTML = `
      <div class="message-avatar">N</div>
      <div class="message-content">
        <div class="ai-bubble">
          <div class="typing-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    `;
    chatContainer.appendChild(typing);
    scrollToBottom();
    return typing;
  }

  function removeTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  }

  // Append AI Response Bubble
  function appendAIMessage(data, originalQuery) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message ai-message';

    const isMatch = data.is_match;
    const confidencePct = data.confidence_percentage ?? Math.round((data.confidence || 0) * 100);
    const category = data.category || 'General';
    const matchedQ = data.matched_question || '';
    const answer = data.answer || "I couldn't find a reliable answer for that question.";

    let scoreClass = 'score-low';
    if (confidencePct >= 80) scoreClass = 'score-high';
    else if (confidencePct >= 50) scoreClass = 'score-med';

    let whyHtml = '';
    if (isMatch && matchedQ) {
      whyHtml = `
        <details class="why-details">
          <summary class="why-summary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Why this answer?
          </summary>
          <div class="why-body">
            <div class="metric-row">
              <span class="metric-label">Matched FAQ:</span>
              <span class="metric-val">${escapeHtml(matchedQ)}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Category:</span>
              <span class="metric-val">${escapeHtml(category)}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Similarity Score:</span>
              <span class="metric-val ${scoreClass}">${confidencePct}%</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Processed Query:</span>
              <span class="metric-val">${escapeHtml(data.query_preprocessed || originalQuery)}</span>
            </div>
          </div>
        </details>
      `;
    }

    let suggestionsHtml = '';
    if (!isMatch && data.sample_questions && data.sample_questions.length > 0) {
      suggestionsHtml = `
        <div class="prompt-suggestions-wrapper" style="margin-top: 0.5rem;">
          <div class="suggestions-label">Try asking one of these:</div>
          <div class="suggestions-grid">
            ${data.sample_questions.map(q => `<button class="suggest-btn" data-query="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join('')}
          </div>
        </div>
      `;
    }

    let metaHtml = '';
    if (isMatch) {
      metaHtml = `
        <div class="metadata-bar">
          <span class="meta-category">${escapeHtml(category)}</span>
          <span class="meta-divider" aria-hidden="true">·</span>
          <span class="meta-match">${escapeHtml(matchedQ)}</span>
          <span class="meta-divider" aria-hidden="true">·</span>
          <span class="meta-score ${scoreClass}">${confidencePct}% match</span>
        </div>
      `;
    }

    const uniqueId = 'ans_' + Date.now();

    wrapper.innerHTML = `
      <div class="message-avatar">N</div>
      <div class="message-content">
        <div class="ai-bubble">
          <div class="message-text" id="${uniqueId}">${escapeHtml(answer)}</div>
          ${metaHtml}
          ${whyHtml}
          ${suggestionsHtml}
          <div class="bubble-actions">
            <button class="action-pill-btn copy-btn" data-target="${uniqueId}" title="Copy answer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy</span>
            </button>
            <button class="action-pill-btn retry-btn" data-query="${escapeHtml(originalQuery)}" title="Retry question">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    `;

    chatContainer.appendChild(wrapper);
    scrollToBottom();

    // Attach copy handler
    wrapper.querySelector('.copy-btn').addEventListener('click', function() {
      const textToCopy = document.getElementById(uniqueId).textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        this.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Copied!</span>
        `;
        setTimeout(() => {
          this.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy</span>
          `;
        }, 2000);
      });
    });

    // Attach retry handler
    wrapper.querySelector('.retry-btn').addEventListener('click', function() {
      submitQuery(originalQuery);
    });
  }

  // Main Submit Query Flow
  async function submitQuery(query) {
    if (!query || isProcessing) return;

    // Reset input
    chatInput.value = '';
    chatInput.style.height = 'auto';

    // Append to UI
    appendUserMessage(query);
    addToHistory(query);

    isProcessing = true;
    sendBtn.disabled = true;
    showTypingIndicator();

    try {
      // Call backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          category: currentCategory
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const result = await response.json();
      removeTypingIndicator();
      appendAIMessage(result, query);

    } catch (err) {
      console.warn('Backend API request failed:', err.message);
      removeTypingIndicator();
      
      appendAIMessage({
        is_match: false,
        confidence: 0,
        confidence_percentage: 0,
        confidence_level: 'low',
        answer: "I couldn't connect to the backend server. Please verify the Python Flask server is running on http://localhost:5000.",
        sample_questions: [
          "How can I reset my password?",
          "Where can I see my payment details?",
          "How do I cancel my subscription?"
        ]
      }, query);
    } finally {
      isProcessing = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
