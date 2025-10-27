<template>
  <div class="programming-tools-container">
    <h2 class="section-title">
      <i v-if="icon" :class="icon" class="title-icon"></i>
      {{ title }}
    </h2>
    <div class="cards-wrapper">
      <div 
        v-for="(tool, index) in tools" 
        :key="index" 
        class="card"
        @click="handleToolClick(tool)"
      >
        <div class="card-icon-container">
          <img :src="tool.icon" :alt="tool.title + '图标'" class="card-icon">
        </div>
        <div class="card-text">
          <h3 class="card-title">{{ tool.title }}</h3>
          <p class="card-desc">{{ tool.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ProgrammingTools',
  props: {
    title: {
      type: String,
      default: '编程工具'
    },
    icon: {
      type: String,
      default: ''
    },
    tools: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleToolClick(tool) {
      this.$emit('tool-click', tool)
    }
  }
})
</script>

<style scoped>
.programming-tools-container {
  max-width: 1200px;
  height: 240px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 板块标题 */
.section-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 12px;
  padding-left: 6px;
  border-left: 3px solid #2f5496;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 标题图标 */
.title-icon {
  font-size: 20px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 卡片容器 */
.cards-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  height: calc(100% - 40px); /* 减去标题高度和间距 */
  overflow-y: auto; /* 允许滚动 */
}

/* 单个卡片样式 - 改为左右布局 */
.card {
  display: flex;
  align-items: center; /* 垂直居中 */
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  padding: 8px;
  transition: all 0.3s ease;
  height: 50px; /* 固定卡片高度 */
  overflow: hidden;
}

/* 左侧正方形图标区域 */
.card-icon-container {
  width: 45px; /* 正方形宽度 */
  height: 45px; /* 正方形高度，与卡片内容区高度一致 */
  flex-shrink: 0; /* 不缩小 */
  margin-right: 8px; /* 与文字区间距 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 卡片图标 - 适应正方形区域 */
.card-icon {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 右侧文字区域 */
.card-text {
  flex-grow: 1; /* 占满剩余空间 */
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 卡片标题 */
.card-title {
  font-size: 13px;
  color: #333;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 卡片描述 */
.card-desc {
  font-size: 11px;
  color: #666;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* 响应式适配 - 调整列数 */
@media (min-width: 1200px) {
  .card {
    width: calc(16.666% - 6.666px); /* 6列布局 */
  }
}

@media (max-width: 1200px) {
  .card {
    width: calc(20% - 6.4px); /* 5列 */
  }
}

@media (max-width: 992px) {
  .card {
    width: calc(25% - 6px); /* 4列 */
  }
}

@media (max-width: 768px) {
  .card {
    width: calc(33.333% - 5.333px); /* 3列 */
  }
}

@media (max-width: 576px) {
  .card {
    width: calc(50% - 4px); /* 2列 */
  }
}

@media (max-width: 400px) {
  .card {
    width: 100%; /* 1列 */
  }
}
</style>