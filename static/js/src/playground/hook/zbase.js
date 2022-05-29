import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";

export class Hook extends AcGameObject {
    constructor(playground, player, score_number) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.score_number = score_number;

        this.x = null;
        this.y = null;
        this.radius = 0.019;
        this.angle = 0;
        this.max_angle = Math.PI * 7 / 18;

        // 1：向左摆动，2：向右摆动，3：发射钩子，4：收回钩子
        this.direction_flag = 1;
        // 抓到的物品
        this.caught_item = "hook";

        this.direction_tmp = 0;  // 记录发射钩子前的摆动方向
        this.direction = Math.PI / 2 * (this.timedelta / 1000);
        this.min_tile_length = 0.1;  // 0.1对应20个propetile
        this.max_tile_length = 0.7;
        this.tile_length = this.min_tile_length;
        this.base_moved = 0.009;
        this.moved = 0;
        this.catched = false;  // 是否抓到东西
        this.catched_money = 0;
        this.money = 0;
        this.is_start = false;

        // 提前定义好的基准值，乘以像素个数来控制图片的大小
        this.base_scale = this.playground.base_scale;
        this.eps = 0.01;
    }

    start() {
        this.load_image();
        this.add_POS();

        // 给所有的图片的加载事件绑定一个变量，用于所有图片加载好后直接执行render函数
        // 因为render可能会执行很多次（改变窗口大小），所以不能把绘制图片代码放到onload里面
        for (let img of this.images) {
            img.onload = function () {
                img.is_load = true;
            }
        }
    }

    tick() {
        if (this.direction_flag > 2) {
            return false;
        }

        this.direction_tmp = this.direction_flag;
        this.direction_flag = 3;
        this.moved = this.base_moved;
    }

    update() {
        this.update_tile_length();
        this.update_angle();
        this.update_position();
        this.update_catch();
    }

    // 钩子的图片在最后绘制，这样就能显示在最上层
    late_update() {
        // 图片都加载好之后执行一次render
        if (!this.is_start && this.is_all_images_loaded()) {
            this.is_start = true;
        } else {
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

    // 检测是否抓到金矿，并返回抓到了那个金矿
    update_catch() {
        for (let i = 0; i < this.playground.miners.length; i++) {
            let miner = this.playground.miners[i];
            if (this.is_collision(miner)) {
                this.catched = true;
                return miner;
            }
        }
    }

    // 将抓到的价格加入到player的金钱 和 score_number的金钱里面
    add_money() {
        this.player.money += this.catched_money;
        this.score_number.shop_money_number += this.catched_money;
        this.score_number.render();
        console.log("add:", this.catched_money, "all:", this.score_number.shop_money_number);
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(miner) {
        let distance = this.get_dist(this.x, this.y, miner.x, miner.y);
        if (distance < this.radius + miner.radius) {
            return true;
        }
        return false;
    }

    update_tile_length() {
        if (this.direction_flag === 3) {
            this.tile_length += this.moved;
        } else if (this.direction_flag === 4) {
            this.tile_length -= this.moved;
        }

        // 抓到金矿或者钩子达到最大长度就收回
        if (this.direction_flag === 3 && (this.catched || Math.abs(this.max_tile_length - this.tile_length) < this.eps)) {
            this.direction_flag = 4;
            if (this.catched) {
                let miner = this.update_catch();
                if (miner) {
                    this.catched_money = miner.money;
                    this.caught_item = "hook_" + miner.name;
                    miner.is_catched = true;
                    if (miner.name === "tnt") {  // 如果抓到了tnt要进行一个特判
                        this.caught_item = "hook_tnt_fragment";
                        // TODO 加入TNT爆炸动画和消除一定范围内的矿物
                        miner.explode_tnt();
                    } else {
                        miner.destroy();
                    }
                    // 根据矿物的质量调整收钩速度
                    this.moved = this.base_moved * ((Math.abs(1000 - miner.weight)) / 1000);
                    // 抓到矿物之后刷新游戏背景
                    this.playground.game_map.game_background.render();
                }
            } else {
                this.moved = this.base_moved * 2;  // 钩子收回时速度更快
            }
        }

        // 收回状态并且钩子收到最短就重新开始转动
        if (this.direction_flag === 4 && Math.abs(this.tile_length - this.min_tile_length) < this.eps) {
            this.direction_flag = this.direction_tmp;
            // 如果抓回了东西就计算价值
            if (this.catched) {
                this.add_money();
                this.caught_item = "hook";
                this.catched = false;
            }
        }
    }

    update_angle() {
        if (this.timedelta / 1000 > 1 / 50) {
            return false;
        }
        // 控制钩子摆动速度
        this.direction = this.max_angle * (this.timedelta / 1000);

        // 控制钩子转动方向和是否转动
        if (this.direction_flag === 1) {
            this.angle -= this.direction;
        } else if (this.direction_flag === 2) {
            this.angle += this.direction;
        }

        // 控制钩子转向
        if (this.angle < -this.max_angle) {
            this.direction_flag = 2;
        } else if (this.angle > this.max_angle) {
            this.direction_flag = 1;
        }

    }

    update_position() {
        this.x = this.player.x + Math.sin(this.angle) * this.tile_length;
        this.y = this.player.y + Math.cos(this.angle) * this.tile_length;
    }

    load_image() {
        this.hook_sheet1 = new Image();
        this.hook_sheet1.src = "/static/image/playground/hook-sheet1.png";

        this.hook_sheet0 = new Image();
        this.hook_sheet0.src = "/static/image/playground/hook-sheet0.png";

        this.ropetile = new Image();
        this.ropetile.src = "/static/image/playground/ropetile.png";

        this.images = [
            this.hook_sheet1, this.hook_sheet0, this.ropetile,
        ];
    }

    add_POS() {
        let rad = Math.PI / 180;

        // 0~3：图片坐标和长宽
        // 4：图片旋转角度
        // 5：引用的图片
        // 6：价格
        this.POS = new Array();
        this.POS["hook"] = [
            139, 66, 53, 36,
            0 * rad,
            this.hook_sheet1,
            0
        ];
        this.POS["hook_gold_3"] = [0, 0, 133, 128, 2 * rad, this.hook_sheet1, 250];
        this.POS["hook_gold_1"] = [201, 113, 44, 50, 4 * rad, this.hook_sheet1, 30];
        this.POS["hook_skull"] = [145, 0, 58, 66, 4 * rad, this.hook_sheet1, 20];
        this.POS["hook_bone"] = [142, 112, 61, 43, 4 * rad, this.hook_sheet1, 7];
        this.POS["hook_pig"] = [200, 58, 51, 55, 4 * rad, this.hook_sheet1, 2];
        this.POS["hook_pig_diamond"] = [199, 0, 53, 57, -2 * rad, this.hook_sheet1, 502];

        this.POS["hook_gold_4"] = [0, 0, 154, 158, 4 * rad, this.hook_sheet0, 500];
        this.POS["hook_gold_2"] = [146, 168, 64, 71, 4 * rad, this.hook_sheet0, 100];
        this.POS["hook_rock_1"] = [71, 157, 71, 74, 4 * rad, this.hook_sheet0, 11];
        this.POS["hook_rock_2"] = [164, 80, 74, 87, 4 * rad, this.hook_sheet0, 20];
        this.POS["hook_diamond"] = [210, 168, 48, 57, 4 * rad, this.hook_sheet0, 500];
        this.POS["hook_bag"] = [2, 159, 69, 85, 4 * rad, this.hook_sheet0, 111];
        this.POS["hook_tnt_fragment"] = [170, 0, 79, 81, 4 * rad, this.hook_sheet0, 1];

        this.caught_item = "hook";
    }

    render() {
        let scale = this.playground.scale;
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / this.base_scale,
        };

        // 绘制钩子的碰撞体积
        // this.draw_collision_volume(scale);

        let icon_pos = this.POS[this.caught_item];
        // this.direction_flag = 3;

        // 按照长度绘制绳子
        this.draw_tile_use_tile_length(canvas, scale, icon_pos);
    }

    draw_tile_use_tile_length(canvas, scale, icon_pos) {
        let num = Math.ceil(this.tile_length / this.min_tile_length * 24.5);
        this.draw_tile(canvas, scale, this.angle + 17.76 * Math.PI / 180, num);
        // 绘制钩子（抓到东西也用这个函数）
        this.draw_hook_image(canvas, scale, icon_pos);
    }

    // 绘制钩子的碰撞体积
    draw_collision_volume(scale) {
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = "blue";
        this.ctx.fill();
    }

    draw_tile(canvas, scale, angle, num) {
        this.ctx.save();
        // 计算坐标系偏移量，让绳子居中
        this.ctx.translate(
            this.player.x * scale - (this.ropetile.width + 5) / 2 * canvas.scale,
            this.player.y * scale
        );
        this.ctx.rotate(-angle);
        for (let i = 1; i < num; i++) {
            this.ctx.drawImage(
                this.ropetile, 0, 0, this.ropetile.width, this.ropetile.height,
                -this.ropetile.height * Math.sin(20 * Math.PI / 180) * canvas.scale * i,
                this.ropetile.height / Math.cos(20 * Math.PI / 180) * canvas.scale * i,
                this.ropetile.width * canvas.scale,
                this.ropetile.height * canvas.scale
            );
            // console.log(Math.cos(angle));
        }
        this.ctx.restore();
    }

    draw_hook_image(canvas, scale, icon_pos) {
        this.ctx.save();
        this.ctx.translate(this.x * scale, this.y * scale);
        this.ctx.rotate(-this.angle - icon_pos[4]);
        this.ctx.drawImage(
            icon_pos[5], icon_pos[0], icon_pos[1], icon_pos[2], icon_pos[3],
            -icon_pos[2] / 2 * canvas.scale,
            -this.radius * scale,
            icon_pos[2] * canvas.scale,
            icon_pos[3] * canvas.scale
        );
        this.ctx.restore();
    }
}