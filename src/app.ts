import express from 'express'
import bodyParser from 'body-parser'
import router from './routes/rtr.js'
const app = express()


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/telegram', router);
app.listen(3000, function() //порт
{
    console.log('Сервер ожидает подключения...')
});
