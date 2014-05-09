var httpErrors = require('httperrors'),
    net = require('net'),
    ip = require('ip');

module.exports = function (config) {
    config = config || {};
    var allowedIps = config.allowedIps;
    if (typeof allowedIps === 'undefined') {
        allowedIps = [];
    } else if (!Array.isArray(allowedIps)) {
        allowedIps = [allowedIps];
    }

    var checkFunctions = allowedIps.map(function (allowedIpWithOptionalNumNetmaskBits) {
        if (allowedIpWithOptionalNumNetmaskBits === '*') {
            return function () {
                return true;
            };
        }
        if (net.isIP(allowedIpWithOptionalNumNetmaskBits)) {
            return function (requestIp) {
                return requestIp === allowedIpWithOptionalNumNetmaskBits;
            };
        }
        var cidrSubnet;
        try {
            cidrSubnet = ip.cidrSubnet(allowedIpWithOptionalNumNetmaskBits);
        } catch (e) {
            throw new Error('validateIp: Cannot parse ' + allowedIpWithOptionalNumNetmaskBits);
        }
        var allowedMaskedIp = ip.mask(ip.fromLong(ip.toLong(allowedIpWithOptionalNumNetmaskBits)), cidrSubnet.subnetMask);
        return function (requestIp) {
            return ip.mask(requestIp, cidrSubnet.subnetMask) === allowedMaskedIp;
        };
    });

    return function validateIp(req, res, next) {
        if (checkFunctions.some(function (checkFunction) {
            return checkFunction(req.ip);
        })) {
            next();
        } else {
            next(new httpErrors.Forbidden());
        }
    };
};
