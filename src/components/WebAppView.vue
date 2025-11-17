<template>
  <v-app>
    <!-- 顶部导航 -->
    <v-app-bar app color="#f8fafc" dark elevation="0">
      <v-toolbar-title class="font-weight-bold text-grey-darken-4"
        >服务监控中心</v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            text
            class="d-flex align-center text-capitalize text-grey-darken-3"
          >
            <v-avatar size="32" class="mr-2">
              <v-icon color="grey-darken-2">mdi-account-circle</v-icon>
            </v-avatar>
            {{ username }}
            <v-icon right color="grey-darken-2">mdi-menu-down</v-icon>
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
      <v-container class="fill-height d-flex align-center">
        <v-row dense class="justify-center">
          <v-col
            v-for="service in services"
            :key="service.id"
            cols="12"
            md="4"
            lg="4"
          >
            <v-card class="glass-card" elevation="0" rounded="lg">
              <!-- 玻璃高光层 -->
              <div class="glass-highlight"></div>

              <v-row no-gutters align="start">
                <!-- 左侧图标 -->
                <v-col cols="3" class="d-flex justify-center pt-4">
                  <v-avatar size="64" class="icon-gradient elevation-2">
                    <v-icon size="32" color="white">
                      {{ service.icon || "mdi-server" }}
                    </v-icon>
                  </v-avatar>
                </v-col>

                <!-- 右侧内容 -->
                <v-col cols="9" class="pl-4">
                  <div
                    class="d-flex justify-space-between align-start mb-2 pt-2"
                  >
                    <div>
                      <div
                        class="text-h6 font-weight-medium text-grey-darken-4"
                      >
                        {{ service.name }}
                      </div>
                      <div class="text-caption text-grey-darken-1 mt-1">
                        PID:
                        <span class="text-blue-darken-2">{{
                          service.pid || "未启动"
                        }}</span>
                        | 状态:
                        <span :class="getStatusColor(service.status)">{{
                          getStatusText(service.status)
                        }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- 基本信息区域 -->
                  <div class="basic-info">
                    <div class="text-caption text-grey-darken-1 mb-1">
                      启动时间:
                      <span class="text-blue-darken-2">{{
                        service.startTime || "-"
                      }}</span>
                    </div>
                    <!-- APP描述信息 -->
                    <div
                      class="text-caption text-grey-darken-2 mb-2 app-description"
                    >
                      {{ service.descript }}
                    </div>
                  </div>

                  <!-- 详细信息区域 -->
                  <div class="detailed-info">
                    <!-- 启动参数 - 只读显示 -->
                    <div class="args-display">
                      <div class="text-caption text-grey-darken-1 mb-1">
                        启动参数:
                      </div>
                      <div class="text-body-2 text-grey-darken-3 args-content">
                        {{ service.args }}
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>

        <!-- 提示 -->
        <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          timeout="2000"
          location="top"
        >
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
import { ref, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";

const username = ref("admin");
const services = ref([]);
const snackbar = ref({ show: false, message: "", color: "success" });

// 服务状态定义
const ServiceStatus = {
  RUNNING: "running",
  STOPPED: "stopped",
  ERROR: "error",
  RESTARTING: "restarting",
};

onMounted(() => {
  loadServices();
});

const loadServices = () => {
  const saved = localStorage.getItem("glass-services");
  if (saved) {
    const data = JSON.parse(saved);
    services.value = data.map((service) => ({
      status: service.status || ServiceStatus.RUNNING,
      ...service,
    }));
  } else {
    services.value = [
      {
        id: uuidv4(),
        pid: 10234,
        startTime: "2025-11-13 10:20:00",
        name: "Camera Service",
        icon: "mdi-camera",
        args: "--mode=active --resolution=1080p --fps=30",
        envs: ["PATH=/usr/bin", "LD_LIBRARY_PATH=/usr/lib"],
        descript: "负责相机采集与数据处理，支持多种分辨率和帧率设置",
        status: ServiceStatus.RUNNING,
      },
      {
        id: uuidv4(),
        pid: 5678,
        startTime: "2025-11-13 09:45:00",
        name: "Web Server",
        icon: "mdi-web",
        args: "--port=8080 --workers=4 --timeout=30",
        envs: ["NODE_ENV=production"],
        descript: "提供 HTTP REST 接口与前端服务，支持多线程处理",
        status: ServiceStatus.RUNNING,
      },
      {
        id: uuidv4(),
        pid: 9012,
        startTime: "2025-11-13 08:30:00",
        name: "Database Service",
        icon: "mdi-database",
        args: "--host=localhost --port=5432 --pool-size=20",
        envs: ["DB_HOST=localhost", "DB_PORT=5432"],
        descript: "数据库连接与管理服务，提供连接池和事务管理",
        status: ServiceStatus.RUNNING,
      },
      {
        id: uuidv4(),
        pid: null,
        startTime: "-",
        name: "Auth Service",
        icon: "mdi-shield-account",
        args: "--jwt-secret=key --token-expiry=3600",
        envs: ["JWT_SECRET=secret", "AUTH_TIMEOUT=3600"],
        descript: "用户认证与授权服务，支持JWT令牌和权限管理",
        status: ServiceStatus.STOPPED,
      },
      {
        id: uuidv4(),
        pid: 7890,
        startTime: "2025-11-13 09:00:00",
        name: "Cache Service",
        icon: "mdi-memory",
        args: "--max-memory=1g --eviction-policy=lru",
        envs: ["REDIS_HOST=127.0.0.1", "REDIS_PORT=6379"],
        descript: "缓存服务，提升系统性能，支持LRU淘汰策略",
        status: ServiceStatus.RUNNING,
      },
      {
        id: uuidv4(),
        pid: 1234,
        startTime: "2025-11-13 10:45:00",
        name: "Log Service",
        icon: "mdi-file-document",
        args: "--level=info --output=file --max-size=100m",
        envs: ["LOG_LEVEL=INFO", "LOG_PATH=/var/log"],
        descript: "日志收集与分析服务，支持多级别日志和文件轮转",
        status: ServiceStatus.ERROR,
      },
    ];
    saveToStorage();
  }
};

const getStatusColor = (status) => {
  const colors = {
    [ServiceStatus.RUNNING]: "text-green-darken-2",
    [ServiceStatus.STOPPED]: "text-grey-darken-2",
    [ServiceStatus.ERROR]: "text-red-darken-2",
    [ServiceStatus.RESTARTING]: "text-orange-darken-2",
  };
  return colors[status] || "text-grey-darken-2";
};

const getStatusText = (status) => {
  const texts = {
    [ServiceStatus.RUNNING]: "运行中",
    [ServiceStatus.STOPPED]: "已停止",
    [ServiceStatus.ERROR]: "错误",
    [ServiceStatus.RESTARTING]: "重启中",
  };
  return texts[status] || "未知";
};

const saveToStorage = () => {
  localStorage.setItem("glass-services", JSON.stringify(services.value));
};

const logout = () => {
  if (confirm("确定退出登录？")) location.href = "/loginPage";
};
const goHome = () => (location.href = "/");
</script>

<style scoped>
/* 浅色背景 */
.v-application,
.v-application > .v-application--wrap {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
  min-height: 100vh;
}

/* 稍微暗一点的浅色玻璃卡片 */
.glass-card {
  background: linear-gradient(
    135deg,
    rgba(248, 250, 252, 0.9) 0%,
    rgba(241, 245, 249, 0.8) 50%,
    rgba(226, 232, 240, 0.7) 100%
  ) !important;
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(100, 116, 139, 0.15),
    0 4px 16px rgba(100, 116, 139, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -1px 0 rgba(148, 163, 184, 0.15);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  color: #334155 !important;
  min-height: 220px;
  height: auto;
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
    rgba(255, 255, 255, 0.7) 0%,
    rgba(255, 255, 255, 0.4) 40%,
    transparent 80%
  );
  border-radius: 16px 16px 0 0;
  pointer-events: none;
  z-index: 1;
}

/* 基本信息区域 */
.basic-info {
  transition: all 0.3s ease;
  padding-top: 4px;
}

/* APP描述信息样式 - 去掉左侧蓝色边框 */
.app-description {
  line-height: 1.4;
  padding: 6px 0;
  font-size: 0.8rem;
}

/* 详细信息区域 */
.detailed-info {
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  padding-top: 12px;
  margin-top: 8px;
}

/* 启动参数显示区域 - 去掉背景和边框 */
.args-display {
  padding: 0;
}

.args-content {
  font-family: "Monaco", "Consolas", monospace;
  word-break: break-all;
  line-height: 1.4;
  font-size: 0.875rem;
}

/* 图标渐变 */
.icon-gradient {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 2;
}

/* 文字颜色调整 */
.text-grey-darken-4 {
  color: #1e293b !important;
}
.text-grey-darken-3 {
  color: #334155 !important;
}
.text-grey-darken-2 {
  color: #475569 !important;
}
.text-grey-darken-1 {
  color: #64748b !important;
}
.text-blue-darken-2 {
  color: #1d4ed8 !important;
  font-weight: 500;
}

/* 垂直居中布局 */
.fill-height {
  height: 100%;
}
.justify-center {
  justify-content: center;
}
.align-center {
  align-items: center;
}

/* 响应式优化 */
@media (max-width: 960px) {
  .glass-card {
    min-height: 200px;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .glass-card {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    min-height: 190px;
  }

  .fill-height {
    min-height: calc(100vh - 64px);
  }

  .app-description {
    font-size: 0.75rem;
  }
}

/* 状态颜色调整 */
.text-green-darken-2 {
  color: #16a34a !important;
}
.text-red-darken-2 {
  color: #dc2626 !important;
}
.text-orange-darken-2 {
  color: #ea580c !important;
}

/* 顶部导航栏样式调整 */
:deep(.v-app-bar) {
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

/* 菜单样式调整 */
:deep(.v-list) {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
}
</style>