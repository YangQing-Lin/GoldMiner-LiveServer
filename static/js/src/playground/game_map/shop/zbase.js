import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";

export class Shop extends AcGameObject {
    constructor(playground, game_shop_ctx) {
        super();
        this.playground = playground;
        this.ctx = game_shop_ctx;

        this.is_start = false;
        this.eps = 0.01;
        this.base_scale = this.playground.base_scale;  // 和图像绑定的基准值，与像素个数相乘来获得相对的大小

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

    update() {
        // 图片都加载好之后执行一次resize
        if (!this.is_start && this.is_all_images_loaded()) {
            this.is_start = true;
            this.resize();
        }
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.render();
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
        // 各种背景板的图片
        this.shop_top_tile = new Image();
        this.shop_top_tile.src = "/static/image/playground/shoptoptile.png";
        this.shop_symbols = new Image();
        this.shop_symbols.src = "/static/image/playground/shopsymbols-sheet0.png";
        this.shop_patch = new Image();
        this.shop_patch.src = "/static/image/playground/shoppatch.png";

        this.images = [
            this.shop_top_tile, this.shop_symbols, this.shop_patch,
        ];
    }

    add_POS() {
        let rad = Math.PI / 180;

        // 背景板的位置信息
        this.POS = new Array();
        this.POS["shop_top_tile"] = [this.shop_top_tile];
        // 0~3：图标在图片中的位置和图标长宽
        // 4：调出来的横坐标偏移量
        this.POS["star"] = [0, 49, 51, 55, 80, 3];
        this.POS["bomb"] = [65, 0, 50, 55, 300, 3];
        this.POS["money"] = [0, -5, 64, 55, 520, 10];
        this.POS["shop_patch_head"] = [0, 0, 22, 60];
        this.POS["shop_patch_item"] = [22, 0, 29, 60];
        this.POS["shop_patch_tile"] = [127, 0, 25, 60];

    }

    render() {
        // 先清空屏幕
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        let scale = this.playground.scale;
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / this.base_scale,
        };

        this.draw_shop_top_tile(canvas);
        this.draw_shop_symbols_and_number_slot(canvas, this.POS["star"]);
        this.draw_shop_symbols_and_number_slot(canvas, this.POS["bomb"]);
        this.draw_shop_symbols_and_number_slot(canvas, this.POS["money"]);
    }

    // 绘制三个图标以及旁边的数字槽
    draw_shop_symbols_and_number_slot(canvas, icon_pos) {
        // 图标的纵坐标位置和木纹高度绑定，通过计算绘制在刚好二分之一的位置
        // 图标的横坐标通过调参获得
        this.ctx.drawImage(
            this.shop_symbols, icon_pos[0], icon_pos[1], icon_pos[2], icon_pos[3],
            (icon_pos[4] - icon_pos[2]) * canvas.scale,
            (this.shop_top_tile.height - icon_pos[3]) / 2 * canvas.scale,
            icon_pos[2] * canvas.scale,
            icon_pos[3] * canvas.scale
        );

        // 绘制每个图标旁边的数字槽
        this.draw_number_slot(canvas, icon_pos[5], icon_pos);
    }

    draw_number_slot(canvas, number, icon_pos) {
        // 数字槽和图标的距离
        let spacing = 10;

        // 绘制数字槽的头部
        let patch_head = this.POS["shop_patch_head"];
        this.ctx.drawImage(
            this.shop_patch, patch_head[0], patch_head[1],
            patch_head[2], patch_head[3],
            canvas.scale * icon_pos[4] + canvas.scale * spacing,
            (this.shop_top_tile.height - icon_pos[3]) / 2 * canvas.scale,
            patch_head[2] * canvas.scale,
            patch_head[3] * canvas.scale
        );
        // 绘制数字槽的中部
        let patch_item = this.POS["shop_patch_item"];
        for (let i = 0; i < number; i++) {
            this.ctx.drawImage(
                this.shop_patch, patch_item[0], patch_item[1],
                patch_item[2], patch_item[3],
                // 中间方块的偏移量包含了三部分：左边图标的距离 + 方块头部的长度 + 前面中间方块的长度
                canvas.scale * icon_pos[4] + canvas.scale * (spacing + patch_head[2] + patch_item[2] * i),
                (this.shop_top_tile.height - icon_pos[3]) / 2 * canvas.scale,
                patch_item[2] * canvas.scale,
                patch_item[3] * canvas.scale
            );
        }
        // 绘制数字槽的尾部
        let patch_tile = this.POS["shop_patch_tile"];
        this.ctx.drawImage(
            this.shop_patch, patch_tile[0], patch_tile[1],
            patch_tile[2], patch_tile[3],
            canvas.scale * icon_pos[4] + canvas.scale * (spacing + patch_head[2] + patch_item[2] * number),
            (this.shop_top_tile.height - icon_pos[3]) / 2 * canvas.scale,
            patch_tile[2] * canvas.scale,
            patch_tile[3] * canvas.scale
        );
    }

    // 画商店顶上的木纹
    draw_shop_top_tile(canvas) {
        let img = this.shop_top_tile;
        for (let i = 0; i < 3; i++) {
            this.ctx.drawImage(
                img, 0, 0, img.width, img.height,
                canvas.width / 3 * i, 0,
                img.width * canvas.scale, img.height * canvas.scale
            );
        }
    }
}