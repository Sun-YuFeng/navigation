<template>
  <div class="edit-container">
    <!-- 自定义弹窗组件 -->
    <div v-if="showModal" class="modal-overlay" @click="handleModalOverlayClick">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <p>{{ modalMessage }}</p>
        </div>
        <div class="modal-footer">
          <button v-if="modalType === 'confirm'" class="modal-btn modal-btn-cancel" @click="handleCancelAction">{{ modalCancelText }}</button>
          <button class="modal-btn modal-btn-primary" @click="handleConfirmAction">{{ modalConfirmText }}</button>
        </div>
      </div>
    </div>

    <!-- 封面选择弹窗 -->
    <div v-if="showCoverModal" class="modal-overlay" @click="handleCoverModalOverlayClick">
      <div class="modal-content cover-modal" @click.stop>
        <div class="modal-header">
          <h3>要添加封面吗？</h3>
          <button class="modal-close" @click="closeCoverModal">×</button>
        </div>
        <div class="modal-body">
          <!-- 上传步骤 -->
          <div v-if="coverUploadStep === 'upload'" class="cover-upload-step">
            <div class="cover-upload-area" @click="triggerCoverUpload">
              <div class="upload-icon">
                <i class="uil uil-image-upload"></i>
              </div>
              <p>点击上传封面图片</p>
              <p class="upload-hint">支持JPG、PNG、GIF、WebP、BMP格式，建议尺寸16:9</p>
              <input type="file" ref="coverFileInput" accept="image/jpg,image/png,image/jpeg,image/gif,image/webp,image/bmp" style="display: none;" @change="handleCoverFileSelect">
            </div>
          </div>
          
          <!-- 预览步骤 -->
          <div v-if="coverUploadStep === 'preview'" class="cover-preview-step">
            <div class="cover-preview">
              <img :src="coverImagePreview" alt="封面预览" />
            </div>
            <p class="preview-hint">封面预览</p>
            <button class="change-cover-btn" @click="resetCoverUpload">重新选择</button>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="coverUploadStep === 'upload'" class="modal-btn modal-btn-cancel" @click="skipCover">跳过，不用封面</button>
          <button v-if="coverUploadStep === 'preview'" class="modal-btn modal-btn-primary" @click="confirmCover">确认封面并发布</button>
          <button v-if="coverUploadStep === 'upload'" class="modal-btn modal-btn-primary" :disabled="!coverImagePreview" @click="nextStep">下一步</button>
        </div>
      </div>
    </div>
    
    <div class="container">
      <!-- 左栏：配置项区域 -->
      <div class="config-panel">
        <!-- 截图/教程图区域 - 分离到最上面 -->
        <div class="image-upload-section">
          <h3>截图/教程图</h3>
          <div class="file-upload" @click="triggerFileInput" @dragover.prevent="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
            <p>点击或拖拽文件至此处上传（最多5张）</p>
            <p>支持JPG、PNG、GIF、WebP、BMP格式，单张不超过5MB</p>
            <input type="file" ref="fileInput" multiple accept="image/jpg,image/png,image/jpeg,image/gif,image/webp,image/bmp" style="display: none;" @change="handleFileSelect">
          </div>
          <div v-if="uploadedFiles.length > 0" class="file-preview">
            <div v-for="(file, index) in uploadedFiles" :key="index" class="preview-item">
              <img :src="file.preview" alt="预览图" />
              <span class="file-name">{{ file.name }}</span>
              <button @click="removeFile(index)" class="remove-btn">×</button>
            </div>
          </div>
        </div>

        <h2 style="font-size: 18px; margin-bottom: 15px;">发布配置</h2>
        
        <div class="form-group">
          <div class="content-type-hint">
            <span>内容类型</span>
          </div>
          
          <!-- 工作流 -->
          <div class="collapsible-section" :class="{ collapsed: collapsedSections.workflow }">
            <div class="collapsible-header" @click="toggleSection('workflow')">
              <label>工作流</label>
              <span class="collapse-icon">{{ collapsedSections.workflow ? '▶' : '▼' }}</span>
            </div>
            <div class="collapsible-content" v-if="!collapsedSections.workflow">
              <div class="radio-group">
                <label><input type="radio" v-model="formData.contentType" value="自动化工作流"> 自动化工作流</label>
                <label><input type="radio" v-model="formData.contentType" value="手动协作流"> 手动协作流</label>
                <label><input type="radio" v-model="formData.contentType" value="跨工具集成流"> 跨工具集成流</label>
              </div>
            </div>
          </div>
          
          <!-- 智能体 -->
          <div class="collapsible-section" :class="{ collapsed: collapsedSections.agent }">
            <div class="collapsible-header" @click="toggleSection('agent')">
              <label>智能体</label>
              <span class="collapse-icon">{{ collapsedSections.agent ? '▶' : '▼' }}</span>
            </div>
            <div class="collapsible-content" v-if="!collapsedSections.agent">
              <div class="radio-group">
                <label><input type="radio" v-model="formData.contentType" value="AI助手型"> AI助手型</label>
                <label><input type="radio" v-model="formData.contentType" value="数据处理型"> 数据处理型</label>
                <label><input type="radio" v-model="formData.contentType" value="决策支持型"> 决策支持型</label>
              </div>
            </div>
          </div>
          
          <!-- 教程 -->
          <div class="collapsible-section" :class="{ collapsed: collapsedSections.tutorial }">
            <div class="collapsible-header" @click="toggleSection('tutorial')">
              <label>教程</label>
              <span class="collapse-icon">{{ collapsedSections.tutorial ? '▶' : '▼' }}</span>
            </div>
            <div class="collapsible-content" v-if="!collapsedSections.tutorial">
              <div class="radio-group">
                <label><input type="radio" v-model="formData.contentType" value="工具入门"> 工具入门</label>
                <label><input type="radio" v-model="formData.contentType" value="场景案例"> 场景案例</label>
                <label><input type="radio" v-model="formData.contentType" value="故障排查"> 故障排查</label>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>标题 <span class="required-mark">*</span></label>
          <input type="text" v-model="formData.title" placeholder="请输入标题（不超过50字）" maxlength="50">
        </div>

        <div class="form-group">
          <label>所属平台 <span class="required-mark">*</span></label>
          <div class="checkbox-group platform-grid">
            <div v-for="platform in filteredPlatforms" :key="platform" class="platform-item">
              <label><input type="checkbox" v-model="formData.platforms" :value="platform"> {{ platform }}</label>
            </div>
            <div v-if="filteredPlatforms.length === 0" class="no-platforms">
              <p>请先选择内容类型</p>
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="collapsible-section" :class="{ collapsed: collapsedSections.scenes }">
            <div class="collapsible-header" @click="toggleSection('scenes')">
              <label>应用场景</label>
              <span class="collapse-icon">{{ collapsedSections.scenes ? '▶' : '▼' }}</span>
            </div>
            <div class="collapsible-content" v-if="!collapsedSections.scenes">
              <div class="scene-hint">
                <span class="hint-icon">💡</span>
                <span>选择适用的场景标签</span>
              </div>
              
              <!-- 行业场景 -->
              <div class="scene-category">
                <h5>行业场景▼</h5>
                <div class="tag-group">
                  <label class="tag-label"><input type="checkbox" v-model="formData.scenes" value="电商运营"> 电商运营</label>
                  <label class="tag-label"><input type="checkbox" v-model="formData.scenes" value="新媒体"> 新媒体</label>
                  <label class="tag-label"><input type="checkbox" v-model="formData.scenes" value="人力资源"> 人力资源</label>
                  <label class="tag-label"><input type="checkbox" v-model="formData.scenes" value="财务"> 财务</label>
                  <label class="tag-label"><input type="checkbox" v-model="formData.scenes" value="客户服务"> 客户服务</label>
                  <label class="tag-label"><input type="checkbox" v-model="formData.scenes" value="市场营销"> 市场营销</label>
                </div>
              </div>
              
              <!-- 功能场景 -->
              <div class="scene-category">
                <h5>功能场景▼</h5>
                <div class="tag-group">
                  <label class="tag-label"><input type="checkbox" v-model="formData.scenes" value="数据采集"> 数据采集</label>
                  <label class="tag-label"><input type="checkbox" v-model="formData.scenes" value="流程审批"> 流程审批</label>
                  <label class="tag-label"><input type="checkbox" v-model="formData.scenes" value="内容分发"> 内容分发</label>
                  <label class="tag-label"><input type="checkbox" v-model="formData.scenes" value="智能客服"> 智能客服</label>
                  <label class="tag-label"><input type="checkbox" v-model="formData.scenes" value="报表生成"> 报表生成</label>
                  <label class="tag-label"><input type="checkbox" v-model="formData.scenes" value="监控预警"> 监控预警</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="collapsible-section" :class="{ collapsed: collapsedSections.attributes }">
            <div class="collapsible-header" @click="toggleSection('attributes')">
              <label>属性</label>
              <span class="collapse-icon">{{ collapsedSections.attributes ? '▶' : '▼' }}</span>
            </div>
            <div class="collapsible-content" v-if="!collapsedSections.attributes">
              <div class="attribute-sections">
                <div class="attribute-section">
                  <h5>权益类型</h5>
                  <div class="checkbox-group">
                    <label><input type="checkbox" v-model="formData.attributes" value="开源免费"> 开源免费</label>
                    <label><input type="checkbox" v-model="formData.attributes" value="商业付费"> 商业付费</label>
                    <label><input type="checkbox" v-model="formData.attributes" value="试用版"> 试用版</label>
                  </div>
                </div>
                <div class="attribute-section">
                  <h5>创作类型</h5>
                  <div class="checkbox-group">
                    <label><input type="checkbox" v-model="formData.attributes" value="个人原创"> 个人原创</label>
                    <label><input type="checkbox" v-model="formData.attributes" value="团队协作"> 团队协作</label>
                    <label><input type="checkbox" v-model="formData.attributes" value="官方模板"> 官方模板</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>简介 <span class="required-mark">*</span></label>
          <textarea v-model="formData.description" placeholder="示例：这是一个基于 n8n 的电商订单自动同步工作流，支持 Shopify 与 ERP 系统数据互通。请简要描述内容功能、使用方法等（不超过200字）" rows="3" maxlength="200"></textarea>
          <div class="hint-text">建议包含：功能描述、适用场景、核心价值</div>
        </div>

        <div class="form-group">
          <label>链接/代码 <span class="required-mark">*</span></label>
          <div class="link-types">
            <div class="link-type-option">
              <label><input type="radio" v-model="formData.linkType" value="template"> 工作流模板</label>
              <input type="text" v-model="formData.templateLink" placeholder="n8n 模板地址（如：https://n8n.io/workflows/xxx）">
            </div>
            <div class="link-type-option">
              <label><input type="radio" v-model="formData.linkType" value="api"> API地址</label>
              <input type="text" v-model="formData.apiLink" placeholder="数据接口调用链接">
            </div>
            <div class="link-type-option">
              <label><input type="radio" v-model="formData.linkType" value="repository"> 开源仓库</label>
              <input type="text" v-model="formData.repositoryLink" placeholder="GitHub/GitLab 仓库地址">
            </div>
          </div>
        </div>

        <div class="form-group">
          <div class="collapsible-section" :class="{ collapsed: collapsedSections.visibility }">
            <div class="collapsible-header" @click="toggleSection('visibility')">
              <label>可见范围（默认公开）</label>
              <span class="collapse-icon">{{ collapsedSections.visibility ? '▶' : '▼' }}</span>
            </div>
            <div class="collapsible-content" v-if="!collapsedSections.visibility">
              <div class="visibility-options">
                <label><input type="radio" v-model="formData.visibility" value="公开"> 公开（所有人可见）</label>
                <label><input type="radio" v-model="formData.visibility" value="私有"> 私有（仅自己可见）</label>
                <label><input type="radio" v-model="formData.visibility" value="团队可见"> 指定团队可见</label>
                <label><input type="radio" v-model="formData.visibility" value="密码访问"> 密码访问</label>
              </div>
              <div v-if="formData.visibility === '密码访问'" class="password-section">
                <input type="password" v-model="formData.accessPassword" placeholder="设置访问密码">
              </div>
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-top: 30px;">
          <button type="button" @click="handleSubmit" :disabled="!isFormValid">发布</button>
          <button class="cancel" type="button" @click="handleCancel">取消</button>
        </div>
      </div>

      <!-- 右栏：编辑区域 -->
      <div class="editor-panel">
        <div class="editor-header">
          <div>
            <h3>内容编辑区</h3>
            <p>需从左侧 截图/教程 上传或拖拽 图片、截图等</p>
          </div>
          <div class="header-actions">
            <button class="draft" type="button" @click="saveDraft">存草稿</button>
            <!-- AI辅助按钮 -->
            <div class="ai-button-wrapper">
              <button class="ai-header-button" type="button" @click="toggleAIAssistant">
                <span class="ai-icon">✨ AI</span>
              </button>
              <!-- 气泡提示 - 在按钮下方 -->
              <div v-if="showAITooltip" class="ai-tooltip ai-tooltip-bottom" @click="hideAITooltip">
                <div class="tooltip-arrow-bottom"></div>
                <div class="tooltip-content">
                  <p>需要AI帮助吗？点击AI按钮可以润色或补充内容</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 编辑器容器 -->
        <div class="vditor-container">
          <div id="vditor" ref="vditorRef"></div>
        </div>
        
        <!-- AI辅助面板 - 悬浮在视口中 -->
        <Teleport to="body">
          <div v-if="showAIPanel" class="ai-panel-backdrop" @click="closeAIPanel">
            <div class="ai-assistant-panel ai-assistant-panel-floating" @click.stop>
              <div class="ai-panel-header">
                <h4>AI 写作助手</h4>
                <button class="ai-close-btn" @click="closeAIPanel">×</button>
              </div>
              <div class="ai-panel-content">
                <div class="ai-input-section">
                  <textarea 
                    v-model="aiInputText" 
                    placeholder="请输入需要处理的文本..."
                    class="ai-input-textarea"
                    rows="4"
                  ></textarea>
                </div>
                <div class="ai-action-buttons">
                  <button 
                    class="ai-action-btn ai-action-polish" 
                    @click="handleAIAction(0)"
                    :disabled="!aiInputText.trim() || aiLoading"
                  >
                    <span v-if="!aiLoading || aiCurrentAction !== 0">润色</span>
                    <span v-else>处理中...</span>
                  </button>
                  <button 
                    class="ai-action-btn ai-action-supplement" 
                    @click="handleAIAction(1)"
                    :disabled="!aiInputText.trim() || aiLoading"
                  >
                    <span v-if="!aiLoading || aiCurrentAction !== 1">补充</span>
                    <span v-else>处理中...</span>
                  </button>
                </div>
                <div v-if="aiResult" class="ai-result-section">
                  <div class="ai-result-header">
                    <span>AI 处理结果：</span>
                  </div>
                  <div class="ai-result-content">
                    <textarea 
                      v-model="aiResult" 
                      class="ai-result-textarea"
                      rows="6"
                      readonly
                    ></textarea>
                  </div>
                  <div class="ai-result-actions">
                    <button class="ai-result-btn ai-result-insert" @click="insertAIResult">
                      插入到编辑器
                    </button>
                    <button class="ai-result-btn ai-result-copy" @click="copyAIResult">
                      复制结果
                    </button>
                    <button class="ai-result-btn ai-result-clear" @click="clearAIResult">
                      清空结果
                    </button>
                  </div>
                </div>
                <div v-if="aiError" :class="['ai-error-message', { 'ai-success-message': aiError.startsWith('✓') }]">
                  {{ aiError }}
                </div>
              </div>
            </div>
          </div>
        </Teleport>
        
        <!-- 教程卡片 -->
        <div class="tutorial-card">
          <div class="tutorial-header">
            <h4>📝 编辑教程</h4>
            <span class="tutorial-badge">新手必看</span>
          </div>
          <div class="tutorial-content">
            <div class="tutorial-item">
              <span class="tutorial-number">1</span>
              <div>
                <strong>上传图片</strong>
                <p>从左侧"截图/教程图"区域拖拽或点击上传图片，图片会自动插入到编辑器中</p>
              </div>
            </div>
            <div class="tutorial-item">
              <span class="tutorial-number">2</span>
              <div>
                <strong>编辑内容</strong>
                <p>使用工具栏格式化文本，插入链接、代码块、表格等丰富内容</p>
              </div>
            </div>
            <div class="tutorial-item">
              <span class="tutorial-number">3</span>
              <div>
                <strong>预览效果</strong>
                <p>点击工具栏的"预览"按钮查看最终效果，确保内容显示正确</p>
              </div>
            </div>
            <div class="tutorial-item">
              <span class="tutorial-number">4</span>
              <div>
                <strong>保存草稿</strong>
                <p>编辑过程中可随时点击"存草稿"保存进度，稍后继续编辑</p>
              </div>
            </div>
            <div class="tutorial-item">
              <span class="tutorial-number">5</span>
              <div>
                <strong>注意事项</strong>
                <p>存草稿最多只允许存5MB以内的数据，注意图片所占内存</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { supabase } from '../supabase.js'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const fileInput = ref(null)
