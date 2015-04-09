var BaseView = require('baseview'),
    _ = require('underscore'); 

exports = BaseView.extend({
    contentSelector: '.contents-container'
    , modelView: BaseView
    , modelOptions: undefined
    , modelViews: {}
    , emptyTemplate: null
    , _initialize: function (models, options) {
        this.children = _.extend({}, this.children);
        this.modelViews = _.extend({}, this.modelViews);
        this.options = _.extend({}, this.options, options);
        this.events = _.extend({}, this.events);
        this._bindings(models, options);
        this._onInitialize(models, options);
        return this;
    }
    , bindings: function (models, options) {
        this.listenTo(this.collection, "add", this.renderAdd);
    }
    , modelsFilter: function (model) {
        return true;
    }
    , _onRender: function () {
        var modelEls = [];

        this.collection.chain().filter(_.bind(this.modelsFilter, this)).each(_.bind(function (model) {
            modelEls.push(this.renderOne(model, this.modelOptions));
        }, this));

        if(_.values(this.modelViews).length > 0) {
            this.$el.find(_.result(this, 'contentSelector')).html(modelEls);
        }

        this.onRender();
        this.trigger('render');
        return this;

    }
    , _getHTML: function() {
        var template;
        if (_.result(this, 'isError')) {
            template = _.result(this, 'errorTemplate');
        } else if (_.result(this, 'isLoading')) {
            template = _.result(this, 'loadingTemplate');
        } else if (_.result(this, 'isEmpty')) {
            template = _.result(this, 'emptyTemplate');
        } else {
            template = _.result(this, 'template');
        }
        if (template) {
            return this.compileTemplate(template, this.getRenderData());
        } else {
            return "";
        }
    }

    , renderOne: function (model, options) {
        var view
            , strRepr = model.cid;


        if(!_.has(this.modelViews, strRepr)) {
            view = new this.modelView({model: model}, _.result(this, 'modelOptions'));
            this.modelViews[strRepr] = view;
        } else {
            view = this.modelViews[strRepr];
        }
        if (this.altChildRender) {
            return view.render().el.childNodes;
        }
        return view.render().$el;
    }
    , renderAdd: function (model) {
        var newEl = this.renderOne(model, _.result(this, 'modelOptions'));
        this.$el.find(_.result(this, 'contentSelector')).append(newEl);
    }
    , closeChildren: function () {
        _.each(this.children, this.closeChild);
        _.each(this.modelViews, this.closeChild);
    }
    , isEmpty: function () {}
    , isError: false
});

