<template>
  <CustomCard>
    <template #title>
      <div class="flex justify-between items-start">
        <div class="flex justify-content-between align-items-center gap-5">
          <h2>Metrics minder</h2>
          <Icon name="uil:github" style="color: black" size="2rem" />
        </div>
        <div>
          <p class="text-lg">Made with ❤️ by <a href="https://github.com/ThomasLeconte" target="_blank" class="text-blue-500 hover:underline">Thomas LECONTE</a></p>
        </div>
      </div>
    </template>
  </CustomCard>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Card from 'primevue/card';
import CustomCard from "~/pages/dashboard/components/custom-card.vue";
import {DashboardApi} from "~/api/dashboard-api";

export default defineComponent({
  name: 'MainCard',
  components: {
    CustomCard,
    Card
  },
  setup() {
    DashboardApi.getMainInfos()
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        console.error(error)
      })

    return {}
  }
})
</script>

<style scoped>
</style>
