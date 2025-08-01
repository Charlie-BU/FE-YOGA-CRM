<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <el-button type="primary" :disabled="selectedRows.length !== 1" @click="handlePayment(1)">缴费</el-button>
            <el-button type="danger" :disabled="selectedRows.length !== 1" @click="handlePayment(2)">退费</el-button>
            <el-table ref="tableRef" :data="tableData" style="width: 100%; margin-top: 20px" @selection-change="handleSelectionChange" @row-click="handleRowClick" v-loading="loading">
                <el-table-column type="selection" width="55" align="center" />
                <template v-for="item in columns" :key="item.prop">
                    <el-table-column v-if="item.type === 'index'" :type="item.type" :label="item.label" :width="item.width" :align="item.align" show-overflow-tooltip />
                    <el-table-column v-else-if="item.slot" :prop="item.prop" :label="item.label" :width="item.width" :align="item.align" :formatter="item.formatter" show-overflow-tooltip>
                        <template #default="scope">
                            <span class="clickable-name" @click.stop="showClientInfo(scope.row)">
                                {{ scope.row[item.prop as keyof typeof scope.row] }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column v-else-if="item.prop === 'contractUrl'" :prop="item.prop" :label="item.label" :width="item.width" :align="item.align" show-overflow-tooltip>
                        <template #default="scope">
                            <a v-if="scope.row[item.prop]" class="clickable-name" :href="scope.row[item.prop]" target="_blank" @click.stop>
                                {{ utils.getFileNameFromOssUrl(scope.row[item.prop]) }}
                            </a>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>
                    <el-table-column v-else :prop="item.prop" :label="item.label" :width="item.width" :align="item.align" :formatter="item.formatter" show-overflow-tooltip />
                </template>
                <el-table-column label="操作" width="120" fixed="right" align="center">
                    <template #default="scope">
                        <el-button v-if="scope.row.clientStatus === 5" size="small" type="danger" @click="cancelGraduate(scope.row)">取消毕业</el-button>
                        <el-button v-else size="small" type="success" @click="clientGraduate(scope.row)">毕业</el-button>
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
                    :page-sizes="[5, 10, 20, 50, 100]"
                    layout="sizes, total, prev, pager, next"
                >
                    <template #default></template>
                </el-pagination>
            </div>
        </div>
        <!-- 客户信息卡弹窗 -->
        <ClientInfoCard v-model="clientInfoDialogVisible" :clientId="currentClient.id" />

        <!-- 缴费 / 退费弹窗 -->
        <el-dialog :title="paymentDialogVisible === 1 ? '缴费' : '退费'" v-if="paymentDialogVisible !== 0" v-model="paymentDialogVisible" width="500px" destroy-on-close>
            <el-form :model="paymentForm" label-width="120px">
                <el-form-item label="* 金额（元）:">
                    <el-input-number v-model="paymentForm.amount" :min="1" :max="999999" style="width: 100%" />
                </el-form-item>
                <el-form-item label="* 费用项目:">
                    <el-select v-model="paymentForm.category" placeholder="请选择费用项目" style="width: 100%" filterable>
                        <el-option v-for="item in conventions.paymentCategories" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="* 交易方式:">
                    <el-select v-model="paymentForm.paymentMethod" placeholder="请选择交易方式" style="width: 100%" filterable>
                        <el-option v-for="item in conventions.paymentMethods" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="负责老师:">
                    <!-- 默认当前用户 -->
                    <el-select v-model="paymentForm.teacherId" :placeholder="briefUserInfo?.username" disabled style="width: 100%">
                        <el-option :label="briefUserInfo?.username" :value="briefUserInfo?.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="客户备注:">
                    <el-input v-model="paymentForm.info" type="textarea" :rows="3" placeholder="请输入备注信息"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="paymentDialogVisible = 0">取消</el-button>
                    <el-button type="primary" @click="submitPayment(paymentDialogVisible)">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-user">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox, vLoading } from "element-plus";
import { Refresh } from "@element-plus/icons-vue"; // 添加Refresh图标
import request from "@/utils/request";
import TableSearch from "@/components/table-search.vue";
import { FormOptionList } from "@/types/form-option";
import * as conventions from "@/utils/conventions";
import ClientInfoCard from "@/components/client-info-card.vue";
import { loginCheck } from "@/utils/login-check"; // 添加loginCheck

import * as utils from "@/utils/index";

const briefUserInfo = ref(null); // 添加用户信息

onMounted(async () => {
    briefUserInfo.value = await loginCheck(); // 获取用户信息
    await getClients();
});

const handleSizeChange = async (val: number) => {
    if (loading.value) return; // 如果正在加载，则不执行
    page.size = val;
    page.index = 1; // 切换每页条数时，通常会重置为第一页
    await getClients();
};

// 查询相关
const query = reactive({
    name: ""
});
const searchOpt = ref<FormOptionList[]>([{ type: "input", label: "姓名：", prop: "name" }]);
const handleSearch = async () => {
    if (loading.value) return; // 如果正在加载，则不执行
    page.index = 1;
    await getClients();
};

// 表格相关
const columns = ref([
    { type: "index", label: "序号", width: 55, align: "center" },
    {
        prop: "name",
        label: "姓名",
        width: 150,
        align: "center",
        slot: true,
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
    { prop: "schoolName", label: "校区", width: 120, align: "center" },
    { prop: "affiliatedUserName", label: "所属人 / 合作老师", width: 150, align: "center" },
    { prop: "courseNames", label: "课程", align: "center", width: 200 },
    { prop: "address", label: "地区", width: 120, align: "center" },
    { prop: "processStatus", label: "客户状态", width: 120, align: "center", formatter: (row) => conventions.getClientStatus(row.clientStatus) },
    { prop: "cooperateTime", label: "成单时间", width: 150, align: "center" },
    {
        prop: "contractUrl",
        label: "合同",
        width: 150,
        align: "center"
    },
    { prop: "fromSource", label: "渠道来源", width: 150, align: "center", formatter: (row) => conventions.getFromSource(row.fromSource) },
    { prop: "info", label: "客户备注", width: 250, align: "center" }
]);
const page = reactive({
    index: 1,
    size: 5,
    total: 0
});

const tableData = ref([]);
// 添加 loading 状态
const loading = ref(false);

const getClients = async () => {
    loading.value = true;
    try {
        const res = await request.post(
            "/extra/getDealedClients",
            {
                pageIndex: page.index,
                pageSize: page.size,
                name: query.name // 只传递姓名查询参数
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

// 选择相关
const selectedRows = ref<any[]>([]);

const handleSelectionChange = (rows: any[]) => {
    selectedRows.value = rows;
};

const tableRef = ref();

const handleRowClick = (row) => {
    tableRef.value?.toggleRowSelection(row);
};

// 客户信息卡相关
const clientInfoDialogVisible = ref(false);
const currentClient = ref<any>({});

// 显示客户信息卡
const showClientInfo = (client) => {
    currentClient.value = { ...client };
    clientInfoDialogVisible.value = true;
};

const clientGraduate = (row) => {
    ElMessageBox.confirm("确认将该学员毕业吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    })
        .then(async () => {
            try {
                const res = await request.post(
                    "/extra/graduateClient",
                    {
                        id: row.id
                    },
                    {
                        headers: { sessionid: localStorage.getItem("sessionid") }
                    }
                );
                if (res.data.status === 200) {
                    ElMessage.success("操作成功");
                    await getClients();
                } else {
                    ElMessage.error(res.data.message || "操作失败");
                }
            } catch (error) {
                console.error("操作失败:", error);
                ElMessage.error("操作失败");
            }
        })
        .catch(() => {
            // 取消操作，不做任何处理
        });
};

const cancelGraduate = (row) => {
    ElMessageBox.confirm("确认取消该学员的毕业状态吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    })
        .then(async () => {
            try {
                const res = await request.post(
                    "/extra/cancelGraduate",
                    {
                        id: row.id
                    },
                    {
                        headers: { sessionid: localStorage.getItem("sessionid") }
                    }
                );
                if (res.data.status === 200) {
                    ElMessage.success("操作成功");
                    await getClients();
                } else {
                    ElMessage.error(res.data.message || "操作失败");
                }
            } catch (error) {
                console.error("操作失败:", error);
                ElMessage.error("操作失败");
            }
        })
        .catch(() => {
            // 取消操作，不做任何处理
        });
};

// 缴费相关
const paymentDialogVisible = ref(0);
const paymentForm = ref({
    teacherId: "",
    amount: 1000,
    paymentMethod: 1,
    category: 1,
    info: ""
});

const handlePayment = async (type: number = 1) => {
    if (!selectedRows.value.length) return;
    try {
        // 设置当前用户为负责老师
        paymentForm.value.teacherId = briefUserInfo.value.id;
        paymentDialogVisible.value = type;
    } catch (error) {
        console.error("操作失败:", error);
        ElMessage.error("操作失败");
    }
};

const submitPayment = async (type: number = 1) => {
    if (!paymentForm.value.amount || paymentForm.value.amount <= 0 || !paymentForm.value.paymentMethod) {
        ElMessage.warning("请填写必要信息");
        return;
    }
    if (type === 2) {
        paymentForm.value.amount = -paymentForm.value.amount;
    }
    try {
        const res = await request.post(
            "/extra/submitPayment",
            {
                clientId: selectedRows.value[0].id,
                ...paymentForm.value
            },
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );
        if (res.data.status === 200) {
            ElMessage.success(type === 1 ? "缴费成功" : "退费成功");
            paymentDialogVisible.value = 0;
            // 重置表单
            paymentForm.value = {
                teacherId: "",
                amount: 1000,
                category: 1,
                paymentMethod: 1,
                info: ""
            };
            await getClients();
        } else {
            ElMessage.error(res.data.message || "操作失败");
        }
    } catch (error) {
        console.error("操作失败:", error);
        ElMessage.error("操作失败");
    }
};
</script>

<style scoped>
.clickable-name {
    color: #409eff;
    cursor: pointer;
}

.clickable-name:hover {
    text-decoration: underline;
}

.el-table :deep(.cell) {
    white-space: nowrap;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
}
</style>
