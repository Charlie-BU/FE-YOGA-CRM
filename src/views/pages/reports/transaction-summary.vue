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
                        <el-col :span="12">
                            <el-form-item label="收支类型">
                                <el-select v-model="queryParams.paymentType" placeholder="请选择" clearable
                                    default-first-option style="width: 100%">
                                    <el-option label="全部" value="all" />
                                    <el-option label="收入" value="income" />
                                    <el-option label="支出" value="expense" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="费用项目">
                                <el-select v-model="queryParams.category" placeholder="请选择" clearable
                                    style="width: 100%">
                                    <el-option v-for="item in conventions.paymentCategories" :key="item.id"
                                        :label="item.name" :value="item.id" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="支付方式">
                                <el-select v-model="queryParams.paymentMethod" placeholder="请选择" clearable
                                    style="width: 100%">
                                    <el-option v-for="item in conventions.paymentMethods" :key="item.id"
                                        :label="item.name" :value="item.id" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="交易对象">
                                <el-input v-model="queryParams.clientName" placeholder="请输入交易对象" clearable />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="联系电话">
                                <el-input v-model="queryParams.clientPhone" placeholder="请输入联系电话" clearable />
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="制单时间">
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

// 修改 onMounted
onMounted(async () => {
    userInfo.value = await getUserInfo();
    await getSchools();  // 添加获取校区列表
    await getPayments();
})

// 表格相关
const columns = [
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'schoolName', label: '校区', align: 'center' },
    {
        prop: 'amount',
        label: '收支类型',
        align: 'center',
        formatter: (row) => row.amount >= 0 ? '收入' : '支出'
    },
    { prop: 'category', label: '费用项目', align: 'center', formatter: (row) => conventions.getPaymentCategory(row.category) },
    { prop: 'paymentMethod', label: '支付方式', align: 'center', formatter: (row) => conventions.getPaymentMethod(row.paymentMethod) },
    {
        prop: 'clientName',
        label: '交易对象',
        align: 'center',
        formatter: (row) => row.clientName || row.receiver
    },
    { prop: 'clientPhone', label: '联系电话', align: 'center' },
    {
        prop: 'amount',
        label: '金额（元）',
        align: 'center'
    },
    { prop: 'paymentTime', label: '制单时间', align: 'center' },
    { prop: 'teacherName', label: '制单人', align: 'center' },
    { prop: 'info', label: '备注', width: 120, align: 'center' },
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
    getPayments();
};

// 添加查询参数
const queryParams = reactive({
    schoolId: '',  // 修改 schoolName 为 schoolId
    paymentType: '',
    category: '',
    paymentMethod: '',
    clientName: '',
    clientPhone: '',
    timeRange: [],
});

// 修改 getPayments 调用
const getPayments = async () => {
    loading.value = true;
    try {
        const res = await request.post("/extra/getPayments", {
            pageIndex: page.index,
            pageSize: page.size,
            paymentType: "all",
            ...queryParams,
            startTime: queryParams.timeRange?.[0] || '',
            endTime: queryParams.timeRange?.[1] || '',
        }, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });
        if (res.data.status != 200) {
            console.log(res.data);
            return;
        }
        tableData.value = res.data.payments;
        page.total = res.data.total;
    } catch (error) {
        console.error('获取数据失败:', error);
    } finally {
        loading.value = false;
    }
};

const resetQuery = () => {
    Object.keys(queryParams).forEach(key => {
        queryParams[key] = key === 'timeRange' ? [] : '';
    });
    handleQuery();
};

// 修改导出方法，添加筛选条件
const handleExport = async () => {
    try {
        loading.value = true;
        const res = await request.post("/extra/getPayments", {
            pageIndex: 1,
            pageSize: 999999,
            paymentType: "all",
            ...queryParams,
            startTime: queryParams.timeRange?.[0] || '',
            endTime: queryParams.timeRange?.[1] || '',
        }, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });

        if (res.data.status !== 200) {
            ElMessage.error(res.data.message || '导出失败');
            return;
        }

        // 构建Excel数据
        const excelData = res.data.payments.map(item => ({
            '校区': item.schoolName,
            '收支类型': item.amount >= 0 ? '收入' : '支出',
            '费用项目': conventions.getPaymentCategory(item.category),
            '支付方式': conventions.getPaymentMethod(item.paymentMethod),
            '交易对象': item.clientName || item.receiver,
            '联系电话': item.clientPhone,
            '金额（元）': Math.abs(item.amount),
            '制单时间': item.paymentTime,
            '制单人': item.teacherName,
            '备注': item.info
        }));

        // 使用 xlsx 库导出
        import('xlsx').then(XLSX => {
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '收支明细');

            // 生成文件并下载
            XLSX.writeFile(workbook, `收支明细表${new Date().toLocaleDateString()}.xlsx`);
            ElMessage.success('导出成功');
        });

    } catch (error) {
        console.error('导出失败:', error);
        ElMessage.error('导出失败');
    } finally {
        loading.value = false;
    }
};
// 修改 changePage
const changePage = async (val: number) => {
    if (loading.value) return;
    page.index = val;
    await getPayments();
};

// 选择相关
const selectedRows = ref<any[]>([]);

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
