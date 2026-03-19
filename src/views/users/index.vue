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

      <template #title="scope">
        <el-tag :type="getTitleTagType(scope.row.title)" effect="light" round style="font-weight: bold">
          🏅 {{ scope.row.title }}
        </el-tag>
      </template>

      <template #tableHeader>
        <el-button type="primary" icon="Plus" @click="openDrawer('新增')">新增用户</el-button>
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
  </div>
</template>

<script setup lang="tsx" name="userManage">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { getUserList, deleteUser, addUser, MiniUser } from "@/api/modules/user";
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
  { prop: "openid", label: "微信OpenID (唯一标识)" },
  { prop: "title", label: "当前环保称号", width: 150 },
  { prop: "score", label: "环保积分", width: 150, sortable: true }, // 支持点击表头排序
  { prop: "created_at", label: "注册时间", width: 200 },
  { prop: "operation", label: "操作", fixed: "right", width: 120 }
];

// 辅助方法：给不同积分段位的用户不同的颜色标签
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
    // 把可能触发 reject 的确认弹窗放在 try 里面
    await ElMessageBox.confirm(`确认注销用户 【${row.nickname}】 吗?`, "温馨提示", { type: "warning" });

    // 如果用户点了取消，下面的代码就不会执行了，直接跳到 catch 里
    await deleteUser({ id: [row.id] });
    ElMessage.success("注销成功");
    proTable.value.getTableList();
  } catch (error) {
    // 捕获“取消”动作，静默处理或者给个轻提示，防止报错冒泡到全局
    if (error === "cancel") {
      ElMessage.info("已取消操作");
    } else {
      console.error(error);
    }
  }
};
</script>
