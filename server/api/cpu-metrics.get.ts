import {SystemMetrics} from "~/server/system-metrics";

export default defineEventHandler(async (event) => {
    //get query param "multipleCpus"
    const query = getQuery(event);
    const multipleCpus = (query.multipleCpus && query.multipleCpus === 'true') as boolean;

    const systemMetrics = SystemMetrics.getInstance();
    return systemMetrics.getCPUDetails(multipleCpus);
});
