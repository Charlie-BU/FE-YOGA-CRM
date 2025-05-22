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
                                <el-date-picker
                                    v-model="queryParams.timeRange"
                                    type="daterange"
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期"
                                    value-format="YYYY-MM-DD"
                                    style="width: 100%"
                                />
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

            <el-table
                ref="tableRef"
                :data="tableData"
                style="width: 100%"
                border
                v-loading="loading"
                :cell-style="{ textAlign: 'center' }"
                :header-cell-style="{
                    textAlign: 'center',
                    backgroundColor: '#f5f7fa',
                    color: '#606266',
                    fontWeight: 'bold'
                }"
            >
                <el-table-column label="客服信息" width="120" fixed show-overflow-tooltip>
                    <template #default="scope"> {{ scope.row.schoolName.slice(0, 2) }}-{{ scope.row.username }} </template>
                </el-table-column>

                <!-- 城市报名数据 -->
                <el-table-column label="报名城市数据">
                    <el-table-column prop="shanghaiCount" label="报上海" align="center" show-overflow-tooltip />
                    <el-table-column prop="beijingCount" label="报北京" align="center" show-overflow-tooltip />
                    <el-table-column prop="guangzhouCount" label="报广州" align="center" show-overflow-tooltip />
                    <el-table-column prop="chengduCount" label="报成都" align="center" show-overflow-tooltip />
                </el-table-column>

                <!-- 总体数据 -->
                <el-table-column label="总体数据">
                    <el-table-column prop="totalToClient" label="总转客户" align="center" show-overflow-tooltip />
                    <el-table-column prop="totalDealed" label="总报名" align="center" show-overflow-tooltip />
                    <el-table-column prop="totalConversion" label="总转化率" align="center" show-overflow-tooltip>
                        <template #default="scope"> {{ calculateRate(scope.row.totalDealed, scope.row.totalToClient) }}% </template>
                    </el-table-column>
                </el-table-column>

                <!-- 商务通数据 -->
                <el-table-column label="商务通数据">
                    <el-table-column prop="bwAdd" label="商务通加" align="center" show-overflow-tooltip />
                    <el-table-column prop="bwSignup" label="商务通报" align="center" show-overflow-tooltip />
                    <el-table-column prop="bwConversion" label="商转化率" align="center show-overflow-tooltip">
                        <template #default="scope"> {{ calculateRate(scope.row.bwSignup, scope.row.bwAdd) }}% </template>
                    </el-table-column>
                </el-table-column>

                <!-- 红推数据 -->
                <el-table-column label="红推数据">
                    <el-table-column prop="redAdd" label="红推" align="center" show-overflow-tooltip />
                    <el-table-column prop="redSignup" label="红推报" align="center" show-overflow-tooltip />
                    <el-table-column prop="redConversion" label="红推转化率" align="center" show-overflow-tooltip>
                        <template #default="scope"> {{ calculateRate(scope.row.redSignup, scope.row.redAdd) }}% </template>
                    </el-table-column>
                </el-table-column>

                <!-- 信息流数据 -->
                <el-table-column label="信息流数据">
                    <el-table-column prop="infoAdd" label="信息流加" align="center" show-overflow-tooltip />
                    <el-table-column prop="infoSignup" label="信息流报" align="center" show-overflow-tooltip />
                    <el-table-column prop="infoConversion" label="信转化率" align="center" show-overflow-tooltip>
                        <template #default="scope"> {{ calculateRate(scope.row.infoSignup, scope.row.infoAdd) }}% </template>
                    </el-table-column>
                </el-table-column>

                <!-- 点评数据 -->
                <el-table-column label="点评数据">
                    <el-table-column prop="dpAdd" label="点评加" align="center" show-overflow-tooltip />
                    <el-table-column prop="dpSignup" label="点评报" align="center" show-overflow-tooltip />
                </el-table-column>

                <!-- 电话数据 -->
                <el-table-column label="电话数据">
                    <el-table-column prop="phoneAdd" label="电话加" align="center" show-overflow-tooltip />
                    <el-table-column prop="phoneSignup" label="电话报" align="center" show-overflow-tooltip />
                </el-table-column>

                <!-- 小红书数据 -->
                <el-table-column label="小红书数据">
                    <el-table-column prop="xhsAdd" label="小红书加" align="center" show-overflow-tooltip />
                    <el-table-column prop="xhsSignup" label="小红书报" align="center" show-overflow-tooltip />
                </el-table-column>

                <!-- 抖音数据 -->
                <el-table-column label="抖音数据">
                    <el-table-column prop="dyAdd" label="抖音加" align="center" show-overflow-tooltip />
                    <el-table-column prop="dySignup" label="抖音报" align="center" show-overflow-tooltip />
                </el-table-column>

                <!-- 推荐/介绍数据 -->
                <el-table-column label="推荐/介绍数据">
                    <el-table-column prop="referAdd" label="推荐/介绍加" align="center" show-overflow-tooltip />
                    <el-table-column prop="referSignup" label="推荐/介绍报" align="center" show-overflow-tooltip />
                </el-table-column>

                <!-- 自己进店数据 -->
                <el-table-column label="自己进店数据">
                    <el-table-column prop="selfAdd" label="自己进店加" align="center" show-overflow-tooltip />
                    <el-table-column prop="selfSignup" label="自己进店报" align="center" show-overflow-tooltip />
                </el-table-column>

                <!-- 公众号数据 -->
                <el-table-column label="公众号数据">
                    <el-table-column prop="mpAdd" label="公众号加" align="center" show-overflow-tooltip />
                    <el-table-column prop="mpSignup" label="公众号报" align="center" show-overflow-tooltip />
                </el-table-column>

                <!-- 视频号数据 -->
                <el-table-column label="视频号数据">
                    <el-table-column prop="videoAdd" label="视频号加" align="center" show-overflow-tooltip />
                    <el-table-column prop="videoSignup" label="视频号报" align="center" show-overflow-tooltip />
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Search, Download } from "@element-plus/icons-vue";
import request from "@/utils/request";
import { ElMessage } from "element-plus";
import * as XLSX from "xlsx";

