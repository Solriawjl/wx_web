<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getUserList" :init-param="{ role: 'teacher' }">
      <template #avatar_url="scope">
        <el-avatar v-if="scope.row.avatar_url" :size="50" :src="scope.row.avatar_url" />
        <el-avatar v-else :size="50" style="background-color: #e6a23c">师</el-avatar>
      </template>

      <template #tableHeader>
        <el-button type="warning" icon="Plus" @click="openDrawer('新增指导老师', { role: 'teacher' })"> 新增老师 </el-button>
        <el-button type="primary" plain @click="openInviteCodeDialog"> 教师邀请码管理 </el-button>
      </template>
      <template #openid="scope">
        <span style="font-size: 13px; color: #909399; letter-spacing: 1px">
          {{ maskOpenId(scope.row.openid) }}
        </span>
      </template>
      <template #operation="scope">
        <el-button type="primary" link icon="EditPen" @click="openDrawer('编辑老师资料', scope.row)">编辑</el-button>
        <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">辞退</el-button>
      </template>
    </ProTable>
    <UserDrawer ref="drawerRef" />

    <el-dialog v-model="dialogVisible" title="教师邀请码管理" width="600px" destroy-on-close>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px">
        <span style="font-size: 14px; color: #666666">请将生成的邀请码分发给学校老师进行身份绑定</span>
        <el-button type="success" @click="handleGenerateCode" :loading="generating"> + 生成新邀请码 </el-button>
      </div>

      <el-table :data="inviteCodeList" v-loading="loadingCodes" border stripe height="350px">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="code" label="邀请码" align="center">
          <template #default="scope">
            <el-tag size="large" effect="plain" style="font-weight: bold; letter-spacing: 1px">{{ scope.row.code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_used" label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.is_used ? 'danger' : 'success'">{{ scope.row.is_used ? "🚫 已使用" : "✅ 未使用" }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx" name="teacherManage">
import { ref } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { getUserList, deleteUser, addUser, MiniUser, getInviteCodesApi, generateInviteCodeApi } from "@/api/modules/user";
import UserDrawer from "../components/UserDrawer.vue";
import { ElMessage, ElMessageBox } from "element-plus";

const proTable = ref();

// 专属于老师的列配置（极其精简，没有称号和小红花）
const columns: ColumnProps<MiniUser>[] = [
  { type: "index", label: "序号", width: 80 },
  { prop: "avatar_url", label: "教师头像", width: 100 },
  { prop: "nickname", label: "教师微信昵称", search: { el: "input" }, width: 220 },
  { prop: "openid", label: "微信OpenID" },
  { prop: "created_at", label: "注册时间", width: 200 },
  { prop: "operation", label: "操作", fixed: "right", width: 160 }
];

// --- 邀请码逻辑 ---
interface InviteCode {
  id: number;
  code: string;
  is_used: boolean;
}
const dialogVisible = ref(false);
const inviteCodeList = ref<InviteCode[]>([]);
const loadingCodes = ref(false);
const generating = ref(false);

const openInviteCodeDialog = async () => {
  dialogVisible.value = true;
  await fetchInviteCodes();
};
const fetchInviteCodes = async () => {
  loadingCodes.value = true;
  try {
    const res = await getInviteCodesApi();
    inviteCodeList.value = (res.data as any) || [];
  } catch (error) {
  } finally {
    loadingCodes.value = false;
  }
};
const handleGenerateCode = async () => {
  generating.value = true;
  try {
    await generateInviteCodeApi();
    ElMessage.success("🎉 生成成功！");
    await fetchInviteCodes();
  } catch (error) {
  } finally {
    generating.value = false;
  }
};
// --- 邀请码逻辑结束 ---

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
    await ElMessageBox.confirm(`确认注销指导老师 【${row.nickname}】 吗?`, "警告", { type: "warning" });
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
