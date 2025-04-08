<template>
  <CustomCard title="Main informations">
    <DataTable :value="caracteristics" stripedRows>
      <Column field="title" header="Caracteristic"></Column>
      <Column field="value" header="Value"></Column>
    </DataTable>
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

    let caracteristics = ref([] as {title: string, value: string}[])

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
      caracteristics.value.push({title: "OS", value: `${mainInfos.value.os?.distro || ''} ${mainInfos.value.os?.release} ${mainInfos.value.os?.platform} ${mainInfos.value.os?.arch}`});
      caracteristics.value.push({title: "CPU", value: `${mainInfos.value.cpu.manufacturer} ${mainInfos.value.cpu.brand} ${mainInfos.value.cpu.speed} GHz`});
      const totalMemory = mainInfos.value.memory.reduce((acc, curr) => acc + curr.size, 0);
      const totalDisks = mainInfos.value.disks.reduce((acc, curr) => acc + curr.size, 0);
      caracteristics.value.push({title: "Memory", value: formatMemory(totalMemory)});
      caracteristics.value.push({title: "Total storage disk", value: formatDisk(totalDisks)});
    }

    return {
      caracteristics
    }
  }
})
</script>
