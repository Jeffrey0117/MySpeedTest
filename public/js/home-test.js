/**
 * 首頁測速：進頁面就在背景先測完，按 GO 直接亮結果。
 *
 * - 頁面載完（而且分頁看得到）就自動開測，畫面不動
 * - 按 GO：結果已經好了 → 數字滾上去、跳出確認視窗；還在測 → 接著顯示當下進度
 * - 結果放超過 FRESH_MS 或已經看過 → 按 GO 是現場重測
 * - 重測之後視窗改報「測了幾次、平均、誤差」，誤差在 STEADY_PERCENT 內就吐槽
 * - 視窗裡的「存成圖片」交給 result-card.js
 * - state 只用 set() 換成新物件；每次測速有自己的 id，舊的回呼改不到新的那次
 */
(function () {
  var FRESH_MS = 60000;
  var FIRST_MS = 1500;
  var VERIFY_MS = 2000;
  var WOBBLE_LIMIT = 0.15;
  var ROLL_MS = 300;
  var STEADY_PERCENT = 10;
  var MORE_FROM_TEST = 3;   // 連測到第幾次開始推其他作品

  // 重測之後的吐槽，照測的次數輪。誤差小用這組：
  var STEADY_LINES = [
    '就跟你說了很準。',
    '還測？答案不會變。',
    '測幾次都一樣啦。',
    '你是不是很閒？',
    '再測也不會變快。',
    '夠了，它就是這個速度。',
  ];
  // 誤差大用這組：
  var DRIFT_LINES = [
    '是你的網路在飄。',
    '不是我不準，是它不穩。',
    '你的網路自己都不確定。',
    '每次都不一樣，去問你的電信。',
  ];

  var btn = document.getElementById('goBtn');
  var speedEl = document.getElementById('speed');
  var unitEl = document.getElementById('unit');
  var statusEl = document.getElementById('status');
  var sureEl = document.getElementById('sure');
  if (!btn || !speedEl || !unitEl || !statusEl || typeof MST === 'undefined') return;

  var IDLE = {
    id: 0, visible: false, done: false, shown: false, stopped: false,
    verifying: false, mst: null, live: null, result: null, failed: null, finishedAt: 0,
  };
  var state = IDLE;
  var history = [];     // 這次開頁面以來，每次完整測完的速度（bps）
  var lastCard = null;  // 確認視窗目前顯示的內容，存圖用

  function set(id, changes) {
    if (state.id !== id) return;
    state = Object.assign({}, state, changes);
  }

  // ── 量測 ──

  function wobble(samples) {
    var recent = samples.slice(-10);
    if (recent.length === 0) return 0;
    var avg = recent.reduce(function (a, b) { return a + b; }, 0) / recent.length;
    if (!avg) return 0;
    var variance = recent.reduce(function (sum, v) { return sum + Math.pow(v - avg, 2); }, 0) / recent.length;
    return Math.sqrt(variance) / avg;
  }

  function runPhase(id, duration) {
    var samples = [];
    var mst = new MST({ duration: duration, maxConnections: 4, updateInterval: 50 });
    set(id, { mst: mst });
    mst.on('progress', function (data) {
      samples.push(data.speed.raw);
      set(id, { live: data.speed });
      paint(id);
    });
    return mst.run().then(function (result) {
      return { result: result, samples: samples };
    });
  }

  async function measure(id) {
    try {
      var first = await runPhase(id, FIRST_MS);
      var final = first.result;
      var keepGoing = state.id === id && !state.stopped;
      if (keepGoing && wobble(first.samples) > WOBBLE_LIMIT) {
        set(id, { verifying: true });
        paint(id);
        var second = await runPhase(id, VERIFY_MS);
        final = {
          speed: MST.formatSpeed((first.result.speed.raw + second.result.speed.raw) / 2),
          bytes: first.result.bytes + second.result.bytes,
          duration: first.result.duration + second.result.duration,
          verified: true,
        };
      }
      set(id, { done: true, mst: null, verifying: false, result: final, finishedAt: Date.now() });
    } catch (e) {
      set(id, { done: true, mst: null, verifying: false, failed: (e && e.message) || '測速失敗，再按一次 GO' });
    }
    if (state.id === id && state.visible) reveal(false);
  }

  function start(visible) {
    state = Object.assign({}, IDLE, { id: state.id + 1, visible: visible });
    if (visible) showRunning();
    measure(state.id);
  }

  // ── 畫面 ──

  function showRunning() {
    btn.classList.add('running');
    var label = btn.querySelector('.label');
    if (label) label.textContent = 'STOP';
    speedEl.classList.add('active');
    speedEl.textContent = '0';
    statusEl.textContent = '連接中...';
  }

  function resetButton() {
    btn.classList.remove('running', 'verifying');
    var label = btn.querySelector('.label');
    if (label) label.textContent = 'GO';
    speedEl.classList.remove('active');
  }

  function paint(id) {
    if (state.id !== id || !state.visible || state.done) return;
    if (state.live) {
      speedEl.textContent = state.live.value;
      unitEl.textContent = state.live.unit;
    }
    if (state.verifying) {
      btn.classList.remove('running');
      btn.classList.add('verifying');
      statusEl.innerHTML = '<span class="verifying">驗證中...</span>';
    } else if (state.live) {
      statusEl.textContent = '';
    }
  }

  function rollTo(value, onDone) {
    var decimals = Number.isInteger(value) ? 0 : 1;
    var startedAt = performance.now();
    function frame(now) {
      var t = Math.min((now - startedAt) / ROLL_MS, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      speedEl.textContent = (value * eased).toFixed(decimals);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        speedEl.textContent = value;
        onDone();
      }
    }
    requestAnimationFrame(frame);
  }

  function reveal(roll) {
    var shown = state;
    resetButton();
    if (shown.failed) {
      statusEl.textContent = shown.failed;
      return;
    }
    set(shown.id, { shown: true });

    var result = shown.result;
    var megabytes = (result.bytes / 1024 / 1024).toFixed(1) + ' MB';
    unitEl.textContent = result.speed.unit;
    statusEl.textContent = (result.verified ? '已驗證 · ' : '') + megabytes;

    if (!shown.stopped) history = history.concat(result.speed.raw);

    function finish() {
      speedEl.textContent = result.speed.value;
      if (!shown.stopped) openSure(result, megabytes);
    }
    if (roll) rollTo(result.speed.value, finish);
    else finish();

    if (!shown.stopped) report(result);
  }

  // ── 確認視窗 ──

  // 第一次：叫他別懷疑。重測之後：報次數、平均、誤差，誤差小就吐槽。
  function verdict(megabytes) {
    if (history.length < 2) {
      return {
        title: '100% 正確，別懷疑。',
        detail: '實際下載 ' + megabytes + ' 量出來的。不信就再按一次 GO。',
      };
    }
    var avg = history.reduce(function (a, b) { return a + b; }, 0) / history.length;
    var gap = Math.max.apply(null, history) - Math.min.apply(null, history);
    var spread = avg ? Math.round((gap / avg) * 100) : 0;
    var avgSpeed = MST.formatSpeed(avg);
    var head = '你已經測了 ' + history.length + ' 次，平均 ' + avgSpeed.value + ' ' + avgSpeed.unit + '，';
    var turn = history.length - 2;
    if (spread <= STEADY_PERCENT) {
      return { title: STEADY_LINES[turn % STEADY_LINES.length], detail: head + '誤差只有 ' + spread + '%。' };
    }
    return { title: DRIFT_LINES[turn % DRIFT_LINES.length], detail: head + '誤差 ' + spread + '%。' };
  }

  function openSure(result, megabytes) {
    if (!sureEl) return;
    var words = verdict(megabytes);
    lastCard = {
      value: result.speed.value,
      unit: result.speed.unit,
      title: words.title,
      detail: words.detail,
      host: location.host,
    };
    sureEl.querySelector('[data-sure-speed]').textContent = result.speed.value;
    sureEl.querySelector('[data-sure-unit]').textContent = result.speed.unit;
    sureEl.querySelector('[data-sure-title]').textContent = words.title;
    sureEl.querySelector('[data-sure-detail]').textContent = words.detail;
    var moreEl = sureEl.querySelector('[data-sure-more]');
    if (moreEl) moreEl.hidden = history.length < MORE_FROM_TEST;
    sureEl.hidden = false;
    var ok = sureEl.querySelector('[data-sure-ok]');
    if (ok) ok.focus();
  }

  function closeSure() {
    if (!sureEl || sureEl.hidden) return;
    sureEl.hidden = true;
    btn.focus();
  }

  if (sureEl) {
    sureEl.addEventListener('click', function (e) {
      if (e.target.closest('[data-sure-save]')) {
        if (lastCard && window.MSTResultCard) window.MSTResultCard.save(lastCard);
        return;
      }
      if (e.target === sureEl || e.target.closest('[data-sure-ok]')) closeSure();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSure();
    });
  }

  // ── 回報 ──

  function report(result) {
    fetch('/api/mst/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed: result.speed, bytes: result.bytes, duration: result.duration }),
    }).catch(function () {});
  }

  // ── GO ──

  function onGo() {
    if (state.visible && !state.done) {
      set(state.id, { stopped: true });
      if (state.mst) state.mst.stop();
      return;
    }
    var ready = state.done && !state.failed && !state.shown && Date.now() - state.finishedAt < FRESH_MS;
    if (ready) {
      set(state.id, { visible: true });
      reveal(true);
      return;
    }
    if (state.id !== 0 && !state.done) {
      set(state.id, { visible: true });
      showRunning();
      paint(state.id);
      return;
    }
    start(true);
  }

  btn.addEventListener('click', onGo);

  // ── 進頁面就先測 ──

  function headStart() {
    if (state.id === 0) start(false);
  }

  function whenVisible() {
    if (!document.hidden) {
      headStart();
      return;
    }
    document.addEventListener('visibilitychange', function onShow() {
      if (document.hidden) return;
      document.removeEventListener('visibilitychange', onShow);
      headStart();
    });
  }

  if (document.readyState === 'complete') whenVisible();
  else window.addEventListener('load', whenVisible);
})();
