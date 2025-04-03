import request from "@/utils/request";

export const loginCheck = async () => {
    const sessionid = localStorage.getItem("sessionid");
    if (!sessionid) {
        localStorage.clear();
        return null;
    }
    try {
        const res = await request.post("/user/loginCheck", null, {
            headers: {
                sessionid: sessionid
            }
        });
        if (res.data.status !== 200) {
            localStorage.clear();
            return null;
        }
        // briefUserInfo
        const briefUserInfo = res.data.data;
        return briefUserInfo;
    } catch (error) {
        return null;
    }
};

export const getUserInfo = async () => {
    const res = await request.post("/user/getUserInfo", null, {
        headers: {
            sessionid: localStorage.getItem("sessionid")
        }
    });
    if (res.data.status === 200) {
        return res.data.user;
    }
};
