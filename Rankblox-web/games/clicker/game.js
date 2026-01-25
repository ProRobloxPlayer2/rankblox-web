let score = 0;

const scoreText = document.getElementById("score");
const button = document.getElementById("clickBtn");

button.addEventListener("click", () => {
  score++;
  scoreText.textContent = score;
});
