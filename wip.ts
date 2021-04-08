const plugins = [];

const inp = (x) => x + 3;

const old = (b) => {
  let x = b;
  plugins.forEach((plugin) => {
    x = plugin(x);
  });
  return x;
};

const oldDecor = old(inp);

const neww = (b) => {
  let key = -1;
  let c;
  return (...args) => {
    if (key !== plugins.length) {
      key = plugins.length;
      c = old(b);
    }
    return c(...args);
  };
};

const newDecor = neww(inp);

console.log(oldDecor(1));
console.log(newDecor(1));

const pus = (x) => (y) => x(y) + 4;

plugins.push(pus);

console.log(oldDecor(1));
console.log(newDecor(1));
