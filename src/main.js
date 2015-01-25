(function() {
  var getParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  var scenarioId = getParameterByName('id');
  var shouldShowPostTurn = !getParameterByName('postturn_disabled');
  var game = new Game({
    scenarioId: scenarioId ? scenarioId : -1,
    shouldShowPostTurn: shouldShowPostTurn
  });
  var ui = new UI(game);

  window._debug = {
    game: game,
    ui: ui
  };

  // This would get replaced by UI / controllers
  game.on("change:state", function(game, state) {
    setTimeout(function() {
      if (state == Game.State.PlayerSetup) {
        game.finishPlayerSetup(3);
      } else if (state == Game.State.ShowScenarioChoices) {
      } else if (state == Game.State.PreTurn) {
      } else if (state == Game.State.MidTurn) {
      } else if (state == Game.State.OpinionPhase) {
        game.beginVotingPhase();
      } else if (state == Game.State.FinalChoice) {
        game.beginFinalChoice();
      }
    }, 50);
  });

  $.when(game.loaded).then(function(game) {
    game.beginPlayerSetup();
  });
}());
