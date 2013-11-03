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
        return {
            sideFacingUp : sideFacingUp,
            hasBeenRolledThisTurn : hasBeenRolledThisTurn,
            isUnderCup : isUnderCup
        };
    },

    getRolledDie : function(hasBeenRolledThisTurn, isUnderCup) {
        hasBeenRolledThisTurn = typeof hasBeenRolledThisTurn !== 'undefined' ? hasBeenRolledThisTurn : false;
        isUnderCup = typeof isUnderCup !== 'undefined' ? isUnderCup : true;
        return this.getDie(this.getRandomSide(), hasBeenRolledThisTurn, isUnderCup);
    }
};

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

var publisher = {
    subscribers : {
        any: []
    },
    subscribe : function(fn, type) {
        var type = type || 'any';
        if (typeof this.subscribers[type] === "undefined") {
            this.subscribers[type] = [];
        }
        this.subscribers[type].push(fn);
    },
    publish : function(type, arg) {
        var max = this.subscribers[type].length;
        for (var i = 0; i < max; i++) {
            if (arg !== undefined) {
                this.subscribers[type][i].call(this, arg);
            } else {
                this.subscribers[type][i]();
            }
        }
    }
};

function makePublisher(o) {
    var i;
    for (i in publisher) {
        if (publisher.hasOwnProperty(i) && typeof publisher[i] === "function") {
            o[i] = publisher[i];
        }
    }
    o.subscribers = {any: []};
}


