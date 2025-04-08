<template>
  <div class="p-10">
    <HeaderCard class="w-full mb-20" @refreshRateUpdated="onUpdateRefreshRate" />
    <div class="flex flex-wrap gap-15">
      <InfosCard class="min-w-xl" />
      <CpuCard class="min-w-xl" :refreshRate="refreshRateChoosen" />
      <MemoryCard class="min-w-sm" :refreshRate="refreshRateChoosen" />
      <DiskCapacityUsage class="min-w-sm" :refresh-rate="refreshRateChoosen" />
      <DiskUsage class="min-w-lg" :refresh-rate="refreshRateChoosen" />
      <NetworkUsage class="min-w-lg" :refresh-rate="refreshRateChoosen" />
    </div>
  </div>
</template>
<script lang="ts">
import HeaderCard from "~/pages/dashboard/components/header-card.vue";
import InfosCard from "~/pages/dashboard/components/infos-card.vue";
import CpuCard from "~/pages/dashboard/components/cpu-card.vue";
import MemoryCard from "~/pages/dashboard/components/memory-card.vue";
import DiskCapacityUsage from "~/pages/dashboard/components/disk-capacity-card.vue";
import NetworkUsage from "~/pages/dashboard/components/network-card.vue";
import DiskUsage from "~/pages/dashboard/components/disk-card.vue";

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
