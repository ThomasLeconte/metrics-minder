import si from 'systeminformation';
import {CpuInfos, OsInfos, MemoryInfos, NetworkInfos, DiskInfos} from './models/main-infos';

export class SystemMetrics {
    private static instance: SystemMetrics;
    private disksCompatibility: { fs: boolean; disksIO: boolean } = {
        fs: false,
        disksIO: false
    }

    private cacheInfos: {
        osInfos: OsInfos | null,
        cpuInfos: CpuInfos | null,
        memoryInfos: MemoryInfos[] | null,
        disksInfos: DiskInfos[] | null,
        networkInfos: NetworkInfos[] | null
    }

    private constructor() {
        this.checkCompatibility();
        this.cacheInfos = {
            osInfos: null,
            cpuInfos: null,
            memoryInfos: null,
            disksInfos: null,
            networkInfos: null
        };
    }

    private checkCompatibility() {
        Promise.all([si.fsStats(), si.disksIO()]) //first call always null
            .then(([fsStats, disksIO]) => {
                setTimeout(() => {
                    Promise.all([si.fsStats(), si.disksIO()])
                        .then(([fsStats, disksIO]) => {
                            this.disksCompatibility = {
                                fs: !!fsStats,
                                disksIO: !!disksIO
                            }
                            console.log(this.disksCompatibility)
                        });
                }, 1000);
            });
    }

    getMainInfos() {
        return Promise.all([
            this.getOSInfos(),
            this.getCPUInfos(),
            this.getMemoryInfos(),
            this.getDisksInfos(),
            this.getNetworkInfos()
        ]).then(([os, cpu, memory, disks, network]) => {
            return {
                os,
                cpu,
                memory,
                disks,
                network
            }
        });
    }

    getOSInfos() {
        if (this.cacheInfos.osInfos) return Promise.resolve(this.cacheInfos.osInfos);

        si.osInfo().then((os) => {
            this.cacheInfos.osInfos = {
                platform: os.platform.toString(),
                distro: os.distro,
                release: os.release,
                hostname: os.hostname,
                arch: os.arch
            };
        })

        return Promise.resolve(this.cacheInfos.osInfos);
    }

    getCPUInfos() {
        if (this.cacheInfos.cpuInfos) return Promise.resolve(this.cacheInfos.cpuInfos);
        return si.cpu().then((cpu) => {
            this.cacheInfos.cpuInfos = {
                manufacturer: cpu.manufacturer,
                brand: cpu.brand,
                speed: cpu.speed
            };

            return this.cacheInfos.cpuInfos;
        });
    }

    getDisksInfos() {
        if (this.cacheInfos.disksInfos) return Promise.resolve(this.cacheInfos.disksInfos);
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

            this.cacheInfos.disksInfos = filteredDisks
                .map((disk) => {
                    return {
                        fs: disk.fs,
                        size: disk.size,
                        used: disk.used,
                        available: disk.available
                    }
                });

            return this.cacheInfos.disksInfos;
        });
    }

    getMemoryInfos() {
        if (this.cacheInfos.memoryInfos) return Promise.resolve(this.cacheInfos.memoryInfos);
        return si.memLayout().then((memory) => {
            this.cacheInfos.memoryInfos = memory.map((mem) => {
                return {
                    size: mem.size,
                    bank: mem.bank,
                    type: mem.type,
                    clockSpeed: mem.clockSpeed,
                    manufacturer: mem.manufacturer
                }
            });

            return this.cacheInfos.memoryInfos;
        });
    }

    getNetworkInfos() {
        if (this.cacheInfos.networkInfos) return Promise.resolve(this.cacheInfos.networkInfos);
        return si.networkInterfaces().then((network) => {
            let result = Array.isArray(network) ? network : [network]

            this.cacheInfos.networkInfos = result.map((iface) => {
                return {
                    iface: iface.iface,
                    ip4: iface.ip4,
                    ip6: iface.ip6,
                    mac: iface.mac,
                    internal: iface.internal,
                    virtual: iface.virtual
                }
            });

            return this.cacheInfos.networkInfos;
        });
    }

    getCPUDetails() {
        return si.currentLoad().then((load) => {
            return {
                currentLoad: load.cpus.reduce((acc, v) => acc + v.load, 0),
                avgLoad: load.avgLoad * 10
            }
        });
    }

    getMemoryDetails() {
        return si.mem().then((memory) => {
            return {
                total: memory.total,
                free: memory.free,
                used: memory.used
            }
        });
    }

    getNetworkDetails() {
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

    getDiskDetails() {
        if (!this.disksCompatibility.fs && !this.disksCompatibility.disksIO) return Promise.resolve({rx_sec: null, wx_sec: null})

        else if (this.disksCompatibility.fs && !this.disksCompatibility.disksIO) {
            return si.fsStats().then((disk) => {
                return {
                    rx_sec: disk.rx_sec,
                    wx_sec: disk.wx_sec,
                    tx_sec: disk.tx_sec
                }
            });
        } else if (!this.disksCompatibility.fs && this.disksCompatibility.disksIO) {
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

    public static getInstance(): SystemMetrics {
        if (!SystemMetrics.instance) {
            SystemMetrics.instance = new SystemMetrics();
        }
        return SystemMetrics.instance;
    }
}