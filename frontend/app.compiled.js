"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
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
  if (!dateStr) return true;
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

// ==========================================
// Main App Component
// ==========================================
function App() {
  // Auth State
  var _useState = useState(function () {
      return localStorage.getItem("jobagent_auth_token") || "";
    }),
    _useState2 = _slicedToArray(_useState, 2),
    token = _useState2[0],
    setToken = _useState2[1];
  var _useState3 = useState(function () {
      try {
        return JSON.parse(localStorage.getItem("jobagent_user") || "null");
      } catch (_unused2) {
        return null;
      }
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    currentUser = _useState4[0],
    setCurrentUser = _useState4[1];

  // Active Navigation Tab: 'search' | 'alerts' | 'admin'
  var _useState5 = useState('search'),
    _useState6 = _slicedToArray(_useState5, 2),
    activeTab = _useState6[0],
    setActiveTab = _useState6[1];

  // Notification / Toast
  var _useState7 = useState(null),
    _useState8 = _slicedToArray(_useState7, 2),
    toast = _useState8[0],
    setToast = _useState8[1];
  var showToast = function showToast(message) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'success';
    setToast({
      message: message,
      type: type
    });
    setTimeout(function () {
      return setToast(null);
    }, 4500);
  };

  // Verify token on initial load
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
  };
  var handleLogout = function handleLogout() {
    setToken("");
    setCurrentUser(null);
    localStorage.removeItem("jobagent_auth_token");
    localStorage.removeItem("jobagent_user");
    setActiveTab('search');
  };

  // If not authenticated, render Login Screen
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
    onLogout: handleLogout
  }), toast && /*#__PURE__*/React.createElement("div", {
    className: "fixed bottom-6 right-6 z-50 animate-bounce"
  }, /*#__PURE__*/React.createElement("div", {
    className: "px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 border text-sm font-medium ".concat(toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200')
  }, /*#__PURE__*/React.createElement("span", null, toast.type === 'error' ? '❌' : '✅'), /*#__PURE__*/React.createElement("span", null, toast.message))), /*#__PURE__*/React.createElement("main", {
    className: "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
  }, activeTab === 'search' && /*#__PURE__*/React.createElement(JobSearchDashboard, {
    token: token,
    user: currentUser,
    showToast: showToast
  }), activeTab === 'alerts' && /*#__PURE__*/React.createElement(EmailAlertsView, {
    token: token,
    user: currentUser,
    showToast: showToast
  }), activeTab === 'admin' && currentUser.role === 'admin' && /*#__PURE__*/React.createElement(AdminPortal, {
    token: token,
    user: currentUser,
    showToast: showToast
  })), /*#__PURE__*/React.createElement("footer", {
    className: "border-t border-white/5 py-6 text-center text-xs text-slate-500"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("p", null, "\xA9 2026 JobAgent AI. Multi-Platform Autonomous Job Pipeline & Deduplicator."), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("span", {
    className: "inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
  }), /*#__PURE__*/React.createElement("span", null, "FastAPI + Mistral AI + React + Tailwind")))));
}

// ==========================================
// Component: Login Screen
// ==========================================
function LoginScreen(_ref) {
  var onLoginSuccess = _ref.onLoginSuccess;
  var _useState9 = useState(""),
    _useState10 = _slicedToArray(_useState9, 2),
    email = _useState10[0],
    setEmail = _useState10[1];
  var _useState11 = useState(""),
    _useState12 = _slicedToArray(_useState11, 2),
    password = _useState12[0],
    setPassword = _useState12[1];
  var _useState13 = useState(false),
    _useState14 = _slicedToArray(_useState13, 2),
    loading = _useState14[0],
    setLoading = _useState14[1];
  var _useState15 = useState(""),
    _useState16 = _slicedToArray(_useState15, 2),
    error = _useState16[0],
    setError = _useState16[1];
  var handleSubmit = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(e) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            e.preventDefault();
            setError("");
            if (API_BASE_URL) {
              _context.next = 5;
              break;
            }
            setError("Backend URL not configured in .env (VITE_BACKEND_URL is empty).");
            return _context.abrupt("return");
          case 5:
            setLoading(true);
            _context.prev = 6;
            _context.next = 9;
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
            res = _context.sent;
            _context.next = 12;
            return res.json();
          case 12:
            data = _context.sent;
            if (res.ok) {
              _context.next = 15;
              break;
            }
            throw new Error(data.detail || "Authentication failed.");
          case 15:
            onLoginSuccess(data.access_token, data.user);
            _context.next = 21;
            break;
          case 18:
            _context.prev = 18;
            _context.t0 = _context["catch"](6);
            setError(_context.t0.message);
          case 21:
            _context.prev = 21;
            setLoading(false);
            return _context.finish(21);
          case 24:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[6, 18, 21, 24]]);
    }));
    return function handleSubmit(_x) {
      return _ref2.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 shadow-xl shadow-indigo-500/25 mb-4 animate-float"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-3xl"
  }, "\u26A1")), /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl font-extrabold tracking-tight font-outfit text-white"
  }, "JobAgent ", /*#__PURE__*/React.createElement("span", {
    className: "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400"
  }, "AI")), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-400 text-sm mt-2"
  }, "Sign in to access your curated job intelligence platform")), /*#__PURE__*/React.createElement("div", {
    className: "glass-card rounded-2xl p-8 shadow-2xl border border-white/10 relative overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"
  }), error && /*#__PURE__*/React.createElement("div", {
    className: "mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-base"
  }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 leading-relaxed"
  }, error)), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
  }, "Email Address"), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("span", {
    className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"
  }, "\u2709\uFE0F"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    value: email,
    onChange: function onChange(e) {
      return setEmail(e.target.value);
    },
    placeholder: "jobhuntadmin@gmail.com",
    className: "w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
  }, "Password"), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("span", {
    className: "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"
  }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    value: password,
    onChange: function onChange(e) {
      return setPassword(e.target.value);
    },
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    className: "w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
  }))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all transform active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center gap-2"
  }, loading ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
  }), /*#__PURE__*/React.createElement("span", null, "Authenticating...")) : /*#__PURE__*/React.createElement("span", null, "Sign In \u2192")))));
}

