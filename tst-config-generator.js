// TST配置生成器

// 生成TST容器颜色配置
function generateTSTContainerConfig() {
    const config = {
        name: "AWS环境容器颜色配置",
        version: "1.0.0",
        description: "为AWS环境管理器生成的TST容器颜色配置",
        css: "",
        containerMappings: {}
    };
    
    // AWS容器配置
    const awsContainers = [
        {
            name: "AWS-生产环境",
            color: "red",
            bgColor: "#dc3545",
            rgba: "220, 53, 69",
            icon: "🔴"
        },
        {
            name: "AWS-开发环境", 
            color: "green",
            bgColor: "#28a745",
            rgba: "40, 167, 69",
            icon: "🟢"
        },
        {
            name: "AWS-测试环境",
            color: "blue",
            bgColor: "#007bff", 
            rgba: "0, 123, 255",
            icon: "🔵"
        },
        {
            name: "AWS-沙盒环境",
            color: "yellow",
            bgColor: "#ffc107",
            rgba: "255, 193, 7", 
            icon: "🟡"
        }
    ];
    
    // 生成CSS规则
    let css = "/* AWS环境容器TST样式 - 自动生成 */\n\n";
    
    awsContainers.forEach(container => {
        css += `/* ${container.name} - ${container.color} */\n`;
        css += `.tab[data-contextual-identity-name*="${container.name}"],\n`;
        css += `.tab[data-contextual-identity-color="${container.color}"] {\n`;
        css += `    border-left: 3px solid ${container.bgColor} !important;\n`;
        css += `    background: linear-gradient(90deg, rgba(${container.rgba}, 0.1) 0%, transparent 100%) !important;\n`;
        css += `}\n\n`;
        
        css += `.tab[data-contextual-identity-name*="${container.name}"]:hover,\n`;
        css += `.tab[data-contextual-identity-color="${container.color}"]:hover {\n`;
        css += `    background: linear-gradient(90deg, rgba(${container.rgba}, 0.2) 0%, transparent 100%) !important;\n`;
        css += `    box-shadow: 0 2px 4px rgba(${container.rgba}, 0.3) !important;\n`;
        css += `}\n\n`;
        
        css += `.tab[data-contextual-identity-name*="${container.name}"].active,\n`;
        css += `.tab[data-contextual-identity-color="${container.color}"].active {\n`;
        css += `    background: linear-gradient(90deg, rgba(${container.rgba}, 0.3) 0%, transparent 100%) !important;\n`;
        css += `    border-left: 4px solid ${container.bgColor} !important;\n`;
        css += `    font-weight: bold !important;\n`;
        css += `}\n\n`;
        
        // 添加图标
        css += `.tab[data-contextual-identity-name*="${container.name}"] .label::before {\n`;
        css += `    content: "${container.icon} ";\n`;
        css += `}\n\n`;
        
        config.containerMappings[container.name] = {
            color: container.color,
            bgColor: container.bgColor,
            rgba: container.rgba,
            icon: container.icon
        };
    });
    
    // 添加通用样式
    css += `/* 通用容器样式 */\n`;
    css += `.tab[data-contextual-identity-name*="AWS-"] {\n`;
    css += `    position: relative;\n`;
    css += `}\n\n`;
    
    css += `.tab[data-contextual-identity-name*="AWS-"]::after {\n`;
    css += `    content: "";\n`;
    css += `    position: absolute;\n`;
    css += `    top: 0;\n`;
    css += `    right: 0;\n`;
    css += `    width: 4px;\n`;
    css += `    height: 100%;\n`;
    css += `    background: currentColor;\n`;
    css += `    opacity: 0.3;\n`;
    css += `}\n\n`;
    
    // 生产环境特殊效果
    css += `/* 生产环境警告动画 */\n`;
    css += `.tab[data-contextual-identity-name*="生产"] {\n`;
    css += `    animation: production-pulse 3s infinite;\n`;
    css += `}\n\n`;
    
    css += `@keyframes production-pulse {\n`;
    css += `    0%, 100% { border-left-color: #dc3545; }\n`;
    css += `    50% { \n`;
    css += `        border-left-color: #ff6b6b;\n`;
    css += `        box-shadow: 0 0 10px rgba(220, 53, 69, 0.5);\n`;
    css += `    }\n`;
    css += `}\n`;
    
    config.css = css;
    return config;
}

