modules.define(
    'suggest',
    ['i-bem-dom', 'keyboard__codes', 'sg-datalist', 'popup', 'input', 'menu'],
    function(provide, BemDom, keyCodes, Datalist, Popup, Input, Menu) {

var CHANGE_SOURCE_DATALIST = 'datalist';

provide(BemDom.declBlock(this.name, {
    beforeSetMod : {
        'opened' : {
            'true' : function() {
                return this._isMenuEmpty !== true && !this.hasMod('disabled');
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
                var input = this._input = this.findChildBlock(Input);
                this._events(input).on('change', this._onInputChange, this);

                var popup = this._popup = this.findChildBlock(Popup);
                popup.setAnchor(input);
                this._events(popup).on({
                    modName : 'visible',
                    modVal : false
                }, this._onPopupHide, this);

                var datalist = this._datalist = this._popup.findChildBlock(Datalist);
                this._events(datalist).on('item-click', this._onMenuItemClick, this);
                this._menu = datalist.findMixedBlock(Menu);

                this.hasMod('focused') && this._focus();

                this._needRefocusControl = false;
                this._preventRequestData = false;
                this._isMenuEmpty = null;
                this._hoveredItem = null;
            }
        },

        'focused' : {
            'true' : function() {
                this._focus();
            },

            '' : function() {
                this._events(this._datalist).un('items', this._onMenuGotItems, this);
                this._domEvents(this._popup).un('pointerpress', this._onPopupPointerPress);
                this._domEvents(document).un('keydown', this._onKeyDown);
                this._domEvents(document).un('keypress', this._onKeyPress);
                this.delMod('opened');
                this._input.delMod('focused');
            }
        },

        'opened' : {
            '*' : function(_, modVal) {
                this._datalist.setMod('focused', modVal);
            },

            'true' : function() {
                this._popup.setMod('visible');
                this._events(this._datalist).on('item-hover', this._onMenuItemHover, this);
            },

            '' : function() {
                this._popup.delMod('visible');
                this._events(this._datalist).un('item-hover', this._onMenuItemHover, this);

                this._isMenuEmpty = null;
                this._hoveredItem = null;
            }
        },

        'disabled' : {
            '*' : function(modName, modVal) {
                this._input.setMod(modName, modVal);
                this._menu.setMod(modName, modVal);
            },

            'true' : function() {
                this._popup.delMod('visible');
            }
        }
    },

    getName : function() {
        return this._input.getName();
    },

    getVal : function() {
        return this._input.getVal();
    },

    setVal : function(val, data) {
        this._preventRequestData = data && data.source === CHANGE_SOURCE_DATALIST;
        this._input.setVal(val, data);
        if(this._preventRequestData) {
            this.delMod('opened');
            this._preventRequestData = false;
        }
        return this;
    },

    getDefaultParams : function() {
        return {
            optionsMaxHeight : Infinity
        };
    },

    getDatalist : function() {
        return this._datalist;
    },

    _requestData : function(val) {
        if(!this._preventRequestData) {
            this._datalist.requestData({ val : val });
        }
    },

    _focus : function() {
        this._domEvents(document).on('keydown', this._onKeyDown);
        this._domEvents(document).on('keypress', this._onKeyPress);
        this._domEvents(this._popup).on('pointerpress', this._onPopupPointerPress);
        this._input.setMod('focused');
        this._events(this._datalist).on('items', this._onMenuGotItems, this);
    },

    _refocusControl : function() {
        this._needRefocusControl = false;
        this._input.setMod('focused');
        this._domEvents(document).un('pointerrelease', this._refocusControl);
    },

    _hoverNextMenuItem : function(dir) {
        this._datalist.hoverNextItem(dir);
    },

    _updateMenuHeight : function() {
        var drawingParams = this._popup.calcPossibleDrawingParams(),
            menuDomElem = this._datalist.domElem,
            menuWidth = menuDomElem.outerWidth(),
            bestHeight = 0;

        drawingParams.forEach(function(params) {
            params.width >= menuWidth && params.height > bestHeight && (bestHeight = params.height);
        });

        bestHeight && menuDomElem.css('max-height', Math.min(this.params.optionsMaxHeight, bestHeight));

        this._popup.redraw();
    },

    _onKeyDown : function(e) {
        var keyCode = e.keyCode,
            isVertArrowKey = (keyCode === keyCodes.UP || keyCode === keyCodes.DOWN);

        if(this.hasMod('opened')) {
            if(keyCode === keyCodes.ESC) {
                e.preventDefault();
                this.delMod('opened');
            } else if(isVertArrowKey && !e.shiftKey) {
                e.preventDefault();
                this._hoverNextMenuItem(keyCode === keyCodes.UP? -1 : 1);
            }
        } else if(isVertArrowKey && !e.shiftKey) {
            e.preventDefault();
            this._requestData(this.getVal());
        }
    },

    _onKeyPress : function(e) {
        if(e.keyCode === keyCodes.ENTER) {
            if(this.hasMod('opened') && this._hoveredItem) {
                this.setVal(this._hoveredItem.getVal(), { source : CHANGE_SOURCE_DATALIST });
            }
        }
    },

    _onPopupHide : function() {
        this.delMod('opened');
    },

    _onPopupPointerPress : function() {
        this._needRefocusControl = true;
        this._domEvents(this._popup).un('pointerpress', this._onPopupPointerPress);
        this._domEvents(document).on('pointerrelease', this._refocusControl);
    },

    _onMenuGotItems : function(e, data) {
        this._hoveredItem = null;
        if(this._isMenuEmpty = !data.result.length) {
            this.delMod('opened');
        } else {
            this
                .setMod('opened')
                ._updateMenuHeight();
        }
    },

    _onMenuItemClick : function(e, data) {
        this
            .setMod('focused')
            .setVal(data.item.getVal(), { source : CHANGE_SOURCE_DATALIST });
    },

    _onMenuItemHover : function(e, data) {
        this._hoveredItem = data.item;
    },

    _onInputChange : function(e, data) {
        if(this.hasMod('focused')) {
            this._requestData(e.target.getVal());
        }
        this._emit('change', data);
    },

    _onInputFocusChange : function(e, data) {
        this.setMod('focused', data.modVal);
    }
}, {
    lazyInit : true,
    onInit : function() {
        this._events(Input).on({
            modName : 'focused',
            modVal : '*'
        }, this.prototype._onInputFocusChange);
    }
}));

});
