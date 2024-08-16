document.addEventListener("DOMContentLoaded", () => {
  const tilesContainer = document.getElementById("tiles");
  const rollDiceButton = document.getElementById("rollDice");
  const die1 = document.getElementById("die1");
  const die2 = document.getElementById("die2");
  const newGameButton = document.getElementById("newGame");
  const messageContainer = document.getElementById("message");

  const diceImages = [
    "https://hw-fileuploader.s3.amazonaws.com/Courtney/dice-six-faces-one.png", // 1
    "https://hw-fileuploader.s3.amazonaws.com/Courtney/dice-six-faces-two.png", // 2
    "https://hw-fileuploader.s3.amazonaws.com/Courtney/dice-six-faces-three.png", // 3
    "https://hw-fileuploader.s3.amazonaws.com/Courtney/dice-six-faces-four.png", // 4
    "https://hw-fileuploader.s3.amazonaws.com/Courtney/dice-six-faces-five.png", // 5
    "https://hw-fileuploader.s3.amazonaws.com/Courtney/dice-six-faces-six.png", // 6
  ];

  const defaultDiceImage =
    "https://hw-fileuploader.s3.amazonaws.com/Courtney/dice-fire.png";

  let tiles = [];
  let dice = [];
  let selectedTiles = [];
  let gameOver = false;

  function initGame() {
    tiles = [];
    dice = [];
    selectedTiles = [];
    gameOver = false;
    messageContainer.textContent = "";
    tilesContainer.innerHTML = "";
    die1.src = defaultDiceImage;
    die2.src = defaultDiceImage;

    for (let i = 1; i <= 12; i++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.textContent = i;
      tile.addEventListener("click", () => {
        if (!tile.classList.contains("closed") && !gameOver) {
          if (!selectedTiles.includes(tile)) {
            selectedTiles.push(tile);
            tile.classList.add("selected");
          } else {
            selectedTiles = selectedTiles.filter((t) => t !== tile);
            tile.classList.remove("selected");
          }
          checkSelection();
        }
      });
      tilesContainer.appendChild(tile);
      tiles.push(tile);
    }
  }

  function rollDice() {
    if (gameOver) return;

    if (die1.src === defaultDiceImage && die2.src === defaultDiceImage) {
      const numRolls = 20;
      let currentRoll = 0;

      function animateDice() {
        if (currentRoll < numRolls) {
          die1.src = diceImages[Math.floor(Math.random() * diceImages.length)];
          die2.src = diceImages[Math.floor(Math.random() * diceImages.length)];
          currentRoll++;
          setTimeout(animateDice, 50);
        } else {
          dice = [randomDie(), randomDie()];
          displayDice();
          selectedTiles.forEach((tile) => tile.classList.remove("selected"));
          selectedTiles = [];
          messageContainer.textContent = "";
          checkGameOver();
        }
      }

      animateDice();
    } else {
      messageContainer.textContent =
        "Error: You cannot roll the dice again until you select!";
    }
  }

  function displayDice() {
    die1.src = diceImages[dice[0] - 1];
    die2.src = diceImages[dice[1] - 1];
  }

  function randomDie() {
    return Math.floor(Math.random() * 6) + 1;
  }

  function checkSelection() {
    const selectedSum = selectedTiles.reduce(
      (sum, tile) => sum + parseInt(tile.textContent),
      0
    );
    const diceSum = dice.reduce((sum, die) => sum + die, 0);

    if (selectedSum === diceSum) {
      selectedTiles.forEach((tile) => tile.classList.add("closed"));
      dice = [];
      die1.src = defaultDiceImage;
      die2.src = defaultDiceImage;
      selectedTiles = [];
      checkGameOver();
    }
  }

  function checkGameOver() {
    const openTiles = tiles.filter(
      (tile) => !tile.classList.contains("closed")
    );

    if (openTiles.length === 0) {
      gameOver = true;
      showPopup(`Congratulations! You won!`);
      return;
    }

    const diceSum = dice.reduce((sum, die) => sum + die, 0);
    const validMoveExists = isValidMoveAvailable(openTiles, diceSum);

    if (dice.length > 0 && !validMoveExists) {
      gameOver = true;
      const score = openTiles.reduce(
        (sum, tile) => sum + parseInt(tile.textContent),
        0
      );
      showPopup(`Game Over! Your score is ${score}`);
    }
  }
  // Adjust the showPopup function to not interfere with the board display
  function showPopup(message) {
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
        <p>${message}</p>
        <button id="close-popup-button">Close</button>
    `;
    document.body.appendChild(popup);

    document
      .getElementById("close-popup-button")
      .addEventListener("click", closePopup);
  }

  function closePopup() {
    const popup = document.querySelector(".popup");
    if (popup) {
      popup.remove();
    }
  }
  function isValidMoveAvailable(openTiles, diceSum) {
    const openTileValues = openTiles.map((tile) => parseInt(tile.textContent));
    return canSum(openTileValues, diceSum);
  }

  function canSum(numbers, target) {
    if (target === 0) return true;
    if (target < 0 || numbers.length === 0) return false;
    const [first, ...rest] = numbers;
    return canSum(rest, target - first) || canSum(rest, target);
  }

  rollDiceButton.addEventListener("click", rollDice);
  newGameButton.addEventListener("click", initGame);

  initGame();
});
