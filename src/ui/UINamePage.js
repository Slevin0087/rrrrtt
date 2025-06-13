import { GameEvents } from "../utils/Constants.js";

export class UINamePage {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = stateManager.state;
    // console.log('this.state:', this.state);
    
    this.page = document.getElementById("player-page");
    this.displayPage = "";
    this.elements = {
      form: document.getElementById("player-form"),
      input: document.getElementById("player-name"),
      submitBtn: document.getElementById("submit-name"),
      skipBtn: document.getElementById("skip-name"),
      errorMsg: document.getElementById("name-error"),
    };

    // this.init();
  }

  init() {
    this.getDisplayPage();
    this.setupEventListeners();
    this.setNameInInput();
    // console.log('UINamePage init');
    
  }

  getDisplayPage() {
    const computedStyle = window.getComputedStyle(this.page);
    this.displayPage = computedStyle.display;
  }

  setupEventListeners() {
    this.elements.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.elements.skipBtn.addEventListener("click", () => this.handleSkip());
  }
  

  setNameInInput() {
    this.elements.input.value = this.state.player.name;
  }

  handleSubmit(event) {    
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get("player_name").trim();
    this.eventManager.emit(GameEvents.PLAYER_NAME_SET, name);
    this.eventManager.emit(GameEvents.UI_NAME_HIDE);
  }

  handleSkip() {
    this.eventManager.emit(GameEvents.PLAYER_NAME_SET, this.state.player.name);
    this.eventManager.emit(GameEvents.UI_NAME_HIDE);
  }


  showError(message) {
    this.elements.errorMsg.textContent = message;
    this.elements.errorMsg.classList.remove("hidden");
    this.elements.submitBtn.disabled = true;
  }

  hideError() {
    this.elements.errorMsg.classList.add("hidden");
    this.elements.submitBtn.disabled = false;
  }

  saveName(name) {
    this.state.player.name = name;
    this.stateManager.storage.savePlayerStats(this.state.player);
  }

  hide() {
    this.page.classList.add("hidden");
  }

  show() {
    // console.log('ffffffff');
    
    this.page.classList.remove("hidden");
    this.elements.input.focus();
  }

  reset() {
    this.otherElements.input.value = "";
    this.hideError();
  }
}
