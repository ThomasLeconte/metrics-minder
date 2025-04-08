<template>
  <div class="p-10">
    <HeaderCard class="w-full mb-20 animate__animated animate__bounce" @refreshRateUpdated="onUpdateRefreshRate" />
    <div class="flex flex-wrap gap-15 animate__animated animate__fadeInUp">
      <InfosCard class="min-w-sm animate__animated animate__fadeInUp" />
      <CpuCard class="min-w-xl animate__animated animate__fadeInUp" :refreshRate="refreshRateChoosen" />
      <MemoryCard class="min-w-sm animate__animated animate__fadeInUp" :refreshRate="refreshRateChoosen" />
      <DiskCapacityUsage class="min-w-sm animate__animated animate__fadeInUp" :refresh-rate="refreshRateChoosen" />
      <DiskUsage class="min-w-lg animate__animated animate__fadeInUp" :refresh-rate="refreshRateChoosen" />
      <NetworkUsage class="min-w-lg animate__animated animate__fadeInUp" :refresh-rate="refreshRateChoosen" />
    </div>
  </div>
</template>
<script lang="ts">
import HeaderCard from "~/pages/components/header-card.vue";
import InfosCard from "~/pages/components/infos-card.vue";
import CpuCard from "~/pages/components/cpu-card.vue";
import MemoryCard from "~/pages/components/memory-card.vue";
import DiskCapacityUsage from "~/pages/components/disk-capacity-card.vue";
import NetworkUsage from "~/pages/components/network-card.vue";
import DiskUsage from "~/pages/components/disk-card.vue";

export default defineComponent({
  name: 'Dashboard',
  components: {
    DiskUsage,
    NetworkUsage,
    DiskCapacityUsage,
    MemoryCard,
    CpuCard,
    InfosCard,
    HeaderCard
  },
  data() {
    return {
      refreshRateChoosen: 5000
    }
  },
  methods: {
    onUpdateRefreshRate(refreshRate: number) {
      this.refreshRateChoosen = refreshRate
    }
  }
})
</script>
