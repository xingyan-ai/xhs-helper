// 红薯助手 - 内容脚本（数据采集核心）
// 注入到小红书页面，负责数据采集

console.log('红薯助手 content script 已加载');

// ===== 消息监听 =====
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Content script received:', request);
  
  if (request.action === 'captureSingleNote') {
    // 采集单篇笔记
    captureSingleNote()
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 保持消息通道开放
  } 
  else if (request.action === 'captureBatchNotes') {
    // 采集博主笔记列表（可带日期范围筛选）
    const filterDateStart = request.filterDateStart ? new Date(request.filterDateStart) : null;
    const filterDateEnd = request.filterDateEnd ? new Date(request.filterDateEnd) : null;
    captureBatchNotes(filterDateStart, filterDateEnd)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  } 
  else if (request.action === 'captureBloggerInfo') {
    // 采集博主信息
    captureBloggerInfo()
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// ===== 工具函数 =====

// XPath查询
function getElementByXPath(xpath, context = document) {
  return document.evaluate(xpath, context, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// 等待元素出现
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error('等待元素超时: ' + selector));
    }, timeout);
  });
}

// 转换互动数（1.2万 -> 12000）
function convertInteractionCount(text) {
  if (!text || typeof text !== 'string') return 0;
  
  text = text.trim().replace(/[^\d.万wkK]/g, '');
  
  if (text.includes('万') || text.toLowerCase().includes('w')) {
    const num = parseFloat(text.replace(/[万w]/gi, ''));
    return Math.round(num * 10000);
  } else if (text.toLowerCase().includes('k')) {
    const num = parseFloat(text.replace(/k/gi, ''));
    return Math.round(num * 1000);
  }
  
  return parseInt(text) || 0;
}

// 解析相对时间文本（如"3天前"、"2月前"等）
function parseRelativeTime(text) {
  if (!text) return null;
  
  const now = new Date();
  
  // 匹配各种时间格式
  if (text.includes('分钟前')) {
    const minutes = parseInt(text) || 0;
    return new Date(now.getTime() - minutes * 60000);
  }
  if (text.includes('小时前')) {
    const hours = parseInt(text) || 0;
    return new Date(now.getTime() - hours * 3600000);
  }
  if (text.includes('天前')) {
    const days = parseInt(text) || 0;
    return new Date(now.getTime() - days * 86400000);
  }
  if (text.includes('周前')) {
    const weeks = parseInt(text) || 0;
    return new Date(now.getTime() - weeks * 7 * 86400000);
  }
  if (text.includes('月前')) {
    const months = parseInt(text) || 0;
    const date = new Date(now);
    date.setMonth(date.getMonth() - months);
    return date;
  }
  if (text.includes('年前')) {
    const years = parseInt(text) || 0;
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - years);
    return date;
  }
  if (text.includes('昨天')) {
    return new Date(now.getTime() - 86400000);
  }
  if (text.includes('前天')) {
    return new Date(now.getTime() - 2 * 86400000);
  }
  
  // 尝试匹配 MM-DD 或 YYYY-MM-DD 格式
  const dateMatch = text.match(/(\d{4})?-?(\d{1,2})-(\d{1,2})/);
  if (dateMatch) {
    const year = dateMatch[1] ? parseInt(dateMatch[1]) : now.getFullYear();
    const month = parseInt(dateMatch[2]) - 1;
    const day = parseInt(dateMatch[3]);
    return new Date(year, month, day);
  }
  
  return null;
}

// 格式化日期
function formatDate(date, format = 'YYYY/MM/DD HH:mm') {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
}

// 处理发布日期
function processPublishDate(rawDate) {
  if (!rawDate) return '';
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // 处理 "X分钟前", "X小时前"
  if (rawDate.includes('分钟前')) {
    const minutes = parseInt(rawDate);
    const date = new Date(now.getTime() - minutes * 60000);
    return formatDate(date);
  }
  
  if (rawDate.includes('小时前')) {
    const hours = parseInt(rawDate);
    const date = new Date(now.getTime() - hours * 3600000);
    return formatDate(date);
  }
  
  // 处理 "昨天 HH:mm"
  if (rawDate.includes('昨天')) {
    const time = rawDate.replace('昨天', '').trim();
    const [hours, minutes] = time.split(':').map(n => parseInt(n));
    const date = new Date(today.getTime() - 86400000);
    date.setHours(hours, minutes, 0, 0);
    return formatDate(date);
  }
  
  // 处理 "X天前"
  if (rawDate.includes('天前')) {
    const days = parseInt(rawDate);
    const date = new Date(today.getTime() - days * 86400000);
    return formatDate(date, 'YYYY/MM/DD');
  }
  
  // 处理 "MM-DD HH:mm"
  if (/^\d{2}-\d{2}/.test(rawDate)) {
    const [datePart, timePart] = rawDate.split(' ');
    const [month, day] = datePart.split('-').map(n => parseInt(n));
    const year = now.getFullYear();
    
    if (timePart) {
      const [hours, minutes] = timePart.split(':').map(n => parseInt(n));
      return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
  }
  
  // 处理 "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
    return rawDate.replace(/-/g, '/');
  }
  
  return rawDate;
}

