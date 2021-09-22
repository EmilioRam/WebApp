const { Schema, model } = require('mongoose');

const lecturaSchema = Schema({
    messageId: {
        type: Number,
        required: [true, 'falta messageId']
    },
    deviceId: {
        type: String,
        required: [true, 'falta deviceId']
    },
    timestamp: {
        type: Date,
        required: [true, 'falta timestamp']
    },
    timestampLocal: {
        type: String,
        required: [true, 'falta timestamp']
    },
    CO2: {
        type: Number,
        default: 0,
        required: [true, 'falta CO2']
    },
    temp: {
        type: Number,
        default: 0,
        required: [true, 'falta temp']
    },
    hum: {
        type: Number,
        default: 0,
        required: [true, 'falta hum']
    },
    tempBox: {
        type: Number,
        default: 0,
        required: [true, 'falta tempBox']
    },
    humBox: {
        type: Number,
        default: 0,
        required: [true, 'falta humBox']
    }
}, { capped: 104857600 }); // "capamos" la Coleccion a 100MB de memoria para que no crezca indefinidamente);

module.exports = {
    lectura: model('lectura', lecturaSchema)
}