modules.define(
    'sg-datalist',
    ['i-bem__dom', 'menu', 'BEMHTML'],
    function(provide, BemDom, Menu, BEMHTML) {

provide(BemDom.decl(this.name, {
    onSetMod : {
        'js' : {
            'inited' : function() {
                this._dataprovider = null;
                this._menu = this.findBlockOn(Menu.getName())
                    .on({
                        'item-hover' : this._onMenuItemHover,
                        'item-click' : this._onMenuItemClick
                    }, this);
            }
        },

        'focused' : function(modNam, modVal) {
            this._menu.setMod(modNam, modVal);
        }
    },

    getDataProvider : function() {
        if(this._dataprovider === null) {
            throw new Error('dataprovider was not set');
        }
        return this._dataprovider;
    },

    setDataProvider : function(dataprovider) {
        this._setDataProvider(dataprovider);
        return this;
    },

    _setDataProvider : function(dataprovider) {
        if(this._dataprovider !== null) {
            throw new Error('dataprovider can\'t be set twice');
        }
        this._dataprovider = dataprovider.on({
            'data' : this._onProviderGotData,
            'error' : this._onProviderGotError
        }, this);
    },

    requestData : function(params) {
        this.getDataProvider().get(params).done();
        return this;
    },

    // TODO: move to menu
    hoverNextItem : function(dir) {
        var items = this._menu.getItems(),
            len = items.length;

        if(!len) return;

        var hoveredIdx = items.indexOf(this._menu._hoveredItem), // FIXME: `this._menu._hoveredItem`
            nextIdx = hoveredIdx,
            i = 0;

        do {
            nextIdx += dir;
            nextIdx = nextIdx < 0? len - 1 : nextIdx >= len? 0 : nextIdx;
            if(++i === len + 1) {
                return; // if we have no next item to hover
            }
        } while(items[nextIdx].hasMod('disabled'));

        items[nextIdx].setMod('hovered');
    },

    /**
     * @param {Array} items
     * @returns {String}
     */
    buildItems : function(items) {
        return BEMHTML.apply(this._buildItemsBemjson(items));
    },

    /**
     * @param {Array} items
     * @return {Array}
     * @protected
     */
    _buildItemsBemjson : function(items) {
        var mods = this._menu.getMods();
        return items.map(function(item) {
            return {
                block : 'menu-item',
                mods : {
                    theme : mods.theme,
                    disabled : mods.disabled
                },
                val : item.val,
                content : item.text
            };
        });
    },

    _updateMenu : function(items) {
        this._menu.setContent(items.length? this.buildItems(items) : '');
    },

    _onMenuItemHover : function(e, data) {
        this.emit('item-hover', data);
    },

    _onMenuItemClick : function(e, data) {
        this.emit('item-click', data);
    },

    _onProviderGotData : function(e, data) {
        this ._updateMenu(data.result);

        this.emit('items', data);
    },

    _onProviderGotError : function(e, data) {
        // TODO: _onProviderGotError
        this.emit('error', data);
    }
}, {
    live : true
}));

});
