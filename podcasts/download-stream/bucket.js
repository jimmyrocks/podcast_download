const aws = require('aws-sdk');
const fs = require('fs');
const Readable = require('stream').Readable;

// Set S3 endpoint to DigitalOcean Spaces
const endpointPath = process.env['SPACES_ENDPOINT'];
const bucketName = process.env['SPACES_BUCKET'];
const spacesEndpoint = new aws.Endpoint(endpointPath);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env['SPACES_ACCESS'],
  secretAccessKey: process.env['SPACES_KEY']
});

var read = async function(path) {
  return new Promise(function(resolve, reject) {
    var params = {
      Bucket: bucketName,
      Key: path
    }
    s3.getObject(params, (err, data) => {

      if (err) {
        // reject(err);
        resolve(null);
      } else {
        resolve(data && data.Body);
      }

    })
  });
};

var readFile = async function(filePath) {
  return new Promise(function(resolve, reject) {
    if (typeof filePath === 'string') {
      fs.readFile(filePath, (e, r) => {
        e ? reject(e) : resolve(r);
      });
    } else {
      resolve(filePath);
    }
  });
};

var readStream = function(filePath) {
  var returnValue = null;
  if (typeof filePath === 'string') {
    returnValue = fs.createReadStream(filePath);
  } else {
    const readable = new Readable();
    // const eventEmitter = new EventEmitter();
    readable._read = () => {}; // _read is required but you can noop it
    readable.push(filePath);
    readable.push(null);
    readable.length = filePath.length;
    process.nextTick(() => readable.emit('open'));

    returnValue = readable;
  }
  return returnValue;
};


var write = async function(filePath, newFilename) {
  // console.log('bw-a');
  // var data = await readFile(filePath);
  // console.log('bw-b');
  return new Promise(function(resolve, reject) {
    // console.log('bw-c');
    var stream = readStream(filePath);
    stream.on('open', () => {
      var params = {
        Body: stream,
        Bucket: bucketName,
        Key: newFilename,
        ACL: 'public-read'
      };

      // console.log('bw-d', stream);
      s3.putObject(params, (err, data) => {
        // console.log('bw-e', err, data);
        data = data || {};
        data.url = 'https://' + bucketName + '.' + endpointPath + '/' + newFilename;
        err ? reject(err) : resolve(data);
      });
    })
  });
};

module.exports = {
  'read': read,
  'write': write
};
