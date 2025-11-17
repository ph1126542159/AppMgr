<template>
  <v-app>
    <!-- 顶部导航 -->
    <v-app-bar app color="#0f172a" dark elevation="0">
      <v-toolbar-title class="font-weight-bold">服务监控中心</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" text class="d-flex align-center text-capitalize">
            <v-avatar size="32" class="mr-2">
              <v-icon>mdi-account-circle</v-icon>
            </v-avatar>
            {{ username }}
            <v-icon right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="goHome">
            <v-list-item-title>主页</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>退出登录</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container class="mt-8">
        <v-row dense>
          <v-col v-for="service in services" :key="service.id" cols="12" md="4" lg="4">
            <v-card 
              class="glass-card" 
              elevation="0" 
              rounded="lg" 
              :class="{ 'expanded': expandedService === service.id }"
              @click="toggleExpansion(service.id)"
            >
              <!-- 玻璃高光层 -->
              <div class="glass-highlight"></div>
              
              <v-row no-gutters align="start">
                <!-- 左侧图标 -->
                <v-col cols="3" class="d-flex justify-center pt-4">
                  <v-avatar size="64" class="icon-gradient elevation-2">
                    <v-icon size="32" color="white">
                      {{ service.icon || 'mdi-server' }}
                    </v-icon>
                  </v-avatar>
                </v-col>

                <!-- 右侧内容 -->
                <v-col cols="9" class="pl-4">
                  <div class="d-flex justify-space-between align-start mb-2 pt-2">
                    <div>
                      <div class="text-h6 font-weight-medium text-white">
                        {{ service.name }}
                      </div>
                      <div class="text-caption text-grey-lighten-1 mt-1">
                        PID: <span class="text-cyan-lighten-2">{{ service.pid || '未启动' }}</span> |
                        状态: <span :class="getStatusColor(service.status)">{{ getStatusText(service.status) }}</span>
                      </div>
                    </div>
                    <v-icon 
                      class="expand-icon" 
                      :class="{ 'rotated': expandedService === service.id }"
                    >
                      mdi-chevron-down
                    </v-icon>
                  </div>

                  <!-- 基本信息区域 -->
                  <div class="basic-info">
                    <div class="text-caption text-grey-lighten-1 mb-1">
                      启动时间: <span class="text-cyan-lighten-2">{{ service.startTime || '-' }}</span>
                    </div>
                    <div class="text-caption text-grey-lighten-1">
                      描述: {{ service.descript }}
                    </div>
                  </div>

                  <!-- 详细信息区域 - 点击后显示 -->
                  <v-expand-transition>
                    <div v-if="expandedService === service.id" class="detailed-info">
                      <v-text-field
                        v-model="service.args"
                        label="启动参数"
                        variant="underlined"
                        density="compact"
                        hide-details
                        class="mb-3"
                        color="cyan-lighten-2"
                        @click.stop
                      ></v-text-field>

                      <v-textarea
                        v-model="service.descript"
                        label="服务描述"
                        rows="2"
                        variant="underlined"
                        density="compact"
                        hide-details
                        class="mb-3"
                        color="cyan-lighten-2"
                        @click.stop
                      ></v-textarea>

                      <!-- 环境变量 -->
                      <v-expansion-panels variant="accordion" class="mb-3" @click.stop>
                        <v-expansion-panel class="bg-transparent">
                          <v-expansion-panel-title class="text-body-2 text-white">
                            环境变量 ({{ service.envs.length }})
                          </v-expansion-panel-title>
                          <v-expansion-panel-text class="pa-0">
                            <div v-for="(env, i) in service.envs" :key="i" class="d-flex align-center mb-1">
                              <v-text-field
                                v-model="service.envs[i]"
                                density="compact"
                                hide-details
                                variant="outlined"
                                class="mr-1"
                                bg-color="rgba(255,255,255,0.08)"
                                color="cyan-lighten-2"
                              ></v-text-field>
                              <v-btn icon size="x-small" color="grey-lighten-1" @click="service.envs.splice(i, 1)">
                                <v-icon>mdi-close</v-icon>
                              </v-btn>
                            </div>
                            <v-btn block small variant="text" color="cyan-lighten-2" class="mt-1"
                              @click="service.envs.push('NEW_VAR=value')">
                              <v-icon left small>mdi-plus</v-icon> 添加变量
                            </v-btn>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>

                      <!-- 操作按钮 -->
                      <div class="d-flex justify-end gap-1 pb-2">
                        <v-btn size="small" color="cyan-lighten-2" variant="elevated" @click.stop="saveService(service)">
                          <v-icon left small>mdi-content-save</v-icon>
                          更新信息
                        </v-btn>
                        <v-btn size="small" color="cyan-lighten-2" variant="outlined" @click.stop="restartService(service)">
                          <v-icon left small>mdi-restart</v-icon>
                          重启
                        </v-btn>
                      </div>
                    </div>
                  </v-expand-transition>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- 提示 -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2000" location="top">
          {{ snackbar.message }}
          <template #actions>
            <v-btn variant="text" @click="snackbar.show = false">关闭</v-btn>
          </template>
        </v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const username = ref('admin')
