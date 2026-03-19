import { ResPage } from "@/api/interface/index";
import http from "@/api";

export interface FeedbackRecord {
  id: number;
  user_id: number;
  type: string;
  image_url: string;
  item_name: string;
  suggestion: string;
  status: number; // 0-待处理, 1-已采纳, 2-已驳回
  admin_reply: string;
  created_at: string;
}

/**
 * @name 反馈审核模块
 */
// 获取反馈列表
export const getFeedbackList = (params: any) => {
  return http.get<ResPage<FeedbackRecord>>(`/api/admin/feedbacks`, params);
};

// 审核反馈 (采纳/驳回) - 参数中增加 admin_reply
export const auditFeedback = (params: { id: number; status: number; admin_reply?: string }) => {
  return http.post(`/api/admin/feedbacks/audit`, params);
};
