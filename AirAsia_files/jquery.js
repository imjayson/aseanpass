jQuery(function(){
	jQuery('input, textarea').placeholder();
	initDescription();
	initNavAddClass();
});
jQuery(document).ready(function(){
	initSlideFadeGallery();
});

function initDescription(){
	jQuery('li.user').each(function(){
		var holder = jQuery(this);
		var duration = 500;
		var drop = holder.find('.tip-holder');
		var closeButton = drop.find('a.close');
		var topPosition;
		var leftPosition;
		var holderHeight;
		
		function refreshParam(){
			topPosition = holder.offset().top;
			leftPosition = holder.offset().left;
			holderHeight = holder.outerHeight();
			
			drop.css({
				width: drop.outerWidth(),
				zIndex:1000
			});
		}

		function showDrop() {
		    if (!(sessionStorage.showTipHolder == "true")) {
		        sessionStorage.showTipHolder = "true";
		        refreshParam();
		        drop.show().stop().animate({
		            opacity: 1
		        }, {
		            duration: duration
		        });
		    }
		}
		
		function hideDrop(){
			drop.stop().animate({
				opacity:0
			},{
				duration: duration,
				complete: function(){
					drop.hide();
				}
			});
		}
		
		if(drop.length){
			closeButton.on('click', hideDrop);
			setTimeout(hideDrop, 10000);
		}
		
		jQuery(document).ready(function () {
		    showDrop();                                   //show tip holder
		    jQuery(window).on('resize', refreshParam);
		});
		
	});
}

//add hover class at navigation
function initNavAddClass () {
	var activeClass = 'hover';
	var activeItem = false;
	var isIE = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./) || jQuery.browser.msie;
	var isMac = !!navigator.userAgent.match(/Macintosh.*rv[ :]*2*.*\sFirefox/);

	jQuery('#nav>ul>li').each(function() {
		var self = this;
		var parent = jQuery(this);
		var selects = parent.find('select');
		self.selectFocus = false;
		var timer;
		
		var select = parent.find('select');
		parent.on({
			mouseenter : function(){
				if(activeItem && !parent.is(activeItem)){
					jQuery(activeItem).find('select').each(function(){
						jQuery(this).trigger('blur');
					});
					activeItem.selectFocus = false;
					self.selectFocus = false;
					jQuery(activeItem).mouseleave();
				}
				activeItem = self;
				addClass();
			},
			mouseleave : function(){
				removeClass();
			}
		});
		if (isIE || isMac) {
			selects.on({
				focus:  function(){
					self.selectFocus = true;
				},
				blur : function(){
					self.selectFocus = false;
				}
			});
		}
		function addClass() {
		    parent.addClass(activeClass);
		    jQuery(document).find(".tip-holder").hide();
		}
		function removeClass(){
			if(!self.selectFocus){
				parent.removeClass(activeClass);
			}
		}
		jQuery(document).on('click', function(e){
			var target = jQuery(e.target);
			if(!target.is(parent) && target.closest(parent).length === 0){
				removeClass();
			}
		});
	});
}

// slide-fade gallery init
function initSlideFadeGallery() {
    jQuery('div.banner').each(function () {
        var gallery = jQuery(this);
		var slideMode = true;
		var autoRotation = true;
		var animSpeed = 250;
		var switchTime = 5000;
		if ('undefined' !== typeof MBScrollSpeed) {
		    switchTime = MBScrollSpeed;
		}
		
		if(slideMode) {
			gallery.addClass('slide-effect');
		}
		
		gallery.not('.slide-effect').fadeGallery({
			slides: 'div.slide',
			generatePagination: '.pagination',
			event: 'click',
			useSwipe: true,
			autoRotation: autoRotation,
			autoHeight: true,
			switchTime: switchTime,
			animSpeed: animSpeed,
			pauseOnHover: true
		});
		gallery.filter('.slide-effect').scrollAbsoluteGallery({
			mask: 'div.mask',
			slider: 'div.slideset',
			slides: 'div.slide',
			generatePagination: '.pagination',
			stretchSlideToMask: true,
			maskAutoSize: true,
			autoRotation: autoRotation,
			switchTime: switchTime,
			animSpeed: animSpeed,
			pauseOnHover: true
		});
	});
}

/*
 * jQuery Cycle Carousel plugin
 */
