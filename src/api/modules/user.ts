import { ResPage } from "@/api/interface/index";
import http from "@/api";

// 定义小程序用户的数据结构
export interface MiniUser {
  id: number;
  openid: string;
  nickname: string;
  avatar_url: string;
  score: number;
  eco_coin: number;
  title: string;
  created_at: string;
  role: string;
}

/**
 * @name 小程序用户管理模块
 */
// 获取用户列表
export const getUserList = (params: any) => {
  return http.get<ResPage<MiniUser>>(`/api/admin/users`, params);
};

// 新增用户
export const addUser = (params: any) => {
  return http.post(`/api/admin/users`, params);
};

// 删除用户
export const deleteUser = (params: { id: number[] }) => {
  return http.post(`/api/admin/users/delete`, params);
};

// 获取教师邀请码列表
export const getInviteCodesApi = () => {
  return http.get(`/api/admin/invite_codes`);
};

// 生成新的教师邀请码
export const generateInviteCodeApi = () => {
  return http.post(`/api/admin/generate_invite_code`);
};
