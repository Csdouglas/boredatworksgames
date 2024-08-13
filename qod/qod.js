document.addEventListener("DOMContentLoaded", function () {
  const questionText = document.getElementById("question-text");
  const answersList = document.getElementById("answers-list");
  const submitBtn = document.getElementById("submit-btn");
  const resultContainer = document.getElementById("result-container");
  const resultText = document.getElementById("result-text");
  const nextBtn = document.getElementById("next-btn");

  // Mock function to fetch the question from the server
  function fetchQuestionOfTheDay() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          question: "What is the capital of France?",
          answers: ["Paris", "London", "Berlin", "Madrid"],
          correctAnswer: "Paris",
        });
      }, 1000); // Simulate network delay
    });
  }

  function renderQuestion(questionData) {
    questionText.textContent = questionData.question;
    answersList.innerHTML = "";
    questionData.answers.forEach((answer, index) => {
      const li = document.createElement("li");
      const radioInput = document.createElement("input");
      radioInput.type = "radio";
      radioInput.name = "answer";
      radioInput.value = answer;
      radioInput.id = `answer-${index}`;

      const label = document.createElement("label");
      label.htmlFor = `answer-${index}`;
      label.textContent = answer;

      li.appendChild(radioInput);
      li.appendChild(label);
      answersList.appendChild(li);
    });

    submitBtn.disabled = true;
    document.querySelectorAll('input[name="answer"]').forEach((input) => {
      input.addEventListener("change", () => {
        submitBtn.disabled = false;
      });
    });
  }

  function handleSubmission(questionData) {
    const selectedAnswer = document.querySelector(
      'input[name="answer"]:checked'
    ).value;
    if (selectedAnswer === questionData.correctAnswer) {
      resultText.textContent = "Correct! 🎉";
    } else {
      resultText.textContent = `Incorrect! The correct answer was ${questionData.correctAnswer}.`;
    }

    resultContainer.classList.remove("hidden");
    submitBtn.classList.add("hidden");
  }

  nextBtn.addEventListener("click", () => {
    resultContainer.classList.add("hidden");
    submitBtn.classList.remove("hidden");
    submitBtn.disabled = true;
    loadQuestion();
  });

  function loadQuestion() {
    fetchQuestionOfTheDay().then((questionData) => {
      renderQuestion(questionData);
      submitBtn.onclick = () => handleSubmission(questionData);
    });
  }

  loadQuestion();
});
