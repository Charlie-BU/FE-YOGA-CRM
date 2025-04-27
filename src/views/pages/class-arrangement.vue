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

                        <el-table-column prop="chiefTeacherName" label="主讲教师" width="100" align="center"
                            show-overflow-tooltip />
                        <el-table-column prop="classTeacherName" label="班主任" width="100" align="center"
                            show-overflow-tooltip />
                        <el-table-column prop="teachingAssistantName" label="助教" width="100" align="center"
                            show-overflow-tooltip />
                        <el-table-column prop="studentCount" label="学员人数" width="100" align="center"
                            show-overflow-tooltip>
                            <template #default="scope">
                                <el-button link type="primary" @click="showStudents(scope.row)">
                                    {{ scope.row.studentCount || 0 }}
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column prop="graduatedStuNumber" label="毕业人数" width="100" align="center"
                            show-overflow-tooltip>
                            <template #default="scope">
                                <el-button link type="primary" @click="editGraduateNum(scope.row)">
                                    {{ scope.row.graduatedStuNumber || 0 }}
                                </el-button>
                            </template>
                        </el-table-column>

                        <el-table-column prop="createdTime" label="创建时间" width="180" align="center"
                            show-overflow-tooltip />

                        <!-- <el-table-column label="操作" width="180" fixed="right" align="center">
                            <template #default="scope">
                                <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                                <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                            </template>
                        </el-table-column> -->
                    </el-table>

                    <div class="pagination" style="margin-top: 20px; text-align: right;">
                        <el-pagination v-model:current-page="page.index" v-model:page-size="page.size"
                            :total="page.total" @current-change="changePage" @size-change="handleSizeChange"
                            :page-sizes="[10, 20, 50, 100]" layout="sizes, total, prev, pager, next">
                        </el-pagination>
                    </div>
                </div>
            </div>
        </div>

        <!-- 课程学员列表弹窗 -->
        <el-dialog title="课程学员列表" v-model="studentsDialogVisible" width="800px" @close="handleStudentsDialogClose">
            <div style="margin-bottom: 10px; text-align: right;">
                <el-button type="primary" @click="showAddStudentDialog">添加学员</el-button>
            </div>
            <el-table :data="currentStudents" style="width: 100%">
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column prop="name" label="姓名" width="120" align="center" show-overflow-tooltip />
                <el-table-column prop="gender" label="性别" align="center">
                    <template #default="scope">
                        {{ conventions.getGender(scope.row.gender) }}
                    </template>
                </el-table-column>
                <el-table-column prop="phone" label="电话" align="center" show-overflow-tooltip />
                <el-table-column prop="weixin" label="微信" align="center" show-overflow-tooltip />
                <el-table-column prop="cooperateTime" label="成单时间" width="180" align="center" show-overflow-tooltip />
                <el-table-column label="操作" width="100" fixed="right" align="center">
                    <template #default="scope">
                        <el-button size="small" type="danger" @click="handleRemoveStu(scope.row)">移除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <!-- 添加学员弹窗 -->
        <el-dialog title="添加学员" v-model="addStudentDialogVisible" width="600px">
            <el-form :model="addStudentForm" label-width="100px">
                <el-form-item label="选择学员">
                    <el-select v-model="addStudentForm.studentId" filterable placeholder="请选择学员" style="width: 100%">
                        <el-option v-for="student in availableStudents" :key="student.id"
                            :label="student.name + '（' + student.phone + '）'" :value="student.id" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="addStudentDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitAddStudent">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 编辑毕业人数弹窗 -->
        <el-dialog title="编辑毕业人数" v-model="graduateNumDialogVisible" width="400px">
            <el-form :model="graduateForm" label-width="100px">
                <el-form-item label="毕业人数">
                    <el-input-number v-model="graduateForm.graduatedStuNumber" :min="0" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="graduateNumDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitGraduateNum">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { handleRefresh } from '@/utils/index';
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
        if (schoolId) {
            Object.assign(params, { schoolId });
        }
        const res = await request.post("/course/getCourses", params, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });
        if (res.data.status === 200) {
            // 获取每个课程的学员人数
            const coursesWithStudents = await Promise.all(
                res.data.courses.map(async (course) => {
                    try {
                        const studentRes = await request.post("/course/getCourseClients", {
                            courseId: course.id
                        }, {
                            headers: { sessionid: localStorage.getItem("sessionid") }
                        });
                        return {
                            ...course,
                            studentCount: studentRes.data.total || 0,
                            students: studentRes.data.clients || []
                        };
                    } catch (error) {
                        console.error(`获取课程${course.id}的学员人数失败:`, error);
                        return {
                            ...course,
                            studentCount: 0,
                            students: []
                        };
                    }
                })
            );
            tableData.value = coursesWithStudents;
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

const handleSizeChange = async (val: number) => {
    page.size = val;
    await getCourses(currentSelectedSchoolId.value);
}

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
                    getCourses(currentSelectedSchoolId.value);
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

// 添加学员
const addStudentDialogVisible = ref(false);
const addStudentForm = ref({
    studentId: ''
});
const availableStudents = ref([]);

// 显示添加学员弹窗
const showAddStudentDialog = async () => {
    try {
        // 获取可选学员列表
        const res = await request.post("/extra/getDealedClients", {}, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });
        if (res.data.status === 200) {
            availableStudents.value = res.data.clients;
            addStudentDialogVisible.value = true;
        }
    } catch (error) {
        console.error('获取可选学员失败:', error);
        ElMessage.error('获取可选学员失败');
    }
};

