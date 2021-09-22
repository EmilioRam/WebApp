const mongoose = require('mongoose');
const Colors = require('colors');

const dbConnect = () => {

    try {

        mongoose.connect(process.env.MongoCon, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });

        console.log('Base de datos online'.green);

    } catch (error) {
        console.log(error);
        throw new Error('Error al conectar con Base de datos'.red);
    }


}

module.exports = {
    dbConnect
}