modules.define(
    'suggest',
    ['i-bem__dom', 'keyboard__codes', 'BEMHTML', 'input', 'popup'],
    function(provide, BemDom, keyCodes, BEMHTML, _, _) {

provide(BemDom.decl(this.name, {
    onSetMod : {
        'js' : {
            'inited' : function() {
                this._input = this.findBlockInside('input')
                    .on('change', this._onInputChange, this);

                this._popup = this.findBlockInside('popup')
                    .setAnchor(this._input)
                    .on({ modName : 'visible', modVal : '' }, this._onPopupHide, this);

                this._menu = this._popup.findBlockInside('menu')
                    .on('item-click', this._onMenuItemClick, this);

                this.hasMod('focused') && this._focus();
            }
        },

        'focused' : {
            'true' : function() {
                this._focus();
            },

            '' : function() {
                this
                    .unbindFromDoc('keydown', this._onKeyDown)
                    .unbindFromDoc('keypress', this._onKeyPress)
                    .delMod('opened')
                    ._input
                        .delMod('focused');
            }
        },

        'opened' : {
            '*' : function(_, modVal) {
                this._menu.setMod('focused', modVal);
            },

            'true' : function() {
                this._popup.setMod('visible');
            },

            '' : function() {
                this._popup.delMod('visible');
            }
        }
    },

    _focus : function() {
        this
            .bindToDoc('keydown', this._onKeyDown)
            .bindToDoc('keypress', this._onKeyPress)
            ._input
                .setMod('focused');
    },

    _buildItemsBemjson : function(items) {
        var mods = this.getMods();
        return items.map(function(item) {
            return {
                block : 'menu-item',
                mods : {
                    theme : mods.theme,
                    disabled : mods.disabled
                },
                content : item
            };
        });
    },

    _setMenuContent : function(items) {
        var menuItems = BEMHTML.apply(this._buildItemsBemjson(items));
        if(menuItems) {
            this._menu.setContent(menuItems);
        }
    },

    _onInputFocusChange : function(e, data) {
        this.setMod('focused', data.modVal);
    },

    _onKeyDown : function(e) {
        var keyCode = e.keyCode;
        if(this.hasMod('opened')) {
            if(keyCode === keyCodes.ESC) {
                e.preventDefault();
                this.delMod('opened');
            }
        } else {
            if((keyCode === keyCodes.UP || keyCode === keyCodes.DOWN) && !e.shiftKey) {
                e.preventDefault();
                this.setMod('opened');
            }
        }
    },

    _onKeyPress : function() {
        this.setMod('opened');
    },

    _onInputChange : function() {

    },

    _onMenuItemClick : function() {

    },

    _onPopupHide : function() {
        this.delMod('opened');
    }
}, {
    live : function() {
        this.liveInitOnBlockInsideEvent(
            { modName : 'focused', modVal : '*' },
            'input',
            this.prototype._onInputFocusChange);
    }
}));

});
