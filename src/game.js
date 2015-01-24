(function() {

  // Set up State enum
  var states = [ "Uninitialized",
                 "PlayerSetup",
                 "ShowScenarioChoices",
                 "PreTurn",
                 "MidTurn",
                 "PostTurn",
                 "OpinionPhase",
                 "VotingPhase",
                 "FinalChoice",
                 "GameEnd"
               ];

  var State = {};
  for (var i = 0; i < states; i++) {
    var stateName = states[ i ];
    Game.State[ stateName ] = stateName;
  }

  var Game = Backbone.Model.extend({
    defaults: {
      "players": [],
      "numberOfTurns": 0,
      "currentTurn": -1,
      "scenario": undefined,
      "cardsOnBoard": [],
      "state": State.Uninitialized
    },

    beginPlayerSetup: function() {
      this.set( "state", Game.State.PlayerSetup );
    },

    finishPlayerSetup: function( numberOfPlayers ) {
      // TODO: Generate players and scenario
      this.beginNextTurn();
    },

    beginNextTurn: function() {
      var turn = this.get( "currentTurn" ) + 1;
      this.set( "turn", turn );

      if ( turn < this.get( "numberOfTurns" )) {
        this.beginPreTurn();
      } else {
        this.beginOpinionPhase();
      }
    }

    beginPreTurn: function() {
      var turn = this.get( "turn" );
      var players = this.get( "players" );
      var currentPlayerIndex = turn % players.length;

      var currentPlayer = players[ currentPlayerIndex ];
      console.log( "*** Starting turn:", turn);
      console.log( "Player", currentPlayer.name, "take the screen! Everyone else look away!" );

      this.set( "state", Game.State.PreTurn );
    },

    beginMidTurn: function() {
      // Not sure that we need anything else here
      this.set( "state", Game.Start.MidTurn );
    },

    beginPostTurn: function( player, sharedCard, cardsOnBoard ) {
      player.shareCard( sharedCard );
      this.set( "cardsOnBoard", cardsOnBoard );
      this.set( "state", Game.State.PostTurn );
    },

    beginOpinionPhase: function() {
      this.set( "state", Game.State.OpinionPhase );
    },

    beginVotingPhase: function() {
      this.set( "state", Game.State.VotingPhase );
    },

    beginFinalChoice: function() {
      this.set( "state", Game.State.FinalChoice );
    },

    lockInDecision: function( choice ) {
      this.set( "state", Game.State.GameEnd );
    }
  });

  Game.State = State;
  window.Game = Game;
}());
