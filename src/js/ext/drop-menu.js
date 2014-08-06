/**
 * drop-menu
 * Copyright 2012 Baidu Inc. All rights reserved
 *
 * desc: 可配置左对齐和右对齐的下拉菜单
 * author: hades(denghongqi@baidu.com)
 */

(function () {
    var core = ecui,
        ui = core.ui,
        dom = core.dom,
        string = core.string,
        util = core.util,

        $fastCreate = core.$fastCreate,
        inheritsControl = core.inherits,
        setFocused = core.setFocused,
        triggerEvent = core.triggerEvent,
        intercept = core.intercept,
        restore = core.restore,
        mask = core.mask,
        getParent = dom.getParent,
        getPosition = dom.getPosition,
        getStyle = dom.getStyle,
        setStyle = dom.setStyle,
        toNumber = util.toNumber,
        blank = util.blank,

        DOCUMENT = document,
        MIN = Math.min,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_INPUT_CONTROL = ui.InputControl,
        UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype,
        UI_SELECT = ui.Select,
        UI_SELECT_CLASS = UI_SELECT.prototype,

        UI_DROP_MENU = ui.DropMenu = inheritsControl(
            UI_SELECT,
            'ui-drop-menu',
            function (el, options) {
                options.hScroll = options.hScroll === true;
                options.vScroll = options.vScroll === true;
                options.optionSize = options.optionSize || 50;
            },
            function (el, options) {
                this._bLabel = options.label === true;
                this._sText = options.text || '';

                this._bLabel && this._uText.setContent(this._sText);
            }
        ),
        UI_DROP_MENU_CLASS = UI_DROP_MENU.prototype;

    var UI_DROP_MENU_OPTIONS_CLASS = (UI_DROP_MENU_CLASS.Options = inheritsControl(UI_CONTROL)).prototype;

    function UI_DROP_MENU_FLUSH (control) {
        var options = control._uOptions,
            el = options.getOuter(),
            pos = getPosition(control.getOuter()),
            selected = control._cSelected,
            optionTop = pos.top + control.getHeight();

        if (!getParent(el)) {
            DOCUMENT.body.appendChild(el);
            control.cache(false, true);
            control.$alterItems();
        }

        options.clearCache();

        if (options.isShow()) {
            if (selected) {
                setFocused(selected);
            }

            options.setPosition(pos.left + control.getWidth() - options.getWidth() + toNumber(getStyle(el, 'borderRightWidth')), optionTop);
        }
    };

    /**
     * 改变下拉框当前选中的项。
     * @private
     *
     * @param {ecui.ui.DropMenu} control 下拉框控件
     * @param {ecui.ui.DropMenu.Item} item 新选中的项
     */
    function UI_DROP_MENU_CHANGE_SELECTED(control, item) {
        if (item !== control._cSelected) {
            if (!control._bLabel) {
                control._uText.setContent(item ? item.getBody().innerHTML : '');
            }
            UI_INPUT_CONTROL_CLASS.setValue.call(control, item ? item._sValue : '');
            control._cSelected = item;
            if (control._uOptions.isShow()) {
                setFocused(item);
            }
        }
    }

    UI_DROP_MENU_CLASS.$mouseover = function (event) {
        triggerEvent(this, 'activate', event);
        UI_SELECT_CLASS.$mouseover.call(this);
    };

    UI_DROP_MENU_CLASS.$mouseout = function (event) {
        this._uOptions.hide();
        triggerEvent(this, 'deactivate');
        UI_SELECT_CLASS.$mouseout.call(this);
    };

    UI_DROP_MENU_CLASS.$activate = function (event) {
        UI_INPUT_CONTROL_CLASS.$activate.call(this, event);
        this._uOptions.show();
        // 拦截之后的点击，同时屏蔽所有的控件点击事件
        intercept(this);
        //IE10下会黑屏
        //mask(0, 65534);    
        UI_DROP_MENU_FLUSH(this);
        event.stopPropagation();
    };

    /**
     * 控件在下拉框展开时，需要拦截浏览器的点击事件，如果点击在下拉选项区域，则选中当前项，否则直接隐藏下拉选项框。
     * @override
     */
    UI_DROP_MENU_CLASS.$intercept = function (event) {
        //__transform__control_o
        this._uOptions.hide();
        for (var control = event.getControl(); control; control = control.getParent()) {
            if (control instanceof this.Item) {
                if (control != this._cSelected) {
                    // 检查点击是否在当前下拉框的选项上
                    UI_DROP_MENU_CHANGE_SELECTED(this, control);
                    triggerEvent(this, 'change');
                }
                break;
            }
        }
        event.exit();
    };

    UI_DROP_MENU_CLASS.$setSize = function (width, height) {
        var options = this._uOptions;

        UI_SELECT_CLASS.$setSize.call(this, width, height);

        setStyle(options.getOuter(), 'minWidth', this.getWidth() + 10 + 'px');
    };

    /**
     * 关闭选项框部件时，需要恢复强制拦截的环境。
     * @override
     */
    UI_DROP_MENU_OPTIONS_CLASS.$hide = function () {
        UI_CONTROL_CLASS.$hide.call(this);
        //mask();
        restore();
    };

    /**
     * 选项控件发生变化的处理。
     * 在 选项组接口 中，选项控件发生添加/移除操作时调用此方法。虚方法，子控件必须实现。
     * @protected
     */
    UI_DROP_MENU_CLASS.$alterItems = blank;
}) ();