// 侧边栏在这边改
import { Menus } from "@/types/menu";

// icon详见：https://element-plus.org/zh-CN/component/icon.html
export const menuData: Menus[] = [
    {
        id: "0",
        title: "系统首页",
        index: "/dashboard",
        icon: "HomeFilled"
    },
    {
        id: "01",
        title: "线索公海",
        index: "/clue-sea",
        icon: "Share"
    },
    {
        id: "01-1",
        title: "线索查找",
        index: "/clue-search",
        icon: "Search"
    },
    {
        id: "02",
        title: "客户管理",
        index: "/client-management",
        icon: "User"
    },
    {
        id: "03",
        title: "成单管理",
        index: "/deal-management",
        icon: "DocumentChecked"
    },
    {
        id: "04",
        title: "人员管理",
        index: "/user-management",
        icon: "UserFilled"
    },
    {
        id: "04-1",
        title: "职位与权限管理",
        index: "/vocation-management",
        icon: "Suitcase"
    },
    {
        id: "05",
        title: "组织管理",
        index: "/organ-management",
        icon: "OfficeBuilding"
    },
    {
        id: "06",
        title: "课程管理",
        index: "/course-management",
        icon: "Reading"
    },
    {
        id: "07",
        title: "费用管理",
        index: "/payment-management",
        icon: "Money"
    },
    {
        id: "08",
        title: "分班管理",
        index: "/class-arrangement",
        icon: "Management"
    },
    {
        id: "09",
        title: "宿舍管理",
        index: "/dorm-management",
        icon: "House"
    },
    {
        id: "010",
        title: "报表管理",
        index: "/report-management",
        icon: "Document",
        children: [
            {
                id: "010-1",
                pid: "1",
                index: "/transaction-detail",
                title: "收入支出明细表"
            },
            {
                id: "010-2",
                pid: "1",
                index: "/transaction-summary",
                title: "收入支出汇总表"
            },
            {
                id: "010-16",
                pid: "1",
                index: "/customer-service-summary",
                title: "客服总数据报表"
            },
            {
                id: "010-17",
                pid: "1",
                index: "/date-summary",
                title: "日期总数据报表"
            },
            {
                id: "010-12",
                pid: "1",
                index: "/customer-service-leads",
                title: "客服线索数据日报表"
            },
            {
                id: "010-14",
                pid: "1",
                index: "/customer-service-conversion",
                title: "客服转客户数据日报表"
            },
            {
                id: "010-10",
                pid: "1",
                index: "/customer-service-daily",
                title: "客服成交数据日报表"
            },
            {
                id: "010-9",
                pid: "1",
                index: "/staff-performance",
                title: "客服业绩明细表"
            }
        ]
    },
    {
        id: "011",
        title: "用户操作日志",
        index: "/logs",
        icon: "List"
    }

    // {
    //     id: "1",
    //     title: "系统管理",
    //     index: "1",
    //     icon: "HomeFilled",
    //     children: [
    //         {
    //             id: "11",
    //             pid: "1",
    //             index: "/system-user",
    //             title: "用户管理"
    //         },
    //         {
    //             id: "12",
    //             pid: "1",
    //             index: "/system-role",
    //             title: "角色管理"
    //         },
    //         {
    //             id: "13",
    //             pid: "1",
    //             index: "/system-menu",
    //             title: "菜单管理"
    //         }
    //     ]
    // },
    // {
    //     id: "2",
    //     title: "组件",
    //     index: "2-1",
    //     icon: "Calendar",
    //     children: [
    //         {
    //             id: "21",
    //             pid: "3",
    //             index: "/form",
    //             title: "表单"
    //         },
    //         {
    //             id: "22",
    //             pid: "3",
    //             index: "/upload",
    //             title: "上传"
    //         },
    //         {
    //             id: "23",
    //             pid: "2",
    //             index: "/carousel",
    //             title: "走马灯"
    //         },
    //         {
    //             id: "24",
    //             pid: "2",
    //             index: "/calendar",
    //             title: "日历"
    //         },
    //         {
    //             id: "25",
    //             pid: "2",
    //             index: "/watermark",
    //             title: "水印"
    //         },
    //         {
    //             id: "26",
    //             pid: "2",
    //             index: "/tour",
    //             title: "分布引导"
    //         },
    //         {
    //             id: "27",
    //             pid: "2",
    //             index: "/steps",
    //             title: "步骤条"
    //         },
    //         {
    //             id: "28",
    //             pid: "2",
    //             index: "/statistic",
    //             title: "统计"
    //         },
    //         {
    //             id: "29",
    //             pid: "3",
    //             index: "29",
    //             title: "三级菜单",
    //             children: [
    //                 {
    //                     id: "291",
    //                     pid: "29",
    //                     index: "/editor",
    //                     title: "富文本编辑器"
    //                 },
    //                 {
    //                     id: "292",
    //                     pid: "29",
    //                     index: "/markdown",
    //                     title: "markdown编辑器"
    //                 }
    //             ]
    //         }
    //     ]
    // },
    // {
    //     id: "3",
    //     title: "表格",
    //     index: "3",
    //     icon: "Calendar",
    //     children: [
    //         {
    //             id: "31",
    //             pid: "3",
    //             index: "/table",
    //             title: "基础表格"
    //         },
    //         {
    //             id: "32",
    //             pid: "3",
    //             index: "/table-editor",
    //             title: "可编辑表格"
    //         },
    //         {
    //             id: "33",
    //             pid: "3",
    //             index: "/import",
    //             title: "导入Excel"
    //         },
    //         {
    //             id: "34",
    //             pid: "3",
    //             index: "/export",
    //             title: "导出Excel"
    //         }
    //     ]
    // },
    // {
    //     id: "4",
    //     icon: "PieChart",
    //     index: "4",
    //     title: "图表",
    //     children: [
    //         {
    //             id: "41",
    //             pid: "4",
    //             index: "/schart",
    //             title: "schart图表"
    //         },
    //         {
    //             id: "42",
    //             pid: "4",
    //             index: "/echarts",
    //             title: "echarts图表"
    //         }
    //     ]
    // },
    // {
    //     id: "5",
    //     icon: "Guide",
    //     index: "/icon",
    //     title: "图标",
    //     permiss: "5"
    // },
    // {
    //     id: "7",
    //     icon: "Brush",
    //     index: "/theme",
    //     title: "主题"
    // },
    // {
    //     id: "6",
    //     icon: "DocumentAdd",
    //     index: "6",
    //     title: "附加页面",
    //     children: [
    //         {
    //             id: "61",
    //             pid: "6",
    //             index: "/ucenter",
    //             title: "个人中心"
    //         },
    //         {
    //             id: "62",
    //             pid: "6",
    //             index: "/login",
    //             title: "登录"
    //         },
    //         {
    //             id: "63",
    //             pid: "6",
    //             index: "/register",
    //             title: "注册"
    //         },
    //         {
    //             id: "64",
    //             pid: "6",
    //             index: "/reset-pwd",
    //             title: "重设密码"
    //         },
    //         {
    //             id: "65",
    //             pid: "6",
    //             index: "/403",
    //             title: "403"
    //         },
    //         {
    //             id: "66",
    //             pid: "6",
    //             index: "/404",
    //             title: "404"
    //         }
    //     ]
    // }
];

