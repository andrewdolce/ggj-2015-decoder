(function() {
  var CardView = Backbone.View.extend({
    tagName: 'li',
    className: 'dc-card',

    template: (function() {
      var source = $('#card-view-template').html();
      var template = Handlebars.compile(source);

      return function() {
        return template(this.model.attributes);
      };
    }()),

    render: function() {
      this.$el.html(this.template());
      return this;
    },

    appendToDeck: function(selector) {
      var $deck = $(selector);
      if ($deck.length) {
        this.$el.appendTo($deck.get(0).$__retargetRoot);
      }
    },

    appendToOwner: function() {
      var owner = this.model.get('owner');
      var selector = '#' + owner;
      return this.appendToDeck(selector);
    }
  });

  window.CardView = CardView;
}());
