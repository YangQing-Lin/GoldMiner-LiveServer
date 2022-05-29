import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";
import { GameBackground } from "/static/js/src/playground/game_map/game_background/zbase.js";
import { ScoreNumber } from "/static/js/src/playground/game_map/score_number/zbase.js";
import { Shop } from "/static/js/src/playground/game_map/shop/zbase.js";
import { PopUp } from "/static/js/src/playground/game_map/pop_up/zbase.js";

export class GameMap extends AcGameObject {
    constructor(root, playground) {
        super();  // 调用基类的构造函数
        this.root = root;
        this.playground = playground;
        this.last_time_left = 0;
        this.time_left = 60000;  // 关切剩余时间  单位：ms

        this.$canvasDiv = $(`<div id="canvasDiv" class="canvasDiv"></div>`);
        this.$background_canvas = $(`<canvas></canvas>`);
        this.$score_number_canvas = $(`<canvas tabindex=0></canvas>`);
        this.$shop_canvas = $(`<canvas></canvas>`);
        this.$pop_up_canvas = $(`<canvas></canvas>`);
        // tabindex=0：给canvas绑上监听事件
        this.$canvas = $(`<canvas></canvas>`);

        this.game_background_ctx = this.$background_canvas[0].getContext('2d');
        this.game_score_number_ctx = this.$score_number_canvas[0].getContext('2d');
        this.game_shop_ctx = this.$shop_canvas[0].getContext('2d');
        this.$pop_up_ctx = this.$pop_up_canvas[0].getContext('2d');
        this.ctx = this.$canvas[0].getContext('2d');


        this.game_background = new GameBackground(this.playground, this.game_background_ctx);
        this.score_number = new ScoreNumber(this.playground, this.game_score_number_ctx);
        this.shop = new Shop(this.playground, this.game_shop_ctx);
        this.pop_up = new PopUp(this.playground, this.$pop_up_ctx);

        this.initScreen();
    }

    // 初始化所有canvas画布
    initScreen() {
        this.$canvasDiv.css({ "width": this.playground.width });
        this.$canvasDiv.css({ "height": this.playground.height });
        this.$canvasDiv.css({ "background-color": "lightgreed" });
        this.$canvasDiv.css({ "margin": "auto" });

        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        // canvas覆盖顺序由下至上：背景 -> 钩子 -> 商店 -> 弹窗 -> 数字
        this.$canvasDiv.append(this.$background_canvas);
        this.$canvasDiv.append(this.$canvas);
        this.$canvasDiv.append(this.$shop_canvas);
        this.$canvasDiv.append(this.$pop_up_canvas);
        this.$canvasDiv.append(this.$score_number_canvas);

        this.playground.$playground.append(this.$canvasDiv);
    }

    start() {
        // 聚焦到当前canvas
        this.$score_number_canvas.focus();
        this.add_listening_events();
        this.start_new_level();
    }

    // 开始新一关的游戏界面，game_map创建的时候会调用一次，玩家在商店界面点击下一关也会调用一次
    start_new_level() {
        this.playground.character = "game";
        this.time_left = 10000;  // 设定新一局游戏的时长
        this.score_number.time_left = Math.ceil(this.time_left / 1000);
        // 调用score_number的新一关，游戏开局的初始数据都存在score_number里面
        this.score_number.start_new_level();
        this.game_background.render();
    }

    add_listening_events() {
        let outer = this;

        // 关闭右键菜单功能
        this.playground.game_map.$score_number_canvas.on("contextmenu", function () {
            return false;
        });
    }

    // 动态修改GameMap的长宽
    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        // 每次resize结束都涂一层纯黑的背景
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // 因为下面的对象都不是一秒更新60次的，所以直接调用render函数，render里面会自动resize
        if (this.game_background) this.game_background.render();
        if (this.score_number) this.score_number.render();
    }

    update() {
        // 只有在游戏界面才需要更新游戏时间
        if (this.playground.character === "game") {
            this.update_time_left();
        }
        this.render();
    }

    // 更新游戏时间，控制时间结束时的逻辑
    update_time_left() {
        // 用户切出标签页可能会让timedelta过大，造成总时间变成负数
        // 体现出的结果就是score_number绘制数字时报错，因为这个类无法处理负数
        if (this.timedelta / 1000 > 1 / 50) {
            return false;
        }
        this.time_left -= this.timedelta

        // 为了降低负载，只有当时间过了一秒的时候才需要刷新时间canvas
        // 并且时间为0时不会再更新了
        if (Math.abs(this.time_left - this.last_time_left) >= 1000) {
            // 这里时间采用向上取整，这样填多少就会从多少开始，到0直接结束而不会0显示1秒
            this.score_number.time_left = Math.ceil(this.time_left / 1000);
            this.score_number.render();
            this.last_time_left = this.time_left;
        }

        // 时间归零就会进入商店界面
        if (this.time_left < 0) {
            this.time_left = 0;
            this.playground.character = "shop";
            this.shop.start();
            // TODO
            this.score_number.render();
        }
    }

    render() {
        // 清空游戏地图
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}