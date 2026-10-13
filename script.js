/* ===== DEELYT APP – JavaScript ===== */

// Product Data (simulated)
const products = [
  { id: 1, name: "Oversized Unisex Hoodie", category: "clothes", price: 18500, seller: "Seller A – Lagos", sizes: ["S","M","L","XL"], desc: "Premium cotton blend oversized hoodie. Perfect for both men and women. Soft fleece interior.", emoji: "🧥" },
  { id: 2, name: "Classic Crew Neck Tee", category: "clothes", price: 8500, seller: "Seller B – Abuja", sizes: ["S","M","L","XL","XXL"], desc: "100% cotton unisex t-shirt. Breathable and durable. Available in multiple colors.", emoji: "👕" },
  { id: 3, name: "Cargo Utility Pants", category: "clothes", price: 22000, seller: "Seller A – Lagos", sizes: ["28","30","32","34","36"], desc: "Unisex cargo pants with multiple pockets. Relaxed fit, ideal for street style.", emoji: "👖" },
  { id: 4, name: "Bomber Jacket", category: "clothes", price: 35000, seller: "Seller C – Port Harcourt", sizes: ["S","M","L","XL"], desc: "Lightweight bomber jacket with ribbed cuffs. Unisex design, water-resistant.", emoji: "🧥" },
  { id: 5, name: "Stiletto Heels – Black Gold", category: "heels", price: 28000, seller: "Seller B – Abuja", sizes: ["37","38","39","40","41"], desc: "Bold black stilettos with gold heel tip. 4-inch height. Statement piece.", emoji: "👠" },
  { id: 6, name: "Block Heel Sandals", category: "heels", price: 19500, seller: "Seller A – Lagos", sizes: ["36","37","38","39","40"], desc: "Comfortable block heel sandals. Perfect for all-day wear. Gold buckle detail.", emoji: "👡" },
  { id: 7, name: "Platform Heels", category: "heels", price: 32000, seller: "Seller C – Port Harcourt", sizes: ["37","38","39","40"], desc: "Chunky platform heels with gold accents. 5-inch total height. Eye-catching.", emoji: "👠" },
  { id: 8, name: "Ankle Strap Heels", category: "heels", price: 24500, seller: "Seller B – Abuja", sizes: ["36","37","38","39","40","41"], desc: "Elegant ankle strap heels. Soft padding, gold hardware. Timeless design.", emoji: "👠" },
  { id: 9, name: "Leather Tote Bag", category: "bags", price: 42000, seller: "Seller A – Lagos", sizes: ["One Size"], desc: "Genuine leather tote. Spacious interior, gold zipper. Unisex everyday essential.", emoji: "👜" },
  { id: 10, name: "Crossbody Mini Bag", category: "bags", price: 16500, seller: "Seller B – Abuja", sizes: ["One Size"], desc: "Compact crossbody with adjustable strap. Perfect for essentials. Gold chain detail.", emoji: "🎒" },
  { id: 11, name: "Backpack – Urban", category: "bags", price: 38000, seller: "Seller C – Port Harcourt", sizes: ["One Size"], desc: "Durable urban backpack. Laptop sleeve, multiple compartments. Unisex style.", emoji: "🎒" },
  { id: 12, name: "Clutch Bag – Gold Edge", category: "bags", price: 21000, seller: "Seller A – Lagos", sizes: ["One Size"], desc: "Sleek clutch with gold edge trim. Evening ready. Soft suede finish.", emoji: "👝" },
];

// State
let cart = JSON.parse(localStorage.getItem("deelyt_cart")) || [];
let currentUser = JSON.parse(localStorage.getItem("deelyt_user")) || null;
let currentProduct = null;
let selectedSize = null;
let qty = 1;
let currentCategory = "all";

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  renderProducts("trendingProducts", products.slice(0, 6));
  renderProducts("allProducts", products);
  updateCartUI();
  checkAuth();
});

// ===== NAVIGATION =====
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");

  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  const link = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (link) link.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleMobileNav() {
  const nav = document.getElementById("mobileNav");
  nav.style.display = nav.style.display === "flex" ? "none" : "flex";
}

// ===== PRODUCTS =====
function renderProducts(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `<p style="color:#888;grid-column:1/-1;text-align:center;padding:40px;">No products found.</p>`;
    return;
  }

  container.innerHTML = list.map(p => `
    <div class="product-card" onclick="openProduct(${p.id})">
      <div class="product-img">${p.emoji}</div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <div class="product-price">₦${p.price.toLocaleString()}</div>
        <div class="product-seller">${p.seller} <span class="verified">✓</span></div>
        <div class="product-actions" onclick="event.stopPropagation()">
          <button class="btn-add" onclick="quickAdd(${p.id})">Add</button>
          <button class="btn-view" onclick="openProduct(${p.id})">View</button>
        </div>
      </div>
    </div>
  `).join("");
}

