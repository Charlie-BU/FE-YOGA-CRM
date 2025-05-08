<template>
    <div>
        <div class="container">
            <div class="dorm-layout">
                <!-- 左侧校区树状结构 -->
                <div class="tree-container">
                    <el-tree :data="treeData" :props="{ label: 'name' }" @node-click="handleNodeClick" default-expand-all highlight-current />
                </div>

                <div class="table-container">
                    <el-button type="primary" :icon="Refresh" @click="handleRefresh">刷新</el-button>
                    <el-button type="primary" :icon="CirclePlusFilled" @click="editDormitoryVisible = true">新增公寓</el-button>
                    <!-- 公寓列表表格 -->
                    <el-table :data="dormitoryData" style="width: 100%; margin-top: 20px" v-loading="loading">
                        <el-table-column type="index" label="序号" width="55" align="center" />
                        <el-table-column prop="name" label="公寓名称" width="150" align="center" show-overflow-tooltip />
                        <el-table-column prop="category" label="类别" width="100" align="center">
                            <template #default="scope">
                                {{ conventions.getDormitoryCategory(scope.row.category) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="schoolName" label="所属校区" width="120" align="center" show-overflow-tooltip />
                        <el-table-column prop="roomCount" label="房间数" width="100" align="center" />

                        <el-table-column label="操作" width="300" fixed="right" align="center">
                            <template #default="scope">
                                <el-button size="small" type="primary" @click="handleEditDormitory(scope.row)">编辑</el-button>
                                <el-button size="small" type="success" @click="showRooms(scope.row)">查看房间</el-button>
                                <el-button size="small" type="danger" @click="handleDeleteDormitory(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <div class="pagination" style="margin-top: 20px; text-align: right">
                        <el-pagination
                            v-model:current-page="dormPage.index"
                            v-model:page-size="dormPage.size"
                            :total="dormPage.total"
                            @current-change="changeDormPage"
                            @size-change="changeDormPageSize"
                            :page-sizes="[10, 20, 50, 100]"
                            layout="sizes, total, prev, pager, next"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- 公寓编辑弹窗 -->
        <el-dialog :title="isEdit ? '编辑公寓' : '新增公寓'" v-model="editDormitoryVisible" width="500px" destroy-on-close :close-on-click-modal="false" @close="closeDormitoryDialog">
            <el-form ref="dormFormRef" :model="dormitoryForm" :rules="dormitoryRules" label-width="100px">
                <el-form-item label="公寓名称" prop="name">
                    <el-input v-model="dormitoryForm.name" placeholder="请输入公寓名称" />
                </el-form-item>
                <el-form-item label="类别" prop="category">
                    <el-select v-model="dormitoryForm.category" placeholder="请选择类别" style="width: 100%">
                        <el-option :label="'公寓'" :value="1" />
                        <el-option :label="'民房'" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="所属校区" prop="schoolId">
                    <el-select v-model="dormitoryForm.schoolId" placeholder="请选择校区" style="width: 100%" filterable>
                        <el-option v-for="item in schoolOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="closeDormitoryDialog">取消</el-button>
                    <el-button type="primary" @click="submitDormitoryForm">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 房间列表弹窗 -->
        <el-dialog title="房间列表" v-model="roomsDialogVisible" width="800px">
            <div style="margin-bottom: 20px; text-align: right">
                <el-button type="primary" @click="showAddRoomDialog">添加房间</el-button>
            </div>
            <el-table :data="roomsData" style="width: 100%">
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column prop="roomNumber" label="房间号" width="120" align="center" />
                <el-table-column prop="building" label="楼栋" width="120" align="center" show-overflow-tooltip>
                    <template #default="scope">
                        {{ scope.row.building || "-" }}
                    </template>
                </el-table-column>
                <el-table-column prop="maxBeds" label="最大床位数" width="100" align="center" />
                <el-table-column prop="occupiedBeds" label="已住床位" width="100" align="center" />
                <el-table-column label="操作" fixed="right" align="center">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleEditRoom(scope.row)">编辑</el-button>
                        <el-button size="small" type="success" @click="showBeds(scope.row)">查看床位</el-button>
                        <el-button size="small" type="danger" @click="handleDeleteRoom(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <!-- 房间编辑弹窗 -->
        <el-dialog :title="isEditRoom ? '编辑房间' : '添加房间'" v-model="editRoomVisible" width="500px" destroy-on-close :close-on-click-modal="false" @close="closeRoomDialog">
            <el-form ref="roomFormRef" :model="roomForm" :rules="roomRules" label-width="100px">
                <el-form-item label="房间号" prop="roomNumber">
                    <el-input v-model="roomForm.roomNumber" placeholder="请输入房间号" />
                </el-form-item>
                <el-form-item label="楼栋" prop="building">
                    <el-input v-model="roomForm.building" placeholder="请输入楼栋" />
                </el-form-item>
                <el-form-item label="最大床位数" prop="maxBeds">
                    <el-input-number v-model="roomForm.maxBeds" :min="0" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="closeRoomDialog">取消</el-button>
                    <el-button type="primary" @click="submitRoomForm">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 床位列表弹窗 -->
        <el-dialog title="床位列表" v-model="bedsDialogVisible" width="1000px">
            <div style="margin-bottom: 20px; text-align: right">
                <el-button type="primary" @click="showAddBedDialog">添加床位</el-button>
            </div>
            <el-table :data="bedsData" style="width: 100%">
                <!-- <el-table-column type="index" label="序号" width="55" align="center" /> -->
                <el-table-column prop="bedNumber" label="床号" width="100" align="center" />
                <el-table-column prop="category" label="类型" width="120" align="center">
                    <template #default="scope">
                        {{ conventions.getBedCategory(scope.row.category) }}
                    </template>
                </el-table-column>
                <el-table-column prop="duration" label="时限（周）" width="120" align="center" />
                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template #default="scope">
                        {{ scope.row.isVacant ? "空闲" : "已住" }}
                    </template>
                </el-table-column>
                <el-table-column prop="studentName" label="住宿学员" width="120" align="center">
                    <template #default="scope">
                        <el-tooltip v-if="isOverdue(scope.row)" effect="dark" content="该学员已超过住宿时限" placement="top">
                            <span :style="{ color: isOverdue(scope.row) ? '#ff4949' : '' }">
                                {{ scope.row.studentName || "-" }}
                            </span>
                        </el-tooltip>
                        <span v-else>{{ scope.row.studentName || "-" }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="bedCheckInDate" label="入住时间" width="120" align="center">
                    <template #default="scope">
                        <el-tooltip v-if="isOverdue(scope.row)" effect="dark" :content="`已超期${getOverdueDays(scope.row)}天`" placement="top">
                            <span :style="{ color: isOverdue(scope.row) ? '#ff4949' : '' }">
                                {{ scope.row.bedCheckInDate || "-" }}
                            </span>
                        </el-tooltip>
                        <span v-else>{{ scope.row.bedCheckInDate || "-" }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="250" fixed="right" align="center">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleEditBed(scope.row)">编辑</el-button>
                        <el-button v-if="scope.row.studentId" size="small" type="danger" @click="handleCheckOut(scope.row)">学员离住</el-button>
                        <el-button v-else size="small" type="success" @click="handleCheckIn(scope.row)">学员入住</el-button>
                        <el-button size="small" type="danger" @click="handleDeleteBed(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <!-- 床位编辑弹窗 -->
        <el-dialog :title="isEditBed ? '编辑床位' : '添加床位'" v-model="editBedVisible" width="500px" destroy-on-close :close-on-click-modal="false" @close="closeBedDialog">
            <el-form ref="bedFormRef" :model="bedForm" :rules="bedRules" label-width="100px">
                <el-form-item label="床号" prop="bedNumber">
                    <el-input-number v-model="bedForm.bedNumber" :min="1" />
                </el-form-item>
                <el-form-item label="类型" prop="category">
                    <el-select v-model="bedForm.category" placeholder="请选择床位类型" style="width: 100%">
                        <el-option :label="'单人床'" :value="1" />
                        <el-option :label="'上铺'" :value="2" />
                        <el-option :label="'下铺'" :value="3" />
                    </el-select>
                </el-form-item>
                <el-form-item label="时限（周）" prop="duration">
                    <el-input-number v-model="bedForm.duration" :min="1" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="closeBedDialog">取消</el-button>
                    <el-button type="primary" @click="submitBedForm">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 学员入住弹窗 -->
        <el-dialog title="学员入住" v-model="checkInDialogVisible" width="500px">
            <el-form ref="checkInFormRef" :model="checkInForm" :rules="checkInRules" label-width="100px">
                <el-form-item label="选择学员" prop="studentId">
                    <el-select v-model="checkInForm.studentId" placeholder="请选择学员" style="width: 100%" filterable>
                        <el-option v-for="item in studentOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="checkInDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitCheckIn">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 超期床位提示弹窗 -->
        <el-dialog title="超期床位提醒" v-model="overdueDialogVisible" width="700px" :modal="true" :close-on-click-modal="true" :close-on-press-escape="true" custom-class="overdue-dialog">
            <el-table :data="overdueBeds" style="width: 100%">
                <el-table-column prop="clientName" label="学员姓名" align="center" width="100" />
                <el-table-column prop="dormName" label="公寓名称" align="center" width="120" />
                <el-table-column prop="roomNumber" label="房间号" align="center" width="100" />
                <el-table-column prop="bedNumber" label="床号" align="center" width="80" />
                <el-table-column prop="bedCheckInDate" label="入住时间" align="center" width="120" />
                <el-table-column prop="overdueDays" label="超期天数" align="center">
                    <template #default="scope">
                        <span style="color: #ff4949">{{ scope.row.overdueDays }}天</span>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { CirclePlusFilled, Refresh } from "@element-plus/icons-vue";
import { handleRefresh } from "@/utils/index";
import * as conventions from "@/utils/conventions";
import request from "@/utils/request";

onMounted(async () => {
    try {
        await Promise.all([getSchools(), getDormitories(), getOverdueBeds()]);
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
    dormPage.index = 1;
    currentSelectedSchoolId.value = node.id;
    await getDormitories(node.id);
};

// 公寓相关
const loading = ref(false);
const dormPage = reactive({
    index: 1,
    size: 10,
    total: 0
});

const dormitoryData = ref([]);
const editDormitoryVisible = ref(false);
const isEdit = ref(false);
const dormFormRef = ref();
const dormitoryForm = ref({
    name: "",
    category: 1,
    schoolId: ""
});

const dormitoryRules = {
    name: [{ required: true, message: "请输入公寓名称", trigger: "blur" }],
    category: [{ required: true, message: "请选择类别", trigger: "change" }],
    schoolId: [{ required: true, message: "请选择所属校区", trigger: "change" }]
};

const schoolOptions = ref([]);

// 获取公寓列表
const getDormitories = async (schoolId = null) => {
    loading.value = true;
    try {
        const params = {
            pageIndex: dormPage.index,
            pageSize: dormPage.size
        };
        if (schoolId) {
            Object.assign(params, { schoolId });
        }
        const res = await request.post("/dorm/getDormitories", params, {
            headers: { sessionid: localStorage.getItem("sessionid") }
        });
        if (res.data.status === 200) {
            dormitoryData.value = res.data.dormitories;
            dormPage.total = res.data.total;
        }
    } catch (error) {
        console.error("获取公寓列表失败:", error);
        ElMessage.error("获取公寓列表失败");
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

const changeDormPage = async (val: number) => {
    dormPage.index = val;
    await getDormitories(currentSelectedSchoolId.value);
};

const changeDormPageSize = async (page) => {
    dormPage.size = page;
    await getDormitories(currentSelectedSchoolId.value);
};

// 清空公寓表单
const closeDormitoryDialog = () => {
    editDormitoryVisible.value = false;
    isEdit.value = false;
    dormitoryForm.value = {
        name: "",
        category: 1,
        schoolId: ""
    };
    dormFormRef.value?.resetFields();
};

const handleEditDormitory = (row) => {
    dormitoryForm.value = JSON.parse(JSON.stringify(row));
    isEdit.value = true;
    editDormitoryVisible.value = true;
};

const handleDeleteDormitory = (row) => {
    ElMessageBox.confirm("确认删除该公寓吗？这将同时删除所有关联的房间和床位！", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(async () => {
        try {
            const res = await request.post(
                "/dorm/deleteDormitory",
                {
                    id: row.id
                },
                {
                    headers: { sessionid: localStorage.getItem("sessionid") }
                }
            );
            if (res.data.status === 200) {
                ElMessage.success("删除成功");
                getDormitories(currentSelectedSchoolId.value);
            } else {
                ElMessage.error(res.data.message || "删除失败");
            }
        } catch (error) {
            console.error("删除失败:", error);
            ElMessage.error("删除失败");
        }
    });
};

const submitDormitoryForm = async () => {
    if (!dormFormRef.value) return;
    await dormFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const url = isEdit.value ? "/dorm/updateDormitory" : "/dorm/addDormitory";
                const res = await request.post(url, dormitoryForm.value, {
                    headers: { sessionid: localStorage.getItem("sessionid") }
                });

                if (res.data.status === 200) {
                    ElMessage.success(isEdit.value ? "编辑成功" : "添加成功");
                    closeDormitoryDialog();
                    getDormitories(currentSelectedSchoolId.value);
                } else {
                    ElMessage.error(res.data.message || "操作失败");
                }
            } catch (error) {
                console.error("提交失败:", error);
                ElMessage.error("操作失败");
            }
        }
    });
};

// 房间相关
const roomsDialogVisible = ref(false);
const roomsData = ref([]);
const currentDormitory = ref(null);

const showRooms = async (dormitory) => {
    currentDormitory.value = dormitory;
    try {
        const res = await request.post(
            "/dorm/getRooms",
            {
                dormitoryId: dormitory.id
            },
            {
                headers: { sessionid: localStorage.getItem("sessionid") }
            }
        );
        if (res.data.status === 200) {
            roomsData.value = res.data.rooms;
            roomsDialogVisible.value = true;
        }
    } catch (error) {
        console.error("获取房间列表失败:", error);
        ElMessage.error("获取房间列表失败");
    }
};

// 房间编辑
const editRoomVisible = ref(false);
const isEditRoom = ref(false);
const roomFormRef = ref();
const roomForm = ref({
    dormitoryId: "",
    roomNumber: "",
    building: "",
    maxBeds: 0
});

const roomRules = {
    roomNumber: [{ required: true, message: "请输入房间号", trigger: "blur" }],
    maxBeds: [{ required: true, message: "请输入最大床位数", trigger: "blur" }]
};

const showAddRoomDialog = () => {
    roomForm.value = {
        dormitoryId: currentDormitory.value.id,
        roomNumber: "",
        building: "",
        maxBeds: 0
    };
    isEditRoom.value = false;
    editRoomVisible.value = true;
};

const handleEditRoom = (row) => {
    roomForm.value = JSON.parse(JSON.stringify(row));
    isEditRoom.value = true;
    editRoomVisible.value = true;
};

const closeRoomDialog = () => {
    editRoomVisible.value = false;
    roomForm.value = {
        dormitoryId: "",
        roomNumber: "",
        building: "",
        maxBeds: 0
    };
    roomFormRef.value?.resetFields();
};

const submitRoomForm = async () => {
    if (!roomFormRef.value) return;
    await roomFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const url = isEditRoom.value ? "/dorm/updateRoom" : "/dorm/addRoom";
                const res = await request.post(url, roomForm.value, {
                    headers: { sessionid: localStorage.getItem("sessionid") }
                });

                if (res.data.status === 200) {
                    ElMessage.success(isEditRoom.value ? "编辑成功" : "添加成功");
                    editRoomVisible.value = false;
                    // 刷新房间列表
                    showRooms(currentDormitory.value);
                    // 刷新公寓列表
                    getDormitories(currentSelectedSchoolId.value);
                } else {
                    ElMessage.error(res.data.message || "操作失败");
                }
            } catch (error) {
                console.error("提交失败:", error);
                ElMessage.error("操作失败");
            }
        }
    });
};

const handleDeleteRoom = (row) => {
    ElMessageBox.confirm("确认删除该房间吗？这将同时删除所有关联的床位！", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(async () => {
        try {
            const res = await request.post(
                "/dorm/deleteRoom",
                {
                    id: row.id
                },
                {
                    headers: { sessionid: localStorage.getItem("sessionid") }
                }
            );
            if (res.data.status === 200) {
                ElMessage.success("删除成功");
                // 刷新房间列表
                showRooms(currentDormitory.value);
                // 刷新公寓列表
                getDormitories(currentSelectedSchoolId.value);
            } else {
                ElMessage.error(res.data.message || "删除失败");
            }
        } catch (error) {
            console.error("删除失败:", error);
            ElMessage.error("删除失败");
        }
    });
};

// 床位相关
const bedsDialogVisible = ref(false);
const bedsData = ref([]);
const currentRoom = ref(null);

const showBeds = async (room) => {
    currentRoom.value = room;
    try {
        const res = await request.post(
            "/dorm/getBeds",
            {
                roomId: room.id
            },
            {
                headers: { sessionid: localStorage.getItem("sessionid") }
            }
        );
        if (res.data.status === 200) {
            bedsData.value = res.data.beds;
            bedsDialogVisible.value = true;
        }
    } catch (error) {
        console.error("获取床位列表失败:", error);
        ElMessage.error("获取床位列表失败");
    }
};

// 床位编辑
const editBedVisible = ref(false);
const isEditBed = ref(false);
const bedFormRef = ref();
const bedForm = ref({
    roomId: "",
    bedNumber: 1,
    category: 1,
    duration: 16
});

const bedRules = {
    bedNumber: [{ required: true, message: "请输入床号", trigger: "blur" }],
    category: [{ required: true, message: "请选择床位类型", trigger: "change" }],
    duration: [{ required: true, message: "请输入时间期限", trigger: "blur" }]
};

const showAddBedDialog = () => {
    bedForm.value = {
        roomId: currentRoom.value.id,
        bedNumber: 1,
        category: 1,
        duration: 16
    };
    isEditBed.value = false;
    editBedVisible.value = true;
};

const handleEditBed = (row) => {
    bedForm.value = JSON.parse(JSON.stringify(row));
    isEditBed.value = true;
    editBedVisible.value = true;
};

const closeBedDialog = () => {
    editBedVisible.value = false;
    bedForm.value = {
        roomId: "",
        bedNumber: 1,
        category: 1,
        duration: 16
    };
    bedFormRef.value?.resetFields();
};

const submitBedForm = async () => {
    if (!bedFormRef.value) return;
    await bedFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const url = isEditBed.value ? "/dorm/updateBed" : "/dorm/addBed";
                const res = await request.post(url, bedForm.value, {
                    headers: { sessionid: localStorage.getItem("sessionid") }
                });

                if (res.data.status === 200) {
                    ElMessage.success(isEditBed.value ? "编辑成功" : "添加成功");
                    editBedVisible.value = false;
                    // 刷新床位列表
                    showBeds(currentRoom.value);
                    // 刷新房间列表
                    showRooms(currentDormitory.value);
                    // 刷新公寓列表
                    getDormitories(currentSelectedSchoolId.value);
                } else {
                    ElMessage.error(res.data.message || "操作失败");
                }
            } catch (error) {
                console.error("提交失败:", error);
                ElMessage.error("操作失败");
            }
        }
    });
};

