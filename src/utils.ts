import { ApiResponseConfig, IemitConfig } from "./types";

import { fetchConfig } from "./config";

import { AxiosResponse } from "axios";

const formatKeys = ["data", "success", "message"];
// 安全解析JSON数据，对于网络返回的的数据，尝试调用JSON parse解析
export const safeParse = (str: any) => {
  try {
    return typeof str === "string" ? JSON.parse(str) : str;
  } catch (error) {
    return str;
  }
};

// 是否的公司网络接口返回的数据接口
// 这里假定只要返回的数据包含formatKeys的全部字段，则就为标准可格式化的数据
export const isFormatedData = (resData: any) => {
  return (
    typeof resData === "object" &&
    formatKeys.every(key => Object.keys(resData).includes(key))
  );
};

/**
 * 处理loading逻辑
 * @param options 请求配置
 * @param loading 是否loading
 */
export const handleLoading = (options: ApiResponseConfig, loading: boolean) => {
  const { showLoading, loadingText } = options;
  // 只传入loadingText也会显示loading逻辑
  if (loadingText || showLoading) {
    fetchConfig.onLoading(loading, loadingText || "数据加载中...");
  }
};

/**
 * 根据succes和配置，决定是否执行onMessage方法
 * @param formatConfig 请求配置
 * @param message 请求返回消息
 * @param success 请求结果
 */
export const handleMessage = (formatConfig: IemitConfig, res: any) => {
  const { emitErrorMessage, emitMessage, emitSuccessMessage } = formatConfig;
  const isNeedEdmitMessage =
    // 成功的message
    (res.success && (emitSuccessMessage || emitMessage)) ||
    // 失败的message
    (!res.success && (emitErrorMessage || emitMessage));
  // 广播message信息
  if (isNeedEdmitMessage) {
    fetchConfig.onMessage(res);
  }
};

/**
 * 自定义错误类型
 */
export class ApiAxiosError extends Error {
  constructor(message: string, public data: any) {
    super(message);
    // ts需要配置这个，才可以使用 error instanceof ApiAxiosError === true
    // 参考: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, ApiAxiosError.prototype);
    this.data = data;
  }
}

/**
 * 格式化axios返回的数据。
 * 根据success来判断，接口请求是否ok
 */
export const formatResponse = (
  response: AxiosResponse,
  formatConfig: ApiResponseConfig
) => {
  const { data: resData } = response;
  const { needMessageValue } = formatConfig;
  if (!isFormatedData(resData)) return safeParse(resData);
  const { data, success, message } = resData;
  // 判断是否需要跳转登录
  // if (data === -1) {
  //   // 如果onLocation 返回true，则直接返回，不执行后面的逻辑了
  //   const isSkip = fetchConfig.onLocation(message);
  //   if (isSkip) return Promise.reject(new ApiAxiosError(message, resData));
  // }
  handleMessage(formatConfig, resData);
  const parsedData = safeParse(data);
  // 成功返回的数据, 默认返回解析后的data字段，只有needMessageValue 才需要返回
  const res = needMessageValue ? resData : parsedData;
  // 失败反馈的数据
  // const errorData = new ApiAxiosError(message, res);
  return success ? Promise.resolve(res) : Promise.reject(res);
};
