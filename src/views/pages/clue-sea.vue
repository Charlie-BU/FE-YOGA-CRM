<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <TableCustom :columns="columns" :tableData="tableData" :total="page.total" :viewFunc="handleView"
                :delFunc="handleDelete" :page-change="changePage" :editFunc="handleEdit">
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="visible = true">新增</el-button>
                </template>
            </TableCustom>

        </div>
        <el-dialog :title="isEdit ? '编辑' : '新增'" v-model="visible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData" />
        </el-dialog>
        <el-dialog title="查看详情" v-model="visible1" width="700px" destroy-on-close>
            <TableDetail :data="viewData"></TableDetail>
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
import { ta } from 'element-plus/es/locale';

onMounted(async () => {
    await getData();
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
let columns = ref([
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
const tableData = ref<User[]>([]);
const getData = async () => {
    const res = await request.post("/extra/getAllClients", null, {
        headers: {
            sessionid: localStorage.getItem("sessionid")
        }
    });
    if (res.data.code != 200) {
        return;
    }
    tableData.value = res.data.clients;
    console.log(res.data);
    // page.total = res.data.pageTotal;
};
getData();

const changePage = (val: number) => {
    page.index = val;
    getData();
};

// 新增/编辑弹窗相关
let options = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'input', label: '用户名', prop: 'name', required: true },
        { type: 'input', label: '手机号', prop: 'phone', required: true },
        { type: 'input', label: '密码', prop: 'password', required: true },
        { type: 'input', label: '邮箱', prop: 'email', required: true },
        { type: 'input', label: '角色', prop: 'role', required: true },
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
    getData();
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