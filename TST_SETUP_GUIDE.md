# TST标签页颜色设置指南

## 🎯 目标
让Tree Style Tab (TST) 中的AWS控制台标签页显示不同的环境颜色。

## 📋 设置步骤

### 1. 确保已安装Tree Style Tab扩展
- 访问：https://addons.mozilla.org/firefox/addon/tree-style-tab/
- 点击"添加到Firefox"

### 2. 打开TST设置
1. 右键点击TST侧边栏
2. 选择"选项"或"设置"
3. 或者访问：`moz-extension://[TST扩展ID]/options/options.html`

### 3. 添加用户样式
1. 在TST设置中找到"外观"部分
2. 找到"用户样式表"或"Additional Style Rules"
3. 将 `tst-user-styles.css` 文件的内容复制粘贴进去
4. 点击"保存"

### 4. 验证效果
1. 打开AWS控制台标签页
2. 查看TST侧边栏中的标签页颜色：
   - 🔴 生产环境：红色背景
   - 🟢 开发环境：绿色背景  
   - 🔵 测试环境：蓝色背景

## 🎨 颜色方案

### 环境识别规则
- **生产环境**：URL中不包含 `dev`、`test`、`staging` 的AWS控制台
- **开发环境**：URL中包含 `dev` 或 `development`
- **测试环境**：URL中包含 `test` 或 `staging`

### 区域特定颜色
- **eu-west-2** (伦敦)：粉红色
- **eu-central-1** (法兰克福)：淡绿色
- **us-east-1** (北弗吉尼亚)：淡蓝色
- **us-west-2** (俄勒冈)：淡青色
- **ap-southeast-1** (新加坡)：淡橙色
- **ap-northeast-1** (东京)：淡紫色

## 🔧 故障排除

### 标签页颜色不显示
1. 确认TST扩展已正确安装
2. 检查用户样式是否正确粘贴
3. 重启Firefox浏览器
4. 清除浏览器缓存

### 颜色不正确
1. 检查AWS控制台URL是否包含环境标识
2. 确认CSS规则的优先级
3. 使用浏览器开发者工具检查元素

### 自定义颜色
如需修改颜色，编辑CSS中的颜色值：
```css
/* 修改生产环境颜色 */
.tab[data-current-uri*="console.aws.amazon.com"]:not([data-current-uri*="dev"]):not([data-current-uri*="test"]):not([data-current-uri*="staging"]) {
    background: linear-gradient(135deg, #YOUR_COLOR, #YOUR_DARKER_COLOR) !important;
    border-left: 4px solid #YOUR_COLOR !important;
}
```

## 📞 支持
如有问题，请检查：
1. Firefox控制台错误信息
2. TST扩展版本兼容性
3. CSS语法正确性

---
*最后更新: 2025-06-22*
