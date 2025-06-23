// TST CSS导出功能

// 创建可下载的CSS文件
function createDownloadableCSS(cssContent, filename = 'aws-tst-styles.css') {
    try {
        // 添加文件头注释
        const header = `/*
 * AWS环境管理器 - Tree Style Tab 样式
 * 自动生成时间: ${new Date().toLocaleString()}
 * 
 * 使用方法:
 * 1. 将此文件内容复制到TST的用户样式表中
 * 2. 或者将此文件保存并在TST设置中导入
 * 3. 重启Firefox以应用样式
 * 
 * 注意: 此文件会根据AWS环境配置自动更新
 */

`;
        
        const fullCSS = header + cssContent;
        
        // 创建Blob对象
        const blob = new Blob([fullCSS], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        
        return {
            url: url,
            filename: filename,
            size: fullCSS.length,
            content: fullCSS
        };
        
    } catch (error) {
        console.error('创建可下载CSS失败:', error);
        throw error;
    }
}

// 显示CSS内容对话框
async function showCSSContentDialog(cssContent) {
    try {
        // 创建一个特殊的对话框显示CSS内容
        const overlay = document.getElementById('cssDialog') || createCSSDialog();
        const contentEl = document.getElementById('cssDialogContent');
        const copyBtn = document.getElementById('cssDialogCopy');
        const closeBtn = document.getElementById('cssDialogClose');
        
        // 设置CSS内容
        contentEl.textContent = cssContent;
        
        // 显示对话框
        overlay.style.display = 'flex';
        
        return new Promise((resolve) => {
            const handleCopy = async () => {
                try {
                    await navigator.clipboard.writeText(cssContent);
                    copyBtn.textContent = '✅ 已复制';
                    setTimeout(() => {
                        copyBtn.textContent = '📋 复制CSS';
                    }, 2000);
                } catch (error) {
                    console.error('复制失败:', error);
                    copyBtn.textContent = '❌ 复制失败';
                    setTimeout(() => {
                        copyBtn.textContent = '📋 复制CSS';
                    }, 2000);
                }
            };
            
            const handleClose = () => {
                overlay.style.display = 'none';
                cleanup();
                resolve();
            };
            
            const cleanup = () => {
                copyBtn.removeEventListener('click', handleCopy);
                closeBtn.removeEventListener('click', handleClose);
            };
            
            copyBtn.addEventListener('click', handleCopy);
            closeBtn.addEventListener('click', handleClose);
        });
        
    } catch (error) {
        console.error('显示CSS内容对话框失败:', error);
        // 回退到普通对话框
        await showDialog('TST CSS内容', 
            'CSS内容过长，请查看控制台日志。\n\n' +
            '或者点击🌳TST配置按钮重新生成。'
        );
    }
}

// 创建CSS显示对话框
function createCSSDialog() {
    const overlay = document.createElement('div');
    overlay.id = 'cssDialog';
    overlay.className = 'dialog-overlay';
    overlay.style.display = 'none';
    
    overlay.innerHTML = `
        <div class="dialog-box" style="width: 500px; max-width: 90%; max-height: 80%;">
            <div class="dialog-header">
                <span>🌳 TST CSS 代码</span>
                <button id="cssDialogClose" class="dialog-close">×</button>
            </div>
            <div class="dialog-content" style="padding: 0;">
                <div style="padding: 16px; border-bottom: 1px solid #ddd;">
                    <button id="cssDialogCopy" class="dialog-btn dialog-btn-ok" style="margin: 0;">
                        📋 复制CSS
                    </button>
                    <small style="margin-left: 10px; color: #666;">
                        复制后粘贴到TST用户样式表中
                    </small>
                </div>
                <pre id="cssDialogContent" style="
                    margin: 0;
                    padding: 16px;
                    background: #f8f9fa;
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    line-height: 1.4;
                    max-height: 300px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                "></pre>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    return overlay;
}

// 导出TST CSS配置
async function exportTSTCSS() {
    try {
        updateStatus('导出TST CSS配置...');
        
        // 生成最新的CSS
        const cssData = await generateDynamicTSTCSS();
        
        if (cssData.error) {
            await showDialog('导出失败', '❌ 生成TST CSS失败:\n' + cssData.error);
            return;
        }
        
        // 创建可下载的CSS
        const downloadData = createDownloadableCSS(cssData.css);
        
        // 显示导出信息
        let exportMsg = '📤 TST CSS导出完成\n\n';
        exportMsg += '📊 文件信息:\n';
        exportMsg += '• 文件大小: ' + Math.round(downloadData.size / 1024 * 100) / 100 + ' KB\n';
        exportMsg += '• CSS规则: ' + cssData.css.split('{').length + ' 个\n';
        exportMsg += '• 环境数量: ' + cssData.environments.length + '\n\n';
        
        exportMsg += '📋 使用步骤:\n';
        exportMsg += '1. 点击"查看CSS"复制代码\n';
        exportMsg += '2. 打开Tree Style Tab设置\n';
        exportMsg += '3. 找到"外观" → "用户样式表"\n';
        exportMsg += '4. 粘贴CSS代码并保存\n';
        exportMsg += '5. 重启Firefox查看效果\n\n';
        
        exportMsg += '💡 每次修改环境后记得重新导出CSS。';
        
        const confirmed = await showDialog('TST CSS导出', exportMsg, true);
        
        if (confirmed) {
            // 显示CSS内容
            await showCSSContentDialog(cssData.css);
        }
        
        updateStatus('TST CSS导出完成');
        
    } catch (error) {
        console.error('导出TST CSS失败:', error);
        updateStatus('TST CSS导出失败');
        await showDialog('导出失败', '❌ 导出TST CSS失败:\n' + error.message);
    }
}

// 检查TST CSS是否需要更新
async function checkTSTCSSUpdate() {
    try {
        const result = await browser.storage.local.get(['tst_css_hash', 'aws_environments']);
        const environments = result.aws_environments || [];
        const storedHash = result.tst_css_hash;
        
        const currentHash = generateEnvironmentHash(environments);
        
        if (storedHash !== currentHash) {
            console.log('TST CSS需要更新');
            return {
                needsUpdate: true,
                reason: '环境配置已变化'
            };
        }
        
        return {
            needsUpdate: false,
            reason: 'CSS是最新的'
        };
        
    } catch (error) {
        console.error('检查TST CSS更新失败:', error);
        return {
            needsUpdate: true,
            reason: '检查失败，建议更新'
        };
    }
}
