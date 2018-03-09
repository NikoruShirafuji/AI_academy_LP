import json from '../../rootPath.json'; //rootの設定ファイル読み込み
import $ from 'jquery';
import Slider from './swiper_option';



/**
* ページ下部のフォームの位置を切り替える
* @param {num} formIndex: current Form Index
*
*/
var slideForm = function(formIndex) {
  var $curForm = $('#jsi-formWrap');
  $curForm.stop(true,true);
  $curForm.removeClass('is-left_0 is-left_100 is-left_200');
  switch (formIndex) {
    case 0:
    $curForm.addClass('is-left_200');
    break;
    case 1:
    $curForm.addClass('is-left_100');
    break;
    case 2:
    $curForm.addClass('is-left_0');
    break;
  }
}

/**
* ページ下部のタイトルの位置を切り替える
* @param {num} formIndex: current Form Index
*
*/
var slideTitleSP = function(formIndex) {
  var $curFormTitle = $('#jsi-formTitle');
  $curFormTitle.stop(true,true);
  $curFormTitle.removeClass('is-left is-center is-right');
  switch (formIndex) {
    case 0:
    $curFormTitle.addClass('is-left');
    break;
    case 1:
    $curFormTitle.addClass('is-center');
    break;
    case 2:
    $curFormTitle.addClass('is-right');
    break;
  }
}

/**
* ページ下部のフォーム,タイトル,タイトル下のバーの位置を切り替える
* @param {num} formIndex: current Form Index
*
*/
var changeForm = function(formIndex) {
  slideForm(formIndex);
  slideTitleSP(formIndex);
  $('#jsi-navBar').animate({left: (formIndex * 100 / 3) + '%'}, 300);
}

/**
* 選択されているフォームに合わせてページの高さを調整
* @param {num} formIndex: current Form Index
*/
var getNavHight = function(formIndex) {
  var getHight;
  var $curForm = $('#jsi-formWrap');
  switch (formIndex) {
    case 0:
    getHight = $curForm.children().eq(2).height();
    break;
    case 1:
    getHight = $curForm.children().eq(1).height();
    break;
    case 2:
    getHight = $curForm.children().eq(0).height();
    break;
  }
  $curForm.css('height', getHight + 'px');
}

/**
* フォーム位置まで画面をスクロール
* ※ windowサイズに合わせて位置を調整しています。
*/
var pageScroll = function() {
  var targetOffset = $('#jsi-form').offset().top;
  if ( $(window).width() > 640) {
    targetOffset = targetOffset + 19;
  } //PC,Tab版用に+19して微調整
  $('html,body').animate({scrollTop: targetOffset},1000);
}

/**
* pageUrlより判断し選択されるべきform番号を返しています。
*/
var locationFrom = function() {
  var url = $(location).attr('href');
  var formIndex = 0;
  if(url.indexOf("?id=") != -1){
      var id = url.split("?id=");
      if (id[1] == 'form') {
        formIndex = 0
      } else if (id[1] == 'teacher') {
        formIndex = 1;
      } else if (id[1] == 'company') {
        formIndex = 2;
      }
      changeForm(formIndex);
      getNavHight(formIndex);
      return formIndex;
  }
  changeForm(formIndex);
  getNavHight(formIndex);
  return formIndex;
}

/**
* pageUrlより判断し画面をスクロール
*/
var locationFromScroll = function() {
  var url = $(location).attr('href');
  if(url.indexOf("?id=") != -1) {
    setTimeout(function(){
      pageScroll()
    },1000);
  }
}

/**
* input,textareaの文字数をカウント
* @param {$jquery} $curTextArea: current Text Area
*/
var keyCount = function($curTextArea) {
  var counts;
  counts = $curTextArea.val().length;
  $curTextArea.siblings('.jsc-getCountUp').children('span').text(counts);
}

/**
* 使用しているデバイスに応じてHTMLに<video>タグを挿入します
* returnで使用しているデバイスを返す。
*/
var deviceCheck = function() {
  var ua = navigator.userAgent;
  var userDevice;
  var path = json.root;
  var addElementSP = '<div class="p-top-firstView__video--sp"><img src="' + path + 'assets/img/video_firstView_sp.gif"></div>';
  var addElementPC = `<video src="${path}assets/img/video_firstView_pc.mp4" autoplay playinline loop poster="${path}assets/img/bg_firstView_img.jpg" class="p-top-firstView__video--pc"></video>`;
  if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
    // スマートフォン用コード
    $('#jsi-video').append(addElementSP);
    userDevice = 'sp';
  } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
    // タブレット用コード
    $('#jsi-video').append(addElementPC);
    userDevice = 'tab';
  } else {
    // PC用コード
    $('#jsi-video').append(addElementPC);
    userDevice = 'pc';
  }
  return userDevice;
}

/**
* 指定したDOMをInPointに達した時点でfadeInさせます
* @param {jquery} $headerWrap: ヘッダーを包括する要素
*/
var fadeInNav = function($headerWrap) {
  var TargetPos = $('#jsi-headerInPoint').offset().top;
  var scrollPos = $(window).scrollTop();
  if ( scrollPos > TargetPos ) {
    $headerWrap.fadeIn();
  } else {
    $headerWrap.fadeOut();
  }
}

