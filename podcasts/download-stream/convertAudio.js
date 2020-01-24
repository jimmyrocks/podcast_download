const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const {
  promisify
} = require('util');

var convert = async function(filePath, inFormat, outFormat) {
  outFormat = outFormat || 'mp3';
  return new Promise((resolve, reject) => {
    if (inFormat === undefined || inFormat === outFormat) {
      return filePath;
    } else {
      // console.log('a');
      var inFile = filePath + '.' + inFormat;
      var outStream = fs.createWriteStream(filePath + '.' + outFormat);
      promisify(fs.rename)(filePath, inFile).then(x => {

        ffmpeg(inFile)
          .format('mp3')
          .audioBitrate('128k')
          .audioChannels(2)
          .audioCodec('libmp3lame')
          .on('error', (err) => {
            reject(err);
          })
          .on('progress', (progress) => {
            // console.log(JSON.stringify(progress));
            // console.log('Processing: ' + progress.targetSize + ' KB converted');
          })
          .on('end', () => {
            promisify(fs.unlink)(inFile).then(y => {
              promisify(fs.rename)(filePath + '.' + outFormat, filePath)
                .then(z => resolve(filePath))
            });
          })
          .pipe(outStream, {
            end: true
          });
      });
    }
  });
};

var test = function() {
  convert('/config/download-stream/ds89j', 'aac')
    .catch(function(e) {
      console.log('e', e);
    })
    .then(function(r) {
      console.log('r', r);
    });
};

module.exports = convert;
