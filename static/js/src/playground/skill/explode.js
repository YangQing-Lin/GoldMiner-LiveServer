import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";

export class Explode extends AcGameObject {
    constructor(playground, hook_x, hook_y, explode_name) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.hook_x = hook_x;
        this.hook_y = hook_y;
        this.explode_name = explode_name;  // "bomb"：炸弹爆炸图标 "tnt"：tnt爆炸图标

        // 提前定义好的基准值，乘以像素个数来控制图片的大小
        this.base_scale = this.playground.game_map.game_background.base_scale;
        this.interval_time = 100;  // 两帧之间的时间间隔（ms）
        this.times = 0;  // 开始计算开始播放图片的总时间
        this.is_start = false;
        this.is_set_position = false;  // 位置只要计算一次
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

    render() {
        this.times += this.timedelta;

        if (this.explode_name === "bomb") {
            this.render_bomb_explode();
        }
    }

    // 绘制炸弹爆炸图像
    render_bomb_explode() {
        let frame_number = 4;  // 炸弹爆炸gif的帧数
        let frame_cnt = Math.floor(this.times / this.interval_time + 1);  // 计算现在播放到第几帧（第一帧this.times = 0）
        if (frame_cnt > frame_number) {  // 超过了最大帧数动画就播放完了，直接删除对象
            this.destroy();
            return false;
        }
        let img_pos_name = "bomb_explode_" + String(frame_cnt);  // 按照当前帧数获取相应的图片位置
        let img = this.bomb_explode;
        let img_pos = this.POS[img_pos_name];

        let scale = this.playground.scale;
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / this.base_scale,
        };
        if (!this.is_set_position) {
            this.x = this.hook_x * scale - img_pos[2] * 0.5 * canvas.scale;
            this.y = this.hook_y * scale - img_pos[3] * 0.5 * canvas.scale;
            this.is_set_position = true;
        }

        // 这里的位置是以canvas高度为单位1的，所以不用像绘制碰撞体积那样 * scale
        this.ctx.drawImage(
            img, img_pos[0], img_pos[1], img_pos[2], img_pos[3],
            this.x, this.y,
            img_pos[2] * canvas.scale,
            img_pos[3] * canvas.scale
        );
    }

    // 爆炸的图片在最后绘制，这样就能显示在最上层
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

    load_image() {
        this.bomb_explode = new Image();
        this.bomb_explode.src = "/static/image/playground/expoanimation-sheet0.png";

        this.images = [
            this.bomb_explode,
        ];
    }

    add_POS() {
        let rad = Math.PI / 180;

        this.POS = new Array();
        this.POS["bomb_explode_1"] = [264, 240, 209, 190];
        this.POS["bomb_explode_2"] = [0, 0, 271, 265];
        this.POS["bomb_explode_3"] = [269, 0, 243, 240];
        this.POS["bomb_explode_4"] = [0, 265, 246, 246];
    }
}

