modules.define(
    'suggest',
    ['timezone-provider'],
    function(provide, TzDataProvider, Suggest) {

provide(Suggest.declMod({ modName : 'has-dataprovider', modVal : 'timezone' }, {
    /** @override */
    _createDataProvider : function() {
        return new TzDataProvider(this.params.data);
    }
}));

});
