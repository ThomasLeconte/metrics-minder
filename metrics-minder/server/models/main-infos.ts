export type OsInfos = {
    platform: string
    distro: string
    release: string
    hostname: string
    arch: string
}

export type CpuInfos = {
    manufacturer: string,
    brand: string,
    speed: number
}

export type MemoryInfos = {
    size: number,
    bank: string,
    type: string,
    clockSpeed: number | null,
    manufacturer: string | undefined
}

export type DiskInfos = {
    fs: string,
    size: number,
    used: number,
    available: number
}

export type NetworkInfos = {
    iface: string,
    ip4: string,
    ip6: string,
    mac: string,
    internal: boolean,
    virtual: boolean
}
