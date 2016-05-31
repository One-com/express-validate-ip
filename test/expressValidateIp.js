/*global describe, it*/

process.env.NODE_ENV = 'test'; // Silence Connect's built-in error handler that logs errors to the console

var unexpected = require('unexpected'),
    os = require('os'),
    express = require('express'),
    expressValidateIp = require('../lib/expressValidateIp');

describe('expressValidateIp middleware', function () {
    var allowedIps;

    var expect = unexpected.clone()
        // Create a custom assertion that mounts the redirectionRules middleware in an Express server and delegates to 'to be middleware that processes'
        .use(require('unexpected-express'))
        .addAssertion('[not] to be allowed access according to', function (expect, subject, value) {
            expect.errorMode = 'bubble';
            return expect(
                express().set('trust proxy', true).use(expressValidateIp({allowedIps: value})),
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
            expressValidateIp({allowedIps: 'foobar'});
        }, 'to throw exception', 'validateIp: Cannot parse foobar');

        expect(function () {
            expressValidateIp({allowedIps: ['foobar']});
        }, 'to throw exception', 'validateIp: Cannot parse foobar');
    });

    it('should allow a random IP when allowedIps is set to *', function () {
        return expect('99.88.77.66', 'to be allowed access according to', '*');
    });

    it('should disallow a random IP when allowedIps is undefined', function () {
        return expect('99.88.77.66', 'not to be allowed access according to', undefined);
    });

    it('should disallow a random IP when allowedIps is []', function () {
        return expect('99.88.77.66', 'not to be allowed access according to', undefined);
    });

    it('should allow a random IP when allowedIps is equal to it', function () {
        return expect('99.88.77.66', 'to be allowed access according to', '99.88.77.66');
    });

    it('should allow a random IP when allowedIps contains it', function () {
        return expect('99.88.77.66', 'to be allowed access according to', ['99.88.77.66']);
    });

    var allowedIpsInProduction = [
        '10.246.0.0/16',
        '195.47.247.51/32',
        '91.198.169.133/32'
    ];

    ['195.47.247.51', '91.198.169.133', '10.246.0.1', '10.246.255.255'].forEach(function (whitelistedIp) {
        it('should allow access from whitelisted ip ' + whitelistedIp, function () {
            return expect(whitelistedIp, 'to be allowed access according to', allowedIpsInProduction);
        });
    });

    ['91.198.169.132', '91.198.169.134', '99.88.77.66', '10.245.255.255', '10.247.0.1'].forEach(function (nonWhitelistedIp) {
        it('should disallow access from non-whitelisted ip ' + nonWhitelistedIp, function () {
            return expect(nonWhitelistedIp, 'not to be allowed access according to', allowedIpsInProduction);
        });
    });
});
