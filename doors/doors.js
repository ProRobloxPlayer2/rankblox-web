document.addEventListener("DOMContentLoaded", () => {
  const door = document.getElementById("door");

  let doorCount = 1;

  door.addEventListener("click", () => {
    doorCount++;
    alert("You opened door " + doorCount);
  });
});
