const Router = require("../router");
const R = require("ramda");

test('updated devices lense getter returns correct value', () => {
    expect(R.view(Router.inputNameLens, [{"test_device": {}}, {}])).toBe("test_device");
});

test('updated devices lense data getter returns correct value', () => {
    expect(R.view(Router.inputDataLens, [{"test_device": 42}, {}])).toBe(42);
});

test('state devices lense data getter returns correct value', () => {
    expect(R.view(Router.stateLens, [{}, 42])).toBe(42);
});