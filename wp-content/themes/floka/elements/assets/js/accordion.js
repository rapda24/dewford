( function( $ ) {
    "use strict";
    var pxl_widget_accordion_handler = function($scope, $) {
      var $items = $scope.find(".pxl-accordion .pxl--item");

      $items.off("click.pxlAcc").on("click.pxlAcc", function(e) {
        e.preventDefault();

        var $item = $(this);
        var $title = $item.find(".pxl-accordion--title");
        var target = $title.data("target");
        var $parent = $item.closest(".pxl-accordion");
        var $all = $parent.find(".pxl--item");

        $all.not($item).each(function () {
          var $it = $(this);
          var $itTitle = $it.find(".pxl-accordion--title");
          var itTarget = $itTitle.data("target");
          $it.removeClass("active");
          $(itTarget).stop(true, true).slideUp(400);
      });

        var isActive = $item.hasClass("active");
        if (isActive) {
          $item.removeClass("active");
          $(target).stop(true, true).slideUp(400);
      } else {
          $item.addClass("active");
          $(target).stop(true, true).slideDown(400);
      }
  });

      $items.each(function () {
        var $it = $(this);
        var $itTitle = $it.find(".pxl-accordion--title");
        var itTarget = $itTitle.data("target");
        if ($it.hasClass("active")) {
          $(itTarget).show();
      } else {
          $(itTarget).hide();
      }
  });
  };



  var accordionHandle = function($scope) {
    const els = $scope.find('.pxl-accordion');
    if (!els.length) return;

    els.each(function() {
        const el = $(this);
        const items = el.find('.pxl--item');
        const contents = el.find('.pxl-accordion-content');
        const images = el.find('.pxl-post--featured');

        items.each(function() {
            const $item = $(this);
            if ($item.hasClass('active')) {
                const content = $item.find('.pxl-accordion-content')[0];
                gsap.set(content, { height: content.scrollHeight });
                ScrollTrigger.refresh();
            }
        });
        
        el.on('click', '.pxl-accordion-title', function(e) {
            e.preventDefault();

            const currentItem = $(this).closest('.pxl--item');
            const currentContent = currentItem.find('.pxl-accordion-content')[0];

            if (currentItem.hasClass('active')) return;

            items.removeClass('active prev');
            gsap.to(contents, { height: 0, duration: 0.5 });

            const prevItem = currentItem.prev('.pxl--item');
            prevItem.addClass('prev');

            currentItem.addClass('active');

            gsap.to(currentContent, {
                height: currentContent.scrollHeight,
                duration: 0.5,
                onComplete: () => {
                    ScrollTrigger.refresh();
                }
            });
        });

    });
}; 

$( window ).on( 'elementor/frontend/init', function() {
    elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_accordion.default',pxl_widget_accordion_handler );
} );

$( window ).on( 'elementor/frontend/init', function() {
    elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_post_accordion.default', function( $scope ) {
        accordionHandle($scope);
    });
} );
} )( jQuery );