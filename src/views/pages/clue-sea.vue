<template>
    <div>
        <!-- <TableSearch :query="query" :options="searchOpt" :search="handleSearch" /> -->

        <div class="container">
            <el-button type="primary" :icon="Refresh" @click="handleRefresh">刷新</el-button>
            <el-button type="primary" :icon="Search" @click="showFilterDialog"> 筛选查询 </el-button>
            <el-button type="warning" :icon="Upload" @click="handleBatchImport">批量导入</el-button>
            <el-button type="warning" :icon="Download" @click="exportToExcel">导出</el-button>
            <el-button type="warning" :icon="CirclePlusFilled" @click="editModelVisible = true">新增</el-button>
            <el-button type="primary" :disabled="!selectedRows.length" @click="handleAssign">分配</el-button>
            <el-button type="danger" :disabled="!selectedRows.length" @click="handleUnassign">取消分配</el-button>
            <el-button type="success" :disabled="!selectedRows.length" @click="handleToClient">转客户</el-button>
            <div style="float: right">
                <el-tooltip effect="dark" content="列设置" placement="top">
                    <el-button type="primary" :icon="Setting" circle @click="columnSettingVisible = true"></el-button>
                </el-tooltip>
            </div>

            <el-table ref="tableRef" :data="tableData" style="width: 100%; margin-top: 10px" @selection-change="handleSelectionChange" @row-click="handleRowClick" v-loading="loading">
                <el-table-column type="selection" width="55" align="center" />
                <template v-for="item in displayColumns" :key="item.prop">
                    <el-table-column v-if="item.type === 'index'" :type="item.type" :label="item.label" :width="item.width" :align="item.align" show-overflow-tooltip />
                    <el-table-column v-else-if="item.prop === 'name'" :prop="item.prop" :label="item.label" :width="item.width" :align="item.align" show-overflow-tooltip fixed="left">
                        <template #default="scope">
                            <span class="clickable-name" @click.stop="showClientInfo(scope.row)">
                                {{ scope.row.name }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        v-else-if="item.prop === 'gender' || item.prop === 'age'"
                        :prop="item.prop"
                        :label="item.label"
                        :width="item.width"
                        :align="item.align"
                        :formatter="item.formatter"
                        show-overflow-tooltip
                    />

                    <el-table-column v-else :prop="item.prop" :label="item.label" :min-width="150" :width="item.width" :align="item.align" :formatter="item.formatter" show-overflow-tooltip />
                </template>

                <el-table-column label="操作" width="220" fixed="right" align="center">
                    <template #default="scope">
                        <el-button size="small" type="success" @click="handleToClient(scope.row.id)">转客户</el-button>

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
                    <template #default></template>
                </el-pagination>
            </div>
        </div>

        <!-- 添加列设置弹窗 -->
        <el-dialog title="列设置" v-model="columnSettingVisible" width="500px">
            <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
            <el-divider></el-divider>
            <el-checkbox-group v-model="checkedColumns" @change="handleCheckedColumnsChange">
                <el-checkbox v-for="col in columnOptions" :key="col.prop" :label="col.prop">{{ col.label }}</el-checkbox>
            </el-checkbox-group>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="columnSettingVisible = false">取消</el-button>
                    <el-button type="primary" @click="applyColumnSettings">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <el-dialog :title="isEdit ? '编辑' : '新增'" v-model="editModelVisible" width="700px" destroy-on-close :close-on-click-modal="false" @close="closeDialog">
            <el-form ref="formRef" :model="formData" :rules="rules" :label-width="options.labelWidth">
                <el-row :gutter="20">
                    <el-col v-for="(item, index) in options.list" :key="index" :span="options.span">
                        <el-form-item :label="item.label" :prop="item.prop" :rules="item.rules || (item.required ? [{ required: true, message: `请输入${item.label}`, trigger: 'blur' }] : [])">
                            <div v-if="item.prop === 'info'">
                                <el-select style="width: 100%; margin-bottom: 10px" placeholder="查看历史备注">
                                    <el-option v-for="(note, index) in currClientInfo || []" :key="index" :label="note" :value="note" />
                                </el-select>
                                <el-input v-model="formData[item.prop]" :type="item.inputType || 'text'" :placeholder="`新增${item.label}`" />
                            </div>

                            <el-input v-else-if="item.type === 'input'" v-model="formData[item.prop]" :type="item.inputType || 'text'" :placeholder="`请输入${item.label}`" />
                            <el-select v-else-if="item.type === 'select'" v-model="formData[item.prop]" :placeholder="`请选择${item.label}`" style="width: 100%" filterable>
                                <el-option v-for="opt in item.options" :key="opt.value" :label="opt.label" :value="opt.value" />
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

        <!-- 分配客户弹窗 -->
        <el-dialog title="分配客户" v-model="assignDialogVisible" width="500px" destroy-on-close>
            <el-form :model="assignForm" label-width="80px">
                <el-form-item label="选择分店">
                    <el-select v-model="assignForm.branchId" placeholder="请选择分店" style="width: 100%" @change="handleBranchChange" filterable>
                        <el-option v-for="item in branchOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="所属人">
                    <el-select v-model="assignForm.userId" placeholder="请选择所属人" style="width: 100%" filterable>
                        <el-option v-for="item in schoolTeacherOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="assignDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitAssign">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 添加批量导入弹窗 -->
        <el-dialog title="批量导入" v-model="importDialogVisible" width="500px" destroy-on-close>
            <div class="import-container">
                <div class="download-template">
                    <p>第一步：下载导入模板</p>
                    <el-button type="primary" @click="downloadTemplate">下载模板</el-button>
                </div>
                <div class="upload-file" style="margin-top: 20px">
                    <p>第二步：上传填写好的Excel文件</p>
                    <el-upload class="upload-demo" action="#" :auto-upload="false" :on-change="handleFileChange" :limit="1" accept=".xlsx,.xls">
                        <template #trigger>
                            <el-button type="primary">选择文件</el-button>
                        </template>
                        <template #tip>
                            <div class="el-upload__tip">只能上传 xlsx/xls 文件</div>
                        </template>
                    </el-upload>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="importDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleUpload" :loading="uploading">
                        {{ uploading ? "导入中..." : "开始导入" }}
                    </el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 添加筛选弹窗 -->
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
                                :multiple="item.multiple"
                                collapse-tags
                                collapse-tags-tooltip
                                filterable
                            >
                                <el-option v-for="opt in item.options" :key="opt.value" :label="opt.label" :value="opt.value" />
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

        <!-- 客户信息卡弹窗 -->
        <ClientInfoCard v-model="clientInfoDialogVisible" :clientId="currentClient.id" />
    </div>
</template>

<script setup lang="ts" name="system-user">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox, vLoading } from "element-plus";
import { CirclePlusFilled, Download, Upload, Setting, Search, Refresh } from "@element-plus/icons-vue";
import { User } from "@/types/user";
import request from "@/utils/request";
import * as conventions from "@/utils/conventions";
// import { handleRefresh } from "@/utils/index";
import * as XLSX from "xlsx";

