/**
 * 基础测试脚本 - 测试最基本的功能
 */

console.log('🧪 基础测试脚本启动...');

// 测试1: 基本JavaScript功能
window.testBasic = function() {
    console.log('🧪 基础功能测试');
    alert('✅ JavaScript基础功能正常！\n\n当前时间: ' + new Date().toLocaleString());
};

// 测试2: Browser API可用性
window.testBrowserAPI = function() {
    console.log('🧪 Browser API测试');
    
    let message = 'Browser API测试结果:\n\n';
    message += `typeof browser: ${typeof browser}\n`;
    message += `browser存在: ${typeof browser !== 'undefined'}\n`;
    
    if (typeof browser !== 'undefined') {
        message += `browser.storage存在: ${typeof browser.storage !== 'undefined'}\n`;
        message += `browser.storage.local存在: ${typeof browser.storage?.local !== 'undefined'}\n`;
    }
    
    console.log(message);
    alert(message);
};

// 测试3: 简单存储测试
window.testStorage = async function() {
    console.log('🧪 存储功能测试');
    
    try {
        if (typeof browser === 'undefined') {
            alert('❌ Browser对象不存在');
            return;
        }
        
        if (!browser.storage) {
            alert('❌ browser.storage不存在');
            return;
        }
        
        if (!browser.storage.local) {
            alert('❌ browser.storage.local不存在');
            return;
        }
        
        // 测试写入
        const testData = {
            test_key: 'test_value_' + Date.now(),
            test_timestamp: Date.now()
        };
        
        console.log('写入测试数据:', testData);
        await browser.storage.local.set(testData);
        console.log('✅ 写入成功');
        
        // 测试读取
        const result = await browser.storage.local.get(['test_key', 'test_timestamp']);
        console.log('读取测试数据:', result);
        
        if (result.test_key === testData.test_key) {
            alert('✅ 存储功能正常！\n\n' + 
                  `写入数据: ${testData.test_key}\n` +
                  `读取数据: ${result.test_key}\n` +
                  `时间戳: ${new Date(result.test_timestamp).toLocaleString()}`);
        } else {
            alert('❌ 存储数据不匹配');
        }
        
    } catch (error) {
        console.error('存储测试失败:', error);
        alert('❌ 存储测试失败: ' + error.message);
    }
};

// 测试4: 查看实际存储内容
window.viewStorage = async function() {
    console.log('🧪 查看存储内容');
    
    try {
        if (typeof browser === 'undefined' || !browser.storage?.local) {
            alert('❌ 存储API不可用');
            return;
        }
        
        // 获取所有数据
        const allData = await browser.storage.local.get(null);
        console.log('所有存储数据:', allData);
        
        let message = '存储内容:\n\n';
        const keys = Object.keys(allData);
        
        if (keys.length === 0) {
            message += '存储为空';
        } else {
            message += `总共 ${keys.length} 个数据项:\n\n`;
            keys.forEach(key => {
                const value = allData[key];
                if (Array.isArray(value)) {
                    message += `${key}: 数组 (${value.length}项)\n`;
                } else if (typeof value === 'object') {
                    message += `${key}: 对象\n`;
                } else {
                    message += `${key}: ${value}\n`;
                }
            });
        }
        
        alert(message);
        
    } catch (error) {
        console.error('查看存储失败:', error);
        alert('❌ 查看存储失败: ' + error.message);
    }
};

// 测试5: 简单添加环境测试
window.simpleAddTest = async function() {
    console.log('🧪 简单添加环境测试');
    
    try {
        const testEnv = {
            id: 'simple_test_' + Date.now(),
            name: '简单测试环境',
            icon: '🧪',
            color: '#28a745',
            description: '这是一个简单的测试环境'
        };
        
        console.log('创建测试环境:', testEnv);
        
        // 直接保存单个环境
        await browser.storage.local.set({
            'simple_test_env': testEnv,
            'simple_test_timestamp': Date.now()
        });
        
        console.log('✅ 测试环境保存成功');
        
        // 立即读取验证
        const result = await browser.storage.local.get(['simple_test_env']);
        console.log('验证读取:', result);
        
        if (result.simple_test_env && result.simple_test_env.id === testEnv.id) {
            alert('✅ 简单环境添加测试成功！\n\n' +
                  `环境名称: ${result.simple_test_env.name}\n` +
                  `环境ID: ${result.simple_test_env.id}`);
        } else {
            alert('❌ 简单环境添加测试失败');
        }
        
    } catch (error) {
        console.error('简单添加测试失败:', error);
        alert('❌ 简单添加测试失败: ' + error.message);
    }
};

console.log('🧪 基础测试脚本加载完成');
console.log('可用测试函数:');
console.log('- testBasic(): 基础JavaScript测试');
console.log('- testBrowserAPI(): Browser API测试');
console.log('- testStorage(): 存储功能测试');
console.log('- viewStorage(): 查看存储内容');
console.log('- simpleAddTest(): 简单添加环境测试');
