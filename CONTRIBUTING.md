# 贡献指南

感谢您对AWS Environment Manager项目的关注！我们欢迎各种形式的贡献。

## 🤝 如何贡献

### 报告问题
1. 在提交新问题之前，请先搜索现有的Issues
2. 使用清晰、描述性的标题
3. 提供详细的问题描述，包括：
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息（Firefox版本、操作系统等）
   - 相关的控制台日志或截图

### 提交功能请求
1. 描述您希望添加的功能
2. 解释为什么这个功能有用
3. 如果可能，提供实现建议

### 代码贡献

#### 开发环境设置
1. Fork本仓库
2. 克隆您的Fork到本地
```bash
git clone https://github.com/YOUR_USERNAME/aws-environment-manager.git
cd aws-environment-manager
```

3. 在Firefox中载入扩展进行测试
   - 打开 `about:debugging`
   - 点击"临时载入附加组件"
   - 选择 `manifest.json` 文件

#### 开发流程
1. 创建新的功能分支
```bash
git checkout -b feature/your-feature-name
```

2. 进行开发
   - 遵循现有的代码风格
   - 添加必要的注释
   - 确保代码可读性

3. 测试您的更改
   - 在Firefox中测试扩展功能
   - 确保没有破坏现有功能
   - 测试不同的使用场景

4. 提交更改
```bash
git add .
git commit -m "feat: 添加新功能描述"
```

5. 推送到您的Fork
```bash
git push origin feature/your-feature-name
```

6. 创建Pull Request
   - 提供清晰的PR标题和描述
   - 说明更改的内容和原因
   - 如果修复了Issue，请引用Issue编号

## 📝 代码规范

### JavaScript
- 使用ES6+语法
- 使用有意义的变量和函数名
- 添加适当的错误处理
- 使用console.log进行调试，但在提交前清理

### CSS
- 使用语义化的类名
- 保持样式的一致性
- 支持响应式设计

### HTML
- 使用语义化的HTML标签
- 确保可访问性
- 保持结构清晰

## 🧪 测试

在提交PR之前，请确保：
- [ ] 扩展能够正常载入
- [ ] 所有现有功能正常工作
- [ ] 新功能按预期工作
- [ ] 在不同的Firefox版本中测试（如果可能）
- [ ] 检查控制台是否有错误

## 📋 提交消息规范

使用以下格式的提交消息：
- `feat: 添加新功能`
- `fix: 修复bug`
- `docs: 更新文档`
- `style: 代码格式调整`
- `refactor: 代码重构`
- `test: 添加测试`
- `chore: 构建过程或辅助工具的变动`

## 🏷️ 版本发布

项目使用语义化版本控制：
- `MAJOR.MINOR.PATCH`
- MAJOR: 不兼容的API更改
- MINOR: 向后兼容的功能添加
- PATCH: 向后兼容的bug修复

## 📞 获取帮助

如果您在贡献过程中遇到问题：
1. 查看现有的Issues和文档
2. 创建新的Issue询问
3. 在PR中@维护者

## 🙏 致谢

感谢所有贡献者的努力！您的贡献使这个项目变得更好。

---

再次感谢您的贡献！🎉
