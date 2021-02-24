/*global describe, it*/

process.env.NODE_ENV = 'test'; // Silence Connect's built-in error handler that logs errors to the console

var unexpected = require('unexpected'),
    os = require('os'),
    express = require('express'),
    expressValidateIp = require('../lib/expressValidateIp');

describe('expressValidateIp middleware', function () {
    var expect = unexpected.clone()
        // Create a custom assertion that mounts the redirectionRules middleware in an Express server and delegates to 'to be middleware that processes'
        .use(require('unexpected-express'))
        .addAssertion('[not] to be allowed access according to', function (expect, subject, value) {
            expect.errorMode = 'bubble';
            return expect(
                express().set('trust proxy', true).use(expressValidateIp(value)),
                'to yield exchange',
                {
                    request: {
                        remoteAddress: subject,
                        url: '/'
                    },
                    response: this.flags.not ? 403 : 404
                }
            );
        });

    it('should throw an exception if passed an invalid allowedIps string', function () {
        expect(function () {
            expressValidateIp('foobar');
        }, 'to throw exception', 'validateIp: Cannot parse foobar');

        expect(function () {
            expressValidateIp(['foobar']);
        }, 'to throw exception', 'validateIp: Cannot parse foobar');
    });
});
