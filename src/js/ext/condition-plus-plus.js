/**
 * @author quyatong
 */
(function() {
	var core = ecui, ui = core.ui, dom = core.dom, string = core.string, util = core.util, $fastCreate = core.$fastCreate, inheritsControl = core.inherits, findControl = core.findControl, first = dom.first, last = dom.last, children = dom.children, createDom = dom.create, removeDom = dom.remove, addClass = dom.addClass, setText = dom.setText, blank = util.blank, UI_CONTROL = ui.Control, UI_CONTROL_CLASS = UI_CONTROL.prototype, UI_BUTTON = ui.Button, UI_BUTTON_CLASS = UI_BUTTON.prototype, UI_INPUT_CONTROL = ui.InputControl, UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype, UI_INPUT = ui.Input, UI_INPUT_CLASS = UI_INPUT.prototype, UI_SELECT = ui.Select, UI_SELECT_CLASS = UI_SELECT.prototype, UI_MULTI_SELECT = ui.MultiSelect, UI_MULTI_SELECT_CLASS = UI_MULTI_SELECT.prototype, UI_CALENDAR = ui.Calendar, UI_CALENDAR_CLASS = UI_CALENDAR.prototype, UI_MULTI_CALENDAR = ui.MultiCalendar, UI_MULTI_CALENDAR_CLASS = UI_MULTI_CALENDAR.prototype, UI_DATA_TREE = ui.DataTree, UI_DATA_TREE_CLASS = UI_DATA_TREE.prototype, UI_INPUT_TREE = ui.InputTree, UI_INPUT_TREE_CLASS = UI_INPUT_TREE.prototype;
	
	var UI_CONDITION_PLUS_PLUS = ui.ConditionPlusPlus = inheritsControl(UI_CONTROL, "ui-condition-plus-plus", function(el, options) {
		this.theNode = el;
		var child = children(el);
		var type = this.getTypes()[0];
		var id = options.id;
		var tagName = options.name;
		var foreText = options.title;
		var isDefault = options.isDefault;
		var widgetType = options.widgetType;
		var conType = options.conType;
		var operatorLeftValue = options.leftValue;

		var attached = options.attached ? options.attached.split(',') : [];

		var text = createDom(type + "-text", "", "span");
		var content = createDom('ui-select', '', 'select');
		var contentHTML = '';

		this._sName = tagName;

		this._uId = id.replace('condition', '');
		this._sIsDefault = isDefault;
		this._sName = tagName;
		this._sConType = conType;
		if (core.string.getByteLength(foreText) > 14) {
			core.dom.getParent(el).style.width = "100%";
			text.innerHTML = foreText + "：&nbsp;";
			core.dom.setStyles(text, {
				'float' : 'left',
				'height' : '30px',
				'display' : 'block',
				'line-height' : '22px'
			});
		} else {
			text.innerHTML = foreText + "：&nbsp;";
			core.dom.setStyles(text, {
				'float' : 'left',
				'height' : '30px',
				'display' : 'block',
				'line-height' : '22px',
				'width' : '103px'
			});
		}

		switch(widgetType+'') {
			case '0':
				// 下拉
				content = createDom('ui-select', 'width:229px;float:left;display:block', 'select');
				contentHTML = '';
				break;
			case '1':
				//下拉列表多选
				content = createDom('ui-select ui-multi-select', 'width:229px;float:left;display:block', 'select');
				contentHTML = '';
				break;
			case '2':
				//文本框
				content = createDom('ui-input', 'width:229px;float:left;display:block', 'input');
				contentHTML = "";
				break;
			case '3':
				//日期
				content = createDom('ui-multi-calendar', 'width:229px;float:left;display:block', 'div');
				contentHTML = "";
				break;
			case '4':
				//树形
				content = createDom('ui-input-tree', 'width:229px;float:left;display:block', 'div');
				contentHTML = '<option value="1">root</option><div>asdf</div>';
				break;
			case '6':
				//算术
				content = createDom('', 'width:229px;float:left;display:block', 'div');
				contentHTML = "";
				break;
			case '5':
				//特殊
				switch(tagName) {
					case 'trade':
					case 'fc_off_time':
					case 'busi_season':
						content = createDom('', 'width:229px;float:left;display:block', 'div');
						contentHTML = '';
						break;
				}
		}
		//标签内容
		if (contentHTML) {
			//content.innerHTML = contentHTML;
		}
		el.appendChild(text);
		el.appendChild(content);
	}, function(el, options) {
		var child = children(el);
		var type = this.getTypes()[0];
		var id = options.id;
		var tagName = options.tagName;
		var foreText = options.foreText;
		var isDefault = options.isDefault;
		var widgetType = options.widgetType;
		var conType = options.conType;
		var operatorLeftValue = options.operatorLeftValue;

		if (isDefault != "1" && el) {
			el.style.display = 'none';
		}
		var _uTypes = ['select', 'dropdownlist', 'input', 'calendar', 'inputTree', 'spec']
		this._uType = _uTypes[widgetType];
		switch(widgetType+'') {
			case '0':
				// 下拉
				this._uSelect = $fastCreate(UI_SELECT, child[1], this, {});
				this._uSelect.$setSize(229, 20);
				//this._uSelect.add('请选择',null,{'value':0});
				break;
			case '1':
				//下拉列表多选
				this._uDropdownList = $fastCreate(UI_MULTI_SELECT, child[1], this, {});
				this._uDropdownList.$setSize(229, 20);
				this._uDropdownList.setValue([]);
				break;
			case '2':
				//文本框
				this._uInput = $fastCreate(UI_INPUT, child[1], this, {
					tip : '请输入',
					'width' : '170px'
				});
				this._uInput.$setSize(200, 20);
				this._uInput.setValue('');
				break;
			case '3':
				this._uMultiCalendar = $fastCreate(UI_MULTI_CALENDAR, child[1], this, {});
				this._uMultiCalendar.$setSize(229, 20);
				this._uMultiCalendar.clear();
				break;
			case '4':
				this._uInputTree = $fastCreate(UI_INPUT_TREE, child[1], this, {
					'value' : '1',
					'text' : 'root',
					'asyn' : true,
					'children' : {
						'value' : 2,
						'text' : '22222'
					}
				});
				this._uInputTree.$setSize(200, 20);
				break;
			case '6':
				this._uType = "math";
				var mathSelect = createDom('ui-select', '', 'select');
				var leftInput = createDom('ui-input', '', 'div');
				var rightInput = createDom('ui-input', 'margin-left:2px', 'div');
				var centerFlag = createDom('', '', 'span');
				centerFlag.innerHTML = "&nbsp;-&nbsp;"
				core.dom.setStyles(mathSelect, {
					"width" : '70px'
				})
				core.dom.setStyles(leftInput, {
					"width" : '66px',
					'margin-left' : '5px',
					'margin-right' : '2px'
				})
				core.dom.setStyles(rightInput, {
					"width" : '66px',
					'margin-left' : '0px'
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
				//UI_MATH_CLASS.$cache.call(this._uMath, false, true);
				this._uMath.$setSize(70, 20);

				this._uMathLeft = $fastCreate(UI_INPUT_LEFT, grandChild[1], this, {});
				//UI_INPUT_LEFT_CLASS.$cache.call(this._uMathLeft, false, true);
				this._uMathLeft.$setSize(50, 20);

				this._uCenterFlag = centerFlag;

				this._uMathRight = $fastCreate(UI_INPUT_RIGHT, grandChild[3], this, {});
				//UI_INPUT_RIGHT_CLASS.$cache.call(this._uMathRight, false, true);
				this._uMathRight.$setSize(50, 20);

				var arr = [{
					'value' : 0,
					'text' : '等于'
				}, {
					'value' : 1,
					'text' : '不等于'
				}, {
					'value' : 2,
					'text' : '大于'
				}, {
					'value' : 3,
					'text' : '大于等于'
				}, {
					'value' : 4,
					'text' : '小于'
				}, {
					'value' : 5,
					'text' : '小于等于'
				}, {
					'value' : 6,
					'text' : '介于'
				}];

				baidu.each(arr, function(option) {
					me._uMath.add(option.text, null, option);
				});
				baidu.dom.hide(me._uMathLeft.getOuter());
				baidu.dom.hide(me._uMathRight.getOuter());

				UI_MATH_CLASS.$change = function() {
					baidu.dom.hide(me._uMathLeft.getOuter());
					baidu.dom.hide(me._uCenterFlag);
					baidu.dom.hide(me._uMathRight.getOuter());
					switch(this.getValue()+'') {
						case '0':
						case '1':
						case '2':
						case '3':
						case '4':
						case '5':
							baidu.dom.show(me._uMathLeft.getOuter());
							break;
						case '6':
							baidu.dom.show(me._uMathLeft.getOuter());
							baidu.dom.show(me._uCenterFlag);
							baidu.dom.show(me._uMathRight.getOuter());
							break;
					}
				};
				me._uMath.setSelectedIndex(0);
				me._uMath.$change();
				break;
			case '5':
				//特殊
				switch(tagName) {
					case 'trade':
						this._uType = 'trade';
						var tradeFirstSelect = createDom('ui-select', '', 'select');
						var tradeSecSelect = createDom('ui-select', '', 'select');

						core.dom.setStyles(tradeFirstSelect, {
							"width" : '80px',
							'margin-left' : '0px'
						})
						core.dom.setStyles(tradeSecSelect, {
							"width" : '80px',
							'margin-left' : '7px'
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
						//UI_FIRST_TRADE_CLASS.$cache.call(this._uFirstTrade, false, true);
						this._uFirstTrade.$setSize(110, 20);

						this._uSecTrade = $fastCreate(UI_SEC_TRADE, grandChild[1], this, {});
						//UI_SEC_TRADE_CLASS.$cache.call(this._uSecTrade, false, true);
						this._uSecTrade.$setSize(110, 20);

						this._uFirstTrade.$change = function(secondTradeId) {
							var firstTradeId = me._uFirstTrade.getValue();
							if (firstTradeId == 0) {
								me._uSecTrade.clear();
								me._uSecTrade.add('请选择二级行业', null, {
									'value' : 0,
									'text' : '请输入二级行业'
								})
								me._uSecTrade.setSelectedIndex(0);
							} else {
								var par = this.getParent();
								me._uSecTrade.clear();
								ecui.triggerEvent(par, "loaddata", {
									"name" : 'trade',
									'firstTradeId' : firstTradeId,
									'secondTradeId' : secondTradeId
								}, null);
							}
						}
						break;
					case 'fc_off_time':
						this._uType = 'fc_off_time';
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
							"width" : '80px',
							'margin-left' : '0px'
						});
						core.dom.setStyles(hitFirstTimeSelect, {
							"width" : '80px',
							'margin-left' : '7px'
						});
						core.dom.setStyles(hitSecondTimeSelect, {
							"width" : '80px',
							'margin-left' : '0px'
						});

						this._uHitSelect = $fastCreate(UI_HIT_SELECT, grandChild[0], this, {});
						//UI_HIT_SELECT_CLASS.$cache.call(this._uHitSelect, false, true);
						this._uHitSelect.$setSize(70, 20);

						this._uHitFirstTimeSelect = $fastCreate(UI_HIT_FIRST_TIME, grandChild[1], this, {});
						//UI_HIT_FIRST_TIME_CLASS.$cache.call(this._uHitFirstTimeSelect, false, true);
						this._uHitFirstTimeSelect.$setSize(65, 20);

						this._uHitCenterFlag = hitCenterFlag;

						this._uHitSecondTimeSelect = $fastCreate(UI_HIT_SECOND_TIME, grandChild[3], this, {});
						//UI_HIT_SECOND_TIME_CLASS.$cache.call(this._uHitSecondTimeSelect, false, true);
						this._uHitSecondTimeSelect.$setSize(65, 20);

						var hitArr = [{
							'value' : 2,
							'text' : '全部'
						}, {
							'value' : 0,
							'text' : '未撞线'
						}, {
							'value' : 1,
							'text' : '撞线'
						}];

						baidu.each(hitArr, function(option) {
							me._uHitSelect.add(option.text, null, option);
						});
						me._uHitSelect.setSelectedIndex(0);

						var gennerTime = function(index) {
							var firstOptionText = ['请选择起始时间', '请选择结束时间']
							var times = [{
								'value' : 0,
								'text' : firstOptionText[index]
							}];

							for (var i = 0; i <= 23; i++) {
								var hours = (i + '').length == 1 ? ('0' + (i + '')) : (i + '');
								times.push({
									'value' : i * 2 + 1,
									'text' : hours + ':00'
								});
								times.push({
									'value' : i * 2 + 2,
									'text' : hours + ':30'
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
							if (me._uHitSelect.getValue() == '0' || me._uHitSelect.getValue() == '1') {
								me._uHitFirstTimeSelect.hide();
								baidu.dom.hide(me._uHitCenterFlag);
								me._uHitSecondTimeSelect.hide();
							} else {
								me._uHitFirstTimeSelect.show();
								baidu.dom.show(me._uHitCenterFlag);
								me._uHitSecondTimeSelect.show();

								me._uHitFirstTimeSelect.setSelectedIndex(0);
								me._uHitSecondTimeSelect.setSelectedIndex(0);
							}
						};
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

						var haveOrNotSelect = createDom('ui-select', '', 'select');
						var seasonMultiSelect = createDom('ui-select', 'margin-left:7px', 'select');

						child[1].appendChild(haveOrNotSelect);
						child[1].appendChild(seasonMultiSelect);
						grandChild = children(child[1]);

						this._uHaveOrNotSelect = $fastCreate(UI_HAVEORNOT_SELECT, grandChild[0], this, {});
						//UI_HAVEORNOT_SELECT_CLASS.$cache.call(this._uHaveOrNotSelect, false, true);
						this._uHaveOrNotSelect.$setSize(70, 20);

						this._uSeasonMultiSelect = $fastCreate(UI_SEASON_MULTI_SELECT, grandChild[1], this, {});
						//UI_SEASON_MULTI_SELECT_CLASS.$cache.call(this._uSeasonMultiSelect, false, true);
						this._uSeasonMultiSelect.$setSize(150, 20);

						var haveOrNot = [{
							'value' : 0,
							'text' : '无'
						}, {
							'value' : 1,
							'text' : '有'
						}];

						var monthArray = [{
							'value' : 1,
							'text' : '一月'
						}, {
							'value' : 2,
							'text' : '二月'
						}, {
							'value' : 3,
							'text' : '三月'
						}, {
							'value' : 4,
							'text' : '四月'
						}, {
							'value' : 5,
							'text' : '五月'
						}, {
							'value' : 6,
							'text' : '六月'
						}, {
							'value' : 7,
							'text' : '七月'
						}, {
							'value' : 8,
							'text' : '八月'
						}, {
							'value' : 9,
							'text' : '九月'
						}, {
							'value' : 10,
							'text' : '十月'
						}, {
							'value' : 11,
							'text' : '十一月'
						}, {
							'value' : 12,
							'text' : '十二月'
						}];

						baidu.each(haveOrNot, function(item) {
							me._uHaveOrNotSelect.add(item.text, null, {
								value : item.value
							});
						});

						baidu.each(monthArray, function(item) {
							me._uSeasonMultiSelect.add(item.text, null, {
								value : item.value
							});
						});

						me._uHaveOrNotSelect.$change = function() {
							var have = me._uHaveOrNotSelect.getValue();
							if (have == '1') {
								me._uSeasonMultiSelect.show();
							} else {
								me._uSeasonMultiSelect.hide();
							}
						};
						me._uHaveOrNotSelect.setSelectedIndex(0);
						me._uHaveOrNotSelect.$change();
						break;
				}
				break;
		}

		if (this._sIsHide) {
			baidu.dom.hide(this.theNode);
		}
	}), UI_CONDITION_PLUS_PLUS_CLASS = UI_CONDITION_PLUS_PLUS.prototype;

	UI_CONDITION_PLUS_PLUS_CLASS.clear = function() {
		var me = this;
		switch(this._uType) {
			case "select":
				me._uSelect.setSelectedIndex(0);
				break;
			case "dropdownlist":
				me._uDropdownList.setValue([]);
				break;
			case 'input':
				me._uInput.setValue('');
				break;
			case 'inputTree':
				//me._uInput.setValue('');
				break;
			case 'calendar':
				me._uMultiCalendar.clear();
				break;
			case 'trade':
				me._uFirstTrade.setSelectedIndex(0);
				me._uSecTrade.clear();
				baidu.each([{
					'value' : 0,
					"text" : '请选择二级行业'
				}], function(item) {
					me._uSecTrade.add(item.text, null, {
						value : item.value
					});
				});
				me._uSecTrade.setSelectedIndex(0);
				break;
			case 'math':
				this._uMathLeft.setValue('');
				this._uMathRight.setValue('');
				this._uMath.setValue(0);
				this._uMath.$change();
				break;
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
	}, UI_CONDITION_PLUS_PLUS_CLASS.reset = function() {
		var me = this;
		switch(this._uType) {
			case "select":
				if (me._sDefaultValue) {
					me._uSelect.setValue(me._sDefaultValue);
				} else {
					me._uSelect.setSelectedIndex(0);
				}
				break;
			case "dropdownlist":
				if (me._sDefaultValue) {
					me._uDropdownList.setValue(me._sDefaultValue);
				} else {
					me._uDropdownList.setValue([]);
				}
				break;
			case 'input':
				me._uInput.setValue('');
				break;
			case 'inputTree':
				//me._uInput.setValue('');
				break;
			case 'calendar':
				me._uMultiCalendar.clear();
				break;
			case 'trade':
				me._uFirstTrade.setSelectedIndex(0);
				me._uSecTrade.clear();
				baidu.each([{
					'value' : 0,
					"text" : '请选择二级行业'
				}], function(item) {
					me._uSecTrade.add(item.text, null, {
						value : item.value
					});
				});
				me._uSecTrade.setSelectedIndex(0);
				break;
			case 'math':
				this._uMathLeft.setValue('');
				this._uMathRight.setValue('');
				this._uMath.setValue(0);
				this._uMath.$change();
				break;
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
	}, UI_CONDITION_PLUS_PLUS_CLASS.initValue = function(data) {
		var me = this;
		switch(this._uType) {
			case "select":
				baidu.each(data, function(item) {
					me._uSelect.add(item.text, null, {
						value : item.value
					});
				});
				me._uSelect.setSelectedIndex(0);
				break;
			case "dropdownlist":
				baidu.each(data, function(item) {
					var texts = item.text.split('~');
					if (texts.length == 2) {
						var text = texts[0];
						var tip = texts[1];
						me._uDropdownList.add(decodeURIComponent(text), null, {
							'value' : item.value,
							'tip' : tip
						});
					} else {
						me._uDropdownList.add(decodeURIComponent(item.text), null, {
							'value' : item.value
						});
					}
				});
				break;
			case "inputTree":
				break;
			case "math":
				break;
			case "trade":
				data = [{
					'value' : 0,
					"text" : '请选择一级行业'
				}].concat(data);
				baidu.each(data, function(item) {
					me._uFirstTrade.add(item.text, null, {
						value : item.value
					});
				});
				baidu.each([{
					'value' : 0,
					"text" : '请选择二级行业'
				}], function(item) {
					me._uSecTrade.add(item.text, null, {
						value : item.value
					});
				});
				me._uFirstTrade.setSelectedIndex(0);
				me._uSecTrade.setSelectedIndex(0);
				break;
		}
	}, UI_CONDITION_PLUS_PLUS_CLASS.setValue = function(operator, firstValue, secondValue) {

		var me = this;
		switch(this._uType) {
			case "select":
				me._uSelect.setValue(firstValue);
				break;
			case "dropdownlist":
				var values = firstValue.split(',');
				me._uDropdownList.setValue(values);
				break;
			case 'input':
				me._uInput.setValue(firstValue);
				break;
			case "inputTree":
				break;
			case "calendar":
				var firstValue = firstValue;
				var secondValue = secondValue;
				var date = {
					begin : null,
					end : null
				};
				if (firstValue) {
					date.begin = baidu.date.parse(firstValue)
				}
				if (secondValue) {
					date.end = baidu.date.parse(secondValue);
				}
				me._uMultiCalendar.setDate(date);
				break;

			case "fc_off_time":
				me._uHitSelect.setValue(operator + '');
				me._uHitFirstTimeSelect.setValue(firstValue + '');
				me._uHitSecondTimeSelect.setValue(secondValue + '');
				me._uHitSelect.$change();
				break;
			case 'math':
				this._uMathLeft.setValue(firstValue);
				this._uMathRight.setValue(secondValue);
				this._uMath.setValue(operator);
				this._uMath.$change();
				break;
			case 'trade':
				me._uFirstTrade.setValue(firstValue);
				me._uFirstTrade.$change(secondValue);
				break;
			case 'busi_season':
				var values = firstValue.split(',');
				me._uHaveOrNotSelect.setValue(firstValue);
				me._uHaveOrNotSelect.$change();
				me._uSeasonMultiSelect.setValue(values);
				break;
		}
	}, UI_CONDITION_PLUS_PLUS_CLASS.setDefaultValue = function(defaultData) {
		var me = this;

		switch(this._uType) {
			case 'select':
				var item = defaultData[0];
				me._sDefaultValue = item.value;
				me._uSelect.remove(0);
				me._uSelect.setValue(item.value);
				//add(item.text, ,{'value':item.value});
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
	}, UI_CONDITION_PLUS_PLUS_CLASS.getValue = function() {
		var me = this;
		var returnValue = {
			'conditionId' : me._uId - 0,
			'conditionName' : me._sName,
			'operator' : this._sConType || 0,
			'firstValue' : '',
			'secondValue' : ''
		};
		var trim = baidu.string.trim;
		switch(me._uType) {
			case 'input':
				returnValue.firstValue = trim(me._uInput.getValue() + '');
				break;
			case "select":
				returnValue.firstValue = trim(me._uSelect.getValue() + '');
				break;
			case "dropdownlist":
				returnValue.firstValue = trim(me._uDropdownList.getValue() + '');
				break;
			case "calendar":
				var date = me._uMultiCalendar.getDate();
				if (date.begin) {
					returnValue.firstValue = baidu.date.format(date.begin, 'yyyy-MM-dd');
				}
				if (date.end) {
					returnValue.secondValue = baidu.date.format(date.end, 'yyyy-MM-dd');
				}
				break;
			case "inputTree":
				//me._sName

				break;
			case "math":
				returnValue.operator = me._uMath.getValue();
				returnValue.firstValue = trim(me._uMathLeft.getValue() + '');
				if (returnValue.operator == 6) {
					returnValue.secondValue = trim(me._uMathRight.getValue() + '');
				}
				break;
			case "fc_off_time":
				returnValue.operator = me._uHitSelect.getValue() - 0;
				returnValue.firstValue = trim(me._uHitFirstTimeSelect.getValue() + '');
				returnValue.secondValue = trim(me._uHitSecondTimeSelect.getValue() + '');
				break;
			case "trade":
				returnValue.firstValue = trim(me._uFirstTrade.getValue() + '');
				returnValue.secondValue = trim(me._uSecTrade.getValue() + '');
				break;
			case 'busi_season':
				returnValue.operator = trim(me._uHaveOrNotSelect.getValue() + '') - 0;

				if (returnValue.operator == "1") {
					returnValue.firstValue = trim(me._uSeasonMultiSelect.getValue() + '');
				} else {
					returnValue.firstValue = '';
				}
				break;
		}
		return returnValue;
	}, UI_CONDITION_PLUS_PLUS_CLASS.show = function() {
		baidu.dom.show(this.theNode);
	}, UI_CONDITION_PLUS_PLUS_CLASS.hide = function() {
		baidu.dom.hide(this.theNode);
	}, UI_CONDITION_PLUS_PLUS_CLASS.getUsable = function() {
		return this.theNode.style.display == 'none' ? false : true;
	}, UI_CONDITION_PLUS_PLUS_CLASS.getType = function() {
		return this._uType;
	}, UI_CONDITION_PLUS_PLUS_CLASS.isDefault = function() {
		return this._sIsDefault;
	}
})();
