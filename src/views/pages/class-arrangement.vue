<template>
    <div>
        <div class="container">
            <div class="course-layout">
                <!-- 添加班级管理的树状结构 -->
                <div class="tree-container">
                    <el-tree :data="treeData" :props="{ label: 'name' }" @node-click="handleNodeClick" default-expand-all highlight-current />
                </div>

                <div class="table-container">
                    <el-button type="primary" :icon="Refresh" @click="handleRefresh">刷新</el-button>
                    <el-button type="primary" :icon="Search" @click="showFilterDialog">筛选查询</el-button>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="editModelVisible = true">新增</el-button>

                    <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
                        <el-table-column type="index" label="序号" width="55" align="center" />
                        <el-table-column prop="name" label="班级名称" width="150" align="center" show-overflow-tooltip />
                        <el-table-column prop="courseName" label="课程名称" width="150" align="center" show-overflow-tooltip />
                        <el-table-column prop="startDate" label="开课日期" width="120" align="center" show-overflow-tooltip />
                        <el-table-column prop="endDate" label="结课日期" width="120" align="center" show-overflow-tooltip />
                        <el-table-column prop="category" label="班级类别" width="100" align="center" show-overflow-tooltip>
                            <template #default="scope">
                                {{ conventions.getCourseCategory(scope.row.category) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="schoolName" label="所属校区" width="120" align="center" show-overflow-tooltip />

                        <el-table-column prop="chiefTeacherName" label="主讲教师" width="100" align="center" show-overflow-tooltip />
                        <el-table-column prop="classTeacherName" label="班主任" width="100" align="center" show-overflow-tooltip />
                        <el-table-column prop="teachingAssistantName" label="助教" width="100" align="center" show-overflow-tooltip />
                        <el-table-column prop="studentCount" label="学员人数" width="100" align="center" show-overflow-tooltip>
                            <template #default="scope">
                                <el-button link type="primary" @click="showStudents(scope.row)">
                                    {{ scope.row.studentCount || 0 }}
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column prop="graduatedStuNumber" label="毕业人数" width="100" align="center" show-overflow-tooltip>
                            <template #default="scope">
                                <el-button link type="primary" @click="editGraduateNum(scope.row)">
                                    {{ scope.row.graduatedStuNumber || 0 }}
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column prop="info" label="备注" width="120" align="center" show-overflow-tooltip />
                        <el-table-column prop="createdTime" label="创建时间" width="180" align="center" show-overflow-tooltip />

                        <el-table-column label="操作" width="180" fixed="right" align="center">
                            <template #default="scope">
                                <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                                <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <div class="pagination" style="margin-top: 20px; text-align: right">
                        <el-pagination
                            v-model:current-page="page.index"
                            v-model:page-size="page.size"
                            :total="page.total"
                            @current-change="changePage"
                            @size-change="handleSizeChange"
                            :page-sizes="[10, 20, 50, 100]"
                            layout="sizes, total, prev, pager, next"
                        >
                        </el-pagination>
                    </div>
                </div>
            </div>
        </div>

        <!-- 筛选弹窗 -->
        <el-dialog title="筛选条件" v-model="filterDialogVisible" width="800px">
            <el-form :model="query" label-width="100px">
                <el-row :gutter="20">
                    <el-col :span="12" v-for="(item, index) in searchOpt" :key="index">
                        <el-form-item :label="item.label">
                            <el-input v-if="item.type === 'input'" v-model="query[item.prop]" :placeholder="`请输入${item.label.replace('：', '')}`" clearable />
                            <el-select
                                v-else-if="item.type === 'select'"
                                v-model="query[item.prop]"
                                :placeholder="`请选择${item.label.replace('：', '')}`"
                                style="width: 100%"
                                clearable
                                collapse-tags
                                collapse-tags-tooltip
                                filterable
                            >
                                <el-option v-for="opt in <any>item.options" :key="opt.value" :label="opt.label" :value="opt.value" />
                            </el-select>
                            <el-date-picker
                                v-else-if="item.type === 'daterange'"
                                v-model="query[item.prop]"
                                type="daterange"
                                range-separator="至"
                                :start-placeholder="item.startPlaceholder"
                                :end-placeholder="item.endPlaceholder"
                                style="width: 100%"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="resetQuery">重置</el-button>
                    <el-button type="primary" @click="handleSearch">查询</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 班级学员列表弹窗 -->
        <el-dialog title="班级学员列表" v-model="studentsDialogVisible" width="800px" @close="handleStudentsDialogClose">
            <div style="margin-bottom: 10px; text-align: right">
                <el-button type="primary" @click="showAddStudentDialog">添加学员</el-button>
            </div>
            <el-table :data="currentStudents" style="width: 100%">
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column prop="name" label="姓名" width="120" align="center">
                    <template #default="scope">
                        <el-button link type="primary" @click.stop="showClientInfo(scope.row)" style="font-size: inherit; padding: 0">
                            {{ scope.row.name }}
                        </el-button>
                    </template>
                </el-table-column>
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
            <div class="tip-box" style="margin-bottom: 15px; color: #e6a23c; font-size: 14px">
                <el-alert title="提示：只有已成单且报名该班级课程的客户才可被添加为班级学员" type="warning" :closable="false" />
            </div>
            <el-form :model="addStudentForm" label-width="100px">
                <el-form-item label="选择学员">
                    <el-select v-model="addStudentForm.studentId" filterable placeholder="请选择学员" style="width: 100%">
                        <el-option v-for="student in availableStudents" :key="student.id" :label="student.name + '（' + student.phone + '）'" :value="student.id" />
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

        <!-- 新增 / 编辑弹窗 -->
        <el-dialog :title="isEdit ? '编辑班级' : '新增班级'" v-model="editModelVisible" width="700px" destroy-on-close :close-on-click-modal="false" @close="closeDialog">
            <el-form :model="formData" label-width="100px">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="* 班级名称" prop="name">
                            <el-input v-model="formData.name" placeholder="请输入班级名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="* 所属校区" prop="schoolId">
                            <el-select v-model="formData.schoolId" placeholder="请选择校区" style="width: 100%" @change="handleBranchChange" filterable>
                                <el-option v-for="item in schoolOptions" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="* 课程" prop="courseId">
                            <el-select v-model="formData.courseId" placeholder="请选择课程" style="width: 100%" filterable>
                                <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="* 开课日期" prop="startDate">
                            <el-date-picker v-model="formData.startDate" type="date" placeholder="请选择开课日期" style="width: 100%" value-format="YYYY-MM-DD" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="结课日期" prop="endDate">
                            <el-date-picker v-model="formData.endDate" type="date" placeholder="请选择结课日期" style="width: 100%" value-format="YYYY-MM-DD" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="* 主讲教师" prop="chiefTeacherId">
                            <el-select v-model="formData.chiefTeacherId" placeholder="请选择主讲教师" style="width: 100%" @change="(val) => handleTeacherChange('chief')" filterable>
                                <el-option v-for="item in teacherOptions" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="班主任" prop="classTeacherId">
                            <el-select v-model="formData.classTeacherId" placeholder="请选择班主任" style="width: 100%" @change="(val) => handleTeacherChange('class')" filterable>
                                <el-option v-for="item in teacherOptions" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="助教" prop="teachingAssistantName">
                            <el-input v-model="formData.teachingAssistantName" placeholder="请输入助教姓名" />
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

        <!-- 客户信息卡弹窗 -->
        <ClientInfoCard v-model="clientInfoDialogVisible" :clientId="currentClient.id" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh, CirclePlusFilled, Search } from "@element-plus/icons-vue";
import { handleRefresh } from "@/utils/index";
import * as conventions from "@/utils/conventions";
import request from "@/utils/request";
import ClientInfoCard from "@/components/client-info-card.vue";

onMounted(async () => {
    try {
        await Promise.all([getSchools(), getLessons()]);
    } catch (error) {
        console.error("初始化数据失败:", error);
        ElMessage.error("初始化数据失败");
    }
});

// 校区树
const treeData = computed(() => {
    return [
        {
            id: "",
            name: "全部校区",
            children: schoolOptions.value.map((school) => ({
                id: school.value,
                name: school.label
            }))
        }
    ];
});

const currentSelectedSchoolId = ref(null);
// 添加树节点点击处理函数
const handleNodeClick = async (node) => {
    page.index = 1;
    currentSelectedSchoolId.value = node.id;
    await getLessons(node.id);
};

const loading = ref(false);
const page = reactive({
    index: 1,
    size: 10,
    total: 0
});

const tableData = ref([]);
const editModelVisible = ref(false);
const isEdit = ref(false);
// 修改表单数据的初始值
const formData = ref({
    name: "",
    schoolId: "",
    courseId: "",
    startDate: "", // 新增开课日期字段
    endDate: "", // 新增结课日期字段
    duration: "",
    price: "",
    chiefTeacherId: "",
    classTeacherId: "",
    teachingAssistantName: "",
    info: ""
});

const schoolOptions = ref([]);
const courseOptions = ref([]);
const teacherOptions = ref([]);

// 获取班级列表
const getLessons = async (schoolId = null) => {
    try {
        loading.value = true;
        const params = {
            pageIndex: page.index,
            pageSize: page.size,
            startDate: "",
            endDate: "",
            ...query
        };
        if (schoolId) {
            Object.assign(params, { schoolId });
        }
        // 处理日期范围
        if (query.timeRange && query.timeRange.length === 2) {
            params.startDate = query.timeRange[0];
            params.endDate = query.timeRange[1];
        }
        delete params.timeRange;
        const res = await request.post("/course/getLessons", params, {
            headers: {
                sessionid: localStorage.getItem("sessionid")
            }
        });

        if (res.data.status === 200) {
            tableData.value = res.data.lessons;
            page.total = res.data.total;
        }
    } catch (error) {
        console.error("获取班级列表失败:", error);
        ElMessage.error("获取班级列表失败");
    } finally {
        loading.value = false;
    }
};

// 获取校区列表
const getSchools = async () => {
    try {
        const res = await request.post(
            "/dept/getAllSchools",
            {},
            {
                headers: { sessionid: localStorage.getItem("sessionid") }
            }
        );
        if (res.data.status === 200) {
            schoolOptions.value = res.data.schools.map((item) => ({
                label: item.name,
                value: item.id
            }));
        }
    } catch (error) {
        console.error("获取校区列表失败:", error);
    }
};

// 处理校区切换
const handleBranchChange = async (branchId) => {
    try {
        // 清空相关字段
        formData.value.courseId = "";
        formData.value.chiefTeacherId = "";
        formData.value.classTeacherId = "";
        formData.value.teachingAssistantName = "";
        // 获取该校区的课程列表
        const courseRes = await request.post(
            "/course/getCourses",
            {
                schoolId: branchId
            },
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );
        if (courseRes.data.status === 200) {
            courseOptions.value = courseRes.data.courses.map((item) => ({
                label: item.name,
                value: item.id
            }));
        }

        // 获取该校区的教师列表
        const userRes = await request.post(
            "/dept/getSchoolUsers",
            {
                schoolId: branchId
            },
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );
        if (userRes.data.status === 200) {
            teacherOptions.value = userRes.data.users.map((item) => ({
                label: item.username,
                value: item.id
            }));
        }
    } catch (error) {
        console.error("获取用户列表失败:", error);
        ElMessage.error("获取用户列表失败");
    }
};

// 获取教师列表
// const getTeachers = async () => {
//     try {
//         const res = await request.post("/user/getTeachers", {}, {
//             headers: { sessionid: localStorage.getItem("sessionid") }
//         });
//         if (res.data.status === 200) {
//             teacherOptions.value = res.data.teachers.map(item => ({
//                 label: item.username,
//                 value: item.id
//             }));
//         }
//     } catch (error) {
//         console.error('获取教师列表失败:', error);
//     }
// };

// 处理教师选择
const handleTeacherChange = (type: "chief" | "class" | "assistant") => {
    const teacher = teacherOptions.value.find((t) => t.value === formData.value[`${type}TeacherId`]);
    if (teacher) {
        formData.value[`${type}TeacherName`] = teacher.label;
    }
};

const changePage = async (val: number) => {
    page.index = val;
    await getLessons(currentSelectedSchoolId.value);
};

const handleSizeChange = async (val: number) => {
    page.size = val;
    await getLessons(currentSelectedSchoolId.value);
};

// 修改清空表单的方法
const closeDialog = () => {
    editModelVisible.value = false;
    isEdit.value = false;
    formData.value = {
        name: "",
        schoolId: "",
        courseId: "",
        startDate: "",
        endDate: "",
        duration: "",
        price: "",
        chiefTeacherId: "",
        classTeacherId: "",
        teachingAssistantName: "",
        info: ""
    };
};

const handleEdit = (row) => {
    formData.value = JSON.parse(JSON.stringify(row));
    isEdit.value = true;
    editModelVisible.value = true;
    // 触发校区变更，加载该校区的教师列表
    handleBranchChange(row.schoolId);
};

const handleDelete = (row) => {
    ElMessageBox.confirm("确认删除该班级吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    })
        .then(async () => {
            try {
                const res = await request.post(
                    "/course/deleteLesson",
                    {
                        id: row.id
                    },
                    {
                        headers: { sessionid: localStorage.getItem("sessionid") }
                    }
                );
                if (res.data.status === 200) {
                    ElMessage.success("删除成功");
                    getLessons(currentSelectedSchoolId.value);
                } else {
                    ElMessage.error(res.data.message || "删除失败");
                }
            } catch (error) {
                console.error("删除失败:", error);
                ElMessage.error("删除失败");
            }
        })
        .catch(() => {
            // 取消删除操作
        });
};

const submitForm = async () => {
    try {
        const url = isEdit.value ? "/course/updateLesson" : "/course/addLesson";
        const res = await request.post(url, formData.value, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });

        if (res.data.status === 200) {
            ElMessage.success(isEdit.value ? "编辑成功" : "添加成功");
            closeDialog();
            getLessons(currentSelectedSchoolId.value);
        } else {
            ElMessage.error(res.data.message || "操作失败");
        }
    } catch (error) {
        console.error("操作失败:", error);
        ElMessage.error("操作失败");
    }
};

// 添加学员
const addStudentDialogVisible = ref(false);
const addStudentForm = ref({
    studentId: ""
});
const availableStudents = ref([]);

// 显示添加学员弹窗
const showAddStudentDialog = async () => {
    try {
        // 获取可选学员列表
        const res = await request.post(
            "/course/getQualifiedStudents",
            {
                lessonCourseId: currentLessonCourseId.value
            },
            {
                headers: { sessionid: localStorage.getItem("sessionid") }
            }
        );
        if (res.data.status === 200) {
            availableStudents.value = res.data.clients;
            addStudentDialogVisible.value = true;
        }
    } catch (error) {
        console.error("获取可选学员失败:", error);
        ElMessage.error("获取可选学员失败");
    }
};

// 提交添加学员
const submitAddStudent = async () => {
    if (!addStudentForm.value.studentId) {
        ElMessage.warning("请选择学员");
        return;
    }

    try {
        const res = await request.post(
            "/course/addStudent",
            {
                courseId: currentLessonId.value,
                studentId: addStudentForm.value.studentId
            },
            {
                headers: { sessionid: localStorage.getItem("sessionid") }
            }
        );

        if (res.data.status === 200) {
            ElMessage.success("添加成功");
            // 关闭所有弹窗
            addStudentDialogVisible.value = false;
            studentsDialogVisible.value = false;
            // 重置表单
            addStudentForm.value.studentId = "";
            // 刷新班级列表
            getLessons(currentSelectedSchoolId.value);
        } else {
            ElMessage.error(res.data.message || "添加失败");
        }
    } catch (error) {
        console.error("添加失败:", error);
        ElMessage.error("添加失败");
    }
};

// 移除学员
const handleRemoveStu = (row) => {
    ElMessageBox.confirm("确认将该学员移除该班级吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(async () => {
        try {
            const res = await request.post(
                "/course/removeStudent",
                {
                    stuId: row.id,
                    lessonId: currentLessonId.value
                },
                {
                    headers: { sessionid: localStorage.getItem("sessionid") }
                }
            );
            if (res.data.status === 200) {
                ElMessage.success("移除成功");
                // 关闭学员列表弹窗
                studentsDialogVisible.value = false;
                getLessons(currentSelectedSchoolId.value);
            } else {
                ElMessage.error(res.data.message || "移除失败");
            }
        } catch (error) {
            console.error("移除失败:", error);
            ElMessage.error("移除失败");
        }
    });
};

