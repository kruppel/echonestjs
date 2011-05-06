/*
 * \file echonest.js
 * \brief Echo Nest API Wrapper
 *
 * \author kurt <kurt@songbirdnest.com>
 */

/**
 * NOTES
 * - client-side: will not work in IE
 */

// naive approach to assessing node.js compat
var ss = (typeof(require) === 'function' &&
          typeof(module) === 'object');

var queryString = (ss) ? require('querystring') : {
  /* Parses a querystring into an object */
  parse: function(qs) {
    var params = qs.split('&'),
        obj = {};

    for (var param in params) {
      var pair = param.split('=');
      obj[pair[0]] = pair[1];
    }

    return obj;
  },

  /* Stringifies an object into a querystring */
  stringify: function(params) {
    var stack = [];

    for (var param in params) {
      stack.push(encodeURIComponent(param) + '=' +
                 encodeURIComponent(params[param]));
    }

    return stack.join('&');
  }
};

var request = (ss) ? require('request') : function(options, callback) {
  var xhr = new XMLHttpRequest(),
      method = options.method || 'GET',
      headers = options.headers || {},
      params = options.body;

  xhr.onreadystatechange = function() {
    if (this.readyState === 4) {
      callback(null, xhr, xhr.responseText);
    }
  };

  // Async all day, baby
  xhr.open(method, options.uri, true);

  for (var header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }

  xhr.send(params);
};

var echonest = (function() {
  var base_url = 'http://developer.echonest.com/api/v4/',
      resources = { artist: {
                      profile: {
                      },
                      similar: {
                      }
                    },
                    catalog: {
                      create: {
                        method: 'POST',
                        headers: {
                          'content-type': 'application/x-www-form-urlencoded',
                          'connection': 'close'
                        }
                      },
                      update: {
                        method: 'POST',
                        headers: {
                          'content-type': 'application/x-www-form-urlencoded',
                          'connection': 'close'
                        },
                        required: [ 'id' ]
                      },
                      profile: {
                      },
                      feed: {
                      }
                    }
                  },

      getEchonestUri = function(path, params) {
        var qs = queryString.stringify(params),
            uri = base_url + path + '?' + qs;

        return uri;
      };

  return {
    api_key: null,
    apiCall: function(resource, method, flags, callback) {
      var path = resource + '/' + method,
          params = {},
          options = {},
          rtype = resources[resource],
          mtype = (rtype) ? rtype[method] : null,
          op = (mtype) ? mtype['method'] : null,
          data = flags['data'],
          required = (mtype) ? mtype['required'] : null;

      options['method'] = op;
      options['body'] = queryString.stringify(flags);
      options['headers'] = (mtype) ? mtype['headers'] : null;

      if (data) {
        options['body'] = 'data=' + data;
        delete flags['data'];
      }

      if (!mtype) {
        // console.log('The ' + method ' method is unavailable.');
        return;
      }

      if (!op || op === 'GET') {
        params = flags;
      }

      if (required) {
        required.forEach(function(req) {
          params[req] = flags[req];
        });
      }

      params['api_key'] = this.api_key;
      options['uri'] = getEchonestUri(path, params);

      request(options, callback);
    }
  };
})();

/* node.js magic */
if (ss) {
  module.exports = echonest;
}
