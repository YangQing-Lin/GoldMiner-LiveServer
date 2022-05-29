import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";

export class PopUp extends AcGameObject {
    constructor(playground, pop_up_ctx) {
        super();
        this.playground = playground;
        this.ctx = pop_up_ctx;
        this.base_scale = this.playground.base_scale;  // 和图片像素绑定的基准，用于控制所有图片的相对大小

        this.is_start = false;

        this.load_image();
        this.add_POS();
    }

    start() {
        this.resize();

        // 给所有的图片的加载事件绑定一个变量，用于所有图片加载好后直接执行render函数
        // 因为render可能会执行很多次（改变窗口大小），所以不能把绘制图片代码放到onload里面
        for (let img of this.images) {
            img.onload = function () {
                img.is_load = true;
            }
        }
    }

    add_POS() {
        this.POS = new Array();
        this.POS["shop_level"] = [100, 30, 0.6];
    }

    load_image() {
        this.pop_up_background = new Image();
        this.pop_up_background.src = "/static/image/playground/popup-sheet0.png";

        this.images = [
            this.pop_up_background,
        ];
    }

    update() {
        // 图片都加载好之后执行一次resize
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

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
    }

    render() {
        this.resize();
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / this.base_scale,
        };

        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.playground.character = "pop up";
        if (this.playground.character === "pop up") {
            // 当有弹窗的时候需要让游戏屏幕变黑
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

            this.render_pop_up(canvas);
        }
    }

    // 绘制弹窗背景板子
    render_pop_up(canvas) {
        let scale = this.playground.scale;
        let img = this.pop_up_background;
        this.ctx.drawImage(
            img, 0, 0, img.width, img.height,
            canvas.width / 2 - canvas.scale * (img.width / 2),
            canvas.height / 2 - canvas.scale * (img.height),
            canvas.scale * img.width,
            canvas.scale * img.height
        );
    }
}