document.addEventListener("DOMContentLoaded", () => {
  const userBoxes = document.querySelectorAll(".user-box");
  const objects = document.querySelectorAll(".object");
  const errorMessage = document.querySelector(".error-message");
  const objectsContainer = document.querySelector(".objects");
  const objectsBoard = document.querySelector(".objects-board");

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

  function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.color);
    e.target.classList.add("dragging");
    console.log("Drag start:", e.target.dataset.color);
    // Clear error message on new drag operation
    errorMessage.textContent = "";
  }

  function handleDragEnd(e) {
    e.target.classList.remove("dragging");
    if (!e.target.parentElement.classList.contains("user-box")) {
      e.target.style.backgroundColor = e.target.dataset.color; // Reset color
    }
    console.log("Drag end:", e.target.dataset.color);
  }

  function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
  }

  function handleDropToBox(e) {
    e.preventDefault();
    const color = e.dataTransfer.getData("text/plain");
    const box = e.target.closest(".user-box"); // Ensure we drop into a user box

    if (!box) return; // If the drop target is not a user box, do nothing

    const existingObject = box.querySelector(".object");
    if (existingObject) {
      errorMessage.textContent =
        "This box is already occupied. Please remove the current object first.";
      console.log("Error: Box already occupied");
      return;
    }

    const object = document.querySelector(`.object[data-color="${color}"]`);
    if (object) {
      object.style.backgroundColor = "transparent"; // Make it invisible when dragged
      box.style.backgroundColor = color;
      box.appendChild(object);
      errorMessage.textContent = ""; // Clear any previous error message
      console.log("Object dropped into box:", color);
    }
  }

  function handleDropToBoard(e) {
    e.preventDefault();
    const color = e.dataTransfer.getData("text/plain");
    const object = document.querySelector(`.object[data-color="${color}"]`);

    if (object) {
      // Find the parent user box if it exists and clear its background color
      const parentBox = object.parentElement;
      if (parentBox && parentBox.classList.contains("user-box")) {
        parentBox.style.backgroundColor = "transparent"; // Clear the background color of the user box
      }

      object.style.backgroundColor = object.dataset.color; // Reset color
      objectsContainer.appendChild(object);
      errorMessage.textContent = ""; // Clear error message if object is placed correctly
      console.log("Object dropped into objects board:", color);
    }
  }
});
