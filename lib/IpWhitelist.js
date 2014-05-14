var net = require('net'),
    ip = require('ip');

function IpWhitelist(allowedIps) {
    if (typeof allowedIps === 'undefined') {
        allowedIps = [];
    } else if (!Array.isArray(allowedIps)) {
        allowedIps = [allowedIps];
    }

    this.checkFunctions = allowedIps.map(function (allowedIpWithOptionalNumNetmaskBits) {
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
}

IpWhitelist.prototype.validateIp = function (ip) {
    return this.checkFunctions.some(function (checkFunction) {
        return checkFunction(ip);
    });
};

module.exports = IpWhitelist;