;(function($){
	function ScrollAbsoluteGallery(options) {
		this.options = $.extend({
			activeClass: 'active',
			mask: 'div.slides-mask',
			slider: '>ul',
			slides: '>li',
			btnPrev: '.btn-prev',
			btnNext: '.btn-next',
			pagerLinks: 'ul.pager > li',
			generatePagination: false,
			pagerList: '<ul>',
			pagerListItem: '<li><a href="#"></a></li>',
			pagerListItemText: 'a',
			galleryReadyClass: 'gallery-js-ready',
			currentNumber: 'span.current-num',
			totalNumber: 'span.total-num',
			maskAutoSize: false,
			autoRotation: false,
			pauseOnHover: false,
			stretchSlideToMask: false,
			switchTime: 3000,
			animSpeed: 500,
			handleTouch: true,
			swipeThreshold: 15,
			vertical: false
		}, options);
		this.init();
	}
	ScrollAbsoluteGallery.prototype = {
		init: function() {
			if(this.options.holder) {
				this.findElements();
				this.attachEvents();
				this.makeCallback('onInit', this);
			}
		},
		findElements: function() {
			// find structure elements
			this.holder = $(this.options.holder).addClass(this.options.galleryReadyClass);
			this.mask = this.holder.find(this.options.mask);
			this.slider = this.mask.find(this.options.slider);
			this.slides = this.slider.find(this.options.slides);
			this.btnPrev = this.holder.find(this.options.btnPrev);
			this.btnNext = this.holder.find(this.options.btnNext);

			// slide count display
			this.currentNumber = this.holder.find(this.options.currentNumber);
			this.totalNumber = this.holder.find(this.options.totalNumber);

			// create gallery pagination
			if(typeof this.options.generatePagination === 'string') {
				this.pagerLinks = this.buildPagination();
			} else {
				this.pagerLinks = this.holder.find(this.options.pagerLinks);
			}

			// define index variables
			this.sizeProperty = this.options.vertical ? 'height' : 'width';
			this.positionProperty = this.options.vertical ? 'top' : 'left';
			this.animProperty = this.options.vertical ? 'marginTop' : 'marginLeft';

			this.slideSize = this.slides[this.sizeProperty]();
			this.currentIndex = 0;
			this.prevIndex = 0;

			// reposition elements
			this.options.maskAutoSize = this.options.vertical ? false : this.options.maskAutoSize;
			if(this.options.vertical) {
				this.mask.css({
					height: this.slides.innerHeight()
				});
			}
			if(this.options.maskAutoSize){
				this.mask.css({
					height: this.slider.height()
				});
			}
			this.slider.css({
				position: 'relative',
				height: this.options.vertical ? this.slideSize * this.slides.length : '100%'
			});
			this.slides.css({
				position: 'absolute'
			}).css(this.positionProperty, -9999).eq(this.currentIndex).css(this.positionProperty, 0);
			this.refreshState();
		},
		buildPagination: function() {
			var pagerLinks = $();
			if(!this.pagerHolder) {
				this.pagerHolder = this.holder.find(this.options.generatePagination);
			}
			if(this.pagerHolder.length) {
				this.pagerHolder.empty();
				this.pagerList = $(this.options.pagerList).appendTo(this.pagerHolder);
				for(var i = 0; i < this.slides.length; i++) {
					$(this.options.pagerListItem).appendTo(this.pagerList).find(this.options.pagerListItemText).text(i+1);
				}
				pagerLinks = this.pagerList.children();
			}
			return pagerLinks;
		},
		attachEvents: function() {
			// attach handlers
			var self = this;
			if(this.btnPrev.length) {
				this.btnPrevHandler = function(e) {
					e.preventDefault();
					self.prevSlide();
				};
				this.btnPrev.click(this.btnPrevHandler);
			}
			if(this.btnNext.length) {
				this.btnNextHandler = function(e) {
					e.preventDefault();
					self.nextSlide();
				};
				this.btnNext.click(this.btnNextHandler);
			}
			if(this.pagerLinks.length) {
				this.pagerLinksHandler = function(e) {
					e.preventDefault();
					self.numSlide(self.pagerLinks.index(e.currentTarget));
				};
				this.pagerLinks.click(this.pagerLinksHandler);
			}

			// handle autorotation pause on hover
			if(this.options.pauseOnHover) {
				this.hoverHandler = function() {
					clearTimeout(self.timer);
				};
				this.leaveHandler = function() {
					self.autoRotate();
				};
				this.holder.bind({mouseenter: this.hoverHandler, mouseleave: this.leaveHandler});
			}

			// handle holder and slides dimensions
			this.resizeHandler = function() {
				if(!self.animating) {
					if(self.options.stretchSlideToMask) {
						self.resizeSlides();
					}
					self.resizeHolder();
					self.setSlidesPosition(self.currentIndex);
				}
			};
			$(window).bind('load resize orientationchange', this.resizeHandler);
			if(self.options.stretchSlideToMask) {
				self.resizeSlides();
			}

			// handle swipe on mobile devices
			if(this.options.handleTouch && jQuery.fn.hammer && this.slides.length > 1 && isTouchDevice) {
				this.mask.hammer({
					drag_block_horizontal: self.options.vertical ? false : true,
					drag_block_vertical: self.options.vertical ? true : false,
					drag_min_distance: 1
				}).on('touch release ' + (this.options.vertical ? 'swipeup swipedown dragup dragdown' : 'swipeleft swiperight dragleft dragright'), function(ev){
					switch(ev.type) {
						case (self.options.vertical ? 'dragup' : 'dragright'):
						case (self.options.vertical ? 'dragdown' : 'dragleft'):
							if(!self.animating){
								self.swipeOffset = -self.slideSize + ev.gesture[self.options.vertical ? 'deltaY' : 'deltaX'];
								self.slider.css(self.animProperty, self.swipeOffset);
								clearTimeout(self.timer);
							}
							ev.gesture.preventDefault();
							break;
						case (self.options.vertical ? 'swipeup' : 'swipeleft'):
							if(!self.animating){
								self.nextSlide();
								self.swipeOffset = 0;
							}
							ev.gesture.stopDetect();
							break;
						case (self.options.vertical ? 'swipedown' : 'swiperight'):
							if(!self.animating){
								self.prevSlide();
								self.swipeOffset = 0;
							}
							ev.gesture.stopDetect();
							break;
						case 'release':
							if(Math.abs(ev.gesture[self.options.vertical ? 'deltaY' : 'deltaX']) > self.options.swipeThreshold) {
								if(self.options.vertical){
									if(ev.gesture.direction == 'down') {
										self.prevSlide();
									} else if(ev.gesture.direction == 'up') {
										self.nextSlide();
									}
								}
								else {
									if(ev.gesture.direction == 'right') {
										self.prevSlide();
									} else if(ev.gesture.direction == 'left') {
										self.nextSlide();
									}
								}
							}
							else {
								var tmpObj = {};
								tmpObj[self.animProperty] = -self.slideSize;
								self.slider.animate(tmpObj, {duration: self.options.animSpeed});
							}
							self.swipeOffset = 0;
							break;
					}
				});
			}

			// start autorotation
			this.autoRotate();
			this.resizeHolder();
			this.setSlidesPosition(this.currentIndex);
		},
		resizeSlides: function() {
			this.slideSize = this.mask[this.options.vertical ? 'height' : 'width']();
			this.slides.css(this.sizeProperty, this.slideSize);
		},
		resizeHolder: function() {
			if(this.options.maskAutoSize) {
				this.mask.css({
					height: this.slides.eq(this.currentIndex).outerHeight(true)
				});
			}
		},
		prevSlide: function() {
			if(!this.animating && this.slides.length > 1) {
				this.direction = -1;
				this.prevIndex = this.currentIndex;
				if(this.currentIndex > 0) this.currentIndex--;
				else this.currentIndex = this.slides.length - 1;
				this.switchSlide();
			}
		},
		nextSlide: function(fromAutoRotation) {
			if(!this.animating && this.slides.length > 1) {
				this.direction = 1;
				this.prevIndex = this.currentIndex;
				if(this.currentIndex < this.slides.length - 1) this.currentIndex++;
				else this.currentIndex = 0;
				this.switchSlide();
			}
		},
		numSlide: function(c) {
			if(!this.animating && this.currentIndex !== c && this.slides.length > 1) {
				this.direction = c > this.currentIndex ? 1 : -1;
				this.prevIndex = this.currentIndex;
				this.currentIndex = c;
				this.switchSlide();
			}
		},
		preparePosition: function() {
			// prepare slides position before animation
			this.setSlidesPosition(this.prevIndex, this.direction < 0 ? this.currentIndex : null, this.direction > 0 ? this.currentIndex : null, this.direction);
		},
		setSlidesPosition: function(index, slideLeft, slideRight, direction) {
			// reposition holder and nearest slides
			if(this.slides.length > 1) {
				var prevIndex = (typeof slideLeft === 'number' ? slideLeft : index > 0 ? index - 1 : this.slides.length - 1);
				var nextIndex = (typeof slideRight === 'number' ? slideRight : index < this.slides.length - 1 ? index + 1 : 0);

				this.slider.css(this.animProperty, this.swipeOffset ? this.swipeOffset : -this.slideSize);
				this.slides.css(this.positionProperty, -9999).eq(index).css(this.positionProperty, this.slideSize);
				if(prevIndex === nextIndex && typeof direction === 'number') {
					var calcOffset = direction > 0 ? this.slideSize*2 : 0;
					this.slides.eq(nextIndex).css(this.positionProperty, calcOffset);
				} else {
					this.slides.eq(prevIndex).css(this.positionProperty, 0);
					this.slides.eq(nextIndex).css(this.positionProperty, this.slideSize*2);
				}
			}
		},
		switchSlide: function() {
			// prepare positions and calculate offset
			var self = this;
			var oldSlide = this.slides.eq(this.prevIndex);
			var newSlide = this.slides.eq(this.currentIndex);
			this.animating = true;

			// resize mask to fit slide
			if(this.options.maskAutoSize) {
				this.mask.animate({
					height: newSlide.outerHeight(true)
				}, {
					duration: this.options.animSpeed
				});
			}

			// start animation
			var animProps = {};
			animProps[this.animProperty] = this.direction > 0 ? -this.slideSize*2 : 0;
			this.preparePosition();
			this.slider.animate(animProps,{duration:this.options.animSpeed, complete:function() {
				self.setSlidesPosition(self.currentIndex);

				// start autorotation
				self.animating = false;
				self.autoRotate();

				// onchange callback
				self.makeCallback('onChange', self);
			}});

			// refresh classes
			this.refreshState();

			// onchange callback
			this.makeCallback('onBeforeChange', this);
		},
		refreshState: function(initial) {
			// slide change function
			this.slides.removeClass(this.options.activeClass).eq(this.currentIndex).addClass(this.options.activeClass);
			this.pagerLinks.removeClass(this.options.activeClass).eq(this.currentIndex).addClass(this.options.activeClass);

			// display current slide number
			this.currentNumber.html(this.currentIndex + 1);
			this.totalNumber.html(this.slides.length);

			// add class if not enough slides
			this.holder.toggleClass('not-enough-slides', this.slides.length === 1);
		},
		autoRotate: function() {
			var self = this;
			clearTimeout(this.timer);
			if(this.options.autoRotation) {
				this.timer = setTimeout(function() {
					self.nextSlide();
				}, this.options.switchTime);
			}
		},
		makeCallback: function(name) {
			if(typeof this.options[name] === 'function') {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		},
		destroy: function() {
			// destroy handler
			this.btnPrev.unbind('click', this.btnPrevHandler);
			this.btnNext.unbind('click', this.btnNextHandler);
			this.pagerLinks.unbind('click', this.pagerLinksHandler);
			this.holder.unbind({mouseenter: this.hoverHandler, mouseleave: this.leaveHandler});
			$(window).unbind('load resize orientationchange', this.resizeHandler);
			clearTimeout(this.timer);

			// destroy swipe handler
			if(this.options.handleTouch && $.fn.hammer) {
				this.mask.hammer().off('touch release swipeleft swiperight swipeup swipedown dragup dragdown dragleft dragright');
			}

			// remove inline styles, classes and pagination
			this.holder.removeClass(this.options.galleryReadyClass);
			this.slider.add(this.slides).removeAttr('style');
			if(typeof this.options.generatePagination === 'string') {
				this.pagerHolder.empty();
			}
		}
	};

	// detect device type
	var isTouchDevice = /MSIE 10.*Touch/.test(navigator.userAgent) || ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

	// jquery plugin
	$.fn.scrollAbsoluteGallery = function(opt){
		return this.each(function(){
			$(this).data('ScrollAbsoluteGallery', new ScrollAbsoluteGallery($.extend(opt,{holder:this})));
		});
	};
}(jQuery));

/*
 * jQuery SlideShow plugin
 */
;(function($){
	function FadeGallery(options) {
		this.options = $.extend({
			slides: 'ul.slideset > li',
			activeClass:'active',
			disabledClass:'disabled',
			btnPrev: 'a.btn-prev',
			btnNext: 'a.btn-next',
			generatePagination: false,
			pagerList: '<ul>',
			pagerListItem: '<li><a href="#"></a></li>',
			pagerListItemText: 'a',
			pagerLinks: '.pagination li',
			currentNumber: 'span.current-num',
			totalNumber: 'span.total-num',
			btnPlay: '.btn-play',
			btnPause: '.btn-pause',
			btnPlayPause: '.btn-play-pause',
			galleryReadyClass: 'gallery-js-ready',
			autorotationActiveClass: 'autorotation-active',
			autorotationDisabledClass: 'autorotation-disabled',
			autorotationStopAfterClick: false,
			circularRotation: true,
			switchSimultaneously: true,
			disableWhileAnimating: false,
			disableFadeIE: false,
			autoRotation: false,
			pauseOnHover: true,
			autoHeight: false,
			useSwipe: false,
			swipeThreshold: 15,
			switchTime: 4000,
			animSpeed: 600,
			event:'click'
		}, options);
		this.init();
	}
	FadeGallery.prototype = {
		init: function() {
			if(this.options.holder) {
				this.findElements();
				this.attachEvents();
				this.refreshState(true);
				this.autoRotate();
				this.makeCallback('onInit', this);
			}
		},
		findElements: function() {
			// control elements
			this.gallery = $(this.options.holder).addClass(this.options.galleryReadyClass);
			this.slides = this.gallery.find(this.options.slides);
			this.slidesHolder = this.slides.eq(0).parent();
			this.stepsCount = this.slides.length;
			this.btnPrev = this.gallery.find(this.options.btnPrev);
			this.btnNext = this.gallery.find(this.options.btnNext);
			this.currentIndex = 0;

			// disable fade effect in old IE
			if(this.options.disableFadeIE && !$.support.opacity) {
				this.options.animSpeed = 0;
			}

			// create gallery pagination
			if(typeof this.options.generatePagination === 'string') {
				this.pagerHolder = this.gallery.find(this.options.generatePagination).empty();
				this.pagerList = $(this.options.pagerList).appendTo(this.pagerHolder);
				for(var i = 0; i < this.stepsCount; i++) {
					$(this.options.pagerListItem).appendTo(this.pagerList).find(this.options.pagerListItemText).text(i+1);
				}
				this.pagerLinks = this.pagerList.children();
			} else {
				this.pagerLinks = this.gallery.find(this.options.pagerLinks);
			}

			// get start index
			var activeSlide = this.slides.filter('.'+this.options.activeClass);
			if(activeSlide.length) {
				this.currentIndex = this.slides.index(activeSlide);
			}
			this.prevIndex = this.currentIndex;

			// autorotation control buttons
			this.btnPlay = this.gallery.find(this.options.btnPlay);
			this.btnPause = this.gallery.find(this.options.btnPause);
			this.btnPlayPause = this.gallery.find(this.options.btnPlayPause);

			// misc elements
			this.curNum = this.gallery.find(this.options.currentNumber);
			this.allNum = this.gallery.find(this.options.totalNumber);

			// handle flexible layout
			this.slides.css({display:'block',opacity:0}).eq(this.currentIndex).css({
				opacity:''
			});
		},
		attachEvents: function() {
			var self = this;

			// flexible layout handler
			this.resizeHandler = function() {
				self.onWindowResize();
			};
			$(window).bind('load resize orientationchange', this.resizeHandler);

			if(this.btnPrev.length) {
				this.btnPrevHandler = function(e){
					e.preventDefault();
					self.prevSlide();
					if(self.options.autorotationStopAfterClick) {
						self.stopRotation();
					}
				};
				this.btnPrev.bind(this.options.event, this.btnPrevHandler);
			}
			if(this.btnNext.length) {
				this.btnNextHandler = function(e) {
					e.preventDefault();
					self.nextSlide();
					if(self.options.autorotationStopAfterClick) {
						self.stopRotation();
					}
				};
				this.btnNext.bind(this.options.event, this.btnNextHandler);
			}
			if(this.pagerLinks.length) {
				this.pagerLinksHandler = function(e) {
					e.preventDefault();
					self.numSlide(self.pagerLinks.index(e.currentTarget));
					if(self.options.autorotationStopAfterClick) {
						self.stopRotation();
					}
				};
				this.pagerLinks.bind(self.options.event, this.pagerLinksHandler);
			}

			// autorotation buttons handler
			if(this.btnPlay.length) {
				this.btnPlayHandler = function(e) {
					e.preventDefault();
					self.startRotation();
				};
				this.btnPlay.bind(this.options.event, this.btnPlayHandler);
			}
			if(this.btnPause.length) {
				this.btnPauseHandler = function(e) {
					e.preventDefault();
					self.stopRotation();
				};
				this.btnPause.bind(this.options.event, this.btnPauseHandler);
			}
			if(this.btnPlayPause.length) {
				this.btnPlayPauseHandler = function(e){
					e.preventDefault();
					if(!self.gallery.hasClass(self.options.autorotationActiveClass)) {
						self.startRotation();
					} else {
						self.stopRotation();
					}
				};
				this.btnPlayPause.bind(this.options.event, this.btnPlayPauseHandler);
			}

			// swipe gestures handler
			if(this.options.useSwipe && $.fn.hammer && isTouchDevice) {
				this.gallery.hammer({
					drag_block_horizontal: true,
					drag_min_distance: 1
				}).on('release dragleft dragright swipeleft swiperight', function(ev){
					switch(ev.type) {
						case 'dragright':
						case 'dragleft':
							ev.gesture.preventDefault();
							break;
						case 'swipeleft':
							self.nextSlide();
							ev.gesture.stopDetect();
							break;
						case 'swiperight':
							self.prevSlide();
							ev.gesture.stopDetect();
							break;
						case 'release':
							if(Math.abs(ev.gesture[self.options.vertical ? 'deltaY' : 'deltaX']) > self.options.swipeThreshold) {
								if(ev.gesture.direction == 'right') self.prevSlide(); else if(ev.gesture.direction == 'left') self.nextSlide();
							}
							break;
					}
				});
			}

			// pause on hover handling
			if(this.options.pauseOnHover) {
				this.hoverHandler = function() {
					if(self.options.autoRotation) {
						self.galleryHover = true;
						self.pauseRotation();
					}
				};
				this.leaveHandler = function() {
					if(self.options.autoRotation) {
						self.galleryHover = false;
						self.resumeRotation();
					}
				};
				this.gallery.bind({mouseenter: this.hoverHandler, mouseleave: this.leaveHandler});
			}
		},
		onWindowResize: function(){
			if(this.options.autoHeight) {
				this.slidesHolder.css({height: this.slides.eq(this.currentIndex).outerHeight(true) });
			}
		},
		prevSlide: function() {
			if(!(this.options.disableWhileAnimating && this.galleryAnimating)) {
				this.prevIndex = this.currentIndex;
				if(this.currentIndex > 0) {
					this.currentIndex--;
					this.switchSlide();
				} else if(this.options.circularRotation) {
					this.currentIndex = this.stepsCount - 1;
					this.switchSlide();
				}
			}
		},
		nextSlide: function(fromAutoRotation) {
			if(!(this.options.disableWhileAnimating && this.galleryAnimating)) {
				this.prevIndex = this.currentIndex;
				if(this.currentIndex < this.stepsCount - 1) {
					this.currentIndex++;
					this.switchSlide();
				} else if(this.options.circularRotation || fromAutoRotation === true) {
					this.currentIndex = 0;
					this.switchSlide();
				}
			}
		},
		numSlide: function(c) {
			if(this.currentIndex != c) {
				this.prevIndex = this.currentIndex;
				this.currentIndex = c;
				this.switchSlide();
			}
		},
		switchSlide: function() {
			var self = this;
			if(this.slides.length > 1) {
				this.galleryAnimating = true;
				if(!this.options.animSpeed) {
					this.slides.eq(this.prevIndex).css({opacity:0});
				} else {
					this.slides.eq(this.prevIndex).stop().animate({opacity:0},{duration: this.options.animSpeed});
				}

				this.switchNext = function() {
					if(!self.options.animSpeed) {
						self.slides.eq(self.currentIndex).css({opacity:''});
					} else {
						self.slides.eq(self.currentIndex).stop().animate({opacity:1},{duration: self.options.animSpeed});
					}
					clearTimeout(this.nextTimer);
					this.nextTimer = setTimeout(function() {
						self.slides.eq(self.currentIndex).css({opacity:''});
						self.galleryAnimating = false;
						self.autoRotate();

						// onchange callback
						self.makeCallback('onChange', self);
					}, self.options.animSpeed);
				};

				if(this.options.switchSimultaneously) {
					self.switchNext();
				} else {
					clearTimeout(this.switchTimer);
					this.switchTimer = setTimeout(function(){
						self.switchNext();
					}, this.options.animSpeed);
				}
				this.refreshState();

				// onchange callback
				this.makeCallback('onBeforeChange', this);
			}
		},
		refreshState: function(initial) {
			this.slides.removeClass(this.options.activeClass).eq(this.currentIndex).addClass(this.options.activeClass);
			this.pagerLinks.removeClass(this.options.activeClass).eq(this.currentIndex).addClass(this.options.activeClass);
			this.curNum.html(this.currentIndex+1);
			this.allNum.html(this.stepsCount);

			// initial refresh
			if(this.options.autoHeight) {
				if(initial) {
					this.slidesHolder.css({height: this.slides.eq(this.currentIndex).outerHeight(true) });
				} else {
					this.slidesHolder.stop().animate({height: this.slides.eq(this.currentIndex).outerHeight(true)}, {duration: this.options.animSpeed});
				}
			}

			// disabled state
			if(!this.options.circularRotation) {
				this.btnPrev.add(this.btnNext).removeClass(this.options.disabledClass);
				if(this.currentIndex === 0) this.btnPrev.addClass(this.options.disabledClass);
				if(this.currentIndex === this.stepsCount - 1) this.btnNext.addClass(this.options.disabledClass);
			}

			// add class if not enough slides
			this.gallery.toggleClass('not-enough-slides', this.stepsCount === 1);
		},
		startRotation: function() {
			this.options.autoRotation = true;
			this.galleryHover = false;
			this.autoRotationStopped = false;
			this.resumeRotation();
		},
		stopRotation: function() {
			this.galleryHover = true;
			this.autoRotationStopped = true;
			this.pauseRotation();
		},
		pauseRotation: function() {
			this.gallery.addClass(this.options.autorotationDisabledClass);
			this.gallery.removeClass(this.options.autorotationActiveClass);
			clearTimeout(this.timer);
		},
		resumeRotation: function() {
			if(!this.autoRotationStopped) {
				this.gallery.addClass(this.options.autorotationActiveClass);
				this.gallery.removeClass(this.options.autorotationDisabledClass);
				this.autoRotate();
			}
		},
		autoRotate: function() {
			var self = this;
			clearTimeout(this.timer);
			if(this.options.autoRotation && !this.galleryHover && !this.autoRotationStopped) {
				this.gallery.addClass(this.options.autorotationActiveClass);
				this.timer = setTimeout(function(){
					self.nextSlide(true);
				}, this.options.switchTime);
			} else {
				this.pauseRotation();
			}
		},
		makeCallback: function(name) {
			if(typeof this.options[name] === 'function') {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		},
		destroy: function() {
			// navigation buttons handler
			this.btnPrev.unbind(this.options.event, this.btnPrevHandler);
			this.btnNext.unbind(this.options.event, this.btnNextHandler);
			this.pagerLinks.unbind(this.options.event, this.pagerLinksHandler);
			$(window).unbind('load resize orientationchange', this.resizeHandler);

			// remove autorotation handlers
			this.stopRotation();
			this.btnPlay.unbind(this.options.event, this.btnPlayHandler);
			this.btnPause.unbind(this.options.event, this.btnPauseHandler);
			this.btnPlayPause.unbind(this.options.event, this.btnPlayPauseHandler);
			this.gallery.bind({mouseenter: this.hoverHandler, mouseleave: this.leaveHandler});

			// remove swipe handler if used
			if(this.options.useSwipe && $.fn.hammer) {
				this.gallery.hammer().off('release dragleft dragright swipeleft swiperight');
			}
			if(typeof this.options.generatePagination === 'string') {
				this.pagerHolder.empty();
			}

			// remove unneeded classes and styles
			var unneededClasses = [this.options.galleryReadyClass, this.options.autorotationActiveClass, this.options.autorotationDisabledClass];
			this.gallery.removeClass(unneededClasses.join(' '));
			this.slidesHolder.add(this.slides).removeAttr('style');
		}
	};

	// detect device type
	var isTouchDevice = /MSIE 10.*Touch/.test(navigator.userAgent) || ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

	// jquery plugin
	$.fn.fadeGallery = function(opt){
		return this.each(function(){
			$(this).data('FadeGallery', new FadeGallery($.extend(opt,{holder:this})));
		});
	};
}(jQuery));

/*! http://mths.be/placeholder v2.0.7 by @mathias */
;(function(window, document, $) {

	// Opera Mini v7 doesn’t support placeholder although its DOM seems to indicate so
	var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
	var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
	var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
	var prototype = $.fn;
	var valHooks = $.valHooks;
	var propHooks = $.propHooks;
	var hooks;
	var placeholder;

	if (isInputSupported && isTextareaSupported) {

		placeholder = prototype.placeholder = function() {
			return this;
		};

		placeholder.input = placeholder.textarea = true;

	} else {

		placeholder = prototype.placeholder = function() {
			var $this = this;
			$this
				.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
				.not('.placeholder')
				.bind({
					'focus.placeholder': clearPlaceholder,
					'blur.placeholder': setPlaceholder
				})
				.data('placeholder-enabled', true)
				.trigger('blur.placeholder');
			return $this;
		};

		placeholder.input = isInputSupported;
		placeholder.textarea = isTextareaSupported;

		hooks = {
			'get': function(element) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value;
				}

				return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
			},
			'set': function(element, value) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value = value;
				}

				if (!$element.data('placeholder-enabled')) {
					return element.value = value;
				}
				if (value == '') {
					element.value = value;
					// Issue #56: Setting the placeholder causes problems if the element continues to have focus.
					if (element != safeActiveElement()) {
						// We can't use `triggerHandler` here because of dummy text/password inputs :(
						setPlaceholder.call(element);
					}
				} else if ($element.hasClass('placeholder')) {
					clearPlaceholder.call(element, true, value) || (element.value = value);
				} else {
					element.value = value;
				}
				// `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
				return $element;
			}
		};

		if (!isInputSupported) {
			valHooks.input = hooks;
			propHooks.value = hooks;
		}
		if (!isTextareaSupported) {
			valHooks.textarea = hooks;
			propHooks.value = hooks;
		}

		$(function() {
			// Look for forms
			$(document).delegate('form', 'submit.placeholder', function() {
				// Clear the placeholder values so they don't get submitted
				var $inputs = $('.placeholder', this).each(clearPlaceholder);
				setTimeout(function() {
					$inputs.each(setPlaceholder);
				}, 10);
			});
		});

		// Clear placeholder values upon page reload
		$(window).bind('beforeunload.placeholder', function() {
			$('.placeholder').each(function() {
				this.value = '';
			});
		});

	}

	function args(elem) {
		// Return an object of element attributes
		var newAttrs = {};
		var rinlinejQuery = /^jQuery\d+$/;
		$.each(elem.attributes, function(i, attr) {
			if (attr.specified && !rinlinejQuery.test(attr.name)) {
				newAttrs[attr.name] = attr.value;
			}
		});
		return newAttrs;
	}

	function clearPlaceholder(event, value) {
		var input = this;
		var $input = $(input);
		if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
			if ($input.data('placeholder-password')) {
				$input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
				// If `clearPlaceholder` was called from `$.valHooks.input.set`
				if (event === true) {
					return $input[0].value = value;
				}
				$input.focus();
			} else {
				input.value = '';
				$input.removeClass('placeholder');
				input == safeActiveElement() && input.select();
			}
		}
	}

	function setPlaceholder() {
		var $replacement;
		var input = this;
		var $input = $(input);
		var id = this.id;
		if (input.value == '') {
			if (input.type == 'password') {
				if (!$input.data('placeholder-textinput')) {
					try {
						$replacement = $input.clone().attr({ 'type': 'text' });
					} catch(e) {
						$replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
					}
					$replacement
						.removeAttr('name')
						.data({
							'placeholder-password': $input,
							'placeholder-id': id
						})
						.bind('focus.placeholder', clearPlaceholder);
					$input
						.data({
							'placeholder-textinput': $replacement,
							'placeholder-id': id
						})
						.before($replacement);
				}
				$input = $input.removeAttr('id').hide().prev().attr('id', id).show();
				// Note: `$input[0] != input` now!
			}
			$input.addClass('placeholder');
			$input[0].value = $input.attr('placeholder');
		} else {
			$input.removeClass('placeholder');
		}
	}

	function safeActiveElement() {
		// Avoid IE9 `document.activeElement` of death
		// https://github.com/mathiasbynens/jquery-placeholder/pull/99
		try {
			return document.activeElement;
		} catch (err) {}
	}

}(this, document, jQuery));

