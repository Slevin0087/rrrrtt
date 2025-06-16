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
    this.eventManager.on(GameEvents.SHOP_BALANCE_UPDATE, (balance) =>
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

    items.forEach((item, index) => {
      this.elements.itemsContainer.append(
        this.createShopItemElement(item, index)
      );
    });

    // Обновляем баланс
    this.updateBalance(this.stateManager.state.player.coins);
  }

  createShopItemElement(item, index) {
    const containerElement = document.createElement("div");
    const selectedItems = this.stateManager.state.player.selectedItems;

    console.log("selectedItems:", selectedItems);
    console.log("item.type:", item.type);

    const selectedItem = selectedItems[item.type];
    const isOwned = item.id === selectedItem.id;
    const purchasedItems = this.stateManager.state.player.purchasedItems;
    const purchasedItem = purchasedItems[item.type];
    const isItemBuy = purchasedItem.ids.includes(item.id);

    containerElement.className = `item-container ${isOwned ? "owned" : ""}`;
    const itemElement = document.createElement("div");
    // Действия с найденным элементом
    console.log("Найден выбранный элемент:", selectedItem);

    itemElement.className = "shop-item";
    itemElement.id = `shop-item-${index}`;
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
      else if (item.previewImage) {
        const img = document.createElement("img");
        img.src = item.previewImage;
        shopItem.append(img);
      }
    }
    shopItemContainer.append(shopItem);

    const circle = this.createCircle(index);
    const btnOrCircle = this.createBtn(item, index, isOwned, isItemBuy);

    itemElement.append(itemHead, shopItemContainer, btnOrCircle, circle);
    containerElement.append(itemElement);
    if (isOwned) {
      circle.classList.remove("hidden");
      btnOrCircle.classList.add("hidden");
    } else if (!isOwned && !isItemBuy) {
      btnOrCircle.classList.remove("hidden");
      circle.classList.add("hidden");
    } else if (isItemBuy && !isOwned) {
      circle.classList.add("hidden");
      btnOrCircle.classList.remove("hidden");
    }
    return containerElement;
  }

  createCircle(index) {
    const checkmarkCircle = document.createElement("div");
    checkmarkCircle.id = `checkmarkCircle-${index}`;
    const checkmark = document.createElement("div");
    checkmarkCircle.classList.add("checkmark-circle");
    checkmark.classList.add("checkmark");
    checkmarkCircle.append(checkmark);
    return checkmarkCircle;
  }

  createBtn(item, index, isOwned, isItemBuy) {
    const btn = document.createElement("button");
    btn.classList.add("shop-action-btn");
    btn.id = `btn-buy-${index}`;
    if (!isOwned && !isItemBuy) {
      btn.textContent = `Купить (${item.price})`;
    } else if (isItemBuy) btn.textContent = "Применить";

    btn.addEventListener("click", (e) =>
      this.handleBtnClick(item, isOwned, isItemBuy)
    );

    return btn;
  }

  handleBtnClick(item, isOwned, isItemBuy) {
    console.log("КЛИК ПО КНОПКЕ:", item.owned);
    if (isItemBuy && !isOwned) {
        this.eventManager.emit(GameEvents.SET_SELECTED_ITEMS, item);
        this.eventManager.emit(GameEvents.RENDER_CARDS);
      this.render(this.stateManager.state.shop, ShopConfig);
    } else if (!isItemBuy && !isOwned) {      
      this.eventManager.emit(GameEvents.SHOP_ITEM_PURCHASE, item);
      console.log("В ELSE");
      this.render(this.stateManager.state.shop, ShopConfig);
    }
  }

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
