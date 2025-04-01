const express = require('express');
const osUtils = require('os-utils');
const os = require('os');
const app = express();
const port = 3000;

// Endpoint pour obtenir l'utilisation du CPU
app.get('/api/cpu', (req, res) => {
    osUtils.cpuUsage((usage) => {
        res.json({ cpuUsage: usage });
    });
});

// Endpoint pour obtenir l'utilisation de la RAM
app.get('/api/memory', (req, res) => {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    res.json({ memoryUsage, totalMemory, freeMemory, usedMemory });
});

// Endpoint pour obtenir l'utilisation de l'espace disque
app.get('/api/disk', (req, res) => {
    const totalDisk = os.totalmem();
    const freeDisk = os.freemem();
    const usedDisk = totalDisk - freeDisk;
    const diskUsage = (usedDisk / totalDisk) * 100;
    res.json({ diskUsage, totalDisk, freeDisk, usedDisk });
});

// Endpoint pour obtenir l'utilisation du réseau
app.get('/api/network', (req, res) => {
    const networkInterfaces = os.networkInterfaces();
    res.json(networkInterfaces);
});

app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
    console.log("CPU : " + os.cpus()[0].model);
    console.log("Vitesse CPU : " + os.cpus()[0].speed + " MHz");
    console.log("Nombre de coeurs : " + os.cpus().length);
    osUtils.cpuUsage((usage) => {
        console.log("CPU usage", usage);
    });
    osUtils.cpuFree((free) => {
        console.log("Free CPU", free);
    });
    osUtils.harddrive((hd) => {
        console.log("Hard drive", hd);
    });
    console.log("RAM : " + os.totalmem() + " octets");
    console.log("Espace disque : " + os.totalmem() + " octets");
    console.log("OS : " + os.type());
    console.log("Plateforme : " + os.platform());
    console.log("Architecture : " + os.arch());
    console.log("Version : " + os.release());
    console.log("Hostname : " + os.hostname());
    console.log("Réseau : " + os.networkInterfaces());
    console.log("Utilisateur : " + os.userInfo());
    console.log("Temps de fonctionnement : " + os.uptime() + " secondes");
});
