/* PawLink pet shop: client-side demo marketplace, cart and fictional delivery. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const read = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch (_) { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } };
  const KEYS = { listings: 'pawlink-market-listings', cart: 'pawlink-market-cart', orders: 'pawlink-market-orders', theme: 'pawlink-theme' };
  const money = value => `$${Number(value || 0).toFixed(2)}`;
  const uid = () => `pl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const safeImage = 'https://images.unsplash.com/photo-1589924691995-400dc9eccd9?auto=format&fit=crop&w=800&q=85';
  const baseProducts = [
    { id: 'paw-bowl', name: 'Sage ceramic pet bowl', category: 'Accessories', price: 18.5, description: 'A sturdy, easy-clean ceramic bowl with a nonslip base. The generous size works beautifully for food or water, and the soft sage glaze suits any home.', image: 'https://images.unsplash.com/photo-1589924691995-400dc9eccd9?auto=format&fit=crop&w=800&q=85', seller: 'PawLink Picks' },
    { id: 'tug-toy', name: 'Rainbow rope tug toy', category: 'Toys', price: 12.99, description: 'A colorful, durable cotton rope toy for supervised tug and fetch. Textured knots make it easy for paws to grab and fun to carry around.', image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=800&q=85', seller: 'PawLink Picks' },
    { id: 'treats', name: 'Salmon training bites', category: 'Food', price: 9.75, description: 'Small, soft salmon bites made for rewarding good behavior. Resealable packaging keeps every training session fresh. Always check ingredients for your pet.', image: 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=800&q=85', seller: 'PawLink Picks' },
    { id: 'walk-kit', name: 'Everyday walk set', category: 'Accessories', price: 28, description: 'A lightweight adjustable harness and matching lead for daily adventures. Designed with comfortable straps and easy-to-use clips.', image: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&w=800&q=85', seller: 'PawLink Picks' },
    { id: 'brush', name: 'Gentle grooming brush', category: 'Care', price: 15.25, description: 'A gentle everyday brush to help lift loose fur and keep coats looking their best. Comfortable handle gives you a steady grip during grooming.', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=85', seller: 'PawLink Picks' },
    { id: 'bed', name: 'Cloud-soft nap cushion', category: 'Accessories', price: 42, description: 'A cozy, plush resting cushion for afternoon snoozes. The removable cover is made for easy care and the cushioned center creates a soft spot to curl up.', image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=85', seller: 'PawLink Picks' },
    { id: 'cat-toy', name: 'Feather wand play set', category: 'Toys', price: 11.5, description: 'An interactive feather wand that encourages playful chasing and pouncing. Includes a comfortable handle for playtime together.', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=85', seller: 'PawLink Picks' },
    { id: 'paw-balm', name: 'Paw & nose balm', category: 'Care', price: 13.25, description: 'A simple balm for a little extra care for dry-looking paws and noses. Apply a small amount as directed and keep out of reach when not in use.', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=85', seller: 'PawLink Picks' }
  ];
  let listings = read(KEYS.listings, []);
  let cart = read(KEYS.cart, []);
  let orders = read(KEYS.orders, []);
  let selectedCategory = 'All';
  let search = '';

  // Keep the marketplace's theme key in step with the rest of the site.
  const setTheme = theme => {
    const value = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = value;
    document.documentElement.style.colorScheme = value;
    try { localStorage.setItem(KEYS.theme, value); } catch (_) {}
    const icon = $('.theme-icon'); if (icon) icon.textContent = value === 'dark' ? '☀️' : '🌙';
  };
  setTheme(read(KEYS.theme, 'light'));
  $('#theme-toggle')?.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  window.addEventListener('storage', event => { if (event.key === KEYS.theme) setTheme(event.newValue); });

  const allProducts = () => [...baseProducts, ...listings];
  const findProduct = id => allProducts().find(item => item.id === id);
  const saveListings = () => write(KEYS.listings, listings);
  const saveCart = () => write(KEYS.cart, cart);
  const imageURL = item => item.image || safeImage;

  function renderProducts() {
    const grid = $('#market-listings'); if (!grid) return;
    grid.replaceChildren();
    const filtered = allProducts().filter(item => (selectedCategory === 'All' || item.category === selectedCategory) && `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(search.toLowerCase()));
    filtered.forEach(item => {
      const own = listings.some(listing => listing.id === item.id);
      const card = document.createElement('article'); card.className = 'product-card';
      const imageWrap = document.createElement('div'); imageWrap.className = 'product-image-wrap'; imageWrap.tabIndex = 0; imageWrap.setAttribute('role', 'button'); imageWrap.setAttribute('aria-label', `View ${item.name} details`);
      const image = document.createElement('img'); image.className = 'product-image'; image.src = imageURL(item); image.alt = item.name; image.loading = 'lazy'; image.onerror = () => { image.src = safeImage; image.onerror = null; };
      imageWrap.append(image);
      if (own) { const badge = document.createElement('span'); badge.className = 'owner-badge'; badge.textContent = 'Your listing'; imageWrap.append(badge); }
      imageWrap.addEventListener('click', () => showProduct(item)); imageWrap.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showProduct(item); } });
      const body = document.createElement('div'); body.className = 'product-content';
      const category = document.createElement('span'); category.className = 'product-category'; category.textContent = item.category;
      const title = document.createElement('h3'); title.textContent = item.name;
      const desc = document.createElement('p'); desc.className = 'product-desc'; desc.textContent = item.description;
      const bottom = document.createElement('div'); bottom.className = 'product-bottom';
      const price = document.createElement('strong'); price.className = 'product-price'; price.textContent = money(item.price);
      const add = document.createElement('button'); add.type = 'button'; add.className = 'card-add'; add.textContent = own ? 'Your item' : '＋ Add'; add.disabled = own; add.setAttribute('aria-label', own ? 'Your own listing cannot be added to cart' : `Add ${item.name} to cart`); add.addEventListener('click', () => addToCart(item.id));
      bottom.append(price, add); body.append(category, title, desc, bottom);
      if (own) {
        const actions = document.createElement('div'); actions.className = 'card-owner-actions';
        const edit = document.createElement('button'); edit.className = 'small-button'; edit.type = 'button'; edit.textContent = 'Edit listing'; edit.addEventListener('click', () => openListing(item));
        const remove = document.createElement('button'); remove.className = 'small-button delete'; remove.type = 'button'; remove.textContent = 'Remove'; remove.addEventListener('click', () => deleteListing(item.id)); actions.append(edit, remove); body.append(actions);
      }
      card.append(imageWrap, body); grid.append(card);
    });
    $('#empty-products').hidden = filtered.length !== 0;
  }

  function showProduct(item) {
    const root = $('#product-detail'); root.replaceChildren();
    const image = document.createElement('img'); image.className = 'detail-image'; image.src = imageURL(item); image.alt = item.name; image.onerror = () => { image.src = safeImage; image.onerror = null; };
    const meta = document.createElement('div'); meta.className = 'detail-meta';
    const category = document.createElement('span'); category.className = 'product-category'; category.textContent = item.category;
    const price = document.createElement('strong'); price.className = 'detail-price'; price.textContent = money(item.price); meta.append(category, price);
    const title = document.createElement('h3'); title.id = 'detail-title'; title.textContent = item.name;
    const desc = document.createElement('p'); desc.className = 'detail-description'; desc.textContent = item.description;
    const seller = document.createElement('p'); seller.className = 'detail-seller'; seller.textContent = `Listed by ${item.seller || 'PawLink community'}`;
    root.append(image, meta, title, desc, seller);
    const own = listings.some(listing => listing.id === item.id);
    const actions = document.createElement('div'); actions.className = 'detail-actions';
    if (own) {
      const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'button button-secondary'; edit.textContent = 'Edit listing'; edit.addEventListener('click', () => { $('#product-modal').close(); openListing(item); }); actions.append(edit);
    } else {
      const add = document.createElement('button'); add.type = 'button'; add.className = 'button button-primary'; add.textContent = '＋ Add to cart'; add.addEventListener('click', () => { addToCart(item.id); $('#product-modal').close(); }); actions.append(add);
    }
    root.append(actions); $('#product-modal').showModal();
  }

  function addToCart(id) {
    if (listings.some(item => item.id === id)) return;
    const product = findProduct(id); if (!product) return;
    const line = cart.find(item => item.id === id);
    if (line) line.quantity += 1; else cart.push({ id, quantity: 1 });
    saveCart(); renderCart();
  }
  function renderCart() {
    cart = cart.filter(line => findProduct(line.id) && !listings.some(item => item.id === line.id));
    saveCart();
    const count = cart.reduce((sum, line) => sum + line.quantity, 0); $('#cart-count').textContent = String(count);
    const target = $('#cart-items'); target.replaceChildren();
    let total = 0;
    cart.forEach(line => {
      const item = findProduct(line.id); if (!item) return; total += Number(item.price) * line.quantity;
      const row = document.createElement('div'); row.className = 'cart-line';
      const image = document.createElement('img'); image.src = imageURL(item); image.alt = ''; image.onerror = () => { image.src = safeImage; image.onerror = null; };
      const desc = document.createElement('div'); const title = document.createElement('h3'); title.textContent = item.name; const info = document.createElement('p'); info.textContent = `${money(item.price)} × ${line.quantity}`; desc.append(title, info);
      const end = document.createElement('div'); end.className = 'cart-line-end'; const amount = document.createElement('strong'); amount.textContent = money(Number(item.price) * line.quantity); const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-cart'; remove.textContent = 'Remove'; remove.addEventListener('click', () => { cart = cart.filter(entry => entry.id !== line.id); renderCart(); }); end.append(amount, remove); row.append(image, desc, end); target.append(row);
    });
    $('#empty-cart').hidden = cart.length > 0; $('#cart-summary').hidden = cart.length === 0; $('#cart-subtotal').textContent = money(total);
    $('#checkout-total').textContent = `Order total: ${money(total)}`;
  }

  function openListing(item) {
    const form = $('#sale-form'); form.reset(); form.elements.listingId.value = item?.id || ''; $('#sale-status').textContent = '';
    if (item) { $('#listing-title').textContent = 'Edit your listing'; form.elements.name.value = item.name; form.elements.price.value = item.price; form.elements.category.value = item.category; form.elements.description.value = item.description; }
    else $('#listing-title').textContent = 'List an item';
    $('#listing-modal').showModal();
  }
  function deleteListing(id) {
    const item = listings.find(entry => entry.id === id); if (!item) return;
    if (!window.confirm(`Remove “${item.name}” from your listings? This cannot be undone.`)) return;
    listings = listings.filter(entry => entry.id !== id); cart = cart.filter(entry => entry.id !== id); saveListings(); saveCart(); renderProducts(); renderCart();
  }

  $('#sale-form').addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
    const values = new FormData(form); const file = values.get('image'); const id = String(values.get('listingId') || '');
    const save = image => {
      const old = listings.find(item => item.id === id);
      const item = { id: old?.id || uid(), name: String(values.get('name')).trim(), price: Number(values.get('price')), category: String(values.get('category')), description: String(values.get('description')).trim(), image: image || old?.image || '', seller: 'You' };
      if (old) listings = listings.map(listing => listing.id === id ? item : listing); else listings.unshift(item);
      if (!saveListings()) { $('#sale-status').textContent = 'Could not save this listing. Browser storage may be full; try a smaller image.'; return; }
      $('#listing-modal').close(); renderProducts();
    };
    if (file instanceof File && file.size) {
      if (!file.type.startsWith('image/') || file.size > 900000) { $('#sale-status').textContent = 'Choose an image under 900 KB.'; return; }
      const reader = new FileReader(); reader.onload = () => save(String(reader.result)); reader.onerror = () => { $('#sale-status').textContent = 'Unable to read that image. Please try another.'; }; reader.readAsDataURL(file);
    } else save('');
  });

  function renderOrders() {
    const target = $('#orders-list'); target.replaceChildren();
    if (!orders.length) { const empty = document.createElement('p'); empty.className = 'muted'; empty.textContent = 'Your completed purchases and delivery updates will appear here.'; target.append(empty); return; }
    orders.forEach(order => {
      const card = document.createElement('article'); card.className = 'order-card';
      const main = document.createElement('div'); const heading = document.createElement('h3'); heading.textContent = `Order ${order.code}`; const names = document.createElement('p'); names.textContent = order.items.map(item => `${item.name} × ${item.quantity}`).join(' · '); const detail = document.createElement('p'); detail.textContent = `${order.address} · ${money(order.total)}`;
      const track = document.createElement('div'); track.className = 'progress-track'; const fill = document.createElement('div'); fill.className = 'progress-fill'; fill.style.width = `${(order.stage + 1) * 33.333}%`; track.append(fill); main.append(heading, names, detail, track);
      const side = document.createElement('div'); const status = document.createElement('div'); status.className = 'order-status'; status.textContent = order.stages[order.stage]; const next = document.createElement('button'); next.type = 'button'; next.className = 'small-button'; next.textContent = order.stage < 2 ? 'Update delivery' : 'Delivered ✓'; next.disabled = order.stage >= 2; next.addEventListener('click', () => { order.stage = Math.min(2, order.stage + 1); write(KEYS.orders, orders); renderOrders(); }); side.append(status, next); card.append(main, side); target.append(card);
    });
  }

  $('#checkout-button').addEventListener('click', () => { if (!cart.length) return; $('#cart-modal').close(); $('#checkout-status').textContent = ''; $('#checkout-modal').showModal(); });
  $('#checkout-form').addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity() || !cart.length) return;
    // Demo only: never persist the submitted card/payment fields.
    const values = new FormData(form); const items = cart.map(line => { const item = findProduct(line.id); return { id: item.id, name: item.name, quantity: line.quantity, price: Number(item.price) }; });
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0); const order = { code: `PL-${String(Date.now()).slice(-6)}`, items, total, address: `${values.get('address')}, ${values.get('city')} ${values.get('postal')}`, recipient: values.get('recipient'), stage: 0, stages: ['Order confirmed', 'Packed with care', 'Out for delivery'], createdAt: new Date().toISOString() };
    orders.unshift(order); write(KEYS.orders, orders); cart = []; saveCart(); form.reset(); $('#checkout-modal').close(); renderCart(); renderOrders();
    $('#success-message').textContent = `Thanks, ${order.recipient}! Order ${order.code} is confirmed. Your fictional delivery will show updates below.`;
    $('#success-timeline').innerHTML = '<div class="timeline-row"><span class="timeline-dot">●</span><span>Order confirmed — we are getting it ready.</span></div><div class="timeline-row"><span>○</span><span>Packed with care — next stop.</span></div><div class="timeline-row"><span>○</span><span>Out for delivery — almost there!</span></div>';
    $('#success-modal').showModal();
  });

  $('#open-cart').addEventListener('click', () => { renderCart(); $('#cart-modal').showModal(); });
  $('#add-listing').addEventListener('click', () => openListing()); $('#hero-sell').addEventListener('click', () => openListing());
  $('#product-search').addEventListener('input', event => { search = event.target.value.trim(); renderProducts(); });
  $$('.category-chip').forEach(button => button.addEventListener('click', () => { $$('.category-chip').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); selectedCategory = button.dataset.category; renderProducts(); }));
  $$('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close)?.close()));
  $$('.modal').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }));
  renderProducts(); renderCart(); renderOrders();
})();
