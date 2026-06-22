// Global State
let products = [];
let isEditLocked = true;
let currentSearchQuery = "";

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
  { id: "1", name: "রূপচাঁদা সয়াবিন তেল ৫ লিটার", buyPrice: 790, sellPrice: 835, minPrice: 825, updatedAt: new Date().toISOString() },
  { id: "2", name: "দেশী মসুর ডাল ১ কেজি", buyPrice: 122, sellPrice: 135, minPrice: 130 },
  { id: "3", name: "মিনিকেট চাল ৫০ কেজি (বস্তা)", buyPrice: 3150, sellPrice: 3380, minPrice: 3320 },
  { id: "4", name: "তীর আটা ২ কেজি", buyPrice: 94, sellPrice: 110, minPrice: 108 },
  { id: "5", name: "ফ্রেশ সাদা চিনি ১ কেজি", buyPrice: 126, sellPrice: 135, minPrice: 132 },
  { id: "6", name: "এসিআই আয়োডিনযুক্ত লবণ ১ কেজি", buyPrice: 32, sellPrice: 42, minPrice: 40 },
  { id: "7", name: "ডিপ্লোমা ফুল ক্রিম গুঁড়ো দুধ ৫০০ গ্রাম", buyPrice: 415, sellPrice: 450, minPrice: 440 },
  { id: "8", name: "লাইফবয় সাবান ৭৫ গ্রাম", buyPrice: 42, sellPrice: 50, minPrice: 48 },
  { id: "9", name: "ইস্পাহানি মির্জাপুর চা পাতা ৪০০ গ্রাম", buyPrice: 182, sellPrice: 215, minPrice: 208 },
  { id: "10", name: "দেশী পেঁয়াজ ১ কেজি", buyPrice: 65, sellPrice: 80, minPrice: 75 },
  { id: "11", name: "লাল আলু ১ কেজি", buyPrice: 40, sellPrice: 50, minPrice: 48 },
  { id: "12", name: "দেশী রসুন ১ কেজি", buyPrice: 180, sellPrice: 220, minPrice: 200 },
  { id: "13", name: "লাক্স সাবান ১০০ গ্রাম", buyPrice: 62, sellPrice: 75, minPrice: 70 },
  { id: "14", name: "প্যারাসুট নারিকেল তেল ২০০ মিলি", buyPrice: 125, sellPrice: 145, minPrice: 140 },
  { id: "15", name: "প্রাণ নুডলস ৮ প্যাক", buyPrice: 140, sellPrice: 160, minPrice: 155 }
];

// Initialize Application
window.addEventListener("DOMContentLoaded", () => {
  loadData();
  applyLockState();
  updateStats();
  renderProducts();
});

// Load Data from LocalStorage
function loadData() {
  const stored = localStorage.getItem("dokandar_catalog_products");
  if (stored) {
    try {
      products = JSON.parse(stored);
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
  localStorage.setItem("dokandar_catalog_last_updated", new Date().toISOString());
  updateStats();
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
    document.body.classList.remove("app-locked-state");
    document.body.classList.add("app-unlocked-state");
    
    lockContainer.classList.remove("locked");
    lockContainer.classList.add("unlocked");
    lockText.textContent = "আনলকড (সম্পাদনাযোগ্য)";
    lockIcon.innerHTML = UNLOCKED_SVG;
    
    addProductBtn.disabled = false;
    unlockWarning.style.display = "flex";
  }
  
  // Re-render to update the display of Edit/Delete buttons on card hover/states
  renderProducts();
}

// Render Products list based on search filters
function renderProducts() {
  const container = document.getElementById("productList");
  if (!container) return;
  
  container.innerHTML = "";
  
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(currentSearchQuery.toLowerCase())
  );
  
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
    
    // Create prices display
    const formattedBuy = p.buyPrice ? `৳ ${toBengaliDigits(p.buyPrice)}` : "—";
    const formattedSell = `৳ ${toBengaliDigits(p.sellPrice)}`;
    const formattedMin = p.minPrice ? `৳ ${toBengaliDigits(p.minPrice)}` : "—";
    
    // Actions HTML depending on lock state
    let actionsHtml = "";
    if (!isEditLocked) {
      actionsHtml = `
        <div class="product-actions">
          <button class="action-btn edit" onclick="openEditModal('${p.id}')" title="এডিট করুন">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-btn delete" onclick="deleteProduct('${p.id}')" title="মুছে ফেলুন">
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
    
    card.innerHTML = `
      <div class="product-header">
        <h3 class="product-title">${escapeHTML(p.name)}</h3>
        ${actionsHtml}
      </div>
      <div class="prices-grid">
        <div class="price-item buy">
          <span class="price-label">ক্রয় মূল্য</span>
          <span class="price-value">${formattedBuy}</span>
        </div>
        <div class="price-item sell">
          <span class="price-label">সাধারণ বিক্রয়</span>
          <span class="price-value">${formattedSell}</span>
        </div>
        <div class="price-item min">
          <span class="price-label">সর্বনিম্ন মূল্য</span>
          <span class="price-value">${formattedMin}</span>
        </div>
      </div>
    `;
    
    // Add touch capability for mobile hover action
    if (!isEditLocked) {
      card.addEventListener("click", () => {
        // Toggle action buttons visibility on mobile touch
        document.querySelectorAll(".product-card").forEach(c => {
          if (c !== card) c.classList.remove("actions-visible");
        });
        card.classList.toggle("actions-visible");
      });
    }
    
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

// Modal handling for Product Form
const productModal = document.getElementById("productModal");

function openAddModal() {
  if (isEditLocked) return;
  document.getElementById("modalTitle").textContent = "নতুন পণ্য যোগ করুন";
  document.getElementById("productForm").reset();
  document.getElementById("editProductId").value = "";
  productModal.classList.add("active");
  document.getElementById("prodName").focus();
}

function openEditModal(id) {
  if (isEditLocked) return;
  const p = products.find(prod => prod.id === id);
  if (!p) return;
  
  document.getElementById("modalTitle").textContent = "পণ্য সম্পাদন (এডিট)";
  document.getElementById("editProductId").value = p.id;
  document.getElementById("prodName").value = p.name;
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
            products = imported;
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

// Reset dummy data
function resetToDemoData() {
  const confirmReset = confirm("আপনি কি ডামি পণ্য লোড করতে চান? এর ফলে বর্তমান কাস্টম তালিকা মুছে যাবে।");
  if (confirmReset) {
    products = [...DUMMY_PRODUCTS];
    saveData();
    renderProducts();
    closeSettingsModal();
    showToast("ডামি পণ্য সফলভাবে রিস্টোর করা হয়েছে।", "success");
  }
}

// Clear all data
function clearAllData() {
  const confirmClear = confirm("সাবধান! আপনি কি নিশ্চিতভাবে সব প্রোডাক্টের তথ্য মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।");
  if (confirmClear) {
    products = [];
    saveData();
    renderProducts();
    closeSettingsModal();
    showToast("সব প্রোডাক্ট মুছে ফেলা হয়েছে।", "info");
  }
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
