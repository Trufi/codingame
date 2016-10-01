// width height myId
const firstLine = '13 11 1';
/* eslint-disable */
const steps = [
[".............",".X.X.X.X.X.X.",".............",".X.X.X.X.X.X.",".............",".X.X.X.X.X.X.",".0...........",".X.X.X.X.X.X.",".............",".X.X.X.X.X.X.","..1..........","17","0 0 0 0 1 3","0 1 2 0 1 5","1 1 6 4 1 5","1 1 4 4 3 5","1 1 4 2 5 5","2 0 10 10 1 1","2 0 10 0 1 1","2 0 9 6 2 2","2 0 10 8 1 1","2 0 3 6 2 2","2 0 8 10 2 2","2 0 4 10 2 2","2 0 2 8 1 1","2 0 4 9 1 1","2 0 4 0 2 2","2 0 8 9 1 1","2 0 2 6 2 2"]

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
            console.groupEnd();
            console.group('Step ' + i);
            drawMap(steps[i]);
        }

        if (counter - c < steps[i].length) {
            return steps[i][counter++ - c];
        }
        c += steps[i].length;
    }
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
