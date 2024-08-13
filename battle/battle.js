document.addEventListener("DOMContentLoaded", () => {
  const playerGrid = document.getElementById("player-grid");
  const opponentGrid = document.getElementById("opponent-grid");
  const startGameButton = document.getElementById("start-game");
  const placeShipButton = document.getElementById("place-ship");

  const width = 10;
  const playerSquares = [];
  const opponentSquares = [];
  let isGameStarted = false;

  // Create Grids
  function createGrid(grid, squares) {
    for (let i = 0; i < width * width; i++) {
      const square = document.createElement("div");
      square.dataset.id = i;
      grid.appendChild(square);
      squares.push(square);
    }
  }

  createGrid(playerGrid, playerSquares);
  createGrid(opponentGrid, opponentSquares);

  // Place Ship (for demo purposes, we place a single ship randomly)
  placeShipButton.addEventListener("click", () => {
    if (!isGameStarted) {
      let shipPosition = Math.floor(Math.random() * playerSquares.length);
      playerSquares[shipPosition].classList.add("ship");
    }
  });

  // Start Game
  startGameButton.addEventListener("click", () => {
    isGameStarted = true;
    opponentSquares.forEach((square) => {
      square.addEventListener("click", handleAttack);
    });
  });

  // Handle Attack
  function handleAttack(e) {
    const square = e.target;
    if (square.classList.contains("ship")) {
      square.classList.add("hit");
    } else {
      square.classList.add("miss");
    }
  }
});
