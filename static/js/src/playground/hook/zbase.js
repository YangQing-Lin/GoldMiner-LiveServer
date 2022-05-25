// import { AcGameObject } from "../ac_game_objects/zbase";
import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";

export class Hook extends AcGameObject {
    constructor(playground, player) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;

        this.x = null;
        this.y = null;
        this.radius = 0.012;
        this.angle = Math.PI / 2;

        // 1：向左摆动，2：向右摆动，3：发射钩子，4：收回钩子
        this.direction_flag = 1;
        this.direction_tmp = 0;  // 记录发射钩子前的摆动方向
        this.direction = Math.PI / 2 * (this.timedelta / 1000);
        this.base_tile_length = 0.1;
        this.max_tile_length = 0.6;
        this.tile_length = this.base_tile_length;
        this.moved = 0;
        this.catched = false;  // 是否抓到东西
        this.money = 0;

        this.eps = 0.01;
    }

    start() {

    }

    tick() {
        if (this.direction_flag > 2) {
            return false;
        }

        this.direction_tmp = this.direction_flag;
        this.direction_flag = 3;
        this.moved = 0.008;
    }

    update() {
        this.update_tile_length();
        this.update_angle();
        this.update_position();
        this.render();
        this.update_catch();
    }

    // 检测是否抓到金矿
    update_catch() {
        for (let i = 0; i < this.playground.miners.length; i++) {
            let miner = this.playground.miners[i];
            if (this.is_collision(miner)) {
                this.catch_miner(miner);
                this.catched = true;
                this.direction_flag = 4;
                return miner;
            }
        }
    }

    add_money() {
        let miner = this.update_catch();
        if (miner) {
            this.money += miner.money;
            miner.destroy();
            console.log("money:", this.money);
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
        if (this.catched || Math.abs(this.max_tile_length - this.tile_length) < this.eps) {
            this.direction_flag = 4;
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
        this.direction = Math.PI / 2 * (this.timedelta / 1000);

        // 控制钩子转动方向和是否转动
        if (this.direction_flag === 1) {
            this.angle -= this.direction;
        } else if (this.direction_flag === 2) {
            this.angle += this.direction;
        }

        // 控制钩子转向
        if (this.angle < -Math.PI / 2) {
            this.direction_flag = 2;
        } else if (this.angle > Math.PI / 2) {
            this.direction_flag = 1;
        }

    }

    update_position() {
        this.x = this.player.x + Math.sin(this.angle) * this.tile_length;
        this.y = this.player.y + Math.cos(this.angle) * this.tile_length;
    }

    render() {
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = "white";
        this.ctx.fill();
    }
}