// 红薯助手 - 侧边栏交互逻辑
// 负责：UI交互、数据管理、导出、飞书同步

// ===== 日期格式化工具函数 =====
/**
 * 格式化日期为 YYYY/MM/DD HH:mm 格式
 * @param {Date|string|number} dateInput - 日期输入
 * @returns {string} 格式化后的日期字符串
 */
function formatDateTimeForFeishu(dateInput) {
  let date;
  
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else {
    date = new Date();
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// ===== 全局函数（供HTML onclick调用）=====
// 必须在最前面声明，确保HTML可以访问
window.backToHome = function() {
  console.log('返回首页 (window.backToHome 被调用)');
  goBackToHome();
};

// 删除笔记函数 - 提前声明供onclick使用
window.deleteNote = function(index) {
  console.log('删除笔记:', index);
  if (confirm('确定要删除这条笔记吗？')) {
    batchNotesData.splice(index, 1);
    renderBatchNotes();
    
    // 更新计数
    const countEl = document.getElementById('batchCount');
    if (countEl) {
      countEl.textContent = batchNotesData.length;
    }
    
    if (batchNotesData.length === 0) {
      document.getElementById('batchResults').classList.add('hidden');
    }
  }
};

// 返回首页核心逻辑
function goBackToHome() {
  console.log('执行返回首页');
  
  // 隐藏所有功能页
  const pages = ['singlePage', 'batchPage', 'bloggerPage'];
  pages.forEach(pageId => {
    const page = document.getElementById(pageId);
    if (page) {
      console.log('隐藏页面:', pageId);
      page.classList.add('hidden');
    }
  });
  
  // 显示首页
  const homePage = document.getElementById('homePage');
  if (homePage) {
    console.log('显示首页');
    homePage.classList.remove('hidden');
  } else {
    console.error('找不到homePage');
  }
  
  // 清空提示
  const containers = ['singleAlertContainer', 'batchAlertContainer', 'bloggerAlertContainer'];
  containers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = '';
    }
  });
}

// ===== 全局变量 =====
let currentFunction = 'single'; // 当前选择的功能
let singleNoteData = null; // 单篇笔记数据
let batchNotesData = []; // 博主笔记列表数据
let bloggerInfoData = null; // 博主信息数据
let feishuConfig = {}; // 飞书配置

// ===== Coze 工作流 ID（写死，不对用户暴露）=====
// 说明：按你的要求，工作流 ID 不让用户配置，避免被滥用/泄露。
const COZE_WORKFLOW_IDS = {
  // 笔记详情（单篇笔记）
  single: '7595132567972888622',
  // 博主笔记概览（批量）
  batch: '7598111225851117587',
  // 博主信息
  blogger: '7598081754460979235'
};

// ===== 订单管理表格链接（写死，三个工作流共用）=====
// 说明：按你的要求，orderurl 是固定值，每个用户都一样，不在插件里暴露为可配置项
const FIXED_ORDER_URL =
  'https://jcn38dn09zj1.feishu.cn/base/PYGkbjHKnaCdycspkbncDNgsnVb?table=tblIvDgHhQ4kgESm&view=vewWigxuiw';

// ===== 工具函数：把 Date 转成 YYYY/MM/DD =====
function formatDateYmd(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

// ===== 工具函数：截断长文本（避免提示框太长）=====
function truncateText(text, maxLen = 600) {
  if (text == null) return '';
  const s = String(text);
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + '…(已截断)';
}

// 把常见的“YYYY/MM/DD HH:mm(:ss)”解析为毫秒时间戳（按本地时区）
// 说明：Coze/飞书日期时间字段最稳的是 Number(毫秒)。这里尽量在插件侧就给出毫秒，减少工作流解析差异。
function parseYmdHmToTimestamp(input) {
  if (!input) return null;
  if (typeof input === 'number' && Number.isFinite(input)) return input;
  if (typeof input !== 'string') return null;

  // 有些字符串会带地点/多余文字（如“2025/12/20 湖南”），这里取前面的日期部分
  const s = input.trim();
  const match = s.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (!match) return null;

  const y = Number(match[1]);
  const mo = Number(match[2]);
  const d = Number(match[3]);
  const hh = match[4] ? Number(match[4]) : 0;
  const mm = match[5] ? Number(match[5]) : 0;
  const ss = match[6] ? Number(match[6]) : 0;

  const dt = new Date(y, mo - 1, d, hh, mm, ss, 0);
  const ts = dt.getTime();
  return Number.isFinite(ts) ? ts : null;
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('红薯助手已加载');
  
  // 初始化事件监听
  initEventListeners();
  
  // 加载配置
  loadConfiguration();
  
  // 监听来自content script的消息
  chrome.runtime.onMessage.addListener(handleMessage);
});

