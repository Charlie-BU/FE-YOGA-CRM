import request from "@/utils/request";

export const loginCheck = async () => {
    const sessionid = localStorage.getItem("sessionid");
    if (!sessionid) {
        localStorage.clear();
        return null;
    }
    const res = await request.post("/user/loginCheck", {
        sessionid: sessionid
    });
    if (res.data.status !== 200) {
        localStorage.clear();
        return null;
    }
    // briefUserInfo
    const briefUserInfo = res.data.data;
    return briefUserInfo;
};

export const getUserInfo = async () => {
    const res = await request.post("/user/getUserInfo", {
        sessionid: localStorage.getItem("sessionid")
    });
    if (res.data.status === 200) {
        return res.data.user;
    }
};
