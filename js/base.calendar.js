/**
 * @author master
 * DHTMLX Calendar - inits
 */

var clsCalendar = {
	obj: null,
	div: '',
	format: {
		inline: 'ddmmyy'
	},
	inpBox: null, // input Box .. angeklicktes img ohne 'img_' 
	pos: {position: 'relative', top: 25, left: 15},
	
	init: function() {

    dhtmlXCalendarObject.prototype.langData["de"] = {
        dateformat:     '%d.%m.%Y',
        monthesFNames:  ["Januar", "Februar", "M\u00e4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
        monthesSNames:  ["Jan", "Feb", "M\u00e4r", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
        daysFNames:     ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
        daysSNames:     ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        weekstart:      1,
    };

		this.div = "calendar" || this.div;
		var _obj = new dhtmlxCalendarObject(this.div, true);

		_obj.draw();
		_obj.setSkin("dhx_skyblue");
		_obj.loadUserLanguage("de");
    _obj.hideTime();
    _obj.setDateFormat("%d.%m.%Y");    
    _obj.attachEvent("onClick", this.setDate.bind(this));
		this.obj = _obj;
	},
	
	/**
	 * Gibt formatierten Datumsstring zurück
	 * @param {js.Date} date
	 * @param {Text} format in PHP strftime(..) Notation
	 * @return {Text}
	 */
	format: function(date, format) {
		return this.obj.getFormatedDate(format, date);
	},

	/**
	 * Logik für Calendar an div anbinden
	 * @param {String} container - ID des div
	 * @param {func} cbFunc - Logik für Verarbeitung bei Änderungen
	 */	
	bindTo: function(container, cbFunc) {
		$("img_" + container).observe("click", this.toggle.bind(this));
		$(container).observe("change", this.calcDateFromInline.bind(this));
		$(container).observe("calendar:change", cbFunc);
	},
	
	toggle: function(event) {
		if (event != null) {
			var nd = Event.element(event);
			if (!$(this.div).visible()) {
				this.inpBox = $(nd.id.substring(4));
				//alert(objCalendar.inpBox.value);
				if (this.inpBox.value != "" && clsForm.prototype.Date.prototype.validate(this.inpBox.value)) 
          this.obj.setDate(this.inpBox.value); 
        else
          this.obj.setDate(new Date()); 
			}

			var pos = Position.positionedOffset(nd);
			//alert(pos[0]);
			if (this.pos.position == "relative")
				$(this.div).setStyle({left:(pos[0] + this.pos.left) + 'px', top:(pos[1] + this.pos.top) + 'px'});
			else
				$(this.div).setStyle({left:(this.pos.left) + 'px', top:(this.pos.top) + 'px'});
		}	
		$(this.div).toggle();
	},
	
	calcDateFromInline: function(event) {
		// dhtmlxCalendar[..].setFormatedDate(..) ist leider nicht zu gebrauchen, ohen delimiter
		if (event != null) {
			var inlineDiv = Event.element(event);
			var _val = inlineDiv.value;
			if (_val.length == 6) {
				var _day = _val.substr(0, 2);
				var _month = _val.substr(2, 2);
					_month--;
				var _year = _val.substr(4, 2);
					_year = (_year < 50 ? "20" : "19") + _year;
				var now = new Date(_year, _month, _day);
				inlineDiv.value = this.obj.getFormatedDate(null, now);
			}
		}
	},
	
	setDate: function(date) {
		var val = this.obj.getFormatedDate(null, date);
		if ($(this.inpBox).value != val) {
			$(this.inpBox).value = val;
			$(this.inpBox).fire("calendar:change");
		}
		this.toggle();
		return true;
	}
	
};

  document.observe("dom:loaded", function() {
		clsCalendar.init();
	});
