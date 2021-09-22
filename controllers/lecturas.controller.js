const { response, request } = require('express');
const { lectura } = require('../models/lectura');

const lecturasPost = async(req = request, res = response) => {

    const { deviceid, fechainicio, fechafin } = req.body;

    console.log("fechainicio que llega es: ", fechainicio);
    console.log("fechainicio con new Date es: ", new Date(fechainicio));
    console.log("fechafin que llega es: ", fechafin);
    console.log("fechafin con new Date es: ", new Date(fechafin));


    await lectura.find({
        $and: [
            { deviceId: deviceid },
            { timestamp: { $gte: new Date(fechainicio) } },
            { timestamp: { $lte: new Date(fechafin) } }
        ]
    }, 'CO2 temp hum timestampLocal', (err, result) => {
        if (err) {

            res.status(500).json({
                msg: 'error en post API - controlador',
                contDocs: "0, error",
                deviceid,
                fechainicio,
                fechafin,
                lecturas: "error, recargue la página"
            });
        } else {
            const lecturas = result;
            const contDocs = lecturas.length

            res.json({
                msg: 'post API - controlador',
                contDocs,
                deviceid,
                fechainicio,
                fechafin,
                lecturas
            });
        }
    });

}

const primeraLectura = async(req = request, res = response) => {

    const { deviceid } = req.body;

    await lectura.findOne({ deviceId: deviceid }, ' timestamp timestampLocal', (err, result) => {
        if (err) {

            res.status(500).json({
                msg: 'error get API - controlador - primera',
                deviceid,
                primera: "error, recargue la página"
            })

        } else {
            const primera = result;

            res.json({
                msg: 'get API - controlador - primera',
                deviceid,
                primera
            });

        }
    });

}

const ultimasLecturas = async(req = request, res = response) => {

    const { deviceid } = req.body;

    const ultimas = await lectura.find({ deviceId: deviceid }, 'CO2 temp hum timestampLocal')
        .sort({ timestamp: -1 }).limit(60);

    const contDocs = ultimas.length;

    res.json({
        msg: 'get API - controlador - ultimas',
        contDocs,
        deviceid,
        ultimas
    });

}

module.exports = {
    lecturasPost,
    primeraLectura,
    ultimasLecturas
}