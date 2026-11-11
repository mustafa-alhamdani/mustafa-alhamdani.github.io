/* Mustafa host UI. Runtime scripts remain upstream source. */
(function () {
  'use strict';
  var launch = document.getElementById('launch'), toast = document.getElementById('toast');
  var msgs = document.getElementById('msgs'), detail = document.getElementById('detail');
  var hint = document.getElementById('hint'), info = MustafaRoute(navigator.userAgent);
  var cache = window.applicationCache, wanted = false, started = false, previousCross = false;
  var cacheReady = !!cache && (cache.status === 1 || cache.status === 4);
  var cacheFailed = false, pollTimer, hideTimer;
  function show(title, extra, pct) {
    clearTimeout(hideTimer); msgs.textContent = title; detail.textContent = extra || '';
    toast.className = 'toast show';
    document.getElementById('track').style.display = typeof pct === 'number' ? 'block' : 'none';
    document.getElementById('percent').textContent = typeof pct === 'number' ? pct + '%' : '';
    if (typeof pct === 'number') document.getElementById('fill').style.width = pct + '%';
  }
  function start() {
    if (!wanted || started || !cacheReady || !info.route) return;
    started = true; launch.disabled = true;
    clearInterval(pollTimer); hint.className = 'hint hide';
    show('جارٍ تشغيل GoldHEN…', 'إصدار الجهاز ' + info.fw + ' — انتظر نتيجة التشغيل.');
    var script = document.createElement('script');
    script.src = info.route.src;
    if (info.route.module) script.type = 'module';
    script.onerror = function () { show('تعذّر تحميل ملف التشغيل', 'أغلق المتصفح وافتحه مجدداً. إذا تكرر الخطأ أعد تثبيت الكاش بالإنترنت.'); };
    if (!info.route.module) script.onload = function () {
      setTimeout(function () {
        try { var p = window.doJb(); if (p && p.catch) p.catch(failed); } catch (e) { failed(); }
      }, 500);
    };
    document.head.appendChild(script);
  }
  function failed() { if (started) show('توقف التشغيل بسبب خطأ', 'أعد تشغيل الجهاز قبل المحاولة مرة أخرى.'); }
  function run() {
    if (started) return;
    if (!info.fw) { show('افتح الموقع من متصفح PS4', 'هذه واجهة الموقع؛ لا يُشغّل التعديل على الكمبيوتر أو الهاتف.'); return; }
    if (!info.route) { show('الإصدار غير مدعوم بهذه الحزمة', 'إصدار جهازك: ' + info.fw + ' — آخر إصدار ضمن الحزمة هو 14.00.'); return; }
    if (!cache) { show('كاش PS4 غير متاح بهذا المتصفح', 'لم يُحفظ الأوفلاين. افتح الرابط من متصفح PS4 الأصلي.'); return; }
    if (cacheFailed && !cacheReady) { show('لم يكتمل حفظ الأوفلاين', 'اتصل بالإنترنت وأعد فتح الصفحة حتى يكتمل الحفظ.'); return; }
    wanted = true;
    if (cacheReady) start();
    else show('جارٍ حفظ ملفات الأوفلاين…', 'يبدأ التشغيل بعد اكتمال حفظ الملفات. أبقِ الإنترنت متصلاً.');
  }
  if (cache && info.route) {
    cache.addEventListener('downloading', function () {
      cacheReady = false;
      show('جارٍ تحميل ملفات الأوفلاين…', 'الحفظ يبدأ تلقائياً عند أول زيارة. اضغط ✕ لبدء التشغيل بعد الحفظ.', 0);
    });
    cache.addEventListener('progress', function (e) {
      if (e.total) show('جارٍ حفظ ملفات الأوفلاين…', 'تقدم عدد الملفات المحفوظة', Math.round(e.loaded / e.total * 100));
    });
    function ready() {
      cacheReady = true; cacheFailed = false;
      show('اكتمل حفظ ملفات الأوفلاين', 'اضغط ✕ للتشغيل. نجاح الحفظ لا يعني أن GoldHEN اشتغل.', 100);
      if (wanted) start();
      else hideTimer = setTimeout(function () { toast.className = 'toast'; }, 3500);
    }
    cache.addEventListener('cached', ready);
    cache.addEventListener('noupdate', function () { cacheReady = cache.status === 1; if (cacheReady && wanted) start(); });
    cache.addEventListener('updateready', function () {
      /* Keep the active old cache intact. New JS must only run after a reload. */
      wanted = false; cacheReady = false;
      show('تم حفظ تحديث ملفات الموقع', 'أغلق المتصفح وافتحه مجدداً لتشغيل النسخة الجديدة.');
    });
    cache.addEventListener('error', function () {
      cacheReady = cache.status === 1; cacheFailed = !cacheReady;
      if (cacheReady) { if (wanted) start(); }
      else show('تعذّر إكمال حفظ الأوفلاين', 'تحقق من الإنترنت. لم يتم تشغيل التعديل.');
    });
    cache.addEventListener('obsolete', function () { cacheReady = false; cacheFailed = true; show('الكاش لم يعد متاحاً', 'أعد فتح الموقع مع الإنترنت.'); });
  }
  var observer = new MutationObserver(function () {
    if (!started) return;
    var text = msgs.textContent;
    if (/GoldHEN.*(?:Already Loaded|v[\d.\w]+ Loaded)/i.test(text)) {
      detail.textContent = 'أبلغ ملف التشغيل بالنجاح؛ تأكد من ظهور قائمة GoldHEN في إعدادات الجهاز.';
      hideTimer = setTimeout(function () { toast.className = 'toast'; }, 4500);
    } else if (/Failed|Error|Restart|Reopen/i.test(text)) {
      clearTimeout(hideTimer); toast.className = 'toast show';
      detail.textContent = 'لم يتأكد نجاح التشغيل. اتبع رسالة المحمّل وأعد تشغيل الجهاز عند الحاجة.';
    }
  });
  observer.observe(msgs, {childList:true,subtree:true,characterData:true});
  window.addEventListener('error', failed);
  window.addEventListener('unhandledrejection', failed);
  launch.addEventListener('click', run);
  document.getElementById('dismiss').addEventListener('click', function () { toast.className = 'toast'; if (!started) launch.focus(); });
  document.addEventListener('keydown', function (e) {
    var k = e.keyCode || e.which;
    if ((k === 13 || k === 32 || k === 88) && e.target.id !== 'dismiss') { e.preventDefault(); if (!e.repeat) run(); }
  });
  pollTimer = setInterval(function () {
    if (!navigator.getGamepads || started) return;
    var pads = navigator.getGamepads(), pressed = false;
    for (var i = 0; i < pads.length; i++) if (pads[i] && pads[i].mapping === 'standard' && pads[i].buttons[0] && pads[i].buttons[0].pressed) pressed = true;
    if (pressed && !previousCross) run(); previousCross = pressed;
  }, 100);
  window.addEventListener('pagehide', function () { clearInterval(pollTimer); clearTimeout(hideTimer); observer.disconnect(); });
  launch.focus();
})();
