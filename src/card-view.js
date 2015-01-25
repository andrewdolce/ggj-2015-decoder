(function() {
  var normalLabelClass = 'label-default';
  var disabledLabelClass = 'label-warning';

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
      this.el.__cardView = this;
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
      var selector;
      if (this.model.isInHand()) {
        var id = owner.get( 'identifier' );
        selector = '#player-' + id;
      } else {
        selector = '#board';
      }
      return this.appendToDeck(selector);
    },

    lockFromProposal: function() {
      this.$el
        .removeClass('dc-active-card')
        .find('> span')
        .removeClass(normalLabelClass)
        .addClass(disabledLabelClass);
    },

    unlockFromProposal: function() {
      this.$el
        .addClass('dc-active-card')
        .find('> span')
        .removeClass(disabledLabelClass)
        .addClass(normalLabelClass);
    }
  });

  window.CardView = CardView;
}());