onMounted(async () => {
    await getClients();
    initColumnSettings();
    await getAllUsers(); // 添加这一行
});

const handleRefresh = async () => {
    if (loading.value) return; // 如果正在加载，则不执行
    await getClients(); // 直接调用获取数据的方法
};

const userOptions = ref([]);

// 获取所有用户列表
const getAllUsers = async () => {
    try {
        const res = await request.post(
            "/user/getAllUsers",
            {},
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );
        if (res.data.status === 200) {
            userOptions.value = res.data.users.map((user) => ({
                label: user.schoolName + " - " + user.username,
                value: user.id
            }));
        }
    } catch (error) {
        console.error("获取用户列表失败:", error);
        ElMessage.error("获取用户列表失败");
    }
};

const handleSizeChange = async (val: number) => {
    if (loading.value) return; // 如果正在加载，则不执行
    page.size = val;
    page.index = 1; // 切换每页条数时，通常会重置为第一页
    await getClients();
};

// 筛选相关
// 添加筛选弹窗控制变量
const filterDialogVisible = ref(false);

// 添加显示筛选弹窗方法
const showFilterDialog = () => {
    filterDialogVisible.value = true;
};

const resetQuery = () => {
    Object.keys(query).forEach((key) => {
        if (["timeRange", "fromSource", "clientStatus", "creatorId", "affiliatedUserId"].includes(key)) {
            query[key] = []; // 重置多选数组
        } else {
            query[key] = "";
        }
    });
};
const query = reactive({
    name: "",
    fromSource: [], // 改为数组
    gender: "",
    age: "",
    IDNumber: "",
    phone: "",
    weixin: "",
    QQ: "",
    douyin: "",
    rednote: "",
    shangwutong: "",
    address: "",
    clientStatus: [], // 改为数组
    timeRange: [],
    creatorId: [], // 创建人ID数组
    affiliatedUserId: [] // 所属人/合作老师ID数组
});
const searchOpt = ref<any[]>([
    { type: "input", label: "姓名：", prop: "name" },
    {
        type: "select",
        label: "渠道来源：",
        prop: "fromSource",
        multiple: true, // 添加多选属性
        options: conventions.fromSources.map((item) => ({
            label: item.name,
            value: item.id
        }))
    },
    {
        type: "select",
        label: "性别：",
        prop: "gender",
        options: conventions.genders.map((item) => ({
            label: item.name,
            value: item.id
        }))
    },
    { type: "input", label: "年龄：", prop: "age" },
    { type: "input", label: "身份证：", prop: "IDNumber" },
    { type: "input", label: "电话：", prop: "phone" },
    { type: "input", label: "微信：", prop: "weixin" },
    { type: "input", label: "QQ：", prop: "QQ" },
    { type: "input", label: "抖音：", prop: "douyin" },
    { type: "input", label: "小红书：", prop: "rednote" },
    { type: "input", label: "商务通：", prop: "shangwutong" },
    { type: "input", label: "地区：", prop: "address" },
    {
        type: "select",
        label: "客户状态：",
        prop: "clientStatus",
        multiple: true, // 添加多选属性
        options: conventions.clientStatuses.map((item) => ({
            label: item.name,
            value: item.id
        }))
    },
    {
        type: "daterange",
        label: "创建时间：",
        prop: "timeRange",
        startPlaceholder: "开始日期",
        endPlaceholder: "结束日期"
    },
    {
        type: "select",
        label: "创建人：",
        prop: "creatorId",
        multiple: true,
        options: userOptions
    },
    {
        type: "select",
        label: "所属人：",
        prop: "affiliatedUserId",
        multiple: true,
        options: userOptions
    }
]);
const handleSearch = async () => {
    if (loading.value) return;
    filterDialogVisible.value = false;
    page.index = 1;
    await getClients();
};

