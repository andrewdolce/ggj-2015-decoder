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
        game.beginMidTurn();
      } else if (state == Game.State.MidTurn) {
        var dummyCard = new Card({ text: "Dummy" });
        var dummyCardsInOrder = [
          new Card({ text: "Dummy" }),
          new Card({ text: "Dummy 2" }),
          new Card({ text: "Dummy 3" })
        ];
        game.beginPostTurn( dummyCard, dummyCardsInOrder );
      } else if (state == Game.State.PostTurn) {
        game.beginNextTurn();
      } else if (state == Game.State.OpinionPhase) {
        game.beginVotingPhase();
      } else if (state == Game.State.FinalChoice) {
        game.beginFinalChoice();
        game.lockInDecision( 0 );
      }
    }, 1);
  });

  game.beginPlayerSetup();
}());
