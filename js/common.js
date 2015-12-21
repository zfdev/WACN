var Common = (function($, AUI, win, doc) {
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
		},
		AJAXRequestPrefix: 'api-'
	}
	var bIsMobileMode = false;
	var bIsTabletMode = false;
	var bIsDesktopMode = false;
	var o$Win = $(win);
	var o$Doc = $(doc);

	//Pub/sub model implementation
	(function($){
		var oPubSub = $({});
		$.subscribe = function(){
			oPubSub.on.apply(oPubSub, arguments);
		}
		$.unsubscribe = function(){
			oPubSub.off.apply(oPubSub, arguments);	
		}
		$.publish = function(){
			oPubSub.trigger.apply(oPubSub, arguments);
		}		
	})($);

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
		o$Win.on("resize", function() {
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
			maxHeight: 520,
			selector: ".auto-height"
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
				var nHeight = $(this).innerHeight();
				if (nHeight >= _oConfig.maxHeight) {
					nHeight = _oConfig.maxHeight;
					$(this).addClass("scrollable");
				}
				nHeightArr.push(nHeight);
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
			_oConfig = $.extend({}, oDafaults, oConfig);
			$(_oConfig.selector).each(function() {
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
		var fInit = function() {
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
			if(bIsDesktopMode){
				return;
			}
			var nWinScrollTop = o$Win.scrollTop();
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
			nScrollTop = o$Win.scrollTop();
			o$Win.on("scroll", AUI.throttle(function() {
				var nAfterScrollTop = o$Win.scrollTop();
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
			if (bIsDesktopMode) {
				$("#searchInput").trigger("focus");
			}
			o$SearchPanel.addClass("show");
			if (!bIsDesktopMode) {
				o$SearchToggleBtn.removeClass("icon-search").addClass("icon-close");
			}
			oBodyScroll.noScroll();
			_oConfig.openCall && _oConfig.openCall();
			//log("Search Panel Open", _oConfig.openCall);
		}
		var fClose = function() {
			o$SearchPanel.removeClass("show");
			o$SearchToggleBtn.addClass("icon-search").removeClass("icon-close");
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

	//Global Search
	var oGlobalSearch = (function() {
		var _oConfig = {}
		var defaults = {
			beforeSearch: null,
			$input: $("#searchInput"),
			searchRequestUrl: "/searchresults/?query="
		}
		var fIsEmptyString = function(sKeywords) {
			var rReg = /^\s+$/g;
			return rReg.test(sKeywords) || sKeywords === "";
		}
		var fDoSearch = function() {
			var sKeywords = _oConfig.$input.val();
			if (fIsEmptyString(sKeywords)) {
				return;
			}
			var sRedirectUrl = _oConfig.searchRequestUrl + encodeURIComponent(sKeywords);
			_oConfig.beforeSearch && _oConfig.beforeSearch(sKeywords);
			win.location = sRedirectUrl;
		}
		var fBindEvent = function() {
			o$Win.on("keyup", function(e) {
				if (e.keyCode == "13") {
					fDoSearch();
				}
			});
		}
		var fInit = function(oConfig) {
			_oConfig = $.extend({}, defaults, oConfig);
			fBindEvent();
		}
		return {
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
			this.template = '<li><a class="text-limit" href="<%=url%>" title="<%=keyword%>"><%=keyword%></a></li>';
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
					url: (self.config.searchRequestUrl + encodeURIComponent(this)),
					keyword: this
				});
			})
			this.config.$container.empty();
			this.config.$container.append(sAllKeywordsTemplate);
		}
		SearchHistory.prototype._find = function(sKeyword) {
			var aKeywords = this._fGetLocalKeywords();
			return $.inArray(sKeyword, aKeywords);
		}
		SearchHistory.prototype.save = function(sKeyword) {
			if (!(this._find(sKeyword) == -1)) {
				return;
			}
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
			requestUrl: "/" + oConfig.AJAXRequestPrefix + "hotkeywords",
			requestParam: "topK",
			keywordsCount: 9,
			searchUrl: "/searchresults/?query=",
			template: '<div class="col-xs-6 col-sm-4"><a class="btn btn-link btn-block btn-default text-limit" href="<%=url%>" title="<%=keyword%>"><%=keyword%></a></div>'
		}
		var fRenderData = function(oData) {
			var sHotKeywordsDom = "";
			$.each(oData, function() {
				var sKeyword = this;
				var sUrl = _oConfig.searchUrl + encodeURIComponent(sKeyword);
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
			var oRequestParam = {}
			oRequestParam[_oConfig.requestParam] = _oConfig.keywordsCount
			$.ajax({
				url: _oConfig.requestUrl,
				method: "POST",
				data: oRequestParam,
				dataType: "json"
			}).done(function(oData) {
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
			if (!$(this).next(".panel-wrapper").length == 0) {
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
		}

		var fChildMenuColse = function() {
			if (!bIsDesktopMode) {
				return;
			}
			o$AllNavLink.removeClass("active");
			o$ChildMenu.removeClass("show");
			fNavigationClose();
			oBodyScroll.scroll();
			//return false;
		}

		var fCountElementDt = function() {
			o$ChildMenu.find("dl").each(function() {
				var o$Dl = $(this);
				var nDtCount = o$Dl.find("dt").length;
				//log(nDtCount%2);
				if (nDtCount % 2) {
					o$Dl.addClass("odd-child");
				}
				fPreventScrollEvent(o$Dl);
			});
		}

		var fPreventScrollEvent = function() {
			o$ChildMenu.find(".menu-child").each(function() {
				var o$Dl = $(this);
				o$Dl.on("mousewheel", function(e) {
					if (!$(this).hasClass("scrollable")) {
						return;
					}
					var oEvent = e.originalEvent,
						nDelta = oEvent.wheelDelta || -oEvent.detail;
					this.scrollTop += (nDelta < 0 ? 1 : -1) * 30;
					e.preventDefault();
				})
			});
		}

		var fDdHover = function() {
			$(this).prev("dt").toggleClass("mouse-hover");
		}

		var fDdClick = function() {
			var sJumpUrl = $(this).prev("dt").find("a").attr("href");
			win.location = sJumpUrl;
			return false;
		}

		var fGetCurrentCategoryByURL = function(){
			var sCurrentPageUrl = win.location.href;
			var oURLCategoryMap = {
				'/home/features/': 'product',
				'/pricing/': 'price',
				'/solutions/': 'solutions',
				'/partnerancasestudy/': 'partnerAndCase',
				'/isv-plan/': 'partnerAndCase',		
				'/starter-guide/': 'document',
				'/video-center/': 'document',
				'/documentation/': 'document',
				'/develop/': 'document',
				'/blog/': 'community',
				'/community/': 'community',
				'/support/': 'support',
				'/icp/': 'support'
			}
			var fSelectCategory = function(){
				for(var i in oURLCategoryMap){
					if(sCurrentPageUrl.indexOf(i) > -1){
						return oURLCategoryMap[i];	
					}		
				}
			}
			if(fSelectCategory()){
				o$Nav.find('.nav-' + fSelectCategory()).addClass('current');
			}else{
				o$Nav.find('.nav-index').addClass('current');	
			}
		}

		var fInit = function() {
			o$Doc.on("click", ".nav-toggle", fToggleNavigation);
			o$Doc.on("click", ".nav > ul > li > a", fToggleChildMenu);
			o$Doc.on("click", ".content", fChildMenuColse);
			o$Doc.on("mouseover", ".nav .panel-content dl dd", fDdHover);
			o$Doc.on("mouseout", ".nav .panel-content dl dd", fDdHover);
			o$Doc.on("click", ".nav .panel-content dl dd", fDdClick);
			fCountElementDt();
			fPreventScrollEvent();
			fGetCurrentCategoryByURL();
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
			this.eventHandler = this.$tabNavContainer.data('event') || 'click';
			this._bind();
		}
		Tab.prototype._bind = function() {
			var self = this;
			var oEventType = self.eventHandler + '.tab';
			self.$tabNavContainer.find('[data-toggle="tab"]').each(function() {
				if ($(this).parent('li').hasClass('active')) {
					show($(this));
				}
			});
			self.$tabNavContainer.on(oEventType, '[data-toggle="tab"]', self, activate);
			self.$tabNavContainer.on('touchend', '[data-toggle="tab"]', self, activate);
		}
		var show = function($tabLink) {
			var sTargetId = $tabLink.attr("href");
			var regExp = /^#\S+/g;
			if (regExp.test(sTargetId)) {
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

	//Dialog
	var oDialog = (function(){
		var Dialog = function(){
			this.width = 0;
			this.height = 0;	
		}
		Dialog.prototype.init = function(o$link){
			//get dom
			var sDialogIdSelector = o$link.attr('href');
			//log(sDialogIdSelector);
			this.$link = o$link;
			this.$dialog = $(sDialogIdSelector);
			this.$dialogContent = this.$dialog.find('.dialog-content');
			this.$closeBtn = this.$dialog.find('.dialog-header .close-btn');
			this.$mask = this.$dialog.find('.dialog-mask');
			//load config for dialog
			this.width = this.$dialog.data('width');
			this.height = this.$dialog.data('height');
			this._bind(); //bind event
			this.update();			
		}
		Dialog.prototype.open = function(){
			this.$dialog.addClass('open');
			//return false;
		}
		Dialog.prototype.update = function(){
			this.$dialogContent.width(this.width);
			this.$dialogContent.height(this.height);
			this.$dialogContent.css('margin-left', -this.width/2);
			this.$dialogContent.css('margin-top', -this.height/2);
		}
		Dialog.prototype._bind = function(){
			var self = this;
			this.$link.off('click.Dialog');
			this.$link.on('click.Dialog.link', function(e){
				self.open();
				e.preventDefault();
				e.stopPropagation();
			});
			this.$closeBtn.on('click.Dialog.closeBtn', function(e){
				self.close();				
				e.preventDefault();
				e.stopPropagation();
			});
			this.$mask.on('click.Dialog.mask', function(){
				self.close();
			});

		}
		Dialog.prototype.close = function(){
			this.$dialog.removeClass('open');
			//log('Dialog.close');	
		}
		var fInit = function(){
			$('[data-toggle="dialog"]').each(function(){
				var oDialogInstance = new Dialog();
				oDialogInstance.init($(this));
				//log(oDialogInstance);
			});
		}
		return{
			init: fInit
		}
	})();

	//Implement touchend event handlers
	var oHandleTouchEvent = (function() {
		var fInit = function() {
			if (!bIsDesktopMode) {
				FastClick.attach(doc.body);
			}
		}
		return {
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
			oGlobalSearch.init({
				beforeSearch: function(sKeyword) {
					oSearchHistory.save(sKeyword);
				}
			});
			oTab.init();
			oDialog.init();
			oTestScreen.add(oAutoScroll.update);
			oTestScreen.add(oAutoHeight.update);
			oHandleTouchEvent.init();
		}
	}
})(jQuery, AUI, window, document);

$(function() {
	Common.init();
});