/*! Hammer.JS - v1.0.5 - 2013-04-07
 * http://eightmedia.github.com/hammer.js
 *
 * Copyright (c) 2013 Jorik Tangelder <j.tangelder@gmail.com>;
 * Licensed under the MIT license */
; (function (t, e) { "use strict"; function n() { if (!i.READY) { i.event.determineEventTypes(); for (var t in i.gestures) i.gestures.hasOwnProperty(t) && i.detection.register(i.gestures[t]); i.event.onTouch(i.DOCUMENT, i.EVENT_MOVE, i.detection.detect), i.event.onTouch(i.DOCUMENT, i.EVENT_END, i.detection.detect), i.READY = !0 } } var i = function (t, e) { return new i.Instance(t, e || {}) }; i.defaults = { stop_browser_behavior: { userSelect: "none", touchAction: "none", touchCallout: "none", contentZooming: "none", userDrag: "none", tapHighlightColor: "rgba(0,0,0,0)" } }, i.HAS_POINTEREVENTS = navigator.pointerEnabled || navigator.msPointerEnabled, i.HAS_TOUCHEVENTS = "ontouchstart" in t, i.MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i, i.NO_MOUSEEVENTS = i.HAS_TOUCHEVENTS && navigator.userAgent.match(i.MOBILE_REGEX), i.EVENT_TYPES = {}, i.DIRECTION_DOWN = "down", i.DIRECTION_LEFT = "left", i.DIRECTION_UP = "up", i.DIRECTION_RIGHT = "right", i.POINTER_MOUSE = "mouse", i.POINTER_TOUCH = "touch", i.POINTER_PEN = "pen", i.EVENT_START = "start", i.EVENT_MOVE = "move", i.EVENT_END = "end", i.DOCUMENT = document, i.plugins = {}, i.READY = !1, i.Instance = function (t, e) { var r = this; return n(), this.element = t, this.enabled = !0, this.options = i.utils.extend(i.utils.extend({}, i.defaults), e || {}), this.options.stop_browser_behavior && i.utils.stopDefaultBrowserBehavior(this.element, this.options.stop_browser_behavior), i.event.onTouch(t, i.EVENT_START, function (t) { r.enabled && i.detection.startDetect(r, t) }), this }, i.Instance.prototype = { on: function (t, e) { for (var n = t.split(" "), i = 0; n.length > i; i++) this.element.addEventListener(n[i], e, !1); return this }, off: function (t, e) { for (var n = t.split(" "), i = 0; n.length > i; i++) this.element.removeEventListener(n[i], e, !1); return this }, trigger: function (t, e) { var n = i.DOCUMENT.createEvent("Event"); n.initEvent(t, !0, !0), n.gesture = e; var r = this.element; return i.utils.hasParent(e.target, r) && (r = e.target), r.dispatchEvent(n), this }, enable: function (t) { return this.enabled = t, this } }; var r = null, o = !1, s = !1; i.event = { bindDom: function (t, e, n) { for (var i = e.split(" "), r = 0; i.length > r; r++) t.addEventListener(i[r], n, !1) }, onTouch: function (t, e, n) { var a = this; this.bindDom(t, i.EVENT_TYPES[e], function (c) { var u = c.type.toLowerCase(); if (!u.match(/mouse/) || !s) { (u.match(/touch/) || u.match(/pointerdown/) || u.match(/mouse/) && 1 === c.which) && (o = !0), u.match(/touch|pointer/) && (s = !0); var h = 0; o && (i.HAS_POINTEREVENTS && e != i.EVENT_END ? h = i.PointerEvent.updatePointer(e, c) : u.match(/touch/) ? h = c.touches.length : s || (h = u.match(/up/) ? 0 : 1), h > 0 && e == i.EVENT_END ? e = i.EVENT_MOVE : h || (e = i.EVENT_END), h || null === r ? r = c : c = r, n.call(i.detection, a.collectEventData(t, e, c)), i.HAS_POINTEREVENTS && e == i.EVENT_END && (h = i.PointerEvent.updatePointer(e, c))), h || (r = null, o = !1, s = !1, i.PointerEvent.reset()) } }) }, determineEventTypes: function () { var t; t = i.HAS_POINTEREVENTS ? i.PointerEvent.getEvents() : i.NO_MOUSEEVENTS ? ["touchstart", "touchmove", "touchend touchcancel"] : ["touchstart mousedown", "touchmove mousemove", "touchend touchcancel mouseup"], i.EVENT_TYPES[i.EVENT_START] = t[0], i.EVENT_TYPES[i.EVENT_MOVE] = t[1], i.EVENT_TYPES[i.EVENT_END] = t[2] }, getTouchList: function (t) { return i.HAS_POINTEREVENTS ? i.PointerEvent.getTouchList() : t.touches ? t.touches : [{ identifier: 1, pageX: t.pageX, pageY: t.pageY, target: t.target }] }, collectEventData: function (t, e, n) { var r = this.getTouchList(n, e), o = i.POINTER_TOUCH; return (n.type.match(/mouse/) || i.PointerEvent.matchType(i.POINTER_MOUSE, n)) && (o = i.POINTER_MOUSE), { center: i.utils.getCenter(r), timeStamp: (new Date).getTime(), target: n.target, touches: r, eventType: e, pointerType: o, srcEvent: n, preventDefault: function () { this.srcEvent.preventManipulation && this.srcEvent.preventManipulation(), this.srcEvent.preventDefault && this.srcEvent.preventDefault() }, stopPropagation: function () { this.srcEvent.stopPropagation() }, stopDetect: function () { return i.detection.stopDetect() } } } }, i.PointerEvent = { pointers: {}, getTouchList: function () { var t = this, e = []; return Object.keys(t.pointers).sort().forEach(function (n) { e.push(t.pointers[n]) }), e }, updatePointer: function (t, e) { return t == i.EVENT_END ? this.pointers = {} : (e.identifier = e.pointerId, this.pointers[e.pointerId] = e), Object.keys(this.pointers).length }, matchType: function (t, e) { if (!e.pointerType) return !1; var n = {}; return n[i.POINTER_MOUSE] = e.pointerType == e.MSPOINTER_TYPE_MOUSE || e.pointerType == i.POINTER_MOUSE, n[i.POINTER_TOUCH] = e.pointerType == e.MSPOINTER_TYPE_TOUCH || e.pointerType == i.POINTER_TOUCH, n[i.POINTER_PEN] = e.pointerType == e.MSPOINTER_TYPE_PEN || e.pointerType == i.POINTER_PEN, n[t] }, getEvents: function () { return ["pointerdown MSPointerDown", "pointermove MSPointerMove", "pointerup pointercancel MSPointerUp MSPointerCancel"] }, reset: function () { this.pointers = {} } }, i.utils = { extend: function (t, n, i) { for (var r in n) t[r] !== e && i || (t[r] = n[r]); return t }, hasParent: function (t, e) { for (; t;) { if (t == e) return !0; t = t.parentNode } return !1 }, getCenter: function (t) { for (var e = [], n = [], i = 0, r = t.length; r > i; i++) e.push(t[i].pageX), n.push(t[i].pageY); return { pageX: (Math.min.apply(Math, e) + Math.max.apply(Math, e)) / 2, pageY: (Math.min.apply(Math, n) + Math.max.apply(Math, n)) / 2 } }, getVelocity: function (t, e, n) { return { x: Math.abs(e / t) || 0, y: Math.abs(n / t) || 0 } }, getAngle: function (t, e) { var n = e.pageY - t.pageY, i = e.pageX - t.pageX; return 180 * Math.atan2(n, i) / Math.PI }, getDirection: function (t, e) { var n = Math.abs(t.pageX - e.pageX), r = Math.abs(t.pageY - e.pageY); return n >= r ? t.pageX - e.pageX > 0 ? i.DIRECTION_LEFT : i.DIRECTION_RIGHT : t.pageY - e.pageY > 0 ? i.DIRECTION_UP : i.DIRECTION_DOWN }, getDistance: function (t, e) { var n = e.pageX - t.pageX, i = e.pageY - t.pageY; return Math.sqrt(n * n + i * i) }, getScale: function (t, e) { return t.length >= 2 && e.length >= 2 ? this.getDistance(e[0], e[1]) / this.getDistance(t[0], t[1]) : 1 }, getRotation: function (t, e) { return t.length >= 2 && e.length >= 2 ? this.getAngle(e[1], e[0]) - this.getAngle(t[1], t[0]) : 0 }, isVertical: function (t) { return t == i.DIRECTION_UP || t == i.DIRECTION_DOWN }, stopDefaultBrowserBehavior: function (t, e) { var n, i = ["webkit", "khtml", "moz", "ms", "o", ""]; if (e && t.style) { for (var r = 0; i.length > r; r++) for (var o in e) e.hasOwnProperty(o) && (n = o, i[r] && (n = i[r] + n.substring(0, 1).toUpperCase() + n.substring(1)), t.style[n] = e[o]); "none" == e.userSelect && (t.onselectstart = function () { return !1 }) } } }, i.detection = { gestures: [], current: null, previous: null, stopped: !1, startDetect: function (t, e) { this.current || (this.stopped = !1, this.current = { inst: t, startEvent: i.utils.extend({}, e), lastEvent: !1, name: "" }, this.detect(e)) }, detect: function (t) { if (this.current && !this.stopped) { t = this.extendEventData(t); for (var e = this.current.inst.options, n = 0, r = this.gestures.length; r > n; n++) { var o = this.gestures[n]; if (!this.stopped && e[o.name] !== !1 && o.handler.call(o, t, this.current.inst) === !1) { this.stopDetect(); break } } return this.current && (this.current.lastEvent = t), t.eventType == i.EVENT_END && !t.touches.length - 1 && this.stopDetect(), t } }, stopDetect: function () { this.previous = i.utils.extend({}, this.current), this.current = null, this.stopped = !0 }, extendEventData: function (t) { var e = this.current.startEvent; if (e && (t.touches.length != e.touches.length || t.touches === e.touches)) { e.touches = []; for (var n = 0, r = t.touches.length; r > n; n++) e.touches.push(i.utils.extend({}, t.touches[n])) } var o = t.timeStamp - e.timeStamp, s = t.center.pageX - e.center.pageX, a = t.center.pageY - e.center.pageY, c = i.utils.getVelocity(o, s, a); return i.utils.extend(t, { deltaTime: o, deltaX: s, deltaY: a, velocityX: c.x, velocityY: c.y, distance: i.utils.getDistance(e.center, t.center), angle: i.utils.getAngle(e.center, t.center), direction: i.utils.getDirection(e.center, t.center), scale: i.utils.getScale(e.touches, t.touches), rotation: i.utils.getRotation(e.touches, t.touches), startEvent: e }), t }, register: function (t) { var n = t.defaults || {}; return n[t.name] === e && (n[t.name] = !0), i.utils.extend(i.defaults, n, !0), t.index = t.index || 1e3, this.gestures.push(t), this.gestures.sort(function (t, e) { return t.index < e.index ? -1 : t.index > e.index ? 1 : 0 }), this.gestures } }, i.gestures = i.gestures || {}, i.gestures.Hold = { name: "hold", index: 10, defaults: { hold_timeout: 500, hold_threshold: 1 }, timer: null, handler: function (t, e) { switch (t.eventType) { case i.EVENT_START: clearTimeout(this.timer), i.detection.current.name = this.name, this.timer = setTimeout(function () { "hold" == i.detection.current.name && e.trigger("hold", t) }, e.options.hold_timeout); break; case i.EVENT_MOVE: t.distance > e.options.hold_threshold && clearTimeout(this.timer); break; case i.EVENT_END: clearTimeout(this.timer) } } }, i.gestures.Tap = { name: "tap", index: 100, defaults: { tap_max_touchtime: 250, tap_max_distance: 10, tap_always: !0, doubletap_distance: 20, doubletap_interval: 300 }, handler: function (t, e) { if (t.eventType == i.EVENT_END) { var n = i.detection.previous, r = !1; if (t.deltaTime > e.options.tap_max_touchtime || t.distance > e.options.tap_max_distance) return; n && "tap" == n.name && t.timeStamp - n.lastEvent.timeStamp < e.options.doubletap_interval && t.distance < e.options.doubletap_distance && (e.trigger("doubletap", t), r = !0), (!r || e.options.tap_always) && (i.detection.current.name = "tap", e.trigger(i.detection.current.name, t)) } } }, i.gestures.Swipe = { name: "swipe", index: 40, defaults: { swipe_max_touches: 1, swipe_velocity: .7 }, handler: function (t, e) { if (t.eventType == i.EVENT_END) { if (e.options.swipe_max_touches > 0 && t.touches.length > e.options.swipe_max_touches) return; (t.velocityX > e.options.swipe_velocity || t.velocityY > e.options.swipe_velocity) && (e.trigger(this.name, t), e.trigger(this.name + t.direction, t)) } } }, i.gestures.Drag = { name: "drag", index: 50, defaults: { drag_min_distance: 10, drag_max_touches: 1, drag_block_horizontal: !1, drag_block_vertical: !1, drag_lock_to_axis: !1, drag_lock_min_distance: 25 }, triggered: !1, handler: function (t, n) { if (i.detection.current.name != this.name && this.triggered) return n.trigger(this.name + "end", t), this.triggered = !1, e; if (!(n.options.drag_max_touches > 0 && t.touches.length > n.options.drag_max_touches)) switch (t.eventType) { case i.EVENT_START: this.triggered = !1; break; case i.EVENT_MOVE: if (t.distance < n.options.drag_min_distance && i.detection.current.name != this.name) return; i.detection.current.name = this.name, (i.detection.current.lastEvent.drag_locked_to_axis || n.options.drag_lock_to_axis && n.options.drag_lock_min_distance <= t.distance) && (t.drag_locked_to_axis = !0); var r = i.detection.current.lastEvent.direction; t.drag_locked_to_axis && r !== t.direction && (t.direction = i.utils.isVertical(r) ? 0 > t.deltaY ? i.DIRECTION_UP : i.DIRECTION_DOWN : 0 > t.deltaX ? i.DIRECTION_LEFT : i.DIRECTION_RIGHT), this.triggered || (n.trigger(this.name + "start", t), this.triggered = !0), n.trigger(this.name, t), n.trigger(this.name + t.direction, t), (n.options.drag_block_vertical && i.utils.isVertical(t.direction) || n.options.drag_block_horizontal && !i.utils.isVertical(t.direction)) && t.preventDefault(); break; case i.EVENT_END: this.triggered && n.trigger(this.name + "end", t), this.triggered = !1 } } }, i.gestures.Transform = { name: "transform", index: 45, defaults: { transform_min_scale: .01, transform_min_rotation: 1, transform_always_block: !1 }, triggered: !1, handler: function (t, n) { if (i.detection.current.name != this.name && this.triggered) return n.trigger(this.name + "end", t), this.triggered = !1, e; if (!(2 > t.touches.length)) switch (n.options.transform_always_block && t.preventDefault(), t.eventType) { case i.EVENT_START: this.triggered = !1; break; case i.EVENT_MOVE: var r = Math.abs(1 - t.scale), o = Math.abs(t.rotation); if (n.options.transform_min_scale > r && n.options.transform_min_rotation > o) return; i.detection.current.name = this.name, this.triggered || (n.trigger(this.name + "start", t), this.triggered = !0), n.trigger(this.name, t), o > n.options.transform_min_rotation && n.trigger("rotate", t), r > n.options.transform_min_scale && (n.trigger("pinch", t), n.trigger("pinch" + (1 > t.scale ? "in" : "out"), t)); break; case i.EVENT_END: this.triggered && n.trigger(this.name + "end", t), this.triggered = !1 } } }, i.gestures.Touch = { name: "touch", index: -1 / 0, defaults: { prevent_default: !1, prevent_mouseevents: !1 }, handler: function (t, n) { return n.options.prevent_mouseevents && t.pointerType == i.POINTER_MOUSE ? (t.stopDetect(), e) : (n.options.prevent_default && t.preventDefault(), t.eventType == i.EVENT_START && n.trigger(this.name, t), e) } }, i.gestures.Release = { name: "release", index: 1 / 0, handler: function (t, e) { t.eventType == i.EVENT_END && e.trigger(this.name, t) } }, "object" == typeof module && "object" == typeof module.exports ? module.exports = i : (t.Hammer = i, "function" == typeof t.define && t.define.amd && t.define("hammer", [], function () { return i })) })(this), function (t, e) { "use strict"; t !== e && (Hammer.event.bindDom = function (n, i, r) { t(n).on(i, function (t) { var n = t.originalEvent || t; n.pageX === e && (n.pageX = t.pageX, n.pageY = t.pageY), n.target || (n.target = t.target), n.which === e && (n.which = n.button), n.preventDefault || (n.preventDefault = t.preventDefault), n.stopPropagation || (n.stopPropagation = t.stopPropagation), r.call(this, n) }) }, Hammer.Instance.prototype.on = function (e, n) { return t(this.element).on(e, n) }, Hammer.Instance.prototype.off = function (e, n) { return t(this.element).off(e, n) }, Hammer.Instance.prototype.trigger = function (e, n) { var i = t(this.element); return i.has(n.target).length && (i = t(n.target)), i.trigger({ type: e, gesture: n }) }, t.fn.hammer = function (e) { return this.each(function () { var n = t(this), i = n.data("hammer"); i ? i && e && Hammer.utils.extend(i.options, e) : n.data("hammer", new Hammer(this, e || {})) }) }) }(window.jQuery || window.Zepto);

