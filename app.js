// 海信SFA系统 - 增强版JavaScript

// 全局变量
let currentModule = 'check-in-module';
let dealerData = [];
let customerData = [];
let quoteData = [];
let productConfig = {};
let currentQuote = null;

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadMockData();
    setupEventListeners();
    updateDateTime();
    initializeCharts();
    
    // 每分钟更新时间
    setInterval(updateDateTime, 60000);
});

// 初始化应用
function initializeApp() {
    console.log('海信SFA系统启动中...');
    
    // 获取位置信息
    getLocationInfo();
    
    // 初始化打卡记录
    loadCheckinRecords();
    
    // 初始化经销商列表
    loadDealerList();
    
    // 初始化客户列表
    loadCustomerList();
    
    // 初始化报价历史
    loadQuoteHistory();
}

// 加载模拟数据
function loadMockData() {
    // 经销商数据
    dealerData = [
        {
            id: 1,
            name: '上海海信专卖店',
            code: 'SH001',
            type: '一级经销商',
            address: '上海市浦东新区张江高科技园区',
            contact: '张经理',
            phone: '021-58888888',
            sales: 1250000,
            status: 'active'
        },
        {
            id: 2,
            name: '北京海信旗舰店',
            code: 'BJ001',
            type: 'VIP',
            address: '北京市朝阳区三里屯太古里',
            contact: '李经理',
            phone: '010-66666666',
            sales: 2100000,
            status: 'active'
        },
        {
            id: 3,
            name: '广州海信体验中心',
            code: 'GZ001',
            type: '战略合作',
            address: '广州市天河区珠江新城',
            contact: '王经理',
            phone: '020-88888888',
            sales: 1800000,
            status: 'active'
        }
    ];

    // 客户数据
    customerData = [
        {
            id: 1,
            name: '张先生',
            phone: '138****8888',
            type: 'VIP',
            lastContact: '2025-07-30',
            totalPurchase: 25000,
            status: 'active'
        },
        {
            id: 2,
            name: '李女士',
            phone: '139****9999',
            type: '普通',
            lastContact: '2025-07-28',
            totalPurchase: 8500,
            status: 'active'
        },
        {
            id: 3,
            name: '王总',
            phone: '136****6666',
            type: '企业',
            lastContact: '2025-07-25',
            totalPurchase: 150000,
            status: 'active'
        }
    ];

    // 报价数据
    quoteData = [
        {
            id: 1,
            customer: '张先生',
            phone: '138****8888',
            items: [
                { name: '海信75英寸4K智能电视', price: 4999, quantity: 1 }
            ],
            total: 4999,
            status: '已发送',
            date: '2025-07-30'
        },
        {
            id: 2,
            customer: '李女士',
            phone: '139****9999',
            items: [
                { name: '海信对开门冰箱', price: 3299, quantity: 1 },
                { name: '海信滚筒洗衣机', price: 2199, quantity: 1 }
            ],
            total: 5498,
            status: '草稿',
            date: '2025-07-29'
        }
    ];
}

