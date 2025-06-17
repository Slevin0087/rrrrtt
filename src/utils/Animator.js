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
      tempCard.style.background =
        "repeating-linear-gradient(45deg,#1a5a1a,#1a5a1a 10px,#165016 20px)";

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

  // static showPointsAnimation(card, points) {
  //   // Получаем DOM-элемент карты
  //   const cardElement = card.domElement;
  //   if (!cardElement) return;

  //   // Создаем элемент для отображения очков
  //   const pointsElement = document.createElement("div");
  //   pointsElement.className = "points-popup";
  //   pointsElement.textContent = `+${points}`;

  //   // Позиционируем элемент относительно карты
  //   const cardRect = cardElement.getBoundingClientRect();
  //   pointsElement.style.left = `${cardRect.left + cardRect.width / 2 - 20}px`;
  //   pointsElement.style.top = `${cardRect.top}px`;

  //   // Добавляем в DOM
  //   document.body.appendChild(pointsElement);

  //   // Удаляем элемент после завершения анимации
  //   setTimeout(() => {
  //     pointsElement.remove();
  //   }, 1500);
  // }

  static showPointsAnimation(card, points) {
    const cardElement = card.domElement;
    if (!cardElement) return;

    const pointsElement = document.createElement("div");
    pointsElement.className = "points-popup";
    pointsElement.textContent = `+${points}`;

    // 1. Позиционирование через transform + left/top (для iOS)
    const cardRect = cardElement.getBoundingClientRect();
    pointsElement.style.left = `${cardRect.left + cardRect.width / 2}px`;
    pointsElement.style.top = `${cardRect.top}px`;

    // 2. Форсируем запуск анимации
    document.body.appendChild(pointsElement);
    // void pointsElement.offsetWidth; // Триггер перерасчёта стилей

    // // 3. Удаление с задержкой
    // setTimeout(() => {
    //   pointsElement.style.opacity = "0"; // Плавное исчезновение
    //   setTimeout(() => pointsElement.remove(), 300);
    // }, 1200);
    // Анимация через GSAP
    gsap.fromTo(
      pointsElement,
      {
        opacity: 1,
        x: "-50%",
        y: 0,
      },
      {
        opacity: 0,
        y: -100,
        duration: 1.2,
        ease: "power1.out",
        onComplete: () => pointsElement.remove(),
      }
    );
  }

  // static animationCoinsEarned(text, options = {}) {
  //   return new Promise((resolve) => {
  //     // Параметры по умолчанию
  //     const {
  //       duration = 2000, // Общая продолжительность анимации
  //       fontSize = "24px", // Начальный размер шрифта
  //       targetFontSize = "32px", // Размер при увеличении
  //       color = "#ffeb3b", // Цвет текста
  //       position = "center", // Позиция на экране
  //       fadeInDuration = 300, // Длительность появления
  //       fadeOutDuration = 1000, // Длительность исчезновения
  //     } = options;

  //     // Создаем элемент для текста
  //     const textElement = document.createElement("div");
  //     textElement.className = "animated-text";
  //     textElement.textContent = text;
  //     textElement.style.position = "fixed";
  //     textElement.style.color = color;
  //     textElement.style.fontSize = fontSize;
  //     textElement.style.fontWeight = "bold";
  //     textElement.style.textShadow = "0 0 5px rgba(0,0,0,0.5)";
  //     textElement.style.pointerEvents = "none";
  //     textElement.style.zIndex = "2000";
  //     textElement.style.opacity = "0";
  //     textElement.style.transition = `all ${fadeInDuration}ms ease-out`;

  //     // Позиционирование
  //     switch (position) {
  //       case "center":
  //         textElement.style.top = "50%";
  //         textElement.style.left = "50%";
  //         textElement.style.transform = "translate(-50%, -50%)";
  //         break;
  //       case "top":
  //         textElement.style.top = "20%";
  //         textElement.style.left = "50%";
  //         textElement.style.transform = "translateX(-50%)";
  //         break;
  //       case "bottom":
  //         textElement.style.bottom = "20%";
  //         textElement.style.left = "50%";
  //         textElement.style.transform = "translateX(-50%)";
  //         break;
  //       default:
  //         if (position.x !== undefined && position.y !== undefined) {
  //           textElement.style.left = `${position.x}px`;
  //           textElement.style.top = `${position.y}px`;
  //         }
  //     }

  //     document.body.appendChild(textElement);

  //     // Анимация
  //     requestAnimationFrame(() => {
  //       // Фаза 1: Появление
  //       textElement.style.opacity = "1";

  //       setTimeout(() => {
  //         // Фаза 2: Увеличение
  //         textElement.style.transition = `all ${duration / 3}ms ease-in-out`;
  //         textElement.style.fontSize = targetFontSize;

  //         setTimeout(() => {
  //           // Фаза 3: Возврат к исходному размеру
  //           textElement.style.fontSize = fontSize;

  //           setTimeout(() => {
  //             // Фаза 4: Исчезновение
  //             textElement.style.transition = `opacity ${fadeOutDuration}ms ease-out`;
  //             textElement.style.opacity = "0";

  //             setTimeout(() => {
  //               textElement.remove();
  //               resolve();
  //             }, fadeOutDuration);
  //           }, duration / 3);
  //         }, duration / 3);
  //       }, fadeInDuration);
  //     });
  //   });
  // }

  static animationCoinsEarned(text, options = {}) {
    return new Promise((resolve) => {
      // Параметры по умолчанию
      const {
        duration = 2, // Продолжительность в секундах (GSAP использует секунды)
        fontSize = "24px",
        targetFontSize = "32px",
        color = "#ffeb3b",
        position = "center",
        fadeInDuration = 0.3,
        fadeOutDuration = 1,
      } = options;

      // Создаем элемент для текста
      const textElement = document.createElement("div");
      textElement.className = "animated-text";
      textElement.textContent = text;
      textElement.style.position = "fixed";
      textElement.style.color = color;
      textElement.style.fontSize = fontSize;
      textElement.style.fontWeight = "bold";
      textElement.style.textShadow = "0 0 5px rgba(0,0,0,0.5)";
      textElement.style.pointerEvents = "none";
      textElement.style.zIndex = "2000";
      textElement.style.opacity = "0";
      textElement.style.whiteSpace = "nowrap"; // Предотвращаем перенос текста

      // Позиционирование
      switch (position) {
        case "center":
          textElement.style.left = "50%";
          textElement.style.top = "50%";
          textElement.style.transform = "translate(-50%, -50%)";
          break;
        case "top":
          textElement.style.left = "50%";
          textElement.style.top = "20%";
          textElement.style.transform = "translateX(-50%)";
          break;
        case "bottom":
          textElement.style.left = "50%";
          textElement.style.bottom = "20%";
          textElement.style.transform = "translateX(-50%)";
          break;
        default:
          if (position.x !== undefined && position.y !== undefined) {
            textElement.style.left = `${position.x}px`;
            textElement.style.top = `${position.y}px`;
          }
      }

      document.body.appendChild(textElement);

      // GSAP анимация
      const timeline = gsap.timeline({
        onComplete: () => {
          textElement.remove();
          resolve();
        },
      });

      // 1. Появление
      timeline.fromTo(
        textElement,
        { opacity: 0 },
        { opacity: 1, duration: fadeInDuration }
      );

      // 2. Увеличение текста с сохранением позиции
      timeline.to(textElement, {
        fontSize: targetFontSize,
        duration: duration / 3,
        ease: "power1.inOut",
      });

      // 3. Возврат к исходному размеру
      timeline.to(textElement, {
        fontSize: fontSize,
        duration: duration / 3,
        ease: "power1.inOut",
      });

      // 4. Исчезновение
      timeline.to(textElement, {
        opacity: 0,
        duration: fadeOutDuration,
        ease: "power1.out",
      });
    });
  }
}
