var expect = require("chai").expect,
    _ = require("lodash");

describe("Context Tracking API", function() {

    it("provides the original object context from the first object passed in", function() {
        var nchainImplementation = require("../nchain.js"),
            selectorMock,
            mockerators,
            originalObject = {},
            executeCount = 0;

        selectorMock = "foo";
        mockerators = {
            "contextTest": function() {
                executeCount ++;
                expect(this.originalContext).to.equal(originalObject);
            },
            "select": function(inObject) {
                return inObject;
            }
        };

        var nchain = nchainImplementation(mockerators, _),
            generatedChain =
                nchain(selectorMock)
                    .contextTest();

        // Run test
        generatedChain(originalObject);

        expect(executeCount).to.equal(1);

    });

    it("provides an API to push new contexts onto the context stack", function() {
        var nchainImplementation = require("../nchain.js"),
            selectorMock,
            mockerators,
            originalObject = {},
            secondContext = {"second":"context"},
            executeCount = 0;

        selectorMock = "foo";
        mockerators = {
            "contextTest": function() {
                executeCount ++;
                expect(this.pushContext).to.be.an.instanceOf(Function);
                this.pushContext(secondContext);
            },
            "contextTest2": function(inObject) {
                executeCount ++;
                expect(this.contextStack).to.be.an.instanceOf(Array);
                expect(this.contextStack[0]).to.equal(originalObject);
                expect(this.contextStack[1]).to.equal(originalObject);
                expect(this.contextStack[2]).to.equal(secondContext);
                expect(this.contextStack[2]).to.not.equal(originalObject);
                expect(this.contextStack[2]).to.equal(inObject);
            },
            "select": function(inObject) {
                return inObject;
            }
        };

        var nchain = nchainImplementation(mockerators, _),
            generatedChain =
                nchain(selectorMock)
                    .nastyButFast(true)
                    .contextTest()
                    .contextTest2();

        // Run test
        generatedChain(originalObject);

        expect(executeCount).to.equal(2);
    });

    it("provides an API to pop old contexts off the context stack", function() {
        var nchainImplementation = require("../nchain.js"),
            mockerators,
            originalObject = {},
            mockContextStack = [
                "context 1",
                "context 2",
                "context 3"
            ],
            executeCount = 0;

        selectorMock = "foo";
        mockerators = {
            "select": function(inObject) {
                executeCount ++;
                expect(this.popContext).to.be.ok;
                expect(this.popContext).to.be.an.instanceOf(Function);

                mockContextStack.forEach(this.pushContext);

                expect(this.contextStack.length).to.equal(3);
                expect(this.context).to.equal("context 3");

                this.popContext(inObject);

                expect(this.contextStack.length).to.equal(2);
                expect(this.context).to.equal("context 2");

                this.popContext(inObject);

                expect(this.contextStack.length).to.equal(1);
                expect(this.context).to.equal("context 1");

                return inObject;
            }
        };

        var nchain = nchainImplementation(mockerators, _),
            generatedChain = nchain("foo");

        // Run test
        generatedChain(originalObject);

        expect(executeCount).to.equal(1);
    });

    it("adds return values from operators to the context stack", function() {
        var nchainImplementation = require("../nchain.js"),
            selectorMock,
            mockerators,
            originalObject = {},
            mockContextStack = [
                {}, {}, [], {}
            ],
            executeCount = 0;

        selectorMock = "foo";
        mockerators = {
            "select": function(inObject) {
                executeCount ++;
                expect(this.contextStack).to.eql([{}]);
                return mockContextStack[0];
            },
            "foo": function() {
                executeCount ++;
                expect(this.contextStack).to.eql([{}, {}]);
                return mockContextStack[1];
            },
            "bar": function() {
                executeCount ++;
                expect(this.contextStack).to.eql([{}, {}, {}]);
                return mockContextStack[2];
            },
            "baz": function() {
                executeCount ++;
                expect(this.contextStack).to.eql([{}, {}, {}, []]);
                return mockContextStack[3];
            },
            "qux": function() {
                executeCount ++;
                expect(this.contextStack).to.eql([{}, {}, {}, [], {}]);
            }
        };

        var nchain = nchainImplementation(mockerators, _),
            generatedChain =
                nchain(originalObject);

        // Run test
        generatedChain(selectorMock);

        expect(executeCount).to.equal(5);
    });

    it("does not add null values to the context stack", function() {
        var nchainImplementation = require("../nchain.js"),
            selectorMock,
            mockerators,
            originalObject = {},
            mockContextStack = [
                {}, {}, [], {}
            ],
            executeCount = 0;

        selectorMock = "foo";
        mockerators = {
            "select": function(inObject) {
                executeCount ++;
                expect(this.contextStack.length).to.equal(1);
                expect(this.context).to.equal(this.contextStack[0]);
            },
            "foo": function() {
                executeCount ++;
                expect(this.contextStack).to.eql([{}, {}]);
                return mockContextStack[1];
            },
            "bar": function() {
                executeCount ++;
                expect(this.contextStack).to.eql([{}, {}, {}]);
                return mockContextStack[2];
            },
            "baz": function() {
                executeCount ++;
                expect(this.contextStack).to.eql([{}, {}, {}, []]);
                return mockContextStack[3];
            },
            "qux": function() {
                executeCount ++;
                expect(this.contextStack).to.eql([{}, {}, {}, [], {}]);
            }
        };

        var nchain = nchainImplementation(mockerators, _),
            generatedChain =
                nchain(originalObject)
                    .foo()
                    .bar()
                    .baz()
                    .qux();

        // Run test
        generatedChain(selectorMock);

        expect(executeCount).to.equal(5);
    });

    it("does not update the current context with null values", function() {
        var nchainImplementation = require("../nchain.js"),
            selectorMock,
            mockerators,
            originalObject = {},
            executeCount = 0;

        selectorMock = "foo";
        mockerators = {
            "select": function(inObject) {
                executeCount ++;
                expect(this.context).to.equal(originalObject);
            },
            "foo": function() {
                executeCount ++;
                expect(this.context).to.equal(originalObject);
            },
            "bar": function() {
                executeCount ++;
                expect(this.context).to.equal(originalObject);
            },
            "baz": function() {
                executeCount ++;
                expect(this.context).to.equal(originalObject);
                return null;
            },
            "qux": function() {
                executeCount ++;
                expect(this.context).to.equal(originalObject);
            }
        };

        var nchain = nchainImplementation(mockerators, _),
            generatedChain =
                nchain(originalObject)
                    .foo()
                    .bar()
                    .baz()
                    .qux();

        // Run test
        generatedChain(selectorMock);

        expect(executeCount).to.equal(5);
    });

    it("keeps independent executions of the same chain isolated", function() {
        var nchainImplementation = require("../nchain.js"),
            selectorMock,
            mockerators,
            originalObject1 = {},
            executeCount = 0;

        selectorMock = "foo";
        mockerators = {
            "contextTest": function() {
                executeCount ++;
                expect(this.originalContext).to.equal(originalObject);
            },
            "select": function(inObject) {
                return inObject;
            }
        };

        var nchain = nchainImplementation(mockerators, _),
            generatedChain =
                nchain(selectorMock)
                    .contextTest();

        // Run test
        generatedChain(originalObject);

        expect(executeCount).to.equal(1);

    });

});