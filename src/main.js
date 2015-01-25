(function() {
  var game = new Game();
  var ui = new UI(game);

  window._debug = {
    game: game,
    ui: ui
  };

  // This would get replaced by UI / controllers
  game.on( "change:state", function(game, state) {
    setTimeout(function() {
      if (state == Game.State.PlayerSetup) {
        game.finishPlayerSetup( 3 );
      } else if (state == Game.State.ShowScenarioChoices ) {
        game.beginNextTurn();
      } else if (state == Game.State.PreTurn) {
      } else if (state == Game.State.MidTurn) {
      } else if (state == Game.State.OpinionPhase) {
        game.beginVotingPhase();
      } else if (state == Game.State.FinalChoice) {
        game.beginFinalChoice();
      }
    }, 50);
  });

  game.beginPlayerSetup();
}());
