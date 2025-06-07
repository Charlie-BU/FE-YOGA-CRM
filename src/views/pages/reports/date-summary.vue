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
                :cell-style="{ textAlign: 'center' }"
                :header-cell-style="{
                    textAlign: 'center',
                    backgroundColor: '#f5f7fa',
                    color: '#606266',
                    fontWeight: 'bold'
                }"
            >
                <el-table-column label="日期" width="120" fixed show-overflow-tooltip>
                    <template #default="scope">
                        {{ scope.row.date }}
                    </template>
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
        new Date(new Date().setDate(new Date().getDate())).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-"),
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
        if (!startDate || !endDate) {
            ElMessage.warning("请选择时间范围");
            loading.value = false;
            return;
        }

        // 清空现有数据
        tableData.value = [];

        // 生成日期范围内的所有日期
        const dateList = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        while (start <= end) {
            dateList.push(start.toISOString().split("T")[0]);
            start.setDate(start.getDate() + 1);
        }

        // 逐个请求每一天的数据
        for (const date of dateList) {
            try {
                const res = await request.post(
                    "http://8.153.204.238:85/user/getDateSummaryDataPerDay",
                    { date },
                    {
                        headers: {
                            sessionid: localStorage.getItem("sessionid")
                        }
                    }
                );

                if (res.data.status === 200) {
                    // 将新数据添加到表格中
                    tableData.value.push(res.data.data);
                    // 按日期排序
                    tableData.value.sort((a, b) => new Date(a.date) - new Date(b.date));
                }
            } catch (error) {
                console.error(`获取 ${date} 数据失败:`, error);
            }
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
        timeRange: []
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
            "日期",
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
            "",
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
            "红推加",
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
            row.date,
            row.shanghaiCount || 0,
            row.beijingCount || 0,
            row.guangzhouCount || 0,
            row.chengduCount || 0,
            row.totalToClient || 0,
            row.totalDealed || 0,
            `${calculateRate(row.totalDealed, row.totalToClient)}%`,
            row.bwAdd || 0,
            row.bwSignup || 0,
            `${calculateRate(row.bwSignup, row.bwAdd)}%`,
            row.redAdd || 0,
            row.redSignup || 0,
            `${calculateRate(row.redSignup, row.redAdd)}%`,
            row.infoAdd || 0,
            row.infoSignup || 0,
            `${calculateRate(row.infoSignup, row.infoAdd)}%`,
            row.dpAdd || 0,
            row.dpSignup || 0,
            row.phoneAdd || 0,
            row.phoneSignup || 0,
            row.xhsAdd || 0,
            row.xhsSignup || 0,
            row.dyAdd || 0,
            row.dySignup || 0,
            row.referAdd || 0,
            row.referSignup || 0,
            row.selfAdd || 0,
            row.selfSignup || 0,
            row.mpAdd || 0,
            row.mpSignup || 0,
            row.videoAdd || 0,
            row.videoSignup || 0
        ];
    });

    // 合并表头和数据
    const exportData = [...headers, ...data];

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(exportData);

    // 设置列宽
    ws["!cols"] = Array(33).fill({ wch: 12 }); // 设置所有列宽为12个字符
    ws["!cols"][0] = { wch: 15 }; // 日期列宽设置为15个字符

    // 设置单元格合并
    ws["!merges"] = [
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

    // 设置单元格样式
    for (let i = 0; i < exportData.length; i++) {
        for (let j = 0; j < exportData[i].length; j++) {
            const cellRef = XLSX.utils.encode_cell({ r: i, c: j });
            if (!ws[cellRef]) ws[cellRef] = { v: "" };

            // 设置所有单元格居中对齐
            ws[cellRef].s = {
                alignment: { horizontal: "center", vertical: "center" },
                font: { name: "微软雅黑" }
            };

            // 表头加粗
            if (i < 2) {
                ws[cellRef].s.font.bold = true;
            }
        }
    }

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "日期数据汇总");

    // 获取时间范围作为文件名
    const [startDate, endDate] = queryParams.value.timeRange || [];
    const fileName = startDate && endDate ? `日期数据汇总_${startDate}_${endDate}.xlsx` : `日期数据汇总_${new Date().toISOString().split("T")[0]}.xlsx`;

    // 导出文件
    XLSX.writeFile(wb, fileName);
};

onMounted(() => {
    // handleQuery();
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
