/**
 * ------------------------------------------------------------
 * main.js v0.9.1 2014-09-30
 * Author: 
 *
 * 各ページで使う共通のスクリプト
 */


/**
 * Google Analytics Tracking Code
 */
//★★Google Analytics: change UA-XXXXX-X to be your site's ID.
(function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
e=o.createElement(i);r=o.getElementsByTagName(i)[0];
e.src='https://www.google-analytics.com/analytics.js';
r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
ga('create','UA-XXXXX-X','auto');ga('send','pageview');



/**
 * Documentオブジェクトをキャッシュして高速化
 * @link http://d.hatena.ne.jp/amachang/20071010/1192012056
 */
var _doc = document;



/**
 * 横に並んだ要素の高さを揃える (列IE7,8も対応)
 *
 * Equal Height Blocks in Rows by CHRIS COYIER(CSS Tricks) を改変したもの
 * @link http://css-tricks.com/equal-height-blocks-in-rows/
 * @link http://codepen.io/micahgodbolt/full/FgqLc
 * It's been modified into a function called at page load and then each time the page is resized.
 * One large modification was to remove the set height before each new calculation.
 * Usage : 要素をセットして実行
 */
(function(){
  //関数定義
  var equalheight = function(container) {

    var currentTallest = 0,
      currentRowStart = 0,
      rowDivs = [],
      $el,
      topPosition = 0;

    $(container).each(function() {

      $el = $(this);
      $($el).height('auto'); //added
      topPosition = $el.position().top;

      var currentDiv;

      if (currentRowStart !== topPosition) {

        // we just came to a new row.  Set all the heights on the completed row
        for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
          rowDivs[currentDiv].height(currentTallest);
        }

        // set the variables for the new row
        rowDivs.length = 0; // empty the array
        currentRowStart = topPosition;
        currentTallest = $el.height();
        rowDivs.push($el);
      }
      else {
        // another div on the current row.  Add it to the list and check if it's taller
        rowDivs.push($el);
        currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
      }
      // do the last row
      for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
        rowDivs[currentDiv].height(currentTallest);
      }
    });
  };

  // 実行（ページ読み込み時、リサイズ時） excute when the page is roaded/resized
  //★★配列で処理、ループ内ではfunction使うのはJSHint通らないのでfunctionをループ外に定義する
  //var elm1 = '#nav-inner>ul>li>a';//メインメニュー
  var elm2 = '.grid-block .cell';//グリッドブロックレイアウト

  //ページ読み込み時
  $(window).load(function() {
    //if($(elm1).length){ equalheight(elm1); }//適用したい要素をセット
    if($(elm2).length){ equalheight(elm2); }
  });

  //リサイズ時。Timerを使いリサイズ終了時のみ処理（参考:http://kadoppe.com/archives/2012/02/jquery-window-resize-event.html）
  var timerEqualheight = false;
  $(window).resize(function() {
    if (timerEqualheight !== false) {
      clearTimeout(timerEqualheight);
    }
    timerEqualheight = setTimeout(function() {
      //if($(elm1).length){ equalheight(elm1); }
      if($(elm2).length){ equalheight(elm2); }
    }, 200);
  });
})();


/**
 * 目次の生成 (目次にしたい要素が1つなら非表示、2つ以上で表示される)
 *
 * @param {String} str 目次にしたい要素。無ければデフォルト値 "article section h2" が適用
 * Usage : テンプレートの目次を設置したい箇所に <div class="page-index"></div> を設置
 * @author taku_n
 * @url ★★https://gist.github.com/
 * 参考：http://www.jankoatwarpspeed.com/examples/table-of-contents/demo1.html
 */
(function() {
  var generateTableOfContents = function(headers) {
    headers = headers || $('article section h2');//デフォルト値
    if(headers.size() >= 2) {
      var elm = $('<ul />');
      headers.each(function(i) {
        var current = $(this);
        current.attr('id', 'chapter_' + i);
        elm.append('<li><a href="#chapter_' + i + '">' + current.html() + '</a></li>');
      });
      $('.page-index')
        .append('<p><i class="fa fa-list-alt"></i> このページの目次 <small>(クリックで移動)</small></p>')
        .append(elm);
      return false;
    }
    else {
      $('.page-index').css('display', 'none');
    }
  };
  $(function() {
    generateTableOfContents();//目次にしたい要素を指定(複数ならカンマ区切り)
  });
})();


$(function() {
  /**
  * ページ内スムーススクロール 3/3
  * lodash(Underscore.js) の throttleメソッドで処理頻度を抑制
  *     https://gist.github.com/takunagai/457302aaa44421bbc958
  *     サンプル：http://codepen.io/oreo3/pen/JjHDz
  */
  $('a[href^=#], area[href^=#], a[href=""], area[href^=""]').on('click', function(e) {
    var href= $(this).attr('href');
    var target = $(href === '#top' || href === '#' || href === '' ? 'html' : href);
    var isSafari = /Safari/.test(navigator.userAgent);
    $(isSafari ? 'body' : 'html').animate({scrollTop:target.offset().top});
    e.preventDefault();
  });

  /**
   * ページ上部へ戻るボタン
   *     画面右下固定表示。スクロールで表示/非表示
  */
  // Setting
  var topBtn = $('#move-to-page-top');//ページTopに戻るボタン
  var windowHeight = (window.innerHeight || _doc.documentElement.clientHeight || 0);//ウインドウの高さ

  // ウインドウの高さ以上スクロールさせると表示、以下なら非表示
  $(window).scroll(_.throttle(function(){//scrollイベントは500ミリ秒ごとに発火(lodash(Underscore.js)依存)
    if ($(window).scrollTop() > windowHeight){
      topBtn.fadeIn();
    }
    else {
      topBtn.fadeOut();
    }
  }, 500));
});
