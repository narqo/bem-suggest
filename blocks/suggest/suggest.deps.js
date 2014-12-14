[{
    mustDeps : { block : 'i-bem', elems : 'dom' },
    shouldDeps : [
        { elems : 'menu' },
        {
            block : 'popup',
            mods : {
                autoclosable : true,
                target : 'anchor'
            }
        },
        { block : 'keyboard', elem : 'codes' }
    ]
},
{
    tech : 'js',
    mustDeps : { block : 'menu-item', tech : 'bemhtml' }
}]
