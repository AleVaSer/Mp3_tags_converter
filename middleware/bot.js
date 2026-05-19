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
module.exports = {
    async logger(req, res, next){
        let toAppend = JSON.stringify(req.body);
        await fileSystem.promises.appendFile('./miscellaneous/log.json', toAppend + ',\n');

        if (req.body?.message?.document != null || req.body?.message?.audio != null) {
            res.locals.chat_id = req.body.message.chat.id;
            res.locals.file_id = req.body.message?.document?.file_id ?? req.body.message?.audio?.file_id;
            res.locals.file_name = req.body.message?.document?.file_name ?? req.body.message?.audio?.file_name;
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
                let writer = fileSystem.createWriteStream(`${res.locals.file_path}`);

                const response = await axios.get(url, { responseType: 'stream' });

                await new Promise((resolve, reject) => {
                    response.data.pipe(writer);
                    writer.on('error', err => {
                        writer.close();
                        reject(err);
                    });
                    writer.on('close', () => {
                        resolve(true);
                    });
                });
            } catch (err) {
                bot.sendMessage({
                    chat_id: res.locals.chat_id,
                    text: 'Ошибка'
                });
                console.log(err);
            }
        };
        next();
    },

    async mp3NameFixer(req, res, next) {
        try {
            if (res.locals.file_id != null) {
                let fileContents = fileSystem.readFileSync(res.locals.file_path)

                let fileEncoding = encodingDetector.detect(fileContents)
                let options = { include: ['TALB', 'TIT1', 'TIT2', 'TPE1', 'TPE2', 'TSO2', 'TSOC', 'TSSE'] }
                let MP3TagsV1 = id3Reader.read(res.locals.file_path)
                let MP3TagsV2 = id3Reader.read(res.locals.file_path, options)
                let MP3TagsEncodedV1 = Buffer.from(JSON.stringify(MP3TagsV1), 'binary')
                let MP3TagsEncodedV2 = Buffer.from(JSON.stringify(MP3TagsV2), 'binary')
                let decodedMP3TagsV1 = iconv.decode(MP3TagsEncodedV1, `${fileEncoding.encoding}`)
                let decodedMP3TagsV2 = iconv.decode(MP3TagsEncodedV2, `${fileEncoding.encoding}`)
                id3Reader.update(JSON.parse(decodedMP3TagsV1), res.locals.file_path)
                id3Reader.update(JSON.parse(decodedMP3TagsV2), res.locals.file_path, options)

                await bot.sendAudio({
                    chat_id: res.locals.chat_id,
                    caption: 'Кодировка изменена',
                    audio: fileSystem.createReadStream(`./${res.locals.file_path}`)
                })

                fileSystem.unlinkSync(`./${res.locals.file_path}`)
            }
        } catch (err) {
            bot.sendMessage({
                chat_id: res.locals.chat_id,
                text: 'Ошибка'
            });
            console.log(err);
        }

        next();
    }
}

