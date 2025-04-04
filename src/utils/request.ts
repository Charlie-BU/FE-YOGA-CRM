import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";

const DEVELOP_URL = "http://localhost:8052";
const PRODUCTION_URL = "";

const service: AxiosInstance = axios.create({
    baseURL: DEVELOP_URL
    // timeout: 10000
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
