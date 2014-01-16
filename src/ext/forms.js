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
