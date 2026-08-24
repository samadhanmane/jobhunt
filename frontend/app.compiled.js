"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useRef = _React.useRef,
  useMemo = _React.useMemo;

// Fetch VITE_BACKEND_URL strictly from .env (injected from Vercel / local .env via window.__APP_CONFIG__)
var getApiBaseUrl = function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.__APP_CONFIG__ && window.__APP_CONFIG__.VITE_BACKEND_URL) {
    return window.__APP_CONFIG__.VITE_BACKEND_URL.trim().replace(/\/+$/, '');
  }
  return '';
};
var API_BASE_URL = getApiBaseUrl();

// ==========================================
// Helper Functions
// ==========================================
function isWithinDays(dateStr, days) {
  if (!dateStr || days === 0) return true;
  try {
    var jobDate;
    if (!isNaN(dateStr) && String(dateStr).length >= 10) {
      var num = Number(dateStr);
      jobDate = new Date(num > 1e11 ? num : num * 1000);
    } else {
      jobDate = new Date(dateStr);
    }
    if (isNaN(jobDate.getTime())) return true;
    var diffMs = new Date().getTime() - jobDate.getTime();
    return diffMs / (1000 * 60 * 60 * 24) <= days;
  } catch (_unused) {
    return true;
  }
}
function cleanHtmlJobDescription(rawHtml) {
  if (!rawHtml) return "No full description available.";
  if (typeof rawHtml !== 'string') return String(rawHtml);

  // If no HTML tags present, return clean plain text
  if (!rawHtml.includes("<") && !rawHtml.includes(">")) {
    return rawHtml.trim();
  }
  try {
    var text = rawHtml;
    // Strip dangerous / irrelevant tags
    text = text.replace(/<(script|style|svg|iframe|head|meta|noscript)[^>]*>.*?<\/\1>/gi, '');
    // Preserve line breaks for block elements
    text = text.replace(/<br\s*[\/]?>/gi, '\n');
    text = text.replace(/<li[^>]*>/gi, '\n• ');
    text = text.replace(/<\/li>/gi, '');
    text = text.replace(/<(h[1-6])[^>]*>/gi, '\n\n');
    text = text.replace(/<\/(h[1-6])>/gi, '\n');
    text = text.replace(/<\/(p|div|ul|ol|table|tr|section|article)>/gi, '\n\n');
    text = text.replace(/<(p|div|ul|ol|table|tr|section|article)[^>]*>/gi, '\n');

    // Strip remaining HTML tags
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    var cleaned = tempDiv.textContent || tempDiv.innerText || '';

    // Clean multiple blank lines
    var lines = cleaned.split('\n').map(function (l) {
      return l.replace(/[ \t]+/g, ' ').trim();
    });
    var result = [];
    var prevBlank = false;
    var _iterator = _createForOfIteratorHelper(lines),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var line = _step.value;
        if (!line) {
          if (!prevBlank) {
            result.push('');
            prevBlank = true;
          }
        } else {
          result.push(line);
          prevBlank = false;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return result.join('\n').trim();
  } catch (_unused2) {
    return rawHtml.replace(/<[^>]*>/g, ' ').trim();
  }
}

// ==========================================
// Main App Component
// ==========================================
function App() {
  var _useState = useState(function () {
      return localStorage.getItem("jobagent_auth_token") || "";
    }),
    _useState2 = _slicedToArray(_useState, 2),
    token = _useState2[0],
    setToken = _useState2[1];
  var _useState3 = useState(function () {
      try {
        return JSON.parse(localStorage.getItem("jobagent_user") || "null");
      } catch (_unused3) {
        return null;
      }
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    currentUser = _useState4[0],
    setCurrentUser = _useState4[1];
  var _useState5 = useState('search'),
    _useState6 = _slicedToArray(_useState5, 2),
    activeTab = _useState6[0],
    setActiveTab = _useState6[1];

  // LinkedIn Cookie State
  var _useState7 = useState(false),
    _useState8 = _slicedToArray(_useState7, 2),
    cookieModalOpen = _useState8[0],
    setCookieModalOpen = _useState8[1];
  var _useState9 = useState({
      has_cookie: false,
      cookie_status: 'unconfigured',
      valid: false,
      message: ''
    }),
    _useState10 = _slicedToArray(_useState9, 2),
    cookieStatusInfo = _useState10[0],
    setCookieStatusInfo = _useState10[1];
  var _useState11 = useState(null),
    _useState12 = _slicedToArray(_useState11, 2),
    toast = _useState12[0],
    setToast = _useState12[1];
  var showToast = function showToast(message) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
    setToast({
      message: message,
      type: type
    });
    setTimeout(function () {
      return setToast(null);
    }, 4000);
  };

  // Check cookie status on login / session load
  var refreshCookieStatus = function refreshCookieStatus() {
    if (!token) return;
    fetch("".concat(API_BASE_URL, "/api/v1/auth/linkedin-cookie-status"), {
      headers: {
        'Authorization': "Bearer ".concat(token)
      }
    }).then(function (res) {
      return res.json();
    }).then(function (data) {
      if (data) {
        setCookieStatusInfo(data);
        // If cookie expired, trigger modal popup automatically
        if (data.cookie_status === 'expired') {
          showToast("⚠️ Your LinkedIn cookie has expired. Please update it.", "error");
        }
      }
    })["catch"](function () {});
  };
  useEffect(function () {
    if (token) {
      fetch("".concat(API_BASE_URL, "/api/v1/auth/me"), {
        headers: {
          'Authorization': "Bearer ".concat(token)
        }
      }).then(function (res) {
        if (!res.ok) throw new Error("Invalid session");
        return res.json();
      }).then(function (data) {
        setCurrentUser(data.user);
        localStorage.setItem("jobagent_user", JSON.stringify(data.user));
        refreshCookieStatus();
      })["catch"](function () {
        handleLogout();
      });
    }
  }, [token]);
  var handleLoginSuccess = function handleLoginSuccess(newToken, user) {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem("jobagent_auth_token", newToken);
    localStorage.setItem("jobagent_user", JSON.stringify(user));
    showToast("Welcome back, ".concat(user.email, "!"));
    setTimeout(refreshCookieStatus, 500);
  };
  var handleLogout = function handleLogout() {
    setToken("");
    setCurrentUser(null);
    localStorage.removeItem("jobagent_auth_token");
    localStorage.removeItem("jobagent_user");
    setActiveTab('search');
  };
  if (!token || !currentUser) {
    return /*#__PURE__*/React.createElement("div", {
      className: "min-h-screen flex flex-col items-center justify-center p-4"
    }, /*#__PURE__*/React.createElement(LoginScreen, {
      onLoginSuccess: handleLoginSuccess
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex flex-col min-h-screen"
  }, /*#__PURE__*/React.createElement(Navbar, {
    user: currentUser,
    activeTab: activeTab,
    setActiveTab: setActiveTab,
    cookieStatusInfo: cookieStatusInfo,
    onOpenCookieModal: function onOpenCookieModal() {
      return setCookieModalOpen(true);
    },
    onLogout: handleLogout
  }), cookieStatusInfo.cookie_status === 'expired' && /*#__PURE__*/React.createElement("div", {
    className: "bg-rose-950/80 border-b border-rose-500/30 px-4 py-2 text-center text-xs text-rose-200 flex items-center justify-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Action Required:"), " Your LinkedIn session cookie has expired."), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setCookieModalOpen(true);
    },
    className: "px-2 py-0.5 rounded bg-rose-900/60 hover:bg-rose-900 text-white font-semibold underline"
  }, "Update Cookie Now \u2192")), toast && /*#__PURE__*/React.createElement("div", {
    className: "fixed bottom-6 right-6 z-50 animate-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2.5 border text-xs font-medium ".concat(toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/30 text-rose-200' : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200')
  }, /*#__PURE__*/React.createElement("span", null, toast.type === 'error' ? '✕' : '✓'), /*#__PURE__*/React.createElement("span", null, toast.message))), /*#__PURE__*/React.createElement("main", {
    className: "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
  }, activeTab === 'search' && /*#__PURE__*/React.createElement(JobSearchDashboard, {
    token: token,
    user: currentUser,
    cookieStatusInfo: cookieStatusInfo,
    onOpenCookieModal: function onOpenCookieModal() {
      return setCookieModalOpen(true);
    },
    showToast: showToast
  }), activeTab === 'alerts' && /*#__PURE__*/React.createElement(EmailAlertsView, {
    token: token,
    user: currentUser,
    cookieStatusInfo: cookieStatusInfo,
    onOpenCookieModal: function onOpenCookieModal() {
      return setCookieModalOpen(true);
    },
    showToast: showToast
  }), activeTab === 'admin' && currentUser.role === 'admin' && /*#__PURE__*/React.createElement(AdminPortal, {
    token: token,
    user: currentUser,
    showToast: showToast
  })), cookieModalOpen && /*#__PURE__*/React.createElement(LinkedInCookieModal, {
    token: token,
    cookieStatusInfo: cookieStatusInfo,
    onClose: function onClose() {
      return setCookieModalOpen(false);
    },
    onStatusUpdated: function onStatusUpdated(newStatus) {
      setCookieStatusInfo(newStatus);
    },
    showToast: showToast
  }), /*#__PURE__*/React.createElement("footer", {
    className: "border-t border-white/[0.06] py-5 text-center text-xs text-slate-500"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("p", null, "\xA9 2026 JobAgent AI. Multi-Platform Intelligence, ATS Scrapers & Verified Contact Discovery."), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 text-slate-400"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-emerald-400"
  }), /*#__PURE__*/React.createElement("span", null, "Multi-Source Parallel Scraping Engine Active")))));
}

// ==========================================
// Component: Minimal Navigation Bar
// ==========================================
function Navbar(_ref) {
  var user = _ref.user,
    activeTab = _ref.activeTab,
    setActiveTab = _ref.setActiveTab,
    cookieStatusInfo = _ref.cookieStatusInfo,
    onOpenCookieModal = _ref.onOpenCookieModal,
    onLogout = _ref.onLogout;
  var cookieBadge = {
    label: "Add LinkedIn Cookie",
    color: "bg-slate-800 text-slate-400 border-white/10 hover:border-slate-500",
    dot: "bg-slate-500"
  };
  if ((cookieStatusInfo === null || cookieStatusInfo === void 0 ? void 0 : cookieStatusInfo.cookie_status) === 'active') {
    cookieBadge = {
      label: "LinkedIn: Active",
      color: "bg-emerald-950/60 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50",
      dot: "bg-emerald-400"
    };
  } else if ((cookieStatusInfo === null || cookieStatusInfo === void 0 ? void 0 : cookieStatusInfo.cookie_status) === 'expired') {
    cookieBadge = {
      label: "LinkedIn: Expired ⚠️",
      color: "bg-rose-950/80 text-rose-300 border-rose-500/40 hover:border-rose-500 animate-pulse",
      dot: "bg-rose-500"
    };
  }
  return /*#__PURE__*/React.createElement("header", {
    className: "sticky top-0 z-40 minimal-nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 cursor-pointer",
    onClick: function onClick() {
      return setActiveTab('search');
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-indigo-400"
  }, "\u26A1"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-base text-slate-100 tracking-tight leading-none"
  }, "JobAgent ", /*#__PURE__*/React.createElement("span", {
    className: "text-indigo-400 font-semibold"
  }, "AI")), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400 font-medium tracking-wide"
  }, "Multi-Source ATS & Talent Discovery"))), /*#__PURE__*/React.createElement("nav", {
    className: "flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-white/[0.08]"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab('search');
    },
    className: "px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ".concat(activeTab === 'search' ? 'bg-indigo-600/90 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("span", null, "Job Search")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab('alerts');
    },
    className: "px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ".concat(activeTab === 'alerts' ? 'bg-indigo-600/90 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]')
  }, /*#__PURE__*/React.createElement("span", null, "\u23F0"), /*#__PURE__*/React.createElement("span", null, "Email Alerts")), user.role === 'admin' && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab('admin');
    },
    className: "px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ".concat(activeTab === 'admin' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDEE1\uFE0F"), /*#__PURE__*/React.createElement("span", null, "Admin Portal"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 sm:gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onOpenCookieModal,
    title: "Configure your LinkedIn session cookie for authenticated recruiter scraping",
    className: "px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ".concat(cookieBadge.color)
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full ".concat(cookieBadge.dot)
  }), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, cookieBadge.label), /*#__PURE__*/React.createElement("span", {
    className: "sm:hidden"
  }, "LinkedIn")), /*#__PURE__*/React.createElement("div", {
    className: "hidden md:flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-300 font-medium"
  }, user.email), /*#__PURE__*/React.createElement("span", {
    className: "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ".concat(user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300 border border-white/10')
  }, user.role)), /*#__PURE__*/React.createElement("button", {
    onClick: onLogout,
    title: "Sign Out",
    className: "px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 text-xs font-medium transition-all"
  }, "Logout"))));
}

