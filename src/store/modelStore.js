import { defineStore } from 'pinia'
import { parse } from 'papaparse'
import jschardet from 'jschardet'

// 编码标准化函数
const normalizeEncoding = (encoding) => {
  if (!encoding) return 'UTF-8'
  
  encoding = encoding.toLowerCase()
  
  // 常见编码映射
  const mapping = {
    'gb2312': 'GBK',
    'gb_2312': 'GBK',
    'gbk': 'GBK',
    'gb18030': 'GBK',
    'big5': 'BIG5',
    'iso-8859-1': 'ISO-8859-1',
    'windows-1252': 'ISO-8859-1',
    'ascii': 'ISO-8859-1',
    'utf-8': 'UTF-8',
    'utf8': 'UTF-8',
    'utf-8 bom': 'UTF-8',
    'unicodefffe': 'UTF-16BE'
  }
  
  return mapping[encoding] || 'UTF-8'
}

// 增强的GBK解码器（兼容所有浏览器）
const decodeGBK = (uint8Array) => {
  try {
    // 优先使用浏览器原生支持
    return new TextDecoder('GBK').decode(uint8Array)
  } catch (e) {
    try {
      // 回退到GB18030
      return new TextDecoder('gb18030').decode(uint8Array)
    } catch (e) {
      // 最后使用UTF-8
      return new TextDecoder('UTF-8', { fatal: false }).decode(uint8Array)
    }
  }
}

