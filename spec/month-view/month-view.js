describe('日历控件初始化测试', {
    '默认参数': function () {
        var control = ecui.create('MonthView');

        value_of(control.getYear()).should_be(new Date().getFullYear());
        value_of(control.getMonth()).should_be(new Date().getMonth() + 1);

        ecui.dispose(control);
    },

    '指定年月参数': function () {
        var control = ecui.create('MonthView', {year: 2008, month: 11});

        value_of(control.getYear()).should_be(2008);
        value_of(control.getMonth()).should_be(11);

        ecui.dispose(control);
    }
});

describe('日历控件功能测试', {
    'before': function () {
        ecui.create('MonthView', {id: 'calendar', parent: document.body});
    },

    'after': function () {
        var control = ecui.get('calendar');
        control.setParent();
        ecui.dispose(control);
    },

    '设置月份(getMonth/getYear/setView)': function () {
        var control = ecui.get('calendar'),
            data201002 = [
                '1', true, '2', true, '3', true, '4', true, '5', true, '6', true, '7', true,
                '8', true, '9', true, '10', true, '11', true, '12', true, '13', true, '14', true,
                '15', true, '16', true, '17', true, '18', true, '19', true, '20', true, '21', true,
                '22', true, '23', true, '24', true, '25', true, '26', true, '27', true, '28', true,
                '1', false, '2', false, '3', false, '4', false, '5', false, '6', false, '7', false,
                '8', false, '9', false, '10', false, '11', false, '12', false, '13', false, '14', false
            ],
            data201008 = [
                '26', false, '27', false, '28', false, '29', false, '30', false, '31', false, '1', true,
                '2', true, '3', true, '4', true, '5', true, '6', true, '7', true, '8', true,
                '9', true, '10', true, '11', true, '12', true, '13', true, '14', true, '15', true,
                '16', true, '17', true, '18', true, '19', true, '20', true, '21', true, '22', true,
                '23', true, '24', true, '25', true, '26', true, '27', true, '28', true, '29', true,
                '30', true, '31', true, '1', false, '2', false, '3', false, '4', false, '5', false
            ];
        control.setView(2010, 2);

        value_of(control.getYear()).should_be(2010);
        value_of(control.getMonth()).should_be(2);
        for (var i = 0, list = control.getMain().getElementsByTagName('td'); i < 42; i++) {
            var item = list[i + 7];
            value_of(item.innerHTML).should_be(data201002[i * 2]);
            value_of(!item.getControl().isDisabled()).should_be(data201002[i * 2 + 1]);
        }

        control.setView(2010, 8);
        for (var i = 0; i < 42; i++) {
            var item = list[i + 7];
            value_of(item.innerHTML).should_be(data201008[i * 2]);
            value_of(!item.getControl().isDisabled()).should_be(data201008[i * 2 + 1]);
        }
    },

    '月份移动(move)': function () {
        var control = ecui.get('calendar');
        control.setView(2010, 1);

        control.move(-14);
        value_of(control.getYear()).should_be(2008);
        value_of(control.getMonth()).should_be(11);

        control.move(11);
        value_of(control.getYear()).should_be(2009);
        value_of(control.getMonth()).should_be(10);
    },

    '点击事件': function () {
        var control = ecui.get('calendar'),
            list = control.getMain().getElementsByTagName('td'),
            result = [];
        control.setView(2010, 8); 
        control.onchange = function (event, date) {
            result.push(date.getFullYear());
            result.push(date.getMonth() + 1);
            result.push(date.getDate());
        }

        uiut.MockEvents.mousedown(list[12]);
        uiut.MockEvents.mouseup(list[12]);
        uiut.MockEvents.mousedown(list[13]);
        uiut.MockEvents.mouseup(list[13]);
        value_of(result).should_be([2010, 8, 1]);
    },

    '设置日期(setDate/getDate)' : function () {
        var control = ecui.get('calendar'),
            date;

        value_of(control.getDate()).should_be(undefined);

        control.setDate(new Date(2012, 5, 30));
        date = control.getDate();

        value_of(date.getFullYear()).should_be(2012);
        value_of(date.getMonth()).should_be(5);
        value_of(date.getDate()).should_be(30);
    },

    '鼠标选择本月日期': function () {
        var control = ecui.get('calendar'),
            list = control.getMain().getElementsByTagName('td'),
            date;

        control.setView(2012, 2);
        uiut.MockEvents.mousedown(list[9]);
        uiut.MockEvents.mouseup(list[9]);

        date = control.getDate();
        value_of(date.getFullYear()).should_be(2012);
        value_of(date.getMonth()).should_be(1);
        value_of(date.getDate()).should_be(1);
    },

    '鼠标选择非本月日期': function () {
        var control = ecui.get('calendar'),
            list = control.getMain().getElementsByTagName('td');

        control.setView(2012, 2);
        uiut.MockEvents.mousedown(list[7]);
        uiut.MockEvents.mouseup(list[7]);

        value_of(control.getDate()).should_be(undefined);
    },

    '日期范围设置': function () {
        var control = ecui.get('calendar'),
            list = control.getMain().getElementsByTagName('td'),
            date;

        control.setView(2012, 2);
        control.setRange(new Date(2012, 1, 2), new Date(2012, 1, 4));

        uiut.MockEvents.mousedown(list[9]);
        uiut.MockEvents.mouseup(list[9]);
        date = control.getDate();

        value_of(date).should_be(undefined);

        uiut.MockEvents.mousedown(list[10]);
        uiut.MockEvents.mouseup(list[10]);
        date = control.getDate();

        value_of(date.getFullYear()).should_be(2012);
        value_of(date.getMonth()).should_be(1);
        value_of(date.getDate()).should_be(2);

        uiut.MockEvents.mousedown(list[13]);
        uiut.MockEvents.mouseup(list[13]);
        date = control.getDate();

        value_of(date.getFullYear()).should_be(2012);
        value_of(date.getMonth()).should_be(1);
        value_of(date.getDate()).should_be(2);

        uiut.MockEvents.mousedown(list[12]);
        uiut.MockEvents.mouseup(list[12]);
        date = control.getDate();

        value_of(date.getFullYear()).should_be(2012);
        value_of(date.getMonth()).should_be(1);
        value_of(date.getDate()).should_be(4);
    },

    'change事件': function () {
        var control = ecui.get('calendar'),
            list = control.getMain().getElementsByTagName('td'),
            changeDate;

        control.onchange = function (event, date) {
            changeDate = date;
        }

        control.setView(2012, 2);
        uiut.MockEvents.mousedown(list[9]);
        uiut.MockEvents.mouseup(list[9]); 
        
        value_of(changeDate).should_not_be(undefined);
        value_of(changeDate.getFullYear()).should_be(2012);
        value_of(changeDate.getMonth()).should_be(1);
        value_of(changeDate.getDate()).should_be(1);

        changeDate = null;
        uiut.MockEvents.mousedown(list[9]);
        uiut.MockEvents.mouseup(list[9]);

        value_of(changeDate).should_be(null);
        changeDate = control.getDate();
        value_of(changeDate.getFullYear()).should_be(2012);
        value_of(changeDate.getMonth()).should_be(1);
        value_of(changeDate.getDate()).should_be(1);
        
        uiut.MockEvents.mousedown(list[10]);
        uiut.MockEvents.mouseup(list[10]);
        value_of(changeDate.getFullYear()).should_be(2012);
        value_of(changeDate.getMonth()).should_be(1);
        value_of(changeDate.getDate()).should_be(2);
    }
});
