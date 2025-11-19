<template>
  <v-app>
    <v-main>
      <div class="login-background">
        <v-container fill-height>
          <v-row align="center" justify="center">
            <v-col cols="12" sm="6" md="4">
              <!-- 玻璃卡片 -->
              <v-card class="glass-card" elevation="12">
                <v-card-title class="justify-center">
                  <span class="login-title">后端管理</span>
                </v-card-title>
                <v-card-text>
                  <v-form>
                    <!-- 用户名 -->
                    <v-text-field v-model="username" label="用户名" variant="outlined" class="glass-input" hide-details
                      density="comfortable"></v-text-field>

                    <!-- 密码 -->
                    <v-text-field v-model="password" label="密码" type="password" variant="outlined" class="glass-input"
                      hide-details density="comfortable"></v-text-field>

                    <!-- 登录按钮 -->
                    <v-btn class="glass-btn" large block @click="login">
                      登录
                    </v-btn>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-main>
  </v-app>
</template>

<script>
// import axios from 'axios';

export default {
  name: "LoginView",
  data() {
    return {
      username: "",
      password: "",
      usernameRules: [
        v => !!v || '用户名不能为空',
      ],
      passwordRules: [
        v => !!v || '密码不能为空',
      ],
    };
  },
  methods: {
    async login() {
      // 获取当前后端地址
      // const baseURL = window.location.origin;
      try {
        // 不用 response 变量，直接 await
        // await axios.post(`${baseURL}/login`, {
        //   username: this.username,
        //   password: this.password,
        // });
        window.location.href = '/launcher';
      } catch (error) {
        alert("登录失败，请检查用户名或密码");
      }
    }
  },
};
</script>

<style scoped>
.login-title {
  display: block;
  /* 变成块级元素 */
  text-align: center;
  /* 文本水平居中 */
  font-size: 26px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
}

/* 背景改为白色 */
.login-background {
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 玻璃卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.5);
  /* 半透明白色玻璃 */
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: 100%;
  max-width: 800px;
  /* 最大宽度，可调 */
  min-width: 500px;
  /* 最小宽度，可调 */
}

/* 标题 */
.login-title {
  font-size: 26px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
}

/* 输入框 */
.glass-input {
  --v-field-background-color: transparent !important;
  --v-field-border-radius: 8px;
  --v-field-border-color: rgba(0, 0, 0, 0.2);
  margin-bottom: 16px;
}

.glass-input input {
  color: #333 !important;
}

.glass-input .v-label {
  color: #555 !important;
}

/* 聚焦时发光边框 */
.glass-input.v-input--is-focused .v-field__outline {
  border-color: #00bfff !important;
  box-shadow: 0 0 6px #00bfff;
}

.glass-btn {
  background: rgba(0, 95, 158, 0.8);
  /* 深海蓝色 */
  color: #ffffff;
  font-weight: bold;
  border-radius: 12px;
  min-height: 50px;
  font-size: 16px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 8px rgba(0, 95, 158, 0.6);
}

.glass-btn:hover {
  background: rgba(0, 95, 158, 1);
  box-shadow: 0 0 15px rgba(0, 95, 158, 0.9), 0 0 30px rgba(0, 95, 158, 0.5);
  transform: translateY(-2px);
}
</style>