// ==========================================
// Component: Navigation Bar
// ==========================================
function Navbar(_ref3) {
  var user = _ref3.user,
    activeTab = _ref3.activeTab,
    setActiveTab = _ref3.setActiveTab,
    onLogout = _ref3.onLogout;
  return /*#__PURE__*/React.createElement("header", {
    className: "sticky top-0 z-40 glass-nav border-b border-white/10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 cursor-pointer",
    onClick: function onClick() {
      return setActiveTab('search');
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30 text-xl"
  }, "\u26A1"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-extrabold font-outfit text-xl text-white tracking-tight leading-none"
  }, "JobAgent ", /*#__PURE__*/React.createElement("span", {
    className: "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400"
  }, "AI")), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400 font-medium tracking-wide"
  }, "Multi-Platform Job Discovery"))), /*#__PURE__*/React.createElement("nav", {
    className: "flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-white/5"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab('search');
    },
    className: "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ".concat(activeTab === 'search' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("span", null, "Job Search")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab('alerts');
    },
    className: "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ".concat(activeTab === 'alerts' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5')
  }, /*#__PURE__*/React.createElement("span", null, "\u23F0"), /*#__PURE__*/React.createElement("span", null, "Email Alerts")), user.role === 'admin' && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab('admin');
    },
    className: "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ".concat(activeTab === 'admin' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-purple-300 hover:text-purple-200 hover:bg-purple-500/10')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDEE1\uFE0F"), /*#__PURE__*/React.createElement("span", null, "Admin Portal"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hidden sm:flex items-center gap-2.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10 text-xs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2 h-2 rounded-full bg-emerald-400"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-slate-300 font-medium"
  }, user.email), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ".concat(user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')
  }, user.role)), /*#__PURE__*/React.createElement("button", {
    onClick: onLogout,
    title: "Sign Out",
    className: "px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDEAA"), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "Logout")))));
}