function filterProducts() {
  const search = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const cat = document.getElementById("categoryFilter")?.value || currentCategory;
  const sort = document.getElementById("sortFilter")?.value || "default";

  let filtered = products.filter(p => {
    const matchCat = cat === "all" || p.category === cat;
    const matchSearch = p.name.toLowerCase().includes(search) || p.category.includes(search);
    return matchCat && matchSearch;
  });

  if (sort === "price-low") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "price-high") filtered.sort((a, b) => b.price - a.price);
  else if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

  renderProducts("allProducts", filtered);
  if (document.getElementById("shop").classList.contains("active") === false) {
    showPage("shop");
  }
}

function filterByCategory(cat) {
  currentCategory = cat;
  const select = document.getElementById("categoryFilter");
  if (select) select.value = cat;
  showPage("shop");
  filterProducts();
}

// ===== PRODUCT DETAIL =====
function openProduct(id) {
  currentProduct = products.find(p => p.id === id);
  if (!currentProduct) return;

  qty = 1;
  selectedSize = currentProduct.sizes[0];

  document.getElementById("detailName").textContent = currentProduct.name;
  document.getElementById("detailPrice").textContent = `₦${currentProduct.price.toLocaleString()}`;
  document.getElementById("detailSeller").textContent = currentProduct.seller;
  document.getElementById("detailDesc").textContent = currentProduct.desc;
  document.getElementById("qtyValue").textContent = qty;

  const imgEl = document.getElementById("detailImg");
  imgEl.style.display = "none";
  document.querySelector(".detail-image").innerHTML = `<span style="font-size:5rem">${currentProduct.emoji}</span>`;

  const sizeSel = document.getElementById("sizeSelector");
  sizeSel.innerHTML = currentProduct.sizes.map(s =>
    `<button class="size-btn ${s === selectedSize ? "active" : ""}" onclick="selectSize('${s}', this)">${s}</button>`
  ).join("");

  openModal("productModal");
}

function selectSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function changeQty(delta) {
  qty = Math.max(1, qty + delta);
  document.getElementById("qtyValue").textContent = qty;
}

function addToCartFromDetail() {
  if (!currentProduct) return;
  addToCart(currentProduct.id, selectedSize, qty);
  closeModal("productModal");
}

function quickAdd(id) {
  const p = products.find(x => x.id === id);
  if (p) addToCart(id, p.sizes[0], 1);
}

function openChatFromProduct() {
  closeModal("productModal");
  showPage("chat");
}

// ===== CART =====
function addToCart(id, size, quantity) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id && item.size === size);
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      size,
      qty: quantity,
      emoji: product.emoji,
      seller: product.seller
    });
  }

  saveCart();
  updateCartUI();
  showToast("Added to bag!");
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("deelyt_cart", JSON.stringify(cart));
}

