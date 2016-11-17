/**
 * Created by wangyong7 on 2015/10/14.
 */
(function($) {
    $.fn.dragmove = function() {
        return this.each(function() {
            var $document = $(document),
                $this = $(this),
                active,
                startX,
                startY;

            $this.on('mousedown touchstart', function(e) {
                active = true;
                startX = e.originalEvent.pageX - $this.offset().left;
                startY = e.originalEvent.pageY - $this.offset().top;

                if ('mousedown' == e.type)
                    click = $this;

                if ('touchstart' == e.type)
                    touch = $this;

                if (window.mozInnerScreenX == null)
                    return false;
            });

            $document.on('mousemove touchmove', function(e) {
                if ('mousemove' == e.type && active)
                    click.offset({
                        left: e.originalEvent.pageX - startX,
                        top: e.originalEvent.pageY - startY
                    });

                if ('touchmove' == e.type && active)
                    touch.offset({
                        left: e.originalEvent.pageX - startX,
                        top: e.originalEvent.pageY - startY
                    });

            }).on('mouseup touchend', function() {
                active = false;
            });
        });
    };

    $.fn.zoomImg = function(options){
        //默认属性
        var _defaults = {
            "color"  : '#000',
            "opacity": 0.5, 
            "loading": "img/loading100.gif"
        };
        //合并属性
        var _options = $.extend(_defaults, options);

        var _THIS= $(this),
            srcArr= [],
            w,
            h,
            index=0,
            scale=0.5,
            list=$('#gallery').children();

        //获取大图path数组    
        _THIS.each(function (i) {
            srcArr.push($(this).attr("data")); 
        });    

        (function(){
            var background = 'background:'+_options.color+';opacity:'+_options.opacity;
            var html = '<div id="zoomLayer" class="zoom100" style="display:none;"><img id="zoomImg" class="loading" src="'+_options.loading+'" /></div>';
            html += '<div id="popPreview" style="display:none;"><div class="alpha_bg" style="'+background+'"></div><div id="preview"></div><div class="popFooter">';
            html += '<div class="nav"><ul><li><a class="left" href="javascript:void(0)">上一个</a></li>';
            html += '<li><a class="right" href="javascript:void(0)">下一个</a></li><li><a class="enlarge" href="javascript:void(0)"></a></li>';
            html += '<li><a class="narrow" href="javascript:void(0)"></a></li><li><a class="close" href="javascript:void(0)">X</a></li></ul>';
            html += '</div></div><a href="javascript:void(0);" id="popPreviewTools" class="pop_close">关闭</a></div>';
            $(document.body).append(html);
            var style = '<style id=dynamic></style>';
            $(document.head).append(style);
            $("<link>").attr({ rel: "stylesheet",type: "text/css",href: "zoom.min.css"}).appendTo("head");
        })();
        
        // 图片的预下载
        var preLoadImage = function(url,callback){
            $('#zoomLayer').show();
            var img = new Image();
            img.src = url;
            if (img.complete) { // 如果图片已经存在于浏览器缓存，直接调用回调函数
                $('#zoomLayer').hide();
                callback.call(img);
                return false; // 直接返回，不用再处理onload事件
            }
            img.onload = function () { //图片下载完毕时异步调用callback函数。
                $('#zoomLayer').hide();
                callback.call(img);//将回调函数的this替换为Image对象
            };
        };

        //生成缩略图DOM
        var createHtml = function(src,w,h){
            var top = 0,
                _w= Math.round(w/2),
                _h= Math.round(h/2),
                ww= $(window).width(),
                wh= $(window).height();
            if(ww <= 640){
                //手机端
                scale = 1/(Math.round(w/ww));
                top = "50%";
            }
            else{        
                if(w>=ww){
                    //宽图
                    if(h>=wh){ //长度>=屏幕
                        scale = Math.ceil((ww*wh)/(w*h)*100)/100;
                        top = "-" + (h-wh)/2 + "px";
                        left= (ww-w)/2 + "px";
                    }else{ //长度<屏幕
                        scale = Math.ceil((ww/w)*100)/100;
                        top = (wh-h)/2+"px";
                        left= "-" + (w-ww)/2 + "px";
                    }
                }else{
                    if(h>w && h>=wh){//长图
                        scale = Math.ceil((wh/h)*100)/100;
                        top = "-" + (h-wh)/2 + "px";
                        left= (ww-w)/2 + "px";
                    }else{
                        //小图
                        scale = 1;
                        top = (wh-h)/2 + "px";
                        left= (ww-w)/2 + "px";
                    }   
                }
            } 
            var style = document.getElementById("dynamic");
            style.innerHTML = '@-webkit-keyframes mymove {0%{-webkit-transform:scale(0);}100%{-webkit-transform:scale('+scale+');}}@keyframes mymove {0%{transform:scale(0);}100%{transform:scale('+scale+');}}';

            var html = '<img class="reviewphoto move" style="top:'+top+';left:'+left+';" src="'+src+'">';
            return html;
        };

        //滚轮上下滚动，图片放大缩小
        var scrollFunc = function (e) {
            e = e || window.event;
            var _scale ,
                isShow = $('#popPreview').css('display'),
                imgO = $('#preview .reviewphoto');
            if(isShow == 'block'){
                if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件
                    if (e.wheelDelta > 0) { //向上
                        scale = parseFloat(scale+0.1);
                    }
                    if (e.wheelDelta < 0) { //向下
                        scale = parseFloat((scale-0.1).toFixed(1));
                        scale = scale<0?0:scale;
                    }
                } else if (e.detail) {  //Firefox滑轮事件
                    if (e.detail> 0) { //向上
                        scale += 0.05;
                    }
                    if (e.detail< 0) { //向下
                        scale = (scale <= 0)? 0: scale -= 0.1;
                    }
                }
                $('#preview .reviewphoto').removeClass('move');
                _scale = 'scale('+scale+')';
                imgO.css('-webkit-transform',_scale);
            }
        };

        //渲染到页面
        var renderImg = function(dom){
            $('#preview').html(dom);
            $('#popPreview').show();
            $('#preview .reviewphoto').dragmove();
        };

        _THIS.on("click",function(){
            //获取当前的点击元素的索引
            var current_src = $(this).attr('data');
            if(current_src == undefined) return false;

            index = _THIS.index($(this)); //获取点击索引
            preLoadImage(current_src,function(){
                renderImg(createHtml(current_src,this.width,this.height));
                $('#popPreview .close,#popPreviewTools').click(function(){$('#popPreview').hide();});
                $('#popPreview .enlarge').click(function(){
                    scale = parseFloat(scale+0.1);
                    var _scale = 'scale('+scale+')';
                    $('#preview .reviewphoto').removeClass('move');
                    $('#preview .reviewphoto').css('-webkit-transform',_scale);
                });
                $('#popPreview .narrow').click(function(){
                    scale = parseFloat((scale-0.1).toFixed(1));
                    scale = scale<0?0:scale;
                    var _scale = 'scale('+scale+')';
                    $('#preview .reviewphoto').removeClass('move');
                    $('#preview .reviewphoto').css('-webkit-transform',_scale);
                });
                $('#popPreview .left').click(function(){
                    if(index ==0){
                        index = srcArr.length -1;
                    }else{
                        index -= 1;
                    }
                    preLoadImage(srcArr[index],function(){
                        renderImg(createHtml(srcArr[index],this.width,this.height));
                    });
                });
                $('#popPreview .right').click(function(){
                    if((index+1) == srcArr.length){
                        index = 0;
                    }else{
                        index += 1;    
                    }
                    preLoadImage(srcArr[index],function(){
                        renderImg(createHtml(srcArr[index],this.width,this.height));
                    });
                });
            });
        });

        //给页面绑定滑轮滚动事件
        if (document.addEventListener) {
            document.addEventListener('DOMMouseScroll', scrollFunc, false);
        }
        //滚动滑轮触发scrollFunc方法
        document.onmousewheel = scrollFunc;
        document.onkeydown=function(event){
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if(e && e.keyCode==27){ // 按 Esc
                $('#popPreview').hide();
            }
        };
    };
})(jQuery);

