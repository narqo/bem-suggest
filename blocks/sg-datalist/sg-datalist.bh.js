module.exports = function(bh) {
    bh.match('sg-datalist', function(ctx, json) {
        var mods = ctx.mods();
        return {
            block : 'menu',
            mods : {
                theme : mods.theme,
                size : mods.size,
                disabled : mods.disabled
            },
            mix : { block : json.block, js : ctx.js() || true }
        };
    });
};
