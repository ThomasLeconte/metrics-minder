import {SystemMetrics} from "~/server/system-metrics";

export default defineEventHandler(async (event) => {
    const systemMetrics = SystemMetrics.getInstance();
    return systemMetrics.getCPUDetails();
});