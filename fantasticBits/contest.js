const DEBUG = true;

/* eslint-disable no-unused-vars */
const log = msg => {
    if (!DEBUG) { return; }
    printErr(JSON.stringify(msg));
};

let allInput = [];
const inputRead = () => {
    const str = readline();
    allInput.push(str);
    return str;
};
const inputClear = () => { allInput = []; };
/* eslint-enable no-unused-vars */

const WIZARD = 'WIZARD';
const OPPONENT_WIZARD = 'OPPONENT_WIZARD';
const SNAFFLE = 'SNAFFLE';
const LEFT = 'LEFT';
const RIGHT = 'RIGHT';
const HOLD = 'HOLD';
const EMPTY = 'EMPTY';

const goals = {};
goals.LEFT = {x: 0, y: 3750};
goals.RIGHT = {x: 16000, y: 3750};

const state = {};

state.team = parseInt(inputRead()) === 0 ? LEFT : RIGHT;

state.goal = state.team === LEFT ? goals.RIGHT : goals.LEFT;

const readNewRound = () => {
    const wizards = state.wizards = [];
    const opponents = state.opponents = [];
    const snaffles = state.snaffles = [];

    const entities = parseInt(inputRead()); // number of entities still in game
    for (let i = 0; i < entities; i++) {
        const inputs = inputRead().split(' ');
        const id = parseInt(inputs[0]); // entity identifier
        const type = inputs[1]; // "WIZARD", "OPPONENT_WIZARD" or "SNAFFLE" (or "BLUDGER" after first league)
        const x = parseInt(inputs[2]); // position
        const y = parseInt(inputs[3]); // position
        const vx = parseInt(inputs[4]); // velocity
        const vy = parseInt(inputs[5]); // velocity
        const st = parseInt(inputs[6]) === 1 ? HOLD : EMPTY;

        switch (type) {
            case WIZARD: wizards.push({id, x, y, vx, vy, st}); break;
            case OPPONENT_WIZARD: opponents.push({id, x, y, vx, vy, st}); break;
            case SNAFFLE: snaffles.push({id, x, y, vx, vy}); break;
        }
    }
};

const distance = (a, b) => Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));

const findNearestBowl = (from, bowls, exceptIds) => {
    let neareast = null;
    let dist = Infinity;

    for (let i = 0; i < bowls.length; i++) {
        const bowl = bowls[i];

        if (exceptIds && exceptIds.indexOf(bowl.id) !== -1) {
            continue;
        }

        const d = distance(from, bowl);
        if (dist > d) {
            dist = d;
            neareast = bowl;
        }
    }

    return {
        target: neareast,
        dist
    };
};

while (true) {
    inputClear();

    readNewRound();

    log(allInput);

    // определяем какой волшебник к какому мячу полетит
    const wizardsOrder = [];
    for (let i = 0; i < 2; i++) {
        const wizard = state.wizards[i];
        const {dist} = findNearestBowl(wizard, state.snaffles);
        wizardsOrder.push({index: i, dist});
    }
    wizardsOrder.sort((a, b) => a.dist - b.dist);

    const goal = state.goal;
    const busySnaffles = [];

    for (let i = 0; i < 2; i++) {
        const wizard = state.wizards[wizardsOrder[i].index];
        if (wizard.st === EMPTY) {
            wizard.target = findNearestBowl(wizard, state.snaffles, busySnaffles).target;
            if (wizard.target) {
                busySnaffles.push(wizard.target.id);
            }
        }
    }

    for (let i = 0; i < 2; i++) {
        const wizard = state.wizards[i];

        if (wizard.st === HOLD) {
            print(`THROW ${goal.x} ${goal.y} 500`);
        } else {
            const {target} = wizard;

            if (target) {
                print(`MOVE ${target.x} ${target.y} 100`);
            } else {
                print(`MOVE ${wizard.x} ${wizard.y} 100`);
            }
        }

        // Edit this line to indicate the action for each wizard (0 ≤ thrust ≤ 150, 0 ≤ power ≤ 500)
        // i.e.: "MOVE x y thrust" or "THROW x y power"
    }
}