const vditorRef = ref(null)
const authStore = useAuthStore()

// 平台分类映射
const platformCategories = {
  '自动化工作流': ['n8n', 'Zapier', 'Make', 'IFTTT', '扣子', 'Power Automate'],
  '手动协作流': ['n8n', 'Zapier', 'Make', 'IFTTT', '扣子', 'Power Automate'],
  '跨工具集成流': ['n8n', 'Zapier', 'Make', 'IFTTT', '扣子', 'Power Automate'],
  'AI助手型': ['扣子', 'OpenAI', 'Claude', '文心一言', 'Power Automate'],
  '数据处理型': ['扣子', 'OpenAI', 'Claude', '文心一言', 'Power Automate'],
  '决策支持型': ['扣子', 'OpenAI', 'Claude', '文心一言', 'Power Automate'],
  '工具入门': ['n8n', 'Zapier', 'Make', 'IFTTT', '扣子', 'OpenAI', 'Claude', '文心一言', 'Power Automate'],
  '场景案例': ['n8n', 'Zapier', 'Make', 'IFTTT', '扣子', 'OpenAI', 'Claude', '文心一言', 'Power Automate'],
  '故障排查': ['n8n', 'Zapier', 'Make', 'IFTTT', '扣子', 'OpenAI', 'Claude', '文心一言', 'Power Automate']
}