// ==========================================
// Component: Job Search & Discovery Dashboard
// ==========================================
function JobSearchDashboard(_ref4) {
  var token = _ref4.token,
    user = _ref4.user,
    showToast = _ref4.showToast;
  // Form Inputs
  var _useState17 = useState("AI ML Intern"),
    _useState18 = _slicedToArray(_useState17, 2),
    role = _useState18[0],
    setRole = _useState18[1];
  var _useState19 = useState("Pune"),
    _useState20 = _slicedToArray(_useState19, 2),
    location = _useState20[0],
    setLocation = _useState20[1];
  var _useState21 = useState("intern"),
    _useState22 = _slicedToArray(_useState21, 2),
    experienceLevel = _useState22[0],
    setExperienceLevel = _useState22[1];
  var _useState23 = useState("any"),
    _useState24 = _slicedToArray(_useState23, 2),
    remotePreference = _useState24[0],
    setRemotePreference = _useState24[1];

  // Resume Profile State
  var _useState25 = useState(null),
    _useState26 = _slicedToArray(_useState25, 2),
    resumeFile = _useState26[0],
    setResumeFile = _useState26[1];
  var _useState27 = useState(null),
    _useState28 = _slicedToArray(_useState27, 2),
    resumeProfile = _useState28[0],
    setResumeProfile = _useState28[1];
  var _useState29 = useState(false),
    _useState30 = _slicedToArray(_useState29, 2),
    parsingResume = _useState30[0],
    setParsingResume = _useState30[1];

  // Search Execution State
  var _useState31 = useState(false),
    _useState32 = _slicedToArray(_useState31, 2),
    searching = _useState32[0],
    setSearching = _useState32[1];
  var _useState33 = useState(""),
    _useState34 = _slicedToArray(_useState33, 2),
    currentSearchId = _useState34[0],
    setCurrentSearchId = _useState34[1];
  var _useState35 = useState([]),
    _useState36 = _slicedToArray(_useState35, 2),
    allJobs = _useState36[0],
    setAllJobs = _useState36[1];
  var _useState37 = useState({
      total_found: 0,
      unique_count: 0
    }),
    _useState38 = _slicedToArray(_useState37, 2),
    searchStats = _useState38[0],
    setSearchStats = _useState38[1];

  // Filter Toolbar State
  var _useState39 = useState(""),
    _useState40 = _slicedToArray(_useState39, 2),
    filterKeyword = _useState40[0],
    setFilterKeyword = _useState40[1];
  var _useState41 = useState("all"),
    _useState42 = _slicedToArray(_useState41, 2),
    filterLocation = _useState42[0],
    setFilterLocation = _useState42[1];
  var _useState43 = useState("all"),
    _useState44 = _slicedToArray(_useState43, 2),
    filterWorkMode = _useState44[0],
    setFilterWorkMode = _useState44[1];
  var _useState45 = useState(0),
    _useState46 = _slicedToArray(_useState45, 2),
    minScore = _useState46[0],
    setMinScore = _useState46[1];
  var _useState47 = useState("all"),
    _useState48 = _slicedToArray(_useState47, 2),
    filterSeniority = _useState48[0],
    setFilterSeniority = _useState48[1];
  var _useState49 = useState("all"),
    _useState50 = _slicedToArray(_useState49, 2),
    filterDate = _useState50[0],
    setFilterDate = _useState50[1];
  var _useState51 = useState("all"),
    _useState52 = _slicedToArray(_useState51, 2),
    filterSource = _useState52[0],
    setFilterSource = _useState52[1];
  var _useState53 = useState("score"),
    _useState54 = _slicedToArray(_useState53, 2),
    sortBy = _useState54[0],
    setSortBy = _useState54[1];

  // RAG AI Query State
  var _useState55 = useState(false),
    _useState56 = _slicedToArray(_useState55, 2),
    ragModalOpen = _useState56[0],
    setRagModalOpen = _useState56[1];
  var _useState57 = useState(""),
    _useState58 = _slicedToArray(_useState57, 2),
    ragQuery = _useState58[0],
    setRagQuery = _useState58[1];
  var _useState59 = useState(""),
    _useState60 = _slicedToArray(_useState59, 2),
    ragAnswer = _useState60[0],
    setRagAnswer = _useState60[1];
  var _useState61 = useState(false),
    _useState62 = _slicedToArray(_useState61, 2),
    ragLoading = _useState62[0],
    setRagLoading = _useState62[1];

  // Resume Upload & Parse
  var handleResumeChange = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(e) {
      var file, formData, res, data, _data$profile$skills, s;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            file = e.target.files[0];
            if (file) {
              _context2.next = 3;
              break;
            }
            return _context2.abrupt("return");
          case 3:
            setResumeFile(file);
            setParsingResume(true);
            formData = new FormData();
            formData.append("file", file);
            _context2.prev = 7;
            _context2.next = 10;
            return fetch("".concat(API_BASE_URL, "/api/v1/search/parse-resume"), {
              method: "POST",
              body: formData
            });
          case 10:
            res = _context2.sent;
            _context2.next = 13;
            return res.json();
          case 13:
            data = _context2.sent;
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
            _context2.next = 20;
            break;
          case 17:
            _context2.prev = 17;
            _context2.t0 = _context2["catch"](7);
            showToast(_context2.t0.message, "error");
          case 20:
            _context2.prev = 20;
            setParsingResume(false);
            return _context2.finish(20);
          case 23:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[7, 17, 20, 23]]);
    }));
    return function handleResumeChange(_x2) {
      return _ref5.apply(this, arguments);
    };
  }();

  // Execute Job Search
  var handleSearchSubmit = /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(e) {
      var formData, res, data;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
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
            _context3.prev = 9;
            _context3.next = 12;
            return fetch("".concat(API_BASE_URL, "/api/v1/search"), {
              method: "POST",
              body: formData
            });
          case 12:
            res = _context3.sent;
            _context3.next = 15;
            return res.json();
          case 15:
            data = _context3.sent;
            if (res.ok && data.status === 'success') {
              setCurrentSearchId(data.search_id);
              setSearchStats({
                total_found: data.total_found || 0,
                unique_count: data.unique_count || 0
              });
              setAllJobs(data.jobs || []);
              showToast("Gathered ".concat(data.total_found, " raw postings -> ").concat(data.unique_count, " curated matching roles!"));
            } else {
              showToast(data.detail || "Search failed.", "error");
            }
            _context3.next = 22;
            break;
          case 19:
            _context3.prev = 19;
            _context3.t0 = _context3["catch"](9);
            showToast(_context3.t0.message, "error");
          case 22:
            _context3.prev = 22;
            setSearching(false);
            return _context3.finish(22);
          case 25:
          case "end":
            return _context3.stop();
        }
      }, _callee3, null, [[9, 19, 22, 25]]);
    }));
    return function handleSearchSubmit(_x3) {
      return _ref6.apply(this, arguments);
    };
  }();

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
      var isRemote = jobLoc.includes('remote') || jobLoc.includes('wfh') || jobLoc.includes('work from home') || source === 'himalayas' || jobLoc.includes('anywhere');
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
    var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(e) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            e === null || e === void 0 || e.preventDefault();
            if (!(!ragQuery.trim() || !currentSearchId)) {
              _context4.next = 3;
              break;
            }
            return _context4.abrupt("return");
          case 3:
            setRagLoading(true);
            setRagAnswer("");
            _context4.prev = 5;
            _context4.next = 8;
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
            res = _context4.sent;
            _context4.next = 11;
            return res.json();
          case 11:
            data = _context4.sent;
            if (res.ok) {
              setRagAnswer(data.answer || "No response received.");
            } else {
              setRagAnswer("Error: ".concat(data.detail || 'Could not query assistant.'));
            }
            _context4.next = 18;
            break;
          case 15:
            _context4.prev = 15;
            _context4.t0 = _context4["catch"](5);
            setRagAnswer("Error: ".concat(_context4.t0.message));
          case 18:
            _context4.prev = 18;
            setRagLoading(false);
            return _context4.finish(18);
          case 21:
          case "end":
            return _context4.stop();
        }
      }, _callee4, null, [[5, 15, 18, 21]]);
    }));
    return function handleAskAI(_x4) {
      return _ref7.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-3 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-2 glass-card rounded-2xl p-6 sm:p-7 shadow-xl border border-white/10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-6 pb-4 border-b border-white/5"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold font-outfit text-white flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFAF"), " Search & Match Preferences"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-1"
  }, "Multi-platform scraping across LinkedIn, Indeed, Freehire, Himalayas & Arbeitnow"))), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSearchSubmit,
    className: "space-y-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
  }, "Target Role / Title ", /*#__PURE__*/React.createElement("span", {
    className: "text-indigo-400"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: role,
    onChange: function onChange(e) {
      return setRole(e.target.value);
    },
    placeholder: "e.g. AI ML Intern, Full Stack Developer",
    className: "w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
  }, "Preferred Location"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: location,
    onChange: function onChange(e) {
      return setLocation(e.target.value);
    },
    placeholder: "e.g. Pune india, Bangalore, Remote",
    className: "w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
  }, "Work Mode"), /*#__PURE__*/React.createElement("select", {
    value: remotePreference,
    onChange: function onChange(e) {
      return setRemotePreference(e.target.value);
    },
    className: "w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
  }, /*#__PURE__*/React.createElement("option", {
    value: "any"
  }, "\uD83C\uDF10 Any (Remote + Onsite)"), /*#__PURE__*/React.createElement("option", {
    value: "remote"
  }, "\uD83C\uDFE0 Remote Only"), /*#__PURE__*/React.createElement("option", {
    value: "onsite"
  }, "\uD83C\uDFE2 Onsite / Hybrid Only"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
  }, "Experience Level"), /*#__PURE__*/React.createElement("select", {
    value: experienceLevel,
    onChange: function onChange(e) {
      return setExperienceLevel(e.target.value);
    },
    className: "w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
  }, "\uD83D\uDC51 Lead / Staff / Director (8+ Yrs)")))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: searching,
    className: "w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50 text-sm flex items-center justify-center gap-2"
  }, searching ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
  }), /*#__PURE__*/React.createElement("span", null, "Harvesting & Ranking Across 5 Job Platforms...")) : /*#__PURE__*/React.createElement("span", null, "\u26A1 Harvest & AI Rank Jobs Now")))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card rounded-2xl p-6 sm:p-7 shadow-xl border border-white/10 flex flex-col justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-4 pb-3 border-b border-white/5"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-white font-outfit flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCC4"), " Resume AI Matcher"), parsingResume && /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-indigo-400 animate-pulse font-medium"
  }, "Parsing...")), /*#__PURE__*/React.createElement("div", {
    className: "mb-4"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
  }, "Upload Resume (PDF / DOCX)"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".pdf,.docx,.txt",
    onChange: handleResumeChange,
    className: "block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-300 hover:file:bg-indigo-600/30 file:cursor-pointer cursor-pointer"
  })), resumeProfile ? /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-400"
  }, /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-200"
  }, "Seniority:"), " ", resumeProfile.seniority || 'Entry Level', " | ", /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-200"
  }, "Domain:"), " ", resumeProfile.core_domain || 'Tech'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
  }, "Extracted Skills:"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1"
  }, (resumeProfile.skills || []).map(function (skill, idx) {
    return /*#__PURE__*/React.createElement("span", {
      key: idx,
      className: "px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
    }, skill);
  })))) : /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-xl bg-slate-900/50 border border-dashed border-slate-700/60 text-center text-xs text-slate-500"
  }, "Upload your resume to unlock AI skill matching and personalized scoring fit!")), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400"
  }, /*#__PURE__*/React.createElement("span", null, "Protected deduplication"), /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-400 font-semibold"
  }, "100% Guaranteed")))), allJobs.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-400 font-medium"
  }, "Raw Gathered"), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-black font-outfit text-white"
  }, searchStats.total_found)), /*#__PURE__*/React.createElement("div", {
    className: "h-8 w-px bg-white/10"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-400 font-medium"
  }, "Unique Deduplicated"), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-black font-outfit text-indigo-400"
  }, searchStats.unique_count)), /*#__PURE__*/React.createElement("div", {
    className: "h-8 w-px bg-white/10"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-400 font-medium"
  }, "Filtered Showing"), /*#__PURE__*/React.createElement("div", {
    className: "text-2xl font-black font-outfit text-emerald-400"
  }, filteredJobs.length))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 w-full sm:w-auto"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setRagModalOpen(true);
    },
    className: "flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83E\uDD16"), /*#__PURE__*/React.createElement("span", null, "Ask AI (RAG Assistant)")), /*#__PURE__*/React.createElement("a", {
    href: "".concat(API_BASE_URL, "/api/v1/jobs/").concat(currentSearchId, "/export"),
    download: true,
    className: "flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCE5"), /*#__PURE__*/React.createElement("span", null, "Export CSV")))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card rounded-2xl p-5 border border-white/10 space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-400 uppercase mb-1"
  }, "Search in Results"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Company, title, skill...",
    value: filterKeyword,
    onChange: function onChange(e) {
      return setFilterKeyword(e.target.value);
    },
    className: "w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-indigo-500"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-400 uppercase mb-1"
  }, "Location"), /*#__PURE__*/React.createElement("select", {
    value: filterLocation,
    onChange: function onChange(e) {
      return setFilterLocation(e.target.value);
    },
    className: "w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
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
    className: "block text-[11px] font-semibold text-slate-400 uppercase mb-1"
  }, "Work Mode"), /*#__PURE__*/React.createElement("select", {
    value: filterWorkMode,
    onChange: function onChange(e) {
      return setFilterWorkMode(e.target.value);
    },
    className: "w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\uD83C\uDF10 Any Mode"), /*#__PURE__*/React.createElement("option", {
    value: "remote"
  }, "\uD83C\uDFE0 Remote Only"), /*#__PURE__*/React.createElement("option", {
    value: "onsite"
  }, "\uD83C\uDFE2 Onsite Only"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-400 uppercase mb-1"
  }, "Seniority"), /*#__PURE__*/React.createElement("select", {
    value: filterSeniority,
    onChange: function onChange(e) {
      return setFilterSeniority(e.target.value);
    },
    className: "w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\uD83C\uDF93 All Levels"), /*#__PURE__*/React.createElement("option", {
    value: "intern"
  }, "Internship"), /*#__PURE__*/React.createElement("option", {
    value: "junior"
  }, "Junior / Entry"), /*#__PURE__*/React.createElement("option", {
    value: "senior"
  }, "Senior / Lead"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-400 uppercase mb-1"
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
    className: "w-full accent-indigo-500 cursor-pointer"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-400 uppercase mb-1"
  }, "Sort By"), /*#__PURE__*/React.createElement("select", {
    value: sortBy,
    onChange: function onChange(e) {
      return setSortBy(e.target.value);
    },
    className: "w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-white text-xs focus:ring-1 focus:ring-indigo-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: "score"
  }, "\u2B50 Highest Match"), /*#__PURE__*/React.createElement("option", {
    value: "date"
  }, "\uD83D\uDCC5 Most Recent"))))), filteredJobs.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "glass-card rounded-2xl p-12 text-center border border-white/10 space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-4xl"
  }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-white"
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
    className: "px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
  }, "Reset All Filters")) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-5"
  }, filteredJobs.map(function (job, idx) {
    return /*#__PURE__*/React.createElement(JobCard, {
      key: job.id || idx,
      job: job,
      onQueryAI: function onQueryAI() {
        setRagQuery("Tell me about the requirements and salary for ".concat(job.title, " at ").concat(job.company));
        setRagModalOpen(true);
      }
    });
  }))), ragModalOpen && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card rounded-2xl max-w-2xl w-full p-6 border border-white/15 shadow-2xl space-y-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-white/10"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold font-outfit text-white flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83E\uDD16"), " RAG Job Intelligence Assistant"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setRagModalOpen(false);
    },
    className: "text-slate-400 hover:text-white text-xl leading-none"
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
    placeholder: "Ask anything (e.g. Which companies in Pune hire AI interns?)",
    className: "w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none pr-24"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: ragLoading || !ragQuery.trim(),
    className: "absolute right-2 top-2 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50"
  }, ragLoading ? "Asking..." : "Ask AI"))), ragAnswer && /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 text-slate-200 text-sm leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap"
  }, ragAnswer))));
}

