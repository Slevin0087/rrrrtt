import { GameEvents } from "../utils/Constants.js";

export class UIPlayerStatePage {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.page = document.getElementById("player-state");
    this.displayPage = "";
    this.elements = {
      btnBack: document.getElementById("btn-back-st-player"),
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
    this.elements.btnBack.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.UIMENUPAGE_SHOW, this);
    });
  }

  render() {
    const statePlayer = this.stateManager.state.player;
    console.log('statePlayer:', statePlayer);
    
    const container = document.getElementById('player-state-content');
    container.innerHTML = '';
    container.innerHTML = `<table class="p-state-table table">
      <tr>
        <td class="left-td">Имя:</td>
        <td class="right-td">${statePlayer.name}</td>
      </tr>
      <tr>
        <td class="left-td">Хусынки:</td>
        <td class="right-td">${statePlayer.coins}</td>
      </tr>
      <tr>
        <td class="left-td">Сыграно игр:</td>
        <td class="right-td">${statePlayer.gamesPlayed}</td>
      </tr>
      <tr>
        <td class="left-td">Выиграно игр:</td>
        <td class="right-td">${statePlayer.wins}</td>
      </tr>
      <tr>
        <td class="left-td">Лучший счет:</td>
        <td class="right-td">${statePlayer.highestScore}</td>
      </tr>`;
  }

  show() {
    this.page.classList.remove("hidden");
    this.render();
    // await Animator.fadeIn(this.page, this.displayPage);
  }

  hide() {
    // await Animator.fadeOut(this.page);
    this.page.classList.add("hidden");
  }
}
