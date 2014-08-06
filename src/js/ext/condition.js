/**
 * condition
 * Copyright 2012 Baidu Inc. All rights reserved
 *
 * desc: 条件值控件，可配置控件的类型，目前支持的类型包括固定标签类（fixed）、不定标签类（loose）、基本数值类（num）、时间限定数值类（time）、日期类（date）
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
        findControl = core.findControl,
        triggerEvent = core.triggerEvent,
        getOptions = core.getOptions,
        first = dom.first,
        last = dom.last,
        children = dom.children,
        createDom = dom.create,
        removeDom = dom.remove,
        addClass = dom.addClass,
        removeClass = dom.removeClass,
        setStyle = dom.setStyle,
        setText = dom.setText,
        getText = dom.getText,
        getByteLength = string.getByteLength,
        blank = util.blank,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype
        UI_BUTTON = ui.Button,
        UI_BUTTON_CLASS = UI_BUTTON.prototype,
        UI_INPUT_CONTROL = ui.InputControl,
        UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype,
        UI_INPUT = ui.Input,
        UI_INPUT_CLASS = UI_INPUT.prototype,
        UI_SELECT = ui.Select,
        UI_SELECT_CLASS = UI_SELECT.prototype,
        UI_MULTI_SELECT = ui.MultiSelect,
        UI_MULTI_SELECT_CLASS = UI_MULTI_SELECT.prototype,
        UI_CALENDAR = ui.Calendar,
        UI_CALENDAR_CLASS = UI_CALENDAR.prototype;

    var UI_CONDITION = ui.Condition = inheritsControl(
            UI_CONTROL,
            "ui-condition",
            function (el, options) {
                var type = this.getTypes()[0],
                    childs = children(el),
                    o = first(el);
                addClass(o, type + "-name");

                setStyle(el, "display", "inline-block");

                options.clazz = options.clazz || "num";

                addClass(childs[1], type + "-relation");

                switch (options.clazz) {
                    case "fixed" : addClass(childs[2], type + "-fixed-param"); break;
                    case "loose" : addClass(childs[2], type + "-loose-param"); break;
                    case "num" : addClass(childs[2], type + "-num-param"); break;
                    case "time" : addClass(childs[2], type + "-time-param"); break;
                    case "date" : addClass(childs[2], type + "-date-param"); break;
                }

                if (options.clazz == "fixed" || options.clazz == "loose") {
                    return el;
                }

                if (options.isPercent) {
                    this._bPercent = true;
                    childs[4] && addClass(childs[4], type + "-desc");
                }
                else {
                    childs[3] && addClass(childs[3], type + "-desc");
                }

                switch (options.clazz) {
                    case "num" : addClass(childs[4], type + "-num-param"); break;
                    case "time" : 
                        if (options.isPercent) {
                            addClass(childs[5], type + "-time-param");
                        }
                        else {
                            addClass(childs[4], type + "-time-param");
                        }
                        break;
                    case "date" : addClass(childs[4], type + "-date-param"); break;
                }

                return el;
            },
            function (el, options) {
                var o = el,
                    el = children(o);

                var type = this.getTypes()[0];

                this._sClazz = options.clazz;
                this._sConId = options.conId;
                
                this._eName = el[0];

                this._sTimeValue = options.timeValue;

                this._eRelation = $fastCreate(this.Relation, el[1], this, {optionSize:6, value:0});
                addClass(this._eRelation.getOuter(), "ui-select");
                UI_SELECT_CLASS.$cache.call(this._eRelation, this._eRelation.getOuter().style, true);
                this._eRelation.$setSize(50, 20);
                triggerEvent(this._eRelation, "ready");

                if (options.clazz == "fixed") {

                    var opt = getOptions(el[2]);

                    if (options.isMulti) {
                        this._eParam = $fastCreate(this.MultiSelectParam, el[2], this, {selectAllButton:false, value:opt.value + ""});
                        addClass(this._eParam.getOuter(), "ui-multi-select");
                        //选中全部
                        !opt.value && this._eParam.selectAll();
                    }
                    else {
                        this._eParam = $fastCreate(this.SelectParam, el[2], this, {value:opt.value + ""});
                    }
                    addClass(this._eParam.getOuter(), "ui-select");
                    UI_SELECT_CLASS.$cache.call(this._eParam, this._eParam.getOuter().style, true);
                    this._eParam.$setSize(170, 20);

                    triggerEvent(this._eParam, "ready");

                }
                else if (options.clazz == "loose") {
                    this._eParam = $fastCreate(this.InputParam, el[2], this, {});
                    addClass(this._eParam.getOuter(), "ui-input");
                    this._eParam.$setSize(370, 20);
                }
                else if (options.clazz == "date") {
                    var opt = getOptions(el[2]),
                        optPlus = getOptions(el[4]);

                    this._eParam = $fastCreate(this.CalendarParam, el[2], this, opt);
                    this._eDesc = el[3];
                    this._eParamPlus = $fastCreate(this.CalendarParam, el[4], this, optPlus);
                    addClass(this._eParam.getOuter(), "ui-calendar");
                    addClass(this._eParamPlus.getOuter(), "ui-calendar");
                    if (this._eRelation.getValue() != 5) {
                        this._eDesc.style.display = "none";
                        setStyle(this._eParamPlus.getOuter(), 'display', 'none');
                    }

                    this._eParam.init();
                    this._eParamPlus.init();
                }
                else {
                    this._eParam = $fastCreate(this.InputParam, el[2], this, {});
                    addClass(this._eParam.getOuter(), "ui-input");
                    if (options.isPercent) {
                        this._eDesc = el[4];
                        this._eParamPlus = $fastCreate(this.InputParam, el[5], this, {});
                        this._ePercentPlus = el[6];
                    }
                    else {
                        this._eDesc = el[3];
                        this._eParamPlus = $fastCreate(this.InputParam, el[4], this, {});
                    }
                    addClass(this._eParamPlus.getOuter(), "ui-input");
                    if (this._eRelation.getValue() != 5) {
                        this._eDesc.style.display = "none";
                        setStyle(this._eParamPlus.getOuter(), 'display', 'none');
                        if (this._ePercentPlus) {
                            this._ePercentPlus.style.display = 'none';
                        }
                    }
                }
            }
        ),
        UI_CONDITION_CLASS = UI_CONDITION.prototype;

    var UI_CONDITION_CLASS_RELATION_CLASS = (UI_CONDITION_CLASS.Relation = inheritsControl(UI_SELECT, null)).prototype;
    var UI_CONDITION_CLASS_MULTI_SELECT_PARAM_CLASS = (UI_CONDITION_CLASS.MultiSelectParam = inheritsControl(UI_MULTI_SELECT, null)).prototype;
    var UI_CONDITION_CLASS_SELECT_PARAM_CLASS = (UI_CONDITION_CLASS.SelectParam = inheritsControl(UI_SELECT, null)).prototype;
    var UI_CONDITION_CLASS_INPUT_PARAM_CLASS = (UI_CONDITION_CLASS.InputParam = inheritsControl(UI_INPUT, null)).prototype;
    var UI_CONDITION_CLASS_CALENDAR_PARAM_CLASS = (UI_CONDITION_CLASS.CalendarParam = inheritsControl(UI_CALENDAR, null)).prototype;

    UI_CONDITION_CLASS.dispose = function () {
        this._eRelation.dispose();
        this._eParam && this._eParam.dispose();
        this._eParamPlus && this._eParamPlus.dispose();
        UI_CONTROL_CLASS.dispose.call(this);
    };

    UI_CONDITION_CLASS.setValue = function (data) {
        if (this._sClazz == "fixed" || this._sClazz == "loose") {
            this._eParam.setValue(data.value);
        }
        this._eRelation.setValue(data[0]);
    };

    UI_CONDITION_CLASS.$focus = function () {
        var type, typePlus;

        this._eParam && (type = this._eParam.getTypes()[0] + "-error");
        this._eParamPlus && (typePlus = this._eParamPlus.getTypes()[0] + "-error");

        this._eParam && (removeClass(this._eParam.getOuter(), type));
        this._eParamPlus && (removeClass(this._eParamPlus.getOuter(), typePlus));
    };

    UI_CONDITION_CLASS.validate = function () {
        this._sError = this._sErrorPlus = false;

        var value, valuePlus;
        if (this._sClazz == "fixed") {
            var value = this._eParam.getValue();
            if (value && value.length && value != "undefined") {
                return true;
            }
            else {
                var type = this._eParam.getTypes()[0];
                this._sError = true;
                this._sErrorMsg = "请选择";
                addClass(this._eParam.getOuter(), type + "-error");
                triggerEvent(this, "invalidate");
                return false;
            }
        }
        else if (this._sClazz == "loose") {
            if (!this._eParam.getValue()) {
                var type = this._eParam.getTypes()[0];
                this._sError = true;
                this._sErrorMsg = "请输入必填项内容";
                addClass(this._eParam.getOuter(), type + "-error");
                triggerEvent(this, "invalidate");
                return false;
            }
            else if (getByteLength(this._eParam.getValue()) > 1000) {
                var type = this._eParam.getTypes()[0];
                this._sError = true;
                this._sErrorMsg = "输入内容超过500个中文字符，请删减";
                addClass(this._eParam.getOuter(), type + "-error");
                triggerEvent(this, "invalidate");
                return false;
            }
            else {
                return true;
            }
        }

        else if (this._sClazz == "num" || this._sClazz == "time") {
            var type = this._eParam.getTypes()[0];

            if (this._eRelation.getValue() != 5) {
                value = this._eParam.getValue();
                if (!value) {
                    this._sErrorMsg = "请输入必填项内容";
                    this._sError = true;
                    addClass(this._eParam.getOuter(), type + "-error");
                    triggerEvent(this, "invalidate");
                    return false;
                }
                else if (getByteLength(value) > 10) {
                    this._sErrorMsg = "输入内容超过10个数字，请删减";
                    this._sError = true;
                    addClass(this._eParam.getOuter(), type + "-error");
                    triggerEvent(this, "invalidate");
                    return false;
                }
                else if (!(/^-\d+$|^\d+$/.test(value)) || (value - 0 < 0 && !this._bPercent)) {
                    this._sErrorMsg = "条件逻辑有误，请删减";
                    this._sError = true;
                    addClass(this._eParam.getOuter(), type + "-error");
                    triggerEvent(this, "invalidate");
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                var type = this._eParam.getTypes()[0],
                    typePlus = this._eParamPlus.getTypes()[0];

                value = this._eParam.getValue();
                valuePlus = this._eParamPlus.getValue();

                if (!value) {
                    this._sErrorMsg = "请输入必填项内容";
                    this._sError = true;
                    addClass(this._eParam.getOuter(), type + "-error");
                    triggerEvent(this, "invalidate");
                    return false;
                }
                else if (getByteLength(value) > 10) {
                    this._sErrorMsg = "输入内容超过10个数字，请删减";
                    this._sError = true;
                    addClass(this._eParam.getOuter(), type + "-error");
                    triggerEvent(this, "invalidate");
                    return false;
                }
                else if (!(/^-\d+$|^\d+$/.test(value)) || (value - 0 < 0 && !this._bPercent)) {
                    this._sErrorMsg = "只能输入数字";
                    this._sError = true;
                    addClass(this._eParam.getOuter(), type + "-error");
                    triggerEvent(this, "invalidate");
                    return false;
                }

                if (!valuePlus) {
                    this._sErrorMsgPlus = "请输入必填项内容";
                    this._sErrorPlus = true;
                    addClass(this._eParamPlus.getOuter(), typePlus + "-error");
                    triggerEvent(this, "invalidate");
                }
                else if (getByteLength(valuePlus) > 10) {
                    this._sErrorMsgPlus = "输入内容超过10个数字，请删减";
                    this._sErrorPlus = true;
                    addClass(this._eParamPlus.getOuter(), typePlus + "-error");
                    triggerEvent(this, "invalidate");
                    return false;
                }
                else if (!(/^-\d+$|^\d+$/.test(valuePlus)) || (valuePlus - 0 < 0 && !this._bPercent)) {
                    this._sErrorMsgPlus = "只能输入数字";
                    this._sErrorPlus = true;
                    addClass(this._eParamPlus.getOuter(), typePlus + "-error");
                    triggerEvent(this, "invalidate");
                    return false;
                }

                if (value 
                    && valuePlus 
                    && getByteLength(value) < 10 
                    && getByteLength(valuePlus) < 10 
                    && /^-\d+$|^\d+$/.test(value) 
                    && /^-\d+$|^\d+$/.test(valuePlus) 
                    && value - 0 < valuePlus - 0) {
                }
                else {
                    this._sErrorMsgPlus = "条件逻辑有误，请重新输入";
                    this._sErrorPlus = true;
                    addClass(this._eParamPlus.getOuter(), typePlus + "-error");
                    triggerEvent(this, "invalidate");
                    return false;
                }
                return true;
            }
        }
        else if (this._sClazz == "date") {
            var type = this._eParam.getTypes()[0];

            if (this._eRelation.getValue() != 5) {
                value = this._eParam.getValue();
                if (!value) {
                    this._sErrorMsg = "请输入必填项内容";
                    this._sError = true;
                    addClass(this._eParam.getOuter(), type + "-error");
                    triggerEvent(this, "invalidate");
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                var typePlus = this._eParamPlus.getTypes()[0];

                value = this._eParam.getValue();
                valuePlus = this._eParamPlus.getValue();

                if (!value) {
                    this._sErrorMsg = "请输入必填项内容";
                    this._sError = true;
                    addClass(this._eParam.getOuter(), type + "-error");
                    triggerEvent(this, "invalidate");
                    return false;
                }

                if (!valuePlus) {
                    this._sErrorMsgPlus = "请输入必填项内容";
                    this._sErrorPlus = true;
                    addClass(this._eParamPlus.getOuter(), type + "-error");
                    triggerEvent(this, "invalidate");
                }

                if (value 
                    && valuePlus 
                    && (this._eParam.getDate().getTime() <= this._eParamPlus.getDate().getTime())) {
                }
                else {
                    this._sErrorMsgPlus = "条件逻辑有误，请重新选择";
                    this._sErrorPlus = true;
                    addClass(this._eParamPlus.getOuter(), type + "-error");
                    triggerEvent(this, "invalidate");
                    return false;
                }

                return true;
            }
        }
    }

    UI_CONDITION_CLASS.getValidateInfo = function () {
        var obj = {};
        this._sErrorMsg && (obj.errorMsg = this._sErrorMsg);
        this._sErrorMsgPlus && (obj.errorMsgPlus = this._sErrorMsgPlus);
        this._sError && (obj.error = this._sError);
        this._sErrorPlus && (obj.errorPlus = this._sErrorMsgPlus);
        return obj;
    };

    function parseValue(value) {
        var ret;
        switch (Object.prototype.toString.call(value)) {
            case "[object String]" : ret = value; break;
            case "[object Number]" : ret = value + ""; break;
            case "[object Array]" : ret = value.join(","); break;
        }
        return ret;
    };

    UI_CONDITION_CLASS.getValue = function () {
        var obj = {};
        var value = "";

        obj["id"] = this._sConId;
        obj["name"] = getText(this._eName);
        obj["pattern"] = this._eRelation.getValue();

        switch (this._sClazz) {
            case "fixed" : obj["type"] = 0; break;
            case "loose" : obj["type"] = 1; break;
            case "num" : obj["type"] = 2; break;
            case "time" : obj["type"] = 3; break;
            case "date" : obj["type"] = 4; break;
        }
        
        (this._sTimeValue !== undefined) && (obj["timeValue"] = this._sTimeValue);

        this._eParam && (value = parseValue(this._eParam.getValue()));
        if (this._eRelation.getValue() == 5) {
            this._eParamPlus && (value = value + "," + parseValue(this._eParamPlus.getValue()));
        }

        obj["value"] = value;

        return obj;
    };

    UI_CONDITION_CLASS_RELATION_CLASS.$change = function () {
        var par = this.getParent();
        if (this.getValue() == 5) {
            par._eDesc.style.display = "inline";
            par._eParamPlus.show();
            if (par._ePercentPlus) {
                par._ePercentPlus.style.display = 'inline';
            }
        }
        else {
            par._eDesc.style.display = "none";
            par._eParamPlus.hide();
            if (par._ePercentPlus) {
                par._ePercentPlus.style.display = 'none';
            }
        }
    };

    UI_CONDITION_CLASS_INPUT_PARAM_CLASS.$focus = function () {
        var el = this.getParent(),
            par = this.getParent();

        triggerEvent(par, "focus");
        UI_INPUT_CLASS.$focus.call(this);
    };

}) ();
