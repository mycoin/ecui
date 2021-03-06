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
(function() {
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
        UI_LOCKED_TABLE_CLASS = UI_LOCKED_TABLE.prototype,
        UI_EXT_PAGER = ui.ExtPager;
    UI_EXT_PAGER_CLASS = ui.ExtPager.prototype;
    var UI_CUSTOM_TABLE = ui.CustomTable = inheritsControl(
    UI_LOCKED_TABLE,
        'ui-table',

    function(el, options) {
        this._oOptions = options;
        this._aHeader = options.header;
        this._sSortby = options.sortby;
        this._sOrderby = options.orderby;
        this.noPager = !! options.noPager; //有没有翻页
        this.noInitRequest = options.noInitRequest; //add noInitRequest.
        if (!options.datasource) {
            this._nLeftLock = options.leftLock || 0;
            this._nRightLock = options.rightLock || 0;
        }
        var type = this.getTypes()[0];
        var html = [];
        html.push('<table><thead>');
        options.leftLock = options.leftLock || 0;
        options.vScroll = !! options.vScroll;
        options.rightLock = options.rightLock || 0;
        var lockedTotal = options.leftLock + options.rightLock;
        if (!options.datasource) {
            setStyle(el, 'width', '100%');
        } else {
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
        } else {
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
                    } else {
                        this._aColumns.push(extend({}, o));
                    }
                }
            } else {
                html.push(createHeadRow(options.fields, this));
                this._aColumns = copyArray(options.fields);
            }
        }
        html.push('</thead><tbody>');
        if (!options.datasource) {
            html.push('<tr>');
            var i;
            html.push('<td></td>');
            html.push('</tr>');
            options.leftLock = 0;
            options.rightLock = 0;
        } else {
            this._aData = options.datasource;
            if (!this._aData.length) {
                html.push('<tr>');
                html.push('<td class="' + type + '-empty-cell' + '" align="middle" colspan="' + this._aColumns.length + '">');
                html.push(options.errorMsg ? options.errorMsg : '暂无数据，请稍后再试');
                html.push('</td>');
                html.push('</tr>');
            } else {
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
                            ' style=" width:' + o.width + 'px;' + 'min-width:' + o.width + 'px;' + 'max-width:' + o.width + 'px;"');
                        if (options.autoEllipsis) {
                            html.push(' class="' + type + '-cell-ellipsis"');
                        }
                        o.align && html.push(' align="' + o.align + '"');
                        //for QA
                        html.push(' id="' + (options.id || "customTable") + "TableCell-" + (o.field || o.sortable || o.name) + "-" + i + '"');
                        html.push('>');
                        var content = o.content || o.field;
                        if (typeof content == 'function') {
                            var e = content.call(null, item, i);
                            if (Object.prototype.toString.call(e) == '[object String]') {
                                if (o.maxlength && e && e.length > o.maxlength) {
                                    html.push('<span class="');
                                    html.push(type + '-cell-limited"');
                                    html.push(' title="' + e + '">');
                                    html.push(encodeHTML(e.substring(0, o.maxlength)));
                                    html.push('...');
                                    html.push('</span>');
                                } else {
                                    html.push('<div style="' + 'width:' + o.width + 'px;' + 'max-width:' + o.width + 'px;' + 'min-width:' + o.width + 'px;' + '" title="' + (o.title || e) + '">' + e + '</div>');
                                }
                            } else {
                                html.push(e);
                            }
                        } else {
                            if (o.checkbox) {

                                if(item["isDisabled"]) {
                                    html.push('-');
                                } else {
                                    html.push(' <div class="' + type + '-cell-center"><input type="checkbox"');
                                    html.push(' class="' + type + '-checkbox"');
                                    html.push(' name="' + o.checkbox + '"');
                                    //for QA
                                    html.push(' id="' + (options.id || "customTable") + "Checkbox-" + i + '"');
                                    html.push(' value="' + item[o.checkbox] + '"');
                                    html.push(' data-rownum="' + i + '"');
                                    html.push(' /></div>');
                                }
                                    
                            } else if (o.radio) {
                                if(item["isDisabled"]) {
                                    html.push('-');
                                } else {
                                    html.push(' <div class="' + type + '-cell-center"><input type="radio"');
                                    html.push(' class="' + type + '-radio"');
                                    html.push(' name="' + o.radio + '"');
                                    //for QA
                                    html.push(' id="' + (options.id || "customTable") + "radio-" + i + '"');
                                    html.push(' value="' + item[o.radio] + '"');
                                    html.push(' data-rownum="' + i + '"');
                                    html.push(' /></div>');
                                }
                            }else {
                                html.push(string.format(o.content, item) || '<div class="ui-table-empty-cell">-</div>');
                            }
                            if (o.detail) {
                                html.push('<span style="margin-left:3px;"' + ' ecui="type:tip;asyn:true;id:');
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
    }),
        UI_CUSTOM_TABLE_CLASS = UI_CUSTOM_TABLE.prototype,
        DELEGATE_EVENTS = ['click', 'mouseup', 'mousedown'],
        // 默认处理函数
        DEFAULT_EVENTS = {
            'click th.ui-table-hcell-sort': function(event, control) {
                var field = this.getAttribute('data-field'),
                    orderby;
                if (this.className.indexOf('-sort-desc') >= 0) {
                    orderby = 'asc';
                } else if (this.className.indexOf('-sort-asc') >= 0) {
                    orderby = 'desc';
                } else {
                    orderby = this.getAttribute('data-orderby') || 'desc';
                    this.className = this.className.replace(/hcell-sort/g, "hcell-sort-desc");
                }
                triggerEvent(control, 'sort', null, [field, orderby, this]);
            },
            'click input.ui-table-checkbox-all': function(event, control) {
                control.$refreshCheckbox(this.checked);
            },
            'click input.ui-table-checkbox': function(event, control) {
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
        var options = con._oOptions;
        var html = [];
        html.push('<tr>');
        var field = "";
        var flag = 0;
        var i = 0;
        for (i = 0; i < headrow.length; i++) {
            var o = headrow[i];
            if (Object.prototype.toString.call(o.field) == '[object String]') {
                field = o.field;
            } else {
                field = o.sortable;
            }
            html.push('<th ');
            field && html.push('data-field="' + field + '"');
            //for QA
            html.push('id="' + options.id + "TableHead-" + field + "-" + i + '"');
            if (o.width) {
                html.push(' style="width:' + o.width + 'px;' + 'min-width:' + o.width + 'px;' + 'max-width:' + o.width + 'px;');
            }
            if (o.rowspan) {
                html.push('" rowspan="' + o.rowspan);
            }
            if (o.colspan) {
                html.push('" colspan="' + o.colspan);
                var j;
                var width = 0;
                for (j = flag; j < flag + o.colspan; j++) {
                    width += opt_head[1][j].width;
                }
                html.push('" width="' + width);
                flag += o.colspan;
            }
            if (o.sortable) {
                html.push('" class="' + type + '-hcell-sort');
                if (o.sortable && o.sortable == con._sSortby) {
                    html.push(' ' + type + '-hcell-sort-' + con._sOrderby);
                }
                html.push('" data-orderby="' + con._sOrderby.toLowerCase());
            }
            html.push('">');
            if (o.checkbox) {
                html.push('<div class="' + type + '-hcell-checkbox"><input type="checkbox" id="' + (options.id || "customTable") + "CheckboxAll" + '" class="' + type + '-checkbox-all"' + ' value="checkall" /></div>');
            }
            if (o.name) {
                html.push(o.name);
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
                        ecui.get(controlId).onloadData = (function(item, o) {
                            return function(handler) {
                                o.loadData(item, handler);
                            }
                        })(item, o);
                    }
                }
            }
        }
    }
    UI_CUSTOM_TABLE_CLASS.getData = function() {
        return this._aData;
    };
    UI_CUSTOM_TABLE_CLASS.getSortby = function() {
        return this._sOrderby ? this._sSortby : "";
    };
    UI_CUSTOM_TABLE_CLASS.getOrderby = function() {
        return this._sOrderby;
    };
    /**
     * 重新生成表格
     * @public
     *
     * @param {Array} fields 表格的列配置
     * @param {Array} datasource 表格数据
     * @param {Object} sortInfoMap 排序信息
     * @param {Object} options 初始化选项
     * @param {string} errorMsg 表格为空或出错时展示的内容
     */
    UI_CUSTOM_TABLE_CLASS.render = function(fields, datasource, sortInfoMap, options, errorMsg) {
        var options = extend({}, options);
        options = extend(options, this._oOptions);
        options.leftLock = this._nLeftLock;
        options.rightLock = this._nRightLock;
        options.fields = fields;
        options.datasource = datasource || [];
        var sortInfoMap = sortInfoMap || {};
        options.sortby = sortInfoMap.sortby;
        options.orderby = sortInfoMap.orderby;
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
            this._aLockedHeadRow);
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
        this._aLockedHeadRow);
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
            } else {
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
    UI_CUSTOM_TABLE_CLASS.$bindCheckbox = function() {
        var inputs = this.getBody().getElementsByTagName('input'),
            i, item, type = this.getTypes()[0];
        this._aCheckboxs = [];
        this._eCheckboxAll = null;
        for (i = 0; item = inputs[i]; i++) {
            if (item.type == 'checkbox' && item.className.indexOf(type + '-checkbox-all') >= 0) {
                this._eCheckboxAll = item;
            } else if (item.type == 'checkbox' && item.className.indexOf(type + '-checkbox') >= 0) {
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
    UI_CUSTOM_TABLE_CLASS.$refreshCheckbox = function(checked) {
        var i, item, newChecked = true,
            tr;
        for (i = 0; item = this._aCheckboxs[i]; i++) {
            tr = item.parentNode.parentNode;
            if (checked !== undefined) {
                item.checked = checked;
            } else {
                newChecked = item.checked && newChecked;
            }
            if (item.checked && this._bCheckedHighlight) {
                tr.className += ' highlight';
            } else if (this._bCheckedHighlight) {
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
        100);
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
    UI_CUSTOM_TABLE_CLASS.getSelection = function() {
        if (!this._aCheckboxs || !this._aCheckboxs.length) {
            return [];
        }
        var res = [];
        for (var i = 0, o; o = this._aCheckboxs[i++];) {
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
    UI_CUSTOM_TABLE_CLASS.init = function() {
        var i, item, ele = this.getOuter(),
            control = this;
        UI_LOCKED_TABLE_CLASS.init.call(this);
        // 添加控件全局的事件监听
        // 只支持click mousedown mouseup
        for (i = 0; item = DELEGATE_EVENTS[i]; i++) {
            attachEvent(ele, item, (function(name) {
                return function(event) {
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
    UI_CUSTOM_TABLE_CLASS.$fireEventHandler = function(eventType, nativeEvent) {
        var events = getHandlerByType(this.events, eventType),
            i, item, target = nativeEvent.targetElement,
            selector;
        for (i = 0; item = events[i]; i++) {
            if (checkElementBySelector(target, item.selector)) {
                item.handler.call(target, nativeEvent, this);
            }
        }
    }
    UI_CUSTOM_TABLE_CLASS.$refresh = function(el, options) {
        var cells = [],
            rows = [];
        addClass(el, this.getTypes()[0]);
        cells = this._aHCells;
        rows = this._aRows.concat(this._aHeadRows, this._aLockedRow, this._aLockedHeadRow);
        for (var i = 0, o; o = cells[i++];) {
            disposeControl(o);
        }
        for (var i = 0, o; o = rows[i++];) {
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
        } else {
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
        con.getHeight() - el.offsetHeight) + 'px';
        setStyle(el, 'zIndex', 1);
    }

    function getHandlerByType(events, type) {
        var handlers = [],
            item;
        events = extend({}, events);
        events = extend(events, DEFAULT_EVENTS);
        for (var key in events) {
            item = {
                handler: events[key]
            };
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
        selector.replace(/^([^.#]*)([.#]?)(.*)$/, function($0, $1, $2, $3) {
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
        for (var i = 0, o; o = data[i++];) {
            res.push(extend({}, o));
        }
        return res;
    }
})();