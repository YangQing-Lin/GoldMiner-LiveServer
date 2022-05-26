// import { AcGameObject } from "../ac_game_objects/zbase";
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
        // 0：空钩子，1：半大金块，2：小金块，3：大金块
        this.caught_item = "hook";

        this.direction_tmp = 0;  // 记录发射钩子前的摆动方向
        this.direction = Math.PI / 2 * (this.timedelta / 1000);
        this.base_tile_length = 0.1;  // 0.1对应20个propetile
        this.max_tile_length = 0.6;
        this.tile_length = this.base_tile_length;
        this.moved = 0;
        this.catched = false;  // 是否抓到东西
        this.money = 0;
        this.is_start = false;

        this.eps = 0.01;

        this.timer = 0;

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

    tick() {
        if (this.direction_flag > 2) {
            return false;
        }

        this.direction_tmp = this.direction_flag;
        this.direction_flag = 3;
        this.moved = 0.009;
    }

    update() {
        this.update_tile_length();
        this.update_angle();
        this.update_position();
        this.update_catch();
    }

    // 钩子的图片在最后绘制，这样就能显示在最上层
    late_update() {
        // 图片都加载好之后执行一次resize
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

    // 检测是否抓到金矿
    update_catch() {
        for (let i = 0; i < this.playground.miners.length; i++) {
            let miner = this.playground.miners[i];
            if (this.is_collision(miner)) {
                this.catch_miner(miner);
                this.catched = true;
                return miner;
            }
        }
    }

    add_money() {
        let miner = this.update_catch();
        if (miner) {
            this.score_number.money_number += miner.money;
            this.player.money += miner.money;
            this.score_number.render();
            miner.destroy();
            console.log("money:", this.score_number.money_number);
        }
    }

    catch_miner(miner) {
        miner.x = this.x;
        miner.y = this.y;
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
                    miner.is_catched = true;
                    this.moved = this.moved * ((200 - miner.weight) / 200);
                }
            }
        }

        // 收回状态并且钩子收到最短就重新开始转动
        if (this.direction_flag === 4 && Math.abs(this.tile_length - this.base_tile_length) < this.eps) {
            this.direction_flag = this.direction_tmp;
            // 如果抓回了东西就计算价值
            if (this.catched) {
                this.add_money();
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
        this.POS = new Array();
        // 0~3：图片坐标和长宽
        // 4：图片旋转角度
        // 5：引用的图片
        // 6：价格
        this.POS["hook"] = [
            139, 66, 53, 36,
            0 * Math.PI / 180,
            this.hook_sheet1,
            0
        ];
        this.POS["hook_half_huge_gold"] = [0, 0, 133, 128, 2 * Math.PI / 180, this.hook_sheet1, 250];
        this.POS["hook_little_gold"] = [201, 113, 44, 50, 4 * Math.PI / 180, this.hook_sheet1, 30];
        this.POS["hook_skull"] = [145, 0, 58, 66, 4 * Math.PI / 180, this.hook_sheet1, 20];
        this.POS["hook_bone"] = [142, 112, 61, 43, 4 * Math.PI / 180, this.hook_sheet1, 7];
        this.POS["hook_pig"] = [200, 58, 51, 55, 4 * Math.PI / 180, this.hook_sheet1, 2];
        this.POS["hook_pig_diamond"] = [199, 0, 53, 57, -2 * Math.PI / 180, this.hook_sheet1, 502];

        this.POS["hook_huge_gold"] = [0, 0, 154, 158, 4 * Math.PI / 180, this.hook_sheet0, 500];
        this.POS["hook_medium_gold"] = [146, 168, 64, 71, 4 * Math.PI / 180, this.hook_sheet0, 100];
        this.POS["hook_rock"] = [164, 80, 74, 87, 4 * Math.PI / 180, this.hook_sheet0, 20];
        this.POS["hook_stone"] = [71, 157, 71, 74, 4 * Math.PI / 180, this.hook_sheet0, 11];
        this.POS["hook_diamond"] = [210, 168, 48, 57, 4 * Math.PI / 180, this.hook_sheet0, 500];
        this.POS["hook_bag"] = [2, 159, 69, 85, 4 * Math.PI / 180, this.hook_sheet0, 111];
        this.POS["hook_tnt_fragment"] = [170, 0, 79, 81, 4 * Math.PI / 180, this.hook_sheet0, 1];

        this.caught_item = "hook";
    }

    render() {
        let scale = this.playground.scale;
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / 920,
        };

        // 绘制碰撞体积
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = "white";
        this.ctx.fill();

        let icon_pos = this.POS[this.caught_item];
        // this.direction_flag = 3;

        this.draw_hook_image(canvas, scale, icon_pos);
        // 按照长度绘制绳子
        let num = Math.ceil(this.tile_length / 0.1 * 20);
        this.draw_tile(canvas, scale, this.angle + 18 * Math.PI / 180, num);
        this.timer += 0.2;
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