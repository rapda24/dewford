;(function ($) {

    "use strict";

    $(document).ready(function () {

        $('.single_variation_wrap').addClass('clearfix');
        $('.woocommerce-variation-add-to-cart').addClass('clearfix');

        $('.cart-total-wrap').on('click', function () {
            $('.widget-cart-sidebar').toggleClass('open');
            $(this).toggleClass('cart-open');
            $('.site-overlay').toggleClass('open');
        });

        $('.site-overlay').on('click', function () {
            $(this).removeClass('open');
            $(this).parents('#page').find('.widget-cart-sidebar').removeClass('open');
        });

        $('.woocommerce-tab-heading').on('click', function () {
            $(this).toggleClass('open');
            $(this).parent().find('.woocommerce-tab-content').slideToggle('');
        });

        $('.site-menu-right .h-btn-cart, .mobile-menu-cart .h-btn-cart').on('click', function (e) {
            e.preventDefault();
            $(this).parents('#ct-header-wrap').find('.widget_shopping_cart').toggleClass('open');
            $('.ct-hidden-sidebar').removeClass('open');
            $('.ct-search-popup').removeClass('open');
        });

        $('.woocommerce-add-to-cart a.button.product_type_grouped:not(".no-animate")').append( '<i class="caseicon-link4"></i>' );

        $('.woocommerce-add-to-cart a.button').on('click', function () {
            $(this).parents('.woocommerce-product-inner').addClass('cart-added');
        });

        $('.woocommerce-archive-layout .layout-grid').on('click', function () {
            $(this).addClass('active');
            $(this).parent().find('.layout-list').removeClass('active');
            $(this).parents('.site-main').find('ul.products').addClass('ct-products-grid').removeClass('ct-products-list');
        });
         $('.woocommerce-archive-layout .layout-list').on('click', function () {
            $(this).addClass('active');
            $(this).parent().find('.layout-grid').removeClass('active');
            $(this).parents('.site-main').find('ul.products').addClass('ct-products-list').removeClass('ct-products-grid');
        });

        $('.woocommerce-archive-layout .layout-list.active').parents('.site-main').find('ul.products').addClass('ct-products-list').removeClass('ct-products-grid');

        setTimeout(function () {
            $('.ct-grid .product_type_variable, .ct-slick-slider .product_type_variable').removeAttr('data-product_id');
            $('.ct-product-carousel6.woocommerce .woocommerce-product-inner .woocommerce-add-to--cart .button').append( '<i class="flaticon-shopping-cart-1"></i>' );
            $('.ct-product-carousel9.woocommerce .woocommerce-product-inner .woocommerce-add-to--cart .button').append( '<i class="flaticon-shopping-cart-1"></i>' );
        }, 300);

        $(".woocommerce .products").on("click", ".quantity input", function() {
            return false;
        });
        $(".woocommerce .products").on("change input", ".quantity .qty", function() {
            var add_to_cart_button = $(this).parents( ".product" ).find(".add_to_cart_button");
            add_to_cart_button.attr('data-quantity', $(this).val());
            add_to_cart_button.attr("href", "?add-to-cart=" + add_to_cart_button.attr("data-product_id") + "&quantity=" + $(this).val());
        });
        $('.flex-viewport').parents('.woocommerce-gallery-inner').addClass('flex-slider-active');

        /* Add Placeholder Review Form */
        var $text_name = $('.single-product #review_form .comment-form-author label').text();
        $('.single-product #review_form .comment-form-author input').each(function (ev) {
            if (!$(this).val()) {
                $(this).attr("placeholder", $text_name);
            }
        });
        var $text_email = $('.single-product #review_form .comment-form-email label').text();
        $('.single-product #review_form .comment-form-email input').each(function (ev) {
            if (!$(this).val()) {
                $(this).attr("placeholder", $text_email);
            }
        });
        var $text_comment = $('.single-product #review_form .comment-form-comment label').text();
        $('.single-product #review_form .comment-form-comment textarea').each(function (ev) {
            if (!$(this).val()) {
                $(this).attr("placeholder", $text_comment);
            }
        });

        $('.pxl-item--attr .pxl-button--info').on('click', function () {
            $(this).toggleClass('active');
        });

        /* Checkout Placeholder */
        $('.woocommerce-checkout #billing_first_name').attr("placeholder", "Fast Name");
        $('.woocommerce-checkout #billing_last_name').attr("placeholder", "Last Name");
        $('.woocommerce-checkout #billing_company').attr("placeholder", "Company Name");
        $('.woocommerce-checkout #billing_company').attr("placeholder", "Company");
        $('.woocommerce-checkout #billing_city').attr("placeholder", "Amron");
        $('.woocommerce-checkout #billing_postcode').attr("placeholder", "324456");
        $('.woocommerce-checkout #billing_phone').attr("placeholder", "123 456 789");
        $('.woocommerce-checkout #billing_email').attr("placeholder", "example@gmail.com");
        $('#customer_login #username').attr("placeholder", "Username or email address");
        $('#customer_login #password').attr("placeholder", "Password");
        $('#customer_login #reg_email').attr("placeholder", "Email address");
        $('#customer_login #reg_username').attr("placeholder", "Username");
        $('#customer_login #reg_password').attr("placeholder", "Password");
        $('.lost_reset_password #user_login').attr("placeholder", "Username or email");
        
        
        if ($('form.checkout_coupon #coupon_code').length > 0) {
            $('form.checkout_coupon #coupon_code').on('focus', function() {
                $('form.checkout_coupon .button').css('opacity', '1'); // Hiển thị nút khi focus
            }).on('blur', function() {
                $('form.checkout_coupon .button').css('opacity', '0'); // Ẩn nút khi blur
            });
        }

        let buttonToggleLayout = $('.woocommerce .btn-change-layout');
        let layoutProducts = $('.woocommerce.woocommerce-shop .pxl-woocommerce-list ul.products').first();
    
        let savedLayout = sessionStorage.getItem('layoutClass');
        if (savedLayout) {
            layoutProducts.removeClass('grid list columns-1 columns-2 columns-3 columns-4 columns-5').addClass(savedLayout);
            buttonToggleLayout.removeClass('active');
            $(`.btn-change-layout[data-layout="${savedLayout}"]`).addClass('active');
        }
    
        if (buttonToggleLayout.length > 0) {
            buttonToggleLayout.each(function() {
                $(this).on('click', function() {  
                    buttonToggleLayout.removeClass('active');
                    $(this).addClass('active');
                    let selectedLayout = $(this).attr('data-layout');
                    layoutProducts.removeClass('grid list columns-1 columns-2 columns-3 columns-4 columns-5').addClass(selectedLayout);
                    sessionStorage.setItem('layoutClass', selectedLayout);
                });
            });
        }
        
    });

    $(window).on('load', function() {
        setTimeout(function() {
            let gallery = $('body.woocommerce .woocommerce-gallery');
            if (gallery.length > 0) {
                let viewport = gallery.find('.flex-viewport');
                if (viewport.length === 0) {
                    gallery.find('.woocommerce-product-gallery').first().css({
                        'border-width' : '1px'
                    });
                }
            }
        }, 500); 
    });
    

})(jQuery);




jQuery( document ).on( 'qv_loader_stop', function () {
    jQuery( this ).ready( function ( $ ) {
        $('#yith-quick-view-modal .quantity').append('<span class="quantity-icon quantity-down pxl-icon--minus"></span><span class="quantity-icon quantity-up pxl-icon--plus"></span>');
        $('#yith-quick-view-modal .quantity-up').on('click', function () {
            $(this).parents('.quantity').find('input[type="number"]').get(0).stepUp();
        });
        $('#yith-quick-view-modal .quantity-down').on('click', function () {
            $(this).parents('.quantity').find('input[type="number"]').get(0).stepDown();
        });
    } );
} );
