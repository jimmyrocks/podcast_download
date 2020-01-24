const createCronJob = require('./createCronJob');
const streamConfigs = require('./streamConfigs');

var jobs = Object.keys(streamConfigs).map(stream => {
  console.log(stream);
  return createCronJob(streamConfigs[stream]);
});
console.log('*********************');
