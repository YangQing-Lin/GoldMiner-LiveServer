import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";

export class GameBackground extends AcGameObject {
    constructor(playground, game_background_ctx) {
        super();
        this.playground = playground;
        this.ctx = game_background_ctx;
        this.is_start = false;
        this.time = 0;

        this.load_image();
    }

    start() {
        // 给所有的图片的加载事件绑定一个变量，用于所有图片加载好后直接执行render函数
        // 因为render可能会执行很多次（改变窗口大小），所以不能把绘制图片代码放到onload里面
        for (let img of this.images) {
            img.onload = function () {
                img.is_load = true;
            }
        }
    }

    late_start() {
        this.render();
    }

    load_image() {
        this.groundtile = new Image();
        this.groundtile.src = "/static/image/playground/groundtile.png";

        this.purpletile = new Image();
        this.purpletile.src = "/static/image/playground/purpletile.png";

        this.bgtile3 = new Image();
        this.bgtile3.src = "/static/image/playground/bgtile3.png";

        this.bgtile2 = new Image();
        this.bgtile2.src = "/static/image/playground/bgtile2.png";

        this.bgtile1 = new Image();
        this.bgtile1.src = "/static/image/playground/bgtile1.png";

        this.bgtile4 = new Image();
        this.bgtile4.src = "/static/image/playground/bgtile4.png";

        this.gametopbg = new Image();
        this.gametopbg.src = "/static/image/playground/gametopbg.png";

        this.images = [
            this.groundtile, this.purpletile, this.bgtile1, this.bgtile2,
            this.bgtile3, this.bgtile4, this.gametopbg,
        ];
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.render();
    }

    update() {
        if (!this.is_start && this.is_all_images_loaded()) {
            this.is_start = true;
            this.render();
        }
    }

    is_all_images_loaded() {
        for (let img of this.images) {
            if (!img.is_load) {
                return false;
            }
        }
        return true;
    }

    render() {
        console.log("start render background");

        let outer = this;
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
        };

        this.draw_sky_ground(canvas);
        this.draw_dirt_color(canvas);  // 画泥土背景颜色
        this.draw_bg_tile(canvas);  // 画泥土分层
        this.draw_ground_tile(canvas);  // 画地面

        // this.ctx.fillStyle = "#000000";
        // this.ctx.fillRect(
        //     0, canvas.height * 0.2,
        //     canvas.width * 0.1, canvas.height * 0.1
        // );
    }

    // 画泥土分层
    draw_bg_tile(canvas) {
        let outer = this;

        for (let i = 0; i < 3; i++) {
            outer.ctx.drawImage(
                outer.bgtile2, 0, 0, outer.bgtile2.width, outer.bgtile2.height,
                canvas.width / 3 * i, canvas.height * 0.38,
                canvas.width / 3, canvas.height * 0.12
            );
        }

        for (let i = 0; i < 3; i++) {
            outer.ctx.drawImage(
                outer.bgtile1, 0, 0, outer.bgtile1.width, outer.bgtile1.height,
                canvas.width / 3 * i, canvas.height * 0.55,
                canvas.width / 3, canvas.height * 0.1
            );
        }

        for (let i = 0; i < 3; i++) {
            outer.ctx.drawImage(
                outer.bgtile3, 0, 0, outer.bgtile3.width, outer.bgtile3.height,
                canvas.width / 3 * i, canvas.height * 0.67,
                canvas.width / 3, canvas.height * 0.1
            );
        }

        let num = 6;
        for (let i = 0; i < num; i++) {
            outer.ctx.drawImage(
                outer.bgtile4, 0, 0, outer.bgtile4.width, outer.bgtile4.height,
                canvas.width / num * i, canvas.height * 0.8,
                canvas.width / num, canvas.height * 0.2
            );
        }
    }

    draw_ground_tile(canvas) {
        let outer = this;

        // 画地面
        for (let i = 0; i < 3; i++) {
            outer.ctx.drawImage(
                outer.groundtile, 0, 0, outer.groundtile.width, outer.groundtile.height,
                canvas.width / 3 * i, canvas.height * 0.25,
                canvas.width / 3, canvas.height * 0.058
            );
        }
    }

    draw_dirt_color(canvas) {
        // 画背景泥土颜色
        this.ctx.fillStyle = "rgb(86,52,37)";
        this.ctx.fillRect(0, canvas.height * 0.28, canvas.width, canvas.height);
    }

    draw_sky_ground(canvas) {
        let outer = this;

        let num = 8;
        for (let i = 0; i < num; i++) {
            outer.ctx.drawImage(
                outer.purpletile, 0, 0, outer.purpletile.width, outer.purpletile.height,
                canvas.width / num * i, canvas.height * 0,
                canvas.width / num, canvas.height * 0.28
            );
        }

        num = 3;
        for (let i = 0; i < num; i++) {
            outer.ctx.drawImage(
                outer.gametopbg, 0, 0, outer.gametopbg.width, outer.gametopbg.height,
                canvas.width / num * i, canvas.height * 0.1,
                canvas.width / num, canvas.height * 0.159
            );
        }
    }
}