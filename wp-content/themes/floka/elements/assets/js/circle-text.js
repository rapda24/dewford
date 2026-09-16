( function( $ ) {
    "use strict";
    var pxl_circilar_text_handler = function( $scope ) {
        let elements = $scope.find('.pxl-circle-text-item');
        if(!elements.length) return;

        setTimeout(function() {
            elements.each(function() {
                let circletext = new CircleType(this)
                circletext.forceHeight(true) 
                .forceWidth(true)  
            });
        }, 300)

        gsap.registerPlugin(ScrollTrigger);
        setTimeout(function() {
            document.querySelectorAll('.spin-scroll').forEach(wrapper => {
              const textCircle = $('.pxl-circle-text-item,.pxl-img-spin'); 

              if (!textCircle) return;

              gsap.to(textCircle, {
                rotate: 360,
                ease: "none",
                scrollTrigger: {
                  trigger: wrapper, 
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
              }
          });
          });

        }, 300)
        
    };

    $( window ).on( 'elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_circle_text.default', function( $scope ) {
            pxl_circilar_text_handler($scope);
        });
    } );
} )( jQuery );