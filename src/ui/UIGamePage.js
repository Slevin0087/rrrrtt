import { GameEvents } from "../utils/Constants.js";

export class UIGamePage {
  constructor(eventManager, stateManager) {
    this.stateManager = stateManager;
    this.eventManager = eventManager;
    this.state = stateManager.state;
    this.page = document.getElementById("game-interface");
    this.displayPage = "";
    this.elements = {
      messageEl: document.getElementById("message"),
      scoreEl: document.getElementById("points-in-game"),
      timeEl: document.getElementById("time-display"),
      achievementsIconEl: document.getElementById("achievements_span"),
      restartGameBtn: document.getElementById("new-game-ctr-btn"),
      hintBtn: document.getElementById("hint"),
      menuBtn: document.getElementById("menu-btn"),
      collectBtn: document.getElementById("collect-cards"),
      undoBtn: document.getElementById("undo-btn"),
    };

    this.init();
  }

  init() {
    this.getDisplayPage();
    this.setupEventListeners();
    this.updateUI();
  }

  getDisplayPage() {
    const computedStyle = window.getComputedStyle(this.page);
    this.displayPage = computedStyle.display;
  }

  setupEventListeners() {
    this.elements.restartGameBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.GAME_RESTART);
      this.updateScore(this.stateManager.state.game.score);
      // setTimeout(() => this.eventManager.emit(GameEvents.UI_ANIMATE_DEAL_CARDS), 1000);
    });

    this.elements.hintBtn.addEventListener("click", () => {
      this.eventManager.emit("hint:request");
    });

    this.elements.menuBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.UIMENUPAGE_SHOW, this);
    });

    this.elements.collectBtn.addEventListener("click", () => {
      this.eventManager.emit("cards:collect");
    });

    this.eventManager.on(GameEvents.SCORE_UPDATE, (score) =>
      this.updateScore(score)
    );

    this.eventManager.on(GameEvents.TIME_UPDATE, (time) => {
      this.updateTime(time);
    });

    this.eventManager.on("game:message", (message, type) => {
      this.showMessage(message, type);
    });

    this.elements.undoBtn.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.UNDO_MOVE);
    });
  }

  updateUI() {
    this.updateScore(this.state.game.score);
    this.updateTime(this.state.game.playTime);
  }

  resetTime(minutes, seconds) {
    this.elements.timeEl.textContent = `${minutes}${minutes}:${seconds}${seconds}`;
  }

  updateScore(score) {
    this.elements.scoreEl.textContent = `🌟 ${score}`;
  }

  updateTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    this.elements.timeEl.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  showMessage(message, type = "info") {
    this.elements.messageEl.textContent = message;
    this.elements.messageEl.className = `game-message ${type}`;

    setTimeout(() => {
      this.elements.messageEl.className = "game-message";
    }, 2000);
  }

  show() {
    console.log("SHOOOOOOOOOOOOOOOOOOW GAME");
    this.page.className = "";
    const styleClass =
      this.stateManager.state.player.selectedItems.backgrounds.styleClass;
    const achievementsIconElText = this.stateManager.state.player.achievements.active.icon;
    console.log('');
    
    this.page.classList.add("game-interface", styleClass);
    this.elements.achievementsIconEl.textContent = achievementsIconElText;
    // this.page.classList.remove("hidden");
    this.updateUI();
  }

  hide() {
    this.page.classList.add("hidden");
  }


}