// 表格相关
const allColumns = ref([
    { type: "index", label: "序号", width: 55, align: "center", prop: "index" },
    {
        prop: "name",
        label: "姓名",
        width: 150,
        align: "center",
        // 添加自定义渲染函数
        renderCell: (h, { row }) => {
            return h(
                "span",
                {
                    style: "color: #409EFF; cursor: pointer;",
                    onClick: (event) => {
                        event.stopPropagation();
                        showClientInfo(row);
                    }
                },
                row.name
            );
        }
    },
    { prop: "fromSource", label: "渠道来源", width: 150, align: "center", formatter: (row) => conventions.getFromSource(row.fromSource) },
    { prop: "gender", label: "性别", align: "center", formatter: (row) => conventions.getGender(row.gender) },
    { prop: "age", label: "年龄", align: "center" },
    { prop: "IDNumber", label: "身份证", align: "center", width: 180 },
    { prop: "phone", label: "电话", align: "center" },
    { prop: "weixin", label: "微信", align: "center" },
    { prop: "QQ", label: "QQ", align: "center" },
    { prop: "douyin", label: "抖音", align: "center" },
    { prop: "rednote", label: "小红书", align: "center" },
    { prop: "shangwutong", label: "商务通", align: "center" },
    { prop: "address", label: "地区", width: 120, align: "center" },
    { prop: "clientStatus", label: "客户状态", align: "center", formatter: (row) => conventions.getClientStatus(row.clientStatus) },
    { prop: "affiliatedUserName", label: "所属人 / 合作老师", width: 150, align: "center" },
    { prop: "creatorName", label: "创建人", align: "center" },
    { prop: "createdTime", label: "创建时间", width: 150, align: "center" },
    {
        prop: "info",
        label: "客户备注",
        width: 250,
        align: "center",
        formatter: (row) => (row.info ? [...row.info].reverse().join(" | ") : "")
    }
]);

// 列设置相关
const columnSettingVisible = ref(false);
const checkedColumns = ref([]);
const checkAll = ref(false);
const isIndeterminate = ref(true);

// 计算属性：列选项
const columnOptions = computed(() => {
    // 过滤掉序号和姓名列，这些列不允许隐藏
    return allColumns.value.filter((col) => col.prop !== "operator" && col.prop !== "index" && col.prop !== "name");
});

