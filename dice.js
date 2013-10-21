var Die = {

    sideNames : {
        NINE  : 0,
        TEN   : 1,
        JACK  : 2,
        QUEEN : 3,
        KING  : 4,
        ACE   : 5
    },

    getSides : function() {
        return [this.sideNames.NINE,
                this.sideNames.TEN,
                this.sideNames.JACK,
                this.sideNames.QUEEN,
                this.sideNames.KING,
                this.sideNames.ACE];
    },

    getRandomSide : function() {
        return Math.floor(Math.random() * 6);
    },

    getDie : function(sideFacingUp, hasBeenRolledThisTurn, isUnderCup) {
        hasBeenRolledThisTurn = typeof hasBeenRolledThisTurn !== 'undefined' ? hasBeenRolledThisTurn : true;
        isUnderCup = typeof isUnderCup !== 'undefined' ? isUnderCup : true;
        return {sideFacingUp : sideFacingUp,
                hasBeenRolledThisTurn : hasBeenRolledThisTurn,
                isUnderCup : isUnderCup};
    },

    getRolledDie : function(hasBeenRolledThisTurn, isUnderCup) {
        hasBeenRolledThisTurn = typeof hasBeenRolledThisTurn !== 'undefined' ? hasBeenRolledThisTurn : true;
        isUnderCup = typeof isUnderCup !== 'undefined' ? isUnderCup : true;
        return this.getDie(this.getRandomSide(), hasBeenRolledThisTurn, isUnderCup);
    }
}

var Hand = {
    handTypes : {
        NOTHING         : 0,
        PAIR            : 1,
        TWO_PAIR        : 2,
        THREE_OF_A_KIND : 3,
        FULL_HOUSE      : 4,
        FOUR_OF_A_KIND  : 5,
        FIVE_OF_A_KIND  : 6
    },

    makeHand : function(dieList) {
        var hand = [];
        if (dieList) {
            for (var i = 0; i < 5 && i < dieList.length; i++) {
                hand.push(Die.getDie(dieList[i]));
            }
            var diceToAdd = Die.getSides().sort().reverse().filter(function(side) { return hand.indexOf(side) == -1; });
            while (hand.length < 5) {
                hand.push(Die.getDie(diceToAdd.pop()));
            }
        } else {
            for (var i = 0; i < 5; i++) {
                hand.push(Die.getRolledDie());
            }
        }
        return hand;
    },

    getLowestHand : function() {
        return this.makeHand([Die.sideNames.TEN, Die.sideNames.JACK, Die.sideNames.QUEEN, Die.sideNames.KING, Die.sideNames.ACE]);
    },

    getDiceUnderCup : function(hand) {
        hand.filter(function(die) {
            return die.isUnderCup;
        });
    },

    getScore : function(hand) {
        if (this.kind(hand, 5) !== false) {
            return [this.handTypes.FIVE_OF_A_KIND, this.kind(hand, 5)]; 
        } else if (this.kind(hand, 4) !== false) {
            return [this.handTypes.FOUR_OF_A_KIND, this.kind(hand, 4), this.kind(hand, 1)];
        } else if (this.kind(hand, 3) !== false && this.kind(hand, 2) !== false) {
            return [this.handTypes.FULL_HOUSE, this.kind(hand, 3), this.kind(hand, 2)];
        } else if (this.kind(hand, 3) !== false) {
            return [this.handTypes.THREE_OF_A_KIND, this.kind(hand, 3), Math.max.apply(Math, this.kind(hand, 1)), Math.min.apply(Math, this.kind(hand, 1))];
        } else if (Object.prototype.toString.call(this.kind(hand, 2)) === '[object Array]') {
            return [this.handTypes.TWO_PAIR, Math.max.apply(Math, this.kind(hand, 2)), Math.min.apply(Math, this.kind(hand, 2))];
        } else if (this.kind(hand, 2) !== false) {
            return [this.handTypes.PAIR, this.kind(hand, 2)];
        } else {
            return [this.handTypes.NOTHING];
        }
    },

    kind : function(hand, num) {
        var matches = [];
        for (var i = 0; i < Die.getSides().length; i++) {
            var handWithOneSideOnly = hand.filter(function(dieInHand) { return dieInHand.sideFacingUp == Die.getSides()[i] });
            if (handWithOneSideOnly.length == num) {
                matches.push(Die.getSides()[i]);
            }
        }
        if (matches.length == 1) {
            return matches[0];
        } else if (matches.length == 0) {
            return false;
        } else {
            return matches;
        }
    },

    reroll : function(hand, dieNum) {
        if (!hand[dieNum].hasBeenRolledThisTurn) {
            hand[dieNum] = Die.getRolledDie(true, hand[dieNum].isUnderCup);
        }
        return hand;
    },

    resetRolls : function(hand) {
        for (var i = 0; i < hand.length; i++) {
            hand[i].hasBeenRolledThisTurn = false;
        }
        return hand;
    },
}