// 表单数据
const formData = reactive({
  contentType: '自动化工作流',
  title: '',
  platforms: [],
  scenes: [],
  attributes: [],
  description: '',
  templateLink: '',
  apiLink: '',
  repositoryLink: '',
  linkType: 'template',
  visibility: '公开',
  accessPassword: '',
  content: '',
  coverImage: '' // 新增封面图片字段
})

// 折叠状态
const collapsedSections = reactive({
  workflow: true,     // 工作流默认折叠
  agent: true,        // 智能体默认折叠
  tutorial: true,     // 教程默认折叠
  platforms: false,   // 必选项默认展开
  scenes: true,       // 非必选项默认折叠
  attributes: true,   // 非必选项默认折叠
  visibility: true    // 非必选项默认折叠
})

// 上传的文件
const uploadedFiles = ref([])

// 封面文件输入引用
const coverFileInput = ref(null)

// 编辑器实例
let vditor = null

// 草稿相关数据
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalType = ref('alert') // alert, confirm
const modalConfirmText = ref('确定')
const modalCancelText = ref('取消')
let modalConfirmCallback = null
let modalCancelCallback = null

// 封面选择相关数据
const showCoverModal = ref(false)
const coverImageFile = ref(null)
const coverImagePreview = ref('')
const coverUploadStep = ref('upload') // upload, preview

