// src/api/modules/lowConfidence.ts
import http from "@/api";
import { ResPage } from "@/api/interface/index";

/**
 * @name 低置信度难例收集模块
 */

// 1. 获取难例列表
export const getLowConfidenceList = (params: any) => {
  return http.get<ResPage<any>>("/api/admin/low_confidence", params);
};

// 2. 审核打标入库
export const auditLowConfidence = (params: { id: number; status: number; correct_category_name?: string }) => {
  return http.post("/api/admin/low_confidence/audit", params);
};
