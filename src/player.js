(function() {
  var Player = Backbone.Model.extend({
    type: 'Player',

    defaults: {
      identifier: -1,
      name: 'Unnamed Player',
      cardsInHand: []
    },

    playCardFromHand: function(card, game) {
      card.set('owner', game);
      var cardsInHand = _.clone(this.get('cardsInHand'));
      var index = cardsInHand.indexOf(card);
      if (index != -1) {
        cardsInHand.splice(index, 1);
      }
      this.set('cardsInHand', cardsInHand);
    },

    addCardsToHand: function(cards) {
      _.each(cards, this.addCardToHand.bind(this));
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
