/**
 * ecui-plus.js
 * Copyright 2012 Baidu Inc. All rights reserved
 *
 * desc: 扩展了ecui的一些基本的功能
 * author: hades(denghongqi@baidu.com)
 */

 (function () {
    var core = ecui,
        ui = core.ui,
        dom = core.dom,
        string = core.string,
        array = core.array,
        util = core.util,
        repaint = core.repaint,
        disposeControl = core.dispose,

        WINDOW = window,

        extend = util.extend,
        attachEvent = util.attachEvent,
        detachEvent = util.detachEvent,
        triggerEvent = core.triggerEvent,
        removeDom = dom.remove,
        moveElements = dom.moveElements,
        getParent = dom.getParent,
        addClass = dom.addClass,
        insertBefore = dom.insertBefore;

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_INPUT_CONTROL = ui.InputControl,
        UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype,
        UI_ITEMS = ui.Items,
        UI_SELECT = ui.Select,
        UI_SELECT_CLASS = UI_SELECT.prototype,
        UI_MULTI_SELECT = ui.MultiSelect,
        UI_MULTI_SELECT_CLASS = UI_MULTI_SELECT.prototype;

    UI_CONTROL_CLASS.$refresh = function (el, options) {
        var type = this.getTypes()[0];
        var key;

        this._bResizable && detachEvent(WINDOW, "resize", repaint);

        //卸载控件内部所有的ecui控件
        for (key in this) {
            if (this[key] instanceof UI_CONTROL) {
                disposeControl(this[key]);
            }
        }

        insertBefore(el, this.getOuter());

        removeDom(this.getOuter());
        //this._bResizable && this.$resize();

        //moveElements(el, this.getOuter(), true);
        //this._eMain = el;
        this.$setBody(el);

        options.uid = this.getUID();
        options.primary = type;
        addClass(el, type);

        this.constructor.agent.client.call(this, this.getOuter(), options);

        this._bCreated = false;
        this.cache(true, true);
        this.init();

        //恢复
        this._bResizable && attachEvent(WINDOW, "resize", repaint);

        if (this._bResizable) {
            this.resize();
            triggerEvent(this, 'sizechange');
        }
    };

    UI_SELECT_CLASS.$refresh = function (el, options) {
        UI_INPUT_CONTROL_CLASS.$refresh.call(this, el, options);
        extend(UI_SELECT_CLASS, UI_ITEMS);
        UI_ITEMS.$initItems.call(this);
        this._uButton.$setSize(20, 20);
    };

    UI_MULTI_SELECT_CLASS.selectAll = function () {
        for (var i = 0, list = this.getItems(), o; o = list[i++]; ) {
            !o._bSelectAllBtn && o.setSelected(true);
        }
    };

    UI_MULTI_SELECT_CLASS.isSelectAll = function () {
        for (var i = 0, list = this.getItems(), o; o = list[i++]; ) {
            if (!o.isSelected()) {
                return false;
            }
        }
        return true;
    };

 }) ();