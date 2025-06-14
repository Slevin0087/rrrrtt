import { CardValues } from "../utils/Constants.js";

export class Foundation {
  constructor(index) {
    this.index = index;
    this.cards = [];
    this.suit = null;
    this.element = this.createFoundationElement();
  }

  createFoundationElement() {
    const element = document.createElement("div");
    const span = document.createElement("span");
    element.className = "foundation";
    element.id = `foundation-${this.index}`;
    span.textContent = "A";
    span.classList.add("foundation-span");
    element.append(span);

    // element.style.left = 290 + this.index * 90 + "px";
    // element.style.top = "20px";
    return element;
  }

  canAccept(card, tableaus) {

    if (!card.faceUp) return false;
    if (card.positionData.parent.includes("foundation")) return false;
    if (card.positionData.parent.includes("tableau")) {
      
      const tableauIndex = parseInt(card.positionData.parent.split("-")[1]);
      console.log('ESSSSSSSSSSSSSSS:', tableauIndex);
      console.log('WWWWWWWWWWWWWWWWWWWWWWWWWWW:', tableaus[tableauIndex].cards.length);
      
      if (tableaus[tableauIndex].cards.length > card.positionData.position + 1) return false;
    };
    // Если фундамент пустой, принимаем только тузы
    if (this.isEmpty()) {
      return card.value === "A";
    }
    // Проверяем последовательность и масть
    const topCard = this.getTopCard();
    return (
      card.suit === topCard.suit && card.getRank() === topCard.getRank() + 1
    );
  }

  addCard(card) {
    const position = this.cards.length;
    card.positionData = {
      parent: `foundation-${this.index}`,
      position: position,
      index: this.index,
      offset: 0,
      zIndex: position,
    };
    this.cards.push(card);
  }

  getTopCard() {
    return this.cards.length > 0 ? this.cards[this.cards.length - 1] : null;
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  isComplete() {
    return this.cards.length === CardValues.length;
  }

  removeTopCard() {
    if (this.isEmpty()) return null;
    return this.cards.pop();
  }

  serialize() {
    return {
      index: this.index,
      suit: this.suit,
      cards: this.cards.map((card) => card.serialize()),
    };
  }

  static deserialize(data) {
    const foundation = new Foundation(data.index);
    foundation.suit = data.suit;
    foundation.cards = data.cards.map((cardData) => card.deserialize(cardData));
    return foundation;
  }
}
