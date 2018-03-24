var configureChainLink = function(obj, confObj) {
    if (confObj) {
        return Object.assign(obj, confObj);
    }
    else {
        return obj;
    }
}

module.exports = configureChainLink;
