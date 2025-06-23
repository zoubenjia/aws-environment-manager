#!/bin/bash

# AWS Environment Manager - GitHub上传脚本

echo "🚀 AWS Environment Manager GitHub上传助手"
echo "======================================="
echo ""

# 检查当前目录
if [ ! -f "manifest.json" ]; then
    echo "❌ 错误: 请在扩展根目录中运行此脚本"
    exit 1
fi

# 显示当前状态
echo "📊 当前仓库状态:"
echo "   • 目录: $(pwd)"
echo "   • 分支: $(git branch --show-current)"
echo "   • 文件数: $(git ls-files | wc -l | tr -d ' ')"
echo "   • 提交数: $(git rev-list --count HEAD)"
echo ""

# 检查Git配置
echo "👤 Git配置:"
echo "   • 用户名: $(git config user.name)"
echo "   • 邮箱: $(git config user.email)"
echo ""

# 检查是否已连接远程仓库
if git remote get-url origin >/dev/null 2>&1; then
    echo "🔗 远程仓库已配置:"
    echo "   • Origin: $(git remote get-url origin)"
    echo ""
    
    # 询问是否推送
    read -p "是否现在推送到GitHub? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📤 推送到GitHub..."
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo "✅ 推送成功!"
            echo ""
            echo "🎉 您的仓库现在可以在以下地址访问:"
            echo "   $(git remote get-url origin | sed 's/\.git$//')"
        else
            echo "❌ 推送失败，请检查网络连接和权限"
        fi
    fi
else
    echo "⚠️  远程仓库未配置"
    echo ""
    echo "请按照以下步骤操作:"
    echo ""
    echo "1️⃣  在GitHub上创建新仓库:"
    echo "   • 访问: https://github.com/new"
    echo "   • 仓库名: aws-environment-manager"
    echo "   • 描述: 功能强大的Firefox扩展，用于管理AWS多环境访问"
    echo "   • 设为公开仓库"
    echo "   • 不要初始化README"
    echo ""
    echo "2️⃣  配置远程仓库:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/aws-environment-manager.git"
    echo ""
    echo "3️⃣  推送代码:"
    echo "   git push -u origin main"
    echo ""
    
    # 询问GitHub用户名
    read -p "请输入您的GitHub用户名 (按Enter跳过): " github_username
    
    if [ ! -z "$github_username" ]; then
        echo ""
        echo "🔧 为您生成的命令:"
        echo "   git remote add origin https://github.com/$github_username/aws-environment-manager.git"
        echo "   git push -u origin main"
        echo ""
        
        read -p "是否现在执行这些命令? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🔗 添加远程仓库..."
            git remote add origin "https://github.com/$github_username/aws-environment-manager.git"
            
            echo "📤 推送到GitHub..."
            git push -u origin main
            
            if [ $? -eq 0 ]; then
                echo "✅ 上传成功!"
                echo ""
                echo "🎉 您的仓库地址:"
                echo "   https://github.com/$github_username/aws-environment-manager"
                echo ""
                echo "📋 建议的后续步骤:"
                echo "   1. 在GitHub上添加仓库标签"
                echo "   2. 启用Issues和Discussions"
                echo "   3. 创建第一个Release"
            else
                echo "❌ 推送失败"
                echo "可能的原因:"
                echo "   • 仓库不存在或名称错误"
                echo "   • 没有推送权限"
                echo "   • 网络连接问题"
            fi
        fi
    fi
fi

echo ""
echo "📖 更多帮助请查看: GITHUB_UPLOAD_GUIDE.md"
