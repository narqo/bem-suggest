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
    bhBundle = require('enb-bh/techs/bh-bundle'),
    bemjsonToHtmlBemhtml = require('enb-bemxjst/techs/bemjson-to-html'),
    bemjsonToHtmlBh = require('enb-bh/techs/bemjson-to-html'),
    browserJs = require('enb-js/techs/browser-js');

const TESTS_PATH_RE = /(\w[a-z0-2_-]+)\.(tests|examples)\/(\w+)\.bemjson\.js$/,
    TMPL_ENGINE_BEMHTML = (process.env.TMPL_ENGINE || 'bemhtml') === 'bemhtml';

module.exports = function(config) {
    createTestsNodes(config);
    createTmplTestsNodes(config);
};

function createTestsNodes(config) {
    glob.sync('blocks/**/*.tests/*.bemjson.js').forEach(bemjsonNodeFactory(config));

    config.nodes('tests/*/*', function(nodeConfig) {
        nodeConfig.addTechs([
            [techs.bemjsonToBemdecl],
            [techs.deps],
            [techs.files],

            [bemhtml, { sourceSuffixes : ['bemhtml', 'bemhtml.js'] }],
            [bh, {
                bhOptions : { jsAttrName : 'data-bem', jsAttrScheme : 'json' },
                mimic : 'BEMHTML'
            }],
            [TMPL_ENGINE_BEMHTML? bemjsonToHtmlBemhtml : bemjsonToHtmlBh],

            // FIXME: generated sourcemaps work incorrectly – generated paths aren't served by enb server
            [browserJs, { includeYM : true }],

            [techs.depsByTechToBemdecl, {
                target : '?.tmpl.bemdecl.js',
                sourceTech : 'js',
                destTech : 'bemhtml'
            }],
            [techs.deps, {
                target : '?.tmpl.deps.js',
                bemdeclFile : '?.tmpl.bemdecl.js'
            }],
            [techs.files, {
                depsFile : '?.tmpl.deps.js',
                filesTarget : '?.tmpl.files',
                dirsTarget : '?.tmpl.dirs'
            }],
            TMPL_ENGINE_BEMHTML?
                [bemhtml, {
                    target : '?.browser.tmpl.js',
                    filesTarget : '?.tmpl.files',
                    sourceSuffixes : ['bemhtml', 'bemhtml.js']
                }] :
                [bhBundle, {
                    target : '?.browser.tmpl.js',
                    filesTarget : '?.tmpl.files',
                    bhOptions : {
                        jsAttrName : 'data-bem',
                        jsAttrScheme : 'json'
                    },
                    mimic : 'BEMHTML'
                }],

            [fileMerge, {
                target : '?.js',
                sources : ['?.browser.js', '?.browser.tmpl.js']
            }],

            [stylus]
        ]);

        nodeConfig.addTargets(['?.html', '?.css', '?.js']);
    });
}

function createTmplTestsNodes(config) {
    config.includeConfig('enb-bem-tmpl-specs');

    var tmplSpecsConfigurator = config
        .module('enb-bem-tmpl-specs')
        .createConfigurator('tmpl-specs');

    tmplSpecsConfigurator.configure({
        destPath : 'tmpl-specs',
        levels : [config.resolvePath('blocks')],
        sourceLevels : getLevels(config),
        engines : {
            bh : {
                tech : 'enb-bh/techs/bh-bundle',
                options : {
                    bhOptions : {
                        jsAttrName : 'data-bem',
                        jsAttrScheme : 'json'
                    },
                    mimic : 'BEMHTML'
                }
            },
            bemhtml : {
                tech : 'enb-bemxjst/techs/bemhtml',
                options : { sourceSuffixes : ['bemhtml', 'bemhtml.js'] }
            }
        }
    });
}

function bemjsonNodeFactory(config) {
    var levels = getLevels();

    return function(src) {
        var nodeName, nodePath;

        src.replace(TESTS_PATH_RE, function(_, bemItem, type, name) {
            nodeName = [type, bemItem, name].join(path.sep);
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
