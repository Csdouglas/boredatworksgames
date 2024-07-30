document.addEventListener("DOMContentLoaded", () => {
  const userBoxes = document.querySelectorAll(".user-box");
  const objects = document.querySelectorAll(".object");
  const errorMessage = document.querySelector(".error-message");
  const objectsBoard = document.querySelector(".objects-board");
  const lockButton = document.getElementById("lock-button");
  const resetButton = document.getElementById("reset-button");
  const answerBoxes = document.querySelectorAll(".answer-box");
  let userTurns = 0;

  function initializeDragAndDrop() {
    objects.forEach((obj) => {
      obj.addEventListener("dragstart", handleDragStart);
      obj.addEventListener("dragend", handleDragEnd);
    });

    userBoxes.forEach((box) => {
      box.addEventListener("dragover", handleDragOver);
      box.addEventListener("drop", handleDropToBox);
    });

    objectsBoard.addEventListener("dragover", handleDragOver);
    objectsBoard.addEventListener("drop", handleDropToBoard);
  }

  function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.color);
    e.target.classList.add("dragging");
    errorMessage.textContent = ""; // Clear error message on new drag operation
  }

  function handleDragEnd(e) {
    e.target.classList.remove("dragging");
    if (!e.target.parentElement.classList.contains("user-box")) {
      e.target.style.backgroundColor = e.target.dataset.color; // Reset color
    }
  }

  function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
  }

  function handleDropToBox(e) {
    e.preventDefault();
    const color = e.dataTransfer.getData("text/plain");
    const box = e.target.closest(".user-box");

    if (!box) return;

    const existingObject = box.querySelector(".object");
    if (existingObject) {
      errorMessage.textContent =
        "This box is already occupied. Please remove the current object first.";
      return;
    }

    const object = document.querySelector(`.object[data-color="${color}"]`);
    if (object) {
      object.style.backgroundColor = "transparent";
      box.style.backgroundColor = color;
      box.appendChild(object);
      errorMessage.textContent = "";
    }
  }

  function handleDropToBoard(e) {
    e.preventDefault();
    const color = e.dataTransfer.getData("text/plain");
    const object = document.querySelector(`.object[data-color="${color}"]`);

    if (object) {
      // Reset object color and append to objects board
      object.style.backgroundColor = object.dataset.color;
      object.style.position = "absolute";
      const rect = objectsBoard.getBoundingClientRect();
      object.style.left = `${e.clientX - rect.left - object.offsetWidth / 2}px`;
      object.style.top = `${e.clientY - rect.top - object.offsetHeight / 2}px`;
      objectsBoard.appendChild(object);
      errorMessage.textContent = "";
    }
  }

  function handleLockIn() {
    console.log("Lock it in button clicked."); // Debug log
    userTurns += 1;

    const userPlacements = Array.from(userBoxes).map((box) => {
      const object = box.querySelector(".object");
      return object ? object.dataset.color : null;
    });

    if (userPlacements.includes(null)) {
      errorMessage.textContent =
        "Please place an object in each box before locking it in.";
      return;
    }

    const answers = Array.from(answerBoxes).map((box) => box.dataset.color);

    let correctCount = 0;

    userPlacements.forEach((color, index) => {
      if (color === answers[index]) {
        correctCount += 1;
      }
    });

    if (correctCount === answers.length) {
      errorMessage.textContent = `Congratulations, all objects are correctly placed in ${userTurns} turns!`;
    } else {
      errorMessage.textContent = `${correctCount} out of ${answers.length} objects are correctly placed. Please try again.`;
    }
  }

  function handleReset() {
    // Clear user boxes
    userBoxes.forEach((box) => {
      box.style.backgroundColor = "transparent";
      const object = box.querySelector(".object");
      if (object) {
        object.style.backgroundColor = object.dataset.color; // Reset color
        object.style.position = "absolute"; // Ensure position is absolute
        objectsBoard.appendChild(object); // Move object back to objects board
      }
    });

    // Reset error message and turn count
    errorMessage.textContent = "";
    userTurns = 0;

    // Re-enable dragging of objects
    initializeDragAndDrop();
  }

  // Initial setup for drag-and-drop
  initializeDragAndDrop();

  // Ensure the lock button is working
  if (lockButton) {
    lockButton.addEventListener("click", handleLockIn);
  } else {
    console.error("Lock button not found.");
  }

  // Ensure the reset button is working
  if (resetButton) {
    resetButton.addEventListener("click", handleReset);
  } else {
    console.error("Reset button not found.");
  }
});
