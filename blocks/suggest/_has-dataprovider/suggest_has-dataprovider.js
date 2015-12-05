modules.define('suggest', function(provide, Suggest) {

provide(Suggest.decl({ modName : 'has-dataprovider' }, {
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
        throw new Error('not implementer');
    }
}));

});
