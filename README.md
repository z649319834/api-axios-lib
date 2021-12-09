# api-axios-lib

## 为什么需要这个库

1. 完善的单元测试，覆盖度 100%。
2. promise 格式的 api 接口，避免使用回调函数。
3. 封装了读取接口配置的方法：`formatApiConfig`，可以自动映射接口调用。
4. 基于 ts 开发，完善的类型定义，使用的该库的时候可以提示 api 名称和参数说明
5. 可配置的全局钩子，这样网络接口返回的错误 message 都可以统一处理
6. 由于公司内容网络接口调用是否成功是基于 response 中的 success 字段来判断的，所以该库会自动格式化这些数据。
7. 可根据需求自定义各种需求...

## 使用方法

1. 安装依赖`npm i api-axios-lib`
2. 如何使用

```ts
// 使用ApiAxios
const { ApiAxios } = require("api-axios-lib");
// get 请求
await ApiAxios.get("/login");
// post 请求
await ApiAxios.post("/get-user-info", { nick: "lily" });
// upload 上传文件
await ApiAxios.upload("/upload/file", fileData);

// 使用 formatApiConfig 映射接口调用
const { formatApiConfig } = require("api-axios-lib");
// 接口api地址配置
const apiConfig = {
  login: "/user/login",
  getInfo: {
    url: "/user/get-info",
    method: "post"
  }
};
const api = formatApiConfig(apiConfig);

// 登录
await api.login({ nick: "lily" });
// 获取用户信息
await api.getInfo({ nick: "lily" });
```

## 配置钩子

> 介绍: 网络请求的时候，有些情况需要接口成功或者失败显示提示信息，比如使用 UI 组件的 toast 方法来显示请求中的 message 信息。所以新增了钩子方法。

### 配置钩子。

```ts
const { setFetchConfig } = require("api-axios-lib");
// 配置钩子
setFetchConfig({
  onMessage(data){
    const {success,message} = data
    const type = success ? 'success' : 'error'
    // 使用Element UI的message来提示网络信息
    Message({
      message,
      type
    })
  },
  onLocation(url){
    // 遇到网络接口返回data === -1的时候，执行跳转到指定地址
    window.location.href = url
    // 如果返回true的话，不会触发onMessage钩子。默认为false。版本： ^0.0.7
    return true
  },
  onLoading(loading){
    if (loading){
      // 执行loading显示操作
      ...
    } else {
      // 请求调用完毕关闭loading
      ...
    }
  },
  formatPostBody(body){
    // post请求的时候统一对body数据格式化处理。比如过滤冗余字段、转义、或者全局添加id,token等字段，在这里统一处理
    return {
      ...body,
      newData
    }
  }
})
  // 以上仅仅是配置了钩子，调用的时候还需要显式的传递以下参数来决定是否执行钩子调用
  // 以下参数可以随意组合使用，
  // 成功调用接口,是否触发onMessage方法
  emitSuccessMessage?: boolean;
  // 失败调用接口，是否触发onMessage方法
  emitErrorMessage?: boolean;
  // 是否调用onMessage方法，包含成功和失败
  emitMessage?: boolean;
  // 是否执行onLoading钩子方法
  showLoading?: boolean
  // 成功调用接口，同时返回message和data字段组成的对象，默认返回data
  needMessageValue?: boolean

  // 例如
  // 成功失败都触发onMessage回调
  await ApiAxios.get(url,{
    emitMessage: true
  })
  // 仅成功的时候执行
  await ApiAxios.get(url,{
    emitSuccessMessage: true
  })
  // 请求触发loading逻辑
  await ApiAxios.get(url,{
    showLoading: true
  })
```

## 配置合并

> 为了个性化配置接口的全局配置、api-data 配置、ApiAxios 的配置，新增一下合并规则。具体参考[lodash.defaults](https://lodash.com/docs/4.17.11#defaults)

`ApiAxios中的配置> apiData配置> 全局配置`

```js
// 全局配置，优先级最低
setFetchConfig({
  showLoading: true,
  onLoading
});

// api 配置, 覆盖全局的配置。设置为了showLoading = false
const apiConfig = {
  login: "/user/login",
  getInfo: {
    url: "/user/get-info",
    method: "post",
    showLoading: false
  }
};
const api = formatApiConfig(apiObj);

// ApiAxios 调用时的配置。 优先级最高，重新覆盖apiConfig的配置，重新设置为了showLoading=true

await api.getInfo({ nick: "test" }, { showLoading: true });
```

## 错误处理

如果需要对 api 调用，监听错误信息，可以使用 try catch 语句

```js
// 不建议的用法,因为try 代码块里面的任何js错误，都会走到catch语句了。
// 如果不判断error类型就认为是接口错误执行的话，就会造成误判。比如以下代码里的 throw new Error('error')
try {
  await ApiAxios.post("/login");
  throw new Error("error");
} catch (e) {
  alert("api调用错误");
}

// 建议的用法
import { ApiAxiosError } from "api-axios-lib";

try {
  await ApiAxios.post("/login");
  throw new Error("error");
} catch (e) {
  if (e instanceof ApiAxiosError) {
    alert("api调用错误");
  } else {
    // 其他错误，继续抛出。这样可以及时在控制台发现
    throw e;
  }
}
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

## 如何开发

1. 安装依赖: `npm install`
2. 编写测试用例: `npm run test:watch`
3. 确保 100%覆盖度: `npm run test:coverage`
