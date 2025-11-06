<template>
  <div class="clock-container">
    <div class="clock-wrapper">
      <div class="clock-face" ref="clockFaceRef">
        <!-- 整点刻度 -->
        <div
          v-for="(hour, index) in 12"
          :key="index"
          class="hour-mark"
          :style="getHourMarkStyle(index)"
        ></div>
        
        <!-- 时针 -->
        <div
          class="hand hour-hand"
          :style="{ transform: `rotate(${hourAngle}deg)` }"
        ></div>
        
        <!-- 分针 -->
        <div
          class="hand minute-hand"
          :style="{ transform: `rotate(${minuteAngle}deg)` }"
        ></div>
        
        <!-- 秒针 -->
        <div
          class="hand second-hand"
          :style="{ transform: `rotate(${secondAngle}deg)` }"
        ></div>
        
        <!-- 中心点 -->
        <div class="center-dot"></div>
      </div>
      
      <!-- 数字时钟 -->
      <div class="digital-clock">
        <div class="time-display">{{ formattedTime }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const clockFaceRef = ref(null)
const currentTime = ref(new Date())

// 计算时针角度（包含分钟的影响）
const hourAngle = computed(() => {
  const hours = currentTime.value.getHours() % 12
  const minutes = currentTime.value.getMinutes()
  return (hours * 30) + (minutes * 0.5) // 每小时30度，每分钟0.5度
})

// 计算分针角度
const minuteAngle = computed(() => {
  const minutes = currentTime.value.getMinutes()
  const seconds = currentTime.value.getSeconds()
  return (minutes * 6) + (seconds * 0.1) // 每分钟6度，每秒0.1度
})

// 计算秒针角度
const secondAngle = computed(() => {
  return currentTime.value.getSeconds() * 6 // 每秒6度
})

// 格式化时间显示
const formattedTime = computed(() => {
  const hours = currentTime.value.getHours().toString().padStart(2, '0')
  const minutes = currentTime.value.getMinutes().toString().padStart(2, '0')
  const seconds = currentTime.value.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
})

// 获取整点刻度的样式
const getHourMarkStyle = (index) => {
  const angle = index * 30 - 90 // 从12点开始，每个刻度30度
  const radius = 45 // 刻度距离中心的百分比
  const x = 50 + radius * Math.cos((angle * Math.PI) / 180)
  const y = 50 + radius * Math.sin((angle * Math.PI) / 180)
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`
  }
}

// 更新时间
const updateTime = () => {
  currentTime.value = new Date()
}

let intervalId = null

onMounted(() => {
  updateTime()
  intervalId = setInterval(updateTime, 1000) // 每秒更新一次
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.clock-container {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 0px 15px 0 0;
}

.clock-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.clock-face {
  position: relative;
  width: 130px;
  height: 130px;
  border: 5px solid #2c3e50;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  box-shadow: 
    inset 0 0 7px rgba(0, 0, 0, 0.1),
    0 3px 12px rgba(0, 0, 0, 0.3),
    0 0 0 2px #34495e;
}

/* 数字时钟 */
.digital-clock {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  background: transparent;
}

.time-display {
  font-family: 'SF Pro Display', 'Helvetica Neue', 'Segoe UI', sans-serif;
  font-size: 20px;
  font-weight: 300;
  color: #ffffff;
  letter-spacing: 3px;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(255, 255, 255, 0.15);
  opacity: 0.95;
}

/* 整点刻度 */
.hour-mark {
  position: absolute;
  width: 1.8px;
  height: 9px;
  background: #2c3e50;
  transform-origin: center;
}

/* 指针 */
.hand {
  position: absolute;
  background: #2c3e50;
  transform-origin: bottom center;
  left: 50%;
  top: 50%;
  border-radius: 2px 2px 0 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.hour-hand {
  width: 3px;
  height: 26px;
  margin-left: -1.5px;
  margin-top: -26px;
  background: linear-gradient(to top, #2c3e50, #34495e);
}

.minute-hand {
  width: 2.2px;
  height: 39px;
  margin-left: -1.1px;
  margin-top: -39px;
  background: linear-gradient(to top, #2c3e50, #34495e);
}

.second-hand {
  width: 1px;
  height: 46px;
  margin-left: -0.5px;
  margin-top: -46px;
  background: #e74c3c;
  box-shadow: 0 0 2px rgba(231, 76, 60, 0.5);
}

/* 中心点 */
.center-dot {
  position: absolute;
  width: 9px;
  height: 9px;
  background: #2c3e50;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 
    0 0 0 1px #f5f7fa,
    0 1px 2px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .clock-face {
    width: 110px;
    height: 110px;
    border-width: 4px;
  }
  
  .hour-mark {
    width: 1.5px;
    height: 7px;
  }
  
  .hour-hand {
    width: 2.5px;
    height: 22px;
    margin-left: -1.25px;
    margin-top: -22px;
  }
  
  .minute-hand {
    width: 2px;
    height: 33px;
    margin-left: -1px;
    margin-top: -33px;
  }
  
  .second-hand {
    width: 1px;
    height: 39px;
    margin-left: -0.5px;
    margin-top: -39px;
  }
  
  .center-dot {
    width: 8px;
    height: 8px;
  }
  
  .time-display {
    font-size: 16px;
    letter-spacing: 2.5px;
  }
}

@media (max-width: 480px) {
  .clock-face {
    width: 90px;
    height: 90px;
    border-width: 3.5px;
  }
  
  .hour-mark {
    width: 1.3px;
    height: 6px;
  }
  
  .hour-hand {
    width: 2.2px;
    height: 18px;
    margin-left: -1.1px;
    margin-top: -18px;
  }
  
  .minute-hand {
    width: 1.8px;
    height: 27px;
    margin-left: -0.9px;
    margin-top: -27px;
  }
  
  .second-hand {
    width: 1px;
    height: 32px;
    margin-left: -0.5px;
    margin-top: -32px;
  }
  
  .center-dot {
    width: 7px;
    height: 7px;
  }
  
  .time-display {
    font-size: 14px;
    letter-spacing: 2px;
  }
}
</style>