var HandTextView = {
    sideNames : ['9', '10', 'J', 'Q', 'K', 'A'],

    getDescription : function(hand) {
        if (Hand.kind(hand, 5) !== false) {
            return 'Five ' + this.sideNames[Hand.kind(hand, 5)] + 's';
        } else if (Hand.kind(hand, 4) !== false) {
            if (Hand.kind(hand, 1) == Die.sideNames.ACE) {
                return 'Four ' + this.sideNames[Hand.kind(hand, 4)] + 's and an ' + this.sideNames[Hand.kind(hand, 1)];
            } else {
                return 'Four ' + this.sideNames[Hand.kind(hand, 4)] + 's and a ' + this.sideNames[Hand.kind(hand, 1)];
            }
        } else if (Hand.kind(hand, 3) !== false && Hand.kind(hand, 2) !== false) {
            return this.sideNames[Hand.kind(hand, 3)] + 's full of ' + this.sideNames[Hand.kind(hand, 2)] + 's';
        } else if (Hand.kind(hand, 3) !== false) {
            if (Math.max.apply(Math, Hand.kind(hand, 1)) == Die.sideNames.ACE) {
                return 'Three ' + this.sideNames[Hand.kind(hand, 3)] + 's and an ' + this.sideNames[Math.max.apply(Math, Hand.kind(hand, 1))];
            } else {
                return 'Three ' + this.sideNames[Hand.kind(hand, 3)] + 's and a ' + this.sideNames[Math.max.apply(Math, Hand.kind(hand, 1))];
            }
        } else if (Object.prototype.toString.call(Hand.kind(hand, 2)) === '[object Array]') {
            return this.sideNames[Math.max.apply(Math, Hand.kind(hand, 2))] + 's and ' + this.sideNames[Math.min.apply(Math, Hand.kind(hand, 2))] + 's';
        } else if (Hand.kind(hand, 2) !== false) {
            return 'Pair of ' + this.sideNames[Hand.kind(hand, 2)] + 's';
        } else {
            return 'Nothing';
        }
    }

}


function GameController(numPlayers) {
    var game = new GameModel(numPlayers),
        hand = Hand.makeHand(),
        view = new View();
    view.createDice(hand);
    view.displayHandDescription(hand);

    this.rollHandler = function(dieNum) {
        hand = Hand.reroll(hand, dieNum); // :(
        updateView();
    };
    this.passHandler = function() {
        hand = Hand.resetRolls(hand);
    };
    view.subscribe(this.rollHandler, 'roll');
    view.subscribe(this.passHandler, 'pass');
    var updateView = function() {
        view.updateDice(hand);
        view.displayHandDescription(hand);
    };
    this.commandHandler = function(command, params) {
        var val = command.apply(command, params);
    };
}

function View() {
    var subscribers = {
        any: []
    };
    this.subscribe = function(fn, type) {
        var type = type || 'any';
        if (typeof subscribers[type] === "undefined") {
            subscribers[type] = [];
        }
        subscribers[type].push(fn);
    };
    $('#pass').click(function() {
        var max = subscribers['pass'].length;
        for (var i = 0; i < max; i++) {
            subscribers['pass'][i]();
        }
    });
    this.createDice = function(hand) {
        for (var dieNum = 0; dieNum < hand.length; dieNum++) {
            $('#dice-container').append('<div class="die" id="die' + dieNum + '">' + HandTextView.sideNames[hand[dieNum].sideFacingUp]);
        }
        $('#dice-container').children().click(function() {
            var max = subscribers['roll'].length;
            for (var i = 0; i < max; i++) {
                var dieNum = $(this).index()
                subscribers['roll'][i].call(this, dieNum);
            }
        });
        $('.die').draggable();
        $('#cup').draggable();
    };
    this.updateDice = function(hand) {
        for (var dieNum = 0; dieNum < hand.length; dieNum++) {
            $('#die' + dieNum).text(HandTextView.sideNames[hand[dieNum].sideFacingUp]);
        }
    };
    this.displayHandDescription = function(hand) {
        $('#handname-display').text(HandTextView.getDescription(hand));
    };
}


function GameModel(numPlayers) {
    this.numPlayers = numPlayers;
    this.currentPlayer = 0;
    this.previousPlayer = null;
    this.passDirection = 1;
    this.fsm = StateMachine.create({
        initial: 'beginning-of-turn',
        events: [
            { name: 'tilt', from: 'beginning-of-turn', to: 'middle-of-turn' },
            { name: 'lift', from: 'beginning-of-turn', to: 'end-of-round' },
            { name: 'pass', from: 'middle-of-turn', to: 'beginning-of-turn' }
        ],
        callbacks: {
            ontilt: function(event, from, to) {},
            onlift: function(event, from, to, hand, passedHand) {
                var itsThere = hand.getScore() >= passedHand.getScore();
            },
            onpass: function(event, from, to) {
                this.incrementTurn();
            }
        }
    });
}
GameModel.prototype.incrementTurn = function() {
    this.currentPlayer = (currentPlayer + 1 * passDirection) % numPlayers;
};
GameModel.prototype.reverseDirection = function() {
    this.passDirection = this.passDirection * -1;
};

var controller = new GameController(2);
