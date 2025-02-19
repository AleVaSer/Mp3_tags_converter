const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = require('./routes/rtr');
const config = require('./config/config')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/telegram', router);
app.listen(3000, function() //порт
{
    console.log('Сервер ожидает подключения...')
});