import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";

export class ScoreNumber extends AcGameObject {
    constructor(playground, ctx, root_name) {
        super();
        this.playground = playground;
        this.ctx = ctx;
        this.root_name = root_name;
        this.is_start = false;
        this.time = 0;
        this.images = [];

        // 观察了4399游戏每局目标分数的规律，发现分数每局增加量是个等差数列，每次加270
        this.increment_target_number = 275;
        this.target_number = 375;
        this.level_number = 0;
        this.time_left = 60;

        this.shop_bomb_number = 456;

        this.numbers = [];

        this.add_POS();
        this.load_image();
    }

    start() {
        this.resize();
        this.get_player_money_number();

        // 给所有的图片的加载事件绑定一个变量，用于所有图片加载好后直接执行render函数
        // 因为render可能会执行很多次（改变窗口大小），所以不能把绘制图片代码放到onload里面
        for (let img of this.images) {
            img.onload = function () {
                img.is_load = true;
            }
        }
    }

    // 开始新的一局时会在game_map.start_new_level()函数里面触发
    start_new_level() {
        console.log("update level target number", this.root_name);
        this.level_number += 1;
        this.update_target_number();
        this.render();
    }

    // 更新目标分数
    update_target_number() {
        this.target_number += this.increment_target_number;
        // 超过10关后每关目标分增长量固定，2705
        if (this.level_number < 10) {
            this.increment_target_number += 270;
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

        // 0, 1: 数字横坐标和纵坐标的偏移量
        // 2: 数字图片的缩放比例
        this.POS["money"] = [100, 30, 1];
        this.POS["target"] = [100, 110, 1];
        this.POS["level"] = [840, 30, 1];
        this.POS["timer"] = [840, 110, 1];

        this.POS["shop_money"] = [650, 30, 0.6];
        this.POS["shop_bomb"] = [365, 30, 0.6];
        this.POS["shop_level"] = [100, 30, 0.6];
        this.POS["shop_skill_price"] = [
            [515, 610, 0.6],
            [870, 610, 0.6],
            [1230, 610, 0.6],
            [690, 983, 0.6],
            [1045, 983, 0.6],
        ];

        this.POS["pop_up_money"] = [710, 395, 0.6];
        this.POS["pop_up_target"] = [710, 497, 0.6];
    }

    load_image() {
        this.topfont = new Image();
        this.topfont.src = "/static/image/playground/topfont.png";
        this.gamefontgreen = new Image();
        this.gamefontgreen.src = "/static/image/playground/gamefontgreen.png";

        this.images = [
            this.topfont, this.gamefontgreen,
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
        this.render();
    }

    // 玩家买了一个技能之后会触发的函数
    // 用于重新计算剩余金钱
    player_buy_skill(skill_number) {
        let shop = this.playground.game_map.shop;
        let skill_price = shop.shop_skill_price;  // 技能价格
        // 金钱不能是负数
        if (this.shop_money_number < skill_price[skill_number]) {
            return false;
        }
        if (skill_number === 0) {
            console.log("player buy a bomb!");
            this.shop_bomb_number += 1;
            this.set_player_bomb_number();
        }
        this.shop_money_number -= skill_price[skill_number];
        this.set_player_money_number();
        console.log(this.shop_money_number, this.playground.players[0].money);
        this.render();
        return true;
    }

    // 更新玩家持有的雷数
    set_player_bomb_number() {
        this.playground.players[0].bomb.number = this.shop_bomb_number;
    }

    // 获得玩家持有的雷数
    get_player_bomb_number() {
        if (!this.playground.players) {
            this.shop_bomb_number = 0;
        } else {
            this.shop_bomb_number = this.playground.players[0].bomb.number;
        }
    }

    // 更新玩家的金钱数
    set_player_money_number() {
        this.playground.players[0].money = this.shop_money_number;
    }

    // 获得玩家的金钱数
    get_player_money_number() {
        if (!this.playground.players) {
            this.shop_money_number = 0;
        } else {
            this.shop_money_number = this.playground.players[0].money;
        }
    }

    render() {
        this.get_player_money_number();
        this.get_player_bomb_number();
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / 820,
        };

        console.log(this.root_name, this.playground.character);
        if (this.root_name === "pop up") {
            if (this.playground.character === "pop up") {
                // 绘制数字前需要重新绘制一下背景板，不这样背景板就显示不出来，不清楚bug在哪
                this.playground.game_map.pop_up.render();
                this.render_pop_up_score_number(canvas);
            }
        } else {
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (this.playground.character === "shop") {
                this.render_shop_score_number(canvas);
            } else {
                // 除了商店界面之外，都要绘制游戏的数字（调整窗口大小数字就不会消失了）
                this.render_game_score_number(canvas);
            }
        }
    }

    // 绘制弹窗界面的数字
    render_pop_up_score_number(canvas) {
        this.get_numbers(this.shop_money_number);
        this.draw_numbers(canvas, this.POS["pop_up_money"], 0);
        this.get_numbers(this.target_number);
        this.draw_numbers(canvas, this.POS["pop_up_target"], 0);
    }

    // 绘制商店界面的数字
    render_shop_score_number(canvas) {
        this.get_numbers(this.shop_money_number);
        this.draw_numbers(canvas, this.POS["shop_money"], 10);
        this.get_numbers(this.shop_bomb_number);
        this.draw_numbers(canvas, this.POS["shop_bomb"], 10);
        this.get_numbers(this.level_number);
        this.draw_numbers(canvas, this.POS["shop_level"], 10);

        this.render_shop_skill_price(canvas);
    }

    render_shop_skill_price(canvas) {
        let shop = this.playground.game_map.shop;
        let skill_is_selling = shop.shop_skill_is_selling;  // 技能是否在售
        let skill_price = shop.shop_skill_price;  // 技能价格
        // 绘制技能价格
        for (let i = 0; i < 5; i++) {
            if (skill_is_selling[i]) {
                this.get_numbers(skill_price[i]);
                this.draw_numbers(canvas, this.POS["shop_skill_price"][i], 0);
            }
        }
    }

    // 绘制游戏界面中的数字
    render_game_score_number(canvas) {
        this.get_numbers(this.shop_money_number);
        this.draw_numbers(canvas, this.POS["money"], 10);
        this.get_numbers(this.target_number);
        this.draw_numbers(canvas, this.POS["target"], 10);
        this.get_numbers(this.level_number);
        this.draw_numbers(canvas, this.POS["level"], 10);
        this.get_numbers(this.time_left);
        this.draw_numbers(canvas, this.POS["timer"], 10);
    }

    // 按照传入的位置绘制数字
    draw_numbers(canvas, icon_pos, spacing) {
        let img = this.topfont;
        // 得分达标时要把分数绘制成绿色
        if (icon_pos === this.POS["money"] && this.shop_money_number >= this.target_number) {
            img = this.gamefontgreen;
        }
        // 数字槽和图标的距离
        for (let num of this.numbers) {
            let num_pos = this.POS["digital"][num];
            this.ctx.drawImage(
                img, num_pos[0], num_pos[1],
                num_pos[2], num_pos[3],
                canvas.scale * icon_pos[2] * (icon_pos[0] + spacing + 12),
                canvas.scale * icon_pos[2] * (icon_pos[1] + 3),
                canvas.scale * icon_pos[2] * num_pos[2],
                canvas.scale * icon_pos[2] * num_pos[3]
            );
            spacing += num_pos[2];
        }
    }

    // 将数字拆分成数组
    get_numbers(number) {
        let digits = number.toString().split('');
        this.numbers = digits.map(Number)
    }
}