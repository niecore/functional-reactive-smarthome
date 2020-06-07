const Lenses = require("../model/lenses");
const R = require("ramda");

test('updated devices lense getter returns correct value', () => {
    expect(R.view(Lenses.inputNameLens, [{"test_device": {}}, {}])).toBe("test_device");
});

test('updated devices lense data getter returns correct value', () => {
    expect(R.view(Lenses.inputDataLens, [{"test_device": 42}, {}])).toBe(42);
});

test('state devices lense data getter returns correct value', () => {
    expect(R.view(Lenses.stateLens, [{}, 42])).toBe(42);
});
