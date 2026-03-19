<template>
  <div class="home-container">
    <el-row :gutter="20" class="data-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="card-item bg-blue">
          <div class="card-header">
            <span>小程序总用户数</span>
            <el-icon><User /></el-icon>
          </div>
          <div class="card-value">{{ stats.user_count }}</div>
          <div class="card-bottom">累计授权注册用户</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="card-item bg-green">
          <div class="card-header">
            <span>垃圾图鉴词汇量</span>
            <el-icon><Collection /></el-icon>
          </div>
          <div class="card-value">{{ stats.item_count }}</div>
          <div class="card-bottom">四分类词库总数</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="card-item bg-orange">
          <div class="card-header">
            <span>累计 AI 识别次数</span>
            <el-icon><Camera /></el-icon>
          </div>
          <div class="card-value">{{ stats.recognize_count }}</div>
          <div class="card-bottom">端云协同识别总计</div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="card-item bg-red">
          <div class="card-header">
            <span>待处理纠错反馈</span>
            <el-icon><Bell /></el-icon>
          </div>
          <div class="card-value">{{ stats.pending_feedback }}</div>
          <div class="card-bottom">等待采纳入库的错题</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>近 7 天用户 AI 识别活跃度趋势</span>
            </div>
          </template>
          <div ref="chartRef" style="width: 100%; height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="home">
import { ref, onMounted, reactive } from "vue";
import { getDashboardStats } from "@/api/modules/dashboard";
import * as echarts from "echarts";

const chartRef = ref(null);
const stats = reactive({
  user_count: 0,
  item_count: 0,
  pending_feedback: 0,
  recognize_count: 0
});

// 拉取数据并初始化图表
const initData = async () => {
  try {
    const res = await getDashboardStats();
    // 赋值给顶部卡片
    stats.user_count = res.data.user_count;
    stats.item_count = res.data.item_count;
    stats.pending_feedback = res.data.pending_feedback;
    stats.recognize_count = res.data.recognize_count;

    // 渲染折线图
    if (chartRef.value) {
      const myChart = echarts.init(chartRef.value);
      const option = {
        tooltip: { trigger: "axis" },
        grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: res.data.chart_data.xAxis
        },
        yAxis: { type: "value" },
        series: [
          {
            name: "识别次数",
            type: "line",
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(64,158,255,0.5)" },
                { offset: 1, color: "rgba(64,158,255,0.1)" }
              ])
            },
            itemStyle: { color: "#409EFF" },
            data: res.data.chart_data.series
          }
        ]
      };
      myChart.setOption(option);

      // 监听窗口大小变化自动缩放图表
      window.addEventListener("resize", () => {
        myChart.resize();
      });
    }
  } catch (error) {
    console.error("获取首页大盘数据失败", error);
  }
};

onMounted(() => {
  initData();
});
</script>

<style scoped lang="scss">
.home-container {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  .data-cards {
    .card-item {
      color: #ffffff;
      border: none;
      border-radius: 8px;
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;
        opacity: 0.9;
      }
      .card-value {
        margin: 15px 0;
        font-size: 36px;
        font-weight: bold;
      }
      .card-bottom {
        font-size: 13px;
        opacity: 0.8;
      }
    }

    // 卡片颜色
    .bg-blue {
      background: linear-gradient(135deg, #409eff, #79bbff);
    }
    .bg-green {
      background: linear-gradient(135deg, #67c23a, #95d475);
    }
    .bg-orange {
      background: linear-gradient(135deg, #e6a23c, #eebe77);
    }
    .bg-red {
      background: linear-gradient(135deg, #f56c6c, #f89898);
    }
  }
  .chart-header {
    font-size: 16px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }
}
</style>
