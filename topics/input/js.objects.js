var ObjectLayout = {
  
  init: function() {
    ObjectList.init();
    ObjectData.init();
    ObjectFilter.init();
    var toolbarCount = this.initToolbar();
    
    this.initEvents();

    ObjectData.objTabs.activate("tab_main");

// - debug -    

    Layout.toolbar.addBtn("sep01", ++toolbarCount);
    Layout.toolbar.addBtn("ObjectLayout#test", "test", "image_add", ++toolbarCount);
    Layout.toolbar.enable("ObjectLayout#test");

    //Layout.windows.filterObjects.show();
    ObjectData.objTabs.activate("tab_documents");

  },
  
  initToolbar: function() {
    var toolbarCount = 0;
    Layout.toolbar.clear();
    
    Layout.toolbar.addBtn("ObjectData#addHouse", "Geb\u00E4ude hinzuf\u00FCgen", "house_add", ++toolbarCount);
    Layout.toolbar.addBtn("ObjectData#addFlat", "Wohnung hinzuf\u00FCgen", "door_add", ++toolbarCount);
    Layout.toolbar.addBtn("ObjectData#save", "Speichern", "disk", ++toolbarCount);
    Layout.toolbar.addBtn("sep01", ++toolbarCount);

    Layout.toolbar.addBtn("ObjectData#remove", "L\u00F6schen", "house_delete", ++toolbarCount);
    Layout.toolbar.addBtn("ObjectDataPictures#add", "Bild hinzuf\u00FCgen", "image_add", ++toolbarCount);

    Layout.toolbar.addSet("ObjectDataSetData", ["ObjectData#remove", "ObjectDataPictures#add"]);

    Layout.toolbar.enable("ObjectData#addHouse");
        
    return toolbarCount;
  },
  
  initEvents: function() {
    
    document.observe("wndAddNew:click", ObjectData.add.bind(ObjectData, "fromWnd"));
    document.observe("form:change", ObjectData.changeForm.bind(ObjectData));
    document.observe("form:change", ObjectFilter.changeForm.bind(ObjectFilter));
    document.observe("tree:select", function(event) { ObjectData.load(event.memo.itemId); });
    document.observe("dhtmlxTree:xmlLoaded", function(event) { ObjectList.event.dhtmlxTree_xmlLoaded(event); });
    document.observe("lightbox:end", function(event) { ObjectData.renderSelects(ObjectData.kind) });
    
    // ein/ausklappen
    $$("div.fieldset_switch").each(function(nd){
      nd.select("td._pointer").invoke("observe", "click", this.toogleFieldset).invoke("observe", "fieldset:click", this.toogleFieldset);
    }.bind(this));
  },
  
  toogleFieldSetById: function(id, show){
    if (arguments.length == 1) show = true;
    $(id).down().next().down("td._pointer").fire("fieldset:click", {'show':show});
  },
  
  toogleFieldset: function(event) {
    var ndTbl = event.element().up("div").next("table");
    var ndsNavi = ndTbl.previous("div").select("td._pointer");
    var ndImg = ndsNavi[0].down("img");
    var ndTxt = ndsNavi[1];
    var visible = ndTbl.visible();
    if ((typeof event.memo) != "undefined" && visible == event.memo.show) return true;
    if (visible) {
      ndTbl.hide();
      ndImg.src = ndImg.src.replace(/eye_half/, "eye");
      ndTxt.innerHTML = "anzeigen";
    }
    else {
      ndTbl.show();
      ndImg.src = ndImg.src.replace(/eye/, "eye_half");
      ndTxt.innerHTML = "ausblenden";
    }
  },
  
  test: function() {
    ObjectLayout.toogleFieldSetById("Informationen_Haus", true);
  }
  
  
};

