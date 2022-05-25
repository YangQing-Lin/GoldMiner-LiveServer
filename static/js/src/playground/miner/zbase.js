import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";

export class Miner extends AcGameObject {
    constructor(playground, x, y) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = 0.02;
        this.money = 1;
        this.color = "black";
        this.weight = 1;
        this.is_catched = false;
    }

    start() {

    }

    update() {
        if (!this.is_catched) {
            this.render();
        }
    }

    late_update() {
        if (this.is_catched) {
            this.render()
        }
    }

    render() {
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() {
        for (let i = 0; i < this.playground.miners.length; i++) {
            let miner = this.playground.miners[i];
            if (miner === this) {
                this.playground.miners.splice(i, 1);
                break;
            }
        }
    }

}