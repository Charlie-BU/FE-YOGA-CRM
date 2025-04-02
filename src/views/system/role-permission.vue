<template>
    <div>
        <el-tree
            class="mgb10"
            ref="tree"
            :data="data"
            node-key="id"
            default-expand-all
            show-checkbox
            :default-checked-keys="checkedKeys"
        />
        <el-button type="primary" @click="onSubmit">保存权限</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElTree } from 'element-plus';
import { menuData } from '@/components/menu';

const props = defineProps({
    permissOptions: {
        type: Object,
        required: true,
    },
});

const menuObj = ref({});
// const data = menuData.map((item) => {
//     if (item.children) {
//         menuObj.value[item.id] = item.children.map((sub) => sub.id);
//     }
//     return {
//         id: item.id,
//         label: item.title,
//         children: item.children?.map((child) => {
//             return {
//                 id: child.id,
//                 label: child.title,
//             };
//         }),
//     };
// });

const getTreeData = (data) => {
    return data.map((item) => {
        const obj: any = {
            id: item.id,
            label: item.title,
        };
        if (item.children) {
            menuObj.value[item.id] = item.children.map((sub) => sub.id);
            obj.children = getTreeData(item.children);
        }
        return obj;
    });
};
const data = getTreeData(menuData);
// 修改 checkData 函数，使其返回所有权限 ID
const checkData = (data: string[]) => {
    // 获取所有节点的 ID
    const getAllIds = (menuItems: any[]): string[] => {
        let ids: string[] = [];
        menuItems.forEach(item => {
            ids.push(item.id);
            if (item.children) {
                ids = ids.concat(getAllIds(item.children));
            }
        });
        return ids;
    };
    return getAllIds(menuData);
};

// 获取当前权限
const checkedKeys = ref<string[]>(checkData(props.permissOptions.permiss));

// 保存权限
const tree = ref<InstanceType<typeof ElTree>>();
// 修改保存函数，直接返回所有权限
const onSubmit = () => {
    const allKeys = checkData([]);
    console.log(allKeys);
    // 这里可以直接调用保存 API，传入所有权限
};
</script>

<style scoped></style>