const services = ref([])
const snackbar = ref({ show: false, message: '', color: 'success' })
const expandedService = ref(null)

// 服务状态定义
const ServiceStatus = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  ERROR: 'error',
  RESTARTING: 'restarting'
}

onMounted(() => {
  loadServices()
})

const loadServices = () => {
  const saved = localStorage.getItem('glass-services')
  if (saved) {
    const data = JSON.parse(saved)
    services.value = data.map(service => ({
      status: service.status || ServiceStatus.RUNNING,
      ...service
    }))
  } else {
    services.value = [
      {
        id: uuidv4(),
        pid: 10234,
        startTime: '2025-11-13 10:20:00',
        name: 'Camera Service',
        icon: 'mdi-camera',
        args: '--mode=active',
        envs: ['PATH=/usr/bin', 'LD_LIBRARY_PATH=/usr/lib'],
        descript: '负责相机采集与数据处理',
        status: ServiceStatus.RUNNING
      },
      {
        id: uuidv4(),
        pid: 5678,
        startTime: '2025-11-13 09:45:00',
        name: 'Web Server',
        icon: 'mdi-web',
        args: '--port=8080',
        envs: ['NODE_ENV=production'],
        descript: '提供 HTTP REST 接口与前端服务',
        status: ServiceStatus.RUNNING
      },
      {
        id: uuidv4(),
        pid: 9012,
        startTime: '2025-11-13 08:30:00',
        name: 'Database Service',
        icon: 'mdi-database',
        args: '--host=localhost',
        envs: ['DB_HOST=localhost', 'DB_PORT=5432'],
        descript: '数据库连接与管理服务',
        status: ServiceStatus.RUNNING
      },
      {
        id: uuidv4(),
        pid: null,
        startTime: '-',
        name: 'Auth Service',
        icon: 'mdi-shield-account',
        args: '--jwt-secret=key',
        envs: ['JWT_SECRET=secret', 'AUTH_TIMEOUT=3600'],
        descript: '用户认证与授权服务',
        status: ServiceStatus.STOPPED
      },
      {
        id: uuidv4(),
        pid: 7890,
        startTime: '2025-11-13 09:00:00',
        name: 'Cache Service',
        icon: 'mdi-memory',
        args: '--max-memory=1g',
        envs: ['REDIS_HOST=127.0.0.1', 'REDIS_PORT=6379'],
        descript: '缓存服务，提升系统性能',
        status: ServiceStatus.RUNNING
      },
      {
        id: uuidv4(),
        pid: 1234,
        startTime: '2025-11-13 10:45:00',
        name: 'Log Service',
        icon: 'mdi-file-document',
        args: '--level=info',
        envs: ['LOG_LEVEL=INFO', 'LOG_PATH=/var/log'],
        descript: '日志收集与分析服务',
        status: ServiceStatus.ERROR
      }
    ]
    saveToStorage()
  }
}

const toggleExpansion = (serviceId) => {
  if (expandedService.value === serviceId) {
    expandedService.value = null
  } else {
    expandedService.value = serviceId
  }
}

const getStatusColor = (status) => {
  const colors = {
    [ServiceStatus.RUNNING]: 'text-green-lighten-2',
    [ServiceStatus.STOPPED]: 'text-grey-lighten-1',
    [ServiceStatus.ERROR]: 'text-red-lighten-2',
    [ServiceStatus.RESTARTING]: 'text-orange-lighten-2'
  }
  return colors[status] || 'text-grey-lighten-1'
}

