<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>医院</el-breadcrumb-item>
      <el-breadcrumb-item>科室列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="5">
          <div class="grid-content bg-purple">
            <el-select
              v-model="queryInfo.hosId"
              placeholder="请选择医院"
              @change="searchHospitalSelectChanged"
              filterable
              remote
              :remote-method="getHospitalList"
            >
              <el-option key="0" label="全部医院" value="0"></el-option>
              <el-option
                v-for="item in hospitalList"
                :key="item.hosId"
                :label="item.hosName"
                :value="item.hosId"
              ></el-option>
            </el-select>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="grid-content bg-purple">
            <el-input placeholder="请输入科室名" v-model="queryInfo.deptName" class="input-with-select">
              <el-button slot="append" icon="el-icon-search" @click="getDepartmentList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col
          :span="6"
          v-if="(((rightList || {}).hospitalManagement || {}).departmentAction||{}).saveDepartment"
        >
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="showAddDialog">添加科室</el-button>
          </div>
        </el-col>
      </el-row>
      <el-table :data="pageResult.rows" border style="width: 100%" stripe>
        <el-table-column type="index" label="#" width="150"></el-table-column>
        <el-table-column prop="hospital.hosName" label="医院名称"></el-table-column>
        <el-table-column prop="deptName" label="科室名称"></el-table-column>
        <el-table-column
          label="操作"
          width="200"
          v-if="(((rightList || {}).hospitalManagement || {}).departmentAction||{}).deleteDepartment||(((rightList || {}).hospitalManagement || {}).departmentAction||{}).updateDepartment"
        >
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.deptId)"
                v-if="(((rightList || {}).hospitalManagement || {}).departmentAction||{}).updateDepartment"
              ></el-button>
            </el-tooltip>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteDepartment(scope.row.deptId)"
              v-if="(((rightList || {}).hospitalManagement || {}).departmentAction||{}).deleteDepartment"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[5, 10,15,20]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageResult.total"
      ></el-pagination>
      <!--添加科室的对话框-->
      <el-dialog title="添加科室" :visible.sync="addDialogVisable" width="40%" @close="addDialogClosed">
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="100px"
          class="demo-addForm"
        >
          <el-form-item label="医院名称">
            <el-select v-model="addForm.hosId" placeholder="请选择医院">
              <el-option
                v-for="item in hospitalList"
                :key="item.hosId"
                :label="item.hosName"
                :value="item.hosId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="科室名称" prop="deptName">
            <el-input v-model="addForm.deptName"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisable = false">取 消</el-button>
          <el-button type="primary" @click="addDepartment">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
    <!--编辑科室的对话框-->
    <el-dialog
      title="修改科室信息"
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
        <el-form-item label="医院名称">
          <el-select v-model="editForm.hospital.hosId" placeholder="请选择医院">
            <el-option key="0" label="全部医院" value="0"></el-option>
            <el-option
              v-for="item in hospitalList"
              :key="item.hosId"
              :label="item.hosName"
              :value="item.hosId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="科室名称" prop="deptName">
          <el-input v-model="editForm.deptName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="updateDepartment">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      pageResult: { total: 0, rows: [] },
      hospitalList: [{ hosId: '' }],
      queryInfo: {
        deptName: '',
        pageNum: 1,
        pageSize: 5,
        hosId: ''
      },
      addDialogVisable: false,
      // 添加科室的表单数据
      addForm: {
        hosId: '',
        deptId: '',
        deptName: ''
      },
      // 添加科室的表单的验证规则数据
      addFormRules: {
        deptName: [{ required: true, message: '请输入科室名', trigger: 'blur' }]
      },
      editDialogVisable: false,
      editForm: {
        hospital: { hosId: '', hosName: '', hosAddress: '' },
        deptId: '',
        deptName: ''
      },
      // 添加科室的表单的验证规则数据
      editFormRules: {
        deptName: [{ required: true, message: '请输入科室名', trigger: 'blur' }]
      },
      rightList: {}
    }
  },
  created() {
    // 查询所有医院
    this.getRightList().then(data => {
      this.getDepartmentList()
      this.getHospitalList()
    })
  },
  methods: {
    // 监听pageSize的变化
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getDepartmentList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage
      this.getDepartmentList()
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加科室的事件函数
    addDepartment() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          // 表单验证成功，提交信息
          const { data: result } = await this.$http.post(
            'department/save.do',
            this.addForm
          )
          this.addDialogVisable = false
          if (result.success) {
            this.getDepartmentList()
            return this.$message({
              message: '添加科室成功',
              type: 'success'
            })
          }
          return this.$message.error('添加科室失败')
        }
      })
    },
    // 显示编辑对话框的事件
    async showEditDialog(deptId) {
      // 查询指定deptId的科室
      const { data: result } = await this.$http.post(
        'department/getById.do?deptId=' + deptId
      )
      // 查询所有的医院
      this.getHospitalList()
      this.editForm = result
      console.log(this.editForm)
      this.editDialogVisable = true
    },
    // 编辑对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 1.查询所有的医院
    async getHospitalList(hospitalName) {
      const { data: hospitalList } = await this.$http.post(
        'hospital/listAll.do',
        {
          hosName: hospitalName
        }
      )
      this.hospitalList = hospitalList
    },
    async showAddDialog() {
      this.getHospitalList()
      if (this.queryInfo.hosId !== '' && this.queryInfo.hosId !== '0') {
        console.log(this.queryInfo.hosId)
        this.addForm.hosId = this.queryInfo.hosId
      } else {
        this.addForm.hosId = this.hospitalList[0].hosId
      }
      this.addDialogVisable = true
    },
    async getDepartmentList() {
      if (
        !(
          ((this.rightList || {}).hospitalManagement || {}).departmentAction ||
          {}
        ).selectDepartment
      ) {
        return this.$message.error('对不起，您没有查看科室的权限')
      }
      const {
        data: result
      } = await this.$http.post(
        'department/list.do?pageNum=' +
          this.queryInfo.pageNum +
          '&pageSize=' +
          this.queryInfo.pageSize,
        { deptName: this.queryInfo.deptName, hosId: this.queryInfo.hosId }
      )
      this.pageResult = result
      console.log(this.pageResult)
    },
    async updateDepartment() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: result } = await this.$http.post(
            'department/update.do',
            this.editForm
          )
          this.editDialogVisable = false
          if (result.success) {
            this.getDepartmentList()
            return this.$message({
              message: '修改科室信息成功',
              type: 'success'
            })
          }
          return this.$message.error('修改科室信息失败')
        }
      })
    },
    deleteDepartment(deptId) {
      this.$confirm('此操作将永久删除该科室, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: result } = await this.$http.post(
            'department/delete.do?deptId=' + deptId
          )
          if (result.success) {
            this.getDepartmentList()
            return this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }
          return this.$message.error('删除失败')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    searchHospitalSelectChanged() {
      this.getDepartmentList()
    },
    async getRightList() {
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
</style>
