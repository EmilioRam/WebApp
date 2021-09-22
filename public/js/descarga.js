// const axios = require('axios');

$(document).ready(() => {

    class DispositivosBD { //objeto que contiene array de dispositivos en BD. Cada dispositivo  con deviceId, aula y activo (boolean)
        constructor() {
            this.devices = [];
        }

        // Devuelve un deviceId, partiendo del aula
        getDeviceId(aula) {

            return this.devices.find(element => element.aula == aula).deviceId;

        }

        getDevicesCount() {
            return this.devices.length;
        }
    }

    var dispositivosBD = new DispositivosBD();

    class Lecturas {
        constructor() {
            this.lecs = [];
        }
    }

    var lecturas = new Lecturas();

    const dispositivos = document.getElementById('dispositivos');
    const selectorFechaini = document.getElementById('fechaini');
    const selectorfechafin = document.getElementById('fechafin');

    // obtener aulas asignadas a cada dispositivo y rellenar desplegable

    const obtenerAulas = async() => {
        await getDispAulas( /*dispositivosBD*/ );
    }
    obtenerAulas();

    // Si hay un cambio en el desplegable de aula, se configura la fecha mínima seleccionable y se activa botón "visualizar"
    function DispOnSelectionChange() {
        configFechas( /*dispositivosBD*/ );
        document.getElementById('enviar').disabled = false;
    }
    dispositivos.addEventListener('change', DispOnSelectionChange, false);

    // Si hay cambio en el selector fecha/hora inicial, se configura la fecha máxima seleccionable
    function FechainiOnSelectionChange() {
        configFechaFin( /*dispositivosBD*/ );
        selectorfechafin.disabled = false;
    }
    selectorFechaini.addEventListener('change', FechainiOnSelectionChange, false);

    // Botón para resetear el zoom de la gráfica
    document.getElementById("resetzoom").onclick = (event) => {
        console.log("reseteando zoom");
        myLineChart.resetZoom();

    }

    // Botón visualizar (solo funciona si hay seleccionada aula, fecha/hora min y fecha/hora max)
    document.getElementById("enviar").onclick = (event) => {

        const aula = dispositivos[dispositivos.selectedIndex].text;
        // const deviceid = dispositivosBD.getDeviceId(aula);
        const fechaini = document.getElementById("fechaini");
        const fechafin = document.getElementById("fechafin");

        if ((!fechaini.value.length == 0) && (!fechafin.value.length == 0)) {
            event.preventDefault(); //al ser un botón de formulario, con esto evitamos que recargue la página
            console.log(fechaini.value);
            console.log(fechafin.value);
            //console.log(new Date(fechaini.value));
            csvbutton = document.getElementById('csvbutton');
            csvbutton.disabled = false;
            csvbutton.classList.remove('disabled');
            document.getElementById('resetzoom').disabled = false;

            //configFechas( /*dispositivosBD*/ ); ////////////////////////////////////////////////////////////////////////

            getLecturas(aula, fechaini.value, fechafin.value);


        } else {
            console.log("faltan campos");
        }

    }

    // ================GRAFICA================

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
        plugins: {
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'xy',
                },
                pan: {
                    enabled: true,
                    mode: 'xy'
                }
            }
        },
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




    function configFechas( /*dispositivosBD*/ ) {

        axios.post('/api/lecturas/primera', {
            deviceid: dispositivosBD.getDeviceId(dispositivos[dispositivos.selectedIndex].text) //dispositivos[dispositivos.selectedIndex].text
        }).then(async function(response) {

            // const fechaini = document.getElementById("fechaini");
            // const fechafin = document.getElementById("fechafin");

            console.log(response);

            let fechamin = await new Date(response.data.primera.timestamp)
            fechamin = await new Date(fechamin.setHours(fechamin.getHours() + 2)).toISOString().slice(0, -8) //Para España sumar 2 horas
                // console.log(fechamin);

            let fechamax = await new Date()
            fechamax = await new Date(fechamax.setHours(fechamax.getHours() + 2)).toISOString().slice(0, -8) //Para España sumar 2 horas
                // console.log(fechamax);

            selectorFechaini.value = "";

            selectorFechaini.setAttribute("min", fechamin);
            selectorFechaini.setAttribute("max", fechamax);

            selectorfechafin.setAttribute("max", fechamax);

            selectorFechaini.disabled = false;
            selectorfechafin.value = ""; ///////////////////////////////////
            selectorfechafin.disabled = true; //////////////////////////////

            // console.log(new Date());

        }).catch(function(error) {
            console.log(error);
        })
    }

    function configFechaFin( /*dispositivosBD*/ ) {
        selectorfechafin.setAttribute("min", selectorFechaini.value);
        selectorfechafin.value = "";
    };

    async function getDispAulas( /*dispositivosBD*/ ) {
        axios.get('/api/dispositivos').then(function(response) {

            const dispositivosenBD = response.data.dispositivos;
            //console.log(dispositivosBD);
            dispositivosenBD.forEach(disp => {

                // Creamos opciones en desplegable aula
                dispositivosBD.devices.push(disp);

                const node = document.createElement('option');
                const nodeText = document.createTextNode(disp.aula);
                node.appendChild(nodeText);
                dispositivos.appendChild(node);
            });

            console.log(`dispositivos en BD: `, dispositivosBD.devices);

        }).catch(function(error) {
            console.log(error);
        })

    }

    async function getLecturas(aula, fechainicio, fechafin) {
        console.log("realizando peticion...");
        const deviceid = dispositivosBD.getDeviceId(aula);
        axios.post('/api/lecturas', {
                deviceid,
                fechainicio: new Date(fechainicio),
                fechafin: new Date(fechafin)
            })
            .then(async function(response) {


                lecturas.lecs = response.data.lecturas //guardamos las lecturas para el csv

                console.log(lecturas.lecs);

                const campos = await lecturas.lecs.map((lectura) => {
                    return new Object({
                        timestampLocal: lectura.timestampLocal,
                        temp: lectura.temp,
                        hum: lectura.hum,
                        CO2: lectura.CO2
                    })
                });

                console.log("campos:", campos);
                // console.log('csv:\n', convertToCSV(campos));
                exportCSVFile(campos, `${aula}_${fechainicio}_${fechafin}`);

                const temp = await lecturas.lecs.map(lectura => lectura.temp);
                const hum = await lecturas.lecs.map(lectura => lectura.hum);
                const CO2 = await lecturas.lecs.map(lectura => lectura.CO2);
                const timestamp = await lecturas.lecs.map(lectura => lectura.timestampLocal.slice(0, -3));

                console.log('temp', temp);
                console.log('hum', hum);
                console.log('CO2', CO2);
                console.log('timestamp', timestamp);

                // pintamos en la gráfica:
                chartData.labels = timestamp;
                chartData.datasets[0].data = temp;
                chartData.datasets[1].data = hum;
                chartData.datasets[2].data = CO2;

                myLineChart.update();

                return;

            }).catch(function(error) {
                console.log(error);
            })
    }

    function exportCSVFile(items, fileName) {
        // if (headers) {
        //     items.unshift(headers);
        // }
        const jsonObject = JSON.stringify(items);
        const csv = convertToCSV(jsonObject);
        const exportName = fileName + ".csv" || "export.csv";
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, exportName);
        } else {
            let link = document.createElement("a"); //sobra
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);

                link = document.getElementById("csvbutton")
                link.setAttribute("href", url);
                link.setAttribute("download", exportName);
                //link.style.visibility = "hidden";
                //document.getElementById("csvbutton").appendChild(link)
                //document.body.appendChild(link);
                //link.click();
                //document.body.removeChild(link);
            }
        }
    }

    function convertToCSV(objArray) {
        const array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
        let str = "";

        // nombres de columnas
        let line = "";
        for (let index in array[0]) {
            if (line != "") {
                line += ";";
            }
            line += index;
        }
        str += line + "\r\n";

        // Resto de lineas
        for (let i = 0; i < array.length; i++) {
            let line = "";
            for (let index in array[i]) {

                if (line != "") {
                    line += ";";
                }

                line += array[i][index].toString().replace(/\./g, ',');

            }
            str += line + "\r\n";
        }
        return str;
    }


});