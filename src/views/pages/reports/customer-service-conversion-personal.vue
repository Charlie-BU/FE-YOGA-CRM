<template>
    <div>
        <div class="container">
            <!-- 添加筛选按钮 -->
            <div class="toolbar">
                <el-button type="primary" :icon="Search" @click="showFilterDialog">筛选查询</el-button>
                <el-button type="warning" :icon="Download" @click="handleExport">导出</el-button>
            </div>

            <!-- 筛选弹窗 -->
            <el-dialog title="筛选条件" v-model="filterDialogVisible" width="800px" :close-on-click-modal="false">
                <el-form :model="queryParams" label-width="100px">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="校区">
                                <el-select v-model="queryParams.schoolId" placeholder="请选择校区" clearable
                                    style="width: 100%">
                                    <el-option v-for="item in schoolOptions" :key="item.value" :label="item.label"
                                        :value="item.value" />
                                </el-select>
                            </el-form-item>
                        </el-col>
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

            <!-- 原有的表格部分 -->
            <el-table ref="tableRef" :data="tableData" style="width: 100%;" @selection-change="handleSelectionChange"
                @row-click="handleRowClick" v-loading="loading">
                <el-table-column type="selection" width="55" align="center" />
                <template v-for="item in columns" :key="item.prop">
                    <el-table-column v-if="item.type === 'index'" :type="item.type" :label="item.label"
                        :width="item.width" :align="item.align" show-overflow-tooltip />
                    <el-table-column v-else-if="item.prop === 'amount' && item.label === '金额（元）'" :label="item.label"
                        :align="item.align">
                        <template #default="scope">
                            <span :style="{ color: scope.row.amount >= 0 ? 'green' : '#red', fontWeight: 'bold' }">
                                {{ scope.row.amount }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column v-else :prop="item.prop" :label="item.label" :width="item.width"
                        :align="item.align" :formatter="item.formatter" show-overflow-tooltip />
                </template>
            </el-table>

            <div class="pagination" style="margin-top: 20px; text-align: right;">
                <el-pagination v-model:current-page="page.index" v-model:page-size="page.size" :total="page.total"
                    @current-change="changePage" layout="total, prev, pager, next">
                </el-pagination>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { ElMessage, ElMessageBox, vLoading } from 'element-plus';
import { Download } from '@element-plus/icons-vue';
import request from '@/utils/request';
import * as conventions from '@/utils/conventions';
import { getUserInfo } from '@/utils/login-check';

const userInfo = ref(null);
onMounted(async () => {
    userInfo.value = await getUserInfo();
    await getSchools();
    await initData();
});

// 添加校区选项
const schoolOptions = ref([]);

// 添加获取校区列表方法
const getSchools = async () => {
    try {
        const res = await request.post("/dept/getAllSchools", {}, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });
        if (res.data.status === 200) {
            schoolOptions.value = res.data.schools.map(item => ({
                label: item.name,
                value: item.id
            }));
        }
    } catch (error) {
        console.error('获取校区列表失败:', error);
    }
};

