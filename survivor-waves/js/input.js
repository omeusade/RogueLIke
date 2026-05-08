export class Input {
    constructor(canvas) {
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;

        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.mouseDown = true;
        });

        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouseDown = false;
        });

        window.addEventListener('contextmenu', (e) => e.preventDefault());

        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (['w', 'a', 's', 'd', ' '].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        canvas.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }

    isDown(key) {
        return this.keys[key] === true;
    }

    getMovement() {
        let dx = 0, dy = 0;
        if (this.isDown('w') || this.isDown('arrowup')) dy -= 1;
        if (this.isDown('s') || this.isDown('arrowdown')) dy += 1;
        if (this.isDown('a') || this.isDown('arrowleft')) dx -= 1;
        if (this.isDown('d') || this.isDown('arrowright')) dx += 1;

        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) { dx /= len; dy /= len; }

        return { x: dx, y: dy };
    }
}
