/**
 * HTML5 Images Uploader
 * AUTHER: Tychio [code@tychio.net]
 * DATE: 2013/08/20
 * UPDATE: 2013/08/22
 * SUPPORT: IE10+/Chrome7+/Firefox4+/Opera12+/Safari6+
 **/
window.HTML5 = window.HTML5 || {};
window.HTML5.Uploader = (function (win, undefined) {
    "use strict";
    return function () {
        var conf = {
            max_size:               2*1024*1024,//2MB,limted size
            accept_type:            /image\/\w+/,//accepted type
            images_name:            'upload',//file parameter name in ajax request
            // /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i,//images
            // error information text
            error_type:             'File Type is images file only!',
            error_size:             'File Size too large!',
            error_compute:          'Unable to compute',
            loading:                'waiting for upload is complete...',
            input_id:               'html5-uploader',//input[type=file] selector
            is_multiple:            false,//allow to upload multiple files
            is_cross:               false,//allow to cross domain
            has_preview:            _setPreview,//preview image,need function
            has_progress:           _setProgress//progress bar，need function
        },
        api = {//interface
            set: setConfig,
            init: initializeUploader,
            upload: uploadImages,
            tip: alertMsg
        },
        index = {};// images loading sequence
        /**
         * setting configuration data.
         * @param p_conf [number/string/object]configuration data.
         * if number is the parameter of type then instead of max_size.
         * if string is the parameter of type then instead of input_id.
         * if object is the parameter of type then to extend globle variable 'conf'.
         * @return api
        **/
        function setConfig (p_conf) {
            if (typeof p_conf === 'number') {//size
                conf.max_size = p_conf;
            } else if (typeof p_conf === 'string') {//input selector
                conf.input_id = p_conf;
            } else if (typeof p_conf === 'object') {//config object
                for (var key in p_conf) {
                    if (conf[key] !== undefined) {
                        conf[key] = p_conf[key];
                    }
                }
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
                document.getElementById(conf.input_id)
                    .setAttribute('multiple', 'multiple');
            }
            // prepare uploading on input change
            document.getElementById(conf.input_id)
                .onchange = function (p_event) {
                if (!this.value) {// to prevent it was fired at initialize
                    return api;
                }
                //show the image
                if (_isFunction(conf.has_preview) && window.FileReader) {
                    // read selected file as DataURL
                    var _reader = [];
                    var _file = this.files;
                    conf.has_preview();
                    for (var i = 0; i < _file.length; i++) {
                        _reader[i] = new FileReader();
                        _reader[i].readAsDataURL(_file[i]);
                        _reader[i].onload = _load(i);
                    }
                }
            };
            function _load (_p_i) {//loaded file
                return function (_p_e) {
                    conf.has_preview(_p_e.target, _p_i);
                };
            }
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
            if (window.FormData === undefined) {
                alertMsg('Sorry, your browser don\'t support this function.' );
                return api;
            }
            var _file = document.getElementById(conf.input_id).files;
            _build(_file, 0, p_url, p_callback, p_param);
            return api;
        }
        /*
        * alert message
        * @param p_msg message
        * @param p_error using red color, if message is error message.
        * @return api
        */
        function alertMsg (p_msg, p_error) {
            var _alert = document.querySelector('.alert');
            if (p_msg === undefined) {
                _alert.style.display = 'none';
                _alert.innerHTML = '';
                document.getElementById(conf.input_id).value = '';
            } else {
                if (p_error) {
                    _alert.classList.add('alert-warning');
                    _alert.classList.remove('alert-success');
                } else {
                    _alert.classList.remove('alert-warning');
                    _alert.classList.add('alert-success');
                }
                _alert.innerHTML = p_msg;
                _alert.style.display = 'block';
            }
            return api;
        }
        function _build (p_file, p_index, p_url, p_cb, p_param) {
            if (p_index >= p_file.length) {// end recursion
                return;
            }
            var _form = new FormData();
            _form.append(conf.images_name, p_file[p_index]);
            if (p_param !== undefined) {
                for (var key in p_param) {
                    _form.append(key, p_param[key]);
                }
            }
            if (_checkFiles(p_file[p_index])) {//passed checking
                if (typeof p_cb === 'function') {//event handle object
                    p_cb = {
                        callback: p_cb
                    };
                }
                p_cb.loadend = function () {
                    conf.has_progress(101, p_index);
                    _build(p_file, p_index + 1, p_url, p_cb, p_param);
                };
                _sendAjax(p_index, p_url, _form, p_cb);
            } else {
                _build(p_file, p_index + 1, p_url, p_cb, p_param);
            }
        }
        //to send ajax request.
        function _sendAjax (p_index, p_url, p_form, p_func) {
            if (conf.has_progress) {//show progress bar
                conf.has_progress(0);
            }
            var _xhr = new XMLHttpRequest();  
            _xhr.upload.addEventListener('progress', function (p_event) {
                //loop in uploading
                if (p_event.lengthComputable) {
                    var _loaded = p_event.loaded;
                    var _total = p_event.total;
                    var _completedPrecent = Math.round(_loaded * 100 / _total);
                    conf.has_progress(_completedPrecent, p_index);
                } else {
                    alertMsg(conf.error_compute, true);
                }
                
            }, false);
            for (var key in p_func) {// listener other event
                if (key !== 'callback') {
                    _xhr.upload.addEventListener(key, p_func[key], false);
                }
            }
            _xhr.withCredentials = !!conf.is_cross;
            _xhr.open('POST', p_url);
            _xhr.send(p_form);
            _xhr.onreadystatechange = function() {//callback
                if (_xhr.readyState == 4 && _xhr.status == 200) {
                    try {
                        p_func.callback(JSON.parse(_xhr.responseText));
                    } catch (ex) {
                        p_func.callback(_xhr.responseText);
                    }
                }
            };
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
            var _bar = document.getElementById('html5-uploader-progress');
            var _container = _closest(_bar, 'progress');
            if (p_width < 0 || typeof p_width !== 'number') {
                _bar.style.width = 0;
                _container.style.display = 'none';
            } else {
                _bar.style.width = p_width + '%';
                _container.style.display = 'block';
            }
            function _closest (p_el, p_target) {
                var _parent = p_el.parentElement;
                if (_parent.className === p_target) {
                    return _parent;
                } else if (_parent.tagName === 'body') {
                    return false;
                } else {
                    return _closest(_parent, p_target);
                }
            }
        }
        // setting preview images
        function _setPreview () {
            //without preview image
        }
        // return true if it's function
        function _isFunction (p_func) {
            return p_func && typeof p_func === 'function';
        }
        return api;
    };
})(window);