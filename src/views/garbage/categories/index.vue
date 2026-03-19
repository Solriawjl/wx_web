<template>
  <div class="table-box">
    <!-- 关键修改：toolButton → tool-button -->
    <ProTable ref="proTable" :columns="columns" :request-api="getCategoryList" :pagination="false" :tool-button="false">
      <template #category_name="scope">
        <el-tag :type="getCategoryTagType(scope.row.id)" effect="dark" size="large">
          {{ scope.row.category_name }}
        </el-tag>
      </template>

      <template #operation="scope">
        <el-button type="primary" link icon="EditPen" @click="openDrawer('编辑科普内容', scope.row)">
          配置科普与教育说明
        </el-button>
      </template>
    </ProTable>

    <CategoryDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="tsx" name="garbageCategories">
import { ref } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { getCategoryList, editCategory, GarbageCategory } from "@/api/modules/category";
import CategoryDrawer from "./components/CategoryDrawer.vue";

const proTable = ref();
const drawerRef = ref<InstanceType<typeof CategoryDrawer> | null>(null);

// 表格配置项
const columns: ColumnProps<GarbageCategory>[] = [
  { type: "index", label: "序号", width: 80 },
  { prop: "category_name", label: "分类名称", width: 150 },
  { prop: "eco_value", label: "环保价值", showOverflowTooltip: true },
  { prop: "put_guidance", label: "一句话指导", showOverflowTooltip: true },
  { prop: "harm_description", label: "不分类危害 (儿童科普)", showOverflowTooltip: true },
  { prop: "process_method", label: "处理生命周期", showOverflowTooltip: true },
  { prop: "sub_guidance", label: "投放前置动作", showOverflowTooltip: true },
  { prop: "operation", label: "操作", fixed: "right", width: 220 }
];

// 获取标签颜色
const getCategoryTagType = (id: number) => {
  const map: Record<number, any> = { 1: "primary", 2: "danger", 3: "success", 4: "info" };
  return map[id] || "info";
};

// 打开抽屉
const openDrawer = (title: string, row: Partial<GarbageCategory> = {}) => {
  const params = {
    title,
    row: { ...row },
    api: editCategory,
    getTableList: proTable.value.getTableList
  };
  drawerRef.value?.acceptParams(params);
};
</script>
