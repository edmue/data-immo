
/**
 * requires 
 * + prototypeJS
 * + util.js 
 * 
 */
var clsForm = Class.create({});

clsFormOptions = Object.extend({
  options: {
    prefix:     '',
    errMsg:     'Bitte geben Sie einen Wert in Feld %elName% an!',
    errStyle:   {borderColor: 'red'},
    validStyle: {borderColor: 'transparent'},
    std:        ''
  },

  optionsElement: {std: ''},
  optionsText:    {empty: false},
  optionsNumber:  {std: 0, format: ['.', ',', 2]}
  
});

clsForm.prototype = {
  
/** --------------- functions -------------------- */
  initialize: function(elements, options) {
    this.options = Object.extend(Object.clone(clsFormOptions.options), options||{});
    this.optionsElement = Object.clone(clsFormOptions.optionsElement);
    this.optionsText = Object.extend(Object.clone(this.optionsElement), clsFormOptions.optionsText);
    this.optionsNumber = Object.extend(Object.clone(this.optionsElement), clsFormOptions.optionsNumber);
    UtilDebug.debug("init Form(" + this.options.prefix + ") start ..");

    this.elements = elements || [];
    for (idx=0; idx<this.elements.length; idx++) {
      this.initElement(this.elements[idx]);
    }

    document.observe("form:loaded", function (event) {
      if (event.memo.formPrefix == undefined || event.memo.formPrefix + "_" == this.options.prefix ) {
        UtilDebug.debug("add events: (" + this.options.prefix + ") " + this.elements.length + " | " + this.elements[0].id);
        
        var nodes = this._getElememts();
        for (idx=0; idx<nodes.length; idx++) {
          UtilDebug.debug("add event (" + nodes[idx].id + ") '");
          Event.observe(nodes[idx], "change", function(event){
            Event.element(event).fire("form:change", {prefix: this.options.prefix });
          }.bind(this));
        }

        for (idx=0; idx<this.elements.length; idx++) {
          if (this.elements[idx].type == "number") {
            var elObj = $(this.options.prefix + this.elements[idx].id);
            elObj.observe("change", this.formatNumber.bindAsEventListener(this, this.elements[idx]));
          }
        }

      }
    }.bind(this));   

    UtilDebug.debug("init Form(" + this.options.prefix + ") success!");
  },

  addElement: function(element) {
    this.elements.push(element);
    this.initElement(element);
  },
  
  initElement: function(element) {
    // php generieren
    if ((typeof element.php) == "undefined") element.php = element.id;
    // form-Name generieren
    if (element.type != "radio")
      if ($(this.options.prefix + element.id) == null) 
        UtilDebug.error("element '" + (this.options.prefix + element.id) + "' is null");
      else
        $(this.options.prefix + element.id).setAttribute("name", this.options.prefix + element.id);
  },
  
  validate: function(testElements) {
    valid = true;
    for (idx=0; idx<this.elements.length; idx++) {
      var el = this.elements[idx];
      var elObj = new clsForm.prototype[el.type.capitalize()](this, el);
      if (!testElements || testElements.indexOf(el.id) > -1)
        valid = elObj.validate();
      else 
        valid = true;

      if (!valid){
        elObj.setErrorStyle(true);
        var errMsg = elObj.options.errMsg;
        errMsg = errMsg.replace(/%elName%/, el.name);
        alert(errMsg);
        return false;
      }
      else
        elObj.setErrorStyle(false);
       
    }

    return true;
  },
  
  serialize: function() { 
    var hash = Form.serializeElements(this._getElememts(), true);
    hash["_prefix"] = this.options.prefix;
    return hash;
  },
  
  getValue: function(id, prefix) {
    if (!prefix) prefix = this.options.prefix;
    var obj = Form.serializeElements($N(prefix + id), true);
    return obj[prefix + id];
  },
  
  setValue: function(id, value) {
    var el = this._getElememt(id);
   (new clsForm.prototype[el.type.capitalize()](this, el)).set(value);
  },
  
  // object
  _getElememt: function(id) {
    for (idx=0; idx<this.elements.length; idx++) {
      if (this.elements[idx].id == id) return this.elements[idx];
    }
    return null;
  },

  // nodes
  _getElememts: function() {
    var elArr = [ ];
    for (idx=0; idx<this.elements.length; idx++) {
      var nds = $A( document.getElementsByName(this.options.prefix + this.elements[idx].id) ); 
      nds.each(function(nd){ elArr.push(nd); });
    }
    return elArr;
  },
  
  clear: function() {
    for (idx=0; idx<this.elements.length; idx++) {
      (new clsForm.prototype[this.elements[idx].type.capitalize()](this, this.elements[idx])).clear();
    }
  },
  
  render: function(valueMap) {
    for (idx=0; idx<this.elements.length; idx++) {
      if ( (typeof valueMap[this.elements[idx].php]) != "undefined" ) {
        (new clsForm.prototype[this.elements[idx].type.capitalize()](this, this.elements[idx])).set(valueMap[this.elements[idx].php]);
      }
    }
  },
  
  attachEvent: function(id, eventName, func) {
    var element = this._getElememt(id);
    var idx = 0;

    if (eventName == "activate") {
      this.attachEvent(id, "focus", func);
      this.attachEvent(id, "blur", func);
    }
    
    else {
      var nodes = $(document.getElementsByName(this.options.prefix + this.elements[idx].id));
      for (idx=0; idx<nodes.length; idx++) {
        UtilDebug.debug("add event '" + eventName + "' (" + nodes[idx].name + ") '");
        Event.observe(nodes[idx], eventName, func.bind(this, this._getElememt(id)));
      }
    }    
  },
  
  formatNumber: function(event, element) {
    //var element = Event.element(e);
    UtilDebug.debug('fire event (format) on ' + element.id);
    el = new clsForm.prototype[element.type.capitalize()](this, element);
    el.format();
  },
  
  toString: function() {
    return "util.UtilForm::" + this.options.prefix;
  }
};
  
