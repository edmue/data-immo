
function $N(name, doc) {
  var arrNames = $A((doc || document).getElementsByName(name));
  var arrClass = $$("." + name);
  
  var arrElements = arrNames.concat(arrClass);
  return arrElements.uniq();
};

var UtilDebug = {
  debugEnable: true,
  debug: function(msg) {
    if ((typeof dhtmlx.message) != "undefined" && this.debugEnable) 
      dhtmlx.message(msg);
      
    else if ((typeof console.debug) != "undefined" && this.debugEnable) 
      console.debug(msg);

    else if (this.debugEnable) {
      var _body = $("_debug").innerHTML;
      var rows = _body.split("<br>");
      rows.push(msg);
      if (rows.length > 50) {
        rows.shift();
      }
      
      $("_debug").update(rows.join("<br>"));
    }
  },

  error: function(msg) {
    if ((typeof console.debug) != "undefined" && this.debugEnable) 
      console.error(msg);
  }
  
};

/**
 * mapper fuer prototype Ajax.Request
 * @param {Ajax ResponseMsg} resp
 * @param {Function} cbFunc
 */ 
var UtilAjax = {
  imgStatus: "_httpxLoad",
  hasStatus: function() { return $(this.imgStatus) != null; }
};

UtilAjax.request = function(url, param, cbFunc)
{
  if (this.hasStatus()) $(this.imgStatus).show();
  new Ajax.Request(url, {
    method: "post",
    parameters: param,
    onComplete: function(msg){if (this.hasStatus()) $(this.imgStatus).hide(); cbFunc(msg);}.bind(this),
    onFailure: function(msg){if (this.hasStatus()) $(this.imgStatus).hide(); UtilAjax.errorAjax(msg);}.bind(this)
  });
};

/**
 * Prüft, ob response mit 'okay|' beginnt und übergibt die Steuerung an cbFunc
 * @param {Ajax ResponseMsg} resp
 * @param {Function} cbFunc
 */ 
UtilAjax.response = function(resp, cbFunc)
{
  if (/^okay/.test(resp.responseText)) 
    cbFunc(resp.responseText.substring(5));
  else 
    alert(resp.responseText);
};

/** 
 * Kombination aus Util.request und Util.response
 */ 
UtilAjax.checkedRequest = function(url, param, cbFunc)
{
  this.request(
    url, 
    param,
    function(resp){ 
      this.response(resp, cbFunc); 
    }.bind(this)
  );
};
  
UtilAjax.errorAjax = function() 
{
    alert("FEHLER BEIM SENDEN");
};

var UtilNumber = {};

/**
 * prüft auf gültiges (deutsches) Zahlenformat und formatiert die Zahl dann
 * bei falschen Format wir der String zurück gegeben
 */
UtilNumber.handle = function(expr, dec, sep, digits)
{
  if (expr.strip() == "") return "";  
  d = this.eval(expr);
  if (isNaN(d)) d = 0;
  return this.format(d, dec, sep, digits);
};

/**
 * Prüft den übergebenen String auf Numeric, dabei wird deutsches Format akzeptiert
 * @param {Text} expr
 * @return {float}
 */ 
UtilNumber.eval = function(expr) {
  if(!isNaN(expr)) return parseFloat(expr);   
  expr = expr.replace(/\%/g,"");
  expr = expr.replace(/\./g,"");
  if(!isNaN(expr)) return parseFloat(expr);   
  if (expr.strip() == "") return 0; 

  expr = expr.replace(/\,/g,"|");
  expr = expr.replace(/\./g,"");
  expr = expr.replace(/\|/g,".");
  if(isNaN(expr)) return Number.NaN;    
  return parseFloat(expr);
};
  
/**
 * gibt formatierten Zahl zurück
 * @param {float} num
 * @param {text} decpoint
 * @param {text} sep
 */
