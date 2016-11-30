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

let turn = 0;

const WIZARD = 'WIZARD';
const OPPONENT_WIZARD = 'OPPONENT_WIZARD';
const SNAFFLE = 'SNAFFLE';
const BLUDGER = 'BLUDGER';
const LEFT = 'LEFT';
const RIGHT = 'RIGHT';
const HOLD = 'HOLD';
const EMPTY = 'EMPTY';

const WIZARD_RADIUS = 400;
const BLUDGER_RADIUS = 200;

const spells = {
    obliviate: {
        cost: 5,
        duration: 3,
        targets: []
    },
    petrificus: {
        cost: 10,
        duration: 1,
        targets: []
    },
    accio: {
        cost: 20,
        duration: 6,
        targets: []
    }
};

const goals = {};
goals.LEFT = {x: 0, y: 3750};
goals.RIGHT = {x: 16000, y: 3750};

const state = {};

state.mana = 0;

state.team = parseInt(inputRead()) === 0 ? LEFT : RIGHT;

state.goal = state.team === LEFT ? goals.RIGHT : goals.LEFT;

const readNewRound = () => {
    const wizards = state.wizards = [];
    const opponents = state.opponents = [];
    const snaffles = state.snaffles = [];
    const bludgers = state.bludgers = [];

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
            case BLUDGER: bludgers.push({id, x, y, vx, vy}); break;
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

const findDangerBludger = (wizard, bludgers) => {
    const DANGER_RADIUS = WIZARD_RADIUS + BLUDGER_RADIUS + 200;
    const {target, dist} = findNearestBowl(wizard, bludgers);

    if (dist < DANGER_RADIUS && !spells.obliviate.targets[target.id]) {
        return target;
    }

    return null;
};

const increaseMana = (x) => {
    state.mana = Math.min(state.mana + x, 100);
};

const dicreaseMana = (x) => {
    state.mana = Math.max(state.mana - x, 0);
};

const updateSpellTargets = () => {
    for (let name in spells) {
        const spell = spells[name];
        for (let id in spell.targets) {
            if (turn - spell.targets[id].turn > spell.duration) {
                delete spell.targets[id];
            }
        }
    }
};

const vecLength = (x, y) => Math.sqrt(x * x + y * y);

const fastestOpponent = (state) => {
    const {opponents} = state;
    let fastest = null;

    for (let i = 0; i < opponents.length; i++) {
        const w = opponents[i];
        const speed = vecLength(w.vx, w.vy);
        if (!fastest || fastest.speed < speed) {
            fastest = {
                opponent: w,
                speed
            };
        }
    }

    return fastest.opponent;
};

const findAccioTarget = (state) => {
    const {team, snaffles, wizards} = state;

    const less = team === LEFT ?
        (a, b) => a < b :
        (a, b) => a > b;

    let minWizardX;
    wizards.forEach(w => {
        if (!minWizardX || less(w.x, minWizardX)) {
            minWizardX = w.x;
        }
    });

    let minSnaffle;
    snaffles.forEach(s => {
        if (!minSnaffle || less(s.x, minSnaffle.x)) {
            minSnaffle = s;
        }
    });

    const ACCIO_MIN_DIST = 50;

    if (
        !spells.accio.targets[minSnaffle.id] &&
        less(minSnaffle.x, minWizardX) &&
        Math.abs(minSnaffle.x - minWizardX) > ACCIO_MIN_DIST
    ) {
        return minSnaffle;
    }

    return null;
};

while (true) {
    inputClear();

    readNewRound();

    log(allInput);

    turn += 1;

    increaseMana(1);

    updateSpellTargets();

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
            // Если рядом опасный бледжер – бросаем в него заклинание
            const dangerBludger = findDangerBludger(wizard, state.bludgers);
            if (dangerBludger && state.mana > spells.obliviate.cost) {
                print(`OBLIVIATE ${dangerBludger.id}`);
                spells.obliviate.targets[dangerBludger.id] = {
                    target: dangerBludger,
                    start: turn
                };
                dicreaseMana(spells.obliviate.cost);
                continue;
            }

            // Если много маны – спамим на врагов петрификус
            if (state.mana > spells.obliviate.cost * 2 + spells.petrificus.cost) {
                const target = fastestOpponent(state);
                print(`PETRIFICUS ${target.id}`);
                spells.petrificus.targets[target.id] = {
                    target: target,
                    start: turn
                };
                dicreaseMana(spells.petrificus.cost);
                continue;
            }

            // Если есть мана – спамим акцио
            // if (state.mana > spells.obliviate.cost * 2 + spells.accio.cost) {
            //     const target = findAccioTarget(state);
            //     if (target) {
            //         print(`ACCIO ${target.id}`);
            //         spells.accio.targets[target.id] = {
            //             target,
            //             start: turn
            //         };
            //         dicreaseMana(spells.accio.cost);
            //         continue;
            //     }
            // }

            const {target} = wizard;

            if (target) {
                print(`MOVE ${target.x} ${target.y} 150`);
            } else {
                print(`MOVE ${wizard.x} ${wizard.y} 150`);
            }
        }

        // Edit this line to indicate the action for each wizard (0 ≤ thrust ≤ 150, 0 ≤ power ≤ 500)
        // i.e.: "MOVE x y thrust" or "THROW x y power"
    }
}