// ==========================================
// Component: LinkedIn Cookie Modal
// ==========================================
function LinkedInCookieModal(_ref2) {
  var token = _ref2.token,
    cookieStatusInfo = _ref2.cookieStatusInfo,
    onClose = _ref2.onClose,
    onStatusUpdated = _ref2.onStatusUpdated,
    showToast = _ref2.showToast;
  var _useState13 = useState(""),
    _useState14 = _slicedToArray(_useState13, 2),
    cookieInput = _useState14[0],
    setCookieInput = _useState14[1];
  var _useState15 = useState(false),
    _useState16 = _slicedToArray(_useState15, 2),
    saving = _useState16[0],
    setSaving = _useState16[1];
  var _useState17 = useState(false),
    _useState18 = _slicedToArray(_useState17, 2),
    testing = _useState18[0],
    setTesting = _useState18[1];
  var _useState19 = useState((cookieStatusInfo === null || cookieStatusInfo === void 0 ? void 0 : cookieStatusInfo.message) || ""),
    _useState20 = _slicedToArray(_useState19, 2),
    statusMsg = _useState20[0],
    setStatusMsg = _useState20[1];
  var _useState21 = useState((cookieStatusInfo === null || cookieStatusInfo === void 0 ? void 0 : cookieStatusInfo.cookie_status) || "unconfigured"),
    _useState22 = _slicedToArray(_useState21, 2),
    currentStatus = _useState22[0],
    setCurrentStatus = _useState22[1];
  var handleSaveCookie = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(e) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            e.preventDefault();
            if (cookieInput.trim()) {
              _context.next = 3;
              break;
            }
            return _context.abrupt("return");
          case 3:
            setSaving(true);
            setStatusMsg("");
            _context.prev = 5;
            _context.next = 8;
            return fetch("".concat(API_BASE_URL, "/api/v1/auth/linkedin-cookie"), {
              method: "POST",
              headers: {
                'Authorization': "Bearer ".concat(token),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                linkedin_cookie: cookieInput.trim()
              })
            });
          case 8:
            res = _context.sent;
            _context.next = 11;
            return res.json();
          case 11:
            data = _context.sent;
            if (res.ok) {
              setCurrentStatus(data.cookie_status);
              setStatusMsg(data.message);
              onStatusUpdated({
                has_cookie: true,
                cookie_status: data.cookie_status,
                valid: data.valid,
                message: data.message
              });
              if (data.valid) {
                showToast("LinkedIn cookie saved and verified active!");
                setTimeout(onClose, 1200);
              } else {
                showToast(data.message || "Cookie validation failed", "error");
              }
            } else {
              showToast(data.detail || "Failed to save cookie", "error");
              setStatusMsg(data.detail || "Failed to save cookie");
            }
            _context.next = 19;
            break;
          case 15:
            _context.prev = 15;
            _context.t0 = _context["catch"](5);
            showToast(_context.t0.message, "error");
            setStatusMsg(_context.t0.message);
          case 19:
            _context.prev = 19;
            setSaving(false);
            return _context.finish(19);
          case 22:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[5, 15, 19, 22]]);
    }));
    return function handleSaveCookie(_x) {
      return _ref3.apply(this, arguments);
    };
  }();
  var handleCheckLive = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            setTesting(true);
            setStatusMsg("");
            _context2.prev = 2;
            _context2.next = 5;
            return fetch("".concat(API_BASE_URL, "/api/v1/auth/linkedin-cookie-status"), {
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 5:
            res = _context2.sent;
            _context2.next = 8;
            return res.json();
          case 8:
            data = _context2.sent;
            if (res.ok) {
              setCurrentStatus(data.cookie_status);
              setStatusMsg(data.message);
              onStatusUpdated(data);
              showToast(data.valid ? "Cookie is active!" : data.message, data.valid ? "success" : "error");
            }
            _context2.next = 15;
            break;
          case 12:
            _context2.prev = 12;
            _context2.t0 = _context2["catch"](2);
            showToast(_context2.t0.message, "error");
          case 15:
            _context2.prev = 15;
            setTesting(false);
            return _context2.finish(15);
          case 18:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[2, 12, 15, 18]]);
    }));
    return function handleCheckLive() {
      return _ref4.apply(this, arguments);
    };
  }();
  var handleRemoveCookie = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
      var res;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            if (confirm("Are you sure you want to disconnect your LinkedIn cookie?")) {
              _context3.next = 2;
              break;
            }
            return _context3.abrupt("return");
          case 2:
            _context3.prev = 2;
            _context3.next = 5;
            return fetch("".concat(API_BASE_URL, "/api/v1/auth/linkedin-cookie"), {
              method: "DELETE",
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 5:
            res = _context3.sent;
            if (res.ok) {
              setCurrentStatus("unconfigured");
              setStatusMsg("Cookie disconnected.");
              setCookieInput("");
              onStatusUpdated({
                has_cookie: false,
                cookie_status: 'unconfigured',
                valid: false,
                message: 'Cookie disconnected.'
              });
              showToast("LinkedIn cookie disconnected. Using stealth search dorking.");
            }
            _context3.next = 12;
            break;
          case 9:
            _context3.prev = 9;
            _context3.t0 = _context3["catch"](2);
            showToast(_context3.t0.message, "error");
          case 12:
          case "end":
            return _context3.stop();
        }
      }, _callee3, null, [[2, 9]]);
    }));
    return function handleRemoveCookie() {
      return _ref5.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-2xl max-w-lg w-full p-5 sm:p-6 border border-white/15 shadow-2xl space-y-4 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-white/[0.08]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-sm"
  }, "\uD83D\uDCBC"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-sm text-white"
  }, "Your LinkedIn Session Cookie"), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-400"
  }, "Authenticated HR & Team Contact Scraping"))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "text-slate-400 hover:text-white text-lg"
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded-xl border flex items-start gap-2.5 ".concat(currentStatus === 'active' ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200' : currentStatus === 'expired' ? 'bg-rose-950/80 border-rose-500/40 text-rose-200' : 'bg-slate-900 border-white/10 text-slate-300')
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-base"
  }, currentStatus === 'active' ? '✓' : currentStatus === 'expired' ? '⚠️' : 'ℹ️'), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 space-y-0.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-xs capitalize"
  }, "Status: ", currentStatus === 'active' ? 'Active & Authenticated' : currentStatus === 'expired' ? 'Expired (Action Required)' : 'Unconfigured / Stealth Mode'), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] opacity-90 leading-relaxed"
  }, statusMsg || (currentStatus === 'active' ? 'Your LinkedIn cookie is verified and active for live candidate searches.' : 'Without a cookie, the system uses public search dorking. Adding your cookie enables direct Voyager profile extraction.')))), /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-xl bg-slate-900/90 border border-white/[0.06] space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-slate-300 text-[11px] uppercase tracking-wider"
  }, "\uD83D\uDCD6 How to get your LinkedIn ", /*#__PURE__*/React.createElement("code", null, "li_at"), " cookie:"), /*#__PURE__*/React.createElement("ol", {
    className: "list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed"
  }, /*#__PURE__*/React.createElement("li", null, "Log in to ", /*#__PURE__*/React.createElement("a", {
    href: "https://www.linkedin.com",
    target: "_blank",
    className: "text-indigo-400 underline"
  }, "LinkedIn.com"), " in your browser."), /*#__PURE__*/React.createElement("li", null, "Open DevTools (", /*#__PURE__*/React.createElement("code", null, "F12"), " or Right-click \u2192 Inspect)."), /*#__PURE__*/React.createElement("li", null, "Go to ", /*#__PURE__*/React.createElement("strong", null, "Application"), " tab \u2192 ", /*#__PURE__*/React.createElement("strong", null, "Cookies"), " \u2192 ", /*#__PURE__*/React.createElement("code", null, "https://www.linkedin.com"), "."), /*#__PURE__*/React.createElement("li", null, "Find the cookie named ", /*#__PURE__*/React.createElement("strong", null, /*#__PURE__*/React.createElement("code", null, "li_at")), " and copy its value."))), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSaveCookie,
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Paste ", /*#__PURE__*/React.createElement("code", null, "li_at"), " Cookie Value:"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    placeholder: "AQEDATxxxxxx...",
    value: cookieInput,
    onChange: function onChange(e) {
      return setCookieInput(e.target.value);
    },
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row gap-2 pt-1"
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: saving || !cookieInput.trim(),
    className: "flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
  }, saving ? "Verifying with LinkedIn..." : "💾 Save & Verify Cookie"), currentStatus !== 'unconfigured' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleCheckLive,
    disabled: testing,
    className: "py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
  }, testing ? "Checking..." : "↻ Test Health"))), (cookieStatusInfo === null || cookieStatusInfo === void 0 ? void 0 : cookieStatusInfo.has_cookie) && /*#__PURE__*/React.createElement("div", {
    className: "pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-500"
  }, "Cookie is securely stored for your account."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleRemoveCookie,
    className: "text-rose-400 hover:text-rose-300 hover:underline font-medium"
  }, "Disconnect Cookie"))));
}

// ==========================================
// Component: Minimal Login Screen
// ==========================================
function LoginScreen(_ref6) {
  var onLoginSuccess = _ref6.onLoginSuccess;
  var _useState23 = useState(""),
    _useState24 = _slicedToArray(_useState23, 2),
    email = _useState24[0],
    setEmail = _useState24[1];
  var _useState25 = useState(""),
    _useState26 = _slicedToArray(_useState25, 2),
    password = _useState26[0],
    setPassword = _useState26[1];
  var _useState27 = useState(false),
    _useState28 = _slicedToArray(_useState27, 2),
    loading = _useState28[0],
    setLoading = _useState28[1];
  var _useState29 = useState(""),
    _useState30 = _slicedToArray(_useState29, 2),
    error = _useState30[0],
    setError = _useState30[1];
  var handleSubmit = /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(e) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            e.preventDefault();
            setError("");
            if (API_BASE_URL) {
              _context4.next = 5;
              break;
            }
            setError("Backend URL not configured in .env (VITE_BACKEND_URL is empty).");
            return _context4.abrupt("return");
          case 5:
            setLoading(true);
            _context4.prev = 6;
            _context4.next = 9;
            return fetch("".concat(API_BASE_URL, "/api/v1/auth/login"), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: email,
                password: password
              })
            });
          case 9:
            res = _context4.sent;
            _context4.next = 12;
            return res.json();
          case 12:
            data = _context4.sent;
            if (res.ok) {
              _context4.next = 15;
              break;
            }
            throw new Error(data.detail || "Authentication failed.");
          case 15:
            onLoginSuccess(data.access_token, data.user);
            _context4.next = 21;
            break;
          case 18:
            _context4.prev = 18;
            _context4.t0 = _context4["catch"](6);
            setError(_context4.t0.message);
          case 21:
            _context4.prev = 21;
            setLoading(false);
            return _context4.finish(21);
          case 24:
          case "end":
            return _context4.stop();
        }
      }, _callee4, null, [[6, 18, 21, 24]]);
    }));
    return function handleSubmit(_x2) {
      return _ref7.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-white/10 text-xl text-indigo-400 mb-3"
  }, "\u26A1"), /*#__PURE__*/React.createElement("h1", {
    className: "text-2xl font-bold tracking-tight text-white"
  }, "JobAgent ", /*#__PURE__*/React.createElement("span", {
    className: "text-indigo-400"
  }, "AI")), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-400 text-xs mt-1"
  }, "Multi-Source ATS Search & Contact Intelligence")), /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl p-6 shadow-xl border border-white/10"
  }, error && /*#__PURE__*/React.createElement("div", {
    className: "mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"
  }, error), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Email Address"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    value: email,
    onChange: function onChange(e) {
      return setEmail(e.target.value);
    },
    placeholder: "jobhuntadmin@gmail.com",
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-all"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Password"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    value: password,
    onChange: function onChange(e) {
      return setPassword(e.target.value);
    },
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-all"
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
  }, loading ? "Authenticating..." : "Sign In →"))));
}

