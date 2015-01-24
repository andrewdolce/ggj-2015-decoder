(function() {
  var Card = Backbone.Model.extend({
    defaults: {
      "text": "Sparta"
    }
  });

  window.Card = Card;
}());
