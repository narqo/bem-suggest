({
    mustDeps : [
        { block : 'i-bem', elems : 'dom' },
        { block : 'jquery', elems : 'event', mods : { type : 'pointer' } }
    ],
    shouldDeps : [
        { elems : ['input', 'datalist'] },
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