const getStatusText = (status) => {
  const texts = {
    [ServiceStatus.RUNNING]: '运行中',
    [ServiceStatus.STOPPED]: '已停止',
    [ServiceStatus.ERROR]: '错误',
    [ServiceStatus.RESTARTING]: '重启中'
  }
  return texts[status] || '未知'
}

const saveToStorage = () => {
  localStorage.setItem('glass-services', JSON.stringify(services.value))
}

const saveService = (service) => {
  saveToStorage()
  showSnack(`「${service.name}」信息已更新`, 'success')
}

const restartService = (service) => {
  service.status = ServiceStatus.RESTARTING
  showSnack(`「${service.name}」正在重启...`, 'info')
  
  // 模拟重启过程
  setTimeout(() => {
    service.status = ServiceStatus.RUNNING
    service.pid = Math.floor(Math.random() * 90000) + 10000
    service.startTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).replace(/\//g, '-')
    saveToStorage()
    showSnack(`「${service.name}」重启成功`, 'success')
  }, 2000)
}

const showSnack = (msg, color = 'success') => {
  snackbar.value = { show: true, message: msg, color }
}

const logout = () => {
  if (confirm('确定退出登录？')) location.href = '/loginPage'
}
const goHome = () => location.href = '/'
</script>

<style scoped>
/* 深色背景，突出玻璃质感 */
.v-application,
.v-application > .v-application--wrap {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
  min-height: 100vh;
}

/* 高级玻璃卡片 */
.glass-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 100%
  ) !important;
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  color: white !important;
  cursor: pointer;
  min-height: 150px;
  height: auto;
}

/* 展开状态的卡片 */
.glass-card.expanded {
  min-height: 380px;
}

/* 玻璃高光反射层 */
.glass-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.1) 40%,
    transparent 80%
  );
  border-radius: 16px 16px 0 0;
  pointer-events: none;
  z-index: 1;
}

/* 展开图标 */
.expand-icon {
  transition: transform 0.3s ease;
  color: #67e8f9;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

/* 基本信息区域 */
.basic-info {
  transition: all 0.3s ease;
  padding-top: 4px;
}

/* 详细信息区域 */
.detailed-info {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
  margin-top: 8px;
}

/* 图标渐变 */
.icon-gradient {
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  box-shadow: 
    0 4px 16px rgba(14, 165, 233, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 2;
}

/* 文字颜色 */
.text-white { 
  color: white !important; 
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
.text-grey-lighten-1 { 
  color: #e2e8f0 !important; 
}
.text-cyan-lighten-2 { 
  color: #67e8f9 !important; 
  font-weight: 500;
}

/* 输入框样式 */
:deep(.v-field__input),
:deep(.v-label) {
  color: white !important;
}
:deep(.v-field--focused .v-label) {
  color: #67e8f9 !important;
}
:deep(.v-field__outline) {
  border-color: rgba(255, 255, 255, 0.3) !important;
}
:deep(.v-field--focused .v-field__outline) {
  border-color: #67e8f9 !important;
}

/* 按钮样式 */
:deep(.v-btn) {
  position: relative;
  z-index: 2;
}

:deep(.v-btn--elevated) {
  background: linear-gradient(135deg, #0ea5e9, #06b6d4) !important;
  color: white !important;
  box-shadow: 0 2px 12px rgba(14, 165, 233, 0.4) !important;
}

:deep(.v-btn--variant-outlined) {
  border-color: #67e8f9 !important;
  color: #67e8f9 !important;
}

/* 扩展面板样式 */
:deep(.v-expansion-panel) {
  background: transparent !important;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 8px 0 !important;
}

:deep(.v-expansion-panel-title) {
  min-height: 40px !important;
  padding: 8px 0 !important;
  background: transparent !important;
}

/* 紧凑间距 */
.gap-1 { gap: 4px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }

/* 响应式优化 */
@media (max-width: 960px) {
  .glass-card {
    min-height: 140px;
  }
  
  .glass-card.expanded {
    min-height: 360px;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .glass-card {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    min-height: 130px;
  }
  
  .glass-card.expanded {
    min-height: 340px;
  }
}

/* 状态颜色 */
.text-green-lighten-2 { color: #a7f3d0 !important; }
.text-red-lighten-2 { color: #fca5a5 !important; }
.text-orange-lighten-2 { color: #fdba74 !important; }
</style>