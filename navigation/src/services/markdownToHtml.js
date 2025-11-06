/**
 * Markdown 转 HTML 解码器
 * 将 Vditor 编辑器保存的 Markdown 格式转换为 HTML 标签
 */

/**
 * 将 Markdown 文本转换为 HTML
 * @param {string} markdown - Markdown 格式的文本
 * @returns {string} HTML 格式的文本
 */
export const markdownToHtml = (markdown) => {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }

  let html = markdown
  const fencedCodeBlocks = []

  // 1. 处理代码块（必须在其他处理之前，避免代码块内容被转换）
  // 先占位，避免后续标题/列表/强调等规则误解析代码内容
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang ? ` class=\"language-${lang}\"` : ''
    const escapedCode = escapeHtml(code.replace(/\r?\n$/, ''))
    const blockHtml = `<div class=\"md-code-block\" style=\"background:#f7f8fa;border:1px solid #e9ecef;border-radius:6px;padding:12px;overflow:auto;margin:12px 0;\">\n<pre style=\"margin:0;min-width:0;\"><code${language}>${escapedCode}</code></pre>\n</div>`
    const token = `__FENCED_CODE_BLOCK_${fencedCodeBlocks.length}__`
    fencedCodeBlocks.push(blockHtml)
    return token
  })

  // 2. 处理行内代码（在代码块之后，但在其他格式化之前）
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const escapedCode = escapeHtml(code)
    return `<code>${escapedCode}</code>`
  })

  // 3. 处理分割线（单独一行，前后空行）
  html = html.replace(/^(\s*)(---|\*\*\*|___)(\s*)$/gm, '<hr>')

  // 4. 处理引用块（> 后接空格，多行引用可每行行首加 >）
  // 使用占位符标记引用行
  const quotePlaceholders = []
  html = html.replace(/^(\s*)>(.+)$/gm, (match, indent, content) => {
    const placeholder = `__QUOTE_${quotePlaceholders.length}__`
    quotePlaceholders.push({
      placeholder,
      content: content.trim(),
      indent: indent.length
    })
    return placeholder
  })

  // 处理连续的引用块并合并
  let quoteGroups = []
  let currentGroup = []

  quotePlaceholders.forEach((item, index) => {
    if (currentGroup.length === 0 || item.indent === currentGroup[0].indent) {
      currentGroup.push(item)
    } else {
      if (currentGroup.length > 0) {
        quoteGroups.push([...currentGroup])
      }
      currentGroup = [item]
    }
  })

  if (currentGroup.length > 0) {
    quoteGroups.push(currentGroup)
  }

  // 替换占位符为 blockquote 标签
  quoteGroups.forEach(group => {
    const content = group.map(item => item.content).join('<br>')
    const blockquote = `<blockquote>${content}</blockquote>`
    group.forEach(item => {
      html = html.replace(item.placeholder, group.indexOf(item) === 0 ? blockquote : '')
    })
  })

  // 5. 处理标题（# H1 - ###### H6）
  html = html.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
    const level = hashes.length
    const trimmedText = text.trim()
    return `<h${level}>${trimmedText}</h${level}>`
  })

  // 6. 处理表格（先处理表格，避免被其他规则影响）
  // 匹配表格块：表头行 + 分隔行 + 数据行
  html = html.replace(/(\|[^\n]+\|\n\|[-\s:|]+\|\n(?:\|[^\n]+\|\n?)+)/g, (match) => {
    const lines = match.trim().split('\n')
    if (lines.length < 2) return match

    // 第一行是表头
    const headerLine = lines[0]
    // 第二行是分隔行，跳过
    // 其余行是数据行

    let tableHtml = '<table>\n<thead><tr>\n'
    const headerCells = headerLine.split('|').map(cell => cell.trim()).filter(cell => cell)
    headerCells.forEach(cell => {
      tableHtml += `<th>${processInlineFormatting(cell)}</th>\n`
    })
    tableHtml += '</tr></thead>\n'

    if (lines.length > 2) {
      tableHtml += '<tbody>\n'
      for (let i = 2; i < lines.length; i++) {
        const cells = lines[i].split('|').map(cell => cell.trim()).filter(cell => cell)
        if (cells.length > 0) {
          tableHtml += '<tr>\n'
          cells.forEach(cell => {
            tableHtml += `<td>${processInlineFormatting(cell)}</td>\n`
          })
          tableHtml += '</tr>\n'
        }
      }
      tableHtml += '</tbody>\n'
    }

    tableHtml += '</table>'
    return tableHtml
  })

  // 7. 处理列表（无序列表、有序列表、待办列表）
  // 收集所有列表项
  const listItems = []
  const lines = html.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 待办列表：- [ ] 或 - [x]
    const todoMatch = line.match(/^(\s*)(-|\*)\s+\[([ x])\]\s+(.+)$/)
    if (todoMatch) {
      const [, indent, , checked, text] = todoMatch
      const isChecked = checked.toLowerCase() === 'x'
      listItems.push({
        index: i,
        indent: indent.length,
        type: 'todo',
        checked: isChecked,
        text: text.trim(),
        original: line
      })
      continue
    }

    // 无序列表：- 或 *
    const ulMatch = line.match(/^(\s*)(-|\*)\s+(.+)$/)
    if (ulMatch) {
      const [, indent, , text] = ulMatch
      listItems.push({
        index: i,
        indent: indent.length,
        type: 'ul',
        text: text.trim(),
        original: line
      })
      continue
    }

    // 有序列表：1. 2. 等
    const olMatch = line.match(/^(\s*)(\d+\.)\s+(.+)$/)
    if (olMatch) {
      const [, indent, , text] = olMatch
      listItems.push({
        index: i,
        indent: indent.length,
        type: 'ol',
        text: text.trim(),
        original: line
      })
      continue
    }
  }

  // 处理列表项并包装
  if (listItems.length > 0) {
    html = processListItems(html, listItems, lines)
  }

  // 8. 处理图片（![alt](url "title")）
  // 支持多种图片格式：普通 URL、data URI（base64）、相对路径
  // 支持的图片格式：png, jpg, jpeg, gif, webp, bmp, svg, ico
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]*)")?\)/g, (match, alt, url, title) => {
    // 处理 alt 文本中的图片后缀名（如：下载.png）
    let processedAlt = alt.trim()

    // 如果 alt 包含图片后缀，提取文件名
    const imageExtRegex = /\.(png|jpg|jpeg|gif|webp|bmp|svg|ico)$/i
    const altMatch = processedAlt.match(imageExtRegex)

    // 检查 URL 是否为 data URI (data:image/xxx;base64,xxxxx)
    // 支持所有图片格式的 data URI
    const isDataUri = /^data:image\/[^;]+;base64,/i.test(url.trim())

    // 如果 URL 是 data URI，保持原样（不需要转义，因为 base64 字符串是安全的）
    // 如果 URL 是普通 URL，需要转义特殊字符
    let processedUrl = url.trim()
    if (!isDataUri) {
      // 对于普通 URL，转义 HTML 特殊字符
      processedUrl = escapeHtml(processedUrl)
    }

    // 处理 alt 属性
    let altText = escapeHtml(processedAlt)
    // 如果 alt 为空但 URL 包含图片后缀，尝试从 URL 提取文件名
    if (!altText && !isDataUri) {
      const urlMatch = processedUrl.match(/([^\/]+\.(png|jpg|jpeg|gif|webp|bmp|svg|ico))$/i)
      if (urlMatch) {
        altText = escapeHtml(urlMatch[1])
      }
    }

    // 如果没有 alt 文本，使用默认值
    if (!altText) {
      altText = '图片'
    }

    // 处理 title 属性
    const titleAttr = title ? ` title=\"${escapeHtml(title)}\"` : ''

    // 生成 img 标签，限制最大宽度不超过 1050px
    return `<img src=\"${processedUrl}\" alt=\"${altText}\"${titleAttr} style=\"max-width:1050px; height:auto;\">`
  })

  // 9. 处理段落（将连续的非空行包裹成段落）
  html = html.replace(/\n\n+/g, '\n\n') // 规范化空行
  html = wrapParagraphs(html)

  // 10. 处理换行（单个换行转换为 <br>）
  html = html.replace(/\n/g, '<br>')

  // 11. 恢复占位的代码块
  if (fencedCodeBlocks.length > 0) {
    fencedCodeBlocks.forEach((blockHtml, idx) => {
      const token = new RegExp(`__FENCED_CODE_BLOCK_${idx}__`, 'g')
      html = html.replace(token, blockHtml)
    })
  }

  return html
}

