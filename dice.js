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
            var diceToAdd = Die.getSides().sort().reverse().filter(function(side) { return dieList.indexOf(side) == -1; });
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
    putUnderCup : function(hand, dieNum) {
        hand[dieNum].isUnderCup = true;
        return hand;
    },
    takeOutOfCup : function(hand, dieNum) {
        hand[dieNum].isUnderCup = false;
        return hand;
    }
}

var HandTextView = {
    sideNames : ['9', '10', 'J', 'Q', 'K', 'A'],

    getDescription : function(hand) {
        if (Hand.kind(hand, 5) !== false) {
            return 'five ' + this.sideNames[Hand.kind(hand, 5)] + 's';
        } else if (Hand.kind(hand, 4) !== false) {
            if (Hand.kind(hand, 1) == Die.sideNames.ACE) {
                return 'four ' + this.sideNames[Hand.kind(hand, 4)] + 's and an ' + this.sideNames[Hand.kind(hand, 1)];
            } else {
                return 'four ' + this.sideNames[Hand.kind(hand, 4)] + 's and a ' + this.sideNames[Hand.kind(hand, 1)];
            }
        } else if (Hand.kind(hand, 3) !== false && Hand.kind(hand, 2) !== false) {
            return this.sideNames[Hand.kind(hand, 3)] + 's full of ' + this.sideNames[Hand.kind(hand, 2)] + 's';
        } else if (Hand.kind(hand, 3) !== false) {
            if (Math.max.apply(Math, Hand.kind(hand, 1)) == Die.sideNames.ACE) {
                return 'three ' + this.sideNames[Hand.kind(hand, 3)] + 's and an ' + this.sideNames[Math.max.apply(Math, Hand.kind(hand, 1))];
            } else {
                return 'three ' + this.sideNames[Hand.kind(hand, 3)] + 's and a ' + this.sideNames[Math.max.apply(Math, Hand.kind(hand, 1))];
            }
        } else if (Object.prototype.toString.call(Hand.kind(hand, 2)) === '[object Array]') {
            return this.sideNames[Math.max.apply(Math, Hand.kind(hand, 2))] + 's and ' + this.sideNames[Math.min.apply(Math, Hand.kind(hand, 2))] + 's';
        } else if (Hand.kind(hand, 2) !== false) {
            return 'a pair of ' + this.sideNames[Hand.kind(hand, 2)] + 's';
        } else {
            return 'nothing';
        }
    }

}


