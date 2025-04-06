<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />

        <div class="container">
            <!-- <el-button type="warning" :icon="CirclePlusFilled" @click="editModelVisible = true"></el-button> -->
            <el-button v-if="currClientStatus === 3" type="primary" :disabled="selectedRows.length !== 1"
                @click="handleReserve">预约到店</el-button>
            <el-button v-if="currClientStatus === 4" type="danger" :disabled="selectedRows.length !== 1"
                @click="handleCancelReserve">取消预约</el-button>
            <el-button v-if="currClientStatus === 4" type="success" :disabled="selectedRows.length !== 1" @click="">确认成单
                -
                签署合同</el-button>
            <el-button v-if="currClientStatus === 4" type="danger" :disabled="selectedRows.length !== 1"
                @click="">取消成单</el-button>
            <el-button v-if="currClientStatus === 4" type="primary" :disabled="selectedRows.length !== 1"
                @click="">交定金</el-button>

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
                <el-button :type="currClientStatus === 3 ? 'success' : 'primary'" @click="switchClientStatus">{{
                    currClientStatus
                        === 3 ? "查看已预约到店客户" :
                        "查看未预约到店客户"
                }}</el-button>
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


        <el-dialog title="预约到店" v-model="assignDialogVisible" width="700px" destroy-on-close>
            <el-form :model="assignForm" label-width="120px">
                <el-form-item label="* 校区:">
                    <el-select v-model="assignForm.schoolId" placeholder="请选择校区" style="width: 100%"
                        @change="handleBranchChange">
                        <el-option v-for="item in branchOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="* 预约日期:">
                    <el-date-picker v-model="assignForm.appointDate" type="date" placeholder="选择日期"
                        style="width: 100%" />
                </el-form-item>
                <el-form-item label="* 预约人:">
                    <el-select v-model="assignForm.appointerId" placeholder="请选择预约人" style="width: 100%">
                        <el-option v-for="item in appointerOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="* 课程:">
                    <el-select v-model="assignForm.courseIds" placeholder="请选择课程" style="width: 100%" multiple>
                        <el-option v-for="item in courseOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="下次沟通日期:">
                    <el-date-picker v-model="assignForm.nextTalkDate" type="date" placeholder="选择日期"
                        style="width: 100%" />
                </el-form-item>
                <el-form-item label="预约备注:">
                    <el-input v-model="assignForm.detailedInfo" type="textarea" :rows="4"
                        placeholder="请输入预约备注"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="assignDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitReserve">确定</el-button>
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
const defaultColumns = [
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'name', label: '姓名', width: 150, align: 'center' },
    { prop: 'fromSource', label: '渠道来源', width: 150, align: 'center', formatter: (row) => conventions.getFromSource(row.fromSource) },
    { prop: 'gender', label: '性别', width: 150, align: 'center', formatter: (row) => conventions.getGender(row.gender) },
    { prop: 'age', label: '年龄', width: 150, align: 'center' },
    { prop: 'IDNumber', label: '身份证', width: 150, align: 'center' },
    { prop: 'phone', label: '电话', width: 150, align: 'center' },
    { prop: 'weixin', label: '微信', width: 150, align: 'center' },
    { prop: 'QQ', label: 'QQ', width: 150, align: 'center' },
    { prop: 'douyin', label: '抖音', width: 150, align: 'center' },
    { prop: 'rednote', label: '小红书', width: 150, align: 'center' },
    { prop: 'shangwutong', label: '商务通', width: 150, align: 'center' },
    { prop: 'address', label: '地区', width: 150, align: 'center' },
    { prop: 'clientStatus', label: '客户状态', width: 150, align: 'center', formatter: (row) => conventions.getClientStatus(row.clientStatus) },
    { prop: 'affiliatedUserName', label: '所属人 / 合作老师', width: 150, align: 'center' },
    { prop: 'createdTime', label: '创建时间', width: 150, align: 'center' },
    { prop: 'info', label: '备注', width: 150, align: 'center' },
]

