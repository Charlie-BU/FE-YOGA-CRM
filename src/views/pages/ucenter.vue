<template>
    <div>
        <div class="user-container">
            <el-card class="user-profile" shadow="hover" :body-style="{ padding: '0px' }">
                <div class="user-profile-bg"></div>
                <div class="user-avatar-wrap">
                    <el-avatar class="user-avatar" :size="120" :src="user?.avatarUrl || avatarImg" />
                </div>
                <div class="user-info">
                    <div class="info-name">{{ user?.username || "未登录" }}</div>
                    <div class="info-desc">
                        <span>{{ user?.departmentName }}</span>
                        <el-divider direction="vertical" />
                        <span>{{ getVocation(user?.vocation) }}</span>
                    </div>
                    <div class="info-desc">{{ user?.usertype > 1 ? "管理员" : "普通用户" }}</div>
                </div>
            </el-card>
            <el-card class="user-content" shadow="hover"
                :body-style="{ padding: '20px 50px', height: '100%', boxSizing: 'border-box' }">
                <el-tabs tab-position="left" v-model="activeName">
                    <!-- <el-tab-pane name="label1" label="消息通知" class="user-tabpane">
                        <TabsComp />
                    </el-tab-pane> -->
                    <!-- <el-tab-pane name="label2" label="我的头像" class="user-tabpane">
                        <div class="crop-wrap" v-if="activeName === 'label2'">
                            <vueCropper ref="cropper" :img="imgSrc" :autoCrop="true" :centerBox="true" :full="true"
                                mode="contain">
                            </vueCropper>
                        </div>
                        <el-button class="crop-demo-btn" type="primary">选择图片
                            <input class="crop-input" type="file" name="image" accept="image/*" @change="setImage" />
                        </el-button>
                        <el-button type="success" @click="saveAvatar">上传并保存</el-button>
                    </el-tab-pane> -->
                    <el-tab-pane name="label3" label="修改密码" class="user-tabpane">
                        <el-form class="w500" label-position="top">
                            <el-form-item label="旧密码：">
                                <el-input type="password" v-model="form.oldPwd"></el-input>
                            </el-form-item>
                            <el-form-item label="新密码：">
                                <el-input type="password" v-model="form.newPwd"></el-input>
                            </el-form-item>
                            <el-form-item label="确认新密码：">
                                <el-input type="password" v-model="form.newPwd2"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="submitModify">确定</el-button>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>

                </el-tabs>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts" name="ucenter">
import { reactive, ref, onMounted } from 'vue';
import request from '@/utils/request';
import 'vue-cropper/dist/index.css';
import avatar from '@/assets/img/img.jpg';
import { getVocation } from '@/utils/conventions';
import { ElMessage } from 'element-plus';

onMounted(async () => {
    await getUserInfo();
})

const user = ref(null);
const getUserInfo = async () => {
    const res = await request.post('/user/getUserInfo', null, {
        headers: {
            sessionid: localStorage.getItem('sessionid'),
        }
    });
    if (res.data.status < 0) {
        return
    }
    user.value = res.data.user;
}

const form = reactive({
    oldPwd: '',
    newPwd: '',
    newPwd2: '',
});
const submitModify = async () => {
    if (!form.oldPwd || !form.newPwd || !form.newPwd2) {
        ElMessage.error('请输入完整');
        return;
    }
    if (form.newPwd !== form.newPwd2) {
        ElMessage.error('两次密码不一致');
        return;
    }
    const res = await request.post('/user/modifyPwd', {
        form: form
    }, {
        headers: {
            sessionid: localStorage.getItem('sessionid'),
        }
    })
    if (res.data.status < 0) {
        ElMessage.error(res.data.message);
        return;
    }
    ElMessage.success(res.data.message);
    form.oldPwd = '';
    form.newPwd = '';
    form.newPwd2 = '';
};

const activeName = ref('label3');

const avatarImg = ref(avatar);
// const imgSrc = ref(avatar);
// const cropImg = ref('');
// const cropper: any = ref();

// const setImage = (e: any) => {
//     const file = e.target.files[0];
//     if (!file.type.includes('image/')) {
//         return;
//     }
//     const reader = new FileReader();
//     reader.onload = (event: any) => {
//         imgSrc.value = event.target.result;
//         cropper.value && cropper.value.replace(event.target.result);
//     };
//     reader.readAsDataURL(file);
// };
// const saveAvatar = () => {
//     avatarImg.value = cropImg.value;
// };
</script>

<style scoped>
.user-container {
    display: flex;
}

.user-profile {
    position: relative;
}

.user-profile-bg {
    width: 100%;
    height: 200px;
    background-image: url('../../assets/img/ucenter-bg.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.user-profile {
    width: 500px;
    margin-right: 20px;
    flex: 0 0 auto;
    align-self: flex-start;
}

.user-avatar-wrap {
    position: absolute;
    top: 135px;
    width: 100%;
    text-align: center;
}

.user-avatar {
    border: 5px solid #fff;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 7px 12px 0 rgba(62, 57, 107, 0.16);
}

.user-info {
    text-align: center;
    padding: 80px 0 30px;
}

.info-name {
    margin: 0 0 20px;
    font-size: 22px;
    font-weight: 500;
    color: #373a3c;
}

.info-desc {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
}

.info-desc,
.info-desc a {
    font-size: 18px;
    color: #55595c;
}

.info-icon {
    margin-top: 10px;
}

.info-icon i {
    font-size: 30px;
    margin: 0 10px;
    color: #343434;
}

.user-content {
    flex: 1;
}

.user-tabpane {
    padding: 10px 20px;
}

.crop-wrap {
    width: 600px;
    height: 350px;
    margin-bottom: 20px;
}

.crop-demo-btn {
    position: relative;
}

.crop-input {
    position: absolute;
    width: 100px;
    height: 40px;
    left: 0;
    top: 0;
    opacity: 0;
    cursor: pointer;
}

.w500 {
    width: 500px;
}

.user-footer {
    display: flex;
    border-top: 1px solid rgba(83, 70, 134, 0.1);
}

.user-footer-item {
    padding: 20px 0;
    width: 33.3333333333%;
    text-align: center;
}

.user-footer>div+div {
    border-left: 1px solid rgba(83, 70, 134, 0.1);
}
</style>

<style>
.el-tabs.el-tabs--left {
    height: 100%;
}
</style>
