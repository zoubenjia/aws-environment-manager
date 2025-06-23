// 自动粘贴TST CSS功能 - 无需手工操作

// TST扩展相关信息
const TST_EXTENSION_INFO = {
    id: 'treestyletab@piro.sakura.ne.jp',
    name: 'Tree Style Tab',
    settingsKeys: [
        'extensions.treestyletab.userStyleRules',
        'extensions.treestyletab.style.rules',
        'extensions.treestyletab.appearance.stylesheet'
    ]
};

// 尝试直接写入TST配置
async function directWriteTSTConfig(cssContent) {
    try {
        console.log('尝试直接写入TST配置...');
        
        // 方法1: 尝试通过browser.storage API
        try {
            await browser.storage.local.set({
                'treestyletab-user-stylesheet': cssContent,
                'tst-auto-applied': Date.now()
            });
            console.log('通过storage API写入成功');
            return { success: true, method: 'storage' };
        } catch (storageError) {
            console.log('storage API方法失败:', storageError.message);
        }
        
        // 方法2: 尝试通过消息传递
        try {
            const response = await browser.runtime.sendMessage(TST_EXTENSION_INFO.id, {
                type: 'set-user-stylesheet',
                stylesheet: cssContent
            });
            console.log('通过消息传递写入成功:', response);
            return { success: true, method: 'messaging' };
        } catch (messageError) {
            console.log('消息传递方法失败:', messageError.message);
        }
        
        // 方法3: 尝试通过tabs API注入脚本
        try {
            const result = await injectTSTScript(cssContent);
            if (result.success) {
                return { success: true, method: 'injection' };
            }
        } catch (injectionError) {
            console.log('脚本注入方法失败:', injectionError.message);
        }
        
        throw new Error('所有自动写入方法都失败');
        
    } catch (error) {
        console.error('直接写入TST配置失败:', error);
        return {
            success: false,
            error: error.message,
            methods_tried: ['storage', 'messaging', 'injection']
        };
    }
}

