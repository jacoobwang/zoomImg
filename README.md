## 相册组件

### 功能

实现相册功能

### 亮点

该组件结合css3增加了图片展示的变化性，且对大图支持完美，我知道很多插件比如fancy-box，它也可以预览。但是你不能放大它，它限制了最大宽度和高度，这是非常糟糕的。

### 使用方法

```html
<script type="text/javascript" src="jquery.min.js"></script>
<script type="text/javascript" src="zoom-img.min.js" ></script>
<script type="text/javascript">
	$('#gallery .zoom').zoomImg(); //懒人版
//－－－－－－－－－－－分界线－－－－－－－－－－－－－－－－－－－－－  
    $('#gallery .zoom').zoomImg({
      'color' : '#000', //背景颜色
      'opacity': 0.5,   //背景透明度
      'loading': 'img/loading001.gif' //loading图片
    }); 
</script>

```

### 体验地址（由于aws缘故，第一次预览可能会卡，图片加载完后很流畅）

http://www.loadphp.cn/lab/zoomImg/index.html

### tips

如果喜欢的请➕个star

有更好意见的欢迎fork

