// 监听来自sidebar.js的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'startCapture') {
    // 创建一个可取消的任务
    let isCanceled = false;
    
    // 定期发送进度更新 - 使用闭包保护变量
    const progressInterval = setInterval(() => {
      if (!isCanceled && typeof window.captureProgress === 'function') {
        window.captureProgress();
      }
    }, 2000);
    
    captureLinks().then(links => {
      isCanceled = true;
      clearInterval(progressInterval);
      sendResponse({ links: links });
    }).catch(error => {
      isCanceled = true;
      clearInterval(progressInterval);
      console.error('采集错误:', error);
      sendResponse({ error: error.message || '请确保在小红书博主主页上使用此功能，并等待页面完全加载' });
    });
    return true; // 保持消息通道开放
  } else if (request.action === 'checkIsNotePage') {
    // 检查是否在小红书笔记详情页
    const isNotePage = checkIsNotePage();
    sendResponse({ isNotePage: isNotePage });
    return true;
  } else if (request.action === 'extractNoteData') {
    // 提取单篇笔记数据
    extractNoteData().then(data => {
      sendResponse({ success: true, data: data });
    }).catch(error => {
      console.error('提取笔记数据错误:', error);
      sendResponse({ success: false, error: error.message || '提取笔记数据失败' });
    });
    return true;
  } else if (request.action === 'extractBloggerInfo') {
    // 提取博主信息
    extractBloggerInfo().then(data => {
      sendResponse({ success: true, data: data });
    }).catch(error => {
      console.error('提取博主信息错误:', error);
      sendResponse({ success: false, error: error.message || '提取博主信息失败' });
    });
    return true;
  } else if (request.action === 'startCaptureBloggerInfo') {
    // 处理开始采集博主信息的请求
    extractBloggerInfo().then(data => {
      // 直接向sidebar.js发送采集到的博主信息
      chrome.runtime.sendMessage({action: 'bloggerInfoCaptured', success: true, data: data});
      sendResponse({ success: true });
    }).catch(error => {
      console.error('采集博主信息错误:', error);
      chrome.runtime.sendMessage({action: 'bloggerInfoCaptured', success: false, error: error.message});
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

// 添加XPath查询函数
function getElementByXPath(xpath, context = document) {
  return document.evaluate(xpath, context, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// 提取博主信息函数 - 修改为动态提取值
async function extractBloggerInfo() {
  console.log('开始提取博主信息');
  
  // 验证是否在小红书博主主页
  if (!window.location.href.includes('xiaohongshu.com')) {
    throw new Error('请打开小红书博主主页后使用此功能');
  }

  // 检查是否在博主主页
  const isUserPage = window.location.href.includes('/user/profile/') || 
                     document.querySelector('.user-page, .profile-page, .user-profile') !== null;
  
  if (!isUserPage) {
    throw new Error('请确保在小红书博主主页上使用此功能');
  }

  // 给页面一些时间加载完成
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 博主主页链接
  const profileUrl = window.location.href;
  
  // 提取头像链接 - 根据HTML结构动态提取
  let avatarUrl = '';
  const avatarElements = [
    document.querySelector('.avatar img, .user-avatar img, .avatar-wrapper img, .user-image'),
    document.querySelector('img[data-xhs-img=""]'),
    document.querySelector('[data-v-86ee68bc=""] img')
  ];
  
  for (const element of avatarElements) {
    if (element && element.src) {
      avatarUrl = element.src.replace(/^http:/, 'https:');
      break;
    }
  }
  
  // 提取博主名称 - 根据HTML结构动态提取
  let bloggerName = '';
  const nameElements = [
    document.querySelector('.user-name, .nickname, .name, .user-nickname .user-name'),
    document.querySelector('[data-v-1d90bc98=""] .user-name'),
    document.querySelector('[data-v-6be60601=""] .user-name')
  ];
  
  for (const element of nameElements) {
    if (element) {
      bloggerName = element.textContent.trim();
      break;
    }
  }
  
  // 提取博主简介 - 根据HTML结构动态提取
  let bloggerBio = '';
  const bioElements = [
    document.querySelector('.bio, .description, .intro, .user-bio, .user-desc'),
    document.querySelector('[data-v-4947d265=""]')
  ];
  
  for (const element of bioElements) {
    if (element && element.textContent && !element.textContent.includes('摩羯座') && !element.textContent.includes('中国')) {
      bloggerBio = element.textContent.trim();
      break;
    }
  }
  
  // 提取小红书号 - 根据HTML结构动态提取
  let xhsId = '';
  const idElements = [
    document.querySelector('.id, .user-id, .account-info .id, .user-redId'),
    document.querySelector('[data-v-1d90bc98=""] .user-redId'),
    document.evaluate("//span[contains(text(), '小红书号')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
  ];
  
  for (const element of idElements) {
    if (element) {
      const text = element.textContent.trim();
      // 提取数字部分
      const idMatch = text.match(/(\d+)/);
      if (idMatch && idMatch[1]) {
        xhsId = idMatch[1];
        break;
      }
    }
  }
  
  // 提取粉丝数 - 根据HTML结构动态提取
  let followersCount = 0;
  const followersElements = [
    document.querySelector('.followers, .follower-count, .user-stats .stats-item:first-child'),
    document.evaluate("//div[contains(text(), '粉丝')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue,
    document.querySelector('.user-interactions > div:nth-child(2) .count')
  ];
  
  for (const element of followersElements) {
    if (element) {
      const text = element.textContent.trim();
      // 提取数字部分，支持万、k等单位
      const followersMatch = text.match(/([\d.]+)/);
      if (followersMatch && followersMatch[1]) {
        let count = parseFloat(followersMatch[1]);
        if (text.includes('万')) {
          count *= 10000;
        } else if (text.includes('k') || text.includes('K')) {
          count *= 1000;
        }
        followersCount = Math.floor(count);
        break;
      }
    }
  }
  
  // 构建博主信息对象 - 确保属性名与sidebar.js中使用的一致
  const bloggerInfo = {
    avatarUrl: avatarUrl,        // 头像URL
    bloggerName: bloggerName,    // 博主名称
    description: bloggerBio,     // 博主简介
    bloggerId: xhsId,            // 小红书号
    followersCount: followersCount, // 粉丝数
    bloggerUrl: profileUrl,      // 博主主页链接
    captureTimestamp: new Date().getTime() // 采集时间戳
  };
  
  console.log('博主信息提取完成:', bloggerInfo);
  return bloggerInfo;
}

async function captureLinks() {
  console.log('开始采集链接流程');
  
  // 验证是否在小红书博主主页
  if (!window.location.href.includes('xiaohongshu.com')) {
    throw new Error('请打开小红书博主主页使用此功能');
  }

  // 检查是否在博主主页
  const isUserPage = window.location.href.includes('/user/profile/') || 
                     document.querySelector('.user-page, .profile-page, .user-profile') !== null;
  
  if (!isUserPage) {
    throw new Error('请确保在小红书博主主页上使用此功能');
  }

  // 修改：移除强制刷新页面的代码，改用温和的状态重置方法
  // 1. 先滚动到顶部以重置页面状态
  window.scrollTo(0, 0);
  console.log('滚动到顶部以重置状态');
  // 给页面一些时间稳定
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 2. 小幅度滚动以触发重新加载机制
  window.scrollTo(0, 100);
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 3. 重新滚动到顶部准备开始
  window.scrollTo(0, 0);
  await new Promise(resolve => setTimeout(resolve, 1000));

  const links = []; // 只使用局部变量
  const seen = new Set();
  
  // 为进度报告设置变量
  window.currentScrollStep = 0;
  window.totalScrollStepsForUI = 50;
  window.currentLinkCount = 0;
  
  // 设置进度报告函数
  window.captureProgress = function() {
    chrome.runtime.sendMessage({
      action: 'captureProgress',
      message: `正在采集第${window.currentScrollStep}/${window.totalScrollStepsForUI}批内容...`,
      currentCount: window.currentLinkCount
    });
  };
  
  // 获取当前页面URL中的xsec参数
  const currentUrl = window.location.href;
  let xsecParams = '';
  
  // 提取URL中?后面的所有参数
  if (currentUrl.includes('?')) {
    xsecParams = currentUrl.substring(currentUrl.indexOf('?'));
  }
  
  // 获取博主名称
  let authorName = '未知作者';
  const authorNameElement = document.querySelector('.user-name, .nickname, .name, .user-info h1, .user-info .name');
  if (authorNameElement) {
    authorName = authorNameElement.textContent.trim();
  }
  console.log('博主名称:', authorName);
  
  // 改进的滚动加载策略 - 使用渐进式滚动
  let scrollPosition = 0;
  const scrollIncrement = 500; // 每次滚动的像素数
  let attemptsWithoutNewContent = 0;
  const maxAttemptsWithoutNewContent = 5;
  const totalScrollSteps = 50; // 最大滚动步数，防止无限循环
  let scrollStep = 0;
  
  console.log('开始渐进式滚动加载策略');
  
  while (scrollStep < totalScrollSteps && attemptsWithoutNewContent < maxAttemptsWithoutNewContent) {
    scrollStep++;
    window.currentScrollStep = scrollStep;
    console.log('滚动步骤:', scrollStep, '/', totalScrollSteps);
    
    // 获取当前页面上的所有作品卡片
    const cards = document.querySelectorAll('#userPostedFeeds section, .note-item, .note-card, .feed-item, .feed-card, .note, .cover-item, .notes-item, article');
    console.log('找到卡片数量:', cards.length);
    
    // 提取当前可见的卡片信息
    let hasNewContent = false;
    
    for (const card of cards) {
      // 尝试多种可能的链接选择器
      const linkElement = card.querySelector('a[href*="/user/profile/"], a[href*="/discovery/"], a[href*="/note/"], a[href*="/item/"]');
      
      if (linkElement) {
        // 获取链接地址
        let href = linkElement.getAttribute('href');

        // 删除 /user/profile/xxxx/ 部分
        if (href.includes('/user/profile/')) {
          const profileRegex = /\/user\/profile\/[^\/]+\//;
          href = href.replace(profileRegex, '/');
        }
        
        // 确保链接是完整的URL
        const baseUrl = href.startsWith('http') ? href : 'https://www.xiaohongshu.com/explore' + href;
        
        const url = baseUrl;
        
        if (!seen.has(url)) {
          // 提取图片链接 - 使用更全面的选择器
          let imageUrl = '';
          
          // 尝试多种可能的图片选择器策略
          const imgElement = (
            // 策略1: 直接查找图片元素
            card.querySelector('img[src*="xhscdn.com"], img[src*="xiaohongshu.com"], img[src*="xhsstatic.com"]') ||
            // 策略2: 查找具有特定类或属性的图片
            card.querySelector('img.cover-img, img.post-img, img.content-img, img[data-xhs-img]') ||
            // 策略3: 查找图片容器内的图片
            card.querySelector('.img-container img, .cover-img-container img, .content-img-container img') ||
            // 策略4: 查找卡片内的所有图片
            card.querySelector('img')
          );
          
          // 如果找到了图片元素
          if (imgElement) {
            // 尝试多种可能的图片源属性
            imageUrl = (
              imgElement.getAttribute('data-src') || 
              imgElement.getAttribute('src') || 
              imgElement.getAttribute('lazy-src') ||
              imgElement.getAttribute('data-origin-src') ||
              imgElement.getAttribute('data-lazy-src') ||
              ''
            ).trim();
            
            // 确保图片URL是完整的
            if (imageUrl && !imageUrl.startsWith('http')) {
              // 处理相对路径
              if (imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
              } else if (imageUrl.startsWith('/')) {
                imageUrl = 'https://www.xiaohongshu.com' + imageUrl;
              } else {
                imageUrl = 'https:' + imageUrl;
              }
            }
          }
          
          // 提取其他信息
          const titleElement = card.querySelector('.title, .content-title, .note-title, .desc, .content, .note-desc, .note-content');
          const authorElement = card.querySelector('.author span, .user-name, .nickname, .name');
          const likesElement = getElementByXPath('.//div/div/div/span/span[2]', card);
          
          const title = titleElement ? titleElement.textContent.trim() : '无标题';
          const author = authorElement ? authorElement.textContent.trim() : authorName;
          const likesText = likesElement ? likesElement.textContent.trim() : '0';
          
          // 处理点赞数
          let likes = 0; // 改为数字类型
          if (likesText) {
            try {
              const cleanText = likesText.replace(/\s+/g, '').replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, '');
              
              if (cleanText.includes('w') || cleanText.includes('W') || cleanText.includes('万')) {
                const numMatch = cleanText.match(/([\d.]+)[wW万]/);
                const num = numMatch ? parseFloat(numMatch[1]) : parseFloat(cleanText.replace(/[^\d.]/g, ''));
                if (!isNaN(num)) {
                  likes = Math.round(num * 10000); // 保持为数字
                }
              } else if (cleanText.includes('k') || cleanText.includes('K') || cleanText.includes('千')) {
                const numMatch = cleanText.match(/([\d.]+)[kK千]/);
                const num = numMatch ? parseFloat(numMatch[1]) : parseFloat(cleanText.replace(/[^\d.]/g, ''));
                if (!isNaN(num)) {
                  likes = Math.round(num * 1000); // 保持为数字
                }
              } else {
                const unitMatch = cleanText.match(/([\d.]+)[赞点击收藏]/);
                if (unitMatch && unitMatch[1]) {
                  const num = parseFloat(unitMatch[1]);
                  if (!isNaN(num)) {
                    likes = Math.round(num); // 保持为数字
                  }
                } else {
                  const numericMatch = cleanText.match(/([\d.]+)/g);
                  if (numericMatch && numericMatch.length > 0) {
                    const num = parseFloat(numericMatch[0]);
                    if (!isNaN(num)) {
                      likes = Math.round(num); // 保持为数字
                    }
                  } else {
                    const cleaned = cleanText.replace(/[^\d]/g, '');
                    const num = parseInt(cleaned);
                    likes = !isNaN(num) ? num : 0; // 保持为数字
                  }
                }
              }
            } catch (error) {
              console.error('处理点赞数时出错:', error);
              likes = 0;
            }
          }
          
          // 统一使用image键名
          links.push({ title, url, author, likes, image: imageUrl });
          seen.add(url);
          hasNewContent = true;
          window.currentLinkCount = links.length;
        }
      }
    }
    
    // 基于是否有新内容更新尝试计数
    if (hasNewContent) {
      attemptsWithoutNewContent = 0;
      console.log('发现新内容，重置尝试计数');
    } else {
      attemptsWithoutNewContent++;
      console.log('未发现新内容，尝试计数:', attemptsWithoutNewContent);
    }
    
    // 执行渐进式滚动
    scrollPosition += scrollIncrement;
    // 确保滚动位置不超过页面高度
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    scrollPosition = Math.min(scrollPosition, maxScroll);
    
    window.scrollTo(0, scrollPosition);
    console.log('滚动到位置:', scrollPosition);
    
    // 等待新内容加载
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // 确保我们获取了所有内容，再最后滚动到底部一次
  window.scrollTo(0, document.body.scrollHeight);
  console.log('最后滚动到底部以确保加载所有内容');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 再次提取所有卡片信息
  const finalCards = document.querySelectorAll('#userPostedFeeds section, .note-item, .note-card, .feed-item, .feed-card, .note, .cover-item, .notes-item, article');
  for (const card of finalCards) {
    const linkElement = card.querySelector('a[href*="/user/profile/"], a[href*="/discovery/"], a[href*="/note/"], a[href*="/item/"]');
    
    if (linkElement) {
      let href = linkElement.getAttribute('href');
      if (href.includes('/user/profile/')) {
        const profileRegex = /\/user\/profile\/[^\/]+\//;
        href = href.replace(profileRegex, '/');
      }
      
      const baseUrl = href.startsWith('http') ? href : 'https://www.xiaohongshu.com/explore' + href;
      const url = baseUrl;
      
      if (!seen.has(url)) {
        // 提取图片链接 - 使用全面的选择器
        let imageUrl = '';
        
        // 使用与前面相同的全面图片选择策略
        const imgElement = (
          card.querySelector('img[src*="xhscdn.com"], img[src*="xiaohongshu.com"], img[src*="xhsstatic.com"]') ||
          card.querySelector('img.cover-img, img.post-img, img.content-img, img[data-xhs-img]') ||
          card.querySelector('.img-container img, .cover-img-container img, .content-img-container img') ||
          card.querySelector('img')
        );
        
        if (imgElement) {
          imageUrl = (
            imgElement.getAttribute('data-src') || 
            imgElement.getAttribute('src') || 
            imgElement.getAttribute('lazy-src') ||
            imgElement.getAttribute('data-origin-src') ||
            imgElement.getAttribute('data-lazy-src') ||
            ''
          ).trim();
          
          if (imageUrl && !imageUrl.startsWith('http')) {
            if (imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            } else if (imageUrl.startsWith('/')) {
              imageUrl = 'https://www.xiaohongshu.com' + imageUrl;
            } else {
              imageUrl = 'https:' + imageUrl;
            }
          }
        }
        
        // 提取其他信息
        const titleElement = card.querySelector('.title, .content-title, .note-title, .desc, .content, .note-desc, .note-content');
        const authorElement = card.querySelector('.author span, .user-name, .nickname, .name');
        const likesElement = getElementByXPath('.//div/div/div/span/span[2]', card);
        
        const title = titleElement ? titleElement.textContent.trim() : '无标题';
        const author = authorElement ? authorElement.textContent.trim() : authorName;
        const likesText = likesElement ? likesElement.textContent.trim() : '0';
        
        // 处理点赞数（简化版）
        let likes = '0';
        try {
          const cleanText = likesText.replace(/\s+/g, '').replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, '');
          const numericMatch = cleanText.match(/([\d.]+)/);
          if (numericMatch && numericMatch[1]) {
            likes = Math.round(parseFloat(numericMatch[1])).toString();
          }
        } catch (error) {
          likes = '0';
        }
        
        links.push({ title, url, author, likes, image: imageUrl });
        seen.add(url);
        window.currentLinkCount = links.length;
      }
    }
  }
  
  // 滚动回顶部
  window.scrollTo(0, 0);
  
  // 清理全局变量
  delete window.captureProgress;
  delete window.currentScrollStep;
  delete window.totalScrollStepsForUI;
  delete window.currentLinkCount;
  
  if (links.length === 0) {
    throw new Error('未能采集到任何链接，请确保在博主主页上使用此功能，并等待页面完全加载');
  }
  
  console.log('采集完成，共获取链接数:', links.length);
  return links;
}

// 单篇笔记采集相关功能
function checkIsNotePage() {
  // 扩展URL模式检测，包含更多可能的小红书笔记页面格式
  const urlPattern = /xiaohongshu\.com\/(?:discovery|explore)\/item|xiaohongshu\.com\/note|www\.xiaohongshu\.com\/explore/;
  const isUrlMatch = urlPattern.test(window.location.href);
  
  // 增强页面元素检测，添加更多可能的选择器
  const hasNoteContainer = document.querySelector(
    '.note-container, .note-content-wrapper, .interaction-container, ' +
    '.main-content, .detail-container, .post-container'
  ) !== null;
  
  const hasInteractionElements = document.querySelector(
    '.like-wrapper, .collect-wrapper, .chat-wrapper, ' +
    '.like-btn, .collect-btn, .comment-btn, .interaction-bar'
  ) !== null;
  
  const hasMediaContent = document.querySelectorAll(
    '.image-container, .video-container, .media-content, .content-media'
  ).length > 0;
  
  // 提取页面上所有可能的内容标记
  const hasContentTags = document.querySelectorAll('.tag, .topic-tag').length > 0;
  const hasUserName = document.querySelector('.user-name, .nickname, .author-name') !== null;
  const hasTitle = document.querySelector('.title, .note-title, .post-title') !== null;
  
  // 改进判断逻辑，更加灵活
  // 如果URL明显是小红书的，并且有笔记特征元素，就认为是笔记页
  if (window.location.href.includes('xiaohongshu.com')) {
    // URL匹配或者有足够的笔记特征元素
    return isUrlMatch || 
           (hasNoteContainer && (hasInteractionElements || hasMediaContent)) ||
           (hasUserName && hasTitle && (hasMediaContent || hasContentTags));
  }
  
  return false;
}

async function extractNoteData() {
  // 验证页面
  if (!checkIsNotePage()) {
    throw new Error('请打开小红书网页并刷新页面后再采集哦');
  }
  
  console.log('开始提取笔记数据');
  
  // 提取基本信息
  const url = window.location.href;
  
  // 核心改进：首先找到笔记的主容器，然后在容器内进行所有元素查找
  // 这能有效解决采集到其他笔记数据的问题
  let noteContainer = null;
  const possibleContainers = [
    document.getElementById('noteContainer'),
    document.querySelector('.note-content'),
    document.querySelector('.interaction-container'),
    document.querySelector('.note-detail'),
    document.querySelector('.content-container'),
    document.querySelector('article')
  ];
  
  for (const container of possibleContainers) {
    if (container) {
      noteContainer = container;
      console.log('找到笔记主容器:', container.className || container.id);
      break;
    }
  }
  
  if (!noteContainer) {
    throw new Error('无法找到笔记主容器，无法提取数据');
  }
  
  // 提取作者信息 - 在笔记容器内查找，避免采集到其他笔记的作者
  let author = '';
  const authorSelectors = [
    '.username',
    '.author .name',
    '.author-wrapper .name',
    '.user-name',
    '.nickname'
  ];
  
  for (const selector of authorSelectors) {
    const authorElement = noteContainer.querySelector(selector);
    if (authorElement) {
      author = authorElement.textContent.trim();
      if (author) {
        console.log('在笔记容器内提取到作者信息:', author);
        break;
      }
    }
  }
  
  // 如果在容器内找不到，再尝试全局查找，但需要验证是否属于当前笔记
  if (!author) {
    const globalAuthorElement = document.querySelector(authorSelectors[0]);
    if (globalAuthorElement) {
      // 验证作者元素是否与当前笔记在同一父容器下
      let parent = globalAuthorElement.parentElement;
      while (parent && parent !== document.body) {
        if (possibleContainers.includes(parent)) {
          author = globalAuthorElement.textContent.trim();
          console.log('全局查找到并验证的作者信息:', author);
          break;
        }
        parent = parent.parentElement;
      }
    }
  }
  
  // 提取标题 - 使用精确路径
  let title = '';
  const interactionContainer = document.querySelector('.interaction-container');
  if (interactionContainer) {
    const noteScroller = interactionContainer.querySelector('.note-scroller');
    if (noteScroller) {
      const noteContent = noteScroller.querySelector('.note-content');
      if (noteContent) {
        const titleElement = noteContent.querySelector('.title');
        if (titleElement) {
          title = titleElement.textContent.trim();
          console.log('从精确路径提取的标题:', title);
        }
      }
    }
  }
  
  // 如果精确路径没找到，再尝试备选方案
  if (!title) {
    const titleElement = noteContainer.querySelector('.title, .note-title, h1');
    if (titleElement) {
      title = titleElement.textContent.trim();
      console.log('从容器内备选选择器提取的标题:', title);
    }
  }
  
  // 提取正文内容
  let content = '';
  const textSelectors = [
    '.note-text',
    '#detail-desc .desc',
    '.content',
    '.note-content-item'
  ];
  
  let textElement = null;
  for (const selector of textSelectors) {
    textElement = noteContainer.querySelector(selector);
    if (textElement) {
      break;
    }
  }
  
  if (textElement) {
    // 获取所有文本节点，排除标签内的文本
    const textNodes = [];
    function collectTextNodes(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node.textContent.trim());
      } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('tag')) {
        Array.from(node.childNodes).forEach(collectTextNodes);
      }
    }
    collectTextNodes(textElement);
    content = textNodes.join('').trim();
    console.log('提取的正文内容长度:', content.length);
  }
  
  // 提取标签 - 确保只提取当前笔记的标签
  let tags = [];
  const tagElements = textElement ? textElement.querySelectorAll('.tag') : noteContainer.querySelectorAll('.tag');
  if (tagElements.length > 0) {
    tags = Array.from(tagElements)
      .map(tag => tag.textContent.trim())
      .filter(tag => tag && tag !== '#');
    console.log('提取到的标签:', tags);
  }
  
  // 提取互动数据 - 优先从特定的.left容器提取
  let likes = 0;
  let collects = 0;
  let comments = 0;
  
  // 首先尝试查找包含互动数据的.left容器
  const leftContainers = document.querySelectorAll('.left');
  let interactionLeft = null;
  
  for (const left of leftContainers) {
    const hasLike = left.querySelector('.like-wrapper');
    const hasCollect = left.querySelector('.collect-wrapper');
    const hasChat = left.querySelector('.chat-wrapper');
    
    if (hasLike && hasCollect && hasChat) {
      interactionLeft = left;
      console.log('找到包含互动数据的.left元素');
      break;
    }
  }
  
  if (interactionLeft) {
    // 提取点赞数 - 保留原始文本格式
    const likeElement = interactionLeft.querySelector('.like-wrapper .count');
    if (likeElement) {
      const likeText = likeElement.textContent.trim();
      likes = convertInteractionCount(likeText);
      console.log('点赞数:', likes, '(原始文本:', likeText, ')');
    }
    
    // 提取收藏数
    const collectElement = interactionLeft.querySelector('.collect-wrapper .count');
    if (collectElement) {
      const collectText = collectElement.textContent.trim();
      collects = convertInteractionCount(collectText);
      console.log('收藏数:', collects, '(原始文本:', collectText, ')');
    }
    
    // 提取评论数
    const chatElement = interactionLeft.querySelector('.chat-wrapper .count');
    if (chatElement) {
      const chatText = chatElement.textContent.trim();
      comments = convertInteractionCount(chatText);
      console.log('评论数:', comments, '(原始文本:', chatText, ')');
    }
  } else {
    // 如果找不到特定的.left容器，尝试全局查找但添加更严格的过滤
    const likeElement = document.querySelector('.like-wrapper .count');
    if (likeElement) {
      const likeText = likeElement.textContent.trim();
      likes = convertInteractionCount(likeText);
    }
    
    const collectElement = document.querySelector('.collect-wrapper .count');
    if (collectElement) {
      const collectText = collectElement.textContent.trim();
      collects = convertInteractionCount(collectText);
    }
    
    const chatElement = document.querySelector('.chat-wrapper .count');
    if (chatElement) {
      const chatText = chatElement.textContent.trim();
      comments = convertInteractionCount(chatText);
    }
  }
  
  // 提取发布日期 - 增强选择器匹配，支持更多日期元素结构
  let publishDate = '';
  
  // 更广泛的搜索策略，支持多种日期元素结构
  const dateSelectors = [
    '.date', '.publish-time', '.post-time', '.time',
    'span.date', 'div.date', '[class*="date"]',
    '[data-v-610be4fa].date', // 针对特定Vue结构
    '.bottom-container .date', // 原有结构
    '.note-content .date' // 笔记内容内的日期
  ];
  
  for (const selector of dateSelectors) {
    const dateElement = document.querySelector(selector);
    if (dateElement && dateElement.textContent.trim()) {
      publishDate = dateElement.textContent.trim();
      console.log('找到发布日期元素:', selector, '内容:', publishDate);
      break;
    }
  }
  
  // 备用方案：如果上述方法没找到，使用传统方法
  if (!publishDate) {
    const noteContentElement = document.querySelector('.note-content');
    if (noteContentElement) {
      const bottomContainer = noteContentElement.querySelector('.bottom-container');
      if (bottomContainer) {
        const dateElement = bottomContainer.querySelector('.date');
        if (dateElement) {
          publishDate = dateElement.textContent.trim();
        }
      }
    }
  }
  
  if (!publishDate) {
    const dateElement = noteContainer.querySelector('.publish-time, .time, .date, .post-time');
    if (dateElement) {
      publishDate = dateElement.textContent.trim();
    }
  }
  
  // 提取图片URL - 关键改进：过滤头像图片和非内容图片
  let imageUrls = [];
  
  // 1. 首先检查是否是视频笔记，如果是，提取封面图片
  const videoPlayer = document.querySelector('.player-container, .video-container');
  if (videoPlayer) {
    console.log('检测到视频笔记，提取封面图片');
    const poster = document.querySelector('xg-poster');
    if (poster) {
      const style = poster.getAttribute('style');
      if (style) {
        const match = style.match(/url\("([^"]+)"\)/);
        if (match && match[1]) {
          const posterUrl = match[1].replace(/^http:/, 'https:');
          imageUrls.push(posterUrl);
          console.log('提取到视频封面图片:', posterUrl);
        }
      }
    }
  } else {
    // 2. 如果不是视频笔记，查找轮播图片元素（这是小红书常见的图片展示方式）
    const slideElements = document.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)');
    if (slideElements.length > 0) {
      console.log('找到轮播图片元素数量:', slideElements.length);
      
      // 存储图片信息的数组，包含URL和索引
      const imageInfoArray = [];
      
      // 遍历所有轮播图片元素，提取图片URL和索引
      slideElements.forEach((slide) => {
        const img = slide.querySelector('img');
        if (img && img.src) {
          // 过滤头像图片
          if (img.src.includes('avatar') || img.src.includes('head') || img.src.includes('profile')) {
            console.log('过滤掉头像图片:', img.src);
            return;
          }
          
          // 过滤占位图和过小的图片
          if (img.src.includes('placeholder') || img.src.includes('blank') || img.src.includes('spacer')) {
            console.log('过滤掉占位图:', img.src);
            return;
          }
          
          const imgUrl = img.src.replace(/^http:/, 'https:');
          console.log('提取到轮播图片:', imgUrl);
          imageInfoArray.push(imgUrl);
        }
      });
      
      imageUrls = imageInfoArray;
    } else {
      // 3. 尝试其他选择器提取图片，但排除头像和非内容图片
      const contentImages = noteContainer.querySelectorAll('img');
      const seenImageUrls = new Set();
      
      contentImages.forEach((img) => {
        // 过滤头像图片
        if (img.src.includes('avatar') || img.src.includes('head') || img.src.includes('profile')) {
          return;
        }
        
        // 过滤占位图
        if (img.src.includes('placeholder') || img.src.includes('blank') || img.src.includes('spacer')) {
          return;
        }
        
        let imgUrl = img.getAttribute('data-src') || img.getAttribute('src') || '';
        if (imgUrl) {
          // 确保图片URL是完整的HTTPS链接
          if (!imgUrl.startsWith('http')) {
            if (imgUrl.startsWith('//')) {
              imgUrl = 'https:' + imgUrl;
            } else if (imgUrl.startsWith('/')) {
              imgUrl = 'https://www.xiaohongshu.com' + imgUrl;
            } else {
              imgUrl = 'https:' + imgUrl;
            }
          }
          
          // 去重
          if (imgUrl && !seenImageUrls.has(imgUrl)) {
            seenImageUrls.add(imgUrl);
            imageUrls.push(imgUrl);
          }
        }
      });
    }
  }
  
  console.log('提取到的图片URL数量:', imageUrls.length);
  
  // 提取视频URL - 使用原有的extractVideoUrls函数
  let videoUrl = '';
  try {
    // 设置视频提取的超时处理
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('视频URL提取超时')), 5000);
    });
    
    // 使用Promise.race实现超时控制
    videoUrl = await Promise.race([extractVideoUrls(), timeoutPromise]);
  } catch (error) {
    console.error('提取视频URL失败:', error);
  }
  
  // 构建返回数据
  // 添加数据处理逻辑
  
  // 1. 标记笔记类型：检测是否为真正的视频内容
  let noteType = "图文";
  
  // 检查是否存在真正的视频播放器（排除live图）
  const hasRealVideoPlayer = document.querySelector('.xgplayer, .video-player, [data-spm="video"]') !== null;
  
  // 检查是否存在live图容器
  const hasLivePhoto = document.querySelector('.live-photo-contain') !== null;
  
  // 检查video元素是否有mediatype="video"属性（真正视频的特征）
  const hasVideoMediaType = document.querySelector('video[mediatype="video"]') !== null;
  
  console.log('视频类型判断调试信息:');
  console.log('- videoUrl存在:', !!videoUrl);
  console.log('- 真正视频播放器存在:', hasRealVideoPlayer);
  console.log('- live图容器存在:', hasLivePhoto);
  console.log('- video元素有mediatype属性:', hasVideoMediaType);
  
  // 只有满足以下条件才判断为视频：
  // 1. 提取到了视频URL 且 
  // 2. 存在真正视频播放器 或 video元素有mediatype="video"属性 且
  // 3. 不是live图
  if (videoUrl && (hasRealVideoPlayer || hasVideoMediaType) && !hasLivePhoto) {
    noteType = "视频";
  }
  
  console.log('- 最终判断类型:', noteType);
  
  // 2. 处理话题标签：以#为标记，保存为数组并去掉#符号
  let processedTags = [];
  if (tags && tags.length > 0) {
    processedTags = tags.map(tag => {
      // 去掉标签前的#符号
      if (tag.startsWith('#')) {
        return tag.substring(1).trim();
      }
      return tag.trim();
    }).filter(tag => tag); // 过滤空标签
  }
  
  // 3. 格式化图片链接：图1=(链接1)
  let formattedImageUrls = '';
  if (imageUrls.length > 0) {
    formattedImageUrls = imageUrls.map((url, index) => `图${index + 1}=(${url})`).join('\n');
  }
  
  // 4. 记录采集时间并转为时间戳格式
  const captureTimestamp = new Date().getTime(); // 中国日期的时间戳格式
  
  // 5. 提取封面链接（第一张图片）
  const coverImageUrl = imageUrls.length > 0 ? imageUrls[0] : '';
  
  // 修复处理发布时间的函数定义 - 增强地域文字清理和格式支持
