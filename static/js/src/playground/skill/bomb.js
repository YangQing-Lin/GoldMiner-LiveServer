export class Bomb {
    constructor(playground, player) {
        this.playground = playground;
        this.ctx = this.playground.game_map.game_background.ctx;
        this.game_background = this.playground.game_background;
        this.player = player;

        // 是否执行过start函数
        this.is_start = true;
        // 提前定义好的基准值，乘以像素个数来控制图片的大小
        this.base_scale = this.playground.base_scale;
        // 炸弹的持有数量
        this.number = 10;
        this.numbers = [];

        this.start();
    }

    start() {
        let outer = this;

        this.load_image();
        this.add_POS();

        for (let img of this.images) {
            // 炸弹图标加载问题：背景图片都加载好之后可能这里的还没加载好，
            // 如果在这之前game_background调用了炸弹图标类的render函数就不会画出东西
            // 解决方法：onload结束之后调用一次render，这样如果上次绘制失败就会重新绘制
            // 如果成功了那么game_background里调用的render也会把这里的覆盖掉，图层顺序并没有改变
            img.onload = function () {
                outer.render();
            }
        }
    }

    load_image() {
        let outer = this;

        this.bombsprite_sheet0 = new Image();
        this.bombsprite_sheet0.src = "/static/image/playground/bombsprite-sheet0.png";
        this.digital = new Image();
        this.digital.src = "/static/image/playground/topfont.png";

        this.images = [
            this.bombsprite_sheet0, this.digital,
        ];
    }

    add_POS() {
        let rad = Math.PI / 180;

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
    }

    render() {
        let scale = this.playground.scale;
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / this.base_scale,
        };

        // 先拆分一下炸弹数量（因为可能大于9）
        this.get_numbers(this.number);

        // 绘制炸弹图标（在这里面会初始化图标的x和y，所以顺序不能随便更改）
        this.render_bombs_prite(scale, canvas);
        this.render_bomb_number(canvas);
    }

    // 绘制炸弹图标旁边的数字
    render_bomb_number(canvas) {
        // 数字图标和炸弹图标之间的偏移量
        let spacing = 122;

        for (let num of this.numbers) {
            let num_pos = this.POS["digital"][num];
            this.ctx.drawImage(
                this.digital, num_pos[0], num_pos[1],
                num_pos[2], num_pos[3],
                this.x + canvas.scale * (spacing + 12),
                this.y + canvas.scale * 22,
                num_pos[2] * canvas.scale,
                num_pos[3] * canvas.scale
            );
            spacing += num_pos[2];
        }
    }

    // 绘制玩家旁边的炸弹图标
    render_bombs_prite(scale, canvas) {
        let img = this.bombsprite_sheet0;
        this.x = this.player.photo_x * scale + img.width * 0.1 * canvas.scale;
        this.y = this.player.photo_y * scale - img.height * 0.6 * canvas.scale;

        // 这里的位置是以canvas高度为单位1的，所以不用像绘制碰撞体积那样 * scale
        this.ctx.drawImage(
            img, 0, 0, img.width, img.height,
            this.x,
            this.y,
            img.width * canvas.scale,
            img.height * canvas.scale
        );
    }

    // 将数字拆分成数组
    get_numbers(number) {
        let digits = number.toString().split('');
        this.numbers = digits.map(Number)
    }
}