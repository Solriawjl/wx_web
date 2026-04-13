<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="450px" :title="`${drawerProps.title}`">
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.row"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item label="用户头像" prop="avatar_url">
        <el-input v-model="drawerProps.row.avatar_url" placeholder="请填写头像链接(可选)" clearable></el-input>
      </el-form-item>

      <el-form-item label="微信昵称" prop="nickname">
        <el-input v-model="drawerProps.row.nickname" placeholder="请填写微信昵称" clearable></el-input>
      </el-form-item>

      <el-form-item label="所属班级" prop="class_id">
        <el-select v-model="drawerProps.row!.class_id" placeholder="请分配所属班级" filterable clearable style="width: 100%">
          <el-option v-for="item in classOptions" :key="item.id" :label="item.full_name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="用户身份" prop="role">
        <el-tag :type="drawerProps.row.role === 'teacher' ? 'warning' : 'success'" size="large" effect="dark">
          {{ drawerProps.row.role === "teacher" ? "指导老师" : "环保小卫士" }}
        </el-tag>
      </el-form-item>

      <el-form-item label="环保星" prop="score">
        <el-input-number v-model="drawerProps.row.score" :min="0" />
      </el-form-item>
      <el-form-item label="环保币" prop="eco_coin">
        <el-input-number v-model="drawerProps.row.eco_coin" :min="0" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button v-show="!drawerProps.isView" type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { User } from "@/api/interface";
import { getSchoolClassList } from "@/api/modules/schoolClass"; // 🚀 导入班级接口
import { School } from "@/api/interface/index";

// 表单校验规则
const rules = reactive({
  nickname: [{ required: true, message: "请填写用户昵称" }],
  class_id: [{ required: true, message: "请选择所属班级", trigger: "change" }]
});

// 抽屉属性接口定义
interface DrawerProps {
  title: string;
  isView: boolean;
  row: Partial<User.ResUserList>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  row: {}
});

// 🚀 新增：存储班级备选项
const classOptions = ref<School.ClassItem[]>([]);

/**
 * 接收父组件参数并打开抽屉
 */
const acceptParams = (params: DrawerProps) => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

/**
 * 页面加载时获取全校班级字典
 */
onMounted(async () => {
  try {
    const res = await getSchoolClassList();
    classOptions.value = res.data;
  } catch (error) {
    console.error("获取班级列表失败", error);
  }
});

const ruleFormRef = ref();

/**
 * 提交表单
 */
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid: boolean) => {
    if (!valid) return;
    try {
      // 执行传入的 API (addUser 或 updateUser)
      await drawerProps.value.api!(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title}成功！` });
      // 刷新父组件列表
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

// 暴露方法给父组件
defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.el-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
