import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";

export class Mineral extends AcGameObject {
    constructor(playground, x, y, name) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.game_background.ctx;
        this.x = x;
        this.y = y;
        this.name = name;

        console.log("new Mineral:", this.name);

        this.radius = 0.03;

        this.money = 1;
        this.weight = 1;
        this.is_start = false;
        this.is_catched = false;

        this.eps = 0.01;

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
        // 图片都加载好之后执行一次render
        if (!this.is_start && this.is_all_images_loaded()) {
            this.is_start = true;
            this.render();
        }
    }

    late_update() {

    }

    is_all_images_loaded() {
        for (let img of this.images) {
            if (!img.is_load) {
                return false;
            }
        }
        return true;
    }

    render() {
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    load_image() {
        this.gold_1 = new Image();
        this.gold_1.src = "/static/image/playground/g1-sheet0.png";

        this.gold_2 = new Image();
        this.gold_2.src = "/static/image/playground/g2-sheet0.png";

        this.gold_3 = new Image();
        this.gold_3.src = "/static/image/playground/g3-sheet0.png";

        this.gold_4 = new Image();
        this.gold_4.src = "/static/image/playground/g4-sheet0.png";

        this.rock_1 = new Image();
        this.rock_1.src = "/static/image/playground/r1-sheet0.png";

        this.rock_2 = new Image();
        this.rock_2.src = "/static/image/playground/r2-sheet0.png";

        this.bone = new Image();
        this.bone.src = "/static/image/playground/bone-sheet0.png";

        this.skull = new Image();
        this.skull.src = "/static/image/playground/skull-sheet0.png";

        this.diamond = new Image();
        this.diamond.src = "/static/image/playground/diamond-sheet0.png";

        this.images = [
            this.gold_1, this.gold_2, this.gold_3, this.gold_4, this.rock_1, this.rock_2,
            this.bone, this.skull, this.diamond,
        ];
    }

    add_POS() {
        let rad = Math.PI / 180;

        this.POS = new Array();
        // 1：引用的图片
        // 2：价格
        // 3：旋转角度（一般用不到，后面如果所有矿物都同一个方向觉得单调可以加个随机值）
        // 4：碰撞体积半径
        this.POS["gold_1"] = [this.gold_1, 30, 0 * rad, 0.014];
        this.POS["gold_2"] = [this.gold_2, 100, 0 * rad, 0.029];
        this.POS["gold_3"] = [this.gold_3, 250, 0 * rad, 0.06];
        this.POS["gold_4"] = [this.gold_4, 500, 0 * rad, 0.076];
        this.POS["rock_1"] = [this.rock_1, 11, 0 * rad, 0.03];
        this.POS["rock_2"] = [this.rock_2, 20, 0 * rad, 0.033];
        this.POS["bone"] = [this.bone, 7, 0 * rad, 0.024];
        this.POS["skull"] = [this.skull, 20, 0 * rad, 0.024];
        this.POS["diamond"] = [this.diamond, 500, 0 * rad, 0.016];
    }

    render() {
        let scale = this.playground.scale;
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / 920,
        };

        let icon_pos = this.POS[this.name];
        // 绘制碰撞体积
        this.draw_collision_volume(scale, icon_pos);
        // 绘制图片
        this.draw_mineral_img(canvas, scale, icon_pos);
    }

    // 绘制矿物的碰撞体积
    draw_collision_volume(scale, icon_pos) {
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, icon_pos[3] * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = "red";
        this.ctx.fill();
    }

    // 绘制矿物的图片
    draw_mineral_img(canvas, scale, icon_pos) {
        let img = icon_pos[0];
        this.ctx.save();
        // 这里的位置是以canvas高度为单位1的，所以不用像绘制碰撞体积那样 * scale
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(-icon_pos[2]);
        this.ctx.drawImage(
            img, 0, 0, img.width, img.height,
            this.x * scale - img.width / 2 * canvas.scale,
            this.y * scale - img.height / 2 * canvas.scale,
            img.width * canvas.scale,
            img.height * canvas.scale
        );
        this.ctx.restore();
    }

    on_destroy() {
        for (let i = 0; i < this.playground.miners.length; i++) {
            let miner = this.playground.miners[i];
            if (miner === this) {
                this.playground.miners.splice(i, 1);
                break;
            }
        }
    }

}