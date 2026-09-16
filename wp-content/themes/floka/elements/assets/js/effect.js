 ( function( $ ) {
    function hoverTransformDirectionAnimation( $scope ) {
        let els = $scope.find('.hover-rotate3d-direction, .hover-translate3d-direction');
        if(!els.length) return;
        const directions = { 0: 'top', 1: 'right', 2: 'bottom', 3: 'left' };
        const getDirectionKey = (ev, $node) => {
            const offset = $node.offset();
            const width = $node.outerWidth();
            const height = $node.outerHeight();
            const l = ev.pageX - offset.left;
            const t = ev.pageY - offset.top;
            const x = (l - (width / 2) * (width > height ? (height / width) : 1));
            const y = (t - (height / 2) * (height > width ? (width / height) : 1));
            return Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;
        };

        const getHorizontalKey = (ev, $node) => {
            const offset = $node.offset();
            const width = $node.outerWidth();
            const l = ev.pageX - offset.left;
            const x = l - width / 2;
            return x < 0 ? 3 : 1;
        };

        const getVerticalKey = (ev, $node) => {
            const offset = $node.offset();
            const height = $node.outerHeight();
            const t = ev.pageY - offset.top; 
            const y = t - height / 2; 
            return y < 0 ? 0 : 2;
        };
        class Item {
            constructor($element) {
                this.$element = $element;
                this.activeClass = ''; 
                this.$element.on('mouseenter', (ev) => this.update(ev, 'in'));
                this.$element.on('mouseleave', (ev) => this.update(ev, 'out'));
            }
            update(ev, prefix) {
                let itemHover = this.$element.find('.direction-item').first();
                if(!itemHover.length) {
                    itemHover = $('<span class="item-hover direction-item"></span>');
                    this.$element.append(itemHover);
                }
                const effectType = this.$element.hasClass('hover-rotate3d-direction') ? 'rotate3d' : 
                this.$element.hasClass('hover-translate3d-direction') ? 'translate3d' : '';
                if (!effectType) return;
                let direction = this.$element.data().direction;
                let directionClass = `${effectType}-${prefix}-${directions[getDirectionKey(ev, this.$element)]}`;
                if(direction === 'horizontal') {
                    directionClass = `${effectType}-${prefix}-${directions[getHorizontalKey(ev, this.$element)]}`
                }
                if(direction === 'vertical') {
                    directionClass = `${effectType}-${prefix}-${directions[getVerticalKey(ev, this.$element)]}`
                }

                if (this.activeClass) {
                    this.$element.removeClass(this.activeClass); 
                }
                this.activeClass = directionClass;
                this.$element.addClass(this.activeClass); 
            }
        }
        $(els).each(function () {
            new Item($(this));
        });
    }

    function hoverScaleSpotlight( $scope ) {
        let els = $scope.find('.btn-spotlight-scale');
        if(!els.length) return;
        const update = (e, isMouseenter) => {
            let item = $(e.currentTarget).find('.item-spotlight').first();
            if (isMouseenter && !item.length) {
                item = $('<span class="item-spotlight"></span>');
                $(e.currentTarget).prepend(item);
            }
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - left;
            const mouseY = e.clientY - top;
            const distToCorners = [
                Math.hypot(mouseX, mouseY), 
                Math.hypot(mouseX - width, mouseY), 
                Math.hypot(mouseX, mouseY - height),
                Math.hypot(mouseX - width, mouseY - height) 
            ];
            const maxRadius = Math.max(...distToCorners);

            gsap.to(item, {
                x: mouseX,
                y: mouseY,
                ease: "power1.out",
                duration: 0.5,
                scale: isMouseenter ? (maxRadius / 10) + 0.2 : 0, 
            });
        };
        els.each(function(i, el) {
            $(el).on('mouseenter', (e) => update(e, true));
            $(el).on('mouseleave', (e) => update(e, false));
        })
    }



    $( window ).on( 'elementor/frontend/init', function() {

        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_button.default`, function( $scope ) {
            hoverScaleSpotlight($('.elementor'));
        });

        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_post_grid.default`, function( $scope ) {
            hoverScaleSpotlight($('.elementor'));
        }); 

        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_post_carousel.default`, function( $scope ) {
            hoverScaleSpotlight($('.elementor'));
        }); 

        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_contact_form.default`, function( $scope ) {
            hoverScaleSpotlight($('.elementor'));
        }); 

        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_slide_home.default`, function( $scope ) {
            hoverScaleSpotlight($('.elementor'));
        }); 

        elementorFrontend.hooks.addAction( `frontend/element_ready/pxl_tabs.default`, function( $scope ) {
            hoverTransformDirectionAnimation($('.elementor'));
        });

    });
} )( jQuery );