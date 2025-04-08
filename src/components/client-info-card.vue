<template>
    <el-dialog title="客户详细信息" v-model="visible" width="800px" destroy-on-close>
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
                <el-descriptions-item label="所属人/合作老师">{{ client.affiliatedUserName }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ client.createdTime }}</el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">{{ client.info }}</el-descriptions-item>
            </el-descriptions>

            <!-- 如果是已预约客户，显示预约信息 -->
            <div v-if="client.clientStatus === 4" class="appointment-info">
                <h3>预约信息</h3>
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="校区">{{ client.schoolName }}</el-descriptions-item>
                    <el-descriptions-item label="预约人">{{ client.appointerName }}</el-descriptions-item>
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

watch(() => props.modelValue, async (newVal) => {
    visible.value = newVal
    if (newVal && props.client.id) {
        await getPaymentRecords()
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

.el-descriptions-item__content span {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>