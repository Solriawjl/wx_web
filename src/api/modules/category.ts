import { ResPage } from "@/api/interface/index";
import http from "@/api";

export interface GarbageCategory {
  id: number;
  category_name: string;
  category_class: string;
  eco_value: string;
  put_guidance: string;
  harm_description: string;
  process_method: string;
  sub_guidance: string;
}

/**
 * @name 四大类科普管理模块
 */
// 获取大类列表
export const getCategoryList = (params?: any) => {
  return http.get<ResPage<GarbageCategory>>(`/api/admin/categories`, params);
};

// 编辑大类科普信息
export const editCategory = (params: { id: number; [key: string]: any }) => {
  return http.put(`/api/admin/categories/${params.id}`, params);
};
