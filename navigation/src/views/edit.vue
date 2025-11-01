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
    
    <div class="container">
      <!-- 左栏：配置项区域 -->
      <div class="config-panel">
        <!-- 截图/教程图区域 - 分离到最上面 -->
        <div class="image-upload-section">
          <h3>截图/教程图</h3>
          <div class="file-upload" @click="triggerFileInput" @dragover.prevent="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop">
            <p>点击或拖拽文件至此处上传（最多5张）</p>
            <p>支持JPG、PNG、GIF格式，单张不超过5MB</p>
            <input type="file" ref="fileInput" multiple accept="image/jpg,image/png,image/gif" style="display: none;" @change="handleFileSelect">
          </div>
          <div v-if="uploadedFiles.length > 0" class="file-preview">
            <div v-for="(file, index) in uploadedFiles" :key="index" class="preview-item">
              <img :src="file.preview" alt="预览图" />
              <span class="file-name">{{ file.name }}</span>
              <button @click="removeFile(index)" class="remove-btn">×</button>
            </div>
          </div>
        </div>

        <h2>发布配置</h2>
        <hr style="margin: 15px 0; border: none; border-top: 1px solid #eee;">
        
        <div class="form-group">
          <label>内容类型</label>
          <div class="radio-group">
            <label><input type="radio" v-model="formData.contentType" value="工作流" checked> 工作流</label>
            <label><input type="radio" v-model="formData.contentType" value="智能体"> 智能体</label>
            <label><input type="radio" v-model="formData.contentType" value="教程"> 教程</label>
          </div>
        </div>

        <div class="form-group">
          <label>标题 <span class="required-mark">*</span></label>
          <input type="text" v-model="formData.title" placeholder="请输入标题（不超过50字）" maxlength="50">
        </div>

        <div class="form-group">
          <label>所属平台 <span class="required-mark">*</span></label>
          <div class="checkbox-group">
            <label><input type="checkbox" v-model="formData.platforms" value="n8n"> n8n</label>
            <label><input type="checkbox" v-model="formData.platforms" value="Zapier"> Zapier</label>
            <label><input type="checkbox" v-model="formData.platforms" value="Make"> Make</label>
            <label><input type="checkbox" v-model="formData.platforms" value="扣子"> 扣子</label>
          </div>
        </div>

        <div class="form-group">
          <label>应用场景</label>
          <div class="checkbox-group">
            <label><input type="checkbox" v-model="formData.scenes" value="办公自动化"> 办公自动化</label>
            <label><input type="checkbox" v-model="formData.scenes" value="数据处理"> 数据处理</label>
            <label><input type="checkbox" v-model="formData.scenes" value="内容创作"> 内容创作</label>
            <label><input type="checkbox" v-model="formData.scenes" value="开发工具"> 开发工具</label>
            <label><input type="checkbox" v-model="formData.scenes" value="生活服务"> 生活服务</label>
          </div>
        </div>

        <div class="form-group">
          <label>属性</label>
          <div class="checkbox-group">
            <label><input type="checkbox" v-model="formData.attributes" value="开源免费"> 开源免费</label>
            <label><input type="checkbox" v-model="formData.attributes" value="商业付费"> 商业付费</label>
            <label><input type="checkbox" v-model="formData.attributes" value="个人原创"> 个人原创</label>
          </div>
        </div>

        <div class="form-group">
          <label>简介 <span class="required-mark">*</span></label>
          <textarea v-model="formData.description" placeholder="请简要描述内容功能、使用方法等（不超过50字）" rows="3" maxlength="200"></textarea>
        </div>

        <div class="form-group">
          <label>链接/代码 <span class="required-mark">*</span></label>
          <input type="text" v-model="formData.link" placeholder="工作流链接、API地址或开源仓库地址">
        </div>

        <div class="form-group">
          <label>可见范围</label>
          <select v-model="formData.visibility">
            <option value="公开">公开（所有人可见）</option>
            <option value="私有">私有（仅自己可见）</option>
          </select>
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
          <button class="draft" type="button" @click="saveDraft">存草稿</button>
        </div>
        <div id="vditor" ref="vditorRef"></div>
        
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