// ===== 初始化事件监听 =====
function initEventListeners() {
  console.log('初始化事件监听...');
  
  // 功能卡片点击（进入功能页）
  const cards = document.querySelectorAll('.function-card');
  console.log('找到卡片数量:', cards.length);
  
  cards.forEach(card => {
    card.addEventListener('click', function() {
      const functionType = this.dataset.function;
      console.log('点击卡片:', functionType);
      showFunctionPage(functionType);
    });
  });
  
  // 返回按钮
  const singleBackBtn = document.getElementById('singleBackBtn');
  const batchBackBtn = document.getElementById('batchBackBtn');
  const bloggerBackBtn = document.getElementById('bloggerBackBtn');
  
  if (singleBackBtn) {
    singleBackBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('点击单篇笔记返回按钮');
      goBackToHome();
    });
  }
  if (batchBackBtn) {
    batchBackBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('点击博主笔记返回按钮');
      goBackToHome();
    });
  }
  if (bloggerBackBtn) {
    bloggerBackBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('点击博主信息返回按钮');
      goBackToHome();
    });
  }
  
  // 采集按钮
  const singleBtn = document.getElementById('singleCaptureBtn');
  const batchBtn = document.getElementById('batchCaptureBtn');
  const bloggerBtn = document.getElementById('bloggerCaptureBtn');
  
  if (singleBtn) singleBtn.addEventListener('click', () => startCapture('single'));
  if (batchBtn) batchBtn.addEventListener('click', () => startCapture('batch'));
  if (bloggerBtn) bloggerBtn.addEventListener('click', () => startCapture('blogger'));
  
  // 日期筛选开关
  const dateToggle = document.getElementById('batchDateToggle');
  const dateRangeContainer = document.getElementById('dateRangeContainer');
  const filterOffHint = document.getElementById('filterOffHint');
  
  if (dateToggle) {
    dateToggle.addEventListener('change', function() {
      if (this.checked) {
        // 打开日期筛选
        dateRangeContainer.style.display = 'flex';
        filterOffHint.style.display = 'none';
        // 默认设置结束日期为今天
        const today = new Date().toISOString().split('T')[0];
        const endInput = document.getElementById('batchDateEnd');
        if (endInput && !endInput.value) {
          endInput.value = today;
        }
      } else {
        // 关闭日期筛选
        dateRangeContainer.style.display = 'none';
        filterOffHint.style.display = 'flex';
      }
    });
  }
  
  // 导出按钮
  const singleExportBtn = document.getElementById('singleExportBtn');
  const batchExportBtn = document.getElementById('batchExportBtn');
  const bloggerExportBtn = document.getElementById('bloggerExportBtn');
  
  if (singleExportBtn) singleExportBtn.addEventListener('click', () => exportToExcel('single'));
  if (batchExportBtn) batchExportBtn.addEventListener('click', () => exportToExcel('batch'));
  if (bloggerExportBtn) bloggerExportBtn.addEventListener('click', () => exportToExcel('blogger'));
  
  // 同步飞书按钮
  const singleSyncBtn = document.getElementById('singleSyncBtn');
  const batchSyncBtn = document.getElementById('batchSyncBtn');
  const bloggerSyncBtn = document.getElementById('bloggerSyncBtn');
  
  if (singleSyncBtn) singleSyncBtn.addEventListener('click', () => syncToFeishu('single'));
  if (batchSyncBtn) batchSyncBtn.addEventListener('click', () => syncToFeishu('batch'));
  if (bloggerSyncBtn) bloggerSyncBtn.addEventListener('click', () => syncToFeishu('blogger'));
  
  // 删除按钮（批量删除选中）
  const singleDeleteBtn = document.getElementById('singleDeleteBtn');
  const batchDeleteBtn = document.getElementById('batchDeleteBtn');
  const bloggerDeleteBtn = document.getElementById('bloggerDeleteBtn');
  
  if (singleDeleteBtn) singleDeleteBtn.addEventListener('click', () => deleteSelected('single'));
  if (batchDeleteBtn) batchDeleteBtn.addEventListener('click', () => deleteSelected('batch'));
  if (bloggerDeleteBtn) bloggerDeleteBtn.addEventListener('click', () => deleteSelected('blogger'));
  
  // 全选复选框
  const singleSelectAll = document.getElementById('singleSelectAll');
  const batchSelectAll = document.getElementById('batchSelectAll');
  
  if (singleSelectAll) singleSelectAll.addEventListener('change', (e) => toggleSelectAll('single', e.target.checked));
  if (batchSelectAll) batchSelectAll.addEventListener('change', (e) => toggleSelectAll('batch', e.target.checked));
  
  // 设置面板
  const settingsBtn = document.getElementById('settingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const overlay = document.getElementById('overlay');
  const saveConfigBtn = document.getElementById('saveConfigBtn');
  
  if (settingsBtn) settingsBtn.addEventListener('click', toggleSettings);
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', toggleSettings);
  if (overlay) overlay.addEventListener('click', toggleSettings);
  if (saveConfigBtn) saveConfigBtn.addEventListener('click', saveConfiguration);
  
  // 帮助按钮
  const helpBtn = document.getElementById('helpBtn');
  if (helpBtn) helpBtn.addEventListener('click', showHelp);
  
  console.log('事件监听初始化完成');
}

// ===== 显示功能页 =====
function showFunctionPage(functionType) {
  console.log('显示功能页:', functionType);
  currentFunction = functionType;
  
  // 隐藏首页
  const homePage = document.getElementById('homePage');
  if (homePage) {
    console.log('隐藏首页');
    homePage.classList.add('hidden');
  } else {
    console.error('找不到homePage元素');
  }
  
  // 清空提示
  clearAlert();
  
  // 显示对应功能页
  const pageMap = {
    'single': 'singlePage',
    'batch': 'batchPage',
    'blogger': 'bloggerPage'
  };
  
  const pageId = pageMap[functionType];
  console.log('显示页面ID:', pageId);
  
  if (pageId) {
    const page = document.getElementById(pageId);
    if (page) {
      console.log('显示页面:', pageId);
      page.classList.remove('hidden');
    } else {
      console.error('找不到页面元素:', pageId);
    }
  }
}

