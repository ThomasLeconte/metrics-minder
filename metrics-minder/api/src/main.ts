import express from 'express';
import os from 'os';
import si from "systeminformation";
import cors from 'cors';
import {CpuInfos, DiskInfos, MemoryInfos, NetworkInfos, OsInfos} from "./models/main-infos";
import osu from 'node-os-utils';

const app = express();
app.use(cors());
const port = 3000;

let disksIOCompatibility = {
    fs: false,
    disksIO: false
}

let cacheInfos = {
    osInfos: null as OsInfos | null,
    cpuInfos: null as CpuInfos | null,
    memoryInfos: null as MemoryInfos[] | null,
    disksInfos: null as DiskInfos[] | null,
    networkInfos: null as NetworkInfos[] | null
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

app.get('/api/disk-capacity-infos', async (req, res) => {
    res.json(await getDisksInfos());
});

function getOSInfos() {
    if (cacheInfos.osInfos) return Promise.resolve(cacheInfos.osInfos);
    cacheInfos.osInfos = {
        platform: os.platform().toString(),
        distro: os.type(),
        release: os.release(),
        hostname: os.hostname(),
        arch: os.arch()
    };

    return Promise.resolve(cacheInfos.osInfos);
}

function getCPUInfos() {
    if (cacheInfos.cpuInfos) return Promise.resolve(cacheInfos.cpuInfos);
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
    if (cacheInfos.disksInfos) return Promise.resolve(cacheInfos.disksInfos);
    return Promise.all([si.blockDevices(), si.fsSize()]).then(([blockDevices, disks]) => {
        console.debug("block devices", blockDevices)
        console.debug("disks", disks)

        let filteredDisks = disks
            .filter(d => d.rw); //Filter non-virtual disks (for VPS) or read-only disks

        if (blockDevices && blockDevices.length > 0) {
            let filteredBlocks = blockDevices
                .filter(b => b.physical !== "" && b.physical !== "Network" && b.type !== "loop" && filteredDisks.find(d => d.fs === b.device)); //Filter network disks and loop devices
            console.log(filteredDisks, filteredBlocks)
            if(filteredBlocks.length > 0) {
                filteredDisks = filteredDisks
                    .filter(d => filteredBlocks.find(b => b.device === d.fs)); //Filter network disks
            }
        }

        cacheInfos.disksInfos = filteredDisks
            .map((disk) => {
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
    if (cacheInfos.memoryInfos) return Promise.resolve(cacheInfos.memoryInfos);
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
    if (cacheInfos.networkInfos) return Promise.resolve(cacheInfos.networkInfos);
    return si.networkInterfaces().then((network) => {
        let result = Array.isArray(network) ? network : [network]

        cacheInfos.networkInfos = result.map((iface) => {
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
            currentLoad: load.cpus.reduce((acc, v) => acc + v.load, 0),
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
                wx_sec: disk.wx_sec,
                tx_sec: disk.tx_sec
            }
        });
    } else if (!disksIOCompatibility.fs && disksIOCompatibility.disksIO) {
        return si.disksIO().then((disk) => {
            return {
                rx_sec: disk.rIO_sec,
                wx_sec: disk.wIO_sec,
                tx_sec: disk.tIO_sec
            }
        });
    } else {
        return si.fsStats().then((fs) => {
            return {
                rx_sec: fs.rx_sec,
                wx_sec: fs.wx_sec,
                tx_sec: fs.tx_sec
            }
        });
    }
}

app.listen(port, async () => {
    console.log(`Serveur en écoute sur le port ${port}`);

    await Promise.all([si.fsStats(), si.disksIO()]) //first call always null

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
