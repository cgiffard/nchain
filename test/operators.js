// // nchain("results")
// //     .match("link", /^\/news\/nsw/i)
// //     .replace("link", /^\/news\/nsw/i, "/news/new-south-wales")
// //     .delete("canonical")
// //     .reset()
// //     .select("categories");
// 
// var expect = require("chai").expect;
// 
// describe("Operators", function() {
//     var operators = require("../operators");
// 
//     describe("match", function() {
// 
//         it( "should return true for values which match the regular expression " +
//             "when match is called with two arguments", function() {
// 
//             expect(operators.match("foo", /foo/)).to.be.ok;
//             expect(operators.match("foo bar baz", /ba[zr]/)).to.be.ok;
//             expect(operators.match("foo bar baz", /qux/)).to.be.not.ok;
//         });
// 
//         it( "should return true for objects with property values which match "+
//             "the regular expression when match is called with three arguments", function() {
// 
//             expect(operators.match({"foo":"bar"}, "foo", /bar/)).to.be.ok;
//             expect(operators.match({"foo":"bar", "baz":"qux"}, "baz", /qux/)).to.be.ok;
// 
//         });
// 
//         it( "should return false when called with two arguments and the " +
//             "comparison value is not a string", function() {
// 
//             throw new Error("not implemented");
//         });;
// 
//         it( "should return false when called with three arguments and the "+
//             "comparison value is not an object", function() {
// 
//             throw new Error("not implemented");
//         });
// 
//         it("should return false when called with three arguments and the comparison value does not have a property identified by the first argument");
// 
//     });
// 
//     describe("run", function() {
// 
//         it("should execute a function passed in as the first argument");
// 
//         it("should bind the function passed in to its own view of `this`");
// 
//         it("should pass the object given to it to the function");
// 
//         it("should return the same value as the what is returned by the inner function");
// 
//     });
// 
//     describe("reset", function() {
// 
//         it("should call this.resetContext");
// 
//     });
// });