var ObjectList = {
  Toolbar: null,
  Tree: null,
  phpClass: "/proxy-ajax.php?f=4658332974f1be75dbc0fb&method=ajax",
  event:  {
    dhtmlxTree_xmlLoaded: Prototype.emptyFunction
  },

  init: function() {
    UtilDebug.debug("init ObjectList start ...");
    Layout.list.hideHeader();
    
    this.Toolbar = new clsToolbar();
    this.Toolbar.bindTo(Layout.list, [], this);
    this.initToolbar();

    this.Tree = Layout.list.attachTree();
    this.Tree.setImagePath("/js/dhtmlx_30/skins/imgs/csh_winstyle/");
    this.Tree.attachEvent("onSelect", this.selectItem.bind(this));
    
    this.Tree.setXMLAutoLoading(this.phpClass + "&action=getListXML");
    this.reload();
  },
  
  initToolbar: function() {
    this.Toolbar.obj.setIconsPath('/images/icons/');
    var toolbarCount = 0;

    this.Toolbar.addBtn("ObjectList#reload", "neu laden", "refresh", ++toolbarCount);
    this.Toolbar.addBtn("sep01", ++toolbarCount);
    this.Toolbar.addBtn("ObjectList#showFilter", "Filter", "filter_edit", ++toolbarCount);
    this.Toolbar.addBtn("ObjectFilter#clear", "Filter l\u00F6schen", "filter_delete", ++toolbarCount);

    this.Toolbar.enable("ObjectList#reload");
    this.Toolbar.enable("ObjectList#showFilter");
  },
  
  reload: function() {
    UtilDebug.debug("reload");

    if (UtilAjax.hasStatus()) $(UtilAjax.imgStatus).show();
    this.Tree.deleteChildItems("0");
    this.Tree.loadXML(this.phpClass + "&action=getListXML", function(){
      var firstItem = $$("div.dhxtree_dhx_skyblue")[0].down("table").down("tr");
      var count = firstItem.siblings().length;
      Layout.statusbar.setText("Liste mit " + count + " Eintr\u00E4gen geladen");
      if (UtilAjax.hasStatus()) $(UtilAjax.imgStatus).hide();
      this.event.dhtmlxTree_xmlLoaded();
    }.bind(this));
  },
  
  selectItem: function(id) {
    UtilDebug.debug("select id '" + id + "'");
    document.fire("tree:select", {itemId: id});
    //ObjectData.load(id);
    return true;
  },
  
  highlightItem: function(event) {
    UtilDebug.debug("dhtmlx Loaded on " + event.memo.id);
    this.Tree.selectItem(event.memo.id, false);
  },
  
  showFilter: function() {
    Layout.windows.filterObjects.show();
  }
  
};

