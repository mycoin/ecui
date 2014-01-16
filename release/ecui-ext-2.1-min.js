(function(){var s=ecui,r=s.dom,a=s.string,l=s.ui,b=s.util,p=b.attachEvent,j=r.create,q=a.trim,i=s.setFocused,h=b.blank,m=s.inherits,f=l.Control,n=f.prototype,c=l.InputControl,d=c.prototype,g=l.Input=m(c,"ui-input",function(v,u){u.resizable=false},function(w,u){var x,v=this.getType();this.getInput().style.border="";if(u.maxLength){this._sMaxLength=u.maxLength}if(u.tip){x=j(v+"-tip","display:none");x.innerHTML=u.tip;this.getBody().appendChild(x);this._eTip=x;p(this._eTip,"mousedown",k)}}),t=g.prototype,o=l.Textarea=m(g,"ui-textarea",function(v,u){u.inputType="textarea"});function k(v){var w=v||window.event,u;if(w.preventDefault){w.preventDefault()}else{w.cancelBuble=true}w=w.target||w.srcElement;u=w.parentNode.getControl();u.getInput().focus()}function e(v,u){if(v._eTip){v._eTip.style.display=u?"":"none"}}t.$keydown=function(){e(this,false)};t.$keyup=function(){var u=this.getValue();if(this._sMaxLength){if(baidu.string.getByteLength(u)>this._sMaxLength){this.setValue(baidu.string.subByte(u,this._sMaxLength))}}if(!u){e(this,true)}};t.$blur=function(){n.$blur.call(this);e(this,false);if(!this.getValue()){e(this,true)}};t.$setSize=h;t.setValue=function(u){d.setValue.call(this,u);e(this,u?false:true)};t.init=function(){if(!this.getValue()){e(this,true)}d.init.call(this)}})();(function(){var D=ecui,B=D.dom,a=D.string,m=D.array,x=D.ui,b=D.util,i,u=Math,v=B.create,h=B.children,F=b.extend,p=b.blank,l=D.$fastCreate,y=D.inherits,f=D.triggerEvent,n=x.Control,C=x.Button,E=x.Select,w=x.Item,t=x.Items,z=n.prototype,q=C.prototype,d=w.prototype,r=E.prototype;var o=x.Pager=y(n,"ui-pager",function(L,H){var K=this.getTypes()[0],J,G,I=[];if(!H.showCount||H.showCount<3){G=this._nShowCount=7}else{G=this._nShowCount=H.showCount}this._bOMSButton=H.omsButton!==false;I.push('<div class="'+K+"-button-prv "+K+'-button">上一页</div><div class="'+K+'-items">');for(J=0;J<G;J++){if(J==1||J==G-1){I.push('<div class="'+K+'-item-oms" ecui="disabled:true">...</div>')}I.push('<div class="'+K+'-item"></div>')}I.push('</div><div class="'+K+"-button-nxt "+K+'-button">下一页</div>');L.innerHTML=I.join("")},function(H,G){H=h(H);this._bResizable=false;this._nPage=G.page||1;this._nPageSize=G.pageSize||50;this._nTotal=G.total||0;this._uPrvBtn=l(this.Button,H[0],this);this.$setBody(H[1]);this._uNxtBtn=l(this.Button,H[2],this);this.$initItems()}),g=o.prototype,k=g.Button=y(C,"ui-pager-button",function(I,G){var H=this.getTypes()[0],J=v(H+"-icon");I.insertBefore(J,I.firstChild)}),c=k.prototype,s=(g.Item=y(w,"ui-pager-item",function(H,G){G.resizeable=false})).prototype;F(g,t);function e(J){var I=this.getParent(),H=I._nPage,G=I.getMaxPage(),K=this.getStep();z.$click.call(this);if(K.charAt(0)=="+"){H+=parseInt(K.substring(1),10);if(H==I._nPage){H=G}else{if(H>G){H=I._nPage}}}else{if(K.charAt(0)=="-"){H-=parseInt(K.substring(1),10);if(H==I._nPage){H=1}else{if(H<1){H=I._nPage}}}else{H=parseInt(K,10)}}if(I._nPage!=H){f(I,"change",null,[H])}}function A(H){var M=H._aPageBtn,N=H.getMaxPage(),O=H._nPage,I=H._nShowCount,K=parseInt(I/2,10),G=O-K>0?O-K:1,J,L,P;if(O==1){H._uPrvBtn.disable()}else{H._uPrvBtn.enable()}if(O==N||N==0){H._uNxtBtn.disable()}else{H._uNxtBtn.enable()}if(G+I-1>N&&N-I>=0){G=N-I+1}for(L=0;P=M[L];L++){J=G+L;P.setContent(J);P.setStep(J);P.setSelected(O==J);if(J>N){P.hide()}else{P.show()}}j(H)}function j(H){var J=H._aPageBtn,I=H._aOMSBtn,G=H.getMaxPage(),K;if(!H._bOMSButton){return}if(J[0].getContent()!="1"){J[0].setContent(1);J[0].setStep(1);I[0].show()}else{I[0].hide()}K=J[J.length-1];if(K.isShow()&&K.getContent()!=G){K.setContent(G);K.setStep(G);I[1].show()}else{I[1].hide()}}s.$setSize=p;s.setSelected=function(G){this.alterClass((G?"+":"-")+"selected")};c.setStep=s.setStep=function(G){this._sStep=G+""};c.getStep=s.getStep=function(){return this._sStep};c.$click=s.$click=e;g.getMaxPage=function(){return u.ceil(this._nTotal/this._nPageSize)};g.getTotal=function(){return this._nTotal};g.getTotal=function(){return this._nTotal};g.go=function(G){this._nPage=G;A(this)};g.setPageSize=function(G){this._nPageSize=G;this._nPage=1;A(this)};g.setTotal=function(G){this._nTotal=G;this._nPage=1;A(this)};g.init=function(){var H,I,G=this.getItems();this._uPrvBtn.setStep("-1");this._uNxtBtn.setStep("+1");this._aOMSBtn=[];this._aPageBtn=[];z.init.call(this);for(H=0;I=G[H];H++){I.init();if(H==1||H==G.length-2){this._aOMSBtn.push(I);I.hide()}else{this._aPageBtn.push(I)}}A(this)};g.$setSize=p})();(function(){var v=ecui,g=v.array,b=v.dom,H=v.ui,o=v.string,k=v.util,n=Date,a=RegExp,f=document,G=g.push,r=b.children,P=b.create,K=b.getParent,B=b.getPosition,q=b.moveElements,c=b.setText,J=o.formatDate,x=k.getView,m=v.$fastCreate,j=v.inherits,O=v.triggerEvent,d=v.setFocused,i=H.Control,s=i.prototype,e=H.Button,u=e.prototype,A=H.InputControl,w=A.prototype,z=H.Select,Q=H.MonthView,l=Q.Cell;var y=H.Calendar=j(A,"ui-calendar",function(T,R){var S=this.getTypes()[0];R.hidden=true;T.innerHTML='<span class="'+S+'-text"></span><span class="'+S+'-cancel"></span><span class="'+S+'-button"></span>'},function(T,R){var V=r(T),S=this.getTypes()[0],U=P(S+"-panel","position:absolute;display:none");this._bTip=R.tip!==false;this._oNow=o.parseDate(R.now);this._oDate=R.date?o.parseDate(R.date):null;this._eText=V[0];this._uCancel=m(this.Cancel,V[1],this);this._uButton=m(i,V[2],this);this._bCancelButton=R.cancelButton!==false;if(!this._bCancelButton){this._uCancel.$hide()}f.body.appendChild(U);this._uPanel=m(this.Panel,U,this,{date:this._oDate,range:t(R.now,R.start,R.end)})}),C=y.prototype,h=(C.Cancel=j(i)).prototype,F=C.Panel=j(i,"ui-calendar-panel",function(S,ab){var U=[],X=(new n()).getFullYear(),Y=this.getTypes()[0];var Z=new Date();var W=Z.getFullYear()-5;var aa=Z.getFullYear()+5;var R=ab.range.begin;var V=ab.range.end;if(R){W=R.getFullYear()}if(V){aa=V.getFullYear()}U.push('<div class="'+Y+'-buttons"><div class="'+Y+"-btn-prv"+e.TYPES+'"></div><select class="'+Y+"-slt-year"+z.TYPES+'">');for(var T=W;T<=aa;T++){U.push('<option value="'+T+'">'+T+"</option>")}U.push('</select><select class="'+Y+"-slt-month"+z.TYPES+'">');for(var T=1;T<=12;T++){U.push('<option value="'+T+'">'+(T<10?"0":"")+T+"月</option>")}U.push('</select><div class="'+Y+"-btn-nxt"+e.TYPES+'"></div></div>');U.push('<div class="'+Y+"-month-view"+Q.TYPES+'"></div>');S.innerHTML=U.join("")},function(S,aa){var X=[],R,V,Y=this.getTypes()[0],Z=this.Button,W=this.Select,U=this.MonthView,T=aa.date;S=r(S);R=r(S[0]);this._uPrvBtn=m(Z,R[0],this);this._uPrvBtn._nStep=-1;this._uYearSlt=m(W,R[1],this);this._uMonthSlt=m(W,R[2],this);this._uNxtBtn=m(Z,R[3],this);this._uNxtBtn._nStep=1;S=S[1];this._uMonthView=m(U,S,this,{begin:aa.range.begin,end:aa.range.end})}),E=F.prototype,D=(E.Button=j(e,null)).prototype,L=(E.Select=j(z,null)).prototype,M=(E.MonthView=j(Q,null)).prototype,N='<span class="ui-calendar-default">请选择一个日期</span>',I="yyyy-MM-dd";function t(S,V,R){var S=o.parseDate(S),U=null,X=[S.getFullYear(),S.getMonth(),S.getDate()],T,W={y:0,M:1,d:2};if(V instanceof Date){U=U||{};U.begin=V}else{if(/^([-+]?)(\d+)([yMd])$/.test(V)){U=U||{};T=X.slice();if(!a.$1||a.$1=="+"){T[W[a.$3]]-=parseInt(a.$2,10)}else{T[W[a.$3]]+=parseInt(a.$2,10)}U.begin=new Date(T[0],T[1],T[2])}else{if("[object String]"==Object.prototype.toString.call(V)){U=U||{};V=o.parseDate(V);U.begin=V}}}if(R instanceof Date){U=U||{};U.end=R}else{if(/^([-+]?)(\d+)([yMd])$/.test(R)){U=U||{};T=X.slice();if(!a.$1||a.$1=="+"){T[W[a.$3]]+=parseInt(a.$2,10)}else{T[W[a.$3]]-=parseInt(a.$2,10)}U.end=new Date(T[0],T[1],T[2])}else{if("[object String]"==Object.prototype.toString.call(R)){U=U||{};R=o.parseDate(R);U.end=R}}}return U?U:{}}function p(R){var S=R._eText;if(S.innerHTML==""){R._uCancel.$hide();if(R._bTip){S.innerHTML=N}}else{if(R._bCancelButton){R._uCancel.show()}}}C.getDate=function(){return this._oDate};C.setDate=function(T){var S=this._uPanel,R=T!=null?J(T,I):"";if(this._uPanel.isShow()){this._uPanel.hide()}this._eText.innerHTML=R;w.setValue.call(this,R);this._oDate=T;p(this)};C.setValue=function(R){if(!R){this.setDate(null)}else{this.setDate(o.parseDate(R))}};C.$activate=function(U){var S=this._uPanel,R,V=B(this.getOuter()),T=V.top+this.getHeight();w.$activate.call(this,U);if(!S.isShow()){S.setDate(this.getDate());R=x();S.show();S.setPosition(V.left+S.getWidth()<=R.right?V.left:R.right-S.getWidth()>0?R.right-S.getWidth():0,T+S.getHeight()<=R.bottom?T:V.top-S.getHeight()>0?V.top-S.getHeight():0);d(S)}};C.$cache=function(R,S){w.$cache.call(this,R,S);this._uButton.cache(false,true);this._uPanel.cache(true,true)};C.init=function(){w.init.call(this);this.setDate(this._oDate);this._uPanel.init()};C.clear=function(){this.setDate(null)};C.setRange=function(S,R){this._uPanel._uMonthView.setRange(S,R)};h.$click=function(){var S=this.getParent(),R=S._uPanel;s.$click.call(this);S.setDate(null)};h.$activate=u.$activate;E.$blur=function(){this.hide()};E.setDate=function(S){var R=this.getParent()._oNow||new Date();var T=S!=null?S.getFullYear():(R).getFullYear(),U=S!=null?S.getMonth()+1:(R).getMonth()+1;this._uMonthView.$setDate(S);this.setView(T,U)};E.setView=function(R,U){var S=this._uMonthSlt,T=this._uYearSlt,V=this._uMonthView;T.setValue(R);S.setValue(U);V.setView(R,U)};E.getViewYear=function(){return this._uMonthView.getYear()};E.getViewMonth=function(){return this._uMonthView.getMonth()};E.$cache=function(R,S){this._uPrvBtn.cache(true,true);this._uNxtBtn.cache(true,true);this._uMonthSlt.cache(true,true);this._uYearSlt.cache(true,true);this._uMonthView.cache(true,true);s.$cache.call(this,R,S)};E.init=function(){s.init.call(this);this._uMonthSlt.init();this._uYearSlt.init();this._uMonthView.init()};E.$change=function(T,R){var S=this.getParent();if(O(S,"change",T,[R])){S.setDate(R)}this.hide()};L.$change=function(){var R=this.getParent(),T=R._uYearSlt,S=R._uMonthSlt;R.setView(T.getValue(),S.getValue())};D.$click=function(){var T=this._nStep,R=this.getParent(),S;S=new n(R.getViewYear(),R.getViewMonth()-1+T,1);R.setView(S.getFullYear(),S.getMonth()+1)};M.$change=function(S,R){O(this.getParent(),"change",S,[R])}})();(function(){var y=ecui,p=y.ui,w=y.dom,a=y.string,b=y.util,i=y.$fastCreate,s=y.inherits,c=y.triggerEvent,n=y.getOptions,q=y.dispose,h=w.children,o=w.create,A=w.moveElements,v=a.trim,l=a.encodeHTML,m=b.blank,u=b.attachEvent,k=p.Control,t=k.prototype;function e(D){var C=['<div class="'+D+'-title">'],B=(new Date()).getTime();C.push('<input type="radio" name="opt'+B+'" value="def" id="optDef'+B+'" /><label for="optDef'+B+'">默认</label>');C.push('<input type="radio" name="opt'+B+'" value="all" id="optAll'+B+'" /><label for="optAll'+B+'">全部</label>');C.push('<input type="radio" name="opt'+B+'" value="custom" id="optCustom'+B+'" /><label for="optCustom'+B+'">自定义</label>');C.push("</div>");return C.join("")}function g(B,E){for(var C=0,D;D=B[C];C++){u(D,"click",(function(F){return function(){E.$changeType(F)}})(D.value));E._aTypeRadio[D.value]=D}}function z(B,C){u(B,"click",function(){c(C.getParent(),"itemclick")})}function x(E){var C=true,B,D;for(B=0;D=E._aItems[B];B++){if(D.isDefChecked()!=D.isChecked()){C=false;break}}return C}var r=p.CustomCheckboxs=s(k,"ui-custom-checkboxs",function(E,B){var F=o(),D=this.getTypes()[0],C=[e(D)];C.push('<div class="'+D+'-items"></div>');A(E,F,true);E.innerHTML=C.join("");A(F,E.lastChild,true);B.resizeable=false},function(D,C){var E=h(D),B;B=E[0].getElementsByTagName("input");this._aTypeRadio={};g(B,this);this.$setBody(E[1]);this.$initItems(C.data)}),f=r.prototype,d=f.Item=s(k,"ui-custom-checkboxs-item",function(D,B){var C=[];B.name=B.name||v(D.innerHTML);B.resizeable=false;C.push('<input type="checkbox" value="'+B.value+'" id="opt'+B.value+'" />');C.push('<label for="opt'+B.value+'">'+B.name+"</label>");D.innerHTML=C.join("")},function(C,B){this._eInput=h(C)[0];this._sName=B.name;this._sValue=B.value;this._bDefChecked=B.defChecked===true;if(B.checked){this._eInput.checked=true}z(this._eInput,this)}),j=d.prototype;f.$setSize=m;f.init=function(){t.init.call(this);this.$itemclick()};f.$changeType=function(C){var B,D;if(C==this._sValueType){return}this._sValueType=C;if(C=="custom"){return}for(B=0;D=this._aItems[B];B++){if(C=="all"){D.setChecked(true)}else{if(C=="def"){D.setChecked(D.isDefChecked())}}}};f.$initItems=function(B){var E=B||h(this.getBody()),C,D;this._aItems=[];for(C=0;D=E[C];C++){this.add(D)}};f.add=function(D){var C=this.getTypes()[0],B;if(D.nodeName&&D.nodeType==1){D.className=C+"-item";B=n(D)}else{B=D;D=o(C+"-item","","span");this.getBody().appendChild(D)}this._aItems.push(i(this.Item,D,this,B))};f.setData=function(C){var B;if(this._aItems&&this._aItems.length>0){B=this._aItems.length-1;while(B-->=0){q(this._aItems[B])}}this.setContent("");this.$initItems(C);this.$itemclick()};f.getValue=function(){var C,D,B=[];for(C=0;D=this._aItems[C];C++){if(D.isChecked()){B.push(D.getValue())}}return B};f.setValue=function(D){var B,C,E={};for(B=0;C=D[B];B++){E[C]=true}for(B=0;C=this._aItems[B];B++){if(E[C.getValue()]){C.setChecked(true)}else{C.setChecked(false)}}this.$itemclick()};f.setValueType=function(B){this.$changeType(B)};f.getValueType=function(){return this._sValueType};f.$itemclick=function(){var B=this.getValue();if(B.length==this._aItems.length){this._aTypeRadio.all.checked=true;this._sValueType="all"}else{if(x(this)){this._aTypeRadio.def.checked=true;this._sValueType="def"}else{this._aTypeRadio.custom.checked=true;this._sValueType="custom"}}};j.$setSize=m;j.getValue=function(){return this._sValue};j.setChecked=function(B){this._eInput.checked=B};j.isChecked=function(){return this._eInput.checked};j.isDefChecked=function(){return this._bDefChecked}})();(function(){var x=ecui,k=x.array,o=x.ui,k=x.array,v=x.dom,a=x.string,c=x.util,g=x.$fastCreate,h=x.getMouseX,q=x.inherits,m=x.getOptions,p=x.dispose,e=x.triggerEvent,y=c.extend,d=k.indexOf,y=c.extend,t=c.toNumber,f=v.getStyle,i=v.first,u=v.insertAfter,s=a.trim,l=c.blank,j=o.Control,r=j.prototype,b=o.TreeView,z=b.prototype,A=o.DataTree=q(b,"ui-data-tree",function(C,B){B.expandSelected=B.expandSelected===true;if(i(C)&&"divlabel".indexOf(i(C).tagName.toLowerCase())>=0){y(B,m(i(C)))}if(B.value){B.value+=""}B.resizable=false},function(C,B){this._aSelected=[];this._sValue=B.value;this._bHideRoot=B.hideRoot===true;this._bSelectAble=B.selectable!==false;this._bMultiSelect=B.multi===true;this._bAsyn=B.asyn;if(B.asyn&&this._aChildren.length<=0){this.add("Loadding",null);this.collapse();this._bNeedAsyn=true}}),n=A.prototype;function w(B){B.setClass(B.getPrimary()+(B._aChildren.length?B._bCollapsed?"-collapsed":"-expanded":""))}n.init=function(){z.init.call(this);if(this._bHideRoot&&this==this.getRoot()){this.hide();this.expand()}};n.$setParent=function(E){var B=this.getRoot(),D=B._aSelected,F=this.getParent(),C;if((C=d(D,this))>=0){B.$setSelected(this,false)}if(this!==B){remove(F._aChildren,this);w(F)}r.$setParent.call(this,E);if(this._eChildren){u(this._eChildren,this.getOuter())}};n.getValue=function(){return this._sValue};n.getText=function(){return s(this.getContent().replace(/<[^>]+>/g,""))};n.getSelected=function(){if(this==this.getRoot()){return this._aSelected.slice()}};n.getSelectedValues=function(){var C=[],B,D;if(this==this.getRoot()){for(B=0;D=this._aSelected[B];B++){C.push(D.getValue())}return this._bMultiSelect?C:C[0]}};n.setValues=function(B){var D;if(d(B,this._sValue)>=0){this.getRoot().$setSelected(this,true);D=this;while((D=D.getParent())&&D instanceof b){if(D.isCollapsed()){D.expand()}}}for(var C=0,D;D=this._aChildren[C];C++){D.setValues(B)}};n.getItemByValue=function(E){var C=null;if(this._sValue==E){C=this}for(var B=0,D;(D=this._aChildren[B])&&C==null;B++){C=D.getItemByValue(E)}return C};n.load=function(B){var C,D,E;for(C=0;D=this._aChildren[C];C++){p(D)}this._aChildren=[];this._eChildren.innerHTML="";for(C=0;D=B[C];C++){E=D.text;D=y({asyn:this._bAsyn},D);delete D.text;this.add(E,null,D).init()}};n.$expand=function(C){var B=C.getRoot();if(C._bNeedAsyn){e(B,"load",null,[C.getValue(),function(D){C.load(D)}]);C._bNeedAsyn=false}};n.$click=function(C){var B=null;if(C.getControl()==this){r.$click.call(this,C);if(h(this)<=t(f(this.getBody(),"paddingLeft"))){this[C=this.isCollapsed()?"expand":"collapse"]();e(this.getRoot(),C,null,[this])}else{if(d(this.getRoot()._aSelected,this)>=0){if(this._bMultiSelect){B=false}}else{B=true}this.getRoot().setSelected(this);e(this.getRoot(),"select",null,[this,B==true]);if(B!==null){e(this.getRoot(),"change",null,[this.getValue(),B])}}}};n.getSelectedText=function(){var C=[],B,D;if(this==this.getRoot()){for(B=0;D=this._aSelected[B];B++){C.push(D.getText())}return C.join(",")}};n.setSelectAble=function(C){var B=this.getRoot(),D;if(!this.enable&&(D=d(B._aSelected,this))>=0){B.$setSelected(this,false)}this._bSelectAble=C};n.$setSelected=function(E,B){var D,C;if(this==this.getRoot()){D=this._aSelected;C=d(D,E);if(B===true){if(C<0){D.push(E);E.alterClass("+selected")}}else{if(B===false){if(C>=0){D.splice(C,1);E.alterClass("-selected")}}}}};n.clearSelected=function(){var C,B,D;if(this==this.getRoot()){C=this._aSelected;while(D=C[0]){this.$setSelected(D,false)}}};n.setSelected=function(D,E){var C,B;if(this==this.getRoot()&&D._bSelectAble){C=this._aSelected;B=d(C,this);if((B=d(C,D))>=0){if(!E&&this._bMultiSelect){this.$setSelected(D,false)}}else{if(!this._bMultiSelect&&C.length>=1){this.$setSelected(C[0],false)}this.$setSelected(D,true)}if(D&&this._bExpandSelected){D.expand()}}};n.$setSize=l})();(function(){var r=ecui,a=r.string,m=r.ui,b=r.util,a=r.string,e,s=b.extend,h=b.blank,p=b.attachEvent,f=a.encodeHTML,n=r.inherits,c=r.triggerEvent,g=m.Control,o=g.prototype;var t=m.LiteTable=n(g,"ui-lite-table",function(w,v){v.resizable=false},function(w,v){this._aData=[];this._aFields=[];this._eCheckboxAll=null;this._aCheckboxs=[];this._sEmptyText=v.emptyText||"暂无数据";this._bCheckedHighlight=v.checkedHighlight===true}),u=t.prototype,k=["click","mouseup","mousedown"],d={"click th.ui-lite-table-hcell-sort":function(v,y){var x=this.getAttribute("data-field"),w;if(this.className.indexOf("-sort-desc")>=0){w="asc"}else{if(this.className.indexOf("-sort-asc")>=0){w="desc"}else{w=this.getAttribute("data-orderby")||"desc"}}c(y,"sort",null,[x,w])},"click input.ui-lite-table-checkbox-all":function(v,w){w.$refreshCheckbox(this.checked)},"click input.ui-lite-table-checkbox":function(v,w){w.$refreshCheckbox()}};function q(y){var w=[],v,x;for(v=0;x=y[v];v++){w.push(s({},x))}return w}function j(x,y){var v=[],z;x=s({},x);x=s(x,d);for(var w in x){z={handler:x[w]};w=w.split(/\s+/);if(w[0]==y){z.selector=w[1];v.push(z)}}return v}function i(A,v){var x,z,y,w=true;if(!A&&!v){return false}v.replace(/^([^.#]*)([.#]?)(.*)$/,function(C,B,E,D){x=B;y=E;z=D});if(x&&A.tagName.toLowerCase()!=x){w=false}if(y=="."&&!new RegExp("(^|\\s+)"+z+"(\\s+|$)").test(A.className)){w=false}if(y=="#"&&A.id!=z){w=false}return w}function l(z,v,C){var x,E,w,D,y=[],B,A;for(x=0;E=v[x];x++){y.push('<tr class="'+C+'-row">');for(w=0;D=z[w];w++){A=C+"-cell";if(D.align){A+=" "+C+"-cell-align-"+D.align}else{if(D.checkbox){A+=" "+C+"-cell-align-center"}}y.push('<td class="'+A+'">');if(D.checkbox){y.push('<input type="checkbox" value="'+E[D.content]+'" class="'+C+'-checkbox"');if(D.checkedField&&E[D.checkedField]==true){y.push(' checked="checked"')}y.push(" />")}else{if(typeof D.content=="function"){y.push(D.content.call(null,E,x))}else{B=E[D.content];if(!B&&B!=0){B="&nbsp;"}else{B=f(B+"")}y.push(B)}}y.push("</td>")}y.push("</tr>")}return y.join("")}u.$setSize=h;u.init=function(){var v,w,x=this.getOuter(),y=this;o.init.call(this);for(v=0;w=k[v];v++){p(x,w,(function(z){return function(A){var B=A||window.event;B.targetElement=B.target||B.srcElement;y.$fireEventHanlder(z,B)}})(w))}};u.setData=function(w,v,x){this._aData=q(w);if(v){this._sSortby=v.sortby||"";this._sOrderby=v.orderby||""}!x&&this.render()};u.getData=function(){return q(this._aData)};u.getDataByField=function(y,x){var v,w;x=x||"id";for(v=0;w=this._aData[v];v++){if(w[x]==y){return s({},w)}}return null};u.setFields=function(v,w){this._aFields=q(v);!w&&this.render()};u.getSelection=function(){var w=[],v,x;for(v=0;x=this._aCheckboxs[v];v++){x.checked&&w.push(x.value)}return w};u.render=function(){var A=this.getTypes()[0],y=['<table cellpadding="0" cellspacing="0" width="100%" class="'+A+'-table">'],x,B,z,v=this._aFields,w=this._aData;if(!v||v.length<=0){return}y.push('<tr class="'+A+'-head">');for(x=0;B=v[x];x++){z=A+"-hcell";if(B.checkbox){z+=" "+A+"-hcell-checkbox";y.push('<th class="'+z+'"><input type="checkbox" class="'+A+'-checkbox-all" /></th>');continue}y.push("<th");if(B.width){y.push(' width="'+B.width+'"')}if(B.sortable){z+=" "+A+"-hcell-sort";if(B.field&&B.field==this._sSortby){z+=" "+A+"-hcell-sort-"+this._sOrderby}y.push(' data-field="'+B.field+'"');if(B.orderby){y.push(' data-orderby="'+B.orderby+'"')}}y.push(' class="'+z+'">'+B.title+"</th>")}y.push("</tr>");if(!w||w.length<=0){y.push('<tr class="'+A+'-row"><td colspan="'+v.length+'" class="'+A+'-cell-empty">'+this._sEmptyText+"</td></tr>")}else{y.push(l(v,w,A))}y.push("</table>");this.setContent(y.join(""));this.$bindCheckbox();if(this._eCheckboxAll){this.$refreshCheckbox()}};u.$bindCheckbox=function(){var v=this.getBody().getElementsByTagName("input"),w,y,x=this.getTypes()[0];this._aCheckboxs=[];this._eCheckboxAll=null;for(w=0;y=v[w];w++){if(y.type=="checkbox"&&y.className.indexOf(x+"-checkbox-all")>=0){this._eCheckboxAll=y}else{if(y.type=="checkbox"&&y.className.indexOf(x+"-checkbox")>=0){this._aCheckboxs.push(y)}}}};u.$refreshCheckbox=function(y){var w,x,v=true,z;for(w=0;x=this._aCheckboxs[w];w++){z=x.parentNode.parentNode;if(y!==e){x.checked=y}else{v=x.checked&&v}if(x.checked&&this._bCheckedHighlight){z.className+=" highlight"}else{if(this._bCheckedHighlight){z.className=z.className.replace(/\s+highlight/g,"")}}}this._eCheckboxAll.checked=y!==e?y:v};u.$fireEventHanlder=function(z,w){var y=j(this.events,z),x,A,B=w.targetElement,v;for(x=0;A=y[x];x++){if(i(B,A.selector)){A.handler.call(B,w,this)}}};u.$dispose=function(){this._aCheckboxs=[];this._eCheckboxAll=null;o.$dispose.call(this)}})();(function(){var w=ecui,j=w.array,u=w.dom,q=w.ui,b=w.util,f=j.indexOf,c=u.getText,v=u.remove,p=u.create,A=u.setInput,z=b.extend,m=b.inherits,o=w.getKey,t=w.mask,r=w.inherits,g=w.triggerEvent,e=q.InputControl,h=e.prototype,n=q.Items,x=q.Select,l=x.prototype,d=l.Item,B=d.prototype;var y=q.MultiSelect=r(x,"ui-multi-select",function(E,D){D.hide=true;if(D.value){D.value=D.value.toString()}},function(F,E){var D;if(E.maxlength){this._nTextLen=E.maxlength}if(E.textAll){this._sTextAll=E.textAll}if(E.maxSelected){this._nMaxSelected=E.maxSelected}else{if(!E.selectAllButton){this.add('<span class="all">全部</span>',0,{selectAllButton:true,value:""});this._bSelectAllBtn=true}}if(E.tip){this._bTip=true}if(E.value!==undefined){this.setValue(E.value)}if(E.selectAll){this._bInitSelectAll=true}if(E.minSelected){this._nMinSelected=E.minSelected}this._eInput.disabled=true}),i=y.prototype,k=i.Item=r(d,"ui-multi-select-item",function(F,D){var E=this.getTypes()[0],G=p(E+"-icon");this._bSelectAllBtn=D.selectAllButton;this._sTip=D.tip?D.tip:c(F);F.insertBefore(G,F.firstChild);F=this._eInput=D.parent.getMain().appendChild(A(null,D.parent.getName(),"checkbox"));if(D.value!==undefined){F.value=D.value}F.style.display="none"}),a=k.prototype;function s(H,D){var E=H.getItems();if(!H._bSelectAllBtn){return}if(D===undefined){D=H.getSelected().length===E.length-1;E[0].$setSelected(D)}else{for(var F=0,G;G=E[F];F++){G.$setSelected(D)}}}function C(G){var F;if(G){for(var D=0,E=G.getItems(),I,H=[];I=E[D++];){if(I.isSelected()&&!I._bSelectAllBtn){H.push(I._sTip)}}F='<span title="'+H.join(",")+'">';if(H.length==E.length+(G._bSelectAllBtn?-1:0)&&G._sTextAll){H=G._sTextAll}else{H=H.join(",");if(G._nTextLen&&H.length>G._nTextLen){H=H.substring(0,G._nTextLen)+"..."}}if(G._bTip){H=F+H+"</span>"}G.$getSection("Text").setContent(H||"<span style='color:#CCC'>请选择</span>")}}z(i,n);a.$click=function(F){var E=this.getParent(),D=E.getSelected().length;B.$click.call(this,F);if(!this.isSelected()){if(!E._nMaxSelected||E._nMaxSelected>=D+1){this.setSelected(true)}}else{if(!E._nMinSelected||E._nMinSelected<=D-1){this.setSelected(false)}}};a.$dispose=function(){this._eInput=null;B.$dispose.call(this)};a.isSelected=function(){return this._eInput.checked};a.$setSelected=function(D){this._eInput.checked=D!==false;this.setClass(this.getPrimary()+(this._eInput.checked?"-selected":""))};a.setSelected=function(D){this.$setSelected(D);s(this.getParent(),this._bSelectAllBtn?D:undefined);C(this.getParent())};i.$alterItems=function(){l.$alterItems.call(this);s(this);C(this)};i.$append=function(D){l.$append.call(this,D);this.getMain().appendChild(A(D._eInput,this.getName()))};i.$cache=l.$cache;i.$intercept=function(D){for(var E=D.getControl();E;E=E.getParent()){if(E instanceof k){D.target=E.getOuter();return false}}this.$getSection("Options").hide();g(this,"change");D.exit()};i.$keydown=i.$keypress=i.$keyup=function(E){h["$"+E.type].call(this,E);if(!this.$getSection("Options").isShow()){return false}var D=o();if(D==13||D==32){if(E.type=="keyup"){D=this.getActived();D.setSelected(!D.isSelected())}return false}};i.$mousewheel=function(E){var D=this.$getSection("Options");if(D.isShow()){D.$mousewheel(E)}return false};i.$deactivate=l.$deactivate;i.$activate=function(E){var D=E.getControl();if(!(D instanceof k)){l.$activate.call(this,E)}};i.$ready=function(){s(this);C(this);if(this._bInitSelectAll){for(var D=0,E=this.getItems(),F;F=E[D++];){!F._bSelectAllBtn&&F.setSelected(true)}}};i.$remove=function(D){l.$remove.call(this,D);this.getMain().removeChild(D._eInput)};i.$setSize=l.$setSize;i.getSelected=function(){for(var E=0,F=this.getItems(),G,D=[];G=F[E++];){if(G.isSelected()&&!G._bSelectAllBtn){D.push(G)}}return D};i.getValue=function(){var E=this.getSelected(),G=[],F,D;for(F=0,D=E.length;F<D;F++){if(!E[F]._bSelectAllBtn){G.push(E[F]._eInput.value)}}return G};i.selectAll=function(){for(var D=0,E=this.getItems(),F;F=E[D++];){!F._bSelectAllBtn&&F.setSelected(true)}};i.isSelectAll=function(){for(var D=0,E=this.getItems(),F;F=E[D++];){if(!F.isSelected()){return false}}return true};i.setOptionSize=l.setOptionSize;i.setValue=function(D){if("[object Array]"!=Object.prototype.toString.call(D)){D=D.toString().split(",")}for(var E=0,F=this.getItems(),G;G=F[E++];){G.setSelected(f(D,G._eInput.value)>=0)}s(this);C(this)}})();(function(){var t=ecui,h=t.array,s=t.dom,o=t.ui,c=t.util,a=t.string,g=t.$fastCreate,m=t.setFocused,n=s.create,e=s.children,v=s.moveElements,x=s.getPosition,p=t.inherits,d=t.triggerEvent,b=c.getView,k=c.blan,i=o.Control,q=i.prototype,r=o.Button,l=r.prototype;var w=o.Pop=p(i,"ui-pop",null,function(B,y){var A=this.getTypes()[0],C=n(),z;B.style.position="absolute";if(y.noButton!==true){C.innerHTML='<div class="'+A+'-buttons"><div class="ui-button ui-button-g">确定</div><div class="ui-button">取消</div></div>';z=e(C.firstChild);this._uSubmitBtn=g(this.Button,z[0],this,{command:"submit",primary:"ui-button-g"});this._uCancelBtn=g(this.Button,z[1],this,{command:"cancel"});v(C,B,true)}}),j=w.prototype;UI_POP_BTN=j.Button=p(r,null,function(z,y){this._sCommand=y.command}),UI_POP_BTN_CLASS=UI_POP_BTN.prototype;j.show=function(A,E){var z=b(),C,y,D=x(A.getOuter());q.show.call(this);this.resize();y=this.getWidth();C=A.getHeight()+D.top;if(!E&&E=="left"){if(D.left+y>z.right){y=D.left+A.getWidth()-y}else{y=D.left}}else{if(D.left+A.getWidth()-y<0){y=D.left}else{y=D.left+A.getWidth()-y}}if(C+this.getHeight()>z.bottom){C=z.bottom-this.getHeight()}var B=x(this.getOuter().offsetParent);y=y-B.left;C=C-B.top+document.body.scrollTop;this.setPosition(y,C);m(this)};j.$resize=function(){var z=this._eMain,y=z.style;y.width=this._sWidth;y.height=this._sHeight;this.repaint()};j.init=function(){q.init.call(this);this.$hide()};j.$blur=function(){this.hide();d(this,"cancel")};UI_POP_BTN_CLASS.$click=function(){var y=this.getParent();l.$click.call(this);if(d(y,this._sCommand)){y.$blur=k;y.hide();delete y.$blur}};var f=o.PopButton=p(r,"ui-pop-button",function(A,y){var z=this.getTypes()[0],B=n(z+"-icon","position:absolute");this._sAlign=y.align;A.appendChild(B);this._sTargetId=y.target},function(A,y){var z=this.getTypes()[0];if(y.mode=="text"){this.setClass(z+"-text")}}),u=f.prototype;u.$click=function(){var y;l.$click.call(this);if(this._sTargetId){y=t.get(this._sTargetId);y.show(this,this._sAlign)}}})();(function(){var t=ecui,o=t.ui,s=t.dom,a=t.string,i=t.$fastCreate,p=t.inherits,c=t.triggerEvent,m=t.getOptions,g=s.children,n=s.create,r=a.trim,k=o.Control,d=o.PsTip,q=k.prototype,l=o.Radio,j=l.prototype;var b=o.QueryTab=p(k,"ui-query-tab",null,function(y,v){var B=g(y),x=this.getTypes()[0],w,z,A=v.value;this._sName=v.name;this._aItems=[];this._bIsEnabled=true;for(w=0;z=B[w];w++){var u=m(z);if(undefined==u.name){u.name=this._sName}z.className=r(z.className)+" "+x+"-item"+l.TYPES;this._aItems[w]=i(this.Item,z,this,u);if(A!==undefined&&A==this._aItems[w].getValue()){this._aItems[w].setChecked(true);this._oCurChecked=this._aItems[w]}}}),e=b.prototype,h=e.Item=p(l,"ui-query-tab-item",null,function(v,u){var w;if(u.tip){w=n("ui-tip","","span");w.setAttribute("ecui","type:tip");w.innerHTML=u.tip;v.appendChild(w);t.init(w)}}),f=h.prototype;f.$click=function(){var u=this.getParent(),v=u._oCurChecked;if(!u._bIsEnabled){u.onLocked.call();return null}j.$click.call(this);if(v&&v!=this){u._oCurChecked=this;c(this.getParent(),"change",null,[this.getValue()])}};f.getItems=function(){return this.getParent().getItems()};e.getItems=function(){return this._aItems.slice()};e.getValue=function(){return this._oCurChecked?this._oCurChecked.getValue():null};e.getName=function(){return this._sName};e.onLocked=function(){};e.setEnabled=function(u){this._bIsEnabled=!!u};e.setValue=function(w){for(var u=0,v;v=this._aItems[u];u++){if(v.getValue()==w){v.setChecked(true);this._oCurChecked=v}}}})();(function(){var C=ecui,k=C.array,B=C.dom,s=C.ui,d=C.util,a=C.string,i=C.$fastCreate,o=C.setFocused,q=B.create,g=B.children,m=B.last,D=B.moveElements,E=B.getPosition,A=B.setText,u=C.inherits,b=C.isContentBox,t=C.getStatus,c=d.getView,f=C.triggerEvent,z=a.trim,j=s.Control,x=j.prototype,p=500,n=200,w=C.REPAINT,l=null;var e=s.Tip=u(j,"ui-tip",function(G,F){F.message=z(G.innerHTML)||F.message;G.innerHTML=""},function(G,F){this._sTarget=F.target;this._sMessage=F.message;this._oTimer=null;this._bAsyn=F.asyn===true;this._bLoad=false}),h=e.prototype,y=h.Layer=u(j,"ui-tip-layer",function(G,F){G.appendChild(q(this.getTypes()+"-corner"));G.appendChild(q())},function(G,F){G=g(G);this._eCorner=G[0];this.$setBody(G[1])}),r=y.prototype;function v(){var F;if(!l){F=document.body.appendChild(q(y.TYPES));l=i(y,F);l.cache();l.init()}return l}h.$mouseover=function(){var F=this;x.$mouseover.call(this);clearTimeout(this._oTimer);if(!this._bShow){if(this._bAsyn){var G=v();this.close();F._oTimer=setTimeout(function(){F._bLoad=false;f(F,"loadData",function(){F.open()})},p)}else{this._oTimer=setTimeout(function(){F.open()},p)}}};h.$mouseout=function(){var F=this;x.$mouseout.call(this);clearTimeout(this._oTimer);if(this._bShow){this._oTimer=setTimeout(function(){F.close()},n)}};h.$getTarget=function(F){return document.getElementById(F)};h.setTarget=function(F){this._sTarget=F};h.open=function(){var F=v();if(this._sTarget){var G=this.$getTarget(this._sTarget);if(G){if("[object String]"==Object.prototype.toString.call(G)){F.getBody().innerHTML=G}else{F.getBody().innerHTML=G.innerHTML}}}else{if(this._sMessage){F.setContent(this._sMessage)}}F.show(this);this._bShow=true};h.close=function(){v().hide();this._bShow=false};r.show=function(F){var L=E(F.getOuter()),K=this.getTypes()[0],M=c(),O=13,N=F.getWidth(),I=F.getHeight(),H=9,G=13,J=[];if(F){this._uHost=F}x.show.call(this);this.resize();if(L.left+this.getWidth()>M.right){L.left=L.left+N-this.getWidth()+H;J.push("-right")}else{L.left=L.left-H;J.push("-left")}if(L.top-O-this.getHeight()<M.top&&L.top+I+O+this.getHeight()<M.bottom){L.top+=I+O;J.push("-bottom")}else{L.top-=O+this.getHeight();J.push("-top")}this._eCorner.className=K+"-corner "+K+"-corner"+J.join("");this.setPosition(L.left,L.top)};r.$mouseover=function(){x.$mouseover.call(this);this._uHost.$mouseover()};r.$mouseout=function(){x.$mouseout.call(this);this._uHost.$mouseout()};r.$resize=function(){var G=this._eMain,F=G.style;F.width=this._sWidth;F.height=this._sHeight;this.repaint()}})();