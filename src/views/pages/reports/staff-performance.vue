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
                        <el-col :span="12">
                            <el-form-item width="120" label="所属校区">
                                <el-select v-model="queryParams.schoolId" placeholder="请选择校区" style="width: 100%" clearable>
                                    <el-option v-for="item in schoolOptions" :key="item.value" :label="item.label" :value="item.value" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item width="120" label="汇总时间">
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
                <el-table-column prop="schoolName" width="120" label="校区" align="center" show-overflow-tooltip />
                <el-table-column prop="signDate" width="120" label="报名日期" align="center" show-overflow-tooltip />
                <el-table-column prop="cardType" width="120" label="卡种类" align="center" show-overflow-tooltip />
                <el-table-column prop="customerName" width="120" label="客户姓名" align="center" show-overflow-tooltip />
                <el-table-column prop="teacher" width="120" label="老师" align="center" show-overflow-tooltip />
                <el-table-column prop="mainTeacher" width="120" label="主讲老师" align="center" show-overflow-tooltip />
                <el-table-column prop="area" width="120" label="区域" align="center" show-overflow-tooltip />
                <el-table-column prop="channel" width="120" label="渠道" align="center" :formatter="(row) => conventions.getFromSource(row.channel)" show-overflow-tooltip />
                <el-table-column prop="wechat" width="80" label="微信" align="center" show-overflow-tooltip />
                <el-table-column prop="alipay" width="80" label="支付宝" align="center" show-overflow-tooltip />
                <el-table-column prop="posAccount" width="80" label="POS账户" align="center" show-overflow-tooltip />
                <el-table-column prop="toCompany" width="80" label="对公" align="center" show-overflow-tooltip />
                <el-table-column prop="cash" width="80" label="现金" align="center" show-overflow-tooltip />
                <el-table-column prop="bankCard" width="80" label="银行卡" align="center" show-overflow-tooltip />
                <el-table-column prop="remarks" width="120" label="备注" align="center" show-overflow-tooltip />
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Search, Download } from "@element-plus/icons-vue";
import request from "@/utils/request";
import { ElMessage } from "element-plus";
import * as conventions from "@/utils/conventions";
import * as XLSX from "xlsx";

const loading = ref(false);
const filterDialogVisible = ref(false);
const tableData = ref([]);
const queryParams = ref({
    timeRange: [
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-"),
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")
    ],
    schoolId: "" // 添加校区ID字段
});

const schoolOptions = ref([]); // 添加校区选项数组

// 查询数据
const handleQuery = async () => {
    loading.value = true;
    try {
        const [startDate, endDate] = queryParams.value.timeRange || [];
        const params = {
            startDate,
            endDate,
            schoolId: queryParams.value.schoolId
        };
        const res = await request.post("/user/getStuffPerformanceByClient", params, {
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
        timeRange: []
    };
};

// 显示筛选弹窗
const showFilterDialog = () => {
    getSchools();
    filterDialogVisible.value = true;
};

// 导出数据
const handleExport = () => {
    if (!tableData.value || tableData.value.length === 0) {
        ElMessage.warning("暂无数据可导出");
        return;
    }

    // 定义表头
    const headers = [
        { title: "校区", dataIndex: "schoolName" },
        { title: "报名日期", dataIndex: "signDate" },
        { title: "卡种类", dataIndex: "cardType" },
        { title: "客户名称", dataIndex: "customerName" },
        { title: "老师", dataIndex: "teacher" },
        { title: "主讲老师", dataIndex: "mainTeacher" },
        { title: "区域", dataIndex: "area" },
        { title: "渠道", dataIndex: "channel" },
        { title: "微信", dataIndex: "wechat" },
        { title: "支付宝", dataIndex: "alipay" },
        { title: "POS账户", dataIndex: "posAccount" },
        { title: "烁伽对公", dataIndex: "toCompany" },
        { title: "现金", dataIndex: "cash" },
        { title: "银行卡", dataIndex: "bankCard" },
        { title: "备注", dataIndex: "remarks" }
    ];

    // 准备导出数据
    const exportData = tableData.value.map((row) => {
        const data = {};
        headers.forEach((header) => {
            if (header.render) {
                data[header.title] = header.render(row);
            } else {
                data[header.title] = row[header.dataIndex];
            }
        });
        return data;
    });

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData, {
        header: headers.map((h) => h.title)
    });

    // 设置列宽
    const colWidth = headers.map(() => ({ wch: 15 }));
    ws["!cols"] = colWidth;

    // 获取校区名称
    const selectedSchool = schoolOptions.value.find((option) => option.value === queryParams.value.schoolId);
    const schoolName = selectedSchool ? selectedSchool.label : "全部校区";

    // 获取日期范围
    const [startDate, endDate] = queryParams.value.timeRange || [];
    const dateRange = startDate && endDate ? `${startDate}_${endDate}` : "全部日期";

    // 生成文件名
    const fileName = `客服业绩明细表_${schoolName}_${dateRange}.xlsx`;

    // 添加工作表到工作簿并导出
    XLSX.utils.book_append_sheet(wb, ws, "客服业绩明细表");
    XLSX.writeFile(wb, fileName);
};

// 获取校区列表
const getSchools = async () => {
    try {
        const res = await request.post(
            "/dept/getAllSchools",
            {},
            {
                headers: { sessionid: localStorage.getItem("sessionid") }
            }
        );
        if (res.data.status === 200) {
            schoolOptions.value = res.data.schools.map((item) => ({
                label: item.name,
                value: item.id
            }));
        }
    } catch (error) {
        console.error("获取校区列表失败:", error);
    }
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
/* 添全局样式 */
.el-table .cell {
    white-space: nowrap !important;
    text-align: center !important;
    padding: 0 8px !important;
    /* 添水平内边距 */
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

/* 添横向滚动容器样式 */
.container {
    padding: 20px;
    overflow-x: auto;
    overflow-y: hidden;
}
</style>
