import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";

export class GameBackground extends AcGameObject {
    constructor(root, playground, game_background_ctx) {
        super();
        this.root = root;
        this.playground = playground;
        this.ctx = game_background_ctx;
        this.is_start = false;
        this.time = 0;

        this.load_image();
        this.add_POS();
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

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.render();
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

        this.uisymbols_sheet0 = new Image();
        this.uisymbols_sheet0.src = "/static/image/playground/uisymbols-sheet0.png";

        this.gamepatch = new Image();
        this.gamepatch.src = "/static/image/playground/gamepatch.png";

        this.miner_roll_sheet0 = new Image();
        this.miner_roll_sheet0.src = "/static/image/playground/miner_miner_roll-sheet0.png";

        this.images = [
            this.groundtile, this.purpletile, this.bgtile1, this.bgtile2,
            this.bgtile3, this.bgtile4, this.gametopbg, this.uisymbols_sheet0,
            this.gamepatch, this.miner_roll_sheet0,
        ];
    }

    add_POS() {
        this.POS = new Array();
        this.POS["money"] = [0, 0, 64, 48, 100, 30, 5];
        this.POS["target"] = [65, 0, 50, 50, 100, 110, 5];
        this.POS["level"] = [0, 49, 51, 51, 800, 30, 3];
        this.POS["timer"] = [52, 50, 46, 55, 800, 110, 3];
        this.POS["gamepatch_head"] = [0, 0, 14, 64];
        this.POS["gamepatch_item"] = [15, 0, 39, 64];
        this.POS["gamepatch_tile"] = [56, 0, 14, 64];
        // this.POS["miner_roll_sheet0"] = [];
    }

    render() {
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / 820,
        };

        this.draw_sky_ground(canvas);
        this.draw_dirt_color(canvas);  // 画泥土背景颜色
        this.draw_bg_tile(canvas);  // 画泥土分层
        this.draw_ground_tile(canvas);  // 画地面

        this.draw_miner_roll(canvas, this.miner_roll_sheet0);  // 画卷线器

