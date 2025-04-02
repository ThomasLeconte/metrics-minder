const express = require('express');
const os = require('os');
const si = require("systeminformation");
const app = express();
const port = 3000;

let disksIOCompatibility = {
    fs: false,
    disksIO: false
}

let cacheInfos = {
    osInfos: null,
    cpuInfos: null,
    memoryInfos: null,
    disksInfos: null,
    networkInfos: null
}

app.get('/api/main-infos', async (req, res) => {
    res.json({
        os: await getOSInfos(),
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
    if(cacheInfos.osInfos) return Promise.resolve(cacheInfos.osInfos);
    cacheInfos.osInfos = {
        platform: os.platform(),
        distro: os.type(),
        release: os.release(),
        hostname: os.hostname(),
        arch: os.arch()
    };

    return Promise.resolve(cacheInfos.osInfos);
}

function getCPUInfos() {
    if(cacheInfos.cpuInfos) return Promise.resolve(cacheInfos.cpuInfos);
    return si.cpu().then((cpu) => {
        cacheInfos.cpuInfos = {
            manufacturer: cpu.manufacturer,
            brand: cpu.brand,
            speed: cpu.speed
        };

        return cacheInfos.cpuInfos;
    });
}

function getDisksInfos() {
    if(cacheInfos.disksInfos) return Promise.resolve(cacheInfos.disksInfos);
    return si.fsSize().then((disks) => {
        cacheInfos.disksInfos = disks.filter(d => d.rw).map((disk) => {
            return {
                fs: disk.fs,
                size: disk.size,
                used: disk.used,
                available: disk.available
            }
        });

        return cacheInfos.disksInfos;
    });
}

function getMemoryInfos() {
    if(cacheInfos.memoryInfos) return Promise.resolve(cacheInfos.memoryInfos);
    return si.memLayout().then((memory) => {
        cacheInfos.memoryInfos = memory.map((mem) => {
            return {
                size: mem.size,
                bank: mem.bank,
                type: mem.type,
                clockSpeed: mem.clockSpeed,
                manufacturer: mem.manufacturer
            }
        });

        return cacheInfos.memoryInfos;
    });
}

function getNetworkInfos() {
    if(cacheInfos.networkInfos) return Promise.resolve(cacheInfos.networkInfos);
    return si.networkInterfaces().then((network) => {
        cacheInfos.networkInfos = network.map((iface) => {
            return {
                iface: iface.iface,
                ip4: iface.ip4,
                ip6: iface.ip6,
                mac: iface.mac,
                internal: iface.internal,
                virtual: iface.virtual
            }
        });

        return cacheInfos.networkInfos;
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
    if (!disksIOCompatibility.fs && !disksIOCompatibility.disksIO) return Promise.resolve({rx_sec: null, wx_sec: null})

    else if (disksIOCompatibility.fs && !disksIOCompatibility.disksIO) {
        return si.fsStats().then((disk) => {
            return {
                rx_sec: disk.rx_sec,
                wx_sec: disk.wx_sec
            }
        });
    } else return si.disksIO().then((disk) => {
        return {
            rx_sec: disk.rIO_sec,
            wx_sec: disk.wIO_sec
        }
    });
}

app.listen(port, async () => {
    console.log(`Serveur en écoute sur le port ${port}`);

    await Promise.all([si.fsStats(), si.disksIO()]) //first call always null

    await si.fsSize().then((r) => console.log(r));

    setTimeout(() => {
        Promise.all([si.fsStats(), si.disksIO()])
            .then(([fsStats, disksIO]) => {
                disksIOCompatibility = {
                    fs: !!fsStats,
                    disksIO: !!disksIO
                }
                console.log(disksIOCompatibility)
            }).finally(() => {
                console.log("Client disponible sur http://localhost:3000")
                app.use(express.static('public'));
            });
    }, 1000);
});
