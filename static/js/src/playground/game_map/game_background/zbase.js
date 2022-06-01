import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";
import { Mineral } from "/static/js/src/playground/mineral/zbase.js";

export class GameBackground extends AcGameObject {
    constructor(playground, game_background_ctx) {
        super();
        this.playground = playground;
        this.ctx = game_background_ctx;
        this.is_start = false;
        this.time = 0;

        this.eps = 0.01;
        this.base_scale = this.playground.base_scale;  // 和矿物像素绑定的基准，用于放大和缩小矿物

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

        this.start_new_level();
    }

    start_new_level() {
        // 生成矿物
        this.test_draw_minerable();
        this.render();
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.render();
    }

    // 随机绘制10个矿物
    test_draw_minerable() {
        // 先清空游戏地图上的所有矿物
        while (this.playground.miners && this.playground.miners.length > 0) {
            this.playground.miners[0].destroy();
        }
        // 输出一下表示调用了这个函数
        console.log("###############in test draw minerable");

        if (!this.playground.players || this.playground.players.length === 0) {
            return false;
        }

        // 获得玩家、可生成的最大长度、可生成的最小长度、可生成的最大角度
        let player = this.playground.players[0];
        let max_length = player.hook.max_tile_length * 0.8;
        let min_length = player.hook.min_tile_length * 2;
        let max_angle = player.hook.max_angle * 0.9;

        let random_times = 0;  // 随机循环执行了多少次
        let mineral_name = "gold_1";  // 选择的矿物名称（之后会随机一个）

        for (let i = 0; i < 10; i++) {
            // 初始化变量
            let random_length = 0,
                random_angle = 0,
                random_x = 0,
                random_y = 0;

            // 循环判断随机生成的是否合法，角度也要重新生成，因为可能一排都占满了
            // 第一次循环一定不会成功
            while (!this.is_create_collision(random_x, random_y, random_length, min_length, mineral_name)) {
                // 随机选择一个矿物
                mineral_name = this.MINERS_NAME[Math.floor(Math.random() * this.MINERS_NAME.length)];
                random_length = Math.random() * max_length;
                // 用长度和角度计算随机的位置，方便判断是否和已经生成的矿物位置重合
                random_angle = Math.random() * max_angle * 2 - max_angle;
                random_x = player.x + Math.sin(random_angle) * random_length;
                random_y = player.y + Math.cos(random_angle) * random_length;

                random_times += 1;
                if (random_times >= 10000) {
                    console.log("ERROR: too many random!!!");
                    break;
                }
            }

            // 生成随机定点的矿物
            this.playground.miners.push(new Mineral(this.playground, random_x, random_y, mineral_name, this.MINERS[mineral_name]));
        }

        console.log("random times:", random_times);
    }

