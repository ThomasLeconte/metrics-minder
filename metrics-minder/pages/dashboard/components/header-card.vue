<template>
  <CustomCard>
    <template #title>
      <div class="flex justify-between items-start">
        <div class="flex justify-content-between align-items-center gap-5">
          <h2>Metrics minder</h2>
          <Icon name="uil:github" :style="[dark ? 'white' : 'black']" size="2rem" />
          <Select v-model="refreshRate" :options="refreshOptions" optionLabel="name" optionValue="value" placeholder="Select refresh rate" size="small" />
        </div>
        <div class="flex items-center gap-10">
          <div class="flex items-center gap-2">
            <span>Dark</span>
            <ToggleSwitch v-model="dark" />
          </div>
          <p class="text-lg">Made with ❤️ by <a href="https://github.com/ThomasLeconte" target="_blank" class="text-blue-500 hover:underline">Thomas LECONTE</a></p>
        </div>
      </div>
    </template>
  </CustomCard>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import CustomCard from "~/pages/dashboard/components/custom-card.vue";

export default defineComponent({
  name: 'MainCard',
  components: {
    CustomCard
  },
  watch: {
    refreshRate(newValue) {
      this.$emit('refreshRateUpdated', newValue)
    },
    dark(newValue) {
      if(newValue) {
        document.documentElement.classList.toggle('dark-mode', true)
        this.$forceUpdate();
      } else {
        document.documentElement.classList.toggle('dark-mode', false)
      }
    }
  },
  data() {
    return {
      refreshRate: 5000,
      refreshOptions: [
        { name: '1 second', value: 1000 },
        { name: '2 seconds', value: 2000 },
        { name: '5 seconds', value: 5000 },
        { name: '10 seconds', value: 10000 }
      ],
      dark: false
    }
  }
})
</script>

<style scoped>
</style>
