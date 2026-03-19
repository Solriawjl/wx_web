<template>
  <div class="message">
    <el-popover placement="bottom" :width="310" trigger="click">
      <template #reference>
        <el-badge :value="pendingCount" :hidden="pendingCount === 0" class="item">
          <i :class="'iconfont icon-xiaoxi'" class="toolBar-icon"></i>
        </el-badge>
      </template>
      <el-tabs v-model="activeName">
        <el-tab-pane label="待办事项" name="todo">
          <div class="message-list">
            <div class="message-item" v-if="pendingCount > 0">
              <img src="@/assets/images/msg01.png" alt="" class="message-icon" />
              <div class="message-content">
                <span class="message-title">用户纠错反馈待审核</span>
                <span class="message-date">有 {{ pendingCount }} 条小程序用户提交的反馈等待您的处理。</span>
              </div>
            </div>
            <div class="message-empty" v-else>
              <img src="@/assets/images/notData.png" alt="notData" />
              <div>暂无待办事项，您已处理完所有工作！</div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="message-bottom" v-if="pendingCount > 0">
        <el-button type="primary" plain size="small" @click="goToFeedback"> 立即前往处理 </el-button>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import http from "@/api";

const router = useRouter();
const activeName = ref("todo");
const pendingCount = ref(0);

// 获取待办数量
const fetchNotifications = async () => {
  try {
    const res = await http.get<{ pending_feedbacks: number }>(`/api/admin/notifications`);
    pendingCount.value = res.data.pending_feedbacks;
  } catch (error) {
    console.error("获取通知失败", error);
  }
};

// 跳转到反馈审核页面
const goToFeedback = () => {
  // 点击后关闭 popover (通过模拟点击外部或自动失去焦点实现，通常路由跳转即可)
  router.push("/feedback");
};

// 页面挂载时拉取一次数据 (如果追求实时，可以使用 setInterval 定时轮询)
onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped lang="scss">
.message-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  line-height: 30px;
  img {
    width: 120px;
    margin-bottom: 15px;
  }
}
.message-list {
  display: flex;
  flex-direction: column;
  .message-item {
    display: flex;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid var(--el-border-color-light);
    &:last-child {
      border: none;
    }
    .message-icon {
      width: 40px;
      height: 40px;
      margin-right: 15px;
    }
    .message-content {
      display: flex;
      flex-direction: column;
      .message-title {
        margin-bottom: 5px;
        font-size: 14px;
        font-weight: bold;
      }
      .message-date {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
.message-bottom {
  display: flex;
  justify-content: center;
  padding-top: 15px;
  border-top: 1px solid var(--el-border-color-light);
}
</style>
