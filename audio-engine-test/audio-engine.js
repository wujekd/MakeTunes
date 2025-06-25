document.addEventListener('DOMContentLoaded', function () {
    console.log("Hello World from TypeScript!");
    var outputElement = document.getElementById("output");
    if (outputElement) {
        outputElement.innerHTML = "Hello World from TypeScript!";
    }
    else {
        console.error('Element with ID "output" not found.');
    }
});