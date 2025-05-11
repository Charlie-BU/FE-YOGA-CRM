<template>
    <div>
        <div class="container">
            <!-- <el-button type="primary" :icon="Refresh" @click="handleRefresh">刷新</el-button> -->
            <!-- <el-button type="warning" :icon="CirclePlusFilled" @click="handleAdd('school')">新增校区</el-button> -->
            <el-table :data="vocationData" style="width: 100%; margin-top: 20px">
                <el-table-column type="index" label="序号" width="55" align="center" />
                <el-table-column prop="name" label="职位" width="100" align="center" />
                <el-table-column
                    prop="authority"
                    label="权限"
                    align="center"
                    :formatter="
                        (row) => {
                            if (!row.authority) return '';
                            const authIds = row.authority;
                            return authorityOptions
                                .filter((auth) => authIds.includes(auth.id))
                                .map((auth) => auth.name)
                                .join(' | ');
                        }
                    "
                    show-overflow-tooltip
                />
                <el-table-column label="操作" width="180" fixed="right" align="center">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 编辑权限弹窗 -->
        <el-dialog v-model="dialogVisible" title="编辑权限" width="500px" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="80px">
                <el-form-item label="职位">
                    <el-input v-model="editForm.name" disabled />
                </el-form-item>
                <el-form-item label="权限">
                    <el-select v-model="editForm.authorities" multiple placeholder="请选择权限" style="width: 100%">
                        <el-option v-for="item in authorityOptions" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleSave">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { CirclePlusFilled, Refresh } from "@element-plus/icons-vue";
import { handleRefresh } from "@/utils/index";
import request from "@/utils/request";

onMounted(async () => {
    await Promise.all([getAllVocations(), getAllAuthorities()]);
});

const vocationData = ref(null);

// 获取职位列表
const getAllVocations = async () => {
    try {
        const res = await request.post(
            "/user/getAllVocations",
            {},
            {
                headers: { sessionid: localStorage.getItem("sessionid") }
            }
        );
        if (res.data.status === 200) {
            vocationData.value = res.data.vocations;
        }
    } catch (error) {
        console.error("数据获取失败:", error);
        ElMessage.error("数据获取失败");
    }
};

// 弹窗相关数据
const dialogVisible = ref(false);
const editForm = ref({
    id: "",
    name: "",
    authorities: []
});
const authorityOptions = ref([]);

// 获取所有权限
const getAllAuthorities = async () => {
    try {
        const res = await request.post(
            "/user/getAllAuthorities",
            {},
            {
                headers: { sessionid: localStorage.getItem("sessionid") }
            }
        );
        if (res.data.status === 200) {
            authorityOptions.value = res.data.authorities;
        } else {
            ElMessage.error(res.data.message || "获取权限列表失败");
        }
    } catch (error) {
        console.error("获取权限列表失败:", error);
        ElMessage.error("获取权限列表失败");
    }
};

// 编辑按钮点击事件
const handleEdit = async (row) => {
    editForm.value = {
        id: row.id,
        name: row.name,
        authorities: row.authority || []
    };
    dialogVisible.value = true;
};

// 保存编辑
const handleSave = async () => {
    try {
        const res = await request.post(
            "/user/updateVocationAuthority",
            {
                vocationId: editForm.value.id,
                authorities: editForm.value.authorities
            },
            {
                headers: { sessionid: localStorage.getItem("sessionid") }
            }
        );
        if (res.data.status === 200) {
            ElMessage.success("权限修改成功");
            dialogVisible.value = false;
            await getAllVocations(); // 刷新列表
        } else {
            ElMessage.error(res.data.message || "更新失败");
        }
    } catch (error) {
        console.error("更新失败:", error);
        ElMessage.error("更新失败");
    }
};
</script>

<style scoped>
.container {
    padding: 20px;
}

.department-layout {
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

.dialog-footer {
    text-align: right;
}
</style>
