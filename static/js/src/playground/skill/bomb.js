export class Bomb {
    constructor(playground, player) {
        this.playground = playground;
        this.game_background = this.playground.game_background;
        this.player = player;

        // 提前定义好的基准值，乘以像素个数来控制图片的大小
        this.base_scale = this.playground.game_map.game_background.base_scale;
        // 炸弹的持有数量
        this.num = 0;

        this.load_image();
        this.add_POS();
        this.start();
    }

    start() {

    }

    load_image() {
        let outer = this;

        this.bombsprite_sheet0 = new Image();
        this.bombsprite_sheet0.src = "/static/image/playground/bombsprite-sheet0.png";
        this.bombsprite_sheet0.on_load = function () {
            outer.render_bombsprite();
        }

        this.images = [
            this.bombsprite_sheet0,
        ];
    }

    add_POS() {
        let rad = Math.PI / 180;

        this.POS = new Array();
        this.POS["bombsprite_sheet0"] = [this.bombsprite_sheet0];
    }

    render() {
        console.log("bomb render");
    }

    // 绘制玩家旁边的炸弹图标
    render_bombsprite() {
        let icon_pos = this.POS["bombsprite_sheet0"];
        let img = icon_pos[0];
        let scale = this.playground.scale;

        this.ctx.save();
        // 这里的位置是以canvas高度为单位1的，所以不用像绘制碰撞体积那样 * scale
        this.ctx.drawImage(
            img, 0, 0, img.width, img.height,
            this.player.photo_x * scale - img.width / 2 * canvas.scale,
            this.y * scale - img.height / 2 * canvas.scale,
            img.width * canvas.scale,
            img.height * canvas.scale
        );
        this.ctx.restore();
    }
}