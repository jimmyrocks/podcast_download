const bucket = require('./bucket');
const downloadStream = require('./download-stream-js');
const id3 = require('./id3');
const tools = require('./tools');
const updateRss = require('./update-rss');
const convertAudio = require('./convertAudio');

var getStream = async function(streamConfig) {
  console.log('Starting: ' + streamConfig.title);
  var times = tools.times(streamConfig.startTime, streamConfig.length, streamConfig.timezone);

  var itemInfo = {
    _times: times,
    tempFile: null,
    url: null,
    fileSize: null,
    startTime: times.startTimeText,
    endTime: times.endTimeText,
    rssTime: times.startTime.format('ddd, DD MMM YYYY HH:mm:ss zz'),
    length: streamConfig.length + (streamConfig.bufferSeconds * 2 / 60),
    bucketFilePath: tools.createPath(streamConfig, times.startTime.toISOString(), 'mp3'),
    bucketRssPath: tools.createPath(streamConfig, null, 'rss'),
    bucketHtmlPath: tools.createPath(streamConfig, null, 'html')
  };

  // MP3
  itemInfo.tempFile = await downloadStream(streamConfig.stream, itemInfo.length);
  await convertAudio(itemInfo.tempFile, streamConfig.streamFormat, 'mp3');
  itemInfo.fileSize = await tools.getFileSize(itemInfo.tempFile);
  var tags = await tools.createTags(streamConfig, itemInfo.fileSize, itemInfo);
  await id3.set(itemInfo.tempFile, tags);
  var toBucket = await bucket.write(itemInfo.tempFile, itemInfo.bucketFilePath);
  itemInfo.url = toBucket.url;
  await tools.deleteFile(itemInfo.tempFile);

  // RSS
  var rssFile = await bucket.read(itemInfo.bucketRssPath);
  var newRssFile = await updateRss(itemInfo, streamConfig, rssFile);
  await bucket.write(newRssFile, itemInfo.bucketRssPath);

  // Done
  console.log('Finished: ' + streamConfig.title);
  return itemInfo;
};

module.exports = getStream;