const handleDeleteBed = (row) => {
    ElMessageBox.confirm("确认删除该床位吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(async () => {
        try {
            const res = await request.post(
                "/dorm/deleteBed",
                {
                    id: row.id
                },
                {
                    headers: { sessionid: localStorage.getItem("sessionid") }
                }
            );
            if (res.data.status === 200) {
                ElMessage.success("删除成功");
                // 刷新床位列表
                showBeds(currentRoom.value);
                // 刷新房间列表
                showRooms(currentDormitory.value);
                // 刷新公寓列表
                getDormitories(currentSelectedSchoolId.value);
            } else {
                ElMessage.error(res.data.message || "删除失败");
            }
        } catch (error) {
            console.error("删除失败:", error);
            ElMessage.error("删除失败");
        }
    });
};

// 学员入住相关
const checkInDialogVisible = ref(false);
const checkInFormRef = ref();
const checkInForm = ref({
    studentId: "",
    bedId: ""
});
const studentOptions = ref([]);
const currentBed = ref(null);

const checkInRules = {
    studentId: [{ required: true, message: "请选择学员", trigger: "change" }]
};

// 获取学员列表
const getStudents = async () => {
    try {
        const res = await request.post(
            "/dorm/getUncheckedDealedClients",
            {
                pageSize: 10000
            },
            {
                headers: { sessionid: localStorage.getItem("sessionid") }
            }
        );
        if (res.data.status === 200) {
            studentOptions.value = res.data.clients.map((item) => ({
                label: `${item.name} (${item.phone})`,
                value: item.id
            }));
        }
    } catch (error) {
        console.error("获取学员列表失败:", error);
        ElMessage.error("获取学员列表失败");
    }
};

