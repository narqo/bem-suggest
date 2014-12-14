modules.define('suggest', ['suggest-dataprovider'], function(provide, DataProvider, Suggest) {

provide(Suggest.decl({ modName : 'has-dataprovider', modVal : true }, {
    onSetMod : {
        'js' : {
            'inited' : function() {
                this.__base.apply(this, arguments);

                this._dataProvider = null;
            }
        },

        'focused' : {
            '' : function() {
                this.__base.apply(this, arguments);

                this._getDataProvider().un('items', this._onProviderGotItems);
            }
        }
    },

    _focus : function() {
        this.__base();

        this._getDataProvider().on('items', this._onProviderGotItems, this);
    },

    _getDataProvider : function() {
        if(!this._dataProvider) {
            this._dataProvider = new DataProvider()
        }
        return this._dataProvider;
    },

    _onProviderGotItems : function(e, data) {
        var items = data.items;
        items.length?
            this._setMenuContent(items) :
            this.delMod('opened');
    },

    _onInputChange : function(e) {
        if(this.hasMod('opened')) {
            this._getDataProvider().get(e.target.getVal());
        }
    }
}));

});
