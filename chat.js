// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const messageContainer = document.getElementById('message-container');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const backButton = document.getElementById('back-button');
  const modelDisplay = document.getElementById('model-display');
  
  // 从本地存储获取API密钥和选择的模型
  const apiKey = localStorage.getItem('openrouterApiKey');
  const selectedModel = localStorage.getItem('selectedModel') || 'google/gemini-2.0-flash-001';
  
  // 显示当前选择的模型
  try {
    const modelParts = selectedModel.split('/').pop().split('-');
    modelDisplay.textContent = `当前模型: ${modelParts[0]} ${modelParts[1] || ''}`;
  } catch (e) {
    modelDisplay.textContent = `当前模型: ${selectedModel}`;
  }
  
  // 消息历史
  let messages = [];
  
  // 标记是否正在等待AI响应
  let isWaitingForResponse = false;
  
  // 当前消息元素引用 - 用于流式更新
  let currentMessageElement = null;
  let currentThinkingElement = null;
  let currentAnswerElement = null;
  
  // 检查API密钥是否存在
  if (!apiKey) {
    showError('未找到API密钥，请返回首页设置');
    disableChat();
  } else {
    // 添加初始的AI消息
    if (isDeepseekR1Model(selectedModel)) {
      addMessage('assistant', '你好！我是记忆力超群的大章鱼，有什么可以帮到你的吗？\n\n使用Deepseek R1模型时，你将能看到我的思考过程，这可以帮助你理解我如何分析问题并得出结论。');
    } else {
      addMessage('assistant', '你好！我是记忆力超群的大章鱼，有什么可以帮到你的吗？');
    }
  }
  
  // 监听返回按钮点击事件
  backButton.addEventListener('click', function() {
    window.location.href = 'index.html';
  });
  
  // 监听发送按钮点击事件
  sendButton.addEventListener('click', sendMessage);
  
  // 监听输入框回车事件
  messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 阻止默认的换行行为
      sendMessage();
    }
  });
  
  // 自动调整textarea高度
  messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });
  
  // 发送消息函数
  function sendMessage() {
    if (isWaitingForResponse) return;
    
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;
    
    // 清空输入框
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // 添加用户消息
    addMessage('user', userMessage);
    
    // 添加用户消息到历史记录
    messages.push({ role: 'user', content: userMessage });
    
    // 显示加载状态
    showLoading();
    isWaitingForResponse = true;
    
    // 调用API获取AI响应
    callOpenRouterAPI();
  }
  
  // 格式化消息内容，支持代码块和特殊格式
  function formatMessageContent(content) {
    if (!content) return '';
    
    // 首先转义HTML特殊字符
    let formatted = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    // 处理代码块 (```code```)
    formatted = formatted.replace(/```([\s\S]*?)```/g, function(match, codeContent) {
      // 检查是否有语言标识
      const firstLineEnd = codeContent.indexOf('\n');
      let language = '';
      let code = codeContent;
      
      if (firstLineEnd > 0) {
        const possibleLang = codeContent.substring(0, firstLineEnd).trim();
        // 如果第一行是语言标识
        if (/^[a-zA-Z0-9_+-]+$/.test(possibleLang)) {
          language = possibleLang;
          code = codeContent.substring(firstLineEnd + 1);
        }
      }
      
      return `<pre class="code-block${language ? ' language-' + language : ''}"><code>${code}</code></pre>`;
    });
    
    // 处理行内代码 (`code`)
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    // 处理块级数学公式 ($$...$$) - 优先处理块级公式，避免与行内公式混淆
    formatted = formatted.replace(/\$\$([\s\S]*?)\$\$/g, function(match, formula) {
      try {
        // 清理公式中的<br>标签（如果有）
        const cleanFormula = formula.replace(/<br\s*\/?>/gi, '\n');
        return `<div class="math-block">${katex.renderToString(cleanFormula, {
          throwOnError: false,
          displayMode: true, // 显示模式，使公式居中且更大
          macros: {
            // 常用宏定义
            "\\N": "\\mathbb{N}",
            "\\Z": "\\mathbb{Z}",
            "\\Q": "\\mathbb{Q}",
            "\\R": "\\mathbb{R}",
            "\\C": "\\mathbb{C}"
          }
        })}</div>`;
      } catch (e) {
        console.error('KaTeX渲染块级公式错误:', e);
        return `<div class="math-block-error">$$${formula}$$</div>`;
      }
    });
    
    // 处理行内数学公式 ($...$)
    formatted = formatted.replace(/\$([^\$\n]+?)\$/g, function(match, formula) {
      try {
        return `<span class="math-inline">${katex.renderToString(formula, {
          throwOnError: false,
          displayMode: false, // 行内模式
          macros: {
            // 常用宏定义
            "\\N": "\\mathbb{N}",
            "\\Z": "\\mathbb{Z}",
            "\\Q": "\\mathbb{Q}",
            "\\R": "\\mathbb{R}",
            "\\C": "\\mathbb{C}"
          }
        })}</span>`;
      } catch (e) {
        console.error('KaTeX渲染行内公式错误:', e);
        return `<span class="math-inline-error">$${formula}$</span>`;
      }
    });
    
    // 将换行符转换为<br>标签
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }
  
  // 添加消息到聊天界面
  function addMessage(role, content, thinking = null) {
    // 确保content是字符串
    if (typeof content !== 'string') {
      if (content === null || content === undefined) {
        content = ''; // 如果是null或undefined，设为空字符串
      } else {
        content = String(content); // 尝试转换为字符串
      }
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role === 'user' ? 'user-message' : 'assistant-message'}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = `avatar ${role === 'user' ? 'user-avatar' : 'assistant-avatar'}`;
    
    // 用户头像显示"你"，助手头像显示章鱼图片
    if (role === 'user') {
      avatarDiv.innerHTML = `<span>你</span>`;
    } else {
      avatarDiv.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/1864/1864589.png" alt="章鱼" class="avatar-img">`;
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // 如果存在思考过程，先显示思考过程
    if (thinking && role === 'assistant') {
      const thinkingSection = document.createElement('div');
      thinkingSection.className = 'thinking-section';
      
      const thinkingTitle = document.createElement('div');
      thinkingTitle.className = 'thinking-title';
      thinkingTitle.textContent = '思考过程:';
      
      const thinkingContent = document.createElement('div');
      thinkingContent.className = 'thinking-content';
      thinkingContent.innerHTML = formatMessageContent(thinking);
      
      thinkingSection.appendChild(thinkingTitle);
      thinkingSection.appendChild(thinkingContent);
      
      // 答案部分
      const answerSection = document.createElement('div');
      answerSection.className = 'answer-section';
      
      const answerTitle = document.createElement('div');
      answerTitle.className = 'answer-title';
      answerTitle.textContent = '回答:';
      
      const answerContent = document.createElement('div');
      answerContent.className = 'answer-content';
      answerContent.innerHTML = formatMessageContent(content);
      
      answerSection.appendChild(answerTitle);
      answerSection.appendChild(answerContent);
      
      contentDiv.appendChild(thinkingSection);
      contentDiv.appendChild(answerSection);
      
      // 保存引用以便流式更新
      currentThinkingElement = thinkingContent;
      currentAnswerElement = answerContent;
    } else {
      // 应用格式化
      contentDiv.innerHTML = formatMessageContent(content);
      
      // 保存引用以便流式更新
      currentMessageElement = contentDiv;
    }
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    messageContainer.appendChild(messageDiv);
    
    // 滚动到底部
    scrollToBottom();
    
    return {
      messageDiv: messageDiv,
      contentDiv: contentDiv
    };
  }
  
  // 准备空的消息框架，用于流式响应
  function prepareMessageContainer(role) {
    const messageElements = addMessage(role, '');
    
    if (role === 'assistant') {
      if (isDeepseekR1Model(selectedModel)) {
        // 为Deepseek R1模型准备思考过程和回答框架
        const contentDiv = messageElements.contentDiv;
        
        const thinkingSection = document.createElement('div');
        thinkingSection.className = 'thinking-section';
        
        const thinkingTitle = document.createElement('div');
        thinkingTitle.className = 'thinking-title';
        thinkingTitle.textContent = '思考过程:';
        
        const thinkingContent = document.createElement('div');
        thinkingContent.className = 'thinking-content';
        
        thinkingSection.appendChild(thinkingTitle);
        thinkingSection.appendChild(thinkingContent);
        
        // 答案部分
        const answerSection = document.createElement('div');
        answerSection.className = 'answer-section';
        
        const answerTitle = document.createElement('div');
        answerTitle.className = 'answer-title';
        answerTitle.textContent = '回答:';
        
        const answerContent = document.createElement('div');
        answerContent.className = 'answer-content';
        
        answerSection.appendChild(answerTitle);
        answerSection.appendChild(answerContent);
        
        contentDiv.appendChild(thinkingSection);
        contentDiv.appendChild(answerSection);
        
        // 保存引用以便流式更新
        currentThinkingElement = thinkingContent;
        currentAnswerElement = answerContent;
        currentMessageElement = null;
      } else {
        // 普通模型直接使用contentDiv
        currentMessageElement = messageElements.contentDiv;
        currentThinkingElement = null;
        currentAnswerElement = null;
      }
    }
    
    // 滚动到底部
    scrollToBottom();
    
    return messageElements;
  }
  
  // 流式更新消息内容
  function updateMessageContent(content, isThinking = false) {
    if (isDeepseekR1Model(selectedModel)) {
      const targetElement = isThinking ? currentThinkingElement : currentAnswerElement;
      if (targetElement) {
        const formattedContent = formatMessageContent(content);
        targetElement.innerHTML = formattedContent;
      }
    } else if (currentMessageElement) {
      const formattedContent = formatMessageContent(content);
      currentMessageElement.innerHTML = formattedContent;
    }
    
    // 滚动到底部
    scrollToBottom();
  }
  
  // 显示加载提示
  function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-dots';
    loadingDiv.id = 'loading-indicator';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      loadingDiv.appendChild(dot);
    }
    
    messageContainer.appendChild(loadingDiv);
    scrollToBottom();
  }
  
  // 隐藏加载提示
  function hideLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }
  
  // 显示错误信息
  function showError(message) {
    hideLoading();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    messageContainer.appendChild(errorDiv);
    scrollToBottom();
  }
  
  // 禁用聊天功能
  function disableChat() {
    messageInput.disabled = true;
    sendButton.disabled = true;
  }
  
  // 滚动到底部
  function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
  
  // 检查是否是Deepseek R1模型
  function isDeepseekR1Model(model) {
    return model.includes('deepseek/deepseek-r1');
  }
  
  // 调用OpenRouter API
  async function callOpenRouterAPI() {
    try {
      // 隐藏加载提示
      hideLoading();
      
      // 准备空的消息容器
      prepareMessageContainer('assistant');
      
      // 准备API请求参数
      const requestBody = {
        model: selectedModel,
        messages: messages,
        stream: true // 启用流式输出
      };
      
      // 如果是Deepseek R1模型，添加include_reasoning参数
      if (isDeepseekR1Model(selectedModel)) {
        console.log('检测到Deepseek R1模型，添加include_reasoning参数');
        requestBody.include_reasoning = true;
      }
      
      console.log('API请求参数:', requestBody);
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin, // 当前网站域名
          'X-Title': 'AI Assistant' // 修改为纯ASCII字符
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        // 处理HTTP错误
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
      }
      
      // 准备处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let completeResponse = '';
      let completeThinking = '';
      let isDone = false;
      
      // 读取流
      while (!isDone) {
        const { value, done } = await reader.read();
        isDone = done;
        
        if (done) break;
        
        // 解码并处理数据块
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              // 提取JSON数据
              const jsonStr = line.substring(6);
              const data = JSON.parse(jsonStr);
              
              if (data.choices && data.choices.length > 0) {
                const choice = data.choices[0];
                
                if (choice.delta) {
                  // 处理普通内容增量
                  if (choice.delta.content) {
                    completeResponse += choice.delta.content;
                    updateMessageContent(completeResponse);
                  }
                  
                  // 处理思考过程增量（对于Deepseek R1）
                  if (isDeepseekR1Model(selectedModel) && choice.delta.reasoning) {
                    completeThinking += choice.delta.reasoning;
                    updateMessageContent(completeThinking, true);
                  }
                }
              }
            } catch (e) {
              console.error('解析流数据出错:', e, line);
            }
          } else if (line === 'data: [DONE]') {
            isDone = true;
          }
        }
      }
      
      // 响应完成，将消息添加到历史记录
      messages.push({
        role: 'assistant',
        content: completeResponse
      });
      
      console.log('流式响应完成:', { response: completeResponse, thinking: completeThinking });
      
    } catch (error) {
      console.error('API调用错误:', error);
      showError(`发生错误: ${error.message}`);
    } finally {
      isWaitingForResponse = false;
    }
  }
}); 