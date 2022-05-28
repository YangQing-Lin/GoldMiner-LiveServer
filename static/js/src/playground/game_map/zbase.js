import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";
import { GameBackground } from "/static/js/src/playground/game_map/game_background/zbase.js";
import { ScoreNumber } from "/static/js/src/playground/game_map/score_number/zbase.js";
import { Shop } from "/static/js/src/playground/game_map/shop/zbase.js";

export class GameMap extends AcGameObject {
    constructor(root, playground) {
        super();  // 调用基类的构造函数
        this.root = root;
        this.playground = playground;

        this.$canvasDiv = $(`<div id="canvasDiv" class="canvasDiv"></div>`);
        this.$background_canvas = $(`<canvas></canvas>`);
        this.$score_number_canvas = $(`<canvas></canvas>`);
        this.$shop_canvas = $(`<canvas></canvas>`);
        // tabindex=0：给canvas绑上监听事件
        this.$canvas = $(`<canvas tabindex=0></canvas>`);

        this.game_background_ctx = this.$background_canvas[0].getContext('2d');
        this.game_score_number_ctx = this.$score_number_canvas[0].getContext('2d');
        this.game_shop_ctx = this.$shop_canvas[0].getContext('2d');
        this.ctx = this.$canvas[0].getContext('2d');


        this.game_background = new GameBackground(this.playground, this.game_background_ctx);
        this.score_number = new ScoreNumber(this.playground, this.game_score_number_ctx);
        this.shop = new Shop(this.playground, this.game_shop_ctx);

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

        // canvas覆盖顺序由下至上：背景 -> 钩子 -> 商店 -> 数字
        this.$canvasDiv.append(this.$background_canvas);
        this.$canvasDiv.append(this.$canvas);
        this.$canvasDiv.append(this.$shop_canvas);
        this.$canvasDiv.append(this.$score_number_canvas);
        this.playground.$playground.append(this.$canvasDiv);
    }

    start() {
        // 聚焦到当前canvas
        this.$canvas.focus();
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;

        // 关闭右键菜单功能
        this.playground.game_map.$canvas.on("contextmenu", function () {
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

        if (this.game_background) this.game_background.resize();
        if (this.score_number) this.score_number.resize();
    }

    update() {
        this.render();
    }

    render() {
        // 清空游戏地图
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // 渲染纯黑游戏地图背景
        // this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        // this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}