// AI辅助相关数据
const showAITooltip = ref(false) // 气泡提示
const showAIPanel = ref(false)
const aiInputText = ref('')
const aiResult = ref('')
const aiError = ref('')
const aiLoading = ref(false)
const aiCurrentAction = ref(null) // 0=润色, 1=补充
let cursorIdleTimer = null
let tooltipTimer = null // 气泡提示定时器
let lastInputTime = 0
let lastCursorPosition = null
let isInputDetected = false
const DIFY_API_URL = 'https://dify.aipfuture.com/v1'
const DIFY_API_KEY = 'app-ubRloSwWqJJk4TIk1A6VndlS'

// 根据内容类型筛选平台
const filteredPlatforms = computed(() => {
  const category = platformCategories[formData.contentType] || []
  return category
})

// 表单验证
const isFormValid = computed(() => {
  const hasValidLink = () => {
    switch (formData.linkType) {
      case 'template':
        return formData.templateLink.trim()
      case 'api':
        return formData.apiLink.trim()
      case 'repository':
        return formData.repositoryLink.trim()
      default:
        return false
    }
  }
  
  return formData.title.trim() && 
         formData.platforms.length > 0 && 
         formData.description.trim() && 
         hasValidLink()
})

// 切换折叠状态
const toggleSection = (section) => {
  collapsedSections[section] = !collapsedSections[section]
}

// 初始化编辑器
onMounted(() => {
  // 确保DOM元素存在
  const vditorElement = document.getElementById('vditor')
  if (!vditorElement) {
    console.error('Vditor container not found')
    return
  }

  try {
    // 使用 nextTick 确保 DOM 完全渲染
    setTimeout(() => {
      vditor = new Vditor('vditor', {
        height: 800,
        placeholder: '请输入详细内容...',
        theme: 'classic',
        icon: 'material',
        // 默认所见即所得模式
        mode: 'wysiwyg',
        lang: 'zh_CN',
        toolbar: [
          'emoji',
          'headings',
          'bold',
          'italic',
          'strike',
          'link',
          '|',
          'list',
          'ordered-list',
          'check',
          'outdent',
          'indent',
          '|',
          'quote',
          'line',
          'code',
          'inline-code',
          '|',
          'table',
          '|',
          'undo',
          'redo',
          '|',
          'edit-mode',
          '|',
          'fullscreen',
          'preview'
        ],
        cache: {
          enable: false
        },
        input: (value) => {
          formData.content = value
          // 检测到输入，重置定时器
          handleEditorInput()
        },
        focus: (value) => {
          console.log('编辑器获得焦点', value)
          // 开始检测光标空闲
          startCursorIdleDetection()
        },
        blur: (value) => {
          console.log('编辑器失去焦点', value)
          // 停止检测
          stopCursorIdleDetection()
          // 隐藏AI气泡提示
          hideAITooltip()
        },
        upload: {
          accept: 'image/*',
          handler: (files) => {
            // 处理图片上传
            const file = files[0]
            if (file) {
              return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onload = (e) => {
                  resolve([e.target.result])
                }
                reader.readAsDataURL(file)
              })
            }
          }
        },
        after: () => {
          // 在 Vditor 初始化完成后，绑定到内部可编辑区域
          bindEditorClipboardAndDnd()
          // 绑定编辑器事件用于检测光标位置
          setupCursorDetection()
        }
      })
      
      // 兜底：延时再绑定一次，避免极端情况下未获取到内部元素
      setTimeout(() => {
        bindEditorClipboardAndDnd()
        // 同时设置光标检测
        setupCursorDetection()
      }, 500)
    }, 100)
    
    // 兜底：延时再绑定一次，避免极端情况下未获取到内部元素
    setTimeout(() => {
      bindEditorClipboardAndDnd()
      // 同时设置光标检测
      setupCursorDetection()
    }, 500)
  } catch (error) {
    console.error('Vditor 初始化失败:', error)
  }
})

// 组件销毁时清理编辑器
onUnmounted(() => {
  // 清理AI检测定时器
  stopCursorIdleDetection()
  // 清理气泡提示定时器
  if (tooltipTimer) {
    clearTimeout(tooltipTimer)
    tooltipTimer = null
  }
  
  if (vditor) {
    vditor.destroy()
    vditor = null
  }
  // 清理编辑区事件监听
  unbindEditorClipboardAndDnd()
})

// 文件上传相关方法
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleDragOver = (event) => {
  event.preventDefault()
  event.currentTarget.style.borderColor = '#007bff'
  event.currentTarget.style.backgroundColor = 'rgba(0,123,255,0.05)'
}

const handleDragLeave = (event) => {
  event.currentTarget.style.borderColor = '#ddd'
  event.currentTarget.style.backgroundColor = 'transparent'
}

const handleDrop = (event) => {
  event.preventDefault()
  event.currentTarget.style.borderColor = '#ddd'
  event.currentTarget.style.backgroundColor = 'transparent'
  
  if (event.dataTransfer.files.length) {
    const files = event.dataTransfer.files
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'].includes(file.type)
    )
    
    if (imageFiles.length > 0) {
      // 如果有图片文件，直接插入到编辑器中
      insertImagesToEditor(imageFiles)
    } else {
      // 非图片文件，按原逻辑处理
      processFiles(files)
    }
  }
}

// 编辑区粘贴/拖拽图片（直达编辑器）
let boundEditorEl = null

const getVditorEditableEl = () => {
  try {
    if (!vditor || !vditor.vditor) return null
    // wysiwyg 优先，其次 ir/sv
    return (
      (vditor.vditor.wysiwyg && vditor.vditor.wysiwyg.element) ||
      (vditor.vditor.ir && vditor.vditor.ir.element) ||
      (vditor.vditor.sv && vditor.vditor.sv.element) ||
      null
    )
  } catch (e) {
    return null
  }
}

const bindEditorClipboardAndDnd = () => {
  const el = getVditorEditableEl()
  if (!el || el === boundEditorEl) return
  unbindEditorClipboardAndDnd()
  el.addEventListener('paste', editorPasteHandler)
  el.addEventListener('drop', editorDropHandler)
  el.addEventListener('dragover', editorDragOverHandler)
  boundEditorEl = el
}

const unbindEditorClipboardAndDnd = () => {
  if (!boundEditorEl) return
  boundEditorEl.removeEventListener('paste', editorPasteHandler)
  boundEditorEl.removeEventListener('drop', editorDropHandler)
  boundEditorEl.removeEventListener('dragover', editorDragOverHandler)
  boundEditorEl = null
}

