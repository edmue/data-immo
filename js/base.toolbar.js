var clsToolbar = Class.create()

clsToolbar.prototype = {
	
	obj: null,
	sets: $H({}),

	_initObj: function(btn, cbObject)
	{
		this.obj.setIconsPath("/images/icons/");

		var pos = 0;
		btn.each(function(it){
			if (it[0] == "sep") {
				this.obj.addSeparator("sep01", ++pos);
			}
			else {
				this.obj.addButton(it[0], ++pos, it[1], it[2] + ".png", it[2] + "_p.png");
				this.obj.disableItem(it[0]);
			}
		}.bind(this));

		this.obj.attachEvent("onClick", function(id){ this.onClick(id, cbObject)}.bind(this));
	},

	/**
	 * 
	 * @param {text} divName Id Container
	 * @param {array} btn [methode, description, img]
	 * @param {Object} cbObject
	 */
	initialize: function(divName, btn, cbObject)
	{
		if (clsToolbar.prototype.initialize.arguments.length == 0) return; // leeres Object

		$(divName).show();
		this.obj = new dhtmlXToolbarObject(divName, "dhx_skyblue"); // "AquaOrange");
		this._initObj(btn, cbObject);
	},
	
 	init: function() { /* additional inits */ },
	
	bindTo: function(objWnd, btn, cbObject) {
    var flgDisplay = ('getStyle' in objWnd) ? objWnd.getStyle('display') : "ignore";
		if (flgDisplay!='ignore') objWnd.show();

		this.obj = objWnd.attachToolbar();
		this.obj.setSkin("dhx_skyblue");
    if (flgDisplay!='ignore') objWnd.setStyle({'display': flgDisplay});

		this._initObj(btn, cbObject);
	},

  clear: function() {
    this.obj.clearAll();
  },
  
	addBtn: function(id, descr, img, pos) {
		if (id.indexOf("sep") > -1) {
			this.obj.addSeparator(id, descr);
		}
		else {
			this.obj.addButton(id, pos, descr, img + ".png", img + "_p.png");
			this.obj.disableItem(id);
		}
	},

  addTxt: function(id, descr, pos) {
    this.obj.addText(id, pos, descr);
  },
	
	enable: function(id){ this.obj.enableItem(id); },
	disable: function(id){ this.obj.disableItem(id); },

	addSet: function(id, arr) { this.sets.set(id, arr); },
	enableSet: function(id){ this.sets.get(id).each(function(it){ this.obj.enableItem(it); }.bind(this)) },
	disableSet: function(id){ this.sets.get(id).each(function(it){ this.obj.disableItem(it); }.bind(this)) },
	
	resize: function(width, xStatusBar) {
		this.obj.cont.setStyle({width: width + 'px'});
		this.obj.cont.addClassName("dhx_toolbar_base_resize");
		if (this.resize.arguments.length > 1) {
			xStatusBar.setStyle({top:'-7px'}); // margin ausgleichen
		}
	},
	
	onClick: function(id, obj)
	{
		//alert('click ' + id);
    if (id.indexOf("#") > -1) {
      cb = id.split("#");
      eval(cb[0] + "." + cb[1] + "();");
    }
    else 
  		obj[id]();
	}
	
}
/*
Event.observe(window, 'load', function(event) {
	objToolbar.init();
});
*/
