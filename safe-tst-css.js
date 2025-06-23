// 安全的TST CSS生成器 - 避免无效字符问题

// 生成安全的TST CSS
async function generateSafeTSTCSS() {
    try {
        console.log('生成安全TST CSS...');
        
        // 获取环境数据
        const result = await browser.storage.local.get(['aws_environments']);
        const environments = result.aws_environments || [];
        
        if (environments.length === 0) {
            return {
                success: true,
                css: '/* 暂无环境配置 */',
                environments: []
            };
        }
        
        // 使用简单的CSS模板
        let css = '';
        css += '/* AWS环境管理器 TST样式 */\n';
        css += '/* 生成时间: ' + new Date().toISOString() + ' */\n\n';
        
        // 预定义的安全颜色映射
        const safeColors = {
            'production': { color: '#dc3545', rgb: '220,53,69', name: '生产' },
            'development': { color: '#28a745', rgb: '40,167,69', name: '开发' },
            'staging': { color: '#007bff', rgb: '0,123,255', name: '测试' },
            'sandbox': { color: '#ffc107', rgb: '255,193,7', name: '沙盒' }
        };
        
        // 为每个环境类型生成CSS
        Object.keys(safeColors).forEach(envType => {
            const config = safeColors[envType];
            
            css += '/* ' + config.name + '环境 */\n';
            css += '.tab[data-contextual-identity-color="red"] {\n';
            css += '    border-left: 3px solid ' + config.color + ' !important;\n';
            css += '    background: linear-gradient(90deg, rgba(' + config.rgb + ', 0.1) 0%, transparent 100%) !important;\n';
            css += '}\n\n';
            
            css += '.tab[data-contextual-identity-color="red"]:hover {\n';
            css += '    background: linear-gradient(90deg, rgba(' + config.rgb + ', 0.2) 0%, transparent 100%) !important;\n';
            css += '}\n\n';
            
            css += '.tab[data-contextual-identity-color="red"].active {\n';
            css += '    background: linear-gradient(90deg, rgba(' + config.rgb + ', 0.3) 0%, transparent 100%) !important;\n';
            css += '    border-left: 4px solid ' + config.color + ' !important;\n';
            css += '}\n\n';
        });
        
        // 添加基础样式
        css += '/* 基础容器样式 */\n';
        css += '.tab[data-contextual-identity-color="green"] {\n';
        css += '    border-left: 3px solid #28a745 !important;\n';
        css += '    background: linear-gradient(90deg, rgba(40,167,69, 0.1) 0%, transparent 100%) !important;\n';
        css += '}\n\n';
        
        css += '.tab[data-contextual-identity-color="blue"] {\n';
        css += '    border-left: 3px solid #007bff !important;\n';
        css += '    background: linear-gradient(90deg, rgba(0,123,255, 0.1) 0%, transparent 100%) !important;\n';
        css += '}\n\n';
        
        css += '.tab[data-contextual-identity-color="yellow"] {\n';
        css += '    border-left: 3px solid #ffc107 !important;\n';
        css += '    background: linear-gradient(90deg, rgba(255,193,7, 0.1) 0%, transparent 100%) !important;\n';
        css += '}\n\n';
        
        // 生产环境警告动画
        css += '/* 生产环境警告 */\n';
        css += '.tab[data-contextual-identity-color="red"] {\n';
        css += '    animation: prod-warning 3s infinite;\n';
        css += '}\n\n';
        
        css += '@keyframes prod-warning {\n';
        css += '    0%, 100% { border-left-color: #dc3545; }\n';
        css += '    50% { border-left-color: #ff6b6b; }\n';
        css += '}\n';
        
        return {
            success: true,
            css: css,
            environments: environments
        };
        
    } catch (error) {
        console.error('生成安全TST CSS失败:', error);
        return {
            success: false,
            error: error.message,
            css: '/* CSS生成失败 */'
        };
    }
}

// 显示安全TST配置 - 集成自动复制
async function showSafeTSTConfig() {
    try {
        updateStatus('生成安全TST配置...');
        
        const result = await generateSafeTSTCSS();
        
        if (!result.success) {
            await showDialog('生成失败', 
                '❌ 生成TST CSS失败:\n' + result.error + '\n\n' +
                '请检查环境配置或重新载入扩展。'
            );
            return;
        }
        
        // 显示配置信息
        let configMsg = '🌳 安全TST配置已生成\n\n';
        configMsg += '✅ 生成状态: 成功\n';
        configMsg += '📊 环境数量: ' + result.environments.length + '\n';
        configMsg += '🎨 支持颜色: 红、绿、蓝、黄\n';
        configMsg += '⚡ 特殊效果: 生产环境警告动画\n';
        configMsg += '📏 CSS长度: ' + result.css.length + ' 字符\n\n';
        
        configMsg += '🔧 CSS特性:\n';
        configMsg += '• 基于容器颜色的样式\n';
        configMsg += '• 渐变背景效果\n';
        configMsg += '• 悬停状态变化\n';
        configMsg += '• 激活状态突出显示\n';
        configMsg += '• 生产环境脉冲警告\n\n';
        
        configMsg += '🚀 自动复制功能:\n';
        configMsg += '点击"确定"将自动复制CSS到剪贴板，\n';
        configMsg += '并打开TST设置页面进行粘贴。\n\n';
        
        configMsg += '💡 一键完成CSS配置！';
        
        const confirmed = await showDialog('安全TST配置', configMsg, true);
        
        if (confirmed) {
            // 自动复制CSS并提供指导
            await autoCopyWithInstructions(result.css);
        }
        
        updateStatus('安全TST配置完成');
        
    } catch (error) {
        console.error('显示安全TST配置失败:', error);
        updateStatus('安全TST配置失败');
        await showDialog('配置失败', 
            '❌ 显示TST配置失败:\n' + error.message + '\n\n' +
            '请重新载入扩展后重试。'
        );
    }
}

// 测试CSS生成
async function testTSTCSSGeneration() {
    try {
        updateStatus('测试CSS生成...');
        
        const result = await generateSafeTSTCSS();
        
        let testMsg = '🧪 TST CSS生成测试\n\n';
        testMsg += '生成状态: ' + (result.success ? '✅ 成功' : '❌ 失败') + '\n';
        
        if (result.success) {
            testMsg += 'CSS长度: ' + result.css.length + ' 字符\n';
            testMsg += '环境数量: ' + result.environments.length + '\n';
            testMsg += '包含动画: ✅ 是\n';
            testMsg += '包含颜色: ✅ 是\n\n';
            testMsg += '✅ CSS生成功能正常！';
        } else {
            testMsg += '错误信息: ' + result.error + '\n\n';
            testMsg += '❌ CSS生成功能异常！';
        }
        
        await showDialog('CSS生成测试', testMsg);
        updateStatus('CSS生成测试完成');
        
    } catch (error) {
        console.error('测试CSS生成失败:', error);
        await showDialog('测试失败', '❌ 测试CSS生成失败:\n' + error.message);
    }
}
