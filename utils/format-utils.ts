export function formatMemory(bytes: number) {
    return format(bytes, 'Go').toFixed(2) + ' Go';
}

export function formatDisk(bytes: number) {
    return format(bytes, 'Go').toFixed(2) + ' Go';
}

export function formatNetworkIO(bytes: number, unit: 'MB' | 'KB' = 'MB') {
    return format(bytes, unit).toFixed(2) + `${unit}/s`;
}

export function formatDiskIO(bytes: number, unit: 'MB' | 'KB' = 'MB') {
    return format(bytes, unit).toFixed(2) + `${unit}/s`;
}

export function formatToKb(bytes: number) {
    return format(bytes, 'KB');
}

export function formatToMb(bytes: number) {
    return format(bytes, 'MB');
}

export function formatToGb(bytes: number) {
    return format(bytes, 'GB');
}

function format(bytes: number, unit: 'Go' | 'GB' | 'Mo' | 'MB' | 'Ko' | 'KB') {
    switch(unit) {
        case 'Go':
            return (bytes / 1024 ** 3);
        case 'GB':
            return (bytes / 1000 ** 3);
        case 'Mo':
            return (bytes / 1024 ** 2);
        case 'MB':
            return (bytes / 1000 ** 2);
        case 'Ko':
            return (bytes / 1024);
        case 'KB':
            return (bytes / 1000);
        default:
            return bytes;
    }
}
