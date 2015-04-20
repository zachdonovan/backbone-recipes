// with a deep debt to [airbnb's baseview](https://github.com/airbnb/backbone.baseview).

var Backbone = require('./safeBackbone'),
    _ = require('underscore');

exports = Backbone.View.extend({
    template: null
    , loadingTemplate: null
    , children: {}
    , defaultEvents: {}
    , defaultOptions: {}
    , initialize: function (models, options) {
        return this._initialize(models, options);
    }
    , _initialize: function (models, options) {
        this.children = _.extend({}, this.children);
        this.options = _.extend({}, this.options, options);
        this.events = _.extend({}, this.events);
        this._bindings(models, options);
        this._onInitialize(models, options);
        return this;
    }
    , _bindings: function (models, options) {
        this.bindings(models, options);
    }
    , _onInitialize: function (models, options) {
        this.onInitialize(models, options);
        this.trigger('initialize', this);
    }
    , onInitialize: function(models, options) {}
    , bindings: function(models, options) {}
    , render: function () {
        return this._render();
    }
    , onRender: function() {}
    , onBeforeRender: function () {}
    , _render: function () {
        this._onBeforeRender();
        this.undelegateEvents();
        this.$el.html(this.getHTML());
        this.delegateEvents();

        this.undelegateEvents();
        this.renderChildren();
        this.delegateEvents();

        this._onRender();
        return this;
    }
    , _onBeforeRender: function () {
        this.onBeforeRender();
        this.trigger("beforeRender", this);
    }
    , _onRender: function () {
        this.onRender();
        this.trigger("render", this);
    }
    , getHTML: function() {
        return this._getHTML();
    }
    , _getHTML: function() {
        var template;
        if (this.isLoading()) {
            template = _.result(this, 'loadingTemplate');
        } else {
            template = _.result(this, 'template');
        }
        if (template) {
            return this.compileTemplate(template, this.getRenderData());
        } else {
            return "";
        }
    }
    , renderChildren: function (selector) {
        _.each(this.children, _.bind(function (child, selector) {
            var $el = this.$el.find(selector);
            if($el.length) {
                // memoize this
                if(typeof child === 'function') {
                    child = _.bind(child, this);
                    this.children[selector] = child();
                    child = this.children[selector];
                }
                this.assign(child, selector, $el);
            }
        }, this));
    }
    , isLoading: function () {}
    , compileTemplate: function (template, data) {
        // cache this
        return _.template(template)(data);
    }

    , getRenderData: function () {
        return this._getRenderData();
    }
    , _getRenderData: function() {
        if (this.model) {
            return this.model.toJSON();
        } else {
            return {};
        }
    }
    , assign: function (child, selector, $el) {
        if (this.children[selector] != undefined
                && this.children[selector].cid != child.cid) {
            this.closeChild(child, selector, this.children);
        }
        this.children[selector] = child;
        child.setElement($el).render();
        child.renderChildren(selector);
    }
    , close: function () {
        this.closeChildren();
        this.undelegateEvents();
        if (this.model) { this.model.off(null, null, this); }
        if (this.collection) { this.collection.off(null, null, this); }
        this.stopListening();
        this.unbind();
        this.off();
        this.remove();
        this._onClose();
        return this;
    }
    , closeChildren: function () {
        _.each(this.children, this.closeChild, this);
    }
    , closeChild: function (child, selector, children) {
        if(child.close) {
            child.close();
        }
        delete children[selector];
    }
    , _onClose: function () {
        this.onClose();
        this.trigger('close', this);
    }
    , onClose: function () {}
});
