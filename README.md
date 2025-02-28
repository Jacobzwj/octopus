# AI助手网页应用

这是一个基于OpenRouter API的网页聊天应用，提供类似ChatGPT的聊天界面，支持切换多种AI模型。

## 功能特点

- 简洁美观的聊天界面
- 支持多种AI模型选择（Claude、Gemini、GPT-4o等）
- 基于OpenRouter API调用多家AI服务
- 响应式设计，适配移动端和桌面端

## 使用方法

1. 访问应用网页（部署后）
2. 选择想要使用的AI模型
3. 点击"开始对话"
4. 立即开始与AI交流！

## 如何部署到GitHub Pages

1. **创建GitHub仓库**
   - 登录GitHub账号
   - 点击右上角的"+"图标，选择"New repository"
   - 输入仓库名称（例如：ai-assistant）
   - 设置为Public（公开）仓库
   - 点击"Create repository"创建仓库

2. **上传代码**
   - 将所有项目文件上传到刚创建的GitHub仓库
   - 可以使用GitHub Desktop或命令行操作:
   ```bash
   # 初始化Git仓库
   git init
   
   # 添加所有文件
   git add .
   
   # 提交更改
   git commit -m "初始提交"
   
   # 添加远程仓库地址（替换为您的仓库URL）
   git remote add origin https://github.com/您的用户名/ai-assistant.git
   
   # 推送到GitHub
   git push -u origin main
   ```

3. **启用GitHub Pages**
   - 进入GitHub仓库页面
   - 点击"Settings"（设置）
   - 滚动到"GitHub Pages"部分
   - 在"Source"下拉菜单中选择"main"分支
   - 点击"Save"保存设置
   - 等待几分钟，您的网站将会在`https://您的用户名.github.io/ai-assistant/`上线

4. **分享链接**
   - 复制GitHub Pages生成的链接
   - 分享给您的朋友，他们可以直接使用

## 本地测试

如果您想在部署前在本地测试应用：

1. 下载所有文件到本地文件夹
2. 使用任意Web服务器提供这些文件
   - 可以使用Python的简易HTTP服务器：
   ```bash
   # 进入项目文件夹
   cd 项目文件夹路径
   
   # 启动HTTP服务器
   python -m http.server 8000
   ```
3. 在浏览器中访问 `http://localhost:8000`

## 注意事项

- 应用使用内置的API密钥，如需更换，请修改scripts.js文件中的apiKey变量
- 如果使用较多，可能会超出OpenRouter的免费使用额度 
