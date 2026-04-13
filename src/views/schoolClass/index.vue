<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="班级架构管理"
      :columns="columns"
      :request-api="getSchoolClassList"
      :init-param="initParam"
      :pagination="false"
    >
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增班级</el-button>
      </template>
    </ProTable>

    <el-dialog v-model="dialogVisible" title="新增班级" width="400px">
      <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="所属年级" prop="grade_name">
          <el-select v-model="formData.grade_name" placeholder="请选择或输入年级" filterable allow-create>
            <el-option label="一年级" value="一年级" />
            <el-option label="二年级" value="二年级" />
            <el-option label="三年级" value="三年级" />
            <el-option label="四年级" value="四年级" />
            <el-option label="五年级" value="五年级" />
            <el-option label="六年级" value="六年级" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级名称" prop="class_name">
          <el-input v-model="formData.class_name" placeholder="例如：1班" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="schoolClass">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { CirclePlus } from "@element-plus/icons-vue";
import ProTable from "@/components/ProTable/index.vue";
import { getSchoolClassList, addSchoolClass } from "@/api/modules/schoolClass";
import { ColumnProps } from "@/components/ProTable/interface";

const proTable = ref();
const dialogVisible = ref(false);
const ruleFormRef = ref();
const initParam = reactive({});

// 表格配置
const columns: ColumnProps[] = [
  { type: "index", label: "#", width: 80 },
  { prop: "grade_name", label: "年级名称", search: { el: "input" } },
  { prop: "class_name", label: "班级名称" },
  { prop: "full_name", label: "行政班级全称" }
];

// 表单数据
const formData = reactive({ grade_name: "", class_name: "" });
const rules = {
  grade_name: [{ required: true, message: "请输入年级", trigger: "blur" }],
  class_name: [{ required: true, message: "请输入班级名称", trigger: "blur" }]
};

const openDrawer = () => {
  formData.grade_name = "";
  formData.class_name = "";
  dialogVisible.value = true;
};

const handleSubmit = () => {
  ruleFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    try {
      await addSchoolClass(formData);
      ElMessage.success("班级添加成功！");
      dialogVisible.value = false;
      proTable.value?.getTableList(); // 刷新表格
    } catch (error) {
      console.log(error);
    }
  });
};
</script>
