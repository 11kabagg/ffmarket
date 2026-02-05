// =====================
// НАСТРОЙКА
// =====================

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbweYwY_vGIO0NFcHfrKCBVGcCf4_Pxbfhr693GX7IuyHmxxSq69aee-UFEuxwFDmsVE/exec";

const PRODUCTS = [
  { id: "doctorliwsy", category: "kits", name: 'Набор Ливси', price: "N/A", tag: "Наборы", desc: "Уникальный набор игрока _DoktorLiwsi_ содержащий в себе: <mark> 1 Подзорная труба, 1 Кожаный зеленый нагрудник, 1 Кожаный ремень, 6 Зубов, 3 Вагонетки, 1 Ром, 1 Мангровое бревно" },
  { id: "begimotik", category: "kits", name: 'Набор Бегемотика', price: "N/A", tag: "Наборы", desc: "Уникальный набор игрока begimotik содержащий в себе: <mark> 3 Золотых морковки, 1 Егермейстер, 1 Палка Хуялка, 1 Тыквенная голова, 1 Тотем бессмертия" },
  { id: "kit_pvdd", category: "kits", name: 'N/A', price: "N/A", tag: "Наборы", desc: "N/A" },
  

  { id: "myres", category: "resources", name: "Свои ресурсы", price: "N/A", tag: "Ресурсы", desc: "Вы хотите того, чего нету в нашем каталоге? Хорошо! Создайте заявку с этой карточкой, и мы свяжемся с вами в Дискорде." },
  { id: "res_food", category: "resources", name: "N/A", price: "N/A", tag: "Ресурсы", desc: "N/A" },
  { id: "res_ААА", category: "resources", name: "N/A", price: "N/A", tag: "Ресурсы", desc: "N/A" },

  { id: "arts", category: "arts", name: "test", price: "N/A", tag: "Арты", desc: "N/A", img: "./assets/arts/liwsi.png" },
];

// =====================
// DOM
// =====================
const productGrid = document.getElementById("productGrid");

const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const cartList = document.getElementById("cartList");
const cartEmpty = document.getElementById("cartEmpty");
const clearCartBtn = document.getElementById("clearCart");

const orderForm = document.getElementById("orderForm");
const nickEl = document.getElementById("nick");
const itemsEl = document.getElementById("items");
const pvzEl = document.getElementById("pvz");
const discordEl = document.getElementById("discord");
const payEl = document.getElementById("pay");
const outputEl = document.getElementById("output");
const statusLine = document.getElementById("statusLine");
const submitBtn = document.getElementById("submitBtn");

document.getElementById("year").textContent = String(new Date().getFullYear());

// =====================
// TYPING HEADER
// =====================
(function typeHeader(){
  const el = document.getElementById("typeTitle");
  if (!el) return;

  const text = "FFMarket";
  let i = 0;
  let deleting = false;

  const typeSpeed = 90;
  const deleteSpeed = 55;
  const pauseAtEnd = 900;
  const pauseAtStart = 450;

  function tick(){
    if (!deleting) {
      i++;
      el.textContent = text.slice(0, i);
      if (i >= text.length) {
        deleting = true;
        return setTimeout(tick, pauseAtEnd);
      }
      return setTimeout(tick, typeSpeed);
    } else {
      i--;
      el.textContent = text.slice(0, i);
      if (i <= 0) {
        deleting = false;
        return setTimeout(tick, pauseAtStart);
      }
      return setTimeout(tick, deleteSpeed);
    }
  }

  tick();
})();

// =====================
// CART (productId -> qty)
// =====================
const cart = new Map();
let activeFilter = "all";

function findProduct(productId) {
  return PRODUCTS.find(p => p.id === productId);
}

function totalCount() {
  let sum = 0;
  for (const qty of cart.values()) sum += qty;
  return sum;
}

function cartToLines() {
  const lines = [];
  for (const [productId, qty] of cart.entries()) {
    const p = findProduct(productId);
    if (!p) continue;
    lines.push(qty > 1 ? `- ${p.name} x${qty}` : `- ${p.name}`);
  }
  return lines;
}

function addToCart(productId) {
  cart.set(productId, (cart.get(productId) || 0) + 1);
  renderCart();
}

function removeOne(productId) {
  const current = cart.get(productId) || 0;
  if (current <= 1) cart.delete(productId);
  else cart.set(productId, current - 1);
  renderCart();
}

