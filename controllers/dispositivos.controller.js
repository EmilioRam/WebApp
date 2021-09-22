const { response, request } = require('express');
const { dispositivo } = require('../models/dispositivo');

const dispositivosGet = async(req = request, res = response) => {

    await dispositivo.find((err, result) => {
        if (err) {
            res.status(500).json({
                msg: 'ERROR en post API - controlador disps',
                contDocs: "0, error",
                dispositivos: "error, recargue la página"
            })
        } else {
            const dispositivos = result;
            const contDocs = dispositivos.length

            res.json({
                msg: 'post API - controlador disps',
                contDocs,
                dispositivos
            });
        }
    });
}



module.exports = {
    dispositivosGet
}