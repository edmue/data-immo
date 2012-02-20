var Layout = {

  SKIN:       'dhx_web',

  _box:         null,
  menu:         null,
  toolbar:      null,
  statusbar:    null,
  windowsPort:  null,
  windows:{
    upload:     null,
    addNew:     null,
    filterObjects: null
  },
  
  list:         null,
  desktop:      null,
  
  vault:        null,
  
  
  customImgPath: '/_mandanten/styles/wis-freiberg/dhtmlx_30/',
  dhtmlxImgPath: '/js/dhtmlx_30/skins/imgs/',

    
  init: function() {
    dhtmlx.message.defPosition="top";
    dhtmlx.image_path='./codebase/imgs/';

    this._box = new dhtmlXLayoutObject(document.body, '2U', this.SKIN);
    this.list = this._box.cells("a");
      this.list.setWidth(280);
      this.list.setText("Liste");
  
    this.desktop = this._box.cells("b");

    this.statusbar = this._box.attachStatusBar();
    this.initStatusbar();

    this.menu = this._box.attachMenu();
    this.initMenu();

    this.toolbar = new clsToolbar();
    this.toolbar.bindTo(this._box, [], this);
    
    this.initWindows("objects");

    document.fire("layout:loaded");
  },
  
  initMenu: function() {
    this.menu.setIconsPath(this.customImgPath + 'imgs/'); // / => _mandanten/_styles/wis-freiberg/dhtmlx_30/imgs/
    
    this.menu.addNewChild(null, 0, "main", "Datenbereich", "login", "login_off");
    this.menu.addNewChild(null, 1, "file", "Extras");
    this.menu.addNewSeparator("main", "sep_main_01"); // adding a separator        // or


    this.menu.addNewChild("main", 0, "file_new", "New", false); // adding a new child item

  },

  // hotkeys
  initToolbar: function() {
    this.toolbar.setIconsPath(this.customImgPath + 'imgs/');
    
    // neues Object ..
    // neuer Interessent ..

  },

  initStatusbar: function() {
    this.statusbar.setText("init ...");
  },
  
  initPopups: function(wndId) {
    var wnd = this.windows[wndId];
    wnd.show();

    if (wndId == "upload") {
      this.vault = new clsUploader(); 
      this.vault.init("objectWndUploadCont");
      wnd.attachEvent("onClose", this.vault.reset.bind(this.vault));
    } 
    
    if (wndId == "addNew") {
      $("img_objectsWndAddNew_add").observe("click", function() {document.fire("wndAddNew:click");});
    }

    wnd.hide();
  },
  
  initWindows: function(kind) {
    if (this.windowsPort == null) this.windowsPort = new xWindows(this.SKIN);
    
    if (kind == "objects") {
      //. new
      if (this.windows.addNew == null) {
        this.windows.addNew = this.windowsPort.getWindow("wndAddNew", 100, 100, 310, 150, "objects_wnd_addNew", "house_edit", "Geb\u00E4ude hinzuf\u00FCgen");   
        this.windows.addNew.centerOnScreen();
      }
      this.windowsPort.disableClose("wndAddNew");
      this.initPopups("addNew");

      //. upload
      if (this.windows.upload == null) {
        this.windows.upload = this.windowsPort.getWindow("wndUpload", 100, 100, 450, 286, "objects_wnd_upload", "image_add", "FILE hinzuf\u00FCgen");   
        this.windows.upload.centerOnScreen();
      }
      this.windowsPort.disableClose("wndUpload");
      this.initPopups("upload");
      
      //. Objectfilter
      if (this.windows.filterObjects == null) {
        this.windows.filterObjects = this.windowsPort.getWindow("wndFilterObjects", 100, 100, 450, 286, "pop_filterObjects_cont", "filter", "Objekte filtern");   
        this.windows.filterObjects.centerOnScreen();
      }
      this.windowsPort.disableClose("wndFilterObjects");
      this.initPopups("filterObjects");
    }
  },
  
  IEHack: {}
};