// 设置事件监听器
function setupEventListeners() {
    // 底部导航
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const targetModule = this.dataset.module;
            switchModule(targetModule);
        });
    });

    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.target;
            switchTab(targetTab);
        });
    });

    // 打卡按钮
    document.getElementById('morning-checkin').addEventListener('click', function() {
        performCheckin('morning');
    });

    document.getElementById('evening-checkin').addEventListener('click', function() {
        performCheckin('evening');
    });

    // 经销商管理
    document.getElementById('add-dealer-btn').addEventListener('click', showActionSheet);
    document.getElementById('dealer-search').addEventListener('input', filterDealers);
    
    // 筛选选项
    document.querySelectorAll('#dealer-filter-options .filter-option').forEach(option => {
        option.addEventListener('click', function() {
            selectFilterOption(this);
        });
    });

    // 产品配置
    document.querySelectorAll('#product-type-options .config-option').forEach(option => {
        option.addEventListener('click', function() {
            selectProductType(this.dataset.type);
        });
    });

    // 报价管理
    document.getElementById('new-quote').addEventListener('click', createNewQuote);
    document.getElementById('generate-quote').addEventListener('click', generateQuoteFromConfig);
    document.getElementById('save-quote').addEventListener('click', saveQuote);
    document.getElementById('send-quote').addEventListener('click', sendQuote);

    // 模态框和操作面板
    document.getElementById('overlay').addEventListener('click', closeAllModals);
    document.getElementById('close-action-sheet').addEventListener('click', closeActionSheet);
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);

    // 操作面板项目
    document.getElementById('add-dealer-action').addEventListener('click', function() {
        closeActionSheet();
        showAddDealerModal();
    });

    document.getElementById('import-dealers-action').addEventListener('click', function() {
        closeActionSheet();
        showNotification('批量导入功能开发中...', 'warning');
    });

    document.getElementById('export-dealers-action').addEventListener('click', function() {
        closeActionSheet();
        exportDealerData();
    });

    // 通知铃铛
    document.getElementById('notification-bell').addEventListener('click', function() {
        showNotification('您有3条新消息', 'success');
    });

    // 用户头像
    document.getElementById('user-profile').addEventListener('click', function() {
        showUserProfile();
    });
}

// 模块切换
function switchModule(moduleId) {
    // 隐藏所有模块
    document.querySelectorAll('.module-content').forEach(module => {
        module.classList.remove('active');
    });

    // 显示目标模块
    document.getElementById(moduleId).classList.add('active');

    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-module="${moduleId}"]`).classList.add('active');

    currentModule = moduleId;

    // 根据模块加载相应数据
    switch(moduleId) {
        case 'user-management-module':
            loadDealerList();
            break;
        case 'product-config-module':
            resetProductConfig();
            break;
        case 'quote-module':
            loadQuoteHistory();
            break;
        case 'analytics-module':
            updateAnalyticsCharts();
            break;
    }
}

// 标签页切换
function switchTab(tabId) {
    const parentModule = document.querySelector(`#${tabId}`).closest('.module-content');
    
    // 隐藏所有标签页
    parentModule.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // 显示目标标签页
    document.getElementById(tabId).classList.add('active');

    // 更新标签按钮状态
    parentModule.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    parentModule.querySelector(`[data-target="${tabId}"]`).classList.add('active');
}

// 更新日期时间
function updateDateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    const dateString = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    document.getElementById('current-time').textContent = timeString;
    document.getElementById('current-date').textContent = dateString;
}

// 获取位置信息
function getLocationInfo() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                document.getElementById('location-info').textContent = 
                    '打卡地点：海信上海旗舰店（距离您 50米）';
            },
            function(error) {
                document.getElementById('location-info').textContent = 
                    '打卡地点：海信上海旗舰店（无法获取精确位置）';
            }
        );
    } else {
        document.getElementById('location-info').textContent = 
            '打卡地点：海信上海旗舰店（浏览器不支持定位）';
    }
}

// 执行打卡
function performCheckin(type) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });

    if (type === 'morning') {
        document.getElementById('morning-status').textContent = timeString;
        document.getElementById('morning-status').className = 'text-xl font-bold text-green-500 mt-1';
        document.getElementById('morning-checkin').textContent = '已打卡';
        document.getElementById('morning-checkin').className = 'mt-3 w-full btn-disabled';
        document.getElementById('morning-checkin').disabled = true;
        
        // 检查是否可以下班打卡（模拟18:00后）
        const currentHour = now.getHours();
        if (currentHour >= 18) {
            document.getElementById('evening-status').textContent = '可打卡';
            document.getElementById('evening-status').className = 'text-xl font-bold text-blue-500 mt-1';
            document.getElementById('evening-checkin').textContent = '立即打卡';
            document.getElementById('evening-checkin').className = 'mt-3 w-full btn-primary';
            document.getElementById('evening-checkin').disabled = false;
        }
        
        showNotification('上班打卡成功！', 'success');
    } else if (type === 'evening') {
        document.getElementById('evening-status').textContent = timeString;
        document.getElementById('evening-status').className = 'text-xl font-bold text-green-500 mt-1';
        document.getElementById('evening-checkin').textContent = '已打卡';
        document.getElementById('evening-checkin').className = 'mt-3 w-full btn-disabled';
        document.getElementById('evening-checkin').disabled = true;
        
        document.getElementById('check-status').textContent = '已完成';
        document.getElementById('check-status').className = 'bg-green-100 text-green-700 text-xs px-2 py-1 rounded';
        
        showNotification('下班打卡成功！', 'success');
    }

    // 更新打卡记录
    addCheckinRecord(type, timeString);
}

