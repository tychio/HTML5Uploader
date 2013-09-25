Image Uploader based on HTML5
---

It's a images uploader that support multiple upload, preview image and progress bar.

Use
---

The API is very simple and Only a few.You need `init` to build the uploader and `upload` to upload image.

    var uploader = window.HTML5.Uploader();
    uploader.init();
    document.getElementById('submit').onclick = function () {
        uploader.upload('uploader.php', function () {
            // ur code...
        });
    };

All right,I suggest that `set` is necessary.Because I think the default options aren't to your taste.

    uploader.set({
        max_size:               2*1024*1024,//2MB,limted size
        accept_type:            /image\/\w+/,//accepted type
        images_name:            'upload',//file parameter name in ajax request
        error_type:             'File Type is images file only!',
        error_size:             'File Size too large!',
        error_compute:          'Unable to compute',
        loading:                'waiting for upload is complete...',
        input_id:               'html5-uploader',//input[type=file] selector
        is_multiple:            false,//allow to upload multiple files
        has_preview:            _setPreview,//preview image,need function
        has_progress:           _setProgress//progress bar，need function
    });

Your should change value of `images_name` and `selector_input`.They are bound up with your HTML.

Furthermore,There is two attributes are type of function for progress and preview in options.They are two special functions.The uploader isn't only them to show,but also them to clear it of their products in the main parameter is undefined.

    uploader.set({
        has_preview: function (p_target) {
            var _preview = document.getElementById('preview');
            if (typeof p_target === 'undefined') {
                _preview.setAttribute('src', '');
                _preview.style.display = 'none';
            } else {
                _preview.setAttribute('src', p_target.result);
                _preview.style.display = 'block';
            }
        }
    });
    



