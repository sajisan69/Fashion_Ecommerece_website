const $=id=>document.getElementById(id),fm=n=>'৳'+n.toLocaleString();
const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let PRODUCTS=[],CATEGORIES=[],SIZES=[];
let cart=ld('mf_cart',[]),wish=new Set(ld('mf_wish',[])),cat='All',showWish=false,disc=0,pd=null,pi=0,psz='M',pq=1;
const PH="data:image/svg+xml;utf8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="400" height="500" fill="#dfe9e5"/><text x="200" y="255" text-anchor="middle" font-family="sans-serif" fill="#6b7a76">No photo</text></svg>');
const imgs=p=>p.images;
const im=(src,alt='')=>`<img src="${src}" alt="${alt}" loading="lazy" onerror="this.onerror=null;this.src='${PH}'">`;
const go=s=>document.querySelector(s).scrollIntoView({behavior:'smooth'});
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1500)}
function setCat(c){cat=c;showWish=false;$('q').value='';render();go('#shop')}
function wishView(){showWish=true;cat='All';render();go('#shop')}
function render(){
 $('chips').innerHTML=['All',...CATEGORIES].map(c=>`<button class="chip ${cat==c&&!showWish?'on':''}" onclick="setCat('${c}')">${c=='All'?'View All':c}</button>`).join('');
 const q=$('q').value.toLowerCase();
 const L=PRODUCTS.map((p,i)=>({...p,i})).filter(p=>(cat=='All'||p.category==cat)&&(!showWish||wish.has(p.id))&&(p.name+p.category).toLowerCase().includes(q));
 $('st').textContent=showWish?'My Wishlist':cat=='All'?(q?'Search Results':'Best Sellers'):cat;
 $('grid').innerHTML=L.length?L.map(p=>`<div class="card">${p.tag?`<span class="tag">${p.tag}</span>`:''}<button class="wl ${wish.has(p.id)?'on':''}" onclick="tw('${p.id}')">${wish.has(p.id)?'♥':'♡'}</button><div class="im" onclick="openP(${p.i})">${im(imgs(p)[0],p.name)}</div><h3 onclick="openP(${p.i})">${p.name}</h3><p>${p.category}</p><div class="pr"><div><b>${fm(p.price)}</b>${p.oldPrice?`<s>${fm(p.oldPrice)}</s>`:''}</div><button class="add" onclick="openP(${p.i})" aria-label="Add">+</button></div></div>`).join(''):'<div class="empty" style="grid-column:1/-1">Nothing found.</div>';
 $('wc').textContent=wish.size;$('cc').textContent=cart.reduce((a,b)=>a+b.q,0);
 $('cnt').innerHTML='';
}
function tw(f){wish.has(f)?wish.delete(f):wish.add(f);sv('mf_wish',[...wish]);render()}
function open(h,cls=''){$('sheet').className='sheet '+cls;$('sheet').innerHTML=h;$('ov').classList.add('show')}
function closeOv(){$('ov').classList.remove('show')}
/* product detail */
function openP(i){pd=PRODUCTS[i];pi=0;psz='M';pq=1;drawP()}
function drawP(){const p=pd,L=imgs(p);
 open(`<button class="x" onclick="closeOv()">✕</button><div class="pdg"><div><div class="main">${im(L[pi],p.name)}${L.length>1?`<button class="arr l" onclick="pn(-1)">‹</button><button class="arr r" onclick="pn(1)">›</button>`:''}</div><div class="th">${L.map((s,k)=>`<img class="${k==pi?'on':''}" src="${s}" onclick="pi=${k};drawP()" onerror="this.onerror=null;this.src='${PH}'">`).join('')}</div></div>
 <div><small style="color:var(--mu)">${p.category}</small><h3 style="display:block;font-size:20px;margin:4px 0">${p.name}</h3><div class="pr" style="justify-content:flex-start;gap:8px"><b style="font-size:22px">${fm(p.price)}</b>${p.oldPrice?`<s>${fm(p.oldPrice)}</s>`:''}</div><p style="margin:12px 0;font-size:14px;color:var(--mu);line-height:1.6">${p.description}</p><b style="font-size:13px">Size</b><div class="sz">${SIZES.map(z=>`<button class="${z==psz?'on':''}" onclick="psz='${z}';drawP()">${z}</button>`).join('')}</div>
 <div class="q" style="margin:10px 0"><b style="font-size:13px">Qty</b><button onclick="pq=Math.max(1,pq-1);drawP()">−</button>${pq}<button onclick="pq++;drawP()">+</button></div>
 <button class="btn full" onclick="addP()">ADD TO CART</button><button class="btn full" style="background:var(--gd)" onclick="addP(true)">ORDER NOW</button></div></div>`,'pd');
 $('sheet').style.position='relative'}
