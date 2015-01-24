(function() {
  var Player = Backbone.Model.extend({
    defaults: {
      "name": "Unnamed Player",
      "unsharedCards": [],
      "sharedCards": []
    }
  });

  window.Player = Player;
}());
