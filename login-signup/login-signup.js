document.addEventListener("DOMContentLoaded", () => {
  const loginToggle = document.getElementById("login-toggle");
  const signupToggle = document.getElementById("signup-toggle");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  loginToggle.addEventListener("click", () => {
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
    loginToggle.classList.add("active");
    signupToggle.classList.remove("active");
  });

  signupToggle.addEventListener("click", () => {
    signupForm.classList.add("active");
    loginForm.classList.remove("active");
    signupToggle.classList.add("active");
    loginToggle.classList.remove("active");
  });

  // Default to login form
  loginForm.classList.add("active");
});
