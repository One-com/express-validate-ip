var httpErrors = require('httperrors'),
    IpWhitelist = require('./IpWhitelist');

module.exports = function (config) {
    config = config || {};

    var ipWhitelist = new IpWhitelist(config.allowedIps);

    return function validateIp(req, res, next) {
        if (ipWhitelist.validateIp(req.ip)) {
            next();
        } else {
            next(new httpErrors.Forbidden());
        }
    };
};
