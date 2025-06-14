export class Storage {
  constructor() {
    this.defaultPlayerStats = {
      name: "Игрок",
      coins: 0,
      wins: 0,
      losses: 0,
      totalMoves: 0,
      cardsToFoundation: 0,
      highestScore: 0,
      fastestWin: Infinity,
      gamesPlayed: 0,
      cardsFlipped: 0,
      winsWithoutHints: 0,
    };

    this.defaultGameStats = {
      isRunning: false,
      isPaused: false,
      score: 0,
      moves: 0,
      playTime: 0,
      lastMove: null,
      minPossibleMoves: 52, // Теоретический минимум для пасьянса
      difficulty: "normal",
      faceDownCards: 28,
    };

    this.defaultSettingsStats = {
      soundEnabled: true,
      theme: "default",
      language: "ru",
      musicVolume: 0.2,
      effectsVolume: 0.9,
      difficulty: "normal",
      cardFaceStyle: "classic",
      cardBackStyle: "blue",
      backgroundStyle: "default",
    };

    this.defaultShopStats = {
      currentCategory: "faces",
      purchasedItems: [],
      selectedItems: {
        cardFace: "classic_faces",
        cardBack: "blue_back",
        background: "green_felt",
      },
    };
  }

  init() {
    this.setDefaultGameStats();
    this.setDefaultPlayerStats();
    this.setDefaultSettingsStats();
    this.setDefaultShopStats();
  }
  /////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////// SETS ///////////////////////////////////////////////////
  setDefaultGameStats() {
    if (localStorage.getItem("defaultGameStats")) return;
    localStorage.setItem(
      "defaultGameStats",
      JSON.stringify(this.defaultGameStats)
    );
  }

  setDefaultPlayerStats() {
    if (localStorage.getItem("defaultPlayerStats")) return;
    else {
      localStorage.setItem(
        "defaultPlayerStats",
        JSON.stringify(this.defaultPlayerStats)
      );
    }
  }

  setDefaultSettingsStats() {
    if (localStorage.getItem("defaultSettingsStats")) return;
    localStorage.setItem(
      "defaultSettingsStats",
      JSON.stringify(this.defaultSettingsStats)
    );
  }

  setDefaultShopStats() {
    if (localStorage.getItem("defaultShopStats")) return;
    localStorage.setItem(
      "defaultShopStats",
      JSON.stringify(this.defaultShopStats)
    );
  }
  /////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////GETS /////////////////////////////////////////////////////
  getDefaultGameStats() {
    try {
      const state = JSON.parse(localStorage.getItem("defaultGameStats"));
      return state || this.defaultGameStats;
    } catch (e) {
      console.error("Error loading game state:", e);
      return null;
    }
  }

  getDefaultPlayerStats() {
    try {
      const state = JSON.parse(localStorage.getItem("defaultPlayerStats"));
      return state || this.defaultPlayerStats;
    } catch (e) {
      console.error("Error loading game state:", e);
      return null;
    }
  }

  getDefaultSettingsStats() {
    try {
      const state = JSON.parse(localStorage.getItem("defaultSettingsStats"));
      return state || this.defaultSettingsStats;
    } catch (e) {
      console.error("Error loading game state:", e);
      return null;
    }
  }

  getDefaultShopStats() {
    try {
      const state = JSON.parse(localStorage.getItem("defaultShopStats"));
      return state || this.defaultShopStats;
    } catch (e) {
      console.error("Error loading game state:", e);
      return null;
    }
  }

  getGameStats() {
    try {
      const state = JSON.parse(localStorage.getItem("gameStats"));
      return state || this.defaultGameStats;
    } catch (e) {
      console.error("Error loading game state:", e);
      return null;
    }
  }

  getPlayerStats() {
    try {      
      const state = JSON.parse(localStorage.getItem("playerStats"));
      return state || this.defaultPlayerStats;
    } catch (e) {
      console.error("Error loading game state:", e);
      return null;
    }
  }

  getGameSettings() {
    try {
      const gameSettings = JSON.parse(localStorage.getItem("gameSettings"));
      return gameSettings || this.defaultSettingsStats;
    } catch (e) {
      console.error("Error loading game settings:", e);
      return null;
    }
  }

  getShopStats() {
    try {
      const state = JSON.parse(localStorage.getItem("shopStats"));
      return state || this.defaultShopStats;
    } catch (e) {
      console.error("Error loading game settings:", e);
      return null;
    }
  }

  getShopItems() {
    const defaultItems = [
      {
        id: "classic_faces",
        name: "Классические лица",
        type: "cardFace",
        styleClass: "classic-fup",
        price: 0,
        description: "Стандартный дизайн карт",
        previewStyle: "linear-gradient(135deg, #fff, #eee)",
      },
      {
        id: "cosmo_faces",
        name: "Космический стиль",
        type: "cardFace",
        styleClass: "cosmo-fup",
        price: 100,
        description: "Футуристический дизайн карт",
        previewStyle: "linear-gradient(135deg, #6e48aa, #9d50bb)",
      },
      // Другие предметы магазина...
    ];

    return JSON.parse(localStorage.getItem("shopItems")) || defaultItems;
  }

  getUnlockedAchievements() {
    try {
      return JSON.parse(localStorage.getItem("unlockedAchievements")) || [];
    } catch {
      return [];
    }
  }

  // потом
  getPurchasedItems() {
    try {
      return JSON.parse(localStorage.getItem("purchasedItems")) || [];
    } catch {
      return [];
    }
  }
  ///////////////////////////////////////////////////////////////////////////////

  /////////////////////////////// CLEARS /////////////////////////////////////////////////////
  clearGameStats() {
    localStorage.removeItem("gameStats");
  }

  clearSessionData() {
    sessionStorage.removeItem("gameSession");
  }

  // === Helpers ===
  clearAll() {
    localStorage.clear();
    sessionStorage.clear();
  }

  // === Shop & Inventory ===
  addPurchasedItem(itemId) {
    const purchased = this.getPurchasedItems();
    if (!purchased.includes(itemId)) {
      purchased.push(itemId);
      localStorage.setItem("purchasedItems", JSON.stringify(purchased));
    }
  }

  // === Coins Economy ===
  addCoins(amount) {
    const current = this.getCoins();
    localStorage.setItem("gameCoins", current + amount);
  }

  deductCoins(amount) {
    const current = this.getCoins();
    localStorage.setItem("gameCoins", Math.max(0, current - amount));
  }

  getCoins() {
    return parseInt(localStorage.getItem("gameCoins")) || 0;
  }

  loadSessionData() {
    return JSON.parse(sessionStorage.getItem("gameSession"));
  }

  migrateLegacyData() {
    // Перенос данных из старых версий при необходимости
    if (localStorage.getItem("legacyData")) {
      // Логика миграции...
      localStorage.removeItem("legacyData");
    }
  }

  // ... существующие методы ...

  // === Achievements ===
  addUnlockAchievement(achievementId) {
    const unlocked = this.getUnlockedAchievements();
    if (!unlocked.includes(achievementId)) {
      unlocked.push(achievementId);
      localStorage.setItem("unlockedAchievements", JSON.stringify(unlocked));

      // Обновляем счетчик в статистике
      const stats = this.loadPlayerStats();
      stats.achievementsUnlocked = unlocked.length;
      this.setPlayerStats(stats);
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////// SAVES ////////////////////////////////////////////////////
  // === Game State ===
  setGameStats(gameStats) {
    try {
      localStorage.setItem("gameStats", JSON.stringify(gameStats));
      return true;
    } catch (e) {
      console.error("Error saving game state:", e);
      return false;
    }
  }

  // === Settings ===
  setGameSettings(settings) {
    const storage = JSON.parse(localStorage.getItem("gameSettings"));
    const settingsState = {
      ...storage,
      ...settings,
    };
    localStorage.setItem("gameSettings", JSON.stringify(settingsState));
  }

  setPlayerStats(stats) {
    
    const storage = JSON.parse(localStorage.getItem("playerStats"));
    // console.log("в setPlayerStats", storage);
    const playerStats = {
      ...storage,
      ...stats,
    };
    localStorage.setItem("playerStats", JSON.stringify(playerStats));
    // console.log("в setPlayerStats", playerStats);
  }

  // === Session Data ===
  saveSessionData(data) {
    sessionStorage.setItem("gameSession", JSON.stringify(data));
  }
  /////////////////////////////////////////////////////////////////////////////////
}