$(function() {
  new Slider();
  var userDevice = deviceCheck();
  var formIndexNum = locationFrom();
  var headerWrap = $('#jsi-headerBox');
  var resizeFlag = false;
  locationFromScroll();
  headerWrap.hide();

  /*  フォーム入力時 */
  $('.jsc-targetCountUp').keyup(function() {
    keyCount($(this));
  });

  /* 『jsc-goToForm』の付いたリンク or button のクリック時 */
  $('.jsc-goToForm').on('click', function(event) {
    event.preventDefault();
    formIndexNum = $(this).data('goto');
    pageScroll();
    changeForm(formIndexNum);
    getNavHight(formIndexNum);
  });

  /* ウィンドウスクロール */
  $(window).on('scroll', function() {
    fadeInNav(headerWrap)
  });

  /* ウィンドウ幅リサイズ */
  $(window).resize(function() {
    if (resizeFlag !== false) {
      clearTimeout(resizeFlag);
    }
    resizeFlag = setTimeout(function() {
      getNavHight(formIndexNum);
    }, 200);
  });

  /* フォームタイトルクリック */
  $('#jsi-formTitle').children().on('click', function() {
    formIndexNum = $('#jsi-formTitle').children().index($(this));
    changeForm(formIndexNum);
    getNavHight(formIndexNum);
  });


  /**
  * 以下フォームスライド関連
  * @param {num} rPoint, nPoint, difference, position, itmeIndex, fixPosition[i]
  * それぞれ   スタート地点、移動地点、移動距離、現在地、form数、基準地点
  */
  var rPoint;
  var nPoint;
  var position = 0;
  var difference = 0;
  var itemsIndex = $('#jsi-formWrap').children("li").length - 1;
  var fixPosition = new Array;
  for (var i = 0; i <= itemsIndex; i++) {
    fixPosition[i] = i * (-($('#jsi-formWrap').width()));
  }

  /* スマホのみフリック対応 */
  if (userDevice == 'sp') {
    $('#jsi-formWrap').on({
      'touchstart' : starting,
      'touchmove' : moveing,
      'touchend' : ending
    });
  }

  /* フリック開始 */
  function starting($currentForm) {
    position = fixPosition[formIndexNum];
    difference = 0;
    console.log('startPos =' + position);
    rPoint = $currentForm.originalEvent.changedTouches[0].pageX;
    $(this).children().stop(true,true)
  };

  /* フリック中 */
  function moveing($currentForm) {
    nPoint = $currentForm.originalEvent.changedTouches[0].pageX;
    difference = nPoint - rPoint;
    console.log('difference =' + difference);
    if((difference + position) > 0){
      $(this).children().css('left', '0px');
    } else if((difference + position) < fixPosition[itemsIndex]){
      $(this).children().css('left', fixPosition[itemsIndex] + 'px');
    } else {
      $(this).children().css('left', (position+ difference) +'px');
    }
  };

  /* フリック終了 */
  function ending() {
    position = difference + position;
    console.log("end pos =" + position);
    if (position > 0) {
      position = 0;
    } else if (position < fixPosition[itemsIndex]) {
      position = fixPosition[itemsIndex];
    }
    formIndexNum = -(position / ($('#jsi-formWrap').width()));
    console.log('formIndexNum = ' + formIndexNum);
    formIndexNum = Math.round(formIndexNum);
    console.log(formIndexNum);
    position = fixPosition[formIndexNum];
    $(this).children().css('left', '');
    changeForm(formIndexNum);
    getNavHight(formIndexNum);
  };

  /**
   * 確認モーダル表示前のエラーチェック
   *
   * @param {jquery} $inputWrap : inputを包括する要素
   *
   */
  var chkFormError = function($inputWrap) {
    var requiredName = $inputWrap.find('.name_inp').val();

    if($inputWrap.find('.is_error').length > 0){
      return 'error';
    } else if(requiredName == '') {
      return 'require';
    } else {
      return 'correct';
    }
  };

  /**
   * submit前の確認ダイアログ
   *
   * @param {jquery} $form : form要素
   *
   */
   var chkMdl = function($form) {
    if(window.confirm('送信してよろしいですか？')) {//確認ダイアログを表示
      $form.submit();
    } else {
      return false;
    }
  };

  //イベント
  //input要素のバリデーション
  $('.jsc_inp').on('focus',function(){
    $(this).closest('dd').removeClass('is_error');
  });

  $('.jsc_inp').on('blur',function(){
    switch ($(this).data('meta')) {
      //メールアドレス
      case 'email':
        var inputVal = $(this).val(),//入力値
            trimVal = $(this).val($.trim(inputVal)).val(),//先頭と末尾の全半角スペースを除去
            trimValLength = trimVal.length;//トリム後の文字長

        if(trimVal.match(/[^ -~]/) && trimValLength <= 40) {
          $(this).closest('dd').addClass('is_error');
        }
      break;
      //電話番号
      case 'tell':
        var inputVal = $(this).val(),//入力値
            trimVal = $(this).val($.trim(inputVal)).val(),//先頭と末尾の全半角スペースを除去
            trimVal_hyphen = trimVal.replace(/[\s-]/g, ''),//文字列の半角スペースとハイフンを除去
            trimValLength = trimVal_hyphen.length;//トリム後の文字長

            $(this).val(trimVal_hyphen);

        if( !trimVal_hyphen.match(/^[0-9]+$/) && trimValLength !== 0) {
          $(this).closest('dd').addClass('is_error');
        }
      break;
    }
  });

  $('.jsc_form_submit').on('click', function(){
    var $form = $(this).closest('form'),
        chkFlg = chkFormError($form);

    if(chkFlg == 'error') {
      alert('電話番号の形式が違います。')
    } else if(chkFlg == 'require') {
      alert('氏名を入力して下さい。')
    } else if(chkFlg == 'correct'){
      chkMdl($form);
    }
  });
});
