<script setup>
import { ref, computed } from 'vue'

// 计算器状态
const displayValue = ref('0')
const previousValue = ref(null)
const operator = ref(null)
const waitingForOperand = ref(false)
// 记录上一次等号运算，用于连续按等号
const lastOperator = ref(null)
const lastOperand = ref(null)

// 数字按钮点击
const inputDigit = (digit) => {
  if (waitingForOperand.value) {
    displayValue.value = String(digit)
    waitingForOperand.value = false
  } else {
    displayValue.value = displayValue.value === '0' ? String(digit) : displayValue.value + digit
  }
}

// 小数点按钮点击
const inputDot = () => {
  if (waitingForOperand.value) {
    displayValue.value = '0.'
    waitingForOperand.value = false
    return
  }
  
  if (displayValue.value.indexOf('.') === -1) {
    displayValue.value += '.'
  }
}

// 清除按钮（只清当前输入，保留当前运算符与 previousValue）
const clearDisplay = () => {
  displayValue.value = '0'
  waitingForOperand.value = false
}

// 全部清除
const clearAll = () => {
  displayValue.value = '0'
  previousValue.value = null
  operator.value = null
  waitingForOperand.value = false
  // 重置连续等号相关状态
  lastOperator.value = null
  lastOperand.value = null
}

// 百分比转换
const inputPercent = () => {
  const value = parseFloat(displayValue.value)
  displayValue.value = String(value / 100)
}

// 正负号切换
const toggleSign = () => {
  displayValue.value = String(-parseFloat(displayValue.value))
}

// 执行计算
const performOperation = (nextOperator) => {
  const inputValue = parseFloat(displayValue.value)

  // 如果正在等待下一个操作数，仅切换运算符，不计算
  if (waitingForOperand.value && operator.value) {
    operator.value = nextOperator
    return
  }

  if (previousValue.value === null) {
    previousValue.value = inputValue
  } else if (operator.value) {
    const currentValue = previousValue.value || 0
    const newValue = calculate(currentValue, inputValue, operator.value)

    // 除零或溢出处理
    if (!isFinite(newValue)) {
      displayValue.value = 'Error'
      previousValue.value = null
      operator.value = null
      waitingForOperand.value = true
      return
    }

    displayValue.value = String(newValue)
    previousValue.value = newValue
  }

  waitingForOperand.value = true
  operator.value = nextOperator
}

// 计算逻辑
const calculate = (firstValue, secondValue, operation) => {
  switch (operation) {
    case '+':
      return firstValue + secondValue
    case '-':
      return firstValue - secondValue
    case '×':
      return firstValue * secondValue
    case '÷':
      return secondValue === 0 ? NaN : firstValue / secondValue
    default:
      return secondValue
  }
}

// 等于按钮
const handleEquals = () => {
  const inputValue = parseFloat(displayValue.value)

  if (previousValue.value !== null && operator.value) {
    const result = calculate(previousValue.value, inputValue, operator.value)

    if (!isFinite(result)) {
      displayValue.value = 'Error'
      previousValue.value = null
      operator.value = null
      waitingForOperand.value = true
      return
    }

    displayValue.value = String(result)
    previousValue.value = null
    operator.value = null
    waitingForOperand.value = true
  }
}

// 格式化显示值
const formattedDisplay = computed(() => {
  const s = displayValue.value

  // 错误提示原样显示
  if (s === 'Error') return s

  // 保留用户正在输入的小数点或尾随零（如 0.、1.0、1.000）
  if (s.endsWith('.')) return s
  if (/\.0+$/.test(s)) return s

  // 用户正在输入时不做数值格式化，避免丢失视觉信息
  if (!waitingForOperand.value) return s

  const value = parseFloat(s)
  if (isNaN(value)) return '0'

  // 处理大数字和小数的显示
  if (Math.abs(value) > 999999999999) {
    return value.toExponential(6)
  }

  // 处理小数位数
  const stringValue = value.toString()
  if (stringValue.includes('.')) {
    const [integer, decimal] = stringValue.split('.')
    if (integer.length > 12) {
      return value.toExponential(6)
    }
    if (decimal.length > 6) {
      return value.toFixed(6).replace(/\.?0+$/, '')
    }
  }

  return stringValue.length > 12 ? value.toExponential(6) : stringValue
})
</script>

<template>
  <div class="calculator">
    <!-- 显示区域 -->
    <div class="calculator-display">
      <div class="display-value">{{ formattedDisplay }}</div>
    </div>
    
    <!-- 按钮区域 -->
    <div class="calculator-buttons">
      <button class="btn function" @click="clearDisplay">CE</button>
      <button class="btn function" @click="clearAll">AC</button>
      <button class="btn function" @click="toggleSign">±</button>
      <button class="btn function" @click="inputPercent">%</button>
      <button class="btn operator" :class="{ active: operator === '÷' && waitingForOperand }" @click="performOperation('÷')">÷</button>
      
      <button class="btn number" @click="inputDigit(7)">7</button>
      <button class="btn number" @click="inputDigit(8)">8</button>
      <button class="btn number" @click="inputDigit(9)">9</button>
      <button class="btn operator" :class="{ active: operator === '×' && waitingForOperand }" @click="performOperation('×')">×</button>
      
      <button class="btn number" @click="inputDigit(4)">4</button>
      <button class="btn number" @click="inputDigit(5)">5</button>
      <button class="btn number" @click="inputDigit(6)">6</button>
      <button class="btn operator" :class="{ active: operator === '-' && waitingForOperand }" @click="performOperation('-')">-</button>
      
      <button class="btn number" @click="inputDigit(1)">1</button>
      <button class="btn number" @click="inputDigit(2)">2</button>
      <button class="btn number" @click="inputDigit(3)">3</button>
      <button class="btn operator" :class="{ active: operator === '+' && waitingForOperand }" @click="performOperation('+')">+</button>
      
      <button class="btn number zero" @click="inputDigit(0)">0</button>
      <button class="btn number" @click="inputDot">.</button>
      <button class="btn equals" @click="handleEquals">=</button>
    </div>
  </div>
</template>

<style scoped>
.calculator {
  background: #1a1a1a;
  border-radius: 20px;
  padding: 20px;
  max-width: 320px;
  margin: 0 auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.calculator-display {
  background: #000;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: right;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.display-value {
  color: white;
  font-size: 2.5rem;
  font-weight: 300;
  word-break: break-all;
  line-height: 1;
}

.calculator-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.btn {
  border: none;
  border-radius: 50%;
  height: 70px;
  font-size: 1.5rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.btn:active {
  transform: scale(0.95);
}

.btn.number {
  background: #333;
  color: white;
}

.btn.number:hover {
  background: #444;
}

.btn.zero {
  grid-column: span 2;
  border-radius: 35px;
}

.btn.operator {
  background: #ff9500;
  color: white;
}

.btn.operator:hover {
  background: #ffaa33;
}

.btn.operator.active {
  background: white;
  color: #ff9500;
}

.btn.function {
  background: #a6a6a6;
  color: black;
}

.btn.function:hover {
  background: #b8b8b8;
}

.btn.equals {
  background: #ff9500;
  color: white;
}

.btn.equals:hover {
  background: #ffaa33;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .calculator {
    max-width: 280px;
    padding: 15px;
  }
  
  .btn {
    height: 60px;
    font-size: 1.3rem;
  }
  
  .display-value {
    font-size: 2rem;
  }
}

/* 动画效果 */
.btn {
  transition: all 0.15s ease;
}

.btn:active {
  transition: all 0.05s ease;
}
</style>