const editorPasteHandler = (event) => {
  const clipboard = event.clipboardData || window.clipboardData
  if (!clipboard) return
  const files = clipboard.files && clipboard.files.length ? clipboard.files : null
  const items = clipboard.items || []
  const imageFiles = []
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (f && f.type && f.type.startsWith('image/')) imageFiles.push(f)
    }
  } else {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item && item.type && item.type.startsWith('image/')) {
        const file = item.getAsFile && item.getAsFile()
        if (file) imageFiles.push(file)
      }
    }
  }
  if (imageFiles.length > 0) {
    event.preventDefault()
    insertImagesToEditor(imageFiles)
  }
}

const editorDropHandler = (event) => {
  event.preventDefault()
  const dt = event.dataTransfer
  if (!dt) return
  const files = dt.files
  if (!files || files.length === 0) return
  const imageFiles = Array.from(files).filter(file => 
    file.type && file.type.startsWith('image/') &&
    ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'].includes(file.type)
  )
  if (imageFiles.length > 0) {
    insertImagesToEditor(imageFiles)
  }
}

const editorDragOverHandler = (event) => {
  event.preventDefault()
}

const handleFileSelect = (event) => {
  if (event.target.files.length) {
    const files = event.target.files
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'].includes(file.type)
    )
    
    if (imageFiles.length > 0) {
      // 如果有图片文件，直接插入到编辑器中
      insertImagesToEditor(imageFiles)
    } else {
      // 非图片文件，按原逻辑处理
      processFiles(files)
    }
  }
}

const processFiles = (files) => {
  const newFiles = Array.from(files).slice(0, 5 - uploadedFiles.value.length)
  
  newFiles.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      alert(`文件 ${file.name} 超过5MB限制`)
      return
    }
    
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'].includes(file.type)) {
      alert(`文件 ${file.name} 格式不支持`)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedFiles.value.push({
        file: file,
        name: file.name,
        preview: e.target.result
      })
    }
    reader.readAsDataURL(file)
  })
}

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

// 弹窗相关方法
const showAlert = (title, message, confirmText = '确定') => {
  modalTitle.value = title
  modalMessage.value = message
  modalType.value = 'alert'
  modalConfirmText.value = confirmText
  showModal.value = true
  
  return new Promise((resolve) => {
    modalConfirmCallback = resolve
  })
}

const showConfirm = (title, message, confirmText = '确定', cancelText = '取消') => {
  modalTitle.value = title
  modalMessage.value = message
  modalType.value = 'confirm'
  modalConfirmText.value = confirmText
  modalCancelText.value = cancelText
  showModal.value = true
  
  return new Promise((resolve) => {
    modalConfirmCallback = () => resolve(true)
    modalCancelCallback = () => resolve(false)
  })
}

const closeModal = () => {
  showModal.value = false
  modalConfirmCallback = null
  modalCancelCallback = null
}

const handleConfirmAction = () => {
  if (modalConfirmCallback) {
    modalConfirmCallback()
  }
  closeModal()
}

const handleCancelAction = () => {
  if (modalCancelCallback) {
    modalCancelCallback()
  }
  closeModal()
}

const handleModalOverlayClick = () => {
  closeModal()
}

// 草稿相关方法
const saveDraft = async () => {
  try {
    // 构建草稿数据，使用与发布相同的结构
    const draftData = {
      article_title: formData.title,
      description: formData.description,
      content: vditor ? vditor.getValue() : '',
      
      // 链接信息
      link_type: formData.linkType,
      template_link: formData.templateLink,
      api_link: formData.apiLink,
      repository_link: formData.repositoryLink,
      
      // 平台信息
      platforms: formData.platforms,
      
      // 将内容类型、应用场景、属性、可见范围打包成JSON
      tags: JSON.stringify({
        content_type: formData.contentType,
        scenes: formData.scenes,
        attributes: formData.attributes,
        visibility: formData.visibility,
        access_password: formData.accessPassword
      }),
      
      // 上传的文件信息
      uploaded_files: uploadedFiles.value.map(file => ({
        name: file.name,
        preview: file.preview
      })),
      
      timestamp: new Date().getTime()
    }
    
    // 检查数据大小（限制5MB）
    const dataSize = new Blob([JSON.stringify(draftData)]).size
    if (dataSize > 5 * 1024 * 1024) {
      await showAlert('存储失败', '草稿数据超过5MB限制，请减少图片数量或大小')
      return
    }
    
    localStorage.setItem('edit_draft', JSON.stringify(draftData))
    await showAlert('保存成功', '草稿已成功保存到本地')
    
  } catch (error) {
    console.error('保存草稿失败:', error)
    await showAlert('保存失败', '草稿保存失败，请重试')
  }
}

const loadDraft = () => {
  try {
    const draftData = localStorage.getItem('edit_draft')
    if (draftData) {
      const parsedData = JSON.parse(draftData)
      
      // 恢复表单数据（新结构）
      formData.title = parsedData.article_title || ''
      formData.description = parsedData.description || ''
      formData.content = parsedData.content || ''
      
      // 恢复链接信息
      formData.linkType = parsedData.link_type || 'template'
      formData.templateLink = parsedData.template_link || ''
      formData.apiLink = parsedData.api_link || ''
      formData.repositoryLink = parsedData.repository_link || ''
      
      // 恢复平台信息
      formData.platforms = parsedData.platforms || []
      
      // 恢复tags中的配置信息
      if (parsedData.tags) {
        const tags = JSON.parse(parsedData.tags)
        formData.contentType = tags.content_type || '自动化工作流'
        formData.scenes = tags.scenes || []
        formData.attributes = tags.attributes || []
        formData.visibility = tags.visibility || '公开'
        formData.accessPassword = tags.access_password || ''
      }
      
      // 恢复编辑器内容
      if (vditor && parsedData.content) {
        vditor.setValue(parsedData.content)
      }
      
      // 恢复上传的文件
      if (parsedData.uploaded_files) {
        uploadedFiles.value = parsedData.uploaded_files
      }
      
      return true
    }
  } catch (error) {
    console.error('加载草稿失败:', error)
  }
  return false
}

const clearDraft = () => {
  localStorage.removeItem('edit_draft')
}

// 检查是否有草稿数据
const hasDraft = () => {
  return !!localStorage.getItem('edit_draft')
}

