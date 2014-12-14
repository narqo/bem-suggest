({ block : 'page',
    title : 'Suggest: Simple example',
    mods : { theme : 'islands' },
    head : [
        { elem : 'css', url : 'simple.css' },
        { elem : 'js', url : 'simple.js' }
    ],
    content : {
        block : 'test',
        js : true,
        content : [
            { block : 'suggest',
                mods : { theme : 'islands', size : 'm' },
                val : 'Asia',
                items : [
                    { val : 'Asia/Kabul' },
                    { val : 'Europe/Mariehamn' },
                    { val : 'Europe/Tirane' },
                    { val : 'Africa/Algiers' },
                    { val : 'Pacific/Pago_Pago' },
                    { val : 'Europe/Andorra' },
                    { val : 'Africa/Luanda' }
                ]
            },
            '<br/><br/>',
            { block : 'suggest',
                mods : { theme : 'islands', size : 'm', 'has-dataprovider' : true }
            }
        ]
    }
})
