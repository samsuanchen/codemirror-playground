var CM = require('codemirror');

require('codemirror/addon/display/panel');
require('codemirror/addon/search/search.js');
require('codemirror/addon/search/searchcursor.js');
require('codemirror/addon/dialog/dialog.js');
require('codemirror/addon/hint/show-hint.js');
require('codemirror/addon/selection/active-line');
require('codemirror/mode/javascript/javascript.js');
require('codemirror/mode/forth/forth.js');
require('./automarkup.js');


var milestones=require("./milestones");
var React = require('react');
var ReactDOM = require('react-dom');
var E=React.createElement;

var applyMarkups=require("./markups").applyMarkups;

var randomKey=function() {
	return 'm'+Math.random().toString().substr(2,5);
}
var eventKeys=["altKey","ctrlKey","shiftKey","clientX","clientY","pageX","pageY","screenX","screenY","type"];
var CodeMirrorComponent = React.createClass({
	displayName :"CodeMirror"
	,propTypes: {
		onChange: React.PropTypes.func,
		onFocusChange: React.PropTypes.func,
		onCursorActivity: React.PropTypes.func,
		options: React.PropTypes.object,
		path: React.PropTypes.string,
		value: React.PropTypes.string,
		onBeforeCopy:React.PropTypes.func
	}
	,getInitialState:function () {
		return {
			isFocused: false
		};
	}
	,cursorActivity:function(cm) { 
		this.props.onCursorActivity&&this.props.onCursorActivity(cm);
	}
	,componentDidMount:function () {
		if (typeof window.IRE!=="undefined") {
			require("./ire-hint");
		}
		var textareaNode = ReactDOM.findDOMNode(this.refs.editor);
		this.codeMirror = CM(textareaNode, {
  		value: this.props.value
  		//,mode:  "javascript"
  		//inputStyle:"contenteditable",
  		,styleActiveLine:true
  		,undoDepth: Infinity
  		,lineWrapping:true
  		,readOnly:!!this.props.readOnly
  		,lineNumbers: true
  		,theme:this.props.theme||""
  		,gutters: ["CodeMirror-linenumbers"]
  		,lineSeparator:this.props.lineSeparator||null  		
  		,extraKeys: {
  			"Ctrl-I": function(cm){
  				cm.showHint({hint: CM.hint.ire});
  			}
  		}
		});

		this.codeMirror.setOption("lineNumberFormatter",milestones.lineNumberFormatter.bind(this));

		//CM.fromTextArea(textareaNode, this.props.options);
		if (this.props.onBeforeCopy) this.codeMirror.on('beforeCopyToClipboard', this.props.onBeforeCopy);
		this.props.onChange && this.codeMirror.getDoc().on('change', this.props.onChange);
		if (this.props.onBeforeChange) this.codeMirror.on('beforeChange', this.props.onBeforeChange);
		this.codeMirror.on('focus', this.focusChanged.bind(this, true));
		this.codeMirror.on('blur', this.focusChanged.bind(this, false));
		this.codeMirror.on('cursorActivity',this.cursorActivity);
		this.codeMirror.on('mousedown',this.onMouseDown);

		setTimeout(function(){
			this.props.markups&&applyMarkups(this.codeMirror,this.props.markups,true);
			this.props.onMarkupReady&&this.props.onMarkupReady(this.codeMirror);
		}.bind(this),30);//need to wait for this.codeMirror.react ready (dirty hack)
	}

	,componentWillUnmount:function () {
		// todo: is there a lighter-weight way to remove the cm instance?
		if (this.codeMirror&& this.codeMirror.toTextArea) {
			this.codeMirror.toTextArea();
		}
		clearTimeout(this.timermove);
	}

	,onMouseDown:function(cm,e) {
		this.props.onMouseDown&&this.props.onMouseDown(cm,e);
	}

	,shouldComponentUpdate:function(nextProps) {
		var update= (nextProps.value!==this.props.value || nextProps.history!==this.props.history 
				||nextProps.markups!==this.props.markups);
		return update;
	}

	,componentWillReceiveProps:function (nextProps) {
		if (this.codeMirror) {

			if (this.props.history !== nextProps.history) {
				//this.codeMirror.setHistory(nextProps.history);
			}

			if (this.props.markups !== nextProps.markups) {
				nextProps.markups&&applyMarkups(this.codeMirror,nextProps.markups);
			}
		}
	}

	,getCodeMirror:function () {
		return this.codeMirror;
	}
/*
	,markText:function(opts) {
		var doc=this.codeMirror.getDoc();
		var selections=doc.listSelections();
		
		for (var i=0;i<selections.length;i++) {
			var sel=selections[i];
			if (sel.anchor===sel.head) continue; //empty
			if (typeof opts.key!=="string") {
				opts.key=randomKey();
			}
			this.codeMirror.markText(sel.anchor,sel.head, opts );	
		}
	}
*/
	,focus:function () {
		if (this.codeMirror) {
			this.codeMirror.focus();
		}
	}

	,focusChanged:function (focused) {
		if (!this.isMounted())return;//no longer available
		this.setState({isFocused: focused});
		this.props.onFocusChange && this.props.onFocusChange(focused);
	}
	,onMouseMove:function(e) {
		if (!this.props.onMouseMove)return;
		clearTimeout(this.timermove);
		var ev={};
		eventKeys.forEach(function(k) {ev[k]=e[k]});
		this.timermove=setTimeout(function() {
			this.props.onMouseMove(ev);
		}.bind(this),100);
	}
	,render:function () {
		var obj={ref:"editor"};
		if (this.props.onMouseMove) obj.onMouseMove=this.onMouseMove;
		return E("span",obj);
	}

});

module.exports = CodeMirrorComponent;