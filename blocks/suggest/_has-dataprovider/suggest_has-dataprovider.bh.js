module.exports = function(bh) {
    bh.match('suggest', function(ctx, json) {
        if(ctx.mods()['has-dataprovider']) {
            ctx.js(ctx.extend(ctx.js(), json.dataprovider), true);
        }
    });
};
