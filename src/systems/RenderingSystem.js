import { UIConfig } from "../configs/UIConfig.js";
import { GameEvents } from "../utils/Constants.js";

export class RenderingSystem {
  constructor(eventManager, stateManager) {
    this.stateManager = stateManager;
    this.eventManager = eventManager;
    this.cache = new Map();
    this.domElements = {
      gameContainer: document.getElementById("game-container"),
      rowElement: document.getElementById("row"),
      foundationsDiv: document.getElementById("foundationsDiv"),
      tableausEl: document.getElementById("tableausDiv"),
      stockDivEl: document.getElementById("stockDiv"),
      wasteContainer: document.getElementById("waste"),
    };
  }

  init() {
    this.setupEventListeners();
    // this.setupGameArea();
  }

  // изначально, потом renderFullGame
  //   renderGame(deck, tableaus, foundations, stock) {
  //     // this.clearGameElements();
  //     this.renderTableaus(tableaus);
  //     this.renderFoundations(foundations);
  //     this.renderStock(stock);
  //     this.renderWaste(stock);
  //   }

  // изначально
  // renderCard(card, containerId, offset) {
  //   const cardElement = this.createCardElement(card);
  //   const container = this.getCachedElement(containerId);

  //   if (!container) return;

  //   this.setCardPosition(cardElement, container, offset);
  //   this.setCardStyles(cardElement, card);
  //   this.setupCardEventListeners(cardElement, card);

  //   container.appendChild(cardElement);
  //   card.parentElement = container;
  //   card.cardEl = cardElement;
  // }

  // Остальные методы рендеринга...

  setupEventListeners() {
    this.eventManager.on("game:start", () => this.renderFullGame());
    // this.eventManager.on("card:moved", (data) => this.animateCardMove(data));
    this.eventManager.on("card:flipped", (card) => this.animateCardFlip(card));
    this.eventManager.on("game:undo:move", (data) =>
      this.animateUndoMove(data)
    );
    this.eventManager.on("hint:show", (hint) => this.showHint(hint));
    this.eventManager.on("ui:theme:change", (theme) => this.applyTheme(theme));
  }

  // setupGameArea() {
  //   // Создаем DOM элементы для игровых зон
  //   this.createFoundations();
  //   this.createTableaus();
  //   this.createStockAndWaste();
  //   this.applyTheme(this.stateManager.state.settings.theme);
  // }

  // createFoundations() {
  //   this.domElements.foundationsContainer.innerHTML = "";
  //   for (let i = 0; i < 4; i++) {
  //     const foundation = document.createElement("div");
  //     foundation.className = "foundation";
  //     foundation.id = `foundation-${i}`;
  //     this.domElements.foundationsContainer.appendChild(foundation);
  //   }
  // }

  // createTableaus() {
  //   this.domElements.tableausContainer.innerHTML = "";
  //   for (let i = 0; i < 7; i++) {
  //     const tableau = document.createElement("div");
  //     tableau.className = "tableau";
  //     tableau.id = `tableau-${i}`;
  //     this.domElements.tableausContainer.appendChild(tableau);
  //   }
  // }

  // createStockAndWaste() {
  //   this.domElements.stockContainer.innerHTML = "";
  //   this.domElements.wasteContainer.innerHTML = "";

  //   const stock = document.createElement("div");
  //   stock.className = "stock";
  //   stock.id = "stock";
  //   this.domElements.stockContainer.appendChild(stock);

  //   const waste = document.createElement("div");
  //   waste.className = "waste";
  //   waste.id = "waste";
  //   this.domElements.wasteContainer.appendChild(waste);
  // }

  // потом, изначально renderGame
  renderFullGame() {
    this.clearAllCards();
    // this.renderStock();
    // this.renderWaste();
    // this.renderFoundations();
    // this.renderTableaus();
    this.renderGame();
  }

  /////////////////////////////////
  renderGame(deck, tableaus, stock, foundations) {
    // Очищение контейнеров
    this.domElements.gameContainer.innerHTML = "";
    this.domElements.rowElement.innerHTML = "";
    this.domElements.tableausEl.innerHTML = "";
    this.domElements.foundationsDiv.innerHTML = "";
    // this.domElements.stockDivEl.innerHTML = "";

    // Добавляем элементы в DOM
    this.domElements.gameContainer.append(
      this.domElements.rowElement,
      this.domElements.tableausEl
    );
    this.domElements.rowElement.append(
      this.domElements.stockDivEl,
      this.domElements.foundationsDiv
    );

    // this.domElements.stockDivEl.append(stock.element);
    // this.domElements.stockDivEl.append(stock.wasteElement);

    foundations.forEach((foundation) => {
      this.domElements.foundationsDiv.append(foundation.element);
    });

    tableaus.forEach((tableau) => {
      this.domElements.tableausEl.append(tableau.element);
    });
    // Рендерим карты
    this.renderCards(deck, tableaus, stock, foundations);
    
  }
  
