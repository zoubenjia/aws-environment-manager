// 动态TST CSS生成器 - 根据扩展环境变化自动更新

// 监听环境变化并更新TST CSS
let lastEnvironmentHash = '';

// 生成环境哈希值用于检测变化
function generateEnvironmentHash(environments) {
    const envData = environments.map(env => ({
        id: env.id,
        name: env.name,
        color: env.color,
        icon: env.icon,
        containerId: env.containerId
    }));
    return btoa(JSON.stringify(envData));
}

// 根据当前环境生成动态TST CSS
async function generateDynamicTSTCSS() {
    try {
        console.log('生成动态TST CSS...');
        
        // 获取当前所有环境
        const result = await browser.storage.local.get(['aws_environments']);
        const environments = result.aws_environments || [];
        
        if (environments.length === 0) {
            return {
                css: '/* 暂无环境配置 */',
                environments: []
            };
        }
        
        let css = `/* AWS环境管理器 - 动态TST样式 */\n`;
        css += `/* 生成时间: ${new Date().toLocaleString()} */\n`;
        css += `/* 环境数量: ${environments.length} */\n\n`;
        
        // 为每个环境生成CSS规则
        environments.forEach((env, index) => {
            // 清理和验证环境数据
            const envColor = sanitizeColor(env.color || '#28a745');
            const envIcon = sanitizeIcon(env.icon || '🔹');
            const envName = sanitizeName(env.name || '未命名环境');
            
            // 计算RGB值
            const rgb = hexToRgb(envColor);
            const rgbaString = rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '40, 167, 69';
            
            css += `/* 环境 ${index + 1}: ${envName} */\n`;
            
            // 基于环境名称的选择器 - 使用属性选择器避免特殊字符问题
            css += `.tab[data-contextual-identity-name="${envName}"] {\n`;
            css += `    border-left: 3px solid ${envColor} !important;\n`;
            css += `    background: linear-gradient(90deg, rgba(${rgbaString}, 0.1) 0%, transparent 100%) !important;\n`;
            css += `}\n\n`;
            
            // 悬停效果
            css += `.tab[data-contextual-identity-name="${envName}"]:hover {\n`;
            css += `    background: linear-gradient(90deg, rgba(${rgbaString}, 0.2) 0%, transparent 100%) !important;\n`;
            css += `    box-shadow: 0 2px 4px rgba(${rgbaString}, 0.3) !important;\n`;
            css += `}\n\n`;
            
            // 激活状态
            css += `.tab[data-contextual-identity-name="${envName}"].active {\n`;
            css += `    background: linear-gradient(90deg, rgba(${rgbaString}, 0.3) 0%, transparent 100%) !important;\n`;
            css += `    border-left: 4px solid ${envColor} !important;\n`;
            css += `    font-weight: bold !important;\n`;
            css += `}\n\n`;
            
            // 图标前缀 - 使用CSS转义
            const escapedIcon = escapeCSSContent(envIcon);
            css += `.tab[data-contextual-identity-name="${envName}"] .label::before {\n`;
            css += `    content: "${escapedIcon} ";\n`;
            css += `}\n\n`;
            
            // 生产环境特殊效果
            if (env.id === 'production' || envName.includes('生产')) {
                const animationName = `production-pulse-${index}`;
                css += `.tab[data-contextual-identity-name="${envName}"] {\n`;
                css += `    animation: ${animationName} 3s infinite;\n`;
                css += `}\n\n`;
                
                css += `@keyframes ${animationName} {\n`;
                css += `    0%, 100% { border-left-color: ${envColor}; }\n`;
                css += `    50% { \n`;
                css += `        border-left-color: ${lightenColor(envColor, 20)};\n`;
                css += `        box-shadow: 0 0 10px rgba(${rgbaString}, 0.5);\n`;
                css += `    }\n`;
                css += `}\n\n`;
            }
        });
        
        // 添加通用样式
        css += `/* 通用AWS环境样式 */\n`;
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
        
        // 暗色主题适配
        css += `/* 暗色主题适配 */\n`;
        css += `@media (prefers-color-scheme: dark) {\n`;
        environments.forEach(env => {
            const envName = sanitizeName(env.name || '未命名环境');
            const rgb = hexToRgb(sanitizeColor(env.color || '#28a745'));
            const rgbaString = rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : '40, 167, 69';
            css += `    .tab[data-contextual-identity-name="${envName}"] {\n`;
            css += `        background: linear-gradient(90deg, rgba(${rgbaString}, 0.15) 0%, transparent 100%) !important;\n`;
            css += `    }\n`;
        });
        css += `}\n`;
        
        return {
            css: css,
            environments: environments,
            hash: generateEnvironmentHash(environments)
        };
        
    } catch (error) {
        console.error('生成动态TST CSS失败:', error);
        return {
            css: '/* CSS生成失败 */',
            environments: [],
            error: error.message
        };
    }
}