// ===== 开始采集 =====
async function startCapture(type) {
  console.log('开始采集:', type);
  
  // 获取当前标签页
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab) {
    showAlert('error', '错误', '无法获取当前标签页');
    return;
  }
  
  // 验证URL
  if (!tab.url || !tab.url.includes('xiaohongshu.com')) {
    showAlert('error', '页面验证失败', '请在小红书网页上使用此功能');
    return;
  }
  
  // 禁用按钮，显示加载状态
  const btnId = type === 'single' ? 'singleCaptureBtn' : 
                type === 'batch' ? 'batchCaptureBtn' : 'bloggerCaptureBtn';
  const btn = document.getElementById(btnId);
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span><span>采集中...</span>';
  
  try {
    // 构建消息
    const message = {
      action: type === 'single' ? 'captureSingleNote' :
              type === 'batch' ? 'captureBatchNotes' : 'captureBloggerInfo'
    };
    
    // 如果是批量采集，检查日期筛选开关
    if (type === 'batch') {
      const dateToggle = document.getElementById('batchDateToggle');
      if (dateToggle && dateToggle.checked) {
        const dateStart = document.getElementById('batchDateStart')?.value;
        const dateEnd = document.getElementById('batchDateEnd')?.value;
        if (dateStart) {
          message.filterDateStart = dateStart;
          console.log('日期筛选 - 开始:', dateStart);
        }
        if (dateEnd) {
          message.filterDateEnd = dateEnd;
          console.log('日期筛选 - 结束:', dateEnd);
        }
      } else {
        console.log('日期筛选已关闭，采集全部笔记');
      }
    }
    
    // 发送消息到content script
    const response = await chrome.tabs.sendMessage(tab.id, message);
    
    // 恢复按钮
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    
    if (response && response.success) {
      handleCaptureSuccess(type, response.data);
    } else {
      showAlert('error', '采集失败', response?.error || '未知错误');
    }
  } catch (error) {
    console.error('采集错误:', error);
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    showAlert('error', '通信失败', '无法与页面通信，请刷新页面后重试');
  }
}

// ===== 处理采集成功 =====
function handleCaptureSuccess(type, data) {
  if (type === 'single') {
    singleNoteData = data;
    showAlert('success', '采集成功', '已成功采集笔记数据');
    renderSingleNote();
  } else if (type === 'batch') {
    // 增量合并：根据URL去重，只添加新笔记
    const existingUrls = new Set(batchNotesData.map(n => n.url));
    const newNotes = data.filter(n => !existingUrls.has(n.url));
    
    if (newNotes.length > 0) {
      // 新笔记添加到列表开头
      batchNotesData = [...newNotes, ...batchNotesData];
      showAlert('success', '采集成功', `新增 ${newNotes.length} 条笔记，共 ${batchNotesData.length} 条`);
    } else if (data.length > 0 && batchNotesData.length === 0) {
      // 首次采集
      batchNotesData = data;
      showAlert('success', '采集成功', `已成功采集 ${data.length} 条笔记`);
    } else {
      showAlert('info', '采集完成', `未发现新笔记（当前共 ${batchNotesData.length} 条）`);
    }
    renderBatchNotes();
  } else if (type === 'blogger') {
    bloggerInfoData = data;
    showAlert('success', '采集成功', '已成功采集博主信息');
    renderBloggerInfo();
  }
}

// ===== 渲染单篇笔记 =====
function renderSingleNote() {
  if (!singleNoteData) return;
  
  const resultsSection = document.getElementById('singleResults');
  const notesList = document.getElementById('singleNotesList');
  const countEl = document.getElementById('singleCount');
  
  countEl.textContent = '1';
  resultsSection.classList.remove('hidden');
  
  const imageUrl = singleNoteData.coverImageUrl || singleNoteData.imageUrls?.split(',')[0] || '';
  const noteUrl = singleNoteData.url || '';
  const safeDate = (singleNoteData.publishDate && !/NaN|undefined/i.test(singleNoteData.publishDate))
    ? singleNoteData.publishDate
    : '';
  
  notesList.innerHTML = `
    <div class="note-item" data-url="${noteUrl}">
      <div class="note-select">
        <input type="checkbox" class="note-checkbox" checked>
        <span class="note-index">1</span>
      </div>
      <div class="note-cover">
        ${imageUrl ? `<img src="${imageUrl}" alt="封面">` : '<span class="no-cover">📷</span>'}
      </div>
      <div class="note-body">
        <div class="note-title clickable" title="${singleNoteData.title || '无标题'}">${singleNoteData.title || '无标题'}</div>
        <div class="note-meta-row">
          <span class="note-author">${singleNoteData.author || '未知作者'}</span>
          ${safeDate ? `<span class="note-date">${safeDate}</span>` : ''}
        </div>
        <div class="note-stats-row">
          <span class="note-stat">点赞 ${formatNumber(singleNoteData.likes || 0)}</span>
          <span class="note-stat">收藏 ${formatNumber(singleNoteData.collects || 0)}</span>
          <span class="note-stat">评论 ${formatNumber(singleNoteData.comments || 0)}</span>
        </div>
      </div>
      <div class="note-actions-col">
        <button class="btn-icon-sm" data-url="${noteUrl}" title="查看">
          <span class="material-symbols-outlined">open_in_new</span>
        </button>
        <button class="btn-icon-sm btn-delete-icon" data-type="single" title="删除">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  `;
  
  // 绑定点击事件（复用批量笔记的标题点击逻辑）
  bindBatchNoteClickEvents(notesList);
  // 绑定单篇删除按钮事件
  bindSingleDeleteButtons(notesList);
  
  // 绑定复选框事件
  bindCheckboxEvents(notesList, 'single');
}

