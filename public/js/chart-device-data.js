/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
$(document).ready(() => {
    // if deployed to a site supporting SSL, use wss://
    const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
    const webSocket = new WebSocket(protocol + location.host);


    class DispositivosenBD {
        constructor() {
            this.devices = [];
        }

        // Find a device based on its Id
        getDeviceAula(id) {

            let devicefound = this.devices.find(element => element.deviceId == id)

            if (devicefound) {
                return devicefound.aula;
            } else {
                return;
            }

        }

        getDeviceId(aula) {

            let devicefound = this.devices.find(element => element.aula == aula);

            if (devicefound) {
                return devicefound.deviceId;
            } else {
                return;
            }

        }

        getDevicesCount() {
            return this.devices.length;
        }
    }

    var dispositivosBD = new DispositivosenBD();

    const obtenerAulas = async() => {
        await getDispAulas( /*dispositivosBD*/ );
    }
    obtenerAulas();

    async function getDispAulas( /*dispositivosBD*/ ) {
        axios.get('/api/dispositivos').then(function(response) {

            const dispositivosenBD = response.data.dispositivos;
            //console.log(dispositivosBD);
            dispositivosenBD.forEach(disp => {

                // console.log(disp.deviceId);
                dispositivosBD.devices.push(disp);
            });

            console.log(`dispositivos en BD: `, dispositivosBD.devices);

        }).catch(function(error) {
            console.log(error);
        })

    }

    // A class for holding the last N points of telemetry for a device
    class DeviceData {
        constructor(deviceId) {
            this.deviceId = deviceId;
            this.aula = "";
            this.maxLen = 60;
            this.timeData = new Array(this.maxLen);
            this.temperatureData = new Array(this.maxLen);
            this.humidityData = new Array(this.maxLen);
            this.co2Data = new Array(this.maxLen); //////////////
        }

        addData(time, temp, hum, co2) {
            this.timeData.push(time);
            this.temperatureData.push(temp);
            this.humidityData.push(hum || null);
            this.co2Data.push(co2); /////////////

            if (this.timeData.length > this.maxLen) {
                this.timeData.shift();
                this.temperatureData.shift();
                this.humidityData.shift();
                this.co2Data.shift(); ///////////////
            }
        }

    }

    // All the devices in the list (those that have been sending telemetry)
    class TrackedDevices {
        constructor() {
            this.devices = [];
        }

        // Find a device based on its Id
        findDevice(deviceId) {
            for (let i = 0; i < this.devices.length; ++i) {
                if (this.devices[i].deviceId === deviceId) {
                    return this.devices[i];
                }
            }

            return undefined;
        }

        getDeviceAula(id) {

            let devicefound = this.devices.find(element => element.deviceId == id)

            if (devicefound) {
                return devicefound.aula;
            } else {
                return;
            }

        }

        getDeviceId(aula) {

            let devicefound = this.devices.find(element => element.aula == aula);

            if (devicefound) {
                return devicefound.deviceId;
            } else {
                return;
            }

        }

        getDevicesCount() {
            return this.devices.length;
        }
    }

    const trackedDevices = new TrackedDevices();

    // Define the chart axes

    const chartData = {
        datasets: [{
                fill: false,
                label: 'Temperatura',
                yAxisID: 'Temperatura',
                borderColor: 'rgba(255, 204, 0, 1)',
                pointBoarderColor: 'rgba(255, 204, 0, 1)',
                backgroundColor: 'rgba(255, 204, 0, 0.4)',
                pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
                pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
                spanGaps: true,
            },
            {
                fill: false,
                label: 'Humedad',
                yAxisID: 'Humedad',
                borderColor: 'rgba(24, 120, 240, 1)',
                pointBoarderColor: 'rgba(24, 120, 240, 1)',
                backgroundColor: 'rgba(24, 120, 240, 0.4)',
                pointHoverBackgroundColor: 'rgba(24, 120, 240, 1)',
                pointHoverBorderColor: 'rgba(24, 120, 240, 1)',
                spanGaps: true,
            },
            {
                fill: false,
                label: 'CO2',
                yAxisID: 'CO2',
                borderColor: 'rgba(240, 100, 60, 1)',
                pointBoarderColor: 'rgba(240, 100, 60, 1)',
                backgroundColor: 'rgba(240, 100, 60, 0.4)',
                pointHoverBackgroundColor: 'rgba(240, 100, 60, 1)',
                pointHoverBorderColor: 'rgba(240, 100, 60, 1)',
                spanGaps: true,
            }
        ]
    };

    const chartOptions = {
        responsive: true,

        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Fecha/hora'
                },
                ticks: {
                    major: {
                        enabled: true
                    },
                    autoSkip: true,
                    minRotation: 45,
                    maxRotation: 90
                }
            },
            Temperatura: {
                type: 'linear',
                title: {
                    text: 'Temperatura (ºC)',
                    display: true,
                },
                position: 'left',
            },
            Humedad: {
                type: 'linear',
                title: {
                    text: 'Humedad (%)',
                    display: true,
                },
                position: 'right',
            },
            CO2: { /////////////////////////////////////
                type: 'linear',
                display: true,
                title: {
                    text: 'CO2 (ppm)',
                    display: true,
                },
                position: 'left',
            }

        }
    };

    // Get the context of the canvas element we want to select
    const ctx = document.getElementById('iotChart').getContext('2d');
    const myLineChart = new Chart(
        ctx, {
            type: 'line',
            data: chartData,
            options: chartOptions,
        });

    // Manage a list of devices in the UI, and update which device data the chart is showing
    // based on selection
    let needsAutoSelect = true;
    const deviceCount = document.getElementById('deviceCount');
    const listOfDevices = document.getElementById('listOfDevices');
    let selectedDevice; /////////////

    function OnSelectionChange() {
        const aulasel = listOfDevices[listOfDevices.selectedIndex].text; // puede ser el aula o el id (si no esta en BD con aula asignada)
        const deviceId = trackedDevices.getDeviceId(aulasel);

        const device = trackedDevices.findDevice(deviceId);
        selectedDevice = listOfDevices[listOfDevices.selectedIndex].text; /////////////

        chartData.labels = device.timeData;
        chartData.datasets[0].data = device.temperatureData;
        chartData.datasets[1].data = device.humidityData;
        chartData.datasets[2].data = device.co2Data;

        myLineChart.update();
    }
    listOfDevices.addEventListener('change', OnSelectionChange, false);

    // When a web socket message arrives:
    // 1. Unpack it
    // 2. Validate it has date/time and temperature
    // 3. Find or create a cached device to hold the telemetry data
    // 4. Append the telemetry data
    // 5. Update the chart UI
    webSocket.onmessage = function onMessage(message) {
        try {
            const messageData = JSON.parse(message.data);
            console.log(messageData);

            // time and either temperature or humidity are required
            if (!messageData.MessageDate || (!messageData.IotData.temp && !messageData.IotData.hum && !messageData.IotData.CO2)) { //////////////
                return;
            }

            const formatedDate = messageData.MessageDate.slice(0, -3); //quitamos los segundos

            console.log(formatedDate);

            // find or add device to list of tracked devices
            const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);

            if (existingDeviceData) {
                existingDeviceData.addData(formatedDate, messageData.IotData.temp, messageData.IotData.hum, messageData.IotData.CO2); //////////

                updateCard(existingDeviceData.aula, formatedDate, messageData.IotData.temp, messageData.IotData.hum, messageData.IotData.CO2) //////////////

            } else {
                const newDeviceData = new DeviceData(messageData.DeviceId);

                //buscamos si esta en BD, y si está guardamos su aula, si no su aula será el deviceId mismo
                const aula = dispositivosBD.getDeviceAula(messageData.DeviceId);
                if (aula) {
                    newDeviceData.aula = aula;
                } else {
                    newDeviceData.aula = messageData.DeviceId;
                }

                trackedDevices.devices.push(newDeviceData);
                const numDevices = trackedDevices.getDevicesCount();
                deviceCount.innerText = numDevices === 1 ? `${numDevices} dispositivo` : `${numDevices} dispositivos`;

                // primera vez consulta y visualización de las últimas 60 lecturas


                axios.post('/api/lecturas/ultimas', {
                        deviceid: messageData.DeviceId
                    })
                    .then(async function(response) {

                        //console.log(response.data);

                        const ultimas = response.data.ultimas;

                        //console.log(ultimas);

                        temp = await ultimas.map(lectura => lectura.temp).reverse();
                        hum = await ultimas.map(lectura => lectura.hum).reverse();
                        CO2 = await ultimas.map(lectura => lectura.CO2).reverse();
                        timestamp = await ultimas.map(lectura => lectura.timestampLocal.slice(0, -3)).reverse();

                        newDeviceData.timeData = timestamp;
                        newDeviceData.temperatureData = temp;
                        newDeviceData.humidityData = hum;
                        newDeviceData.co2Data = CO2;

                        //newDeviceData.addData(formatedDate, messageData.IotData.temp, messageData.IotData.hum, messageData.IotData.CO2); ////////////////

                        // add device to the UI list
                        const node = document.createElement('option');

                        let nodeText = document.createTextNode(newDeviceData.aula); //su aula (que serra su deviceId en caso de no tener asignada (no estar en BD))
                        // const nodeText = document.createTextNode(messageData.DeviceId);
                        node.appendChild(nodeText);
                        listOfDevices.appendChild(node);

                        // if this is the first device being discovered, auto-select it
                        if (needsAutoSelect) {
                            console.log("estamos aqui en el autoselect");
                            needsAutoSelect = false;
                            listOfDevices.selectedIndex = 0;
                            OnSelectionChange();
                        }

                        newCard(newDeviceData.aula, formatedDate, messageData.IotData.temp, messageData.IotData.hum, messageData.IotData.CO2)

                        return;

                    }).catch(function(error) {
                        console.log("error en la peticion axios:", error);
                    })

            }

            myLineChart.update();

        } catch (err) {
            console.error(err);
        }
    };

    function newCard(aula, mDate, temp, hum, CO2) {

        document.getElementById("esperando").innerHTML = ""

        const cards = document.getElementById('lecturas');

        const nuevacard = document.createElement('div');
        nuevacard.className = "col";

        const textColor = selectTextColor(CO2);

        card =
            `<div class="card h-100" id="card_${aula}">
                <div class="card-header">
                    <h3>${aula}</h3>
                </div>
                <div class="card-body">
                    <h5 class="card-title">CO2:</h5>
                    <h2 class="card-text text-center ${textColor} co2">
                        ${CO2} ppm
                    </h2>
                    <h5 class="card-title">temp/hum:</h5>
                    <h5 class="card-text text-center text-primary temphum">
                        ${temp} ºC / ${hum} %
                    </h5>
                </div>
                <div class="card-footer">
                    <small class="text-muted date">${mDate}</small>
                </div>
            </div>`;

        nuevacard.innerHTML = card;
        cards.appendChild(nuevacard);
    }

    function updateCard(aula, mDate, temp, hum, CO2) {

        const card = document.getElementById(`card_${aula}`);
        co2val = card.getElementsByClassName('co2')[0];
        thval = card.getElementsByClassName('temphum')[0];
        dateval = card.getElementsByClassName('date')[0];

        const textColor = selectTextColor(CO2);

        co2val.classList.remove("text-success", "text-warning", "text-danger");
        co2val.classList.add(textColor);

        co2val.innerHTML = `${CO2} ppm`;
        thval.innerHTML = `${temp} ºC / ${hum} %`;
        dateval.innerHTML = `${mDate}`;

    }

    function selectTextColor(CO2) {

        let color = '';

        if (CO2 <= 800) {

            color = 'text-success';

        } else
        if (CO2 > 800 && CO2 <= 1200) {

            color = 'text-warning';

        } else {

            color = 'text-danger';

        }

        return color;
    }


});