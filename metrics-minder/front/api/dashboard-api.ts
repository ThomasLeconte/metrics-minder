import {instance} from "./axios.config";

export class DashboardApi {

    static getMainInfos() {
        return instance.get("/api/main-infos").then((response => response.data));
    }

    static getCpuMetrics() {
        return instance.get("/api/cpu-infos").then((response => response.data));
    }

    static getMemoryMetrics() {
        return instance.get("/api/memory-infos").then((response => response.data));
    }

    static getDiskCapacityMetrics() {
        return instance.get("/api/disk-capacity-infos").then((response => response.data));
    }

    static getDiskMetrics() {
        return instance.get("/api/disk-infos").then((response => response.data));
    }

    static getNetworksMetrics() {
        return instance.get("/api/network-infos").then((response => response.data));
    }
}
