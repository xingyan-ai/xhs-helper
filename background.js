// 红薯助手 - 后台服务脚本
// 负责：打开侧边栏、消息转发

// 监听插件图标点击事件，打开侧边栏
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// 监听来自侧边栏和content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  // 可以在这里添加需要后台处理的逻辑
  // 例如：跨域请求、数据存储等
  
  return true; // 保持消息通道开放
});

// 插件安装或更新时执行
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('红薯助手已安装');
    // 可以打开欢迎页面
  } else if (details.reason === 'update') {
    console.log('红薯助手已更新到版本:', chrome.runtime.getManifest().version);
  }
});

