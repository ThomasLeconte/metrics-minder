document.addEventListener('DOMContentLoaded', () => {
    const cpuCtx = document.getElementById('cpu-chart').getContext('2d');
    const memoryCtx = document.getElementById('memory-chart').getContext('2d');
    const diskCtx = document.getElementById('disk-chart').getContext('2d');
    const networkCtx = document.getElementById('network-chart').getContext('2d');

    const cpuChart = new Chart(cpuCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'CPU Usage (%)',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    const memoryChart = new Chart(memoryCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Memory Usage (%)',
                data: [],
                borderColor: 'rgba(153, 102, 255, 1)',
                fill: false,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    const diskChart = new Chart(diskCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Disk Usage (%)',
                data: [],
                borderColor: 'rgba(255, 159, 64, 1)',
                fill: false,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    const networkChart = new Chart(networkCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Network Usage (KB)',
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    async function fetchMetrics() {
        const mainInfos = await fetch('/api/main-infos').then(response => response.json());
        const cpuDetails = await fetch('/api/cpu-infos').then(response => response.json());
        const memoryDetails = await fetch('/api/memory-infos').then(response => response.json());
        const networkDetails = await fetch('/api/network-infos').then(response => response.json());
        const diskDetails = await fetch('/api/disk-infos').then(response => response.json());

        // Mettre à jour les graphiques
        updateChart(cpuChart, cpuDetails.currentLoad);
        updateChart(memoryChart, (memoryDetails.used / memoryDetails.total) * 100);

        // Calculer l'utilisation totale du disque
        const totalDiskUsage = mainInfos.disks.reduce((acc, disk) => acc + disk.used, 0);
        const totalDiskSize = mainInfos.disks.reduce((acc, disk) => acc + disk.size, 0);
        updateChart(diskChart, (totalDiskUsage / totalDiskSize) * 100);

        // Calculer l'utilisation totale du réseau
        const totalNetworkUsage = networkDetails.reduce((acc, network) => acc + network.rx_sec + network.tx_sec, 0);
        updateChart(networkChart, totalNetworkUsage / 1024);

        // Mettre à jour les informations principales
        document.getElementById('main-info').innerText = `
      OS: ${mainInfos.os.platform}, ${mainInfos.os.distro}, ${mainInfos.os.release}\n
      CPU: ${mainInfos.cpu.manufacturer} ${mainInfos.cpu.brand} ${mainInfos.cpu.speed}GHz\n
      Memory: ${formatMemory(memoryDetails.total)} total, ${formatMemory(memoryDetails.used)} used\n
      Disk: ${formatDisk(totalDiskSize)} total, ${formatDisk(totalDiskUsage)} used\n
      Network: ${formatNetwork(totalNetworkUsage)}
    `;
    }

    function updateChart(chart, value) {
        const labels = chart.data.labels;
        const data = chart.data.datasets[0].data;

        if (labels.length >= 10) {
            labels.shift();
            data.shift();
        }

        labels.push(new Date().toLocaleTimeString());
        data.push(value);

        chart.update();
    }

    function formatMemory(bytes) {
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    }

    function formatDisk(bytes) {
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    }

    function formatNetwork(bytes) {
        return (bytes / 1024).toFixed(2) + ' KB';
    }

    setInterval(fetchMetrics, 5000);
    fetchMetrics();
});