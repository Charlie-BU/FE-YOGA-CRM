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
                            <el-form-item label="操作人">
                                <el-input v-model="queryParams.operatorName" placeholder="请输入操作人姓名" clearable />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="操作类型">
                                <el-input v-model="queryParams.operation" placeholder="请输入操作类型" clearable />
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="操作时间">
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

            <!-- 表格部分 -->
            <el-table ref="tableRef" :data="tableData" style="width: 100%;" v-loading="loading">
                <template v-for="item in columns" :key="item.prop">
                    <el-table-column v-if="item.type === 'index'" :type="item.type" :label="item.label"
                        :width="item.width" :align="item.align" show-overflow-tooltip />
                    <el-table-column v-else :prop="item.prop" :label="item.label" :width="item.width"
                        :align="item.align" show-overflow-tooltip />
                </template>
            </el-table>

            <div class="pagination" style="margin-top: 20px; text-align: right;">
                <el-pagination v-model:current-page="page.index" v-model:page-size="page.size" :total="page.total"
                    @current-change="changePage" @size-change="handleSizeChange" :page-sizes="[10, 20, 50, 100]"
                    layout="sizes, total, prev, pager, next">
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
// 修改 onMounted
onMounted(async () => {
    userInfo.value = await getUserInfo();
    await getSchools();  // 添加获取校区列表
    await getLogs();
})
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

// 表格相关
const columns = [
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'operatorName', label: '操作人', width: 120, align: 'center' },
    { prop: 'operation', label: '用户操作', align: 'center' },
    { prop: 'time', label: '操作时间', width: 220, align: 'center' },
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
    getLogs();
};

// 添加查询参数
const queryParams = reactive({
    operatorName: '',
    operation: '',
    timeRange: [],
});

// 修改 getLogs 调用
const getLogs = async () => {
    loading.value = true;
    try {
        const res = await request.post("/extra/getLogs", {
            pageIndex: page.index,
            pageSize: page.size,
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
        tableData.value = res.data.logs;
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
        const res = await request.post("/log/getLogs", {
            pageIndex: 1,
            pageSize: 999999,
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
        const excelData = res.data.logs.map(item => ({
            '日志ID': item.id,
            '操作人': item.operatorName,
            '操作类型': item.operation,
            '操作时间': item.time,
        }));

        // 使用 xlsx 库导出
        import('xlsx').then(XLSX => {
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '操作日志');

            // 生成文件并下载
            XLSX.writeFile(workbook, `操作日志${new Date().toLocaleDateString()}.xlsx`);
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
    await getLogs();
};

const handleSizeChange = async (val: number) => {
    page.size = val;
    await getLogs();
}

const tableRef = ref();

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
