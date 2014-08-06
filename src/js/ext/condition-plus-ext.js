/**
 * @author quyatong
 */

(function() {
    var core = ecui,
        ui = core.ui,
        dom = core.dom,
        string = core.string,
        util = core.util,
        $fastCreate = core.$fastCreate,
        inheritsControl = core.inherits,
        findControl = core.findControl,
        first = dom.first,
        last = dom.last,
        children = dom.children,
        createDom = dom.create,
        removeDom = dom.remove,
        addClass = dom.addClass,
        setText = dom.setText,
        blank = util.blank,
        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
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
        UI_CALENDAR_CLASS = UI_CALENDAR.prototype,
        UI_MULTI_CALENDAR = ui.MultiCalendar,
        UI_MULTI_CALENDAR_CLASS = UI_MULTI_CALENDAR.prototype,
        UI_DATA_TREE = ui.DataTree,
        UI_DATA_TREE_CLASS = UI_DATA_TREE.prototype,
        UI_INPUT_TREE = ui.InputTree,
        UI_INPUT_TREE_CLASS = UI_INPUT_TREE.prototype;

    var NONE = '-1';
    var EQ = '0'; // equal
    var NEQ = '1'; // not equal
    var GT = '2'; // great than
    var GE = '3'; // great than or equal
    var LT = '4'; // less than
    var LE = '5'; // less than or equal
    var BETWEEN = '6'; // between
    var LIKE = '7'; // like
    var IN = '8'; // in
    var IS_NULL = '9'; // is null
    var IS_NOT_NULL = '10'; //
    var Off_Time = IS_NOT_NULL;

    var isPositiveInteger = '^[0-9]*$';
    var isLengthString = '.{0,109}';
    var UI_CONDITION_PLUS = ui.ConditionPlus = inheritsControl(UI_CONTROL, "ui-condition-plus", function(el, options) {

        this.parEle = (el);
        this.theNode = el;
        var child = children(el);
        var type = this.getTypes()[0];
        var id = options.id;
        var tagName = options.tagName;
        var foreText = options.foreText;
        var isDefault = options.isDefault;
        var hide = options.hide;
        var widgetType = options.widgetType;
        var operatorType = options.operatorType;
        var operatorLeftValue = options.operatorLeftValue;
        var reg = isLengthString; // || options.regexp || '';
        var valueType = options.valueType;
        var isComplex = options.isComplex;
        var isLike = options.isLike;

        var attached = options.attached ? options.attached.split(',') : [];

        var text = createDom(type + "-text", "", "span");
        var content = createDom('ui-select', '', 'select');
        var contentHTML = '';
        var invalidateText = createDom(type + "-invalidate", "", "div");

        this._sName = tagName;
        this._uId = id.replace('condition', '');
        this._sIsDefault = isDefault;
        this._sIsHide = hide;
        this._sName = tagName;
        this._sOperatorType = operatorType;
        this._sReg = reg;
        this._sIsLike = isLike;

        if(core.string.getByteLength(foreText) > 14) {
            core.dom.getParent(el).style.width = "100%";
            text.innerHTML = foreText + "：&nbsp;";
            core.dom.setStyles(text, {
                'float': 'left',
                'display': 'block',
                'line-height': '22px'
            });
        } else {
            text.innerHTML = foreText + "：&nbsp;";
            core.dom.setStyles(text, {
                'float': 'left',
                'display': 'block',
                'line-height': '22px',
                'width': '103px'
            });
        }
        
        switch(widgetType + '') {
        case '0':
            // 下拉
            content = createDom('ui-select', 'width:238px;float:left;display:block', 'select');
            contentHTML = '';
            break;
        case '1':
            //下拉列表多选
            content = createDom('ui-select ui-multi-select', 'width:238px;float:left;display:block', 'select');
            contentHTML = '';
            break;
        case '2':
            //文本框
            content = createDom('ui-input', 'width:238px;float:left;display:block', 'input');
            contentHTML = "";
            break;
        case '3':
            //日期
            content = createDom('ui-multi-calendar', 'width:238px;float:left;display:block', 'div');
            contentHTML = "";
            break;
        case '4':
            //下拉树
            content = createDom('ui-input-tree', 'width:238px;float:left;display:block', 'div');
            contentHTML = '<div></div>';
            break;
        case '6':
            //math
            content = createDom('', 'width:238px;float:left;display:block', 'div');
            contentHTML = "";
            break;
        case '5':
            //特殊
            switch(tagName) {
            case 'health_grade':
                content = createDom('ui-select ui-multi-select', 'width:238px;float:left;display:block', 'div');
                contentHTML = '';
                break;
            case 'trade':
            case 'fc_off_time':
            case 'wm_off_time':
            case 'busi_season':
            case 'province_city':
                content = createDom('', 'width:238px;float:left;display:block', 'div');
                contentHTML = '';
                break;
            case 'fc_budget_type':
                content = createDom('ui-select', 'width:238px;float:left;display:block', 'div');
                contentHTML = '';
                break;
            }
        }
        //标签内容
        if(contentHTML) {
            content.innerHTML = contentHTML;
        }
        el.appendChild(text);
        el.appendChild(content);
        el.appendChild(invalidateText);
        core.dom.setStyle(invalidateText, 'margin-left', content.offsetLeft + 'px');
    }, function(el, options) {
        var child = children(el);
        var type = this.getTypes()[0];
        var id = options.id;
        var tagName = options.tagName;
        var foreText = options.foreText;
        var isDefault = options.isDefault;
        var hide = options.hide;
        var widgetType = options.widgetType;
        var operatorType = options.operatorType;
        var operatorLeftValue = options.operatorLeftValue;
        var valueType = options.valueType;
        var isComplex = options.isComplex;
        var invalidater = baidu.dom.last(el);
        this.invalidater = invalidater;

        if(isDefault == '0' && core.dom.getParent(el)) {
            core.dom.getParent(el).style.display = 'none';
        }
        var _uTypes = ['select', 'dropdownlist', 'input', 'calendar', 'inputTree', 'spec']
        this._uType = _uTypes[widgetType];
        var me = this;

        var setInvalidater = function(text) {
                invalidater.innerHTML = text;
            }
        
        switch(widgetType + '') {
        case '0':
            // 下拉
            this._uSelect = $fastCreate(UI_SELECT, child[1], this, {});
            UI_SELECT_CLASS.$cache.call(this._uSelect, this._uSelect.getOuter().style, true);
            this._uSelect.$setSize(238, 20);
            break;
        case '1':
            //下拉列表多选
            this._uDropdownList = $fastCreate(UI_MULTI_SELECT, child[1], this, {
                'textAll': '全部状态'
            });
            UI_MULTI_SELECT_CLASS.$cache.call(this._uDropdownList, this._uDropdownList.getOuter().style, true);
            this._uDropdownList.$setSize(238, 20);
            this._uDropdownList.setValue([]);
            break;
        case '2':
            //文本框
            var UI_INPUT_TEXT = inheritsControl(UI_INPUT, null);
            var UI_INPUT_TEXT_CLASS = UI_INPUT_TEXT.prototype;
            this._uInput = $fastCreate(UI_INPUT_TEXT, child[1], this, {
                tip: '',
                'width': '238px'
            });
            UI_INPUT_TEXT_CLASS.$cache.call(this._uInput, this._uInput.getOuter().style, true);

            this._uInput.$setSize(238, 20);
            this._uInput.setValue('');
            break;
        case '3':
            this._uMultiCalendar = $fastCreate(UI_MULTI_CALENDAR, child[1], this,{start :'1962-1-1',end : '2032-12-31'});
            UI_MULTI_CALENDAR_CLASS.$cache.call(this._uMultiCalendar, this._uMultiCalendar.getOuter().style, true);
            this._uMultiCalendar.$setSize(238, 20);
            this._uMultiCalendar.clear();
            break;
        case '4':
            break;
        case '6':
            this._uType = "math";
            var mathSelect = createDom('ui-select', '', 'select');
            var leftInput = createDom('ui-input', '', 'div');
            var rightInput = createDom('ui-input', 'margin-left:2px', 'div');
            var centerFlag = createDom('', '', 'span');
            centerFlag.innerHTML = "&nbsp;-&nbsp;"
            core.dom.setStyles(mathSelect, {
                "width": '75px'
            })
            core.dom.setStyles(leftInput, {
                "width": '69px',
                'margin-left': '5px',
                'margin-right': '2px'
            })
            core.dom.setStyles(rightInput, {
                "width": '69px',
                'margin-left': '0px'
            })

            child[1].appendChild(mathSelect);
            child[1].appendChild(leftInput);
            child[1].appendChild(centerFlag);
            child[1].appendChild(rightInput);
            grandChild = children(child[1]);
            var me = this;
            var UI_MATH = inheritsControl(UI_SELECT, null);
            var UI_MATH_CLASS = UI_MATH.prototype;

            var UI_INPUT_LEFT = inheritsControl(UI_INPUT, null);
            var UI_INPUT_LEFT_CLASS = UI_INPUT_LEFT.prototype;

            var UI_INPUT_RIGHT = inheritsControl(UI_INPUT, null);
            var UI_INPUT_RIGHT_CLASS = UI_INPUT_RIGHT.prototype;

            this._uMath = $fastCreate(UI_MATH, grandChild[0], this, {});
            this._uMath.$setSize(72, 20);

            this._uMathLeft = $fastCreate(UI_INPUT_LEFT, grandChild[1], this, {});
            this._uMathLeft.$setSize(54, 20);

            this._uCenterFlag = centerFlag;

            this._uMathRight = $fastCreate(UI_INPUT_RIGHT, grandChild[3], this, {});
            this._uMathRight.$setSize(54, 20);


            var arr = [{
                'value': NONE,
                'text': '请选择'
            }, {
                'value': EQ,
                'text': '等于'
            }, {
                'value': GT,
                'text': '大于'
            }, {
                'value': GE,
                'text': '大于等于'
            }, {
                'value': LT,
                'text': '小于'
            }, {
                'value': LE,
                'text': '小于等于'
            }, {
                'value': BETWEEN,
                'text': '介于'
            }];

            baidu.each(arr, function(option) {
                me._uMath.add(option.text, null, option);
            });
            baidu.dom.hide(me._uMathLeft.getOuter());
            baidu.dom.hide(me._uMathRight.getOuter());

            me._uMathRight.onfocus = me._uMathLeft.onfocus = function() {
                core.dom.setStyle(me._uMathLeft.getOuter(), 'border', '1px solid #A9ADB6');
                core.dom.setStyle(me._uMathRight.getOuter(), 'border', '1px solid #A9ADB6');
                me.invalidater.innerHTML = '';
            };

            UI_MATH_CLASS.$change = function() {
                baidu.dom.hide(me._uMathLeft.getOuter());
                baidu.dom.hide(me._uCenterFlag);
                baidu.dom.hide(me._uMathRight.getOuter());
                switch(this.getValue()) {
                case EQ:
                case GT:
                case GE:
                case LT:
                case LE:
                    baidu.dom.show(me._uMathLeft.getOuter());
                    break;
                case BETWEEN:
                    baidu.dom.show(me._uMathLeft.getOuter());
                    baidu.dom.show(me._uCenterFlag);
                    baidu.dom.show(me._uMathRight.getOuter());
                    break;
                }
                core.dom.setStyle(me._uMathLeft.getOuter(),'border','1px solid #A9ADB6');
                core.dom.setStyle(me._uMathRight.getOuter(),'border','1px solid #A9ADB6');
                me.invalidater.innerHTML = '';
            };
            me._uMath.setSelectedIndex(0);
            me._uMath.$change();
            break;
        case '5':
            //特殊
            switch(tagName) {
            case 'fc_budget_type':
                this._uType = 'fc_budget_type';
                this._uSelect = $fastCreate(UI_SELECT, child[1], this, {});
                UI_SELECT_CLASS.$cache.call(this._uSelect, this._uSelect.getOuter().style, true);
                this._uSelect.$setSize(238, 20);

                var allArr = [{
                    'value': NONE,
                    'text': '全部'
                }, {
                    'value': 0,
                    'text': '日预算'
                }, {
                    'value': 1,
                    'text': '周预算'
                }, {
                    'value': IS_NULL,
                    'text': '未设置预算'
                }];

                baidu.each(allArr, function(option) {
                    me._uSelect.add(option.text, null, option);
                });
                me._uSelect.setSelectedIndex(0);
                break;
            case 'trade':
                this._uType = 'trade';
                var tradeFirstSelect = createDom('ui-select', '', 'span');
                var tradeSecSelect = createDom('ui-select', '', 'span');

                core.dom.setStyles(tradeFirstSelect, {
                    "width": '114px',
                    'margin-left': '0px'
                })
                core.dom.setStyles(tradeSecSelect, {
                    "width": '113px',
                    'margin-left': '7px'
                })

                child[1].appendChild(tradeFirstSelect);
                child[1].appendChild(tradeSecSelect);

                var grandChild = children(child[1]);
                var me = this;
                var UI_FIRST_TRADE = inheritsControl(UI_SELECT, null);
                var UI_FIRST_TRADE_CLASS = UI_FIRST_TRADE.prototype;

                var UI_SEC_TRADE = inheritsControl(UI_SELECT, null);
                var UI_SEC_TRADE_CLASS = UI_SEC_TRADE.prototype;

                this._uFirstTrade = $fastCreate(UI_FIRST_TRADE, grandChild[0], this, {});
                this._uFirstTrade.$setSize(110, 20);

                this._uSecTrade = $fastCreate(UI_SEC_TRADE, grandChild[1], this, {});
                this._uSecTrade.$setSize(110, 20);

                this._uFirstTrade.$change = function(secondTradeId) {
                    var firstTradeId = me._uFirstTrade.getValue();
                    if(firstTradeId == NONE) {
                        me._uSecTrade.clear();
                        me._uSecTrade.add('请选择二级行业', null, {
                            'value': NONE,
                            'text': '请选择二级行业'
                        })
                        me._uSecTrade.setSelectedIndex(0);
                    } else {
                        var par = this.getParent();
                        me._uSecTrade.clear();
                        ecui.triggerEvent(par, "loaddata", {
                            "name": 'trade',
                            'firstTradeId': firstTradeId,
                            'secondTradeId': secondTradeId
                        }, null);
                    }
                }
                break;
            case 'province_city':
                this._uType = 'province_city';
                var provinceSelect = createDom('ui-select', '', 'span');
                var citySelect = createDom('ui-select', '', 'span');

                core.dom.setStyles(provinceSelect, {
                    "width": '114px',
                    'margin-left': '0px'
                });

                core.dom.setStyles(citySelect, {
                    "width": '113px',
                    'margin-left': '7px'
                });

                child[1].appendChild(provinceSelect);
                child[1].appendChild(citySelect);

                var grandChild = children(child[1]);
                var me = this;
                var UI_PROVINCE = inheritsControl(UI_SELECT, null);
                var UI_PROVINCE_CLASS = UI_PROVINCE.prototype;

                var UI_CITY = inheritsControl(UI_SELECT, null);
                var UI_CITY_CLASS = UI_CITY.prototype;

                this._uProvince = $fastCreate(UI_PROVINCE, grandChild[0], this, {});
                this._uProvince.$setSize(114, 20);

                this._uCity = $fastCreate(UI_CITY, grandChild[1], this, {});
                this._uCity.$setSize(114, 20);

                UI_PROVINCE_CLASS.$change = function(cityId) {
                    var provinceId = me._uProvince.getValue();
                    if(provinceId == 0) {
                        me._uCity.clear();
                        me._uCity.add('请选择市', null, {
                            'value': NONE
                        });
                        me._uCity.setSelectedIndex(0);
                    } else {
                        var par = this.getParent();
                        me._uCity.clear();
                        ecui.triggerEvent(par, "loaddata", {
                            "name": 'province_city',
                            'provinceId': provinceId,
                            'cityId': cityId
                        }, null);
                    }
                }
                break;
            case 'wm_off_time':
            case 'fc_off_time':
                if(tagName == "wm_off_time") {
                    this._uType = 'wm_off_time';
                } else {
                    this._uType = 'fc_off_time';
                }
                var me = this;
                var grandChild = null;
                var UI_HIT_SELECT = inheritsControl(UI_SELECT, null);
                var UI_HIT_SELECT_CLASS = UI_HIT_SELECT.prototype;

                var UI_HIT_FIRST_TIME = inheritsControl(UI_SELECT, null);
                var UI_HIT_FIRST_TIME_CLASS = UI_HIT_FIRST_TIME.prototype;

                var UI_HIT_SECOND_TIME = inheritsControl(UI_SELECT, null);
                var UI_HIT_SECOND_TIME_CLASS = UI_HIT_SECOND_TIME.prototype;

                var hitSelect = createDom('ui-select', '', 'select');
                var hitFirstTimeSelect = createDom('ui-select', '', 'select');
                var hitCenterFlag = createDom('', '', 'span');
                var hitSecondTimeSelect = createDom('ui-select', '', 'select');
                hitCenterFlag.innerHTML = '&nbsp;-&nbsp;';

                child[1].appendChild(hitSelect);
                child[1].appendChild(hitFirstTimeSelect);
                child[1].appendChild(hitCenterFlag);
                child[1].appendChild(hitSecondTimeSelect);
                grandChild = children(child[1]);

                core.dom.setStyles(hitSelect, {
                    "width": '70px',
                    'margin-left': '0px'
                });

                core.dom.setStyles(hitFirstTimeSelect, {
                    "width": '67px',
                    'margin-left': '7px'
                });

                core.dom.setStyles(hitSecondTimeSelect, {
                    "width": '67px',
                    'margin-left': '0px'
                });

                this._uHitSelect = $fastCreate(UI_HIT_SELECT, grandChild[0], this, {});
                this._uHitSelect.$setSize(70, 20);

                this._uHitFirstTimeSelect = $fastCreate(UI_HIT_FIRST_TIME, grandChild[1], this, {});
                this._uHitFirstTimeSelect.$setSize(69, 20);

                this._uHitCenterFlag = hitCenterFlag;

                this._uHitSecondTimeSelect = $fastCreate(UI_HIT_SECOND_TIME, grandChild[3], this, {});
                this._uHitSecondTimeSelect.$setSize(69, 20);

                var hitArr = [{
                    'value': NONE,
                    'text': '全部'
                }, {
                    'value': IS_NULL,
                    'text': '未撞线'
                }, {
                    'value': Off_Time,
                    'text': '撞线'
                }];

                baidu.each(hitArr, function(option) {
                    me._uHitSelect.add(option.text, null, option);
                });
                me._uHitSelect.setSelectedIndex(0);

                var gennerTime = function(index, start) {
                        var firstOptionText = ['请选择', '请选择'];
                        var times = [{
                            'value': NONE,
                            'text': firstOptionText[index]
                        }];

                        for(var i = start || 0; i <= 23; i++) {
                            var hours = (i + '').length == 1 ? ('0' + (i + '')) : (i + '');
                            times.push({
                                'value': i * 2 + 0,
                                'text': hours + ':00'
                            });
                            times.push({
                                'value': i * 2 + 1,
                                'text': hours + ':30'
                            });
                        }
                        return times;
                    }

                var times = gennerTime(0);

                baidu.each(times, function(option) {
                    me._uHitFirstTimeSelect.add(option.text, null, option);
                });
                me._uHitFirstTimeSelect.setSelectedIndex(0);

                times = gennerTime(1);
                baidu.each(times, function(option) {
                    me._uHitSecondTimeSelect.add(option.text, null, option);
                });
                me._uHitSecondTimeSelect.setSelectedIndex(0);

                me._uHitSelect.$change = function() {
                    if(me._uHitSelect.getValue() + '' == NONE || me._uHitSelect.getValue() + '' == IS_NULL) {
                        baidu.dom.hide(me._uHitFirstTimeSelect.getOuter());
                        baidu.dom.hide(me._uHitCenterFlag);
                        baidu.dom.hide(me._uHitSecondTimeSelect.getOuter());

                    } else {
                        baidu.dom.show(me._uHitFirstTimeSelect.getOuter());
                        baidu.dom.show(me._uHitCenterFlag);
                        baidu.dom.show(me._uHitSecondTimeSelect.getOuter());
                        me._uHitFirstTimeSelect.setSelectedIndex(0);
                        me._uHitSecondTimeSelect.setSelectedIndex(0);
                    }
                    core.dom.setStyle(me._uHitFirstTimeSelect.getOuter(),'border','1px solid #A9ADB6');
                    core.dom.setStyle(me._uHitSecondTimeSelect.getOuter(),'border','1px solid #A9ADB6');
                    me.invalidater.innerHTML='';
                };
                me._uHitFirstTimeSelect.onchange = me._uHitSecondTimeSelect.onchange = function(){
                    core.dom.setStyle(me._uHitFirstTimeSelect.getOuter(),'border','1px solid #A9ADB6');
                    core.dom.setStyle(me._uHitSecondTimeSelect.getOuter(),'border','1px solid #A9ADB6');
                    me.invalidater.innerHTML='';
                }

                me._uHitSelect.$change();
                break;
            case 'busi_season':
                this._uType = 'busi_season';
                var me = this;
                var grandChild = null;
                var UI_HAVEORNOT_SELECT = inheritsControl(UI_SELECT, null);
                var UI_HAVEORNOT_SELECT_CLASS = UI_HAVEORNOT_SELECT.prototype;

                var UI_SEASON_MULTI_SELECT = inheritsControl(UI_MULTI_SELECT, null);
                var UI_SEASON_MULTI_SELECT_CLASS = UI_SEASON_MULTI_SELECT.prototype;

                var haveOrNotSelect = createDom('ui-select', 'width:70px', 'select');
                var seasonMultiSelect = createDom('ui-select', 'width:148px;margin-left:7px', 'select');

                child[1].appendChild(haveOrNotSelect);
                child[1].appendChild(seasonMultiSelect);
                grandChild = children(child[1]);

                this._uHaveOrNotSelect = $fastCreate(UI_HAVEORNOT_SELECT, grandChild[0], this, {});
                this._uHaveOrNotSelect.$setSize(70, 20);

                this._uSeasonMultiSelect = $fastCreate(UI_SEASON_MULTI_SELECT, grandChild[1], this, {});
                this._uSeasonMultiSelect.$setSize(150, 20);

                var haveOrNot = [{
                    'value': NONE,
                    'text': '请选择'
                }, {
                    'value': IS_NULL,
                    'text': '无'
                }, {
                    'value': IS_NOT_NULL,
                    'text': '有'
                }];

                var monthArray = [{
                    'value': 1,
                    'text': '一月'
                }, {
                    'value': 2,
                    'text': '二月'
                }, {
                    'value': 3,
                    'text': '三月'
                }, {
                    'value': 4,
                    'text': '四月'
                }, {
                    'value': 5,
                    'text': '五月'
                }, {
                    'value': 6,
                    'text': '六月'
                }, {
                    'value': 7,
                    'text': '七月'
                }, {
                    'text': '八月'
                }, {
                    'value': 9,
                    'text': '九月'
                }, {
                    'value': 10,
                    'text': '十月'
                }, {
                    'value': 11,
                    'text': '十一月'
                }, {
                    'value': 12,
                    'text': '十二月'
                }];

                baidu.each(haveOrNot, function(item) {
                    me._uHaveOrNotSelect.add(item.text, null, {
                        value: item.value
                    });
                });

                baidu.each(monthArray, function(item) {
                    me._uSeasonMultiSelect.add(item.text, null, {
                        value: item.value
                    });
                });

                me._uHaveOrNotSelect.$change = function() {
                    var have = me._uHaveOrNotSelect.getValue();
                    if(have == IS_NOT_NULL) {
                        baidu.dom.hide(me._uSeasonMultiSelect.getOuter());
                    } else {
                        baidu.dom.hide(me._uSeasonMultiSelect.getOuter());
                    }
                };
                me._uHaveOrNotSelect.setSelectedIndex(0);
                me._uHaveOrNotSelect.$change();
                break;
            case 'health_grade':
                //下拉列表多选
                this._uType = 'health_grade';
                this._uHealthGrade = $fastCreate(UI_MULTI_SELECT, child[1], this, {
                    'textAll': '全部等级'
                });
                this._uHealthGrade.$setSize(238, 20);
                var data = [{
                    grade: 1,
                    text: '<span class="healthIcon healthIcon1"></span>',
                    tip: '等级一'
                }, {
                    grade: 2,
                    text: '<span class="healthIcon healthIcon2"></span>',
                    tip: '等级二'
                }, {
                    grade: 3,
                    text: '<span class="healthIcon healthIcon3"></span>',
                    tip: '等级三'
                }, {
                    grade: 4,
                    text: '<span class="healthIcon healthIcon4"></span>',
                    tip: '等级四'
                }, {
                    grade: 5,
                    text: '<span class="healthIcon healthIcon5"></span>',
                    tip: '等级五'
                }];
                var allSelecteds = ['1', '2', '3', '4', '5'];
                baidu.each(data, function(item) {
                    var grade = item.grade;
                    var text = item.text;
                    var tip = item.tip;
                    me._uHealthGrade.add(text, null, {
                        'value': grade,
                        'tip': tip
                    });
                });
                me._sDefaultValue = allSelecteds;
                this._uHealthGrade.setValue(allSelecteds);
            }
            break;

        }
    }),
        UI_CONDITION_PLUS_CLASS = UI_CONDITION_PLUS.prototype;

    UI_CONDITION_PLUS_CLASS.clear = function() {
        var me = this;
        switch(this._uType) {
        case 'fc_budget_type':
            me._uSelect.setSelectedIndex(0);
            break;
        case "select":
            me._uSelect.setSelectedIndex(0);
            break;
        case "dropdownlist":
            me._uDropdownList.setValue(me._sDefaultValue);
            break;
        case "health_grade":
            me._uHealthGrade.setValue(me._sDefaultValue);
            break;
        case 'input':
            me._uInput.setValue('');
            break;
        case 'inputTree':
            me._uInputTree.clear();
            break;
        case 'calendar':
            me._uMultiCalendar.clear();
            break;
        case 'trade':
            me._uFirstTrade.setSelectedIndex(0);
            me._uSecTrade.clear();
            baidu.each([{
                'value': NONE,
                "text": '请选择二级行业'
            }], function(item) {
                me._uSecTrade.add(item.text, null, {
                    value: item.value
                });
            });
            me._uSecTrade.setSelectedIndex(0);
            break;
        case 'province_city':
            me._uProvince.setSelectedIndex(0);

            me._uCity.clear();
            baidu.each([{
                'value': NONE,
                "text": '请选择市'
            }], function(item) {
                me._uCity.add(item.text, null, {
                    value: item.value
                });
            });
            me._uCity.setSelectedIndex(0);
            break;
        case 'math':
            this._uMathLeft.setValue('');
            this._uMathRight.setValue('');
            this._uMath.setValue(NONE);
            this._uMath.$change();
            break;
        case 'wm_off_time':
        case 'fc_off_time':
            me._uHitSelect.setSelectedIndex(0);
            me._uHitFirstTimeSelect.setSelectedIndex(0);
            me._uHitSecondTimeSelect.setSelectedIndex(0);
            me._uHitSelect.$change();
            break;
        case 'busi_season':
            me._uHaveOrNotSelect.setSelectedIndex(0);
            me._uHaveOrNotSelect.$change();
            me._uSeasonMultiSelect.setValue([]);
            break;
        }
    }, UI_CONDITION_PLUS_CLASS.reset = function() {
        var me = this;
        switch(this._uType) {
        case 'fc_budget_type':
            me._uSelect.setSelectedIndex(0);
            break;
        case "select":
            me._uSelect.setSelectedIndex(0);
            break;
        case "dropdownlist":
            if(me._sDefaultValue) {
                me._uDropdownList.setValue(me._sDefaultValue);
            } else {
                me._uDropdownList.setValue([]);
            }

            break;
        case "health_grade":
            if(me._sDefaultValue) {
                me._uHealthGrade.setValue(me._sDefaultValue);
            } else {
                me._uHealthGrade.setValue([]);
            }

            break;
        case 'input':
            me._uInput.setValue('');
            break;
        case 'inputTree':
            me._uInputTree.setValue('');
            break;
        case 'calendar':
            me._uMultiCalendar.clear();
            break;
        case 'trade':
            me._uFirstTrade.setSelectedIndex(0);
            me._uSecTrade.clear();
            baidu.each([{
                'value': NONE,
                "text": '请选择二级行业'
            }], function(item) {
                me._uSecTrade.add(item.text, null, {
                    value: item.value
                });
            });
            me._uSecTrade.setSelectedIndex(0);
            break;
        case 'province_city':
            me._uProvince.setSelectedIndex(0);
            me._uCity.clear();
            baidu.each([{
                'value': NONE,
                "text": '请选择市'
            }], function(item) {
                me._uCity.add(item.text, null, {
                    value: item.value
                });
            });
            me._uCity.setSelectedIndex(0);
            break;
        case 'math':
            this._uMathLeft.setValue('');
            this._uMathRight.setValue('');
            this._uMath.setValue(NONE);
            this._uMath.$change();
            break;
        case 'wm_off_time':
        case 'fc_off_time':
            me._uHitSelect.setSelectedIndex(0);
            me._uHitSelect.$change();
            me._uHitFirstTimeSelect.setSelectedIndex(0);
            me._uHitSecondTimeSelect.setSelectedIndex(0);
            break;
        case 'busi_season':
            me._uHaveOrNotSelect.setSelectedIndex(0);
            me._uHaveOrNotSelect.$change();
            me._uSeasonMultiSelect.setValue([]);
            break;
        }
    }, UI_CONDITION_PLUS_CLASS.initValue = function(data) {
        var me = this;
        switch(this._uType) {
        case "select":
            data = data || [];
            if(me._sName != 'fc_budget_type') {
                data = [{
                    value: '-1',
                    text: '请选择'
                }].concat(data);
            }

            baidu.each(data, function(item) {
                me._uSelect.add(item.text, null, {
                    value: item.value
                });
            });
            me._uSelect.setSelectedIndex(0);
            break;
        case "dropdownlist":
            var values = [];
            baidu.each(data, function(item) {
                var texts = item.text.split('~');
                if(texts.length == 2) {
                    var text = texts[0];
                    var tip = texts[1];
                    me._uDropdownList.add(decodeURIComponent(text), null, {
                        'value': item.value,
                        'tip': tip
                    });
                } else {

                    me._uDropdownList.add(decodeURIComponent(item.text), null, {
                        'value': item.value
                    });
                }
                values.push(item.value + '');
            });
            me._uDropdownList.setValue(values);
            me._sDefaultValue = values;
            break;

        case "inputTree":
            this._uInputTree = $fastCreate(UI_INPUT_TREE, me.theNode.childNodes[1], this, {
                datasource: data[0],
                asyn: true
            })
            this._uInputTree.onloadtree = function(value, func) {
                me.onloaddata.call(this, value, func, me._sName);
            }

            this._uInputTree.$setSize(200, 20);
            break;
        case "trade":
            data = [{
                'value': NONE,
                "text": '请选择一级行业'
            }].concat(data);
            baidu.each(data, function(item) {
                me._uFirstTrade.add(item.text, null, {
                    value: item.value
                });
            });
            baidu.each([{
                'value': NONE,
                "text": '请选择二级行业'
            }], function(item) {
                me._uSecTrade.add(item.text, null, {
                    value: item.value
                });
            });
            me._uFirstTrade.setSelectedIndex(0);
            me._uSecTrade.setSelectedIndex(0);
            break;

        case "province_city":
            data = [{
                'value': NONE,
                "text": '请选择省'
            }].concat(data);
            baidu.each(data, function(item) {
                me._uProvince.add(item.text, null, {
                    value: item.value
                });
            });
            baidu.each([{
                'value': NONE,
                "text": '请选择市'
            }], function(item) {
                me._uCity.add(item.text, null, {
                    value: item.value
                });
            });
            me._uProvince.setSelectedIndex(0);
            me._uCity.setSelectedIndex(0);
            break;
        }

    }, UI_CONDITION_PLUS_CLASS.setValue = function(operator, firstValue, secondValue) {
        var me = this;
        switch(this._uType) {
        case 'fc_budget_type':
            switch(operator + '') {
                case NONE:
                    me._uSelect.setValue(NONE);
                    break;
                case EQ:
                    if(firstValue == '0' || firstValue == '1') {
                        me._uSelect.setValue(firstValue);
                    } else {
                        me._uSelect.setValue(IS_NULL);
                    }
                    break;
                case IS_NULL:
                    me._uSelect.setValue(IS_NULL);
                    break;
            }
            break;
        case 'input':
            me._uInput.setValue(firstValue);
            break;
        case "select":
            if(firstValue === null || firstValue === undefined) {
                firstValue = '-1';
            }
            me._uSelect.setValue(firstValue);
            break;
        case "health_grade":
            var values = firstValue.split(',');
            me._uHealthGrade.setValue(values);
            break;
        case "dropdownlist":
            var values = firstValue.split(',');
            me._uDropdownList.setValue(values);
            break;
        case "calendar":
            var firstValue = firstValue;
            var secondValue = secondValue;
            var date = {
                begin: null,
                end: null
            };
            if(firstValue) {
                date.begin = baidu.date.parse(firstValue)
            }
            if(secondValue) {
                date.end = baidu.date.parse(secondValue);
            }
            me._uMultiCalendar.setDate(date);
            break;
        case "inputTree":
            me._uInputTree.setValue(firstValue);
            if(secondValue) {
                me._uInputTree.setText(secondValue);
            }
            break;
        case 'math':
            this._uMath.setValue(operator);
            this._uMath.$change();
            this._uMathLeft.setValue(firstValue);
            this._uMathRight.setValue(secondValue);
            break;
        case 'wm_off_time':
        case "fc_off_time":

            me._uHitSelect.setValue(operator);
            me._uHitSelect.$change();
            function convertValue(value, control) {
                var hour = parseInt(value.split(':')[0], 10);
                var minute = value.split(':')[1] == '00' ? 0 : 1;
                control.setValue(2 * hour + minute + '');
            }

            if(firstValue) {
                convertValue(firstValue, me._uHitFirstTimeSelect);
            }
            if(secondValue) {
                convertValue(secondValue, me._uHitSecondTimeSelect);
            }
            break;
        case 'trade':
            firstValue = firstValue ? firstValue : '-1';
            me._uFirstTrade.setValue(firstValue);
            me._uFirstTrade.$change(secondValue);
            break;
        case 'province_city':
            firstValue = firstValue ? firstValue : '-1';
            me._uProvince.setValue(firstValue);
            me._uProvince.$change(secondValue);
            break;
        case 'busi_season':
            var values = firstValue.split(',');
            me._uHaveOrNotSelect.setValue(operator);
            me._uHaveOrNotSelect.$change();
            me._uSeasonMultiSelect.setValue(values);
            break;
        }
    }, UI_CONDITION_PLUS_CLASS.setDefaultValue = function(defaultData) {
        var me = this;

        switch(this._uType) {
        case 'select':
            var item = defaultData[0];
            me._sDefaultValue = item.value;
            me._uSelect.remove(0);
            me._uSelect.setValue(item.value);
            //add(item.text, ,{'value':item.value});
            break;
        case "inputTree":
            me._uInputTree.setValue(defaultData.value + '');
            break;
        case "dropdownlist":
            var values = [];
            baidu.each(defaultData, function(item) {
                values.push(item.value + '');
            })
            me._sDefaultValue = values;
            me._uDropdownList.setValue(values);
            break;
        }
    }, UI_CONDITION_PLUS_CLASS.getValue = function() {
        var me = this;
        var returnValue = {
            'conditionId': me._uId - 0,
            'conditionName': me._sName,
            'operator': this._sOperatorType || 0,
            'firstValue': '',
            'secondValue': ''
        };
        var trim = baidu.string.trim;
        switch(me._uType) {
        case 'fc_budget_type':
            var value = me._uSelect.getValue();
            // 全部：不传
            // 日预算：operator:eg,first:0
            // 周预算：operator:eg,first:1
            // 未设置预算：operator:isnull
            switch(value) {
                case NONE:
                    returnValue.operator = NONE;
                    break;
                case '0':
                    returnValue.operator = EQ;
                    returnValue.firstValue = '0';
                    break;
                case '1':
                    returnValue.operator = EQ;
                    returnValue.firstValue = '1';
                    break;
                case IS_NULL:
                    returnValue.operator = IS_NULL;
                    break; 
            }
            break;
        case 'input':
            var operator = EQ;
            if(this._sIsLike) {
                operator = LIKE;
            }
            returnValue.operator = operator;
            returnValue.firstValue = trim(me._uInput.getValue() + '');
            break;
        case "select":
            returnValue.operator = returnValue.operator || EQ;
            if(me._uSelect.getValue() + '' == NONE) {
                returnValue.firstValue = null;
            } else {
                returnValue.firstValue = trim(me._uSelect.getValue() + '');
            }
            break;
        case "dropdownlist":
            returnValue.operator = IN;
            returnValue.firstValue = trim(me._uDropdownList.getValue() + '');
            break;
        case "health_grade":
            returnValue.operator = IN;
            returnValue.firstValue = trim(me._uHealthGrade.getValue() + '');
            break;
        case "calendar":
            var date = me._uMultiCalendar.getDate();
            //获取值判断
            if(date.begin && date.end) {
                returnValue.operator = BETWEEN;
            } else if(date.begin) {
                returnValue.operator = GE;
            } else if(date.end) {
                returnValue.operator = LE;
            } else {
                returnValue.operator = EQ;
            }

            date.begin && (returnValue.firstValue = baidu.date.format(date.begin, 'yyyy-MM-dd'));
            date.end && (returnValue.secondValue = baidu.date.format(date.end, 'yyyy-MM-dd'));
            break;
        case "inputTree":
            //input Tree 操作符类型一直为等于
            returnValue.operator = EQ;
            //左值传id 右值传值名称
            returnValue.firstValue = me._uInputTree.getValue();
            returnValue.secondValue = me._uInputTree.getText();
            break;
        case "math":
            //获取操作符
            returnValue.operator = me._uMath.getValue();
            returnValue.firstValue = trim(me._uMathLeft.getValue() + '');
            if(returnValue.operator == BETWEEN) {
                returnValue.secondValue = trim(me._uMathRight.getValue() + '');
            }
            break;
        case 'wm_off_time':
        case "fc_off_time":
            //获取操作符
            returnValue.operator = me._uHitSelect.getValue() - 0;
            if(me._uHitFirstTimeSelect.getValue() != '-1') {
                returnValue.firstValue = me._uHitFirstTimeSelect.getSelected().getContent();
            }
            if(me._uHitSecondTimeSelect.getValue() != '-1') {
                returnValue.secondValue = me._uHitSecondTimeSelect.getSelected().getContent();
            }
            break;
        case "trade":
            // 操作符一直是等于 
            returnValue.operator = EQ;
            if(me._uFirstTrade.getValue() + '' == NONE) {
                returnValue.firstValue = '';
            } else {
                returnValue.firstValue = trim(me._uFirstTrade.getValue() + '');
            }

            if(me._uSecTrade.getValue() + '' == NONE) {
                returnValue.secondValue = '';
            } else {
                returnValue.secondValue = trim(me._uSecTrade.getValue() + '');
            }
            break;
        case "province_city":
            // 操作符一直是等于 
            returnValue.operator = EQ;
            if(me._uProvince.getValue() + '' == NONE) {
                returnValue.firstValue = '';
            } else {
                returnValue.firstValue = trim(me._uProvince.getValue() + '');
            }
            if(me._uCity.getValue() + '' == NONE) {
                returnValue.secondValue = '';
            } else {
                returnValue.secondValue = trim(me._uCity.getValue() + '');
            }
            break;
        case 'busi_season':
            //获取操作符
            returnValue.operator = trim(me._uHaveOrNotSelect.getValue() + '') - 0;
            if(returnValue.operator == IS_NOT_NULL) {
                returnValue.firstValue = trim(me._uSeasonMultiSelect.getValue() + '');
            } else {
                returnValue.firstValue = '';
            }
            break;
        }
        return returnValue;
    }, UI_CONDITION_PLUS_CLASS.show = function() {
        var me = this;
        var type = me._uType;
        if(type == 'select') {
            me.initValue(me.attachedValues);
        }
        baidu.dom.show(this.parEle);
    }, UI_CONDITION_PLUS_CLASS.hide = function() {
        var me = this;
        var type = me._uType;
        if(type == 'select') {
            me._uSelect.clear();
        }
        baidu.dom.hide(this.parEle);
    }, UI_CONDITION_PLUS_CLASS.getUsable = function() {
        return this.parEle.style.display == 'none' ? false : true;
    }, UI_CONDITION_PLUS_CLASS.getType = function() {
        return this._uType;
    }, UI_CONDITION_PLUS_CLASS.isDefault = function() {
        return this._sIsDefault;
    }, UI_CONDITION_PLUS_CLASS.isValidate = function() {
        var me = this;
        var flag = false;
        var validateText = function(type, text) {
            if(type == BETWEEN) {
                core.dom.setStyle(me._uMathLeft.getOuter(), 'border', 'solid 1px red');
                core.dom.setStyle(me._uMathRight.getOuter(), 'border', 'solid 1px red');
            } else if(type == NONE) {
                core.dom.setStyle(me._uMathLeft.getOuter(), 'border', '1px solid #A9ADB6');
                core.dom.setStyle(me._uMathRight.getOuter(), 'border', '1px solid #A9ADB6');
            } else {
                core.dom.setStyle(me._uMathLeft.getOuter(), 'border', 'solid 1px red');
                core.dom.setStyle(me._uMathRight.getOuter(), 'border', '1px solid #A9ADB6');
            }
            
            if(!text){
                core.dom.setStyle(me._uMathLeft.getOuter(), 'border', '1px solid #A9ADB6');
                core.dom.setStyle(me._uMathRight.getOuter(), 'border', '1px solid #A9ADB6');
            }
            
            me.invalidater.innerHTML = text;
        };

        if(this._uType == 'math') {
            if(me._uMath.getValue() == BETWEEN) {
                var leftValue = me._uMathLeft.getValue() && parseInt(me._uMathLeft.getValue());
                var rightValue = me._uMathRight.getValue() && parseInt(me._uMathRight.getValue());
                if(isNaN(leftValue) || isNaN(rightValue)) {
                    flag = true;
                    validateText(BETWEEN, '请正确填写查询范围');
                } else {
                    if(leftValue && rightValue && (leftValue > rightValue)) {
                        flag = true;
                        validateText(BETWEEN, '请正确填写查询范围');
                    } else {
                        flag = false;
                        validateText(BETWEEN, '');
                    }
                }
            } else if(me._uMath.getValue() == NONE) {
                validateText(NONE, '')
                flag = false;
            } else {
                var leftValue = me._uMathLeft.getValue();
                if(isNaN(leftValue)) {
                    flag = true;
                    validateText(me._uMath.getValue(), '数值不合法，请重新输入');
                }
            }
        }if(this._uType == 'wm_off_time' || this._uType == 'fc_off_time'){
            if(me._uHitFirstTimeSelect.getValue()!='-1'&&me._uHitSecondTimeSelect.getValue()!='-1'&&parseInt(me._uHitFirstTimeSelect.getValue(),10) > parseInt(me._uHitSecondTimeSelect.getValue(),10)){
                core.dom.setStyle(me._uHitFirstTimeSelect.getOuter(), 'border', 'solid 1px red');
                core.dom.setStyle(me._uHitSecondTimeSelect.getOuter(), 'border', 'solid 1px red');
                me.invalidater.innerHTML = '请选择填写查询范围';
                flag = true;
            }
        }
        return flag;
    }
})();