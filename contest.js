// Нужно добавить:
// 1. Не правильно выбираются места для взрывов пустых клеток
// 2. Не работает определение цепного взрыка бомб
// 3. Убегать от бомб (включая собственные)

const inputs = readline().split(' ');
const width = parseInt(inputs[0]);
const height = parseInt(inputs[1]);
const myId = parseInt(inputs[2]);

const FLOOR = 'FLOOR';
const BOMB = 'BOMB';
const BOX = 'BOX';
const WALL = 'WALL';
const ITEM = 'ITEM';

const ITEM_RANGE = 'ITEM_RANGE';
const ITEM_BOMB = 'ITEM_BOMB';

let target;

let _log;

const logObject = (obj, deep, p) => {
    p = p || '';

    if (deep < 0) {
        return '...';
    }

    let s = '{\n';
    p += '  ';
    for (let key in obj) {
        s += p + key + ': ' + _log(obj[key], deep, p + '  ') + ',\n';
    }
    p = p.slice(0, -2);
    s += p + '}';
    return s;
};

_log = (n, deep, p) => {
    p = p || '';

    if (deep < 0) {
        return '...';
    }

    let s = '';

    if (typeof n === 'object') {
        s += logObject(n, deep - 1, p);
    } else {
        s += n;
    }

    return s;
};

const log = (n, deep = 2) => {
    printErr(_log(n, deep));
};

const createUser = (owner, x, y, bombs, bombRange) => ({owner, x, y, bombs, bombRange});
const createBomb = (owner, x, y, timer, range) => ({owner, x, y, timer, range});
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
            const cell = {
                x: j,
                y: i,
                explodeFrom: []
            };

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

const calculateExplosians = (map, x, y, range, filter) => {
    // vertical
    const minY = clamp(0, height - 1, y - (range - 1));
    const maxY = clamp(0, height - 1, y + (range - 1));
    const explosians = [];

    for (let i = y - 1; i >= minY; i--) {
        const p = map[i][x];
        if (filter(p) && !p.explode) {
            explosians.push(p);
            break;
        } else if (p.type === WALL || p.type === ITEM || p.type === BOX) {
            break;
        }
    }
    for (let i = y + 1; i <= maxY; i++) {
        const p = map[i][x];
        if (filter(p) && !p.explode) {
            explosians.push(p);
            break;
        } else if (p.type === WALL || p.type === ITEM || p.type === BOX) {
            break;
        }
    }

    // horizontal
    const minX = clamp(0, width - 1, x - (range - 1));
    const maxX = clamp(0, width - 1, x + (range - 1));

    for (let i = x - 1; i >= minX; i--) {
        const p = map[y][i];
        if (filter(p) && !p.explode) {
            explosians.push(p);
            break;
        } else if (p.type === WALL || p.type === ITEM || p.type === BOX) {
            break;
        }
    }
    for (let i = x + 1; i <= maxX; i++) {
        const p = map[y][i];
        if (filter(p) && !p.explode) {
            explosians.push(p);
            break;
        } else if (p.type === WALL || p.type === ITEM || p.type === BOX) {
            break;
        }
    }

    return explosians;
};

