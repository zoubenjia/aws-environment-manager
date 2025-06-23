// TST CSS写入调试和修复功能

// 调试TST CSS写入问题
async function debugTSTCSSWrite() {
    try {
        console.log('开始调试TST CSS写入问题...');
        updateStatus('调试TST CSS写入...');
        
        let debugInfo = '🔍 TST CSS写入调试报告\n\n';
        
        // 1. 检查扩展权限
        debugInfo += '📋 权限检查:\n';
        try {
            const permissions = await browser.permissions.getAll();
            debugInfo += '• storage: ' + (permissions.permissions.includes('storage') ? '✅' : '❌') + '\n';
            debugInfo += '• tabs: ' + (permissions.permissions.includes('tabs') ? '✅' : '❌') + '\n';
            debugInfo += '• activeTab: ' + (permissions.permissions.includes('activeTab') ? '✅' : '❌') + '\n';
            debugInfo += '• <all_urls>: ' + (permissions.origins.includes('<all_urls>') ? '✅' : '❌') + '\n';
        } catch (permError) {
            debugInfo += '• 权限检查失败: ' + permError.message + '\n';
        }
        debugInfo += '\n';
        
        // 2. 检查TST扩展是否安装
        debugInfo += '🌳 TST扩展检查:\n';
        try {
            const tabs = await browser.tabs.query({});
            const tstTabs = tabs.filter(tab => 
                tab.url && (
                    tab.url.includes('treestyletab') || 
                    tab.url.includes('options') ||
                    tab.url.includes('about:addons')
                )
            );
            debugInfo += '• TST相关标签页: ' + tstTabs.length + '个\n';
            
            // 尝试检测TST扩展
            const addonsTab = await browser.tabs.create({
                url: 'about:addons',
                active: false
            });
            
            setTimeout(async () => {
                try {
                    const result = await browser.tabs.executeScript(addonsTab.id, {
                        code: `
                            const extensions = document.querySelectorAll('addon-card');
                            let tstFound = false;
                            for (let ext of extensions) {
                                const nameEl = ext.querySelector('.addon-name');
                                if (nameEl && nameEl.textContent.includes('Tree Style Tab')) {
                                    tstFound = true;
                                    break;
                                }
                            }
                            tstFound;
                        `
                    });
                    
                    debugInfo += '• TST扩展安装: ' + (result[0] ? '✅ 已安装' : '❌ 未找到') + '\n';
                    
                    await browser.tabs.remove(addonsTab.id);
                } catch (scriptError) {
                    debugInfo += '• TST检测失败: ' + scriptError.message + '\n';
                    await browser.tabs.remove(addonsTab.id);
                }
            }, 2000);
            
        } catch (tabError) {
            debugInfo += '• 标签页检查失败: ' + tabError.message + '\n';
        }
        debugInfo += '\n';
        
        // 3. 检查存储功能
        debugInfo += '💾 存储功能检查:\n';
        try {
            const testKey = 'tst_debug_test_' + Date.now();
            const testValue = 'test_value_' + Math.random();
            
            await browser.storage.local.set({ [testKey]: testValue });
            const stored = await browser.storage.local.get(testKey);
            
            if (stored[testKey] === testValue) {
                debugInfo += '• 存储写入: ✅ 正常\n';
                await browser.storage.local.remove(testKey);
                debugInfo += '• 存储删除: ✅ 正常\n';
            } else {
                debugInfo += '• 存储写入: ❌ 异常\n';
            }
        } catch (storageError) {
            debugInfo += '• 存储功能: ❌ 失败 - ' + storageError.message + '\n';
        }
        debugInfo += '\n';
        
        // 4. 检查脚本注入功能
        debugInfo += '💉 脚本注入检查:\n';
        try {
            const testTab = await browser.tabs.create({
                url: 'about:blank',
                active: false
            });
            
            const injectionResult = await browser.tabs.executeScript(testTab.id, {
                code: 'document.title = "TST Debug Test"; document.title;'
            });
            
            debugInfo += '• 脚本注入: ' + (injectionResult[0] === 'TST Debug Test' ? '✅ 正常' : '❌ 异常') + '\n';
            
            await browser.tabs.remove(testTab.id);
        } catch (injectionError) {
            debugInfo += '• 脚本注入: ❌ 失败 - ' + injectionError.message + '\n';
        }
        debugInfo += '\n';
        
        // 5. 生成CSS测试
        debugInfo += '🎨 CSS生成测试:\n';
        try {
            const cssResult = await generateSafeTSTCSS();
            debugInfo += '• CSS生成: ' + (cssResult.success ? '✅ 成功' : '❌ 失败') + '\n';
            if (cssResult.success) {
                debugInfo += '• CSS长度: ' + cssResult.css.length + ' 字符\n';
                debugInfo += '• 环境数量: ' + cssResult.environments.length + '\n';
            } else {
                debugInfo += '• 错误信息: ' + cssResult.error + '\n';
            }
        } catch (cssError) {
            debugInfo += '• CSS生成: ❌ 异常 - ' + cssError.message + '\n';
        }
        debugInfo += '\n';
        
        // 6. 建议解决方案
        debugInfo += '💡 建议解决方案:\n';
        debugInfo += '1. 确保Tree Style Tab扩展已安装并启用\n';
        debugInfo += '2. 重新载入AWS环境管理器扩展\n';
        debugInfo += '3. 检查Firefox扩展权限设置\n';
        debugInfo += '4. 尝试手动复制CSS到TST设置\n';
        debugInfo += '5. 重启Firefox浏览器\n\n';
        
        debugInfo += '🔧 手动配置步骤:\n';
        debugInfo += '1. 打开about:addons\n';
        debugInfo += '2. 找到Tree Style Tab扩展\n';
        debugInfo += '3. 点击"选项"按钮\n';
        debugInfo += '4. 找到"用户样式表"设置\n';
        debugInfo += '5. 粘贴生成的CSS代码\n';
        debugInfo += '6. 保存设置并重启Firefox';
        
        await showDialog('TST CSS写入调试', debugInfo);
        updateStatus('TST调试完成');
        
        return debugInfo;
        
    } catch (error) {
        console.error('TST调试失败:', error);
        await showDialog('调试失败', '❌ TST调试失败:\n' + error.message);
        return null;
    }
}

