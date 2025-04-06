<template>
  <CustomCard :title="title">
    <Chart type="line" :data="chartData" :options="chartOptions" :height="250" />
  </CustomCard>
</template>
<script lang="ts">
import CustomCard from "~/pages/dashboard/components/custom-card.vue";
import {DashboardApi} from "~/api/dashboard-api";

export default defineComponent({
  name: "NetworkUsage",
  components: {CustomCard},
  props: {
    refreshRate: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const interval = ref(-1);
    const title = ref('Network usage');

    const chartData = reactive({
      labels: [] as any[],
      datasets: [
        {
          label: 'Network Read (KB/s)',
          data: [] as any[],
          borderColor: 'rgba(54, 162, 235, 1)',
          fill: false,
        },
        {
          label: 'Network Write (KB/s)',
          data: [] as any[],
          borderColor: 'rgba(255, 206, 86, 1)',
          fill: false,
        }
      ]
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
      DashboardApi.getNetworksMetrics()
          .then((networkDetails: any[]) => {
            const totalNetworkRead = networkDetails.reduce((acc, network) => acc + network.rx_sec, 0) / 1024;
            const totalNetworkWrite = networkDetails.reduce((acc, network) => acc + network.tx_sec, 0) / 1024;

            title.value = `Network usage (${(totalNetworkRead + totalNetworkWrite).toFixed(2)} MB/s)`;
            chartData.labels.push(new Date().toLocaleTimeString());
            chartData.datasets[0] = {...chartData.datasets[0], data: [...chartData.datasets[0].data, totalNetworkRead]}
            chartData.datasets[1] = {...chartData.datasets[1], data: [...chartData.datasets[1].data, totalNetworkWrite]}
            if (chartData.labels.length > 10) {
              chartData.labels.shift();
              chartData.datasets[0].data.shift();
              chartData.datasets[1].data.shift();
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
