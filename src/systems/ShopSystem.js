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
    console.log("ЫРЩЗЫНЫЕУЬ ШТШЕ");
  }

  setupEventListeners() {
    this.eventManager.on("shop:item:select", (itemId) =>
      this.handleItemSelect(itemId)
    );
    // this.eventManager.on(GameEvents.SHOP_ITEM_PURCHASE, (itemId) =>
    //   this.purchaseItem(itemId)
    // );
    this.eventManager.on(GameEvents.SHOP_ITEM_PURCHASE, (item) =>
      this.purchaseItem(item)
    );
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
      this.eventManager.emit(
        "ui:notification",
        `Стиль "${item.name}" применен`
      );
    } else {
      this.eventManager.emit("shop:item:preview", item);
    }
  }

  // purchaseItem(itemId) {
  //   console.log("в purchaseItem:", itemId);

  //   // const item = this.stateManager.shop.items.find((i) => i.id === itemId);
  //   const item = ShopConfig.items.find((i) => i.id === itemId);
  //   console.log("item:", item);

  //   if (!item || item.owned) return;
  //   console.log(
  //     "в purchaseItem this.stateManager.shop.balance:",
  //     this.stateManager.shop.balance
  //   );
  //   if (this.stateManager.shop.balance >= item.price) {
  //     this.stateManager.shop.balance -= item.price;
  //     item.owned = true;

  //     // this.storage.saveCoins(this.stateManager.shop.balance);
  //     // this.storage.addPurchasedItem(itemId);

  //     this.applyItem(item);
  //     this.eventManager.emit(
  //       GameEvents.UI_NOTIFICATION,
  //       `Стиль "${item.name}" куплен и применен`
  //     );
  //   } else {
  //     this.eventManager.emit(
  //       GameEvents.UI_NOTIFICATION,
  //       "Недостаточно хусынок"
  //     );
  //   }
  // }

    purchaseItem(item) {
    console.log("в purchaseItem:", item);

    // const item = this.stateManager.shop.items.find((i) => i.id === itemId);
    // const item = ShopConfig.items.find((i) => i.id === itemId);
    // console.log("item:", item);

    if (!item || item.owned) return;
    console.log(
      "в purchaseItem this.stateManager.shop.balance:",
      this.stateManager
    );
    if (this.stateManager.state.shop.balance >= item.price) {
      this.stateManager.state.shop.balance -= item.price;
      item.owned = true;

      // this.storage.saveCoins(this.stateManager.state.shop.balance);
      // this.storage.addPurchasedItem(itemId);

      this.applyItem(item);
      this.eventManager.emit(
        GameEvents.UI_NOTIFICATION,
        `Стиль "${item.name}" куплен и применен`
      );
    } else {
      this.eventManager.emit(
        GameEvents.UI_NOTIFICATION,
        "Недостаточно хусынок"
      );
    }
  }

  // applyItem(item) {
  //   switch (item.type) {
  //     case "cardFace":
  //       this.stateManager.state.shop.cardFaceStyle = item.styleClass;
  //     this.stateManager.state.shop.selectedItems.
  //       break;
  //     case "cardBack":
  //       this.stateManager.state.settings.cardBackStyle = item.styleClass;
  //       break;
  //     case "background":
  //       this.stateManager.state.settings.backgroundImage = item.imageUrl;
  //       break;
  //   }

  //   // this.storage.saveGameSettings(this.stateManager.state.settings);
  //   this.eventManager.emit(
  //     "game:settings:update",
  //     this.stateManager.state.settings
  //   );
  // }

    applyItem(item) {
    switch (item.type) {
      case "faces":
        this.stateManager.state.shop.cardFaceStyle = item.styleClass;
      this.stateManager.state.shop.selectedItems.cardFace = item;
        break;
      case "backs":
        this.stateManager.state.shop.selectedItems.cardBack = item;
        break;
      case "backgrounds":
        this.stateManager.state.shop.selectedItems.background = item;
        break;
    }

    // this.storage.saveGameSettings(this.stateManager.state.settings);
    this.eventManager.emit(GameEvents.SET_SHOP_STATS);
  }

  changeCategory(category, shopConfig) {
    this.eventManager.emit(GameEvents.SHOP_RENDER, category, shopConfig);
  }

  addCoins(amount) {
    if (!this.validator.isPositiveNumber(amount)) return;

    this.stateManager.shop.balance += amount;
    this.storage.saveCoins(this.stateManager.shop.balance);
    this.eventManager.emit(
      "shop:balance:update",
      this.stateManager.shop.balance
    );
  }
}
