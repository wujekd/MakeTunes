document.addEventListener('DOMContentLoaded', () => {
    console.log("Hello World from TypeScript!");
  
    const outputElement = document.getElementById("output");
  
    if (outputElement) {
      outputElement.innerHTML = "Hello World from TypeScript!";
    } else {
      console.error('Element with ID "output" not found.');
    }
  });