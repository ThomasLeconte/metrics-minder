<template>
  <CustomCard :title="title">
    <Chart type="line" :data="chartData" :options="chartOptions" :height="250" />
  </CustomCard>
</template>
<script lang="ts">
import CustomCard from "~/pages/dashboard/components/custom-card.vue";
import {DashboardApi} from "~/api/dashboard-api";

export default defineComponent({
  name: "MemoryUsage",
  components: {CustomCard},
  props: {
    refreshRate: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const interval = ref(-1);
    const title = ref('Memory usage');

    const chartData = reactive({
      labels: [] as any[],
      datasets: [{
        label: 'Memory Usage (%)',
        data: [] as any[],
        borderColor: 'rgba(153, 102, 255, 1)',
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
      DashboardApi.getMemoryMetrics()
       .then((memoryDetails) => {
         const memoryUsage = (memoryDetails.used / memoryDetails.total) * 100;
         title.value = `Memory usage (${memoryUsage.toFixed(2)}%)`;
         chartData.labels.push(new Date().toLocaleTimeString());
         chartData.datasets[0] = {...chartData.datasets[0], data: [...chartData.datasets[0].data, memoryUsage]}
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
