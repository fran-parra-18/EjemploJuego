// Variables globales
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let board = null;
let players = [new Jugador('Jugador ROJO', '#FF0000'), new Jugador('Jugador AMARILLO', '#FFFF00')]; // Rojo y amarillo
let currentPlayer = 0;
let selectedPiece = null;
let xEnLinea =0;

let draggedPiece = null; // Ficha que se está arrastrando
let draggedPiecePos = { x: 0, y: 0 }; // Posición actual de la ficha arrastrada
let radius = null;// Tamaño de las fichas que se mostrarán arriba

//botones
let buttonWidth = 200;
let buttonHeight = 40;

// Dibuja el tablero y las fichas
function draw() {
    if(xEnLinea!=0){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff'; // Color azul para el fondo del tablero
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        board.draw(ctx);
        displayTurn(); 
        drawPlayerPieces();
        // Dibuja el botón de reiniciar en la esquina inferior derecha
        let restartButtonX = canvas.width - buttonWidth - 20;
        let restartButtonY = canvas.height - buttonHeight - 20;
        ctx.fillStyle = "#FF0000"; // Rojo para reiniciar
        ctx.fillRect(restartButtonX, restartButtonY, buttonWidth, buttonHeight);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("Reiniciar", restartButtonX + buttonWidth / 2, restartButtonY + buttonHeight / 2);

        //dibuja boton
        let backButtonX = 20;
        let backButtonY = 20;
        ctx.fillStyle = "#FF5733"; // Naranja para el botón
        ctx.fillRect(backButtonX, backButtonY, 30, 30);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("X", backButtonX + 30 / 2, backButtonY + 30 / 2); 

        if (draggedPiece) {
            ctx.beginPath();
            ctx.arc(draggedPiecePos.x, draggedPiecePos.y, radius, 0, Math.PI * 2); // Ficha de radio
            ctx.fillStyle = draggedPiece.color;
            ctx.fill();
            ctx.closePath();
        }
    }else{
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawButtons();
    }
    
    if(board.ganador){
        board.ganador=false;
        restartGame();
    }
}

function startGame(x) {
    xEnLinea=x;
    board = new Tablero(
        ctx,        // Contexto del canvas
        xEnLinea,   // Configuración de x en línea
        150,        // marginTop
        50,        // marginBottom
        100,        // marginRight
        100         // marginLeft
    );
    currentPlayer = 0;  // Reiniciamos el turno al primer jugador
    radius = board.getCellSize() / 2 - 5;
    draw();             // Redibujar el tablero con las nuevas dimensiones

}

function drawPlayerPieces() {    

    players.forEach((player, index) => {
        let x=null
        if(index==0){
            x = board.marginLeft+board.cellSize/2; // Espacio entre fichas
        }else{
            x = board.marginLeft+(board.cellSize*board.cols)-radius ; // Espacio entre fichas
        }     
        
        let y = 80; // Posición fija en la parte superior del canvas
        player.piecePosition = { x, y, radius }; // Guardamos la posición para detectar el arrastre

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.closePath();
    });
}

function switchTurns() {
    currentPlayer = (currentPlayer + 1) % 2;
}

function displayTurn() {
    let posX = canvas.width / 2; // Posición horizontal centrada
    let posY = board.marginTop / 2; // Posición vertical entre el tablero y las fichas
    ctx.font = '20px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(`Turno de ${players[currentPlayer].name}`, posX, posY);
}



