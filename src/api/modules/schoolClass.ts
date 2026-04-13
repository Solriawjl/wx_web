import http from "@/api";
import { School } from "@/api/interface/index";

/**
 * @name 获取所有班级列表
 */
export const getSchoolClassList = async () => {
  // 🚀 加上 /api 前缀，严格匹配 FastAPI 的路由
  const res = await http.get<School.ClassItem[]>(`/api/admin/classes`);
  if (res.data) {
    res.data.forEach(item => {
      item.full_name = `${item.grade_name} ${item.class_name}`;
    });
  }
  return res;
};

/**
 * @name 新增班级
 */
export const addSchoolClass = (params: School.ReqAddClass) => {
  // 🚀 同样加上 /api 前缀
  return http.post(`/api/admin/classes`, params);
};
