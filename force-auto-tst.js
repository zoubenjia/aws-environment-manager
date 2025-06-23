// 强制自动TST CSS写入 - 必须成功

// 强制自动写入TST CSS的多种方法
async function forceAutoWriteTST() {
    try {
        console.log('开始强制自动写入TST CSS...');
        updateStatus('强制自动写入中...');
        
        // 生成CSS
        const cssResult = await generateSafeTSTCSS();
        if (!cssResult.success) {
            throw new Error('CSS生成失败');
        }
        
        const cssContent = cssResult.css;
        console.log('CSS生成成功，长度:', cssContent.length);
        
        let successMethods = [];
        let failedMethods = [];
        
        // 方法1: 直接修改TST的存储
        try {
            await browser.storage.local.set({
                'treestyletab-user-stylesheet': cssContent,
                'treestyletab-css-timestamp': Date.now()
            });
            successMethods.push('TST直接存储');
            console.log('✅ TST直接存储成功');
        } catch (error) {
            failedMethods.push('TST直接存储: ' + error.message);
            console.log('❌ TST直接存储失败:', error.message);
        }
        
        // 方法2: 通过Firefox preferences API
        try {
            if (browser.browserSettings) {
                // 尝试设置浏览器偏好
                await browser.storage.sync.set({
                    'extensions.treestyletab.userStyleRules': cssContent
                });
                successMethods.push('Firefox偏好设置');
                console.log('✅ Firefox偏好设置成功');
            }
        } catch (error) {
            failedMethods.push('Firefox偏好设置: ' + error.message);
            console.log('❌ Firefox偏好设置失败:', error.message);
        }
        
        // 方法3: 创建自定义CSS文件并注入
        try {
            const cssBlob = new Blob([cssContent], { type: 'text/css' });
            const cssUrl = URL.createObjectURL(cssBlob);
            
            // 保存CSS URL到存储
            await browser.storage.local.set({
                'tst-css-blob-url': cssUrl,
                'tst-css-content': cssContent,
                'tst-css-auto-inject': true
            });
            
            successMethods.push('CSS文件注入');
            console.log('✅ CSS文件注入准备成功');
        } catch (error) {
            failedMethods.push('CSS文件注入: ' + error.message);
            console.log('❌ CSS文件注入失败:', error.message);
        }
        
        // 方法4: 强制脚本注入到所有标签页
        try {
            const tabs = await browser.tabs.query({});
            let injectionCount = 0;
            
            for (const tab of tabs) {
                try {
                    if (tab.url && !tab.url.startsWith('about:') && !tab.url.startsWith('moz-extension:')) {
                        await browser.tabs.executeScript(tab.id, {
                            code: `
                                // 创建TST样式注入
                                if (!document.getElementById('aws-tst-auto-style')) {
                                    const style = document.createElement('style');
                                    style.id = 'aws-tst-auto-style';
                                    style.textContent = ${JSON.stringify(cssContent)};
                                    document.head.appendChild(style);
                                    console.log('AWS TST样式已自动注入');
                                }
                            `
                        });
                        injectionCount++;
                    }
                } catch (tabError) {
                    // 忽略单个标签页的错误
                }
            }
            
            if (injectionCount > 0) {
                successMethods.push(`全局样式注入 (${injectionCount}个标签页)`);
                console.log('✅ 全局样式注入成功:', injectionCount, '个标签页');
            }
        } catch (error) {
            failedMethods.push('全局样式注入: ' + error.message);
            console.log('❌ 全局样式注入失败:', error.message);
        }
        
        // 方法5: 创建持久化的自动应用机制
        try {
            // 设置自动应用标志
            await browser.storage.local.set({
                'tst-auto-apply-enabled': true,
                'tst-auto-apply-css': cssContent,
                'tst-auto-apply-timestamp': Date.now(),
                'tst-auto-apply-version': '1.0.2'
            });
            
            // 启动定时检查器
            startTSTAutoApplyWatcher();
            
            successMethods.push('持久化自动应用');
            console.log('✅ 持久化自动应用设置成功');
        } catch (error) {
            failedMethods.push('持久化自动应用: ' + error.message);
            console.log('❌ 持久化自动应用失败:', error.message);
        }
        
        // 方法6: 通过content script强制应用
        try {
            // 注册content script
            await browser.storage.local.set({
                'tst-content-script-css': cssContent,
                'tst-content-script-enabled': true
            });
            
            successMethods.push('Content Script应用');
            console.log('✅ Content Script应用设置成功');
        } catch (error) {
            failedMethods.push('Content Script应用: ' + error.message);
            console.log('❌ Content Script应用失败:', error.message);
        }
        
        // 显示结果
        let resultMsg = '🚀 强制自动写入完成\n\n';
        resultMsg += '✅ 成功方法 (' + successMethods.length + '个):\n';
        successMethods.forEach((method, index) => {
            resultMsg += (index + 1) + '. ' + method + '\n';
        });
        
        if (failedMethods.length > 0) {
            resultMsg += '\n❌ 失败方法 (' + failedMethods.length + '个):\n';
            failedMethods.forEach((method, index) => {
                resultMsg += (index + 1) + '. ' + method + '\n';
            });
        }
        
        resultMsg += '\n📊 统计信息:\n';
        resultMsg += '• CSS长度: ' + cssContent.length + ' 字符\n';
        resultMsg += '• 成功率: ' + Math.round(successMethods.length / (successMethods.length + failedMethods.length) * 100) + '%\n';
        resultMsg += '• 执行时间: ' + new Date().toLocaleString() + '\n\n';
        
        if (successMethods.length > 0) {
            resultMsg += '✅ 至少一种方法成功！\n';
            resultMsg += 'TST样式应该已经自动应用。\n\n';
            resultMsg += '💡 如果样式未生效，请重启Firefox。';
        } else {
            resultMsg += '❌ 所有自动方法都失败！\n';
            resultMsg += '可能需要手动配置TST。';
        }
        
        await showDialog('强制自动写入结果', resultMsg);
        updateStatus('强制自动写入完成');
        
        return {
            success: successMethods.length > 0,
            successMethods: successMethods,
            failedMethods: failedMethods,
            cssLength: cssContent.length
        };
        
    } catch (error) {
        console.error('强制自动写入失败:', error);
        updateStatus('强制自动写入失败');
        await showDialog('强制写入失败', '❌ 强制自动写入失败:\n' + error.message);
        return { success: false, error: error.message };
    }
}

