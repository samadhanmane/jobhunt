"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
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
  if (!dateStr || days === 0 || days === 'all') return true;
  var str = String(dateStr).toLowerCase().trim();
  if (str.includes("today") || str.includes("just") || str.includes("hour") || str.includes("minute")) return true;
  if (days >= 1 && str.includes("yesterday")) return true;
  if (str.includes("day ago") || str.includes("days ago")) {
    var match = str.match(/(\d+)\s*day/);
    if (match) {
      return parseInt(match[1]) <= days;
    }
  }
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
    return diffMs / (1000 * 60 * 60 * 24) <= days + 0.5;
  } catch (_unused) {
    return true;
  }
}
function getJobExperienceBadge(job) {
  if (!job) return "🌱 Internship (0 Yrs)";
  var title = (job.title || "").toLowerCase();
  var desc = (job.description || "").toLowerCase();
  var fit = (job.experience_fit || "").toLowerCase();
  var req = (job.experience_required || "").toLowerCase();
  var minYears = typeof job.min_experience_years === 'number' ? job.min_experience_years : -1;

  // 1. True Intern
  if (title.includes('intern') || title.includes('internship') || title.includes('trainee') || title.includes('apprentice') || title.includes('co-op') || title.includes('student') || fit.includes('intern') || req.includes('intern')) {
    return "🌱 Internship (0 Yrs)";
  }

  // 2. Senior / Lead / Principal
  if (title.includes('principal') || title.includes('staff') || title.includes('director') || title.includes('architect') || title.includes('head of') || minYears >= 8 || req.includes('8+')) {
    return "🏆 Lead / Principal (8+ Yrs)";
  }
  if (title.includes('senior') || title.includes('sr.') || title.includes('sr ') || title.includes('lead') || minYears >= 5 || req.includes('5+') || fit.includes('senior')) {
    return "👑 Senior (5+ Yrs)";
  }

  // 3. Entry / Fresher
  if (title.includes('entry level') || title.includes('fresher') || title.includes('new grad') || title.includes('graduate') || req.includes('0-1') || minYears === 0 || minYears === 1) {
    return "🚀 Entry Level (0–1 Yr)";
  }

  // 4. Junior
  if (title.includes('junior') || title.includes('jr.') || title.includes('associate') || req.includes('1-2') || minYears === 2 || fit.includes('junior')) {
    return "⚡ Junior (1–2 Yrs)";
  }

  // 5. Mid Level
  if (minYears >= 3 && minYears <= 5) {
    return "\uD83D\uDCBC Mid-Level (".concat(minYears, " Yrs)");
  }
  return job.experience_required || "💼 Mid-Level (2–4 Yrs)";
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
// Smart Location NLP Aliases & Hierarchy Engine
// ==========================================
var LOCATION_HIERARCHY_MAP = {
  'india': {
    countryAliases: ['india', 'in', 'bharat', 'south asia'],
    cities: ['pune', 'bangalore', 'bengaluru', 'mumbai', 'bombay', 'delhi', 'new delhi', 'hyderabad', 'secunderabad', 'noida', 'gurgaon', 'gurugram', 'chennai', 'madras', 'kolkata', 'ahmedabad', 'jaipur', 'indore', 'chandigarh', 'mohali', 'kochi', 'cochin', 'trivandrum', 'coimbatore', 'nagpur', 'bhopal', 'visakhapatnam', 'vizag', 'mysore', 'mysuru', 'bhubaneswar', 'surat', 'vadodara', 'lucknow', 'kanpur', 'patna', 'ncr', 'hinjawadi', 'kharadi', 'magarpatta', 'whitefield', 'electronic city', 'cyberabad', 'hitec city'],
    states: ['maharashtra', 'karnataka', 'telangana', 'tamil nadu', 'tamilnadu', 'delhi ncr', 'uttar pradesh', 'haryana', 'west bengal', 'gujarat', 'rajasthan', 'kerala', 'madhya pradesh', 'punjab', 'andhra pradesh', 'odisha']
  },
  'usa': {
    countryAliases: ['united states', 'usa', 'us', 'u.s.', 'u.s.a.', 'america', 'north america'],
    cities: ['san francisco', 'sf', 'san jose', 'palo alto', 'mountain view', 'sunnyvale', 'santa clara', 'cupertino', 'menlo park', 'redwood city', 'fremont', 'berkeley', 'oakland', 'san mateo', 'bay area', 'silicon valley', 'los angeles', 'la', 'san diego', 'irvine', 'new york', 'nyc', 'manhattan', 'brooklyn', 'austin', 'dallas', 'houston', 'san antonio', 'seattle', 'bellevue', 'redmond', 'boston', 'cambridge', 'chicago', 'denver', 'boulder', 'atlanta', 'raleigh', 'durham', 'charlotte', 'portland', 'phoenix', 'salt lake city', 'washington dc', 'dc', 'philadelphia', 'minneapolis', 'miami', 'tampa', 'pittsburgh'],
    states: ['california', 'ca', 'new york', 'ny', 'texas', 'tx', 'washington', 'wa', 'massachusetts', 'ma', 'illinois', 'il', 'colorado', 'co', 'georgia', 'ga', 'north carolina', 'nc', 'oregon', 'or', 'florida', 'fl', 'arizona', 'az', 'utah', 'ut', 'virginia', 'va', 'maryland', 'md', 'pennsylvania', 'pa', 'ohio', 'oh', 'michigan', 'mi', 'minnesota', 'mn', 'new jersey', 'nj']
  },
  'uk': {
    countryAliases: ['united kingdom', 'uk', 'great britain', 'gb', 'england', 'scotland', 'wales', 'northern ireland'],
    cities: ['london', 'manchester', 'birmingham', 'edinburgh', 'glasgow', 'cambridge', 'oxford', 'bristol', 'leeds', 'belfast', 'sheffield', 'newcastle', 'nottingham', 'liverpool', 'reading', 'southampton', 'cardiff'],
    states: ['england', 'scotland', 'wales', 'greater london']
  },
  'germany': {
    countryAliases: ['germany', 'deutschland', 'de'],
    cities: ['berlin', 'munich', 'münchen', 'frankfurt', 'frankfurt am main', 'hamburg', 'cologne', 'köln', 'stuttgart', 'düsseldorf', 'dusseldorf', 'leipzig', 'dortmund', 'essen', 'bremen', 'dresden', 'nuremberg', 'nürnberg', 'karlsruhe'],
    states: ['bavaria', 'bayern', 'berlin', 'hessen', 'baden-württemberg', 'north rhine-westphalia']
  },
  'canada': {
    countryAliases: ['canada', 'ca'],
    cities: ['toronto', 'vancouver', 'montreal', 'ottawa', 'calgary', 'edmonton', 'waterloo', 'kitchener', 'quebec city', 'halifax', 'winnipeg', 'victoria'],
    states: ['ontario', 'on', 'british columbia', 'bc', 'quebec', 'qc', 'alberta', 'ab']
  },
  'australia': {
    countryAliases: ['australia', 'au', 'australasia'],
    cities: ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra', 'gold coast'],
    states: ['nsw', 'new south wales', 'victoria', 'vic', 'queensland', 'qld', 'wa', 'western australia']
  },
  'netherlands': {
    countryAliases: ['netherlands', 'holland', 'nl'],
    cities: ['amsterdam', 'rotterdam', 'the hague', 'utrecht', 'eindhoven', 'groningen'],
    states: ['north holland', 'south holland']
  },
  'singapore': {
    countryAliases: ['singapore', 'sg'],
    cities: ['singapore'],
    states: []
  },
  'uae': {
    countryAliases: ['united arab emirates', 'uae', 'emirates'],
    cities: ['dubai', 'abu dhabi', 'sharjah'],
    states: ['dubai', 'abu dhabi']
  },
  'europe': {
    countryAliases: ['europe', 'eu', 'emea'],
    cities: ['berlin', 'munich', 'london', 'paris', 'amsterdam', 'dublin', 'madrid', 'barcelona', 'zurich', 'stockholm', 'warsaw', 'vienna', 'brussels'],
    states: []
  }
};
var RESTRICTION_PATTERNS = {
  us_only: ['us only', 'usa only', 'u.s. only', 'united states only', 'must reside in the us', 'must be located in the us', 'us citizens only', 'authorized to work in the us', 'us based', 'us timezones', 'north america only', 'remote - us', 'remote (us)', 'remote, us', 'remote - usa', 'remote (usa)', 'remote, usa'],
  eu_only: ['eu only', 'europe only', 'emea only', 'must reside in europe', 'germany only', 'uk only', 'united kingdom only', 'must be in uk', 'must be in germany', 'remote - europe', 'remote (eu)', 'remote, uk', 'remote - uk'],
  india_only: ['india only', 'must reside in india', 'india based', 'remote - india', 'remote (india)', 'remote, in', 'remote - in']
};

// ==========================================
// Comprehensive Foreign Locations Database for Zero-Leakage Filtering
// ==========================================
var FOREIGN_LOCATIONS_LIST = [
// Countries & Regions
'canada', 'brazil', 'colombia', 'uruguay', 'germany', 'deutschland', 'south africa', 'austria', 'united states', 'usa', 'u.s.', 'u.s.a.', 'uk', 'united kingdom', 'england', 'great britain', 'australia', 'netherlands', 'holland', 'singapore', 'uae', 'dubai', 'france', 'spain', 'italy', 'japan', 'latam', 'latin america', 'mexico', 'argentina', 'chile', 'peru', 'el salvador', 'nicaragua', 'costa rica', 'sweden', 'switzerland', 'poland', 'ireland', 'denmark', 'norway', 'finland', 'belgium', 'portugal', 'greece', 'czech', 'romania', 'hungary', 'new zealand', 'philippines', 'indonesia', 'vietnam', 'malaysia', 'thailand', 'taiwan', 'south korea', 'korea', 'egypt', 'israel', 'saudi',
// Major Foreign Cities & Tech Hubs
'san francisco', 'sf', 'san jose', 'palo alto', 'mountain view', 'sunnyvale', 'santa clara', 'cupertino', 'menlo park', 'redwood city', 'fremont', 'berkeley', 'oakland', 'san mateo', 'bay area', 'silicon valley', 'los angeles', 'la', 'san diego', 'irvine', 'new york', 'nyc', 'manhattan', 'brooklyn', 'austin', 'dallas', 'houston', 'san antonio', 'seattle', 'bellevue', 'redmond', 'boston', 'cambridge', 'chicago', 'denver', 'boulder', 'atlanta', 'raleigh', 'durham', 'charlotte', 'portland', 'phoenix', 'salt lake city', 'washington dc', 'philadelphia', 'minneapolis', 'miami', 'tampa', 'pittsburgh', 'london', 'manchester', 'birmingham', 'edinburgh', 'glasgow', 'oxford', 'bristol', 'leeds', 'belfast', 'berlin', 'munich', 'münchen', 'frankfurt', 'hamburg', 'cologne', 'köln', 'stuttgart', 'düsseldorf', 'dusseldorf', 'leipzig', 'toronto', 'vancouver', 'montreal', 'ottawa', 'calgary', 'edmonton', 'waterloo', 'sydney', 'melbourne', 'brisbane', 'perth', 'paris', 'madrid', 'barcelona', 'amsterdam', 'rotterdam', 'utrecht', 'dublin', 'zurich', 'stockholm', 'tokyo', 'seoul', 'beijing', 'shanghai', 'singapore', 'sao paulo', 'buenos aires', 'bogota', 'cape town', 'johannesburg', 'auckland', 'vienna', 'warsaw', 'lisbon', 'brussels'];
function matchesLocationNLP() {
  var locQuery = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  var jobLoc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var desc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
  var source = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
  var q = (locQuery || "").toLowerCase().trim();
  if (!q || q === 'worldwide' || q === 'global' || q === 'all' || q === 'any' || q === '') return true;
  var jLoc = (jobLoc || "").toLowerCase();
  var jDesc = (desc || "").slice(0, 800).toLowerCase();
  var combined = "".concat(jLoc, " ").concat(jDesc);
  var isRemote = jLoc.includes('remote') || jLoc.includes('wfh') || jLoc.includes('work from home') || jLoc.includes('anywhere') || jLoc.includes('worldwide') || jLoc.includes('virtual') || jLoc.includes('distributed');
  if (q === 'remote') {
    return isRemote;
  }

  // Check if the job explicitly mentions a foreign country or foreign city
  var hasForeignLocation = FOREIGN_LOCATIONS_LIST.some(function (loc) {
    return jLoc.includes(loc);
  });

  // 1. Check for specific Indian cities
  var METRO_MAP = {
    pune: ['pune', 'hinjawadi', 'kharadi', 'magarpatta', 'hadapsar', 'baner', 'wakad'],
    bangalore: ['bangalore', 'bengaluru', 'whitefield', 'electronic city', 'bellandur', 'koramangala'],
    bengaluru: ['bangalore', 'bengaluru', 'whitefield', 'electronic city', 'bellandur', 'koramangala'],
    mumbai: ['mumbai', 'bombay', 'navi mumbai', 'thane', 'andheri', 'powai'],
    hyderabad: ['hyderabad', 'secunderabad', 'hitec city', 'cyberabad', 'gachibowli'],
    delhi: ['delhi', 'new delhi', 'noida', 'gurgaon', 'gurugram', 'faridabad', 'ghaziabad', 'ncr'],
    noida: ['noida', 'greater noida', 'delhi', 'ncr'],
    gurgaon: ['gurgaon', 'gurugram', 'delhi', 'ncr'],
    gurugram: ['gurgaon', 'gurugram', 'delhi', 'ncr'],
    chennai: ['chennai', 'madras'],
    kolkata: ['kolkata', 'calcutta'],
    ahmedabad: ['ahmedabad'],
    indore: ['indore'],
    jaipur: ['jaipur'],
    kochi: ['kochi', 'cochin', 'kerala']
  };
  for (var _i = 0, _Object$entries = Object.entries(METRO_MAP); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      cityKey = _Object$entries$_i[0],
      subTerms = _Object$entries$_i[1];
    if (q.includes(cityKey)) {
      // User requested this specific city!
      var matchesCity = subTerms.some(function (term) {
        return jLoc.includes(term) || combined.includes(term);
      });
      if (matchesCity) return true;
      // Reject other cities and general remote
      return false;
    }
  }

  // 2. Broad India filter
  if (q === 'india' || q.includes('india')) {
    var indiaTerms = ['india', 'pune', 'bangalore', 'bengaluru', 'mumbai', 'hyderabad', 'delhi', 'noida', 'gurgaon', 'gurugram', 'chennai', 'kolkata', 'ahmedabad', 'indore', 'jaipur', 'kochi', 'kerala', 'chandigarh', 'nagpur', 'bhopal', 'coimbatore', 'maharashtra', 'karnataka', 'telangana', 'tamil nadu'];
    if (indiaTerms.some(function (term) {
      return jLoc.includes(term);
    })) {
      return true;
    }
    if (hasForeignLocation && !jLoc.includes('india') && !jLoc.includes('worldwide') && !jLoc.includes('anywhere')) {
      return false;
    }
    if (RESTRICTION_PATTERNS.us_only.some(function (p) {
      return combined.includes(p);
    })) return false;
    if (RESTRICTION_PATTERNS.eu_only.some(function (p) {
      return combined.includes(p);
    })) return false;
    if (isRemote && (jLoc.includes('worldwide') || jLoc.includes('anywhere') || jLoc.includes('global') || !hasForeignLocation)) {
      return true;
    }
    return false;
  }

  // 3. Other regions or cities
  if (jLoc.includes(q)) return true;
  var tokens = q.split(/[,/\s-]+/).filter(function (t) {
    return t.length > 2;
  });
  if (tokens.length > 0 && tokens.some(function (t) {
    return jLoc.includes(t);
  })) {
    return true;
  }
  if (isRemote && (jLoc.includes('worldwide') || jLoc.includes('anywhere') || jLoc.includes('global'))) {
    return true;
  }
  return false;
}

// ==========================================
// Reusable CSV Export Utility
// ==========================================
function generateJobsCSV() {
  var jobsList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var scopeLabel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Curated Matches";
  var filenamePrefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "jobhunt_jobs";
  if (!jobsList || jobsList.length === 0) {
    return false;
  }
  var headers = ["Job ID", "Scope", "Applied Status", "Applied Date", "Job Title", "Company Name", "Location", "Work Mode", "Date Posted", "Source Platform", "Application URL", "Match Score (%)", "Experience Required", "Min Experience Years", "Seniority Level", "Experience Fit", "Matching Skills", "Missing Skills", "Salary Min", "Salary Max", "Salary Currency", "Key Requirements", "HR Contacts Found", "HR Emails", "Tech Contacts Found", "Tech Emails", "Cold Outreach Email Draft", "LinkedIn Connection Note Draft", "Company Insights JSON", "Full Job Description"];
  var escapeCSV = function escapeCSV(field) {
    if (field === null || field === undefined) return '""';
    var str = String(field);
    return "\"".concat(str.replace(/"/g, '""'), "\"");
  };
  var rows = jobsList.map(function (j) {
    var _j$min_experience_yea, _j$salary_range$min, _j$salary_range, _j$salary_range$max, _j$salary_range2, _j$salary_range3;
    var loc = (j.location || "").toLowerCase();
    var workMode = "Onsite";
    if (loc.includes("remote") || loc.includes("wfh") || loc.includes("work from home") || j.source === "himalayas" || j.source === "jobicy" || j.source === "remoteok") {
      workMode = "Remote";
    } else if (loc.includes("hybrid") || (j.description || "").toLowerCase().includes("hybrid")) {
      workMode = "Hybrid";
    }
    var matchingSkillsStr = (j.matching_skills || []).join(", ");
    var missingSkillsStr = (j.missing_skills || []).join(", ");
    var hrContacts = (j.hr_contacts || []).map(function (c) {
      return "".concat(c.full_name, " (").concat(c.headline || 'HR/Talent', ")");
    }).join(" | ");
    var hrEmails = (j.hr_contacts || []).map(function (c) {
      return c.email;
    }).filter(Boolean).join(" | ");
    var techContacts = (j.tech_contacts || []).map(function (c) {
      return "".concat(c.full_name, " (").concat(c.headline || 'Engineering', ")");
    }).join(" | ");
    var techEmails = (j.tech_contacts || []).map(function (c) {
      return c.email;
    }).filter(Boolean).join(" | ");
    var coldEmail = "";
    var linkedinNote = "";
    var sampleContact = j.hr_contacts && j.hr_contacts[0] || j.tech_contacts && j.tech_contacts[0];
    if (sampleContact && sampleContact.outreach_draft) {
      coldEmail = "Subject: ".concat(sampleContact.outreach_draft.email_subject || '', "\n\n").concat(sampleContact.outreach_draft.email_body || '');
      linkedinNote = sampleContact.outreach_draft.inmail_message || "";
    }
    var insights = j.company_insights ? JSON.stringify(j.company_insights) : "";
    var isAppliedStr = j.applied_at ? "Applied" : "Not Applied";
    var appliedDateStr = j.applied_at ? new Date(j.applied_at).toLocaleString() : "";
    return [escapeCSV(j.id || ""), escapeCSV(scopeLabel), escapeCSV(isAppliedStr), escapeCSV(appliedDateStr), escapeCSV(j.title || ""), escapeCSV(j.company || ""), escapeCSV(j.location || "Remote"), escapeCSV(workMode), escapeCSV(j.posted_date || ""), escapeCSV(j.source || ""), escapeCSV(j.url || ""), escapeCSV(j.match_score != null ? "".concat(Math.round(j.match_score), "%") : "50%"), escapeCSV(j.experience_required || "Standard Fit"), escapeCSV((_j$min_experience_yea = j.min_experience_years) !== null && _j$min_experience_yea !== void 0 ? _j$min_experience_yea : ""), escapeCSV(j.seniority_level || ""), escapeCSV(j.experience_fit || ""), escapeCSV(matchingSkillsStr), escapeCSV(missingSkillsStr), escapeCSV((_j$salary_range$min = (_j$salary_range = j.salary_range) === null || _j$salary_range === void 0 ? void 0 : _j$salary_range.min) !== null && _j$salary_range$min !== void 0 ? _j$salary_range$min : ""), escapeCSV((_j$salary_range$max = (_j$salary_range2 = j.salary_range) === null || _j$salary_range2 === void 0 ? void 0 : _j$salary_range2.max) !== null && _j$salary_range$max !== void 0 ? _j$salary_range$max : ""), escapeCSV(((_j$salary_range3 = j.salary_range) === null || _j$salary_range3 === void 0 ? void 0 : _j$salary_range3.currency) || "USD"), escapeCSV(j.key_requirements || ""), escapeCSV(hrContacts), escapeCSV(hrEmails), escapeCSV(techContacts), escapeCSV(techEmails), escapeCSV(coldEmail), escapeCSV(linkedinNote), escapeCSV(insights), escapeCSV(j.description || "")].join(",");
  });
  var csvContent = "\uFEFF" + [headers.map(function (h) {
    return "\"".concat(h, "\"");
  }).join(",")].concat(_toConsumableArray(rows)).join("\r\n");
  var blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  var timestamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = "".concat(filenamePrefix, "_").concat(timestamp, ".csv");
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return true;
}

// ==========================================
// Component: Dedicated Applied Jobs Tracker Modal
// ==========================================
function AppliedJobsTrackerModal(_ref) {
  var _ref$appliedJobs = _ref.appliedJobs,
    appliedJobs = _ref$appliedJobs === void 0 ? [] : _ref$appliedJobs,
    onToggleApplied = _ref.onToggleApplied,
    onViewDetails = _ref.onViewDetails,
    onClose = _ref.onClose,
    onExportCSV = _ref.onExportCSV,
    onViewInDashboard = _ref.onViewInDashboard;
  var _useState = useState(""),
    _useState2 = _slicedToArray(_useState, 2),
    searchQuery = _useState2[0],
    setSearchQuery = _useState2[1];
  var filtered = useMemo(function () {
    if (!searchQuery.trim()) return appliedJobs;
    var q = searchQuery.toLowerCase().trim();
    return appliedJobs.filter(function (j) {
      return (j.title || "").toLowerCase().includes(q) || (j.company || "").toLowerCase().includes(q) || (j.location || "").toLowerCase().includes(q);
    });
  }, [appliedJobs, searchQuery]);
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-2xl max-w-4xl w-full my-6 p-5 sm:p-6 border border-white/15 shadow-2xl space-y-4 text-xs max-h-[90vh] flex flex-col justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between gap-3 pb-3 border-b border-white/[0.08]"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 flex-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-lg sm:text-xl font-bold text-white flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("span", null, "Applied Jobs Tracker")), /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
  }, appliedJobs.length, " Applications Saved")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-1"
  }, "Your tracked job submissions synced automatically across laptop and mobile devices.")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative flex-1"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Search applied roles, companies, or locations...",
    value: searchQuery,
    onChange: function onChange(e) {
      return setSearchQuery(e.target.value);
    },
    className: "w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs transition-all"
  }), searchQuery && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setSearchQuery("");
    },
    className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, appliedJobs.length > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: onExportCSV,
    className: "px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCE5"), /*#__PURE__*/React.createElement("span", null, "Export CSV")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      onViewInDashboard === null || onViewInDashboard === void 0 || onViewInDashboard();
      onClose();
    },
    className: "px-3 py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFAF"), /*#__PURE__*/React.createElement("span", null, "Filter in Dashboard")))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto pr-1 space-y-3 max-h-[58vh]"
  }, appliedJobs.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "p-10 rounded-xl bg-slate-900/40 border border-dashed border-slate-700 text-center space-y-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-3xl"
  }, "\uD83C\uDF31"), /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-white text-sm"
  }, "No applications tracked yet"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 max-w-md mx-auto"
  }, "Click the ", /*#__PURE__*/React.createElement("strong", {
    className: "text-emerald-300"
  }, "\u2713 Apply"), " checkmark on any job card or inside job details to log your application. It will sync across all your devices in real-time!")) : filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "p-8 text-center text-xs text-slate-400"
  }, "No applications matched your search query \"", searchQuery, "\".") : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-3"
  }, filtered.map(function (job, idx) {
    return /*#__PURE__*/React.createElement("div", {
      key: job.id || idx,
      className: "p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/20 hover:border-emerald-500/50 transition-all space-y-2.5 flex flex-col justify-between shadow-md"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-1.5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between gap-2"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "font-bold text-white text-xs leading-snug line-clamp-2"
    }, job.title), /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 shrink-0"
    }, "\u2713 Applied")), /*#__PURE__*/React.createElement("p", {
      className: "text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-semibold text-slate-200"
    }, "\uD83C\uDFE2 ", job.company || 'Company'), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCD ", job.location || 'Remote')), /*#__PURE__*/React.createElement("div", {
      className: "text-[10px] text-emerald-400 font-medium"
    }, "\uD83D\uDDD3\uFE0F Applied: ", job.applied_at ? new Date(job.applied_at).toLocaleString() : 'Recently')), /*#__PURE__*/React.createElement("div", {
      className: "pt-2 border-t border-white/[0.04] flex items-center justify-between gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5"
    }, job.url && /*#__PURE__*/React.createElement("a", {
      href: job.url,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "py-1 px-2 rounded bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium text-[11px] transition-all flex items-center gap-1"
    }, /*#__PURE__*/React.createElement("span", null, "Link"), /*#__PURE__*/React.createElement("span", null, "\u2197")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick() {
        onViewDetails === null || onViewDetails === void 0 || onViewDetails(job);
        onClose();
      },
      className: "py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] transition-all"
    }, "Details \uD83D\uDD0D")), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick() {
        return onToggleApplied(job);
      },
      className: "text-rose-400 hover:text-rose-300 text-[11px] hover:underline"
    }, "\u2715 Remove")));
  })))));
}

