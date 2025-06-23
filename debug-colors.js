// 调试环境颜色问题

// 调试环境颜色函数
async function debugEnvironmentColors() {
    console.log('🎨 调试环境颜色配置...');
    
    try {
        const result = await browser.storage.local.get(['aws_environments']);
        const environments = result.aws_environments || [];
        
        console.log('环境总数:', environments.length);
        
        environments.forEach((env, index) => {
            console.log(`环境 ${index + 1}:`, {
                name: env.name,
                color: env.color,
                icon: env.icon,
                id: env.id
            });
        });
        
        // 显示调试信息
        let debugInfo = '🎨 环境颜色调试信息:\n\n';
        debugInfo += '环境总数: ' + environments.length + '\n\n';
        
        environments.forEach((env, index) => {
            debugInfo += (index + 1) + '. ' + env.name + '\n';
            debugInfo += '   颜色: ' + (env.color || '未设置') + '\n';
            debugInfo += '   图标: ' + (env.icon || '未设置') + '\n';
            debugInfo += '   ID: ' + env.id + '\n\n';
        });
        
        await showDialog('颜色调试信息', debugInfo);
        
    } catch (error) {
        console.error('调试颜色失败:', error);
        await showDialog('调试失败', '❌ 调试颜色失败: ' + error.message);
    }
}

// 修复环境颜色函数
async function fixEnvironmentColors() {
    console.log('🔧 修复环境颜色...');
    updateStatus('修复环境颜色中...');
    
    try {
        const result = await browser.storage.local.get(['aws_environments']);
        let environments = result.aws_environments || [];
        
        let fixedCount = 0;
        
        environments.forEach(env => {
            // 根据环境ID或名称设置正确的颜色
            if (!env.color || env.color === '#dc3545') {
                if (env.id === 'production' || env.name.includes('生产')) {
                    env.color = '#dc3545'; // 红色
                    env.icon = '🔴';
                } else if (env.id === 'development' || env.name.includes('开发')) {
                    env.color = '#28a745'; // 绿色
                    env.icon = '🟢';
                } else if (env.id === 'staging' || env.name.includes('测试')) {
                    env.color = '#007bff'; // 蓝色
                    env.icon = '🔵';
                } else {
                    env.color = '#28a745'; // 默认绿色
                    env.icon = '🆕';
                }
                fixedCount++;
            }
        });
        
        // 保存修复后的环境
        await browser.storage.local.set({
            'aws_environments': environments,
            'color_fix_timestamp': Date.now()
        });
        
        console.log('颜色修复完成，修复了', fixedCount, '个环境');
        updateStatus('颜色修复完成');
        
        await showDialog('修复完成', 
            '✅ 环境颜色修复完成！\n\n' +
            '修复环境数: ' + fixedCount + '\n' +
            '总环境数: ' + environments.length + '\n\n' +
            '现在每个环境都有正确的颜色了！'
        );
        
        // 刷新环境列表
        loadEnvironments();
        
    } catch (error) {
        console.error('修复颜色失败:', error);
        updateStatus('修复颜色失败');
        await showDialog('修复失败', '❌ 修复颜色失败: ' + error.message);
    }
}
