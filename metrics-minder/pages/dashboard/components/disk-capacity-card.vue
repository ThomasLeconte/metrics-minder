<template>
  <CustomCard :title="title">
    <Chart type="pie" :data="chartData" :options="chartOptions" :height="250" :width="150" />
  </CustomCard>
</template>
<script lang="ts">
import CustomCard from "~/pages/dashboard/components/custom-card.vue";
import {DashboardApi} from "~/api/dashboard-api";
import {formatDisk, formatToGb} from "~/utils/format-utils";

export default defineComponent({
  name: "DiskCapacityUsage",
  components: {CustomCard},
  props: {
    refreshRate: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const interval = ref(-1);
    const title = ref('Disk capacity');

    const chartData = reactive({
      labels: ["Used", "Free"],
      datasets: [{
        data: [0, 100],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      }]
    })
    const chartOptions = ref({
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(tooltipItem: any) {
              const value = tooltipItem.raw;
              return `${tooltipItem.label}: ${formatDisk(value)}`;
            }
          }
        },
        legend: {
          position: 'top',
        }
      }
    })

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
      DashboardApi.getDiskCapacityMetrics()
          .then((disksCapacity:any[]) => {
            // Calculer la capacité du disque
            const totalDiskUsage = disksCapacity.reduce((acc, disk) => acc + disk.used, 0);
            const totalDiskSize = disksCapacity.reduce((acc, disk) => acc + disk.size, 0);
            // Mettre à jour le graphique circulaire du disque
            const diskUsagePercentage = (totalDiskUsage / totalDiskSize) * 100;
            title.value = `Disk capacity (${diskUsagePercentage.toFixed(2)}%)`;
            chartData.datasets[0] = {...chartData.datasets[0], data: [totalDiskUsage, totalDiskSize - totalDiskUsage]}
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