// ==========================================
// Component: Job Search & Discovery Dashboard
// ==========================================
function JobSearchDashboard(_ref8) {
  var _resumeProfile$skills;
  var token = _ref8.token,
    user = _ref8.user,
    cookieStatusInfo = _ref8.cookieStatusInfo,
    onOpenCookieModal = _ref8.onOpenCookieModal,
    showToast = _ref8.showToast;
  // Form Inputs
  var _useState31 = useState("AI ML Intern"),
    _useState32 = _slicedToArray(_useState31, 2),
    role = _useState32[0],
    setRole = _useState32[1];
  var _useState33 = useState("Pune"),
    _useState34 = _slicedToArray(_useState33, 2),
    location = _useState34[0],
    setLocation = _useState34[1];
  var _useState35 = useState("intern"),
    _useState36 = _slicedToArray(_useState35, 2),
    experienceLevel = _useState36[0],
    setExperienceLevel = _useState36[1];
  var _useState37 = useState("any"),
    _useState38 = _slicedToArray(_useState37, 2),
    remotePreference = _useState38[0],
    setRemotePreference = _useState38[1];
  var _useState39 = useState("all"),
    _useState40 = _slicedToArray(_useState39, 2),
    searchDatePosted = _useState40[0],
    setSearchDatePosted = _useState40[1];

  // Resume Profile State
  var _useState41 = useState(null),
    _useState42 = _slicedToArray(_useState41, 2),
    resumeFile = _useState42[0],
    setResumeFile = _useState42[1];
  var _useState43 = useState(null),
    _useState44 = _slicedToArray(_useState43, 2),
    resumeProfile = _useState44[0],
    setResumeProfile = _useState44[1];
  var _useState45 = useState(false),
    _useState46 = _slicedToArray(_useState45, 2),
    parsingResume = _useState46[0],
    setParsingResume = _useState46[1];

  // Search Execution State
  var _useState47 = useState(false),
    _useState48 = _slicedToArray(_useState47, 2),
    searching = _useState48[0],
    setSearching = _useState48[1];
  var _useState49 = useState(""),
    _useState50 = _slicedToArray(_useState49, 2),
    currentSearchId = _useState50[0],
    setCurrentSearchId = _useState50[1];
  var _useState51 = useState([]),
    _useState52 = _slicedToArray(_useState51, 2),
    allJobs = _useState52[0],
    setAllJobs = _useState52[1];
  var _useState53 = useState({
      total_found: 0,
      unique_count: 0
    }),
    _useState54 = _slicedToArray(_useState53, 2),
    searchStats = _useState54[0],
    setSearchStats = _useState54[1];

  // Selected Job for Detailed Modal
  var _useState55 = useState(null),
    _useState56 = _slicedToArray(_useState55, 2),
    selectedJob = _useState56[0],
    setSelectedJob = _useState56[1];

  // Filter Toolbar State
  var _useState57 = useState(""),
    _useState58 = _slicedToArray(_useState57, 2),
    filterKeyword = _useState58[0],
    setFilterKeyword = _useState58[1];
  var _useState59 = useState("all"),
    _useState60 = _slicedToArray(_useState59, 2),
    filterLocation = _useState60[0],
    setFilterLocation = _useState60[1];
  var _useState61 = useState("all"),
    _useState62 = _slicedToArray(_useState61, 2),
    filterWorkMode = _useState62[0],
    setFilterWorkMode = _useState62[1];
  var _useState63 = useState(0),
    _useState64 = _slicedToArray(_useState63, 2),
    minScore = _useState64[0],
    setMinScore = _useState64[1];
  var _useState65 = useState("all"),
    _useState66 = _slicedToArray(_useState65, 2),
    filterSeniority = _useState66[0],
    setFilterSeniority = _useState66[1];
  var _useState67 = useState("all"),
    _useState68 = _slicedToArray(_useState67, 2),
    filterDate = _useState68[0],
    setFilterDate = _useState68[1];
  var _useState69 = useState("all"),
    _useState70 = _slicedToArray(_useState69, 2),
    filterSource = _useState70[0],
    setFilterSource = _useState70[1];
  var _useState71 = useState("score"),
    _useState72 = _slicedToArray(_useState71, 2),
    sortBy = _useState72[0],
    setSortBy = _useState72[1];

  // RAG AI Query State
  var _useState73 = useState(false),
    _useState74 = _slicedToArray(_useState73, 2),
    ragModalOpen = _useState74[0],
    setRagModalOpen = _useState74[1];
  var _useState75 = useState(""),
    _useState76 = _slicedToArray(_useState75, 2),
    ragQuery = _useState76[0],
    setRagQuery = _useState76[1];
  var _useState77 = useState(""),
    _useState78 = _slicedToArray(_useState77, 2),
    ragAnswer = _useState78[0],
    setRagAnswer = _useState78[1];
  var _useState79 = useState(false),
    _useState80 = _slicedToArray(_useState79, 2),
    ragLoading = _useState80[0],
    setRagLoading = _useState80[1];

  // Exporting Insights CSV State
  var _useState81 = useState(false),
    _useState82 = _slicedToArray(_useState81, 2),
    exportingInsights = _useState82[0],
    setExportingInsights = _useState82[1];

  // Resume Upload & Parse
  var handleResumeChange = /*#__PURE__*/function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(e) {
      var file, formData, res, data, _data$profile$skills, s;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            file = e.target.files[0];
            if (file) {
              _context5.next = 3;
              break;
            }
            return _context5.abrupt("return");
          case 3:
            setResumeFile(file);
            setParsingResume(true);
            formData = new FormData();
            formData.append("file", file);
            _context5.prev = 7;
            _context5.next = 10;
            return fetch("".concat(API_BASE_URL, "/api/v1/search/parse-resume"), {
              method: "POST",
              body: formData
            });
          case 10:
            res = _context5.sent;
            _context5.next = 13;
            return res.json();
          case 13:
            data = _context5.sent;
            if (res.ok && data.status === 'success') {
              setResumeProfile(data.profile);
              if (data.profile.target_roles && data.profile.target_roles[0]) {
                setRole(data.profile.target_roles[0]);
              }
              if (data.profile.seniority) {
                s = data.profile.seniority.toLowerCase();
                if (s.includes("intern")) setExperienceLevel("intern");else if (s.includes("junior") || s.includes("entry")) setExperienceLevel("entry");else if (s.includes("senior")) setExperienceLevel("senior");else if (s.includes("lead") || s.includes("staff")) setExperienceLevel("lead");else setExperienceLevel("mid");
              }
              showToast("Resume parsed! Found ".concat(((_data$profile$skills = data.profile.skills) === null || _data$profile$skills === void 0 ? void 0 : _data$profile$skills.length) || 0, " skills."));
            } else {
              showToast(data.detail || "Failed to parse resume.", "error");
            }
            _context5.next = 20;
            break;
          case 17:
            _context5.prev = 17;
            _context5.t0 = _context5["catch"](7);
            showToast(_context5.t0.message, "error");
          case 20:
            _context5.prev = 20;
            setParsingResume(false);
            return _context5.finish(20);
          case 23:
          case "end":
            return _context5.stop();
        }
      }, _callee5, null, [[7, 17, 20, 23]]);
    }));
    return function handleResumeChange(_x3) {
      return _ref9.apply(this, arguments);
    };
  }();

  // Execute Job Search
  var handleSearchSubmit = /*#__PURE__*/function () {
    var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(e) {
      var formData, res, data;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            e.preventDefault();
            setSearching(true);
            setAllJobs([]);
            formData = new FormData();
            formData.append("role", role);
            formData.append("location", location);
            formData.append("experience_level", experienceLevel);
            formData.append("remote_preference", remotePreference);
            if (resumeFile) {
              formData.append("resume", resumeFile);
            }
            _context6.prev = 9;
            _context6.next = 12;
            return fetch("".concat(API_BASE_URL, "/api/v1/search"), {
              method: "POST",
              headers: {
                'Authorization': "Bearer ".concat(token)
              },
              body: formData
            });
          case 12:
            res = _context6.sent;
            _context6.next = 15;
            return res.json();
          case 15:
            data = _context6.sent;
            if (res.ok && data.status === 'success') {
              setCurrentSearchId(data.search_id);
              setSearchStats({
                total_found: data.total_found || 0,
                unique_count: data.unique_count || 0
              });
              setAllJobs(data.jobs || []);
              setFilterDate(searchDatePosted);
              showToast("Harvested ".concat(data.total_found, " postings -> ").concat(data.unique_count, " deduplicated jobs!"));
            } else {
              showToast(data.detail || "Search failed.", "error");
            }
            _context6.next = 22;
            break;
          case 19:
            _context6.prev = 19;
            _context6.t0 = _context6["catch"](9);
            showToast(_context6.t0.message, "error");
          case 22:
            _context6.prev = 22;
            setSearching(false);
            return _context6.finish(22);
          case 25:
          case "end":
            return _context6.stop();
        }
      }, _callee6, null, [[9, 19, 22, 25]]);
    }));
    return function handleSearchSubmit(_x4) {
      return _ref10.apply(this, arguments);
    };
  }();

  // Export Company Insights CSV
  var handleExportInsightsCSV = /*#__PURE__*/function () {
    var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
      var res, blob, url, a;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            if (currentSearchId) {
              _context7.next = 2;
              break;
            }
            return _context7.abrupt("return");
          case 2:
            setExportingInsights(true);
            _context7.prev = 3;
            _context7.next = 6;
            return fetch("".concat(API_BASE_URL, "/api/v1/jobs/").concat(currentSearchId, "/export-insights"), {
              method: "POST",
              headers: {
                "Authorization": "Bearer ".concat(token),
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                candidate_name: user !== null && user !== void 0 && user.email ? user.email.split("@")[0] : "Candidate",
                candidate_skills: (resumeProfile === null || resumeProfile === void 0 ? void 0 : resumeProfile.skills) || []
              })
            });
          case 6:
            res = _context7.sent;
            if (!res.ok) {
              _context7.next = 21;
              break;
            }
            _context7.next = 10;
            return res.blob();
          case 10:
            blob = _context7.sent;
            url = window.URL.createObjectURL(blob);
            a = document.createElement("a");
            a.href = url;
            a.download = "company_insights_".concat(currentSearchId, ".csv");
            document.body.appendChild(a);
            a.click();
            a.remove();
            showToast("Downloaded Company Insights & Team Contacts CSV!");
            _context7.next = 22;
            break;
          case 21:
            showToast("Failed to generate insights CSV.", "error");
          case 22:
            _context7.next = 27;
            break;
          case 24:
            _context7.prev = 24;
            _context7.t0 = _context7["catch"](3);
            showToast(_context7.t0.message, "error");
          case 27:
            _context7.prev = 27;
            setExportingInsights(false);
            return _context7.finish(27);
          case 30:
          case "end":
            return _context7.stop();
        }
      }, _callee7, null, [[3, 24, 27, 30]]);
    }));
    return function handleExportInsightsCSV() {
      return _ref11.apply(this, arguments);
    };
  }();

  // Update job in list after contacts are fetched in modal
  var handleUpdateJobContacts = function handleUpdateJobContacts(updatedJob) {
    setAllJobs(function (prev) {
      return prev.map(function (j) {
        return j.id === updatedJob.id ? updatedJob : j;
      });
    });
    setSelectedJob(updatedJob);
  };

  // Filter & Sort Logic
  var filteredJobs = useMemo(function () {
    return allJobs.filter(function (job) {
      var title = (job.title || "").toLowerCase();
      var company = (job.company || "").toLowerCase();
      var jobLoc = (job.location || "").toLowerCase();
      var desc = (job.description || "").toLowerCase();
      var source = (job.source || "").toLowerCase();

      // 1. Keyword search
      if (filterKeyword) {
        var kw = filterKeyword.toLowerCase();
        if (!title.includes(kw) && !company.includes(kw) && !desc.includes(kw)) {
          return false;
        }
      }

      // 2. Location Preset
      if (filterLocation === 'india' && !jobLoc.includes('india') && !jobLoc.includes('pune') && !jobLoc.includes('bangalore') && !jobLoc.includes('mumbai') && !jobLoc.includes('delhi') && !jobLoc.includes('hyderabad')) return false;
      if (filterLocation === 'us' && !jobLoc.includes('united states') && !jobLoc.includes('usa') && !jobLoc.includes('us') && !jobLoc.includes('ca') && !jobLoc.includes('ny') && !jobLoc.includes('tx')) return false;
      if (filterLocation === 'uk' && !jobLoc.includes('united kingdom') && !jobLoc.includes('uk') && !jobLoc.includes('london')) return false;
      if (filterLocation === 'remote' && !jobLoc.includes('remote') && !jobLoc.includes('wfh') && source !== 'himalayas' && jobLoc !== '') return false;

      // 3. Work Mode
      var isRemote = jobLoc.includes('remote') || jobLoc.includes('wfh') || jobLoc.includes('work from home') || source === 'himalayas' || source === 'jobicy' || source === 'remoteok' || jobLoc.includes('anywhere');
      if (filterWorkMode === 'remote' && !isRemote) return false;
      if (filterWorkMode === 'onsite' && isRemote) return false;

      // 4. Min Score
      if ((job.match_score || 0) < minScore) return false;

      // 5. Seniority
      var fit = (job.experience_fit || "").toLowerCase();
      if (filterSeniority === 'intern' && !title.includes('intern') && !title.includes('trainee') && !fit.includes('intern') && !title.includes('graduate')) return false;
      if (filterSeniority === 'junior' && !title.includes('junior') && !title.includes('entry') && !title.includes('associate') && !fit.includes('junior')) return false;
      if (filterSeniority === 'senior' && !title.includes('senior') && !title.includes('lead') && !title.includes('principal') && !title.includes('staff')) return false;

      // 6. Freshness Date
      if (filterDate === '24h' && !isWithinDays(job.posted_date, 1)) return false;
      if (filterDate === '3d' && !isWithinDays(job.posted_date, 3)) return false;
      if (filterDate === '7d' && !isWithinDays(job.posted_date, 7)) return false;
      if (filterDate === '30d' && !isWithinDays(job.posted_date, 30)) return false;

      // 7. Source
      if (filterSource !== 'all' && !source.includes(filterSource)) return false;
      return true;
    }).sort(function (a, b) {
      if (sortBy === 'score') return (b.match_score || 0) - (a.match_score || 0);
      if (sortBy === 'date') return new Date(b.posted_date || 0) - new Date(a.posted_date || 0);
      return 0;
    });
  }, [allJobs, filterKeyword, filterLocation, filterWorkMode, minScore, filterSeniority, filterDate, filterSource, sortBy]);

  // RAG AI Query Handler
  var handleAskAI = /*#__PURE__*/function () {
    var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(e) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee8$(_context8) {
        while (1) switch (_context8.prev = _context8.next) {
          case 0:
            e === null || e === void 0 || e.preventDefault();
            if (!(!ragQuery.trim() || !currentSearchId)) {
              _context8.next = 3;
              break;
            }
            return _context8.abrupt("return");
          case 3:
            setRagLoading(true);
            setRagAnswer("");
            _context8.prev = 5;
            _context8.next = 8;
            return fetch("".concat(API_BASE_URL, "/api/v1/jobs/").concat(currentSearchId, "/query"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                query: ragQuery
              })
            });
          case 8:
            res = _context8.sent;
            _context8.next = 11;
            return res.json();
          case 11:
            data = _context8.sent;
            if (res.ok) {
              setRagAnswer(data.answer || "No response received.");
            } else {
              setRagAnswer("Error: ".concat(data.detail || 'Could not query assistant.'));
            }
            _context8.next = 18;
            break;
          case 15:
            _context8.prev = 15;
            _context8.t0 = _context8["catch"](5);
            setRagAnswer("Error: ".concat(_context8.t0.message));
          case 18:
            _context8.prev = 18;
            setRagLoading(false);
            return _context8.finish(18);
          case 21:
          case "end":
            return _context8.stop();
        }
      }, _callee8, null, [[5, 15, 18, 21]]);
    }));
    return function handleAskAI(_x5) {
      return _ref12.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-3 gap-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-2 minimal-card rounded-xl p-5 sm:p-6 border border-white/[0.08]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06]"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-base font-bold text-white flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFAF"), " Search & Match Preferences"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-0.5"
  }, "Parallel discovery across Greenhouse, Lever, Ashby, LinkedIn, Indeed, Himalayas, Arbeitnow, Jobicy & RemoteOK"))), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSearchSubmit,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Target Role / Title ", /*#__PURE__*/React.createElement("span", {
    className: "text-indigo-400"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: role,
    onChange: function onChange(e) {
      return setRole(e.target.value);
    },
    placeholder: "e.g. AI ML Intern, Backend Engineer",
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Preferred Location"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: location,
    onChange: function onChange(e) {
      return setLocation(e.target.value);
    },
    placeholder: "e.g. Pune, Bangalore, Remote, US",
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-3 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Work Mode"), /*#__PURE__*/React.createElement("select", {
    value: remotePreference,
    onChange: function onChange(e) {
      return setRemotePreference(e.target.value);
    },
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }, /*#__PURE__*/React.createElement("option", {
    value: "any"
  }, "\uD83C\uDF10 Any (Remote + Onsite)"), /*#__PURE__*/React.createElement("option", {
    value: "remote"
  }, "\uD83C\uDFE0 Remote Only"), /*#__PURE__*/React.createElement("option", {
    value: "onsite"
  }, "\uD83C\uDFE2 Onsite / Hybrid"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Experience Level"), /*#__PURE__*/React.createElement("select", {
    value: experienceLevel,
    onChange: function onChange(e) {
      return setExperienceLevel(e.target.value);
    },
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }, /*#__PURE__*/React.createElement("option", {
    value: "intern"
  }, "\uD83C\uDF93 Internship / Fresher (0 Yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "entry"
  }, "\uD83C\uDF31 Entry Level (0 - 2 Yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "mid"
  }, "\u26A1 Mid Level (2 - 5 Yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "senior"
  }, "\uD83D\uDCBC Senior Level (5 - 8 Yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "lead"
  }, "\uD83D\uDC51 Lead / Staff (8+ Yrs)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Date Posted"), /*#__PURE__*/React.createElement("select", {
    value: searchDatePosted,
    onChange: function onChange(e) {
      return setSearchDatePosted(e.target.value);
    },
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\uD83D\uDCC5 Anytime / All Dates"), /*#__PURE__*/React.createElement("option", {
    value: "24h"
  }, "\u26A1 Past 24 Hours"), /*#__PURE__*/React.createElement("option", {
    value: "3d"
  }, "\uD83D\uDD52 Past 3 Days"), /*#__PURE__*/React.createElement("option", {
    value: "7d"
  }, "\uD83D\uDCC5 Past 7 Days"), /*#__PURE__*/React.createElement("option", {
    value: "30d"
  }, "\uD83D\uDDD3\uFE0F Past 30 Days")))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: searching,
    className: "w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
  }, searching ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
  }), /*#__PURE__*/React.createElement("span", null, "Harvesting & Categorizing Across 9 Platforms...")) : /*#__PURE__*/React.createElement("span", null, "\u26A1 Harvest & Analyze Jobs Now")))), /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl p-5 sm:p-6 border border-white/[0.08] flex flex-col justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-3 pb-2.5 border-b border-white/[0.06]"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-white text-xs flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCC4"), " Resume AI Matcher"), parsingResume && /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-indigo-400 animate-pulse font-medium"
  }, "Parsing...")), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
  }, "Upload Resume (PDF / DOCX)"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".pdf,.docx,.txt",
    onChange: handleResumeChange,
    className: "block w-full text-xs text-slate-400 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
  })), resumeProfile ? /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-slate-400 text-[11px]"
  }, /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-200"
  }, "Seniority:"), " ", resumeProfile.seniority || 'Entry', " | ", /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-200"
  }, "Domain:"), " ", resumeProfile.core_domain || 'Engineering'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Indexed Skills (", ((_resumeProfile$skills = resumeProfile.skills) === null || _resumeProfile$skills === void 0 ? void 0 : _resumeProfile$skills.length) || 0, "):"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1"
  }, (resumeProfile.skills || []).map(function (skill, idx) {
    return /*#__PURE__*/React.createElement("span", {
      key: idx,
      className: "px-1.5 py-0.5 rounded bg-slate-800 border border-white/5 text-slate-300 text-[11px]"
    }, skill);
  })))) : /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded-lg bg-slate-900/60 border border-dashed border-slate-700/60 text-center text-xs text-slate-400"
  }, "Upload your resume for automated skill-gap analysis and personalized match scoring.")), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400"
  }, /*#__PURE__*/React.createElement("span", null, "Multi-source deduplication"), /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-400 font-medium"
  }, "Active")))), allJobs.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "space-y-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl p-4 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-5"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400"
  }, "Raw Harvested"), /*#__PURE__*/React.createElement("div", {
    className: "text-xl font-bold text-white"
  }, searchStats.total_found)), /*#__PURE__*/React.createElement("div", {
    className: "h-6 w-px bg-white/10"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400"
  }, "Deduplicated"), /*#__PURE__*/React.createElement("div", {
    className: "text-xl font-bold text-indigo-400"
  }, searchStats.unique_count)), /*#__PURE__*/React.createElement("div", {
    className: "h-6 w-px bg-white/10"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400"
  }, "Showing"), /*#__PURE__*/React.createElement("div", {
    className: "text-xl font-bold text-emerald-400"
  }, filteredJobs.length))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-2 w-full sm:w-auto"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setRagModalOpen(true);
    },
    className: "flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83E\uDD16"), /*#__PURE__*/React.createElement("span", null, "Ask AI")), /*#__PURE__*/React.createElement("button", {
    onClick: handleExportInsightsCSV,
    disabled: exportingInsights,
    className: "flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCA"), /*#__PURE__*/React.createElement("span", null, exportingInsights ? "Generating..." : "Export Insights & Contacts CSV")), /*#__PURE__*/React.createElement("a", {
    href: "".concat(API_BASE_URL, "/api/v1/jobs/").concat(currentSearchId, "/export"),
    download: true,
    className: "flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCE5"), /*#__PURE__*/React.createElement("span", null, "Standard CSV")))), /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl p-4 border border-white/[0.08] space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Search Keywords"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Company, title, skill...",
    value: filterKeyword,
    onChange: function onChange(e) {
      return setFilterKeyword(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Location"), /*#__PURE__*/React.createElement("select", {
    value: filterLocation,
    onChange: function onChange(e) {
      return setFilterLocation(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\uD83D\uDCCD All Locations"), /*#__PURE__*/React.createElement("option", {
    value: "india"
  }, "\uD83C\uDDEE\uD83C\uDDF3 India"), /*#__PURE__*/React.createElement("option", {
    value: "us"
  }, "\uD83C\uDDFA\uD83C\uDDF8 United States"), /*#__PURE__*/React.createElement("option", {
    value: "uk"
  }, "\uD83C\uDDEC\uD83C\uDDE7 United Kingdom"), /*#__PURE__*/React.createElement("option", {
    value: "remote"
  }, "\uD83C\uDFE0 Remote"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Work Mode"), /*#__PURE__*/React.createElement("select", {
    value: filterWorkMode,
    onChange: function onChange(e) {
      return setFilterWorkMode(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\uD83C\uDF10 Any Mode"), /*#__PURE__*/React.createElement("option", {
    value: "remote"
  }, "\uD83C\uDFE0 Remote"), /*#__PURE__*/React.createElement("option", {
    value: "onsite"
  }, "\uD83C\uDFE2 Onsite / Hybrid"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Platform Source"), /*#__PURE__*/React.createElement("select", {
    value: filterSource,
    onChange: function onChange(e) {
      return setFilterSource(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\uD83C\uDF10 All Platforms"), /*#__PURE__*/React.createElement("option", {
    value: "greenhouse"
  }, "\uD83C\uDF3F Greenhouse ATS"), /*#__PURE__*/React.createElement("option", {
    value: "lever"
  }, "\u2699\uFE0F Lever ATS"), /*#__PURE__*/React.createElement("option", {
    value: "ashby"
  }, "\u26A1 Ashby ATS"), /*#__PURE__*/React.createElement("option", {
    value: "jobicy"
  }, "\uD83C\uDF0D Jobicy"), /*#__PURE__*/React.createElement("option", {
    value: "remoteok"
  }, "\uD83C\uDFD6\uFE0F RemoteOK"), /*#__PURE__*/React.createElement("option", {
    value: "arbeitnow"
  }, "\uD83C\uDDEA\uD83C\uDDFA Arbeitnow"), /*#__PURE__*/React.createElement("option", {
    value: "himalayas"
  }, "\uD83C\uDFD4\uFE0F Himalayas"), /*#__PURE__*/React.createElement("option", {
    value: "linkedin"
  }, "\uD83D\uDCBC LinkedIn / Indeed"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Min Match: ", /*#__PURE__*/React.createElement("span", {
    className: "text-indigo-400 font-bold"
  }, minScore, "%")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "90",
    step: "10",
    value: minScore,
    onChange: function onChange(e) {
      return setMinScore(Number(e.target.value));
    },
    className: "w-full accent-indigo-500 cursor-pointer mt-1"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Sort By"), /*#__PURE__*/React.createElement("select", {
    value: sortBy,
    onChange: function onChange(e) {
      return setSortBy(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }, /*#__PURE__*/React.createElement("option", {
    value: "score"
  }, "\u2B50 Highest Match"), /*#__PURE__*/React.createElement("option", {
    value: "date"
  }, "\uD83D\uDCC5 Most Recent"))))), filteredJobs.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl p-10 text-center border border-white/[0.08] space-y-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-3xl"
  }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-white"
  }, "No jobs match your filter criteria"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400"
  }, "Try resetting filters to show all gathered postings."), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setFilterKeyword("");
      setFilterLocation("all");
      setFilterWorkMode("all");
      setMinScore(0);
      setFilterSeniority("all");
      setFilterDate("all");
      setFilterSource("all");
    },
    className: "px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
  }, "Reset All Filters")) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-4"
  }, filteredJobs.map(function (job, idx) {
    return /*#__PURE__*/React.createElement(JobCard, {
      key: job.id || idx,
      job: job,
      onViewDetails: function onViewDetails() {
        return setSelectedJob(job);
      },
      onQueryAI: function onQueryAI() {
        setRagQuery("Tell me about the requirements and salary for ".concat(job.title, " at ").concat(job.company));
        setRagModalOpen(true);
      }
    });
  }))), selectedJob && /*#__PURE__*/React.createElement(JobDetailModal, {
    job: selectedJob,
    user: user,
    token: token,
    resumeSkills: (resumeProfile === null || resumeProfile === void 0 ? void 0 : resumeProfile.skills) || [],
    onClose: function onClose() {
      return setSelectedJob(null);
    },
    onUpdateJob: handleUpdateJobContacts,
    onOpenCookieModal: onOpenCookieModal,
    showToast: showToast
  }), ragModalOpen && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl max-w-2xl w-full p-5 border border-white/15 shadow-2xl space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-2.5 border-b border-white/[0.08]"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-sm font-bold text-white flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83E\uDD16"), " RAG Job Intelligence Assistant"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setRagModalOpen(false);
    },
    className: "text-slate-400 hover:text-white text-lg leading-none"
  }, "\u2715")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleAskAI,
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: ragQuery,
    onChange: function onChange(e) {
      return setRagQuery(e.target.value);
    },
    placeholder: "Ask anything (e.g. Which roles require Python and offer remote?)",
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none pr-20"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: ragLoading || !ragQuery.trim(),
    className: "absolute right-1.5 top-1.5 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50"
  }, ragLoading ? "Asking..." : "Ask"))), ragAnswer && /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-lg bg-slate-900/90 border border-indigo-500/20 text-slate-200 text-xs leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap"
  }, ragAnswer))));
}

