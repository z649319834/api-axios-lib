import { AxiosRequestConfig } from "axios";

export interface IMessageData {
  success: boolean;
  message: string;
}
export type MethodName = "get" | "post";

export interface IfetchConfig extends IemitConfig {
  /**
   * 网络接口调用成功或者失败的消息回调
   * @param data
   */
  onMessage?(data: IMessageData): void;
  /**
   * data = -1时，执行该逻辑
   * @param url 跳转地址
   */
  onLocation?(url: string): boolean;
  /**
   * 网络加载时，触发该钩子调用
   * @param loading 是否加载中
   * @param loadingText 加载文本
   */
  onLoading?(loading: boolean, loadingText: string): void;
  /**
   * 统一格式化请求数据， 最好采用如下方法处理body数据，避免污染原有body数据：Object.assign({},body,{bar:123})
   * @param body 请求数据
   */
  formatPostBody?(body: Object): Object;
}

export interface IemitConfig {
  /**
   * 成功调用接口,是否触发onMessage方法
   */
  emitSuccessMessage?: boolean;
  /**
   * 失败调用接口，是否触发onMessage方法
   */
  emitErrorMessage?: boolean;
  /**
   * 是否调用onMessage方法，包含成功和失败
   */
  emitMessage?: boolean;
  /**
   * 是否执行onLoading钩子方法
   */
  showLoading?: boolean;
  /**
   * loading时显示的loading文本
   */
  loadingText?: string;
  /**
   * 成功调用接口，同时返回message和data字段组成的对象，默认返回data
   */
  needMessageValue?: boolean;
}

export interface ApiResponseConfig extends AxiosRequestConfig, IemitConfig {}

export interface apiObjectValue extends IemitConfig {
  url: string;
  method?: "get" | "post" | "upload";
}
export interface IapiObj {
  [methodName: string]: string | apiObjectValue;
}
type ApiMethod = (body: Object, option?: ApiResponseConfig) => Promise<any>;
export interface IapiResult {
  [methodName: string]: ApiMethod;
}

export type Get = (url: string, options?: ApiResponseConfig) => Promise<any>;

export type Post = (
  url: string,
  body: Object,
  options?: ApiResponseConfig
) => Promise<any>;

export type WrapAxiosMethodUrl = string | apiObjectValue;