canvas.addEventListener('mousedown', (event) => {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    // Verifica si se hace clic en una de las fichas del jugador actual
    let currentPlayerPiece = players[currentPlayer].piecePosition; // Ficha del jugador actual
    let { x: pieceX, y: pieceY, radius } = currentPlayerPiece;
    
    let distance = Math.sqrt((x - pieceX) ** 2 + (y - pieceY) ** 2);
    
    // Solo permite arrastrar la ficha si es del jugador actual
    if (distance < radius) {
        draggedPiece = players[currentPlayer]; // Guarda el jugador actual cuya ficha se arrastra
        draggedPiecePos = { x: pieceX, y: pieceY }; // Inicializa la posición arrastrada
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (draggedPiece) {
        let rect = canvas.getBoundingClientRect();
        draggedPiecePos.x = event.clientX - rect.left;
        draggedPiecePos.y = event.clientY - rect.top;
        draw(); // Redibujar el canvas con la ficha moviéndose
    }
});

canvas.addEventListener('mouseup', (event) => {
    if (draggedPiece) {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        let pieceDropped = false;

        // Verificar si la ficha está sobre una columna
        for (let col = 0; col < board.cols; col++) {
            let hintX = board.marginLeft + col * board.cellSize;
            if (x > hintX && x < hintX + board.cellSize && y > board.marginTop) {
                // Colocar la ficha en la columna
                if (board.dropDisc(col, draggedPiece)) {
                    draw(); // Redibuja el tablero
                    switchTurns();
                    pieceDropped = true;
                }
                break;
            }
        }

        // Si no se ha colocado la ficha, devolverla a su lugar
        if (!pieceDropped) {
            
            let startPos = draggedPiece.piecePosition;  // Posición inicial de la ficha
            
            returnPieceToStart(draggedPiece, startPos);  // Iniciar animación de retorno
        }

        draggedPiece = null; // Reseteamos el arrastre
    }
});

function returnPieceToStart(player, startPos) {
    let frames = 20;  // Número de frames para la animación
    let deltaX = (startPos.x - draggedPiecePos.x) / frames;
    let deltaY = (startPos.y - draggedPiecePos.y) / frames;
    
    let currentFrame = 0;

    function animateReturn() {
        if (currentFrame < frames) {
            draggedPiecePos.x += deltaX;
            draggedPiecePos.y += deltaY;
            draw();  // Redibujar el tablero y la ficha
            currentFrame++;
            requestAnimationFrame(animateReturn);  // Continuar animando
        } else {
            // Una vez que termina la animación, devuelve la ficha a su posición original
            draggedPiecePos.x = startPos.x;
            draggedPiecePos.y = startPos.y;
            draw();
        }
    }

    animateReturn();
}

function drawButtons() {
    // Configuraciones básicas de los botones    
    let startY = 50;  // Margen superior para los botones
    let margin = 20;  // Espacio entre botones

    // Colores y estilos
    ctx.fillStyle = "#4CAF50"; // Verde para el botón
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Botón para Jugar 4 en línea
    ctx.fillRect(canvas.width / 2 - buttonWidth / 2, startY, buttonWidth, buttonHeight);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Jugar 4 en línea", canvas.width / 2, startY + buttonHeight / 2);
    
    // Botón para Jugar 5 en línea
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(canvas.width / 2 - buttonWidth / 2, startY + buttonHeight + margin, buttonWidth, buttonHeight);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Jugar 5 en línea", canvas.width / 2, startY + buttonHeight * 1.5 + margin);

    // Botón para Jugar 6 en línea
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(canvas.width / 2 - buttonWidth / 2, startY + (buttonHeight + margin) * 2, buttonWidth, buttonHeight);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Jugar 6 en línea", canvas.width / 2, startY + buttonHeight * 3 + margin);
}


canvas.addEventListener('click', function(event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    
    let startY = 50;
    let margin = 20;
    // Coordenadas del botón de "Jugar 4 en línea"
    let buttonX = canvas.width / 2 - buttonWidth / 2;
    
    if(xEnLinea==0){ 
        
        if (x >= buttonX && x <= buttonX + buttonWidth) {
            if (y >= startY && y <= startY + buttonHeight) {
                startGame(4); // Jugar 4 en línea
            }else if (y >= startY + buttonHeight + margin && y <= startY + (buttonHeight + margin + buttonHeight)) {
                startGame(5); // Jugar 5 en línea
            } else if (y >= startY + (buttonHeight + margin) * 2 && y <= startY + (buttonHeight + margin) * 2 + buttonHeight) {
                startGame(6); // Jugar 6 en línea
            }
        }
        
    }else{
        // Coordenadas del botón de "Reiniciar"
        let restartButtonX = canvas.width - buttonWidth - 20;
        let restartButtonY = canvas.height - buttonHeight - 20;
        if (x >= restartButtonX && x <= restartButtonX + buttonWidth && y >= restartButtonY && y <= restartButtonY + buttonHeight) {
            restartGame(); // Reiniciar juego
        }

        // Coordenadas del botón de "Volver"
        let backButtonX = 20;
        let backButtonY = 20;
        if (x >= backButtonX && x <= backButtonX + buttonWidth && y >= backButtonY && y <= backButtonY + buttonHeight) {
            xEnLinea=0;
            draw() // Función que maneja el volver atrás
        }
    }

});

// Reinicia el juego
function restartGame() {    
    board = new Tablero(
        ctx,        // Contexto del canvas
        xEnLinea,   // Configuración de x en línea
        150,        // marginTop
        50,        // marginBottom
        100,        // marginRight
        100         // marginLeft
    );
    currentPlayer = 0;
    draw();
}





// Inicia el juego
window.onload = () => {
    startGame(xEnLinea)
    //startTimer();
};

// Temporizador
/*
let timeLeft = 60;
function startTimer() {

    let timer = setInterval(() => {
        
        document.getElementById('timer').innerText = `Tiempo: ${timeLeft--}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('Tiempo agotado. Empate.');
        }
    }, 1000);
}
*/