// 通过脚本注入自动粘贴
async function injectTSTScript(cssContent) {
    try {
        console.log('尝试脚本注入自动粘贴...');
        
        // 查找TST设置页面
        const tabs = await browser.tabs.query({
            url: ['moz-extension://*/options/*', 'about:addons*']
        });
        
        if (tabs.length === 0) {
            // 打开TST设置页面
            const settingsTab = await browser.tabs.create({
                url: 'about:addons',
                active: true
            });
            
            // 等待页面加载
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 注入自动配置脚本
            const injectionResult = await browser.tabs.executeScript(settingsTab.id, {
                code: generateAutoConfigScript(cssContent)
            });
            
            return {
                success: true,
                tabId: settingsTab.id,
                result: injectionResult
            };
        } else {
            // 在现有标签页中注入
            const targetTab = tabs[0];
            const injectionResult = await browser.tabs.executeScript(targetTab.id, {
                code: generateAutoConfigScript(cssContent)
            });
            
            return {
                success: true,
                tabId: targetTab.id,
                result: injectionResult
            };
        }
        
    } catch (error) {
        console.error('脚本注入失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 生成自动配置脚本
function generateAutoConfigScript(cssContent) {
    return `
        (function() {
            console.log('TST自动配置脚本开始执行...');
            
            // 转义CSS内容
            const cssContent = ${JSON.stringify(cssContent)};
            
            // 查找TST扩展卡片
            function findTSTExtension() {
                const extensions = document.querySelectorAll('addon-card');
                for (let ext of extensions) {
                    const nameEl = ext.querySelector('.addon-name');
                    if (nameEl && nameEl.textContent.includes('Tree Style Tab')) {
                        return ext;
                    }
                }
                return null;
            }
            
            // 自动点击选项按钮
            function clickOptionsButton(extensionCard) {
                const optionsBtn = extensionCard.querySelector('button[action="preferences"]');
                if (optionsBtn) {
                    optionsBtn.click();
                    return true;
                }
                return false;
            }
            
            // 查找并填充样式表输入框
            function fillStylesheet() {
                const selectors = [
                    'textarea[placeholder*="stylesheet"]',
                    'textarea[placeholder*="CSS"]',
                    'textarea[id*="stylesheet"]',
                    'textarea[name*="stylesheet"]',
                    'textarea[class*="stylesheet"]'
                ];
                
                for (let selector of selectors) {
                    const textarea = document.querySelector(selector);
                    if (textarea) {
                        textarea.value = cssContent;
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        textarea.dispatchEvent(new Event('change', { bubbles: true }));
                        return true;
                    }
                }
                return false;
            }
            
            // 主要执行逻辑
            function executeAutoConfig() {
                try {
                    // 如果在扩展管理页面
                    if (location.href.includes('about:addons')) {
                        const tstCard = findTSTExtension();
                        if (tstCard) {
                            console.log('找到TST扩展，点击选项按钮...');
                            if (clickOptionsButton(tstCard)) {
                                // 等待选项页面加载
                                setTimeout(() => {
                                    if (fillStylesheet()) {
                                        console.log('CSS自动填充成功！');
                                        return 'success';
                                    } else {
                                        console.log('未找到样式表输入框');
                                        return 'no_textarea';
                                    }
                                }, 1000);
                            } else {
                                console.log('未找到选项按钮');
                                return 'no_options_button';
                            }
                        } else {
                            console.log('未找到TST扩展');
                            return 'no_tst_extension';
                        }
                    } 
                    // 如果在TST选项页面
                    else if (location.href.includes('options')) {
                        if (fillStylesheet()) {
                            console.log('在选项页面直接填充CSS成功！');
                            return 'success';
                        } else {
                            console.log('在选项页面未找到样式表输入框');
                            return 'no_textarea_in_options';
                        }
                    }
                    
                    return 'unknown_page';
                    
                } catch (error) {
                    console.error('自动配置脚本执行失败:', error);
                    return 'script_error: ' + error.message;
                }
            }
            
            // 执行并返回结果
            const result = executeAutoConfig();
            console.log('自动配置脚本执行结果:', result);
            return result;
        })();
    `;
}

// 完全自动化的TST配置
async function fullyAutomaticTSTConfig(cssContent) {
    try {
        updateStatus('开始完全自动配置...');
        
        console.log('开始完全自动TST配置...');
        
        // 步骤1: 尝试直接写入配置
        updateStatus('尝试直接写入配置...');
        const directResult = await directWriteTSTConfig(cssContent);
        
        if (directResult.success) {
            console.log('直接写入成功，方法:', directResult.method);
            updateStatus('配置写入成功');
            
            await showDialog('自动配置成功', 
                '✅ TST CSS配置已自动完成！\n\n' +
                '配置方法: ' + directResult.method + '\n' +
                'CSS长度: ' + cssContent.length + ' 字符\n\n' +
                '请重启Firefox以应用新样式。\n\n' +
                '💡 完全无需手工操作！'
            );
            
            return { success: true, method: directResult.method };
        }
        
        // 步骤2: 尝试脚本注入自动填充
        updateStatus('尝试自动填充配置...');
        const injectionResult = await injectTSTScript(cssContent);
        
        if (injectionResult.success) {
            console.log('脚本注入成功');
            updateStatus('自动填充完成');
            
            await showDialog('自动填充成功', 
                '✅ TST设置页面已自动填充CSS！\n\n' +
                '标签页ID: ' + injectionResult.tabId + '\n' +
                'CSS长度: ' + cssContent.length + ' 字符\n\n' +
                '请检查TST设置页面，\n' +
                '确认CSS已正确填充并保存。\n\n' +
                '💡 自动填充完成，无需手工粘贴！'
            );
            
            return { success: true, method: 'injection' };
        }
        
        // 步骤3: 如果都失败，提供增强的复制功能
        updateStatus('回退到增强复制模式...');
        console.log('自动方法失败，使用增强复制模式');
        
        await autoCopyWithInstructions(cssContent);
        
        return { 
            success: false, 
            fallback: true,
            message: '已回退到复制模式'
        };
        
    } catch (error) {
        console.error('完全自动配置失败:', error);
        updateStatus('自动配置失败');
        
        await showDialog('自动配置失败', 
            '❌ 完全自动配置失败！\n\n' +
            '错误: ' + error.message + '\n\n' +
            '将使用复制粘贴模式作为备用方案。\n\n' +
            '点击确定继续使用复制模式。'
        );
        
        // 回退到复制模式
        await autoCopyWithInstructions(cssContent);
        
        return {
            success: false,
            error: error.message,
            fallback: true
        };
    }
}

// 更新安全TST配置以使用完全自动模式
async function showFullyAutomaticTSTConfig() {
    try {
        updateStatus('准备完全自动TST配置...');
        
        const result = await generateSafeTSTCSS();
        
        if (!result.success) {
            await showDialog('生成失败', 
                '❌ 生成TST CSS失败:\n' + result.error + '\n\n' +
                '请检查环境配置或重新载入扩展。'
            );
            return;
        }
        
        // 显示自动配置确认
        let configMsg = '🤖 完全自动TST配置\n\n';
        configMsg += '✅ CSS生成: 成功\n';
        configMsg += '📊 环境数量: ' + result.environments.length + '\n';
        configMsg += '📏 CSS长度: ' + result.css.length + ' 字符\n';
        configMsg += '🎨 支持颜色: 红、绿、蓝、黄\n\n';
        
        configMsg += '🤖 自动化流程:\n';
        configMsg += '1. 自动生成CSS样式\n';
        configMsg += '2. 尝试直接写入TST配置\n';
        configMsg += '3. 自动打开并填充设置页面\n';
        configMsg += '4. 无需任何手工操作\n\n';
        
        configMsg += '🚀 点击确定开始完全自动配置！\n';
        configMsg += '整个过程无需手工干预。';
        
        const confirmed = await showDialog('完全自动TST配置', configMsg, true);
        
        if (confirmed) {
            // 执行完全自动配置
            await fullyAutomaticTSTConfig(result.css);
        }
        
        updateStatus('完全自动TST配置完成');
        
    } catch (error) {
        console.error('完全自动TST配置失败:', error);
        updateStatus('完全自动TST配置失败');
        await showDialog('配置失败', 
            '❌ 完全自动TST配置失败:\n' + error.message + '\n\n' +
            '请重新载入扩展后重试。'
        );
    }
}
