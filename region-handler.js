// 区域处理相关功能

// 获取选中的区域列表
function getSelectedRegions() {
    const selectedRegions = [];
    const primaryRegion = document.getElementById('editPrimaryRegion').value;
    
    // 添加主要区域
    if (primaryRegion) {
        selectedRegions.push(primaryRegion);
    }
    
    // 添加额外选中的区域
    const checkboxes = document.querySelectorAll('.region-checkbox input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked && !selectedRegions.includes(checkbox.value)) {
            selectedRegions.push(checkbox.value);
        }
    });
    
    // 如果没有选择任何区域，使用默认区域
    if (selectedRegions.length === 0) {
        selectedRegions.push('us-east-1');
    }
    
    return selectedRegions;
}

// 设置区域选择状态
function setRegionSelection(regions) {
    // 设置主要区域
    const primaryRegion = regions && regions.length > 0 ? regions[0] : '';
    document.getElementById('editPrimaryRegion').value = primaryRegion;
    
    // 设置额外区域复选框
    const checkboxes = document.querySelectorAll('.region-checkbox input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = regions && regions.includes(checkbox.value);
    });
}

// 显示区域信息
function getRegionDisplayText(regions) {
    if (!regions || regions.length === 0) {
        return 'us-east-1 (默认)';
    }
    
    if (regions.length === 1) {
        return regions[0];
    }
    
    return regions[0] + ' +' + (regions.length - 1) + '个区域';
}
