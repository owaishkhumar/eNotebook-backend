const mongoose = require('mongoose');

const dbConnnect = () => {
    mongoose.connect('mongodb://127.0.0.1:27017/enotebook')
        .then(() => console.log('Connected!'));
}

module.exports = dbConnnect