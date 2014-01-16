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
        triggerEvent = core.triggerEvent,
        findControl = core.findControl,
        createDom = dom.create,
        removeDom = dom.remove,
        getParent = dom.getParent,
        getPosition = dom.getPosition,
        first = dom.first,
        last = dom.last,
        moveElements = dom.moveElements,
        getStyle = dom.getStyle,
        setStyle = dom.setStyle,
        toNumber = util.toNumber,
        extend = util.extend,
        blank = util.blank,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_INPUT_CONTROL = ui.InputControl,
        UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype,
        UI_ITEM = ui.Item,
        UI_ITEM_CLASS = UI_ITEM.prototype,
        UI_ITEMS = ui.Items;

    var UI_DROP_MENU = ui.DropMenu = inheritsControl(
            UI_CONTROL,
            "ui-drop-menu",
            function (el, options) {
                var type = this.getTypes()[0],
                    o = createDom(type + "-items", "display:none; position:absolute;z-index:65534;", "div");
                el.style.display = "inline-block";
                el.style.position = "relative";
                el.style.overflow = "hidden";
                options.resizable = false; 
                moveElements(el, o, true);
                el.appendChild(createDom(type + "-label", "overflow:hidden", "div"));
                (first(o).tagName.toUpperCase() == "LABEL") && first(el).appendChild(first(o));
                first(el).appendChild(createDom(type + "-img", "display:inline-block", "span"));
                first(el).appendChild(createDom("", "border:0px none; display:none", "input"));
                el.appendChild(o);
                return el;
            },
            function (el, options) {
                var type = this.getTypes()[0];
                this._sAlign = (options.align === "left" ? "left" : "right");
                this._uInput = $fastCreate(this.Input, first(el), this, {});
                this._uOptions = $fastCreate(
                    this.Options,
                    removeDom(last(el)),
                    this,
                    {}
                );
                this.$setBody(this._uOptions.getBody());
                options.width && (el.style.width = options.width);
                options.height ? el.style.height = options.height : el.style.height = "20px";
                options.width && (first(el).style.width = options.width);
                options.height ? first(el).style.height = options.height : first(el).style.height = "20px";
                options.height ? first(first(el)).style.lineHeight = options.height : first(first(el)).style.lineHeight = "20px";
                this.$initItems();
            }
        ),
        UI_DROP_MENU_CLASS = UI_DROP_MENU.prototype;

        UI_DROP_MENU_OPTIONS_CLASS = (UI_DROP_MENU_CLASS.Options = inheritsControl(UI_CONTROL)).prototype;
        UI_DROP_MENU_INPUT_CLASS = (UI_DROP_MENU_CLASS.Input = inheritsControl(UI_INPUT_CONTROL)).prototype;

        UI_DROP_MENU_ITEM_CLASS =
            (UI_DROP_MENU_CLASS.Item = inheritsControl(
                UI_ITEM,
                null,
                null,
                function (el, options) {
                    this._sInfo = {};
                    extend(this._sInfo, options);
                }
            )).prototype;

        UI_DROP_MENU_CLASS.$alterItems = blank;

        UI_DROP_MENU_CLASS.$mouseover = function () {
            this.alterClass("+hover");
            this._uOptions.show();
        };

        UI_DROP_MENU_CLASS.$mouseout = function () {
            this.alterClass("-hover");
            this._uOptions.hide();
        };

        UI_DROP_MENU_ITEM_CLASS.$dispose = function () {
            this._sInfo = null;
            UI_CONTROL_CLASS.$dispose.call(this);
        };

        extend(UI_DROP_MENU_CLASS, UI_ITEMS);

        /*
        UI_DROP_MENU_INPUT_CLASS.$activate = function (event) {
            UI_CONTROL_CLASS.$focus.call(this.getParent(), event);
            UI_INPUT_CONTROL_CLASS.$activate.call(this, event);
            this.getParent()._uOptions.show();
        };

        UI_DROP_MENU_INPUT_CLASS.$blur = function (event) {
            UI_INPUT_CONTROL_CLASS.$blur.call(this, event);
            this.getParent()._uOptions.hide();
            triggerEvent(this.getParent(), "blur");
        };
        */

        UI_DROP_MENU_OPTIONS_CLASS.show = function () {
            var el = this.getOuter();
            if (!getParent(el)) {
                document.body.appendChild(el);
            }
            UI_CONTROL_CLASS.show.call(this);

            var par = this.getParent(),
                offsetPar = el.offsetParent,
                pos = getPosition(par.getOuter()),
                offsetParPos = getPosition(offsetPar);
                w = pos.left,
                h = par.getOuter().offsetHeight + pos.top;
            if (par._sAlign && par._sAlign == "right") {
                w = w + par.getOuter().offsetWidth - this.getOuter().offsetWidth;
            }
            w = w - offsetParPos.left;
            h = h - offsetParPos.top;
            
            this.setPosition(w, h);
        };

        UI_DROP_MENU_CLASS.$setSize = function () {
            var el = this.getOuter();

            this.$locate();

            setStyle(first(first(el)), 'width', toNumber(getStyle(el, 'width')) - 10 + 'px');
            UI_CONTROL_CLASS.$setSize.call(this);
        };
})();