function clearCart() {
  cart.clear();
  renderCart();
}

// =====================
// RENDER PRODUCTS
// =====================
function renderProducts() {
  productGrid.innerHTML = "";

  const list = PRODUCTS.filter(p => activeFilter === "all" ? true : p.category === activeFilter);

  for (const p of list) {
    const card = document.createElement("article");
    card.className = "product";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

card.innerHTML = `
  ${p.img ? `<img src="${p.img}" alt="${p.name}" class="product__img">` : ""}

  <div class="product__top">
    <div class="pill">${p.tag}</div>
    <div class="price">${p.price}</div>
  </div>

  <h3>${p.name}</h3>
  <p class="muted">${p.desc}</p>
`;

card.addEventListener("mousemove", (e) => {
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - r.left - r.width/2}px`);
  card.style.setProperty("--my", `${e.clientY - r.top - r.height/2}px`);
});



    const handleAdd = () => addToCart(p.id);

    card.addEventListener("click", handleAdd);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleAdd();
      }
    });

    productGrid.appendChild(card);
  }
}

// =====================
// RENDER CART
// =====================
function renderCart() {
  const count = totalCount();
  cartCount.textContent = String(count);

  cartList.innerHTML = "";

  if (count === 0) {
    cartEmpty.style.display = "block";
    itemsEl.value = "";
    return;
  }

  cartEmpty.style.display = "none";

  for (const [productId, qty] of cart.entries()) {
    const p = findProduct(productId);
    if (!p) continue;

    const li = document.createElement("li");
    li.className = "cart__item";

    li.innerHTML = `
      <div class="cart__itemTitle">${p.name}</div>
      <div class="cart__itemRight">
        <div class="qty" title="Количество">${qty}</div>
        <button class="removeBtn" type="button" title="Убрать 1">✖</button>
      </div>
    `;

    li.querySelector(".removeBtn").addEventListener("click", () => removeOne(productId));
    cartList.appendChild(li);
  }

  itemsEl.value = cartToLines().join("\n");
}

// =====================
// FILTER BUTTONS
// =====================
document.querySelectorAll("[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    activeFilter = btn.getAttribute("data-filter");
    renderProducts();
  });
});

// =====================
// UI BUTTONS
// =====================
clearCartBtn.addEventListener("click", clearCart);

cartBtn.addEventListener("click", () => {
  document.getElementById("order").scrollIntoView({ behavior: "smooth" });
});

// =====================
// SEND TO SHEETS
// =====================
async function sendToSheets(payload) {
  if (!SHEETS_URL || SHEETS_URL.includes("PASTE_YOUR")) {
    throw new Error("SHEETS_URL not set");
  }

  // no-cors: браузер не даст прочитать ответ, но запрос дойдёт до Apps Script
  await fetch(SHEETS_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// =====================
// SUBMIT
// =====================
orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  statusLine.textContent = "";
  outputEl.hidden = true;

  const nick = nickEl.value.trim();
  const pvz = pvzEl.value.trim();
  const discord = discordEl.value.trim();
  const pay = payEl.value;

  const itemsLines = cartToLines();
  const itemsText = itemsLines.length ? itemsLines.join("\n") : "";

  if (!nick) return alert("Введите ник на сервере!");
  if (itemsLines.length === 0) return alert("Добавьте товары в корзину!");
  if (!pvz) return alert("Укажите ПВЗ!");
  if (!discord) return alert("Укажите Discord!");
  if (!pay) return alert("Выберите оплату!");

  const payload = { nick, items: itemsText, pvz, discord, pay };

  submitBtn.disabled = true;
  statusLine.textContent = "Отправляю заявку…";

  try {
    await sendToSheets(payload);

    statusLine.textContent = "Заявка отправлена ✅ Ожидай ответа в Дискорд.";
    outputEl.hidden = false;
    outputEl.textContent =
`🛒 Заявка FFShop
👤 Ник: ${nick}
📦 Заказ:
${itemsText}

📍 ПВЗ: ${pvz}
💬 Discord: ${discord}
💳 Оплата: ${pay}`;

    clearCart();

  } catch (err) {
    console.error(err);
    statusLine.textContent = "Ошибка ❌ Проверь SHEETS_URL и доступ Web App";
    alert("Не удалось отправить ❌");
  } finally {
    submitBtn.disabled = false;
  }
});

// =====================
// START
// =====================
renderProducts();
renderCart();