export class AcGameMenu {
    // root就是web.html里的ac_game对象
    constructor(root) {
        this.root = root;
        // 前面加$表示js对象
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            开始游戏
        </div>
        </br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            退出
        </div>
    </div>
</div>
`);
        this.$menu.hide();
        // 将menu对象添加到ac_game对象中，这样就能动态更改页面了
        this.root.$ac_game.append(this.$menu);

        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();

        // 想要直接进入游戏就把这行注释掉（调试游戏的时候使用，一共三个地方要改）
        // this.show();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function () {
            outer.hide();
            outer.root.playground.show();
        });
        this.$settings.click(function () {
            outer.root.settings.logout_on_remote();
        });
    }

    show() {  // 显示menu界面
        // 使用的是jQuery的API
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
}