import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";

export class ScoreNumber extends AcGameObject {
    constructor(playground, game_score_number_ctx) {
        super();
        this.playground = playground;
        this.ctx = game_score_number_ctx;
        this.is_start = false;
        this.time = 0;
        this.images = [];

        this.money_number = 0;
        this.target_number = 456;
        this.level_number = 789;
        this.timer_number = 888;
        this.numbers = [];

        this.add_POS();
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

    add_POS() {
        this.POS = new Array();
        // 0~9  10:"$"
        this.POS["digital"] = [
            [0, 0, 30, 50],
            [30, 0, 25, 50],
            [60, 0, 30, 50],
            [90, 0, 30, 50],
            [2, 50, 28, 50],
            [30, 50, 30, 50],
            [60, 50, 30, 50],
            [90, 50, 30, 50],
            [0, 102, 30, 50],
            [30, 102, 30, 50],

            [60, 100, 30, 50],
        ];

        this.POS["money"] = [0, 0, 64, 48, 100, 30, 4];
        this.POS["target"] = [65, 0, 50, 50, 100, 110, 4];
        this.POS["level"] = [0, 49, 51, 51, 800, 30, 3];
        this.POS["timer"] = [52, 50, 46, 55, 800, 110, 3];
    }

    load_image() {
        this.topfont = new Image();
        this.topfont.src = "/static/image/playground/topfont.png";

        this.images = [
            this.topfont,
        ];
    }

    update() {
        // 图片都加载好之后执行一次resize
        if (!this.is_start && this.is_all_images_loaded()) {
            this.is_start = true;
            this.resize();
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
        this.render();
    }

    render() {
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / 820,
        };

        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.get_numbers(this.money_number);
        this.draw_numbers(canvas, this.POS["money"]);
        this.get_numbers(this.target_number);
        this.draw_numbers(canvas, this.POS["target"]);
        this.get_numbers(this.level_number);
        this.draw_numbers(canvas, this.POS["level"]);
        this.get_numbers(this.timer_number);
        this.draw_numbers(canvas, this.POS["timer"]);
    }

    draw_numbers(canvas, icon_pos) {
        // 数字槽和图标的距离
        let spacing = 10;
        for (let i in this.numbers) {
            let num = this.numbers[i];
            let num_pos = this.POS["digital"][num];
            this.ctx.drawImage(
                this.topfont, num_pos[0], num_pos[1],
                num_pos[2], num_pos[3],
                canvas.scale * icon_pos[4] + canvas.scale * (spacing + 12),
                canvas.scale * (icon_pos[5] + 3),
                num_pos[2] * canvas.scale,
                num_pos[3] * canvas.scale
            );
            spacing += num_pos[2];
        }
    }

    get_numbers(number) {
        let digits = number.toString().split('');
        this.numbers = digits.map(Number)
    }
}