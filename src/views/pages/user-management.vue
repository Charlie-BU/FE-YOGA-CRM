<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <div class="user-layout">
                <!-- 添加左侧树状结构 -->
                <div class="tree-container">
                    <el-tree :data="treeData" :props="{ label: 'name' }" @node-click="handleNodeClick"
                        default-expand-all highlight-current />
                </div>

                <!-- 右侧用户列表 -->
                <div class="table-container">
                    <el-button v-if="briefUserInfo?.usertype > 1" type="warning" :icon="CirclePlusFilled"
                        @click="router.push('/register')">添加用户</el-button>

                    <el-table ref="tableRef" :data="tableData" style="width: 100%; margin-top: 20px;"
                        @selection-change="handleSelectionChange" @row-click="handleRowClick" v-loading="loading">
                        <el-table-column v-for="col in columns" :key="col.prop || col.type" :type="col.type"
                            :label="col.label" :prop="col.prop" :width="col.width" :align="col.align"
                            :formatter="col.formatter" show-overflow-tooltip>
                        </el-table-column>
                        <el-table-column label="操作" width="260" fixed="right" align="center">
                            <template #default="scope">
                                <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                                <el-button size="small" type="warning"
                                    @click="handleInitPwd(scope.row)">初始化密码</el-button>
                                <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <div class="pagination" style="margin-top: 20px; text-align: right;">
                        <el-pagination v-model:current-page="page.index" v-model:page-size="page.size"
                            :total="page.total" @current-change="changePage" @size-change="handleSizeChange"
                            :page-sizes="[10, 20, 50, 100]" layout="sizes, total, prev, pager, next">
                            <template #default></template>
                        </el-pagination>
                    </div>
                </div>
            </div>
        </div>

        <!-- 编辑弹窗 -->
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
                                :placeholder="`请选择${item.label}`" style="width: 100%" filterable>
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
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, vLoading } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import { User } from '@/types/user';
import request from '@/utils/request';
import TableSearch from '@/components/table-search.vue';
import { FormOptionList } from '@/types/form-option';
import * as conventions from '@/utils/conventions';
import { loginCheck } from '@/utils/login-check';
import { useRouter } from 'vue-router';

const briefUserInfo = ref(null)

onMounted(async () => {
    briefUserInfo.value = await loginCheck();
    await getSchools(); // 先获取校区列表
    await getUsers(); // 再获取用户列表
});
const router = useRouter();


const handleSizeChange = async (val: number) => {
    if (loading.value) return; // 如果正在加载，则不执行
    page.size = val;
    page.index = 1; // 切换每页条数时，通常会重置为第一页
    await getUsers(selectedSchoolId.value);
};

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
    await getUsers();
};

// 表格相关
const columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'username', label: '姓名', align: 'center' },
    { prop: 'gender', label: '性别', align: 'center', formatter: (row) => conventions.getGender(row.gender) },
    { prop: 'phone', label: '电话', align: 'center' },
    { prop: 'address', label: '地址', align: 'center' },
    { prop: 'usertype', label: '用户类型', align: 'center', formatter: (row) => row.usertype === 1 ? '普通用户' : '管理员' },
    { prop: 'workNum', label: '工号', align: 'center' },
    { prop: 'schoolName', label: '校区', align: 'center' },
    { prop: 'departmentName', label: '部门', align: 'center' },
    { prop: 'vocation', label: '职位', align: 'center', formatter: (row) => conventions.getVocation(row.vocation) },
    { prop: 'status', label: '状态', align: 'center', formatter: (row) => row.status === 1 ? '在职' : '离职' }
])

const page = reactive({
    index: 1,
    size: 10,
    total: 0,
})

const tableData = ref([]);
// 添加 loading 状态
const loading = ref(false);

const getUsers = async (schoolId = null) => {
    loading.value = true;
    try {
        const params = {
            pageIndex: page.index,
            pageSize: page.size,
            name: query.name
        };
        // 只有当 schoolId 不为 null 时才添加到请求参数
        if (schoolId !== null) {
            Object.assign(params, { schoolId });
        }
        const res = await request.post("/user/getAllUsers", params, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });
        if (res.data.status != 200) {
            return;
        }
        tableData.value = res.data.users;
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
    await getUsers(selectedSchoolId.value);
};

