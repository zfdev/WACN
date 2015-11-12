var App = (function($, AUI, win, doc) {
	"use strict";
	var log = AUI.debug.log;
	//Config
	var oConfig = {
		breakPoint: {
			min: {
				mobile: 320,
				tablet: 768,
				desktop: 980,
				large: 1280
			},
			max: {
				mobile: 321,
				tablet: 769,
				desktop: 981,
				large: 1281
			}
		}
	}
	var bIsMobileMode = false;
	var bIsTabletMode = false;
	var bIsDesktopMode = false;
	var o$win = $(win);
	var o$Doc = $(doc);

	//View Mode
	var oTestScreen = (function() {
		var fTestScreen = function() {
			if (win.matchMedia) {
				bIsMobileMode = win.matchMedia("only screen and (max-width: " + oConfig.breakPoint.max.tablet + "px)").matches;
				bIsTabletMode = win.matchMedia("only screen and (min-width: " + oConfig.breakPoint.min.tablet + "px) and (max-width: " + oConfig.breakPoint.max.desktop + "px)").matches;
				//bIsDesktopMode = win.matchMedia("only screen and (min-width: " + oConfig.breakPoint.min.desktop + "px) and (max-width: " + oConfig.breakPoint.max.large + "px)").matches;
				bIsDesktopMode = win.matchMedia("only screen and (min-width: " + oConfig.breakPoint.min.desktop + "px)").matches;
			}
			//log("IsMobile", bIsMobileMode);
			//log("IsTablet", bIsTabletMode);
			//log("IsDesktop", bIsDesktopMode);			
		}
		var oCallbacks = $.Callbacks();
		var fAdd = oCallbacks.add;
		var fInit = function() {
			fTestScreen();
		}
		o$win.on("resize", function() {
			fTestScreen();
			oCallbacks.fire();
		})
		return {
			add: fAdd,
			init: fInit
		}
	})();

	//Absolute Child Container Auto Height
	var oAutoHeight = (function() {
		var _oConfig = {}
		var oDafaults = {
			maxHeight: 500
		};
		var AutoHeight = function(oContainer) {
			this.o$Container = $(oContainer);
			this.aChildDomArr = fGetAllChildDom($(oContainer));
			this.bEnble = false;
			this.update();
		}
		AutoHeight.prototype.update = function() {
			if (!bIsDesktopMode) {
				this.reset();
				this.bEnble = false;
				return;
			}
			this.bEnble = true;
			var o$AutoHeightContainer = this.o$Container;
			var aChildDomArr = this.aChildDomArr;
			var nHeightArr = fGetAllChildDomHeightArr(aChildDomArr);
			//log(nHeightArr);
			var nMaxHeight = fGetMaxHeight(nHeightArr);
			o$AutoHeightContainer.css("height", nMaxHeight);
//			if(nMaxHeight>600){
//				o$AutoHeightContainer.css("height", 600);	
//			}
			$.each(aChildDomArr, function() {
				$(this).css("height", nMaxHeight);
			});
		}
		AutoHeight.prototype.reset = function() {
			if (!this.bEnble) {
				return;
			}
			this.o$Container.css("height", "auto");
			$.each(this.aChildDomArr, function() {
				$(this).css("height", "auto");
			});
		}
		var fGetMaxHeight = function(nHeightArr) {
			return Math.max.apply(null, nHeightArr);
		}
		var fGetAllChildDom = function(o$AutoHeightContainer) {
			var aChildDomArr = [];
			var sChildSelector = o$AutoHeightContainer.data("child");
			var sChildSelectorArr = sChildSelector.split("|");
			$.each(sChildSelectorArr, function() {
				var o$ChildDom = o$AutoHeightContainer.find(this);
				if (o$ChildDom.length > 1) {
					o$ChildDom.each(function() {
						aChildDomArr.push($(this));
					});
				} else {
					aChildDomArr.push(o$ChildDom);
				}

			});
			return aChildDomArr;
		}
		var fGetAllChildDomHeightArr = function(aChildDomArr) {
			var nHeightArr = [];
			$.each(aChildDomArr, function() {
				nHeightArr.push($(this).innerHeight());
			});
			return nHeightArr;
		}
		var fHandle = function() {

		}
		var fUpdate = function() {
			$.each(aAutoHeightCon, function() {
				this.update();
			})
		}
		var aAutoHeightCon = [];
		var fInit = function(oConfig) {
			_oConfig = $.extend({} , oDafaults, oConfig);
			$(".auto-height").each(function() {
				var oAutoHeight = new AutoHeight(this);
				aAutoHeightCon.push(oAutoHeight);
			});
		}
		return {
			update: fUpdate,
			init: fInit
		}
	})();

	//Body Scroll
	var oBodyScroll = (function() {
		var o$Body = $("body");
		//var bScrollAble = true;
		var fNoScroll = function() {
			if (!o$Body.hasClass("no-scroll")) {
				o$Body.addClass("no-scroll");
			}

		}
		var fScroll = function() {
			if (o$Body.hasClass("no-scroll")) {
				o$Body.removeClass("no-scroll");
			}
		}
		var fInit = function(){
//			o$Doc.on("touchmove", function(e){
//				e.preventDefault();
//			})
//			o$Body.on("touchstart", ".no-scroll", function(e){
//				if(e.currentTarget.scrollTop === 0){
//					e.currentTarget.scrollTop = 1;
//				}else if(e.currentTarget.scrollHeight == e.currentTarget.scrollTop + e.currentTarget.offsetHeight){
//					e.currentTarget.scrollTop -=1;	
//				}
//			});
//			o$Body.on("touchmove", ".no-scroll", function(e){
//				e.stopPropagation();		
//			});				
		}
		return {
			noScroll: fNoScroll,
			scroll: fScroll,
			init: fInit
		}
	})();

	//Header Auto Hide
	var oHeaderAutoHide = (function() {
		var o$Header = $(".header");
		var oConfig = {
			autoHideHeight: 150
		}
		var fHideHeader = function() {
			o$Header.addClass("hide");
		};
		var fShowHeader = function() {
			o$Header.removeClass("hide");
		}
		var fInteraction = function(nDelta) {
			var nWinScrollTop = o$win.scrollTop();
			if (nDelta > 0) {
				if (nWinScrollTop >= oConfig.autoHideHeight) {
					fHideHeader();
				}
				//log(nDelta);
				//log("Down");
			} else {
				fShowHeader();
				//log("Up");
			}
		}
		var nScrollTop;
		var fInit = function() {
			nScrollTop = o$win.scrollTop();			
			o$win.on("scroll", AUI.throttle(function() {
				var nAfterScrollTop = o$win.scrollTop();
				var nDelta = nAfterScrollTop - nScrollTop;
				if (nDelta === 0) {
					return false;
				}
				fInteraction(nDelta);
				nScrollTop = nAfterScrollTop;
			}))
		}
		return {
			init: fInit
		}
	})();

	//Search Panel
	var oSearchPanel = (function() {
		var _oConfig = {}
		var oDefaults = {
			openCall: null,
			closeCall: null
		}
		var o$SearchPanel = $(".search-panel");
		var o$SearchToggleBtn = $(".top-nav .search .icon");
		var fToggleSearchPanel = function() {
			//			if ($(".nav").hasClass("show")) {
			//				$(".nav").removeClass("show");
			//			}
			if (o$SearchPanel.hasClass("show")) {
				fClose();
			} else {
				fOpen();
			}
			return false;
		}
		var fOpen = function() {
			if(bIsDesktopMode){
				$("#searchInput").trigger("focus");	
			}			
			o$SearchPanel.addClass("show");
			if(!bIsDesktopMode){
				o$SearchToggleBtn.removeClass("icon-search").addClass("icon-close");	
			}			
			oBodyScroll.noScroll();
			_oConfig.openCall && _oConfig.openCall();
			//log("Search Panel Open", _oConfig.openCall);
		}
		var fClose = function() {
			o$SearchPanel.removeClass("show");
			if(!bIsDesktopMode){
				o$SearchToggleBtn.addClass("icon-search").removeClass("icon-close");	
			}			
			oBodyScroll.scroll();
			_oConfig.closeCall && _oConfig.closeCall();
		}
		var fInputBlur = function() {
			if (bIsDesktopMode) {
				fClose();
			}
		}
		var fInit = function(oConfig) {
			_oConfig = $.extend({}, oDefaults, oConfig);
			o$Doc.on("click", ".search,.search-cancel a", fToggleSearchPanel);
			o$Doc.on("blur", "#searchInput", fInputBlur);
		}
		return {
			open: fOpen,
			close: fClose,
			init: fInit
		}
	})();

	//Search History 
	var oSearchHistory = (function() {
		var SearchHistory = function() {
			this.defaults = {
				keywordCountLimit: 10,
				localDataName: "searchHistory",
				$container: $(".search-history ul"),
				$clearButton: $(".search-history .clear-btn"),
				searchRequestUrl: "/searchresults/?query="
			}
			this.template = '<li><a href="<%=url%>" title="<%=keyword%>"><%=keyword%></a></li>';
		}
		SearchHistory.prototype.init = function(oConfig) {
			this.config = $.extend({}, this.defaults, oConfig);
			this.bind();
			this.update();
		}
		SearchHistory.prototype.update = function() {
			this._fGetLocalKeywords();
			this.render();
		}
		SearchHistory.prototype.render = function() {
			var sAllKeywordsTemplate = "";
			var self = this;
			var aKeywords = this._fGetLocalKeywords();
			$.each(aKeywords, function() {
				sAllKeywordsTemplate += AUI.Template(self.template, {
					url: (self.config.searchRequestUrl + this),
					keyword: this
				});
			})
			this.config.$container.empty();
			this.config.$container.append(sAllKeywordsTemplate);
		}
		SearchHistory.prototype.save = function(sKeyword) {
			var aKeywords = this._fGetLocalKeywords();
			if (aKeywords.length < this.config.keywordCountLimit) {
				aKeywords.unshift(sKeyword);
			} else {
				aKeywords.pop();
				aKeywords.unshift(sKeyword);
			}
			AUI.Storage.set(this.config.localDataName, aKeywords);
			this.update();
		}
		SearchHistory.prototype.clearAll = function(event) {
			var self = event.data;
			AUI.Storage.clear(self.config.localDataName);
			self.update();
			return false;
		}
		SearchHistory.prototype.bind = function() {
			var self = this;
			o$Doc.on("click", self.config.$clearButton.selector, self, self.clearAll);
		}
		SearchHistory.prototype._fGetLocalKeywords = function() {
			return AUI.Storage.get(this.config.localDataName) || [];
		}
		var fFilter = function(sKeyword) {

		}
		var searchHistory = new SearchHistory();
		var fInit = function() {
			searchHistory.init();
		};
		var fSave = function(sKeyword) {
			searchHistory.save(sKeyword);
		};
		return {
			save: fSave,
			init: fInit
		}
	})();

	//Top search keywords
	var oTopSearchKeywords = (function() {
		var _oConfig = {};
		var oDefaults = {
			$container: $(".search-panel .hot-tag"),
			requestUrl: "http://wacnstaging.chinacloudsites.cn/hotkeywords",
			requestParam: "topK",
			keywordsCount: 9,
			searchUrl: "/searchresults/?query=",
			template: '<div class="col-xs-6 col-sm-4"><a class="btn btn-link btn-block btn-default text-limit" href="<%=url%>" title="<%=keyword%>"><%=keyword%></a></div>'
		}
		var fRenderData = function(oData) {
			var sHotKeywordsDom = "";
			$.each(oData, function() {
				var sKeyword = this;
				var sUrl = _oConfig.searchUrl + sKeyword;
				sHotKeywordsDom += AUI.Template(_oConfig.template, {
					url: sUrl,
					keyword: sKeyword
				});
			});
			return sHotKeywordsDom;
		}
		var fRender = function(sDom) {
			_oConfig.$container.empty();
			_oConfig.$container.append(sDom);
		}
		var fGetData = function() {
			var requestParam = _oConfig.requestParam;
			$.ajax({
				url: _oConfig.requestUrl,
				method: "POST",
				data: {
					requestParam: _oConfig.keywordsCount
				},
				dataType: "json"
			}).done(function(oData){
				fRender(fRenderData(oData));					
			});
		}
		var fInit = function(oConfig) {
			_oConfig = $.extend({}, oDefaults, oConfig);
			fGetData();
		}
		return {
			init: fInit
		}
	})();

	//Navigation
	var oNavigation = (function() {
		var o$Nav = $(".nav");
		var o$AllNavLink = $(".nav > ul > li > a");
		var o$ChildMenu = o$Nav.find(".panel-wrapper");
		var fToggleNavigation = function() {
			if (o$Nav.hasClass("show")) {
				fNavigationClose();
			} else {
				fNavigationOpen();
			}
			return false;
		}
		var fNavigationOpen = function() {
			o$Nav.addClass("show");
			oSearchPanel.close();
			oBodyScroll.noScroll();
			$(".nav-toggle>.icon").removeClass("icon-navigation").addClass("icon-close");
		}
		var fNavigationHide = function() {
			o$Nav.removeClass("show");
			o$AllNavLink.removeClass("active");
			$(".nav-toggle>.icon").addClass("icon-navigation").removeClass("icon-close");
		}
		var fNavigationClose = function() {
			fNavigationHide();
			oBodyScroll.scroll();
		}
		var fToggleChildMenu = function() {
			//log(this);
			if ($(this).next(".panel-wrapper").length == 0) {
				return false;
			}
			o$AllNavLink.removeClass("active");
			$(this).addClass("active");
			//			if(bIsDesktopMode){
			//					
			//			}
			o$ChildMenu.removeClass("show");
			$(this).next(".panel-wrapper").addClass("show");
			oBodyScroll.noScroll();
			return false;
		}

		var fChildMenuColse = function() {
			if(!bIsDesktopMode){
				return;
			}
			o$AllNavLink.removeClass("active");
			o$ChildMenu.removeClass("show");
			fNavigationClose();
			oBodyScroll.scroll();
			return false;
		}

		var fCountElementDt = function(){
			o$ChildMenu.find(".menu-child").each(function(){
				var o$Dl = $(this);
				var nDtCount = o$Dl.find("dt").length;
				//log(nDtCount%2);
				if(nDtCount%2){
					o$Dl.addClass("even-child");															
				}
			});
		}

		var fDdHover = function(){
			$(this).prev("dt").toggleClass("mouse-hover");
		}
		
		var fDdClick = function(){
			var sJumpUrl = $(this).prev("dt").find("a").attr("href");
			win.location = sJumpUrl;
			return false;
		}

		var fInit = function() {
			o$Doc.on("click", ".nav-toggle", fToggleNavigation);
			o$Doc.on("click", ".nav > ul > li > a", fToggleChildMenu);
			o$Doc.on("click", ".content", fChildMenuColse);
			o$Doc.on("mouseover", ".nav .panel-content dl dd", fDdHover);
			o$Doc.on("mouseout", ".nav .panel-content dl dd", fDdHover);
			o$Doc.on("click", ".nav .panel-content dl dd", fDdClick);
			fCountElementDt();
		}

		return {
			hide: fNavigationHide,
			open: fNavigationOpen,
			close: fNavigationClose,
			init: fInit
		}
	})();

	//Accordian Menu
	var oAccordianMenu = (function() {
		var _oConfig = {}
		var oDefaults = {
			showClass: "show-sm show-xs"
		}
		var fCollapse = function(oEvent) {
			var o$AllTitle = $(oEvent.data).find(".menu-title");
			var o$AllChildMenu = $(oEvent.data).find(".menu-child");
			var o$MenuTitle = $(this);
			if (o$MenuTitle.hasClass("expand")) {
				if ($(oEvent.data).data("tab") == "desktop" && bIsDesktopMode) {
					return false;
				}
				o$MenuTitle.removeClass("expand");
				o$MenuTitle.next(".menu-child").removeClass(_oConfig.showClass);
			} else {
				o$AllTitle.removeClass("expand");
				o$MenuTitle.addClass("expand");
				o$AllChildMenu.removeClass(_oConfig.showClass);
				o$MenuTitle.next(".menu-child").addClass(_oConfig.showClass);
			}
			return false;
		}
		var fBindEvent = function(o$MenuContainer) {
			o$MenuContainer.on("click.accordian", ".menu-title", o$MenuContainer, fCollapse);
			fInitClass(o$MenuContainer);
		}
		var fInitClass = function(o$MenuContainer) {
			o$MenuContainer.find(".menu-title").each(function() {
				//log($(this).hasClass("expand"));
				if ($(this).hasClass("expand")) {
					$(this).next(".menu-child").addClass(_oConfig.showClass);
				}
			});
		}
		var fInit = function(oConfig) {
			_oConfig = $.extend({}, oDefaults, oConfig);
			$(".accordian-menu").each(function() {
				fBindEvent($(this));
				fInitClass($(this));
			});
		}
		return {
			init: fInit
		}
	})();

	//Auto Scroll
	var oAutoScroll = (function() {
		var AutoScroll = function(oContainer) {
			this.o$Container = $(oContainer);
			this.update();
		}

		AutoScroll.prototype.update = function() {
			if (bIsDesktopMode) {
				return;
			}
			var nWinHeight = $(win).height();
			var nTopMargin = 0;
			var o$Container = this.o$Container;
			if (typeof o$Container.data("top") == "string") {
				//log("nWinHeight", nWinHeight);								
				nTopMargin = $("." + o$Container.data("top")).height();
				//log("nTopMargin", nTopMargin);
			}
			if (typeof o$Container.data("top") == "number") {
				nTopMargin = o$Container.data("top");
			}
			var nContentHeight = 0;
			o$Container.children().each(function() {
				nContentHeight += $(this).height();
			});
			var nHeight = nWinHeight - nTopMargin;
			//log("nContentHeight nTopMargin", nContentHeight + nTopMargin);
			//			o$Container.addClass("scroll-y");
			//			o$Container.innerHeight(nHeight);	
			if ((nContentHeight + nTopMargin) > nWinHeight) {
				o$Container.addClass("scroll-y");
				o$Container.innerHeight(nHeight);
			} else {
				o$Container.removeClass("scroll-y");
				o$Container.css("height", "auto");
				if (o$Container.data("fullscreen")) {
					o$Container.css("height", nHeight);
				}
			}
		}
		var aScrollContainer = [];
		var fUpdate = function() {
			$.each(aScrollContainer, function() {
				this.update();
			});
		}
		var fInit = function() {
			$(".auto-scroll").each(function(index, element) {
				var oAutoScroll = new AutoScroll(this);
				aScrollContainer.push(oAutoScroll);
			});
		}
		return {
			update: fUpdate,
			init: fInit
		}
	})();

	//Panel
	var oPanel = (function() {
		var fBindEvent = function(oPanelDom) {
			$(oPanelDom).on("click.panel", ".panel-title .icon-close", function() {
				$(this).parents(".panel-wrapper").removeClass("show");
				oBodyScroll.scroll();
				return false;
			});
		}
		var fInit = function() {
			$(".panel-wrapper").each(function(index, element) {
				fBindEvent(this);
			});
		}
		return {
			init: fInit
		}
	})();

	//Tab 
	var oTab = (function() {
		var _oConfig = {}
		var oDefaults = {
			$tabNav: $(".tab-nav")
		}
		var Tab = function($tabNavContainer) {
			this.$tabNavContainer = $tabNavContainer;
		}
		Tab.prototype.init = function() {
			this._bind();
		}
		Tab.prototype._bind = function() {
			var self = this;
			self.$tabNavContainer.find('[data-toggle="tab"]').each(function(){
				if($(this).parent('li').hasClass('active')){
					show($(this));	
				}
			});
			self.$tabNavContainer.on('click.tab', '[data-toggle="tab"]', self, activate);
		}
		var show = function($tabLink) {
			var sTargetId= $tabLink.attr("href");
			var regExp = /^#\S+/g;
			if(regExp.test(sTargetId)){
				$(sTargetId).parents(".tab-content").find(".tab-panel").removeClass("show-md");
				$(sTargetId).addClass("show-md");
			}		
		}
		var activate = function(event) {
			event.data.$tabNavContainer.find('li').removeClass("active");
			$(this).parent('li').addClass("active");
			show($(this));		
		}

		var fInit = function(oConfig) {
			_oConfig = $.extend({}, oDefaults, oConfig);
			_oConfig.$tabNav.each(function() {
				var tab = new Tab($(this));
				tab.init();
			});
		}
		return {
			init: fInit
		}
	})();

	//Implement touchend event handlers
	var oHandleTouchEvent = (function(){
		var fInit = function(){
			if(!bIsDesktopMode){
				FastClick.attach(document.body);
			}
		}
		return{
			init: fInit
		}
	})();

	return {
		init: function() {
			oTestScreen.init();			
			oHeaderAutoHide.init();
			oBodyScroll.init();
			oSearchPanel.init({
				openCall: oNavigation.hide
			});
			oNavigation.init();
			oAutoScroll.init();
			oAccordianMenu.init();
			oPanel.init();
			oAutoHeight.init();
			oSearchHistory.init();
			oTopSearchKeywords.init();
			oTab.init();
			//oSearchHistory.save("历史记录关键词 Search history keywords");
			oTestScreen.add(oAutoScroll.update);
			oTestScreen.add(oAutoHeight.update);
			oHandleTouchEvent.init();
		}
	}
})(jQuery, AUI, window, document);

$(function() {
	App.init();
});