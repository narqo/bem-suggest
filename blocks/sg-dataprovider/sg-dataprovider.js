/** @module sg-dataprovider */

modules.define(
    'sg-dataprovider',
    ['inherit', 'events', 'next-tick'],
    function(provide, inherit, events, nextTick) {

provide(/** @exports */ inherit(events.Emitter, {
    __constructor : function() {
        this.__base.apply(this, arguments);
        this._onGotData = this._onGotData.bind(this);
    },

    /**
     * @param {Object} params
     * @returns {Object} this
     */
    get : function(params) {
        // TODO: return Promise
        this._getData(params, this._onGotData);
        return this;
    },

    /**
     * @param {Object} params
     * @param {Function} callback
     * @abstract
     */
    _getData : function(params, callback) {
        callback(new Error('not implemented'));
    },

    _onGotData : function(err, data) {
        var _this = this;
        nextTick(function() {
            err ? _this.emit('error', err) : _this.emit('items', { items : data });
        })
    }
}));

});
