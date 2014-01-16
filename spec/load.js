function test(context, entries, base) {
    window.before && (entries.before = function () {
        ecui.get();
        before();
    });
    window.after && (entries.after = after);
    describe(context, entries, base);
}

href = location.href;
href = href.substring(href.lastIndexOf('?') + 1);
href = href + '/' + href;
document.write('<link rel="stylesheet" type="text/css" media="screen" href="specs.css" />');
document.write('<link rel="stylesheet" type="text/css" media="screen" href="' + href + '.css" />');
document.write('<script type="text/javascript" src="tangram.js"></script>');
document.write('<script type="text/javascript" src="../release/ecui.js"></script>');
document.write('<script type="text/javascript" src="test.js"></script>');
document.write('<script type="text/javascript" src="MockEvent.js"></script>');
document.write('<script type="text/javascript" src="' + href + '.js"></script>');
