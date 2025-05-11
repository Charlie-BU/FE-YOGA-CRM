interface Convention {
    id: number;
    name: string;
}

export const genders: Convention[] = [
    {
        id: 1,
        name: "男"
    },
    {
        id: 2,
        name: "女"
    }
];

export const getGender = (id: number): string | undefined => {
    const gender = genders.find((v) => v.id === id);
    return gender ? gender.name : undefined;
};

// User：人员状态
export const statuses: Convention[] = [
    {
        id: 1,
        name: "在职"
    },
    {
        id: 2,
        name: "离职"
    }
];

export const getStatus = (id: number): string | undefined => {
    const status = statuses.find((v) => v.id === id);
    return status ? status.name : undefined;
};

// Client：渠道来源
export const fromSources: Convention[] = [
    {
        id: 1,
        name: "传统 - 竞价商务通"
    },
    {
        id: 2,
        name: "传统 - 电话"
    },
    {
        id: 3,
        name: "传统 - 推荐"
    },
    {
        id: 4,
        name: "传统 - 进店"
    },
    {
        id: 5,
        name: "传统 - 优化站"
    },
    {
        id: 6,
        name: "新电 - 美团"
    },
    {
        id: 7,
        name: "新电 - 点评"
    },
    {
        id: 8,
        name: "新电 - 小红书"
    },
    {
        id: 9,
        name: "新电 - 抖音"
    },
    {
        id: 10,
        name: "新电 - 红推"
    },
    {
        id: 11,
        name: "新电 - 公众号"
    },
    {
        id: 12,
        name: "新电 - 视频号"
    },
    {
        id: 13,
        name: "新电 - 快手"
    },
    {
        id: 14,
        name: "新电 - 抖音信息流"
    },
    {
        id: 15,
        name: "新电 - 其他"
    },
    {
        id: 16,
        name: "新电 - 北京信息流"
    },
    {
        id: 17,
        name: "新电 - 上海信息流"
    },
    {
        id: 18,
        name: "新电 - 成都信息流"
    },
    {
        id: 19,
        name: "新电 - 广州信息流"
    },
    {
        id: 20,
        name: "新电 - 成都红推"
    },
    {
        id: 21,
        name: "新电 - 高德"
    },
    {
        id: 22,
        name: "新电 - 快手信息流"
    },
    {
        id: 23,
        name: "新电 - 上海广点通"
    },
    {
        id: 24,
        name: "新电 - 成都广点通"
    },
    {
        id: 25,
        name: "新电 - 小程序"
    },
    {
        id: 26,
        name: "新电 - 电商"
    },
    {
        id: 27,
        name: "会员介绍"
    },
    {
        id: 28,
        name: "合作"
    },
    {
        id: 29,
        name: "其他"
    },
    {
        id: 30,
        name: "漏登记"
    }
];

export const getFromSource = (id: number): string | undefined => {
    const source = fromSources.find((v) => v.id === id);
    return source ? source.name : undefined;
};

// Client：客户状态
export const clientStatuses: Convention[] = [
    {
        id: 1,
        name: "未分配"
    },
    {
        id: 2,
        name: "已分配"
    },
    {
        id: 3,
        name: "转客户"
    },
    {
        id: 4,
        name: "已预约到店"
    },
    {
        id: 5,
        name: "已毕业"
    }
];

export const getClientStatus = (id: number): string | undefined => {
    const clientStatus = clientStatuses.find((v) => v.id === id);
    return clientStatus ? clientStatus.name : undefined;
};

// Payment：交易方式
export const paymentMethods: Convention[] = [
    {
        id: 1,
        name: "现金"
    },
    {
        id: 2,
        name: "微信"
    },
    {
        id: 3,
        name: "支付宝"
    },
    {
        id: 4,
        name: "POS"
    },
    {
        id: 5,
        name: "对公"
    },
    {
        id: 6,
        name: "其他"
    }
];

export const getPaymentMethod = (id: number): string | undefined => {
    const method = paymentMethods.find((v) => v.id === id);
    return method ? method.name : undefined;
};

// Payment：交易类别
export const paymentCategories: Convention[] = [
    {
        id: 1,
        name: "定金"
    },
    {
        id: 2,
        name: "尾款"
    },
    {
        id: 3,
        name: "住宿费"
    },
    {
        id: 4,
        name: "补差价"
    },
    {
        id: 5,
        name: "其他"
    }
];

export const getPaymentCategory = (id: number): string | undefined => {
    const type = paymentCategories.find((v) => v.id === id);
    return type ? type.name : undefined;
};

// Course：课程分类
export const courseCategories: Convention[] = [
    {
        id: 1,
        name: "全日制"
    },
    {
        id: 2,
        name: "周末班"
    }
];

export const getCourseCategory = (id: number): string | undefined => {
    const category = courseCategories.find((v) => v.id === id);
    return category ? category.name : undefined;
};

// Dormitory：宿舍类别
export const dormitoryCategories: Convention[] = [
    {
        id: 1,
        name: "公寓"
    },
    {
        id: 2,
        name: "民房"
    }
];

export const getDormitoryCategory = (id: number): string | undefined => {
    const category = dormitoryCategories.find((v) => v.id === id);
    return category ? category.name : undefined;
};

// Bed：床位类型
export const bedCategories: Convention[] = [
    {
        id: 1,
        name: "单人床"
    },
    {
        id: 2,
        name: "上铺"
    },
    {
        id: 3,
        name: "下铺"
    }
];

export const getBedCategory = (id: number): string | undefined => {
    const category = bedCategories.find((v) => v.id === id);
    return category ? category.name : undefined;
};
