// width height myId
const firstLine = '0';
/* eslint-disable */
const steps = [
["11","0 WIZARD 4850 3823 149 43 0","1 WIZARD 5443 3233 323 2 1","2 OPPONENT_WIZARD 10951 4057 -240 -10 0","3 OPPONENT_WIZARD 10213 4740 -294 -31 0","4 SNAFFLE 6931 3112 0 0 0","5 SNAFFLE 8783 4347 -294 -43 0","6 SNAFFLE 5443 3233 323 2 0","7 SNAFFLE 9348 4574 -19 147 0","8 SNAFFLE 7112 3886 380 7 0","9 SNAFFLE 10719 3649 -22 -63 0","10 SNAFFLE 8000 3750 0 0 0"]

];
/* eslint-enable */
let counter = 0;

window.readline = () => {
    if (counter === 0) {
        counter++;
        return firstLine;
    }
    let c = 1;
    for (let i = 0; i < steps.length; i++) {
        if (counter - c === 0) {
            console.timeEnd('step');
            console.groupEnd();
            console.group('Step ' + i);
            console.time('step');
        }

        if (counter - c < steps[i].length) {
            return steps[i][counter++ - c];
        }
        c += steps[i].length;
    }
    console.timeEnd('step');
    console.groupEnd();
};

window.print = (...args) => console.log(...args);
window.printErr = (...args) => console.log(...args);
