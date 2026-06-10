// Elements constants
const button_hp_p1_plus = document.querySelector("#player1-increase-hp");
const button_def_p1_plus = document.querySelector("#player1-increase-def");
const button_spd_p1_plus = document.querySelector("#player1-increase-spd");
const button_str_p1_plus = document.querySelector("#player1-increase-str");

const button_hp_p1_minus = document.querySelector("#player1-decrease-hp");
const button_def_p1_minus = document.querySelector("#player1-decrease-def");
const button_spd_p1_minus = document.querySelector("#player1-decrease-spd");
const button_str_p1_minus = document.querySelector("#player1-decrease-str");

const p1_hp_bar = document.querySelector("#player1-hp");
const p2_hp_bar = document.querySelector("#player2-hp");

const p1_str_text = document.querySelector("#player1-str-value");
const p1_def_text = document.querySelector("#player1-def-value");
const p1_spd_text = document.querySelector("#player1-spd-value");
const p1_hp_text = document.querySelector("#player1-hp-value");

const p2_str_text = document.querySelector("#player2-str-value");
const p2_def_text = document.querySelector("#player2-def-value");
const p2_spd_text = document.querySelector("#player2-spd-value");
const p2_hp_text = document.querySelector("#player2-hp-value");

const button_start = document.querySelector("#start-button");
const button_reset = document.querySelector("#reset-button");

const actions_container = document.querySelector("#actions-container");
const button_attack = document.querySelector("#attack-button");
const button_enemy_turn = document.querySelector("#enemy-turn-button");

const win_text = document.querySelector("#win-text");

// Player constants
const INITIAL_POINTS_AVAILABLE = 10;

const BASE_STR = 1;
const BASE_SPD = 0;
const BASE_DEF = 0;
const BASE_HP = 10;

class Player {
    constructor() {
        this.undistributed_points = INITIAL_POINTS_AVAILABLE;

        this.str = BASE_STR;
        this.spd = BASE_SPD;
        this.def = BASE_DEF;
        this.max_hp = BASE_HP;
        this.curr_hp = this.max_hp;

        this.str_points = 0;
        this.spd_points = 0;
        this.def_points = 0;
        this.hp_points = 0;
    }

    spend_point(status, amount) {
        if(this.undistributed_points < amount) {
            return;
        }

        this.undistributed_points -= amount;
        switch(status) {
            case "str":
                this.str_points += amount;
                break;

            case "spd":
                this.spd_points += amount;
                break;

            case "def":
                this.def_points += amount;
                break;

            case "hp":
                this.hp_points += amount;
                break;
        }
    }

    deal_damage() {
        let damage = Math.max(this.str, 1);
        console.log(damage);
        return damage;
    }

    take_damage(damage) {
        this.curr_hp = Math.max(this.curr_hp - Math.max(damage - this.def, 1), 0);
        console.log(this.curr_hp);
    }

    apply_status() {
        this.str = BASE_STR + this.str_points;
        this.spd = BASE_SPD + this.spd_points;
        this.def = BASE_DEF + this.def_points;
        this.max_hp = BASE_HP + this.hp_points;
        this.curr_hp = this.max_hp;
    }

    reset() {
        this.undistributed_points = INITIAL_POINTS_AVAILABLE;

        this.str = BASE_STR;
        this.spd = BASE_SPD;
        this.def = BASE_DEF;
        this.max_hp = BASE_HP;
        this.curr_hp = this.max_hp;

        this.str_points = 0;
        this.spd_points = 0;
        this.def_points = 0;
        this.hp_points = 0;
    }
}

// Functions
function refresh_status(player, enemy) {
    p1_hp_bar.textContent = `${player.curr_hp}/${player.max_hp}`;
    p2_hp_bar.textContent = `${enemy.curr_hp}/${enemy.max_hp}`;

    p1_str_text.textContent = `${player.str_points}`;
    p1_spd_text.textContent = `${player.spd_points}`;
    p1_def_text.textContent = `${player.def_points}`;
    p1_hp_text.textContent = `${player.hp_points}`;

    p2_str_text.textContent = `${enemy.str_points}`;
    p2_spd_text.textContent = `${enemy.spd_points}`;
    p2_def_text.textContent = `${enemy.def_points}`;
    p2_hp_text.textContent = `${enemy.hp_points}`;

    if(player.hp_points <= 0) {
        button_hp_p1_minus.disabled = true;
    } else {
        button_hp_p1_minus.disabled = false;
    }
    if(player.def_points <= 0) {
        button_def_p1_minus.disabled = true;
    } else {
        button_def_p1_minus.disabled = false;
    }
    if(player.spd_points <= 0) {
        button_spd_p1_minus.disabled = true;
    } else {
        button_spd_p1_minus.disabled = false;
    }
    if(player.str_points <= 0) {
        button_str_p1_minus.disabled = true;
    } else {
        button_str_p1_minus.disabled = false;
    }
}

