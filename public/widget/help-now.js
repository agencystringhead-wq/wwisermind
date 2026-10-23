/* wwisermind help now widget
   Adds a list of free US crisis and mental health helplines to any website.
   Docs and a snippet generator: https://wwisermind.com/free-tools/crisis-resources/help-now-widget/

   It makes one request, for the list of numbers, and nothing else: no cookies, no localStorage,
   no analytics, no third-party requests. If anything fails, the fallback text the site pasted
   inside the div stays exactly as it was. */
(function () {
  'use strict';

  var HOME = 'https://wwisermind.com';
  var DEFAULT_DATA = HOME + '/data/crisis-resources.json';
  var TOOL_URL = HOME + '/free-tools/crisis-resources/';
  var DEFAULT_COLOR = '#146ef5';
  var COMPACT_IDS = ['emergency-911', 'lifeline-988', 'crisis-text-line'];
  /* data-src is a testing hook. It is honoured only on these hosts; everywhere else the widget
     always reads the published file above, so a page cannot point it at other data. */
  var SRC_HOSTS = ['localhost', '127.0.0.1', 'wwisermind.com'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];

  if (window.wwiserHelpNow) {
    window.wwiserHelpNow.scan();
    return;
  }

  /* One fetch per address, shared by every widget on the page. */
  var requests = {};
  function load(url) {
    if (!requests[url]) {
      requests[url] = fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer' }).then(function (r) {
        if (!r.ok) throw new Error('status ' + r.status);
        return r.json();
      });
    }
    return requests[url];
  }

  function hexColor(value) {
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((value || '').trim());
    if (!m) return null;
    var h = m[1];
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    return '#' + h.toLowerCase();
  }

  /* White or near-black text, whichever reads better on the accent. */
  function inkFor(hex) {
    var c = [1, 3, 5].map(function (i) {
      var v = parseInt(hex.substr(i, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    var lum = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return lum > 0.4 ? '#111111' : '#ffffff';
  }

  /* A link is used only if it starts with the one scheme its field allows. Anything else is skipped. */
  function safeHref(value, scheme) {
    return typeof value === 'string' && value.indexOf(scheme) === 0 ? value : null;
  }

  function verifiedLabel(iso) {
    var m = /^(\d{4})-(\d{2})/.exec(iso || '');
    return m ? MONTHS[Number(m[2]) - 1] + ' ' + m[1] : '';
  }

  /* Every word from the data goes in through textContent, never innerHTML. */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = String(text);
    return node;
  }

  function button(label, href, aria, external) {
    var a = el('a', 'btn', label);
    a.href = href;
    a.setAttribute('aria-label', aria);
    if (external) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    return a;
  }

  function card(r) {
    var item = el('li', 'card');
    item.appendChild(el('p', 'name', r.name));
    item.appendChild(el('p', 'who', r.audience));
    if (r.hours) item.appendChild(el('p', 'hours', 'Hours: ' + r.hours));
    [r.tty, r.languages, r.notes].forEach(function (line) {
      if (line) item.appendChild(el('p', 'more', line));
    });
    var actions = el('div', 'actions');
    var call = safeHref(r.callHref, 'tel:');
    var text = safeHref(r.textHref, 'sms:');
    var chat = safeHref(r.chatUrl, 'https://');
    if (call && r.call) actions.appendChild(button('Call ' + r.call, call, 'Call ' + r.call + ': ' + r.name));
    if (text && r.text) actions.appendChild(button(r.text, text, r.text + ': ' + r.name));
    var chatLabel = r.chatLabel || 'Chat online';
    if (chat) actions.appendChild(button(chatLabel, chat, chatLabel + ': ' + r.name + ' (opens in a new tab)', true));
    if (actions.childNodes.length) item.appendChild(actions);
    return item;
  }

  var CSS =
    ':host{display:block;font-family:inherit;font-size:16px;line-height:1.5;color:#1a1a1a}' +
    '*{box-sizing:border-box}' +
    '.wrap{background:#fff;border:1px solid #d5d9df;border-radius:16px;padding:20px}' +
    '.title{margin:0 0 12px;font-size:1.25em;font-weight:600;line-height:1.25}' +
    '.alert{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin:0 0 16px;padding:14px 16px;border-radius:12px;background:#7a0f1e;color:#fff}' +
    '.alert p{margin:0;font-weight:600}' +
    '.alert .btn{background:#fff;color:#7a0f1e}' +
    '.list{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin:0;padding:0;list-style:none}' +
    '.card{display:flex;flex-direction:column;gap:4px;padding:16px;border:1px solid #d5d9df;border-radius:12px}' +
    '.card p{margin:0}' +
    '.name{font-weight:600}' +
    '.who,.hours{font-size:.9em;color:#4a4f57}' +
    '.more{font-size:.85em;color:#4a4f57}' +
    '.actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:10px}' +
    '.btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:8px 16px;border-radius:999px;background:var(--accent);color:var(--ink);font-size:.95em;font-weight:600;line-height:1.25;text-align:center;text-decoration:none}' +
    '.btn:hover{filter:brightness(.92)}' +
    '.btn:focus-visible{outline:3px solid #111;outline-offset:2px}' +
    '.alert .btn:focus-visible{outline-color:#fff}' +
    '.foot{margin:14px 0 0;font-size:.8em;color:#5a5f67}' +
    '.foot a{color:inherit;text-decoration:underline}';

  function render(host, data) {
    var state = (host.getAttribute('data-state') || '').toUpperCase();
    var compact = host.getAttribute('data-compact') === 'true';
    var heading = host.getAttribute('data-heading') || 'Need help now?';
    var accent = hexColor(host.getAttribute('data-color')) || DEFAULT_COLOR;

    if (!data || !Array.isArray(data.national)) throw new Error('bad data');
    var checked = function (list) {
      return (Array.isArray(list) ? list : []).filter(function (r) { return r && r.needsCheck !== true; });
    };
    var stateList = /^[A-Z]{2}$/.test(state) && data.states ? checked(data.states[state]) : [];
    /* A state's entries are statewide (no area), county entries (an area, which starts with the county's
       name) and at most one lookup page. data-state alone shows the statewide ones and the lookup link;
       adding data-county shows the statewide ones and the entries whose area starts with that county,
       and the lookup link only if none matched. A county is never listed unless it was asked for. */
    var county = (host.getAttribute('data-county') || '').trim().toLowerCase();
    var statewide = stateList.filter(function (r) { return !r.area && r.category !== 'lookup'; });
    var lookup = stateList.filter(function (r) { return !r.area && r.category === 'lookup'; });
    var local = county ? stateList.filter(function (r) {
      return typeof r.area === 'string' && r.area.toLowerCase().indexOf(county) === 0;
    }) : [];
    var own = statewide.concat(local);
    if (!local.length) own = own.concat(lookup);
    var national = checked(data.national);
    if (compact) national = national.filter(function (r) { return COMPACT_IDS.indexOf(r.id) !== -1; });
    var emergency = national.filter(function (r) { return r.id === 'emergency-911'; })[0];
    var rest = own.concat(national.filter(function (r) { return r.id !== 'emergency-911'; }));
    if (!rest.length) throw new Error('nothing to show');

    var wrap = el('div', 'wrap');
    wrap.style.setProperty('--accent', accent);
    wrap.style.setProperty('--ink', inkFor(accent));

    var title = el('p', 'title', heading);
    title.setAttribute('role', 'heading');
    title.setAttribute('aria-level', '2');
    wrap.appendChild(title);

    var alert = el('div', 'alert');
    alert.appendChild(el('p', '', 'If you are in immediate danger, call 911 or go to the nearest emergency room.'));
    var emergencyCall = emergency && safeHref(emergency.callHref, 'tel:');
    if (emergencyCall) alert.appendChild(button('Call 911', emergencyCall, 'Call 911: Emergency services'));
    wrap.appendChild(alert);

    var list = el('ul', 'list');
    rest.forEach(function (r) { list.appendChild(card(r)); });
    wrap.appendChild(list);

    var foot = el('p', 'foot');
    var when = verifiedLabel(data.updated);
    foot.appendChild(document.createTextNode((when ? 'Last verified ' + when + ' · ' : '') + 'Resources maintained by '));
    var link = el('a', '', 'wwisermind');
    link.href = TOOL_URL;
    link.target = '_blank';
    link.rel = 'noopener';
    foot.appendChild(link);
    wrap.appendChild(foot);

    /* Everything is built before the host is touched, so a failure above leaves the fallback. */
    var root = host.attachShadow({ mode: 'open' });
    var style = document.createElement('style');
    style.textContent = CSS;
    root.appendChild(style);
    root.appendChild(wrap);
  }

  function init(host) {
    if (!host || host.getAttribute('data-wwiser-ready') || host.shadowRoot) return;
    host.setAttribute('data-wwiser-ready', '1');
    var src = host.getAttribute('data-src');
    var url = src && /^https?:\/\/|^\//.test(src) && SRC_HOSTS.indexOf(location.hostname) !== -1 ? src : DEFAULT_DATA;
    load(url).then(function (data) {
      render(host, data);
    }).catch(function () {
      /* Any failure: leave the fallback exactly as the site wrote it. */
    });
  }

  function scan() {
    var hosts = document.querySelectorAll('.wwiser-help-now');
    for (var i = 0; i < hosts.length; i++) init(hosts[i]);
  }

  window.wwiserHelpNow = { init: init, scan: scan };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan);
  else scan();
})();
