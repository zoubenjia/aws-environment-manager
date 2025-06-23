/**
 * AWS Environment Browser Extension - 安全弹出窗口
 * 所有DOM操作都进行安全检查
 */

(function() {
    'use strict';
    
    console.log('安全弹出窗口脚本开始加载...');
    
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
            regions: ['eu-west-2', 'us-east-1'],
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console'
        },
        {
            id: 'development',
            name: '开发环境',
            icon: '🟢',
            color: '#28a745',
            description: '开发环境 - 安全测试',
            accountId: '487783143761',
            roleName: 'PowerUserAccess_dev',
            regions: ['eu-central-1', 'us-west-2'],
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console'
        },
        {
            id: 'staging',
            name: '测试环境',
            icon: '🔵',
            color: '#007bff',
            description: '测试环境 - 预发布验证',
            accountId: '487783143761',
            roleName: 'PowerUserAccess_staging',
            regions: ['ap-southeast-1', 'ap-northeast-1'],
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console'
        }
    ];
    
    let currentEnvironments = [...defaultEnvironments];
    
    /**
     * 安全获取元素
     */
    function safeGetElement(id) {
        try {
            const element = document.getElementById(id);
            if (element) {
                console.log(`✅ 找到元素: ${id}`);
                return element;
            } else {
                console.warn(`⚠️ 未找到元素: ${id}`);
                return null;
            }
        } catch (error) {
            console.error(`❌ 获取元素失败: ${id}`, error);
            return null;
        }
    }
    
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
        console.log('=== 安全调试信息开始 ===');
        
        // 检查所有相关元素
        const elementsToCheck = [
            'environmentList',
            'environmentForm',
            'envName',
            'envIcon',
            'envColor',
            'envDescription',
            'envAccountId',
            'envRoleName',
            'envRegions',
            'addEnvironment',
            'saveEnvironment',
            'cancelEnvironment',
            'debugData',
            'saveEnvironments'
        ];
        
        const elementStatus = {};
        elementsToCheck.forEach(id => {
            const element = document.getElementById(id);
            elementStatus[id] = element ? '✅ 存在' : '❌ 不存在';
        });
        
        console.log('元素检查结果:', elementStatus);
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
        
        console.log('=== 安全调试信息结束 ===');
        
        // 显示简化的调试信息
        const missingElements = Object.entries(elementStatus)
            .filter(([id, status]) => status.includes('❌'))
            .map(([id]) => id);
        
        const debugInfo = `
安全调试信息：
- 当前环境数量: ${currentEnvironments.length}
- Browser API: ${typeof browser !== 'undefined' ? '可用' : '不可用'}
- 缺失的元素: ${missingElements.length > 0 ? missingElements.join(', ') : '无'}

详细信息请查看控制台
        `;
        
        alert(debugInfo.trim());
        showStatus('安全调试信息已输出', 'info');
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
     * 安全颜色选择器
     */
    function showColorPicker(envId, currentColor, targetElement) {
        console.log('显示安全颜色选择器:', envId, currentColor);
        
        // 移除现有选择器
        const existing = document.querySelector('.safe-color-picker');
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
        picker.className = 'safe-color-picker';
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
        
        // 智能定位
        document.body.appendChild(picker);
        
        const rect = targetElement.getBoundingClientRect();
        const pickerRect = picker.getBoundingClientRect();
        
        let left = rect.right + 10;
        let top = rect.top;
        
        // 边界检查
        if (left + pickerRect.width > window.innerWidth) {
            left = rect.left - pickerRect.width - 10;
        }
        if (top + pickerRect.height > window.innerHeight) {
            top = window.innerHeight - pickerRect.height - 10;
        }
        
        left = Math.max(10, Math.min(left, window.innerWidth - pickerRect.width - 10));
        top = Math.max(10, Math.min(top, window.innerHeight - pickerRect.height - 10));
        
        picker.style.left = `${left}px`;
        picker.style.top = `${top}px`;
        
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
     * 安全渲染环境列表
     */
    function renderEnvironments() {
        console.log('安全渲染环境列表...');
        
        const container = safeGetElement('environmentList');
        if (!container) {
            console.error('找不到环境列表容器，无法渲染');
            showStatus('❌ 找不到环境列表容器', 'error');
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
                padding: 12px;
                margin-bottom: 8px;
                background: rgba(255,255,255,0.1);
                border-radius: 8px;
                border-left: 4px solid ${env.color};
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            // 添加悬停效果
            envDiv.addEventListener('mouseenter', () => {
                envDiv.style.background = 'rgba(255,255,255,0.15)';
                envDiv.style.transform = 'translateX(2px)';
            });
            
            envDiv.addEventListener('mouseleave', () => {
                envDiv.style.background = 'rgba(255,255,255,0.1)';
                envDiv.style.transform = 'translateX(0)';
            });
            
            envDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div style="font-size: 24px;">${env.icon}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: white; font-size: 14px;">${env.name}</div>
                        <div style="font-size: 11px; color: rgba(255,255,255,0.8); margin: 2px 0;">${env.description}</div>
                        <div style="font-size: 10px; color: rgba(255,255,255,0.6);">
                            区域: ${env.regions ? env.regions.join(', ') : '未设置'}
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <div class="color-btn" style="width: 24px; height: 24px; background: ${env.color}; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.5); transition: all 0.2s ease;" 
                         data-env-id="${env.id}" title="更改颜色"></div>
                    <div class="edit-btn" style="width: 24px; height: 24px; background: rgba(255,255,255,0.2); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.2s ease;" 
                         data-env-id="${env.id}" title="编辑环境">✏️</div>
                    <div class="region-btn" style="width: 24px; height: 24px; background: rgba(116, 192, 252, 0.3); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.2s ease;" 
                         data-env-id="${env.id}" title="设置区域">🌍</div>
                    ${!['production', 'development', 'staging'].includes(env.id) ? 
                      `<div class="delete-btn" style="width: 24px; height: 24px; background: rgba(220, 53, 69, 0.3); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.2s ease;" 
                           data-env-id="${env.id}" title="删除环境">🗑️</div>` : ''}
                </div>
            `;
            
            // 绑定颜色按钮事件
            const colorBtn = envDiv.querySelector('.color-btn');
            if (colorBtn) {
                colorBtn.addEventListener('mouseenter', () => {
                    colorBtn.style.transform = 'scale(1.2)';
                    colorBtn.style.borderColor = 'white';
                });
                colorBtn.addEventListener('mouseleave', () => {
                    colorBtn.style.transform = 'scale(1)';
                    colorBtn.style.borderColor = 'rgba(255,255,255,0.5)';
                });
                colorBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('点击颜色按钮:', env.id);
                    showColorPicker(env.id, env.color, colorBtn);
                });
            }
            
            // 绑定编辑按钮事件
            const editBtn = envDiv.querySelector('.edit-btn');
            if (editBtn) {
                editBtn.addEventListener('mouseenter', () => {
                    editBtn.style.transform = 'scale(1.2)';
                    editBtn.style.background = 'rgba(255,255,255,0.3)';
                });
                editBtn.addEventListener('mouseleave', () => {
                    editBtn.style.transform = 'scale(1)';
                    editBtn.style.background = 'rgba(255,255,255,0.2)';
                });
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('点击编辑按钮:', env.id);
                    editEnvironment(env.id);
                });
            }
            
            // 绑定区域按钮事件
            const regionBtn = envDiv.querySelector('.region-btn');
            if (regionBtn) {
                regionBtn.addEventListener('mouseenter', () => {
                    regionBtn.style.transform = 'scale(1.2)';
                    regionBtn.style.background = 'rgba(116, 192, 252, 0.5)';
                });
                regionBtn.addEventListener('mouseleave', () => {
                    regionBtn.style.transform = 'scale(1)';
                    regionBtn.style.background = 'rgba(116, 192, 252, 0.3)';
                });
                regionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('点击区域按钮:', env.id);
                    editEnvironmentRegions(env.id);
                });
            }
            
            // 绑定删除按钮事件
            const deleteBtn = envDiv.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('mouseenter', () => {
                    deleteBtn.style.transform = 'scale(1.2)';
                    deleteBtn.style.background = 'rgba(220, 53, 69, 0.5)';
                });
                deleteBtn.addEventListener('mouseleave', () => {
                    deleteBtn.style.transform = 'scale(1)';
                    deleteBtn.style.background = 'rgba(220, 53, 69, 0.3)';
                });
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('点击删除按钮:', env.id);
                    deleteEnvironment(env.id);
                });
            }
            
            // 绑定整个环境项的点击事件（切换环境）
            envDiv.addEventListener('click', (e) => {
                // 如果点击的是按钮，不触发环境切换
                if (e.target.classList.contains('color-btn') || 
                    e.target.classList.contains('edit-btn') || 
                    e.target.classList.contains('region-btn') || 
                    e.target.classList.contains('delete-btn')) {
                    return;
                }
                console.log('点击环境项，打开控制台:', env.name);
                switchToEnvironment(env);
            });
            
            // 绑定右键菜单（选择AWS服务）
            envDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showServiceMenu(env, e.clientX, e.clientY);
            });
            
            container.appendChild(envDiv);
        });
        
        console.log('环境列表渲染完成，包含交互功能');
    }
    
    /**
     * 构建AWS SSO控制台URL
     */
    function buildAWSConsoleUrl(env, serviceId = 'home') {
        const region = env.regions && env.regions.length > 0 ? env.regions[0] : 'eu-west-2';
        
        // 构建目标服务URL
        const serviceUrls = {
            'home': `https://${region}.console.aws.amazon.com/console/home?region=${region}`,
            'ec2': `https://${region}.console.aws.amazon.com/ec2/home?region=${region}`,
            's3': `https://s3.console.aws.amazon.com/s3/home?region=${region}`,
            'lambda': `https://${region}.console.aws.amazon.com/lambda/home?region=${region}`,
            'rds': `https://${region}.console.aws.amazon.com/rds/home?region=${region}`,
            'cloudformation': `https://${region}.console.aws.amazon.com/cloudformation/home?region=${region}`,
            'iam': `https://console.aws.amazon.com/iam/home`,
            'cloudwatch': `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}`,
            'vpc': `https://${region}.console.aws.amazon.com/vpc/home?region=${region}`,
            'cloudtrail': `https://${region}.console.aws.amazon.com/cloudtrail/home?region=${region}`
        };
        
        const destinationUrl = serviceUrls[serviceId] || serviceUrls['home'];
        
        // 如果有SSO配置，使用SSO URL格式
        if (env.ssoStartUrl && env.accountId && env.roleName) {
            const ssoUrl = `${env.ssoStartUrl}?account_id=${env.accountId}&role_name=${env.roleName}&destination=${encodeURIComponent(destinationUrl)}`;
            return ssoUrl;
        }
        
        // 如果有传统的账号ID和角色，使用传统切换角色URL
        if (env.accountId && env.roleName) {
            const switchRoleUrl = `https://signin.aws.amazon.com/switchrole?` +
                `account=${env.accountId}&` +
                `roleName=${env.roleName}&` +
                `displayName=${encodeURIComponent(env.name)}&` +
                `color=${encodeURIComponent(env.color.replace('#', ''))}&` +
                `region=${region}&` +
                `destination=${encodeURIComponent(destinationUrl)}`;
            return switchRoleUrl;
        }
        
        // 默认直接返回服务URL
        return destinationUrl;
    }
    
    /**
     * 获取AWS控制台URL (保持向后兼容)
     */
    function getAWSConsoleUrl(env, service = 'home') {
        return buildAWSConsoleUrl(env, service);
    }
    
    /**
     * 切换到指定环境 - 打开AWS控制台
     */
    function switchToEnvironment(env) {
        console.log('切换到环境并打开SSO控制台:', env.name);
        
        // 显示生产环境警告
        if (env.id === 'production') {
            const confirmed = confirm(`⚠️ 警告：您即将打开生产环境控制台！\n\n环境: ${env.name}\n描述: ${env.description}\n区域: ${env.regions ? env.regions.join(', ') : '默认'}\n账号: ${env.accountId || '未配置'}\n角色: ${env.roleName || '未配置'}\n\n生产环境操作需要格外谨慎，确定要继续吗？`);
            if (!confirmed) {
                console.log('用户取消打开生产环境控制台');
                return;
            }
        }
        
        try {
            // 使用新的SSO URL构建函数
            const targetUrl = buildAWSConsoleUrl(env, 'home');
            
            console.log('打开AWS SSO控制台URL:', targetUrl);
            
            // 在新标签页中打开
            if (typeof browser !== 'undefined' && browser.tabs) {
                browser.tabs.create({ 
                    url: targetUrl,
                    active: true
                });
            } else {
                window.open(targetUrl, '_blank');
            }
            
            showStatus(`🚀 正在通过SSO打开 ${env.name} 控制台...`, 'success');
            
            // 延迟关闭弹窗
            setTimeout(() => {
                if (window.close) {
                    window.close();
                }
            }, 1500);
            
        } catch (error) {
            console.error('打开SSO控制台失败:', error);
            showStatus('❌ 打开控制台失败: ' + error.message, 'error');
        }
    }
                const consoleUrl = getAWSConsoleUrl(env, 'home');
                console.log('打开控制台URL:', consoleUrl);
                
                if (typeof browser !== 'undefined' && browser.tabs) {
                    browser.tabs.create({ 
                        url: consoleUrl,
                        active: true
                    });
                } else {
                    window.open(consoleUrl, '_blank');
                }
                
                showStatus(`🚀 正在打开 ${env.name} 控制台...`, 'success');
            }
            
            // 延迟关闭弹窗
            setTimeout(() => {
                if (window.close) {
                    window.close();
                }
            }, 1500);
            
        } catch (error) {
            console.error('打开控制台失败:', error);
            showStatus('❌ 打开控制台失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 编辑环境
     */
    function editEnvironment(envId) {
        console.log('编辑环境:', envId);
        
        const env = currentEnvironments.find(e => e.id === envId);
        if (!env) {
            showStatus('❌ 找不到指定环境', 'error');
            return;
        }
        
        try {
            // 使用prompt进行简单编辑
            const newName = prompt('环境名称:', env.name);
            if (newName === null) return; // 用户取消
            
            const newDesc = prompt('环境描述:', env.description);
            if (newDesc === null) return;
            
            const newIcon = prompt('环境图标:', env.icon);
            if (newIcon === null) return;
            
            // 更新环境
            env.name = newName.trim() || env.name;
            env.description = newDesc.trim() || env.description;
            env.icon = newIcon.trim() || env.icon;
            
            // 保存并重新渲染
            saveEnvironments();
            renderEnvironments();
            showStatus('✅ 环境已更新', 'success');
            
        } catch (error) {
            console.error('编辑环境失败:', error);
            showStatus('❌ 编辑失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 删除环境
     */
    function deleteEnvironment(envId) {
        console.log('删除环境:', envId);
        
        const env = currentEnvironments.find(e => e.id === envId);
        if (!env) {
            showStatus('❌ 找不到指定环境', 'error');
            return;
        }
        
        // 防止删除默认环境
        if (['production', 'development', 'staging'].includes(envId)) {
            showStatus('❌ 不能删除默认环境', 'error');
            return;
        }
        
        const confirmed = confirm(`确定要删除环境 "${env.name}" 吗？\n\n此操作不可撤销！`);
        if (!confirmed) {
            console.log('用户取消删除操作');
            return;
        }
        
        try {
            // 从数组中移除
            const index = currentEnvironments.findIndex(e => e.id === envId);
            if (index !== -1) {
                currentEnvironments.splice(index, 1);
                
                // 保存并重新渲染
                saveEnvironments();
                renderEnvironments();
                showStatus('✅ 环境已删除', 'success');
            }
            
        } catch (error) {
            console.error('删除环境失败:', error);
            showStatus('❌ 删除失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 编辑环境区域
     */
    function editEnvironmentRegions(envId) {
        console.log('编辑环境区域:', envId);
        
        const env = currentEnvironments.find(e => e.id === envId);
        if (!env) {
            showStatus('❌ 找不到指定环境', 'error');
            return;
        }
        
        try {
            const availableRegions = [
                'us-east-1 (美国东部-北弗吉尼亚)',
                'us-east-2 (美国东部-俄亥俄)',
                'us-west-1 (美国西部-加利福尼亚)',
                'us-west-2 (美国西部-俄勒冈)',
                'eu-west-1 (欧洲-爱尔兰)',
                'eu-west-2 (欧洲-伦敦)',
                'eu-central-1 (欧洲-法兰克福)',
                'ap-southeast-1 (亚太-新加坡)',
                'ap-northeast-1 (亚太-东京)',
                'ap-south-1 (亚太-孟买)'
            ];
            
            const currentRegionsStr = env.regions ? env.regions.join(', ') : '';
            
            let message = `当前区域: ${currentRegionsStr}\n\n可用区域:\n`;
            availableRegions.forEach((region, index) => {
                message += `${index + 1}. ${region}\n`;
            });
            message += '\n请输入区域代码，用逗号分隔 (如: us-east-1,eu-west-1):';
            
            const newRegionsStr = prompt(message, currentRegionsStr);
            if (newRegionsStr === null) return; // 用户取消
            
            // 解析输入的区域
            const newRegions = newRegionsStr.split(',')
                .map(r => r.trim())
                .filter(r => r.length > 0);
            
            if (newRegions.length === 0) {
                showStatus('❌ 请至少选择一个区域', 'error');
                return;
            }
            
            // 验证区域代码
            const validRegions = ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 
                                'eu-west-1', 'eu-west-2', 'eu-central-1', 
                                'ap-southeast-1', 'ap-northeast-1', 'ap-south-1'];
            
            const invalidRegions = newRegions.filter(r => !validRegions.includes(r));
            if (invalidRegions.length > 0) {
                showStatus(`❌ 无效的区域代码: ${invalidRegions.join(', ')}`, 'error');
                return;
            }
            
            // 更新环境区域
            env.regions = newRegions;
            
            // 保存并重新渲染
            saveEnvironments();
            renderEnvironments();
            showStatus('✅ 区域设置已更新', 'success');
            
        } catch (error) {
            console.error('编辑区域失败:', error);
            showStatus('❌ 编辑区域失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 显示AWS服务选择菜单
     */
    function showServiceMenu(env, x, y) {
        console.log('显示服务菜单:', env.name);
        
        // 移除现有菜单
        const existingMenu = document.querySelector('.service-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // AWS服务列表
        const services = [
            { id: 'home', name: '🏠 控制台主页', icon: '🏠' },
            { id: 'ec2', name: '💻 EC2 实例', icon: '💻' },
            { id: 's3', name: '🪣 S3 存储', icon: '🪣' },
            { id: 'lambda', name: '⚡ Lambda 函数', icon: '⚡' },
            { id: 'rds', name: '🗄️ RDS 数据库', icon: '🗄️' },
            { id: 'vpc', name: '🌐 VPC 网络', icon: '🌐' },
            { id: 'cloudformation', name: '📋 CloudFormation', icon: '📋' },
            { id: 'iam', name: '🔐 IAM 权限', icon: '🔐' },
            { id: 'cloudwatch', name: '📊 CloudWatch', icon: '📊' },
            { id: 'cloudtrail', name: '👣 CloudTrail', icon: '👣' }
        ];
        
        // 创建菜单
        const menu = document.createElement('div');
        menu.className = 'service-menu';
        menu.style.cssText = `
            position: fixed;
            background: white;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 8px 0;
            z-index: 99999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            min-width: 200px;
            max-height: 300px;
            overflow-y: auto;
        `;
        
        // 添加标题
        const title = document.createElement('div');
        title.style.cssText = `
            padding: 8px 16px;
            font-weight: bold;
            color: #333;
            border-bottom: 1px solid #eee;
            font-size: 12px;
        `;
        title.textContent = `${env.icon} ${env.name} - 选择服务`;
        menu.appendChild(title);
        
        // 添加服务选项
        services.forEach(service => {
            const serviceItem = document.createElement('div');
            serviceItem.style.cssText = `
                padding: 10px 16px;
                cursor: pointer;
                transition: background 0.2s ease;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            serviceItem.innerHTML = `
                <span style="font-size: 16px;">${service.icon}</span>
                <span>${service.name.replace(service.icon + ' ', '')}</span>
            `;
            
            serviceItem.addEventListener('mouseenter', () => {
                serviceItem.style.background = '#f0f0f0';
            });
            
            serviceItem.addEventListener('mouseleave', () => {
                serviceItem.style.background = 'transparent';
            });
            
            serviceItem.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('选择服务:', service.id, '环境:', env.name);
                openAWSService(env, service.id);
                menu.remove();
            });
            
            menu.appendChild(serviceItem);
        });
        
        // 定位菜单
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        
        document.body.appendChild(menu);
        
        // 确保菜单在视窗内
        const menuRect = menu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            menu.style.left = `${x - menuRect.width}px`;
        }
        if (menuRect.bottom > window.innerHeight) {
            menu.style.top = `${y - menuRect.height}px`;
        }
        
        // 点击外部关闭菜单
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 100);
    }
    
    /**
     * 打开指定的AWS服务
     */
    function openAWSService(env, serviceId) {
        console.log('打开AWS SSO服务:', serviceId, '环境:', env.name);
        
        // 显示生产环境警告
        if (env.id === 'production') {
            const serviceName = {
                'home': '控制台主页',
                'ec2': 'EC2',
                's3': 'S3',
                'lambda': 'Lambda',
                'rds': 'RDS',
                'cloudformation': 'CloudFormation',
                'iam': 'IAM',
                'cloudwatch': 'CloudWatch',
                'vpc': 'VPC',
                'cloudtrail': 'CloudTrail'
            }[serviceId] || serviceId;
            
            const confirmed = confirm(`⚠️ 警告：您即将打开生产环境的 ${serviceName}！\n\n环境: ${env.name}\n服务: ${serviceName}\n区域: ${env.regions ? env.regions.join(', ') : '默认'}\n账号: ${env.accountId || '未配置'}\n角色: ${env.roleName || '未配置'}\n\n生产环境操作需要格外谨慎，确定要继续吗？`);
            if (!confirmed) {
                console.log('用户取消打开生产环境服务');
                return;
            }
        }
        
        try {
            // 使用新的SSO URL构建函数
            const targetUrl = buildAWSConsoleUrl(env, serviceId);
            
            console.log('打开AWS SSO服务URL:', targetUrl);
            
            // 在新标签页中打开
            if (typeof browser !== 'undefined' && browser.tabs) {
                browser.tabs.create({ 
                    url: targetUrl,
                    active: true
                });
            } else {
                window.open(targetUrl, '_blank');
            }
            
            const serviceName = {
                'home': '控制台主页',
                'ec2': 'EC2',
                's3': 'S3',
                'lambda': 'Lambda',
                'rds': 'RDS',
                'cloudformation': 'CloudFormation',
                'iam': 'IAM',
                'cloudwatch': 'CloudWatch',
                'vpc': 'VPC',
                'cloudtrail': 'CloudTrail'
            }[serviceId] || serviceId;
            
            showStatus(`🚀 正在通过SSO打开 ${env.name} 的 ${serviceName}...`, 'success');
            
            // 延迟关闭弹窗
            setTimeout(() => {
                if (window.close) {
                    window.close();
                }
            }, 1500);
            
        } catch (error) {
            console.error('打开AWS SSO服务失败:', error);
            showStatus('❌ 打开服务失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 安全添加环境 - 增强版
     */
    function safeAddEnvironment() {
        console.log('🎯 安全添加环境函数被调用');
        
        try {
            // 第一步：基本信息
            const envName = prompt('请输入环境名称:', '');
            if (!envName || envName.trim() === '') {
                console.log('用户取消或未输入环境名称');
                return;
            }
            
            const envDesc = prompt('请输入环境描述:', '自定义环境');
            if (envDesc === null) return; // 用户取消
            
            const envIcon = prompt('请输入环境图标 (emoji):', '🟡');
            if (envIcon === null) return;
            
            const envColor = prompt('请输入环境颜色 (如 #ff0000):', '#ffc107');
            if (envColor === null) return;
            
            // 第二步：AWS配置
            const useSSO = confirm('是否使用AWS SSO配置？\n\n点击"确定"配置SSO\n点击"取消"跳过AWS配置');
            
            let awsConfig = {};
            
            if (useSSO) {
                const accountId = prompt('请输入AWS账号ID:', '487783143761');
                if (accountId === null) return;
                
                const roleName = prompt('请输入角色名称:', 'PowerUserAccess');
                if (roleName === null) return;
                
                const ssoUrl = prompt('请输入SSO起始URL:', 'https://d-9067f2e3cc.awsapps.com/start/#/console');
                if (ssoUrl === null) return;
                
                awsConfig = {
                    accountId: accountId.trim(),
                    roleName: roleName.trim(),
                    ssoStartUrl: ssoUrl.trim()
                };
            }
            
            // 第三步：区域配置
            const regionConfig = confirm('是否配置AWS区域？\n\n点击"确定"选择区域\n点击"取消"使用默认区域');
            
            let regions = ['us-east-1']; // 默认区域
            
            if (regionConfig) {
                const availableRegions = [
                    'us-east-1 (美国东部-北弗吉尼亚)',
                    'us-east-2 (美国东部-俄亥俄)', 
                    'us-west-1 (美国西部-加利福尼亚)',
                    'us-west-2 (美国西部-俄勒冈)',
                    'eu-west-1 (欧洲-爱尔兰)',
                    'eu-west-2 (欧洲-伦敦)',
                    'eu-central-1 (欧洲-法兰克福)',
                    'ap-southeast-1 (亚太-新加坡)',
                    'ap-northeast-1 (亚太-东京)',
                    'ap-south-1 (亚太-孟买)'
                ];
                
                let message = '可用区域:\n';
                availableRegions.forEach((region, index) => {
                    message += `${index + 1}. ${region}\n`;
                });
                message += '\n请输入区域代码，用逗号分隔 (如: us-east-1,eu-west-2):';
                
                const regionInput = prompt(message, 'us-east-1');
                if (regionInput === null) return;
                
                if (regionInput.trim()) {
                    regions = regionInput.split(',').map(r => r.trim()).filter(r => r.length > 0);
                }
            }
            
            // 创建新环境对象
            const newEnvironment = {
                id: 'custom_' + Date.now(),
                name: envName.trim(),
                icon: envIcon.trim() || '🟡',
                color: envColor.trim() || '#ffc107',
                description: envDesc.trim() || '自定义环境',
                regions: regions,
                ...awsConfig
            };
            
            console.log('创建新环境:', newEnvironment);
            
            // 确认添加
            let confirmMessage = `确认添加以下环境？\n\n`;
            confirmMessage += `名称: ${newEnvironment.name}\n`;
            confirmMessage += `描述: ${newEnvironment.description}\n`;
            confirmMessage += `图标: ${newEnvironment.icon}\n`;
            confirmMessage += `颜色: ${newEnvironment.color}\n`;
            confirmMessage += `区域: ${newEnvironment.regions.join(', ')}\n`;
            
            if (newEnvironment.accountId) {
                confirmMessage += `账号ID: ${newEnvironment.accountId}\n`;
                confirmMessage += `角色: ${newEnvironment.roleName}\n`;
                confirmMessage += `SSO: ${newEnvironment.ssoStartUrl ? '已配置' : '未配置'}\n`;
            }
            
            const finalConfirm = confirm(confirmMessage);
            if (!finalConfirm) {
                console.log('用户取消添加环境');
                return;
            }
            
            // 添加到环境列表
            currentEnvironments.push(newEnvironment);
            
            // 保存到存储
            const saved = await saveEnvironments();
            if (saved) {
                // 重新渲染
                renderEnvironments();
                showStatus('✅ 环境添加成功', 'success');
                console.log('环境添加完成');
            } else {
                // 回滚
                currentEnvironments.pop();
                showStatus('❌ 保存失败', 'error');
            }
            
        } catch (error) {
            console.error('添加环境时出错:', error);
            showStatus('❌ 添加环境失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 简单添加环境测试
     */
    function simpleAddEnvironment() {
        console.log('🧪 简单添加环境测试');
        
        try {
            const newEnv = {
                id: 'test_' + Date.now(),
                name: '测试环境 ' + new Date().toLocaleTimeString(),
                icon: '🧪',
                color: '#17a2b8',
                description: '这是一个测试环境',
                regions: ['us-east-1'],
                accountId: '487783143761',
                roleName: 'PowerUserAccess_test',
                ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console'
            };
            
            console.log('创建测试环境:', newEnv);
            
            currentEnvironments.push(newEnv);
            saveEnvironments();
            renderEnvironments();
            showStatus('✅ 测试环境添加成功', 'success');
            
        } catch (error) {
            console.error('添加测试环境失败:', error);
            showStatus('❌ 添加测试环境失败', 'error');
        }
    }
    function bindEvents() {
        console.log('安全绑定事件...');
        
        // 调试按钮
        const debugBtn = safeGetElement('debugData');
        if (debugBtn) {
            debugBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('调试按钮被点击');
                debugData();
            });
            console.log('✅ 调试按钮事件已绑定');
        }
        
        // 保存按钮
        const saveBtn = safeGetElement('saveEnvironments');
        if (saveBtn) {
            saveBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('保存按钮被点击');
                await saveEnvironments();
            });
            console.log('✅ 保存按钮事件已绑定');
        }
        
        // 添加环境按钮
        const addEnvBtn = safeGetElement('addEnvironment');
        if (addEnvBtn) {
            console.log('✅ 找到添加环境按钮:', addEnvBtn);
            
            // 测试按钮是否可点击
            console.log('按钮状态:', {
                disabled: addEnvBtn.disabled,
                display: getComputedStyle(addEnvBtn).display,
                visibility: getComputedStyle(addEnvBtn).visibility,
                pointerEvents: getComputedStyle(addEnvBtn).pointerEvents
            });
            
            // 绑定点击事件
            addEnvBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 添加环境按钮被点击');
                safeAddEnvironment();
            });
            
            // 添加测试用的双击事件
            addEnvBtn.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 添加环境按钮被双击');
                alert('添加环境按钮双击测试成功！');
            });
            
            // 添加鼠标悬停测试
            addEnvBtn.addEventListener('mouseenter', () => {
                console.log('🖱️ 鼠标悬停在添加环境按钮上');
                addEnvBtn.style.transform = 'scale(1.05)';
            });
            
            addEnvBtn.addEventListener('mouseleave', () => {
                addEnvBtn.style.transform = 'scale(1)';
            });
            
            console.log('✅ 添加环境按钮事件已绑定');
        } else {
            console.error('❌ 找不到添加环境按钮');
            
            // 尝试通过其他方式查找
            const allButtons = document.querySelectorAll('button');
            console.log('页面中所有按钮:');
            allButtons.forEach((btn, index) => {
                console.log(`  ${index + 1}. ID: "${btn.id}", 文本: "${btn.textContent.trim()}"`);
                if (btn.textContent.includes('添加环境')) {
                    console.log('    ↑ 这个按钮包含"添加环境"文本');
                    // 直接绑定事件
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🎯 通过文本查找的添加环境按钮被点击');
                        safeAddEnvironment();
                    });
                }
            });
        }
        
        // 测试添加环境按钮
        const testAddBtn = safeGetElement('testAddEnvironment');
        if (testAddBtn) {
            testAddBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🧪 测试添加环境按钮被点击');
                simpleAddEnvironment();
            });
            console.log('✅ 测试添加环境按钮事件已绑定');
        }
        
        console.log('安全事件绑定完成');
    }
    
    /**
     * 安全初始化
     */
    async function safeInitialize() {
        try {
            console.log('开始安全初始化...');
            
            // 等待DOM完全加载
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // 额外延迟确保所有元素都已渲染
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // 加载环境数据
            await loadEnvironments();
            
            // 渲染界面
            renderEnvironments();
            
            // 绑定事件
            bindEvents();
            
            console.log('安全初始化完成');
            showStatus('✅ 安全初始化完成', 'success');
            
        } catch (error) {
            console.error('安全初始化失败:', error);
            showStatus('❌ 初始化失败: ' + error.message, 'error');
        }
    }
    
    // 启动安全初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInitialize);
    } else {
        safeInitialize();
    }
    
    console.log('安全弹出窗口脚本加载完成');
    
})();
