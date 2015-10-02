'use strict';

/*  ------------------------------------------------------------
 *
 *  A request formatter for Ooyala API
 *  based on arguments of the .apiRequest() method
 *  an Ooyala request is formatted and the response returned
 *
 *  The api must be initialiased with a config
 *    ooyala.init({
 *   
 *          api_key: 'Rjsgjsdyuzxjhjss53453.xzgkS',
 *          secret_key: 'uysiIYYIkjnkkSb80e-3DfKhjdfs7iB',
 *          baseUrl: 'http://api.ooyala.com',
 *          include: ['labels']
 *
 *  })
 *
 *  NB: keys above are fake examples. Use your own keys
 *
 * -------------------------------------------------------------
 */


var request = require('request'),
    crypto = require('crypto'),
    _ = require('underscore'),
    moment = require('moment-timezone');

module.exports = {
    init: function(config) {
        _.extend(this, config);
        return this;
    },
    defaults: {
        query: {
            created_at_start: '1 day'
        },
        count: 50,
        path: '/v2/assets',
        method: 'GET'
    },


    // retruns apiRequest Promise
    apiRequest: function(args) {
        var self = this,
            method, path, query, count;
        if (args.method === undefined) {
            method = self.defaults.method;
        } else {
            method = args.method;
        }
        if (args.path === undefined) {
            path = self.defaults.path;
        } else {
            path = args.path;
        }
        if (args.query === undefined) {
            query = self.defaults.query;
        } else {
            query = args.query;
        }
        if (args.count === undefined) {
            count = self.defaults.count;
        } else {
            count = args.count;
        }

        return new Promise(function(resolve, reject) {
            var complex = false,
                where_clauses = [],
                expiration = Math.round(+new Date() / 1000 + 3600);

            // if anything but term is being queried its complex
            _.each(query, function(value, attr) {
                if (attr !== 'term') {
                    complex = true;
                    return false;
                }
            });
            _.each(query, function(value, attr) {

                switch (attr) {
                    case 'term':
                        // can't usefully mix AND and OR in Ooyala query
                        if (complex) {
                            where_clauses.push('name INCLUDES \'' + value + '\'');
                        } else {
                            where_clauses.push('description INCLUDES  \'' + value + '\' OR name INCLUDES \'' + value + '\'' + ' OR labels INCLUDES \'' + value + '\'');
                        }
                        break;
                    case 'label':
                        _.each(value.split(','), function(part) {
                            where_clauses.push('labels INCLUDES \'' + part.trim() + '\'');
                        });
                        break;
                    case 'created_at_start':
                        if (typeof value === 'string') {
                            where_clauses.push('created_at > \'' + moment().subtract(parseInt(value.split(' ')[0], 10), value.split(' ')[1]).format() + '\'');
                        } else {
                            where_clauses.push('created_at > \'' + moment(value).format() + '\'');
                        }
                        break;
                    case 'created_at_end':
                        if (typeof value === 'string') {
                            where_clauses.push('created_at <= \'' + moment().subtract(parseInt(value.split(' ')[0], 10), value.split(' ')[1]).format() + '\'');
                        } else {
                            where_clauses.push('created_at <= \'' + moment(value).format() + '\'');
                        }
                        break;
                    case 'updated_at_start':
                        if (typeof value === 'string') {
                            where_clauses.push('updated_at > \'' + moment().subtract(parseInt(value.split(' ')[0], 10), value.split(' ')[1]).format() + '\'');
                        } else {
                            where_clauses.push('updated_at > \'' + moment(value).format() + '\'');
                        }
                        break;
                    case 'updated_at_end':
                        if (typeof value === 'string') {
                            where_clauses.push('updated_at <= \'' + moment().subtract(parseInt(value.split(' ')[0], 10), value.split(' ')[1]).format() + '\'');
                        } else {
                            where_clauses.push('updated_at <= \'' + moment(value).format() + '\'');
                        }
                        break;
                }
            });

            // create signature
            self.stringToTokenize = self.secret_key +
                method + path +
                'api_key=' + self.api_key +
                'count=' + count +
                'expires=' + expiration +
                'include=' + self.include.join(',') +
                'where=' + where_clauses.join(' AND ');

            self.signature = crypto.createHash('sha256')
                .update(self.stringToTokenize)
                .digest('base64')
                .replace(/\=+$/, '').substr(0, 43);


            console.log('Ooyala API call', {
                //  api_key: self.api_key,
                count: count,
                expires: expiration,
                include: self.include.join(','),
                where: where_clauses.join(' AND '),
                //   signature: signature
            });

            request({
                baseUrl: self.baseUrl,
                url: path,
                qs: {
                    api_key: self.api_key,
                    count: count,
                    expires: expiration,
                    include: self.include.join(','),
                    where: where_clauses.join(' AND '),
                    signature: self.signature
                },
                json: true
            }, function(err, r, body) {

                if (err) {
                    console.log(222, err);
                    reject(err);
                }

                // pass back returned json object
                resolve(body);
            });
        });
    }
};
