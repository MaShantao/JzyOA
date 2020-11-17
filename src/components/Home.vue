<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/logo.png" alt width="30px" />
        <span>新冠病毒自动化办公系统</span>
      </div>
      <span>欢迎{{loginName}}登录</span>
      <el-button type="info" plain size="mini" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          :default-active="activePath"
          class="el-menu-vertical-demo"
          background-color="#373744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
        >
          <!--一级菜单-->
          <el-submenu index="1" v-show="rightList.hospitalManagement">
            <template slot="title">
              <!--图标-->
              <i class="el-icon-s-cooperation"></i>
              <!--文本-->
              <span>医院</span>
            </template>
            <!--二级菜单-->
            <el-menu-item
              index="/hospitals"
              @click="saveNavState('/hospitals')"
              v-show="((rightList || {}).hospitalManagement || {}).hospitalAction"
            >
              <template slot="title">
                <!--图标-->
                <i class="el-icon-menu"></i>
                <!--文本-->
                <span>医院列表</span>
              </template>
            </el-menu-item>
            <el-menu-item
              index="/departments"
              @click="saveNavState('/departments')"
              v-show="((rightList || {}).hospitalManagement || {}).departmentAction"
            >
              <template slot="title">
                <!--图标-->
                <i class="el-icon-menu"></i>
                <!--文本-->
                <span>科室列表</span>
              </template>
            </el-menu-item>
            <el-menu-item
              index="/doctors"
              @click="saveNavState('/doctors')"
              v-show="((rightList || {}).hospitalManagement || {}).doctorAction"
            >
              <template slot="title">
                <!--图标-->
                <i class="el-icon-user-solid"></i>
                <!--文本-->
                <span>医生列表</span>
              </template>
            </el-menu-item>
          </el-submenu>
          <!--一级菜单-->
          <el-submenu index="2" v-show="rightList.specimenManagement">
            <template slot="title">
              <!--图标-->
              <i class="el-icon-s-help"></i>
              <!--文本-->
              <span>检测</span>
            </template>
            <!--二级菜单-->
            <el-menu-item index="/specimens" @click="saveNavState('/specimens')">
              <template slot="title">
                <!--图标-->
                <i class="el-icon-menu"></i>
                <!--文本-->
                <span>样本列表</span>
              </template>
            </el-menu-item>
            <!--
            <el-menu-item index="/report" @click="saveNavState('/report')">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>报告列表</span>
              </template>
            </el-menu-item>
            -->
            <!--
            <el-menu-item index="/managers" @click="saveNavState('/managers')">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>负责人列表</span>
              </template>
            </el-menu-item>
            -->
          </el-submenu>
          <el-submenu index="3" v-show="rightList.userManagement">
            <template slot="title">
              <!--图标-->
              <i class="el-icon-user-solid"></i>
              <!--文本-->
              <span>用户管理</span>
            </template>
            <!--二级菜单-->
            <el-menu-item
              index="/users"
              @click="saveNavState('/users')"
              v-show="((rightList || {}).userManagement || {}).userAction"
            >
              <template slot="title">
                <!--图标-->
                <i class="el-icon-menu"></i>
                <!--文本-->
                <span>用户列表</span>
              </template>
            </el-menu-item>
          </el-submenu>
          <el-submenu index="4" v-show="rightList.roleManagement">
            <template slot="title">
              <!--图标-->
              <i class="el-icon-s-custom"></i>
              <!--文本-->
              <span>角色管理</span>
            </template>
            <el-menu-item
              index="/roles"
              @click="saveNavState('/roles')"
              v-show="((rightList || {}).roleManagement || {}).roleAction"
            >
              <template slot="title">
                <!--图标-->
                <i class="el-icon-menu"></i>
                <!--文本-->
                <span>角色列表</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      isCollapse: false,
      activePath: '',
      rightList: [],
      loginName: ''
    }
  },
  methods: {
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
      window.sessionStorage.setItem('isCollapse', this.isCollapse)
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      console.log('activePath')
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getRight() {
      // 查询该页面的所有权限
      this.loginName = window.sessionStorage.getItem('loginName')
      const { data: rightList } = await this.$http.post(
        'right/listByLoginName.do?loginName=' + this.loginName
      )
      this.rightList = rightList
      window.sessionStorage.setItem('rightList', JSON.stringify(this.rightList))
    }
  },
  created() {
    this.getRight()
    this.activePath = window.sessionStorage.getItem('activePath')
    this.isCollapse = window.sessionStorage.getItem('isCollapse')
    this.isCollapse = this.isCollapse === 'true'
  }
}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  color: #fff;
  align-items: center;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #373744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.home-container {
  height: 100%;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 15px;
  line-height: 30px;
  color: white;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
