/**
 * AWS Environment Browser Extension - 增强弹出窗口
 * 支持颜色自定义、去掉独立工具、完整生产环境警告
 */

(function() {
    'use strict';
    
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
    
    // AWS区域配置
    const awsRegions = {
        'us-east-1': { name: '美国东部 (北弗吉尼亚)', flag: '🇺🇸', color: '#ff6b6b' },
        'us-east-2': { name: '美国东部 (俄亥俄)', flag: '🇺🇸', color: '#ff8e8e' },
        'us-west-1': { name: '美国西部 (加利福尼亚)', flag: '🇺🇸', color: '#ffb3b3' },
        'us-west-2': { name: '美国西部 (俄勒冈)', flag: '🇺🇸', color: '#ffd6d6' },
        'eu-west-1': { name: '欧洲 (爱尔兰)', flag: '🇪🇺', color: '#6bcf7f' },
        'eu-west-2': { name: '欧洲 (伦敦)', flag: '🇪🇺', color: '#8ed99f' },
        'eu-central-1': { name: '欧洲 (法兰克福)', flag: '🇪🇺', color: '#b3e6bf' },
        'ap-southeast-1': { name: '亚太 (新加坡)', flag: '🇸🇬', color: '#74c0fc' },
        'ap-northeast-1': { name: '亚太 (东京)', flag: '🇯🇵', color: '#a5d8ff' },
        'ap-south-1': { name: '亚太 (孟买)', flag: '🇮🇳', color: '#d0ebff' }
    };
    
    let currentEnvironments = [...defaultEnvironments];
    let editingEnvironmentId = null;
    let editingRegionEnvironmentId = null;
    
    /**
     * 初始化弹出窗口
     */
    async function initializePopup() {
        try {
            // 等待数据同步管理器初始化
            if (window.DataSyncManager && !window.DataSyncManager.isInitialized) {
                await window.DataSyncManager.initialize();
            }
            
            // 设置数据变化监听器
            if (window.DataSyncManager) {
                window.DataSyncManager.addListener((event, data) => {
                    if (event === 'environments_changed' || event === 'environments_updated') {
                        currentEnvironments = data || currentEnvironments;
                        renderEnvironmentList();
                        loadColorSettings();
                        console.log('环境数据已同步更新');
                    }
                });
            }
            
            // 加载保存的环境配置
            await loadEnvironmentConfig();
            
            // 渲染环境列表
            renderEnvironmentList();
            
            // 绑定事件监听器
            bindEventListeners();
            
            // 加载颜色设置
            loadColorSettings();
            
            console.log('增强弹出窗口初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            showStatus('初始化失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 加载环境配置
     */
    async function loadEnvironmentConfig() {
        try {
            console.log('开始加载环境配置...');
            
            if (window.DataSyncManager && window.DataSyncManager.isInitialized) {
                console.log('使用DataSyncManager加载');
                currentEnvironments = await window.DataSyncManager.getEnvironments();
                console.log('DataSyncManager加载完成:', currentEnvironments.length, '个环境');
            } else {
                console.log('使用降级方案加载');
                // 降级方案：直接从存储加载
                if (typeof browser !== 'undefined' && browser.storage) {
                    const result = await browser.storage.local.get(['aws_environments', 'environments']);
                    console.log('存储查询结果:', result);
                    
                    if (result.aws_environments && result.aws_environments.length > 0) {
                        currentEnvironments = result.aws_environments;
                        console.log('从aws_environments加载:', currentEnvironments.length, '个环境');
                    } else if (result.environments && result.environments.length > 0) {
                        currentEnvironments = result.environments;
                        console.log('从environments加载:', currentEnvironments.length, '个环境');
                        // 迁移数据到新格式
                        await browser.storage.local.set({ 
                            aws_environments: currentEnvironments,
                            aws_last_sync: Date.now()
                        });
                        console.log('数据已迁移到新格式');
                    } else {
                        console.log('未找到存储的环境，使用默认环境');
                        currentEnvironments = [...defaultEnvironments];
                        // 保存默认环境
                        await browser.storage.local.set({ 
                            aws_environments: currentEnvironments,
                            aws_last_sync: Date.now()
                        });
                        console.log('默认环境已保存');
                    }
                } else {
                    console.log('无法访问存储，使用默认环境');
                    currentEnvironments = [...defaultEnvironments];
                }
            }
            console.log('环境配置加载完成:', currentEnvironments.length, '个环境');
        } catch (error) {
            console.error('加载环境配置失败:', error);
            currentEnvironments = [...defaultEnvironments];
            console.log('使用默认环境作为降级方案');
        }
    }
    
    /**
     * 渲染环境列表
     */
    function renderEnvironmentList() {
        const container = document.getElementById('environmentList');
        container.innerHTML = '';
        
        currentEnvironments.forEach(env => {
            const envItem = document.createElement('div');
            envItem.className = 'environment-item';
            envItem.style.borderColor = env.color + '40';
            
            envItem.innerHTML = `
                <div class="environment-info">
                    <div class="environment-icon">${env.icon}</div>
                    <div class="environment-details">
                        <div class="environment-name">${env.name}</div>
                        <div class="environment-desc">${env.description}</div>
                        <div class="environment-regions">
                            <small style="color: rgba(255,255,255,0.7); font-size: 10px;">
                                区域: ${env.regions && env.regions.length > 0 ? env.regions.join(', ') : '未设置'}
                            </small>
                        </div>
                    </div>
                </div>
                <div class="environment-actions">
                    <div class="color-picker" style="background-color: ${env.color}" 
                         data-env-id="${env.id}" title="点击更改颜色"></div>
                    <div class="region-btn" data-env-id="${env.id}" title="编辑区域">🌍</div>
                    <div class="edit-btn" data-env-id="${env.id}" title="编辑环境">✏️</div>
                    ${env.id !== 'production' && env.id !== 'development' && env.id !== 'staging' ? 
                      `<div class="delete-btn" data-env-id="${env.id}" title="删除环境">🗑️</div>` : ''}
                </div>
            `;
            
            // 绑定点击事件
            envItem.addEventListener('click', (e) => {
                if (!e.target.classList.contains('color-picker') && 
                    !e.target.classList.contains('edit-btn') && 
                    !e.target.classList.contains('region-btn') && 
                    !e.target.classList.contains('delete-btn')) {
                    switchToEnvironment(env);
                }
            });
            
            // 绑定颜色选择器事件
            const colorPicker = envItem.querySelector('.color-picker');
            colorPicker.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                showInlineColorPicker(env.id, env.color, colorPicker);
            });
            
            // 绑定编辑按钮事件
            const editBtn = envItem.querySelector('.edit-btn');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editEnvironment(env.id);
                });
            }
            
            // 绑定区域编辑按钮事件
            const regionBtn = envItem.querySelector('.region-btn');
            if (regionBtn) {
                regionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editEnvironmentRegions(env.id);
                });
            }
            
            // 绑定删除按钮事件
            const deleteBtn = envItem.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteEnvironment(env.id);
                });
            }
            
            container.appendChild(envItem);
        });
    }
    
    /**
     * 渲染区域设置
     */
    function renderRegionSettings() {
        const container = document.getElementById('regionColorList');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.entries(awsRegions).forEach(([regionCode, regionInfo]) => {
            const regionItem = document.createElement('div');
            regionItem.className = 'region-color-item';
            
            regionItem.innerHTML = `
                <div class="region-info">
                    <span class="region-flag">${regionInfo.flag}</span>
                    <div>
                        <div class="region-name">${regionInfo.name}</div>
                        <div class="region-code">${regionCode}</div>
                    </div>
                </div>
                <input type="color" class="region-color-picker" 
                       value="${regionInfo.color}" 
                       data-region="${regionCode}"
                       title="设置${regionInfo.name}的颜色">
            `;
            
            container.appendChild(regionItem);
        });
        
        // 绑定区域颜色变化事件
        container.querySelectorAll('.region-color-picker').forEach(picker => {
            picker.addEventListener('change', (e) => {
                const regionCode = e.target.dataset.region;
                const newColor = e.target.value;
                updateRegionColor(regionCode, newColor);
            });
        });
    }
    
    /**
     * 更新区域颜色
     */
    async function updateRegionColor(regionCode, newColor) {
        try {
            awsRegions[regionCode].color = newColor;
            
            // 保存区域颜色设置
            if (window.DataSyncManager && window.DataSyncManager.isInitialized) {
                const settings = await window.DataSyncManager.getSettings();
                settings.regionColors = awsRegions;
                await window.DataSyncManager.saveSettings(settings);
            }
            
            showStatus(`✅ ${awsRegions[regionCode].name} 颜色已更新`, 'success');
        } catch (error) {
            console.error('更新区域颜色失败:', error);
            showStatus('更新区域颜色失败', 'error');
        }
    }
    
    /**
     * 切换到指定环境
     */
    async function switchToEnvironment(environment) {
        try {
            // 显示生产环境警告
            if (environment.id === 'production') {
                showProductionWarning();
                // 延迟3秒后继续
                await new Promise(resolve => setTimeout(resolve, 3000));
                hideProductionWarning();
            }
            
            // 生成AWS SSO URL
            const ssoUrl = generateAWSUrl(environment);
            
            // 在新标签页中打开
            if (typeof browser !== 'undefined' && browser.tabs) {
                await browser.tabs.create({ url: ssoUrl });
            } else {
                window.open(ssoUrl, '_blank');
            }
            
            // 应用TST标签页颜色
            await applyTSTColors(environment);
            
            showStatus(`✅ 已切换到${environment.name}`, 'success');
            
            // 关闭弹出窗口
            setTimeout(() => window.close(), 1000);
            
        } catch (error) {
            console.error('环境切换失败:', error);
            showStatus('切换失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 显示生产环境警告
     */
    function showProductionWarning() {
        const warning = document.getElementById('productionWarning');
        warning.style.display = 'block';
        
        // 滚动到警告位置
        warning.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 添加更强的视觉效果
        warning.style.animation = 'pulse 1s infinite';
    }
    
    /**
     * 隐藏生产环境警告
     */
    function hideProductionWarning() {
        const warning = document.getElementById('productionWarning');
        warning.style.display = 'none';
    }
    
    /**
     * 生成AWS SSO URL
     */
    function generateAWSUrl(environment) {
        const baseUrl = 'https://d-9067f2e3cc.awsapps.com/start/#/console';
        const params = new URLSearchParams({
            account_id: environment.accountId,
            role_name: environment.roleName,
            destination: 'https://console.aws.amazon.com/'
        });
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    /**
     * 应用TST标签页颜色
     */
    async function applyTSTColors(environment) {
        try {
            // 通知content script应用颜色
            if (typeof browser !== 'undefined' && browser.tabs) {
                const tabs = await browser.tabs.query({ active: true, currentWindow: true });
                if (tabs[0]) {
                    await browser.tabs.sendMessage(tabs[0].id, {
                        type: 'APPLY_TST_COLORS',
                        environment: environment
                    });
                }
            }
        } catch (error) {
            console.error('应用TST颜色失败:', error);
        }
    }
    
    /**
     * 显示内联颜色选择器
     */
    function showInlineColorPicker(envId, currentColor, targetElement) {
        // 移除现有的颜色选择器
        const existingPicker = document.querySelector('.inline-color-picker');
        if (existingPicker) {
            existingPicker.remove();
        }
        
        // 创建颜色选择面板
        const colorPanel = document.createElement('div');
        colorPanel.className = 'inline-color-picker';
        colorPanel.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.95);
            border-radius: 8px;
            padding: 15px;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.8);
            border: 1px solid rgba(255,255,255,0.3);
            min-width: 200px;
        `;
        
        // 预设颜色
        const presetColors = [
            '#dc3545', '#28a745', '#007bff', '#ffc107', '#6f42c1',
            '#fd7e14', '#20c997', '#e83e8c', '#6c757d', '#343a40',
            '#ff6b6b', '#51cf66', '#339af0', '#ffd43b', '#845ef7'
        ];
        
        colorPanel.innerHTML = `
            <div style="margin-bottom: 10px; color: white; font-size: 12px; font-weight: 600;">
                选择颜色
            </div>
            <div class="preset-colors" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin-bottom: 10px;">
                ${presetColors.map(color => `
                    <div class="preset-color" 
                         style="width: 24px; height: 24px; background: ${color}; border-radius: 4px; cursor: pointer; border: 2px solid ${color === currentColor ? 'white' : 'transparent'};"
                         data-color="${color}"></div>
                `).join('')}
            </div>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px;">
                <span style="color: white; font-size: 11px;">自定义:</span>
                <input type="text" class="custom-color-input" value="${currentColor}" 
                       style="width: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; font-size: 11px;">
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="apply-color-btn" style="background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    应用
                </button>
                <button class="cancel-color-btn" style="background: #6c757d; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">
                    取消
                </button>
            </div>
        `;
        
        // 定位颜色面板
        const targetRect = targetElement.getBoundingClientRect();
        colorPanel.style.left = `${targetRect.right + 10}px`;
        colorPanel.style.top = `${targetRect.top}px`;
        
        document.body.appendChild(colorPanel);
        
        // 确保面板在视窗内
        const panelRect = colorPanel.getBoundingClientRect();
        if (panelRect.right > window.innerWidth) {
            colorPanel.style.left = `${targetRect.left - panelRect.width - 10}px`;
        }
        if (panelRect.bottom > window.innerHeight) {
            colorPanel.style.top = `${targetRect.top - panelRect.height}px`;
        }
        
        // 绑定预设颜色点击事件
        colorPanel.querySelectorAll('.preset-color').forEach(colorDiv => {
            colorDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedColor = colorDiv.dataset.color;
                colorPanel.querySelector('.custom-color-input').value = selectedColor;
                
                // 更新选中状态
                colorPanel.querySelectorAll('.preset-color').forEach(div => {
                    div.style.border = div.dataset.color === selectedColor ? '2px solid white' : '2px solid transparent';
                });
            });
        });
        
        // 绑定应用按钮
        colorPanel.querySelector('.apply-color-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            const newColor = colorPanel.querySelector('.custom-color-input').value;
            if (isValidColor(newColor)) {
                await updateEnvironmentColor(envId, newColor);
                renderEnvironmentList();
                colorPanel.remove();
                showStatus('✅ 颜色已更新', 'success');
            } else {
                showStatus('❌ 无效的颜色值', 'error');
            }
        });
        
        // 绑定取消按钮
        colorPanel.querySelector('.cancel-color-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            colorPanel.remove();
        });
        
        // 阻止面板内的点击事件冒泡
        colorPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // 点击外部关闭
        setTimeout(() => {
            document.addEventListener('click', function closeColorPicker(e) {
                if (!colorPanel.contains(e.target) && e.target !== targetElement) {
                    colorPanel.remove();
                    document.removeEventListener('click', closeColorPicker);
                }
            });
        }, 100);
    }
    
    /**
     * 验证颜色值是否有效
     */
    function isValidColor(color) {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    }
    
    /**
     * 更新环境颜色
     */
    async function updateEnvironmentColor(envId, newColor) {
        const envIndex = currentEnvironments.findIndex(env => env.id === envId);
        if (envIndex !== -1) {
            currentEnvironments[envIndex].color = newColor;
            await saveEnvironmentConfig();
        }
    }
    
    /**
     * 保存环境配置
     */
    async function saveEnvironmentConfig() {
        try {
            console.log('开始保存环境配置...', currentEnvironments.length, '个环境');
            
            if (window.DataSyncManager && window.DataSyncManager.isInitialized) {
                console.log('使用DataSyncManager保存');
                await window.DataSyncManager.saveEnvironments(currentEnvironments);
                console.log('DataSyncManager保存成功');
            } else {
                console.log('使用降级方案保存');
                // 降级方案：直接保存到存储
                if (typeof browser !== 'undefined' && browser.storage) {
                    await browser.storage.local.set({ 
                        aws_environments: currentEnvironments,
                        aws_last_sync: Date.now()
                    });
                    console.log('降级方案保存成功');
                } else {
                    throw new Error('无法访问browser.storage API');
                }
            }
            console.log('环境配置保存完成');
        } catch (error) {
            console.error('保存环境配置失败:', error);
            throw error;
        }
    }
    
    /**
     * 加载颜色设置
     */
    function loadColorSettings() {
        const colorInputs = document.getElementById('colorInputs');
        colorInputs.innerHTML = '';
        
        currentEnvironments.forEach(env => {
            const colorGroup = document.createElement('div');
            colorGroup.className = 'color-input-group';
            colorGroup.innerHTML = `
                <input type="color" id="color_${env.id}" class="color-input" value="${env.color}">
                <label class="color-label">${env.icon} ${env.name}</label>
            `;
            colorInputs.appendChild(colorGroup);
        });
    }
    
    /**
     * 绑定事件监听器
     */
    function bindEventListeners() {
        // 自定义颜色按钮
        const customizeColorsBtn = document.getElementById('customizeColors');
        if (customizeColorsBtn) {
            customizeColorsBtn.addEventListener('click', () => {
                const customization = document.getElementById('colorCustomization');
                customization.style.display = customization.style.display === 'none' ? 'block' : 'none';
            });
        }
        
        // 重置颜色按钮
        const resetColorsBtn = document.getElementById('resetColors');
        if (resetColorsBtn) {
            resetColorsBtn.addEventListener('click', async () => {
                currentEnvironments = [...defaultEnvironments];
                await saveEnvironmentConfig();
                renderEnvironmentList();
                loadColorSettings();
                showStatus('✅ 颜色已重置', 'success');
            });
        }
        
        // 保存颜色设置
        const saveColorsBtn = document.getElementById('saveColors');
        if (saveColorsBtn) {
            saveColorsBtn.addEventListener('click', async () => {
                currentEnvironments.forEach(async (env) => {
                    const colorInput = document.getElementById(`color_${env.id}`);
                    if (colorInput) {
                        await updateEnvironmentColor(env.id, colorInput.value);
                    }
                });
                
                renderEnvironmentList();
                showStatus('✅ 颜色设置已保存', 'success');
            });
        }
        
        // 刷新环境按钮
        const refreshBtn = document.getElementById('refreshContainers');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await loadEnvironmentConfig();
                renderEnvironmentList();
                showStatus('✅ 环境已刷新', 'success');
            });
        }
        
        // 扩展设置按钮
        const optionsBtn = document.getElementById('openOptions');
        if (optionsBtn) {
            optionsBtn.addEventListener('click', async () => {
                try {
                    if (typeof browser !== 'undefined' && browser.runtime) {
                        await browser.runtime.openOptionsPage();
                        window.close();
                    }
                } catch (error) {
                    console.error('打开设置失败:', error);
                    showStatus('打开设置失败', 'error');
                }
            });
        }
        
        // 调试数据按钮
        const debugBtn = document.getElementById('debugData');
        if (debugBtn) {
            debugBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    console.log('=== 调试信息 ===');
                    console.log('当前环境数组:', currentEnvironments);
                    console.log('DataSyncManager状态:', window.DataSyncManager ? window.DataSyncManager.isInitialized : 'undefined');
                    
                    // 检查存储
                    if (typeof browser !== 'undefined' && browser.storage) {
                        const stored = await browser.storage.local.get(['aws_environments', 'environments']);
                        console.log('存储的数据:', stored);
                    }
                    
                    // 显示调试信息在页面上
                    const debugInfo = `
调试信息：
- 当前环境数量: ${currentEnvironments.length}
- DataSyncManager: ${window.DataSyncManager ? (window.DataSyncManager.isInitialized ? '已初始化' : '未初始化') : '未定义'}
- Browser API: ${typeof browser !== 'undefined' ? '可用' : '不可用'}
                    `;
                    
                    alert(debugInfo);
                    showStatus('调试信息已输出到控制台', 'info');
                } catch (error) {
                    console.error('调试失败:', error);
                    showStatus('调试失败: ' + error.message, 'error');
                }
            });
        } else {
            console.error('找不到调试按钮');
        }
        
        // TST设置按钮
        const setupTSTBtn = document.getElementById('setupTST');
        if (setupTSTBtn) {
            setupTSTBtn.addEventListener('click', async () => {
                try {
                    showStatus('🎨 正在自动设置TST样式...', 'success');
                    
                    // 通知所有AWS标签页执行自动设置
                    if (typeof browser !== 'undefined' && browser.tabs) {
                        const tabs = await browser.tabs.query({ url: '*://*.console.aws.amazon.com/*' });
                        
                        let successCount = 0;
                        for (const tab of tabs) {
                            try {
                                const response = await browser.tabs.sendMessage(tab.id, {
                                    type: 'AUTO_SETUP_TST'
                                });
                                if (response && response.success) {
                                    successCount++;
                                }
                            } catch (error) {
                                console.log(`标签页 ${tab.id} 设置失败:`, error);
                            }
                        }
                        
                        if (successCount > 0) {
                            showStatus(`✅ TST样式自动设置成功！(${successCount}个标签页)`, 'success');
                        } else {
                            showStatus('⚠️ 自动设置失败，请手动设置', 'warning');
                            // 降级到手动复制方案
                            await setupTSTStyles();
                        }
                    } else {
                        // 降级到手动复制方案
                        await setupTSTStyles();
                    }
                } catch (error) {
                    console.error('设置TST样式失败:', error);
                    showStatus('设置TST样式失败', 'error');
                    // 降级到手动复制方案
                    await setupTSTStyles();
                }
            });
        }
        
        // 添加环境按钮
        const addEnvBtn = document.getElementById('addEnvironment');
        if (addEnvBtn) {
            console.log('绑定添加环境按钮事件');
            addEnvBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('添加环境按钮被点击');
                showEnvironmentForm();
            });
        } else {
            console.error('找不到添加环境按钮');
        }
        
        // 保存环境按钮
        const saveEnvBtn = document.getElementById('saveEnvironment');
        if (saveEnvBtn) {
            saveEnvBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await saveEnvironmentForm();
            });
        }
        
        // 取消环境按钮
        const cancelEnvBtn = document.getElementById('cancelEnvironment');
        if (cancelEnvBtn) {
            cancelEnvBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                hideEnvironmentForm();
            });
        }
        
        // 区域编辑弹窗事件
        const closeRegionModal = document.getElementById('closeRegionModal');
        if (closeRegionModal) {
            closeRegionModal.addEventListener('click', hideRegionEditModal);
        }
        
        const cancelRegionEdit = document.getElementById('cancelRegionEdit');
        if (cancelRegionEdit) {
            cancelRegionEdit.addEventListener('click', hideRegionEditModal);
        }
        
        const saveRegionEdit = document.getElementById('saveRegionEdit');
        if (saveRegionEdit) {
            saveRegionEdit.addEventListener('click', saveEnvironmentRegions);
        }
        
        // 重置区域颜色按钮
        const resetRegionBtn = document.getElementById('resetRegionColors');
        if (resetRegionBtn) {
            resetRegionBtn.addEventListener('click', async () => {
                await resetRegionColors();
            });
        }
        
        // 切换区域颜色按钮
        const toggleRegionBtn = document.getElementById('toggleRegionColors');
        if (toggleRegionBtn) {
            toggleRegionBtn.addEventListener('click', async () => {
                await toggleRegionColors();
            });
        }
    }
    
    /**
     * 显示环境表单
     */
    function showEnvironmentForm(envId = null) {
        console.log('显示环境表单，envId:', envId);
        
        const form = document.getElementById('environmentForm');
        if (!form) {
            console.error('找不到环境表单元素');
            showStatus('表单元素未找到', 'error');
            return;
        }
        
        editingEnvironmentId = envId;
        
        if (envId) {
            // 编辑模式
            const env = currentEnvironments.find(e => e.id === envId);
            if (env) {
                document.getElementById('envName').value = env.name;
                document.getElementById('envIcon').value = env.icon;
                document.getElementById('envColor').value = env.color;
                document.getElementById('envDescription').value = env.description;
                document.getElementById('envAccountId').value = env.accountId;
                document.getElementById('envRoleName').value = env.roleName;
                
                // 设置区域选择
                const regionSelect = document.getElementById('envRegions');
                if (regionSelect && env.regions) {
                    Array.from(regionSelect.options).forEach(option => {
                        option.selected = env.regions.includes(option.value);
                    });
                }
                
                console.log('编辑模式，已填充环境数据');
            }
        } else {
            // 新建模式
            document.getElementById('envName').value = '';
            document.getElementById('envIcon').value = '🟡';
            document.getElementById('envColor').value = '#ffc107';
            document.getElementById('envDescription').value = '';
            document.getElementById('envAccountId').value = '487783143761';
            document.getElementById('envRoleName').value = 'PowerUserAccess';
            
            // 默认选择美国东部区域
            const regionSelect = document.getElementById('envRegions');
            if (regionSelect) {
                Array.from(regionSelect.options).forEach(option => {
                    option.selected = option.value === 'us-east-1';
                });
            }
            
            console.log('新建模式，已设置默认值');
        }
        
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
        
        console.log('环境表单已显示');
        showStatus('📝 环境表单已打开', 'success');
    }
    
    /**
     * 隐藏环境表单
     */
    function hideEnvironmentForm() {
        const form = document.getElementById('environmentForm');
        form.style.display = 'none';
        editingEnvironmentId = null;
    }
    
    /**
     * 保存环境表单
     */
    async function saveEnvironmentForm() {
        try {
            console.log('开始保存环境表单...');
            
            const name = document.getElementById('envName').value.trim();
            const icon = document.getElementById('envIcon').value.trim();
            const color = document.getElementById('envColor').value;
            const description = document.getElementById('envDescription').value.trim();
            const accountId = document.getElementById('envAccountId').value.trim();
            const roleName = document.getElementById('envRoleName').value.trim();
            
            console.log('表单数据:', { name, icon, color, description, accountId, roleName });
            
            // 获取选中的区域
            const regionSelect = document.getElementById('envRegions');
            const selectedRegions = regionSelect ? Array.from(regionSelect.selectedOptions).map(option => option.value) : ['us-east-1'];
            
            console.log('选中的区域:', selectedRegions);
            
            if (!name || !icon || !description || !accountId || !roleName) {
                showStatus('请填写所有必填字段', 'error');
                return;
            }
            
            if (selectedRegions.length === 0) {
                showStatus('请至少选择一个AWS区域', 'error');
                return;
            }
            
            const envData = {
                name,
                icon,
                color,
                description,
                accountId,
                roleName,
                regions: selectedRegions
            };
            
            console.log('环境数据:', envData);
            
            if (editingEnvironmentId) {
                // 编辑现有环境
                console.log('编辑现有环境:', editingEnvironmentId);
                const envIndex = currentEnvironments.findIndex(env => env.id === editingEnvironmentId);
                if (envIndex !== -1) {
                    currentEnvironments[envIndex] = { ...currentEnvironments[envIndex], ...envData };
                    console.log('环境已更新');
                } else {
                    console.error('找不到要编辑的环境');
                    showStatus('找不到要编辑的环境', 'error');
                    return;
                }
            } else {
                // 添加新环境
                console.log('添加新环境');
                const newId = 'custom_' + Date.now();
                currentEnvironments.push({
                    id: newId,
                    ...envData
                });
                console.log('新环境已添加');
            }
            
            console.log('当前环境列表:', currentEnvironments);
            
            // 保存配置
            showStatus('正在保存...', 'info');
            await saveEnvironmentConfig();
            
            // 更新界面
            renderEnvironmentList();
            loadColorSettings();
            hideEnvironmentForm();
            
            showStatus(editingEnvironmentId ? '✅ 环境已更新' : '✅ 环境已添加', 'success');
            console.log('环境保存完成');
            
        } catch (error) {
            console.error('保存环境失败:', error);
            showStatus('保存失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 编辑环境
     */
    function editEnvironment(envId) {
        showEnvironmentForm(envId);
    }
    
    /**
     * 删除环境
     */
    async function deleteEnvironment(envId) {
        if (confirm('确定要删除这个环境吗？')) {
            try {
                const envIndex = currentEnvironments.findIndex(env => env.id === envId);
                if (envIndex !== -1) {
                    const envName = currentEnvironments[envIndex].name;
                    currentEnvironments.splice(envIndex, 1);
                    await saveEnvironmentConfig();
                    renderEnvironmentList();
                    loadColorSettings();
                    showStatus(`✅ 环境 "${envName}" 已删除`, 'success');
                }
            } catch (error) {
                console.error('删除环境失败:', error);
                showStatus('删除失败: ' + error.message, 'error');
            }
        }
    }
    
    /**
     * 显示状态消息
     */
    function showStatus(message, type) {
        const statusDiv = document.getElementById('statusMessage');
        statusDiv.textContent = message;
        statusDiv.className = `status-message status-${type}`;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
    
    /**
     * 设置TST样式
     */
    async function setupTSTStyles() {
        const tstStyles = `/* AWS Environment Browser - TST样式 */
.tab[data-current-uri*="console.aws.amazon.com"]:not([data-current-uri*="dev"]):not([data-current-uri*="test"]):not([data-current-uri*="staging"]) {
    background: linear-gradient(135deg, #dc3545, #c82333) !important;
    color: white !important;
    border-left: 4px solid #dc3545 !important;
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3) !important;
}
.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="dev"] {
    background: linear-gradient(135deg, #28a745, #218838) !important;
    color: white !important;
    border-left: 4px solid #28a745 !important;
}
.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="test"] {
    background: linear-gradient(135deg, #007bff, #0056b3) !important;
    color: white !important;
    border-left: 4px solid #007bff !important;
}
.tab[data-current-uri*="console.aws.amazon.com"]:not([data-current-uri*="dev"]):not([data-current-uri*="test"]):not([data-current-uri*="staging"]) .label::before {
    content: "🔴 ";
}
.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="dev"] .label::before {
    content: "🟢 ";
}
.tab[data-current-uri*="console.aws.amazon.com"][data-current-uri*="test"] .label::before {
    content: "🔵 ";
}`;
        
        try {
            // 复制到剪贴板
            await navigator.clipboard.writeText(tstStyles);
            
            showStatus('✅ TST样式已复制到剪贴板！', 'success');
            
            // 显示使用说明
            setTimeout(() => {
                alert(`TST样式已复制！请按以下步骤设置：

1. 右键点击TST侧边栏
2. 选择"选项"或"设置"  
3. 找到"外观" → "用户样式表"
4. 粘贴复制的样式代码
5. 保存设置并重启Firefox

设置完成后，AWS控制台标签页将显示环境颜色：
🔴 生产环境 - 红色
🟢 开发环境 - 绿色  
🔵 测试环境 - 蓝色`);
            }, 1000);
            
        } catch (error) {
            console.error('复制失败:', error);
            showStatus('📋 请手动复制TST样式代码', 'warning');
        }
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM内容已加载，开始初始化');
            initializePopup();
        });
    } else {
        console.log('DOM已就绪，立即初始化');
        initializePopup();
    }
    
    // 额外的安全检查，确保所有元素都已加载
    window.addEventListener('load', () => {
        console.log('页面完全加载，重新绑定事件');
        // 重新绑定添加环境按钮，以防之前绑定失败
        const addEnvBtn = document.getElementById('addEnvironment');
        if (addEnvBtn && !addEnvBtn.hasAttribute('data-bound')) {
            console.log('重新绑定添加环境按钮');
            addEnvBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('添加环境按钮被点击（重新绑定）');
                showEnvironmentForm();
            });
            addEnvBtn.setAttribute('data-bound', 'true');
        }
    });
    
    /**
     * 编辑环境区域
     */
    function editEnvironmentRegions(envId) {
        const env = currentEnvironments.find(e => e.id === envId);
        if (!env) return;
        
        editingRegionEnvironmentId = envId;
        
        // 设置弹窗标题
        document.getElementById('regionModalTitle').textContent = `编辑 ${env.name} 的区域设置`;
        
        // 渲染当前区域
        renderCurrentRegions(env.regions || []);
        
        // 渲染可用区域
        renderAvailableRegions(env.regions || []);
        
        // 显示弹窗
        document.getElementById('regionEditModal').style.display = 'flex';
    }
    
    /**
     * 渲染当前区域列表
     */
    function renderCurrentRegions(currentRegions) {
        const container = document.getElementById('currentRegionsList');
        container.innerHTML = '';
        
        if (currentRegions.length === 0) {
            container.innerHTML = '<div style="color: rgba(255,255,255,0.6); font-size: 12px; padding: 10px;">未设置区域</div>';
            return;
        }
        
        currentRegions.forEach(regionCode => {
            const regionInfo = awsRegions[regionCode];
            if (!regionInfo) return;
            
            const regionItem = document.createElement('div');
            regionItem.className = 'region-item selected';
            regionItem.dataset.region = regionCode;
            
            regionItem.innerHTML = `
                <div class="region-item-info">
                    <span class="region-flag">${regionInfo.flag}</span>
                    <div class="region-details">
                        <div class="region-name">${regionInfo.name}</div>
                        <div class="region-code">${regionCode}</div>
                    </div>
                </div>
                <div class="region-action">➖</div>
            `;
            
            regionItem.addEventListener('click', () => {
                removeRegionFromEnvironment(regionCode);
            });
            
            container.appendChild(regionItem);
        });
    }
    
    /**
     * 渲染可用区域列表
     */
    function renderAvailableRegions(currentRegions) {
        const container = document.getElementById('availableRegionsList');
        container.innerHTML = '';
        
        Object.entries(awsRegions).forEach(([regionCode, regionInfo]) => {
            if (currentRegions.includes(regionCode)) return;
            
            const regionItem = document.createElement('div');
            regionItem.className = 'region-item';
            regionItem.dataset.region = regionCode;
            
            regionItem.innerHTML = `
                <div class="region-item-info">
                    <span class="region-flag">${regionInfo.flag}</span>
                    <div class="region-details">
                        <div class="region-name">${regionInfo.name}</div>
                        <div class="region-code">${regionCode}</div>
                    </div>
                </div>
                <div class="region-action">➕</div>
            `;
            
            regionItem.addEventListener('click', () => {
                addRegionToEnvironment(regionCode);
            });
            
            container.appendChild(regionItem);
        });
    }
    
    /**
     * 添加区域到环境
     */
    function addRegionToEnvironment(regionCode) {
        const env = currentEnvironments.find(e => e.id === editingRegionEnvironmentId);
        if (!env) return;
        
        if (!env.regions) env.regions = [];
        if (!env.regions.includes(regionCode)) {
            env.regions.push(regionCode);
            
            // 重新渲染
            renderCurrentRegions(env.regions);
            renderAvailableRegions(env.regions);
        }
    }
    
    /**
     * 从环境移除区域
     */
    function removeRegionFromEnvironment(regionCode) {
        const env = currentEnvironments.find(e => e.id === editingRegionEnvironmentId);
        if (!env || !env.regions) return;
        
        env.regions = env.regions.filter(r => r !== regionCode);
        
        // 重新渲染
        renderCurrentRegions(env.regions);
        renderAvailableRegions(env.regions);
    }
    
    /**
     * 保存环境区域设置
     */
    async function saveEnvironmentRegions() {
        try {
            await saveEnvironmentConfig();
            renderEnvironmentList();
            hideRegionEditModal();
            showStatus('✅ 区域设置已保存', 'success');
        } catch (error) {
            console.error('保存区域设置失败:', error);
            showStatus('保存区域设置失败', 'error');
        }
    }
    
    /**
     * 隐藏区域编辑弹窗
     */
    function hideRegionEditModal() {
        document.getElementById('regionEditModal').style.display = 'none';
        editingRegionEnvironmentId = null;
    }
        try {
            // 重置为默认颜色
            const defaultRegionColors = {
                'us-east-1': { name: '美国东部 (北弗吉尼亚)', flag: '🇺🇸', color: '#ff6b6b' },
                'us-east-2': { name: '美国东部 (俄亥俄)', flag: '🇺🇸', color: '#ff8e8e' },
                'us-west-1': { name: '美国西部 (加利福尼亚)', flag: '🇺🇸', color: '#ffb3b3' },
                'us-west-2': { name: '美国西部 (俄勒冈)', flag: '🇺🇸', color: '#ffd6d6' },
                'eu-west-1': { name: '欧洲 (爱尔兰)', flag: '🇪🇺', color: '#6bcf7f' },
                'eu-west-2': { name: '欧洲 (伦敦)', flag: '🇪🇺', color: '#8ed99f' },
                'eu-central-1': { name: '欧洲 (法兰克福)', flag: '🇪🇺', color: '#b3e6bf' },
                'ap-southeast-1': { name: '亚太 (新加坡)', flag: '🇸🇬', color: '#74c0fc' },
                'ap-northeast-1': { name: '亚太 (东京)', flag: '🇯🇵', color: '#a5d8ff' },
                'ap-south-1': { name: '亚太 (孟买)', flag: '🇮🇳', color: '#d0ebff' }
            };
            
            Object.assign(awsRegions, defaultRegionColors);
            
            // 保存设置
            if (window.DataSyncManager && window.DataSyncManager.isInitialized) {
                const settings = await window.DataSyncManager.getSettings();
                settings.regionColors = awsRegions;
                await window.DataSyncManager.saveSettings(settings);
            }
            
            // 重新渲染
            renderRegionSettings();
            showStatus('✅ 区域颜色已重置', 'success');
            
        } catch (error) {
            console.error('重置区域颜色失败:', error);
            showStatus('重置区域颜色失败', 'error');
        }
    }
    
    /**
     * 切换区域颜色功能
     */
    async function toggleRegionColors() {
        try {
            if (window.DataSyncManager && window.DataSyncManager.isInitialized) {
                const settings = await window.DataSyncManager.getSettings();
                settings.enableRegionColors = !settings.enableRegionColors;
                await window.DataSyncManager.saveSettings(settings);
                
                const toggleBtn = document.getElementById('toggleRegionColors');
                const textSpan = toggleBtn.querySelector('.tool-text');
                
                if (settings.enableRegionColors) {
                    textSpan.textContent = '禁用区域颜色';
                    showStatus('✅ 区域颜色已启用', 'success');
                } else {
                    textSpan.textContent = '启用区域颜色';
                    showStatus('✅ 区域颜色已禁用', 'success');
                }
            }
        } catch (error) {
            console.error('切换区域颜色失败:', error);
            showStatus('切换区域颜色失败', 'error');
        }
    }
    
})();
