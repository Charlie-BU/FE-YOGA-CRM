<template>
    <div>
        <div class="container">
            <el-button type="warning" :icon="CirclePlusFilled" @click="editModelVisible = true">新增</el-button>

            <el-table ref="tableRef" :data="tableData" style="width: 100%; margin-top: 20px;"
                @selection-change="handleSelectionChange" @row-click="handleRowClick" v-loading="loading">
                <el-table-column type="selection" width="55" align="center" />
                <template v-for="item in columns" :key="item.prop">
                    <el-table-column v-if="item.type === 'index'" :type="item.type" :label="item.label"
                        :width="item.width" :align="item.align" show-overflow-tooltip />
                    <el-table-column v-else :prop="item.prop" :label="item.label" :width="item.width"
                        :align="item.align" :formatter="item.formatter" show-overflow-tooltip />
                </template>

                <el-table-column label="操作" width="180" fixed="right" align="center">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination" style="margin-top: 20px; text-align: right;">
                <el-pagination v-model:current-page="page.index" v-model:page-size="page.size" :total="page.total"
                    @current-change="changePage" layout="total, prev, pager, next">
                    <template #default></template>
                </el-pagination>
            </div>
        </div>
        <el-dialog :title="isEdit ? '编辑' : '新增'" v-model="editModelVisible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <el-form ref="formRef" :model="formData" :rules="rules" :label-width="options.labelWidth">
                <el-row :gutter="20">
                    <el-col v-for="(item, index) in options.list" :key="index" :span="options.span">
                        <el-form-item :label="item.label" :prop="item.prop"
                            :rules="item.rules || (item.required ? [{ required: true, message: `请输入${item.label}`, trigger: 'blur' }] : [])">
                            <el-input v-if="item.type === 'input'" v-model="formData[item.prop]"
                                :type="item.inputType || 'text'" :placeholder="`请输入${item.label}`" />
                            <el-select v-else-if="item.type === 'select'" v-model="formData[item.prop]"
                                :placeholder="`请选择${item.label}`" style="width: 100%">
                                <el-option v-for="opt in item.options" :key="opt.value" :label="opt.label"
                                    :value="opt.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="closeDialog">取消</el-button>
                    <el-button type="primary" @click="submitForm">确定</el-button>
                </span>
            </template>
        </el-dialog>

    </div>
</template>

<script setup lang="ts" name="system-user">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, vLoading } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import { User } from '@/types/user';
import request from '@/utils/request';
import TableSearch from '@/components/table-search.vue';
import { FormOptionList } from '@/types/form-option';
import * as conventions from '@/utils/conventions';

onMounted(async () => {
    await getClients();
})


// 表格相关
const columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'name', label: '姓名', align: 'center' },
    { prop: 'fromSource', label: '渠道来源', width: 150, align: 'center', formatter: (row) => conventions.getFromSource(row.fromSource) },
    { prop: 'gender', label: '性别', align: 'center', formatter: (row) => conventions.getGender(row.gender) },
    { prop: 'age', label: '年龄', align: 'center' },
    { prop: 'IDNumber', label: '身份证', align: 'center' },
    { prop: 'phone', label: '电话', align: 'center' },
    { prop: 'weixin', label: '微信', align: 'center' },
    { prop: 'QQ', label: 'QQ', align: 'center' },
    { prop: 'douyin', label: '抖音', align: 'center' },
    { prop: 'rednote', label: '小红书', align: 'center' },
    { prop: 'shangwutong', label: '商务通', align: 'center' },
    { prop: 'address', label: '地区', width: 120, align: 'center' },
    { prop: 'clientStatus', label: '客户状态', align: 'center', formatter: (row) => conventions.getClientStatus(row.clientStatus) },
    { prop: 'affiliatedUserName', label: '所属人', align: 'center' },
    // { prop: 'createdUserId', label: '创建人', align: 'center' },
    { prop: 'createdTime', label: '创建时间', align: 'center' },
    { prop: 'info', label: '备注', width: 120, align: 'center' },
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
        const res = await request.post("/extra/getClueClients", {
            pageIndex: page.index,
            pageSize: page.size,
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

const editModelVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
const formData = ref({});
const rules = ref({});

// 修改 closeDialog 方法
const closeDialog = () => {
    editModelVisible.value = false;
    isEdit.value = false;
    formData.value = {};
    formRef.value?.resetFields();
};

// 修改 handleEdit 方法
const handleEdit = (row) => {
    const { clientStatus, affiliatedUserId, createdUserId, createdTime, affiliatedUserName, ...rest } = row;
    formData.value = JSON.parse(JSON.stringify(rest));
    isEdit.value = true;
    editModelVisible.value = true;
};

// 添加表单提交方法
const submitForm = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const url = isEdit.value ? '/extra/updateClient' : '/extra/addClient';
                const res = await request.post(url, formData.value, {
                    headers: {
                        sessionid: localStorage.getItem("sessionid")
                    }
                });

                if (res.data.status === 200) {
                    ElMessage.success(isEdit.value ? '编辑成功' : '添加成功');
                    closeDialog();
                    getClients();
                } else {
                    ElMessage.error(res.data.message || '操作失败');
                }
            } catch (error) {
                console.error('提交失败:', error);
                ElMessage.error('操作失败');
            }
        }
    });
};


// 删除相关 
const handleDelete = (row: User) => {
    ElMessageBox.confirm(
        '确认删除该客户吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        try {
            const res = await request.post('/extra/deleteClient', {
                id: row.id
            }, {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            });
            if (res.data.status === 200) {
                ElMessage.success('删除成功');
                getClients();
            } else {
                ElMessage.error(res.data.message || '删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            ElMessage.error('删除失败');
        }
    }).catch(() => {
        // 取消删除操作
    });
};

// 选择相关
const selectedRows = ref<any[]>([]);

const handleSelectionChange = (rows: any[]) => {
    selectedRows.value = rows;
};

// 在 data 部分添加
const assignDialogVisible = ref(false);
const assignForm = ref({
    branchId: '',
    userId: ''
});
const branchOptions = ref([]);
const userOptions = ref([]);

const tableRef = ref();

const handleRowClick = (row) => {
    tableRef.value?.toggleRowSelection(row);
};
</script>

<style scoped>
.el-table :deep(.cell) {
    white-space: nowrap;
}
</style>
