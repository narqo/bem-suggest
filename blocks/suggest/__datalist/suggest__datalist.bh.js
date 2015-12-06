module.exports = function(bh) {
    bh.match('suggest__datalist', function(ctx, json) {
        return {
            block : 'sg-datalist',
            mods : json.elemMods
        };
    });
};
