document.addEventListener('DOMContentLoaded', () => {
    const cpuCtx = document.getElementById('cpu-chart').getContext('2d');
    const memoryCtx = document.getElementById('memory-chart').getContext('2d');
    const diskCtx = document.getElementById('disk-chart').getContext('2d');
    const networkCtx = document.getElementById('network-chart').getContext('2d');
    const diskPieCtx = document.getElementById('disk-pie-chart').getContext('2d');

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
        const diskUsage = diskDetails.rx_sec || 0 + diskDetails.tx_sec || 0;

        // Calculer l'utilisation totale du réseau
        const totalNetworkRead = networkDetails.reduce((acc, network) => acc + network.rx_sec, 0) / 1024;
        const totalNetworkWrite = networkDetails.reduce((acc, network) => acc + network.tx_sec, 0) / 1024;

        updateChart(cpuChart, cpuUsage);
        updateChart(memoryChart, memoryUsage);
        updateChart(diskChart, diskUsage);
        updateNetworkChart(networkChart, totalNetworkRead, totalNetworkWrite);

        diskPieChart.update();

        // Mettre à jour les titres des cartes
        document.getElementById('cpu-title').innerText = `Utilisation du CPU: ${cpuUsage.toFixed(2)}%`;
        document.getElementById('memory-title').innerText = `Utilisation de la RAM: ${memoryUsage.toFixed(2)}%`;
        document.getElementById('disk-pie-title').innerText = `Capacité du disque: ${diskUsagePercentage.toFixed(2)}%`;
        document.getElementById('disk-title').innerText = `Utilisation du disque: ${diskUsage.toFixed(2)}%`;
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

    function formatMemory(bytes) {
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    }

    function formatDisk(bytes) {
        return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    }

    function formatBytesToGiga(bytes) {
        return (bytes / 1024 / 1024 / 1024).toFixed(2);
    }

    setInterval(fetchMetrics, 5000);
    fetchMetrics();
});
