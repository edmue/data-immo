/**
*   @desc:  TabBar Object
*   @param: parentObject - parent html object or id of parent html object
*   @param: mode - tabbar mode - top.bottom,left,right; top is default
*/
function objTabBar() 
{
	this.obj = null;
	this.div = "";
	this.tabs = [];
  this.skin = false;
	
	this.tabImgPath = "";
  this.skinImgPath = "";
}


/* *
 * Initialisierung
 */	
objTabBar.prototype._initObj = function(_obj)
{
	this.tabs.each(function(it) {
		if (it.length == 2) { // nur Text
			_obj.addTab(it[0], it[1]); 
		}
		else if (it.length == 3) { // nur Bild
			_obj.addTab(it[0],"<img src='" + this.tabImgPath + it[1] + ".gif' >", it[2]); 
		}
		else { // Kombination duch item[1] gekennzeichnet
			if (it[1] == "txt") { // einfacher Text
				_obj.addTab(it[0],it[2], it[3]); 
			}
			else if (it[1] == "img") { // img + text
				var _it = "<table style=\"margin-left:10px; margin-top:-2px\"><tr><td style=\"vertical-align:top\"><img src=\"/images/icons/" + it[2] + ".png\"></td><td>" + it[3] + "</td></tr></table>";
				_obj.addTab(it[0],_it, it[4]); 
			}
			else if (it[1] == "img_txt") { // NUR img - meist als TextBild
				_obj.addTab(it[0],"<img src=\"" + it[2] + ".png\">",it[3]); 
			}
		}

		_obj.setContent(it[0], it[0] + "_cont");
	}.bind(this));

	this.obj = _obj;
}	

objTabBar.prototype.bindTo = function(objWnd, direction)
{
  var flgDisplay = objWnd.getStyle('display');

	objWnd.show();
	var _obj = objWnd.attachTabbar();

	if (objTabBar.prototype.bindTo.arguments.length == 1) direction = "top";
	_obj.setAlign(direction);
	_obj.setImagePath(Layout.customImgPath + "imgs/");
	_obj.setSkin(Layout.SKIN || "dhx_blue");
	this._initObj(_obj);
	this.activate(this.tabs[0][0]);

	objWnd.setStyle({'display': flgDisplay});
};

objTabBar.prototype.init = function(direction)
{
	if (objTabBar.prototype.init.arguments.length == 0) direction = "top";
	var _obj = new dhtmlXTabBar(this.div ,direction); 
	_obj.setImagePath("/js/dhtmlx_25/skins/imgs/dhtmlx_tabbar/" + (this.skinImgPath || "skyBlue" ) + "/"); 
	_obj.setSkin(this.skin || "modern");
	this._initObj(_obj);
};
	
	/*
	 * alle Funktionen gelten den Tabs
	 */
objTabBar.prototype.disable = function(tab) 
{
	this.tabs.each(function(it) {
		if (it[0] == tab) {
			this.obj.disableTab(it[0]);
			this.obj.setLabel(it[0],"<img src='" + this.tabImgPath + it[1] + "_p.gif' >"); 
		}	
	}.bind(this));
}

objTabBar.prototype.enable = function(tab) 
{
	this.tabs.each(function(it) {
		if (it[0] == tab) {
			this.obj.enableTab(it[0]);
			this.obj.setLabel(it[0],"<img src='" + this.tabImgPath + it[1] + ".gif' >"); 
		}	
	}.bind(this));
}
	
objTabBar.prototype.activate = function(tab)
{
	var it = this._getIdx(tab);
	if (it == -1) {
		alert("keine ID '" + tab + "' in tab gefunden");
		return;
	}
	this.obj.setTabActive(it[0]);
}
	
objTabBar.prototype._getIdx = function(tabName)
{
	var ret = -1;
	this.tabs.each(function(it) {
		if (it[0] == tabName) {
			ret = it;
			throw $break;
		}	
	}.bind(this));
	return ret;
}

objTabBar.prototype.onClickTab = function(cntId, tab, func, tabId)
{
	//alert(tabId + " in " + cntId);		
	if (tabId == tab || tab=="ALL") func();
	return true;
}
	

//alert('load tabbarBase.js success!');