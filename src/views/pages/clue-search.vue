<template>
    <div>
        <div class="container">
            <el-input
                v-model="searchQuery"
                placeholder="请输入联系方式（微信号 / 电话 / QQ / 抖音号 / 小红书号 / 商务通）"
                style="width: 300px; margin-right: 10px"
                clearable
                @keyup.enter="handleSearch"
            />
            <el-button type="primary" :icon="Search" @click="handleSearch">查找</el-button>
            <el-button type="primary" :icon="Refresh" @click="handleRefresh">刷新</el-button>

            <el-table ref="tableRef" :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column prop="name" label="姓名" width="120" align="center">
                    <template #default="scope">
                        <span class="clickable-name" @click="showClientInfo(scope.row)">
                            {{ scope.row.name }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="phone" label="电话" align="center" />
                <el-table-column prop="weixin" label="微信" align="center" />
                <el-table-column prop="QQ" label="QQ" align="center" />
                <el-table-column prop="douyin" label="抖音" align="center" />
                <el-table-column prop="affiliatedUserName" label="所属人" align="center" />
                <el-table-column prop="createdTime" label="创建时间" width="150" align="center" />
                <!-- <el-table-column label="操作" width="220" fixed="right" align="center">
                    <template #default="scope">
                        <el-button size="small" type="success" @click="handleToClient(scope.row.id)">转客户</el-button>
                        <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                    </template>
                </el-table-column> -->
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
                />
            </div>
        </div>

        <!-- 客户信息卡弹窗 -->
        <ClientInfoCard v-model="clientInfoDialogVisible" :clientId="currentClient.id" />
    </div>
</template>

<script setup lang="ts" name="clue-search">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import { Search, Refresh } from "@element-plus/icons-vue";
import request from "@/utils/request";

// 搜索相关
const searchQuery = ref("");
const loading = ref(false);
const tableData = ref([]);

// 分页相关
const page = reactive({
    index: 1,
    size: 10,
    total: 0
});

// 客户信息相关
const clientInfoDialogVisible = ref(false);
const currentClient = reactive({
    id: ""
});

// 获取数据
const getClients = async () => {
    if (loading.value) return;
    loading.value = true;
    try {
        const res = await request.post(
            "/extra/searchClient",
            {
                contact: searchQuery.value,
                pageIndex: page.index,
                pageSize: page.size
            },
            {
                headers: {
                    sessionid: localStorage.getItem("sessionid")
                }
            }
        );

        if (res.data.status === 200) {
            tableData.value = res.data.clients;
            page.total = res.data.total;
        } else {
            ElMessage.error(res.data.message || "获取数据失败");
        }
    } catch (error) {
        console.error("获取数据失败:", error);
        ElMessage.error("获取数据失败");
    } finally {
        loading.value = false;
    }
};

// 搜索处理
const handleSearch = () => {
    page.index = 1;
    getClients();
};

// 刷新处理
const handleRefresh = () => {
    if (loading.value) return;
    getClients();
};

// 分页处理
const changePage = async (val: number) => {
    if (loading.value) return;
    page.index = val;
    await getClients();
};

const handleSizeChange = async (val: number) => {
    if (loading.value) return;
    page.size = val;
    page.index = 1;
    await getClients();
};

// 客户信息展示
const showClientInfo = (row: any) => {
    currentClient.id = row.id;
    clientInfoDialogVisible.value = true;
};

// // 转客户处理
// const handleToClient = async (id?: string) => {
//     try {
//         const res = await request.post(
//             "/client/convert",
//             {
//                 id: id
//             },
//             {
//                 headers: {
//                     sessionid: localStorage.getItem("sessionid")
//                 }
//             }
//         );

//         if (res.data.status === 200) {
//             ElMessage.success("转换成功");
//             getClients();
//         } else {
//             ElMessage.error(res.data.message || "转换失败");
//         }
//     } catch (error) {
//         console.error("转换失败:", error);
//         ElMessage.error("转换失败");
//     }
// };

// // 编辑处理
// const handleEdit = (row: any) => {
//     // 实现编辑功能
//     console.log("编辑:", row);
// };
</script>

<style scoped>
.container {
    padding: 20px;
}

.clickable-name {
    color: #409eff;
    cursor: pointer;
}

.clickable-name:hover {
    text-decoration: underline;
}
</style>
