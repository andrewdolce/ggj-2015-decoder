(function() {
  var Player = Backbone.Model.extend({
    defaults: {
      "name": "Unnamed Player",
      "unsharedCards": [],
      "sharedCards": []
    },

    shareCard: function( card ) {
      // TODO
    }
  });

  window.Player = Player;
}());
