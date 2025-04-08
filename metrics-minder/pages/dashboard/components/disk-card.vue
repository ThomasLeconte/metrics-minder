<template>
  <CustomCard :title="title">
    <Chart type="line" :data="chartData" :options="chartOptions" :height="250" />
  </CustomCard>
</template>
<script lang="ts">
import CustomCard from "~/pages/dashboard/components/custom-card.vue";
import {DashboardApi} from "~/api/dashboard-api";
import {formatToMb} from "~/utils/format-utils";

export default defineComponent({
  name: "DiskUsage",
  components: {CustomCard},
  props: {
    refreshRate: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const interval = ref(-1);
    const title = ref('Disk usage');

    const chartData = reactive({
      labels: [] as any[],
      datasets: [
        {
          label: 'Disk Read (MB/s)',
          data: [] as any[],
          borderColor: 'rgb(29,161,56)',
          fill: false,
        },
        {
          label: 'Disk Write (MB/s)',
          data: [] as any[],
          borderColor: 'rgb(255,120,34)',
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
      DashboardApi.getDiskMetrics()
          .then((diskDetails: any) => {
            const rx = diskDetails.rx_sec || (diskDetails.tx_sec && diskDetails.rx_sec ? diskDetails.tx_sec - diskDetails.rx_sec : 0);
            const wx = diskDetails.wx_sec || (diskDetails.tx_sec && diskDetails.rx_sec ? diskDetails.tx_sec - diskDetails.rx_sec : 0);
            const tx = diskDetails.tx_sec || (diskDetails.rx_sec && diskDetails.wx_sec ? diskDetails.rx_sec + diskDetails.wx_sec : 0);
            const diskReadUsage = formatToMb(rx);
            const diskWriteUsage = formatToMb(wx) || 0;
            const diskTotalUsage = formatToMb(tx) || 0;

            title.value = `Disk usage (${(diskTotalUsage)} MB/s)`;
            chartData.labels.push(new Date().toLocaleTimeString());
            chartData.datasets[0] = {...chartData.datasets[0], data: [...chartData.datasets[0].data, diskReadUsage]}
            chartData.datasets[1] = {...chartData.datasets[1], data: [...chartData.datasets[1].data, diskWriteUsage]}
            if (chartData.labels.length > 10) {
              chartData.labels.shift();
              chartData.datasets[0].data.shift();
              chartData.datasets[1].data.shift();
            }

            //update y axe
            chartOptions.value.scales.y.max = Math.max(...chartData.datasets[0].data, ...chartData.datasets[1].data) + 2
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
