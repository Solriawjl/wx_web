<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getUserList" :init-param="{ role: 'student' }">
      <template #avatar_url="scope">
        <el-avatar v-if="scope.row.avatar_url" :size="50" :src="scope.row.avatar_url" />
        <el-avatar v-else :size="50" style="background-color: #67c23a">小</el-avatar>
      </template>
      <template #score="scope">
        <el-tag type="success" effect="light" round>🌟 {{ scope.row.score }} 星</el-tag>
      </template>
      <template #eco_coin="scope">
        <el-tag type="danger" effect="light" round>🌺 {{ scope.row.eco_coin || 0 }} 朵</el-tag>
      </template>
      <template #title="scope">
        <el-tag type="primary" effect="light" round style="font-weight: bold">🏅 {{ scope.row.title }}</el-tag>
      </template>

      <template #tableHeader>
        <el-button type="success" icon="Plus" @click="openDrawer('新增小卫士', { role: 'student', score: 0, eco_coin: 0 })">
          新增小卫士
        </el-button>
      </template>
      <template #openid="scope">
        <span style="font-size: 13px; color: #909399; letter-spacing: 1px">
          {{ maskOpenId(scope.row.openid) }}
        </span>
      </template>
      <template #operation="scope">
        <el-button type="primary" link icon="EditPen" @click="openDrawer('编辑小卫士', scope.row)">编辑</el-button>
        <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">注销</el-button>
      </template>
    </ProTable>
    <UserDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="tsx" name="studentManage">
import { ref } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { getUserList, deleteUser, addUser, MiniUser } from "@/api/modules/user";
// 注意引入路径，退回上一级找 components
import UserDrawer from "../components/UserDrawer.vue";
import { ElMessage, ElMessageBox } from "element-plus";

const proTable = ref();

// 专属于小卫士的列配置（去掉了 role 列）
const columns: ColumnProps<MiniUser>[] = [
  { type: "index", label: "序号", width: 80 },
  { prop: "avatar_url", label: "用户头像", width: 100 },
  { prop: "nickname", label: "小卫士昵称", search: { el: "input" }, width: 180 },
  { prop: "openid", label: "微信OpenID" },
  { prop: "title", label: "环保称号", width: 150 },
  { prop: "score", label: "环保星 (成长值)", width: 150, sortable: true },
  { prop: "eco_coin", label: "小红花 (可用余额)", width: 160, sortable: true },
  { prop: "created_at", label: "注册时间", width: 200 },
  { prop: "operation", label: "操作", fixed: "right", width: 160 }
];

const drawerRef = ref<InstanceType<typeof UserDrawer> | null>(null);

const openDrawer = (title: string, row: Partial<MiniUser> = {}) => {
  drawerRef.value?.acceptParams({
    isView: false, // 明确告诉组件这不是纯查看模式，需要显示保存按钮
    title,
    row: { ...row },
    api: addUser,
    getTableList: proTable.value.getTableList
  });
};

const handleDelete = async (row: MiniUser) => {
  try {
    await ElMessageBox.confirm(`确认注销小卫士 【${row.nickname}】 吗?`, "警告", { type: "warning" });
    await deleteUser({ id: [row.id] });
    ElMessage.success("注销成功");
    proTable.value.getTableList();
  } catch (error) {}
};
const maskOpenId = (openid: string) => {
  if (!openid) return "暂无";
  // 如果 ID 太短就不打码了，防止报错
  if (openid.length < 10) return openid;
  return openid.substring(0, 4) + "******" + openid.substring(openid.length - 4);
};
</script>
