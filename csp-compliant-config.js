/**
 * AWS Environment Browser Extension - 配置页面脚本
 * 使用数据同步管理器确保数据一致性
 */

(function() {
    'use strict';
    
    let currentEnvironments = [];
    let currentSettings = {};
    
    /**
     * 初始化配置页面
     */
    async function initializeConfig() {
        try {
            console.log('初始化配置页面...');
            
            // 等待数据同步管理器初始化
            if (window.DataSyncManager && !window.DataSyncManager.isInitialized) {
                await window.DataSyncManager.initialize();
            }
            
            // 设置数据变化监听器
            if (window.DataSyncManager) {
                window.DataSyncManager.addListener((event, data) => {
                    console.log('配置页面收到数据变化事件:', event);
                    if (event === 'environments_changed' || event === 'environments_updated') {
                        currentEnvironments = data || currentEnvironments;
                        renderEnvironments();
                    } else if (event === 'settings_changed' || event === 'settings_updated') {
                        currentSettings = data || currentSettings;
                        renderSettings();
                    }
                });
            }
            
            // 加载数据
            await loadData();
            
            // 渲染界面
            renderEnvironments();
            renderSettings();
            
            // 绑定事件
            bindEvents();
            
            console.log('配置页面初始化完成');
            
        } catch (error) {
            console.error('配置页面初始化失败:', error);
            showMessage('初始化失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 加载数据
     */
    async function loadData() {
        try {
            if (window.DataSyncManager && window.DataSyncManager.isInitialized) {
                currentEnvironments = await window.DataSyncManager.getEnvironments();
                currentSettings = await window.DataSyncManager.getSettings();
            } else {
                // 降级方案
                if (typeof browser !== 'undefined' && browser.storage) {
                    const result = await browser.storage.local.get([
                        'aws_environments', 
                        'aws_settings'
                    ]);
                    currentEnvironments = result.aws_environments || [];
                    currentSettings = result.aws_settings || {};
                }
            }
            
            console.log('数据加载完成:', {
                environments: currentEnvironments.length,
                settings: Object.keys(currentSettings).length
            });
            
        } catch (error) {
            console.error('加载数据失败:', error);
        }
    }
    
    /**
     * 渲染环境列表
     */
    function renderEnvironments() {
        const container = document.getElementById('environmentsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        currentEnvironments.forEach((env, index) => {
            const envDiv = document.createElement('div');
            envDiv.className = 'environment-item';
            envDiv.innerHTML = `
                <div class="environment-header">
                    <span class="environment-icon">${env.icon}</span>
                    <span class="environment-name">${env.name}</span>
                    <div class="environment-actions">
                        <button class="btn-edit" data-index="${index}">编辑</button>
                        ${!['production', 'development', 'staging'].includes(env.id) ? 
                          `<button class="btn-delete" data-index="${index}">删除</button>` : ''}
                    </div>
                </div>
                <div class="environment-details">
                    <p><strong>描述:</strong> ${env.description}</p>
                    <p><strong>颜色:</strong> <span style="background: ${env.color}; padding: 2px 8px; border-radius: 3px; color: white;">${env.color}</span></p>
                    <p><strong>账号ID:</strong> ${env.accountId}</p>
                    <p><strong>角色:</strong> ${env.roleName}</p>
                    <p><strong>区域:</strong> ${env.regions ? env.regions.join(', ') : 'N/A'}</p>
                </div>
            `;
            container.appendChild(envDiv);
        });
        
        // 绑定环境操作事件
        container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                editEnvironment(index);
            });
        });
        
        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                deleteEnvironment(index);
            });
        });
    }
    
    /**
     * 渲染设置
     */
    function renderSettings() {
        // 自动TST设置
        const autoTSTCheckbox = document.getElementById('autoTSTSetup');
        if (autoTSTCheckbox) {
            autoTSTCheckbox.checked = currentSettings.autoTSTSetup !== false;
        }
        
        // 生产环境警告
        const prodWarningCheckbox = document.getElementById('showProductionWarning');
        if (prodWarningCheckbox) {
            prodWarningCheckbox.checked = currentSettings.showProductionWarning !== false;
        }
        
        // 区域颜色
        const regionColorsCheckbox = document.getElementById('enableRegionColors');
        if (regionColorsCheckbox) {
            regionColorsCheckbox.checked = currentSettings.enableRegionColors !== false;
        }
        
        // 环境图标
        const envIconsCheckbox = document.getElementById('enableEnvironmentIcons');
        if (envIconsCheckbox) {
            envIconsCheckbox.checked = currentSettings.enableEnvironmentIcons !== false;
        }
        
        // 脉冲动画
        const pulseAnimationCheckbox = document.getElementById('pulseAnimationEnabled');
        if (pulseAnimationCheckbox) {
            pulseAnimationCheckbox.checked = currentSettings.pulseAnimationEnabled !== false;
        }
    }
    
    /**
     * 绑定事件
     */
    function bindEvents() {
        // 保存按钮
        const saveBtn = document.getElementById('saveConfig');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveConfiguration);
        }
        
        // 重置按钮
        const resetBtn = document.getElementById('resetConfig');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetConfiguration);
        }
        
        // 强制同步按钮
        const syncBtn = document.getElementById('forceSync');
        if (syncBtn) {
            syncBtn.addEventListener('click', forceSync);
        }
        
        // 添加环境按钮
        const addEnvBtn = document.getElementById('addEnvironment');
        if (addEnvBtn) {
            addEnvBtn.addEventListener('click', addEnvironment);
        }
        
        // 设置变化监听
        const settingsInputs = document.querySelectorAll('#settingsForm input[type="checkbox"]');
        settingsInputs.forEach(input => {
            input.addEventListener('change', updateSettings);
        });
    }
    
    /**
     * 保存配置
     */
    async function saveConfiguration() {
        try {
            showMessage('正在保存配置...', 'info');
            
            // 收集设置数据
            const settings = {
                autoTSTSetup: document.getElementById('autoTSTSetup')?.checked !== false,
                showProductionWarning: document.getElementById('showProductionWarning')?.checked !== false,
                enableRegionColors: document.getElementById('enableRegionColors')?.checked !== false,
                enableEnvironmentIcons: document.getElementById('enableEnvironmentIcons')?.checked !== false,
                pulseAnimationEnabled: document.getElementById('pulseAnimationEnabled')?.checked !== false
            };
            
            // 保存数据
            if (window.DataSyncManager && window.DataSyncManager.isInitialized) {
                await window.DataSyncManager.saveEnvironments(currentEnvironments);
                await window.DataSyncManager.saveSettings(settings);
            } else {
                // 降级方案
                if (typeof browser !== 'undefined' && browser.storage) {
                    await browser.storage.local.set({
                        aws_environments: currentEnvironments,
                        aws_settings: settings,
                        aws_last_sync: Date.now()
                    });
                }
            }
            
            showMessage('配置保存成功！', 'success');
            
        } catch (error) {
            console.error('保存配置失败:', error);
            showMessage('保存配置失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 重置配置
     */
    async function resetConfiguration() {
        if (confirm('确定要重置所有配置到默认值吗？此操作不可撤销。')) {
            try {
                if (window.DataSyncManager && window.DataSyncManager.isInitialized) {
                    await window.DataSyncManager.resetToDefaults();
                    await loadData();
                    renderEnvironments();
                    renderSettings();
                    showMessage('配置已重置为默认值', 'success');
                }
            } catch (error) {
                console.error('重置配置失败:', error);
                showMessage('重置配置失败: ' + error.message, 'error');
            }
        }
    }
    
    /**
     * 强制同步
     */
    async function forceSync() {
        try {
            showMessage('正在强制同步数据...', 'info');
            
            if (window.DataSyncManager && window.DataSyncManager.isInitialized) {
                await window.DataSyncManager.forceSync();
                await loadData();
                renderEnvironments();
                renderSettings();
                showMessage('数据同步完成！', 'success');
            }
        } catch (error) {
            console.error('强制同步失败:', error);
            showMessage('强制同步失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 更新设置
     */
    function updateSettings() {
        currentSettings = {
            autoTSTSetup: document.getElementById('autoTSTSetup')?.checked !== false,
            showProductionWarning: document.getElementById('showProductionWarning')?.checked !== false,
            enableRegionColors: document.getElementById('enableRegionColors')?.checked !== false,
            enableEnvironmentIcons: document.getElementById('enableEnvironmentIcons')?.checked !== false,
            pulseAnimationEnabled: document.getElementById('pulseAnimationEnabled')?.checked !== false
        };
    }
    
    /**
     * 显示消息
     */
    function showMessage(message, type) {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `message message-${type}`;
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    }
    
    /**
     * 编辑环境
     */
    function editEnvironment(index) {
        // 这里可以实现环境编辑功能
        console.log('编辑环境:', index);
    }
    
    /**
     * 删除环境
     */
    async function deleteEnvironment(index) {
        if (confirm('确定要删除这个环境吗？')) {
            currentEnvironments.splice(index, 1);
            renderEnvironments();
            await saveConfiguration();
        }
    }
    
    /**
     * 添加环境
     */
    function addEnvironment() {
        // 这里可以实现添加环境功能
        console.log('添加环境');
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeConfig);
    } else {
        initializeConfig();
    }
    
    console.log('配置页面脚本已加载');
})();
