block('sg-datalist')(
    replace()(function() {
        return {
            block : 'menu',
            mods : {
                theme : this.mods.theme,
                size : this.mods.size,
                disabled : this.mods.disabled
            },
            mix : { block : this.block, js : apply('js') }
        };
    }),
    js()(function() {
        return this.ctx.js || true;
    })
)
