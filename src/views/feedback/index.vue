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

// 处理审核 (采纳/驳回)
const handleAudit = async (row: FeedbackRecord, targetStatus: number) => {
  try {
    if (targetStatus === 1) {
      // ==========================================
      // 【情况 A：采纳】直接弹出 Confirm 确认框，自动发币和默认回复
      // ==========================================
      await ElMessageBox.confirm(`确认采纳反馈，并发放 2 朵小红花吗？`, "采纳确认", {
        confirmButtonText: "确定发奖",
        cancelButtonText: "取消",
        type: "success"
      });

      // 调用接口，静默塞入默认文案
      await auditFeedback({
        id: row.id,
        status: 1,
        admin_reply: "感谢您的纠错，您的反馈已采纳！"
      });

      ElMessage.success("采纳成功，奖励已发放！");
    } else if (targetStatus === 2) {
      // ==========================================
      // 【情况 B：驳回】弹出 Prompt 输入框，强制要求填写理由
      // ==========================================
      const { value } = await ElMessageBox.prompt("该反馈存在误报，请输入驳回理由：", "驳回反馈", {
        confirmButtonText: "确定驳回",
        cancelButtonText: "取消",
        inputType: "textarea", // 使用多行文本框
        inputPlaceholder: "例如：图片模糊不清 / 官方分类无误等",
        inputValue: "抱歉，您的反馈未通过审核。经人工核查，原分类结果准确无误。感谢您的参与和支持！",
        inputValidator: val => {
          // 校验器：如果为空或全是空格，则拦截并提示
          if (!val || !val.trim()) {
            return "驳回理由不能为空！请给用户一个解释。";
          }
          return true;
        }
      });

      // 调用接口，传入管理员手填的驳回理由
      await auditFeedback({
        id: row.id,
        status: 2,
        admin_reply: value.trim()
      });

      ElMessage.success("已驳回");
    }

    // 操作成功后统一刷新表格
    proTable.value.getTableList();
  } catch (error) {
    // 捕获用户点击“取消”按钮或关闭弹窗的事件
    // 为了防止控制台报 unhandled promise rejection
    ElMessage.info("已取消操作");
  }
};
</script>