// 添加初始化数据获取方法
const initData = async () => {
    loading.value = true;
    try {
        if (queryParams.timeRange.length === 0) {
            // 获取当前日期
            const now = new Date();
            // 获取当月第一天（修复时区问题）
            const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                .toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
                .replace(/\//g, '-');
            // 获取当月最后一天（修复时区问题）
            const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                .toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
                .replace(/\//g, '-');

            // 设置默认查询参数
            queryParams.timeRange = [startDate, endDate];
        }
        // 清空表格数据
        tableData.value = [];
        // 计算所有校区的数据
        for (const school of schoolOptions.value) {
            const res = await request.post("/dept/calcSchoolBudget", {
                schoolId: school.value,
                startDate: queryParams.timeRange[0],
                endDate: queryParams.timeRange[1]
            }, {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            });

            if (res.data.status === 200) {
                tableData.value.push({
                    ...res.data.data,
                    timeRange: `${queryParams.timeRange[0]} 至 ${queryParams.timeRange[1]}`
                });
            }
        }

        page.total = tableData.value.length;
    } catch (error) {
        console.error('初始化数据失败:', error);
        ElMessage.error('初始化数据失败');
    } finally {
        loading.value = false;
    }
};


// 表格相关
const columns = [
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'schoolName', label: '校区', align: 'center' },
    { prop: 'timeRange', label: '汇总时间', align: 'center' },
    {
        prop: 'budgetBefore',
        label: '初期盈余（元）',
        align: 'center',
        formatter: (row) => row.budgetBefore.toFixed(2)
    },
    {
        prop: 'incomeDuring',
        label: '期间收入（元）',
        align: 'center',
        width: "150",
        formatter: (row) => row.incomeDuring.toFixed(2)
    },
    {
        prop: 'expanseDuring',
        label: '期间支出（元）',
        align: 'center',
        formatter: (row) => row.expanseDuring.toFixed(2)
    },
    {
        prop: 'budgetAfter',
        label: '期末盈余（元）',
        align: 'center',
        formatter: (row) => row.budgetAfter.toFixed(2)
    }
];

const page = reactive({
    index: 1,
    size: 10,
    total: 0,
})

const tableData = ref([]);
// 添加 loading 状态
const loading = ref(false);

// 添加弹窗控制变量
const filterDialogVisible = ref(false);

// 添加显示弹窗方法
const showFilterDialog = () => {
    filterDialogVisible.value = true;
};

// 修改查询方法
const handleQuery = () => {
    filterDialogVisible.value = false;
    page.index = 1;
    calcSchoolBudget();
};

// 添加查询参数
const queryParams = reactive({
    schoolId: '',
    timeRange: [],
});

// 修改 calcSchoolBudget 调用
const calcSchoolBudget = async () => {
    if (!queryParams.schoolId || !queryParams.timeRange?.length) {
        await initData();
        return;
    }
    console.log(queryParams);
    loading.value = true;
    try {
        const res = await request.post("/dept/calcSchoolBudget", {
            schoolId: queryParams.schoolId,
            startDate: queryParams.timeRange[0],
            endDate: queryParams.timeRange[1]
        }, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });

        if (res.data.status !== 200) {
            ElMessage.error(res.data.message || '获取数据失败');
            return;
        }

        // 构造表格数据
        tableData.value = [{
            ...res.data.data,
            timeRange: `${queryParams.timeRange[0]} 至 ${queryParams.timeRange[1]}`
        }];
        page.total = 1;
    } catch (error) {
        console.error('获取数据失败:', error);
        ElMessage.error('获取数据失败');
    } finally {
        loading.value = false;
    }
};

const resetQuery = async () => {
    Object.keys(queryParams).forEach(key => {
        queryParams[key] = key === 'timeRange' ? [] : '';
    });
    filterDialogVisible.value = false;
    await initData();
};

// 修改导出方法，添加筛选条件
const handleExport = async () => {
    if (!tableData.value.length) {
        ElMessage.warning('暂无数据可导出');
        return;
    }

    try {
        // 构建Excel数据
        const excelData = tableData.value.map(item => ({
            '校区': item.schoolName,
            '日期区间': item.timeRange,
            '初期盈余（元）': item.budgetBefore.toFixed(2),
            '期间收入（元）': item.incomeDuring.toFixed(2),
            '期间支出（元）': item.expanseDuring.toFixed(2),
            '期末盈余（元）': item.budgetAfter.toFixed(2)
        }));

        // 使用 xlsx 库导出
        import('xlsx').then(XLSX => {
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '收支汇总');
            XLSX.writeFile(workbook, `收支汇总表${new Date().toLocaleDateString()}.xlsx`);
            ElMessage.success('导出成功');
        });
    } catch (error) {
        console.error('导出失败:', error);
        ElMessage.error('导出失败');
    }
};
// 修改 changePage
const changePage = async (val: number) => {
    if (loading.value) return;
    page.index = val;
    await calcSchoolBudget();
};

// 选择相关
const selectedRows = ref < any[] > ([]);

const handleSelectionChange = (rows: any[]) => {
    selectedRows.value = rows;
};

const tableRef = ref();

const handleRowClick = (row) => {
    tableRef.value?.toggleRowSelection(row);
};
</script>

<style scoped>
.toolbar {
    margin-bottom: 20px;
}

.dialog-footer {
    text-align: right;
}

.el-table :deep(.cell) {
    white-space: nowrap;
}
</style>