({
    mustDeps : [
        { block : 'i-bem-dom' },
        { block : 'jquery', elems : 'event', mods : { type : 'pointer' } }
    ],
    shouldDeps : [
        { elems : ['control', 'datalist'] },
        {
            block : 'popup',
            mods : {
                autoclosable : true,
                target : 'anchor'
            }
        },
        { block : 'keyboard', elem : 'codes' }
    ]
})