// ==========================================
// Component: Single Job Card
// ==========================================
function JobCard(_ref8) {
  var job = _ref8.job,
    onQueryAI = _ref8.onQueryAI;
  var score = Math.round(job.match_score || 0);
  var scoreColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
  if (score >= 80) scoreColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";else if (score < 60) scoreColor = "bg-slate-500/20 text-slate-300 border-slate-500/30";

  // Salary formatting with strict N/A fallback
  var salaryDisplay = "💰 Salary: N/A";
  if (job.salary_range) {
    var minS = job.salary_range.min;
    var maxS = job.salary_range.max;
    var curr = job.salary_range.currency || "$";
    if (minS && maxS) salaryDisplay = "\uD83D\uDCB0 ".concat(curr).concat(minS.toLocaleString(), " - ").concat(maxS.toLocaleString());else if (minS) salaryDisplay = "\uD83D\uDCB0 > ".concat(curr).concat(minS.toLocaleString());
  }
  var matchingSkills = job.matching_skills || [];
  var missingSkills = job.missing_skills || [];
  return /*#__PURE__*/React.createElement("div", {
    className: "glass-card rounded-2xl p-5 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg hover:shadow-indigo-500/10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold font-outfit text-white text-base leading-snug line-clamp-2"
  }, job.title), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-1 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-semibold text-slate-300"
  }, "\uD83C\uDFE2 ", job.company || 'Unknown Company'), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCD ", job.location || 'Remote'))), /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-1 rounded-lg border font-bold text-xs shrink-0 ".concat(scoreColor)
  }, "\u2605 ", score, "% Match")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-2 text-xs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-white/5 font-medium"
  }, "\uD83D\uDD17 ", job.source || 'Aggregator'), /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-white/5 font-medium"
  }, "\uD83D\uDCBC ", job.experience_fit || 'Good Fit'), /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-white/5 font-medium"
  }, "\uD83D\uDCC5 ", job.posted_date && job.posted_date !== 'N/A' ? job.posted_date : 'Recently Listed'), /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-1 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-medium"
  }, salaryDisplay)), (matchingSkills.length > 0 || missingSkills.length > 0) && /*#__PURE__*/React.createElement("div", {
    className: "space-y-1.5 pt-1"
  }, matchingSkills.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1 items-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-emerald-400 font-semibold mr-1"
  }, "Matched:"), matchingSkills.slice(0, 4).map(function (s, idx) {
    return /*#__PURE__*/React.createElement("span", {
      key: idx,
      className: "px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/30"
    }, "\u2713 ", s);
  }))), job.match_reason && /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 italic line-clamp-2 bg-slate-900/40 p-2.5 rounded-lg border border-white/5"
  }, "\uD83D\uDCA1 ", job.match_reason)), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5 pt-3 border-t border-white/5"
  }, job.url && /*#__PURE__*/React.createElement("a", {
    href: job.url,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs text-center transition-all shadow-md shadow-indigo-600/20"
  }, "Apply Directly \u2197"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onQueryAI,
    title: "Ask AI about this role",
    className: "py-2 px-3 rounded-xl bg-slate-800 hover:bg-purple-900/40 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
  }, "\uD83E\uDD16 Ask AI")));
}