// ===== 采集单篇笔记 =====
async function captureSingleNote() {
  console.log('开始采集单篇笔记');
  
  // 验证URL
  const url = window.location.href;
  if (!url.includes('xiaohongshu.com') || !url.includes('/explore/')) {
    throw new Error('请在小红书笔记详情页使用此功能');
  }
  
  // 等待页面加载
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 提取数据
  const data = {
    url: url,
    title: '',
    author: '',
    content: '',
    tags: '',
    likes: 0,
    collects: 0,
    comments: 0,
    publishDate: '',
    imageUrls: '',
    videoUrl: '',
    noteType: '图文',
    coverImageUrl: '',
    captureTime: formatDate(new Date())
  };
  
  // 标题
  const titleSelectors = [
    '#detail-title',
    '.title',
    '[class*="title"]',
    'h1'
  ];
  for (const selector of titleSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.trim()) {
      data.title = el.textContent.trim();
      break;
    }
  }
  
  // 作者
  const authorSelectors = [
    '.author-name',
    '.username',
    '[class*="author"]',
    'a[href*="/user/profile"]'
  ];
  for (const selector of authorSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.trim()) {
      data.author = el.textContent.trim();
      break;
    }
  }
  
  // 正文内容
  const contentSelectors = [
    '#detail-desc',
    '.content',
    '[class*="desc"]',
    '.note-text'
  ];
  for (const selector of contentSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.trim()) {
      data.content = el.textContent.trim();
      break;
    }
  }
  
  // 话题标签
  const tagElements = document.querySelectorAll('a[href*="/search_result"], .tag, [class*="tag"]');
  const tags = Array.from(tagElements)
    .map(el => el.textContent.trim())
    .filter(text => text.startsWith('#'))
    .join(',');
  data.tags = tags;
  
  // 互动数据 - 使用精确的选择器
  // 首先尝试查找包含互动数据的 .left 容器（位于笔记详情页底部）
  const leftContainers = document.querySelectorAll('.left');
  let interactionLeft = null;
  
  for (const container of leftContainers) {
    // 检查容器是否包含点赞、收藏或评论元素
    if (container.querySelector('.like-wrapper') || 
        container.querySelector('.collect-wrapper') || 
        container.querySelector('.chat-wrapper')) {
      interactionLeft = container;
      break;
    }
  }
  
  if (interactionLeft) {
    // 提取点赞数
    const likeElement = interactionLeft.querySelector('.like-wrapper .count');
    if (likeElement) {
      const likeText = likeElement.textContent.trim();
      data.likes = convertInteractionCount(likeText);
      console.log('点赞数:', data.likes, '(原始文本:', likeText, ')');
    }
    
    // 提取收藏数
    const collectElement = interactionLeft.querySelector('.collect-wrapper .count');
    if (collectElement) {
      const collectText = collectElement.textContent.trim();
      data.collects = convertInteractionCount(collectText);
      console.log('收藏数:', data.collects, '(原始文本:', collectText, ')');
    }
    
    // 提取评论数
    const chatElement = interactionLeft.querySelector('.chat-wrapper .count');
    if (chatElement) {
      const chatText = chatElement.textContent.trim();
      data.comments = convertInteractionCount(chatText);
      console.log('评论数:', data.comments, '(原始文本:', chatText, ')');
    }
  } else {
    // 如果找不到特定的 .left 容器，尝试全局查找
    const likeElement = document.querySelector('.like-wrapper .count');
    if (likeElement) {
      const likeText = likeElement.textContent.trim();
      data.likes = convertInteractionCount(likeText);
    }
    
    const collectElement = document.querySelector('.collect-wrapper .count');
    if (collectElement) {
      const collectText = collectElement.textContent.trim();
      data.collects = convertInteractionCount(collectText);
    }
    
    const chatElement = document.querySelector('.chat-wrapper .count');
    if (chatElement) {
      const chatText = chatElement.textContent.trim();
      data.comments = convertInteractionCount(chatText);
    }
  }
  
  // 发布时间
  const dateSelectors = [
    '.date',
    '.time',
    '[class*="publish"]',
    '[class*="date"]'
  ];
  for (const selector of dateSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.trim()) {
      data.publishDate = processPublishDate(el.textContent.trim());
      break;
    }
  }
  
  // 图片
  const images = Array.from(document.querySelectorAll('img[src*="xhscdn.com"]'))
    .map(img => img.src)
    .filter(src => !src.includes('avatar'));
  data.imageUrls = images.join(',');
  data.coverImageUrl = images[0] || '';
  
  // 判断类型（视频/图文）
  const hasVideo = document.querySelector('video') !== null;
  data.noteType = hasVideo ? '视频' : '图文';
  
  if (hasVideo) {
    const video = document.querySelector('video');
    if (video && video.src) {
      data.videoUrl = video.src;
    }
  }
  
  console.log('单篇笔记采集完成:', data);
  return data;
}

