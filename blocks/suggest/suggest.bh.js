module.exports = function(bh) {
    bh.match('suggest', function(ctx, json) {
        ctx.tParam('_suggest', json);

        var mods = ctx.mods(),
            elemMods = ctx.extend({}, mods);

        // NOTE: don't pass dataprovider to elements
        elemMods['has-dataprovider'] = null;

        ctx
            .js(true)
            .content([
                { elem : 'control', elemMods : elemMods },
                {
                    block : 'popup',
                    mods : {
                        theme : mods.theme,
                        target : 'anchor',
                        autoclosable : true
                    },
                    directions : ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
                    content : {
                        block : json.block,
                        elem : 'datalist',
                        elemMods : elemMods
                    }
                }
            ]);
    });
};
