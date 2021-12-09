import isPlainObject = require("lodash.isplainobject");
import { fetchConfig } from "./config";
import { IfetchConfig } from "./types";

/**
 * 配置网络请求的全局钩子。全局loading、message提示，body数据格式化处理
 * @param config 全局钩子配置
 */
export const setFetchConfig = (config: IfetchConfig) => {
  if (!isPlainObject(config)) {
    throw new Error("setFetchConfig 仅接受对象作为参数");
  }
  Object.assign(fetchConfig, config);
};
