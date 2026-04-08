<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="450px" :title="`${drawerProps.title}`">
    <el-form ref="ruleFormRef" label-width="100px" label-suffix=" :" :rules="rules" :model="drawerProps.row">
      <el-form-item label="用户头像" prop="avatar_url">
        <el-input v-model="drawerProps.row.avatar_url" placeholder="请填写头像链接(可选)" clearable></el-input>
      </el-form-item>

      <el-form-item label="微信昵称" prop="nickname">
        <el-input v-model="drawerProps.row.nickname" placeholder="请填写微信昵称" clearable></el-input>
      </el-form-item>

      <el-form-item label="用户身份" prop="role">
        <el-tag :type="drawerProps.row.role === 'teacher' ? 'warning' : 'success'" size="large" effect="dark">
          {{ drawerProps.row.role === "teacher" ? "指导老师" : "环保小卫士" }}
        </el-tag>
      </el-form-item>

      <template v-if="drawerProps.row.role === 'student'">
        <el-divider content-position="center">小卫士专属数据</el-divider>
        <el-form-item label="环保称号" prop="title">
          <el-input v-model="drawerProps.row.title" placeholder="例如：环保小卫士" clearable></el-input>
        </el-form-item>
        <el-form-item label="环保星" prop="score">
          <el-input-number v-model="drawerProps.row.score" :min="0" placeholder="闯关积分" />
        </el-form-item>
        <el-form-item label="小红花" prop="eco_coin">
          <el-input-number v-model="drawerProps.row.eco_coin" :min="0" placeholder="可用余额" />
        </el-form-item>
      </template>

      <template v-if="drawerProps.row.role === 'teacher'">
        <el-divider content-position="center">教师专属数据</el-divider>
        <div style="padding: 0 20px">
          <el-alert title="教师账号无需参与积分挑战，暂无附加数值属性。" type="info" :closable="false" show-icon />
        </div>
      </template>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" v-show="!drawerProps.isView" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { MiniUser } from "@/api/modules/user";

const rules = reactive({
  nickname: [{ required: true, message: "请填写用户昵称" }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  row: Partial<MiniUser>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  row: {}
});

const acceptParams = (params: DrawerProps) => {
  drawerProps.value = params;
  drawerVisible.value = true;
};

const ruleFormRef = ref();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid: boolean) => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title}成功！` });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({ acceptParams });
</script>