export const useModelStore = defineStore('model', {
 state: () => ({
    currentPage: '欢迎使用 SIA-APC 先进控制与优化软件',
    showDataImportModal: false,
    variables: [],
    selectedVariables: [],
    csvData: null,
    fileInfo: null,
    parseError: null,
    encoding: 'auto',
    encodingOptions: [
      { value: 'auto', label: '自动检测' },
      { value: 'UTF-8', label: 'UTF-8' },
      { value: 'GBK', label: 'GBK/GB2312' },
      { value: 'BIG5', label: 'BIG5(繁体)' },
      { value: 'ISO-8859-1', label: 'ISO-8859-1' }

    ]

  }),

  actions: {
    setCurrentPage(page) {
      this.currentPage = page
    },
    toggleDataImportModal(show) {
      this.showDataImportModal = show
      this.parseError = null
    },
    
    importData(file) {
      return new Promise((resolve, reject) => {
        this.parseError = null
        const reader = new FileReader()
        
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target.result
            const uint8Array = new Uint8Array(arrayBuffer)
            
            // 1. 编码检测逻辑 - 增强版
            let detectedEncoding = this.encoding
            
            if (detectedEncoding === 'auto') {
              // 方法1：使用jschardet进行专业检测
              try {
                // 创建普通数组（jschardet需要）
                const chunk = uint8Array.slice(0, 4096)
                const chunkArray = Array.from(chunk)
                
                const detection = jschardet.detect(chunkArray)
                if (detection && detection.encoding) {
                  detectedEncoding = normalizeEncoding(detection.encoding)
                  console.log('jschardet检测编码:', detection.encoding, '标准化为:', detectedEncoding)
                }
              } catch (detectError) {
                console.warn('jschardet检测失败:', detectError)
              }
              
              // 方法2：中文特征检测（备选）
              if (!detectedEncoding || detectedEncoding === 'UTF-8') {
                try {
                  // 检查文件是否可能包含中文
                  const hasChineseFileName = /[\u4e00-\u9fa5]/.test(file.name)
                  const isLargeFile = file.size > 1024
                  
                  // 获取UTF-8解码样本
                  const utf8Sample = new TextDecoder('UTF-8', { fatal: false }).decode(
                    uint8Array.slice(0, 1024)
                  )
                  
                  // 检查是否包含中文字符
                  const containsChinese = /[\u4e00-\u9fa5]/.test(utf8Sample)
                  
                  // 如果不包含中文但文件名含中文，很可能是GBK
                  if (hasChineseFileName && !containsChinese) {
                    console.log('文件名含中文但内容无中文，尝试GBK编码')
                    detectedEncoding = 'GBK'
                  }
                } catch (fallbackError) {
                  console.warn('中文检测回退失败:', fallbackError)
                }
              }
              
              // 默认使用UTF-8
              if (!detectedEncoding) {
                detectedEncoding = 'UTF-8'
              }
            }
            
            console.log('最终使用编码:', detectedEncoding)
            
            // 2. 增强的解码逻辑
            let content
            try {
              // 特殊处理GBK编码
              if (detectedEncoding === 'GBK') {
                content = decodeGBK(uint8Array)
              } else {
                const decoder = new TextDecoder(detectedEncoding)
                content = decoder.decode(uint8Array)
              }
            } catch (decodeError) {
              console.warn(`解码失败 (${detectedEncoding}), 尝试UTF-8回退:`, decodeError)
              content = new TextDecoder('UTF-8', { fatal: false }).decode(uint8Array)
            }
            
            // 3. 增强的BOM处理
            // 检查UTF-8 BOM (EF BB BF)
            if (content.length >= 3 && 
                content.charCodeAt(0) === 0xEF && 
                content.charCodeAt(1) === 0xBB && 
                content.charCodeAt(2) === 0xBF) {
              content = content.substring(3)
            }
            // 检查UTF-16 BE BOM (FE FF)
            else if (content.length >= 2 && 
                     content.charCodeAt(0) === 0xFE && 
                     content.charCodeAt(1) === 0xFF) {
              content = content.substring(2)
            }
            // 检查UTF-16 LE BOM (FF FE)
            else if (content.length >= 2 && 
                     content.charCodeAt(0) === 0xFF && 
                     content.charCodeAt(1) === 0xFE) {
              content = content.substring(2)
            }
            // 检查标准BOM (U+FEFF)
            else if (content.charCodeAt(0) === 0xFEFF) {
              content = content.substring(1)
            }
            
            // 调试：输出前100个字符
            
            // 4. 解析CSV内容 (保持不变)
           // 解析CSV内容
            parse(content, {
              header: false,
              skipEmptyLines: true,
              complete: (results) => {
                const rows = results.data
                console.log(rows[5])
                // 验证文件格式
                if (rows.length < 7) {
                  this.parseError = "上传数据格式错误：文件行数不足"
                  reject(this.parseError)
                  return
                }
                
                // 提取元数据
                const tags = rows[0] || []
                const descriptions = rows[1] || []
                const units = rows[2] || []
                const rangeHighs = rows[3] || []
                const rangeLows = rows[4] || []
                const properties = rows[5] || []
                
                // 构建变量数组
                const variables = []
                const data=[]
                for (let i = 1; i < tags.length; i++) {
                  // 跳过空列
                  let dataStore = []
                  if (!tags[i] || tags[i].trim() === '') continue
                  
                  // 确保数字0被正确处理
                  const getSafeNumber = (value) => {
                    if (value === null || value === undefined || value === '') return null
                    // 处理数字0
                    if (value === '0' || value === 0) return 0
                    const num = parseFloat(value)
                    return isNaN(num) ? null : num
                  }
                  for (let j = 7;j<rows.length;j++){
                    dataStore.push([j-6,rows[j][i]])
                  }
                  variables.push({
                    id: variables.length + 1,
                    tag: tags[i].trim(),
                    description: descriptions[i] ? descriptions[i].trim() : '',
                    unit: units[i] ? units[i].trim() : '',
                    rangeHigh: getSafeNumber(rangeHighs[i]),
                    rangeLow: getSafeNumber(rangeLows[i]),
                    property: properties[i] ? properties[i].trim() : '',
                    data:dataStore,
                  })
                }
                
                if (variables.length === 0) {
                  this.parseError = "上传数据格式错误：未找到有效变量"
                  reject(this.parseError)
                  return
                }
                
                this.variables = variables
                this.fileInfo = {
                  name: file.name,
                  size: (file.size / 1024).toFixed(2) + ' KB',
                  lastModified: new Date(file.lastModified).toLocaleString(),
                  variablesCount: variables.length,
                  dataRows: rows.length - 6
                }
                
                resolve()
              },
              error: (error) => {
                this.parseError = `解析错误: ${error.message}`
                reject(this.parseError)
              }
            })
  
            
          } catch (error) {
            console.error('CSV处理错误:', error)
            this.parseError = `处理文件时出错: ${error.message || error}`
            reject(this.parseError)
          }
        }
        
        reader.onerror = () => {
          this.parseError = "读取文件失败"
          reject(this.parseError)
        }
        
        reader.readAsArrayBuffer(file)
      })
    },
    
    toggleVariableSelection(variable) {
      const index = this.selectedVariables.findIndex(v => v.id === variable.id)
      if (index === -1) {
        this.selectedVariables.push(variable)
      } else {
        this.selectedVariables.splice(index, 1)
      }
    },
    deleteSelectedVariables() {
      this.variables = this.variables.filter(
        v => !this.selectedVariables.some(sv => sv.id === v.id)
      )
      this.selectedVariables = []
    },
    visualizeSelectedVariables() {
      alert(`将可视化变量: ${this.selectedVariables.map(v => v.tag).join(', ')}`)
      // 实际项目中应跳转到可视化页面
    },
    analyzeSelectedVariables() {
      alert(`将分析变量: ${this.selectedVariables.map(v => v.tag).join(', ')}`)
      // 实际项目中应跳转到分析页面
    },
    clearAllVariables() {
      if (confirm('确定要清空所有变量吗？')) {
        this.variables = []
        this.selectedVariables = []
        this.fileInfo = null
      }
    },
    // 设置编码类型
    setEncoding(encoding) {
      this.encoding = encoding
    }
  }
})




