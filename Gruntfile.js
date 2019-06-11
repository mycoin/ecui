/*
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * author:  mycoin (nqliujiangtao@gmail.com)
 * date:    2013/12/14
 * resp:    https://github.com/mycoin/ecui/
 */
module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    // 初始化配置
    grunt.initConfig({
        'concat': {
            options: {
                banner: '/*Copyright 2014 Baidu Inc. All rights reserved.*/'
            },
            'js': {
                files: {
                    'dist/ecui.js': [
                        "src/js/ecui.js",
                        "src/js/adapter.js",
                        "src/js/core.js",
                        "src/js/control.js",
                        "src/js/input-control.js",
                        "src/js/button.js",
                        "src/js/scrollbar.js",
                        "src/js/panel.js",
                        "src/js/items.js",
                        "src/js/checkbox.js",
                        "src/js/radio.js",
                        "src/js/select.js",
                        "src/js/label.js",
                        "src/js/form.js",
                        "src/js/tree-view.js",
                        "src/js/month-view.js",
                        "src/js/table.js",
                        "src/js/popup-menu.js",
                        "src/js/locked-table.js",
                        "src/js/messagebox.js"
                    ],

                    'dist/ecui-ext.js': [
                        "src/js/ext/input.js",
                        "src/js/ext/pager.js",
                        "src/js/ext/calendar.js",
                        "src/js/ext/custom-checkboxs.js",
                        "src/js/ext/data-tree.js",
                        "src/js/ext/lite-table.js",
                        "src/js/ext/multi-select.js",
                        "src/js/ext/pop.js",
                        "src/js/ext/query-tab.js",
                        "src/js/ext/tip.js"
                    ]
                }
            },
            'css': {
                files: {
                    'dist/ecui.css': [
                        "src/css/ui-button.css",
                        "src/css/ui-input.css",
                        "src/css/ui-scrollbar.css",
                        "src/css/ui-select.css",
                        "src/css/ui-checkbox.css",
                        "src/css/ui-radio.css",
                        "src/css/ui-form.css",
                        "src/css/ui-table.css",
                        "src/css/ui-treeview.css",
                        "src/css/ui-calendar.css",
                        "src/css/ui-pop.css",
                        "src/css/ui-messagebox.css",
                        "src/css/ui-pager.css",
                        "src/css/ui-query-tab.css",
                        "src/css/ui-multi-select.css",
                        "src/css/ui-area.css",
                        "src/css/ui-data-tree.css",
                        "src/css/ui-input-tree.css",
                        "src/css/ui-tip.css",
                        "src/css/ui-account-tree.css",
                        "src/css/ui-idea-editor.css",
                        "src/css/ui-custom.css",
                        "src/css/ui-message-bar.css",
                        "src/css/ui-suggest.css",
                    ]

                }
            }
        },
        'uglify': {
            'release': {
                files: {
                    'dist/ecui.min.js': ['dist/ecui.js'],
                    'dist/ecui-ext.min.js': ['dist/ecui-ext.js']
                }
            }
        },

        // 复制二进制
        'copy': {
            'release': {
                files: [{
                    expand: true,
                    cwd: 'src/css',
                    src: [
                        'img/**',
                    ],
                    dest: 'dist/'
                }]
            }
        },

        'php': {
            server: {
                options: {
                    port: 8080,
                    hostname: require('os').hostname(),
                    base: '.',
                    keepalive: true,
                    open: false,
                    bin: 'php'
                }
            }
        },

        'watch': {
            options: {
                interval: 300,
                event: ['added', 'changed', 'deleted'],
                livereload: true,
                debounceDelay: 500
            },

            'live': {
                options: {
                    livereload: 8081,
                },

                files: [
                    'dist/{,*/}*.js',
                    'dist/{,*/}*.css',
                ]
            },

            'css': {
                files: [
                    'src/css/ui-*.css',
                ],
                tasks: ['concat:css']
            },

            'js': {
                files: [
                    'src/js/*.js',
                    'src/js/ext/*.js'
                ],
                tasks: ['concat:js']
            }
        },
    });

    grunt.registerTask('default', function() {
        grunt.log.subhead('Please use one of the following commands:');
        grunt.log.writeln('');
        grunt.log.writeln('• grunt server  启动PHP服务器.');
        grunt.log.writeln('• grunt watch   监视源并自动编译.');
        grunt.log.writeln('• grunt build   基础编译.');

        grunt.log.writeln('\n\nsee all tasks `grunt --verbose`');
    });

    // 启动静态服务器
    grunt.registerTask('server', [
        'build',
        'php',
        'watch'
    ]);

    // 启动静态服务器
    grunt.registerTask('build', [
        'concat',
        'uglify',
        'copy'
    ]);
}