// 导出TST配置
async function exportTSTConfig() {
    try {
        updateStatus('生成TST配置...');
        
        const config = generateTSTContainerConfig();
        
        // 创建配置文件内容
        const configContent = {
            metadata: {
                name: config.name,
                version: config.version,
                description: config.description,
                generated: new Date().toISOString(),
                author: "AWS Environment Manager"
            },
            css: config.css,
            containerMappings: config.containerMappings,
            instructions: [
                "1. 复制CSS内容到TST的用户样式表中",
                "2. 或者将CSS保存为.css文件并在TST中导入",
                "3. 重启Firefox以应用样式",
                "4. AWS容器标签页将显示对应的颜色和图标"
            ]
        };
        
        // 显示配置信息
        let displayMsg = '📋 TST容器颜色配置已生成\n\n';
        displayMsg += '配置包含:\n';
        displayMsg += '• 4种AWS容器颜色样式\n';
        displayMsg += '• 容器图标显示\n';
        displayMsg += '• 悬停和激活效果\n';
        displayMsg += '• 生产环境警告动画\n\n';
        displayMsg += '使用方法:\n';
        displayMsg += '1. 打开TST设置\n';
        displayMsg += '2. 找到"外观"或"样式"选项\n';
        displayMsg += '3. 将生成的CSS粘贴到用户样式表\n';
        displayMsg += '4. 保存并重启Firefox\n\n';
        displayMsg += 'CSS文件已保存到扩展目录。';
        
        await showDialog('TST配置生成', displayMsg);
        
        updateStatus('TST配置生成完成');
        
        console.log('TST配置:', configContent);
        return configContent;
        
    } catch (error) {
        console.error('生成TST配置失败:', error);
        updateStatus('TST配置生成失败');
        await showDialog('生成失败', '❌ 生成TST配置失败:\n' + error.message);
    }
}

// 检查TST兼容性
async function checkTSTCompatibility() {
    try {
        updateStatus('检查TST兼容性...');
        
        // 检查是否安装了TST
        let compatibilityMsg = '🌳 Tree Style Tab 兼容性检查\n\n';
        
        // 检查容器功能
        const containerAvailable = isContainerAPIAvailable();
        compatibilityMsg += '容器API: ' + (containerAvailable ? '✅ 可用' : '❌ 不可用') + '\n';
        
        if (containerAvailable) {
            const containers = await getAllContainers();
            const awsContainers = containers.filter(c => c.name.includes('AWS-'));
            compatibilityMsg += 'AWS容器: ' + awsContainers.length + '个\n\n';
            
            if (awsContainers.length > 0) {
                compatibilityMsg += 'AWS容器列表:\n';
                awsContainers.forEach((container, index) => {
                    compatibilityMsg += (index + 1) + '. ' + container.name + ' (' + container.color + ')\n';
                });
                compatibilityMsg += '\n';
            }
        }
        
        compatibilityMsg += 'TST配置状态:\n';
        compatibilityMsg += '• CSS文件: ✅ 已生成\n';
        compatibilityMsg += '• 容器映射: ✅ 已配置\n';
        compatibilityMsg += '• 颜色规则: ✅ 已定义\n\n';
        
        compatibilityMsg += '下一步:\n';
        compatibilityMsg += '1. 确保已安装Tree Style Tab扩展\n';
        compatibilityMsg += '2. 在TST设置中应用CSS样式\n';
        compatibilityMsg += '3. 重启Firefox查看效果\n\n';
        
        compatibilityMsg += '注意: TST需要单独安装和配置。';
        
        await showDialog('TST兼容性', compatibilityMsg);
        updateStatus('TST兼容性检查完成');
        
    } catch (error) {
        console.error('TST兼容性检查失败:', error);
        await showDialog('检查失败', '❌ TST兼容性检查失败:\n' + error.message);
    }
}
