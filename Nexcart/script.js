// ---------- Settings (easy to edit) ----------
const CURRENCY = "$";

const PRODUCTS = [
  { id: 1, name: "Aero Wireless Earbuds", cat: "Electronics", price: 79,  emoji: "🎧", bg: "linear-gradient(135deg,#FFE9B8,#FDB813)", tag: "Bestseller" },
  { id: 2, name: "Pulse Smartwatch",      cat: "Electronics", price: 149, emoji: "⌚", bg: "linear-gradient(135deg,#CFE8DF,#7FBFA9)", tag: "New" },
  { id: 3, name: "Linen Overshirt",       cat: "Fashion",     price: 54,  emoji: "👕", bg: "linear-gradient(135deg,#FFE0CC,#F7A072)" },
  { id: 4, name: "Trail Runner Sneakers", cat: "Fashion",     price: 92,  emoji: "👟", bg: "linear-gradient(135deg,#FFEFC7,#F9C74F)", tag: "Popular" },
  { id: 5, name: "Ceramic Pour-over Set", cat: "Home",        price: 46,  emoji: "☕", bg: "linear-gradient(135deg,#E6F0EC,#9CCBBB)" },
  { id: 6, name: "Glow Table Lamp",       cat: "Home",        price: 38,  emoji: "💡", bg: "linear-gradient(135deg,#FFF1C9,#FFD166)" },
  { id: 7, name: "Daily Radiance Serum",  cat: "Beauty",      price: 29,  emoji: "🧴", bg: "linear-gradient(135deg,#FFE3D3,#F8AD83)", tag: "Sale" },
  { id: 8, name: "Velvet Lip Duo",        cat: "Beauty",      price: 24,  emoji: "💄", bg: "linear-gradient(135deg,#D9EDE5,#8FC4B0)" }
];

const $ = (id) => document.getElementById(id);
const money = (n) => CURRENCY + n.toFixed(n % 1 ? 2 : 0);

// ---------- Opening animation ----------
window.addEventListener("load", () => {
  setTimeout(() => {
    $("intro").classList.add("done");
    document.body.classList.remove("loading");
    revealCards();
  }, 2800);
});

// ---------- Navbar shadow on scroll ----------
window.addEventListener("scroll", () => {
  $("nav").classList.toggle("scrolled", window.scrollY > 40);
});

// ---------- Products ----------
let activeCat = "All";
const cats = ["All", ...new Set(PRODUCTS.map((p) => p.cat))];

function renderFilters() {
  $("filters").innerHTML = cats
    .map((c) => `<button class="${c === activeCat ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
}

function renderGrid() {
  const list = activeCat === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === activeCat);
  $("grid").innerHTML = list
    .map(
      (p) => `
    <article class="card">
      <div class="thumb" style="background:${p.bg}">
        ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
        <span>${p.emoji}</span>
      </div>
      <div class="info">
        <small>${p.cat}</small>
        <h3>${p.name}</h3>
        <div class="row">
          <span class="price">${money(p.price)}</span>
          <button class="add" data-id="${p.id}" aria-label="Add ${p.name} to cart">+</button>
        </div>
      </div>
    </article>`
    )
    .join("");
  revealCards();
}

function revealCards() {
  document.querySelectorAll(".card").forEach((c, i) => {
    setTimeout(() => c.classList.add("show"), 80 * i);
  });
}

$("filters").addEventListener("click", (e) => {
  if (!e.target.dataset.cat) return;
  activeCat = e.target.dataset.cat;
  renderFilters();
  renderGrid();
});

$("grid").addEventListener("click", (e) => {
  const btn = e.target.closest(".add");
  if (btn) addToCart(Number(btn.dataset.id));
});

// ---------- Cart ----------
let cart = [];
try { cart = JSON.parse(localStorage.getItem("nexcart") || "[]"); } catch (e) {}

function saveCart() {
  try { localStorage.setItem("nexcart", JSON.stringify(cart)); } catch (e) {}
}

function addToCart(id) {
  const found = cart.find((i) => i.id === id);
  found ? found.qty++ : cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  const btn = $("openCart");
  btn.classList.remove("bump");
  void btn.offsetWidth;
  btn.classList.add("bump");
  toast(PRODUCTS.find((p) => p.id === id).name + " added to cart");
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  cart = cart.filter((i) => i.qty > 0);
  saveCart();
  renderCart();
}

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * PRODUCTS.find((p) => p.id === i.id).price, 0);
  $("cartCount").textContent = count;
  $("total").textContent = money(total);
  $("items").innerHTML = cart.length
    ? cart
        .map((i) => {
          const p = PRODUCTS.find((x) => x.id === i.id);
          return `
        <div class="line">
          <div class="em" style="background:${p.bg}">${p.emoji}</div>
          <div class="meta">
            <b>${p.name}</b>${money(p.price)}
            <div class="qty">
              <button data-act="minus" data-id="${p.id}" aria-label="Remove one">−</button>
              <span>${i.qty}</span>
              <button data-act="plus" data-id="${p.id}" aria-label="Add one">+</button>
            </div>
          </div>
        </div>`;
        })
        .join("")
    : `<p class="empty">Your cart is empty.<br>Add something you love.</p>`;
}

$("items").addEventListener("click", (e) => {
  const act = e.target.dataset.act;
  if (!act) return;
  changeQty(Number(e.target.dataset.id), act === "plus" ? 1 : -1);
});

function toggleCart(open) {
  $("drawer").classList.toggle("open", open);
  $("overlay").classList.toggle("open", open);
}
$("openCart").onclick = () => toggleCart(true);
$("closeCart").onclick = () => toggleCart(false);
$("overlay").onclick = () => toggleCart(false);
document.addEventListener("keydown", (e) => e.key === "Escape" && toggleCart(false));

$("checkout").onclick = () => {
  if (!cart.length) return toast("Add an item before checkout");
  cart = [];
  saveCart();
  renderCart();
  toggleCart(false);
  toast("Order placed. Thank you!");
};

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ---------- Countdown (ends 3 days after the page first opens) ----------
let end = Date.now() + 3 * 24 * 60 * 60 * 1000;
try {
  end = Number(localStorage.getItem("nexcart-end")) || end;
  localStorage.setItem("nexcart-end", end);
} catch (e) {}

function tick() {
  let diff = Math.max(0, end - Date.now());
  const pad = (n) => String(n).padStart(2, "0");
  $("d").textContent = pad(Math.floor(diff / 864e5));
  $("h").textContent = pad(Math.floor((diff % 864e5) / 36e5));
  $("m").textContent = pad(Math.floor((diff % 36e5) / 6e4));
  $("s").textContent = pad(Math.floor((diff % 6e4) / 1e3));
}
setInterval(tick, 1000);
tick();

// ---------- Hero 3D tilt (desktop mouse only) ----------
const tilt = $("tilt");
document.querySelector(".hero").addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 14;
  const y = (e.clientY / window.innerHeight - 0.5) * -14;
  tilt.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg)`;
});

// ---------- Newsletter ----------
$("newsForm").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.reset();
  toast("You're in! Check your inbox for 10% off.");
});

// ---------- Start ----------
renderFilters();
renderGrid();
renderCart();