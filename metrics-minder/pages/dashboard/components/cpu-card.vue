<template>
  <CustomCard :title="title">
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

    const chartData = reactive({
      labels: [] as any[],
      datasets: [{
        label: 'CPU Usage (%)',
        data: [] as any[],
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      }]
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
      DashboardApi.getCpuMetrics()
       .then((response) => {
         console.log(response);
         const cpuUsage = response.currentLoad;
         title.value = `CPU usage (${cpuUsage.toFixed(2)}%)`;
         chartData.labels.push(new Date().toLocaleTimeString());
         chartData.datasets[0] = {...chartData.datasets[0], data: [...chartData.datasets[0].data, cpuUsage]}
         if (chartData.labels.length > 10) {
           chartData.labels.shift();
           chartData.datasets[0].data.shift();
         }
       });
    }

    return {
      title,
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
