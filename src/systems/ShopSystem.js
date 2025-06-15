import { Storage } from "../utils/Storage.js";
// import { Validator } from "../utils/Validator.js";
import { ShopConfig } from "../configs/ShopConfig.js";
import { GameEvents } from "../utils/Constants.js";

export class ShopSystem {
  constructor(eventManager, stateManager) {
    this.stateManager = stateManager;
    this.eventManager = eventManager;
    this.storage = new Storage();
    // this.validator = new Validator();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadShopItems();
  }

  setupEventListeners() {
    this.eventManager.on("shop:item:select", (itemId) =>
      this.handleItemSelect(itemId)
    );
    this.eventManager.on("shop:item:purchase", (itemId) => this.purchaseItem(itemId));
  }

  loadShopItems() {
    const items = this.storage.getShopItems();
    const purchasedItems = this.storage.getPurchasedItems();

    this.stateManager.shop = {
      items: items.map((item) => ({
        ...item,
        owned: purchasedItems.includes(item.id),
      })),
      currentCategory: "cardFaces",
      balance: this.storage.getCoins(),
    };
  }

  handleItemSelect(itemId) {
    const item = this.stateManager.shop.items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.owned) {
      this.applyItem(item);
      this.eventManager.emit("ui:notification", `Стиль "${item.name}" применен`);
    } else {
      this.eventManager.emit("shop:item:preview", item);
    }
  }

  purchaseItem(itemId) {
    const item = this.stateManager.shop.items.find((i) => i.id === itemId);
    if (!item || item.owned) return;

    if (this.stateManager.shop.balance >= item.price) {
      this.stateManager.shop.balance -= item.price;
      item.owned = true;

      this.storage.saveCoins(this.stateManager.shop.balance);
      this.storage.addPurchasedItem(itemId);

      this.applyItem(item);
      this.eventManager.emit(
        "ui:notification",
        `Стиль "${item.name}" куплен и применен`
      );
    } else {
      this.eventManager.emit("ui:notification", "Недостаточно монет", "error");
    }
  }

  applyItem(item) {
    switch (item.type) {
      case "cardFace":
        this.stateManager.state.settings.cardFaceStyle = item.styleClass;
        break;
      case "cardBack":
        this.stateManager.state.settings.cardBackStyle = item.styleClass;
        break;
      case "background":
        this.stateManager.state.settings.backgroundImage = item.imageUrl;
        break;
    }

    this.storage.saveGameSettings(this.stateManager.state.settings);
    this.eventManager.emit("game:settings:update", this.stateManager.state.settings);
  }

  changeCategory(category, shopConfig) {
    this.eventManager.emit(GameEvents.SHOP_RENDER, category, shopConfig);
  }

  addCoins(amount) {
    if (!this.validator.isPositiveNumber(amount)) return;

    this.stateManager.shop.balance += amount;
    this.storage.saveCoins(this.stateManager.shop.balance);
    this.eventManager.emit("shop:balance:update", this.stateManager.shop.balance);
  }
}