const addBombToMap = (map, bomb) => {
    const {x, y, range} = bomb;

    map[y][x] = {
        type: BOMB,
        data: bomb,
        explode: true,
        explodeFrom: [bomb]
    };

    const minY = clamp(0, height - 1, y - (range - 1));
    const maxY = clamp(0, height - 1, y + (range - 1));
    for (let i = y - 1; i >= minY; i--) {
        const p = map[i][x];
        if (p.type === BOX || p.type === ITEM) {
            p.explode = true;
            p.explodeFrom.push(bomb);
            break;
        } else if (p.type === WALL) {
            break;
        } else if (p.type === BOMB && p.timer > bomb.timer) {
            addBombToMap(map, createBomb(p.owner, p.x, p.y, bomb.timer));
        }
        p.explode = true;
        p.explodeFrom.push(bomb);
    }
    for (let i = y + 1; i <= maxY; i++) {
        const p = map[i][x];
        if (p.type === BOX || p.type === ITEM) {
            p.explode = true;
            p.explodeFrom.push(bomb);
            break;
        } else if (p.type === WALL) {
            break;
        } else if (p.type === BOMB && p.timer > bomb.timer) {
            addBombToMap(map, createBomb(p.owner, p.x, p.y, bomb.timer));
        }
        p.explode = true;
        p.explodeFrom.push(bomb);
    }

    const minX = clamp(0, width - 1, x - (range - 1));
    const maxX = clamp(0, width - 1, x + (range - 1));
    for (let i = x - 1; i >= minX; i--) {
        const p = map[y][i];
        if (p.type === BOX || p.type === ITEM) {
            p.explode = true;
            p.explodeFrom.push(bomb);
            break;
        } else if (p.type === WALL) {
            break;
        } else if (p.type === BOMB && p.timer > bomb.timer) {
            addBombToMap(map, createBomb(p.owner, p.x, p.y, bomb.timer));
        }
        p.explode = true;
        p.explodeFrom.push(bomb);
    }
    for (let i = x + 1; i <= maxX; i++) {
        const p = map[y][i];
        if (p.type === BOX || p.type === ITEM) {
            p.explode = true;
            p.explodeFrom.push(bomb);
            break;
        } else if (p.type === WALL) {
            break;
        } else if (p.type === BOMB && p.timer > bomb.timer) {
            addBombToMap(map, createBomb(p.owner, p.x, p.y, bomb.timer));
        }
        p.explode = true;
        p.explodeFrom.push(bomb);
    }
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

const checkExplode = (map, path, x, y) => {
    const place = map[y][x];
    if (!place.explode) {
        return false;
    }

    const explodeFrom = place.explodeFrom;
    for (let i = 0; i < explodeFrom.length; i++) {
        const bomb = explodeFrom[i];
        if (path.length + 1 === bomb.timer) {
            return true;
        }
    }

    return false;
};

const checkWaveStepPoint = (wave, path, x, y) => {
    if (checkPlace(wave.map, x, y) && !checkExplode(wave.map, path, x, y)) {
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

const searchBoxes = (map, wavePlaces, my, curtar) => {
    const places = [];

    wavePlaces.forEach(wavePlace => {
        const {x, y, distance, path} = wavePlace;

        if (curtar && (x === curtar.x && y === curtar.y)) {
            return;
        }

        const place = {
            x, y, distance,
            explosians: calculateExplosians(map, x, y, my.bombRange, p => p.type === BOX),
            step: path[1] || {x, y}
        };

        if (place.explosians.length === 0) {
            return;
        }

        places.push(place);
    });

    places.sort((a, b) => {
        // если у нас бомб больше одной - выбираем ближайший ящик
        // если одна - ищем наиболее эффективных бах!
        if (my.bombs > 1) {
            return a.distance - b.distance;
        }

        const count = b.explosians.length - a.explosians.length;

        if (count === 0) {
            return a.distance - b.distance;
        }

        return count;
    });

    return places[0] || null;
};

const searchBombPlace = (map, wavePlaces, my) => {
    const places = [];

    wavePlaces.forEach(wavePlace => {
        const {x, y, distance, path} = wavePlace;
        const place = {
            x, y, distance,
            explosians: calculateExplosians(map, x, y, my.bombRange, () => true),
            step: path[1] || {x, y}
        };
        places.push(place);
    });

    places.sort((a, b) => {
        const count = b.explosians.length - a.explosians.length;

        if (count === 0) {
            return a.distance - b.distance;
        }

        return count;
    });

    return places[0] || null;
};

const searchPlace = (map, my, curtar) => {
    const wave = createWave(map, my.x, my.y);
    const wavePlaces = waveEnd(wave);

    // если стоим на цели, то добавляем будущую бомбу на карту для расчета ценности взрыва
    // но обязательно после поиска пути
    if (curtar) {
        addBombToMap(map, createBomb(myId, my.x, my.y, 9, my.bombRange));
    }

    // ищем место с наибольшим количеством коробок
    const boxedPlace = searchBoxes(map, wavePlaces, my, curtar);
    if (boxedPlace) {
        return {
            type: 'boxes',
            target: boxedPlace
        };
    }

    // бегаем и ставим бомбы
    const bombPlace = searchBombPlace(map, wavePlaces, my);
    if (bombPlace) {
        return {
            type: 'bombs',
            target: bombPlace
        };
    }

    return null;
};

const addItemToMap = (map, item) => {
    map[item.y][item.x] = {
        type: ITEM,
        data: item,
        explodeFrom: []
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
        const inputs = readline().split(' ');
        var entityType = parseInt(inputs[0]);
        var owner = parseInt(inputs[1]);
        var x = parseInt(inputs[2]);
        var y = parseInt(inputs[3]);
        var param1 = parseInt(inputs[4]);
        var param2 = parseInt(inputs[5]);

        if (entityType === 0) {
            if (owner === myId) {
                my = createUser(owner, x, y, param1, param2);
            } else {
                enemies.push(createUser(owner, x, y, param1, param2));
            }
        } else if (entityType === 1) {
            const bomb = createBomb(owner, x, y, param1, param2);
            bombs.push(bomb);
            addBombToMap(map, bomb);
        } else if (entityType === 2) {
            const item = createItem(x, y, param1);
            items.push(item);
            addItemToMap(map, item);
        }
    }

    const place = searchPlace(map, my);
    if (!place) {
        print('MOVE ' + my.x + ' ' + my.y + ' no target no type');
        continue;
    }

    const type = place.type;
    target = place.target;

    printErr('bombs: ' + my.bombs + ' range: ' + my.bombRange);

    if (!target) {
        print('MOVE ' + my.x + ' ' + my.y + ' no target ' + type);
        continue;
    }

    if (my.bombs > 0 && target.x === my.x && target.y === my.y) {
        const place = searchPlace(map, my, target);

        if (!place) {
            print('MOVE ' + my.x + ' ' + my.y + ' no target no type');
            continue;
        }

        const type = place.type;
        target = place.target;

        if (!target) {
            print('BOMB ' + my.x + ' ' + my.y + ' no target ' + type);
        } else {
            printErr('explosians count: ' + target.explosians.length);
            print('BOMB ' + target.step.x + ' ' + target.step.y + ' new target ' +
                target.x + ' ' + target.y + ' ' + type);
        }
    } else if (my.bombs === 0) {
        print('MOVE ' + target.step.x + ' ' + target.step.y + ' wait bombs ' +
            target.x + ' ' + target.y + ' ' + type);
    } else {
        printErr('explosians count: ' + target.explosians.length);
        print('MOVE ' + target.step.x + ' ' + target.step.y + ' move target ' +
            target.x + ' ' + target.y + ' ' + type);
    }
}
