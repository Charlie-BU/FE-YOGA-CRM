<template>
    <el-dialog title="客户信息卡" v-model="visible" width="1200px" destroy-on-close>
        <div class="client-info-card">
            <!-- 添加进度条 -->
            <div class="progress-container">
                <el-steps :active="getStatusStep" finish-status="success" align-center>
                    <el-step title="未分配" />
                    <el-step title="已分配" />
                    <el-step title="已转客户" />
                    <el-step title="已预约到店" />
                    <el-step title="已成单" />
                    <el-step title="已毕业" />
                </el-steps>
            </div>

            <el-descriptions :column="2" border>
                <el-descriptions-item label="姓名">{{ client.name }}</el-descriptions-item>
                <el-descriptions-item label="渠道来源">{{ conventions.getFromSource(client.fromSource) }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ conventions.getGender(client.gender) }}</el-descriptions-item>
                <el-descriptions-item label="年龄">{{ client.age }}</el-descriptions-item>
                <el-descriptions-item label="身份证">{{ client.IDNumber }}</el-descriptions-item>
                <el-descriptions-item label="电话">{{ client.phone }}</el-descriptions-item>
                <el-descriptions-item label="微信">{{ client.weixin }}</el-descriptions-item>
                <el-descriptions-item label="QQ">{{ client.QQ }}</el-descriptions-item>
                <el-descriptions-item label="抖音">{{ client.douyin }}</el-descriptions-item>
                <el-descriptions-item label="小红书">{{ client.rednote }}</el-descriptions-item>
                <el-descriptions-item label="商务通">{{ client.shangwutong }}</el-descriptions-item>
                <el-descriptions-item label="地区">{{ client.address }}</el-descriptions-item>
                <el-descriptions-item label="客户状态">
                    <span class="status-highlight">{{ conventions.getClientStatus(client.clientStatus) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="所属人 / 合作老师">{{ client.affiliatedUserName }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ client.createdTime }}</el-descriptions-item>
                <el-descriptions-item label="客户备注" :span="2">{{ client?.info?.join(" | ") }}</el-descriptions-item>
            </el-descriptions>

            <!-- 如果是已预约客户，显示预约信息 -->
            <div v-if="client.clientStatus === 4" class="appointment-info">
                <h3>预约信息</h3>
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="校区">{{ client.schoolName }}</el-descriptions-item>
                    <el-descriptions-item label="接待人">{{ client.appointerName }}</el-descriptions-item>
                    <el-descriptions-item v-if="client.comboId" label="套餐">{{ client.comboName }}</el-descriptions-item>
                    <el-descriptions-item label="课程">{{ client.courseNames }}</el-descriptions-item>
                    <el-descriptions-item label="预约日期">{{ client.appointDate }}</el-descriptions-item>
                    <el-descriptions-item label="下次沟通日期">{{ client.nextTalkDate }}</el-descriptions-item>
                    <el-descriptions-item label="跟进状态">
                        <span class="status-highlight">{{ client.processStatus === 1 ? "未成单" : client.processStatus === 2 ? "已成单" : "" }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="成单时间">{{ client.cooperateTime }}</el-descriptions-item>
                    <el-descriptions-item label="合同">
                        <template v-if="client.contractUrl">
                            <a :href="client.contractUrl" target="_blank" class="contract-link">
                                {{ utils.getFileNameFromOssUrl(client.contractUrl) }}
                            </a>
                        </template>
                        <template v-else>-</template>
                    </el-descriptions-item>
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
                            {{ scope.row.category === 1 ? "定金" : scope.row.category === 2 ? "尾款" : "其他" }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="teacherName" label="负责老师" align="center" />
                    <el-table-column prop="paymentDate" label="交易时间" align="center">
                        <template #default="scope">
                            <el-tooltip :content="scope.row.paymentDate" placement="top" effect="dark">
                                <span>{{ scope.row.paymentDate }}</span>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column prop="info" label="客户备注" align="center" />
                </el-table>
            </div>

            <!-- 如果已成单，显示学习记录 -->
            <div v-if="client.processStatus === 2" class="study-records">
                <h3>学习记录</h3>
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="校区">{{ client.schoolName }}</el-descriptions-item>
                    <el-descriptions-item label="已学课时（周）">{{ client.learnedWeeks }}</el-descriptions-item>
                    <el-descriptions-item v-if="client.comboId" label="学习套餐">{{ client.comboName }}</el-descriptions-item>
                    <el-descriptions-item label="已学课程">{{ finishedCourseNames }}</el-descriptions-item>
                    <el-descriptions-item label="在学课程">{{ ongoingCourseNames }}</el-descriptions-item>
                    <el-descriptions-item label="未学课程">{{ notStartedCourseNames }}</el-descriptions-item>
                </el-descriptions>

                <h3 style="margin: 20px 0 15px">分班信息</h3>
                <el-table :data="lessonRecords" style="width: 100%" class="course-table">
                    <el-table-column prop="name" label="班级名称" align="center" width="180" show-overflow-tooltip />
                    <el-table-column prop="courseName" label="课程名称" align="center" min-width="120" show-overflow-tooltip />
                    <el-table-column prop="category" label="类别" align="center" min-width="100" show-overflow-tooltip>
                        <template #default="scope">
                            {{ conventions.getCourseCategory(scope.row.category) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="schoolName" label="校区" align="center" min-width="120" show-overflow-tooltip />
                    <el-table-column prop="startDate" label="开课日期" width="150" align="center" min-width="100" show-overflow-tooltip />
                    <el-table-column prop="endDate" label="结课日期" width="150" align="center" min-width="100" show-overflow-tooltip />

                    <el-table-column prop="chiefTeacherName" label="主讲人" align="center" min-width="100" show-overflow-tooltip />
                    <el-table-column prop="classTeacherName" label="班主任" align="center" min-width="100" show-overflow-tooltip />
                    <el-table-column prop="teachingAssistantName" label="助教" align="center" min-width="100" show-overflow-tooltip />
                    <el-table-column prop="info" label="班级备注" align="center" min-width="150" show-overflow-tooltip />
                </el-table>
            </div>

            <!-- 如果有住宿信息，显示宿舍信息 -->
            <div v-if="client.bedId" class="dorm-info">
                <h3>住宿信息</h3>
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="公寓名">{{ dormInfo.name }}</el-descriptions-item>
                    <el-descriptions-item label="类型">{{ conventions.getDormitoryCategory(dormInfo.category) }}</el-descriptions-item>
                    <el-descriptions-item label="房间号 / 户号">{{ roomInfo.roomNumber }}</el-descriptions-item>
                    <el-descriptions-item label="楼栋">{{ roomInfo.building }}</el-descriptions-item>
                    <el-descriptions-item label="床位号">{{ bedInfo.bedNumber }}</el-descriptions-item>
                    <el-descriptions-item label="床位类型">{{ conventions.getBedCategory(bedInfo.category) }}</el-descriptions-item>
                    <el-descriptions-item label="入住时间">{{ client.bedCheckInDate }}</el-descriptions-item>
                    <el-descriptions-item label="状态" :span="2">
                        <span :style="{ color: isOverdue ? '#ff4949' : '#93ff40' }">
                            {{ isOverdue ? "已超期" + overdueDays + "天" : "正常" }}
                        </span>
                    </el-descriptions-item>
                </el-descriptions>
            </div>

            <!-- 添加客户日志展示区域 -->
            <div class="client-logs">
                <h3>客户操作日志</h3>
                <el-table :data="clientLogs" style="width: 100%">
                    <el-table-column prop="operation" label="日志内容" align="center" show-overflow-tooltip />
                    <el-table-column prop="time" label="时间" align="center" width="180">
                        <template #default="scope">
                            <el-tooltip :content="scope.row.time" placement="top" effect="dark">
                                <span>{{ scope.row.time }}</span>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column prop="operatorName" label="操作人" align="center" width="120" />
                </el-table>

                <!-- 添加分页控件 -->
                <div class="pagination-container">
                    <el-pagination
                        v-model:current-page="currentPage"
                        v-model:page-size="pageSize"
                        :page-sizes="[10, 20, 30, 50]"
                        :total="total"
                        layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                    />
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import * as conventions from "@/utils/conventions";
import request from "@/utils/request";
import { ElMessage } from "element-plus";
import * as utils from "@/utils/index";

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    clientId: {
        type: Number,
        required: true
    }
});

const client = ref<any>({});

const emit = defineEmits(["update:modelValue"]);

const visible = ref(false);
const paymentRecords = ref([]);
const lessonRecords = ref([]);
const clientLogs = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

watch(
    () => props.modelValue,
    async (newVal) => {
        visible.value = newVal;
        if (newVal && props.clientId) {
            await getClientInfo();
            await Promise.all([getStudentCourses(), getPaymentRecords(), getLessonRecords(), getDormInfo(), getClientLogs()]);
        }
    }
);

watch(
    () => visible.value,
    (val) => {
        emit("update:modelValue", val);
    }
);

const getClientInfo = async () => {
    try {
        const res = await request.post(
            "/extra/getClientById",
            {
                clientId: props.clientId
            },
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );
        if (res.data.status === 200) {
            client.value = res.data.client;
            if (client.value.info) client.value.info = client.value.info.reverse();
        } else if (res.data.status === -2) {
            ElMessage.error(res.data.message);
            client.value = {};
            paymentRecords.value = [];
            lessonRecords.value = [];
            clientLogs.value = [];
            visible.value = false;
            return;
        } else {
            ElMessage.error("获取客户信息失败");
            return;
        }
    } catch (error) {
        console.error("获取客户信息失败:", error);
        ElMessage.error("获取客户信息失败");
    }
};

const finishedCourseNames = ref("");
const ongoingCourseNames = ref("");
const notStartedCourseNames = ref("");

const getStudentCourses = async () => {
    try {
        const res = await request.post(
            "/course/getStudentCourses",
            {
                stuId: props.clientId
            },
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );

        if (res.data.status === 200) {
            finishedCourseNames.value = res.data.finishedCourseNames || "";
            ongoingCourseNames.value = res.data.ongoingCourseNames || "";
            notStartedCourseNames.value = res.data.notStartedCourseNames || "";
        } else {
            finishedCourseNames.value = ongoingCourseNames.value = notStartedCourseNames.value = "";
        }
    } catch (error) {
        console.error("获取交易记录失败:", error);
        ElMessage.error("获取交易记录失败");
    }
};

const getPaymentRecords = async () => {
    try {
        const res = await request.post(
            "/extra/getClientPayments",
            {
                clientId: props.clientId
            },
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );

        if (res.data.status === 200) {
            paymentRecords.value = res.data.payments || [];
        } else {
            paymentRecords.value = [];
        }
    } catch (error) {
        console.error("获取交易记录失败:", error);
        ElMessage.error("获取交易记录失败");
    }
};

// 获取班级信息
const getLessonRecords = async () => {
    try {
        const lessonIds = client.value.lessonIds;
        const res = await request.post(
            "/course/getLessonsByIds",
            {
                lessonIds
            },
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );

        if (res.data.status === 200) {
            lessonRecords.value = res.data.courses || [];
        } else {
            lessonRecords.value = [];
        }
    } catch (error) {
        console.error("获取班级信息失败:", error);
        ElMessage.error("获取班级信息失败");
    }
};

const dormInfo = <any>ref({});
const roomInfo = <any>ref({});
const bedInfo = <any>ref({});

const isOverdue = ref(false);
const overdueDays = ref(0);

// 获取住宿信息
const getDormInfo = async () => {
    if (!client.value.bedId) return;

    try {
        const res = await request.post(
            "/dorm/getDormInfoByBedId",
            {
                bedId: client.value.bedId
            },
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );

        if (res.data.status === 200) {
            dormInfo.value = res.data.dorm;
            roomInfo.value = res.data.room;
            bedInfo.value = res.data.bed;

            // 计算是否超期
            if (client.value.bedCheckInDate && bedInfo.value.duration) {
                const checkInDate = new Date(client.value.bedCheckInDate);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - checkInDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const durationDays = bedInfo.value.duration * 7;

                isOverdue.value = diffDays > durationDays;
                if (isOverdue.value) {
                    overdueDays.value = diffDays - durationDays;
                }
            }
        }
    } catch (error) {
        console.error("获取住宿信息失败:", error);
        ElMessage.error("获取住宿信息失败");
    }
};

// 添加状态步骤计算属性
const getStatusStep = computed(() => {
    const statusMap = {
        1: 1, // 未分配
        2: 2, // 已分配
        3: 3, // 已转客户
        4: 4, // 已预约到店
        5: 5, // 已成单
        6: 6 // 已毕业
    };
    const clientStatus = client.value.clientStatus;
    const processStatus = client.value.processStatus;
    if (processStatus === 1) {
        return statusMap[clientStatus];
    } else if (processStatus === 2) {
        // 毕业
        if (clientStatus === 5) {
            return statusMap[6];
        }
        // 未毕业，返回已成单
        return statusMap[5];
    }
    return 0;
});

const getClientLogs = async () => {
    try {
        const res = await request.post(
            "/extra/getClientLogs",
            {
                clientId: props.clientId,
                pageIndex: currentPage.value,
                pageSize: pageSize.value
            },
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );

        if (res.data.status === 200) {
            clientLogs.value = res.data.logs || [];
            total.value = res.data.total || 0;
        } else {
            clientLogs.value = [];
            total.value = 0;
        }
    } catch (error) {
        console.error("获取日志失败:", error);
        ElMessage.error("获取日志失败");
    }
};

const handleCurrentChange = (val: number) => {
    currentPage.value = val;
    getClientLogs();
};

const handleSizeChange = (val: number) => {
    pageSize.value = val;
    currentPage.value = 1;
    getClientLogs();
};
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

.dorm-info,
.study-records {
    margin-top: 20px;
}

.dorm-info h3,
.study-records h3,
.study-records h4 {
    margin-bottom: 15px;
    font-weight: bold;
    color: #303133;
}

.client-logs {
    margin-top: 20px;
}

.client-logs h3 {
    margin-bottom: 15px;
    font-weight: bold;
    color: #303133;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: left;
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

.status-highlight {
    font-weight: bold;
    color: #93ff40;
}

.progress-container {
    margin-bottom: 30px;
    padding: 20px 40px;
    background-color: #f5f7fa;
    border-radius: 8px;
}

:deep(.el-step__title) {
    font-size: 14px !important;
}

:deep(.el-step__head.is-success) {
    color: #67c23a;
    border-color: #67c23a;
}

:deep(.el-step__title.is-success) {
    color: #67c23a;
}

:deep(.el-step__head.is-process) {
    color: #409eff;
    border-color: #409eff;
}

:deep(.el-step__title.is-process) {
    color: #409eff;
}

.contract-link {
    color: #409eff;
    text-decoration: none;
    cursor: pointer;
}

.contract-link:hover {
    text-decoration: underline;
}
</style>
