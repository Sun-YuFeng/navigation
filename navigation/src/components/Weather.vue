<template>
  <div class="weather-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>正在获取天气信息...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>获取天气信息失败</h3>
      <p>{{ error }}</p>
      <button @click="fetchWeather" class="retry-btn">重试</button>
    </div>

    <!-- 城市选择 -->
    <div v-if="!loading && !error" class="city-selector">
      <div class="city-input-group">
        <input 
          v-model="selectedCity" 
          @keyup.enter="searchWeatherByCity"
          placeholder="支持城市：石家庄、北京、上海、广州、深圳、杭州、南京、成都、武汉、西安"
          class="city-input"
        />
        <button @click="searchWeatherByCity" class="search-btn">
          <i class="uil uil-search"></i>
          搜索
        </button>
      </div>
    </div>

    <!-- 天气信息显示 -->
    <div v-else-if="weatherData" class="weather-card">
      <!-- 位置信息 -->
      <div class="location-info">
        <h2 class="city-name">{{ weatherData.name }}</h2>
        <p class="country">{{ weatherData.sys.country }}</p>
        <p class="last-updated">最后更新: {{ formatTime(weatherData.dt) }}</p>
      </div>

      <!-- 主要天气信息 -->
      <div class="main-weather">
        <div class="temperature-section">
          <div class="temp-main">{{ Math.round(weatherData.main.temp) }}°</div>
          <div class="temp-feels">体感温度 {{ Math.round(weatherData.main.feels_like) }}°</div>
        </div>
        <div class="weather-icon-section">
          <div class="weather-icon">
            <i :class="getWeatherIcon(weatherData.weather[0].main)"></i>
          </div>
          <div class="weather-desc">{{ weatherData.weather[0].description }}</div>
        </div>
      </div>

      <!-- 详细天气信息 -->
      <div class="weather-details">
        <div class="detail-item">
          <div class="detail-icon">💧</div>
          <div class="detail-info">
            <span class="detail-label">湿度</span>
            <span class="detail-value">{{ weatherData.main.humidity }}%</span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-icon">💨</div>
          <div class="detail-info">
            <span class="detail-label">风速</span>
            <span class="detail-value">{{ weatherData.wind.speed }} m/s</span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-icon">👁️</div>
          <div class="detail-info">
            <span class="detail-label">能见度</span>
            <span class="detail-value">{{ (weatherData.visibility / 1000).toFixed(1) }} km</span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-icon">📊</div>
          <div class="detail-info">
            <span class="detail-label">气压</span>
            <span class="detail-value">{{ weatherData.main.pressure }} hPa</span>
          </div>
        </div>
      </div>

      <!-- 温度范围 -->
      <div class="temp-range">
        <div class="temp-min">
          <span class="temp-label">最低</span>
          <span class="temp-value">{{ Math.round(weatherData.main.temp_min) }}°</span>
        </div>
        <div class="temp-max">
          <span class="temp-label">最高</span>
          <span class="temp-value">{{ Math.round(weatherData.main.temp_max) }}°</span>
        </div>
      </div>

      <!-- 刷新按钮 -->
      <button @click="fetchWeather" class="refresh-btn" :disabled="loading">
        <i class="uil uil-refresh" :class="{ 'spinning': loading }"></i>
        刷新天气
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const weatherData = ref(null)
const loading = ref(false)
const error = ref(null)
const selectedCity = ref('石家庄')

// 获取用户位置（使用高德地图API）
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    // 检查高德地图API是否已加载
    if (typeof AMap === 'undefined') {
      reject(new Error('高德地图API未加载，请检查网络连接'))
      return
    }

    // 使用高德地图获取位置
    AMap.plugin('AMap.Geolocation', () => {
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        convert: true,
        showButton: false,
        buttonPosition: 'LB',
        showMarker: false,
        showCircle: false,
        panToLocation: false,
        zoomToAccuracy: false
      })

      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
          resolve({
            lat: result.position.lat,
            lon: result.position.lng,
            city: result.addressComponent.city || result.addressComponent.province
          })
        } else {
          reject(new Error('无法获取位置信息，请检查位置权限设置'))
        }
      })
    })
  })
}

// 城市天气数据映射
const cityWeatherData = {
  '石家庄': { baseTemp: 18, weather: '多云', humidity: 70, pressure: 1015 },
  '北京': { baseTemp: 15, weather: '晴朗', humidity: 60, pressure: 1020 },
  '上海': { baseTemp: 20, weather: '小雨', humidity: 80, pressure: 1008 },
  '广州': { baseTemp: 25, weather: '多云', humidity: 75, pressure: 1010 },
  '深圳': { baseTemp: 26, weather: '晴朗', humidity: 70, pressure: 1012 },
  '杭州': { baseTemp: 19, weather: '阴', humidity: 65, pressure: 1018 },
  '南京': { baseTemp: 17, weather: '小雨', humidity: 85, pressure: 1005 },
  '成都': { baseTemp: 16, weather: '雾', humidity: 90, pressure: 1000 },
  '武汉': { baseTemp: 21, weather: '多云', humidity: 75, pressure: 1015 },
  '西安': { baseTemp: 14, weather: '晴朗', humidity: 55, pressure: 1025 }
}

