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


        UI_INPUT = ui.Input = inheritsControl(
            UI_INPUT_CONTROL,
            'ui-input',
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
                    attachEvent(this._eTip, 'mousedown', UI_INPUT_TIP_HANDLER);
                }
            }
        ),
        UI_INPUT_CLASS = UI_INPUT.prototype,

        UI_TEXTAREA = ui.Textarea = inheritsControl(
            UI_INPUT,
            'ui-textarea',
            function (el, options) {
                options.inputType = 'textarea';
            }
        );

    function UI_INPUT_TIP_HANDLER(event) {
        var e = event || window.event,
            con;

        if (e.preventDefault) {
            e.preventDefault();
        }
        else {
            e.cancelBuble = true;
        }
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
        
        if(this._sMaxLength){
            if(baidu.string.getByteLength(value) > this._sMaxLength){
                this.setValue(baidu.string.subByte(value, this._sMaxLength));
            }
        }
        
        if (!value) {
            UI_INPUT_TIP_DISPLAY(this, true);
        }
    };

    UI_INPUT_CLASS.$blur = function () {
        UI_CONTROL_CLASS.$blur.call(this);
        UI_INPUT_TIP_DISPLAY(this, false);
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

/*
Pager - 分页控件。
分页控件，配合表格控件使用，翻页时触发change事件，可在其中进行表格数据的更新。

分页控件直接HTML初始化的例子:
<div type="type:pager;pageSize:10;maxNum:40" class="ui-pager"></div>

属性
nPage:      当前的页码(从1开始记数)
nPageSize:  每页的记录数
nTotal:     总记录数

事件
change:     切换了分页

*/
//{if 0}//
(function () {

    var core = ecui,
        dom = core.dom,
        string = core.string,
        array = core.array,
        ui = core.ui,
        util = core.util,

        undefined,
        MATH = Math,

        createDom = dom.create,
        children = dom.children,
        extend = util.extend,
        blank = util.blank,

        $fastCreate = core.$fastCreate,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,

        UI_CONTROL = ui.Control,
        UI_BUTTON = ui.Button,
        UI_SELECT = ui.Select,
        UI_ITEM = ui.Item,
        UI_ITEMS = ui.Items,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_BUTTON_CLASS = UI_BUTTON.prototype,
        UI_ITEM_CLASS = UI_ITEM.prototype,
        UI_SELECT_CLASS = UI_SELECT.prototype;
//{/if}//
//{if $phase == "define"}//
    ///__gzip_original__UI_INPUT_CONTROL
    ///__gzip_original__UI_INPUT_CONTROL_CLASS
    /**
     * 初始化分页控件。
     * options 对象支持的属性如下：
     *      {Number} pageSize   每页的最大记录数
     *      {Number} total      记录总数 
     *      {Number} page      当前页码
     *
     * @public
     *
     * @param {Object} options 初始化选项
     */
    var UI_PAGER = ui.Pager =
        inheritsControl(
            UI_CONTROL,
            'ui-pager',
            function (el, options) {
                var type = this.getTypes()[0],
                    i, len, html = [];
                
                if (!options.showCount || options.showCount < 3) {
                    len = this._nShowCount = 7;
                }
                else {
                    len = this._nShowCount = options.showCount;
                }
                this._bOMSButton = options.omsButton !== false;
                html.push('<div class="' + type + '-button-prv ' + type + '-button">上一页</div><div class="'+ type +'-items">');
                for (i = 0; i < len; i++) {
                    if (i == 1 || i == len - 1) {
                        html.push('<div class="'+ type +'-item-oms" ecui="disabled:true">...</div>');
                    }
                    html.push('<div class="'+ type +'-item"></div>');
                }
                html.push('</div><div class="' + type + '-button-nxt ' + type + '-button">下一页</div>');

                el.innerHTML = html.join('');

            },
            function (el, options) {
                el = children(el);

                this._bResizable = false;
                this._nPage = options.page || 1;
                this._nPageSize = options.pageSize || 50;
                this._nTotal = options.total || 0;

                this._uPrvBtn = $fastCreate(this.Button, el[0], this);
                this.$setBody(el[1]);
                this._uNxtBtn = $fastCreate(this.Button, el[2], this);
                this.$initItems();
            }
        ),
        UI_PAGER_CLASS = UI_PAGER.prototype,
        UI_PAGER_BUTTON = UI_PAGER_CLASS.Button = 
        inheritsControl(
            UI_BUTTON, 
            'ui-pager-button', 
            function (el, options) {
                var type = this.getTypes()[0],
                    o = createDom(type + '-icon');

                el.insertBefore(o, el.firstChild);
            }
        ),
        UI_PAGER_BUTTON_CLASS = UI_PAGER_BUTTON.prototype,
        UI_PAGER_ITEM_CLASS = (UI_PAGER_CLASS.Item = inheritsControl(UI_ITEM, 'ui-pager-item', function (el, options) {
            options.resizeable = false; 
        })).prototype;
//{else}//

    extend(UI_PAGER_CLASS, UI_ITEMS);
    
    /**
     * 分页按钮事件处理函数
     * 根据按钮的step属性确定需要切换的页码
     * @private
     */
    function UI_PAGER_BTN_CLICK(event){
        var par = this.getParent(),
            curIndex = par._nPage,
            maxNum = par.getMaxPage(),
            n = this.getStep();

        UI_CONTROL_CLASS.$click.call(this);

        if (n.charAt(0) == '+') {
            curIndex += parseInt(n.substring(1), 10);
            //+0 尾页
            if (curIndex == par._nPage) {
                curIndex = maxNum;
            }
            else if (curIndex > maxNum) {
                curIndex = par._nPage;
            }
        }
        else if (n.charAt(0) == '-') {
            curIndex -= parseInt(n.substring(1), 10);
            //-0 首页
            if (curIndex == par._nPage) {
                curIndex = 1;
            }
            else if (curIndex < 1) {
                curIndex = par._nPage;
            }
        }
        else {
            curIndex = parseInt(n, 10);
        }

        if (par._nPage != curIndex) {
            triggerEvent(par, 'change', null, [curIndex]);
        }
    }

    /**
     * 控件刷新
     * 根据当前的页码重置按钮
     * @private
     */
    function UI_PAGER_REFRESH(con) {
        var items = con._aPageBtn,
            max = con.getMaxPage(),
            idx = con._nPage,
            showCount = con._nShowCount,
            nHfNum = parseInt(showCount / 2, 10),
            start = idx - nHfNum > 0 ? idx - nHfNum : 1,
            end, i, item;

        if (idx == 1) {
            con._uPrvBtn.disable();
        }
        else {
            con._uPrvBtn.enable();
        }

        if (idx == max || max == 0) {
            con._uNxtBtn.disable();
        }
        else {
            con._uNxtBtn.enable();
        }

        if (start + showCount - 1 > max && max - showCount >= 0) {
            start = max - showCount + 1;
        }
        for (i = 0; item = items[i]; i++) {
            end = start + i;
            item.setContent(end);
            item.setStep(end);
            item.setSelected(idx == end);
            if (end > max) {
                item.hide();
            }
            else {
                item.show();
            }
        }

        UI_PAGER_OMS_REFRESH(con);
    }
   
    /**
     * 刷新more符号按钮
     * @private
     */
    function UI_PAGER_OMS_REFRESH(con) {
        var items = con._aPageBtn,
            omsBtn = con._aOMSBtn,
            max = con.getMaxPage(),
            item;

        if (!con._bOMSButton) {
            return;
        }
        
        if (items[0].getContent() != '1') {
            items[0].setContent(1);
            items[0].setStep(1);
            omsBtn[0].show();
        }
        else {
            omsBtn[0].hide();
        }

        item = items[items.length - 1];
        if (item.isShow() && item.getContent() != max) {
            item.setContent(max);
            item.setStep(max);
            omsBtn[1].show();
        }
        else {
            omsBtn[1].hide();
        }
    }

    UI_PAGER_ITEM_CLASS.$setSize = blank;

    /**
     * 设置页码按钮的选择状态
     * @public
     *
     * @param {Boolean} flag 是否选中
     */
    UI_PAGER_ITEM_CLASS.setSelected = function (flag) {
        this.alterClass((flag ? '+' : '-') + 'selected');
    };

    /**
     * 设置按钮的步进
     * +/-n 向前/后翻n页
     * +0 尾页 -0 首页
     * @public
     *
     * @param {String} n 步进
     */
    UI_PAGER_BUTTON_CLASS.setStep = UI_PAGER_ITEM_CLASS.setStep = function (n) {
        this._sStep = n + '';
    };

    /**
     * 获取步进
     * @public
     *
     * @return {String} 步进
     */
    UI_PAGER_BUTTON_CLASS.getStep = UI_PAGER_ITEM_CLASS.getStep = function () {
        return this._sStep;
    };

    /**
     * @override
     */
    UI_PAGER_BUTTON_CLASS.$click = UI_PAGER_ITEM_CLASS.$click = UI_PAGER_BTN_CLICK;

    /**
     * 得到最大的页数
     * @public
     *
     * @return {Number} 最大的页数
     */
    UI_PAGER_CLASS.getMaxPage = function () {
        return MATH.ceil(this._nTotal / this._nPageSize);
    };

    /**
     * 得到最大的记录数
     * @public
     *
     * @return {Number} 最大的记录数
     */
    UI_PAGER_CLASS.getTotal = function () {
        return this._nTotal;
    };

    /**
     * 得到最大的记录数
     * @public
     *
     * @return {Number} 最大的记录数
     */
    UI_PAGER_CLASS.getTotal = function () {
        return this._nTotal;
    };

    /**
     * 翻页
     * 不会对参数进行有效检查
     * @public
     *
     * @param {Number} i 目标页码
     */
    UI_PAGER_CLASS.go = function (i) {
        this._nPage = i;
        UI_PAGER_REFRESH(this); 
    };

    /**
     * 设置每页的记录数
     * @public
     *
     * @param {Number} num 记录数
     */
    UI_PAGER_CLASS.setPageSize = function (num) {
        this._nPageSize = num;
        this._nPage = 1;
        UI_PAGER_REFRESH(this); 
    };

    /**
     * 设置总记录数
     * @public
     *
     * @param {Number} num 记录数
     */
    UI_PAGER_CLASS.setTotal = function (num) {
        this._nTotal = num;
        this._nPage = 1;
        UI_PAGER_REFRESH(this); 
    };

    /**
     * 初始化函数
     * 初始化设置并根据初始参数设置控件各部件的状态
     *
     * @override
     */
    UI_PAGER_CLASS.init = function () {
        var i, item, items = this.getItems();

        this._uPrvBtn.setStep('-1');
        this._uNxtBtn.setStep('+1');
        this._aOMSBtn = [];
        this._aPageBtn = [];
        UI_CONTROL_CLASS.init.call(this);
        for (i = 0; item = items[i]; i++) {
            item.init();
            if (i == 1 || i == items.length - 2) {
                this._aOMSBtn.push(item);
                item.hide();
            }
            else {
                this._aPageBtn.push(item);
            }
        }
        UI_PAGER_REFRESH(this);
    };

    /**
     * override
     */
    UI_PAGER_CLASS.$setSize = blank;

//{/if}//
//{if 0}//
})();
//{/if}//

/*
Calendar - 单日历控件
日历控件，继承自基础控件

例子:
<span ecui="type:Calendar;name:dateTime;date:2012/2/2;start:2012/4/2;end:2012/4/5"></span>

属性
*/
(function () {

    var core = ecui,
        array = core.array,
        dom = core.dom,
        ui = core.ui,
        string = core.string,
        util = core.util,

        DATE = Date,
        REGEXP = RegExp,
        DOCUMENT = document,

        pushArray = array.push,
        children = dom.children,
        createDom = dom.create,
        getParent = dom.getParent,
        getPosition = dom.getPosition,
        moveElements = dom.moveElements,
        setText = dom.setText,
        formatDate = string.formatDate,
        getView = util.getView,

        $fastCreate = core.$fastCreate,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,
        setFocused = core.setFocused,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_BUTTON = ui.Button,
        UI_BUTTON_CLASS = UI_BUTTON.prototype,
        UI_INPUT_CONTROL = ui.InputControl,
        UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype,
        UI_SELECT = ui.Select,
        UI_MONTH_VIEW = ui.MonthView,
        UI_MONTH_VIEW_CELL = UI_MONTH_VIEW.Cell;

    /**
     * 初始化日历控件。
     * options 对象支持的属性如下：
     * year    日历控件的年份
     * month   日历控件的月份(1-12)
     * @public
     *
     * @param {Object} options 初始化选项
     */
    var UI_CALENDAR = ui.Calendar =
        inheritsControl(
            UI_INPUT_CONTROL,
            'ui-calendar',
            function (el, options) {
                var type = this.getTypes()[0];
                options.hidden = true;
                el.innerHTML = '<span class="'+ type +'-text"></span><span class="'+ type +'-cancel"></span><span class="'+ type +'-button"></span>';
            },
            function (el, options) {
                var child = children(el),
                    type = this.getTypes()[0],
                    o = createDom(type + '-panel', 'position:absolute;display:none');
				this._bTip = options.tip !== false;
                this._oNow = string.parseDate(options.now);
                this._oDate = options.date ? string.parseDate(options.date) : null;
                this._eText = child[0];
                this._uCancel = $fastCreate(this.Cancel, child[1], this);
                this._uButton = $fastCreate(UI_CONTROL, child[2], this);
                this._bCancelButton = options.cancelButton !== false;
                if (!this._bCancelButton) {
                    this._uCancel.$hide();
                }
                DOCUMENT.body.appendChild(o);
                this._uPanel = $fastCreate(this.Panel, o, this, {date: this._oDate, range: UI_CALENDAR_PARSE_RANGE(options.now, options.start, options.end)});
            }
        ),

        UI_CALENDAR_CLASS = UI_CALENDAR.prototype,
        UI_CALENDAR_CANCEL_CLASS = (UI_CALENDAR_CLASS.Cancel = inheritsControl(UI_CONTROL)).prototype,

        UI_CALENDAR_PANEL = UI_CALENDAR_CLASS.Panel = 
        inheritsControl(
            UI_CONTROL,
            'ui-calendar-panel',
            function (el, options) {
                var html = [],
                    year = (new DATE()).getFullYear(),
                    type = this.getTypes()[0];
                var today = new Date();
                var startYear = today.getFullYear() - 5;
                var endYear = today.getFullYear() + 5;
                var startDate = options.range.begin;
                var endDate = options.range.end;
                if (startDate) {
                    startYear = startDate.getFullYear();
                }
                if (endDate) {
                    endYear = endDate.getFullYear();
                }
                html.push('<div class="'+ type +'-buttons"><div class="'+ type +'-btn-prv'+ UI_BUTTON.TYPES +
                    '"></div><select class="'+ type +'-slt-year'+ UI_SELECT.TYPES +'">');

                for (var  i = startYear; i <= endYear; i ++) {
                    html.push('<option value="'+ i +'">'+ i +'</option>');
                }

                html.push('</select><select class="'+ type +'-slt-month'+ UI_SELECT.TYPES +'">');

                for (var i = 1; i <= 12; i++) {
                    html.push('<option value="'+ i +'">'+ (i < 10 ? '0' : '') + i +'月</option>');
                }

                html.push('</select><div class="'+ type +'-btn-nxt'+ UI_BUTTON.TYPES +'"></div></div>');
                html.push('<div class="'+ type +'-month-view'+ UI_MONTH_VIEW.TYPES +'"></div>');
                el.innerHTML = html.join('');
            },
            function (el, options) {
                var html = [], o, i,
                    type = this.getTypes()[0],
                    buttonClass = this.Button,
                    selectClass = this.Select,
                    monthViewClass = this.MonthView,
                    date = options.date;
                
                el = children(el);
                o = children(el[0]);

                this._uPrvBtn = $fastCreate(buttonClass, o[0], this);
                this._uPrvBtn._nStep = -1;
                this._uYearSlt = $fastCreate(selectClass, o[1], this);
                this._uMonthSlt = $fastCreate(selectClass, o[2], this);
                this._uNxtBtn = $fastCreate(buttonClass, o[3], this);
                this._uNxtBtn._nStep = 1;

                el = el[1];
                this._uMonthView = $fastCreate(monthViewClass, el, this,
                    {
                        begin: options.range.begin,
                        end: options.range.end
                    }
                );
            }
        ),

        UI_CALENDAR_PANEL_CLASS = UI_CALENDAR_PANEL.prototype,
        UI_CALENDAR_PANEL_BUTTON_CLASS = (UI_CALENDAR_PANEL_CLASS.Button = inheritsControl(UI_BUTTON, null)).prototype,
        UI_CALENDAR_PANEL_SELECT_CLASS = (UI_CALENDAR_PANEL_CLASS.Select = inheritsControl(UI_SELECT, null)).prototype,
        UI_CALENDAR_PANEL_MONTHVIEW_CLASS = (UI_CALENDAR_PANEL_CLASS.MonthView = inheritsControl(UI_MONTH_VIEW, null)).prototype,

        UI_CALENDAR_STR_DEFAULT = '<span class="ui-calendar-default">请选择一个日期</span>',
        UI_CALENDAR_STR_PATTERN = 'yyyy-MM-dd';

    //这个函数有缺陷，如果今天是2012/5/10，如果设置range为-11，就跑到4/30去了
    //@todo liuronghan, 最好依赖于string.addDate,这个函数还没有实现
    function UI_CALENDAR_PARSE_RANGE(now, begin, end) {

        var now = string.parseDate(now), res = null,
            o = [now.getFullYear(), now.getMonth(), now.getDate()], t,
            p = {y:0, M:1, d:2};

        if (begin instanceof Date) {
            res = res || {};
            res.begin = begin;
        }
        else if (/^([-+]?)(\d+)([yMd])$/.test(begin)) {
            res = res || {};
            t = o.slice();
            if (!REGEXP.$1 || REGEXP.$1 == '+') {
                t[p[REGEXP.$3]] -= parseInt(REGEXP.$2, 10);
            }
            else {
                t[p[REGEXP.$3]] += parseInt(REGEXP.$2, 10);
            }
            res.begin = new Date(t[0], t[1], t[2]);
        }
        else if ('[object String]' == Object.prototype.toString.call(begin)) {
            res = res || {};
            begin = string.parseDate(begin);
            res.begin = begin;
        }

        if (end instanceof Date) {
            res = res || {};
            res.end = end;
        }
        else if (/^([-+]?)(\d+)([yMd])$/.test(end)) {
            res = res || {};
            t = o.slice();
            if (!REGEXP.$1 || REGEXP.$1 == '+') {
                t[p[REGEXP.$3]] += parseInt(REGEXP.$2, 10);
            }
            else {
                t[p[REGEXP.$3]] -= parseInt(REGEXP.$2, 10);
            }
            res.end = new Date(t[0], t[1], t[2]);
        }
        else if ('[object String]' == Object.prototype.toString.call(end)) {
            res = res || {};
            end = string.parseDate(end);
            res.end = end;
        }
        return res ? res : {};
    }

    function UI_CALENDAR_TEXT_FLUSH(con) {
        var el = con._eText;
        if (el.innerHTML == '') {
            con._uCancel.$hide();
            if (con._bTip) {
                el.innerHTML = UI_CALENDAR_STR_DEFAULT;
            }
        }
        else if (con._bCancelButton){
            con._uCancel.show();
        }
    }

    /**
     * 获得单日历控件的日期
     */
    UI_CALENDAR_CLASS.getDate = function () {
        return this._oDate;
    };

    UI_CALENDAR_CLASS.setDate = function (date) {
        var panel = this._uPanel,
            ntxt = date != null ? formatDate(date, UI_CALENDAR_STR_PATTERN) : '';

        if (this._uPanel.isShow()) {
            this._uPanel.hide();
        }

        this._eText.innerHTML = ntxt;
        UI_INPUT_CONTROL_CLASS.setValue.call(this, ntxt);
        this._oDate = date;
        UI_CALENDAR_TEXT_FLUSH(this);
    };

    UI_CALENDAR_CLASS.setValue = function (str) {
        if (!str) {
            this.setDate(null);
        }
        else {
            this.setDate(string.parseDate(str));
        }
    };

    UI_CALENDAR_CLASS.$activate = function (event) {
        var panel = this._uPanel, con,
            pos = getPosition(this.getOuter()),
            posTop = pos.top + this.getHeight();

        UI_INPUT_CONTROL_CLASS.$activate.call(this, event);
        if (!panel.isShow()) {
            panel.setDate(this.getDate());
            con = getView();
            panel.show();
            panel.setPosition(
                pos.left + panel.getWidth() <= con.right ? pos.left : con.right - panel.getWidth() > 0 ? con.right - panel.getWidth() : 0,
                posTop + panel.getHeight() <= con.bottom ? posTop : pos.top - panel.getHeight() > 0 ? pos.top - panel.getHeight() : 0
            );
            setFocused(panel);
        }
    };

    UI_CALENDAR_CLASS.$cache = function (style, cacheSize) {
        UI_INPUT_CONTROL_CLASS.$cache.call(this, style, cacheSize);
        this._uButton.cache(false, true);
        this._uPanel.cache(true, true);
    };

    UI_CALENDAR_CLASS.init = function () {
        UI_INPUT_CONTROL_CLASS.init.call(this);
        this.setDate(this._oDate);
        this._uPanel.init();
    };

    UI_CALENDAR_CLASS.clear = function () {
        this.setDate(null);
    };

    UI_CALENDAR_CLASS.setRange = function (begin, end) {
        this._uPanel._uMonthView.setRange(begin, end);
    };

    UI_CALENDAR_CANCEL_CLASS.$click = function () {
        var par = this.getParent(),
            panel = par._uPanel;

        UI_CONTROL_CLASS.$click.call(this);
        par.setDate(null);
    };

    UI_CALENDAR_CANCEL_CLASS.$activate = UI_BUTTON_CLASS.$activate;

    /**
     * Panel
     */
    UI_CALENDAR_PANEL_CLASS.$blur = function () {
        this.hide();
    };

    /**
     * 设置日历面板的日期
     */
    UI_CALENDAR_PANEL_CLASS.setDate = function (date) {
        var now = this.getParent()._oNow || new Date();
        var year = date != null ? date.getFullYear() : (now).getFullYear(),
            month = date != null ? date.getMonth() + 1 : (now).getMonth() + 1;

        this._uMonthView.$setDate(date);
        this.setView(year, month);
    };

    /**
     * 设置日历面板的展现年月 
     */
    UI_CALENDAR_PANEL_CLASS.setView = function (year, month) {
        var monthSlt = this._uMonthSlt,
            yearSlt = this._uYearSlt,
            monthView = this._uMonthView;

        yearSlt.setValue(year);
        monthSlt.setValue(month);
        monthView.setView(year, month);
    };

    /**
     * 获取当前日历面板视图的年
     */
    UI_CALENDAR_PANEL_CLASS.getViewYear = function () {
        return this._uMonthView.getYear();
    };

    /**
     * 获取当前日历面板视图的月
     */
    UI_CALENDAR_PANEL_CLASS.getViewMonth = function () {
        return this._uMonthView.getMonth();
    };

    UI_CALENDAR_PANEL_CLASS.$cache = function (style, cacheSize) {
        this._uPrvBtn.cache(true, true);
        this._uNxtBtn.cache(true, true);
        this._uMonthSlt.cache(true, true);
        this._uYearSlt.cache(true, true);
        this._uMonthView.cache(true, true);
        UI_CONTROL_CLASS.$cache.call(this, style, cacheSize);
    };

    UI_CALENDAR_PANEL_CLASS.init = function () {
        UI_CONTROL_CLASS.init.call(this);
        this._uMonthSlt.init();
        this._uYearSlt.init();
        this._uMonthView.init();
    };

    UI_CALENDAR_PANEL_CLASS.$change = function (event, date) {
        var par = this.getParent();
        if (triggerEvent(par, 'change', event, [date])) {
            par.setDate(date);
        }
        this.hide();
    };

    UI_CALENDAR_PANEL_SELECT_CLASS.$change = function () {
        var panel = this.getParent(),
            yearSlt = panel._uYearSlt,
            monthSlt = panel._uMonthSlt;

        panel.setView(yearSlt.getValue(), monthSlt.getValue());
    };

    UI_CALENDAR_PANEL_BUTTON_CLASS.$click = function () {
        var step = this._nStep,
            panel = this.getParent(),
            date;

        date = new DATE(panel.getViewYear(), panel.getViewMonth() - 1 + step, 1);
        panel.setView(date.getFullYear(), date.getMonth() + 1);
    };

    UI_CALENDAR_PANEL_MONTHVIEW_CLASS.$change = function (event, date) {
        triggerEvent(this.getParent(), 'change', event, [date]);
    };
    
    UI_CALENDAR_CLASS.open = function () {
        if(this.isDisabled() || this._uPanel.isShow()) {
            return false;
        }
        this.$activate();
        return true;
    }

})();

/**
 * query-tab
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    custom-checkboxs.js
 * desc:    自定义多选组合
 * author:  cxl(chenxinle@baidu.com)
 * date:    2012/06/29
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
        getOptions = core.getOptions,
        disposeControl = core.dispose,
        children = dom.children,
        createDom = dom.create,
        moveElements = dom.moveElements,
        trim = string.trim,
        encodeHTML = string.encodeHTML,
        blank = util.blank,
        attachEvent = util.attachEvent,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;

    function buildTitles(type) {
        var html = ['<div class="'+ type +'-title">'],
            uid = (new Date()).getTime();

        html.push('<input type="radio" name="opt'+ uid +'" value="def" id="optDef'+ uid +'" /><label for="optDef'+ uid +'">默认</label>');
        html.push('<input type="radio" name="opt'+ uid +'" value="all" id="optAll'+ uid +'" /><label for="optAll'+ uid +'">全部</label>');
        html.push('<input type="radio" name="opt'+ uid +'" value="custom" id="optCustom'+ uid +'" /><label for="optCustom'+ uid +'">自定义</label>');
        html.push('</div>');

        return html.join('');
    }

    function attachTitleHandler(items, control) {
        for (var i = 0, item; item = items[i]; i++) {
            attachEvent(item, 'click', (function (type) {
                return function () {
                    control.$changeType(type);
                }
            })(item.value));
            control._aTypeRadio[item.value] = item;
        }
    }

    function attachCheckedHanlder(item, control) {
        attachEvent(item, 'click', function () {
            triggerEvent(control.getParent(), 'itemclick');
        });
    }

    function validDefChecked(control) {
        var res = true, i, item;

        for (i = 0; item = control._aItems[i]; i++) {
            if (item.isDefChecked() != item.isChecked()) {
                res = false;
                break;
            }
        }

        return res;
    }

    var UI_CUSTOM_CHECKBOXS = ui.CustomCheckboxs = inheritsControl(
            UI_CONTROL,
            'ui-custom-checkboxs',
            function (el, options) {
                var o = createDom(),
                    type = this.getTypes()[0],
                    html = [buildTitles(type)];

                html.push('<div class="'+ type +'-items"></div>');
                moveElements(el, o, true);
                el.innerHTML = html.join('');
                moveElements(o, el.lastChild, true);
                options.resizeable = false;
            },
            function (el, options) {
                var childs = children(el),
                    items;

                items = childs[0].getElementsByTagName('input');
                this._aTypeRadio = {};
                attachTitleHandler(items, this);
                this.$setBody(childs[1]);
                this.$initItems(options.data);
            }
        ),
        UI_CUSTOM_CHECKBOXS_CLASS = UI_CUSTOM_CHECKBOXS.prototype,
        UI_CUSTOM_CHECKBOXS_ITEM = UI_CUSTOM_CHECKBOXS_CLASS.Item = inheritsControl(
            UI_CONTROL,
            'ui-custom-checkboxs-item',
            function (el, options) {
                var html = [];

                options.name = options.name || trim(el.innerHTML);
                options.resizeable = false;
                html.push('<input type="checkbox" value="'+ options.value +'" id="opt'+ options.value +'" />');
                html.push('<label for="opt'+  options.value +'">' + options.name + '</label>');
                el.innerHTML = html.join('');
            },
            function (el, options) {
                this._eInput = children(el)[0];
                this._sName = options.name; 
                this._sValue = options.value;
                this._bDefChecked = options.defChecked === true;
                if (options.checked) {
                    this._eInput.checked = true;
                }
                attachCheckedHanlder(this._eInput, this);
            }
        ),
        UI_CUSTOM_CHECKBOXS_ITEM_CLASS = UI_CUSTOM_CHECKBOXS_ITEM.prototype;

    UI_CUSTOM_CHECKBOXS_CLASS.$setSize = blank;

    UI_CUSTOM_CHECKBOXS_CLASS.init = function () {
        UI_CONTROL_CLASS.init.call(this);
        this.$itemclick();
    };

    UI_CUSTOM_CHECKBOXS_CLASS.$changeType = function (type) {
        var i, item;

        if (type == this._sValueType) {
            return;
        }
        this._sValueType = type;

        if (type == 'custom') {
            return;
        }

        for (i = 0; item = this._aItems[i]; i++) {
            if (type == 'all') {
                item.setChecked(true);
            }
            else if (type == 'def') {
                item.setChecked(item.isDefChecked());
            }
        }
    };

    UI_CUSTOM_CHECKBOXS_CLASS.$initItems = function (items) {
        var data = items || children(this.getBody()),
            i, item;

        this._aItems = [];
        for (i = 0; item = data[i]; i++) {
            this.add(item);
        }
    };

    UI_CUSTOM_CHECKBOXS_CLASS.add = function (item) {
        var type = this.getTypes()[0], options;
        
        if (item.nodeName && item.nodeType == 1) {
            item.className = type + '-item';
            options = getOptions(item);
        }
        else {
            options = item;
            item = createDom(type + '-item', '', 'span');
            this.getBody().appendChild(item);
        }
        this._aItems.push($fastCreate(this.Item, item, this, options));
    };

    UI_CUSTOM_CHECKBOXS_CLASS.setData = function (data) {
        var i;
        if (this._aItems && this._aItems.length > 0) {
            i = this._aItems.length - 1;
            while (i-- >= 0) {
                disposeControl(this._aItems[i]);
            }
        }
        this.setContent('');
        this.$initItems(data);
        this.$itemclick();
    };

    UI_CUSTOM_CHECKBOXS_CLASS.getValue = function () {
        var i, item, res = [];

        for (i = 0; item = this._aItems[i]; i++) {
            if (item.isChecked()) {
                res.push(item.getValue());
            }
        }

        return res;
    };

    UI_CUSTOM_CHECKBOXS_CLASS.setValue = function (value) {
        var i, item, map = {};

        for (i = 0; item = value[i]; i++) {
            map[item] = true;
        }

        for (i = 0; item = this._aItems[i]; i++) {
            if (map[item.getValue()]) {
                item.setChecked(true);
            }
            else {
                item.setChecked(false);
            }
        }

        this.$itemclick();
    };

    UI_CUSTOM_CHECKBOXS_CLASS.setValueType = function (type) {
        this.$changeType(type);
    };

    UI_CUSTOM_CHECKBOXS_CLASS.getValueType = function () {
        return this._sValueType;
    };

    UI_CUSTOM_CHECKBOXS_CLASS.$itemclick = function () {
        var value = this.getValue();

        if (value.length == this._aItems.length) {
            this._aTypeRadio.all.checked = true;
            this._sValueType = 'all';
        }
        else if (validDefChecked(this)) {
            this._aTypeRadio.def.checked = true;
            this._sValueType = 'def';
        }
        else {
            this._aTypeRadio.custom.checked = true;
            this._sValueType = 'custom';
        }
    };

    UI_CUSTOM_CHECKBOXS_ITEM_CLASS.$setSize = blank;

    UI_CUSTOM_CHECKBOXS_ITEM_CLASS.getValue = function () {
        return this._sValue;
    };

    UI_CUSTOM_CHECKBOXS_ITEM_CLASS.setChecked = function (checked) {
        this._eInput.checked = checked;
    };

    UI_CUSTOM_CHECKBOXS_ITEM_CLASS.isChecked = function () {
        return this._eInput.checked;
    };

    UI_CUSTOM_CHECKBOXS_ITEM_CLASS.isDefChecked = function () {
        return this._bDefChecked;
    };
})();

/**
 * data tree
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    data-tree.js
 * desc:    数据树
 *          在普通树控件的基础上进行扩展
 * author:  cxl(chenxinle@baidu.com)
 * date:    2012/03/12
 */
(function () {
    var core = ecui,
        array = core.array,
        ui = core.ui,
        array = core.array,
        dom = core.dom,
        string = core.string,
        util = core.util,

        $fastCreate = core.$fastCreate,
        getMouseX = core.getMouseX,
        inheritsControl = core.inherits,
        getOptions = core.getOptions,
        disposeControl = core.dispose,
        triggerEvent = core.triggerEvent,
        extend = util.extend,
        indexOf = array.indexOf,
        extend = util.extend,
        toNumber = util.toNumber,
        getStyle = dom.getStyle,
        first = dom.first,
        insertAfter = dom.insertAfter,
        trim = string.trim,
        blank = util.blank,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_TREE_VIEW = ui.TreeView,
        UI_TREE_VIEW_CLASS = UI_TREE_VIEW.prototype,

        UI_DATA_TREE = ui.DataTree = 
        inheritsControl(
            UI_TREE_VIEW,
            'ui-data-tree',
            function (el, options) {
                options.expandSelected = options.expandSelected === true;

                if (first(el) && 'divlabel'.indexOf(first(el).tagName.toLowerCase()) >= 0) {
                    extend(options, getOptions(first(el)));
                }

                if (options.value) {
                    options.value += '';
                }

                options.resizable = false;
            },
            function (el, options) {
                this._aSelected = [];
                this._sValue = options.value;
                this._bHideRoot = options.hideRoot === true; //是否隐藏根节点
                this._bSelectAble = options.selectable !== false;
                this._bMultiSelect = options.multi === true;
                this._bAsyn = options.asyn;
                if (options.asyn && this._aChildren.length <= 0) {
                    this.add('Loadding', null);
                    this.collapse();
                    this._bNeedAsyn = true;                        
                }
            }
        ),
        
        UI_DATA_TREE_CLASS = UI_DATA_TREE.prototype;

    function UI_DATA_TREE_VIEW_FLUSH(control) {
        control.setClass(
            control.getPrimary() + (control._aChildren.length ? control._bCollapsed ? '-collapsed' : '-expanded' : '')
        );
    }

    UI_DATA_TREE_CLASS.init = function () {
        UI_TREE_VIEW_CLASS.init.call(this);

        if (this._bHideRoot && this == this.getRoot()) {
            this.hide();
            this.expand();
        }
    }

    UI_DATA_TREE_CLASS.$setParent = function (parent) {
        var root = this.getRoot(),
            selected = root._aSelected,
            o = this.getParent(), i;

        // 如果当前节点被选中，需要先释放选中
        if ((i = indexOf(selected, this)) >= 0) {
            root.$setSelected(this, false);
        }

        if (this !== root) {
            remove(o._aChildren, this);
            UI_DATA_TREE_VIEW_FLUSH(o);
        }

        UI_CONTROL_CLASS.$setParent.call(this, parent);

        // 将子树区域显示在主元素之后
        if (this._eChildren) {
            insertAfter(this._eChildren, this.getOuter());
        }
    }

    UI_DATA_TREE_CLASS.getValue = function () {
        return this._sValue;
    }

    UI_DATA_TREE_CLASS.getText = function () {
        return trim(this.getContent().replace(/<[^>]+>/g, ''));
    }

    UI_DATA_TREE_CLASS.getSelected = function () {
        if (this == this.getRoot()) {
            return this._aSelected.slice();
        }
    }

    UI_DATA_TREE_CLASS.getSelectedValues = function () {
        var res = [], i, item;
        if (this == this.getRoot()) {
            for (i = 0; item = this._aSelected[i]; i++) {
                res.push(item.getValue());
            }
            return this._bMultiSelect ? res : res[0];
        }
    }

    UI_DATA_TREE_CLASS.setValues = function (values) {
        var item;
        if (indexOf(values, this._sValue) >= 0) {
            this.getRoot().$setSelected(this, true);
            item = this;
            while((item = item.getParent()) && item instanceof UI_TREE_VIEW) {
                if (item.isCollapsed()) {
                    item.expand()
                }
            }
        }
        for (var i = 0, item; item = this._aChildren[i]; i++) {
            item.setValues(values);
        }
    }

    UI_DATA_TREE_CLASS.getItemByValue = function (value) {
        var res = null;

        if (this._sValue == value) {
            res = this;
        }
        for (var i = 0, item; (item = this._aChildren[i]) && res == null; i++) {
            res = item.getItemByValue(value);
        }
        return res;
    }

    UI_DATA_TREE_CLASS.load = function (datasource) {
        var i, item, text;

        for (i = 0; item = this._aChildren[i]; i++) {
            disposeControl(item);
        }
        this._aChildren = [];
        this._eChildren.innerHTML = '';

        for (i = 0; item = datasource[i]; i++) {
            text = item.text;
            item = extend({asyn: this._bAsyn}, item);
            delete item.text;
            this.add(text, null, item).init();
        }
    }

    UI_DATA_TREE_CLASS.$expand = function (item) {
        var superObj = item.getRoot();
        if (item._bNeedAsyn) {
            triggerEvent(superObj, 'load', null, [item.getValue(), function (data) {item.load(data)}]);
            item._bNeedAsyn = false;
        }
    }

    UI_DATA_TREE_CLASS.$click = function (event) {
        var added = null;
        if (event.getControl() == this) {
            UI_CONTROL_CLASS.$click.call(this, event);

            if (getMouseX(this) <= toNumber(getStyle(this.getBody(), 'paddingLeft'))) {
                // 以下使用 event 代替 name
                this[event = this.isCollapsed() ? 'expand' : 'collapse']();
                triggerEvent(this.getRoot(), event, null, [this]);
            }
            else {
                if (indexOf(this.getRoot()._aSelected, this) >= 0) {
                    if (this._bMultiSelect) {
                        added = false;    
                    }
                }
                else {
                    added = true;
                }
                this.getRoot().setSelected(this);
                triggerEvent(this.getRoot(), 'select', null, [this, added == true])
                if (added !== null) {
                    triggerEvent(this.getRoot(), 'change', null, [this.getValue(), added]);
                }
            }
        }
    }

    UI_DATA_TREE_CLASS.getSelectedText = function () {
        var res = [], i, item;
        if (this == this.getRoot()) {
            for (i = 0; item = this._aSelected[i]; i++) {
                res.push(item.getText());
            }
            return res.join(',');
        }
    }

    UI_DATA_TREE_CLASS.setSelectAble = function (enable) {
        var root = this.getRoot(), i;

        if (!this.enable && (i = indexOf(root._aSelected, this)) >= 0) {
            root.$setSelected(this, false);
        }
        this._bSelectAble = enable;
    }

    UI_DATA_TREE_CLASS.$setSelected = function (node, flag) {
        var selected, i;
        if (this == this.getRoot()) {
            selected = this._aSelected;
            i = indexOf(selected, node);
            if (flag === true) {
                if (i < 0) {
                    selected.push(node);
                    node.alterClass('+selected');
                }
            }
            else if (flag === false) {
                if (i >= 0) {
                    selected.splice(i, 1);
                    node.alterClass('-selected');
                }
            }
        }
    }

    UI_DATA_TREE_CLASS.clearSelected = function () {
        var selected, i, item;
        
        if (this == this.getRoot()) {
            selected = this._aSelected;
            while(item = selected[0]) {
                this.$setSelected(item, false);
            }
        }
    }

    UI_DATA_TREE_CLASS.setSelected = function (node, force) {
        var selected, i;

        if (this == this.getRoot() && node._bSelectAble) {
            selected = this._aSelected;                    
            i = indexOf(selected, this);
            if ((i = indexOf(selected, node)) >= 0) {
                if (!force && this._bMultiSelect) {
                    this.$setSelected(node, false);
                }
            }
            else {
                if (!this._bMultiSelect && selected.length >= 1) {
                    this.$setSelected(selected[0], false);
                }
                this.$setSelected(node, true);
            }

            if (node && this._bExpandSelected) {
                node.expand();
            }
        }
    };

    UI_DATA_TREE_CLASS.$setSize = blank;
})();

/**
 * liteTable - 简单表格
 *
 */

(function () {

    var core = ecui,
        string = core.string,
        ui = core.ui,
        util = core.util,
        string = core.string,

        undefined,

        extend = util.extend,
        blank = util.blank,
        attachEvent = util.attachEvent,
        encodeHTML = string.encodeHTML,

        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;

    var UI_LITE_TABLE = ui.LiteTable =
        inheritsControl(
            UI_CONTROL,
            'ui-lite-table',
            function (el, options) {
                options.resizable = false;
            },
            function (el, options) {
                this._aData = [];
                this._aFields = [];
                this._eCheckboxAll = null;
                this._aCheckboxs = [];
                this._sEmptyText = options.emptyText || '暂无数据';
                this._bCheckedHighlight = options.checkedHighlight === true;
            }
        ),

        UI_LITE_TABLE_CLASS = UI_LITE_TABLE.prototype,

        DELEGATE_EVENTS = ['click', 'mouseup', 'mousedown'],

        // 默认处理函数
        DEFAULT_EVENTS = {
            'click th.ui-lite-table-hcell-sort': function (event, control) {
                var field = this.getAttribute('data-field'),
                    orderby;

                if (this.className.indexOf('-sort-desc') >= 0) {
                    orderby = 'asc';
                }
                else if (this.className.indexOf('-sort-asc') >= 0) {
                    orderby = 'desc'
                }
                else {
                    orderby = this.getAttribute('data-orderby') || 'desc';
                }

                triggerEvent(control, 'sort', null, [field, orderby]);
            },
            'click input.ui-lite-table-checkbox-all': function (event, control) {
                control.$refreshCheckbox(this.checked);
            },
            'click input.ui-lite-table-checkbox': function (event, control) {
                control.$refreshCheckbox();
            }
        };

    function copyArray(data) {
        var res = [], i, item;

        for (i = 0; item = data[i]; i++) {
            res.push(extend({}, item));
        }

        return res;
    }

    function getHanlderByType(events, type) {
        var handlers = [], item;

        events = extend({}, events);
        events = extend(events, DEFAULT_EVENTS);

        for (var key in events) {
            item = {handler: events[key]};
            key = key.split(/\s+/);
            if (key[0] == type) {
                item.selector = key[1];
                handlers.push(item);
            }
        }

        return handlers;
    }

    function checkElementBySelector(ele, selector) {
        var tagName, value, type, res = true;

        if (!ele && !selector) {
            return false;
        }

        selector.replace(/^([^.#]*)([.#]?)(.*)$/, function ($0, $1, $2, $3) {
            tagName = $1;
            type = $2;
            value = $3;
        });

        if (tagName && ele.tagName.toLowerCase() != tagName) {
            res = false;
        }

        if (type == '.' && !new RegExp('(^|\\s+)' + value + '(\\s+|$)').test(ele.className)) {
            res = false;
        }

        if (type == '#' && ele.id != value) {
            res = false;
        }

        return res;
    }

    function buildTabeBody(fields, datasource, type) {
        var i, item, j, field, html = [], str,
            className;

        for (i = 0; item = datasource[i]; i++) {
            html.push('<tr class="'+ type +'-row">')
            for (j = 0; field = fields[j]; j++) {
                className = type + '-cell';
                if (field.align) {
                    className += ' ' + type + '-cell-align-' + field.align;
                }
                else if (field.checkbox) {
                    className += ' ' + type + '-cell-align-center';
                }
                html.push('<td class="'+ className +'">');
                if (field.checkbox) {
                    html.push('<input type="checkbox" value="'+ item[field.content] + '" class="'+ type +'-checkbox"');
                    if (field.checkedField && item[field.checkedField] == true) {
                        html.push(' checked="checked"');
                    }
                    html.push(' />');
                }
                else {
                    if (typeof field.content == 'function') {
                        html.push(field.content.call(null, item, i));
                    }
                    else {
                        str = item[field.content];
                        if (!str && str != 0) {
                            str = '&nbsp;';
                        }
                        else {
                            str = encodeHTML(str + '');
                        }
                        html.push(str);
                    }
                }
                html.push('</td>')
            }
            html.push('</tr>')
        }

        return html.join('');
    };

    /**
     * @override
     */
    UI_LITE_TABLE_CLASS.$setSize = blank;

    /**
     * @override
     */
    UI_LITE_TABLE_CLASS.init = function () {
        var i, item, ele = this.getOuter(),
            control = this;

        UI_CONTROL_CLASS.init.call(this);

        // 添加控件全局的事件监听
        // 只支持click mousedown mouseup
        for (i = 0; item = DELEGATE_EVENTS[i]; i++) {
            attachEvent(ele, item, (function (name) {
                return function (event) {
                    var e = event || window.event;
                    e.targetElement = e.target || e.srcElement;
                    control.$fireEventHanlder(name, e);
                }
            })(item));
        }
    }

    /**
     * 设置表格的数据
     * @public
     * 
     * @param {Array} datasource 表格数据
     * @param {Object} sortInfo 排序信息
     *          {String} sortby 排序字段
     *          {String} orderby 排序方式
     * @param {Boolean} isSilent 静默模式 如果true的话 不会立刻重绘表格 需要手动调用render
     */
    UI_LITE_TABLE_CLASS.setData = function (datasource, sortInfo, isSilent) {
        this._aData = copyArray(datasource);
        if (sortInfo) {
            this._sSortby = sortInfo.sortby || '';
            this._sOrderby = sortInfo.orderby || '';
        }

        !isSilent && this.render();
    };

    UI_LITE_TABLE_CLASS.getData = function () {
        return copyArray(this._aData);
    };

    UI_LITE_TABLE_CLASS.getDataByField = function (o, field) {
        var i, item;

        field = field || 'id';
        for (i = 0; item = this._aData[i]; i++) {
            if (item[field] == o) {
                return extend({}, item);
            }
        }

        return null;
    };

    /**
     * 设置表格的列信息
     * @public
     * 
     * @param {Array} fields 列信息
     * @param {Boolean} isSilent 静默模式 如果true的话 不会立刻重绘表格 需要手动调用render
     */
    UI_LITE_TABLE_CLASS.setFields = function (fields, isSilent) {
        this._aFields = copyArray(fields);

        !isSilent && this.render();
    };

    /**
     * 获取当前选择的行单选框value
     * @public
     */
    UI_LITE_TABLE_CLASS.getSelection = function () {
        var ids = [], i, item;

        for (i = 0; item = this._aCheckboxs[i]; i++) {
            item.checked && ids.push(item.value);
        }

        return ids;
    };

    /**
     * 重新绘制表格
     * @public
     */
    UI_LITE_TABLE_CLASS.render = function () {
        var type = this.getTypes()[0],
            html = ['<table cellpadding="0" cellspacing="0" width="100%" class="'+ type +'-table">'],
            i, item, className,
            fields = this._aFields, datasource = this._aData;

        if (!fields || fields.length <= 0) {
            return;
        }

        html.push('<tr class="'+ type +'-head">');
        // 渲染表头
        for (i = 0; item = fields[i]; i++ ) {
            className = type + '-hcell';
            if (item.checkbox) {
                className += ' ' + type + '-hcell-checkbox';
                html.push('<th class="'+ className +'"><input type="checkbox" class="'+ type +'-checkbox-all" /></th>');
                continue;
            }
            html.push('<th');
            if (item.width) {
                html.push(' width="' + item.width + '"');
            }
            if (item.sortable) {
                className += ' ' + type + '-hcell-sort';
                if (item.field && item.field == this._sSortby) {
                    className += ' ' + type + '-hcell-sort-' + this._sOrderby;
                }
                html.push(' data-field="'+ item.field +'"');
                if (item.orderby) {
                    html.push(' data-orderby="' + item.orderby + '"');
                }
            }
            html.push(' class="' + className + '">' + item.title + '</th>');
        }
        html.push('</tr>');

        // 渲染无数据表格
        if (!datasource || datasource.length <= 0) {
            html.push('<tr class="'+ type +'-row"><td colspan="'
                    + fields.length +'" class="'+ type +'-cell-empty">'+ this._sEmptyText +'</td></tr>');
        }
        else {
           html.push(buildTabeBody(fields, datasource, type));
        }

        html.push('</table>');

        this.setContent(html.join(''));
        // 重新捕获所有的行当选框
        this.$bindCheckbox();
        if (this._eCheckboxAll) {
            this.$refreshCheckbox();
        }
    };

    /**
     * 获取表格当前所有行单选框的引用
     * @private
     */
    UI_LITE_TABLE_CLASS.$bindCheckbox = function () {
        var inputs = this.getBody().getElementsByTagName('input'),
            i, item, type = this.getTypes()[0];

        this._aCheckboxs = [];
        this._eCheckboxAll = null;

        for (i = 0; item = inputs[i]; i++) {
            if (item.type == 'checkbox' && item.className.indexOf(type + '-checkbox-all') >= 0) {
                this._eCheckboxAll = item;
            }
            else if (item.type == 'checkbox' && item.className.indexOf(type + '-checkbox') >= 0) {
                this._aCheckboxs.push(item);
            }
        }
    };

    /**
     * 刷新表格的行单选框
     * @private
     *
     * @param {Boolean} checked 全选/全不选 如果忽略此参数则根据当前表格的实际选择情况来设置“全选”的勾选状态
     */
    UI_LITE_TABLE_CLASS.$refreshCheckbox = function (checked) {
        var i, item, newChecked = true, tr;

        for (i = 0; item = this._aCheckboxs[i]; i++) {
            tr = item.parentNode.parentNode;
            if (checked !== undefined) {
                item.checked = checked;
            }
            else {
                newChecked = item.checked && newChecked;
            }

            if (item.checked && this._bCheckedHighlight) {
                tr.className += ' highlight';
            }
            else if (this._bCheckedHighlight) {
                tr.className = tr.className.replace(/\s+highlight/g, '');
            }
        }

        this._eCheckboxAll.checked = checked !== undefined ? checked : newChecked;
    };

    /**
     * 触发表格events中定义的事件
     * @private
     *
     * @param {String} eventType 事件类型
     * @param {Event} nativeEvent 原生事件参数
     */
    UI_LITE_TABLE_CLASS.$fireEventHanlder = function (eventType, nativeEvent) {
        var events = getHanlderByType(this.events, eventType),
            i, item, target = nativeEvent.targetElement, selector;

        for (i = 0; item = events[i]; i++) {
            if (checkElementBySelector(target, item.selector)) {
                item.handler.call(target, nativeEvent, this);
            }
        }
    };

    /**
     * @override
     */
    UI_LITE_TABLE_CLASS.$dispose = function () {
        this._aCheckboxs = [];
        this._eCheckboxAll = null;
        UI_CONTROL_CLASS.$dispose.call(this);
    };
})();

/*
MultiSelect - 定义多选下拉框行为的基本操作。
多选下拉框控件，继承自输入框控件，实现了选项组接口，参见下拉框控件。

下拉框控件直接HTML初始化的例子:
<select ecui="type:multi-select;option-size:3" name="test">
    <!-- 这里放选项内容 -->
    <option value="值">文本</option>
    ...
    <option value="值" selected>文本</option>
    ...
</select>

如果需要自定义特殊的选项效果，请按下列方法初始化:
<div ecui="type:multi-select;name:test;option-size:3">
    <!-- 这里放选项内容 -->
    <li ecui="value:值">文本</li>
    ...
</div>

Item属性
_eInput - 多选项的INPUT对象
*/
//{if 0}//
(function () {
    var core = ecui,
        array = core.array,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        indexOf = array.indexOf,
        getText = dom.getText,
        removeDom = dom.remove,
        createDom = dom.create,
        setInput = dom.setInput,
        extend = util.extend,
        inherits = util.inherits,

        getKey = core.getKey,
        mask = core.mask,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,

        UI_INPUT_CONTROL = ui.InputControl,
        UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype,
        UI_ITEMS = ui.Items,
        UI_SELECT = ui.Select,
        UI_SELECT_CLASS = UI_SELECT.prototype,
        UI_SELECT_ITEM = UI_SELECT_CLASS.Item,
        UI_SELECT_ITEM_CLASS = UI_SELECT_ITEM.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化多选下拉框控件。
     * options 对象支持的属性如下：
     * optionSize 下拉框最大允许显示的选项数量，默认为5
     * @public
     *
     * @param {Object} options 初始化选项
     */
    //__gzip_original__UI_MULTI_SELECT
    //__gzip_original__UI_MULTI_SELECT_ITEM
    var UI_MULTI_SELECT = ui.MultiSelect = 
        inheritsControl(
            UI_SELECT,
            'ui-multi-select',
            function (el, options) {
                options.hide = true;
                if (options.value) {
                    options.value = options.value.toString();
                }
            },
            function(el, options) {
                var values;

                if (options.maxlength) {
                    this._nTextLen = options.maxlength;
                }
                if (options.textAll) {
                    this._sTextAll = options.textAll;
                }
                if (options.maxSelected) {
                    this._nMaxSelected = options.maxSelected;
                }
                else if (!options.selectAllButton) {
                    //ui-multi-select-item-icon all
                    this.add('<span class="all">全部</span>', 0, {selectAllButton: true, value: ""});
                    this._bSelectAllBtn = true;
                }
                if (options.tip) {
                    this._bTip = true;
                }
                if (options.value !== undefined) {
                    this.setValue(options.value);
                }
                if (options.selectAll) {
                    this._bInitSelectAll = true;
                }
                if (options.minSelected) {
                    this._nMinSelected = options.minSelected;
                }

                this._eInput.disabled = true;
            }
        ),
        UI_MULTI_SELECT_CLASS = UI_MULTI_SELECT.prototype,

        /**
         * 初始化多选下拉框控件的选项部件。
         * @public
         *
         * @param {Object} options 初始化选项
         */
        UI_MULTI_SELECT_ITEM = UI_MULTI_SELECT_CLASS.Item =
            inheritsControl(
            UI_SELECT_ITEM,
            'ui-multi-select-item',
            function (el, options) {
                var type = this.getTypes()[0],
                    o = createDom(type + '-icon');
                
                this._bSelectAllBtn = options.selectAllButton;
                this._sTip = options.tip ? options.tip : getText(el);

                el.insertBefore(o, el.firstChild);
                el = this._eInput =
                    options.parent.getMain().appendChild(setInput(null, options.parent.getName(), 'checkbox'));
                if(options.value !== undefined) {
                    //fixed by: liuronghan
                    el.value = options.value;
                }
                el.style.display = 'none';
            }
        ),
        UI_MULTI_SELECT_ITEM_CLASS = UI_MULTI_SELECT_ITEM.prototype;
//{else}//
    
    /**
     * 刷新全选按钮
     * @private
     */
    function UI_MULTI_SELECT_FLUSH_SELECTALL(control, status) {
        var items = control.getItems();

        if (!control._bSelectAllBtn) {
            return;
        }

        if (status === undefined) {
            status = control.getSelected().length === items.length - 1;
            items[0].$setSelected(status);
        }
        else {
            for (var i = 0, item; item = items[i]; i++) {
                item.$setSelected(status);
            }
        }
    }

    /**
     * 刷新显示区域的选中值列表。
     * @private
     *
     * @param {ecui.ui.MultiSelect} control 多选下拉框控件
     */
    function UI_MULTI_SELECT_FLUSH_TEXT(control) {
        var tip;
        if (control) {
            for (var i = 0, list = control.getItems(), o, text = []; o = list[i++]; ) {
                if (o.isSelected() && !o._bSelectAllBtn) {
                    text.push(o._sTip);
                }
            }
            tip = '<span title="'+ text.join(',') +'">';
            if (text.length == list.length + (control._bSelectAllBtn ? -1 : 0) && control._sTextAll) {
                text = control._sTextAll;
            }
            else {
                text = text.join(',');
                if (control._nTextLen && text.length > control._nTextLen) {
                    text = text.substring(0, control._nTextLen) + '...';
                }
            }
            if (control._bTip) {
                text = tip + text + '</span>';
            }
            control.$getSection('Text').setContent(text || "<span style='color:#CCC'>请选择</span>");
        }
    }

    extend(UI_MULTI_SELECT_CLASS, UI_ITEMS);

    /**
     * 鼠标单击控件事件的默认处理。
     * 控件点击时将改变当前的选中状态。如果控件处于可操作状态(参见 isEnabled)，click 方法触发 onclick 事件，如果事件返回值不为 false，则调用 $click 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_MULTI_SELECT_ITEM_CLASS.$click = function (event) {
        var par = this.getParent(),
            selected = par.getSelected().length;

        UI_SELECT_ITEM_CLASS.$click.call(this, event);
        if (!this.isSelected()) {
            if (!par._nMaxSelected || par._nMaxSelected >= selected + 1) {
                this.setSelected(true);
            }
        }
        else {
            if (!par._nMinSelected || par._nMinSelected <= selected - 1) {
                this.setSelected(false);
            }
        }
    };

    /**
     * 销毁控件的默认处理。
     * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
     * @protected
     */
    UI_MULTI_SELECT_ITEM_CLASS.$dispose = function () {
        this._eInput = null;
        UI_SELECT_ITEM_CLASS.$dispose.call(this);
    };

    /**
     * 判断当前选项是否选中。
     * @protected
     *
     * @return {boolean} 当前项是否选中
     */
    UI_MULTI_SELECT_ITEM_CLASS.isSelected = function () {
        return this._eInput.checked;
    };

    /**
     *
     */
    UI_MULTI_SELECT_ITEM_CLASS.$setSelected = function (status) {
        this._eInput.checked = status !== false;
        this.setClass(this.getPrimary() + (this._eInput.checked ? '-selected' : ''));
    }

    /**
     * 设置当前选项是否选中。
     * @protected
     *
     * @param {boolean} status 当前项是否选中，默认选中
     */
    UI_MULTI_SELECT_ITEM_CLASS.setSelected = function (status) {
        this.$setSelected(status);
        UI_MULTI_SELECT_FLUSH_SELECTALL(this.getParent(), this._bSelectAllBtn ? status : undefined);
        UI_MULTI_SELECT_FLUSH_TEXT(this.getParent());
    };

    /**
     * 选项控件发生变化的处理。
     * 在 选项组接口 中，选项控件发生增加/减少操作时调用此方法。
     * @protected
     */
    UI_MULTI_SELECT_CLASS.$alterItems = function () {
        UI_SELECT_CLASS.$alterItems.call(this);
        UI_MULTI_SELECT_FLUSH_SELECTALL(this);
        UI_MULTI_SELECT_FLUSH_TEXT(this);
    };

    /**
     * 控件增加子控件事件的默认处理。
     * 选项组增加子选项时需要判断子控件的类型，并额外添加引用。
     * @protected
     *
     * @param {ecui.ui.Item} child 选项控件
     * @return {boolean} 是否允许增加子控件，默认允许
     */
    UI_MULTI_SELECT_CLASS.$append = function (item) {
        UI_SELECT_CLASS.$append.call(this, item);
        this.getMain().appendChild(setInput(item._eInput, this.getName()));
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @protected
     *
     * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    UI_MULTI_SELECT_CLASS.$cache = UI_SELECT_CLASS.$cache;

    /**
     * 界面点击强制拦截事件的默认处理。
     * 控件在多选下拉框展开时，需要拦截浏览器的点击事件，如果点击在下拉选项区域，则选中当前项，否则直接隐藏下拉选项框，但不会改变控件激活状态。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_MULTI_SELECT_CLASS.$intercept = function (event) {
        for (var control = event.getControl(); control; control = control.getParent()) {
            if (control instanceof UI_MULTI_SELECT_ITEM) {
                //当多选框选项为ECUI控件时无法释放拦截，此处fix一下，by hades
                event.target = control.getOuter();
                return false;
            }
        }
        this.$getSection('Options').hide();
        triggerEvent(this, 'change');
        event.exit();
    };

    /**
     * 控件拥有焦点时，键盘按下/弹起事件的默认处理。
     * 如果控件处于可操作状态(参见 isEnabled)，keyup 方法触发 onkeyup 事件，如果事件返回值不为 false，则调用 $keyup 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_MULTI_SELECT_CLASS.$keydown = UI_MULTI_SELECT_CLASS.$keypress = UI_MULTI_SELECT_CLASS.$keyup =
        function (event) {
            UI_INPUT_CONTROL_CLASS['$' + event.type].call(this, event);
            if (!this.$getSection('Options').isShow()) {
                return false;
            }

            var key = getKey();
            if (key == 13 || key == 32) {
                if (event.type == 'keyup') {
                    key = this.getActived();
                    key.setSelected(!key.isSelected());
                }
                return false;
            }
        };

    /**
     * 鼠标在控件区域滚动滚轮事件的默认处理。
     * 如果控件拥有焦点，则当前选中项随滚轮滚动而自动指向前一项或者后一项。如果控件处于可操作状态(参见 isEnabled)，mousewheel 方法触发 onmousewheel 事件，如果事件返回值不为 false，则调用 $mousewheel 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_MULTI_SELECT_CLASS.$mousewheel = function (event) {
        var options = this.$getSection('Options');
        if (options.isShow()) {
            options.$mousewheel(event);
        }
        return false;
    };

    /**
     * 控件激活状态结束事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_MULTI_SELECT_CLASS.$deactivate = UI_SELECT_CLASS.$deactivate;

    /**
     * 控件激活状态开始事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_MULTI_SELECT_CLASS.$activate = function (event) {
        var con = event.getControl();
        if (!(con instanceof UI_MULTI_SELECT_ITEM)) {
            UI_SELECT_CLASS.$activate.call(this, event);
        }
    }

    /**
     * 控件自动渲染全部完成后的处理。
     * 页面刷新时，部分浏览器会回填输入框的值，需要在回填结束后触发设置控件的状态。
     * @protected
     */
    UI_MULTI_SELECT_CLASS.$ready = function () {
        UI_MULTI_SELECT_FLUSH_SELECTALL(this);
        UI_MULTI_SELECT_FLUSH_TEXT(this);

        if (this._bInitSelectAll) {
            for (var i = 0, list = this.getItems(), o; o = list[i++]; ) {
                !o._bSelectAllBtn && o.setSelected(true);
            }
        }
    };

    /**
     * 控件移除子控件事件的默认处理。
     * 选项组移除子选项时需要额外移除引用。
     * @protected
     *
     * @param {ecui.ui.Item} child 选项控件
     */
    UI_MULTI_SELECT_CLASS.$remove = function (item) {
        UI_SELECT_CLASS.$remove.call(this, item);
        this.getMain().removeChild(item._eInput);
    };

    /**
     * 设置控件的大小。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_MULTI_SELECT_CLASS.$setSize = UI_SELECT_CLASS.$setSize;
    /**
     * 设置控件的大小。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_MULTI_SELECT_CLASS.getLayer = function () {
        return this._uOptions;
    };

    /**
     * 获取全部选中的选项控件。
     * @protected
     *
     * @return {Array} 选项控件列表
     */
    UI_MULTI_SELECT_CLASS.getSelected = function () {
        for (var i = 0, list = this.getItems(), o, result = []; o = list[i++]; ) {
            if (o.isSelected() && !o._bSelectAllBtn) {
                result.push(o);
            }
        }
        return result;
    };

    UI_MULTI_SELECT_CLASS.getValue = function () {
        var items = this.getSelected(),
            res = [], i, len;
        for (i = 0, len = items.length; i < len; i++) {
            if (!items[i]._bSelectAllBtn) {
                res.push(items[i]._eInput.value);
            }
        }
        return res;
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

    /**
     * 设置下拉框允许显示的选项数量。
     * 如果实际选项数量小于这个数量，没有影响，否则将出现垂直滚动条，通过滚动条控制其它选项的显示。
     * @public
     *
     * @param {number} value 显示的选项数量，必须大于 1
     */
    UI_MULTI_SELECT_CLASS.setOptionSize = UI_SELECT_CLASS.setOptionSize;

    /**
     * 设置控件的值。
     * @public
     *
     * @param {Array/String} values 控件被选中的值列表
     */
    UI_MULTI_SELECT_CLASS.setValue = function (values) {
        if ('[object Array]' != Object.prototype.toString.call(values)) {
            values = values.toString().split(',');
        }
        for (var i = 0, list = this.getItems(), o; o = list[i++]; ) {
            o.setSelected(indexOf(values, o._eInput.value) >= 0);
        }
        UI_MULTI_SELECT_FLUSH_SELECTALL(this);
        UI_MULTI_SELECT_FLUSH_TEXT(this);
    };
//{/if}//
//{if 0}//
})();
//{/if}//

(function () {
    var core = ecui,
        array = core.array,
        dom = core.dom,
        ui = core.ui,
        util = core.util,
        string = core.string,

        $fastCreate = core.$fastCreate,
        setFocused = core.setFocused,
        createDom = dom.create,
        children = dom.children,
        moveElements = dom.moveElements,
        getPosition  = dom.getPosition,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,
        getView = util.getView,
        blank = util.blan,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_BUTTON = ui.Button,
        UI_BUTTON_CLASS = UI_BUTTON.prototype;

    var UI_POP = ui.Pop = 
        inheritsControl(
            UI_CONTROL,
            'ui-pop',
            null,
            function (el, options) {
                var type = this.getTypes()[0],
                    o = createDom(), els;

                el.style.position = 'absolute';

                if (options.noButton !== true) {
                    o.innerHTML = '<div class="'+ type +'-buttons"><div class="ui-button ui-button-g">确定</div><div class="ui-button">取消</div></div>';
                    els = children(o.firstChild);
                    this._uSubmitBtn = $fastCreate(this.Button, els[0], this, {command: 'submit', primary:'ui-button-g'});
                    this._uCancelBtn = $fastCreate(this.Button, els[1], this, {command: 'cancel'});
                    moveElements(o, el, true);
                }
            }
        ),

        UI_POP_CLASS = UI_POP.prototype;

        UI_POP_BTN = UI_POP_CLASS.Button = 
        inheritsControl(
            UI_BUTTON,
            null,
            function (el, options) {
                this._sCommand = options.command;
            }
        ),

        UI_POP_BTN_CLASS = UI_POP_BTN.prototype;

    UI_POP_CLASS.show = function (con, align) {
        var view = getView(),
            h, w,
            pos = getPosition(con.getOuter());

        UI_CONTROL_CLASS.show.call(this);
        this.resize();
        w = this.getWidth();
        h = con.getHeight() + pos.top;
        if (!align && align == 'left') {
            if (pos.left + w > view.right) {
                w = pos.left + con.getWidth() - w;
            }
            else {
                w = pos.left;
            }
        }
        else {
            if (pos.left + con.getWidth() - w < 0) {
                w = pos.left;
            }
            else {
                w = pos.left + con.getWidth() - w;
            }
        }

        if (h + this.getHeight() > view.bottom) {
            h = view.bottom - this.getHeight();
        }

        var parPos = getPosition(this.getOuter().offsetParent);
        w = w - parPos.left;
        h = h - parPos.top + document.body.scrollTop;
        this.setPosition(w, h);
        setFocused(this);
    };

    UI_POP_CLASS.$resize = function () {
         var el = this._eMain,
            currStyle = el.style;

        currStyle.width = this._sWidth;
        currStyle.height = this._sHeight;
        this.repaint();
    }

    UI_POP_CLASS.init = function () {
        UI_CONTROL_CLASS.init.call(this);
        this.$hide();
    };

    UI_POP_CLASS.$blur = function () {
        this.hide();
        triggerEvent(this, 'cancel');
    };

    UI_POP_BTN_CLASS.$click = function () {
        var par = this.getParent();
        UI_BUTTON_CLASS.$click.call(this);
        if (triggerEvent(par, this._sCommand)) {
            par.$blur = blank;
            par.hide();
            delete par.$blur;
        }
    };

    var UI_POP_BUTTON = ui.PopButton = 
        inheritsControl(
            UI_BUTTON,
            'ui-pop-button',
            function (el, options) {
                var type = this.getTypes()[0],
                    o = createDom(type + '-icon', 'position:absolute');

                this._sAlign = options.align;
                el.appendChild(o);
                this._sTargetId = options.target;
            },
            function (el, options) {
                var type = this.getTypes()[0];

                if (options.mode == 'text') {
                    this.setClass(type + '-text');
                }
            }
        ),

        UI_POP_BUTTON_CLASS = UI_POP_BUTTON.prototype;

    UI_POP_BUTTON_CLASS.$click = function () {
        var con;
        UI_BUTTON_CLASS.$click.call(this);
        if (this._sTargetId) {
            con = core.get(this._sTargetId);
            con.show(this, this._sAlign);
        }
    };
})();

/**
 * query-tab
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    query-tab.js
 * desc:    查询类型tab
 * author:  cxl(chenxinle@baidu.com)
 * date:    2012/03/12
 */
(function () {
    var core = ecui,
        ui = core.ui,
        dom = core.dom,
        string = core.string,

        $fastCreate = core.$fastCreate,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,
        getOptions = core.getOptions,
        children = dom.children,
        createDom = dom.create,
        trim = string.trim,

        UI_CONTROL = ui.Control,
        UI_TIP = ui.PsTip,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_RADIO = ui.Radio,
        UI_RADIO_CLASS = UI_RADIO.prototype;

    var UI_QUERY_TAB = ui.QueryTab = 
        inheritsControl(
            UI_CONTROL,
            'ui-query-tab',
            null,
            function (el, options) {
                var childs = children(el),
                    type = this.getTypes()[0],
                    i, item, value = options.value;
                this._sName = options.name;
                this._aItems = [];
                this._bIsEnabled = true;
                
                for (i = 0; item = childs[i]; i++) {
                    var cfg = getOptions(item);
                    if(undefined == cfg.name) {
                        cfg.name = this._sName;
                    }
                    item.className = trim(item.className) + ' ' + type + '-item' + UI_RADIO.TYPES;
                    this._aItems[i] = $fastCreate(this.Item, item, this, cfg);
                    //@liuronghan
                    if (value !== undefined && value == this._aItems[i].getValue()) {
                        this._aItems[i].setChecked(true);
                        this._oCurChecked = this._aItems[i];
                    }
                }
            }
        ),

        UI_QUERY_TAB_CLASS = UI_QUERY_TAB.prototype,
        UI_QUERY_TAB_ITEM = UI_QUERY_TAB_CLASS.Item =
        inheritsControl(
            UI_RADIO, 
            'ui-query-tab-item', 
            null,
            function (el, options) {
                var o;
                if (options.tip) {
                    o = createDom('ui-tip', '', 'span');
                    o.setAttribute("ecui", "type:tip");
                    o.innerHTML = options.tip;
                    el.appendChild(o);
                    core.init(o);
                }
            }
        ),
        UI_QUERY_TAB_ITEM_CLASS = UI_QUERY_TAB_ITEM.prototype;

    UI_QUERY_TAB_ITEM_CLASS.$click = function () {
        var par = this.getParent(),
            curChecked = par._oCurChecked;
        if(!par._bIsEnabled){
            par.onLocked.call();
            return null;
        }
        UI_RADIO_CLASS.$click.call(this);
        if (curChecked && curChecked != this) {
            par._oCurChecked = this;
            triggerEvent(this.getParent(), 'change', null, [this.getValue()]);
        }
    };

    /* override */
    UI_QUERY_TAB_ITEM_CLASS.getItems = function () {
        return this.getParent().getItems();
    };

    UI_QUERY_TAB_CLASS.getItems = function () {
        return this._aItems.slice();
    };

    UI_QUERY_TAB_CLASS.getValue = function () {
        return this._oCurChecked ? this._oCurChecked.getValue() : null;
    };
    UI_QUERY_TAB_CLASS.getName = function () {
        return this._sName;
    };
    UI_QUERY_TAB_CLASS.onLocked = function () {
    }
    UI_QUERY_TAB_CLASS.setEnabled = function (value) {
        this._bIsEnabled = !!value;
    }
    UI_QUERY_TAB_CLASS.setValue = function (value) {
        for (var i = 0, item; item = this._aItems[i]; i++) {
            if (item.getValue() == value) {
                item.setChecked(true);
                this._oCurChecked = item;
            }
        }
    };
})();

(function () {
    var core = ecui,
        array = core.array,
        dom = core.dom,
        ui = core.ui,
        util = core.util,
        string = core.string,

        $fastCreate = core.$fastCreate,
        setFocused = core.setFocused,
        createDom = dom.create,
        children = dom.children,
        last = dom.last,
        moveElements = dom.moveElements,
        getPosition  = dom.getPosition,
        setText = dom.setText,
        inheritsControl = core.inherits,
        isContentBox = core.isContentBox,
        getStatus = core.getStatus,
        getView = util.getView,
        triggerEvent = core.triggerEvent,
        trim = string.trim,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,

        UI_TIP_TIME_OPEN = 500,
        UI_TIP_TIME_CLOSE = 200,
        REPAINT = core.REPAINT,

        uiPsTipLayer = null;

    var UI_TIP = ui.Tip = 
        inheritsControl(
            UI_CONTROL,
            'ui-tip',
            function(el, options) {
                options.message = trim(el.innerHTML) || options.message;
                el.innerHTML = '';
            },
            function (el, options) {
                this._sTarget = options.target;
                this._sMessage = options.message;
                this._oTimer = null;
                this._bAsyn = options.asyn === true;
                this._bLoad = false;
            }
        ),

        UI_TIP_CLASS = UI_TIP.prototype,
        UI_TIP_LAYER = UI_TIP_CLASS.Layer = 
        inheritsControl(
            UI_CONTROL,
            'ui-tip-layer',
            function (el, options) {
                el.appendChild(createDom(this.getTypes() + '-corner'));
                el.appendChild(createDom());
            },
            function (el, options) {
                el = children(el);
                this._eCorner = el[0];
                this.$setBody(el[1]);
            }
        ),

        UI_TIP_LAYER_CLASS = UI_TIP_LAYER.prototype;


    function UI_TIP_LAYER_GET() {
        var o;
        if (!uiPsTipLayer) {
            o = document.body.appendChild(createDom(UI_TIP_LAYER.TYPES));
            uiPsTipLayer = $fastCreate(UI_TIP_LAYER, o);
            uiPsTipLayer.cache();
            uiPsTipLayer.init();
        }
        return uiPsTipLayer;
    }


    UI_TIP_CLASS.$mouseover = function () {
        var con = this;
        UI_CONTROL_CLASS.$mouseover.call(this);
        clearTimeout(this._oTimer);
        if (!this._bShow) {
            if (this._bAsyn) {
                var layer = UI_TIP_LAYER_GET();
                this.close();
                con._oTimer = setTimeout(function () {
                        con._bLoad = false;
                        triggerEvent(con, 'loadData', function () {
                            con.open();
                        });
                    }, UI_TIP_TIME_OPEN);
            }
            else {
                this._oTimer = setTimeout(function () {
                    con.open();
                }, UI_TIP_TIME_OPEN);
            }
        }
    }

    UI_TIP_CLASS.$mouseout = function () {
        var con = this;
        UI_CONTROL_CLASS.$mouseout.call(this);
        clearTimeout(this._oTimer);
        if (this._bShow) {
            this._oTimer = setTimeout(function () {
                con.close()
            }, UI_TIP_TIME_CLOSE);
        }
    }

    UI_TIP_CLASS.$getTarget = function (id) {
        return document.getElementById(id);
    }

    UI_TIP_CLASS.setTarget = function (id) {
        this._sTarget = id;
    }

    UI_TIP_CLASS.open = function () {
        var layer = UI_TIP_LAYER_GET();

        if (this._sTarget) {
            var o = this.$getTarget(this._sTarget);
            if (o) {
                if ('[object String]' == Object.prototype.toString.call(o)) {
                    layer.getBody().innerHTML = o;
                }
                else {
                    layer.getBody().innerHTML = o.innerHTML;
                }
            }
        }
        else if (this._sMessage) {
            layer.setContent(this._sMessage);
        }

        layer.show(this);
        this._bShow = true;
    }

    UI_TIP_CLASS.close = function () {
        UI_TIP_LAYER_GET().hide();
        this._bShow = false;
    }

    UI_TIP_LAYER_CLASS.show = function (con) {
        var pos = getPosition(con.getOuter()),
            type = this.getTypes()[0],
            view = getView(),
            cornerHeight = 13,
            w = con.getWidth(), h = con.getHeight(),
            wFix = 9, hFix = 13,
            className = [];

        if (con) {
            this._uHost = con;
        }

        UI_CONTROL_CLASS.show.call(this);
        this.resize();
        if (pos.left + this.getWidth() > view.right) {
            pos.left = pos.left + w - this.getWidth() + wFix;
            className.push('-right')
        }
        else {
            pos.left = pos.left - wFix;
            className.push('-left');
        }

        if (pos.top - cornerHeight - this.getHeight() < view.top 
                && pos.top + h + cornerHeight + this.getHeight() < view.bottom) {
            pos.top += h + cornerHeight;
            className.push('-bottom');
        }
        else {
            pos.top -= cornerHeight + this.getHeight();
            className.push('-top');
        }

        this._eCorner.className = type + '-corner ' + type + '-corner' + className.join('');
        this.setPosition(pos.left, pos.top);
    }

    UI_TIP_LAYER_CLASS.$mouseover = function () {
        UI_CONTROL_CLASS.$mouseover.call(this);
        this._uHost.$mouseover();
    }

    UI_TIP_LAYER_CLASS.$mouseout = function () {
        UI_CONTROL_CLASS.$mouseout.call(this);
        this._uHost.$mouseout();
    }

    UI_TIP_LAYER_CLASS.$resize = function () {
         var el = this._eMain,
            currStyle = el.style;

        currStyle.width = this._sWidth;
        currStyle.height = this._sHeight;
        this.repaint();
    }
})();

