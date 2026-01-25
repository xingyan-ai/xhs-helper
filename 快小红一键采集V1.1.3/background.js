// 当插件图标被点击时，打开侧边栏
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({tabId: tab.id});
});

// 监听来自popup或侧边栏的消息（可选，根据需要添加）
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 可以在这里添加共享的后台功能
  return true;
});