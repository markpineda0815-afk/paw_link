/* Shared PawLink browser interactions: persistent theme, profile, reports and auth demo. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (_) { return fallback; } };
  const setTheme = theme => {
    const value = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = value;
    document.documentElement.style.colorScheme = value;
    const toggle = $('#theme-toggle');
    if (toggle) toggle.checked = value === 'dark';
    try { localStorage.setItem('pawlink-theme', value); } catch (_) {}
  };
  setTheme(readJSON('pawlink-theme', 'light'));
  $('#theme-toggle')?.addEventListener('change', event => setTheme(event.currentTarget.checked ? 'dark' : 'light'));
  window.addEventListener('storage', event => { if (event.key === 'pawlink-theme') setTheme(event.newValue); });

  // Normalize existing sidebar anchors too (several older pages had text-only links).
  const links = [
    ['dashboard.html','fa-house','Home'], ['search.html','fa-magnifying-glass','Search pets'],
    ['adopt.html','fa-heart','Adopt a pet'], ['reports.html','fa-clipboard-list','Pet reports'],
    ['market.html','fa-basket-shopping','Pet shop'], ['profile.html','fa-user','My profile'],
    ['settings.html','fa-gear','Settings']
  ];
  const sideNav = $('.sidebar .side-nav');
  const sideBottom = $('.sidebar .sidebar-bottom');
  const normalizeLink = (container, [href, icon, label]) => {
    if (!container) return;
    let link = container.querySelector(`a[href="${href}"]`);
    if (!link) {
      link = document.createElement('a'); link.href = href; link.className = 'nav-link';
      const glyph = document.createElement('i'); glyph.className = `fa-solid ${icon}`; glyph.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span'); text.textContent = label; link.append(glyph, text); container.append(link); return;
    }
    link.classList.add('nav-link');
    let glyph = link.querySelector('i');
    if (!glyph) { glyph = document.createElement('i'); link.prepend(glyph); }
    glyph.className = `fa-solid ${icon}`; glyph.setAttribute('aria-hidden', 'true');
    let text = link.querySelector('span');
    if (!text) {
      text = document.createElement('span');
      [...link.childNodes].filter(node => node !== glyph && node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
      link.append(text);
    }
    text.textContent = label;
  };
  links.slice(0, 5).forEach(item => normalizeLink(sideNav, item));
  links.slice(5).forEach(item => normalizeLink(sideBottom, item));
  const dashboardHeader = $('.dashboard-main .topbar');
  if (dashboardHeader) {
    let actions = $('.topbar-actions', dashboardHeader);
    if (!actions) { actions = document.createElement('div'); actions.className = 'topbar-actions'; dashboardHeader.append(actions); }
    [['profile.html','fa-user','My profile'],['settings.html','fa-gear','Settings']].forEach(([href, icon, label]) => {
      let link = actions.querySelector(`a[href="${href}"]`);
      if (!link) { link = document.createElement('a'); link.href = href; actions.append(link); }
      link.classList.add('avatar','header-shortcut'); link.setAttribute('aria-label',label); link.title = label;
      let glyph = link.querySelector('i'); if (!glyph) { glyph = document.createElement('i'); link.replaceChildren(glyph); }
      glyph.className = `fa-solid ${icon}`; glyph.setAttribute('aria-hidden','true');
    });
  }

  const profileKey = 'pawlink-user';
  const profile = readJSON(profileKey, {});
  const profileForm = $('#profile-edit-form');
  if (profileForm) {
    ['name','email','phone','age','city','interest'].forEach(key => {
      const field = profileForm.elements.namedItem(key);
      if (field && profile[key]) field.value = profile[key];
      const view = $(`[data-profile="${key}"]`);
      if (view) view.textContent = profile[key] || (key === 'interest' ? 'Not selected' : 'Not provided');
    });
    const show = editing => { $('#profile-preview')?.toggleAttribute('hidden', editing); $('#profile-edit')?.toggleAttribute('hidden', !editing); };
    $('#profile-edit-button')?.addEventListener('click', () => show(true));
    $('#profile-cancel-button')?.addEventListener('click', () => { profileForm.reset(); Object.keys(profile).forEach(key => { const field = profileForm.elements.namedItem(key); if (field) field.value = profile[key]; }); show(false); });
    profileForm.addEventListener('submit', event => {
      event.preventDefault(); if (!profileForm.reportValidity()) return;
      localStorage.setItem(profileKey, JSON.stringify({ ...readJSON(profileKey, {}), ...Object.fromEntries(new FormData(profileForm).entries()) })); location.reload();
    });
  }
  const registerForm = $('#register-form');
  registerForm?.addEventListener('submit', event => { event.preventDefault(); if (!registerForm.reportValidity()) return; localStorage.setItem(profileKey, JSON.stringify(Object.fromEntries(new FormData(registerForm).entries()))); location.href = 'onboarding.html'; });
  const loginForm = $('#login-form');
  loginForm?.addEventListener('submit', event => {
    event.preventDefault(); if (!loginForm.reportValidity()) return;
    const email = String(new FormData(loginForm).get('email') || '').trim().toLowerCase(); const saved = readJSON(profileKey, {});
    if (saved.email && saved.email.toLowerCase() === email) location.href = 'dashboard.html';
    else { const message = $('#login-message'); if (message) message.textContent = 'No matching demo profile was found. Please register first using this browser.'; }
  });

  const reportForm = $('#report-form'); const forum = $('#forum-posts');
  const renderReport = data => {
    if (!forum) return;
    const post = document.createElement('article'); post.className = 'forum-post new-forum-post';
    if (data.image) { const image = document.createElement('img'); image.className = 'report-photo'; image.src = data.image; image.alt = `Photo for ${data.pet}`; post.append(image); }
    const body = document.createElement('div'); body.className = 'post-body'; const meta = document.createElement('div'); meta.className = 'post-meta';
    const tag = document.createElement('span'); tag.className = `post-label ${data.type === 'Found pet' ? 'found-label' : 'lost-label'}`; tag.textContent = data.type;
    const location = document.createElement('span'); location.textContent = `${data.area} · Just now`; meta.append(tag, location);
    const heading = document.createElement('h3'); heading.textContent = data.pet; const details = document.createElement('p'); details.textContent = data.details;
    const contact = document.createElement('p'); contact.className = 'report-contact'; contact.textContent = `Contact: ${data.contact}`;
    body.append(meta, heading, details, contact); post.append(body); forum.insertBefore(post, forum.querySelector('.forum-post'));
  };
  if (forum) { try { const report = sessionStorage.getItem('pawlink-pending-report'); if (report) { renderReport(JSON.parse(report)); sessionStorage.removeItem('pawlink-pending-report'); } } catch (_) { sessionStorage.removeItem('pawlink-pending-report'); } }
  reportForm?.addEventListener('submit', event => {
    event.preventDefault(); if (!reportForm.reportValidity()) return;
    const values = new FormData(reportForm); const file = values.get('image');
    const submit = image => { const report = { type: values.get('type'), pet: values.get('pet'), area: values.get('area'), contact: values.get('contact'), details: values.get('details'), image }; try { sessionStorage.setItem('pawlink-pending-report', JSON.stringify(report)); location.href = 'reports.html#forum-posts'; } catch (_) { const status = $('#report-status'); if (status) status.textContent = 'Image is too large for this temporary browser demo. Choose a smaller image and try again.'; } };
    if (file instanceof File && file.size) {
      if (!file.type.startsWith('image/') || file.size > 1200000) { const status = $('#report-status'); if (status) status.textContent = 'Please choose an image smaller than 1.2 MB.'; return; }
      const reader = new FileReader(); reader.onload = () => submit(String(reader.result)); reader.onerror = () => submit(''); reader.readAsDataURL(file);
    } else submit('');
  });
})();
