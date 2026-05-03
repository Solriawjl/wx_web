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

      <el-form-item label="所属班级" prop="class_id">
        <el-select v-model="drawerProps.row.class_id" placeholder="请选择所属班级" clearable>
          <el-option label="全校公共 (所有学生可见)" :value="1" />
          <el-option v-for="item in classList" :key="item.id" :label="item.grade_name + item.class_name" :value="item.id" />
        </el-select>
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

      <el-form-item label="上架状态" prop="is_active">
        <el-radio-group v-model="drawerProps.row.is_active">
          <el-radio :label="true">立即上架</el-radio>
          <el-radio :label="false">暂不下架</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="商品图片" prop="image_url">
        <el-input v-model="drawerProps.row.image_url" placeholder="请输入图片链接 (COS地址)" clearable>
          <template #append>
            <el-button icon="Picture" @click="showTip" />
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button v-show="!drawerProps.isView" type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Mall } from "@/api/modules/mall";

const rules = reactive({
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  points_price: [{ required: true, message: "请输入所需小红花", trigger: "blur" }],
  image_url: [{ required: true, message: "请输入图片链接", trigger: "blur" }],
  class_id: [{ required: true, message: "请选择所属班级", trigger: "change" }] // 🚀 新增校验
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

// 🚀 新增：存储从后端获取的班级列表
const classList = ref<any[]>([]);

// 🚀 新增：初始化时获取班级数据
onMounted(async () => {
  try {
    const res = await fetch("http://192.168.0.126:8000/api/admin/classes");
    const json = await res.json();
    if (json.code === 200) {
      // 过滤掉 ID 为 1 的班级（因为我们已经手动添加了“全校公共”选项）
      classList.value = json.data.filter((c: any) => c.id !== 1);
    }
  } catch (error) {
    console.error("获取班级列表失败:", error);
  }
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps) => {
  // 赋默认值
  if (params.title === "新增") {
    // 🚀 新增：默认 class_id 为 1 (全校公共)
    params.row = { stock: -1, is_active: true, points_price: 100, class_id: 1 };
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

const showTip = () => {
  ElMessage.info("请先将图片上传至腾讯云COS，再将链接填入此处。");
};

defineExpose({
  acceptParams
});
</script>

<style scoped>
/* 可根据需要添加样式 */
</style>
