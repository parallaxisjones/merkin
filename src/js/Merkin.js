if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}
(function(w){

	var Merkin = function(config){
		var c = (config) ? config : {};
		var merkin = Merkin.extend(jQuery, this, c);
		return merkin.call(c, arguments[0], arguments[1]);
	};
	Merkin.prototype = Object.prototype;
	
	Merkin.prototype.map = function(fun){
      
      if (typeof fun != "function")
      throw new TypeError();
      
      var res = new Array(len);
      var thisp = arguments[1];
      var len = thisp.length;

      for (var i = 0; i < len; i++)
      {
         if (i in thisp)
         res[i] = fun.call(thisp, thisp[i], i, thisp);
      }
      return res;
   };

	Merkin.prototype.extend = function(){
	    for(var i=1; i<arguments.length; i++)
	        for(var key in arguments[i])
	            if(arguments[i].hasOwnProperty(key))
	                arguments[0][key] = arguments[i][key];
	    return arguments[0];
	};

	Merkin.prototype.actionFilter = function(context, callback){

		if(context && (callback && typeof callback === 'function')){
			return callback.apply(context, arguments);			
		}
	};

	var Resource = (function (window, document) {

	    return function (el) {
	        this.options = el;
	        this.get = get;

	        if (this === window) {
	            return new resource(el);
	        }
	    };

	    function get(options) {
	        this.options = Merkin.extend(this.options, options);

	        var supportsJSON = (function () {
	            if (typeof XMLHttpRequest == 'undefined') {
	                return false;
	            }
	            var xhr = new XMLHttpRequest();
	            xhr.open('get', '/', true);
	            try {
	                // some browsers throw when setting `responseType` to an unsupported value
	                xhr.responseType = 'json';
	            } catch (error) {
	                return false;
	            }
	            return 'response' in xhr && xhr.responseType == 'json';
	        }());

	        return new Promise(function (resolve, reject) {

	            var xhr = typeof XMLHttpRequest != 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

	            var responseTypeAware = 'responseType' in xhr;
	            var url = (typeof options === 'string') ? options : this.options.url;

	            xhr.open('get', this.options.url, !! resolve);
	            supportsJSON && (xhr.responseType = this.options.type || 'json');

	            xhr.onload = function () {
	                var status = xhr.status;

	                if (status == 200) {
	                    resolve(xhr.response);
	                } else {
	                    reject(status);
	                }
	            };

	            xhr.send();
	        });
	    }
	})(this, document);

	Resource.prototype = {
	    get: function (options) {
	        return this.get(options);
	    },
	    put: function () {},
	    post: function () {},
	    delete: function () {}
	}


	function Macro(macro, thing){
		if(!macro) throw new TypeError("you need to defined a macro");
		this.macro = macro;
		this.thing = thing;
	}

	Macro.prototype.get = function(m){
			if(m === this.macro && typeof this.thing === 'function') return this.thing();			
			if(m === this.macro) return this.thing;
	};

	Macro.prototype.check = function(stringToFilter){
		var match = stringToFilter.match(/{{\s*[\w\.]+\s*}}/g);
		
		if(match !== null ){
			var m = match.map(
			function(x) {
				console.log(x.match(/[\w\.]+/)); 
				return x.match(/[\w\.]+/)[0]; 
			})[0];
			if(m === this.macro){
				return true;	
			} 
		}
		return false;
	};	
	Macro.prototype.run = function(stringToFilter){
		var match = stringToFilter.match(/{{\s*[\w\.]+\s*}}/g);
		if(match !== null ){
			var m = match.map(
			function(x) {
				console.log(x.match(/[\w\.]+/)); 
				return x.match(/[\w\.]+/)[0]; 
			})[0];
			stringToFilter = stringToFilter.replace(/{{\s*[\w\.]+\s*}}/g, this.get(m));						
		}
		return stringToFilter;		
	};

	function Ensure(){}
	Ensure.prototype.isClass = function(string) {
		if(string.indexOf(".") == -1){
			string = "." + string;
		}
		return string;
	};

	function Template(options){
		this.config = (options) ? options : {};
		this.config.index = 0;
		Merkin.extend(this, options);					
	}

	Template.prototype = {
		config : {
			tags: [],
			html: "",
			index: 0
		}
	};

	Template.prototype.setTags = function(tags, filters) {
		var newT = Merkin.map(function(el, idx){
			el.format.apply(el, filters);
			return el;
		}, tags);
		// console.log(newT);
		this.config.tags = newT;

		this.config.html = tags.join("");
	};

	Template.prototype.appendNew = function(context, before, after) {
		context = (context) ? Merkin.extend({}, context, this.config) : {};

		if(before && typeof before === 'function'){
			//console.log(context);
			this.config.html = this.applyTagFilters(context, before);			
		}
		Merkin('dl').each(function(x){
			$(x).removeClass('active');
		});
		Merkin(this.config.parent).append(this.config.html);

		this.config.index++;
		if(after && typeof after === 'function'){
			console.log(Merkin("." + this.config.child + ":last-child"));
			after.apply({
				element: Merkin("." + this.config.child + ":last-child")
			}, arguments);			
		}
	
	};
	Template.prototype.removeLastChild = function(context, before, after) {
		context = (context) ? Merkin.extend({}, context, this.config) : {};

		if(before && typeof before === 'function'){
			//console.log(context);
			this.config.html = this.applyTagFilters(context, before);			
		}

		var elToRemove = '.' + this.config.child;
		console.log(elToRemove);
		$(elToRemove).each(function(idx, el){
			if($(el).hasClass('active')){
				var last = $(el).prev();
				$(el).remove();
				last.addClass('active');
			}
		});

		this.config.index--;

		if(after && typeof after === 'function'){
			//console.log(context);
			after.apply(this, arguments);			
		}
	
	};	

	Template.prototype.clearAll = function(before, after) {
		if(before && typeof before === 'function'){
			this.applyTagFilters(before);
		}

		$(this.parent).remove(this.classes);

		if(after && typeof before === 'function'){
			this.applyTagFilters(before);		
		}		
	};	

	Template.prototype.applyTagFilters = function(context, filter){
		var c = {};
		if(context)
		{
			Merkin.extend(c, context);			
		}
		var r = []; 
		if(c.tags && c.tags.length >  0)
		{
			var filtered = Merkin.map(function(el, idx){
				return Merkin.actionFilter(el, filter);
			}, context.tags);
			context.html = filtered.join("");
		}
		return context.html;
	};

	function Controls(options){
		this.options = {};
		Merkin.extend(this.options, options);
	}
	
	Controls.prototype.remove = function() {
		var ctrl = "." + this.options.class;
		$(this.options.parent).find('.active').remove();
		$('body').find(ctrl).remove();
	};

	Controls.prototype.add = function() {
		var el = '.' + this.options.elementClass;
		var ctrl = "." + this.options.class;		
		

		var $el = $(el);

		var $ctrl = $(ctrl);

		var add = document.createElement('img');
		add.src = this.options.src;
		add.height = this.options.height;
		add.width = this.options.width;
		// Merkin(add).each(function(x){
		// 	Merkin(x).empty();
		// })
		$(add).addClass(this.options.class);
		add.onclick = this.options.enact;

		$('.query-params:last-child').addClass("active");	

		$('dl.active dd').append(add);		
	};


	Merkin.Template = Template;
	Merkin.Control = Controls;
	Merkin.Ensure = Ensure;
	Merkin.Macro = Macro;
	Merkin.Resource = Resource;
	w.Merkin = Merkin;
})(window);