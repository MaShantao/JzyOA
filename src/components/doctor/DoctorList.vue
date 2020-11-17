<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>医院</el-breadcrumb-item>
      <el-breadcrumb-item>医生列表</el-breadcrumb-item>
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
            <el-select
              v-model="queryInfo.deptId"
              placeholder="请选择科室"
              @change="getDepartmentList"
              filterable
              remote
              :remote-method="getDepartmentList"
            >
              <el-option key="0" label="全部科室" value="0"></el-option>
              <el-option
                v-for="item in departmentList"
                :key="item.deptId"
                :label="item.deptName"
                :value="item.deptId"
              ></el-option>
            </el-select>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入医生名"
              v-model="queryInfo.docName"
              class="input-with-select"
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="getDoctorList"
              ></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col
          :span="6"
          v-if="
            (((rightList || {}).hospitalManagement || {}).doctorAction || {})
              .saveDoctor
          "
        >
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="showAddDialog"
              >添加医生</el-button
            >
          </div>
        </el-col>
      </el-row>
      <el-table :data="pageResult.rows" border style="width: 100%" stripe>
        <el-table-column type="index" label="#" width="150"></el-table-column>
        <el-table-column
          prop="department.hospital.hosName"
          label="医院名称"
        ></el-table-column>
        <el-table-column
          prop="department.deptName"
          label="科室名称"
        ></el-table-column>
        <el-table-column prop="docName" label="医生名称"></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-tooltip
              effect="dark"
              content="编辑"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.docId)"
                v-if="
                  (
                    ((rightList || {}).hospitalManagement || {}).doctorAction ||
                    {}
                  ).updateDoctor
                "
              ></el-button>
            </el-tooltip>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteDoctor(scope.row.docId)"
              v-if="
                (
                  ((rightList || {}).hospitalManagement || {}).doctorAction ||
                  {}
                ).deleteDoctor
              "
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageResult.total"
      ></el-pagination>
      <!--添加医生的对话框-->
      <el-dialog
        title="添加医生"
        :visible.sync="addDialogVisable"
        width="40%"
        @close="addDialogClosed"
      >
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="100px"
          class="demo-addForm"
        >
          <el-form-item label="医院名称">
            <el-select
              v-model="addForm.hosId"
              placeholder="请选择医院"
              @change="searchHospitalSelectChanged"
            >
              <el-option
                v-for="item in hospitalList"
                :key="item.hosId"
                :label="item.hosName"
                :value="item.hosId"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="科室名称">
            <el-select v-model="addForm.deptId" placeholder="请选择科室">
              <el-option
                v-for="item in departmentList"
                :key="item.deptId"
                :label="item.deptName"
                :value="item.deptId"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="医生名称" prop="docName">
            <el-input v-model="addForm.docName"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisable = false">取 消</el-button>
          <el-button type="primary" @click="addDoctor">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
    <!--编辑医生的对话框-->
    <el-dialog
      title="修改医生信息"
      :visible.sync="editDialogVisable"
      width="40%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
        class="demo-editForm"
      >
        <el-form-item label="医院名称">
          <el-select
            v-model="editForm.department.hosId"
            placeholder="请选择医院"
            @change="editHospitalChanged"
          >
            <el-option
              v-for="item in hospitalList"
              :key="item.hosId"
              :label="item.hosName"
              :value="item.hosId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="科室名称">
          <el-select v-model="editForm.deptId" placeholder="请选择科室">
            <el-option
              v-for="item in departmentList"
              :key="item.deptId"
              :label="item.deptName"
              :value="item.deptId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="医生名称" prop="docName">
          <el-input v-model="editForm.docName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="updateDoctor">确 定</el-button>
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
      departmentList: [{ deptId: '' }],
      queryInfo: {
        docName: '',
        pageNum: 1,
        pageSize: 5,
        hosId: '',
        deptId: ''
      },
      addDialogVisable: false,
      // 添加医生的表单数据
      addForm: {
        hosId: '',
        deptId: '',
        docName: ''
      },
      // 添加医生的表单的验证规则数据
      addFormRules: {
        docName: [{ required: true, message: '请输入医生名', trigger: 'blur' }]
      },
      editDialogVisable: false,
      editForm: {
        docId: '',
        department: { hosId: 0 },
        docName: ''
      },
      // 添加医生的表单的验证规则数据
      editFormRules: {
        docName: [{ required: true, message: '请输入医生名', trigger: 'blur' }]
      },
      rightList: {}
    }
  },
  created() {
    // 查询所有医院
    this.getRight().then((data) => {
      this.getHospitalList()
      this.getDoctorList()
    })
  },
  methods: {
    // 监听pageSize的变化
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getDoctorList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage
      this.getDoctorList()
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加医生的事件函数
    addDoctor() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (valid) {
          // 表单验证成功，提交信息
          const { data: result } = await this.$http.post(
            'doctor/save.do',
            this.addForm
          )
          this.addDialogVisable = false
          if (result.success) {
            this.getDoctorList()
            return this.$message({
              message: '添加医生成功',
              type: 'success'
            })
          }
          return this.$message.error('添加医生失败')
        }
      })
    },
    // 显示编辑对话框的事件
    async showEditDialog(docId) {
      // 查询指定docId的医生
      const { data: result } = await this.$http.post(
        'doctor/getById.do?docId=' + docId
      )
      // 查询所有的医院
      this.getHospitalList().then(() => {
        this.getDepartmentList().then(() => {
          this.editForm = result
          console.log('this.editForm')
          console.log(this.editForm)
          this.editDialogVisable = true
        })
      })
    },
    // 编辑对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 1.查询所有的医院
    async getHospitalList(hosName) {
      const {
        data: result
      } = await this.$http.post(
        'hospital/listAll.do?',
        { hosName: hosName }
      )
      this.hospitalList = result
    },
    async getDepartmentList(deptName) {
      const { data: result } = await this.$http.post('department/listAll.do', {
        hosId: this.queryInfo.hosId,
        deptName: deptName
      })
      this.departmentList = result
    },
    async showAddDialog() {
      this.getHospitalList()
      this.getDepartmentList()
      if (this.queryInfo.hosId !== '' && this.queryInfo.hosId !== '0') {
        this.addForm.hosId = this.queryInfo.hosId
      } else {
        this.addForm.hosId = this.hospitalList[0].hosId
      }
      if (this.queryInfo.deptId !== '' && this.queryInfo.deptId !== '0') {
        this.addForm.deptId = this.queryInfo.deptId
      } else {
        this.addForm.deptId = this.hospitalList[0].deptId
      }
      this.addDialogVisable = true
    },
    async getDoctorList() {
      if (
        !(((this.rightList || {}).hospitalManagement || {}).doctorAction || {})
          .selectDoctor
      ) {
        return this.$message.error('对不起，您没有查看医生的权限')
      }
      console.log(this.queryInfo)
      const { data: result } = await this.$http.post(
        'doctor/list.do?pageNum=' +
          this.queryInfo.pageNum +
          '&pageSize=' +
          this.queryInfo.pageSize,
        {
          docName: this.queryInfo.docName,
          deptId: this.queryInfo.deptId
        }
      )
      this.pageResult = result
      console.log(this.pageResult)
    },
    async updateDoctor() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (valid) {
          const { data: result } = await this.$http.post(
            'doctor/update.do',
            this.editForm
          )
          this.editDialogVisable = false
          if (result.success) {
            this.getDoctorList()
            return this.$message({
              message: '修改医生信息成功',
              type: 'success'
            })
          }
          return this.$message.error('修改医生信息失败')
        }
      })
    },
    deleteDoctor(docId) {
      this.$confirm('此操作将永久删除该医生, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: result } = await this.$http.post(
            'doctor/delete.do?docId=' + docId
          )
          if (result.success) {
            this.getDoctorList()
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
      this.getDoctorList()
    },
    editHospitalChanged() {
      console.log('this.editForm...............')
      console.log(this.editForm)
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
</style>
