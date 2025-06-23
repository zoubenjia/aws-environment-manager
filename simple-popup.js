/**
 * AWS Environment Browser Extension - 简化弹出窗口
 * 专注于核心功能的可靠实现
 */

(function() {
    'use strict';
    
    console.log('简化弹出窗口脚本开始加载...');
    
    // 默认环境配置
    const defaultEnvironments = [
        {
            id: 'production',
            name: '生产环境',
            icon: '🔴',
            color: '#dc3545',
            description: '生产环境 - 请谨慎操作',
            accountId: '487783143761',
            roleName: 'PowerUserAccess',
            regions: ['eu-west-2', 'us-east-1']
        },
        {
            id: 'development',
            name: '开发环境',
            icon: '🟢',
            color: '#28a745',
            description: '开发环境 - 安全测试',
            accountId: '487783143761',
            roleName: 'PowerUserAccess_dev',
            regions: ['eu-central-1', 'us-west-2']
        },
        {
            id: 'staging',
            name: '测试环境',
            icon: '🔵',
            color: '#007bff',
            description: '测试环境 - 预发布验证',
            accountId: '487783143761',
            roleName: 'PowerUserAccess_staging',
            regions: ['ap-southeast-1', 'ap-northeast-1']
        }
    ];
    
    let currentEnvironments = [...defaultEnvironments];
    
    /**
     * 显示状态消息
     */
    function showStatus(message, type = 'info') {
        console.log(`状态: ${message} (${type})`);
        
        // 创建状态提示
        const statusDiv = document.createElement('div');
        statusDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 10px 15px;
            border-radius: 5px;
            color: white;
            font-size: 12px;
            z-index: 10000;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        `;
        statusDiv.textContent = message;
        document.body.appendChild(statusDiv);
        
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        }, 3000);
    }
    
    /**
     * 调试数据
     */
    function debugData() {
        console.log('=== 调试信息开始 ===');
        console.log('当前环境数组:', currentEnvironments);
        console.log('browser对象:', typeof browser);
        console.log('browser.storage:', typeof browser?.storage);
        
        if (typeof browser !== 'undefined' && browser.storage) {
            browser.storage.local.get(null).then(allData => {
                console.log('所有存储数据:', allData);
            }).catch(err => {
                console.error('获取存储数据失败:', err);
            });
        }
        
        console.log('=== 调试信息结束 ===');
        
        const debugInfo = `
调试信息：
- 当前环境数量: ${currentEnvironments.length}
- Browser API: ${typeof browser !== 'undefined' ? '可用' : '不可用'}
- Storage API: ${typeof browser?.storage !== 'undefined' ? '可用' : '不可用'}

详细信息请查看控制台
        `;
        
        alert(debugInfo.trim());
        showStatus('调试信息已输出', 'info');
    }
    
    /**
     * 保存环境到存储
     */
    async function saveEnvironments() {
        try {
            console.log('开始保存环境...', currentEnvironments);
            
            if (typeof browser !== 'undefined' && browser.storage) {
                await browser.storage.local.set({
                    'aws_environments': currentEnvironments,
                    'save_timestamp': Date.now()
                });
                console.log('环境保存成功');
                showStatus('✅ 环境已保存', 'success');
                return true;
            } else {
                throw new Error('Browser storage API 不可用');
            }
        } catch (error) {
            console.error('保存环境失败:', error);
            showStatus('❌ 保存失败: ' + error.message, 'error');
            return false;
        }
    }
    
    /**
     * 从存储加载环境
     */
    async function loadEnvironments() {
        try {
            console.log('开始加载环境...');
            
            if (typeof browser !== 'undefined' && browser.storage) {
                const result = await browser.storage.local.get(['aws_environments']);
                console.log('存储查询结果:', result);
                
                if (result.aws_environments && Array.isArray(result.aws_environments)) {
                    currentEnvironments = result.aws_environments;
                    console.log('环境加载成功:', currentEnvironments.length, '个环境');
                } else {
                    console.log('未找到存储的环境，使用默认环境');
                    currentEnvironments = [...defaultEnvironments];
                    await saveEnvironments(); // 保存默认环境
                }
            } else {
                console.log('Browser storage API 不可用，使用默认环境');
                currentEnvironments = [...defaultEnvironments];
            }
            
            return true;
        } catch (error) {
            console.error('加载环境失败:', error);
            currentEnvironments = [...defaultEnvironments];
            showStatus('❌ 加载失败，使用默认环境', 'error');
            return false;
        }
    }
    
    /**
     * 更新环境颜色
     */
    async function updateEnvironmentColor(envId, newColor) {
        try {
            console.log('更新环境颜色:', envId, newColor);
            
            const envIndex = currentEnvironments.findIndex(env => env.id === envId);
            if (envIndex !== -1) {
                currentEnvironments[envIndex].color = newColor;
                await saveEnvironments();
                renderEnvironments();
                showStatus('✅ 颜色已更新', 'success');
                return true;
            } else {
                throw new Error('找不到指定环境');
            }
        } catch (error) {
            console.error('更新颜色失败:', error);
            showStatus('❌ 更新颜色失败', 'error');
            return false;
        }
    }
    
    /**
     * 简单颜色选择器
     */
    function showColorPicker(envId, currentColor, targetElement) {
        console.log('显示颜色选择器:', envId, currentColor);
        
        // 移除现有选择器
        const existing = document.querySelector('.simple-color-picker');
        if (existing) {
            existing.remove();
        }
        
        // 预设颜色
        const colors = [
            '#dc3545', '#28a745', '#007bff', '#ffc107', '#6f42c1',
            '#fd7e14', '#20c997', '#e83e8c', '#6c757d', '#343a40'
        ];
        
        // 创建选择器
        const picker = document.createElement('div');
        picker.className = 'simple-color-picker';
        picker.style.cssText = `
            position: fixed;
            background: white;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 15px;
            z-index: 99999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            min-width: 200px;
        `;
        
        // 添加标题
        const title = document.createElement('div');
        title.textContent = '选择颜色';
        title.style.cssText = 'font-weight: bold; margin-bottom: 10px; color: #333; text-align: center;';
        picker.appendChild(title);
        
        // 添加颜色选项
        const colorGrid = document.createElement('div');
        colorGrid.style.cssText = 'display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 15px;';
        
        colors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.style.cssText = `
                width: 35px;
                height: 35px;
                background: ${color};
                border: 3px solid ${color === currentColor ? '#000' : '#ccc'};
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
            `;
            
            colorDiv.addEventListener('mouseenter', () => {
                colorDiv.style.transform = 'scale(1.1)';
            });
            
            colorDiv.addEventListener('mouseleave', () => {
                colorDiv.style.transform = 'scale(1)';
            });
            
            colorDiv.addEventListener('click', async (e) => {
                e.stopPropagation();
                console.log('选择颜色:', color);
                await updateEnvironmentColor(envId, color);
                picker.remove();
            });
            
            colorGrid.appendChild(colorDiv);
        });
        
        picker.appendChild(colorGrid);
        
        // 添加取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            width: 100%; 
            padding: 8px; 
            background: #6c757d; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
            font-size: 14px;
        `;
        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            picker.remove();
        });
        picker.appendChild(cancelBtn);
        
        // 智能定位 - 确保在视窗内显示
        document.body.appendChild(picker);
        
        const rect = targetElement.getBoundingClientRect();
        const pickerRect = picker.getBoundingClientRect();
        
        let left = rect.right + 10;
        let top = rect.top;
        
        // 如果右侧空间不够，显示在左侧
        if (left + pickerRect.width > window.innerWidth) {
            left = rect.left - pickerRect.width - 10;
        }
        
        // 如果下方空间不够，向上调整
        if (top + pickerRect.height > window.innerHeight) {
            top = window.innerHeight - pickerRect.height - 10;
        }
        
        // 确保不超出屏幕边界
        left = Math.max(10, Math.min(left, window.innerWidth - pickerRect.width - 10));
        top = Math.max(10, Math.min(top, window.innerHeight - pickerRect.height - 10));
        
        picker.style.left = `${left}px`;
        picker.style.top = `${top}px`;
        
        console.log('颜色选择器已定位:', { left, top });
        
        // 点击外部关闭
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!picker.contains(e.target) && e.target !== targetElement) {
                    picker.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 100);
    }
    
    /**
     * 渲染环境列表
     */
    function renderEnvironments() {
        console.log('渲染环境列表...');
        
        const container = document.getElementById('environmentList');
        if (!container) {
            console.error('找不到环境列表容器');
            return;
        }
        
        container.innerHTML = '';
        
        currentEnvironments.forEach(env => {
            const envDiv = document.createElement('div');
            envDiv.className = 'environment-item';
            envDiv.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px;
                margin-bottom: 8px;
                background: rgba(255,255,255,0.1);
                border-radius: 8px;
                border-left: 4px solid ${env.color};
            `;
            
            envDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="font-size: 20px;">${env.icon}</div>
                    <div>
                        <div style="font-weight: 600; color: white;">${env.name}</div>
                        <div style="font-size: 11px; color: rgba(255,255,255,0.8);">${env.description}</div>
                        <div style="font-size: 10px; color: rgba(255,255,255,0.6);">
                            区域: ${env.regions ? env.regions.join(', ') : '未设置'}
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 5px; align-items: center;">
                    <div class="color-btn" style="width: 20px; height: 20px; background: ${env.color}; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.5);" 
                         data-env-id="${env.id}" title="更改颜色"></div>
                </div>
            `;
            
            // 绑定颜色按钮事件
            const colorBtn = envDiv.querySelector('.color-btn');
            colorBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showColorPicker(env.id, env.color, colorBtn);
            });
            
            container.appendChild(envDiv);
        });
        
        console.log('环境列表渲染完成');
    }
    
    /**
     * 显示添加环境表单
     */
    function showAddEnvironmentForm() {
        console.log('🎯 showAddEnvironmentForm 函数被调用');
        
        try {
            // 先显示一个简单的确认
            const confirmed = confirm('确定要添加新环境吗？\n\n点击确定继续，取消返回。');
            if (!confirmed) {
                console.log('用户取消了添加环境操作');
                return;
            }
            
            const form = document.getElementById('environmentForm');
            console.log('环境表单元素:', form);
            
            if (form) {
                console.log('找到环境表单，准备显示');
                
                // 清空表单
                const nameInput = document.getElementById('envName');
                const iconInput = document.getElementById('envIcon');
                const colorInput = document.getElementById('envColor');
                const descInput = document.getElementById('envDescription');
                const accountInput = document.getElementById('envAccountId');
                const roleInput = document.getElementById('envRoleName');
                
                if (nameInput) nameInput.value = '';
                if (iconInput) iconInput.value = '🟡';
                if (colorInput) colorInput.value = '#ffc107';
                if (descInput) descInput.value = '';
                if (accountInput) accountInput.value = '487783143761';
                if (roleInput) roleInput.value = 'PowerUserAccess';
                
                console.log('表单字段已清空');
                
                // 设置区域默认选择
                const regionSelect = document.getElementById('envRegions');
                if (regionSelect) {
                    Array.from(regionSelect.options).forEach(option => {
                        option.selected = option.value === 'us-east-1';
                    });
                    console.log('区域默认选择已设置');
                }
                
                // 显示表单
                form.style.display = 'block';
                console.log('环境表单已显示');
                
                showStatus('📝 请填写环境信息', 'info');
                
                // 滚动到表单位置
                form.scrollIntoView({ behavior: 'smooth' });
                
            } else {
                console.error('❌ 找不到环境表单元素');
                
                // 创建一个简单的输入对话框作为降级方案
                const envName = prompt('请输入环境名称:');
                if (envName) {
                    const newEnv = {
                        id: 'custom_' + Date.now(),
                        name: envName,
                        icon: '🟡',
                        color: '#ffc107',
                        description: '自定义环境',
                        accountId: '487783143761',
                        roleName: 'PowerUserAccess',
                        regions: ['us-east-1']
                    };
                    
                    currentEnvironments.push(newEnv);
                    saveEnvironments();
                    renderEnvironments();
                    showStatus('✅ 环境添加成功', 'success');
                }
            }
            
        } catch (error) {
            console.error('显示添加环境表单时出错:', error);
            showStatus('❌ 显示表单失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 隐藏添加环境表单
     */
    function hideAddEnvironmentForm() {
        console.log('隐藏添加环境表单');
        
        const form = document.getElementById('environmentForm');
        if (form) {
            form.style.display = 'none';
        }
    }
    
    /**
     * 保存新环境
     */
    async function saveNewEnvironment() {
        try {
            console.log('保存新环境...');
            
            const name = document.getElementById('envName').value.trim();
            const icon = document.getElementById('envIcon').value.trim();
            const color = document.getElementById('envColor').value;
            const description = document.getElementById('envDescription').value.trim();
            const accountId = document.getElementById('envAccountId').value.trim();
            const roleName = document.getElementById('envRoleName').value.trim();
            
            console.log('表单数据:', { name, icon, color, description, accountId, roleName });
            
            // 获取选中的区域
            const regionSelect = document.getElementById('envRegions');
            const selectedRegions = regionSelect ? 
                Array.from(regionSelect.selectedOptions).map(option => option.value) : 
                ['us-east-1'];
            
            console.log('选中的区域:', selectedRegions);
            
            // 验证必填字段
            if (!name || !icon || !description || !accountId || !roleName) {
                showStatus('❌ 请填写所有必填字段', 'error');
                return false;
            }
            
            if (selectedRegions.length === 0) {
                showStatus('❌ 请至少选择一个AWS区域', 'error');
                return false;
            }
            
            // 创建新环境
            const newEnvironment = {
                id: 'custom_' + Date.now(),
                name,
                icon,
                color,
                description,
                accountId,
                roleName,
                regions: selectedRegions
            };
            
            console.log('新环境数据:', newEnvironment);
            
            // 添加到环境列表
            currentEnvironments.push(newEnvironment);
            
            // 保存到存储
            const saved = await saveEnvironments();
            if (saved) {
                // 重新渲染
                renderEnvironments();
                hideAddEnvironmentForm();
                showStatus('✅ 环境添加成功', 'success');
                return true;
            } else {
                // 回滚
                currentEnvironments.pop();
                showStatus('❌ 保存失败', 'error');
                return false;
            }
            
        } catch (error) {
            console.error('保存新环境失败:', error);
            showStatus('❌ 保存失败: ' + error.message, 'error');
            return false;
        }
    }
    /**
     * 绑定事件
     */
    function bindEvents() {
        console.log('绑定事件...');
        
        // 检查所有按钮
        const allButtons = document.querySelectorAll('button');
        console.log('页面中所有按钮:', allButtons.length);
        allButtons.forEach((btn, index) => {
            console.log(`按钮${index + 1}: ID="${btn.id}", 文本="${btn.textContent.trim()}"`);
        });
        
        // 调试按钮
        const debugBtn = document.getElementById('debugData');
        if (debugBtn) {
            debugBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('调试按钮被点击');
                debugData();
            });
            console.log('✅ 调试按钮事件已绑定');
        } else {
            console.error('❌ 找不到调试按钮');
        }
        
        // 保存按钮
        const saveBtn = document.getElementById('saveEnvironments');
        if (saveBtn) {
            saveBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('保存按钮被点击');
                await saveEnvironments();
            });
            console.log('✅ 保存按钮事件已绑定');
        } else {
            console.log('ℹ️ 保存按钮不存在');
        }
        
        // 添加环境按钮 - 多种方式尝试绑定
        const addEnvBtn = document.getElementById('addEnvironment');
        if (addEnvBtn) {
            console.log('✅ 找到添加环境按钮:', addEnvBtn);
            
            // 方式1: 标准事件监听
            addEnvBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 添加环境按钮被点击 (方式1)');
                showAddEnvironmentForm();
            });
            
            // 方式2: 直接设置onclick
            addEnvBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 添加环境按钮被点击 (方式2)');
                showAddEnvironmentForm();
            };
            
            // 测试按钮是否可点击
            console.log('按钮样式:', {
                display: getComputedStyle(addEnvBtn).display,
                visibility: getComputedStyle(addEnvBtn).visibility,
                pointerEvents: getComputedStyle(addEnvBtn).pointerEvents,
                disabled: addEnvBtn.disabled
            });
            
            console.log('✅ 添加环境按钮事件已绑定');
        } else {
            console.error('❌ 找不到添加环境按钮');
            
            // 尝试通过其他方式查找
            const buttonsByText = Array.from(document.querySelectorAll('button')).filter(btn => 
                btn.textContent.includes('添加环境')
            );
            console.log('通过文本查找的按钮:', buttonsByText);
        }
        
        // 保存环境表单按钮
        const saveEnvBtn = document.getElementById('saveEnvironment');
        if (saveEnvBtn) {
            saveEnvBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('保存环境表单按钮被点击');
                await saveNewEnvironment();
            });
            console.log('✅ 保存环境表单按钮事件已绑定');
        } else {
            console.log('ℹ️ 保存环境表单按钮不存在（正常）');
        }
        
        // 取消环境表单按钮
        const cancelEnvBtn = document.getElementById('cancelEnvironment');
        if (cancelEnvBtn) {
            cancelEnvBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('取消环境表单按钮被点击');
                hideAddEnvironmentForm();
            });
            console.log('✅ 取消环境表单按钮事件已绑定');
        } else {
            console.log('ℹ️ 取消环境表单按钮不存在（正常）');
        }
        
        console.log('事件绑定完成');
    }
    
    /**
     * 初始化
     */
    async function initialize() {
        try {
            console.log('开始初始化简化弹出窗口...');
            
            // 等待DOM加载
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // 延迟一点确保所有元素都已渲染
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 加载环境数据
            await loadEnvironments();
            
            // 渲染界面
            renderEnvironments();
            
            // 绑定事件
            bindEvents();
            
            console.log('简化弹出窗口初始化完成');
            showStatus('✅ 初始化完成', 'success');
            
        } catch (error) {
            console.error('初始化失败:', error);
            showStatus('❌ 初始化失败: ' + error.message, 'error');
        }
    }
    
    // 启动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
})();
