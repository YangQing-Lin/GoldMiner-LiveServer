import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";
import { Explode } from "/static/js/src/playground/skill/explode.js";

export class Mineral extends AcGameObject {
    constructor(playground, x, y, name, icon_pos) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.game_background.ctx;
        this.x = x;
        this.y = y;
        this.name = name;
        this.icon_pos = icon_pos;
        this.money = this.icon_pos[1];
        this.radius = this.icon_pos[3];
        this.weight = this.icon_pos[4];  // 矿物的质量，最大值：1000  会按比例控制钩子收回速度

        // 一些初始变量，后面会更具数据修改
        this.is_catched = false;
        if (this.name === "tnt") {
            this.tnt_explode_radius = this.radius * 5;  // tnt爆炸半径
        }

        // 用于决定矿物图片大小
        this.base_scale = this.playground.base_scale;

        this.eps = 0.01;
    }

    start() {

    }

    update() {

    }

    // 绘制tnt的爆炸范围和矿物的碰撞体积
    early_render() {
        let scale = this.playground.scale;
        // 绘制碰撞体积
        // this.draw_collision_volume(scale);
    }

    render() {
        let scale = this.playground.scale;
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / this.base_scale,
        };

        // 绘制图片
        this.draw_mineral_img(canvas, scale);
    }

    // 绘制矿物的碰撞体积
    draw_collision_volume(scale) {
        // 画出tnt的爆炸范围
        if (this.name === "tnt") {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.tnt_explode_radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = "blue";
            this.ctx.fill();
        }

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = "red";
        this.ctx.fill();
    }

    // 绘制矿物的图片
    draw_mineral_img(canvas, scale) {
        let img = this.icon_pos[0];
        this.ctx.save();
        // 这里的位置是以canvas高度为单位1的，所以不用像绘制碰撞体积那样 * scale
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(-this.icon_pos[2]);
        this.ctx.drawImage(
            img, 0, 0, img.width, img.height,
            this.x * scale - img.width / 2 * canvas.scale,
            this.y * scale - img.height / 2 * canvas.scale,
            img.width * canvas.scale,
            img.height * canvas.scale
        );
        this.ctx.restore();
    }

    // 当矿物tnt被抓到时删除一定范围内的其他矿物，最后删除自己，并且引爆范围内的其他tnt
    // 这个函数第一层只会在hook里调用
    explode_tnt() {
        // 绘制爆炸gif
        new Explode(this.playground, this.x, this.y);

        let tnts = [];  // 需要递归调用的tnt
        let will_destroy = [];  // 需要统一删除的矿物
        for (let miner of this.playground.miners) {
            if (miner.name === "tnt") {
                if (miner !== this && this.is_will_exploded(miner)) {
                    tnts.push(miner);
                }
                continue;
            } else if (this.is_will_exploded(miner)) {
                will_destroy.push(miner);
            }
        }

        // 统一删除会被炸到的矿物并删除自己
        for (let miner of will_destroy) {
            miner.destroy();
        }
        this.destroy();

        // 引爆范围内的其他tnt
        for (let tnt of tnts) {
            if (tnt) {
                tnt.explode_tnt();
            }
        }
    }

    // 检测传入的矿物是否会被当前tnt炸到
    is_will_exploded(miner) {
        let distance = this.get_dist(this.x, this.y, miner.x, miner.y);
        if (distance <= this.tnt_explode_radius + miner.radius) {
            return true;
        }
        return false;
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    on_destroy() {
        for (let i = 0; i < this.playground.miners.length; i++) {
            let miner = this.playground.miners[i];
            if (miner === this) {
                this.playground.miners.splice(i, 1);
                break;
            }
        }

        // 之后tnt爆炸的时候会用到，每次矿物被删除还是刷新一下背景，保险一点
        this.playground.game_map.game_background.render();
    }

}