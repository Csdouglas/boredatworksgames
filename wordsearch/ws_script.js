document.addEventListener("DOMContentLoaded", () => {
  const gridSize = 20;
  const sheetId = "1M5IZA4WILykOOyX17TukN8gM45Mo_9TeltA4pERoBmA"; // Your Google Sheet ID
  const apiKey = "AIzaSyC1Sfzo1tLdBPqJo9NtBHHFDZdiMsMXlag"; // Your Google Sheets API key
  const range = "Words!A1:G"; // Starting cell for the range

  const wordList = [];
  const grid = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(""));

  fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log(`Fetch response status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      console.log("Fetched data:", data);
      const today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
      const header = data.values[0];
      const themeRow = data.values[1];
      const dateIndex = header.indexOf(today);

      if (dateIndex === -1) {
        throw new Error("No words available for today");
      }

      const theme = themeRow[dateIndex];
      wordList.push(
        ...data.values
          .slice(2)
          .map((row) => row[dateIndex])
          .filter((word) => word)
      );

      document.getElementById("theme").textContent = theme;

      if (wordList.length === 0) {
        throw new Error("No words available for today");
      }

      placeWordsInGrid(wordList, grid);
      fillGridWithRandomLetters(grid);
      renderGrid(grid);
      renderWordList(wordList);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });

  function placeWordsInGrid(words, grid) {
    words.forEach((word) => {
      word = word.toUpperCase();
      let placed = false;
      while (!placed) {
        const direction = Math.floor(Math.random() * 8);
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);

        if (canPlaceWord(word, row, col, direction, grid)) {
          for (let i = 0; i < word.length; i++) {
            const [r, c] = getNextCell(row, col, direction, i);
            grid[r][c] = word[i];
          }
          placed = true;
        }
      }
    });
  }

  function canPlaceWord(word, row, col, direction, grid) {
    for (let i = 0; i < word.length; i++) {
      const [r, c] = getNextCell(row, col, direction, i);
      if (
        r < 0 ||
        r >= gridSize ||
        c < 0 ||
        c >= gridSize ||
        (grid[r][c] !== "" && grid[r][c] !== word[i])
      ) {
        return false;
      }
    }
    return true;
  }

  function getNextCell(row, col, direction, step) {
    switch (direction) {
      case 0:
        return [row, col + step]; // Right
      case 1:
        return [row + step, col]; // Down
      case 2:
        return [row, col - step]; // Left
      case 3:
        return [row - step, col]; // Up
      case 4:
        return [row + step, col + step]; // Down-Right
      case 5:
        return [row - step, col - step]; // Up-Left
      case 6:
        return [row + step, col - step]; // Down-Left
      case 7:
        return [row - step, col + step]; // Up-Right
    }
  }

  function fillGridWithRandomLetters(grid) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col] === "") {
          grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  }

  function renderGrid(grid) {
    const gridElement = document.getElementById("wordsearch");
    gridElement.innerHTML = "";
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        cellElement.textContent = cell;
        cellElement.dataset.row = rowIndex;
        cellElement.dataset.col = colIndex;
        gridElement.appendChild(cellElement);
      });
    });

    let selectedCells = [];
    let isMouseDown = false;

    function handleMouseDown(e) {
      isMouseDown = true;
      handleCellSelection(e);
    }

    function handleMouseUp() {
      isMouseDown = false;
      checkForCompletedWord(selectedCells, wordList, grid);
      selectedCells = []; // Clear selected cells
    }

    function handleMouseMove(e) {
      if (isMouseDown) {
        handleCellSelection(e);
      }
    }

    function handleCellSelection(e) {
      const cell = e.target;
      if (cell.classList.contains("cell")) {
        const row = parseInt(cell.dataset.row, 10);
        const col = parseInt(cell.dataset.col, 10);

        if (
          selectedCells.length === 0 ||
          isNextCellValid(selectedCells[selectedCells.length - 1], [row, col])
        ) {
          if (cell.classList.contains("completed")) return;
          if (cell.classList.contains("selected")) {
            cell.classList.remove("selected");
            selectedCells = selectedCells.filter(
              ([r, c]) => r !== row || c !== col
            );
          } else {
            cell.classList.add("selected");
            selectedCells.push([row, col]);
          }
        }
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
  }

  function isNextCellValid([prevRow, prevCol], [nextRow, nextCol]) {
    const rowDiff = Math.abs(nextRow - prevRow);
    const colDiff = Math.abs(nextCol - prevCol);
    return rowDiff <= 1 && colDiff <= 1;
  }

  function checkForCompletedWord(selectedCells, wordList, grid) {
    const selectedWord = selectedCells
      .map(([row, col]) => grid[row][col])
      .join("");

    if (wordList.includes(selectedWord)) {
      selectedCells.forEach(([row, col]) => {
        const cell = document.querySelector(
          `.cell[data-row="${row}"][data-col="${col}"]`
        );
        cell.classList.add("completed");
        cell.classList.remove("selected");
        cell.style.pointerEvents = "none"; // Make cell unclickable
      });

      const wordIndex = wordList.indexOf(selectedWord);
      const wordListItem = document.querySelector(
        `#wordList li:nth-child(${wordIndex + 1})`
      );
      wordListItem.classList.add("found");
    }
  }

  function renderWordList(words) {
    const wordListElement = document.getElementById("wordList");
    wordListElement.innerHTML = "";
    words.forEach((word) => {
      const li = document.createElement("li");
      li.textContent = word;
      wordListElement.appendChild(li);
    });
  }

  // Dev mode toggle
  document.getElementById("devModeToggle").addEventListener("click", () => {
    document.querySelectorAll(".cell").forEach((cell) => {
      const row = parseInt(cell.dataset.row, 10);
      const col = parseInt(cell.dataset.col, 10);
      const letter = grid[row][col];
      if (wordList.some((word) => word.includes(letter))) {
        cell.classList.toggle("dev-mode");
      }
    });
  });
});