var ObjectData = {
  kinds:    null,
  offers:   {
    rent: {
      priceName: "mtl. Kaltmiete",
      priceCarportName: "zus\u00E4tzliche Miete / EUR"
    },
    buy: {
      priceName: "Kaufpreis / Euro",
      priceCarportName: "zus\u00E4tzliche Kosten / EUR"
    },
    nn: {
      priceName: "Preis",
      priceCarportName: "zus\u00E4tzliche Kosten / EUR"
    }
  },
  kindIds:  $H({}),
  objTabs:  null,
  phpClass: "/proxy-ajax.php?f=4658332974f1be75dbc0fb&method=ajax",

  id:       '',
  parentId: null,
  kind:     '',
  objForm:  '',
  
  init: function() {
    UtilDebug.debug("init ObjectData start ...");

    // kinds nach ID umstellen    
    Object.keys(this.kinds).each(function(id){this.kindIds.set(this.kinds[id].id, id);}.bind(this));

    this.objTabs = new objTabBar();
    this.objTabs.tabImgPath = "tabImg/";
    this.objTabs.tabs = 
      [
        ["tab_main",        "Beschreibung"],
        ["tab_picture",     "Bilder"],
        ["tab_documents",   "Dokumente"]
      ];
    UtilDebug.debug("tabs init");

    this.objTabs.bindTo(Layout.desktop);
    this.objTabs.obj.attachEvent("onSelect", this.changeTab.bind(this));
    
    this.initForm();
    ObjectDataPictures.Uploader.init();
    UtilDebug.debug("init ObjectData success");
  },
  
  changeTab: function(idNew, idOld) {
    return true;
  },
  
  addHouse: function() { this.add("Haus"); },
  addFlat: function() { this.add("Wohnung"); },
    
  add: function(kind) {
    if (kind == "Haus" || kind == "Wohnung" ) {
      this.kind = kind;

      Layout.windows.addNew.setText(kind + " hinzuf\u00FCgen");
      Layout.windows.addNew.setIcon(this.kinds[kind].img + "_add.png", this.kinds[kind].img + "_add_p.png");
      Layout.windows.addNew.show();
    }
    
    else if (kind == "fromWnd") {
      var descr = $("el_objectsWndAddNew_name").value;
      UtilDebug.debug("add '" + descr + "'");

      UtilAjax.checkedRequest(
        this.phpClass + "&action=add", 
        {'topic'  : descr, 
         'idOld'  : this.id,
         'kind'   : this.kinds[this.kind].id }, 
        function(resp) {
          this.render(resp);
          // cb-function um Item anzumarkern
          ObjectList.event.dhtmlxTree_xmlLoaded = function(event) {
            ObjectList.highlightItem({memo : {id: this.id}});
            ObjectList.event.dhtmlxTree_xmlLoaded = Prototype.emptyFunction;
          }.bind(this);

          if (this.kindIds.get(this.kind) == "Wohnung")
            ObjectList.Tree.refreshItem(this.parentId);
          else
            ObjectList.reload();

        }.bind(this) );      

      Layout.windows.addNew.hide();
      $("el_objectsWndAddNew_name").value = "";
      
      ObjectData.objTabs.activate("tab_main");
    }
  },
  
  remove: function(kind, resp) {
    if (!kind) {
      dhtmlx.confirm({
        text: "aktuellen Eintrag endg\u00FCltig l\u00F6schen",
        ok: "L\u00F6schen", cancel: "Abbruch",
        callback: function(resp) {if (resp) this.remove("confirmed"); }.bind(this)
      });
    }
    
    else if (kind == "confirmed") {
      UtilDebug.debug("delete '" + this.id);
      UtilAjax.checkedRequest(this.phpClass + "&action=del&id=" + this.id, {}, function(resp) {
        this.remove("success", resp);
      }.bind(this));
    }

    else if (kind == "success") {
      UtilDebug.debug("delete success '" + this.id);

      this.objForm.clear();
      Layout.toolbar.disableSet("ObjectDataSetData");
      Layout.toolbar.disable("ObjectData#save");
      ObjectList.Tree.deleteItem(this.id, false);
      this.id = "";
    }

  },

  load: function(objectId) {
    UtilAjax.checkedRequest( this.phpClass + "&action=get", {'id': objectId }, this.render.bind(this) );      
  },
  
  render: function(resp) {
    var activeTab = this.objTabs.obj.getActiveTab();

    var obj = resp.evalJSON(); 
    this.id = obj.id;
    this.parentId = obj.parentId;
    this.kind = obj.kind;

    this.objForm.clear();
    this.objForm.render(obj);
    this.changeForm({target: {id:'_RENDER_'}, memo: {prefix:this.objForm.options.prefix} });
    ObjectDataPictures.load();
    
    if (this.kindIds.get(this.kind) == "Haus") {
      ["Informationen_Haus", "Ausstattung", "Kosten"].each(function(id){ ObjectLayout.toogleFieldSetById(id, true); });
      Layout.toolbar.enable("ObjectData#addFlat");
    }
    else if (this.kindIds.get(this.kind) == "Wohnung") {
      ["Informationen_Haus"].each(function(id){ ObjectLayout.toogleFieldSetById(id, false); });
      ["Ausstattung", "Kosten"].each(function(id){ ObjectLayout.toogleFieldSetById(id, true); });
      Layout.toolbar.disable("ObjectData#addFlat");
    }

    this.renderSelects(this.kind);
    Layout.toolbar.disable("ObjectData#save");
    Layout.toolbar.obj.setItemImage("ObjectData#remove", this.kinds[this.kindIds.get(this.kind)].img + "_delete.png");
    Layout.toolbar.obj.setItemImageDis("ObjectData#remove", this.kinds[this.kindIds.get(this.kind)].img + "_delete_p.png");
    Layout.toolbar.enableSet("ObjectDataSetData");
    
    ObjectDocuments.load(this.id);

    this.objTabs.obj.setTabActive(activeTab);
  },
  
  renderSelects: function(selectedType) {
    // -tab_main- einblenden ..
    var activeTab = this.objTabs.obj.getActiveTab();
    if(activeTab != "tab_main")
      this.objTabs.obj.setTabActive("tab_main");
    else
      activeTab = "";

    /* select fuer Haustypen */
    Object.keys(this.kinds).each(function(id){ 
      $("el_objectsTabMain_type_" + this.kinds[id].id).hide(); 
    }.bind(this));
    if (!selectedType) selectedType = this.kind == "" ? "dummy" : this.kind;
    $("el_objectsTabMain_type_" + selectedType).show();
    
    /* cnt fuer Auswahl Angebot (rent, buy) */
    var _offer = this.objForm.getValue("offer");
    if (_offer == undefined) _offer = "nn"; 

    if (_offer == "nn")
      ["Ausstattung", "Kosten"].each(function(id){ ObjectLayout.toogleFieldSetById(id, false); });
    
    Object.keys(this.offers).each(function(key){
      $N("cnt_objectsTabMain_" + key).each(function(id){
        if (_offer == key) Element.show(id); else Element.hide(id); 
      });
    }.bind(this));
    
    /* cnt fuer Auswahl Objekttype (wohnung, Haus) */
    var _kind = this.kind == "" ? "haus" : this.kindIds.get(this.kind).toLowerCase();
    
    Object.keys(this.kinds).each(function(key){
      $N("cnt_objectsTabMain_" + key.toLowerCase()).each(function(id){
        if (_kind == key.toLowerCase()) Element.show(id); else Element.hide(id); 
      });
    }.bind(this));
    
    /* switch Miete / Kaufpreis */
    $("cnt_objectsTabMain_basePrice").update( this.offers[_offer].priceName );
    $("cnt_objectsTabMain_parkingFee").update( this.offers[_offer].priceCarportName );    

    if(activeTab != "") this.objTabs.obj.setTabActive(activeTab);
  },
  
  initForm: function() {
    this.objForm = new clsForm([
      {type: 'text',    id: 'kind',  name: 'hidden',},
      {type: 'text',    id: 'topic', name: 'Bezeichung', php: 'topic'},
      {type: 'radio',   id: 'offer', name: 'Angebot', std: 'rent'},
      {type: 'check',   id: 'rentOver', name: 'unbefr. vermietet'},
      {type: 'date',    id: 'rented', name: 'Vermietet bis', empty:true},
      {type: 'text',    id: 'descriptionShort', name: 'Kurz-Beschreibung', std: "<< \u00DCberschrift >>"},

      {type: 'number',  id: 'basePrice', name: 'Kaufpreis'},
      {type: 'number',  id: 'baseSpaceLive', name: 'Wohnfläche'},
      {type: 'number',  id: 'baseSpaceLand', name: 'Fläche Grundstck.', format: ['.', ',', 0]},
      {type: 'number',  id: 'baseRooms', name: 'Anzahl Zimmer', format: ['.', ',', 0]},

      {type: 'text',    id: 'map', name: 'Lage', empty:true},
      {type: 'text',    id: 'adressPlz', name: 'Anschrift - PLZ', std: "<< PLZ >>"},
      {type: 'text',    id: 'adressOrt', name: 'Anschrift - Ort', std: "<< Ort >>"},
      {type: 'text',    id: 'adressStreet', name: 'Anschrift - Strasse', std: "<< Strasse, Hausnummer >>"},

      {type: 'text',    id: 'countStage', name: 'Anzahl Etagen', empty:true},
      {type: 'text',    id: 'buildYear', name: 'Baujahr', empty:true},
      {type: 'text',    id: 'updateYear', name: 'letzte Sanierung', empty:true},
      {type: 'select',  id: 'buildingQualitaeat', name: 'Qualität der Ausstatung'},
      {type: 'select',  id: 'buildingCondition', name: 'Objektzustand'},
      {type: 'select',  id: 'energyFirekind', name: 'Befeuerungsart'},
      {type: 'select',  id: 'energyKind', name: 'Heizungsart'},
      {type: 'select',  id: 'energyRatingType', name: 'Energieausweistyp'},
      {type: 'text',    id: 'energyRatingValue', name: 'Energieausweis Kennwert', empty:true},
      
      {type: 'text',    id: 'descriptionLong', name: 'Beschreibung'},
      {type: 'text',    id: 'sonst', name: 'Beschreibung Lage', empty:true},
      {type: 'select',  id: 'parkingType', name: 'Garagen / Stellplatz'},
      {type: 'number',  id: 'parkingCount', name: 'Anzahl Stellpl\u00E4tze', format: ['.', ',', 0]},
      {type: 'number',  id: 'parkingFee', name: 'Miete Stellplatz', format: ['.', ',', 2]},
      {type: 'number',  id: 'sleepingCount', name: 'Anz. Schlafzimmer', std: 1, format: ['.', ',', 0]},
      {type: 'number',  id: 'bathCount', name: 'Anz. Badezimmer', std: 1, format: ['.', ',', 0]},
      {type: 'text',    id: 'stage', name: 'Etage', empty:true},
      {type: 'check',   id: 'balkon'},
      {type: 'check',   id: 'garden'},
      {type: 'check',   id: 'root'},
      {type: 'check',   id: 'elevator'},
      {type: 'check',   id: 'guestwc'},
      {type: 'check',   id: 'kitchen'},
      {type: 'check',   id: 'handicappedFree'},
      {type: 'check',   id: 'pensioner'},
      {type: 'check',   id: 'historical'},
      {type: 'check',   id: 'leasure'},
      {type: 'check',   id: 'rent'},
      {type: 'number',  id: 'rentvalue', name: 'Mieteinnahmen', empty:true, format: ['.', ',', 2]},
      {type: 'check',   id: 'furniture'},
      {type: 'select',  id: 'pets', name: 'Haustiere'},
      

      {type: 'number',  id: 'priceRentAdditionel', name: 'Nebenkosten', empty:true, format: ['.', ',', 2]},
      {type: 'select',  id: 'priceHeatingInkl', name: 'inkl. Heizkosten'},
      {type: 'number',  id: 'priceHeating', name: 'Heizkosten', empty:true, format: ['.', ',', 2]},
      {type: 'number',  id: 'priceRentSummary', name: 'Gesamtmiete', empty:true, format: ['.', ',', 2]},

      {type: 'select',  id: 'prov', name: 'Provision'},
      {type: 'number',  id: 'provValue', name: 'Provision', empty:true, format: ['.', ',', 2]},
      {type: 'text',    id: 'provDescr', name: 'Hinweise Nebenkosten', empty:true}
      
    ], {prefix: 'el_objectsTabMain_', validStyle: {borderColor: '#DDDDDD'}});


    // in-field Hinweise on/off
    ["descriptionShort", "adressPlz", "adressOrt", "adressStreet"].each(function(id){
      this.objForm.attachEvent(id, "activate", function(frmElement, event){
        var nd = event.element();
        if (event.type == "focus") {
          if (nd.value == frmElement.std) nd.value = "";
        }
        else if (event.type == "blur") {
          if (nd.value == "") nd.value = frmElement.std;
        }
      });
    }.bind(this));
    
    // Objeckttypen hinzufuegen
    Object.keys(this.kinds).each(function(id){
      if (id != "dummy") {
        this.objForm.addElement(({type: 'select',  id: 'type_' + this.kinds[id].id, name: 'Immobilienart', std: this.kinds[id].std}));
      }
    }.bind(this));

    this.renderSelects();
    this.objForm.clear();
    
    document.fire("form:loaded", {prefix: 'el_objectsTabMain_'});    
  },

  changeForm: function(event) {
    if (event.memo.prefix != "el_objectsTabMain_") return;
    
    var elId = (event.target.id || event.target.name).replace(event.memo.prefix, "");
    var items = null;
    UtilDebug.debug("change " + elId + " in " + event.memo.prefix);
    
    // initial
    if (event.target.id == "_RENDER_") {
      ["priceHeatingInkl", "prov", "rent", "rentOver", "basePrice"].each(function(id){
        this.changeForm({target: {'id':id}, memo: {prefix:event.memo.prefix} });
      }.bind(this));
    }
    
    if (this.id == "") return; // kein Object gewaehlt
    if (event.memo.prefix == this.objForm.options.prefix) {
      Layout.toolbar.enable("ObjectData#save");
    }

    [
      ["priceHeatingInkl",  "priceHeating", "2734005974f192eb403a29", true],  /* Heizkosten inklusive? */
      ["prov",              "provValue",    "6755357764f192eb20394f", false], /* Provision ja/nein */    
      ["rent",              "rentvalue",    "on",                   , false], /* vermietet ja/nein */
      ["rentOver",          "rented",       undefined,              , false]  /* unbefristed vermietet */
    ].each(function(id){
      if (elId == id[0]) {
        if (this.objForm.getValue(elId) == id[2]) /* ja/nein Paare in DB */ {
          $N(this.objForm.options.prefix + id[1] + "_cnt").invoke("removeClassName", "disabled"); 
        }

        else {
          if (id[3]) this.objForm.setValue(id[1], 0);
          $N(this.objForm.options.prefix + id[1] + "_cnt").invoke("addClassName", "disabled"); 
          this.changeForm({target: {id:'priceHeating'}, memo: {prefix:this.objForm.options.prefix} });
        }
      }
    }.bind(this));

    /* Geamtmiete */
    items = ["basePrice", "priceRentAdditionel", "priceHeating"];
    if (items.indexOf(elId) > -1) {
      var val = 0;
      items.each(function(id){val += UtilNumber.eval( this.objForm.getValue(id) );}.bind(this));
      this.objForm.setValue("priceRentSummary", val);
    }

    if (elId == "offer") this.renderSelects();
  },
  
  save: function() {
    var isValid = false;
    if (this.objForm.getValue("offer") == "nn")
      isValid = this.objForm.validate(
        ["topic", "descriptionShort", "adressPlz", "adressOrt", "adressStreet",
          "countStage", "buildYear", "updateYear", "buildingQualitaeat", "buildingCondition",
          "energyFirekind", "energyKind", "energyRatingType", "energyRatingValue"]);
    else
      isValid = this.objForm.validate();
      
    if (isValid) {
      var data = this.objForm.serialize();
      UtilAjax.checkedRequest( this.phpClass + "&action=save&id=" + this.id, data, function(resp){
        var msg = resp;
        if (resp == "success") msg = "Daten erfolgreich gespeichert!";
        dhtmlx.alert(msg);
        Layout.statusbar.setText(msg);
      });
    }
  }
};

