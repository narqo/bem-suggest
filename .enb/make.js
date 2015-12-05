var path = require('path'),
    glob = require('glob'),
    techs = require('enb-bem-techs'),
    fileProvider = require('enb/techs/file-provider'),
    fileCopy = require('enb/techs/file-copy'),
    fileMerge = require('enb/techs/file-merge'),
    bemhtml = require('enb-bemxjst/techs/bemhtml'),
    html = require('enb-bemxjst/techs/html-from-bemjson'),
    modules = require('enb-modules/techs/prepend-modules'),
    borschik = require('enb-borschik/techs/borschik'),
    browserJs = require('enb-diverse-js/techs/browser-js'),
    styl = require('enb-stylus/techs/css-stylus-with-autoprefixer'),

    BEMJSON_SUFFIX = '\\.bemjson\\.js$',
    BEMJSON_SUFFIX_RE = new RegExp(BEMJSON_SUFFIX),
    TESTS_PATH_RE = new RegExp('([a-z0-9_-]+)\\.(tests|examples)\\/([a-z0-9_-]+)' + BEMJSON_SUFFIX),
    SPECS_PATH_RE = /(\w+)\.(spec)\.js$/,

    BEMHTML_DEV_MODE = process.env.BEMHTML_ENV === 'development';

module.exports = function(config) {
    createTestsNodes(config);
};

function createTestsNodes(config) {
    glob.sync('blocks/**/*.tests/*.bemjson.js').forEach(bemjsonNodeFactory(config));

    config.nodes('tests/*/*', function(nodeConfig) {
        var tech = techFactory(nodeConfig);

        tech(techs.bemjsonToBemdecl);
        tech(techs.deps);
        tech(techs.files);

        tech(bemhtml, { devMode : BEMHTML_DEV_MODE });
        tech(html);

        tech(techs.depsByTechToBemdecl, {
            target : '?.bemhtml.bemdecl.js',
            sourceTech : 'js',
            destTech : 'bemhtml'
        });
        tech(techs.deps, {
            target : '?.bemhtml.deps.js',
            bemdeclFile : '?.bemhtml.bemdecl.js'
        });
        tech(techs.files, {
            depsFile : '?.bemhtml.deps.js',
            filesTarget : '?.bemhtml.files',
            dirsTarget : '?.bemhtml.dirs'
        });
        tech(bemhtml, {
            target : '?.browser.bemhtml.js',
            filesTarget : '?.bemhtml.files',
            devMode : BEMHTML_DEV_MODE
        });

        tech(browserJs);

        tech(fileMerge, {
            target : '?.pre.js',
            sources : ['?.browser.bemhtml.js', '?.browser.js']
        });

        tech(modules, { source : '?.pre.js', target : '?.js' });

        tech(styl);

        nodeConfig.addTargets(['?.html', '?.css', '?.js']);
    });
}

function techFactory(nodeConfig) {
    return function(tech, opts) {
        nodeConfig.addTech(opts? [tech, opts] : tech);
    };
}

function bemjsonNodeFactory(config) {
    var levels = getLevels(config);

    return function(src) {
        var nodeName = '';
        src.replace(TESTS_PATH_RE, function(_, bemItem, type, name) {
            nodeName = [type, bemItem, name].join(path.sep);
        });

        var nodeLevels = levels.slice();

        try {
            nodeLevels.push(config.resolvePath(src.replace(BEMJSON_SUFFIX_RE, '.blocks')));
        } catch(e) {
            // do nothing?
        }

        config.node(nodeName, function(nodeConfig) {
            var tech = techFactory(nodeConfig),
                srcTarget = resolveSrcTarget(config, nodeConfig, src);

            tech(techs.levels, { levels : nodeLevels });

            tech(fileProvider, { target : srcTarget });
            tech(fileCopy, { sourceTarget : srcTarget, destTarget : '?.bemjson.js' });
        });
    };
}

function resolveSrcTarget(config, nodeConfig, src) {
    return path.relative(nodeConfig.getNodePath(), config.resolvePath(src));
}

function getLevels(config) {
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

function getSpecLevels(config) {
    return [
        'libs/bem-pr/spec.blocks',
        'libs/bem-core/common.blocks',
        'libs/bem-core/desktop.blocks',
        'blocks'
    ];
}
