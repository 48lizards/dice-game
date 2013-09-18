function Die() {

    this.sideNames = {
        NINE  : 0,
        TEN   : 1,
        JACK  : 2,
        QUEEN : 3,
        KING  : 4,
        ACE   : 5
    };

    this.sides = [this.sideNames.NINE,
             this.sideNames.TEN,
             this.sideNames.JACK,
             this.sideNames.QUEEN,
             this.sideNames.KING,
             this.sideNames.ACE];

    this.getRandomSide = function() {
        return Math.floor(Math.random() * 6);
    };

    this.getDie = function(sideFacingUp, hasBeenRolledThisTurn, isUnderCup) {
        hasBeenRolledThisTurn = typeof hasBeenRolledThisTurn !== 'undefined' ? hasBeenRolledThisTurn : true;
        isUnderCup = typeof isUnderCup !== 'undefined' ? isUnderCup : true;
        return {sideFacingUp : sideFacingUp,
                hasBeenRolledThisTurn : hasBeenRolledThisTurn,
                isUnderCup : isUnderCup};
    };

    this.getRolledDie = function(hasBeenRolledThisTurn, isUnderCup) {
        hasBeenRolledThisTurn = typeof hasBeenRolledThisTurn !== 'undefined' ? hasBeenRolledThisTurn : true;
        isUnderCup = typeof isUnderCup !== 'undefined' ? isUnderCup : true;
        return this.getDie(this.getRandomSide(), hasBeenRolledThisTurn, isUnderCup);
    };
}

function Hand() {
    this.handTypes = {
        NOTHING         : 0,
        PAIR            : 1,
        TWO_PAIR        : 2,
        THREE_OF_A_KIND : 3,
        FULL_HOUSE      : 4,
        FOUR_OF_A_KIND  : 5,
        FIVE_OF_A_KIND  : 6
    };

    this.die = new Die();

    this.getHand = function(dieList) {
        var hand = [];
        if (dieList) {
            for (var i = 0; i < 5 && i < dieList.length; i++) {
                hand.push(this.die.getDie(dieList[i]));
            }
            var diceToAdd = this.die.sides.sort().reverse().filter(function(side) { return hand.indexOf(side) == -1; });
            while (hand.length < 5) {
                hand.push(this.die.getDie(diceToAdd.pop()));
            }
        } else {
            for (var i = 0; i < 5; i++) {
                hand.push(this.die.getRolledDie());
            }
        }
        return hand;
    };

    this.getLowestHand = function() {
        return this.getHand([this.die.sideNames.TEN, this.die.sideNames.JACK, this.die.sideNames.QUEEN, this.die.sideNames.KING, this.die.sideNames.ACE]);
    };

    this.getScore = function(hand) {
        if (this.kind(hand, 5)) {
            return [this.handTypes.FIVE_OF_A_KIND, this.kind(hand, 5)]; 
        } else if (this.kind(hand, 4)) {
            return [this.handTypes.FOUR_OF_A_KIND, this.kind(hand, 4), this.kind(hand, 1)];
        } else if (this.kind(hand, 3) && this.kind(hand, 2)) {
            return [this.handTypes.FULL_HOUSE, this.kind(hand, 3), this.kind(hand, 2)];
        } else if (this.kind(hand, 3)) {
            return [this.handTypes.THREE_OF_A_KIND, this.kind(hand, 3), Math.max.apply(Math, this.kind(hand, 1)), Math.min.apply(Math, this.kind(hand, 1))];
        } else if (Object.prototype.toString.call(this.kind(hand, 2)) === '[object Array]') {
            return [this.handTypes.TWO_PAIR, Math.max.apply(Math, this.kind(hand, 2)), Math.max.apply(Math, this.kind(hand, 2))];
        } else if (this.kind(hand, 2)) {
            return [this.handTypes.PAIR, this.kind(hand, 2)];
        } else {
            return [this.handTypes.NOTHING];
        }
    },

    this.kind = function(hand, num) {
        var matches = [];
        for (var i = 0; i < this.die.sides.length; i++) {
            handWithOneSideOnly = hand.filter(function(dieInHand) { return dieInHand.sideFacingUp == this.die.sides[i] });
            if (handWithOneSideOnly.length == num) {
                matches.push(this.die.sides[i]);
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

    this.reroll = function(hand, dieNum) {
        var newHand = hand.slice(0);
        newHand[dieNum] = this.die.getRolledDie(true, hand[dieNum].isUnderCup);
        return newHand;
    },

    this.resetRolls = function(hand) {
        var newHand = [];
        for (var i = 0; i < hand.length; i++) {
            newHand.append(this.die.getDie(hand[i].sideFacingUp, false, hand[i].isUnderCup));
        }
        return newHand;
    }

}