  renderCards(deck, tableaus, stock, foundations) {
    // Очищаем старые карты
    this.clearAllCards();
    // Рендерим карты в tableau
    this.renderCardsForTableau(tableaus);
    // Рендерим карты в foundations
    this.renderCardsForFoundation(foundations);
    // Устанавливаем стили для stock добавив класс
    this.renderStockElement(stock);
    // Рендерим карту в waste
    this.renderCardsForWaste(stock);
    this.addStockEventListeners(stock.element);
  }

  renderCardsForFoundation(foundations) {
    // console.log('ВВВВВВВВВВВ renderCardsForFoundation:', this.foundations);
    foundations.forEach((foundation, i) => {
      if (foundation.cards.length > 0) {
        const card = foundation.cards[foundation.cards.length - 1];
        this.renderCard(card, `foundation-${i}`, 0);
      }
    });
  }

  renderCardsForTableau(tableaus) {
    tableaus.forEach((tableau, i) => {
      // console.log('renderCardssssssssss', tableau);
      tableau.cards.forEach((card, j) => {
        this.renderCard(card, `tableau-${i}`, j);
      });
    });
  }

  renderCardsForWaste(stock) {
    const wasteCard = stock.getWasteCard();
    if (wasteCard) {
      this.renderCard(wasteCard, "waste", 0);
    }
  }

  renderStockElement(stock) {
    this.domElements.stockDivEl.innerHTML = "";
    stock.element = this.createStockElement();
    this.domElements.stockDivEl.append(stock.element, stock.wasteElement);
    // stock.element.addEventListener("click", () => {
    //   console.log('установка события на stock в renderStockElement');

    //   this.eventManager.emit(GameEvents.STOCK_CLICK);
    //   // this.audio.play();
    //   // this.stock.deal();
    // });
    // stock.element.classList.add("face-down");
    // if (this.stock.index === this.stock.cards.length) {
    //   console.log("if");

    //   this.stock.element.classList.replace("stock", "card-waste");
    // } else {
    //   this.stock.element.classList.add(
    //     "card-back",
    //     `${shopItemsShirt.selectedStyle}`
    //   );
    // }
  }
  ////////////////////////////////////////////////////////

  createStockElement() {
    const element = document.createElement("div");
    const span = document.createElement("span");
    element.className = "stock";
    element.id = "stock";
    // span.innerHTML = '<svg viewBox="0 0 24 24" width="90"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>';
    span.textContent = "↺";
    span.classList.add("stock-span");
    element.append(span);
    // element.style.left = "20px";
    // element.style.top = "20px";
    return element;
  }

