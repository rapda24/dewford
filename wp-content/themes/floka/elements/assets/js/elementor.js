( function( $ ) {
    "use strict";
    function flokaElAfterRender(){
        let _elementor = typeof elementor != 'undefined' ? elementor : elementorFrontend;
        _elementor.hooks.addFilter('pxl_element_container/after-render', function(ouput, settings) {
            if(typeof settings.pxl_parallax_bg_img != 'undefined' && settings.pxl_parallax_bg_img.url != ''){
                ouput += '<div class="pxl-section-bg-parallax"></div>';
            }
            if (typeof settings.el_number_layer_overlay != 'undefined' && settings.el_number_layer_overlay == '1') {
                ouput += `<div class="e-con-overlay"></div>`;
            }    
            if (typeof settings.el_overlays != 'undefined' && settings.el_overlays.length > 0) {
                settings.el_overlays.forEach(function (item) {
                    let classes = 'e-con-overlay elementor-repeater-item-' + item._id;
                    ouput += `<div class="${classes}"></div>`;
                });
            }    
            return ouput;
        });
    } 

    function flokaElBeforeRender(){
        let _elementor = typeof elementor != 'undefined' ? elementor : elementorFrontend;
        
        _elementor.hooks.addFilter( 'pxl_element_container/before-render', function( ouput, settings) {
            return ouput;
        });
    } 

    var PXL_Icon_Contact_Form = function( $scope, $ ) {

        setTimeout(function () {
            $('.pxl--item').each(function () {
                var icon_input = $(this).find(".pxl--form-icon"),
                control_wrap = $(this).find('.wpcf7-form-control');
                control_wrap.before(icon_input.clone());
                icon_input.remove();
            });
        }, 10);

    };


    function floka_split_text($scope){

        setTimeout(function () {

            var st = $scope.find(".pxl-split-text");
            if(st.length == 0) return;
            gsap.registerPlugin(SplitText);
            st.each(function(index, el) {
                el.split = new SplitText(el, { 
                    type: "lines,words,chars",
                    linesClass: "split-line"
                });
                gsap.set(el, { perspective: 400 });

                if( $(el).hasClass('split-in-fade') ){
                    $(el).addClass('active');
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        ease: "expo.out",
                    });
                }
                if( $(el).hasClass('split-in-right') ){
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        x: "50",
                        ease: "expo.out",
                    });
                }
                if( $(el).hasClass('split-in-left') ){
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        x: "-50",
                        ease: "Expo.out",
                    });
                }
                if( $(el).hasClass('split-in-up') ){
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        y: "80",
                        ease: "Expo.out",
                    });
                }
                if( $(el).hasClass('split-in-down') ){
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        y: "-80",
                        ease: "Expo.out",
                    });
                }
                if( $(el).hasClass('split-in-rotate') ){
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        rotateX: "50deg",
                        ease: "Expo.out",
                    });
                }
                if( $(el).hasClass('split-in-scale') ){
                    gsap.set(el.split.chars, {
                        opacity: 0,
                        scale: "0.5",
                        ease: "Expo.out",
                    });
                }
                el.anim = gsap.to(el.split.chars, {
                    scrollTrigger: {
                        trigger: el,
                        toggleActions: "restart pause resume reverse",
                        start: "top 90%",
                    },
                    x: "0",
                    y: "0",
                    rotateX: "0",
                    scale: 1,
                    opacity: 1,
                    duration: 0.2, 
                    stagger: 0.01,
                });
            });

        }, 200);
    }

    function floka_scroll_fixed_section() {
        if ($('.pxl-section-fix-top').length > 0) {
            imagesLoaded($('.pxl-section-fix-top, .pxl-section-fix-bottom'), function () {

                ScrollTrigger.matchMedia({
                    "(min-width: 991px)": function () {

                        // Clear old triggers
                        ScrollTrigger.getAll().forEach(t => {
                            if (t.vars.trigger === ".pxl-section-fix-bottom") t.kill();
                        });

                        gsap.to(".pxl-section-fix-bottom", {
                            scrollTrigger: {
                                trigger: ".pxl-section-fix-bottom",
                                scrub: 1,
                                pin: ".pxl-section-fix-top",
                                pinSpacing: false,
                                start: 'top bottom',
                                end: "center center",
                                invalidateOnRefresh: true,
                            },
                        });

                        ScrollTrigger.refresh();
                    }
                });
            });
        }
    }


    function floka_scroll_fixed_column_scale() {
        gsap.registerPlugin(ScrollTrigger);
        $('.pxl-column-sticky.scale').each(function () {
            const $sticky = $(this);
            const $parent = $(this).parents('.pxl-section-fix-trigger').first();
            if (window.innerWidth <= 767) return;
            gsap.fromTo($sticky,
            {
                scale: 1,
                opacity: 1,
                transformOrigin: "top center"
            },
            {
                scale: 0.5,
                opacity: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: $parent[0],
                    start: "top top",       
                    end: "bottom top",     
                    scrub: true,
                }
            }
            );
        });
    }


    function floka_matter_physics($scope) {
        let triggered = false;
        let currentRender = null;
        let currentCanvas = null;
        let resizeTimeout;

        const cleanupRender = () => {
            if (currentRender) {
                Matter.Render.stop(currentRender);
                if (currentRender.canvas && currentRender.canvas.parentNode) {
                    currentRender.canvas.parentNode.removeChild(currentRender.canvas);
                }
                currentRender = null;
            }
            triggered = false;
        };

        const renderCanvas = () => {
            if (window.innerWidth <= 767) return;
            cleanupRender(); 
            const {
                Engine,
                Render,
                Runner,
                World,
                Bodies,
                Mouse,
                MouseConstraint
            } = Matter;

            const container = $scope.find(".pxl--physics");
            if (!container.length) return;

            const containerEl = container.get(0);
            const rect = containerEl.getBoundingClientRect();
            const scrollTop = window.scrollY;

            const canvasSize = {
                width: rect.width,
                height: rect.height,
                top: rect.top + scrollTop,
                left: rect.left
            };

            const engine = Engine.create();

            const render = Render.create({
                element: document.body,
                engine: engine,
                options: {
                    width: canvasSize.width,
                    height: canvasSize.height,
                    background: "transparent",
                    wireframes: false,
                }
            });

            render.canvas.style.position = "absolute";
            render.canvas.style.top = `${canvasSize.top}px`;
            render.canvas.style.left = `${canvasSize.left}px`;
            render.canvas.style.zIndex = "10";
            render.canvas.style.pointerEvents = "auto";

            render.canvas.addEventListener('wheel', function(e) {
                if (mouseConstraint && mouseConstraint.body) {
                    e.preventDefault();  
                    e.stopPropagation();
                    return;
                }

                window.scrollBy({ top: e.deltaY, left: 0, behavior: 'auto' });

                e.stopPropagation();
            }, { passive: false });

            const params = {
                isStatic: true,
                render: { fillStyle: "transparent" }
            };

            const floor = Bodies.rectangle(canvasSize.width / 2, canvasSize.height + 25, canvasSize.width, 50, params);
            const topWall = Bodies.rectangle(canvasSize.width / 2, -25, canvasSize.width, 50, params);
            const leftWall = Bodies.rectangle(-25, canvasSize.height / 2, 50, canvasSize.height, params);
            const rightWall = Bodies.rectangle(canvasSize.width + 25, canvasSize.height / 2, 50, canvasSize.height, params);

            const wordElements = containerEl.querySelectorAll(".pxl--item-physics");

            const wordBodies = [...wordElements].map((el) => {
                const width = el.offsetWidth;
                const height = el.offsetHeight;
                if (width === 0 || height === 0) return null;

                const elRect = el.getBoundingClientRect();
                const elTop = elRect.top + scrollTop - canvasSize.top;
                const elLeft = elRect.left - canvasSize.left;

                const body = Bodies.rectangle(
                    elLeft + width / 2,
                    elTop + height / 2,
                    width,
                    height,
                    {
                        restitution: 0.4,
                        friction: 0.3,
                        render: { fillStyle: "transparent" }
                    }
                    );

                return {
                    body,
                    elem: el,
                    width,
                    height,
                    render() {
                        const { x, y } = this.body.position;
                        this.elem.style.top = `${y - this.height / 2}px`;
                        this.elem.style.left = `${x - this.width / 2}px`;
                        this.elem.style.transform = `rotate(${this.body.angle}rad)`;
                    }
                };
            }).filter(Boolean);

            const mouse = Mouse.create(render.canvas);
            const mouseConstraint = MouseConstraint.create(engine, {
                mouse,
                constraint: {
                    stiffness: 0.2,
                    render: { visible: false }
                }
            });

            World.add(engine.world, [
                floor,
                topWall,
                leftWall,
                rightWall,
                mouseConstraint,
                ...wordBodies.map(item => item.body)
            ]);

            render.mouse = mouse;

            ScrollTrigger.create({
                trigger: containerEl,
                start: "top center",
                end: "bottom bottom",
                onEnter() {
                    if (!triggered) {
                        triggered = true;
                        Matter.Runner.run(engine);
                        Matter.Render.run(render);

                        (function rerender() {
                            wordBodies.forEach(obj => obj.render());
                            Matter.Engine.update(engine);
                            requestAnimationFrame(rerender);
                        })();
                    }
                }
            });

            currentRender = render;
            currentCanvas = render.canvas;
        };

    // Gọi lần đầu
        setTimeout(renderCanvas, 50);

    // Gọi lại khi resize
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (window.innerWidth > 767) {
                    renderCanvas();
                } else {
                    cleanupRender();
                }
            }, 200);
        });
    }


    $( window ).on( 'elementor/frontend/init', function() {
        flokaElAfterRender();
        flokaElBeforeRender();
        floka_scroll_fixed_section();
    // floka_scroll_fixed_column();
        floka_scroll_fixed_column_scale();
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_contact_form.default', PXL_Icon_Contact_Form );
        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_heading.default', function( $scope ) {
            floka_split_text($scope);
        } );

        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_product_grid.default', function( $scope ) {
            floka_split_text($scope);
        } );

        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_post_carousel.default', function( $scope ) {
            floka_split_text($scope);
        } );

        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_image_carousel.default', function( $scope ) {
            floka_split_text($scope);
        } );

        elementorFrontend.hooks.addAction( 'frontend/element_ready/pxl_physics_item.default', function( $scope ) { 
            floka_matter_physics($scope);
        } );

    } );

} )( jQuery );