/**
 * 处理行内格式化（加粗、斜体、删除线、链接）
 * @param {string} text - 需要处理的文本
 * @returns {string} 处理后的 HTML
 */
const processInlineFormatting = (text) => {
  if (!text) return ''

  let html = text

  // 处理删除线（~~text~~）
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>')

  // 处理加粗（**text** 或 __text__）
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')

  // 处理斜体（*text* 或 _text_），但要避免与加粗冲突
  // 先处理加粗，再处理单独的 * 和 _
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>')

  // 处理链接（[text](url "title")）
  html = html.replace(/\[([^\]]+)\]\(([^)]+)(?:\s+"([^"]*)")?\)/g, (match, linkText, url, title) => {
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''
    return `<a href="${url}"${titleAttr}>${linkText}</a>`
  })

  return html
}

/**
 * 处理列表项并包装到 ul/ol 标签中
 * @param {string} html - 原始 HTML 文本
 * @param {Array} listItems - 列表项数组
 * @param {Array} lines - 行数组
 * @returns {string} 处理后的 HTML
 */
const processListItems = (html, listItems, lines) => {
  // 按索引分组处理列表项
  const processedLines = [...lines]
  const processedIndices = new Set()

  // 按索引分组连续列表项
  const groups = []
  let currentGroup = null

  for (const item of listItems) {
    if (processedIndices.has(item.index)) continue

    // 检查是否应该开始新组
    if (!currentGroup ||
      item.indent !== currentGroup.indent ||
      item.type !== currentGroup.type ||
      item.index !== currentGroup.items[currentGroup.items.length - 1].index + 1) {
      if (currentGroup) {
        groups.push(currentGroup)
      }
      currentGroup = {
        startIndex: item.index,
        indent: item.indent,
        type: item.type,
        items: [item]
      }
    } else {
      currentGroup.items.push(item)
    }

    processedIndices.add(item.index)
  }

  if (currentGroup) {
    groups.push(currentGroup)
  }

  // 从后往前处理，避免索引变化
  groups.reverse().forEach(group => {
    const { startIndex, indent, type, items } = group

    // 生成列表 HTML
    let listHtml = ''
    if (type === 'todo') {
      listHtml = '<ul class="todo-list">\n'
      items.forEach(item => {
        const checkedAttr = item.checked ? ' checked' : ''
        listHtml += `  <li><input type="checkbox"${checkedAttr} disabled> ${processInlineFormatting(item.text)}</li>\n`
      })
      listHtml += '</ul>'
    } else {
      const tagName = type === 'ol' ? 'ol' : 'ul'
      listHtml = `<${tagName}>\n`
      items.forEach(item => {
        listHtml += `  <li>${processInlineFormatting(item.text)}</li>\n`
      })
      listHtml += `</${tagName}>`
    }

    // 替换原行
    processedLines[startIndex] = listHtml

    // 删除其他列表项行
    for (let i = items.length - 1; i >= 1; i--) {
      processedLines.splice(startIndex + i, 1)
    }
  })

  return processedLines.join('\n')
}

