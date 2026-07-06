// Global State
let products = [];
let categories = ["মুদি", "মসলা", "চাল/ডাল", "তেল/ঘি", "পানীয়/ড্রিংকস", "প্রসাধন", "অন্যান্য"];
let isEditLocked = true;
let currentSearchQuery = "";
let activeCategory = "all";
let cart = [];

// SVG Icons for Lock Toggle
const LOCKED_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
`;

const UNLOCKED_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
  </svg>
`;

// Dummy Data
const DUMMY_PRODUCTS = [
  { id: "1", name: "রূপচাঁদা সয়াবিন তেল ৫ লিটার", category: "তেল/ঘি", tags: "oil, five liter, soyabean", image: "", buyPrice: 790, sellPrice: 835, minPrice: 825, updatedAt: new Date().toISOString() },
  { id: "2", name: "দেশী মসুর ডাল ১ কেজি", category: "চাল/ডাল", tags: "dal, pulses, mosur", image: "", buyPrice: 122, sellPrice: 135, minPrice: 130 },
  { id: "3", name: "মিনিকেট চাল ৫০ কেজি (বস্তা)", category: "চাল/ডাল", tags: "rice, chal, miniket", image: "", buyPrice: 3150, sellPrice: 3380, minPrice: 3320 },
  { id: "4", name: "তীর আটা ২ কেজি", category: "মুদি", tags: "flour, ata, teer", image: "", buyPrice: 94, sellPrice: 110, minPrice: 108 },
  { id: "5", name: "ফ্রেশ সাদা চিনি ১ কেজি", category: "মুদি", tags: "sugar, chini, fresh", image: "", buyPrice: 126, sellPrice: 135, minPrice: 132 },
  { id: "6", name: "এসিআই আয়োডিনযুক্ত লবণ ১ কেজি", category: "মসলা", tags: "salt, lobon, aci", image: "", buyPrice: 32, sellPrice: 42, minPrice: 40 },
  { id: "7", name: "ডিপ্লোমা ফুল ক্রিম গুঁড়ো দুধ ৫০০ গ্রাম", category: "মুদি", tags: "milk powder, diploma, dudh", image: "", buyPrice: 415, sellPrice: 450, minPrice: 440 },
  { id: "8", name: "লাইফবয় সাবান ৭৫ গ্রাম", category: "প্রসাধন", tags: "soap, lifebuoy, saban", image: "", buyPrice: 42, sellPrice: 50, minPrice: 48 },
  { id: "9", name: "ইস্পাহানি মির্জাপুর চা পাতা ৪০০ গ্রাম", category: "পানীয়/ড্রিংকস", tags: "tea, cha pata, ispahani", image: "", buyPrice: 182, sellPrice: 215, minPrice: 208 },
  { id: "10", name: "দেশী পেঁয়াজ ১ কেজি", category: "মসলা", tags: "onion, peaj", image: "", buyPrice: 65, sellPrice: 80, minPrice: 75 },
  { id: "11", name: "লাল আলু ১ কেজি", category: "মসলা", tags: "potato, alu", image: "", buyPrice: 40, sellPrice: 50, minPrice: 48 },
  { id: "12", name: "দেশী রসুন ১ কেজি", category: "মসলা", tags: "garlic, roshun", image: "", buyPrice: 180, sellPrice: 220, minPrice: 200 },
  { id: "13", name: "লাক্স সাবান ১০০ গ্রাম", category: "প্রসাধন", tags: "soap, lux, saban", image: "", buyPrice: 62, sellPrice: 75, minPrice: 70 },
  { id: "14", name: "প্যারাসুট নারিকেল তেল ২০০ মিলি", category: "তেল/ঘি", tags: "coconut oil, parachute, nikel tel", image: "", buyPrice: 125, sellPrice: 145, minPrice: 140 },
  { id: "15", name: "প্রাণ নুডলস ৮ প্যাক", category: "পানীয়/ড্রিংকস", tags: "noodles, pran, nuduls", image: "", buyPrice: 140, sellPrice: 160, minPrice: 155 }
];

// Initialize Application
window.addEventListener("DOMContentLoaded", () => {
  loadData();
  applyLockState();
  updateStats();
  renderCategoryFilters();
  renderProducts();
});

// Load Data from LocalStorage
function loadData() {
  // Load Categories
  const storedCats = localStorage.getItem("dokandar_catalog_categories");
  if (storedCats) {
    try {
      categories = JSON.parse(storedCats);
    } catch (e) {
      console.error("Error parsing stored categories", e);
    }
  }
  // Ensure default fallback is present
  if (!categories.includes("অন্যান্য")) {
    categories.push("অন্যান্য");
  }

  // Load Products
  const stored = localStorage.getItem("dokandar_catalog_products");
  if (stored) {
    try {
      products = JSON.parse(stored);
      // Migrate existing products to have category, tags, and image attributes
      products.forEach(p => {
        if (!p.category) {
          p.category = "অন্যান্য";
        }
        if (!p.tags) {
          p.tags = "";
        }
        if (!p.image) {
          p.image = "";
        }
      });
    } catch (e) {
      console.error("Error parsing stored data", e);
      products = [];
    }
  } else {
    // If empty, load dummy data for initial presentation
    products = [...DUMMY_PRODUCTS];
    saveData();
  }
}

