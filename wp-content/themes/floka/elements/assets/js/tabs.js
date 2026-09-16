( function( $ ) {
    "use strict";
    
    var pxl_widget_tabs_handler = function( $scope, $ ) {
        $scope.find(".pxl-tabs.tab-effect-slide .pxl-tab--title").on("click", function(e){
            e.preventDefault();
            var target = $(this).data("target");
            var parent = $(this).parents(".pxl-tabs");
            parent.find(".pxl-tabs--content .pxl-tab--content").slideUp(300);
            parent.find(".pxl-tabs--title .pxl-tab--title").removeClass('active');
            $(this).addClass("active");
            $(target).slideDown(300);

            var allTabs = parent.find(".pxl-tabs--title .pxl-tab--title");
            allTabs.removeClass("prev next");
            var index = allTabs.index(this);
            if(index > 0) allTabs.eq(index - 1).addClass("prev");
            if(index < allTabs.length - 1) allTabs.eq(index + 1).addClass("next");
        });

        $scope.find(".pxl-tabs.tab-effect-fade .pxl-tab--title, .pxl-tabs.tab-effect-cretive .pxl-tab--title").on("click", function(e) {
            e.preventDefault();

            var target = $(this).data("target");
            var parentTabs = $(this).parents(".pxl-tabs");

            var contentEl = parentTabs.find(".pxl-tabs--content .pxl-tab--content").first();
            var titleEl = parentTabs.find(".pxl-tabs--title .pxl-tab--title").first();

            var contentParent = contentEl.closest(".pxl-section-tab-custom-id");
            var titleParent = titleEl.closest(".pxl-section-tab-custom-id");

            if (contentParent.length && titleParent.length && contentParent[0] === titleParent[0]) {
                contentParent.find(".pxl-tabs").each(function() {
                    $(this).find(".pxl-tabs--content .pxl-tab--content").removeClass("active");
                    $(this).find(".pxl-tabs--title .pxl-tab--title").removeClass("active");
                });
            } else {
                parentTabs.find(".pxl-tabs--content .pxl-tab--content").removeClass("active");
                parentTabs.find(".pxl-tabs--title .pxl-tab--title").removeClass("active");
            }

            $(this).addClass("active");
            $(target).addClass("active");

            var allTabs = parentTabs.find(".pxl-tabs--title .pxl-tab--title");
            allTabs.removeClass("prev next");

            var index = allTabs.index(this);
            if (index > 0) allTabs.eq(index - 1).addClass("prev");
            if (index < allTabs.length - 1) allTabs.eq(index + 1).addClass("next");
        });

    };

    $( window ).on( 'elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_tabs.default', pxl_widget_tabs_handler );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_banner_tabs.default', pxl_widget_tabs_handler );
    } );

} )( jQuery );