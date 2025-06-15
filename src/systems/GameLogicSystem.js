import { GameEvents, AudioName } from "../utils/Constants.js";
import { GameConfig } from "../configs/GameConfig.js";

export class GameLogicSystem {
  constructor(eventManager, stateManager, audioManager) {
    this.eventManager = eventManager;
    this.stateManager = stateManager;
    this.audioManager = audioManager;
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventManager.on(GameEvents.CARD_TO_FOUNDATION, (data) => {
      this.moveCardToFoundation(data);
    });
    this.eventManager.on(GameEvents.CARD_TO_TABLEAU, (data) =>
      this.moveCardToTableau(data)
    );
    this.eventManager.on("hint:request", () => this.provideHint());
    this.eventManager.on("game:undo", () => this.handleUndo());
  }

  setupNewGame(deck, tableaus, stock) {
    deck.reset();

    // Раздача карт в tableau
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = deck.deal();
        card.faceUp = j === i;
        tableaus[i].addCard(card);
      }
    }

    // Оставшиеся карты в сток
    const stockCards = [];
    while (!deck.isEmpty()) {
      stockCards.push(deck.deal());
    }
    stock.addCards(stockCards);

    // Сброс состояния игры
    this.eventManager.emit(GameEvents.END_SET_NEW_GAME);
  }

  handleCardClick(card) {
    this.audioManager.play(AudioName.CLICK);
    if (!card.faceUp || this.stateManager.state.game.isPaused) return;
    if (this.checkWinCondition()) return;
    const gameComponents = this.stateManager.state.currentGame.components;
    // Проверяем можно ли переместить карту в foundation
    for (let i = 0; i < gameComponents.foundations.length; i++) {
      if (
        gameComponents.foundations[i].canAccept(card, gameComponents.tableaus)
      ) {
        this.eventManager.emit(GameEvents.CARD_TO_FOUNDATION, {
          card,
          foundationIndex: i,
        });
        return;
      }
    }

    // Если нет - проверяем tableau
    for (let i = 0; i < gameComponents.tableaus.length; i++) {
      if (gameComponents.tableaus[i].canAccept(card)) {
        this.eventManager.emit(GameEvents.CARD_TO_TABLEAU, {
          card,
          tableauIndex: i,
        });
        return;
      }
    }

    // Если карту нельзя переместить - звуковой сигнал
    this.audioManager.play(AudioName.INFO);
  }

  // Остальные методы системы логики...
  // после
  moveCardToFoundation(data) {
    const { card, foundationIndex } = data;
    const foundation =
      this.stateManager.state.currentGame.components.foundations[
        foundationIndex
      ];

    const source = this.getCardSource(card);
    // Запоминаем ход для возможной отмены
    this.stateManager.updateLastMove({
      card,
      from: source,
      to: `foundation-${foundationIndex}`,
    });

    // Удаляем карту из исходного места
    this.removeCardFromSource(card, source);

    // Добавляем в foundation
    foundation.addCard(card);
    this.stateManager.incrementStat("cardsToFoundation");

    // Обновляем очки
    const points = this.calculatePoints(GameConfig.rules.scoreForFoundation);
    this.stateManager.updateScore(points);

    // Открываем следующую карту в tableau, если нужно
    this.openNextCardIfNeeded(source);

    // Рендер/Обновление карт
    this.eventManager.emit(GameEvents.CARD_MOVED);
    // this.audioManager.play("cardPlace");
    const score = GameConfig.rules.scoreForFoundation;
    this.eventManager.emit(GameEvents.UI_ANIMATION_POINTS_EARNED, card, score);
    // Проверяем победу
    if (this.checkWinCondition()) {
      this.handleWin();
      return;
    }
  }

  moveCardToTableau({ card, tableauIndex }) {
    const tableau =
      this.stateManager.state.currentGame.components.tableaus[tableauIndex];
    const source = this.getCardSource(card);

    // Запоминаем ход для возможной отмены
    this.stateManager.updateLastMove({
      card,
      from: source,
      to: `tableau-${tableauIndex}`,
    });

    // Удаляем карту из исходного места
    const removedCards = this.removeCardFromSource(card, source);
    // Добавляем в tableau
    removedCards.length > 1
      ? tableau.addCards(removedCards)
      : tableau.addCard(card);

    // Рендер/Обновление карт

    // Обновляем очки
    // const points = this.calculatePoints(GameConfig.rules.scoreForTableauMove);
    // this.stateManager.updateScore(points);
    this.openNextCardIfNeeded(source);
    this.eventManager.emit(GameEvents.CARD_MOVED);
    // this.audioManager.play("cardPlace");
  }

  getCardSource(card) {
    // Определяем откуда взята карта (tableau, foundation, waste)
    if (card.positionData.parent.includes("tableau")) {
      return `tableau-${card.positionData.index}`;
    } else if (card.positionData.parent.includes("foundation")) {
      return `foundation-${card.positionData.index}`;
    } else {
      return "waste";
    }
  }

  removeCardFromSource(card, source) {
    if (source.startsWith("tableau")) {
      const index = parseInt(source.split("-")[1]);
      return this.stateManager.state.currentGame.components.tableaus[
        index
      ].removeCardsFrom(card);
    } else if (source.startsWith("foundation")) {
      const index = parseInt(source.split("-")[1]);
      return this.stateManager.state.currentGame.components.foundations[
        index
      ].removeTopCard();
    } else if (source === "waste") {
      this.stateManager.state.currentGame.components.stock.removeCurrentCard(
        card
      );
      return card;
    }
  }

  openNextCardIfNeeded(source) {
    if (!source.startsWith("tableau")) return;

    const index = parseInt(source.split("-")[1]);

    const tableau =
      this.stateManager.state.currentGame.components.tableaus[index];
    const topCard = tableau.getTopCard();

    if (topCard && !topCard.faceUp) {
      topCard.flip();
      const score = GameConfig.rules.scoreForCardFlip;
      this.stateManager.incrementStat("cardsFlipped");
      this.stateManager.updateScore(this.calculatePoints(score));
      this.audioManager.play(AudioName.CARD_FLIP);
      this.eventManager.emit(
        GameEvents.UI_ANIMATION_POINTS_EARNED,
        topCard,
        score
      );
    }
  }

  calculatePoints(score) {
    const { difficulty } = this.stateManager.state.game;
    const multiplier = {
      easy: 1.2,
      normal: 1.0,
      hard: 0.8,
    }[difficulty];

    const resultScore = Math.round(score * multiplier);
    return resultScore;
  }

  checkWinCondition() {
    return this.stateManager.state.currentGame.components.foundations.every(
      (f) => f.isComplete()
    );
  }

  handleWin() {
    this.stateManager.incrementStat("wins");
    this.stateManager.updateScore(
      this.calculatePoints(GameConfig.rules.winScoreBonus)
    );

    // Проверяем победу без подсказок
    if (this.stateManager.state.game.hintsUsed === 0) {
      this.stateManager.incrementStat("winsWithoutHints");
    }

    // Проверяем быструю победу
    if (
      this.stateManager.state.game.time <
      this.stateManager.state.player.fastestWin
    ) {
      this.stateManager.state.player.fastestWin =
        this.stateManager.state.game.time;
    }

    this.audioManager.play(AudioName.WIN);
    this.eventManager.emit(GameEvents.CARD_MOVED);
    this.eventManager.emit(GameEvents.UI_ANIMATE_WIN);
    this.eventManager.emit(
      GameEvents.INCREMENT_COINS,
      GameConfig.earnedCoins.win
    );
    this.eventManager.emit(
      GameEvents.ANIMATION_COINS_EARNED,
      `Вы заработали ${GameConfig.earnedCoins.win} хусынок`
    );
    this.eventManager.emit(GameEvents.GAME_END);
  }

  provideHint() {
    if (this.stateManager.state.game.score < 5) {
      this.eventManager.emit(
        "ui:notification",
        "Нужно минимум 5 очков для подсказки"
      );
      this.audioManager.play("error");
      return;
    }

    // Логика поиска возможных ходов...
    const hint = this.findBestHint();

    if (hint) {
      this.stateManager.deductCoins(5);
      this.stateManager.state.game.hintsUsed =
        (this.stateManager.state.game.hintsUsed || 0) + 1;
      this.eventManager.emit("hint:show", hint);
    } else {
      this.eventManager.emit("ui:notification", "Нет доступных ходов");
    }
  }

  findBestHint() {
    // Сначала проверяем карты в waste
    const wasteCard = this.stateManager.currentGame.stock.getWasteCard();
    if (wasteCard) {
      // Проверяем foundation
      for (
        let i = 0;
        i < this.stateManager.currentGame.foundations.length;
        i++
      ) {
        if (this.stateManager.currentGame.foundations[i].canAccept(wasteCard)) {
          return {
            card: wasteCard,
            target: `foundation-${i}`,
            type: "waste-to-foundation",
          };
        }
      }

      // Проверяем tableau
      for (let i = 0; i < this.stateManager.currentGame.tableaus.length; i++) {
        if (this.stateManager.currentGame.tableaus[i].canAccept(wasteCard)) {
          return {
            card: wasteCard,
            target: `tableau-${i}`,
            type: "waste-to-tableau",
          };
        }
      }
    }

    // Затем проверяем tableau
    for (let i = 0; i < this.stateManager.currentGame.tableaus.length; i++) {
      const tableau = this.stateManager.currentGame.tableaus[i];
      const topCard = tableau.getTopCard();

      if (!topCard) continue;

      // Проверяем foundation
      for (
        let j = 0;
        j < this.stateManager.currentGame.foundations.length;
        j++
      ) {
        if (this.stateManager.currentGame.foundations[j].canAccept(topCard)) {
          return {
            card: topCard,
            target: `foundation-${j}`,
            type: "tableau-to-foundation",
          };
        }
      }
    }

    return null;
  }

  handleUndo() {
    if (!this.stateManager.state.game.lastMove) {
      this.audioManager.play(AudioName.INFO);
      return;
    }

    const { card, from, to } = this.stateManager.state.game.lastMove;
    this.eventManager.emit("game:undo:move", { card, from, to });
  }
}
