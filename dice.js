var Die = {

    sideNames : {
        NINE  : 0,
        TEN   : 1,
        JACK  : 2,
        QUEEN : 3,
        KING  : 4,
        ACE   : 5
    },

    sides : [this.sideNames.NINE,
             this.sideNames.TEN,
             this.sideNames.JACK,
             this.sideNames.QUEEN,
             this.sideNames.KING,
             this.sideNames.ACE],

    getRandomSide : function() {
        return Math.floor(Math.random * 6);
    },

    getDie : function(sideFacingUp, hasBeenRolledThisTurn, isUnderCup) {
        hasBeenRolledThisTurn = typeof hasBeenRolledThisTurn !== 'undefined' ? hasBeenRolledThisTurn : true;
        isUnderCup = typeof isUnderCup !== 'undefined' ? isUnderCup : true;
        this.sideFacingUp = sideFacingUp;
        this.hasBeenRolledThisTurn = hasBeenRolledThisTurn;
        this.isUnderCup = isUnderCup;
    },

    getRolledDie : function(hasBeenRolledThisTurn, isUnderCup) {
        hasBeenRolledThisTurn = typeof hasBeenRolledThisTurn !== 'undefined' ? hasBeenRolledThisTurn : true;
        isUnderCup = typeof isUnderCup !== 'undefined' ? isUnderCup : true;
        return die(this.getRandomSide, hasBeenRolledThisTurn, isUnderCup);
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

    getHand : function(dieList) {
        var hand = [];
        if (dieList) {
            for (var i = 0; i < 5 && i < dieList.length; i++) {
                hand.push(Die.getDie(dieList[i]);
            }
            var diceToAdd = Die.sides.sort().reverse().filter(function(side) { return hand.indexOf(side) == -1; });
            while (hand.length < 5) {
                hand.push(Die.getDie(diceToAdd.pop()));
            }
        } else {
            for (var i = 0; i < 5; i++) {
                hand.push(Die.getRolledDie());
            }
        }
    },

    getLowestHand : function() {
        return getHand([Die.sideNames.TEN, Die.sideNames.JACK, Die.sideNames.QUEEN, Die.sideNames.KING, Die.sideNames.ACE]);
    },

    getScore : function(hand) {
        if (kind(hand, 5)) {
            return [this.handTypes.FIVE_OF_A_KIND, kind(hand, 5)]; 
        } else if (kind(hand, 4)) {
            return [this.handTypes.FOUR_OF_A_KIND, kind(hand, 4), kind(hand, 1)];
        } else if (kind(hand, 3) && kind(hand, 2)) {
            return [this.handTypes.FULL_HOUSE, kind(hand, 3), kind(hand, 2)];
        } else if (kind(hand, 3)) {
            return [this.handTypes.THREE_OF_A_KIND, kind(hand, 3), Math.max.apply(Math, kind(hand, 1)), Math.min.apply(Math, kind(hand, 1))];
        } else if (Object.prototype.toString.call(kind(hand, 2)) === '[object Array]') {
            return [this.handTypes.TWO_PAIR, Math.max.apply(Math, kind(hand, 2)), Math.max.apply(Math, kind(hand, 2))];
        } else if (kind(hand, 2)) {
            return [this.handTypes.PAIR, kind(hand, 2)];
        } else {
            return [this.handTypes.NOTHING];
        }
    },

    kind : function(hand, num) {
        var matches = [];
        for (var i = 0; i < Die.sides.length; i++) {
            handWithOneSideOnly = hand.filter(function(dieInHand) { return dieInHand.sideFacingUp == Die.sides[i] });
            if (handWithOneSideOnly.length == num) {
                matches.push(Die.sides[i]);
            }
        }
        if (matches.length == 1) {
            return matches[0];
        } else if (!matches) {
            return false;
        } else {
            return matches;
        }
    },

    reroll : function(hand, dieNum) {
        var newHand = hand.slice(0);
        newHand[dieNum] = Die.getRolledDie(true, hand[dieNum].isUnderCup);
        return newHand;
    },

    resetRolls : function(hand) {
        var newHand = [];
        for (var i = 0; i < hand.length; i++) {
            newHand.append(Die.getDie(hand[i].sideFacingUp, false, hand[i].isUnderCup);
        }
        return newHand;
    }

};
