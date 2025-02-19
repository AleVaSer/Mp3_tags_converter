const express = require('express');
const fileSystem = require('fs');
const tgBotApi = require('telegram-bot-api');
const cfg = require('../config/config');
const axios = require('axios');
const id3Reader = require('node-id3');
const iconv = require('iconv-lite');
const encodingDetector = require('jschardet');

const bot = new tgBotApi({
    'token' : cfg.token
});
//https://api.telegram.org/bot5052028419:AAFXpGBLZmzHBGuIcCYx-kgAQwZ_M7QHXT0/setWebhook?url=https://cdd7-78-158-202-140.ngrok.io/telegram/bot
module.exports = {
    async logger(req, res, next){
        let toAppend = await JSON.stringify(req.body);
        let fullReq = req.body;
        await fileSystem.appendFile('./miscellaneous/log.json', toAppend+',\n',(err) => {
            if (err) throw err;
        });

        if (req.body.message.document || req.body.message.audio != null) {
            res.locals.chat_id = fullReq.message.chat.id;
            res.locals.file_id = fullReq.message?.document?.file_id ?? fullReq.message?.audio?.file_id;
            res.locals.file_name = fullReq.message?.document?.file_name ?? fullReq.message?.audio?.file_name;
        };

        next();
    },
    //https://api.telegram.org/file/bot<token>/<file_path>
    async downloader(req, res, next){
        if (res.locals.file_id != null) {
            try {
                bot.sendMessage({
                    chat_id: res.locals.chat_id,
                    text: 'Аудио-файл получен. Начинаю обработку. Ожидайте.'
                });
                let filePathFromTelegram = await bot.getFile({file_id: res.locals.file_id});
                let filePath = filePathFromTelegram.file_path;
                let url = `https://api.telegram.org/file/bot${cfg.token}/${filePath}`;
                res.locals.file_path = `./miscellaneous/downloadedFiles/${res.locals.chat_id}+${res.locals.file_name}`;
                fileSystem.writeFileSync(`${res.locals.file_path}`, '');
                let writer = fileSystem.createWriteStream(`${res.locals.file_path}`);

                let toSaveOnDisk = await axios.get(
                    url,
                    { method: 'GET',
                    responseType: 'stream'
                }).then(toSaveOnDisk => {
                    return new Promise((resolve, reject) => {
                        toSaveOnDisk.data.pipe(writer);
                        let error = null;
                        writer.on('error', err => {
                            error = err;
                            writer.close();
                            reject(err);
                        });
                        writer.on('close', () => {
                            if (!error) {
                                resolve(true);
                            }
                        });
                    });
                });
            } catch (err) {
                console.log(err);
            }
        };
        next();
    },

    async mp3NameFixer(req, res, next) {
        if (res.locals.file_id != null) {

            let fileEncoding = await encodingDetector.detect(`./${res.locals.file_path}`);
            let options = { include: ['TALB', 'TIT1', 'TIT2', 'TPE1', 'TPE2', 'TSO2', 'TSOC', 'TSSE'] };
            let MP3TagsV1 = await id3Reader.read(res.locals.file_path);
            let MP3TagsV2 = await id3Reader.read(res.locals.file_path, options);
            let MP3TagsEncodedV1 = Buffer.from(JSON.stringify(MP3TagsV1), 'binary');
            let MP3TagsEncodedV2 = Buffer.from(JSON.stringify(MP3TagsV2), 'binary');
            let decodedMP3TagsV1 = await iconv.decode(MP3TagsEncodedV1, `${fileEncoding.encoding}`);
            let decodedMP3TagsV2 = await iconv.decode(MP3TagsEncodedV2, 'cp1251');
            await id3Reader.update(JSON.parse(decodedMP3TagsV1), res.locals.file_path);
            await id3Reader.update(JSON.parse(decodedMP3TagsV2), res.locals.file_path, options);

            await bot.sendAudio({
                chat_id: res.locals.chat_id,
                caption: 'Кодировка изменена',
                audio: fileSystem.createReadStream(`./${res.locals.file_path}`)
            });

            fileSystem.unlinkSync(`./${res.locals.file_path}`);
        }

        next();
    }
}

