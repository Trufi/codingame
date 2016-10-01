// width height myId
const firstLine = '13 11 1';
/* eslint-disable */
const steps = [

[".............",".X.X.X.X.X.X.",".............",".X.X.X.X.X.X.","11...........","1X.X.X.X.X.X.","111..........",".X1X.X.X.X.X.",".0...........",".X.X.X.X.X.X.",".............","6","0 0 0 2 10 4","0 1 0 9 5 4","0 2 2 3 2 11","1 1 4 8 2 4","1 1 2 8 4 4","1 2 2 4 8 11"]

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
            drawMap(steps[i]);
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

function drawMap(step) {
    let map = step.slice(0, 11);
    map = map.map(row => {
        return row.split('').map(c => {
            if (c === '0' || c === '1' || c === '2') {
                return 'B';
            } else if (c === 'X') {
                return 'W';
            }
            return c;
        });
    });

    let c = 11;
    const entities = parseInt(step[c++]);
    for (let i = 0; i < entities; i++) {
        const inputs = step[c++].split(' ');
        const entityType = parseInt(inputs[0]);
        const owner = parseInt(inputs[1]);
        const x = parseInt(inputs[2]);
        const y = parseInt(inputs[3]);
        const p1 = parseInt(inputs[4]);

        if (entityType === 0) {
            if (owner === 0) {
                map[y][x] = 'P';
            } else {
                map[y][x] = 'U';
            }
        } else if (entityType === 1) {
            map[y][x] = p1;
        } else if (entityType === 2) {
            map[y][x] = 'I';
        }
    }

    console.log(map.map(row => row.join(' ')).join('\n'));
}
