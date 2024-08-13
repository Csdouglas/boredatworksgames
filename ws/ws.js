document.addEventListener("DOMContentLoaded", () => {
  const boardSize = { rows: 8, cols: 6 };
  const theme = "Back and Forth";
  const spangram = "PALINDROMES";
  const words = ["RACECAR", "KAYAK", "MADAM", "LEVEL", "DEIFIED", "RADAR"];
  let nonThemeWordCount = 0;

  const board = document.getElementById("board");
  const themeTitle = document.getElementById("theme-title");
  const nonThemeCount = document.getElementById("non-theme-count");
  const hintButton = document.getElementById("hint-button");

  themeTitle.textContent = theme;

  // Initialize board
  const boardCells = [];
  for (let row = 0; row < boardSize.rows; row++) {
    for (let col = 0; col < boardSize.cols; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      board.appendChild(cell);
      boardCells.push(cell);
    }
  }

  // Create adjacency list for graph representation
  const adjacencyList = createAdjacencyList(boardSize);

  // Place the spangram and words
  placeWords(spangram, words);

  function createAdjacencyList(size) {
    const list = new Map();
    for (let row = 0; row < size.rows; row++) {
      for (let col = 0; col < size.cols; col++) {
        const neighbors = [];
        if (row > 0) neighbors.push({ row: row - 1, col });
        if (row < size.rows - 1) neighbors.push({ row: row + 1, col });
        if (col > 0) neighbors.push({ row, col: col - 1 });
        if (col < size.cols - 1) neighbors.push({ row, col: col + 1 });
        if (row > 0 && col > 0) neighbors.push({ row: row - 1, col: col - 1 });
        if (row > 0 && col < size.cols - 1)
          neighbors.push({ row: row - 1, col: col + 1 });
        if (row < size.rows - 1 && col > 0)
          neighbors.push({ row: row + 1, col: col - 1 });
        if (row < size.rows - 1 && col < size.cols - 1)
          neighbors.push({ row: row + 1, col: col + 1 });
        list.set(`${row},${col}`, neighbors);
      }
    }
    return list;
  }

  function placeWords(spangram, words) {
    // Clear the board
    boardCells.forEach((cell) => {
      cell.textContent = "";
      cell.classList.remove("themed");
    });

    // Try to place the spangram
    let spangramPlaced = false;
    let spangramAttempts = 0;
    while (!spangramPlaced && spangramAttempts < 100) {
      spangramPlaced = placeSpangram(spangram);
      spangramAttempts++;
    }
    if (!spangramPlaced) {
      console.error("Failed to place spangram after 100 attempts.");
      return;
    }

    // Partition words and place them
    let wordsPlaced = false;
    let wordsAttempts = 0;
    while (!wordsPlaced && wordsAttempts < 100) {
      wordsPlaced = placeThemedWords(words);
      wordsAttempts++;
    }
    if (!wordsPlaced) {
      console.error("Failed to place themed words after 100 attempts.");
    }
  }

  function placeSpangram(spangram) {
    const direction = Math.random() > 0.5 ? "horizontal" : "vertical";
    const startRow = Math.floor(
      Math.random() *
        (boardSize.rows - (direction === "vertical" ? spangram.length : 0))
    );
    const startCol = Math.floor(
      Math.random() *
        (boardSize.cols - (direction === "horizontal" ? spangram.length : 0))
    );

    const path = bfs(startRow, startCol, direction, spangram.length);

    if (path.length !== spangram.length) return false;

    for (let i = 0; i < spangram.length; i++) {
      const { row, col } = path[i];
      const cell = boardCells.find(
        (cell) => cell.dataset.row == row && cell.dataset.col == col
      );
      cell.textContent = spangram[i];
      cell.classList.add("themed");
    }
    return true;
  }

  function bfs(startRow, startCol, direction, length) {
    const queue = [{ row: startRow, col: startCol, path: [] }];
    const visited = new Set();
    while (queue.length > 0) {
      const { row, col, path } = queue.shift();
      const key = `${row},${col}`;
      if (visited.has(key)) continue;
      visited.add(key);
      const newPath = path.concat({ row, col });
      if (newPath.length === length) return newPath;

      const neighbors = adjacencyList.get(key);
      if (!neighbors) continue; // Prevent undefined access
      neighbors.forEach(({ row: nRow, col: nCol }) => {
        if (!visited.has(`${nRow},${nCol}`)) {
          queue.push({ row: nRow, col: nCol, path: newPath });
        }
      });
    }
    return [];
  }

  function placeThemedWords(words) {
    // Split the words based on their length
    const halfLength = Math.ceil(words.length / 2);
    const words1 = words.slice(0, halfLength);
    const words2 = words.slice(halfLength);

    // Get available spaces around the spangram
    const spaces1 = getAvailableSpaces("top");
    const spaces2 = getAvailableSpaces("bottom");

    // Run subset sum to partition the words
    if (
      !subsetSum(words1, spaces1.length) ||
      !subsetSum(words2, spaces2.length)
    )
      return false;

    // Place the words using longest path algorithm
    if (!placeWordGroup(words1, spaces1) || !placeWordGroup(words2, spaces2))
      return false;

    return true;
  }

  function getAvailableSpaces(position) {
    const spaces = [];
    const boundaryRow = position === "top" ? 0 : boardSize.rows - 1;
    for (let col = 0; col < boardSize.cols; col++) {
      spaces.push({ row: boundaryRow, col });
    }
    return spaces;
  }

  function subsetSum(words, target) {
    const lengths = words.map((word) => word.length);
    const dp = Array(target + 1).fill(false);
    dp[0] = true;
    for (let length of lengths) {
      for (let j = target; j >= length; j--) {
        dp[j] = dp[j] || dp[j - length];
      }
    }
    return dp[target];
  }

  function placeWordGroup(words, spaces) {
    const path = longestPath(
      spaces,
      words.reduce((acc, word) => acc + word.length, 0)
    );
    if (path.length !== words.reduce((acc, word) => acc + word.length, 0))
      return false;

    let wordIndex = 0;
    for (let i = 0; i < path.length; i++) {
      const { row, col } = path[i];
      const cell = boardCells.find(
        (cell) => cell.dataset.row == row && cell.dataset.col == col
      );
      if (!cell) return false; // Prevent undefined access
      cell.textContent = words[wordIndex][i % words[wordIndex].length];
      cell.classList.add("themed");
      if ((i + 1) % words[wordIndex].length === 0) wordIndex++;
    }
    return true;
  }

  function longestPath(spaces, length) {
    // Placeholder for longest path calculation
    return spaces.slice(0, length);
  }

  // Placeholder for selecting cells (clicking and dragging)
  let selectedCells = [];
  board.addEventListener("mousedown", startSelection);
  board.addEventListener("mouseup", endSelection);

  function startSelection(event) {
    selectedCells = [];
    document.addEventListener("mousemove", trackSelection);
    selectCell(event.target);
  }

  function trackSelection(event) {
    if (
      event.target.classList.contains("cell") &&
      !selectedCells.includes(event.target)
    ) {
      selectCell(event.target);
    }
  }

  function endSelection() {
    document.removeEventListener("mousemove", trackSelection);
    checkSelectedWord();
  }

  function selectCell(cell) {
    cell.classList.add("selected");
    selectedCells.push(cell);
  }

  function checkSelectedWord() {
    const selectedWord = selectedCells.map((cell) => cell.textContent).join("");
    if (isWordValid(selectedWord)) {
      selectedCells.forEach((cell) => cell.classList.remove("selected"));
      nonThemeWordCount++;
      nonThemeCount.textContent = nonThemeWordCount;
    } else {
      selectedCells.forEach((cell) => cell.classList.remove("selected"));
    }
    selectedCells = [];
  }

  function isWordValid(word) {
    // Placeholder validation
    return word.length > 3;
  }

  // Handle hint button
  hintButton.addEventListener("click", () => {
    if (nonThemeWordCount >= 3) {
      // Reveal hint (this is just a placeholder)
      alert("Hint: Example Hint");
      nonThemeWordCount = 0;
      nonThemeCount.textContent = nonThemeWordCount;
    }
  });
});
