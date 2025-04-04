"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const os_1 = __importDefault(require("os"));
const systeminformation_1 = __importDefault(require("systeminformation"));
const cors_1 = __importDefault(require("cors"));
const node_os_utils_1 = __importDefault(require("node-os-utils"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const port = 3000;
let disksIOCompatibility = {
    fs: false,
    disksIO: false
};
let cacheInfos = {
    osInfos: null,
    cpuInfos: null,
    memoryInfos: null,
    disksInfos: null,
    networkInfos: null
};
app.get('/api/main-infos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        os: yield getOSInfos(),
        cpu: yield getCPUInfos(),
        memory: yield getMemoryInfos(),
        disks: yield getDisksInfos(),
        network: yield getNetworkInfos()
    });
}));
app.get('/api/cpu-infos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield getCPUDetails());
}));
app.get('/api/memory-infos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield getMemoryDetails());
}));
app.get('/api/network-infos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield getNetworkDetails());
}));
app.get('/api/disk-infos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield getDiskDetails());
}));
app.get('/api/disk-capacity-infos', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json(yield getDisksInfos());
}));
function getOSInfos() {
    if (cacheInfos.osInfos)
        return Promise.resolve(cacheInfos.osInfos);
    cacheInfos.osInfos = {
        platform: os_1.default.platform().toString(),
        distro: os_1.default.type(),
        release: os_1.default.release(),
        hostname: os_1.default.hostname(),
        arch: os_1.default.arch()
    };
    return Promise.resolve(cacheInfos.osInfos);
}
function getCPUInfos() {
    if (cacheInfos.cpuInfos)
        return Promise.resolve(cacheInfos.cpuInfos);
    return systeminformation_1.default.cpu().then((cpu) => {
        cacheInfos.cpuInfos = {
            manufacturer: cpu.manufacturer,
            brand: cpu.brand,
            speed: cpu.speed
        };
        return cacheInfos.cpuInfos;
    });
}
function getDisksInfos() {
    if (cacheInfos.disksInfos)
        return Promise.resolve(cacheInfos.disksInfos);
    return Promise.all([systeminformation_1.default.blockDevices(), systeminformation_1.default.fsSize()]).then(([blockDevices, disks]) => {
        console.log(blockDevices, disks);
        let filteredDisks = disks
            .filter(d => d.rw); //Filter non-virtual disks (for VPS) or read-only disks
        if (blockDevices && blockDevices.length > 0) {
            filteredDisks = filteredDisks
                .filter(d => blockDevices.find(b => b.mount === d.fs && b.physical !== "Network")); //Filter network disks
        }
        cacheInfos.disksInfos = filteredDisks
            .map((disk) => {
            return {
                fs: disk.fs,
                size: disk.size,
                used: disk.used,
                available: disk.available
            };
        });
        return cacheInfos.disksInfos;
    });
}
function getMemoryInfos() {
    if (cacheInfos.memoryInfos)
        return Promise.resolve(cacheInfos.memoryInfos);
    return systeminformation_1.default.memLayout().then((memory) => {
        cacheInfos.memoryInfos = memory.map((mem) => {
            return {
                size: mem.size,
                bank: mem.bank,
                type: mem.type,
                clockSpeed: mem.clockSpeed,
                manufacturer: mem.manufacturer
            };
        });
        return cacheInfos.memoryInfos;
    });
}
function getNetworkInfos() {
    if (cacheInfos.networkInfos)
        return Promise.resolve(cacheInfos.networkInfos);
    return systeminformation_1.default.networkInterfaces().then((network) => {
        let result = Array.isArray(network) ? network : [network];
        cacheInfos.networkInfos = result.map((iface) => {
            return {
                iface: iface.iface,
                ip4: iface.ip4,
                ip6: iface.ip6,
                mac: iface.mac,
                internal: iface.internal,
                virtual: iface.virtual
            };
        });
        return cacheInfos.networkInfos;
    });
}
function getCPUDetails() {
    node_os_utils_1.default.cpu.usage().then((usage) => console.log(usage));
    return systeminformation_1.default.currentLoad().then((load) => {
        return {
            currentLoad: load.cpus.reduce((acc, v) => acc + v.load, 0),
            avgLoad: load.avgLoad * 10
        };
    });
}
function getMemoryDetails() {
    return systeminformation_1.default.mem().then((memory) => {
        return {
            total: memory.total,
            free: memory.free,
            used: memory.used
        };
    });
}
function getNetworkDetails() {
    return systeminformation_1.default.networkStats().then((networks) => {
        return networks.map((network) => {
            return {
                iface: network.iface,
                rx_sec: network.rx_sec,
                tx_sec: network.tx_sec
            };
        });
    });
}
function getDiskDetails() {
    if (!disksIOCompatibility.fs && !disksIOCompatibility.disksIO)
        return Promise.resolve({ rx_sec: null, wx_sec: null });
    else if (disksIOCompatibility.fs && !disksIOCompatibility.disksIO) {
        return systeminformation_1.default.fsStats().then((disk) => {
            return {
                rx_sec: disk.rx_sec,
                wx_sec: disk.wx_sec,
                tx_sec: disk.tx_sec
            };
        });
    }
    else if (!disksIOCompatibility.fs && disksIOCompatibility.disksIO) {
        return systeminformation_1.default.disksIO().then((disk) => {
            return {
                rx_sec: disk.rIO_sec,
                wx_sec: disk.wIO_sec,
                tx_sec: disk.tIO_sec
            };
        });
    }
    else {
        return systeminformation_1.default.fsStats().then((fs) => {
            return {
                rx_sec: fs.rx_sec,
                wx_sec: fs.wx_sec,
                tx_sec: fs.tx_sec
            };
        });
    }
}
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Serveur en écoute sur le port ${port}`);
    yield Promise.all([systeminformation_1.default.fsStats(), systeminformation_1.default.disksIO()]); //first call always null
    setTimeout(() => {
        Promise.all([systeminformation_1.default.fsStats(), systeminformation_1.default.disksIO()])
            .then(([fsStats, disksIO]) => {
            disksIOCompatibility = {
                fs: !!fsStats,
                disksIO: !!disksIO
            };
            console.log(disksIOCompatibility);
        }).finally(() => {
            console.log("Client disponible sur http://localhost:3000");
            app.use(express_1.default.static('public'));
        });
    }, 1000);
}));