/**
 * 将文本包装成段落
 * @param {string} html - HTML 文本
 * @returns {string} 处理后的 HTML
 */
const wrapParagraphs = (html) => {
  const lines = html.split('\n')
  const result = []
  let currentParagraph = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // 跳过空行
    if (!line) {
      if (currentParagraph.length > 0) {
        result.push(`<p>${currentParagraph.join(' ')}</p>`)
        currentParagraph = []
      }
      continue
    }

    // 跳过已经是 HTML 标签的行（标题、列表、代码块等）
    if (
      /^<(h[1-6]|ul|ol|li|table|blockquote|hr|pre|code|img|a)/.test(line) ||
      /^<input/.test(line)
    ) {
      if (currentParagraph.length > 0) {
        result.push(`<p>${currentParagraph.join(' ')}</p>`)
        currentParagraph = []
      }
      result.push(line)
      continue
    }

    // 收集段落内容
    currentParagraph.push(line)
  }

  // 处理最后一段
  if (currentParagraph.length > 0) {
    result.push(`<p>${currentParagraph.join(' ')}</p>`)
  }

  return result.join('\n')
}

/**
 * 转义 HTML 特殊字符
 * @param {string} text - 需要转义的文本
 * @returns {string} 转义后的文本
 */
const escapeHtml = (text) => {
  if (!text) return ''
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * 清理多余的 <br> 标签
 * @param {string} html - HTML 文本
 * @returns {string} 清理后的 HTML
 */
export const cleanHtml = (html) => {
  if (!html) return ''

  // 移除块级元素前后的 <br>
  html = html.replace(/(<br>\s*)+<(h[1-6]|p|ul|ol|li|table|blockquote|hr|pre|code)/g, '<$2')
  html = html.replace(/<\/(h[1-6]|p|ul|ol|li|table|blockquote|hr|pre|code)>(\s*<br>)+/g, '</$1>')

  // 移除连续的 <br>
  html = html.replace(/(<br>\s*){2,}/g, '<br>')

  return html.trim()
}

/**
 * 完整转换函数（包含清理步骤）
 * @param {string} markdown - Markdown 格式的文本
 * @returns {string} 清理后的 HTML
 */
export const convertMarkdownToHtml = (markdown) => {
  const html = markdownToHtml(markdown)
  return cleanHtml(html)
}

