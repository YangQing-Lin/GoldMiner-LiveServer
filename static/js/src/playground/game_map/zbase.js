import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";

export class GameMap extends AcGameObject {
    constructor(playground) {
        super();  // 调用基类的构造函数
        this.playground = playground;

        this.$canvasDiv = $(`<div id="canvasDiv" class="canvasDiv"></div>`);
        // tabindex=0：给canvas绑上监听事件
        this.$background_canvas = $(`<canvas></canvas>`);
        this.$canvas = $(`<canvas tabindex=0></canvas>`);

        this.background_ctx = this.$background_canvas[0].getContext('2d');
        this.ctx = this.$canvas[0].getContext('2d');

        this.initScreen();
    }

    // 初始化所有canvas画布
    initScreen() {
        this.$canvasDiv.css({ "width": this.playground.width });
        this.$canvasDiv.css({ "height": this.playground.height });
        this.$canvasDiv.css({ "background-color": "lightgreed" });
        this.$canvasDiv.css({ "margin": "auto" });

        this.background_ctx.canvas.width = this.playground.width;
        this.background_ctx.canvas.height = this.playground.height;

        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        this.$canvasDiv.append(this.$background_canvas);
        this.$canvasDiv.append(this.$canvas);
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
    }

    update() {
        this.render();
    }

    // 渲染游戏地图
    render() {
        // 渲染纯黑游戏地图背景
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}