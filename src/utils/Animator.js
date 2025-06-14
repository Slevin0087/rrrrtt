export class Animator {
  /**
   * Анимация раздачи карт из стока в tableau
   * @param {HTMLElement} stockElement - DOM элемент стока
   * @param {HTMLElement[]} tableauElements - Массив DOM элементов tableau
   * @param {number} duration - Продолжительность анимации
   * @param {number} delayBetweenCards - Задержка между картами
   */
  static dealCardsAnimation(
    stockElement,
    tableauElements,
    duration = 500,
    delayBetweenCards = 100
  ) {
    return new Promise((resolve) => {
      // Создаем временную карту для анимации
      const tempCard = document.createElement("div");
      tempCard.className = "card face-down";
      tempCard.style.position = "absolute";
      tempCard.style.zIndex = "1000";
      tempCard.style.background = 'repeating-linear-gradient(45deg,#1a5a1a,#1a5a1a 10px,#165016 20px)'

      // Позиционируем временную карту поверх стока
      const stockRect = stockElement.getBoundingClientRect();
      tempCard.style.width = `${stockRect.width}px`;
      tempCard.style.height = `${stockRect.height}px`;
      tempCard.style.left = `${stockRect.left}px`;
      tempCard.style.top = `${stockRect.top}px`;

      document.body.appendChild(tempCard);

      let completedAnimations = 0;
      const totalAnimations =
        (tableauElements.length * (tableauElements.length + 1)) / 2; // Формула треугольного числа

      // Функция для анимации перемещения карты
      const animateCardToTableau = (tableauIndex, cardIndex, delay) => {
        setTimeout(() => {
          const tableau = tableauElements[tableauIndex];
          const tableauRect = tableau.getBoundingClientRect();

          // Рассчитываем конечную позицию с учетом смещения в tableau
          // const offsetY = cardIndex * UIConfig.layout.card.overlap;
          const offsetY = cardIndex * 20;
          // Клонируем временную карту для каждой анимации
          const cardClone = tempCard.cloneNode();
          document.body.appendChild(cardClone);

          // Анимация перемещения
          cardClone.style.transition = `transform ${duration}ms ease-out`;
          cardClone.style.transform = `translate(${
            tableauRect.left - stockRect.left
          }px, ${tableauRect.top - stockRect.top + offsetY}px)`;

          // По завершении анимации
          setTimeout(() => {
            cardClone.remove();
            completedAnimations++;

            if (completedAnimations === totalAnimations) {
              tempCard.remove();
              resolve();
            }
          }, duration);
        }, delay);
      };

      // Запускаем анимации для каждой карты по схеме игры
      let delay = 0;
      for (let i = 0; i < tableauElements.length; i++) {
        for (let j = 0; j <= i; j++) {
          animateCardToTableau(i, j, delay);
          delay += delayBetweenCards;
        }
      }
    });
  }

  static animateCardMove(cardElement, targetElement, duration = 300) {
    return new Promise((resolve) => {
      const startRect = cardElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();

      const deltaX = targetRect.left - startRect.left;
      const deltaY = targetRect.top - startRect.top;

      cardElement.style.transition = "none";
      cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      cardElement.style.zIndex = "1000";

      requestAnimationFrame(() => {
        cardElement.style.transition = `transform ${duration}ms ease-in-out`;
        cardElement.style.transform = "translate(0, 0)";

        setTimeout(() => {
          cardElement.style.zIndex = "";
          resolve();
        }, duration);
      });
    });
  }

  static animate({
    element,
    from,
    to,
    duration,
    delay = 0,
    easing = "linear",
  }) {
    return new Promise((resolve) => {
      element.style.transition = `all ${duration}ms ${easing}`;
      element.style.transform = `rotate(${from.rotate}deg) scale(${from.scale})`;

      setTimeout(() => {
        element.style.transform = `rotate(${to.rotate}deg) scale(${to.scale})`;

        setTimeout(() => {
          resolve();
        }, duration);
      }, delay);
    });
  }

  static flipCard(cardElement, duration = 200) {
    return new Promise((resolve) => {
      cardElement.style.transform = "rotateY(90deg)";

      setTimeout(() => {
        cardElement.style.transform = "rotateY(0deg)";
        setTimeout(resolve, duration);
      }, duration);
    });
  }

  static fadeIn(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.opacity = "0";
      element.style.display = "block";
      element.style.transition = `opacity ${duration}ms ease-out`;

      requestAnimationFrame(() => {
        element.style.opacity = "1";
        setTimeout(resolve, duration);
      });
    });
  }

  static fadeOut(element, duration = 300) {
    return new Promise((resolve) => {
      element.style.opacity = "1";
      element.style.transition = `opacity ${duration}ms ease-out`;
      element.style.opacity = "0";

      setTimeout(() => {
        element.style.display = "none";
        resolve();
      }, duration);
    });
  }

  static pulse(element, duration = 1000, repeat = true) {
    element.style.animation = `pulse ${duration}ms infinite`;

    if (!repeat) {
      setTimeout(() => {
        element.style.animation = "";
      }, duration);
    }
  }

  static showPointsAnimation(card, points) {
    // Получаем DOM-элемент карты
    const cardElement = card.domElement;
    if (!cardElement) return;

    // Создаем элемент для отображения очков
    const pointsElement = document.createElement("div");
    pointsElement.className = "points-popup";
    pointsElement.textContent = `+${points}`;

    // Позиционируем элемент относительно карты
    const cardRect = cardElement.getBoundingClientRect();
    pointsElement.style.left = `${cardRect.left + cardRect.width / 2 - 20}px`;
    pointsElement.style.top = `${cardRect.top}px`;

    // Добавляем в DOM
    document.body.appendChild(pointsElement);

    // Удаляем элемент после завершения анимации
    setTimeout(() => {
      pointsElement.remove();
    }, 1500);
  }
}
