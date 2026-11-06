/* PawLink pet shop browser demo. Keep the saved theme as plain text; other
   marketplace values are JSON. This prevents shop navigation resetting dark mode. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const readJSON = (key, fallback) => {
    try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch (_) { return fallback; }
  };
  const writeJSON = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } };
  const KEY = { listings: 'pawlink-market-listings', cart: 'pawlink-market-cart', orders: 'pawlink-market-orders', theme: 'pawlink-theme' };
  const money = value => `$${Number(value || 0).toFixed(2)}`;
  const makeId = () => `pl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const products = [
    {id:'paw-bowl',name:'Sage ceramic pet bowl',category:'Accessories',price:18.50,description:'A sturdy, easy-clean ceramic bowl with a nonslip base. The generous size works for food or water, and the soft sage glaze suits any home.',seller:'PawLink Picks'},
    {id:'tug-toy',name:'Rainbow rope tug toy',category:'Toys',price:12.99,description:'A colorful cotton rope toy for supervised tug and fetch. Textured knots make it easy for paws to grab and fun to carry around.',seller:'PawLink Picks'},
    {id:'treats',name:'Salmon training bites',category:'Food',price:9.75,description:'Small, soft salmon bites for rewarding good behavior. Resealable packaging keeps each training session fresh.',seller:'PawLink Picks'},
    {id:'walk-kit',name:'Everyday walk set',category:'Accessories',price:28,description:'A lightweight adjustable harness and matching lead for daily adventures, with comfortable straps and easy-to-use clips.',seller:'PawLink Picks'},
    {id:'brush',name:'Gentle grooming brush',category:'Care',price:15.25,description:'An everyday brush to help lift loose fur and keep coats looking their best. The comfortable handle gives you a steady grip.',seller:'PawLink Picks'},
    {id:'bed',name:'Cloud-soft nap cushion',category:'Accessories',price:42,description:'A cozy, plush resting cushion for afternoon snoozes. Its removable cover is made for easy care.',seller:'PawLink Picks'},
    {id:'cat-toy',name:'Feather wand play set',category:'Toys',price:11.50,description:'An interactive feather wand that encourages playful chasing and pouncing. Made for playtime together.',seller:'PawLink Picks'},
    {id:'paw-balm',name:'Paw & nose balm',category:'Care',price:13.25,description:'A little extra care for dry-looking paws and noses. Use as directed and keep out of reach when not in use.',seller:'PawLink Picks'}
  ];
  let listings = readJSON(KEY.listings, []); if (!Array.isArray(listings)) listings = [];
  let cart = readJSON(KEY.cart, []); if (!Array.isArray(cart)) cart = [];
  let orders = readJSON(KEY.orders, []); if (!Array.isArray(orders)) orders = [];
  let categoryFilter = 'All'; let query = '';

  function applyTheme(value) {
    const theme = value === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const toggle = $('#theme-toggle'); if (toggle) toggle.checked = theme === 'dark';
  }
  // pawlink-theme is stored as the literal string "dark" or "light", NOT JSON.
  let savedTheme = 'light';
  try { savedTheme = localStorage.getItem(KEY.theme) === 'dark' ? 'dark' : 'light'; } catch (_) {}
  applyTheme(savedTheme);
  $('#theme-toggle')?.addEventListener('change', event => {
    const theme = event.currentTarget.checked ? 'dark' : 'light'; applyTheme(theme);
    try { localStorage.setItem(KEY.theme, theme); } catch (_) {}
  });
  window.addEventListener('storage', event => { if (event.key === KEY.theme) applyTheme(event.newValue); });

  const allProducts = () => [...products, ...listings];
  const getProduct = id => allProducts().find(item => item.id === id);
  const ownProduct = item => listings.some(entry => entry.id === item.id);
  const saveListings = () => writeJSON(KEY.listings, listings);
  const saveCart = () => writeJSON(KEY.cart, cart);
  function illustration(item) {
    const cat = String(item.category || '').toLowerCase();
    const isFood = cat === 'food' || /food|treat|kibble/i.test(item.name);
    const isToy = cat === 'toys' || /toy|rope|feather|play/i.test(item.name);
    const isCare = cat === 'care' || /brush|balm|groom/i.test(item.name);
    const bg = isFood ? '#f5ead3' : isToy ? '#e5efff' : isCare ? '#e4f2e9' : '#f7e9e3';
    const art = isFood
      ? '<path d="M94 61h92l10 112H84L94 61Z" fill="#d99a52"/><path d="M94 61h92l-9-24h-74l-9 24Z" fill="#bc743b"/><rect x="104" y="91" width="72" height="43" rx="8" fill="#fff2d6"/><circle cx="140" cy="112" r="11" fill="#bd7a44"/>'
      : isToy
      ? '<path d="M96 105c-24-30-43-13-29 5l27 34c8 11 22 13 32 4l29-27c9-9 8-24-2-31-9-6-21-3-29 5l-10 10-18-20Z" fill="none" stroke="#ec795b" stroke-width="15" stroke-linecap="round"/><circle cx="183" cy="144" r="25" fill="#76a5ea"/><path d="M164 144h38M183 125v38" stroke="#fff" stroke-width="5"/>'
      : isCare
      ? '<rect x="116" y="67" width="49" height="104" rx="12" fill="#77a98c"/><rect x="128" y="48" width="25" height="22" rx="4" fill="#47785e"/><path d="M128 103h25" stroke="#e9f5ed" stroke-width="7"/><path d="M83 146h31M85 136v20M95 136v20M105 136v20" stroke="#d49a5e" stroke-width="7"/>'
      : /bed|cushion/i.test(item.name)
      ? '<rect x="69" y="86" width="142" height="73" rx="30" fill="#8aa8d8"/><rect x="82" y="99" width="116" height="47" rx="22" fill="#dce7f8"/>'
      : /walk|harness|lead/i.test(item.name)
      ? '<path d="M92 80c18-21 77-21 96 0l17 48c4 13-7 27-21 27h-12l-15-30h-34l-15 30h-12c-14 0-25-14-21-27l17-48Z" fill="none" stroke="#ed795a" stroke-width="13"/>'
      : '<path d="M80 105h120l-14 56H94l-14-56Z" fill="#79a98a"/><path d="M70 101h140" stroke="#47785e" stroke-width="12" stroke-linecap="round"/>';
    const label = String(item.name || 'Pet product').replace(/[<>&]/g, '');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="220" viewBox="0 0 280 220"><rect width="280" height="220" rx="18" fill="${bg}"/><circle cx="224" cy="47" r="24" fill="#fff" opacity=".55"/>${art}<text x="140" y="199" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#4c5260">${label}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
  const productImage = item => ownProduct(item) && item.image ? item.image : illustration(item);
  function attachFallback(img, item) { img.onerror = () => { img.onerror = null; img.src = illustration(item); }; }

  function renderProducts() {
    const grid = $('#market-listings'); if (!grid) return;
    grid.replaceChildren();
    const visible = allProducts().filter(item => (categoryFilter === 'All' || item.category === categoryFilter) && `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query));
    visible.forEach(item => {
      const own = ownProduct(item); const card = document.createElement('article'); card.className = 'product-card';
      const imageWrap = document.createElement('div'); imageWrap.className = 'product-image-wrap'; imageWrap.tabIndex = 0; imageWrap.setAttribute('role','button'); imageWrap.setAttribute('aria-label',`View ${item.name} details`);
      const img = document.createElement('img'); img.className = 'product-image'; img.src = productImage(item); img.alt = item.name; img.loading = 'lazy'; attachFallback(img,item); imageWrap.append(img);
      if (own) { const badge = document.createElement('span'); badge.className = 'owner-badge'; badge.textContent = 'Your listing'; imageWrap.append(badge); }
      imageWrap.addEventListener('click', () => showProduct(item)); imageWrap.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showProduct(item); } });
      const body = document.createElement('div'); body.className = 'product-content';
      const tag = document.createElement('span'); tag.className = 'product-category'; tag.textContent = item.category;
      const title = document.createElement('h3'); title.textContent = item.name;
      const desc = document.createElement('p'); desc.className = 'product-desc'; desc.textContent = item.description;
      const bottom = document.createElement('div'); bottom.className = 'product-bottom'; const price = document.createElement('strong'); price.className = 'product-price'; price.textContent = money(item.price);
      const add = document.createElement('button'); add.type = 'button'; add.className = 'card-add'; add.textContent = own ? 'Your item' : '＋ Add'; add.disabled = own; add.addEventListener('click', () => addToCart(item.id)); bottom.append(price,add); body.append(tag,title,desc,bottom);
      if (own) { const actions = document.createElement('div'); actions.className = 'card-owner-actions'; const edit = document.createElement('button'); edit.type='button'; edit.className='small-button'; edit.textContent='Edit listing'; edit.addEventListener('click',()=>openListing(item)); const remove=document.createElement('button'); remove.type='button'; remove.className='small-button delete'; remove.textContent='Remove'; remove.addEventListener('click',()=>deleteListing(item.id)); actions.append(edit,remove); body.append(actions); }
      card.append(imageWrap,body); grid.append(card);
    });
    const empty = $('#empty-products'); if (empty) empty.hidden = visible.length > 0;
  }
  function showProduct(item) {
    const root = $('#product-detail'); if (!root) return; root.replaceChildren();
    const img = document.createElement('img'); img.className='detail-image'; img.src=productImage(item); img.alt=item.name; attachFallback(img,item);
    const meta=document.createElement('div'); meta.className='detail-meta'; const tag=document.createElement('span'); tag.className='product-category'; tag.textContent=item.category; const price=document.createElement('strong'); price.className='detail-price'; price.textContent=money(item.price); meta.append(tag,price);
    const title=document.createElement('h3'); title.textContent=item.name; const desc=document.createElement('p'); desc.className='detail-description'; desc.textContent=item.description; const seller=document.createElement('p'); seller.className='detail-seller'; seller.textContent=`Listed by ${item.seller || 'PawLink community'}`; root.append(img,meta,title,desc,seller);
    const actions=document.createElement('div'); actions.className='detail-actions'; const button=document.createElement('button'); button.type='button'; button.className=`button ${ownProduct(item)?'button-outline':'button-primary'}`;
    if (ownProduct(item)) { button.textContent='Edit listing'; button.addEventListener('click',()=>{$('#product-modal').close();openListing(item);}); }
    else { button.textContent='＋ Add to cart'; button.addEventListener('click',()=>{addToCart(item.id);$('#product-modal').close();}); }
    actions.append(button); root.append(actions); $('#product-modal')?.showModal();
  }
  function addToCart(id) { if (listings.some(item=>item.id===id)) return; const item=getProduct(id); if(!item)return; const line=cart.find(entry=>entry.id===id); if(line)line.quantity+=1;else cart.push({id,quantity:1});saveCart();renderCart(); }
  function renderCart() {
    cart=cart.filter(line=>getProduct(line.id)&&!listings.some(item=>item.id===line.id));saveCart();
    const count=$('#cart-count');if(count)count.textContent=String(cart.reduce((sum,line)=>sum+line.quantity,0));
    const target=$('#cart-items');if(!target)return;target.replaceChildren();let total=0;
    cart.forEach(line=>{const item=getProduct(line.id);if(!item)return;total+=Number(item.price)*line.quantity;const row=document.createElement('div');row.className='cart-line';const img=document.createElement('img');img.src=productImage(item);img.alt='';attachFallback(img,item);const desc=document.createElement('div');const title=document.createElement('h3');title.textContent=item.name;const info=document.createElement('p');info.textContent=`${money(item.price)} × ${line.quantity}`;desc.append(title,info);const end=document.createElement('div');end.className='cart-line-end';const amount=document.createElement('strong');amount.textContent=money(Number(item.price)*line.quantity);const remove=document.createElement('button');remove.type='button';remove.className='remove-cart';remove.textContent='Remove';remove.addEventListener('click',()=>{cart=cart.filter(entry=>entry.id!==line.id);renderCart();});end.append(amount,remove);row.append(img,desc,end);target.append(row);});
    const empty=$('#empty-cart'),summary=$('#cart-summary'),subtotal=$('#cart-subtotal'),checkoutTotal=$('#checkout-total');if(empty)empty.hidden=cart.length>0;if(summary)summary.hidden=cart.length===0;if(subtotal)subtotal.textContent=money(total);if(checkoutTotal)checkoutTotal.textContent=`Order total: ${money(total)}`;
  }
  function openListing(item) { const form=$('#sale-form');if(!form)return;form.reset();form.elements.listingId.value=item?.id||'';$('#sale-status').textContent='';$('#listing-title').textContent=item?'Edit your listing':'List an item';if(item){form.elements.name.value=item.name;form.elements.price.value=item.price;form.elements.category.value=item.category;form.elements.description.value=item.description;}$('#listing-modal').showModal(); }
  function deleteListing(id) { const item=listings.find(entry=>entry.id===id);if(!item||!confirm(`Remove “${item.name}” from your listings? This cannot be undone.`))return;listings=listings.filter(entry=>entry.id!==id);cart=cart.filter(entry=>entry.id!==id);saveListings();saveCart();renderProducts();renderCart(); }
  $('#sale-form')?.addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;const values=new FormData(form);const file=values.get('image');const id=String(values.get('listingId')||'');const save=image=>{const old=listings.find(item=>item.id===id);const listing={id:old?.id||makeId(),name:String(values.get('name')).trim(),price:Number(values.get('price')),category:String(values.get('category')),description:String(values.get('description')).trim(),image:image||old?.image||'',seller:'You'};if(old)listings=listings.map(entry=>entry.id===id?listing:entry);else listings.unshift(listing);if(!saveListings()){$('#sale-status').textContent='Could not save this listing. Try a smaller image.';return;}$('#listing-modal').close();renderProducts();};if(file instanceof File&&file.size){if(!file.type.startsWith('image/')||file.size>900000){$('#sale-status').textContent='Choose an image under 900 KB.';return;}const reader=new FileReader();reader.onload=()=>save(String(reader.result));reader.onerror=()=>{$('#sale-status').textContent='Unable to read that image.';};reader.readAsDataURL(file);}else save('');});
  function renderOrders() { const target=$('#orders-list');if(!target)return;target.replaceChildren();if(!orders.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='Your completed purchases and delivery updates will appear here.';target.append(empty);return;}orders.forEach(order=>{const card=document.createElement('article');card.className='order-card';const main=document.createElement('div');const heading=document.createElement('h3');heading.textContent=`Order ${order.code}`;const names=document.createElement('p');names.textContent=order.items.map(item=>`${item.name} × ${item.quantity}`).join(' · ');const address=document.createElement('p');address.textContent=`${order.address} · ${money(order.total)}`;const track=document.createElement('div');track.className='progress-track';const fill=document.createElement('div');fill.className='progress-fill';fill.style.width=`${(order.stage+1)*33.333}%`;track.append(fill);main.append(heading,names,address,track);const side=document.createElement('div');const status=document.createElement('div');status.className='order-status';status.textContent=order.stages[order.stage];const next=document.createElement('button');next.type='button';next.className='small-button';next.textContent=order.stage<2?'Update delivery':'Delivered ✓';next.disabled=order.stage>=2;next.addEventListener('click',()=>{order.stage=Math.min(2,order.stage+1);writeJSON(KEY.orders,orders);renderOrders();});side.append(status,next);card.append(main,side);target.append(card);}); }
  $('#checkout-button')?.addEventListener('click',()=>{if(!cart.length)return;$('#cart-modal').close();$('#checkout-status').textContent='';$('#checkout-modal').showModal();});
  $('#checkout-form')?.addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;if(!form.reportValidity()||!cart.length)return;const values=new FormData(form);const items=cart.map(line=>{const item=getProduct(line.id);return{id:item.id,name:item.name,quantity:line.quantity,price:Number(item.price)};});const total=items.reduce((sum,item)=>sum+item.price*item.quantity,0);const order={code:`PL-${String(Date.now()).slice(-6)}`,items,total,address:`${values.get('address')}, ${values.get('city')} ${values.get('postal')}`,recipient:values.get('recipient'),stage:0,stages:['Order confirmed','Packed with care','Out for delivery'],createdAt:new Date().toISOString()};orders.unshift(order);writeJSON(KEY.orders,orders);cart=[];saveCart();form.reset();$('#checkout-modal').close();renderCart();renderOrders();$('#success-message').textContent=`Thanks, ${order.recipient}! Order ${order.code} is confirmed. Your fictional delivery will show updates below.`;$('#success-timeline').innerHTML='<div class="timeline-row"><span class="timeline-dot">●</span><span>Order confirmed — we are getting it ready.</span></div><div class="timeline-row"><span>○</span><span>Packed with care — next stop.</span></div><div class="timeline-row"><span>○</span><span>Out for delivery — almost there!</span></div>';$('#success-modal').showModal();});
  $('#open-cart')?.addEventListener('click',()=>{renderCart();$('#cart-modal').showModal();});
  $('#add-listing')?.addEventListener('click',()=>openListing());$('#hero-sell')?.addEventListener('click',()=>openListing());
  $('#product-search')?.addEventListener('input',event=>{query=event.target.value.trim().toLowerCase();renderProducts();});
  $$('.category-chip').forEach(button=>button.addEventListener('click',()=>{$$('.category-chip').forEach(item=>item.classList.remove('selected'));button.classList.add('selected');categoryFilter=button.dataset.category;renderProducts();}));
  $$('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.close)?.close()));
  $$('.market-modal').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();}));
  renderProducts();renderCart();renderOrders();
})();
