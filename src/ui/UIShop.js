import { ShopConfig } from "../configs/ShopConfig.js";
import { GameEvents } from "../utils/Constants.js";

export class UIShop {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.page = document.getElementById("shop");
    this.displayPage = "";
    this.elements = {
      backBtn: document.getElementById("shop-back"),
      balance: document.getElementById("coins"),
      categoryButtons: {
        faces: document.getElementById("face-btn"),
        backs: document.getElementById("shirt-btn"),
        backgrounds: document.getElementById("fon-btn"),
      },
      containers: {
        faces: document.getElementById("face-container"),
        backs: document.getElementById("shirt-container"),
        backgrounds: document.getElementById("fon-container"),
      },
      // itemsContainer: document.getElementById("shop-items-container"),
      itemsContainer: document.getElementById("all-items-container"),
    };

    this.init();
  }

  init() {
    this.getDisplayPage();
    this.setupEventListeners();
    // this.render();
  }

  getDisplayPage() {
    const computedStyle = window.getComputedStyle(this.page);
    this.displayPage = computedStyle.display;
  }

  setupEventListeners() {
    this.elements.backBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.UIMENUPAGE_SHOW, this);
    });

    Object.entries(this.elements.categoryButtons).forEach(([category, btn]) => {
      btn.addEventListener("click", () => {
        console.log("category:", typeof category);
        this.eventManager.emit(GameEvents.SHOP_CATEGORY_CHANGE, category);
        this.render(this.stateManager.state.shop, ShopConfig);
      });
    });

    // this.eventManager.on("shop:render", (shopState) => this.render(shopState));
    this.eventManager.on(GameEvents.SHOP_RENDER, (shopState, config) =>
      this.render(shopState, config)
    );
    this.eventManager.on("shop:balance:update", (balance) =>
      this.updateBalance(balance)
    );
  }

  render(shopState, shopConfig) {
    // Очищаем контейнер
    this.elements.itemsContainer.innerHTML = "";

    // Устанавливаем активную категорию
    this.setActiveCategory(shopState.currentCategory);

    // Рендерим предметы текущей категории
    const items = shopConfig.items.filter(
      (item) =>
        item.category === this.getTypeForCategory(shopState.currentCategory)
    );

    items.forEach((item) => {
      this.elements.itemsContainer.append(this.createShopItemElement(item));
    });

    // Обновляем баланс
    this.updateBalance(this.stateManager.state.player.coins);
  }

  createShopItemElement(item) {
    const containerElement = document.createElement("div");
    containerElement.className = "item-container";

    const itemElement = document.createElement("div");
    itemElement.className = `shop-item ${item.owned ? "owned" : ""}`;
    const itemHead = document.createElement("div");
    const itemName = document.createElement("h3");
    const itemDescription = document.createElement("p");
    const shopItemContainer = document.createElement("div");
    const shopItem = document.createElement("div");
    itemHead.classList.add("item-head");
    shopItemContainer.classList.add("shop-item-container");
    itemName.textContent = item.name;
    itemDescription.textContent = item.description;
    itemHead.append(itemName, itemDescription);
    if (item.category === "cardFace" || item.category === "cardBack") {
      const shopItem2 = document.createElement("div");
      shopItem.classList.add("shop-item-card");
      shopItem2.classList.add("shop-item-card");
      // Применяем стили сразу
      if (item.styles) {
        Object.assign(shopItem.style, item.styles);
        Object.assign(shopItem2.style, item.styles);
      }
      shopItemContainer.append(shopItem, shopItem2);
      if (item.category === "cardFace") {
        const topSymbolA = document.createElement("span");
        topSymbolA.className = "shop-card-top-left value-red";
        topSymbolA.textContent = "A♥";

        const centerSymbolA = document.createElement("span");
        centerSymbolA.className = "shop-card-center value-red";
        centerSymbolA.textContent = "♥";

        const bottomSymbolA = document.createElement("span");
        bottomSymbolA.className = "shop-card-bottom-right value-red";
        bottomSymbolA.textContent = "A♥";

        const topSymbolK = document.createElement("span");
        topSymbolK.className = "shop-card-top-left value-black";
        topSymbolK.textContent = "K♥";

        const centerSymbolK = document.createElement("span");
        centerSymbolK.className = "shop-card-center value-black";
        centerSymbolK.textContent = "♥";

        const bottomSymbolK = document.createElement("span");
        bottomSymbolK.className = "shop-card-bottom-right value-black";
        bottomSymbolK.textContent = "K♥";

        shopItem2.append(topSymbolK, centerSymbolK, bottomSymbolK);
        shopItem.append(topSymbolA, centerSymbolA, bottomSymbolA);
      }
    } else if (item.category === "background") {
      shopItem.classList.add("shop-item-fon");
      if (item.styles) Object.assign(shopItem.style, item.styles);
      else {
        const img = document.createElement("img");
        img.src = item.previewImage;
        shopItem.append(img);
      }
    }
    shopItemContainer.append(shopItem);
    const btn = document.createElement("button");
    btn.classList.add("shop-action-btn");
    btn.textContent = `${item.owned ? "Применить" : `Купить (${item.price})`}`;
    itemElement.append(itemHead, shopItemContainer, btn);
    containerElement.appendChild(itemElement);

    const button = itemElement.querySelector(".shop-action-btn");
    button.addEventListener("click", () => {
      if (item.owned) {
        this.eventManager.emit("shop:item:select", item.id);
      } else {
        this.eventManager.emit("shop:item:purchase", item.id);
      }
    });

    return containerElement;
  }
  // itemElement.innerHTML = `
  // <div class="item-head">
  //   <h3>${item.name}</h3>
  //   <p>${item.description}</p>
  // </div>
  // <div class="shop-item-container">
  //   <div
  //       class="shop-card"
  //       data-suit="♥"
  //       data-value="A"
  //       data-color="red"
  //   >
  //     <span class="shop-card-top-left value-red">A♥</span>
  //     <span class="shop-card-center value-red">♥</span>
  //     <span class="shop-card-bottom-right value-red">A♥</span>
  //   </div>
  //   <div
  //       class="shop-card"
  //       data-suit="♣"
  //       data-value="K"
  //       data-color="black"
  //   >
  //     <span class="shop-card-top-left value-black">K♣</span>
  //     <span class="shop-card-center value-black">♣</span>
  //     <span class="shop-card-bottom-right value-black">K♣</span>
  //   </div>
  // </div>
  // <button class="shop-action-btn"
  // data-id="${item.id}"
  // data-price="${item.price}">
  // ${item.owned ? "Применить" : `Купить (${item.price})`}
  // </button>
  // `;

  setActiveCategory(category) {
    // Обновляем кнопки
    Object.values(this.elements.categoryButtons).forEach((btn) => {
      btn.classList.remove("active-shop-btn");
    });
    this.elements.categoryButtons[category].classList.add("active-shop-btn");

    // Обновляем контейнеры
    Object.values(this.elements.containers).forEach((container) => {
      container.style.display = "none";
    });
    this.elements.containers[category].style.display = "block";
  }

  updateBalance(balance) {
    this.elements.balance.textContent = balance;
  }

  getTypeForCategory(category) {
    const mapping = {
      faces: "cardFace",
      backs: "cardBack",
      backgrounds: "background",
    };
    return mapping[category];
  }

  show() {
    this.render(this.stateManager.state.shop, ShopConfig);
    this.page.classList.remove("hidden");
    // Animator.fadeIn(this.page);
  }

  hide() {
    // Animator.fadeOut(this.page).then(() => {
    this.page.classList.add("hidden");
    // });
  }
}
