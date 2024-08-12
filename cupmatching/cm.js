document.addEventListener("DOMContentLoaded", (event) => {
  const neutralBoard = document.getElementById("neutralBoard");
  const userBoard = document.getElementById("userBoard");
  const answerBoard = document.getElementById("answerBoard");
  const lockGuessButton = document.getElementById("lockGuess");
  const revealButton = document.getElementById("reveal");
  const newGameButton = document.getElementById("newGame");
  const messageBox = document.createElement("div");
  messageBox.id = "messageBox";
  document.body.appendChild(messageBox);

  const colors = ["red", "green", "blue", "yellow", "orange"];
  let answerOrder = [];
  let userBoardState = Array(5).fill(null); // Track which color is in each slot

  function initializeGame() {
    answerOrder = shuffleArray([...colors]);
    answerBoard.classList.add("hidden");
    setupBoard();
    setupAnswerBoard();
  }

  function setupBoard() {
    neutralBoard.innerHTML = ""; // Clear any existing circles
    userBoardState = Array(5).fill(null); // Reset user board state

    for (let i = 0; i < colors.length; i++) {
      const circle = createCircle(colors[i]);
      neutralBoard.appendChild(circle);
    }

    const slots = userBoard.getElementsByClassName("slot");
    for (let slot of slots) {
      slot.innerHTML = "";
      slot.style.backgroundColor = "white";
      slot.removeAttribute("data-color");
      slot.addEventListener("contextmenu", handleRightClick); // Add right-click listener
      slot.addEventListener("dragover", (event) => event.preventDefault()); // Ensure dragover works
      slot.addEventListener("drop", handleDrop); // Ensure drop works
    }
  }

  function setupAnswerBoard() {
    const answerCircles = answerBoard.getElementsByClassName("answer-circle");
    for (let i = 0; i < answerCircles.length; i++) {
      answerCircles[i].style.backgroundColor = answerOrder[i];
    }
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function createCircle(color) {
    const circle = document.createElement("div");
    circle.className = "circle";
    circle.style.backgroundColor = color;
    circle.setAttribute("data-color", color);
    circle.draggable = true;
    circle.addEventListener("dragstart", handleDragStart);
    return circle;
  }

  function handleDragStart(event) {
    console.log("Drag Start:", event.target.getAttribute("data-color"));
    event.dataTransfer.setData(
      "color",
      event.target.getAttribute("data-color")
    );
    event.dataTransfer.setData("origin", event.target.parentElement.id);
  }

  function handleDrop(event) {
    event.preventDefault();
    const color = event.dataTransfer.getData("color");
    const origin = event.dataTransfer.getData("origin");
    const target = event.target;

    console.log("Drop:", {
      color,
      origin,
      targetId: target.id,
      targetClass: target.className,
    });

    if (
      target.className.includes("slot") &&
      !target.getAttribute("data-color")
    ) {
      if (origin.includes("slot")) {
        const originalSlot = document.getElementById(origin);
        resetSlot(originalSlot);
      }

      if (origin === "neutralBoard") {
        const circle = document.querySelector(
          `#neutralBoard .circle[data-color='${color}']`
        );
        if (circle) circle.remove();
      }

      target.style.backgroundColor = color;
      target.setAttribute("data-color", color);
      target.innerHTML = ""; // Clear any existing content
      target.appendChild(createCircle(color)); // Append new circle
    } else {
      displayMessage("Slot is already occupied.");
    }
  }

  function handleNeutralDrop(event) {
    event.preventDefault();
    const color = event.dataTransfer.getData("color");
    const origin = event.dataTransfer.getData("origin");

    console.log("Neutral Drop:", { color, origin });

    if (origin.includes("slot")) {
      const slot = document.getElementById(origin);
      resetSlot(slot);
      neutralBoard.appendChild(createCircle(color));
    }
  }

  function resetSlot(slot) {
    slot.style.backgroundColor = "white";
    slot.removeAttribute("data-color");
    if (slot.firstChild) {
      slot.removeChild(slot.firstChild);
    }
  }

  function handleRightClick(event) {
    event.preventDefault();
    const slot = event.target;
    const color = slot.getAttribute("data-color");
    if (color) {
      resetSlot(slot);
      neutralBoard.appendChild(createCircle(color));
    }
  }

  function displayMessage(message) {
    messageBox.innerText = message;
    messageBox.style.display = "block";
    setTimeout(() => {
      messageBox.style.display = "none";
    }, 3000);
  }

  neutralBoard.addEventListener("dragover", (event) => {
    event.preventDefault();
    console.log("Drag Over Neutral Board");
  });

  neutralBoard.addEventListener("drop", handleNeutralDrop);

  userBoard.addEventListener("dragover", (event) => {
    event.preventDefault();
    console.log("Drag Over User Board");
  });

  userBoard.addEventListener("drop", handleDrop);

  lockGuessButton.addEventListener("click", () => {
    const slots = userBoard.getElementsByClassName("slot");
    let allFilled = true;
    for (let slot of slots) {
      if (!slot.getAttribute("data-color")) {
        allFilled = false;
        break;
      }
    }
    if (!allFilled) {
      alert("Please fill all slots before locking in the guess.");
      return;
    }

    let correctCount = 0;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].getAttribute("data-color") === answerOrder[i]) {
        correctCount++;
      }
    }

    console.log("Number of correct placements:", correctCount);
    alert(`You have ${correctCount} correct placements.`);

    // Retain the current state without resetting the board
  });

  revealButton.addEventListener("click", () => {
    answerBoard.classList.toggle("hidden");
  });

  newGameButton.addEventListener("click", () => {
    initializeGame();
  });

  initializeGame();
});
