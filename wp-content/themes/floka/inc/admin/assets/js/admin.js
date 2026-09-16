(function($) {

    "use strict";
    $(document).ready(function () {
        initTabs();
        initDemo();
        initPlugin();
        initUserProfile();
    });

    function initTabs(){
        $(document).on('click','.pxl-tab-nav > ul > li > a',function(){
            var data_filter = $(this).attr('data-filter');
            $(this).closest('ul').find('a').removeClass('active');
            $(this).addClass('active');
            $(this).closest('.pxl-demos').find('.pxl-col:not(.'+data_filter+')').css('display','none');
            $(this).closest('.pxl-demos').find('.pxl-col.'+data_filter).css('display','flex');
        });
    }

    function initDemo(){
        $('.pxl-demos').on('click', '.pxl-popup-import', function() {
            if ($('.pxl-error-message').length) {
                return;
            }
            var id = $(this).data('demo-id'),
            demo = pxlart_demos[id];
            $.ajax({
                url: ajaxurl,
                type: 'GET',
                data: {
                    action: 'pxlart_prepare_demo_package',
                    demo: id
                },
                beforeSend: function() {
                    $('.pxl-demo-loader').addClass('is-active');
                }
            }).done(function(resp) {  
                var jsonresp = JSON.parse(resp);  
                if (jsonresp.stat === 1) {
                    $('.pxl-demo-loader').removeClass('is-active');
                    $(document.body).append($('#tmpl-demo-popup').html());
                    initPopUp(id);
                } else {
                    $('.pxl-demo-loader').removeClass('is-active');
                    var $content = 'Your server connection';
                    if( ( jsonresp.stat === 0 ) && ( jsonresp.message != null ) ) {   
                        $content = jsonresp.message;
                    }
                    $('.pxl-demo-error-confirm').find('.message').html($content);
                    $('.pxl-demo-error-confirm').addClass('is-active'); 
                }
            });

            return false;
        });
        $(document).on('click','.pxl-demo-error-confirm .btn',function(){
            $(this).closest('.pxl-demo-error-confirm').removeClass('is-active');
        })
    }
 
    function initPopUp(demo) {
        var popup = $('#pxl-popup');
        $('#pxl-popup').on('click', '.pxl-imp-popup-close', function() {
            popup.remove();
        });

        // Import Now
        $('#pxl-popup').on('click', '.pxl-import-btn', function() {
           
            var options = [];
            $(this).closest('.pxl-imp-popup-wrap').find(' .pxl-imp-opt :checked').each(function() {
                options.push($(this).val());
            });

            var crop_img = 'yes';
            var skip_posts = 'yes';
            var crop_img_checked = $(this).closest('.pxl-imp-popup-wrap').find(' .pxl-imp-opt-crop :checked').val();
            var skip_posts_existen = $(this).closest('.pxl-imp-popup-wrap').find(' .pxl-imp-opt-skip-posts :checked').val();  
            if (typeof crop_img_checked === 'undefined') {
                crop_img = 'no';
            }
            if (typeof skip_posts_existen === 'undefined') {
                skip_posts = 'no';
            }
  
            var importer = new pxlartImporter(demo, options, crop_img, skip_posts);
        });
    }

    var pxlartImporter = function(id, options, crop_img, skip_posts) {
        var $this = this;
 
        $this.id = id;
         
        $this.options = options;
        
        $this.crop_img = crop_img;
        $this.skip_posts = skip_posts;

        this.init = function() {
           
            var self = this,
            message,
            start = $('#pxl-popup'),
            actions = this.options.slice();
            start.hide();
            
            $(document.body).append($('#tmpl-demo-import-modules').html());
          
            var data = new FormData();
 
            data.append('selected', 2);
            data.append('selections', options);
            runImport($this.options, $this.id, $this.crop_img, $this.skip_posts);
            
        };

        this.init();

    };

    function runImport(options, id, crop_img, skip_posts) {

        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'pxlart_import_start',
                demo: id,
                skip_posts: skip_posts
            }
        });
        var count = 0;  
        options[count] && ajaxRun('pxlart_' + options[options.length - options.length], options, id, count, crop_img, function() {
            count++;  
            options[count] && ajaxRun('pxlart_' + options[count], options, id, count, crop_img, function() {
                count++;  
                options[count] && ajaxRun('pxlart_' + options[count], options, id, count, crop_img, function() {
                    count++;
                    options[count] && ajaxRun('pxlart_' + options[count], options, id, count, crop_img, function() {
                        count++;
                        options[count] && ajaxRun('pxlart_' + options[count], options, id, count, crop_img, function() {
                            count++;
                            options[count] && ajaxRun('pxlart_' + options[count], options, id, count, crop_img);
                        });
                    });
                });
            })
        });
    }
    
    function ajaxRun(action, options, demo, idx, crop_img, callback) {
        
        var ajaxupdater, ajaxprogress;

        ajaxupdater = setInterval(function () {
            var width = ((idx + 1) * 100) / options.length;
            width = Math.ceil(width);
            $('#pxl-loader').parent().css('width', width + '%');
            $('#pxl-loader').html( width + '%');
           
        }, 1000);
        
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: action,
                demo: demo,
                content: ($('#pxl-imp-all').is(':checked') ? 1 : 0),
                media: ($('#pxl-imp-media').is(':checked') ? 1 : 0)
            },
            beforeSend: function(jq) {
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'pxlart_reset_logs',
                    },
                });
                ajaxprogress = setInterval(getProgress, 1000);

            },
            success: function(d) {
                 
            },
            complete: function() {
                if (typeof callback === 'function' && !action.match('undefined')) {
                    callback();
                }
                clearInterval(ajaxupdater);
                clearInterval(ajaxprogress);
            },
        }).done(function(res) {
            console.log(res); 
            if ('pxlart_' + options[options.length - 1] === action) {
                clearInterval(ajaxupdater);
                clearInterval(ajaxprogress);
                
                runImportFinish(options, demo, crop_img);

                var popup = $('#pxl-popup');
                $('#pxl-loader').parent().css('min-width', '100%');
                $('#pxl-loader').text("100%");
                setTimeout(function() {
                    $('#pxl-progress-popup').hide();
                    $('#pxl-progress').hide();
                    setTimeout(function() { popup.remove(); }, 10000);

                }, 800)

                if (typeof merlin_params !== 'undefined') {
                    var current_url = window.location.href;
                    current_url = current_url.replace("content", "ready");
                    window.location.href = current_url;
                }

                return false;
            }
        });
    }
    function runImportFinish(options, id, crop_img){
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'pxlart_import_finish',
                demo: id,
                crop_img: crop_img 
            },
            success: function(d) {
                 
            },
            complete: function() {
                if (typeof merlin_params === 'undefined') {
                    reload();
                }
            },
        })

    }
    function getProgress() {
        $.ajax({
            url: ajaxurl,
            type: 'GET',
            data: {
                action: 'pxlart_progress_imported',
            },
        }).done(function(resp) {
            $('#pxl-progress').text(resp);
            return false;
        });
        return false;
    }
      
    function reload() {
        setTimeout(function(){ location.reload(); }, 5000);
    }

    function PxlPluginManager(){
        var complete;
        var items_completed     = 0;
        var current_item        = "";
        var $current_node;
        var current_item_hash   = "";

        function ajax_callback(response){  
            var currentSpan = $current_node.find("h3>span"); 
            var current_btn = $current_node.find(".pxl-button"); 
            var new_text = current_btn.attr('data-text-active');
            var new_href = current_btn.attr('data-deactive-url');

            if(typeof response === "object" && typeof response.message !== "undefined"){
                currentSpan.html('Active');
                current_btn.find('span').html(new_text);
                $current_node.removeClass( 'installing success error' ).addClass(response.message.toLowerCase());
                current_btn.attr('href',new_href);

                // The plugin is done (installed, updated and activated).
                if(typeof response.done != "undefined" && response.done){ 
                    $current_node.removeClass('current');
                    find_next();
                }else if(typeof response.url != "undefined"){
                    // we have an ajax url action to perform.
                    if(response.hash == current_item_hash){             
                        $current_node.removeClass( 'installing success' ).addClass("error");
                        current_btn.find('span').html('Error');
                        find_next();
                    }else {
                        current_item_hash = response.hash;
                        jQuery.post(response.url, response, ajax_callback).fail(ajax_callback);
                    }
                }else{
                    // error processing this plugin
                    find_next();
                }
            }else{
                // The TGMPA returns a whole page as response, so check, if this plugin is done.
                process_current();
            }
        }

        function process_current(){ 
            if(current_item){
                $current_node.addClass("current");    
                jQuery.post(pxlart_admin.ajaxurl, {
                    action: "merlin_plugins",
                    wpnonce: pxlart_admin.wpnonce,
                    slug: current_item,
                }, ajax_callback).fail(ajax_callback);
                
            }
        }

        function find_next(){  
            if($current_node){ 
                if(!$current_node.hasClass("pxl-dsb-plugin-active")){
                    items_completed++;
                    $current_node.addClass("pxl-dsb-plugin-active");
                }
            }

            var $plus_item = $('.pxl-plugin-inst');
            if( $plus_item.length > 0 ){
                $plus_item.each(function(){
                    var $item = $(this).closest('.pxl-dsb-plugin');

                    if ( $item.hasClass("pxl-dsb-plugin-active") ) {
                        return true;
                    }
                    
                    current_item = $item.data("slug");
                    $current_node = $item;
                    process_current();
                    return false;
                });
            }
            
            if(items_completed >= $plus_item.length){
                // finished all plugins!
                complete();
            }
        }

        return {
            init: function(){
 
                $('.pxl-install-all-plugin').addClass("installing");
                $('.pxl-dsb-plugin:not(.pxl-dsb-plugin-active)').addClass("installing");
                complete = function(){

                    setTimeout(function(){
                        $(".pxl-dashboard-wrap").addClass('js-plugin-finished');
                        $('.pxl-install-all-plugin').removeClass("installing");
                    },1000);
 
                };
                find_next();
            }
        }
    }

    function initPlugin(){
        $(".pxl-install-all-plugin").on( "click", function(e) {
            e.preventDefault();
            var plugins = new PxlPluginManager();
            plugins.init();
        });
    }

    function initUserProfile(){
        $(document).on('click', '.pxl-select-image',  function (e) {
            e.preventDefault();
            var $this = $(this);
            var image = wp.media({
                title: 'Upload image',
                multiple: false
            }).open()
                .on('select', function (e) {
                    // This will return the selected image from the Media Uploader, the result is an object
                    var uploaded_image = image.state().get('selection').first();
                    // We convert uploaded_image to a JSON object to make accessing it easier
                    // Output to the console uploaded_image
                    var image_url = uploaded_image.toJSON().id;
                    // Let's assign the url value to the input field
                    $this.parent().find('.hide-image-url').val(image_url);
                    $this.parent().find('.pxl-show-image').empty();
                    $this.parent().find('.pxl-show-image').append('<img src = "' + uploaded_image.toJSON().url + '">');
                    $this.hide();
                    $this.parent().find('.pxl-remove-image').show();
                    $this.parents('form').find('input[name="savewidget"]').removeAttr('disabled');
                });
        });

        $(document).on('click', '.pxl-remove-image', function (e) {
            e.preventDefault();
            var $this = $(this);
            $this.parent().find('.hide-image-url').val('');
            $this.parent().find('.pxl-show-image').empty();
            $this.hide();
            $this.parent().find('.pxl-select-image').show();
            $this.parents('form').find('input[name="savewidget"]').removeAttr('disabled');
        });
    }

})(jQuery);
 

