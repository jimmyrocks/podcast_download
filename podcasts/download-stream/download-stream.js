var spawn = require('child_process').spawn;

var download = async function(streamUrl, lengthInMin) {
  var tempFile = '/tmp/' + Math.random().toString(36).substr(2);
  var command = 'curl';
  var args = ['--max-time', (lengthInMin * 60).toString(), '-o', tempFile, streamUrl]
  await runCommand(command, args);
  return tempFile;

};

var runCommand = function(cmd, args) {
  return new Promise((resolve) => {
    var child = spawn(cmd, args);
    console.log('start streaming: ', cmd, args);
    // child.stdout.on('data', function (buffer) { console.log(buffer.toString('utf8')) });
    // child.stderr.on('data', function (buffer) { console.log(buffer.toString('utf8')) });
    child.stdout.on('end', function() {
      console.log('done streaming');
      resolve();
    });
  });
};

module.exports = download;
