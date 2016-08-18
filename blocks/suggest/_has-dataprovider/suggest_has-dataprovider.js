modules.define('suggest', function(provide, Suggest) {

provide(Suggest.declMod({ modName : 'has-dataprovider', modVal : '*' }, {
    onSetMod : {
        'js' : {
            'inited' : function() {
                this.__base.apply(this, arguments);
                this.getDatalist().setDataProvider(this._createDataProvider());
            }
        }
    },

    /**
     * @abstract
     * @protected
     */
    _createDataProvider : function() {
        throw new Error('not implemented');
    }
}));

});
