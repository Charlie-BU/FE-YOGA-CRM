<template>
    <div>
        <div class="container">
            <div class="course-layout">
                <!-- 添加课程管理的树状结构 -->
                <div class="tree-container">
                    <el-tree :data="treeData" :props="{ label: 'name' }" @node-click="handleNodeClick"
                        default-expand-all highlight-current />
                </div>

                <div class="table-container">
                    <el-button type="warning" :icon="CirclePlusFilled" @click="editModelVisible = true">新增课程</el-button>
                    <!-- 原有的课程管理表格和弹窗 -->
                    <el-table :data="tableData" style="width: 100%; margin-top: 20px;" v-loading="loading">
                        <el-table-column type="index" label="序号" width="55" align="center">
                            <template #filter-icon="slotProps"></template>
                        </el-table-column>
                        <el-table-column prop="name" label="课程名称" width="150" align="center" show-overflow-tooltip />
                        <el-table-column prop="category" label="课程类别" width="100" align="center" show-overflow-tooltip>
                            <template #default="scope">
                                {{ conventions.getCourseCategory(scope.row.category) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="schoolName" label="所属校区" width="120" align="center"
                            show-overflow-tooltip />
                        <el-table-column prop="duration" label="课时" width="100" align="center" show-overflow-tooltip />
                        <el-table-column prop="price" label="价格" width="100" align="center" show-overflow-tooltip />
                        <el-table-column prop="chiefTeacherName" label="主讲教师" width="100" align="center"
                            show-overflow-tooltip />
                        <el-table-column prop="classTeacherName" label="班主任" width="100" align="center"
                            show-overflow-tooltip />
                        <el-table-column prop="teachingAssistantName" label="助教" width="100" align="center"
                            show-overflow-tooltip />
                        <el-table-column prop="info" label="备注" width="150" align="center" show-overflow-tooltip />
                        <el-table-column prop="creatorName" label="创建人" width="100" align="center"
                            show-overflow-tooltip />
                        <el-table-column prop="createdTime" label="创建时间" width="150" align="center"
                            show-overflow-tooltip />

                        <el-table-column label="操作" width="180" fixed="right" align="center">
                            <template #default="scope">
                                <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                                <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <div class="pagination" style="margin-top: 20px; text-align: right;">
                        <el-pagination v-model:current-page="page.index" v-model:page-size="page.size"
                            :total="page.total" @current-change="changePage" layout="total, prev, pager, next" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 课程编辑弹窗 -->
        <el-dialog :title="isEdit ? '编辑课程' : '新增课程'" v-model="editModelVisible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="课程名称" prop="name">
                            <el-input v-model="formData.name" placeholder="请输入课程名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="课程类别" prop="category">
                            <el-select v-model="formData.category" placeholder="请选择课程类别" style="width: 100%" filterable>
                                <el-option v-for="item in conventions.courseCategories" :key="item.id"
                                    :label="item.name" :value="item.id" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="所属校区" prop="schoolId">
                            <el-select v-model="formData.schoolId" placeholder="请选择校区" style="width: 100%"
                                @change="handleBranchChange" filterable>
                                <el-option v-for="item in schoolOptions" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="课时" prop="duration">
                            <el-input v-model="formData.duration" type="number" placeholder="请输入课时（周）" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="价格" prop="price">
                            <el-input v-model="formData.price" type="number" placeholder="请输入价格（元）" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="主讲教师" prop="chiefTeacherId">
                            <el-select v-model="formData.chiefTeacherId" placeholder="请选择主讲教师" style="width: 100%"
                                @change="handleTeacherChange('chief')" filterable>
                                <el-option v-for="item in teacherOptions" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="班主任" prop="classTeacherId">
                            <el-select v-model="formData.classTeacherId" placeholder="请选择班主任" style="width: 100%"
                                @change="handleTeacherChange('class')" filterable>
                                <el-option v-for="item in teacherOptions" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="助教" prop="teachingAssistantId">
                            <el-select v-model="formData.teachingAssistantId" placeholder="请选择助教" style="width: 100%"
                                @change="handleTeacherChange('assistant')" filterable>
                                <el-option v-for="item in teacherOptions" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="备注" prop="info">
                            <el-input v-model="formData.info" type="textarea" placeholder="请输入备注信息" />
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

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import * as conventions from '@/utils/conventions';
import request from '@/utils/request';

onMounted(async () => {
    try {
        await Promise.all([
            getSchools(),
            getCourses(),
        ]);
    } catch (error) {
        console.error('初始化数据失败:', error);
        ElMessage.error('初始化数据失败');
    }
});

// 校区树
const treeData = computed(() => {
    return [{
        id: '',
        name: '全部校区',
        children: schoolOptions.value.map(school => ({
            id: school.value,
            name: school.label
        }))
    }];
});

const currentSelectedSchoolId = ref(null);
// 添加树节点点击处理函数
const handleNodeClick = async (node) => {
    page.index = 1;
    currentSelectedSchoolId.value = node.id;
    await getCourses(node.id);
};


const loading = ref(false);
const page = reactive({
    index: 1,
    size: 10,
    total: 0,
});

const tableData = ref([]);
const editModelVisible = ref(false);
const isEdit = ref(false);
const formRef = ref();
// 修改表单数据的初始值
const formData = ref({
    name: '',
    category: undefined,
    schoolId: '',
    duration: '',
    price: '',
    chiefTeacherId: '',
    classTeacherId: '',
    teachingAssistantId: '',
    info: '',
});

const rules = {
    name: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
    category: [{ required: true, message: '请输入课程类别', trigger: 'blur' }],
    schoolId: [{ required: true, message: '请选择所属校区', trigger: 'change' }],
    duration: [{ required: true, message: '请输入课时（周）', trigger: 'blur' }],
    price: [{ required: true, message: '请输入价格（元）', trigger: 'blur' }],
    chiefTeacherId: [{ required: true, message: '请选择主讲教师', trigger: 'change' }],
};

const schoolOptions = ref([]);
const teacherOptions = ref([]);


// 获取课程列表
const getCourses = async (schoolId = null) => {
    loading.value = true;
    try {
        const params = {
            pageIndex: page.index,
            pageSize: page.size,
        };
        // 只有当 schoolId 有值时才添加到请求参数中
        if (schoolId) {
            Object.assign(params, { schoolId });
        }
        const res = await request.post("/course/getCourses", params, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });
        if (res.data.status === 200) {
            tableData.value = res.data.courses;
            page.total = res.data.total;
        }
    } catch (error) {
        console.error('获取课程列表失败:', error);
        ElMessage.error('获取课程列表失败');
    } finally {
        loading.value = false;
    }
};

// 获取校区列表
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

// 处理校区切换
const handleBranchChange = async (branchId) => {
    try {
        // 清空教师相关字段
        formData.value.chiefTeacherId = '';
        formData.value.classTeacherId = '';
        formData.value.teachingAssistantId = '';

        // 获取该分店的用户列表
        const userRes = await request.post('/dept/getSchoolUsers', {
            schoolId: branchId
        }, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });
        if (userRes.data.status === 200) {
            teacherOptions.value = userRes.data.users.map(item => ({
                label: item.username,
                value: item.id
            }));
        }
    } catch (error) {
        console.error('获取用户列表失败:', error);
        ElMessage.error('获取用户列表失败');
    }
};

