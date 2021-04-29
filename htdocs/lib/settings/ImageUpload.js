$.fn.imageUpload = function() {
    $.each(this, function(){
        var $this = $(this);
        var $uploadButton = $this.find('button.upload');
        var $restoreButton = $this.find('button.restore');
        var $img = $this.find('img');
        var originalUrl = $img.prop('src');
        var $input = $this.find('input');
        var id = $input.prop('id');
        var maxSize = $this.data('max-size');
        var $error;
        var handleError = function(message) {
            clearError();
            $error = $('<div class="invalid-feedback">' + message + '</div>');
            $this.after($error);
            $this.addClass('is-invalid');
        };
        var clearError = function(message) {
            if ($error) $error.remove();
            $this.removeClass('is-invalid');
        };
        $uploadButton.click(function(){
            $uploadButton.prop('disabled', true);
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/jpeg, image/png';

            input.onchange = function(e) {
                var reader = new FileReader()
                reader.readAsArrayBuffer(e.target.files[0]);
                reader.onprogress = function(e) {
                    if (e.loaded > maxSize) {
                        handleError('Maximum file size exceeded');
                        $uploadButton.prop('disabled', false);
                        reader.abort();
                    }
                };
                reader.onload = function(e) {
                    if (e.loaded > maxSize) {
                        handleError('Maximum file size exceeded');
                        $uploadButton.prop('disabled', false);
                        return;
                    }
                    $.ajax({
                        url: '/imageupload?id=' + id,
                        type: 'POST',
                        data: e.target.result,
                        processData: false,
                        contentType: 'application/octet-stream',
                    }).done(function(data){
                        $input.val(data.file);
                        $img.prop('src', '/imageupload?file=' + data.file);
                        clearError();
                    }).fail(function(xhr, error){
                        try {
                            var res = JSON.parse(xhr.responseText);
                            handleError(res.error || error);
                        } catch (e) {
                            handleError(error);
                        }
                    }).always(function(){
                        $uploadButton.prop('disabled', false);
                    });
                }
            };

            input.click();
            return false;
        });

        $restoreButton.click(function(){
            $input.val('restore');
            $img.prop('src', originalUrl + "&mapped=false");
            clearError();
            return false;
        });
    });
}