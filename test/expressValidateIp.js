/*global describe, it*/

process.env.NODE_ENV = 'test'; // Silence Connect's built-in error handler that logs errors to the console

var unexpected = require('unexpected'),
    os = require('os'),
    _ = require('lodash'),
    express = require('express'),
    expressValidateIp = require('../lib/expressValidateIp');

describe('expressValidateIp middleware', function () {
    var allowedIps;

    var expect = unexpected.clone()
        // Create a custom assertion that mounts the redirectionRules middleware in an Express server and delegates to 'to be middleware that processes'
        .installPlugin(require('unexpected-express'))
        .addAssertion('[not] to be allowed access according to', function (expect, subject, value, done) {
            expect(
                express().set('trust proxy', true).use(expressValidateIp({allowedIps: value})),
                'to be middleware that processes',
                {
                    request: {
                        remoteAddress: subject,
                        url: '/'
                    },
                    response: this.flags.not ? 403 : 404
                },
                done
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

    it('should allow a random IP when allowedIps is set to *', function (done) {
        expect('99.88.77.66', 'to be allowed access according to', '*', done);
    });

    it('should disallow a random IP when allowedIps is undefined', function (done) {
        expect('99.88.77.66', 'not to be allowed access according to', undefined, done);
    });

    it('should disallow a random IP when allowedIps is []', function (done) {
        expect('99.88.77.66', 'not to be allowed access according to', undefined, done);
    });

    it('should allow a random IP when allowedIps is equal to it', function (done) {
        expect('99.88.77.66', 'to be allowed access according to', '99.88.77.66', done);
    });

    it('should allow a random IP when allowedIps contains it', function (done) {
        expect('99.88.77.66', 'to be allowed access according to', ['99.88.77.66'], done);
    });

    var allowedIpsInProduction = [
        '10.246.0.0/16',
        '195.47.247.51/32',
        '91.198.169.133/32'
    ];

    ['195.47.247.51', '91.198.169.133', '10.246.0.1', '10.246.255.255'].forEach(function (whitelistedIp) {
        it('should allow access from whitelisted ip ' + whitelistedIp, function (done) {
            expect(whitelistedIp, 'to be allowed access according to', allowedIpsInProduction, done);
        });
    });

    ['91.198.169.132', '91.198.169.134', '99.88.77.66', '10.245.255.255', '10.247.0.1'].forEach(function (nonWhitelistedIp) {
        it('should disallow access from non-whitelisted ip ' + nonWhitelistedIp, function (done) {
            expect(nonWhitelistedIp, 'not to be allowed access according to', allowedIpsInProduction, done);
        });
    });
});
