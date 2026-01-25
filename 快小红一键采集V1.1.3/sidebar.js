// 在文件顶部添加消息监听器
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'captureProgress') {
    // 显示进度信息，但不自动清除
    showStatus(request.message + `\n已发现${request.currentCount}条笔记`);
  } else if (request.action === 'bloggerInfoCaptured') {
    // 处理博主信息采集结果
    if (request.success) {
      capturedBloggerInfo = request.data;
      updateBloggerInfoDisplay();
      checkAndUpdateButtonStatus();
      showStatus('博主信息采集成功');
    } else {
      showStatus('博主信息采集失败: ' + request.error);
    }
  }
});

// 全局变量存储采集的链接数据
let capturedLinks = [];
let capturedNote = null; // 单篇笔记采集结果
let capturedBloggerInfo = null; // 博主信息采集结果

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化Tab切换功能
  initTabSwitching();
  
  // 先显示默认激活的Tab内容
  const activeTab = document.querySelector('.tab-button.active');
  if (activeTab) {
    if (activeTab.id === 'singleCaptureTab') {
      document.getElementById('singleCaptureContent').classList.add('active');
    } else if (activeTab.id === 'captureTab') {
      document.getElementById('captureContent').classList.add('active');
    } else if (activeTab.id === 'bloggerInfoTab') {
      document.getElementById('bloggerInfoContent').classList.add('active');
    } else if (activeTab.id === 'configTab') {
      document.getElementById('configContent').classList.add('active');
    }
  }
  
  // 初始化按钮事件监听
  initButtonListeners();
  
  // 初始化采集的链接展示
  updateCapturedLinksDisplay();
  updateSingleNoteDisplay();
  updateBloggerInfoDisplay();
  
  // 检查并更新导出和同步按钮状态
  checkAndUpdateButtonStatus();
});

// 初始化Tab切换功能
function initTabSwitching() {
  const captureTab = document.getElementById('captureTab');
  const configTab = document.getElementById('configTab');
  const singleCaptureTab = document.getElementById('singleCaptureTab');
  // 添加博主信息Tab引用
  const bloggerInfoTab = document.getElementById('bloggerInfoTab');
  
  const captureContent = document.getElementById('captureContent');
  const configContent = document.getElementById('configContent');
  const singleCaptureContent = document.getElementById('singleCaptureContent');
  // 添加博主信息内容面板引用
  const bloggerInfoContent = document.getElementById('bloggerInfoContent');
  
  // 采集Tab点击事件
  captureTab.addEventListener('click', function() {
    switchTab(captureTab, captureContent);
  });
  
  // 配置Tab点击事件
  configTab.addEventListener('click', function() {
    switchTab(configTab, configContent);
    
    // 读取本地配置并填充到输入框
    loadConfiguration();
  });
  
  // 单篇采集Tab点击事件
  singleCaptureTab.addEventListener('click', function() {
    switchTab(singleCaptureTab, singleCaptureContent);
  });
  
  // 添加博主信息Tab点击事件
  bloggerInfoTab.addEventListener('click', function() {
    switchTab(bloggerInfoTab, bloggerInfoContent);
  });
}

// 切换Tab的辅助函数
function switchTab(activeTab, activeContent) {
  // 移除所有active类
  document.querySelectorAll('.tab-button').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-pane').forEach(content => {
    content.classList.remove('active');
  });
  
  // 添加active类到当前选中的Tab和内容
  activeTab.classList.add('active');
  activeContent.classList.add('active');
}

// 初始化按钮事件监听
function initButtonListeners() {
  // 开始采集按钮
  document.getElementById('startCaptureBtn').addEventListener('click', function() {
    startCapture();
  });
  
  // 清空按钮
  document.getElementById('clearAllBtn').addEventListener('click', function() {
    clearAllNotes();
  });
  
  // 导出Excel按钮
  document.getElementById('exportExcelBtn').addEventListener('click', function() {
    exportToExcel();
  });
  
  // 同步飞书按钮
  document.getElementById('syncFeishuBtn').addEventListener('click', function() {
    syncToFeishu();
  });
  
  // 保存配置按钮
  document.getElementById('saveConfigBtn').addEventListener('click', function() {
    saveConfiguration();
  });
  
  // 单篇采集相关按钮
  document.getElementById('startSingleCaptureBtn').addEventListener('click', function() {
    startSingleCapture();
  });
  
  // 添加清空单篇采集按钮的事件绑定
  document.getElementById('clearSingleCaptureBtn').addEventListener('click', function() {
    clearSingleCapture();
  });
  
  document.getElementById('exportSingleExcelBtn').addEventListener('click', function() {
    exportSingleNoteToExcel();
  });
  
  // 新增下载图片视频按钮事件绑定
  document.getElementById('downloadMediaBtn').addEventListener('click', function() {
    downloadAllMedia();
  });
  
  document.getElementById('syncSingleFeishuBtn').addEventListener('click', function() {
    syncSingleNoteToFeishu();
  });
  
  // 博主信息相关按钮
  document.getElementById('startBloggerCaptureBtn').addEventListener('click', function() {
    startBloggerCapture();
  });
  
  // 博主信息页面的清空按钮
  document.getElementById('clearBloggerBtn').addEventListener('click', function() {
    clearBloggerInfo();
  });
  
  // 添加博主信息页面的导出Excel按钮事件监听
  document.getElementById('exportBloggerExcelBtn').addEventListener('click', function() {
    exportBloggerInfoToExcel();
  });
  
  // 添加博主信息页面的同步飞书按钮事件监听
  document.getElementById('syncBloggerFeishuBtn').addEventListener('click', function() {
    syncBloggerInfoToFeishu();
  });
}

// 清空所有笔记函数
function clearAllNotes() {
  // 显示确认对话框，防止用户误操作
  if (confirm('确定要清空所有采集的笔记吗？此操作不可撤销。')) {
    // 清空capturedLinks数组
    capturedLinks = [];
    
    // 更新UI显示，移除所有采集结果卡片
    updateCapturedLinksDisplay();
    
    // 更新按钮状态，确保导出和同步按钮也被正确禁用
    checkAndUpdateButtonStatus();
    
    // 显示状态信息，告知用户操作已完成
    showStatus('已清空所有采集的笔记');
  }
}