// 编辑弹窗相关
const options = ref<any>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'input', label: '姓名', prop: 'username', required: true },
        {
            type: 'select',
            label: '性别',
            prop: 'gender',
            options: conventions.genders.map(item => ({
                label: item.name,
                value: item.id
            }))
        },
        { type: 'input', label: '电话', prop: 'phone', required: true },
        { type: 'input', label: '地址', prop: 'address' },
        { type: 'input', label: '工号', prop: 'workNum' },
        {
            type: 'select',
            label: '校区',
            prop: 'schoolId',
            options: []
        },
        {
            type: 'select',
            label: '部门',
            prop: 'departmentId',
            options: []
        },
        {
            type: 'select',
            label: '职位',
            prop: 'vocation',
            options: conventions.vocations.map(item => ({
                label: item.name,
                value: item.id
            }))
        },
        {
            type: 'select',
            label: '状态',
            prop: 'status',
            options: [
                { label: '在职', value: 1 },
                { label: '离职', value: 2 }
            ]
        }
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

const handleEdit = async (row) => {
    try {
        // 获取校区列表
        const schoolRes = await request.post('/dept/getAllSchools', null, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });
        if (schoolRes.data.status === 200) {
            options.value.list.find(item => item.prop === 'schoolId').options =
                schoolRes.data.schools.map(item => ({
                    label: item.name,
                    value: item.id
                }));
        }

        // 获取部门列表
        const deptRes = await request.post('/dept/getAllDepts', null, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });
        if (deptRes.data.status === 200) {
            options.value.list.find(item => item.prop === 'departmentId').options =
                deptRes.data.depts.map(item => ({
                    label: item.name,
                    value: item.id
                }));
        }
        console.log(options.value);
        formData.value = JSON.parse(JSON.stringify(row));
        isEdit.value = true;
        editModelVisible.value = true;
    } catch (error) {
        console.error('获取数据失败:', error);
        ElMessage.error('获取数据失败');
    }
};

// 修改表单提交方法
const submitForm = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const res = await request.post('/user/updateUser', formData.value, {
                    headers: {
                        sessionid: localStorage.getItem("sessionid")
                    }
                });

                if (res.data.status === 200) {
                    ElMessage.success('编辑成功');
                    closeDialog();
                    getUsers();
                } else {
                    ElMessage.error(res.data.message || '编辑失败');
                }
            } catch (error) {
                console.error('提交失败:', error);
                ElMessage.error('编辑失败');
            }
        }
    });
};

// 初始化密码相关
const handleInitPwd = async (row: User) => {
    ElMessageBox.confirm(
        '确认将该用户密码初始化为 12345 吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        try {
            const res = await request.post('/user/initUserPwd', {
                id: row.id
            }, {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            });
            if (res.data.status === 200) {
                ElMessage.success('初始化成功，初始密码为 12345');
                getUsers();
            } else {
                ElMessage.error(res.data.message || '密码初始化失败');
            }
        } catch (error) {
            console.error('密码初始化失败:', error);
            ElMessage.error('密码初始化失败');
        }
    }).catch(() => {
        // 取消
    });
}

// 删除相关 
const handleDelete = (row: User) => {
    ElMessageBox.confirm(
        '确认删除该用户吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        try {
            const res = await request.post('/user/deleteUser', {
                id: row.id
            }, {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            });
            if (res.data.status === 200) {
                ElMessage.success('删除成功');
                getUsers();
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


const tableRef = ref();

const handleRowClick = (row) => {
    tableRef.value?.toggleRowSelection(row);
};

// 添加树状结构相关数据
const selectedSchoolId = ref(null);
const schoolData = ref([]);

// 获取校区列表
const getSchools = async () => {
    try {
        const res = await request.post("/dept/getAllSchools", {}, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });
        if (res.data.status === 200) {
            schoolData.value = res.data.schools;
        }
    } catch (error) {
        console.error('获取校区列表失败:', error);
        ElMessage.error('获取校区列表失败');
    }
};

// 添加树形数据计算属性
const treeData = computed(() => {
    return [
        {
            id: '',
            name: '全部校区',
            children: schoolData.value.map(school => ({
                id: school.id,
                name: school.name
            }))
        }
    ];
});

// 添加树节点点击处理函数
const handleNodeClick = async (node) => {
    selectedSchoolId.value = node.id;
    page.index = 1;  // 重置页码
    await getUsers(node.id);
};
</script>

<style scoped>
.container {
    padding: 20px;
}

.user-layout {
    display: flex;
    gap: 20px;
}

.tree-container {
    width: 200px;
    padding: 10px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-container {
    flex: 1;
    overflow-x: auto;
}

.el-table :deep(.cell) {
    white-space: nowrap;
}
</style>
