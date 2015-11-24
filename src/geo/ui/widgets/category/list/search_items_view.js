var $ = require('jquery');
var _ = require('underscore');
var View = require('cdb/core/view');
var CategoryItemsView = require('./items_view');
var WidgetSearchCategoryItemView = require('./item/search_item_view');
var placeholder = require('./search_items_no_results_template.tpl');

/**
 * Category list view
 */
module.exports = CategoryItemsView.extend({

  className: 'Widget-list is-hidden Widget-list--wrapped js-list',

  render: function() {
    this.clearSubViews();
    this.$el.empty();
    var data = this.dataModel.getSearchResult();
    var isDataEmpty = data.isEmpty() || data.size() === 0;

    if (isDataEmpty) {
      this._renderPlaceholder();
    } else {
      this._renderList();
    }
    return this;
  },

  _renderList: function() {
    this.$el.removeClass('Widget-list--withBorders Widget-list--noresults');
    this.$el.addClass('Widget-list--wrapped');

    var groupItem;
    var data = this.dataModel.getSearchResult();

    data.each(function(mdl, i) {
      if (i % this.options.itemsPerPage === 0) {
        groupItem = $('<div>').addClass('Widget-listGroup');
        this.$el.append(groupItem);
      }
      this._addItem(mdl, groupItem);
    }, this);
  },

  _renderPlaceholder: function() {
    // Change view classes
    this.$el
      .addClass('Widget-list--noresults')
      .removeClass('Widget-list--wrapped');

    this.$el.html(
      placeholder({
        q: this.dataModel.getSearchQuery()
      })
    );
  },

  _addItem: function(mdl, $parent) {
    var v = new WidgetSearchCategoryItemView({
      model: mdl,
      dataModel: this.dataModel
    });
    this.addView(v);
    $parent.append(v.render().el);
  },

  toggle: function() {
    this[ this.viewModel.isSearchEnabled() ? 'show' : 'hide']();
  }

});