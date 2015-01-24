(function() {
  var stripPunctuation = function(string) {
    return string.replace(/[,:;\-–.!]/g, '');
  };

  var Scenario = Backbone.Model.extend({
    defaults: {
      "rawSentence": 'The dinosaur is vicious, hungry, and very fast, but it can only see things that are moving.',
      "cards": [],
      "prompt": "Should we run?",
      "choices": [ "Run!", "Don't run!" ],
      "outcomes": [ "You run. The dinosaur chases you down and eats you!",
                    "You do not run. The dinosaur doesn't see you, and wonders off."
                  ]
    },

    generateCardGroups: function(numberOfGroups) {
      var rawSentence = this.get('rawSentence');
      var cardModels = stripPunctuation(rawSentence)
        .split(' ')
        .map(function(word) {
          var card = new Card({
            text: word
          });
          return card;
        });
      this.set('cards', cardModels);

      var groups = [];
      for (var i = 0; i < numberOfGroups; i++) {
        groups.push([]);
      }

      var shuffledCards = _.shuffle(cardModels);
      for (var i = 0; i < cardModels.length; i++) {
        var groupIndex = i % numberOfGroups;
        var group = groups[groupIndex];
        group.push(cardModels[i]);
      }

      return groups;
    }
  });

  window.Scenario = Scenario;
}());
