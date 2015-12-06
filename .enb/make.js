var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    mkdirp = require('mkdirp'),
    techs = require('enb-bem-techs'),
    fileCopy = require('enb/techs/file-copy'),
    fileMerge = require('enb/techs/file-merge'),
    fileProvider = require('enb/techs/file-provider'),
    stylus = require('enb-stylus/techs/stylus'),
    bemhtml = require('enb-bemxjst/techs/bemhtml'),
    bh = require('enb-bh/techs/bh-commonjs'),
    bemjsonToHtml = require('enb-bemxjst/techs/bemjson-to-html'),
    //bemjsonToHtml = require('enb-bh/techs/bemjson-to-html'),
    browserJs = require('enb-js/techs/browser-js'),
    borschik = require('enb-borschik/techs/borschik');

const TESTS_PATH_RE = /(\w[a-z0-2_-]+)\.(tests|examples)\/(\w+)\.bemjson\.js$/,
    BEMHTML_DEV_MODE = process.env.BEMHTML_ENV === 'development';

module.exports = function(config) {
    createTestsNodes(config);
};

function createTestsNodes(config) {
    glob.sync('blocks/**/*.tests/*.bemjson.js').forEach(bemjsonNodeFactory(config));

    config.nodes('tests/*/*', function(nodeConfig) {
        nodeConfig.addTechs([
            [techs.bemjsonToBemdecl],
            [techs.deps],
            [techs.files],

            [bemhtml, { devMode : BEMHTML_DEV_MODE }],
            [bh, {
                bhOptions : { jsAttrName : 'data-bem', jsAttrScheme : 'json' }
            }],
            [bemjsonToHtml],

            // FIXME: generated sourcemaps work incorrectly – generated paths aren't served by enb server
            [browserJs, { includeYM : true/*, sourcemap : true */}],

            [techs.depsByTechToBemdecl, {
                target : '?.bemhtml.bemdecl.js',
                sourceTech : 'js',
                destTech : 'bemhtml'
            }],
            [techs.deps, {
                target : '?.bemhtml.deps.js',
                bemdeclFile : '?.bemhtml.bemdecl.js'
            }],
            [techs.files, {
                depsFile : '?.bemhtml.deps.js',
                filesTarget : '?.bemhtml.files',
                dirsTarget : '?.bemhtml.dirs'
            }],
            [bemhtml, {
                target : '?.browser.bemhtml.js',
                filesTarget : '?.bemhtml.files',
                devMode : BEMHTML_DEV_MODE
            }],

            [fileMerge, {
                target : '?.js',
                sources : ['?.browser.js', '?.browser.bemhtml.js']
            }],

            [stylus]
        ]);

        nodeConfig.addTargets(['?.html', '?.css', '?.js']);
    });
}

function bemjsonNodeFactory(config) {
    var levels = getLevels();

    return function(src) {
        var nodeName, nodePath;

        src.replace(TESTS_PATH_RE, function(_, bemItem, type, name) {
            nodeName = [ type, bemItem, name ].join(path.sep);
            nodePath = config.resolvePath(nodeName);
            fs.existsSync(nodePath) || mkdirp.sync(nodePath);
        });

        var srcLevel = config.resolvePath(src.replace(/bemjson\.js$/, 'blocks'));

        config.node(nodeName, function(nodeConfig) {
            var destDir = nodeConfig.getNodePath(),
                srcTarget = resolveSrcTarget(config, src, destDir),
                levels = getLevels(config);

            fs.existsSync(srcLevel) && (levels = levels.concat(srcLevel));

            nodeConfig.addTechs([
                [techs.levels, { levels : levels }],

                [fileProvider, { target : srcTarget }],
                [fileCopy, { sourceTarget : srcTarget, destTarget : '?.bemjson.js' }]
            ]);
        });
    };
}

function resolveSrcTarget(config, src, dest) {
    return path.relative(dest, config.resolvePath(src));
}

function getLevels() {
    return [
        'libs/bem-core/common.blocks',
        'libs/bem-core/desktop.blocks',
        'libs/bem-components/common.blocks',
        'libs/bem-components/design/common.blocks',
        'libs/bem-components/desktop.blocks',
        'libs/bem-components/design/desktop.blocks',
        'blocks'
    ];
}

function getSpecLevels() {
    return [
        'libs/bem-pr/spec.blocks',
        'libs/bem-core/common.blocks',
        'libs/bem-core/desktop.blocks',
        'blocks'
    ];
}