// ===== 采集博主笔记列表 =====
async function captureBatchNotes(filterDateStart = null, filterDateEnd = null) {
  let filterMsg = '(全部)';
  if (filterDateStart && filterDateEnd) {
    filterMsg = `(日期范围: ${filterDateStart.toLocaleDateString('zh-CN')} 至 ${filterDateEnd.toLocaleDateString('zh-CN')})`;
  } else if (filterDateStart) {
    filterMsg = `(开始日期: ${filterDateStart.toLocaleDateString('zh-CN')})`;
  } else if (filterDateEnd) {
    filterMsg = `(结束日期: ${filterDateEnd.toLocaleDateString('zh-CN')})`;
  }
  console.log('开始采集博主笔记列表', filterMsg);
  
  // 验证URL
  const url = window.location.href;
  if (!url.includes('xiaohongshu.com') || !url.includes('/user/profile/')) {
    throw new Error('请在小红书博主主页使用此功能');
  }
  
  // 先滚动到页面顶部，确保从头开始采集
  window.scrollTo({ top: 0, behavior: 'instant' });
  console.log('已滚动到页面顶部');
  
  // 等待页面加载和滚动完成
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 再次确保在顶部
  window.scrollTo({ top: 0, behavior: 'instant' });
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const notes = [];
  const processedUrls = new Set();
  let skippedByDate = 0; // 记录因日期被过滤的数量
  
  // 获取博主名称
  let authorName = '';
  const authorEl = document.querySelector('.user-name, .username, [class*="user-name"]');
  if (authorEl) {
    authorName = authorEl.textContent.trim();
  }
  
  // 滚动加载更多
  let lastHeight = 0;
  let sameHeightCount = 0;
  const maxScrolls = 20; // 最多滚动20次
  
  for (let i = 0; i < maxScrolls; i++) {
    // 提取当前可见的笔记卡片
    // 只使用 section.note-item 作为选择器，确保获取完整的卡片容器
    const noteCards = document.querySelectorAll('section.note-item');
    
    console.log(`第${i + 1}次滚动，找到 ${noteCards.length} 个笔记卡片`);
    
    noteCards.forEach((card) => {
      // 获取链接 - 优先获取带xsec_token的链接（可正常访问）
      let noteUrl = '';
      let noteId = '';
      
      // 优先获取 a.cover 链接（带token，可正常访问）
      const coverLink = card.querySelector('a.cover[href*="xsec_token"]') || 
                        card.querySelector('a[href*="xsec_token"]');
      if (coverLink) {
        noteUrl = coverLink.href;
        // 从URL中提取noteId用于去重和日期解析
        // URL格式: /user/profile/{userId}/{noteId}?xsec_token=...
        // 需要匹配最后一个24位hex（笔记ID），而不是用户ID
        const idMatch = noteUrl.match(/\/([a-f0-9]{24})\?/i) || // 匹配 ?xsec_token 前面的ID
                        noteUrl.match(/\/([a-f0-9]{24})$/i);    // 匹配URL末尾的ID
        if (idMatch) {
          noteId = idMatch[1];
          console.log('提取到笔记ID:', noteId);
        }
      }
      
      // 如果没有找到带token的链接，再尝试获取 /explore/ 链接
      if (!noteUrl) {
        const exploreLink = card.tagName === 'A' ? card : card.querySelector('a[href*="/explore/"]');
        if (exploreLink) {
          noteUrl = exploreLink.href;
          const idMatch = noteUrl.match(/\/explore\/([a-f0-9]+)/i);
          if (idMatch) {
            noteId = idMatch[1];
          }
        }
      }
      
      // 去重（使用noteId去重，因为同一个笔记可能有不同的URL格式）
      const dedupeKey = noteId || noteUrl;
      if (!dedupeKey || processedUrls.has(dedupeKey)) return;
      processedUrls.add(dedupeKey);
      
      // 提取数据
      const note = {
        title: '',
        url: noteUrl,
        author: authorName,
        likes: 0,
        image: ''
      };
      
      // 标题 - 根据小红书博主主页的HTML结构
      // 结构: .footer .title span
      const titleEl = card.querySelector('.footer .title span') || 
                      card.querySelector('.footer a.title span') ||
                      card.querySelector('a.title span') ||
                      card.querySelector('.title span');
      if (titleEl && titleEl.textContent.trim()) {
        note.title = titleEl.textContent.trim();
        console.log('提取到标题:', note.title);
      }
      
      // 点赞数 - 根据小红书博主主页的HTML结构
      // 结构: .like-wrapper .count
      const likesEl = card.querySelector('.like-wrapper .count') ||
                      card.querySelector('.count');
      if (likesEl) {
        const likesText = likesEl.textContent.trim();
        note.likes = convertInteractionCount(likesText);
        console.log('提取到点赞数:', likesText, '→', note.likes);
      }
      
      // 图片 - 使用更精确的选择器
      const imgEl = card.querySelector('a.cover img') || card.querySelector('img[src*="xhscdn.com"]');
      if (imgEl && imgEl.src) {
        note.image = imgEl.src;
      }
      
      // 从笔记ID解析发布日期
      // 笔记ID格式: 693adc7f000000001f00f9d4
      // 前8位是十六进制的Unix时间戳
      if (noteId && noteId.length >= 8) {
        const hexTime = noteId.substring(0, 8);
        const timestamp = parseInt(hexTime, 16);
        
        if (timestamp > 1000000000) { // 确保是有效的时间戳（2001年之后）
          const noteDate = new Date(timestamp * 1000);
          note.publishDate = noteDate;
          note.publishDateStr = noteDate.toLocaleDateString('zh-CN');
          
          console.log('从笔记ID解析日期:', hexTime, '→', note.publishDateStr);
          
          // 日期范围筛选
          const noteDateOnly = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate());
          
          // 检查开始日期（笔记日期必须 >= 开始日期）
          if (filterDateStart) {
            const startDateOnly = new Date(filterDateStart.getFullYear(), filterDateStart.getMonth(), filterDateStart.getDate());
            if (noteDateOnly < startDateOnly) {
              skippedByDate++;
              console.log('日期筛选跳过(早于开始日期):', note.publishDateStr, '<', filterDateStart.toLocaleDateString('zh-CN'));
              return; // 跳过此笔记
            }
          }
          
          // 检查结束日期（笔记日期必须 <= 结束日期）
          if (filterDateEnd) {
            const endDateOnly = new Date(filterDateEnd.getFullYear(), filterDateEnd.getMonth(), filterDateEnd.getDate());
            if (noteDateOnly > endDateOnly) {
              skippedByDate++;
              console.log('日期筛选跳过(晚于结束日期):', note.publishDateStr, '>', filterDateEnd.toLocaleDateString('zh-CN'));
              return; // 跳过此笔记
            }
          }
        }
      }
      
      if (note.title || note.url) {
        notes.push(note);
      }
    });
    
    // 滚动到底部
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 检查是否还在加载
    const currentHeight = document.body.scrollHeight;
    if (currentHeight === lastHeight) {
      sameHeightCount++;
      if (sameHeightCount >= 3) {
        console.log('已到达底部');
        break;
      }
    } else {
      sameHeightCount = 0;
    }
    lastHeight = currentHeight;
    
    // 向sidebar发送进度
    const hasFilter = filterDateStart || filterDateEnd;
    const progressMsg = hasFilter && skippedByDate > 0 
      ? `已采集 ${notes.length} 条笔记（跳过 ${skippedByDate} 条不在范围内的笔记）...`
      : `已采集 ${notes.length} 条笔记...`;
    chrome.runtime.sendMessage({
      action: 'captureProgress',
      message: progressMsg
    });
  }
  
  const hasFilter = filterDateStart || filterDateEnd;
  console.log('博主笔记列表采集完成:', notes.length, hasFilter ? `(跳过 ${skippedByDate} 条不在范围内的笔记)` : '');
  return notes;
}