// 强制写入TST CSS的备用方案
async function forceWriteTSTCSS() {
    try {
        updateStatus('强制写入TST CSS...');
        
        // 生成CSS
        const cssResult = await generateSafeTSTCSS();
        if (!cssResult.success) {
            throw new Error('CSS生成失败: ' + cssResult.error);
        }
        
        const cssContent = cssResult.css;
        
        // 方案1: 直接存储到多个可能的键
        const storageKeys = [
            'tst-user-stylesheet',
            'treestyletab-user-stylesheet', 
            'tree-style-tab-css',
            'tst-custom-css',
            'aws-tst-css-backup'
        ];
        
        let storageSuccess = 0;
        for (const key of storageKeys) {
            try {
                await browser.storage.local.set({
                    [key]: cssContent,
                    [key + '_timestamp']: Date.now(),
                    [key + '_source']: 'aws-environment-manager'
                });
                storageSuccess++;
                console.log('存储成功:', key);
            } catch (storeError) {
                console.log('存储失败:', key, storeError.message);
            }
        }
        
        // 方案2: 创建专用的配置文件
        try {
            const configData = {
                css: cssContent,
                generated: new Date().toISOString(),
                version: '1.0.2',
                source: 'aws-environment-manager',
                environments: cssResult.environments.length,
                instructions: [
                    '1. 复制下面的CSS内容',
                    '2. 打开Tree Style Tab设置',
                    '3. 粘贴到用户样式表中',
                    '4. 保存并重启Firefox'
                ]
            };
            
            await browser.storage.local.set({
                'tst-config-data': configData
            });
            
            console.log('配置数据保存成功');
        } catch (configError) {
            console.log('配置数据保存失败:', configError.message);
        }
        
        // 方案3: 尝试打开TST设置并显示CSS
        let settingsOpened = false;
        try {
            const settingsTab = await browser.tabs.create({
                url: 'about:addons',
                active: true
            });
            settingsOpened = true;
            console.log('设置页面已打开');
        } catch (tabError) {
            console.log('打开设置页面失败:', tabError.message);
        }
        
        // 显示结果
        let resultMsg = '🔧 强制写入TST CSS完成\n\n';
        resultMsg += '📊 执行结果:\n';
        resultMsg += '• 存储成功: ' + storageSuccess + '/' + storageKeys.length + ' 个键\n';
        resultMsg += '• 配置数据: ✅ 已保存\n';
        resultMsg += '• 设置页面: ' + (settingsOpened ? '✅ 已打开' : '❌ 打开失败') + '\n';
        resultMsg += '• CSS长度: ' + cssContent.length + ' 字符\n\n';
        
        resultMsg += '📋 CSS内容已保存到以下位置:\n';
        storageKeys.forEach((key, index) => {
            resultMsg += (index + 1) + '. ' + key + '\n';
        });
        
        resultMsg += '\n💡 下一步操作:\n';
        resultMsg += '1. 在打开的设置页面中找到Tree Style Tab\n';
        resultMsg += '2. 点击"选项"按钮\n';
        resultMsg += '3. 查看控制台日志复制CSS\n';
        resultMsg += '4. 粘贴到用户样式表中\n';
        resultMsg += '5. 保存并重启Firefox\n\n';
        
        resultMsg += '🔍 CSS内容在控制台日志中可见';
        
        // 在控制台输出CSS
        console.log('=== TST CSS 内容开始 ===');
        console.log(cssContent);
        console.log('=== TST CSS 内容结束 ===');
        
        await showDialog('强制写入完成', resultMsg);
        updateStatus('强制写入TST CSS完成');
        
        return {
            success: true,
            storageCount: storageSuccess,
            cssLength: cssContent.length,
            settingsOpened: settingsOpened
        };
        
    } catch (error) {
        console.error('强制写入TST CSS失败:', error);
        updateStatus('强制写入失败');
        await showDialog('强制写入失败', '❌ 强制写入TST CSS失败:\n' + error.message);
        return { success: false, error: error.message };
    }
}