//策略3 可以正常导入数据，但是中文显示还是乱码
// import { defineStore } from 'pinia'
// import { parse } from 'papaparse'
// import jschardet from 'jschardet'

// // 编码标准化函数
// const normalizeEncoding = (encoding) => {
//   if (!encoding) return 'UTF-8'
  
//   encoding = encoding.toLowerCase()
  
//   // 常见编码映射
//   const mapping = {
//     'gb2312': 'GBK',
//     'gb_2312': 'GBK',
//     'gbk': 'GBK',
//     'gb18030': 'GBK',
//     'big5': 'BIG5',
//     'iso-8859-1': 'ISO-8859-1',
//     'windows-1252': 'ISO-8859-1',
//     'ascii': 'ISO-8859-1',
//     'utf-8': 'UTF-8',
//     'utf8': 'UTF-8'
//   }
  
//   return mapping[encoding] || 'UTF-8'
// }

// export const useModelStore = defineStore('model', {
//  state: () => ({
//     currentPage: '欢迎使用 SIA-APC 先进控制与优化软件',
//     showDataImportModal: false,
//     variables: [],
//     selectedVariables: [],
//     csvData: null,
//     fileInfo: null,
//     parseError: null,
//     encoding: 'auto',
//     encodingOptions: [
//       { value: 'auto', label: '自动检测' },
//       { value: 'UTF-8', label: 'UTF-8' },
//       { value: 'GBK', label: 'GBK/GB2312' },
//       { value: 'BIG5', label: 'BIG5(繁体)' },
//       { value: 'ISO-8859-1', label: 'ISO-8859-1' }
//     ]
//   }),

//   actions: {
//     setCurrentPage(page) {
//       this.currentPage = page
//     },
//     toggleDataImportModal(show) {
//       this.showDataImportModal = show
//       this.parseError = null
//     },

//     importData(file) {
//       return new Promise((resolve, reject) => {
//         this.parseError = null
//         const reader = new FileReader()
        
//         reader.onload = async (event) => {
//           try {
//             const arrayBuffer = event.target.result
//             const uint8Array = new Uint8Array(arrayBuffer)
            
//             // 1. 编码检测逻辑
//             let detectedEncoding = this.encoding
            
//             // 自动检测编码

//             // if (detectedEncoding === 'auto') {
//             //     // 尝试常见中文编码
//             //     const gbkSample = new TextDecoder('GBK', { fatal: false }).decode(uint8Array.slice(0, 1024))
//             //     const utf8Sample = new TextDecoder('UTF-8', { fatal: false }).decode(uint8Array.slice(0, 1024))
                
//             //     // 检查哪种解码包含更多有效字符
//             //     const gbkValidChars = gbkSample.replace(/[^\u0000-\uFFFF]/g, '').length
//             //     const utf8ValidChars = utf8Sample.replace(/[^\u0000-\uFFFF]/g, '').length
                
//             //     detectedEncoding = gbkValidChars > utf8ValidChars ? 'GBK' : 'UTF-8'
                
//             //     console.log(`编码检测结果: GBK有效字符 ${gbkValidChars}, UTF-8有效字符 ${utf8ValidChars}, 选择 ${detectedEncoding}`)
//             //   }


//               if (detectedEncoding === 'auto') {
//                 try {
//                   // 方法1：使用jschardet，将Uint8Array转换为普通数组
//                   const chunk = uint8Array.slice(0, 4096);
//                   const chunkArray = Array.from(chunk); // 转换为普通数组
//                   const detection = jschardet.detect(chunkArray);
                  
//                   if (detection && detection.encoding) {
//                     detectedEncoding = normalizeEncoding(detection.encoding);
//                     console.log('jschardet检测到的编码:', detection.encoding, '标准化为:', detectedEncoding);
//                   } else {
//                     // 方法2：如果jschardet没检测到，使用备选方案
//                     const gbkSample = new TextDecoder('GBK', { fatal: false }).decode(uint8Array.slice(0, 1024));
//                     const utf8Sample = new TextDecoder('UTF-8', { fatal: false }).decode(uint8Array.slice(0, 1024));
                    
//                     // 检查哪种解码包含更多中文字符
//                     const gbkChineseCount = (gbkSample.match(/[\u4e00-\u9fa5]/g) || []).length;
//                     const utf8ChineseCount = (utf8Sample.match(/[\u4e00-\u9fa5]/g) || []).length;
                    