// ==========================================
// Component: Single Job Card (Minimal Aesthetic)
// ==========================================
function JobCard(_ref13) {
  var job = _ref13.job,
    onViewDetails = _ref13.onViewDetails,
    onQueryAI = _ref13.onQueryAI;
  var score = Math.round(job.match_score || 0);
  var scoreColor = "bg-slate-800 text-slate-300 border-slate-700";
  if (score >= 80) scoreColor = "bg-emerald-950/60 text-emerald-300 border-emerald-500/30";else if (score >= 65) scoreColor = "bg-amber-950/60 text-amber-300 border-amber-500/30";

  // Salary formatting
  var salaryDisplay = "Salary: N/A";
  if (job.salary_range) {
    var minS = job.salary_range.min;
    var maxS = job.salary_range.max;
    var curr = job.salary_range.currency || "$";
    if (minS && maxS) salaryDisplay = "".concat(curr).concat(minS.toLocaleString(), " - ").concat(maxS.toLocaleString());else if (minS) salaryDisplay = "> ".concat(curr).concat(minS.toLocaleString());
  }
  var matchingSkills = job.matching_skills || [];
  var insights = job.company_insights || {};
  var hrCount = (job.hr_contacts || []).length;
  var techCount = (job.tech_contacts || []).length;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onViewDetails,
    className: "minimal-card rounded-xl p-4 border border-white/[0.08] hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-3 shadow-md hover:bg-slate-900/70 cursor-pointer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-2.5"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-white text-sm leading-snug line-clamp-2"
  }, job.title), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-0.5 flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-semibold text-slate-200"
  }, "\uD83C\uDFE2 ", job.company || 'Company'), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCD ", job.location || 'Remote'))), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-md border font-bold text-xs shrink-0 ".concat(scoreColor)
  }, score, "% Match")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-1.5 text-[11px]"
  }, /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-white/[0.06]"
  }, "\uD83D\uDD17 ", job.source || 'Direct'), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-white/[0.06]"
  }, "\uD83D\uDCBC ", job.experience_fit || 'Good Fit'), salaryDisplay !== 'Salary: N/A' && /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-medium"
  }, "\uD83D\uDCB0 ", salaryDisplay), insights.size_indicator && insights.size_indicator !== 'Unknown' && /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-white/[0.06]"
  }, "\uD83D\uDC65 ", insights.size_indicator)), job.key_requirements ? /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-white/[0.04]"
  }, job.key_requirements) : job.match_reason && /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 italic line-clamp-2 leading-relaxed"
  }, "\uD83D\uDCA1 ", job.match_reason), matchingSkills.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1 items-center pt-0.5"
  }, matchingSkills.slice(0, 3).map(function (s, idx) {
    return /*#__PURE__*/React.createElement("span", {
      key: idx,
      className: "px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[10px] border border-emerald-500/20"
    }, "\u2713 ", s);
  }), matchingSkills.length > 3 && /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-500"
  }, "+", matchingSkills.length - 3, " more"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400 flex items-center gap-1.5"
  }, hrCount > 0 || techCount > 0 ? /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-400 flex items-center gap-1 font-medium"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC65"), /*#__PURE__*/React.createElement("span", null, hrCount, " HR + ", techCount, " Tech Leads")) : /*#__PURE__*/React.createElement("span", {
    className: "text-slate-500"
  }, "Click to view team & verified emails")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick(e) {
      e.stopPropagation();
      onViewDetails();
    },
    className: "py-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all"
  }, "View Details \u2192"))));
}

