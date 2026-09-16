;(function ($) {

    "use strict";
    
    var pxl_scroll_top;
    var pxl_window_height;
    var pxl_window_width;
    var pxl_scroll_status = '';
    var pxl_last_scroll_top = 0;
    var pxl_post_slip = false;

    $(window).on('load', function () {
        let preloader = $('.pxl-loader');
        if (preloader.length) {
            if(preloader.hasClass('style-2')) {
                setTimeout(function () {
                    $(".pxl-loader").addClass("is-loaded").removeClass("is-loading");
                }, 300);
            }else {
                $(".pxl-loader").addClass("is-loaded").removeClass("is-loading");
            }
        }
        $('.pxl-swiper-slider, .pxl-header-mobile-elementor').css('opacity', '1');
        $('.pxl-gallery-scroll').parents('body').addClass('body-overflow').addClass('body-visible-sm');
        pxl_window_width = $(window).width();
        pxl_window_height = $(window).height();
        floka_header_sticky();
        floka_header_mobile();
        floka_scroll_to_top();
        floka_footer_fixed();
        floka_shop_quantity();
        floka_submenu_responsive();
        floka_panel_anchor_toggle();
        floka_header_left_scroll();
        floka_image_effect_parallax();
        floka_image_distortion();
        floka_crs_scroll_horizontal();
        floka_scrolling_effect();
        floka_pxl_draw_stroke();
    });

    $(window).on('scroll', function () {
        pxl_scroll_top = $(window).scrollTop();
        pxl_window_height = $(window).height();
        pxl_window_width = $(window).width();
        if (pxl_scroll_top < pxl_last_scroll_top) {
            pxl_scroll_status = 'up';
        } else {
            pxl_scroll_status = 'down';
        }
        pxl_last_scroll_top = pxl_scroll_top;
        floka_header_sticky();
        floka_scroll_to_top();
        floka_footer_fixed();
        floka_ptitle_scroll_opacity();
        floka_header_left_scroll();
        if (pxl_scroll_top < 100) {
            $('.elementor > .pin-spacer').removeClass('scroll-top-active');
        }
    });

    $(window).on('resize', function () {
        pxl_window_height = $(window).height();
        pxl_window_width = $(window).width();
        floka_submenu_responsive();
        floka_header_mobile();
        floka_crs_scroll_horizontal();
        floka_image_effect_scale();
    });

    $(document).ready(function () {
        $(".pxl-loader").addClass("is-loading");
        floka_el_parallax();
        floka_backtotop_progess_bar();
        floka_type_file_upload();
        floka_image_package();
        active_title_tab1();
        floka_image_effect_scale();

        // Custom Dots Slider Revolution
        setTimeout(function() {
            $('.tp-bullets.theme-style2').append('<span class="pxl-revslider-arrow-prev"></span><span class="pxl-revslider-arrow-next"></span>');
            $('.tp-bullets.theme-style2').parent().find('.tparrows').addClass('pxl-revslider-arrow-hide');

            $('.revslider-initialised').each(function () {
                $(this).find('.pxl-revslider-arrow-prev').on('click', function () {
                    $(this).parents('.revslider-initialised').find('.tp-leftarrow').trigger('click');
                });
                $(this).find('.pxl-revslider-arrow-next').on('click', function () {
                    $(this).parents('.revslider-initialised').find('.tp-rightarrow').trigger('click');
                });
            });

        }, 500);

        // Deactive Link
        $('.deactive-click a').on("click", function (e) {
            e.preventDefault();
        });

        /* Start Menu Mobile */
        $('.pxl-header-menu li.menu-item-has-children').append('<span class="pxl-menu-toggle"></span>');
        $('.pxl-menu-toggle').on('click', function () {
            if( $(this).hasClass('active')){
                $(this).closest('ul').find('.pxl-menu-toggle.active').toggleClass('active');
                $(this).closest('ul').find('.sub-menu.active').toggleClass('active').slideToggle();    
            }else{
                $(this).closest('ul').find('.pxl-menu-toggle.active').toggleClass('active');
                $(this).closest('ul').find('.sub-menu.active').toggleClass('active').slideToggle();
                $(this).toggleClass('active');
                $(this).parent().find('> .sub-menu').toggleClass('active');
                $(this).parent().find('> .sub-menu').slideToggle();
            }      
        });

        $("#pxl-nav-mobile, .pxl-anchor-mobile-menu").on('click', function () {
            $(this).toggleClass('active');
            $('body').addClass('body-overflow');
            $('.pxl-header-menu').toggleClass('active');
        });

        $(".pxl-menu-close, .pxl-header-menu-backdrop, #pxl-header-mobile .pxl-menu-primary a.is-one-page").on('click', function () {
            $(this).parents('.pxl-header-main').find('.pxl-header-menu').removeClass('active');
            $('#pxl-nav-mobile').removeClass('active');
            $('body').toggleClass('body-overflow');
        });

        /* End Menu Mobile */

        /* Menu Vertical */
        $('.pxl-nav-vertical li.menu-item-has-children > a').append('<span class="pxl-arrow-toggle"><i class="flaticon-right-arrow"></i></span>');
        $('.pxl-nav-vertical li.menu-item-has-children > a').on('click', function () {
            if( $(this).hasClass('active')){
                $(this).next().toggleClass('active').slideToggle(); 
            }else{
                $(this).closest('ul').find('.sub-menu.active').toggleClass('active').slideToggle();
                $(this).closest('ul').find('a.active').toggleClass('active');
                $(this).find('.pxl-menu-toggle.active').toggleClass('active');
                $(this).toggleClass('active');
                $(this).next().toggleClass('active').slideToggle();
            }   
        });

        /* Menu Hidden Sidebar Popup */
        $('.pxl-menu-hidden-sidebar li.menu-item-has-children > a').append('<span class="pxl-arrow-toggle"><i class="flaticon-right-arrow"></i></span>');
        $('.pxl-menu-hidden-sidebar li.menu-item-has-children > a').on('click', function () {
            if( $(this).hasClass('active')){
                $(this).next().toggleClass('active').slideToggle(); 
            }else{
                $(this).closest('ul').find('.sub-menu.active').toggleClass('active').slideToggle();
                $(this).closest('ul').find('a.active').toggleClass('active');
                $(this).find('.pxl-menu-toggle.active').toggleClass('active');
                $(this).toggleClass('active');
                $(this).next().toggleClass('active').slideToggle();
            }   
        });

        $('.pxl-menu-hidden-sidebar .pxl-menu-button').on('click', function () {
            $(this).parents('.pxl-menu-hidden-sidebar').toggleClass('active');
            $(this).parents('.pxl-menu-hidden-sidebar').removeClass('boxOut');
            $(this).parents('body').toggleClass('body-overflow');
        });
        $('.pxl-menu-popup-overlay').on('click', function () {
            $(this).parent().removeClass('active');
            $(this).parent().addClass('boxOut');
            $(this).parents('body').removeClass('body-overflow');
        });
        $('.pxl-menu-popup-close, .pxl-menu-hidden-sidebar .pxl-menu-hidden a.is-one-page').on('click', function () {
            $(this).parents('.pxl-menu-hidden-sidebar').removeClass('active');
            $(this).parents('.pxl-menu-hidden-sidebar').addClass('boxOut');
            $(this).parents('body').removeClass('body-overflow');
        });


        /* Mega Menu Max Height */
        var m_h_mega = $('li.pxl-megamenu > .sub-menu > .pxl-mega-menu-elementor').outerHeight();
        var w_h_mega = $(window).height();
        var w_h_mega_css = w_h_mega - 120;
        if(m_h_mega > w_h_mega) {
            $('li.pxl-megamenu > .sub-menu > .pxl-mega-menu-elementor').css('max-height', w_h_mega_css + 'px');
            $('li.pxl-megamenu > .sub-menu > .pxl-mega-menu-elementor').css('overflow-x', 'scroll');
        }
        /* End Mega Menu Max Height */

        /* Scroll To Top */
        $('.pxl-scroll-top').on('click', function () {
            $('html, body').animate({scrollTop: 0}, 1200);
            $(this).parents('.pxl-wapper').find('.elementor > .pin-spacer').addClass('scroll-top-active');
            return false;
        });

        /* Animate Time Delay */
        $('.pxl-grid-masonry').each(function () {
            var eltime = 80;
            var elt_inner = $(this).children().length;
            var _elt = elt_inner - 1;
            $(this).find('> .pxl-grid-item > .wow').each(function (index, obj) {
                $(this).css('animation-delay', eltime + 'ms');
                if (_elt === index) {
                    eltime = 80;
                    _elt = _elt + elt_inner;
                } else {
                    eltime = eltime + 80;
                }
            });
        });

        $('.btn-text-nina').each(function () {
            var eltime = 0.045;
            var elt_inner = $(this).children().length;
            var _elt = elt_inner - 1;
            $(this).find('> .pxl--btn-text > span').each(function (index, obj) {
                $(this).css('transition-delay', eltime + 's');
                eltime = eltime + 0.045;
            });
        });

        $('.btn-text-nanuk').each(function () {
            var eltime = 0.05;
            var elt_inner = $(this).children().length;
            var _elt = elt_inner - 1;
            $(this).find('> .pxl--btn-text > span').each(function (index, obj) {
                $(this).css('animation-delay', eltime + 's');
                eltime = eltime + 0.05;
            });
        });

        
        /* End Animate Time Delay */

        /* Lightbox Popup */
        setTimeout(function() {
            $('.pxl-action-popup').magnificPopup({
                type: 'iframe',
                mainClass: 'mfp-fade',
                removalDelay: 160,
                preloader: false,
                fixedContentPos: false
            });
        }, 300);  

        $('.pxl-gallery-lightbox').each(function () {
            $(this).magnificPopup({
                delegate: 'a.lightbox',
                type: 'image',
                gallery: {
                    enabled: true
                },
                mainClass: 'mfp-fade',
            });
        });

        /* Page Title Parallax */
        if($('#pxl-page-title-default').hasClass('pxl--parallax')) {
            $(this).stellar();
        }

        /* Cart Sidebar Popup */
        $(".pxl-cart-sidebar-button").on('click', function () {
            $('body').addClass('body-overflow');
            $('#pxl-cart-sidebar').addClass('active');
        });
        $("#pxl-cart-sidebar .pxl-popup--overlay, #pxl-cart-sidebar .pxl-item--close, #pxl-cart-sidebar .pxl-popup--close2").on('click', function () {
            $('body').removeClass('body-overflow');
            $('#pxl-cart-sidebar').removeClass('active');
        });

        /* Start Icon Bounce */
        var boxEls = $('.el-bounce, .pxl-image-effect1, .el-effect-zigzag');
        $.each(boxEls, function(boxIndex, boxEl) {
            loopToggleClass(boxEl, 'active');
        });

        function loopToggleClass(el, toggleClass) {
            el = $(el);
            let counter = 0;
            if (el.hasClass(toggleClass)) {
                waitFor(function () {
                    counter++;
                    return counter == 2;
                }, function () {
                    counter = 0;
                    el.removeClass(toggleClass);
                    loopToggleClass(el, toggleClass);
                }, 'Deactivate', 1000);
            } else {
                waitFor(function () {
                    counter++;
                    return counter == 3;
                }, function () {
                    counter = 0;
                    el.addClass(toggleClass);
                    loopToggleClass(el, toggleClass);
                }, 'Activate', 1000);
            }
        }

        function waitFor(condition, callback, message, time) {
            if (message == null || message == '' || typeof message == 'undefined') {
                message = 'Timeout';
            }
            if (time == null || time == '' || typeof time == 'undefined') {
                time = 100;
            }
            var cond = condition();
            if (cond) {
                callback();
            } else {
                setTimeout(function() {
                    waitFor(condition, callback, message, time);
                }, time);
            }
        }
        /* End Icon Bounce */

        /* Scroll Anchor */
        let anchorButtons = $('.pxl-atc-anchor');
        if (anchorButtons.length) {
            let button = anchorButtons.find('.btn');
            $(button).on('click', function(e) {
                e.preventDefault(); 
                let target = $(this).attr('data-anchor');
                $('html, body').animate({
                    scrollTop: $(target).offset().top - 80
                }, 1000); 
            });
        }
        /* End Scroll Anchor */

        /* Rewards - Hover */
        let anchorReward = $('.pxl-rewards1');
        if (anchorReward.length){
            $('.pxl-rewards1 .pxl--item').hover(
              function () {
                $(this).addClass('active');
                $(this).prev('.pxl--item').addClass('prev-active');
                $(this).next('.pxl--item').addClass('next-active');
            },
            function () {
                $(this).removeClass('active');
                $(this).prev('.pxl--item').removeClass('prev-active');
                $(this).next('.pxl--item').removeClass('next-active');
            }
            );
        }

        /* End Rewards - Hover */


        function active_title_tab1() {
            let btnActive = $('.pxl--btn-icon');
            let tabTitleSelector = '.pxl-tab--title';

            if (!btnActive.length) return;

            btnActive.on('click', function () {
                let $icon = $(this);
                let $parent = $icon.closest('.pxl-tabs--title');
                let $tabItems = $parent.find(tabTitleSelector);

                if ($parent.hasClass('active')) {
                    gsap.to($tabItems, {
                        duration: 0.5,
                        width: 0,
                        padding: 0,
                        margin: 0,
                        opacity: 0,
                        ease: "power2.inOut",
                        onComplete: function () {
                            $parent.removeClass('active');
                            $tabItems.css('display', 'none');
                        }
                    });

                } else {
                    $parent.addClass('active');
                    $tabItems.css('display', 'flex');

                    gsap.fromTo($tabItems,
                    {
                        width: 0,
                        padding: 0,
                        margin: 0,
                        opacity: 0
                    },
                    {
                        duration: 0.5,
                        width: 'auto',
                        margin: '0 60px 0 0',
                        opacity: 1,
                        ease: "power2.out"
                    }
                    );

                }
            });
        }


        /* Case Image Package */
        function floka_image_package(){
            const wrapper = document.querySelectorAll(".pxl-image--package");
            if (wrapper.length) {
              ScrollTrigger.create({
                trigger: wrapper,
                start: "top-=100 center",
                end: "bottom+=200 bottom",
                toggleActions: "play reverse play reverse",
                onEnter: () => {
                    gsap.to(".image1", {
                        x: -75,
                        y: 10,
                        rotate: -15,
                        duration: 1,
                        ease: "none"
                    });

                    gsap.to(".image3", {
                        x: 75,
                        y: 10,
                        rotate: 15,
                        duration: 1,
                        ease: "none"
                    });

                },
                onLeaveBack: () => {
                  gsap.to(".image1", {
                    x: 0,
                    y: 0,
                    rotate: 0,
                    duration: 1,
                    ease: "none"
                });
                  gsap.to(".image3", {
                    x: 0,
                    y: 0,
                    rotate: 0,
                    duration: 1,
                    ease: "none"
                });
              }
          });
          }
      }
        /* End Case Image Package */

        /* Image Effect */
      if($('.pxl-image-tilt').length){
        $('.pxl-image-tilt').parents('.elementor-top-section').addClass('pxl-image-tilt-active');
        $('.pxl-image-tilt').each(function () {
            var pxl_maxtilt = $(this).data('maxtilt'),
            pxl_speedtilt = $(this).data('speedtilt'),
            pxl_perspectivetilt = $(this).data('perspectivetilt');
            VanillaTilt.init(this, {
                max: pxl_maxtilt,
                speed: pxl_speedtilt,
                perspective: pxl_perspectivetilt
            });
        });
    }
        /* End Image Effect */


         /* Number Active */
    $(document).ready(function () {
        const items = document.querySelectorAll('.pxl-number .pxl-item');

        items.forEach((item, index) => {
            item.addEventListener('mouseenter', () => {
                items.forEach(el => el.classList.remove('active'));

                for (let i = 0; i <= index; i++) {
                    items[i].classList.add('active');
                }
            });
        });
    });
        /* End Number Active */


    $('.pxl-post-reveal').each(function() {
        const $reveal = $(this);
        $reveal.find('.pxl-item--category').on('mouseenter', function() {
            const index = $(this).index();
            $reveal.find('.pxl-item--category, .pxl-post--inner').removeClass('active');
            $(this).addClass('active');
            $reveal.find('.pxl-post--inner').eq(index).addClass('active');
        });
    });

    /* Post Feature - Image Swiper */
    let postfeatureSlider = $('.pxl-image--swiper');
    if (postfeatureSlider.length) {
        postfeatureSlider.slick({
            dots: false,
            infinite: true,
            arrows: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: false,
            autoplaySpeed: 2000,
            prevArrow: $('.slick-prev'),
            nextArrow: $('.slick-next')
        });
    }
    /* End Post Feature - Image Swiper */

    /* Add Quote Single Product - Reviews */
    var svgElement = `
        <svg width="200" height="170" viewBox="0 0 200 170" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 85V170H85.7051V85H28.5685C28.5685 53.7547 54.2006 28.3335 85.7051 28.3335V0C38.4445 0 0 38.1282 0 85Z" fill="currentColor"/>
          <path d="M199.998 28.3335V0C152.737 0 114.293 38.1282 114.293 85V170H199.998V85H142.861C142.861 53.7547 168.494 28.3335 199.998 28.3335Z" fill="currentColor"/>
        </svg>
    `;
    /* End Add Quote */

    $('.single-product li.review ').append(svgElement);

    /* Copy Link Site */
    let copyLinkElements = document.querySelectorAll('.btn-copy-link');

    copyLinkElements.forEach(function(element) {
        element.addEventListener('click', function(event) {
            event.preventDefault();
            let link = window.location.href;
            navigator.clipboard.writeText(link).then(function() {
                alert('The link has been copied!');
            }).catch(function(error) {
                console.error('Error copying link: ', error);
            });
        });
    });
    /* End Copy Link Site */


    /* Search Popup */
    var $search_wrap_init = $("#pxl-search-popup");
    var search_field = $('#pxl-search-popup .search-field');
    var $body = $('body');

    $(".pxl-search-popup-button").on('click', function(e) {
        if (!$search_wrap_init.hasClass('active')) {
            $search_wrap_init.addClass('active');
            setTimeout(function() { search_field.get(0).focus(); }, 500);
        } else if (search_field.val() === '') {
            $search_wrap_init.removeClass('active');
            search_field.get(0).focus();
        }
        e.preventDefault();
        return false;
    });

    $(".pxl-subscribe-popup .pxl-item--overlay, .pxl-subscribe-popup .pxl-item--close").on('click', function (e) {
        $(this).parents('.pxl-subscribe-popup').removeClass('pxl-active');
        e.preventDefault();
        return false;
    });

    $("#pxl-search-popup .pxl-item--overlay, #pxl-search-popup .pxl-item--close").on('click', function (e) {
        $body.addClass('pxl-search-out-anim');
        setTimeout(function () {
            $body.removeClass('pxl-search-out-anim');
        }, 800);
        setTimeout(function () {
            $search_wrap_init.removeClass('active');
        }, 800);
        e.preventDefault();
        return false;
    });

    /* End Search Popup */


    /* Select Theme Style */
    $('.wpcf7-select').each(function(){
        var $this = $(this), numberOfOptions = $(this).children('option').length;

        $this.addClass('pxl-select-hidden'); 
        $this.wrap('<div class="pxl-select"></div>');
        $this.after('<div class="pxl-select-higthlight"></div>');

        var $styledSelect = $this.next('div.pxl-select-higthlight');
        $styledSelect.text($this.children('option').eq(0).text());

        var $list = $('<ul />', {
            'class': 'pxl-select-options'
        }).insertAfter($styledSelect);

        for (var i = 0; i < numberOfOptions; i++) {
            $('<li />', {
                text: $this.children('option').eq(i).text(),
                rel: $this.children('option').eq(i).val()
            }).appendTo($list);
        }

        var $listItems = $list.children('li');

        $styledSelect.on('click', function (e) {
            e.stopPropagation();
            $('div.pxl-select-higthlight.active').not(this).each(function(){
                $(this).removeClass('active').next('ul.pxl-select-options').addClass('pxl-select-lists-hide');
            });
            $(this).toggleClass('active');
        });

        $listItems.on('click', function (e) {
            e.stopPropagation();
            $styledSelect.text($(this).text()).removeClass('active');
            $this.val($(this).attr('rel'));
        });

        $(document).on('click', function () {
            $styledSelect.removeClass('active');
        });

    });

    /* Nice Select */
    $('.woocommerce-ordering .orderby, #pxl-sidebar-area select, .variations_form.cart .variations select, .pxl-open-table select, .pxl-nice-select').each(function () {
        $(this).niceSelect();
    });

    /* Typewriter */
    if($('.pxl-title--typewriter').length) {
        function typewriterOut(elements, callback)
        {
            if (elements.length){
                elements.eq(0).addClass('is-active');
                elements.eq(0).delay( 3000 );
                elements.eq(0).removeClass('is-active');
                typewriterOut(elements.slice(1), callback);
            }
            else {
                callback();
            }
        }

        function typewriterIn(elements, callback)
        {
            if (elements.length){
                elements.eq(0).addClass('is-active');
                elements.eq(0).delay( 3000 ).slideDown(3000, function(){
                    elements.eq(0).removeClass('is-active');
                    typewriterIn(elements.slice(1), callback);
                });
            }
            else {
                callback();
            }
        }

        function typewriterInfinite(){
            typewriterOut($('.pxl-title--typewriter .pxl-item--text'), function(){ 
                typewriterIn($('.pxl-title--typewriter .pxl-item--text'), function(){
                    typewriterInfinite();
                });
            });
        }
        $(function(){
            typewriterInfinite();
        });
    }
        /* End Typewriter */

        /* Section Particles */      
    setTimeout(function() {
        $(".pxl-row-particles").each(function() {
            particlesJS($(this).attr('id'), {
              "particles": {
                "number": {
                    "value": $(this).data('number'),
                },
                "color": {
                    "value": $(this).data('color')
                },
                "shape": {
                    "type": "circle",
                },
                "size": {
                    "value": $(this).data('size'),
                    "random": $(this).data('size-random'),
                },
                "line_linked": {
                    "enable": false,
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": $(this).data('move-direction'),
                    "random": true,
                    "out_mode": "out",
                }
            },
            "retina_detect": true
        });
        });
    }, 400);

        /* Get checked input - Mailchimpp */
    $('.mc4wp-form input:checkbox').change(function(){
        if($(this).is(":checked")) {
            $('.mc4wp-form').addClass("pxl-input-checked");
        } else {
            $('.mc4wp-form').removeClass("pxl-input-checked");
        }
    });

        /* Scroll to content */
    $('.pxl-link-to-section .btn').on('click', function(e) {
        var id_scroll = $(this).attr('href');
        var offsetScroll = $('.pxl-header-elementor-sticky').outerHeight();
        e.preventDefault();
        $("html, body").animate({ scrollTop: $(id_scroll).offset().top - offsetScroll }, 600);
    });

        // Hover Overlay Effect
    $('.pxl-overlay-shake').mousemove(function(event){ 
        var offset = $(this).offset();
        var W = $(this).outerWidth();
        var X = (event.pageX - offset.left);
        var Y = (event.pageY - offset.top);
        $(this).find('.pxl-overlay--color').css({
            'top' : + Y + 'px',
            'left' : + X + 'px'
        });
    });

        // Hover Portfolio Effect
    $(".pxl-portfolio-style1 .pxl-post--inner").hover(
        function () {
            $(this).addClass("active-hover");
            $(this).removeClass("none-hover");
        },
        function () {
            $(this).removeClass("active-hover");
            $(this).addClass("none-hover");
        }
        );

        /* Custom One Page by theme */
    if($('.pxl-link-scroll1').length) {
        $('.pxl-item--onepage').on('click', function (e) {
            var _this = $(this);
            var _link = $(this).attr('href');
            var _id_data = e.currentTarget.hash;
            var _offset;
            var _data_offset = $(this).attr('data-onepage-offset');
            if(_data_offset) {
                _offset = _data_offset;
            } else {
                _offset = 0;
            }
            if ($(_id_data).length === 1) {
                var _target = $(_id_data);
                $('.pxl-onepage-active').removeClass('pxl-onepage-active');
                _this.addClass('pxl-onepage-active');
                $('html, body').stop().animate({ scrollTop: _target.offset().top - _offset }, 1000);   
                return false;
            } else {
                window.location.href = _link;
            }
            return false;
        });
        $.each($('.pxl-item--onepage'), function (index, item) {
            var target = $(item).attr('href');
            var el =  $(target);
            var _data_offset = $(item).attr('data-onepage-offset');
            var waypoint = new Waypoint({
                element: el[0],
                handler: function(direction) {
                    if(direction === 'down'){
                        $('.pxl-onepage-active').removeClass('pxl-onepage-active');
                        $(item).addClass('pxl-onepage-active');
                    }
                    else if(direction === 'up'){
                        var prev = $(item).parent().prev().find('.pxl-item--onepage');
                        $(item).removeClass('pxl-onepage-active');
                        if(prev.length > 0)
                            prev.addClass('pxl-onepage-active');
                    }
                },
                offset: _data_offset,
            });
        });
    }

        /* Item Hover Active */
    $('.pxl-hover-item').each(function () {
        $(this).hover(function () {
            $(this).parent('.pxl-hover-wrap').find('.pxl-hover-item').removeClass('pxl-active');
            $(this).addClass('pxl-active');
        });
    });

        // Active Mega Menu Hover
    $('li.pxl-megamenu').hover(function(){
        $(this).parents('.e-con-inner').addClass('section-mega-active');
    },function(){
        $(this).parents('.e-con-inner').removeClass('section-mega-active');
    });

});

jQuery(document).ajaxComplete(function(event, xhr, settings){
    floka_shop_quantity();
    floka_image_effect_parallax();
    floka_image_distortion();
    floka_crs_scroll_horizontal();
    if (typeof elementorFrontend !== 'undefined') {
        elementorFrontend.init();
    }
});

jQuery( document ).on( 'updated_wc_div', function() {
    floka_shop_quantity();
} );



    /* Header Sticky */
function floka_header_sticky() {
    if($('#pxl-header-elementor').hasClass('is-sticky')) {
        if (pxl_scroll_top > 100) {
            $('.pxl-header-elementor-sticky.pxl-sticky-stb').addClass('pxl-header-fixed');
            $('#pxl-header-mobile').addClass('pxl-header-mobile-fixed');
        } else {
            $('.pxl-header-elementor-sticky.pxl-sticky-stb').removeClass('pxl-header-fixed');
            $('#pxl-header-mobile').removeClass('pxl-header-mobile-fixed');
        }

        if (pxl_scroll_status == 'up' && pxl_scroll_top > 100) {
            $('.pxl-header-elementor-sticky.pxl-sticky-stt').addClass('pxl-header-fixed');
        } else {
            $('.pxl-header-elementor-sticky.pxl-sticky-stt').removeClass('pxl-header-fixed');
        }
    }

    $('.pxl-header-elementor-sticky').parents('body').addClass('pxl-header-sticky');
}

    /* Header Left Scroll */
function floka_header_left_scroll() {
    if($('.px-header--left_sidebar').hasClass('px-header-sidebar-style2')) {
        var h_section_top = $('.h5-section-top').outerHeight() + 50;
        if (pxl_scroll_top > h_section_top) {
            $('.px-header--left_sidebar').addClass('px-header--left_shadow');
        } else {
            $('.px-header--left_sidebar').removeClass('px-header--left_shadow');
        }
    }
}

    /* Header Mobile */
function floka_header_mobile() {
    var h_header_mobile = $('#pxl-header-elementor').outerHeight();
    if(pxl_window_width < 1199) {
        $('#pxl-header-elementor').css('min-height', h_header_mobile + 'px');
    }
}

    /* Scroll To Top */
function floka_scroll_to_top() {
    if (pxl_scroll_top < pxl_window_height) {
        $('.pxl-scroll-top').addClass('pxl-off').removeClass('pxl-on');
    }
    if (pxl_scroll_top > pxl_window_height) {
        $('.pxl-scroll-top').addClass('pxl-on').removeClass('pxl-off');
    }
}

    /* Footer Fixed */
function floka_footer_fixed() {
    setTimeout(function(){
        var h_footer = $('.pxl-footer-fixed #pxl-footer-elementor').outerHeight() - 1;
        $('.pxl-footer-fixed #pxl-main').css('margin-bottom', h_footer + 'px');
    }, 600);
}


     /* WooComerce Quantity */
function floka_shop_quantity() {
    "use strict";
    $('#pxl-wapper .quantity').append('<span class="quantity-icon quantity-down pxl-icon--minus"></span><span class="quantity-icon quantity-up pxl-icon--plus"></span>');
    $('.quantity-up').on('click', function () {
        $(this).parents('.quantity').find('input[type="number"]').get(0).stepUp();
        $(this).parents('.woocommerce-cart-form').find('.actions .button').removeAttr('disabled');
    });
    $('.quantity-down').on('click', function () {
        $(this).parents('.quantity').find('input[type="number"]').get(0).stepDown();
        $(this).parents('.woocommerce-cart-form').find('.actions .button').removeAttr('disabled');
    });
    $('.quantity-icon').on('click', function () {
        var quantity_number = $(this).parents('.quantity').find('input[type="number"]').val();
        var add_to_cart_button = $(this).parents( ".product, .woocommerce-product-inner" ).find(".add_to_cart_button");
        add_to_cart_button.attr('data-quantity', quantity_number);
        add_to_cart_button.attr("href", "?add-to-cart=" + add_to_cart_button.attr("data-product_id") + "&quantity=" + quantity_number);
    });
    $('.woocommerce-cart-form .actions .button').removeAttr('disabled');
}

    /* Menu Responsive Dropdown */
function floka_submenu_responsive() {
    var $floka_menu = $('.pxl-header-elementor-main, .pxl-header-elementor-sticky');
    $floka_menu.find('.pxl-menu-primary li').each(function () {
        var $floka_submenu = $(this).find('> ul.sub-menu');
        if ($floka_submenu.length == 1) {
            if ( ($floka_submenu.offset().left + $floka_submenu.width() + 0 ) > $(window).width()) {
                $floka_submenu.addClass('pxl-sub-reverse');
            }
        }
    });
}




/* Image Effect */

function floka_image_effect_parallax() {
    const els = $('.pxl-image-scale-parallax');
    if (!els.length) return;
    $(els).on({
      mousemove(e) {
          const img = $(this).find('img');
          if (!img.length) return;
          const rect = this.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const moveX = (x - rect.width / 2) * 0.15;
          const moveY = (y - rect.height / 2) * 0.15;
          gsap.to(img, {
            x: moveX,
            y: moveY,
            scale: 1.15,
            duration: 0.25,
            ease: "none",
        });
      },
      mouseleave() {
          const img = $(this).find('img');
          if (!img.length) return;
          gsap.to(img, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.25,
            ease: "none",
        });
      },
  });
}

function floka_image_effect_scale() {
    const isMobile = window.innerWidth <= 767;
    const isInElementor = $('body').hasClass('elementor-editor-active') || $('body').hasClass('elementor-editor-preview');
    const $els = $('.pxl-section-fix-trigger .pxl-scale-scroll img');
    
    if (isMobile || !$els.length || isInElementor) return;

    $els.each(function () {
        const $img = $(this);
        const $data_scale = $img.closest('.pxl-item--image');
        const $section = $img.closest('.pxl-section-fix-trigger');
        const targetScale = parseFloat($data_scale.data('scale')) || 0.505;
        $img.on('load', function () {

            gsap.fromTo($img,
                { scale: targetScale },
                {
                    scale: 1.6,
                    ease: "none",
                    scrollTrigger: {
                        trigger: $section,
                        start: "top top",
                        end: 'bottom top',
                        scrub: true,
                        pin: true,
                        pinSpacing: true,
                    }
                }
                );
            ScrollTrigger.refresh();
        });

        if ($img[0].complete) {
            $img.trigger('load');
        }
    });
}



function floka_image_distortion() {
    let els = $('.pxl-image-distortion');
    if(!els.length) return;
    els.each(function() {
        const img = $(this).find('img')
        let src = $(img).attr('src');
        let currentEl = $(this);
        let width = parseInt($(img).attr('width')) ?? 1;
        let height = parseInt($(img).attr('height')) ?? 1;
        let myAnimation = new hoverEffect({
            parent: $(this)[0],
            intensity: 0.3,
            image1: src,
            image2: src,
            displacementImage: currentEl.attr('data-displacement') ?? 'http://floka.local/wp-content/uploads/2025/05/displacement-5.webp',
            imagesRatio: height/width,
        });
    })
}
    /* End Image Effect */


    /* Custom Effect Widget Scroll */

function floka_scrolling_effect(){

    var st = $('.scrolling-effect');

    st.each( function(index, el) {        

        var settings = {
            scrollTrigger: {
                trigger: el,    
                markers: false, 
                scrub: 3,         
                toggleActions: "play none none reverse",
                start: "30px bottom", 
                end: "bottom bottom",
                delay: 3,
            },
            duration: 0.8, 
            ease: "power3.out",
        };

        if( $(el).hasClass('fade') ){
            settings.opacity = 0;
        }
        if( $(el).hasClass( 'fromRight') ){
            settings.opacity = 0;
            settings.x = "80";
        }
        if( $(el).hasClass( 'fromLeft') ){
            settings.opacity = 0;
            settings.x = "-80";
        }
        if( $(el).hasClass( 'fromBottom') ){
            settings.opacity = 0;
            settings.y = "100";
        }
        if( $(el).hasClass( 'fromTop') ){
            settings.opacity = 0;
            settings.y = "-80";
        }
        if( $(el).hasClass( 'zoomIn') ){
            settings.opacity = 0;
            settings.scale = 0.5;
        } 
        if( $(el).hasClass( 'zoomFromLeft') ){
            settings.opacity = 0;
            settings.scale = 0.8;
            settings.y = "100";
            settings.transformOrigin = "left center";
        } 
        if( $(el).hasClass( 'zoomFromRight') ){
            settings.opacity = 0;
            settings.scale = 0.8;
            settings.y = "100";
            settings.transformOrigin = "right center";
        } 

        gsap.from( el, settings);
    });

}

    /* End Custom Widget */

/* Scroll Trigger Effect */

//start horizontal scroll
function floka_crs_scroll_horizontal(){
    // gsap.registerPlugin(ScrollTrigger);
    // const elements = document.querySelectorAll(".animate-horizontal-scroll");
    // if (!elements.length) return;

    // const windowWidth = window.innerWidth;

    // if (windowWidth > 1024) {
    //     elements.forEach((el) => {
    //         const wrapper = el.querySelector(".scrolling-wrapper");
    //         if (!wrapper) return;

    //         const checkPin = el.classList.contains("pin");
    //         const items = wrapper.querySelectorAll(".item");
    //         if (!items.length) return;

    //         const itemsWidth = wrapper.scrollWidth;
    //         const containerWidth = el.clientWidth;
    //         const moveDistance = containerWidth - itemsWidth < 0 ? containerWidth - itemsWidth : 0;

    //         if (el.offsetHeight && el.offsetWidth) {
    //             gsap.to(wrapper, {
    //                 x: moveDistance,
    //                 ease: "none",
    //                 scrollTrigger: {
    //                     trigger: el,
    //                     pin: checkPin,
    //                     scrub: 1,
    //                     pinSpacing: true,
    //                     start: checkPin
    //                     ? `top +=${(window.innerHeight - el.offsetHeight) / 2}`
    //                     : "top 65%",
    //                     end: () => `+=${Math.abs(moveDistance)}`,
    //                 }
    //             });
    //         }
    //     });

    //     setTimeout(() => ScrollTrigger.refresh(), 500);
    // }
}


//end horizontal scroll
function floka_pxl_draw_stroke(){

    gsap.registerPlugin(ScrollTrigger);

    $(".pxl-svg-stroke svg").each(function () {
        const $svg = $(this);
        const $paths = $svg.find("path");

        $paths.each(function () {
            const lineLength = this.getTotalLength();
            $(this).css({
                strokeDasharray: lineLength,
                strokeDashoffset: lineLength
            });
        });

        gsap.to($paths.toArray(), {
            strokeDashoffset: 0,
            duration: 2,
            stagger: 0.05,
            ease: "power2.out",
            scrollTrigger: {
                trigger: $svg[0],
                start: "top 100%",
                toggleActions: "play none none none",
                once: true
            }
        });
    });

};
/* End Scroll Trigger Effect */
function floka_panel_anchor_toggle(){
    'use strict';
    $(document).on('click','.pxl-anchor-button',function(e){
        e.preventDefault();
        e.stopPropagation();
        var target = $(this).attr('data-target');
        $(target).toggleClass('active');
        $('.pxl-popup--conent .wow').addClass('animated').removeClass('aniOut');
        $('.pxl-popup--conent .fadeInPopup').removeClass('aniOut');
        if($(target).find('.pxl-search-form').length > 0){
            setTimeout(function(){
                $(target).find('.pxl-search-form .pxl-search-field').focus();
            },1000);
        }
    });

    $('.pxl-anchor-button').each(function () {
        var t_target = $(this).attr('data-target');
        var t_delay = $(this).attr('data-delay-hover');
        $(t_target).find('.pxl-popup--conent').css('transition-delay', t_delay + 'ms');
        $(t_target).find('.pxl-popup--overlay').css('transition-delay', t_delay + 'ms');
    });

    $(".pxl-hidden-panel-popup .pxl-popup--overlay, .pxl-hidden-panel-popup .pxl-close-popup").on('click', function () {
        $('body').removeClass('body-overflow');
        $('.pxl-hidden-panel-popup').removeClass('active');
        $('.pxl-popup--conent .wow').addClass('aniOut').removeClass('animated');
        $('.pxl-popup--conent .fadeInPopup').addClass('aniOut');
    });

    $(".pxl-atc-popup").on('click', function () {
        $('body').addClass('body-overflow');
        $(this).parents('.pxl-wapper').find('.pxl-page-popup').addClass('active');
    });
    $(".pxl-popup--close").on('click', function () {
        $('body').removeClass('body-overflow');
        $(this).parent().removeClass('active');
    });

        /* Custom Theme Style */
    $('blockquote:not(.pxl-blockquote)').append('<i class="pxl-blockquote-icon flaticon-quote-1 text-gradient"></i>');
}

    /* Page Title Scroll Opacity */
function floka_ptitle_scroll_opacity() {
    var divs = $('#pxl-page-title-elementor.pxl-scroll-opacity .elementor-widget'),
    limit = $('#pxl-page-title-elementor.pxl-scroll-opacity').outerHeight();
    if (pxl_scroll_top <= limit) {
        divs.css({ 'opacity' : (1 - pxl_scroll_top/limit)});
    }
}

    /* Preloader Default */
$.fn.extend({
    jQueryImagesLoaded: function () {
      var $imgs = this.find('img[src!=""]')

      if (!$imgs.length) {
        return $.Deferred()
        .resolve()
        .promise()
    }

    var dfds = []

    $imgs.each(function () {
        var dfd = $.Deferred()
        dfds.push(dfd)
        var img = new Image()
        img.onload = function () {
          dfd.resolve()
      }
      img.onerror = function () {
          dfd.resolve()
      }
      img.src = this.src
  })

    return $.when.apply($, dfds)
}
})

    /* Button Parallax */
function floka_el_parallax() {
    $('.btn-text-parallax').on('mouseenter', function() {
        $(this).addClass('hovered');
    });
    $('.btn-text-parallax').on('mouseleave', function() {
        $(this).removeClass('hovered');
    });
    $('.btn-text-parallax').on('mousemove', function(e) {
        const bounds = this.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height;
        const deltaX = Math.floor((centerX - e.clientX)) * 0.172;
        const deltaY = Math.floor((centerY - e.clientY)) * 0.273;
        $(this).find('.pxl--btn-text').css({
            transform: 'translate3d('+ deltaX * 0.32 +'px, '+ deltaY * 0.32 +'px, 0px)'
        });
        $(this).css({
            transform: 'translate3d('+ deltaX * 0.25 +'px, '+ deltaY * 0.25 +'px, 0px)'
        });
    });

    $('.el-parallax-wrap').each(function () {
        $(this).on('mouseenter', function() {
            $(this).addClass('hovered');
        });

        $(this).on('mouseleave', function() { 
            $(this).removeClass('hovered');
            $(this).removeClass('hovered');
            $(this).find('.el-parallax-item').css({
                transition: 'transform 0.5s ease',
                transform: 'translate3d(0px, 0px, 0px)'
            });
        });

        $(this).on('mousemove', function(e) {
            const bounds = this.getBoundingClientRect();
            const centerX = bounds.left + bounds.width / 2;
            const centerY = bounds.top + bounds.height;
            const deltaX = Math.floor((centerX - e.clientX)) * 0.222;
            const deltaY = Math.floor((centerY - e.clientY)) * 0.333;
            $(this).find('.el-parallax-item').css({
                transform: 'translate3d('+ deltaX * 0.39 +'px, '+ deltaY * 0.39 +'px, 0px)'
            });
        });
    });

    $('.pxl-hover-parallax').on('mousemove', function(e) {
        const bounds = this.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height;
        const deltaX = Math.floor((centerX - e.clientX)) * 0.22;
        const deltaY = Math.floor((centerY - e.clientY)) * 0.15;
        $(this).find('.pxl-item-parallax').css({
            transform: 'translate3d('+ deltaX * 0.68  +'px, '+ deltaY * 0.68  +'px, 0px)'
        });
    });
}

    /* Back To Top Progress Bar */
function floka_backtotop_progess_bar() {
    if($('.pxl-scroll-top').length > 0) {
        var progressPath = document.querySelector('.pxl-scroll-top path');
        var pathLength = progressPath.getTotalLength();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
        progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
        progressPath.style.strokeDashoffset = pathLength;
        progressPath.getBoundingClientRect();
        progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';      
        var updateProgress = function () {
            var scroll = $(window).scrollTop();
            var height = $(document).height() - $(window).height();
            var progress = pathLength - (scroll * pathLength / height);
            progressPath.style.strokeDashoffset = progress;
        }
        updateProgress();
        $(window).scroll(updateProgress);   
        var offset = 50;
        var duration = 550;
        $(window).on('scroll', function() {
            if ($(this).scrollTop() > offset) {
                $('.pxl-scroll-top').addClass('active-progress');
            } else {
                $('.pxl-scroll-top').removeClass('active-progress');
            }
        });
    }
}

    /* Custom Type File Upload*/
function floka_type_file_upload() {

    var multipleSupport = typeof $('<input/>')[0].multiple !== 'undefined',
    isIE = /msie/i.test( navigator.userAgent );

    $.fn.pxl_custom_type_file = function() {

        return this.each(function() {

            var $file = $(this).addClass('pxl-file-upload-hidden'),
            $wrap = $('<div class="pxl-file-upload-wrapper">'),
            $button = $('<button type="button" class="pxl-file-upload-button">Choose File</button>'),
            $input = $('<input type="text" class="pxl-file-upload-input" placeholder="No File Choose" />'),
            $label = $('<label class="pxl-file-upload-button" for="'+ $file[0].id +'">Choose File</label>');
            $file.css({
                position: 'absolute',
                opacity: '0',
                visibility: 'hidden'
            });

            $wrap.insertAfter( $file )
            .append( $file, $input, ( isIE ? $label : $button ) );

            $file.attr('tabIndex', -1);
            $button.attr('tabIndex', -1);

            $button.on('click', function () {
                $file.focus().click();
            });

            $file.change(function() {

                var files = [], fileArr, filename;

                if ( multipleSupport ) {
                    fileArr = $file[0].files;
                    for ( var i = 0, len = fileArr.length; i < len; i++ ) {
                        files.push( fileArr[i].name );
                    }
                    filename = files.join(', ');
                } else {
                    filename = $file.val().split('\\').pop();
                }

                $input.val( filename )
                .attr('title', filename)
                .focus();
            });

            $input.on({
                blur: function() { $file.trigger('blur'); },
                keydown: function( e ) {
                    if ( e.which === 13 ) {
                        if ( !isIE ) { 
                            $file.trigger('click'); 
                        }
                    } else if ( e.which === 8 || e.which === 46 ) {
                        $file.replaceWith( $file = $file.clone( true ) );
                        $file.trigger('change');
                        $input.val('');
                    } else if ( e.which === 9 ){
                        return;
                    } else {
                        return false;
                    }
                }
            });

        });

    };
    $('.wpcf7-file[type=file]').pxl_custom_type_file();
}


})(jQuery);