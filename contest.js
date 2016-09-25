/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const inputs = readline().split(' ');
const width = parseInt(inputs[0]);
const height = parseInt(inputs[1]);
const myId = parseInt(inputs[2]);

const EXPLODE_RADIUS = 3 - 1;

const FLOOR = 'FLOOR';
const BOMB = 'BOMB';
const BOX = 'BOX';
const WALL = 'WALL';
const ITEM = 'ITEM';

const ITEM_RANGE = 'ITEM_RANGE';
const ITEM_BOMB = 'ITEM_BOMB';

let target;

// const log = (s, offset) => {
//     if (typeof s === 'string') {
//         return offset + s;
//     } else if (s.length) {
//         const p = '['
//     }
// }

const createUser = (owner, x, y, bombs) => ({owner, x, y, bombs});
const createBomb = (owner, x, y, timer) => ({owner, x, y, timer});
const createItem = (x, y, type) => ({
    x, y,
    type: type === 1 ? ITEM_RANGE : ITEM_BOMB
});

const getMap = () => {
    const map = [];
    for (let i = 0; i < height; i++) { // y
        const strRow = readline();
        const row = [];

        for (let j = 0; j < width; j++) { // x
            const s = strRow[j];
            const cell = {};

            if (s === '.') {
                cell.type = FLOOR;
            } else if (s === '0') {
                cell.type = BOX;
            } else if (s === 'X') {
                cell.type = WALL;
            } else if (s === '1') {
                cell.type = BOX;
                cell.item = 1;
            } else if (s === '2') {
                cell.type = BOX;
                cell.item = 2;
            } else {
                printErr('Undefined cell type: ' + s + ' x: ' + j + ' y: ' + i);
            }

            row.push(cell);
        }

        map.push(row);
    }
    return map;
};

const clamp = (x1, x2, x) => x < x1 ? x1 : (x > x2 ? x2 : x);

const calculateBoxes = (map, x, y) => {
    // vertical
    const minY = clamp(0, height - 1, y - EXPLODE_RADIUS);
    const maxY = clamp(0, height - 1, y + EXPLODE_RADIUS);
    let vCount = 0;

    for (let i = y - 1; i >= minY; i--) {
        const p = map[i][x];
        if (p.type === BOX && !p.explode) {
            vCount++;
            break;
        }
    }
    for (let i = y + 1; i <= maxY; i++) {
        const p = map[i][x];
        if (p.type === BOX && !p.explode) {
            vCount++;
            break;
        }
    }

    // horizontal
    const minX = clamp(0, width - 1, x - EXPLODE_RADIUS);
    const maxX = clamp(0, width - 1, x + EXPLODE_RADIUS);
    let hCount = 0;

    for (let i = x - 1; i >= minX; i--) {
        const p = map[y][i];
        if (p.type === BOX && !p.explode) {
            hCount++;
            break;
        }
    }
    for (let i = x + 1; i <= maxX; i++) {
        const p = map[y][i];
        if (p.type === BOX && !p.explode) {
            hCount++;
            break;
        }
    }

    return vCount + hCount;
};

const checkPlace = (map, x, y) => {
    if (!map[y] || !map[y][x]) {
        return false;
    }

    const type = map[y][x].type;
    return type !== BOX && type !== BOMB && type !== WALL;
};

const createWave = (map, x, y) => ({
    map,
    closed: {},
    queue: [[{x, y}]]
});

const checkWaveStepPoint = (wave, path, x, y) => {
    if (checkPlace(wave.map, x, y)) {
        const newPath = path.slice();
        newPath.push({x, y});
        wave.queue.push(newPath);
    }
};

const wavePointsSort = (a, b) => b.length - a.length;

const waveStep = (wave, path) => {
    const point = path[path.length - 1];
    const {x, y} = point;

    checkWaveStepPoint(wave, path, x - 1, y);
    checkWaveStepPoint(wave, path, x + 1, y);
    checkWaveStepPoint(wave, path, x, y - 1);
    checkWaveStepPoint(wave, path, x, y + 1);

    wave.queue.sort(wavePointsSort);
};

const waveEnd = wave => {
    if (wave.queue.length === 0) { return null; }

    const places = [];
    const {closed, queue} = wave;

    while (queue.length !== 0) {
        const path = queue.pop();
        const point = path[path.length - 1];
        const {x, y} = point;

        if (closed[x] && closed[x][y]) {
            continue;
        }

        if (!closed[x]) {
            closed[x] = {};
        }

        closed[x][y] = true;

        const place = {
            x, y,
            distance: path.length,
            path: path.slice()
        };

        places.push(place);

        waveStep(wave, path);
    }

    return places;
};

const searchPlace = (map, my, curtar) => {
    const wave = createWave(map, my.x, my.y);
    const wavePlaces = waveEnd(wave);
    const places = [];

    wavePlaces.forEach(wavePlace => {
        const {x, y, distance} = wavePlace;

        if (curtar && (x === curtar.x && y === curtar.y)) {
            return;
        }

        const place = {
            x, y, distance,
            boxesCount: calculateBoxes(map, x, y)
        };

        if (place.boxesCount === 0) {
            return;
        }

        places.push(place);
    });

    places.sort((a, b) => {
        const count = b.boxesCount - a.boxesCount;

        if (count === 0) {
            return a.distance - b.distance;
        }

        return count;
    });

    return places[0] || null;
};

const addBombToMap = (map, bomb) => {
    const x = bomb.x;
    const y = bomb.y;

    map[y][x] = {
        type: BOMB,
        data: bomb
    };

    const minY = clamp(0, height - 1, y - EXPLODE_RADIUS);
    const maxY = clamp(0, height - 1, y + EXPLODE_RADIUS);
    for (let i = minY; i <= maxY; i++) {
        map[i][x].explode = true;
    }

    const minX = clamp(0, width - 1, x - EXPLODE_RADIUS);
    const maxX = clamp(0, width - 1, x + EXPLODE_RADIUS);
    for (let i = minX; i <= maxX; i++) {
        map[y][i].explode = true;
    }
};

const addItemToMap = (map, item) => {
    map[item.y][item.x] = {
        type: ITEM,
        data: item
    };
};

// game loop
while (true) {
    const map = getMap();

    var my;
    const enemies = [];
    const bombs = [];
    const items = [];

    var entities = parseInt(readline());
    for (var i = 0; i < entities; i++) {
        var inputs = readline().split(' ');
        var entityType = parseInt(inputs[0]);
        var owner = parseInt(inputs[1]);
        var x = parseInt(inputs[2]);
        var y = parseInt(inputs[3]);
        var param1 = parseInt(inputs[4]);
        // var param2 = parseInt(inputs[5]);

        if (entityType === 0) {
            if (owner === myId) {
                my = createUser(owner, x, y, param1);
            } else {
                enemies.push(createUser(owner, x, y, param1));
            }
        } else if (entityType === 1) {
            const bomb = createBomb(owner, x, y, param1);
            bombs.push(bomb);
            addBombToMap(map, bomb);
        } else if (entityType === 2) {
            const item = createItem(x, y, param1);
            items.push(item);
            addItemToMap(map, item);
        }
    }

    target = searchPlace(map, my);

    if (!target) {
        print('MOVE ' + my.x + ' ' + my.y);
    } else {
        if (my.bombs > 0 && target.x === my.x && target.y === my.y) {
            target = searchPlace(map, my, target);
            if (!target) {
                print('BOMB ' + my.x + ' ' + my.y);
            } else {
                print('BOMB ' + target.x + ' ' + target.y);
            }
        } else {
            print('MOVE ' + target.x + ' ' + target.y);
        }
    }
}