/** --------------- Input Typen -------------------- */
clsForm.prototype.Text = Class.create({
    options: {},
    superclass: null,
    initialize: function(utilForm, element) {
      this.superclass = utilForm;
      this.options = Object.clone(this.superclass.options);
      Object.extend(this.options, this.superclass.optionsText);
      Object.extend(this.options, element);
    },

    validate: function(){
      return (this.options.empty || $(this.superclass.options.prefix + this.options.id).value.strip() != '');
    },
 
    setErrorStyle: function(show){
      if (show)
        $(this.superclass.options.prefix + this.options.id).setStyle(this.options.errStyle);
      else
        $(this.superclass.options.prefix + this.options.id).setStyle(this.options.validStyle);
    },
    
    clear: function() {
      $(this.superclass.options.prefix + this.options.id).value = this.options.std;
    },
    
    set: function(val) {
      $(this.superclass.options.prefix + this.options.id).value = val;
    }
});

clsForm.prototype.Date = Class.create(clsForm.prototype.Text, {

    validate: function(value) {
      if (!value)
        value = $(this.superclass.options.prefix + this.options.id).value.strip();

      if (this.options.empty && value == '')
        return true;
      else {
        value = value.toString();
        value = value.split(".");
        if (value.length!=3) return false;
        
        value[0] = parseInt(value[0],10); if (isNaN(value[0])) return false;
        value[1] = parseInt(value[1],10)-1; if (isNaN(value[1])) return false;
        if (value[2].length==2) value[2] = "20" + value[2];  if (isNaN(value[2])) return false;
       
        // Kontrolle       
        var dateControll = new Date(value[2],value[1],value[0]);
        if (dateControll.getDate()==value[0] 
            && dateControll.getMonth()==value[1] 
            && dateControll.getFullYear()==value[2])
          return true; 
        else 
          return false;
      }
    }
});

clsForm.prototype.Number = Class.create(clsForm.prototype.Text, {
    options: {},
    superclass: null,
    initialize: function(utilForm, element) {
      this.superclass = utilForm;
      this.options = Object.clone(this.superclass.options);
      Object.extend(this.options, this.superclass.optionsNumber);
      Object.extend(this.options, element);
    },
    
    format: function() {
      var elId = this.superclass.options.prefix + this.options.id;
      //alert('jep - ' + elId);
      var _elNode = $(elId);
      var _elVal = _elNode.value.strip();
      var _val = UtilNumber.eval( (_elVal == "") ? 0 : _elVal );
      if (!isNaN(_val))
        _elNode.value = UtilNumber.format( _val, this.options.format[1], this.options.format[0], this.options.format[2] );
    },

    validate: function(){
      var _elVal = $(this.superclass.options.prefix + this.options.id).value.strip();
      return (((this.options.empty||false) || _elVal!="") && !isNaN(UtilNumber.eval(_elVal)) );
    },

    clear: function() {
      $(this.superclass.options.prefix + this.options.id).value = this.options.std;
    },

    set: function(val) {
      if (!isNaN(val) || val.strip() != "")
        $(this.superclass.options.prefix + this.options.id).value = UtilNumber.format( val, this.options.format[1], this.options.format[0], this.options.format[2]);
    }
});

clsForm.prototype.Radio = Class.create({
    options: {},
    superclass: null,
    initialize: function(utilForm, element) {
      this.superclass = utilForm;
      this.options = Object.clone(this.superclass.options);
      Object.extend(this.options, element);
    },

    validate: function(){
      return true;
    },

    setErrorStyle: function(show){ return; },
    
    clear: function() {
      if (this.options.std == "")
        (document.getElementsByName(this.superclass.options.prefix + this.options.id)[0]).checked = true;
      else
        this.set(this.options.std);
    },
    
    set: function(val) {
      var _name = this.superclass.options.prefix + this.options.id;
      var _el = document.getElementsByName(_name);
      for (i = 0; i < _el.length; i++) {
        if (_el[i].value == val) {
          _el[i].checked = true;
          return;
        }
      }
    }
});

clsForm.prototype.Check = Class.create(clsForm.prototype.Radio, {

    clear: function() {
      if (this.options.std == "")
        $(this.superclass.options.prefix + this.options.id).checked = false;
      else
        this.set(this.options.std);
    },

    set: function(val) {
      if (val=="false" || val=="off")
        $(this.superclass.options.prefix + this.options.id).checked = false;
      else
        $(this.superclass.options.prefix + this.options.id).checked = true;
    }
});

clsForm.prototype.Select = Class.create({
    options: {},
    superclass: null,
    initialize: function(utilForm, element) {
      this.superclass = utilForm;
      this.options = Object.clone(this.superclass.options);
      Object.extend(this.options, element);
    },

    validate: function(){
      return true;
    },
    
    setErrorStyle: function(show){ return; },
    
    clear: function() {
      if (this.options.std == "")
        $(this.superclass.options.prefix + this.options.id).value 
          = $(this.superclass.options.prefix + this.options.id).options[0].value;
      else
        $(this.superclass.options.prefix + this.options.id).value = this.options.std;    
    },
    
    set: function(val) {
      $(this.superclass.options.prefix + this.options.id).value = val;
    }
});
