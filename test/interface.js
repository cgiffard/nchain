var expect = require("chai").expect;

describe("External Interface", function() {
    it("exports a function", function() {
        var nchain = require("../");

        expect(nchain).to.be.an.instanceOf(Function);
    });

    it("exports available node operators as properties", function() {
        var nchain = require("../");

        expect(nchain.operators).to.be.an.instanceOf(Object);
        Object.keys(nchain.operators).forEach(function(key) {
            expect(nchain.operators[key]).to.be.an.instanceOf(Function);
        });
    });

    it("exports a function that when run exports a function of arity 1", function() {
        var nchain = require("../"),
            nchainExecuted = nchain();

        expect(nchainExecuted).to.be.an.instanceOf(Function);
        expect(nchainExecuted.length).to.equal(1);
    });

    it("exports a function that when run exports a function with operator function properties",
        function() {
            var nchain = require("../"),
                nchainExecuted = nchain();

            Object.keys(nchain.operators).forEach(function(key) {
                expect(nchainExecuted[key]).to.be.an.instanceOf(Function);
            });
        });

    it("exports a function that when run exports a function for setting strictness",
        function() {
            var nchain = require("../"),
                nchainExecuted = nchain();

            expect(nchainExecuted.nastyButFast).to.be.an.instanceOf(Function);
        });
});