// 页面离开提示
const setupBeforeUnload = () => {
  const handleBeforeUnload = async (e) => {
    if (hasDraft()) {
      e.preventDefault()
      e.returnValue = ''
      
      const confirmed = await showConfirm(
        '离开页面提示',
        '您有未保存的草稿，确定要离开吗？离开后将丢失草稿数据。',
        '确定离开',
        '继续编辑'
      )
      
      if (confirmed) {
        clearDraft()
      } else {
        // 阻止页面离开
        return false
      }
    }
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // 清理函数
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
}

// 页面加载时检查草稿
const checkDraftOnLoad = async () => {
  if (hasDraft()) {
    const confirmed = await showConfirm(
      '恢复草稿',
      '检测到上次编辑的草稿，是否恢复？',
      '恢复草稿',
      '重新开始'
    )
    
    if (confirmed) {
      loadDraft()
      await showAlert('恢复成功', '草稿已成功恢复')
    } else {
      const confirmedCancel = await showConfirm(
        '确认取消',
        '取消后将失去草稿数据，确认吗？',
        '确认取消',
        '重新考虑'
      )
      
      if (confirmedCancel) {
        clearDraft()
        await showAlert('已清除', '草稿数据已清除')
      } else {
        // 用户重新考虑，再次询问是否恢复
        checkDraftOnLoad()
      }
    }
  }
}

// 发布处理
const handleSubmit = async () => {
  if (!isFormValid.value) {
    await showAlert('发布失败', '请填写完整的必填信息')
    return
  }
  
  const confirmed = await showConfirm(
    '确认发布',
    '确定要发布此内容吗？发布后将对其他用户可见。',
    '确认发布',
    '再检查一下'
  )
  
  if (confirmed) {
    // 显示封面选择弹窗
    showCoverModal.value = true
  }
}

// 封面选择相关函数
const triggerCoverUpload = () => {
  if (coverFileInput.value) {
    coverFileInput.value.click()
  }
}

const handleCoverFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 检查文件类型和大小
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/bmp'].includes(file.type)) {
      showAlert('格式错误', '请选择JPG、PNG、GIF、WebP或BMP格式的图片')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showAlert('文件过大', '封面图片不能超过5MB')
      return
    }
    
    // 读取文件并显示预览
    const reader = new FileReader()
    reader.onload = (e) => {
      coverImageFile.value = file
      coverImagePreview.value = e.target.result
      coverUploadStep.value = 'preview'
    }
    reader.readAsDataURL(file)
  }
}

const resetCoverUpload = () => {
  coverImageFile.value = null
  coverImagePreview.value = ''
  coverUploadStep.value = 'upload'
  
  // 清空文件输入
  if (coverFileInput.value) {
    coverFileInput.value.value = ''
  }
}

const nextStep = () => {
  if (coverImagePreview.value) {
    coverUploadStep.value = 'preview'
  }
}

const skipCover = async () => {
  // 跳过封面，直接发布
  await publishArticle()
}

const confirmCover = async () => {
  // 确认封面，发布文章
  await publishArticle()
}

const closeCoverModal = () => {
  showCoverModal.value = false
  resetCoverUpload()
}

const handleCoverModalOverlayClick = () => {
  closeCoverModal()
}

// 上传封面图片到 Supabase Storage（适配自定义认证）
const uploadCoverImage = async (file) => {
  if (!file) return null
  
  try {
    // 清理文件名，只保留英文字母、数字、下划线和连字符
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    
    // 生成唯一的文件名，包含用户ID（如果可用）
    const currentUser = authStore.user
    const userId = currentUser?.id || 'anonymous'
    const fileName = `covers/${userId}/${Date.now()}_${cleanFileName}`
    
    console.log('开始上传封面图片:', fileName)
    
    // 使用当前Supabase客户端上传（存储桶策略已设置为宽松）
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('封面图片上传失败:', error)
      
      // 检查存储桶是否存在
      const bucketExists = await checkStorageBucketExists()
      if (!bucketExists) {
        throw new Error('存储桶配置缺失，请先运行数据库迁移脚本创建images存储桶')
      }
      
      // 如果是权限错误，提示用户检查存储桶策略
      if (error.message.includes('row-level security') || error.message.includes('permission')) {
        throw new Error('上传权限错误，请确保存储桶策略允许匿名上传')
      }
      
      throw new Error('封面图片上传失败: ' + error.message)
    }
    
    console.log('封面图片上传成功:', data)
    
    // 获取公开访问URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)
    
    console.log('封面图片公开URL:', publicUrl)
    
    // 直接返回图片URL，不包装成HTML标签
    return publicUrl
  } catch (error) {
    console.error('封面图片处理失败:', error)
    throw error
  }
}

// 检查存储桶是否存在
const checkStorageBucketExists = async () => {
  try {
    // 尝试列出存储桶内容来验证存储桶是否存在
    const { data, error } = await supabase.storage
      .from('images')
      .list('covers', { limit: 1 })
    
    // 如果没有错误或者错误不是"存储桶不存在"，则认为存储桶存在
    if (!error || (error && !error.message.includes('bucket'))) {
      return true
    }
    
    return false
  } catch (error) {
    console.error('检查存储桶失败:', error)
    return false
  }
}

// 实际发布文章的函数
const publishArticle = async () => {
  try {
    // 保存编辑器内容到表单
    if (vditor) {
      formData.content = vditor.getValue()
    }
    
    // 上传封面图片（如果有）
    let coverImageUrl = null
    if (coverImageFile.value) {
      coverImageUrl = await uploadCoverImage(coverImageFile.value)
    }
    
    // 构建文章数据
    const articleData = {
      article_title: formData.title, // 文章标题
      description: formData.description, // 简介
      content: formData.content, // 文章内容
      
      // 链接信息
      link_type: formData.linkType,
      template_link: formData.templateLink,
      api_link: formData.apiLink,
      repository_link: formData.repositoryLink,
      
      // 平台信息
      platforms: formData.platforms,
      
      // 封面图片URL
      cover_image: coverImageUrl,
      
      // 将内容类型、应用场景、属性、可见范围打包成JSON存到tags字段
      tags: JSON.stringify({
        content_type: formData.contentType, // 内容类型
        scenes: formData.scenes, // 应用场景
        attributes: formData.attributes, // 属性
        visibility: formData.visibility, // 可见范围
        access_password: formData.accessPassword // 访问密码（如果有）
      }),
      
      // 上传的文件信息
      uploaded_files: uploadedFiles.value.map(file => ({
        name: file.name,
        preview: file.preview
      })),
      
      // 用户信息
      user_id: getCurrentUserId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // 保存到数据库
    const { data, error } = await supabase
      .from('articles')
      .insert([articleData])
      .select()
    
    if (error) {
      console.error('保存文章失败:', error)
      throw new Error('保存文章失败: ' + error.message)
    }
    
    console.log('文章保存成功:', data)
    
    // 清除草稿
    clearDraft()
    
    // 关闭封面弹窗
    closeCoverModal()    
    await showAlert('发布成功', '内容已成功发布并保存到数据库')
    
    // 跳转到市场页面
    router.push('/market')
    
  } catch (error) {
    console.error('发布失败:', error)
    await showAlert('发布失败', error.message || '发布过程中出现错误，请重试')
  }
}

// 取消编辑
const handleCancel = async () => {
  const confirmed = await showConfirm(
    '确认取消',
    '确定要取消编辑吗？未保存的内容将丢失。',
    '确定取消',
    '继续编辑'
  )
  
  if (confirmed) {
    clearDraft()
    router.push('/market')
  }
}

// 组件挂载时
onMounted(() => {
  // 设置页面离开监听
  setupBeforeUnload()
  
  // 延迟检查草稿，确保编辑器已初始化
  setTimeout(() => {
    checkDraftOnLoad()
  }, 500)
})

// 获取当前用户ID
const getCurrentUserId = () => {
  // 首先尝试从authStore获取
  if (authStore.user && authStore.user.id) {
    return authStore.user.id
  }
  
  // 如果store中没有用户信息，尝试从localStorage获取
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser)
      if (userData && userData.id) {
        return userData.id
      }
    } catch (error) {
      console.error('解析用户数据失败:', error)
    }
  }
  
  // 如果都没有，返回一个有效的用户ID（使用数据库中的admin用户ID）
  console.warn('无法获取当前用户ID，使用默认用户ID')
  return 'dcdd4de9-66a1-4a6b-8b58-3c3324d7b1b4' // admin用户的ID
}

