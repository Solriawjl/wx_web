<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="450px" :title="`${drawerProps.title}用户`">
    <el-form ref="ruleFormRef" label-width="100px" label-suffix=" :" :rules="rules" :model="drawerProps.row">
      <el-form-item label="微信昵称" prop="nickname">
        <el-input v-model="drawerProps.row.nickname" placeholder="请填写用户昵称" clearable />
      </el-form-item>

      <el-form-item label="头像链接" prop="avatar_url">
        <el-input v-model="drawerProps.row.avatar_url" placeholder="可为空，不填将自动使用默认头像" clearable />
      </el-form-item>

      <el-form-item label="环保积分" prop="score">
        <el-input-number v-model="drawerProps.row.score" :min="0" :max="99999" placeholder="请输入积分" style="width: 100%" />
      </el-form-item>

      <el-form-item label="环保称号" prop="title">
        <el-select v-model="drawerProps.row.title" placeholder="请选择环保称号" clearable>
          <el-option label="环保新手 (默认)" value="环保新手" />
          <el-option label="环保卫士" value="环保卫士" />
          <el-option label="环保达人" value="环保达人" />
          <el-option label="环保王者" value="环保王者" />
        </el-select>
      </el-form-item>

      <el-alert
        title="提示：后台手动新增的用户将生成虚拟的 OpenID，主要用于测试或发放内部账号。"
        type="info"
        :closable="false"
        style="margin-top: 20px"
        v-if="drawerProps.title === '新增'"
      />
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

// 表单验证规则 (限制必填项)
const rules = reactive({
  nickname: [{ required: true, message: "请填写微信昵称", trigger: "blur" }],
  title: [{ required: true, message: "请选择环保称号", trigger: "change" }]
});

const ruleFormRef = ref<FormInstance>();

// 暴露给父组件的方法，用于打开抽屉并接收数据
const acceptParams = (params: DrawerProps) => {
  drawerProps.value = params;

  // 如果是新增操作，给予默认的积分和称号
  if (params.title === "新增") {
    drawerProps.value.row.score = 0;
    drawerProps.value.row.title = "环保新手";
  }

  drawerVisible.value = true;
};

// 提交表单逻辑
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      // 👇 核心逻辑：如果没有填写头像URL，赋予默认头像
      if (!drawerProps.value.row.avatar_url || drawerProps.value.row.avatar_url.trim() === "") {
        drawerProps.value.row.avatar_url = "https://images-1408449839.cos.ap-chengdu.myqcloud.com/images/user/head.png";
      }

      // 调用父组件传过来的 API (例如 addUser)
      await drawerProps.value.api!(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title}用户成功！` });
      // 刷新父组件的表格
      drawerProps.value.getTableList!();
      // 关闭抽屉
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

// 将 acceptParams 暴露出去，让主页面的 ref 能够调用
defineExpose({
  acceptParams
});
</script>
