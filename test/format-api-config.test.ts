const axios = require("axios");
const MockAdpter = require("axios-mock-adapter");
import { formatApiConfig } from "../src";
import { IapiObj } from "../src/types";

const mock = new MockAdpter(axios);
// 每次执行完测试用例，清空mock数据
afterEach(() => {
  mock.reset();
});
// mock 响应数据
const resBodyData = { data: "hello", success: true, message: "" };
// post 提交数据
const postData = { bar: 123, foo: 456 };

// 测试api封装后的方法
const testPost = async (fn: Function) => {
  const resData = await fn(postData);
  expect(mock.history.post[0].data).toEqual(JSON.stringify(postData));
  expect(resData).toEqual(resBodyData.data);
};

describe("测试formatApiConfig", () => {
  it("正常配置，返回可调用的api请求方法", async done => {
    const loginUrl = "/login";
    const loginKey = "login";
    const getUserUrl = "/get-user";
    const getUserkey = "getUserInfo";
    const uploadUrl = "/upload/file";
    const uploadFileKey = "uploadFile";
    const apiObj: IapiObj = {
      [loginKey]: loginUrl,
      [getUserkey]: {
        url: getUserUrl,
        method: "post"
      },
      [uploadFileKey]: {
        url: uploadUrl
      }
    };
    const api = formatApiConfig(apiObj);
    // 模拟post请求
    [loginUrl, getUserUrl, uploadUrl].forEach(url => {
      mock.onPost(url).reply(200, resBodyData);
    });
    await testPost(api.login);
    await testPost(api.getUserInfo);
    await testPost(api.uploadFile);
    done();
  });
  it("apiConfig value为非字符串，报错", () => {
    [123, "", null].forEach(val => {
      expect(() => {
        formatApiConfig({
          login: val
        } as any);
      }).toThrowError();
    });
  });
});

describe("异常情况", () => {
  it("config非对象格式报错", () => {
    [null, undefined, []].forEach(val => {
      expect(() => formatApiConfig(val as any)).toThrowError();
    });
  });
  it("没有传入url报错", () => {
    expect(() =>
      formatApiConfig({
        user: {
          showLoading: true
        }
      } as any)
    ).toThrowError();
  });
  it("配置了未支持的method报错", () => {
    expect(() => {
      formatApiConfig({
        user: {
          url: "/user",
          method: "option"
        }
      } as any);
    }).toThrowError();
  });
});