UtilNumber.format = function(num, dec, sep, digits)
{
  if(arguments.length<2){dec=",";}
  if(arguments.length<3){sep=".";}
  if(arguments.length<4){digits=-1;}
  num=num.toString();

  var isNeg = false;

  if (num != "") {
    var isNeg = (num.substring(0,1) == "-");
    if (/^(\+|-)/.test(num)) {
      num = num.substr(1);
    }     
  }
  decpoint = ".";
  a=num.split(decpoint);
  x=a[0];
  y=a[1];
  z="";
  if(typeof(x)!="undefined"){
    for(i=x.length-1;i>=0;i--) { z+=x.charAt(i); }
    z=z.replace(/(\d{3})/g,"$1"+sep);
    if(z.slice(-sep.length)==sep) { z=z.slice(0,-sep.length); }
    x="";
    for(i=z.length-1;i>=0;i--) { x+=z.charAt(i);  }
    if(typeof(y)=="undefined") { y=""; }
    for(i=y.length;i<digits;i++) { y+="0";  }
    if(typeof(y)!="undefined" && y.length>0) {  x+=dec+y; }
  }
  return (isNeg ? "-" : "") +  x;
};

UtilNumber.evalAndFormat = function(expr, dec, sep, digits)
{
  var num = this.eval(expr);
  if (isNaN(num)) num = 0;
  
  return this.format(num, dec, sep, digits);
 }

/**
 * take the idee by http://www.jslab.dk/library/date.format
 * @param {Object} s - format
 */
Date.prototype.format = function(s) 
{
  s = s.split('');
  var l = s.length;
  var r = '';
  var n = m = null;
  for (var i=0; i<l; i++) {
  switch(s[i]) {
    // Day of the month, 2 digits with leading zeros: 01 to 31
    case 'd':
      n = this.getDate();
      if (n * 1 < 10) r += '0';
      r += n;
      break;

    // Day of the month without leading zeros:   1 to 31
    case 'j':
      r += this.getDate();
      break;

    // Numeric representation of the day of the week: 0 (for Sunday) through 6 (for Saturday) 
    case 'w':
      r += utc ? this.getUTCDay() : this.getDay();
      break;

    // Numeric representation of a month, with leading zeros 01 through 12 
    case 'm':
      n = this.getMonth();
      n++;
      if (n < 10) r += '0';
      r += n;
      break;

    // Numeric representation of a month, without leading zeros:  1 through 12 
    case 'n':
      n = this.getMonth();
      r += ++n;
      break;

    // A full numeric representation of a year, 4 digits
    case 'Y':
      r += this.getFullYear();
      break;
    // A two digit representation of a year
    case 'y':
      n = this.getFullYear();
      r += (n + '').substring(2);
      break;

    // 24-hour format of an hour with leading zeros 00 through 23 
    case 'H':
      n = this.getHours();
      if (n < 10) r += '0';
      r += n;
      break;
    // i Minutes with leading zeros 00 to 59 
    case 'i':
      n = this.getMinutes();
      if (n < 10) r += '0';
      r += n;
      break;
    // s Seconds, with leading zeros 00 through 59 
    case 's':
      n = this.getSeconds();
      if (n < 10) r += '0';
      r += n;
      break;
    // Milliseconds
    case 'u':
      r += this.getMilliseconds();
      break;
    default:
      r += s[i];
      }
    }
    return r
  

};

/**
 * code by http://Coding.binon.net/NumLib (cybaer@binon.net)
 * Ermittle korrekte Nachkommaanteil 131203'
 */
Object.extend(Math, {
  /* Ermittle korrekte Nachkommaanteil 131203' */
  getFrac: function(num) {
    num = "" + num;
    return parseFloat("0." + num.substring(num.length-((num.indexOf(".")>=0) ? num.length-num.indexOf(".")-1 : 0),num.length));
  },

 /* Formatierung des Integerbereichs */ 
  formatInteger: function(num,size,prefix) { 
    prefix=(prefix)?prefix:"0"; 
    var minus=(num<0)?"-":"";
    result=(prefix=="0")?minus:""; 
    num=Math.abs(parseInt(num,10)); 
    size-=(""+num).length; 
    for(var i=1;i<=size;i++) { result+=""+prefix; } 
    result+=((prefix!="0")?minus:"")+num; 
    return result; 
  }
});

Cookie = {
  msg: [],

  get: function(name, defaultVal) {
    var retVal = null;

    if (!document.cookie) return defaultVal;
    if (Cookie.msg.length == 0) {
      Cookie.msg = document.cookie.split(";");
    }

    Cookie.msg.each(function(val, idx){
      var el = val.split("=");
      if (el[0].strip() == name) {
        retVal = el[1];
      }
    });
    
    if (retVal == null)
      return defaultVal;
    else
      return retVal;
  }
}
