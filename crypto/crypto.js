// Updated cryptogram data
const cryptogramData = {
  encrypted: "LWQTNFWA SIV TOHRL QL OPRLYHR",
  solution: "SLIGHTLY FUN GAMES IS AWESOME",
};

// Function to display the cryptogram with input boxes
function displayCryptogram() {
  const cryptogramContainer = document.getElementById("cryptogram-container");
  cryptogramContainer.innerHTML = "";

  cryptogramData.encrypted.split(" ").forEach((word) => {
    const wordContainer = document.createElement("div");
    wordContainer.className = "word-container";

    word.split("").forEach((char, index) => {
      const letterBox = document.createElement("div");
      letterBox.className = "letter-box";

      const letterElement = document.createElement("div");
      letterElement.className = "letter";
      letterElement.textContent = char;
      letterBox.appendChild(letterElement);

      if (char !== " ") {
        const input = document.createElement("input");
        input.setAttribute("maxlength", "1");
        input.setAttribute("data-encrypted-letter", char);
        input.setAttribute("data-index", index);
        input.addEventListener("input", handleInput);
        input.addEventListener("keydown", handleArrowKeys);
        letterBox.appendChild(input);
      }

      wordContainer.appendChild(letterBox);
    });

    cryptogramContainer.appendChild(wordContainer);
  });
}

// Function to handle input in any of the letter slots
function handleInput(event) {
  const encryptedLetter = event.target.getAttribute("data-encrypted-letter");
  const inputLetter = event.target.value.toUpperCase();
  const inputs = document.querySelectorAll(
    `input[data-encrypted-letter="${encryptedLetter}"]`
  );

  inputs.forEach((input) => {
    input.value = inputLetter;
  });
}

// Function to handle arrow key navigation between input fields
function handleArrowKeys(event) {
  const key = event.key;
  const inputs = document.querySelectorAll(".letter-box input");
  const currentIndex = Array.prototype.indexOf.call(inputs, event.target);

  if (key === "ArrowRight" && currentIndex < inputs.length - 1) {
    inputs[currentIndex + 1].focus();
  } else if (key === "ArrowLeft" && currentIndex > 0) {
    inputs[currentIndex - 1].focus();
  } else if (key === "ArrowDown" || key === "ArrowUp") {
    const columns = Math.sqrt(inputs.length);
    let newIndex =
      key === "ArrowDown" ? currentIndex + columns : currentIndex - columns;
    if (newIndex >= 0 && newIndex < inputs.length) {
      inputs[newIndex].focus();
    }
  }
}

// Function to check the user's solution
function checkSolution() {
  console.log("Check button clicked"); // Debugging: Ensure function is called

  let userSolution = "";
  const wordContainers = document.querySelectorAll(".word-container");

  // Loop through each word container
  wordContainers.forEach((wordContainer, wordIndex) => {
    const inputs = wordContainer.querySelectorAll(".letter-box input");

    // Collect input for each letter in the word
    inputs.forEach((input) => {
      userSolution += input.value.toUpperCase() || " ";
    });

    // Add a space after each word, except the last one
    if (wordIndex < wordContainers.length - 1) {
      userSolution += " ";
    }
  });

  console.log("User solution:", userSolution); // Debugging: Check what's being collected
  console.log("Correct solution:", cryptogramData.solution); // Debugging: Ensure solution is correct

  const messageElement = document.getElementById("message");

  // Comparing user input with the correct solution
  if (userSolution === cryptogramData.solution) {
    messageElement.textContent = "Correct! Well done!";
    messageElement.style.color = "green";
  } else {
    messageElement.textContent = "Incorrect, try again.";
    messageElement.style.color = "red";
  }
}

// Ensure the Check button is present in the DOM
document.addEventListener("DOMContentLoaded", function () {
  const checkButton = document.getElementById("check-button");

  if (checkButton) {
    checkButton.addEventListener("click", checkSolution);
    console.log("Event listener attached"); // Debugging: Ensure listener is attached
  } else {
    console.log("Check button not found in the DOM"); // Debugging: Detect missing button
  }
});

// Display the cryptogram on page load
displayCryptogram();
