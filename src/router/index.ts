// router路由在这边改
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
// import { usePermissStore } from "../store/permiss";
import Home from "../views/home.vue";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { loginCheck } from "@/utils/login-check";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        redirect: "/dashboard"
    },
    {
        path: "/",
        name: "Home",
        component: Home,
        children: [
            {
                path: "/dashboard",
                name: "dashboard",
                meta: {
                    title: "系统首页"
                },
                component: () => import(/* webpackChunkName: "dashboard" */ "../views/dashboard.vue")
            },
            {
                path: "/clue-sea",
                name: "clue-sea",
                meta: {
                    title: "线索公海"
                },
                component: () => import(/* webpackChunkName: "clue-sea" */ "../views/pages/clue-sea.vue")
            },
            {
                path: "/client-management",
                name: "client-management",
                meta: {
                    title: "客户管理"
                },
                component: () => import(/* webpackChunkName: "client-management" */ "../views/pages/client-management.vue")
            },
            {
                path: "/deal-management",
                name: "DealManagement",
                component: () => import("@/views/pages/deal-management.vue"),
                meta: {
                    title: "成单管理"
                }
            },
            {
                path: "/user-management",
                name: "user-management",
                meta: {
                    title: "人员管理"
                },
                component: () => import(/* webpackChunkName: "user-management" */ "../views/pages/user-management.vue")
            },
            {
                path: "/organ-management",
                name: "organ-management",
                meta: {
                    title: "组织管理"
                },
                component: () => import(/* webpackChunkName: "organ-management" */ "../views/pages/organ-management.vue")
            },
            {
                path: "/course-management",
                name: "course-management",
                meta: {
                    title: "课程管理"
                },
                component: () => import("../views/pages/course-management.vue")
            },
            {
                path: "/payment-management",
                name: "PaymentManagement",
                component: () => import("@/views/pages/payment-management.vue"),
                meta: {
                    title: "费用管理"
                }
            },
            {
                path: "/class-arrangement",
                name: "class-arrangement",
                meta: {
                    title: "分班管理"
                },
                component: () => import("../views/pages/class-arrangement.vue")
            },
            {
                path: "/dorm-management",
                name: "dorm-management",
                meta: {
                    title: "宿舍管理"
                },
                component: () => import("../views/pages/dorm-management.vue")
            },
            {
                path: "/transaction-detail",
                name: "transaction-detail",
                meta: {
                    title: "收入支出明细表"
                },
                component: () => import("../views/pages/reports/transaction-detail.vue")
            },
            {
                path: "/transaction-summary",
                name: "transaction-summary",
                meta: {
                    title: "收入支出汇总表"
                },
                component: () => import("../views/pages/reports/transaction-summary.vue")
            },
            {
                path: "/course-channel-stats",
                name: "course-channel-stats",
                meta: {
                    title: "课程按渠道分类统计表"
                },
                component: () => import("../views/pages/reports/course-channel-stats.vue")
            },
            {
                path: "/staff-channel-course",
                name: "staff-channel-course",
                meta: {
                    title: "业务员渠道课程预约统计表"
                },
                component: () => import("../views/pages/reports/staff-channel-course.vue")
            },
            {
                path: "/staff-performance",
                name: "staff-performance",
                meta: {
                    title: "客服业绩明细表"
                },
                component: () => import("../views/pages/reports/staff-performance.vue")
            },
            {
                path: "/customer-service-daily",
                name: "customer-service-daily",
                meta: {
                    title: "客服成交数据日报表"
                },
                component: () => import("../views/pages/reports/customer-service-daily.vue")
            },
            {
                path: "/customer-service-leads",
                name: "customer-service-leads",
                meta: {
                    title: "客服线索数据日报表"
                },
                component: () => import("../views/pages/reports/customer-service-leads.vue")
            },
            {
                path: "/customer-service-conversion",
                name: "customer-service-conversion",
                meta: {
                    title: "客服转客户数据日报表"
                },
                component: () => import("../views/pages/reports/customer-service-conversion.vue")
            },
            {
                path: "/customer-service-summary",
                name: "customer-service-summary",
                meta: {
                    title: "客服总数据报表"
                },
                component: () => import("../views/pages/reports/customer-service-summary.vue")
            },
            {
                path: "/date-summary",
                name: "date-summary",
                meta: {
                    title: "日期总数据报表"
                },
                component: () => import("../views/pages/reports/date-summary.vue")
            },
            {
                path: "/logs",
                name: "logs",
                meta: {
                    title: "用户操作日志"
                },
                component: () => import("../views/pages/logs.vue")
            },

            {
                path: "/system-user",
                name: "system-user",
                meta: {
                    title: "用户管理"
                },
                component: () => import(/* webpackChunkName: "system-user" */ "../views/system/user.vue")
            },
            {
                path: "/system-role",
                name: "system-role",
                meta: {
                    title: "角色管理"
                },
                component: () => import(/* webpackChunkName: "system-role" */ "../views/system/role.vue")
            },
            {
                path: "/system-menu",
                name: "system-menu",
                meta: {
                    title: "菜单管理"
                },
                component: () => import(/* webpackChunkName: "system-menu" */ "../views/system/menu.vue")
            },
            {
                path: "/table",
                name: "basetable",
                meta: {
                    title: "基础表格"
                },
                component: () => import(/* webpackChunkName: "table" */ "../views/table/basetable.vue")
            },
            {
                path: "/table-editor",
                name: "table-editor",
                meta: {
                    title: "可编辑表格"
                },
                component: () => import(/* webpackChunkName: "table-editor" */ "../views/table/table-editor.vue")
            },
            {
                path: "/schart",
                name: "schart",
                meta: {
                    title: "schart图表"
                },
                component: () => import(/* webpackChunkName: "schart" */ "../views/chart/schart.vue")
            },
            {
                path: "/echarts",
                name: "echarts",
                meta: {
                    title: "echarts图表"
                },
                component: () => import(/* webpackChunkName: "echarts" */ "../views/chart/echarts.vue")
            },

            {
                path: "/icon",
                name: "icon",
                meta: {
                    title: "图标"
                },
                component: () => import(/* webpackChunkName: "icon" */ "../views/pages/icon.vue")
            },
            {
                path: "/ucenter",
                name: "ucenter",
                meta: {
                    title: "个人中心"
                },
                component: () => import(/* webpackChunkName: "ucenter" */ "../views/pages/ucenter.vue")
            },
            {
                path: "/editor",
                name: "editor",
                meta: {
                    title: "富文本编辑器"
                },
                component: () => import(/* webpackChunkName: "editor" */ "../views/pages/editor.vue")
            },
            {
                path: "/markdown",
                name: "markdown",
                meta: {
                    title: "markdown编辑器"
                },
                component: () => import(/* webpackChunkName: "markdown" */ "../views/pages/markdown.vue")
            },
            {
                path: "/export",
                name: "export",
                meta: {
                    title: "导出Excel"
                },
                component: () => import(/* webpackChunkName: "export" */ "../views/table/export.vue")
            },
            {
                path: "/import",
                name: "import",
                meta: {
                    title: "导入Excel"
                },
                component: () => import(/* webpackChunkName: "import" */ "../views/table/import.vue")
            },
            {
                path: "/theme",
                name: "theme",
                meta: {
                    title: "主题设置"
                },
                component: () => import(/* webpackChunkName: "theme" */ "../views/pages/theme.vue")
            },
            {
                path: "/calendar",
                name: "calendar",
                meta: {
                    title: "日历"
                },
                component: () => import(/* webpackChunkName: "calendar" */ "../views/element/calendar.vue")
            },
            {
                path: "/watermark",
                name: "watermark",
                meta: {
                    title: "水印"
                },
                component: () => import(/* webpackChunkName: "watermark" */ "../views/element/watermark.vue")
            },
            {
                path: "/carousel",
                name: "carousel",
                meta: {
                    title: "走马灯"
                },
                component: () => import(/* webpackChunkName: "carousel" */ "../views/element/carousel.vue")
            },
            {
                path: "/tour",
                name: "tour",
                meta: {
                    title: "分步引导"
                },
                component: () => import(/* webpackChunkName: "tour" */ "../views/element/tour.vue")
            },
            {
                path: "/steps",
                name: "steps",
                meta: {
                    title: "步骤条"
                },
                component: () => import(/* webpackChunkName: "steps" */ "../views/element/steps.vue")
            },
            {
                path: "/form",
                name: "forms",
                meta: {
                    title: "表单"
                },
                component: () => import(/* webpackChunkName: "form" */ "../views/element/form.vue")
            },
            {
                path: "/upload",
                name: "upload",
                meta: {
                    title: "上传"
                },
                component: () => import(/* webpackChunkName: "upload" */ "../views/element/upload.vue")
            },
            {
                path: "/statistic",
                name: "statistic",
                meta: {
                    title: "统计"
                },
                component: () => import(/* webpackChunkName: "statistic" */ "../views/element/statistic.vue")
            }
        ]
    },
    {
        path: "/login",
        meta: {
            title: "登录",
            noAuth: true
        },
        component: () => import(/* webpackChunkName: "login" */ "../views/pages/login.vue")
    },
    {
        path: "/register",
        meta: {
            title: "注册",
            noAuth: true
        },
        component: () => import(/* webpackChunkName: "register" */ "../views/pages/register.vue")
    },
    {
        path: "/reset-pwd",
        meta: {
            title: "重置密码",
            noAuth: true
        },
        component: () => import(/* webpackChunkName: "reset-pwd" */ "../views/pages/reset-pwd.vue")
    },
    {
        path: "/403",
        meta: {
            title: "没有权限",
            noAuth: true
        },
        component: () => import(/* webpackChunkName: "403" */ "../views/pages/403.vue")
    },
    {
        path: "/404",
        meta: {
            title: "找不到页面",
            noAuth: true
        },
        component: () => import(/* webpackChunkName: "404" */ "../views/pages/404.vue")
    },
    { path: "/:path(.*)", redirect: "/404" }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    NProgress.start();
    const briefUserInfo = await loginCheck();
    if (!briefUserInfo && !to.meta.noAuth) {
        next("/login");
    } else {
        next();
    }
});

router.afterEach(() => {
    NProgress.done();
});

export default router;