// 获取教师列表
const getTeachers = async () => {
    try {
        const res = await request.post("/user/getTeachers", {}, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });
        if (res.data.status === 200) {
            teacherOptions.value = res.data.teachers.map(item => ({
                label: item.username,
                value: item.id
            }));
        }
    } catch (error) {
        console.error('获取教师列表失败:', error);
    }
};

// 处理教师选择
const handleTeacherChange = (type: 'chief' | 'class' | 'assistant') => {
    const teacher = teacherOptions.value.find(t => t.value === formData.value[`${type}TeacherId`]);
    if (teacher) {
        formData.value[`${type}TeacherName`] = teacher.label;
    }
};

const changePage = async (val: number) => {
    page.index = val;
    await getCourses(currentSelectedSchoolId.value);
};

// 修改清空表单的方法
const closeDialog = () => {
    editModelVisible.value = false;
    isEdit.value = false;
    formData.value = {
        name: '',
        category: undefined, // 修改为 undefined
        schoolId: '',
        duration: '',
        price: '',
        chiefTeacherId: '',
        classTeacherId: '',
        teachingAssistantId: '',
        info: '',
    };
    formRef.value?.resetFields();
};

const handleEdit = (row) => {
    formData.value = JSON.parse(JSON.stringify(row));
    isEdit.value = true;
    editModelVisible.value = true;
};

const handleDelete = (row) => {
    ElMessageBox.confirm(
        '确认删除该课程吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        try {
            const res = await request.post('/course/deleteCourse', {
                id: row.id
            }, {
                headers: { sessionid: localStorage.getItem("sessionid") }
            });
            if (res.data.status === 200) {
                ElMessage.success('删除成功');
                getCourses();
            } else {
                ElMessage.error(res.data.message || '删除失败');
            }
        } catch (error) {
            console.error('删除失败:', error);
            ElMessage.error('删除失败');
        }
    });
};

const submitForm = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const url = isEdit.value ? '/course/updateCourse' : '/course/addCourse';
                const res = await request.post(url, formData.value, {
                    headers: { sessionid: localStorage.getItem("sessionid") }
                });

                if (res.data.status === 200) {
                    ElMessage.success(isEdit.value ? '编辑成功' : '添加成功');
                    closeDialog();
                    getCourses();
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

.course-layout {
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

/* 修改表格单元格样式 */
.el-table :deep(.el-table__body-wrapper) {
    overflow-x: auto !important;
}

.el-table :deep(.cell) {
    white-space: nowrap;
}
</style>
