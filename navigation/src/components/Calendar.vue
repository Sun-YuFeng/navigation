<template>
  <div class="calendar-card">
    <div class="calendar-header">
      <h3>{{ title }}</h3>
      <div class="calendar-controls">
        <button @click="previousMonth" class="nav-btn">‹</button>
        <span class="current-month">{{ currentMonthYear }}</span>
        <button @click="nextMonth" class="nav-btn">›</button>
      </div>
    </div>
    
    <div class="calendar-wrapper">
      <div class="calendar-grid">
        <!-- 星期标题 -->
        <div class="weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">
            {{ day }}
          </div>
        </div>
        
        <!-- 日期网格 -->
        <div class="days-grid">
          <div
            v-for="day in calendarDays"
            :key="`${day.date}-${day.month}`"
            :class="[
              'day-cell',
              {
                'other-month': !day.isCurrentMonth,
                'today': day.isToday,
                'selected': day.isSelected
              }
            ]"
            @click="selectDate(day)"
          >
            <span class="day-number">{{ day.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'Calendar',
  props: {
    title: {
      type: String,
      default: '日历'
    }
  },
  emits: ['date-selected', 'date-clicked'],
  setup(props, { emit }) {
    const currentDate = ref(new Date())
    const selectedDate = ref(null)
    
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    
    const currentMonthYear = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth() + 1
      return `${year}年${month}月`
    })
    
    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      const today = new Date()
      
      // 获取当月第一天和最后一天
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      // 获取第一天是星期几（0-6）
      const firstDayOfWeek = firstDay.getDay()
      
      // 获取上个月的最后几天
      const prevMonth = new Date(year, month, 0)
      const prevMonthLastDay = prevMonth.getDate()
      
      const days = []
      
      // 添加上个月的末尾几天
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = prevMonthLastDay - i
        days.push({
          date,
          month: month - 1,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          hasEvents: false
        })
      }
      
      // 添加当月的所有天
      for (let date = 1; date <= lastDay.getDate(); date++) {
        const dayDate = new Date(year, month, date)
        const isToday = dayDate.toDateString() === today.toDateString()
        const isSelected = selectedDate.value && 
          dayDate.toDateString() === selectedDate.value.toDateString()
        
        days.push({
          date,
          month,
          isCurrentMonth: true,
          isToday,
          isSelected
        })
      }
      
      // 添加下个月的开头几天，填满6行
      const remainingDays = 42 - days.length
      for (let date = 1; date <= remainingDays; date++) {
        days.push({
          date,
          month: month + 1,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false
        })
      }
      
      return days
    })
    
    
    const selectDate = (day) => {
      if (!day.isCurrentMonth) return
      
      const selectedDateObj = new Date(currentDate.value.getFullYear(), day.month, day.date)
      selectedDate.value = selectedDateObj
      
      emit('date-selected', selectedDateObj)
      emit('date-clicked', {
        date: selectedDateObj,
        day: day
      })
    }
    
    const previousMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
      )
    }
    
    const nextMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
      )
    }
    
    onMounted(() => {
      // 初始化时选择今天
      const today = new Date()
      selectedDate.value = today
    })
    
    return {
      currentDate,
      selectedDate,
      weekdays,
      currentMonthYear,
      calendarDays,
      selectDate,
      previousMonth,
      nextMonth
    }
  }
}
</script>

<style scoped>
.calendar-card {
  max-width: 400px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.calendar-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.calendar-header h3 {
  margin: 0 0 15px 0;
  font-size: 1.2em;
  font-weight: 600;
}

.calendar-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.current-month {
  font-size: 1.1em;
  font-weight: 500;
  min-width: 120px;
}

.calendar-wrapper {
  padding: 20px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #666;
  padding: 8px 0;
  font-size: 0.9em;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  border-radius: 6px;
  transition: all 0.2s;
  background: #f8f9fa;
}

.day-cell:hover {
  background: #e9ecef;
}

.day-cell.other-month {
  color: #ccc;
  background: transparent;
}

.day-cell.other-month:hover {
  background: #f8f9fa;
}

.day-cell.today {
  background: #007bff;
  color: white;
  font-weight: 600;
}

.day-cell.today:hover {
  background: #0056b3;
}

.day-cell.selected {
  background: #28a745;
  color: white;
  font-weight: 600;
}

.day-cell.selected:hover {
  background: #1e7e34;
}

.day-number {
  font-size: 0.9em;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .calendar-card {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
  }
  
  .calendar-header {
    padding: 15px;
  }
  
  .calendar-wrapper {
    padding: 15px;
  }
  
  .day-cell {
    font-size: 0.8em;
  }
}
</style>
