<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>操作</el-breadcrumb-item>
      <el-breadcrumb-item>报告列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入内容"
              v-model="queryInfo.searchEntity.hosName"
              class="input-with-select"
            >
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="addDialogVisable = true">添加样本</el-button>
          </div>
        </el-col>
      </el-row>
      <el-table :data="hospitalList" border style="width: 100%" stripe>
        <el-table-column type="index" label="#" width="50"></el-table-column>
        <el-table-column prop="hos_name" label="医院名称" width="180"></el-table-column>
        <el-table-column prop="uuid" label="uuid" width="180"></el-table-column>
        <el-table-column prop="level" label="等级"></el-table-column>
        <el-table-column prop="hos_path" label="隶属"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.hos_name)"
              ></el-button>
            </el-tooltip>
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
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
          <el-input v-model="addForm.hosName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="addHosipital">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      hospitalList: [
        {
          hos_name: '医院1',
          uuid: '1234564789',
          level: '三甲医院',
          hos_path: '省级'
        },
        {
          hos_name: '医院1',
          uuid: '1234564789',
          level: '三甲医院',
          hos_path: '省级'
        },
        {
          hos_name: '医院1',
          uuid: '1234564789',
          level: '三甲医院',
          hos_path: '省级'
        },
        {
          hos_name: '医院1',
          uuid: '1234564789',
          level: '三甲医院',
          hos_path: '省级'
        },
        {
          hos_name: '医院1',
          uuid: '1234564789',
          level: '三甲医院',
          hos_path: '省级'
        },
        {
          hos_name: '医院1',
          uuid: '1234564789',
          level: '三甲医院',
          hos_path: '省级'
        },
        {
          hos_name: '医院1',
          uuid: '1234564789',
          level: '三甲医院',
          hos_path: '省级'
        }
      ],
      queryInfo: {
        hos_name: '',
        pageNum: 1,
        pageSize: 2,
        searchEntity: {
          hosName: ''
        }
      },
      total: 4,
      addDialogVisable: false,
      // 添加医院的表单数据
      addForm: {
        hosName: ''
      },
      // 添加医院的表单的验证规则数据
      addFormRules: {
        hosName: [{ required: true, message: '请输入医院名', trigger: 'blur' }]
      },
      editDialogVisable: false,
      editForm: {
        hosName: ''
      },
      // 添加医院的表单的验证规则数据
      editFormRules: {
        hosName: [{ required: true, message: '请输入医院名', trigger: 'blur' }]
      }
    }
  },
  created() {
    // 查询所有医院
  },
  methods: {
    // 监听pageSize的变化
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加医院的事件函数
    addHosipital() {
      this.addDialogVisable = false
      this.$refs.addFormRef.validate(valid => {
        if (valid) {
          // 表单验证成功
        }
      })
    },
    // 显示编辑对话框的事件
    showEditDialog(hostId) {
      console.log(hostId)
      this.editDialogVisable = true
    },
    // 编辑对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    }
  }
}
</script>
<style lang="less" scoped>
</style>
