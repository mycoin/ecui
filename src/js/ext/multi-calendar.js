
/*
multi-calendar 两选日历控件
<div ecui="
    type     :multi-calendar;
    id       :dateRange;
    beginname:beginDate;endname:endDate;
    bdate    :2012/12/12;edate:2033-12-12;
    typename : "dateType",
    exact    : true,
    remind   :请选择时间范围
"></div>

    CONST_DEFAULT       空值
    CONST_TODAY         昨天
    CONST_YESTERD       今天
    CONST_TOMORROW      明天
    CONST_THIS_WEEK     上周
    CONST_LAST_WEEK     本周
    CONST_NEXT_WEEK     下周
    CONST_LAST_MONTH"   个月
    CONST_THIS_MON      本月
    CONST_NEXT_MONTH"   个月


getValue(true) 返回快捷操作值
属性
_nOptionSize  - 下接选择框可以用于选择的条目数量
_cSelected    - 当前选中的选项
_uText        - 下拉框的文本框
_uButton      - 下拉框的按钮
_uOptions     - 下拉选择框
*/
(function () {

    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        string = core.string,

        DATE = Date,
        REGEXP = RegExp,
        DOCUMENT = document,

        children = dom.children,
        createDom = dom.create,
        getParent = dom.getParent,
        moveElements = dom.moveElements,
        formatDate = string.formatDate,

        $fastCreate = core.$fastCreate,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_BUTTON = ui.Button,
        UI_BUTTON_CLASS = UI_BUTTON.prototype,
        UI_INPUT_CONTROL = ui.InputControl,
        UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype,
        UI_CALENDAR = ui.Calendar,
        UI_CALENDAR_CLASS = UI_CALENDAR.prototype,
        UI_CALENDAR_CANCEL_CLASS = UI_CALENDAR_CLASS.Cancel.prototype,
        UI_CALENDAR_PANEL = UI_CALENDAR_CLASS.Panel,

        UI_CALENDAR_STR_DEFAULT = '<span class="ui-calendar-default">请选择一个日期</span>',
        UI_MULTI_CALENDAR_STR_DEFAULT = '<span class="ui-multi-calendar-default">请选择时间范围</span>',
        UI_CALENDAR_STR_PATTERN = 'yyyy-MM-dd',

        UI_CALENDAR_VALUE_DEFAULT   = 'CONST_DEFAULT',   //空值
        UI_CALENDAR_VALUE_TODAY     = "CONST_TODAY",     //昨天
        UI_CALENDAR_VALUE_YESTERDAY = "CONST_YESTERDAY", //今天
        UI_CALENDAR_VALUE_TOMORROW  = "CONST_TOMORROW",  //明天
        UI_CALENDAR_VALUE_THISWEEK  = "CONST_THIS_WEEK",  //上周
        UI_CALENDAR_VALUE_LASTWEEK  = "CONST_LAST_WEEK",  //本周
        UI_CALENDAR_VALUE_NEXTWEEK  = "CONST_NEXT_WEEK",  //下周
        UI_CALENDAR_VALUE_LASTMONTH = "CONST_LAST_MONTH", //上个月
        UI_CALENDAR_VALUE_THISMONTH = "CONST_THIS_MONTH", //本月
        UI_CALENDAR_VALUE_NEXTMONTH = "CONST_NEXT_MONTH"; //下个月

    /**
     * 初始化日历控件。
     * options 对象支持的属性如下：
     * year    日历控件的年份
     * month   日历控件的月份(1-12)
     * @public
     *
     * @param {Object} options 初始化选项
     */
    var UI_MULTI_CALENDAR = ui.MultiCalendar = 
        inheritsControl(
            UI_CALENDAR,
            'ui-multi-calendar',
            function (el, options) {
                options.hidden = true;
                options.yearRange && (this._nYearRange = options.yearRange - 0);
                if (options.remind) {
                    UI_MULTI_CALENDAR_STR_DEFAULT = '<span class="ui-calendar-default">'
                        + options.remind
                        + '</span>';
                }
            },
            //liuronghan
            function (el, options) {
                var o = createDom(), els;

                o.innerHTML = ""
                    + '<input type="hidden" name="'+ (options.beginname ? options.beginname : 'beginDate') +'" />'
                    + '<input type="hidden" name="'+ (options.endname ? options.endname : 'endDate') +'" />'
                    + '<input type="hidden" '+ (options.typename ? 'name="' + options.typename + '"' : '') +' />';
                
                if (options.bdate) {
                    this._oBegin = string.parseDate(options.bdate);
                }
                if (options.now) {
                    this._oNow = string.parseDate(options.now); //服务器返回的今天时间戳
                }
                if (options.edate) {
                    this._oEnd = string.parseDate(options.edate);
                }
                if (options.simplevalue) {
                    this._oSimpleValue = options.simplevalue;
                }

                this._oSimpleValueList = [
                    {text: "昨天", value: UI_CALENDAR_VALUE_YESTERDAY}, 
                    {text: "今天", value: UI_CALENDAR_VALUE_TODAY}, 
                    {text: "明天", value: UI_CALENDAR_VALUE_TOMORROW}, 
                    {text: "上周", value: UI_CALENDAR_VALUE_LASTWEEK}, 
                    {text: "本周", value: UI_CALENDAR_VALUE_THISWEEK}, 
                    {text: "下周", value: UI_CALENDAR_VALUE_NEXTWEEK}, 
                    {text: "上个月", value: UI_CALENDAR_VALUE_LASTMONTH},
                    {text: "本月", value: UI_CALENDAR_VALUE_THISMONTH},
                    {text: "下个月", value: UI_CALENDAR_VALUE_NEXTMONTH}
                ];
                els = children(o);    
                this._eBeginInput = els[0];
                this._eEndInput = els[1];
                this._eSimpleInput = els[2];     //@liuronghan 昨天，最近7天，上周，本月，上个月，上个季度
                this._bExact = !! options.exact; //@liuronghan 是否精确到秒级别

                moveElements(o, el, true);
            }
        );
    //通过快捷菜单计算日期
    function UI_MULTI_CALENDAR_CALCULATE (now, value) {
        // var now = new Date("2013/12/30");

        var yy = now.getFullYear(), mm = now.getMonth(), dd = now.getDate();
        var iNow = new Date(yy, mm, dd, 12, 00, 00).getTime();
        var iBegin = iEnd = null;

        if(value == UI_CALENDAR_VALUE_TODAY) {
            iBegin = iEnd = new Date(yy, mm, dd, 12, 00, 00).getTime();
        } else if (value == UI_CALENDAR_VALUE_YESTERDAY) {
            iBegin = iEnd = new Date(yy, mm, dd, 12, 00, 00).getTime() - 86400000;
        } else if (value == UI_CALENDAR_VALUE_TOMORROW) {
            iBegin = iEnd = new Date(yy, mm, dd, 12, 00, 00).getTime() + 86400000;
        } else if (value == UI_CALENDAR_VALUE_THISWEEK) {
            iBegin = iNow - ((now.getDay() - 1) * 86400000);
            iEnd = iBegin + 7 * 86400000;
        } else if (value == UI_CALENDAR_VALUE_LASTWEEK) {
            iNow = iNow - 7 * 86400000;
            iBegin = iNow - (now.getDay() - 1) * 86400000;
            iEnd = iBegin + 6 * 86400000;
        } else if (value == UI_CALENDAR_VALUE_NEXTWEEK) {
            iNow = iNow + 7 * 86400000;
            iBegin = iNow - (now.getDay() - 1) * 86400000;
            iEnd = iBegin + 6 * 86400000;
        } else if (value == UI_CALENDAR_VALUE_THISMONTH) {
            iBegin = new Date(yy, mm, 1, 12, 00, 00).getTime();
            iEnd = new Date(yy, mm + 1, 1, 00, 00, 00).getTime() - 12 * 3600000 ;
        } else if (value == UI_CALENDAR_VALUE_LASTMONTH) {
            iBegin = new Date(yy, mm - 1, 1, 12, 00, 00).getTime();
            iEnd = new Date(yy, mm, 1, 00, 00, 00).getTime() - 12 * 3600000 ;
        } else if (value == UI_CALENDAR_VALUE_NEXTMONTH) {
            iBegin = new Date(yy, mm + 1, 1, 12, 00, 00).getTime();
            iEnd = new Date(yy, mm + 2, 1, 00, 00, 00).getTime() - 12 * 3600000 ;
        } else {
            return null;
        }
        return {begin: new Date(iBegin), end: new Date(iEnd), simple: value};
    }
    var UI_MULTI_CALENDAR_CLASS = UI_MULTI_CALENDAR.prototype;

    var UI_MULTI_CALENDAR_PANEL = UI_MULTI_CALENDAR_CLASS.Panel = 
        inheritsControl(
            UI_CONTROL,
            'ui-multi-calendar-panel',
            function () {},
            function (el, options) {
                var type = this.getTypes()[0],
                    html = [], range = options.range || {}, links = [];

                this._oRange = range;
                html.push('<div class="'+ type +'-quick"></div>');
                html.push('<div class="'+ type +'-cal-area"><div class="'+ type +'-text"><strong>起始时间：</strong><span></span></div><div class="'+ UI_CALENDAR_PANEL.TYPES +'"></div></div>');
                html.push('<div class="'+ type +'-cal-area"><div class="'+ type +'-text"><strong>结束时间：</strong><span></span></div><div class="'+ UI_CALENDAR_PANEL.TYPES +'"></div></div>');
                html.push('<div class="'+ type +'-buttons"><div class="ui-button-g'+ UI_BUTTON.TYPES +'">确定</div><div class="'+ UI_BUTTON.TYPES +'">取消</div></div>');
                el.innerHTML = html.join('');
                el = children(el);

                this._eQuikeSelect = el[0];
                this._eBeginText = el[1].firstChild.lastChild;
                this._eEndText = el[2].firstChild.lastChild;
                this._uBeginCal = $fastCreate(this.Cal, el[1].lastChild, this, {range: range});
                this._uBeginCal._sType = 'begin';
                this._uEndCal = $fastCreate(this.Cal, el[2].lastChild, this, {range: range});
                this._uEndCal._sType = 'end';
                this._uSubmitBtn = $fastCreate(this.Button, el[3].firstChild, this);
                this._uSubmitBtn._sType = 'submit';
                this._uCancelBtn = $fastCreate(this.Button, el[3].lastChild, this);
                this._uCancelBtn._sType = 'cancel';
            }
        );

    var UI_MULTI_CALENDAR_CANCEL_CLASS = 
        (UI_MULTI_CALENDAR_CLASS.Cancel = 
            inheritsControl(UI_CALENDAR_CLASS.Cancel)
        ).prototype;

    var UI_MULTI_CALENDAR_PANEL_CLASS = UI_MULTI_CALENDAR_PANEL.prototype;

    var UI_MULTI_CALENDAR_PANEL_CAL_CLASS = (
        UI_MULTI_CALENDAR_PANEL_CLASS.Cal = 
            inheritsControl(UI_CALENDAR_PANEL)
        ).prototype;

    var UI_MULTI_CALENDAR_PANEL_BUTTON_CLASS = 
        (UI_MULTI_CALENDAR_PANEL_CLASS.Button = 
            inheritsControl(UI_BUTTON)
        ).prototype;
    
    function UI_MULTI_CALENDAR_TEXT_FLUSH(con) {
        var el = con._eText;
        if (el.innerHTML == '') {
            con._uCancel.hide();
            if (con._bTip) {
                el.innerHTML = UI_MULTI_CALENDAR_STR_DEFAULT;
            }
        }
        else {
            con._uCancel.show();
        }
    };

    UI_MULTI_CALENDAR_CLASS.init = function () {
        UI_INPUT_CONTROL_CLASS.init.call(this);
        var result = UI_MULTI_CALENDAR_CALCULATE(this._oNow, this._oSimpleValue) || {
            begin: this._oBegin,
            end: this._oEnd,
            simple: UI_CALENDAR_VALUE_DEFAULT
        };
        this.setDate(result);
        this._uPanel.init();
    };

    UI_MULTI_CALENDAR_CLASS.setDate = function (date) {
        var str = [], beginTxt, endTxt;

        if (date == null) {
            //@liuronghan 如果页面没有任何日历的选择，不用默认给今天这个链接
            date = {begin: null, end: null, simple: UI_CALENDAR_VALUE_DEFAULT};
        }
        beginTxt = date.begin ? formatDate(date.begin, UI_CALENDAR_STR_PATTERN) : '';
        endTxt = date.end ? formatDate(date.end, UI_CALENDAR_STR_PATTERN) : '';

        this._oBegin = date.begin;    
        this._oEnd = date.end;
        
        if(this._bExact) {
            //@liuronghan
            this._eBeginInput.value = beginTxt ? beginTxt + " 00:00:00" : "";
            this._eEndInput.value = endTxt ? endTxt + " 23:59:59" : "";
        } else {
            this._eBeginInput.value = beginTxt;
            this._eEndInput.value = endTxt;
        }
        this._eInput.value = beginTxt + ',' + endTxt;
        if (this._oBegin) {
            str.push(beginTxt);
        }
        if (this._oEnd) {
            str.push(endTxt);
        }
        if (str.length == 1) {
            str.push(this._oEnd ? '之前' : '之后');
            str = str.join('');
        }
        else if (str.length == 2) {
            str = str.join('至');
        }
        else {
            str = '';
        }
        // @liuronghan 如果选择的是快捷操作文案如何显示？？
        /* if(date.simple != UI_CALENDAR_VALUE_DEFAULT) {
            for (var i = 0; i < this._oSimpleValueList.length; i++) {
                var item = this._oSimpleValueList[i];
                if(item.value == date.simple) {
                    str = item.text; //显示文案
                    break;
                }
            };
        }*/
        this._eText.innerHTML = str;
        this._oSimpleValue = date.simple; //设置简单日期标记

        this._eSimpleInput.value = this._oSimpleValue;
        this._uPanel._oSimpleValue = this._oSimpleValue;
        UI_MULTI_CALENDAR_TEXT_FLUSH(this);
    };

    UI_MULTI_CALENDAR_CLASS.getDate = function () {
        return {begin: this._oBegin, end: this._oEnd, simple: this._oSimpleValue};
    };

    /**
     * @event
     * 点击输入框右侧的取消按钮时触发
     */
    UI_MULTI_CALENDAR_CANCEL_CLASS.$click = function() {
        var par = this.getParent();
        UI_CALENDAR_CANCEL_CLASS.$click.call(this);
        par.clearRange();
    };

    /**
     * 清除日历面板的range限制
     * @public
     */
    UI_MULTI_CALENDAR_CLASS.clearRange = function() {
        this._uPanel._oRange.begin = null;
        this._uPanel._oRange.end = null;
        this._uPanel._uBeginCal.setRange(null, null);
        this._uPanel._uEndCal.setRange(null, null);
    };
    //快捷链接高亮操作
    UI_MULTI_CALENDAR_PANEL_CLASS.setDate = function (date) {
        var range = this._oRange, 
            begin, end, simple;

        this._oBeginDate = date.begin;
        this._oEndDate = date.end;

        this._oSimpleValue = date.simple; //快捷链接
        if (date.begin) {
            this._eBeginText.innerHTML = formatDate(date.begin, UI_CALENDAR_STR_PATTERN);
        } else {
            this._eBeginText.innerHTML = '<span class="ui-multi-calendar-panel-default-text">请选择起始日期</span>';
        }

        if (date.end) {
            this._eEndText.innerHTML = formatDate(date.end, UI_CALENDAR_STR_PATTERN);
        } else {
            this._eEndText.innerHTML = '<span class="ui-multi-calendar-panel-default-text">请选择结束日期</span>';
        }
        end = range.end ? range.end : date.end;
        if (range.end && date.end && date.end.getTime() < range.end.getTime()) {
                end =  date.end;
        }
        this._uBeginCal.setRange(range.begin, end, true);
        this._uBeginCal.setDate(date.begin);

        begin = range.begin ? range.begin : date.begin;
        if (range.begin && date.begin && date.begin.getTime() > range.begin.getTime()) {
                begin =  date.begin;
        }

        this._uEndCal.setRange(begin, range.end, true);
        this._uEndCal.setDate(date.end);

        this._uSetSimpleActive(); //渲染快捷操作样式
    };

    UI_MULTI_CALENDAR_PANEL_CLASS.$blur = function () {
        UI_CONTROL_CLASS.$blur.call(this);
        this.hide();
    };

    /**
     * 隐藏日历面板，隐藏时需要调整range
     * @override
     */
    UI_MULTI_CALENDAR_PANEL_CLASS.hide = function (){
        UI_CONTROL_CLASS.hide.call(this);
        var par = this.getParent();
        var date = par.getDate();

        if (par._nYearRange) {
            if (date.end) {
                this._oRange.begin = new Date(date.end);
                this._oRange.begin.setFullYear(
                    this._oRange.begin.getFullYear() - par._nYearRange
                );
            }
            if (date.begin) {
                this._oRange.end = new Date(date.begin);
                this._oRange.end.setFullYear(
                    this._oRange.end.getFullYear() + par._nYearRange
                );
            }
        }
    };

    UI_MULTI_CALENDAR_PANEL_CLASS.init = function () {
        UI_CONTROL_CLASS.init.call(this);

        //渲染快捷操作
        this._init(); 
        this._uBeginCal.init();
        this._uEndCal.init();

        this._oNow = this.getParent()._oNow;//借用一下今天时间戳
    };

    //渲染快速日历选择器
    UI_MULTI_CALENDAR_PANEL_CLASS._init = function () {
        var par = this.getParent(),
            that = this, 
            html = [], 
            list = par._oSimpleValueList || [],
            parentNode = this._eQuikeSelect; //获取父控件
        
        that._oSimpleValue = par._oSimpleValue;
        that._oNow = par._oNow;
        
        for (var i = 0, length = list.length; i < length; i++) {
            html.push(string.format('<SPAN class="' + that.getTypes() + '-quick-item" title="#{text}" data-simple="#{value}">#{text}</SPAN>', list[i]));
        };
        core.util.attachEvent(parentNode, 'click', function (event) {
            var event = event || window.event, 
                element = event.target || event.srcElement, 
                value = null;
            if(value = element.getAttribute('data-simple')) {
                var res = null;
                if(res = UI_MULTI_CALENDAR_CALCULATE(that._oNow, value)) {
                    that._oSimpleValue = value;
                    that.setDate(res);
                    
                    //@PS：如果要在点击链接后仅仅是定位日历的话，请在这里将计算之后的日期设置到面板
                    //@NS：点击立即设置值并且隐藏
                    triggerEvent(that, 'change');
                }
            }
        });
        parentNode.innerHTML = html.join('|');
        // setTimeout(function() {that._uSetSimpleActive();}, 10); //默认执行
        return this;
    };

    UI_MULTI_CALENDAR_PANEL_CLASS._uSetSimpleActive = function () {
        var className = this.getTypes() + '-quick-item';
        var ele = this._eQuikeSelect.getElementsByTagName('SPAN');
        for(var i = 0, length = ele.length; i < length; i++) {
            ele[i].className = className;
            if(ele[i].getAttribute('data-simple') == this._oSimpleValue) {
                ele[i].className = className + ' ' + className + '-selected';
            } else {
                ele[i].className = className;
            }
        }
    };
    UI_MULTI_CALENDAR_PANEL_CLASS.$change = function () {
        var par = this.getParent(),
            beginDate = this._oBeginDate,
            simple = this._oSimpleValue,
            endDate = this._oEndDate;
        if (triggerEvent(par, 'change', [beginDate, endDate, simple])) {
            par.setDate({begin: beginDate, end: endDate, simple: simple});
        }
        this.hide();
    };

    UI_MULTI_CALENDAR_PANEL_CLASS.$setDate = function (date, type) {
        var key = type.charAt(0).toUpperCase() + type.substring(1);
        var par = this.getParent();

        this['_e' + key + 'Text'].innerHTML = formatDate(date, UI_CALENDAR_STR_PATTERN);
        this['_o' + key + 'Date'] = date;

        if (type == 'begin') {
            if (par._nYearRange) {
                this._oRange.end = new Date(date);
                this._oRange.end.setFullYear(this._oRange.end.getFullYear() + par._nYearRange);
            }
            this._uEndCal.setRange(date, this._oRange.end);
        } else if(type == "end") {
            if (par._nYearRange) {
                this._oRange.begin = new Date(date);
                this._oRange.begin.setFullYear(this._oRange.begin.getFullYear() - par._nYearRange);
            }
            this._uBeginCal.setRange(this._oRange.begin, date);
        }
    };

    UI_MULTI_CALENDAR_PANEL_CAL_CLASS.$blur = function () {
        UI_CONTROL_CLASS.$blur.call(this);
    };

    UI_MULTI_CALENDAR_PANEL_CAL_CLASS.$change = function (event, date) {
        var par = this.getParent();
        this._oDateSel = date;

        par._oSimpleValue = UI_CALENDAR_VALUE_DEFAULT; //清除
        par._uSetSimpleActive();
        
        par.$setDate(date, this._sType);
    };

    UI_MULTI_CALENDAR_PANEL_CAL_CLASS.setRange = function (begin, end, isSilent) {
        this._uMonthView.setRange(begin, end, isSilent);
    };

    UI_MULTI_CALENDAR_PANEL_BUTTON_CLASS.$click = function () {
        var par = this.getParent();
        UI_BUTTON_CLASS.$click.call(this);
        if (this._sType == 'submit') {
            triggerEvent(par, 'change');
        }
        else {
            par.hide();
        }
    };

    //value支持快捷设置
    UI_MULTI_CALENDAR_CLASS.setValue = function (value) {
        var value = (value || ",").split(",");

        var result = UI_MULTI_CALENDAR_CALCULATE(this._oNow, value[0]) || {
            begin: string.parseDate(value[0]),
            end: string.parseDate(value[1]),
            simple: UI_CALENDAR_VALUE_DEFAULT
        };
        this.setDate(result);
    };

    //返回双日历的值
    //@overrite
    UI_MULTI_CALENDAR_CLASS.getValue = function (type) {
        if(type === true && this._eSimpleInput.value != UI_CALENDAR_VALUE_DEFAULT) {
            return this._eSimpleInput.value;
        } else {
            return this._eInput.value;
        }
    };
})();
