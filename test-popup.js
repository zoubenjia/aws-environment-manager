/**
 * 测试弹出窗口脚本 - 验证基本功能
 */

console.log('测试脚本开始加载...');

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始测试...');
    
    // 测试1: 查找所有按钮
    const buttons = document.querySelectorAll('button');
    console.log('找到按钮数量:', buttons.length);
    buttons.forEach((btn, index) => {
        console.log(`按钮${index + 1}:`, btn.id || '无ID', btn.textContent.trim());
    });
    
    // 测试2: 绑定添加环境按钮
    const addEnvBtn = document.getElementById('addEnvironment');
    if (addEnvBtn) {
        console.log('找到添加环境按钮');
        addEnvBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('添加环境按钮被点击！');
            alert('添加环境按钮工作正常！');
            
            // 显示环境表单
            const form = document.getElementById('environmentForm');
            if (form) {
                form.style.display = form.style.display === 'none' ? 'block' : 'none';
                console.log('环境表单显示状态切换');
            } else {
                console.error('找不到环境表单');
            }
        });
        console.log('添加环境按钮事件已绑定');
    } else {
        console.error('找不到添加环境按钮');
    }
    
    // 测试3: 绑定调试按钮
    const debugBtn = document.getElementById('debugData');
    if (debugBtn) {
        console.log('找到调试按钮');
        debugBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('调试按钮被点击！');
            
            const debugInfo = `
测试调试信息：
- 当前时间: ${new Date().toLocaleString()}
- 页面标题: ${document.title}
- 按钮数量: ${document.querySelectorAll('button').length}
- Browser API: ${typeof browser !== 'undefined' ? '可用' : '不可用'}
            `;
            
            alert(debugInfo.trim());
        });
        console.log('调试按钮事件已绑定');
    } else {
        console.error('找不到调试按钮');
    }
    
    // 测试4: 检查环境列表容器
    const envList = document.getElementById('environmentList');
    if (envList) {
        console.log('找到环境列表容器');
        envList.innerHTML = `
            <div style="padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; margin: 5px 0;">
                <div style="color: white; font-weight: bold;">🔴 测试生产环境</div>
                <div style="color: rgba(255,255,255,0.8); font-size: 12px;">这是一个测试环境项</div>
            </div>
            <div style="padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; margin: 5px 0;">
                <div style="color: white; font-weight: bold;">🟢 测试开发环境</div>
                <div style="color: rgba(255,255,255,0.8); font-size: 12px;">这是另一个测试环境项</div>
            </div>
        `;
        console.log('环境列表已填充测试数据');
    } else {
        console.error('找不到环境列表容器');
    }
    
    console.log('测试脚本初始化完成');
});

console.log('测试脚本加载完成');