// 检查并更新导出和同步按钮状态
function checkAndUpdateButtonStatus() {
  const exportButton = document.getElementById('exportExcelBtn');
  const syncButton = document.getElementById('syncFeishuBtn');
  const clearButton = document.getElementById('clearAllBtn');
  const singleExportButton = document.getElementById('exportSingleExcelBtn');
  const singleSyncButton = document.getElementById('syncSingleFeishuBtn');
  // 新增下载按钮引用
  const downloadMediaBtn = document.getElementById('downloadMediaBtn');
  // 新增单篇采集清除按钮引用
  const clearSingleCaptureBtn = document.getElementById('clearSingleCaptureBtn');
  
  // 博主信息相关按钮
  const clearBloggerButton = document.getElementById('clearBloggerBtn');
  const exportBloggerButton = document.getElementById('exportBloggerExcelBtn');
  const syncBloggerButton = document.getElementById('syncBloggerFeishuBtn');
  
  // 更新普通采集相关按钮状态
  exportButton.disabled = capturedLinks.length === 0;
  syncButton.disabled = capturedLinks.length === 0;
  clearButton.disabled = capturedLinks.length === 0;
  
  // 更新单篇采集相关按钮状态
  singleExportButton.disabled = capturedNote === null;
  singleSyncButton.disabled = capturedNote === null;
  downloadMediaBtn.disabled = capturedNote === null;
  clearSingleCaptureBtn.disabled = capturedNote === null; // 添加单篇采集清除按钮的状态管理
  
  // 更新博主信息相关按钮状态
  clearBloggerButton.disabled = capturedBloggerInfo === null;
  exportBloggerButton.disabled = capturedBloggerInfo === null;
  syncBloggerButton.disabled = capturedBloggerInfo === null;
}

// 开始采集函数
function startCapture() {
  // 清空之前的采集结果
  capturedLinks = [];
  updateCapturedLinksDisplay();
  
  // 更明显的采集状态提示
  showStatus('正在采集中，请稍后...\n采集过程中请勿关闭插件窗口');
  
  // 禁用开始采集按钮防止重复点击
  const captureBtn = document.getElementById('startCaptureBtn');
  const originalText = captureBtn.textContent;
  captureBtn.disabled = true;
  captureBtn.textContent = '采集ing...';
  
  // 向content script发送消息，开始采集
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'startCapture'}, function(response) {
      // 恢复按钮状态
      captureBtn.disabled = false;
      captureBtn.textContent = originalText;
      
      if (chrome.runtime.lastError) {
        showStatus('采集失败，请确保您在小红书博主主页上使用此功能');
        return;
      }
      
      // 检查response是否包含links字段来判断成功
      if (response && response.links && response.links.length > 0) {
        capturedLinks = response.links;
        showStatus(`成功采集到 ${capturedLinks.length} 条笔记`);
        updateCapturedLinksDisplay();
        checkAndUpdateButtonStatus();
      } else {
        // 正确显示错误信息
        showStatus('采集失败：' + (response && response.error ? response.error : '未能采集到任何链接，请确保在博主主页上使用此功能，并等待页面完全加载'));
      }
    });
  });
}

