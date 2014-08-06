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