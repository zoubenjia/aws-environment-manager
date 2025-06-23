// 自动复制粘贴CSS功能

// 自动复制CSS到剪贴板
async function autoCopyCSS(cssContent) {
    try {
        console.log('自动复制CSS到剪贴板...');
        
        if (!cssContent || typeof cssContent !== 'string') {
            throw new Error('CSS内容无效');
        }
        
        // 检查剪贴板API是否可用
        if (!navigator.clipboard) {
            throw new Error('剪贴板API不可用');
        }
        
        // 复制到剪贴板
        await navigator.clipboard.writeText(cssContent);
        
        console.log('CSS已成功复制到剪贴板');
        return {
            success: true,
            message: 'CSS已复制到剪贴板',
            length: cssContent.length
        };
        
    } catch (error) {
        console.error('自动复制CSS失败:', error);
        
        // 尝试备用复制方法
        try {
            const textArea = document.createElement('textarea');
            textArea.value = cssContent;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            console.log('使用备用方法复制成功');
            return {
                success: true,
                message: 'CSS已复制到剪贴板 (备用方法)',
                length: cssContent.length
            };
            
        } catch (fallbackError) {
            console.error('备用复制方法也失败:', fallbackError);
            return {
                success: false,
                error: error.message,
                fallbackError: fallbackError.message
            };
        }
    }
}

