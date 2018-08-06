modules.define(
    'sg-datalist',
    ['i-bem-dom', 'menu', 'BEMHTML'],
    function(provide, BemDom, Menu, BEMHTML) {

provide(BemDom.declBlock(this.name, {
    onSetMod : {
        'js' : {
            'inited' : function() {
                var menu = this._menu = this.findMixedBlock(Menu);
                this._dataprovider = null;
                this._events(menu).on('item-hover', this._onMenuItemHover, this);
                this._events(menu).on('item-click', this._onMenuItemClick, this);
            }
        },

        'focused' : function(modName, modVal) {
            this._menu.setMod(modName, modVal);
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
        var items = this._menu.getItems().toArray(),
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
        var menu = this._menu;
        return items.map(function(item) {
            return {
                block : 'menu',
                elem : 'item',
                mix : 'i-bem',
                elemMods : {
                    theme : menu.getMod('theme'),
                    disabled : menu.getMod('disabled')
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
        this._emit('item-hover', data);
    },

    _onMenuItemClick : function(e, data) {
        this._emit('item-click', data);
    },

    _onProviderGotData : function(e, data) {

        this
            ._emit('items', data)
            ._updateMenu(data.result);
    },

    _onProviderGotError : function(e, data) {
        // TODO: _onProviderGotError
        this._emit('error', data);
    }
}, {
    lazyInit : true
}));

});
