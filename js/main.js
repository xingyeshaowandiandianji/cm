/* ============================================================
   main.js —— 全站交互脚本（原 index.html 内联脚本，本地化）
   功能：导航滚动收缩 / 滚动高亮 / 页面切换 / 滚动浮现 /
         技能条动画 / 搜索 / 外链跳转
   ============================================================ */

(function () {
  'use strict';

  var navbar = document.getElementById('navbar');
  var sideNav = document.getElementById('sideNav');
  var homePage = document.getElementById('homePage');
  var driverPage = document.getElementById('driverPage');
  var articlePage = document.getElementById('articlePage');
  var friendsPage = document.getElementById('friendsPage');
  var membersPage = document.getElementById('membersPage');

  var sections = document.querySelectorAll('#homePage section[id]');
  var navLinks = document.querySelectorAll('.nav-links > a');
  var sideLinks = document.querySelectorAll('.side-nav a');
  var fadeEls = document.querySelectorAll('.fade-out');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var aboutSection = document.getElementById('about');

  /* 判断当前是否处于某个子页面（驱动/文章/好友/成员） */
  function isSubPageActive() {
    return driverPage.classList.contains('active') ||
      articlePage.classList.contains('active') ||
      friendsPage.classList.contains('active') ||
      membersPage.classList.contains('active');
  }

  /* ---------- 首页滚动渐变淡出 ---------- */
  function updateFade() {
    if (reduceMotion) return;
    var winH = window.innerHeight;
    fadeEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var elCenter = rect.top + rect.height / 2;
      var winCenter = winH / 2;
      var distance = Math.abs(elCenter - winCenter);
      var startFade = winH * 0.55;
      var maxFade = winH * 1.05;
      var progress = (distance - startFade) / (maxFade - startFade);
      progress = Math.min(Math.max(progress, 0), 1);
      var opacity = 1 - progress * 0.95;
      var translateY = progress * 22;
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = 'translateY(' + translateY.toFixed(2) + 'px)';
    });
  }

  /* ---------- 滚动事件：导航收缩 + 当前区块高亮 ---------- */
  function onScroll() {
    if (aboutSection && homePage.style.display !== 'none') {
      var trigger = aboutSection.offsetTop - 250;
      if (window.scrollY >= trigger) {
        navbar.classList.add('mini');
        sideNav.classList.add('show');
      } else {
        navbar.classList.remove('mini');
        sideNav.classList.remove('show');
      }
    }
    var pos = window.scrollY + 120;
    var current = 'home';
    sections.forEach(function (sec) {
      if (pos >= sec.offsetTop) current = sec.id;
    });
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      current = sections[sections.length - 1].id;
    }
    /* 子页面显示时：首页区块不可见，滚动监听无法正确判定，
       这里按当前子页面高亮对应的导航项 */
    if (driverPage.classList.contains('active')) current = 'driver';
    else if (articlePage.classList.contains('active')) current = 'projects';
    else if (friendsPage.classList.contains('active')) current = 'friends';
    else if (membersPage.classList.contains('active')) current = 'members';
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
    sideLinks.forEach(function (link) {
      var t = link.getAttribute('data-target');
      link.classList.toggle('active', t === current);
    });
    updateFade();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- 滚动浮现动画 ---------- */
  var reveals = document.querySelectorAll('#homePage .reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- 技能条填充动画 ---------- */
  var skillFills = document.querySelectorAll('.skill-fill');
  if ('IntersectionObserver' in window) {
    var skillObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var fill = entry.target;
          fill.style.width = fill.getAttribute('data-width');
          skillObserver.unobserve(fill);
        }
      });
    }, { threshold: 0.4 });
    skillFills.forEach(function (fill) { skillObserver.observe(fill); });
  } else {
    skillFills.forEach(function (fill) { fill.style.width = fill.getAttribute('data-width'); });
  }

  /* ---------- 页面切换 ---------- */
  function hideAllSubPages() {
    driverPage.classList.remove('active');
    articlePage.classList.remove('active');
    friendsPage.classList.remove('active');
    membersPage.classList.remove('active');
  }

  function showHome() {
    homePage.style.display = '';
    hideAllSubPages();
    navbar.classList.remove('mini');
    sideNav.classList.remove('show');
    window.scrollTo(0, 0);
  }
  function showDriver() {
    homePage.style.display = 'none';
    hideAllSubPages();
    driverPage.classList.add('active');
    navbar.classList.remove('mini');
    sideNav.classList.remove('show');
    window.scrollTo(0, 0);
  }
  function showArticle() {
    homePage.style.display = 'none';
    hideAllSubPages();
    articlePage.classList.add('active');
    navbar.classList.remove('mini');
    sideNav.classList.remove('show');
    window.scrollTo(0, 0);
  }
  function showFriends() {
    homePage.style.display = 'none';
    hideAllSubPages();
    friendsPage.classList.add('active');
    navbar.classList.remove('mini');
    sideNav.classList.remove('show');
    window.scrollTo(0, 0);
  }
  function showMembers() {
    homePage.style.display = 'none';
    hideAllSubPages();
    membersPage.classList.add('active');
    navbar.classList.remove('mini');
    sideNav.classList.remove('show');
    window.scrollTo(0, 0);
  }

  /* ============================================================
     修复：在子页面（驱动/文章/好友/成员）里点击顶部导航的
     首页/关于我/技能等锚点链接时，原来没有反应（首页被隐藏，
     锚点无法滚动）。现在改为：先切回首页，再平滑滚动到目标区块。
     ============================================================ */
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = this.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;           // 非锚点链接（如外链）不拦截
      if (!isSubPageActive()) return;               // 本来就在首页，走默认锚点滚动
      e.preventDefault();
      showHome();                                    // 先回到首页
      var target = document.getElementById(href.slice(1));
      if (target) {
        setTimeout(function () {
          var top = target.getBoundingClientRect().top + window.pageYOffset - 90;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }, 60);
      }
    });
  });

  /* ---------- 侧边导航 ---------- */
  sideLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var action = this.getAttribute('data-action');
      if (isSubPageActive()) {
        hideAllSubPages();
        homePage.style.display = '';
      }
      if (action === 'driver') { showDriver(); return; }
      if (action === 'friends') { showFriends(); return; }
      if (action === 'members') { showMembers(); return; }
      var id = this.getAttribute('data-target');
      var target = document.getElementById(id);
      if (target) {
        var top = target.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- 首页各入口按钮 ---------- */
  document.getElementById('openDriverPage').addEventListener('click', showDriver);
  document.getElementById('openArticlePage').addEventListener('click', showArticle);
  document.getElementById('openFriendsPage').addEventListener('click', showFriends);
  document.getElementById('openMembersPage').addEventListener('click', showMembers);
  document.getElementById('backHome').addEventListener('click', showHome);
  document.getElementById('backFromArticle').addEventListener('click', showHome);
  document.getElementById('backFromFriends').addEventListener('click', showHome);
  document.getElementById('backFromMembers').addEventListener('click', showHome);

  /* ---------- 外链跳转（data-url） ---------- */
  document.querySelectorAll('[data-url]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var url = this.getAttribute('data-url');
      if (url) window.open(url, '_blank');
    });
  });

  /* ---------- 站内搜索 ---------- */
  var searchIndex = [
    { source: '首页', target: 'home', text: '嗨嗨，这里是沉默科技频道！一起玩耍吧。' },
    { source: '关于我', target: 'about', text: '你好，我是沉默，一个热爱 PC 硬件、喜欢折腾虚拟机、也乐于把过程记录下来的普通人。' },
    { source: '技能', target: 'skills', text: 'PC 硬件 90%。视频剪辑 88%。VMware 病毒测试 82%。文案策划 80%。' },
    { source: '驱动下载中心', target: 'driver', text: 'CMP P104 P102 P106 驱动。整理矿卡驱动介绍、使用教程与下载指引，驱动均由雨糖科技发布。' },
    { source: '项目 · PC 硬件折腾', target: 'projects', text: 'E5 + CMP 40HX 垃圾佬配置实战，三角洲 100 帧，内存先爆。' },
    { source: '我的好朋友们', target: 'friends', text: '星野 白子 05 星野少玩点电击 月神 知夏' },
    { source: '工作室成员', target: 'members', text: '我 小白板 白子妹妹。我负责网站构建以及代码更改，小白板和白子妹妹负责网站界面与优化。' },
    { source: '找到我', target: 'contact', text: '快手 抖音 哔哩哔哩' },
    { source: '联系我', target: 'contact', text: '很高兴认识你，欢迎在这些地方找到我。邮箱 2775279394@qq.com' },
    { source: '格言', target: 'projects', text: '信息与你无限，未来属于计算。—— 沉默' },
    { source: 'PC 硬件折腾', target: 'article', text: '别问，问就是垃圾佬的胜利。E5+CMP 40HX，三角洲实战 100 帧，内存先爆了。' },
    { source: 'PC 硬件折腾', target: 'article', text: '先说结论：这套玩意儿能玩，但没点折腾精神别碰。' },
    { source: 'PC 硬件折腾', target: 'article', text: '我手里这套是 E5-2673 v3，配 CMP 40HX。主板是闲鱼捡的 X99 魔改板，显卡没显示输出，得补电容、刷雨糖驱动。' },
    { source: 'PC 硬件折腾', target: 'article', text: '重点看第三张图，显卡占用率 99%，显存占用 60%，显卡功耗 115W，热点温度 82 度。内存占用率直接干到 93%！16G DDR3 被吃满。' },
    { source: '驱动下载中心', target: 'driver', text: 'CMP 是英伟达专为加密货币挖矿设计的显卡系列，去掉了视频输出接口，专注于算力输出。' },
    { source: '驱动下载中心', target: 'driver', text: 'P106 基于 GP106 核心，P104 基于 GP104 核心，P102 基于 GP102 核心。' },
    { source: '驱动下载中心', target: 'driver', text: '本页整理的 CMP、P104、P102、P106 驱动均来自雨糖科技，版权归雨糖科技所有。' }
  ];

  function getSnippet(text, keyword) {
    var lower = text.toLowerCase();
    var kw = keyword.toLowerCase();
    var idx = lower.indexOf(kw);
    if (idx === -1) return null;
    var start = Math.max(0, idx - 20);
    var end = Math.min(text.length, idx + keyword.length + 30);
    var snippet = text.slice(start, end);
    if (start > 0) snippet = '…' + snippet;
    if (end < text.length) snippet = snippet + '…';
    var regex = new RegExp('(' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    snippet = snippet.replace(regex, '<mark>$1</mark>');
    return snippet;
  }

  function similarity(a, b) {
    a = a.toLowerCase(); b = b.toLowerCase();
    if (a === b) return 1;
    if (!a || !b) return 0;
    var setA = {};
    for (var i = 0; i < a.length; i++) setA[a[i]] = true;
    var setB = {};
    for (var j = 0; j < b.length; j++) setB[b[j]] = true;
    var common = 0, total = 0;
    for (var k in setA) { total++; if (setB[k]) common++; }
    for (var m in setB) { if (!(m in setA)) total++; }
    return total === 0 ? 0 : common / total;
  }

  function doSearch(keyword, panelEl) {
    panelEl.innerHTML = '';
    if (!keyword) { panelEl.classList.remove('show'); return; }
    var raw = [];
    searchIndex.forEach(function (item) {
      var snippet = getSnippet(item.text, keyword);
      if (snippet) raw.push({ source: item.source, target: item.target, snippet: snippet, rawText: item.text });
    });
    if (raw.length === 0) {
      panelEl.innerHTML = '<div class="search-empty">没有找到与「' + keyword + '」相关的内容</div>';
      panelEl.classList.add('show'); return;
    }
    var results = [];
    raw.forEach(function (r) {
      var skip = false;
      for (var i = 0; i < results.length; i++) {
        if (results[i].source === r.source) { skip = true; break; }
        if (similarity(results[i].rawText, r.rawText) > 0.9) { skip = true; break; }
      }
      if (!skip) results.push(r);
    });
    results.forEach(function (r) {
      var div = document.createElement('div');
      div.className = 'search-result';
      div.innerHTML = '<div class="search-result-source">' + r.source + '</div><div class="search-result-snippet">' + r.snippet + '</div>';
      div.addEventListener('click', function () {
        panelEl.classList.remove('show');
        if (r.target === 'article') { showArticle(); return; }
        if (r.target === 'driver') { showDriver(); return; }
        if (r.target === 'friends') { showFriends(); return; }
        if (r.target === 'members') { showMembers(); return; }
        if (isSubPageActive()) {
          hideAllSubPages();
          homePage.style.display = '';
        }
        var t = document.getElementById(r.target);
        if (t) {
          var top = t.getBoundingClientRect().top + window.pageYOffset - 90;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
      panelEl.appendChild(div);
    });
    panelEl.classList.add('show');
  }

  var searchInput = document.getElementById('searchInput');
  var searchBtn = document.getElementById('searchBtn');
  var searchPanel = document.getElementById('searchPanel');
  var searchInputMini = document.getElementById('searchInputMini');
  var searchBtnMini = document.getElementById('searchBtnMini');
  var searchPanelMini = document.getElementById('searchPanelMini');

  searchBtn.addEventListener('click', function () { doSearch(searchInput.value.trim(), searchPanel); });
  searchInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(searchInput.value.trim(), searchPanel); });
  searchBtnMini.addEventListener('click', function () { doSearch(searchInputMini.value.trim(), searchPanelMini); });
  searchInputMini.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(searchInputMini.value.trim(), searchPanelMini); });

  document.addEventListener('click', function (e) {
    if (!searchPanel.contains(e.target) && e.target !== searchInput && e.target !== searchBtn) searchPanel.classList.remove('show');
    if (!searchPanelMini.contains(e.target) && e.target !== searchInputMini && e.target !== searchBtnMini) searchPanelMini.classList.remove('show');
  });

  /* ---------- 初始 hash 路由 ----------
     从个人页（friend-*.html / member-*.html）点“返回好友/成员首页”
     会打开 index.html#friends 或 #members，这是一次全新加载，
     需要主动显示对应子页面，而不是停在主站首页。 */
  (function routeInitialHash() {
    var h = (location.hash || '').replace('#', '');
    if (h === 'friends') { showFriends(); }
    else if (h === 'members') { showMembers(); }
  })();
})();
