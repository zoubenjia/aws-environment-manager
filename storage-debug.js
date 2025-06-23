/**
 * 存储调试和修复脚本
 */

console.log('🔍 存储调试脚本启动...');

// 全局调试函数
window.debugStorage = async function() {
    console.log('=== 存储调试信息 ===');
    
    try {
        if (typeof browser !== 'undefined' && browser.storage) {
            // 获取所有存储数据
            const allData = await browser.storage.local.get(null);
            console.log('所有存储数据:', allData);
            
            // 检查环境数据
            const envData = await browser.storage.local.get(['aws_environments', 'environments']);
            console.log('环境数据:', envData);
            
            // 显示给用户
            let message = '存储调试信息:\n\n';
            message += `总数据项: ${Object.keys(allData).length}\n`;
            message += `aws_environments: ${envData.aws_environments ? envData.aws_environments.length + '个环境' : '不存在'}\n`;
            message += `environments: ${envData.environments ? envData.environments.length + '个环境' : '不存在'}\n\n`;
            
            if (envData.aws_environments) {
                message += 'aws_environments内容:\n';
                envData.aws_environments.forEach((env, index) => {
                    message += `${index + 1}. ${env.name} (${env.id})\n`;
                });
            }
            
            alert(message);
            
        } else {
            console.error('Browser storage API 不可用');
            alert('❌ Browser storage API 不可用');
        }
    } catch (error) {
        console.error('调试存储失败:', error);
        alert('❌ 调试存储失败: ' + error.message);
    }
};

// 修复的添加环境函数
window.fixedAddEnvironment = async function() {
    console.log('🔧 修复的添加环境函数被调用');
    
    try {
        const envName = prompt('请输入环境名称:', '修复测试环境 ' + new Date().toLocaleTimeString());
        if (!envName || envName.trim() === '') {
            console.log('用户取消或未输入环境名称');
            return;
        }
        
        // 创建新环境
        const newEnv = {
            id: 'fixed_' + Date.now(),
            name: envName.trim(),
            icon: '🔧',
            color: '#fd7e14',
            description: '修复版本添加的环境',
            accountId: '487783143761',
            roleName: 'PowerUserAccess',
            ssoStartUrl: 'https://d-9067f2e3cc.awsapps.com/start/#/console',
            regions: ['us-east-1']
        };
        
        console.log('创建新环境:', newEnv);
        
        if (typeof browser !== 'undefined' && browser.storage) {
            // 先获取现有环境
            console.log('获取现有环境...');
            const result = await browser.storage.local.get(['aws_environments']);
            console.log('现有环境数据:', result);
            
            let environments = result.aws_environments || [];
            console.log('当前环境数量:', environments.length);
            
            // 添加新环境
            environments.push(newEnv);
            console.log('添加后环境数量:', environments.length);
            
            // 保存回存储
            console.log('保存环境到存储...');
            await browser.storage.local.set({
                'aws_environments': environments,
                'save_timestamp': Date.now(),
                'last_added_env': newEnv.id
            });
            
            console.log('✅ 环境保存完成');
            
            // 验证保存
            const verification = await browser.storage.local.get(['aws_environments']);
            console.log('验证保存结果:', verification);
            
            if (verification.aws_environments && verification.aws_environments.length > environments.length - 1) {
                alert('✅ 环境添加并验证成功！\n\n' + 
                      `环境名称: ${newEnv.name}\n` +
                      `环境ID: ${newEnv.id}\n` +
                      `总环境数: ${verification.aws_environments.length}\n\n` +
                      '请关闭并重新打开扩展查看新环境。');
            } else {
                alert('❌ 环境保存验证失败！');
            }
            
        } else {
            alert('❌ 无法访问存储API');
        }
        
    } catch (error) {
        console.error('❌ 修复添加环境失败:', error);
        alert('❌ 修复添加环境失败: ' + error.message);
    }
};

// 清理存储函数
window.clearStorage = async function() {
    if (confirm('⚠️ 确定要清理所有环境数据吗？\n\n这将删除所有自定义环境！')) {
        try {
            await browser.storage.local.remove(['aws_environments', 'environments']);
            alert('✅ 存储已清理！');
            console.log('存储已清理');
        } catch (error) {
            alert('❌ 清理失败: ' + error.message);
        }
    }
};

// 重置为默认环境
window.resetToDefault = async function() {
    if (confirm('确定要重置为默认环境吗？')) {
        const defaultEnvs = [
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
        
        try {
            await browser.storage.local.set({
                'aws_environments': defaultEnvs,
                'save_timestamp': Date.now()
            });
            alert('✅ 已重置为默认环境！');
        } catch (error) {
            alert('❌ 重置失败: ' + error.message);
        }
    }
};

console.log('🔍 存储调试脚本加载完成');
console.log('可用函数: debugStorage(), fixedAddEnvironment(), clearStorage(), resetToDefault()');
