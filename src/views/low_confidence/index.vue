<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      :columns="columns"
      :request-api="getLowConfidenceList"
      :init-param="initParam"
      :data-callback="dataCallback"
    >
      <template #tableHeader>
        <div class="header-tips">
          <el-alert
            title="提示：系统会自动静默拦截 AI 识别率低于 60% 的图片。人工打标后，图片将自动进入 /train 目录，成为下一轮模型训练的养料。"
            type="info"
            show-icon
            :closable="false"
          />
        </div>
      </template>

      <template #image_url="scope">
        <el-image
          style="width: 60px; height: 60px; border-radius: 4px"
          :src="scope.row.image_url"
          :preview-src-list="[scope.row.image_url]"
          preview-teleported
          fit="cover"
        />
      </template>

      <template #confidence="scope">
        <el-tag :type="scope.row.confidence < 40 ? 'danger' : 'warning'"> {{ scope.row.confidence }}% </el-tag>
      </template>

      <template #operation="scope">
        <el-button v-if="scope.row.status === 0" type="primary" link icon="EditPen" @click="openDrawer(scope.row)">
          立即打标
        </el-button>
        <span v-else-if="scope.row.status === 1" style="font-size: 13px; color: #67c23a">
          <el-icon><Select /></el-icon> 已入库
        </span>
        <span v-else-if="scope.row.status === 2" style="font-size: 13px; color: #909399">
          <el-icon><Close /></el-icon> 已废弃
        </span>
      </template>
    </ProTable>

    <AuditDrawer ref="drawerRef" />
  </div>
</template>

<script setup lang="ts" name="lowConfidenceAudit">
import { ref, reactive } from "vue";
import ProTable from "@/components/ProTable/index.vue";
import AuditDrawer from "./components/AuditDrawer.vue";
import { getLowConfidenceList } from "@/api/modules/lowConfidence";
import { ColumnProps } from "@/components/ProTable/interface";

// ProTable 实例
const proTable = ref();
// 初始化请求参数
const initParam = reactive({});

// 处理返回的数据格式
const dataCallback = (data: any) => {
  return {
    list: data.list,
    total: data.total,
    pageNum: data.pageNum,
    pageSize: data.pageSize
  };
};

// 表格配置项
const columns: ColumnProps<any>[] = [
  { type: "index", label: "#", width: 60 },
  { prop: "image_url", label: "现场原图", width: 120 },
  { prop: "confidence", label: "当时置信度", width: 120, sortable: true },
  {
    prop: "status",
    label: "处理状态",
    enum: [
      { label: "待打标", value: 0, tagType: "warning" },
      { label: "已入库", value: 1, tagType: "success" },
      { label: "已废弃", value: 2, tagType: "info" }
    ],
    search: { el: "select", props: { filterable: true } } // 允许在顶部按状态筛选
  },
  { prop: "operation", label: "操作", width: 180, fixed: "right" }
];

// 打开打标抽屉
const drawerRef = ref<InstanceType<typeof AuditDrawer> | null>(null);
const openDrawer = (row: any) => {
  drawerRef.value?.acceptParams({
    row: { ...row },
    getTableList: proTable.value?.getTableList
  });
};
</script>

<style scoped>
.header-tips {
  width: 100%;
  margin-bottom: 15px;
}
</style>
