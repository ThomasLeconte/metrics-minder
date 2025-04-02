const express = require('express');
const os = require('os');
const si = require("systeminformation");
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/api/main-infos', async (req, res) => {
    res.json({
        os: getOSInfos(),
        cpu: await getCPUInfos(),
        memory: await getMemoryInfos(),
        disks: await getDisksInfos(),
        network: await getNetworkInfos()
    });
});

app.get('/api/cpu-infos', async (req, res) => {
    res.json(await getCPUDetails());
});

app.get('/api/memory-infos', async (req, res) => {
    res.json(await getMemoryDetails());
});

app.get('/api/network-infos', async (req, res) => {
    res.json(await getNetworkDetails());
});

app.get('/api/disk-infos', async (req, res) => {
    res.json(await getDiskDetails());
});

function getOSInfos() {
    return {
        platform: os.platform(),
        distro: os.type(),
        release: os.release(),
        hostname: os.hostname(),
        arch: os.arch()
    };
}

function getCPUInfos() {
    return si.cpu().then((cpu) => {
        return {
            manufacturer: cpu.manufacturer,
            brand: cpu.brand,
            speed: cpu.speed
        };
    });
}

function getDisksInfos() {
    return si.fsSize().then((disks) => {
        if(!disks) return null;
        return disks.map((disk) => {
            return {
                fs: disk.fs,
                size: disk.size,
                used: disk.used,
                available: disk.available
            }
        });
    });
}

function getMemoryInfos() {
    return si.memLayout().then((memory) => {
        return memory.map((mem) => {
            return {
                size: mem.size,
                bank: mem.bank,
                type: mem.type,
                clockSpeed: mem.clockSpeed,
                manufacturer: mem.manufacturer
            }
        });
    });
}

function getNetworkInfos() {
    return si.networkInterfaces().then((network) => {
        return network.map((iface) => {
            return {
                iface: iface.iface,
                ip4: iface.ip4,
                ip6: iface.ip6,
                mac: iface.mac,
                internal: iface.internal,
                virtual: iface.virtual
            }
        });
    });
}

function getCPUDetails() {
    return si.currentLoad().then((load) => {
        return {
            currentLoad: load.currentLoad,
            avgLoad: load.avgLoad * 10
        }
    });
}

function getMemoryDetails() {
    return si.mem().then((memory) => {
        return {
            total: memory.total,
            free: memory.free,
            used: memory.used
        }
    });
}

function getNetworkDetails() {
    return si.networkStats().then((networks) => {
        return networks.map((network) => {
            return {
                iface: network.iface,
                rx_sec: network.rx_sec,
                tx_sec: network.tx_sec
            }
        });
    });
}

function getDiskDetails() {
    return si.fsStats().then((disk) => {
        if(!disk) return { rx_sec: null, wx_sec: null }
        return {
            rx_sec: disk.rx_sec,
            wx_sec: disk.wx_sec
        }
    });
}

app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);

    Promise.all([si.osInfo(), si.cpu()])
        .then(([osInfos, cpuInfos]) => {
            console.log(`[OS] Platform: ${osInfos.platform}, Distro: ${osInfos.distro}, Release: ${osInfos.release}`)
            console.log(`[CPU] ${cpuInfos.manufacturer} ${cpuInfos.brand} ${cpuInfos.speed}GHz`)
        }).finally(() => {

        const formatGo = (bytes) => {
            return bytes && (bytes / 1024 / 1024 / 1024).toFixed(2)
        }

        const formatMo = (bytes) => {
            return bytes && (bytes / 1024 / 1024).toFixed(2)
        }

        // setInterval(() => {
        //     Promise.all([si.currentLoad(), si.mem(), si.networkStats(), si.fsSize(), si.fsStats()])
        //         .then(([load, memory, network, disks, diskStats]) => {
        //             console.log(`[CPU] Load: ${(load.currentLoad * 10).toFixed(2)}%`)
        //
        //             console.log(`[MEMORY] Total: ${formatGo(memory.total)}Go, Free: ${formatGo(memory.free)}Go, Used: ${formatGo(memory.used)}Go`)
        //             // console.log(`[DISK] Total: ${disk.total / 1024 / 1024 / 1024}, Free: ${disk.free / 1024 / 1024 / 1024}, Used: ${disk.used / 1024 / 1024 / 1024}`)
        //             disks.forEach((disk) => {
        //                 console.log(`[DISK] ${disk.fs} Total: ${formatGo(disk.size)}Go, Free: ${formatGo(disk.available)}, Used: ${disk.use}%`)
        //             })
        //             console.log(`[STATS NETWORK] Received: ${formatMo(network[0].rx_sec)} Mb/s, Transmitted: ${formatMo(network[0].tx_sec)} Mb/s`)
        //             if (diskStats) console.log(`[STATS DISK] Read: ${formatMo(diskStats.tx_sec)} Mb/s, Write: ${formatMo(diskStats.wx_sec)} Mb/s`)
        //             console.log("\n\n")
        //         })
        // }, 1000)
    })
});