// ==========================================
// Main App Component
// ==========================================
function App() {
  var _useState3 = useState(function () {
      return localStorage.getItem("jobagent_auth_token") || "";
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    token = _useState4[0],
    setToken = _useState4[1];
  var _useState5 = useState(function () {
      try {
        return JSON.parse(localStorage.getItem("jobagent_user") || "null");
      } catch (_unused3) {
        return null;
      }
    }),
    _useState6 = _slicedToArray(_useState5, 2),
    currentUser = _useState6[0],
    setCurrentUser = _useState6[1];
  var _useState7 = useState('search'),
    _useState8 = _slicedToArray(_useState7, 2),
    activeTab = _useState8[0],
    setActiveTab = _useState8[1];
  var _useState9 = useState(null),
    _useState10 = _slicedToArray(_useState9, 2),
    activeSnapshot = _useState10[0],
    setActiveSnapshot = _useState10[1];

  // Applied Jobs State (Cross-Device Synchronized)
  var _useState11 = useState(function () {
      try {
        var saved = localStorage.getItem("jobhunt_applied_jobs");
        return saved ? JSON.parse(saved) : [];
      } catch (_unused4) {
        return [];
      }
    }),
    _useState12 = _slicedToArray(_useState11, 2),
    appliedJobs = _useState12[0],
    setAppliedJobs = _useState12[1];
  var _useState13 = useState(false),
    _useState14 = _slicedToArray(_useState13, 2),
    appliedTrackerOpen = _useState14[0],
    setAppliedTrackerOpen = _useState14[1];

  // LinkedIn Cookie State
  var _useState15 = useState(false),
    _useState16 = _slicedToArray(_useState15, 2),
    cookieModalOpen = _useState16[0],
    setCookieModalOpen = _useState16[1];
  var _useState17 = useState({
      has_cookie: false,
      cookie_status: 'unconfigured',
      valid: false,
      message: ''
    }),
    _useState18 = _slicedToArray(_useState17, 2),
    cookieStatusInfo = _useState18[0],
    setCookieStatusInfo = _useState18[1];
  var _useState19 = useState(null),
    _useState20 = _slicedToArray(_useState19, 2),
    toast = _useState20[0],
    setToast = _useState20[1];
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
  var handleInspectSnapshot = function handleInspectSnapshot(snapshotData) {
    setActiveSnapshot(snapshotData);
    setActiveTab('search');
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

  // Sync Applied Jobs and Profile from Database on Mount / Login
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

      // Bidirectional Cross-Device Sync
      fetch("".concat(API_BASE_URL, "/api/v1/auth/sync-data"), {
        headers: {
          'Authorization': "Bearer ".concat(token)
        }
      }).then(function (res) {
        return res.json();
      }).then(function (data) {
        if (data && data.applied_jobs && Array.isArray(data.applied_jobs)) {
          setAppliedJobs(function (prev) {
            var mergedMap = new Map();
            var _iterator2 = _createForOfIteratorHelper(prev),
              _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var j = _step2.value;
                var k = (j.url || j.job_url || "".concat(j.title, "-").concat(j.company, "-").concat(j.location) || "").toLowerCase().trim();
                if (k) mergedMap.set(k, j);
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
            var _iterator3 = _createForOfIteratorHelper(data.applied_jobs),
              _step3;
            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var _j = _step3.value;
                var _k = (_j.url || _j.job_url || "".concat(_j.title, "-").concat(_j.company, "-").concat(_j.location) || "").toLowerCase().trim();
                if (_k) mergedMap.set(_k, _j);
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
            var merged = Array.from(mergedMap.values());
            try {
              localStorage.setItem("jobhunt_applied_jobs", JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      })["catch"](function () {});
    }
  }, [token]);
  var toggleJobApplied = function toggleJobApplied(job) {
    if (!job) return;
    var key = (job.url || job.job_url || "".concat(job.title, "-").concat(job.company, "-").concat(job.location) || "").toLowerCase().trim();
    if (!key) return;
    setAppliedJobs(function (prev) {
      var exists = prev.some(function (item) {
        return (item.url || item.job_url || "".concat(item.title, "-").concat(item.company, "-").concat(item.location) || "").toLowerCase().trim() === key;
      });
      var updated;
      if (exists) {
        updated = prev.filter(function (item) {
          return (item.url || item.job_url || "".concat(item.title, "-").concat(item.company, "-").concat(item.location) || "").toLowerCase().trim() !== key;
        });
        showToast("Removed \"".concat(job.title, "\" from Applied tracker."));
      } else {
        var appliedEntry = _objectSpread(_objectSpread({}, job), {}, {
          applied_at: new Date().toISOString()
        });
        updated = [appliedEntry].concat(_toConsumableArray(prev));
        showToast("\u2713 Marked \"".concat(job.title, "\" as Applied!"));
      }
      try {
        localStorage.setItem("jobhunt_applied_jobs", JSON.stringify(updated.slice(0, 500)));
      } catch (e) {}

      // Persist to Server for Multi-Device Sync
      if (token) {
        fetch("".concat(API_BASE_URL, "/api/v1/auth/sync-data"), {
          method: "POST",
          headers: {
            "Authorization": "Bearer ".concat(token),
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            applied_jobs: updated.slice(0, 500)
          })
        })["catch"](function () {});
      }
      return updated;
    });
  };
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
    showToast("Signed out successfully.");
    setActiveTab('search');
  };
  if (!token || !currentUser) {
    return /*#__PURE__*/React.createElement("div", {
      className: "min-h-screen flex items-center justify-center p-4"
    }, /*#__PURE__*/React.createElement(LoginScreen, {
      onLoginSuccess: handleLoginSuccess,
      showToast: showToast
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen flex flex-col"
  }, /*#__PURE__*/React.createElement(Navbar, {
    user: currentUser,
    activeTab: activeTab,
    setActiveTab: setActiveTab,
    cookieStatusInfo: cookieStatusInfo,
    appliedJobsCount: appliedJobs.length,
    onOpenAppliedModal: function onOpenAppliedModal() {
      return setAppliedTrackerOpen(true);
    },
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
    appliedJobs: appliedJobs,
    onToggleApplied: toggleJobApplied,
    onOpenAppliedModal: function onOpenAppliedModal() {
      return setAppliedTrackerOpen(true);
    },
    onOpenCookieModal: function onOpenCookieModal() {
      return setCookieModalOpen(true);
    },
    showToast: showToast,
    activeSnapshot: activeSnapshot,
    onExitSnapshot: function onExitSnapshot() {
      return setActiveSnapshot(null);
    }
  }), activeTab === 'analytics' && /*#__PURE__*/React.createElement(PipelineAnalyticsView, {
    token: token,
    appliedJobs: appliedJobs
  }), activeTab === 'stories' && /*#__PURE__*/React.createElement(StoryBankView, {
    token: token,
    showToast: showToast
  }), activeTab === 'alerts' && /*#__PURE__*/React.createElement(EmailAlertsView, {
    token: token,
    user: currentUser,
    cookieStatusInfo: cookieStatusInfo,
    onOpenCookieModal: function onOpenCookieModal() {
      return setCookieModalOpen(true);
    },
    showToast: showToast,
    appliedJobs: appliedJobs,
    onToggleApplied: toggleJobApplied,
    onInspectSnapshot: handleInspectSnapshot
  }), activeTab === 'admin' && currentUser.role === 'admin' && /*#__PURE__*/React.createElement(AdminPortal, {
    token: token,
    user: currentUser,
    showToast: showToast
  })), appliedTrackerOpen && /*#__PURE__*/React.createElement(AppliedJobsTrackerModal, {
    appliedJobs: appliedJobs,
    onToggleApplied: toggleJobApplied,
    onViewDetails: function onViewDetails(job) {
      setActiveTab('search');
    },
    onClose: function onClose() {
      return setAppliedTrackerOpen(false);
    },
    onExportCSV: function onExportCSV() {
      return generateJobsCSV(appliedJobs, "Applied Tracker", "jobhunt_applied_jobs");
    },
    onViewInDashboard: function onViewInDashboard() {
      setActiveTab('search');
    }
  }), cookieModalOpen && /*#__PURE__*/React.createElement(LinkedInCookieModal, {
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
function Navbar(_ref2) {
  var user = _ref2.user,
    activeTab = _ref2.activeTab,
    setActiveTab = _ref2.setActiveTab,
    cookieStatusInfo = _ref2.cookieStatusInfo,
    _ref2$appliedJobsCoun = _ref2.appliedJobsCount,
    appliedJobsCount = _ref2$appliedJobsCoun === void 0 ? 0 : _ref2$appliedJobsCoun,
    onOpenAppliedModal = _ref2.onOpenAppliedModal,
    onOpenCookieModal = _ref2.onOpenCookieModal,
    onLogout = _ref2.onLogout;
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
    className: "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0",
    onClick: function onClick() {
      return setActiveTab('search');
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-sm font-bold text-indigo-400"
  }, "\u26A1"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-sm sm:text-base text-slate-100 tracking-tight leading-none"
  }, "JobAgent ", /*#__PURE__*/React.createElement("span", {
    className: "text-indigo-400 font-semibold"
  }, "AI")), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block"
  }, "Multi-Source ATS & Talent Discovery"))), /*#__PURE__*/React.createElement("nav", {
    className: "flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-white/[0.08]"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab('search');
    },
    className: "px-2.5 sm:px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ".concat(activeTab === 'search' ? 'bg-indigo-600/90 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("span", {
    className: "hidden xs:inline"
  }, "Search")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab('alerts');
    },
    className: "px-2.5 sm:px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ".concat(activeTab === 'alerts' ? 'bg-indigo-600/90 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]')
  }, /*#__PURE__*/React.createElement("span", null, "\u23F0"), /*#__PURE__*/React.createElement("span", {
    className: "hidden xs:inline"
  }, "Alerts")), user.role === 'admin' && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab('admin');
    },
    className: "px-2.5 sm:px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ".concat(activeTab === 'admin' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]')
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDEE1\uFE0F"), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline"
  }, "Admin"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 sm:gap-2.5"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onOpenAppliedModal,
    title: "Open your tracked Applied Jobs",
    className: "px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900 hover:border-emerald-500 shadow-sm"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-400 font-extrabold text-xs"
  }, "\u2713"), /*#__PURE__*/React.createElement("span", {
    className: "hidden sm:inline font-bold"
  }, "Applied"), /*#__PURE__*/React.createElement("span", {
    className: "px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-bold"
  }, appliedJobsCount)), /*#__PURE__*/React.createElement("button", {
    onClick: onOpenCookieModal,
    title: "Configure your LinkedIn session cookie for authenticated recruiter scraping",
    className: "px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ".concat(cookieBadge.color)
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full ".concat(cookieBadge.dot)
  }), /*#__PURE__*/React.createElement("span", {
    className: "hidden md:inline"
  }, cookieBadge.label), /*#__PURE__*/React.createElement("span", {
    className: "md:hidden"
  }, "Cookie")), /*#__PURE__*/React.createElement("div", {
    className: "hidden lg:flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-300 font-medium"
  }, user.email), /*#__PURE__*/React.createElement("span", {
    className: "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ".concat(user.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300 border border-white/10')
  }, user.role)), /*#__PURE__*/React.createElement("button", {
    onClick: onLogout,
    title: "Sign Out",
    className: "px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/30 text-xs font-medium transition-all"
  }, "Logout"))));
}

// ==========================================
// Component: LinkedIn Cookie Modal
// ==========================================
function LinkedInCookieModal(_ref3) {
  var token = _ref3.token,
    cookieStatusInfo = _ref3.cookieStatusInfo,
    onClose = _ref3.onClose,
    onStatusUpdated = _ref3.onStatusUpdated,
    showToast = _ref3.showToast;
  var _useState21 = useState(""),
    _useState22 = _slicedToArray(_useState21, 2),
    cookieInput = _useState22[0],
    setCookieInput = _useState22[1];
  var _useState23 = useState(false),
    _useState24 = _slicedToArray(_useState23, 2),
    saving = _useState24[0],
    setSaving = _useState24[1];
  var _useState25 = useState(false),
    _useState26 = _slicedToArray(_useState25, 2),
    testing = _useState26[0],
    setTesting = _useState26[1];
  var _useState27 = useState((cookieStatusInfo === null || cookieStatusInfo === void 0 ? void 0 : cookieStatusInfo.message) || ""),
    _useState28 = _slicedToArray(_useState27, 2),
    statusMsg = _useState28[0],
    setStatusMsg = _useState28[1];
  var _useState29 = useState((cookieStatusInfo === null || cookieStatusInfo === void 0 ? void 0 : cookieStatusInfo.cookie_status) || "unconfigured"),
    _useState30 = _slicedToArray(_useState29, 2),
    currentStatus = _useState30[0],
    setCurrentStatus = _useState30[1];
  var handleSaveCookie = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(e) {
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
      return _ref4.apply(this, arguments);
    };
  }();
  var handleCheckLive = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
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
      return _ref5.apply(this, arguments);
    };
  }();
  var handleRemoveCookie = /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
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
      return _ref6.apply(this, arguments);
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
  }, "Paste ", /*#__PURE__*/React.createElement("code", null, "li_at"), " Cookie Value:"), /*#__PURE__*/React.createElement(PasswordInput, {
    required: true,
    placeholder: "AQEDATxxxxxx...",
    value: cookieInput,
    onChange: function onChange(e) {
      return setCookieInput(e.target.value);
    }
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
// Component: Password Input with Eye Toggle
// ==========================================
function PasswordInput(_ref7) {
  var value = _ref7.value,
    onChange = _ref7.onChange,
    placeholder = _ref7.placeholder,
    required = _ref7.required,
    className = _ref7.className,
    autoFocus = _ref7.autoFocus;
  var _useState31 = useState(false),
    _useState32 = _slicedToArray(_useState31, 2),
    showPassword = _useState32[0],
    setShowPassword = _useState32[1];
  return /*#__PURE__*/React.createElement("div", {
    className: "relative w-full"
  }, /*#__PURE__*/React.createElement("input", {
    type: showPassword ? "text" : "password",
    required: required,
    value: value,
    onChange: onChange,
    placeholder: placeholder || "••••••••",
    autoFocus: autoFocus,
    className: "w-full pr-10 ".concat(className || "px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs transition-all")
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setShowPassword(function (prev) {
        return !prev;
      });
    },
    tabIndex: "-1",
    "aria-label": showPassword ? "Hide password" : "Show password",
    className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md focus:outline-none"
  }, showPassword ? /*#__PURE__*/React.createElement("svg", {
    className: "w-4 h-4",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "2",
    d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
  })) : /*#__PURE__*/React.createElement("svg", {
    className: "w-4 h-4",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "2",
    d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
  }), /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "2",
    d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
  }))));
}

// ==========================================
// Component: Forgot / Reset Password Modal (Email OTP)
// ==========================================
function ForgotPasswordModal(_ref8) {
  var onClose = _ref8.onClose,
    showToast = _ref8.showToast;
  var _useState33 = useState(1),
    _useState34 = _slicedToArray(_useState33, 2),
    step = _useState34[0],
    setStep = _useState34[1]; // 1 = Request OTP, 2 = Verify OTP & Set Password, 3 = Success
  var _useState35 = useState(""),
    _useState36 = _slicedToArray(_useState35, 2),
    email = _useState36[0],
    setEmail = _useState36[1];
  var _useState37 = useState(""),
    _useState38 = _slicedToArray(_useState37, 2),
    otp = _useState38[0],
    setOtp = _useState38[1];
  var _useState39 = useState(""),
    _useState40 = _slicedToArray(_useState39, 2),
    newPassword = _useState40[0],
    setNewPassword = _useState40[1];
  var _useState41 = useState(""),
    _useState42 = _slicedToArray(_useState41, 2),
    confirmPassword = _useState42[0],
    setConfirmPassword = _useState42[1];
  var _useState43 = useState(false),
    _useState44 = _slicedToArray(_useState43, 2),
    loading = _useState44[0],
    setLoading = _useState44[1];
  var _useState45 = useState(""),
    _useState46 = _slicedToArray(_useState45, 2),
    error = _useState46[0],
    setError = _useState46[1];
  var _useState47 = useState(""),
    _useState48 = _slicedToArray(_useState47, 2),
    successMessage = _useState48[0],
    setSuccessMessage = _useState48[1];
  var handleSendOTP = /*#__PURE__*/function () {
    var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(e) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            e.preventDefault();
            setError("");
            setLoading(true);
            _context4.prev = 3;
            _context4.next = 6;
            return fetch("".concat(API_BASE_URL, "/api/v1/auth/forgot-password"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                email: email.trim()
              })
            });
          case 6:
            res = _context4.sent;
            _context4.next = 9;
            return res.json();
          case 9:
            data = _context4.sent;
            if (res.ok) {
              setStep(2);
              showToast("Verification OTP sent to your email!");
            } else {
              setError(data.detail || "Failed to send OTP code.");
            }
            _context4.next = 16;
            break;
          case 13:
            _context4.prev = 13;
            _context4.t0 = _context4["catch"](3);
            setError(_context4.t0.message);
          case 16:
            _context4.prev = 16;
            setLoading(false);
            return _context4.finish(16);
          case 19:
          case "end":
            return _context4.stop();
        }
      }, _callee4, null, [[3, 13, 16, 19]]);
    }));
    return function handleSendOTP(_x2) {
      return _ref9.apply(this, arguments);
    };
  }();
  var handleResetPassword = /*#__PURE__*/function () {
    var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(e) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            e.preventDefault();
            setError("");
            if (!(newPassword !== confirmPassword)) {
              _context5.next = 5;
              break;
            }
            setError("Passwords do not match. Please verify.");
            return _context5.abrupt("return");
          case 5:
            if (!(newPassword.length < 6)) {
              _context5.next = 8;
              break;
            }
            setError("Password must be at least 6 characters.");
            return _context5.abrupt("return");
          case 8:
            setLoading(true);
            _context5.prev = 9;
            _context5.next = 12;
            return fetch("".concat(API_BASE_URL, "/api/v1/auth/reset-password"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                email: email.trim(),
                otp: otp.trim(),
                new_password: newPassword.trim()
              })
            });
          case 12:
            res = _context5.sent;
            _context5.next = 15;
            return res.json();
          case 15:
            data = _context5.sent;
            if (res.ok) {
              setStep(3);
              setSuccessMessage(data.message || "Password successfully reset!");
              showToast("Password successfully reset! You can now log in.");
            } else {
              setError(data.detail || "Password reset failed. Please check the OTP.");
            }
            _context5.next = 22;
            break;
          case 19:
            _context5.prev = 19;
            _context5.t0 = _context5["catch"](9);
            setError(_context5.t0.message);
          case 22:
            _context5.prev = 22;
            setLoading(false);
            return _context5.finish(22);
          case 25:
          case "end":
            return _context5.stop();
        }
      }, _callee5, null, [[9, 19, 22, 25]]);
    }));
    return function handleResetPassword(_x3) {
      return _ref10.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-2xl max-w-md w-full p-6 border border-white/15 shadow-2xl space-y-4 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between pb-3 border-b border-white/[0.08]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-lg"
  }, "\uD83D\uDD10"), /*#__PURE__*/React.createElement("h3", {
    className: "text-sm font-bold text-white"
  }, "Reset Account Password")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
  }, "\u2715")), error && /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"
  }, error), step === 1 && /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSendOTP,
    className: "space-y-3.5"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-slate-300 text-xs leading-relaxed"
  }, "Enter the email address associated with your account. We will send you a ", /*#__PURE__*/React.createElement("strong", null, "6-digit OTP verification code"), " valid for 15 minutes."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Account Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    autoFocus: true,
    value: email,
    onChange: function onChange(e) {
      return setEmail(e.target.value);
    },
    placeholder: "name@example.com",
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 pt-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    className: "px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading || !email.trim(),
    className: "flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
  }, loading ? "Sending OTP..." : "Send Verification OTP →"))), step === 2 && /*#__PURE__*/React.createElement("form", {
    onSubmit: handleResetPassword,
    className: "space-y-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 text-xs"
  }, "\u2709\uFE0F We sent a 6-digit OTP code to ", /*#__PURE__*/React.createElement("strong", null, email), ". Please check your inbox and spam folder."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "6-Digit OTP Code"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    maxLength: "6",
    autoFocus: true,
    value: otp,
    onChange: function onChange(e) {
      return setOtp(e.target.value.replace(/\D/g, ''));
    },
    placeholder: "123456",
    className: "w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-center tracking-[6px] text-base focus:outline-none focus:border-indigo-500"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "New Password"), /*#__PURE__*/React.createElement(PasswordInput, {
    required: true,
    value: newPassword,
    onChange: function onChange(e) {
      return setNewPassword(e.target.value);
    },
    placeholder: "At least 6 characters"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
  }, "Confirm New Password"), /*#__PURE__*/React.createElement(PasswordInput, {
    required: true,
    value: confirmPassword,
    onChange: function onChange(e) {
      return setConfirmPassword(e.target.value);
    },
    placeholder: "Re-enter new password"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 pt-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setStep(1);
    },
    className: "px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
  }, "\u2190 Back"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading || otp.length < 6 || !newPassword || !confirmPassword,
    className: "flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
  }, loading ? "Resetting Password..." : "✓ Reset Password & Save"))), step === 3 && /*#__PURE__*/React.createElement("div", {
    className: "text-center py-4 space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 text-2xl border border-emerald-500/30"
  }, "\u2713"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-white text-sm"
  }, "Password Reset Successful!"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-400 text-xs mt-1"
  }, successMessage || "Your password has been securely updated. You can now log in with your new credentials.")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
  }, "Proceed to Sign In \u2192"))));
}

