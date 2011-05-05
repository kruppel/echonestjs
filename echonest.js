/*
 * \file echonest.js
 * \brief Echo Nest API Wrapper
 *
 * \author kurt <kurt@songbirdnest.com>
 */

/**
 * NOTES
 * - Only tested within Songbird
 */

var queryString = {
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

var request = function(options, callback) {
  var xhr = new XMLHttpRequest(),
      method = options.method || 'GET',
      headers = options.headers || {},
      params = options.body;

  Cu.reportError(method);
  params.api_key = echonest.api_key;

  xhr.onreadystatechange = function() {
    if (this.readyState === 4) {
      callback(xhr.responseText);
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
      resources = { catalog: {
                      create: {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/x-www-form-urlencoded',
                          'Connection': 'close'
                        }
                      },
                      profile: {
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
            rtype = resources[resource],
            mtype = (rtype) ? rtype[method] : null,
            op = (mtype) ? mtype['method'] : null,
            body = queryString.stringify(flags),
            headers = (mtype) ? mtype['headers'] : null,
            params = {};

        if (!mtype) {
          // console.log('The ' + method ' method is unavailable.');
          return;
        }

        if (!op || op === 'GET') {
          params = flags;
        }

        params['api_key'] = this.api_key;

        request({ method: op,
                  uri: getEchonestUri(path, params),
                  body: body,
                  headers: headers
                }, callback);
      }
  };
})();
