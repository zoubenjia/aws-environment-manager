# GitHub API 上传配置指南

## 🔑 Personal Access Token 创建步骤

### 1. 访问GitHub Token设置页面
访问: https://github.com/settings/tokens

### 2. 创建新Token
1. 点击 "Generate new token" → "Generate new token (classic)"
2. 填写Token描述: `AWS Environment Manager Upload`
3. 设置过期时间: 建议选择 `30 days` 或 `90 days`

### 3. 选择权限范围
必需的权限:
- ✅ `repo` - 完整的仓库访问权限
  - ✅ `repo:status` - 访问提交状态
  - ✅ `repo_deployment` - 访问部署状态
  - ✅ `public_repo` - 访问公开仓库
  - ✅ `repo:invite` - 访问仓库邀请
- ✅ `user` - 用户信息访问
  - ✅ `read:user` - 读取用户资料
  - ✅ `user:email` - 访问用户邮箱
- ✅ `delete_repo` - 删除仓库权限（可选）

### 4. 生成并保存Token
1. 点击 "Generate token"
2. **重要**: 立即复制Token（只显示一次）
3. 保存到安全的地方

## 🔧 配置上传脚本

### 1. 编辑配置文件
打开 `github-api-upload.js` 文件，修改以下配置:

```javascript
const GITHUB_CONFIG = {
    username: 'YOUR_GITHUB_USERNAME',     // 替换为您的GitHub用户名
    token: 'ghp_xxxxxxxxxxxxxxxxxxxx',    // 替换为您的Personal Access Token
    repoName: 'aws-environment-manager',
    repoDescription: '功能强大的Firefox扩展，用于管理AWS多环境访问，支持容器隔离和TST集成'
};
```

### 2. 安装Node.js（如果未安装）
- 访问: https://nodejs.org/
- 下载并安装最新LTS版本

### 3. 运行上传脚本
```bash
# 在扩展目录中执行
node github-api-upload.js
```

## 🚀 自动化上传流程

脚本将自动执行以下操作:

1. **创建GitHub仓库**
   - 仓库名: `aws-environment-manager`
   - 设置为公开仓库
   - 启用Issues、Projects、Wiki、Discussions
   - 设置MIT许可证

2. **上传所有文件**
   - 扫描项目目录
   - 批量上传所有源代码文件
   - 跳过.git目录和临时文件
   - 显示上传进度

3. **设置仓库标签**
   - `firefox-extension`
   - `aws`
   - `containers`
   - `tree-style-tab`
   - `multi-account`
   - `browser-extension`

## 📊 预期结果

上传成功后，您将看到:
```
🎉 上传完成!
📊 统计: 106/106 文件上传成功
🔗 仓库地址: https://github.com/YOUR_USERNAME/aws-environment-manager
```

## ⚠️ 注意事项

### 安全提醒
- **不要**将Personal Access Token提交到代码仓库
- 使用后及时删除或轮换Token
- 只授予必要的权限

### API限制
- GitHub API有速率限制（每小时5000次请求）
- 脚本已添加延迟避免触发限制
- 大文件可能需要使用Git LFS

### 故障排除
1. **Token权限不足**: 检查Token权限设置
2. **仓库已存在**: 脚本会自动处理
3. **网络问题**: 检查网络连接
4. **文件过大**: GitHub单文件限制100MB

## 🔄 替代方案

如果API上传失败，可以使用传统Git方式:

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/aws-environment-manager.git

# 推送代码
git push -u origin main
```

## 📞 获取帮助

如果遇到问题:
1. 检查Token权限和有效性
2. 查看GitHub API文档: https://docs.github.com/en/rest
3. 检查网络连接和防火墙设置

---

**准备好了吗？** 配置完成后运行 `node github-api-upload.js` 开始上传！
