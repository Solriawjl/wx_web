<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="450px" title="疑难图片复核">
    <el-form ref="ruleFormRef" label-width="100px" label-suffix=" :" :rules="rules" :model="drawerProps.row">
      <el-form-item label="拦截图片">
        <el-image
          style="width: 200px; height: 200px; border-radius: 8px"
          :src="drawerProps.row!.image_url"
          :preview-src-list="[drawerProps.row!.image_url]"
          fit="cover"
        />
        <div style="margin-top: 8px; font-size: 12px; line-height: 1.5; color: #909399">
          * 当时 AI 的置信度仅为: <span style="font-weight: bold; color: #f56c6c">{{ drawerProps.row!.confidence }}%</span>
        </div>
      </el-form-item>

      <el-form-item label="正确分类" prop="correct_category_name">
        <el-select v-model="drawerProps.row!.correct_category_name" placeholder="请选择它真实的四大类" clearable>
          <el-option label="可回收物" value="可回收物" />
          <el-option label="有害垃圾" value="有害垃圾" />
          <el-option label="厨余垃圾" value="厨余垃圾" />
          <el-option label="其他垃圾" value="其他垃圾" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="danger" plain @click="handleSubmit(2)">图片模糊/废弃</el-button>
      <el-button type="primary" @click="handleSubmit(1)">确 认 打 标 入 库</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="AuditDrawer">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { auditLowConfidence } from "@/api/modules/lowConfidence";

const drawerVisible = ref(false);
const drawerProps = ref<any>({ row: {} });

// 接收父组件传过来的参数
const acceptParams = (params: any) => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

// 表单校验
const rules = reactive({
  correct_category_name: [{ required: true, message: "必须选择一个真实的分类才能入库", trigger: "change" }]
});

// 提交审核
const handleSubmit = async (status: number) => {
  if (status === 1 && !drawerProps.value.row.correct_category_name) {
    ElMessage.warning("请选择正确的垃圾大类！");
    return;
  }

  try {
    await auditLowConfidence({
      id: drawerProps.value.row.id,
      status: status,
      correct_category_name: status === 1 ? drawerProps.value.row.correct_category_name : undefined
    });
    ElMessage.success({ message: status === 1 ? "打标成功，已送入模型训练集！" : "已废弃该难例图片" });
    drawerProps.value.getTableList!(); // 刷新列表
    drawerVisible.value = false;
  } catch (error) {
    console.log(error);
  }
};

defineExpose({ acceptParams });
</script>
