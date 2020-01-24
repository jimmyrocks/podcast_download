const fs = require('fs');
const request = require('request');
const moment = require('moment-timezone');

var min2Time = function(minutes) {
  // Displays minutes as a time
  // ex: 90.5 = 01:30:30
  return ('0' + Math.floor(minutes / 60).toString()).substr(-2) + ':' +
    ('0' + Math.floor(minutes % 60).toString()).substr(-2) + ':' +
    ('0' + Math.floor((minutes % 1) * 60).toString()).substr(-2);
};

var newTime=function(hour, min, offsetInMin, timezone) {
  var time = new moment(moment.tz(timezone));
  time.hour(hour);
  time.minute(min);
  time.second(0);
  time.millisecond(0);
  time.add(offsetInMin * 60 * 1000);
  return time;
};

var times = function(start, lengthInMin, timezone) {
  var hour = start.split(':')[0];
  var min = start.split(':')[1];
  var startTime = newTime(hour, min, 0, timezone);
  var endTime = newTime(hour, min, lengthInMin, timezone);
  return {
    'startTime': startTime,
    'endTime': endTime,
    'startTimeGMT': moment.tz(startTime, 'GMT'),
    'endTimeGMT': moment.tz(endTime, 'GMT'),
    'startTimeText': startTime.toString()
  }
};

var getFileSize = function(filePath) {
  return new Promise(function(resolve) {
    fs.stat(filePath, (e, r) => {
      resolve(r.size);
    });
  });
};

var deleteFile = function(filePath) {
  return new Promise(function(resolve, reject) {
    fs.unlink(filePath, (e, r) => {
      e ? reject(e) : resolve(r);
    });
  });
};

var downloadImage = async function(url) {
  return new Promise(function(resolve, reject) {
    request.get(url, {
      encoding: null
    }, (err, res, file) => {
      if (err) {
        resolve(null);
      } else {
        var imageData = {
          mime: res.headers && res.headers['content-type'],
          type: {
            id: 3,
            name: 'front cover'
          }, // See https://en.wikipedia.org/wiki/ID3#ID3v2_embedded_image_extension
          description: '',
          imageBuffer: file
        }
        resolve(imageData);
      }
    });
  });
};

var createTags = async function(streamConfig, fileSize, itemInfo) {
  var imageData = await downloadImage(streamConfig.image);
  // console.log(typeof imageData.imageBuffer);
  return {
    'title': streamConfig.title + ': ' + itemInfo.startTime,
    'artist': streamConfig.host,
    'length': streamConfig.length * 60000,
    'genre': streamConfig.genre,
    'year': itemInfo._times.startTime.year(),
    'date': ('0' + (itemInfo._times.startTime.month()+1).toString()).substr(-2) + ('0' + (itemInfo._times.startTime.day()+1).toString()).substr(-2),
    'size': itemInfo.fileSize,
    'internetRadioName': streamConfig.radioStation,
    'size': fileSize,
    'image': imageData || streamConfig.image,
    'comment': {
      language: "eng",
      text: streamConfig.description
    },
    'userDefinedText': Object.keys(streamConfig).filter(key => {
      return key !== 'image'
    }).map(key => {
      return {
        'description': key,
        'value': streamConfig[key]
      }
    })
  };
};

var createPath = function(streamConfig, filename, extension) {
  var path = ['podcasts', streamConfig.title, filename];

  // If the filename is null, put the file in the root and name it the folder name
  filename || path.pop();
  return path.map(v => {
    return v.replace(/[^A-Za-z0-9]/g, '_')
  }).join('/') + '.' + extension;
};


module.exports = {
  getFileSize: getFileSize,
  deleteFile: deleteFile,
  createPath: createPath,
  createTags: createTags,
  min2Time: min2Time,
  times: times
};
