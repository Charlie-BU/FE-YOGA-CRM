<template>
    <div>
        <el-tabs v-model="activeTab">
            <el-tab-pane label="收入管理" name="income">
                <div class="container">
                    <el-button type="warning" :icon="CirclePlusFilled" @click="handleAdd">新增</el-button>

                    <el-table ref="tableRef" :data="tableData" style="width: 100%; margin-top: 20px;"
                        @selection-change="handleSelectionChange" @row-click="handleRowClick" v-loading="loading">
                        <!-- 保持原有的表格内容 -->
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
                        <el-pagination v-model:current-page="page.index" v-model:page-size="page.size"
                            :total="page.total" @current-change="changePage" layout="total, prev, pager, next">
                        </el-pagination>
                    </div>
                </div>
            </el-tab-pane>

            <el-tab-pane label="支出管理" name="expense">
                <div class="container">
                    <el-button type="warning" :icon="CirclePlusFilled" @click="handleAdd">新增</el-button>

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
                        <el-pagination v-model:current-page="page.index" v-model:page-size="page.size"
                            :total="page.total" @current-change="changePage" layout="total, prev, pager, next">
                        </el-pagination>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>

        <!-- 新增 / 编辑收入 -->
        <el-dialog :title="isEdit ? '编辑收入' : '新增收入'" v-model="editModelVisible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <el-form ref="formRef" :model="formData" :rules="rules" :label-width="options.labelWidth">
                <el-row :gutter="20">
                    <el-col v-for="(item, index) in options.list" :key="index" :span="options.span">
                        <el-form-item :label="item.label" :prop="item.prop"
                            :rules="item.rules || (item.required ? [{ required: true, message: `请输入${item.label}`, trigger: 'blur' }] : [])">
                            <el-input v-if="item.label === '负责教师'" :type="item.inputType || 'text'"
                                :placeholder=userInfo?.username :disabled="item.disabled" />
                            <el-input v-else-if="item.type === 'input'" v-model="formData[item.prop]"
                                :type="item.inputType || 'text'" :placeholder="`请输入${item.label}`"
                                :disabled="item.disabled" />
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

        <!-- 新增 / 编辑支出 -->
        <el-dialog :title="isEdit ? '编辑支出' : '新增支出'" v-model="editExpenseModelVisible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <el-form ref="formRef" :model="formData" :rules="rules" :label-width="expenseOptions.labelWidth">
                <el-row :gutter="20">
                    <el-col v-for="(item, index) in expenseOptions.list" :key="index" :span="expenseOptions.span">
                        <el-form-item :label="item.label" :prop="item.prop"
                            :rules="item.rules || (item.required ? [{ required: true, message: `请输入${item.label}`, trigger: 'blur' }] : [])">
                            <el-input v-if="item.label === '负责教师'" :type="item.inputType || 'text'"
                                :placeholder=userInfo?.username :disabled="item.disabled" />
                            <el-input v-else-if="item.type === 'input'" v-model="formData[item.prop]"
                                :type="item.inputType || 'text'" :placeholder="`请输入${item.label}`"
                                :disabled="item.disabled" />
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
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { ElMessage, ElMessageBox, vLoading } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import request from '@/utils/request';
import * as conventions from '@/utils/conventions';
import { getUserInfo } from '@/utils/login-check';

const userInfo = ref(null);
onMounted(async () => {
    userInfo.value = await getUserInfo();
    await getPayments(activeTab.value === 'income');
})

// 表格相关
const baseColumns = [
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'teacherName', label: '负责教师', align: 'center' },
    { prop: 'amount', label: '金额（元）', align: 'center', formatter: (row) => Math.abs(row.amount) },
    { prop: 'category', label: '费用类别', align: 'center', formatter: (row) => conventions.getPaymentCategory(row.category) },
    { prop: 'paymentMethod', label: '支付方式', align: 'center', formatter: (row) => conventions.getPaymentMethod(row.paymentMethod) },
    { prop: 'paymentTime', label: '支付时间', align: 'center' },
    { prop: 'info', label: '备注', width: 120, align: 'center' },
];

const columns = computed(() => {
    if (activeTab.value === 'income') {
        return [
            ...baseColumns.slice(0, 1),
            { prop: 'clientName', label: '客户', align: 'center' },
            ...baseColumns.slice(1)
        ];
    } else {
        return [
            ...baseColumns.slice(0, 1),
            { prop: 'receiver', label: '收款方', align: 'center' },
            ...baseColumns.slice(1)
        ];
    }
});
const page = reactive({
    index: 1,
    size: 10,
    total: 0,
})

const tableData = ref([]);
// 添加 loading 状态
const loading = ref(false);

// 添加 activeTab
const activeTab = ref('income');


