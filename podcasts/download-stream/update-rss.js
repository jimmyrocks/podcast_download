var convert = require('xml-js');
var tools = require('./tools');

var createRss = function(streamConfig, items) {
  return {
    '_declaration': {
      '_attributes': {
        'version': '1.0',
        'encoding': 'UTF-8'
      }
    },
    'rss': {
      '_attributes': {
        'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
        'version': '2.0'
      },
      'channel': {
        'title': {
          '_text': streamConfig.title || ''
        },
        'link': {
          '_text': streamConfig.link || ''
        },
        'language': {
          '_text': 'en-us'
        },
        'itunes:subtitle': {
          '_text': streamConfig.radioStation || ''
        },
        'itunes:author': {
          '_text': streamConfig.host || ''
        },
        'itunes:summary': {
          '_text': streamConfig.summary || ''
        },
        'description': {
          '_text': streamConfig.description || ''
        },
        'itunes:owner': {
          'itunes:name': {
            '_text': streamConfig.host || ''
          },
          'itunes:email': {
            '_text': streamConfig.hostEmail || ''
          }
        },
        'itunes:explicit': {
          '_text': streamConfig.explicit || 'no'
        },
        'itunes:image': {
          '_attributes': {
            'href': streamConfig.image || ''
          }
        },
        'itunes:category': {
          '_attributes': {
            'text': streamConfig.genre || ''
          }
        },
        'item': items
      }
    }
  };
};

var createItem = function(itemInfo, streamConfig) {
  return {
    'title': {
      '_text': streamConfig.title + ': ' + itemInfo.startTime
    },
    'itunes:summary': {
      '_text': streamConfig.summary
    },
    'itunes:description': {
      '_text': streamConfig.description
    },
    'itunes:link': {
      '_text': ''
    },
    'enclosure': {
      '_attributes': {
        'url': itemInfo.url,
        'type': 'audio/mpeg',
        'length': itemInfo.fileSize
      }
    },
    'pubDate': {
      '_text': itemInfo.rssTime
    },
    'itunes:author': {
      '_text': streamConfig.host
    },
    'itunes:duration': {
      '_text': tools.min2Time(streamConfig.length)
    },
    'itunes:explicit': {
      '_text': streamConfig.explicit || 'no'
    },
    'guid': {
      '_text': itemInfo.url
    },
  };
};

var addItem = function(itemInfo, streamConfig, original) {

  var items = [];
  if (original) {
    var originalJs = convert.xml2js(original.toString(), {
      compact: true
    });
    items = originalJs && originalJs.rss && originalJs.rss.channel && originalJs.rss.channel.item;
    if (!Array.isArray(items)) {
      items = [items];
    }
  }
  var item = createItem(itemInfo, streamConfig);
  items.push(item);


  var result = convert.json2xml(createRss(streamConfig, items), {
    compact: true
  });

  return Buffer.from(result, 'utf-8');
};

module.exports = addItem;
