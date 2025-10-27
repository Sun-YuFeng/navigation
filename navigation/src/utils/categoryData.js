// 10个类别的导航数据
export const categoryData = {
  // 新闻类别
  news: {
    title: '新闻',
    icon: 'uil uil-newspaper',
    tools: [
      { title: '新浪新闻', description: '国内主流新闻门户', icon: 'https://favicon.im/news.sina.com.cn', url: 'https://news.sina.com.cn' },
      { title: '腾讯新闻', description: '腾讯旗下新闻平台', icon: 'https://favicon.im/news.qq.com', url: 'https://news.qq.com' },
      { title: '网易新闻', description: '网易新闻客户端', icon: 'https://favicon.im/news.163.com', url: 'https://news.163.com' },
      { title: '今日头条', description: '个性化推荐新闻', icon: 'https://favicon.im/www.toutiao.com', url: 'https://www.toutiao.com' },
      { title: '澎湃新闻', description: '专注时政与思想', icon: 'https://favicon.im/www.thepaper.cn', url: 'https://www.thepaper.cn' },
      { title: '人民日报', description: '官方权威媒体', icon: 'https://favicon.im/www.people.com.cn', url: 'https://www.people.com.cn' },
      { title: ' 新华网 ', description: '新华社综合新闻门户', icon: 'https://favicon.im/www.xinhuanet.com', url: 'https://www.xinhuanet.com' },
      { title: ' 中国网 ', description: '多语种新闻发布平台', icon: 'https://favicon.im/www.china.com.cn', url: 'https://www.china.com.cn' },
      { title: ' 国际在线 ', description: '多语种国际新闻网', icon: 'https://favicon.im/www.cri.cn', url: 'https://www.cri.cn' },
      { title: ' 中国日报网 ', description: '权威国内新闻门户', icon: 'https://favicon.im/www.chinadaily.com.cn', url: 'https://www.chinadaily.com.cn' },
      { title: ' 央视网 ', description: '央视视频新闻核心', icon: 'https://favicon.im/www.cctv.com', url: 'https://www.cctv.com' },
      { title: ' 中国青年网 ', description: '青年综合新闻平台', icon: 'https://favicon.im/www.youth.cn', url: 'https://www.youth.cn' },  
      { title: ' 中国经济网 ', description: '重点经济新闻网站', icon: 'https://favicon.im/www.ce.cn', url: 'https://www.ce.cn' },
      { title: ' 中国新闻网 ', description: '中新社新闻平台', icon: 'https://favicon.im/www.chinanews.com.cn', url: 'https://www.chinanews.com.cn' },
      { title: ' 凤凰新闻 ', description: '专业资讯聚合平台', icon: 'https://favicon.im/news.ifeng.com', url: 'https://news.ifeng.com' },
      { title: ' 财新网 ', description: '财经深度报道平台', icon: 'https://favicon.im/www.caixin.com', url: 'https://www.caixin.com' }
    ]
  },
  
  // 社交类别
  social: {
    title: '社交',
    icon: 'uil uil-comments',
    tools: [
      { title: '微信', description: '即时通讯应用', icon: 'https://favicon.im/weixin.qq.com', url: 'https://weixin.qq.com' },
      { title: 'QQ', description: '腾讯社交平台', icon: 'https://favicon.im/im.qq.com', url: 'https://im.qq.com' },
      { title: '微博', description: '社交媒体平台', icon: 'https://favicon.im/weibo.com', url: 'https://weibo.com' },
      { title: '知乎', description: '知识分享社区', icon: 'https://favicon.im/www.zhihu.com', url: 'https://www.zhihu.com' },
      { title: '豆瓣', description: '文化社交平台', icon: 'https://favicon.im/www.douban.com', url: 'https://www.douban.com' },
      { title: '小红书', description: '生活方式社区', icon: 'https://favicon.im/www.xiaohongshu.com', url: 'https://www.xiaohongshu.com' },
      { title: 'Soul', description: ' 年轻人的社交元宇宙 ', icon: 'https://favicon.im/www.soulapp.cn', url: 'https://www.soulapp.cn' },
      { title: ' 美篇 ', description: ' 图文社交平台 ', icon: 'https://favicon.im/www.meipian.cn', url: 'https://www.meipian.cn' },
      { title: 'QQ 空间 ', description: ' 腾讯社交空间 ', icon: 'https://favicon.im/qzone.qq.com', url: 'https://qzone.qq.com' },
      { title: ' 虎扑 ', description: ' 体育社区与社交 ', icon: 'https://favicon.im/www.hupu.com', url: 'https://www.hupu.com' },
      { title: ' 陌陌 ', description: ' 陌生人社交平台 ', icon: 'https://favicon.im/www.momo.com', url: 'https://www.momo.com' },
      { title: ' 探探 ', description: ' 滑动交友社交平台 ', icon: 'https://favicon.im/www.tantan.com', url: 'https://www.tantan.com' },
      { title: ' 积目 ', description: ' 兴趣社交平台 ', icon: 'https://favicon.im/www.gemoo.com', url: 'https://www.gemoo.com' },
      { title: ' 微光 ', description: ' 观影社交平台 ', icon: 'https://favicon.im/www.vlightapp.com', url: 'https://www.vlightapp.com' },
      { title: ' 百度贴吧 ', description: ' 兴趣社群聚集地 ', icon: 'https://favicon.im/tieba.baidu.com', url: 'https://tieba.baidu.com' },
      { title: 'Togoo', description: ' 跨国实时交友软件 ', icon: 'https://favicon.im/www.togoo.com', url: 'https://www.togoo.com' }
    ]
  },
  
  // 娱乐类别
  entertainment: {
    title: '娱乐',
    icon: 'uil uil-game-structure',
    tools: [
     { title: ' 哔哩哔哩 ', description: ' 视频弹幕网站 ', icon: 'https://favicon.im/www.bilibili.com', url: 'https://www.bilibili.com' },
     { title: ' 抖音 ', description: ' 短视频平台 ', icon: 'https://favicon.im/www.douyin.com', url: 'https://www.douyin.com' },
     { title: ' 爱奇艺 ', description: ' 在线视频平台 ', icon: 'https://favicon.im/www.iqiyi.com', url: 'https://www.iqiyi.com' },
     { title: ' 腾讯视频 ', description: ' 视频流媒体服务 ', icon: 'https://favicon.im/v.qq.com', url: 'https://v.qq.com' },
     { title: ' 网易云音乐 ', description: ' 音乐流媒体平台 ', icon: 'https://favicon.im/music.163.com', url: 'https://music.163.com' },
     { title: ' 斗鱼直播 ', description: ' 游戏直播平台 ', icon: 'https://favicon.im/www.douyu.com', url: 'https://www.douyu.com' },
     { title: "优酷", description: "在线视频平台", icon: "https://favicon.im/www.youku.com", url: "https://www.youku.com"},
     { title: "西瓜视频", description: "中长视频平台", icon: "https://favicon.im/www.ixigua.com", url: "https://www.ixigua.com"},
     { title: "虎牙直播", description: "游戏直播平台", icon: "https://favicon.im/www.huya.com", url: "https://www.huya.com"},
     { title: "Twitter(X)", description: "全球社交信息平台", icon: "https://favicon.im/x.com", url: "https://x.com" },
     { title: "芒果 TV", description: "湖南台视频平台", icon: "https://favicon.im/www.mgtv.com", url: "https://www.mgtv.com"},
     { title: "YouTube", description: "全球视频分享平台", icon: "https://favicon.im/youtube.com", url: "https://www.youtube.com" },
     { title: "乐视视频", description: "综合视频平台", icon: "https://favicon.im/www.le.com", url: "https://www.le.com"},
     { title: "央视频", description: "综合视频平台", icon: "https://favicon.im/www.yangshipin.cn", url: "https://www.yangshipin.cn"},
     { title: "咪咕视频", description: "综合视频平台", icon: "https://favicon.im/www.miguvideo.com", url: "https://www.miguvideo.com"},
     { title: "CC 直播", description: "游戏娱乐直播平台", icon: "https://favicon.im/cc.163.com", url: "https://cc.163.com"}
    ]
  },
  
  // 编程类别
  programming: {
    title: '编程',
    icon: 'uil uil-laptop',
    tools: [
      { title: 'GitHub', description: '代码托管平台', icon: 'https://favicon.im/github.com', url: 'https://github.com' },
      { title: 'Stack Overflow', description: '开发者问答社区', icon: 'https://favicon.im/stackoverflow.com', url: 'https://stackoverflow.com' },
      { title: 'VS Code', description: '代码编辑器', icon: 'https://favicon.im/code.visualstudio.com', url: 'https://code.visualstudio.com' },
      { title: 'MDN Web Docs', description: 'Web技术文档', icon: 'https://favicon.im/developer.mozilla.org', url: 'https://developer.mozilla.org' },
      { title: 'Vue.js', description: '渐进式JavaScript框架', icon: 'https://favicon.im/vuejs.org', url: 'https://vuejs.org' },
      { title: 'React', description: '用户界面库', icon: 'https://favicon.im/reactjs.org', url: 'https://reactjs.org' },
      { title: 'Node.js', description: 'JavaScript 运行环境 ', icon: 'https://favicon.im/nodejs.org', url: 'https://nodejs.org' },
      { title: 'npm', description: 'Node 包管理工具 ', icon: 'https://favicon.im/www.npmjs.com', url: 'https://www.npmjs.com' },
      { title: 'Yarn', description: ' 快速依赖管理工具 ', icon: 'https://favicon.im/yarnpkg.com', url: 'https://yarnpkg.com' },
      { title: 'Webpack', description: ' 模块打包构建工具 ', icon: 'https://favicon.im/webpack.js.org', url: 'https://webpack.js.org' },
      { title: 'Vite', description: ' 前端构建开发工具 ', icon: 'https://favicon.im/vitejs.dev', url: 'https://vitejs.dev' },
      { title: 'TypeScript', description: ' 强类型 JS 超集 ', icon: 'https://favicon.im/www.typescriptlang.org', url: 'https://www.typescriptlang.org' },
      { title: 'TailwindCSS', description: ' 实用优先 CSS 框架 ', icon: 'https://favicon.im/tailwindcss.com', url: 'https://tailwindcss.com' },
      { title: 'Axios', description: 'HTTP 请求客户端 ', icon: 'https://favicon.im/axios-http.com', url: 'https://axios-http.com' },
      { title: 'Next.js', description: 'React 框架服务端渲染 ', icon: 'https://favicon.im/nextjs.org', url: 'https://nextjs.org' },
      { title: 'Nuxt.js', description: 'Vue 框架服务端渲染 ', icon: 'https://favicon.im/nuxtjs.org', url: 'https://nuxtjs.org' }
    ]
  },
  
  // 工作类别
  work: {
    title: '工作',
    icon: 'uil uil-briefcase',
    tools: [
      { title: '钉钉', description: '企业通讯平台', icon: 'https://favicon.im/www.dingtalk.com', url: 'https://www.dingtalk.com' },
      { title: '飞书', description: '办公协作平台', icon: 'https://favicon.im/www.feishu.cn', url: 'https://www.feishu.cn' },
      { title: '企业微信', description: '企业级通讯工具', icon: 'https://favicon.im/work.weixin.qq.com', url: 'https://work.weixin.qq.com' },
      { title: '腾讯会议', description: '在线会议工具', icon: 'https://favicon.im/meeting.tencent.com', url: 'https://meeting.tencent.com' },
      { title: '石墨文档', description: '在线协作文档', icon: 'https://favicon.im/shimo.im', url: 'https://shimo.im' },
      { title: 'Notion', description: '一体化工作空间', icon: 'https://favicon.im/www.notion.so', url: 'https://www.notion.so' },
      { title: 'Gitee', description: ' 国内代码托管平台 ', icon: 'https://favicon.im/gitee.com', url: 'https://gitee.com' },
      { title: 'GitHub', description: ' 代码托管协作平台 ', icon: 'https://favicon.im/github.com', url: 'https://github.com' },
      { title: ' 飞书文档 ', description: ' 高效协作文档工具 ', icon: 'https://favicon.im/www.feishu.cn', url: 'https://www.feishu.cn/docs' },
      { title: ' 腾讯文档 ', description: ' 多人在线协作文档 ', icon: 'https://favicon.im/docs.qq.com', url: 'https://docs.qq.com' },
      { title: 'Figma', description: 'UI 设计协作工具 ', icon: 'https://favicon.im/www.figma.com', url: 'https://www.figma.com' },
      { title: 'ProcessOn', description: ' 在线思维导图工具 ', icon: 'https://favicon.im/www.processon.com', url: 'https://www.processon.com' },
      { title: ' 语雀 ', description: ' 知识管理协作平台 ', icon: 'https://favicon.im/www.yuque.com', url: 'https://www.yuque.com' },
      { title: 'Slack', description: ' 团队沟通协作工具 ', icon: 'https://favicon.im/slack.com', url: 'https://slack.com' },
      { title: 'Jira', description: ' 项目跟踪管理工具 ', icon: 'https://favicon.im/www.atlassian.com', url: 'https://www.atlassian.com/software/jira' },
      { title: 'Teambition', description: ' 项目协作管理平台 ', icon: 'https://favicon.im/www.teambition.com', url: 'https://www.teambition.com' }
    ]
  },
  
  // 学习类别
  study: {
    title: '学习',
    icon: 'uil uil-book-open',
    tools: [
      { title: '中国大学MOOC', description: '在线课程平台', icon: 'https://favicon.im/www.icourse163.org', url: 'https://www.icourse163.org' },
      { title: '学堂在线', description: '清华大学在线教育', icon: 'https://favicon.im/www.xuetangx.com', url: 'https://www.xuetangx.com' },
      { title: 'B站学习区', description: '知识分享视频', icon: 'https://favicon.im/www.bilibili.com', url: 'https://www.bilibili.com' },
      { title: '网易公开课', description: '国内外名校课程', icon: 'https://favicon.im/open.163.com', url: 'https://open.163.com' },
      { title: 'Coursera', description: '国际在线课程', icon: 'https://favicon.im/www.coursera.org', url: 'https://www.coursera.org' },
      { title: 'edX', description: '哈佛MIT在线课程', icon: 'https://favicon.im/www.edx.org', url: 'https://www.edx.org' },
      { title: ' 慕课网 ', description: 'IT 技能系统学习 ', icon: 'https://favicon.im/www.imooc.com', url: 'https://www.imooc.com' },
      { title: ' 极客时间 ', description: ' 程序员成长课程 ', icon: 'https://favicon.im/time.geekbang.org', url: 'https://time.geekbang.org' },
      { title: ' 学习通 ', description: ' 高校在线学习平台 ', icon: 'https://favicon.im/i.chaoxing.com', url: 'https://i.chaoxing.com' },
      { title: 'Udemy', description: ' 多领域实战课程 ', icon: 'https://favicon.im/www.udemy.com', url: 'https://www.udemy.com' },
      { title: ' 可汗学院 ', description: ' 免费全科视频教程 ', icon: 'https://favicon.im/www.khanacademy.org', url: 'https://www.khanacademy.org' },
      { title: ' 扇贝网 ', description: ' 语言学习词汇积累 ', icon: 'https://favicon.im/www.shanbay.com', url: 'https://www.shanbay.com' },
      { title: ' 有道精品课 ', description: ' 考研考证专项辅导 ', icon: 'https://favicon.im/ke.youdao.com', url: 'https://ke.youdao.com' },
      { title: ' 爱课程 ', description: ' 国家精品课程平台 ', icon: 'https://favicon.im/www.icourses.cn', url: 'https://www.icourses.cn' },
      { title: ' 万门大学 ', description: ' 低价优质通识课程 ', icon: 'https://favicon.im/www.wanmen.org', url: 'https://www.wanmen.org' },
      { title: ' 智学网 ', description: 'K12 同步辅导学习 ', icon: 'https://favicon.im/www.zhihuishu.com', url: 'https://www.zhihuishu.com' }
    ]
  },
  
  // 媒体类别
  media: {
    title: '媒体',
    icon: 'uil uil-play-circle',
    tools: [
      { title: 'Adobe Creative Cloud', description: '创意软件套件', icon: 'https://favicon.im/www.adobe.com', url: 'https://www.adobe.com' },
      { title: 'Canva', description: '在线设计工具', icon: 'https://favicon.im/www.canva.com', url: 'https://www.canva.com' },
      { title: 'Figma', description: '界面设计工具', icon: 'https://favicon.im/www.figma.com', url: 'https://www.figma.com' },
      { title: '剪映', description: '视频剪辑工具', icon: 'https://favicon.im/lv.ulikecam.com', url: 'https://lv.ulikecam.com' },
      { title: 'Photoshop', description: '图像处理软件', icon: 'https://favicon.im/www.adobe.com', url: 'https://www.adobe.com/products/photoshop.html' },
      { title: 'Premiere Pro', description: '视频编辑软件', icon: 'https://favicon.im/www.adobe.com', url: 'https://www.adobe.com/products/premiere.html' },
      { title: 'Audition', description: ' 专业音频编辑工具 ', icon: 'https://favicon.im/www.adobe.com', url: 'https://www.adobe.com/products/audition.html' },
      { title: 'After Effects', description: ' 影视后期特效软件 ', icon: 'https://favicon.im/www.adobe.com', url: 'https://www.adobe.com/products/aftereffects.html' },
      { title: 'Blender', description: ' 三维建模渲染工具 ', icon: 'https://favicon.im/www.blender.org', url: 'https://www.blender.org' },
      { title: 'Procreate', description: ' 移动数字绘画软件 ', icon: 'https://favicon.im/procreate.art', url: 'https://procreate.art' },
      { title: 'Sketch', description: 'UI 矢量设计工具 ', icon: 'https://favicon.im/www.sketch.com', url: 'https://www.sketch.com' },
      { title: 'DaVinci Resolve', description: ' 专业调色剪辑软件 ', icon: 'https://favicon.im/www.blackmagicdesign.com', url: 'https://www.blackmagicdesign.com' },
      { title: 'CorelDRAW', description: ' 矢量图形设计软件 ', icon: 'https://favicon.im/www.coreldraw.com', url: 'https://www.coreldraw.com' },{ title: 'Affinity Designer', description: ' 跨平台设计工具 ', icon: 'https://favicon.im/affinity.serif.com', url: 'https://affinity.serif.com' },
      { title: 'C4D', description: ' 三维动画设计软件 ', icon: 'https://favicon.im/www.maxon.net', url: 'https://www.maxon.net' },
      { title: ' 美图秀秀 ', description: ' 简易图像处理工具 ', icon: 'https://favicon.im/xiuxiu.web.meitu.com', url: 'https://xiuxiu.web.meitu.com' }
    ]
  },
  
  // 工具类别
  tools: {
    title: '工具',
    icon: 'uil uil-wrench',
    tools: [
      { title: '百度网盘', description: '云存储服务', icon: 'https://favicon.im/pan.baidu.com', url: 'https://pan.baidu.com' },
      { title: '阿里云盘', description: '云存储平台', icon: 'https://favicon.im/www.aliyundrive.com', url: 'https://www.aliyundrive.com' },
      { title: 'WPS Office', description: '办公软件套件', icon: 'https://favicon.im/www.wps.cn', url: 'https://www.wps.cn' },
      { title: '腾讯文档', description: '在线文档工具', icon: 'https://favicon.im/docs.qq.com', url: 'https://docs.qq.com' },
      { title: '百度翻译', description: '在线翻译工具', icon: 'https://favicon.im/fanyi.baidu.com', url: 'https://fanyi.baidu.com' },
      { title: '有道词典', description: '词典翻译工具', icon: 'https://favicon.im/www.youdao.com', url: 'https://www.youdao.com' },
      { title: ' 石墨文档 ', description: ' 多人协作在线文档 ', icon: 'https://favicon.im/shimo.im', url: 'https://shimo.im' },
      { title: ' 飞书文档 ', description: ' 高效协同办公工具 ', icon: 'https://favicon.im/www.feishu.cn', url: 'https://www.feishu.cn/hc/zh-CN' },
      { title: ' 坚果云 ', description: ' 文件同步备份工具 ', icon: 'https://favicon.im/www.jianguoyun.com', url: 'https://www.jianguoyun.com' },
      { title: ' 腾讯会议 ', description: ' 高清视频会议工具 ', icon: 'https://favicon.im/meeting.tencent.com', url: 'https://meeting.tencent.com' },
      { title: ' 钉钉 ', description: ' 办公协同沟通工具 ', icon: 'https://favicon.im/www.dingtalk.com', url: 'https://www.dingtalk.com' },
      { title: ' 讯飞听见 ', description: ' 语音转文字工具 ', icon: 'https://favicon.im/www.iflyrec.com', url: 'https://www.iflyrec.com' },
      { title: 'XMind', description: ' 思维导图制作工具 ', icon: 'https://favicon.im/xmind.cn', url: 'https://xmind.cn' },
      { title: 'Notion', description: ' 全能笔记协作工具 ', icon: 'https://favicon.im/www.notion.so', url: 'https://www.notion.so' },
      { title: ' 微信读书 ', description: ' 电子阅读笔记工具 ', icon: 'https://favicon.im/weread.qq.com', url: 'https://weread.qq.com' },
      { title: 'iLovePDF', description: 'PDF 编辑转换工具 ', icon: 'https://favicon.im/www.ilovepdf.com', url: 'https://www.ilovepdf.com' }
    ]
  },
  
  // 健康类别
  health: {
    title: '健康',
    icon: 'uil uil-heart-medical',
    tools: [
      { title: 'Keep', description: '运动健身应用', icon: 'https://favicon.im/www.gotokeep.com', url: 'https://www.gotokeep.com' },
      { title: '薄荷健康', description: '健康管理平台', icon: 'https://favicon.im/www.boohee.com', url: 'https://www.boohee.com' },
      { title: '丁香医生', description: '医疗健康咨询', icon: 'https://favicon.im/dxy.com', url: 'https://dxy.com' },
      { title: '好大夫在线', description: '在线医疗咨询', icon: 'https://favicon.im/www.haodf.com', url: 'https://www.haodf.com' },
      { title: '悦跑圈', description: '跑步运动社区', icon: 'https://favicon.im/www.thejoyrun.com', url: 'https://www.thejoyrun.com' },
      { title: '小米运动', description: '健康数据管理', icon: 'https://favicon.im/www.mi.com', url: 'https://www.mi.com' },
      { title: ' 潮汐 ', description: ' 冥想助眠放松工具 ', icon: 'https://favicon.im/tidal.com', url: 'https://tidal.com' },
      { title: ' 咕咚 ', description: ' 运动轨迹记录工具 ', icon: 'https://favicon.im/www.codoon.com', url: 'https://www.codoon.com' },
      { title: ' 每日瑜伽 ', description: ' 专业瑜伽教学应用 ', icon: 'https://favicon.im/www.dailyyoga.com', url: 'https://www.dailyyoga.com' },
      { title: 'Wake', description: ' 正念冥想助眠应用 ', icon: 'https://favicon.im/www.wakeapp.co', url: 'https://www.wakeapp.co' },
      { title: ' 睡眠监测 ', description: ' 睡眠质量分析工具 ', icon: 'https://favicon.im/www.sleepmonitor.com', url: 'https://www.sleepmonitor.com' },
      { title: ' 瑜伽教练 ', description: ' 零基础瑜伽入门课 ', icon: 'https://favicon.im/www.yogacoach.com', url: 'https://www.yogacoach.com' },
      { title: ' 健康秤 ', description: ' 体重体脂数据追踪 ', icon: 'https://favicon.im/www.healthscale.com', url: 'https://www.healthscale.com' },
      { title: ' 营养师 ', description: ' 饮食搭配指导工具 ', icon: 'https://favicon.im/www.dietitian.com', url: 'https://www.dietitian.com' },
      { title: ' 健身计算器 ', description: ' 运动热量消耗计算 ', icon: 'https://favicon.im/www.fitcalc.com', url: 'https://www.fitcalc.com' },
      { title: ' 心理健康 ', description: ' 情绪疏导咨询平台 ', icon: 'https://favicon.im/www.mentalhealth.com', url: 'https://www.mentalhealth.com' }
    ]
  },
  
  // 购物类别
  shopping: {
    title: '购物',
    icon: 'uil uil-shopping-cart',
    tools: [
      { title: '淘宝', description: '综合电商平台', icon: 'https://favicon.im/www.taobao.com', url: 'https://www.taobao.com' },
      { title: '京东', description: '自营电商平台', icon: 'https://favicon.im/www.jd.com', url: 'https://www.jd.com' },
      { title: '拼多多', description: '社交电商平台', icon: 'https://favicon.im/www.pinduoduo.com', url: 'https://www.pinduoduo.com' },
      { title: '天猫', description: '品牌电商平台', icon: 'https://favicon.im/www.tmall.com', url: 'https://www.tmall.com' },
      { title: '唯品会', description: '特卖电商平台', icon: 'https://favicon.im/www.vip.com', url: 'https://www.vip.com' },
      { title: '苏宁易购', description: '家电数码电商', icon: 'https://favicon.im/www.suning.com', url: 'https://www.suning.com' },
      { title: ' 亚马逊 ', description: ' 全球综合性电商 ', icon: 'https://favicon.im/www.amazon.com', url: 'https://www.amazon.com' },
      { title: ' 当当网 ', description: ' 图书音像购物平台 ', icon: 'https://favicon.im/www.dangdang.com', url: 'https://www.dangdang.com' },
      { title: ' 抖音电商 ', description: ' 兴趣电商平台 ', icon: 'https://favicon.im/www.douyin.com', url: 'https://www.douyin.com' },
      { title: ' 快手电商 ', description: ' 直播电商平台 ', icon: 'https://favicon.im/www.kuaishou.com', url: 'https://www.kuaishou.com' },
      { title: ' 得物 ', description: ' 潮品交易平台 ', icon: 'https://favicon.im/www.dewu.com', url: 'https://www.dewu.com' },
      { title: ' 小红书商城 ', description: ' 社交购物平台 ', icon: 'https://favicon.im/www.xiaohongshu.com', url: 'https://www.xiaohongshu.com' },
      { title: ' 闲鱼 ', description: 'C2C 二手交易平台 ', icon: 'https://favicon.im/www.xianyu.com', url: 'https://www.xianyu.com' },
      { title: ' 网易严选 ', description: 'ODM 模式电商 ', icon: 'https://favicon.im/you.163.com', url: 'https://you.163.com' },
      { title: ' 盒马鲜生 ', description: ' 生鲜新零售平台 ', icon: 'https://favicon.im/www.hema.com', url: 'https://www.hema.com' },
      { title: ' 美团优选 ', description: ' 社区团购平台 ', icon: 'https://favicon.im/www.meituan.com', url: 'https://www.meituan.com' }
    ]
  }
}

// 获取所有类别数据
export const getAllCategories = () => {
  return Object.values(categoryData)
}

// 根据类别名称获取数据
export const getCategoryByName = (name) => {
  return categoryData[name]
}