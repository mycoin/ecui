/**
 * data tree
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    custom-tree.js
 * desc:    工作台项目定制的岗位树控件
 * author:  hades(denghongqi@baidu.com)
 * date:    2012/11
 */

(function () {
    var core = ecui,
        ui = core.ui,
        array = core.array,
        dom = core.dom,
        string = core.string,
        util = core.util,

        inheritsControl = core.inherits,
        $fastCreate = core.$fastCreate,
        getOptions = core.getOptions,
        getMouseX = core.getMouseX,
        triggerEvent = core.triggerEvent,
        getStyle = dom.getStyle,
        createDom = dom.create,
        moveElements = dom.moveElements,
        remove = array.remove,
        toNumber = util.toNumber,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_TREE_VIEW = ui.TreeView,
        UI_TREE_VIEW_CLASS = UI_TREE_VIEW.prototype,

        UI_CUSTOM_TREE = ui.CustomTree = inheritsControl(
            UI_TREE_VIEW,
            'ui-custom-tree',
            function (el, options) {
                this._sValue = options.value || '';
            },
            function (el, options) {
                var type = this.getTypes()[0],
                    o = createDom(type + '-item', '', 'div');

                moveElements(el, o, true);
                el.appendChild(o);

                //继承父节点的multiSelect属性
                this._bMultiSelect = options.multiSelect === true;

                this._aSelected = [];

                this._bEffectParent = options.effectParent === true;

                this._bRootSpecial = options.rootSpecial === true;

                return el;
            }
        ),
        UI_CUSTOM_TREE_CLASS = UI_CUSTOM_TREE.prototype;

    /**
     * 控件点击时改变子树控件的显示/隐藏状态
     * @override
     */
     UI_CUSTOM_TREE_CLASS.$click = function (event) {
        if (event.getControl() == this) {
            UI_CONTROL_CLASS.$click.call(this, event);

            if (getMouseX(this) <= toNumber(getStyle(this.getBody(), 'paddingLeft'))) {
                // 以下使用 event 代替 name
                this[event = this.isCollapsed() ? 'expand' : 'collapse']();
                triggerEvent(this, event);
            }
            else {

                if (this._bSelected) {
                    if (this.getRoot() == this) {
                        this.cancelSelect();
                    }
                    else {
                        this.getParent()._bMultiSelect && this.cancelSelect();
                    }
                }

                else {
                    this.select();
                }
            }
        }
     };

    /**
     * 将当前节点设置为选中，根据父节点的multiSelect属性判断当前的选择逻辑
     * @override
     */

    UI_CUSTOM_TREE_CLASS.select = function () {
        !this._bSelected && this.selectSelf();
        this.selectParent();
        this.selectChildren();
    };

    UI_CUSTOM_TREE_CLASS.selectSelf = function () {
        var parent = this.getParent(),
            root = this.getRoot();

        this._bSelected = true;
        this.alterClass('+selected');
        this._bExpandSelected && this.expand();

        if (root != this) {
            if (parent._bMultiSelect) {
                parent._aSelected = [];
    
                for (var i = 0, o; o = parent._aChildren[i]; i++) {
                    o._bSelected && parent._aSelected.push(o);
                }
            }
            else {
                parent._aSelected[0] && parent._aSelected[0].cancelSelect();
                parent._aSelected[0] = this;
            }
        }
    };

    UI_CUSTOM_TREE_CLASS.selectParent = function () {
        var parent = this.getParent(),
            root = this.getRoot();

        if (this != root && this._bEffectParent) {
            if (root != parent || !this._bRootSpecial) {
                parent.selectSelf();
                parent.selectParent();
            }
        }
    };

    UI_CUSTOM_TREE_CLASS.selectChildren = function () {
        var root = this.getRoot(),
            parent = this.getParent();

        if (this._aChildren && this._aChildren.length) {
            if (this._bMultiSelect) {
                for (var i = 0, o; o = this._aChildren[i]; i++) {
                    o.select();
                }
            }
            else {
                this._aChildren[0].select();
            }
        }
    };

    /**
     * 取消当前节点的选中
     * @public
     */
    UI_CUSTOM_TREE_CLASS.cancelSelect = function () {
        var parent = this.getParent(),
            root = this.getRoot();

        if (root == this) {
        }

        else {
            remove(parent._aSelected, this);
        }

        this._bSelected = false;
        this.alterClass('-selected');

        if (this._aChildren && this._aChildren.length) {
            for (var i = 0, o; o = this._aChildren[i]; i++) {
                o._bSelected && o.cancelSelect();
            }
        }

        if (root._bSelected) {
            root._bSelected = false;
            root.alterClass('-selected');
        }
    };

    /**
     * 选中全部节点
     * @public
     */
    UI_CUSTOM_TREE_CLASS.selectAll = function () {
        var root = this.getRoot();
        root.select();
    };

    /**
     * 获取选中节点的value
     * @public
     */

    UI_CUSTOM_TREE_CLASS.getSelected = function () {
        var root = this.getRoot();
        var selected = [];

        getSelectChildren(root);

        return selected;

        function getSelectChildren (o) {
            o._bSelected && o._sValue && selected.push(o._sValue);
            if (o._aChildren && o._aChildren.length) {
                for (var i = 0, item; item = o._aChildren[i]; i++) {
                    getSelectChildren(item);
                }
            }
        };
    };

    /**
     * 获取选中节点的value
     * @public
     */

    UI_CUSTOM_TREE_CLASS.setSelected = function (selected) {
        var root = this.getRoot();

        setSelectedChildren(root);
        function setSelectedChildren (o) {
            for (var i = 0, item; item = selected[i]; i++) {
                if (item == o._sValue) {
                    o.selectSelf();
                    o.selectParent();
                }
            }
            if (o._aChildren && o._aChildren.length) {
                for (var i = 0, item; item = o._aChildren[i]; i++) {
                    setSelectedChildren(item);
                }
            }
        };
    };

    UI_CUSTOM_TREE_CLASS.isRootSelected = function () {
        var root = this.getRoot();

        if (root._bSelected) {
            return true;
        }
        else {
            return false;
        }
    };
}) ();