// ==========================================
// Component: Minimal Login Screen
// ==========================================
function LoginScreen(_ref11) {
  var onLoginSuccess = _ref11.onLoginSuccess,
    showToast = _ref11.showToast;
  var _useState49 = useState(""),
    _useState50 = _slicedToArray(_useState49, 2),
    email = _useState50[0],
    setEmail = _useState50[1];
  var _useState51 = useState(""),
    _useState52 = _slicedToArray(_useState51, 2),
    password = _useState52[0],
    setPassword = _useState52[1];
  var _useState53 = useState(false),
    _useState54 = _slicedToArray(_useState53, 2),
    loading = _useState54[0],
    setLoading = _useState54[1];
  var _useState55 = useState(""),
    _useState56 = _slicedToArray(_useState55, 2),
    error = _useState56[0],
    setError = _useState56[1];
  var _useState57 = useState(false),
    _useState58 = _slicedToArray(_useState57, 2),
    forgotModalOpen = _useState58[0],
    setForgotModalOpen = _useState58[1];
  var handleSubmit = /*#__PURE__*/function () {
    var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(e) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            e.preventDefault();
            setError("");
            if (API_BASE_URL) {
              _context6.next = 5;
              break;
            }
            setError("Backend URL not configured in .env (VITE_BACKEND_URL is empty).");
            return _context6.abrupt("return");
          case 5:
            setLoading(true);
            _context6.prev = 6;
            _context6.next = 9;
            return fetch("".concat(API_BASE_URL, "/api/v1/auth/login"), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: email.trim(),
                password: password
              })
            });
          case 9:
            res = _context6.sent;
            _context6.next = 12;
            return res.json();
          case 12:
            data = _context6.sent;
            if (res.ok) {
              _context6.next = 15;
              break;
            }
            throw new Error(data.detail || "Authentication failed.");
          case 15:
            onLoginSuccess(data.access_token, data.user);
            _context6.next = 21;
            break;
          case 18:
            _context6.prev = 18;
            _context6.t0 = _context6["catch"](6);
            setError(_context6.t0.message);
          case 21:
            _context6.prev = 21;
            setLoading(false);
            return _context6.finish(21);
          case 24:
          case "end":
            return _context6.stop();
        }
      }, _callee6, null, [[6, 18, 21, 24]]);
    }));
    return function handleSubmit(_x4) {
      return _ref12.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-center mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-white/10 text-xl text-indigo-400 mb-3 shadow-lg"
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
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-1.5"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider"
  }, "Password"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setForgotModalOpen(true);
    },
    className: "text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
  }, "Forgot password?")), /*#__PURE__*/React.createElement(PasswordInput, {
    required: true,
    value: password,
    onChange: function onChange(e) {
      return setPassword(e.target.value);
    },
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-1.5"
  }, loading ? "Authenticating..." : "Sign In →"))), forgotModalOpen && /*#__PURE__*/React.createElement(ForgotPasswordModal, {
    onClose: function onClose() {
      return setForgotModalOpen(false);
    },
    showToast: showToast || function (msg) {
      return alert(msg);
    }
  }));
}
function JobSearchDashboard(_ref13) {
  var _resumeProfile$skills;
  var token = _ref13.token,
    user = _ref13.user,
    cookieStatusInfo = _ref13.cookieStatusInfo,
    _ref13$appliedJobs = _ref13.appliedJobs,
    appliedJobs = _ref13$appliedJobs === void 0 ? [] : _ref13$appliedJobs,
    onToggleApplied = _ref13.onToggleApplied,
    onOpenAppliedModal = _ref13.onOpenAppliedModal,
    onOpenCookieModal = _ref13.onOpenCookieModal,
    showToast = _ref13.showToast,
    activeSnapshot = _ref13.activeSnapshot,
    onExitSnapshot = _ref13.onExitSnapshot;
  // Form Inputs
  var _useState59 = useState("AI ML Engineer"),
    _useState60 = _slicedToArray(_useState59, 2),
    role = _useState60[0],
    setRole = _useState60[1];

  // Resume Profile State & Persistence
  var _useState61 = useState(null),
    _useState62 = _slicedToArray(_useState61, 2),
    resumeFile = _useState62[0],
    setResumeFile = _useState62[1];
  var _useState63 = useState(null),
    _useState64 = _slicedToArray(_useState63, 2),
    resumeProfile = _useState64[0],
    setResumeProfile = _useState64[1];
  var _useState65 = useState(false),
    _useState66 = _slicedToArray(_useState65, 2),
    parsingResume = _useState66[0],
    setParsingResume = _useState66[1];
  var resumeInputRef = useRef(null);

  // Search Execution State & Result Lists
  var _useState67 = useState(false),
    _useState68 = _slicedToArray(_useState67, 2),
    searching = _useState68[0],
    setSearching = _useState68[1];
  var _useState69 = useState(""),
    _useState70 = _slicedToArray(_useState69, 2),
    currentSearchId = _useState70[0],
    setCurrentSearchId = _useState70[1];
  var _useState71 = useState([]),
    _useState72 = _slicedToArray(_useState71, 2),
    allMatchedJobs = _useState72[0],
    setAllMatchedJobs = _useState72[1];
  var _useState73 = useState([]),
    _useState74 = _slicedToArray(_useState73, 2),
    allUniqueJobs = _useState74[0],
    setAllUniqueJobs = _useState74[1];
  var _useState75 = useState([]),
    _useState76 = _slicedToArray(_useState75, 2),
    allRawJobs = _useState76[0],
    setAllRawJobs = _useState76[1];
  var _useState77 = useState({
      total_found: 0,
      unique_count: 0
    }),
    _useState78 = _slicedToArray(_useState77, 2),
    searchStats = _useState78[0],
    setSearchStats = _useState78[1];

  // Mutable refs to prevent asynchronous batching loss in merge operations
  var allMatchedJobsRef = useRef([]);
  var allUniqueJobsRef = useRef([]);
  var allRawJobsRef = useRef([]);
  useEffect(function () {
    allMatchedJobsRef.current = allMatchedJobs;
  }, [allMatchedJobs]);
  useEffect(function () {
    allUniqueJobsRef.current = allUniqueJobs;
  }, [allUniqueJobs]);
  useEffect(function () {
    allRawJobsRef.current = allRawJobs;
  }, [allRawJobs]);

  // Selected Job for Detailed Modal
  var _useState79 = useState(null),
    _useState80 = _slicedToArray(_useState79, 2),
    selectedJob = _useState80[0],
    setSelectedJob = _useState80[1];
  var _useState81 = useState(null),
    _useState82 = _slicedToArray(_useState81, 2),
    dossierCompany = _useState82[0],
    setDossierCompany = _useState82[1];
  var _useState83 = useState([]),
    _useState84 = _slicedToArray(_useState83, 2),
    blacklistedCompanies = _useState84[0],
    setBlacklistedCompanies = _useState84[1];

  // Pre-Harvesting Setup State (Strictly controls scraper criteria & background harvesting)
  var _useState85 = useState("AI ML Intern"),
    _useState86 = _slicedToArray(_useState85, 2),
    harvestRole = _useState86[0],
    setHarvestRole = _useState86[1];
  var _useState87 = useState(""),
    _useState88 = _slicedToArray(_useState87, 2),
    harvestLocation = _useState88[0],
    setHarvestLocation = _useState88[1];
  var _useState89 = useState("any"),
    _useState90 = _slicedToArray(_useState89, 2),
    harvestWorkMode = _useState90[0],
    setHarvestWorkMode = _useState90[1]; // 'any' | 'remote' | 'hybrid' | 'onsite'
  var _useState91 = useState("all"),
    _useState92 = _slicedToArray(_useState91, 2),
    harvestExperience = _useState92[0],
    setHarvestExperience = _useState92[1]; // 'all' | 'intern' | 'entry' | 'junior' | 'mid' | 'senior' | 'lead'
  var _useState93 = useState("all"),
    _useState94 = _slicedToArray(_useState93, 2),
    harvestDate = _useState94[0],
    setHarvestDate = _useState94[1]; // 'all' | '1' | '3' | '7' | '14' | '30'
  var _useState95 = useState("all"),
    _useState96 = _slicedToArray(_useState95, 2),
    harvestSource = _useState96[0],
    setHarvestSource = _useState96[1];
  var _useState97 = useState("All"),
    _useState98 = _slicedToArray(_useState97, 2),
    harvestSubDomain = _useState98[0],
    setHarvestSubDomain = _useState98[1];
  var _useState99 = useState([]),
    _useState100 = _slicedToArray(_useState99, 2),
    harvestFacets = _useState100[0],
    setHarvestFacets = _useState100[1];
  var _useState101 = useState("All"),
    _useState102 = _slicedToArray(_useState101, 2),
    filterSubDomain = _useState102[0],
    setFilterSubDomain = _useState102[1];
  var _useState103 = useState([]),
    _useState104 = _slicedToArray(_useState103, 2),
    filterFacets = _useState104[0],
    setFilterFacets = _useState104[1]; // 'all' | 'greenhouse' | 'lever' | 'ashby' | 'linkedin' | 'himalayas' | 'arbeitnow' | 'freehire' | 'jobicy' | 'remoteok'

  // In-Memory Result Filter Toolbar State (Strictly filters already-fetched jobs in real-time)
  var _useState105 = useState(""),
    _useState106 = _slicedToArray(_useState105, 2),
    filterKeyword = _useState106[0],
    setFilterKeyword = _useState106[1];
  var _useState107 = useState(""),
    _useState108 = _slicedToArray(_useState107, 2),
    filterLocationInput = _useState108[0],
    setFilterLocationInput = _useState108[1];
  var _useState109 = useState("all"),
    _useState110 = _slicedToArray(_useState109, 2),
    filterExpYears = _useState110[0],
    setFilterExpYears = _useState110[1];
  var _useState111 = useState("all"),
    _useState112 = _slicedToArray(_useState111, 2),
    filterWorkMode = _useState112[0],
    setFilterWorkMode = _useState112[1];
  var _useState113 = useState("all"),
    _useState114 = _slicedToArray(_useState113, 2),
    filterCategory = _useState114[0],
    setFilterCategory = _useState114[1]; // 'all' | 'india' | 'ai_registry' | 'enterprise_workday' | 'startups' | 'remote'
  var _useState115 = useState(0),
    _useState116 = _slicedToArray(_useState115, 2),
    minScore = _useState116[0],
    setMinScore = _useState116[1];
  var _useState117 = useState("all"),
    _useState118 = _slicedToArray(_useState117, 2),
    filterSeniority = _useState118[0],
    setFilterSeniority = _useState118[1];
  var _useState119 = useState("all"),
    _useState120 = _slicedToArray(_useState119, 2),
    filterDate = _useState120[0],
    setFilterDate = _useState120[1];
  var _useState121 = useState("all"),
    _useState122 = _slicedToArray(_useState121, 2),
    filterSource = _useState122[0],
    setFilterSource = _useState122[1];
  var _useState123 = useState("curated"),
    _useState124 = _slicedToArray(_useState123, 2),
    jobScope = _useState124[0],
    setJobScope = _useState124[1]; // 'curated' | 'unique' | 'raw' | 'applied'
  var _useState125 = useState("score"),
    _useState126 = _slicedToArray(_useState125, 2),
    sortBy = _useState126[0],
    setSortBy = _useState126[1]; // 'score' | 'date'

  var getJobKey = function getJobKey(job) {
    if (!job) return "";
    return (job.url || job.job_url || "".concat(job.title, "-").concat(job.company, "-").concat(job.location) || "").toLowerCase().trim();
  };
  var appliedJobKeys = useMemo(function () {
    var set = new Set();
    var _iterator4 = _createForOfIteratorHelper(appliedJobs),
      _step4;
    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var j = _step4.value;
        var k = getJobKey(j);
        if (k) set.add(k);
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }
    return set;
  }, [appliedJobs]);

  // Listen for incoming historical automation snapshots to inspect
  useEffect(function () {
    if (activeSnapshot) {
      setAllMatchedJobs(activeSnapshot.curated_jobs || []);
      setAllUniqueJobs(activeSnapshot.unique_jobs || []);
      setAllRawJobs(activeSnapshot.raw_jobs || []);
      setSearchStats({
        total_found: activeSnapshot.total_raw_found || (activeSnapshot.raw_jobs || []).length,
        unique_count: activeSnapshot.total_unique_found || (activeSnapshot.unique_jobs || []).length
      });
      setJobScope("curated");
      if (activeSnapshot.role) setRole(activeSnapshot.role);
      setFilterKeyword("");
      if (activeSnapshot.location && activeSnapshot.location !== 'Remote' && activeSnapshot.location !== 'Worldwide') {
        setFilterLocationInput(activeSnapshot.location);
      }
    }
  }, [activeSnapshot]);

  // RAG AI Query State
  var _useState127 = useState(false),
    _useState128 = _slicedToArray(_useState127, 2),
    ragModalOpen = _useState128[0],
    setRagModalOpen = _useState128[1];
  var _useState129 = useState(""),
    _useState130 = _slicedToArray(_useState129, 2),
    ragQuery = _useState130[0],
    setRagQuery = _useState130[1];
  var _useState131 = useState(""),
    _useState132 = _slicedToArray(_useState131, 2),
    ragAnswer = _useState132[0],
    setRagAnswer = _useState132[1];
  var _useState133 = useState(false),
    _useState134 = _slicedToArray(_useState133, 2),
    ragLoading = _useState134[0],
    setRagLoading = _useState134[1];

  // Exporting Insights CSV State
  var _useState135 = useState(false),
    _useState136 = _slicedToArray(_useState135, 2),
    exportingInsights = _useState136[0],
    setExportingInsights = _useState136[1];
  var _useState137 = useState(false),
    _useState138 = _slicedToArray(_useState137, 2),
    isHarvestingLive = _useState138[0],
    setIsHarvestingLive = _useState138[1];
  var _useState139 = useState(false),
    _useState140 = _slicedToArray(_useState139, 2),
    csvMenuOpen = _useState140[0],
    setCsvMenuOpen = _useState140[1];

  // ==========================================
  // High-Capacity Offline Storage (IndexedDB + LocalStorage Fallback)
  // Reliably stores thousands of accumulated jobs without 5MB quota errors
  // ==========================================
  var JobDB = {
    dbName: "JobHuntDB",
    storeName: "saved_pool",
    version: 1,
    getDB: function getDB() {
      var _this = this;
      return new Promise(function (resolve) {
        if (typeof window === "undefined" || !window.indexedDB) return resolve(null);
        var req = indexedDB.open(_this.dbName, _this.version);
        req.onupgradeneeded = function (e) {
          var db = e.target.result;
          if (!db.objectStoreNames.contains(_this.storeName)) {
            db.createObjectStore(_this.storeName);
          }
        };
        req.onsuccess = function () {
          return resolve(req.result);
        };
        req.onerror = function () {
          return resolve(null);
        };
      });
    },
    savePool: function savePool(data) {
      var _this2 = this;
      return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
        var db;
        return _regeneratorRuntime().wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              _context7.next = 3;
              return _this2.getDB();
            case 3:
              db = _context7.sent;
              if (!db) {
                _context7.next = 6;
                break;
              }
              return _context7.abrupt("return", new Promise(function (resolve) {
                var tx = db.transaction(_this2.storeName, "readwrite");
                var store = tx.objectStore(_this2.storeName);
                store.put(data, "current_pool");
                tx.oncomplete = function () {
                  return resolve(true);
                };
                tx.onerror = function () {
                  return resolve(false);
                };
              }));
            case 6:
              _context7.next = 11;
              break;
            case 8:
              _context7.prev = 8;
              _context7.t0 = _context7["catch"](0);
              console.warn("IndexedDB save notice:", _context7.t0);
            case 11:
              // Fallback to localStorage with lightweight summaries
              try {
                localStorage.setItem("jobhunt_cached_search", JSON.stringify({
                  search_id: data.search_id || "",
                  matched: (data.matched || []).slice(0, 100),
                  unique: (data.unique || []).slice(0, 300),
                  raw: (data.raw || []).slice(0, 500),
                  stats: data.stats
                }));
              } catch (e) {}
            case 12:
            case "end":
              return _context7.stop();
          }
        }, _callee7, null, [[0, 8]]);
      }))();
    },
    loadPool: function loadPool() {
      var _this3 = this;
      return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8() {
        var db, _result$raw, _result$unique, _result$matched, result, saved;
        return _regeneratorRuntime().wrap(function _callee8$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              _context8.prev = 0;
              _context8.next = 3;
              return _this3.getDB();
            case 3:
              db = _context8.sent;
              if (!db) {
                _context8.next = 10;
                break;
              }
              _context8.next = 7;
              return new Promise(function (resolve) {
                var tx = db.transaction(_this3.storeName, "readonly");
                var store = tx.objectStore(_this3.storeName);
                var req = store.get("current_pool");
                req.onsuccess = function () {
                  return resolve(req.result || null);
                };
                req.onerror = function () {
                  return resolve(null);
                };
              });
            case 7:
              result = _context8.sent;
              if (!(result && ((_result$raw = result.raw) !== null && _result$raw !== void 0 && _result$raw.length || (_result$unique = result.unique) !== null && _result$unique !== void 0 && _result$unique.length || (_result$matched = result.matched) !== null && _result$matched !== void 0 && _result$matched.length))) {
                _context8.next = 10;
                break;
              }
              return _context8.abrupt("return", result);
            case 10:
              _context8.next = 15;
              break;
            case 12:
              _context8.prev = 12;
              _context8.t0 = _context8["catch"](0);
              console.warn("IndexedDB load notice:", _context8.t0);
            case 15:
              _context8.prev = 15;
              saved = localStorage.getItem("jobhunt_cached_search");
              if (!saved) {
                _context8.next = 19;
                break;
              }
              return _context8.abrupt("return", JSON.parse(saved));
            case 19:
              _context8.next = 23;
              break;
            case 21:
              _context8.prev = 21;
              _context8.t1 = _context8["catch"](15);
            case 23:
              return _context8.abrupt("return", null);
            case 24:
            case "end":
              return _context8.stop();
          }
        }, _callee8, null, [[0, 12], [15, 21]]);
      }))();
    },
    clearPool: function clearPool() {
      var _this4 = this;
      return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9() {
        var db, tx, store;
        return _regeneratorRuntime().wrap(function _callee9$(_context9) {
          while (1) switch (_context9.prev = _context9.next) {
            case 0:
              _context9.prev = 0;
              _context9.next = 3;
              return _this4.getDB();
            case 3:
              db = _context9.sent;
              if (db) {
                tx = db.transaction(_this4.storeName, "readwrite");
                store = tx.objectStore(_this4.storeName);
                store["delete"]("current_pool");
              }
              _context9.next = 9;
              break;
            case 7:
              _context9.prev = 7;
              _context9.t0 = _context9["catch"](0);
            case 9:
              try {
                localStorage.removeItem("jobhunt_cached_search");
              } catch (e) {}
            case 10:
            case "end":
              return _context9.stop();
          }
        }, _callee9, null, [[0, 7]]);
      }))();
    }
  };

  // Helper to merge new incoming jobs with existing accumulated jobs without duplicates
  var mergeJobList = function mergeJobList() {
    var existingList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var incomingList = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var map = new Map();
    // Add newest incoming first
    var _iterator5 = _createForOfIteratorHelper(incomingList || []),
      _step5;
    try {
      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
        var item = _step5.value;
        if (!item) continue;
        var key = (item.url || item.job_url || "".concat(item.title, "-").concat(item.company, "-").concat(item.location)).toLowerCase().trim();
        if (key && !map.has(key)) {
          map.set(key, item);
        }
      }
      // Then add existing items
    } catch (err) {
      _iterator5.e(err);
    } finally {
      _iterator5.f();
    }
    var _iterator6 = _createForOfIteratorHelper(existingList || []),
      _step6;
    try {
      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
        var _item = _step6.value;
        if (!_item) continue;
        var _key = (_item.url || _item.job_url || "".concat(_item.title, "-").concat(_item.company, "-").concat(_item.location)).toLowerCase().trim();
        if (_key && !map.has(_key)) {
          map.set(_key, _item);
        }
      }
    } catch (err) {
      _iterator6.e(err);
    } finally {
      _iterator6.f();
    }
    return Array.from(map.values());
  };

  // Helper to persist search results in IndexedDB so they never disappear across reloads
  var persistSearchData = function persistSearchData(sId, matched, unique, raw, stats) {
    JobDB.savePool({
      search_id: sId || "",
      matched: matched || [],
      unique: unique || [],
      raw: raw || [],
      stats: stats || {
        total_found: (raw || []).length,
        unique_count: (unique || []).length
      }
    });
  };

  // Handler to clear accumulated job pool
  var handleClearJobPool = function handleClearJobPool() {
    if (window.confirm("Are you sure you want to clear your accumulated job pool?")) {
      setAllMatchedJobs([]);
      setAllUniqueJobs([]);
      setAllRawJobs([]);
      allMatchedJobsRef.current = [];
      allUniqueJobsRef.current = [];
      allRawJobsRef.current = [];
      setCurrentSearchId("");
      setSearchStats({
        total_found: 0,
        unique_count: 0
      });
      JobDB.clearPool();
      try {
        localStorage.removeItem("jobhunt_active_search_id");
      } catch (e) {}
      showToast("Job pool cleared. Ready for fresh location harvests!");
    }
  };

  // Keep-Alive Heartbeat: Send /health ping every 50 seconds to keep Render free backend awake
  useEffect(function () {
    var keepAlivePing = function keepAlivePing() {
      fetch("".concat(API_BASE_URL, "/api/v1/health"), {
        cache: 'no-store'
      })["catch"](function () {});
    };
    keepAlivePing();
    var pingInterval = setInterval(keepAlivePing, 50000);
    return function () {
      return clearInterval(pingInterval);
    };
  }, []);

  // Load persisted resume, saved search results, and active filter choices on component mount
  useEffect(function () {
    try {
      var savedResume = localStorage.getItem("jobhunt_resume_profile");
      if (savedResume) {
        var parsed = JSON.parse(savedResume);
        setResumeProfile(parsed);
        if (parsed.target_roles && parsed.target_roles[0]) {
          setRole(parsed.target_roles[0]);
          setHarvestRole(parsed.target_roles[0]);
        }
      }

      // Restore pre-harvesting setup criteria
      var savedHarvest = localStorage.getItem("jobhunt_harvest_criteria");
      if (savedHarvest) {
        var h = JSON.parse(savedHarvest);
        if (h.harvestRole) {
          setHarvestRole(h.harvestRole);
          setRole(h.harvestRole);
        }
        if (h.harvestLocation !== undefined) setHarvestLocation(h.harvestLocation);
        if (h.harvestWorkMode !== undefined) setHarvestWorkMode(h.harvestWorkMode);
        if (h.harvestExperience !== undefined) setHarvestExperience(h.harvestExperience);
        if (h.harvestDate !== undefined) setHarvestDate(h.harvestDate);
        if (h.harvestSource !== undefined) setHarvestSource(h.harvestSource);
      }

      // Load full accumulated pool from IndexedDB and sync with latest server-side background discoveries
      JobDB.loadPool().then(function (savedSearch) {
        var initialMatched = (savedSearch === null || savedSearch === void 0 ? void 0 : savedSearch.matched) || [];
        var initialUnique = (savedSearch === null || savedSearch === void 0 ? void 0 : savedSearch.unique) || [];
        var initialRaw = (savedSearch === null || savedSearch === void 0 ? void 0 : savedSearch.raw) || [];
        if (initialMatched.length) {
          setAllMatchedJobs(initialMatched);
          allMatchedJobsRef.current = initialMatched;
        }
        if (initialUnique.length) {
          setAllUniqueJobs(initialUnique);
          allUniqueJobsRef.current = initialUnique;
        }
        if (initialRaw.length) {
          setAllRawJobs(initialRaw);
          allRawJobsRef.current = initialRaw;
        }
        if (savedSearch !== null && savedSearch !== void 0 && savedSearch.stats) setSearchStats(savedSearch.stats);

        // Fetch latest server-side background discoveries & automation history
        fetch("".concat(API_BASE_URL, "/api/v1/jobs/latest-pool")).then(function (res) {
          return res.json();
        }).then(function (data) {
          if (data && data.jobs && data.jobs.length > 0) {
            var mergedMatched = mergeJobList(allMatchedJobsRef.current, data.jobs || []);
            var mergedUnique = mergeJobList(allUniqueJobsRef.current, data.unique_jobs || data.jobs || []);
            var mergedRaw = mergeJobList(allRawJobsRef.current, data.raw_jobs || data.jobs || []);
            allMatchedJobsRef.current = mergedMatched;
            allUniqueJobsRef.current = mergedUnique;
            allRawJobsRef.current = mergedRaw;
            setAllMatchedJobs(mergedMatched);
            setAllUniqueJobs(mergedUnique);
            setAllRawJobs(mergedRaw);
            var newStats = {
              total_found: mergedRaw.length,
              unique_count: mergedUnique.length
            };
            setSearchStats(newStats);
            persistSearchData("", mergedMatched, mergedUnique, mergedRaw, newStats);
          }
        })["catch"](function () {});
      });

      // Restore active search ID for continuous live streaming if in-progress
      var savedSearchId = localStorage.getItem("jobhunt_active_search_id");
      if (savedSearchId) {
        setCurrentSearchId(savedSearchId);
      }
      var savedFilters = localStorage.getItem("jobhunt_active_filters");
      if (savedFilters) {
        var f = JSON.parse(savedFilters);
        if (f.jobScope) setJobScope(f.jobScope);
        if (f.filterKeyword !== undefined) setFilterKeyword(f.filterKeyword);
        if (f.filterLocationInput !== undefined) setFilterLocationInput(f.filterLocationInput);
        if (f.filterExpYears !== undefined) setFilterExpYears(f.filterExpYears);
        if (f.filterWorkMode !== undefined) setFilterWorkMode(f.filterWorkMode);
        if (f.minScore !== undefined) setMinScore(f.minScore);
        if (f.filterSeniority !== undefined) setFilterSeniority(f.filterSeniority);
        if (f.filterDate !== undefined) setFilterDate(f.filterDate);
        if (f.filterSource !== undefined) setFilterSource(f.filterSource);
        if (f.sortBy !== undefined) setSortBy(f.sortBy);
      }
    } catch (e) {}
  }, []);

  // Automatically persist pre-harvest criteria whenever user adjusts them
  useEffect(function () {
    try {
      localStorage.setItem("jobhunt_harvest_criteria", JSON.stringify({
        harvestRole: harvestRole,
        harvestLocation: harvestLocation,
        harvestWorkMode: harvestWorkMode,
        harvestExperience: harvestExperience,
        harvestDate: harvestDate,
        harvestSource: harvestSource
      }));
    } catch (e) {}
  }, [harvestRole, harvestLocation, harvestWorkMode, harvestExperience, harvestDate, harvestSource]);

  // Automatically persist in-memory result filter settings
  useEffect(function () {
    try {
      localStorage.setItem("jobhunt_active_filters", JSON.stringify({
        jobScope: jobScope,
        filterKeyword: filterKeyword,
        filterLocationInput: filterLocationInput,
        filterExpYears: filterExpYears,
        filterWorkMode: filterWorkMode,
        minScore: minScore,
        filterSeniority: filterSeniority,
        filterDate: filterDate,
        filterSource: filterSource,
        sortBy: sortBy
      }));
    } catch (e) {}
  }, [jobScope, filterKeyword, filterLocationInput, filterExpYears, filterWorkMode, minScore, filterSeniority, filterDate, filterSource, sortBy]);

  // Execute Pre-Harvest across 9 platforms based strictly on Pre-Harvest Criteria and merge into pool
  var executeSearch = /*#__PURE__*/function () {
    var _ref14 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10() {
      var _resumeProfile$senior;
      var overrideFile,
        overrideRole,
        overrideLocation,
        activeRole,
        activeLocation,
        activeSeniority,
        searchRole,
        formData,
        fileToUpload,
        res,
        data,
        incomingMatched,
        incomingUnique,
        incomingRaw,
        mergedMatched,
        mergedUnique,
        mergedRaw,
        newStats,
        _args10 = arguments;
      return _regeneratorRuntime().wrap(function _callee10$(_context10) {
        while (1) switch (_context10.prev = _context10.next) {
          case 0:
            overrideFile = _args10.length > 0 && _args10[0] !== undefined ? _args10[0] : null;
            overrideRole = _args10.length > 1 && _args10[1] !== undefined ? _args10[1] : null;
            overrideLocation = _args10.length > 2 && _args10[2] !== undefined ? _args10[2] : null;
            setSearching(true);
            setIsHarvestingLive(false);
            activeRole = (overrideRole !== null ? overrideRole : harvestRole || role || "Software Engineer").trim();
            activeLocation = (overrideLocation !== null ? overrideLocation : harvestLocation).trim();
            activeSeniority = harvestExperience !== "all" ? harvestExperience : (resumeProfile === null || resumeProfile === void 0 || (_resumeProfile$senior = resumeProfile.seniority) === null || _resumeProfile$senior === void 0 ? void 0 : _resumeProfile$senior.toLowerCase()) || "mid";
            searchRole = activeRole;
            if (activeSeniority === "intern" && !searchRole.toLowerCase().includes("intern")) {
              searchRole = "".concat(searchRole, " Intern");
            } else if (activeSeniority === "junior" || activeSeniority === "entry") {
              if (!searchRole.toLowerCase().includes("junior") && !searchRole.toLowerCase().includes("entry")) {
                searchRole = "Junior ".concat(searchRole);
              }
            } else if (activeSeniority === "senior" && !searchRole.toLowerCase().includes("senior")) {
              searchRole = "Senior ".concat(searchRole);
            }
            formData = new FormData();
            formData.append("role", searchRole);
            formData.append("location", activeLocation || "Worldwide");
            formData.append("experience_level", activeSeniority);
            formData.append("experience_tier", harvestExperience);
            formData.append("work_mode", harvestWorkMode);
            formData.append("sub_domain", harvestSubDomain);
            if (harvestFacets.length > 0) {
              formData.append("ai_facets", JSON.stringify(harvestFacets));
            }
            formData.append("remote_preference", harvestWorkMode);
            if (harvestDate && harvestDate !== "all") {
              formData.append("max_age_days", harvestDate);
            }
            if (harvestSource && harvestSource !== "all") {
              formData.append("source_platform", harvestSource);
            }
            fileToUpload = overrideFile || resumeFile;
            if (fileToUpload) {
              formData.append("resume", fileToUpload);
            }
            if (resumeProfile) {
              formData.append("resume_profile", JSON.stringify(resumeProfile));
            }
            _context10.prev = 24;
            _context10.next = 27;
            return fetch("".concat(API_BASE_URL, "/api/v1/search"), {
              method: "POST",
              headers: {
                'Authorization': "Bearer ".concat(token)
              },
              body: formData
            });
          case 27:
            res = _context10.sent;
            _context10.next = 30;
            return res.json();
          case 30:
            data = _context10.sent;
            if (res.ok && data.status === 'success') {
              setCurrentSearchId(data.search_id);
              try {
                localStorage.setItem("jobhunt_active_search_id", data.search_id);
              } catch (e) {}
              incomingMatched = data.jobs || [];
              incomingUnique = data.unique_jobs || data.all_jobs || incomingMatched;
              incomingRaw = data.raw_jobs || incomingUnique; // Merge newly harvested jobs into accumulated pool
              mergedMatched = mergeJobList(allMatchedJobsRef.current, incomingMatched);
              mergedUnique = mergeJobList(allUniqueJobsRef.current, incomingUnique);
              mergedRaw = mergeJobList(allRawJobsRef.current, incomingRaw);
              allMatchedJobsRef.current = mergedMatched;
              allUniqueJobsRef.current = mergedUnique;
              allRawJobsRef.current = mergedRaw;
              setAllMatchedJobs(mergedMatched);
              setAllUniqueJobs(mergedUnique);
              setAllRawJobs(mergedRaw);
              newStats = {
                total_found: mergedRaw.length,
                unique_count: mergedUnique.length
              };
              setSearchStats(newStats);

              // Save combined pool reliably to IndexedDB and localStorage
              persistSearchData(data.search_id, mergedMatched, mergedUnique, mergedRaw, newStats);

              // Start continuous background harvesting
              setIsHarvestingLive(true);
              showToast("Harvested & merged ".concat(data.total_found || incomingRaw.length, " postings for ").concat(activeLocation || 'Worldwide', "! (Total pool: ").concat(mergedRaw.length, ")"));
            } else {
              showToast(data.detail || "Search failed.", "error");
            }
            _context10.next = 37;
            break;
          case 34:
            _context10.prev = 34;
            _context10.t0 = _context10["catch"](24);
            showToast(_context10.t0.message, "error");
          case 37:
            _context10.prev = 37;
            setSearching(false);
            return _context10.finish(37);
          case 40:
          case "end":
            return _context10.stop();
        }
      }, _callee10, null, [[24, 34, 37, 40]]);
    }));
    return function executeSearch() {
      return _ref14.apply(this, arguments);
    };
  }();

  // Automatic Continuous Live Streaming Background Poller
  useEffect(function () {
    if (!currentSearchId) return;
    var pollCount = 0;
    var maxPolls = 35; // 35 polls * 2s = ~70s of continuous streaming

    var pollInterval = setInterval( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11() {
      var res, data, streamMergedRaw, streamMergedUnique, streamMergedMatched, updatedStats;
      return _regeneratorRuntime().wrap(function _callee11$(_context11) {
        while (1) switch (_context11.prev = _context11.next) {
          case 0:
            pollCount++;
            if (!(pollCount > maxPolls)) {
              _context11.next = 5;
              break;
            }
            clearInterval(pollInterval);
            setIsHarvestingLive(false);
            return _context11.abrupt("return");
          case 5:
            _context11.prev = 5;
            _context11.next = 8;
            return fetch("".concat(API_BASE_URL, "/api/v1/jobs/").concat(currentSearchId));
          case 8:
            res = _context11.sent;
            if (!res.ok) {
              _context11.next = 15;
              break;
            }
            _context11.next = 12;
            return res.json();
          case 12:
            data = _context11.sent;
            if (data.raw_jobs && data.raw_jobs.length > 0) {
              streamMergedRaw = mergeJobList(allRawJobsRef.current, data.raw_jobs || []);
              streamMergedUnique = mergeJobList(allUniqueJobsRef.current, data.unique_jobs || []);
              streamMergedMatched = mergeJobList(allMatchedJobsRef.current, data.jobs || []);
              allRawJobsRef.current = streamMergedRaw;
              allUniqueJobsRef.current = streamMergedUnique;
              allMatchedJobsRef.current = streamMergedMatched;
              setAllRawJobs(streamMergedRaw);
              setAllUniqueJobs(streamMergedUnique);
              setAllMatchedJobs(streamMergedMatched);
              updatedStats = {
                total_found: streamMergedRaw.length,
                unique_count: streamMergedUnique.length
              };
              setSearchStats(updatedStats);

              // Persist combined live streaming updates reliably
              persistSearchData(currentSearchId, streamMergedMatched, streamMergedUnique, streamMergedRaw, updatedStats);

              // Keep modal contacts synced
              if (data.jobs && data.jobs.length > 0) {
                setSelectedJob(function (prev) {
                  if (!prev) return null;
                  var updated = data.jobs.find(function (j) {
                    return j.id === prev.id;
                  }) || (data.unique_jobs || []).find(function (j) {
                    return j.id === prev.id;
                  });
                  return updated || prev;
                });
              }
            }
            if (data.status === 'completed' && pollCount > 6) {
              setIsHarvestingLive(false);
              clearInterval(pollInterval);
            }
          case 15:
            _context11.next = 19;
            break;
          case 17:
            _context11.prev = 17;
            _context11.t0 = _context11["catch"](5);
          case 19:
          case "end":
            return _context11.stop();
        }
      }, _callee11, null, [[5, 17]]);
    })), 2000);
    return function () {
      return clearInterval(pollInterval);
    };
  }, [currentSearchId]);

  // Resume Upload & Parse (Auto triggers search on upload)
  var handleResumeChange = /*#__PURE__*/function () {
    var _ref16 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(e) {
      var file, formData, res, data, _data$profile$skills, newRole;
      return _regeneratorRuntime().wrap(function _callee12$(_context12) {
        while (1) switch (_context12.prev = _context12.next) {
          case 0:
            file = e.target.files[0];
            if (file) {
              _context12.next = 3;
              break;
            }
            return _context12.abrupt("return");
          case 3:
            setResumeFile(file);
            setParsingResume(true);
            formData = new FormData();
            formData.append("file", file);
            _context12.prev = 7;
            _context12.next = 10;
            return fetch("".concat(API_BASE_URL, "/api/v1/search/parse-resume"), {
              method: "POST",
              body: formData
            });
          case 10:
            res = _context12.sent;
            _context12.next = 13;
            return res.json();
          case 13:
            data = _context12.sent;
            if (res.ok && data.status === 'success') {
              setResumeProfile(data.profile);
              try {
                localStorage.setItem("jobhunt_resume_profile", JSON.stringify(data.profile));
              } catch (err) {}
              newRole = data.profile.target_roles && data.profile.target_roles[0] ? data.profile.target_roles[0] : role;
              setRole(newRole);
              showToast("Resume parsed! Found ".concat(((_data$profile$skills = data.profile.skills) === null || _data$profile$skills === void 0 ? void 0 : _data$profile$skills.length) || 0, " skills. Fetching jobs..."));

              // Live fetch jobs matching the newly uploaded resume
              executeSearch(file, newRole);
            } else {
              showToast(data.detail || "Failed to parse resume.", "error");
            }
            _context12.next = 20;
            break;
          case 17:
            _context12.prev = 17;
            _context12.t0 = _context12["catch"](7);
            showToast(_context12.t0.message, "error");
          case 20:
            _context12.prev = 20;
            setParsingResume(false);
            return _context12.finish(20);
          case 23:
          case "end":
            return _context12.stop();
        }
      }, _callee12, null, [[7, 17, 20, 23]]);
    }));
    return function handleResumeChange(_x5) {
      return _ref16.apply(this, arguments);
    };
  }();

  // Remove Resume and Clear Associated Search State
  var handleRemoveResume = function handleRemoveResume() {
    setResumeFile(null);
    setResumeProfile(null);
    setAllMatchedJobs([]);
    setAllUniqueJobs([]);
    setAllRawJobs([]);
    setCurrentSearchId("");
    setSearchStats({
      total_found: 0,
      unique_count: 0
    });
    try {
      localStorage.removeItem("jobhunt_resume_profile");
      localStorage.removeItem("jobhunt_cached_search");
    } catch (err) {}
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
    showToast("Resume and active results cleared. Upload a new resume to search.");
  };

  // Execute Job Search Form Submit
  var handleSearchSubmit = function handleSearchSubmit(e) {
    e === null || e === void 0 || e.preventDefault();
    executeSearch();
  };

  // Comprehensive Client-Side & Live Streaming CSV Exporter for Raw, Unique, Curated, or Filtered Jobs
  var exportJobsToCSV = function exportJobsToCSV() {
    var scope = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "raw";
    var jobsList = [];
    var filenamePrefix = "jobhunt_jobs";
    var scopeLabel = "All Harvested";
    if (scope === "raw") {
      jobsList = allRawJobs;
      filenamePrefix = "raw_harvested_jobs";
      scopeLabel = "Raw Harvested";
    } else if (scope === "unique") {
      jobsList = allUniqueJobs;
      filenamePrefix = "unique_roles_jobs";
      scopeLabel = "Unique Roles";
    } else if (scope === "curated") {
      jobsList = allMatchedJobs;
      filenamePrefix = "curated_matched_jobs";
      scopeLabel = "Curated Matches";
    } else if (scope === "applied") {
      jobsList = appliedJobs;
      filenamePrefix = "applied_jobs_tracker";
      scopeLabel = "Applied Jobs";
    } else if (scope === "filtered") {
      jobsList = filteredJobs;
      filenamePrefix = "filtered_view_jobs";
      scopeLabel = "Filtered View";
    }
    if (!jobsList || jobsList.length === 0) {
      showToast("No jobs available to export in ".concat(scopeLabel, "."), "error");
      return;
    }
    generateJobsCSV(jobsList, scopeLabel, filenamePrefix);
    showToast("Exported ".concat(jobsList.length, " ").concat(scopeLabel, " jobs to CSV!"));
    setCsvMenuOpen(false);
  };

  // Export Company Insights CSV
  var handleExportInsightsCSV = /*#__PURE__*/function () {
    var _ref17 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13() {
      var res, blob, url, a;
      return _regeneratorRuntime().wrap(function _callee13$(_context13) {
        while (1) switch (_context13.prev = _context13.next) {
          case 0:
            if (currentSearchId) {
              _context13.next = 2;
              break;
            }
            return _context13.abrupt("return");
          case 2:
            setExportingInsights(true);
            _context13.prev = 3;
            _context13.next = 6;
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
            res = _context13.sent;
            if (!res.ok) {
              _context13.next = 21;
              break;
            }
            _context13.next = 10;
            return res.blob();
          case 10:
            blob = _context13.sent;
            url = window.URL.createObjectURL(blob);
            a = document.createElement("a");
            a.href = url;
            a.download = "company_insights_".concat(currentSearchId, ".csv");
            document.body.appendChild(a);
            a.click();
            a.remove();
            showToast("Downloaded Company Insights & Team Contacts CSV!");
            _context13.next = 22;
            break;
          case 21:
            showToast("Failed to generate insights CSV.", "error");
          case 22:
            _context13.next = 27;
            break;
          case 24:
            _context13.prev = 24;
            _context13.t0 = _context13["catch"](3);
            showToast(_context13.t0.message, "error");
          case 27:
            _context13.prev = 27;
            setExportingInsights(false);
            return _context13.finish(27);
          case 30:
          case "end":
            return _context13.stop();
        }
      }, _callee13, null, [[3, 24, 27, 30]]);
    }));
    return function handleExportInsightsCSV() {
      return _ref17.apply(this, arguments);
    };
  }();

  // Update job in list after contacts are fetched in modal
  var handleUpdateJobContacts = function handleUpdateJobContacts(updatedJob) {
    setAllMatchedJobs(function (prev) {
      return prev.map(function (j) {
        return j.id === updatedJob.id ? updatedJob : j;
      });
    });
    setAllUniqueJobs(function (prev) {
      return prev.map(function (j) {
        return j.id === updatedJob.id ? updatedJob : j;
      });
    });
    setAllRawJobs(function (prev) {
      return prev.map(function (j) {
        return j.id === updatedJob.id ? updatedJob : j;
      });
    });
    setAppliedJobs(function (prev) {
      return prev.map(function (j) {
        return getJobKey(j) === getJobKey(updatedJob) ? _objectSpread(_objectSpread({}, updatedJob), {}, {
          applied_at: j.applied_at
        }) : j;
      });
    });
    setSelectedJob(updatedJob);
  };

  // Filter & Sort Logic for Selected Pool (Curated, Unique, Raw, or Applied)
  var filteredJobs = useMemo(function () {
    var sourceList = [];
    if (jobScope === 'raw') {
      sourceList = allRawJobs && allRawJobs.length > 0 ? allRawJobs : allUniqueJobs && allUniqueJobs.length > 0 ? allUniqueJobs : allMatchedJobs;
    } else if (jobScope === 'unique') {
      sourceList = allUniqueJobs && allUniqueJobs.length > 0 ? allUniqueJobs : allRawJobs && allRawJobs.length > 0 ? allRawJobs : allMatchedJobs;
    } else if (jobScope === 'curated') {
      sourceList = allMatchedJobs && allMatchedJobs.length > 0 ? allMatchedJobs : allUniqueJobs && allUniqueJobs.length > 0 ? allUniqueJobs : allRawJobs;
    } else if (jobScope === 'applied') {
      sourceList = appliedJobs;
    } else {
      sourceList = allMatchedJobs && allMatchedJobs.length > 0 ? allMatchedJobs : allUniqueJobs && allUniqueJobs.length > 0 ? allUniqueJobs : allRawJobs;
    }
    return (sourceList || []).filter(function (job) {
      if (!job) return false;
      var title = (job.title || "").toLowerCase();
      var company = (job.company || "").toLowerCase();
      var jobLoc = (job.location || "").toLowerCase();
      var desc = (job.description || "").toLowerCase();
      var source = (job.source || "").toLowerCase();
      var expReq = (job.experience_required || "").toLowerCase();
      var fit = (job.experience_fit || "").toLowerCase();

      // 1. Smart Multi-Token & Domain Keyword Search (Title, Company, Description, Skills)
      if (filterKeyword && filterKeyword.trim()) {
        var kw = filterKeyword.toLowerCase().trim();
        var kwTokens = kw.split(/[,/\s+|\-]+/).filter(function (t) {
          return t.length > 1;
        });
        var skillsStr = (job.matching_skills || []).join(" ").toLowerCase();
        var fullText = "".concat(title, " ").concat(company, " ").concat(jobLoc, " ").concat(desc, " ").concat(skillsStr);

        // Direct full phrase match
        var directMatch = fullText.includes(kw);

        // Multi-token match (Every search word matches anywhere in title/company/skills/description)
        var allTokensMatch = kwTokens.length > 0 && kwTokens.every(function (tok) {
          return fullText.includes(tok);
        });

        // Smart AI/ML Title abbreviations & domain expansion
        var domainTitleMatch = false;
        if (kw.includes("ai") || kw.includes("artificial intelligence") || kw.includes("ml") || kw.includes("machine learning")) {
          var hasAiDomain = title.includes("ai") || title.includes("ml") || title.includes("machine learning") || title.includes("artificial intelligence") || title.includes("llm") || title.includes("genai") || title.includes("rag") || title.includes("prompt");
          var hasInternTerm = kw.includes("intern") || kw.includes("internship");
          if (hasInternTerm) {
            domainTitleMatch = hasAiDomain && (title.includes("intern") || title.includes("trainee") || title.includes("co-op") || title.includes("student") || title.includes("fellow") || title.includes("apprentice"));
          } else {
            domainTitleMatch = hasAiDomain;
          }
        }
        if (!directMatch && !allTokensMatch && !domainTitleMatch) {
          return false;
        }
      }

      // 2. Enhanced Smart Location NLP & Geographic Hierarchy Filter
      if (filterLocationInput && filterLocationInput.trim()) {
        if (!matchesLocationNLP(filterLocationInput, jobLoc, desc, source)) {
          return false;
        }
      }

      // 3. Work Mode
      var isRemote = jobLoc.includes('remote') || jobLoc.includes('wfh') || jobLoc.includes('work from home') || source === 'himalayas' || source === 'jobicy' || source === 'remoteok' || jobLoc.includes('anywhere');
      var isHybrid = jobLoc.includes('hybrid') || desc.includes('hybrid') || desc.includes('days in office') || desc.includes('days a week in office') || desc.includes('days per week in office');
      var isOnsite = !isRemote && !isHybrid;
      if (filterWorkMode === 'remote' && !isRemote) return false;
      if (filterWorkMode === 'hybrid' && !isHybrid) return false;
      if (filterWorkMode === 'onsite' && !isOnsite) return false;

      // 4. Min Score (Only apply score cutoff in 'curated' matches mode, never in raw, unique, or applied scopes)
      if (jobScope === 'curated' && minScore > 0 && (job.match_score || 0) < minScore) {
        return false;
      }

      // 5. Granular Experience Level & Seniority Fit (Only apply if explicitly selected by user)
      if (filterExpYears !== 'all' || filterSeniority !== 'all') {
        var minYears = typeof job.min_experience_years === 'number' ? job.min_experience_years : -1;
        var isTrueIntern = title.includes('intern') || title.includes('internship') || title.includes('trainee') || title.includes('apprentice') || title.includes('co-op') || title.includes('student') || fit.includes('intern') || expReq.includes('intern');
        var isSeniorRole = title.includes('senior') || title.includes('sr.') || title.includes('sr ') || title.includes('lead') || title.includes('principal') || title.includes('staff') || title.includes('director') || title.includes('architect') || title.includes('head of') || fit.includes('senior') || fit.includes('lead') || minYears >= 5;
        var isEntryRole = (title.includes('entry') || title.includes('fresher') || title.includes('graduate') || title.includes('new grad') || expReq.includes('0-1') || expReq.includes('1 yr') || minYears === 0 || minYears === 1) && !isSeniorRole;
        var isJuniorRole = (title.includes('junior') || title.includes('jr.') || title.includes('associate') || expReq.includes('1-2') || expReq.includes('2 yr') || minYears === 2) && !isSeniorRole;
        var requiresYears = minYears >= 2 || desc.includes('2+ year') || desc.includes('3+ year') || desc.includes('4+ year') || desc.includes('5+ year') || desc.includes('2-4 year') || desc.includes('3-5 year');
        if (filterExpYears === '0' && (!isTrueIntern || requiresYears || isSeniorRole)) return false;
        if (filterExpYears === '1' && (!isEntryRole || isTrueIntern || isSeniorRole || minYears > 1)) return false;
        if (filterExpYears === '2' && (!isJuniorRole || isTrueIntern || isSeniorRole || minYears > 2)) return false;
        if (filterExpYears === '3-5' && (minYears < 2 || minYears > 5 || isTrueIntern || title.includes('principal') || title.includes('staff'))) return false;
        if (filterExpYears === '5+' && !isSeniorRole && minYears < 4) return false;
        if (filterExpYears === '8+' && minYears < 7 && !title.includes('lead') && !title.includes('principal') && !title.includes('staff')) return false;

        // Seniority dropdown fallback
        if (filterSeniority === 'intern' && (!isTrueIntern || requiresYears || isSeniorRole)) return false;
        if (filterSeniority === 'junior' && (!isJuniorRole && !isEntryRole || isSeniorRole)) return false;
        if (filterSeniority === 'senior' && !isSeniorRole) return false;
      }

      // 6. Freshness Date
      if (filterDate === '24h' && !isWithinDays(job.posted_date, 1)) return false;
      if (filterDate === '3d' && !isWithinDays(job.posted_date, 3)) return false;
      if (filterDate === '7d' && !isWithinDays(job.posted_date, 7)) return false;
      if (filterDate === '30d' && !isWithinDays(job.posted_date, 30)) return false;

      // 7. Source Category
      if (filterCategory !== 'all') {
        var jobCat = (job.source_category || '').toLowerCase();
        var jobSrc = (job.source || '').toLowerCase();
        if (filterCategory === 'india' && jobCat !== 'india' && !['instahyre', 'cutshort', 'hirist', 'naukri', 'apna', 'hiredoor', 'unstop'].some(function (s) {
          return jobSrc.includes(s);
        }) && !jobLoc.includes('india')) return false;
        if (filterCategory === 'ai_registry' && jobCat !== 'ai_registry' && !['ashby', 'greenhouse', 'lever', 'workable', 'aijobs', 'kdnuggets'].some(function (s) {
          return jobSrc.includes(s);
        })) return false;
        if (filterCategory === 'enterprise_workday' && jobCat !== 'enterprise_workday' && !['workday', 'smartrecruiters', 'phenom', 'recruitee', 'teamtailor'].some(function (s) {
          return jobSrc.includes(s);
        })) return false;
        if (filterCategory === 'startups' && jobCat !== 'startups' && !['ycombinator', 'yc', 'hn', 'cutshort', 'recruitee', 'builtin', 'themuse', 'muse'].some(function (s) {
          return jobSrc.includes(s);
        })) return false;
        if (filterCategory === 'remote' && jobCat !== 'remote' && !['weworkremotely', 'workingnomads', 'remotive', 'remoteok', 'himalayas', 'jobicy', 'arbeitnow', 'freehire'].some(function (s) {
          return jobSrc.includes(s);
        })) return false;
        if (filterCategory === 'internships' && jobCat !== 'internships' && !['internshala', 'unstop', 'simplify'].some(function (s) {
          return jobSrc.includes(s);
        }) && !title.includes('intern')) return false;
      }

      // 8. Source Platform
      if (filterSource !== 'all') {
        if (filterSource === 'india' && !['instahyre', 'cutshort', 'hirist'].some(function (s) {
          return source.includes(s);
        })) return false;else if (!source.includes(filterSource)) return false;
      }
      return true;
    }).sort(function (a, b) {
      if (sortBy === 'score') return (b.match_score || 0) - (a.match_score || 0);
      if (sortBy === 'date') return new Date(b.posted_date || 0) - new Date(a.posted_date || 0);
      return (b.match_score || 0) - (a.match_score || 0);
    });
  }, [jobScope, allMatchedJobs, allUniqueJobs, allRawJobs, appliedJobs, filterKeyword, filterLocationInput, filterExpYears, filterWorkMode, filterCategory, minScore, filterSeniority, filterDate, filterSource, sortBy]);

  // RAG AI Query Handler
  var handleAskAI = /*#__PURE__*/function () {
    var _ref18 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14(e) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee14$(_context14) {
        while (1) switch (_context14.prev = _context14.next) {
          case 0:
            e === null || e === void 0 || e.preventDefault();
            if (!(!ragQuery.trim() || !currentSearchId)) {
              _context14.next = 3;
              break;
            }
            return _context14.abrupt("return");
          case 3:
            setRagLoading(true);
            setRagAnswer("");
            _context14.prev = 5;
            _context14.next = 8;
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
            res = _context14.sent;
            _context14.next = 11;
            return res.json();
          case 11:
            data = _context14.sent;
            if (res.ok) {
              setRagAnswer(data.answer || "No response received.");
            } else {
              setRagAnswer("Error: ".concat(data.detail || 'Could not query assistant.'));
            }
            _context14.next = 18;
            break;
          case 15:
            _context14.prev = 15;
            _context14.t0 = _context14["catch"](5);
            setRagAnswer("Error: ".concat(_context14.t0.message));
          case 18:
            _context14.prev = 18;
            setRagLoading(false);
            return _context14.finish(18);
          case 21:
          case "end":
            return _context14.stop();
        }
      }, _callee14, null, [[5, 15, 18, 21]]);
    }));
    return function handleAskAI(_x6) {
      return _ref18.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, activeSnapshot && /*#__PURE__*/React.createElement("div", {
    className: "p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start sm:items-center gap-3.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl shrink-0"
  }, "\uD83D\uDCDC"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-0.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 flex-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold text-white uppercase tracking-wider"
  }, "Historical Automation Digest Snapshot"), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
  }, "Offline Interactive View")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-300 leading-relaxed"
  }, "Viewing digest for ", /*#__PURE__*/React.createElement("strong", {
    className: "text-white font-semibold"
  }, "\"", activeSnapshot.role, "\""), " in ", /*#__PURE__*/React.createElement("span", {
    className: "text-indigo-300 font-medium"
  }, activeSnapshot.location || 'Remote'), " sent on ", activeSnapshot.sent_at ? new Date(activeSnapshot.sent_at).toLocaleString() : 'Recent', " (", allMatchedJobs.length, " Curated / ", allRawJobs.length, " Raw). All filters and contacts work interactively without re-scraping!"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      onExitSnapshot === null || onExitSnapshot === void 0 || onExitSnapshot();
      JobDB.loadPool().then(function (saved) {
        if (saved) {
          setAllMatchedJobs(saved.matched || []);
          setAllUniqueJobs(saved.unique || []);
          setAllRawJobs(saved.raw || []);
          setSearchStats(saved.stats || {
            total_found: (saved.raw || []).length,
            unique_count: (saved.unique || []).length
          });
        }
      });
      showToast("Exited historical snapshot. Restored live pool.");
    },
    className: "px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/15 text-xs font-bold shrink-0 transition-all flex items-center gap-2 shadow-sm"
  }, /*#__PURE__*/React.createElement("span", null, "\u2715"), /*#__PURE__*/React.createElement("span", null, "Exit Snapshot"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-3 gap-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-2 minimal-card rounded-xl p-5 sm:p-6 border border-white/[0.08] flex flex-col justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-base font-bold text-white flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDE80"), " Live Harvesting & Job Scraper Engine"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-0.5"
  }, "Set criteria to crawl jobs across 9 platforms and merge into your pool. Background auto-discovery also continuously crawls these settings.")), /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"
  }), "9 ATS Platforms")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSearchSubmit,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1"
  }, "Target Role / Title ", /*#__PURE__*/React.createElement("span", {
    className: "text-indigo-400"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    required: true,
    value: harvestRole,
    onChange: function onChange(e) {
      setHarvestRole(e.target.value);
      setRole(e.target.value);
    },
    placeholder: "e.g. AI ML Engineer, Data Scientist, Full Stack",
    className: "w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[11px] font-semibold text-slate-300 uppercase tracking-wider"
  }, "Target Location"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-500"
  }, "Leave blank for Worldwide")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: harvestLocation,
    onChange: function onChange(e) {
      return setHarvestLocation(e.target.value);
    },
    placeholder: "e.g. Pune, Bangalore, US, Remote, Worldwide...",
    className: "w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-1.5 text-[11px]"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-400 text-[10px] font-medium uppercase mr-1"
  }, "Quick Hubs:"), [{
    label: "📍 Worldwide",
    val: ""
  }, {
    label: "🇮🇳 India",
    val: "India"
  }, {
    label: "📍 Pune",
    val: "Pune"
  }, {
    label: "📍 Bangalore",
    val: "Bangalore"
  }, {
    label: "🇺🇸 US",
    val: "United States"
  }, {
    label: "🌉 Bay Area",
    val: "Bay Area"
  }, {
    label: "🇬🇧 UK",
    val: "UK"
  }, {
    label: "🇩🇪 Germany",
    val: "Germany"
  }, {
    label: "🏠 Remote",
    val: "Remote"
  }].map(function (hub, idx) {
    return /*#__PURE__*/React.createElement("button", {
      key: idx,
      type: "button",
      onClick: function onClick() {
        return setHarvestLocation(hub.val);
      },
      className: "px-2 py-0.5 rounded-md transition-all font-medium ".concat(harvestLocation.toLowerCase() === hub.val.toLowerCase() || !harvestLocation && hub.val === "" ? "bg-indigo-600 text-white border border-indigo-400 shadow-sm" : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/[0.06]")
    }, hub.label);
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Work Mode"), /*#__PURE__*/React.createElement("select", {
    value: harvestWorkMode,
    onChange: function onChange(e) {
      return setHarvestWorkMode(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-medium text-cyan-300"
  }, /*#__PURE__*/React.createElement("option", {
    value: "any"
  }, "\uD83C\uDF10 All Modes"), /*#__PURE__*/React.createElement("option", {
    value: "remote"
  }, "\uD83C\uDFE0 Remote Only"), /*#__PURE__*/React.createElement("option", {
    value: "hybrid"
  }, "\uD83D\uDD04 Hybrid"), /*#__PURE__*/React.createElement("option", {
    value: "onsite"
  }, "\uD83C\uDFE2 Onsite / Office"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Experience"), /*#__PURE__*/React.createElement("select", {
    value: harvestExperience,
    onChange: function onChange(e) {
      return setHarvestExperience(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-medium text-emerald-300"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\uD83C\uDF93 All Levels"), /*#__PURE__*/React.createElement("option", {
    value: "intern"
  }, "\uD83C\uDF31 Internship (0 Yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "entry"
  }, "\uD83D\uDE80 0\u20131 Yr (Entry)"), /*#__PURE__*/React.createElement("option", {
    value: "junior"
  }, "\u26A1 1\u20132 Yrs (Junior)"), /*#__PURE__*/React.createElement("option", {
    value: "mid"
  }, "\uD83D\uDCBC 3\u20135 Yrs (Mid)"), /*#__PURE__*/React.createElement("option", {
    value: "senior"
  }, "\uD83D\uDC51 5+ Yrs (Senior)"), /*#__PURE__*/React.createElement("option", {
    value: "lead"
  }, "\uD83C\uDFC6 8+ Yrs (Lead)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Date Posted"), /*#__PURE__*/React.createElement("select", {
    value: harvestDate,
    onChange: function onChange(e) {
      return setHarvestDate(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-medium text-indigo-300"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\uD83D\uDCC5 Any Time"), /*#__PURE__*/React.createElement("option", {
    value: "1"
  }, "\u26A1 Past 24 Hours"), /*#__PURE__*/React.createElement("option", {
    value: "3"
  }, "\uD83D\uDD25 Past 3 Days"), /*#__PURE__*/React.createElement("option", {
    value: "7"
  }, "\uD83D\uDCC5 Past 7 Days"), /*#__PURE__*/React.createElement("option", {
    value: "14"
  }, "\uD83D\uDDD3\uFE0F Past 14 Days"), /*#__PURE__*/React.createElement("option", {
    value: "30"
  }, "\uD83D\uDDD3\uFE0F Past 30 Days"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Platform Source"), /*#__PURE__*/React.createElement("select", {
    value: harvestSource,
    onChange: function onChange(e) {
      return setHarvestSource(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-medium text-purple-300"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\uD83C\uDF10 All Platforms (30+ Connectors)"), /*#__PURE__*/React.createElement("option", {
    value: "naukri"
  }, "\uD83C\uDDEE\uD83C\uDDF3 Naukri India"), /*#__PURE__*/React.createElement("option", {
    value: "apna"
  }, "\uD83C\uDDEE\uD83C\uDDF3 Apna India"), /*#__PURE__*/React.createElement("option", {
    value: "hiredoor"
  }, "\uD83C\uDDEE\uD83C\uDDF3 HireDoor (Verified Tech)"), /*#__PURE__*/React.createElement("option", {
    value: "instahyre"
  }, "\uD83C\uDDEE\uD83C\uDDF3 Instahyre"), /*#__PURE__*/React.createElement("option", {
    value: "cutshort"
  }, "\uD83C\uDDEE\uD83C\uDDF3 Cutshort"), /*#__PURE__*/React.createElement("option", {
    value: "hirist"
  }, "\uD83C\uDDEE\uD83C\uDDF3 Hirist"), /*#__PURE__*/React.createElement("option", {
    value: "internshala"
  }, "\uD83C\uDF31 Internshala"), /*#__PURE__*/React.createElement("option", {
    value: "unstop"
  }, "\uD83C\uDF93 Unstop Freshers"), /*#__PURE__*/React.createElement("option", {
    value: "builtin"
  }, "\uD83D\uDE80 Built In (Tech & Startups)"), /*#__PURE__*/React.createElement("option", {
    value: "ycombinator"
  }, "\uD83D\uDE80 Y Combinator"), /*#__PURE__*/React.createElement("option", {
    value: "workday"
  }, "\uD83D\uDCBC Workday Enterprise CXS"), /*#__PURE__*/React.createElement("option", {
    value: "smartrecruiters"
  }, "\uD83C\uDFE2 SmartRecruiters ATS"), /*#__PURE__*/React.createElement("option", {
    value: "workable"
  }, "\uD83C\uDFAF Workable ATS"), /*#__PURE__*/React.createElement("option", {
    value: "recruitee"
  }, "\uD83E\uDD84 Recruitee ATS"), /*#__PURE__*/React.createElement("option", {
    value: "teamtailor"
  }, "\u26A1 Teamtailor ATS"), /*#__PURE__*/React.createElement("option", {
    value: "greenhouse"
  }, "\uD83C\uDF3F Greenhouse ATS"), /*#__PURE__*/React.createElement("option", {
    value: "lever"
  }, "\u2699\uFE0F Lever ATS"), /*#__PURE__*/React.createElement("option", {
    value: "ashby"
  }, "\u26A1 Ashby ATS"), /*#__PURE__*/React.createElement("option", {
    value: "phenom"
  }, "\uD83D\uDD2E Phenom ATS"), /*#__PURE__*/React.createElement("option", {
    value: "aijobs"
  }, "\uD83E\uDD16 KDnuggets & AI-Jobs"), /*#__PURE__*/React.createElement("option", {
    value: "weworkremotely"
  }, "\uD83D\uDCBB We Work Remotely"), /*#__PURE__*/React.createElement("option", {
    value: "workingnomads"
  }, "\u26FA Working Nomads"), /*#__PURE__*/React.createElement("option", {
    value: "remotive"
  }, "\uD83D\uDCE1 Remotive"), /*#__PURE__*/React.createElement("option", {
    value: "himalayas"
  }, "\uD83C\uDFD4\uFE0F Himalayas"), /*#__PURE__*/React.createElement("option", {
    value: "remoteok"
  }, "\uD83C\uDFD6\uFE0F RemoteOK"), /*#__PURE__*/React.createElement("option", {
    value: "jobicy"
  }, "\uD83C\uDF0D Jobicy"), /*#__PURE__*/React.createElement("option", {
    value: "arbeitnow"
  }, "\uD83C\uDDEA\uD83C\uDDFA Arbeitnow"), /*#__PURE__*/React.createElement("option", {
    value: "linkedin"
  }, "\uD83D\uDCBC LinkedIn & Indeed"), /*#__PURE__*/React.createElement("option", {
    value: "themuse"
  }, "\uD83C\uDFDB\uFE0F The Muse (Tech & Enterprise)"), /*#__PURE__*/React.createElement("option", {
    value: "simplify"
  }, "\uD83C\uDF93 Simplify Internships")))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5 pt-1"
  }, /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: searching,
    className: "flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
  }, searching ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
  }), /*#__PURE__*/React.createElement("span", null, "Harvesting Across Platforms...")) : allRawJobs.length > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD04 Reharvest & Merge Fresh Jobs (", harvestLocation || 'Worldwide', ")"), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono"
  }, "Pool: ", allRawJobs.length)) : /*#__PURE__*/React.createElement("span", null, "\u26A1 Harvest Live Jobs (", harvestLocation || 'Worldwide', ")")), allRawJobs.length > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleClearJobPool,
    className: "py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 border border-white/10 text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5",
    title: "Clear all accumulated harvested jobs"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDDD1\uFE0F Clear Pool"))))), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400"
  }, /*#__PURE__*/React.createElement("span", null, "Background discovery continuously syncs fresh findings"), /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-400 font-medium flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"
  }), "Live Engine"))), /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl p-5 sm:p-6 border border-white/[0.08] flex flex-col justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-3 pb-2.5 border-b border-white/[0.06]"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-white text-xs flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCC4"), " Active Resume Profile"), parsingResume && /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-indigo-400 animate-pulse font-medium"
  }, "Parsing...")), resumeProfile ? /*#__PURE__*/React.createElement("div", {
    className: "space-y-3 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-2.5 rounded-lg bg-slate-900/90 border border-indigo-500/20 space-y-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-slate-200"
  }, resumeProfile.current_or_recent_role || role || "Software Professional"), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold"
  }, resumeProfile.seniority || "Junior")), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400"
  }, resumeProfile.experience_years ? "".concat(resumeProfile.experience_years, " Years Experience") : '0-1 Years Experience', " \u2022 ", resumeProfile.core_domain || 'AI & Tech')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-semibold text-slate-400 uppercase mb-1.5 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", null, "Indexed Skills (", ((_resumeProfile$skills = resumeProfile.skills) === null || _resumeProfile$skills === void 0 ? void 0 : _resumeProfile$skills.length) || 0, "):")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1"
  }, (resumeProfile.skills || []).map(function (skill, idx) {
    return /*#__PURE__*/React.createElement("span", {
      key: idx,
      className: "px-1.5 py-0.5 rounded bg-slate-800 border border-white/5 text-slate-300 text-[10px]"
    }, skill);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "pt-2 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "flex-1 text-center py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-white/10 cursor-pointer transition-all"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDD04 Replace Resume"), /*#__PURE__*/React.createElement("input", {
    ref: resumeInputRef,
    type: "file",
    accept: ".pdf,.docx,.txt",
    onChange: handleResumeChange,
    className: "hidden"
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleRemoveResume,
    className: "py-1.5 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 text-[11px] font-medium transition-all flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDDD1\uFE0F"), /*#__PURE__*/React.createElement("span", null, "Remove")))) : /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-700/80 text-center space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-2xl"
  }, "\uD83D\uDCE4"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-semibold text-slate-200"
  }, "Upload Your Resume"), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-400 leading-relaxed"
  }, "Upload PDF or DOCX to auto-extract 30+ skills, auto-fill target role, and calculate live compatibility scores."), /*#__PURE__*/React.createElement("input", {
    ref: resumeInputRef,
    type: "file",
    accept: ".pdf,.docx,.txt",
    onChange: handleResumeChange,
    className: "block w-full text-xs text-slate-400 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer pt-2"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400"
  }, /*#__PURE__*/React.createElement("span", null, "Skills Saved Locally"), /*#__PURE__*/React.createElement("span", {
    className: resumeProfile ? "text-emerald-400 font-medium" : "text-slate-500"
  }, resumeProfile ? "Saved" : "Not Loaded")))), (allMatchedJobs.length > 0 || allUniqueJobs.length > 0 || allRawJobs.length > 0 || appliedJobs.length > 0) && /*#__PURE__*/React.createElement("div", {
    className: "space-y-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl p-4 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 sm:gap-3 flex-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setJobScope("raw");
    },
    className: "text-left px-3 py-1.5 rounded-xl border transition-all ".concat(jobScope === "raw" ? "bg-indigo-600/25 border-indigo-500/70 shadow-sm" : "bg-slate-900/40 border-white/[0.04] hover:bg-slate-900/80")
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400 font-medium"
  }, "Raw Harvested"), /*#__PURE__*/React.createElement("div", {
    className: "text-base sm:text-lg font-bold text-white"
  }, searchStats.total_found || allRawJobs.length)), /*#__PURE__*/React.createElement("div", {
    className: "h-6 w-px bg-white/10 hidden sm:block"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setJobScope("unique");
    },
    className: "text-left px-3 py-1.5 rounded-xl border transition-all ".concat(jobScope === "unique" ? "bg-indigo-600/25 border-indigo-500/70 shadow-sm" : "bg-slate-900/40 border-white/[0.04] hover:bg-slate-900/80")
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400 font-medium"
  }, "Unique Roles"), /*#__PURE__*/React.createElement("div", {
    className: "text-base sm:text-lg font-bold text-indigo-400"
  }, searchStats.unique_count || allUniqueJobs.length)), /*#__PURE__*/React.createElement("div", {
    className: "h-6 w-px bg-white/10 hidden sm:block"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setJobScope("curated");
    },
    className: "text-left px-3 py-1.5 rounded-xl border transition-all ".concat(jobScope === "curated" ? "bg-emerald-600/25 border-emerald-500/70 shadow-sm" : "bg-slate-900/40 border-white/[0.04] hover:bg-slate-900/80")
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400 font-medium"
  }, "Curated Matches"), /*#__PURE__*/React.createElement("div", {
    className: "text-base sm:text-lg font-bold text-emerald-400"
  }, allMatchedJobs.length)), /*#__PURE__*/React.createElement("div", {
    className: "h-6 w-px bg-white/10 hidden sm:block"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setJobScope("applied");
    },
    className: "text-left px-3 py-1.5 rounded-xl border transition-all ".concat(jobScope === "applied" ? "bg-emerald-600/30 border-emerald-400 shadow-sm ring-1 ring-emerald-500/50" : "bg-slate-900/40 border-white/[0.04] hover:bg-slate-900/80")
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400 font-medium flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-400"
  }, "\u2713"), " Applied Tracker"), /*#__PURE__*/React.createElement("div", {
    className: "text-base sm:text-lg font-bold text-emerald-300"
  }, appliedJobs.length)), /*#__PURE__*/React.createElement("div", {
    className: "h-6 w-px bg-white/10 hidden sm:block"
  }), /*#__PURE__*/React.createElement("div", {
    className: "px-2 py-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400 font-medium"
  }, "Filtered View"), /*#__PURE__*/React.createElement("div", {
    className: "text-base sm:text-lg font-bold text-cyan-300"
  }, filteredJobs.length)), isHarvestingLive && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold animate-pulse shadow-sm"
  }, /*#__PURE__*/React.createElement("span", {
    className: "relative flex h-2 w-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
  }), /*#__PURE__*/React.createElement("span", {
    className: "relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
  })), /*#__PURE__*/React.createElement("span", null, "Harvesting Live..."))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-2 w-full sm:w-auto relative"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setRagModalOpen(true);
    },
    className: "flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83E\uDD16"), /*#__PURE__*/React.createElement("span", null, "Ask AI")), /*#__PURE__*/React.createElement("div", {
    className: "relative flex-1 sm:flex-none"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setCsvMenuOpen(!csvMenuOpen);
    },
    className: "w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCE5"), /*#__PURE__*/React.createElement("span", null, "Download CSV"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] opacity-75"
  }, "\u25BC")), csvMenuOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-20",
    onClick: function onClick() {
      return setCsvMenuOpen(false);
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute right-0 top-full mt-1.5 w-64 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl p-1.5 z-30 space-y-1 text-xs backdrop-blur-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
  }, "Download Datasets"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return exportJobsToCSV("raw");
    },
    className: "w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] text-slate-200 flex items-center justify-between group transition-all"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm"
  }, "\uD83C\uDF10"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold text-white group-hover:text-indigo-300"
  }, "Raw Harvested CSV"), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400"
  }, "All live multi-board listings"))), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
  }, allRawJobs.length)), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return exportJobsToCSV("unique");
    },
    className: "w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] text-slate-200 flex items-center justify-between group transition-all"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm"
  }, "\uD83E\uDDEC"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold text-indigo-300"
  }, "Unique Roles CSV"), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400"
  }, "Deduplicated unique postings"))), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30"
  }, allUniqueJobs.length)), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return exportJobsToCSV("curated");
    },
    className: "w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] text-slate-200 flex items-center justify-between group transition-all"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm"
  }, "\uD83C\uDFAF"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold text-emerald-300"
  }, "Curated Matches CSV"), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400"
  }, "Top candidate match scores"))), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30"
  }, allMatchedJobs.length)), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return exportJobsToCSV("applied");
    },
    className: "w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] text-slate-200 flex items-center justify-between group transition-all"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm text-emerald-400"
  }, "\u2713"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold text-emerald-300"
  }, "Applied Jobs CSV"), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400"
  }, "All positions you marked as applied"))), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30"
  }, appliedJobs.length)), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return exportJobsToCSV("filtered");
    },
    className: "w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] text-slate-200 flex items-center justify-between group transition-all"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm"
  }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold text-cyan-300"
  }, "Filtered View CSV"), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400"
  }, "Matches active filters"))), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30"
  }, filteredJobs.length)), /*#__PURE__*/React.createElement("div", {
    className: "h-px bg-white/[0.08] my-1"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleExportInsightsCSV,
    disabled: exportingInsights,
    className: "w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/[0.08] text-slate-200 flex items-center justify-between group transition-all disabled:opacity-50"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm"
  }, "\uD83D\uDCCA"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-semibold text-purple-300"
  }, exportingInsights ? "Generating Insights..." : "Verified Contacts & Insights CSV"), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400"
  }, "Includes verified emails & AI outreach"))))))))), /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl p-4 sm:p-5 border border-white/[0.08] space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm"
  }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("h3", {
    className: "text-xs font-bold text-white uppercase tracking-wider"
  }, "In-Memory Result Filters"), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono font-semibold"
  }, "Showing ", filteredJobs.length, " of ", allRawJobs.length, " Jobs")), (filterKeyword || filterLocationInput || filterExpYears !== 'all' || filterWorkMode !== 'all' || filterCategory !== 'all' || filterDate !== 'all' || filterSeniority !== 'all' || filterSource !== 'all' || minScore > 0 || sortBy !== 'score') && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      setFilterKeyword("");
      setFilterLocationInput("");
      setFilterExpYears("all");
      setFilterWorkMode("all");
      setFilterCategory("all");
      setMinScore(0);
      setFilterSeniority("all");
      setFilterDate("all");
      setFilterSource("all");
      setSortBy("score");
      showToast("In-memory result filters reset.");
    },
    className: "text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline self-start sm:self-auto"
  }, /*#__PURE__*/React.createElement("span", null, "\u21BA"), /*#__PURE__*/React.createElement("span", null, "Reset In-Memory Filters"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Search in Results"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Search company, title, skill...",
    value: filterKeyword,
    onChange: function onChange(e) {
      return setFilterKeyword(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  })), /*#__PURE__*/React.createElement("div", {
    className: "lg:col-span-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase"
  }, "\uD83D\uDCCD Filter by Location"), filterLocationInput && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setFilterLocationInput("");
    },
    className: "text-[10px] text-slate-400 hover:text-slate-200"
  }, "Clear")), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Filter by city, state, or remote...",
    value: filterLocationInput,
    onChange: function onChange(e) {
      return setFilterLocationInput(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "\uD83D\uDCE6 Job Pool / Scope"), /*#__PURE__*/React.createElement("select", {
    value: jobScope,
    onChange: function onChange(e) {
      return setJobScope(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-semibold text-emerald-300"
  }, /*#__PURE__*/React.createElement("option", {
    value: "curated"
  }, "\uD83C\uDFAF Curated (", allMatchedJobs.length || 0, ")"), /*#__PURE__*/React.createElement("option", {
    value: "unique"
  }, "\uD83E\uDDEC Unique (", allUniqueJobs.length || searchStats.unique_count, ")"), /*#__PURE__*/React.createElement("option", {
    value: "raw"
  }, "\uD83C\uDF10 Raw (", allRawJobs.length || searchStats.total_found, ")"), /*#__PURE__*/React.createElement("option", {
    value: "applied"
  }, "\u2713 Applied (", appliedJobs.length || 0, ")"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "\uD83D\uDCBC Work Mode"), /*#__PURE__*/React.createElement("select", {
    value: filterWorkMode,
    onChange: function onChange(e) {
      return setFilterWorkMode(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-semibold text-cyan-300"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\uD83C\uDF10 All Modes"), /*#__PURE__*/React.createElement("option", {
    value: "remote"
  }, "\uD83C\uDFE0 Remote Only"), /*#__PURE__*/React.createElement("option", {
    value: "hybrid"
  }, "\uD83D\uDD04 Hybrid"), /*#__PURE__*/React.createElement("option", {
    value: "onsite"
  }, "\uD83C\uDFE2 Onsite / Office"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Sort By"), /*#__PURE__*/React.createElement("select", {
    value: sortBy,
    onChange: function onChange(e) {
      return setSortBy(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-semibold text-indigo-300"
  }, /*#__PURE__*/React.createElement("option", {
    value: "score"
  }, "\u2B50 Highest Match"), /*#__PURE__*/React.createElement("option", {
    value: "date"
  }, "\uD83D\uDCC5 Most Recent"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Experience"), /*#__PURE__*/React.createElement("select", {
    value: filterExpYears,
    onChange: function onChange(e) {
      return setFilterExpYears(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none font-medium text-amber-300"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\uD83C\uDF93 All Levels"), /*#__PURE__*/React.createElement("option", {
    value: "0"
  }, "\uD83C\uDF31 0 Yrs (Intern)"), /*#__PURE__*/React.createElement("option", {
    value: "1"
  }, "\uD83D\uDE80 0\u20131 Yr (Entry)"), /*#__PURE__*/React.createElement("option", {
    value: "2"
  }, "\u26A1 1\u20132 Yrs (Junior)"), /*#__PURE__*/React.createElement("option", {
    value: "3-5"
  }, "\uD83D\uDCBC 3\u20135 Yrs (Mid)"), /*#__PURE__*/React.createElement("option", {
    value: "5+"
  }, "\uD83D\uDC51 5+ Yrs (Senior)"), /*#__PURE__*/React.createElement("option", {
    value: "8+"
  }, "\uD83C\uDFC6 8+ Yrs (Lead)")))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-1.5 pt-1 text-[11px]"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-400 text-[10px] font-medium uppercase mr-1"
  }, "Quick Location Filter:"), [{
    label: "📍 All Locations",
    val: ""
  }, {
    label: "🇮🇳 India",
    val: "india"
  }, {
    label: "📍 Pune",
    val: "pune"
  }, {
    label: "📍 Bangalore",
    val: "bangalore"
  }, {
    label: "🇺🇸 United States",
    val: "us"
  }, {
    label: "🌉 Bay Area",
    val: "bay area"
  }, {
    label: "🇬🇧 UK",
    val: "uk"
  }, {
    label: "🇩🇪 Germany",
    val: "germany"
  }, {
    label: "🏠 Remote",
    val: "remote"
  }].map(function (hub, idx) {
    return /*#__PURE__*/React.createElement("button", {
      key: idx,
      type: "button",
      onClick: function onClick() {
        return setFilterLocationInput(hub.val);
      },
      className: "px-2 py-0.5 rounded-md transition-all font-medium ".concat(filterLocationInput.toLowerCase() === hub.val || !filterLocationInput && hub.val === "" ? "bg-indigo-600 text-white border border-indigo-400 shadow-sm" : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/[0.06]")
    }, hub.label);
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-1.5 pt-1.5 text-[11px]"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-400 text-[10px] font-medium uppercase mr-1"
  }, "Source Ecosystem:"), [{
    label: "🌐 All Sources",
    val: "all"
  }, {
    label: "🇮🇳 India Tech",
    val: "india"
  }, {
    label: "🤖 Direct AI Labs",
    val: "ai_registry"
  }, {
    label: "🏢 Enterprise Workday",
    val: "enterprise_workday"
  }, {
    label: "🚀 Startups (YC)",
    val: "startups"
  }, {
    label: "🏠 Remote Global",
    val: "remote"
  }, {
    label: "🌱 Internships & Freshers",
    val: "internships"
  }].map(function (cat, idx) {
    return /*#__PURE__*/React.createElement("button", {
      key: idx,
      type: "button",
      onClick: function onClick() {
        return setFilterCategory(cat.val);
      },
      className: "px-2 py-0.5 rounded-md transition-all font-semibold text-xs ".concat(filterCategory === cat.val ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-400 shadow-sm" : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/[0.08]")
    }, cat.label);
  })), /*#__PURE__*/React.createElement("div", {
    className: "pt-3 border-t border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-center text-xs"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Date Posted"), /*#__PURE__*/React.createElement("select", {
    value: filterDate,
    onChange: function onChange(e) {
      return setFilterDate(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\uD83D\uDCC5 Any Time"), /*#__PURE__*/React.createElement("option", {
    value: "24h"
  }, "\u26A1 Past 24 Hours"), /*#__PURE__*/React.createElement("option", {
    value: "3d"
  }, "\uD83D\uDD25 Past 3 Days"), /*#__PURE__*/React.createElement("option", {
    value: "7d"
  }, "\uD83D\uDCC5 Past Week (7 Days)"), /*#__PURE__*/React.createElement("option", {
    value: "30d"
  }, "\uD83D\uDDD3\uFE0F Past Month (30 Days)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-semibold text-slate-400 uppercase mb-1"
  }, "Platform Source"), /*#__PURE__*/React.createElement("select", {
    value: filterSource,
    onChange: function onChange(e) {
      return setFilterSource(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "\uD83C\uDF10 All Platforms (30+ Connectors)"), /*#__PURE__*/React.createElement("option", {
    value: "naukri"
  }, "\uD83C\uDDEE\uD83C\uDDF3 Naukri India"), /*#__PURE__*/React.createElement("option", {
    value: "apna"
  }, "\uD83C\uDDEE\uD83C\uDDF3 Apna India"), /*#__PURE__*/React.createElement("option", {
    value: "hiredoor"
  }, "\uD83C\uDDEE\uD83C\uDDF3 HireDoor (Verified Tech)"), /*#__PURE__*/React.createElement("option", {
    value: "instahyre"
  }, "\uD83C\uDDEE\uD83C\uDDF3 Instahyre"), /*#__PURE__*/React.createElement("option", {
    value: "cutshort"
  }, "\uD83C\uDDEE\uD83C\uDDF3 Cutshort"), /*#__PURE__*/React.createElement("option", {
    value: "hirist"
  }, "\uD83C\uDDEE\uD83C\uDDF3 Hirist"), /*#__PURE__*/React.createElement("option", {
    value: "internshala"
  }, "\uD83C\uDF31 Internshala"), /*#__PURE__*/React.createElement("option", {
    value: "unstop"
  }, "\uD83C\uDF93 Unstop Freshers"), /*#__PURE__*/React.createElement("option", {
    value: "builtin"
  }, "\uD83D\uDE80 Built In (Tech & Startups)"), /*#__PURE__*/React.createElement("option", {
    value: "ycombinator"
  }, "\uD83D\uDE80 Y Combinator"), /*#__PURE__*/React.createElement("option", {
    value: "workday"
  }, "\uD83D\uDCBC Workday Enterprise CXS"), /*#__PURE__*/React.createElement("option", {
    value: "smartrecruiters"
  }, "\uD83C\uDFE2 SmartRecruiters ATS"), /*#__PURE__*/React.createElement("option", {
    value: "workable"
  }, "\uD83C\uDFAF Workable ATS"), /*#__PURE__*/React.createElement("option", {
    value: "recruitee"
  }, "\uD83E\uDD84 Recruitee ATS"), /*#__PURE__*/React.createElement("option", {
    value: "teamtailor"
  }, "\u26A1 Teamtailor ATS"), /*#__PURE__*/React.createElement("option", {
    value: "greenhouse"
  }, "\uD83C\uDF3F Greenhouse ATS"), /*#__PURE__*/React.createElement("option", {
    value: "lever"
  }, "\u2699\uFE0F Lever ATS"), /*#__PURE__*/React.createElement("option", {
    value: "ashby"
  }, "\u26A1 Ashby ATS"), /*#__PURE__*/React.createElement("option", {
    value: "phenom"
  }, "\uD83D\uDD2E Phenom ATS"), /*#__PURE__*/React.createElement("option", {
    value: "aijobs"
  }, "\uD83E\uDD16 KDnuggets & AI-Jobs"), /*#__PURE__*/React.createElement("option", {
    value: "weworkremotely"
  }, "\uD83D\uDCBB We Work Remotely"), /*#__PURE__*/React.createElement("option", {
    value: "workingnomads"
  }, "\u26FA Working Nomads"), /*#__PURE__*/React.createElement("option", {
    value: "remotive"
  }, "\uD83D\uDCE1 Remotive"), /*#__PURE__*/React.createElement("option", {
    value: "himalayas"
  }, "\uD83C\uDFD4\uFE0F Himalayas"), /*#__PURE__*/React.createElement("option", {
    value: "remoteok"
  }, "\uD83C\uDFD6\uFE0F RemoteOK"), /*#__PURE__*/React.createElement("option", {
    value: "jobicy"
  }, "\uD83C\uDF0D Jobicy"), /*#__PURE__*/React.createElement("option", {
    value: "arbeitnow"
  }, "\uD83C\uDDEA\uD83C\uDDFA Arbeitnow"), /*#__PURE__*/React.createElement("option", {
    value: "linkedin"
  }, "\uD83D\uDCBC LinkedIn / Indeed (JobSpy)"), /*#__PURE__*/React.createElement("option", {
    value: "themuse"
  }, "\uD83C\uDFDB\uFE0F The Muse (Tech & Enterprise)"), /*#__PURE__*/React.createElement("option", {
    value: "simplify"
  }, "\uD83C\uDF93 Simplify Internships"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-semibold text-slate-400 uppercase"
  }, "Min Match Score"), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold text-indigo-400"
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
  })))), searching && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between p-3.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs font-semibold animate-pulse shadow-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "relative flex h-2.5 w-2.5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"
  }), /*#__PURE__*/React.createElement("span", {
    className: "relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"
  })), /*#__PURE__*/React.createElement("span", null, "Discovering fresh jobs across 9 platforms for ", /*#__PURE__*/React.createElement("strong", null, "\"", role, "\""), "... keeping previous results active on screen until fresh harvest arrives.")), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-mono text-indigo-300/80 hidden sm:block"
  }, "Live Re-Harvesting...")), filteredJobs.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl p-8 sm:p-10 text-center border border-white/[0.08] space-y-4 shadow-xl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-3xl"
  }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-base font-bold text-white"
  }, "No jobs in local dataset match current filter combination"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-1"
  }, filterLocationInput ? "Looking for roles in \"".concat(filterLocationInput, "\"? Click below to launch a live multi-platform harvest specifically for ").concat(filterLocationInput, ".") : 'Try resetting filters or click below to trigger a live multi-board search.')), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-center gap-3 pt-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return executeSearch(null, null, filterLocationInput);
    },
    className: "px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
  }, /*#__PURE__*/React.createElement("span", null, "\u26A1"), /*#__PURE__*/React.createElement("span", null, "Live-Harvest \"", role, "\" ", filterLocationInput ? "in ".concat(filterLocationInput) : 'Worldwide', " Now")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setFilterKeyword("");
      setFilterLocationInput("");
      setFilterExpYears("all");
      setFilterWorkMode("all");
      setMinScore(0);
      setFilterSeniority("all");
      setFilterDate("all");
      setFilterSource("all");
    },
    className: "px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/[0.08] transition-all"
  }, "\u21BA Reset All Filters"))) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-4"
  }, filteredJobs.map(function (job, idx) {
    return /*#__PURE__*/React.createElement(JobCard, {
      key: job.id || idx,
      job: job,
      jobScope: jobScope,
      resumeSkills: (resumeProfile === null || resumeProfile === void 0 ? void 0 : resumeProfile.skills) || [],
      isApplied: appliedJobKeys.has(getJobKey(job)),
      onToggleApplied: onToggleApplied,
      onViewDetails: function onViewDetails() {
        return setSelectedJob(job);
      },
      onQueryAI: function onQueryAI() {
        setRagQuery("Tell me about the requirements and salary for ".concat(job.title, " at ").concat(job.company));
        setRagModalOpen(true);
      }
    });
  }))), dossierCompany && /*#__PURE__*/React.createElement(CompanyDossierModal, {
    companyName: dossierCompany,
    token: token,
    onClose: function onClose() {
      return setDossierCompany(null);
    },
    showToast: showToast
  }), selectedJob && /*#__PURE__*/React.createElement(JobDetailModal, {
    job: selectedJob,
    user: user,
    token: token,
    resumeSkills: (resumeProfile === null || resumeProfile === void 0 ? void 0 : resumeProfile.skills) || [],
    isApplied: appliedJobKeys.has(getJobKey(selectedJob)),
    onToggleApplied: onToggleApplied,
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
  }, /*#__PURE__*/React.createElement("span", null, "\uD83E\uDD16"), /*#__PURE__*/React.createElement("span", null, "AI Job Assistant (RAG)")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setRagModalOpen(false);
    },
    className: "text-slate-400 hover:text-white text-sm"
  }, "\u2715")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleAskAI,
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Ask anything about the requirements, tech stack, or hiring...",
    value: ragQuery,
    onChange: function onChange(e) {
      return setRagQuery(e.target.value);
    },
    className: "w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none pr-20"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: ragLoading || !ragQuery.trim(),
    className: "absolute right-1.5 top-1.5 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50"
  }, ragLoading ? "Asking..." : "Ask"))), ragAnswer && /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-lg bg-slate-900/90 border border-indigo-500/20 text-slate-200 text-xs leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap"
  }, ragAnswer))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onOpenAppliedModal,
    className: "fixed bottom-5 right-5 z-40 sm:hidden px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xl flex items-center gap-1.5 border border-emerald-300/40 backdrop-blur-md active:scale-95 transition-all shadow-emerald-950"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-sm"
  }, "\u2713"), /*#__PURE__*/React.createElement("span", null, "Applied (", appliedJobs.length, ")")));
}

