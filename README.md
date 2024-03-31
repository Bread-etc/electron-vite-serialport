# Electron-vite 构建地面站

### 2024-3-7
- 实现数据十六进制的接收和发送
- 实现数据更新的图表`echarts`

### 2024-3-8
- 添加少许`echarts`细节
- 优化`setInterval`开启关闭方式，减少卡顿

### 2024-3-9
- 将串口连接移至`Navigation`
- 添加`pinia`实行串口内容组件间通信

### 2024-3-13
- 添加PID读写功能
- 待修改部分bug

### 2024-3-14
- 完善PID读写
- bug: 必须读取两次PID才能获取内容

### 2024-3-19
- 添加`DataDownload`
- 添加文件另存为`importFile`

### 2024-3-20
- 修改部分变量初始化方式
- 添加xlsx文件工具`exportXlsx.ts`

### 2024-3-21
- 修改`exportXlsx.ts`
- 添加`utils/calcAngle.ts`，增加复用性
- 完成组件`DataDownload.vue`

### 2024-3-31
- 删除飞控状态组件
- 修改部分细节