//                     if (gbkChineseCount > utf8ChineseCount) {
//                       detectedEncoding = 'GBK';
//                     } else {
//                       detectedEncoding = 'UTF-8';
//                     }
//                     console.log(`备选方案检测: GBK中文数 ${gbkChineseCount}, UTF-8中文数 ${utf8ChineseCount}, 选择 ${detectedEncoding}`);
//                   }
//                 } catch (detectError) {
//                   console.error('编码检测失败:', detectError);
//                   detectedEncoding = 'UTF-8'; // 默认回退
//                 }
//               }
                          

            
//             // 2. 解码逻辑
//             let content
//             try {
//               const decoder = new TextDecoder(detectedEncoding)
//               content = decoder.decode(uint8Array)
//             } catch (decodeError) {
//               console.warn(`解码失败 (${detectedEncoding}), 尝试UTF-8回退:`, decodeError)
//               // UTF-8安全模式解码
//               content = new TextDecoder('UTF-8', { fatal: false }).decode(uint8Array)
//             }
            
//             // 3. 移除BOM字符
//             if (content.charCodeAt(0) === 0xFEFF) {
//               content = content.substring(1)
//             }
            
//             // 4. 解析CSV内容 (保持不变)
//            // 解析CSV内容
//             parse(content, {
//               header: false,
//               skipEmptyLines: true,
//               complete: (results) => {
//                 const rows = results.data
                
//                 // 验证文件格式
//                 if (rows.length < 7) {
//                   this.parseError = "上传数据格式错误：文件行数不足"
//                   reject(this.parseError)
//                   return
//                 }
                
//                 // 提取元数据
//                 const tags = rows[0] || []
//                 const descriptions = rows[1] || []
//                 const units = rows[2] || []
//                 const rangeHighs = rows[3] || []
//                 const rangeLows = rows[4] || []
//                 const properties = rows[5] || []
                
//                 // 构建变量数组
//                 const variables = []
                
//                 for (let i = 1; i < tags.length; i++) {
//                   // 跳过空列
//                   if (!tags[i] || tags[i].trim() === '') continue
                  
//                   // 确保数字0被正确处理
//                   const getSafeNumber = (value) => {
//                     if (value === null || value === undefined || value === '') return null
//                     // 处理数字0
//                     if (value === '0' || value === 0) return 0
//                     const num = parseFloat(value)
//                     return isNaN(num) ? null : num
//                   }
                  
//                   variables.push({
//                     id: variables.length + 1,
//                     tag: tags[i].trim(),
//                     description: descriptions[i] ? descriptions[i].trim() : '',
//                     unit: units[i] ? units[i].trim() : '',
//                     rangeHigh: getSafeNumber(rangeHighs[i]),
//                     rangeLow: getSafeNumber(rangeLows[i]),
//                     property: properties[i] ? properties[i].trim() : '',
//                   })
//                 }
                
//                 if (variables.length === 0) {
//                   this.parseError = "上传数据格式错误：未找到有效变量"
//                   reject(this.parseError)
//                   return
//                 }
                
//                 this.variables = variables
//                 this.fileInfo = {
//                   name: file.name,
//                   size: (file.size / 1024).toFixed(2) + ' KB',
//                   lastModified: new Date(file.lastModified).toLocaleString(),
//                   variablesCount: variables.length,
//                   dataRows: rows.length - 6
//                 }
                
//                 resolve()
//               },
//               error: (error) => {
//                 this.parseError = `解析错误: ${error.message}`
//                 reject(this.parseError)
//               }
//             })
  
            
//           } 
          
//           catch (error) {
//             console.error('CSV处理错误:', error)
//             this.parseError = `处理文件时出错: ${error.message || error}`
//             reject(this.parseError)
//           }
//         }
        
//         reader.onerror = () => {
//           this.parseError = "读取文件失败"
//           reject(this.parseError)
//         }
        
//         reader.readAsArrayBuffer(file)
//       })
//     },
    
//     toggleVariableSelection(variable) {
//       const index = this.selectedVariables.findIndex(v => v.id === variable.id)
//       if (index === -1) {
//         this.selectedVariables.push(variable)
//       } else {
//         this.selectedVariables.splice(index, 1)
//       }
//     },
//     deleteSelectedVariables() {
//       this.variables = this.variables.filter(
//         v => !this.selectedVariables.some(sv => sv.id === v.id)
//       )
//       this.selectedVariables = []
//     },
//     visualizeSelectedVariables() {
//       alert(`将可视化变量: ${this.selectedVariables.map(v => v.tag).join(', ')}`)
//       // 实际项目中应跳转到可视化页面
//     },
//     analyzeSelectedVariables() {
//       alert(`将分析变量: ${this.selectedVariables.map(v => v.tag).join(', ')}`)
//       // 实际项目中应跳转到分析页面
//     },
//     clearAllVariables() {
//       if (confirm('确定要清空所有变量吗？')) {
//         this.variables = []
//         this.selectedVariables = []
//         this.fileInfo = null
//       }
//     },
//     // 设置编码类型
//     setEncoding(encoding) {
//       this.encoding = encoding
//     }
//   }
// })


