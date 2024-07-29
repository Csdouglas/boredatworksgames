document.addEventListener("DOMContentLoaded", () => {
  const dice = document.querySelectorAll(".die");
  const cup = document.getElementById("cup");
  const diceContainer = document.getElementById("dice-container");
  const rollButton = document.getElementById("roll");

  dice.forEach((die) => {
    die.addEventListener("dragstart", handleDragStart);
    die.addEventListener("dragend", handleDragEnd);
  });

  cup.addEventListener("dragover", handleDragOver);
  cup.addEventListener("drop", handleDrop);

  rollButton.addEventListener("click", rollDice);

  function handleDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
    event.target.style.opacity = "0.5"; // Optional: visual feedback during drag
  }

  function handleDragEnd(event) {
    event.target.style.opacity = "1";
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    const die = document.getElementById(id);

    if (die) {
      die.style.position = "absolute";
      die.style.left = `${event.clientX - die.offsetWidth / 2}px`;
      die.style.top = `${event.clientY - die.offsetHeight / 2}px`;
      diceContainer.appendChild(die);
    }
  }

  function rollDice() {
    const dice = diceContainer.querySelectorAll(".die");
    dice.forEach((die) => {
      const randomFace = Math.floor(Math.random() * 6) + 1;
      die.textContent = randomFace; // Update the text to show the result
    });
  }
});