// 提交添加学员
const submitAddStudent = async () => {
    if (!addStudentForm.value.studentId) {
        ElMessage.warning('请选择学员');
        return;
    }

    try {
        const res = await request.post('/course/addStudent', {
            courseId: currentCourseId.value,
            studentId: addStudentForm.value.studentId
        }, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });

        if (res.data.status === 200) {
            ElMessage.success('添加成功');
            // 关闭所有弹窗
            addStudentDialogVisible.value = false;
            studentsDialogVisible.value = false;
            // 重置表单
            addStudentForm.value.studentId = '';
            // 刷新课程列表
            getCourses(currentSelectedSchoolId.value);
        } else {
            ElMessage.error(res.data.message || '添加失败');
        }
    } catch (error) {
        console.error('添加失败:', error);
        ElMessage.error('添加失败');
    }
};

// 移除学员
const handleRemoveStu = (row) => {
    ElMessageBox.confirm(
        '确认将该学员移除该课程吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        try {
            const res = await request.post('/course/removeStudent', {
                stuId: row.id,
                courseId: currentCourseId.value
            }, {
                headers: { sessionid: localStorage.getItem("sessionid") }
            });
            if (res.data.status === 200) {
                ElMessage.success('移除成功');
                // 关闭学员列表弹窗
                studentsDialogVisible.value = false;
                getCourses(currentSelectedSchoolId.value);
            } else {
                ElMessage.error(res.data.message || '移除失败');
            }
        } catch (error) {
            console.error('移除失败:', error);
            ElMessage.error('移除失败');
        }
    });
};

const handleStudentsDialogClose = () => {
    currentCourseId.value = null;
};


const studentsDialogVisible = ref(false);
const currentStudents = ref([]);
const currentCourseId = ref(null);

const showStudents = async (row) => {
    try {
        // 使用 Promise.all 等待所有请求完成
        const students = await Promise.all(row.students.map(async (each) => {
            const res = await request.post("/extra/getClientById", {
                clientId: each.id
            }, {
                headers: { sessionid: localStorage.getItem("sessionid") }
            });
            return res.data.client;
        }));

        currentStudents.value = students;
        currentCourseId.value = row.id;
        studentsDialogVisible.value = true;
    } catch (error) {
        console.error('获取学员详情失败:', error);
        ElMessage.error('获取学员详情失败');
    }
};


const graduateNumDialogVisible = ref(false);
const graduateForm = ref({
    id: null,
    graduatedStuNumber: 0
});

const editGraduateNum = (row) => {
    graduateForm.value = {
        id: row.id,
        graduatedStuNumber: row.graduatedStuNumber || 0
    };
    graduateNumDialogVisible.value = true;
};

const submitGraduateNum = async () => {
    try {
        const res = await request.post('/course/updateGraduateNum', graduateForm.value, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });
        if (res.data.status === 200) {
            ElMessage.success('更新成功');
            graduateNumDialogVisible.value = false;
            getCourses(currentSelectedSchoolId.value);
        } else {
            ElMessage.error(res.data.message || '更新失败');
        }
    } catch (error) {
        console.error('更新失败:', error);
        ElMessage.error('更新失败');
    }
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
