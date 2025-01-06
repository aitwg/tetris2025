const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const startButton = document.getElementById('startButton');

    const grid = 20;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const rows = canvasHeight / grid;
    const cols = canvasWidth / grid;

    const colors = [
      null,
      'cyan',
      'blue',
      'orange',
      'yellow',
      'green',
      'purple',
      'red'
    ];

    const shapes = [
      [],
      [[1, 1, 1, 1]],
      [[1, 0, 0], [1, 1, 1]],
      [[0, 0, 1], [1, 1, 1]],
      [[1, 1], [1, 1]],
      [[0, 1, 1], [1, 1, 0]],
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1, 0], [1, 1, 1]]
    ];

    let board = [];
    let currentPiece = null;
    let score = 0;
    let gameRunning = false;
    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;

    function init() {
      board = Array(rows).fill(null).map(() => Array(cols).fill(0));
      score = 0;
      scoreElement.textContent = score;
      currentPiece = null;
      gameRunning = false;
      dropCounter = 0;
      dropInterval = 1000;
      lastTime = 0;
    }

    function getRandomPiece() {
      const index = Math.floor(Math.random() * (shapes.length - 1)) + 1;
      const shape = shapes[index];
      return {
        x: Math.floor(cols / 2) - Math.floor(shape[0].length / 2),
        y: 0,
        shape: shape,
        color: colors[index]
      };
    }

    function drawPiece() {
      if (!currentPiece) return;
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            context.fillStyle = currentPiece.color;
            context.fillRect((currentPiece.x + x) * grid, (currentPiece.y + y) * grid, grid, grid);
          }
        });
      });
    }

    function clearCanvas() {
      context.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    function drawBoard() {
      board.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            context.fillStyle = colors[value];
            context.fillRect(x * grid, y * grid, grid, grid);
          }
        });
      });
    }

    function collision(x, y, shape) {
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const boardX = x + col;
            const boardY = y + row;
            if (boardX < 0 || boardX >= cols || boardY >= rows || (board[boardY] && board[boardY][boardX])) {
              return true;
            }
          }
        }
      }
      return false;
    }

    function mergePiece() {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            board[currentPiece.y + y][currentPiece.x + x] = colors.indexOf(currentPiece.color);
          }
        });
      });
    }

    function rotatePiece() {
      const shape = currentPiece.shape;
      const rotatedShape = shape[0].map((val, index) => shape.map(row => row[index]).reverse());
      if (!collision(currentPiece.x, currentPiece.y, rotatedShape)) {
        currentPiece.shape = rotatedShape;
      }
    }

    function dropPiece() {
      if (!gameRunning) return;
      dropCounter += 1;
      if (dropCounter > dropInterval / 16) {
        dropCounter = 0;
        currentPiece.y++;
        if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
          currentPiece.y--;
          mergePiece();
          clearLines();
          currentPiece = getRandomPiece();
          if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
            gameRunning = false;
            alert('Game Over! Score: ' + score);
            init();
          }
        }
      }
    }

    function clearLines() {
      let linesCleared = 0;
      for (let y = rows - 1; y >= 0; y--) {
        if (board[y].every(value => value !== 0)) {
          linesCleared++;
          board.splice(y, 1);
          board.unshift(Array(cols).fill(0));
        }
      }
      score += linesCleared * 100;
      scoreElement.textContent = score;
    }

    function gameLoop(time = 0) {
      const deltaTime = time - lastTime;
      lastTime = time;
      clearCanvas();
      drawBoard();
      if (currentPiece) {
        drawPiece();
        dropPiece();
      }
      if (gameRunning) {
        requestAnimationFrame(gameLoop);
      }
    }

    function startGame() {
      init();
      currentPiece = getRandomPiece();
      gameRunning = true;
      gameLoop();
    }

    document.addEventListener('keydown', (event) => {
      if (!gameRunning || !currentPiece) return;
      if (event.key === 'ArrowLeft') {
        if (!collision(currentPiece.x - 1, currentPiece.y, currentPiece.shape)) {
          currentPiece.x--;
        }
      } else if (event.key === 'ArrowRight') {
        if (!collision(currentPiece.x + 1, currentPiece.y, currentPiece.shape)) {
          currentPiece.x++;
        }
      } else if (event.key === 'ArrowDown') {
        if (!collision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
          currentPiece.y++;
        }
      } else if (event.key === 'ArrowUp') {
        rotatePiece();
      }
    });

    startButton.addEventListener('click', startGame);
