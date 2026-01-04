// 红薯助手 - 侧边栏交互逻辑
// 负责：UI交互、数据管理、导出、飞书同步

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
  
  notesList.innerHTML = `
    <div class="note-item" data-url="${noteUrl}">
      <input type="checkbox" class="note-checkbox" checked>
      <div class="note-content clickable" title="点击打开笔记">
        <div class="note-cover">
          <div class="note-badge">1</div>
          ${imageUrl ? `<img src="${imageUrl}" alt="封面">` : '<span style="font-size: 32px;">📷</span>'}
        </div>
        <div class="note-info">
          <div class="note-title">${singleNoteData.title || '无标题'}</div>
          <div class="note-meta">${singleNoteData.author || '未知作者'} • ${singleNoteData.publishDate || '未知时间'}</div>
          <div class="note-stats">
            <span>👍 ${formatNumber(singleNoteData.likes || 0)}</span>
            <span>⭐ ${formatNumber(singleNoteData.collects || 0)}</span>
            <span>💬 ${formatNumber(singleNoteData.comments || 0)}</span>
          </div>
        </div>
        <div class="note-link-icon">
          <span class="material-symbols-outlined">open_in_new</span>
        </div>
      </div>
    </div>
  `;
  
  // 绑定点击事件
  bindNoteClickEvents(notesList);
  
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
          <span class="note-likes">👍 ${formatNumber(note.likes || 0)}</span>
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
      
      csvContent = '\ufeff标题,笔记链接,笔记类型,作者,正文,话题标签,封面链接,点赞数,收藏数,评论数,发布时间,采集时间\n';
      selectedNotes.forEach(note => {
        const row = [
          note.title || '无标题',
          note.url || '',
          note.noteType || '图文',
          note.author || '未知作者',
          note.content || '',
          note.tags || '',
          note.coverImageUrl || '',
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
      
      csvContent = '\ufeff序号,标题,链接,作者,点赞数,图片链接\n';
      selectedNotes.forEach((note, index) => {
        const row = [
          index + 1,
          note.title || '无标题',
          note.url || '',
          note.author || '未知作者',
          note.likes || 0,
          note.image || ''
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
      workflowId = feishuConfig.singleNoteWorkflowId || '';
      tableUrl = feishuConfig.knowledgeUrl;
      
      records = selectedData.map(note => ({
        fields: {
          "标题": note.title || '',
          "笔记链接": note.url || '',
          "笔记类型": note.noteType || '图文',
          "作者": note.author || '',
          "正文": note.content || '',
          "话题标签": note.tags || '',
          "封面": note.coverImageUrl || '',
          "图片附件": note.imageUrls || '',
          "点赞数": note.likes || 0,
          "收藏数": note.collects || 0,
          "评论数": note.comments || 0,
          "发布时间": note.publishDate || '',
          "采集时间": new Date().toLocaleString('zh-CN')
        }
      }));
      
    } else if (type === 'batch') {
      // 博主笔记批量同步
      workflowId = feishuConfig.batchNotesWorkflowId || '';
      tableUrl = feishuConfig.bloggerNoteUrl;
      
      records = selectedData.map(note => ({
        fields: {
          "博主": note.author || '',
          "标题": note.title || '',
          "点赞数": note.likes || 0,
          "笔记链接": note.url || '',
          "封面链接": note.image || '',
          "笔记发布时间预估": note.publishDate || '',
          "采集时间": new Date().toLocaleString('zh-CN')
        }
      }));
      
    } else if (type === 'blogger') {
      // 博主信息同步
      workflowId = feishuConfig.bloggerInfoWorkflowId || '';
      tableUrl = feishuConfig.bloggerUrl;
      
      records = selectedData.map(info => ({
        fields: {
          "博主名称": info.bloggerName || '',
          "头像": info.avatarUrl || '',
          "小红书号": info.bloggerId || '',
          "简介": info.description || '',
          "粉丝数": info.followersCount || 0,
          "主页链接": info.bloggerUrl || '',
          "采集时间": new Date().toLocaleString('zh-CN')
        }
      }));
    }
    
    // 检查工作流ID
    if (!workflowId) {
      showAlert('error', '配置缺失', '请在设置中配置工作流ID');
      toggleSettings();
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
          orderId: feishuConfig.orderId,
          baseToken: feishuConfig.baseToken,
          tableUrl: tableUrl,
          body: body
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Coze API 响应:', result);
    
    // 解析结果
    if (result.code === 0 && result.data) {
      const data = JSON.parse(result.data);
      
      if (data.orderId_result === false) {
        showAlert('error', '订单号无效', '订单号不存在或已过期，请联系管理员');
      } else if (data.add_result === true) {
        showAlert('success', '同步成功', `已成功将 ${selectedData.length} 条数据同步到飞书多维表格`);
      } else {
        showAlert('error', '同步失败', data.message || '数据写入失败，请检查飞书配置');
      }
    } else {
      showAlert('error', '同步失败', result.msg || '未知错误');
    }
    
  } catch (error) {
    console.error('同步错误:', error);
    showAlert('error', '同步失败', `网络请求失败: ${error.message}`);
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
      document.getElementById('singleNoteWorkflowId').value = feishuConfig.singleNoteWorkflowId || '';
      document.getElementById('batchNotesWorkflowId').value = feishuConfig.batchNotesWorkflowId || '';
      document.getElementById('bloggerInfoWorkflowId').value = feishuConfig.bloggerInfoWorkflowId || '';
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
    bloggerUrl: document.getElementById('bloggerUrl').value.trim(),
    singleNoteWorkflowId: document.getElementById('singleNoteWorkflowId').value.trim(),
    batchNotesWorkflowId: document.getElementById('batchNotesWorkflowId').value.trim(),
    bloggerInfoWorkflowId: document.getElementById('bloggerInfoWorkflowId').value.trim()
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
  
  // 成功和信息提示3秒后自动消失
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      container.innerHTML = '';
    }, 3000);
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
  alert('红薯助手使用说明：\n\n1. 选择功能（单篇笔记/博主笔记/博主信息）\n2. 打开对应的小红书页面\n3. 点击"开始采集"\n4. 采集成功后可以导出Excel或同步到飞书\n\n需要更多帮助？请访问项目文档。');
}
