# api-axios-lib

## 为什么需要这个库

1. 完善的单元测试，覆盖度 100%。
2. promise 格式的 api 接口，避免使用回调函数。
3. 封装了读取接口配置的方法：`formatApiConfig`，可以自动映射接口调用。
4. 基于 ts 开发，完善的类型定义，使用的该库的时候可以提示 api 名称和参数说明
5. 可配置的全局钩子，这样网络接口返回的错误 message 都可以统一处理
6. 由于公司内容网络接口调用是否成功是基于 response 中的 success 字段来判断的，所以该库会自动格式化这些数据。
7. 可根据需求自定义各种需求...

## Install

```ts
npm i 'api-axios-lib'
// or

yarn add 'api-axios-lib'
```

## Use

1、全局配置

> 介绍: 网络请求的时候，有些情况需要接口成功或者失败显示提示信息，比如使用 UI 组件的 toast 方法来显示请求中的 message 信息。所以新增了钩子方法。

```ts
// api.js
import { setFetchConfig } from 'api-axios-lib'

setFetchConfig({
  /**
   * 是否调用onMessage方法，包含成功和失败
   */
  emitMessage: false,
  /**
   * 成功调用接口,是否触发onMessage方法
   */
  emitSuccessMessage: false,
  /**
   * 失败调用接口，是否触发onMessage方法
   */
  emitErrorMessage: false,
  /**
   * 是否执行onLoading钩子方法
   */
  showLoading: false,
  /**
   * loading时显示的loading文本
   */
  loadingText: "数据加载中...",
  /**
   * 成功调用接口，返回原数据，不做数据格式化处理
   */
  needMessageValue: false,

  // 全局钩子函数
  // 消息提示函数
  onMessage(data){
    const {success,message} = data
    const type = success ? 'success' : 'error'
    // 使用Element UI的message来提示网络信息
    Message({
      message,
      type
    })
  },
  // 显示loading函数
  onLoading(loading){
    if (loading){
      // 执行loading显示操作
      ...
    } else {
      // 请求调用完毕关闭loading
      ...
    }
  },
  // post请求的时候统一对body数据格式化处理。比如过滤冗余字段、转义、或者全局添加id,token等字段，在这里统一处理
  formatPostBody(body){
    return {
      ...body,
      newData
    }
  }
})

```

2、接口配置

```ts
// api.js
import { formatApiConfig } from "api-axios-lib";

// api 配置, 覆盖全局的配置。设置为了showLoading = false
const apiConfig = {
  login: "/user/login", // 默认post请求
  getInfo: {
    url: "/user/get-info",
    method: "post",
    headers: {}, // 自定义头部信息
    showLoading: true, // 发起请求显示loading，接口结束关闭loading
    emitMessage: true // 接口请求响应后提示接口信息
  },
  getUserInfo: {
    url: "/user/get-info",
    method: "get",
    headers: {} // 自定义头部信息
  }
};
export const api = formatApiConfig(apiObj);
```

3、接口使用
**注：post 和 get 的请求参数格式不一样，headers 配置位置也不一样**

```ts
import { api } from 'api.js'

// post请求，第二个参数非必传
await api.login({ nick: 'lily' },{
  // 全局配置参数
  loadingText: "loading...",
  showLoading: true,
  ...
})

// or

api.login({ nick: 'lily' },{
  // 全局配置参数
  loadingText: "loading...",
  showLoading: true,
  ...
  headers:{
    // 自定义头部信息
    ...
  }

}).then(...).catch(...)

// get请求

await api.getUserInfo({
  params:{
    nick: 'lily'
  },
  headers:{
    // 自定义头部信息
    ...
  }
},{
  // 全局配置参数
  loadingText: "loading...",
  showLoading: true,
  ...
})


```

另一种使用方式，不推荐使用，api 过于零散，不方便统一管理和维护

```ts
import { ApiAxios } from "api-axios-lib";

// get 请求
await ApiAxios.get("/login");
// post 请求
await ApiAxios.post("/get-user-info", { nick: "lily" });
// upload 上传文件
await ApiAxios.upload("/upload/file", fileData);
```

## 配置 axios

使用场景：全局配置所有的请求或者响应钩子的时候：比如配置 headers，或者直接使用`axios`的时候。

注意事项：一定不要在项目中重新安装`axios`，不然版本不一致，会导致配置不生效。直接使用`api-axios-lib`导入的`axios` 即可。

```js
import { axios } from "api-axios-lib";

axios.interceptors.request.use(config => {
  config.headers["X-Requested-With"] = "XMLHttpRequest";
  return config;
});
```
