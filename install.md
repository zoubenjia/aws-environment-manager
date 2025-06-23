# AWS Environment Browser Extension 安装指南

## 🚀 快速安装

### 步骤1：准备扩展文件
确保您有完整的扩展文件夹，包含以下文件：
```
aws-environment-extension/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.css
├── popup.js
├── aws-console-styles.css
├── options.html
└── icons/ (可选)
```

### 步骤2：在Firefox中安装
1. 打开Firefox浏览器
2. 在地址栏输入：`about:debugging`
3. 点击左侧的"此Firefox"
4. 点击"临时载入附加组件"按钮
5. 浏览到扩展文件夹，选择 `manifest.json` 文件
6. 点击"打开"

### 步骤3：验证安装
- 扩展图标应该出现在工具栏中
- 点击图标应该打开控制面板
- 访问AWS控制台应该看到区域颜色标识

## 🔧 功能测试

### 测试环境切换
1. 点击扩展图标
2. 选择不同的环境和区域
3. 确认在新容器中打开AWS控制台

### 测试区域检测
1. 访问不同区域的AWS控制台
2. 确认导航栏颜色变化
3. 确认右上角区域指示器显示

### 测试快捷键
- `Ctrl+Shift+E` - 应该打开环境切换器
- `Ctrl+Shift+R` - 应该显示区域信息

## ⚠️ 注意事项

1. **临时安装**：使用"临时载入"安装的扩展在Firefox重启后会被移除
2. **容器功能**：需要Firefox支持容器功能（默认支持）
3. **权限确认**：首次安装时可能需要确认权限

## 🔄 更新扩展

如果修改了扩展代码：
1. 在 `about:debugging` 页面找到扩展
2. 点击"重新载入"按钮
3. 或者移除后重新安装

## 🐛 故障排除

### 扩展无法加载
- 检查 `manifest.json` 语法是否正确
- 确认所有必需文件都存在
- 查看浏览器控制台错误信息

### 功能不工作
- 检查浏览器控制台是否有JavaScript错误
- 确认在AWS控制台页面测试功能
- 重新载入扩展

### 容器不工作
- 确认Firefox版本支持容器
- 检查扩展权限是否包含 `contextualIdentities`

## 📞 获取帮助

如果遇到问题：
1. 检查浏览器控制台错误信息
2. 确认Firefox版本兼容性
3. 重新安装扩展
