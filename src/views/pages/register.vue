<template>
    <div class="login-bg">
        <div class="login-container">
            <div class="login-header">
                <img class="logo mr10" src="../../assets/img/logo.svg" alt="" />
                <div class="login-title">亚太瑜伽后台管理系统</div>
            </div>
            <el-form :model="form" ref="register" size="large">
                <el-form-item prop="username">
                    <el-input v-model="form.username" placeholder="姓名 *">
                    </el-input>
                </el-form-item>
                <el-form-item prop="gender">
                    <el-select v-model="form.gender" placeholder="性别 *" style="width: 100%">
                        <div v-for="(gender, index) in genders" :key="index">
                            <el-option :label=gender.name :value=gender.id />
                        </div>
                    </el-select>
                </el-form-item>
                <el-form-item prop="phone">
                    <el-input v-model="form.phone" placeholder="联系电话">
                    </el-input>
                </el-form-item>
                <el-form-item prop="address">
                    <el-input v-model="form.address" placeholder="地址">
                    </el-input>
                </el-form-item>
                <el-form-item prop="department">
                    <el-select v-model="form.department" placeholder="部门 *" style="width: 100%" filterable>
                        <div v-for="(dept, index) in depts" :key="index">
                            <el-option :label=dept.name :value=dept.id />
                        </div>
                    </el-select>
                </el-form-item>
                <el-form-item prop="vocation">
                    <el-select v-model="form.vocation" placeholder="职位 *" style="width: 100%" filterable>
                        <div v-for="(voc, index) in vocations" :key="index">
                            <el-option :label=voc.name :value=voc.id />
                        </div>
                    </el-select>
                </el-form-item>
                <el-form-item prop="status">
                    <el-select v-model="form.status" placeholder="状态 *" style="width: 100%" filterable>
                        <div v-for="(sta, index) in statuses" :key="index">
                            <el-option :label=sta.name :value=sta.id />
                        </div>
                    </el-select>
                </el-form-item>
                <el-form-item prop="usertype">
                    <el-select v-model="form.usertype" placeholder="用户权限 *" style="width: 100%" filterable>
                        <el-option label="普通用户" value=1 />
                        <el-option label="管理员" value=2 />
                    </el-select>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="密码 *" v-model="form.password">
                    </el-input>
                </el-form-item>
                <el-form-item prop="password2">
                    <el-input type="password" placeholder="确认密码 *" v-model="form.password2"
                        @keyup.enter="submitRegister">
                    </el-input>
                </el-form-item>
                <div class="button-container">
                    <el-button type="primary" size="large" @click="submitRegister">添加</el-button>
                    <el-button type="danger" size="large" @click="router.go(-1);">返回</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormRules } from 'element-plus';
import { Register } from '@/types/user';
import { loginCheck } from '@/utils/login-check';
import request from '@/utils/request';
import { genders, statuses, vocations } from '@/utils/conventions';

onMounted(async () => {
    const briefUserInfo = await loginCheck();
    if (!briefUserInfo || briefUserInfo?.usertype <= 1) {
        ElMessage.warning('您没有权限添加用户');
        router.push('/');
    }
    await getAllDepts();
})

const router = useRouter();
const depts = ref([])

const getAllDepts = async () => {
    const res = await request.post('/dept/getAllDepts', null, {
        headers: {
            sessionid: localStorage.getItem('sessionid')
        }
    });
    if (res.data.status < 0) {
        return
    }
    depts.value = res.data.depts;
}

const form = reactive<Register>({
    username: '',
    gender: null,
    phone: '',
    address: '',
    department: null,
    vocation: null,
    status: null,
    usertype: null,
    password: '',
    password2: '',
});

const rules: FormRules = {
    username: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    department: [{ required: true, message: '请选择部门', trigger: 'change' }],
    vocation: [{ required: true, message: '请选择职位', trigger: 'change' }],
    status: [{ required: true, message: '请选择人员状态', trigger: 'change' }],
    usertype: [{ required: true, message: '请选择用户权限', trigger: 'change' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    password2: [{ required: true, message: '请再次输入密码', trigger: 'blur' }],
};

const submitRegister = async () => {
    for (const rule in rules) {
        if (form[rule as keyof Register] === null || form[rule as keyof Register] === '') {
            ElMessage.error(rules[rule as keyof FormRules][0].message);
            return;
        }
    }
    if (form.password !== form.password2) {
        ElMessage.error('两次密码不一致');
        return;
    }
    try {
        const res = await request.post('/user/register', { form: form }, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });
        if (res.data.status < 0) {
            ElMessage.error(res.data.message);
            return
        }
        ElMessage.success(res.data.message);
        router.push('/');
    } catch (err) {
        ElMessage.error('服务器繁忙，请稍后再试');
        console.log(err);
    }
};

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

.el-radio-group {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

.el-radio {
    margin-right: 0;
}

.login-container {
    width: 500px;
    /* 稍微加宽一点以适应新增的表单项 */
}

.button-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.button-container .el-button {
    width: 200px;
}
</style>
