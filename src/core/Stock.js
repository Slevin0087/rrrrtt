export class Stock {
  constructor() {
    this.cards = [];
    // this.waste = [];
    this.index = 0; // Текущая позиция в стоке
    this.wasteElement = this.createWasteElement();
  }

  createWasteElement() {
    const element = document.createElement("div");
    // element.className = "card-placeholder";
    element.className = "card-waste";
    element.id = "waste";
    // element.style.left = "110px";
    // element.style.top = "20px";
    return element;
  }

  addCards(cards) {
    this.cards = cards;
    this.index = 0;
    this.updatePositions("stock");
    // this.waste = [];
  }

  deal() {
    console.log("в deal this.index:", this.index);

    if (this.index >= this.cards.length) {
      console.log("в deal if (this.index >= this.cards.length)");
      // if (this.waste.length === 0) return null;
      console.log("в deal if (this.waste.length === 0)");
      this.recycleWaste();
      return null;
    }
    const card = this.cards[this.index];
    console.log("в deal else CARD:", card);
    card.faceUp = true; // Карты в стоке рубашкой вверх
    this.index++;
    console.log("в deal this.index ПОСЛЕ:", this.index);
    return card;
  }

  // moveToWaste(card) {
  //   card.faceUp = true;
  //   // this.waste.push(card);
  // }

  // getWasteCard() {
  //   return this.waste.length > 0 ? this.waste[this.waste.length - 1] : null;
  // }

  getWasteCard() {
    if (this.index > 0) {
      const wasteCard = this.cards[this.index - 1];
      wasteCard.positionData.parent = "waste";
      return wasteCard;
    }
    return null;
  }

  removeCurrentCard(card) {
    this.index--;
    const cardFilter = this.cards.filter((c) => c !== card);
    return this.cards = cardFilter;
  }

  // takeFromWaste() {
  //   return this.waste.pop();
  // }

  recycleWaste() {
    this.index = 0;
    this.updatePositions("stock");
  }

  isEmpty() {
    return this.cards.length === 0 && this.waste.length === 0;
  }

  updatePositions(container) {
    this.cards.forEach((card, index) => {
      card.faceUp = false;
      card.positionData.parent = container;
      card.positionData.position = index;
      // card.positionData.offset = index * 2;
      // card.positionData.zIndex = index;
      card.positionData.offset = 0;
      card.positionData.zIndex = 0;
    });
  }

  serialize() {
    return {
      cards: this.cards.map((card) => card.serialize()),
      waste: this.waste.map((card) => card.serialize()),
      index: this.index,
    };
  }

  static deserialize(data) {
    const stock = new Stock();
    stock.cards = data.cards.map((cardData) => Card.deserialize(cardData));
    stock.waste = data.waste.map((cardData) => Card.deserialize(cardData));
    stock.index = data.index;
    return stock;
  }
}
