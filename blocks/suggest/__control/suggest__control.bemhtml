block('suggest').elem('control')(
    replace()(function() {
        return {
            block : 'input',
            mods : this.extend({ width : 'available' }, this.elemMods),
            mix : { block : this.block, elem : 'control' },
            autocomplete : false,
            name : this._suggest.name,
            val : this._suggest.val,
            id : this._suggest.id,
            placeholder : this._suggest.placeholder
        };
    })
)