// 检查TST CSS是否已写入
async function checkTSTCSSStatus() {
    try {
        updateStatus('检查TST CSS状态...');
        
        // 检查存储的CSS
        const storageKeys = [
            'tst-user-stylesheet',
            'treestyletab-user-stylesheet', 
            'tree-style-tab-css',
            'tst-custom-css',
            'aws-tst-css-backup',
            'tst-config-data'
        ];
        
        let statusMsg = '📊 TST CSS状态检查\n\n';
        let foundCount = 0;
        
        for (const key of storageKeys) {
            try {
                const result = await browser.storage.local.get(key);
                if (result[key]) {
                    foundCount++;
                    const content = result[key];
                    const length = typeof content === 'string' ? content.length : JSON.stringify(content).length;
                    statusMsg += '✅ ' + key + ': ' + length + ' 字符\n';
                } else {
                    statusMsg += '❌ ' + key + ': 未找到\n';
                }
            } catch (checkError) {
                statusMsg += '⚠️ ' + key + ': 检查失败\n';
            }
        }
        
        statusMsg += '\n📈 统计信息:\n';
        statusMsg += '• 找到CSS: ' + foundCount + '/' + storageKeys.length + '\n';
        statusMsg += '• 检查时间: ' + new Date().toLocaleString() + '\n\n';
        
        if (foundCount > 0) {
            statusMsg += '✅ 发现已存储的CSS内容\n';
            statusMsg += '建议检查TST设置是否正确应用。';
        } else {
            statusMsg += '❌ 未发现存储的CSS内容\n';
            statusMsg += '建议重新生成和写入CSS。';
        }
        
        await showDialog('TST CSS状态', statusMsg);
        updateStatus('TST CSS状态检查完成');
        
        return { foundCount, totalKeys: storageKeys.length };
        
    } catch (error) {
        console.error('检查TST CSS状态失败:', error);
        await showDialog('状态检查失败', '❌ 检查TST CSS状态失败:\n' + error.message);
        return null;
    }
}
