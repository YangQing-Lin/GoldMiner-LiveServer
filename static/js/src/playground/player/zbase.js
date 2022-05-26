import { AcGameObject } from "/static/js/src/playground/ac_game_objects/zbase.js";
import { Hook } from "/static/js/src/playground/hook/zbase.js";

export class Player extends AcGameObject {
    constructor(playground, x, y, radius, character, username, photo) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.character = character;
        this.username = username;
        this.photo = photo;

        this.money = 0;

        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start() {
        this.add_listening_events();

        this.hook = new Hook(this.playground, this, this.playground.game_map.score_number);
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i++) {
            let x = parseInt(Math.floor(Math.random() * 10)); // 返回[0, 1)
            res += x;
        }
        return res;
    }

    // 监听鼠标事件 
    add_listening_events() {
        if (this.playground.operator === "pc") {
            this.add_pc_listening_events();
        } else {
            this.add_phone_listening_events();
        }
    }

    add_phone_listening_events() {
    }

    add_pc_listening_events() {
        let outer = this;

        // 关闭右键菜单功能
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });

        // 监听鼠标右键点击事件，获取鼠标位置
        this.playground.game_map.$canvas.mousedown(function (e) {
            // 项目在acapp的小窗口上运行会有坐标值的不匹配的问题，这里做一下坐标映射
            // 这里canvas前面不能加$，会报错
            const rect = outer.ctx.canvas.getBoundingClientRect();
            let tx = (e.clientX - rect.left) / outer.playground.scale;
            let ty = (e.clientY - rect.top) / outer.playground.scale;
            if (e.which === 3) {
                console.log("click right");
            } else if (e.which === 1) {
                console.log("click left:", tx, ty);
            }
        });

        // 重新绑定监听对象到小窗口
        // 之前的监听对象：$(window).keydown(function (e) {
        this.playground.game_map.$canvas.keydown(function (e) {
            console.log("key code:", e.which);

            if (e.which === 32) {  // 空格，出勾
                outer.hook.tick();
            }

            return true;
        });
    }

    // 获取两点之间的直线距离
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update() {
        this.render();
    }

    render() {
        let scale = this.playground.scale;

        let photo_x = this.x + this.radius * 2;
        let photo_y = this.y - this.radius * 0.5;

        // 如果是自己就画出头像，如果是敌人就用颜色代替
        if (this.img) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(photo_x * scale, photo_y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.clip();
            this.ctx.drawImage(this.img, (photo_x - this.radius) * scale, (photo_y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(photo_x * scale, photo_y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = "white";
            this.ctx.fill();
        }
    }

    // 玩家死亡后将其从this.playground.players里面删除
    // 这个函数和基类的destroy不同，基类的是将其从AC_GAME_OBJECTS数组里面删除
    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}

