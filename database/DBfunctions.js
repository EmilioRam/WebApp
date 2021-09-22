const mongoose = require('mongoose');
const { lectura } = require('../models/lectura');
const { dispositivo } = require('../models/dispositivo');

const Colors = require('colors');

const guardarDB_lec = async(data) => {

    let lec = new lectura({
        messageId: data.messageId,
        deviceId: data.deviceId,
        timestamp: data.timestamp,
        timestampLocal: data.timestampLocal,
        CO2: data.CO2,
        temp: data.temp,
        hum: data.hum,
        tempBox: data.tempBox,
        humBox: data.humBox
    });

    lec.save((err, lec) => {

        if (err) {
            return console.log('error al guardar en DB de lecturas'.red);
        }

        return console.log('ok al guardar en DB de lecturas!!!'.green);

    });

}

const guardarDB_disp = (data) => {

    let disp = new dispositivo({
        deviceId: data.deviceId,
        aula: data.aula,
        activo: data.activo,
    });

    disp.save((err, disp) => {

        if (err) {
            return console.log('error al guardar en DB de dispositivos'.red);
        }

        return console.log('ok al guardar en DB de dispositivos!!!'.green);

    });

}


module.exports = {
    guardarDB_lec,
    guardarDB_disp
}