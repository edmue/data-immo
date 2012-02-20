var xWindows = Class.create({
	
	xObj: null,
	xStatutsBar: null,
	htmlCnt: $H({}),
		
	initialize: function()
	{
		var setViewPort = true;
		var args = $A(arguments);
		if (args.length == 1) {
			setViewPort = args[0]["setviewport"];			
		}
		this.xObj = new dhtmlXWindows();	
		//this.xObj.setSkin("aqua_orange");  		
		this.xObj.setSkin("dhx_skyblue");  	// aqua Skins werden nicht mehr unterstütz .. Orange über eingenen Skin .. /styles/dhmlxWindows_customer.css	
		this.xObj.setImagePath("/images/icons/");  
		
/*
 * 	Probleme mit den unterhalb liegenden Controlls
		if (setViewPort) {
			this.xObj.enableAutoViewport(false);
			this.xObj.setViewport(10, 60, 1115, 575, $("body"));		
	 		KV.initScreen(function(_w){
				this.xObj.setViewport(10, 60, _w - 10, 575, $("body"));		
			}.bind(this));
		}
 */
	},
	
	getWindow: function(id, x, y, width, height, cntId, img, topic)
	{
		if (cntId != "") 
			this.htmlCnt.set(id, [cntId, $(cntId).innerHTML]);	

		this.xObj.createWindow(id, x, y, width, height);
		var wnd = this.xObj.window(id);
		
		wnd.setIcon(img + ".png", img + ".png");
		wnd.button("park").hide();
    wnd.button("minmax1").hide();
		wnd.setText(topic);
		if (cntId != "") wnd.attachObject(cntId);
		wnd.hide();
		//wnd.keepInViewport(true);
		this.xObj.addShadow(wnd);
		return wnd;
	},
	
	disableClose: function(id)
	{
		var wnd = this.xObj.window(id);
		wnd.attachEvent("onClose", function(){
			wnd.hide();
			return false;
		}.bind(this));
	},
	
	attachStatusBar: function(xWnd, styleName) 
	{
		xWnd.show();
		xWndStatusBar = xWnd.attachStatusBar();
		xWndStatusBar.setText("");
		if (this.attachStatusBar.arguments.length == 2) 
			xWndStatusBar.addClassName("dhxcont_sb_container_" + styleName);
		xWnd.hide();
		return xWndStatusBar;
	},
  
  setHeader: function(id, img, text) {
    var wnd = this.xObj.window(id);
    wnd.setIcon(img + ".png", img + ".png");
    wnd.setText(text);
  }

});