const loading = ref(false);
const filterDialogVisible = ref(false);
const tableData = ref([]);
const queryParams = ref({
    timeRange: [
        new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-"),
        new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")
    ]
});

// 计算转化率
const calculateRate = (numerator, denominator) => {
    if (!denominator) return 0;
    return ((numerator / denominator) * 100).toFixed(2);
};

// 查询数据
const handleQuery = async () => {
    loading.value = true;
    try {
        const [startDate, endDate] = queryParams.value.timeRange || [];
        const params = {
            startDate,
            endDate
        };
        const res = await request.post("/user/getCustomerServiceSummaryData", params, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });
        if (res.data.status === 200) {
            tableData.value = res.data.allData;
        } else {
            console.error("查询数据失败:", res.data.message);
            ElMessage.error("查询数据失败");
        }
    } catch (error) {
        console.error("查询数据失败:", error);
        ElMessage.error("查询数据失败");
    } finally {
        loading.value = false;
        filterDialogVisible.value = false;
    }
};

// 重置查询
const resetQuery = () => {
    queryParams.value = {
        timeRange: [
            new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-"),
            new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")
        ]
    };
};

// 显示筛选弹窗
const showFilterDialog = () => {
    filterDialogVisible.value = true;
};

// 导出数据
const handleExport = () => {
    // 检查是否有数据
    if (!tableData.value || tableData.value.length === 0) {
        ElMessage.warning("暂无数据可导出");
        return;
    }

    // 定义表头
    const headers = [
        [
            "客服信息",
            "报名城市数据",
            "",
            "",
            "",
            "总体数据",
            "",
            "",
            "商务通数据",
            "",
            "",
            "红推数据",
            "",
            "",
            "信息流数据",
            "",
            "",
            "点评数据",
            "",
            "电话数据",
            "",
            "小红书数据",
            "",
            "抖音数据",
            "",
            "推荐/介绍数据",
            "",
            "自己进店数据",
            "",
            "公众号数据",
            "",
            "视频号数据",
            ""
        ],
        [
            "客服",
            "报上海",
            "报北京",
            "报广州",
            "报成都",
            "总转客户",
            "总报名",
            "总转化率",
            "商务通加",
            "商务通报",
            "商转化率",
            "红推",
            "红推报",
            "红推转化率",
            "信息流加",
            "信息流报",
            "信转化率",
            "点评加",
            "点评报",
            "电话加",
            "电话报",
            "小红书加",
            "小红书报",
            "抖音加",
            "抖音报",
            "推荐/介绍加",
            "推荐/介绍报",
            "自己进店加",
            "自己进店报",
            "公众号加",
            "公众号报",
            "视频号加",
            "视频号报"
        ]
    ];

    // 处理数据
    const data = tableData.value.map((row) => {
        return [
            `${row.schoolName.slice(0, 2)}-${row.username}`,
            row.shanghaiCount,
            row.beijingCount,
            row.guangzhouCount,
            row.chengduCount,
            row.totalToClient,
            row.totalDealed,
            `${calculateRate(row.totalDealed, row.totalToClient)}%`,
            row.bwAdd,
            row.bwSignup,
            `${calculateRate(row.bwSignup, row.bwAdd)}%`,
            row.redAdd,
            row.redSignup,
            `${calculateRate(row.redSignup, row.redAdd)}%`,
            row.infoAdd,
            row.infoSignup,
            `${calculateRate(row.infoSignup, row.infoAdd)}%`,
            row.dpAdd,
            row.dpSignup,
            row.phoneAdd,
            row.phoneSignup,
            row.xhsAdd,
            row.xhsSignup,
            row.dyAdd,
            row.dySignup,
            row.referAdd,
            row.referSignup,
            row.selfAdd,
            row.selfSignup,
            row.mpAdd,
            row.mpSignup,
            row.videoAdd,
            row.videoSignup
        ];
    });

    // 合并表头和数据
    const exportData = [...headers, ...data];

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(exportData);

    // 设置单元格合并
    ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // 客服信息
        { s: { r: 0, c: 1 }, e: { r: 0, c: 4 } }, // 报名城市数据
        { s: { r: 0, c: 5 }, e: { r: 0, c: 7 } }, // 总体数据
        { s: { r: 0, c: 8 }, e: { r: 0, c: 10 } }, // 商务通数据
        { s: { r: 0, c: 11 }, e: { r: 0, c: 13 } }, // 红推数据
        { s: { r: 0, c: 14 }, e: { r: 0, c: 16 } }, // 信息流数据
        { s: { r: 0, c: 17 }, e: { r: 0, c: 18 } }, // 点评数据
        { s: { r: 0, c: 19 }, e: { r: 0, c: 20 } }, // 电话数据
        { s: { r: 0, c: 21 }, e: { r: 0, c: 22 } }, // 小红书数据
        { s: { r: 0, c: 23 }, e: { r: 0, c: 24 } }, // 抖音数据
        { s: { r: 0, c: 25 }, e: { r: 0, c: 26 } }, // 推荐/介绍数据
        { s: { r: 0, c: 27 }, e: { r: 0, c: 28 } }, // 自己进店数据
        { s: { r: 0, c: 29 }, e: { r: 0, c: 30 } }, // 公众号数据
        { s: { r: 0, c: 31 }, e: { r: 0, c: 32 } } // 视频号数据
    ];

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "客服数据汇总");

    // 获取时间范围和当前日期作为文件名
    const [startDate, endDate] = queryParams.value.timeRange || [];
    const date = new Date();
    const currentDate = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;

    // 构建文件名
    let fileName = `客服数据汇总_全部`;
    if (startDate && endDate) {
        fileName = `客服数据汇总_${startDate}_${endDate}`;
    }
    fileName += ".xlsx";

    // 导出文件
    XLSX.writeFile(wb, fileName);
};

onMounted(() => {
    handleQuery();
});
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
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
}

/* 添加横向滚动容器样式 */
.container {
    padding: 20px;
    overflow-x: auto;
    overflow-y: hidden;
}
</style>
