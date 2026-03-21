import axios from "axios";
import appStore from "../store/appStore";
import { removeUser } from "../store/userSlice";


export const setupAxiosInterceptors = () => {
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (error.response && error.response.status === 401) {
                appStore.dispatch(removeUser());
                localStorage.removeItem("devTinderState");
            }
            return Promise.reject(error);
        }
    );
};
