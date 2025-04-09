# Metrics minder
Very lite and simple web dashboard system metrics.

> Huge thanks to [systeminformations](https://github.com/sebhildebrandt/systeminformation) NodeJS library for providing all the system informations.

## Installation

You can run this project with docker with the following command:  
```shell
docker run -d -p 3000:3000 --name metricsminder thomasleconte/metricsminder:latest
```

You can also use docker compose. Here is a docker compose example:
````yaml
version: '3.8'

services:
  metricsminder:
    image: thomasleconte/metricsminder:latest
    container_name: metricsminder
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: always
````

## Metrics
The following metrics are displayed on the dashboard:
- System (OS)
- CPU (multiple cores)
- Memory
- Disk (not network disks or read-only disks)
- Disk I/O (not work on every system, known issue with Windows)
- Network I/O
