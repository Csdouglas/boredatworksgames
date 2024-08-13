document.addEventListener("DOMContentLoaded", async () => {
  const crosswordData = await fetchCrosswordData();

  renderGrid(crosswordData.grid);
  renderClues(crosswordData.clues);

  document.getElementById("check-button").addEventListener("click", () => {
    checkAnswers(crosswordData.grid);
  });
});

async function fetchCrosswordData() {
  const response = await fetch("https://your-api-endpoint.com/crossword");
  return await response.json();
}

function renderGrid(grid) {
  const gridContainer = document.getElementById("crossword-grid");
  grid.forEach((row) => {
    row.forEach((cell) => {
      const input = document.createElement("input");
      input.maxLength = 1;
      input.dataset.correctAnswer = cell.answer;
      if (cell.black) {
        input.disabled = true;
        input.style.backgroundColor = "#000";
      }
      gridContainer.appendChild(input);
    });
  });
}

function renderClues(clues) {
  const acrossClues = document.getElementById("across-clues");
  const downClues = document.getElementById("down-clues");

  clues.across.forEach((clue) => {
    const li = document.createElement("li");
    li.textContent = `${clue.number}. ${clue.text}`;
    acrossClues.appendChild(li);
  });

  clues.down.forEach((clue) => {
    const li = document.createElement("li");
    li.textContent = `${clue.number}. ${clue.text}`;
    downClues.appendChild(li);
  });
}

function checkAnswers(grid) {
  const inputs = document.querySelectorAll("#crossword-grid input");
  let correct = true;

  inputs.forEach((input) => {
    if (
      !input.disabled &&
      input.value.toUpperCase() !== input.dataset.correctAnswer
    ) {
      correct = false;
      input.style.backgroundColor = "#ffdddd";
    } else if (!input.disabled) {
      input.style.backgroundColor = "#ddffdd";
    }
  });

  const result = document.getElementById("result");
  result.textContent = correct
    ? "Congratulations! All answers are correct."
    : "Some answers are incorrect. Keep trying!";
}