// Save Data to LocalStorage
function saveData() {
  localStorage.setItem("dokandar_catalog_products", JSON.stringify(products));
  localStorage.setItem("dokandar_catalog_categories", JSON.stringify(categories));
  localStorage.setItem("dokandar_catalog_last_updated", new Date().toISOString());
  updateStats();
  renderCategoryFilters();
}

// Update Stats Panel
function updateStats() {
  const countSpan = document.getElementById("totalProductsCount");
  const updateSpan = document.getElementById("lastUpdatedText");
  
  if (countSpan) {
    countSpan.textContent = toBengaliDigits(products.length) + "টি";
  }
  
  if (updateSpan) {
    const lastUpdate = localStorage.getItem("dokandar_catalog_last_updated");
    if (lastUpdate) {
      const date = new Date(lastUpdate);
      const timeString = date.toLocaleTimeString("bn-BD", { hour: '2-digit', minute: '2-digit' });
      const dateString = date.toLocaleDateString("bn-BD");
      updateSpan.textContent = `সর্বশেষ আপডেট: ${dateString} (সময়: ${timeString})`;
    } else {
      updateSpan.textContent = "সর্বশেষ আপডেট: নাই";
    }
  }
}

// Translate Digits to Bengali for visuals
function toBengaliDigits(num) {
  if (num === null || num === undefined) return "০";
  const bengaliNumbers = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/[0-9]/g, (w) => bengaliNumbers[+w]);
}

// Get Dynamic Color mapping for category placeholder tags
function getCategoryColor(category) {
  const colors = {
    "মুদি": "#3b82f6",          // Blue
    "মসলা": "#f59e0b",          // Yellow
    "চাল/ডাল": "#10b981",        // Green
    "তেল/ঘি": "#ec4899",         // Pink
    "পানীয়/ড্রিংকস": "#8b5cf6",   // Purple
    "প্রসাধন": "#06b6d4",        // Cyan
    "অন্যান্য": "#64748b"         // Slate
  };
  return colors[category] || "#64748b";
}

// Toggle Lock Status
function toggleEditLock() {
  isEditLocked = !isEditLocked;
  applyLockState();
  
  if (isEditLocked) {
    showToast("লক চালু করা হয়েছে। দামসমূহ এখন সুরক্ষিত।", "success");
  } else {
    showToast("লক খোলা হয়েছে। দাম পরিবর্তন করা যাবে।", "info");
  }
}

// Apply visual & logic rules of Edit Lock
function applyLockState() {
  const lockContainer = document.getElementById("lockToggle");
  const lockText = document.getElementById("lockText");
  const lockIcon = document.getElementById("lockIcon");
  const addProductBtn = document.getElementById("addProductBtn");
  const unlockWarning = document.getElementById("unlockWarning");
  
  if (isEditLocked) {
    document.body.classList.remove("app-unlocked-state");
    document.body.classList.add("app-locked-state");
    
    lockContainer.classList.remove("unlocked");
    lockContainer.classList.add("locked");
    lockText.textContent = "লকড (সুরক্ষিত)";
    lockIcon.innerHTML = LOCKED_SVG;
    
    addProductBtn.disabled = true;
    unlockWarning.style.display = "none";
  } else {
    document.body.classList.remove("locked");
    document.body.classList.add("unlocked");
    lockText.textContent = "আনলকড (সম্পাদনাযোগ্য)";
    lockIcon.innerHTML = UNLOCKED_SVG;
    
    addProductBtn.disabled = false;
    unlockWarning.style.display = "flex";
  }
  
  // Re-render to update the display of Edit/Delete buttons on card hover/states
  renderProducts();
  updateCartUI();
}

