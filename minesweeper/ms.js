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
  let testingMode = false;

  const boardElement = document.getElementById("board");
  const mineCountElement = document.getElementById("mine-count");
  const timerElement = document.getElementById("timer");
  const resetButton = document.getElementById("reset-button");
  const testingButton = document.getElementById("testing-button");
  const difficultySelect = document.getElementById("difficulty");
  const highScoresElement = document.getElementById("high-scores");

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
    loadHighScores();
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
        if (testingMode && board[row][col].isMine) {
          cellElement.classList.add("testing");
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
    if (won) {
      saveHighScore();
    }
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

  function saveHighScore() {
    const difficulty = difficultySelect.value;
    const highScores = JSON.parse(localStorage.getItem("highScores")) || {};
    highScores[difficulty] = highScores[difficulty] || [];
    highScores[difficulty].push(timeElapsed);
    highScores[difficulty].sort((a, b) => a - b);
    if (highScores[difficulty].length > 5) {
      highScores[difficulty].pop();
    }
    localStorage.setItem("highScores", JSON.stringify(highScores));
    loadHighScores();
  }

  function loadHighScores() {
    const highScores = JSON.parse(localStorage.getItem("highScores")) || {};
    const difficulty = difficultySelect.value;
    const highScoreList = highScores[difficulty] || [];
    if (!Array.isArray(highScoreList)) {
      highScores[difficulty] = [];
      localStorage.setItem("highScores", JSON.stringify(highScores));
    }
    highScoresElement.innerHTML = `<h3>Top 5 High Scores (${difficulty}):</h3>`;
    if (highScoreList.length === 0) {
      highScoresElement.innerHTML += "<p>None</p>";
    } else {
      highScoresElement.innerHTML += `<ol>${highScoreList
        .map((score) => `<li>${score}s</li>`)
        .join("")}</ol>`;
    }
    console.log(`High Scores for ${difficulty}:`, highScoreList);
  }

  function toggleTestingMode() {
    testingMode = !testingMode;
    renderBoard();
  }

  resetButton.addEventListener("click", resetGame);
  testingButton.addEventListener("click", toggleTestingMode);
  difficultySelect.addEventListener("change", resetGame);

  initBoard();
});