// 更新采集的链接展示
function updateCapturedLinksDisplay() {
  const container = document.getElementById('capturedLinksContainer');
  container.innerHTML = '';
  
  if (capturedLinks.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999; margin: 20px 0;">暂无采集的笔记</p>';
    return;
  }
  
  capturedLinks.forEach((link, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="image-container">
        <div class="card-number">${index + 1}</div>
        ${link.image ? 
          `<img src="${link.image}" alt="${link.title}">` : 
          '<div class="placeholder">无图片</div>'}
      </div>
      <div class="card-content">
        <a href="${link.url}" class="card-title" target="_blank" rel="noopener noreferrer">
          ${link.title || '无标题'}
        </a>
        <div class="card-author">${link.author || '未知作者'}</div>
        <div class="card-likes">点赞数: ${link.likes || 0}</div>
      </div>
      <button class="delete-button" data-index="${index}">删除</button>
    `;
    
    container.appendChild(card);
  });
  
  // 为删除按钮添加事件监听
  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const index = parseInt(this.getAttribute('data-index'));
      deleteNote(index);
    });
  });
}

// 删除笔记函数
function deleteNote(index) {
  if (index >= 0 && index < capturedLinks.length) {
    capturedLinks.splice(index, 1);
    updateCapturedLinksDisplay();
    checkAndUpdateButtonStatus();
    showStatus('笔记已删除');
  }
}

// 导出Excel函数
function exportToExcel() {
  if (capturedLinks.length === 0) {
    showStatus('没有可导出的笔记数据');
    return;
  }
  
  showStatus('正在导出Excel，请稍候...');
  
  try {
    // 准备CSV数据
    let csvContent = '\ufeff标题,链接,作者,点赞数,图片链接\n'; // BOM字符确保中文正常显示
    
    capturedLinks.forEach(note => {
      // 处理CSV中的特殊字符
      const title = note.title ? note.title.replace(/"/g, '""').replace(/,/g, '，') : '无标题';
      const url = note.url || '';
      const author = note.author ? note.author.replace(/"/g, '""').replace(/,/g, '，') : '未知作者';
      const likes = note.likes || 0;
      const imageUrl = note.image || '';
      
      // 添加CSV行
      csvContent += `"${title}","${url}","${author}","${likes}","${imageUrl}"\n`;
    });
    
    // 创建Blob对象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // 设置下载属性
    link.setAttribute('href', url);
    link.setAttribute('download', `小红书笔记_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    
    // 添加到文档并触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showStatus(`成功导出 ${capturedLinks.length} 条笔记到Excel`);
  } catch (error) {
    console.error('导出Excel时出错:', error);
    showStatus('导出Excel失败，请重试');
  }
}

// 显示状态信息 - 优化版
function showStatus(message) {
  const statusElement = document.getElementById('status');
  // 使用innerHTML替代textContent，以便正确解析HTML标签
  statusElement.innerHTML = message;
  
  // 移除自动清除逻辑，让提示内容一直显示直到下一次操作
}

// 同步飞书函数 - 完全符合需求的实现
function syncToFeishu() {
  if (capturedLinks.length === 0) {
    showStatus('没有可同步的笔记数据');
    return;
  }
  
  showStatus('正在同步到飞书，请稍候...');
  
  // 获取飞书配置
  const config = loadConfiguration(true);
  
  // 检查配置是否完整
  if (!config.ordeid || !config.basetoken || !config.blogger_noteurl) {
    showStatus('请先配置完整的飞书信息');
    switchTab(document.getElementById('configTab'), document.getElementById('configContent'));
    return;
  }
  
  // 准备同步数据
  try {
    // 构建records数组 - 修复反引号问题
    const records = capturedLinks.map(note => {
      // 确保URL中不包含反引号
      const cleanUrl = note.url ? note.url.replace(/`/g, '') : '';
      const cleanImageUrl = note.image ? note.image.replace(/`/g, '') : '';
      
      return {
        fields: {
          "博主": note.author || "未知作者",
          "标题": note.title || "无标题",
          "点赞数": note.likes || 0,
          "笔记链接": {
            "link": cleanUrl,
            "text": "查看原文"
          },
          "封面链接": cleanImageUrl
        }
      };
    });
    
    // 构建完整的数据对象
    const dataObject = {
      records: records
    };
    
    // 转换为JSON字符串
    const author_notes = JSON.stringify(dataObject);
    
    // 确保blogger_noteurl不包含反引号
    const cleanBloggerNoteUrl = config.blogger_noteurl.replace(/`/g, '');
    
    // 显示加载状态并禁用按钮
    const syncButton = document.getElementById('syncFeishuBtn');
    const originalText = syncButton.textContent;
    syncButton.disabled = true;
    syncButton.textContent = '同步中...';
    
    // 向coze平台发起post请求
    fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sat_NbvH6WQTg8EX496ohv6JE0B3ocRAnTuWKYyt4ADuajYzs6RQdwW4emf5GmjQdfwe',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_id: '7550495904676167716',
        parameters: {
          ordeid: config.ordeid.toString(),  // 确保是字符串格式
          basetoken: config.basetoken.toString(),  // 确保是字符串格式
          blogger_noteurl: cleanBloggerNoteUrl,  // 使用清理后的URL
          body: author_notes  // 这已经是JSON字符串格式
        }
      })
    })
    .then(response => {
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`网络请求失败: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // 恢复按钮状态
      syncButton.disabled = false;
      syncButton.textContent = originalText;
      
      console.log('Coze API响应:', data);
      
      // 处理响应
      if (data.code !== 0) {
        showStatus(`同步出了点问题，稍等一会儿大概率还是能成功的。异常原因: ${data.code}，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-DRiAdKoFLoxqRExIDRXckAYYngc" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
      } else {
        try {
          // 解析data字段
          const result = JSON.parse(data.data);
          console.log('解析后的响应数据:', result);
          
          if (result.add_result && result.ordeid_result) {
            showStatus(`同步成功，去表格看看吧，<a href="${config.blogger_noteurl}" target="_blank" style="color: blue; text-decoration: underline;">点击查看表格</a>`);
          } else if (!result.ordeid_result) {
            showStatus(`订单号不存在或已过期或存在多人使用情况，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-CmMadVR0coyfwJx0pVacPYTqnDc" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
          } else {
            showStatus(`同步出了点问题，add_result: ${result.add_result}，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-OdlLdPGuporr03xpENUc6XfQnee" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
          }
        } catch (parseError) {
          console.error('解析响应数据时出错:', parseError);
          showStatus(`同步出了点问题，解析错误: ${parseError.message}，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-OdlLdPGuporr03xpENUc6XfQnee" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
        }
      }
    })
    .catch(error => {
      console.error('同步飞书时出错:', error);
      // 恢复按钮状态
      syncButton.disabled = false;
      syncButton.textContent = originalText;
      showStatus(`同步出了点问题，错误: ${error.message}，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-EPTBdup2koFUa1xElphcQgEknsc" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
    });
  } catch (dataError) {
    console.error('数据处理错误:', dataError);
    showStatus(`数据处理出错，错误: ${dataError.message}，请重试`);
  }
}

// 优化下载图片视频函数，添加订单号验证功能
async function downloadAllMedia() {
  if (capturedNote === null) {
    showStatus('没有可下载的媒体数据');
    return;
  }
  
  // 收集所有图片和视频链接
  const mediaUrls = [];
  
  // 添加所有图片链接
  if (capturedNote.imageUrls) {
    const imageArray = capturedNote.imageUrls.split(',');
    mediaUrls.push(...imageArray.filter(url => url.trim() !== ''));
  }
  
  // 添加视频链接
  if (capturedNote.videoUrl && capturedNote.videoUrl.trim() !== '') {
    mediaUrls.push(capturedNote.videoUrl);
  }
  
  if (mediaUrls.length === 0) {
    showStatus('没有找到可下载的图片或视频');
    return;
  }
  
  // 禁用按钮防止重复点击
  const downloadBtn = document.getElementById('downloadMediaBtn');
  const originalText = downloadBtn.textContent;
  downloadBtn.disabled = true;
  downloadBtn.textContent = '验证中...';
  
  try {
    // 获取飞书配置中的orderid
    const config = loadConfiguration(true);
    
    if (!config.ordeid) {
      showStatus('请先在配置页填写订单号');
      downloadBtn.disabled = false;
      downloadBtn.textContent = originalText;
      switchTab(document.getElementById('configTab'), document.getElementById('configContent'));
      return;
    }
    
    showStatus('正在验证订单号，请稍候...');
    
    // 向coze平台发起post请求验证订单号
    const response = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sat_NbvH6WQTg8EX496ohv6JE0B3ocRAnTuWKYyt4ADuajYzs6RQdwW4emf5GmjQdfwe',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_id: '7550648911973105664',
        parameters: {
          ordeid: config.ordeid.toString() // 确保是字符串格式
        }
      })
    });
    
    const data = await response.json();
    console.log('Coze API响应:', data);
    
    // 处理响应
    if (data.code !== 0) {
      showStatus(`验证订单号出了点问题，请稍后再试，或者联系客服解决，<a href="https://lv13e2iljbk.feishu.cn/docx/Og5ddVoAboc9Wox6mmkcIuA7nlc?from=from_copylink" target="_blank" style="color: blue; text-decoration: underline;">点击联系客服</a>`);
      downloadBtn.disabled = false;
      downloadBtn.textContent = originalText;
      return;
    } else {
      try {
        // 解析data字段
        const result = JSON.parse(data.data);
        console.log('解析后的响应数据:', result);
        
        if (!result.ordeid_result) {
          showStatus(`订单号不存在或已过期或存在多人使用情况，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-EPTBdup2koFUa1xElphcQgEknsc" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
          downloadBtn.disabled = false;
          downloadBtn.textContent = originalText;
          return;
        } else {
          // 订单验证通过，继续下载逻辑
          showStatus('正在下载媒体文件，请稍候...');
          downloadBtn.textContent = '下载中...';
          
          // 逐个下载文件
          let downloadedCount = 0;
          let failedCount = 0;
          
          // 为文件夹生成默认名称
          const noteTitle = capturedNote.title ? capturedNote.title.replace(/[^\w\u4e00-\u9fa5]/g, '_').substring(0, 15) : '小红书笔记';
          
          mediaUrls.forEach((url, index) => {
            // 为文件生成有意义的名称
            const fileExtension = url.match(/\.\w+($|\?)/) ? url.match(/\.\w+($|\?)/)[0].split('?')[0] : '.jpg';
            const fileName = `${noteTitle}_media_${index + 1}${fileExtension}`;
            
            // 使用Chrome下载API进行下载
            chrome.downloads.download({
              url: url,
              filename: fileName,
              saveAs: false, // 不显示浏览器默认的保存对话框
              conflictAction: 'uniquify' // 文件名冲突时自动重命名
            }, (downloadId) => {
              if (chrome.runtime.lastError) {
                console.error('下载失败:', chrome.runtime.lastError);
                failedCount++;
              } else {
                downloadedCount++;
              }
              
              // 所有文件都处理完成后更新状态
              if (downloadedCount + failedCount === mediaUrls.length) {
                setTimeout(() => {
                  downloadBtn.disabled = false;
                  downloadBtn.textContent = originalText;
                  
                  if (failedCount > 0) {
                    showStatus(`下载完成：成功 ${downloadedCount} 个，失败 ${failedCount} 个`);
                  } else {
                    showStatus(`成功下载 ${downloadedCount} 个媒体文件到浏览器默认下载文件夹`);
                  }
                }, 1000);
              }
            });
          });
        }
      } catch (parseError) {
        console.error('解析响应数据时出错:', parseError);
        showStatus(`验证订单号出了点问题，请稍后再试，或者联系客服解决，<a href="https://lv13e2iljbk.feishu.cn/docx/Og5ddVoAboc9Wox6mmkcIuA7nlc?from=from_copylink" target="_blank" style="color: blue; text-decoration: underline;">点击联系客服</a>`);
        downloadBtn.disabled = false;
        downloadBtn.textContent = originalText;
      }
    }
  } catch (error) {
    console.error('验证订单号时出错:', error);
    showStatus(`验证订单号出了点问题，请稍后再试，或者联系客服解决，<a href="https://lv13e2iljbk.feishu.cn/docx/Og5ddVoAboc9Wox6mmkcIuA7nlc?from=from_copylink" target="_blank" style="color: blue; text-decoration: underline;">点击联系客服</a>`);
    
    // 恢复按钮状态
    downloadBtn.disabled = false;
    downloadBtn.textContent = originalText;
  }
}

// 保存配置到本地
function saveConfiguration() {
  const config = {
    ordeid: document.getElementById('ordeid').value,
    basetoken: document.getElementById('basetoken').value,
    knowledgeurl: document.getElementById('knowledgeurl').value,
    blogger_noteurl: document.getElementById('blogger_noteurl').value,
    bloggerurl: document.getElementById('bloggerurl').value
  };
  
  // 保存到localStorage
  localStorage.setItem('feishuConfig', JSON.stringify(config));
  
  showStatus('配置已保存');
  
  // 检查并更新按钮状态
  checkAndUpdateButtonStatus();
}

// 从本地加载配置
function loadConfiguration(silent = false) {
  const configStr = localStorage.getItem('feishuConfig');
  if (configStr) {
    try {
      const config = JSON.parse(configStr);
      
      // 填充到输入框
      document.getElementById('ordeid').value = config.ordeid || '';
      document.getElementById('basetoken').value = config.basetoken || '';
      document.getElementById('knowledgeurl').value = config.knowledgeurl || '';
      document.getElementById('blogger_noteurl').value = config.blogger_noteurl || '';
      document.getElementById('bloggerurl').value = config.bloggerurl || '';
      
      return config;
    } catch (e) {
      if (!silent) {
        showStatus('配置解析错误');
      }
    }
  }
  return {};
}

// 优化单篇采集函数
function startSingleCapture() {
  // 清空之前的采集结果，确保完全重置对象
  capturedNote = null;
  updateSingleNoteDisplay();
  
  // 显示采集状态提示
  showStatus('正在采集单篇笔记，请稍后...');
  
  // 禁用开始采集按钮防止重复点击
  const captureBtn = document.getElementById('startSingleCaptureBtn');
  const originalText = captureBtn.textContent;
  captureBtn.disabled = true;
  captureBtn.textContent = '采集ing...';
  
  // 设置超时处理
  const timeoutId = setTimeout(() => {
    if (captureBtn.disabled) {
      showStatus('采集超时，请刷新页面后重试');
      captureBtn.disabled = false;
      captureBtn.textContent = originalText;
    }
  }, 15000); // 15秒超时
  
  // 首先检查是否在笔记详情页
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'checkIsNotePage'}, function(response) {
      // 清除超时定时器
      clearTimeout(timeoutId);
      
      if (chrome.runtime.lastError) {
        showStatus('请确保您在小红书网页版上使用此功能');
        captureBtn.disabled = false;
        captureBtn.textContent = originalText;
        return;
      }
      
      if (!response || !response.isNotePage) {
        showStatus('请确保在小红书笔记详情页上使用此功能');
        captureBtn.disabled = false;
        captureBtn.textContent = originalText;
        return;
      }
      
      // 确认在笔记详情页后，开始提取数据
      chrome.tabs.sendMessage(tabs[0].id, {action: 'extractNoteData'}, function(response) {
        // 恢复按钮状态
        captureBtn.disabled = false;
        captureBtn.textContent = originalText;
        
        if (chrome.runtime.lastError) {
          showStatus('提取笔记数据失败，请刷新页面后重试');
          return;
        }
        
        if (response && response.success && response.data) {
          // 完全重新创建对象，确保不继承任何残留属性
          capturedNote = {
            url: response.data.url || '',
            title: response.data.title || '',
            author: response.data.author || '',
            content: response.data.content || '',
            tags: response.data.tags || '',
            likes: response.data.likes || 0,
            collects: response.data.collects || 0,
            comments: response.data.comments || 0,
            publishDate: response.data.publishDate || '',
            imageUrls: response.data.imageUrls || '',
            formattedImageUrls: response.data.formattedImageUrls || '',
            noteType: response.data.noteType || '',
            coverImageUrl: response.data.coverImageUrl || '',
            captureTimestamp: response.data.captureTimestamp || '',
            captureRemark: response.data.captureRemark || ''
          };
          
          // 只有当明确是视频笔记时才添加videoUrl字段
          if (response.data.videoUrl && response.data.videoUrl.trim() !== '' && 
              response.data.noteType === '视频') {
            capturedNote.videoUrl = response.data.videoUrl;
          }
          
          showStatus('成功采集到单篇笔记');
          updateSingleNoteDisplay();
          checkAndUpdateButtonStatus();
        } else {
          showStatus('采集失败：' + (response && response.error ? response.error : '未能提取到笔记数据'));
        }
      });
    });
  });
}

