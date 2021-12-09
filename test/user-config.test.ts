const axios = require("axios");
const MockAdpter = require("axios-mock-adapter");
import { ApiAxios, formatApiConfig, setFetchConfig } from "../src";
import { IapiObj } from "../src/types";
const mock = new MockAdpter(axios);
const onLoading = jest.fn();

afterEach(() => {
  onLoading.mockClear();
});

// 全局配置，优先级最低
setFetchConfig({
  showLoading: true,
  onLoading
});

const loginUrl = "/login";
const loginKey = "login";
const getUserUrl = "/get-user";
const getUserkey = "getUserInfo";
const uploadUrl = "/upload/file";
const uploadFileKey = "uploadFile";
const apiObj: IapiObj = {
  // api 中没有配置
  [loginKey]: {
    url: loginUrl
  },
  // 覆盖全局的showLoading方法
  [getUserkey]: {
    url: getUserUrl,
    method: "post",
    showLoading: false
  },
  // 覆盖全局的showLoading方法, 但是调用的时候又被覆盖回去的调用
  [uploadFileKey]: {
    url: uploadUrl,
    showLoading: false
  }
};
const api = formatApiConfig(apiObj);

  // 模拟post请求
[loginUrl, getUserUrl, uploadUrl].forEach(url => {
  mock.onPost(url).reply(200);
});

describe("测试user-config合并逻辑", () => {
  it("全局配置生效", async done => {
    await api[loginKey]({});
    expect(onLoading.mock.calls.length).toBe(2);
    done();
  });
  it("apiConfig 覆盖全局配置生效", async done => {
    await api[getUserkey]({});
    expect(onLoading.mock.calls.length).toBe(0);
    done();
  });
  it("ApiAxios 配置，覆盖apiConfig", async done => {
    await api[uploadFileKey]({}, { showLoading: true });
    expect(onLoading.mock.calls.length).toBe(2);
    done();
  });
});