/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var pluses = /\+/g;

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        if (s.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape...
            s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }

        try {
            // Replace server-side written pluses with spaces.
            // If we can't decode the cookie, ignore it, it's unusable.
            // If we can't parse the cookie, ignore it, it's unusable.
            s = decodeURIComponent(s.replace(pluses, ' '));
            return config.json ? JSON.parse(s) : s;
        } catch (e) { }
    }

    function read(s, converter) {
        var value = config.raw ? s : parseCookieValue(s);
        return $.isFunction(converter) ? converter(value) : value;
    }

    var config = $.cookie = function (key, value, options) {

        // Write

        if (arguments.length > 1 && !$.isFunction(value)) {
            options = $.extend({}, config.defaults, options);

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setTime(+t + days * 864e+5);
            }

            return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path ? '; path=' + options.path : '',
				options.domain ? '; domain=' + options.domain : '',
				options.secure ? '; secure' : ''
            ].join(''));
        }

        // Read

        var result = key ? undefined : {};

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all. Also prevents odd result when
        // calling $.cookie().
        var cookies = document.cookie ? document.cookie.split('; ') : [];

        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            var name = decode(parts.shift());
            var cookie = parts.join('=');

            if (key && key === name) {
                // If second argument (value) is a function it's a converter...
                result = read(cookie, value);
                break;
            }

            // Prevent storing a cookie that we couldn't decode.
            if (!key && (cookie = read(cookie)) !== undefined) {
                result[name] = cookie;
            }
        }

        return result;
    };

    config.defaults = {};

    $.removeCookie = function (key, options) {
        if ($.cookie(key) === undefined) {
            return false;
        }

        // Must not alter options, thus extending a fresh object...
        $.cookie(key, '', $.extend({}, options, { expires: -1 }));
        return !$.cookie(key);
    };

}));