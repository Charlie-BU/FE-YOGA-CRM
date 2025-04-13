<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <el-table ref="tableRef" :data="tableData" style="width: 100%; margin-top: 20px;"
                @selection-change="handleSelectionChange" @row-click="handleRowClick" v-loading="loading">
                <el-table-column type="selection" width="55" align="center" />
                <template v-for="item in columns" :key="item.prop">
                    <el-table-column v-if="item.type === 'index'" :type="item.type" :label="item.label"
                        :width="item.width" :align="item.align" show-overflow-tooltip />
                    <el-table-column v-else-if="item.slot" :prop="item.prop" :label="item.label" :width="item.width"
                        :align="item.align" show-overflow-tooltip>
                        <template #default="scope">
                            <span class="clickable-name" @click.stop="showClientInfo(scope.row)">
                                {{ scope.row[item.prop as keyof typeof scope.row] }}
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
                    <template #default></template>
                </el-pagination>
            </div>
        </div>
        <!-- 客户信息卡弹窗 -->
        <ClientInfoCard v-model="clientInfoDialogVisible" :client="currentClient" />
    </div>
</template>

<script setup lang="ts" name="system-user">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, vLoading } from 'element-plus';
import { User } from '@/types/user';
import request from '@/utils/request';
import TableSearch from '@/components/table-search.vue';
import { FormOptionList } from '@/types/form-option';
import * as conventions from '@/utils/conventions';
import ClientInfoCard from '@/components/client-info-card.vue'

onMounted(async () => {
    await getClients();
})

// 查询相关
const query = reactive({
    name: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '姓名：', prop: 'name' }
])
const handleSearch = async () => {
    if (loading.value) return; // 如果正在加载，则不执行
    page.index = 1;
    await getClients();
};

// 表格相关
const columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    {
        prop: 'name',
        label: '姓名',
        width: 150,
        align: 'center',
        slot: true,
        // 添加自定义渲染函数
        renderCell: (h, { row }) => {
            return h(
                'span',
                {
                    style: 'color: #409EFF; cursor: pointer;',
                    onClick: (event) => {
                        event.stopPropagation();
                        showClientInfo(row);
                    }
                },
                row.name
            );
        }
    },
    { prop: 'phone', label: '电话', width: 150, align: 'center' },
    { prop: 'weixin', label: '微信', width: 150, align: 'center' },
    { prop: 'schoolName', label: '校区', width: 150, align: 'center' },
    { prop: 'affiliatedUserName', label: '所属人 / 合作老师', width: 150, align: 'center' },
    { prop: 'appointerName', label: '预约人', width: 150, align: 'center' },
    { prop: 'courseNames', label: '课程', width: 150, align: 'center' },
    { prop: 'address', label: '地区', width: 150, align: 'center' },
    { prop: 'appointDate', label: '预约日期', width: 150, align: 'center' },
    { prop: 'nextTalkDate', label: '下次沟通日期', width: 150, align: 'center' },
    { prop: 'processStatus', label: '跟进状态', width: 150, align: 'center', formatter: (row) => row.processStatus === 1 ? "未成单" : row.processStatus === 2 ? "已成单" : "" },
    { prop: 'cooperateTime', label: '成单时间', width: 150, align: 'center' },
    { prop: 'contractNo', label: '合同编号', width: 150, align: 'center' },
    { prop: 'createdTime', label: '创建时间', width: 150, align: 'center' },
    { prop: 'fromSource', label: '渠道来源', width: 150, align: 'center', formatter: (row) => conventions.getFromSource(row.fromSource) },
    { prop: 'detailedInfo', label: '预约备注', width: 150, align: 'center' }
])
const page = reactive({
    index: 1,
    size: 10,
    total: 0,
})

const tableData = ref([]);
// 添加 loading 状态
const loading = ref(false);

const getClients = async () => {
    loading.value = true;
    try {
        const res = await request.post("/extra/getDealedClients", {
            pageIndex: page.index,
            pageSize: page.size,
            name: query.name  // 只传递姓名查询参数
        }, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });
        if (res.data.status != 200) {
            return;
        }
        tableData.value = res.data.clients;
        page.total = res.data.total;
    } catch (error) {
        console.error('获取数据失败:', error);
    } finally {
        loading.value = false;
    }
};

const changePage = async (val: number) => {
    if (loading.value) return; // 如果正在加载，则不执行
    page.index = val;
    await getClients();
};

// 新增 / 编辑弹窗相关
const options = ref<any>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'input', label: '姓名', prop: 'name', required: true },
        {
            type: 'select',
            label: '渠道来源',
            prop: 'fromSource',
            required: true,
            options: conventions.fromSources.map(item => ({
                label: item.name,
                value: item.id
            }))
        },
        {
            type: 'select',
            label: '性别',
            prop: 'gender',
            options: conventions.genders.map(item => ({
                label: item.name,
                value: item.id
            }))
        },
        {
            type: 'input',
            label: '年龄',
            prop: 'age',
            inputType: 'number',
        },
        { type: 'input', label: '身份证', prop: 'IDNumber' },
        { type: 'input', label: '电话', prop: 'phone' },
        { type: 'input', label: '微信', prop: 'weixin', required: true },
        { type: 'input', label: 'QQ', prop: 'QQ' },
        { type: 'input', label: '抖音', prop: 'douyin' },
        { type: 'input', label: '小红书', prop: 'rednote' },
        { type: 'input', label: '商务通', prop: 'shangwutong' },
        { type: 'input', label: '地区', prop: 'address' },
        { type: 'input', label: '备注', prop: 'info' }
    ]
})

// 选择相关
const selectedRows = ref<any[]>([]);

const handleSelectionChange = (rows: any[]) => {
    selectedRows.value = rows;
};

const tableRef = ref();

const handleRowClick = (row) => {
    tableRef.value?.toggleRowSelection(row);
};

// 客户信息卡相关
const clientInfoDialogVisible = ref(false)
const currentClient = ref({})

// 显示客户信息卡
const showClientInfo = (client) => {
    currentClient.value = { ...client }
    clientInfoDialogVisible.value = true
}
</script>

<style scoped>
.clickable-name {
    color: #409EFF;
    cursor: pointer;
}

.clickable-name:hover {
    text-decoration: underline;
}

.el-table :deep(.cell) {
    white-space: nowrap;
}
</style>
