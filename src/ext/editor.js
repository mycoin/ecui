/**
 * ecui-ext 
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    editor.js
 * desc:    控件编辑器
 * author:  cxl(chenxinle@baidu.com)
 * date:    2012/07/16
 */
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,
        string = core.string,
        ext = core.ext,

        $fastCreate = core.$fastCreate,
        addEventListener = core.addEventListener,
        setFocused = core.setFocused,
        createDom = dom.create,
        children = dom.children,
        moveElements = dom.moveElements,
        getPosition  = dom.getPosition,
        inheritsControl = core.inherits,
        getView = util.getView,
        triggerEvent = core.triggerEvent,
        trim = string.trim,
        getByteLength = string.getByteLength,
        encodeHTML = string.encodeHTML,
        blank = util.blank,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;

    var UI_EDITOR_LAYER = ui.EditorLayer = 
        inheritsControl(
            UI_CONTROL,
            'ui-editor-layer',
            function(el, options) {
                var type = this.getTypes()[0],
                    o = createDom(),
                    htmls = [];

                htmls.push('<div class="' + type + '-content"></div>');
                htmls.push('<div class="'+ type +'-buttons"><span class="ui-button ui-button-g">确定</span><span class="ui-button">取消</span><span class="'+ type +'-error"></span></div>');
                o.innerHTML = htmls.join('');
                moveElements(el, o.firstChild, true);
                moveElements(o, el, true);
            },
            function (el, options) {
                this.$setBody(el.firstChild);
                el = children(el.lastChild);
                this._uSubmitBtn = $fastCreate(this.Button, el[0], this, {command: 'submit'});
                this._uCancelBtn = $fastCreate(this.Button, el[1], this, {command: 'cancel'});
                this._eError = el[2];
                this.$hide();
            }
        ),
        UI_EDITOR_LAYER_CLASS = UI_EDITOR_LAYER.prototype,

        UI_EDITOR_LAYER_BTN = UI_EDITOR_LAYER_CLASS.Button = 
        inheritsControl(
            UI_CONTROL,
            'ui-button',
            null,
            function (el, options) {
                this._sCommand = options.command;
            }
        ),
        UI_EDITOR_LAYER_BTN_CLASS = UI_EDITOR_LAYER_BTN.prototype,

        EXT_EDITOR = ext.Editor = {},
        EXT_EDITORS_CONFIG = {},
        EXT_EDITOR_LAYERS = {};

    function each(arr, callback) {
        var i, item;

        for (i = 0; item = arr[i]; i++) {
            callback.call(null, item, i);
        }
    }

    UI_EDITOR_LAYER_CLASS.show = function (con, options) {
        var value,
            pos = getPosition(con.getOuter());

        if (options.setValue) {
            con.$setValue4Editor = options.setValue;
            delete options.setValue;
        }
        if (options.getValue) {
            con.$getValue4Editor = options.getValue;
            delete options.getValue;
        }

        value = con.$getValue4Editor();
        this._oTarget = con;
        this.setOptions(options);
        this.setValue(value);

        UI_CONTROL_CLASS.show.call(this);
        this.setPosition(pos.left, pos.top + con.getHeight());
        setFocused(this);
    }

    UI_EDITOR_LAYER_CLASS.$blur = function () {
        this.hide();
    }

    UI_EDITOR_LAYER_CLASS.changeValue = function (value) {
        this.setValue(value);
        this._oTarget.$setValue4Editor(value);
    }

    UI_EDITOR_LAYER_CLASS.$submit = function () {
        var value = this.getValue(),
            target = this._oTarget;

        if (this.$validate() && triggerEvent(target, 'editorsubmit', null, [this, value])) {
            target.$setValue4Editor(value);
            this.hide();
        }
    }

    UI_EDITOR_LAYER_CLASS.beforeProcess = function (msg) {
        msg = msg || '正在处理...';
        this.setError(msg);
        core.mask(0);
    }

    UI_EDITOR_LAYER_CLASS.afterProcess = function (value, error) {
        core.mask();
        if (error) {
            this.setError(error);
        }
        else {
            if (value !== undefined) {
                this.changeValue(value);
            }
            this.hide();
        }
    }

    UI_EDITOR_LAYER_CLASS.$hide = function () {
        this._eError.innerHTML = '';
        this._oTarget = null;
        UI_CONTROL_CLASS.$hide.call(this);
    }

    UI_EDITOR_LAYER_CLASS.setError = function (msg) {
        this._eError.innerHTML = msg;
    }

    UI_EDITOR_LAYER_CLASS.$validate = function () {
        return true;
    }

    /**
     * @override
     */
    UI_EDITOR_LAYER_CLASS.setPosition = function (x, y) {
        var view = getView(),
            outer = this.getOuter(),
            width = outer.offsetWidth,
            height = outer.offsetHeight;

        if (x + width > view.right) {
            x = view.right - width;
        }
        if (y + height > view.bottom) {
            y = view.bottom - height;
        }
        UI_CONTROL_CLASS.setPosition.call(this, x, y);
    }

    // 待实现的接口
    each(['setValue', 'getValue', 'setOptions'], function (item, i) {
        UI_EDITOR_LAYER_CLASS[item] = blank;
    });

    UI_EDITOR_LAYER_BTN_CLASS.$click = function () {
        var con = this.getParent();

        if (this._sCommand == 'cancel') {
            con.hide();
        }

        if (this._sCommand == 'submit') {
            triggerEvent(con, 'submit');
        }
    }


    // 编辑器实体
    // 统一的对外入口
    
    EXT_EDITOR.init = function (type, con, options) {
        var uid = con.getUID();

        options = options || {};
        EXT_EDITORS_CONFIG[uid] = {type: type, options : options}; 
        addEventListener(con, 'mouseover', EXT_EDITOR.mouseoverHandler);
        addEventListener(con, 'mouseout', EXT_EDITOR.mouseoutHandler);
        addEventListener(con, 'dispose', EXT_EDITOR.disposeHandler);
        con.$setValue4Editor = function (value) {
            this.setContent(encodeHTML(value));
        }

        con.$getValue4Editor = function () {
            return this.getBody().innerHTML;
        }
    };

    EXT_EDITOR.createInput = function (con) {
        o = createDom('ui-editor', '', 'span');
        o.innerHTML = '<span class="ui-editor-content"></span><span class="ui-editor-button"></span>';
        o.lastChild.onclick = EXT_EDITOR.clickHandler(con);
        moveElements(con.getBody(), o.firstChild, true);
        con.getBody().appendChild(o);
        con.$setBody(o.firstChild);
        con._bAddedEditor = true;
    }

    EXT_EDITOR.showLayer = function (con) {
        var config = EXT_EDITORS_CONFIG[con.getUID()],
            options = config.options,
            type = config.type,
            layer = EXT_EDITOR_LAYERS[type];

        if ('[object Function]' == Object.prototype.toString.call(options)) {
            options = options.call(null);
        }

        if (!layer) {
            layer = EXT_EDITOR.createLayer(type);
        }

        layer.show(con, options);
    };

    EXT_EDITOR.createLayer = function (type) {
        var o = createDom('ui-editor-layer ui-editor-'+ type  +'-layer'),
            cls = 'Editor' + type.charAt(0).toUpperCase() + type.substring(1) + 'Layer';

        document.body.appendChild(o);
        o = $fastCreate(ui[cls], o, null, null);
        EXT_EDITOR_LAYERS[type] = o;
        return o;
    };

    EXT_EDITOR.clickHandler = function (con) {
        return function () {
            EXT_EDITOR.showLayer(con);
        }
    };

    EXT_EDITOR.mouseoverHandler = function () {
        var con = this, o;

        if (!con._bAddedEditor) {
            EXT_EDITOR.createInput(con);
        }

        o = con.getBody().parentNode;
        o.className += ' ui-editor-show';
    };

    EXT_EDITOR.mouseoutHandler = function () {
        var con = this, o;

        if (con._bAddedEditor) {
            o = con.getBody().parentNode; 
            o.className = o.className.replace(/\s+ui-editor-show/, '');
        }
    };

    EXT_EDITOR.disposeHandler = function () {
        var uid = this.getUID();
        
        if (EXT_EDITORS_CONFIG[uid]) {
            delete EXT_EDITORS_CONFIG[uid];
        }
    };

    // 创建具体的编辑浮层
    // 继承自UI_EDITOR_LAYER

    /**
     * 输入框（多行）
     */
    var UI_EDITOR_INPUT_LAYER = ui.EditorInputLayer = inheritsControl(UI_EDITOR_LAYER, 'ui-editor-layer'),
        UI_EDITOR_INPUT_LAYER_CLASS = UI_EDITOR_INPUT_LAYER.prototype;

    /**
     * 设置配置项
     *
     * @param {Object} options
     *      @param {Boolean} textarea 是否是多行输入框 默认单行输入框
     *      @param {Number} maxlength 最大长度
     *      @param {Boolean} require 是否是必填
     */
    UI_EDITOR_INPUT_LAYER_CLASS.setOptions = function (options) {
        var el = this.getBody();

        el.innerHTML = options.textarea == true ? '<textarea></textarea>' : '<input type="text" />';
        this._eInput = el.firstChild;
        this._nMaxlength = options.maxlength || Number.MAX_VALUE;
        this._bByte = options.isbyte;
        this._bRequire = options.require;
    }

    UI_EDITOR_INPUT_LAYER_CLASS.setValue = function (value) {
        this._eInput.value = trim(value);
    };

    UI_EDITOR_INPUT_LAYER_CLASS.$validate = function () {
        var value = this.getValue(),
            msg = '', len = this._bByte ? getByteLength(value, 'gbk') : value.length;

        if (this._bRequire && value == '') {
            msg = '请填写';
        }
        else if (len > this._nMaxlength) {
            msg = '不能超过' + this._nMaxlength + '个' + (this._bByte ? '字节' : '字符');
        }

        this.setError(msg);
        
        return !msg;
    }

    UI_EDITOR_INPUT_LAYER_CLASS.getValue = function () {
        var input = this._eInput;

        input.value = trim(input.value);

        return input.value;
    };

     /**
     * 下拉框
     */
    var UI_EDITOR_SELECT_LAYER = ui.EditorSelectLayer = inheritsControl(UI_EDITOR_LAYER, 'ui-editor-layer'),
        UI_EDITOR_SELECT_LAYER_CLASS = UI_EDITOR_SELECT_LAYER.prototype;

    /**
     * 设置配置项
     *
     * @param {Object} options
     *      @param {Array/Function}  options 下拉框的选项/获取下拉框选项
     */
    UI_EDITOR_SELECT_LAYER_CLASS.setOptions = function (options) {
        var items = options.options, htmls = ['<select>'], i, item,
            el = this.getBody();

        if ('[object Function]' == Object.prototype.toString.call(items)) {
            items = items.call(null);
        }

        for (i = 0; item = items[i]; i++) {
            htmls.push('<option value="'+ item.value +'">' + item.text + '</option>');
        }

        htmls.push('</select>');

        el.innerHTML = htmls.push(htmls.join(''));
        this._eSelect = el.firstChild;
    }

    UI_EDITOR_SELECT_LAYER_CLASS.setValue = function (value) {
        var el = this._eSelect,
            items = el.options, i, item; 

        for (i = 0; item = items[i]; i++) {
            if (item.value == value) {
                el.selectedIndex = i;
                break;
            }
        }
    };

    UI_EDITOR_SELECT_LAYER_CLASS.getValue = function () {
        var el = this._eSelect;

        return el[el.selectedIndex].value;
    };
})();
