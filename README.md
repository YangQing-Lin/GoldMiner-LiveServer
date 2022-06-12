# 黄金矿工LiveServer版

## 开发日志

### 2022-06-11

- 添加游戏成功和失败的判定
- 得分达标后为绿色
- 实现游戏失败后重置数据重新开始
- 修复settings界面一直会有menu界面的BUG
- 发布版本v-1.5

### 2022-06-11

- 修复游戏界面调整窗口大小后会出现弹窗数字的BUG
- 修复弹窗界面调整窗口大小后游戏界面数字消失的BUG
- 添加了回车开始游戏、1~5购买道具的功能，实现了全键盘游玩
- 时间结束后抓到的物品不计入总金额
- 实现每局自动更新分数
- 实现结束当前关卡按钮，给分数增加量设置上限
- 发布版本v-1.4

### 2022-06-05

- 修复弹窗界面可以抓矿物的BUG
- 修复卡商店界面无限时间BUG

### 2022-06-01

- 修复窗口y轴偏移量的问题
- 修复商店界面固定BUG
- 修复关卡数每次会多加1的BUG
- 修复弹窗界面调整窗口大小会导致数字消失的BUG
![](https://picgo-yangqing.oss-cn-hangzhou.aliyuncs.com/img/202206011053923.png)

### 2022-05-30

- 绘制弹窗的数字图标和技能图标
- 绘制确定按钮
- 编写按钮逻辑
- 重新编写各个页面之间的逻辑，实现游戏流程
- 引入音频链接
- 按照游戏逻辑触发音频
- 实现购买雷同步数量的功能
- 可以上线了

### 2022-05-29

- 实现了游戏界面更改时间和页面切换功能
- 优化界面切换逻辑，将score_number的resize整合到render里面
- 绘制商店界面技能价格背景
- 绘制商店技能的价格
- 优化game_background的resize逻辑，并更改game_map里的resize
- 实现了购买商品扣钱的逻辑，并退出商店界面的测试
- 实现了关卡数的递增
- 实现了应用到全局的金钱和关卡变量
- 开始绘制弹窗
- 更改canvas显示顺序：弹窗在最上层，明天在弹窗类里面new一个数字显示类，传入弹窗的canvas即可
![](https://picgo-yangqing.oss-cn-hangzhou.aliyuncs.com/img/202205292327751.png)
![](https://picgo-yangqing.oss-cn-hangzhou.aliyuncs.com/img/202205292328038.png)

### 2022-05-28

- 加入tnt炸毁矿物的动画
- 编写tnt爆炸逻辑，实现了连爆
- 解决了tnt无法炸掉所有矿物的bug
- 调整了矿物的质量参数
- 完成了商店顶端的数字栏
- 完成了商店的下一关按钮
- 成功绘制了技能图标的在售和售出样式！
- 实现了点击购买技能的逻辑和页面展示
- 解决了canvas聚焦和键盘监听事件绑定失败的bug
![](https://picgo-yangqing.oss-cn-hangzhou.aliyuncs.com/img/20220528215608.png)
![](https://picgo-yangqing.oss-cn-hangzhou.aliyuncs.com/img/20220528215443.png)
![](https://picgo-yangqing.oss-cn-hangzhou.aliyuncs.com/img/202205282157627.jpg)

### 2022-05-27

- 优化了抓取逻辑
- 删除了一些不必要的代码
- 绘制炸弹图标和旁边的炸弹数量
- 实现炸弹炸毁钩子上矿物功能
![](https://picgo-yangqing.oss-cn-hangzhou.aliyuncs.com/img/20220528102132.png)

### 2022-05-26

- 实现数字跟随金钱自动更改
- 加入钩子抓住东西的图片和位置
- 可以根据绳子长度绘制绳子图片
- 绘制卷线器
- 绘制矿物图标、位置、碰撞体积
- 编写随机生成矿物位置的函数
![](https://picgo-yangqing.oss-cn-hangzhou.aliyuncs.com/img/20220526224449.png)
![](https://picgo-yangqing.oss-cn-hangzhou.aliyuncs.com/img/202206022019131.jpg)

### 2022-05-25

- 实现大金块类
- 优化钩子操作
- 编写游戏背景类
- 绘制游戏背景图片
- 绘制图标和数字槽
- 绘制数字
![](https://picgo-yangqing.oss-cn-hangzhou.aliyuncs.com/img/20220526101304.png)

### 2022-05-24

- 删除多余的静态文件，修改appid
- 实现玩家类
- 实现钩子类
- 实现金矿基类
![](https://picgo-yangqing.oss-cn-hangzhou.aliyuncs.com/img/20220524203558.png)

### 2022-05-23

- 迁移游戏模板