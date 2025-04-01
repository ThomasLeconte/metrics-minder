const express = require('express');
const osUtils = require('os-utils');
const os = require('os');
const si = require("systeminformation");
const app = express();
const port = 3000;

// Endpoint pour obtenir l'utilisation du CPU
app.get('/api/cpu', (req, res) => {
    osUtils.cpuUsage((usage) => {
        res.json({cpuUsage: usage});
    });
});

// Endpoint pour obtenir l'utilisation de la RAM
app.get('/api/memory', (req, res) => {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    res.json({memoryUsage, totalMemory, freeMemory, usedMemory});
});

// Endpoint pour obtenir l'utilisation de l'espace disque
app.get('/api/disk', (req, res) => {
    const totalDisk = os.totalmem();
    const freeDisk = os.freemem();
    const usedDisk = totalDisk - freeDisk;
    const diskUsage = (usedDisk / totalDisk) * 100;
    res.json({diskUsage, totalDisk, freeDisk, usedDisk});
});

// Endpoint pour obtenir l'utilisation du réseau
app.get('/api/network', (req, res) => {
    const networkInterfaces = os.networkInterfaces();
    res.json(networkInterfaces);
});

app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);

    Promise.all([si.osInfo(), si.cpu()])
        .then(([osInfos, cpuInfos]) => {
            console.log(`[OS] Platform: ${osInfos.platform}, Distro: ${osInfos.distro}, Release: ${osInfos.release}`)
            console.log(`[CPU] ${cpuInfos.manufacturer} ${cpuInfos.brand} ${cpuInfos.speed}GHz`)
        }).finally(() => {

        const formatGo = (bytes) => {
            return (bytes / 1024 / 1024 / 1024).toFixed(2)
        }

        setInterval(() => {
            Promise.all([si.currentLoad(), si.mem(), si.networkStats(), si.fsSize(), si.fsStats()])
                .then(([load, memory, network, disks, diskStats]) => {
                    console.log(`[CPU] Load: ${(load.currentLoad * 10).toFixed(2)}%`)

                    console.log(`[MEMORY] Total: ${formatGo(memory.total)}Go, Free: ${formatGo(memory.free)}Go, Used: ${formatGo(memory.used)}Go`)
                    // console.log(`[DISK] Total: ${disk.total / 1024 / 1024 / 1024}, Free: ${disk.free / 1024 / 1024 / 1024}, Used: ${disk.used / 1024 / 1024 / 1024}`)
                    disks.forEach((disk) => {
                        console.log(`[DISK] ${disk.fs} Total: ${formatGo(disk.size)}Go, Free: ${formatGo(disk.available)}, Used: ${disk.use}%`)
                    })
                    console.log(`[STATS NETWORK] Received: ${network[0].rx_sec?.toFixed(2)} bytes/s, Transmitted: ${network[0].tx_sec?.toFixed(2)} bytes/s`)
                    if (diskStats) console.log(`[STATS DISK] Read: ${diskStats.rIO_sec?.toFixed(2)} bytes/s, Write: ${diskStats.wIO_sec?.toFixed(2)} bytes/s`)
                    console.log("\n\n")
                })
        }, 1000)
    })
});
