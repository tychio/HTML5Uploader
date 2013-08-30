/**
 * HTML5 Images Uploader
 * AUTHER: Zhengzheng ZHANG[tychio@yeahmobi.com]
 * DATE: 2013/08/20
 * UPDATE: 2013/08/22
 * SUPPORT: IE10+/Chrome7+/Firefox4+/Opera12+/Safari6+
 **/
;window.HTML5 = window.HTML5 || {};
window.HTML5.Uploader = (function ($, undefined) {
    "use strict";
    return function () {
        var conf = {
            max_size:               0.5*1024*1024,//0.5MB,limted size
            accept_type:            /image\/\w+/,//accepted type
            images_name:            'upload',//file parameter name in ajax request
            // /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i,//images
            // error information text
            error_type:             'File Type is images file only!',
            error_size:             'File Size too large!',
            error_compute:          'Unable to compute',
            loading:                'waiting for upload is complete...',
            selector_input:         '#html5-uploader',//input[type=file] selector
            is_multiple:            false,//allow to upload multiple files
            has_preview:            _setPreview,//preview image,need function
            has_progress:           _setProgress//progress bar，need function
        },
        api = {//interface
            set: setConfig,
            init: initializeUploader,
            upload: uploadImages,
            tip: alertMsg
        },
        lock = false;//ajax lock
        /**
         * setting configuration data.
         * @param p_conf [number/string/object]configuration data.
         * if number is the parameter of type then instead of max_size.
         * if string is the parameter of type then instead of selector_input.
         * if object is the parameter of type then to extend globle variable 'conf'.
         * @return api
        **/
        function setConfig (p_conf) {
            if (typeof p_conf === 'number') {//size
                conf.max_size = p_conf;
            } else if (typeof p_conf === 'string') {//input selector
                conf.selector_input = p_conf;
            } else if (typeof p_conf === 'object') {//config object
                conf = $.extend(conf, p_conf);
            }
            return api;
        }
        /**
         * initialize the Uploader
         * checking configuration about progress bar, preview image and multiple.
         * @return api
        **/
        function initializeUploader () {
            //hide the progress by -1
            if (_isFunction(conf.has_progress)) {
                conf.has_progress(-1);
            }
            //clear preview images
            if (_isFunction(conf.has_preview)) {
                conf.has_preview();
            }
            //multiple files upload
            if (conf.is_multiple) {
                $(selector_input).attr('multiple', 'multiple');
            }
            // prepare uploading on input change
            $(conf.selector_input).unbind().change(function (p_event) {
                if (!$(this).val()) {// to prevent it was fired at initialize
                    return api;
                }
                //show the image
                if (_isFunction(conf.has_preview) 
                    && window.FileReader !== undefined) {
                    // read selected file as DataURL
                    var _reader = new FileReader();
                    var _file = $(this)[0].files[0];
                    _reader.readAsDataURL(_file);
                    _reader.onload = function (_p_e) {//loaded file
                        conf.has_preview(_p_e.target);
                    };
                }
            });
            return api;
        }
        /**
         * submit images or form data to upload
         * @param p_url a URL which ajax interface.
         * @param p_callback a function which ajax callback.running at success.
         * @param p_param some extra parameter.
         * @return api
         * building form data and submit it by xml http request.
        **/
        function uploadImages (p_url, p_callback, p_param) {
            if (lock) {
                return api;
            }
            if (window.FormData === undefined) {
                alertMsg('Sorry, your browser don\'t support this function.' );
                return api;
            }
            lock = true;
            var _form = new FormData();
            var _file = $(conf.selector_input)[0].files[0];
            _form.append(conf.images_name, _file);
            if (p_param !== undefined) {
                $.each(p_param, function (p_k, p_v) {
                    _form.append(p_k, p_v);
                });
            }
            if (_checkFiles(_file)) {//passed checking
                _sendAjax(p_url, _form, p_callback);
            }
            return api;
        }
        /*
        * alert message
        * @param p_msg message
        * @param p_error using red color, if message is error message.
        * @return api
        */
        function alertMsg (p_msg, p_error) {
            var _alert = $(".alert");
            if (p_msg === undefined) {
                _alert.fadeOut(200).empty();
                $('#html5-uploader').val('');
            } else {
                if (p_error) {
                    _alert.addClass('alert-warning')
                        .removeClass('alert-success');
                } else {
                    _alert.removeClass('alert-warning')
                        .addClass('alert-success');
                }
                _alert.fadeIn(200).html(p_msg);
            }
            return api;
        }
        //to send ajax request.
        function _sendAjax (p_url, p_form, p_func) {
            if (typeof p_func === 'function') {//event handle object
                p_func = {
                    callback: p_func
                };
            }
            var _xhr = new XMLHttpRequest();  
            _xhr.upload.addEventListener('progress', _uploadProgress, false);
            $.each(p_func, function (p_event, p_handle) {//listener other event
                if (p_event !== 'callback') {
                    _xhr.addEventListener(p_event, p_handle, false);
                }
            });
            _xhr.open('POST', p_url);
            _xhr.send(p_form);
            if (conf.has_progress) {//show progress bar
                conf.has_progress(0);
            }
            _xhr.onreadystatechange = function() {//callback
                lock = false;
                if (_xhr.readyState == 4 && _xhr.status == 200) {
                    try {
                        p_func.callback(JSON.parse(_xhr.responseText));
                    } catch (ex) {
                        p_func.callback(_xhr.responseText);
                    }
                }
            }
        }
        // checking files that type and size
        function _checkFiles (p_file) {
            //checking type and size
            if (!conf.accept_type.test(p_file.type)) {
                alertMsg(conf.error_type, true);
                return false;
            } if (conf.max_size < p_file.size) {
                alertMsg(conf.error_size, true);
                return false;
            } else {
                alertMsg(conf.loading);
                return true;
            }
        }
        // setting progress bar width and display
        function _setProgress (p_width) {
            var _bar = $('#html5-uploader-progress');
            var _container = _bar.closest('.progress');
            if (p_width < 0 || typeof p_width !== 'number') {
                _bar.width(0);
                _container.hide();
            } else {
                _bar.width(p_width + '%');
                _container.show();
            }
        }
        // setting preview images
        function _setPreview () {
            //without preview image
        }
        // get loaded and total to compute the progress, and setting width of progress bar.
        function _uploadProgress (p_event) {//loop in uploading
            if (p_event.lengthComputable) {
                var _loaded = p_event.loaded;
                var _total = p_event.total;
                var _completedPrecent = Math.round(_loaded * 100 / _total);
                conf.has_progress(_completedPrecent);
            } else {
                alertMsg(conf.error_compute, true);
            }
            
        }
        // return true if it's function
        function _isFunction (p_func) {
            return p_func && typeof p_func === 'function';
        }
        return api;
    };
})(jQuery);