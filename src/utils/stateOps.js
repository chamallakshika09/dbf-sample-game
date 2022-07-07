const rdiff = require('recursive-diff');

const getDiff = (initialVal, changedVal) => {
  const diff = rdiff.getDiff(initialVal, changedVal);
  return diff;
};

const updateDiff = (initialVal, diff) => {
  const c = rdiff.applyDiff(initialVal, diff);
  return c;
};

module.exports = {
  getDiff,
  updateDiff,
};