// ===== 渲染博主笔记列表 =====
function renderBatchNotes() {
  if (!batchNotesData || batchNotesData.length === 0) return;
  
  const resultsSection = document.getElementById('batchResults');
  const notesList = document.getElementById('batchNotesList');
  const countEl = document.getElementById('batchCount');
  
  countEl.textContent = batchNotesData.length;
  resultsSection.classList.remove('hidden');
  
  notesList.innerHTML = batchNotesData.map((note, index) => `
    <div class="note-item" data-index="${index}" data-url="${note.url || ''}">
      <div class="note-select">
        <input type="checkbox" class="note-checkbox" checked>
        <span class="note-index">${index + 1}</span>
      </div>
      <div class="note-cover">
        ${note.image ? `<img src="${note.image}" alt="封面">` : '<span class="no-cover">📷</span>'}
      </div>
      <div class="note-body">
        <div class="note-title clickable" title="${note.title || '无标题'}">${note.title || '无标题'}</div>
        <div class="note-meta-row">
          <span class="note-author">${note.author || '未知作者'}</span>
          ${note.publishDateStr ? `<span class="note-date">${note.publishDateStr}</span>` : ''}
          <span class="note-likes">点赞数 ${formatNumber(note.likes || 0)}</span>
        </div>
      </div>
      <div class="note-actions-col">
        <button class="btn-icon-sm" data-url="${note.url || ''}" title="打开笔记">
          <span class="material-symbols-outlined">open_in_new</span>
        </button>
        <button class="btn-icon-sm btn-delete-icon" data-index="${index}" title="删除">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  `).join('');
  
  // 绑定点击事件
  bindBatchNoteClickEvents(notesList);
  
  // 绑定删除按钮事件
  bindDeleteButtons(notesList);
  
  // 绑定复选框change事件
  bindCheckboxEvents(notesList, 'batch');
}

