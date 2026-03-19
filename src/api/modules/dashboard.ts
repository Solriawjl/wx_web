import http from "@/api";

// 获取首页大盘数据
export const getDashboardStats = () => {
  return http.get(`/api/admin/dashboard/stats`);
};
