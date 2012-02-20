/**
 * geht bisher nur eine Instance .. 
 */
var clsUploader = Class.create();

clsUploader.prototype = {  

  obj: null,
  div: null,
  fileTypes: [],
  phpClassFolder: '/proxy-ajax.php?f=',
    
  initialize: function() {
    this.obj = new dhtmlXVaultObject(); 
    this.obj.setImagePath("/js/dhtmlx_30/skins/imgs/dhxvault_dhx_skyblue/"); 

    var _str = this.obj.strings;
    _str.remove = "Entfernen"; 
    _str.done   = "Fertig"; 
//    _str.error  = "Fehler"; 

    _str.btnAdd     = "Datei hinzuf\u00FCgen"; 
    _str.btnUpload  = "Hochladen"; 
    _str.btnClean   = "Leeren";
     
    _str.errors["TooBig"]   = "File zu gross ({0} bytes).\nMax allowed size is {1}."; 
    _str.errors["PostSize"] = "Undefined server error. Possible issues:\n"+ "- Unicode file name incorrectly processed by the server;\n"+ "- File size is bigger than server's post-request limit ({0})."; 

    this.obj.strings = _str;

    this.obj.setServerHandlers(
      this.phpClassFolder + "816112374f15b8a7a7c78", 
      this.phpClassFolder + "11515555794f15b8b3a80ee", 
      this.phpClassFolder + "19985632724f1690be14013"); 
  },

  setFileTypes: function(fileTypes) {
    this.fileTypes = fileTypes;
  },

  setFilesLimit: function(filesLimit) {
    this.obj.setFilesLimit(filesLimit);
  },
  
  init: function(div, fileLimit) {
    var args = $A(arguments);
    this.div = $(div);
    
    if (args.length > 1) this.obj.setFilesLimit(fileLimit); 

    if (this.fileTypes.length > 0) {
      this.obj.onAddFile = 
        function(fileName) { 
          var ext = this.obj.getFileExtension(fileName); 
          if (this.fileTypes.indexOf(ext) == -1) { 
            alert("Es werden nicht alle Dateierweiterungen akzeptiert.\nBitte probieren Sie es erneut!"); 
            return false; 
          } 
          else 
            return true; 
        }.bind(this);     
    }

    this.obj.create(div);
    
    // Breite der Button anpassen
    var panel = $$(".dhxvlt_panel2border");
    panel = panel[0];
    panel = panel.nextSiblings("div")[0];

    panel = panel.down("table.dhxvlt_panelbg").down("tr", 1);
    var tds = panel.childElements();
      tds[0].setStyle({width:"130px"});
      tds[1].setStyle({width:"150px"});
  },
  
  reset: function() {
    this.obj.removeAllItems();
    this.obj.uploadedCount = 0;
    this.obj.enableAddButton(true);
  }
  
};
