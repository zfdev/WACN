/*! Azure UI v0.0.1*/
;
(function(win) {
	"use strict";
	win.AUI = win.AUI || {};
	AUI.VERSION = "0.0.1";
	AUI.Class = function(r, s) {
		var _mix = function(r, s){
			for(var p in s){
				if(s.hasOwnProperty(p)){
					r[p] = s[p]
				}
			}
		}
		var _extend = function(){
			var prototype = new this();
			var SubClass = function(){
				this.init.apply(this, arguments);
			}
			SubClass.prototype = prototype;
			SubClass.prototype.constructor = SubClass;
			return SubClass;
		}
		var Class = new Function();
		Class.extend = _extend;
		return Class;
	}
	AUI.Template = (function() {
		var cache = {};
		var tmpl = function(str, data) {
			// Figure out if we're getting a template, or if we need to
			// load the template - and be sure to cache the result.
			var fn = !/\W/.test(str) ?
				cache[str] = cache[str] ||
				tmpl(document.getElementById(str).innerHTML) :

				// Generate a reusable function that will serve as a template
				// generator (and which will be cached).
				new Function("obj",
					"var p=[],print=function(){p.push.apply(p,arguments);};" +

					// Introduce the data as local variables using with(){}
					"with(obj){p.push('" +

					// Convert the template into pure JavaScript
					str
					.replace(/[\r\t\n]/g, " ")
					.split("<%").join("\t")
					.replace(/((^|%>)[^\t]*)'/g, "$1\r")
					.replace(/\t=(.*?)%>/g, "',$1,'")
					.split("\t").join("');")
					.split("%>").join("p.push('")
					.split("\r").join("\\'") + "');}return p.join('');");

			// Provide some basic currying to the user
			return data ? fn(data) : fn;
		};
		return tmpl;
	})();

})(window);
;
(function(win) {
	"use strict";
	var AUI = win.AUI;
	//Throttle
	AUI.throttle = function(fFunction, nThreshhold, oScope){
		nThreshhold || (nThreshhold = 250);
		var nLast,
			oDeferTimer;
		return function(){
			var oContext,
				nNow,
				oArgs;
			oContext = oScope || this;
			nNow = +new Date();
			oArgs = arguments;
			if(nLast && (nNow < nLast + nThreshhold)){
				clearTimeout(oDeferTimer);
				oDeferTimer = setTimeout(function(){
					nLast = nNow;
					fFunction.apply(oScope, oArgs);	
				}, nThreshhold);					
			}else{
				nLast = nNow;
				fFunction.apply(oScope, oArgs);
			}
	
		}
	}
	
	//Local Storage
	AUI.Storage = (function() {
		var fLocalStorageSupported = function() {
			try {
				return !!win.localStorage;
			} catch (oErr) {
				return false;
			}
		}
		if (!fLocalStorageSupported()) {
			return;
		}
		var oStorage = win.localStorage;
		var fSerialize = function(oData) {
			return JSON.stringify(oData);
		}
		var fDeserialize = function(sData) {
			return JSON.parse(sData);
		}
		/**
		 * @param sKey {String} save index to local 
		 * @param oValue {Object} save data to local 
		 * @return oValue {Object} data
		 */
		var fSet = function(sKey, oValue) {
			if (oValue == undefined) {
				return fRemove(sKey);
			}
			oStorage.setItem(sKey, fSerialize(oValue));
			return oValue;
		}
		var fGet = function(sKey) {
			return fDeserialize(oStorage.getItem(sKey));
		}
		var fRemove = function(sKey) {
			oStorage.removeItem(sKey);
		}
		var fClear = function() {
			oStorage.clear();
		}
		var fGetAll = function() {
			var oAllData = {};
			fForEach(function(sIndex, oData){
				oAllData[sIndex] = fGet(sIndex);		
			});
			return oAllData;
		}
		var fForEach = function(fCallback) {
			for (var i = 0; i < oStorage.length; i++) {
				var sIndex = oStorage.key(i);
				fCallback(sIndex, fGet(sIndex));
			}
		}
		return {
			set: fSet,
			get: fGet,
			remove: fRemove,
			clear: fClear,
			getAll: fGetAll,
			forEach: fForEach
		}
	})();
	
	//Time and Date
	AUI.time = AUI.time || {};
	AUI.time.now = function() {
		var oTime = new Date();
		var sResult = "";
		var sDateSeparateSymbol = "-";
		var sTimeSeparateSymbol = ":";
		var fFormateTime = function(nTimeNumber) {
			return nTimeNumber < 10 ? ("0" + nTimeNumber) : nTimeNumber;
		}
		var nYear = oTime.getFullYear();
		var nMonth = oTime.getMonth() + 1;
		var nDay = oTime.getDate();
		var nHour = oTime.getHours();
		var nMinutes = oTime.getMinutes();
		var nSeconds = oTime.getSeconds();
		nHour = fFormateTime(nHour);
		nMinutes = fFormateTime(nMinutes);
		nSeconds = fFormateTime(nSeconds);
		sResult = nYear + sDateSeparateSymbol + nMonth + sDateSeparateSymbol + nDay + " " + nHour + sTimeSeparateSymbol + nMinutes + sTimeSeparateSymbol + nSeconds;
		return sResult;
	}

	//Debug Tools
	AUI.debug = AUI.debug || {};
	/**
	 * @param sTitle {String} Print debug Title
	 * @param sMsg {String} Print debug information
	 * @return undefined
	 **/
	AUI.debug.log = function(sTitle, sMsg) {
		if (win.console) {
			if (!arguments.length) {
				console.log(AUI.VERSION);
				return;
			}
			var sMsg;
			var sTitle;
			if (arguments.length == 1) {
				sTitle = "";
				sMsg = arguments[0];
			}
			if (arguments.length == 2) {
				sTitle = "[" + arguments[0] + "]";
				sMsg = arguments[1];
			}
			var oConfig = {
				timestampStyle: "color: #09a1d3",
				titleStyle: "color: #e66102",
				msgStyle: "color: #3e4c59"
			}
			var sTimestamp = AUI.time.now();
			var sLogInfo;
			if (typeof sMsg == "object") {
				var sLogInfoTimeStamp;
				sLogInfoTimeStamp = "%c[" + sTimestamp + "]%c";
				console.log(sLogInfoTimeStamp + sTitle + "\u2193", oConfig.timestampStyle, oConfig.titleStyle);
				console.dir(sMsg);
				return;
			}
			sLogInfo = "%c[" + sTimestamp + "]%c" + sTitle + "%c" + sMsg;
			console.log(sLogInfo, oConfig.timestampStyle, oConfig.titleStyle, oConfig.msgStyle);
		}
	}
})(window);