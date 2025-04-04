<template>
  <CustomCard title="Main informations">
    <table class="w-full bg-gray-50 rounded-lg overflow-hidden mb-4">
      <thead class="bg-gray-200">
      <tr>
        <th class="py-2 px-4 text-left">Caracteristic</th>
        <th class="py-2 px-4 text-left">Value</th>
      </tr>
      </thead>
      <tbody id="main-info">
      <tr>
        <td class="py-2 px-4">OS</td>
        <td class="py-2 px-4" id="os-info">{{osInfos || "Loading..."}}</td>
      </tr>
      <tr>
        <td class="py-2 px-4">CPU</td>
        <td class="py-2 px-4" id="cpu-info">{{cpuInfos || "Loading..."}}</td>
      </tr>
      <tr>
        <td class="py-2 px-4">Memory</td>
        <td class="py-2 px-4" id="memory-info">{{memoryInfos || "Loading..."}}</td>
      </tr>
      <tr>
        <td class="py-2 px-4">Total storage disk</td>
        <td class="py-2 px-4" id="disk-info">{{diskInfos || "Loading..."}}</td>
      </tr>
      </tbody>
    </table>
  </CustomCard>
</template>

<script lang="ts">
import CustomCard from "~/pages/dashboard/components/custom-card.vue";
import {DashboardApi} from "~/api/dashboard-api";
import {formatDisk,formatMemory} from "~/utils/format-utils";

export default defineComponent({
  name: 'InfosCard',
  components: {
    CustomCard
  },
  setup() {
    let mainInfos = ref({} as {os: any, cpu: any, memory: any[], disks: any[], network: any[]})
    let osInfos = ref("");
    let cpuInfos = ref("");
    let memoryInfos = ref("");
    let diskInfos = ref("");

    DashboardApi.getMainInfos()
        .then((response) => {
          mainInfos.value = response;
          formatMainInfos();
        })
        .catch((error) => {
          console.error(error)
        })


    function formatMainInfos() {
      if(!mainInfos.value) return;
      osInfos.value = `${mainInfos.value.os.distro} ${mainInfos.value.os.release} ${mainInfos.value.os.platform} ${mainInfos.value.os.arch}`;
      cpuInfos.value = `${mainInfos.value.cpu.manufacturer} ${mainInfos.value.cpu.brand} ${mainInfos.value.cpu.speed} GHz`;
      const totalMemory = mainInfos.value.memory.reduce((acc, curr) => acc + curr.size, 0);
      const totalDisks = mainInfos.value.disks.reduce((acc, curr) => acc + curr.size, 0);
      memoryInfos.value = formatMemory(totalMemory);
      diskInfos.value = formatDisk(totalDisks);
    }

    return {
      osInfos,
      cpuInfos,
      memoryInfos,
      diskInfos
    }
  }
})
</script>