// AI辅助功能相关方法
const startCursorIdleDetection = () => {
  stopCursorIdleDetection()
  
  // 清除之前的定时器
  if (cursorIdleTimer) {
    clearTimeout(cursorIdleTimer)
  }
  
  // 重置输入检测
  isInputDetected = false
  lastInputTime = Date.now()
  
  // 获取初始光标位置
  updateCursorPosition()
  
  // 设置2秒后检测
  cursorIdleTimer = setTimeout(() => {
    checkCursorIdle()
  }, 2000)
}

const stopCursorIdleDetection = () => {
  if (cursorIdleTimer) {
    clearTimeout(cursorIdleTimer)
    cursorIdleTimer = null
  }
  hideAITooltip()
}

const handleEditorInput = () => {
  const now = Date.now()
  lastInputTime = now
  isInputDetected = true
  hideAITooltip() // 输入后隐藏气泡提示
  // 输入后立即隐藏提示，并重新开始检测
  stopCursorIdleDetection()
  // 延迟重新开始检测，避免频繁触发
  setTimeout(() => {
    isInputDetected = false
    startCursorIdleDetection()
  }, 100)
}

const updateCursorPosition = () => {
  try {
    if (!vditor) return
    
    const editableEl = getVditorEditableEl()
    if (!editableEl) return
    
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      lastCursorPosition = {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset
      }
    }
  } catch (error) {
    console.error('更新光标位置失败:', error)
  }
}

const checkCursorIdle = () => {
  const now = Date.now()
  const timeSinceLastInput = now - lastInputTime
  
  // 如果2秒内没有输入，且编辑器仍然有焦点，显示AI气泡提示
  if (timeSinceLastInput >= 2000) {
    const editableEl = getVditorEditableEl()
    if (editableEl && (document.activeElement === editableEl || editableEl.contains(document.activeElement))) {
      // 检查当前是否有选中文本
      const selection = window.getSelection()
      const hasSelection = selection && selection.toString().trim().length > 0
      
      // 只有当没有选中文本时才显示AI气泡提示（避免干扰用户选择）
      if (!hasSelection && !showAIPanel.value) {
        showAITooltip.value = true
        // 5秒后自动隐藏气泡提示
        if (tooltipTimer) {
          clearTimeout(tooltipTimer)
        }
        tooltipTimer = setTimeout(() => {
          hideAITooltip()
        }, 5000)
        return // 显示提示后不再继续检测
      }
    }
  }
  
  // 如果条件不满足，继续检测（但只在编辑器有焦点时）
  const editableEl = getVditorEditableEl()
  if (editableEl && (document.activeElement === editableEl || editableEl.contains(document.activeElement))) {
    startCursorIdleDetection()
  }
}

// 隐藏AI气泡提示
const hideAITooltip = () => {
  showAITooltip.value = false
  if (tooltipTimer) {
    clearTimeout(tooltipTimer)
    tooltipTimer = null
  }
}

const setupCursorDetection = () => {
  const editableEl = getVditorEditableEl()
  if (!editableEl) {
    // 如果还没有可编辑元素，延迟重试
    setTimeout(setupCursorDetection, 300)
    return
  }
  
  // 监听键盘输入（包括中文输入法的composition事件）
  editableEl.addEventListener('input', () => {
    handleEditorInput()
  })
  
  // 监听中文输入法的composition事件
  editableEl.addEventListener('compositionend', () => {
    handleEditorInput()
  })
  
  // 监听键盘按键释放
  editableEl.addEventListener('keyup', (e) => {
    // 排除功能键，只关注可输入字符
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
      updateCursorPosition()
      // 重置检测，重新开始计时
      isInputDetected = false
      lastInputTime = Date.now()
      startCursorIdleDetection()
    }
  })
  
  // 监听点击事件
  editableEl.addEventListener('click', () => {
    updateCursorPosition()
    // 点击后重置检测
    isInputDetected = false
    lastInputTime = Date.now()
    startCursorIdleDetection()
  })
  
  // 监听鼠标释放（可能是拖拽选择后的释放）
  editableEl.addEventListener('mouseup', () => {
    updateCursorPosition()
    // 鼠标释放后重置检测
    isInputDetected = false
    lastInputTime = Date.now()
    startCursorIdleDetection()
  })
  
  // 监听键盘按键按下（用于更精确的输入检测）
  editableEl.addEventListener('keydown', (e) => {
    // 如果是可输入字符，立即标记为有输入
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      isInputDetected = true
      lastInputTime = Date.now()
      hideAITooltip()
    }
  })
}

const toggleAIAssistant = () => {
  hideAITooltip() // 点击按钮时隐藏气泡提示
  showAIPanel.value = !showAIPanel.value
  if (showAIPanel.value) {
    // 如果编辑器中有选中的文本，自动填入
    try {
      const selection = window.getSelection()
      if (selection && selection.toString().trim()) {
        aiInputText.value = selection.toString().trim()
      }
    } catch (error) {
      console.error('获取选中文本失败:', error)
    }
  } else {
    // 关闭面板时，如果用户重新开始编辑，重新开始检测
    setTimeout(() => {
      if (!showAIPanel.value) {
        startCursorIdleDetection()
      }
    }, 500)
  }
}

