block('suggest')(
    def()(function() {
        return applyNext({ _suggest : this.ctx });
    }),

    js()(true),

    content()(function() {
        var mods = this.mods,
            elemMods = this.extend({}, this.mods);

        // NOTE: don't pass dataprovider to elements
        elemMods['has-dataprovider'] = null;

        return [
            { elem : 'control', elemMods : elemMods },
            {
                block : 'popup',
                mods : {
                    theme : mods.theme,
                    target : 'anchor',
                    autoclosable : true
                },
                // FIXME: https://github.com/bem/bem-components/issues/1745
                attrs : { 'aria-hidden' : 'true' },
                directions : ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
                content : {
                    block : this.block,
                    elem : 'datalist',
                    elemMods : elemMods
                }
            }
        ];
    })
)
