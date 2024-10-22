// Clase Jugador
class Player {
    constructor(name, color) {
        this.name = name;
        this.color = color; // Color de la ficha
    }
}

// Clase Ficha
class Piece {
    constructor(player, x, y, size) {
        this.player = player;
        this.x = x;
        this.y = y;
        this.size = size;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.player.color;
        ctx.fill();
        ctx.closePath();
    }
}

// Clase Tablero
class Board {
    constructor(rows, cols, cellSize) {
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;
        this.grid = this.createGrid();
    }

    // Crear el grid vacío
    createGrid() {
        const grid = [];
        for (let row = 0; row < this.rows; row++) {
            grid[row] = new Array(this.cols).fill(null);
        }
        return grid;
    }

    // Dibuja el tablero
    draw(ctx) {
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(0, 0, this.cols * this.cellSize, this.rows * this.cellSize);

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                ctx.beginPath();
                ctx.arc(col * this.cellSize + this.cellSize / 2, row * this.cellSize + this.cellSize / 2, this.cellSize / 2 - 5, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
                ctx.closePath();

                const piece = this.grid[row][col];
                if (piece) {
                    piece.draw(ctx);
                }
            }
        }
    }

    // Coloca una ficha en la columna correspondiente
    dropDisc(col, player) {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (!this.grid[row][col]) {
                const piece = new Piece(player, col * this.cellSize, -this.cellSize, this.cellSize);
                this.grid[row][col] = piece;
                this.animateDrop(piece, row, col);
                return true;
            }
        }
        return false; // Columna llena
    }

    // Animar la caída de la ficha
    animateDrop(piece, targetRow, col) {
        const targetY = targetRow * this.cellSize;
        const interval = setInterval(() => {
            piece.y += 10;
            if (piece.y >= targetY) {
                piece.y = targetY;
                clearInterval(interval);
                if (this.checkForWin(piece, targetRow, col)) {
                    alert(`${piece.player.name} gana!`);
                }
                switchTurns();
            }
            draw();
        }, 20);
    }

    // Verificar si hay 4 fichas en línea
    checkForWin(piece, row, col) {
        return this.checkDirection(piece, row, col, 1, 0) || // Horizontal
               this.checkDirection(piece, row, col, 0, 1) || // Vertical
               this.checkDirection(piece, row, col, 1, 1) || // Diagonal \
               this.checkDirection(piece, row, col, 1, -1);  // Diagonal /
    }

    // Verificar si hay 4 fichas consecutivas en una dirección
    checkDirection(piece, row, col, rowDir, colDir) {
        let count = 1; // Contar la ficha actual

        // Verificar en una dirección (hacia adelante)
        count += this.countPieces(piece, row, col, rowDir, colDir);

        // Verificar en la dirección opuesta (hacia atrás)
        count += this.countPieces(piece, row, col, -rowDir, -colDir);

        return count >= 4; // Si hay 4 o más fichas consecutivas
    }

    // Cuenta cuántas fichas hay consecutivas en una dirección
    countPieces(piece, row, col, rowDir, colDir) {
        let count = 0;
        let newRow = row + rowDir;
        let newCol = col + colDir;

        while (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols && this.grid[newRow][newCol] && this.grid[newRow][newCol].player === piece.player) {
            count++;
            newRow += rowDir;
            newCol += colDir;
        }

        return count;
    }
}

// Variables globales
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let board = new Board(6, 7, 100); // Tablero 6x7 por defecto
let players = [new Player('Jugador 1', '#FF0000'), new Player('Jugador 2', '#FFFF00')]; // Rojo y amarillo
let currentPlayer = 0;
let selectedPiece = null;

// Dibuja el tablero y las fichas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.draw(ctx);
}

// Reinicia el juego
function restartGame() {
    board = new Board(6, 7, 100); // Reiniciar el tablero
    currentPlayer = 0;
    draw();
}

function switchTurns() {
    currentPlayer = (currentPlayer + 1) % 2;
}

// Detección de la columna seleccionada y caída de la ficha
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;

    // Verificar si hizo clic en una columna
    for (let col = 0; col < board.cols; col++) {
        const hintX = col * board.cellSize;
        console.log("x > hintX && x < hintX + board.cellSize")
        console.log("x:"+x+", hintX: "+hintX+", board.cellSize: "+board.cellSize);

        if (x > hintX && x < hintX + board.cellSize) {
            selectedPiece = col;
            break;
        }
    }
});

canvas.addEventListener('mouseup', () => {
    if (selectedPiece !== null) {
        if (board.dropDisc(selectedPiece, players[currentPlayer])) {
            draw(); // Actualizar la pantalla
        }
        selectedPiece = null;
    }
});



// Crea los hints animados
function createHints() {
    const hintsContainer = document.getElementById('hints');
    hintsContainer.innerHTML = ''; // Limpiar hints previos
    for (let col = 0; col < board.cols; col++) {
        const hint = document.createElement('div');
        hint.classList.add('hint');
        hint.style.left = col * board.cellSize + 'px';
        hintsContainer.appendChild(hint);
    }
}

// Inicia el juego
window.onload = () => {
    draw();
    //createHints();
    //startTimer();
};
/*
// Temporizador
let timeLeft = 60;

function startTimer() {
    const timer = setInterval(() => {
        document.getElementById('timer').innerText = `Tiempo: ${timeLeft--}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('Tiempo agotado. Empate.');
        }
    }, 1000);
}
*/