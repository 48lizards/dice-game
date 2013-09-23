var hand = Hand.makeHand();
for (var i = 0; i < 5; i++) {
    $('#dice-container').append('<div class="die" id="die' + i + '">' + HandTextView.sideNames[hand[i].sideFacingUp]);
}
$('#handname-display').text(HandTextView.getDescription(hand));
$('.die').draggable();
$('#dice-container').children().click(function() {            
    hand = Hand.reroll(hand, $(this).index());
    $(this).text(HandTextView.sideNames[hand[$(this).index()].sideFacingUp]);
    $('#handname-display').text(HandTextView.getDescription(hand));
});

$('#pass').click(function(){
    hand = Hand.resetRolls(hand);
});