// export const menuDataSearchOnly: Menus[] = [
//     {
//         id: "01-1",
//         title: "线索查找",
//         index: "/clue-search",
//         icon: "Search"
//     }
// ];

export const visibleMap = {
    "0": [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
        51, 52
    ],
    "01": [5, 8, 9, 10, 16, 51],
    "01-1": [50],
    "02": [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 51, 52],
    "03": [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 51, 52],
    "04": [1, 2, 3, 4, 49],
    "04-1": [49],
    "05": [32, 33, 34, 35, 36, 37],
    "06": [21, 22, 23, 24, 25, 26],
    "07": [18, 19, 20],
    "08": [27, 28, 29, 30, 31],
    "09": [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
    // "010": [55, 56, 57, 58, 59, 60, 61, 62],
    // 细化报表
    "010-1": [55],
    "010-2": [56],
    "010-16": [57],
    "010-17": [58],
    "010-12": [59],
    "010-14": [60],
    "010-10": [61],
    "010-9": [62],
    "011": [54]
};

export const getVisibleMenus = (auth: number[]): Menus[] => {
    // 递归检查菜单项是否可见
    const checkMenuVisible = (menu: Menus): boolean => {
        // 检查当前菜单项的权限
        const requiredPermissions = visibleMap[menu.id];
        const hasPermission = requiredPermissions ? requiredPermissions.some((permId) => auth.includes(permId)) : true; // 如果没有定义权限要求，默认可见

        // 如果有子菜单，递归检查子菜单
        if (menu.children && menu.children.length > 0) {
            menu.children = menu.children.filter(checkMenuVisible);
            // 如果所有子菜单都不可见，则父菜单也不可见
            return menu.children.length > 0 && hasPermission;
        }

        return hasPermission;
    };

    // 过滤整个菜单树
    return menuData.filter(checkMenuVisible);
};