function start_battle(player, enemy) {
    button_start.classList.add("hidden");

    button_hp_p1_plus.classList.add("hidden");
    button_def_p1_plus.classList.add("hidden");
    button_spd_p1_plus.classList.add("hidden");
    button_str_p1_plus.classList.add("hidden");

    button_hp_p1_minus.classList.add("hidden");
    button_def_p1_minus.classList.add("hidden");
    button_spd_p1_minus.classList.add("hidden");
    button_str_p1_minus.classList.add("hidden");

    player.apply_status();
    enemy.apply_status();

    refresh_status(player, enemy);

    actions_container.classList.remove("hidden");

    if(player.spd >= enemy.spd) {
        button_enemy_turn.classList.add("hidden");
        button_attack.classList.remove("hidden");
    } else {
        button_enemy_turn.classList.remove("hidden");
        button_attack.classList.add("hidden");
    }
}

function reset_game(player, enemy) {
    player.reset();
    enemy.reset();

    distribute_points(enemy);

    refresh_status(player, enemy);

    button_start.classList.remove("hidden");

    button_hp_p1_plus.classList.remove("hidden");
    button_def_p1_plus.classList.remove("hidden");
    button_spd_p1_plus.classList.remove("hidden");
    button_str_p1_plus.classList.remove("hidden");

    button_hp_p1_minus.classList.remove("hidden");
    button_def_p1_minus.classList.remove("hidden");
    button_spd_p1_minus.classList.remove("hidden");
    button_str_p1_minus.classList.remove("hidden");

    actions_container.classList.add("hidden");

    win_text.textContent = "";
}

function player_attack(player, enemy) {
    button_attack.classList.add("hidden");

    let damage = player.deal_damage();
    enemy.take_damage(damage);

    refresh_status(player, enemy);

    button_enemy_turn.classList.remove("hidden");

    verify_battle_end(player, enemy)
}

function enemy_turn(player, enemy) {
    button_enemy_turn.classList.add("hidden");

    let damage = enemy.deal_damage();
    player.take_damage(damage);

    refresh_status(player, enemy);

    button_attack.classList.remove("hidden");

    verify_battle_end(player, enemy)
}

function distribute_points(player) {
    player.spend_point("hp", 0);
    player.spend_point("def", 2);
    player.spend_point("str", 4);
    player.spend_point("spd", 4);
}

function verify_battle_end(player, enemy) {
    if(player.curr_hp <= 0) {
        win_text.textContent = "You Lose";
        actions_container.classList.add("hidden");
    }
    else if(enemy.curr_hp <= 0) {
        win_text.textContent = "You Win";
        actions_container.classList.add("hidden");
    }
}

const player = new Player()
const enemy = new Player()

distribute_points(enemy);

refresh_status(player, enemy);

// Setting up event listeners
button_hp_p1_plus.addEventListener("click", () => {
    player.spend_point("hp", 1);
    refresh_status(player, enemy)
});
button_def_p1_plus.addEventListener("click", () => {
    player.spend_point("def", 1);
    refresh_status(player, enemy)
});
button_spd_p1_plus.addEventListener("click", () => {
    player.spend_point("spd", 1);
    refresh_status(player, enemy)
});
button_str_p1_plus.addEventListener("click", () => {
    player.spend_point("str", 1);
    refresh_status(player, enemy)
});

button_hp_p1_minus.addEventListener("click", () => {
    player.spend_point("hp", -1);
    refresh_status(player, enemy)
});
button_def_p1_minus.addEventListener("click", () => {
    player.spend_point("def", -1);
    refresh_status(player, enemy)
});
button_spd_p1_minus.addEventListener("click", () => {
    player.spend_point("spd", -1);
    refresh_status(player, enemy)
});
button_str_p1_minus.addEventListener("click", () => {
    player.spend_point("str", -1);
    refresh_status(player, enemy)
});

button_reset.addEventListener("click", () => {
    reset_game(player, enemy);
})

button_start.addEventListener("click", () => {
    start_battle(player, enemy);
})

button_attack.addEventListener("click", () => {
    player_attack(player, enemy);
})

button_enemy_turn.addEventListener("click", () => {
    enemy_turn(player, enemy);
})