    // 传入：随机位置、随机角度、确定的最小长度、随机的矿物名称
    // 返回：随机的矿物是否合法
    is_create_collision(random_x, random_y, random_length, min_length, mineral_name) {
        // 初始值直接不合法（这样之前的while循环可以少写点代码，更加干净）
        if (!random_x || !random_y || random_x === 0 || random_y === 0) {
            return false;
        }

        // 随机的距离太短了，不合法
        if (random_length <= min_length) {
            return false;
        }

        // 遍历所有已经生成的矿物，如果重合了就不合法
        let random_mineral_radius = this.MINERS[mineral_name][3];
        for (let mineral of this.playground.miners) {
            if (this.get_dist(mineral.x, mineral.y, random_x, random_y) - (mineral.radius + random_mineral_radius) <= this.eps) {
                return false;
            }
        }

        return true;
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update() {
        // 图片都加载好之后执行一次render
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

    load_image() {
        // 各种背景板的图片
        this.groundtile = new Image();
        this.groundtile.src = "/static/image/playground/groundtile.png";
        this.purpletile = new Image();
        this.purpletile.src = "/static/image/playground/purpletile.png";
        this.bgtile3 = new Image();
        this.bgtile3.src = "/static/image/playground/bgtile3.png";
        this.bgtile2 = new Image();
        this.bgtile2.src = "/static/image/playground/bgtile2.png";
        this.bgtile1 = new Image();
        this.bgtile1.src = "/static/image/playground/bgtile1.png";
        this.bgtile4 = new Image();
        this.bgtile4.src = "/static/image/playground/bgtile4.png";
        this.gametopbg = new Image();
        this.gametopbg.src = "/static/image/playground/gametopbg.png";
        this.uisymbols_sheet0 = new Image();
        this.uisymbols_sheet0.src = "/static/image/playground/uisymbols-sheet0.png";
        this.gamepatch = new Image();
        this.gamepatch.src = "/static/image/playground/gamepatch.png";
        this.miner_roll_sheet0 = new Image();
        this.miner_roll_sheet0.src = "/static/image/playground/miner_miner_roll-sheet0.png";

        // 单独矿物的图片
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
        this.tnt = new Image();
        this.tnt.src = "/static/image/playground/tnt-sheet0.png";
        this.bag = new Image();
        this.bag.src = "/static/image/playground/bag-sheet0.png";

        this.images = [
            this.groundtile, this.purpletile, this.bgtile1, this.bgtile2,
            this.bgtile3, this.bgtile4, this.gametopbg, this.uisymbols_sheet0,
            this.gamepatch, this.miner_roll_sheet0,

            this.gold_1, this.gold_2, this.gold_3, this.gold_4, this.rock_1, this.rock_2,
            this.bone, this.skull, this.diamond, this.tnt, this.bag,
        ];
    }

    add_POS() {
        let rad = Math.PI / 180;

        // 背景板的位置信息
        this.POS = new Array();
        this.POS["money"] = [0, 0, 64, 48, 100, 30, 5];
        this.POS["target"] = [65, 0, 50, 50, 100, 110, 5];
        this.POS["level"] = [0, 49, 51, 51, 800, 30, 3];
        this.POS["timer"] = [52, 50, 46, 55, 800, 110, 3];
        this.POS["gamepatch_head"] = [0, 0, 14, 64];
        this.POS["gamepatch_item"] = [15, 0, 39, 64];
        this.POS["gamepatch_tile"] = [56, 0, 14, 64];


        // 这里有个很奇怪的现象，如果把下面的"this.base_scale * 920"全部换成"miner_volume_scale"的话就会大大增加随机生成矿物时重合的概率，改回来就又正常了，搞不懂是为什么，难道"this.base_scale"会在使用一次之后改变买嘛？
        let miner_volume_scale = this.base_scale * 920;
        this.MINERS = new Array();
        // 0：引用的图片
        // 1：价格
        // 2：旋转角度（一般用不到，后面如果所有矿物都同一个方向觉得单调可以加个随机值）
        // 3：碰撞体积半径
        // 4：矿物质量
        this.MINERS["gold_1"] = [this.gold_1, 30, 0 * rad, 0.014 / this.base_scale * 920, 500];
        this.MINERS["gold_2"] = [this.gold_2, 100, 0 * rad, 0.029 / this.base_scale * 920, 750];
        this.MINERS["gold_3"] = [this.gold_3, 250, 0 * rad, 0.06 / this.base_scale * 920, 800];
        this.MINERS["gold_4"] = [this.gold_4, 500, 0 * rad, 0.076 / this.base_scale * 920, 900];
        this.MINERS["rock_1"] = [this.rock_1, 11, 0 * rad, 0.03 / this.base_scale * 920, 800];
        this.MINERS["rock_2"] = [this.rock_2, 20, 0 * rad, 0.033 / this.base_scale * 920, 940];
        this.MINERS["bone"] = [this.bone, 7, 0 * rad, 0.024 / this.base_scale * 920, 300];
        this.MINERS["skull"] = [this.skull, 20, 0 * rad, 0.024 / this.base_scale * 920, 400];
        this.MINERS["diamond"] = [this.diamond, 500, 0 * rad, 0.016 / this.base_scale * 920, 500];
        this.MINERS["tnt"] = [this.tnt, 1, 0 * rad, 0.04 / this.base_scale * 920, 1];
        this.MINERS["bag"] = [this.bag, 114, 0 * rad, 0.032 / this.base_scale * 920, 300]

        this.MINERS_NAME = new Array();
        for (let miner in this.MINERS) {
            this.MINERS_NAME.push(miner);
        }
    }

    render() {
        // 先清空屏幕
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // 这里的scale不能用this.base_scale，820是调出来的最合适的值
        // this.base_scale只用来更改矿物的碰撞半径
        let canvas = {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            scale: this.ctx.canvas.height / 820,
        };

        this.draw_sky_ground(canvas);
        this.draw_dirt_color(canvas);  // 画泥土背景颜色
        this.draw_bg_tile(canvas);  // 画泥土分层
        this.draw_ground_tile(canvas);  // 画地面

        this.draw_miner_roll(canvas, this.miner_roll_sheet0);  // 画卷线器

        this.draw_scoreboard_background(canvas);  // 绘制金钱数量背景
        this.draw_all_minerals();

        // 绘制所有和玩家有关的技能图标（必须在背景图片绘制好之后绘制）
        this.render_player_skill();

    }

    // 绘制所有和玩家有关的技能图标（必须在背景图片绘制好之后绘制）
    render_player_skill() {
        this.render_player_skill_bomb();
    }

    // 执行绘制玩家旁边的炸弹图标
    render_player_skill_bomb() {
        if (this.playground.players) {
            for (let player of this.playground.players) {
                if (player.bomb) {
                    player.bomb.render();
                }
            }
        }
    }

    // 绘制所有矿物
    draw_all_minerals() {
        if (this.playground.miners) {
            // 在所有矿物绘制之前绘制的东西
            // 主要为了绘制tnt的爆炸范围，还有矿物的碰撞体积
            for (let miner of this.playground.miners) {
                miner.early_render();
            }
            // 绘制矿物的图片
            for (let miner of this.playground.miners) {
                miner.render();
            }
        }
    }

    draw_scoreboard_background(canvas) {
        // 绘制金钱数量背景
        this.draw_scoreboard_background_item(canvas, this.POS["money"]);
        this.draw_scoreboard_background_item(canvas, this.POS["target"]);
        this.draw_scoreboard_background_item(canvas, this.POS["level"]);
        this.draw_scoreboard_background_item(canvas, this.POS["timer"]);
    }

    // 画卷线器
    draw_miner_roll(canvas, img) {
        let scale = this.playground.scale;
        if (this.playground.players && this.playground.players.length > 0) {
            for (let player of this.playground.players) {
                player.render();  // 绘制用户头像
                this.ctx.drawImage(
                    img, 0, 0, img.width, img.height,
                    player.x * scale - img.width / 2 * canvas.scale,
                    player.y * scale - img.height / 2 * canvas.scale,
                    img.width * canvas.scale, img.height * canvas.scale
                );
            }
        }

    }

    // 按照传入的位置参数绘制图标和数字槽
    draw_scoreboard_background_item(canvas, icon_pos) {
        this.ctx.drawImage(
            this.uisymbols_sheet0, icon_pos[0], icon_pos[1], icon_pos[2], icon_pos[3],
            canvas.scale * (icon_pos[4] - icon_pos[2]), canvas.scale * icon_pos[5],
            icon_pos[2] * canvas.scale, icon_pos[3] * canvas.scale
        );
        // 绘制图标后面的数字槽
        this.draw_scoreboard_background_number_slot(canvas, icon_pos[6], icon_pos);
    }

    // 绘制存放数字的槽
    draw_scoreboard_background_number_slot(canvas, number, icon_pos) {
        // 数字槽和图标的距离
        let spacing = 10;

        // 绘制数字槽的头部
        let patch_head = this.POS["gamepatch_head"];
        this.ctx.drawImage(
            this.gamepatch, patch_head[0], patch_head[1],
            patch_head[2], patch_head[3],
            canvas.scale * icon_pos[4] + canvas.scale * spacing,
            canvas.scale * icon_pos[5] - canvas.scale * 5,
            patch_head[2] * canvas.scale,
            patch_head[3] * canvas.scale
        );
        // 绘制数字槽的中部
        let patch_item = this.POS["gamepatch_item"];
        for (let i = 0; i < number; i++) {
            this.ctx.drawImage(
                this.gamepatch, patch_item[0], patch_item[1],
                patch_item[2], patch_item[3],
                // 中间方块的偏移量包含了三部分：左边图标的距离 + 方块头部的长度 + 前面中间方块的长度
                canvas.scale * icon_pos[4] + canvas.scale * (spacing + patch_head[2] + patch_item[2] * i),
                canvas.scale * icon_pos[5] - canvas.scale * 5,
                patch_item[2] * canvas.scale,
                patch_item[3] * canvas.scale
            );
        }
        // 绘制数字槽的尾部
        let patch_tile = this.POS["gamepatch_tile"];
        this.ctx.drawImage(
            this.gamepatch, patch_tile[0], patch_tile[1],
            patch_tile[2], patch_tile[3],
            canvas.scale * icon_pos[4] + canvas.scale * (spacing + patch_head[2] + patch_item[2] * number),
            canvas.scale * icon_pos[5] - canvas.scale * 5,
            patch_tile[2] * canvas.scale,
            patch_tile[3] * canvas.scale
        );
    }

    // 画泥土分层
    draw_bg_tile(canvas) {
        for (let i = 0; i < 3; i++) {
            this.ctx.drawImage(
                this.bgtile2, 0, 0, this.bgtile2.width, this.bgtile2.height,
                canvas.width / 3 * i, canvas.height * 0.42,
                canvas.width / 3, canvas.height * 0.12
            );
        }

        for (let i = 0; i < 3; i++) {
            this.ctx.drawImage(
                this.bgtile1, 0, 0, this.bgtile1.width, this.bgtile1.height,
                canvas.width / 3 * i, canvas.height * 0.58,
                canvas.width / 3, canvas.height * 0.1
            );
        }

        for (let i = 0; i < 3; i++) {
            this.ctx.drawImage(
                this.bgtile3, 0, 0, this.bgtile3.width, this.bgtile3.height,
                canvas.width / 3 * i, canvas.height * 0.70,
                canvas.width / 3, canvas.height * 0.1
            );
        }

        let num = 6;
        for (let i = 0; i < num; i++) {
            this.ctx.drawImage(
                this.bgtile4, 0, 0, this.bgtile4.width, this.bgtile4.height,
                canvas.width / num * i, canvas.height * 0.8,
                canvas.width / num, canvas.height * 0.2
            );
        }
    }

    draw_ground_tile(canvas) {
        // 画地面
        for (let i = 0; i < 3; i++) {
            this.ctx.drawImage(
                this.groundtile, 0, 0, this.groundtile.width, this.groundtile.height,
                canvas.width / 3 * i, canvas.height * 0.28,
                canvas.width / 3, canvas.height * 0.058
            );
        }
    }

    draw_dirt_color(canvas) {
        // 画背景泥土颜色
        this.ctx.fillStyle = "rgb(86,52,37)";
        this.ctx.fillRect(0, canvas.height * 0.30, canvas.width, canvas.height);
    }

    draw_sky_ground(canvas) {
        let num = 8;
        for (let i = 0; i < num; i++) {
            this.ctx.drawImage(
                this.purpletile, 0, 0, this.purpletile.width, this.purpletile.height,
                canvas.width / num * i, canvas.height * 0,
                canvas.width / num, canvas.height * 0.30
            );
        }

        num = 3;
        for (let i = 0; i < num; i++) {
            this.ctx.drawImage(
                this.gametopbg, 0, 0, this.gametopbg.width, this.gametopbg.height,
                canvas.width / num * i, canvas.height * 0.13,
                canvas.width / num, canvas.height * 0.159
            );
        }
    }
}