const secondColumns = [
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'name', label: '姓名', width: 150, align: 'center' },
    { prop: 'phone', label: '电话', width: 150, align: 'center' },
    { prop: 'weixin', label: '微信', width: 150, align: 'center' },
    { prop: 'schoolName', label: '校区', width: 150, align: 'center' },
    { prop: 'affiliatedUserName', label: '所属人 / 合作老师', width: 150, align: 'center' },
    { prop: 'courseNames', label: '课程', width: 150, align: 'center' },
    { prop: 'address', label: '地区', width: 150, align: 'center' },
    { prop: 'processStatus', label: '跟进状态', width: 150, align: 'center', formatter: (row) => row.processStatus === 1 ? "未成单" : row.processStatus === 2 ? "已成单" : "" },
    { prop: 'appointDate', label: '预约日期', width: 150, align: 'center' },
    { prop: 'nextTalkDate', label: '下次沟通日期', width: 150, align: 'center' },
    { prop: 'cooperateTime', label: '成单时间', width: 150, align: 'center' },
    { prop: 'appointerName', label: '预约人', width: 150, align: 'center' },
    { prop: 'createdTime', label: '创建时间', width: 150, align: 'center' },
    { prop: 'fromSource', label: '渠道来源', width: 150, align: 'center', formatter: (row) => conventions.getFromSource(row.fromSource) },
    { prop: 'gender', label: '性别', width: 150, align: 'center', formatter: (row) => conventions.getGender(row.gender) },
    { prop: 'detailedInfo', label: '预约备注', width: 150, align: 'center' },
    { prop: 'createdTime', label: '创建时间', width: 150, align: 'center' },
]
const columns = ref(defaultColumns)
const page = reactive({
    index: 1,
    size: 10,
    total: 0,
})

const currClientStatus = ref(3);
const tableData = ref([]);
// 添加 loading 状态
const loading = ref(false);

const getClients = async () => {
    loading.value = true;
    try {
        const res = await request.post("/extra/getClients", {
            clientStatus: currClientStatus.value,
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

const switchClientStatus = async () => {
    if (currClientStatus.value === 3) {
        currClientStatus.value = 4;
        columns.value = secondColumns;
    } else {
        currClientStatus.value = 3;
        columns.value = defaultColumns;
    }
    await getClients();
}

const changePage = async (val: number) => {
    if (loading.value) return; // 如果正在加载，则不执行
    page.index = val;
    await getClients();
};

// 编辑弹窗相关
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
    const { clientStatus, affiliatedappointerId, createdappointerId, createdTime, affiliatedUserName, ...rest } = row;
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

// 在 data 部分修改
const assignDialogVisible = ref(false);

// 修改表单数据结构
const assignForm = ref({
    schoolId: '',
    appointerId: '',
    appointDate: '',
    courseIds: [],
    nextTalkDate: '',
    detailedInfo: ''
});

const branchOptions = ref([]);
const appointerOptions = ref([]);
const courseOptions = ref([]);

// 在 methods 部分添加
const handleReserve = async () => {
    if (!selectedRows.value.length) return;
    try {
        // 获取校区列表
        const branchRes = await request.post('/dept/getAllSchools', null, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });
        if (branchRes.data.status === 200) {
            branchOptions.value = branchRes.data.schools.map(item => ({
                label: item.name,
                value: item.id
            }));
        }
        assignDialogVisible.value = true;
    } catch (error) {
        console.error('获取校区列表失败:', error);
        ElMessage.error('获取校区列表失败');
    }
};


// 修改 handleBranchChange 函数
const handleBranchChange = async (schoolId) => {
    assignForm.value.appointerId = '';
    assignForm.value.courseIds = [];
    assignForm.value.nextTalkDate = '';
    assignForm.value.detailedInfo = '';
    try {
        // 获取该校区的老师列表
        const userRes = await request.post('/dept/getSchoolUsers', {
            schoolId
        }, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });
        if (userRes.data.status === 200) {
            appointerOptions.value = userRes.data.users.map(item => ({
                label: item.username,
                value: item.id
            }));
        }
        // 获取该校区的课程列表
        const courseRes = await request.post('/dept/getSchoolCourses', {
            schoolId
        }, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });
        if (courseRes.data.status === 200) {
            courseOptions.value = courseRes.data.courses.map(item => ({
                label: item.name,
                value: item.id
            }));
        } else {
            ElMessage.error('获取课程列表失败');
            console.log(courseRes.data);
        }
    } catch (error) {
        console.error('获取数据失败:', error);
        ElMessage.error('获取数据失败');
    }
};

const submitReserve = async () => {
    // 表单验证
    if (!assignForm.value.schoolId || !assignForm.value.appointerId || !assignForm.value.appointDate || !assignForm.value.courseIds) {
        ElMessage.warning('请填写必要信息');
        return;
    }
    try {
        const clientId = selectedRows.value.map(row => row.id)[0];
        const res = await request.post('/extra/submitReserve', {
            clientId,
            ...assignForm.value
        }, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });

        if (res.data.status === 200) {
            ElMessage.success('预约成功');
            assignDialogVisible.value = false;
            // 重置表单
            assignForm.value = {
                schoolId: '',
                appointerId: '',
                appointDate: '',
                courseIds: [],
                nextTalkDate: '',
                detailedInfo: ''
            };
            courseOptions.value = [];
            appointerOptions.value = [];
            // 刷新客户列表
            await getClients();
        } else {
            ElMessage.error(res.data.message || '预约失败');
        }
    } catch (error) {
        ElMessage.error('服务器繁忙，请稍后再试');
        console.log(error);
    }
};

const handleCancelReserve = async () => {

}

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
