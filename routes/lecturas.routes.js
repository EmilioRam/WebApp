const { Router } = require('express');
const { check } = require('express-validator');

const router = Router();

const { lecturasPost, primeraLectura, ultimasLecturas } = require('../controllers/lecturas.controller');
const { validarCampos } = require('../middlewares/validar-campos');

router.post('/', [
    check('deviceid', 'Es necesario especificar el deviceid').not().isEmpty(),
    check('fechainicio', 'Es necesario especificar fechainicio').not().isEmpty(),
    check('fechafin', 'Es necesario especificar la fechafin').not().isEmpty(),
    validarCampos
], lecturasPost);

router.post('/primera', [
    check('deviceid', 'Es necesario especificar el deviceid').not().isEmpty(),
    validarCampos
], primeraLectura);

router.post('/ultimas', [
    check('deviceid', 'Es necesario especificar el deviceid').not().isEmpty(),
    validarCampos
], ultimasLecturas);


module.exports = router;