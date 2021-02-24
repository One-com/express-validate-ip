var httpErrors = require('httperrors'),
    IpWhitelist = require('./IpWhitelist');

module.exports = function (allowedIps) {
    var ipWhitelist = new IpWhitelist(allowedIps);

    return function validateIp(req, res, next) {
        if (ipWhitelist.validateIp(req.ip)) {
            next();
        } else {
            next(new httpErrors.Forbidden());
        }
    };
};
