var IpWhitelist = require('../lib/IpWhitelist');
var expect = require('unexpected');

describe('IpWhitelist', function () {
    expect.addAssertion('[not] to be allowed access according to', function (expect, subject, value) {
        expect.errorMode = 'nested';
        var ipWhitelist = new IpWhitelist(value);
        return expect(ipWhitelist.validateIp(subject), '[not] to be ok');
    });

    it('should throw an exception if passed an invalid allowedIps string', function () {
        expect(function () {
            new IpWhitelist('foobar');
        }, 'to throw exception', 'validateIp: Cannot parse foobar');

        expect(function () {
            new IpWhitelist(['foobar']);
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

    it('should allow an IPv6-mapped ip when allowedIps contains it in IPv4 form', function () {
        return expect('::ffff:99.88.77.66', 'to be allowed access according to', ['99.88.77.66']);
    });
});
