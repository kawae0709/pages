const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const speedElement = document.getElementById('speed-value'); // For displaying speed
const highScoreElement = document.getElementById('high-score');
const messageElement = document.getElementById('message');


const targetWidth = 720;  // 目标宽度为 720p
const tileCount = 20;  // 保持20个格子
const gridSize = targetWidth / tileCount;  // 计算每个格子的大小

canvas.width = canvas.height = tileCount * gridSize;  // 设置canvas的宽高


const scale = window.devicePixelRatio;  // 获取设备的像素比例

// 设置高分辨率的 canvas 宽高，并缩放内容
canvas.width = targetWidth * scale;
canvas.height = (tileCount * gridSize) * scale;
ctx.scale(scale, scale);  // 缩放以适应屏幕上的显示


let snake = [{x: 10, y: 10}];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = 0;
let gameInterval;
let gameState = 'start'; // 'start', 'playing', 'paused', 'over'

let speed = 1.0;  // Initial speed

function drawGame() {
    clearCanvas();
    drawGrid();
    moveSnake();
    drawSnake();
    drawFood();
    checkCollision();
    updateScore();
}

function clearCanvas() {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background-color');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-color');
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        generateFood();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    const emojiSize = gridSize * 0.95;  // 适配emoji的大小，让它比网格稍小一点
    ctx.font = `${emojiSize}px Arial`;  // 设置emoji的字体大小
    ctx.textAlign = 'center';  // 使emoji水平居中
    ctx.textBaseline = 'middle';  // 使emoji垂直居中

    snake.forEach((segment, index) => {
        const x = segment.x * gridSize + gridSize / 2;  // 调整x位置，让emoji居中
        const y = segment.y * gridSize + gridSize / 2;  // 调整y位置，让emoji居中

        if (index === 0) {
            ctx.fillText('🐸', x, y);  // 绘制蛇头
        } else {
            ctx.fillText('❇️', x, y);  // 绘制蛇身体
        }
    });
}


function drawFood() {
    const emojiSize = gridSize * 1;  // 适配emoji的大小
    ctx.font = `${emojiSize}px Arial`;  // 设置字体大小
    ctx.textAlign = 'center';  // 水平居中
    ctx.textBaseline = 'middle';  // 垂直居中

    const x = food.x * gridSize + gridSize / 2;  // 调整x位置，让emoji居中
    const y = food.y * gridSize + gridSize / 2;  // 调整y位置，让emoji居中

    ctx.fillText(currentFoodEmoji, x, y);  // 绘制当前选中的emoji食物
}


const foodEmojis = ['🍎', '🍌', '🍔', '🍈', '🍇', '🍓', '🍕', '🥕', '🐢', '🌶️', '🍄‍🟫', '🪿', '🍗', '🍩', '💩'];  // 多个食物的emoji
let currentFoodEmoji = '🍎';  // 当前食物的emoji

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    // 随机选择一个emoji作为食物
    currentFoodEmoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }
}

function updateScore() {
    scoreElement.textContent = `分数: ${score}`;
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = `最高分: ${highScore}`;
    }
}

function updateSpeed() {
    speedElement.textContent = speed.toFixed(1); // Display the current speed
}

function gameOver() {
    clearInterval(gameInterval);
    gameState = 'over';
    messageElement.textContent = '游戏结束!按空格键重新开始';
}

function startGame() {
    snake = [{x: 10, y: 10}];
    generateFood();
    dx = 0;
    dy = -1;
    score = 0;
    speed = 1.0; // Reset to default speed
    updateScore();
    updateSpeed();
    gameState = 'playing';
    messageElement.textContent = '';
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(drawGame, 180/ speed); // Adjust game speed
}

function togglePause() {
    if (gameState === 'playing') {
        clearInterval(gameInterval);
        gameState = 'paused';
        messageElement.textContent = '游戏暂停,按空格键继续';
    } else if (gameState === 'paused') {
        gameState = 'playing';
        messageElement.textContent = '';
        gameInterval = setInterval(drawGame, 180/ speed); // Continue with current speed
    }
}

let canChangeDirection = true;  // 新增变量，控制是否允许改变方向

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'start' || gameState === 'over') {
            startGame();
        } else if (gameState === 'playing' || gameState === 'paused') {
            togglePause();
        }
    } else if (gameState === 'playing' && canChangeDirection) {  // 只有允许时才能改变方向
        switch(e.key) {
            case 'ArrowUp': 
                if (dy === 0 && !(dx === 0 && dy === 1)) {  // 禁止反向移动
                    dx = 0; dy = -1;
                    canChangeDirection = false;  // 改变方向后，禁止再次改变直到蛇移动
                }
                break;
            case 'ArrowDown': 
                if (dy === 0 && !(dx === 0 && dy === -1)) {  // 禁止反向移动
                    dx = 0; dy = 1;
                    canChangeDirection = false;
                }
                break;
            case 'ArrowLeft': 
                if (dx === 0 && !(dx === 1 && dy === 0)) {  // 禁止反向移动
                    dx = -1; dy = 0;
                    canChangeDirection = false;
                }
                break;
            case 'ArrowRight': 
                if (dx === 0 && !(dx === -1 && dy === 0)) {  // 禁止反向移动
                    dx = 1; dy = 0;
                    canChangeDirection = false;
                }
                break;
            case 'a': // 减速
                speed = Math.max(0.2, speed - 0.2);
                clearInterval(gameInterval);
                gameInterval = setInterval(drawGame, 150 / speed);
                updateSpeed();
                break;
            case 's': // 重置速度
                speed = 1.0;
                clearInterval(gameInterval);
                gameInterval = setInterval(drawGame, 150 / speed);
                updateSpeed();
                break;
            case 'd': // 加速
                speed = Math.min(5.0, speed + 0.2);
                clearInterval(gameInterval);
                gameInterval = setInterval(drawGame, 150 / speed);
                updateSpeed();
                break;
        }
    }
});

function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score++;
        generateFood();
    } else {
        snake.pop();
    }

    canChangeDirection = true;  // 一旦蛇完成一次移动，允许再次改变方向
}


// Start button event listener
const startButton = document.getElementById('start-btn');

startButton.addEventListener('click', () => {
    if (gameState === 'start' || gameState === 'over') {
        startGame(); // Start the game when the button is clicked
    }
});




// 虚拟按键
document.getElementById('up-btn').addEventListener('click', () => {
    if (dy === 0) { dx = 0; dy = -1; } // Up
});
document.getElementById('down-btn').addEventListener('click', () => {
    if (dy === 0) { dx = 0; dy = 1; } // Down
});
document.getElementById('left-btn').addEventListener('click', () => {
    if (dx === 0) { dx = -1; dy = 0; } // Left
});
document.getElementById('right-btn').addEventListener('click', () => {
    if (dx === 0) { dx = 1; dy = 0; } // Right
});


// 初始化游戏
clearCanvas();
drawGrid();
messageElement.textContent = '按下空格键开始游戏';
gameState = 'start';
