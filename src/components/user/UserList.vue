<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-select v-model="queryInfo.userStatus" placeholder="用户状态" @change="getUserList">
            <el-option key="1" label="未删除" value="1"></el-option>
            <el-option key="2" label="已删除" value="2"></el-option>
            <el-option key="0" label="全部角色" value="0"></el-option>
          </el-select>
        </el-col>
        <el-col :span="5">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入用户姓名"
              v-model="queryInfo.name"
              class="input-with-select"
              @change="getUserList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="6" v-if="(((rightList || {}).userManagement || {}).userAction||{}).saveUser">
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="showAddDialog">添加用户</el-button>
          </div>
        </el-col>
      </el-row>
      <el-table :data="pageResult.rows" border style="width: 100%" stripe>
        <el-table-column type="index" label="#" width="50"></el-table-column>
        <el-table-column prop="loginName" label="登录账号"></el-table-column>
        <el-table-column prop="loginPasswd" label="密码"></el-table-column>
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="role.roleName" label="角色"></el-table-column>
        <el-table-column prop="telephone" label="电话"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="registerTime" label="注册时间"></el-table-column>
        <el-table-column prop="department" label="部门"></el-table-column>
        <el-table-column prop="post" label="职位"></el-table-column>
        <el-table-column
          label="操作"
          width="200"
          v-if="(((rightList || {}).userManagement || {}).userAction||{}).updateUser||(((rightList || {}).userManagement || {}).userAction||{}).deleteUser"
        >
          <template
            slot-scope="scope"
            v-if="(((rightList || {}).userManagement || {}).userAction||{}).updateUser||(((rightList || {}).userManagement || {}).userAction||{}).deleteUser"
          >
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.userId)"
                v-if="(((rightList || {}).userManagement || {}).userAction||{}).updateUser"
              ></el-button>
            </el-tooltip>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.userId)"
              v-if="(((rightList || {}).userManagement || {}).userAction||{}).deleteUser&&scope.row.userStatus==1"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-upload2"
              size="mini"
              @click="cancelDeleteUser(scope.row.userId)"
              v-if="(((rightList || {}).userManagement || {}).userAction||{}).deleteUser&&scope.row.userStatus==2"
            >取消删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[5,10,15,20]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageResult.total"
      ></el-pagination>
      <!--添加用户的对话框-->
      <el-dialog title="添加用户" :visible.sync="addDialogVisable" width="40%" @close="addDialogClosed">
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="100px"
          class="demo-addForm"
        >
          <el-row :gutter="0">
            <el-col :span="12">
              <el-form-item label="用户名" prop="loginName">
                <el-input v-model="addForm.loginName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="密码" prop="loginPasswd">
                <el-input v-model="addForm.loginPasswd"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="0">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="addForm.name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="角色" prop="roleId">
                <el-select
                  v-model="addForm.roleId"
                  placeholder="选择角色"
                  @visible-change="$forceUpdate()"
                  filterable
                >
                  <el-option
                    v-for="item in roleList"
                    :key="item.roleId"
                    :label="item.roleName"
                    :value="item.roleId"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="0">
            <el-col :span="12">
              <el-form-item label="部门" prop="department">
                <el-input v-model="addForm.department"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="职务" prop="post">
                <el-input v-model="addForm.post"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="0">
            <el-col :span="12">
              <el-form-item label="电话" prop="telephone">
                <el-input v-model="addForm.telephone"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="addForm.email"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisable = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
    <!--编辑用户的对话框-->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisable"
      width="40%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
        class="demo-addForm"
      >
        <el-row :gutter="0">
          <el-col :span="12">
            <el-form-item label="用户名" prop="loginName">
              <el-input v-model="editForm.loginName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="loginPasswd">
              <el-input v-model="editForm.loginPasswd"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="0">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="editForm.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="roleId">
              <el-select
                v-model="editForm.roleId"
                placeholder="选择角色"
                @visible-change="$forceUpdate()"
                filterable
              >
                <el-option
                  v-for="item in roleList"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="0">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-input v-model="editForm.department"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职务" prop="post">
              <el-input v-model="editForm.post"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="0">
          <el-col :span="12">
            <el-form-item label="电话" prop="telephone">
              <el-input v-model="editForm.telephone"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="updateUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      pageResult: {
        total: 0,
        rows: []
      },
      queryInfo: {
        pageNum: 1,
        pageSize: 5,
        hosName: ''
      },
      addDialogVisable: false,
      // 添加用户的表单数据
      addForm: {
        hosName: '',
        hosAddress: ''
      },
      // 添加用户的表单的验证规则数据
      addFormRules: {
        loginName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ],
        loginPasswd: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        roleId: [
          { required: true, message: '请选择用户的角色', trigger: 'blur' }
        ]
      },
      editDialogVisable: false,
      editForm: {
        hosId: 0,
        hosName: '',
        hosAddress: ''
      },
      // 添加用户的表单的验证规则数据
      editFormRules: {
        loginName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 4, max: 16, message: '长度在 4 到 16 个字符', trigger: 'blur' }
        ],
        loginPasswd: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        roleId: [
          { required: true, message: '请选择用户的角色', trigger: 'blur' }
        ]
      },
      rightList: {},
      roleList: []
    }
  },
  created() {
    // 查询所有操作
    this.getRight().then(data => {
      // 查询所有用户
      this.queryInfo.userStatus = '1'
      this.getUserList()
    })
  },
  methods: {
    // 监听pageSize的变化
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage
      this.getUserList()
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户的事件函数
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          // 表单验证成功，先查询用户名是否存在
          const { data: checkLoginNameExist } = await this.$http.post(
            'user/checkLoginNameExist.do?loginName=' + this.addForm.loginName
          )
          if (checkLoginNameExist) {
            return this.$message.error('该用户名已存在')
          }
          const { data: result } = await this.$http.post(
            'user/save.do',
            this.addForm
          )
          this.addDialogVisable = false
          if (result.success) {
            this.getUserList()
            return this.$message({
              message: '添加用户成功',
              type: 'success'
            })
          }
          return this.$message.error('添加用户失败')
        }
      })
    },
    // 显示编辑对话框的事件
    async showEditDialog(userId) {
      this.getAllRole().then(async data => {
        const { data: user } = await this.$http.post(
          'user/getByUserId.do?userId=' + userId
        )
        this.editForm = user
        this.editDialogVisable = true
      })
    },
    // 编辑对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async getUserList() {
      if (
        (((this.rightList || {}).userManagement || {}).userAction || {})
          .listUser === undefined
      ) {
        return this.$message.error('对不起，您没有查询用户的权限')
      }
      const { data: result } = await this.$http.post(
        'user/list.do?pageNum=' +
          this.queryInfo.pageNum +
          '&pageSize=' +
          this.queryInfo.pageSize,
        { name: this.queryInfo.name, userStatus: this.queryInfo.userStatus }
      )
      this.pageResult = result
    },
    // 修改用户的值
    async updateUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: result } = await this.$http.post(
            'user/update.do',
            this.editForm
          )
          this.editDialogVisable = false
          if (result.success) {
            this.getUserList()
            return this.$message({
              message: '修改用户信息成功',
              type: 'success'
            })
          }
          return this.$message.error('修改用户信息失败')
        }
      })
    },
    // 删除指定id的用户信息
    async deleteUser(userId) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: result } = await this.$http.post(
            'user/delete.do?userId=' + userId
          )
          if (result.success) {
            this.getUserList()
            return this.$message({
              type: 'success',
              message: result.message
            })
          }
          return this.$message.error(result.message)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    async getRight() {
      // 查询该页面的所有权限
      const loginName = window.sessionStorage.getItem('loginName')
      const { data: rightList } = await this.$http.post(
        'right/listByLoginName.do?loginName=' + loginName
      )
      this.rightList = rightList
    },
    async getAllRole() {
      const { data: roleList } = await this.$http.post('role/listAll.do', {
        roleStatus: 1
      })
      this.roleList = roleList
    },
    showAddDialog() {
      this.getAllRole().then(data => {
        this.addDialogVisable = true
      })
    },
    async cancelDeleteUser(userId) {
      const { data: result } = await this.$http.post(
        'user/cancelDelete.do?userId=' + userId
      )
      if (result.success) {
        this.getUserList()
        return this.$message({
          type: 'success',
          message: result.message
        })
      }
      return this.$message.error(result.message)
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #ccc;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
