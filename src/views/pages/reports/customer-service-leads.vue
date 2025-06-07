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
                            <el-form-item label="所属校区">
                                <el-select v-model="queryParams.schoolId" placeholder="请选择校区" style="width: 100%" clearable>
                                    <el-option v-for="item in schoolOptions" :key="item.value" :label="item.label" :value="item.value" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
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
                <el-table-column prop="total" label="线索总数" align="center" show-overflow-tooltip />
                <el-table-column prop="phone" label="电话" align="center" show-overflow-tooltip />
                <el-table-column prop="dp" label="点评" align="center" show-overflow-tooltip />
                <el-table-column prop="bw" label="商务通" align="center" show-overflow-tooltip />
                <el-table-column prop="xhs" label="小红书" align="center" show-overflow-tooltip />
                <el-table-column prop="red" label="红推" align="center" show-overflow-tooltip />
                <el-table-column prop="dy" label="抖音" align="center" show-overflow-tooltip />
                <el-table-column prop="gd" label="高德" align="center" show-overflow-tooltip />
                <el-table-column prop="refer" label="推荐/介绍" align="center" show-overflow-tooltip />
                <el-table-column prop="mp" label="公众号" align="center" show-overflow-tooltip />
                <el-table-column prop="video" label="视频号" align="center" show-overflow-tooltip />
                <el-table-column prop="info" label="信息流" align="center" show-overflow-tooltip />
                <el-table-column prop="ks" label="快手" align="center" show-overflow-tooltip />
                <el-table-column prop="live" label="直播" align="center" show-overflow-tooltip />
                <el-table-column prop="zl" label="知了" align="center" show-overflow-tooltip />
                <el-table-column prop="self" label="自己进店" align="center" show-overflow-tooltip />
                <el-table-column prop="ksInfo" label="快手信息流" align="center" show-overflow-tooltip />
                <el-table-column prop="coop" label="合作" align="center" show-overflow-tooltip />
                <el-table-column prop="gdt" label="广点通" align="center" show-overflow-tooltip />
                <el-table-column prop="optim" label="优化站" align="center" show-overflow-tooltip />
                <el-table-column prop="other" label="其他" align="center" show-overflow-tooltip />
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
        const res = await request.post("http://8.153.204.238:85/user/getCustomerServiceLeadsData", params, {
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
        { title: "客服信息", dataIndex: "username", render: (row) => `${row.schoolName.slice(0, 2)}-${row.username}` },
        { title: "线索总数", dataIndex: "total" },
        { title: "电话", dataIndex: "phone" },
        { title: "点评", dataIndex: "dp" },
        { title: "商务通", dataIndex: "bw" },
        { title: "小红书", dataIndex: "xhs" },
        { title: "红推", dataIndex: "red" },
        { title: "抖音", dataIndex: "dy" },
        { title: "高德", dataIndex: "gd" },
        { title: "推荐/介绍", dataIndex: "refer" },
        { title: "公众号", dataIndex: "mp" },
        { title: "视频号", dataIndex: "video" },
        { title: "信息流", dataIndex: "info" },
        { title: "快手", dataIndex: "ks" },
        { title: "直播", dataIndex: "live" },
        { title: "知了", dataIndex: "zl" },
        { title: "自己进店", dataIndex: "self" },
        { title: "快手信息流", dataIndex: "ksInfo" },
        { title: "合作", dataIndex: "coop" },
        { title: "广点通", dataIndex: "gdt" },
        { title: "优化站", dataIndex: "optim" },
        { title: "其他", dataIndex: "other" }
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
    const fileName = `客服线索数据_${schoolName}_${dateRange}.xlsx`;

    // 添加工作表到工作簿并导出
    XLSX.utils.book_append_sheet(wb, ws, "客服线索数据");
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
