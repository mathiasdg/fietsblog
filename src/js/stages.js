const dots = document.querySelectorAll('.dot');
const stages = document.querySelectorAll('.stage');
// Calculate the height of each stage
const stageHeight = document.documentElement.scrollHeight / stages.length;

stages[0].style.backgroundColor = "hsl(0, 50%, 50%)";

window.addEventListener('scroll', () => {
  const scrollPercentage = (document.documentElement.scrollTop + document.body.scrollTop) / (document.documentElement.scrollHeight - document.documentElement.clientHeight) * 100;

  // Calculate current stage based on scroll position
  const currentStage = Math.floor(scrollPercentage / (100 / stages.length));

  // Highlight corresponding dot
  dots.forEach((dot, index) => {
    if (index === currentStage) {
        dot.classList.add('active');
        // dot.style.backgroundColor = '#ff0000'; // Change color to indicate active stage
    } else {
        dot.classList.remove('active');
    //   dot.style.backgroundColor = '#fff'; // Reset color for inactive stages
    }
  });

  // Change background color of stages
  stages.forEach((stage, index) => {
    stage.style.backgroundColor = `hsl(${index * (360 / stages.length)}, 50%, 50%)`; // Set default background color
    if (index === currentStage) {
    //   stage.style.backgroundColor = '#ff0000'; // Change color to indicate active stage
    } else {
    }
  });
});


