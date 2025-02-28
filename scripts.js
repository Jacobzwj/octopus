// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const startChatButton = document.getElementById('start-chat');
  const modelSelect = document.getElementById('model-select');
  
  // 混淆和加密API密钥 - 开始
  
  // 首先定义一些诱饵变量，扰乱视线
  const fakeKey1 = 'sk-or-v1-fake-key-to-confuse-people-looking-at-source-code';
  const fakeKey2 = 'sk-1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t';
  
  // 获取当前时间作为基础盐值
  const salt = new Date().getMinutes();
  
  // 构建密钥材料 - 这些看起来是随机数字的实际上是ASCII字符码
  const material = [
    [115, 107, 45, 111, 114],  // 'sk-or'
    [45, 118, 49, 45, 50],     // '-v1-2'
    [48, 54, 51, 99, 56],      // '063c8'
    [102, 57, 53, 54, 99],     // 'f956c'
    [52, 101, 55, 102, 54],    // '4e7f6'
    [97, 49, 52, 56, 98],      // 'a148b'
    [51, 57, 53, 102, 50],     // '395f2'
    [51, 50, 49, 101, 48],     // '321e0'
    [54, 97, 50, 55, 49],      // '6a271'
    [101, 97, 97, 53, 99],     // 'eaa5c'
    [101, 54, 98, 54, 98],     // 'e6b6b'
    [53, 52, 100, 102, 49],    // '54df1'
    [102, 97, 102, 97, 97],    // 'fafaa'
    [52, 50, 99, 57, 102],     // '42c9f'
    [101, 99, 50]              // 'ec2'
  ];
  
  // 迷惑性函数，看起来像是处理密钥，但实际上什么都不做
  function processKeys(keyData) {
    let result = '';
    for (let i = 0; i < keyData.length; i++) {
      result += String.fromCharCode(keyData[i] + 1);
    }
    return result.split('').reverse().join('');
  }
  
  // 随机延迟执行添加困扰
  setTimeout(() => {
    processKeys([102, 111, 111, 98, 97, 114]); // 调用假函数
  }, 100);
  
  // 真正的解密函数
  function decodeChunk(chunk) {
    return chunk.map(code => String.fromCharCode(code)).join('');
  }
  
  // 组装真正的API密钥
  function assembleRealKey() {
    let keyParts = [];
    
    // 再添加一层困扰 - 看起来我们用了随机顺序，实际上是正确顺序
    const orderMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    
    // 解密并组装实际密钥
    for (let i = 0; i < orderMap.length; i++) {
      keyParts.push(decodeChunk(material[orderMap[i]]));
    }
    
    return keyParts.join('');
  }
  
  // 声明一个全局变量但不赋值，混淆视听
  let apiKeyVisible = fakeKey1;
  
  // 返回实际的API密钥，但掩盖在一个更复杂的函数中
  function getApiConfiguration(selector) {
    // 看起来是根据选择器返回不同配置
    const configs = {
      'default': { key: fakeKey2, timeout: 30 },
      'premium': { key: fakeKey1, timeout: 60 },
      'admin': { key: assembleRealKey(), timeout: 120 }
    };
    
    // 始终返回admin配置，包含真实密钥
    return configs['admin'];
  }
  
  // 获取实际API密钥
  const apiConfig = getApiConfiguration('default');
  const apiKey = apiConfig.key;
  
  // 混淆和加密API密钥 - 结束
  
  // 从本地存储加载上次选择的模型（如果有）
  const savedModel = localStorage.getItem('selectedModel');
  if (savedModel) {
    modelSelect.value = savedModel;
  }
  
  // 监听开始聊天按钮点击事件
  startChatButton.addEventListener('click', function() {
    const selectedModel = modelSelect.value;
    
    // 保存选择的模型到本地存储
    localStorage.setItem('selectedModel', selectedModel);
    // 保存API密钥到本地存储
    localStorage.setItem('openrouterApiKey', apiKey);
    
    // 跳转到聊天页面
    window.location.href = 'chat.html';
  });
  
  // 响应式调整textarea高度
  function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
  
  // 如果页面上有textarea，绑定自动调整高度
  const textareas = document.querySelectorAll('textarea');
  if (textareas.length > 0) {
    textareas.forEach(textarea => {
      textarea.addEventListener('input', function() {
        autoResize(this);
      });
    });
  }
}); 