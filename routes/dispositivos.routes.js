const { Router } = require('express');
const { response, request } = require('express');
const { check } = require('express-validator');

const router = Router();

const { dispositivosGet } = require('../controllers/dispositivos.controller');
const { validarCampos } = require('../middlewares/validar-campos');

router.get('/', dispositivosGet);



module.exports = router;