<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="500px" :title="`${drawerProps.title}商品`">
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.row"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="drawerProps.row.name" placeholder="请输入商品名称 (如: 环保勋章)" clearable />
      </el-form-item>

      <el-form-item label="商品描述" prop="desc">
        <el-input v-model="drawerProps.row.desc" type="textarea" :rows="3" placeholder="请输入商品描述" clearable />
      </el-form-item>

      <el-form-item label="所需小红花" prop="points_price">
        <el-input-number v-model="drawerProps.row.points_price" :min="1" :step="10" placeholder="小红花" />
      </el-form-item>

      <el-form-item label="库存数量" prop="stock">
        <el-tooltip content="输入 -1 代表无限库存，适合虚拟物品" placement="top">
          <el-input-number v-model="drawerProps.row.stock" :min="-1" :step="1" placeholder="库存" />
        </el-tooltip>
      </el-form-item>

      <el-form-item label="图片链接" prop="image_url">
        <el-input v-model="drawerProps.row.image_url" placeholder="请输入图片网络地址" clearable />
        <el-image
          v-if="drawerProps.row.image_url"
          :src="drawerProps.row.image_url"
          style="width: 80px; height: 80px; margin-top: 10px; border-radius: 8px"
          fit="cover"
        />
      </el-form-item>

      <el-form-item label="是否上架" prop="is_active">
        <el-switch v-model="drawerProps.row.is_active" active-text="立即上架" inactive-text="暂不上架" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button v-show="!drawerProps.isView" type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Mall } from "@/api/modules/mall";

const rules = reactive({
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  points_price: [{ required: true, message: "请输入所需小红花", trigger: "blur" }],
  image_url: [{ required: true, message: "请输入图片链接", trigger: "blur" }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  row: Partial<Mall.MallItem>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  title: "",
  isView: false,
  row: {}
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps) => {
  // 赋默认值
  if (params.title === "新增") {
    params.row = { stock: -1, is_active: true, points_price: 100 };
  }
  drawerProps.value = params;
  drawerVisible.value = true;
};

// 提交表单
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title}商品成功！` });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({ acceptParams });
</script>
