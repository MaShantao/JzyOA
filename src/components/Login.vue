<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" />
      </div>
      <!--登录表单区域 -->
      <el-form
        label-width="0px"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
      >
        <el-form-item prop="loginName">
          <el-input
            prefix-icon="el-icon-user-solid"
            placeholder="请输入用户名"
            v-model="loginForm.loginName"
            @change="checkLogin"
          ></el-input>
        </el-form-item>
        <el-form-item prop="loginPasswd">
          <el-input
            prefix-icon="el-icon-s-cooperation"
            placeholder="请输入密码"
            show-password
            v-model="loginForm.loginPasswd"
            @change="checkLogin"
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="success" @click="checkLogin">登录</el-button>
          <el-button type="info" @click="resetLoginFormFields">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loginForm: {
        loginName: '',
        loginPasswd: ''
      },
      loginFormRules: {
        loginName: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ],
        loginPasswd: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    checkLogin() {
      this.$refs.loginFormRef.validate(async valid => {
        if (valid) {
          const { data: result } = await this.$http.post(
            'user/checkLogin.do',
            this.loginForm
          )
          if (result.success) {
            window.sessionStorage.setItem('loginName', this.loginForm.loginName)
            this.$router.push('/home')
            return this.$message({
              message: result.message,
              type: 'success'
            })
          }
          return this.$message.error(result.message)
        }
      })
    },
    resetLoginFormFields() {
      this.$refs.loginFormRef.resetFields()
    },
    async getRight() {
      // 查询该页面的所有权限
      const loginName = window.sessionStorage.getItem('loginName')
      const { data: rightList } = await this.$http.post(
        'right/listByLoginName.do?loginName=' + loginName
      )
      window.sessionStorage.setItem('rightList', JSON.stringify(rightList))
    }
  }
}
</script>

<style scoped lang='less'>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 35%;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