// 获取固定天气数据
const getMockWeatherData = () => {
  const now = new Date()
  const hour = now.getHours()
  const cityName = selectedCity.value || '石家庄'
  const cityData = cityWeatherData[cityName] || cityWeatherData['石家庄']
  
  // 根据时间段调整温度
  let temp = cityData.baseTemp
  if (hour >= 6 && hour < 12) {
    temp = cityData.baseTemp - 2  // 早晨较凉
  } else if (hour >= 12 && hour < 18) {
    temp = cityData.baseTemp + 4  // 下午较热
  } else if (hour >= 18 && hour < 22) {
    temp = cityData.baseTemp + 1  // 傍晚
  } else {
    temp = cityData.baseTemp - 4  // 夜晚较冷
  }
  
  return {
    name: cityName,
    sys: { country: "CN" },
    dt: Math.floor(now.getTime() / 1000),
    main: {
      temp: temp,
      feels_like: temp + 2,
      humidity: cityData.humidity,
      pressure: cityData.pressure,
      temp_min: temp - 3,
      temp_max: temp + 3
    },
    weather: [{
      main: getWeatherMain(cityData.weather),
      description: cityData.weather
    }],
    wind: { speed: 2.5 + Math.random() * 2 },
    visibility: 8000 + Math.random() * 2000
  }
}

// 等待高德地图API加载完成
const waitForAMap = () => {
  return new Promise((resolve, reject) => {
    if (typeof AMap !== 'undefined') {
      resolve()
      return
    }
    
    let attempts = 0
    const maxAttempts = 50 // 最多等待5秒
    
    const checkAMap = () => {
      attempts++
      if (typeof AMap !== 'undefined') {
        resolve()
      } else if (attempts >= maxAttempts) {
        reject(new Error('高德地图API加载超时'))
      } else {
        setTimeout(checkAMap, 100)
      }
    }
    
    checkAMap()
  })
}

// 获取天气数据（使用固定数据）
const fetchWeather = async () => {
  try {
    loading.value = true
    error.value = null

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 使用固定天气数据
    weatherData.value = getMockWeatherData()
    
    console.log('使用石家庄固定天气数据，部署后可配置真实API')

  } catch (err) {
    console.error('获取天气数据失败:', err.message)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// 转换高德天气描述为标准格式
const getWeatherMain = (weatherDesc) => {
  const weatherMap = {
    '晴': 'Clear',
    '多云': 'Clouds',
    '阴': 'Clouds',
    '雨': 'Rain',
    '小雨': 'Rain',
    '中雨': 'Rain',
    '大雨': 'Rain',
    '暴雨': 'Rain',
    '雷阵雨': 'Thunderstorm',
    '雪': 'Snow',
    '小雪': 'Snow',
    '中雪': 'Snow',
    '大雪': 'Snow',
    '雾': 'Mist',
    '霾': 'Mist'
  }
  return weatherMap[weatherDesc] || 'Clear'
}

// 获取天气图标
const getWeatherIcon = (weatherMain) => {
  const iconMap = {
    'Clear': 'uil uil-sun',
    'Clouds': 'uil uil-clouds',
    'Rain': 'uil uil-cloud-rain',
    'Drizzle': 'uil uil-cloud-drizzle',
    'Thunderstorm': 'uil uil-thunderstorm',
    'Snow': 'uil uil-snowflake',
    'Mist': 'uil uil-fog',
    'Fog': 'uil uil-fog',
    'Haze': 'uil uil-fog',
    'Dust': 'uil uil-wind',
    'Sand': 'uil uil-wind',
    'Ash': 'uil uil-wind',
    'Squall': 'uil uil-wind',
    'Tornado': 'uil uil-tornado'
  }
  return iconMap[weatherMain] || 'uil uil-cloud'
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 搜索指定城市的天气
const searchWeatherByCity = () => {
  if (selectedCity.value.trim()) {
    fetchWeather()
  }
}

// 组件挂载时获取天气数据
onMounted(() => {
  fetchWeather()
})
</script>

<style scoped>
.weather-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.city-selector {
  margin-bottom: 20px;
}

.city-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.city-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
}

.city-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-btn {
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.loading-container, .error-container {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.retry-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: white;
  color: #ff6b6b;
}

.weather-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  color: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.weather-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.location-info {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.city-name {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.country {
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 10px;
}

.last-updated {
  font-size: 12px;
  opacity: 0.7;
}

.main-weather {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.temperature-section {
  flex: 1;
}

.temp-main {
  font-size: 64px;
  font-weight: 300;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.temp-feels {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 5px;
}

.weather-icon-section {
  text-align: center;
}

.weather-icon {
  font-size: 48px;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.weather-desc {
  font-size: 16px;
  text-transform: capitalize;
  opacity: 0.9;
}

.weather-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.detail-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.detail-icon {
  font-size: 24px;
  margin-right: 15px;
}

.detail-info {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 2px;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
}

.temp-range {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.temp-min, .temp-max {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex: 1;
  margin: 0 5px;
}

.temp-label {
  display: block;
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 5px;
}

.temp-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
}

.refresh-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 15px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .weather-container {
    padding: 15px;
  }
  
  .weather-card {
    padding: 20px;
  }
  
  .main-weather {
    flex-direction: column;
    text-align: center;
  }
  
  .temp-main {
    font-size: 48px;
  }
  
  .weather-details {
    grid-template-columns: 1fr;
  }
  
  .temp-range {
    flex-direction: column;
    gap: 10px;
  }
  
  .temp-min, .temp-max {
    margin: 0;
  }
}
</style>