// ===== 渲染博主信息 =====
function renderBloggerInfo() {
  if (!bloggerInfoData) return;
  
  const resultsSection = document.getElementById('bloggerResults');
  const infoCard = document.getElementById('bloggerInfoCard');
  
  resultsSection.classList.remove('hidden');
  
  infoCard.innerHTML = `
    <div class="blogger-card">
      <div class="blogger-header">
        <div class="blogger-avatar">
          ${bloggerInfoData.avatarUrl ? 
            `<img src="${bloggerInfoData.avatarUrl}" alt="头像" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : 
            '<span style="font-size: 32px;">👤</span>'}
        </div>
        <div class="blogger-info">
          <div class="blogger-name">${bloggerInfoData.bloggerName || '未知博主'}</div>
          <div class="blogger-id">小红书号: ${bloggerInfoData.bloggerId || '未知'}</div>
        </div>
      </div>
      <div class="blogger-bio">${bloggerInfoData.description || '暂无简介'}</div>
      <div class="blogger-stats">
        <div class="stat-box">
          <div class="stat-value">${formatNumber(bloggerInfoData.followersCount || 0)}</div>
          <div class="stat-label">粉丝</div>
        </div>
      </div>
    </div>
  `;
}

// ===== 删除选中 =====
function deleteSelected(type) {
  if (type === 'single') {
    // 单篇笔记：获取是否选中
    const selectedIndexes = getSelectedNoteIndexes('single');
    if (selectedIndexes.length === 0) {
      showAlert('warning', '未选中', '请先选中要删除的笔记');
      return;
    }
    
    if (confirm('确定要删除选中的笔记吗？')) {
      singleNoteData = null;
      document.getElementById('singleResults').classList.add('hidden');
      document.getElementById('singleNotesList').innerHTML = '';
      showAlert('info', '已删除', '笔记已删除');
    }
  } else if (type === 'batch') {
    // 批量笔记：获取选中的索引
    const selectedIndexes = getSelectedNoteIndexes('batch');
    if (selectedIndexes.length === 0) {
      showAlert('warning', '未选中', '请先选中要删除的笔记');
      return;
    }
    
    if (confirm(`确定要删除选中的 ${selectedIndexes.length} 条笔记吗？`)) {
      // 从后往前删除，避免索引变化问题
      const sortedIndexes = selectedIndexes.sort((a, b) => b - a);
      sortedIndexes.forEach(index => {
        batchNotesData.splice(index, 1);
      });
      
      // 重新渲染
      if (batchNotesData.length > 0) {
        renderBatchNotes();
        // 更新计数
        const countEl = document.getElementById('batchCount');
        if (countEl) {
          countEl.textContent = batchNotesData.length;
        }
      } else {
        document.getElementById('batchResults').classList.add('hidden');
        document.getElementById('batchNotesList').innerHTML = '';
      }
      
      showAlert('success', '删除成功', `已删除 ${selectedIndexes.length} 条笔记`);
    }
  } else if (type === 'blogger') {
    // 博主信息：直接删除
    if (confirm('确定要删除博主信息吗？')) {
      bloggerInfoData = null;
      document.getElementById('bloggerResults').classList.add('hidden');
      document.getElementById('bloggerInfoCard').innerHTML = '';
      showAlert('info', '已删除', '博主信息已删除');
    }
  }
}

// ===== 全选/取消全选 =====
function toggleSelectAll(type, isChecked) {
  const listId = type === 'single' ? 'singleNotesList' : 'batchNotesList';
  const notesList = document.getElementById(listId);
  const checkboxes = notesList.querySelectorAll('.note-checkbox');
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = isChecked;
  });
}

// 更新全选复选框状态
function updateSelectAllState(type) {
  const listId = type === 'single' ? 'singleNotesList' : 'batchNotesList';
  const selectAllId = type === 'single' ? 'singleSelectAll' : 'batchSelectAll';
  
  const notesList = document.getElementById(listId);
  const selectAll = document.getElementById(selectAllId);
  
  if (!notesList || !selectAll) return;
  
  const checkboxes = notesList.querySelectorAll('.note-checkbox');
  const checkedCount = notesList.querySelectorAll('.note-checkbox:checked').length;
  
  selectAll.checked = checkboxes.length > 0 && checkedCount === checkboxes.length;
  selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
}

// 获取选中的笔记索引
function getSelectedNoteIndexes(type) {
  const listId = type === 'single' ? 'singleNotesList' : 'batchNotesList';
  const notesList = document.getElementById(listId);
  
  if (!notesList) return [];
  
  const selectedIndexes = [];
  const noteItems = notesList.querySelectorAll('.note-item');
  
  noteItems.forEach((item, index) => {
    const checkbox = item.querySelector('.note-checkbox');
    if (checkbox && checkbox.checked) {
      selectedIndexes.push(index);
    }
  });
  
  return selectedIndexes;
}

// 获取选中的笔记数据
function getSelectedNotesData(type) {
  const indexes = getSelectedNoteIndexes(type);
  
  if (type === 'single') {
    return indexes.length > 0 && singleNoteData ? [singleNoteData] : [];
  } else if (type === 'batch') {
    return indexes.map(i => batchNotesData[i]).filter(Boolean);
  }
  
  return [];
}

// ===== 导出CSV =====
function exportToExcel(type) {
  try {
    let csvContent = '';
    let filename = '';
    
    if (type === 'single') {
      // 获取选中的单篇笔记
      const selectedNotes = getSelectedNotesData('single');
      if (selectedNotes.length === 0) {
        showAlert('warning', '未选中', '请先选中要导出的笔记');
        return;
      }
      
      csvContent = '\ufeff标题,笔记链接,笔记类型,作者,正文,话题标签,封面链接,全部图片链接,视频链接,点赞数,收藏数,评论数,发布时间,采集时间\n';
      selectedNotes.forEach(note => {
        const imageUrls = note.imageUrls ? note.imageUrls.split(',').map(url => url.trim()).filter(Boolean) : [];
        const coverLink = imageUrls.length > 0 ? imageUrls[0] : (note.coverImageUrl || '');
        const isVideoNote = note.noteType === '视频' || Boolean(note.videoUrl);
        const formattedImageUrls = isVideoNote
          ? ''
          : imageUrls.map((url, index) => `图${index + 1}=(${url})`).join('\n');
        const videoUrl = note.videoUrl || '';
        const row = [
          note.title || '无标题',
          note.url || '',
          note.noteType || '图文',
          note.author || '未知作者',
          note.content || '',
          note.tags || '',
          coverLink,
          formattedImageUrls,
          videoUrl,
          note.likes || 0,
          note.collects || 0,
          note.comments || 0,
          note.publishDate || '',
          new Date().toLocaleString('zh-CN')
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
        csvContent += row + '\n';
      });
      filename = `小红书单篇笔记_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    } else if (type === 'batch') {
      // 获取选中的批量笔记
      const selectedNotes = getSelectedNotesData('batch');
      if (selectedNotes.length === 0) {
        showAlert('warning', '未选中', '请先选中要导出的笔记');
        return;
      }
      
      csvContent = '\ufeff序号,标题,笔记链接,博主,点赞数,封面链接,笔记发布时间预估,采集时间\n';
      selectedNotes.forEach((note, index) => {
        let publishDateEstimated = '';
        if (note.publishDate instanceof Date && !isNaN(note.publishDate.getTime())) {
          publishDateEstimated = formatDateYmd(note.publishDate);
        } else if (typeof note.publishDateStr === 'string' && note.publishDateStr.trim()) {
          const parsed = new Date(note.publishDateStr.replace(/-/g, '/'));
          publishDateEstimated = !isNaN(parsed.getTime()) ? formatDateYmd(parsed) : note.publishDateStr.trim();
        } else if (typeof note.publishDate === 'string' && note.publishDate.trim()) {
          const parsed = new Date(note.publishDate.replace(/-/g, '/'));
          publishDateEstimated = !isNaN(parsed.getTime()) ? formatDateYmd(parsed) : note.publishDate.trim();
        }
        const captureTime = formatDateTimeForFeishu(new Date());
        const row = [
          index + 1,
          note.title || '无标题',
          note.url || '',
          note.author || '未知作者',
          note.likes || 0,
          note.image || '',
          publishDateEstimated,
          captureTime
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
        csvContent += row + '\n';
      });
      showAlert('info', '导出中', `正在导出 ${selectedNotes.length} 条选中的笔记...`);
      filename = `小红书博主笔记_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    } else if (type === 'blogger' && bloggerInfoData) {
      csvContent = '\ufeff博主名称,头像链接,小红书号,简介,粉丝数,博主主页链接,采集时间\n';
      const info = bloggerInfoData;
      const row = [
        info.bloggerName || '未知博主',
        info.avatarUrl || '',
        info.bloggerId || '',
        info.description || '',
        info.followersCount || 0,
        info.bloggerUrl || '',
        new Date().toLocaleString('zh-CN')
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
      csvContent += row + '\n';
      filename = `小红书博主信息_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    } else {
      showAlert('warning', '无数据', '没有可导出的数据');
      return;
    }
    
    // 创建下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    showAlert('success', '导出成功', '文件已保存到下载文件夹');
  } catch (error) {
    console.error('导出错误:', error);
    showAlert('error', '导出失败', error.message);
  }
}

