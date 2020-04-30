Math.sign = Math.sign || function (a) { a = +a; return a === 0 || isNaN(a) ? a : a > 0 ? 1 : -1; };
Math.trunc || (Math.trunc = function (a) { a = +a; return a - a % 1 || (isFinite(a) && a !== 0 ? a < 0 ? -0 : 0 : a); });
Number.isInteger = Number.isInteger || function (a) { return typeof a === 'number' && isFinite(a) && Math.floor(a) === a; };
