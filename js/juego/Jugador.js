class Jugador{
    constructor(name, color) {
        this.name = name;
        this.color = color; // Color de la ficha
        this.nextPiece=null
    }

    getNextPiece(){
        return this.nextPiece;
    }

    setNextPiece(piece){
        this.nextPiece = piece
    }
}