// ==========================================
// Helper: Extract & Format Matched / Missing / Extra Skills
// ==========================================
var TECH_SKILL_KEYWORDS = [{
  name: "Python",
  regex: /\bpython\b/i
}, {
  name: "PyTorch",
  regex: /\b(pytorch|torch)\b/i
}, {
  name: "TensorFlow",
  regex: /\b(tensorflow|tf)\b/i
}, {
  name: "Keras",
  regex: /\bkeras\b/i
}, {
  name: "JAX",
  regex: /\bjax\b/i
}, {
  name: "Scikit-Learn",
  regex: /\b(scikit-learn|sklearn)\b/i
}, {
  name: "Pandas",
  regex: /\bpandas\b/i
}, {
  name: "NumPy",
  regex: /\bnumpy\b/i
}, {
  name: "OpenCV",
  regex: /\b(opencv|cv2)\b/i
}, {
  name: "Deep Learning",
  regex: /\b(deep learning|dl)\b/i
}, {
  name: "Machine Learning",
  regex: /\b(machine learning|ml)\b/i
}, {
  name: "Data Science",
  regex: /\b(data science|data scientist)\b/i
}, {
  name: "Data Engineering",
  regex: /\b(data engineering|data engineer)\b/i
}, {
  name: "NLP",
  regex: /\b(natural language processing|nlp)\b/i
}, {
  name: "Computer Vision",
  regex: /\b(computer vision|cv)\b/i
}, {
  name: "Transformers",
  regex: /\b(transformers|hugging\s*face|huggingface)\b/i
}, {
  name: "LangChain",
  regex: /\blangchain\b/i
}, {
  name: "LangGraph",
  regex: /\blanggraph\b/i
}, {
  name: "LlamaIndex",
  regex: /\b(llamaindex|llama-index)\b/i
}, {
  name: "RAG",
  regex: /\b(rag|retrieval[-\s]augmented generation)\b/i
}, {
  name: "Agentic AI",
  regex: /\b(agentic|ai agents?|multi-agent)\b/i
}, {
  name: "OpenAI API",
  regex: /\b(openai|gpt-?4o?|chatgpt)\b/i
}, {
  name: "Gemini API",
  regex: /\b(gemini|google gemini)\b/i
}, {
  name: "Groq",
  regex: /\bgroq\b/i
}, {
  name: "Mistral AI",
  regex: /\bmistral\b/i
}, {
  name: "Pinecone",
  regex: /\bpinecone\b/i
}, {
  name: "ChromaDB",
  regex: /\b(chromadb|chroma)\b/i
}, {
  name: "Weaviate",
  regex: /\bweaviate\b/i
}, {
  name: "Qdrant",
  regex: /\bqdrant\b/i
}, {
  name: "FAISS",
  regex: /\bfaiss\b/i
}, {
  name: "FastAPI",
  regex: /\bfastapi\b/i
}, {
  name: "Flask",
  regex: /\bflask\b/i
}, {
  name: "Django",
  regex: /\bdjango\b/i
}, {
  name: "Node.js",
  regex: /\b(node(\.js)?|nodejs)\b/i
}, {
  name: "Express",
  regex: /\bexpress(\.js)?\b/i
}, {
  name: "Spring Boot",
  regex: /\bspring boot\b/i
}, {
  name: "GraphQL",
  regex: /\bgraphql\b/i
}, {
  name: "REST APIs",
  regex: /\brest(ful)?\s*apis?\b/i
}, {
  name: "Microservices",
  regex: /\bmicroservices?\b/i
}, {
  name: "PostgreSQL",
  regex: /\bpostgres(ql)?\b/i
}, {
  name: "MySQL",
  regex: /\bmysql\b/i
}, {
  name: "MongoDB Atlas",
  regex: /\bmongodb(\s*atlas)?|\bmongo\b/i
}, {
  name: "Redis",
  regex: /\bredis\b/i
}, {
  name: "SQL",
  regex: /\bsql\b/i
}, {
  name: "Docker",
  regex: /\bdocker\b/i
}, {
  name: "Kubernetes",
  regex: /\b(kubernetes|k8s)\b/i
}, {
  name: "AWS",
  regex: /\b(aws|amazon web services)\b/i
}, {
  name: "GCP",
  regex: /\b(gcp|google cloud)\b/i
}, {
  name: "Azure",
  regex: /\bazure\b/i
}, {
  name: "Git",
  regex: /\b(git|github|gitlab)\b/i
}, {
  name: "CI/CD",
  regex: /\bci[\s/-]?cd\b/i
}, {
  name: "Linux",
  regex: /\blinux\b/i
}, {
  name: "React",
  regex: /\breact(\.js|js)?(?!\s+native)\b/i
}, {
  name: "TypeScript",
  regex: /\b(typescript|ts)\b/i
}, {
  name: "JavaScript",
  regex: /\b(javascript|js)\b/i
}, {
  name: "C++",
  regex: /(?:^|[^\w])c\+\+(?:$|[^\w])/i
}, {
  name: "C#",
  regex: /(?:^|[^\w])c#(?:$|[^\w])/i
}, {
  name: "C",
  regex: /(?<![a-zA-Z0-9_#+])c(?![+#a-zA-Z0-9_])/i
}, {
  name: "Go",
  regex: /\bgolang\b|(?<!\w)go(?!\w)(?=\s*(?:,|and|\/|developer|engineer|cloud))/i
}, {
  name: "Rust",
  regex: /\brust\b/i
}, {
  name: "Java",
  regex: /\bjava\b/i
}, {
  name: "Kafka",
  regex: /\bkafka\b/i
}, {
  name: "Apache Spark",
  regex: /\b(spark|pyspark)\b/i
}];
function extractSkillsFromJobText(text) {
  if (!text) return [];
  var found = [];
  var _iterator7 = _createForOfIteratorHelper(TECH_SKILL_KEYWORDS),
    _step7;
  try {
    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
      var item = _step7.value;
      if (item.regex.test(text)) {
        if (!found.includes(item.name)) found.push(item.name);
      }
    }
  } catch (err) {
    _iterator7.e(err);
  } finally {
    _iterator7.f();
  }
  return found;
}
function getJobSkillLists(job) {
  var resumeSkills = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  if (!job) return {
    matched: [],
    missing: [],
    extras: []
  };
  var candSkillsLower = new Set((resumeSkills || []).map(function (s) {
    return String(s || '').trim().toLowerCase();
  }).filter(Boolean));
  var matched = job.matching_skills && Array.isArray(job.matching_skills) ? _toConsumableArray(job.matching_skills) : [];
  var rawMissing = job.missing_skills && Array.isArray(job.missing_skills) ? _toConsumableArray(job.missing_skills) : [];
  var extras = job.supported_skills && Array.isArray(job.supported_skills) ? _toConsumableArray(job.supported_skills) : [];

  // CRITICAL CORRECTION: Skills present on candidate's resume are NEVER missing skills!
  var missing = [];
  var _iterator8 = _createForOfIteratorHelper(rawMissing),
    _step8;
  try {
    var _loop = function _loop() {
      var m = _step8.value;
      var mClean = String(m || '').trim();
      if (!mClean) return 1; // continue
      if (candSkillsLower.has(mClean.toLowerCase())) {
        // Candidate possesses this skill - move to extras if not already matched
        if (!matched.some(function (s) {
          return s.toLowerCase() === mClean.toLowerCase();
        })) {
          extras.push(mClean);
        }
      } else {
        missing.push(mClean);
      }
    };
    for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
      if (_loop()) continue;
    }
  } catch (err) {
    _iterator8.e(err);
  } finally {
    _iterator8.f();
  }
  var jobText = "".concat(job.title || '', " ").concat(job.description || '', " ").concat(job.key_requirements || '');
  var extractedJobSkills = extractSkillsFromJobText(jobText);

  // If matched is empty (e.g. raw or unranked jobs), compute fresh two-way alignment
  if (matched.length === 0 && resumeSkills && resumeSkills.length > 0) {
    var _iterator9 = _createForOfIteratorHelper(resumeSkills),
      _step9;
    try {
      for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
        var s = _step9.value;
        if (!s) continue;
        var sClean = String(s).trim();
        if (!sClean) continue;
        var escaped = sClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var pattern = sClean.length <= 4 ? new RegExp("(?:^|[^\\w])".concat(escaped, "(?:$|[^\\w])"), 'i') : new RegExp(escaped, 'i');
        if (pattern.test(jobText)) {
          if (!matched.includes(sClean)) matched.push(sClean);
        } else {
          if (!extras.includes(sClean)) extras.push(sClean);
        }
      }
    } catch (err) {
      _iterator9.e(err);
    } finally {
      _iterator9.f();
    }
    var PARENT_SKILL_IMPLICATIONS = {
      "Data Science": ["python", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "sql", "r"],
      "Machine Learning": ["python", "tensorflow", "pytorch", "keras", "scikit-learn", "xgboost", "lightgbm", "jax"],
      "Deep Learning": ["tensorflow", "pytorch", "keras", "jax", "transformers"],
      "Data Engineering": ["python", "sql", "spark", "kafka", "hadoop", "airflow", "postgresql", "mysql", "mongodb"],
      "NLP": ["transformers", "spacy", "nltk", "langchain", "rag", "hugging face", "llm"],
      "Computer Vision": ["opencv", "pytorch", "tensorflow", "yolo", "diffusion"],
      "REST APIs": ["fastapi", "flask", "django", "express", "spring boot", "nodejs", "nestjs"],
      "Microservices": ["docker", "kubernetes", "fastapi", "express", "spring boot", "grpc"]
    };
    var _iterator10 = _createForOfIteratorHelper(extractedJobSkills),
      _step10;
    try {
      for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
        var js = _step10.value;
        if (candSkillsLower.has(js.toLowerCase())) continue;
        var impls = PARENT_SKILL_IMPLICATIONS[js] || [];
        if (impls.some(function (impl) {
          return candSkillsLower.has(impl.toLowerCase());
        })) {
          if (!matched.includes(js)) matched.push(js);
          continue;
        }
        if (!missing.includes(js)) missing.push(js);
      }
    } catch (err) {
      _iterator10.e(err);
    } finally {
      _iterator10.f();
    }
  } else if (resumeSkills && resumeSkills.length > 0 && extras.length === 0) {
    var matchedLower = new Set(matched.map(function (s) {
      return s.toLowerCase();
    }));
    var _iterator11 = _createForOfIteratorHelper(resumeSkills),
      _step11;
    try {
      for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
        var _s = _step11.value;
        var _sClean = String(_s || '').trim();
        if (_sClean && !matchedLower.has(_sClean.toLowerCase())) {
          if (!extras.includes(_sClean)) extras.push(_sClean);
        }
      }
    } catch (err) {
      _iterator11.e(err);
    } finally {
      _iterator11.f();
    }
  }
  return {
    matched: matched,
    missing: missing,
    extras: extras
  };
}

