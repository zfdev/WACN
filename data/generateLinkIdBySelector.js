var oGenerateLinkIdBySelector = (function($){
	var oLinkIdData = {};
	var fGetAllLinkDom = function(o$Selector){
		return o$Selector.find('a');
	}
	var fGetLinkDomAttribute = function(o$LinkDom){
		var sLinkId = o$LinkDom.attr('id');
		if(sLinkId){
			var oLinkData = {}			
			var sHref = o$LinkDom.attr('href');
			var sTitle = o$LinkDom.text();
			sTitle = sTitle.trim();
			//console.log(sTitle);
			oLinkData[sTitle] = {};
			oLinkData[sTitle]['href'] = sHref;
			oLinkData[sTitle]['id'] = sLinkId;
			return oLinkData;
		}
		return null;
	}
	var fForEach = function(aLinks){
		oLinkIdData.allLinkIds = [];
		aLinks.each(function(index, element){
			oLinkIdData.allLinkIds.push(fGetLinkDomAttribute($(this)));	
		});
		oLinkIdData = JSON.stringify(oLinkIdData);
		console.log(oLinkIdData);
	}
	var fInit = function(o$Selector){
		fForEach(fGetAllLinkDom(o$Selector));	
	};
	return{
		init: fInit
	}
})(jQuery);

oGenerateLinkIdBySelector.init($('.page-header'));
