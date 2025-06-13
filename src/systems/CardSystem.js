import { GameEvents } from "../utils/Constants.js";
import { Animator } from "../utils/Animator.js";
import { Helpers } from "../utils/Helpers.js";

export class CardSystem {
  constructor(eventManager, stateManager) {
    this.stateManager = stateManager;
    this.eventManager = eventManager;
    this.dragState = null;
    this.selectedCard = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // this.eventManager.on(GameEvents.CARD_CLICK, (card) => this.handleCardClick(card));
    // this.eventManager.on(GameEvents.CARD_DRAG_START, (card, element) =>
    //   this.handleDragStart(card, element)
    // );
    // this.eventManager.on(GameEvents.CARD_DRAG_END, () => this.handleDragEnd());
    // this.eventManager.on(GameEvents.CARD_DROP, (target) => this.handleDrop(target));
    this.eventManager.on(GameEvents.UNDO_MOVE, () => this.handleUndo());
  }

  handleCardClick(card) {
    if (this.stateManager.state.game.isPaused) return;

    // Если карта уже выбрана - снимаем выделение
    if (this.selectedCard === card) {
      this.deselectCard();
      return;
    }

    // Выделяем новую карту
    this.selectCard(card);
  }

  selectCard(card) {
    this.deselectCard();
    this.selectedCard = card;

    // Визуальное выделение карты
    this.eventManager.emit("card:select", card);

    // Подсветка возможных ходов
    this.highlightValidTargets(card);
  }

  deselectCard() {
    if (!this.selectedCard) return;

    this.eventManager.emit("card:deselect", this.selectedCard);
    this.eventManager.emit("ui:clear:highlights");
    this.selectedCard = null;
  }

  highlightValidTargets(card) {
    const { foundations, tableaus } = this.stateManager.state.game;

    // Проверка foundation
    foundations.forEach((foundation, index) => {
      if (foundation.canAccept(card)) {
        this.eventManager.emit("ui:highlight:foundation", index);
      }
    });

    // Проверка tableau
    tableaus.forEach((tableau, index) => {
      if (tableau.canAccept(card)) {
        this.eventManager.emit("ui:highlight:tableau", index);
      }
    });
  }

  handleDragStart(card, element) {
    if (this.stateManager.state.game.isPaused) return;

    this.dragState = {
      card,
      element,
      source: card.positionData.parent,
      startX: element.getBoundingClientRect().left,
      startY: element.getBoundingClientRect().top,
      offsetX: 0,
      offsetY: 0,
      validTargets: this.getValidTargets(card),
    };

    this.eventManager.emit("ui:drag:start", element);
  }

  handleDragEnd() {
    if (!this.dragState) return;

    this.eventManager.emit("ui:drag:end");
    this.dragState = null;
  }

  handleDrop(target) {
    if (!this.dragState || !target) {
      this.handleDragEnd();
      return;
    }

    const { card, source, validTargets } = this.dragState;

    // Проверяем, является ли цель валидной
    if (validTargets.includes(target)) {
      this.moveCard(card, source, target);
    } else {
      this.eventManager.emit("ui:animate:return", this.dragState);
    }

    this.handleDragEnd();
  }

  moveCard(card, source, target) {
    this.eventManager.emit("game:move:start", { card, source, target });

    // Определяем тип цели (foundation или tableau)
    const [targetType, targetIndex] = this.parseTargetId(target);

    if (targetType === "foundation") {
      this.eventManager.emit("card:to:foundation", {
        card,
        foundationIndex: targetIndex,
      });
    } else if (targetType === "tableau") {
      this.eventManager.emit("card:to:tableau", {
        card,
        tableauIndex: targetIndex,
      });
    }
  }

  getValidTargets(card) {
    const { foundations, tableaus } = this.stateManager.state.game;
    const targets = [];

    foundations.forEach((foundation, index) => {
      if (foundation.canAccept(card)) {
        targets.push(`foundation-${index}`);
      }
    });

    tableaus.forEach((tableau, index) => {
      if (tableau.canAccept(card)) {
        targets.push(`tableau-${index}`);
      }
    });

    return targets;
  }

  parseTargetId(targetId) {
    const [type, index] = targetId.split("-");
    return [type, parseInt(index)];
  }

  handleUndo() {
    console.log('в handleUndo:', this.stateManager.state.game.lastMove);
    
    if (!this.stateManager.state.game.lastMove) return;

    const { card, from, to } = this.stateManager.state.game.lastMove;
    // this.eventManager.emit("ui:animate:undo", { card, from, to }, () => {
      this.reverseMove(card, from, to);
    // });
  }

  reverseMove(card, from, to) {
    const [fromType, fromIndex] = this.parseTargetId(from);

    if (fromType === "tableau") {
      this.eventManager.emit(GameEvents.CARD_TO_TABLEAU, {
        card,
        tableauIndex: fromIndex,
      });
    } else if (fromType === "foundation") {
      this.eventManager.emit(GameEvents.CARD_TO_FOUNDATION, {
        card,
        foundationIndex: fromIndex,
      });
    } else if (fromType === "waste") {
      console.log('КАРТА ИЗ WASTE, ПОКА НЕ РЕАЛИЗОВАНО ОТМЕНА ХОДА ПОСЛЕ ПЕРЕМЕЩЕНИЯ КАРТЫ ИЗ WASTE');
      
      this.eventManager.emit("card:to:waste", { card });
    }
  }
}
