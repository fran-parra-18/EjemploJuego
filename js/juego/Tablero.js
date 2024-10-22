class Tablero {

    constructor(context, xEnLinea, marginTop, marginBottom, marginRight, marginLeft) {
        this.context = context;
        this.xEnLinea = xEnLinea;
        this.rows = this.xEnLinea + 2; // Filas según la configuración de X en línea
        this.cols = this.xEnLinea + 3; // Columnas según la configuración de X en línea

        // Márgenes para posicionar el tablero
        this.marginTop = marginTop;
        this.marginBottom = marginBottom;
        this.marginRight = marginRight;
        this.marginLeft = marginLeft;

        this.ganador=false;

        this.cellSize = (canvas.height - this.marginTop - this.marginBottom) / this.rows;
        
         // Inicializamos la matriz del tablero
        this.grid = this.createGrid();
    }

    // Métodos para obtener dimensiones del tablero y las casillas
    getWidth() {
        return canvas.width - this.marginRight - this.marginLeft;
    }

    getHeight() {
        return canvas.height - this.marginTop - this.marginBottom;
    }

    getWidthCasilla() {
        return this.getWidth() / this.getCantCol();
    }

    getHeightCasilla() {
        return this.getHeight() / this.getCantFil();
    }

    getCantFil() {
        return this.rows;
    }

    getCantCol() {
        return this.cols;
    }

    getCellSize(){
        return this.cellSize
    }

    getganador(){
        return this.ganador;
    }

    createGrid() {
        const grid = [];
        for (let row = 0; row < this.rows; row++) {
            grid[row] = new Array(this.cols).fill(null);
        }
        return grid;
    }

    draw() {
        // Calculamos el tamaño y la posición de las casillas
        let posX = 0;
        let posY = 0;
        
        let radius =  this.cellSize / 2 - 5; // Radio de las casillas (agujeros)...-5 es la distancia del agujero al borde de la casilla
        
        this.context.save();
        // Dibujamos las casillas del tablero
        for (let fila = 0; fila < this.getCantFil(); fila++) {
            posY = this.marginTop + this.cellSize * fila;
            for (let columna = 0; columna < this.getCantCol(); columna++) {
                posX = this.marginLeft + this.cellSize * columna;
                

                // Dibujar el fondo del tablero (rectángulo)
                this.context.fillStyle = '#0000FF'; // Color azul para el fondo del tablero
                this.context.fillRect(posX, posY, this.cellSize, this.cellSize);

                // Dibujar el agujero donde cae la ficha (círculo blanco)
                this.context.beginPath();
                this.context.arc(
                    posX + this.cellSize / 2,  // Coordenada X del centro del círculo
                    posY + this.cellSize / 2, // Coordenada Y del centro del círculo
                    radius,                 // Radio del círculo
                    0, Math.PI * 2           // Dibujar círculo completo
                );
                this.context.fillStyle = '#ffffff'; // Color blanco para el agujero
                this.context.fill();
                this.context.closePath();

                const piece = this.grid[fila][columna];
                
                if (piece) {
                    piece.draw(ctx,this.cellSize);
                }
            }
        }
        this.context.restore();
    }



    // Coloca una ficha en la columna correspondiente
    dropDisc(col, player) {        
        for (let row = this.rows - 1; row >= 0; row--) {
            if (!this.grid[row][col]) {
                let radius = this.cellSize / 2 - 5;
                const piece = new Ficha(player, col * this.cellSize + this.marginLeft, -this.cellSize, radius);
                this.grid[row][col] = piece;
                this.animateDrop(piece, row, col);                
                return true;
            }
        }
        return false; // Columna llena
    }

    // Animar la caída de la ficha
    animateDrop(piece, targetRow, col) {
        
        const targetY = targetRow * this.cellSize + this.marginTop;
        
        

        const interval = setInterval(() => {
            piece.y += 10;
            if (piece.y >= targetY) {
                piece.y = targetY;
                clearInterval(interval);
                if (this.checkForWin(piece, targetRow, col)) {
                    alert(`${piece.player.name} gana!`);
                    this.ganador=true;
                }
                
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

        return count >= this.xEnLinea; // Si hay 4 o más fichas consecutivas
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