// 清理和验证函数
function sanitizeColor(color) {
    // 确保颜色格式正确
    if (!color || typeof color !== 'string') {
        return '#28a745';
    }
    
    // 移除无效字符，只保留十六进制颜色
    const cleanColor = color.replace(/[^#0-9a-fA-F]/g, '');
    
    // 验证十六进制颜色格式
    if (/^#[0-9a-fA-F]{6}$/.test(cleanColor)) {
        return cleanColor;
    } else if (/^#[0-9a-fA-F]{3}$/.test(cleanColor)) {
        // 转换3位十六进制到6位
        const r = cleanColor[1];
        const g = cleanColor[2];
        const b = cleanColor[3];
        return `#${r}${r}${g}${g}${b}${b}`;
    }
    
    return '#28a745'; // 默认绿色
}

function sanitizeName(name) {
    // 清理环境名称，移除可能导致CSS问题的字符
    if (!name || typeof name !== 'string') {
        return '未命名环境';
    }
    
    // 移除或替换特殊字符
    return name
        .replace(/['"\\]/g, '') // 移除引号和反斜杠
        .replace(/[\r\n\t]/g, ' ') // 替换换行符和制表符为空格
        .replace(/\s+/g, ' ') // 合并多个空格
        .trim()
        .substring(0, 50); // 限制长度
}

function sanitizeIcon(icon) {
    // 清理图标，确保是有效的emoji或字符
    if (!icon || typeof icon !== 'string') {
        return '🔹';
    }
    
    // 只保留第一个字符（通常是emoji）
    return icon.charAt(0);
}

function escapeCSSContent(content) {
    // 转义CSS content属性中的特殊字符
    if (!content || typeof content !== 'string') {
        return '';
    }
    
    return content
        .replace(/\\/g, '\\\\') // 转义反斜杠
        .replace(/"/g, '\\"')   // 转义双引号
        .replace(/'/g, "\\'")   // 转义单引号
        .replace(/\n/g, '\\A')  // 转义换行符
        .replace(/\r/g, '\\D')  // 转义回车符
        .replace(/\t/g, '\\9'); // 转义制表符
}

// 颜色工具函数
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function lightenColor(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * percent / 100));
    const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * percent / 100));
    const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * percent / 100));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 检查环境是否发生变化
async function checkEnvironmentChanges() {
    try {
        const result = await browser.storage.local.get(['aws_environments']);
        const environments = result.aws_environments || [];
        const currentHash = generateEnvironmentHash(environments);
        
        if (currentHash !== lastEnvironmentHash) {
            console.log('检测到环境变化，更新TST CSS');
            lastEnvironmentHash = currentHash;
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('检查环境变化失败:', error);
        return false;
    }
}

// 自动更新TST CSS
async function autoUpdateTSTCSS() {
    try {
        const hasChanges = await checkEnvironmentChanges();
        
        if (hasChanges) {
            console.log('环境已变化，生成新的TST CSS');
            const cssData = await generateDynamicTSTCSS();
            
            // 保存生成的CSS到存储
            await browser.storage.local.set({
                'tst_css': cssData.css,
                'tst_css_generated': Date.now(),
                'tst_css_hash': cssData.hash
            });
            
            console.log('TST CSS已更新');
            return cssData;
        }
        
        return null;
    } catch (error) {
        console.error('自动更新TST CSS失败:', error);
        return null;
    }
}

// 显示动态TST配置
async function showDynamicTSTConfig() {
    try {
        updateStatus('生成动态TST配置...');
        
        // 生成最新的CSS
        const cssData = await generateDynamicTSTCSS();
        
        if (cssData.error) {
            await showDialog('生成失败', '❌ 生成TST CSS失败:\n' + cssData.error);
            return;
        }
        
        // 保存到存储
        await browser.storage.local.set({
            'tst_css': cssData.css,
            'tst_css_generated': Date.now(),
            'tst_css_hash': cssData.hash
        });
        
        let configMsg = '🌳 动态TST配置已生成\n\n';
        configMsg += '📊 配置统计:\n';
        configMsg += '• 环境数量: ' + cssData.environments.length + '\n';
        configMsg += '• CSS规则: ' + (cssData.css.split('\n').length) + ' 行\n';
        configMsg += '• 生成时间: ' + new Date().toLocaleString() + '\n\n';
        
        configMsg += '🎨 包含的环境:\n';
        cssData.environments.forEach((env, index) => {
            configMsg += (index + 1) + '. ' + (env.icon || '🔹') + ' ' + env.name + '\n';
            configMsg += '   颜色: ' + (env.color || '#28a745') + '\n';
        });
        
        configMsg += '\n📋 使用方法:\n';
        configMsg += '1. 复制生成的CSS代码\n';
        configMsg += '2. 打开TST扩展设置\n';
        configMsg += '3. 粘贴到用户样式表中\n';
        configMsg += '4. 保存并重启Firefox\n\n';
        
        configMsg += '💡 提示: 每次修改环境后，\n';
        configMsg += '点击此按钮重新生成CSS。';
        
        await showDialog('动态TST配置', configMsg);
        
        updateStatus('动态TST配置生成完成');
        
        // 显示CSS内容（可选）
        console.log('生成的TST CSS:', cssData.css);
        
    } catch (error) {
        console.error('显示动态TST配置失败:', error);
        updateStatus('动态TST配置失败');
        await showDialog('配置失败', '❌ 动态TST配置失败:\n' + error.message);
    }
}

// 监听环境变化
function startEnvironmentWatcher() {
    // 每5秒检查一次环境变化
    setInterval(async () => {
        await autoUpdateTSTCSS();
    }, 5000);
    
    console.log('环境变化监听器已启动');
}

// 初始化动态TST功能
async function initializeDynamicTST() {
    try {
        console.log('初始化动态TST功能...');
        
        // 生成初始CSS
        const cssData = await generateDynamicTSTCSS();
        lastEnvironmentHash = cssData.hash;
        
        // 启动监听器
        startEnvironmentWatcher();
        
        console.log('动态TST功能初始化完成');
        
    } catch (error) {
        console.error('初始化动态TST功能失败:', error);
    }
}