// ===== 同步到飞书 =====
async function syncToFeishu(type) {
  // 检查配置
  if (!feishuConfig.orderId || !feishuConfig.baseToken) {
    showAlert('warning', '配置未完成', '请先在设置中配置飞书信息');
    toggleSettings();
    return;
  }
  
  // 获取选中的数据
  let selectedData = [];
  if (type === 'single') {
    selectedData = getSelectedNotesData('single');
  } else if (type === 'batch') {
    selectedData = getSelectedNotesData('batch');
  } else if (type === 'blogger' && bloggerInfoData) {
    selectedData = [bloggerInfoData];
  }
  
  if (selectedData.length === 0) {
    showAlert('warning', '未选中', '请先选中要同步的数据');
    return;
  }
  
  try {
    showAlert('info', '正在同步', `正在将 ${selectedData.length} 条数据同步到飞书，请稍候...`);
    
    // 准备数据和配置
    let workflowId = '';
    let tableUrl = '';
    let records = [];
    
    if (type === 'single') {
      // 单篇笔记同步
      workflowId = COZE_WORKFLOW_IDS.single;
      tableUrl = feishuConfig.knowledgeUrl;
      
      records = selectedData.map(note => {
        // 处理图片附件：格式化为多行文本（图1=(url1)\n图2=(url2)）
        let formattedImageUrls = '';
        if (note.imageUrls) {
          const imageArray = note.imageUrls.split(',');
          formattedImageUrls = imageArray.map((url, index) => 
            `图${index + 1}=(${url.trim()})`
          ).join('\n');
        }
        const isVideoNote = note.noteType === '视频' || Boolean(note.videoUrl);
        if (isVideoNote) {
          formattedImageUrls = '';
        }
        
        // 处理封面：取第一张图片
        const coverUrl = note.imageUrls ? note.imageUrls.split(',')[0].trim() : (note.coverImageUrl || '');

        // 采集时间：格式化为 YYYY/MM/DD HH:mm
        const captureTime = formatDateTimeForFeishu(new Date());
        
        // 发布时间：尝试解析，如果失败则不传
        let publishTime = null;
        if (note.publishDate) {
          try {
            publishTime = formatDateTimeForFeishu(note.publishDate);
          } catch (e) {
            console.warn('发布时间格式化失败:', note.publishDate, e);
          }
        }

        const fields = {
          "标题": note.title || '',
          "笔记链接": note.url || '',
          "笔记类型": note.noteType || '图文',
          "作者": note.author || '',
          "正文": note.content || '',
          "话题标签": note.tags || '',
          "封面": coverUrl,
          "图片附件": formattedImageUrls,
          "视频链接": note.videoUrl || '',
          "点赞数": note.likes || 0,
          "收藏数": note.collects || 0,
          "评论数": note.comments || 0,
          "采集时间": captureTime
        };
        if (publishTime !== null) {
          fields["发布时间"] = publishTime;
        }

        return { fields };
      });
      
    } else if (type === 'batch') {
      // 博主笔记批量同步
      workflowId = COZE_WORKFLOW_IDS.batch;
      tableUrl = feishuConfig.bloggerNoteUrl;
      
      records = selectedData.map(note => {
        // 批量的“笔记发布时间预估”只需要到“天”（YYYY/MM/DD）
        let publishDateEstimated = '';
        if (note.publishDate instanceof Date && !isNaN(note.publishDate.getTime())) {
          publishDateEstimated = formatDateYmd(note.publishDate);
        } else if (typeof note.publishDateStr === 'string' && note.publishDateStr.trim()) {
          const parsed = new Date(note.publishDateStr.replace(/-/g, '/'));
          publishDateEstimated = !isNaN(parsed.getTime()) ? formatDateYmd(parsed) : note.publishDateStr.trim();
        } else if (typeof note.publishDate === 'string' && note.publishDate.trim()) {
          const parsed = new Date(note.publishDate.replace(/-/g, '/'));
          publishDateEstimated = !isNaN(parsed.getTime()) ? formatDateYmd(parsed) : note.publishDate.trim();
        }

        return {
          fields: {
            "博主": note.author || '',
            "标题": note.title || '',
            "点赞数": note.likes || 0,
            "笔记链接": note.url || '',
            "封面链接": note.image || '',
            "笔记发布时间预估": publishDateEstimated,
            "采集时间": formatDateTimeForFeishu(new Date())
          }
        };
      });
      
    } else if (type === 'blogger') {
      // 博主信息同步
      workflowId = COZE_WORKFLOW_IDS.blogger;
      tableUrl = feishuConfig.bloggerUrl;
      
      records = selectedData.map(info => ({
        fields: {
          "博主名称": info.bloggerName || '',
          "头像": info.avatarUrl || '',
          "小红书号": info.bloggerId || '',
          "简介": info.description || '',
          "粉丝数": info.followersCount || 0,
          "主页链接": info.bloggerUrl || '',
          // 按你的《Body格式汇总》：插件原始 body 里时间可以传 String（推荐在工作流里转毫秒）
          "采集时间": new Date().toLocaleString('zh-CN')
        }
      }));
    }
    
    // 工作流ID写死，理论上不会为空；这里保留兜底提示，方便排查版本问题
    if (!workflowId) {
      showAlert('error', '内部配置缺失', '工作流ID未配置，请更新插件版本');
      return;
    }
    
    // 检查表格链接
    if (!tableUrl) {
      showAlert('error', '配置缺失', '请在设置中配置飞书表格链接');
      toggleSettings();
      return;
    }
    
    // 构建请求体
    const body = JSON.stringify({ records });
    
    // 调用 Coze API
    const cozeToken = feishuConfig.cozeToken || '';
    if (!cozeToken) {
      showAlert('error', '配置缺失', '请在设置中配置 Coze Token');
      toggleSettings();
      return;
    }
    
    const response = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        parameters: {
          // 严格按开始节点必填参数名，传 5 个字段：
          // orderId / baseToken / tableurl / body / orderurl
          // 注意：虽然工作流使用 tableurl 提取 app_token，但开始节点可能要求 baseToken 必填
          // 如果不需要，请在 Coze 开始节点中将 baseToken 改为非必填
          orderId: String(feishuConfig.orderId || '').trim(),
          baseToken: String(feishuConfig.baseToken || '').trim(),  // 传入但不使用
          tableurl: String(tableUrl || '').replace(/`/g, '').trim(),
          body: body,
          orderurl: String(FIXED_ORDER_URL || '').trim()
        }
      })
    });
    
    // 为了把失败原因“回显”出来：这里不直接 response.json()，先读文本，再尝试解析
    const rawText = await response.text();
    let result = null;
    try {
      result = rawText ? JSON.parse(rawText) : null;
    } catch (e) {
      // JSON 解析失败也要回显（常见于 502/网关返回 HTML）
      const msg = `HTTP ${response.status} ${response.statusText}\n响应非JSON：\n${truncateText(rawText, 800)}`;
      showAlert('error', '同步失败', msg);
      return;
    }
    
    console.log('Coze API 响应:', result);

    // HTTP 非 2xx：尽量展示 Coze 的 msg/code
    if (!response.ok) {
      const msg = [
        `HTTP ${response.status} ${response.statusText}`,
        result?.msg ? `Coze msg: ${result.msg}` : '',
        typeof result?.code !== 'undefined' ? `Coze code: ${result.code}` : '',
        result?.log_id ? `log_id: ${result.log_id}` : ''
      ].filter(Boolean).join('\n');
      showAlert('error', '同步失败', msg || `HTTP ${response.status} ${response.statusText}`);
      return;
    }
    
    // Coze code 非 0：直接回显 code/msg/log_id
    if (!result || result.code !== 0) {
      const msg = [
        typeof result?.code !== 'undefined' ? `Coze code: ${result.code}` : 'Coze code: (空)',
        result?.msg ? `Coze msg: ${result.msg}` : 'Coze msg: (空)',
        result?.log_id ? `log_id: ${result.log_id}` : ''
      ].filter(Boolean).join('\n');
      showAlert('error', '同步失败', msg);
      return;
    }
    
    // Coze code=0 但 data 为空/不是 JSON 字符串：也回显
    if (!result.data) {
      const msg = `Coze 返回成功但 data 为空。\nlog_id: ${result.log_id || '(空)'}\n原始响应：\n${truncateText(rawText, 800)}`;
      showAlert('error', '同步失败', msg);
      return;
    }
    
    // 解析工作流输出（Coze 的 result.data 通常是 JSON 字符串）
    let wf = null;
    try {
      wf = JSON.parse(result.data);
    } catch (e) {
      const msg = `工作流输出 data 不是合法 JSON：${e.message}\nlog_id: ${result.log_id || '(空)'}\nresult.data：\n${truncateText(result.data, 800)}`;
      showAlert('error', '同步失败', msg);
      return;
    }
    
    // 业务结果回显（兼容新的“三个输出变量”逻辑）
    const hasValue = (val) => {
      if (val === null || typeof val === 'undefined') return false;
      if (typeof val === 'string') return val.trim().length > 0;
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === 'object') return Object.keys(val).length > 0;
      return true;
    };

    const orderValid = hasValue(wf.orderId_result);
    const recordsOk = hasValue(wf.records);
    const editOk = hasValue(wf.edit_records);
    const addOk = hasValue(wf.add_records);
    const writeOk = recordsOk || editOk || addOk;

    if (!orderValid) {
      const msg = `订单号无效/已过期。\nlog_id: ${result.log_id || '(空)'}\n${wf.message ? `message: ${wf.message}` : ''}`.trim();
      showAlert('error', '订单号无效', msg);
    } else if (writeOk) {
      const actionText = recordsOk ? '写入成功' : (editOk ? '已存在，已更新' : '新增成功');
      showAlert('success', '同步成功', `${actionText}，共处理 ${selectedData.length} 条数据`);
    } else {
      const msg = [
        '订单号有效，但写入结果为空',
        wf.message ? `message: ${wf.message}` : '',
        `log_id: ${result.log_id || '(空)'}`,
        '工作流返回内容:',
        truncateText(JSON.stringify(wf, null, 2), 500)
      ].filter(Boolean).join('\n');
      showAlert('error', '同步失败', msg || '数据写入失败，请检查飞书配置');
    }
    
  } catch (error) {
    console.error('同步错误:', error);
    // 这里把真实错误 message 回显出来，避免只看到“未知错误”
    showAlert('error', '同步失败', `网络/运行时错误: ${error?.message || String(error)}`);
  }
}

// ===== 配置管理 =====
function loadConfiguration() {
  chrome.storage.local.get(['feishuConfig'], (result) => {
    if (result.feishuConfig) {
      feishuConfig = result.feishuConfig;
      // 填充到表单
      document.getElementById('orderId').value = feishuConfig.orderId || '';
      document.getElementById('baseToken').value = feishuConfig.baseToken || '';
      document.getElementById('cozeToken').value = feishuConfig.cozeToken || '';
      document.getElementById('knowledgeUrl').value = feishuConfig.knowledgeUrl || '';
      document.getElementById('bloggerNoteUrl').value = feishuConfig.bloggerNoteUrl || '';
      document.getElementById('bloggerUrl').value = feishuConfig.bloggerUrl || '';
    }
  });
}

function saveConfiguration() {
  feishuConfig = {
    orderId: document.getElementById('orderId').value.trim(),
    baseToken: document.getElementById('baseToken').value.trim(),
    cozeToken: document.getElementById('cozeToken').value.trim(),
    knowledgeUrl: document.getElementById('knowledgeUrl').value.trim(),
    bloggerNoteUrl: document.getElementById('bloggerNoteUrl').value.trim(),
    bloggerUrl: document.getElementById('bloggerUrl').value.trim()
  };
  
  chrome.storage.local.set({ feishuConfig }, () => {
    showAlert('success', '保存成功', '飞书配置已保存');
    toggleSettings();
  });
}

// ===== 设置面板 =====
function toggleSettings() {
  const panel = document.getElementById('settingsPanel');
  const overlay = document.getElementById('overlay');
  panel.classList.toggle('active');
  overlay.classList.toggle('active');
}

// ===== 提示框 =====
function showAlert(type, title, message) {
  // 根据当前功能选择对应的容器
  const containerMap = {
    'single': 'singleAlertContainer',
    'batch': 'batchAlertContainer',
    'blogger': 'bloggerAlertContainer'
  };
  
  const containerId = currentFunction ? containerMap[currentFunction] : null;
  const container = containerId ? document.getElementById(containerId) : null;
  
  if (!container) {
    console.warn('找不到提示容器:', containerId);
    return;
  }
  
  // 关键：如果之前是 success/info 产生的自动清空定时器，必须先清掉
  // 否则会出现：先显示“正在同步”(info)，3秒后定时器把后续的 error 也清掉 → 看起来像“报错太快消失”
  if (!window.__alertTimers) window.__alertTimers = {};
  if (window.__alertTimers[containerId]) {
    clearTimeout(window.__alertTimers[containerId]);
    delete window.__alertTimers[containerId];
  }

  const iconMap = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };
  
  container.innerHTML = `
    <div class="alert ${type}">
      <span class="material-symbols-outlined">${iconMap[type]}</span>
      <div class="alert-content">
        <div class="alert-title">${title}</div>
        <div>${message}</div>
      </div>
    </div>
  `;
  
  // 成功和信息提示自动消失（延长时间，方便看清）
  if (type === 'success' || type === 'info') {
    const ttl = type === 'success' ? 6000 : 8000; // success 6s, info 8s
    window.__alertTimers[containerId] = setTimeout(() => {
      // 只清空当前容器内容（如果期间又出现新的提示，会先清理定时器）
      container.innerHTML = '';
      delete window.__alertTimers[containerId];
    }, ttl);
  }
}

function clearAlert() {
  // 清空所有提示容器
  const containers = ['singleAlertContainer', 'batchAlertContainer', 'bloggerAlertContainer'];
  containers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = '';
    }
  });
}

// ===== 消息处理 =====
function handleMessage(message, sender, sendResponse) {
  console.log('Sidebar received message:', message);
  
  if (message.action === 'captureProgress') {
    // 显示采集进度
    showAlert('info', '采集中', message.message);
  }
  
  return true;
}

// ===== 工具函数 =====
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// 绑定单篇笔记点击事件
function bindNoteClickEvents(container) {
  const clickableContents = container.querySelectorAll('.note-content.clickable');
  clickableContents.forEach(content => {
    content.addEventListener('click', function() {
      const noteItem = this.closest('.note-item');
      const url = noteItem?.dataset.url;
      if (url) {
        // 在新标签页打开笔记链接
        chrome.tabs.create({ url: url });
      }
    });
  });
}

// 绑定批量笔记点击事件
function bindBatchNoteClickEvents(container) {
  // 绑定标题点击
  const clickableTitles = container.querySelectorAll('.note-title.clickable');
  clickableTitles.forEach(title => {
    title.addEventListener('click', function() {
      const noteItem = this.closest('.note-item');
      const url = noteItem?.dataset.url;
      if (url) {
        chrome.tabs.create({ url: url });
      }
    });
  });
  
  // 绑定跳转按钮（支持 .btn-icon 和 .btn-icon-sm）
  const linkButtons = container.querySelectorAll('.btn-icon[data-url], .btn-icon-sm[data-url]');
  linkButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const url = this.dataset.url;
      if (url) {
        chrome.tabs.create({ url: url });
      }
    });
  });
}

// 绑定删除按钮事件
function bindDeleteButtons(container) {
  const deleteButtons = container.querySelectorAll('.btn-delete-icon');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (this.dataset.type === 'single') {
        deleteSelected('single');
        return;
      }
      const index = parseInt(this.dataset.index);
      console.log('删除按钮点击, index:', index);
      
      if (confirm('确定要删除这条笔记吗？')) {
        batchNotesData.splice(index, 1);
        renderBatchNotes();
        
        // 更新计数
        const countEl = document.getElementById('batchCount');
        if (countEl) {
          countEl.textContent = batchNotesData.length;
        }
        
        // 更新全选状态
        updateSelectAllState('batch');
        
        if (batchNotesData.length === 0) {
          document.getElementById('batchResults').classList.add('hidden');
        }
      }
    });
  });
}

// 绑定单篇删除按钮事件（使用统一删除逻辑）
function bindSingleDeleteButtons(container) {
  const deleteButtons = container.querySelectorAll('.btn-delete-icon[data-type="single"]');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      deleteSelected('single');
    });
  });
}

// 绑定复选框事件
function bindCheckboxEvents(container, type) {
  const checkboxes = container.querySelectorAll('.note-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      updateSelectAllState(type);
    });
  });
}

function showHelp() {
  const helpUrl = 'https://jcn38dn09zj1.feishu.cn/wiki/G54IwhSEaiM0lgk8uzRcwpD8nAh';
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
    chrome.tabs.create({ url: helpUrl });
  } else {
    window.open(helpUrl, '_blank');
  }
}
