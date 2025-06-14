import { GameEvents } from "../utils/Constants.js";
import { Game } from "../core/Game.js";

export class GameManager {
  constructor(eventManager, stateManager, audioManager) {
    this.components = {};
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
    this.lastTime = 0;
  }
  
  init() {
    
    this.registerComponents();
    this.setupEventListeners();
    this.gameLoop(0);
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.GAME_NEW, () => this.components.game.init());
    this.eventManager.on(GameEvents.GAME_RESTART, () => this.components.game.restart());
  }

   registerComponents() {
    this.components = {
      game: new Game(this.eventManager, this.stateManager, this.audioManager),
    }
    this.eventManager.emit(GameEvents.SET_CURRENT_GAME, this.components.game);
  }

  gameLoop(timestamp) {
    
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    // if (this.state.currentGame && this.state.currentGame.update) {
    //   this.state.currentGame.update(deltaTime / 1000);
    //   // console.log('в gameLoop timestamp:', this.state.currentGame.update);
    // }

    // if (this.components.game.update) {
    //   this.components.game.update(deltaTime / 1000)
    // }

    console.log('/////////////////////////////////////////////////////////////////////////////////////////');
    
    
    requestAnimationFrame((t) => {
      this.gameLoop(t)
  });
  }
}