var ObjectDataPictures = {
  phpClass: "/proxy-ajax.php?f=14718122974f1bebc8a512e&method=ajax",
  colsMax: 5,
  pictures: null,
  pictureFirstMoveable: -1,
  
  load: function() {
    Layout.vault.obj.setFormField("objectId", ObjectData.id);

    UtilAjax.checkedRequest(
      this.phpClass + "&action=getList",
      {id: ObjectData.id},
      this.render.bind(this));
  },
  
  render: function(resp) {
    var respPictures = resp.evalJSON();
    this.pictures = Object.values(respPictures);
    this.pictureFirstMoveable = -1;
    
    while (Object.isFunction(this.pictures[this.pictures.length-1])) {
      this.pictures.pop();
    }

    // clear table    
    var ndTbl = $("tab_pictures_tbl").children[0];
    var rows = ndTbl.childElements();
    rows.each(function(row){row.remove()});
    
    // create table
    var col = 0;
    var row = 0;

    var htmlRow = ""
    row++;
    for (idx=0; idx<this.pictures.length; idx++) {
      if (this.pictureFirstMoveable == -1 && this.pictures[idx].editable) this.pictureFirstMoveable = idx;
      col++;
      htmlRow += this._getTemplate(this.pictures[idx], idx);
      if (col==this.colsMax) {
        htmlRow = "<tr id=\"tab_pictures_row_" + row + "\">" + htmlRow + "</tr>";
        ndTbl.insert(htmlRow);
        col= 0;
        row++;
        htmlRow = ""
      }
    }
    
    if (col > 0) {
      htmlRow = "<tr id=\"tab_pictures_row_" + row + "\">" + htmlRow + "</tr>";
      ndTbl.insert(htmlRow);
    }

    // events anbinden
    var nds = $$("#tab_pictures_tbl td.navi");
    nds.each(function (nd){
      nd.observe('click', this.eventNavi_OnClick.bindAsEventListener(this));
    }.bind(this));
  },
    
  add: function() {
    UtilDebug.debug("add img");

    ObjectData.objTabs.activate("tab_picture");    
    Layout.windows.upload.show();
    this.Uploader.setOnImage();
  },
  
  remove: function(id) {
    UtilDebug.debug("delete " + id);
    
    var tmplProps = this.pictures[id];
    this.move("last", id);
    
    UtilAjax.checkedRequest(
      this.phpClass + "&action=removePic",
      { oId: ObjectData.id, img: tmplProps.imgOrg }, 
      function() { Layout.statusbar.setText("Bild '" + tmplProps.imgOrg + "' gel\u00F6scht"); }
    );

    this.pictures.pop();
    $("picture_tmpl_" + this.pictures.length).up("td").remove();   
  },
  
  move: function(direction, id) {
    
    var picId     = [id, 0];
    var img       = ['', ''];
    var name      = ['', ''];
    var size      = ['', ''];
    var sizeClass = ['', ''];

    if (direction == "first" || direction == "last") {
      while( this.move((direction == "first" ? "previous" : "next"), id) ) {
        id += (direction == "first" ? -1 : 1);        
      }
    }
    
    if (direction == "next" || direction == "previous") {
      picId[1] = id + (direction == "next" ? 1 : -1);
      if (picId[1] < this.pictureFirstMoveable || picId[1] >= this.pictures.length) return false;
      for (i=0; i<2; i++) {
        img[i] = $("picture_tmpl_" + picId[i]).down("td.pic").down("img").src;
        name[i] = $("picture_tmpl_" + picId[i]).down("td.name").innerHTML;
        size[i] = $("picture_tmpl_" + picId[i]).down("td.size").innerHTML;
      }

      for (i=0; i<2; i++) {
        $("picture_tmpl_" + picId[i]).down("td.pic").down("img").src = img[i*-1+1];
        $("picture_tmpl_" + picId[i]).down("td.name").innerHTML = name[i*-1+1];
        $("picture_tmpl_" + picId[i]).down("td.size").innerHTML = size[i*-1+1];
      }
      
      var pic = this.pictures[picId[0]];
      this.pictures[picId[0]] = this.pictures[picId[1]];
      this.pictures[picId[1]] = pic;
      
      return true;
    }
  },

  eventNavi_OnClick: function(event) {
    var direction;
    var id;

    var el = event.element();
    //direction?
    a = el.src.split("/");
    a = a[a.length-1].split("_");
    direction = a[a.length-1].replace(".png", "");
    
    el = el.up("table");
    id = parseInt( el.id.replace("picture_tmpl_", "") );

    if (direction == "delete")
      this.remove(id);
    else
      this.move(direction, id);

   // sort an php
    var picList = "";
    this.pictures.each(function(it) {if (it.editable) picList += it.imgOrg + ";"; });
    UtilAjax.checkedRequest(this.phpClass + "&action=orderPic",
      { oId: ObjectData.id, list: picList},
      Prototype.emptyFunction);
  },

  _getTemplate: function(picture, id) {

    var imgThmb = "/" + picture.path + "/_thmb/" + picture.imgThmb;
    var imgLightbox = "/" + picture.path + "/_lightbox/" + picture.imgThmb;
    var innerHtml =
      "<td style=\"font-family:'Courier New', Courier, mono; font-size:12px\">"
+       "<table class=\"tmpl\" id=\"picture_tmpl_" + id + "\">"
+         "<tr>"
+           "<td class=\"pic\">"
+             "<a href=\"" + imgLightbox + "\" rel=\"lightbox[objectpics]\"><img src=\"" + imgThmb + "\"></a>"
+           "</td>"
+         "</tr>"
+         "<tr><td class=\"name\">" + picture.imgOrg + "</td></tr>"
+         "<tr><td class=\"size\">(B/H) " + UtilNumber.format(picture.width, ",", ".", 0) + " / " + UtilNumber.format(picture.height, ",", ".", 0) + "</td></tr>"
+         "<tr>"
+			      "<td class=\"navi\" id=\"navi_" + id + "\">"
+   (picture.editable ?      
	         	  "<img style=\"border: 1px solid gray\" src=\"/images/icons/bullet_arrow_first.png\">&nbsp;"
+	         	  "<img style=\"border: 1px solid gray\" src=\"/images/icons/bullet_arrow_previous.png\">&nbsp;&nbsp;&nbsp;"
+	         	  "<img style=\"border: 1px solid gray\" src=\"/images/icons/bullet_arrow_next.png\">&nbsp;"
+	         	  "<img style=\"border: 1px solid gray\" src=\"/images/icons/bullet_arrow_last.png\">&nbsp;&nbsp;&nbsp;"
+	         	  "<img style=\"float: right; padding-right:0px;\" src=\"/images/icons/delete.png\">&nbsp;"
    : 
              "<img style=\"border: 0px; width:16px\" src=\"/images/transparent.gif\">&nbsp;"
+             "<img style=\"border: 0px; width:16px\" src=\"/images/transparent.gif\">&nbsp;&nbsp;&nbsp;"
+             "<img style=\"border: 0px; width:16px\" src=\"/images/transparent.gif\">&nbsp;"
+             "<img style=\"border: 0px; width:16px\" src=\"/images/transparent.gif\">&nbsp;&nbsp;&nbsp;"
+             "<img style=\"border: 0px; width:16px\" src=\"/images/transparent.gif\">&nbsp;")
+			      "</td>"
+         "</tr>"
+       "</table>"
+     "</td>";
    return innerHtml;
  },

  _getTmplProps: function(id) {
    for (idx=0; idx<this.pictures.length; idx++) {
      if (this.pictures[idx].imgThmb == img) return this.pictures[idx];
    }
    return false;
  },

  Uploader: {
    classId: "21371061004f3a59fb4cb42",
    
    init: function() {
      Layout.vault.obj.setFormField("objectId", ObjectData.id);

      Layout.vault.obj.onUploadComplete = function(files) {
        this.load(this.id);
      }.bind(ObjectDataPictures);
    },
    
    setOnImage: function() {
      Layout.windowsPort.setHeader("wndUpload", "image_add", "Bild hinzuf\u00FCgen");
      Layout.vault.obj.setFormField("cid", this.classId);
      Layout.vault.setFileTypes(["jpg","gif"]);
      Layout.vault.setFilesLimit(0);
      Layout.vault.obj.onUploadComplete = function(files) {
        this.load(this.id);
      }.bind(ObjectDataPictures);
    }
      
  }
};

