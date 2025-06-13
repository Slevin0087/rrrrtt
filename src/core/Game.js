import { Deck } from "./Deck.js";
import { Foundation } from "./Foundation.js";
import { Tableau } from "./Tableau.js";
import { Stock } from "./Stock.js";
import { GameLogicSystem } from "../systems/GameLogicSystem.js";
import { RenderingSystem } from "../systems/RenderingSystem.js";
import { GameEvents, AudioName } from "../utils/Constants.js";
import { AnimationSystem } from "../systems/AnimationSystem.js";
// import { CardSystem } from "../systems/CardSystem.js";

export class Game {
  constructor(eventManager, stateManager, audioManager) {
    this.components = {};
    this.systems = {};
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
    // this.audio = audioManager;

    // this.systems = {
    //   cards: new CardSystem(this.stateManager.stateManager, this.eventManager),
    //   logic: new GameLogicSystem(this.stateManager.stateManager, this.eventManager, this.audio),
    //   render: new RenderingSystem(this.stateManager.stateManager, this.eventManager),
    //   animation: new AnimationSystem(this.stateManager.stateManager, this.eventManager),
    // };
  }

  init() {
    console.log("GAME INIT");
    this.registerComponents();
    this.registerSystems();
    this.setupEventListeners();
    this.setupNewGame();
    this.renderGame();
    // this.initCards();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.CARD_CLICK, (card) =>
      this.systems.logic.handleCardClick(card)
    );
    // this.eventManager.on("card:flip", (card) =>
    //   this.systems.logic.handleCardFlip(card)
    // );
    this.eventManager.on(GameEvents.STOCK_CLICK, () => this.handleStockClick());
    this.eventManager.on("hint:request", () =>
      this.systems.logic.provideHint(this.foundations, this.tableaus)
    );

    this.eventManager.on(GameEvents.GAME_WIN, () => {
      this.stateManager.state.game.isRunning = false;
      this.systems.animation.playWinAnimation();
    });

    this.eventManager.on(GameEvents.CARD_MOVED, () => this.renderCards());
  }

  registerComponents() {
    this.components = {
      deck: new Deck(),
      foundations: Array.from({ length: 4 }, (_, i) => new Foundation(i)),
      tableaus: Array.from({ length: 7 }, (_, i) => new Tableau(i)),
      stock: new Stock(),
    };
  }

  registerSystems() {
    this.systems = {
      logic: new GameLogicSystem(
        this.eventManager,
        this.stateManager,
        this.audioManager
      ),
      render: new RenderingSystem(this.eventManager, this.stateManager),
      animation: new AnimationSystem(this.eventManager, this.stateManager),
    };

    this.systems.logic.init();
    this.systems.render.init();
  }

  // initCards() {
  //   this.stateManager.state.cards = {
  //     deck: this.deck,
  //     foundations: this.foundations,
  //     tableaus: this.tableaus,
  //     stock: this.stock,
  //   }
  // }

  setupNewGame() {
    this.systems.logic.setupNewGame(
      this.components.deck,
      this.components.tableaus,
      this.components.stock
    );
  }

  renderGame() {
    this.systems.render.renderGame(
      this.components.deck,
      this.components.tableaus,
      this.components.stock,
      this.components.foundations
    );
  }

  renderCards() {
    this.systems.render.renderCards(
      this.components.deck,
      this.components.tableaus,
      this.components.stock,
      this.components.foundations
    );
  }

  restart() {
    this.registerComponents();
    this.setupNewGame();
    this.renderGame();
  }

  // restart() {
  //   this.systems.logic.clearGame();
  //   this.systems.render.clearGame();
  //   this.init();
  // }

  handleStockClick() {
    this.audioManager.play(AudioName.CARD_FLIP);
    this.components.stock.deal();
    // this.components.stock.moveToWaste(card);
    // if (card) {
    //   this.systems.animation.animateStockDeal(card);
    // }
    // this.systems.render.renderStock(this.stock);
    this.eventManager.emit(GameEvents.CARD_MOVED);
  }

  update(deltaTime) {
    console.log("//////////////////////////////////////////////////////////");

    if (this.stateManager.state.game.isRunning) {
      this.stateManager.state.game.playTime += deltaTime;
      this.eventManager.emit(
        GameEvents.TIME_UPDATE,
        this.stateManager.state.game.playTime
      );
    }
  }
}