        this.draw_scoreboard_background(canvas);
    }

    draw_scoreboard_background(canvas) {
        // 绘制金钱数量背景
        this.draw_scoreboard_background_item(canvas, this.POS["money"]);
        this.draw_scoreboard_background_item(canvas, this.POS["target"]);
        this.draw_scoreboard_background_item(canvas, this.POS["level"]);
        this.draw_scoreboard_background_item(canvas, this.POS["timer"]);
    }

    // 画卷线器
    draw_miner_roll(canvas, img) {
        let scale = this.playground.scale;
        if (this.playground.players && this.playground.players.length > 0) {
            for (let player of this.playground.players) {
                player.render();  // 绘制用户头像
                this.ctx.drawImage(
                    img, 0, 0, img.width, img.height,
                    player.x * scale - img.width / 2 * canvas.scale,
                    player.y * scale - img.height / 2 * canvas.scale,
                    img.width * canvas.scale, img.height * canvas.scale
                );
            }
        }

    }

    // 按照传入的位置参数绘制图标和数字槽
    draw_scoreboard_background_item(canvas, icon_pos) {
        this.ctx.drawImage(
            this.uisymbols_sheet0, icon_pos[0], icon_pos[1], icon_pos[2], icon_pos[3],
            canvas.scale * (icon_pos[4] - icon_pos[2]), canvas.scale * icon_pos[5],
            icon_pos[2] * canvas.scale, icon_pos[3] * canvas.scale
        );
        // 绘制图标后面的数字槽
        this.draw_scoreboard_background_number_slot(canvas, icon_pos[6], icon_pos);
    }

    // 绘制存放数字的槽
    draw_scoreboard_background_number_slot(canvas, number, icon_pos) {
        // 数字槽和图标的距离
        let spacing = 10;
        // 绘制数字槽的头部
        let patch_head = this.POS["gamepatch_head"];
        this.ctx.drawImage(
            this.gamepatch, patch_head[0], patch_head[1],
            patch_head[2], patch_head[3],
            canvas.scale * icon_pos[4] + canvas.scale * spacing,
            canvas.scale * icon_pos[5] - canvas.scale * 5,
            patch_head[2] * canvas.scale,
            patch_head[3] * canvas.scale
        );
        // 绘制数字槽的中部
        let patch_item = this.POS["gamepatch_item"];
        for (let i = 0; i < number; i++) {
            this.ctx.drawImage(
                this.gamepatch, patch_item[0], patch_item[1],
                patch_item[2], patch_item[3],
                // 中间方块的偏移量包含了三部分：左边图标的距离 + 方块头部的长度 + 前面中间方块的长度
                canvas.scale * icon_pos[4] + canvas.scale * (spacing + patch_head[2] + patch_item[2] * i),
                canvas.scale * icon_pos[5] - canvas.scale * 5,
                patch_item[2] * canvas.scale,
                patch_item[3] * canvas.scale
            );
        }
        // 绘制数字槽的尾部
        let patch_tile = this.POS["gamepatch_tile"];
        this.ctx.drawImage(
            this.gamepatch, patch_tile[0], patch_tile[1],
            patch_tile[2], patch_tile[3],
            canvas.scale * icon_pos[4] + canvas.scale * (spacing + patch_head[2] + patch_item[2] * number),
            canvas.scale * icon_pos[5] - canvas.scale * 5,
            patch_tile[2] * canvas.scale,
            patch_tile[3] * canvas.scale
        );
    }

    // 画泥土分层
    draw_bg_tile(canvas) {
        for (let i = 0; i < 3; i++) {
            this.ctx.drawImage(
                this.bgtile2, 0, 0, this.bgtile2.width, this.bgtile2.height,
                canvas.width / 3 * i, canvas.height * 0.42,
                canvas.width / 3, canvas.height * 0.12
            );
        }

        for (let i = 0; i < 3; i++) {
            this.ctx.drawImage(
                this.bgtile1, 0, 0, this.bgtile1.width, this.bgtile1.height,
                canvas.width / 3 * i, canvas.height * 0.58,
                canvas.width / 3, canvas.height * 0.1
            );
        }

        for (let i = 0; i < 3; i++) {
            this.ctx.drawImage(
                this.bgtile3, 0, 0, this.bgtile3.width, this.bgtile3.height,
                canvas.width / 3 * i, canvas.height * 0.70,
                canvas.width / 3, canvas.height * 0.1
            );
        }

        let num = 6;
        for (let i = 0; i < num; i++) {
            this.ctx.drawImage(
                this.bgtile4, 0, 0, this.bgtile4.width, this.bgtile4.height,
                canvas.width / num * i, canvas.height * 0.8,
                canvas.width / num, canvas.height * 0.2
            );
        }
    }

    draw_ground_tile(canvas) {
        // 画地面
        for (let i = 0; i < 3; i++) {
            this.ctx.drawImage(
                this.groundtile, 0, 0, this.groundtile.width, this.groundtile.height,
                canvas.width / 3 * i, canvas.height * 0.28,
                canvas.width / 3, canvas.height * 0.058
            );
        }
    }

    draw_dirt_color(canvas) {
        // 画背景泥土颜色
        this.ctx.fillStyle = "rgb(86,52,37)";
        this.ctx.fillRect(0, canvas.height * 0.30, canvas.width, canvas.height);
    }

    draw_sky_ground(canvas) {
        let num = 8;
        for (let i = 0; i < num; i++) {
            this.ctx.drawImage(
                this.purpletile, 0, 0, this.purpletile.width, this.purpletile.height,
                canvas.width / num * i, canvas.height * 0,
                canvas.width / num, canvas.height * 0.30
            );
        }

        num = 3;
        for (let i = 0; i < num; i++) {
            this.ctx.drawImage(
                this.gametopbg, 0, 0, this.gametopbg.width, this.gametopbg.height,
                canvas.width / num * i, canvas.height * 0.13,
                canvas.width / num, canvas.height * 0.159
            );
        }
    }
}