const router = useRouter()
const fileInput = ref(null)
const vditorRef = ref(null)

// 表单数据
const formData = reactive({
  contentType: '工作流',
  title: '',
  platforms: [],
  scenes: [],
  attributes: [],
  description: '',
  link: '',
  visibility: '公开',
  content: ''
})

// 上传的文件
const uploadedFiles = ref([])

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

// 表单验证
const isFormValid = computed(() => {
  return formData.title.trim() && 
         formData.platforms.length > 0 && 
         formData.description.trim() && 
         formData.link.trim()
})

// 初始化编辑器
onMounted(() => {
  vditor = new Vditor('vditor', {
    height: 600,
    placeholder: '请输入详细内容...',
    theme: 'classic',
    icon: 'material',
    type: 'wysiwyg',
    mode: 'sv',
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
      'insert-before',
      'insert-after',
      '|',
      'table',
      '|',
      'undo',
      'redo',
      '|',
      'edit-mode',
      'content-theme',
      'code-theme',
      'export',
      '|',
      'fullscreen',
      'preview',
      'outline'
    ],
    toolbarConfig: {
      pin: true
    },
    cache: {
      enable: false
    },
    input: (value) => {
      formData.content = value
    },
    focus: (value) => {
      console.log('编辑器获得焦点', value)
    },
    blur: (value) => {
      console.log('编辑器失去焦点', value)
    },
    select: (value) => {
      console.log('编辑器选中内容', value)
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
    hint: {
      emoji: {
        '😀': '😀 grinning',
        '😃': '😃 smiley',
        '😄': '😄 smile',
        '😁': '😁 grin',
        '😆': '😆 laughing',
        '😅': '😅 sweat_smile',
        '😂': '😂 joy',
        '🤣': '🤣 rofl',
        '😊': '😊 blush',
        '😇': '😇 innocent'
      }
    }
  })
})

