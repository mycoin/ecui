/**
 * extend input-tree for er
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    input-tree.js
 * desc:    层级树输入控件的er扩展
 * author:  cxl(chenxinle@baidu.com)
 * date:    2012/03/12
 */
(function () {
    var core = ecui,
        ui = core.ui,
        util = core.util,
        dom = core.dom,

        $fastCreate = core.$fastCreate,
        disposeControl = core.dispose,
        createDom = dom.create,
        extend = util.extend,

        UI_DATA_TREE = ui.DataTree,
        UI_INPUT_TREE = ui.InputTree,
        UI_INPUT_TREE_CLASS = UI_INPUT_TREE.prototype,
        UI_INPUT_TREE_LAYER_TREE = UI_INPUT_TREE_CLASS.Layer.prototype.Tree,
        UI_INPUT_TREE_LAYER_TREE_CLASS = UI_INPUT_TREE_LAYER_TREE.prototype,
        oldPreprocess = UI_INPUT_TREE.preprocess,
        oldLoad = UI_INPUT_TREE_LAYER_TREE_CLASS.load;

    UI_INPUT_TREE.preprocess = function (el, options) {
        var html = [], item,
            item = options.datasource || [],
            text = item.text,
            child = item.children,
            type = this.getType();
        html.push('<div class="'+ UI_DATA_TREE.types[0] +'">');
        
        //兼容E-JSON规范，将id值转化为value
        item = extend({}, item);
        if (item.id) {
            item.value = item.id;
            delete item.id;
        }
        delete item.text;
        delete item.children;

        if (child && child.length > 0) {
            html.push('<label ecui="'+ map2Params(item) +'">' + text + '</label>');
            getChildrenHTML(child, html);
        }
        else {
            html.push('<div ecui="'+ map2Params(item) +'">' + text + '</div>');
        }

        html.push('</div>');

        el.innerHTML = '<span class="'+ type +'-text"></span><span class="'+ type +'-cancel"></span><span class="'+ type +'-button"></span><input type="hidden name="'+ options.name +'"" />';
        options._eLayer = createDom(type +'-layer', 'position:absolute;display:none');
        options._eLayer.innerHTML = html.join('');
        document.body.appendChild(options._eLayer);

        options.hidden = true;
        if (options.value) {
            options.value += '';
        }
    };

    function map2Params(map) {
        var key, str = [];
        for (key in map) {
            str.push(key + ':' + map[key]);
        }
        return str.join(';');
    }

    function getChildrenHTML(data, html) {
        var i, item, child, text;

        for (i = 0; item = data[i]; i++) {
            item = extend({}, item);
            text = item.text;
            child = item.children;

            //兼容E-JSON规范，将id值转化为value
            if (item.id) {
                item.value = item.id;
                delete item.id;
            }

            delete item.text;
            delete item.children;

            if (child && child.length > 0) {
                html.push('<div><label ecui="'+ map2Params(item) +'">' + text + '</label>');
                getChildrenHTML(child, html);
                html.push('</div>');
            }
            else {
                html.push('<div ecui="'+ map2Params(item) +'">' + text + '</div>');
            }
        }
        
        return html;
    }

	UI_INPUT_TREE_CLASS.setText = function(value){
		this._eText.innerHTML = value;
	}
	
	UI_INPUT_TREE_CLASS.getText = function(){
		return this._eText.innerHTML;
	}
	
    UI_INPUT_TREE_LAYER_TREE_CLASS.load = function (datasource) {
        for (var i = 0, item; item = datasource[i]; i++) {
            if (item.id) {
                item.value = item.id;
                delete item.id;
            }
        }
        oldLoad.call(this, datasource);
    };
})();
