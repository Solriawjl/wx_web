<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getUserList" :init-param="initParam">
      <template #avatar_url="scope">
        <el-avatar v-if="scope.row.avatar_url" :size="50" :src="scope.row.avatar_url" />
        <el-avatar v-else :size="50" style="background-color: #409eff">
          {{ scope.row.nickname ? scope.row.nickname.charAt(0) : "User" }}
        </el-avatar>
      </template>

      <template #score="scope">
        <el-tag :type="getScoreTagType(scope.row.score)" effect="light" round> {{ scope.row.score }} 分 </el-tag>
      </template>

      <template #eco_coin="scope">
        <el-tag type="warning" effect="dark" round> 🪙 {{ scope.row.eco_coin || 0 }} </el-tag>
      </template>

      <template #title="scope">
        <el-tag :type="getTitleTagType(scope.row.title)" effect="light" round style="font-weight: bold">
          🏅 {{ scope.row.title }}
        </el-tag>
      </template>

      <template #tableHeader>
        <el-button type="primary" icon="Plus" @click="openDrawer('新增')">新增用户</el-button>
        <el-button type="primary" plain @click="openInviteCodeDialog"> 🎫 教师邀请码管理 </el-button>
      </template>

      <template #operation="scope">
        <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">注销用户</el-button>
      </template>

      <template #openid="scope">
        <span style="font-size: 13px; color: #909399">
          {{ maskOpenId(scope.row.openid) }}
        </span>
      </template>
    </ProTable>
    <UserDrawer ref="drawerRef" />

    <el-dialog v-model="dialogVisible" title="👨‍🏫 教师邀请码管理" width="600px" destroy-on-close>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px">
        <span style="font-size: 14px; color: #666666">请将生成的邀请码分发给学校老师进行身份绑定</span>
        <el-button type="success" @click="handleGenerateCode" :loading="generating"> + 生成新邀请码 </el-button>
      </div>

      <el-table :data="inviteCodeList" v-loading="loadingCodes" border stripe height="350px">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="code" label="邀请码" align="center">
          <template #default="scope">
            <el-tag size="large" effect="plain" style="font-weight: bold; letter-spacing: 1px">
              {{ scope.row.code }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_used" label="使用状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.is_used ? 'danger' : 'success'">
              {{ scope.row.is_used ? "🚫 已使用" : "✅ 未使用" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx" name="userManage">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { getUserList, deleteUser, addUser, MiniUser, getInviteCodesApi, generateInviteCodeApi } from "@/api/modules/user";
import UserDrawer from "./components/UserDrawer.vue";
import { ElMessage, ElMessageBox } from "element-plus";

const proTable = ref();
const initParam = reactive({});

// 表格配置项
const columns: ColumnProps<MiniUser>[] = [
  { type: "index", label: "序号", width: 80 },
  { prop: "avatar_url", label: "用户头像", width: 120 },
  {
    prop: "nickname",
    label: "微信昵称",
    search: { el: "input", tooltip: "按昵称模糊搜索" },
    width: 180
  },
  {
    prop: "role",
    label: "用户角色",
    enum: [
      { label: "环保小卫士", value: "student", tagType: "success" },
      { label: "指导老师", value: "teacher", tagType: "warning" },
      { label: "管理员", value: "admin", tagType: "danger" }
    ],
    search: { el: "select", props: { filterable: true } },
    render: scope => {
      const row = scope.row as any;
      return (
        <el-tag type={row.role === "teacher" ? "warning" : "success"}>
          {row.role === "teacher" ? "👩‍🏫 指导老师" : "🌱 环保小卫士"}
        </el-tag>
      );
    }
  },
  { prop: "openid", label: "微信OpenID (唯一标识)" },
  { prop: "title", label: "当前环保称号", width: 150 },
  { prop: "score", label: "挑战环保星 (升段)", width: 150, sortable: true },
  { prop: "eco_coin", label: "环保币 (商城消费)", width: 150, sortable: true },
  { prop: "created_at", label: "注册时间", width: 200 },
  { prop: "operation", label: "操作", fixed: "right", width: 120 }
];

// --- 👇 教师邀请码管理弹窗相关逻辑 👇 ---

// 1. 定义邀请码的数据结构
interface InviteCode {
  id: number;
  code: string;
  is_used: boolean;
}

const dialogVisible = ref(false);
// 2. 明确告诉 TypeScript 这是一个装满 InviteCode 对象的数组
const inviteCodeList = ref<InviteCode[]>([]);
const loadingCodes = ref(false);
const generating = ref(false);

// 打开弹窗并拉取数据
const openInviteCodeDialog = async () => {
  dialogVisible.value = true;
  await fetchInviteCodes();
};

// 获取列表数据
const fetchInviteCodes = async () => {
  loadingCodes.value = true;
  try {
    const res = await getInviteCodesApi();
    // 强制转换为 any 避免 Geeker 拦截器里的外层类型不一致导致的警告，真实数据结构我们用 interface 管控了
    inviteCodeList.value = (res.data as any) || [];
  } catch (error) {
    console.error("获取邀请码失败", error);
  } finally {
    loadingCodes.value = false;
  }
};

// 点击生成新邀请码
const handleGenerateCode = async () => {
  generating.value = true;
  try {
    await generateInviteCodeApi();
    ElMessage.success("🎉 生成成功！");
    await fetchInviteCodes(); // 生成成功后刷新列表
  } catch (error) {
    console.error("生成失败", error);
  } finally {
    generating.value = false;
  }
};
// --- 👆 教师邀请码逻辑结束 👆 ---

// 辅助方法：给不同环保星段位的用户不同的颜色标签
const getScoreTagType = (score: number) => {
  if (score >= 500) return "danger"; // 王者
  if (score >= 200) return "warning"; // 钻石
  if (score >= 50) return "success"; // 黄金
  return "info"; // 青铜
};

// 辅助方法：脱敏 OpenID (例如：oX12...89aB)
const maskOpenId = (openid: string) => {
  if (!openid) return "暂无";
  if (openid.length < 10) return openid;
  return openid.substring(0, 4) + "****" + openid.substring(openid.length - 4);
};

// 辅助方法：根据称号名称返回不同的标签颜色
const getTitleTagType = (title: string) => {
  if (!title) return "info";
  if (title.includes("王者") || title.includes("宗师")) return "danger"; // 红色
  if (title.includes("达人") || title.includes("专家")) return "warning"; // 橙色
  if (title.includes("先锋") || title.includes("卫士")) return "success"; // 绿色
  if (title.includes("新手")) return "info"; // 灰色
  return "primary"; // 默认蓝色
};

const drawerRef = ref<InstanceType<typeof UserDrawer> | null>(null);

const openDrawer = (title: string, row: Partial<MiniUser> = {}) => {
  drawerRef.value?.acceptParams({
    title,
    row: { ...row },
    api: addUser,
    getTableList: proTable.value.getTableList
  });
};

const handleDelete = async (row: MiniUser) => {
  try {
    await ElMessageBox.confirm(`确认注销用户 【${row.nickname}】 吗?`, "温馨提示", { type: "warning" });
    await deleteUser({ id: [row.id] });
    ElMessage.success("注销成功");
    proTable.value.getTableList();
  } catch (error) {
    if (error === "cancel") {
      ElMessage.info("已取消操作");
    } else {
      console.error(error);
    }
  }
};
</script>
