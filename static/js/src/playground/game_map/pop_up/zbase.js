import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";
import { ScoreNumber } from "/static/js/src/playground/game_map/score_number/zbase.js";

export class PopUp extends AcGameObject {
    constructor(playground, pop_up_ctx) {
        super();
        this.playground = playground;
        this.ctx = pop_up_ctx;
        this.score_number = new ScoreNumber(this.playground, this.ctx, "pop up");
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

    start_new_pop_up(next_window) {
        this.next_window = next_window;
        let shop_skill_is_sold = this.playground.game_map.shop.shop_skill_is_sold;
        this.skill_is_sold = [false, false, false, false];
        // 这里现实的顺序和商店的不同，数量也不一样，所以要做一个坐标变换
        this.skill_is_sold[0] = shop_skill_is_sold[4];
        this.skill_is_sold[1] = shop_skill_is_sold[1];
        this.skill_is_sold[2] = shop_skill_is_sold[3];
        this.skill_is_sold[3] = shop_skill_is_sold[2];
        this.render();
        // 不能把score_number.render加到this.render里面
        // 因为score_number.render里面有pop_up.render，会死循环
        this.score_number.render();
        console.log("in start new pop up", this.score_number.shop_money_number);
    }

    add_POS() {
        this.POS = new Array();
        // 未卖出的五个技能图标在图片中的坐标
        // 4：缩放比例
        this.POS["skill_item_selling"] = [
            [293, 127, 159, 111, 0.5],
            [398, 240, 98, 117, 0.5],
            [0, 121, 151, 118, 0.5],
            [124, 285, 117, 130, 0.5],
        ];
        // 已经卖出的五个技能图标在图片中的坐标
        // 4：缩放比例
        this.POS["skill_item_sold"] = [
            [0, 0, 160, 120, 0.5],
            [281, 238, 115, 136, 0.5],
            [292, 0, 145, 129, 0.5],
            [162, 0, 130, 145, 0.5],
        ];
        this.POS["skill_item_position"] = [
            [370, 95],
            [470, 95],
            [370, 180],
            [470, 180],
        ];
        // 0：开始按钮的位置
        // 分别是：左上x，左上y，右下x，右下y的坐标在整个屏幕上的位置（以整个canvas高度为单位1）
        this.POS["pop_up_button_click_position"] = [
            [0.53, 0.51, 0.80, 0.58],
        ];
    }

    load_image() {
        this.pop_up_background = new Image();
        this.pop_up_background.src = "/static/image/playground/popup-sheet0.png";
        this.shop_skill_items = new Image();
        this.shop_skill_items.src = "/static/image/playground/shopitems-sheet0.png";
        this.button_background = new Image();
        this.button_background.src = "/static/image/playground/button-sheet0.png";
        this.button_icon = new Image();
        this.button_icon.src = "/static/image/playground/popupbuttons-sheet1.png";

        this.images = [
            this.pop_up_background, this.shop_skill_items, this.button_background,
            this.button_icon,
        ];
    }

    // 玩家在弹窗界面点击的逻辑
    click_button(tx, ty) {
        let icon_pos = this.POS["pop_up_button_click_position"];
        for (let i = 0; i < icon_pos.length; i++) {
            // 判断玩家点击位置是否为某个技能的售卖窗口或者下一关
            if (
                tx >= icon_pos[i][0] && ty >= icon_pos[i][1] &&
                tx <= icon_pos[i][2] && ty <= icon_pos[i][3]
            ) {
                this.playground.audio_pop.play();
                if (i === 0) {
                    // 玩家点击按钮
                    console.log("player click start game!!!", this.next_window);
                    if (this.next_window === "shop") {
                        this.playground.character = "shop";
                        this.playground.game_map.shop.start_new_shop();
                        // 在进入商店的时候更新地图矿物，因为到游戏界面前的弹窗界面是半透明的
                        // 如果在游戏界面开始时更新矿物就会很明显看到矿物重新生成了
                        this.playground.game_map.game_background.start_new_level();
                    } else if (this.next_window === "game") {
                        this.playground.character = "game";
                        // 在游戏刚开始和一局刚结束时已经执行过game_map.start_new_level了
                        // 所以这里不需要重复执行，否则关卡数会多算
                        // this.playground.game_map.start_new_level();
                    }
                    this.clear();
                }
                break;
            }
        }
    }

    update() {
        // 图片都加载好之后执行一次resize
        if (!this.is_start && this.is_all_images_loaded()) {
            this.is_start = true;
            this.render();
            // 不能把score_number.render加到this.render里面
            // 因为score_number.render里面有pop_up.render，会死循环
            this.score_number.render();
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

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    render() {
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / this.base_scale,
        };

        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        this.ctx.save();
        this.ctx.translate(
            canvas.width / 2 - canvas.scale * (img.width / 2),
            canvas.height / 2 - canvas.scale * (img.height)
        );
        this.ctx.drawImage(
            img, 0, 0, img.width, img.height,
            0, 0,
            canvas.scale * img.width,
            canvas.scale * img.height
        );

        // 绘制技能图标，并回归canvas坐标位置
        // 以背景板所上角为(0, 0)点是为了更简单地计算坐标
        this.render_pop_up_skill_item(canvas);
        // 绘制开始游戏的按钮
        this.render_pop_up_button(canvas);
        this.ctx.restore();
    }

    render_pop_up_button(canvas) {
        let img = this.button_background;
        let img_icon = this.button_icon;
        let bg_img = this.pop_up_background;
        this.ctx.drawImage(
            img, 0, 0, img.width, img.height,
            canvas.scale * (bg_img.width - img.width) / 2,
            canvas.scale * bg_img.height,
            canvas.scale * img.width,
            canvas.scale * img.height
        );

        // 绘制按钮上面的方向键
        this.ctx.drawImage(
            img_icon, 0, 0, img_icon.width, img_icon.height,
            canvas.scale * (bg_img.width - img_icon.width) / 2,
            canvas.scale * (bg_img.height + 8),
            canvas.scale * img_icon.width,
            canvas.scale * img_icon.height
        );
    }

    // 绘制弹窗背景板旁边的技能图标
    render_pop_up_skill_item(canvas) {
        let img = this.shop_skill_items;
        for (let i = 0; i < 4; i++) {
            // 技能图标在素材图片中的位置信息
            let icon_img_info = this.POS["skill_item_sold"][i];
            if (this.skill_is_sold[i]) {
                icon_img_info = this.POS["skill_item_selling"][i];
            }
            // 技能图标绘制的坐标（自己调出来的）
            let icon_pos = this.POS["skill_item_position"][i];
            this.ctx.drawImage(
                img, icon_img_info[0], icon_img_info[1], icon_img_info[2], icon_img_info[3],
                canvas.scale * icon_pos[0],
                canvas.scale * icon_pos[1],
                canvas.scale * icon_img_info[2] * icon_img_info[4],
                canvas.scale * icon_img_info[3] * icon_img_info[4]
            );
        }
    }
}