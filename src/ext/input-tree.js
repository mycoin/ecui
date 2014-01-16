/**
 * input tree
 * Copyright 2012 Baidu Inc. All rights reserved.
<span ecui="id:queryPos;textLength:25; type:input-tree;asyn:true;multi:false;name:posId;placeHolder:请选择" >
    <div ecui="value:-1">全部部门</div>
</span>
 * path:    input-tree.js
 * desc:    树层级输入框
 * author:  cxl(chenxinle@baidu.com)
 * date:    2012/03/12
 */
(function() {
    var core = ecui,
        array = core.array,
        dom = core.dom,
        ui = core.ui,
        util = core.util,
        string = core.string,

        $fastCreate = core.$fastCreate,
        setFocused = core.setFocused,
        disposeControl = core.dispose,
        createDom = dom.create,
        children = dom.children,
        moveElements = dom.moveElements,
        getPosition = dom.getPosition,
        inheritsControl = core.inherits,
        getView = util.getView,
        extend = util.extend,
        blank = util.blank,
        triggerEvent = core.triggerEvent,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_BUTTON = ui.Button,
        UI_BUTTON_CLASS = UI_BUTTON.prototype,
        UI_CHECKBOX = ui.Checkbox,
        UI_LABEL = ui.Label,
        UI_INPUT_CONTROL = ui.InputControl,
        UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype,

        UI_INPUT_TREE = ui.InputTree = inheritsControl(
        UI_INPUT_CONTROL,
            'ui-input-tree',

        function(el, options) {
            var type = this.getTypes()[0],
                o = createDom();

            // 添加岗位树筛选功能 modify by caijuan@baidu.com
            o.innerHTML = '<div class="' + type + '-layer" ' + ' style="position:absolute;display:none; z-index:65535; height:230px; width:250px">'
                + '<div class="' + UI_DATA_TREE.types[0] + '"></div></div>';
            o = o.firstChild;

            moveElements(el, o.lastChild, true);
            options._eLayer = document.body.appendChild(o);
            el.innerHTML = '<span class="' + type + '-text"></span><span class="' + type + '-cancel"></span><span class="' + type + '-button"></span><input type="hidden" name="' + options.name + '" />';

            options.hidden = true;
            if (options.value) {
                options.value += '';
            }
        },

        function(el, options) {
            var childs;

            if (options.value) {
                UI_INPUT_CONTROL_CLASS.setValue.call(this, options.value);
            }

            childs = children(el);

            this._filter = options.filterTree ? {  // 添加岗位树筛选功能 modify by caijuan@baidu.com
                checked: options.filterChecked,
                label: options.filterLabel,
                className: options.filterClass
            } : null;
            this._multi = options.multi || false;
            this._placeHolder = options.placeHolder || "请选择";
            this._textLength = options.textLength || 15;
            this._eText = childs[0];
            this._uCancel = $fastCreate(this.Cancel, childs[1], this);
            this._uLayer = $fastCreate(this.Layer, options._eLayer, this, {
                asyn: options.asyn,
                multi: this._multi,
                filter: this._filter
            });
            options._eLayer = null;
            delete options._eLayer;

            if (options.hideCancel === true) {
                this._bHideCancel = true;
                this._uCancel.$hide();
            }
        }),

        UI_INPUT_TREE_CLASS = UI_INPUT_TREE.prototype,

        UI_INPUT_TREE_LAYER = UI_INPUT_TREE_CLASS.Layer = inheritsControl(
        UI_CONTROL,
            'ui-input-tree-layer',
        null,

        function(el, options) {
            el.style.position = 'absolute';

            // 添加岗位树筛选功能 modify by caijuan@baidu.com
            var tree = el.firstChild;
            if (options.filter) {
                var filter = createDom(UI_INPUT_TREE_LAYER_FILTER.types[0]);
                this._uFilter = $fastCreate(UI_INPUT_TREE_LAYER_FILTER, filter, this, options.filter);
                dom.insertBefore(filter, tree);
            }
            this._uTree = $fastCreate(this.Tree, tree, this, {
                collapsed: true,
                asyn: options.asyn,
                multi: options.multi
            });
        }),
        UI_INPUT_TREE_LAYER_CLASS = UI_INPUT_TREE_LAYER.prototype,

        UI_DATA_TREE = ui.DataTree,

        UI_INPUT_TREE_CANCEL_CLASS = (UI_INPUT_TREE_CLASS.Cancel = inheritsControl(UI_CONTROL)).prototype,

        UI_INPUT_TREE_LAYER_FILTER = UI_INPUT_TREE_LAYER_CLASS.Filter = inheritsControl(
            UI_CONTROL,
            'ui-data-tree-filter',
            function(el, options) {
                options.checked = options.checked || false;
                options.label = options.label || '隐藏';
                options.className = options.className || 'ui-filter-item';
                el.innerHTML = '<div class="' + UI_CHECKBOX.types[0] + '"></div>'
                    + '<label class="' + UI_LABEL.types[0] + '">' + options.label + '</label>';
            },
            function(el, options) {
                this._uFilterCheckbox = $fastCreate(UI_CHECKBOX, el.firstChild, this, {
                    'id': 'treeLayerFilterCheckbox'
                });
                this._uFilterLabel = $fastCreate(UI_LABEL, el.lastChild, this, {
                    'for': 'treeLayerFilterCheckbox'
                });

                this._sFilterClass = options.className;
                this._bFilter = options.checked;
                this._uFilterCheckbox.setChecked(this._bFilter);
            }
        ),
        UI_INPUT_TREE_LAYER_FILTER_CLASS = UI_INPUT_TREE_LAYER_FILTER.prototype,

        UI_INPUT_TREE_LAYER_TREE = UI_INPUT_TREE_LAYER_CLASS.Tree = inheritsControl(
        UI_DATA_TREE,
        null,
        null,

        function(el, options) {
            this._bAsyn = options.asyn;
            if (options.asyn && this._aChildren.length <= 0) {
                this.add('Loadding', null);
                this.collapse();
                this._bNeedAsyn = true;
            }
        }),
        UI_INPUT_TREE_LAYER_TREE_CLASS = UI_INPUT_TREE_LAYER_TREE.prototype;

    function UI_INPUT_TREE_FLUSH(con) {
        if (con.getValue() == '') {
            con._uCancel.hide();
        } else if (!con._bHideCancel) {
            con._uCancel.show();
        }
    }

    UI_INPUT_TREE_CLASS.$activate = function() {
        this._uLayer.show();
    }

    //@liuronghan
    UI_INPUT_TREE_CLASS.load = function (data) {
        var context = this._uLayer._uTree;
        var argument = [].slice.call(arguments, 0);
        return context.load.apply(context, argument);
    };

    //@liuronghan 广度遍历
    UI_INPUT_TREE_CLASS.breadthTraversal = function (callback) {
        var tree = this.getLayer().getTree();
        
        var fire = function () {
            var children = this.getChildren();
            if(children.length > 0) {
                for(var i = 0; i < children.length; i ++) {
                    arguments.callee.call(children[i]);
                }
            }
            callback.call(this, this.getValue() || '', !!children.length);       
        }
        fire.call(tree);
    }

    UI_INPUT_TREE_CLASS.init = function() {
        var value = this.getValue();

        this.setValue(value);
        this._uLayer.init();
        UI_INPUT_CONTROL_CLASS.init.call(this);
    };

    UI_INPUT_TREE_CLASS.$setText = function(value) {
        if (value && value.length > this._textLength) {
            value = value.substring(0, this._textLength) + '...';
        }
        if (value == "") {
            value = '<span class="' + this.getTypes()[0] + '-placeholder">' + this._placeHolder + '</span>'
        }

        this._eText.innerHTML = value;
    };

    UI_INPUT_TREE_CLASS.setValue = function(value) {
        var tree = this._uLayer._uTree;

        UI_INPUT_CONTROL_CLASS.setValue.call(this, value);
        tree.clearSelected();
        tree.setValues([value]);
        this.$setText(tree.getSelectedText());
        UI_INPUT_TREE_FLUSH(this);
    };

    UI_INPUT_TREE_CLASS.clear = function() {
        var tree = this._uLayer._uTree;

        tree.clearSelected();
        UI_INPUT_CONTROL_CLASS.setValue.call(this, '');
        this.$setText('');
        UI_INPUT_TREE_FLUSH(this);
    }

    /**
     * 重新收起input-tree,清理用户操作痕迹
     * @public
     */
    UI_INPUT_TREE_CLASS.clearState = function() {
        var tree = this._uLayer._uTree;
        collapseTree(tree);

        function collapseTree(tree) {
            tree.collapse();
            var children = tree.getChildren();
            if (children && children.length) {
                for (var i = 0; i < children.length; i++) {
                    collapseTree(children[i]);
                }
            }
        }
    };

    /**
     * 根据value获取树中的节点
     * @public
     * @param {string} value
     */
    UI_INPUT_TREE_CLASS.getTreeNodeByValue = function(value) {
        return this._uLayer.getTreeNodeByValue(value);
    };

    /**
     * 设置输入文本框的值
     * @public
     * @param {string} text
     */
    UI_INPUT_TREE_CLASS.setText = function(text) {
        this.$setText(text);
    };
    UI_INPUT_TREE_CLASS.getLayer = function() {
        return this._uLayer;
    };

    UI_INPUT_TREE_CLASS.expand = function(value, callback) {
        var me = this;
        this._uLayer.expand(value, function() {
            callback.call(me);
        });
    }

    UI_INPUT_TREE_CLASS.selectParent = function(value) {
        var node = this._uLayer.getTreeNodeByValue(value);

        if (node != node.getRoot()) {
            node = node.getParent();
        }

        this.setValue(node.getValue());
    }

    UI_INPUT_TREE_LAYER_CLASS.init = function() {
        var par;
        this._uTree.init();
        UI_CONTROL_CLASS.init.call(this);

        this.onhide = function() {
            if (par = this.getParent()) {
                //onchange
                return triggerEvent(par, "change", null, [par.getValue(), par]);
            }
        }
    }

    UI_INPUT_TREE_LAYER_CLASS.$blur = function() {
        this.hide();
    }

    UI_INPUT_TREE_LAYER_CLASS.expand = function(value, callback) {
        var tree = this._uTree,
            node = tree.getItemByValue(value);
        if (node) {
            node.expand();
            tree.onexpand(node, callback);
        }
    }

    UI_INPUT_TREE_LAYER_CLASS.getTreeNodeByValue = function(value) {
        return this._uTree.getItemByValue(value);
    }

    UI_INPUT_TREE_LAYER_CLASS.getTree = function () {
        return this._uTree;
    }

    UI_INPUT_TREE_LAYER_CLASS.show = function() {
        var par = this.getParent(),
            pos, o, view;

        UI_CONTROL_CLASS.show.call(this);

        if (par) {
            pos = getPosition(par.getOuter());
            view = getView();
            o = pos.top;
            /*
            if (o + par.getHeight() + this.getHeight() > view.bottom) {
                if (o - view.top > this.getHeight()) {
                    pos.top = o - this.getHeight();
                }
            }
            else {
                pos.top = o + par.getHeight();
            }
            */

            pos.top = o + par.getHeight();

            o = pos.left;
            if (o + this.getWidth() > view.right) {
                pos.left = o + par.getWidth() - this.getWidth();
            } else {
                pos.left = o;
            }
            this.setPosition(pos.left, pos.top);
            setFocused(this);
        }
    }

    UI_INPUT_TREE_CANCEL_CLASS.$click = function() {
        var par = this.getParent();
        UI_CONTROL_CLASS.$click.call(this);

        par.$setText('');
        UI_INPUT_CONTROL_CLASS.setValue.call(par, '');
        par._uLayer._uTree.clearSelected();
        UI_INPUT_TREE_FLUSH(par);
    }

    UI_INPUT_TREE_CANCEL_CLASS.$activate = UI_BUTTON_CLASS.$activate;

    UI_INPUT_TREE_LAYER_FILTER_CLASS.$click = function () {
        var checked = this._uFilterCheckbox.isChecked();
        if (checked != this._bFilter) {
            this._bFilter = checked;
            this.$filterTree();
        }
    };
    UI_INPUT_TREE_LAYER_FILTER_CLASS.$filterTree = function () {
        var display = !this._bFilter;
        var className = this._sFilterClass;
        var tree = this.getParent()._uTree;
        UI_INPUT_TREE_LAYER_FILTER.$setNodeStatus(tree, display, className);
    };
    UI_INPUT_TREE_LAYER_FILTER_CLASS.filterNode = function (node) {
        UI_INPUT_TREE_LAYER_FILTER.$setNodeStatus(node, false, this._sFilterClass);
    };
    UI_INPUT_TREE_LAYER_FILTER.$setNodeStatus = function (node, display, className) {
        var children = node.getChildren();   // TODO: 性能问题？！
        if (children && children.length) {
            for (var i = 0; i < children.length; i++) {
                UI_INPUT_TREE_LAYER_FILTER.$setNodeStatus(children[i], display, className);
            }
        }
        var domClass = node.getMain().className;
        if (domClass.indexOf(className) >= 0) {
            display ? node.show() : node.hide();
        }
    };

    UI_INPUT_TREE_LAYER_TREE_CLASS.onselect = function(con, added) {
        var superObj = this.getParent().getParent();
        var tree = this.getParent()._uTree;
        var conValue = con.getValue();
        var conText = con.getText();
        // 如果是多选
        if (superObj._multi) {
            var inputValue = tree.getSelectedValues().join(',');
            UI_INPUT_CONTROL_CLASS.setValue.call(superObj, inputValue);

            superObj.$setText(tree.getSelectedText());
        } else {
            UI_INPUT_CONTROL_CLASS.setValue.call(superObj, conValue);
            superObj.$setText(conText);
            this.getParent().hide();
        }
        UI_INPUT_TREE_FLUSH(superObj);
    };

    UI_INPUT_TREE_LAYER_TREE_CLASS.onexpand = function(item, callback) {
        var superObj = this.getParent().getParent(),
            callback = callback || blank;

        var layer = superObj._uLayer.getOuter(),
            scrollHeight = layer.scrollTop;
        var setScroll = function() {
            layer.scrollTop = scrollHeight;
            layer = null;
        };
        var uFilter = superObj._uLayer._uFilter;
        if (item._bNeedAsyn) {
            triggerEvent(superObj, 'loadtree', null, [item.getValue(), function(data) {
                item.load(data);
                callback.call(null);
                if (uFilter && uFilter._bFilter) {  // 添加岗位树筛选功能 modify by caijuan@baidu.com
                    uFilter.filterNode(item);
                }
                setScroll();
            }]);
            item._bNeedAsyn = false;
        } else {
            callback.call(null);
            setScroll();
        }
    }

    UI_INPUT_TREE_LAYER_TREE_CLASS.load = function(datasource) {
        var i, item, text;

        for (i = 0; item = this._aChildren[i]; i++) {
            disposeControl(item);
        }
        this._aChildren = [];
        this._eChildren.innerHTML = '';

        for (i = 0; item = datasource[i]; i++) {
            text = item.text;
            item = extend({
                asyn: this._bAsyn
            }, item);
            delete item.text;
            this.add(text, null, item).init();
        }

        if (!datasource || datasource.length <= 0) {
            this.setClass(this.getPrimary());
        }
    };

})();