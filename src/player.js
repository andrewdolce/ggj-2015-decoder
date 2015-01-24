(function() {
  var Player = Backbone.Model.extend({
    type: "Player",

    defaults: {
      "name": "Unnamed Player",
      "unsharedCards": [],
      "sharedCards": []
    },

    shareCard: function( card ) {
      // TODO
    },
  });

  window.Player = Player;
}());
