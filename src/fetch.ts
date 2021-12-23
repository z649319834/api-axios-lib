import axios from "axios";
import _defaults = require("lodash.defaults");
import {
  ApiResponseConfig,
  MethodName,
  Get,
  Post,
  WrapAxiosMethodUrl,
  IemitConfig
} from "./types";
import {
  handleLoading,
  formatResponse,
  handleMessage,
  ApiAxiosError
} from "./utils";
import { fetchConfig } from "./config";

/**
 * 包装axios网络请求方法，增加格式化、钩子等逻辑
 * @param method 请求方法名
 */
const wrapAxiosMethod = (method: MethodName) => (
  urlData: WrapAxiosMethodUrl,
  body: Object,
  options: ApiResponseConfig = {}
): Promise<any> => {
  const isGet = method === "get";
  const isPost = method === "post";
  let url: string;
  let apiConfig = {};
  if (typeof urlData === "string") {
    url = urlData;
  } else {
    // 兼容formatApiConfig的数据绑定
    ({ url } = urlData);
    apiConfig = urlData;
  }
  // 如果是get方法，那么body即为options参数
  if (isGet) {
    options = body || {};
  } else if (isPost) {
    // 格式化body数据，有可能需要统一加一些全局token或者id字段
    body = fetchConfig.formatPostBody(body);
  }
  // 合并配置信息, 优先级从高到低依次为：调用api的options > apiConfig > 全局配置 fetchConfig
  const userConfig: IemitConfig = _defaults(options, apiConfig, fetchConfig);
  handleLoading(options, true);
  const fn = isGet ? axios.get(url, options) : axios.post(url, body, options);
  return fn.then(
    res => {
      // 接口执行关闭后，触发loading关闭的钩子
      handleLoading(userConfig, false);
      return formatResponse(res, userConfig);
    },
    // 网络接口调用失败时
    err => {
      handleMessage(userConfig, err);
      // 接口执行关闭后，触发loading关闭的钩子
      handleLoading(userConfig, false);
      // const error = new ApiAxiosError(err.message, err);
      return Promise.reject(err);
    }
  );
};

/**
 * get请求数据
 * @param url 请求地址
 * @param options axios配置信息
 */
export const get: Get = wrapAxiosMethod("get");

/**
 * post请求数据
 * @param url post 请求地址
 * @param body post请求数据
 * @param options axios配置信息
 */
export const post: Post = wrapAxiosMethod("post");

/**
 * 上传文件
 * @param url 文件上传地址
 * @param fileData 文件
 */
export const upload = (url: string, fileData: Blob) => {
  if (!(fileData instanceof Blob)) {
    throw new Error("upload方法目前仅支持Blob格式上传");
  }
  const formData = new FormData();
  formData.append("file", fileData);
  return post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};