// ==========================================
// Component: Interactive Job Details Modal
// ==========================================
function JobDetailModal(_ref14) {
  var _job$location;
  var job = _ref14.job,
    user = _ref14.user,
    token = _ref14.token,
    resumeSkills = _ref14.resumeSkills,
    onClose = _ref14.onClose,
    onUpdateJob = _ref14.onUpdateJob,
    onOpenCookieModal = _ref14.onOpenCookieModal,
    showToast = _ref14.showToast;
  var _useState83 = useState(false),
    _useState84 = _slicedToArray(_useState83, 2),
    fetchingContacts = _useState84[0],
    setFetchingContacts = _useState84[1];
  var _useState85 = useState("overview"),
    _useState86 = _slicedToArray(_useState85, 2),
    activeTab = _useState86[0],
    setActiveTab = _useState86[1]; // 'overview' | 'contacts' | 'outreach'

  var score = Math.round(job.match_score || 0);
  var insights = job.company_insights || {};
  var hrContacts = job.hr_contacts || [];
  var techContacts = job.tech_contacts || [];
  var allContacts = [].concat(_toConsumableArray(hrContacts), _toConsumableArray(techContacts));

  // Fetch / Refresh HR & Tech Contacts
  var handleFetchContacts = /*#__PURE__*/function () {
    var _ref15 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9() {
      var res, data, _data$hr_contacts, _data$tech_contacts, updated;
      return _regeneratorRuntime().wrap(function _callee9$(_context9) {
        while (1) switch (_context9.prev = _context9.next) {
          case 0:
            setFetchingContacts(true);
            _context9.prev = 1;
            _context9.next = 4;
            return fetch("".concat(API_BASE_URL, "/api/v1/jobs/").concat(job.id, "/fetch-hr-contacts"), {
              method: "POST",
              headers: {
                "Authorization": "Bearer ".concat(token),
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                candidate_name: user !== null && user !== void 0 && user.email ? user.email.split("@")[0] : "Candidate",
                candidate_skills: resumeSkills || job.matching_skills || [],
                include_tech: true
              })
            });
          case 4:
            res = _context9.sent;
            _context9.next = 7;
            return res.json();
          case 7:
            data = _context9.sent;
            if (res.ok && data.status === 'success') {
              updated = _objectSpread(_objectSpread({}, job), {}, {
                hr_contacts: data.hr_contacts || [],
                tech_contacts: data.tech_contacts || []
              });
              onUpdateJob(updated);
              showToast("Discovered ".concat(((_data$hr_contacts = data.hr_contacts) === null || _data$hr_contacts === void 0 ? void 0 : _data$hr_contacts.length) || 0, " HR + ").concat(((_data$tech_contacts = data.tech_contacts) === null || _data$tech_contacts === void 0 ? void 0 : _data$tech_contacts.length) || 0, " Tech contacts!"));
              setActiveTab("contacts");

              // If backend noticed cookie is expired
              if (data.cookie_expired) {
                showToast("⚠️ LinkedIn cookie expired. Fallback dorking was used. Click top badge to refresh.", "error");
              }
            } else {
              showToast(data.message || "Failed to discover contacts.", "error");
            }
            _context9.next = 14;
            break;
          case 11:
            _context9.prev = 11;
            _context9.t0 = _context9["catch"](1);
            showToast(_context9.t0.message, "error");
          case 14:
            _context9.prev = 14;
            setFetchingContacts(false);
            return _context9.finish(14);
          case 17:
          case "end":
            return _context9.stop();
        }
      }, _callee9, null, [[1, 11, 14, 17]]);
    }));
    return function handleFetchContacts() {
      return _ref15.apply(this, arguments);
    };
  }();
  var copyToClipboard = function copyToClipboard(text) {
    var label = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Copied!";
    navigator.clipboard.writeText(text);
    showToast(label);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-2xl max-w-3xl w-full my-8 p-5 sm:p-6 border border-white/15 shadow-2xl space-y-5 text-xs max-h-[90vh] flex flex-col justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-3 pb-3 border-b border-white/[0.08]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-base sm:text-lg font-bold text-white leading-snug"
  }, job.title), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-semibold text-indigo-300"
  }, "\uD83C\uDFE2 ", job.company), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCD ", job.location || 'Remote'), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", {
    className: "text-slate-400"
  }, "\uD83D\uDCC5 ", job.posted_date || 'Recent'))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold text-xs shrink-0"
  }, score, "% Fit"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
  }, "\u2715"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 pt-1"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab("overview");
    },
    className: "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ".concat(activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200')
  }, "\uD83D\uDCCB Overview & Insights"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab("contacts");
    },
    className: "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ".concat(activeTab === 'contacts' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC65 Team & Emails"), /*#__PURE__*/React.createElement("span", {
    className: "px-1.5 py-0.2 rounded bg-white/10 text-[10px]"
  }, allContacts.length)), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab("outreach");
    },
    className: "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ".concat(activeTab === 'outreach' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200')
  }, "\u2709\uFE0F AI Outreach Drafter"))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto space-y-4 pr-1"
  }, activeTab === "overview" && /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, job.key_requirements && /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/20 space-y-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold text-indigo-300 uppercase tracking-wider"
  }, "\u26A1 What This Job Actually Requires (Plain English)"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-200 text-xs leading-relaxed"
  }, job.key_requirements)), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold text-slate-300 uppercase tracking-wider"
  }, "\uD83C\uDFE2 Company Profile"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-1 text-slate-400"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-200"
  }, "Size:"), " ", insights.size_indicator || 'Unknown'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-200"
  }, "Industry:"), " ", insights.industry || 'Tech'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-200"
  }, "Work Mode:"), " ", (_job$location = job.location) !== null && _job$location !== void 0 && _job$location.toLowerCase().includes('remote') ? 'Remote' : 'Onsite / Hybrid'))), /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold text-slate-300 uppercase tracking-wider"
  }, "\uD83C\uDF31 Culture Signals"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1"
  }, (insights.culture_signals || ["collaborative", "fast-paced"]).map(function (c, i) {
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]"
    }, c);
  })))), insights.red_flags && insights.red_flags.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 space-y-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "font-bold flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("span", null, "Noted Red Flags from Job Description")), /*#__PURE__*/React.createElement("ul", {
    className: "list-disc list-inside space-y-0.5 text-[11px]"
  }, insights.red_flags.map(function (rf, i) {
    return /*#__PURE__*/React.createElement("li", {
      key: i
    }, rf);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold text-slate-300 uppercase tracking-wider"
  }, "\uD83D\uDEE0\uFE0F Skill Alignment Matrix"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, job.matching_skills && job.matching_skills.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-emerald-400 font-semibold block mb-1"
  }, "Matched Skills:"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1"
  }, job.matching_skills.map(function (s, i) {
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[11px]"
    }, "\u2713 ", s);
  }))), job.missing_skills && job.missing_skills.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-amber-400 font-semibold block mb-1"
  }, "Missing / Skill Gaps:"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1"
  }, job.missing_skills.map(function (s, i) {
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[11px]"
    }, "! ", s);
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold text-slate-300 uppercase tracking-wider"
  }, "\uD83D\uDCC4 Full Job Description"), /*#__PURE__*/React.createElement("div", {
    className: "text-slate-300 text-xs leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap bg-slate-950/40 p-3 rounded-lg border border-white/[0.04]"
  }, cleanHtmlJobDescription(job.description)))), activeTab === "contacts" && /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, allContacts.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "p-6 rounded-xl bg-slate-900/80 border border-dashed border-slate-700 text-center space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-2xl"
  }, "\uD83D\uDC65"), /*#__PURE__*/React.createElement("div", {
    className: "text-white font-bold text-xs"
  }, "No recruiter or tech contacts loaded yet"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-400 text-xs"
  }, "Trigger live Scout multi-factor discovery to find HR managers, tech leads, verified emails, phone numbers, and LinkedIn profile URLs."), /*#__PURE__*/React.createElement("button", {
    onClick: handleFetchContacts,
    disabled: fetchingContacts,
    className: "px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs disabled:opacity-50"
  }, fetchingContacts ? "Discovering Contacts..." : "⚡ Discover HR & Tech Contacts Now")) : /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold text-slate-300"
  }, "Found ", hrContacts.length, " HR Contacts + ", techContacts.length, " Tech Leads"), /*#__PURE__*/React.createElement("button", {
    onClick: handleFetchContacts,
    disabled: fetchingContacts,
    className: "px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] disabled:opacity-50"
  }, fetchingContacts ? "Refreshing..." : "↻ Refresh Contacts")), hrContacts.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold text-indigo-400 uppercase tracking-wider"
  }, "\uD83C\uDFAF Technical Recruiters & Talent Acquisition"), hrContacts.map(function (c, i) {
    return /*#__PURE__*/React.createElement(ContactCard, {
      key: i,
      contact: c,
      onCopy: copyToClipboard
    });
  })), techContacts.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 pt-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold text-purple-400 uppercase tracking-wider"
  }, "\uD83D\uDCBB Engineering Leadership & Tech Leads"), techContacts.map(function (c, i) {
    return /*#__PURE__*/React.createElement(ContactCard, {
      key: i,
      contact: c,
      onCopy: copyToClipboard
    });
  })))), activeTab === "outreach" && /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, allContacts.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "p-6 rounded-xl bg-slate-900/80 border border-dashed border-slate-700 text-center space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-slate-400 text-xs"
  }, "Discover team contacts first to generate tailored cold outreach drafts!"), /*#__PURE__*/React.createElement("button", {
    onClick: handleFetchContacts,
    disabled: fetchingContacts,
    className: "px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
  }, fetchingContacts ? "Loading..." : "⚡ Find Contacts & Generate Drafts")) : /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, allContacts.map(function (c, i) {
    var draft = c.outreach_draft || {};
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "p-3.5 rounded-xl bg-slate-900/90 border border-white/[0.08] space-y-2.5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between border-b border-white/[0.06] pb-2"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "font-bold text-white text-xs"
    }, c.full_name), /*#__PURE__*/React.createElement("span", {
      className: "text-slate-400 text-[11px] ml-2"
    }, "(", c.headline, ")")), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30"
    }, "Tailored for ", job.company)), /*#__PURE__*/React.createElement("div", {
      className: "space-y-1.5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold text-slate-400 uppercase"
    }, "Cold Email Subject & Body:"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return copyToClipboard("".concat(draft.email_subject || '', "\n\n").concat(draft.email_body || ''), "Copied Cold Email!");
      },
      className: "text-indigo-400 hover:underline text-[11px]"
    }, "\uD83D\uDCCB Copy Email")), /*#__PURE__*/React.createElement("div", {
      className: "bg-slate-950 p-2.5 rounded-lg border border-white/[0.04] space-y-1 text-slate-300"
    }, /*#__PURE__*/React.createElement("div", {
      className: "font-semibold text-slate-200"
    }, "Subject: ", draft.email_subject || "Application for ".concat(job.title)), /*#__PURE__*/React.createElement("div", {
      className: "whitespace-pre-wrap leading-relaxed"
    }, draft.email_body || "Draft will appear here."))), draft.linkedin_note && /*#__PURE__*/React.createElement("div", {
      className: "space-y-1 pt-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold text-slate-400 uppercase"
    }, "LinkedIn Connection Note (<280 chars):"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return copyToClipboard(draft.linkedin_note, "Copied LinkedIn Note!");
      },
      className: "text-indigo-400 hover:underline text-[11px]"
    }, "\uD83D\uDCCB Copy Note")), /*#__PURE__*/React.createElement("div", {
      className: "bg-slate-950 p-2 rounded-lg border border-white/[0.04] text-slate-300 italic"
    }, "\"", draft.linkedin_note, "\"")));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleFetchContacts,
    disabled: fetchingContacts,
    className: "px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC65"), /*#__PURE__*/React.createElement("span", null, fetchingContacts ? "Enriching Team..." : "Enrich Team Contacts")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs"
  }, "Close"), job.url && /*#__PURE__*/React.createElement("a", {
    href: job.url,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm"
  }, "Apply on Career Page \u2197")))));
}

