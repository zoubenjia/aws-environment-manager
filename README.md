# AWS Environment Manager

一个功能强大的Firefox扩展，用于管理AWS多环境访问，支持容器隔离和Tree Style Tab集成。

## 🌟 主要功能

### 🔐 环境管理
- ✅ 多AWS环境配置和管理
- ✅ 环境信息存储（账户ID、角色、SSO等）
- ✅ 可视化环境列表和快速切换
- ✅ 环境编辑、删除和重置功能

### 📦 Firefox容器集成
- ✅ 自动容器创建和管理
- ✅ 基于环境类型的容器颜色分配
- ✅ 生产环境安全隔离和警告
- ✅ 容器状态检查和权限验证

### 🌳 Tree Style Tab支持
- ✅ 动态CSS生成和自动应用
- ✅ 容器颜色跟随环境变化
- ✅ 强制自动写入TST配置
- ✅ 多种写入方法和回退机制

### 🎨 视觉标识
- ✅ 环境颜色编码（生产=红色，开发=绿色等）
- ✅ 环境图标和描述
- ✅ 生产环境脉冲警告动画
- ✅ 响应式界面设计

## 🚀 快速开始

### 安装要求
- Firefox 57+
- Multi-Account Containers扩展（推荐）
- Tree Style Tab扩展（可选）

### 安装步骤
1. 下载扩展文件
2. 在Firefox中打开 `about:debugging`
3. 点击"临时载入附加组件"
4. 选择 `manifest.json` 文件
5. 扩展图标将出现在工具栏中

### 基本使用
1. 点击扩展图标打开管理界面
2. 使用"➕ 添加环境"创建新环境
3. 配置环境信息（名称、账户ID、角色等）
4. 点击环境项目在对应容器中打开AWS控制台
5. 使用"🌳 TST配置"自动配置Tree Style Tab样式

## 📁 项目结构

```
aws-environment-extension-package/
├── manifest.json                 # 扩展清单文件
├── popup.html                   # 主界面HTML
├── popup-fixed.css             # 响应式样式文件
├── popup.js                     # 主要逻辑
├── edit-functions.js            # 环境编辑功能
├── firefox-containers.js       # Firefox容器集成
├── safe-tst-css.js             # TST CSS生成
├── force-auto-tst.js           # 强制自动TST配置
├── auto-copy-paste.js          # 自动复制粘贴功能
├── tst-debug.js                # TST调试工具
├── popup-layout-fix.js         # 界面布局修复
└── region-*.js                 # 区域处理相关文件
```

## 🔧 功能详解

### 环境管理
- **添加环境**: 支持自定义名称、描述、颜色、图标
- **环境配置**: AWS账户ID、角色名称、SSO起始URL
- **区域选择**: 支持多AWS区域配置
- **环境操作**: 编辑、删除、重置默认环境

### 容器功能
- **自动容器创建**: 根据环境类型自动创建对应颜色的容器
- **容器隔离**: 每个环境在独立容器中运行，完全隔离Cookie和会话
- **权限检查**: 自动检测容器API可用性和权限状态
- **智能回退**: 容器功能不可用时自动回退到普通标签页

### TST集成
- **动态CSS生成**: 根据环境配置自动生成TST样式
- **多种写入方法**: 6种并行写入方法确保配置成功
- **持续监控**: 自动监视器确保样式持续生效
- **调试工具**: 完整的调试和状态检查功能

## 🎨 环境颜色方案

| 环境类型 | 颜色 | 图标 | 描述 |
|---------|------|------|------|
| 生产环境 | 🔴 红色 | 🔴 | 高安全级别，带警告动画 |
| 开发环境 | 🟢 绿色 | 🟢 | 完全访问权限 |
| 测试环境 | 🔵 蓝色 | 🔵 | 预发布验证 |
| 沙盒环境 | 🟡 黄色 | 🟡 | 实验和学习环境 |

## 🛠️ 开发和调试

### 调试功能
- **🔍 TST调试**: 全面的系统状态检查
- **🔧 强制写入**: 多方案强制写入TST配置
- **📋 剪贴板**: 剪贴板功能状态检查
- **⚡ 立即应用**: 即时应用样式到当前页面

### 开发环境设置
1. 克隆仓库到本地
2. 在Firefox中载入临时扩展
3. 修改代码后重新载入扩展
4. 使用浏览器开发者工具调试

## 📝 更新日志

### v1.0.2 (最新)
- ✅ 添加强制自动TST配置功能
- ✅ 修复弹出窗口显示问题
- ✅ 优化响应式界面设计
- ✅ 增强容器权限检查
- ✅ 添加持续监控机制

### v1.0.1
- ✅ 添加Firefox容器集成
- ✅ 实现TST CSS自动生成
- ✅ 添加环境颜色修复功能

### v1.0.0
- ✅ 基础环境管理功能
- ✅ 环境添加、编辑、删除
- ✅ AWS控制台快速访问

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 提交Issue
- 详细描述问题和复现步骤
- 提供Firefox版本和扩展版本信息
- 包含相关的控制台日志

### 提交代码
1. Fork本仓库
2. 创建功能分支
3. 提交代码并添加测试
4. 创建Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- Firefox Multi-Account Containers团队
- Tree Style Tab扩展开发者
- AWS开发者社区

---

**⭐ 如果这个项目对您有帮助，请给个Star！**

*最后更新: 2025-06-23*
