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
        },

        'focused' : {
            '' : function() {
                return !this._needRefocusControl;
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

                this._menu = this._popup.findBlockInside(Datalist.getName())
                    .on('item-click', this._onMenuItemClick, this);

                this.hasMod('focused') && this._focus();

                this._needRefocusControl = false;
                this._isMenuEmpty = null;
                this._hoveredItem = null;
            }
        },

        'focused' : {
            'true' : function() {
                this._focus();
            },

            '' : function() {
                this._menu.un('items', this._onMenuGotItems, this);
                this
                    .unbindFrom(this._popup.domElem, 'pointerpress', this._onPopupPointerPress)
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
                this._menu.on('item-hover', this._onMenuItemHover, this);
            },

            '' : function() {
                this._popup.delMod('visible');
                this._menu.un('item-hover', this._onMenuItemHover, this);

                this._isMenuEmpty = null;
                this._hoveredItem = null;
            }
        }
    },

    getDatalist : function() {
        return this._menu;
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
            .bindTo(this._popup.domElem, 'pointerpress', this._onPopupPointerPress)
            ._input
                .setMod('focused');
        this._menu.on('items', this._onMenuGotItems, this);
    },

    _refocusControl : function() {
        this._needRefocusControl = false;
        this._input.setMod('focused');
        this.unbindFromDoc('pointerrelease', this._refocusControl);
    },

    _hoverNextMenuItem : function(dir) {
        this._menu.hoverNextItem(dir);
    },

    _updateMenuHeight : function() {
        var drawingParams = this._popup.calcPossibleDrawingParams(),
            menuDomElem = this._menu.domElem,
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

    _onPopupPointerPress : function() {
        this._needRefocusControl = true;
        this.unbindFrom(this._popup.domElem, 'pointerpress', this._onPopupPointerPress);
        this.bindToDoc('pointerrelease', this._refocusControl);
    },

    _onMenuGotItems : function(e, data) {
        this._hoveredItem = null;
        if(this._isMenuEmpty = !data.result.length) {
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
            this._menu.requestData({ val : e.target.getVal() });
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