// 添加打卡记录
function addCheckinRecord(type, time) {
    const recordsContainer = document.getElementById('checkin-records');
    const today = new Date().toLocaleDateString('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });

    // 检查今天是否已有记录
    let todayRecord = recordsContainer.querySelector('[data-date="today"]');
    
    if (!todayRecord) {
        todayRecord = document.createElement('div');
        todayRecord.className = 'flex justify-between pb-3 border-b border-gray-100';
        todayRecord.setAttribute('data-date', 'today');
        todayRecord.innerHTML = `
            <div>
                <p>${today}</p>
                <p class="text-sm text-gray-500" id="today-times">上班：-- | 下班：--</p>
            </div>
            <span class="text-yellow-500 text-sm" id="today-status">
                <i class="fas fa-clock"></i> 进行中
            </span>
        `;
        recordsContainer.insertBefore(todayRecord, recordsContainer.firstChild);
    }

    // 更新今天的打卡时间
    const timesElement = todayRecord.querySelector('#today-times');
    const statusElement = todayRecord.querySelector('#today-status');
    const currentTimes = timesElement.textContent;

    if (type === 'morning') {
        timesElement.textContent = currentTimes.replace('上班：--', `上班：${time}`);
    } else if (type === 'evening') {
        timesElement.textContent = currentTimes.replace('下班：--', `下班：${time}`);
        statusElement.innerHTML = '<i class="fas fa-check-circle"></i> 正常';
        statusElement.className = 'text-green-500 text-sm';
    }
}

// 加载打卡记录
function loadCheckinRecords() {
    const recordsContainer = document.getElementById('checkin-records');
    const records = [
        { date: '7月30日（周三）', morning: '08:25', evening: '18:10', status: '正常' },
        { date: '7月29日（周二）', morning: '08:32', evening: '19:45', status: '正常' },
        { date: '7月28日（周一）', morning: '08:40', evening: '18:05', status: '正常' }
    ];

    recordsContainer.innerHTML = records.map(record => `
        <div class="flex justify-between pb-3 border-b border-gray-100">
            <div>
                <p>${record.date}</p>
                <p class="text-sm text-gray-500">上班：${record.morning} | 下班：${record.evening}</p>
            </div>
            <span class="text-green-500 text-sm">
                <i class="fas fa-check-circle"></i> ${record.status}
            </span>
        </div>
    `).join('');
}

// 加载经销商列表
function loadDealerList() {
    const container = document.getElementById('dealer-list-container');
    
    container.innerHTML = dealerData.map(dealer => `
        <div class="card p-4 dealer-card" data-type="${dealer.type}" data-id="${dealer.id}">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h3 class="font-medium">${dealer.name}</h3>
                    <p class="text-sm text-gray-500">${dealer.code}</p>
                </div>
                <span class="badge">${dealer.type}</span>
            </div>
            
            <div class="text-sm text-gray-600 mb-3">
                <p><i class="fas fa-map-marker-alt mr-2"></i>${dealer.address}</p>
                <p><i class="fas fa-user mr-2"></i>${dealer.contact} | ${dealer.phone}</p>
            </div>
            
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-sm text-gray-500">年销售额</p>
                    <p class="font-bold text-hisense-green">¥${(dealer.sales / 10000).toFixed(1)}万</p>
                </div>
                <div class="space-x-2">
                    <button class="btn-outline text-xs" onclick="viewDealerDetails(${dealer.id})">详情</button>
                    <button class="btn-outline text-xs" onclick="contactDealer(${dealer.id})">联系</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 筛选经销商
function filterDealers() {
    const searchTerm = document.getElementById('dealer-search').value.toLowerCase();
    const activeFilter = document.querySelector('#dealer-filter-options .filter-option.active').dataset.filter;
    
    document.querySelectorAll('.dealer-card').forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const code = card.querySelector('.text-gray-500').textContent.toLowerCase();
        const type = card.dataset.type;
        
        const matchesSearch = name.includes(searchTerm) || code.includes(searchTerm);
        const matchesFilter = activeFilter === '全部' || type === activeFilter;
        
        card.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
    });
}

// 选择筛选选项
function selectFilterOption(option) {
    document.querySelectorAll('#dealer-filter-options .filter-option').forEach(opt => {
        opt.classList.remove('active');
    });
    option.classList.add('active');
    filterDealers();
}

// 加载客户列表
function loadCustomerList() {
    const container = document.getElementById('key-customers');
    
    container.innerHTML = customerData.map(customer => `
        <div class="flex justify-between items-center pb-3 border-b border-gray-100">
            <div>
                <p class="font-medium">${customer.name}</p>
                <p class="text-sm text-gray-500">${customer.phone} | ${customer.type}</p>
                <p class="text-xs text-gray-400">最后联系：${customer.lastContact}</p>
            </div>
            <div class="text-right">
                <p class="font-bold text-hisense-green">¥${(customer.totalPurchase / 10000).toFixed(1)}万</p>
                <button class="btn-outline text-xs mt-1" onclick="contactCustomer(${customer.id})">联系</button>
            </div>
        </div>
    `).join('');
}

// 产品配置相关函数
function selectProductType(type) {
    // 清除之前的选择
    document.querySelectorAll('#product-type-options .config-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // 选中当前选项
    document.querySelector(`[data-type="${type}"]`).classList.add('selected');
    
    productConfig.type = type;
    
    // 显示尺寸选择
    showSizeOptions(type);
}

function showSizeOptions(type) {
    const sizeSection = document.getElementById('size-section');
    const sizeOptions = document.getElementById('size-options');
    
    const sizes = {
        tv: ['43英寸', '55英寸', '65英寸', '75英寸', '85英寸'],
        fridge: ['双门', '三门', '对开门', '十字门'],
        washer: ['6公斤', '8公斤', '10公斤', '12公斤'],
        ac: ['1匹', '1.5匹', '2匹', '3匹']
    };
    
    sizeOptions.innerHTML = sizes[type].map(size => `
        <div class="config-option" onclick="selectSize('${size}')">
            ${size}
        </div>
    `).join('');
    
    sizeSection.style.display = 'block';
}

function selectSize(size) {
    document.querySelectorAll('#size-options .config-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    productConfig.size = size;
    showFeaturesOptions();
}

function showFeaturesOptions() {
    const featuresSection = document.getElementById('features-section');
    const featuresOptions = document.getElementById('features-options');
    
    const features = {
        tv: ['4K超清', '智能系统', '语音控制', 'HDR'],
        fridge: ['变频', '风冷无霜', '智能控制', '杀菌'],
        washer: ['变频', '烘干', '智能投放', '除菌'],
        ac: ['变频', '智能控制', '自清洁', '静音']
    };
    
    featuresOptions.innerHTML = features[productConfig.type].map(feature => `
        <div class="config-option" onclick="toggleFeature('${feature}')">
            ${feature}
        </div>
    `).join('');
    
    featuresSection.style.display = 'block';
    productConfig.features = [];
}

function toggleFeature(feature) {
    const option = event.target;
    
    if (option.classList.contains('selected')) {
        option.classList.remove('selected');
        productConfig.features = productConfig.features.filter(f => f !== feature);
    } else {
        option.classList.add('selected');
        productConfig.features.push(feature);
    }
    
    if (productConfig.features.length > 0) {
        showColorOptions();
    }
}

function showColorOptions() {
    const colorSection = document.getElementById('color-section');
    const colorOptions = document.getElementById('color-options');
    
    const colors = ['黑色', '白色', '银色', '金色'];
    
    colorOptions.innerHTML = colors.map(color => `
        <div class="config-option" onclick="selectColor('${color}')">
            ${color}
        </div>
    `).join('');
    
    colorSection.style.display = 'block';
}

function selectColor(color) {
    document.querySelectorAll('#color-options .config-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    productConfig.color = color;
    showConfigSummary();
}

function showConfigSummary() {
    const summarySection = document.getElementById('config-summary');
    const detailsContainer = document.getElementById('config-details');
    
    const basePrice = {
        tv: 3999,
        fridge: 2999,
        washer: 1999,
        ac: 2499
    };
    
    const featurePrice = productConfig.features.length * 500;
    const totalPrice = basePrice[productConfig.type] + featurePrice;
    
    detailsContainer.innerHTML = `
        <div class="space-y-2">
            <div class="flex justify-between">
                <span>产品类型：</span>
                <span>${getProductTypeName(productConfig.type)}</span>
            </div>
            <div class="flex justify-between">
                <span>尺寸规格：</span>
                <span>${productConfig.size}</span>
            </div>
            <div class="flex justify-between">
                <span>功能特性：</span>
                <span>${productConfig.features.join(', ')}</span>
            </div>
            <div class="flex justify-between">
                <span>颜色：</span>
                <span>${productConfig.color}</span>
            </div>
        </div>
    `;
    
    document.getElementById('estimated-price').textContent = `¥${totalPrice.toLocaleString()}`;
    summarySection.style.display = 'block';
}

function getProductTypeName(type) {
    const names = {
        tv: '电视',
        fridge: '冰箱',
        washer: '洗衣机',
        ac: '空调'
    };
    return names[type];
}

function resetProductConfig() {
    productConfig = {};
    document.querySelectorAll('.config-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    document.getElementById('size-section').style.display = 'none';
    document.getElementById('features-section').style.display = 'none';
    document.getElementById('color-section').style.display = 'none';
    document.getElementById('config-summary').style.display = 'none';
}

// 报价管理相关函数
function createNewQuote() {
    currentQuote = {
        id: Date.now(),
        customer: '',
        phone: '',
        items: [],
        total: 0,
        status: '草稿',
        date: new Date().toLocaleDateString('zh-CN')
    };
    
    document.getElementById('quote-customer').value = '';
    document.getElementById('quote-phone').value = '';
    document.getElementById('quote-requirements').value = '';
    document.getElementById('quote-items-section').style.display = 'none';
    
    showNotification('已创建新报价单', 'success');
}

function generateQuoteFromConfig() {
    if (!productConfig.type) {
        showNotification('请先完成产品配置', 'warning');
        return;
    }
    
    const customer = document.getElementById('quote-customer').value;
    const phone = document.getElementById('quote-phone').value;
    
    if (!customer || !phone) {
        showNotification('请填写客户信息', 'warning');
        return;
    }
    
    const basePrice = {
        tv: 3999,
        fridge: 2999,
        washer: 1999,
        ac: 2499
    };
    
    const featurePrice = productConfig.features.length * 500;
    const totalPrice = basePrice[productConfig.type] + featurePrice;
    
    const productName = `海信${productConfig.size}${getProductTypeName(productConfig.type)}`;
    
    currentQuote = {
        id: Date.now(),
        customer: customer,
        phone: phone,
        items: [{
            name: productName,
            price: totalPrice,
            quantity: 1
        }],
        total: totalPrice,
        status: '草稿',
        date: new Date().toLocaleDateString('zh-CN')
    };
    
    updateQuoteDisplay();
    showNotification('报价单已生成', 'success');
}

function updateQuoteDisplay() {
    const itemsContainer = document.getElementById('quote-items');
    const subtotal = currentQuote.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.13);
    const total = subtotal + tax;
    
    itemsContainer.innerHTML = currentQuote.items.map((item, index) => `
        <div class="quote-item">
            <div>
                <p class="font-medium">${item.name}</p>
                <p class="text-sm text-gray-500">¥${item.price.toLocaleString()} × ${item.quantity}</p>
            </div>
            <div class="text-right">
                <p class="font-medium">¥${(item.price * item.quantity).toLocaleString()}</p>
                <button class="text-xs text-red-500" onclick="removeQuoteItem(${index})">删除</button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('quote-subtotal').textContent = `¥${subtotal.toLocaleString()}`;
    document.getElementById('quote-tax').textContent = `¥${tax.toLocaleString()}`;
    document.getElementById('quote-total').textContent = `¥${total.toLocaleString()}`;
    
    currentQuote.total = total;
    document.getElementById('quote-items-section').style.display = 'block';
}

function removeQuoteItem(index) {
    currentQuote.items.splice(index, 1);
    updateQuoteDisplay();
    
    if (currentQuote.items.length === 0) {
        document.getElementById('quote-items-section').style.display = 'none';
    }
}

function saveQuote() {
    if (!currentQuote || currentQuote.items.length === 0) {
        showNotification('报价单为空，无法保存', 'warning');
        return;
    }
    
    // 检查是否已存在
    const existingIndex = quoteData.findIndex(q => q.id === currentQuote.id);
    
    if (existingIndex >= 0) {
        quoteData[existingIndex] = { ...currentQuote };
    } else {
        quoteData.unshift({ ...currentQuote });
    }
    
    loadQuoteHistory();
    showNotification('报价单已保存', 'success');
}

function sendQuote() {
    if (!currentQuote || currentQuote.items.length === 0) {
        showNotification('报价单为空，无法发送', 'warning');
        return;
    }
    
    currentQuote.status = '已发送';
    saveQuote();
    
    showNotification(`报价单已发送给 ${currentQuote.customer}`, 'success');
}

function loadQuoteHistory() {
    const container = document.getElementById('quote-history');
    
    if (quoteData.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">暂无报价记录</p>';
        return;
    }
    
    container.innerHTML = quoteData.slice(0, 5).map(quote => `
        <div class="flex justify-between items-center pb-3 border-b border-gray-100">
            <div>
                <p class="font-medium">${quote.customer}</p>
                <p class="text-sm text-gray-500">${quote.phone}</p>
                <p class="text-xs text-gray-400">${quote.date}</p>
            </div>
            <div class="text-right">
                <p class="font-bold text-hisense-green">¥${quote.total.toLocaleString()}</p>
                <span class="text-xs px-2 py-1 rounded ${quote.status === '已发送' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                    ${quote.status}
                </span>
            </div>
        </div>
    `).join('');
}

// 图表初始化
function initializeCharts() {
    // 客户图表
    const customerCtx = document.getElementById('customerChart').getContext('2d');
    new Chart(customerCtx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
            datasets: [{
                label: '新增客户',
                data: [8, 12, 15, 10, 18, 14, 12],
                borderColor: '#009EA1',
                backgroundColor: 'rgba(0, 158, 161, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateAnalyticsCharts() {
    // 销售图表
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        new Chart(salesCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [{
                    label: '销售额',
                    data: [12000, 15000, 18000, 14000, 22000, 25000, 20000],
                    backgroundColor: '#009EA1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // 产品销量图表
    const productCtx = document.getElementById('productChart');
    if (productCtx) {
        new Chart(productCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['电视', '冰箱', '洗衣机', '空调'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: ['#009EA1', '#00b3ac', '#007f82', '#66d9d9']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // 客户分布图表
    const customerDistCtx = document.getElementById('customerDistributionChart');
    if (customerDistCtx) {
        new Chart(customerDistCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['上海', '北京', '广州', '深圳', '其他'],
                datasets: [{
                    data: [30, 25, 20, 15, 10],
                    backgroundColor: ['#009EA1', '#00b3ac', '#007f82', '#66d9d9', '#b3e6e6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// 模态框和通知相关函数
function showActionSheet() {
    document.getElementById('overlay').classList.add('show');
    document.getElementById('action-sheet').classList.add('show');
}

function closeActionSheet() {
    document.getElementById('overlay').classList.remove('show');
    document.getElementById('action-sheet').classList.remove('show');
}

function showModal(title, content, confirmCallback) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('overlay').classList.add('show');
    document.getElementById('modal').classList.add('show');
    
    if (confirmCallback) {
        document.getElementById('modal-confirm').onclick = confirmCallback;
    }
}

function closeModal() {
    document.getElementById('overlay').classList.remove('show');
    document.getElementById('modal').classList.remove('show');
}

function closeAllModals() {
    closeActionSheet();
    closeModal();
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const textElement = document.getElementById('notification-text');
    
    textElement.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 业务功能函数
function viewDealerDetails(dealerId) {
    const dealer = dealerData.find(d => d.id === dealerId);
    if (dealer) {
        showModal('经销商详情', `
            <div class="space-y-3">
                <div><strong>名称：</strong>${dealer.name}</div>
                <div><strong>代码：</strong>${dealer.code}</div>
                <div><strong>类型：</strong>${dealer.type}</div>
                <div><strong>地址：</strong>${dealer.address}</div>
                <div><strong>联系人：</strong>${dealer.contact}</div>
                <div><strong>电话：</strong>${dealer.phone}</div>
                <div><strong>年销售额：</strong>¥${(dealer.sales / 10000).toFixed(1)}万</div>
            </div>
        `);
    }
}

function contactDealer(dealerId) {
    const dealer = dealerData.find(d => d.id === dealerId);
    if (dealer) {
        showNotification(`正在联系 ${dealer.contact}...`, 'success');
    }
}

function contactCustomer(customerId) {
    const customer = customerData.find(c => c.id === customerId);
    if (customer) {
        showNotification(`正在联系 ${customer.name}...`, 'success');
    }
}

function showAddDealerModal() {
    showModal('添加经销商', `
        <form id="add-dealer-form" class="space-y-3">
            <div>
                <label class="block text-sm font-medium mb-1">经销商名称</label>
                <input type="text" class="w-full p-2 border border-gray-300 rounded" required>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">经销商代码</label>
                <input type="text" class="w-full p-2 border border-gray-300 rounded" required>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">类型</label>
                <select class="w-full p-2 border border-gray-300 rounded" required>
                    <option value="">请选择</option>
                    <option value="一级经销商">一级经销商</option>
                    <option value="二级经销商">二级经销商</option>
                    <option value="VIP">VIP</option>
                    <option value="战略合作">战略合作</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">地址</label>
                <input type="text" class="w-full p-2 border border-gray-300 rounded" required>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">联系人</label>
                <input type="text" class="w-full p-2 border border-gray-300 rounded" required>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">联系电话</label>
                <input type="tel" class="w-full p-2 border border-gray-300 rounded" required>
            </div>
        </form>
    `, function() {
        // 这里可以添加保存经销商的逻辑
        showNotification('经销商添加成功！', 'success');
        closeModal();
    });
}

function exportDealerData() {
    // 模拟导出功能
    const csvContent = "data:text/csv;charset=utf-8," 
        + "名称,代码,类型,地址,联系人,电话,销售额\n"
        + dealerData.map(d => `${d.name},${d.code},${d.type},${d.address},${d.contact},${d.phone},${d.sales}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "经销商数据.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('数据导出成功！', 'success');
}

function showUserProfile() {
    showModal('用户信息', `
        <div class="text-center space-y-3">
            <div class="w-16 h-16 rounded-full bg-hisense-green text-white flex items-center justify-center text-2xl mx-auto">
                <i class="fas fa-user"></i>
            </div>
            <div>
                <h3 class="font-medium">张销售</h3>
                <p class="text-sm text-gray-500">海信上海旗舰店</p>
                <p class="text-sm text-gray-500">工号：SH001</p>
            </div>
            <div class="pt-3 border-t space-y-2">
                <button class="w-full btn-outline">修改密码</button>
                <button class="w-full btn-outline">退出登录</button>
            </div>
        </div>
    `);
}

// 导出全局函数供HTML调用
window.viewDealerDetails = viewDealerDetails;
window.contactDealer = contactDealer;
window.contactCustomer = contactCustomer;
window.selectSize = selectSize;
window.toggleFeature = toggleFeature;
window.selectColor = selectColor;
window.removeQuoteItem = removeQuoteItem;

