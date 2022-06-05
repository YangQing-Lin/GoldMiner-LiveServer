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

    // 打开商店窗口
    start_new_shop() {
        console.log("function: start new shop");
        this.playground.audio_music.play();  // 进入商店后播放音乐

        // 随机售卖技能
        for (let i = 0; i < this.shop_skill_is_selling.length; i++) {
            let random = Math.random();
            this.shop_skill_is_selling[i] = random <= 0.6;  // 售卖概率60%
        }
        // 初始化售卖背景标记数组
        this.shop_skill_is_sold = [false, false, false, false, false];

        if (this.playground.character === "shop") {
            this.render();
            this.playground.game_map.score_number.render();
        }
    }

    update() {
        // 图片都加载好之后执行一次resize
        if (!this.is_start && this.is_all_images_loaded()) {
            this.is_start = true;
            if (this.playground.character === "shop") {
                this.render();
            }
        }
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
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
        this.shop_bg = new Image();
        this.shop_bg.src = "/static/image/playground/shopbg.png";
        this.shop_next = new Image();
        this.shop_next.src = "/static/image/playground/shopnext-sheet0.png";
        this.shop_item_bg = new Image();
        this.shop_item_bg.src = "/static/image/playground/shopitembg-sheet0.png";
        this.shop_skill_items = new Image();
        this.shop_skill_items.src = "/static/image/playground/shopitems-sheet0.png";
        this.shop_skill_price_background = new Image();
        this.shop_skill_price_background.src = "/static/image/playground/pricebg-sheet0.png";

        this.images = [
            this.shop_top_tile, this.shop_symbols, this.shop_patch, this.shop_bg,
            this.shop_next, this.shop_item_bg, this.shop_skill_items,
            this.shop_skill_price_background,
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
        this.POS["money"] = [0, -5, 64, 55, 540, 10];

        this.POS["shop_patch_head"] = [0, 0, 22, 60];
        this.POS["shop_patch_item"] = [22, 0, 29, 60];
        this.POS["shop_patch_tile"] = [127, 0, 25, 60];
        this.POS["shop_item_bg_sale"] = [264, 0, 248, 259];
        this.POS["shop_item_bg_sold"] = [0, 0, 264, 275];

        // 五个方块的位置相对整个canvas中心点的偏移量（直接乘长或宽）
        this.POS["shop_item_bg_x"] = [-1.7, -0.5, 0.7, -1.1, 0.1];
        this.POS["shop_item_bg_y"] = [-1, -1, -1, 0.2, 0.2];
        // 未卖出的五个技能图标在图片中的坐标
        this.POS["shop_skill_item_selling"] = [
            [0, 238, 122, 133],
            [398, 240, 98, 117],
            [124, 285, 117, 130],
            [0, 121, 151, 118],
            [293, 127, 159, 111],
        ];
        // 已经卖出的五个技能图标在图片中的坐标
        this.POS["shop_skill_item_sold"] = [
            [152, 145, 127, 137],
            [281, 238, 115, 136],
            [162, 0, 130, 145],
            [292, 0, 145, 129],
            [0, 0, 160, 120],
        ];
        // 0~4：五个售卖窗口的点击判定范围
        // 5：next按钮的判定范围
        // 分别是：左上x，左上y，右下x，右下y的坐标在整个屏幕上的位置（以整个canvas高度为单位1）
        this.POS["shop_skill_item_click_position"] = [
            [0.30, 0.28, 0.51, 0.49],
            [0.56, 0.28, 0.77, 0.49],
            [0.82, 0.28, 1.03, 0.49],
            [0.43, 0.55, 0.64, 0.76],
            [0.69, 0.55, 0.90, 0.76],

            [1.20, 0.00, 1.33, 0.12],
        ];

        // 每个技能是否有售，控制技能图标的状态，实际游戏中这个函数状态是随机的
        this.shop_skill_is_selling = [true, true, true, true, true];
        // 每个技能是否被买了，控制图标背景的状态，每次进商店都是false
        this.shop_skill_is_sold = [false, false, false, false, false];
        this.shop_skill_price = [111, 222, 333, 444, 555];

    }

    click_skill(tx, ty) {
        let icon_pos = this.POS["shop_skill_item_click_position"];
        let score_number = this.playground.game_map.score_number;
        for (let i = 0; i < icon_pos.length; i++) {
            // 判断玩家点击位置是否为某个技能的售卖窗口或者下一关
            if (
                tx >= icon_pos[i][0] && ty >= icon_pos[i][1] &&
                tx <= icon_pos[i][2] && ty <= icon_pos[i][3]
            ) {
                this.playground.audio_pop.play();
                if (i === 5) {
                    // 玩家点了下一关！
                    console.log("player click next!!!");
                    this.playground.character = "pop up";
                    this.playground.game_map.start_new_level();
                    this.clear();  // 刷新商店canvas

                    this.playground.audio_music.pause();  // 商店音乐声暂停
                    this.playground.audio_start.play();  // 播放游戏开始声音
                } else if (this.shop_skill_is_selling[i]) {  // 购买技能需要判定技能是否在售
                    // 玩家买了一个技能！
                    let is_buy_success = score_number.player_buy_skill(i);
                    if (is_buy_success) {
                        console.log("player buy skill:", i);
                        this.shop_skill_is_selling[i] = false;
                        this.shop_skill_is_sold[i] = true;
                        this.render();  // 刷新商店canvas
                    } else {
                        console.log("player buy skill false:", i);
                    }
                }
                break;
            }
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    render() {
        this.resize();
        // 先清空屏幕
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // 如果当前不显示商店界面就清空canvas之后直接退出函数
        // 这样每次调用this.render()就不需要判断显示的是哪个界面了
        if (this.playground.character !== "shop") {
            return false;
        }

        let scale = this.playground.scale;
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / this.base_scale,
        };

        this.draw_shop_background(canvas);
        this.draw_shop_top_tile(canvas);
        this.draw_shop_symbols_and_number_slot(canvas, this.POS["star"]);
        this.draw_shop_symbols_and_number_slot(canvas, this.POS["bomb"]);
        this.draw_shop_symbols_and_number_slot(canvas, this.POS["money"]);
        this.draw_shop_next(canvas);
        this.draw_shop_skill_sale_icon(canvas);

        // 重绘数字
        this.playground.game_map.score_number.render();
    }

    // 绘制技能售卖区的售卖状态
    draw_shop_skill_sale_icon(canvas) {
        // 绘制正在售卖的技能图标背景板
        for (let i = 0; i < 5; i++) {
            if (this.shop_skill_is_sold[i]) {  // 绘制技能已经售出的背景板
                this.draw_shop_skill_sale_item_background(
                    canvas,
                    this.POS["shop_item_bg_sold"],
                    this.POS["shop_item_bg_x"][i],
                    this.POS["shop_item_bg_y"][i]
                );
            } else {  // 绘制技能未被售出的背景板
                this.draw_shop_skill_sale_item_background(
                    canvas,
                    this.POS["shop_item_bg_sale"],
                    this.POS["shop_item_bg_x"][i],
                    this.POS["shop_item_bg_y"][i]
                );

                // 如果当前技能在售的话就绘制技能价格背景板
                if (this.shop_skill_is_selling[i]) {
                    this.draw_shop_skill_price_background(
                        canvas,
                        this.POS["shop_item_bg_sale"],
                        this.POS["shop_item_bg_x"][i],
                        this.POS["shop_item_bg_y"][i]
                    );
                }
            }
        }

        for (let i = 0; i < 5; i++) {
            if (this.shop_skill_is_selling[i]) {  // 绘制允许购买的技能图标
                this.draw_shop_skill_sale_item(canvas, i);
            } else {  // 绘制不允许购买（或已经购买）的技能图标
                this.draw_shop_skill_sold_item(canvas, i);
            }
        }
    }

    // 绘制正在售卖的技能的价格背景板
    draw_shop_skill_price_background(canvas, icon_pos, shop_item_bg_x, shop_item_bg_y) {
        let img = this.shop_skill_price_background;
        this.ctx.drawImage(
            img, 0, 0, img.width, img.height,
            canvas.width / 2 + canvas.scale * (icon_pos[2] * shop_item_bg_x + (icon_pos[2] - img.width) / 2),
            canvas.height / 2 + canvas.scale * (icon_pos[3] * shop_item_bg_y + (icon_pos[3] - img.height)),
            canvas.scale * img.width,
            canvas.scale * img.height
        );
    }

    // 绘制正在售卖的技能图标
    draw_shop_skill_sale_item(canvas, i) {
        let img = this.shop_skill_items;
        let icon_pos = this.POS["shop_item_bg_sale"];
        let shop_item_bg_x = this.POS["shop_item_bg_x"][i];
        let shop_item_bg_y = this.POS["shop_item_bg_y"][i];
        let skill_icon_pose = this.POS["shop_skill_item_selling"][i];

        // 因为价格背景的存在，绘制图标时要上移一部分，大概加个背景的三分之一比较合适
        this.ctx.drawImage(
            img, skill_icon_pose[0], skill_icon_pose[1], skill_icon_pose[2], skill_icon_pose[3],
            canvas.width / 2 + canvas.scale * (icon_pos[2] * shop_item_bg_x + (icon_pos[2] - skill_icon_pose[2]) / 2),
            canvas.height / 2 + canvas.scale * (icon_pos[3] * shop_item_bg_y + (icon_pos[3] - skill_icon_pose[3]) / 2 - this.shop_skill_price_background.height / 3),
            canvas.scale * skill_icon_pose[2],
            canvas.scale * skill_icon_pose[3]
        );
    }

    // 绘制已经卖出的技能图标
    draw_shop_skill_sold_item(canvas, i) {
        let img = this.shop_skill_items;
        let icon_pos = this.POS["shop_item_bg_sold"];
        let shop_item_bg_x = this.POS["shop_item_bg_x"][i];
        let shop_item_bg_y = this.POS["shop_item_bg_y"][i];
        let skill_icon_pose = this.POS["shop_skill_item_sold"][i];

        this.ctx.drawImage(
            img, skill_icon_pose[0], skill_icon_pose[1], skill_icon_pose[2], skill_icon_pose[3],
            canvas.width / 2 + canvas.scale * (icon_pos[2] * shop_item_bg_x + (icon_pos[2] - skill_icon_pose[2]) / 2),
            canvas.height / 2 + canvas.scale * (icon_pos[3] * shop_item_bg_y + (icon_pos[3] - skill_icon_pose[3]) / 2),
            canvas.scale * skill_icon_pose[2],
            canvas.scale * skill_icon_pose[3]
        );
    }

    // 绘制技能售卖处图标背景
    draw_shop_skill_sale_item_background(canvas, icon_pos, shop_item_bg_x, shop_item_bg_y) {
        let img = this.shop_item_bg;
        this.ctx.drawImage(
            img, icon_pos[0], icon_pos[1], icon_pos[2], icon_pos[3],
            canvas.width / 2 + canvas.scale * icon_pos[2] * shop_item_bg_x,
            canvas.height / 2 + canvas.scale * icon_pos[3] * shop_item_bg_y,
            canvas.scale * icon_pos[2],
            canvas.scale * icon_pos[3]
        );
    }

    // 绘制下一关图标
    draw_shop_next(canvas) {
        let img = this.shop_next;
        this.ctx.drawImage(
            img, 0, 0, img.width, img.height,
            canvas.width - canvas.scale * img.width,
            canvas.scale * 0,
            canvas.scale * img.width,
            canvas.scale * img.height
        );
    }

    // 绘制商店背景
    draw_shop_background(canvas) {
        let img = this.shop_bg;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.ctx.drawImage(
                    img, 0, 0, img.width, img.height,
                    canvas.scale * (img.width * j),
                    canvas.scale * (img.height * i),
                    canvas.scale * img.width,
                    canvas.scale * img.height
                );
            }
        }
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