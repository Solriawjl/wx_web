import { Login } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 登录模块
 */
// 用户登录
export const loginApi = (params: Login.ReqLoginForm) => {
  // 👇 确保这里写的是完整的相对路径
  return http.post<Login.ResLogin>(`/api/admin/login`, params);
};

// 获取菜单列表
export const getAuthMenuListApi = () => {
  // 原本是 return http.get(PORT1 + `/menu/list`);
  // 或者里面写死了带 geeker 的路径，全改成下面这样：
  return http.get<Menu.MenuOptions[]>(`/api/admin/menu/list`);
};

// 获取按钮权限
export const getAuthButtonListApi = () => {
  // 同理，改成你的路径
  return http.get<Login.ResAuthButtons>(`/api/admin/auth/buttons`);
};

// 用户退出登录
export const logoutApi = () => {
  return http.post(PORT1 + `/logout`);
};