// ==========================================
// Sub-Component: Contact Card
// ==========================================
function ContactCard(_ref16) {
  var contact = _ref16.contact,
    onCopy = _ref16.onCopy;
  var conf = contact.confidence_score || 65;
  var confBadge = "bg-slate-800 text-slate-300";
  if (conf >= 85) confBadge = "bg-emerald-950 text-emerald-300 border border-emerald-500/30";else if (conf >= 60) confBadge = "bg-amber-950 text-amber-300 border border-amber-500/30";
  return /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded-xl bg-slate-900/90 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-white text-xs"
  }, contact.full_name), /*#__PURE__*/React.createElement("span", {
    className: "px-1.5 py-0.2 rounded text-[10px] font-bold ".concat(confBadge)
  }, conf, "% verified")), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400"
  }, contact.headline), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-3 pt-0.5 text-xs text-slate-300"
  }, contact.email && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\u2709\uFE0F"), /*#__PURE__*/React.createElement("span", {
    className: "font-mono text-[11px] text-indigo-300"
  }, contact.email), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return onCopy(contact.email, "Copied Email!");
    },
    className: "text-slate-500 hover:text-white text-[11px]",
    title: "Copy Email"
  }, "\uD83D\uDCCB")), contact.phone && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCDE"), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px]"
  }, contact.phone), contact.whatsapp_url && /*#__PURE__*/React.createElement("a", {
    href: contact.whatsapp_url,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "text-emerald-400 hover:underline text-[11px]",
    title: "Open WhatsApp Chat"
  }, "\uD83D\uDCAC WhatsApp")))), contact.profile_url && /*#__PURE__*/React.createElement("a", {
    href: contact.profile_url,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium shrink-0 flex items-center justify-center gap-1"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD17"), /*#__PURE__*/React.createElement("span", null, "LinkedIn Profile")));
}

