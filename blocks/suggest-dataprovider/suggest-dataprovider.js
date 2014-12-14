modules.define(
    'suggest-dataprovider',
    ['inherit', 'events', 'next-tick'],
    function(provide, inherit, events, nextTick) {

var data = [
        'Asia/Kabul',
        'Europe/Mariehamn',
        'Europe/Tirane',
        'Africa/Algiers',
        'Pacific/Pago_Pago',
        'Europe/Andorra',
        'Africa/Luanda'
    ],
    len = data.length,
    i = 0,
    pad = 3;

provide(inherit(events.Emitter, {
    get : function(_) {
        nextTick(this._get.bind(this, _));
    },

    _get : function(_) {
        var max = i++ + pad;
        this.emit('items', { items : data.slice(max >= len? (i = 0) : i, max) });
    }
}));

});
