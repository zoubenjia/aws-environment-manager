/**
 * AWS Environment Browser Extension - 数据同步管理器
 * 确保扩展设置页面与弹出窗口数据一致性
 */

(function() {
    'use strict';
    
    // 数据版本控制
    const DATA_VERSION = '1.0.0';
    const STORAGE_KEYS = {
        ENVIRONMENTS: 'aws_environments',
        SETTINGS: 'aws_settings',
        VERSION: 'aws_data_version',
        LAST_SYNC: 'aws_last_sync'
    };
    
    // 默认环境配置
    const DEFAULT_ENVIRONMENTS = [
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
    
    // 默认设置
    const DEFAULT_SETTINGS = {
        autoTSTSetup: true,
        showProductionWarning: true,
        enableRegionColors: true,
        enableEnvironmentIcons: true,
        pulseAnimationEnabled: true
    };
    
    /**
     * 数据同步管理器类
     */
    class DataSyncManager {
        constructor() {
            this.listeners = new Set();
            this.isInitialized = false;
        }
        
        /**
         * 初始化数据同步管理器
         */
        async initialize() {
            try {
                console.log('🔄 初始化数据同步管理器...');
                
                // 检查数据版本
                await this.checkDataVersion();
                
                // 确保数据完整性
                await this.ensureDataIntegrity();
                
                // 设置存储监听器
                this.setupStorageListener();
                
                this.isInitialized = true;
                console.log('✅ 数据同步管理器初始化完成');
                
                // 通知所有监听器
                this.notifyListeners('initialized');
                
            } catch (error) {
                console.error('数据同步管理器初始化失败:', error);
                throw error;
            }
        }
        
        /**
         * 检查数据版本
         */
        async checkDataVersion() {
            try {
                const result = await this.getStorageData([STORAGE_KEYS.VERSION]);
                const currentVersion = result[STORAGE_KEYS.VERSION];
                
                if (!currentVersion || currentVersion !== DATA_VERSION) {
                    console.log(`数据版本更新: ${currentVersion} -> ${DATA_VERSION}`);
                    await this.migrateData(currentVersion, DATA_VERSION);
                    await this.setStorageData({ [STORAGE_KEYS.VERSION]: DATA_VERSION });
                }
            } catch (error) {
                console.error('检查数据版本失败:', error);
            }
        }
        
        /**
         * 数据迁移
         */
        async migrateData(fromVersion, toVersion) {
            console.log(`执行数据迁移: ${fromVersion} -> ${toVersion}`);
            
            // 如果是首次安装或版本不匹配，重置为默认数据
            if (!fromVersion) {
                await this.resetToDefaults();
            }
            
            // 这里可以添加具体的版本迁移逻辑
            // 例如：if (fromVersion === '0.9.0' && toVersion === '1.0.0') { ... }
        }
        
        /**
         * 确保数据完整性
         */
        async ensureDataIntegrity() {
            try {
                const data = await this.getStorageData([
                    STORAGE_KEYS.ENVIRONMENTS,
                    STORAGE_KEYS.SETTINGS
                ]);
                
                let needsUpdate = false;
                const updates = {};
                
                // 检查环境配置
                if (!data[STORAGE_KEYS.ENVIRONMENTS] || !Array.isArray(data[STORAGE_KEYS.ENVIRONMENTS])) {
                    console.log('环境配置缺失或无效，使用默认配置');
                    updates[STORAGE_KEYS.ENVIRONMENTS] = [...DEFAULT_ENVIRONMENTS];
                    needsUpdate = true;
                } else {
                    // 确保默认环境存在
                    const environments = data[STORAGE_KEYS.ENVIRONMENTS];
                    const defaultIds = DEFAULT_ENVIRONMENTS.map(env => env.id);
                    
                    for (const defaultEnv of DEFAULT_ENVIRONMENTS) {
                        const existing = environments.find(env => env.id === defaultEnv.id);
                        if (!existing) {
                            console.log(`添加缺失的默认环境: ${defaultEnv.name}`);
                            environments.push({ ...defaultEnv });
                            needsUpdate = true;
                        }
                    }
                    
                    if (needsUpdate) {
                        updates[STORAGE_KEYS.ENVIRONMENTS] = environments;
                    }
                }
                
                // 检查设置配置
                if (!data[STORAGE_KEYS.SETTINGS] || typeof data[STORAGE_KEYS.SETTINGS] !== 'object') {
                    console.log('设置配置缺失或无效，使用默认设置');
                    updates[STORAGE_KEYS.SETTINGS] = { ...DEFAULT_SETTINGS };
                    needsUpdate = true;
                } else {
                    // 确保所有默认设置存在
                    const settings = { ...DEFAULT_SETTINGS, ...data[STORAGE_KEYS.SETTINGS] };
                    updates[STORAGE_KEYS.SETTINGS] = settings;
                    needsUpdate = true;
                }
                
                // 更新时间戳
                updates[STORAGE_KEYS.LAST_SYNC] = Date.now();
                
                if (needsUpdate) {
                    await this.setStorageData(updates);
                    console.log('数据完整性检查完成，已更新缺失数据');
                }
                
            } catch (error) {
                console.error('数据完整性检查失败:', error);
            }
        }
        
        /**
         * 重置为默认数据
         */
        async resetToDefaults() {
            try {
                const defaultData = {
                    [STORAGE_KEYS.ENVIRONMENTS]: [...DEFAULT_ENVIRONMENTS],
                    [STORAGE_KEYS.SETTINGS]: { ...DEFAULT_SETTINGS },
                    [STORAGE_KEYS.VERSION]: DATA_VERSION,
                    [STORAGE_KEYS.LAST_SYNC]: Date.now()
                };
                
                await this.setStorageData(defaultData);
                console.log('已重置为默认数据');
                
                this.notifyListeners('reset');
            } catch (error) {
                console.error('重置默认数据失败:', error);
            }
        }
        
        /**
         * 获取环境配置
         */
        async getEnvironments() {
            try {
                const result = await this.getStorageData([STORAGE_KEYS.ENVIRONMENTS]);
                return result[STORAGE_KEYS.ENVIRONMENTS] || [...DEFAULT_ENVIRONMENTS];
            } catch (error) {
                console.error('获取环境配置失败:', error);
                return [...DEFAULT_ENVIRONMENTS];
            }
        }
        
        /**
         * 保存环境配置
         */
        async saveEnvironments(environments) {
            try {
                await this.setStorageData({
                    [STORAGE_KEYS.ENVIRONMENTS]: environments,
                    [STORAGE_KEYS.LAST_SYNC]: Date.now()
                });
                
                console.log('环境配置已保存');
                this.notifyListeners('environments_updated', environments);
                
                return true;
            } catch (error) {
                console.error('保存环境配置失败:', error);
                return false;
            }
        }
        
        /**
         * 获取设置
         */
        async getSettings() {
            try {
                const result = await this.getStorageData([STORAGE_KEYS.SETTINGS]);
                return { ...DEFAULT_SETTINGS, ...result[STORAGE_KEYS.SETTINGS] };
            } catch (error) {
                console.error('获取设置失败:', error);
                return { ...DEFAULT_SETTINGS };
            }
        }
        
        /**
         * 保存设置
         */
        async saveSettings(settings) {
            try {
                await this.setStorageData({
                    [STORAGE_KEYS.SETTINGS]: settings,
                    [STORAGE_KEYS.LAST_SYNC]: Date.now()
                });
                
                console.log('设置已保存');
                this.notifyListeners('settings_updated', settings);
                
                return true;
            } catch (error) {
                console.error('保存设置失败:', error);
                return false;
            }
        }
        
        /**
         * 获取存储数据
         */
        async getStorageData(keys) {
            if (typeof browser !== 'undefined' && browser.storage) {
                return await browser.storage.local.get(keys);
            }
            return {};
        }
        
        /**
         * 设置存储数据
         */
        async setStorageData(data) {
            if (typeof browser !== 'undefined' && browser.storage) {
                await browser.storage.local.set(data);
            }
        }
        
        /**
         * 设置存储监听器
         */
        setupStorageListener() {
            if (typeof browser !== 'undefined' && browser.storage) {
                browser.storage.onChanged.addListener((changes, areaName) => {
                    if (areaName === 'local') {
                        console.log('存储数据发生变化:', changes);
                        this.handleStorageChange(changes);
                    }
                });
            }
        }
        
        /**
         * 处理存储变化
         */
        handleStorageChange(changes) {
            for (const key in changes) {
                if (key === STORAGE_KEYS.ENVIRONMENTS) {
                    this.notifyListeners('environments_changed', changes[key].newValue);
                } else if (key === STORAGE_KEYS.SETTINGS) {
                    this.notifyListeners('settings_changed', changes[key].newValue);
                }
            }
        }
        
        /**
         * 添加监听器
         */
        addListener(callback) {
            this.listeners.add(callback);
        }
        
        /**
         * 移除监听器
         */
        removeListener(callback) {
            this.listeners.delete(callback);
        }
        
        /**
         * 通知所有监听器
         */
        notifyListeners(event, data) {
            this.listeners.forEach(callback => {
                try {
                    callback(event, data);
                } catch (error) {
                    console.error('监听器回调失败:', error);
                }
            });
        }
        
        /**
         * 强制同步数据
         */
        async forceSync() {
            try {
                await this.ensureDataIntegrity();
                this.notifyListeners('force_sync');
                console.log('强制同步完成');
                return true;
            } catch (error) {
                console.error('强制同步失败:', error);
                return false;
            }
        }
    }
    
    // 创建全局实例
    window.DataSyncManager = new DataSyncManager();
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.DataSyncManager.initialize();
        });
    } else {
        window.DataSyncManager.initialize();
    }
    
    console.log('数据同步管理器已加载');
})();
