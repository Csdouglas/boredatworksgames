document.addEventListener("DOMContentLoaded", () => {
  const gridSize = 20; // 20x20 grid
  const wordSearchElement = document.getElementById("wordsearch");
  const wordListElement = document.getElementById("wordList");
  const devModeButton = document.getElementById("devModeToggle");
  let isDevMode = false;
  let selectedCells = [];

  // Fetch words and theme from Google Sheets
  fetchDataFromGoogleSheets().then((data) => {
    if (data) {
      const { words, theme } = data;
      document.getElementById("theme").textContent = `Theme: ${theme}`;
      initializeGrid(gridSize);
      if (placeWordsInGrid(words)) {
        populateWordList(words);
      } else {
        console.error("Not all words could be placed in the grid");
      }
    } else {
      console.error("No words available for today");
    }
  });

  function initializeGrid(size) {
    wordSearchElement.innerHTML = "";
    for (let i = 0; i < size * size; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      wordSearchElement.appendChild(cell);
    }
  }

  function placeWordsInGrid(words) {
    const cells = Array.from(wordSearchElement.getElementsByClassName("cell"));
    const grid = [];

    // Create grid array from cells
    for (let i = 0; i < gridSize; i++) {
      grid.push(cells.slice(i * gridSize, (i + 1) * gridSize));
    }

    // Define directions
    const directions = [
      { dx: 0, dy: 1 }, // Horizontal right
      { dx: 1, dy: 0 }, // Vertical down
      { dx: 1, dy: 1 }, // Diagonal down-right
      { dx: 1, dy: -1 }, // Diagonal down-left
    ];

    // Function to place a word in the grid
    function placeWord(word) {
      for (let attempt = 0; attempt < 100; attempt++) {
        const startRow = Math.floor(Math.random() * gridSize);
        const startCol = Math.floor(Math.random() * gridSize);
        const direction =
          directions[Math.floor(Math.random() * directions.length)];
        let canPlace = true;

        // Check if the word can be placed
        for (let i = 0; i < word.length; i++) {
          const row = startRow + i * direction.dy;
          const col = startCol + i * direction.dx;
          if (
            row < 0 ||
            row >= gridSize ||
            col < 0 ||
            col >= gridSize ||
            (grid[row][col].textContent &&
              grid[row][col].textContent !== word[i])
          ) {
            canPlace = false;
            break;
          }
        }

        // Place the word if possible
        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const row = startRow + i * direction.dy;
            const col = startCol + i * direction.dx;
            grid[row][col].textContent = word[i];
            grid[row][col].dataset.word = word; // Add a dataset property to identify the word
          }
          return true;
        }
      }
      return false; // Return false if the word couldn't be placed
    }

    let allWordsPlaced = true;

    // Place all words
    words.forEach((word) => {
      if (!placeWord(word)) {
        console.warn(`Failed to place word: ${word}`);
        allWordsPlaced = false;
      }
    });

    // Fill remaining cells with random letters
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    cells.forEach((cell) => {
      if (!cell.textContent) {
        cell.textContent =
          alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    });

    return allWordsPlaced; // Return whether all words were successfully placed
  }

  function populateWordList(words) {
    words.forEach((word) => {
      const listItem = document.createElement("li");
      listItem.textContent = word;
      listItem.dataset.word = word;
      wordListElement.appendChild(listItem);
    });
  }

  function fetchDataFromGoogleSheets() {
    const sheetId = "1M5IZA4WILykOOyX17TukN8gM45Mo_9TeltA4pERoBmA"; // Replace with your sheet ID
    const apiKey = "AIzaSyC1Sfzo1tLdBPqJo9NtBHHFDZdiMsMXlag"; // Replace with your API key
    const range = "Words!A1:T21"; // Adjust the range to match your data

    return fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);

        // Extract words and theme from the data
        const values = data.values;
        const date = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format
        const dateIndex = values[0].indexOf(date);
        if (dateIndex === -1) {
          console.error("Date not found in sheet");
          return null;
        }

        const theme = values[1][dateIndex];
        const words = values
          .slice(2)
          .map((row) => row[dateIndex])
          .filter((word) => word);

        return { words, theme };
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  function handleCellClick(event) {
    const cell = event.target;
    if (cell.classList.contains("cell")) {
      if (!cell.classList.contains("completed")) {
        cell.classList.toggle("selected");
        checkForWordCompletion();
      }
    }
  }

  function checkForWordCompletion() {
    const selectedLetters =
      wordSearchElement.querySelectorAll(".cell.selected");
    const selectedWord = Array.from(selectedLetters)
      .map((cell) => cell.textContent)
      .join("");

    const wordItems = wordListElement.querySelectorAll("li");
    wordItems.forEach((item) => {
      if (item.dataset.word === selectedWord) {
        item.classList.add("found");
        selectedLetters.forEach((cell) => {
          cell.classList.add("completed"); // Mark cell as completed
          cell.classList.remove("selected"); // Remove selection
          cell.removeEventListener("click", handleCellClick); // Make cell unclickable
        });
      }
    });
  }

  devModeButton.addEventListener("click", () => {
    isDevMode = !isDevMode;
    devModeButton.textContent = isDevMode
      ? "Disable Dev Mode"
      : "Enable Dev Mode";

    if (isDevMode) {
      // Color all word cells pink
      wordSearchElement.querySelectorAll(".cell[data-word]").forEach((cell) => {
        cell.style.backgroundColor = "pink";
      });
    } else {
      // Clear the background color for all cells
      wordSearchElement.querySelectorAll(".cell").forEach((cell) => {
        cell.style.backgroundColor = ""; // Clear background color
      });
    }
  });

  wordSearchElement.addEventListener("click", handleCellClick);
});
