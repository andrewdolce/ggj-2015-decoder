(function() {
  var Card = Backbone.Model.extend({
    type: "Card",

    defaults: {
      "text": "Sparta"
      "owner": undefined
    },

    isInHand: function() {
      var owner = this.get( "owner" );
      return owner && owner.type === "Player";
    },

    isOnBoard: function() {
      var owner = this.get( "owner" );
      return owner && owner.type == "Game";
    }
  });

  window.Card = Card;
}());
