(function() {
  var stripPunctuation = function(string) {
    return string.replace(/[,:;\-–.!]/g, '');
  };

  var Scenario = Backbone.Model.extend({
    defaults: {
      rawSentence: '',
      cards: [],
      prompt: '',
      choices: [],
      correctChoice: -1,
      outcomes: []
    },

    constructor: function() {
      Backbone.Model.apply(this, arguments);

      var rawSentence = this.get('rawSentence');
      var cards = this.get('cards');

      var cardModels;
      if (cards.length) {
        cardModels = cards.map(function(phrase) {
          return new Card({ text: stripPunctuation(phrase) });
        });
      } else {
        cardModels = stripPunctuation(rawSentence)
          .split(' ')
          .map(function(word) {
            return new Card({
              text: word
            });
          });
      }

      this.set('cards', cardModels);
    },

    generateCardGroups: function(numberOfGroups) {
      var rawSentence = this.get('rawSentence');

      var groups = [];
      for (var i = 0; i < numberOfGroups; i++) {
        groups.push([]);
      }

      var shuffledCards = _.shuffle(this.get('cards'));
      for (var i = 0; i < shuffledCards.length; i++) {
        var groupIndex = i % numberOfGroups;
        var group = groups[groupIndex];
        group.push(shuffledCards[i]);
      }

      return groups;
    }
  });

  window.Scenario = Scenario;
}());
