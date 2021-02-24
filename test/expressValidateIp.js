/*global describe, it*/

process.env.NODE_ENV = 'test'; // Silence Connect's built-in error handler that logs errors to the console

var expect = require('unexpected').use(require('unexpected-express'));
var express = require('express');
var expressValidateIp = require('../lib/expressValidateIp');

describe('expressValidateIp middleware', function () {
    it('should propagate errors from IpWhitelist', function () {
        expect(function () {
            expressValidateIp('foobar');
        }, 'to throw exception', 'validateIp: Cannot parse foobar');
    });

    it('should not block an allowed ip', function () {
        return expect(
            express()
                .use(expressValidateIp('*'))
                .use(function (req, res, next) {
                    res.end('Hello world.');
                }),
            'to yield exchange',
            {
                request: {
                    remoteAddress: '1.2.3.4',
                    url: '/'
                },
                response: 200
            }
        );
    });

    it('should block an unallowed ip', function () {
        return expect(
            express()
                .use(expressValidateIp([]))
                .use(function (req, res, next) {
                    res.end('Hello world.');
                }),
            'to yield exchange',
            {
                request: {
                    remoteAddress: '1.2.3.4',
                    url: '/'
                },
                response: 403
            }
        );
    });


});