ObjectFilter = {
  phpClass: "/proxy-ajax.php?f=2321046954f216ac551e78&method=ajax",
  Toolbar: null,
  objForm: null,
  
  init: function() {
    
    this.Toolbar = new clsToolbar();
    this.Toolbar.bindTo(Layout.windows.filterObjects, [], this);
    this.Toolbar.addBtn("ObjectFilter#appendToList", "Filter \u00FCbernehmen", "filter_alert", 1);
    this.Toolbar.addBtn("ObjectFilter#clear", "Filter l\u00F6schen", "filter_delete", 2);
    this.Toolbar.addBtn("sep01", 3);
    this.Toolbar.addTxt("ObjectFilter#count", "<b>Anzahl Treffer: 0</b>", 4);
    
    this.Toolbar.enable("ObjectFilter#clear");
    this.Toolbar.enable("ObjectFilter#appendToList");
    
    this.objForm = new clsForm([
      {type: 'select',  id: 'kind'},
      {type: 'number',  id: 'priceFrom', name: 'Preis ab'},
      {type: 'number',  id: 'priceTo', name: 'Preis bis'},
      {type: 'number',  id: 'sizeFrom', name: 'Preis ab'},
      {type: 'number',  id: 'sizeTo', name: 'Preis bis'},
      {type: 'number',  id: 'roomsFrom', name: 'Preis ab', format: ['.', ',', 0]},
      {type: 'number',  id: 'roomsTo', name: 'Preis bis', format: ['.', ',', 0]}
      
    ], {prefix: 'el_objectsPopFilter_', validStyle: {borderColor: '#DDDDDD'}});
    
    document.fire("form:loaded", {prefix: 'el_objectsPopFilter_'});    
  },

  changeForm: function(event) {
    if (event.memo.prefix != "el_objectsPopFilter_") return;
    
    UtilAjax.checkedRequest(this.phpClass + "&action=set", this.objForm.serialize(), function(resp) {
      this.Toolbar.obj.setItemText("ObjectFilter#count", 
        "<b>Anzahl Treffer: " + resp + "</b>");
    }.bind(this));

  },
  
  appendToList: function() {
    this.changeForm({memo:{prefix:"el_objectsPopFilter_"}});
    Layout.windows.filterObjects.hide();
    ObjectList.reload();
  },
  
  clear: function() {},

  load: function() {},
  save: function() {},
  serialize: function(){},
  renderSelects: function() {}
  
}
