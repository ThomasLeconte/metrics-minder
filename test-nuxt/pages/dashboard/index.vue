<template>
  <div class="p-10">
    <MainCard class="w-full mb-10" />
    <div class="flex">
      <InfosCard />
    </div>
  </div>
</template>
<script lang="ts">
import MainCard from "~/pages/dashboard/components/main-card.vue";
import InfosCard from "~/pages/dashboard/components/infos-card.vue";

export default defineComponent({
  name: 'Dashboard',
  components: {
    InfosCard,
    MainCard
  },
  setup() {
    return {}
  }
})
</script>