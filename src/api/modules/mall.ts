import { ResPage } from "@/api/interface/index";
import http from "@/api";

export namespace Mall {
  export interface MallItem {
    id: number;
    name: string;
    desc: string;
    points_price: number;
    image_url: string;
    stock: number;
    is_active: boolean;
    created_at: string;
    class_id?: number;
    class_name?: string;
  }
}

// 获取商品列表
export const getMallItemList = (params: any) => {
  return http.get<ResPage<Mall.MallItem>>(`/api/admin/mall/items`, params);
};

// 新增商品
export const addMallItem = (params: any) => {
  return http.post(`/api/admin/mall/items`, params);
};

// 修改商品 (自动从 params 中提取 id)
export const updateMallItem = (params: any) => {
  return http.put(`/api/admin/mall/items/${params.id}`, params);
};

// 删除商品 (批量/单条)
export const deleteMallItem = (params: { id: number[] }) => {
  return http.post(`/api/admin/mall/items/delete`, params);
};
