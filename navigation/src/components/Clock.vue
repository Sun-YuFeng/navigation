<template>
  <div class="clock-container">
    <!-- 时钟模式切换 -->
    <div class="clock-mode-switch">
      <button 
        @click="switchMode('digital')" 
        :class="{ active: clockMode === 'digital' }"
        class="mode-btn"
      >
        <i class="uil uil-clock"></i>
        数字时钟
      </button>
      <button 
        @click="switchMode('analog')" 
        :class="{ active: clockMode === 'analog' }"
        class="mode-btn"
      >
        <i class="uil uil-clock-eight"></i>
        模拟时钟
      </button>
    </div>

    <!-- 数字时钟 -->
    <div v-if="clockMode === 'digital'" class="digital-clock">
      <div class="time-display">
        <div class="time-main">{{ formattedTime }}</div>
        <div class="date-info">
          <div class="date">{{ formattedDate }}</div>
          <div class="day">{{ formattedDay }}</div>
        </div>
      </div>
      
      <!-- 秒表功能 -->
      <div class="stopwatch-section">
        <div class="stopwatch-display">{{ stopwatchTime }}</div>
        <div class="stopwatch-controls">
          <button @click="startStopwatch" :disabled="stopwatchRunning" class="control-btn start">
            <i class="uil uil-play"></i>
          </button>
          <button @click="pauseStopwatch" :disabled="!stopwatchRunning" class="control-btn pause">
            <i class="uil uil-pause"></i>
          </button>
          <button @click="resetStopwatch" class="control-btn reset">
            <i class="uil uil-refresh"></i>
          </button>
        </div>
      </div>

      <!-- 世界时钟 -->
      <div class="world-clocks">
        <h3>世界时钟</h3>
        <div class="world-time-grid">
          <div v-for="city in worldCities" :key="city.name" class="world-time-item">
            <div class="city-name">{{ city.name }}</div>
            <div class="city-time">{{ getWorldTime(city.timezone) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模拟时钟 -->
    <div v-else class="analog-clock">
      <div class="analog-clock-container">
        <!-- 机械时钟 -->
        <div class="clock-face">
          <div class="clock-center"></div>
          <!-- 时钟刻度 -->
          <div v-for="i in 12" :key="i" class="hour-mark" :style="getHourMarkStyle(i)"></div>
          <!-- 时针 -->
          <div class="hand hour-hand" :style="getHourHandStyle()"></div>
          <!-- 分针 -->
          <div class="hand minute-hand" :style="getMinuteHandStyle()"></div>
          <!-- 秒针 -->
          <div class="hand second-hand" :style="getSecondHandStyle()"></div>
        </div>
        
        <!-- 时间数字显示 -->
        <div class="time-display-below">
          <div class="digital-time">{{ formattedTime }}</div>
          <div class="digital-date">{{ formattedDate }}</div>
        </div>
      </div>
    </div>

    <!-- 时钟设置 -->
    <div class="clock-settings">
      <h3>时钟设置</h3>
      <div class="settings-grid">
        <div class="setting-item">
          <label>24小时制</label>
          <input type="checkbox" v-model="use24Hour" class="toggle">
        </div>
        <div class="setting-item">
          <label>显示秒数</label>
          <input type="checkbox" v-model="showSeconds" class="toggle">
        </div>
        <div class="setting-item">
          <label>时钟大小</label>
          <input type="range" v-model="clockSize" min="200" max="400" class="slider">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 响应式数据
const currentTime = ref(new Date())
const clockMode = ref('digital')
const use24Hour = ref(false)
const showSeconds = ref(true)
const clockSize = ref(300)

// 秒表相关
const stopwatchRunning = ref(false)
const stopwatchTime = ref('00:00:00')
const stopwatchStartTime = ref(0)
const stopwatchElapsed = ref(0)
const stopwatchInterval = ref(null)

// 世界时钟城市
const worldCities = ref([
  { name: '北京', timezone: 'Asia/Shanghai' },
  { name: '纽约', timezone: 'America/New_York' },
  { name: '伦敦', timezone: 'Europe/London' },
  { name: '东京', timezone: 'Asia/Tokyo' },
  { name: '悉尼', timezone: 'Australia/Sydney' },
  { name: '巴黎', timezone: 'Europe/Paris' }
])

// 定时器
let timeInterval = null

// 格式化时间
const formattedTime = computed(() => {
  const hours = currentTime.value.getHours()
  const minutes = currentTime.value.getMinutes()
  const seconds = currentTime.value.getSeconds()
  
  const formatHours = use24Hour.value ? hours : (hours % 12 || 12)
  const ampm = use24Hour.value ? '' : (hours < 12 ? ' AM' : ' PM')
  
  if (showSeconds.value) {
    return `${formatHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}${ampm}`
  } else {
    return `${formatHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}${ampm}`
  }
})

// 格式化日期
const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// 格式化星期
const formattedDay = computed(() => {
  return currentTime.value.toLocaleDateString('zh-CN', { weekday: 'long' })
})

// 切换时钟模式
const switchMode = (mode) => {
  clockMode.value = mode
}

// 获取世界时间
const getWorldTime = (timezone) => {
  return new Date().toLocaleTimeString('zh-CN', {
    timeZone: timezone,
    hour12: use24Hour.value,
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds.value ? '2-digit' : undefined
  })
}

// 秒表功能
const startStopwatch = () => {
  if (!stopwatchRunning.value) {
    stopwatchStartTime.value = Date.now() - stopwatchElapsed.value
    stopwatchRunning.value = true
    stopwatchInterval.value = setInterval(updateStopwatch, 10)
  }
}

const pauseStopwatch = () => {
  if (stopwatchRunning.value) {
    stopwatchRunning.value = false
    clearInterval(stopwatchInterval.value)
  }
}

const resetStopwatch = () => {
  stopwatchRunning.value = false
  clearInterval(stopwatchInterval.value)
  stopwatchElapsed.value = 0
  stopwatchTime.value = '00:00:00'
}

const updateStopwatch = () => {
  stopwatchElapsed.value = Date.now() - stopwatchStartTime.value
  const totalSeconds = Math.floor(stopwatchElapsed.value / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor((stopwatchElapsed.value % 1000) / 10)
  
  stopwatchTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
}

// 模拟时钟相关
const getHourMarkStyle = (hour) => {
  const angle = (hour * 30) - 90
  return {
    transform: `rotate(${angle}deg)`,
    transformOrigin: '50% 0%'
  }
}

const getHourHandStyle = () => {
  const hours = currentTime.value.getHours() % 12
  const minutes = currentTime.value.getMinutes()
  const angle = (hours * 30) + (minutes * 0.5) - 90
  return {
    transform: `rotate(${angle}deg)`,
    transformOrigin: '50% 100%'
  }
}

const getMinuteHandStyle = () => {
  const minutes = currentTime.value.getMinutes()
  const seconds = currentTime.value.getSeconds()
  const angle = (minutes * 6) + (seconds * 0.1) - 90
  return {
    transform: `rotate(${angle}deg)`,
    transformOrigin: '50% 100%'
  }
}

const getSecondHandStyle = () => {
  const seconds = currentTime.value.getSeconds()
  const angle = (seconds * 6) - 90
  return {
    transform: `rotate(${angle}deg)`,
    transformOrigin: '50% 100%'
  }
}

// 更新当前时间
const updateTime = () => {
  currentTime.value = new Date()
}

// 组件挂载和卸载
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (stopwatchInterval.value) {
    clearInterval(stopwatchInterval.value)
  }
})
</script>

<style scoped>
.clock-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.clock-mode-switch {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px solid #667eea;
  background: transparent;
  color: #667eea;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.mode-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.mode-btn.active {
  background: #667eea;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* 数字时钟样式 */
.digital-clock {
  text-align: center;
}

.time-display {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  color: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.time-main {
  font-size: 4rem;
  font-weight: 300;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-family: 'Courier New', monospace;
}

.date-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date {
  font-size: 1.2rem;
  opacity: 0.9;
}

.day {
  font-size: 1.1rem;
  opacity: 0.8;
}

/* 秒表样式 */
.stopwatch-section {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.stopwatch-display {
  font-size: 3rem;
  font-weight: 300;
  color: #333;
  margin-bottom: 20px;
  font-family: 'Courier New', monospace;
}

.stopwatch-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.control-btn {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn.start {
  background: #4CAF50;
  color: white;
}

.control-btn.pause {
  background: #FF9800;
  color: white;
}

.control-btn.reset {
  background: #f44336;
  color: white;
}

.control-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 世界时钟样式 */
.world-clocks {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.world-clocks h3 {
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.world-time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.world-time-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  transition: all 0.3s ease;
}

.world-time-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.city-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.city-time {
  font-size: 1.1rem;
  color: #666;
  font-family: 'Courier New', monospace;
}

/* 模拟时钟样式 */
.analog-clock {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.analog-clock-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  max-width: 600px;
  width: 100%;
}

.clock-face {
  position: relative;
  width: v-bind(clockSize + 'px');
  height: v-bind(clockSize + 'px');
  border: 8px solid #333;
  border-radius: 50%;
  background: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.clock-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: #333;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.hour-mark {
  position: absolute;
  top: 10px;
  left: 50%;
  width: 4px;
  height: 30px;
  background: #333;
  transform-origin: 50% 0%;
}

.hand {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 50% 100%;
  border-radius: 5px;
}

.hour-hand {
  width: 8px;
  height: 30%;
  background: #333;
  margin-left: -4px;
  margin-top: -30%;
}

.minute-hand {
  width: 6px;
  height: 40%;
  background: #667eea;
  margin-left: -3px;
  margin-top: -40%;
}

.second-hand {
  width: 2px;
  height: 45%;
  background: #f44336;
  margin-left: -1px;
  margin-top: -45%;
}

.clock-info {
  text-align: center;
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.analog-time {
  font-size: 2rem;
  font-weight: 300;
  color: #333;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
}

.analog-date {
  font-size: 1.1rem;
  color: #666;
}

/* 设置样式 */
.clock-settings {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.clock-settings h3 {
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-item label {
  font-weight: 600;
  color: #333;
}

.toggle {
  width: 50px;
  height: 25px;
  background: #ccc;
  border-radius: 25px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle:checked {
  background: #667eea;
}

.toggle::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 21px;
  height: 21px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle:checked::before {
  transform: translateX(25px);
}

.slider {
  width: 100%;
  height: 5px;
  background: #ddd;
  border-radius: 5px;
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #667eea;
  border-radius: 50%;
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .clock-container {
    padding: 15px;
  }
  
  .time-main {
    font-size: 2.5rem;
  }
  
  .stopwatch-display {
    font-size: 2rem;
  }
  
  .world-time-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .date-info {
    flex-direction: column;
    gap: 10px;
  }
}
</style>

