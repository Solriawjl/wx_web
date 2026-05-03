<template>
  <div class="table-box">
    <ProTable ref="proTable" title="小红花商品列表" :columns="columns" :request-api="getMallItemList">
      <template #tableHeader="scope">
        <el-button type="primary" icon="Plus" @click="openDrawer('新增')">新增商品</el-button>
        <el-button type="danger" icon="Delete" plain :disabled="!scope.isSelected" @click="batchDelete(scope.selectedListIds)">
          批量删除
        </el-button>
      </template>

      <template #class_id="scope">
        <el-tag :type="scope.row.class_id === 1 ? 'success' : 'primary'">
          {{ scope.row.class_name || "全校公共" }}
        </el-tag>
      </template>

      <template #image_url="scope">
        <el-image
          style="width: 50px; height: 50px; border-radius: 8px"
          :src="scope.row.image_url"
          :preview-src-list="[scope.row.image_url]"
          fit="cover"
          preview-teleported
        />
      </template>

      <template #stock="scope">
        <el-tag v-if="scope.row.stock === -1" type="info">无限库存</el-tag>
        <el-tag v-else-if="scope.row.stock === 0" type="danger">已售罄</el-tag>
        <span v-else>{{ scope.row.stock }} 件</span>
      </template>

      <template #is_active="scope">
        <el-switch
          v-model="scope.row.is_active"
          @change="changeStatus(scope.row)"
          inline-prompt
          active-text="上架"
          inactive-text="下架"
        />
      </template>

      <template #operation="scope">
        <el-button type="primary" link icon="EditPen" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="primary" link icon="Delete" @click="deleteItem(scope.row)">删除</el-button>
      </template>
    </ProTable>

    <MallDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="ts" name="MallManage">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { ColumnProps, ProTableInstance } from "@/components/ProTable/interface";
import ProTable from "@/components/ProTable/index.vue";
import MallDrawer from "./components/MallDrawer.vue";
import { useHandleData } from "@/hooks/useHandleData";
import { getMallItemList, deleteMallItem, updateMallItem, addMallItem, Mall } from "@/api/modules/mall";

const proTable = ref<ProTableInstance>();

// 🚀 新增：动态班级字典（enum）
const classEnum = ref([{ label: "全校公共", value: 1 }]);

// 🚀 新增：页面挂载时请求后端拿到班级树，塞入字典中供 ProTable 使用
onMounted(() => {
  // 注意：此处使用了原生 fetch，如果你有封装 axios 请按需替换路径
  fetch("http://192.168.0.126:8000/api/admin/classes")
    .then(res => res.json())
    .then(res => {
      if (res.code === 200) {
        const dynamicClasses = res.data
          .filter((c: any) => c.id !== 1) // 排除系统默认公共班
          .map((c: any) => ({
            label: c.grade_name + c.class_name,
            value: c.id
          }));
        // 拼接默认的"全校公共"与真实班级数据
        classEnum.value = [...classEnum.value, ...dynamicClasses];
      }
    });
});

// 表格配置项 (ProTable 核心魔法)
const columns: ColumnProps<Mall.MallItem>[] = [
  { type: "selection", fixed: "left", width: 80 },
  { prop: "id", label: "ID", width: 80 },
  { prop: "image_url", label: "商品主图", width: 100 },
  { prop: "name", label: "商品名称", search: { el: "input" }, width: 180 },

  // 🚀 新增：极其优雅的列配置，只需这几行，顶部搜索下拉框和表格列就全部自动生成了！
  {
    prop: "class_id",
    label: "所属班级",
    enum: classEnum,
    search: { el: "select" },
    width: 140
  },

  { prop: "points_price", label: "所需小红花", width: 120 },
  { prop: "stock", label: "库存数量", width: 120 },
  { prop: "is_active", label: "上架状态", width: 120 },
  { prop: "created_at", label: "创建时间", width: 180 },
  { prop: "operation", label: "操作", fixed: "right", width: 200 }
];

// 下方逻辑保持原样，没有任何改动
const changeStatus = async (row: Mall.MallItem) => {
  try {
    await updateMallItem(row);
    ElMessage.success(`${row.is_active ? "上架" : "下架"}成功`);
  } catch (error) {
    row.is_active = !row.is_active;
  }
};

const deleteItem = async (row: Mall.MallItem) => {
  await useHandleData(deleteMallItem, { id: [row.id] }, `删除【${row.name}】`);
  proTable.value?.getTableList();
};

const batchDelete = async (id: number[]) => {
  await useHandleData(deleteMallItem, { id }, "删除所选商品");
  proTable.value?.clearSelection();
  proTable.value?.getTableList();
};

const drawerRef = ref<InstanceType<typeof MallDrawer> | null>(null);
const openDrawer = (title: string, row: Partial<Mall.MallItem> = {}) => {
  const params = {
    title,
    isView: title === "查看",
    row: { ...row },
    api: title === "新增" ? addMallItem : updateMallItem,
    getTableList: proTable.value?.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
