const axios = require("axios");
const MockAdpter = require("axios-mock-adapter");
import { ApiAxios, ApiAxiosError } from "../src";

const mock = new MockAdpter(axios);
afterEach(() => {
  mock.reset();
});
const formatData = { data: ["bar", "foo"], success: true, message: "" };
const formatErrorData = { data: "error", success: false, message: "调用失败" };
const unFormatData = { bar: 123, success: false };
const url = "/users";
describe("get 请求,判断相应数据", () => {
  it("可格式化数据,success=true , 返回其data字段", async done => {
    mock.onGet(url).reply(200, formatData);
    const resData = await ApiAxios.get(url);
    expect(resData).toEqual(formatData.data);
    done();
  });
  it("可格式化数据,success=false , reject data+message数据", async done => {
    mock.onGet(url).reply(200, formatErrorData);
    await ApiAxios.get(url).catch(errData => {
      const { data, message } = formatErrorData;
      const error = new ApiAxiosError(message, data);
      expect(errData).toEqual(error);
      expect(errData instanceof ApiAxiosError).toBe(true);
    });
    done();
  });
  it("为格式化的数据，返回完整数据", async done => {
    mock.onGet(url).reply(200, unFormatData);
    const resData = await ApiAxios.get(url);
    expect(resData).toEqual(unFormatData);
    done();
  });
  it("data 为json字符串,自动解析", async done => {
    const data = Object.assign({}, formatData, { data: '{"bar":123}' });
    mock.onGet(url).reply(200, data);
    const resData = await ApiAxios.get(url);
    expect(resData).toEqual({ bar: 123 });
    done();
  });
  it("没有配置hook的时候，emitMessage=true,并不会有效果", async done => {
    mock.onGet(url).reply(200, unFormatData);
    const resData = await ApiAxios.get(url, {
      emitMessage: true
    });
    expect(resData).toEqual(unFormatData);
    done();
  });
  it("没有配置hook的时候，data=-1,并不会有效果", async done => {
    mock.onGet(url).reply(200, { ...formatData, data: -1 });
    const resData = await ApiAxios.get(url, {
      emitMessage: true
    });
    expect(resData).toEqual(-1);
    done();
  });
});

describe("Post 请求,判断相应数据", () => {
  const postData = { bar: 123, foo: 456 };
  it("可格式化数据,success=true , 返回其data字段", async done => {
    mock.onPost(url).reply(200, formatData);
    const resData = await ApiAxios.post(url, postData);
    expect(mock.history.post[0].data).toEqual(JSON.stringify(postData));
    expect(resData).toEqual(formatData.data);
    done();
  });
  it("可格式化数据,success=false , reject data+message数据", async done => {
    mock.onPost(url).reply(200, formatErrorData);
    await ApiAxios.post(url, postData).catch(errData => {
      const { data, message } = formatErrorData;
      const error = new ApiAxiosError(message, data);
      expect(errData).toEqual(error);
      expect(errData instanceof ApiAxiosError).toBe(true);
    });
    done();
  });
  it("为格式化的数据，返回完整数据", async done => {
    mock.onPost(url).reply(200, unFormatData);
    const resData = await ApiAxios.post(url, postData);
    expect(mock.history.post[0].data).toEqual(JSON.stringify(postData));
    expect(resData).toEqual(unFormatData);
    done();
  });
});

describe("upload方法", () => {
  const url = "/upload";
  it("正常提交upload", async done => {
    mock.onPost(url).reply(200);
    const blob = new Blob(["hello"]);
    await ApiAxios.upload(url, blob);
    const postData = mock.history.post[0];
    const { data } = postData;
    // header
    expect(postData.headers["Content-Type"]).toBe("multipart/form-data");
    // post body 为formData
    expect(data instanceof FormData).toBe(true);
    done();
  });
  it("fileData非blob报错", () => {
    expect(() => ApiAxios.upload("/upload", {} as any)).toThrowError();
  });
});