// ==========================================
// Component: Email Automation & Live Alerts
// ==========================================
function EmailAlertsView(_ref9) {
  var _resumeProfile$skills;
  var token = _ref9.token,
    user = _ref9.user,
    showToast = _ref9.showToast;
  var _useState63 = useState(user.email || ""),
    _useState64 = _slicedToArray(_useState63, 2),
    email = _useState64[0],
    setEmail = _useState64[1];
  var _useState65 = useState("AI ML Intern"),
    _useState66 = _slicedToArray(_useState65, 2),
    role = _useState66[0],
    setRole = _useState66[1];
  var _useState67 = useState("Pune"),
    _useState68 = _slicedToArray(_useState67, 2),
    location = _useState68[0],
    setLocation = _useState68[1];
  var _useState69 = useState("any"),
    _useState70 = _slicedToArray(_useState69, 2),
    workMode = _useState70[0],
    setWorkMode = _useState70[1];
  var _useState71 = useState("intern"),
    _useState72 = _slicedToArray(_useState71, 2),
    experienceLevel = _useState72[0],
    setExperienceLevel = _useState72[1];
  var _useState73 = useState(3),
    _useState74 = _slicedToArray(_useState73, 2),
    maxAgeDays = _useState74[0],
    setMaxAgeDays = _useState74[1];
  var _useState75 = useState("09:00"),
    _useState76 = _slicedToArray(_useState75, 2),
    preferredTime = _useState76[0],
    setPreferredTime = _useState76[1];

  // Optional Resume State
  var _useState77 = useState(null),
    _useState78 = _slicedToArray(_useState77, 2),
    resumeFile = _useState78[0],
    setResumeFile = _useState78[1];
  var _useState79 = useState(null),
    _useState80 = _slicedToArray(_useState79, 2),
    resumeProfile = _useState80[0],
    setResumeProfile = _useState80[1];
  var _useState81 = useState(false),
    _useState82 = _slicedToArray(_useState81, 2),
    parsingResume = _useState82[0],
    setParsingResume = _useState82[1];
  var _useState83 = useState(false),
    _useState84 = _slicedToArray(_useState83, 2),
    saving = _useState84[0],
    setSaving = _useState84[1];
  var _useState85 = useState(false),
    _useState86 = _slicedToArray(_useState85, 2),
    testing = _useState86[0],
    setTesting = _useState86[1];
  var _useState87 = useState([]),
    _useState88 = _slicedToArray(_useState87, 2),
    activeAlerts = _useState88[0],
    setActiveAlerts = _useState88[1];
  var _useState89 = useState(true),
    _useState90 = _slicedToArray(_useState89, 2),
    loadingAlerts = _useState90[0],
    setLoadingAlerts = _useState90[1];
  var fetchAlerts = /*#__PURE__*/function () {
    var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            setLoadingAlerts(true);
            _context5.next = 4;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts"), {
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 4:
            res = _context5.sent;
            _context5.next = 7;
            return res.json();
          case 7:
            data = _context5.sent;
            if (res.ok) {
              setActiveAlerts(data || []);
            }
            _context5.next = 14;
            break;
          case 11:
            _context5.prev = 11;
            _context5.t0 = _context5["catch"](0);
            console.error("Fetch alerts error:", _context5.t0);
          case 14:
            _context5.prev = 14;
            setLoadingAlerts(false);
            return _context5.finish(14);
          case 17:
          case "end":
            return _context5.stop();
        }
      }, _callee5, null, [[0, 11, 14, 17]]);
    }));
    return function fetchAlerts() {
      return _ref10.apply(this, arguments);
    };
  }();
  useEffect(function () {
    fetchAlerts();
  }, []);
  var handleResumeChange = /*#__PURE__*/function () {
    var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(e) {
      var file, formData, res, data, _data$profile$skills2, s;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            file = e.target.files[0];
            if (file) {
              _context6.next = 3;
              break;
            }
            return _context6.abrupt("return");
          case 3:
            setResumeFile(file);
            setParsingResume(true);
            formData = new FormData();
            formData.append("file", file);
            _context6.prev = 7;
            _context6.next = 10;
            return fetch("".concat(API_BASE_URL, "/api/v1/search/parse-resume"), {
              method: "POST",
              body: formData
            });
          case 10:
            res = _context6.sent;
            _context6.next = 13;
            return res.json();
          case 13:
            data = _context6.sent;
            if (res.ok && data.status === 'success') {
              setResumeProfile(data.profile);
              if (data.profile.target_roles && data.profile.target_roles[0]) {
                setRole(data.profile.target_roles[0]);
              }
              if (data.profile.seniority) {
                s = data.profile.seniority.toLowerCase();
                if (s.includes("intern")) setExperienceLevel("intern");else if (s.includes("junior") || s.includes("entry")) setExperienceLevel("entry");else if (s.includes("senior")) setExperienceLevel("senior");else if (s.includes("lead") || s.includes("staff")) setExperienceLevel("lead");else setExperienceLevel("mid");
              }
              showToast("Resume attached! Extracted ".concat(((_data$profile$skills2 = data.profile.skills) === null || _data$profile$skills2 === void 0 ? void 0 : _data$profile$skills2.length) || 0, " skills for automation matching."));
            } else {
              showToast("Resume attached (will be indexed during search).");
            }
            _context6.next = 20;
            break;
          case 17:
            _context6.prev = 17;
            _context6.t0 = _context6["catch"](7);
            showToast("Resume attached.");
          case 20:
            _context6.prev = 20;
            setParsingResume(false);
            return _context6.finish(20);
          case 23:
          case "end":
            return _context6.stop();
        }
      }, _callee6, null, [[7, 17, 20, 23]]);
    }));
    return function handleResumeChange(_x5) {
      return _ref11.apply(this, arguments);
    };
  }();
  var handleSaveAlert = /*#__PURE__*/function () {
    var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(e) {
      var formData, res, data;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
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
            _context7.prev = 11;
            _context7.next = 14;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts"), {
              method: "POST",
              headers: {
                'Authorization': "Bearer ".concat(token)
              },
              body: formData
            });
          case 14:
            res = _context7.sent;
            _context7.next = 17;
            return res.json();
          case 17:
            data = _context7.sent;
            if (res.ok) {
              showToast("Daily job automation scheduled for ".concat(email, "!"));
              fetchAlerts();
            } else {
              showToast(data.detail || "Failed to schedule alert.", "error");
            }
            _context7.next = 24;
            break;
          case 21:
            _context7.prev = 21;
            _context7.t0 = _context7["catch"](11);
            showToast(_context7.t0.message, "error");
          case 24:
            _context7.prev = 24;
            setSaving(false);
            return _context7.finish(24);
          case 27:
          case "end":
            return _context7.stop();
        }
      }, _callee7, null, [[11, 21, 24, 27]]);
    }));
    return function handleSaveAlert(_x6) {
      return _ref12.apply(this, arguments);
    };
  }();
  var handleSendTestEmail = /*#__PURE__*/function () {
    var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8() {
      var formData, res, data;
      return _regeneratorRuntime().wrap(function _callee8$(_context8) {
        while (1) switch (_context8.prev = _context8.next) {
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
            _context8.prev = 9;
            _context8.next = 12;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts/test-send"), {
              method: "POST",
              headers: {
                'Authorization': "Bearer ".concat(token)
              },
              body: formData
            });
          case 12:
            res = _context8.sent;
            _context8.next = 15;
            return res.json();
          case 15:
            data = _context8.sent;
            if (res.ok && (data.status === 'success' || data.status === 'partial')) {
              showToast("\u2705 Sent ".concat(data.jobs_sent || 0, " Jobs + 2 CSVs to ").concat(email, "!"));
            } else {
              showToast(data.detail || data.message || "Failed to send test email.", "error");
            }
            _context8.next = 22;
            break;
          case 19:
            _context8.prev = 19;
            _context8.t0 = _context8["catch"](9);
            showToast(_context8.t0.message, "error");
          case 22:
            _context8.prev = 22;
            setTesting(false);
            return _context8.finish(22);
          case 25:
          case "end":
            return _context8.stop();
        }
      }, _callee8, null, [[9, 19, 22, 25]]);
    }));
    return function handleSendTestEmail() {
      return _ref13.apply(this, arguments);
    };
  }();
  var handleDeleteAlert = /*#__PURE__*/function () {
    var _ref14 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(alertId) {
      var res;
      return _regeneratorRuntime().wrap(function _callee9$(_context9) {
        while (1) switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            _context9.next = 3;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts/").concat(alertId), {
              method: "DELETE",
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 3:
            res = _context9.sent;
            if (res.ok) {
              showToast("Alert automation removed.");
              fetchAlerts();
            } else {
              showToast("Failed to delete alert.", "error");
            }
            _context9.next = 10;
            break;
          case 7:
            _context9.prev = 7;
            _context9.t0 = _context9["catch"](0);
            showToast(_context9.t0.message, "error");
          case 10:
          case "end":
            return _context9.stop();
        }
      }, _callee9, null, [[0, 7]]);
    }));
    return function handleDeleteAlert(_x7) {
      return _ref14.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-3 gap-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-2 glass-card rounded-2xl p-6 sm:p-7 shadow-xl border border-white/10 space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold font-outfit text-white flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\u23F0"), " Automated Daily Job Digest"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-1"
  }, "Runs scheduled multi-board scrapers with deduplication and delivers matching roles with curated CSV directly to your inbox.")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSaveAlert,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
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
    className: "w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
  }, "Target Role / Title ", /*#__PURE__*/React.createElement("span", {
    className: "text-indigo-400"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: role,
    onChange: function onChange(e) {
      return setRole(e.target.value);
    },
    className: "w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
  }, "Preferred Location"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: location,
    onChange: function onChange(e) {
      return setLocation(e.target.value);
    },
    className: "w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
  }, "Work Mode"), /*#__PURE__*/React.createElement("select", {
    value: workMode,
    onChange: function onChange(e) {
      return setWorkMode(e.target.value);
    },
    className: "w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: "any"
  }, "\uD83C\uDF10 Any (Remote + Onsite)"), /*#__PURE__*/React.createElement("option", {
    value: "remote"
  }, "\uD83C\uDFE0 Remote Only"), /*#__PURE__*/React.createElement("option", {
    value: "onsite"
  }, "\uD83C\uDFE2 Onsite Only"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
  }, "Experience Level"), /*#__PURE__*/React.createElement("select", {
    value: experienceLevel,
    onChange: function onChange(e) {
      return setExperienceLevel(e.target.value);
    },
    className: "w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: "intern"
  }, "\uD83C\uDF93 Internship / Fresher"), /*#__PURE__*/React.createElement("option", {
    value: "entry"
  }, "\uD83C\uDF31 Entry Level (0-2 Yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "mid"
  }, "\u26A1 Mid Level (2-5 Yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "senior"
  }, "\uD83D\uDCBC Senior Level (5-8 Yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "lead"
  }, "\uD83D\uDC51 Lead / Staff (8+ Yrs)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
  }, "Posted Date Filter"), /*#__PURE__*/React.createElement("select", {
    value: maxAgeDays,
    onChange: function onChange(e) {
      return setMaxAgeDays(Number(e.target.value));
    },
    className: "w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: 1
  }, "\u23F1\uFE0F Past 24 Hours"), /*#__PURE__*/React.createElement("option", {
    value: 3
  }, "\uD83D\uDCC5 Past 3 Days"), /*#__PURE__*/React.createElement("option", {
    value: 7
  }, "\uD83D\uDDD3\uFE0F Past Week (7 Days)"), /*#__PURE__*/React.createElement("option", {
    value: 14
  }, "\uD83D\uDDD3\uFE0F Past 14 Days"), /*#__PURE__*/React.createElement("option", {
    value: 30
  }, "\uD83D\uDDD3\uFE0F Past Month (30 Days)"), /*#__PURE__*/React.createElement("option", {
    value: 0
  }, "\uD83C\uDF10 Any Time (All Dates)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
  }, "Daily Time (24h)"), /*#__PURE__*/React.createElement("input", {
    type: "time",
    value: preferredTime,
    onChange: function onChange(e) {
      return setPreferredTime(e.target.value);
    },
    className: "w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:ring-2 focus:ring-indigo-500"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 shadow-inner space-y-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCC4"), /*#__PURE__*/React.createElement("span", null, "Candidate Resume for Automation ", /*#__PURE__*/React.createElement("span", {
    className: "text-slate-400 font-normal lowercase"
  }, "(optional - matches skills to job description)"))), resumeFile && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      setResumeFile(null);
      setResumeProfile(null);
    },
    className: "text-xs text-rose-400 hover:text-rose-300 font-semibold underline"
  }, "\u2715 Remove")), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".pdf,.docx,.txt",
    onChange: handleResumeChange,
    className: "block w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer transition-all"
  }), parsingResume && /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-indigo-400 animate-pulse flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "inline-block w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"
  }), /*#__PURE__*/React.createElement("span", null, "Parsing resume skills for automated daily matching...")), resumeProfile && /*#__PURE__*/React.createElement("div", {
    className: "mt-2 flex flex-wrap gap-1.5 items-center text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 p-2.5 rounded-xl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, "\u2713 ", resumeFile === null || resumeFile === void 0 ? void 0 : resumeFile.name), /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-400"
  }, "\u2022 ", ((_resumeProfile$skills = resumeProfile.skills) === null || _resumeProfile$skills === void 0 ? void 0 : _resumeProfile$skills.length) || 0, " skills indexed for daily matching"))), /*#__PURE__*/React.createElement("div", {
    className: "pt-2 flex flex-col sm:flex-row gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: saving,
    className: "flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
  }, saving ? "Saving Schedule..." : "💾 Save Daily Automation"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleSendTestEmail,
    disabled: testing,
    className: "flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
  }, testing ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
  }), /*#__PURE__*/React.createElement("span", null, "Harvesting & Sending...")) : /*#__PURE__*/React.createElement("span", null, "\u26A1 Send Live Test Email & CSV Now"))))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card rounded-2xl p-6 sm:p-7 shadow-xl border border-white/10 space-y-4"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-white font-outfit flex items-center justify-between pb-3 border-b border-white/5"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCB Active Automations"), /*#__PURE__*/React.createElement("span", {
    className: "text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
  }, activeAlerts.length, " Active")), loadingAlerts ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-8 text-xs text-slate-500 animate-pulse"
  }, "Loading schedules...") : activeAlerts.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "p-6 rounded-xl bg-slate-900/50 border border-dashed border-slate-700/60 text-center text-xs text-slate-500"
  }, "No active email schedules yet. Save an alert to receive automated daily digests!") : /*#__PURE__*/React.createElement("div", {
    className: "space-y-3 max-h-96 overflow-y-auto pr-1"
  }, activeAlerts.map(function (alert) {
    return /*#__PURE__*/React.createElement("div", {
      key: alert.id,
      className: "p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between gap-2"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "font-bold text-white text-xs"
    }, alert.role), /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] text-slate-400"
    }, "\uD83D\uDCCD ", alert.location || 'Remote', " \u2022 \u23F0 ", alert.preferred_time, " \u2022 \uD83D\uDCC5 ", alert.max_age_days === 1 ? 'Past 24h' : alert.max_age_days === 0 ? 'All Dates' : "Past ".concat(alert.max_age_days || 1, "d")), /*#__PURE__*/React.createElement("div", {
      className: "text-[10px] text-indigo-400"
    }, "\u2709\uFE0F ", alert.email)), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleDeleteAlert(alert.id);
      },
      className: "text-slate-500 hover:text-rose-400 text-xs p-1",
      title: "Delete schedule"
    }, "\uD83D\uDDD1\uFE0F")));
  }))));
}