function pn(d){const n=pd.images.length;pi=(pi+d+n)%n;drawP()}
function addP(now){const k=cart.find(x=>x.f==pd.id&&x.s==psz);k?k.q+=pq:cart.push({f:pd.id,s:psz,q:pq});sv('mf_cart',cart);render();if(now)openCart();else{closeOv();toast('Added to cart ('+psz+')')}}
/* cart */
const prod=f=>PRODUCTS.find(p=>p.id==f);
const sub=()=>cart.reduce((a,i)=>a+prod(i.f).price*i.q,0),ship=()=>!cart.length||sub()>=2000?0:80;
function totals(){const s=sub(),d=Math.round(s*disc);return `<div class="row"><span>Subtotal</span><span>${fm(s)}</span></div>${d?`<div class="row"><span>Discount (10%)</span><span>-${fm(d)}</span></div>`:''}<div class="row"><span>Delivery</span><span>${ship()?fm(ship()):'Free'}</span></div><div class="row t"><span>Total</span><span>${fm(s-d+ship())}</span></div>`}
function openCart(){
 if(!cart.length)return open(`<h3>Your Cart <button onclick="closeOv()">✕</button></h3><div class="empty">Your cart is empty.</div>`);
 open(`<h3>Your Cart <button onclick="closeOv()">✕</button></h3>`+cart.map((i,k)=>{const p=prod(i.f);return `<div class="ci">${im(imgs(p)[0])}<div><b>${p.name}</b><br><small>Size ${i.s} · ${fm(p.price)}</small></div><div class="q"><button onclick="qty(${k},-1)">−</button>${i.q}<button onclick="qty(${k},1)">+</button></div></div>`}).join('')+`<div class="pc"><input id="pc" placeholder="Promo code"><button onclick="applyCode($('pc').value)">Apply</button></div><div style="margin-top:10px">${totals()}</div><button class="btn full" onclick="checkout()">PLACE ORDER</button>`)}
function qty(k,d){cart[k].q+=d;if(cart[k].q<1)cart.splice(k,1);sv('mf_cart',cart);render();openCart()}
function applyCode(c){if(c.trim().toUpperCase()=='WELCOME10'){disc=.1;toast('10% discount applied')}else toast('Invalid code');if($('ov').classList.contains('show')&&cart.length)openCart()}
function checkout(){open(`<h3>Order Details <button onclick="closeOv()">✕</button></h3><input class="f" id="nm" placeholder="Full name"><input class="f" id="ph" type="tel" placeholder="Phone number (01XXXXXXXXX)"><textarea class="f" id="ad" rows="3" placeholder="Full delivery address"></textarea><div class="err" id="er"></div><div style="margin-top:8px">${totals()}</div><small style="color:var(--mu)">Payment: Cash on Delivery</small><button class="btn full" onclick="submitOrder()">CONFIRM ORDER</button>`)}
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function submitOrder(){const n=$('nm').value.trim(),p=$('ph').value.trim(),a=$('ad').value.trim();
 if(n.length<2||!/^(\+?88)?01\d{9}$/.test(p)||a.length<8){$('er').textContent='Please enter a valid name, 11-digit phone number and full address.';return}
 const id='MF'+Math.floor(10000+Math.random()*90000);
 /* TODO: send order to your backend / WhatsApp / Google Sheet here: {id,name:n,phone:p,address:a,cart} */
 open(`<div class="empty"><div style="font-size:50px">✅</div><h3 style="justify-content:center">Order Confirmed!</h3><p>Thank you, ${esc(n)}.<br>Order <b>#${id}</b> will be delivered to your address soon. We'll call ${esc(p)} to confirm.</p><button class="btn full" onclick="closeOv()">CONTINUE SHOPPING</button></div>`);
 cart=[];disc=0;sv('mf_cart',cart);render()}
$('ov').addEventListener('click',e=>{if(e.target.id=='ov')closeOv()});
document.addEventListener('keydown',e=>{if(e.key=='Escape')closeOv()});
$('y').textContent=new Date().getFullYear();
fetch('data/products.json').then(r=>{if(!r.ok)throw 0;return r.json()}).then(d=>{PRODUCTS=d.products;CATEGORIES=d.categories;SIZES=d.sizes;render()}).catch(()=>{$('grid').innerHTML='<div class="empty" style="grid-column:1/-1"><b>Products could not load.</b><br>Browsers block data files when index.html is opened directly.<br>Run <b>run-local.bat</b> (Windows) or <b>run-local.sh</b> (Mac/Linux), then open <b>http://localhost:8000</b>.<br>On any web hosting it works normally.</div>'});
