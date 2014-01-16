/**
 * select 扩展
 */
(function () {
    var core = ecui,
        ui = core.ui,

        UI_SELECT_CLASS = ui.Select.prototype;

    UI_SELECT_CLASS.clear = function () {
        var items = this.getItems() || [],
            len = items.length;

        while ( len-- > 0 ) {
            this.remove(0);
        }

        this._uOptions.reset();
    };
})();

/*
Calendar - 单日历控件
日历控件，继承自基础控件

例子:
<div ecui="type:calendar;name:dateTime;start:2012/12/12;end:2012-12-28"></div>
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

                if (options.date) {
                    var date = options.date.split('-');
                    this._oDate = new DATE(parseInt(date[0], 10), parseInt(date[1], 10) - 1, parseInt(date[2], 10));
                }
                else if (options.date === false) {
                    this._oDate = null
                }
                else {
                    this._oDate = new DATE();
                }
                var range = UI_CALENDAR_PARSE_RANGE(options.start, options.end);

                this._eText = child[0];

                this._uCancel = $fastCreate(this.Cancel, child[1], this);
                this._uButton = $fastCreate(UI_CONTROL, child[2], this);

                this._bCancelButton = options.cancelButton !== false;
                if (!this._bCancelButton) {
                    this._uCancel.$hide();
                }

                DOCUMENT.body.appendChild(o);
                this._uPanel = $fastCreate(this.Panel, o, this, {date: this._oDate, range: range});
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
                    html.push('<option value="'+ i +'">'+ (i < 10 ? '0' : '') + i +'</option>');
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


    function UI_CALENDAR_PARSE_RANGE(begin, end) {
        var now = new Date(), res = null,
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
            begin = begin.replace(/\//g, "-").split('-');
            res.begin = new Date(parseInt(begin[0], 10), parseInt(begin[1], 10) - 1, parseInt(begin[2], 10));
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
            end = end.split('-');
            res.end = new Date(parseInt(end[0], 10), parseInt(end[1], 10) - 1, parseInt(end[2], 10));
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
            str = str.split('-');
            this.setDate(new Date(parseInt(str[0], 10), parseInt(str[1], 10) - 1, parseInt(str[2], 10)));
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
        var year = date != null ? date.getFullYear() : (new Date()).getFullYear(),
            month = date != null ? date.getMonth() + 1 : (new Date()).getMonth() + 1;

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
                else if (options.selectAllButton) {
                    this.add('全部', 0, {selectAllButton: true});
                    this._bSelectAllBtn = true;
                }
                if (options.tip) {
                    this._bTip = true;
                }
                if (options.value) {
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

                options.value === undefined ? el.value = '' : el.value = options.value;
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
            control.$getSection('Text').setContent(text);
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
pagesizechange: 改变页长

ecui.get("queryListPager").onchange = function(page, size){

}
ecui.get("queryListPager").pagesizechange = function(){console.log(arguments);}


*/
(function() {

    var core = ecui,
        dom = core.dom,
        string = core.string,
        array = core.array,
        ui = core.ui,
        util = core.util,

        undefined, MATH = Math,

        createDom = dom.create,
        children = dom.children,
        extend = util.extend,
        blank = util.blank,

        $fastCreate = core.$fastCreate,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,

        UI_CONTROL = ui.Control,
        UI_PAGER = ui.Pager,
        UI_SELECT = ui.Select,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_PAGER_CLASS = UI_PAGER.prototype;
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
    var UI_EXT_PAGER = ui.ExtPager = inheritsControl(
    UI_CONTROL, 'ui-ext-pager', function(el, options) {
        var type = this.getTypes()[0],
            i, len, html = [];

        if(options.pageOptions) {
            this.PAGE_SIZE = options.pageOptions.split(',');
        } else {
            this.PAGE_SIZE = [10, 20, 50, 100];
        }

        html.push('<div class="' + type + '-page">共<em></em>页</div>');
        html.push('<span style="float:left; margin-right:10px">，</span>');
        html.push('<div class="' + type + '-sum">共<em></em>条记录</div>');
        html.push('<div class="ui-pager"></div>');
        html.push('<div class="' + type + '-pagesize">每页显示<select class="ui-select" style="width:45px">');
        for(i = 0, len = this.PAGE_SIZE.length; i < len; i++) {
            html.push('<option value="' + this.PAGE_SIZE[i] + '">' + this.PAGE_SIZE[i] + '</option>');
        }
        html.push('</select>条')
        el.innerHTML = html.join('');

        //处理pageSize
        options.pageSize = options.pageSize || DEFAULT_PAGE_SIZE;
        for(i = 0, len = this.PAGE_SIZE.length; i < len; i++) {
            if(this.PAGE_SIZE[i] == options.pageSize) {
                break;
            }
        }

    }, function(el, options) {
        var el = children(el),
            me = this;

        this._bResizable = false;
        this._eTotalPage = el[0].getElementsByTagName('em')[0];
        this._eTotalNum = el[2].getElementsByTagName('em')[0];
        this._uPager = $fastCreate(UI_PAGER, el[3], this, extend({}, options));
        this._uPager.$change = function(value) {
            triggerEvent(me, 'change', null, [value, me._uPager._nPageSize]);
        }
        this._uSelect = $fastCreate(UI_SELECT, el[4].getElementsByTagName('select')[0], this);
        this._uSelect.$change = function() {
            triggerEvent(me, 'pagesizechange', null, [parseInt(this.getValue())]);
        }
    }),

        UI_EXT_PAGER_CLASS = UI_EXT_PAGER.prototype,

        DEFAULT_PAGE_SIZE = 50;


    UI_EXT_PAGER.PAGE_SIZE = [10, 20, 50, 100];

    UI_EXT_PAGER_CLASS.init = function() {
        this._uPager.init();
        this._uSelect.init();
        this._eTotalPage.innerHTML = this._nTotalPage || 1;
        this._eTotalNum.innerHTML = this._uPager._nTotal || 0;
        this._uSelect.setValue(this._uPager._nPageSize);
    }
    UI_EXT_PAGER_CLASS.onchange = function(page, pagesize) {

    }
    UI_EXT_PAGER_CLASS.render = function(page, total, pageSize) {
        var item = this._uPager;

        this._uSelect.setValue(pageSize);
        if(total || total == 0) {
            this._eTotalNum.innerHTML = total;
            item._nTotal = total
        } else {
            this._eTotalPage.innerHTML = item._nPage || 0;
            this._eTotalNum.innerHTML = item._nTotal || 0;
            item._nTotal = item._nTotal || 0;
        }
        item._nPageSize = pageSize || item._nPageSize;

        //by hades
        this._nTotalPage = MATH.ceil(total / pageSize);
        this._eTotalPage.innerHTML = this._nTotalPage;

        item.go(page);
    };

    UI_EXT_PAGER_CLASS.getPageSize = function() {
        return this._uPager._nPageSize;
    };

    UI_EXT_PAGER_CLASS.getPage = function() {
        return this._uPager._nPage;
    };

    UI_EXT_PAGER_CLASS.getTotal = function() {
        return this._uPager._nTotal;
    };

    /**
     * override
     */
    UI_EXT_PAGER_CLASS.$setSize = blank;

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

                this._aItems = [];
                
                for (i = 0; item = childs[i]; i++) {
                    item.className = trim(item.className) + ' ' + type + '-item' + UI_RADIO.TYPES;
                    this._aItems[i] = $fastCreate(this.Item, item, this, getOptions(item));
                    if (value && value == this._aItems[i].getValue()) {
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
                    el.appendChild(o);
                    this._uTip = $fastCreate(UI_TIP, o, this, {target: options.tip});
                }
            }
        ),
        UI_QUERY_TAB_ITEM_CLASS = UI_QUERY_TAB_ITEM.prototype;

    UI_QUERY_TAB_ITEM_CLASS.$click = function () {
        var par = this.getParent(),
            curChecked = par._oCurChecked;
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
        h = h - parPos.top;
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

/**
 * validator
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    validator.js
 * desc:    验证器 
 * author:  cxl(chenxinle@baidu.com)
 * date:    2012/03/09
 */
(function () {

    var core = ecui,
        ui = core.ui,
        util = core.util,

        REGEXP = RegExp,
        triggerEvent = core.triggerEvent,

        VALIDATOR_RULES = {},
        VALIDATOR_RULES_ORDER = [];
        
    util.validator = {
        /**
         * 根据验证规则对数据进行验证
         * @public
         *
         * @param {Object}  value   待验证的数据
         * @param {Array}   rules   验证规则集合，按照数组顺序进行验证
         *
         * @return {Object} 验证结果 
         *      {Boolean}   state   验证结果
         *      {String}    name    验证失败时对应的验证规则名称
         *      {Object}    rule    验证失败时对应的验证要求
         */
        validate: function (value, rules) {
            var i = 0, item, res = true;

            while (res && rules[i]) {
                item = rules[i++];
                res = VALIDATOR_RULES[item.name].call(null, value, item.rule)
            }

            //构造验证结果对象
            if (!res) {
                res = {state: false, name: item.name, rule: item.rule};
            }
            else {
                res = {state: true};
            }
            return res;
        },

        /**
         * 增加验证器
         * @public
         *
         * @param {String}      ruleName    验证器规则的名称
         * @param {Function}    call        验证函数 接口形式如下
         *      @param {Object}     value   待验证的数据
         *      @param {Object}     rule    验证要求
         *      @return {Boolean}   验证是否通过
         */
        addRule: function (ruleName, call) {
            VALIDATOR_RULES[ruleName] = call;
            VALIDATOR_RULES_ORDER.push(ruleName);
        },

        /**
         * 收集验证信息
         * 按照系统默认的验证顺序收集验证规则
         * 用于在控件收集自生的验证规则
         *
         * @param {Object}  参数 key: 验证规则名, value:验证要求
         * @return {Array}  验证规则
         *      {String} name 验证名称
         *      {Object} rule 验证要求
         */
        collectRules: function (options) {
            var i, name, rules = [];

            for (i = 0; name = VALIDATOR_RULES_ORDER[i]; i++) {
                if (options.hasOwnProperty(name)) {
                    rules.push({name: name, rule: options[name]});
                }
            }

            return rules;
        }
    };

    /**
     * 添加非空验证器
     */
    util.validator.addRule('require', function (value) {
        if ('[object Array]' == Object.prototype.toString.call(value)) {
            return value.length !== 0;
        }
        else {
            value += '';
            return !!value;
        }
    });

    /**
     * 添加正则验证器
     */
    util.validator.addRule('patterMatch', function (value, rule) {
        var exp = new REGEXP(rule);

        return exp.test(value);
    });

    /**
     * 添加类型验证器
     * 支持URL, email格式验证
     */
    util.validator.addRule('typeMatch', function (value, rule) {
        var patter = {
            Url:     /^[^.。，]+(\\.[^.，。]+)+$/,
            Require: /.+/,
            Email:   /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
            Tel:     /^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/,
            Mobile:  /^0?(13[0-9]|15[0-9]|18[0236789]|14[57])[0-9]{8}$/,
            Url:     /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/,
            Currency:/^\d+(\.\d+)?$/,
            Number:  /^\d+$/,
            Zip:     /^[1-9]\d{5}$/,
            Ip:      /(\d)\.(\d)\.(\d)\.(\d)/,
            Integer: /^[-\+]?\d+$/,
            Double:  /^[-\+]?\d+(\.\d+)?$/,
            English: /^[A-Za-z]+$/,
            Chinese: /^[\u0391-\uFFE5]+$/,
            Username:/^[a-z]\w{3,}$/i,
            Name:    /^[\u0391-\uFFE5A-Za-z0-9]+$/
        }

        rule = patter[rule];
        if (rule && rule.test(value)) {
            return true;
        }
        else {
            return false;
        }
    });


    /**
     * 最大字符长度验证器
     */
    util.validator.addRule('maxLength', function(value, rule) {
        return value.length <= rule;
    });

    /**
     * 最小字符长度验证器
     */
    util.validator.addRule('minLength', function(value, rule) {
        return value.length >= rule;
    });

    /**
     * 最大值验证器
     */
    util.validator.addRule('maxValue', function(value, rule) {
        return value <= rule;
    });

    /**
     * 最小值验证器
     */
    util.validator.addRule('minValue', function(value, rule) {
        return value >= rule;
    });

    /**
     * 扩展Input控件，添加验证方法
     */
    var UI_INPUT_CONTROL_CLASS = ui.InputControl.prototype;

    /**
     * override
     */
    UI_INPUT_CONTROL_CLASS.validate = function () {
        var res = true, valid;

        valid = util.validator.validate(this.getValue(), this._aValidateRules);
        res = valid.state;
        if (!res) {
            triggerEvent(this, 'invalid', null, [valid.name, valid.rule]);
        }
        return res;
    };

    /**
     * 设置验证规则
     * @public
     *
     * @param {String} name 验证规则名称
     * @param {Object} rule 验证要求
     */
    UI_INPUT_CONTROL_CLASS.setValidateRules = function (options) {
        this._aValidateRules = util.validator.collectRules(options);
    };
})();

/**
 * score
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    score.js
 * desc:    评分控件
 * author:  cxl(chenxinle@baidu.com)
 * date:    2012/03/22
 *
 * params:
 *      {Number} max 最大的分值，默认5
 *      {Number} value 初始化分值, 默认0
        {Boolean} static 是否是静态的
 */
(function () {

    var core = ecui,
        ui = core.ui,
        util = core.util,

        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,
        blank = util.blank,
        extend = util.extend,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_ITEMS = ui.Items,
        UI_INPUT_CONTROL = ui.InputControl,
        UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype;

    var UI_SCORE = ui.Score = 
            inheritsControl(
                UI_INPUT_CONTROL,
                'ui-score',
                function (el, options) {
                    var max = options.max = options.max || 5,
                        html = [], i;

                    options.hidden = true;
                    options.value = options.value || 0;
                    for (i = 1; i <= max; i++) {
                        html.push('<span ecui="score:'+ i +'"></span>');
                    }
                    el.innerHTML = html.join('');
                },
                function (el, options) {
                    this._bStatic = (options['static'] === true);
                    this.$initItems(); 
                }
            ),
        UI_SCORE_CLASS = UI_SCORE.prototype,

        UI_SCORE_ITEM = UI_SCORE_CLASS.Item = inheritsControl(
            UI_CONTROL, 
            'ui-score-item',
            function (el, options) {
                options.resizable = false;
            },
            function (el, options) {
                this._nScore = options.score;
            }
        ),
        UI_SCORE_ITEM_CLASS = UI_SCORE_ITEM.prototype;

    extend(UI_SCORE_CLASS, UI_ITEMS);

    /**
     * @override
     */
    UI_SCORE_CLASS.init = function () {
        UI_INPUT_CONTROL_CLASS.init.call(this);
        this.$score(this.getValue());
    }

    /**
     * 标记评分
     * @private
     * 
     * @param <Number> score 需要标记的分值
     */
    UI_SCORE_CLASS.$score = function(score) {
        var items = this.getItems(),
            i, item;

        score = score || this.getValue(); 
        for (i = 0; item = items[i]; i++) {
            item.alterClass(i < score ? '+marked' : '-marked');
        }
    };

    /**
     * @override
     */
    UI_SCORE_CLASS.setValue = function (value) {
        UI_INPUT_CONTROL_CLASS.setValue.call(this, value);
        this.$score(value);
    };

    /**
     * @override
     */
    UI_SCORE_CLASS.$alterItems = blank;

    /**
     * 得到图标对应的分值
     * @public
     *
     * @return {Number} 分值
     */
    UI_SCORE_ITEM_CLASS.getScore = function () {
        return this._nScore;
    };

    /*
     * @override
     */
    UI_SCORE_ITEM_CLASS.$click = function (event) {
        if (!this.getParent()._bStatic) {
            this.getParent().setValue(this.getScore());
            UI_INPUT_CONTROL_CLASS.$click.call(this);
        }
    };

    /**
     * @override
     */
    UI_SCORE_ITEM_CLASS.$mouseout = function () {
        if (!this.getParent()._bStatic) {
            this.getParent().$score();
            UI_CONTROL_CLASS.$mouseout.call(this);
        }
    };

    /**
     * @override
     */
    UI_SCORE_ITEM_CLASS.$mouseover = function () {
        if (!this.getParent()._bStatic) {
            this.getParent().$score(this.getScore());
            UI_CONTROL_CLASS.$mouseover.call(this);
        }
    };

    /**
     * @override
     */
    UI_SCORE_ITEM_CLASS.$setSize = blank;
})();

/*
multi-calendar 两选日历控件
<div ecui="
    type     :multi-calendar;
    id       :dateRange;
    beginname:beginDate;endname:endDate;
    bdate    :2012/12/12;
    edate    :2033-12-12;
    remind   :请选择时间范围
"></div>
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
        UI_CALENDAR_STR_PATTERN = 'yyyy-MM-dd';

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
            function (el, options) {
                var o = createDom(), els;

                o.innerHTML = '<input type="hidden" name="'+ (options.beginname ? options.beginname : 'beginDate') +'" />'
                    + '<input type="hidden" name="'+ (options.endname ? options.endname : 'endDate') +'" />';
                
                if (options.bdate) {
                    els = options.bdate.replace(/\//g, "-").split("-");
                    this._oBegin = new Date (els[0], parseInt(els[1], 10) - 1, els[2]);
                }
                if (options.edate) {
                    els = options.edate.replace(/\//g, "-").split("-");
                    this._oEnd = new Date (els[0], parseInt(els[1], 10) - 1, els[2]);
                }
                els = children(o);    
                this._eBeginInput = els[0];
                this._eEndInput = els[1];

                moveElements(o, el, true);
            }
        );

    var UI_MULTI_CALENDAR_CLASS = UI_MULTI_CALENDAR.prototype;

    var UI_MULTI_CALENDAR_PANEL = UI_MULTI_CALENDAR_CLASS.Panel = 
        inheritsControl(
            UI_CONTROL,
            'ui-multi-calendar-panel',
            function () {},
            function (el, options) {
                var type = this.getTypes()[0],
                    html = [], range = options.range || {};

                this._oRange = range;
                html.push('<div class="'+ type +'-cal-area"><div class="'+ type +'-text"><strong>起始时间：</strong><span></span></div><div class="'+ UI_CALENDAR_PANEL.TYPES +'"></div></div>');
                html.push('<div class="'+ type +'-cal-area"><div class="'+ type +'-text"><strong>结束时间：</strong><span></span></div><div class="'+ UI_CALENDAR_PANEL.TYPES +'"></div></div>');
                html.push('<div class="'+ type +'-buttons"><div class="ui-button-g'+ UI_BUTTON.TYPES +'">确定</div><div class="'+ UI_BUTTON.TYPES +'">取消</div></div>');

                el.innerHTML = html.join('');
                el = children(el);

                this._eBeginText = el[0].firstChild.lastChild;
                this._eEndText = el[1].firstChild.lastChild;
                this._uBeginCal = $fastCreate(this.Cal, el[0].lastChild, this, {range: range});
                this._uBeginCal._sType = 'begin';
                this._uEndCal = $fastCreate(this.Cal, el[1].lastChild, this, {range: range});
                this._uEndCal._sType = 'end';
                this._uSubmitBtn = $fastCreate(this.Button, el[2].firstChild, this);
                this._uSubmitBtn._sType = 'submit';
                this._uCancelBtn = $fastCreate(this.Button, el[2].lastChild, this);
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
        this.setDate({begin: this._oBegin, end: this._oEnd});
        this._uPanel.init();
    };

    UI_MULTI_CALENDAR_CLASS.setDate = function (date) {
        var str = [], beginTxt, endTxt;

        if (date == null) {
            date = {begin: null, end: null};
        }

        beginTxt = date.begin ? formatDate(date.begin, UI_CALENDAR_STR_PATTERN) : '';
        endTxt = date.end ? formatDate(date.end, UI_CALENDAR_STR_PATTERN) : '';

        this._oBegin = date.begin;    
        this._oEnd = date.end;
        this._eBeginInput.value = beginTxt;
        this._eEndInput.value = endTxt;
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
        this._eText.innerHTML = str;
        UI_MULTI_CALENDAR_TEXT_FLUSH(this);
    };

    UI_MULTI_CALENDAR_CLASS.getDate = function () {
        return {begin: this._oBegin, end: this._oEnd};
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

    UI_MULTI_CALENDAR_PANEL_CLASS.setDate = function (date) {
        var range = this._oRange, 
            begin, end;

        this._oBeginDate = date.begin;
        this._oEndDate = date.end;

        if (date.begin) {
            this._eBeginText.innerHTML = formatDate(date.begin, UI_CALENDAR_STR_PATTERN);
        }
        else {
            this._eBeginText.innerHTML = '<span class="ui-multi-calendar-panel-default-text">请选择起始日期</span>';
        }

        if (date.end) {
            this._eEndText.innerHTML = formatDate(date.end, UI_CALENDAR_STR_PATTERN);
        }
        else {
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
        this._uBeginCal.init();
        this._uEndCal.init();
    };

    UI_MULTI_CALENDAR_PANEL_CLASS.$change = function () {
        var par = this.getParent(),
            beginDate = this._oBeginDate,
            endDate = this._oEndDate;

        if (triggerEvent(par, 'change', [beginDate, endDate])) {
            par.setDate({begin: beginDate, end: endDate});
        }
        this.hide();
    };

    UI_MULTI_CALENDAR_PANEL_CLASS.$setDate = function (date, type) {
        var key = type.charAt(0).toUpperCase() 
                + type.substring(1);

        var par = this.getParent();

        this['_e' + key + 'Text'].innerHTML = formatDate(date, UI_CALENDAR_STR_PATTERN);
        this['_o' + key + 'Date'] = date;
        if (type == 'begin') {
            if (par._nYearRange) {
                this._oRange.end = new Date(date);
                this._oRange.end.setFullYear(this._oRange.end.getFullYear() + par._nYearRange);
            }
            this._uEndCal.setRange(date, this._oRange.end);
        }
        else {
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
})();

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
﻿/**
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

/**
 * index-tab
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    index-tab.js
 * desc:    指标类型tab
 * author:  hades(denghongqi@gmail.com)
 * date:    2012/10/25
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
 		intercept = core.intercept,
 		mask = core.mask,
 		children = dom.children,
 		createDom = dom.create,
 		removeDom = dom.remove,
 		moveElements = dom.moveElements,
 		first = dom.first,
 		next = dom.next,
 		last = dom.last,
 		getText = dom.getText,
 		setText = dom.setText,
 		setStyle = dom.setStyle,
 		addClass = dom.addClass,
 		getParent = dom.getParent,
 		insertBefore = dom.insertBefore,
 		getPosition = dom.getPosition,
 		getView = util.getView,

 		UI_CONTROL = ui.Control,
 		UI_CONTROL_CLASS = UI_CONTROL.prototype,
 		UI_BUTTON = ui.Button,
 		UI_BUTTON_CLASS = UI_BUTTON.prototype,
 		UI_SELECT = ui.Select,
 		UI_SELECT_CLASS = UI_SELECT.prototype,
 		UI_INPUT_CONTROL = ui.InputControl,
 		UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype,
 		UI_PANEL = ui.Panel,
 		UI_PANEL_CLASS = UI_PANEL.prototype;

 	var UI_INDEX_TAB = ui.IndexTab = inheritsControl(
 			UI_CONTROL,
 			"ui-index-tab",
 			function (el, options) {
 				var type = this.getTypes()[0],
 					childs = children(el);
 					o = createDom();

 				for (var i = 0, e; e = childs[i++]; ) {
 					addClass(e, this.Body.TYPES);
 					addClass(e, type + "-body");
 					setStyle(e, "position", "relative");
 				}
 				insertBefore(o, children(el)[0]);
 			},
 			function (el, options) {
 				var type = this.getTypes()[0],
 					el = children(el);

 				this._uLabels = [];

 				for (var i = 1, o; o = el[i++]; ) {
 					var e = createDom();
 					setText(e, getText(removeDom(first(o))));
 					el[0].appendChild(e);
 					addClass(e, type + "-label");

 					var cLabel = $fastCreate(this.Label, e, this, {});
 					var cBody = $fastCreate(this.Body, o, this, {hScroll:false});
 					this._uLabels.push(cLabel);

 					cLabel._uBody = cBody;

 					//cLabel.$setSelected();

 					UI_PANEL_CLASS.$cache.call(cBody, cBody.getOuter().style, true);
 					cBody.$setSize(600, 240);
 				}

 				this._uLabels[0] && this._uLabels[0].$setSelected();
 			}
 		),
 		UI_INDEX_TAB_CLASS = UI_INDEX_TAB.prototype;

 	var UI_INDEX_TAB_LABEL_CLASS = (UI_INDEX_TAB_CLASS.Label = inheritsControl(UI_CONTROL)).prototype;

 	var UI_INDEX_TAB_BODY_CLASS = (UI_INDEX_TAB_CLASS.Body = inheritsControl(
 		UI_PANEL,
 		null,
 		function (el, options) {
 			var type = this.getTypes()[0],
 				o = createDom("ui-index-tab-items", "", "div");

 			moveElements(el, o, true);
 			el.appendChild(o);
 		},
 		function (el, options) {
 			var type = this.getTypes()[0],
 				childs = children(first(first(last(el))));

 			this._aItems = [];

 			for (var i = 0, o; o = childs[i++]; ) {
 				addClass(o, this.Item.TYPES);
 				var options = getOptions(o);
 				var cItem = $fastCreate(this.Item, o, this, options);
 			}
 		}
 	)).prototype;

 	var UI_INDEX_TAB_BODY_ITEM_CLASS = (UI_INDEX_TAB_BODY_CLASS.Item = inheritsControl(
 		UI_CONTROL,
 		"ui-index-tab-body-item",
 		function (el, options) {
 			if (options.clazz == 3) {
 				var type = this.getTypes()[0],
 					o = createDom();

 				setText(o, options.name);

 				var container = createDom();

 				container.appendChild(o);
 				var titleEl = createDom("", "", "span");
 				setText(titleEl, "统计时间段：");
 				container.appendChild(titleEl);
 				container.appendChild(last(el));
 				el.appendChild(container);
 			}

 			return el;
 		},
 		function (el, options) {
 			this._sClazz = options.clazz || 0;
            this._bIsPercent = options.isPercent === true;
 			this._sId = options.conId || "";
 			this._sPattern = options.pattern || 0;
 			this._sValue = options.value || "";
 			this._sSelected = false;
 			this._sName = options.name;
 			this._sText = this._sName;

 			if (options.clazz == 3) {
 				addClass(last(el), this.Plus.TYPES);
 				this._uPlus = $fastCreate(this.Plus, last(el), this, {});
 				removeDom(last(el));
 			}

 			//this._sText = (first(el) ? getText(first(el)) : getText(el));
 		}
 	)).prototype;

 	UI_INDEX_TAB_BODY_ITEM_CLASS.$click = function (e) {
 		if (this._sClazz != 3) {
 			this.$setSelected();
 			return ;
 		}
 		this._uPlus.$show();
 	};

 	UI_INDEX_TAB_BODY_ITEM_CLASS.$setSelected = function (value, text) {
 		var el = this.getOuter(),
 			body = this.getParent(),
 			control = body.getParent();

 		this._sSelected = true;

 		el = (first(el) ? first(el) : el);
 		this.alterClass("+selected");
 		!control._sSelected && (control._sSelected = this);
 		if (control._sSelected && control._sSelected != this) {
 			control._sSelected.$cancelSelected();
 			control._sSelected = this;
 		}

 		if (this._sClazz == 3) {
 			this._sText = this._sName + "(" + text + ")";
 			setText(el, this._sText);

 			this._sTimeValue = value;
 		}
 	};

 	UI_INDEX_TAB_BODY_ITEM_CLASS.$cancelSelected = function () {
 		var el = this.getOuter();
 		this._sSelected = false;
 		this.alterClass("-selected");
 		if (this._sClazz == 3) {
 			this._sText = this._sName;
 			setText(first(el), this._sText);
 		}
 	};

 	var UI_INDEX_TAB_BODY_ITEM_PLUS_CLASS = (UI_INDEX_TAB_BODY_ITEM_CLASS.Plus = inheritsControl(
 		UI_INPUT_CONTROL,
 		"ui-index-tab-body-item-plus",
 		function (el, options) {
 			var type = this.getTypes()[0],
 				o = createDom("", "", "div");
 			moveElements(el, o, true);
 			el.appendChild(first(o));
 			el.appendChild(o);

 			addClass(first(el), "clearfix");

 			o = createDom("", "float:left", "span");
 			setText(o, getText(first(el)));
 			setText(first(el), "");
 			first(el).appendChild(o);

 			o = createDom(type + "-img", "", "span");
 			first(el).appendChild(o);

 			setStyle(el, "position", "absolute");
 			setStyle(el, "overFlow", "hidden");
 			setStyle(el, "zIndex", "32771");
 		},
 		function (el, options) {
 			var type = this.getTypes()[0];
 				options = getOptions(last(next(first(el))));
 				addClass(first(el), type + "-title");
 				addClass(next(first(el)), type + "-body");
 				addClass(last(next(first(el))), this.Select.TYPES);

 			this._eInput = last(el);
 			this._uClose = $fastCreate(this.Close, last(first(el)), this, {});
 			this._uSelect = $fastCreate(this.Select, last(next(first(el))), this, options);

 			this._uSelect.$cache(this._uSelect.getOuter().style, true);

 			this._uSelect.$setSize(150, 20);

 			triggerEvent(this._uSelect, "ready");

 			setStyle(last(el), "position", "absolute");
 		}
 	)).prototype;

	UI_INDEX_TAB_BODY_ITEM_PLUS_CLASS.$click = function (e) {
		e.stopPropagation();
	};

 	UI_INDEX_TAB_BODY_ITEM_PLUS_CLASS.$show = function () {
 		ecui.mask(0.2, 32770);
 		var el = this.getOuter(),
 			pos = getPosition(this.getParent().getOuter());
 		
 		if (!getParent(el)) {
 			document.body.appendChild(el);
 			this.cache(this.getOuter().style, true);
 		}

 		this.setPosition(
 			pos.left,
 			pos.top + this.getParent().getHeight()
 			//pos.top + this.getParent().getHeight() + this.getHeight() <= getView().bottom ? pos.top + this.getParent().getHeight() : pos.top - this.getHeight()
 		);

 		UI_CONTROL_CLASS.$show.call(this);

 		UI_CONTROL_CLASS.$cache.call(this, this.getOuter().style, true);

 		var item = this.getParent();

 		(!item._sSelected) && (this._uSelect.setValue(""));

 		setStyle(this._eInput, "visibility", "hidden");
 		//setStyle(this._eInput, "width", this.getWidth() + "px");
 		//setStyle(this._eInput, "height", this.getHeight() + "px");
 		//setStyle(this._eInput, "left", "0");
 		//setStyle(this._eInput, "top", "0");

 	};

 	var UI_INDEX_TAB_BODY_ITEM_PLUS_CLOSE_CLASS = (UI_INDEX_TAB_BODY_ITEM_PLUS_CLASS.Close = inheritsControl(UI_BUTTON)).prototype;
 	var UI_INDEX_TAB_BODY_ITEM_PLUS_SELECT_CLASS = (UI_INDEX_TAB_BODY_ITEM_PLUS_CLASS.Select = inheritsControl(UI_SELECT)).prototype;

 	function hideItemPlus(e) {
 		e && e.stopPropagation();

 		var plus = this.getParent(),
 			item = plus.getParent(),
 			value = plus._uSelect.getValue(),
 			text = getText(plus._uSelect._uText.getOuter());

 		this._sValue = value;
		item.$setSelected(value, text);
 		plus.$hide();

 		ecui.mask();
 	};

 	UI_INDEX_TAB_BODY_ITEM_PLUS_CLOSE_CLASS.$click = function (e) {
 		e && e.stopPropagation();

 		var plus = this.getParent();
 		plus.$hide();

 		ecui.mask();
 	};

 	UI_INDEX_TAB_BODY_ITEM_PLUS_SELECT_CLASS.$change = hideItemPlus;

 	UI_INDEX_TAB_LABEL_CLASS.$setSelected = function () {
 		var par = this.getParent();
 		for (var i = 0, o; o = par._uLabels[i++]; ) {
 			o._uBody.hide();
 			o.alterClass("-selected");
 		}
 		this.alterClass("+selected");
 		this._uBody.show();
 	};

 	UI_INDEX_TAB_LABEL_CLASS.$click = function () {
 		UI_CONTROL_CLASS.$click.call(this);
 		this.$setSelected();
 	};

 	UI_INDEX_TAB_CLASS.getValue = function () {
 		var control = this._sSelected;

 		if (!control) {
 			return null;
 		}
 		else {
 			var data = {};
 			//control._sId && (data.id = control._sId);
 			//control._sClazz && (data.type = control._sClazz);
 			//control._sText && (data.name = control._sText);
 			//control._sPattern && (data.pattern = control._sPattern);

 			data.id = control._sId;
 			data.type = control._sClazz;
            data.isPercent = control._bIsPercent;
 			data.name = control._sText;
 			data.pattern = control._sPattern;
 			(control._sTimeValue != undefined) && (data["timeValue"] = control._sTimeValue);

 			return data;
 			}
 	};
 }) ();
(function () {

    var core = ecui,
        dom = core.dom,
        string = core.string,
        ui = core.ui,
        util = core.util,

        attachEvent = util.attachEvent,
        detachEvent = util.detachEvent,
        blank = util.blank,

        $bind = core.$bind,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;


    var UI_FORMS = ui.Forms = 
            inheritsControl(
                UI_CONTROL,
                'ui-forms',
                null,
                function (el, options) {
                    this._bResizable = false;
                    this._bAutoSubmit = options.autoSubmit !== false;
                    this._oItems = {};
                }
            ),
        UI_FORMS_CLASS = UI_FORMS.prototype;

    function isArray(obj) {
        return '[object Array]' == Object.prototype.toString.call(obj);
    }

    function each(items, caller) {
        for (var i = 0, item; item = items[i]; i++) {
            caller.call(null, item, i);
        }
    }

    function GET_VALUE(items) {
        var res = [], item, i;
        for (i = 0; item = items[i]; i++) {
            if (item.isChecked()) {
                res.push(item.getValue());
            }
        }
        return res.length == 1 ? res[0] : res;
    }

    function SET_VALUE(items, values) {
        var i, item;
        if (!isArray(values)) {
            values = [values];
        }
        for (i = 0; item = items[i]; i++) {
            each(values, function (value, idx) {
                if (value == item.getValue()) {
                    item.setChecked(true);
                }
                else {
                    item.setChecked(false);
                }
            });
        }
    }

    /**
     * @override
     */
    UI_FORMS_CLASS.$setSize = blank;
    
    /**
     * @override
     */
    UI_FORMS_CLASS.init = function () {
        attachEvent(this.getMain(), 'submit', function () {
            var con = this.getControl();
            if (!con._bAutoSubmit) {
                return false;
            }
            if (!con.validate()) {
                return false;
            }
            triggerEvent(con, 'submit', null);
            return false;
        });
        attachEvent(this.getMain(), 'reset', function () {
            var con = this.getControl();

            triggerEvent(con, 'reset', null);
            return false;
        });
    };

    UI_FORMS_CLASS.addItem = function (name, con) {
        var item;

        if (name == '') {
            return;
        }
        item = this._oItems[name];
        if (!item) {
            this._oItems[name] = con;
        }
        else if ('[object Array]' == Object.prototype.toString.call(item)) {
            item.push(con);
        }
        else {
            item = this._oItems[name] = [item];
            item.push(con);
        }
    };

    UI_FORMS_CLASS.getItems = function () {
        var res = [], key, item;

        for (key in this._oItems) {
            item = this._oItems[key];
            if ('[object Array]' == Object.prototype.toString.call(item)) {
                res = res.concat(item.slice());
            }
            else {
                res.push(item);
            }
        }

        return res;
    };

    UI_FORMS_CLASS.$submit = function () {
        this.getMain().submit();
    };

    UI_FORMS_CLASS.submit = function () {
        if (!this.validate()) {
            return;
        }
        this.$submit();
    };

    UI_FORMS_CLASS.reset = UI_FORMS_CLASS.$reset = function () {
        var items = this.getItems(), i, item;

        for (i = 0; item = items[i]; i++) {
            item.$reset();
        }
    };

    UI_FORMS_CLASS.apply = function () {
        var items = this.getItems(), i, item;

        for (i = 0; item = items[i]; i++) {
            item.setDefaultValue();
        }
    };

    /**
     * 验证
     */
    UI_FORMS_CLASS.validate = function () {
        var res = true, i, item, items = this.getItems();
        
        for (i = 0; item = items[i]; i++) {
            res = item.validate() && res;
        }

        if (!res) {
            triggerEvent(this, 'invalid');
        }

        return res;
    };

    /**
     * 
     */
    UI_FORMS_CLASS.getValue = function () {
        var key, data = {}, item;

        for (key in this._oItems) {
            item = this._oItems[key];
            if ('[object Array]' == Object.prototype.toString.call(item)) {
                data[key] = GET_VALUE(item);
            }
            else {
                data[key] = item.getValue();
            }
        }

        return data;
    };

    UI_FORMS_CLASS.setValue = function (data) {
        var key, item, items = this._oItems;
        
        for (key in data) {
            item = items[key];
            if (!item) {
                continue;
            }
            if ('[object Array]' == Object.prototype.toString.call(item)) {
                SET_VALUE(item, data[key]);
            }
            else {
                item.setValue(data[key]);
            }
        }
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

/**
 * input tree
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    input-tree.js
 * desc:    树层级输入框
 * author:  cxl(chenxinle@baidu.com)
 * date:    2012/03/12
 */
(function () {
    var core = ecui,
        array = core.array,
        dom = core.dom,
        ui = core.ui,
        util = core.util,
        string = core.string,

        $fastCreate = core.$fastCreate,
        setFocused = core.setFocused,
        disposeControl = core.dispose,
        createDom = dom.create,
        children = dom.children,
        moveElements = dom.moveElements,
        getPosition  = dom.getPosition,
        inheritsControl = core.inherits,
        getView = util.getView,
        extend = util.extend,
        blank = util.blank,
        triggerEvent = core.triggerEvent,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_BUTTON = ui.Button,
        UI_BUTTON_CLASS = UI_BUTTON.prototype,
        UI_INPUT_CONTROL = ui.InputControl,
        UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype,

        UI_INPUT_TREE = ui.InputTree = 
        inheritsControl(
            UI_INPUT_CONTROL,
            'ui-input-tree',
            function (el, options) {
                var type = this.getTypes()[0],
                    o = createDom();
                
                o.innerHTML = '<div class="'+ type +'-layer" ' 
                    + ' style="position:absolute;display:none; z-index:65535; height:230px; width:250px">'
                    + '<div class="'
                    + UI_DATA_TREE.types[0] +'"></div></div>';

                o = o.firstChild;

                moveElements(el, o.lastChild, true);
                options._eLayer = document.body.appendChild(o);
                
                el.innerHTML = '<span class="'+ type +'-text"></span><span class="'+ type +'-cancel"></span><span class="'+ type +'-button"></span><input type="hidden name="'+ options.name +'"" />';

                options.hidden = true;
                if (options.value) {
                    options.value += '';
                }
            },
            function (el, options) {
                var childs;
                
                if (options.value) {
                    UI_INPUT_CONTROL_CLASS.setValue.call(this, options.value);
                }

                childs = children(el);

                this._eText = childs[0];
                this._uCancel = $fastCreate(this.Cancel, childs[1], this);
                this._uLayer = $fastCreate(this.Layer, options._eLayer, this, {asyn : options.asyn});
                options._eLayer = null;
                delete options._eLayer;

                if (options.hideCancel === true) {
                    this._bHideCancel = true;
                    this._uCancel.$hide();
                }
            }
        ),

        UI_INPUT_TREE_CLASS = UI_INPUT_TREE.prototype,

        UI_INPUT_TREE_LAYER = UI_INPUT_TREE_CLASS.Layer = 
        inheritsControl(
            UI_CONTROL,
            'ui-input-tree-layer',
            null,
            function (el, options) {
                el.style.position = 'absolute';
                this._uTree = $fastCreate(this.Tree, el.firstChild, this, {collapsed:true, asyn: options.asyn});
            }
        ),
        UI_INPUT_TREE_LAYER_CLASS = UI_INPUT_TREE_LAYER.prototype,
        
        UI_DATA_TREE = ui.DataTree,
        
        UI_INPUT_TREE_CANCEL_CLASS = (UI_INPUT_TREE_CLASS.Cancel = inheritsControl(UI_CONTROL)).prototype,
        UI_INPUT_TREE_LAYER_TREE = UI_INPUT_TREE_LAYER_CLASS.Tree = 
            inheritsControl(
                UI_DATA_TREE,
                null,
                null,
                function (el, options) {
                    this._bAsyn = options.asyn;
                    if (options.asyn && this._aChildren.length <= 0) {
                        this.add('Loadding', null);
                        this.collapse();
                        this._bNeedAsyn = true;                        
                    }
                }
            ),
        UI_INPUT_TREE_LAYER_TREE_CLASS = UI_INPUT_TREE_LAYER_TREE.prototype;

    function UI_INPUT_TREE_FLUSH(con) {
        if (con.getValue() == '') {
            con._uCancel.hide();
        }
        else if (!con._bHideCancel) {
            con._uCancel.show();
        }
    }

    UI_INPUT_TREE_CLASS.$activate = function () {
        this._uLayer.show();
    }

    UI_INPUT_TREE_CLASS.init = function () {
        var value = this.getValue();

        this.setValue(value);
        this._uLayer.init();
        UI_INPUT_CONTROL_CLASS.init.call(this);
    }

    UI_INPUT_TREE_CLASS.$setText = function (value) {
        if (value && value.length > 15) {
            value = value.substring(0, 15) + '...';
        }
        this._eText.innerHTML = value;
    }

    UI_INPUT_TREE_CLASS.setValue = function (value) {
        var tree = this._uLayer._uTree;
        
        UI_INPUT_CONTROL_CLASS.setValue.call(this, value);
        tree.clearSelected();
        tree.setValues([value]);
        this.$setText(tree.getSelectedText());
        UI_INPUT_TREE_FLUSH(this);
    }

    UI_INPUT_TREE_CLASS.clear = function () {
        var tree = this._uLayer._uTree;

        tree.clearSelected();
        UI_INPUT_CONTROL_CLASS.setValue.call(this, '');
        this.$setText('');
        UI_INPUT_TREE_FLUSH(this);
    }

    /**
     * 重新收起input-tree,清理用户操作痕迹
     * @public
     */
    UI_INPUT_TREE_CLASS.clearState = function() {
        var tree = this._uLayer._uTree;
        collapseTree(tree);

        function collapseTree(tree) {
            tree.collapse();
            var children = tree.getChildren();
            if (children && children.length) {
                for (var i = 0; i < children.length; i++) {
                    collapseTree(children[i]);
                }
            }
        };
    };

    /**
     * 根据value获取树中的节点
     * @public
     * @param {string} value 
     */
    UI_INPUT_TREE_CLASS.getTreeNodeByValue = function(value) {
        return this._uLayer.getTreeNodeByValue(value);
    };

    /**
     * 设置输入文本框的值
     * @public
     * @param {string} text
     */
    UI_INPUT_TREE_CLASS.setText = function(text) {
        this.$setText(text);
    };

    UI_INPUT_TREE_CLASS.expand = function (value, callback) {
        var me = this;

        this._uLayer.expand(value, function () {
            callback.call(me);
        });
    }

    UI_INPUT_TREE_CLASS.selectParent = function (value) {
        var node = this._uLayer.getTreeNodeByValue(value);

        if (node != node.getRoot()) {
            node = node.getParent();
        }
        
        this.setValue(node.getValue());
    }

    UI_INPUT_TREE_LAYER_CLASS.init = function () {
        this._uTree.init();
        UI_CONTROL_CLASS.init.call(this);
    }

    UI_INPUT_TREE_LAYER_CLASS.$blur = function () {
        this.hide();
    }

    UI_INPUT_TREE_LAYER_CLASS.expand = function (value, callback) {
        var tree = this._uTree,
            node = tree.getItemByValue(value);
        if (node) {
            node.expand();
            tree.onexpand(node, callback);
        }
    }

    UI_INPUT_TREE_LAYER_CLASS.getTreeNodeByValue = function (value) {
        return this._uTree.getItemByValue(value);
    }

    UI_INPUT_TREE_LAYER_CLASS.show = function () {
        var par = this.getParent(), pos, o, view;

        UI_CONTROL_CLASS.show.call(this);

        if (par) {
            pos = getPosition(par.getOuter());
            view = getView();
            o = pos.top;
            /*
            if (o + par.getHeight() + this.getHeight() > view.bottom) {
                if (o - view.top > this.getHeight()) {
                    pos.top = o - this.getHeight();
                }
            }
            else {
                pos.top = o + par.getHeight();
            }
            */

            pos.top = o + par.getHeight();

            o = pos.left;
            if (o + this.getWidth() > view.right) {
                pos.left = o + par.getWidth() - this.getWidth();
            }
            else {
                pos.left = o;
            }
            this.setPosition(pos.left, pos.top);
            setFocused(this);
        }
    }

    UI_INPUT_TREE_CANCEL_CLASS.$click = function () {
        var par = this.getParent();
        UI_CONTROL_CLASS.$click.call(this);

        par.$setText('');
        UI_INPUT_CONTROL_CLASS.setValue.call(par, '');
        par._uLayer._uTree.clearSelected();
        UI_INPUT_TREE_FLUSH(par);
    }

    UI_INPUT_TREE_CANCEL_CLASS.$activate = UI_BUTTON_CLASS.$activate;

    UI_INPUT_TREE_LAYER_TREE_CLASS.onselect = function (con, added) {
        var superObj = this.getParent().getParent();
        UI_INPUT_CONTROL_CLASS.setValue.call(superObj, con.getValue());
        superObj.$setText(con.getText());
        UI_INPUT_TREE_FLUSH(superObj);
        this.getParent().hide();
    }

    UI_INPUT_TREE_LAYER_TREE_CLASS.onexpand = function (item, callback) {
        var superObj = this.getParent().getParent(),
            callback = callback || blank;
        
        var layer =  superObj._uLayer.getOuter(),
            scrollHeight = layer.scrollTop;
        var setScroll = function() {
           layer.scrollTop = scrollHeight ;
           layer = null;
        }
        if (item._bNeedAsyn) {
            triggerEvent(superObj, 'loadtree', null, [item.getValue(), function (data) {
                item.load(data); 
                callback.call(null);
                setScroll();
            }]);
            item._bNeedAsyn = false;
        }
        else {
            callback.call(null);
            setScroll();
        }
    }

    UI_INPUT_TREE_LAYER_TREE_CLASS.load = function (datasource) {
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
        
        if (!datasource || datasource.length <= 0) {
            this.setClass(this.getPrimary());
        }
    }
})();

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

        this.parEle = core.dom.getParent(el);
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
                                'value': i * 2 + 1,
                                'text': hours + ':00'
                            });
                            times.push({
                                'value': i * 2 + 2,
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
                case IS_NULL:
                    me._uSelect.setValue(IS_NULL);
                    break;
            }
            break;
        case 'input':
            me._uInput.setValue(firstValue);
            break;
        case "select":
            if(firstValue === null) {
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

            function convertValue(value, control) {
                var hour = parseInt(value.split(':')[0], 10);
                var minute = value.split(':')[1] == '00' ? 0 : 1;
                control.setValue(2 * hour + minut + '');
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
        baidu.dom.show(this.parEle);
    }, UI_CONDITION_PLUS_CLASS.hide = function() {
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
/**
 * custom-table.js
 * Copyright 2012 Baidu Inc. All rights reserved *
 * desc: 工作台项目定制的table控件，提供的功能包括表头锁定和列锁定、行选中、排序、使用render方法填充和刷新表格；表格支持跨行跨列,最多跨两行
 * author: hades(denghongqi@baidu.com)
 */
/*
var table = ecui.get('table'); 
var head = [
    {
        name: '岗位',
        width: 150,
        colspan:2,
        content: function(item) {
            return item.aa + 'hi function';
        }
    },
    {
        name: '财务收入',
        colspan:3,
        width: 150,
        content: 'aa'
    },
    { 
        name: '财务',
        title: '财务收入环比',
        width: 150,
        content: 'bb'
    }
]
    var field = [
    {
        name: '岗位',
        width: 150,
        content: function(item) {
            return item.aa + 'hi function';
        }
    },
    {
        name: '运营收入',
        width: 150,
        sortable: true,
        content: 'aa'
    },
                {
        name: '运营收入环比',
        content: 'aa',
        width: 150
    },
    {
        name: '运营收入同比',
        width: 100,
        content: 'aa'
    },
    {
        name: '财务收入',
        width: 150,
        content: 'aa'
    },
    { 
        name: '财务',
        title: '财务收入环比',
        width: 150,
        content: 'bb'
    }
];

var data = [];
for(var i = 0; i < 50; i++)  {
    data.push({
        aa: 'hello,aaaaaaa',
        bb: 'hihihi'
    });
}
table.render([head, field], []);
*/
 (function () {
    var core = ecui,
        dom = core.dom,
        array = core.array,
        ui = core.ui,
        string = core.string,
        util = core.util,

        $fastCreate = core.$fastCreate,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,
        disposeControl = core.dispose,
        $disposeControl = core.$dispose,
        createDom = dom.create,
        first = dom.first,
        last = dom.last,
        children = dom.children,
        addClass = dom.addClass,
        setStyle = dom.setStyle,
        setText = dom.setText,
        getText = dom.getText,
        removeClass = dom.removeClass,
        getParent = dom.getParent,
        moveElements = dom.moveElements,
        getAttribute = dom.getAttribute,
        getPosition = dom.getPosition,
        encodeHTML = core.string.encodeHTML,
        remove = array.remove,
        getView = util.getView,
        extend = util.extend,
        repaint = core.repaint,
        attachEvent = util.attachEvent,
        detachEvent = util.detachEvent,

        MATH = Math,
        MIN = MATH.min,
        WINDOW = window,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_TABLE = ui.Table,
        UI_TABLE_CLASS = UI_TABLE.prototype,
        UI_LOCKED_TABLE = ui.LockedTable,
        UI_LOCKED_TABLE_CLASS = UI_LOCKED_TABLE.prototype;

    var UI_CUSTOM_TABLE = ui.CustomTable =
        inheritsControl(
            UI_LOCKED_TABLE,
            'ui-table',
            function(el, options) {
                this._oOptions = options;
                this._aHeader = options.header;
                this._sSortby = options.sortby;
                this._sOrderby = options.orderby;
                if (!options.datasource) {
                    this._nLeftLock = options.leftLock || 0;
                    this._nRightLock = options.rightLock || 0;
                }

                var type = this.getTypes()[0];

                var html = [];
                html.push('<table><thead>');

                options.leftLock = options.leftLock || 0;
                options.rightLock = options.rightLock || 0;
                var lockedTotal = options.leftLock + options.rightLock;

                if (!options.datasource) {
                    setStyle(el, 'width', '100%');
                }
                else {
                    setStyle(el, 'width', 'auto');
                    setStyle(el, 'display', 'block');
                }

                if (!options.datasource) {
                    html.push('<tr>');
                    var i;
                    for (var i = 0; i <= lockedTotal; i++) {
                        html.push('<th></th>');
                    }
                    html.push('</tr>');
                }
                else {
                    //表头目前只支持跨两行
                    if ('[object Array]' == Object.prototype.toString.call(options.fields[0])) {
                        var flag = 0;    
                        var i;
                        for (i = 0; i < options.fields.length; i++) {
                            var o = options.fields[i];
                            html.push(createHeadRow(o, this, options.fields));
                        }
                        this._aColumns = [];
                        for (var i = 0, o; o = options.fields[0][i]; i++) {
                            if (o.colspan) {
                                for (var j = 0; j < o.colspan; j++) {
                                    this._aColumns.push(extend({}, options.fields[1][flag++]));
                                }
                            }
                            else {
                                this._aColumns.push(extend({}, o));
                            }
                        }
                    }
                    else {
                        html.push(createHeadRow(options.fields, this));
                        this._aColumns = copyArray(options.fields);
                    }
                }

                html.push('</thead><tbody>');

                if(!options.datasource)  {
                    html.push('<tr>');
                    var i;
                    html.push('<td></td>');
                    html.push('</tr>');
                    options.leftLock = 0;
                    options.rightLock = 0;
                }
                else {
                    this._aData = options.datasource;

                    if (!this._aData.length) {
                        html.push('<tr>');
                        html.push(
                            '<td class="' + type + '-empty-cell'
                            + '" align="middle" colspan="'
                            + this._aColumns.length
                            + '">'
                        );
                        html.push(
                            options.errorMsg ? options.errorMsg : '暂无数据，请稍后再试'
                        );
                        html.push('</td>');
                        html.push('</tr>');
                    }
                    else {
                        var i;
                        for (i = 0; i < options.datasource.length; i++) {
                            var item = options.datasource[i];
                            html.push('<tr>');
                            var j;
                            for (j = 0; j < this._aColumns.length; j++) {
                                var o = this._aColumns[j];
                                html.push('<td');

                                html.push(' width="' + o.width + '"');
                                html.push(
                                    ' style="width:' 
                                    + o.width 
                                    + 'px;'
                                    + 'min-width:'
                                    + o.width
                                    + 'px;'
                                    + 'max-width:'
                                    + o.width
                                    + 'px;"'
                                );

                                if (options.autoEllipsis) {
                                    html.push(' class="' + type + '-cell-ellipsis"');
                                }

                                o.align && html.push(
                                    ' align="' + o.align + '"'
                                );

                                html.push('>');

                                var content = o.content || o.field;

                                if (typeof content == 'function') {
                                    var e = content.call(null, item, i);
                                    if (Object.prototype.toString.call(e) == '[object String]') {
                                        if (options.autoEllipsis) {
                                            html.push(
                                                '<div style="overflow:hidden; text-overflow:ellipsis;'
                                                + 'width:' + o.width + 'px;'
                                                + 'max-width:' + o.width + 'px;'
                                                + 'min-width:' + o.width + 'px;'
                                                + '" title="'
                                                + e
                                                + '">'
                                                + e
                                                + '</div>'
                                            );
                                        }
                                        else if (o.maxlength 
                                            && e
                                            && e.length > o.maxlength
                                        ) {
                                            html.push('<span class="');
                                            html.push(type + '-cell-limited"');
                                            html.push(' title="' + e + '">');
                                            html.push(encodeHTML(e.substring(0, o.maxlength)));
                                            html.push('...');
                                            html.push('</span>');
                                        }
                                        else {
                                            html.push(e);
                                        }
                                    }
                                    else {
                                        var div = createDom();
                                        div.appendChild(e);
                                        html.push(div.innerHTML);
                                    }
                                } else {
                                    if (o.checkbox) {
                                        html.push('<input type="checkbox"');
                                        html.push(
                                            ' class="' + type + '-checkbox"'
                                        );
                                        html.push(
                                            ' data-rownum="' + i + '"'
                                        );
                                        html.push(' />');
                                    }
                                    else if (o.score) {
                                        html.push('<span ecui="type:score; static:true; max:');
                                        html.push(
                                            o.max + '; value:' + item[content]
                                        );
                                        html.push('"></span>');
                                    }
                                    else {
                                        // if (options.autoEllipsis) {
                                        //     html.push(
                                        //         '<div style="overflow:hidden; text-overflow:ellipsis;'
                                        //         + 'width:' + o.width + 'px;'
                                        //         + 'max-width:' + o.width + 'px;'
                                        //         + 'min-width:' + o.width + 'px;'
                                        //         + '" title="'
                                        //         + string.format(item)
                                        //         + '">'
                                        //         + encodeHTML(item[content])
                                        //         + '</div>'
                                        //     );
                                        // }
                                        // else if (o.maxlength 
                                        //     && item[content] 
                                        //     && item[content].length > o.maxlength
                                        // ) {
                                        //     html.push('<span class="');
                                        //     html.push(type + '-cell-limited"');
                                        //     html.push(' title="' + encodeHTML(item[content]) + '">');
                                        //     html.push(encodeHTML(item[content].substring(0, o.maxlength)));
                                        //     html.push('...');
                                        //     html.push('</span>');
                                        // }
                                        // else {
                                        //     item[content] = item[content] || '';
                                        //     html.push(encodeHTML(item[content]));
                                        // }
                                        html.push(string.format(o.content, item) || '<div class="ui-table-empty-cell">-</div>');
                                    }
                                    if (o.detail) {
                                        html.push(
                                            '<span style="margin-left:3px;"'
                                            + ' ecui="type:tip;asyn:true;id:'
                                        );
                                        html.push('tip-' + item[o.idField] + '"');
                                        html.push('></span>');
                                    }
                                }

                                html.push('</td>');
                            }
                            html.push('</tr>');
                        }
                    }
                }

                html.push('</tbody></table>');

                el.innerHTML = html.join('');

                return el;
            },
            function(el, options) {
                ecui.init(el);
                if (options.fields && options.datasource) {
                    initEmbedControlEvent(options.fields, options.datasource);
                }

                this.$bindCheckbox();
                return el;
            }
        ),
        UI_CUSTOM_TABLE_CLASS = UI_CUSTOM_TABLE.prototype,

        DELEGATE_EVENTS = ['click', 'mouseup', 'mousedown'],

        // 默认处理函数
        DEFAULT_EVENTS = {
            'click th.ui-table-hcell-sort': function (event, control) {
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
            'click input.ui-table-checkbox-all': function (event, control) {
                control.$refreshCheckbox(this.checked);
            },
            'click input.ui-table-checkbox': function (event, control) {
                control.$refreshCheckbox();
            }
        };      

    /** 
     * 生成表头的一行
     * 
     * @param {Array} headrow 一行表头的数据
     * @param {ecui.ui.CustomTable} con
     * @param {Array} opt_head 所有的表头数据
     * @return {string} html片段
     */
    function createHeadRow(headrow, con, opt_head) {
        var type = con.getTypes()[0];

        var html = [];
        html.push('<tr>');

        var flag = 0;
        var i = 0;
        for (i = 0; i < headrow.length; i++) {
            var o = headrow[i];
            html.push('<th ');
            html.push('data-field="');

            if (Object.prototype.toString.call(o.field) == '[object String]') {
                html.push(o.field);
            }

            if (o.width) {
                html.push(
                    '" style="width:' + o.width + 'px;'
                    + 'min-width:' + o.width + 'px;'
                    + 'max-width:' + o.width + 'px;'
                );
            }

            if (o.rowspan) {
                html.push(
                    '" rowspan="' + o.rowspan
                );
            }
            if (o.colspan) {
                html.push(
                    '" colspan="' + o.colspan
                );

                var j;
                var width = 0;
                for (j = flag; j < flag + o.colspan; j++) {
                    width += opt_head[1][j].width;
                }

                html.push(
                    '" width="' + width
                );

                flag += o.colspan;
            }
            if (o.sortable) {
                html.push(
                    '" class="' + type + '-hcell-sort'
                );
                if (o.field && o.field == con._sSortby) {
                    html.push(
                        ' ' + type + '-hcell-sort-' + con._sOrderby
                    );
                }
                if (o.order) {
                    html.push(
                        '" data-orderby="' + o.order.toLowerCase()
                    );
                }
            }
            html.push('">');

            if (o.name) {
                html.push(o.name);
            }

            if (o.checkbox) {
                html.push(
                    '<input type="checkbox" class="'
                    + type + '-checkbox-all"'
                    + ' />'
                );
            }

            if (o.tip && o.tip.length) {
                html.push('<span ecui="type:tip; id:tip-');
                html.push(o.field);
                html.push('; message:');
                html.push(o.tip);
                html.push('"></span>');
            }

            html.push('</th>');
        }
        html.push('</tr>');

        return html.join('');
    }

    /**
     * 帮顶表格内部子控件的事件
     *
     * @param {Array} header 表头数据
     * @param {Array} datasource 表格数据
     */
    function initEmbedControlEvent(header, datasource) {
        var i = 0;
        for (i = 0; i < datasource.length; i++) {
            var item = datasource[i];
            for (var j = 0; j < header.length; j++) {
                var o = header[j];
                if (o.detail) {
                    var controlId = 'tip-' + item[o.idField];
                    if (ecui.get(controlId)) {
                        ecui.get(controlId).onloadData = (function (item, o) {
                            return function (handler) {
                                o.loadData(item, handler);
                            }
                        }) (item, o);
                    }
                }
            }
        }
    }

    UI_CUSTOM_TABLE_CLASS.getData = function () {
        return this._aData;
    };

    /**
     * 重新生成表格
     * @public
     *
     * @param {Array} fields 表格的列配置
     * @param {Array} datasource 表格数据
     * @param {Object} sortinfo 排序信息
     * @param {Object} options 初始化选项
     * @param {string} errorMsg 表格为空或出错时展示的内容
     */
    UI_CUSTOM_TABLE_CLASS.render = function(
        fields, datasource, sortinfo, options, errorMsg
    ) {
        var options = extend({}, options);
        options = extend(options, this._oOptions);
        options.leftLock = this._nLeftLock;
        options.rightLock = this._nRightLock;
        options.fields = fields;
        options.datasource = datasource || [];
        var sortinfo = sortinfo || {};
        options.sortby = sortinfo.sortby;
        options.orderby = sortinfo.orderby;
        options.errorMsg = errorMsg;

        if (!datasource.length) {
            options.leftLock = 0;
            options.rightLock = 0;
        }

        detachEvent(WINDOW, 'resize', repaint);

        if (!options.complex) {
            var key;

            //卸载行
            var rows;
            var i;
            rows = this._aHeadRows.concat(
                this._aRows, 
                this._aLockedRow, 
                this._aLockedHeadRow
            );

            var row;
            for (i = 0; row = rows[i]; i++) {
                var j;
                if (row._aElements) {
                    var cells = row.getCells();
                    for (j = 0; cell = cells[j]; j++) {
                        $disposeControl(cell);
                    }
                    $disposeControl(row, true);
                }
            }
        }

        for (i = 0; key = this._aHCells[i]; i++) {
            $disposeControl(key, true);
        }

        //卸载内部子控件
        for (key in this) {
            if (/_u\w+/.test(key)) {
                disposeControl(this[key]);
            }
        }

        var el = this.getOuter();
        core.dom.empty(el);
        this.$setBody(el);

        this.$resize();
        UI_CUSTOM_TABLE.client.call(this, el, options);
        this._bCreated = false;
        this.cache(true, true);
        //this.init();
        UI_LOCKED_TABLE_CLASS.init.call(this);

        //恢复
        attachEvent(WINDOW, 'resize', repaint);
        this.resize();
    };

    UI_CUSTOM_TABLE_CLASS.disposeUnit = function(callback) {
        detachEvent(WINDOW, 'resize', repaint);

        var key;

        //卸载行
        var rows;
        rows = this._aHeadRows.concat(
            this._aRows, 
            this._aLockedRow, 
            this._aLockedHeadRow
        );

        var i = 0;
        var timer = function() {
            var row = rows[i];
            if (row) {
                var j;
                if (row._aElements) {
                    var cells = row.getCells();
                    for (j = 0; cell = cells[j]; j++) {
                        $disposeControl(cell);
                    }
                    $disposeControl(row, true);
                }
                i++;
                setTimeout(timer, 0);
            }
            else {
                callback();
            }
        };
        timer();

        //恢复
        attachEvent(WINDOW, 'resize', repaint);
    };

    /**
     * 获取表格当前所有行单选框的引用
     * @private
     */
    UI_CUSTOM_TABLE_CLASS.$bindCheckbox = function () {
        var inputs = this.getBody().getElementsByTagName('input'),
            i, item, type = this.getTypes()[0];

        this._aCheckboxs = [];
        this._eCheckboxAll = null;

        for (i = 0; item = inputs[i]; i++) {
            if (item.type == 'checkbox' 
                    && item.className.indexOf(type + '-checkbox-all') >= 0
            ) {
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
    UI_CUSTOM_TABLE_CLASS.$refreshCheckbox = function (checked) {
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

        if (this._eCheckboxAll) {
            this._eCheckboxAll.checked = checked !== undefined ? checked : newChecked;
        }
    };

    /**
     * table生产完毕以后执行，触发sizechange事件
     *
     */
    UI_CUSTOM_TABLE_CLASS.$ready = function() {
        triggerEvent(this, 'sizechange');
    };


    /**
     * 浏览器resize时调整横滚的位置
     *
     * @override
     */
    UI_CUSTOM_TABLE_CLASS.$resize = function() {
        var me = this;
        UI_LOCKED_TABLE_CLASS.$resize.call(this);
        setTimeout(
            function() {
                triggerEvent(me, 'sizechange');
                me.$pagescroll();
            },
            100
        );
    };

    /**
     * 页面滚动时保持表头和横滚浮在视窗上
     *
     * @override
     */
    UI_CUSTOM_TABLE_CLASS.$pagescroll = function() {
        UI_LOCKED_TABLE_CLASS.$pagescroll.call(this);

        if (this._uHScrollbar) {
            setFloatHScroll(this);
        }
    };

    UI_CUSTOM_TABLE_CLASS.getSelection = function () {
        if (!this._aCheckboxs || !this._aCheckboxs.length) {
            return [];
        }

        var res = [];

        for (var i = 0, o; o = this._aCheckboxs[i++]; ) {
            if (o.checked) {
                var index = getAttribute(o, 'data-rownum') - 0;
                res.push(extend({}, this._aData[index]));
            }
        }
        return res;
    };

    /**
     * @override
     */
    UI_CUSTOM_TABLE_CLASS.init = function () {
        var i, item, ele = this.getOuter(),
            control = this;

        UI_LOCKED_TABLE_CLASS.init.call(this);

        // 添加控件全局的事件监听
        // 只支持click mousedown mouseup
        for (i = 0; item = DELEGATE_EVENTS[i]; i++) {
            attachEvent(ele, item, (function (name) {
                return function (event) {
                    var e = event || window.event;
                    e.targetElement = e.target || e.srcElement;
                    control.$fireEventHandler(name, e);
                }
            })(item));
        }
    };

    /**
     * 触发表格events中定义的事件
     * @private
     *
     * @param {String} eventType 事件类型
     * @param {Event} nativeEvent 原生事件参数
     */
    UI_CUSTOM_TABLE_CLASS.$fireEventHandler = function (eventType, nativeEvent) {
        var events = getHandlerByType(this.events, eventType),
            i, item, target = nativeEvent.targetElement, selector;

        for (i = 0; item = events[i]; i++) {
            if (checkElementBySelector(target, item.selector)) {
                item.handler.call(target, nativeEvent, this);
            }
        }
    }

    UI_CUSTOM_TABLE_CLASS.$refresh = function (el, options) {
        var cells = [],
            rows = [];

        addClass(el, this.getTypes()[0]);

        cells = this._aHCells;
        rows = this._aRows.concat(this._aHeadRows, this._aLockedRow, this._aLockedHeadRow);

        for (var i = 0, o; o = cells[i++]; ) {
            disposeControl(o);
        }

        for (var i = 0, o; o = rows[i++]; ) {
            disposeControl(o);
        }

        //释放原表格中的部分引用
        //this._eCheckboxAll && delete this._eCheckboxAll;
        //this._aCheckboxs && delete this._aCheckboxs;

        UI_LOCKED_TABLE_CLASS.$refresh.call(this, el, options);

    };
    /**
    * @namespace qaTest 支持qa业务的一些内容
    * @return {Object} 
    * @return {Object} obj.table table的引用
    */
    UI_CUSTOM_TABLE_CLASS.qaTest = function() {
        var table = this; 
        return {
            table: table 
        }
    
    };

    /**
    * @return {number}  返回表格的行数
    */
    UI_CUSTOM_TABLE_CLASS.qaTest.getRowsCount = function() {
        var data = this.table.getData();
        if (data && data.length) {
            return data.length; 
        } 
        else {
            return 0; 
        }
    }
    /**
    * @return {number}  返回表格的行数
    */
    UI_CUSTOM_TABLE_CLASS.qaTest.getRowsContent = function() {
        var data = this.table.getData() || null;
        return data; 
    }
    /**
     * 让表格的横滚始终悬浮在页面视窗低端
     * 
     * @param {ecui.ui.CustomTable} con
     */
    function setFloatHScroll(con) {
        var el;

        el = con._eBrowser ? con._eBrowser : con._uHScrollbar.getOuter();
        el.style.top = MIN(
            getView().bottom - getPosition(con.getOuter()).top - el.offsetHeight,
            con.getHeight() - el.offsetHeight
        ) + 'px';

        setStyle(el, 'zIndex', 1);
    }

    function getHandlerByType(events, type) {
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
    
    function copyArray(data) {
        var res = [];
        for (var i = 0, o; o = data[i++]; ) {
            res.push(extend({}, o));
        }
        return res;
    }

 }) ();

/**
 * cascade-select.js
 * Copyright 2012 Baidu Inc. All rights reserved
 *
 * desc: 级联下拉菜单
 * author: hades(denghongqi@baidu.com)
 */

 (function () {
 	var core = ecui,
 		ui = core.ui,
 		dom = core.dom,
 		string = core.string,
 		util = core.util,

 		$fastcreate = core.$fastcreate,
 		$connect = core.$connect,
 		inheritsControl = core.inherits,
 		triggerEvent = core.triggerEvent,
 		encodeHTML = string.encodeHTML,

 		UI_CONTROL = ui.Control,
 		UI_CONTROL_CLASS = UI_CONTROL.prototype,
 		UI_SELECT = ui.Select,
 		UI_SELECT_CLASS = UI_SELECT.prototype,

 		UI_CASCADE_SELECT = ui.CascadeSelect = inheritsControl(
 			UI_SELECT,
 			null,
 			function (el, options) {},
 			function (el, options) {
 				this._bTarget = options.target;
 				$connect(this, function (target) {
 					this._cTarget = target;
 				}, this._bTarget);
 			}
 		),
 		UI_CASCADE_SELECT_CLASS = UI_CASCADE_SELECT.prototype;

 	UI_CASCADE_SELECT_CLASS.$change = function () {
 		UI_SELECT_CLASS.$click.call(this);
 		var target = this._cTarget;
 		triggerEvent(target, 'loaddata', function (options, value) {
 			var control = target;

 			control.clear();

 			for (var i = 0, o; o = options[i]; i++) {
 				control.add(o.text, null, {value : o.value});
 			}

 			control.setValue(value);
 		});
 	};
 }) ();
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
/**
 * @file 工作台首页表格导航菜单
 * @author hades(denghongqi@gmail.com)
 */

 (function() {
    var core = ecui,
        ui = core.ui,
        dom = core.dom,
        array = core.array,
        string = core.string,
        util = core.util,

        $fastCreate = core.$fastCreate,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,
        children = dom.children,
        first = dom.first,
        last = dom.last,
        getParent = dom.getParent,
        createDom = dom.create,
        insertBefore = dom.insertBefore,
        insertAfter = dom.insertAfter,
        setStyle = dom.setStyle,
        removeDom = dom.remove,
        addClass = dom.addClass,
        getAttr = dom.getAttribute,
        removeClass = dom.removeClass,
        getPosition = dom.getPosition,
        moveElements = dom.moveElements,
        extend = util.extend,
        blank = util.blank,

        DOCUMENT = document,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_ITEM = ui.Item,
        UI_ITEM_CLASS = UI_ITEM.prototype,
        UI_ITEMS = ui.Items;

    var UI_TOOLBAR = ui.Toolbar = 
        inheritsControl(
            UI_CONTROL,
            'ui-toolbar',
            function(el, options) {
                var type = this.getTypes()[0];
            },
            function(el, options) {
                var type = this.getTypes()[0];
                this._nMaxShow = options.maxShow || 5;
                if (children(el).length < this._nMaxShow + 1) {
                    var o = createDom('', '', 'span');
                    moveElements(el, o, true);
                    el.appendChild(o);
                    this.$setBody(o);
                    this.$initItems();
                    var items = this.getItems();
                }
                else {
                    var o = createDom('', '', 'span');
                    moveElements(el, o, true);
                    el.appendChild(o);
                    this.$setBody(o);

                    var e = createDom(type + '-more-out', '', 'div');

                    var num = this._nMaxShow - 1;
                    var o = children(o);
                    for (var i = num; i < o.length; i++) {
                        var clo = createDom('', '', o[i].tagName);
                        clo.innerHTML = o[i].innerHTML;
                        clo.setAttribute(
                            'ecui',
                            getAttr(o[i], 'ecui')
                        );
                        //var clo = baidu.object.clone(o[i]);
                        //var clo = o[i].cloneNode();
                        //clo.innerHTML = o[i].innerHTML;
                        e.appendChild(clo);
                    }

                    el.appendChild(e);
                    this.$initItems();
                    var items = this.getItems();
                    this._MoreMenu = [];
                    for (var i = num; i < o.length; i++) {
                        this._MoreMenu.push(items[i]);
                    }
                }

                this._nItems = this.getItems().length;

                for (var i = 0; i < this._nItems; i++) {
                    var outer = this.getItems()[i].getOuter();
                    var o = createDom(type + '-text', '', 'span');
                    moveElements(outer, o, true);
                    outer.appendChild(o);

                    if (children(el)[1] || i < this._nItems - 1) {
                        var o = createDom(type + '-space', '', 'span');
                        o.innerHTML = '|';
                        outer.appendChild(o);
                    }
                }

                if (children(el)[1]) {
                    var o = createDom(type + '-more', '', 'div');
                    moveElements(children(el)[1], o, true);
                    children(el)[1].appendChild(o);
                    this._uMore = $fastCreate(
                        this.More, 
                        o,
                        this, 
                        {}
                    );
                    flushToolbar(this);
                }
                if (this.getItems() && this.getItems().length) {
                    this.getItems()[0].$setSelected();
                }
            }
        ),
        UI_TOOLBAR_CLASS = UI_TOOLBAR.prototype;

    /**
     * 获取当前选中的值
     */
    UI_TOOLBAR_CLASS.getValue = function() {
        return this._cSelected.getValue();
    };

    /**
     * 刷新控制表格导航菜单项的显示和隐藏
     * @param {ecui.ui.Toolbar} control 导航条控件
     */
    function flushToolbar (control, type) {
        var more = control._uMore;
        var value;
        if (more.getSelected()) {
            value = more.getSelected().getValue();
        }
        for (var i = 0; i < control._MoreMenu.length; i++) {
            var o = control._MoreMenu[i];
            if (value == o.getValue()) {
                o.show();
                if (type == 'select') {
                    o.$setSelected();
                }
            }
            else {
                o.hide();
            }
        }
    };

    /**
     * 下拉菜单子控件
     */
    var UI_TOOLBAR_MORE_CLASS = 
        (UI_TOOLBAR_CLASS.More = inheritsControl(
            UI_CONTROL,
            'ui-toolbar-more',
            function (el, options) {
                var type = this.getTypes()[0];
                setStyle(el, 'z-index', 32764);
                var o = createDom(type + '-button', '', 'span');
                o.innerHTML = '<span '
                    +'style="vertical-align:middle">更多</span>'
                    +'<span class="' + type + '-img"></span>';
                insertBefore(o, el.firstChild);
                var o = createDom();
                el.appendChild(o);
                el = children(el);
                for (var i = 1; i < el.length - 1; i++) {
                    o.appendChild(el[i]);
                }
            },
            function (el, options) {
                var type = this.getTypes()[0];
                addClass(last(el), type + '-options');
                setStyle(last(el), 'position', 'absolute');
                this._uOptions = $fastCreate(
                    this.Options,
                    removeDom(last(el)),
                    this,
                    {}
                );
                this.$setBody(this._uOptions.getBody());
                this.$initItems();
                this._cSelected = this.getItems()[0];
            }
        )).prototype;

    /**
     * 获取‘更多’下拉菜单中选中的item
     * @public
     */
    UI_TOOLBAR_MORE_CLASS.getSelected = function () {
        return this._cSelected;
    };

    /**
     * 更多下拉菜单的选项部分
     */
    var UI_TOOLBAR_MORE_OPTIONS_CLASS = 
        (UI_TOOLBAR_MORE_CLASS.Options = inheritsControl(
            UI_CONTROL,
            'ui-toolbar-more-options'
            )).prototype;

    UI_TOOLBAR_MORE_CLASS.$mouseover = function() {
        UI_CONTROL_CLASS.$mouseover.call(this);
        flushMoreOptions(this);
    };

    UI_TOOLBAR_MORE_CLASS.$mouseout = function () {
        UI_CONTROL_CLASS.$mouseout.call(this);
        this._uOptions.hide();
    }

    function flushMoreOptions(control) {
        var options = control._uOptions;
        var el = options.getOuter();

        if (!getParent(el)) {
            // 第一次显示时需要进行下拉选项部分的初始化，将其挂载到 DOM 树中
            DOCUMENT.body.appendChild(el);
            control.cache(false, true);
        }

        UI_CONTROL_CLASS.show.call(options);

        for (var i = 0; i < control.getItems().length; i++) {
            var o = control.getItems()[i];
            if (control._cSelected == o) {
                o.hide();
            }
            else {
                o.show();
            }
        }

        var pos = getPosition(control.getOuter());
        options.setPosition(
            pos.left + control.getOuter().offsetWidth - el.offsetWidth - 1,
            pos.top + control.getOuter().offsetHeight
        );
    };

    /**
     * 初始化菜单内容
     *
     * @public
     * @param {Object} options 初始化选项
     */
    var UI_TOOLBAR_ITEM_CLASS = 
        (UI_TOOLBAR_CLASS.Item = inheritsControl(
            UI_ITEM,
            'ui-toolbar-item',
            null,
            function (el, options) {
                this._sValue = options.value === undefined 
                    ? getText(el) 
                    : '' + options.value;
            }
        )).prototype;

    extend(UI_TOOLBAR_CLASS, UI_ITEMS);

    UI_TOOLBAR_ITEM_CLASS.getValue = function() {
        return this._sValue;
    };

    /** 
     * 显示条目
     * @public
     */
    UI_TOOLBAR_ITEM_CLASS.show = function() {
        triggerEvent(this, 'show');
        return true;
    };

    /**
     * 隐藏条目
     * @public
     */
    UI_TOOLBAR_ITEM_CLASS.hide = function() {
        triggerEvent(this, 'hide');
    };

    /**
     * 选中该标签
     * @private
     */
    UI_TOOLBAR_ITEM_CLASS.$setSelected = function() {
        var par = this.getParent();
        var type = this.getTypes()[0];
        
        if (par._cSelected) {
            removeClass(
                par._cSelected.getOuter(),
                type + '-selected'
            );
        }

        addClass(
            this.getOuter(),
            type + '-selected'
        );
        
        if (par._cSelected != this) {
            par._cSelected = this;
            triggerEvent(par, 'change');
        }

        triggerEvent(par, 'resize');
    };

    UI_TOOLBAR_ITEM_CLASS.$click = function() {
        UI_CONTROL_CLASS.$click.call(this);
        this.$setSelected();
    };

    UI_TOOLBAR_CLASS.$alterItems = function() {};

    var UI_TOOLBAR_MORE_ITEM_CLASS = 
        (UI_TOOLBAR_MORE_CLASS.Item = inheritsControl(
            UI_ITEM,
            null,
            null,
            function (el, options) {
                this._sValue = options.value === undefined
                    ? getText(el)
                    : '' + options.value;
            }
        )).prototype;

    extend(UI_TOOLBAR_MORE_CLASS, UI_ITEMS);

    UI_TOOLBAR_MORE_ITEM_CLASS.getValue = function() {
        return this._sValue;
    };

    UI_TOOLBAR_MORE_ITEM_CLASS.$click = function() {
        var par = this.getParent();
        par._cSelected = this;
        flushToolbar(par.getParent(), 'select');
        triggerEvent(par, 'mouseout');
    };

 }) ();
/**
 * @file 工作台首页订制的分页控件,只满足简单分页需求
 * @author hades(denghongqi@gmail.com)
 */

(function() {
    var core = ecui,
        ui = core.ui,
        dom = core.dom,
        util = core.util,

        $fastcreate = core.$fastCreate,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,
        createDom = dom.create,
        children = dom.children,
        setStyle = dom.setStyle,
        addClass = dom.addClass,
        removeClass = dom.removeClass,
        extend = util.extend,
        blank = util.blank,

        MATH = Math,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_ITEM = ui.Item,
        UI_ITEM_CLASS = UI_ITEM.prototype,
        UI_ITEMS = ui.Items;

    var UI_CUSTOM_PAGER = ui.CustomPager =
        inheritsControl(
            UI_CONTROL,
            'ui-custom-pager',
            function(el, options) {
                var type = this.getTypes()[0];
                setStyle(el, 'display', 'inline-block');
                el.innerHTML = '<span class="' + type + '-pre" style="'
                    + 'display:inline-block">&lt;</span>'
                    + '<span class="' + type + '-items" style="'
                    + 'display:inline-block">'
                    + '<span ecui="value:1">1</span>'
                    + '<span ecui="value:2">2</span>'
                    + '<span ecui="value:3">3</span>'
                    + '</span>'
                    + '<span class="' + type + '-next" style="'
                    + 'display:inline-block">&gt;</span>';
            },
            function(el, options) {
                this._nPage = options.page - 0 || 1;
                this._nTotal = options.total - 0 || 100;
                this._nPagesize = options.pagesize - 0 || 10;
                this._nMaxShow = options.maxShow - 0 || 3;
                el = children(el);

                this._uPre = $fastcreate(
                    this.Pre, 
                    el[0], 
                    this, 
                    {userSelect:false}
                );
                this._uNext = $fastcreate(
                    this.Next, 
                    el[2], 
                    this, 
                    {userSelect:false}
                );
                this.$setBody(el[1]);
                this.$initItems();
                flushPager(this, this._nPage);
                //this.render();
            }
        );

    var UI_CUSTOM_PAGER_CLASS = UI_CUSTOM_PAGER.prototype;

    /**
     * @public
     */
    UI_CUSTOM_PAGER_CLASS.getValue = function() {
        if (this._cSelected) {
            return this._cSelected.$getValue();
        }
        else {
            return null;
        }
    };

    /**
     * 渲染分页控件
     * @public
     * @param {number} page 当前页
     * @param {number} total 总数
     * @param {number} pagesize 每页条数
     */
    UI_CUSTOM_PAGER_CLASS.render = function(page, total, pagesize) {
        this._nPage = page || 1;
        this._nTotal = total || 0;
        this._nPagesize = pagesize || 10;
        flushPager(this, this._nPage);
    }

    UI_CUSTOM_PAGER_CLASS.Pre = inheritsControl(UI_CONTROL);
    var UI_CUSTOM_PAGER_PRE_CLASS = UI_CUSTOM_PAGER_CLASS.Pre.prototype;

    UI_CUSTOM_PAGER_CLASS.Next = inheritsControl(UI_CONTROL);
    var UI_CUSTOM_PAGER_NEXT_CLASS = UI_CUSTOM_PAGER_CLASS.Next.prototype;

    /**
     * @event
     */
    UI_CUSTOM_PAGER_PRE_CLASS.$click = function() {
        var par = this.getParent();
        var value = par.getValue() - 1;
        flushPager(par, value);
    };

    /**
     * @event
     */
    UI_CUSTOM_PAGER_NEXT_CLASS.$click = function() {
        var par = this.getParent();
        var value = par.getValue() + 1;
        flushPager(par, value);
    };

    /**
     * 刷新分页页码items
     * @param {ecui.ui.CustomPager} control
     */
    function flushPager(control, value) {
        control._nTotalPage = MATH.ceil(control._nTotal / control._nPagesize);

        if (control._nTotalPage < control.getItems().length) {
            for (var i = 0; i < control._nMaxShow - control._nTotalPage; i++) {
                var items = control.getItems();
                control.remove(items[items.length - 1]);
            }
        }

        if (control._nTotalPage <= 1) {
            control.hide();
            return ;
        }

        var items = control.getItems();
        var start = items[0].$getValue();
        var end = items[items.length - 1].$getValue();

        if (value <= 1) {
            value = 1;
            control._uPre.disable();
        }
        else {
            control._uPre.enable();
        }

        if (value >= control._nTotalPage) {
            value = control._nTotalPage;
            control._uNext.disable();
        }
        else {
            control._uNext.enable();
        }

        if (value < start) {
            start = value;
            end = value + items.length;
        }
        else if (value > end) {
            end = value;
            start = end - items.length + 1;
        }

        for (var i = 0; i < items.length; i++) {
            var o = items[i];
            o.$setValue(i + start);
            if (value == o.$getValue()) {
                o.$setSelected();
            }
        }
    };

    UI_CUSTOM_PAGER_CLASS.Item = inheritsControl(
        UI_CONTROL,
        null,
        function(el, options) {
            options.userSelect = false;
        },
        function(el, options) {
            this._nValue = options.value;
        }
    );
    var UI_CUSTOM_PAGER_ITEM_CLASS = UI_CUSTOM_PAGER_CLASS.Item.prototype;
    extend(UI_CUSTOM_PAGER_CLASS, UI_ITEMS);

    UI_CUSTOM_PAGER_CLASS.$alterItems = blank;

    /**
     * @event
     */
    UI_CUSTOM_PAGER_ITEM_CLASS.$click = function() {
        var par = this.getParent();
        var value = this.$getValue();
        flushPager(par, value);
    };

    /**
     * 页码item被选中时触发
     * @private
     */
    UI_CUSTOM_PAGER_ITEM_CLASS.$setSelected = function() {
        var par = this.getParent();
        if (par._nValue == this.$getValue()) {
            return ;
        }
        else {
            if (par._cSelected) {
                removeClass(
                    par._cSelected.getOuter(), 
                    'ui-custom-pager-item-selected'
                );
            }
            addClass(this.getOuter(), 'ui-custom-pager-item-selected');
            par._cSelected = this;
            par._nValue = this.$getValue();
            triggerEvent(par, 'change', null, [par.getValue()]);
        }
    };

    /**
     * @private
     * @param {number} value
     */
    UI_CUSTOM_PAGER_ITEM_CLASS.$setValue = function(value) {
        this._nValue = value;
        this._sName = value;
        this.setContent(this._sName);
    };

    /**
     * @private
     */
    UI_CUSTOM_PAGER_ITEM_CLASS.$getValue = function() {
        return this._nValue;
    };
}) ();
/*
 MonthViewOnly - 定义月日历显示的基本操作。

 */
//{if 0}//
(function () {

    var core = ecui,
        array = core.array,
        dom = core.dom,
        ui = core.ui,

        DATE = Date,

        indexOf = array.indexOf,
        addClass = dom.addClass,
        getParent = dom.getParent,
        removeClass = dom.removeClass,
        setText = dom.setText,

        $fastCreate = core.$fastCreate,
        inheritsControl = core.inherits,
        triggerEvent = core.triggerEvent,

        UI_CONTROL = ui.Control;
//{/if}//
//{if $phase == "define"}//
    ///__gzip_original__UI_MONTH_VIEW
    ///__gzip_original__UI_MONTH_VIEW_CLASS
    /**
     * 初始化日历控件。
     * options 对象支持的属性如下：
     * year    控件的年份
     * month   控件的月份(1-12)
     * @public
     *
     * @param {Object} options 初始化选项
     */
    var UI_MONTH_VIEW_ONLY = ui.MonthViewOnly =
            inheritsControl(
                UI_CONTROL,
                'ui-monthviewonly',
                function (el, options) {
                    var type = this.getType(),
                        list = [];
                    el.style.overflow = 'auto';

                    for (var i = 0; i < 12; i++) {
                        list.push('<td class="' + type + '-item'
                            +   this.Cell.TYPES + '">'
                            +   UI_MONTH_VIEW_ONLY.MONTH[i] + "月"
                            +   '</td>'
                            +   ((i + 1) % 3 ? '' : '</tr><tr>'));
                    }

                    el.innerHTML =
                        '<table cellspacing="0"><tbody><tr>'
                            +       list.join('')
                            +   '</tr></tbody></table>';
                },
                function (el, options) {
                    this._aCells = [];
                    for (var i = 0, list = el.getElementsByTagName('TD'), o;
                         o = list[i]; )
                    {
                        // 日历视图单元格禁止改变大小
                        var cell = $fastCreate(
                            this.Cell, o, this,
                            {resizable: false}
                        );
                        cell._nMonth = i + 1;
                        this._aCells[i++] = cell;
                    }
                    this._nMonth = options.month || 1;
                    this._nYear = options.year || (new Date()).getFullYear();
                    this.setView(this._nYear, this._nMonth);
                }
            ),
        UI_MONTH_VIEW_ONLY_CLASS = UI_MONTH_VIEW_ONLY.prototype,

        /**
         * 初始化日历控件的单元格部件。
         * @public
         *
         * @param {Object} options 初始化选项
         */
            UI_MONTH_VIEW_ONLY_CELL_CLASS = (UI_MONTH_VIEW_ONLY_CLASS.Cell =
            inheritsControl(UI_CONTROL)).prototype;
//{else}//
    UI_MONTH_VIEW_ONLY.MONTH = ['一', '二', '三', '四', '五', '六', '七',"八","九","十","十一","十二"];

    /**
     * 选中某个日期单元格
     * @private
     *
     * @param {Object} 日期单元格对象
     */
    function UI_MONTH_VIEW_ONLY_CLASS_SETSELECTED(control, o) {
        if (control._uSelected == o) {
            return;
        }

        if (control._uSelected) {
            control._uSelected.alterClass('-selected');
        }

        if (o) {
            o.alterClass('+selected');
        }
        control._uSelected = o;
    }

    /**
     * 点击时，根据单元格类型触发相应的事件。
     * @override
     */
    UI_MONTH_VIEW_ONLY_CELL_CLASS.$click = function (event) {
        var parent = this.getParent();
        var curMonth = parent._nMonth;

        //change事件可以取消，返回false会阻止选中
        if (curMonth != this._nMonth) {
            parent._nMonth = this._nMonth;
            triggerEvent(parent, 'change', event, [this._nMonth]);
            UI_MONTH_VIEW_ONLY_CLASS_SETSELECTED(parent, this);
        }
    };

    /**
     * 获取日历控件当前显示的月份。
     * @public
     *
     * @return {number} 月份(1-12)
     */
    UI_MONTH_VIEW_ONLY_CLASS.getMonth = function () {
        return this._nMonth;
    };

    /**
     * 获取日历控件当前显示的年份。
     * @public
     *
     * @return {number} 年份(19xx-20xx)
     */
    UI_MONTH_VIEW_ONLY_CLASS.getYear = function () {
        return this._nYear;
    };

    /**
     * 日历显示移动指定的月份数。
     * 参数为正整数则表示向当前月份之后的月份移动，
     * 负数则表示向当前月份之前的月份移动，设置后日历控件会刷新以显示新的日期。
     * @public
     *
     * @param {number} offsetMonth 日历移动的月份数
     */
    UI_MONTH_VIEW_ONLY_CLASS.move = function (offsetMonth) {
        this.setView(this._nYear, this._nMonth + offsetMonth);
    };

    UI_MONTH_VIEW_ONLY_CLASS.clear = function () {
        this._uSelected = null;
        for (var i = 0, item;  item = this._aCells[i++];) {
            item.alterClass('-selected');
        }
    };

    /**
     * 设置日历控件当前显示的月份。
     * @public
     *
     * @param {number} year 年份(19xx-20xx)，如果省略使用浏览器的当前年份
     * @param {number} month 月份(1-12)，如果省略使用浏览器的当前月份
     */
    UI_MONTH_VIEW_ONLY_CLASS.setView = function (year, month) {
        this._nYear = year;
        this._nMonth = month;
        UI_MONTH_VIEW_ONLY_CLASS_SETSELECTED(this, this._aCells[month-1]);
    };
})();


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
        BEGIN_YEAR = 2002,
        END_YEAR = (new Date()).getFullYear(),
        UI_MONTH_VIEW_ONLY = ui.MonthViewOnly,
        UI_MONTH_VIEW_CELL = UI_MONTH_VIEW_ONLY.Cell;

    /**
     * 初始化日历控件。
     * options 对象支持的属性如下：
     * year    日历控件的年份
     * month   日历控件的月份(1-12)
     * @public
     *
     * @param {Object} options 初始化选项
     */
    var UI_MONTH_CALENDAR = ui.MonthCalendar =
            inheritsControl(
                UI_INPUT_CONTROL,
                'ui-month-calendar',
                function(el, options) {
                    var type = this.getTypes()[0];

                    options.hidden = true;
                    el.innerHTML = '<span class="'+ type +'-text"></span>' +
                        '<span class="'+ type +'-cancel"></span>' +
                        '<span class="'+ type +'-button"></span>';
                },
                function(el, options) {
                    var child = children(el),
                        type = this.getTypes()[0],
                        o = createDom(type + '-panel',
                            'position:absolute;display:none');

                    this._bTip = options.tip !== false;
                    this._nYear = options.year;
                    this._nMonth = options.month;

                    this._eText = child[0];

                    this._uCancel = $fastCreate(this.Cancel, child[1], this);
                    this._uButton = $fastCreate(UI_CONTROL, child[2], this);

                    DOCUMENT.body.appendChild(o);
                    this._uPanel = $fastCreate(this.Panel, o, this, options);

                    if (options.hideCancel == true) {
                        this._bHideCancel = true;
                        this._uCancel.$hide();
                    }
                }
            ),

        UI_MONTH_CALENDAR_CLASS = UI_MONTH_CALENDAR.prototype,
        UI_MONTH_CALENDAR_CANCEL_CLASS = (UI_MONTH_CALENDAR_CLASS.Cancel = inheritsControl(UI_CONTROL)).prototype,

        UI_MONTH_CALENDAR_PANEL = UI_MONTH_CALENDAR_CLASS.Panel =
            inheritsControl(
                UI_CONTROL,
                'ui-month-calendar-panel',
                function(el, options) {
                    var html = [],
                        year = (new DATE()).getFullYear(),
                        beginYear = options.beginYear || BEGIN_YEAR,
                        endYear = options.endYear || END_YEAR,
                        type = this.getTypes()[0];

                    html.push('<div class="'+ type +'-buttons"><div class="'+ type +'-btn-prv'+ UI_BUTTON.TYPES +'"></div>' +
                        '<select class="'+ type +'-slt-year'+ UI_SELECT.TYPES +'">');
                    for(var i = beginYear; i < endYear + 1; i ++) {
                        html.push('<option value="'+ i +'">'+ i +'</option>');
                    }
                    html.push('</select>');
                    html.push('<div class="'+ type +'-btn-nxt'+ UI_BUTTON.TYPES +'"></div></div>');
                    html.push('<div class="'+ type +'-month-view'+ UI_MONTH_VIEW_ONLY.TYPES +'"></div>');
                    el.innerHTML = html.join('');
                },
                function (el, options) {
                    var html = [], o, i,
                        type = this.getTypes()[0],
                        buttonClass = this.Button,
                        selectClass = this.Select,
                        beginYear = options.beginYear || BEGIN_YEAR,
                        endYear = options.endYear || END_YEAR,
                        monthViewClass = this.MonthViewOnly;

                    el = children(el);
                    o = children(el[0]);
                    this._beginYear = beginYear;
                    this._endYear = endYear;
                    this._uPrvBtn = $fastCreate(buttonClass, o[0], this);
                    this._uPrvBtn._nStep = -1;
                    this._uYearSlt = $fastCreate(selectClass, o[1], this);
                    this._uNxtBtn = $fastCreate(buttonClass, o[2], this);
                    this._uNxtBtn._nStep = 1;

                    el = el[1];
                    this._uMonthView = $fastCreate(monthViewClass, el, this);
                    this._uYearSlt.setValue((new Date()).getFullYear());
                }
            ),

        UI_MONTH_CALENDAR_PANEL_CLASS = UI_MONTH_CALENDAR_PANEL.prototype,
        UI_MONTH_CALENDAR_PANEL_BUTTON_CLASS = (UI_MONTH_CALENDAR_PANEL_CLASS.Button = inheritsControl(UI_BUTTON, null)).prototype,
        UI_MONTH_CALENDAR_PANEL_SELECT_CLASS = (UI_MONTH_CALENDAR_PANEL_CLASS.Select = inheritsControl(UI_SELECT, null)).prototype,
        UI_MONTH_CALENDAR_PANEL_MONTHVIEW_CLASS = (UI_MONTH_CALENDAR_PANEL_CLASS.MonthViewOnly = inheritsControl(UI_MONTH_VIEW_ONLY, null)).prototype,

        UI_MONTH_CALENDAR_STR_DEFAULT = '<span class="ui-calendar-default">请选择一个日期</span>';

    // 是否显示取消按钮
    function UI_CALENDAR_TEXT_FLUSH(con) {
        var el = con._eText;
        if (el.innerHTML == '') {
            con._uCancel.hide();
            if (con._bTip) {
                el.innerHTML = UI_MONTH_CALENDAR_STR_DEFAULT;
            }
        }
        else if (!con._bHideCancel) {
            con._uCancel.show();
        }
    }

    /**
     * 获得单日历控件的年份
     */
    UI_MONTH_CALENDAR_CLASS.getYear = function () {
        return this._nYear;
    };
    /**
     * 获得单日历控件的月份
     */
    UI_MONTH_CALENDAR_CLASS.getMonth = function () {
        return this._nMonth;
    };

    /**
     * @func 设置日期
     * @param date
     */
    UI_MONTH_CALENDAR_CLASS.setDate = function (year, month) {
        var ntxt = year && month ?
            year + "年" + (month > 9 ? month : "0" + month) + "月" :
            "";

        // 隐藏面板
        if (this._uPanel.isShow()) {
            this._uPanel.hide();
        }
        // 设置输入框的值
        this._eText.innerHTML = ntxt;
        // 设置日期控件的值为选中的值
        this.setValue(ntxt);
        this._nYear = year ;
        this._nMonth = month;
        // 是否显示 清除按钮
        UI_CALENDAR_TEXT_FLUSH(this);
    };

    // 激活日期控件，显示面板
    UI_MONTH_CALENDAR_CLASS.$activate = function (event) {
        var panel = this._uPanel, con,
            pos = getPosition(this.getOuter()),
            posTop = pos.top + this.getHeight();

        UI_INPUT_CONTROL_CLASS.$activate.call(this, event);
        if (!panel.isShow()) {
            panel.setDate(this._nYear, this._nMonth);
            con = getView();
            panel.show();
            panel.setPosition(
                pos.left + panel.getWidth() <= con.right ? pos.left : con.right - panel.getWidth() > 0 ? con.right - panel.getWidth() : 0,
                posTop + panel.getHeight() <= con.bottom ? posTop : pos.top - panel.getHeight() > 0 ? pos.top - panel.getHeight() : 0
            );
            setFocused(panel);
        }
    };

    UI_MONTH_CALENDAR_CLASS.$cache = function (style, cacheSize) {
        UI_INPUT_CONTROL_CLASS.$cache.call(this, style, cacheSize);
        this._uButton.cache(false, true);
        this._uPanel.cache(true, true);
    };

    // month-calendar 的初始化函数，每次初始化这个控件时都会调用
    UI_MONTH_CALENDAR_CLASS.init = function () {
        UI_INPUT_CONTROL_CLASS.init.call(this);
        this.setDate(this._nYear, this._nMonth);
        this._uPanel.init();
    };

    // calendar清空函数，回到原始状态
    UI_MONTH_CALENDAR_CLASS.clear = function () {
        this.setDate();
    };

    // 删除按钮的点击事件
    UI_MONTH_CALENDAR_CANCEL_CLASS.$click = function () {
        var par = this.getParent();

        UI_CONTROL_CLASS.$click.call(this);
        par.clear();
    };

    UI_MONTH_CALENDAR_CANCEL_CLASS.$activate = UI_BUTTON_CLASS.$activate;

    /**
     * Panel
     */
    UI_MONTH_CALENDAR_PANEL_CLASS.$blur = function () {
        this.hide();
    };

    /**
     * 设置日历面板的日期
     */
    UI_MONTH_CALENDAR_PANEL_CLASS.setDate = function (year, month) {
        var today = new Date();
        year = year || today.getFullYear();

        this._uYearSlt.setValue(year);
        this._uMonthView.setView(year, month);
        this.setView(year, month);
    };

    /**
     * 设置日历面板的展现年月
     */
    UI_MONTH_CALENDAR_PANEL_CLASS.setView = function (year, month) {
        var yearSlt = this._uYearSlt,
            monthView = this._uMonthView;

        year = year || (new Date()).getFullYear();
        yearSlt.setValue(year);
        year && monthView.setView(year, month);
    };

    /**
     * 获取当前日历面板视图的年
     */
    UI_MONTH_CALENDAR_PANEL_CLASS.getViewYear = function () {
        return this._uMonthView.getYear();
    };

    /**
     * 获取当前日历面板视图的月
     */
    UI_MONTH_CALENDAR_PANEL_CLASS.getViewMonth = function () {
        return this._uMonthView.getMonth();
    };

    UI_MONTH_CALENDAR_PANEL_CLASS.$cache = function (style, cacheSize) {
        this._uPrvBtn.cache(true, true);
        this._uNxtBtn.cache(true, true);
        this._uYearSlt.cache(true, true);
        this._uMonthView.cache(true, true);
        UI_CONTROL_CLASS.$cache.call(this, style, cacheSize);
    };

    UI_MONTH_CALENDAR_PANEL_CLASS.init = function () {
        UI_CONTROL_CLASS.init.call(this);
        this._uYearSlt.init();
        this._uMonthView.init();
    };

    //面板的change事件
    UI_MONTH_CALENDAR_PANEL_CLASS.$change = function (event, month) {
        var par = this.getParent();
        var year = this._uYearSlt.getValue();
        if (triggerEvent(par, 'change', event, [year,month])) {
            par.setDate(year, month);
        }
        this.hide();
    };

    // 年选择框的change事件
    UI_MONTH_CALENDAR_PANEL_SELECT_CLASS.$change = function () {
        var panel = this.getParent(),
            view = panel.getParent(),
            yearSlt = panel._uYearSlt;
        var month = view._nYear == yearSlt.getValue() ? view._nMonth : null;
        panel.setView(yearSlt.getValue(), month);
    };
    /*UI_MONTH_CALENDAR_PANEL_BUTTON_CLASS.$click = function () {
     var step = this._nStep,
     panel = this.getParent(),
     date;

     date = new DATE(panel.getViewYear(), panel.getViewMonth() - 1 + step, 1);
     panel.setView(date.getFullYear(), date.getMonth() + 1);
     };*/

    // 点击 向前， 向后两个按钮的事件
    UI_MONTH_CALENDAR_PANEL_BUTTON_CLASS.$click = function () {
        var step = this._nStep,
            panel = this.getParent(),
            view = panel.getParent(),
            date;
        var curYear = panel._uYearSlt.getValue();
        var nextYear = curYear-0 + step;
        if (nextYear < panel._beginYear) {
            nextYear = panel._endYear;
        }
        if (nextYear > panel._endYear) {
            nextYear = panel._beginYear;
        }
        panel._uMonthView.clear();
        if (nextYear == view._nYear) {
            panel._uMonthView.setView(nextYear, panel.getViewMonth());
        }
        panel._uYearSlt.setValue(nextYear);
    };

    // 重写moth-view-only的change方法
    UI_MONTH_CALENDAR_PANEL_MONTHVIEW_CLASS.$change = function (event, month) {
        triggerEvent(this.getParent(), 'change', event, [month]);
    };
})();

