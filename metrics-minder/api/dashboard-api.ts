import {instance} from "./axios.config";

export class DashboardApi {

    static getMainInfos() {
        return instance.get("/api/main-infos").then((response => response.data));
    }

    static getCpuMetrics() {
        return instance.get("/api/cpu-metrics").then((response => response.data));
    }

    static getMemoryMetrics() {
        return instance.get("/api/memory-metrics").then((response => response.data));
    }

    static getDiskCapacityMetrics() {
        return instance.get("/api/disks-capacity-metrics").then((response => response.data));
    }

    static getDiskMetrics() {
        return instance.get("/api/disks-metrics").then((response => response.data));
    }

    static getNetworksMetrics() {
        return instance.get("/api/network-metrics").then((response => response.data));
    }
}