// 开始采集博主信息函数
function startBloggerCapture() {
  // 发送消息到content.js开始采集博主信息
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs.length > 0) {
      // 显示采集状态
      showStatus('正在采集博主信息...');
      
      // 向content.js发送消息开始采集
      chrome.tabs.sendMessage(tabs[0].id, {action: 'startCaptureBloggerInfo'}, function(response) {
        if (chrome.runtime.lastError) {
          showStatus('采集失败: 无法与页面通信，请刷新页面后重试');
        }
      });
    } else {
      showStatus('请先选择一个小红书页面');
    }
  });
}

// 清空博主信息函数
function clearBloggerInfo() {
  if (confirm('确定要清空采集的博主信息吗？')) {
    capturedBloggerInfo = null;
    updateBloggerInfoDisplay();
    checkAndUpdateButtonStatus();
    showStatus('已清空博主信息');
  }
}

// 导出博主信息到Excel
function exportBloggerInfoToExcel() {
  if (capturedBloggerInfo === null) {
    showStatus('没有可导出的博主信息数据');
    return;
  }
  
  showStatus('正在导出Excel，请稍候...');
  
  try {
    // 准备CSV数据 - 包含所有要求的字段
    let csvContent = '\ufeff博主名称,头像链接,小红书号,简介,粉丝数,博主主页链接,采集时间\n'; // BOM字符确保中文正常显示
    
    // 获取博主信息
    const bloggerInfo = capturedBloggerInfo;
    
    // 处理CSV中的特殊字符
    const name = bloggerInfo.bloggerName || bloggerInfo.name || '';
    const avatarUrl = bloggerInfo.avatarUrl || bloggerInfo.avatar || '';
    const bloggerId = bloggerInfo.bloggerId || bloggerInfo.userId || bloggerInfo.xiaohongshuId || '';
    const description = bloggerInfo.description || bloggerInfo.bio || '';
    const followersCount = bloggerInfo.followersCount || bloggerInfo.fansCount || 0;
    const bloggerUrl = bloggerInfo.bloggerUrl || bloggerInfo.profileUrl || bloggerInfo.url || '';
    const captureTimestamp = new Date().getTime(); // 中国日期的时间戳格式
    
    // 处理特殊字符
    const cleanName = name.replace(/"/g, '""').replace(/,/g, '，');
    const cleanDescription = description.replace(/"/g, '""').replace(/,/g, '，');
    
    // 添加CSV行
    csvContent += '"' + cleanName + '","' + avatarUrl + '","' + bloggerId + '","' + cleanDescription + '","' + followersCount + '","' + bloggerUrl + '","' + captureTimestamp + '"\n';
    
    // 创建Blob对象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // 设置下载属性
    link.setAttribute('href', url);
    link.setAttribute('download', '小红书博主信息_' + new Date().toLocaleDateString('zh-CN').replace(/\//g, '-') + '.csv');
    link.style.visibility = 'hidden';
    
    // 添加到文档并触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showStatus('成功导出博主信息到Excel');
  } catch (error) {
    console.error('导出Excel时出错:', error);
    showStatus('导出Excel失败，请重试');
  }
}

// 同步博主信息到飞书
function syncBloggerInfoToFeishu() {
  if (capturedBloggerInfo === null) {
    showStatus('没有可同步的博主信息数据');
    return;
  }
  
  showStatus('正在同步到飞书，请稍候...');
  
  // 获取飞书配置
  const config = loadConfiguration(true);
  
  // 检查配置是否完整
  if (!config.ordeid || !config.basetoken || !config.bloggerurl) {
    showStatus('请先配置完整的飞书信息');
    switchTab(document.getElementById('configTab'), document.getElementById('configContent'));
    return;
  }
  
  // 准备同步数据
  try {
    // 获取博主信息
    const bloggerInfo = capturedBloggerInfo;
    
    // 构建records数组 - 完全按照用户要求的格式
    const records = [{
      "fields": {
        "博主名称": bloggerInfo.bloggerName || bloggerInfo.name || "",
        "头像链接": bloggerInfo.avatarUrl || bloggerInfo.avatar || "",
        "小红书号": bloggerInfo.bloggerId || bloggerInfo.userId || bloggerInfo.xiaohongshuId || "",
        "简介": bloggerInfo.description || bloggerInfo.bio || "",
        "粉丝数": bloggerInfo.followersCount || bloggerInfo.fansCount || 0,
        "主页链接": {
          "link": bloggerInfo.bloggerUrl || bloggerInfo.profileUrl || bloggerInfo.url || "",
          "text": "查看原文"
        },
        "采集时间": new Date().getTime() // 中国日期的时间戳格式
      }
    }];
    
    // 构建完整的数据对象
    const dataObject = {
      records: records
    };
    
    // 转换为JSON字符串 - 赋值给auther_detail变量
    const auther_detail = JSON.stringify(dataObject);
    
    // 显示加载状态并禁用按钮
    const syncButton = document.getElementById('syncBloggerFeishuBtn');
    const originalText = syncButton.textContent;
    syncButton.disabled = true;
    syncButton.textContent = '同步中...';
    
    // 向coze平台发起post请求 - 使用正确的工作流ID和参数
    fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sat_NbvH6WQTg8EX496ohv6JE0B3ocRAnTuWKYyt4ADuajYzs6RQdwW4emf5GmjQdfwe',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_id: '7550495802553106467', // 使用用户提供的正确工作流ID
        parameters: {
          ordeid: config.ordeid.toString(),  // 确保是字符串格式
          basetoken: config.basetoken.toString(),  // 确保是字符串格式
          bloggerurl: config.bloggerurl.toString(),  // 使用正确的参数名称
          body: auther_detail  // 将参数名改为body，确保工作流能正确接收数据
        }
      })
    })
    .then(response => {
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`网络请求失败: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // 恢复按钮状态
      syncButton.disabled = false;
      syncButton.textContent = originalText;
      
      console.log('Coze API响应:', data);
      
      // 处理响应
      if (data.code !== 0) {
        showStatus(`同步出了点问题，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-H59ZdVRpdoLXwBxUuGScaICqnjf" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
      } else {
        try {
          // 解析data字段
          const result = JSON.parse(data.data);
          console.log('解析后的响应数据:', result);
          
          if (result.add_result && result.ordeid_result) {
            showStatus(`同步成功，去表格看看吧，<a href="${config.bloggerurl}" target="_blank" style="color: blue; text-decoration: underline;">点击查看表格</a>`);
          } else if (!result.ordeid_result) {
            showStatus(`订单号不存在或已过期或存在多人使用情况，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-H59ZdVRpdoLXwBxUuGScaICqnjf" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
          } else {
            showStatus(`同步出了点问题，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-I9K1dUYcdoQZoHxxya9cdTJLn0g" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
          }
        } catch (parseError) {
          console.error('解析响应数据时出错:', parseError);
          showStatus(`同步出了点问题，解析错误: ${parseError.message}，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-I9K1dUYcdoQZoHxxya9cdTJLn0g" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
        }
      }
    })
    .catch(error => {
      console.error('同步飞书时出错:', error);
      // 恢复按钮状态
      syncButton.disabled = false;
      syncButton.textContent = originalText;
      showStatus(`同步出了点问题，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-I9K1dUYcdoQZoHxxya9cdTJLn0g" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
    });
  } catch (dataError) {
    console.error('数据处理错误:', dataError);
    showStatus(`数据处理出错，请重试`);
  }
}

// 更新单篇笔记展示
function updateSingleNoteDisplay() {
  const container = document.getElementById('singleCapturedNotesContainer');
  container.innerHTML = '';
  
  if (capturedNote === null) {
    container.innerHTML = '<p style="text-align: center; color: #999; margin: 20px 0;">暂无采集的笔记</p>';
    return;
  }
  
  const card = document.createElement('div');
  card.className = 'card';
  
  // 提取图片显示 - 与博主笔记保持一致的逻辑
  const imageUrls = capturedNote.imageUrls ? capturedNote.imageUrls.split(',') : [];
  const displayImage = imageUrls.length > 0 ? imageUrls[0] : (capturedNote.videoUrl ? capturedNote.videoUrl : '');
  
  card.innerHTML = `
    <div class="image-container">
      <div class="card-number">1</div>
      ${displayImage ? 
        `<img src="${displayImage}" alt="${capturedNote.title}">` : 
        '<div class="placeholder">无图片</div>'}
    </div>
    <div class="card-content">
      <a href="${capturedNote.url}" class="card-title" target="_blank" rel="noopener noreferrer">
        ${capturedNote.title || '无标题'}
      </a>
      <div class="card-author">${capturedNote.author || '未知作者'}</div>
      <div class="card-likes">点赞数: ${capturedNote.likes || 0}</div>
    </div>
  `;
  
  container.appendChild(card);
}

// 更新博主信息展示
function updateBloggerInfoDisplay() {
  const container = document.getElementById('bloggerInfoContainer');
  container.innerHTML = '';
  
  if (capturedBloggerInfo === null) {
    container.innerHTML = '<p style="text-align: center; color: #999; margin: 20px 0;">暂无采集的博主信息</p>';
    return;
  }
  
  const card = document.createElement('div');
  card.className = 'card'; // 使用与博主笔记相同的卡片样式
  
  const bloggerUrl = capturedBloggerInfo.bloggerUrl || capturedBloggerInfo.profileUrl || capturedBloggerInfo.url;
  
  card.innerHTML = `
    <div class="image-container blogger-avatar-container">
      <img src="${capturedBloggerInfo.avatarUrl || capturedBloggerInfo.avatar}" alt="${capturedBloggerInfo.bloggerName || capturedBloggerInfo.name}">
    </div>
    <div class="card-content">
      <a href="${bloggerUrl}" class="card-title" target="_blank" rel="noopener noreferrer">
        ${capturedBloggerInfo.bloggerName || capturedBloggerInfo.name}
      </a>
      <div class="card-author">小红书号: ${capturedBloggerInfo.bloggerId || capturedBloggerInfo.userId || capturedBloggerInfo.xiaohongshuId}</div>
      <div class="card-stats">
        <span class="stat-item">粉丝数: ${capturedBloggerInfo.followersCount || capturedBloggerInfo.fansCount}</span>
      </div>
    </div>
  `;
  
  container.appendChild(card);
}

// 添加清空单篇采集结果的函数
function clearSingleCapture() {
  // 显示确认对话框，防止用户误操作
  if (confirm('确定要清空单篇采集的笔记吗？此操作不可撤销。')) {
    // 完全清空capturedNote对象，确保不残留任何属性
    capturedNote = null;
    
    // 更新UI显示
    updateSingleNoteDisplay();
    
    // 更新按钮状态
    checkAndUpdateButtonStatus();
    
    // 显示状态信息
    showStatus('已清空单篇采集的笔记');
  }
}

// 导出单篇笔记到Excel
function exportSingleNoteToExcel() {
  if (capturedNote === null) {
    showStatus('没有可导出的笔记数据');
    return;
  }
  
  showStatus('正在导出Excel，请稍候...');
  
  try {
    // 准备CSV数据 - 包含所有要求的字段
    let csvContent = '\ufeff标题,笔记链接,笔记类型,作者,正文,话题标签,封面链接,全部图片链接,视频链接,点赞数,收藏数,评论数,发布时间,采集时间\n'; // BOM字符确保中文正常显示
    
    // 处理CSV中的特殊字符
    const title = capturedNote.title ? capturedNote.title.replace(/"/g, '""').replace(/,/g, '，') : '无标题';
    const url = capturedNote.url || '';
    const noteType = capturedNote.videoUrl ? '视频' : '图文';
    const author = capturedNote.author ? capturedNote.author.replace(/"/g, '""').replace(/,/g, '，') : '未知作者';
    const content = capturedNote.content ? capturedNote.content.replace(/"/g, '""').replace(/,/g, '，') : '';
    
    // 处理话题标签，去除#符号
    let tags = '';
    if (capturedNote.tags) {
      tags = capturedNote.tags.split(',').map(tag => tag.replace(/#/g, '').trim()).join('、');
    }
    
    // 处理封面链接
    const coverLink = capturedNote.imageUrls ? capturedNote.imageUrls.split(',')[0] : '';
    
    // 处理全部图片链接，按"图X=(链接)"格式组合带换行
    let formattedImageUrls = '';
    if (capturedNote.imageUrls) {
      const imageArray = capturedNote.imageUrls.split(',');
      formattedImageUrls = imageArray.map((img, index) => `图${index + 1}=(${img})`).join('\n');
    }
    
    const videoUrl = capturedNote.videoUrl || '';
    const likes = capturedNote.likes || 0;
    const collects = capturedNote.collects || 0;
    const comments = capturedNote.comments || 0;
    const publishDate = capturedNote.publishDate || '';
    const captureTimestamp = new Date().getTime(); // 中国日期的时间戳格式
    
    // 添加CSV行
    csvContent += `"${title}","${url}","${noteType}","${author}","${content}","${tags}","${coverLink}","${formattedImageUrls}","${videoUrl}","${likes}","${collects}","${comments}","${publishDate}","${captureTimestamp}"\n`;
    
    // 创建Blob对象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 创建下载链接
    const link = document.createElement('a');
    const urlBlob = URL.createObjectURL(blob);
    
    // 设置下载属性
    link.setAttribute('href', urlBlob);
    link.setAttribute('download', `小红书单篇笔记_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    
    // 添加到文档并触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showStatus('成功导出单篇笔记到Excel');
  } catch (error) {
    console.error('导出Excel时出错:', error);
    showStatus('导出Excel失败，请重试');
  }
}

// 同步单篇笔记到飞书
function syncSingleNoteToFeishu() {
  if (capturedNote === null) {
    showStatus('没有可同步的笔记数据');
    return;
  }
  
  showStatus('正在同步到飞书，请稍候...');
  
  // 获取飞书配置
  const config = loadConfiguration(true);
  
  // 检查配置是否完整
  if (!config.ordeid || !config.basetoken || !config.knowledgeurl) {
    showStatus('请先配置完整的飞书信息');
    switchTab(document.getElementById('configTab'), document.getElementById('configContent'));
    return;
  }
  
  // 准备同步数据
  try {
    // 处理话题标签，去除#符号
    let tagsArray = [];
    if (capturedNote.tags) {
      tagsArray = capturedNote.tags.split(',').map(tag => tag.replace(/#/g, '').trim());
    }
    
    // 处理全部图片链接，按"图X=(链接)"格式组合带换行
    let formattedImageUrls = '';
    if (capturedNote.imageUrls) {
      const imageArray = capturedNote.imageUrls.split(',');
      formattedImageUrls = imageArray.map((img, index) => `图${index + 1}=(${img})`).join('\n');
    }
    
    // 首先创建基本的fields对象
    const fields = {
      "博主": capturedNote.author || "未知作者",
      "封面链接": capturedNote.imageUrls ? capturedNote.imageUrls.split(',')[0] : "",
      "标题": capturedNote.title || "无标题",
      "原文链接": {
        "link": capturedNote.url || "",
        "text": "查看原文"
      },
      "正文": capturedNote.content || "",
      "话题标签": tagsArray,
      "图片链接": formattedImageUrls,
      "点赞数": capturedNote.likes || 0,
      "收藏数": capturedNote.collects || 0,
      "评论数": capturedNote.comments || 0,
      "类型": capturedNote.noteType || (capturedNote.videoUrl ? "视频" : "图文"),
      "域名": "小红书",
      "采集时间": new Date().getTime(), // 中国日期的时间戳格式
      "发布时间": capturedNote.publishDate ? (() => {
        try {
          console.log('=== sidebar.js日期转换调试 ===');
          console.log('原始publishDate:', capturedNote.publishDate);
          
          // 处理格式：2024/12/13 20:00
          const dateStr = capturedNote.publishDate;
          const parts = dateStr.match(/(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})/);
          console.log('正则匹配结果:', parts);
          
          if (parts) {
            const [, year, month, day, hour, minute] = parts;
            console.log('提取的组件:', {year, month, day, hour, minute});
            
            const targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
            console.log('构造的Date对象:', targetDate);
            console.log('最终时间戳:', targetDate.getTime());
            console.log('=== sidebar.js日期转换结束 ===');
            
            return targetDate.getTime();
          }
          // 如果格式不匹配，尝试直接解析
          console.log('格式不匹配，尝试备用解析');
          const fallbackResult = new Date(dateStr.replace(/\//g, '-')).getTime();
          console.log('备用解析结果:', fallbackResult);
          console.log('=== sidebar.js日期转换结束 ===');
          return fallbackResult;
        } catch (e) {
          console.error('日期转换失败:', e);
          return 0;
        }
      })() : 0
    };
    
    // 只有当视频链接不为空时，才添加视频链接字段 - 保留这个优化
    if (capturedNote.videoUrl && capturedNote.videoUrl.trim() !== '') {
      fields["视频链接"] = {
        "link": capturedNote.videoUrl,
        "text": "查看视频"
      };
    }
    
    // 构建records数组
    const records = [{
      "fields": fields
    }];
    
    // 构建完整的数据对象
    const dataObject = {
      records: records
    };
    
    // 转换为JSON字符串 - 赋值给detail_notes变量
    const detail_notes = JSON.stringify(dataObject);
    
    // 显示加载状态并禁用按钮
    const syncButton = document.getElementById('syncSingleFeishuBtn');
    const originalText = syncButton.textContent;
    syncButton.disabled = true;
    syncButton.textContent = '同步中...';
    
    // 向coze平台发起post请求 - 使用正确的工作流ID和参数
    fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sat_NbvH6WQTg8EX496ohv6JE0B3ocRAnTuWKYyt4ADuajYzs6RQdwW4emf5GmjQdfwe',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_id: '7550495126771449906', // 使用用户提供的正确工作流ID
        parameters: {
          ordeid: config.ordeid.toString(),  // 确保是字符串格式
          basetoken: config.basetoken.toString(),  // 确保是字符串格式
          knowledgeurl: config.knowledgeurl.toString(),  // 使用正确的参数名称
          body: detail_notes  // 将参数名改为body，确保工作流能正确接收数据
        }
      })
    })
    .then(response => {
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`网络请求失败: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // 恢复按钮状态
      syncButton.disabled = false;
      syncButton.textContent = originalText;
      
      console.log('Coze API响应:', data);
      
      // 处理响应
      if (data.code !== 0) {
        showStatus(`同步出了点问题，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-AFdnd0607o7xBPxSMIic0gJYn9c" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
      } else {
        try {
          // 解析data字段
          const result = JSON.parse(data.data);
          console.log('解析后的响应数据:', result);
          
          if (result.add_result && result.ordeid_result) {
            showStatus(`同步成功，去表格看看吧，<a href="${config.knowledgeurl}" target="_blank" style="color: blue; text-decoration: underline;">点击查看表格</a>`);
          } else if (!result.ordeid_result) {
            showStatus(`订单号不存在或已过期或存在多人使用情况，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-HTjndQadwouBAExiOXFcJuwjngb" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
          } else {
            showStatus(`同步出了点问题，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-NghBdaa00o9vbdxPr8ScAzFVnsf" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
          }
        } catch (parseError) {
          console.error('解析响应数据时出错:', parseError);
          showStatus(`同步出了点问题，解析错误: ${parseError.message}，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-NghBdaa00o9vbdxPr8ScAzFVnsf" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
        }
      }
    })
    .catch(error => {
      console.error('同步飞书时出错:', error);
      // 恢复按钮状态
      syncButton.disabled = false;
      syncButton.textContent = originalText;
      showStatus(`同步出了点问题，请查看解决办法，<a href="https://lv13e2iljbk.feishu.cn/docx/XjMpdgkFMoYi5VxwXlOcW86Vngf#share-WOiJdwwmvoIYfrxoROMcbNHtnLx" target="_blank" style="color: blue; text-decoration: underline;">点击查看</a>`);
    });
  } catch (dataError) {
    console.error('数据处理错误:', dataError);
    showStatus(`数据处理出错，请重试`);
  }
}

// 保存配置到本地
function saveConfiguration() {
  const config = {
    ordeid: document.getElementById('ordeid').value,
    basetoken: document.getElementById('basetoken').value,
    knowledgeurl: document.getElementById('knowledgeurl').value,
    blogger_noteurl: document.getElementById('blogger_noteurl').value,
    bloggerurl: document.getElementById('bloggerurl').value
  };
  
  // 保存到localStorage
  localStorage.setItem('feishuConfig', JSON.stringify(config));
  
  showStatus('配置已保存');
  
  // 检查并更新按钮状态
  checkAndUpdateButtonStatus();
}

// 从本地加载配置
function loadConfiguration(silent = false) {
  const configStr = localStorage.getItem('feishuConfig');
  if (configStr) {
    try {
      const config = JSON.parse(configStr);
      
      // 填充到输入框
      document.getElementById('ordeid').value = config.ordeid || '';
      document.getElementById('basetoken').value = config.basetoken || '';
      document.getElementById('knowledgeurl').value = config.knowledgeurl || '';
      document.getElementById('blogger_noteurl').value = config.blogger_noteurl || '';
      document.getElementById('bloggerurl').value = config.bloggerurl || '';
      
      return config;
    } catch (e) {
      if (!silent) {
        showStatus('配置解析错误');
      }
    }
  }
  return {};
}

// 优化单篇采集函数
function startSingleCapture() {
  // 清空之前的采集结果
  capturedNote = null;
  updateSingleNoteDisplay();
  
  // 显示采集状态提示
  showStatus('正在采集单篇笔记，请稍后...');
  
  // 禁用开始采集按钮防止重复点击
  const captureBtn = document.getElementById('startSingleCaptureBtn');
  const originalText = captureBtn.textContent;
  captureBtn.disabled = true;
  captureBtn.textContent = '采集ing...';
  
  // 设置超时处理
  const timeoutId = setTimeout(() => {
    if (captureBtn.disabled) {
      showStatus('采集超时，请刷新页面后重试');
      captureBtn.disabled = false;
      captureBtn.textContent = originalText;
    }
  }, 15000); // 15秒超时
  
  // 首先检查是否在笔记详情页
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'checkIsNotePage'}, function(response) {
      // 清除超时定时器
      clearTimeout(timeoutId);
      
      if (chrome.runtime.lastError) {
        showStatus('请打开小红书网页并刷新页面后再开始采集');
        captureBtn.disabled = false;
        captureBtn.textContent = originalText;
        return;
      }
      
      if (!response || !response.isNotePage) {
        showStatus('请确保在小红书笔记详情页上使用此功能');
        captureBtn.disabled = false;
        captureBtn.textContent = originalText;
        return;
      }
      
      // 确认在笔记详情页后，开始提取数据
      chrome.tabs.sendMessage(tabs[0].id, {action: 'extractNoteData'}, function(response) {
        // 恢复按钮状态
        captureBtn.disabled = false;
        captureBtn.textContent = originalText;
        
        if (chrome.runtime.lastError) {
          showStatus('提取笔记数据失败，请刷新页面后重试');
          return;
        }
        
        if (response && response.success && response.data) {
          // 使用对象展开运算符创建新对象，避免属性残留
          capturedNote = { ...response.data };
          showStatus('成功采集到单篇笔记');
          updateSingleNoteDisplay();
          checkAndUpdateButtonStatus();
        } else {
          showStatus('采集失败：' + (response && response.error ? response.error : '未能提取到笔记数据'));
        }
      });
    });
  });
}

// 更新单篇笔记展示
function updateSingleNoteDisplay() {
  const container = document.getElementById('singleCapturedNotesContainer');
  container.innerHTML = '';
  
  if (capturedNote === null) {
    container.innerHTML = '<p style="text-align: center; color: #999; margin: 20px 0;">暂无采集的笔记</p>';
    return;
  }
  
  const card = document.createElement('div');
  card.className = 'card';
  
  // 提取图片显示
  const imageUrls = capturedNote.imageUrls ? capturedNote.imageUrls.split(',') : [];
  const displayImage = imageUrls.length > 0 ? imageUrls[0] : (capturedNote.videoUrl ? capturedNote.videoUrl : '');
  
  card.innerHTML = `
    <div class="image-container">
      <div class="card-number">1</div>
      ${displayImage ? 
        `<img src="${displayImage}" alt="${capturedNote.title}">` : 
        '<div class="placeholder">无图片</div>'}
    </div>
    <div class="card-content">
      <a href="${capturedNote.url}" class="card-title" target="_blank" rel="noopener noreferrer">
        ${capturedNote.title || '无标题'}
      </a>
      <div class="card-author">${capturedNote.author || '未知作者'}</div>
      <div class="card-stats">
        <span class="stat-item">点赞数: ${capturedNote.likes || 0}</span>
        <span class="stat-item">收藏数: ${capturedNote.collects || 0}</span>
        <span class="stat-item">评论数: ${capturedNote.comments || 0}</span>
      </div>
    </div>
  `;
  
  container.appendChild(card);
}

// 导出单篇笔记到Excel
function exportSingleNoteToExcel() {
  if (capturedNote === null) {
    showStatus('没有可导出的笔记数据');
    return;
  }
  
  showStatus('正在导出Excel，请稍候...');
  
  try {
    // 准备CSV数据 - 包含所有要求的字段
    let csvContent = '\ufeff标题,笔记链接,笔记类型,作者,正文,话题标签,封面链接,全部图片链接,视频链接,点赞数,收藏数,评论数,发布时间,采集时间\n'; // BOM字符确保中文正常显示
    
    // 处理CSV中的特殊字符
    const title = capturedNote.title ? capturedNote.title.replace(/"/g, '""').replace(/,/g, '，') : '无标题';
    const url = capturedNote.url || '';
    const noteType = capturedNote.videoUrl ? '视频' : '图文';
    const author = capturedNote.author ? capturedNote.author.replace(/"/g, '""').replace(/,/g, '，') : '未知作者';
    const content = capturedNote.content ? capturedNote.content.replace(/"/g, '""').replace(/,/g, '，') : '';
    
    // 处理话题标签，去除#符号
    let tags = '';
    if (capturedNote.tags) {
      tags = capturedNote.tags.split(',').map(tag => tag.replace(/#/g, '').trim()).join('、');
    }
    
    // 处理封面链接
    const coverLink = capturedNote.imageUrls ? capturedNote.imageUrls.split(',')[0] : '';
    
    // 处理全部图片链接，按"图X=(链接)"格式组合带换行
    let formattedImageUrls = '';
    if (capturedNote.imageUrls) {
      const imageArray = capturedNote.imageUrls.split(',');
      formattedImageUrls = imageArray.map((img, index) => `图${index + 1}=(${img})`).join('\n');
    }
    
    const videoUrl = capturedNote.videoUrl || '';
    const likes = capturedNote.likes || 0;
    const collects = capturedNote.collects || 0;
    const comments = capturedNote.comments || 0;
    const publishDate = capturedNote.publishDate || '';
    const captureTimestamp = new Date().getTime(); // 中国日期的时间戳格式
    
    // 添加CSV行
    csvContent += `"${title}","${url}","${noteType}","${author}","${content}","${tags}","${coverLink}","${formattedImageUrls}","${videoUrl}","${likes}","${collects}","${comments}","${publishDate}","${captureTimestamp}"\n`;
    
    // 创建Blob对象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 创建下载链接
    const link = document.createElement('a');
    const urlBlob = URL.createObjectURL(blob);
    
    // 设置下载属性
    link.setAttribute('href', urlBlob);
    link.setAttribute('download', `小红书单篇笔记_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    
    // 添加到文档并触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showStatus('成功导出单篇笔记到Excel');
  } catch (error) {
    console.error('导出Excel时出错:', error);
    showStatus('导出Excel失败，请重试');
  }
}