// 修改 getPayments 调用
const getPayments = async (isIncome = true) => {
    loading.value = true;
    try {
        const res = await request.post("/extra/getPayments", {
            pageIndex: page.index,
            pageSize: page.size,
            isIncome: isIncome,
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

// 添加 watch 监听标签页变化
watch(activeTab, async (newVal) => {
    page.index = 1; // 切换标签页时重置页码
    await getPayments(newVal === 'income');
});

// 修改 changePage
const changePage = async (val: number) => {
    if (loading.value) return;
    page.index = val;
    await getPayments(activeTab.value === 'income');
};

// 新增 / 编辑弹窗相关
const options = ref<any>({
    labelWidth: '100px',
    span: 12,
    list: [
        {
            type: 'select',
            label: '客户',
            prop: 'clientId',
            required: true,
            options: []
        },
        {
            type: 'input',
            label: '负责教师',
            prop: 'teacherName',
            // required: true,
            disabled: true,
        },
        {
            type: 'input',
            label: '金额',
            prop: 'amount',
            inputType: 'number',
            required: true
        },
        {
            type: 'select',
            label: '费用类别',
            prop: 'category',
            required: true,
            options: conventions.paymentCategories.map(item => ({
                label: item.name,
                value: item.id
            }))
        },
        {
            type: 'select',
            label: '支付方式',
            prop: 'paymentMethod',
            required: true,
            options: conventions.paymentMethods.map(item => ({
                label: item.name,
                value: item.id
            }))
        },
        { type: 'input', label: '备注', prop: 'info' }
    ]
})


const editModelVisible = ref(false);  // 收入弹窗
const editExpenseModelVisible = ref(false);  // 支出弹窗
const isEdit = ref(false);
const formRef = ref();
const formData = ref({});
const rules = ref({});

// 修改 closeDialog 方法
const closeDialog = () => {
    editModelVisible.value = false;
    editExpenseModelVisible.value = false;
    isEdit.value = false;
    formData.value = {};
    formRef.value?.resetFields();
};

// 修改 handleEdit 方法
const handleEdit = async (row = null) => {
    try {
        // 获取客户列表
        const clientRes = await request.post('/extra/getClients', {
            pageIndex: 1,
            pageSize: 999
        }, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });
        if (clientRes.data.status === 200) {
            options.value.list.find(item => item.prop === 'clientId').options =
                clientRes.data.clients.map(item => ({
                    label: item.name,
                    value: item.id
                }));
        }

        // // 获取教师列表
        // const teacherRes = await request.post('/user/getAllUsers', {}, {
        //     headers: { sessionid: localStorage.getItem("sessionid") }
        // });
        // if (teacherRes.data.status === 200) {
        //     options.value.list.find(item => item.prop === 'teacherId').options =
        //         teacherRes.data.users.map(item => ({
        //             label: item.username,
        //             value: item.id
        //         }));
        // }
        if (row) {
            formData.value = JSON.parse(JSON.stringify(row));
            (formData.value as any).amount = Math.abs((formData.value as any).amount);
        } else {
            formData.value = {
                teacherId: userInfo.value?.id
            };
        }
        isEdit.value = true;
        if (activeTab.value === 'income') {
            editModelVisible.value = true;
        } else {
            editExpenseModelVisible.value = true;
        }
    } catch (error) {
        console.error('获取选项数据失败:', error);
        ElMessage.error('获取选项数据失败');
    }
};


// 删除相关
const handleDelete = (row) => {
    ElMessageBox.confirm(
        '确认删除该费用记录吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        try {
            const res = await request.post('/extra/deletePayment', {
                id: row.id
            }, {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            });
            if (res.data.status === 200) {
                ElMessage.success('删除成功');
                // 修改这里，传入当前标签页对应的参数
                await getPayments(activeTab.value === 'income');
            } else {
                ElMessage.error(res.data.message || '删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            ElMessage.error('删除失败');
        }
    });
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

// 新增支出的配置
// 修改 expenseOptions 中的教师配置
const expenseOptions = ref<any>({
    labelWidth: '100px',
    span: 12,
    list: [
        {
            type: 'input',
            label: '收款方',
            prop: 'receiver',
            required: true
        },
        {
            type: 'input',
            label: '负责教师',
            prop: 'teacherName',
            // required: true,
            disabled: true,
        },
        {
            type: 'input',
            label: '金额',
            prop: 'amount',
            inputType: 'number',
            required: true
        },
        {
            type: 'select',
            label: '费用类别',
            prop: 'category',
            required: true,
            options: conventions.paymentCategories.map(item => ({
                label: item.name,
                value: item.id
            }))
        },
        {
            type: 'select',
            label: '支付方式',
            prop: 'paymentMethod',
            required: true,
            options: conventions.paymentMethods.map(item => ({
                label: item.name,
                value: item.id
            }))
        },
        { type: 'input', label: '备注', prop: 'info' }
    ]
})

// 修改 handleAdd 方法
const handleAdd = async () => {
    try {
        // 只在收入管理时获取客户列表
        if (activeTab.value === 'income') {
            const clientRes = await request.post('/extra/getClients', {
                pageIndex: 1,
                pageSize: 999
            }, {
                headers: { sessionid: localStorage.getItem("sessionid") }
            });
            if (clientRes.data.status === 200) {
                options.value.list.find(item => item.prop === 'clientId').options =
                    clientRes.data.clients.map(item => ({
                        label: item.name,
                        value: item.id
                    }));
            }
        }

        isEdit.value = false;
        formData.value = {
            teacherId: userInfo.value?.id
        };

        if (activeTab.value === 'income') {
            editModelVisible.value = true;
        } else {
            editExpenseModelVisible.value = true;
        }
    } catch (error) {
        console.error('获取选项数据失败:', error);
        ElMessage.error('获取选项数据失败');
    }
};

// 修改 submitForm 方法
const submitForm = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            if ((formData.value as any).amount === 0) {
                ElMessage.error('金额不能为0');
                return;
            }
            try {
                const url = isEdit.value ? '/extra/updatePayment' : '/extra/addPayment';
                // 支出时金额取负数
                if (activeTab.value === 'expense') {
                    (formData.value as any).amount = -Math.abs((formData.value as any).amount);
                }
                const res = await request.post(url, formData.value, {
                    headers: {
                        sessionid: localStorage.getItem("sessionid")
                    }
                });

                if (res.data.status === 200) {
                    ElMessage.success(isEdit.value ? '编辑成功' : '添加成功');
                    closeDialog();
                    getPayments(activeTab.value === 'income');
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

// 在 template 中修改 dialog 的内容
</script>

<style scoped>
.el-table :deep(.cell) {
    white-space: nowrap;
}
</style>
