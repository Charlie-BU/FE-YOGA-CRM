interface Convention {
    id: number;
    name: string;
}

export const vocations: Convention[] = [
    {
        id: 1,
        name: "总经理"
    },
    {
        id: 2,
        name: "店长"
    },
    {
        id: 3,
        name: "总监"
    },
    {
        id: 4,
        name: "校长"
    },
    {
        id: 5,
        name: "咨询"
    },
    {
        id: 6,
        name: "老师"
    },
    {
        id: 7,
        name: "助理"
    },
    {
        id: 8,
        name: "员工"
    },
    {
        id: 9,
        name: "新媒体"
    }
];

export const getVocation = (id: number): string | undefined => {
    const vocation = vocations.find((v) => v.id === id);
    return vocation ? vocation.name : undefined;
};

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
