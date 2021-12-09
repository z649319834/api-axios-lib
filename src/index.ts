import { post, get, upload } from "./fetch";

export * from "./format-api-config";
export * from "./set-config";
export { ApiAxiosError } from "./utils";
export { default as axios } from "axios";
/**
 * 基于axios封装的接口调用
 */
export const ApiAxios = {
  /**
   * post请求数据
   * @param url post 请求地址
   * @param body post请求数据
   * @param options axios配置信息
   */
  post,
  /**
   * get请求数据
   * @param url 请求地址
   * @param options axios配置信息
   */
  get,
  /**
   * 上传文件
   * @param url 请求地址
   * @param fileData 文件内容
   */
  upload
};
