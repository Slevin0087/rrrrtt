import { GameEvents } from "../utils/Constants.js";

export class UIMenuPage {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.isRunningGame = false;
    console.log('this.isRunningGame:', this.isRunningGame);
    
    this.page = document.getElementById("game-menu");
    this.displayPage = "";
    this.elements = {
      newGameBtn: document.getElementById("new-game-btn"),
      settingsBtn: document.getElementById("settings-btn"),
      statePlayerBtn: document.getElementById("state-player"),
      shopBtn: document.getElementById("shop-btn"),
      exitBtn: document.getElementById("exit-btn"),
      continueBtn: document.getElementById("continue-btn"),
    };
    this.init();
  }

  init() {
    this.getDisplayPage();
    this.setupEventListeners();
  }

  getDisplayPage() {
    const computedStyle = window.getComputedStyle(this.page);
    this.displayPage = computedStyle.display;
  }

  setupEventListeners() {
    this.elements.newGameBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.GAME_NEW);
      // this.eventManager.emit("game:start");
    });

    this.elements.continueBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.GAME_CONTINUE, this);
    });

    this.elements.settingsBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.UI_SETTINGS_SHOW, this);
    });

    this.elements.statePlayerBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.UI_STATEPLAYER_SHOW, this);
    });

    this.elements.shopBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.UI_SHOP_SHOW, this);
    });

    this.elements.exitBtn.addEventListener("click", () => {
      this.eventManager.emit("game:exit", this);
      this.eventManager.emit("game:end");
    });
  }

  show() {
    console.log('swoooooooooooooooooooooooooooooooow MENU');
    
    this.isRunningGame = this.stateManager.state.game.isRunning;
    this.elements.continueBtn.style.display = this.isRunningGame ? "block" : "none";
    this.page.classList.remove("hidden");
  }

  hide() {
    // await Animator.fadeOut(this.page);
    this.page.classList.add("hidden");
  }

  updateContinueButton(visible) {
    this.elements.continueBtn.style.display = visible ? "block" : "none";
  }
}