// ==========================================
// Component: Single Job Card (Minimal Aesthetic)
// ==========================================
function JobCard(_ref19) {
  var _job$experience_compa, _job$experience_compa2;
  var job = _ref19.job,
    _ref19$jobScope = _ref19.jobScope,
    jobScope = _ref19$jobScope === void 0 ? "curated" : _ref19$jobScope,
    _ref19$resumeSkills = _ref19.resumeSkills,
    resumeSkills = _ref19$resumeSkills === void 0 ? [] : _ref19$resumeSkills,
    _ref19$isApplied = _ref19.isApplied,
    isApplied = _ref19$isApplied === void 0 ? false : _ref19$isApplied,
    onToggleApplied = _ref19.onToggleApplied,
    onViewDetails = _ref19.onViewDetails,
    onQueryAI = _ref19.onQueryAI;
  var score = Math.round(job.match_score || 0);
  var badgeText = "".concat(score, "% Match");
  var scoreColor = "bg-slate-800 text-slate-300 border-slate-700";
  if (jobScope === "raw") {
    badgeText = "🌐 Raw Listing";
    scoreColor = "bg-slate-900 text-slate-300 border-slate-700";
  } else if (jobScope === "unique") {
    badgeText = "🧬 Unique Role";
    scoreColor = "bg-indigo-950/60 text-indigo-300 border-indigo-500/30";
  } else if (jobScope === "applied") {
    badgeText = "✓ Applied";
    scoreColor = "bg-emerald-950/90 text-emerald-300 border-emerald-500/50";
  } else {
    if (score >= 80) scoreColor = "bg-emerald-950/60 text-emerald-300 border-emerald-500/30";else if (score >= 65) scoreColor = "bg-amber-950/60 text-amber-300 border-amber-500/30";
  }

  // Salary formatting
  var salaryDisplay = "Salary: N/A";
  if (job.salary_range) {
    var minS = job.salary_range.min;
    var maxS = job.salary_range.max;
    var curr = job.salary_range.currency || "$";
    if (minS && maxS) salaryDisplay = "".concat(curr).concat(minS.toLocaleString(), " - ").concat(maxS.toLocaleString());else if (minS) salaryDisplay = "> ".concat(curr).concat(minS.toLocaleString());
  }
  var _getJobSkillLists = getJobSkillLists(job, resumeSkills),
    cardMatchingSkills = _getJobSkillLists.matched;
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
  }, /*#__PURE__*/React.createElement("div", {
    className: "min-w-0 flex-1"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-white text-sm leading-snug line-clamp-2"
  }, job.title), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-semibold text-slate-200"
  }, "\uD83C\uDFE2 ", job.company || 'Company'), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCD ", job.location || 'Remote'), isApplied && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-400 font-bold text-[11px] flex items-center gap-0.5"
  }, /*#__PURE__*/React.createElement("span", null, "\u2713"), " Applied")))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick(e) {
      e.stopPropagation();
      onToggleApplied === null || onToggleApplied === void 0 || onToggleApplied(job);
    },
    title: isApplied ? "Marked as Applied! Click to unmark" : "Click to mark as Applied",
    className: "px-2 py-1 rounded-md border text-xs font-bold transition-all flex items-center gap-1 ".concat(isApplied ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900/80 shadow-sm" : "bg-slate-900/80 text-slate-400 border-white/10 hover:text-emerald-300 hover:border-emerald-500/40 hover:bg-slate-800")
  }, /*#__PURE__*/React.createElement("span", {
    className: isApplied ? "text-emerald-400 font-extrabold text-xs" : "text-slate-500 text-xs"
  }, isApplied ? "✓" : "○"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px]"
  }, isApplied ? "Applied" : "Apply")), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-md border font-bold text-xs shrink-0 ".concat(scoreColor)
  }, badgeText))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-1.5 text-[11px]"
  }, job.source_category && job.source_category !== 'all' && /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-full font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 shadow-sm"
  }, job.source_category === 'india' && '🇮🇳 India Tech', job.source_category === 'ai_registry' && '🤖 Direct AI Lab', job.source_category === 'enterprise_workday' && '🏢 Enterprise Workday', job.source_category === 'startups' && '🚀 YC Startup', job.source_category === 'remote' && '🌐 Remote Global'), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm"
  }, "\u23F3 Exp: ", ((_job$experience_compa = job.experience_comparison) === null || _job$experience_compa === void 0 ? void 0 : _job$experience_compa.required) || getJobExperienceBadge(job), " ", (_job$experience_compa2 = job.experience_comparison) !== null && _job$experience_compa2 !== void 0 && _job$experience_compa2.candidate ? "(You: ".concat(job.experience_comparison.candidate, ")") : ''), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-white/[0.06]"
  }, "\uD83D\uDCBC ", job.work_mode || 'Remote'), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-white/[0.06]"
  }, "\u23F0 ", job.freshness_label || 'Recently posted'), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-white/[0.06]"
  }, "\uD83D\uDD17 ", job.source || 'Direct'), salaryDisplay !== 'Salary: N/A' && /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-medium"
  }, "\uD83D\uDCB0 ", salaryDisplay), insights.size_indicator && insights.size_indicator !== 'Unknown' && /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-white/[0.06]"
  }, "\uD83D\uDC65 ", insights.size_indicator)), job.match_breakdown && /*#__PURE__*/React.createElement("div", {
    className: "p-2 rounded-lg bg-slate-950/70 border border-white/[0.06] space-y-1.5 shadow-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-[10px] font-semibold text-slate-300"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-400 font-bold flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFAF"), /*#__PURE__*/React.createElement("span", null, "6-Factor Match Breakdown")), /*#__PURE__*/React.createElement("span", {
    className: "text-slate-300 font-mono text-[11px] font-bold"
  }, score, "% Total Fit")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 sm:grid-cols-6 gap-1 text-[10px] text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-900/90 rounded px-1 py-0.5 border border-white/[0.04]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] text-slate-400"
  }, "Skills (30%)"), /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-emerald-300"
  }, job.match_breakdown.skills || 0, "%")), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-900/90 rounded px-1 py-0.5 border border-white/[0.04]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] text-slate-400"
  }, "Role (25%)"), /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-indigo-300"
  }, job.match_breakdown.role || 0, "%")), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-900/90 rounded px-1 py-0.5 border border-white/[0.04]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] text-slate-400"
  }, "Exp (15%)"), /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-amber-300"
  }, job.match_breakdown.experience || 0, "%")), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-900/90 rounded px-1 py-0.5 border border-white/[0.04]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] text-slate-400"
  }, "Loc (10%)"), /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-sky-300"
  }, job.match_breakdown.location || 0, "%")), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-900/90 rounded px-1 py-0.5 border border-white/[0.04]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] text-slate-400"
  }, "Mode (10%)"), /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-teal-300"
  }, job.match_breakdown.work_mode || 0, "%")), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-900/90 rounded px-1 py-0.5 border border-white/[0.04]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[9px] text-slate-400"
  }, "Fresh (10%)"), /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-purple-300"
  }, job.match_breakdown.freshness || 0, "%")))), job.key_requirements ? /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-white/[0.04]"
  }, job.key_requirements) : job.match_reason && /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 italic line-clamp-2 leading-relaxed"
  }, "\uD83D\uDCA1 ", job.match_reason), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1 items-center pt-0.5"
  }, cardMatchingSkills.slice(0, 5).map(function (s, idx) {
    return /*#__PURE__*/React.createElement("span", {
      key: idx,
      className: "px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-0.5"
    }, /*#__PURE__*/React.createElement("span", null, "\u2713"), " ", s);
  }), cardMatchingSkills.length > 5 && /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-500 font-medium"
  }, "+", cardMatchingSkills.length - 5, " more"), Array.isArray(job.missing_skills) && job.missing_skills.slice(0, 2).map(function (s, idx) {
    return /*#__PURE__*/React.createElement("span", {
      key: "miss-".concat(idx),
      className: "px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 text-[10px] font-medium border border-white/10 flex items-center gap-0.5"
    }, /*#__PURE__*/React.createElement("span", null, "+"), " ", s);
  }))), /*#__PURE__*/React.createElement("div", {
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
function JobDetailModal(_ref20) {
  var _job$location;
  var job = _ref20.job,
    user = _ref20.user,
    token = _ref20.token,
    resumeSkills = _ref20.resumeSkills,
    _ref20$isApplied = _ref20.isApplied,
    isApplied = _ref20$isApplied === void 0 ? false : _ref20$isApplied,
    onToggleApplied = _ref20.onToggleApplied,
    onClose = _ref20.onClose,
    onUpdateJob = _ref20.onUpdateJob,
    onOpenCookieModal = _ref20.onOpenCookieModal,
    showToast = _ref20.showToast;
  var _useState141 = useState(false),
    _useState142 = _slicedToArray(_useState141, 2),
    fetchingContacts = _useState142[0],
    setFetchingContacts = _useState142[1];
  var _useState143 = useState("overview"),
    _useState144 = _slicedToArray(_useState143, 2),
    activeTab = _useState144[0],
    setActiveTab = _useState144[1]; // 'overview' | 'contacts' | 'outreach'

  var score = Math.round(job.match_score || 0);
  var insights = job.company_insights || {};
  var hrContacts = job.hr_contacts || [];
  var techContacts = job.tech_contacts || [];
  var allContacts = [].concat(_toConsumableArray(hrContacts), _toConsumableArray(techContacts));

  // Fetch / Refresh HR & Tech Contacts
  var handleFetchContacts = /*#__PURE__*/function () {
    var _ref21 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15() {
      var res, data, _data$hr_contacts, _data$tech_contacts, updated;
      return _regeneratorRuntime().wrap(function _callee15$(_context15) {
        while (1) switch (_context15.prev = _context15.next) {
          case 0:
            setFetchingContacts(true);
            _context15.prev = 1;
            _context15.next = 4;
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
            res = _context15.sent;
            _context15.next = 7;
            return res.json();
          case 7:
            data = _context15.sent;
            if (res.ok && data.status === 'success') {
              updated = _objectSpread(_objectSpread({}, job), {}, {
                hr_contacts: data.hr_contacts || [],
                tech_contacts: data.tech_contacts || []
              });
              onUpdateJob(updated);
              showToast("Enriched ".concat(((_data$hr_contacts = data.hr_contacts) === null || _data$hr_contacts === void 0 ? void 0 : _data$hr_contacts.length) || 0, " HR + ").concat(((_data$tech_contacts = data.tech_contacts) === null || _data$tech_contacts === void 0 ? void 0 : _data$tech_contacts.length) || 0, " Tech contacts!"));
              if (data.cookie_expired) {
                showToast("⚠️ LinkedIn cookie expired. Fallback dorking was used. Click top badge to refresh.", "error");
              }
            } else {
              showToast(data.message || "Failed to discover contacts.", "error");
            }
            _context15.next = 14;
            break;
          case 11:
            _context15.prev = 11;
            _context15.t0 = _context15["catch"](1);
            showToast(_context15.t0.message, "error");
          case 14:
            _context15.prev = 14;
            setFetchingContacts(false);
            return _context15.finish(14);
          case 17:
          case "end":
            return _context15.stop();
        }
      }, _callee15, null, [[1, 11, 14, 17]]);
    }));
    return function handleFetchContacts() {
      return _ref21.apply(this, arguments);
    };
  }();

  // Auto-fetch contacts if not already loaded
  useEffect(function () {
    if (allContacts.length === 0 && !fetchingContacts) {
      handleFetchContacts();
    }
  }, [job.id]);
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
  }, "\uD83D\uDCC5 ", job.posted_date || 'Recent'), isApplied && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-400 font-bold flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", null, "\u2713"), " Marked as Applied ", job.applied_at ? "(".concat(new Date(job.applied_at).toLocaleDateString(), ")") : '')))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return onToggleApplied === null || onToggleApplied === void 0 ? void 0 : onToggleApplied(job);
    },
    title: isApplied ? "Marked as Applied! Click to unmark" : "Click to mark as Applied",
    className: "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ".concat(isApplied ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900/80 shadow-sm" : "bg-slate-800 text-slate-300 border-white/10 hover:border-emerald-500/50 hover:text-emerald-300")
  }, /*#__PURE__*/React.createElement("span", {
    className: isApplied ? "text-emerald-400 font-extrabold text-sm" : "text-slate-400 text-xs"
  }, isApplied ? "✓" : "○"), /*#__PURE__*/React.createElement("span", null, isApplied ? "Applied" : "Mark Applied")), /*#__PURE__*/React.createElement("span", {
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
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/20 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", null, "\u23F3 Experience & Seniority Requirements"), /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold shadow-sm"
  }, getJobExperienceBadge(job))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-400"
  }, "Experience Needed:"), " ", /*#__PURE__*/React.createElement("span", {
    className: "text-white font-semibold"
  }, getJobExperienceBadge(job))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-400"
  }, "AI Seniority Fit:"), " ", /*#__PURE__*/React.createElement("span", {
    className: "text-indigo-300 font-semibold"
  }, job.experience_fit || 'Good Fit')))), job.key_requirements && /*#__PURE__*/React.createElement("div", {
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
  }))), function () {
    var skillData = getJobSkillLists(job, resumeSkills);
    return /*#__PURE__*/React.createElement("div", {
      className: "p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDEE0\uFE0F Skill Alignment Matrix"), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] text-slate-400 font-normal"
    }, "Matched: ", /*#__PURE__*/React.createElement("strong", {
      className: "text-emerald-400"
    }, skillData.matched.length), " \u2022 Skill Gaps: ", /*#__PURE__*/React.createElement("strong", {
      className: skillData.missing.length > 0 ? "text-amber-400" : "text-emerald-400"
    }, skillData.missing.length), skillData.extras && skillData.extras.length > 0 && /*#__PURE__*/React.createElement("span", null, " \u2022 Candidate Extras: ", /*#__PURE__*/React.createElement("strong", {
      className: "text-sky-400"
    }, skillData.extras.length)))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-2.5"
    }, skillData.matched.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mb-1.5"
    }, /*#__PURE__*/React.createElement("span", null, "\u2713"), /*#__PURE__*/React.createElement("span", null, "Matched Competencies & Tools (", skillData.matched.length, "):")), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-1.5"
    }, skillData.matched.map(function (s, i) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        className: "px-2.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium shadow-sm flex items-center gap-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-emerald-400 font-bold"
      }, "\u2713"), " ", s);
    }))), skillData.missing.length > 0 ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] text-amber-400 font-semibold flex items-center gap-1 mb-1.5"
    }, /*#__PURE__*/React.createElement("span", null, "!"), /*#__PURE__*/React.createElement("span", null, "Target Gaps & Secondary Requirements (", skillData.missing.length, "):")), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-1.5"
    }, skillData.missing.map(function (s, i) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        className: "px-2.5 py-0.5 rounded bg-amber-950/90 border border-amber-500/40 text-amber-300 text-[11px] font-medium shadow-sm flex items-center gap-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-amber-400 font-bold"
      }, "!"), " ", s);
    }))) : skillData.matched.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] text-emerald-400/90 font-medium flex items-center gap-1.5 py-1 px-2 rounded bg-emerald-950/40 border border-emerald-500/20"
    }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF1F"), /*#__PURE__*/React.createElement("span", null, "All Detected Job Requirements Met (0 Skill Gaps Identified)")), skillData.extras && skillData.extras.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] text-sky-400 font-semibold flex items-center gap-1 mb-1.5"
    }, /*#__PURE__*/React.createElement("span", null, "\u26A1"), /*#__PURE__*/React.createElement("span", null, "Additional Candidate Strengths (", skillData.extras.length, "):")), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-1.5 max-h-32 overflow-y-auto"
    }, skillData.extras.map(function (s, i) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        className: "px-2.5 py-0.5 rounded bg-sky-950/60 border border-sky-500/30 text-sky-300 text-[11px] font-medium shadow-sm flex items-center gap-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-sky-400 font-bold"
      }, "\u26A1"), " ", s);
    })))));
  }(), /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold text-slate-300 uppercase tracking-wider"
  }, "\uD83D\uDCC4 Full Job Description"), /*#__PURE__*/React.createElement("div", {
    className: "text-slate-300 text-xs leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap bg-slate-950/40 p-3 rounded-lg border border-white/[0.04]"
  }, cleanHtmlJobDescription(job.description)))), activeTab === "contacts" && /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, allContacts.length === 0 ? fetchingContacts ? /*#__PURE__*/React.createElement("div", {
    className: "p-8 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-center space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inline-block w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"
  }), /*#__PURE__*/React.createElement("div", {
    className: "text-white font-bold text-xs"
  }, "Discovering Recruiter & Tech Contacts in Parallel..."), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-400 text-xs max-w-md mx-auto"
  }, "Auto-scraping corporate team directory, verifying SMTP email deliverability, and generating tailored AI outreach drafts for ", /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-200"
  }, job.company), ".")) : /*#__PURE__*/React.createElement("div", {
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
    className: "flex flex-wrap items-center justify-between gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold text-slate-300"
  }, "Found ", hrContacts.length, " HR Contacts + ", techContacts.length, " Tech Leads"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://www.linkedin.com/search/results/people/?keywords=".concat(encodeURIComponent(job.company + ' talent'), "&origin=SWITCH_SEARCH_VERTICAL"),
    target: "_blank",
    rel: "noopener noreferrer",
    className: "px-2.5 py-1 rounded-md bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium flex items-center gap-1 shadow-sm",
    title: "Search all ".concat(job.company, " employees on LinkedIn")
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC65"), /*#__PURE__*/React.createElement("span", null, "View All on LinkedIn")), /*#__PURE__*/React.createElement("button", {
    onClick: handleFetchContacts,
    disabled: fetchingContacts,
    className: "px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] disabled:opacity-50 flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", null, "\u21BB"), /*#__PURE__*/React.createElement("span", null, fetchingContacts ? "Refreshing..." : "Refresh")))), hrContacts.length > 0 && /*#__PURE__*/React.createElement("div", {
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
  }, allContacts.length === 0 ? fetchingContacts ? /*#__PURE__*/React.createElement("div", {
    className: "p-8 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-center space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inline-block w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"
  }), /*#__PURE__*/React.createElement("div", {
    className: "text-white font-bold text-xs"
  }, "Generating Tailored Outreach Drafts..."), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-400 text-xs max-w-md mx-auto"
  }, "Synthesizing recruiter profiles, corporate tone, and your matching skills for ", /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-200"
  }, job.company), ".")) : /*#__PURE__*/React.createElement("div", {
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
    }, draft.email_body || "Draft will appear here."))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold text-slate-400 uppercase"
    }, "WhatsApp / InMail Quick Pitch:"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return copyToClipboard(draft.inmail_message || '', "Copied InMail Pitch!");
      },
      className: "text-indigo-400 hover:underline text-[11px]"
    }, "\uD83D\uDCCB Copy Pitch")), /*#__PURE__*/React.createElement("div", {
      className: "bg-slate-950 p-2.5 rounded-lg border border-white/[0.04] text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed"
    }, draft.inmail_message || "Message draft will appear here.")));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3 flex-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleFetchContacts,
    disabled: fetchingContacts,
    className: "px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC65"), /*#__PURE__*/React.createElement("span", null, fetchingContacts ? "Enriching Team..." : "Enrich Team Contacts")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return onToggleApplied === null || onToggleApplied === void 0 ? void 0 : onToggleApplied(job);
    },
    className: "px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ".concat(isApplied ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900/80 shadow-sm" : "bg-slate-800 text-slate-200 border-white/10 hover:border-emerald-500/40 hover:text-emerald-300")
  }, /*#__PURE__*/React.createElement("span", {
    className: isApplied ? "text-emerald-400 font-extrabold text-sm" : "text-slate-400 text-xs"
  }, isApplied ? "✓" : "○"), /*#__PURE__*/React.createElement("span", null, isApplied ? "Marked as Applied" : "Mark as Applied")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs"
  }, "Close"), job.url && /*#__PURE__*/React.createElement("a", {
    href: job.url,
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: function onClick() {
      if (!isApplied && onToggleApplied) {
        onToggleApplied(job);
      }
    },
    className: "px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", null, "Apply on Career Page \u2197"))))));
}

