<template>
  <CustomCard :title="title">
    <template #title>
      <div class="flex justify-between">
        <div>{{ title }}</div>
        <div class="flex items-center gap-2">
          <span>Multiple</span>
          <ToggleSwitch v-model="multiple" />
        </div>
      </div>
    </template>
    <Chart class="test" type="line" :data="chartData" :height="250" :options="chartOptions"  />
  </CustomCard>
</template>
<script lang="ts">
import CustomCard from "~/pages/dashboard/components/custom-card.vue";
import {DashboardApi} from "~/api/dashboard-api";

export default defineComponent({
  name: "CpuUsage",
  components: {CustomCard},
  props: {
    refreshRate: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const interval = ref(-1);
    const title = ref('CPU usage');
    const multiple = ref(false);

    const chartData = reactive({
      labels: [] as any[],
      datasets: [] as any[]
    })
    const chartOptions = ref({
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }})

    onMounted(() => {
      initInterval();
    })

    function initInterval() {
      interval.value = setInterval(() => {
        updateMetrics();
      }, props.refreshRate)
    }

    function deleteInterval() {
      clearInterval(interval.value);
    }

    onBeforeUnmount(() => {
      deleteInterval();
    });

    watch(() => props.refreshRate, (value) => {
      deleteInterval();
      initInterval();
    })

    function updateMetrics() {
      DashboardApi.getCpuMetrics(multiple.value)
       .then((response: any[]) => {
         console.log(response);

         if(chartData.datasets.length === 0 || chartData.datasets.length !== response.length) {
           chartData.datasets = response.map((cpu, index) => {
             const randomColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`;
             return {
               label: `Core #${index + 1} Usage (%)`,
               data: [] as any[],
               borderColor: randomColor,
               fill: false,
             }
           })
         } else {
           if(chartData.labels.length > 10) {
             chartData.labels.shift();
           } else {
             chartData.labels.push(new Date().toLocaleTimeString());
           }

           response.forEach((cpu, index) => {
             chartData.datasets[index] = {...chartData.datasets[index], data: [...chartData.datasets[index].data, cpu.currentLoad]}
             if (chartData.datasets[index].data.length > 10) {
               chartData.datasets[index].data.shift();
             }
           })
         }
       });
    }

    return {
      title,
      multiple,
      chartData,
      chartOptions
    }
  }
})
</script>

<style scoped>
.test {
  height: 100%;
}
.test > canvas {
  height: 100% !important;
}
</style>
