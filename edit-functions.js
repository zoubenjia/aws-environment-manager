// 修改环境相关功能

// 修改环境函数
async function editEnvironment(env) {
    console.log('Editing environment:', env.name);
    updateStatus('修改环境中...');
    
    try {
        const updatedEnv = await showEditDialog(env);
        
        if (!updatedEnv) {
            updateStatus('用户取消修改');
            return;
        }
        
        // 验证必填字段
        if (!updatedEnv.name || updatedEnv.name.trim() === '') {
            await showDialog('修改失败', '❌ 环境名称不能为空！');
            return;
        }
        
        // 获取所有环境
        const result = await browser.storage.local.get(['aws_environments']);
        let environments = result.aws_environments || [];
        
        // 查找并更新环境
        const envIndex = environments.findIndex(e => e.id === env.id);
        if (envIndex === -1) {
            await showDialog('修改失败', '❌ 找不到要修改的环境！');
            return;
        }
        
        environments[envIndex] = updatedEnv;
        
        // 保存到存储
        await browser.storage.local.set({
            'aws_environments': environments,
            'last_update': Date.now()
        });
        
        console.log('Environment updated successfully');
        updateStatus('环境修改成功');
        
        await showDialog('修改成功', 
            '✅ 环境修改成功！\n\n' +
            '名称: ' + updatedEnv.name + '\n' +
            '描述: ' + updatedEnv.description + '\n' +
            '图标: ' + updatedEnv.icon
        );
        
        // 刷新环境列表
        loadEnvironments();
        
    } catch (error) {
        console.error('Edit environment error:', error);
        updateStatus('修改环境失败');
        await showDialog('修改失败', '❌ 修改环境失败！\n\n' + error.message);
    }
}

// 删除环境函数
async function deleteEnvironment(env) {
    console.log('Deleting environment:', env.name);
    
    const confirmed = await showDialog('删除确认', 
        '⚠️ 确定要删除环境吗？\n\n' +
        '环境名称: ' + env.name + '\n' +
        '环境描述: ' + env.description + '\n\n' +
        '此操作无法撤销！', 
        true
    );
    
    if (!confirmed) {
        updateStatus('用户取消删除');
        return;
    }
    
    updateStatus('删除环境中...');
    
    try {
        // 获取所有环境
        const result = await browser.storage.local.get(['aws_environments']);
        let environments = result.aws_environments || [];
        
        // 过滤掉要删除的环境
        const originalLength = environments.length;
        environments = environments.filter(e => e.id !== env.id);
        
        if (environments.length === originalLength) {
            await showDialog('删除失败', '❌ 找不到要删除的环境！');
            return;
        }
        
        // 保存到存储
        await browser.storage.local.set({
            'aws_environments': environments,
            'last_update': Date.now()
        });
        
        console.log('Environment deleted successfully');
        updateStatus('环境删除成功');
        
        await showDialog('删除成功', 
            '✅ 环境删除成功！\n\n' +
            '已删除环境: ' + env.name + '\n' +
            '剩余环境数: ' + environments.length
        );
        
        // 刷新环境列表
        loadEnvironments();
        
    } catch (error) {
        console.error('Delete environment error:', error);
        updateStatus('删除环境失败');
        await showDialog('删除失败', '❌ 删除环境失败！\n\n' + error.message);
    }
}

// 显示修改环境对话框
function showEditDialog(env) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('editDialog');
        const closeBtn = document.getElementById('editDialogClose');
        const saveBtn = document.getElementById('editDialogSave');
        const cancelBtn = document.getElementById('editDialogCancel');
        
        // 填充表单数据
        document.getElementById('editName').value = env.name || '';
        document.getElementById('editDescription').value = env.description || '';
        document.getElementById('editIcon').value = env.icon || '🔹';
        document.getElementById('editColor').value = env.color || '#28a745';
        document.getElementById('editAccountId').value = env.accountId || '';
        document.getElementById('editRoleName').value = env.roleName || '';
        document.getElementById('editSsoUrl').value = env.ssoStartUrl || '';
        
        // 设置主要区域
        const primaryRegion = env.regions && env.regions.length > 0 ? env.regions[0] : '';
        document.getElementById('editPrimaryRegion').value = primaryRegion;
        
        // 设置额外区域复选框
        const checkboxes = document.querySelectorAll('.region-checkbox input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = env.regions && env.regions.includes(checkbox.value);
        });
        
        overlay.style.display = 'flex';
        
        const handleSave = () => {
            const name = document.getElementById('editName').value.trim();
            const description = document.getElementById('editDescription').value.trim();
            
            if (!name) {
                alert('环境名称不能为空！');
                return;
            }
            
            // 收集选中的区域
            const selectedRegions = [];
            const primaryRegion = document.getElementById('editPrimaryRegion').value;
            
            // 添加主要区域
            if (primaryRegion) {
                selectedRegions.push(primaryRegion);
            }
            
            // 添加额外选中的区域
            checkboxes.forEach(checkbox => {
                if (checkbox.checked && !selectedRegions.includes(checkbox.value)) {
                    selectedRegions.push(checkbox.value);
                }
            });
            
            // 如果没有选择任何区域，使用默认区域
            if (selectedRegions.length === 0) {
                selectedRegions.push('us-east-1');
            }
            
            const updatedEnv = {
                ...env,
                name: name,
                description: description,
                icon: document.getElementById('editIcon').value,
                color: document.getElementById('editColor').value,
                accountId: document.getElementById('editAccountId').value.trim(),
                roleName: document.getElementById('editRoleName').value.trim(),
                ssoStartUrl: document.getElementById('editSsoUrl').value.trim(),
                regions: selectedRegions,
                updatedAt: new Date().toISOString()
            };
            
            overlay.style.display = 'none';
            cleanup();
            resolve(updatedEnv);
        };
        
        const handleCancel = () => {
            overlay.style.display = 'none';
            cleanup();
            resolve(null);
        };
        
        const cleanup = () => {
            saveBtn.removeEventListener('click', handleSave);
            cancelBtn.removeEventListener('click', handleCancel);
            closeBtn.removeEventListener('click', handleCancel);
        };
        
        saveBtn.addEventListener('click', handleSave);
        cancelBtn.addEventListener('click', handleCancel);
        closeBtn.addEventListener('click', handleCancel);
    });
}
