module.exports = function nchain(operators, _) {
    return nchainInitialiser.bind(null, operators, _);
};

function nchainInitialiser(operators, _, select) {
    var functionChain   = [],
        strictMode      = true;

    if (select) {
        functionChain.push(["select", [select]])
    }

    // To enable scope bound dependencies to be available
    // outside the body of this function
    function retFun(objectInput) {
        return execute(operators, _, functionChain, strictMode, objectInput);
    }

    // Build the map to be returned
    retFun.nastyButFast = function toggleStrictMode(enabled) {
        return strictMode = !enabled, retFun;
    };

    Object.keys(operators).forEach(function(key) {
        retFun[key] = function() {
            functionChain.push([
                key, Array.prototype.slice.call(arguments, 0)
            ]);

            return retFun;
        };
    });

    return retFun;
}

function execute(operators, _, functionChain, strictMode, objectInput) {
    var bindContext  = {},
        contextChain = [];

    // Attach to bind context
    bindContext.pushContext         = pushContext.bind(null, contextChain);
    bindContext.popContext          = popContext.bind(null, contextChain);
    bindContext.originalContext     = objectInput;

    Object.defineProperty(bindContext, "contextStack", {
        "get": function() {
            return contextChain.slice(0);
        }
    });

    Object.defineProperty(bindContext, "context", {
        "get": currentContext.bind(null, contextChain)
    });


    Object.freeze(bindContext);

    return functionChain.reduce(function(object, executeStage) {
        var runVal = runOperation(
            // Dependencies
            operators, _, bindContext, strictMode, contextChain,
            // For this stage
            object, executeStage
        );

        if (runVal)
            return bindContext.pushContext(runVal);

        return currentContext(contextChain);

    }, objectInput);
}

function pushContext(contextChain, ctx) {
    if (ctx) contextChain.push(ctx);
    return ctx;
}

function popContext(contextChain) {
    return contextChain.pop();
}

function currentContext(contextChain) {
    return contextChain[contextChain.length - 1];
}

function runOperation(
            operators,
            _,
            bindContext,
            strictMode,
            contextChain,
            object,
            executeStage) {

    var stageName = executeStage[0],
        stageArgs = executeStage[1],
        stage     = operators[stageName],
        execArgs  = [clone(_, strictMode, object)].concat(stageArgs),
        result    = clone(_, strictMode, stage.apply(bindContext, execArgs));

    return pushContext(contextChain, result);
}

function clone(_, strictMode, object) {
    if (!strictMode) return object;
    return _.cloneDeep(object, true);
}