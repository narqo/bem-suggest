modules.define('timezone-provider__storage', ['inherit'], function(provide, inherit) {

provide(inherit({
    __constructor : function(data) {
        this._data = data.map(function(item) {
            return {
                text : item,
                val : item
            };
        });
    },

    /**
     * @param {RegExp} query
     * @param {Function} callback
     */
    find : function(query, callback) {
        callback(null, this._data.filter(function(item) {
            return query.test(item.text);
        }).slice());
    }
}));

});
