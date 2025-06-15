import { GameEvents } from "../utils/Constants.js";

export class UISettingsPage {
  constructor(eventManager, stateManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.state = this.stateManager.state;
    this.page = document.getElementById("settings");
    this.displayPage = "";
    this.elements = {
      backBtn: document.getElementById("back-to-menu"),
      soundToggle: document.getElementById("sound-toggle"),
      difficultySelect: document.getElementById("difficulty"),
      musicVolume: document.getElementById("music-volume"),
    };

    this.init();
  }

  init() {
    this.getDisplayPage();
    this.setupEventListeners();
    // this.render();
  }

  getDisplayPage() {
    const computedStyle = window.getComputedStyle(this.page);
    this.displayPage = computedStyle.display;
  }

  setupEventListeners() {
    this.elements.backBtn.addEventListener("click", () => {
      this.saveSettings();
      this.eventManager.emit(GameEvents.UIMENUPAGE_SHOW, this);
    });

    this.elements.soundToggle.addEventListener("change", (e) => {
      this.eventManager.emit(GameEvents.SET_SOUND_TOGGLE, e.target.checked);
    });

    this.elements.difficultySelect.addEventListener("change", (e) => {
      this.eventManager.emit(GameEvents.SET_DIFFICUTY_CHANGE, e.target.value);
    });

    this.elements.musicVolume.addEventListener("input", (e) => {
      const volume = Math.max(0, Math.min(1, e.target.value / 100));
      this.eventManager.emit(GameEvents.SET_MUSIC_VOLUME, parseFloat(volume));
      this.eventManager.emit(GameEvents.SETTINGS_MUSIC_VOLUME);
      this.setPropertyStyleVolume(e.target);
    });
  }

  render() {
    const settings = this.state.settings;

    this.elements.soundToggle.checked = settings.soundEnabled;
    console.log('this.elements.difficultySelect.value:', this.elements.difficultySelect.value);
    console.log('settings.difficulty:', settings.difficulty);
    
    this.elements.difficultySelect.value = settings.difficulty;
    this.elements.musicVolume.value = settings.musicVolume * 100;
    this.setPropertyStyleVolume(this.elements.musicVolume);
  }

  saveSettings() {
    const newSettings = {
      soundEnabled: this.elements.soundToggle.checked,
      difficulty: this.elements.difficultySelect.value,
      musicVolume: parseFloat(this.elements.musicVolume.value),
    };

    this.eventManager.emit("settings:save", newSettings);
  }

  show() {
    this.render();
    this.page.classList.remove("hidden");
    // await Animator.fadeIn(this.page, this.displayPage);
  }

  hide() {
    this.page.classList.add("hidden");
    // await Animator.fadeOut(this.page);
  }

  setPropertyStyleVolume(element) {
    element.style.setProperty("--fill-percent", `${element.value}%`);
  }
}
