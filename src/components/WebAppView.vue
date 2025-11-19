<template>
  <v-app>
    <!-- 顶部导航 -->
    <v-app-bar app color="white" dark elevation="0">
      <v-toolbar-title class="font-weight-bold text-grey-darken-4">服务监控中心</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- MQTT连接状态指示 -->
      <v-chip :color="mqttStatus.color" small class="mr-2" @click="showMqttInfo = true">
        <v-icon left small>{{ mqttStatus.icon }}</v-icon>
        {{ mqttStatus.text }}
      </v-chip>
      <!-- 消息通知图标 -->
      <v-badge :content="unreadCount" :value="unreadCount" color="red" overlap class="mr-4">
        <v-btn icon @click="showNotifications = true">
          <v-icon color="grey-darken-2">mdi-bell</v-icon>
        </v-btn>
      </v-badge>
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" text class="d-flex align-center text-capitalize text-grey-darken-3">
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
      <v-container class="fill-height" fluid>
        <v-row class="justify-center" dense>
          <v-col v-for="service in services" :key="service.id" cols="12" sm="6" md="4" lg="4" class="d-flex">
            <v-card class="glass-card flex-grow-1 d-flex align-center balanced-card" elevation="0" rounded="lg">
              <!-- 玻璃高光层 -->
              <div class="glass-highlight"></div>
              <!-- 玻璃边缘光效 -->
              <div class="glass-border-glow"></div>
              <!-- 玻璃内部光晕 -->
              <div class="glass-inner-glow"></div>

              <div class="card-content w-100 pa-4">
                <v-row no-gutters align="center" class="h-100">
                  <!-- 左侧图标 -->
                  <v-col cols="3" class="d-flex justify-center">
                    <v-avatar size="60" class="icon-gradient elevation-2">
                      <v-icon size="28" color="white">
                        {{ service.icon || "mdi-server" }}
                      </v-icon>
                    </v-avatar>
                  </v-col>

                  <!-- 右侧内容 -->
                  <v-col cols="9" class="pl-3">
                    <!-- 服务名称和状态 -->
                    <div class="mb-2">
                      <div class="text-h6 font-weight-bold text-grey-darken-4 mb-1 balanced-title">
                        {{ service.name }}
                      </div>
                      <div class="text-caption text-grey-darken-1 balanced-subtitle">
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

                    <!-- 启动时间 -->
                    <div class="text-caption text-grey-darken-1 mb-2 balanced-time">
                      启动时间:
                      <span class="text-blue-darken-2 font-weight-medium">{{
                        service.startTime || "-"
                      }}</span>
                    </div>

                    <!-- APP描述信息 -->
                    <div class="text-body-2 text-grey-darken-2 app-description mb-3 balanced-description">
                      {{ service.descript }}
                    </div>

                    <!-- 启动参数 -->
                    <div class="args-display balanced-args">
                      <div class="text-caption text-grey-darken-1 mb-1">
                        启动参数:
                      </div>
                      <div class="text-body-2 text-grey-darken-3 args-content">
                        {{ service.args }}
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
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

    <!-- 消息通知对话框 -->
    <v-dialog v-model="showNotifications" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>系统消息</span>
          <v-btn icon @click="showNotifications = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="message in messages" :key="message.id" :class="{ 'unread-message': !message.read }">
              <v-list-item-icon>
                <v-icon :color="getMessageColor(message.type)">
                  {{ getMessageIcon(message.type) }}
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ message.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ message.content }}</v-list-item-subtitle>
                <v-list-item-subtitle class="text-caption text-grey">
                  {{ formatTime(message.timestamp) }}
                  <span v-if="message.topic" class="ml-2">主题: {{ message.topic }}</span>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon small @click="markAsRead(message.id)">
                  <v-icon small>mdi-check</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="messages.length === 0">
              <v-list-item-content>
                <v-list-item-title class="text-center text-grey">
                  暂无消息
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="clearAllMessages">清空所有</v-btn>
          <v-btn text @click="markAllAsRead">全部已读</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- MQTT连接信息对话框 -->
    <v-dialog v-model="showMqttInfo" max-width="500px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>MQTT连接信息</span>
          <v-btn icon @click="showMqttInfo = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="blue">mdi-server-network</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Broker地址</v-list-item-title>
                <v-list-item-subtitle>{{ mqttConfig.host }}:{{ mqttConfig.port }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="green">mdi-shield-account</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>客户端ID</v-list-item-title>
                <v-list-item-subtitle>{{ mqttConfig.clientId }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="orange">mdi-broadcast</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>订阅主题</v-list-item-title>
                <v-list-item-subtitle>
                  <div v-for="topic in subscribedTopics" :key="topic" class="topic-item">
                    {{ topic }}
                  </div>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon :color="mqttStatus.color">{{ mqttStatus.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>连接状态</v-list-item-title>
                <v-list-item-subtitle>{{ mqttStatus.text }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="reconnectMqtt" :disabled="mqttClient && mqttClient.connected">
            重新连接
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, reactive } from "vue";
import { v4 as uuidv4 } from "uuid";

const username = ref("admin");
const services = ref([]);
const snackbar = ref({ show: false, message: "", color: "success" });

// 消息相关状态
const messages = ref([]);
const showNotifications = ref(false);
const showMqttInfo = ref(false);
const unreadCount = computed(() => messages.value.filter(msg => !msg.read).length);

// MQTT相关状态
const mqttClient = ref(null);
const mqttStatus = ref({
  text: '未连接',
  color: 'grey',
  icon: 'mdi-wifi-off'
});
const subscribedTopics = ref([]);

// MQTT配置
const mqttConfig = reactive({
  host: process.env.VUE_APP_MQTT_HOST || 'localhost',
  port: process.env.VUE_APP_MQTT_PORT || 8083,
  clientId: `web_client_${Math.random().toString(16).substr(2, 8)}`,
  username: process.env.VUE_APP_MQTT_USERNAME || '',
  password: process.env.VUE_APP_MQTT_PASSWORD || '',
  protocol: process.env.VUE_APP_MQTT_PROTOCOL || 'ws', // ws 或 wss
  clean: true,
  reconnectPeriod: 5000, // 5秒重连间隔
  connectTimeout: 10000, // 10秒连接超时
});

// 订阅的主题列表
const MQTT_TOPICS = {
  SERVICE_STATUS: 'services/status/+',      // 服务状态更新
  SERVICE_METRICS: 'services/metrics/+',    // 服务指标数据
  SYSTEM_ALERTS: 'system/alerts',           // 系统告警
  SYSTEM_NOTIFICATIONS: 'system/notifications', // 系统通知
  APP_UPDATES: 'app/updates'                // 应用更新
};

// 服务状态定义
const ServiceStatus = {
  RUNNING: "running",
  STOPPED: "stopped",
  ERROR: "error",
  RESTARTING: "restarting",
};

// 消息类型
const MessageType = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  SUCCESS: "success"
};

onMounted(() => {
  loadServices();
  loadMessages();
  connectMqtt();
});

onUnmounted(() => {
  disconnectMqtt();
});

// MQTT连接
const connectMqtt = () => {
  try {
    const protocol = mqttConfig.protocol;
    const url = `${protocol}://${mqttConfig.host}:${mqttConfig.port}/mqtt`;

    console.log('正在连接MQTT Broker:', url);

    // 动态导入mqtt库，避免编译错误
    import('mqtt').then(mqttModule => {
      const mqtt = mqttModule.default;

      mqttClient.value = mqtt.connect(url, {
        clientId: mqttConfig.clientId,
        username: mqttConfig.username,
        password: mqttConfig.password,
        clean: mqttConfig.clean,
        reconnectPeriod: mqttConfig.reconnectPeriod,
        connectTimeout: mqttConfig.connectTimeout,
      });

      mqttClient.value.on('connect', () => {
        console.log('MQTT连接成功');
        updateMqttStatus('已连接', 'green', 'mdi-wifi');
        subscribeToTopics();
        snackbar.value = {
          show: true,
          message: 'MQTT连接已建立',
          color: 'success'
        };
      });

      mqttClient.value.on('message', (topic, message) => {
        handleMqttMessage(topic, message.toString());
      });

      mqttClient.value.on('error', (error) => {
        console.error('MQTT连接错误:', error);
        updateMqttStatus('连接错误', 'red', 'mdi-wifi-off');
        snackbar.value = {
          show: true,
          message: `MQTT连接错误: ${error.message}`,
          color: 'error'
        };
      });

      mqttClient.value.on('close', () => {
        console.log('MQTT连接已关闭');
        updateMqttStatus('连接断开', 'orange', 'mdi-wifi-strength-off');
        subscribedTopics.value = [];
      });

      mqttClient.value.on('reconnect', () => {
        console.log('正在重新连接MQTT...');
        updateMqttStatus('重新连接中', 'orange', 'mdi-wifi-strength-1');
      });

      mqttClient.value.on('offline', () => {
        console.log('MQTT客户端离线');
        updateMqttStatus('离线', 'grey', 'mdi-wifi-off');
      });

    }).catch(error => {
      console.error('加载MQTT库失败:', error);
      updateMqttStatus('MQTT库加载失败', 'red', 'mdi-wifi-off');
      // 开发环境使用模拟消息
      startMockMessages();
    });

  } catch (error) {
    console.error('创建MQTT客户端失败:', error);
    updateMqttStatus('连接失败', 'red', 'mdi-wifi-off');
    // 开发环境使用模拟消息
    startMockMessages();
  }
};

// 订阅主题
const subscribeToTopics = () => {
  if (!mqttClient.value || !mqttClient.value.connected) return;

  Object.values(MQTT_TOPICS).forEach(topic => {
    mqttClient.value.subscribe(topic, { qos: 1 }, (error) => {
      if (error) {
        console.error(`订阅主题 ${topic} 失败:`, error);
      } else {
        console.log(`成功订阅主题: ${topic}`);
        if (!subscribedTopics.value.includes(topic)) {
          subscribedTopics.value.push(topic);
        }
      }
    });
  });
};

// 处理MQTT消息
const handleMqttMessage = (topic, message) => {
  try {
    const data = JSON.parse(message);
    console.log(`收到MQTT消息 [${topic}]:`, data);

    // 根据主题类型处理消息
    switch (true) {
      case topic.startsWith('services/status/'):
        handleServiceStatusMessage(topic, data);
        break;
      case topic.startsWith('services/metrics/'):
        handleServiceMetricsMessage(topic, data);
        break;
      case topic === 'system/alerts':
        handleSystemAlertMessage(data);
        break;
      case topic === 'system/notifications':
        handleSystemNotificationMessage(data);
        break;
      case topic === 'app/updates':
        handleAppUpdateMessage(data);
        break;
      default:
        handleUnknownMessage(topic, data);
    }
  } catch (error) {
    console.error('解析MQTT消息失败:', error, '原始消息:', message);
  }
};

// 处理服务状态消息
const handleServiceStatusMessage = (topic, data) => {
  const { serviceId, status, message } = data;

  if (serviceId && status) {
    updateServiceStatus(serviceId, status);

    const notification = {
      id: uuidv4(),
      type: getMessageTypeFromStatus(status),
      title: `服务状态更新 - ${getServiceName(serviceId)}`,
      content: message || `服务状态变更为: ${getStatusText(status)}`,
      serviceId: serviceId,
      topic: topic,
      timestamp: Date.now(),
      read: false
    };

    addMessage(notification);
  }
};

// 处理服务指标消息
const handleServiceMetricsMessage = (topic, data) => {
  const { serviceId, metrics } = data;
  console.log(`服务 ${serviceId} 指标数据:`, metrics);
  // 这里可以处理CPU、内存等指标数据
};

// 处理系统告警消息
const handleSystemAlertMessage = (data) => {
  const { level, title, message } = data;

  const alert = {
    id: uuidv4(),
    type: level || MessageType.WARNING,
    title: title || '系统告警',
    content: message,
    topic: 'system/alerts',
    timestamp: Date.now(),
    read: false
  };

  addMessage(alert);
};

// 处理系统通知消息
const handleSystemNotificationMessage = (data) => {
  const { type, title, message } = data;

  const notification = {
    id: uuidv4(),
    type: type || MessageType.INFO,
    title: title || '系统通知',
    content: message,
    topic: 'system/notifications',
    timestamp: Date.now(),
    read: false
  };

  addMessage(notification);
};

// 处理应用更新消息
const handleAppUpdateMessage = (data) => {
  const { version, description, urgent } = data;

  const updateMessage = {
    id: uuidv4(),
    type: urgent ? MessageType.WARNING : MessageType.INFO,
    title: `应用更新 - v${version}`,
    content: description || '有新的应用版本可用',
    topic: 'app/updates',
    timestamp: Date.now(),
    read: false
  };

  addMessage(updateMessage);
};

// 处理未知消息
const handleUnknownMessage = (topic, data) => {
  console.log('收到未知主题消息:', topic, data);
};

// 发布MQTT消息（如果需要前端发送消息）
// eslint-disable-next-line no-unused-vars
const publishMessage = (topic, message, options = { qos: 1 }) => {
  if (mqttClient.value && mqttClient.value.connected) {
    mqttClient.value.publish(topic, JSON.stringify(message), options, (error) => {
      if (error) {
        console.error(`发布消息到 ${topic} 失败:`, error);
      } else {
        console.log(`成功发布消息到 ${topic}`);
      }
    });
  }
};

// 断开MQTT连接
const disconnectMqtt = () => {
  if (mqttClient.value) {
    mqttClient.value.end();
    mqttClient.value = null;
  }
};

// 重新连接MQTT
const reconnectMqtt = () => {
  disconnectMqtt();
  setTimeout(connectMqtt, 1000);
};

// 更新MQTT状态
const updateMqttStatus = (text, color, icon) => {
  mqttStatus.value = { text, color, icon };
};

// 模拟消息服务（开发环境使用）
const startMockMessages = () => {
  console.log('启动MQTT模拟消息服务');

  // 模拟服务状态变化
  setInterval(() => {
    const randomService = services.value[Math.floor(Math.random() * services.value.length)];
    if (randomService) {
      const statusTypes = [ServiceStatus.RUNNING, ServiceStatus.ERROR, ServiceStatus.RESTARTING];
      const randomStatus = statusTypes[Math.floor(Math.random() * statusTypes.length)];

      const mockMessage = {
        serviceId: randomService.id,
        status: randomStatus,
        message: `模拟服务状态更新: ${getStatusText(randomStatus)}`,
        timestamp: Date.now()
      };

      // 模拟收到MQTT消息
      handleServiceStatusMessage(`services/status/${randomService.id}`, mockMessage);
    }
  }, 20000); // 每20秒发送一条模拟消息
};

// 根据状态获取消息类型
const getMessageTypeFromStatus = (status) => {
  const typeMap = {
    [ServiceStatus.RUNNING]: MessageType.SUCCESS,
    [ServiceStatus.ERROR]: MessageType.ERROR,
    [ServiceStatus.RESTARTING]: MessageType.WARNING,
    [ServiceStatus.STOPPED]: MessageType.INFO
  };
  return typeMap[status] || MessageType.INFO;
};

// 根据服务ID获取服务名称
const getServiceName = (serviceId) => {
  const service = services.value.find(s => s.id === serviceId);
  return service ? service.name : '未知服务';
};

// 添加消息
const addMessage = (message) => {
  messages.value.unshift(message);
  saveMessages();

  // 显示snackbar提示
  snackbar.value = {
    show: true,
    message: `新消息: ${message.title}`,
    color: getMessageColor(message.type)
  };
};

// 更新服务状态
const updateServiceStatus = (serviceId, status) => {
  const service = services.value.find(s => s.id === serviceId);
  if (service) {
    service.status = status;
    service.startTime = status === ServiceStatus.RUNNING ?
      new Date().toLocaleString('zh-CN') : service.startTime;
    service.pid = status === ServiceStatus.RUNNING ?
      Math.floor(Math.random() * 10000) + 1000 :
      (status === ServiceStatus.STOPPED ? null : service.pid);

    saveToStorage();
  }
};

// 消息相关方法
const getMessageColor = (type) => {
  const colors = {
    [MessageType.INFO]: 'blue',
    [MessageType.WARNING]: 'orange',
    [MessageType.ERROR]: 'red',
    [MessageType.SUCCESS]: 'green'
  };
  return colors[type] || 'blue';
};

const getMessageIcon = (type) => {
  const icons = {
    [MessageType.INFO]: 'mdi-information',
    [MessageType.WARNING]: 'mdi-alert',
    [MessageType.ERROR]: 'mdi-alert-circle',
    [MessageType.SUCCESS]: 'mdi-check-circle'
  };
  return icons[type] || 'mdi-information';
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};

const markAsRead = (messageId) => {
  const message = messages.value.find(msg => msg.id === messageId);
  if (message) {
    message.read = true;
    saveMessages();
  }
};

const markAllAsRead = () => {
  messages.value.forEach(msg => msg.read = true);
  saveMessages();
};

const clearAllMessages = () => {
  messages.value = [];
  saveMessages();
};

// 数据持久化
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

const loadMessages = () => {
  const saved = localStorage.getItem("app-messages");
  if (saved) {
    messages.value = JSON.parse(saved);
  }
};

const saveMessages = () => {
  localStorage.setItem("app-messages", JSON.stringify(messages.value));
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
/* 之前的样式保持不变，只添加新样式 */

/* 未读消息样式 */
.unread-message {
  background-color: rgba(33, 150, 243, 0.04);
  border-left: 3px solid #2196f3;
}

/* 消息列表项样式 */
:deep(.v-list-item__content) {
  padding: 8px 0;
}

:deep(.v-list-item__title) {
  font-weight: 600;
  margin-bottom: 2px;
}

:deep(.v-list-item__subtitle) {
  opacity: 0.8;
}

/* 通知徽章样式 */
:deep(.v-badge__badge) {
  font-size: 10px;
  min-width: 18px;
  height: 18px;
}

/* MQTT主题项样式 */
.topic-item {
  font-family: monospace;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  margin: 2px 0;
}

/* 平衡比例Card - 使用更合适的比例 */
.balanced-card {
  /* 使用 3:4 比例，更加紧凑美观 */
  aspect-ratio: 3 / 4;
  /* 宽度:高度 = 3:4 */
  min-height: 240px;
  /* 基础高度 */
  max-height: 280px;
  /* 最大高度限制 */
}

/* 深色透明玻璃Card */
.glass-card {
  background: linear-gradient(135deg,
      rgba(226, 232, 240, 0.95) 0%,
      rgba(203, 213, 225, 0.85) 50%,
      rgba(148, 163, 184, 0.75) 100%) !important;
  border-radius: 16px !important;
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 15px 40px rgba(71, 85, 105, 0.2),
    0 8px 25px rgba(71, 85, 105, 0.15),
    0 4px 12px rgba(71, 85, 105, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(100, 116, 139, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  color: #1e293b !important;
  height: 100%;
  width: 100%;
}

/* 鼠标悬停效果 */
.glass-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow:
    0 20px 50px rgba(71, 85, 105, 0.25),
    0 12px 30px rgba(71, 85, 105, 0.2),
    0 6px 18px rgba(71, 85, 105, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.98),
    inset 0 -1px 0 rgba(100, 116, 139, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.4);
  background: linear-gradient(135deg,
      rgba(241, 245, 249, 0.98) 0%,
      rgba(226, 232, 240, 0.9) 50%,
      rgba(203, 213, 225, 0.8) 100%) !important;
}

/* 玻璃高光反射层 */
.glass-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.8) 0%,
      rgba(255, 255, 255, 0.5) 25%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 80%);
  border-radius: 16px 16px 0 0;
  pointer-events: none;
  z-index: 1;
}

/* 玻璃边缘光效 */
.glass-border-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.5) 0%,
      transparent 20%,
      transparent 80%,
      rgba(255, 255, 255, 0.25) 100%);
  pointer-events: none;
  z-index: 1;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
}

