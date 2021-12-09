import isPlainObject = require("lodash.isplainobject");
import { ApiAxios } from "./index";
import { IapiObj, IapiResult } from "./types";

/**
 * 读取api配置，返回映射其对应的post方法调用
 * 比如const = apiObj = {
 *    login: '/user/login-url'
 * }
 * const apiMap = api(apiObj)
 *
 * 使用登录接口
 * apiMap.login({
 *    nick: 'test',
 *    password: '123456'
 * })
 * @param apiObj api配置
 */
export const formatApiConfig = (apiObj: IapiObj): IapiResult => {
  if (!isPlainObject(apiObj)) {
    throw new Error("formatApiConfig 方法仅接受对象作为参数");
  }
  const result: IapiResult = {};
  Object.keys(apiObj).forEach(key => {
    const urlData = apiObj[key];
    if (
      !urlData ||
      (typeof urlData !== "string" && typeof urlData !== "object")
    ) {
      throw new Error(
        `formatApiConfig 仅接受url作为value值，当前为:${urlData}`
      );
    }
    const { url, method = "post" } =
      typeof urlData === "string" ? { url: urlData, method: "post" } : urlData;
    if (!url || typeof url !== "string") {
      throw new Error("formatApiConfig 中url必须为string，而且不能为空");
    }
    const fn = ApiAxios[method];
    if (typeof fn !== "function") {
      throw new Error(
        `ApiAxios 中不存在：${method}方法，目前可用方法为：${Object.keys(
          ApiAxios
        )}`
      );
    }
    // 绑定api-data配置中的数据
    result[key] = fn.bind(null, urlData);
  });
  return result;
};