  addStockEventListeners(stock) {
    stock.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.STOCK_CLICK);
    });
  }

  clearAllCards() {
    document.querySelectorAll(".card").forEach((card) => card.remove());
  }

  // renderStock() {
  //   const stock = this.stateManager.game.stock;
  //   const stockElement = this.domElements.stockContainer.firstChild;

  //   if (stock.isEmpty()) {
  //     stockElement.classList.add("empty");
  //     return;
  //   }

  //   stockElement.classList.remove("empty");
  //   stockElement.className = "stock " + this.stateManager.state.settings.cardBack;
  // }

  // renderWaste() {
  //   const waste = this.stateManager.game.stock.getWasteCard();
  //   const wasteElement = this.domElements.wasteContainer.firstChild;
  //   wasteElement.innerHTML = "";

  //   if (!waste) {
  //     wasteElement.classList.add("empty");
  //     return;
  //   }

  //   wasteElement.classList.remove("empty");
  //   this.renderCard(waste, "waste");
  // }

  // renderFoundations() {
  //   this.stateManager.game.foundations.forEach((foundation, index) => {
  //     const foundationElement = document.getElementById(`foundation-${index}`);
  //     foundationElement.innerHTML = "";

  //     if (foundation.isEmpty()) {
  //       foundationElement.classList.add("empty");
  //       return;
  //     }

  //     foundationElement.classList.remove("empty");
  //     const topCard = foundation.getTopCard();
  //     this.renderCard(topCard, `foundation-${index}`);
  //   });
  // }

  // renderTableaus() {
  //   this.stateManager.game.tableaus.forEach((tableau, index) => {
  //     const tableauElement = document.getElementById(`tableau-${index}`);
  //     tableauElement.innerHTML = "";

  //     tableau.cards.forEach((card, cardIndex) => {
  //       this.renderCard(card, `tableau-${index}`, cardIndex);
  //     });
  //   });
  // }

  // после
  renderCard(card, containerId, offset = 0) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Используем кэшированный элемент если есть
    // if (this.cache.has(card)) {
    //   const cachedElement = this.cache.get(card);
    //   container.append(cachedElement);
    //   this.updateCardPosition(cachedElement, containerId, offset);
    //   return;
    // }

    // Создаем новый элемент карты
    const cardElement = document.createElement("div");
    cardElement.className = `card ${card.color}`;
    cardElement.dataset.suit = card.suit;
    cardElement.dataset.value = card.value;

    // Создаем элементы для символов карты
    const topSymbol = document.createElement("span");
    topSymbol.className = "card-symbol top";
    topSymbol.textContent = card.getSymbol();

    const centerSymbol = document.createElement("span");
    centerSymbol.className = "card-symbol center";
    centerSymbol.textContent = card.suit;

    const bottomSymbol = document.createElement("span");
    bottomSymbol.className = "card-symbol bottom";
    bottomSymbol.textContent = card.getSymbol();

    // Собираем карту
    cardElement.append(topSymbol, centerSymbol, bottomSymbol);

    // Настройка рубашки/лица
    if (!card.faceUp) {
      cardElement.classList.add(
        "face-down",
        this.stateManager.state.settings.cardBackStyle
      );
    } else {
      cardElement.classList.add(this.stateManager.state.settings.cardFaceStyle);
    }

    // Позиционирование
    this.updateCardPosition(cardElement, containerId, offset);

    // Сохраняем в кэш
    // this.cache.set(card, cardElement);

    // Добавляем обработчики
    this.addCardEventListeners(cardElement, card);

    // Добавляем в DOM
    container.append(cardElement);

    // Сохраняем ссылку на DOM элемент в карте
    card.domElement = cardElement;
  }

  updateCardPosition(cardElement, containerId, offset) {
    const isTableau = containerId.startsWith("tableau");
    const offsetPx = offset * UIConfig.layout.card.overlap;

    cardElement.style.transform = isTableau ? `translateY(${offsetPx}px)` : "";

    cardElement.style.zIndex = offset;
  }

  addCardEventListeners(cardElement, card) {
    cardElement.addEventListener("click", () => {
      this.eventManager.emit(GameEvents.CARD_CLICK, card);
    });

    // Добавляем обработчики для drag and drop
    // cardElement.addEventListener("mousedown", (e) => {
    //   this.handleDragStart(e, card, cardElement);
    // });

    // cardElement.addEventListener(
    //   "touchstart",
    //   (e) => {
    //     this.handleDragStart(e, card, cardElement);
    //   },
    //   { passive: true }
    // );
  }

  handleDragStart(e, card, cardElement) {
    if (this.stateManager.game.isPaused) return;

    this.eventManager.emit("card:drag:start", {
      card,
      element: cardElement,
      clientX: e.clientX || e.touches[0].clientX,
      clientY: e.clientY || e.touches[0].clientY,
    });
  }

  animateCardMove({ card, from, to }) {
    const cardElement = card.domElement;
    if (!cardElement) return;

    const fromElement = document.getElementById(from);
    const toElement = document.getElementById(to);

    if (!fromElement || !toElement) return;

    // Animator.moveCard({
    Animator.animateCardMove({
      element: cardElement,
      from: fromElement,
      to: toElement,
      duration: UIConfig.animations.cardMoveDuration,
      onComplete: () => {
        this.cache.delete(card);
        // this.renderFullGame();
        this.renderCards();
      },
    });
  }

  animateCardFlip(card) {
    const cardElement = card.domElement;
    if (!cardElement) return;

    Animator.flipCard({
      element: cardElement,
      duration: UIConfig.animations.cardFlipDuration,
      onComplete: () => {
        cardElement.classList.remove(
          "face-down",
          this.stateManager.state.settings.cardBack
        );
        cardElement.classList.add(this.stateManager.state.settings.cardFace);
        this.addCardEventListeners(cardElement, card);
      },
    });
  }

  animateUndoMove({ card, from, to }) {
    // Анимация обратного перемещения
    this.animateCardMove({ card, from: to, to: from });
  }

  showHint(hint) {
    const { card, target } = hint;
    const cardElement = card.domElement;
    const targetElement = document.getElementById(target);

    if (!cardElement || !targetElement) return;

    // Подсвечиваем карту и цель
    Animator.highlightElement(cardElement, {
      color: "#ffeb3b",
      duration: 2000,
    });
    Animator.highlightElement(targetElement, {
      color: "#4caf50",
      duration: 2000,
    });

    // Показываем подсказку в UI
    this.eventManager.emit("ui:hint:show", hint);
  }

  applyTheme(themeName) {
    const theme = UIConfig.themes[themeName] || UIConfig.themes.default;

    // Применяем цвета темы
    document.documentElement.style.setProperty(
      "--primary-color",
      theme.colors.primary
    );
    document.documentElement.style.setProperty(
      "--secondary-color",
      theme.colors.secondary
    );
    document.documentElement.style.setProperty(
      "--background-color",
      theme.colors.background
    );
    document.documentElement.style.setProperty(
      "--text-color",
      theme.colors.text
    );

    // Применяем шрифты
    document.documentElement.style.setProperty("--main-font", theme.fonts.main);
    document.documentElement.style.setProperty(
      "--title-font",
      theme.fonts.title
    );
  }

  clearCache() {
    this.cache.clear();
  }
}
