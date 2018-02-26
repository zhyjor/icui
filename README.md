## 概述
ICUI是一套参考weui的实现及打包方式的前端ui组件库

## 使用说明
可以通过两种方式引入
* 可以直接通过cdn引入项目导出的css文件
* 可以通过`npm install icui`,然后使用`import 'icui/dist/style/weui.min.css`引入`

## 开发说明

* 开发的工作空间是`src/style`，最终的输出就是一个样式文件。
* 使用less开发
* 所有的组件放在`~/widget`，所有的组件命名前加上`icui-`，命名方式，参考现有的组件
* 定义的宏请放在`~/base`中，按照现有的方式新建并放在对应的文件夹
* `~/base/fn.less`引入所有的宏，开发的组件只要引入该文件即可
* 编辑完成的组件样式，请在`~/widget/icui.less`中引入，改文件会最终输出

## 调试说明

* 调试的工作空间是`src/example`
* 参考现有的测试组件，在`~/fragment`里添加测试样式组件的模块
* 在`~/fragement/home.html`里假如对上述模块的调用
* 使用`npm start`即可运行测试
* 使用`npm run release`会打包输出到`dist/style`