const handleStudentsDialogClose = () => {
    currentLessonId.value = null;
    currentLessonCourseId.value = null;
};

const studentsDialogVisible = ref(false);
const currentStudents = ref([]);
const currentLessonId = ref(null);
const currentLessonCourseId = ref(null);

const showStudents = async (row) => {
    try {
        // 使用 Promise.all 等待所有请求完成
        const students = await Promise.all(
            row.students.map(async (each) => {
                const res = await request.post(
                    "/extra/getClassStudents",
                    {
                        stuId: each.id
                    },
                    {
                        headers: { sessionid: localStorage.getItem("sessionid") }
                    }
                );
                return res.data.stuInfo;
            })
        );

        currentStudents.value = students;
        currentLessonId.value = row.id;
        currentLessonCourseId.value = row.courseId;
        studentsDialogVisible.value = true;
    } catch (error) {
        console.error("获取学员详情失败:", error);
        ElMessage.error("获取学员详情失败");
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
        const res = await request.post("/course/updateGraduateNum", graduateForm.value, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });
        if (res.data.status === 200) {
            ElMessage.success("更新成功");
            graduateNumDialogVisible.value = false;
            getLessons(currentSelectedSchoolId.value);
        } else {
            ElMessage.error(res.data.message || "更新失败");
        }
    } catch (error) {
        console.error("更新失败:", error);
        ElMessage.error("更新失败");
    }
};

