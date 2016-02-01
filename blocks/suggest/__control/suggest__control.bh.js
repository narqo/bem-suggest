module.exports = function(bh) {
    bh.match('suggest__control', function(ctx, json) {
        var suggest = ctx.tParam('_suggest');
        return {
            block : 'input',
            mods : json.elemMods,
            mix : { block : json.block, elem : 'control' },
            autocomplete : false,
            name : suggest.name,
            val : suggest.val,
            placeholder : suggest.placeholder
        };
    });
};
