<template>
  <div class="table-box">
    <ProTable ref="proTable" :columns="columns" :request-api="getFeedbackList" :init-param="initParam">
      <template #type="scope">
        <el-tag :type="scope.row.type === 'image' ? 'warning' : 'info'">
          {{ scope.row.type === "image" ? "拍照纠错" : "文本纠错" }}
        </el-tag>
      </template>

      <template #image_url="scope">
        <el-image
          v-if="scope.row.image_url"
          :src="scope.row.image_url"
          :preview-src-list="[scope.row.image_url]"
          style="width: 60px; height: 60px; border-radius: 6px"
          fit="cover"
        />
        <span v-else>无照片</span>
      </template>

      <template #status="scope">
        <el-tag v-if="scope.row.status === 0" type="danger">待处理</el-tag>
        <el-tag v-else-if="scope.row.status === 1" type="success">已采纳</el-tag>
        <el-tag v-else type="info">已驳回</el-tag>
      </template>

      <template #operation="scope">
        <el-button type="success" link icon="Check" :disabled="scope.row.status !== 0" @click="handleAudit(scope.row, 1)">
          采纳入库
        </el-button>
        <el-button type="danger" link icon="Close" :disabled="scope.row.status !== 0" @click="handleAudit(scope.row, 2)">
          驳回
        </el-button>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="tsx" name="feedbackAudit">
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ProTable from "@/components/ProTable/index.vue";
import { ColumnProps } from "@/components/ProTable/interface";
import { getFeedbackList, auditFeedback, FeedbackRecord } from "@/api/modules/feedback";

const proTable = ref();

// 默认只查待处理的
const initParam = reactive({});

// 状态枚举，用于下拉搜索
const statusEnum = [
  { label: "待处理", value: 0 },
  { label: "已采纳", value: 1 },
  { label: "已驳回", value: 2 }
];

// 表格列配置
const columns: ColumnProps<FeedbackRecord>[] = [
  { type: "index", label: "序号", width: 80 },
  { prop: "user_id", label: "用户ID", width: 100 },
  { prop: "type", label: "纠错类型", width: 120 },
  { prop: "image_url", label: "现场照片", width: 120 },
  { prop: "item_name", label: "原识别结果 (AI判错)", width: 180, search: { el: "input" } },
  { prop: "suggestion", label: "用户建议正确分类", width: 180 },
  { prop: "status", label: "处理状态", enum: statusEnum, search: { el: "select" }, width: 120 },
  { prop: "admin_reply", label: "管理员回复", width: 200, showOverflowTooltip: true },
  { prop: "created_at", label: "提交时间", width: 180 },
  { prop: "operation", label: "审核操作", fixed: "right", width: 200 }
];

// 处理审核 (采纳/驳回) + 填写回复
const handleAudit = async (row: FeedbackRecord, targetStatus: number) => {
  const actionText = targetStatus === 1 ? "采纳" : "驳回";
  const defaultReply =
    targetStatus === 1 ? "感谢您的纠错，您的反馈已采纳！奖励积分+5。" : "抱歉，您的纠错未通过审核，原识别结果准确。";

  try {
    // 使用 ElMessageBox.prompt 唤起带输入框的弹窗
    const { value } = await ElMessageBox.prompt(`请输入【${actionText}】原因或给用户的回复消息：`, "审核并回复", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputType: "textarea", // 使用多行文本框
      inputValue: defaultReply, // 给一个默认回复文案，方便管理员直接点确定
      inputPlaceholder: "请输入回复内容..."
    });

    // 调用接口，将状态和输入的回复一起发给后端
    await auditFeedback({
      id: row.id,
      status: targetStatus,
      admin_reply: value || "" // 如果清空了输入框，则传空字符串
    });

    ElMessage.success(`操作成功！`);
    proTable.value.getTableList();
  } catch (error) {
    // 捕获用户点击“取消”按钮或关闭弹窗的事件，防止控制台报 unhandled promise rejection
    ElMessage.info("已取消审核");
  }
};
</script>
