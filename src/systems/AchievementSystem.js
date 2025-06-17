import { StateManager } from "../managers/StateManager.js";
import { EventManager } from "../managers/EventManager.js";
import { Storage } from "../utils/Storage.js";

export class AchievementSystem {
  constructor(stateManager, eventManager) {
    this.state = stateManager;
    this.events = eventManager;
    this.storage = new Storage();
    this.achievements = this.loadAchievements();
    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    this.loadPlayerAchievements();
  }

  setupEventListeners() {
    this.events.on("game:win", () => this.checkWinAchievements());
    this.events.on("game:move", (moveData) =>
      this.checkMoveAchievements(moveData)
    );
    this.events.on("game:score", (score) => this.checkScoreAchievements(score));
    this.events.on("game:time", (time) => this.checkTimeAchievements(time));
  }

  loadAchievements() {
    return [
      {
        id: "first_win",
        title: "Первая победа",
        description: "Выиграйте первую игру",
        reward: 50,
        condition: (stats) => stats.wins >= 1,
        unlocked: false,
      },
      {
        id: "fast_win",
        title: "Скоростная игра",
        description: "Выиграйте менее чем за 5 минут",
        reward: 100,
        condition: (stats) => stats.fastestWin <= 300,
        unlocked: false,
      },
      // Другие достижения...
    ];
  }

  loadPlayerAchievements() {
    const unlocked = this.storage.getUnlockedAchievements();
    this.achievements.forEach((ach) => {
      ach.unlocked = unlocked.includes(ach.id);
    });
  }

  checkWinAchievements() {
    this.state.player.stats.wins++;
    this.checkAchievement("first_win");

    if (this.state.game.currentTime < this.state.player.stats.fastestWin) {
      this.state.player.stats.fastestWin = this.state.game.currentTime;
      this.checkAchievement("fast_win");
    }

    this.saveStats();
  }

  checkMoveAchievements(moveData) {
    this.state.player.stats.totalMoves++;
    // Проверка других достижений, связанных с ходами
    this.saveStats();
  }

  checkScoreAchievements(score) {
    if (score > this.state.player.stats.highestScore) {
      this.state.player.stats.highestScore = score;
      // Проверка достижений, связанных с очками
    }
    this.saveStats();
  }

  checkTimeAchievements(time) {
    this.state.game.currentTime = time;
    // Проверка достижений, связанных со временем
  }

  checkAchievement(achievementId) {
    const achievement = this.achievements.find((a) => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;

    const stats = this.state.player.stats;
    if (achievement.condition(stats)) {
      achievement.unlocked = true;
      this.storage.unlockAchievement(achievementId);
      this.events.emit("achievement:unlocked", achievement);

      if (achievement.reward) {
        this.events.emit("shop:coins:add", achievement.reward);
      }
    }
  }

  saveStats() {
    this.storage.savePlayerStats(this.state.player.stats);
  }
}