function GameController(numPlayers) {
    var game = new GameModel(numPlayers),
        hand = Hand.makeHand(),
        view = new View(),
        handToPass = hand,
        previousPass = Hand.getLowestHand();
    makePublisher(view);
    game.fsm.start();
    view.setUpElements(hand);
    view.displayHandDescription(hand);
    view.displayCurrentPlayer(game.currentPlayer);
    view.show('beginning');

    this.rollHandler = function(dieNum) {
        if (game.fsm.is('middleofturn')) {
            hand = Hand.reroll(hand, dieNum);
            updateView();
        }
    };
    this.passHandler = function(isBluff) {
        if (isBluff) {
            handToPass = Hand.makeHand(game.bluffHand);
        } else {
            handToPass = hand;
        }
        game.fsm.pass(handToPass, previousPass);
        if (game.fsm.is('beginningofturn')) {
            previousPass = handToPass.slice(0);
            //game.fsm.tilt();
            view.show('beginning');
            hand = Hand.resetRolls(hand);
            view.displayCurrentPlayer(game.currentPlayer);
            view.displayPassedHand(game.previousPlayer, previousPass);
        }
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
    this.tiltHandler = function() {
        game.fsm.tilt();
        view.show('middle');
    };
    this.liftHandler = function() {
        game.fsm.lift(hand, previousPass);
        view.show('middle');
    };
    view.subscribe(this.rollHandler, 'roll');
    view.subscribe(this.passHandler, 'pass');
    view.subscribe(this.putInCupHandler, 'put-in-cup');
    view.subscribe(this.takeOutOfCupHandler, 'take-out-of-cup');
    view.subscribe(this.addDieToBluffHandler, 'add-die-to-bluff');
    view.subscribe(this.clearHandler, 'clear');
    view.subscribe(this.tiltHandler, 'tilt');
    view.subscribe(this.liftHandler, 'lift');
    var updateView = function() {
        view.updateDice(hand);
        view.displayHandDescription(hand);
    };
}

function View() {
    var self = this,
        stage,
        handDescription,
        playerInfo,
        passInfo,
        diceLayer,
        elementsLayer;

    this.setUpElements = function(hand) {
        stage = new Kinetic.Stage({
            container: 'container',
            width: 650,
            height: 500
        });
        diceLayer = new Kinetic.Layer();
        elementsLayer = new Kinetic.Layer();
        self.createDice(hand);
        handDescription = new Kinetic.Text({
            x: stage.getWidth() / 2,
            y: 350,
            text: 'You have ' + HandTextView.getDescription(hand) + '.',
            fontSize: 20,
            fill: 'black'
        });
        var tiltButton = new Kinetic.Group({
                x: 200,
                y: 450,
            }),
            tiltButtonShape = new Kinetic.Rect({
                width: 50,
                height: 30,
                fill: 'green',
                cornerRadius: 3
            }),
            tiltButtonText = new Kinetic.Text({
                x: tiltButtonShape.getWidth() / 8,
                y: tiltButtonShape.getHeight() / 3,
                text: 'Tilt Cup',
                fill: 'black'
            });

        tiltButton.add(tiltButtonShape);
        tiltButton.add(tiltButtonText);
        tiltButton.on('mouseover', function() {
            document.body.style.cursor = 'pointer';
            tiltButtonShape.setFill('blue');
            elementsLayer.draw();
        });
        tiltButton.on('mouseout', function() {
            document.body.style.cursor = 'default';
            tiltButtonShape.setFill('green');
            elementsLayer.draw();
        });
        var liftButton = new Kinetic.Group({
                x: 270,
                y: 450,
            }),
            liftButtonShape = new Kinetic.Rect({
                width: 50,
                height: 30,
                fill: 'green',
                cornerRadius: 3
            }),
            liftButtonText = new Kinetic.Text({
                x: liftButtonShape.getWidth() / 8,
                y: liftButtonShape.getHeight() / 3,
                text: 'Lift Cup',
                fill: 'black'
            });

        liftButton.add(liftButtonShape);
        liftButton.add(liftButtonText);
        liftButton.on('mouseover', function() {
            document.body.style.cursor = 'pointer';
            liftButtonShape.setFill('blue');
            elementsLayer.draw();
        });
        liftButton.on('mouseout', function() {
            document.body.style.cursor = 'default';
            liftButtonShape.setFill('green');
            elementsLayer.draw();
        });
        var passButton = new Kinetic.Group({
                x: 200,
                y: 380,
            }),
            passButtonShape = new Kinetic.Rect({
                width: 80,
                height: 40,
                fill: 'green',
                cornerRadius: 3
            }),
            passButtonText = new Kinetic.Text({
                x: passButtonShape.getWidth() / 8,
                y: passButtonShape.getHeight() / 3,
                text: 'Pass as is',
                fontSize: 16,
                fill: 'black'
            });

        passButton.add(passButtonShape);
        passButton.add(passButtonText);
        passButton.on('mouseover', function() {
            document.body.style.cursor = 'pointer';
            passButtonShape.setFill('blue');
            elementsLayer.draw();
        });
        passButton.on('mouseout', function() {
            document.body.style.cursor = 'default';
            passButtonShape.setFill('green');
            elementsLayer.draw();
        });
        passButton.on('click', function() {
            self.publish('pass');
        });
        var createPassButton = new Kinetic.Group({
                x: 300,
                y: 380,
            }),
            createPassButtonShape = new Kinetic.Rect({
                width: 90,
                height: 40,
                fill: 'green',
                cornerRadius: 3
            }),
            createPassButtonText = new Kinetic.Text({
                x: createPassButtonShape.getWidth() / 8,
                y: createPassButtonShape.getHeight() / 3,
                text: 'Create pass',
                fontSize: 16,
                fill: 'black'
            });

        createPassButton.add(createPassButtonShape);
        createPassButton.add(createPassButtonText);
        createPassButton.on('mouseover', function() {
            document.body.style.cursor = 'pointer';
            createPassButtonShape.setFill('blue');
            elementsLayer.draw();
        });
        createPassButton.on('mouseout', function() {
            document.body.style.cursor = 'default';
            createPassButtonShape.setFill('green');
            elementsLayer.draw();
        });
        createPassButton.on('click', function() {
            self.publish('pass');
        });
        playerInfo = new Kinetic.Text({
            x: stage.getWidth() / 2,
            y: 5,
            fontSize: 22,
            fill: 'black'
        });
        passInfo = new Kinetic.Text({
            x: stage.getWidth() / 2,
            y: 430,
            fontSize: 18,
            fill: 'black'
        });
        var cup = new Kinetic.Group({
                x: stage.getWidth() / 2,
                y: 50,
                draggable: true
            });
            cupUpper = new Kinetic.Rect({
                width: 150,
                height: 40,
                fillLinearGradientStartPoint: [-45, 0],
                fillLinearGradientEndPoint: [190, 0],
                fillLinearGradientColorStops: [0, 'gray', 0.5, 'black', 1, 'gray'],
                cornerRadius: 10
            }),
            cupMiddle = new Kinetic.Rect({
                x: 10,
                y: cupUpper.getHeight(),
                width: 130,
                height: 130,
                fillLinearGradientStartPoint: [-40, 0],
                fillLinearGradientEndPoint: [165, 0],
                fillLinearGradientColorStops: [0, 'gray', 0.5, 'black', 1, 'gray'],
            }),
            cupBottom = new Kinetic.Rect({
                y: cupMiddle.getY() + cupMiddle.getHeight(),
                width: 150,
                height: 30,
                fillLinearGradientStartPoint: [-45, 0],
                fillLinearGradientEndPoint: [190, 0],
                fillLinearGradientColorStops: [0, 'gray', 0.5, 'black', 1, 'gray'],
                cornerRadius: 3
            });
        cup.add(cupUpper);
        cup.add(cupMiddle);
        cup.add(cupBottom);
        cup.setOffset({
            x: cupUpper.getWidth() / 2
        });
        cupUpper.on('mousedown', function(event) {
            //cup.setRotation(Math.asin(cup.getX() - event.clientX));
        });
        elementsLayer.add(cup);
        elementsLayer.add(tiltButton);
        elementsLayer.add(liftButton);
        elementsLayer.add(passButton);
        elementsLayer.add(createPassButton);
        elementsLayer.add(handDescription);
        elementsLayer.add(playerInfo);
        elementsLayer.add(passInfo);
        stage.add(elementsLayer);

        // Element functions
        tiltButton.on('click', function() {
            self.publish('tilt');
        });
        liftButton.on('click', function() {
            self.publish('lift');
        });
    };
    this.createDie = function(sideFacingUp) {
        var die = new Kinetic.Group({
            draggable: true
        });
        var dieShape = new Kinetic.Rect({
            width: 40,
            height: 40,
            fill: '#ffefdb',
            stroke: '#a6a7a9',
            strokeWidth: 2,
            cornerRadius: 5,
        });
        var dieText = new Kinetic.Text({
            x: dieShape.getWidth() / 2,
            y: dieShape.getHeight() / 2,
            fontSize: 22,
            fontFamily: 'Calibri',
            text: HandTextView.sideNames[sideFacingUp],
            fill: 'black'
        });
        dieText.setOffset({
            x: dieText.getWidth() / 2,
            y: dieText.getHeight() / 2
        });
        die.add(dieShape);
        die.add(dieText);
        return die;
    };
    this.createDice = function(hand) {
        for (var dieNum = 0; dieNum < hand.length; dieNum++) {
            var die = self.createDie(hand[dieNum].sideFacingUp);
            die.timeToShow = hand[dieNum].isUnderCup ? 'middleofturn' : null;
            die.setX(200 + dieNum * 50);
            die.setY(290);
            die.id = dieNum;
            die.on('click', function() {
                self.publish('roll', this.id);
            });
            die.on('mouseover', function() {
                document.body.style.cursor = 'pointer';
            });
            die.on('mouseout', function() {
                document.body.style.cursor = 'default';
            });
            diceLayer.add(die);
        }
        stage.add(diceLayer);
    };
    this.show = function(state) {
        var states = ['beginning', 'middle'];
        var statesToHide = states.filter(function(s) { return s !== state });
        $('.' + state).show();
        statesToHide.map(function(s) { $('.' + s).hide() });
    };
    this.updateDice = function(hand) {
        for (var dieNum = 0; dieNum < hand.length; dieNum++) {
            var dieText = diceLayer.children[dieNum].children[1];
            var newText = HandTextView.sideNames[hand[dieNum].sideFacingUp];
            dieText.setText(newText);
            diceLayer.draw();
        }
    };
    this.displayHandDescription = function(hand) {
        handDescription.setText('You have ' + HandTextView.getDescription(hand));
        handDescription.setOffset({
            x: handDescription.getWidth() / 2
        });
        elementsLayer.draw();
    };
    this.displayCurrentPlayer = function(currentPlayer) {
        playerInfo.setText("Player " + currentPlayer + "'s turn");
        playerInfo.setOffset({
            x: playerInfo.getWidth() / 2
        });
        elementsLayer.draw();
    };
    this.displayPassedHand = function(previousPlayer, passedHand) {
        passInfo.setText('Player ' + previousPlayer + ' passed you ' + HandTextView.getDescription(passedHand) + '.');
        passInfo.setOffset({
            x: passInfo.getWidth() / 2
        });
        elementsLayer.draw();
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
        self.publish('pass', true);
    });
    $('#bluff-dice').children().click(function() {
        self.publish('add-die-to-bluff', $(this).index());
    });
    $('#clear').click(function() {
        self.publish('clear');
    });
}