// Render Products list based on search filters
function renderProducts() {
  const container = document.getElementById("productList");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Split search keywords
  const searchTerms = currentSearchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  
  const filtered = products.filter(p => {
    // 1. Filter by category
    if (activeCategory !== "all" && (p.category || "অন্যান্য") !== activeCategory) {
      return false;
    }
    
    // 2. Filter by search query keywords
    if (searchTerms.length === 0) return true;
    
    const searchString = [
      p.name,
      p.category || "অন্যান্য",
      p.tags || "",
      p.buyPrice ? p.buyPrice.toString() : "",
      p.sellPrice ? p.sellPrice.toString() : "",
      p.minPrice ? p.minPrice.toString() : "",
      p.buyPrice ? toBengaliDigits(p.buyPrice) : "",
      p.sellPrice ? toBengaliDigits(p.sellPrice) : "",
      p.minPrice ? toBengaliDigits(p.minPrice) : ""
    ].join(" ");
    
    const normalizedSearchString = normalizeSearchText(searchString);
    return searchTerms.every(term => {
      return normalizedSearchString.includes(normalizeSearchText(term));
    });
  });
  
  // Sort alphabetically
  filtered.sort((a, b) => a.name.localeCompare(b.name, "bn-BD"));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="no-products">
        <div class="no-products-icon">🔍</div>
        <p>${currentSearchQuery ? 'এই নামে কোনো পণ্য পাওয়া যায়নি।' : 'কোনো পণ্য পাওয়া যায়নি। নতুন পণ্য যোগ করতে লক খুলুন।'}</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    
    // Event listener to toggle collapsible expanded state drawer
    card.addEventListener("click", (e) => {
      if (e.target.closest(".action-btn") || e.target.closest(".add-to-cart-btn") || e.target.closest(".drawer-image-box")) {
        return; // do not toggle drawer when clicking edit/delete, cart or image lightbox
      }
      card.classList.toggle("expanded");
    });
    
    // Create prices display
    const formattedBuy = p.buyPrice ? `৳ ${toBengaliDigits(p.buyPrice)}` : "—";
    const formattedSell = `৳ ${toBengaliDigits(p.sellPrice)}`;
    const formattedMin = p.minPrice ? `৳ ${toBengaliDigits(p.minPrice)}` : "—";
    
    // Actions HTML depending on lock state
    let actionsHtml = "";
    if (!isEditLocked) {
      actionsHtml = `
        <div class="product-actions" style="margin-right: 4px;">
          <button class="action-btn edit" onclick="event.stopPropagation(); openEditModal('${p.id}')" title="এডিট করুন">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-btn delete" onclick="event.stopPropagation(); deleteProduct('${p.id}')" title="মুছে ফেলুন">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      `;
    }
    
    // Add to Cart Button HTML
    const addToCartHtml = `
      <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${p.id}', event)" title="রসিদে যোগ করুন">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    `;
    
    // Render Image box or placeholder first-letter circle inside expanded drawer
    let imageBoxHtml = "";
    if (p.image) {
      imageBoxHtml = `
        <div class="drawer-image-box" onclick="openLightbox(event, '${p.image}')" title="বড় করে দেখুন">
          <img src="${p.image}" class="product-thumbnail" alt="${escapeHTML(p.name)}">
        </div>
      `;
    } else {
      const color = getCategoryColor(p.category || "অন্যান্য");
      const firstChar = p.name ? p.name.trim().charAt(0) : "?";
      imageBoxHtml = `
        <div class="drawer-image-box">
          <div class="product-placeholder-circle" style="background-color: ${color};">
            ${escapeHTML(firstChar)}
          </div>
        </div>
      `;
    }
    
    // Buy price item inside expanded drawer
    let buyPriceHtml = "";
    if (!isEditLocked) {
      buyPriceHtml = `
        <div class="price-item buy">
          <span class="price-label">ক্রয় মূল্য</span>
          <span class="price-value">${formattedBuy}</span>
        </div>
      `;
    }
    
    card.innerHTML = `
      <!-- Collapsed Header Summary -->
      <div class="product-summary-row">
        <div class="product-info-col">
          <span class="product-category-tag">${escapeHTML(p.category || "অন্যান্য")}</span>
          <h3 class="product-title">${escapeHTML(p.name)}</h3>
        </div>
        
        <div class="product-summary-right">
          <span class="summary-sell-price">${formattedSell}</span>
          ${addToCartHtml}
          ${actionsHtml}
          <div class="expand-chevron">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Expanded Drawer Details -->
      <div class="product-details-drawer">
        <div class="drawer-content">
          ${imageBoxHtml}
          <div class="drawer-prices-grid">
            ${buyPriceHtml}
            <div class="price-item min">
              <span class="price-label">সর্বনিম্ন মূল্য</span>
              <span class="price-value">${formattedMin}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Search logic
function handleSearch() {
  const searchInput = document.getElementById("searchInput");
  currentSearchQuery = searchInput.value;
  renderProducts();
}

// Escape HTML utility to prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Populate product modal category dropdown list
function populateProductCategoryDropdown() {
  const select = document.getElementById("prodCategory");
  if (!select) return;
  
  select.innerHTML = '<option value="">ক্যাটাগরি নির্বাচন করুন</option>';
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

// Canvas compression handler for dynamic local files selection
function handleImageSelection(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const placeholder = document.getElementById("imagePlaceholder");
  const preview = document.getElementById("modalImagePreview");
  
  placeholder.textContent = "⏳";
  placeholder.style.display = "flex";
  preview.style.display = "none";
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      const side = 200;
      canvas.width = side;
      canvas.height = side;
      
      // Crop center square coordinates
      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;
      
      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, side, side);
      
      // Convert to compressed jpeg base64 string
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
      
      preview.src = compressedBase64;
      preview.style.display = "block";
      placeholder.style.display = "none";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Lightbox Modal functions
function openLightbox(event, imageSrc) {
  if (event) event.stopPropagation(); // Prevent toggling the card collapse
  const lightbox = document.getElementById("imageLightbox");
  const img = document.getElementById("lightboxImage");
  if (!lightbox || !img) return;
  
  img.src = imageSrc;
  lightbox.classList.add("active");
}

function closeLightbox() {
  const lightbox = document.getElementById("imageLightbox");
  const img = document.getElementById("lightboxImage");
  if (lightbox) {
    lightbox.classList.remove("active");
  }
  setTimeout(() => {
    if (img && !lightbox.classList.contains("active")) {
      img.src = ""; // Clear memory reference
    }
  }, 300);
}

// Cart Operations Logic
function addToCart(productId, event) {
  if (event) event.stopPropagation();
  
  const p = products.find(prod => prod.id === productId);
  if (!p) return;
  
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      sellPrice: p.sellPrice,
      buyPrice: p.buyPrice || 0,
      quantity: 1
    });
  }
  
  updateCartUI();
  showToast(`"${p.name}" রসিদে যোগ করা হয়েছে।`, "success");
}

function updateCartQuantity(productId, delta) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex === -1) return;
  
  cart[itemIndex].quantity += delta;
  
  if (cart[itemIndex].quantity <= 0) {
    cart.splice(itemIndex, 1);
  }
  
  updateCartUI();
}

function clearCart() {
  if (cart.length === 0) return;
  const confirmClear = confirm("আপনি কি রসিদের সব আইটেম মুছে ফেলতে চান?");
  if (confirmClear) {
    cart = [];
    const discInput = document.getElementById("cartDiscountInput");
    if (discInput) discInput.value = "";
    updateCartUI();
    showToast("রসিদ পরিষ্কার করা হয়েছে।", "info");
  }
}

function toggleCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  if (drawer) {
    drawer.classList.toggle("active");
  }
}

function calculateCartTotals() {
  updateCartUI();
}

function updateCartUI() {
  const fab = document.getElementById("floatingCartBtn");
  const list = document.getElementById("cartItemsList");
  const badge = document.getElementById("cartCountBadge");
  const totalText = document.getElementById("cartTotalText");
  
  if (!fab || !list || !badge || !totalText) return;
  
  // Check if empty
  if (cart.length === 0) {
    fab.style.display = "none";
    const drawer = document.getElementById("cartDrawer");
    if (drawer) drawer.classList.remove("active");
    return;
  }
  
  fab.style.display = "flex";
  
  // Render items in list
  list.innerHTML = "";
  let totalItemsCount = 0;
  let subtotal = 0;
  let totalBuyCost = 0;
  
  cart.forEach(item => {
    totalItemsCount += item.quantity;
    const itemCost = item.sellPrice * item.quantity;
    subtotal += itemCost;
    totalBuyCost += (item.buyPrice || item.sellPrice) * item.quantity;
    
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <span class="cart-item-name">${escapeHTML(item.name)}</span>
      <div class="cart-item-controls">
        <div class="cart-qty-btn" onclick="updateCartQuantity('${item.id}', -1)">-</div>
        <span class="cart-qty-val">${toBengaliDigits(item.quantity)}</span>
        <div class="cart-qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</div>
      </div>
      <span class="cart-item-price">৳ ${toBengaliDigits(itemCost)}</span>
    `;
    list.appendChild(row);
  });
  
  // Update badge count and running total text on FAB
  badge.textContent = toBengaliDigits(totalItemsCount);
  totalText.textContent = `৳ ${toBengaliDigits(subtotal)}`;
  
  // Totals panel
  document.getElementById("cartSubtotalText").textContent = `৳ ${toBengaliDigits(subtotal)}`;
  
  // Calculate net payable
  const discInput = document.getElementById("cartDiscountInput");
  const discount = parseFloat(discInput ? discInput.value : 0) || 0;
  const netTotal = Math.max(0, subtotal - discount);
  document.getElementById("cartNetTotalText").textContent = `৳ ${toBengaliDigits(netTotal)}`;
  
  // Secret Profit statistics (only shown if UNLOCKED)
  const profitSection = document.getElementById("cartProfitSection");
  const profitText = document.getElementById("cartProfitText");
  if (profitSection && profitText) {
    if (!isEditLocked) {
      profitSection.style.display = "flex";
      const profit = Math.max(0, netTotal - totalBuyCost);
      profitText.textContent = `৳ ${toBengaliDigits(profit)}`;
    } else {
      profitSection.style.display = "none";
    }
  }
}

