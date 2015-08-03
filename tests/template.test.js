module("Template Tests");


QUnit.test("Template Object", function(assert) {


	function RenderElement(formatArray){

		function BeforeElementCompile(x){
			x = String.prototype.format.apply(x, formatArray);
			return x;
		}
		function AfterDOMInsert(){
			console.log("rendered");
		}		
		queryTemplate.appendNew(this, BeforeElementCompile, AfterDOMInsert);
	}	

	var PARENT = ".query-params",
	CHILD = "query-param",
	queryTemplate = new Merkin.Template({
		parent : PARENT,
		child : CHILD
	});
	
	assert.ok(queryTemplate instanceof Merkin.Template, "Can instance Template: " + queryTemplate.parent);	
	assert.equal(queryTemplate.index, 0, "config set and can access index count of children: 0 ==" + queryTemplate.index);	

	var ex = [
		"<dl class='{0} active'>",
		"<dt>param: </dt>",
		"<dd class='key-pair'>",
		"<input type='text' class='key {1}-key' name='param-key-{1}' value='{2}' placeholder='{2}' />",
		"<input type='text' class='value {1}-value' name='param-value-{1}' value='{2}' placeholder='{2}' />",
		"</dd>",
		"</dl>"
		];
	queryTemplate.setTags(ex);

	assert.equal(queryTemplate.config.html, ex.join(""), "can set html template from tags string array");		
	RenderElement([queryTemplate.child,1,2]);



	assert.equal($(PARENT)[0], $(queryTemplate.parent)[0], "can reference parent node");	
	assert.equal($(CHILD)[0], $(queryTemplate.child)[0], "can render child node");	
  	assert.equal(queryTemplate.config.index, 1, "index iteration after render 1 == " + queryTemplate.config.index);

});

QUnit.test( "ok test", function( assert ) {
  assert.ok( true, "true succeeds" );
  assert.ok( "non-empty", "non-empty string succeeds" );
 
  assert.ok( false, "false fails" );
  assert.ok( 0, "0 fails" );
  assert.ok( NaN, "NaN fails" );
  assert.ok( "", "empty string fails" );
  assert.ok( null, "null fails" );
  assert.ok( undefined, "undefined fails" );
});