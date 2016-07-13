var _ = require('underscore');
var Model = require('../core/model');

var STATUS = {
  PENDING: 'pending',
  WAITING: 'waiting',
  RUNNING: 'running',
  FAILED: 'failed',
  READY: 'ready'
};

module.exports = Model.extend({

  initialize: function (attrs, opts) {
    opts = opts || {};
    if (!opts.camshaftReference) {
      throw new Error('chamshaftReference is required');
    }

    if (!opts.map) {
      throw new Error('map is required');
    }

    this._camshaftReference = opts.camshaftReference;
    this._map = opts.map;
    this._initBinds();
  },

  url: function () {
    var url = this.get('url');
    if (url) {
      if (this.get('apiKey')) {
        url += '?api_key=' + this.get('apiKey');
      } else if (this.get('authToken')) {
        url += '?auth_token=' + this.get('authToken');
      }
      return url;
    }
  },

  setOk: function () {
    this.unset('error');
  },

  setError: function (error) {
    this.set({
      error: error,
      status: STATUS.FAILED
    });
  },

  _initBinds: function () {
    this.bind('change:type', function () {
      this.unbind(null, null, this);
      this._initBinds();
      this._reloadMap();
    }, this);

    _.each(this.getParamNames(), function (paramName) {
      this.bind('change:' + paramName, this._reloadMap, this);
    }, this);
  },

  _reloadMap: function (opts) {
    opts = opts || {};
    opts.error = this._onMapReloadError.bind(this);
    this._map.reload(opts);
  },

  _onMapReloadError: function () {
    this.set('status', STATUS.FAILED);
  },

  remove: function () {
    this.trigger('destroy', this);
  },

  findAnalysisById: function (analysisId) {
    if (this.get('id') === analysisId) {
      return this;
    }
    var sources = _.chain(this._getSourceNames())
      .map(function (sourceName) {
        var source = this.get(sourceName);
        return source.findAnalysisById(analysisId);
      }, this)
      .compact()
      .value();

    return sources[0];
  },

  _getSourceNames: function () {
    return this._camshaftReference.getSourceNamesForAnalysisType(this.get('type'));
  },

  isDone: function () {
    return [STATUS.READY, STATUS.FAILED].indexOf(this.get('status')) >= 0;
  },

  toJSON: function () {
    var json = _.pick(this.attributes, 'id', 'type');
    json.params = _.pick(this.attributes, this.getParamNames());
    _.each(this._getSourceNames(), function (sourceName) {
      var source = {};
      source[sourceName] = this.get(sourceName).toJSON();
      _.extend(json.params, source);
    }, this);

    return json;
  },

  getParamNames: function () {
    return this._camshaftReference.getParamNamesForAnalysisType(this.get('type'));
  }
}, {
  STATUS: STATUS
});