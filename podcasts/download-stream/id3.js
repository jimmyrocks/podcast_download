const NodeID3 = require('node-id3')

var read = async function(filePath) {
  console.log(filePath);
  let tags = NodeID3.read(filePath);
  return tags;
};

var write = async function(filePath, tags) {
  return new Promise(function(resolve, reject) {
    let ID3FrameBuffer = NodeID3.create(tags);
    let success = NodeID3.write(tags, filePath);
    NodeID3.write(tags, filePath, (err, buffer) => {
      err ? reject(err) : resolve(success);
    });
  });

};

module.exports = {
  'get': read,
  'set': write
};
