// width height myId
const firstLine = '13 11 1';
/* eslint-disable */
const steps = [
[".............",".X.X1X2X.X0X.",".2..10.01....","2X.X2X1X2X.X.","0..1.....1..0","1X.X.X.X.X.X1","0..1.....1..0","2X.X2X1X2X.X2",".2..10.01..2.",".X0X.X2X.X0X.",".............","13","0 0 0 2 1 3","0 1 12 10 1 3","0 2 11 0 1 4","0 3 2 10 0 3","1 0 2 2 3 3","1 2 8 1 3 4","1 3 6 10 5 3","1 1 12 8 7 3","2 0 8 9 1 1","2 0 4 9 1 1","2 0 0 8 2 2","2 0 11 2 2 2","2 0 12 3 2 2"]

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
