<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>医院</el-breadcrumb-item>
      <el-breadcrumb-item>医院列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="grid-content bg-purple">
            <el-input placeholder="请输入内容" v-model="queryInfo.hosName" class="input-with-select">
              <el-button slot="append" icon="el-icon-search" @click="getHospitalList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col
          :span="6"
          v-if="(((rightList || {}).hospitalManagement || {}).hospitalAction||{}).saveHospital"
        >
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="addDialogVisable = true">添加医院</el-button>
          </div>
        </el-col>
      </el-row>
      <el-table :data="pageResult.rows" border style="width: 100%" stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row class="vcenter">
              <el-col :span="5">
                <el-tag>{{scope.row.hosName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(department,index1) in scope.row.departmentList"
                  :key="department+index1"
                  :class="['bdbottom','vcenter' ]"
                >
                  <el-col :span="5">
                    <el-tag type="success">{{department.deptName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="19">
                    <el-tag
                      v-for="(doctor,index2) in department.doctorList"
                      :key="doctor+index2"
                      type="warning"
                    >{{doctor.docName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="150"></el-table-column>
        <el-table-column prop="hosName" label="医院名称"></el-table-column>
        <el-table-column prop="hosAddress" label="医院地址"></el-table-column>
        <el-table-column
          label="操作"
          width="200"
          v-if="(((rightList || {}).hospitalManagement || {}).hospitalAction||{}).updateHospital||(((rightList || {}).hospitalManagement || {}).hospitalAction||{}).deleteHospital"
        >
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.hosId)"
                v-if="(((rightList || {}).hospitalManagement || {}).hospitalAction||{}).updateHospital"
              ></el-button>
            </el-tooltip>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteHospital(scope.row.hosId)"
              v-if="(((rightList || {}).hospitalManagement || {}).hospitalAction||{}).deleteHospital"
            ></el-button>
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
      <!--添加医院的对话框-->
      <el-dialog title="添加医院" :visible.sync="addDialogVisable" width="40%" @close="addDialogClosed">
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="100px"
          class="demo-addForm"
        >
          <el-form-item label="医院名称" prop="hosName">
            <el-input v-model="addForm.hosName"></el-input>
          </el-form-item>
          <el-form-item label="医院地址" prop="hosAddress">
            <el-input v-model="addForm.hosAddress"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisable = false">取 消</el-button>
          <el-button type="primary" @click="addHosipital">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
    <!--编辑医院的对话框-->
    <el-dialog
      title="修改医院信息"
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
        <el-form-item label="医院名称" prop="hosName">
          <el-input v-model="editForm.hosName"></el-input>
        </el-form-item>
        <el-form-item label="医院地址" prop="hosAddress">
          <el-input v-model="editForm.hosAddress"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="updateHospital">确 定</el-button>
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
      // 添加医院的表单数据
      addForm: {
        hosName: '',
        hosAddress: ''
      },
      // 添加医院的表单的验证规则数据
      addFormRules: {
        hosName: [{ required: true, message: '请输入医院名', trigger: 'blur' }]
      },
      editDialogVisable: false,
      editForm: {
        hosId: 0,
        hosName: '',
        hosAddress: ''
      },
      // 添加医院的表单的验证规则数据
      editFormRules: {
        hosName: [{ required: true, message: '请输入医院名', trigger: 'blur' }]
      },
      rightList: {}
    }
  },
  created() {
    // 查询所有医院
    this.getRight().then(data => {
      this.getHospitalList()
    })
  },
  methods: {
    // 监听pageSize的变化
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getHospitalList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage
      this.getHospitalList()
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加医院的事件函数
    addHosipital() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          // 表单验证成功，提交信息
          const { data: result } = await this.$http.post(
            'hospital/save.do',
            this.addForm
          )
          this.addDialogVisable = false
          if (result.success) {
            this.getHospitalList()
            return this.$message({
              message: '添加医院成功',
              type: 'success'
            })
          }
          return this.$message.error('添加医院失败')
        }
      })
    },
    // 显示编辑对话框的事件
    async showEditDialog(hosId) {
      const { data: result } = await this.$http.post(
        'hospital/getById.do?hosId=' + hosId
      )
      this.editForm = result
      this.editDialogVisable = true
    },
    // 编辑对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async getHospitalList() {
      if (
        !(
          ((this.rightList || {}).hospitalManagement || {}).hospitalAction || {}
        ).selectHospital
      ) {
        return this.$message.error('对不起，您没有查看医院的权限')
      }
      const {
        data: result
      } = await this.$http.post(
        'hospital/list.do?pageNum=' +
          this.queryInfo.pageNum +
          '&pageSize=' +
          this.queryInfo.pageSize,
        { hosName: this.queryInfo.hosName }
      )
      this.pageResult = result
    },
    // 修改医院的值
    async updateHospital() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: result } = await this.$http.post(
            'hospital/update.do',
            this.editForm
          )
          this.editDialogVisable = false
          if (result.success) {
            this.getHospitalList()
            return this.$message({
              message: '修改医院信息成功',
              type: 'success'
            })
          }
          return this.$message.error('修改医院信息失败')
        }
      })
    },
    // 删除指定id的医院信息
    async deleteHospital(hosId) {
      this.$confirm('此操作将永久删除该医院, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: result } = await this.$http.post(
            'hospital/delete.do?hosId=' + hosId
          )
          if (result.success) {
            this.getHospitalList()
            return this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }
          return this.$message.error('删除医院信息失败')
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
