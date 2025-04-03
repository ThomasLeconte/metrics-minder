import {instance} from "./axios.config";

export class DashboardApi {

    static getMainInfos() {
        return instance.get("/api/main-infos").then((response => response.data));
    }
}