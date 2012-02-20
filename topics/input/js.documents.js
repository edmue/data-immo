var ObjectDocuments = {

  objectId: '',
  
  init: function() {
    
  },
  
  load: function(objectId) {
    this.objectId = objectId;
    this.Expose.load();
  },
  
  Expose: {
    phpClass: "/proxy-ajax.php?f=932e28246b2222e35fde70&method=ajax",
    tab_prefix: "objectsTabDocuments",
    id: "",
    
    onEvent: function(ev) {
      /* ## onClick ## */ 
      if (ev.type == "click") {
        
        if (ev.target.id == "bnt_objectsTabDocuments_exposeFileEdit") {
          Layout.windows.upload.show();
          ObjectDocuments.Uploader.setOnExpose();
        }
        
        else if (ev.target.id == "bnt_objectsTabDocuments_exposeFileRemove") {
          UtilAjax.checkedRequest( this.phpClass + "&action=removeItem", {'ctype':'expose', 'oid': ObjectDocuments.objectId }, this.load.bind(this, ObjectDocuments.objectId) );
        }
      }
    },
    
    load: function(objectId) {
      UtilAjax.checkedRequest( this.phpClass + "&action=getItem", {'ctype':'expose','oid': ObjectDocuments.objectId }, this.render.bind(this) );
    },

    render: function(resp) {
      if (resp == "") {
        // blende ..
        this.id = "";
        $("el_" + this.tab_prefix + "_exposeFileDate").update("");
        $("el_" + this.tab_prefix + "_exposeUploadDate").update("");
        $("bnt_" + this.tab_prefix + "_exposeFileShow").writeAttribute("href", "");
        
        $("bnt_" + this.tab_prefix + "_exposeFileShow").hide();
        $("blende_" + this.tab_prefix + "_exposeFileShow").show();
        $("bnt_" + this.tab_prefix + "_exposeFileRemove").setStyle({"cursor":"auto"});
        $("bnt_" + this.tab_prefix + "_exposeFileRemove").writeAttribute("src", $("bnt_" + this.tab_prefix + "_exposeFileRemove").src.replace(/file_pdf_delete.png/, "file_pdf_delete_p.png"));
      }
      else {
        // link
        var obj = resp.evalJSON();
        this.id = obj.id.split("/").last();
        $("el_" + this.tab_prefix + "_exposeFileDate").update(obj.dateFile);
        $("el_" + this.tab_prefix + "_exposeUploadDate").update(obj.dateUpload);
        $("bnt_" + this.tab_prefix + "_exposeFileShow").writeAttribute("href", obj.id);
        
        $("bnt_" + this.tab_prefix + "_exposeFileShow").show();
        $("blende_" + this.tab_prefix + "_exposeFileShow").hide();
        $("bnt_" + this.tab_prefix + "_exposeFileRemove").setStyle({"cursor":"pointer"});
        $("bnt_" + this.tab_prefix + "_exposeFileRemove").writeAttribute("src", $("bnt_" + this.tab_prefix + "_exposeFileRemove").src.replace(/file_pdf_delete_p.png/, "file_pdf_delete.png"));
      }
    }
  },
  
  Uploader: {
    classId: {'expose': '368626974f3a5a3022bd0'},
    
    init: function() {
      Layout.vault.obj.setFormField("objectId", ObjectData.id);
      Layout.vault.obj.onUploadComplete = function(files) {
        this.load(this.id);
      }.bind(ObjectDataPictures);
    },

    setOnExpose: function() {
      Layout.windowsPort.setHeader("wndUpload", "file_pdf", "Expose hinzuf\u00FCgen");
      Layout.vault.obj.setFormField("cid", this.classId.expose);
      Layout.vault.obj.setFormField("ctype", "expose");
      Layout.vault.setFileTypes(["pdf"]);
      Layout.vault.setFilesLimit(1);
      Layout.vault.obj.onUploadComplete = function(files) {
        ObjectDocuments.Expose.load(ObjectDocuments.objectId);
      }.bind(ObjectDocuments.Expose);
    }
    
  }
};