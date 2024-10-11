// Select the game board and leaderboard elements from the HTML
const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const reset = document.querySelector("#reset");
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;

// Colors and size settings for game elements
const boardBackground = "white";
const snakeColor = "lightgreen";
const snakeBorder = "black";
const foodColor = "red";
const unitSize = 25;

// Game state variables
let running = false;
let xVelocity = unitSize;
let yVelocity = 0;
let foodX;
let foodY;
let score = 0;

// Initial snake body (5 blocks in length)
let snake = [
    {x: unitSize * 4, y: 0},
    {x: unitSize * 3, y: 0},
    {x: unitSize * 2, y: 0},
    {x: unitSize, y: 0},
    {x: 0, y: 0}
];

// Leaderboard and player name variables
let playerName = '';
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

// Ask player for their name at the start of the game
function startGame() {
    playerName = prompt("Enter your name to start the game:");
    if (!playerName) {
        alert("Please enter a name!");
        return;
    }
    gameStart();
    displayLeaderboard();
}

// Listen for arrow key presses to change snake's direction
window.addEventListener("keydown", changeDirection);

// Initialize the game: set running state, display score, and start the loop
function gameStart() {
    running = true;
    scoreText.textContent = score;
    createFood();  // Generate food at a random position
    drawFood();    // Render the food on the board
    nextTick();    // Start the game loop
}

// Continuously update the game state every 75ms
function nextTick() {
    if (running) {
        setTimeout(() => {
            clearBoard();   // Clear the board
            drawFood();     // Redraw the food
            moveSnake();    // Move the snake based on its velocity
            drawSnake();    // Redraw the snake
            checkGameOver();  // Check if game over condition is met
            nextTick();     // Repeat the process
        }, 75);
    } else {
        displayGameOver();  // Show game over message when the game ends
    }
}

// Clear the game board (erase everything)
function clearBoard() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);
}

// Create food at a random location on the board
function createFood() {
    function randomFood(min, max) {
        const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
        return randNum;
    }
    foodX = randomFood(0, gameWidth - unitSize);
    foodY = randomFood(0, gameHeight - unitSize);
}

// Draw the food on the game board
function drawFood() {
    ctx.fillStyle = foodColor;
    ctx.fillRect(foodX, foodY, unitSize, unitSize);
}

// Move the snake based on its current direction
function moveSnake() {
    const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };

    snake.unshift(head);  // Add new head to the snake
    // Check if the snake has eaten the food
    if (snake[0].x === foodX && snake[0].y === foodY) {
        score += 1;  // Increase score
        scoreText.textContent = score;
        createFood();  // Generate new food
    } else {
        snake.pop();  // Remove the tail if no food is eaten
    }

    directionLocked = false; // Unlock direction after moving
}

// Draw each part of the snake on the game board
function drawSnake() {
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    snake.forEach(snakePart => {
        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
    });
}

let directionLocked = false;  // Prevent changing direction multiple times within one frame

// Change the direction of the snake based on key press
function changeDirection(event) {
    if (directionLocked) return;  // Ignore key presses if direction is locked

    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    // Prevent reversing direction
    const goingUp = (yVelocity === -unitSize);
    const goingDown = (yVelocity === unitSize);
    const goingRight = (xVelocity === unitSize);
    const goingLeft = (xVelocity === -unitSize);

    // Update velocity based on the key pressed
    switch (true) {
        case (keyPressed === LEFT && !goingRight):
            xVelocity = -unitSize;
            yVelocity = 0;
            break;
        case (keyPressed === UP && !goingDown):
            xVelocity = 0;
            yVelocity = -unitSize;
            break;
        case (keyPressed === RIGHT && !goingLeft):
            xVelocity = unitSize;
            yVelocity = 0;
            break;
        case (keyPressed === DOWN && !goingUp):
            xVelocity = 0;
            yVelocity = unitSize;
            break;
    }

    directionLocked = true;  // Lock the direction until the next move
}

// Check if the snake has collided with the wall or itself (game over conditions)
function checkGameOver() {
    switch (true) {
        case (snake[0].x < 0):  // Left wall collision
            running = false;
            break;
        case (snake[0].x >= gameWidth):  // Right wall collision
            running = false;
            break;
        case (snake[0].y < 0):  // Top wall collision
            running = false;
            break;
        case (snake[0].y >= gameHeight):  // Bottom wall collision
            running = false;
            break;
    }
    // Check if the snake collided with itself
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            running = false;
        }
    }
}

// Display the "Game Over" message and update the leaderboard
function displayGameOver() {
    ctx.font = "50px impact";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight / 2);
    running = false;

    // Update and display leaderboard
    updateLeaderboard();
    displayLeaderboard();
}

// Reset the game to the initial state
function resetGame() {
    score = 0;
    xVelocity = unitSize;
    yVelocity = 0;
    snake = [
        { x: unitSize * 4, y: 0 },
        { x: unitSize * 3, y: 0 },
        { x: unitSize * 2, y: 0 },
        { x: unitSize, y: 0 },
        { x: 0, y: 0 }
    ];

    gameStart();
}

// Update the leaderboard with the player's score
function updateLeaderboard() {
    // Check if player already exists on the leaderboard
    const existingPlayer = leaderboard.find(entry => entry.name === playerName);

    if (existingPlayer) {
        // Update the score if it's higher than the previous score
        if (score > existingPlayer.score) {
            existingPlayer.score = score;
        }
    } else {
        // Add new player if they don't exist on the leaderboard
        leaderboard.push({ name: playerName, score: score });
    }

    // Sort the leaderboard by score in descending order
    leaderboard.sort((a, b) => b.score - a.score);

    // Keep only the top 5 scores
    leaderboard = leaderboard.slice(0, 5);

    // Save leaderboard to localStorage
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// Display the leaderboard on the page
function displayLeaderboard() {
    const leaderboardDiv = document.querySelector("#leaderboard");
    leaderboardDiv.innerHTML = "<h2>Leaderboard</h2>";
    leaderboard.forEach((entry, index) => {
        leaderboardDiv.innerHTML += `<p>${index + 1}. ${entry.name}: ${entry.score}</p>`;
    });
}

// Clear the leaderboard and reset localStorage
function clearLeaderboard() {
    leaderboard = [];
    localStorage.removeItem('leaderboard');
    displayLeaderboard();
}

// Add event listener for clearing the leaderboard
document.querySelector("#clearLeaderboard").addEventListener("click", clearLeaderboard);

// Call startGame to begin the game
startGame();