// 计算属性：显示的列
const displayColumns = computed(() => {
    // 始终显示序号和姓名列，加上用户选择的其他列
    const fixedColumns = allColumns.value.filter((col) => col.prop === "index" || col.prop === "name");
    const userSelectedColumns = allColumns.value.filter((col) => col.prop !== "index" && col.prop !== "name" && checkedColumns.value.includes(col.prop));
    return [...fixedColumns, ...userSelectedColumns];
});

// 初始化列设置
const initColumnSettings = () => {
    // 默认显示所有列，但不包括固定列（序号和姓名）
    const defaultColumns = allColumns.value.filter((col) => col.prop !== "index" && col.prop !== "name").map((col) => col.prop);

    checkedColumns.value = defaultColumns;
    updateCheckAllStatus();

    // 尝试从本地存储加载用户保存的列设置
    const savedColumns = localStorage.getItem("clueSeaColumns");
    if (savedColumns) {
        try {
            checkedColumns.value = JSON.parse(savedColumns);
            updateCheckAllStatus();
        } catch (e) {
            console.error("加载列设置失败:", e);
        }
    }
};

// 全选/取消全选
const handleCheckAllChange = (val) => {
    checkedColumns.value = val ? columnOptions.value.map((col) => col.prop) : [];
    isIndeterminate.value = false;
};

// 更新全选状态
const handleCheckedColumnsChange = (value) => {
    updateCheckAllStatus();
};

// 更新全选状态
const updateCheckAllStatus = () => {
    const checkedCount = checkedColumns.value.length;
    checkAll.value = checkedCount === columnOptions.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < columnOptions.value.length;
};

// 应用列设置
const applyColumnSettings = () => {
    // 确保至少选择了一列
    if (checkedColumns.value.length === 0) {
        ElMessage.warning("请至少选择一列");
        return;
    }

    // 保存到本地存储
    localStorage.setItem("clueSeaColumns", JSON.stringify(checkedColumns.value));
    columnSettingVisible.value = false;
    ElMessage.success("列设置已保存");
};

const page = reactive({
    index: 1,
    size: 10,
    total: 0
});

const tableData = ref([]);
// 添加 loading 状态
const loading = ref(false);

const getClients = async () => {
    loading.value = true;
    try {
        const res = await request.post(
            "/extra/getClueClients",
            {
                pageIndex: page.index,
                pageSize: page.size,
                ...query,
                startTime: query.timeRange?.[0] || "",
                endTime: query.timeRange?.[1] || ""
            },
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );
        if (res.data.status != 200) {
            return;
        }
        tableData.value = res.data.clients;
        page.total = res.data.total;
    } catch (error) {
        console.error("获取数据失败:", error);
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
    labelWidth: "100px",
    span: 12,
    list: [
        {
            type: "input",
            label: "姓名",
            prop: "name",
            required: true
        },
        {
            type: "select",
            label: "渠道来源",
            prop: "fromSource",
            required: true,
            options: conventions.fromSources.map((item) => ({
                label: item.name,
                value: item.id
            }))
        },
        {
            type: "select",
            label: "性别",
            prop: "gender",
            options: conventions.genders.map((item) => ({
                label: item.name,
                value: item.id
            }))
        },
        {
            type: "input",
            label: "年龄",
            prop: "age",
            inputType: "number"
        },
        { type: "input", label: "身份证", prop: "IDNumber" },
        { type: "input", label: "电话", prop: "phone" },
        { type: "input", label: "微信", prop: "weixin", required: true },
        { type: "input", label: "QQ", prop: "QQ" },
        { type: "input", label: "抖音", prop: "douyin" },
        { type: "input", label: "小红书", prop: "rednote" },
        { type: "input", label: "商务通", prop: "shangwutong" },
        { type: "input", label: "地区", prop: "address" },
        { type: "input", label: "客户备注", prop: "info" }
    ]
});

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

const currClientInfo = ref([]);
const handleEdit = (row) => {
    const { clientStatus, affiliatedappointerId, createdappointerId, createdTime, affiliatedUserName, info, ...rest } = row;
    formData.value = JSON.parse(JSON.stringify(rest));
    // formData.value["info"] = row.info ? row.info[row.info.length - 1] : '';
    if (row.info) {
        currClientInfo.value = row.info;
    }
    isEdit.value = true;
    editModelVisible.value = true;
};

