class Ficha{
    constructor(player, x, y, radius) {
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius=radius;
    }

    draw(ctx,cellSize) {
        ctx.beginPath();        
        ctx.arc(this.x + cellSize / 2, this.y + cellSize / 2, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.player.color;
        ctx.fill();
        ctx.closePath();
    }
}