// Mock cryptogram data (to be replaced with a dynamic system later)
const cryptogramData = {
  encrypted: "GSV XLWV RH Z NVHHZTVG",
  solution: "THE CODE IS A CHALLENGE",
};

// Function to display the cryptogram with input boxes
function displayCryptogram() {
  const cryptogramContainer = document.getElementById("cryptogram-container");
  cryptogramContainer.innerHTML = "";

  cryptogramData.encrypted.split("").forEach((char, index) => {
    const letterBox = document.createElement("div");
    letterBox.className = "letter-box";

    const letterElement = document.createElement("div");
    letterElement.className = "letter";
    letterElement.textContent = char === " " ? "\u00A0" : char;
    letterBox.appendChild(letterElement);

    if (char !== " ") {
      const input = document.createElement("input");
      input.setAttribute("maxlength", "1");
      input.setAttribute("data-index", index);
      letterBox.appendChild(input);
    }

    cryptogramContainer.appendChild(letterBox);
  });
}

// Function to check the user's solution
function checkSolution() {
  let userSolution = "";
  const inputs = document.querySelectorAll(".letter-box input");

  inputs.forEach((input) => {
    userSolution += input.value.toUpperCase() || " ";
  });

  const messageElement = document.getElementById("message");

  if (userSolution === cryptogramData.solution) {
    messageElement.textContent = "Correct! Well done!";
    messageElement.style.color = "green";
  } else {
    messageElement.textContent = "Incorrect, try again.";
    messageElement.style.color = "red";
  }
}

// Event listener for the check button
document
  .getElementById("check-button")
  .addEventListener("click", checkSolution);

// Display the cryptogram on page load
displayCryptogram();
