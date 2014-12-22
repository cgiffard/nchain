var operators   = require("./operators"),
    nchain      = require("./nchain"),
    _           = require("lodash");

module.exports = nchain(operators, _);
module.exports.operators = operators;