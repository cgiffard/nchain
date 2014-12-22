var expect = require("chai").expect,
    _ = require("lodash");

describe("Chaining ability", function() {

    it("generates a matching API surface based on a map of operators", function() {
        var nchainImplementation = require("../nchain.js"),
            mockerators,
            selector = "foo";

        mockerators = {
            "select": function() {
                throw new Error("This function should not have been executed.");
            },
            "mock1": function() {
                throw new Error("This function should not have been executed.");
            },
            "mock2": function() {
                throw new Error("This function should not have been executed.");
            }
        };

        var nchain = nchainImplementation(mockerators, _),
            generatedChain = nchain(selector);

        expect(generatedChain).to.be.ok;
        expect(generatedChain.select).to.be.an.instanceOf(Function);
        expect(generatedChain.mock1).to.be.an.instanceOf(Function);
        expect(generatedChain.mock2).to.be.an.instanceOf(Function);

        // This function wasn't in the map
        expect(generatedChain.mock3).to.not.be.ok;
    });

    it("executes the mocked operators in the correct order", function() {
        var nchainImplementation = require("../nchain.js"),
            mockerators,
            object = {},
            selector = "foo",
            executeCount = 0;

        mockerators = {
            "select": function(innerObject, innerSelector) {
                expect(executeCount).to.equal(0);
                expect(innerObject).to.equal(object);
                expect(innerSelector).to.equal(selector);

                executeCount ++;

                return object;
            },
            "mock1": function(innerObject, arg1) {
                // 2 because we want to ensure out of order execution is possible
                expect(executeCount).to.equal(2);
                expect(innerObject).to.equal(object);
                expect(arg1).to.equal("mock1arg1");

                executeCount ++;

                return object;
            },
            "mock2": function(innerObject, arg1, arg2) {
                expect(executeCount).to.equal(1);
                expect(innerObject).to.equal(object);
                expect(arg1).to.equal("mock2arg1");
                expect(arg2).to.equal("mock2arg2");

                executeCount ++;

                return object;
            },
            "doSomethingElse": function(innerObject) {
                expect(executeCount).to.equal(3);
                expect(innerObject).to.equal(object);

                executeCount ++;

                return object;
            }
        };

        var nchain = nchainImplementation(mockerators, _),
            generatedChain =
                nchain(selector)
                    .nastyButFast(true)
                    .mock2("mock2arg1", "mock2arg2")
                    .mock1("mock1arg1")
                    .doSomethingElse();

        // Nothing should be executed yet
        expect(executeCount).to.equal(0);

        // At this point we run the chain
        var chainResult = generatedChain(object);

        expect(executeCount).to.equal(4);
        expect(chainResult).to.equal(object);
    });

    it("passes down the chain the transformations made at each point in the chain", function() {
        var nchainImplementation = require("../nchain.js"),
            mockerators,
            object = {},
            selector = "foo",
            executeCount = 0;

        mockerators = {
            "select": function(innerObject, innerSelector) {
                innerObject.selectRan = true;
                executeCount ++;
                return _.clone(innerObject, true);
            },
            "mock1": function(innerObject, arg1) {
                innerObject.mock1Ran = true;
                executeCount ++;

                return _.clone(innerObject, true);
            },
            "mock2": function(innerObject, arg1, arg2) {
                innerObject.mock2Ran = true;
                executeCount ++;

                return _.clone(innerObject, true);
            },
            "doSomethingElse": function(innerObject) {
                innerObject.doSomethingElseRan = true;
                executeCount ++;

                return _.clone(innerObject, true);
            }
        };

        var nchain = nchainImplementation(mockerators, _),
            generatedChain =
                nchain(selector)
                    .mock2("mock2arg1", "mock2arg2")
                    .mock1("mock1arg1")
                    .doSomethingElse();

        // Nothing should be executed yet
        expect(executeCount).to.equal(0);

        // At this point we run the chain
        var chainResult = generatedChain(object);

        expect(executeCount).to.equal(4);

        // Because we cloned it at every return stage to verify chaining
        expect(chainResult).to.not.equal(object);

        // But we expect it to deep equal this...
        expect(chainResult).to.eql({
            "selectRan": true,
            "mock1Ran": true,
            "mock2Ran": true,
            "doSomethingElseRan": true
        });
    });

    it("clones objects at every chain stage when strict is true", function() {
        var nchainImplementation = require("../nchain.js"),
            mockerators,
            object = {},
            selector = "foo",
            objectStage1, objectStage2, objectStage3, objectStage4;

        mockerators = {
            "select": function(innerObject, innerSelector) {
                expect(innerObject).to.eql(object);
                expect(innerObject).to.not.equal(object);
                innerObject.fooBarBaz = "abc";
                objectStage1 = innerObject;
                return innerObject;
            },
            "mock1": function(innerObject) {
                expect(innerObject).to.eql(objectStage1);
                expect(innerObject).to.not.equal(objectStage1);
                innerObject.barQuxBaz = "def";
                objectStage2 = innerObject;
                return innerObject;
            },
            "mock2": function(innerObject) {
                expect(innerObject).to.eql(objectStage2);
                expect(innerObject).to.not.equal(objectStage2);
                innerObject.mrBiscuits = "a very nice fellow";
                objectStage3 = innerObject;
                return innerObject;
            },
            "doSomethingElse": function(innerObject) {
                expect(innerObject).to.eql(objectStage3);
                expect(innerObject).to.not.equal(objectStage3);
                innerObject.howDisappointing = 4;
                objectStage4 = innerObject;
                return innerObject;
            }
        };

        var nchain = nchainImplementation(mockerators, _),
            generatedChain =
                nchain(selector)
                    .mock1()
                    .mock2()
                    .doSomethingElse();

        // At this point we run the chain
        var chainResult = generatedChain(object);

        // Because we cloned it at every return stage to verify chaining
        expect(chainResult).to.not.equal(object);

        // But we expect it to deep equal this...
        expect(chainResult).to.eql({
            "fooBarBaz": "abc",
            "barQuxBaz": "def",
            "mrBiscuits": "a very nice fellow",
            "howDisappointing": 4
        });
    });

    it("does not clone objects at every chain stage when strict is false", function() {
        var nchainImplementation = require("../nchain.js"),
            mockerators,
            object = {},
            selector = "foo",
            objectStage1, objectStage2, objectStage3, objectStage4;

        mockerators = {
            "select": function(innerObject, innerSelector) {
                expect(innerObject).to.equal(object);
                innerObject.fooBarBaz = "abc";
                objectStage1 = innerObject;
                return innerObject;
            },
            "mock1": function(innerObject) {
                expect(innerObject).to.equal(objectStage1);
                innerObject.barQuxBaz = "def";
                objectStage2 = innerObject;
                return innerObject;
            },
            "mock2": function(innerObject) {
                expect(innerObject).to.equal(objectStage2);
                innerObject.mrBiscuits = "a very nice fellow";
                objectStage3 = innerObject;
                return innerObject;
            },
            "doSomethingElse": function(innerObject) {
                expect(innerObject).to.equal(objectStage3);
                innerObject.howDisappointing = 4;
                objectStage4 = innerObject;
                return innerObject;
            }
        };

        var nchain = nchainImplementation(mockerators, _),
            generatedChain =
                nchain(selector)
                    .nastyButFast(true)
                    .mock1()
                    .mock2()
                    .doSomethingElse();

        // At this point we run the chain
        var chainResult = generatedChain(object);

        // Because we cloned it at every return stage to verify chaining
        expect(chainResult).to.equal(object);

        // But we expect it to deep equal this...
        expect(chainResult).to.eql({
            "fooBarBaz": "abc",
            "barQuxBaz": "def",
            "mrBiscuits": "a very nice fellow",
            "howDisappointing": 4
        });
    });
});

