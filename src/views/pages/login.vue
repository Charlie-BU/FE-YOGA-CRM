<template>
    <div class="login-bg">
        <div class="login-container">
            <div class="login-header">
                <img class="logo mr10" src="../../assets/img/logo.svg" alt="" />
                <div class="login-title">亚太瑜伽后台管理系统</div>
            </div>
            <el-form :model="form" :rules="rules" ref="login" size="large">
                <el-form-item prop="username">
                    <el-input v-model="form.username" placeholder="用户名">
                        <template #prepend>
                            <el-icon>
                                <User />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="密码" v-model="form.password" @keyup.enter="submitLogin">
                        <template #prepend>
                            <el-icon>
                                <Lock />
                            </el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-button class="login-btn" type="primary" size="large" @click="submitLogin">登录</el-button>
                <!-- <p class="login-text">
                    没有账号？<el-link type="primary" @click="$router.push('/register')">立即注册</el-link>
                </p> -->
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTabsStore } from '@/store/tabs';
import request from '@/utils/request';

import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormRules } from 'element-plus';

interface LoginInfo {
    username: string;
    password: string;
}

const lgStr = localStorage.getItem('login-form');
const defParam = lgStr ? JSON.parse(lgStr) : null;

const router = useRouter();
const form = reactive<LoginInfo>({
    username: defParam ? defParam.username : '',
    password: defParam ? defParam.password : '',
});

const rules: FormRules = {
    username: [
        {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
        },
    ],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const submitLogin = async () => {
    if (!form.username || !form.password) {
        ElMessage.error('请输入完整');
        return;
    }
    try {
        const res = await request.post('/user/login', form);
        if (res.data.status < 0) {
            ElMessage.error(res.data.message);
            return
        }
        ElMessage.success('登录成功');
        localStorage.setItem('sessionid', res.data.sessionid);
        router.push('/');
    }
    catch (err) {
        ElMessage.error('服务器繁忙，请稍后再试');
        console.log(err);
    }
}

const tabs = useTabsStore();
tabs.clearTabs();
</script>

<style scoped>
.login-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    background: url(../../assets/img/background.jpg) center/cover no-repeat;
}

.login-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
}

.logo {
    width: 35px;
}

.login-title {
    font-size: 22px;
    color: #333;
    font-weight: bold;
}

.login-container {
    width: 450px;
    border-radius: 5px;
    background: #fff;
    padding: 40px 50px 50px;
    box-sizing: border-box;
}

.pwd-tips {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    margin: -10px 0 10px;
    color: #787878;
}

.pwd-checkbox {
    height: auto;
}

.login-btn {
    display: block;
    width: 100%;
}

.login-tips {
    font-size: 12px;
    color: #999;
}

.login-text {
    display: flex;
    align-items: center;
    margin-top: 20px;
    font-size: 14px;
    color: #787878;
}
</style>