function processPublishDate(rawDate) {
  if (!rawDate) return '';
  
  console.log('原始发布日期文本:', rawDate);
  
  // 预处理日期文本
  let processedDate = rawDate;
  
  // 1. 移除"编辑于"前缀
  processedDate = processedDate.replace(/编辑于\s*/, '');
  
  // 2. 移除地区信息（匹配"省份/城市"格式，如"河北"、"北京"等）
  // 移除末尾的地区信息（中文或英文国家/地区名称）
  processedDate = processedDate.replace(/\s+(?:[\u4e00-\u9fa5]{1,4}|[A-Za-z]{2,20})$/g, '');
  
  // 2. 按优先级提取核心日期格式
  let extractedDate = '';
  
  // 第1优先级：昨天 + 时间（如"昨天 23:31"）
  const yesterdayTimeMatch = processedDate.match(/昨天\s+(\d{1,2}:\d{2})/);
  if (yesterdayTimeMatch) {
    extractedDate = `昨天 ${yesterdayTimeMatch[1]}`;
  }
  
  // 第2优先级：YYYY-MM-DD格式（提高优先级，避免被MM-DD格式错误匹配）
  else if (processedDate.match(/\d{4}-\d{1,2}-\d{1,2}/)) {
    const ymdMatch = processedDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    extractedDate = `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
  }
  
  // 第3优先级：MM-DD格式（降低优先级，避免误匹配YYYY-MM-DD的后四位）
  else if (processedDate.match(/\d{1,2}-\d{1,2}/)) {
    const mdMatch = processedDate.match(/(\d{1,2})-(\d{1,2})/);
    extractedDate = `${mdMatch[1]}-${mdMatch[2]}`;
  }
  
  // 第4优先级：X小时前
  else if (processedDate.match(/(\d+)小时前/)) {
    const hoursMatch = processedDate.match(/(\d+)小时前/);
    extractedDate = `${hoursMatch[1]}小时前`;
  }
  
  // 第5优先级：X天前
  else if (processedDate.match(/(\d+)天前/)) {
    const daysMatch = processedDate.match(/(\d+)天前/);
    extractedDate = `${daysMatch[1]}天前`;
  }
  
  // 如果没有匹配到任何格式，使用原始文本（去除多余空格）
  // 注意：现在这个变量已经被dateToProcess替代，这里保留日志输出用于调试
  console.log('提取后的日期文本:', extractedDate || processedDate.replace(/\s{2,}/g, ' ').trim());
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // 添加关键调试信息
  console.log('=== 系统时间检测 ===');
  console.log('当前Date对象:', now);
  console.log('当前时间戳:', now.getTime());
  console.log('分解日期:', {year, month, day, hours, minutes});
  console.log('=== 系统时间检测结束 ===');
  
  // 基于提取的核心格式进行转换
  let result = '';
  
  // 如果extractedDate存在，使用它进行处理
  const dateToProcess = extractedDate || processedDate.replace(/\s{2,}/g, ' ').trim();
  console.log('最终处理的日期文本:', dateToProcess);
  
  // 处理昨天 + 时间格式 - 修复跨月/跨年问题
  if (dateToProcess.includes('昨天')) {
    const timeMatch = dateToProcess.match(/(\d{1,2}:\d{2})/);
    if (timeMatch) {
      const [h, m] = timeMatch[1].split(':').map(Number);
      // 使用Date构造函数自动处理跨月/跨年情况
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(h, m, 0, 0);
      result = formatDate(yesterday, 'YYYY/MM/DD HH:mm');
      console.log('昨天格式转换结果:', result);
      return result;
    }
  }
  
  // 处理X小时前格式
  else if (dateToProcess.includes('小时前')) {
    const hoursMatch = dateToProcess.match(/(\d+)小时前/);
    if (hoursMatch) {
      const hoursAgo = parseInt(hoursMatch[1]);
      // 使用setHours自动处理跨天/跨月/跨年情况
      const targetDate = new Date();
      targetDate.setHours(targetDate.getHours() - hoursAgo);
      result = formatDate(targetDate, 'YYYY/MM/DD HH:mm');
      console.log('小时前格式转换结果:', result);
      return result;
    }
  }
  
  // 处理X天前格式 - 修复跨月/跨年问题
  else if (dateToProcess.includes('天前')) {
    const daysMatch = dateToProcess.match(/(\d+)天前/);
    if (daysMatch) {
      const daysAgo = parseInt(daysMatch[1]);
      // 使用setDate自动处理跨月/跨年情况
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - daysAgo);
      targetDate.setHours(20, 0, 0, 0); // 设置为当天晚上8点
      result = formatDate(targetDate, 'YYYY/MM/DD HH:mm');
      console.log('天前格式转换结果:', result);
      return result;
    }
  }
  
  // 处理MM-DD格式 - 修复日期解析错误
  else if (dateToProcess.includes('-') && dateToProcess.match(/^\d{1,2}-\d{1,2}$/)) {
    // 使用正则提取以确保获取正确的月日
    const mdMatch = dateToProcess.match(/^(\d{1,2})-(\d{1,2})$/);
    if (mdMatch && mdMatch.length >= 3) {
      const m = parseInt(mdMatch[1]) - 1; // 月份从0开始
      const d = parseInt(mdMatch[2]);
      
      // 验证日期的有效性
      const targetDate = new Date(year, m, d, 20, 0);
      // 检查日期是否有效
      if (targetDate.getMonth() === m && targetDate.getDate() === d) {
        result = formatDate(targetDate, 'YYYY/MM/DD HH:mm');
        console.log('月-日格式转换结果:', result);
        return result;
      } else {
        console.error('无效的月-日:', m + 1, d);
      }
    }
  }
  
  // 处理YYYY-MM-DD格式 - 修复日期解析错误
  else if (dateToProcess.match(/\d{4}-\d{1,2}-\d{1,2}/)) {
    // 使用正则提取以确保获取正确的年月日
    const ymdMatch = dateToProcess.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch && ymdMatch.length >= 4) {
      const y = parseInt(ymdMatch[1]);
      const m = parseInt(ymdMatch[2]) - 1; // 月份从0开始
      const d = parseInt(ymdMatch[3]);
      
      // 验证日期的有效性
      const targetDate = new Date(y, m, d, 20, 0);
      // 检查日期是否有效（避免无效日期如2月30日等）
      if (targetDate.getFullYear() === y && targetDate.getMonth() === m && targetDate.getDate() === d) {
        result = formatDate(targetDate, 'YYYY/MM/DD HH:mm');
        console.log('年月日格式转换结果:', result);
        return result;
      } else {
        console.error('无效的日期:', y, m + 1, d);
      }
    }
  }
  
  // 如果都不匹配，返回处理后的文本
  if (processedDate && processedDate.length > 0) {
    console.log('未匹配到标准格式，返回处理后的文本:', processedDate);
    return processedDate;
  }
  
  console.log('发布日期处理失败，返回空字符串');
  return '';
  }
  
  // 日期格式化辅助函数 - 修复日期计算错误
  function formatDate(date, format) {
    console.log('=== formatDate调试 ===');
    console.log('输入Date对象:', date);
    console.log('输入格式:', format);
    
    // 验证date参数是否有效
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error('无效的Date对象:', date);
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    console.log('提取的组件:', {year, month, day, hours, minutes});
    
    const result = format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes);
    
    console.log('格式化结果:', result);
    console.log('=== formatDate结束 ===');
    
    return result;
  }
  
  // 在extractNoteData函数中修改发布时间的处理
  // 构建返回数据前添加
  // 处理发布时间
  const processedPublishDate = processPublishDate(publishDate);
  
  // 验证发布时间的格式是否正确
  if (processedPublishDate && !processedPublishDate.match(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/)) {
    console.warn('发布时间格式异常:', processedPublishDate, '原始文本:', publishDate);
  }
  
  const noteData = {
    url,
    title,
    author,
    content,
    tags: processedTags.join(','), // 保存处理后的标签字符串
    likes,
    collects,
    comments,
    publishDate: processedPublishDate, // 使用处理后的发布时间
    imageUrls: imageUrls.join(','),
    formattedImageUrls: formattedImageUrls, // 添加格式化后的图片链接
    noteType: noteType, // 添加笔记类型
    coverImageUrl: coverImageUrl, // 添加封面链接
    captureTimestamp: captureTimestamp, // 添加采集时间戳
    captureRemark: ''
  };

  // 只有当视频链接不为空且确实是视频笔记时，才添加videoUrl字段
  if (videoUrl && videoUrl.trim() !== '' && noteType === '视频') {
    noteData.videoUrl = videoUrl;
  }
  
  console.log('笔记数据提取完成:', noteData);
  return noteData;
}

function convertInteractionCount(text) {
  if (!text || text === 'undefined' || text === 'null') return 0;
  
  const cleanText = text.replace(/\s+/g, '').replace(/[  -   　]/g, '');
  
  if (cleanText.includes('w') || cleanText.includes('W') || cleanText.includes('万')) {
    const numMatch = cleanText.match(/([\d.]+)[wW万]/);
    const num = numMatch ? parseFloat(numMatch[1]) : parseFloat(cleanText.replace(/[^\d.]/g, ''));
    if (!isNaN(num)) {
      return Math.round(num * 10000);
    }
  } else if (cleanText.includes('k') || cleanText.includes('K') || cleanText.includes('千')) {
    const numMatch = cleanText.match(/([\d.]+)[kK千]/);
    const num = numMatch ? parseFloat(numMatch[1]) : parseFloat(cleanText.replace(/[^\d.]/g, ''));
    if (!isNaN(num)) {
      return Math.round(num * 1000);
    }
  } else {
    const unitMatch = cleanText.match(/([\d.]+)[赞点击收藏]/);
    if (unitMatch && unitMatch[1]) {
      const num = parseFloat(unitMatch[1]);
      if (!isNaN(num)) {
        return Math.round(num);
      }
    } else {
      const numericMatch = cleanText.match(/([\d.]+)/g);
      if (numericMatch && numericMatch.length > 0) {
        const num = parseFloat(numericMatch[0]);
        if (!isNaN(num)) {
          return Math.round(num);
        }
      } else {
        const cleaned = cleanText.replace(/[^\d]/g, '');
        const num = parseInt(cleaned);
        return !isNaN(num) ? num : 0;
      }
    }
  }
  
  return 0;
}

async function extractVideoUrls() {
  return new Promise((resolve, reject) => {
    // 设置超时时间
    const timeout = setTimeout(() => {
      reject(new Error('提取视频URL超时'));
    }, 5000);
    
    try {
      // 首先检查是否为live图，如果是则跳过视频提取
      const hasLivePhoto = document.querySelector('.live-photo-contain') !== null;
      if (hasLivePhoto) {
        console.log('检测到live图，跳过视频URL提取');
        clearTimeout(timeout);
        resolve('');
        return;
      }
      
      // 检查是否存在真正的视频内容（排除图文笔记中可能残留的视频元素）
      const hasRealVideoPlayer = document.querySelector('.xgplayer, .video-player, [data-spm="video"]') !== null;
      const hasVideoMediaType = document.querySelector('video[mediatype="video"]') !== null;
      
      if (!hasRealVideoPlayer && !hasVideoMediaType) {
        console.log('未检测到真正的视频播放器，跳过视频URL提取');
        clearTimeout(timeout);
        resolve('');
        return;
      }
      
      // 尝试直接查找视频元素，但排除live-video
      const videoElements = document.querySelectorAll('video:not(.live-video)');
      for (const video of videoElements) {
        const src = video.getAttribute('src');
        const currentSrc = video.currentSrc;
        
        if (src && isValidVideoUrl(src)) {
          clearTimeout(timeout);
          resolve(src);
          return;
        }
        if (currentSrc && isValidVideoUrl(currentSrc)) {
          clearTimeout(timeout);
          resolve(currentSrc);
          return;
        }
      }
      
      // 尝试查找视频容器中的source元素
      const sourceElements = document.querySelectorAll('.video-container source, .video-player source');
      for (const source of sourceElements) {
        const src = source.getAttribute('src');
        if (src && isValidVideoUrl(src)) {
          clearTimeout(timeout);
          resolve(src);
          return;
        }
      }
      
      // 尝试通过XPath查找
      const xpathResult = document.evaluate('.//*[contains(@class, "video") or contains(@src, ".mp4")]', document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
      let node;
      while ((node = xpathResult.iterateNext()) !== null) {
        const src = node.getAttribute ? (node.getAttribute('src') || node.getAttribute('data-src') || '') : '';
        if (src && isValidVideoUrl(src)) {
          clearTimeout(timeout);
          resolve(src);
          return;
        }
      }
      
      // 最后尝试通过网络请求获取
      try {
        const performanceEntries = performance.getEntriesByType('resource');
        const videoEntries = performanceEntries.filter(entry => {
          const url = entry.name;
          return url.includes('.mp4') || url.includes('.m3u8') || 
                 entry.initiatorType === 'video' || entry.initiatorType === 'media';
        }).sort((a, b) => b.startTime - a.startTime); // 最新的资源优先
        
        if (videoEntries.length > 0) {
          clearTimeout(timeout);
          resolve(videoEntries[0].name);
          return;
        }
      } catch (e) {
        console.error('通过performance提取视频URL失败:', e);
      }
      
      // 如果所有方法都失败
      clearTimeout(timeout);
      resolve('');
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}

function isValidVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // 过滤掉blob:和data:协议的URL（主要用于live图）
  if (url.includes('blob:') || url.includes('data:')) {
    console.log('过滤掉blob/data URL:', url);
    return false;
  }
  
  // 检查是否包含常见视频格式
  const videoExtensions = ['.mp4', '.m3u8', '.webm', '.mov', '.avi'];
  const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
  
  // 检查是否包含小红书视频域名特征
  const hasXhsVideoDomain = url.includes('xhscdn.com') || url.includes('xiaohongshu.com') || url.includes('xhsstatic.com');
  
  const isValid = hasVideoExtension || hasXhsVideoDomain || url.includes('.mp4') || url.includes('.m3u8');
  
  if (isValid) {
    console.log('找到有效视频URL:', url);
  }
  
  return isValid;
}