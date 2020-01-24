const CronJob = require('cron').CronJob;
const getStream = require('./radio-stream.js');
const tools = require('./tools');

const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

var cronExpression = function(startTime, dayOfWeek, timezone, buffer) {
  buffer = buffer || 0;
  var times = tools.times(startTime, 0, timezone)
  var bufferedTime = times.startTime.subtract(buffer * 1000);
  var dayOffset = times.startTimeGMT.day() - times.startTime.day();
  var dayOfWeek = daysOfWeek.indexOf(dayOfWeek.toLowerCase().substr(0, 3));
  var exp = {
    'second': bufferedTime.second(),
    'minute': bufferedTime.minute(),
    'hour': bufferedTime.hour(),
    'dayOfWeek': dayOfWeek
  };
  return [exp.second, exp.minute, exp.hour, '*', '*', exp.dayOfWeek].join(' ');
};

var createCronJob = function(streamConfig) {
  var expression = cronExpression(streamConfig.startTime,
    streamConfig.dayOfWeek,
    streamConfig.timezone,
    streamConfig.bufferSeconds);
  console.log('   ', expression, '[' + streamConfig.timezone + ']');
  return new CronJob(expression, function() {
    getStream(streamConfig)
  }, null, true, streamConfig.timezone);
};

module.exports = createCronJob;
