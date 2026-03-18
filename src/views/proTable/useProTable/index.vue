<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getGarbageItems"
      :init-param="initParam"
      :data-callback="dataCallback"
    >
      <template #tableHeader>
        <el-button type="primary" icon="Plus" @click="openDrawer('新增')">新增物品</el-button>
      </template>

      <template #category_type="scope">
        <el-tag :type="getCategoryTagType(scope.row.category_type)">
          {{ getCategoryName(scope.row.category_type) }}
        </el-tag>
      </template>

      <template #image_url="scope">
        <el-image
          v-if="scope.row.image_url"
          :src="scope.row.image_url"
          :preview-src-list="[scope.row.image_url]"
          style="width: 50px; height: 50px; border-radius: 4px"
          fit="cover"
        />
        <span v-else>暂无图片</span>
      </template>

      <template #operation="scope">
        <el-button type="primary" link icon="EditPen" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="danger" link icon="Delete" @click="deleteItem(scope.row)">删除</el-button>
      </template>
    </ProTable>
    <GarbageItemDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="tsx" name="useProTable">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { getGarbageItems, addGarbageItem, editGarbageItem, deleteGarbageItem, GarbageItem } from "@/api/modules/garbage";
import GarbageItemDrawer from "./components/GarbageItemDrawer.vue"; // 👉 引入抽屉组件

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTable = ref();
const drawerRef = ref<InstanceType<typeof GarbageItemDrawer> | null>(null);

// 初始化请求参数 (如果有默认参数可以写在这里)
const initParam = reactive({});

// 数据回调 (处理后端返回的数据格式，如果不一致可以在这里拦截修改)
const dataCallback = (data: any) => {
  return {
    list: data.list,
    total: data.total,
    pageNum: data.pageNum,
    pageSize: data.pageSize
  };
};

// 字典：大类枚举
const categoryEnum = [
  { label: "可回收物", value: 1 },
  { label: "有害垃圾", value: 2 },
  { label: "厨余垃圾", value: 3 },
  { label: "其他垃圾", value: 4 }
];

// 表格配置项 (极其重要：定义列和搜索表单)
const columns: ColumnProps<GarbageItem>[] = [
  { type: "selection", fixed: "left", width: 50 },
  { type: "index", label: "序号", width: 80 },
  {
    prop: "item_name",
    label: "物品名称",
    search: { el: "input", tooltip: "支持模糊搜索" } // 加了 search，顶部就会自动出现输入框
  },
  {
    prop: "category_type",
    label: "所属大类",
    enum: categoryEnum,
    search: { el: "select" } // 下拉搜索
  },
  { prop: "sub_category", label: "所属小类", width: 120 },
  { prop: "tips", label: "投放提示", showOverflowTooltip: true },
  { prop: "image_url", label: "示意图", width: 100 },
  { prop: "created_at", label: "创建时间", width: 180 },
  { prop: "operation", label: "操作", fixed: "right", width: 160 }
];

// 辅助方法：获取分类名称
const getCategoryName = (type: number) => {
  const item = categoryEnum.find(i => i.value === type);
  return item ? item.label : "未知";
};

// 辅助方法：获取标签颜色
const getCategoryTagType = (type: number) => {
  const map: Record<number, any> = {
    1: "primary", // 可回收 - 蓝色
    2: "danger", // 有害 - 红色
    3: "success", // 厨余 - 绿色
    4: "info" // 其他 - 灰色
  };
  return map[type] || "info";
};

// 打开抽屉 (新增/编辑)
const openDrawer = (title: string, row: Partial<GarbageItem> = {}) => {
  const params = {
    title,
    // 如果是新增，就传一个默认的对象；如果是编辑，就深拷贝一份行数据防止污染表格
    row: { ...row },
    // 根据 title 动态决定提交时调用哪个接口
    api: title === "新增" ? addGarbageItem : editGarbageItem,
    getTableList: proTable.value.getTableList
  };
  // 调用抽屉组件暴露的 acceptParams 方法
  drawerRef.value?.acceptParams(params);
};

// 删除操作
const deleteItem = async (row: GarbageItem) => {
  await ElMessageBox.confirm(`确认删除物品 【${row.item_name}】 吗?`, "温馨提示", { type: "warning" });
  await deleteGarbageItem({ id: [row.id] });
  ElMessage.success("删除成功");
  proTable.value.getTableList();
};
</script>
