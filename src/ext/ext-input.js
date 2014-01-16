/**
 * input
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    input.js
 * desc:    文本输入框(input与textarea)
 * author:  cxl(chenxinle@baidu.com)
 * date:    2012/03/12
 */
(function () {

    var core = ecui,
        dom = core.dom,
        string = core.string,
        ui = core.ui,
        util = core.util,

        attachEvent = util.attachEvent,
        createDom = dom.create,
        trim = string.trim,
        setFocused = core.setFocused,
        blank = util.blank,

        inheritsControl = core.inherits,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_INPUT_CONTROL = ui.InputControl,
        UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype,
		UI_INPUT = ui.Input,
		UI_INPUT_CLASS = UI_INPUT.prototype,
		UI_TEXTAREA = ui.Textarea,
		UI_TEXTAREA_CLASS = ui.Textarea.prototype,
		
        UI_EXT_INPUT = ui.ExtInput = inheritsControl(
            UI_INPUT_CONTROL,
            'ui-ext-input',
            function (el, options) {
                options.resizable = false;
            },
            function (el, options) {
                var o, type = this.getType();
                
                this.getInput().style.border = '';

				if(options.maxLength){
					this._sMaxLength = options.maxLength;
				}

                if (options.tip) {
                    o = createDom(type + '-tip', 'display:none');
                    o.innerHTML = options.tip;
                    this.getBody().appendChild(o);
                    this._eTip = o;
                    attachEvent(this._eTip, 'keypressdown', UI_INPUT_TIP_HANDLER);
                }
            }
        ),
        UI_EXT_INPUT_CLASS = UI_EXT_INPUT.prototype,

        UI_TEXTAREA = ui.ExtTextarea = inheritsControl(
            UI_INPUT,
            'ui-ext-textarea',
            function (el, options) {
                options.inputType = 'textarea';
            }
        );

    function UI_INPUT_TIP_HANDLER(event) {
        var e = event || window.event,
            con;
        e = e.target || e.srcElement;
        con = e.parentNode.getControl();
        con.getInput().focus();
    }

    function UI_INPUT_TIP_DISPLAY(con, show) {
        if (con._eTip) {
            con._eTip.style.display = show ? '' : 'none';
        }
    }

    UI_INPUT_CLASS.$keydown = function () {
    	
        UI_INPUT_TIP_DISPLAY(this, false);
    };

    UI_INPUT_CLASS.$keyup = function () {
        var value = this.getValue();
        var maxLength = this._sMaxLength;
        if( maxLength ){
        	if(core.string.getByteLength(value) >= maxLength){
        		this.setValue(core.string.subByte(value,maxLength));
        	}
        }
        
        if (!value) {
            UI_INPUT_TIP_DISPLAY(this, true);
        }
    };

    UI_INPUT_CLASS.$blur = function () {
        UI_CONTROL_CLASS.$blur.call(this);
        if (!this.getValue()) {
            UI_INPUT_TIP_DISPLAY(this, true);
        }
    };

    UI_INPUT_CLASS.$setSize = blank;

    UI_INPUT_CLASS.setValue = function (value) {
        UI_INPUT_CONTROL_CLASS.setValue.call(this, value);
        UI_INPUT_TIP_DISPLAY(this, value ? false : true);
    };

    UI_INPUT_CLASS.init = function () {
        if (!this.getValue()) {
            UI_INPUT_TIP_DISPLAY(this, true);
        }
        UI_INPUT_CONTROL_CLASS.init.call(this);
    };
})();
