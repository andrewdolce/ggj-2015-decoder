(function() {
  var Game = Backbone.Model.extend({
    defaults: {
      "players": [],
      "currentTurn": 0,
      "scenario": undefined,
      "numberOfTurns": 0
    }
  });

  window.Game = Game;
}());
