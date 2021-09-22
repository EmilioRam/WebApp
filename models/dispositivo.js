const { Schema, model } = require('mongoose');

const dispositivoSchema = Schema({
    deviceId: {
        type: String,
        required: [true, 'falta deviceId']
    },
    aula: {
        type: String,
        required: [true, 'falta aula']
    },
    activo: {
        type: Boolean,
        required: [true, 'falta activo (boolean)']
    }
});
module.exports = {
    dispositivo: model('dispositivo', dispositivoSchema)
}