// 组件销毁时清理编辑器
onUnmounted(() => {
  if (vditor) {
    vditor.destroy()
    vditor = null
  }
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
      ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
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

const handleFileSelect = (event) => {
  if (event.target.files.length) {
    const files = event.target.files
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && 
      ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
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
    
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
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
    const draftData = {
      formData: { ...formData },
      editorContent: vditor ? vditor.getValue() : '',
      uploadedFiles: uploadedFiles.value,
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
      
      // 恢复表单数据
      Object.assign(formData, parsedData.formData)
      
      // 恢复编辑器内容
      if (vditor && parsedData.editorContent) {
        vditor.setValue(parsedData.editorContent)
      }
      
      // 恢复上传的文件
      if (parsedData.uploadedFiles) {
        uploadedFiles.value = parsedData.uploadedFiles
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
    try {
      // 保存编辑器内容到表单
      if (vditor) {
        formData.content = vditor.getValue()
      }
      
      // 清除草稿
      clearDraft()
      
      // 模拟发布成功
      await showAlert('发布成功', '内容已成功发布')
      
      // 跳转到其他页面
      router.push('/market')
      
    } catch (error) {
      console.error('发布失败:', error)
      await showAlert('发布失败', '发布过程中出现错误，请重试')
    }
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

// 将图片插入到编辑器中
const insertImagesToEditor = async (files) => {
  if (!vditor) return
  
  const imageFiles = Array.from(files).slice(0, 5) // 限制最多5张图片
  
  for (const file of imageFiles) {
    if (file.size > 5 * 1024 * 1024) {
      alert(`文件 ${file.name} 超过5MB限制`)
      continue
    }
    
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.edit-container {
  background-color: #f5f7fa;
  padding: 20px;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 25px;
}

/* 左栏配置区样式 */
.config-panel {
  width: 350px;
  background: #fff;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  height: fit-content;
}

/* 分离的截图/教程图区域样式 */
.image-upload-section {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border: 2px solid #e3f2fd;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
}

.image-upload-section h3 {
  color: #1976d2;
  font-size: 18px;
  margin-bottom: 15px;
  text-align: center;
  font-weight: 600;
}

/* 分离的截图/教程图区域样式 */
.image-upload-section {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border: 2px solid #e3f2fd;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
}

.image-upload-section h3 {
  color: #1976d2;
  font-size: 18px;
  margin-bottom: 15px;
  text-align: center;
  font-weight: 600;
}

/* 右栏编辑区样式 */
.editor-panel {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

/* 教程卡片样式 */
.tutorial-card {
  background: linear-gradient(135deg, #fff9f2 0%, #fff5eb 100%);
  border: 2px solid #ffe8cc;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.1);
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ffe8cc;
}

.tutorial-header h4 {
  color: #ff9800;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.tutorial-badge {
  background: #ff9800;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tutorial-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.tutorial-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.tutorial-number {
  background: #ff9800;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.tutorial-item div {
  flex: 1;
}

.tutorial-item strong {
  color: #333;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.tutorial-item p {
  color: #666;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
}

.form-group {
  margin-bottom: 22px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.radio-group, .checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.radio-group label, .checkbox-group label {
  font-weight: 400;
  color: #444;
  cursor: pointer;
  font-size: 13px;
}

input[type="text"], textarea, select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border 0.3s;
}

input[type="text"]:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.1);
}

.file-upload {
  border: 2px dashed #ddd;
  border-radius: 6px;
  padding: 25px;
  text-align: center;
  margin-top: 10px;
  transition: all 0.3s;
  cursor: pointer;
}

.file-upload:hover {
  border-color: #007bff;
  background-color: rgba(0,123,255,0.02);
}

.file-upload p {
  color: #666;
  font-size: 13px;
  margin-bottom: 10px;
}

.file-preview {
  margin-top: 10px;
}

.preview-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.preview-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
}

.file-name {
  flex: 1;
  font-size: 12px;
  color: #666;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.remove-btn:hover {
  background: #c82333;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  font-size: 14px;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button.cancel {
  background-color: #6c757d;
}

button.cancel:hover {
  background-color: #5a6268;
}

button.draft {
  background-color: #28a745;
}

button.draft:hover {
  background-color: #218838;
}

.required-mark {
  color: red;
  margin-left: 2px;
}

/* 编辑区醒目样式 */
.editor-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-header h3 {
  color: #222;
  font-size: 18px;
  margin-bottom: 0;
}

.editor-header p {
  color: #666;
  font-size: 13px;
}

#vditor {
  min-height: 600px;
  background-color: #fff;
}

/* Vditor 样式调整 */
#vditor .vditor-toolbar {
  border-bottom: 1px solid #e9ecef;
}

#vditor .vditor-content {
  border: none;
}

#vditor .vditor-resize {
  display: none;
}

/* 适配小屏幕 */
@media (max-width: 992px) {
  .container {
    flex-direction: column;
  }
  
  .config-panel {
    width: 100%;
  }
  
  #editor {
    min-height: 400px;
  }
}

/* 自定义弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 14px;
}

.modal-footer {
  padding: 10px 20px 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
}

.modal-btn-primary {
  background: #1976d2;
  color: white;
}

.modal-btn-primary:hover {
  background: #1565c0;
}

.modal-btn-cancel {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.modal-btn-cancel:hover {
  background: #e0e0e0;
}

/* 自定义弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 14px;
}

.modal-footer {
  padding: 10px 20px 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
}

.modal-btn-primary {
  background: #1976d2;
  color: white;
}

.modal-btn-primary:hover {
  background: #1565c0;
}

.modal-btn-cancel {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.modal-btn-cancel:hover {
  background: #e0e0e0;
}
</style>