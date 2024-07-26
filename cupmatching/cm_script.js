const colors = ["red", "blue", "green", "yellow", "purple"];
let timerInterval;
let seconds = 0;
let turns = 0;
let answerBoxes = [];
let userBoxes = [];
let correctOrder = [];
let currentOrder = [];

document.addEventListener("DOMContentLoaded", () => {
  const answerBoxesContainer = document.querySelector(".answer-boxes");
  const userBoxesContainer = document.querySelector(".user-boxes");
  const startButton = document.getElementById("startGame");
  const lockButton = document.getElementById("lockItIn");
  const message = document.getElementById("message");
  const timerElement = document.getElementById("timer");
  const playAgainButton = document.getElementById("playAgain");

  function initializeGame() {
    answerBoxes = [];
    userBoxes = [];
    correctOrder = [];
    currentOrder = [];
    turns = 0;
    seconds = 0;
    message.textContent = "";
    timerElement.textContent = "Time: 0s";

    // Clear previous boxes
    answerBoxesContainer.innerHTML = "";
    userBoxesContainer.innerHTML = "";

    // Shuffle colors for user boxes
    const shuffledColors = colors.sort(() => Math.random() - 0.5);

    // Create answer boxes with grey layer
    colors.forEach((color) => {
      const box = document.createElement("div");
      box.className = "box grey-layer";
      answerBoxesContainer.appendChild(box);
      answerBoxes.push(box);
      correctOrder.push(color);
    });

    // Create user boxes with random order
    shuffledColors.forEach((color) => {
      const box = document.createElement("div");
      box.className = "box";
      box.style.backgroundColor = color;
      box.draggable = true;
      box.addEventListener("dragstart", handleDragStart);
      box.addEventListener("dragover", handleDragOver);
      box.addEventListener("drop", handleDrop);
      userBoxesContainer.appendChild(box);
      userBoxes.push(box);
      currentOrder.push(color);
    });

    startButton.disabled = false;
    lockButton.disabled = true;
    playAgainButton.style.display = "none";
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      seconds++;
      timerElement.textContent = `Time: ${seconds}s`;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function handleDragStart(event) {
    event.dataTransfer.setData(
      "text/plain",
      event.target.style.backgroundColor
    );
    event.dataTransfer.setData("index", userBoxes.indexOf(event.target));
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const draggedIndex = event.dataTransfer.getData("index");
    const draggedBox = userBoxes[draggedIndex];
    const targetBox = event.target;

    if (targetBox.classList.contains("box")) {
      const targetIndex = userBoxes.indexOf(targetBox);

      // Swap boxes in the userBoxes array
      userBoxes[draggedIndex] = targetBox;
      userBoxes[targetIndex] = draggedBox;

      // Reorder the DOM
      userBoxesContainer.insertBefore(draggedBox, targetBox);
    }
  }

  function checkOrder() {
    let correctCount = 0;
    userBoxes.forEach((box, index) => {
      const color = box.style.backgroundColor;
      if (color === correctOrder[index]) {
        box.classList.add("correct");
        box.classList.remove("incorrect"); // Remove 'incorrect' class if it's in the right spot
        correctCount++;
      } else {
        box.classList.remove("correct"); // Remove 'correct' class if it's not in the right spot
        box.classList.add("incorrect");
      }
    });

    return correctCount;
  }

  function handleLockItIn() {
    turns++;
    const correctCount = checkOrder();

    if (correctCount === colors.length) {
      answerBoxes.forEach((box, index) => {
        box.style.backgroundColor = correctOrder[index];
        box.classList.remove("grey-layer");
      });
      stopTimer();
      message.textContent = `Solved in ${turns} turns!`;
      playAgainButton.style.display = "block";
    } else {
      message.textContent = `${correctCount} in the right spot.`;
    }
  }

  startButton.addEventListener("click", () => {
    initializeGame();
    startTimer();
    startButton.disabled = true;
    lockButton.disabled = false;
  });

  lockButton.addEventListener("click", handleLockItIn);

  playAgainButton.addEventListener("click", initializeGame);

  initializeGame();
});