// ==========================================
// Component: Email Automation & Live Alerts
// ==========================================
function EmailAlertsView(_ref17) {
  var token = _ref17.token,
    user = _ref17.user,
    cookieStatusInfo = _ref17.cookieStatusInfo,
    onOpenCookieModal = _ref17.onOpenCookieModal,
    showToast = _ref17.showToast;
  var _useState87 = useState(user.email || ""),
    _useState88 = _slicedToArray(_useState87, 2),
    email = _useState88[0],
    setEmail = _useState88[1];
  var _useState89 = useState("AI ML Intern"),
    _useState90 = _slicedToArray(_useState89, 2),
    role = _useState90[0],
    setRole = _useState90[1];
  var _useState91 = useState("Pune"),
    _useState92 = _slicedToArray(_useState91, 2),
    location = _useState92[0],
    setLocation = _useState92[1];
  var _useState93 = useState("any"),
    _useState94 = _slicedToArray(_useState93, 2),
    workMode = _useState94[0],
    setWorkMode = _useState94[1];
  var _useState95 = useState("intern"),
    _useState96 = _slicedToArray(_useState95, 2),
    experienceLevel = _useState96[0],
    setExperienceLevel = _useState96[1];
  var _useState97 = useState(3),
    _useState98 = _slicedToArray(_useState97, 2),
    maxAgeDays = _useState98[0],
    setMaxAgeDays = _useState98[1];
  var _useState99 = useState("09:00"),
    _useState100 = _slicedToArray(_useState99, 2),
    preferredTime = _useState100[0],
    setPreferredTime = _useState100[1];
  var _useState101 = useState(null),
    _useState102 = _slicedToArray(_useState101, 2),
    resumeFile = _useState102[0],
    setResumeFile = _useState102[1];
  var _useState103 = useState(null),
    _useState104 = _slicedToArray(_useState103, 2),
    resumeProfile = _useState104[0],
    setResumeProfile = _useState104[1];
  var _useState105 = useState(false),
    _useState106 = _slicedToArray(_useState105, 2),
    parsingResume = _useState106[0],
    setParsingResume = _useState106[1];
  var _useState107 = useState(false),
    _useState108 = _slicedToArray(_useState107, 2),
    saving = _useState108[0],
    setSaving = _useState108[1];
  var _useState109 = useState(false),
    _useState110 = _slicedToArray(_useState109, 2),
    testing = _useState110[0],
    setTesting = _useState110[1];
  var _useState111 = useState([]),
    _useState112 = _slicedToArray(_useState111, 2),
    activeAlerts = _useState112[0],
    setActiveAlerts = _useState112[1];
  var _useState113 = useState(true),
    _useState114 = _slicedToArray(_useState113, 2),
    loadingAlerts = _useState114[0],
    setLoadingAlerts = _useState114[1];
  var fetchAlerts = /*#__PURE__*/function () {
    var _ref18 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10() {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee10$(_context10) {
        while (1) switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            setLoadingAlerts(true);
            _context10.next = 4;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts"), {
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 4:
            res = _context10.sent;
            _context10.next = 7;
            return res.json();
          case 7:
            data = _context10.sent;
            if (res.ok) {
              setActiveAlerts(data || []);
            }
            _context10.next = 14;
            break;
          case 11:
            _context10.prev = 11;
            _context10.t0 = _context10["catch"](0);
            console.error("Fetch alerts error:", _context10.t0);
          case 14:
            _context10.prev = 14;
            setLoadingAlerts(false);
            return _context10.finish(14);
          case 17:
          case "end":
            return _context10.stop();
        }
      }, _callee10, null, [[0, 11, 14, 17]]);
    }));
    return function fetchAlerts() {
      return _ref18.apply(this, arguments);
    };
  }();
  useEffect(function () {
    fetchAlerts();
  }, []);
  var handleResumeChange = /*#__PURE__*/function () {
    var _ref19 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(e) {
      var file, formData, res, data, _data$profile$skills2;
      return _regeneratorRuntime().wrap(function _callee11$(_context11) {
        while (1) switch (_context11.prev = _context11.next) {
          case 0:
            file = e.target.files[0];
            if (file) {
              _context11.next = 3;
              break;
            }
            return _context11.abrupt("return");
          case 3:
            setResumeFile(file);
            setParsingResume(true);
            formData = new FormData();
            formData.append("file", file);
            _context11.prev = 7;
            _context11.next = 10;
            return fetch("".concat(API_BASE_URL, "/api/v1/search/parse-resume"), {
              method: "POST",
              body: formData
            });
          case 10:
            res = _context11.sent;
            _context11.next = 13;
            return res.json();
          case 13:
            data = _context11.sent;
            if (res.ok && data.status === 'success') {
              setResumeProfile(data.profile);
              if (data.profile.target_roles && data.profile.target_roles[0]) {
                setRole(data.profile.target_roles[0]);
              }
              showToast("Resume attached! Extracted ".concat(((_data$profile$skills2 = data.profile.skills) === null || _data$profile$skills2 === void 0 ? void 0 : _data$profile$skills2.length) || 0, " skills."));
            }
            _context11.next = 20;
            break;
          case 17:
            _context11.prev = 17;
            _context11.t0 = _context11["catch"](7);
            showToast("Resume attached.");
          case 20:
            _context11.prev = 20;
            setParsingResume(false);
            return _context11.finish(20);
          case 23:
          case "end":
            return _context11.stop();
        }
      }, _callee11, null, [[7, 17, 20, 23]]);
    }));
    return function handleResumeChange(_x6) {
      return _ref19.apply(this, arguments);
    };
  }();
  var handleSaveAlert = /*#__PURE__*/function () {
    var _ref20 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(e) {
      var formData, res, data;
      return _regeneratorRuntime().wrap(function _callee12$(_context12) {
        while (1) switch (_context12.prev = _context12.next) {
          case 0:
            e.preventDefault();
            setSaving(true);
            formData = new FormData();
            formData.append("email", email);
            formData.append("role", role);
            formData.append("location", location);
            formData.append("work_mode", workMode);
            formData.append("experience_level", experienceLevel);
            formData.append("max_age_days", maxAgeDays);
            formData.append("preferred_time", preferredTime);
            if (resumeFile) {
              formData.append("resume", resumeFile);
            }
            _context12.prev = 11;
            _context12.next = 14;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts"), {
              method: "POST",
              headers: {
                'Authorization': "Bearer ".concat(token)
              },
              body: formData
            });
          case 14:
            res = _context12.sent;
            _context12.next = 17;
            return res.json();
          case 17:
            data = _context12.sent;
            if (res.ok) {
              showToast("Daily job automation scheduled for ".concat(email, "!"));
              fetchAlerts();
            } else {
              showToast(data.detail || "Failed to schedule alert.", "error");
            }
            _context12.next = 24;
            break;
          case 21:
            _context12.prev = 21;
            _context12.t0 = _context12["catch"](11);
            showToast(_context12.t0.message, "error");
          case 24:
            _context12.prev = 24;
            setSaving(false);
            return _context12.finish(24);
          case 27:
          case "end":
            return _context12.stop();
        }
      }, _callee12, null, [[11, 21, 24, 27]]);
    }));
    return function handleSaveAlert(_x7) {
      return _ref20.apply(this, arguments);
    };
  }();
  var handleSendTestEmail = /*#__PURE__*/function () {
    var _ref21 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13() {
      var formData, res, data;
      return _regeneratorRuntime().wrap(function _callee13$(_context13) {
        while (1) switch (_context13.prev = _context13.next) {
          case 0:
            setTesting(true);
            formData = new FormData();
            formData.append("email", email);
            formData.append("role", role);
            formData.append("location", location);
            formData.append("work_mode", workMode);
            formData.append("experience_level", experienceLevel);
            formData.append("max_age_days", maxAgeDays);
            if (resumeFile) {
              formData.append("resume", resumeFile);
            }
            _context13.prev = 9;
            _context13.next = 12;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts/test-send"), {
              method: "POST",
              headers: {
                'Authorization': "Bearer ".concat(token)
              },
              body: formData
            });
          case 12:
            res = _context13.sent;
            _context13.next = 15;
            return res.json();
          case 15:
            data = _context13.sent;
            if (res.ok && (data.status === 'success' || data.status === 'partial')) {
              showToast("Sent ".concat(data.jobs_sent || 0, " Jobs + CSV to ").concat(email, "!"));
            } else {
              showToast(data.detail || data.message || "Failed to send test email.", "error");
            }
            _context13.next = 22;
            break;
          case 19:
            _context13.prev = 19;
            _context13.t0 = _context13["catch"](9);
            showToast(_context13.t0.message, "error");
          case 22:
            _context13.prev = 22;
            setTesting(false);
            return _context13.finish(22);
          case 25:
          case "end":
            return _context13.stop();
        }
      }, _callee13, null, [[9, 19, 22, 25]]);
    }));
    return function handleSendTestEmail() {
      return _ref21.apply(this, arguments);
    };
  }();
  var handleDeleteAlert = /*#__PURE__*/function () {
    var _ref22 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14(alertId) {
      var res;
      return _regeneratorRuntime().wrap(function _callee14$(_context14) {
        while (1) switch (_context14.prev = _context14.next) {
          case 0:
            _context14.prev = 0;
            _context14.next = 3;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts/").concat(alertId), {
              method: "DELETE",
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 3:
            res = _context14.sent;
            if (res.ok) {
              showToast("Alert automation removed.");
              fetchAlerts();
            } else {
              showToast("Failed to delete alert.", "error");
            }
            _context14.next = 10;
            break;
          case 7:
            _context14.prev = 7;
            _context14.t0 = _context14["catch"](0);
            showToast(_context14.t0.message, "error");
          case 10:
          case "end":
            return _context14.stop();
        }
      }, _callee14, null, [[0, 7]]);
    }));
    return function handleDeleteAlert(_x8) {
      return _ref22.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-3 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-2 minimal-card rounded-xl p-5 sm:p-6 border border-white/[0.08] space-y-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-base font-bold text-white flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\u23F0"), " Automated Daily Job Digest"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-0.5"
  }, "Runs scheduled multi-board scrapers with deduplication and delivers matching roles with curated CSV directly to your inbox.")), /*#__PURE__*/React.createElement("button", {
    onClick: onOpenCookieModal,
    className: "px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-[11px] text-slate-300 hover:text-white transition-all shrink-0"
  }, (cookieStatusInfo === null || cookieStatusInfo === void 0 ? void 0 : cookieStatusInfo.cookie_status) === 'active' ? '🟢 Cookie Active' : (cookieStatusInfo === null || cookieStatusInfo === void 0 ? void 0 : cookieStatusInfo.cookie_status) === 'expired' ? '🔴 Cookie Expired' : '⚪ Add Cookie')), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSaveAlert,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Destination Email Address ", /*#__PURE__*/React.createElement("span", {
    className: "text-indigo-400"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    value: email,
    onChange: function onChange(e) {
      return setEmail(e.target.value);
    },
    placeholder: "e.g. xyz@gmail.com",
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Target Role / Title ", /*#__PURE__*/React.createElement("span", {
    className: "text-indigo-400"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: role,
    onChange: function onChange(e) {
      return setRole(e.target.value);
    },
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Preferred Location"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: location,
    onChange: function onChange(e) {
      return setLocation(e.target.value);
    },
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Work Mode"), /*#__PURE__*/React.createElement("select", {
    value: workMode,
    onChange: function onChange(e) {
      return setWorkMode(e.target.value);
    },
    className: "w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }, /*#__PURE__*/React.createElement("option", {
    value: "any"
  }, "\uD83C\uDF10 Any"), /*#__PURE__*/React.createElement("option", {
    value: "remote"
  }, "\uD83C\uDFE0 Remote"), /*#__PURE__*/React.createElement("option", {
    value: "onsite"
  }, "\uD83C\uDFE2 Onsite"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Level"), /*#__PURE__*/React.createElement("select", {
    value: experienceLevel,
    onChange: function onChange(e) {
      return setExperienceLevel(e.target.value);
    },
    className: "w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }, /*#__PURE__*/React.createElement("option", {
    value: "intern"
  }, "\uD83C\uDF93 Intern"), /*#__PURE__*/React.createElement("option", {
    value: "entry"
  }, "\uD83C\uDF31 Entry"), /*#__PURE__*/React.createElement("option", {
    value: "mid"
  }, "\u26A1 Mid"), /*#__PURE__*/React.createElement("option", {
    value: "senior"
  }, "\uD83D\uDCBC Senior"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Posted Window"), /*#__PURE__*/React.createElement("select", {
    value: maxAgeDays,
    onChange: function onChange(e) {
      return setMaxAgeDays(Number(e.target.value));
    },
    className: "w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }, /*#__PURE__*/React.createElement("option", {
    value: 1
  }, "\u23F1\uFE0F 24h"), /*#__PURE__*/React.createElement("option", {
    value: 3
  }, "\uD83D\uDCC5 3 Days"), /*#__PURE__*/React.createElement("option", {
    value: 7
  }, "\uD83D\uDDD3\uFE0F 7 Days"), /*#__PURE__*/React.createElement("option", {
    value: 0
  }, "\uD83C\uDF10 All Dates"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Time (24h)"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: preferredTime,
    onChange: function onChange(e) {
      return setPreferredTime(e.target.value);
    },
    className: "w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "pt-2 flex flex-col sm:flex-row gap-2.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: saving,
    className: "flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
  }, saving ? "Saving Schedule..." : "💾 Save Daily Automation"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleSendTestEmail,
    disabled: testing,
    className: "flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
  }, testing ? "Sending..." : "⚡ Send Live Test Digest Now")))), /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl p-5 sm:p-6 border border-white/[0.08] space-y-3"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-white text-xs flex items-center justify-between pb-2.5 border-b border-white/[0.06]"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCB Active Automations"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300"
  }, activeAlerts.length, " Active")), loadingAlerts ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-6 text-xs text-slate-500"
  }, "Loading schedules...") : activeAlerts.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-lg bg-slate-900/40 border border-dashed border-slate-700 text-center text-xs text-slate-400"
  }, "No active schedules.") : /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 max-h-80 overflow-y-auto pr-1"
  }, activeAlerts.map(function (alert) {
    return /*#__PURE__*/React.createElement("div", {
      key: alert.id,
      className: "p-3 rounded-lg bg-slate-900 border border-white/[0.04] space-y-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between gap-2"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-white text-xs"
    }, alert.role), /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] text-slate-400"
    }, "\uD83D\uDCCD ", alert.location || 'Remote', " \u2022 \u23F0 ", alert.preferred_time), /*#__PURE__*/React.createElement("div", {
      className: "text-[10px] text-indigo-400"
    }, "\u2709\uFE0F ", alert.email)), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleDeleteAlert(alert.id);
      },
      className: "text-slate-500 hover:text-rose-400 text-xs p-1"
    }, "\uD83D\uDDD1\uFE0F")));
  }))));
}