const handleCheckIn = async (row) => {
    currentBed.value = row;
    checkInForm.value = {
        studentId: "",
        bedId: row.id
    };
    await getStudents();
    checkInDialogVisible.value = true;
};

const submitCheckIn = async () => {
    if (!checkInFormRef.value) return;
    await checkInFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const res = await request.post(
                    "/dorm/assignBed",
                    {
                        bedId: currentBed.value.id,
                        studentId: checkInForm.value.studentId
                    },
                    {
                        headers: { sessionid: localStorage.getItem("sessionid") }
                    }
                );

                if (res.data.status === 200) {
                    ElMessage.success("入住成功");
                    checkInDialogVisible.value = false;
                    // 刷新床位列表
                    showBeds(currentRoom.value);
                    // 刷新房间列表
                    showRooms(currentDormitory.value);
                    // 刷新公寓列表
                    getDormitories(currentSelectedSchoolId.value);
                } else {
                    ElMessage.error(res.data.message || "入住失败");
                }
            } catch (error) {
                console.error("入住失败:", error);
                ElMessage.error("入住失败");
            }
        }
    });
};

const handleCheckOut = (row) => {
    ElMessageBox.confirm("确认办理学员离住吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(async () => {
        try {
            const res = await request.post(
                "/dorm/checkOut",
                {
                    bedId: row.id,
                    studentId: null
                },
                {
                    headers: { sessionid: localStorage.getItem("sessionid") }
                }
            );
            if (res.data.status === 200) {
                ElMessage.success("离住成功");
                // 刷新床位列表
                showBeds(currentRoom.value);
                // 刷新房间列表
                showRooms(currentDormitory.value);
                // 刷新公寓列表
                getDormitories(currentSelectedSchoolId.value);
            } else {
                ElMessage.error(res.data.message || "离住失败");
            }
        } catch (error) {
            console.error("离住失败:", error);
            ElMessage.error("离住失败");
        }
    });
};
// 在 script setup 中添加以下函数
const isOverdue = (row) => {
    if (!row.bedCheckInDate || !row.duration) return false;

    const checkInDate = new Date(row.bedCheckInDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 将周数转换为天数进行比较
    return diffDays > row.duration * 7;
};
const getOverdueDays = (row) => {
    if (!row.bedCheckInDate || !row.duration) return 0;

    const checkInDate = new Date(row.bedCheckInDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const overdueDays = diffDays - row.duration * 7;

    return overdueDays > 0 ? overdueDays : 0;
};

// 超期床位相关
const overdueDialogVisible = ref(false);
const overdueBeds = ref([]);

// 获取超期床位信息
const getOverdueBeds = async () => {
    try {
        const res = await request.post(
            "/dorm/getOverdueBeds",
            {},
            {
                headers: { sessionid: localStorage.getItem("sessionid") }
            }
        );
        if (res.data.status === 200) {
            overdueBeds.value = res.data.result;
            overdueDialogVisible.value = overdueBeds.value.length > 0;
        }
    } catch (error) {
        console.error("获取超期床位信息失败:", error);
    }
};
</script>

<style scoped>
.container {
    padding: 20px;
}

.dorm-layout {
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

/* 超期提示弹窗样式 */
:deep(.overdue-dialog) {
    position: fixed !important;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0 !important;
}

:deep(.overdue-dialog .el-dialog__header) {
    background-color: #ff4949;
    margin: 0;
    padding: 10px 20px;
}

:deep(.overdue-dialog .el-dialog__title) {
    color: white;
    font-size: 16px;
}

:deep(.overdue-dialog .el-dialog__body) {
    padding: 10px;
}

:deep(.overdue-dialog .el-table) {
    --el-table-border-color: #dcdfe6;
    --el-table-header-bg-color: #f5f7fa;
}
</style>