// Print Receipt Cash Memo
function printReceipt() {
  const printSection = document.getElementById("printSection");
  if (!printSection) return;
  
  const date = new Date().toLocaleDateString("bn-BD");
  const time = new Date().toLocaleTimeString("bn-BD", { hour: '2-digit', minute: '2-digit' });
  
  let subtotal = 0;
  let itemsRows = "";
  
  cart.forEach((item, index) => {
    const cost = item.sellPrice * item.quantity;
    subtotal += cost;
    itemsRows += `
      <tr>
        <td style="text-align: center;">${toBengaliDigits(index + 1)}</td>
        <td><strong>${escapeHTML(item.name)}</strong></td>
        <td style="text-align: center; font-family: var(--font-english);">${toBengaliDigits(item.quantity)}</td>
        <td style="text-align: right; font-family: var(--font-english);">৳ ${toBengaliDigits(item.sellPrice)}</td>
        <td style="text-align: right; font-family: var(--font-english);">৳ ${toBengaliDigits(cost)}</td>
      </tr>
    `;
  });
  
  const discInput = document.getElementById("cartDiscountInput");
  const discount = parseFloat(discInput ? discInput.value : 0) || 0;
  const netTotal = Math.max(0, subtotal - discount);
  
  printSection.innerHTML = `
    <div class="print-receipt" style="width: 100%; max-width: 400px; margin: 0 auto; font-family: var(--font-bangla); color: #000; padding: 15px; border: 1px dashed #333; border-radius: 8px; background: #fff;">
      <div style="text-align: center; margin-bottom: 15px;">
        <h2 style="margin: 0 0 5px 0; font-size: 1.6rem; font-weight: 700; color: #000;">দোকানদার ক্যাশ মেমো</h2>
        <p style="margin: 0; font-size: 0.85rem; color: #555;">তারিখ: ${date} | সময়: ${time}</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 0.85rem;">
        <thead>
          <tr style="border-bottom: 2px solid #000; font-weight: bold; color: #000;">
            <th style="padding: 6px 4px; text-align: center; width: 30px;">নং</th>
            <th style="padding: 6px 4px; text-align: left;">বিবরণ</th>
            <th style="padding: 6px 4px; text-align: center; width: 40px;">পরিমাণ</th>
            <th style="padding: 6px 4px; text-align: right; width: 70px;">দর</th>
            <th style="padding: 6px 4px; text-align: right; width: 80px;">মোট</th>
          </tr>
        </thead>
        <tbody style="color: #000;">
          ${itemsRows}
        </tbody>
      </table>
      
      <div style="border-top: 1px dashed #333; padding-top: 10px; font-size: 0.9rem; line-height: 1.6; color: #000;">
        <div style="display: flex; justify-content: space-between;">
          <span>মোট বিল:</span>
          <span style="font-family: var(--font-english);">৳ ${toBengaliDigits(subtotal)}</span>
        </div>
        ${discount > 0 ? `
        <div style="display: flex; justify-content: space-between;">
          <span>ছাড়/ডিসকাউন্ট:</span>
          <span style="font-family: var(--font-english);">- ৳ ${toBengaliDigits(discount)}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: bold; border-top: 2px double #000; padding-top: 6px; margin-top: 4px;">
          <span>পরিশোধযোগ্য:</span>
          <span style="font-family: var(--font-english);">৳ ${toBengaliDigits(netTotal)}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; border-top: 1px dashed #999; padding-top: 10px; font-size: 0.8rem; color: #555;">
        <p style="margin: 0; font-weight: 500;">ধন্যবাদ! আবার আসবেন।</p>
        <p style="margin: 3px 0 0 0; font-size: 0.7rem;">Powered by Dokandar App</p>
      </div>
    </div>
  `;
  
  // Enter receipt print mode
  document.body.classList.add("print-receipt-mode");
  
  // Set a listener to exit print-receipt-mode after printing
  const exitPrintMode = () => {
    document.body.classList.remove("print-receipt-mode");
    window.removeEventListener("afterprint", exitPrintMode);
  };
  window.addEventListener("afterprint", exitPrintMode);
  
  // Print
  setTimeout(() => {
    window.print();
  }, 100);
}

// Modal handling for Product Form
const productModal = document.getElementById("productModal");

function openAddModal() {
  if (isEditLocked) return;
  populateProductCategoryDropdown();
  document.getElementById("modalTitle").textContent = "নতুন পণ্য যোগ করুন";
  document.getElementById("productForm").reset();
  document.getElementById("editProductId").value = "";
  document.getElementById("prodCategory").value = "";
  document.getElementById("prodTags").value = "";
  document.getElementById("prodImage").value = "";
  
  document.getElementById("modalImagePreview").src = "";
  document.getElementById("modalImagePreview").style.display = "none";
  document.getElementById("imagePlaceholder").textContent = "📷";
  document.getElementById("imagePlaceholder").style.display = "flex";
  
  productModal.classList.add("active");
  document.getElementById("prodName").focus();
}

function openEditModal(id) {
  if (isEditLocked) return;
  populateProductCategoryDropdown();
  const p = products.find(prod => prod.id === id);
  if (!p) return;
  
  document.getElementById("modalTitle").textContent = "পণ্য সম্পাদন (এডিট)";
  document.getElementById("editProductId").value = p.id;
  document.getElementById("prodName").value = p.name;
  document.getElementById("prodCategory").value = p.category || "";
  document.getElementById("prodTags").value = p.tags || "";
  document.getElementById("prodImage").value = "";
  
  if (p.image) {
    document.getElementById("modalImagePreview").src = p.image;
    document.getElementById("modalImagePreview").style.display = "block";
    document.getElementById("imagePlaceholder").style.display = "none";
  } else {
    document.getElementById("modalImagePreview").src = "";
    document.getElementById("modalImagePreview").style.display = "none";
    document.getElementById("imagePlaceholder").textContent = "📷";
    document.getElementById("imagePlaceholder").style.display = "flex";
  }
  
  document.getElementById("prodBuyPrice").value = p.buyPrice || "";
  document.getElementById("prodSellPrice").value = p.sellPrice;
  document.getElementById("prodMinPrice").value = p.minPrice || "";
  
  productModal.classList.add("active");
  document.getElementById("prodName").focus();
}

function closeProductModal() {
  productModal.classList.remove("active");
}

// Handle Form Submit
function handleProductSubmit(e) {
  e.preventDefault();
  
  if (isEditLocked) {
    showToast("অ্যাপটি লক করা আছে! আগে লকটি খুলুন।", "error");
    closeProductModal();
    return;
  }
  
  const id = document.getElementById("editProductId").value;
  const name = document.getElementById("prodName").value.trim();
  const category = document.getElementById("prodCategory").value || "অন্যান্য";
  const tags = document.getElementById("prodTags").value.trim();
  const previewImg = document.getElementById("modalImagePreview");
  const image = (previewImg.style.display !== "none" && previewImg.src) ? previewImg.src : "";
  const buyPrice = parseFloat(document.getElementById("prodBuyPrice").value) || null;
  const sellPrice = parseFloat(document.getElementById("prodSellPrice").value);
  const minPrice = parseFloat(document.getElementById("prodMinPrice").value) || null;
  
  if (!name || isNaN(sellPrice)) {
    showToast("দয়া করে প্রয়োজনীয় তথ্য সঠিক নিয়মে দিন।", "error");
    return;
  }
  
  if (id) {
    // Edit Mode
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        name,
        category,
        tags,
        image,
        buyPrice,
        sellPrice,
        minPrice,
        updatedAt: new Date().toISOString()
      };
      showToast("পণ্যের দাম সফলভাবে আপডেট করা হয়েছে।", "success");
    }
  } else {
    // Add Mode
    const newProd = {
      id: Date.now().toString(),
      name,
      category,
      tags,
      image,
      buyPrice,
      sellPrice,
      minPrice,
      updatedAt: new Date().toISOString()
    };
    products.push(newProd);
    showToast("নতুন পণ্য সফলভাবে যোগ করা হয়েছে।", "success");
  }
  
  saveData();
  closeProductModal();
  renderProducts();
}

// Delete Product
function deleteProduct(id) {
  if (isEditLocked) return;
  
  const p = products.find(prod => prod.id === id);
  if (!p) return;
  
  const confirmDelete = confirm(`আপনি কি নিশ্চিতভাবে "${p.name}" দামের তালিকা থেকে মুছে ফেলতে চান?`);
  if (confirmDelete) {
    products = products.filter(prod => prod.id !== id);
    showToast("পণ্যটি তালিকা থেকে মুছে ফেলা হয়েছে।", "success");
    saveData();
    renderProducts();
  }
}

// Settings Modal Handling
const settingsModal = document.getElementById("settingsModal");

function openSettingsModal() {
  settingsModal.classList.add("active");
  renderSettingsCategories();
}

function closeSettingsModal() {
  settingsModal.classList.remove("active");
}

// Backup Export
function exportData() {
  if (products.length === 0) {
    showToast("কোনো প্রোডাক্ট ডাটা নেই ব্যাকআপ করার জন্য।", "error");
    return;
  }
  
  const dataStr = JSON.stringify(products, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const date = new Date().toISOString().slice(0, 10);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dokandar_backup_${date}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showToast("ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে।", "success");
}

// Backup Import
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        // Validate items loosely
        const isValid = imported.every(item => item.name && typeof item.sellPrice === 'number');
        if (isValid) {
          const confirmImport = confirm("আপনি কি নিশ্চিতভাবে নতুন ব্যাকআপটি ইমপোর্ট করতে চান? এর ফলে বর্তমান তালিকাটি প্রতিস্থাপিত হবে।");
          if (confirmImport) {
            products = imported.map(item => ({
              ...item,
              category: item.category || "অন্যান্য",
              tags: item.tags || "",
              image: item.image || ""
            }));
            
            // Scan for imported categories to dynamically register them
            imported.forEach(item => {
              if (item.category && !categories.includes(item.category)) {
                categories.push(item.category);
              }
            });
            
            saveData();
            renderProducts();
            closeSettingsModal();
            showToast("ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!", "success");
          }
        } else {
          showToast("ফাইলের ফরম্যাট সঠিক নয়।", "error");
        }
      } else {
        showToast("ফাইলের ডাটা সঠিক নয়।", "error");
      }
    } catch (err) {
      showToast("ফাইল পড়তে সমস্যা হয়েছে। সঠিক JSON ফাইল দিন।", "error");
    }
    // reset file input
    document.getElementById("importFileInput").value = "";
  };
  reader.readAsText(file);
}



// Toast Notifications System
function showToast(message, type = "success") {
  const container = document.getElementById("notificationContainer");
  if (!container) return;
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  let icon = "📢";
  if (type === "success") icon = "✅";
  if (type === "info") icon = "ℹ️";
  if (type === "error") icon = "⚠️";
  
  toast.innerHTML = `
    <span style="font-size: 1.1rem;">${icon}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Auto remove toast
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Normalize Bengali and English Digits for search matching
function normalizeSearchText(text) {
  if (!text) return "";
  const bengaliNumbers = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  
  let normalized = text.toLowerCase();
  for (let i = 0; i < 10; i++) {
    normalized = normalized.replaceAll(bengaliNumbers[i], englishNumbers[i]);
  }
  return normalized;
}

// Render Category Filter Chips Bar
function renderCategoryFilters() {
  const bar = document.getElementById("categoryFilterBar");
  if (!bar) return;
  
  bar.innerHTML = "";
  
  // Calculate counts
  const counts = { all: products.length };
  products.forEach(p => {
    const cat = p.category || "অন্যান্য";
    counts[cat] = (counts[cat] || 0) + 1;
  });
  
  // "সব পণ্য" chip
  const allChip = document.createElement("div");
  allChip.className = `category-chip ${activeCategory === "all" ? "active" : ""}`;
  allChip.onclick = () => {
    activeCategory = "all";
    renderCategoryFilters();
    renderProducts();
  };
  allChip.innerHTML = `সব পণ্য <span class="category-chip-count">${toBengaliDigits(counts.all)}</span>`;
  bar.appendChild(allChip);
  
  // Predefined categories
  categories.forEach(cat => {
    const count = counts[cat] || 0;
    const chip = document.createElement("div");
    chip.className = `category-chip ${activeCategory === cat ? "active" : ""}`;
    chip.onclick = () => {
      activeCategory = cat;
      renderCategoryFilters();
      renderProducts();
    };
    chip.innerHTML = `${cat} <span class="category-chip-count">${toBengaliDigits(count)}</span>`;
    bar.appendChild(chip);
  });
}

// Render categories list inside settings modal
function renderSettingsCategories() {
  const list = document.getElementById("settingsCategoriesList");
  if (!list) return;
  
  list.innerHTML = "";
  
  categories.forEach(cat => {
    const chip = document.createElement("div");
    chip.className = "settings-cat-chip";
    
    let deleteHtml = "";
    if (cat !== "অন্যান্য") {
      deleteHtml = `<span class="settings-cat-delete" onclick="deleteCategory('${cat}')" title="মুছে ফেলুন">&times;</span>`;
    }
    
    chip.innerHTML = `
      <span>${escapeHTML(cat)}</span>
      ${deleteHtml}
    `;
    list.appendChild(chip);
  });
}

// Add new custom category
function addNewCategory() {
  const input = document.getElementById("newCategoryInput");
  if (!input) return;
  
  const newCat = input.value.trim();
  if (!newCat) {
    showToast("ক্যাটাগরির নাম খালি হতে পারে না।", "error");
    return;
  }
  
  if (categories.includes(newCat)) {
    showToast("এই ক্যাটাগরি ইতিমধ্যে বিদ্যমান আছে।", "error");
    return;
  }
  
  categories.push(newCat);
  saveData();
  input.value = "";
  renderSettingsCategories();
  renderCategoryFilters();
  showToast(`"${newCat}" ক্যাটাগরি যোগ করা হয়েছে।`, "success");
}

// Delete custom category
function deleteCategory(catName) {
  if (catName === "অন্যান্য") return;
  
  const confirmDelete = confirm(`আপনি কি নিশ্চিতভাবে "${catName}" ক্যাটাগরি মুছে ফেলতে চান?\nএতে এই ক্যাটাগরির সকল পণ্য "অন্যান্য" ক্যাটাগরিতে চলে যাবে।`);
  if (confirmDelete) {
    // Filter categories
    categories = categories.filter(c => c !== catName);
    
    // Migrate items
    products.forEach(p => {
      if (p.category === catName) {
        p.category = "অন্যান্য";
      }
    });
    
    saveData();
    renderSettingsCategories();
    renderCategoryFilters();
    renderProducts();
    showToast(`"${catName}" ক্যাটাগরি মুছে ফেলা হয়েছে।`, "info");
  }
}

// Print price catalog formatted table
function printCatalog() {
  const printSection = document.getElementById("printSection");
  if (!printSection) return;
  
  const date = new Date().toLocaleDateString("bn-BD");
  const lockStatusText = isEditLocked ? "গ্রাহক মূল্য তালিকা" : "পূর্ণাঙ্গ দাম তালিকা (গোপন)";
  
  let tableHeaders = "";
  if (isEditLocked) {
    tableHeaders = `
      <th>ক্রমিক</th>
      <th>পণ্যের নাম</th>
      <th>ক্যাটাগরি</th>
      <th style="text-align: right;">বিক্রয় মূল্য</th>
    `;
  } else {
    tableHeaders = `
      <th>ক্রমিক</th>
      <th>পণ্যের নাম</th>
      <th>ক্যাটাগরি</th>
      <th style="text-align: right;">ক্রয় মূল্য</th>
      <th style="text-align: right;">বিক্রয় মূল্য</th>
      <th style="text-align: right;">সর্বনিম্ন মূল্য</th>
    `;
  }
  
  // Get currently filtered and matching products
  const searchTerms = currentSearchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let filtered = products.filter(p => {
    // Filter by category
    if (activeCategory !== "all" && (p.category || "অন্যান্য") !== activeCategory) {
      return false;
    }
    
    // Filter by search terms
    if (searchTerms.length === 0) return true;
    
    const searchString = [
      p.name,
      p.category || "অন্যান্য",
      p.tags || "",
      p.buyPrice ? p.buyPrice.toString() : "",
      p.sellPrice ? p.sellPrice.toString() : "",
      p.minPrice ? p.minPrice.toString() : "",
      p.buyPrice ? toBengaliDigits(p.buyPrice) : "",
      p.sellPrice ? toBengaliDigits(p.sellPrice) : "",
      p.minPrice ? toBengaliDigits(p.minPrice) : ""
    ].join(" ");
    
    const normalizedSearchString = normalizeSearchText(searchString);
    return searchTerms.every(term => {
      return normalizedSearchString.includes(normalizeSearchText(term));
    });
  });
  
  filtered.sort((a, b) => a.name.localeCompare(b.name, "bn-BD"));
  
  let rowsHtml = "";
  filtered.forEach((p, idx) => {
    const buyVal = p.buyPrice ? `৳ ${toBengaliDigits(p.buyPrice)}` : "—";
    const sellVal = `৳ ${toBengaliDigits(p.sellPrice)}`;
    const minVal = p.minPrice ? `৳ ${toBengaliDigits(p.minPrice)}` : "—";
    
    if (isEditLocked) {
      rowsHtml += `
        <tr>
          <td>${toBengaliDigits(idx + 1)}</td>
          <td><strong>${escapeHTML(p.name)}</strong></td>
          <td>${escapeHTML(p.category || "অন্যান্য")}</td>
          <td class="price">${sellVal}</td>
        </tr>
      `;
    } else {
      rowsHtml += `
        <tr>
          <td>${toBengaliDigits(idx + 1)}</td>
          <td><strong>${escapeHTML(p.name)}</strong></td>
          <td>${escapeHTML(p.category || "অন্যান্য")}</td>
          <td class="price">${buyVal}</td>
          <td class="price" style="color: #059669;">${sellVal}</td>
          <td class="price" style="color: #d97706;">${minVal}</td>
        </tr>
      `;
    }
  });
  
  if (filtered.length === 0) {
    rowsHtml = `<tr><td colspan="${isEditLocked ? 4 : 6}" style="text-align: center;">কোনো পণ্য পাওয়া যায়নি।</td></tr>`;
  }
  
  printSection.innerHTML = `
    <div class="print-header">
      <h1>দোকানদার দাম তালিকা</h1>
      <p>শ্রেণী: ${activeCategory === "all" ? "সব পণ্য" : activeCategory} | ধরন: ${lockStatusText} | তারিখ: ${date}</p>
    </div>
    <table class="print-table">
      <thead>
        <tr>
          ${tableHeaders}
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;
  
  window.print();
}
