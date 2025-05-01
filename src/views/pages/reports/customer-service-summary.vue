<template>
    <div>
        <div class="container">
            <div class="toolbar">
                <el-button type="primary" :icon="Search" @click="showFilterDialog">筛选查询</el-button>
                <el-button type="warning" :icon="Download" @click="handleExport">导出</el-button>
            </div>

            <el-dialog title="筛选条件" v-model="filterDialogVisible" width="800px" :close-on-click-modal="false">
                <el-form :model="queryParams" label-width="100px">
                    <el-row :gutter="20">
                        <el-col :span="24">
                            <el-form-item label="汇总时间">
                                <el-date-picker v-model="queryParams.timeRange" type="daterange" range-separator="至"
                                    start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
                                    style="width: 100%" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="resetQuery">重置</el-button>
                        <el-button type="primary" @click="handleQuery">查询</el-button>
                    </div>
                </template>
            </el-dialog>

            <el-table ref="tableRef" :data="tableData" style="width: 100%" border v-loading="loading"
                :cell-style="{ textAlign: 'center' }" :header-cell-style="{
                    textAlign: 'center',
                    backgroundColor: '#f5f7fa',
                    color: '#606266',
                    fontWeight: 'bold'
                }">
                <el-table-column label="客服信息" fixed>
                    <template #default="scope">
                        {{ scope.row.schoolName }} - {{ scope.row.username }}
                    </template>
                </el-table-column>

                <!-- 城市报名数据 -->
                <el-table-column label="报名城市数据">
                    <el-table-column prop="shanghaiCount" label="报上海" align="center" />
                    <el-table-column prop="beijingCount" label="报北京" align="center" />
                    <el-table-column prop="guangzhouCount" label="报广州" align="center" />
                    <el-table-column prop="chengduCount" label="报成都" align="center" />
                </el-table-column>

                <!-- 总体数据 -->
                <el-table-column label="总体数据">
                    <el-table-column prop="totalWechat" label="总加微信" align="center" />
                    <el-table-column prop="totalSignup" label="总报名" align="center" />
                    <el-table-column prop="totalConversion" label="总转化率" align="center">
                        <template #default="scope">
                            {{ calculateRate(scope.row.totalSignup, scope.row.totalWechat) }}%
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- 商务通数据 -->
                <el-table-column label="商务通数据">
                    <el-table-column prop="bwAdd" label="商务通加" align="center" />
                    <el-table-column prop="bwSignup" label="商务通报" align="center" />
                    <el-table-column prop="bwConversion" label="商转化率" align="center">
                        <template #default="scope">
                            {{ calculateRate(scope.row.bwSignup, scope.row.bwAdd) }}%
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- 红推数据 -->
                <el-table-column label="红推数据">
                    <el-table-column prop="redAdd" label="红推" align="center" />
                    <el-table-column prop="redSignup" label="红推报" align="center" />
                    <el-table-column prop="redConversion" label="红推转化率" align="center">
                        <template #default="scope">
                            {{ calculateRate(scope.row.redSignup, scope.row.redAdd) }}%
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- 信息流数据 -->
                <el-table-column label="信息流数据">
                    <el-table-column prop="infoAdd" label="信息流加" align="center" />
                    <el-table-column prop="infoSignup" label="信息流报" align="center" />
                    <el-table-column prop="infoConversion" label="信转化率" align="center">
                        <template #default="scope">
                            {{ calculateRate(scope.row.infoSignup, scope.row.infoAdd) }}%
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- 点评数据 -->
                <el-table-column label="点评数据">
                    <el-table-column prop="dpAdd" label="点评加" align="center" />
                    <el-table-column prop="dpSignup" label="点评报" align="center" />
                </el-table-column>

                <!-- 电话数据 -->
                <el-table-column label="电话数据">
                    <el-table-column prop="phoneAdd" label="电话加" align="center" />
                    <el-table-column prop="phoneSignup" label="电话报" align="center" />
                </el-table-column>

                <!-- 小红书数据 -->
                <el-table-column label="小红书数据">
                    <el-table-column prop="xhsAdd" label="小红书加" align="center" />
                    <el-table-column prop="xhsSignup" label="小红书报" align="center" />
                </el-table-column>

                <!-- 抖音数据 -->
                <el-table-column label="抖音数据">
                    <el-table-column prop="dyAdd" label="抖音加" align="center" />
                    <el-table-column prop="dySignup" label="抖音报" align="center" />
                </el-table-column>

                <!-- 推荐/介绍数据 -->
                <el-table-column label="推荐/介绍数据">
                    <el-table-column prop="referAdd" label="推荐/介绍加" align="center" />
                    <el-table-column prop="referSignup" label="推荐/介绍报" align="center" />
                </el-table-column>

                <!-- 自己进店数据 -->
                <el-table-column label="自己进店数据">
                    <el-table-column prop="selfAdd" label="自己进店加" align="center" />
                    <el-table-column prop="selfSignup" label="自己进店报" align="center" />
                </el-table-column>

                <!-- 公众号数据 -->
                <el-table-column label="公众号数据">
                    <el-table-column prop="mpAdd" label="公众号加" align="center" />
                    <el-table-column prop="mpSignup" label="公众号报" align="center" />
                </el-table-column>

                <!-- 视频号数据 -->
                <el-table-column label="视频号数据">
                    <el-table-column prop="videoAdd" label="视频号" align="center" />
                    <el-table-column prop="videoAdd2" label="视频号2" align="center" />
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Download } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const filterDialogVisible = ref(false)
const tableData = ref([])
const queryParams = ref({
    timeRange: [],
})


