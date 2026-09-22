/* ============================================================
   ai-gate.js —— AI 门禁逻辑（独立文件，只在首页运行）
   单击头像触发：
     第 1 次 → 请先证明你的资格
     第 2 次 → 这是你的最后一次机会，再过不了不予访问权限
     第 3 次 → 算了算了，让你过了，别来烦我
   规则：
     一直是答对进去的 → 退出来再点 → 重新走门禁
     曾经答错过        → 退出来再点 → 踢出
   ============================================================ */
(function () {
  'use strict';

  var silenceCard = document.getElementById('silenceMemberCard');
  if (!silenceCard) return;

  var aiGate = document.getElementById('aiGate');
  var aiGateText = document.getElementById('aiGateText');
  var aiGateDenied = document.getElementById('aiGateDenied');
  var aiGateChoices = document.getElementById('aiGateChoices');
  var aiKick = document.getElementById('aiKick');
  if (!aiGate || !aiKick) return;

  var KEY_DENY_COUNT  = 'aiGate_denyCount';    /* 被驳回次数 */
  var KEY_ENTERED     = 'aiGate_hasEntered';   /* 是否进去过 */
  var KEY_KICKED      = 'aiGate_kicked';       /* 是否被踢出（sessionStorage） */
  var KEY_EVER_FAILED = 'aiGate_everFailed';   /* 是否曾经答错过 */

  /* ---------- 页面加载时判断是否被踢 ---------- */
  if (sessionStorage.getItem(KEY_KICKED) === '1') {
    aiKick.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  /* ---------- 单击头像 ---------- */
  silenceCard.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    /* 已被踢：不响应 */
    if (sessionStorage.getItem(KEY_KICKED) === '1') return;

    /* 进去过、又退出来再点 */
    if (sessionStorage.getItem(KEY_ENTERED) === '1') {
      if (sessionStorage.getItem(KEY_EVER_FAILED) === '1') {
        /* 曾经答错过 → 踢出 */
        showKick();
        return;
      } else {
        /* 一直是答对进去的 → 重置状态，重新走门禁 */
        sessionStorage.removeItem(KEY_ENTERED);
      }
    }

    var denyCount = parseInt(sessionStorage.getItem(KEY_DENY_COUNT) || '0', 10);

    if (denyCount >= 2) {
      /* 被驳回 2 次了：不耐烦，直接放行 */
      impatientPass();
      return;
    }

    startGate();
  });

  /* ============================================================
     门禁主流程
     ============================================================ */
  var HTML_Q1 = '' +
    '<button class="ai-gate-choice" data-answer="yes">了解电脑</button>' +
    '<button class="ai-gate-choice" data-answer="no">不了解</button>';

  var HTML_Q2 = '' +
    '<button class="ai-gate-choice" data-answer="a">A. 不知道</button>' +
    '<button class="ai-gate-choice" data-answer="b">B. 负责用户操作的</button>' +
    '<div class="ai-gate-choice-c">' +
      '<span class="label">C. 填入你的答案：</span>' +
      '<input type="text" id="aiGateInput" placeholder="在这里输入…">' +
      '<button id="aiGateSubmit">提交</button>' +
    '</div>';

  function startGate() {
    aiGate.classList.add('show');
    aiGateText.innerHTML = '';
    aiGateDenied.classList.remove('show');
    aiGateChoices.classList.remove('show');
    aiGateChoices.innerHTML = '';

    /* 根据被驳回次数决定 AI 说什么 */
    var denyCount = parseInt(sessionStorage.getItem(KEY_DENY_COUNT) || '0', 10);
    var line = denyCount === 0
      ? '和沉默对话请先证明你的资格'
      : '这是你的最后一次机会，再过不了不予访问权限';

    typeText(line, aiGateText, 70, function () {
      setTimeout(function () {
        aiGateChoices.innerHTML = HTML_Q1;
        bindChoicesQ1();
        aiGateChoices.classList.add('show');
      }, 350);
    });
  }

  function bindChoicesQ1() {
    aiGateChoices.querySelectorAll('.ai-gate-choice').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var ans = this.getAttribute('data-answer');
        if (ans === 'no') { deny(); } else { goToSecondQuestion(); }
      });
    });
  }

  function goToSecondQuestion() {
    aiGateChoices.classList.remove('show');
    aiGateChoices.innerHTML = '';
    aiGateText.innerHTML = '';
    aiGateDenied.classList.remove('show');

    typeText('还有一关等着你呢，CPU 和 GPU 到底是干什么的？', aiGateText, 65, function () {
      setTimeout(function () {
        aiGateChoices.innerHTML = HTML_Q2;
        bindChoicesQ2();
        aiGateChoices.classList.add('show');
        var inp = document.getElementById('aiGateInput');
        if (inp) inp.focus();
      }, 350);
    });
  }

  function bindChoicesQ2() {
    aiGateChoices.querySelectorAll('.ai-gate-choice').forEach(function (btn) {
      btn.addEventListener('click', function () { deny(); });
    });
    var submitBtn = document.getElementById('aiGateSubmit');
    var inputEl = document.getElementById('aiGateInput');
    if (submitBtn) submitBtn.addEventListener('click', checkFillAnswer);
    if (inputEl) {
      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') checkFillAnswer();
      });
    }
  }

  function checkFillAnswer() {
    var inputEl = document.getElementById('aiGateInput');
    if (!inputEl) return;
    var val = (inputEl.value || '').trim();

    /* 空输入：不驳回，只提示一下 */
    if (!val) {
      inputEl.focus();
      inputEl.placeholder = '请先输入答案再提交…';
      return;
    }

    /* 输入包含关键词「计算」→ 放行 */
    if (val.indexOf('计算') !== -1) {
      pass();
      return;
    }

    /* 输入错误 → 显示红色「访问驳回！」，停顿后再回首页 */
    aiGateChoices.classList.remove('show');
    aiGateChoices.innerHTML = '';
    aiGateText.innerHTML = '';
    aiGateDenied.classList.add('show');

    /* 记录被驳回次数 */
    var c = parseInt(sessionStorage.getItem(KEY_DENY_COUNT) || '0', 10);
    sessionStorage.setItem(KEY_DENY_COUNT, String(c + 1));
    sessionStorage.setItem(KEY_EVER_FAILED, '1');

    /* 暂停 1.6 秒，让用户看清「访问驳回！」，然后回首页 */
    setTimeout(function () {
      aiGate.classList.remove('show');
      aiGateDenied.classList.remove('show');
      aiGateText.innerHTML = '';
      window.location.href = 'index.html#home';
    }, 1600);
  }

  function pass() {
    aiGateChoices.classList.remove('show');
    aiGateChoices.innerHTML = '';
    aiGateText.innerHTML = '';
    aiGateDenied.classList.remove('show');

    typeText('算你识相，进去吧', aiGateText, 70, function () {
      setTimeout(function () {
        sessionStorage.setItem(KEY_ENTERED, '1');
        window.location.href = 'member-silence.html';
      }, 1200);
    });
  }

  function deny() {
    aiGateChoices.classList.remove('show');
    aiGateChoices.innerHTML = '';
    aiGateText.innerHTML = '';
    aiGateDenied.classList.add('show');

    var c = parseInt(sessionStorage.getItem(KEY_DENY_COUNT) || '0', 10);
    sessionStorage.setItem(KEY_DENY_COUNT, String(c + 1));
    /* 记下"曾经答错过" */
    sessionStorage.setItem(KEY_EVER_FAILED, '1');

    setTimeout(function () {
      aiGate.classList.remove('show');
      aiGateDenied.classList.remove('show');
      aiGateText.innerHTML = '';
      window.location.href = 'index.html#home';
    }, 1600);
  }

  function impatientPass() {
    aiGate.classList.add('show');
    aiGateText.innerHTML = '';
    aiGateDenied.classList.remove('show');
    aiGateChoices.classList.remove('show');
    aiGateChoices.innerHTML = '';

    typeText('算了，让你过了，别来烦我', aiGateText, 70, function () {
      setTimeout(function () {
        sessionStorage.setItem(KEY_ENTERED, '1');
        window.location.href = 'member-silence.html';
      }, 1400);
    });
  }

  /* ---------- 进去过后再点：踢出 ---------- */
  function showKick() {
    /* 用 sessionStorage 记被踢：
       刷新保持，关闭标签页自动清空 */
    sessionStorage.setItem(KEY_KICKED, '1');

    aiGate.classList.add('show');
    aiGateText.innerHTML = '';
    aiGateDenied.classList.remove('show');
    aiGateChoices.classList.remove('show');
    aiGateChoices.innerHTML = '';

    typeText('别给脸不要脸，还敢来访问', aiGateText, 70, function () {
      setTimeout(function () {
        aiGate.classList.remove('show');
        aiKick.classList.add('show');
        document.body.style.overflow = 'hidden';
      }, 1200);
    });
  }

  /* ---------- 打字机 ---------- */
  function typeText(str, el, speed, done) {
    var i = 0;
    el.innerHTML = '<span class="typing"></span>';
    var span = el.querySelector('.typing');
    var timer = setInterval(function () {
      if (i < str.length) {
        span.textContent += str.charAt(i);
        i++;
      } else {
        clearInterval(timer);
        setTimeout(function () { span.classList.remove('typing'); }, 400);
        if (typeof done === 'function') done();
      }
    }, speed);
  }
})();