const closeAIPanel = () => {
  showAIPanel.value = false
  aiInputText.value = ''
  aiResult.value = ''
  aiError.value = ''
  aiLoading.value = false
  aiCurrentAction.value = null
}

const handleAIAction = async (action) => {
  if (!aiInputText.value.trim()) {
    aiError.value = '请输入需要处理的文本'
    return
  }
  
  aiLoading.value = true
  aiCurrentAction.value = action // action 是数字：0=润色, 1=补充
  aiError.value = ''
  aiResult.value = ''
  
  try {
    // 获取当前用户ID（用于Dify API的user参数）
    const currentUser = authStore.user
    const userId = currentUser?.id || getCurrentUserId() || 'anonymous'
    
    // 调用Dify工作流API
    let response = await fetch(`${DIFY_API_URL}/workflows/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`
      },
      body: JSON.stringify({
        inputs: {
          input: aiInputText.value.trim(),
          choose: action // 0=润色, 1=补充
        },
        user: userId, // 添加user参数，这是Dify API要求的
        response_mode: 'blocking' // 阻塞模式，等待结果返回
      })
    })
    
    // 如果第一个端点失败，尝试使用chat-messages端点
    if (!response.ok && response.status === 404) {
      response = await fetch(`${DIFY_API_URL}/chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DIFY_API_KEY}`
        },
        body: JSON.stringify({
          inputs: {
            input: aiInputText.value.trim(),
            choose: action // 0=润色, 1=补充
          },
          user: userId, // 添加user参数
          query: aiInputText.value.trim(),
          response_mode: 'blocking'
        })
      })
    }
    
    if (!response.ok) {
      let errorMessage = `API请求失败: ${response.status} ${response.statusText}`
      // 克隆响应以便读取
      const responseClone = response.clone()
      try {
        const errorData = await responseClone.json()
        console.error('API错误响应:', errorData)
        // 尝试从错误响应中提取更详细的错误信息
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
      } catch (e) {
        // 如果无法解析为JSON，尝试读取文本
        try {
          const errorText = await response.text()
          console.error('API错误响应（文本）:', errorText)
          if (errorText) {
            // 尝试解析JSON字符串
            try {
              const parsedError = JSON.parse(errorText)
              if (parsedError.message) {
                errorMessage = parsedError.message
              } else {
                errorMessage = errorText
              }
            } catch {
              errorMessage = errorText
            }
          }
        } catch (textError) {
          console.error('读取错误响应失败:', textError)
        }
      }
      throw new Error(errorMessage)
    }
    
    const data = await response.json()
    console.log('API响应数据:', data)
    
    // 处理返回结果 - 支持多种可能的响应格式
    let result = ''
    
    // 格式1: data.outputs.xxx
    if (data.data && data.data.outputs) {
      const outputs = data.data.outputs
      // 尝试常见的输出字段名
      result = outputs.output || outputs.text || outputs.result || outputs.content || outputs.message
      
      // 如果还是没有，获取第一个字符串值
      if (!result) {
        for (const key in outputs) {
          if (typeof outputs[key] === 'string') {
            result = outputs[key]
            break
          }
        }
      }
      
      // 如果还是没有，尝试序列化整个outputs对象
      if (!result) {
        result = JSON.stringify(outputs, null, 2)
      }
    }
    // 格式2: 直接在data中
    else if (data.data) {
      result = data.data.output || data.data.text || data.data.result || data.data.content || data.data.message
      if (!result && typeof data.data === 'string') {
        result = data.data
      }
    }
    // 格式3: 在根级别
    else if (data.output || data.text || data.result || data.content || data.message) {
      result = data.output || data.text || data.result || data.content || data.message
    }
    // 格式4: answer字段（常见于chat API）
    else if (data.answer) {
      result = data.answer
    }
    // 格式5: 如果是字符串直接返回
    else if (typeof data === 'string') {
      result = data
    }
    // 格式6: 尝试从event流中获取（如果是流式响应）
    else if (data.event && data.event === 'message' && data.answer) {
      result = data.answer
    }
    // 最后：序列化整个响应
    else {
      result = JSON.stringify(data, null, 2)
    }
    
    if (!result || result.trim() === '') {
      aiError.value = 'AI返回了空结果，请检查工作流配置或重试'
    } else {
      aiResult.value = result
    }
    
  } catch (error) {
    console.error('AI处理失败:', error)
    aiError.value = `处理失败: ${error.message}。请检查网络连接和API配置。`
  } finally {
    aiLoading.value = false
    aiCurrentAction.value = null
  }
}

const insertAIResult = () => {
  if (!aiResult.value || !vditor) return
  
  try {
    // 插入结果到编辑器当前光标位置
    vditor.insertValue(aiResult.value)
    // 清空结果
    aiResult.value = ''
    aiInputText.value = ''
    showAIPanel.value = false
  } catch (error) {
    console.error('插入结果失败:', error)
    aiError.value = '插入结果失败，请重试'
  }
}

const copyAIResult = async () => {
  if (!aiResult.value) return
  
  try {
    await navigator.clipboard.writeText(aiResult.value)
    // 显示成功提示
    const originalError = aiError.value
    aiError.value = '✓ 已复制到剪贴板'
    // 2秒后清除提示
    setTimeout(() => {
      if (aiError.value === '✓ 已复制到剪贴板') {
        aiError.value = originalError
      }
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    aiError.value = '复制失败，请手动复制文本'
  }
}

const clearAIResult = () => {
  aiResult.value = ''
  aiInputText.value = ''
  aiError.value = ''
}

// 将图片插入到编辑器中
const insertImagesToEditor = async (files) => {
  if (!vditor) return
  
  const imageFiles = Array.from(files).slice(0, 5) // 限制最多5张图片
  
  for (const file of imageFiles) {
    if (file.size > 5 * 1024 * 1024) {
      alert(`文件 ${file.name} 超过5MB限制`)
      continue
    }
    
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'].includes(file.type)) {
      alert(`文件 ${file.name} 格式不支持`)
      continue
    }
    
    try {
      // 使用 FileReader 读取图片并插入到编辑器中
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target.result
        // 获取当前光标位置
        const cursorPosition = vditor.getCursorPosition()
        
        // 插入图片到编辑器
        vditor.insertValue(`
![${file.name}](${imageDataUrl})
`)
        
        console.log('图片插入成功:', file.name)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('图片插入失败:', error)
      alert(`图片 ${file.name} 插入失败，请重试`)
    }
  }
}

</script>

<style scoped>
@import '../css/editView.css';
</style>