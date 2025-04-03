<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <el-button type="warning" :icon="CirclePlusFilled" @click="visible = true">新增</el-button>

            <el-table :data="tableData" style="width: 100%; margin-top: 20px;">
                <template v-for="item in columns" :key="item.prop">
                    <el-table-column v-if="item.type === 'index'" :type="item.type" :label="item.label"
                        :width="item.width" :align="item.align" />
                    <el-table-column v-else :prop="item.prop" :label="item.label" :width="item.width"
                        :align="item.align" />
                </template>
                <el-table-column label="操作" width="180" fixed="right">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination" style="margin-top: 20px; text-align: right;">
                <el-pagination v-model:current-page="page.index" v-model:page-size="page.size" :total="clientNumber"
                    @current-change="changePage" layout="total, prev, pager, next" />
            </div>
        </div>
        <el-dialog :title="isEdit ? '编辑' : '新增'" v-model="visible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-user">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, vLoading } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import { User } from '@/types/user';
import request from '@/utils/request';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import { FormOption, FormOptionList } from '@/types/form-option';
import { tr } from 'element-plus/es/locale';

onMounted(async () => {
    clientNumber.value = await getClientNumber();
    console.log(clientNumber.value);
    await getClients();
})

// 查询相关
const query = reactive({
    name: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '用户名：', prop: 'name' }
])
const handleSearch = () => {
    changePage(1);
};

// 表格相关
const columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'name', label: '姓名' },
    { prop: 'fromSource', label: '渠道来源' },
    { prop: 'gender', label: '性别' },
    { prop: 'age', label: '年龄' },
    { prop: 'IDNumber', label: '身份证' },
    { prop: 'phone', label: '电话' },
    { prop: 'weixin', label: '微信' },
    { prop: 'QQ', label: 'QQ' },
    { prop: 'douyin', label: '抖音' },
    { prop: 'rednote', label: '小红书' },
    { prop: 'shangwutong', label: '商务通' },
    { prop: 'address', label: '地区' },
    { prop: 'clientStatus', label: '客户状态' },
    { prop: 'affiliatedUserId', label: '所属人' },
    { prop: 'createdUserId', label: '创建人' },
    { prop: 'createdTime', label: '创建时间' },
    { prop: 'info', label: '备注' },
])
const page = reactive({
    index: 1,
    size: 10,
    total: 0,
})


const getClientNumber = async () => {
    const res = await request.post("/extra/getClientNumber", {
        clientStatus: 0
    }, {
        headers: {
            sessionid: localStorage.getItem("sessionid")
        }
    });
    if (res.data.status != 200) {
        return 0;
    }
    return res.data.clientNumber;
}

const clientNumber = ref(0);
const tableData = ref([]);
const getClients = async () => {
    const res = await request.post("/extra/getAllClients", null, {
        headers: {
            sessionid: localStorage.getItem("sessionid")
        }
    });
    if (res.data.status != 200) {
        return;
    }
    tableData.value = res.data.clients;
    // page.total = res.data.pageTotal;
};

const changePage = (val: number) => {
    page.index = val;
    getClients();
};

// 新增/编辑弹窗相关
const options = ref({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'input', label: '姓名', prop: 'name', required: true },
        {
            type: 'select',
            label: '渠道来源',
            prop: 'fromSource',
            required: true,
            options: [
                { label: '抖音', value: '抖音' },
                { label: '小红书', value: '小红书' },
                { label: '商务通', value: '商务通' },
                { label: '其他', value: '其他' }
            ]
        },
        {
            type: 'select',
            label: '性别',
            prop: 'gender',
            options: [
                { label: '男', value: '男' },
                { label: '女', value: '女' }
            ]
        },
        { type: 'input', label: '年龄', prop: 'age' },
        { type: 'input', label: '身份证', prop: 'IDNumber' },
        { type: 'input', label: '电话', prop: 'phone', required: true },
        { type: 'input', label: '微信', prop: 'weixin' },
        { type: 'input', label: 'QQ', prop: 'QQ' },
        { type: 'input', label: '抖音', prop: 'douyin' },
        { type: 'input', label: '小红书', prop: 'rednote' },
        { type: 'input', label: '商务通', prop: 'shangwutong' },
        { type: 'input', label: '地区', prop: 'address' },
        {
            type: 'select', label: '客户状态', prop: 'clientStatus', options: [
                { label: '潜在', value: '潜在' },
                { label: '意向', value: '意向' },
                { label: '成交', value: '成交' }
            ]
        },
        { type: 'input', label: '所属人', prop: 'affiliatedUserId' },
        { type: 'input', label: '备注', prop: 'info' }
    ]
})

const visible = ref(false);
const isEdit = ref(false);
const rowData = ref({});
const handleEdit = (row: User) => {
    rowData.value = { ...row };
    isEdit.value = true;
    visible.value = true;
};
const updateData = () => {
    closeDialog();
    getClients();
};

const closeDialog = () => {
    visible.value = false;
    isEdit.value = false;
};

// 查看详情弹窗相关
const visible1 = ref(false);
const viewData = ref({
    row: {},
    list: []
});
const handleView = (row: User) => {
    viewData.value.row = { ...row }
    viewData.value.list = [
        {
            prop: 'id',
            label: '用户ID',
        },
        {
            prop: 'name',
            label: '用户名',
        },
        {
            prop: 'password',
            label: '密码',
        },
        {
            prop: 'email',
            label: '邮箱',
        },
        {
            prop: 'phone',
            label: '电话',
        },
        {
            prop: 'role',
            label: '角色',
        },
        {
            prop: 'date',
            label: '注册日期',
        },
    ]
    visible1.value = true;
};

// 删除相关
const handleDelete = (row: User) => {
    ElMessage.success('删除成功');
}
</script>

<style scoped></style>