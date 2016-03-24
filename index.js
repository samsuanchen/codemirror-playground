var React=require("react");
var ReactDom=require("react-dom");
if(window.location.origin.indexOf("//127.0.0.1")>-1) {
	require("ksana2015-webruntime/livereload")(); 
}
var ksanagap=require("ksana2015-webruntime/ksanagap");
ksanagap.boot("codemirror-playground",function(){
	var Main=React.createElement(require("./src/main.jsx"));
	ksana.mainComponent=ReactDom.render(Main,document.getElementById("main"));
});