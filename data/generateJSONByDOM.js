var oGenerateNavigationJSON = (function($){
	var o$Navigation = $('.header .nav');
	var oOutPutData = {};
	var fGetDomAttributes = function(o$Dom){
		var oAttributes = {};
		var oDomAllAttr = o$Dom[0].attributes;
		var nAttributeLength = oDomAllAttr.length;
		for(var i=0; i<nAttributeLength; i++){
			oAttributes[oDomAllAttr[i].name] = oDomAllAttr[i].value;
		}
		return oAttributes;
	}
	var oAttrTest = fGetDomAttributes(o$Navigation);
	var fInit = function(){
		console.dir(oAttrTest);
		console.dir(oOutPutData);	
	};
	return{
		init: fInit
	}
})(jQuery);

$(function(){
	oGenerateNavigationJSON.init();
});
