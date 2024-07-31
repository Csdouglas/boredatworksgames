document.addEventListener("DOMContentLoaded", () => {
  const difficultySettings = {
    easy: { size: 8, mines: 10 },
    medium: { size: 16, mines: 40 },
    hard: { size: 24, mines: 99 },
  };
  let BOARD_SIZE = difficultySettings.easy.size;
  let MINE_COUNT = difficultySettings.easy.mines;
  let board = [];
  let mineCount = MINE_COUNT;
  let timer;
  let timeElapsed = 0;
  let firstClick = true;

  const boardElement = document.getElementById("board");
  const mineCountElement = document.getElementById("mine-count");
  const timerElement = document.getElementById("timer");
  const resetButton = document.getElementById("reset-button");
  const difficultySelect = document.getElementById("difficulty");

  function initBoard() {
    board = Array(BOARD_SIZE)
      .fill()
      .map(() =>
        Array(BOARD_SIZE)
          .fill()
          .map(() => ({
            isMine: false,
            isOpened: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
      );
    mineCountElement.textContent = mineCount;
    renderBoard();
  }

  function placeMines(excludeRow, excludeCol) {
    const excludeCells = [
      [excludeRow, excludeCol],
      [excludeRow - 1, excludeCol],
      [excludeRow + 1, excludeCol],
      [excludeRow, excludeCol - 1],
      [excludeRow, excludeCol + 1],
      [excludeRow - 1, excludeCol - 1],
      [excludeRow - 1, excludeCol + 1],
      [excludeRow + 1, excludeCol - 1],
      [excludeRow + 1, excludeCol + 1],
    ];

    let placedMines = 0;
    while (placedMines < MINE_COUNT) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      if (
        !board[row][col].isMine &&
        !excludeCells.some(([r, c]) => r === row && c === col)
      ) {
        board[row][col].isMine = true;
        placedMines++;
      }
    }
    calculateAdjacentMines();
  }

  function calculateAdjacentMines() {
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col].isMine) continue;
        let mines = 0;
        for (const [dx, dy] of directions) {
          const newRow = row + dx;
          const newCol = col + dy;
          if (
            newRow >= 0 &&
            newRow < BOARD_SIZE &&
            newCol >= 0 &&
            newCol < BOARD_SIZE &&
            board[newRow][newCol].isMine
          ) {
            mines++;
          }
        }
        board[row][col].adjacentMines = mines;
      }
    }
  }

  function renderBoard() {
    boardElement.innerHTML = "";
    boardElement.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 30px)`;
    boardElement.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 30px)`;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        cellElement.dataset.row = row;
        cellElement.dataset.col = col;
        if (board[row][col].isOpened) {
          cellElement.classList.add("opened");
          if (board[row][col].isMine) {
            cellElement.classList.add("mine");
          } else if (board[row][col].adjacentMines > 0) {
            cellElement.textContent = board[row][col].adjacentMines;
          }
        } else if (board[row][col].isFlagged) {
          cellElement.classList.add("flagged");
        }
        cellElement.addEventListener("click", handleCellClick);
        cellElement.addEventListener("contextmenu", handleCellFlag);
        boardElement.appendChild(cellElement);
      }
    }
  }

  function handleCellClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    if (board[row][col].isOpened || board[row][col].isFlagged) return;

    if (firstClick) {
      placeMines(row, col);
      startTimer();
      firstClick = false;
    }

    if (board[row][col].isMine) {
      gameOver(false);
    } else {
      openCell(row, col);
      checkVictory();
    }
  }

  function handleCellFlag(event) {
    event.preventDefault();
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    if (board[row][col].isOpened) return;
    board[row][col].isFlagged = !board[row][col].isFlagged;
    mineCount += board[row][col].isFlagged ? -1 : 1;
    mineCountElement.textContent = mineCount;
    renderBoard();
  }

  function openCell(row, col) {
    if (
      row < 0 ||
      row >= BOARD_SIZE ||
      col < 0 ||
      col >= BOARD_SIZE ||
      board[row][col].isOpened ||
      board[row][col].isFlagged
    )
      return;
    board[row][col].isOpened = true;
    if (board[row][col].adjacentMines === 0) {
      openAdjacentCells(row, col);
    }
    renderBoard();
  }

  function openAdjacentCells(row, col) {
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ];
    for (const [dx, dy] of directions) {
      openCell(row + dx, col + dy);
    }
  }

  function gameOver(won) {
    clearInterval(timer);
    alert(won ? "Congratulations! You won!" : "Game Over! You hit a mine.");
    resetGame();
  }

  function checkVictory() {
    let openedCells = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col].isOpened) openedCells++;
      }
    }
    if (openedCells === BOARD_SIZE * BOARD_SIZE - MINE_COUNT) {
      gameOver(true);
    }
  }

  function startTimer() {
    timer = setInterval(() => {
      timeElapsed++;
      timerElement.textContent = timeElapsed;
    }, 1000);
  }

  function resetGame() {
    clearInterval(timer);
    firstClick = true;
    timeElapsed = 0;
    timerElement.textContent = timeElapsed;
    const difficulty = difficultySelect.value;
    BOARD_SIZE = difficultySettings[difficulty].size;
    MINE_COUNT = difficultySettings[difficulty].mines;
    mineCount = MINE_COUNT;
    mineCountElement.textContent = mineCount;
    initBoard();
  }

  resetButton.addEventListener("click", resetGame);
  difficultySelect.addEventListener("change", resetGame);

  initBoard();
});
