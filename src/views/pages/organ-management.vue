<template>
    <div>
        <el-tabs v-model="activeTab">

            <el-tab-pane label="校区管理" name="school">
                <div class="container">
                    <el-button type="warning" :icon="CirclePlusFilled" @click="handleAdd('school')">新增校区</el-button>
                    <el-table :data="schoolData" style="width: 100%; margin-top: 20px;" v-loading="loading.school">
                        <el-table-column type="index" label="序号" width="55" align="center" />
                        <el-table-column prop="name" label="校区名称" align="center" />
                        <el-table-column prop="address" label="校区地址" align="center" />
                        <el-table-column prop="info" label="备注" align="center" />
                        <el-table-column label="操作" width="180" fixed="right" align="center">
                            <template #default="scope">
                                <el-button size="small" type="primary"
                                    @click="handleEdit('school', scope.row)">编辑</el-button>
                                <el-button size="small" type="danger"
                                    @click="handleDelete('school', scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>
            <el-tab-pane label="部门管理" name="department">
                <div class="container">
                    <el-button type="warning" :icon="CirclePlusFilled" @click="handleAdd('department')">新增部门</el-button>
                    <el-table :data="departmentData" style="width: 100%; margin-top: 20px;"
                        v-loading="loading.department">
                        <el-table-column type="index" label="序号" width="55" align="center" />
                        <el-table-column prop="name" label="部门名称" align="center" />
                        <el-table-column prop="info" label="备注" align="center" />
                        <el-table-column label="操作" width="180" fixed="right" align="center">
                            <template #default="scope">
                                <el-button size="small" type="primary"
                                    @click="handleEdit('department', scope.row)">编辑</el-button>
                                <el-button size="small" type="danger"
                                    @click="handleDelete('department', scope.row)">删除</el-button>
                            </template>
                            <template #filter-icon="slotProps"></template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>

        </el-tabs>

        <!-- 部门编辑弹窗 -->
        <el-dialog :title="isEdit ? '编辑部门' : '新增部门'" v-model="departmentDialog" width="500px" destroy-on-close>
            <el-form ref="departmentFormRef" :model="departmentForm" :rules="departmentRules" label-width="100px">
                <el-form-item label="部门名称" prop="name">
                    <el-input v-model="departmentForm.name" placeholder="请输入部门名称" />
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="departmentForm.info" type="textarea" placeholder="请输入备注信息" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="departmentDialog = false">取消</el-button>
                    <el-button type="primary" @click="submitForm('department')">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 校区编辑弹窗 -->
        <el-dialog :title="isEdit ? '编辑校区' : '新增校区'" v-model="schoolDialog" width="500px" destroy-on-close>
            <el-form ref="schoolFormRef" :model="schoolForm" :rules="schoolRules" label-width="100px">
                <el-form-item label="校区名称" prop="name">
                    <el-input v-model="schoolForm.name" placeholder="请输入校区名称" />
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input v-model="schoolForm.address" placeholder="请输入校区地址" />
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="schoolForm.info" type="textarea" placeholder="请输入备注信息" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="schoolDialog = false">取消</el-button>
                    <el-button type="primary" @click="submitForm('school')">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import request from '@/utils/request';

const activeTab = ref('school');
const loading = reactive({
    department: false,
    school: false
});

// 部门相关数据
const departmentData = ref([]);
const departmentDialog = ref(false);
const departmentForm = ref({
    name: '',
    info: ''
});
const departmentRules = {
    name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
};
const departmentFormRef = ref();

// 校区相关数据
const schoolData = ref([]);
const schoolDialog = ref(false);
const schoolForm = ref({
    name: '',
    address: '',
    info: ''
});
const schoolRules = {
    name: [{ required: true, message: '请输入校区名称', trigger: 'blur' }],
    address: [{ required: true, message: '请输入校区地址', trigger: 'blur' }]
};
const schoolFormRef = ref();

// 公共数据
const isEdit = ref(false);

onMounted(async () => {
    await getDepartments();
    await getSchools();
    console.log(departmentData.value);
    console.log(schoolData.value);
});

// 获取部门列表
const getDepartments = async () => {
    loading.department = true;
    try {
        const res = await request.post("/dept/getAllDepts", {}, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });
        if (res.data.status === 200) {
            departmentData.value = res.data.depts;
        }
    } catch (error) {
        console.error('获取部门列表失败:', error);
        ElMessage.error('获取部门列表失败');
    } finally {
        loading.department = false;
    }
};

// 获取校区列表
const getSchools = async () => {
    loading.school = true;
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
    } finally {
        loading.school = false;
    }
};

// 新增
const handleAdd = (type: 'department' | 'school') => {
    isEdit.value = false;
    if (type === 'department') {
        departmentForm.value = { name: '', info: '' };
        departmentDialog.value = true;
    } else {
        schoolForm.value = { name: '', address: '', info: '' };
        schoolDialog.value = true;
    }
};

// 编辑
const handleEdit = (type: 'department' | 'school', row) => {
    isEdit.value = true;
    if (type === 'department') {
        departmentForm.value = JSON.parse(JSON.stringify(row));
        departmentDialog.value = true;
    } else {
        schoolForm.value = JSON.parse(JSON.stringify(row));
        schoolDialog.value = true;
    }
};

// 删除
const handleDelete = (type: 'department' | 'school', row) => {
    const title = type === 'department' ? '部门' : '校区';
    ElMessageBox.confirm(
        `确认删除该${title}吗？`,
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        try {
            const url = type === 'department' ? '/dept/deleteDept' : '/dept/deleteSchool';
            const res = await request.post(url, { id: row.id }, {
                headers: { sessionid: localStorage.getItem("sessionid") }
            });

            if (res.data.status === 200) {
                ElMessage.success('删除成功');
                if (type === 'department') {
                    await getDepartments();
                } else {
                    await getSchools();
                }
            } else {
                ElMessage.error(res.data.message || '删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            ElMessage.error('删除失败');
        }
    });
};

// 提交表单
const submitForm = async (type: 'department' | 'school') => {
    const formRef = type === 'department' ? departmentFormRef.value : schoolFormRef.value;
    if (!formRef) return;

    await formRef.validate(async (valid) => {
        if (valid) {
            try {
                const url = type === 'department'
                    ? (isEdit.value ? '/dept/updateDept' : '/dept/addDept')
                    : (isEdit.value ? '/dept/updateSchool' : '/dept/addSchool');

                const form = type === 'department' ? departmentForm.value : schoolForm.value;

                const res = await request.post(url, form, {
                    headers: { sessionid: localStorage.getItem("sessionid") }
                });

                if (res.data.status === 200) {
                    ElMessage.success(isEdit.value ? '编辑成功' : '添加成功');
                    if (type === 'department') {
                        departmentDialog.value = false;
                        await getDepartments();
                    } else {
                        schoolDialog.value = false;
                        await getSchools();
                    }
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
</script>

<style scoped>
.container {
    padding: 20px;
}

.el-table :deep(.cell) {
    white-space: nowrap;
}
</style>