function updateCartUI() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById("cartCount").textContent = count;

  const container = document.getElementById("cartItems");
  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart"><i class="fas fa-shopping-bag" style="font-size:2.5rem;color:#444;margin-bottom:12px;display:block;"></i>Your bag is empty</div>`;
  } else {
    container.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <div class="cart-item-img">${item.emoji}</div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div class="price">₦${item.price.toLocaleString()} × ${item.qty}</div>
          <small>Size: ${item.size}</small>
          <span class="remove" onclick="removeFromCart(${i})">Remove</span>
        </div>
      </div>
    `).join("");
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.getElementById("cartTotal").textContent = `₦${total.toLocaleString()}`;
}

function toggleCart() {
  document.getElementById("cartSidebar").classList.toggle("open");
  document.getElementById("cartOverlay").classList.toggle("open");
}

// ===== CHECKOUT =====
function openCheckout() {
  if (cart.length === 0) {
    showToast("Your bag is empty!");
    return;
  }
  if (!currentUser) {
    showToast("Please login or sign up first");
    toggleCart();
    showPage("account");
    return;
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.getElementById("transferAmount").textContent = `₦${total.toLocaleString()}`;

  document.getElementById("checkoutSummary").innerHTML = cart.map(i =>
    `<div style="display:flex;justify-content:space-between;margin-bottom:6px;">
      <span>${i.name} (${i.size}) ×${i.qty}</span>
      <span>₦${(i.price * i.qty).toLocaleString()}</span>
    </div>`
  ).join("") + `<hr style="border-color:#333;margin:10px 0;">
  <div style="display:flex;justify-content:space-between;font-weight:800;color:var(--gold);">
    <span>Total</span><span>₦${total.toLocaleString()}</span>
  </div>`;

  toggleCart();
  openModal("checkoutModal");
}

function placeOrder() {
  const name = document.getElementById("delName").value.trim();
  const phone = document.getElementById("delPhone").value.trim();
  const address = document.getElementById("delAddress").value.trim();
  const city = document.getElementById("delCity").value.trim();
  const state = document.getElementById("delState").value;

  if (!name || !phone || !address || !city || !state) {
    showToast("Please fill all delivery fields");
    return;
  }

  const orderId = "DLY" + Date.now().toString().slice(-8);
  document.getElementById("orderId").textContent = orderId;

  // Clear cart
  cart = [];
  saveCart();
  updateCartUI();

  closeModal("checkoutModal");
  openModal("successModal");
}

// ===== AUTH =====
function switchAuth(type) {
  document.querySelectorAll(".auth-tabs .tab").forEach(t => t.classList.remove("active"));
  if (type === "login") {
    document.querySelector(".auth-tabs .tab:first-child").classList.add("active");
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("signupForm").classList.add("hidden");
  } else {
    document.querySelector(".auth-tabs .tab:last-child").classList.add("active");
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("signupForm").classList.remove("hidden");
  }
}

function signup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const phone = document.getElementById("signupPhone").value.trim();
  const isSeller = document.getElementById("isSeller").checked;

  if (!name || !email || !password) {
    showToast("Please fill all required fields");
    return;
  }

  const user = {
    name,
    email,
    phone,
    role: isSeller ? "Seller (Pending Verification)" : "Buyer",
    isSeller,
    verified: false
  };

  // Save to "users" list
  let users = JSON.parse(localStorage.getItem("deelyt_users")) || [];
  if (users.find(u => u.email === email)) {
    showToast("Email already registered. Please login.");
    return;
  }
  users.push(user);
  localStorage.setItem("deelyt_users", JSON.stringify(users));

  currentUser = user;
  localStorage.setItem("deelyt_user", JSON.stringify(user));
  checkAuth();
  showToast(isSeller ? "Account created! Seller verification pending by App Creator." : "Welcome to Deelyt!");
}

function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showToast("Enter email and password");
    return;
  }

  const users = JSON.parse(localStorage.getItem("deelyt_users")) || [];
  const user = users.find(u => u.email === email);

  if (!user) {
    showToast("No account found. Please sign up.");
    return;
  }

  // Simple demo – no real password check
  currentUser = user;
  localStorage.setItem("deelyt_user", JSON.stringify(user));
  checkAuth();
  showToast("Welcome back, " + user.name + "!");
}

function logout() {
  currentUser = null;
  localStorage.removeItem("deelyt_user");
  checkAuth();
  showToast("Logged out");
}

function checkAuth() {
  const authSection = document.getElementById("authSection");
  const dashboard = document.getElementById("userDashboard");

  if (currentUser) {
    authSection.classList.add("hidden");
    dashboard.classList.remove("hidden");
    document.getElementById("userName").textContent = currentUser.name;
    document.getElementById("userEmail").textContent = currentUser.email;
    document.getElementById("userRole").textContent = currentUser.role;
    document.getElementById("accountBtn").innerHTML = `<i class="fas fa-user"></i> ${currentUser.name.split(" ")[0]}`;

    const sellerStatus = document.getElementById("sellerStatus");
    if (currentUser.isSeller) {
      sellerStatus.classList.remove("hidden");
    } else {
      sellerStatus.classList.add("hidden");
    }
  } else {
    authSection.classList.remove("hidden");
    dashboard.classList.add("hidden");
    document.getElementById("accountBtn").innerHTML = `<i class="fas fa-user"></i> Account`;
  }
}

// ===== CHAT =====
function selectChat(el, name) {
  document.querySelectorAll(".chat-item").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("chatHeader").innerHTML = `${name} <span class="verified">Verified ✓</span>`;
  document.getElementById("chatMessages").innerHTML = `
    <div class="msg received">Hello! How can I help you today?</div>
    <div class="msg sent">Hi, is this item still available?</div>
    <div class="msg received">Yes! Ready to ship within 24hrs after payment.</div>
  `;
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;

  const messages = document.getElementById("chatMessages");
  messages.innerHTML += `<div class="msg sent">${text}</div>`;
  input.value = "";
  messages.scrollTop = messages.scrollHeight;

  // Simulated reply
  setTimeout(() => {
    messages.innerHTML += `<div class="msg received">Thanks for your message! I'll get back to you shortly.</div>`;
    messages.scrollTop = messages.scrollHeight;
  }, 1000);
}

// ===== MODALS =====
function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

// ===== TOAST =====
function showToast(msg) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: #FFD700; color: #0a0a0a; padding: 14px 28px; border-radius: 8px;
    font-weight: 700; z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    animation: fadeIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Close modals on outside click
document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.remove("open");
  });
});
