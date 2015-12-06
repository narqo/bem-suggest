/** @module sg-dataprovider */

modules.define(
    'sg-dataprovider',
    ['inherit', 'events', 'vow'],
    function(provide, inherit, events, vow) {

provide(/** @exports */ inherit(events.Emitter, {
    /**
     * @param {Object} params
     * @returns {vow.Promise}
     */
    get : function(params) {
        return vow.fulfill(this._getData(params)).always(this._onGotData, this);
    },

    /**
     * @param {Object} params
     * @returns {vow.Promise}
     * @abstract
     */
    _getData : function(params) {
        return vow.reject(new Error('not implemented'));
    },

    _onGotData : function(promise) {
        var res = promise.valueOf();
        promise.isRejected()?
            this.emit('error', res) :
            this.emit('data', { result : res });
        return promise;
    }
}));

});
