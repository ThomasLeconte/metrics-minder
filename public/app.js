document.addEventListener('DOMContentLoaded', () => {
    const cpuCtx = document.getElementById('cpu-chart').getContext('2d');
    const memoryCtx = document.getElementById('memory-chart').getContext('2d');
    const diskCtx = document.getElementById('disk-chart').getContext('2d');
    const networkCtx = document.getElementById('network-chart').getContext('2d');
    const diskPieCtx = document.getElementById('disk-pie-chart').getContext('2d');
    const refreshRateSelect = document.getElementById('refresh-rate');

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
            datasets: [
                {
                    label: 'Disk Read (MB/s)',
                    data: [],
                    borderColor: 'rgb(29,161,56)',
                    fill: false,
                },
                {
                    label: 'Disk Write (MB/s)',
                    data: [],
                    borderColor: 'rgb(255,120,34)',
                    fill: false,
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });

    const networkChart = new Chart(networkCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Network Read (KB/s)',
                    data: [],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    fill: false,
                },
                {
                    label: 'Network Write (KB/s)',
                    data: [],
                    borderColor: 'rgba(255, 206, 86, 1)',
                    fill: false,
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const diskPieChart = new Chart(diskPieCtx, {
        type: 'doughnut',
        data: {
            labels: ['Used Space', 'Free Space'],
            datasets: [{
                data: [0, 100],
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const value = tooltipItem.raw;
                            return `${tooltipItem.label}: ${formatBytesToGiga(value)} GB`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                }
            }
        }
    });

    let refreshInterval = 5000;
    let fetchMetricsInterval;

    async function fetchMetrics() {
        const mainInfos = await fetch('/api/main-infos').then(response => response.json());
        const cpuDetails = await fetch('/api/cpu-infos').then(response => response.json());
        const memoryDetails = await fetch('/api/memory-infos').then(response => response.json());
        const networkDetails = await fetch('/api/network-infos').then(response => response.json());
        const diskDetails = await fetch('/api/disk-infos').then(response => response.json());

        // Mettre à jour les graphiques
        const cpuUsage = cpuDetails.currentLoad;
        const memoryUsage = (memoryDetails.used / memoryDetails.total) * 100;

        // Calculer la capacité du disque
        const totalDiskUsage = mainInfos.disks.reduce((acc, disk) => acc + disk.used, 0);
        const totalDiskSize = mainInfos.disks.reduce((acc, disk) => acc + disk.size, 0);
        // Mettre à jour le graphique circulaire du disque
        const diskUsagePercentage = (totalDiskUsage / totalDiskSize) * 100;
        diskPieChart.data.datasets[0].data = [totalDiskUsage, totalDiskSize - totalDiskUsage];

        // Calculer l'utilisation totale du disque
        const rx = diskDetails.rx_sec || (diskDetails.tx_sec && diskDetails.rx_sec ? diskDetails.tx_sec - diskDetails.rx_sec : 0);
        const wx = diskDetails.wx_sec || (diskDetails.tx_sec && diskDetails.rx_sec ? diskDetails.tx_sec - diskDetails.rx_sec : 0);
        const tx = diskDetails.tx_sec || (diskDetails.rx_sec && diskDetails.wx_sec ? diskDetails.rx_sec + diskDetails.wx_sec : 0);
        const diskReadUsage = formatBytesToMega(rx);
        const diskWriteUsage = formatBytesToMega(wx) || 0;
        const diskTotalUsage = formatBytesToMega(tx) || 0;

        // Calculer l'utilisation totale du réseau
        const totalNetworkRead = networkDetails.reduce((acc, network) => acc + network.rx_sec, 0) / 1024;
        const totalNetworkWrite = networkDetails.reduce((acc, network) => acc + network.tx_sec, 0) / 1024;

        updateChart(cpuChart, cpuUsage);
        updateChart(memoryChart, memoryUsage);
        updateDiskChart(diskChart, diskReadUsage, diskWriteUsage);
        updateNetworkChart(networkChart, totalNetworkRead, totalNetworkWrite);

        diskPieChart.update();

        // Mettre à jour les titres des cartes
        document.getElementById('cpu-title').innerText = `Utilisation du CPU: ${cpuUsage.toFixed(2)}%`;
        document.getElementById('memory-title').innerText = `Utilisation de la RAM: ${formatBytesToGiga(memoryDetails.used)}Go (${memoryUsage.toFixed(2)}%)`;
        document.getElementById('disk-pie-title').innerText = `Capacité du disque: ${diskUsagePercentage.toFixed(2)}%`;
        document.getElementById('disk-title').innerText = `Utilisation du disque: ${diskTotalUsage} Mb/s`;
        document.getElementById('network-title').innerText = `Utilisation du réseau: ${(totalNetworkRead + totalNetworkWrite).toFixed(2)} KB/s`;

        // Mettre à jour les informations principales
        document.getElementById('main-info').innerText = `
      OS: ${mainInfos.os.platform}, ${mainInfos.os.distro}, ${mainInfos.os.release}\n
      CPU: ${mainInfos.cpu.manufacturer} ${mainInfos.cpu.brand} ${mainInfos.cpu.speed}GHz\n
      Memory: ${formatMemory(memoryDetails.total)} total\n
      Disk: ${formatDisk(totalDiskSize)} total\n
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

    function updateNetworkChart(chart, readValue, writeValue) {
        const labels = chart.data.labels;
        const readData = chart.data.datasets[0].data;
        const writeData = chart.data.datasets[1].data;

        if (labels.length >= 10) {
            labels.shift();
            readData.shift();
            writeData.shift();
        }

        labels.push(new Date().toLocaleTimeString());
        readData.push(readValue);
        writeData.push(writeValue);

        chart.update();
    }

    function updateDiskChart(chart, readValue, writeValue) {
        const labels = chart.data.labels;
        const readData = chart.data.datasets[0].data;
        const writeData = chart.data.datasets[1].data;

        if (labels.length >= 10) {
            labels.shift();
            readData.shift();
            writeData.shift();
        }

        labels.push(new Date().toLocaleTimeString());
        readData.push(readValue);
        writeData.push(writeValue);

        chart.update();
    }

    function formatMemory(bytes) {
        return (bytes / 1e9).toFixed(2) + ' Go';
    }

    function formatDisk(bytes) {
        return (bytes / 1e9).toFixed(2) + ' GB';
    }

    function formatBytesToGiga(bytes) {
        return (bytes / 1e9).toFixed(2);
    }

    function formatBytesToMega(bytes) {
        return (bytes / 1e6).toFixed(2);
    }

    function startFetchingMetrics() {
        clearInterval(fetchMetricsInterval);
        fetchMetricsInterval = setInterval(fetchMetrics, refreshInterval);
        fetchMetrics(); // Appel initial pour éviter le délai au démarrage
    }

    refreshRateSelect.addEventListener('change', (event) => {
        refreshInterval = parseInt(event.target.value, 10);
        startFetchingMetrics();
    });

    // Démarrer la récupération des métriques avec l'intervalle par défaut
    startFetchingMetrics();
});
