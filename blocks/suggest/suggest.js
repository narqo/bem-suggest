modules.define(
    'suggest',
    ['i-bem__dom', 'keyboard__codes', 'sg-datalist', 'popup', 'input'],
    function(provide, BemDom, keyCodes, Datalist, Popup, Input) {

provide(BemDom.decl(this.name, {
    beforeSetMod : {
        'opened' : {
            'true' : function() {
                return this._isMenuEmpty !== true;
            }
        }
    },

    onSetMod : {
        'js' : {
            'inited' : function() {
                this._input = this.findBlockInside(Input.getName())
                    .on('change', this._onInputChange, this);

                this._popup = this.findBlockInside(Popup.getName())
                    .setAnchor(this._input)
                    .on({ modName : 'visible', modVal : '' }, this._onPopupHide, this);

                this.hasMod('focused') && this._focus();

                this._isMenuEmpty = null;
                this._hoveredItem = null;
            }
        },

        'focused' : {
            'true' : function() {
                this._focus();
            },

            '' : function() {
                this.getDatalist().un('items', this._onMenuGotItems, this);
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
                this.getDatalist().setMod('focused', modVal);
            },

            'true' : function() {
                this._popup.setMod('visible');
                this.getDatalist()
                    .on({
                        'item-hover' : this._onMenuItemHover,
                        'item-click' : this._onMenuItemClick
                    }, this);
            },

            '' : function() {
                this._popup.delMod('visible');
                this.getDatalist()
                    .on({
                        'item-hover' : this._onMenuItemHover,
                        'item-click' : this._onMenuItemClick
                    }, this);
                this._isMenuEmpty = null;
                this._hoveredItem = null;
            }
        }
    },

    getDatalist : function() {
        return this._menu || (this._menu = this._popup.findBlockInside(Datalist.getName()));
    },

    getControl : function() {
        return this._input;
    },

    getDefaultParams : function() {
        return {
            optionsMaxHeight: Infinity
        };
    },

    _focus : function() {
        this
            .bindToDoc('keydown', this._onKeyDown)
            .bindToDoc('keypress', this._onKeyPress)
            ._input
                .setMod('focused');
        this.getDatalist().on('items', this._onMenuGotItems, this);
    },

    _hoverNextMenuItem : function(dir) {
        this.getDatalist().hoverNextItem(dir);
    },

    _updateMenuHeight : function() {
        var drawingParams = this._popup.calcPossibleDrawingParams(),
            menuDomElem = this.getDatalist().domElem,
            menuWidth = menuDomElem.outerWidth(),
            bestHeight = 0;

        drawingParams.forEach(function(params) {
            params.width >= menuWidth && params.height > bestHeight && (bestHeight = params.height);
        });

        bestHeight && menuDomElem.css('max-height', Math.min(this.params.optionsMaxHeight, bestHeight));
    },

    _onKeyDown : function(e) {
        var keyCode = e.keyCode,
            isVertArrowKey = (keyCode === keyCodes.UP || keyCode === keyCodes.DOWN);

        if(this.hasMod('opened')) {
            if(keyCode === keyCodes.ESC) {
                e.preventDefault();
                this.delMod('opened');
            } else if (isVertArrowKey && !e.shiftKey) {
                e.preventDefault();
                this._hoverNextMenuItem(keyCode === keyCodes.UP? -1 : 1);
            }
        } else {
            if(isVertArrowKey && !e.shiftKey) {
                e.preventDefault();
                this.setMod('opened');
            }
        }
    },

    _onKeyPress : function(e) {
        if (e.keyCode === keyCodes.ENTER) {
            if(this.hasMod('opened') && this._hoveredItem) {
                this._input.setVal(this._hoveredItem.getVal());
            }
        }
    },

    _onPopupHide : function() {
        this.delMod('opened');
    },

    _onMenuGotItems : function(e, data) {
        this._hoveredItem = null;
        if(this._isMenuEmpty = !data.items.length) {
            this.delMod('opened')
        } else {
            this
                .setMod('opened')
                ._updateMenuHeight();
        }
    },

    _onMenuItemClick : function(e, data) {
        this
            .setMod('focused')
            ._input.setVal(data.item.getVal());
    },

    _onMenuItemHover : function(e, data) {
        this._hoveredItem = data.item;
    },

    _onInputChange : function(e) {
        if(this.hasMod('focused')) {
            this.getDatalist().requestData({ val : e.target.getVal() });
        }
    },

    _onInputFocusChange : function(e, data) {
        this.setMod('focused', data.modVal);
    }
}, {
    live : function() {
        this.liveInitOnBlockInsideEvent({ modName : 'focused', modVal : '*' }, Input.getName(),
            this.prototype._onInputFocusChange);
    }
}));

});
