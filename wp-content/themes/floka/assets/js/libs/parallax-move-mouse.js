;(function ($) {

    $('.elementor-widget').each(function () {
        $(this).mousemove(function(e) {
            $(this).removeClass('pxl-section-mouseleave');
            $('.pxl-image-parallax .pxl-item--image, .pxl-parallax-hover').each(function () {
                var el_move = $(this)
                var el_value = $(this).data('parallax-value');
                var el_parent = $(this).parents('.elementor-widget');
                pxl_parallax_move(e, el_move, -el_value, el_parent);
            });
        });
        $(this).mouseleave(function(e) {
            $(this).addClass('pxl-section-mouseleave');
        });
    });

    function pxl_parallax_move(e, target, movement, section) {

        var relX = e.pageX - section.offset().left;
        
        var relY = e.pageY - section.offset().top;

        TweenMax.to(target, 1, {
            x: (relX - section.width() / 2) / section.width() * movement,
            y: (relY - section.height() / 2) / section.height() * movement
        });
    
    }

})(jQuery);