/* 玻璃内部光晕效果 */
.glass-inner-glow {
  position: absolute;
  top: 1px;
  left: 1px;
  right: 1px;
  bottom: 1px;
  border-radius: 15px;
  background: radial-gradient(circle at 20% 20%,
      rgba(255, 255, 255, 0.4) 0%,
      transparent 50%);
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: overlay;
}

/* 卡片内容容器 */
.card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
}

/* 平衡比例优化字体大小 */
.balanced-title {
  font-size: 1.1rem !important;
  line-height: 1.3;
}

.balanced-subtitle {
  font-size: 0.7rem !important;
  line-height: 1.3;
}

.balanced-time {
  font-size: 0.7rem !important;
}

.balanced-description {
  font-size: 0.75rem !important;
  line-height: 1.4;
  max-height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.balanced-args .args-content {
  font-size: 0.65rem !important;
  line-height: 1.3;
  max-height: 2.6em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* APP描述信息样式 */
.app-description {
  background: transparent !important;
  backdrop-filter: none;
  color: #475569 !important;
  max-width: 100%;
}

/* 启动参数显示区域 */
.args-display {
  width: 100%;
}

.args-content {
  font-family: "Monaco", "Consolas", "Courier New", monospace;
  word-break: break-all;
  background: transparent !important;
  border-radius: 0;
  border: none;
  backdrop-filter: none;
  color: #475569 !important;
  max-width: 100%;
}

/* 图标渐变 */
.icon-gradient {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8, #2563eb);
  box-shadow:
    0 8px 20px rgba(59, 130, 246, 0.3),
    0 4px 10px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(30, 58, 138, 0.3),
    0 0 15px rgba(59, 130, 246, 0.15);
  position: relative;
  z-index: 3;
  transition: all 0.3s ease;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
}

.icon-gradient:hover {
  transform: scale(1.05);
  box-shadow:
    0 12px 25px rgba(59, 130, 246, 0.4),
    0 6px 15px rgba(59, 130, 246, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 0 rgba(30, 58, 138, 0.4),
    0 0 20px rgba(59, 130, 246, 0.2);
}

/* 文字颜色调整 */
.text-grey-darken-4 {
  color: #0f172a !important;
}

.text-grey-darken-3 {
  color: #1e293b !important;
}

.text-grey-darken-2 {
  color: #334155 !important;
}

.text-grey-darken-1 {
  color: #475569 !important;
}

.text-blue-darken-2 {
  color: #1d4ed8 !important;
  font-weight: 600;
}

/* 布局样式 */
.fill-height {
  height: 100%;
}

.justify-center {
  justify-content: center;
}

.align-center {
  align-items: center;
}

/* 高度控制类 */
.h-100 {
  height: 100%;
}

/* 宽度控制类 */
.w-100 {
  width: 100%;
}

/* 响应式优化 */
@media (max-width: 960px) {
  .balanced-card {
    aspect-ratio: 2 / 3;
    min-height: 220px;
  }

  .balanced-title {
    font-size: 1rem !important;
  }

  .balanced-description {
    font-size: 0.7rem !important;
  }
}

@media (max-width: 768px) {
  .balanced-card {
    aspect-ratio: 1 / 1.2;
    min-height: 200px;
  }

  .glass-card {
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
  }

  .fill-height {
    min-height: calc(100vh - 64px);
  }

  .balanced-title {
    font-size: 0.95rem !important;
  }

  .balanced-description {
    font-size: 0.65rem !important;
    -webkit-line-clamp: 2;
  }

  .balanced-args .args-content {
    font-size: 0.6rem !important;
    -webkit-line-clamp: 2;
  }
}

/* 状态颜色调整 */
.text-green-darken-2 {
  color: #059669 !important;
  font-weight: 600;
}

.text-red-darken-2 {
  color: #dc2626 !important;
  font-weight: 600;
}

.text-orange-darken-2 {
  color: #ea580c !important;
  font-weight: 600;
}

/* 顶部导航栏样式调整 */
:deep(.v-app-bar) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* 菜单样式调整 */
:deep(.v-list) {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* 添加整体页面动画 */
.v-main {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片入场动画 */
.glass-card {
  animation: cardSlideIn 0.6s ease-out both;
}

.glass-card:nth-child(1) {
  animation-delay: 0.1s;
}

.glass-card:nth-child(2) {
  animation-delay: 0.2s;
}

.glass-card:nth-child(3) {
  animation-delay: 0.3s;
}

.glass-card:nth-child(4) {
  animation-delay: 0.4s;
}

.glass-card:nth-child(5) {
  animation-delay: 0.5s;
}

.glass-card:nth-child(6) {
  animation-delay: 0.6s;
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>