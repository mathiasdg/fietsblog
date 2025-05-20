// Add parallax effect for the header
window.addEventListener("scroll", function () {
  const scrolled = window.scrollY;
  const parallaxHeader = document.querySelector(".parallax");
  const parallaxElements = document.querySelectorAll(".parallax-twee");

  parallaxHeader.style.backgroundPositionY = -(scrolled * 0.3) + "px";

  parallaxElements.forEach((element) => {
    element.style.backgroundPositionY = -(scrolled * 0.1) + "px";
  });
});