// ==========================================
// Component: Admin User Management Portal
// ==========================================
function AdminPortal(_ref23) {
  var token = _ref23.token,
    user = _ref23.user,
    showToast = _ref23.showToast;
  var _useState115 = useState([]),
    _useState116 = _slicedToArray(_useState115, 2),
    users = _useState116[0],
    setUsers = _useState116[1];
  var _useState117 = useState(true),
    _useState118 = _slicedToArray(_useState117, 2),
    loading = _useState118[0],
    setLoading = _useState118[1];
  var _useState119 = useState(""),
    _useState120 = _slicedToArray(_useState119, 2),
    newEmail = _useState120[0],
    setNewEmail = _useState120[1];
  var _useState121 = useState(""),
    _useState122 = _slicedToArray(_useState121, 2),
    newPassword = _useState122[0],
    setNewPassword = _useState122[1];
  var _useState123 = useState("user"),
    _useState124 = _slicedToArray(_useState123, 2),
    newRole = _useState124[0],
    setNewRole = _useState124[1];
  var _useState125 = useState(false),
    _useState126 = _slicedToArray(_useState125, 2),
    creating = _useState126[0],
    setCreating = _useState126[1];
  var fetchUsers = /*#__PURE__*/function () {
    var _ref24 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15() {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee15$(_context15) {
        while (1) switch (_context15.prev = _context15.next) {
          case 0:
            _context15.prev = 0;
            setLoading(true);
            _context15.next = 4;
            return fetch("".concat(API_BASE_URL, "/api/v1/admin/users"), {
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 4:
            res = _context15.sent;
            _context15.next = 7;
            return res.json();
          case 7:
            data = _context15.sent;
            if (res.ok) {
              setUsers(data || []);
            } else {
              showToast(data.detail || "Failed to load users", "error");
            }
            _context15.next = 14;
            break;
          case 11:
            _context15.prev = 11;
            _context15.t0 = _context15["catch"](0);
            showToast(_context15.t0.message, "error");
          case 14:
            _context15.prev = 14;
            setLoading(false);
            return _context15.finish(14);
          case 17:
          case "end":
            return _context15.stop();
        }
      }, _callee15, null, [[0, 11, 14, 17]]);
    }));
    return function fetchUsers() {
      return _ref24.apply(this, arguments);
    };
  }();
  useEffect(function () {
    fetchUsers();
  }, []);
  var handleCreateUser = /*#__PURE__*/function () {
    var _ref25 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee16(e) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee16$(_context16) {
        while (1) switch (_context16.prev = _context16.next) {
          case 0:
            e.preventDefault();
            setCreating(true);
            _context16.prev = 2;
            _context16.next = 5;
            return fetch("".concat(API_BASE_URL, "/api/v1/admin/users"), {
              method: "POST",
              headers: {
                'Authorization': "Bearer ".concat(token),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: newEmail,
                password: newPassword,
                role: newRole
              })
            });
          case 5:
            res = _context16.sent;
            _context16.next = 8;
            return res.json();
          case 8:
            data = _context16.sent;
            if (res.ok) {
              showToast("User '".concat(newEmail, "' created!"));
              setNewEmail("");
              setNewPassword("");
              setNewRole("user");
              fetchUsers();
            } else {
              showToast(data.detail || "Failed to create user", "error");
            }
            _context16.next = 15;
            break;
          case 12:
            _context16.prev = 12;
            _context16.t0 = _context16["catch"](2);
            showToast(_context16.t0.message, "error");
          case 15:
            _context16.prev = 15;
            setCreating(false);
            return _context16.finish(15);
          case 18:
          case "end":
            return _context16.stop();
        }
      }, _callee16, null, [[2, 12, 15, 18]]);
    }));
    return function handleCreateUser(_x9) {
      return _ref25.apply(this, arguments);
    };
  }();
  var handleToggleStatus = /*#__PURE__*/function () {
    var _ref26 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee17(userId) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee17$(_context17) {
        while (1) switch (_context17.prev = _context17.next) {
          case 0:
            _context17.prev = 0;
            _context17.next = 3;
            return fetch("".concat(API_BASE_URL, "/api/v1/admin/users/").concat(userId, "/status"), {
              method: "PATCH",
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 3:
            res = _context17.sent;
            _context17.next = 6;
            return res.json();
          case 6:
            data = _context17.sent;
            if (res.ok) {
              showToast(data.message);
              fetchUsers();
            } else {
              showToast(data.detail || "Status toggle failed", "error");
            }
            _context17.next = 13;
            break;
          case 10:
            _context17.prev = 10;
            _context17.t0 = _context17["catch"](0);
            showToast(_context17.t0.message, "error");
          case 13:
          case "end":
            return _context17.stop();
        }
      }, _callee17, null, [[0, 10]]);
    }));
    return function handleToggleStatus(_x10) {
      return _ref26.apply(this, arguments);
    };
  }();
  var handleDeleteUser = /*#__PURE__*/function () {
    var _ref27 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee18(userId) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee18$(_context18) {
        while (1) switch (_context18.prev = _context18.next) {
          case 0:
            if (confirm("Are you sure you want to delete this user?")) {
              _context18.next = 2;
              break;
            }
            return _context18.abrupt("return");
          case 2:
            _context18.prev = 2;
            _context18.next = 5;
            return fetch("".concat(API_BASE_URL, "/api/v1/admin/users/").concat(userId), {
              method: "DELETE",
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 5:
            res = _context18.sent;
            _context18.next = 8;
            return res.json();
          case 8:
            data = _context18.sent;
            if (res.ok) {
              showToast(data.message);
              fetchUsers();
            } else {
              showToast(data.detail || "Delete user failed", "error");
            }
            _context18.next = 15;
            break;
          case 12:
            _context18.prev = 12;
            _context18.t0 = _context18["catch"](2);
            showToast(_context18.t0.message, "error");
          case 15:
          case "end":
            return _context18.stop();
        }
      }, _callee18, null, [[2, 12]]);
    }));
    return function handleDeleteUser(_x11) {
      return _ref27.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl p-5 border border-white/[0.08]"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-base font-bold text-white mb-3"
  }, "\uD83D\uDEE1\uFE0F Admin User Control"), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleCreateUser,
    className: "grid grid-cols-1 sm:grid-cols-4 gap-3"
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    placeholder: "User email",
    value: newEmail,
    onChange: function onChange(e) {
      return setNewEmail(e.target.value);
    },
    className: "px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    placeholder: "Initial password",
    value: newPassword,
    onChange: function onChange(e) {
      return setNewPassword(e.target.value);
    },
    className: "px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
  }), /*#__PURE__*/React.createElement("select", {
    value: newRole,
    onChange: function onChange(e) {
      return setNewRole(e.target.value);
    },
    className: "px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
  }, /*#__PURE__*/React.createElement("option", {
    value: "user"
  }, "Standard User"), /*#__PURE__*/React.createElement("option", {
    value: "admin"
  }, "Administrator")), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: creating,
    className: "py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
  }, creating ? "Creating..." : "➕ Create Account"))), /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl overflow-hidden border border-white/[0.08]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 border-b border-white/[0.06] flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-white text-xs"
  }, "Registered Accounts (", users.length, ")"), /*#__PURE__*/React.createElement("button", {
    onClick: fetchUsers,
    className: "text-xs text-indigo-400 hover:underline"
  }, "Refresh")), /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-left text-xs"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "bg-slate-900 text-slate-400 border-b border-white/[0.06]"
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "py-2.5 px-4"
  }, "Email"), /*#__PURE__*/React.createElement("th", {
    className: "py-2.5 px-4"
  }, "Role"), /*#__PURE__*/React.createElement("th", {
    className: "py-2.5 px-4"
  }, "Status"), /*#__PURE__*/React.createElement("th", {
    className: "py-2.5 px-4 text-right"
  }, "Actions"))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-white/[0.04]"
  }, users.map(function (u) {
    return /*#__PURE__*/React.createElement("tr", {
      key: u.id,
      className: "hover:bg-white/[0.01]"
    }, /*#__PURE__*/React.createElement("td", {
      className: "py-2.5 px-4 text-slate-200"
    }, u.email), /*#__PURE__*/React.createElement("td", {
      className: "py-2.5 px-4 text-slate-400"
    }, u.role), /*#__PURE__*/React.createElement("td", {
      className: "py-2.5 px-4"
    }, /*#__PURE__*/React.createElement("span", {
      className: "px-1.5 py-0.5 rounded text-[10px] ".concat(u.is_active ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300')
    }, u.is_active ? 'ACTIVE' : 'DEACTIVATED')), /*#__PURE__*/React.createElement("td", {
      className: "py-2.5 px-4 text-right space-x-2"
    }, u.id !== user.id && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleToggleStatus(u.id);
      },
      className: "text-slate-400 hover:text-white text-[11px]"
    }, u.is_active ? 'Deactivate' : 'Activate'), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleDeleteUser(u.id);
      },
      className: "text-rose-400 hover:underline text-[11px]"
    }, "Delete"))));
  }))))));
}

// Mount React Root
var root = ReactDOM.createRoot(document.getElementById('root'));
root.render( /*#__PURE__*/React.createElement(App, null));