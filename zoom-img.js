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
})(jQuery);

var scale = 0.5,srcArr = [], w, h;
var $preview = $('#preview');
/**
 * 图片的预下载
 **/
var preLoadImage = function(url,callback){
    var img = new Image();
    img.src = url;
    if (img.complete) { // 如果图片已经存在于浏览器缓存，直接调用回调函数
        callback.call(img);
        return false; // 直接返回，不用再处理onload事件
    }
    img.onload = function () { //图片下载完毕时异步调用callback函数。
        callback.call(img);//将回调函数的this替换为Image对象
    };
};
/**
 * 滚轮上下滚动，图片放大缩小
 **/
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
//给页面绑定滑轮滚动事件
if (document.addEventListener) {
    document.addEventListener('DOMMouseScroll', scrollFunc, false);
}
//滚动滑轮触发scrollFunc方法
//window.onmousewheel = document.onmousewheel = scrollFunc;
document.onmousewheel = scrollFunc;
document.onkeydown=function(event){
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if(e && e.keyCode==27){ // 按 Esc
        $('#popPreview').hide();
    }
};
/**
 * 显示大图
 **/
var showImg = function(_this){
    var $this = $(_this),
        src = $this.attr('data'),
        $next = $this.next().attr('data'),
        $prev = $this.prev().attr('data');

    if(src == undefined){
        return;
    }
    var index = getCurrentIndex($('#gallery').children(),src);
    $('#zoomLayer').show();
    //加载图片资源
    preLoadImage(src,function(){
        createHtml(src,this.width,this.height);
        $('#popPreview .close,#popPreviewTools').click(function(){
            $('#popPreview').hide();
        });
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
                alert('前面没有拉~');
                return;
            }
            index -= 1;
            loading(srcArr[index]);
        });
        $('#popPreview .right').click(function(){
            if((index+1) == srcArr.length){
                alert('后面没有拉~');
                return;
            }
            index += 1;
            loading(srcArr[index]);
        });
    });
    return ;
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
    style.innerHTML = '@-webkit-keyframes mymove {0%{-webkit-transform:scale(0);}100%{-webkit-transform:scale('+scale+');}}';

    var html = '<img class="reviewphoto move" style="top:'+top+';left:'+left+';" src="'+src+'">';
    $preview.html(html);
    $('#popPreview').show();
    $('#preview .reviewphoto').dragmove();
    $('#zoomLayer').hide();
}
//加载新图片
var loading = function(src){
    $('#zoomLayer').show();
    //加载图片资源
    preLoadImage(src,function(){createHtml(src,this.width,this.height)});
};
//获取当前点击对象的索引
var getCurrentIndex = function(list,o){
    var index;
    for(var i=0;i<list.length;i++){
        var tmp = $(list[i]).attr('data');
        if(o == tmp){
            index = i;
        }
        srcArr.push(tmp);
    }
    return index;
};
