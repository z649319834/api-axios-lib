import { IfetchConfig } from "./types";

const noop = <T>(data: T): T => data;

export const fetchConfig: IfetchConfig = {
  /**
   * 成功调用接口,是否触发onMessage方法
   */
  emitSuccessMessage: false,
  /**
   * 失败调用接口，是否触发onMessage方法
   */
  emitErrorMessage: false,
  /**
   * 是否调用onMessage方法，包含成功和失败
   */
  emitMessage: false,
  /**
   * 是否执行onLoading钩子方法
   */
  showLoading: false,
  /**
   * loading时显示的loading文本
   */
  loadingText: "数据加载中...",
  /**
   * 成功调用接口，同时返回message和data字段组成的对象，默认返回data
   */
  needMessageValue: false,
  onMessage: noop,
  onLocation: () => false,
  onLoading: noop,
  formatPostBody: noop
};
