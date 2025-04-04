export function formatMemory(bytes: number) {
    return (bytes / 1e9).toFixed(2) + ' Go';
}

export function formatDisk(bytes: number) {
    return (bytes / 1e9).toFixed(2) + ' GB';
}

export function formatBytesToGiga(bytes: number) {
    return (bytes / 1e9).toFixed(2);
}

export function formatBytesToMega(bytes: number) {
    return (bytes / 1e6).toFixed(2);
}