function GameController(numPlayers) {
    var game = new GameModel(numPlayers),
        hand = Hand.makeHand(),
        view = new View(),
        handToPass = hand,
        previousPass = Hand.getLowestHand();
    game.fsm.tilt();
    view.createDice(hand);
    view.displayHandDescription(hand);
    view.displayCurrentPlayer(game.currentPlayer);

    this.rollHandler = function(dieNum) {
        hand = Hand.reroll(hand, dieNum); // :(
        updateView();
    };
    this.passHandler = function(isBluff) {
        if (isBluff) {
            handToPass = Hand.makeHand(game.bluffHand);
        } else {
            handToPass = hand;
        }
        game.fsm.pass(handToPass, previousPass);
        previousPass = handToPass.slice(0);
        game.fsm.tilt();
        hand = Hand.resetRolls(hand);
        view.displayCurrentPlayer(game.currentPlayer);
        view.displayPassedHand(game.previousPlayer, previousPass);
    };
    this.putInCupHandler = function(dieNum) {
        hand = Hand.putUnderCup(hand, dieNum);
    };
    this.takeOutOfCupHandler = function(dieNum) {
        hand = Hand.takeOutOfCup(hand, dieNum);
    };
    this.addDieToBluffHandler = function(die) {
        game.addDieToBluffHand(die);
        var bluffHand = Hand.makeHand(game.bluffHand);
        view.displayBluff(bluffHand);
    };
    this.clearHandler = function() {
        game.clearBluffHand();
        view.displayBluff();
    };
    view.subscribe(this.rollHandler, 'roll');
    view.subscribe(this.passHandler, 'pass');
    view.subscribe(this.putInCupHandler, 'put-in-cup');
    view.subscribe(this.takeOutOfCupHandler, 'take-out-of-cup');
    view.subscribe(this.addDieToBluffHandler, 'add-die-to-bluff');
    view.subscribe(this.clearHandler, 'clear');
    var updateView = function() {
        view.updateDice(hand);
        view.displayHandDescription(hand);
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
    var publish = function(type, arg) {
        var max = subscribers[type].length;
        for (var i = 0; i < max; i++) {
            if (arg !== undefined) {
                subscribers[type][i].call(this, arg);
            } else {
                subscribers[type][i]();
            }
        }
    };

    this.createDice = function(hand) {
        for (var dieNum = 0; dieNum < hand.length; dieNum++) {
//            if (hand[dieNum].isUnderCup) {
//                $('#cup').append('<div class="die" id="die' + dieNum + '">' + HandTextView.sideNames[hand[dieNum].sideFacingUp]);
//            } else {
                $('#dice-container').append('<div class="die" id="die' + dieNum + '">' + HandTextView.sideNames[hand[dieNum].sideFacingUp]);
//            }
        }
        $('#dice-container').children().click(function() {
            var dieNum = $(this).index();
            publish('roll', dieNum);
        });
        $('.die').draggable({ revert : function(event){ return !event; }});
        $('#cup').draggable().droppable({
            drop: function(event, ui) {
                var dieNum = $(this).index();
                publish('put-in-cup', dieNum);
            }
        });
        $('#dice-container').droppable({
            drop: function(event, ui) {
                var dieNum = $(this).index();
                publish('take-out-of-cup', dieNum);
            }
        });
    };
    $('#pass').click(function() {
        publish('pass');
    });
    this.updateDice = function(hand) {
        for (var dieNum = 0; dieNum < hand.length; dieNum++) {
            $('#die' + dieNum).text(HandTextView.sideNames[hand[dieNum].sideFacingUp]);
        }
    };
    this.displayHandDescription = function(hand) {
        $('#handname-display').text('You have ' + HandTextView.getDescription(hand));
    };
    this.displayCurrentPlayer = function(currentPlayer) {
        $('#player-info').text("Player " + currentPlayer + "'s turn");
    };
    this.displayPassedHand = function(previousPlayer, passedHand) {
        $('#pass-info').text('Player ' + previousPlayer + ' passed you ' + HandTextView.getDescription(passedHand) + '.');
    };
    this.displayBluff = function(hand) {
        if (hand !== undefined && hand.length >= 2 && HandTextView.getDescription(hand) != 'nothing') {
            $('#pass-display').text('Passing ' + HandTextView.getDescription(hand));
        } else {
            $('#pass-display').text('');
        }
    };
    $('#pass-bluff').click(function() {
        $('#pass-creator').toggle();
    });
    $('#submit-pass').click(function() {
        publish('pass', true);
    });
    $('#bluff-dice').children().click(function() {
        publish('add-die-to-bluff', $(this).index());
    });
    $('#clear').click(function() {
        publish('clear');
    });
}


function GameModel(numPlayers) {
    this.numPlayers = numPlayers;
    this.currentPlayer = 0;
    this.previousPlayer = null;
    this.passDirection = 1;
    this.bluffHand = []
    var that = this;
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
                var itsThere = Hand.getScore(hand) >= Hand.getScore(passedHand);
            },
            onpass: function(event, from, to, currentPass, previousPass) {
                var passIsValid = Hand.getScore(currentPass) > Hand.getScore(previousPass);
                if (passIsValid) {
                    that.incrementTurn();
                    that.bluffHand = []
                    return true;
                } else {
                    alert('You must pass a hand better than ' + HandTextView.getDescription(previousPass) + '.');
                    return false;
                }
            }
        }
    });
    this.addDieToBluffHand = function(die) {
        if (that.bluffHand.length < 5) {
            that.bluffHand.push(die);
        }
    };
    this.clearBluffHand = function() {
        that.bluffHand = [];
    };
}
GameModel.prototype.incrementTurn = function() {
    this.previousPlayer = this.currentPlayer;
    this.currentPlayer = (this.currentPlayer + 1 * this.passDirection) % this.numPlayers;
};
GameModel.prototype.reverseDirection = function() {
    this.passDirection = this.passDirection * -1;
};

var controller = new GameController(2);
