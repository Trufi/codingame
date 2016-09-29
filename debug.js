const firstLine = '13 11 0';
/* eslint-disable */
const step1 = ["......22.....",".X.X.X.X.X.X.",".....11....0.",".X.X.X.X.X.X.",".............",".X.X.X.X.X.X.",".............","1X.X.X.X.X.X1",".............",".X.X.X.X.X.X.",".....2.......","11","0 0 5 4 1 6","0 1 1 6 8 10","1 1 3 2 1 9","1 1 0 5 7 10","2 0 10 3 2 2","2 0 9 2 1 1","2 0 8 1 2 2","2 0 7 2 1 1","2 0 5 0 2 2","2 0 12 3 1 1","2 0 12 5 2 2"]
const step2 = ["......22.....",".X.X.X.X.X.X.","......1....0.",".X.X.X.X.X.X.",".............",".X.X.X.X.X.X.",".............","1X.X.X.X.X.X1",".............",".X.X.X.X.X.X.",".....2.......","11","0 0 6 4 1 6","0 1 2 6 9 10","1 1 0 5 6 10","2 0 10 3 2 2","2 0 9 2 1 1","2 0 8 1 2 2","2 0 7 2 1 1","2 0 5 0 2 2","2 0 12 3 1 1","2 0 12 5 2 2","2 0 5 2 1 1"]
/* eslint-enable */

const lines = [firstLine, ...step1, ...step2];
let counter = 0;

window.readline = () => {
    return lines[counter++];
};

window.print = (...args) => console.log(...args);
window.printErr = (...args) => console.log(...args);

{
    let map = step1.slice(0, 11);
    map = map.map(row => row.split(''));

    let c = 11;
    const entities = parseInt(step1[c++]);
    for (let i = 0; i < entities; i++) {
        const inputs = step1[c++].split(' ');
        const entityType = parseInt(inputs[0]);
        const owner = parseInt(inputs[1]);
        const x = parseInt(inputs[2]);
        const y = parseInt(inputs[3]);

        if (entityType === 0) {
            if (owner === 0) {
                map[y][x] = 'P';
            } else {
                map[y][x] = 'U';
            }
        } else if (entityType === 1) {
            map[y][x] = '@';
        } else if (entityType === 2) {
            map[y][x] = 'I';
        }
    }

    console.log(map.map(row => row.join(' ')).join('\n'));
}
