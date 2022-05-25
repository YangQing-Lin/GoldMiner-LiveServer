import { Miner } from "/static/js/src/playground/miner/zbase.js";

export class Gold extends Miner {
    constructor(playground, x, y) {
        super(playground, x, y);
        this.radius = 0.04;
        this.money = 100;
        this.color = "gold";
        this.weight = 120;
    }

    start() {

    }

    update() {
        this.render();
    }
}