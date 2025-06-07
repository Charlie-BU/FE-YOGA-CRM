import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";

// 本地
const DEVELOP_URL = "http://localhost:8052";
// 本地Db2测试
const DEVELOP_URL2 = "http://localhost:6050";
// 使用接口反向代理
const PRODUCTION_URL = "http://8.153.204.238:81";
// const PRODUCTION_URL = "http://8.153.204.238:8052";

const service: AxiosInstance = axios.create({
    baseURL: PRODUCTION_URL
    // timeout: 20000
});

service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        return config;
    },
    (error: AxiosError) => {
        ElMessage.error("服务器繁忙，请稍后重试");
        // console.log(error);
        return Promise.reject();
    }
);

service.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.status === 200) {
            return response;
        } else {
            Promise.reject();
        }
    },
    (error: AxiosError) => {
        // console.log(error);
        return Promise.reject();
    }
);

export default service;
