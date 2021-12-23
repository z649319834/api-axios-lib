const axios = require("axios");
const MockAdpter = require("axios-mock-adapter");
import { ApiAxios, setFetchConfig } from "../src";

const mock = new MockAdpter(axios);
const onMessage = jest.fn();
const onLocation = jest.fn();
const onLoading = jest.fn();
afterEach(() => {
  mock.reset();
  onMessage.mockClear();
  onLocation.mockClear();
  onLoading.mockClear();
});

setFetchConfig({
  onMessage,
  onLocation,
  onLoading,
  formatPostBody(body) {
    return {
      ...body,
      text: "hello"
    };
  }
});
describe("测试onMessage", () => {
  describe("emitMessage = true, success 成功或者失败都会执行", () => {
    const url = "/users";
    const formatData = {
      data: ["bar", "foo"],
      success: true,
      message: "获取成功"
    };
    it("success =true, 执行onMessage", async () => {
      mock.onGet(url).reply(200, formatData);
      await ApiAxios.get(url, {
        emitMessage: true
      });
      expect(onMessage.mock.calls[0][0]).toEqual({
        success: formatData.success,
        message: formatData.message
      });
    });
    it("success = false, 执行onMessage", async () => {
      const data = Object.assign({}, formatData, { success: false });
      mock.onGet(url).reply(200, data);
      await ApiAxios.get(url, {
        emitMessage: true
      }).catch(() => {});
      expect(onMessage.mock.calls.length).toBe(1);
    });
    it("接口返回400错误，执行onMessage", async () => {
      mock.onGet(url).reply(400, formatData);
      await ApiAxios.get(url, {
        emitMessage: true
      }).catch(() => {});
      expect(onMessage.mock.calls[0][0]).toEqual({
        message: "Request failed with status code 400",
        success: false
      });
    });
  });
  describe("emitSuccessMessage = true", () => {
    const url = "/users";
    const formatData = {
      data: ["bar", "foo"],
      success: true,
      message: "获取成功"
    };
    it("success =true, 执行onMessage", async () => {
      mock.onGet(url).reply(200, formatData);
      await ApiAxios.get(url, {
        emitSuccessMessage: true
      });
      expect(onMessage.mock.calls[0][0]).toEqual({
        success: formatData.success,
        message: formatData.message
      });
    });
    it("success = false, 不执行onMessage", async () => {
      const data = Object.assign({}, formatData, { success: false });
      mock.onGet(url).reply(200, data);
      await ApiAxios.get(url, {
        emitSuccessMessage: true
      }).catch(() => {});
      expect(onMessage.mock.calls.length).toBe(0);
    });
  });

  describe("emitErrorMessage = true", () => {
    const url = "/users";
    const formatData = {
      data: ["bar", "foo"],
      success: true,
      message: "获取成功"
    };
    it("success =true, 执行onMessage", async () => {
      mock.onGet(url).reply(200, formatData);
      await ApiAxios.get(url, {
        emitErrorMessage: true
      });
      expect(onMessage.mock.calls.length).toBe(0);
    });
    it("success = false, 不执行onMessage", async () => {
      const data = Object.assign({}, formatData, { success: false });
      mock.onGet(url).reply(200, data);
      await ApiAxios.get(url, {
        emitErrorMessage: true
      }).catch(() => {});
      expect(onMessage.mock.calls[0][0]).toEqual({
        success: data.success,
        message: data.message
      });
    });
  });
});

// describe("测试onLocation", () => {
//   const url = "/users";
//   const formatData = {
//     data: -1,
//     success: true,
//     message: "www.100tal.com"
//   };
//   it("data===-1, 调用onLocation方法", async () => {
//     mock.onGet(url).reply(200, formatData);
//     await ApiAxios.get(url);
//     expect(onLocation.mock.calls[0][0]).toBe(formatData.message);
//   });
//   it("data !== -1, 则不调用onLocation方法", async () => {
//     mock
//       .onGet(url)
//       .reply(200, Object.assign({}, formatData, { data: "hello" }));
//     await ApiAxios.get(url);
//     expect(onLocation.mock.calls.length).toBe(0);
//   });
// });

describe("测试onLoading", () => {
  const url = "/users";
  const formatData = {
    data: "123",
    success: true,
    message: "www.100tal.com"
  };
  it("success=true, 调用onLoading方法", async () => {
    mock.onGet(url).reply(200, formatData);
    await ApiAxios.get(url, {
      showLoading: true
    });
    expect(onLoading.mock.calls[0][0]).toBe(true);
    expect(onLoading.mock.calls[1][0]).toBe(false);
  });
  it("success=true,传入loadingText,设置showLoading ,调用onLoading方法，并回调loadingText文本", async () => {
    const loadingText = "loading...";
    mock.onGet(url).reply(200, formatData);
    await ApiAxios.get(url, {
      loadingText,
      showLoading: true
    });
    expect(onLoading.mock.calls[0][0]).toBe(true);
    expect(onLoading.mock.calls[1][1]).toBe(loadingText);
  });
  it("success=true,传入loadingText,未设置showLoading ,调用onLoading方法，并回调loadingText文本", async () => {
    const loadingText = "loading...";
    mock.onGet(url).reply(200, formatData);
    await ApiAxios.get(url, {
      loadingText
    });
    expect(onLoading.mock.calls[0][0]).toBe(true);
    expect(onLoading.mock.calls[1][1]).toBe(loadingText);
  });
  it("success=false, 调用onLoading方法", async () => {
    mock.onGet(url).reply(200, { ...formatData, success: false });
    await ApiAxios.get(url, {
      showLoading: true
    }).catch(() => {});
    expect(onLoading.mock.calls[0][0]).toBe(true);
    expect(onLoading.mock.calls[1][0]).toBe(false);
  });
  it("接口返回非2xx状态码, 调用onLoading方法", async () => {
    mock.onGet(url).reply(400, formatData);
    await ApiAxios.get(url, {
      showLoading: true
    }).catch(() => {});
    expect(onLoading.mock.calls[0][0]).toBe(true);
    expect(onLoading.mock.calls[1][0]).toBe(false);
  });
});

describe("测试formatPostBody方法", () => {
  const url = "/users";
  const formatData = { data: ["bar", "foo"], success: true, message: "" };
  const postData = { nick: "lily" };
  it("配置了formatPostBody,post请求会添加text字段=hello", async done => {
    mock.onPost(url).reply(200, formatData);
    await ApiAxios.post(url, postData);
    expect(mock.history.post[0].data).toEqual(
      JSON.stringify({ ...postData, text: "hello" })
    );
    done();
  });
});

describe("测试needMessageValue 字段", () => {
  const url = "/users";
  const formatData = {
    data: ["bar", "foo"],
    success: true,
    message: "hello haha"
  };
  const postData = { nick: "lily" };
  it("配置了formatPostBody,post请求会添加text字段=hello", async done => {
    mock.onPost(url).reply(200, formatData);
    const resData = await ApiAxios.post(url, postData, {
      needMessageValue: true
    });
    expect(resData).toEqual({
      data: formatData.data,
      success: true,
      message: formatData.message
    });
    done();
  });
});

describe("异常情况", () => {
  it("config 非对象，报错", () => {
    [null, undefined, []].forEach(val => {
      expect(() => setFetchConfig(val as any)).toThrowError();
    });
  });
});