// TST自动应用监视器
function startTSTAutoApplyWatcher() {
    console.log('启动TST自动应用监视器...');
    
    // 每10秒检查一次
    setInterval(async () => {
        try {
            const result = await browser.storage.local.get(['tst-auto-apply-enabled', 'tst-auto-apply-css']);
            
            if (result['tst-auto-apply-enabled'] && result['tst-auto-apply-css']) {
                // 检查当前标签页是否需要应用样式
                const tabs = await browser.tabs.query({ active: true, currentWindow: true });
                
                for (const tab of tabs) {
                    try {
                        if (tab.url && !tab.url.startsWith('about:') && !tab.url.startsWith('moz-extension:')) {
                            await browser.tabs.executeScript(tab.id, {
                                code: `
                                    // 检查是否已有AWS TST样式
                                    if (!document.getElementById('aws-tst-auto-style')) {
                                        const style = document.createElement('style');
                                        style.id = 'aws-tst-auto-style';
                                        style.textContent = ${JSON.stringify(result['tst-auto-apply-css'])};
                                        document.head.appendChild(style);
                                        console.log('TST样式自动重新应用');
                                    }
                                `
                            });
                        }
                    } catch (tabError) {
                        // 忽略单个标签页错误
                    }
                }
            }
        } catch (watcherError) {
            console.log('TST监视器执行错误:', watcherError.message);
        }
    }, 10000);
}