// ==========================================
// Component: Admin User Management Portal
// ==========================================
function AdminPortal(_ref15) {
  var token = _ref15.token,
    user = _ref15.user,
    showToast = _ref15.showToast;
  var _useState91 = useState([]),
    _useState92 = _slicedToArray(_useState91, 2),
    users = _useState92[0],
    setUsers = _useState92[1];
  var _useState93 = useState(true),
    _useState94 = _slicedToArray(_useState93, 2),
    loading = _useState94[0],
    setLoading = _useState94[1];

  // New User Form
  var _useState95 = useState(""),
    _useState96 = _slicedToArray(_useState95, 2),
    newEmail = _useState96[0],
    setNewEmail = _useState96[1];
  var _useState97 = useState(""),
    _useState98 = _slicedToArray(_useState97, 2),
    newPassword = _useState98[0],
    setNewPassword = _useState98[1];
  var _useState99 = useState("user"),
    _useState100 = _slicedToArray(_useState99, 2),
    newRole = _useState100[0],
    setNewRole = _useState100[1];
  var _useState101 = useState(false),
    _useState102 = _slicedToArray(_useState101, 2),
    creating = _useState102[0],
    setCreating = _useState102[1];
  var fetchUsers = /*#__PURE__*/function () {
    var _ref16 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10() {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee10$(_context10) {
        while (1) switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            setLoading(true);
            _context10.next = 4;
            return fetch("".concat(API_BASE_URL, "/api/v1/admin/users"), {
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
              setUsers(data || []);
            } else {
              showToast(data.detail || "Failed to load users", "error");
            }
            _context10.next = 14;
            break;
          case 11:
            _context10.prev = 11;
            _context10.t0 = _context10["catch"](0);
            showToast(_context10.t0.message, "error");
          case 14:
            _context10.prev = 14;
            setLoading(false);
            return _context10.finish(14);
          case 17:
          case "end":
            return _context10.stop();
        }
      }, _callee10, null, [[0, 11, 14, 17]]);
    }));
    return function fetchUsers() {
      return _ref16.apply(this, arguments);
    };
  }();
  useEffect(function () {
    fetchUsers();
  }, []);
  var handleCreateUser = /*#__PURE__*/function () {
    var _ref17 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(e) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee11$(_context11) {
        while (1) switch (_context11.prev = _context11.next) {
          case 0:
            e.preventDefault();
            setCreating(true);
            _context11.prev = 2;
            _context11.next = 5;
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
            res = _context11.sent;
            _context11.next = 8;
            return res.json();
          case 8:
            data = _context11.sent;
            if (res.ok) {
              showToast("User '".concat(newEmail, "' created successfully!"));
              setNewEmail("");
              setNewPassword("");
              setNewRole("user");
              fetchUsers();
            } else {
              showToast(data.detail || "Failed to create user", "error");
            }
            _context11.next = 15;
            break;
          case 12:
            _context11.prev = 12;
            _context11.t0 = _context11["catch"](2);
            showToast(_context11.t0.message, "error");
          case 15:
            _context11.prev = 15;
            setCreating(false);
            return _context11.finish(15);
          case 18:
          case "end":
            return _context11.stop();
        }
      }, _callee11, null, [[2, 12, 15, 18]]);
    }));
    return function handleCreateUser(_x8) {
      return _ref17.apply(this, arguments);
    };
  }();
  var handleToggleStatus = /*#__PURE__*/function () {
    var _ref18 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(userId) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee12$(_context12) {
        while (1) switch (_context12.prev = _context12.next) {
          case 0:
            _context12.prev = 0;
            _context12.next = 3;
            return fetch("".concat(API_BASE_URL, "/api/v1/admin/users/").concat(userId, "/status"), {
              method: "PATCH",
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 3:
            res = _context12.sent;
            _context12.next = 6;
            return res.json();
          case 6:
            data = _context12.sent;
            if (res.ok) {
              showToast(data.message);
              fetchUsers();
            } else {
              showToast(data.detail || "Status toggle failed", "error");
            }
            _context12.next = 13;
            break;
          case 10:
            _context12.prev = 10;
            _context12.t0 = _context12["catch"](0);
            showToast(_context12.t0.message, "error");
          case 13:
          case "end":
            return _context12.stop();
        }
      }, _callee12, null, [[0, 10]]);
    }));
    return function handleToggleStatus(_x9) {
      return _ref18.apply(this, arguments);
    };
  }();
  var handleDeleteUser = /*#__PURE__*/function () {
    var _ref19 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(userId) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee13$(_context13) {
        while (1) switch (_context13.prev = _context13.next) {
          case 0:
            if (confirm("Are you sure you want to delete this user?")) {
              _context13.next = 2;
              break;
            }
            return _context13.abrupt("return");
          case 2:
            _context13.prev = 2;
            _context13.next = 5;
            return fetch("".concat(API_BASE_URL, "/api/v1/admin/users/").concat(userId), {
              method: "DELETE",
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 5:
            res = _context13.sent;
            _context13.next = 8;
            return res.json();
          case 8:
            data = _context13.sent;
            if (res.ok) {
              showToast(data.message);
              fetchUsers();
            } else {
              showToast(data.detail || "Delete user failed", "error");
            }
            _context13.next = 15;
            break;
          case 12:
            _context13.prev = 12;
            _context13.t0 = _context13["catch"](2);
            showToast(_context13.t0.message, "error");
          case 15:
          case "end":
            return _context13.stop();
        }
      }, _callee13, null, [[2, 12]]);
    }));
    return function handleDeleteUser(_x10) {
      return _ref19.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass-card rounded-2xl p-6 sm:p-7 shadow-xl border border-white/10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-4 mb-6 border-b border-white/5"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold font-outfit text-white flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDEE1\uFE0F"), " Admin User Access Control"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-1"
  }, "Only authorized user accounts created here can log in and access the system."))), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleCreateUser,
    className: "grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-slate-900/60 p-4 rounded-xl border border-white/5"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "User Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    placeholder: "colleague@company.com",
    value: newEmail,
    onChange: function onChange(e) {
      return setNewEmail(e.target.value);
    },
    className: "w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Password"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    placeholder: "Initial password",
    value: newPassword,
    onChange: function onChange(e) {
      return setNewPassword(e.target.value);
    },
    className: "w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Assigned Role"), /*#__PURE__*/React.createElement("select", {
    value: newRole,
    onChange: function onChange(e) {
      return setNewRole(e.target.value);
    },
    className: "w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: "user"
  }, "Candidate / Standard User"), /*#__PURE__*/React.createElement("option", {
    value: "admin"
  }, "Platform Administrator"))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: creating,
    className: "w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all disabled:opacity-50"
  }, creating ? "Creating..." : "➕ Create User"))), /*#__PURE__*/React.createElement("div", {
    className: "glass-card rounded-2xl overflow-hidden border border-white/10 shadow-xl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-5 border-b border-white/5 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-white text-sm font-outfit"
  }, "Registered Accounts (", users.length, ")"), /*#__PURE__*/React.createElement("button", {
    onClick: fetchUsers,
    className: "text-xs text-indigo-400 hover:underline"
  }, "Refresh List")), /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-left text-xs"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-white/5"
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "py-3 px-4"
  }, "User Email"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 px-4"
  }, "Role"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 px-4"
  }, "Status"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 px-4"
  }, "Created Date"), /*#__PURE__*/React.createElement("th", {
    className: "py-3 px-4 text-right"
  }, "Actions"))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-white/5"
  }, users.map(function (u) {
    return /*#__PURE__*/React.createElement("tr", {
      key: u.id,
      className: "hover:bg-white/[0.02]"
    }, /*#__PURE__*/React.createElement("td", {
      className: "py-3 px-4 font-semibold text-slate-200"
    }, u.email), /*#__PURE__*/React.createElement("td", {
      className: "py-3 px-4"
    }, /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 rounded text-[10px] font-bold uppercase ".concat(u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-700/50 text-slate-300')
    }, u.role)), /*#__PURE__*/React.createElement("td", {
      className: "py-3 px-4"
    }, /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 rounded text-[10px] font-bold ".concat(u.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300')
    }, u.is_active ? 'ACTIVE' : 'DEACTIVATED')), /*#__PURE__*/React.createElement("td", {
      className: "py-3 px-4 text-slate-400"
    }, u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'), /*#__PURE__*/React.createElement("td", {
      className: "py-3 px-4 text-right space-x-2"
    }, u.id !== user.id && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleToggleStatus(u.id);
      },
      className: "px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
    }, u.is_active ? 'Deactivate' : 'Activate'), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleDeleteUser(u.id);
      },
      className: "px-2.5 py-1 rounded bg-rose-900/30 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-[11px]"
    }, "Delete"))));
  }))))));
}

// Mount React Root
var root = ReactDOM.createRoot(document.getElementById('root'));
root.render( /*#__PURE__*/React.createElement(App, null));