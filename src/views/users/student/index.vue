<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getUserList" :init-param="{ role: 'student' }">
      <template #avatar_url="scope">
        <el-avatar v-if="scope.row.avatar_url" :size="50" :src="scope.row.avatar_url" />
        <el-avatar v-else :size="50" style="background-color: #67c23a">小</el-avatar>
      </template>

      <template #class_info="scope">
        <el-tag :type="scope.row.class_info === '未分配' ? 'info' : 'success'" effect="plain">
          {{ scope.row.class_info }}
        </el-tag>
      </template>

      <template #score="scope">
        <el-tag type="success" effect="light" round>🌟 {{ scope.row.score }} 星</el-tag>
      </template>
      <template #eco_coin="scope">
        <el-tag type="danger" effect="light" round>🌺 {{ scope.row.eco_coin || 0 }} 朵</el-tag>
      </template>
      <template #title="scope">
        <el-tag :type="getTitleTagType(scope.row.title)" effect="dark" round style="font-weight: bold; letter-spacing: 1px">
          {{ getTitleIcon(scope.row.title) }} {{ scope.row.title }}
        </el-tag>
      </template>

      <template #tableHeader>
        <el-button type="success" icon="Plus" @click="openDrawer('新增小卫士', { role: 'student', score: 0, eco_coin: 0 })">
          新增小卫士
        </el-button>
      </template>

      <template #openid="scope">
        <span style="font-size: 13px; color: #909399">{{ scope.row.openid }}</span>
      </template>

      <template #operation="scope">
        <el-button type="primary" link icon="EditPen" @click="openDrawer('编辑学生', scope.row)">编辑</el-button>
        <el-button type="danger" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </ProTable>

    <UserDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="ts" name="studentManage">
import { ref, reactive, onMounted } from "vue"; // 🚀 1. 确保引入 reactive 和 onMounted
import { ColumnProps } from "@/components/ProTable/interface";
import ProTable from "@/components/ProTable/index.vue";
import UserDrawer from "@/views/users/components/UserDrawer.vue";
import { getUserList, addUser, deleteUser } from "@/api/modules/user";
import { getSchoolClassList } from "@/api/modules/schoolClass";
import { ElMessage, ElMessageBox } from "element-plus";

const proTable = ref();
const drawerRef = ref<InstanceType<typeof UserDrawer> | null>(null);

// 🚀 2. 核心修复：定义一个响应式的班级字典变量
const classEnum = ref<any[]>([]);

// 🚀 3. 页面加载时，手动请求接口并赋值
onMounted(async () => {
  try {
    const res = await getSchoolClassList();
    classEnum.value = res.data; // 将拼接好 full_name 的数组赋给响应式变量
  } catch (error) {
    console.error("获取班级字典失败", error);
  }
});

// 🚀 4. 将 columns 定义为 reactive，确保数据更新时表格能监听到
const columns = reactive<ColumnProps[]>([
  { type: "index", label: "序号", width: 80 },
  { prop: "avatar_url", label: "用户头像", width: 100 },
  { prop: "nickname", label: "小卫士昵称", search: { el: "input" }, width: 150 },

  // 🚀 5. 将 enum 指向我们刚刚手动请求到的 classEnum
  {
    prop: "class_id",
    label: "班级筛选",
    isShow: false,
    enum: classEnum, // <--- 绕过内置API调用，直接绑定响应式数组！
    search: { el: "select", props: { filterable: true, placeholder: "请选择班级" } },
    fieldNames: { label: "full_name", value: "id" }
  },

  { prop: "class_info", label: "所属班级", width: 150 },
  { prop: "openid", label: "微信OpenID" },
  { prop: "title", label: "环保称号", width: 120 },
  { prop: "score", label: "环保星", width: 120, sortable: true },
  { prop: "eco_coin", label: "可用小红花", width: 130, sortable: true },
  { prop: "created_at", label: "注册时间", width: 180 },
  { prop: "operation", label: "操作", fixed: "right", width: 160 }
]);

const openDrawer = (title: string, row: any = {}) => {
  drawerRef.value?.acceptParams({
    isView: false,
    title,
    row: { ...row },
    api: addUser,
    getTableList: proTable.value.getTableList
  });
};

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定要注销小卫士【${row.nickname}】吗？数据不可恢复哦！`, "警告", {
    type: "warning"
  });
  await deleteUser({ id: row.id });
  ElMessage.success("注销成功");
  proTable.value.getTableList();
};

// 🚀 称号匹配引擎：返回 Element Plus 的 Tag 颜色类型
const getTitleTagType = (title: string) => {
  if (!title) return "info";
  if (title.includes("宗师")) return "warning"; // 金色/橙色
  if (title.includes("大师")) return "danger"; // 红色
  if (title.includes("达人")) return "primary"; // 蓝色
  if (title.includes("卫士")) return "success"; // 绿色
  return "info"; // 萌新兜底
};

// 🚀 称号匹配引擎：返回对应的 Emoji 图标
const getTitleIcon = (title: string) => {
  if (!title) return "🌱";
  if (title.includes("宗师")) return "👑";
  if (title.includes("大师")) return "💎";
  if (title.includes("达人")) return "🏅";
  if (title.includes("卫士")) return "🛡️";
  return "🌱";
};
</script>

<style scoped lang="scss"></style>
