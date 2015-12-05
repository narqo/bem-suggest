modules.define(
    'timezone-provider',
    ['inherit', 'sg-dataprovider', 'timezone-provider__storage'],
    function(provide, inherit, DataProvider, TzStorage) {

provide(inherit(DataProvider, {
    __constructor : function(data) {
        this.__base.apply(this, arguments);
        this._storage = new TzStorage(data);
    },

    /** @override */
    _getData : function(params, callback) {
        var _this = this,
            query = this._buildQuery(params.val);

        if(query) {
            this._storage.find(query, callback);
        }
    },

    _buildQuery : function(val) {
        if(!val.length) return null;
        return new RegExp('^' + val + '', 'i');
    }
}));

});
