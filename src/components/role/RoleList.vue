<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-select v-model="queryInfo.roleStatus" placeholder="角色状态" @change="getRoleList">
            <el-option key="1" label="未删除" value="1"></el-option>
            <el-option key="2" label="已删除" value="2"></el-option>
            <el-option key="0" label="全部角色" value="0"></el-option>
          </el-select>
        </el-col>
        <el-col :span="5">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入角色姓名"
              v-model="queryInfo.roleName"
              class="input-with-select"
              @change="getRoleList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getRoleList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="6" v-if="(((right || {}).roleManagement || {}).roleAction||{}).saveRole">
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="addDialogVisable = true">添加角色</el-button>
          </div>
        </el-col>
      </el-row>
      <el-table :data="pageResult.rows" border style="width: 100%" stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :gutter="20"
              v-for="(level1Right,index1) in scope.row.rightList"
              :key="index1"
              class="vcenter"
            >
              <el-col :span="5">
                <el-tag
                  closable
                  @close="deleteRight(scope.row,level1Right)"
                >{{level1Right.rightName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(level2Right,index2) in level1Right.children"
                  :key="index2"
                  :gutter="20"
                  :class="['bdbottom','vcenter' ]"
                >
                  <el-col :span="5">
                    <el-tag
                      type="success"
                      closable
                      @close="deleteRight(scope.row,level2Right)"
                    >{{level2Right.rightName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="19">
                    <el-row :gutter="20">
                      <el-col
                        :span="6"
                        v-for="(level3Right,index3) in level2Right.children"
                        :key="index3"
                      >
                        <el-tag
                          type="danger"
                          closable
                          @close="deleteRight(scope.row,level3Right)"
                        >{{level3Right.rightName}}</el-tag>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="150"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleIntro" label="角色介绍"></el-table-column>
        <el-table-column
          label="操作"
          v-if="(((right || {}).roleManagement || {}).roleAction||{}).updateRole||(((right || {}).roleManagement || {}).roleAction||{}).setRoleRight"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.roleId)"
              v-if="(((right || {}).roleManagement || {}).roleAction||{}).updateRole"
            >编辑</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              v-if="(((right || {}).roleManagement || {}).roleAction||{}).setRoleRight"
            >分配权限</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRole(scope.row.roleId)"
              v-if="scope.row.roleStatus==1&&(((right || {}).roleManagement || {}).roleAction||{}).deleteRole"
            >删除</el-button>
            <el-button
              type="success"
              icon="el-icon-upload2"
              size="mini"
              @click="cancelDeleteRole(scope.row)"
              v-if="scope.row.roleStatus==2&&(((right || {}).roleManagement || {}).roleAction||{}).cancelDeleteRole"
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
      <!--添加角色的对话框-->
      <el-dialog title="添加角色" :visible.sync="addDialogVisable" width="40%" @close="addDialogClosed">
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="100px"
          class="demo-addForm"
        >
          <el-form-item label="角色名" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色介绍" prop="roleIntro">
            <el-input v-model="addForm.roleIntro"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisable = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
    <!--编辑角色的对话框-->
    <el-dialog
      title="修改角色信息"
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
        <el-form-item label="角色名称" prop="hosName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色介绍" prop="hosAddress">
          <el-input v-model="editForm.roleIntro"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="updateRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--分配权限-->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisable"
      width="40%"
      @close="setRightDialogClosed"
    >
      <el-form :model="setRightForm" label-width="100px" class="demo-addForm">
        <el-tree
          :data="rightList"
          :props="rightProps"
          show-checkbox
          node-key="rightId"
          default-expand-all
          :default-checked-keys="roleRightList"
          ref="rightListTreeRef"
        ></el-tree>
        <!--
        <el-form-item label="角色名称" prop="hosName">
          <el-input v-model="setRightForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色介绍" prop="hosAddress">
          <el-input v-model="setRightForm.roleIntro"></el-input>
        </el-form-item>
        -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="updateRoleRight">确 定</el-button>
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
        roleName: ''
      },
      addDialogVisable: false,
      // 添加角色的表单数据
      addForm: {
        roleName: '',
        roleIntro: ''
      },
      // 添加角色的表单的验证规则数据
      addFormRules: {
        roleName: [{ required: true, message: '请输入角色名', trigger: 'blur' }]
      },
      editDialogVisable: false,
      editForm: {
        roleId: 0,
        roleName: '',
        roleIntro: ''
      },
      // 添加角色的表单的验证规则数据
      editFormRules: {
        roleName: [{ required: true, message: '请输入角色名', trigger: 'blur' }]
      },
      setRightDialogVisable: false,
      setRightForm: {},
      rightList: [],
      rightProps: { children: 'children', label: 'rightName' },
      roleRightList: [],
      level3RightList: [],
      right: {}
    }
  },
  created() {
    this.getRight().then(data => {
      // 查询所有角色,默认未删除的角色
      this.queryInfo.roleStatus = '1'
      this.getRoleList()
    })
  },
  methods: {
    // 监听pageSize的变化
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getRoleList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage
      this.getRoleList()
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加角色的事件函数
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          // 表单验证成功，提交信息
          const { data: result } = await this.$http.post(
            'role/save.do',
            this.addForm
          )
          this.addDialogVisable = false
          if (result.success) {
            this.getRoleList()
            return this.$message({
              message: '添加角色成功',
              type: 'success'
            })
          }
          return this.$message.error('添加角色失败')
        }
      })
    },
    // 显示编辑对话框的事件
    async showEditDialog(roleId) {
      const { data: result } = await this.$http.post(
        'role/getById.do?roleId=' + roleId
      )
      this.editForm = result
      this.editDialogVisable = true
    },
    // 编辑对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async getRoleList() {
      if (
        !(((this.right || {}).roleManagement || {}).roleAction || {}).selectRole
      ) {
        return this.$message.error('对不起，您没有查看角色的权限')
      }
      const { data: result } = await this.$http.post(
        'role/list.do?pageNum=' +
          this.queryInfo.pageNum +
          '&pageSize=' +
          this.queryInfo.pageSize,
        {
          roleName: this.queryInfo.roleName,
          roleStatus: this.queryInfo.roleStatus
        }
      )
      this.pageResult = result
    },
    // 修改角色的值
    async updateRole() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: result } = await this.$http.post(
            'role/update.do',
            this.editForm
          )
          this.editDialogVisable = false
          if (result.success) {
            this.getRoleList()
            return this.$message({
              message: result.message,
              type: 'success'
            })
          }
          return this.$message.error(result.message)
        }
      })
    },
    // 删除指定id的角色信息
    async deleteRole(roleId) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: result } = await this.$http.post(
            'role/delete.do?roleId=' + roleId
          )
          if (result.success) {
            this.getRoleList()
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
    async getRightList() {
      const { data: result } = await this.$http.post('right/listAll.do')
      this.rightList = result
      this.rightList.forEach(level1Right => {
        level1Right.children.forEach(level2Right => {
          level2Right.children.forEach(level3Right => {
            this.level3RightList.push(level3Right.rightId)
          })
        })
      })
    },
    showSetRightDialog(role) {
      this.getRightList().then(data => {
        role.rightList.forEach(level1Right => {
          level1Right.children.forEach(level2Right => {
            level2Right.children.forEach(level3Right => {
              this.roleRightList.push(level3Right.rightId)
            })
          })
        })
        this.setRightForm = role
        this.setRightDialogVisable = true
        this.$nextTick(() => {
          this.$refs.rightListTreeRef.setCheckedKeys(this.roleRightList, true)
        })
      })
    },
    setRightDialogClosed() {
      this.setRightDialogVisable = false
      this.roleRightList = []
    },
    async updateRoleRight() {
      var checkedRoleRightList = []
      this.$refs.rightListTreeRef.getCheckedKeys().forEach(checkedKey => {
        var index = this.level3RightList.indexOf(checkedKey)
        if (index !== -1) checkedRoleRightList.push(checkedKey)
      })
      var rightListString = JSON.stringify(checkedRoleRightList)
      rightListString = rightListString.substring(1, rightListString.length - 1)
      console.log(rightListString)
      const { data: result } = await this.$http.post(
        'roleright/batchSave.do?roleId=' +
          this.setRightForm.roleId +
          '&rightListString=' +
          rightListString
      )
      this.setRightDialogVisable = false
      this.getRoleList()
      if (result.success) {
        return this.$message({
          message: result.message,
          type: 'success'
        })
      }
      return this.$message.error(result.message)
    },
    async cancelDeleteRole(role) {
      role.roleStatus = 1
      const { data: result } = await this.$http.post('role/update.do', role)
      if (result.success) {
        this.getRoleList()
        return this.$message({
          message: result.message,
          type: 'success'
        })
      }
      return this.$message.error(result.message)
    },
    async getRight() {
      // 查询该页面的所有权限
      const loginName = window.sessionStorage.getItem('loginName')
      const { data: right } = await this.$http.post(
        'right/listByLoginName.do?loginName=' + loginName
      )
      this.right = right
    },
    async deleteRight(role, right) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: result } = await this.$http.post(
            'roleright/delete.do?roleId=' + role.roleId,
            right
          )
          if (result.success) {
            const { data: rightList } = await this.$http.post(
              'roleright/getByRoleId.do?roleId=' + role.roleId
            )
            role.rightList = rightList
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
