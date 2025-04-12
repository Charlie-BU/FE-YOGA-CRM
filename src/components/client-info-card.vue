<template>
    <el-dialog title="客户信息卡" v-model="visible" width="800px" destroy-on-close>
        <div class="client-info-card">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="姓名">{{ client.name }}</el-descriptions-item>
                <el-descriptions-item label="渠道来源">{{ conventions.getFromSource(client.fromSource)
                }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ conventions.getGender(client.gender)
                }}</el-descriptions-item>
                <el-descriptions-item label="年龄">{{ client.age }}</el-descriptions-item>
                <el-descriptions-item label="身份证">{{ client.IDNumber }}</el-descriptions-item>
                <el-descriptions-item label="电话">{{ client.phone }}</el-descriptions-item>
                <el-descriptions-item label="微信">{{ client.weixin }}</el-descriptions-item>
                <el-descriptions-item label="QQ">{{ client.QQ }}</el-descriptions-item>
                <el-descriptions-item label="抖音">{{ client.douyin }}</el-descriptions-item>
                <el-descriptions-item label="小红书">{{ client.rednote }}</el-descriptions-item>
                <el-descriptions-item label="商务通">{{ client.shangwutong }}</el-descriptions-item>
                <el-descriptions-item label="地区">{{ client.address }}</el-descriptions-item>
                <el-descriptions-item label="客户状态">{{ conventions.getClientStatus(client.clientStatus)
                }}</el-descriptions-item>
                <el-descriptions-item label="所属人 / 合作老师">{{ client.affiliatedUserName }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ client.createdTime }}</el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">{{ client.info }}</el-descriptions-item>
            </el-descriptions>

            <!-- 如果是已预约客户，显示预约信息 -->
            <div v-if="client.clientStatus === 4" class="appointment-info">
                <h3>预约信息</h3>
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="校区">{{ client.schoolName }}</el-descriptions-item>
                    <el-descriptions-item label="预约人">{{ client.appointerName }}</el-descriptions-item>
                    <el-descriptions-item v-if="client.comboId" label="套餐">{{ client.comboName }}</el-descriptions-item>
                    <el-descriptions-item label="课程">{{ client.courseNames }}</el-descriptions-item>
                    <el-descriptions-item label="预约日期">{{ client.appointDate }}</el-descriptions-item>
                    <el-descriptions-item label="下次沟通日期">{{ client.nextTalkDate }}</el-descriptions-item>
                    <el-descriptions-item label="跟进状态">{{ client.processStatus === 1 ? "未成单" :
                        client.processStatus === 2 ? "已成单" : "" }}</el-descriptions-item>
                    <el-descriptions-item label="成单时间">{{ client.cooperateTime }}</el-descriptions-item>
                    <el-descriptions-item label="合同编号">{{ client.contractNo }}</el-descriptions-item>
                    <el-descriptions-item label="预约备注" :span="2">{{ client.detailedInfo
                    }}</el-descriptions-item>
                </el-descriptions>
            </div>

            <!-- 如果有交易记录，显示交易记录 -->
            <div v-if="paymentRecords.length > 0" class="payment-records">
                <h3>交易记录</h3>
                <el-table :data="paymentRecords" style="width: 100%">
                    <el-table-column prop="amount" label="金额" align="center" />
                    <el-table-column prop="paymentMethod" label="交易方式" align="center">
                        <template #default="scope">
                            {{ conventions.getPaymentMethod(scope.row.paymentMethod) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="category" label="类型" align="center">
                        <template #default="scope">
                            {{ scope.row.category === 1 ? '定金' : scope.row.category === 2 ? "尾款" : '其他' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="teacherName" label="负责老师" align="center" />
                    <el-table-column prop="paymentTime" label="交易时间" align="center">
                        <template #default="scope">
                            <el-tooltip :content="scope.row.paymentTime" placement="top" effect="dark">
                                <span>{{ scope.row.paymentTime }}</span>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column prop="info" label="备注" align="center" />
                </el-table>
            </div>

            <!-- 如果已成单，显示学习记录 -->
            <div v-if="client.processStatus === 2" class="study-records">
                <h3>学习记录</h3>
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="校区">{{ client.schoolName }}</el-descriptions-item>
                    <el-descriptions-item label="已学课时（周）">{{ client.learnedWeeks }}</el-descriptions-item>
                    <el-descriptions-item v-if="client.comboId" label="学习套餐">{{ client.comboName
                    }}</el-descriptions-item>
                    <el-descriptions-item label="学习课程">{{ client.courseNames }}</el-descriptions-item>
                </el-descriptions>

                <h3 style="margin: 20px 0 15px;">课程信息</h3>
                <el-table :data="courseRecords" style="width: 100%" class="course-table">
                    <el-table-column prop="name" label="课程名称" align="center" min-width="120" />
                    <el-table-column prop="category" label="课程类别" align="center" min-width="100">
                        <template #default="scope">
                            {{ conventions.getCourseCategory(scope.row.category) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="schoolName" label="校区" align="center" min-width="120" />
                    <el-table-column prop="duration" label="总课时（周）" width="150" align="center" min-width="100" />
                    <el-table-column prop="chiefTeacherName" label="主讲人" align="center" min-width="100" />
                    <el-table-column prop="classTeacherName" label="班主任" align="center" min-width="100" />
                    <el-table-column prop="teachingAssistantName" label="助教" align="center" min-width="100" />
                    <el-table-column prop="price" label="课程价格（元）" width="150" align="center" min-width="100" />
                    <el-table-column prop="info" label="课程备注" align="center" min-width="150" show-overflow-tooltip />
                </el-table>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import * as conventions from '@/utils/conventions'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    client: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const paymentRecords = ref([])
const courseRecords = ref([])

watch(() => props.modelValue, async (newVal) => {
    visible.value = newVal
    if (newVal && props.client.id) {
        await Promise.all([
            getPaymentRecords(),
            getCourseRecords()
        ])
    }
})

watch(() => visible.value, (val) => {
    emit('update:modelValue', val)
})

const getPaymentRecords = async () => {
    try {
        const res = await request.post('/extra/getClientPayments', {
            clientId: props.client.id
        }, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        })

        if (res.data.status === 200) {
            paymentRecords.value = res.data.payments || []
        } else {
            paymentRecords.value = []
        }
    } catch (error) {
        console.error('获取交易记录失败:', error)
        ElMessage.error('获取交易记录失败')
    }
}

// 获取课程记录
const getCourseRecords = async () => {
    try {
        const courseIds = props.client.courseIds;
        const res = await request.post('/course/getCoursesByIds', {
            courseIds
        }, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        })

        if (res.data.status === 200) {
            courseRecords.value = res.data.courses || []
        } else {
            courseRecords.value = []
        }
    } catch (error) {
        console.error('获取课程记录失败:', error)
        ElMessage.error('获取课程记录失败')
    }
}
</script>

<style scoped>
.client-info-card {
    padding: 10px;
}

.appointment-info,
.payment-records {
    margin-top: 20px;
}

.appointment-info h3,
.payment-records h3 {
    margin-bottom: 15px;
    font-weight: bold;
    color: #303133;
}

.study-records {
    margin-top: 20px;
}

.study-records h3,
.study-records h4 {
    margin-bottom: 15px;
    font-weight: bold;
    color: #303133;
}

.el-descriptions-item__content span {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.course-table {
    width: 100%;
}

.course-table :deep(.el-table__body) {
    width: 100%;
    table-layout: fixed;
}

.course-table :deep(.el-table__inner-wrapper) {
    overflow-x: auto;
}

.course-table :deep(.cell) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>