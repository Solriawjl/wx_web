import { ResPage } from "@/api/interface/index";
import http from "@/api";

// 定义后端返回的垃圾物品类型
export interface GarbageItem {
  id: number;
  item_name: string;
  category_type: number;
  image_url: string;
  tips: string;
  sub_category: string;
  created_at: string;
}

/**
 * @name 垃圾分类管理模块
 */
// 获取物品图鉴列表 (带分页和条件查询)
export const getGarbageItems = (params: any) => {
  return http.get<ResPage<GarbageItem>>(`/api/admin/items`, params);
};

// 新增物品
export const addGarbageItem = (params: any) => {
  return http.post(`/api/admin/items`, params);
};

// 删除物品
export const deleteGarbageItem = (params: { id: number[] }) => {
  return http.post(`/api/admin/items/delete`, params); // 模板通常习惯用 post 传数组批量删除
};

// 编辑物品
export const editGarbageItem = (params: { id: number; [key: string]: any }) => {
  return http.put(`/api/admin/items/${params.id}`, params);
};