function GameModel(numPlayers) {
    this.numPlayers = numPlayers;
    this.currentPlayer = 0;
    this.previousPlayer = null;
    this.passDirection = 1;
    this.bluffHand = []
    var reportWinner = function(player) {
        alert('Player ' + player + ' wins!');
    };
    var that = this;
    this.fsm = StateMachine.create({
        initial: 'endofround',
        events: [
            { name: 'start', from: 'endofround', to: 'beginningofturn' },
            { name: 'tilt', from: 'beginningofturn', to: 'middleofturn' },
            { name: 'lift', from: 'beginningofturn', to: 'endofround' },
            { name: 'pass', from: 'middleofturn', to: 'beginningofturn' }
        ],
        callbacks: {
            ontilt: function(event, from, to) {},
            onlift: function(event, from, to, hand, passedHand) {
                var itsThere = Hand.getScore(hand) >= Hand.getScore(passedHand);
                if (itsThere) {
                    reportWinner(that.previousPlayer);
                } else {
                    reportWinner(that.currentPlayer);
                }
                that.fsm.start();
            },
            onbeforepass: function(event, from, to, currentPass, previousPass) {
                var passIsValid = Hand.getScore(currentPass) > Hand.getScore(previousPass);
                if (passIsValid) {
                    that.incrementTurn();
                    that.bluffHand = []
                    return true;
                } else {
                    alert('You must pass a hand better than ' + HandTextView.getDescription(previousPass) + '.');
                    return false;
                }
            },
            onbeginningofturn: function(event, from, to) {
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
