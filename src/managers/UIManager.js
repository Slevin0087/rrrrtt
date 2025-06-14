import { GameEvents } from "../utils/Constants.js";
import { UINamePage } from "../ui/UINamePage.js";
import { UIMenuPage } from "../ui/UIMenuPage.js";
import { UIGamePage } from "../ui/UIGamePage.js";
import { UISettingsPage } from "../ui/UISettingsPage.js";
import { UIPlayerStatePage } from "../ui/UIPlayerStatePage.js";
import { UIShop } from "../ui/UIShop.js";

export class UIManager {
  constructor(eventManager, stateManager) {
    this.components = {};
    this.eventManager = eventManager;
    this.stateManager = stateManager;
  }

  init() {
    // console.log("UIManager init");
    this.setupEventListeners();
    this.registerComponents();
    this.hideAll();
    this.initUINamePage();
    document.getElementById("loader").classList.add("hidden");
  }

  registerComponents() {
    this.components = {
      uiNamePage: new UINamePage(this.eventManager, this.stateManager),
      uiMenuPage: new UIMenuPage(this.eventManager, this.stateManager),
      uiGamePage: new UIGamePage(this.eventManager, this.stateManager),
      uiSettingsPage: new UISettingsPage(this.eventManager, this.stateManager),
      uiShopPage: new UIShop(this.eventManager, this.stateManager),
      uiPlayerStatePage: new UIPlayerStatePage(
        this.eventManager,
        this.stateManager
      ),
    };
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.FULL_SCREEN_BTN, (e) => {
      this.toggleFullscreen(e.target);
    })
    this.eventManager.on(GameEvents.UI_NAME_HIDE, () => {
      this.hideAll(this.components.uiNamePage);
      this.components.uiMenuPage.show();
      this.eventManager.emit(
        GameEvents.SET_ACTIV_PAGE,
        this.components.uiMenuPage
      );
    });

    this.eventManager.on(GameEvents.UIMENUPAGE_SHOW, (activePage) => {
      this.hideAll(activePage);
      // this.components.uiMenuPage.init();
      this.components.uiMenuPage.show();
      this.eventManager.emit(
        GameEvents.SET_ACTIV_PAGE,
        this.components.uiMenuPage
      );
    });

    this.eventManager.on(GameEvents.UI_SHOP_SHOW, (activePage) => {
      this.hideAll(activePage);
      // this.components.uiMenuPage.init();
      this.components.uiShopPage.show();
      this.eventManager.emit(
        GameEvents.SET_ACTIV_PAGE,
        this.components.uiShopPage
      );
    });

    this.eventManager.on(GameEvents.UI_STATEPLAYER_SHOW, (activePage) => {
      this.hideAll(activePage);
      // this.components.uiMenuPage.init();
      this.components.uiPlayerStatePage.show();
      this.eventManager.emit(
        GameEvents.SET_ACTIV_PAGE,
        this.components.uiPlayerStatePage
      );
    });

    this.eventManager.on(GameEvents.UI_SETTINGS_SHOW, (activePage) => {
      this.hideAll(activePage);
      // this.components.uiSettingsPage.init();
      this.components.uiSettingsPage.show();
      this.eventManager.emit(
        GameEvents.SET_ACTIV_PAGE,
        this.components.uiSettingsPage
      );
    });

    this.eventManager.on(GameEvents.GAME_NEW, () => {
      this.hideAll(this.components.uiMenuPage);
      // this.components.uiGamePage.init();
      this.components.uiGamePage.show();
      this.eventManager.emit(
        GameEvents.SET_ACTIV_PAGE,
        this.components.uiGamePage
      );
    });

    this.eventManager.on(GameEvents.GAME_CONTINUE, (activePage) => {
      this.hideAll(activePage);
      this.components.uiGamePage.show();
      this.stateManager.state.ui.activePage = this.components.uiGamePage;
      this.stateManager.state.game.isRunning = true;
    });
  }

  toggleFullscreen(fullScreenBtn) {
    console.log("заход в функцию, полный экран");
    // const fullScreenBtn = document.getElementById("full-screen-btn");

    if (!document.fullscreenElement) {
      // Запуск полноэкранного режима
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Ошибка при переходе в полноэкранный режим: ${err}`);
      });
      if (fullScreenBtn.textContent === "[ ]") fullScreenBtn.textContent = "_";
    } else {
      // Выход из полноэкранного режима
      if (document.exitFullscreen) {
        document.exitFullscreen();
        if (fullScreenBtn.textContent === "_") fullScreenBtn.textContent = "[ ]";
      }
    }
  }

  hideAll(arg = null) {
    Object.values(this.components).forEach((component) => {
      if (!arg) component.page.classList.add("hidden");
      else {
        if (component === arg) component.hide();
        else component.page.classList.add("hidden");
      }
    });
  }

  initUINamePage() {
    this.components.uiNamePage.init();
    this.components.uiNamePage.show();
    this.eventManager.emit(
      GameEvents.SET_ACTIV_PAGE,
      this.components.uiNamePage
    );
  }
}
