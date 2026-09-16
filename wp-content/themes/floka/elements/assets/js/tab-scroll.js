(function($) {
  "use strict";

  var pxl_widget_progressbar_handler = function($scope, $) {
    var $items = $scope.find(".pxl-tabs--scroll .tabs-content-wrap .pxl-post--inner:not(:last-child)");
    var $last = $scope.find(".pxl-tabs--scroll .tabs-content-wrap .pxl-post--inner").last();

    if (!$items.length || !$last.length) return;
    if (window.innerWidth <= 767) return;
    imagesLoaded($scope[0], function () {
      setTimeout(function() {
        var lastOffsetTop = $last.offset().top;

        $items.each(function() {
          var $el = $(this);
          var endValue = lastOffsetTop - $el.offset().top;

          gsap.to($el[0], {
            scale: 0.75       ,
            filter: "blur(10px)",
            duration: 0.2,
            scrollTrigger: {
              trigger: $el[0],
              scrub: 1,
              start: "top 70",
              end: "+=" + endValue,
              pin: $el[0],
              pinSpacing: false,
            }
          });
        });

        ScrollTrigger.refresh();
      }, 300);
    });
  };



  var pxl_scroll_stacked = function($scope, $) {
    var $items = $scope.find(".pxl-tabs--scroll .tabs-content-stacked .pxl-post--inner:not(:last-child)");
    var $last = $scope.find(".pxl-tabs--scroll .tabs-content-stacked .pxl-post--inner").last();

    if (!$items.length || !$last.length) return;
    if (window.innerWidth <= 767) return;

    imagesLoaded($scope[0], function () {
      setTimeout(function() {
        var lastOffsetTop = $last.offset().top;

        $items.each(function() {
          var $el = $(this);
          var endValue = lastOffsetTop - $el.offset().top;

          gsap.to($el[0], {
            duration: 0.2,
            scrollTrigger: {
              trigger: $el[0],
              scrub: 1,
              start: "top top",
              end: "+=" + endValue,
              pin: $el[0],
              pinSpacing: false,

              onEnter: () => $el.addClass('active'),
              onEnterBack: () => $el.addClass('active'),
              onLeave: () => $el.removeClass('active'),
              onLeaveBack: () => $el.removeClass('active'),
            }
          });
        });

        gsap.to($last[0], {
          duration: 0.2,
          scrollTrigger: {
            trigger: $last[0],
            start: "top 70",
            onEnter: () => $last.addClass('active'),
            onEnterBack: () => $last.addClass('active'),
          }
        });

        ScrollTrigger.refresh();
      }, 300);
    });
  };


  $(window).on('elementor/frontend/init', function() {
    elementorFrontend.hooks.addAction('frontend/element_ready/pxl_tab_scroll.default', pxl_widget_progressbar_handler);
    elementorFrontend.hooks.addAction('frontend/element_ready/pxl_tab_scroll.default', function ($scope, $) {
      pxl_scroll_stacked($scope, $);
    });
    elementorFrontend.hooks.addAction('frontend/element_ready/pxl_image_stacked.default', pxl_scroll_stacked);

  });

})(jQuery);
