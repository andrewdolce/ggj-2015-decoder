(function() {
  var Player = Backbone.Model.extend({
    type: "Player",

    defaults: {
      "identifier": -1,
      "name": "Unnamed Player",
      "cardsInHand": []
    },

    playCardFromHand: function( card ) {
      // TODO
    },

    addCardsToHand: function(cards) {
      _.each( cards, this.addCardToHand.bind(this));
    },

    addCardToHand: function(card) {
      card.set('owner', this);

      var newHand = this.get('cardsInHand').slice();
      newHand.push(card);
      this.set('cardsInHand', newHand);
    }
  });

  window.Player = Player;
}());