// 尝试自动打开TST设置页面
async function autoOpenTSTSettings() {
    try {
        console.log('尝试自动打开TST设置...');
        
        // TST扩展的设置页面URL
        const tstSettingsUrls = [
            'moz-extension://*/options/options.html',
            'about:addons',
            'chrome-extension://*/options/options.html'
        ];
        
        // 尝试打开TST设置页面
        const settingsUrl = 'about:addons';
        await browser.tabs.create({ 
            url: settingsUrl,
            active: true 
        });
        
        console.log('已打开扩展管理页面');
        return {
            success: true,
            message: '已打开扩展管理页面',
            url: settingsUrl
        };
        
    } catch (error) {
        console.error('自动打开TST设置失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 生成详细的粘贴指导
function generatePasteInstructions() {
    return {
        title: '📋 CSS粘贴指导',
        steps: [
            '1. CSS已自动复制到剪贴板',
            '2. 打开Firefox扩展管理页面 (about:addons)',
            '3. 找到"Tree Style Tab"扩展',
            '4. 点击扩展右侧的"选项"按钮',
            '5. 在设置页面找到"外观"或"Advanced"选项卡',
            '6. 找到"用户样式表"或"User Stylesheet"输入框',
            '7. 清空现有内容，粘贴CSS (Ctrl+V)',
            '8. 点击"保存"或"Apply"按钮',
            '9. 重启Firefox以应用新样式'
        ],
        tips: [
            '💡 如果找不到用户样式表选项，请检查TST版本',
            '💡 某些TST版本在"高级"选项卡中',
            '💡 粘贴后记得保存设置',
            '💡 重启Firefox后样式才会生效'
        ]
    };
}

// 自动复制并提供粘贴指导
async function autoCopyWithInstructions(cssContent) {
    try {
        updateStatus('自动复制CSS中...');
        
        // 自动复制CSS
        const copyResult = await autoCopyCSS(cssContent);
        
        if (!copyResult.success) {
            throw new Error('复制失败: ' + copyResult.error);
        }
        
        // 生成粘贴指导
        const instructions = generatePasteInstructions();
        
        // 显示成功信息和指导
        let message = '✅ CSS自动复制成功！\n\n';
        message += '📊 CSS信息:\n';
        message += '• 长度: ' + copyResult.length + ' 字符\n';
        message += '• 状态: ' + copyResult.message + '\n\n';
        
        message += '📋 下一步操作:\n';
        instructions.steps.forEach(step => {
            message += step + '\n';
        });
        
        message += '\n💡 提示:\n';
        instructions.tips.forEach(tip => {
            message += tip + '\n';
        });
        
        const openSettings = await showDialog('CSS复制成功', message, true);
        
        if (openSettings) {
            // 用户确认后自动打开设置页面
            const openResult = await autoOpenTSTSettings();
            
            if (openResult.success) {
                await showDialog('设置页面已打开', 
                    '✅ 扩展管理页面已打开！\n\n' +
                    '请按照以下步骤操作:\n' +
                    '1. 找到Tree Style Tab扩展\n' +
                    '2. 点击"选项"按钮\n' +
                    '3. 找到用户样式表设置\n' +
                    '4. 粘贴CSS (Ctrl+V)\n' +
                    '5. 保存并重启Firefox\n\n' +
                    'CSS已在剪贴板中等待粘贴。'
                );
            } else {
                await showDialog('请手动打开设置', 
                    '⚠️ 无法自动打开TST设置\n\n' +
                    '请手动执行以下操作:\n' +
                    '1. 打开about:addons\n' +
                    '2. 找到Tree Style Tab\n' +
                    '3. 点击选项按钮\n' +
                    '4. 粘贴CSS到用户样式表\n\n' +
                    'CSS已复制，可直接粘贴。'
                );
            }
        }
        
        updateStatus('CSS自动复制完成');
        return copyResult;
        
    } catch (error) {
        console.error('自动复制和指导失败:', error);
        updateStatus('CSS自动复制失败');
        
        await showDialog('自动复制失败', 
            '❌ CSS自动复制失败!\n\n' +
            '错误: ' + error.message + '\n\n' +
            '请手动复制CSS:\n' +
            '1. 查看控制台日志\n' +
            '2. 手动复制CSS代码\n' +
            '3. 粘贴到TST用户样式表\n\n' +
            '按F12打开开发者工具查看CSS。'
        );
        
        throw error;
    }
}

// 检查剪贴板权限
async function checkClipboardPermissions() {
    try {
        console.log('检查剪贴板权限...');
        
        const permissions = {
            clipboard: false,
            writeText: false,
            readText: false
        };
        
        // 检查基本剪贴板API
        if (navigator.clipboard) {
            permissions.clipboard = true;
            
            // 检查写入权限
            try {
                await navigator.clipboard.writeText('test');
                permissions.writeText = true;
                console.log('剪贴板写入权限: 可用');
            } catch (writeError) {
                console.log('剪贴板写入权限: 不可用', writeError.message);
            }
            
            // 检查读取权限
            try {
                await navigator.clipboard.readText();
                permissions.readText = true;
                console.log('剪贴板读取权限: 可用');
            } catch (readError) {
                console.log('剪贴板读取权限: 不可用', readError.message);
            }
        }
        
        return permissions;
        
    } catch (error) {
        console.error('检查剪贴板权限失败:', error);
        return {
            clipboard: false,
            writeText: false,
            readText: false,
            error: error.message
        };
    }
}

// 显示剪贴板状态
async function showClipboardStatus() {
    try {
        updateStatus('检查剪贴板状态...');
        
        const permissions = await checkClipboardPermissions();
        
        let statusMsg = '📋 剪贴板功能状态\n\n';
        statusMsg += '基础API: ' + (permissions.clipboard ? '✅ 可用' : '❌ 不可用') + '\n';
        statusMsg += '写入权限: ' + (permissions.writeText ? '✅ 可用' : '❌ 不可用') + '\n';
        statusMsg += '读取权限: ' + (permissions.readText ? '✅ 可用' : '❌ 不可用') + '\n\n';
        
        if (permissions.error) {
            statusMsg += '错误信息: ' + permissions.error + '\n\n';
        }
        
        if (permissions.writeText) {
            statusMsg += '✅ 自动复制功能可用\n';
            statusMsg += '可以自动复制CSS到剪贴板。';
        } else {
            statusMsg += '⚠️ 自动复制功能受限\n';
            statusMsg += '将使用备用复制方法。\n\n';
            statusMsg += '建议:\n';
            statusMsg += '• 允许扩展访问剪贴板\n';
            statusMsg += '• 检查浏览器权限设置\n';
            statusMsg += '• 使用HTTPS页面';
        }
        
        await showDialog('剪贴板状态', statusMsg);
        updateStatus('剪贴板状态检查完成');
        
    } catch (error) {
        console.error('显示剪贴板状态失败:', error);
        await showDialog('检查失败', '❌ 剪贴板状态检查失败:\n' + error.message);
    }
}
