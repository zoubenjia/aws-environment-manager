// 修复弹出窗口布局显示问题

// 动态调整弹出窗口高度
function adjustPopupHeight() {
    try {
        const body = document.body;
        const container = document.querySelector('.container');
        const buttons = document.querySelector('.buttons');
        
        if (!body || !container || !buttons) return;
        
        // 计算按钮数量
        const buttonCount = buttons.querySelectorAll('.btn').length;
        console.log('按钮数量:', buttonCount);
        
        // 根据按钮数量调整高度
        let minHeight = 500;
        if (buttonCount > 6) {
            minHeight = 600;
        }
        if (buttonCount > 8) {
            minHeight = 650;
        }
        
        // 设置body高度
        body.style.minHeight = minHeight + 'px';
        body.style.maxHeight = (minHeight + 50) + 'px';
        
        // 设置容器高度
        container.style.maxHeight = (minHeight - 20) + 'px';
        
        console.log('弹出窗口高度已调整为:', minHeight);
        
    } catch (error) {
        console.error('调整弹出窗口高度失败:', error);
    }
}

// 优化按钮布局
function optimizeButtonLayout() {
    try {
        const buttonsContainer = document.querySelector('.buttons');
        if (!buttonsContainer) return;
        
        const buttons = buttonsContainer.querySelectorAll('.btn');
        const buttonCount = buttons.length;
        
        console.log('优化按钮布局，按钮数量:', buttonCount);
        
        // 根据按钮数量调整网格布局
        if (buttonCount <= 4) {
            buttonsContainer.style.gridTemplateColumns = '1fr 1fr';
        } else if (buttonCount <= 6) {
            buttonsContainer.style.gridTemplateColumns = '1fr 1fr';
            buttonsContainer.style.maxHeight = '200px';
        } else {
            buttonsContainer.style.gridTemplateColumns = '1fr 1fr';
            buttonsContainer.style.maxHeight = '250px';
            buttonsContainer.style.overflowY = 'auto';
        }
        
        // 为小按钮添加特殊样式
        buttons.forEach(button => {
            if (button.style.fontSize === '12px' || button.textContent.length < 8) {
                button.style.padding = '8px 6px';
                button.style.fontSize = '11px';
            }
        });
        
        console.log('按钮布局优化完成');
        
    } catch (error) {
        console.error('优化按钮布局失败:', error);
    }
}

// 添加滚动指示器
function addScrollIndicator() {
    try {
        const container = document.querySelector('.container');
        if (!container) return;
        
        // 检查是否需要滚动
        if (container.scrollHeight > container.clientHeight) {
            // 添加滚动提示
            const scrollHint = document.createElement('div');
            scrollHint.className = 'scroll-hint';
            scrollHint.innerHTML = '↓ 向下滚动查看更多 ↓';
            scrollHint.style.cssText = `
                position: sticky;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                color: #333;
                text-align: center;
                padding: 8px;
                font-size: 11px;
                border-radius: 4px;
                margin-top: 8px;
                animation: pulse 2s infinite;
            `;
            
            // 添加脉冲动画
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            container.appendChild(scrollHint);
            
            // 滚动时隐藏提示
            container.addEventListener('scroll', () => {
                const scrollPercentage = (container.scrollTop / (container.scrollHeight - container.clientHeight)) * 100;
                if (scrollPercentage > 20) {
                    scrollHint.style.display = 'none';
                } else {
                    scrollHint.style.display = 'block';
                }
            });
            
            console.log('滚动指示器已添加');
        }
        
    } catch (error) {
        console.error('添加滚动指示器失败:', error);
    }
}

// 修复弹出窗口显示问题
function fixPopupDisplay() {
    try {
        console.log('开始修复弹出窗口显示问题...');
        
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fixPopupDisplay);
            return;
        }
        
        // 调整高度
        adjustPopupHeight();
        
        // 优化按钮布局
        optimizeButtonLayout();
        
        // 添加滚动指示器
        addScrollIndicator();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            setTimeout(() => {
                adjustPopupHeight();
                optimizeButtonLayout();
            }, 100);
        });
        
        console.log('弹出窗口显示问题修复完成');
        
    } catch (error) {
        console.error('修复弹出窗口显示失败:', error);
    }
}

// 检查显示状态
function checkDisplayStatus() {
    try {
        const body = document.body;
        const container = document.querySelector('.container');
        const buttons = document.querySelector('.buttons');
        
        let statusMsg = '📊 弹出窗口显示状态\n\n';
        
        if (body) {
            statusMsg += '窗口尺寸:\n';
            statusMsg += '• 宽度: ' + body.offsetWidth + 'px\n';
            statusMsg += '• 高度: ' + body.offsetHeight + 'px\n';
            statusMsg += '• 滚动高度: ' + body.scrollHeight + 'px\n\n';
        }
        
        if (container) {
            statusMsg += '容器尺寸:\n';
            statusMsg += '• 高度: ' + container.offsetHeight + 'px\n';
            statusMsg += '• 滚动高度: ' + container.scrollHeight + 'px\n';
            statusMsg += '• 需要滚动: ' + (container.scrollHeight > container.clientHeight ? '是' : '否') + '\n\n';
        }
        
        if (buttons) {
            const buttonCount = buttons.querySelectorAll('.btn').length;
            statusMsg += '按钮信息:\n';
            statusMsg += '• 按钮数量: ' + buttonCount + '\n';
            statusMsg += '• 容器高度: ' + buttons.offsetHeight + 'px\n';
            statusMsg += '• 滚动高度: ' + buttons.scrollHeight + 'px\n\n';
        }
        
        statusMsg += '💡 建议:\n';
        if (body && body.scrollHeight > body.offsetHeight) {
            statusMsg += '• 内容超出窗口，已启用滚动\n';
            statusMsg += '• 可以向下滚动查看更多内容\n';
        } else {
            statusMsg += '• 所有内容都在可见区域内\n';
        }
        
        showDialog('显示状态检查', statusMsg);
        
    } catch (error) {
        console.error('检查显示状态失败:', error);
        showDialog('检查失败', '❌ 检查显示状态失败:\n' + error.message);
    }
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixPopupDisplay);
} else {
    fixPopupDisplay();
}