// ===== 采集博主信息 =====
async function captureBloggerInfo() {
  console.log('开始采集博主信息');
  
  // 验证URL
  const url = window.location.href;
  if (!url.includes('xiaohongshu.com') || !url.includes('/user/profile/')) {
    throw new Error('请在小红书博主主页使用此功能');
  }
  
  // 等待页面加载
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const data = {
    bloggerName: '',
    avatarUrl: '',
    bloggerId: '',
    description: '',
    followersCount: 0,
    bloggerUrl: url
  };
  
  // 博主名称 - 更广泛的选择器
  const nameSelectors = [
    '[class*="user-name"]',
    '[class*="username"]',
    '[class*="nick"]',
    '.user-info span',
    'span[class*="name"]'
  ];
  for (const selector of nameSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.trim() && el.textContent.length < 50) {
      data.bloggerName = el.textContent.trim();
      break;
    }
  }
  
  // 头像
  const avatarSelectors = [
    'img[class*="avatar"]',
    '.avatar img',
    '.user-avatar img',
    'img[class*="user"]'
  ];
  for (const selector of avatarSelectors) {
    const el = document.querySelector(selector);
    if (el && el.src && el.src.includes('http') && !el.src.includes('data:')) {
      data.avatarUrl = el.src;
      break;
    }
  }
  
  // 小红书号 - 优化提取逻辑
  const allText = document.body.textContent;
  const idMatch = allText.match(/小红书号[：:]\s*([\w]+)/i) || 
                  allText.match(/ID[：:]\s*([\w]+)/i) ||
                  allText.match(/红书号[：:]\s*([\w]+)/i);
  if (idMatch) {
    data.bloggerId = idMatch[1];
  } else {
    // 尝试从页面元素查找
    const idSelectors = [
      '[class*="redId"]',
      '[class*="red-id"]',
      '[class*="userId"]'
    ];
    for (const selector of idSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        const text = el.textContent.trim();
        // 提取包含数字和字母的ID
        const match = text.match(/[a-zA-Z0-9_-]{6,}/);
        if (match) {
          data.bloggerId = match[0];
          break;
        }
      }
    }
  }
  
  // 简介
  const bioSelectors = [
    '[class*="desc"]',
    '[class*="bio"]',
    '[class*="intro"]',
    '.user-desc',
    '.description'
  ];
  for (const selector of bioSelectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.trim() && el.textContent.length > 10 && el.textContent.length < 500) {
      data.description = el.textContent.trim();
      break;
    }
  }
  
  // 粉丝数 - 优化提取逻辑
  // 方法1: 正则匹配 "粉丝 数字" 或 "数字 粉丝"
  const fansPatterns = [
    /(\d+\.?\d*[万wkK]?)\s*粉丝/i,
    /粉丝\s*[：:]*\s*(\d+\.?\d*[万wkK]?)/i,
    /粉丝数\s*[：:]*\s*(\d+\.?\d*[万wkK]?)/i
  ];
  
  for (const pattern of fansPatterns) {
    const match = allText.match(pattern);
    if (match && match[1]) {
      data.followersCount = convertInteractionCount(match[1]);
      console.log('通过正则匹配到粉丝数:', match[1], '→', data.followersCount);
      break;
    }
  }
  
  // 方法2: 如果方法1没找到，尝试查找DOM元素
  if (data.followersCount === 0) {
    const allElements = document.querySelectorAll('span, div');
    for (const el of allElements) {
      const text = el.textContent.trim();
      
      // 检查元素本身或相邻元素是否包含"粉丝"
      if (text.includes('粉丝') && text.length < 30) {
        // 提取这段文本中的数字
        const numMatch = text.match(/(\d+\.?\d*[万wkK]?)/);
        if (numMatch) {
          data.followersCount = convertInteractionCount(numMatch[1]);
          console.log('通过DOM元素找到粉丝数:', numMatch[1], '→', data.followersCount);
          break;
        }
      }
    }
  }
  
  console.log('博主信息采集完成:', data);
  return data;
}

