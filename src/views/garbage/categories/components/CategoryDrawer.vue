<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="600px" :title="drawerProps.title">
    <el-alert
      title="此模块内容将直接展示在小程序的分类详情页中，用于向用户尤其是低龄群体进行环保科普。"
      type="success"
      :closable="false"
      style="margin-bottom: 20px"
    />

    <el-form ref="ruleFormRef" label-width="130px" label-suffix=" :" :model="drawerProps.row">
      <el-form-item label="分类名称">
        <el-input v-model="drawerProps.row.category_name" disabled />
      </el-form-item>

      <el-form-item label="环保价值">
        <el-input v-model="drawerProps.row.eco_value" type="textarea" :rows="2" placeholder="填写该分类的回收价值" />
      </el-form-item>

      <el-form-item label="一句话指导">
        <el-input v-model="drawerProps.row.put_guidance" type="textarea" :rows="2" placeholder="简短的投放口诀" />
      </el-form-item>

      <el-divider content-position="center">深度科普与教育闭环</el-divider>

      <el-form-item label="如果不分类的危害">
        <el-input
          v-model="drawerProps.row.harm_description"
          type="textarea"
          :rows="3"
          placeholder="请用儿童易懂的语气描述，例如：如果不分类，小动物可能会误食..."
        />
      </el-form-item>

      <el-form-item label="处理工艺与去向">
        <el-input
          v-model="drawerProps.row.process_method"
          type="textarea"
          :rows="3"
          placeholder="生命周期科普，例如：它最终会被送到火力发电厂，变成电能照亮城市。"
        />
      </el-form-item>

      <el-form-item label="投放前置动作指导">
        <el-input
          v-model="drawerProps.row.sub_guidance"
          type="textarea"
          :rows="3"
          placeholder="体现日式严谨，例如：塑料瓶请倒空液体，踩扁后投入；纸箱请拆解铺平..."
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存配置</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";

interface DrawerProps {
  title: string;
  row: any;
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({ title: "", row: {} });

const acceptParams = (params: DrawerProps) => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

const handleSubmit = async () => {
  try {
    await drawerProps.value.api!(drawerProps.value.row);
    ElMessage.success({ message: `科普内容更新成功！` });
    drawerProps.value.getTableList!();
    drawerVisible.value = false;
  } catch (error) {
    console.log(error);
  }
};

defineExpose({ acceptParams });
</script>