// 计算转化率
const calculateRate = (numerator, denominator) => {
    if (!denominator) return 0
    return ((numerator / denominator) * 100).toFixed(2)
}

// 查询数据
const handleQuery = async () => {
    loading.value = true;
    try {
        const [startDate, endDate] = queryParams.value.timeRange || [];
        const params = {
            startDate,
            endDate,
        };
        const res = await request.post("/user/getCustomerServiceSummaryData", params, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });
        if (res.data.status === 200) {
            tableData.value = res.data.allData;
        } else {
            console.error('查询数据失败:', res.data.message);
            ElMessage.error('查询数据失败');
        }
    } catch (error) {
        console.error('查询数据失败:', error);
        ElMessage.error('查询数据失败');
    } finally {
        loading.value = false;
        filterDialogVisible.value = false;
    }
};

// 重置查询
const resetQuery = () => {
    queryParams.value = {
        timeRange: [],
    }
}

// 显示筛选弹窗
const showFilterDialog = () => {
    filterDialogVisible.value = true
}

// 导出数据
const handleExport = () => {
    // 实现导出逻辑
}

onMounted(() => {
    handleQuery()
})
</script>

<style scoped>
.container {
    padding: 20px;
}

.toolbar {
    margin-bottom: 20px;
}

.dialog-footer {
    text-align: right;
}
</style>

<style>
/* 添加全局样式 */
.el-table .cell {
    white-space: nowrap !important;
    text-align: center !important;
    padding: 0 8px !important;
    /* 添加水平内边距 */
}

.el-table th.el-table__cell {
    background-color: #f5f7fa !important;
    color: #606266 !important;
    font-weight: bold !important;
}

.el-table td.el-table__cell {
    padding: 8px 0 !important;
}

/* 移除最小宽度限制，让单元格宽度自适应内容 */
.el-table .el-table__cell {
    min-width: auto !important;
}

/* 设置表格自动布局，优化列宽分配 */
.el-table {
    table-layout: auto !important;
    width: fit-content !important;
    min-width: 100% !important;
}

/* 确保固定列的样式 */
.el-table .el-table__fixed-right-patch {
    background-color: #f5f7fa;
}

/* 确保固定列的阴影效果 */
.el-table--border .el-table__fixed-right {
    box-shadow: -2px 0 8px rgba(0, 0, 0, .15);
}

/* 添加横向滚动容器样式 */
.container {
    padding: 20px;
    overflow-x: auto;
    overflow-y: hidden;
}
</style>