// ==========================================
// Sub-Component: Contact Card
// ==========================================
function ContactCard(_ref22) {
  var contact = _ref22.contact,
    onCopy = _ref22.onCopy;
  var conf = contact.confidence_score || 65;
  var confBadge = "bg-slate-800 text-slate-300";
  if (conf >= 85) confBadge = "bg-emerald-950 text-emerald-300 border border-emerald-500/30";else if (conf >= 60) confBadge = "bg-amber-950 text-amber-300 border border-amber-500/30";
  var isSearchUrl = (contact.profile_url || "").includes("/search/results/people");
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
  }, /*#__PURE__*/React.createElement("span", null, isSearchUrl ? "👥" : "🔗"), /*#__PURE__*/React.createElement("span", null, isSearchUrl ? "Search People on LinkedIn" : "LinkedIn Profile")));
}

// ==========================================
// Component: Company Intelligence Dossier Modal (Feature 3)
// ==========================================
function CompanyDossierModal(_ref23) {
  var _dossier$active_openi;
  var companyName = _ref23.companyName,
    token = _ref23.token,
    onClose = _ref23.onClose,
    showToast = _ref23.showToast;
  var _useState145 = useState(null),
    _useState146 = _slicedToArray(_useState145, 2),
    dossier = _useState146[0],
    setDossier = _useState146[1];
  var _useState147 = useState(true),
    _useState148 = _slicedToArray(_useState147, 2),
    loading = _useState148[0],
    setLoading = _useState148[1];
  useEffect(function () {
    if (!companyName) return;
    var fetchDossier = /*#__PURE__*/function () {
      var _ref24 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee16() {
        var res, data;
        return _regeneratorRuntime().wrap(function _callee16$(_context16) {
          while (1) switch (_context16.prev = _context16.next) {
            case 0:
              _context16.prev = 0;
              setLoading(true);
              _context16.next = 4;
              return fetch("".concat(API_BASE_URL, "/api/v1/company/").concat(encodeURIComponent(companyName), "/dossier"), {
                headers: {
                  'Authorization': "Bearer ".concat(token)
                }
              });
            case 4:
              res = _context16.sent;
              _context16.next = 7;
              return res.json();
            case 7:
              data = _context16.sent;
              if (res.ok && data.dossier) {
                setDossier(data.dossier);
              }
              _context16.next = 14;
              break;
            case 11:
              _context16.prev = 11;
              _context16.t0 = _context16["catch"](0);
              console.error("Dossier error:", _context16.t0);
            case 14:
              _context16.prev = 14;
              setLoading(false);
              return _context16.finish(14);
            case 17:
            case "end":
              return _context16.stop();
          }
        }, _callee16, null, [[0, 11, 14, 17]]);
      }));
      return function fetchDossier() {
        return _ref24.apply(this, arguments);
      };
    }();
    fetchDossier();
  }, [companyName, token]);
  if (!companyName) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between border-b border-white/10 pb-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl"
  }, "\uD83C\uDFE2"), /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-white"
  }, companyName), (dossier === null || dossier === void 0 ? void 0 : dossier.canonical_domain) && /*#__PURE__*/React.createElement("span", {
    className: "text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30"
  }, dossier.canonical_domain)), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-1"
  }, "Company Evidence Dossier & Hiring Intelligence")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
  }, "\u2715")), loading ? /*#__PURE__*/React.createElement("div", {
    className: "py-12 text-center text-slate-400 text-sm"
  }, "Gathering company intelligence...") : dossier ? /*#__PURE__*/React.createElement("div", {
    className: "space-y-4 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-2 text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded-xl bg-slate-950/60 border border-white/5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-slate-400 text-[11px]"
  }, "Active Openings"), /*#__PURE__*/React.createElement("strong", {
    className: "text-lg text-indigo-400"
  }, dossier.active_openings_count)), /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded-xl bg-slate-950/60 border border-white/5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-slate-400 text-[11px]"
  }, "Hiring Latency"), /*#__PURE__*/React.createElement("strong", {
    className: "text-sm text-emerald-400"
  }, dossier.hiring_latency)), /*#__PURE__*/React.createElement("div", {
    className: "p-3 rounded-xl bg-slate-950/60 border border-white/5"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-slate-400 text-[11px]"
  }, "ATS Provider"), /*#__PURE__*/React.createElement("strong", {
    className: "text-sm text-amber-300"
  }, dossier.ats_provider))), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 space-y-2"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-indigo-300 text-xs flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\u2709\uFE0F"), " Outbound Recruiter & Hiring Contacts"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1"
  }, (dossier.contacts || []).map(function (c, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "flex items-center justify-between p-2 rounded bg-slate-900 border border-white/5"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] text-slate-300 font-semibold block"
    }, c.role), /*#__PURE__*/React.createElement("code", {
      className: "text-[10px] text-indigo-300"
    }, c.email)), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        navigator.clipboard.writeText(c.email);
        showToast === null || showToast === void 0 || showToast("Copied ".concat(c.email, "!"));
      },
      className: "px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-white text-[10px] font-semibold"
    }, "Copy"));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-white text-xs"
  }, "Current Active Openings"), ((_dossier$active_openi = dossier.active_openings) === null || _dossier$active_openi === void 0 ? void 0 : _dossier$active_openi.length) > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "space-y-1.5 max-h-40 overflow-y-auto"
  }, dossier.active_openings.map(function (job, idx) {
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "flex items-center justify-between p-2 rounded bg-slate-950/40 border border-white/5"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-medium text-slate-200"
    }, job.title), /*#__PURE__*/React.createElement("a", {
      href: job.url,
      target: "_blank",
      rel: "noreferrer",
      className: "text-indigo-400 hover:underline"
    }, "Apply \u2197"));
  })) : /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 italic"
  }, "No additional openings stored locally."))) : /*#__PURE__*/React.createElement("div", {
    className: "py-8 text-center text-slate-400"
  }, "Failed to load company dossier.")));
}

// ==========================================
// Component: Pipeline Funnel Velocity & Analytics View (Feature 5)
// ==========================================
function PipelineAnalyticsView(_ref25) {
  var token = _ref25.token,
    _ref25$appliedJobs = _ref25.appliedJobs,
    appliedJobs = _ref25$appliedJobs === void 0 ? [] : _ref25$appliedJobs;
  var _useState149 = useState(null),
    _useState150 = _slicedToArray(_useState149, 2),
    metrics = _useState150[0],
    setMetrics = _useState150[1];
  var _useState151 = useState([]),
    _useState152 = _slicedToArray(_useState151, 2),
    heatmap = _useState152[0],
    setHeatmap = _useState152[1];
  var _useState153 = useState(true),
    _useState154 = _slicedToArray(_useState153, 2),
    loading = _useState154[0],
    setLoading = _useState154[1];
  useEffect(function () {
    var fetchAnalytics = /*#__PURE__*/function () {
      var _ref26 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee17() {
        var _yield$Promise$all, _yield$Promise$all2, funnelRes, heatRes, funnelData, heatData;
        return _regeneratorRuntime().wrap(function _callee17$(_context17) {
          while (1) switch (_context17.prev = _context17.next) {
            case 0:
              _context17.prev = 0;
              setLoading(true);
              _context17.next = 4;
              return Promise.all([fetch("".concat(API_BASE_URL, "/api/v1/analytics/pipeline"), {
                headers: {
                  'Authorization': "Bearer ".concat(token)
                }
              }), fetch("".concat(API_BASE_URL, "/api/v1/analytics/skills-demand"), {
                headers: {
                  'Authorization': "Bearer ".concat(token)
                }
              })]);
            case 4:
              _yield$Promise$all = _context17.sent;
              _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 2);
              funnelRes = _yield$Promise$all2[0];
              heatRes = _yield$Promise$all2[1];
              _context17.next = 10;
              return funnelRes.json();
            case 10:
              funnelData = _context17.sent;
              _context17.next = 13;
              return heatRes.json();
            case 13:
              heatData = _context17.sent;
              if (funnelData.metrics) setMetrics(funnelData.metrics);
              if (heatData.market_skill_heatmap) setHeatmap(heatData.market_skill_heatmap);
              _context17.next = 21;
              break;
            case 18:
              _context17.prev = 18;
              _context17.t0 = _context17["catch"](0);
              console.error("Analytics fetch error:", _context17.t0);
            case 21:
              _context17.prev = 21;
              setLoading(false);
              return _context17.finish(21);
            case 24:
            case "end":
              return _context17.stop();
          }
        }, _callee17, null, [[0, 18, 21, 24]]);
      }));
      return function fetchAnalytics() {
        return _ref26.apply(this, arguments);
      };
    }();
    fetchAnalytics();
  }, [token, appliedJobs.length]);
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6 max-w-5xl mx-auto p-4 sm:p-6 animate-fadeIn"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-white flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCA"), " Application Funnel Velocity & Skills Radar"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-1"
  }, "Calibrate your job search pipeline velocity and uncover top market skill demands.")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 sm:grid-cols-4 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-2xl bg-slate-900 border border-white/10 text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-slate-400 font-semibold block mb-1"
  }, "Total Applied"), /*#__PURE__*/React.createElement("strong", {
    className: "text-2xl text-white font-extrabold"
  }, (metrics === null || metrics === void 0 ? void 0 : metrics.total_applied) || appliedJobs.length)), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-2xl bg-slate-900 border border-indigo-500/20 text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-indigo-300 font-semibold block mb-1"
  }, "Interview Rate"), /*#__PURE__*/React.createElement("strong", {
    className: "text-2xl text-indigo-400 font-extrabold"
  }, (metrics === null || metrics === void 0 ? void 0 : metrics.interview_rate) || 0, "%"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block mt-0.5"
  }, "Benchmark: 12%")), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-2xl bg-slate-900 border border-emerald-500/20 text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-emerald-300 font-semibold block mb-1"
  }, "Offer Rate"), /*#__PURE__*/React.createElement("strong", {
    className: "text-2xl text-emerald-400 font-extrabold"
  }, (metrics === null || metrics === void 0 ? void 0 : metrics.offer_rate) || 0, "%"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block mt-0.5"
  }, "Benchmark: 25%")), /*#__PURE__*/React.createElement("div", {
    className: "p-4 rounded-2xl bg-slate-900 border border-amber-500/20 text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs text-amber-300 font-semibold block mb-1"
  }, "Avg Response Latency"), /*#__PURE__*/React.createElement("strong", {
    className: "text-2xl text-amber-300 font-extrabold"
  }, (metrics === null || metrics === void 0 ? void 0 : metrics.avg_response_days) || 6.5, "d"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block mt-0.5"
  }, "Days to hear back"))), /*#__PURE__*/React.createElement("div", {
    className: "p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-white text-sm flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("span", null, "\u26A1"), " Top Market AI Skill Demands (Career-Ops Upskill Heatmap)"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400"
  }, "Identifies highest-frequency skills across live postings and compares them to your resume."))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2"
  }, heatmap.slice(0, 12).map(function (item, idx) {
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "font-bold text-slate-200 block"
    }, item.skill), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] text-slate-400"
    }, item.job_count, " postings (", item.demand_percentage, "%)")), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold px-2 py-0.5 rounded-full ".concat(item.is_owned ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30")
    }, item.is_owned ? "✓ On Resume" : "Gap"));
  }))));
}