// 客户信息卡相关
const clientInfoDialogVisible = ref(false);
const currentClient = ref<any>({});

// 显示客户信息卡
const showClientInfo = (client) => {
    currentClient.value = { ...client };
    clientInfoDialogVisible.value = true;
};

// 添加筛选相关变量
const filterDialogVisible = ref(false);

const query = reactive({
    name: "", // 班级名称
    courseName: "", // 课程名称
    category: "", // 班级类别
    chiefTeacherName: "", // 主讲教师
    classTeacherName: "", // 班主任
    teachingAssistantName: "", // 助教
    timeRange: [] // 开课时间范围
});

const searchOpt = ref([
    { type: "input", label: "班级名称：", prop: "name" },
    { type: "input", label: "课程名称：", prop: "courseName" },
    {
        type: "select",
        label: "班级类别：",
        prop: "category",
        options: conventions.courseCategories.map((item) => ({
            label: item.name,
            value: item.id
        }))
    },
    { type: "input", label: "主讲教师：", prop: "chiefTeacherName" },
    { type: "input", label: "班主任：", prop: "classTeacherName" },
    { type: "input", label: "助教：", prop: "teachingAssistantName" },
    {
        type: "daterange",
        label: "开课时间：",
        prop: "timeRange",
        startPlaceholder: "开始日期",
        endPlaceholder: "结束日期"
    }
]);

// 显示筛选弹窗
const showFilterDialog = () => {
    filterDialogVisible.value = true;
};

// 重置查询条件
const resetQuery = () => {
    Object.keys(query).forEach((key) => {
        if (key === "timeRange") {
            query[key] = [];
        } else {
            query[key] = "";
        }
    });
};

// 处理查询
const handleSearch = async () => {
    if (loading.value) return;
    filterDialogVisible.value = false;
    page.index = 1;
    await getLessons();
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