// 添加表单提交方法
const submitForm = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const url = isEdit.value ? "/extra/updateClient" : "/extra/addClient";
                const res = await request.post(url, formData.value, {
                    headers: {
                        sessionid: localStorage.getItem("sessionid")
                    }
                });

                if (res.data.status === 200) {
                    ElMessage.success(isEdit.value ? "编辑成功" : "添加成功");
                    closeDialog();
                    getClients();
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

// 删除相关
const handleDelete = (row: User) => {
    ElMessageBox.confirm("确认删除该客户吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    })
        .then(async () => {
            try {
                const res = await request.post(
                    "/extra/deleteClient",
                    {
                        id: row.id
                    },
                    {
                        headers: {
                            sessionid: localStorage.getItem("sessionid")
                        }
                    }
                );
                if (res.data.status === 200) {
                    ElMessage.success("删除成功");
                    getClients();
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

// 选择相关
const selectedRows = ref<any[]>([]);

const handleSelectionChange = (rows: any[]) => {
    selectedRows.value = rows;
};

// 在 data 部分添加
const assignDialogVisible = ref(false);
const assignForm = ref({
    branchId: "",
    userId: ""
});
const branchOptions = ref([]);
const schoolTeacherOptions = ref([]);

// 在 methods 部分添加
const handleAssign = async () => {
    if (!selectedRows.value.length) return;

    try {
        // 获取分店列表
        const branchRes = await request.post(
            "/dept/getAllSchools",
            {},
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );
        if (branchRes.data.status === 200) {
            branchOptions.value = branchRes.data.schools.map((item) => ({
                label: item.name,
                value: item.id
            }));
        }
        assignDialogVisible.value = true;
    } catch (error) {
        console.error("获取分店列表失败:", error);
        ElMessage.error("获取分店列表失败");
    }
};

const handleBranchChange = async (branchId) => {
    try {
        // 获取该分店的用户列表
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
            schoolTeacherOptions.value = userRes.data.users.map((item) => ({
                label: item.username,
                value: item.id
            }));
        }
    } catch (error) {
        console.error("获取用户列表失败:", error);
        ElMessage.error("获取用户列表失败");
    }
};

const submitAssign = async () => {
    if (!assignForm.value.branchId || !assignForm.value.userId) {
        ElMessage.warning("请选择分店和所属人");
        return;
    }

    try {
        const ids = selectedRows.value.map((row) => row.id);
        const res = await request.post(
            "/extra/assignClients",
            {
                ids,
                userId: assignForm.value.userId
            },
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );

        if (res.data.status === 200) {
            ElMessage.success("分配成功");
            assignDialogVisible.value = false;
            assignForm.value = { branchId: "", userId: "" };
            getClients();
        } else {
            ElMessage.error(res.data.message || "分配失败");
        }
    } catch (error) {
        console.error("分配失败:", error);
        ElMessage.error("分配失败");
    }
};

const handleUnassign = async () => {
    if (!selectedRows.value.length) return;

    ElMessageBox.confirm("确认取消分配选中的客户吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    })
        .then(async () => {
            try {
                const ids = selectedRows.value.map((row) => row.id);
                const res = await request.post(
                    "/extra/unassignClients",
                    {
                        ids: ids
                    },
                    {
                        headers: {
                            sessionid: localStorage.getItem("sessionid")
                        }
                    }
                );

                if (res.data.status === 200) {
                    ElMessage.success("取消分配成功");
                    getClients(); // 刷新列表
                } else {
                    ElMessage.error(res.data.message || "取消分配失败");
                }
            } catch (error) {
                console.error("取消分配失败:", error);
                ElMessage.error("取消分配失败");
            }
        })
        .catch(() => {
            // 取消操作
        });
};

const handleToClient = async (clientId) => {
    if (!clientId && !selectedRows.value.length) return;

    ElMessageBox.confirm("确认将选中的线索转为正式客户吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    })
        .then(async () => {
            try {
                let ids = selectedRows.value.map((row) => row.id);
                if (clientId) {
                    ids = [clientId];
                }
                const res = await request.post(
                    "/extra/convertToClients",
                    {
                        ids: ids
                    },
                    {
                        headers: {
                            sessionid: localStorage.getItem("sessionid")
                        }
                    }
                );

                if (res.data.status === 200) {
                    ElMessage.success("转客户成功");
                    await getClients(); // 刷新列表
                } else {
                    ElMessage.error(res.data.message || "转客户失败");
                }
            } catch (error) {
                console.error("转客户失败:", error);
                ElMessage.error("转客户失败");
            }
        })
        .catch(() => {
            // 取消操作
        });
};
const tableRef = ref();

const handleRowClick = (row) => {
    tableRef.value?.toggleRowSelection(row);
};

const exportToExcel = async () => {
    ElMessageBox.confirm("确认导出线索公海数据？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    })
        .then(async () => {
            try {
                loading.value = true;
                const res = await request.post(
                    "/extra/getClueClients",
                    {
                        pageIndex: 1,
                        pageSize: 99999,
                        name: query.name
                    },
                    {
                        headers: {
                            sessionid: localStorage.getItem("sessionid")
                        }
                    }
                );

                if (res.data.status === 200 && res.data.clients) {
                    const exportData = res.data.clients.map((item) => ({
                        姓名: item.name,
                        渠道来源: conventions.getFromSource(item.fromSource),
                        性别: conventions.getGender(item.gender),
                        年龄: item.age,
                        身份证: item.IDNumber,
                        电话: item.phone,
                        微信: item.weixin,
                        QQ: item.QQ,
                        抖音: item.douyin,
                        小红书: item.rednote,
                        商务通: item.shangwutong,
                        地区: item.address,
                        客户状态: conventions.getClientStatus(item.clientStatus),
                        "所属人/合作老师": item.affiliatedUserName,
                        创建时间: item.createdTime,
                        客户备注: item.info
                    }));

                    const wb = XLSX.utils.book_new();
                    const ws = XLSX.utils.json_to_sheet(exportData);
                    XLSX.utils.book_append_sheet(wb, ws, "线索公海数据");

                    const fileName = `线索公海数据_${new Date().toLocaleDateString()}.xlsx`;
                    XLSX.writeFile(wb, fileName);
                    ElMessage.success("导出成功");
                } else {
                    ElMessage.error("导出失败：没有数据");
                }
            } catch (error) {
                console.error("导出失败:", error);
                ElMessage.error("导出失败");
            } finally {
                loading.value = false;
            }
        })
        .catch(() => {
            // 用户取消导出操作
        });
};

// 批量导入相关
const importDialogVisible = ref(false);
const uploading = ref(false);
const importFile = ref(null);

const handleBatchImport = () => {
    importDialogVisible.value = true;
};

const downloadTemplate = () => {
    // 创建模板数据
    const template = [
        {
            "* 姓名": "张三（测试）",
            性别: "男",
            年龄: "18",
            身份证: "150201199939483744",
            电话: "15928372748",
            "* 微信": "weixin123456",
            QQ: "2893749278",
            抖音: "douyin123",
            小红书: "rednote123",
            商务通: "shangwutong123",
            地区: "上海市浦东新区",
            客户备注: "这是一条测试数据"
        }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(template);
    XLSX.utils.book_append_sheet(wb, ws, "线索导入模板");
    XLSX.writeFile(wb, "线索导入模板.xlsx");
};

const handleFileChange = (file) => {
    importFile.value = file.raw;
};

const handleUpload = async () => {
    if (!importFile.value) {
        ElMessage.warning("请选择要导入的文件");
        return;
    }

    uploading.value = true;
    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // 处理数据并上传
                const res = await request.post(
                    "/extra/batchImportClues",
                    {
                        clues: jsonData
                    },
                    {
                        headers: {
                            sessionid: localStorage.getItem("sessionid")
                        }
                    }
                );

                if (res.data.status === 200) {
                    ElMessage.success(res.data.message);
                    importDialogVisible.value = false;
                    getClients(); // 刷新列表
                } else {
                    ElMessage.error(res.data.message || "导入失败");
                }
            } catch (error) {
                console.error("处理文件失败:", error);
                ElMessage.error("处理文件失败");
            }
        };
        reader.readAsArrayBuffer(importFile.value);
    } catch (error) {
        console.error("导入失败:", error);
        ElMessage.error("导入失败");
    } finally {
        uploading.value = false;
    }
};

// 客户信息卡相关状态
const clientInfoDialogVisible = ref(false);
const currentClient = ref<any>({});
const showClientInfo = (client) => {
    currentClient.value = client;
    clientInfoDialogVisible.value = true;
};
</script>

<style scoped>
.el-table :deep(.cell) {
    white-space: nowrap;
}

.import-container {
    padding: 20px;
}

.download-template,
.upload-file {
    margin-bottom: 20px;
}

.download-template p,
.upload-file p {
    margin-bottom: 10px;
    font-weight: bold;
}

.table-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.el-checkbox-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

.toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.dialog-footer {
    text-align: right;
}

.clickable-name {
    color: #409eff;
    cursor: pointer;
}

.clickable-name:hover {
    text-decoration: underline;
}
</style>
