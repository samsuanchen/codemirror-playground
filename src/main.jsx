var React=require("react");
var E=React.createElement;
var KsanaCodeMirror=require("ksana-codemirror").Component;
var maincomponent = React.createClass({
  componentDidMount:function(){
    this.editor=this.refs.cm.getCodeMirror();
    this.editor.setOption("theme", "ambiance");
    this.editor.setOption("mode",{name: "forth"})
  }
  ,render: function() {
    return E("div",null,
       E(KsanaCodeMirror,{ref:"cm",value:"asdfsn\nadfsadabc"}));
  }
});
module.exports=maincomponent;