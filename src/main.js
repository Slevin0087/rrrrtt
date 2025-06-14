import { EventManager } from "./managers/EventManager.js";
import { Storage } from "./utils/Storage.js";
import { StateManager } from "./managers/StateManager.js";
import { UIManager } from "./managers/UIManager.js";
import { AudioManager } from "./managers/AudioManager.js";
import { GameManager } from "./managers/GameManager.js";

class App {
  constructor() {
    this.eventManager = new EventManager();
    this.stogare = new Storage(this.eventManager);
    this.stateManager = new StateManager(this.eventManager, this.stogare);
    this.uiManager = new UIManager(this.eventManager, this.stateManager);
    this.audioManager = new AudioManager(this.eventManager, this.stateManager);
    this.gameManager = new GameManager(
      this.eventManager,
      this.stateManager,
      this.audioManager
    );
  }

  init() {
    console.log("App init");
    this.setupEventListeners();
    this.stogare.init();
    this.stateManager.init();
    this.uiManager.init();
    this.audioManager.init();
    this.gameManager.init();
  }

  setupEventListeners() {
    document.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
  }
}

// Запуск приложения после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
  new App().init();

  // Для отладки
  // window.app = app;
});
