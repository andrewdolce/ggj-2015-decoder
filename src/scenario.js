(function() {
  var Scenario = Backbone.Model.extend({
    defaults: {
      "rawSentence": "This is the raw sentence for the scenario",
      "cards": [],
      "prompt": "Do or do not?"
    }
  });

  window.Scenario = Scenario;
}());
