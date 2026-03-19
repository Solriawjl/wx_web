<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="450px" :title="`${drawerProps.title}物品`">
    <el-form ref="ruleFormRef" label-width="100px" label-suffix=" :" :rules="rules" :model="drawerProps.row">
      <el-form-item label="物品名称" prop="item_name">
        <el-input v-model="drawerProps.row.item_name" placeholder="请填写垃圾物品名称" clearable />
      </el-form-item>

      <el-form-item label="所属大类" prop="category_type">
        <el-select v-model="drawerProps.row.category_type" placeholder="请选择所属大类" clearable>
          <el-option label="可回收物 (1)" :value="1" />
          <el-option label="有害垃圾 (2)" :value="2" />
          <el-option label="厨余垃圾 (3)" :value="3" />
          <el-option label="其他垃圾 (4)" :value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="所属小类" prop="sub_category">
        <el-input v-model="drawerProps.row.sub_category" placeholder="例如：塑料瓶、废电池..." clearable />
      </el-form-item>

      <el-form-item label="投放提示" prop="tips">
        <el-input v-model="drawerProps.row.tips" type="textarea" :rows="3" placeholder="请填写投放时的注意事项" clearable />
      </el-form-item>

      <el-form-item label="示意图链接" prop="image_url">
        <el-input v-model="drawerProps.row.image_url" placeholder="请填写图片URL (可选)" clearable />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";

// 接收父组件传过来的参数
interface DrawerProps {
  title: string;
  row: any;
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  row: {}
});

// 表单验证规则
const rules = reactive({
  item_name: [{ required: true, message: "请填写物品名称", trigger: "blur" }],
  category_type: [{ required: true, message: "请选择所属大类", trigger: "change" }]
});

const ruleFormRef = ref<FormInstance>();

// 暴露给父组件的方法，用于打开抽屉并接收数据
const acceptParams = (params: DrawerProps) => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

// 提交表单
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      // 调用父组件传过来的 API (新增或编辑)
      await drawerProps.value.api!(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title}物品成功！` });
      // 刷新父组件的表格
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>
