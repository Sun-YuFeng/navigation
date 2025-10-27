// 编程工具数据配置
export const programmingToolsData = [
  {
    title: '开发软件破解教程',
    description: '破解软件合集',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: '脚本之家在线工具',
    description: '脚本之家旗下的工具箱',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: '网站测速',
    description: '国内免费网站测速',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: 'VS Code',
    description: '代码编辑器',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: 'IntelliJ IDEA',
    description: 'Java编译工具',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: 'Cocos',
    description: '国内游戏引擎',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: 'Tomcat下载地址',
    description: 'Tomcat各版本下载',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: 'Json工具',
    description: '数据格式化工具',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: '在线编译器',
    description: '代码在线运行',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: 'Notepad++',
    description: '文本编辑工具',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: 'Pycharm',
    description: 'Python IDE工具',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: 'Atom',
    description: '代码编辑器',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: 'DataGrip',
    description: '数据库界面工具',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: 'FinalShell SSH工具',
    description: 'SSH连接工具',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: 'QuickRedis',
    description: 'Redis界面工具',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  },
  {
    title: '加密解密工具',
    description: '密钥对生成工具',
    icon: 'https://favicon.im/hey.com',
    url: '#'
  }
]

// 工具数据管理类
export class ProgrammingToolsManager {
  constructor() {
    this.tools = programmingToolsData
  }

  // 获取所有工具
  getAllTools() {
    return this.tools
  }

  // 根据标题搜索工具
  searchTools(keyword) {
    return this.tools.filter(tool => 
      tool.title.toLowerCase().includes(keyword.toLowerCase()) ||
      tool.description.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  // 添加新工具
  addTool(tool) {
    this.tools.push(tool)
  }

  // 删除工具
  removeTool(title) {
    this.tools = this.tools.filter(tool => tool.title !== title)
  }
}