// ==========================================
// Component: STAR+R Interview Story Bank View (Feature 6)
// ==========================================
function StoryBankView(_ref27) {
  var token = _ref27.token,
    showToast = _ref27.showToast;
  var _useState155 = useState([]),
    _useState156 = _slicedToArray(_useState155, 2),
    stories = _useState156[0],
    setStories = _useState156[1];
  var _useState157 = useState(true),
    _useState158 = _slicedToArray(_useState157, 2),
    loading = _useState158[0],
    setLoading = _useState158[1];
  var _useState159 = useState(false),
    _useState160 = _slicedToArray(_useState159, 2),
    showCreate = _useState160[0],
    setShowCreate = _useState160[1];
  var _useState161 = useState(""),
    _useState162 = _slicedToArray(_useState161, 2),
    title = _useState162[0],
    setTitle = _useState162[1];
  var _useState163 = useState(""),
    _useState164 = _slicedToArray(_useState163, 2),
    situation = _useState164[0],
    setSituation = _useState164[1];
  var _useState165 = useState(""),
    _useState166 = _slicedToArray(_useState165, 2),
    task = _useState166[0],
    setTask = _useState166[1];
  var _useState167 = useState(""),
    _useState168 = _slicedToArray(_useState167, 2),
    action = _useState168[0],
    setAction = _useState168[1];
  var _useState169 = useState(""),
    _useState170 = _slicedToArray(_useState169, 2),
    result = _useState170[0],
    setResult = _useState170[1];
  var _useState171 = useState("Python, LangGraph, FastAPI"),
    _useState172 = _slicedToArray(_useState171, 2),
    techs = _useState172[0],
    setTechs = _useState172[1];
  var fetchStories = /*#__PURE__*/function () {
    var _ref28 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee18() {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee18$(_context18) {
        while (1) switch (_context18.prev = _context18.next) {
          case 0:
            _context18.prev = 0;
            setLoading(true);
            _context18.next = 4;
            return fetch("".concat(API_BASE_URL, "/api/v1/stories"), {
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 4:
            res = _context18.sent;
            _context18.next = 7;
            return res.json();
          case 7:
            data = _context18.sent;
            if (res.ok && data.stories) {
              setStories(data.stories || []);
            }
            _context18.next = 14;
            break;
          case 11:
            _context18.prev = 11;
            _context18.t0 = _context18["catch"](0);
            console.error("Story fetch error:", _context18.t0);
          case 14:
            _context18.prev = 14;
            setLoading(false);
            return _context18.finish(14);
          case 17:
          case "end":
            return _context18.stop();
        }
      }, _callee18, null, [[0, 11, 14, 17]]);
    }));
    return function fetchStories() {
      return _ref28.apply(this, arguments);
    };
  }();
  useEffect(function () {
    fetchStories();
  }, [token]);
  var handleSaveStory = /*#__PURE__*/function () {
    var _ref29 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee19(e) {
      var res;
      return _regeneratorRuntime().wrap(function _callee19$(_context19) {
        while (1) switch (_context19.prev = _context19.next) {
          case 0:
            e.preventDefault();
            _context19.prev = 1;
            _context19.next = 4;
            return fetch("".concat(API_BASE_URL, "/api/v1/stories"), {
              method: "POST",
              headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer ".concat(token)
              },
              body: JSON.stringify({
                title: title,
                situation: situation,
                task: task,
                action: action,
                result: result,
                technologies: techs.split(",").map(function (t) {
                  return t.trim();
                }).filter(Boolean)
              })
            });
          case 4:
            res = _context19.sent;
            if (res.ok) {
              showToast("STAR story added to bank!");
              setShowCreate(false);
              fetchStories();
            }
            _context19.next = 11;
            break;
          case 8:
            _context19.prev = 8;
            _context19.t0 = _context19["catch"](1);
            showToast("Failed to save story", "error");
          case 11:
          case "end":
            return _context19.stop();
        }
      }, _callee19, null, [[1, 8]]);
    }));
    return function handleSaveStory(_x7) {
      return _ref29.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6 max-w-4xl mx-auto p-4 sm:p-6 animate-fadeIn"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-bold text-white flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF99\uFE0F"), " STAR+R Interview Story Bank"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-1"
  }, "Ground truth stories used to automatically prepare tailored interview talking points.")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowCreate(!showCreate);
    },
    className: "px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-all shadow-md"
  }, showCreate ? "Cancel" : "+ New STAR Story")), showCreate && /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSaveStory,
    className: "p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-3 text-xs"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "font-semibold text-slate-300 block mb-1"
  }, "Project / Achievement Title"), /*#__PURE__*/React.createElement("input", {
    className: "w-full p-2.5 rounded bg-slate-950 border border-white/10 text-white",
    value: title,
    onChange: function onChange(e) {
      return setTitle(e.target.value);
    },
    required: true,
    placeholder: "e.g. Agentic Workflow Parallelization"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "font-semibold text-slate-300 block mb-1"
  }, "Situation"), /*#__PURE__*/React.createElement("textarea", {
    className: "w-full p-2 rounded bg-slate-950 border border-white/10 text-white",
    rows: 2,
    value: situation,
    onChange: function onChange(e) {
      return setSituation(e.target.value);
    },
    required: true,
    placeholder: "What was the context or problem?"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "font-semibold text-slate-300 block mb-1"
  }, "Task"), /*#__PURE__*/React.createElement("textarea", {
    className: "w-full p-2 rounded bg-slate-950 border border-white/10 text-white",
    rows: 2,
    value: task,
    onChange: function onChange(e) {
      return setTask(e.target.value);
    },
    required: true,
    placeholder: "What was your specific responsibility?"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "font-semibold text-slate-300 block mb-1"
  }, "Action"), /*#__PURE__*/React.createElement("textarea", {
    className: "w-full p-2 rounded bg-slate-950 border border-white/10 text-white",
    rows: 2,
    value: action,
    onChange: function onChange(e) {
      return setAction(e.target.value);
    },
    required: true,
    placeholder: "What technical steps did you execute?"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "font-semibold text-slate-300 block mb-1"
  }, "Result"), /*#__PURE__*/React.createElement("textarea", {
    className: "w-full p-2 rounded bg-slate-950 border border-white/10 text-white",
    rows: 2,
    value: result,
    onChange: function onChange(e) {
      return setResult(e.target.value);
    },
    required: true,
    placeholder: "Quantified impact (e.g. 40% latency drop)"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "font-semibold text-slate-300 block mb-1"
  }, "Technologies Used (comma-separated)"), /*#__PURE__*/React.createElement("input", {
    className: "w-full p-2 rounded bg-slate-950 border border-white/10 text-white",
    value: techs,
    onChange: function onChange(e) {
      return setTechs(e.target.value);
    }
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "px-4 py-2 rounded bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500"
  }, "Save Story")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-3"
  }, stories.map(function (story, idx) {
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2 text-xs"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "font-bold text-white text-sm"
    }, story.title), /*#__PURE__*/React.createElement("p", {
      className: "text-slate-300"
    }, /*#__PURE__*/React.createElement("strong", {
      className: "text-indigo-400"
    }, "Action:"), " ", story.action), /*#__PURE__*/React.createElement("p", {
      className: "text-emerald-300 font-semibold"
    }, /*#__PURE__*/React.createElement("strong", {
      className: "text-slate-400"
    }, "Result:"), " ", story.result), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-1 pt-1"
    }, (story.technologies || []).map(function (t, i) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        className: "px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-white/5 text-[10px]"
      }, t);
    })));
  })));
}

// ==========================================
// Component: Email Automation & Live Alerts
// ==========================================
function EmailAlertsView(_ref30) {
  var token = _ref30.token,
    user = _ref30.user,
    cookieStatusInfo = _ref30.cookieStatusInfo,
    onOpenCookieModal = _ref30.onOpenCookieModal,
    showToast = _ref30.showToast,
    _ref30$appliedJobs = _ref30.appliedJobs,
    appliedJobs = _ref30$appliedJobs === void 0 ? [] : _ref30$appliedJobs,
    onToggleApplied = _ref30.onToggleApplied,
    onInspectSnapshot = _ref30.onInspectSnapshot;
  var _useState173 = useState(user.email || ""),
    _useState174 = _slicedToArray(_useState173, 2),
    email = _useState174[0],
    setEmail = _useState174[1];
  var _useState175 = useState("AI ML Intern"),
    _useState176 = _slicedToArray(_useState175, 2),
    role = _useState176[0],
    setRole = _useState176[1];
  var _useState177 = useState("Pune"),
    _useState178 = _slicedToArray(_useState177, 2),
    location = _useState178[0],
    setLocation = _useState178[1];
  var _useState179 = useState("any"),
    _useState180 = _slicedToArray(_useState179, 2),
    workMode = _useState180[0],
    setWorkMode = _useState180[1];
  var _useState181 = useState("intern"),
    _useState182 = _slicedToArray(_useState181, 2),
    experienceLevel = _useState182[0],
    setExperienceLevel = _useState182[1];
  var _useState183 = useState(3),
    _useState184 = _slicedToArray(_useState183, 2),
    maxAgeDays = _useState184[0],
    setMaxAgeDays = _useState184[1];
  var _useState185 = useState("09:00"),
    _useState186 = _slicedToArray(_useState185, 2),
    preferredTime = _useState186[0],
    setPreferredTime = _useState186[1];
  var _useState187 = useState("All"),
    _useState188 = _slicedToArray(_useState187, 2),
    subDomain = _useState188[0],
    setSubDomain = _useState188[1];
  var _useState189 = useState([]),
    _useState190 = _slicedToArray(_useState189, 2),
    aiFacets = _useState190[0],
    setAiFacets = _useState190[1];
  var _useState191 = useState(""),
    _useState192 = _slicedToArray(_useState191, 2),
    stipendRange = _useState192[0],
    setStipendRange = _useState192[1];
  var _useState193 = useState([]),
    _useState194 = _slicedToArray(_useState193, 2),
    followupsList = _useState194[0],
    setFollowupsList = _useState194[1];
  var _useState195 = useState(false),
    _useState196 = _slicedToArray(_useState195, 2),
    loadingFollowups = _useState196[0],
    setLoadingFollowups = _useState196[1];
  var _useState197 = useState(null),
    _useState198 = _slicedToArray(_useState197, 2),
    resumeFile = _useState198[0],
    setResumeFile = _useState198[1];
  var _useState199 = useState(null),
    _useState200 = _slicedToArray(_useState199, 2),
    resumeProfile = _useState200[0],
    setResumeProfile = _useState200[1];
  var _useState201 = useState(false),
    _useState202 = _slicedToArray(_useState201, 2),
    parsingResume = _useState202[0],
    setParsingResume = _useState202[1];
  var _useState203 = useState(false),
    _useState204 = _slicedToArray(_useState203, 2),
    saving = _useState204[0],
    setSaving = _useState204[1];
  var _useState205 = useState(false),
    _useState206 = _slicedToArray(_useState205, 2),
    testing = _useState206[0],
    setTesting = _useState206[1];
  var _useState207 = useState([]),
    _useState208 = _slicedToArray(_useState207, 2),
    activeAlerts = _useState208[0],
    setActiveAlerts = _useState208[1];
  var _useState209 = useState(true),
    _useState210 = _slicedToArray(_useState209, 2),
    loadingAlerts = _useState210[0],
    setLoadingAlerts = _useState210[1];
  var _useState211 = useState([]),
    _useState212 = _slicedToArray(_useState211, 2),
    historyList = _useState212[0],
    setHistoryList = _useState212[1];
  var _useState213 = useState(true),
    _useState214 = _slicedToArray(_useState213, 2),
    loadingHistory = _useState214[0],
    setLoadingHistory = _useState214[1];
  var _useState215 = useState(null),
    _useState216 = _slicedToArray(_useState215, 2),
    inspectingId = _useState216[0],
    setInspectingId = _useState216[1];

  // Direct In-Page Historical Automation Snapshot Viewer State
  var _useState217 = useState(null),
    _useState218 = _slicedToArray(_useState217, 2),
    viewingSnapshot = _useState218[0],
    setViewingSnapshot = _useState218[1];
  var _useState219 = useState("curated"),
    _useState220 = _slicedToArray(_useState219, 2),
    snapshotScope = _useState220[0],
    setSnapshotScope = _useState220[1]; // 'curated' | 'unique' | 'raw'
  var _useState221 = useState(""),
    _useState222 = _slicedToArray(_useState221, 2),
    snapshotFilterKeyword = _useState222[0],
    setSnapshotFilterKeyword = _useState222[1];
  var _useState223 = useState(""),
    _useState224 = _slicedToArray(_useState223, 2),
    snapshotFilterLocation = _useState224[0],
    setSnapshotFilterLocation = _useState224[1];
  var _useState225 = useState("all"),
    _useState226 = _slicedToArray(_useState225, 2),
    snapshotFilterWorkMode = _useState226[0],
    setSnapshotFilterWorkMode = _useState226[1];
  var _useState227 = useState("all"),
    _useState228 = _slicedToArray(_useState227, 2),
    snapshotFilterExperience = _useState228[0],
    setSnapshotFilterExperience = _useState228[1];
  var _useState229 = useState(0),
    _useState230 = _slicedToArray(_useState229, 2),
    snapshotMinScore = _useState230[0],
    setSnapshotMinScore = _useState230[1];
  var _useState231 = useState("score"),
    _useState232 = _slicedToArray(_useState231, 2),
    snapshotSortBy = _useState232[0],
    setSnapshotSortBy = _useState232[1]; // 'score' | 'date'
  var _useState233 = useState(null),
    _useState234 = _slicedToArray(_useState233, 2),
    selectedJob = _useState234[0],
    setSelectedJob = _useState234[1];
  var fetchAlerts = /*#__PURE__*/function () {
    var _ref31 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee20() {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee20$(_context20) {
        while (1) switch (_context20.prev = _context20.next) {
          case 0:
            _context20.prev = 0;
            setLoadingAlerts(true);
            _context20.next = 4;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts"), {
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 4:
            res = _context20.sent;
            _context20.next = 7;
            return res.json();
          case 7:
            data = _context20.sent;
            if (res.ok) {
              setActiveAlerts(data || []);
            }
            _context20.next = 14;
            break;
          case 11:
            _context20.prev = 11;
            _context20.t0 = _context20["catch"](0);
            console.error("Fetch alerts error:", _context20.t0);
          case 14:
            _context20.prev = 14;
            setLoadingAlerts(false);
            return _context20.finish(14);
          case 17:
          case "end":
            return _context20.stop();
        }
      }, _callee20, null, [[0, 11, 14, 17]]);
    }));
    return function fetchAlerts() {
      return _ref31.apply(this, arguments);
    };
  }();
  var fetchHistory = /*#__PURE__*/function () {
    var _ref32 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee21() {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee21$(_context21) {
        while (1) switch (_context21.prev = _context21.next) {
          case 0:
            _context21.prev = 0;
            setLoadingHistory(true);
            _context21.next = 4;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts/history"), {
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 4:
            res = _context21.sent;
            _context21.next = 7;
            return res.json();
          case 7:
            data = _context21.sent;
            if (res.ok && data.history) {
              setHistoryList(data.history || []);
            }
            _context21.next = 14;
            break;
          case 11:
            _context21.prev = 11;
            _context21.t0 = _context21["catch"](0);
            console.error("Fetch history error:", _context21.t0);
          case 14:
            _context21.prev = 14;
            setLoadingHistory(false);
            return _context21.finish(14);
          case 17:
          case "end":
            return _context21.stop();
        }
      }, _callee21, null, [[0, 11, 14, 17]]);
    }));
    return function fetchHistory() {
      return _ref32.apply(this, arguments);
    };
  }();
  var fetchFollowups = /*#__PURE__*/function () {
    var _ref33 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee22() {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee22$(_context22) {
        while (1) switch (_context22.prev = _context22.next) {
          case 0:
            _context22.prev = 0;
            setLoadingFollowups(true);
            _context22.next = 4;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts/followups"), {
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 4:
            res = _context22.sent;
            _context22.next = 7;
            return res.json();
          case 7:
            data = _context22.sent;
            if (res.ok && data.followups) {
              setFollowupsList(data.followups || []);
            }
            _context22.next = 14;
            break;
          case 11:
            _context22.prev = 11;
            _context22.t0 = _context22["catch"](0);
            console.error("Fetch followups error:", _context22.t0);
          case 14:
            _context22.prev = 14;
            setLoadingFollowups(false);
            return _context22.finish(14);
          case 17:
          case "end":
            return _context22.stop();
        }
      }, _callee22, null, [[0, 11, 14, 17]]);
    }));
    return function fetchFollowups() {
      return _ref33.apply(this, arguments);
    };
  }();
  useEffect(function () {
    Promise.all([fetchAlerts(), fetchHistory(), fetchFollowups()]);
  }, []);
  var handleResumeChange = /*#__PURE__*/function () {
    var _ref34 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee23(e) {
      var file, formData, res, data, _data$profile$skills2;
      return _regeneratorRuntime().wrap(function _callee23$(_context23) {
        while (1) switch (_context23.prev = _context23.next) {
          case 0:
            file = e.target.files[0];
            if (file) {
              _context23.next = 3;
              break;
            }
            return _context23.abrupt("return");
          case 3:
            setResumeFile(file);
            setParsingResume(true);
            formData = new FormData();
            formData.append("file", file);
            _context23.prev = 7;
            _context23.next = 10;
            return fetch("".concat(API_BASE_URL, "/api/v1/search/parse-resume"), {
              method: "POST",
              body: formData
            });
          case 10:
            res = _context23.sent;
            _context23.next = 13;
            return res.json();
          case 13:
            data = _context23.sent;
            if (res.ok && data.status === 'success') {
              setResumeProfile(data.profile);
              if (data.profile.target_roles && data.profile.target_roles[0]) {
                setRole(data.profile.target_roles[0]);
              }
              showToast("Resume attached! Extracted ".concat(((_data$profile$skills2 = data.profile.skills) === null || _data$profile$skills2 === void 0 ? void 0 : _data$profile$skills2.length) || 0, " skills."));
            }
            _context23.next = 20;
            break;
          case 17:
            _context23.prev = 17;
            _context23.t0 = _context23["catch"](7);
            showToast("Resume attached.");
          case 20:
            _context23.prev = 20;
            setParsingResume(false);
            return _context23.finish(20);
          case 23:
          case "end":
            return _context23.stop();
        }
      }, _callee23, null, [[7, 17, 20, 23]]);
    }));
    return function handleResumeChange(_x8) {
      return _ref34.apply(this, arguments);
    };
  }();
  var handleSaveAlert = /*#__PURE__*/function () {
    var _ref35 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee24(e) {
      var formData, expMap, res, data;
      return _regeneratorRuntime().wrap(function _callee24$(_context24) {
        while (1) switch (_context24.prev = _context24.next) {
          case 0:
            e.preventDefault();
            setSaving(true);
            formData = new FormData();
            formData.append("email", email);
            formData.append("role", role);
            formData.append("location", location);
            formData.append("work_mode", workMode);
            formData.append("experience_level", experienceLevel);
            formData.append("experience_tier", experienceLevel);
            formData.append("sub_domain", subDomain);
            formData.append("stipend_range", stipendRange);
            if (aiFacets.length > 0) {
              formData.append("ai_facets_json", JSON.stringify(aiFacets));
            }
            expMap = {
              intern: 0.0,
              entry: 1.0,
              junior: 2.0,
              mid: 4.0,
              senior: 6.0,
              lead: 8.0
            };
            formData.append("experience_years", expMap[experienceLevel] !== undefined ? expMap[experienceLevel] : 0.0);
            formData.append("max_age_days", maxAgeDays);
            formData.append("preferred_time", preferredTime);
            if (resumeProfile !== null && resumeProfile !== void 0 && resumeProfile.skills) {
              formData.append("skills_json", JSON.stringify(resumeProfile.skills));
            }
            if (resumeProfile !== null && resumeProfile !== void 0 && resumeProfile.summary) {
              formData.append("resume_summary", resumeProfile.summary);
            }
            if (resumeFile) {
              formData.append("resume", resumeFile);
            }
            _context24.prev = 19;
            _context24.next = 22;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts"), {
              method: "POST",
              headers: {
                'Authorization': "Bearer ".concat(token)
              },
              body: formData
            });
          case 22:
            res = _context24.sent;
            _context24.next = 25;
            return res.json();
          case 25:
            data = _context24.sent;
            if (res.ok) {
              showToast("Daily job automation scheduled for ".concat(email, "!"));
              if (data.alert) {
                setActiveAlerts(function (prev) {
                  return [data.alert].concat(_toConsumableArray(prev.filter(function (a) {
                    return a.id !== data.alert.id;
                  })));
                });
              }
              fetchHistory();
            } else {
              showToast(data.detail || "Failed to schedule alert.", "error");
            }
            _context24.next = 32;
            break;
          case 29:
            _context24.prev = 29;
            _context24.t0 = _context24["catch"](19);
            showToast(_context24.t0.message, "error");
          case 32:
            _context24.prev = 32;
            setSaving(false);
            return _context24.finish(32);
          case 35:
          case "end":
            return _context24.stop();
        }
      }, _callee24, null, [[19, 29, 32, 35]]);
    }));
    return function handleSaveAlert(_x9) {
      return _ref35.apply(this, arguments);
    };
  }();
  var handleSendTestEmail = /*#__PURE__*/function () {
    var _ref36 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee25() {
      var formData, expMap, res, data;
      return _regeneratorRuntime().wrap(function _callee25$(_context25) {
        while (1) switch (_context25.prev = _context25.next) {
          case 0:
            setTesting(true);
            formData = new FormData();
            formData.append("email", email);
            formData.append("role", role);
            formData.append("location", location);
            formData.append("work_mode", workMode);
            formData.append("experience_level", experienceLevel);
            expMap = {
              intern: 0.0,
              entry: 1.0,
              junior: 2.0,
              mid: 4.0,
              senior: 6.0,
              lead: 8.0
            };
            formData.append("experience_years", expMap[experienceLevel] !== undefined ? expMap[experienceLevel] : 0.0);
            formData.append("max_age_days", maxAgeDays);
            if (resumeFile) {
              formData.append("resume", resumeFile);
            }
            _context25.prev = 11;
            _context25.next = 14;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts/test-send"), {
              method: "POST",
              headers: {
                'Authorization': "Bearer ".concat(token)
              },
              body: formData
            });
          case 14:
            res = _context25.sent;
            _context25.next = 17;
            return res.json();
          case 17:
            data = _context25.sent;
            if (res.ok && (data.status === 'success' || data.status === 'partial')) {
              showToast("Sent ".concat(data.jobs_sent || 0, " Jobs + CSV to ").concat(email, "!"));
              fetchHistory();
            } else {
              showToast(data.detail || data.message || "Failed to send test email.", "error");
            }
            _context25.next = 24;
            break;
          case 21:
            _context25.prev = 21;
            _context25.t0 = _context25["catch"](11);
            showToast(_context25.t0.message, "error");
          case 24:
            _context25.prev = 24;
            setTesting(false);
            return _context25.finish(24);
          case 27:
          case "end":
            return _context25.stop();
        }
      }, _callee25, null, [[11, 21, 24, 27]]);
    }));
    return function handleSendTestEmail() {
      return _ref36.apply(this, arguments);
    };
  }();
  var handleDeleteAlert = /*#__PURE__*/function () {
    var _ref37 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee26(alertId) {
      var res;
      return _regeneratorRuntime().wrap(function _callee26$(_context26) {
        while (1) switch (_context26.prev = _context26.next) {
          case 0:
            setActiveAlerts(function (prev) {
              return prev.filter(function (a) {
                return a.id !== alertId;
              });
            });
            showToast("Alert automation removed.");
            _context26.prev = 2;
            _context26.next = 5;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts/").concat(alertId), {
              method: "DELETE",
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 5:
            res = _context26.sent;
            if (!res.ok) {
              fetchAlerts();
            }
            _context26.next = 13;
            break;
          case 9:
            _context26.prev = 9;
            _context26.t0 = _context26["catch"](2);
            fetchAlerts();
            showToast(_context26.t0.message, "error");
          case 13:
          case "end":
            return _context26.stop();
        }
      }, _callee26, null, [[2, 9]]);
    }));
    return function handleDeleteAlert(_x10) {
      return _ref37.apply(this, arguments);
    };
  }();
  var handleDeleteHistory = /*#__PURE__*/function () {
    var _ref38 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee27(historyId) {
      return _regeneratorRuntime().wrap(function _callee27$(_context27) {
        while (1) switch (_context27.prev = _context27.next) {
          case 0:
            setHistoryList(function (prev) {
              return prev.filter(function (h) {
                return h.id !== historyId;
              });
            });
            showToast("Automation digest history snapshot removed.");
            _context27.prev = 2;
            _context27.next = 5;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts/history/").concat(historyId), {
              method: "DELETE",
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 5:
            _context27.next = 10;
            break;
          case 7:
            _context27.prev = 7;
            _context27.t0 = _context27["catch"](2);
            fetchHistory();
          case 10:
          case "end":
            return _context27.stop();
        }
      }, _callee27, null, [[2, 7]]);
    }));
    return function handleDeleteHistory(_x11) {
      return _ref38.apply(this, arguments);
    };
  }();
  var handleInspectClick = /*#__PURE__*/function () {
    var _ref39 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee28(historyId) {
      var res, data, _data$history$curated;
      return _regeneratorRuntime().wrap(function _callee28$(_context28) {
        while (1) switch (_context28.prev = _context28.next) {
          case 0:
            _context28.prev = 0;
            setInspectingId(historyId);
            _context28.next = 4;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts/history/").concat(historyId), {
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 4:
            res = _context28.sent;
            _context28.next = 7;
            return res.json();
          case 7:
            data = _context28.sent;
            if (res.ok && data.history) {
              setViewingSnapshot(data.history);
              setSnapshotScope("curated");
              setSnapshotFilterKeyword("");
              setSnapshotFilterLocation("");
              setSnapshotFilterWorkMode("all");
              setSnapshotFilterExperience("all");
              setSnapshotMinScore(0);
              showToast("Viewing snapshot for \"".concat(data.history.role, "\" (").concat(((_data$history$curated = data.history.curated_jobs) === null || _data$history$curated === void 0 ? void 0 : _data$history$curated.length) || 0, " curated jobs) on this page!"));
              setTimeout(function () {
                var el = document.getElementById("snapshot-viewer-section");
                if (el) el.scrollIntoView({
                  behavior: "smooth",
                  block: "start"
                });
              }, 100);
            } else {
              showToast("Failed to load historical snapshot.", "error");
            }
            _context28.next = 14;
            break;
          case 11:
            _context28.prev = 11;
            _context28.t0 = _context28["catch"](0);
            showToast(_context28.t0.message, "error");
          case 14:
            _context28.prev = 14;
            setInspectingId(null);
            return _context28.finish(14);
          case 17:
          case "end":
            return _context28.stop();
        }
      }, _callee28, null, [[0, 11, 14, 17]]);
    }));
    return function handleInspectClick(_x12) {
      return _ref39.apply(this, arguments);
    };
  }();
  var handleDownloadHistoryCSV = /*#__PURE__*/function () {
    var _ref40 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee29(historyId) {
      var type,
        res,
        data,
        list,
        label,
        prefix,
        _args29 = arguments;
      return _regeneratorRuntime().wrap(function _callee29$(_context29) {
        while (1) switch (_context29.prev = _context29.next) {
          case 0:
            type = _args29.length > 1 && _args29[1] !== undefined ? _args29[1] : 'curated';
            _context29.prev = 1;
            _context29.next = 4;
            return fetch("".concat(API_BASE_URL, "/api/v1/alerts/history/").concat(historyId), {
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 4:
            res = _context29.sent;
            _context29.next = 7;
            return res.json();
          case 7:
            data = _context29.sent;
            if (res.ok && data.history) {
              list = type === 'raw' ? data.history.raw_jobs || [] : data.history.curated_jobs || [];
              label = type === 'raw' ? "Raw Harvested" : "Curated Matches";
              prefix = "".concat(type, "_digest_").concat((data.history.role || 'jobs').replace(/[^a-zA-Z0-9]/g, '_'));
              generateJobsCSV(list, label, prefix);
              showToast("Downloaded ".concat(label, " CSV (").concat(list.length, " jobs)"));
            } else {
              showToast("Failed to export historical CSV.", "error");
            }
            _context29.next = 14;
            break;
          case 11:
            _context29.prev = 11;
            _context29.t0 = _context29["catch"](1);
            showToast("Error generating CSV: " + _context29.t0.message, "error");
          case 14:
          case "end":
            return _context29.stop();
        }
      }, _callee29, null, [[1, 11]]);
    }));
    return function handleDownloadHistoryCSV(_x13) {
      return _ref40.apply(this, arguments);
    };
  }();
  var activeSnapshotList = useMemo(function () {
    if (!viewingSnapshot) return [];
    if (snapshotScope === 'raw') return viewingSnapshot.raw_jobs || [];
    if (snapshotScope === 'unique') return viewingSnapshot.unique_jobs || [];
    return viewingSnapshot.curated_jobs || [];
  }, [viewingSnapshot, snapshotScope]);
  var filteredSnapshotJobs = useMemo(function () {
    if (!activeSnapshotList) return [];
    return activeSnapshotList.filter(function (job) {
      if (!job) return false;
      var title = (job.title || "").toLowerCase();
      var company = (job.company || "").toLowerCase();
      var jobLoc = (job.location || "").toLowerCase();
      var desc = (job.description || "").toLowerCase();
      var skillsStr = (job.matching_skills || []).join(" ").toLowerCase();

      // 1. Smart Multi-Token & Domain Keyword Search (Title, Company, Description, Skills)
      if (snapshotFilterKeyword && snapshotFilterKeyword.trim()) {
        var kw = snapshotFilterKeyword.toLowerCase().trim();
        var kwTokens = kw.split(/[,/\s+|\-]+/).filter(function (t) {
          return t.length > 1;
        });
        var _skillsStr = (job.matching_skills || []).join(" ").toLowerCase();
        var fullText = "".concat(title, " ").concat(company, " ").concat(jobLoc, " ").concat(desc, " ").concat(_skillsStr);

        // Direct full phrase match
        var directMatch = fullText.includes(kw);

        // Multi-token match (Every search word matches anywhere in title/company/skills/description)
        var allTokensMatch = kwTokens.length > 0 && kwTokens.every(function (tok) {
          return fullText.includes(tok);
        });

        // Smart AI/ML Title abbreviations & domain expansion
        var domainTitleMatch = false;
        if (kw.includes("ai") || kw.includes("artificial intelligence") || kw.includes("ml") || kw.includes("machine learning")) {
          var hasAiDomain = title.includes("ai") || title.includes("ml") || title.includes("machine learning") || title.includes("artificial intelligence") || title.includes("llm") || title.includes("genai") || title.includes("rag") || title.includes("prompt");
          var hasInternTerm = kw.includes("intern") || kw.includes("internship");
          if (hasInternTerm) {
            domainTitleMatch = hasAiDomain && (title.includes("intern") || title.includes("trainee") || title.includes("co-op") || title.includes("student") || title.includes("fellow") || title.includes("apprentice"));
          } else {
            domainTitleMatch = hasAiDomain;
          }
        }
        if (!directMatch && !allTokensMatch && !domainTitleMatch) {
          return false;
        }
      }

      // 2. Location filter using matchesLocationNLP
      if (snapshotFilterLocation && snapshotFilterLocation.trim()) {
        if (!matchesLocationNLP(snapshotFilterLocation, jobLoc, desc, job.source)) {
          return false;
        }
      }

      // 3. Work Mode filter
      var isRemote = jobLoc.includes('remote') || jobLoc.includes('wfh') || jobLoc.includes('work from home') || jobLoc.includes('anywhere');
      var isHybrid = jobLoc.includes('hybrid') || desc.includes('hybrid');
      var isOnsite = !isRemote && !isHybrid;
      if (snapshotFilterWorkMode === 'remote' && !isRemote) return false;
      if (snapshotFilterWorkMode === 'hybrid' && !isHybrid) return false;
      if (snapshotFilterWorkMode === 'onsite' && !isOnsite) return false;

      // 4. Experience Level filter
      if (snapshotFilterExperience && snapshotFilterExperience !== 'all') {
        var minYears = typeof job.min_experience_years === 'number' ? job.min_experience_years : -1;
        var fitLower = (job.experience_fit || "").toLowerCase();
        var expReq = (job.experience_required || "").toLowerCase();
        var isTrueIntern = title.includes('intern') || title.includes('internship') || title.includes('trainee') || title.includes('apprentice') || title.includes('co-op') || title.includes('student') || fitLower.includes('intern') || expReq.includes('intern');
        var isSeniorRole = title.includes('senior') || title.includes('sr.') || title.includes('sr ') || title.includes('lead') || title.includes('principal') || title.includes('staff') || title.includes('director') || title.includes('architect') || title.includes('head of') || fitLower.includes('senior') || fitLower.includes('lead') || minYears >= 5;
        var isEntryRole = (title.includes('entry') || title.includes('fresher') || title.includes('graduate') || title.includes('new grad') || expReq.includes('0-1') || expReq.includes('1 yr') || minYears === 0 || minYears === 1) && !isSeniorRole;
        var isJuniorRole = (title.includes('junior') || title.includes('jr.') || title.includes('associate') || expReq.includes('1-2') || expReq.includes('2 yr') || minYears === 2) && !isSeniorRole;
        var requiresYears = minYears >= 2 || desc.includes('2+ year') || desc.includes('3+ year') || desc.includes('4+ year') || desc.includes('5+ year') || desc.includes('2-4 year') || desc.includes('3-5 year');
        if (snapshotFilterExperience === 'intern' && (!isTrueIntern || requiresYears || isSeniorRole)) return false;
        if (snapshotFilterExperience === 'entry' && (!isEntryRole || isTrueIntern || isSeniorRole || minYears > 1)) return false;
        if (snapshotFilterExperience === 'junior' && (!isJuniorRole || isTrueIntern || isSeniorRole || minYears > 2)) return false;
        if (snapshotFilterExperience === 'mid' && (minYears < 2 || minYears > 5 || isTrueIntern || title.includes('principal') || title.includes('staff'))) return false;
        if (snapshotFilterExperience === 'senior' && !isSeniorRole && minYears < 4) return false;
        if (snapshotFilterExperience === 'lead' && minYears < 7 && !title.includes('lead') && !title.includes('principal') && !title.includes('staff')) return false;
      }

      // 5. Min Score filter
      if (snapshotScope === 'curated' && snapshotMinScore > 0) {
        if ((job.match_score || 0) < snapshotMinScore) return false;
      }
      return true;
    }).sort(function (a, b) {
      if (snapshotSortBy === 'date') {
        return new Date(b.posted_date || 0) - new Date(a.posted_date || 0);
      }
      return (b.match_score || 0) - (a.match_score || 0);
    });
  }, [activeSnapshotList, snapshotFilterKeyword, snapshotFilterLocation, snapshotFilterWorkMode, snapshotFilterExperience, snapshotMinScore, snapshotSortBy, snapshotScope]);
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
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
  }, "Experience Level"), /*#__PURE__*/React.createElement("select", {
    value: experienceLevel,
    onChange: function onChange(e) {
      return setExperienceLevel(e.target.value);
    },
    className: "w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
  }, /*#__PURE__*/React.createElement("option", {
    value: "intern"
  }, "\uD83C\uDF31 Internship / Fresher (0 Yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "entry"
  }, "\uD83D\uDE80 0\u20131 Yr (Entry Level)"), /*#__PURE__*/React.createElement("option", {
    value: "junior"
  }, "\u26A1 1\u20132 Yrs (Junior)"), /*#__PURE__*/React.createElement("option", {
    value: "mid"
  }, "\uD83D\uDCBC 3\u20135 Yrs (Mid-Level)"), /*#__PURE__*/React.createElement("option", {
    value: "senior"
  }, "\uD83D\uDC51 5+ Yrs (Senior)"), /*#__PURE__*/React.createElement("option", {
    value: "lead"
  }, "\uD83C\uDFC6 8+ Yrs (Lead / Staff)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
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
    }, "\uD83D\uDCCD ", alert.location || 'Remote', " \u2022 \u23F0 ", alert.preferred_time, " \u2022 ", /*#__PURE__*/React.createElement("span", {
      className: "text-indigo-300 font-semibold"
    }, "\uD83C\uDF93 ", alert.experience_level ? alert.experience_level === 'all' ? 'All Levels' : alert.experience_level.toUpperCase() : "".concat(alert.experience_years || 0, " Yrs"))), /*#__PURE__*/React.createElement("div", {
      className: "text-[10px] text-indigo-400"
    }, "\u2709\uFE0F ", alert.email)), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleDeleteAlert(alert.id);
      },
      className: "text-slate-500 hover:text-rose-400 text-xs p-1"
    }, "\uD83D\uDDD1\uFE0F")));
  })))), /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-xl p-5 sm:p-6 border border-white/[0.08] space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-white text-sm flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCDC"), /*#__PURE__*/React.createElement("span", null, "Sent Automation History & Job Snapshots")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 mt-0.5"
  }, "Every email digest sent to your inbox is saved here. Inspect curated matches and raw databases interactively on this page with complete search and filter capabilities.")), /*#__PURE__*/React.createElement("button", {
    onClick: fetchHistory,
    className: "px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5 self-start sm:self-auto"
  }, /*#__PURE__*/React.createElement("span", null, "\u21BB"), /*#__PURE__*/React.createElement("span", null, "Refresh History"))), viewingSnapshot && /*#__PURE__*/React.createElement("div", {
    id: "snapshot-viewer-section",
    className: "rounded-2xl p-4 sm:p-6 border-2 border-indigo-500/50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950 space-y-5 shadow-2xl shadow-indigo-950/40"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 flex-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-xs shadow-sm flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCDC"), " Snapshot Viewer"), /*#__PURE__*/React.createElement("h3", {
    className: "font-extrabold text-white text-base sm:text-lg"
  }, "\"", viewingSnapshot.role, "\""), /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
  }, "\uD83D\uDCCD ", viewingSnapshot.location || 'Remote')), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-400 flex items-center gap-2 flex-wrap"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDDD3\uFE0F Sent on ", viewingSnapshot.sent_at ? new Date(viewingSnapshot.sent_at).toLocaleString() : 'Recent'), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", null, "\u2709\uFE0F ", viewingSnapshot.recipient_email), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", {
    className: "text-indigo-300 font-semibold"
  }, "\uD83C\uDF93 Exp: ", viewingSnapshot.experience_level ? viewingSnapshot.experience_level === 'all' ? 'All Levels' : viewingSnapshot.experience_level.toUpperCase() : "".concat(viewingSnapshot.experience_years || 0, " Yrs")), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF10 Mode: ", viewingSnapshot.work_mode || 'any'), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", null, "\u23F1\uFE0F ", viewingSnapshot.max_age_days ? "".concat(viewingSnapshot.max_age_days, "d window") : '24h'))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 flex-wrap self-start md:self-auto"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      var list = snapshotScope === 'raw' ? viewingSnapshot.raw_jobs || [] : snapshotScope === 'unique' ? viewingSnapshot.unique_jobs || [] : viewingSnapshot.curated_jobs || [];
      generateJobsCSV(list, "".concat(snapshotScope, " Snapshot"), "".concat(snapshotScope, "_snapshot_").concat((viewingSnapshot.role || 'jobs').replace(/[^a-zA-Z0-9]/g, '_')));
    },
    className: "px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition-all flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCE5"), /*#__PURE__*/React.createElement("span", null, "Export CSV")), onInspectSnapshot && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return onInspectSnapshot(viewingSnapshot);
    },
    title: "Open in Main Search Dashboard if you want to merge into full workspace pool",
    className: "px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDE80"), /*#__PURE__*/React.createElement("span", null, "Open in Main Search")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setViewingSnapshot(null);
    },
    className: "px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/30 text-rose-200 text-xs font-bold transition-all flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", null, "\u2715"), /*#__PURE__*/React.createElement("span", null, "Close Viewer")))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2 flex-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-white/[0.06]"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setSnapshotScope('curated');
    },
    className: "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ".concat(snapshotScope === 'curated' ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white")
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDFAF Curated Matches"), /*#__PURE__*/React.createElement("span", {
    className: "px-1.5 py-0.2 rounded-full text-[10px] bg-black/30"
  }, (viewingSnapshot.curated_jobs || []).length)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setSnapshotScope('unique');
    },
    className: "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ".concat(snapshotScope === 'unique' ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white")
  }, /*#__PURE__*/React.createElement("span", null, "\uD83E\uDDEC Unique Roles"), /*#__PURE__*/React.createElement("span", {
    className: "px-1.5 py-0.2 rounded-full text-[10px] bg-black/30"
  }, (viewingSnapshot.unique_jobs || []).length)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setSnapshotScope('raw');
    },
    className: "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ".concat(snapshotScope === 'raw' ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white")
  }, /*#__PURE__*/React.createElement("span", null, "\uD83C\uDF10 Raw Harvested"), /*#__PURE__*/React.createElement("span", {
    className: "px-1.5 py-0.2 rounded-full text-[10px] bg-black/30"
  }, (viewingSnapshot.raw_jobs || []).length))), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-400 font-medium"
  }, "Showing ", /*#__PURE__*/React.createElement("strong", {
    className: "text-white"
  }, filteredSnapshotJobs.length), " of ", activeSnapshotList.length, " jobs")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-white/[0.04]"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: snapshotFilterKeyword,
    onChange: function onChange(e) {
      return setSnapshotFilterKeyword(e.target.value);
    },
    placeholder: "Search title, skills, company...",
    className: "w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: snapshotFilterLocation,
    onChange: function onChange(e) {
      return setSnapshotFilterLocation(e.target.value);
    },
    placeholder: "Filter location (Pune, US, etc)...",
    className: "w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("select", {
    value: snapshotFilterWorkMode,
    onChange: function onChange(e) {
      return setSnapshotFilterWorkMode(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Work Mode: All"), /*#__PURE__*/React.createElement("option", {
    value: "remote"
  }, "Remote Only"), /*#__PURE__*/React.createElement("option", {
    value: "onsite"
  }, "Onsite Only"), /*#__PURE__*/React.createElement("option", {
    value: "hybrid"
  }, "Hybrid Only"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("select", {
    value: snapshotFilterExperience,
    onChange: function onChange(e) {
      return setSnapshotFilterExperience(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Exp: All Levels"), /*#__PURE__*/React.createElement("option", {
    value: "intern"
  }, "Intern / Internship"), /*#__PURE__*/React.createElement("option", {
    value: "entry"
  }, "Entry Level (0-1 yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "junior"
  }, "Junior (1-3 yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "mid"
  }, "Mid Level (3-5 yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "senior"
  }, "Senior (5-8 yrs)"), /*#__PURE__*/React.createElement("option", {
    value: "lead"
  }, "Lead / Staff (8+ yrs)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("select", {
    value: snapshotMinScore,
    onChange: function onChange(e) {
      return setSnapshotMinScore(Number(e.target.value));
    },
    className: "w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: 0
  }, "Min Match: All"), /*#__PURE__*/React.createElement("option", {
    value: 60
  }, "Min Match: 60%+"), /*#__PURE__*/React.createElement("option", {
    value: 75
  }, "Min Match: 75%+"), /*#__PURE__*/React.createElement("option", {
    value: 85
  }, "Min Match: 85%+"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("select", {
    value: snapshotSortBy,
    onChange: function onChange(e) {
      return setSnapshotSortBy(e.target.value);
    },
    className: "w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
  }, /*#__PURE__*/React.createElement("option", {
    value: "score"
  }, "Sort: Highest Match"), /*#__PURE__*/React.createElement("option", {
    value: "date"
  }, "Sort: Newest Posted")))), filteredSnapshotJobs.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "p-8 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-400 space-y-1"
  }, /*#__PURE__*/React.createElement("div", null, "\uD83D\uDD0D No jobs in this snapshot matched your current filters."), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      setSnapshotFilterKeyword('');
      setSnapshotFilterLocation('');
      setSnapshotFilterWorkMode('all');
      setSnapshotFilterExperience('all');
      setSnapshotMinScore(0);
    },
    className: "text-indigo-400 hover:text-indigo-300 font-semibold underline text-xs"
  }, "Clear filters to see all ", activeSnapshotList.length, " jobs")) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[700px] overflow-y-auto pr-1"
  }, filteredSnapshotJobs.map(function (job, idx) {
    var jobKey = (job.url || job.job_url || "".concat(job.title, "-").concat(job.company, "-").concat(job.location, "-").concat(idx) || "").toLowerCase().trim();
    var isApplied = (appliedJobs || []).some(function (item) {
      return (item.url || item.job_url || "".concat(item.title, "-").concat(item.company, "-").concat(item.location) || "").toLowerCase().trim() === (job.url || job.job_url || "".concat(job.title, "-").concat(job.company, "-").concat(job.location) || "").toLowerCase().trim();
    });
    return /*#__PURE__*/React.createElement(JobCard, {
      key: jobKey,
      job: job,
      jobScope: snapshotScope,
      resumeSkills: (resumeProfile === null || resumeProfile === void 0 ? void 0 : resumeProfile.skills) || [],
      isApplied: isApplied,
      onToggleApplied: onToggleApplied,
      onViewDetails: function onViewDetails() {
        return setSelectedJob(job);
      },
      onQueryAI: function onQueryAI() {}
    });
  }))), loadingHistory ? /*#__PURE__*/React.createElement("div", {
    className: "text-center py-10 text-xs text-slate-500"
  }, "Loading automation history...") : historyList.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "p-8 rounded-xl bg-slate-900/40 border border-dashed border-slate-700 text-center space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-2xl"
  }, "\uD83D\uDCEC"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs font-semibold text-slate-300"
  }, "No automation digests sent yet"), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-500 max-w-md mx-auto"
  }, "Save an automation or click \"Send Live Test Digest Now\" above. When digests are dispatched, complete interactive snapshots will appear here for instant filtering and CSV export.")) : /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-4"
  }, historyList.map(function (item) {
    var isViewing = (viewingSnapshot === null || viewingSnapshot === void 0 ? void 0 : viewingSnapshot.id) === item.id;
    return /*#__PURE__*/React.createElement("div", {
      key: item.id,
      className: "p-4 rounded-xl bg-slate-900/90 border transition-all space-y-3 shadow-md ".concat(isViewing ? "border-indigo-500 ring-2 ring-indigo-500/30 bg-slate-900" : "border-white/[0.06] hover:border-indigo-500/30")
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between gap-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 flex-wrap"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-bold text-white text-sm"
    }, item.role), /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
    }, "\uD83D\uDCCD ", item.location || 'Remote'), isViewing && /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
    }, "Viewing Above \u25BE")), /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap"
    }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDDD3\uFE0F ", item.sent_at ? new Date(item.sent_at).toLocaleString() : 'Recent'), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", {
      className: "text-slate-300"
    }, "\u2709\uFE0F ", item.recipient_email))), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleDeleteHistory(item.id);
      },
      title: "Delete snapshot",
      className: "text-slate-500 hover:text-rose-400 text-xs p-1"
    }, "\uD83D\uDDD1\uFE0F")), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400"
    }, /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 rounded bg-slate-800 border border-white/5"
    }, "Mode: ", item.work_mode || 'any'), /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-indigo-300 font-medium"
    }, "Exp: ", item.experience_level ? item.experience_level === 'all' ? 'All Levels' : item.experience_level.toUpperCase() : "".concat(item.experience_years || 0, " Yrs")), /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 rounded bg-slate-800 border border-white/5"
    }, "Window: ", item.max_age_days ? "".concat(item.max_age_days, "d") : '24h'), item.preferred_time && /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 rounded bg-slate-800 border border-white/5"
    }, "Time: ", item.preferred_time)), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 pt-1 border-t border-white/[0.04]"
    }, /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold"
    }, "\uD83C\uDFAF ", item.total_curated_sent || 0, " Curated"), /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold"
    }, "\uD83E\uDDEC ", item.total_unique_found || 0, " Unique"), /*#__PURE__*/React.createElement("span", {
      className: "px-2 py-0.5 rounded-lg bg-slate-800 border border-white/5 text-slate-300 text-[11px] font-semibold"
    }, "\uD83C\uDF10 ", item.total_raw_found || 0, " Raw")), /*#__PURE__*/React.createElement("div", {
      className: "pt-2 flex flex-wrap items-center gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleInspectClick(item.id);
      },
      disabled: inspectingId === item.id,
      className: "flex-1 py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 ".concat(isViewing ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white")
    }, /*#__PURE__*/React.createElement("span", null, isViewing ? "✓" : "🔍"), /*#__PURE__*/React.createElement("span", null, inspectingId === item.id ? "Loading Snapshot..." : isViewing ? "Viewing On This Page ▾" : "Inspect & Filter on Website")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleDownloadHistoryCSV(item.id, 'curated');
      },
      className: "px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition-all",
      title: "Download Curated CSV"
    }, "\uD83D\uDCE5 Curated CSV"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleDownloadHistoryCSV(item.id, 'raw');
      },
      className: "px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition-all",
      title: "Download Raw CSV"
    }, "\uD83D\uDCE5 Raw CSV")));
  }))), selectedJob && /*#__PURE__*/React.createElement(JobDetailModal, {
    job: selectedJob,
    user: user,
    token: token,
    resumeSkills: (resumeProfile === null || resumeProfile === void 0 ? void 0 : resumeProfile.skills) || [],
    isApplied: (appliedJobs || []).some(function (item) {
      return (item.url || item.job_url || "".concat(item.title, "-").concat(item.company, "-").concat(item.location) || "").toLowerCase().trim() === (selectedJob.url || selectedJob.job_url || "".concat(selectedJob.title, "-").concat(selectedJob.company, "-").concat(selectedJob.location) || "").toLowerCase().trim();
    }),
    onToggleApplied: onToggleApplied,
    onClose: function onClose() {
      return setSelectedJob(null);
    },
    onOpenCookieModal: onOpenCookieModal,
    showToast: showToast
  }));
}

