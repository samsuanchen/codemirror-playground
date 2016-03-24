var React=require("react");
var KsanaCodeMirror=require("ksana-codemirror").Component;
var maincomponent = React.createClass({

  render: function() {
    return <div><KsanaCodeMirror value="abc"/>
    </div>;
  }
});
module.exports=maincomponent;