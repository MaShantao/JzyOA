<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>检测样本</el-breadcrumb-item>
      <el-breadcrumb-item>检测样本列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="5">
          <div>
            <el-input
              placeholder="请输入样本条码"
              v-model="queryInfo.specimenCode"
              class="input-with-select"
              @change="getSpecimenList"
            ></el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="queryInfo.specimenTypeId"
            placeholder="选择样本类型"
            @visible-change="$forceUpdate()"
          >
            <el-option key label="全部" value></el-option>
            <el-option
              v-for="item in specimenTypeList"
              :key="item.dictId"
              :label="item.dictValue"
              :value="item.dictId"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="queryInfo.specimenStatusId"
            placeholder="是否生成报告"
            @visible-change="$forceUpdate()"
          >
            <el-option key label="全部" value></el-option>
            <el-option key="0" label="未生成报告" value="0"></el-option>
            <el-option key="1" label="生成报告" value="1"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="queryInfo.testTypeId"
            placeholder="选择检测项目"
            @visible-change="$forceUpdate()"
          >
            <el-option
              v-for="item in testTypeList"
              :key="item.dictId"
              :label="item.dictValue"
              :value="item.dictId"
            ></el-option>
          </el-select>
        </el-col>
        <el-col
          :span="4"
          v-show="
            (((rightList || {}).specimenManagement || {}).reportAction || {})
              .batchCreateNegativeReport
          "
        >
          <el-button
            type="success"
            :disabled="!batchCreateNegativeReportBtnVisable"
            @click="showBatchCreateNegativeReportDialog"
            >全部导出为阴性报告</el-button
          >
        </el-col>
      </el-row>
      <br />
      <el-row :gutter="20">
        <el-col :span="7">
          <div>
            <center class="date-title">采样日期</center>
            <el-date-picker
              v-model="queryInfo.createTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="截至日期"
              unlink-panels
              clearable
              format="yyyy年MM月dd日 HH:mm"
              value-format="yyyy年MM月dd日 HH:mm"
              @blur="$forceUpdate()"
            ></el-date-picker>
          </div>
        </el-col>
        <el-col :span="7">
          <div class="block">
            <center class="date-title">接收日期</center>
            <el-date-picker
              v-model="queryInfo.recvTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="截至日期"
              unlink-panels
              clearable
              format="yyyy年MM月dd日 HH:mm"
              value-format="yyyy年MM月dd日 HH:mm"
              @blur="$forceUpdate()"
            ></el-date-picker>
          </div>
        </el-col>
        <el-col :span="7">
          <div class="block">
            <center class="date-title">报告生成日期</center>
            <el-date-picker
              v-model="queryInfo.reportTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="截至日期"
              unlink-panels
              clearable
              format="yyyy年MM月dd日 HH:mm"
              value-format="yyyy年MM月dd日 HH:mm"
              @blur="$forceUpdate()"
              :disabled="queryInfo.specimenStatusId != 1"
            ></el-date-picker>
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row :gutter="20">
        <el-col :span="4">
          <div>
            <el-select
              v-model="queryInfo.hosId"
              placeholder="选择送检医院"
              @change="getDepartmentListByHosId(queryInfo.hosId)"
              @visible-change="$forceUpdate()"
              filterable
              remote
              :remote-method="getHospitalList"
            >
              <el-option key="0" label="全部" value="0"></el-option>
              <el-option
                v-for="item in hospitalList"
                :key="item.hosId"
                :label="item.hosName"
                :value="item.hosId"
              ></el-option>
            </el-select>
          </div>
        </el-col>
        <el-col :span="4">
          <div>
            <el-select
              v-model="queryInfo.deptId"
              placeholder="选择送检科室"
              @visible-change="$forceUpdate()"
              filterable
            >
              <el-option key label="全部" value></el-option>
              <el-option
                v-for="item in departmentList"
                :key="item.deptId"
                :label="item.deptName"
                :value="item.deptId"
              ></el-option>
            </el-select>
          </div>
        </el-col>
        <el-col :span="4">
          <div>
            <el-select
              v-model="queryInfo.patientTypeId"
              placeholder="选择病人类型"
            >
              <el-option key="0" label="全部" value="0"></el-option>
              <el-option
                v-for="item in patientTypeList"
                :key="item.dictId"
                :label="item.dictValue"
                :value="item.dictId"
                @visible-change="$forceUpdate()"
              ></el-option>
            </el-select>
          </div>
        </el-col>
        <el-col :span="4">
          <div>
            <el-select v-model="queryInfo.sortRule" placeholder="选择排序规则">
              <el-option key="0" label="自然排序" value="0"></el-option>
              <el-option key="1" label="门诊号" value="1"></el-option>
              <el-option key="2" label="接收时间" value="2"></el-option>
              <el-option key="3" label="采样时间" value="3"></el-option>
              <el-option key="4" label="样本码" value="4"></el-option>
              <el-option key="5" label="检测项目" value="5"></el-option>
              <el-option key="6" label="医院" value="6"></el-option>
            </el-select>
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row :gutter="20">
        <el-col :span="4">
          <div>
            <el-input
              placeholder="病人名字"
              v-model="queryInfo.patientName"
              class="input-with-select"
              @change="getSpecimenList"
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="getSpecimenList"
              ></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col
          :span="3"
          v-if="
            rightList.specimenManagement &&
            (((rightList || {}).specimenManagement || {}).specimenAction || {})
              .saveSpecimen
          "
        >
          <div>
            <el-button type="primary" @click="showAddDialog"
              >添加检测样本</el-button
            >
          </div>
        </el-col>
        <el-col
          :span="5"
          v-if="
            (((rightList || {}).specimenManagement || {}).specimenAction || {})
              .bathImportSpecimen
          "
        >
          <div>
            <el-upload
              class="upload-demo"
              name="uploadFile"
              :action="$http.defaults.baseURL + 'specimen/uploadFromFile.do'"
              :on-success="batchImportSuccess"
            >
              <el-button type="success">从Excel导入</el-button>
              <div slot="tip" class="el-upload__tip">只能上传excel表格文件</div>
            </el-upload>
          </div>
        </el-col>
      </el-row>
      <el-table :data="pageResult.rows" border style="width: 100%" stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-table :data="[scope.row]" border style="width: 100%" stripe>
              <el-table-column
                prop="specimenSituation.dictValue"
                label="样本情况"
              ></el-table-column>
              <el-table-column
                prop="patientAge"
                label="患者年龄"
              ></el-table-column>
              <el-table-column
                prop="patientGender"
                label="患者性别"
              ></el-table-column>
              <el-table-column prop="bedNum" label="床位"></el-table-column>
              <el-table-column
                prop="doctor.docName"
                label="医生"
              ></el-table-column>
              <el-table-column
                v-if="scope.row.specimenStatusId == 1"
                prop="report.specimenResult.dictValue"
                label="检测结果"
              ></el-table-column>
              <el-table-column
                v-if="scope.row.specimenStatusId == 1"
                prop="report.referenceValue.dictValue"
                label="参考值"
              ></el-table-column>
              <el-table-column
                prop="report.createTime"
                label="报告创建时间"
              ></el-table-column>
              <el-table-column
                v-if="scope.row.specimenStatusId == 1"
                prop="report.reporter.managerName"
                label="报告者"
              ></el-table-column>
              <el-table-column
                v-if="scope.row.specimenStatusId == 1"
                prop="report.reviewer.managerName"
                label="审核者"
              ></el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="43"></el-table-column>
        <el-table-column
          prop="specimenCode"
          label="样本码"
          sortable
        ></el-table-column>
        <el-table-column
          prop="specimenType.dictValue"
          label="样本类型"
        ></el-table-column>
        <el-table-column
          prop="testType.dictValue"
          label="检测项目"
          sortable
        ></el-table-column>
        <el-table-column prop="patientName" label="患者姓名"></el-table-column>
        <el-table-column
          prop="patientGender"
          label="性别"
          width="43"
        ></el-table-column>
        <el-table-column
          prop="patientAge"
          label="年龄"
          width="43"
        ></el-table-column>
        <el-table-column
          prop="patientTellphone"
          label="联系电话"
          width="120"
        ></el-table-column>
        <el-table-column prop="specimenStatusId" label="状态">
          <template slot-scope="scope">
            <span v-if="scope.row.specimenStatusId == 1">
              <el-tag type="success">报告</el-tag>
            </span>
            <span v-if="scope.row.specimenStatusId == 0">
              <el-tag>未报告</el-tag>
            </span>
            <span v-if="scope.row.specimenStatusId == 2">
              <el-tag type="info">已删除</el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="hospital.hosName"
          label="医院"
          sortable
        ></el-table-column>
        <el-table-column
          prop="department.deptName"
          label="科室"
        ></el-table-column>
        <el-table-column
          prop="patientType.dictValue"
          label="病人类型"
        ></el-table-column>
        <el-table-column
          prop="doorNum"
          label="门诊号"
          sortable
          :sort-method="sortByDoorNum"
        ></el-table-column>
        <el-table-column
          prop="createTime"
          label="采样时间"
          sortable
        ></el-table-column>
        <el-table-column
          prop="recvTime"
          label="接收时间"
          sortable
        ></el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-tooltip
              effect="dark"
              :content="
                scope.row.specimenStatusId == 0 ? '生成报告' : '编辑报告'
              "
              placement="top"
              :enterable="false"
            >
              <el-button
                type="success"
                icon="el-icon-document-checked"
                size="mini"
                @click="
                  scope.row.specimenStatusId == 0
                    ? showAddReportDialog(
                        scope.row.specimenId,
                        scope.row.testTypeId
                      )
                    : showEditReportDialog(scope.row)
                "
              ></el-button>
            </el-tooltip>
            <el-tooltip
              effect="dark"
              content="编辑标本"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteSpecimen(scope.row)"
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
    </el-card>
    <!--添加检测样本的对话框-->
    <el-dialog
      title="添加检测样本"
      :visible.sync="addDialogVisable"
      @close="addDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-addForm"
      >
        <el-form-item label="样本条码" prop="specimenCode">
          <el-input
            v-model="addForm.specimenCode"
            ref="specimenCodeRef"
          ></el-input>
        </el-form-item>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="检测项目" prop="testTypeId">
              <el-select
                v-model="addForm.testTypeId"
                placeholder="选择检测项目"
                @visible-change="$forceUpdate()"
                @change="addFormTestTypeChanged()"
              >
                <el-option
                  v-for="item in testTypeList"
                  :key="item.dictId"
                  :label="item.dictValue"
                  :value="item.dictId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="样本类型" prop="specimenTypeId">
              <el-select
                v-model="addForm.specimenTypeId"
                placeholder="选择样本类型"
                @visible-change="$forceUpdate()"
              >
                <el-option
                  v-for="item in specimenTypeList"
                  :key="item.dictId"
                  :label="item.dictValue"
                  :value="item.dictId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="样本状况" prop="specimenSituationId">
              <el-select
                v-model="addForm.specimenSituationId"
                placeholder="选择样本状况"
                @visible-change="$forceUpdate()"
              >
                <el-option
                  v-for="item in specimenSituationList"
                  :key="item.dictId"
                  :label="item.dictValue"
                  :value="item.dictId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="送检医院" prop="hosId">
              <el-select
                v-model="addForm.hosId"
                placeholder="选择送检医院"
                @change="getDepartmentListByHosId(addForm.hosId)"
                @visible-change="$forceUpdate()"
                filterable
                remote
                :remote-method="getHospitalList"
              >
                <el-option
                  v-for="item in hospitalList"
                  :key="item.hosId"
                  :label="item.hosName"
                  :value="item.hosId"
                  @visible-change="$forceUpdate()"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="送检科室" prop="deptId">
              <el-select
                v-model="addForm.deptId"
                placeholder="选择送检科室"
                @change="getDoctorListByDeptId(addForm.deptId)"
                @visible-change="$forceUpdate()"
                filterable
              >
                <el-option
                  v-for="item in departmentList"
                  :key="item.deptId"
                  :label="item.deptName"
                  :value="item.deptId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="送检医生" prop="docId">
              <el-select v-model="addForm.docId" placeholder="选择送检医生">
                <el-option
                  v-for="item in doctorList"
                  :key="item.docId"
                  :label="item.docName"
                  :value="item.docId"
                  @visible-change="$forceUpdate()"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="门诊号" prop="doorNum">
              <el-input v-model="addForm.doorNum"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="床位号" prop="bedNum">
              <el-input v-model="addForm.bedNum"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="病人类型" prop="patientTypeId">
              <el-select
                v-model="addForm.patientTypeId"
                placeholder="选择病人类型"
              >
                <el-option
                  v-for="item in patientTypeList"
                  :key="item.dictId"
                  :label="item.dictValue"
                  :value="item.dictId"
                  @visible-change="$forceUpdate()"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="患者姓名" prop="patientName">
              <el-input v-model="addForm.patientName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="患者年龄" prop="patientAge">
              <el-input v-model="addForm.patientAge"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="患者性别" prop="patientGender">
              <el-select
                v-model="addForm.patientGender"
                placeholder="选择病人性别"
                @visible-change="$forceUpdate()"
              >
                <el-option key="男" label="男" value="男"></el-option>
                <el-option key="女" label="女" value="女"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="联系方式" prop="patientTellphone">
              <el-input v-model="addForm.patientTellphone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="11">
            <el-form-item label="采样时间" prop="createTime">
              <el-date-picker
                v-model="addForm.createTime"
                type="datetime"
                placeholder="选择日期"
                format="yyyy年MM月dd日 HH:mm"
                value-format="yyyy年MM月dd日 HH:mm"
                @blur="$forceUpdate()"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="接收时间" prop="recvTime">
              <el-date-picker
                v-model="addForm.recvTime"
                type="datetime"
                placeholder="选择日期"
                format="yyyy年MM月dd日 HH:mm"
                value-format="yyyy年MM月dd日 HH:mm"
                @blur="$forceUpdate()"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="addSpecimen">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑检测样本的对话框-->
    <el-dialog
      title="编辑检测样本"
      :visible.sync="editDialogVisable"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
        class="demo-editForm"
      >
        <el-form-item label="样本条码" prop="specimenCode">
          <el-input v-model="editForm.specimenCode"></el-input>
        </el-form-item>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="检测项目" prop="testTypeId">
              <el-select
                v-model="editForm.testTypeId"
                placeholder="选择检测项目"
                @change="editFormTestTypeChanged"
                @visible-change="$forceUpdate()"
              >
                <el-option
                  v-for="item in testTypeList"
                  :key="item.dictId"
                  :label="item.dictValue"
                  :value="item.dictId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="样本类型" prop="specimenTypeId">
              <el-select
                v-model="editForm.specimenTypeId"
                placeholder="选择样本类型"
                @visible-change="$forceUpdate()"
              >
                <el-option
                  v-for="item in specimenTypeList"
                  :key="item.dictId"
                  :label="item.dictValue"
                  :value="item.dictId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="样本状况" prop="specimenSituationId">
              <el-select
                v-model="editForm.specimenSituationId"
                placeholder="选择样本状况"
                @visible-change="$forceUpdate()"
              >
                <el-option
                  v-for="item in specimenSituationList"
                  :key="item.dictId"
                  :label="item.dictValue"
                  :value="item.dictId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="送检医院" prop="hosId">
              <el-select
                v-model="editForm.hosId"
                placeholder="选择送检医院"
                @change="getDepartmentListByHosId(editForm.hosId)"
                @visible-change="$forceUpdate()"
                filterable
                remote
                :remote-method="getHospitalList"
              >
                <el-option
                  v-for="item in hospitalList"
                  :key="item.hosId"
                  :label="item.hosName"
                  :value="item.hosId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="送检科室" prop="deptId">
              <el-select
                v-model="editForm.deptId"
                placeholder="选择送检科室"
                @change="getDoctorListByDeptId(editForm.deptId)"
                @visible-change="$forceUpdate()"
                filterable
              >
                <el-option
                  v-for="item in departmentList"
                  :key="item.deptId"
                  :label="item.deptName"
                  :value="item.deptId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="送检医生" prop="docId">
              <el-select
                v-model="editForm.docId"
                placeholder="选择送检医生"
                @visible-change="$forceUpdate()"
              >
                <el-option
                  v-for="item in doctorList"
                  :key="item.docId"
                  :label="item.docName"
                  :value="item.docId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="门诊号" prop="doorNum">
              <el-input v-model="editForm.doorNum"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="床位号" prop="bedNum">
              <el-input v-model="editForm.bedNum"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="病人类型" prop="patientTypeId">
              <el-select
                v-model="editForm.patientTypeId"
                placeholder="选择病人类型"
              >
                <el-option
                  v-for="item in patientTypeList"
                  :key="item.dictId"
                  :label="item.dictValue"
                  :value="item.dictId"
                  @visible-change="$forceUpdate()"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item label="患者姓名" prop="patientName">
              <el-input v-model="editForm.patientName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="患者年龄" prop="patientAge">
              <el-input v-model="editForm.patientAge"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="患者性别" prop="patientGender">
              <el-select
                v-model="editForm.patientGender"
                placeholder="选择病人性别"
                @visible-change="$forceUpdate()"
              >
                <el-option key="男" label="男" value="男"></el-option>
                <el-option key="女" label="女" value="女"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="联系方式" prop="patientTellphone">
              <el-input v-model="editForm.patientTellphone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="11">
            <el-form-item label="采样时间" prop="createTime">
              <el-date-picker
                v-model="editForm.createTime"
                type="datetime"
                placeholder="选择日期"
                format="yyyy年MM月dd日 HH:mm"
                value-format="yyyy年MM月dd日 HH:mm"
                @blur="$forceUpdate()"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="接收时间" prop="recvTime">
              <el-date-picker
                v-model="editForm.recvTime"
                type="datetime"
                placeholder="选择日期"
                format="yyyy年MM月dd日 HH:mm"
                value-format="yyyy年MM月dd日 HH:mm"
                @blur="$forceUpdate()"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="editSpecimen">确 定</el-button>
      </span>
    </el-dialog>
    <!--生成报告的对话框-->
    <el-dialog
      title="生成报告"
      :visible.sync="addReportDialogVisable"
      width="35%"
      @close="addReportDialogClosed"
    >
      <el-form
        :model="addReportForm"
        :rules="addReportFormRules"
        ref="addReportFormRef"
        label-width="100px"
        class="demo-addReportForm"
      >
        <el-form-item label="报告结果" prop="specimenResultId">
          <el-select
            v-model="addReportForm.specimenResultId"
            placeholder="选择报告结果"
            @visible-change="$forceUpdate()"
            style="width: 90%"
          >
            <el-option
              v-for="item in specimenResultList"
              :key="item.dictId"
              :label="item.dictValue"
              :value="item.dictId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="参考值" prop="referenceValueId">
          <el-select
            v-model="addReportForm.referenceValueId"
            placeholder="选择参考值"
            @visible-change="$forceUpdate()"
            style="width: 90%"
          >
            <el-option
              v-for="item in specimenResultList"
              :key="item.dictId"
              :label="item.dictValue"
              :value="item.dictId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="报告者" prop="reporterId">
          <el-select
            v-model="addReportForm.reporterId"
            placeholder="选择报告者"
            @visible-change="$forceUpdate()"
          >
            <el-option
              v-for="item in reporterList"
              :key="item.managerId"
              :label="item.managerName"
              :value="item.managerId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核者" prop="reviewerId">
          <el-select
            v-model="addReportForm.reviewerId"
            placeholder="选择审核者"
            @visible-change="$forceUpdate()"
          >
            <el-option
              v-for="item in reviewerList"
              :key="item.managerId"
              :label="item.managerName"
              :value="item.managerId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="报告时间" prop="createTime">
          <el-date-picker
            v-model="addReportForm.createTime"
            type="datetime"
            placeholder="选择日期"
            format="yyyy年MM月dd日 HH:mm"
            value-format="yyyy年MM月dd日 HH:mm"
            @blur="$forceUpdate()"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addReportDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="addReport">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑报告的对话框-->
    <el-dialog
      title="编辑报告"
      :visible.sync="editReportDialogVisable"
      width="35%"
      @close="editReportDialogClosed"
    >
      <el-form
        :model="editReportForm"
        :rules="editReportFormRules"
        ref="editReportFormRef"
        label-width="100px"
      >
        <el-form-item label="报告结果" prop="specimenResultId">
          <el-select
            v-model="editReportForm.specimenResultId"
            placeholder="选择报告结果"
            @visible-change="$forceUpdate()"
            style="width: 90%"
          >
            <el-option
              v-for="item in specimenResultList"
              :key="item.dictId"
              :label="item.dictValue"
              :value="item.dictId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="参考值" prop="referenceValueId">
          <el-select
            v-model="editReportForm.referenceValueId"
            placeholder="选择参考值"
            @visible-change="$forceUpdate()"
            style="width: 90%"
          >
            <el-option
              v-for="item in specimenResultList"
              :key="item.dictId"
              :label="item.dictValue"
              :value="item.dictId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="报告者" prop="reporterId">
          <el-select
            v-model="editReportForm.reporterId"
            placeholder="选择报告者"
            @visible-change="$forceUpdate()"
          >
            <el-option
              v-for="item in reporterList"
              :key="item.managerId"
              :label="item.managerName"
              :value="item.managerId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核者" prop="reviewerId">
          <el-select
            v-model="editReportForm.reviewerId"
            placeholder="选择审核者"
            @visible-change="$forceUpdate()"
          >
            <el-option
              v-for="item in reviewerList"
              :key="item.managerId"
              :label="item.managerName"
              :value="item.managerId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="报告时间" prop="createTime">
          <el-date-picker
            v-model="editReportForm.createTime"
            type="datetime"
            placeholder="选择日期"
            format="yyyy年MM月dd日 HH:mm"
            value-format="yyyy年MM月dd日 HH:mm"
            @blur="$forceUpdate()"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editReportDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="editReport">确 定</el-button>
      </span>
    </el-dialog>
    <!--全部导出为阴性报告对话框-->
    <el-dialog
      title="批量生成阴性报告"
      :visible.sync="batchCreateNegativeReportDialogVisable"
      width="35%"
      @close="batchCreateNegativeReportDialogClosed"
    >
      <el-form
        :model="batchCreateNegativeReportForm"
        :rules="batchCreateNegativeReportFormRules"
        ref="batchCreateNegativeReportFormRef"
        label-width="100px"
      >
        <el-form-item label="报告者" prop="reporterId">
          <el-select
            v-model="batchCreateNegativeReportForm.reporterId"
            placeholder="选择报告者"
            @visible-change="$forceUpdate()"
          >
            <el-option
              v-for="item in reporterList"
              :key="item.managerId"
              :label="item.managerName"
              :value="item.managerId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核者" prop="reviewerId">
          <el-select
            v-model="batchCreateNegativeReportForm.reviewerId"
            placeholder="选择审核者"
            @visible-change="$forceUpdate()"
          >
            <el-option
              v-for="item in reviewerList"
              :key="item.managerId"
              :label="item.managerName"
              :value="item.managerId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="报告时间" prop="createTime">
          <el-date-picker
            v-model="batchCreateNegativeReportForm.createTime"
            type="datetime"
            placeholder="选择日期"
            format="yyyy年MM月dd日 HH:mm"
            value-format="yyyy年MM月dd日 HH:mm"
            @blur="$forceUpdate()"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="batchCreateNegativeReportDialogVisable = false"
          >取 消</el-button
        >
        <el-button type="primary" @click="batchCreateNegativeReport"
          >确 定</el-button
        >
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
        specimenCode: '',
        createTime: '',
        recvTime: '',
        reportTime: '',
        sortRule: '',
        specimenStatusId: undefined,
        hosId: '0'
      },
      addDialogVisable: false,
      // 添加检测样本的表单数据
      addForm: {
        specimenCode: '',
        hosId: '',
        deptId: '',
        docId: '',
        bedNum: '',
        doorNum: '',
        patientName: '',
        patientAge: '',
        patientTellphone: '',
        patientGender: '',
        specimenTypeId: '',
        specimenSituationId: '',
        specimenStatusId: 0
      },
      // 添加检测样本的表单的验证规则数据
      addFormRules: {
        specimenCode: [
          { required: true, message: '请输入样本条码', trigger: 'blur' }
        ],
        createTime: [
          { required: true, message: '请选择采样日期', trigger: 'blur' }
        ],
        recvTime: [
          { required: true, message: '请输入接收时间', trigger: 'blur' }
        ],
        testTypeId: [
          { required: true, message: '请选择检测项目', trigger: 'blur' }
        ],
        specimenTypeId: [
          { required: true, message: '请选择样本类型', trigger: 'blur' }
        ],
        hosId: [{ required: true, message: '请选择医院', trigger: 'blur' }]
      },
      editDialogVisable: false,
      editForm: {
        specimenCode: '',
        hosId: '',
        deptId: '',
        docId: '',
        bedNum: '',
        doorNum: '',
        patientName: '',
        patientAge: '',
        patientTellphone: '',
        patientGender: '',
        specimenTypeId: 0,
        specimenSituationId: 0,
        specimenStatusId: 0
      },
      // 添加检测样本的表单的验证规则数据
      editFormRules: {
        specimenCode: [
          { required: true, message: '请输入检测样本名', trigger: 'blur' }
        ],
        createTime: [
          { required: true, message: '请选择采样日期', trigger: 'blur' }
        ],
        recvTime: [
          { required: true, message: '请输入接收时间', trigger: 'blur' }
        ],
        testTypeId: [
          { required: true, message: '请选择检测项目', trigger: 'blur' }
        ],
        specimenTypeId: [
          { required: true, message: '请选择样本类型', trigger: 'blur' }
        ],
        hosId: [{ required: true, message: '请选择医院', trigger: 'blur' }]
      },
      addReportDialogVisable: false,
      addReportForm: {
        referenceValueId: '',
        reporterId: '',
        reviewerId: ''
      },
      addReportFormRules: {
        createTime: [
          { required: true, message: '请输入报告时间', trigger: 'blur' }
        ]
      },
      editReportDialogVisable: false,
      editReportForm: {
        referenceValueId: '',
        reporterId: '',
        reviewerId: ''
      },
      editReportFormRules: {
        createTime: [
          { required: true, message: '请输入报告时间', trigger: 'blur' }
        ]
      },
      specimenResultList: [{ dictId: 0, dictName: '', dictValue: '' }],
      // 检测项目类型
      testTypeList: [{ dictId: 0, dictName: '', dictValue: '' }],
      reporterList: [{ managerId: 0, managerName: '', managerType: '' }],
      reviewerList: [{ managerId: 0, managerName: '', managerType: '' }],
      // 样本类型
      specimenTypeList: [{ dictId: 0, dictName: '', dictValue: '' }],
      // 样本状况
      specimenSituationList: [{ dictId: 0, dictName: '', dictValue: '' }],
      // 医院列表
      hospitalList: [],
      // 科室列表
      departmentList: [],
      // 医生列表
      doctorList: [],
      rightList: {},
      patientTypeList: [],
      batchCreateNegativeReportBtnVisable: false,
      batchCreateNegativeReportDialogVisable: false,
      batchCreateNegativeReportForm: { reporterId: '', reviewerId: '' },
      batchCreateNegativeReportFormRules: {
        reviewerId: [
          { required: true, message: '请选择审查者', trigger: 'blur' }
        ],
        reporterId: [
          { required: true, message: '请选择报告者', trigger: 'blur' }
        ],
        createTime: [
          { required: true, message: '请输入报告时间', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 加载所有权限
    this.getRight()
    // 查询所有检测样本
    this.getSpecimenList()
    // 查询样本类型
    this.listAllDictionary({ dictName: 'specimen_type' }).then((data) => {
      this.specimenTypeList = data
    })
    // 查询检测项目
    this.listAllDictionary({ dictName: 'test_types' }).then((data) => {
      this.testTypeList = data
    })
    // 查询所有医院
    this.getHospitalList()
    // 查询所有科室
    this.getDepartmentListByHosId(0)
    // 加载病人类型列表
    this.listAllDictionary({ dictName: 'patient_type' }).then((data) => {
      this.patientTypeList = data
    })
  },
  methods: {
    // 监听pageSize的变化
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getSpecimenList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageNum = newPage
      this.getSpecimenList()
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      // this.$refs.addFormRef.resetFields()
      this.addForm.specimenCode = ''
      this.addForm.patientName = ''
      this.addForm.patientAge = ''
      this.addForm.patientTellphone = ''
      this.addForm.doorNum = ''
      this.addForm.bedNum = ''
    },
    getNowDate() {
      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      if (month < 10) month = '0' + month
      if (day < 10) day = '0' + day
      return year + '年' + month + '月' + day + '日'
    },
    // 添加报告的事件函数
    addReport() {
      // 表单验证成功，提交信息
      this.$refs.addReportFormRef.validate(async (valid) => {
        if (valid) {
          // 修复无效的时间，比如00:00
          this.$http
            .post('report/save.do', this.addReportForm, {
              responseType: 'arraybuffer'
            })
            .then(async (result) => {
              const blob = new Blob([result.data], {
                type: 'application/pdf;'
              })
              const downloadTag = document.createElement('a')
              const href = window.URL.createObjectURL(blob)
              downloadTag.href = href
              // 文件名中有中文 则对文件名进行转码
              // 生成文件路径
              const { data: specimen } = await this.$http.post(
                'specimen/getDetailsById.do?specimenId=' +
                  this.addReportForm.specimenId
              )
              const fileName =
                specimen.specimenCode +
                '-' +
                specimen.patientName +
                '-' +
                specimen.testType.dictValue
              downloadTag.download = decodeURIComponent(fileName)
              // 利用a标签做下载
              document.body.appendChild(downloadTag)
              downloadTag.click()
              document.body.removeChild(downloadTag)
              window.URL.revokeObjectURL(href)
              this.getSpecimenList()
              this.addReportDialogVisable = false
              return this.$message({
                message: '报告保存成功',
                type: 'success'
              })
            })
        }
      })
    },
    // 编辑报告的函数
    async editReport() {
      this.$refs.editReportFormRef.validate(async (valid) => {
        if (valid) {
          this.$http
            .post('report/update.do', this.editReportForm, {
              responseType: 'arraybuffer'
            })
            .then(async (result) => {
              const blob = new Blob([result.data], {
                type: 'application/pdf;'
              })
              const downloadTag = document.createElement('a')
              const href = window.URL.createObjectURL(blob)
              downloadTag.href = href
              // 文件名中有中文 则对文件名进行转码
              // 生成文件路径
              const { data: specimen } = await this.$http.post(
                'specimen/getDetailsById.do?specimenId=' +
                  this.editReportForm.specimenId
              )
              const fileName =
                specimen.specimenCode +
                '-' +
                specimen.patientName +
                '-' +
                specimen.testType.dictValue
              downloadTag.download = decodeURIComponent(fileName)
              // 利用a标签做下载
              document.body.appendChild(downloadTag)
              downloadTag.click()
              document.body.removeChild(downloadTag)
              window.URL.revokeObjectURL(href)
              this.getSpecimenList()
              this.editReportDialogVisable = false
              return this.$message({
                message: '报告更新成功',
                type: 'success'
              })
            })
        }
      })
    },
    // 显示编辑对话框的事件
    async showEditDialog(specimen) {
      if (
        (((this.rightList || {}).specimenManagement || {}).specimenAction ||
          {}) === undefined ||
        (specimen.specimenStatusId === 0 &&
          (
            ((this.rightList || {}).specimenManagement || {}).specimenAction ||
            {}
          ).updateNoReportSpecimen === undefined) ||
        (specimen.specimenStatusId === 1 &&
          (
            ((this.rightList || {}).specimenManagement || {}).specimenAction ||
            {}
          ).updateReportedSpecimen === undefined)
      ) {
        return this.$message.error('对不起，您没有编辑样本的权限')
      }
      // 1.查询样本状态
      this.listAllDictionary({ dictName: 'specimen_situation' }).then(
        (data) => {
          this.specimenSituationList = data
        }
      )
      // 2.查询样本的检测项目类型 testTypeList
      this.listAllDictionary({ dictName: 'test_types' }).then((data) => {
        this.testTypeList = data
      })
      // 4.得到所有的医院列表
      this.getHospitalList()
      // 5.查询所有的病人类型
      this.listAllDictionary({ dictName: 'patient_type' }).then((data) => {
        this.patientTypeList = data
      })
      // 7.查询样本类型
      this.listAllDictionary({
        dictName: specimen.testTypeId + '_specimen_type'
      }).then((data) => {
        this.specimenTypeList = data
        this.editForm = JSON.parse(JSON.stringify(specimen))
        // 5.得到所有的科室
        this.getDepartmentListByHosId(this.editForm.hosId)
        // 6.查询所有医生
        this.getDoctorListByDeptId(this.editForm.deptId)
        this.editDialogVisable = true
      })
    },
    // 编辑对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async getSpecimenList() {
      this.queryInfo.createTime = ''
      this.queryInfo.reportTime = ''
      this.queryInfo.recvTime = ''
      // 拼接时间
      if (
        this.queryInfo.createTimeRange !== null &&
        this.queryInfo.createTimeRange !== '' &&
        Array.isArray(this.queryInfo.createTimeRange)
      ) {
        this.queryInfo.createTime =
          this.queryInfo.createTimeRange[0] +
          '--' +
          this.queryInfo.createTimeRange[1]
      }
      if (
        this.queryInfo.recvTimeRange !== null &&
        this.queryInfo.recvTimeRange !== '' &&
        Array.isArray(this.queryInfo.recvTimeRange)
      ) {
        this.queryInfo.recvTime =
          this.queryInfo.recvTimeRange[0] +
          '--' +
          this.queryInfo.recvTimeRange[1]
      }
      if (
        this.queryInfo.reportTimeRange !== null &&
        this.queryInfo.reportTimeRange !== '' &&
        Array.isArray(this.queryInfo.reportTimeRange)
      ) {
        this.queryInfo.reportTime =
          this.queryInfo.reportTimeRange[0] +
          '--' +
          this.queryInfo.reportTimeRange[1]
      }
      console.log({
        specimenCode: this.queryInfo.specimenCode,
        patientName: this.queryInfo.patientName,
        testTypeId: this.queryInfo.testTypeId,
        specimenTypeId: this.queryInfo.specimenTypeId,
        specimenStatusId: this.queryInfo.specimenStatusId,
        hosId: this.queryInfo.hosId,
        deptId: this.queryInfo.deptId,
        createTime: this.queryInfo.createTime,
        recvTime: this.queryInfo.recvTime,
        report: { createTime: this.queryInfo.reportTime },
        patientTypeId: this.queryInfo.patientTypeId
      })
      const { data: result } = await this.$http.post(
        'specimen/list.do?pageNum=' +
          this.queryInfo.pageNum +
          '&pageSize=' +
          this.queryInfo.pageSize +
          '&sortRule=' +
          this.queryInfo.sortRule,
        {
          specimenCode: this.queryInfo.specimenCode,
          patientName: this.queryInfo.patientName,
          testTypeId: this.queryInfo.testTypeId,
          specimenTypeId: this.queryInfo.specimenTypeId,
          specimenStatusId: this.queryInfo.specimenStatusId,
          hosId: this.queryInfo.hosId,
          deptId: this.queryInfo.deptId,
          createTime: this.queryInfo.createTime,
          recvTime: this.queryInfo.recvTime,
          report: { createTime: this.queryInfo.reportTime },
          patientTypeId: this.queryInfo.patientTypeId
        }
      )
      this.pageResult = result
      this.batchCreateNegativeReportBtnVisable =
        this.queryInfo.specimenStatusId === '0' && this.queryInfo.hosId !== '0'
    },
    // 修改检测样本的值
    editSpecimen() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (valid) {
          // 修复不合法的时间，比如 00:00
          const { data: result } = await this.$http.post(
            'specimen/update.do',
            this.editForm
          )
          this.editDialogVisable = false
          if (result.success) {
            this.getSpecimenList()
            return this.$message({
              message: result.message,
              type: 'success'
            })
          }
          this.getSpecimenList()
          return this.$message.error(result.message)
        }
      })
    },
    // 删除指定id的检测样本信息
    async deleteSpecimen(specimen) {
      if (
        (((this.rightList || {}).specimenManagement || {}).specimenAction ||
          {}) === undefined ||
        (specimen.specimenStatusId === 0 &&
          (
            ((this.rightList || {}).specimenManagement || {}).specimenAction ||
            {}
          ).deleteReportedSpecimen === undefined) ||
        (specimen.specimenStatusId === 1 &&
          (
            ((this.rightList || {}).specimenManagement || {}).specimenAction ||
            {}
          ).deleteNoReportSpecimen === undefined)
      ) {
        return this.$message.error('对不起，您没有删除样本的权限')
      }
      this.$confirm('此操作将永久删除该检测样本, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: result } = await this.$http.post(
            'specimen/delete.do?specimenId=' + specimen.specimenId
          )
          this.getSpecimenList()
          if (result.success) {
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
    async getManagerList() {
      // 得到所有的报告者
      const { data: reporterId } = await this.$http.post('dictionary/list.do', {
        dictName: 'manager_type_reporter'
      })
      const { data: reporterList } = await this.$http.post(
        'manager/listAll.do',
        {
          managerType: reporterId[0].dictId
        }
      )
      this.reporterList = reporterList
      // 得到所有的审查者
      const { data: reviewerId } = await this.$http.post('dictionary/list.do', {
        dictName: 'manager_type_reviewer'
      })
      const { data: reviewerList } = await this.$http.post(
        'manager/listAll.do',
        {
          managerType: reviewerId[0].dictId
        }
      )
      this.reviewerList = reviewerList
    },
    async showAddReportDialog(specimenId, testTypeId) {
      if (
        this.rightList.specimenManagement === undefined ||
        this.rightList.specimenManagement.reportAction === undefined ||
        this.rightList.specimenManagement.reportAction.saveReport === undefined
      ) {
        return this.$message.error('对不起，您没有生成报告的权限')
      }
      this.addReportForm.specimenId = specimenId
      // 1.查询指定的检测结果和参考值
      this.listAllDictionary({ dictName: testTypeId + '_result' }).then(
        (data) => {
          this.specimenResultList = data
          this.addReportForm.specimenResultId = data[0].dictId
          this.addReportForm.referenceValueId = data[0].dictId
        }
      )
      // 2.查詢所有的報告者和審核者
      this.getManagerList().then((data) => {
        this.addReportForm.reporterId = this.reporterList[0].managerId
        this.addReportForm.reviewerId = this.reviewerList[0].managerId
        // console.log(this.getNowDateTime())
        // this.addReportForm.createTime = this.getNowDateTime()
        this.addReportDialogVisable = true
      })
    },
    // 显示编辑报告的对话框
    async showEditReportDialog(specimen) {
      const editSpecimen = JSON.parse(JSON.stringify(specimen))
      if (
        this.rightList.specimenManagement === undefined ||
        this.rightList.specimenManagement.reportAction === undefined ||
        this.rightList.specimenManagement.reportAction.updateReport ===
          undefined
      ) {
        return this.$message.error('对不起，您没有编辑报告的权限')
      }
      this.editReportForm.reportId = editSpecimen.report.reportId
      this.editReportForm.specimenId = editSpecimen.specimenId
      // 1.查询指定的检测结果和参考值
      this.listAllDictionary({
        dictName: editSpecimen.testTypeId + '_result'
      }).then((data) => {
        this.specimenResultList = data
        this.editReportForm.specimenResultId =
          editSpecimen.report.specimenResultId
        this.editReportForm.referenceValueId =
          editSpecimen.report.referenceValueId
      })
      // 3.查詢所有的報告者和審核者
      this.getManagerList().then((data) => {
        this.editReportForm.reporterId = editSpecimen.report.reporterId
        this.editReportForm.reviewerId = editSpecimen.report.reviewerId
        this.editReportForm.createTime = editSpecimen.report.createTime
        this.editReportDialogVisable = true
      })
    },
    addReportDialogClosed() {
      this.$refs.addReportFormRef.resetFields()
    },
    editReportDialogClosed() {
      this.$refs.editReportFormRef.resetFields()
    },
    batchCreateNegativeReportDialogClosed() {
      this.$refs.batchCreateNegativeReportFormRef.resetFields()
    },
    async diagnosticItemSelectChanged(newValue) {
      const { data: specimenResultList } = await this.$http.post(
        'dictionary/list.do',
        {
          dictName: newValue + '_result'
        }
      )
      this.specimenResultList = specimenResultList
      this.addReportForm.specimenResultId = specimenResultList[0].dictId
      this.addReportForm.referenceValueId = specimenResultList[0].dictId
    },
    async listAllDictionary(searchDictionary) {
      const { data: result } = await this.$http.post(
        'dictionary/list.do',
        searchDictionary
      )
      return result
    },
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
      // 1.查询样本的检测项目类型 testTypeList
      this.listAllDictionary({ dictName: 'test_types' })
        .then((data) => {
          this.testTypeList = data
          // this.addForm.testTypeId = data[0].dictId
          return this.listAllDictionary({
            dictName: data[0].dictId + '_specimen_type'
          })
        })
        .then((data) => {
          this.specimenTypeList = data
          // this.addForm.specimenTypeId = data[0].dictId
        })
      // 2.查询样本类型
      this.listAllDictionary({ dictName: 'specimen_situation' })
        .then((data) => {
          this.specimenSituationList = data
          // this.addForm.specimenSituationId = data[0].dictId
        })
        .then((data) => {
          // this.addForm.recvTime = this.getNowDateTime()
          // this.addForm.createTime = this.getNowDateTime()
          this.addDialogVisable = true
          this.$nextTick(function () {
            this.$refs.specimenCodeRef.focus()
          })
        })
      // 3.查询所有的病人类型
      this.listAllDictionary({ dictName: 'patient_type' })
        .then((data) => {
          this.patientTypeList = data
        })
        .then((data) => {
          this.addDialogVisable = true
          this.$nextTick(function () {
            this.$refs.specimenCodeRef.focus()
          })
        })
      // 4.得到所有的医院列表
      // this.getHospitalList()
      // 5.得到所有的科室
      // this.getDepartmentListByHosId(this.addForm.hosId)
      // 6.查询所有医院
      // this.getDoctorListByDeptId(this.addForm.deptId)
      // 7.设置默认日期
      // this.addForm.createTime = this.getNowDate()
      // this.addForm.recvTime = this.getNowDate()
    },
    addSpecimen() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (valid) {
          // 修复不合法的时间，比如 00:00
          const { data: result } = await this.$http.post(
            'specimen/save.do',
            this.addForm
          )
          this.addDialogVisable = false
          if (result.success) {
            this.getSpecimenList()
            return this.$message({
              message: result.message,
              type: 'success'
            })
          }
          return this.$message.error(result.message)
        }
      })
    },
    async getDepartmentListByHosId(hosId) {
      const { data: departmentList } = await this.$http.post(
        'department/listAll.do?',
        {
          hosId: hosId
        }
      )
      this.departmentList = departmentList
    },
    async getDoctorListByDeptId(departmentId) {
      const { data: doctorList } = await this.$http.post('doctor/listAll.do', {
        docName: '',
        deptId: departmentId
      })
      this.doctorList = doctorList
    },
    addFormTestTypeChanged() {
      this.listAllDictionary({
        dictName: this.addForm.testTypeId + '_specimen_type'
      }).then((data) => {
        this.specimenTypeList = data
        this.addForm.specimenTypeId = data[0].dictId
      })
    },
    editFormTestTypeChanged() {
      this.listAllDictionary({
        dictName: this.editForm.testTypeId + '_specimen_type'
      }).then((data) => {
        this.specimenTypeList = data
        this.editForm.specimenTypeId = data[0].dictId
      })
    },
    batchImportSuccess(res, file) {
      if (res.success) {
        this.getSpecimenList()
        return this.$message({
          message: res.message,
          type: 'success'
        })
      }
      return this.$message.error(res.message)
    },
    sortByNumber(a, b) {
      a = parseInt(a)
      b = parseInt(b)
      if (a > b) return 1
      else if (b > a) return -1
      else return 0
    },
    sortByDoorNum(obj1, obj2) {
      return this.sortByNumber(obj1.doorNum, obj2.doorNum)
    },
    async getRight() {
      // 查询该页面的所有权限
      const loginName = window.sessionStorage.getItem('loginName')
      const { data: rightList } = await this.$http.post(
        'right/listByLoginName.do?loginName=' + loginName
      )
      this.rightList = rightList
    },
    showBatchCreateNegativeReportDialog() {
      this.$confirm(
        '将当前查询到的' +
          this.pageResult.total +
          '条样本全部导出为阴性, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(async () => {
          // 查詢所有的報告者和審核者
          this.getManagerList().then((data) => {
            this.batchCreateNegativeReportForm.reporterId = this.reporterList[0].managerId
            this.batchCreateNegativeReportForm.reviewerId = this.reviewerList[0].managerId
            this.batchCreateNegativeReportDialogVisable = true
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消该操作'
          })
        })
    },
    batchCreateNegativeReport() {
      this.$refs.batchCreateNegativeReportFormRef.validate(async (valid) => {
        if (valid) {
          this.batchCreateNegativeReportDialogVisable = false
          this.$http
            .post(
              'report/batchSaveAsNegative.do?reporterId=' +
                this.batchCreateNegativeReportForm.reporterId +
                '&reviewerId=' +
                this.batchCreateNegativeReportForm.reviewerId +
                '&createTime=' +
                encodeURI(
                  encodeURI(this.batchCreateNegativeReportForm.createTime)
                ),
              this.queryInfo,
              {
                responseType: 'blob'
              }
            )
            .then(async (response) => {
              // 前提是服务端要在header设置Access-Control-Expose-Headers: Content-Disposition
              // 前端才能正常获取到Content-Disposition内容
              const disposition = response.headers['content-disposition']
              let fileName = disposition.substring(
                disposition.indexOf('filename=') + 9,
                disposition.length
              )
              // iso8859-1的字符转换成中文
              fileName = decodeURI(escape(fileName))
              // 去掉双引号
              fileName = fileName.replace('"', '')
              const content = response.data
              // 创建a标签并点击， 即触发下载
              const url = window.URL.createObjectURL(new Blob([content]))
              const link = document.createElement('a')
              link.style.display = 'none'
              link.href = url
              link.setAttribute('download', fileName)
              // link.download = "测试下载文件.xls"
              // 模拟
              document.body.appendChild(link)
              link.click()
              // 释放URL 对象
              window.URL.revokeObjectURL(link.href)
              document.body.removeChild(link)
              this.getSpecimenList()
              this.addReportDialogVisable = false
              return this.$message({
                message: '阴性报告批量成功',
                type: 'success'
              })
            })
        }
      })
    }
  },
  directives: {
    focus: {
      inserted: function (el, option) {
        var defClass = 'el-input'
        var defTag = 'input'
        var value = option.value || true
        if (typeof value === 'boolean') {
          value = { cls: defClass, tag: defTag, foc: value }
        } else {
          value = {
            cls: value.cls || defClass,
            tag: value.tag || defTag,
            foc: value.foc || false
          }
        }
        if (el.classList.contains(value.cls) && value.foc) {
          el.getElementsByTagName(value.tag)[0].focus()
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
.date-title {
  margin-bottom: 10px;
}
</style>