// ==========================================
// Component: Admin User Management Portal
// ==========================================
function AdminPortal(_ref41) {
  var token = _ref41.token,
    user = _ref41.user,
    showToast = _ref41.showToast;
  var _useState235 = useState([]),
    _useState236 = _slicedToArray(_useState235, 2),
    users = _useState236[0],
    setUsers = _useState236[1];
  var _useState237 = useState(true),
    _useState238 = _slicedToArray(_useState237, 2),
    loading = _useState238[0],
    setLoading = _useState238[1];
  var _useState239 = useState(""),
    _useState240 = _slicedToArray(_useState239, 2),
    newEmail = _useState240[0],
    setNewEmail = _useState240[1];
  var _useState241 = useState(""),
    _useState242 = _slicedToArray(_useState241, 2),
    newPassword = _useState242[0],
    setNewPassword = _useState242[1];
  var _useState243 = useState("user"),
    _useState244 = _slicedToArray(_useState243, 2),
    newRole = _useState244[0],
    setNewRole = _useState244[1];
  var _useState245 = useState(false),
    _useState246 = _slicedToArray(_useState245, 2),
    creating = _useState246[0],
    setCreating = _useState246[1];

  // Global Platform Background Check / Crawler State
  var _useState247 = useState(true),
    _useState248 = _slicedToArray(_useState247, 2),
    bgCheckEnabled = _useState248[0],
    setBgCheckEnabled = _useState248[1];
  var _useState249 = useState(false),
    _useState250 = _slicedToArray(_useState249, 2),
    bgCheckLoading = _useState250[0],
    setBgCheckLoading = _useState250[1];
  var _useState251 = useState(null),
    _useState252 = _slicedToArray(_useState251, 2),
    bgCheckMeta = _useState252[0],
    setBgCheckMeta = _useState252[1];
  var fetchUsers = /*#__PURE__*/function () {
    var _ref42 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee30() {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee30$(_context30) {
        while (1) switch (_context30.prev = _context30.next) {
          case 0:
            _context30.prev = 0;
            setLoading(true);
            _context30.next = 4;
            return fetch("".concat(API_BASE_URL, "/api/v1/admin/users"), {
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 4:
            res = _context30.sent;
            _context30.next = 7;
            return res.json();
          case 7:
            data = _context30.sent;
            if (res.ok) {
              setUsers(data || []);
            } else {
              showToast(data.detail || "Failed to load users", "error");
            }
            _context30.next = 14;
            break;
          case 11:
            _context30.prev = 11;
            _context30.t0 = _context30["catch"](0);
            showToast(_context30.t0.message, "error");
          case 14:
            _context30.prev = 14;
            setLoading(false);
            return _context30.finish(14);
          case 17:
          case "end":
            return _context30.stop();
        }
      }, _callee30, null, [[0, 11, 14, 17]]);
    }));
    return function fetchUsers() {
      return _ref42.apply(this, arguments);
    };
  }();
  var fetchBgCheckStatus = /*#__PURE__*/function () {
    var _ref43 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee31() {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee31$(_context31) {
        while (1) switch (_context31.prev = _context31.next) {
          case 0:
            _context31.prev = 0;
            _context31.next = 3;
            return fetch("".concat(API_BASE_URL, "/api/v1/admin/settings/background-check"), {
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 3:
            res = _context31.sent;
            _context31.next = 6;
            return res.json();
          case 6:
            data = _context31.sent;
            if (res.ok) {
              setBgCheckEnabled(Boolean(data.enabled));
              setBgCheckMeta(data);
            }
            _context31.next = 13;
            break;
          case 10:
            _context31.prev = 10;
            _context31.t0 = _context31["catch"](0);
            console.warn("Could not fetch background check status:", _context31.t0);
          case 13:
          case "end":
            return _context31.stop();
        }
      }, _callee31, null, [[0, 10]]);
    }));
    return function fetchBgCheckStatus() {
      return _ref43.apply(this, arguments);
    };
  }();
  useEffect(function () {
    fetchUsers();
    fetchBgCheckStatus();
  }, []);
  var handleToggleBgCheck = /*#__PURE__*/function () {
    var _ref44 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee32() {
      var willDisable, confirmMsg, res, data;
      return _regeneratorRuntime().wrap(function _callee32$(_context32) {
        while (1) switch (_context32.prev = _context32.next) {
          case 0:
            willDisable = bgCheckEnabled;
            confirmMsg = willDisable ? "Are you sure you want to STOP background checking? This will halt continuous background crawling for everyone. The system will ONLY fetch jobs when a user actively searches on the website." : "Are you sure you want to ENABLE background checking? The system will resume periodic crawling in the background.";
            if (confirm(confirmMsg)) {
              _context32.next = 4;
              break;
            }
            return _context32.abrupt("return");
          case 4:
            _context32.prev = 4;
            setBgCheckLoading(true);
            _context32.next = 8;
            return fetch("".concat(API_BASE_URL, "/api/v1/admin/settings/background-check/toggle"), {
              method: "POST",
              headers: {
                'Authorization': "Bearer ".concat(token),
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                enabled: !bgCheckEnabled
              })
            });
          case 8:
            res = _context32.sent;
            _context32.next = 11;
            return res.json();
          case 11:
            data = _context32.sent;
            if (res.ok) {
              setBgCheckEnabled(Boolean(data.enabled));
              showToast(data.message, data.enabled ? "success" : "info");
              fetchBgCheckStatus();
            } else {
              showToast(data.detail || "Failed to update background check status", "error");
            }
            _context32.next = 18;
            break;
          case 15:
            _context32.prev = 15;
            _context32.t0 = _context32["catch"](4);
            showToast(_context32.t0.message, "error");
          case 18:
            _context32.prev = 18;
            setBgCheckLoading(false);
            return _context32.finish(18);
          case 21:
          case "end":
            return _context32.stop();
        }
      }, _callee32, null, [[4, 15, 18, 21]]);
    }));
    return function handleToggleBgCheck() {
      return _ref44.apply(this, arguments);
    };
  }();
  var handleCreateUser = /*#__PURE__*/function () {
    var _ref45 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee33(e) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee33$(_context33) {
        while (1) switch (_context33.prev = _context33.next) {
          case 0:
            e.preventDefault();
            setCreating(true);
            _context33.prev = 2;
            _context33.next = 5;
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
            res = _context33.sent;
            _context33.next = 8;
            return res.json();
          case 8:
            data = _context33.sent;
            if (res.ok) {
              showToast("User '".concat(newEmail, "' created!"));
              setNewEmail("");
              setNewPassword("");
              setNewRole("user");
              fetchUsers();
            } else {
              showToast(data.detail || "Failed to create user", "error");
            }
            _context33.next = 15;
            break;
          case 12:
            _context33.prev = 12;
            _context33.t0 = _context33["catch"](2);
            showToast(_context33.t0.message, "error");
          case 15:
            _context33.prev = 15;
            setCreating(false);
            return _context33.finish(15);
          case 18:
          case "end":
            return _context33.stop();
        }
      }, _callee33, null, [[2, 12, 15, 18]]);
    }));
    return function handleCreateUser(_x14) {
      return _ref45.apply(this, arguments);
    };
  }();
  var handleToggleStatus = /*#__PURE__*/function () {
    var _ref46 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee34(userId) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee34$(_context34) {
        while (1) switch (_context34.prev = _context34.next) {
          case 0:
            _context34.prev = 0;
            _context34.next = 3;
            return fetch("".concat(API_BASE_URL, "/api/v1/admin/users/").concat(userId, "/status"), {
              method: "PATCH",
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 3:
            res = _context34.sent;
            _context34.next = 6;
            return res.json();
          case 6:
            data = _context34.sent;
            if (res.ok) {
              showToast(data.message);
              fetchUsers();
            } else {
              showToast(data.detail || "Status toggle failed", "error");
            }
            _context34.next = 13;
            break;
          case 10:
            _context34.prev = 10;
            _context34.t0 = _context34["catch"](0);
            showToast(_context34.t0.message, "error");
          case 13:
          case "end":
            return _context34.stop();
        }
      }, _callee34, null, [[0, 10]]);
    }));
    return function handleToggleStatus(_x15) {
      return _ref46.apply(this, arguments);
    };
  }();
  var handleDeleteUser = /*#__PURE__*/function () {
    var _ref47 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee35(userId) {
      var res, data;
      return _regeneratorRuntime().wrap(function _callee35$(_context35) {
        while (1) switch (_context35.prev = _context35.next) {
          case 0:
            if (confirm("Are you sure you want to delete this user?")) {
              _context35.next = 2;
              break;
            }
            return _context35.abrupt("return");
          case 2:
            _context35.prev = 2;
            _context35.next = 5;
            return fetch("".concat(API_BASE_URL, "/api/v1/admin/users/").concat(userId), {
              method: "DELETE",
              headers: {
                'Authorization': "Bearer ".concat(token)
              }
            });
          case 5:
            res = _context35.sent;
            _context35.next = 8;
            return res.json();
          case 8:
            data = _context35.sent;
            if (res.ok) {
              showToast(data.message);
              fetchUsers();
            } else {
              showToast(data.detail || "Delete user failed", "error");
            }
            _context35.next = 15;
            break;
          case 12:
            _context35.prev = 12;
            _context35.t0 = _context35["catch"](2);
            showToast(_context35.t0.message, "error");
          case 15:
          case "end":
            return _context35.stop();
        }
      }, _callee35, null, [[2, 12]]);
    }));
    return function handleDeleteUser(_x16) {
      return _ref47.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "minimal-card rounded-2xl p-6 border transition-all shadow-xl ".concat(bgCheckEnabled ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-950" : "border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-900 to-slate-950")
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col md:flex-row md:items-center justify-between gap-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 flex-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xl"
  }, "\u2699\uFE0F"), /*#__PURE__*/React.createElement("h2", {
    className: "text-base sm:text-lg font-extrabold text-white tracking-tight"
  }, "Global Platform Background Check & Crawler Control"), /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ".concat(bgCheckEnabled ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border-rose-500/40")
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2 h-2 rounded-full ".concat(bgCheckEnabled ? "bg-emerald-400 animate-pulse" : "bg-rose-400")
  }), bgCheckEnabled ? "ACTIVE (Crawling Every 1 Hr)" : "STOPPED (On-Demand Searches Only)")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-300 max-w-3xl leading-relaxed"
  }, bgCheckEnabled ? /*#__PURE__*/React.createElement(React.Fragment, null, "Continuous background job discovery is currently ", /*#__PURE__*/React.createElement("strong", {
    className: "text-emerald-400"
  }, "ENABLED"), ". The background worker crawls platforms every 1 hour across recent search roles and saves new postings to the database.") : /*#__PURE__*/React.createElement(React.Fragment, null, "Background job check is currently ", /*#__PURE__*/React.createElement("strong", {
    className: "text-rose-400"
  }, "STOPPED"), " for everyone. Continuous background crawling is completely halted to save server bandwidth and CPU instance hours. The system will ", /*#__PURE__*/React.createElement("strong", {
    className: "text-white"
  }, "ONLY fetch results when a user actively performs a search"), ".")), bgCheckMeta && /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400 flex items-center gap-3 pt-1"
  }, /*#__PURE__*/React.createElement("span", null, "Cadence: every ", bgCheckMeta.interval_minutes || 60, "m"), /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", null, "Updated by: ", bgCheckMeta.updated_by || 'system'), bgCheckMeta.updated_at && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "\u2022"), /*#__PURE__*/React.createElement("span", null, "Last changed: ", new Date(bgCheckMeta.updated_at).toLocaleString())))), /*#__PURE__*/React.createElement("div", {
    className: "flex-shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleToggleBgCheck,
    disabled: bgCheckLoading,
    className: "w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ".concat(bgCheckEnabled ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 hover:shadow-rose-900/50" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 hover:shadow-emerald-900/50", " disabled:opacity-50")
  }, /*#__PURE__*/React.createElement("span", null, bgCheckLoading ? "Updating..." : bgCheckEnabled ? "⏹️ Stop Background Check" : "▶️ Start Background Check"))))), /*#__PURE__*/React.createElement("div", {
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
  }), /*#__PURE__*/React.createElement(PasswordInput, {
    required: true,
    placeholder: "Initial password",
    value: newPassword,
    onChange: function onChange(e) {
      return setNewPassword(e.target.value);
    }
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