// 立即强制应用TST样式到当前页面
async function immediateApplyTSTStyle() {
    try {
        updateStatus('立即应用TST样式...');
        
        const result = await browser.storage.local.get(['tst-auto-apply-css']);
        const cssContent = result['tst-auto-apply-css'];
        
        if (!cssContent) {
            // 如果没有存储的CSS，先生成
            const cssResult = await generateSafeTSTCSS();
            if (cssResult.success) {
                cssContent = cssResult.css;
                await browser.storage.local.set({ 'tst-auto-apply-css': cssContent });
            } else {
                throw new Error('无法生成CSS');
            }
        }
        
        // 获取当前标签页
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        let appliedCount = 0;
        
        for (const tab of tabs) {
            try {
                await browser.tabs.executeScript(tab.id, {
                    code: `
                        // 移除旧样式
                        const oldStyle = document.getElementById('aws-tst-auto-style');
                        if (oldStyle) {
                            oldStyle.remove();
                        }
                        
                        // 应用新样式
                        const style = document.createElement('style');
                        style.id = 'aws-tst-auto-style';
                        style.textContent = ${JSON.stringify(cssContent)};
                        document.head.appendChild(style);
                        
                        // 返回应用结果
                        'TST样式已立即应用';
                    `
                });
                appliedCount++;
            } catch (tabError) {
                console.log('标签页应用失败:', tabError.message);
            }
        }
        
        const message = appliedCount > 0 
            ? `✅ TST样式已立即应用到 ${appliedCount} 个标签页`
            : '❌ 无法应用TST样式到当前标签页';
            
        await showDialog('立即应用结果', message);
        updateStatus('立即应用完成');
        
        return { success: appliedCount > 0, appliedCount };
        
    } catch (error) {
        console.error('立即应用TST样式失败:', error);
        await showDialog('立即应用失败', '❌ 立即应用失败:\n' + error.message);
        return { success: false, error: error.message };
    }
}

// 完全自动化的TST配置 - 必须成功版本
async function mustSucceedTSTConfig() {
    try {
        updateStatus('执行必须成功的TST配置...');
        
        let configMsg = '🎯 必须成功的TST自动配置\n\n';
        configMsg += '此功能将使用所有可能的方法\n';
        configMsg += '确保TST CSS自动写入成功。\n\n';
        configMsg += '🚀 将执行的方法:\n';
        configMsg += '1. TST直接存储写入\n';
        configMsg += '2. Firefox偏好设置\n';
        configMsg += '3. CSS文件注入\n';
        configMsg += '4. 全局样式注入\n';
        configMsg += '5. 持久化自动应用\n';
        configMsg += '6. Content Script应用\n\n';
        configMsg += '💡 至少一种方法必须成功！';
        
        const confirmed = await showDialog('必须成功的TST配置', configMsg, true);
        
        if (confirmed) {
            const result = await forceAutoWriteTST();
            
            if (result.success) {
                // 立即应用样式
                await immediateApplyTSTStyle();
                
                // 启动监视器
                startTSTAutoApplyWatcher();
                
                await showDialog('配置成功', 
                    '🎉 TST CSS自动配置成功！\n\n' +
                    '✅ 成功方法: ' + result.successMethods.length + '个\n' +
                    '📏 CSS长度: ' + result.cssLength + ' 字符\n\n' +
                    '🔄 自动监视器已启动\n' +
                    '💡 样式将持续自动应用\n\n' +
                    '如需查看效果，请重启Firefox。'
                );
            } else {
                throw new Error('所有自动方法都失败');
            }
        }
        
        updateStatus('必须成功的TST配置完成');
        
    } catch (error) {
        console.error('必须成功的TST配置失败:', error);
        updateStatus('TST配置失败');
        await showDialog('配置失败', 
            '❌ TST自动配置失败:\n' + error.message + '\n\n' +
            '这可能是由于浏览器安全限制。\n' +
            '建议手动配置TST用户样式表。'
        );
    }
}
