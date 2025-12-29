var e = function () {
  return (
    (e =
      Object.assign ||
      function (e) {
        for (var t, n = 1, i = arguments.length; n < i; n++)
          for (var o in (t = arguments[n]))
            Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
        return e;
      }),
    e.apply(this, arguments)
  );
};
function t(e, t, n, i) {
  return new (n || (n = Promise))(function (o, r) {
    function s(e) {
      try {
        c(i.next(e));
      } catch (e) {
        r(e);
      }
    }
    function a(e) {
      try {
        c(i.throw(e));
      } catch (e) {
        r(e);
      }
    }
    function c(e) {
      var t;
      e.done
        ? o(e.value)
        : ((t = e.value),
          t instanceof n
            ? t
            : new n(function (e) {
                e(t);
              })).then(s, a);
    }
    c((i = i.apply(e, t || [])).next());
  });
}
function n(e, t) {
  var n,
    i,
    o,
    r = {
      label: 0,
      sent: function () {
        if (1 & o[0]) throw o[1];
        return o[1];
      },
      trys: [],
      ops: [],
    },
    s = Object.create(
      ("function" == typeof Iterator ? Iterator : Object).prototype
    );
  return (
    (s.next = a(0)),
    (s.throw = a(1)),
    (s.return = a(2)),
    "function" == typeof Symbol &&
      (s[Symbol.iterator] = function () {
        return this;
      }),
    s
  );
  function a(a) {
    return function (c) {
      return (function (a) {
        if (n) throw new TypeError("Generator is already executing.");
        for (; s && ((s = 0), a[0] && (r = 0)), r; )
          try {
            if (
              ((n = 1),
              i &&
                (o =
                  2 & a[0]
                    ? i.return
                    : a[0]
                      ? i.throw || ((o = i.return) && o.call(i), 0)
                      : i.next) &&
                !(o = o.call(i, a[1])).done)
            )
              return o;
            switch (((i = 0), o && (a = [2 & a[0], o.value]), a[0])) {
              case 0:
              case 1:
                o = a;
                break;
              case 4:
                return (r.label++, { value: a[1], done: !1 });
              case 5:
                (r.label++, (i = a[1]), (a = [0]));
                continue;
              case 7:
                ((a = r.ops.pop()), r.trys.pop());
                continue;
              default:
                if (
                  !((o = r.trys),
                  (o = o.length > 0 && o[o.length - 1]) ||
                    (6 !== a[0] && 2 !== a[0]))
                ) {
                  r = 0;
                  continue;
                }
                if (3 === a[0] && (!o || (a[1] > o[0] && a[1] < o[3]))) {
                  r.label = a[1];
                  break;
                }
                if (6 === a[0] && r.label < o[1]) {
                  ((r.label = o[1]), (o = a));
                  break;
                }
                if (o && r.label < o[2]) {
                  ((r.label = o[2]), r.ops.push(a));
                  break;
                }
                (o[2] && r.ops.pop(), r.trys.pop());
                continue;
            }
            a = t.call(e, r);
          } catch (e) {
            ((a = [6, e]), (i = 0));
          } finally {
            n = o = 0;
          }
        if (5 & a[0]) throw a[1];
        return { value: a[0] ? a[1] : void 0, done: !0 };
      })([a, c]);
    };
  }
}
function i(e) {
  var t = "function" == typeof Symbol && Symbol.iterator,
    n = t && e[t],
    i = 0;
  if (n) return n.call(e);
  if (e && "number" == typeof e.length)
    return {
      next: function () {
        return (
          e && i >= e.length && (e = void 0),
          { value: e && e[i++], done: !e }
        );
      },
    };
  throw new TypeError(
    t ? "Object is not iterable." : "Symbol.iterator is not defined."
  );
}
function o(e, t) {
  var n = "function" == typeof Symbol && e[Symbol.iterator];
  if (!n) return e;
  var i,
    o,
    r = n.call(e),
    s = [];
  try {
    for (; (void 0 === t || t-- > 0) && !(i = r.next()).done; ) s.push(i.value);
  } catch (e) {
    o = { error: e };
  } finally {
    try {
      i && !i.done && (n = r.return) && n.call(r);
    } finally {
      if (o) throw o.error;
    }
  }
  return s;
}
function r(e, t, n) {
  if (n || 2 === arguments.length)
    for (var i, o = 0, r = t.length; o < r; o++)
      (!i && o in t) ||
        (i || (i = Array.prototype.slice.call(t, 0, o)), (i[o] = t[o]));
  return e.concat(i || Array.prototype.slice.call(t));
}
function s(e) {
  for (
    var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), i = 1;
    i < t;
    i++
  )
    n[i - 1] = arguments[i];
  throw new Error(
    "number" == typeof e
      ? "[MobX] minified error nr: " +
          e +
          (n.length ? " " + n.map(String).join(",") : "") +
          ". Find the full error at: https://github.com/mobxjs/mobx/blob/main/packages/mobx/src/errors.ts"
      : "[MobX] " + e
  );
}
"function" == typeof SuppressedError && SuppressedError;
var a = {};
function c() {
  return "undefined" != typeof globalThis
    ? globalThis
    : "undefined" != typeof window
      ? window
      : "undefined" != typeof global
        ? global
        : "undefined" != typeof self
          ? self
          : a;
}
var u = Object.assign,
  l = Object.getOwnPropertyDescriptor,
  d = Object.defineProperty,
  h = Object.prototype,
  v = [];
Object.freeze(v);
var f = {};
Object.freeze(f);
var g = "undefined" != typeof Proxy,
  p = Object.toString();
function m() {
  g || s("Proxy not available");
}
function y(e) {
  var t = !1;
  return function () {
    if (!t) return ((t = !0), e.apply(this, arguments));
  };
}
var _ = function () {};
function b(e) {
  return "function" == typeof e;
}
function S(e) {
  switch (typeof e) {
    case "string":
    case "symbol":
    case "number":
      return !0;
  }
  return !1;
}
function M(e) {
  return null !== e && "object" == typeof e;
}
function A(e) {
  if (!M(e)) return !1;
  var t = Object.getPrototypeOf(e);
  if (null == t) return !0;
  var n = Object.hasOwnProperty.call(t, "constructor") && t.constructor;
  return "function" == typeof n && n.toString() === p;
}
function C(e) {
  var t = null == e ? void 0 : e.constructor;
  return (
    !!t &&
    ("GeneratorFunction" === t.name || "GeneratorFunction" === t.displayName)
  );
}
function I(e, t, n) {
  d(e, t, { enumerable: !1, writable: !0, configurable: !0, value: n });
}
function T(e, t, n) {
  d(e, t, { enumerable: !1, writable: !1, configurable: !0, value: n });
}
function w(e, t) {
  var n = "isMobX" + e;
  return (
    (t.prototype[n] = !0),
    function (e) {
      return M(e) && !0 === e[n];
    }
  );
}
function O(e) {
  return null != e && "[object Map]" === Object.prototype.toString.call(e);
}
function R(e) {
  return null != e && "[object Set]" === Object.prototype.toString.call(e);
}
var N = void 0 !== Object.getOwnPropertySymbols;
var L =
  "undefined" != typeof Reflect && Reflect.ownKeys
    ? Reflect.ownKeys
    : N
      ? function (e) {
          return Object.getOwnPropertyNames(e).concat(
            Object.getOwnPropertySymbols(e)
          );
        }
      : Object.getOwnPropertyNames;
function E(e) {
  return null === e ? null : "object" == typeof e ? "" + e : e;
}
function k(e, t) {
  return h.hasOwnProperty.call(e, t);
}
var V =
  Object.getOwnPropertyDescriptors ||
  function (e) {
    var t = {};
    return (
      L(e).forEach(function (n) {
        t[n] = l(e, n);
      }),
      t
    );
  };
function P(e, t) {
  return !!(e & t);
}
function U(e, t, n) {
  return (n ? (e |= t) : (e &= ~t), e);
}
function x(e, t) {
  (null == t || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function j(e, t) {
  for (var n = 0; n < t.length; n++) {
    var i = t[n];
    ((i.enumerable = i.enumerable || !1),
      (i.configurable = !0),
      "value" in i && (i.writable = !0),
      Object.defineProperty(e, q(i.key), i));
  }
}
function F(e, t, n) {
  return (
    t && j(e.prototype, t),
    n && j(e, n),
    Object.defineProperty(e, "prototype", { writable: !1 }),
    e
  );
}
function D(e, t) {
  var n =
    ("undefined" != typeof Symbol && e[Symbol.iterator]) || e["@@iterator"];
  if (n) return (n = n.call(e)).next.bind(n);
  if (
    Array.isArray(e) ||
    (n = (function (e, t) {
      if (e) {
        if ("string" == typeof e) return x(e, t);
        var n = {}.toString.call(e).slice(8, -1);
        return (
          "Object" === n && e.constructor && (n = e.constructor.name),
          "Map" === n || "Set" === n
            ? Array.from(e)
            : "Arguments" === n ||
                /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
              ? x(e, t)
              : void 0
        );
      }
    })(e)) ||
    (t && e && "number" == typeof e.length)
  ) {
    n && (e = n);
    var i = 0;
    return function () {
      return i >= e.length ? { done: !0 } : { done: !1, value: e[i++] };
    };
  }
  throw new TypeError(
    "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}
function B() {
  return (
    (B = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var i in n) ({}).hasOwnProperty.call(n, i) && (e[i] = n[i]);
          }
          return e;
        }),
    B.apply(null, arguments)
  );
}
function J(e, t) {
  ((e.prototype = Object.create(t.prototype)),
    (e.prototype.constructor = e),
    K(e, t));
}
function K(e, t) {
  return (
    (K = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (e, t) {
          return ((e.__proto__ = t), e);
        }),
    K(e, t)
  );
}
function q(e) {
  var t = (function (e, t) {
    if ("object" != typeof e || !e) return e;
    var n = e[Symbol.toPrimitive];
    if (void 0 !== n) {
      var i = n.call(e, t || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === t ? String : Number)(e);
  })(e, "string");
  return "symbol" == typeof t ? t : t + "";
}
var H = Symbol("mobx-stored-annotations");
function W(e) {
  return Object.assign(function (t, n) {
    if (z(n)) return e.decorate_20223_(t, n);
    G(t, n, e);
  }, e);
}
function G(e, t, n) {
  (k(e, H) || I(e, H, B({}, e[H])),
    (function (e) {
      return e.annotationType_ === ne;
    })(n) || (e[H][t] = n));
}
function z(e) {
  return "object" == typeof e && "string" == typeof e.kind;
}
var X = Symbol("mobx administration"),
  Q = (function () {
    function e(e) {
      (void 0 === e && (e = "Atom"),
        (this.name_ = void 0),
        (this.flags_ = 0),
        (this.observers_ = new Set()),
        (this.lastAccessedBy_ = 0),
        (this.lowestObserverState_ = et.NOT_TRACKING_),
        (this.onBOL = void 0),
        (this.onBUOL = void 0),
        (this.name_ = e));
    }
    var t = e.prototype;
    return (
      (t.onBO = function () {
        this.onBOL &&
          this.onBOL.forEach(function (e) {
            return e();
          });
      }),
      (t.onBUO = function () {
        this.onBUOL &&
          this.onBUOL.forEach(function (e) {
            return e();
          });
      }),
      (t.reportObserved = function () {
        return At(this);
      }),
      (t.reportChanged = function () {
        (St(), Ct(this), Mt());
      }),
      (t.toString = function () {
        return this.name_;
      }),
      F(e, [
        {
          key: "isBeingObserved",
          get: function () {
            return P(this.flags_, e.isBeingObservedMask_);
          },
          set: function (t) {
            this.flags_ = U(this.flags_, e.isBeingObservedMask_, t);
          },
        },
        {
          key: "isPendingUnobservation",
          get: function () {
            return P(this.flags_, e.isPendingUnobservationMask_);
          },
          set: function (t) {
            this.flags_ = U(this.flags_, e.isPendingUnobservationMask_, t);
          },
        },
        {
          key: "diffValue",
          get: function () {
            return P(this.flags_, e.diffValueMask_) ? 1 : 0;
          },
          set: function (t) {
            this.flags_ = U(this.flags_, e.diffValueMask_, 1 === t);
          },
        },
      ])
    );
  })();
((Q.isBeingObservedMask_ = 1),
  (Q.isPendingUnobservationMask_ = 2),
  (Q.diffValueMask_ = 4));
var Y = w("Atom", Q);
function $(e, t, n) {
  (void 0 === t && (t = _), void 0 === n && (n = _));
  var i,
    o = new Q(e);
  return (t !== _ && Qt(Gt, o, t, i), n !== _ && Xt(o, n), o);
}
var Z = {
  identity: function (e, t) {
    return e === t;
  },
  structural: function (e, t) {
    return fi(e, t);
  },
  default: function (e, t) {
    return Object.is
      ? Object.is(e, t)
      : e === t
        ? 0 !== e || 1 / e == 1 / t
        : e != e && t != t;
  },
  shallow: function (e, t) {
    return fi(e, t, 1);
  },
};
function ee(e, t, n) {
  return an(e)
    ? e
    : Array.isArray(e)
      ? je.array(e, { name: n })
      : A(e)
        ? je.object(e, void 0, { name: n })
        : O(e)
          ? je.map(e, { name: n })
          : R(e)
            ? je.set(e, { name: n })
            : "function" != typeof e || Jt(e) || sn(e)
              ? e
              : C(e)
                ? on(e)
                : Dt(n, e);
}
function te(e) {
  return e;
}
var ne = "override";
function ie(e, t) {
  return {
    annotationType_: e,
    options_: t,
    make_: oe,
    extend_: re,
    decorate_20223_: se,
  };
}
function oe(e, t, n, i) {
  var o;
  if (null != (o = this.options_) && o.bound)
    return null === this.extend_(e, t, n, !1) ? 0 : 1;
  if (i === e.target_) return null === this.extend_(e, t, n, !1) ? 0 : 2;
  if (Jt(n.value)) return 1;
  var r = ae(e, this, t, n, !1);
  return (d(i, t, r), 2);
}
function re(e, t, n, i) {
  var o = ae(e, this, t, n);
  return e.defineProperty_(t, o, i);
}
function se(e, t) {
  var n,
    i = t.kind,
    o = t.name,
    r = t.addInitializer,
    a = this,
    c = function (e) {
      var t, n, i, r;
      return Ge(
        null != (t = null == (n = a.options_) ? void 0 : n.name)
          ? t
          : o.toString(),
        e,
        null != (i = null == (r = a.options_) ? void 0 : r.autoAction) && i
      );
    };
  return "field" == i
    ? function (e) {
        var t,
          n = e;
        return (
          Jt(n) || (n = c(n)),
          null != (t = a.options_) &&
            t.bound &&
            ((n = n.bind(this)).isMobxAction = !0),
          n
        );
      }
    : "method" == i
      ? (Jt(e) || (e = c(e)),
        null != (n = this.options_) &&
          n.bound &&
          r(function () {
            var e = this,
              t = e[o].bind(e);
            ((t.isMobxAction = !0), (e[o] = t));
          }),
        e)
      : void s(
          "Cannot apply '" +
            a.annotationType_ +
            "' to '" +
            String(o) +
            "' (kind: " +
            i +
            "):\n'" +
            a.annotationType_ +
            "' can only be used on properties with a function value."
        );
}
function ae(e, t, n, i, o) {
  var r, s, a, c, u, l, d, h;
  (void 0 === o && (o = mt.safeDescriptors),
    (h = i),
    t.annotationType_,
    h.value);
  var v,
    f = i.value;
  null != (r = t.options_) &&
    r.bound &&
    (f = f.bind(null != (v = e.proxy_) ? v : e.target_));
  return {
    value: Ge(
      null != (s = null == (a = t.options_) ? void 0 : a.name)
        ? s
        : n.toString(),
      f,
      null != (c = null == (u = t.options_) ? void 0 : u.autoAction) && c,
      null != (l = t.options_) && l.bound
        ? null != (d = e.proxy_)
          ? d
          : e.target_
        : void 0
    ),
    configurable: !o || e.isPlainObject_,
    enumerable: !1,
    writable: !o,
  };
}
function ce(e, t) {
  return {
    annotationType_: e,
    options_: t,
    make_: ue,
    extend_: le,
    decorate_20223_: de,
  };
}
function ue(e, t, n, i) {
  var o;
  if (i === e.target_) return null === this.extend_(e, t, n, !1) ? 0 : 2;
  if (
    null != (o = this.options_) &&
    o.bound &&
    (!k(e.target_, t) || !sn(e.target_[t])) &&
    null === this.extend_(e, t, n, !1)
  )
    return 0;
  if (sn(n.value)) return 1;
  var r = he(e, this, t, n, !1, !1);
  return (d(i, t, r), 2);
}
function le(e, t, n, i) {
  var o,
    r = he(e, this, t, n, null == (o = this.options_) ? void 0 : o.bound);
  return e.defineProperty_(t, r, i);
}
function de(e, t) {
  var n,
    i = t.name,
    o = t.addInitializer;
  return (
    sn(e) || (e = on(e)),
    null != (n = this.options_) &&
      n.bound &&
      o(function () {
        var e = this,
          t = e[i].bind(e);
        ((t.isMobXFlow = !0), (e[i] = t));
      }),
    e
  );
}
function he(e, t, n, i, o, r) {
  var s;
  (void 0 === r && (r = mt.safeDescriptors),
    (s = i),
    t.annotationType_,
    s.value);
  var a,
    c = i.value;
  (sn(c) || (c = on(c)), o) &&
    ((c = c.bind(null != (a = e.proxy_) ? a : e.target_)).isMobXFlow = !0);
  return {
    value: c,
    configurable: !r || e.isPlainObject_,
    enumerable: !1,
    writable: !r,
  };
}
function ve(e, t) {
  return {
    annotationType_: e,
    options_: t,
    make_: fe,
    extend_: ge,
    decorate_20223_: pe,
  };
}
function fe(e, t, n) {
  return null === this.extend_(e, t, n, !1) ? 0 : 1;
}
function ge(e, t, n, i) {
  var o;
  return (
    (o = n),
    this.annotationType_,
    o.get,
    e.defineComputedProperty_(
      t,
      B({}, this.options_, { get: n.get, set: n.set }),
      i
    )
  );
}
function pe(e, t) {
  var n = this,
    i = t.name;
  return (
    (0, t.addInitializer)(function () {
      var t = Wn(this)[X],
        o = B({}, n.options_, { get: e, context: this });
      (o.name || (o.name = "ObservableObject." + i.toString()),
        t.values_.set(i, new Ze(o)));
    }),
    function () {
      return this[X].getObservablePropValue_(i);
    }
  );
}
function me(e, t) {
  return {
    annotationType_: e,
    options_: t,
    make_: ye,
    extend_: _e,
    decorate_20223_: be,
  };
}
function ye(e, t, n) {
  return null === this.extend_(e, t, n, !1) ? 0 : 1;
}
function _e(e, t, n, i) {
  var o, r;
  return (
    this.annotationType_,
    e.defineObservableProperty_(
      t,
      n.value,
      null != (o = null == (r = this.options_) ? void 0 : r.enhancer) ? o : ee,
      i
    )
  );
}
function be(e, t) {
  var n = this,
    i = t.kind,
    o = t.name,
    r = new WeakSet();
  function s(e, t) {
    var i,
      s,
      a = Wn(e)[X],
      c = new $e(
        t,
        null != (i = null == (s = n.options_) ? void 0 : s.enhancer) ? i : ee,
        "ObservableObject." + o.toString(),
        !1
      );
    (a.values_.set(o, c), r.add(e));
  }
  if ("accessor" == i)
    return {
      get: function () {
        return (
          r.has(this) || s(this, e.get.call(this)),
          this[X].getObservablePropValue_(o)
        );
      },
      set: function (e) {
        return (
          r.has(this) || s(this, e),
          this[X].setObservablePropValue_(o, e)
        );
      },
      init: function (e) {
        return (r.has(this) || s(this, e), e);
      },
    };
}
var Se = "true",
  Me = Ae();
function Ae(e) {
  return {
    annotationType_: Se,
    options_: e,
    make_: Ce,
    extend_: Ie,
    decorate_20223_: Te,
  };
}
function Ce(e, t, n, i) {
  var o, r, s, a;
  if (n.get) return Je.make_(e, t, n, i);
  if (n.set) {
    var c = Ge(t.toString(), n.set);
    return i === e.target_
      ? null ===
        e.defineProperty_(t, {
          configurable: !mt.safeDescriptors || e.isPlainObject_,
          set: c,
        })
        ? 0
        : 2
      : (d(i, t, { configurable: !0, set: c }), 2);
  }
  if (i !== e.target_ && "function" == typeof n.value)
    return C(n.value)
      ? (null != (a = this.options_) && a.autoBind ? on.bound : on).make_(
          e,
          t,
          n,
          i
        )
      : (null != (s = this.options_) && s.autoBind ? Dt.bound : Dt).make_(
          e,
          t,
          n,
          i
        );
  var u,
    l = !1 === (null == (o = this.options_) ? void 0 : o.deep) ? je.ref : je;
  "function" == typeof n.value &&
    null != (r = this.options_) &&
    r.autoBind &&
    (n.value = n.value.bind(null != (u = e.proxy_) ? u : e.target_));
  return l.make_(e, t, n, i);
}
function Ie(e, t, n, i) {
  var o, r, s;
  if (n.get) return Je.extend_(e, t, n, i);
  if (n.set)
    return e.defineProperty_(
      t,
      {
        configurable: !mt.safeDescriptors || e.isPlainObject_,
        set: Ge(t.toString(), n.set),
      },
      i
    );
  "function" == typeof n.value &&
    null != (o = this.options_) &&
    o.autoBind &&
    (n.value = n.value.bind(null != (s = e.proxy_) ? s : e.target_));
  return (
    !1 === (null == (r = this.options_) ? void 0 : r.deep) ? je.ref : je
  ).extend_(e, t, n, i);
}
function Te(e, t) {
  s("'" + this.annotationType_ + "' cannot be used as a decorator");
}
var we = { deep: !0, name: void 0, defaultDecorator: void 0, proxy: !0 };
function Oe(e) {
  return e || we;
}
Object.freeze(we);
var Re = me("observable"),
  Ne = me("observable.ref", { enhancer: te }),
  Le = me("observable.shallow", {
    enhancer: function (e, t, n) {
      return null == e || Xn(e) || En(e) || xn(e) || Bn(e)
        ? e
        : Array.isArray(e)
          ? je.array(e, { name: n, deep: !1 })
          : A(e)
            ? je.object(e, void 0, { name: n, deep: !1 })
            : O(e)
              ? je.map(e, { name: n, deep: !1 })
              : R(e)
                ? je.set(e, { name: n, deep: !1 })
                : void 0;
    },
  }),
  Ee = me("observable.struct", {
    enhancer: function (e, t) {
      return fi(e, t) ? t : e;
    },
  }),
  ke = W(Re);
function Ve(e) {
  return !0 === e.deep
    ? ee
    : !1 === e.deep
      ? te
      : (t = e.defaultDecorator) &&
          null != (n = null == (i = t.options_) ? void 0 : i.enhancer)
        ? n
        : ee;
  var t, n, i;
}
function Pe(e, t, n) {
  return z(t)
    ? Re.decorate_20223_(e, t)
    : S(t)
      ? void G(e, t, Re)
      : an(e)
        ? e
        : A(e)
          ? je.object(e, t, n)
          : Array.isArray(e)
            ? je.array(e, t)
            : O(e)
              ? je.map(e, t)
              : R(e)
                ? je.set(e, t)
                : "object" == typeof e && null !== e
                  ? e
                  : je.box(e, t);
}
u(Pe, ke);
var Ue,
  xe,
  je = u(Pe, {
    box: function (e, t) {
      var n = Oe(t);
      return new $e(e, Ve(n), n.name, !0, n.equals);
    },
    array: function (e, t) {
      var n = Oe(t);
      return (!1 === mt.useProxies || !1 === n.proxy ? ai : In)(
        e,
        Ve(n),
        n.name
      );
    },
    map: function (e, t) {
      var n = Oe(t);
      return new Un(e, Ve(n), n.name);
    },
    set: function (e, t) {
      var n = Oe(t);
      return new Dn(e, Ve(n), n.name);
    },
    object: function (e, t, n) {
      return di(function () {
        return $t(
          !1 === mt.useProxies || !1 === (null == n ? void 0 : n.proxy)
            ? Wn({}, n)
            : (function (e, t) {
                var n, i;
                return (
                  m(),
                  (e = Wn(e, t)),
                  null != (i = (n = e[X]).proxy_)
                    ? i
                    : (n.proxy_ = new Proxy(e, hn))
                );
              })({}, n),
          e,
          t
        );
      });
    },
    ref: W(Ne),
    shallow: W(Le),
    deep: ke,
    struct: W(Ee),
  }),
  Fe = "computed",
  De = ve(Fe),
  Be = ve("computed.struct", { equals: Z.structural }),
  Je = function (e, t) {
    if (z(t)) return De.decorate_20223_(e, t);
    if (S(t)) return G(e, t, De);
    if (A(e)) return W(ve(Fe, e));
    var n = A(t) ? t : {};
    return ((n.get = e), n.name || (n.name = e.name || ""), new Ze(n));
  };
(Object.assign(Je, De), (Je.struct = W(Be)));
var Ke = 0,
  qe = 1,
  He =
    null !=
      (Ue =
        null == (xe = l(function () {}, "name")) ? void 0 : xe.configurable) &&
    Ue,
  We = { value: "action", configurable: !0, writable: !1, enumerable: !1 };
function Ge(e, t, n, i) {
  function o() {
    return ze(e, n, t, i || this, arguments);
  }
  return (
    void 0 === n && (n = !1),
    (o.isMobxAction = !0),
    (o.toString = function () {
      return t.toString();
    }),
    He && ((We.value = e), d(o, "name", We)),
    o
  );
}
function ze(e, t, n, i, o) {
  var r = (function (e, t) {
    var n = !1,
      i = 0,
      o = mt.trackingDerivation,
      r = !t || !o;
    St();
    var s = mt.allowStateChanges;
    r && (ut(), (s = Qe(!0)));
    var a = dt(!0),
      c = {
        runAsAction_: r,
        prevDerivation_: o,
        prevAllowStateChanges_: s,
        prevAllowStateReads_: a,
        notifySpy_: n,
        startTime_: i,
        actionId_: qe++,
        parentActionId_: Ke,
      };
    return ((Ke = c.actionId_), c);
  })(0, t);
  try {
    return n.apply(i, o);
  } catch (e) {
    throw ((r.error_ = e), e);
  } finally {
    !(function (e) {
      Ke !== e.actionId_ && s(30);
      ((Ke = e.parentActionId_),
        void 0 !== e.error_ && (mt.suppressReactionErrors = !0));
      (Ye(e.prevAllowStateChanges_),
        ht(e.prevAllowStateReads_),
        Mt(),
        e.runAsAction_ && lt(e.prevDerivation_));
      mt.suppressReactionErrors = !1;
    })(r);
  }
}
function Xe(e, t) {
  var n = Qe(e);
  try {
    return t();
  } finally {
    Ye(n);
  }
}
function Qe(e) {
  var t = mt.allowStateChanges;
  return ((mt.allowStateChanges = e), t);
}
function Ye(e) {
  mt.allowStateChanges = e;
}
var $e = (function (e) {
    function t(t, n, i, o, r) {
      var s;
      return (
        void 0 === i && (i = "ObservableValue"),
        void 0 === r && (r = Z.default),
        ((s = e.call(this, i) || this).enhancer = void 0),
        (s.name_ = void 0),
        (s.equals = void 0),
        (s.hasUnreportedChange_ = !1),
        (s.interceptors_ = void 0),
        (s.changeListeners_ = void 0),
        (s.value_ = void 0),
        (s.dehancer = void 0),
        (s.enhancer = n),
        (s.name_ = i),
        (s.equals = r),
        (s.value_ = n(t, void 0, i)),
        s
      );
    }
    J(t, e);
    var n = t.prototype;
    return (
      (n.dehanceValue = function (e) {
        return void 0 !== this.dehancer ? this.dehancer(e) : e;
      }),
      (n.set = function (e) {
        (this.value_,
          (e = this.prepareNewValue_(e)) !== mt.UNCHANGED &&
            this.setNewValue_(e));
      }),
      (n.prepareNewValue_ = function (e) {
        if (vn(this)) {
          var t = gn(this, { object: this, type: Mn, newValue: e });
          if (!t) return mt.UNCHANGED;
          e = t.newValue;
        }
        return (
          (e = this.enhancer(e, this.value_, this.name_)),
          this.equals(this.value_, e) ? mt.UNCHANGED : e
        );
      }),
      (n.setNewValue_ = function (e) {
        var t = this.value_;
        ((this.value_ = e),
          this.reportChanged(),
          pn(this) &&
            yn(this, { type: Mn, object: this, newValue: e, oldValue: t }));
      }),
      (n.get = function () {
        return (this.reportObserved(), this.dehanceValue(this.value_));
      }),
      (n.intercept_ = function (e) {
        return fn(this, e);
      }),
      (n.observe_ = function (e, t) {
        return (
          t &&
            e({
              observableKind: "value",
              debugObjectName: this.name_,
              object: this,
              type: Mn,
              newValue: this.value_,
              oldValue: void 0,
            }),
          mn(this, e)
        );
      }),
      (n.raw = function () {
        return this.value_;
      }),
      (n.toJSON = function () {
        return this.get();
      }),
      (n.toString = function () {
        return this.name_ + "[" + this.value_ + "]";
      }),
      (n.valueOf = function () {
        return E(this.get());
      }),
      (n[Symbol.toPrimitive] = function () {
        return this.valueOf();
      }),
      t
    );
  })(Q),
  Ze = (function () {
    function e(e) {
      ((this.dependenciesState_ = et.NOT_TRACKING_),
        (this.observing_ = []),
        (this.newObserving_ = null),
        (this.observers_ = new Set()),
        (this.runId_ = 0),
        (this.lastAccessedBy_ = 0),
        (this.lowestObserverState_ = et.UP_TO_DATE_),
        (this.unboundDepsCount_ = 0),
        (this.value_ = new it(null)),
        (this.name_ = void 0),
        (this.triggeredBy_ = void 0),
        (this.flags_ = 0),
        (this.derivation = void 0),
        (this.setter_ = void 0),
        (this.isTracing_ = tt.NONE),
        (this.scope_ = void 0),
        (this.equals_ = void 0),
        (this.requiresReaction_ = void 0),
        (this.keepAlive_ = void 0),
        (this.onBOL = void 0),
        (this.onBUOL = void 0),
        e.get || s(31),
        (this.derivation = e.get),
        (this.name_ = e.name || "ComputedValue"),
        e.set && (this.setter_ = Ge("ComputedValue-setter", e.set)),
        (this.equals_ =
          e.equals ||
          (e.compareStructural || e.struct ? Z.structural : Z.default)),
        (this.scope_ = e.context),
        (this.requiresReaction_ = e.requiresReaction),
        (this.keepAlive_ = !!e.keepAlive));
    }
    var t = e.prototype;
    return (
      (t.onBecomeStale_ = function () {
        !(function (e) {
          if (e.lowestObserverState_ !== et.UP_TO_DATE_) return;
          ((e.lowestObserverState_ = et.POSSIBLY_STALE_),
            e.observers_.forEach(function (e) {
              e.dependenciesState_ === et.UP_TO_DATE_ &&
                ((e.dependenciesState_ = et.POSSIBLY_STALE_),
                e.onBecomeStale_());
            }));
        })(this);
      }),
      (t.onBO = function () {
        this.onBOL &&
          this.onBOL.forEach(function (e) {
            return e();
          });
      }),
      (t.onBUO = function () {
        this.onBUOL &&
          this.onBUOL.forEach(function (e) {
            return e();
          });
      }),
      (t.get = function () {
        if (
          (this.isComputing && s(32, this.name_, this.derivation),
          0 !== mt.inBatch || 0 !== this.observers_.size || this.keepAlive_)
        ) {
          if ((At(this), rt(this))) {
            var e = mt.trackingContext;
            (this.keepAlive_ && !e && (mt.trackingContext = this),
              this.trackAndCompute() &&
                (function (e) {
                  if (e.lowestObserverState_ === et.STALE_) return;
                  ((e.lowestObserverState_ = et.STALE_),
                    e.observers_.forEach(function (t) {
                      t.dependenciesState_ === et.POSSIBLY_STALE_
                        ? (t.dependenciesState_ = et.STALE_)
                        : t.dependenciesState_ === et.UP_TO_DATE_ &&
                          (e.lowestObserverState_ = et.UP_TO_DATE_);
                    }));
                })(this),
              (mt.trackingContext = e));
          }
        } else
          rt(this) &&
            (this.warnAboutUntrackedRead_(),
            St(),
            (this.value_ = this.computeValue_(!1)),
            Mt());
        var t = this.value_;
        if (ot(t)) throw t.cause;
        return t;
      }),
      (t.set = function (e) {
        if (this.setter_) {
          (this.isRunningSetter && s(33, this.name_),
            (this.isRunningSetter = !0));
          try {
            this.setter_.call(this.scope_, e);
          } finally {
            this.isRunningSetter = !1;
          }
        } else s(34, this.name_);
      }),
      (t.trackAndCompute = function () {
        var e = this.value_,
          t = this.dependenciesState_ === et.NOT_TRACKING_,
          n = this.computeValue_(!0),
          i = t || ot(e) || ot(n) || !this.equals_(e, n);
        return (i && (this.value_ = n), i);
      }),
      (t.computeValue_ = function (e) {
        this.isComputing = !0;
        var t,
          n = Qe(!1);
        if (e) t = st(this, this.derivation, this.scope_);
        else if (!0 === mt.disableErrorBoundaries)
          t = this.derivation.call(this.scope_);
        else
          try {
            t = this.derivation.call(this.scope_);
          } catch (e) {
            t = new it(e);
          }
        return (Ye(n), (this.isComputing = !1), t);
      }),
      (t.suspend_ = function () {
        this.keepAlive_ || (at(this), (this.value_ = void 0));
      }),
      (t.observe_ = function (e, t) {
        var n = this,
          i = !0,
          o = void 0;
        return Kt(function () {
          var r = n.get();
          if (!i || t) {
            var s = ut();
            (e({
              observableKind: "computed",
              debugObjectName: n.name_,
              type: Mn,
              object: n,
              newValue: r,
              oldValue: o,
            }),
              lt(s));
          }
          ((i = !1), (o = r));
        });
      }),
      (t.warnAboutUntrackedRead_ = function () {}),
      (t.toString = function () {
        return this.name_ + "[" + this.derivation.toString() + "]";
      }),
      (t.valueOf = function () {
        return E(this.get());
      }),
      (t[Symbol.toPrimitive] = function () {
        return this.valueOf();
      }),
      F(e, [
        {
          key: "isComputing",
          get: function () {
            return P(this.flags_, e.isComputingMask_);
          },
          set: function (t) {
            this.flags_ = U(this.flags_, e.isComputingMask_, t);
          },
        },
        {
          key: "isRunningSetter",
          get: function () {
            return P(this.flags_, e.isRunningSetterMask_);
          },
          set: function (t) {
            this.flags_ = U(this.flags_, e.isRunningSetterMask_, t);
          },
        },
        {
          key: "isBeingObserved",
          get: function () {
            return P(this.flags_, e.isBeingObservedMask_);
          },
          set: function (t) {
            this.flags_ = U(this.flags_, e.isBeingObservedMask_, t);
          },
        },
        {
          key: "isPendingUnobservation",
          get: function () {
            return P(this.flags_, e.isPendingUnobservationMask_);
          },
          set: function (t) {
            this.flags_ = U(this.flags_, e.isPendingUnobservationMask_, t);
          },
        },
        {
          key: "diffValue",
          get: function () {
            return P(this.flags_, e.diffValueMask_) ? 1 : 0;
          },
          set: function (t) {
            this.flags_ = U(this.flags_, e.diffValueMask_, 1 === t);
          },
        },
      ])
    );
  })();
((Ze.isComputingMask_ = 1),
  (Ze.isRunningSetterMask_ = 2),
  (Ze.isBeingObservedMask_ = 4),
  (Ze.isPendingUnobservationMask_ = 8),
  (Ze.diffValueMask_ = 16));
var et,
  tt,
  nt = w("ComputedValue", Ze);
(!(function (e) {
  ((e[(e.NOT_TRACKING_ = -1)] = "NOT_TRACKING_"),
    (e[(e.UP_TO_DATE_ = 0)] = "UP_TO_DATE_"),
    (e[(e.POSSIBLY_STALE_ = 1)] = "POSSIBLY_STALE_"),
    (e[(e.STALE_ = 2)] = "STALE_"));
})(et || (et = {})),
  (function (e) {
    ((e[(e.NONE = 0)] = "NONE"),
      (e[(e.LOG = 1)] = "LOG"),
      (e[(e.BREAK = 2)] = "BREAK"));
  })(tt || (tt = {})));
var it = function (e) {
  ((this.cause = void 0), (this.cause = e));
};
function ot(e) {
  return e instanceof it;
}
function rt(e) {
  switch (e.dependenciesState_) {
    case et.UP_TO_DATE_:
      return !1;
    case et.NOT_TRACKING_:
    case et.STALE_:
      return !0;
    case et.POSSIBLY_STALE_:
      for (
        var t = dt(!0), n = ut(), i = e.observing_, o = i.length, r = 0;
        r < o;
        r++
      ) {
        var s = i[r];
        if (nt(s)) {
          if (mt.disableErrorBoundaries) s.get();
          else
            try {
              s.get();
            } catch (e) {
              return (lt(n), ht(t), !0);
            }
          if (e.dependenciesState_ === et.STALE_) return (lt(n), ht(t), !0);
        }
      }
      return (vt(e), lt(n), ht(t), !1);
  }
}
function st(e, t, n) {
  var i = dt(!0);
  (vt(e),
    (e.newObserving_ = new Array(0 === e.runId_ ? 100 : e.observing_.length)),
    (e.unboundDepsCount_ = 0),
    (e.runId_ = ++mt.runId));
  var o,
    r = mt.trackingDerivation;
  if (
    ((mt.trackingDerivation = e),
    mt.inBatch++,
    !0 === mt.disableErrorBoundaries)
  )
    o = t.call(n);
  else
    try {
      o = t.call(n);
    } catch (e) {
      o = new it(e);
    }
  return (
    mt.inBatch--,
    (mt.trackingDerivation = r),
    (function (e) {
      for (
        var t = e.observing_,
          n = (e.observing_ = e.newObserving_),
          i = et.UP_TO_DATE_,
          o = 0,
          r = e.unboundDepsCount_,
          s = 0;
        s < r;
        s++
      ) {
        var a = n[s];
        (0 === a.diffValue && ((a.diffValue = 1), o !== s && (n[o] = a), o++),
          a.dependenciesState_ > i && (i = a.dependenciesState_));
      }
      ((n.length = o), (e.newObserving_ = null), (r = t.length));
      for (; r--; ) {
        var c = t[r];
        (0 === c.diffValue && _t(c, e), (c.diffValue = 0));
      }
      for (; o--; ) {
        var u = n[o];
        1 === u.diffValue && ((u.diffValue = 0), yt(u, e));
      }
      i !== et.UP_TO_DATE_ && ((e.dependenciesState_ = i), e.onBecomeStale_());
    })(e),
    ht(i),
    o
  );
}
function at(e) {
  var t = e.observing_;
  e.observing_ = [];
  for (var n = t.length; n--; ) _t(t[n], e);
  e.dependenciesState_ = et.NOT_TRACKING_;
}
function ct(e) {
  var t = ut();
  try {
    return e();
  } finally {
    lt(t);
  }
}
function ut() {
  var e = mt.trackingDerivation;
  return ((mt.trackingDerivation = null), e);
}
function lt(e) {
  mt.trackingDerivation = e;
}
function dt(e) {
  var t = mt.allowStateReads;
  return ((mt.allowStateReads = e), t);
}
function ht(e) {
  mt.allowStateReads = e;
}
function vt(e) {
  if (e.dependenciesState_ !== et.UP_TO_DATE_) {
    e.dependenciesState_ = et.UP_TO_DATE_;
    for (var t = e.observing_, n = t.length; n--; )
      t[n].lowestObserverState_ = et.UP_TO_DATE_;
  }
}
var ft = function () {
    ((this.version = 6),
      (this.UNCHANGED = {}),
      (this.trackingDerivation = null),
      (this.trackingContext = null),
      (this.runId = 0),
      (this.mobxGuid = 0),
      (this.inBatch = 0),
      (this.pendingUnobservations = []),
      (this.pendingReactions = []),
      (this.isRunningReactions = !1),
      (this.allowStateChanges = !1),
      (this.allowStateReads = !0),
      (this.enforceActions = !0),
      (this.spyListeners = []),
      (this.globalReactionErrorHandlers = []),
      (this.computedRequiresReaction = !1),
      (this.reactionRequiresObservable = !1),
      (this.observableRequiresReaction = !1),
      (this.disableErrorBoundaries = !1),
      (this.suppressReactionErrors = !1),
      (this.useProxies = !0),
      (this.verifyProxies = !1),
      (this.safeDescriptors = !0));
  },
  gt = !0,
  pt = !1,
  mt = (function () {
    var e = c();
    return (
      e.__mobxInstanceCount > 0 && !e.__mobxGlobals && (gt = !1),
      e.__mobxGlobals &&
        e.__mobxGlobals.version !== new ft().version &&
        (gt = !1),
      gt
        ? e.__mobxGlobals
          ? ((e.__mobxInstanceCount += 1),
            e.__mobxGlobals.UNCHANGED || (e.__mobxGlobals.UNCHANGED = {}),
            e.__mobxGlobals)
          : ((e.__mobxInstanceCount = 1), (e.__mobxGlobals = new ft()))
        : (setTimeout(function () {
            pt || s(35);
          }, 1),
          new ft())
    );
  })();
function yt(e, t) {
  (e.observers_.add(t),
    e.lowestObserverState_ > t.dependenciesState_ &&
      (e.lowestObserverState_ = t.dependenciesState_));
}
function _t(e, t) {
  (e.observers_.delete(t), 0 === e.observers_.size && bt(e));
}
function bt(e) {
  !1 === e.isPendingUnobservation &&
    ((e.isPendingUnobservation = !0), mt.pendingUnobservations.push(e));
}
function St() {
  mt.inBatch++;
}
function Mt() {
  if (0 === --mt.inBatch) {
    Ot();
    for (var e = mt.pendingUnobservations, t = 0; t < e.length; t++) {
      var n = e[t];
      ((n.isPendingUnobservation = !1),
        0 === n.observers_.size &&
          (n.isBeingObserved && ((n.isBeingObserved = !1), n.onBUO()),
          n instanceof Ze && n.suspend_()));
    }
    mt.pendingUnobservations = [];
  }
}
function At(e) {
  var t = mt.trackingDerivation;
  return null !== t
    ? (t.runId_ !== e.lastAccessedBy_ &&
        ((e.lastAccessedBy_ = t.runId_),
        (t.newObserving_[t.unboundDepsCount_++] = e),
        !e.isBeingObserved &&
          mt.trackingContext &&
          ((e.isBeingObserved = !0), e.onBO())),
      e.isBeingObserved)
    : (0 === e.observers_.size && mt.inBatch > 0 && bt(e), !1);
}
function Ct(e) {
  e.lowestObserverState_ !== et.STALE_ &&
    ((e.lowestObserverState_ = et.STALE_),
    e.observers_.forEach(function (e) {
      (e.dependenciesState_ === et.UP_TO_DATE_ && e.onBecomeStale_(),
        (e.dependenciesState_ = et.STALE_));
    }));
}
var It = (function () {
  function e(e, t, n, i) {
    (void 0 === e && (e = "Reaction"),
      (this.name_ = void 0),
      (this.onInvalidate_ = void 0),
      (this.errorHandler_ = void 0),
      (this.requiresObservable_ = void 0),
      (this.observing_ = []),
      (this.newObserving_ = []),
      (this.dependenciesState_ = et.NOT_TRACKING_),
      (this.runId_ = 0),
      (this.unboundDepsCount_ = 0),
      (this.flags_ = 0),
      (this.isTracing_ = tt.NONE),
      (this.name_ = e),
      (this.onInvalidate_ = t),
      (this.errorHandler_ = n),
      (this.requiresObservable_ = i));
  }
  var t = e.prototype;
  return (
    (t.onBecomeStale_ = function () {
      this.schedule_();
    }),
    (t.schedule_ = function () {
      this.isScheduled ||
        ((this.isScheduled = !0), mt.pendingReactions.push(this), Ot());
    }),
    (t.runReaction_ = function () {
      if (!this.isDisposed) {
        (St(), (this.isScheduled = !1));
        var e = mt.trackingContext;
        if (((mt.trackingContext = this), rt(this))) {
          this.isTrackPending = !0;
          try {
            this.onInvalidate_();
          } catch (e) {
            this.reportExceptionInDerivation_(e);
          }
        }
        ((mt.trackingContext = e), Mt());
      }
    }),
    (t.track = function (e) {
      if (!this.isDisposed) {
        (St(), (this.isRunning = !0));
        var t = mt.trackingContext;
        mt.trackingContext = this;
        var n = st(this, e, void 0);
        ((mt.trackingContext = t),
          (this.isRunning = !1),
          (this.isTrackPending = !1),
          this.isDisposed && at(this),
          ot(n) && this.reportExceptionInDerivation_(n.cause),
          Mt());
      }
    }),
    (t.reportExceptionInDerivation_ = function (e) {
      var t = this;
      if (this.errorHandler_) this.errorHandler_(e, this);
      else {
        if (mt.disableErrorBoundaries) throw e;
        var n = "[mobx] uncaught error in '" + this + "'";
        (mt.suppressReactionErrors || console.error(n, e),
          mt.globalReactionErrorHandlers.forEach(function (n) {
            return n(e, t);
          }));
      }
    }),
    (t.dispose = function () {
      this.isDisposed ||
        ((this.isDisposed = !0), this.isRunning || (St(), at(this), Mt()));
    }),
    (t.getDisposer_ = function (e) {
      var t = this,
        n = function n() {
          (t.dispose(),
            null == e ||
              null == e.removeEventListener ||
              e.removeEventListener("abort", n));
        };
      return (
        null == e ||
          null == e.addEventListener ||
          e.addEventListener("abort", n),
        (n[X] = this),
        n
      );
    }),
    (t.toString = function () {
      return "Reaction[" + this.name_ + "]";
    }),
    (t.trace = function (e) {}),
    F(e, [
      {
        key: "isDisposed",
        get: function () {
          return P(this.flags_, e.isDisposedMask_);
        },
        set: function (t) {
          this.flags_ = U(this.flags_, e.isDisposedMask_, t);
        },
      },
      {
        key: "isScheduled",
        get: function () {
          return P(this.flags_, e.isScheduledMask_);
        },
        set: function (t) {
          this.flags_ = U(this.flags_, e.isScheduledMask_, t);
        },
      },
      {
        key: "isTrackPending",
        get: function () {
          return P(this.flags_, e.isTrackPendingMask_);
        },
        set: function (t) {
          this.flags_ = U(this.flags_, e.isTrackPendingMask_, t);
        },
      },
      {
        key: "isRunning",
        get: function () {
          return P(this.flags_, e.isRunningMask_);
        },
        set: function (t) {
          this.flags_ = U(this.flags_, e.isRunningMask_, t);
        },
      },
      {
        key: "diffValue",
        get: function () {
          return P(this.flags_, e.diffValueMask_) ? 1 : 0;
        },
        set: function (t) {
          this.flags_ = U(this.flags_, e.diffValueMask_, 1 === t);
        },
      },
    ])
  );
})();
((It.isDisposedMask_ = 1),
  (It.isScheduledMask_ = 2),
  (It.isTrackPendingMask_ = 4),
  (It.isRunningMask_ = 8),
  (It.diffValueMask_ = 16));
var Tt = 100,
  wt = function (e) {
    return e();
  };
function Ot() {
  mt.inBatch > 0 || mt.isRunningReactions || wt(Rt);
}
function Rt() {
  mt.isRunningReactions = !0;
  for (var e = mt.pendingReactions, t = 0; e.length > 0; ) {
    ++t === Tt &&
      (console.error("[mobx] cycle in reaction: " + e[0]), e.splice(0));
    for (var n = e.splice(0), i = 0, o = n.length; i < o; i++)
      n[i].runReaction_();
  }
  mt.isRunningReactions = !1;
}
var Nt = w("Reaction", It);
var Lt = "action",
  Et = "autoAction",
  kt = "<unnamed action>",
  Vt = ie(Lt),
  Pt = ie("action.bound", { bound: !0 }),
  Ut = ie(Et, { autoAction: !0 }),
  xt = ie("autoAction.bound", { autoAction: !0, bound: !0 });
function jt(e) {
  return function (t, n) {
    return b(t)
      ? Ge(t.name || kt, t, e)
      : b(n)
        ? Ge(t, n, e)
        : z(n)
          ? (e ? Ut : Vt).decorate_20223_(t, n)
          : S(n)
            ? G(t, n, e ? Ut : Vt)
            : S(t)
              ? W(ie(e ? Et : Lt, { name: t, autoAction: e }))
              : void 0;
  };
}
var Ft = jt(!1);
Object.assign(Ft, Vt);
var Dt = jt(!0);
function Bt(e) {
  return ze(e.name, !1, e, this, void 0);
}
function Jt(e) {
  return b(e) && !0 === e.isMobxAction;
}
function Kt(e, t) {
  var n, i, o, r;
  void 0 === t && (t = f);
  var s,
    a = null != (n = null == (i = t) ? void 0 : i.name) ? n : "Autorun";
  if (!t.scheduler && !t.delay)
    s = new It(
      a,
      function () {
        this.track(l);
      },
      t.onError,
      t.requiresObservable
    );
  else {
    var c = Ht(t),
      u = !1;
    s = new It(
      a,
      function () {
        u ||
          ((u = !0),
          c(function () {
            ((u = !1), s.isDisposed || s.track(l));
          }));
      },
      t.onError,
      t.requiresObservable
    );
  }
  function l() {
    e(s);
  }
  return (
    (null != (o = t) && null != (o = o.signal) && o.aborted) || s.schedule_(),
    s.getDisposer_(null == (r = t) ? void 0 : r.signal)
  );
}
(Object.assign(Dt, Ut), (Ft.bound = W(Pt)), (Dt.bound = W(xt)));
var qt = function (e) {
  return e();
};
function Ht(e) {
  return e.scheduler
    ? e.scheduler
    : e.delay
      ? function (t) {
          return setTimeout(t, e.delay);
        }
      : qt;
}
function Wt(e, t, n) {
  var i, o, r;
  void 0 === n && (n = f);
  var s,
    a,
    c,
    u = null != (i = n.name) ? i : "Reaction",
    l = Ft(
      u,
      n.onError
        ? ((s = n.onError),
          (a = t),
          function () {
            try {
              return a.apply(this, arguments);
            } catch (e) {
              s.call(this, e);
            }
          })
        : t
    ),
    d = !n.scheduler && !n.delay,
    h = Ht(n),
    v = !0,
    g = !1,
    p = n.compareStructural ? Z.structural : n.equals || Z.default,
    m = new It(
      u,
      function () {
        v || d ? y() : g || ((g = !0), h(y));
      },
      n.onError,
      n.requiresObservable
    );
  function y() {
    if (((g = !1), !m.isDisposed)) {
      var t = !1,
        i = c;
      (m.track(function () {
        var n = Xe(!1, function () {
          return e(m);
        });
        ((t = v || !p(c, n)), (c = n));
      }),
        ((v && n.fireImmediately) || (!v && t)) && l(c, i, m),
        (v = !1));
    }
  }
  return (
    (null != (o = n) && null != (o = o.signal) && o.aborted) || m.schedule_(),
    m.getDisposer_(null == (r = n) ? void 0 : r.signal)
  );
}
var Gt = "onBO",
  zt = "onBUO";
function Xt(e, t, n) {
  return Qt(zt, e, t, n);
}
function Qt(e, t, n, i) {
  var o = "function" == typeof i ? ci(t, n) : ci(t),
    r = b(i) ? i : n,
    s = e + "L";
  return (
    o[s] ? o[s].add(r) : (o[s] = new Set([r])),
    function () {
      var e = o[s];
      e && (e.delete(r), 0 === e.size && delete o[s]);
    }
  );
}
var Yt = "always";
function $t(e, t, n, i) {
  var o = V(t);
  return (
    di(function () {
      var t = Wn(e, i)[X];
      L(o).forEach(function (e) {
        t.extend_(e, o[e], !n || !(e in n) || n[e]);
      });
    }),
    e
  );
}
var Zt = 0;
function en() {
  this.message = "FLOW_CANCELLED";
}
en.prototype = Object.create(Error.prototype);
var tn = ce("flow"),
  nn = ce("flow.bound", { bound: !0 }),
  on = Object.assign(function (e, t) {
    if (z(t)) return tn.decorate_20223_(e, t);
    if (S(t)) return G(e, t, tn);
    var n = e,
      i = n.name || "<unnamed flow>",
      o = function () {
        var e,
          t = arguments,
          o = ++Zt,
          r = Ft(i + " - runid: " + o + " - init", n).apply(this, t),
          s = void 0,
          a = new Promise(function (t, n) {
            var a = 0;
            function c(e) {
              var t;
              s = void 0;
              try {
                t = Ft(i + " - runid: " + o + " - yield " + a++, r.next).call(
                  r,
                  e
                );
              } catch (e) {
                return n(e);
              }
              l(t);
            }
            function u(e) {
              var t;
              s = void 0;
              try {
                t = Ft(i + " - runid: " + o + " - yield " + a++, r.throw).call(
                  r,
                  e
                );
              } catch (e) {
                return n(e);
              }
              l(t);
            }
            function l(e) {
              if (!b(null == e ? void 0 : e.then))
                return e.done
                  ? t(e.value)
                  : (s = Promise.resolve(e.value)).then(c, u);
              e.then(l, n);
            }
            ((e = n), c(void 0));
          });
        return (
          (a.cancel = Ft(i + " - runid: " + o + " - cancel", function () {
            try {
              s && rn(s);
              var t = r.return(void 0),
                n = Promise.resolve(t.value);
              (n.then(_, _), rn(n), e(new en()));
            } catch (t) {
              e(t);
            }
          })),
          a
        );
      };
    return ((o.isMobXFlow = !0), o);
  }, tn);
function rn(e) {
  b(e.cancel) && e.cancel();
}
function sn(e) {
  return !0 === (null == e ? void 0 : e.isMobXFlow);
}
function an(e) {
  return (function (e, t) {
    return (
      !!e &&
      (void 0 !== t
        ? !!Xn(e) && e[X].values_.has(t)
        : Xn(e) || !!e[X] || Y(e) || Nt(e) || nt(e))
    );
  })(e);
}
function cn(e, t) {
  (void 0 === t && (t = void 0), St());
  try {
    return e.apply(t);
  } finally {
    Mt();
  }
}
function un(e, t, n) {
  return 1 === arguments.length || (t && "object" == typeof t)
    ? (function (e, t) {
        var n, i, o;
        if (null != t && null != (n = t.signal) && n.aborted)
          return Object.assign(Promise.reject(new Error("WHEN_ABORTED")), {
            cancel: function () {
              return null;
            },
          });
        var r = new Promise(function (n, r) {
          var s,
            a = ln(e, n, B({}, t, { onError: r }));
          ((i = function () {
            (a(), r(new Error("WHEN_CANCELLED")));
          }),
            (o = function () {
              (a(), r(new Error("WHEN_ABORTED")));
            }),
            null == t ||
              null == (s = t.signal) ||
              null == s.addEventListener ||
              s.addEventListener("abort", o));
        }).finally(function () {
          var e;
          return null == t ||
            null == (e = t.signal) ||
            null == e.removeEventListener
            ? void 0
            : e.removeEventListener("abort", o);
        });
        return ((r.cancel = i), r);
      })(e, t)
    : ln(e, t, n || {});
}
function ln(e, t, n) {
  var i;
  if ("number" == typeof n.timeout) {
    var o = new Error("WHEN_TIMEOUT");
    i = setTimeout(function () {
      if (!s[X].isDisposed) {
        if ((s(), !n.onError)) throw o;
        n.onError(o);
      }
    }, n.timeout);
  }
  n.name = "When";
  var r = Ge("When-effect", t),
    s = Kt(function (t) {
      Xe(!1, e) && (t.dispose(), i && clearTimeout(i), r());
    }, n);
  return s;
}
function dn(e) {
  return e[X];
}
on.bound = W(nn);
var hn = {
  has: function (e, t) {
    return dn(e).has_(t);
  },
  get: function (e, t) {
    return dn(e).get_(t);
  },
  set: function (e, t, n) {
    var i;
    return !!S(t) && (null == (i = dn(e).set_(t, n, !0)) || i);
  },
  deleteProperty: function (e, t) {
    var n;
    return !!S(t) && (null == (n = dn(e).delete_(t, !0)) || n);
  },
  defineProperty: function (e, t, n) {
    var i;
    return null == (i = dn(e).defineProperty_(t, n)) || i;
  },
  ownKeys: function (e) {
    return dn(e).ownKeys_();
  },
  preventExtensions: function (e) {
    s(13);
  },
};
function vn(e) {
  return void 0 !== e.interceptors_ && e.interceptors_.length > 0;
}
function fn(e, t) {
  var n = e.interceptors_ || (e.interceptors_ = []);
  return (
    n.push(t),
    y(function () {
      var e = n.indexOf(t);
      -1 !== e && n.splice(e, 1);
    })
  );
}
function gn(e, t) {
  var n = ut();
  try {
    for (
      var i = [].concat(e.interceptors_ || []), o = 0, r = i.length;
      o < r && ((t = i[o](t)) && !t.type && s(14), t);
      o++
    );
    return t;
  } finally {
    lt(n);
  }
}
function pn(e) {
  return void 0 !== e.changeListeners_ && e.changeListeners_.length > 0;
}
function mn(e, t) {
  var n = e.changeListeners_ || (e.changeListeners_ = []);
  return (
    n.push(t),
    y(function () {
      var e = n.indexOf(t);
      -1 !== e && n.splice(e, 1);
    })
  );
}
function yn(e, t) {
  var n = ut(),
    i = e.changeListeners_;
  if (i) {
    for (var o = 0, r = (i = i.slice()).length; o < r; o++) i[o](t);
    lt(n);
  }
}
var _n = Symbol("mobx-keys");
function bn(e, t, n) {
  return A(e)
    ? $t(e, e, t, n)
    : (di(function () {
        var i = Wn(e, n)[X];
        if (!e[_n]) {
          var o = Object.getPrototypeOf(e),
            r = new Set([].concat(L(e), L(o)));
          (r.delete("constructor"), r.delete(X), I(o, _n, r));
        }
        e[_n].forEach(function (e) {
          return i.make_(e, !t || !(e in t) || t[e]);
        });
      }),
      e);
}
var Sn = "splice",
  Mn = "update",
  An = {
    get: function (e, t) {
      var n = e[X];
      return t === X
        ? n
        : "length" === t
          ? n.getArrayLength_()
          : "string" != typeof t || isNaN(t)
            ? k(Tn, t)
              ? Tn[t]
              : e[t]
            : n.get_(parseInt(t));
    },
    set: function (e, t, n) {
      var i = e[X];
      return (
        "length" === t && i.setArrayLength_(n),
        "symbol" == typeof t || isNaN(t) ? (e[t] = n) : i.set_(parseInt(t), n),
        !0
      );
    },
    preventExtensions: function () {
      s(15);
    },
  },
  Cn = (function () {
    function e(e, t, n, i) {
      (void 0 === e && (e = "ObservableArray"),
        (this.owned_ = void 0),
        (this.legacyMode_ = void 0),
        (this.atom_ = void 0),
        (this.values_ = []),
        (this.interceptors_ = void 0),
        (this.changeListeners_ = void 0),
        (this.enhancer_ = void 0),
        (this.dehancer = void 0),
        (this.proxy_ = void 0),
        (this.lastKnownLength_ = 0),
        (this.owned_ = n),
        (this.legacyMode_ = i),
        (this.atom_ = new Q(e)),
        (this.enhancer_ = function (e, n) {
          return t(e, n, "ObservableArray[..]");
        }));
    }
    var t = e.prototype;
    return (
      (t.dehanceValue_ = function (e) {
        return void 0 !== this.dehancer ? this.dehancer(e) : e;
      }),
      (t.dehanceValues_ = function (e) {
        return void 0 !== this.dehancer && e.length > 0
          ? e.map(this.dehancer)
          : e;
      }),
      (t.intercept_ = function (e) {
        return fn(this, e);
      }),
      (t.observe_ = function (e, t) {
        return (
          void 0 === t && (t = !1),
          t &&
            e({
              observableKind: "array",
              object: this.proxy_,
              debugObjectName: this.atom_.name_,
              type: "splice",
              index: 0,
              added: this.values_.slice(),
              addedCount: this.values_.length,
              removed: [],
              removedCount: 0,
            }),
          mn(this, e)
        );
      }),
      (t.getArrayLength_ = function () {
        return (this.atom_.reportObserved(), this.values_.length);
      }),
      (t.setArrayLength_ = function (e) {
        ("number" != typeof e || isNaN(e) || e < 0) && s("Out of range: " + e);
        var t = this.values_.length;
        if (e !== t)
          if (e > t) {
            for (var n = new Array(e - t), i = 0; i < e - t; i++) n[i] = void 0;
            this.spliceWithArray_(t, 0, n);
          } else this.spliceWithArray_(e, t - e);
      }),
      (t.updateArrayLength_ = function (e, t) {
        (e !== this.lastKnownLength_ && s(16),
          (this.lastKnownLength_ += t),
          this.legacyMode_ && t > 0 && si(e + t + 1));
      }),
      (t.spliceWithArray_ = function (e, t, n) {
        var i = this;
        this.atom_;
        var o = this.values_.length;
        if (
          (void 0 === e
            ? (e = 0)
            : e > o
              ? (e = o)
              : e < 0 && (e = Math.max(0, o + e)),
          (t =
            1 === arguments.length
              ? o - e
              : null == t
                ? 0
                : Math.max(0, Math.min(t, o - e))),
          void 0 === n && (n = v),
          vn(this))
        ) {
          var r = gn(this, {
            object: this.proxy_,
            type: Sn,
            index: e,
            removedCount: t,
            added: n,
          });
          if (!r) return v;
          ((t = r.removedCount), (n = r.added));
        }
        if (
          ((n =
            0 === n.length
              ? n
              : n.map(function (e) {
                  return i.enhancer_(e, void 0);
                })),
          this.legacyMode_)
        ) {
          var s = n.length - t;
          this.updateArrayLength_(o, s);
        }
        var a = this.spliceItemsIntoValues_(e, t, n);
        return (
          (0 === t && 0 === n.length) || this.notifyArraySplice_(e, n, a),
          this.dehanceValues_(a)
        );
      }),
      (t.spliceItemsIntoValues_ = function (e, t, n) {
        var i;
        if (n.length < 1e4)
          return (i = this.values_).splice.apply(i, [e, t].concat(n));
        var o = this.values_.slice(e, e + t),
          r = this.values_.slice(e + t);
        this.values_.length += n.length - t;
        for (var s = 0; s < n.length; s++) this.values_[e + s] = n[s];
        for (var a = 0; a < r.length; a++)
          this.values_[e + n.length + a] = r[a];
        return o;
      }),
      (t.notifyArrayChildUpdate_ = function (e, t, n) {
        var i = !this.owned_ && !1,
          o = pn(this),
          r =
            o || i
              ? {
                  observableKind: "array",
                  object: this.proxy_,
                  type: Mn,
                  debugObjectName: this.atom_.name_,
                  index: e,
                  newValue: t,
                  oldValue: n,
                }
              : null;
        (this.atom_.reportChanged(), o && yn(this, r));
      }),
      (t.notifyArraySplice_ = function (e, t, n) {
        var i = !this.owned_ && !1,
          o = pn(this),
          r =
            o || i
              ? {
                  observableKind: "array",
                  object: this.proxy_,
                  debugObjectName: this.atom_.name_,
                  type: Sn,
                  index: e,
                  removed: n,
                  added: t,
                  removedCount: n.length,
                  addedCount: t.length,
                }
              : null;
        (this.atom_.reportChanged(), o && yn(this, r));
      }),
      (t.get_ = function (e) {
        if (!(this.legacyMode_ && e >= this.values_.length))
          return (
            this.atom_.reportObserved(),
            this.dehanceValue_(this.values_[e])
          );
        console.warn("[mobx] Out of bounds read: " + e);
      }),
      (t.set_ = function (e, t) {
        var n = this.values_;
        if (
          (this.legacyMode_ && e > n.length && s(17, e, n.length), e < n.length)
        ) {
          this.atom_;
          var i = n[e];
          if (vn(this)) {
            var o = gn(this, {
              type: Mn,
              object: this.proxy_,
              index: e,
              newValue: t,
            });
            if (!o) return;
            t = o.newValue;
          }
          (t = this.enhancer_(t, i)) !== i &&
            ((n[e] = t), this.notifyArrayChildUpdate_(e, t, i));
        } else {
          for (
            var r = new Array(e + 1 - n.length), a = 0;
            a < r.length - 1;
            a++
          )
            r[a] = void 0;
          ((r[r.length - 1] = t), this.spliceWithArray_(n.length, 0, r));
        }
      }),
      e
    );
  })();
function In(e, t, n, i) {
  return (
    void 0 === n && (n = "ObservableArray"),
    void 0 === i && (i = !1),
    m(),
    di(function () {
      var o = new Cn(n, t, i, !1);
      T(o.values_, X, o);
      var r = new Proxy(o.values_, An);
      return ((o.proxy_ = r), e && e.length && o.spliceWithArray_(0, 0, e), r);
    })
  );
}
var Tn = {
  clear: function () {
    return this.splice(0);
  },
  replace: function (e) {
    var t = this[X];
    return t.spliceWithArray_(0, t.values_.length, e);
  },
  toJSON: function () {
    return this.slice();
  },
  splice: function (e, t) {
    for (
      var n = arguments.length, i = new Array(n > 2 ? n - 2 : 0), o = 2;
      o < n;
      o++
    )
      i[o - 2] = arguments[o];
    var r = this[X];
    switch (arguments.length) {
      case 0:
        return [];
      case 1:
        return r.spliceWithArray_(e);
      case 2:
        return r.spliceWithArray_(e, t);
    }
    return r.spliceWithArray_(e, t, i);
  },
  spliceWithArray: function (e, t, n) {
    return this[X].spliceWithArray_(e, t, n);
  },
  push: function () {
    for (
      var e = this[X], t = arguments.length, n = new Array(t), i = 0;
      i < t;
      i++
    )
      n[i] = arguments[i];
    return (e.spliceWithArray_(e.values_.length, 0, n), e.values_.length);
  },
  pop: function () {
    return this.splice(Math.max(this[X].values_.length - 1, 0), 1)[0];
  },
  shift: function () {
    return this.splice(0, 1)[0];
  },
  unshift: function () {
    for (
      var e = this[X], t = arguments.length, n = new Array(t), i = 0;
      i < t;
      i++
    )
      n[i] = arguments[i];
    return (e.spliceWithArray_(0, 0, n), e.values_.length);
  },
  reverse: function () {
    return (
      mt.trackingDerivation && s(37, "reverse"),
      this.replace(this.slice().reverse()),
      this
    );
  },
  sort: function () {
    mt.trackingDerivation && s(37, "sort");
    var e = this.slice();
    return (e.sort.apply(e, arguments), this.replace(e), this);
  },
  remove: function (e) {
    var t = this[X],
      n = t.dehanceValues_(t.values_).indexOf(e);
    return n > -1 && (this.splice(n, 1), !0);
  },
};
function wn(e, t) {
  "function" == typeof Array.prototype[e] && (Tn[e] = t(e));
}
function On(e) {
  return function () {
    var t = this[X];
    t.atom_.reportObserved();
    var n = t.dehanceValues_(t.values_);
    return n[e].apply(n, arguments);
  };
}
function Rn(e) {
  return function (t, n) {
    var i = this,
      o = this[X];
    return (
      o.atom_.reportObserved(),
      o.dehanceValues_(o.values_)[e](function (e, o) {
        return t.call(n, e, o, i);
      })
    );
  };
}
function Nn(e) {
  return function () {
    var t = this,
      n = this[X];
    n.atom_.reportObserved();
    var i = n.dehanceValues_(n.values_),
      o = arguments[0];
    return (
      (arguments[0] = function (e, n, i) {
        return o(e, n, i, t);
      }),
      i[e].apply(i, arguments)
    );
  };
}
(wn("at", On),
  wn("concat", On),
  wn("flat", On),
  wn("includes", On),
  wn("indexOf", On),
  wn("join", On),
  wn("lastIndexOf", On),
  wn("slice", On),
  wn("toString", On),
  wn("toLocaleString", On),
  wn("toSorted", On),
  wn("toSpliced", On),
  wn("with", On),
  wn("every", Rn),
  wn("filter", Rn),
  wn("find", Rn),
  wn("findIndex", Rn),
  wn("findLast", Rn),
  wn("findLastIndex", Rn),
  wn("flatMap", Rn),
  wn("forEach", Rn),
  wn("map", Rn),
  wn("some", Rn),
  wn("toReversed", Rn),
  wn("reduce", Nn),
  wn("reduceRight", Nn));
var Ln = w("ObservableArrayAdministration", Cn);
function En(e) {
  return M(e) && Ln(e[X]);
}
var kn = {},
  Vn = "add",
  Pn = "delete",
  Un = (function () {
    function e(e, t, n) {
      var i = this;
      (void 0 === t && (t = ee),
        void 0 === n && (n = "ObservableMap"),
        (this.enhancer_ = void 0),
        (this.name_ = void 0),
        (this[X] = kn),
        (this.data_ = void 0),
        (this.hasMap_ = void 0),
        (this.keysAtom_ = void 0),
        (this.interceptors_ = void 0),
        (this.changeListeners_ = void 0),
        (this.dehancer = void 0),
        (this.enhancer_ = t),
        (this.name_ = n),
        b(Map) || s(18),
        di(function () {
          ((i.keysAtom_ = $("ObservableMap.keys()")),
            (i.data_ = new Map()),
            (i.hasMap_ = new Map()),
            e && i.merge(e));
        }));
    }
    var t = e.prototype;
    return (
      (t.has_ = function (e) {
        return this.data_.has(e);
      }),
      (t.has = function (e) {
        var t = this;
        if (!mt.trackingDerivation) return this.has_(e);
        var n = this.hasMap_.get(e);
        if (!n) {
          var i = (n = new $e(this.has_(e), te, "ObservableMap.key?", !1));
          (this.hasMap_.set(e, i),
            Xt(i, function () {
              return t.hasMap_.delete(e);
            }));
        }
        return n.get();
      }),
      (t.set = function (e, t) {
        var n = this.has_(e);
        if (vn(this)) {
          var i = gn(this, {
            type: n ? Mn : Vn,
            object: this,
            newValue: t,
            name: e,
          });
          if (!i) return this;
          t = i.newValue;
        }
        return (n ? this.updateValue_(e, t) : this.addValue_(e, t), this);
      }),
      (t.delete = function (e) {
        var t = this;
        if (
          (this.keysAtom_, vn(this)) &&
          !gn(this, { type: Pn, object: this, name: e })
        )
          return !1;
        if (this.has_(e)) {
          var n = pn(this),
            i = n
              ? {
                  observableKind: "map",
                  debugObjectName: this.name_,
                  type: Pn,
                  object: this,
                  oldValue: this.data_.get(e).value_,
                  name: e,
                }
              : null;
          return (
            cn(function () {
              var n;
              (t.keysAtom_.reportChanged(),
                null == (n = t.hasMap_.get(e)) || n.setNewValue_(!1),
                t.data_.get(e).setNewValue_(void 0),
                t.data_.delete(e));
            }),
            n && yn(this, i),
            !0
          );
        }
        return !1;
      }),
      (t.updateValue_ = function (e, t) {
        var n = this.data_.get(e);
        if ((t = n.prepareNewValue_(t)) !== mt.UNCHANGED) {
          var i = pn(this),
            o = i
              ? {
                  observableKind: "map",
                  debugObjectName: this.name_,
                  type: Mn,
                  object: this,
                  oldValue: n.value_,
                  name: e,
                  newValue: t,
                }
              : null;
          (n.setNewValue_(t), i && yn(this, o));
        }
      }),
      (t.addValue_ = function (e, t) {
        var n = this;
        (this.keysAtom_,
          cn(function () {
            var i,
              o = new $e(t, n.enhancer_, "ObservableMap.key", !1);
            (n.data_.set(e, o),
              (t = o.value_),
              null == (i = n.hasMap_.get(e)) || i.setNewValue_(!0),
              n.keysAtom_.reportChanged());
          }));
        var i = pn(this),
          o = i
            ? {
                observableKind: "map",
                debugObjectName: this.name_,
                type: Vn,
                object: this,
                name: e,
                newValue: t,
              }
            : null;
        i && yn(this, o);
      }),
      (t.get = function (e) {
        return this.has(e)
          ? this.dehanceValue_(this.data_.get(e).get())
          : this.dehanceValue_(void 0);
      }),
      (t.dehanceValue_ = function (e) {
        return void 0 !== this.dehancer ? this.dehancer(e) : e;
      }),
      (t.keys = function () {
        return (this.keysAtom_.reportObserved(), this.data_.keys());
      }),
      (t.values = function () {
        var e = this,
          t = this.keys();
        return jn({
          next: function () {
            var n = t.next(),
              i = n.done,
              o = n.value;
            return { done: i, value: i ? void 0 : e.get(o) };
          },
        });
      }),
      (t.entries = function () {
        var e = this,
          t = this.keys();
        return jn({
          next: function () {
            var n = t.next(),
              i = n.done,
              o = n.value;
            return { done: i, value: i ? void 0 : [o, e.get(o)] };
          },
        });
      }),
      (t[Symbol.iterator] = function () {
        return this.entries();
      }),
      (t.forEach = function (e, t) {
        for (var n, i = D(this); !(n = i()).done; ) {
          var o = n.value,
            r = o[0],
            s = o[1];
          e.call(t, s, r, this);
        }
      }),
      (t.merge = function (e) {
        var t = this;
        return (
          xn(e) && (e = new Map(e)),
          cn(function () {
            var n, i, o;
            A(e)
              ? (function (e) {
                  var t = Object.keys(e);
                  if (!N) return t;
                  var n = Object.getOwnPropertySymbols(e);
                  return n.length
                    ? [].concat(
                        t,
                        n.filter(function (t) {
                          return h.propertyIsEnumerable.call(e, t);
                        })
                      )
                    : t;
                })(e).forEach(function (n) {
                  return t.set(n, e[n]);
                })
              : Array.isArray(e)
                ? e.forEach(function (e) {
                    var n = e[0],
                      i = e[1];
                    return t.set(n, i);
                  })
                : O(e)
                  ? ((n = e),
                    (i = Object.getPrototypeOf(n)),
                    (o = Object.getPrototypeOf(i)),
                    null !== Object.getPrototypeOf(o) && s(19, e),
                    e.forEach(function (e, n) {
                      return t.set(n, e);
                    }))
                  : null != e && s(20, e);
          }),
          this
        );
      }),
      (t.clear = function () {
        var e = this;
        cn(function () {
          ct(function () {
            for (var t, n = D(e.keys()); !(t = n()).done; ) {
              var i = t.value;
              e.delete(i);
            }
          });
        });
      }),
      (t.replace = function (e) {
        var t = this;
        return (
          cn(function () {
            for (
              var n,
                i = (function (e) {
                  if (O(e) || xn(e)) return e;
                  if (Array.isArray(e)) return new Map(e);
                  if (A(e)) {
                    var t = new Map();
                    for (var n in e) t.set(n, e[n]);
                    return t;
                  }
                  return s(21, e);
                })(e),
                o = new Map(),
                r = !1,
                a = D(t.data_.keys());
              !(n = a()).done;
            ) {
              var c = n.value;
              if (!i.has(c))
                if (t.delete(c)) r = !0;
                else {
                  var u = t.data_.get(c);
                  o.set(c, u);
                }
            }
            for (var l, d = D(i.entries()); !(l = d()).done; ) {
              var h = l.value,
                v = h[0],
                f = h[1],
                g = t.data_.has(v);
              if ((t.set(v, f), t.data_.has(v))) {
                var p = t.data_.get(v);
                (o.set(v, p), g || (r = !0));
              }
            }
            if (!r)
              if (t.data_.size !== o.size) t.keysAtom_.reportChanged();
              else
                for (
                  var m = t.data_.keys(),
                    y = o.keys(),
                    _ = m.next(),
                    b = y.next();
                  !_.done;
                ) {
                  if (_.value !== b.value) {
                    t.keysAtom_.reportChanged();
                    break;
                  }
                  ((_ = m.next()), (b = y.next()));
                }
            t.data_ = o;
          }),
          this
        );
      }),
      (t.toString = function () {
        return "[object ObservableMap]";
      }),
      (t.toJSON = function () {
        return Array.from(this);
      }),
      (t.observe_ = function (e, t) {
        return mn(this, e);
      }),
      (t.intercept_ = function (e) {
        return fn(this, e);
      }),
      F(e, [
        {
          key: "size",
          get: function () {
            return (this.keysAtom_.reportObserved(), this.data_.size);
          },
        },
        {
          key: Symbol.toStringTag,
          get: function () {
            return "Map";
          },
        },
      ])
    );
  })(),
  xn = w("ObservableMap", Un);
function jn(e) {
  return ((e[Symbol.toStringTag] = "MapIterator"), yi(e));
}
var Fn = {},
  Dn = (function () {
    function e(e, t, n) {
      var i = this;
      (void 0 === t && (t = ee),
        void 0 === n && (n = "ObservableSet"),
        (this.name_ = void 0),
        (this[X] = Fn),
        (this.data_ = new Set()),
        (this.atom_ = void 0),
        (this.changeListeners_ = void 0),
        (this.interceptors_ = void 0),
        (this.dehancer = void 0),
        (this.enhancer_ = void 0),
        (this.name_ = n),
        b(Set) || s(22),
        (this.enhancer_ = function (e, i) {
          return t(e, i, n);
        }),
        di(function () {
          ((i.atom_ = $(i.name_)), e && i.replace(e));
        }));
    }
    var t = e.prototype;
    return (
      (t.dehanceValue_ = function (e) {
        return void 0 !== this.dehancer ? this.dehancer(e) : e;
      }),
      (t.clear = function () {
        var e = this;
        cn(function () {
          ct(function () {
            for (var t, n = D(e.data_.values()); !(t = n()).done; ) {
              var i = t.value;
              e.delete(i);
            }
          });
        });
      }),
      (t.forEach = function (e, t) {
        for (var n, i = D(this); !(n = i()).done; ) {
          var o = n.value;
          e.call(t, o, o, this);
        }
      }),
      (t.add = function (e) {
        var t = this;
        if ((this.atom_, vn(this))) {
          var n = gn(this, { type: Vn, object: this, newValue: e });
          if (!n) return this;
          e = n.newValue;
        }
        if (!this.has(e)) {
          cn(function () {
            (t.data_.add(t.enhancer_(e, void 0)), t.atom_.reportChanged());
          });
          var i = pn(this),
            o = i
              ? {
                  observableKind: "set",
                  debugObjectName: this.name_,
                  type: Vn,
                  object: this,
                  newValue: e,
                }
              : null;
          i && yn(this, o);
        }
        return this;
      }),
      (t.delete = function (e) {
        var t = this;
        if (vn(this) && !gn(this, { type: Pn, object: this, oldValue: e }))
          return !1;
        if (this.has(e)) {
          var n = pn(this),
            i = n
              ? {
                  observableKind: "set",
                  debugObjectName: this.name_,
                  type: Pn,
                  object: this,
                  oldValue: e,
                }
              : null;
          return (
            cn(function () {
              (t.atom_.reportChanged(), t.data_.delete(e));
            }),
            n && yn(this, i),
            !0
          );
        }
        return !1;
      }),
      (t.has = function (e) {
        return (
          this.atom_.reportObserved(),
          this.data_.has(this.dehanceValue_(e))
        );
      }),
      (t.entries = function () {
        var e = this.values();
        return Jn({
          next: function () {
            var t = e.next(),
              n = t.value,
              i = t.done;
            return i ? { value: void 0, done: i } : { value: [n, n], done: i };
          },
        });
      }),
      (t.keys = function () {
        return this.values();
      }),
      (t.values = function () {
        this.atom_.reportObserved();
        var e = this,
          t = this.data_.values();
        return Jn({
          next: function () {
            var n = t.next(),
              i = n.value,
              o = n.done;
            return o
              ? { value: void 0, done: o }
              : { value: e.dehanceValue_(i), done: o };
          },
        });
      }),
      (t.intersection = function (e) {
        return R(e) && !Bn(e)
          ? e.intersection(this)
          : new Set(this).intersection(e);
      }),
      (t.union = function (e) {
        return R(e) && !Bn(e) ? e.union(this) : new Set(this).union(e);
      }),
      (t.difference = function (e) {
        return new Set(this).difference(e);
      }),
      (t.symmetricDifference = function (e) {
        return R(e) && !Bn(e)
          ? e.symmetricDifference(this)
          : new Set(this).symmetricDifference(e);
      }),
      (t.isSubsetOf = function (e) {
        return new Set(this).isSubsetOf(e);
      }),
      (t.isSupersetOf = function (e) {
        return new Set(this).isSupersetOf(e);
      }),
      (t.isDisjointFrom = function (e) {
        return R(e) && !Bn(e)
          ? e.isDisjointFrom(this)
          : new Set(this).isDisjointFrom(e);
      }),
      (t.replace = function (e) {
        var t = this;
        return (
          Bn(e) && (e = new Set(e)),
          cn(function () {
            Array.isArray(e) || R(e)
              ? (t.clear(),
                e.forEach(function (e) {
                  return t.add(e);
                }))
              : null != e && s("Cannot initialize set from " + e);
          }),
          this
        );
      }),
      (t.observe_ = function (e, t) {
        return mn(this, e);
      }),
      (t.intercept_ = function (e) {
        return fn(this, e);
      }),
      (t.toJSON = function () {
        return Array.from(this);
      }),
      (t.toString = function () {
        return "[object ObservableSet]";
      }),
      (t[Symbol.iterator] = function () {
        return this.values();
      }),
      F(e, [
        {
          key: "size",
          get: function () {
            return (this.atom_.reportObserved(), this.data_.size);
          },
        },
        {
          key: Symbol.toStringTag,
          get: function () {
            return "Set";
          },
        },
      ])
    );
  })(),
  Bn = w("ObservableSet", Dn);
function Jn(e) {
  return ((e[Symbol.toStringTag] = "SetIterator"), yi(e));
}
var Kn = Object.create(null),
  qn = "remove",
  Hn = (function () {
    function e(e, t, n, i) {
      (void 0 === t && (t = new Map()),
        void 0 === i && (i = Me),
        (this.target_ = void 0),
        (this.values_ = void 0),
        (this.name_ = void 0),
        (this.defaultAnnotation_ = void 0),
        (this.keysAtom_ = void 0),
        (this.changeListeners_ = void 0),
        (this.interceptors_ = void 0),
        (this.proxy_ = void 0),
        (this.isPlainObject_ = void 0),
        (this.appliedAnnotations_ = void 0),
        (this.pendingKeys_ = void 0),
        (this.target_ = e),
        (this.values_ = t),
        (this.name_ = n),
        (this.defaultAnnotation_ = i),
        (this.keysAtom_ = new Q("ObservableObject.keys")),
        (this.isPlainObject_ = A(this.target_)));
    }
    var t = e.prototype;
    return (
      (t.getObservablePropValue_ = function (e) {
        return this.values_.get(e).get();
      }),
      (t.setObservablePropValue_ = function (e, t) {
        var n = this.values_.get(e);
        if (n instanceof Ze) return (n.set(t), !0);
        if (vn(this)) {
          var i = gn(this, {
            type: Mn,
            object: this.proxy_ || this.target_,
            name: e,
            newValue: t,
          });
          if (!i) return null;
          t = i.newValue;
        }
        if ((t = n.prepareNewValue_(t)) !== mt.UNCHANGED) {
          var o = pn(this),
            r = o
              ? {
                  type: Mn,
                  observableKind: "object",
                  debugObjectName: this.name_,
                  object: this.proxy_ || this.target_,
                  oldValue: n.value_,
                  name: e,
                  newValue: t,
                }
              : null;
          (n.setNewValue_(t), o && yn(this, r));
        }
        return !0;
      }),
      (t.get_ = function (e) {
        return (
          mt.trackingDerivation && !k(this.target_, e) && this.has_(e),
          this.target_[e]
        );
      }),
      (t.set_ = function (e, t, n) {
        return (
          void 0 === n && (n = !1),
          k(this.target_, e)
            ? this.values_.has(e)
              ? this.setObservablePropValue_(e, t)
              : n
                ? Reflect.set(this.target_, e, t)
                : ((this.target_[e] = t), !0)
            : this.extend_(
                e,
                { value: t, enumerable: !0, writable: !0, configurable: !0 },
                this.defaultAnnotation_,
                n
              )
        );
      }),
      (t.has_ = function (e) {
        if (!mt.trackingDerivation) return e in this.target_;
        this.pendingKeys_ || (this.pendingKeys_ = new Map());
        var t = this.pendingKeys_.get(e);
        return (
          t ||
            ((t = new $e(e in this.target_, te, "ObservableObject.key?", !1)),
            this.pendingKeys_.set(e, t)),
          t.get()
        );
      }),
      (t.make_ = function (e, t) {
        if ((!0 === t && (t = this.defaultAnnotation_), !1 !== t)) {
          if (!(e in this.target_)) {
            var n;
            if (null != (n = this.target_[H]) && n[e]) return;
            s(1, t.annotationType_, this.name_ + "." + e.toString());
          }
          for (var i = this.target_; i && i !== h; ) {
            var o = l(i, e);
            if (o) {
              var r = t.make_(this, e, o, i);
              if (0 === r) return;
              if (1 === r) break;
            }
            i = Object.getPrototypeOf(i);
          }
          Qn(this, t, e);
        }
      }),
      (t.extend_ = function (e, t, n, i) {
        if (
          (void 0 === i && (i = !1),
          !0 === n && (n = this.defaultAnnotation_),
          !1 === n)
        )
          return this.defineProperty_(e, t, i);
        var o = n.extend_(this, e, t, i);
        return (o && Qn(this, n, e), o);
      }),
      (t.defineProperty_ = function (e, t, n) {
        (void 0 === n && (n = !1), this.keysAtom_);
        try {
          St();
          var i = this.delete_(e);
          if (!i) return i;
          if (vn(this)) {
            var o = gn(this, {
              object: this.proxy_ || this.target_,
              name: e,
              type: Vn,
              newValue: t.value,
            });
            if (!o) return null;
            var r = o.newValue;
            t.value !== r && (t = B({}, t, { value: r }));
          }
          if (n) {
            if (!Reflect.defineProperty(this.target_, e, t)) return !1;
          } else d(this.target_, e, t);
          this.notifyPropertyAddition_(e, t.value);
        } finally {
          Mt();
        }
        return !0;
      }),
      (t.defineObservableProperty_ = function (e, t, n, i) {
        (void 0 === i && (i = !1), this.keysAtom_);
        try {
          St();
          var o = this.delete_(e);
          if (!o) return o;
          if (vn(this)) {
            var r = gn(this, {
              object: this.proxy_ || this.target_,
              name: e,
              type: Vn,
              newValue: t,
            });
            if (!r) return null;
            t = r.newValue;
          }
          var s = zn(e),
            a = {
              configurable: !mt.safeDescriptors || this.isPlainObject_,
              enumerable: !0,
              get: s.get,
              set: s.set,
            };
          if (i) {
            if (!Reflect.defineProperty(this.target_, e, a)) return !1;
          } else d(this.target_, e, a);
          var c = new $e(t, n, "ObservableObject.key", !1);
          (this.values_.set(e, c), this.notifyPropertyAddition_(e, c.value_));
        } finally {
          Mt();
        }
        return !0;
      }),
      (t.defineComputedProperty_ = function (e, t, n) {
        (void 0 === n && (n = !1), this.keysAtom_);
        try {
          St();
          var i = this.delete_(e);
          if (!i) return i;
          if (vn(this))
            if (
              !gn(this, {
                object: this.proxy_ || this.target_,
                name: e,
                type: Vn,
                newValue: void 0,
              })
            )
              return null;
          (t.name || (t.name = "ObservableObject.key"),
            (t.context = this.proxy_ || this.target_));
          var o = zn(e),
            r = {
              configurable: !mt.safeDescriptors || this.isPlainObject_,
              enumerable: !1,
              get: o.get,
              set: o.set,
            };
          if (n) {
            if (!Reflect.defineProperty(this.target_, e, r)) return !1;
          } else d(this.target_, e, r);
          (this.values_.set(e, new Ze(t)),
            this.notifyPropertyAddition_(e, void 0));
        } finally {
          Mt();
        }
        return !0;
      }),
      (t.delete_ = function (e, t) {
        if ((void 0 === t && (t = !1), this.keysAtom_, !k(this.target_, e)))
          return !0;
        if (
          vn(this) &&
          !gn(this, { object: this.proxy_ || this.target_, name: e, type: qn })
        )
          return null;
        try {
          var n;
          St();
          var i,
            o = pn(this),
            r = this.values_.get(e),
            s = void 0;
          if (!r && o) s = null == (i = l(this.target_, e)) ? void 0 : i.value;
          if (t) {
            if (!Reflect.deleteProperty(this.target_, e)) return !1;
          } else delete this.target_[e];
          if (
            (r &&
              (this.values_.delete(e),
              r instanceof $e && (s = r.value_),
              Ct(r)),
            this.keysAtom_.reportChanged(),
            null == (n = this.pendingKeys_) ||
              null == (n = n.get(e)) ||
              n.set(e in this.target_),
            o)
          ) {
            var a = {
              type: qn,
              observableKind: "object",
              object: this.proxy_ || this.target_,
              debugObjectName: this.name_,
              oldValue: s,
              name: e,
            };
            (0, o && yn(this, a));
          }
        } finally {
          Mt();
        }
        return !0;
      }),
      (t.observe_ = function (e, t) {
        return mn(this, e);
      }),
      (t.intercept_ = function (e) {
        return fn(this, e);
      }),
      (t.notifyPropertyAddition_ = function (e, t) {
        var n,
          i = pn(this);
        if (i) {
          var o = i
            ? {
                type: Vn,
                observableKind: "object",
                debugObjectName: this.name_,
                object: this.proxy_ || this.target_,
                name: e,
                newValue: t,
              }
            : null;
          i && yn(this, o);
        }
        (null == (n = this.pendingKeys_) || null == (n = n.get(e)) || n.set(!0),
          this.keysAtom_.reportChanged());
      }),
      (t.ownKeys_ = function () {
        return (this.keysAtom_.reportObserved(), L(this.target_));
      }),
      (t.keys_ = function () {
        return (this.keysAtom_.reportObserved(), Object.keys(this.target_));
      }),
      e
    );
  })();
function Wn(e, t) {
  var n;
  if (k(e, X)) return e;
  var i = null != (n = null == t ? void 0 : t.name) ? n : "ObservableObject",
    o = new Hn(
      e,
      new Map(),
      String(i),
      (function (e) {
        var t;
        return e ? (null != (t = e.defaultDecorator) ? t : Ae(e)) : void 0;
      })(t)
    );
  return (I(e, X, o), e);
}
var Gn = w("ObservableObjectAdministration", Hn);
function zn(e) {
  return (
    Kn[e] ||
    (Kn[e] = {
      get: function () {
        return this[X].getObservablePropValue_(e);
      },
      set: function (t) {
        return this[X].setObservablePropValue_(e, t);
      },
    })
  );
}
function Xn(e) {
  return !!M(e) && Gn(e[X]);
}
function Qn(e, t, n) {
  var i;
  null == (i = e.target_[H]) || delete i[n];
}
var Yn,
  $n,
  Zn = oi(0),
  ei = (function () {
    var e = !1,
      t = {};
    return (
      Object.defineProperty(t, "0", {
        set: function () {
          e = !0;
        },
      }),
      (Object.create(t)[0] = 1),
      !1 === e
    );
  })(),
  ti = 0,
  ni = function () {};
((Yn = ni),
  ($n = Array.prototype),
  Object.setPrototypeOf
    ? Object.setPrototypeOf(Yn.prototype, $n)
    : void 0 !== Yn.prototype.__proto__
      ? (Yn.prototype.__proto__ = $n)
      : (Yn.prototype = $n));
var ii = (function (e) {
  function t(t, n, i, o) {
    var r;
    return (
      void 0 === i && (i = "ObservableArray"),
      void 0 === o && (o = !1),
      (r = e.call(this) || this),
      di(function () {
        var e = new Cn(i, n, o, !0);
        ((e.proxy_ = r),
          T(r, X, e),
          t && t.length && r.spliceWithArray(0, 0, t),
          ei && Object.defineProperty(r, "0", Zn));
      }),
      r
    );
  }
  J(t, e);
  var n = t.prototype;
  return (
    (n.concat = function () {
      this[X].atom_.reportObserved();
      for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
        t[n] = arguments[n];
      return Array.prototype.concat.apply(
        this.slice(),
        t.map(function (e) {
          return En(e) ? e.slice() : e;
        })
      );
    }),
    (n[Symbol.iterator] = function () {
      var e = this,
        t = 0;
      return yi({
        next: function () {
          return t < e.length
            ? { value: e[t++], done: !1 }
            : { done: !0, value: void 0 };
        },
      });
    }),
    F(t, [
      {
        key: "length",
        get: function () {
          return this[X].getArrayLength_();
        },
        set: function (e) {
          this[X].setArrayLength_(e);
        },
      },
      {
        key: Symbol.toStringTag,
        get: function () {
          return "Array";
        },
      },
    ])
  );
})(ni);
function oi(e) {
  return {
    enumerable: !1,
    configurable: !0,
    get: function () {
      return this[X].get_(e);
    },
    set: function (t) {
      this[X].set_(e, t);
    },
  };
}
function ri(e) {
  d(ii.prototype, "" + e, oi(e));
}
function si(e) {
  if (e > ti) {
    for (var t = ti; t < e + 100; t++) ri(t);
    ti = e;
  }
}
function ai(e, t, n) {
  return new ii(e, t, n);
}
function ci(e, t) {
  if ("object" == typeof e && null !== e) {
    if (En(e)) return (void 0 !== t && s(23), e[X].atom_);
    if (Bn(e)) return e.atom_;
    if (xn(e)) {
      if (void 0 === t) return e.keysAtom_;
      var n = e.data_.get(t) || e.hasMap_.get(t);
      return (n || s(25, t, li(e)), n);
    }
    if (Xn(e)) {
      if (!t) return s(26);
      var i = e[X].values_.get(t);
      return (i || s(27, t, li(e)), i);
    }
    if (Y(e) || nt(e) || Nt(e)) return e;
  } else if (b(e) && Nt(e[X])) return e[X];
  s(28);
}
function ui(e, t) {
  return (
    e || s(29),
    void 0 !== t
      ? ui(ci(e, t))
      : Y(e) || nt(e) || Nt(e) || xn(e) || Bn(e)
        ? e
        : e[X]
          ? e[X]
          : void s(24, e)
  );
}
function li(e, t) {
  var n;
  if (void 0 !== t) n = ci(e, t);
  else {
    if (Jt(e)) return e.name;
    n = Xn(e) || xn(e) || Bn(e) ? ui(e) : ci(e);
  }
  return n.name_;
}
function di(e) {
  var t = ut(),
    n = Qe(!0);
  St();
  try {
    return e();
  } finally {
    (Mt(), Ye(n), lt(t));
  }
}
(Object.entries(Tn).forEach(function (e) {
  var t = e[0],
    n = e[1];
  "concat" !== t && I(ii.prototype, t, n);
}),
  si(1e3));
var hi,
  vi = h.toString;
function fi(e, t, n) {
  return (void 0 === n && (n = -1), gi(e, t, n));
}
function gi(e, t, n, i, o) {
  if (e === t) return 0 !== e || 1 / e == 1 / t;
  if (null == e || null == t) return !1;
  if (e != e) return t != t;
  var r = typeof e;
  if ("function" !== r && "object" !== r && "object" != typeof t) return !1;
  var s = vi.call(e);
  if (s !== vi.call(t)) return !1;
  switch (s) {
    case "[object RegExp]":
    case "[object String]":
      return "" + e == "" + t;
    case "[object Number]":
      return +e != +e ? +t != +t : 0 === +e ? 1 / +e == 1 / t : +e === +t;
    case "[object Date]":
    case "[object Boolean]":
      return +e === +t;
    case "[object Symbol]":
      return (
        "undefined" != typeof Symbol &&
        Symbol.valueOf.call(e) === Symbol.valueOf.call(t)
      );
    case "[object Map]":
    case "[object Set]":
      n >= 0 && n++;
  }
  ((e = pi(e)), (t = pi(t)));
  var a = "[object Array]" === s;
  if (!a) {
    if ("object" != typeof e || "object" != typeof t) return !1;
    var c = e.constructor,
      u = t.constructor;
    if (
      c !== u &&
      !(b(c) && c instanceof c && b(u) && u instanceof u) &&
      "constructor" in e &&
      "constructor" in t
    )
      return !1;
  }
  if (0 === n) return !1;
  (n < 0 && (n = -1), (o = o || []));
  for (var l = (i = i || []).length; l--; ) if (i[l] === e) return o[l] === t;
  if ((i.push(e), o.push(t), a)) {
    if ((l = e.length) !== t.length) return !1;
    for (; l--; ) if (!gi(e[l], t[l], n - 1, i, o)) return !1;
  } else {
    var d = Object.keys(e),
      h = d.length;
    if (Object.keys(t).length !== h) return !1;
    for (var v = 0; v < h; v++) {
      var f = d[v];
      if (!k(t, f) || !gi(e[f], t[f], n - 1, i, o)) return !1;
    }
  }
  return (i.pop(), o.pop(), !0);
}
function pi(e) {
  return En(e)
    ? e.slice()
    : O(e) || xn(e) || R(e) || Bn(e)
      ? Array.from(e.entries())
      : e;
}
var mi = (null == (hi = c().Iterator) ? void 0 : hi.prototype) || {};
function yi(e) {
  return ((e[Symbol.iterator] = _i), Object.assign(Object.create(mi), e));
}
function _i() {
  return this;
}
(["Symbol", "Map", "Set"].forEach(function (e) {
  void 0 === c()[e] &&
    s("MobX requires global '" + e + "' to be available or polyfilled");
}),
  "object" == typeof __MOBX_DEVTOOLS_GLOBAL_HOOK__ &&
    __MOBX_DEVTOOLS_GLOBAL_HOOK__.injectMobx({
      spy: function (e) {
        return (
          console.warn("[mobx.spy] Is a no-op in production builds"),
          function () {}
        );
      },
      extras: { getDebugName: li },
      $mobx: X,
    }),
  (function (e) {
    !0 === e.isolateGlobalState &&
      (function () {
        if (
          ((mt.pendingReactions.length ||
            mt.inBatch ||
            mt.isRunningReactions) &&
            s(36),
          (pt = !0),
          gt)
        ) {
          var e = c();
          (0 === --e.__mobxInstanceCount && (e.__mobxGlobals = void 0),
            (mt = new ft()));
        }
      })();
    var t,
      n,
      i = e.useProxies,
      o = e.enforceActions;
    if (
      (void 0 !== i &&
        (mt.useProxies =
          i === Yt || ("never" !== i && "undefined" != typeof Proxy)),
      "ifavailable" === i && (mt.verifyProxies = !0),
      void 0 !== o)
    ) {
      var r = o === Yt ? Yt : "observed" === o;
      ((mt.enforceActions = r), (mt.allowStateChanges = !0 !== r && r !== Yt));
    }
    ([
      "computedRequiresReaction",
      "reactionRequiresObservable",
      "observableRequiresReaction",
      "disableErrorBoundaries",
      "safeDescriptors",
    ].forEach(function (t) {
      t in e && (mt[t] = !!e[t]);
    }),
      (mt.allowStateReads = !mt.observableRequiresReaction),
      e.reactionScheduler &&
        ((t = e.reactionScheduler),
        (n = wt),
        (wt = function (e) {
          return t(function () {
            return n(e);
          });
        })));
  })({ useProxies: "never" }));
var bi,
  Si = (function () {
    function e(e, t, n) {
      ((this.rootStore = e),
        (this.nim = t),
        (this.localOptions = n),
        (this.connectStatus = 3),
        (this.loginStatus = 0),
        (this.logger = null),
        bn(this),
        (this._onLoginStatus = this._onLoginStatus.bind(this)),
        (this._onLoginFailed = this._onLoginFailed.bind(this)),
        (this._onKickedOffline = this._onKickedOffline.bind(this)),
        (this._onLoginClientChanged = this._onLoginClientChanged.bind(this)),
        (this._onConnectStatus = this._onConnectStatus.bind(this)),
        (this._onDisconnected = this._onDisconnected.bind(this)),
        (this._onConnectFailed = this._onConnectFailed.bind(this)),
        (this._onDataSync = this._onDataSync.bind(this)),
        (this.logger = e.logger),
        t.V2NIMLoginService.on("onLoginStatus", this._onLoginStatus),
        t.V2NIMLoginService.on("onLoginFailed", this._onLoginFailed),
        t.V2NIMLoginService.on("onKickedOffline", this._onKickedOffline),
        t.V2NIMLoginService.on(
          "onLoginClientChanged",
          this._onLoginClientChanged
        ),
        t.V2NIMLoginService.on("onConnectStatus", this._onConnectStatus),
        t.V2NIMLoginService.on("onDisconnected", this._onDisconnected),
        t.V2NIMLoginService.on("onConnectFailed", this._onConnectFailed),
        t.V2NIMLoginService.on("onDataSync", this._onDataSync));
    }
    return (
      (e.prototype.destroy = function () {
        (this.nim.V2NIMLoginService.off("onLoginStatus", this._onLoginStatus),
          this.nim.V2NIMLoginService.off("onLoginFailed", this._onLoginFailed),
          this.nim.V2NIMLoginService.off(
            "onKickedOffline",
            this._onKickedOffline
          ),
          this.nim.V2NIMLoginService.off(
            "onLoginClientChanged",
            this._onLoginClientChanged
          ),
          this.nim.V2NIMLoginService.off(
            "onConnectStatus",
            this._onConnectStatus
          ),
          this.nim.V2NIMLoginService.off(
            "onDisconnected",
            this._onDisconnected
          ),
          this.nim.V2NIMLoginService.off(
            "onConnectFailed",
            this._onConnectFailed
          ),
          this.nim.V2NIMLoginService.off("onDataSync", this._onDataSync));
      }),
      (e.prototype._onLoginStatus = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onLoginStatus", e),
          (this.loginStatus = e));
      }),
      (e.prototype._onLoginFailed = function (e) {
        var t;
        null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onLoginFailed", e);
      }),
      (e.prototype._onKickedOffline = function (e) {
        var t;
        null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onKickedOffline", e);
      }),
      (e.prototype._onLoginClientChanged = function (e) {
        var t;
        null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onLoginClientChanged", e);
      }),
      (e.prototype._onConnectStatus = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onConnectStatus", e),
          (this.connectStatus = e),
          1 === e && this.rootStore.subscriptionStore.resetState());
      }),
      (e.prototype._onDisconnected = function (e) {
        var t;
        null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onDisconnected", e);
      }),
      (e.prototype._onConnectFailed = function (e) {
        var t;
        null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onConnectFailed", e);
      }),
      (e.prototype._onDataSync = function (e, t) {
        var n, i, o, r;
        (null === (n = this.logger) ||
          void 0 === n ||
          n.log("_onDataSync", e, t),
          this.rootStore.userStore.getMyUserInfoActive(),
          this.rootStore.relationStore.getBlockListActive(),
          this.rootStore.relationStore.getP2PMuteListActive(),
          (
            null === (i = this.rootStore.sdkOptions) || void 0 === i
              ? void 0
              : i.enableV2CloudConversation
          )
            ? null === (o = this.rootStore.conversationStore) ||
              void 0 === o ||
              o.getConversationListActive(
                0,
                this.localOptions.conversationLimit || 100
              )
            : null === (r = this.rootStore.localConversationStore) ||
              void 0 === r ||
              r.getConversationListActive(
                0,
                this.localOptions.conversationLimit || 100
              ),
          this.rootStore.teamStore.getJoinedTeamListActive(),
          this.rootStore.friendStore.getFriendListActive(),
          this.rootStore.friendStore.getAddApplicationListActive({
            status: [],
            offset: 0,
            limit: 100,
          }),
          this.rootStore.teamStore.getTeamJoinActionInfoListActive({
            offset: 0,
            limit: 100,
          }),
          this.localOptions.aiVisible &&
            this.rootStore.aiUserStore.getAIUserListActive());
      }),
      e
    );
  })(),
  Mi = (function () {
    function i(e, t) {
      ((this.rootStore = e),
        (this.nim = t),
        (this.friends = new Map()),
        (this.logger = null),
        bn(this),
        (this._onFriendAdded = this._onFriendAdded.bind(this)),
        (this._onFriendDeleted = this._onFriendDeleted.bind(this)),
        (this._onFriendAddApplication =
          this._onFriendAddApplication.bind(this)),
        (this._onFriendAddRejected = this._onFriendAddRejected.bind(this)),
        (this._onFriendInfoChanged = this._onFriendInfoChanged.bind(this)),
        (this.logger = e.logger),
        t.V2NIMFriendService.on("onFriendAdded", this._onFriendAdded),
        t.V2NIMFriendService.on("onFriendDeleted", this._onFriendDeleted),
        t.V2NIMFriendService.on(
          "onFriendAddApplication",
          this._onFriendAddApplication
        ),
        t.V2NIMFriendService.on(
          "onFriendAddRejected",
          this._onFriendAddRejected
        ),
        t.V2NIMFriendService.on(
          "onFriendInfoChanged",
          this._onFriendInfoChanged
        ));
    }
    return (
      (i.prototype.resetState = function () {
        this.friends.clear();
      }),
      (i.prototype.destroy = function () {
        (this.resetState(),
          this.nim.V2NIMFriendService.off("onFriendAdded", this._onFriendAdded),
          this.nim.V2NIMFriendService.off(
            "onFriendDeleted",
            this._onFriendDeleted
          ),
          this.nim.V2NIMFriendService.off(
            "onFriendAddApplication",
            this._onFriendAddApplication
          ),
          this.nim.V2NIMFriendService.off(
            "onFriendAddRejected",
            this._onFriendAddRejected
          ),
          this.nim.V2NIMFriendService.off(
            "onFriendInfoChanged",
            this._onFriendInfoChanged
          ));
      }),
      (i.prototype.getFriendListActive = function () {
        var e, i, o;
        return t(this, void 0, void 0, function () {
          var t, r;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (e = this.logger) ||
                    void 0 === e ||
                    e.log("getFriendListActive"),
                  [4, this.nim.V2NIMFriendService.getFriendList()]
                );
              case 1:
                return (
                  (t = n.sent()),
                  this.addFriend(t),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("getFriendListActive success", t),
                  [2, t]
                );
              case 2:
                throw (
                  (r = n.sent()),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.error("getFriendListActive failed: ", r),
                  r
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.getFriendByIdsActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("getFriendByIdsActive", e),
                  [4, this.nim.V2NIMFriendService.getFriendByIds(e)]
                );
              case 1:
                return (
                  (t = n.sent()),
                  this.addFriend(t),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getFriendByIdsActive success", t),
                  [2, t]
                );
              case 2:
                throw (
                  (s = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("getFriendByIdsActive failed: ", s),
                  s
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.getAddApplicationListActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("getAddApplicationListActive"),
                  [4, this.nim.V2NIMFriendService.getAddApplicationList(e)]
                );
              case 1:
                return (
                  (t = n.sent()),
                  this.rootStore.sysMsgStore.addFriendApplyMsg(t.infos),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getAddApplicationListActive success", t),
                  [2, t]
                );
              case 2:
                throw (
                  (s = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("getAddApplicationListActive failed: ", s),
                  s
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.addFriendActive = function (e, i) {
        var o, r, s;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("addFriendActive", e),
                  [4, this.nim.V2NIMFriendService.addFriend(e, i)]
                );
              case 1:
                return (
                  n.sent(),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log("addFriendActive success", e, i),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error("addFriendActive failed: ", e, i, t),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.acceptAddApplicationActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("acceptAddApplicationActive", e),
                  [4, this.nim.V2NIMFriendService.acceptAddApplication(e)]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("acceptAddApplicationActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("acceptAddApplicationActive failed: ", e, t),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.rejectAddApplicationActive = function (e, i) {
        var o, r, s;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("rejectAddApplicationActive", e, i),
                  [4, this.nim.V2NIMFriendService.rejectAddApplication(e, i)]
                );
              case 1:
                return (
                  n.sent(),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log("rejectFriendApplyActive success", e, i),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error("rejectFriendApplyActive failed: ", e, i, t),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.deleteFriendActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("deleteFriendActive", e),
                  [
                    4,
                    this.nim.V2NIMFriendService.deleteFriend(e, {
                      deleteAlias: !0,
                    }),
                  ]
                );
              case 1:
                return (
                  n.sent(),
                  this.removeFriend([e]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("deleteFriendActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("deleteFriendActive failed: ", e, t),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.setFriendInfoActive = function (e, i) {
        var o, r, s;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("setFriendInfoActive", e, i),
                  [4, this.nim.V2NIMFriendService.setFriendInfo(e, i)]
                );
              case 1:
                return (
                  n.sent(),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log("setFriendInfoActive success", e, i),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error("setFriendInfoActive failed: ", e, i, t),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.addFriend = function (t) {
        var n = this;
        (t
          .filter(function (e) {
            return !!e.accountId;
          })
          .forEach(function (t) {
            var i = n.friends.get(t.accountId);
            i
              ? n.friends.set(t.accountId, e(e(e({}, i), t), t.userProfile))
              : n.friends.set(t.accountId, e(e({}, t), t.userProfile));
          }),
          this.rootStore.userStore.addUsers(
            t.map(function (t) {
              return e(e({}, t), t.userProfile);
            })
          ));
      }),
      (i.prototype.removeFriend = function (e) {
        var t = this;
        e.forEach(function (e) {
          t.friends.delete(e);
        });
      }),
      (i.prototype._onFriendAdded = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onFriendAdded", e),
          this.addFriend([e]),
          this.rootStore.sysMsgStore.updateFriendApplyMsg([
            {
              operatorAccountId: this.rootStore.userStore.myUserInfo.accountId,
              applicantAccountId: e.accountId,
              recipientAccountId: this.rootStore.userStore.myUserInfo.accountId,
              timestamp: Date.now(),
              status: 1,
              isRead: !0,
              read: !0,
            },
          ]));
      }),
      (i.prototype._onFriendDeleted = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onFriendDeleted", e),
          e && this.removeFriend([e]));
      }),
      (i.prototype._onFriendAddApplication = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onFriendAddApplication", e),
          e.applicantAccountId !==
            this.rootStore.userStore.myUserInfo.accountId &&
            this.rootStore.sysMsgStore.addFriendApplyMsg([e]));
      }),
      (i.prototype._onFriendAddRejected = function (t) {
        var n;
        (null === (n = this.logger) ||
          void 0 === n ||
          n.log("_onFriendAddRejected", t),
          this.rootStore.sysMsgStore.addFriendApplyMsg([
            e(e({}, t), { isRead: !0 }),
          ]));
      }),
      (i.prototype._onFriendInfoChanged = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onFriendInfoChanged", e),
          this.addFriend([e]));
      }),
      i
    );
  })(),
  Ai = "ait_all",
  Ci = 12e4,
  Ii = Object.freeze({
    __proto__: null,
    AT_ALL_ACCOUNT: Ai,
    BE_MENTIONED: "beMentioned",
    AT_ALL_ACCOUNT_TOSDK: "#%@all@%#",
    HISTORY_LIMIT: 20,
    PIN_CONVERSATION_LIMIT: 20,
    RECALL_TIME: Ci,
    AI_MESSAGE_LIMIT: 30,
  }),
  Ti = function (e, t) {
    return function () {
      for (var n = new Array(arguments.length), i = 0; i < n.length; i++)
        n[i] = arguments[i];
      return e.apply(t, n);
    };
  },
  wi = Object.prototype.toString,
  Oi =
    ((bi = Object.create(null)),
    function (e) {
      var t = wi.call(e);
      return bi[t] || (bi[t] = t.slice(8, -1).toLowerCase());
    });
function Ri(e) {
  return (
    (e = e.toLowerCase()),
    function (t) {
      return Oi(t) === e;
    }
  );
}
function Ni(e) {
  return Array.isArray(e);
}
function Li(e) {
  return void 0 === e;
}
var Ei = Ri("ArrayBuffer");
function ki(e) {
  return null !== e && "object" == typeof e;
}
function Vi(e) {
  if ("object" !== Oi(e)) return !1;
  var t = Object.getPrototypeOf(e);
  return null === t || t === Object.prototype;
}
var Pi = Ri("Date"),
  Ui = Ri("File"),
  xi = Ri("Blob"),
  ji = Ri("FileList");
function Fi(e) {
  return "[object Function]" === wi.call(e);
}
var Di = Ri("URLSearchParams");
function Bi(e, t) {
  if (null != e)
    if (("object" != typeof e && (e = [e]), Ni(e)))
      for (var n = 0, i = e.length; n < i; n++) t.call(null, e[n], n, e);
    else
      for (var o in e)
        Object.prototype.hasOwnProperty.call(e, o) && t.call(null, e[o], o, e);
}
var Ji,
  Ki =
    ((Ji =
      "undefined" != typeof Uint8Array && Object.getPrototypeOf(Uint8Array)),
    function (e) {
      return Ji && e instanceof Ji;
    }),
  qi = {
    isArray: Ni,
    isArrayBuffer: Ei,
    isBuffer: function (e) {
      return (
        null !== e &&
        !Li(e) &&
        null !== e.constructor &&
        !Li(e.constructor) &&
        "function" == typeof e.constructor.isBuffer &&
        e.constructor.isBuffer(e)
      );
    },
    isFormData: function (e) {
      var t = "[object FormData]";
      return (
        e &&
        (("function" == typeof FormData && e instanceof FormData) ||
          wi.call(e) === t ||
          (Fi(e.toString) && e.toString() === t))
      );
    },
    isArrayBufferView: function (e) {
      return "undefined" != typeof ArrayBuffer && ArrayBuffer.isView
        ? ArrayBuffer.isView(e)
        : e && e.buffer && Ei(e.buffer);
    },
    isString: function (e) {
      return "string" == typeof e;
    },
    isNumber: function (e) {
      return "number" == typeof e;
    },
    isObject: ki,
    isPlainObject: Vi,
    isUndefined: Li,
    isDate: Pi,
    isFile: Ui,
    isBlob: xi,
    isFunction: Fi,
    isStream: function (e) {
      return ki(e) && Fi(e.pipe);
    },
    isURLSearchParams: Di,
    isStandardBrowserEnv: function () {
      return (
        ("undefined" == typeof navigator ||
          ("ReactNative" !== navigator.product &&
            "NativeScript" !== navigator.product &&
            "NS" !== navigator.product)) &&
        "undefined" != typeof window &&
        "undefined" != typeof document
      );
    },
    forEach: Bi,
    merge: function e() {
      var t = {};
      function n(n, i) {
        Vi(t[i]) && Vi(n)
          ? (t[i] = e(t[i], n))
          : Vi(n)
            ? (t[i] = e({}, n))
            : Ni(n)
              ? (t[i] = n.slice())
              : (t[i] = n);
      }
      for (var i = 0, o = arguments.length; i < o; i++) Bi(arguments[i], n);
      return t;
    },
    extend: function (e, t, n) {
      return (
        Bi(t, function (t, i) {
          e[i] = n && "function" == typeof t ? Ti(t, n) : t;
        }),
        e
      );
    },
    trim: function (e) {
      return e.trim ? e.trim() : e.replace(/^\s+|\s+$/g, "");
    },
    stripBOM: function (e) {
      return (65279 === e.charCodeAt(0) && (e = e.slice(1)), e);
    },
    inherits: function (e, t, n, i) {
      ((e.prototype = Object.create(t.prototype, i)),
        (e.prototype.constructor = e),
        n && Object.assign(e.prototype, n));
    },
    toFlatObject: function (e, t, n) {
      var i,
        o,
        r,
        s = {};
      t = t || {};
      do {
        for (o = (i = Object.getOwnPropertyNames(e)).length; o-- > 0; )
          s[(r = i[o])] || ((t[r] = e[r]), (s[r] = !0));
        e = Object.getPrototypeOf(e);
      } while (e && (!n || n(e, t)) && e !== Object.prototype);
      return t;
    },
    kindOf: Oi,
    kindOfTest: Ri,
    endsWith: function (e, t, n) {
      ((e = String(e)),
        (void 0 === n || n > e.length) && (n = e.length),
        (n -= t.length));
      var i = e.indexOf(t, n);
      return -1 !== i && i === n;
    },
    toArray: function (e) {
      if (!e) return null;
      var t = e.length;
      if (Li(t)) return null;
      for (var n = new Array(t); t-- > 0; ) n[t] = e[t];
      return n;
    },
    isTypedArray: Ki,
    isFileList: ji,
  },
  Hi = qi;
function Wi(e) {
  return encodeURIComponent(e)
    .replace(/%3A/gi, ":")
    .replace(/%24/g, "$")
    .replace(/%2C/gi, ",")
    .replace(/%20/g, "+")
    .replace(/%5B/gi, "[")
    .replace(/%5D/gi, "]");
}
function Gi() {
  this.handlers = [];
}
((Gi.prototype.use = function (e, t, n) {
  return (
    this.handlers.push({
      fulfilled: e,
      rejected: t,
      synchronous: !!n && n.synchronous,
      runWhen: n ? n.runWhen : null,
    }),
    this.handlers.length - 1
  );
}),
  (Gi.prototype.eject = function (e) {
    this.handlers[e] && (this.handlers[e] = null);
  }),
  (Gi.prototype.forEach = function (e) {
    Hi.forEach(this.handlers, function (t) {
      null !== t && e(t);
    });
  }));
var zi = Gi;
function Xi(e, t, n, i, o) {
  (Error.call(this),
    (this.message = e),
    (this.name = "AxiosError"),
    t && (this.code = t),
    n && (this.config = n),
    i && (this.request = i),
    o && (this.response = o));
}
Hi.inherits(Xi, Error, {
  toJSON: function () {
    return {
      message: this.message,
      name: this.name,
      description: this.description,
      number: this.number,
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      config: this.config,
      code: this.code,
      status:
        this.response && this.response.status ? this.response.status : null,
    };
  },
});
var Qi = Xi.prototype,
  Yi = {};
([
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
].forEach(function (e) {
  Yi[e] = { value: e };
}),
  Object.defineProperties(Xi, Yi),
  Object.defineProperty(Qi, "isAxiosError", { value: !0 }),
  (Xi.from = function (e, t, n, i, o, r) {
    var s = Object.create(Qi);
    return (
      Hi.toFlatObject(e, s, function (e) {
        return e !== Error.prototype;
      }),
      Xi.call(s, e.message, t, n, i, o),
      (s.name = e.name),
      r && Object.assign(s, r),
      s
    );
  }));
var $i = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
};
var Zi = function (e, t) {
    t = t || new FormData();
    var n = [];
    function i(e) {
      return null === e
        ? ""
        : Hi.isDate(e)
          ? e.toISOString()
          : Hi.isArrayBuffer(e) || Hi.isTypedArray(e)
            ? "function" == typeof Blob
              ? new Blob([e])
              : Buffer.from(e)
            : e;
    }
    return (
      (function e(o, r) {
        if (Hi.isPlainObject(o) || Hi.isArray(o)) {
          if (-1 !== n.indexOf(o))
            throw Error("Circular reference detected in " + r);
          (n.push(o),
            Hi.forEach(o, function (n, o) {
              if (!Hi.isUndefined(n)) {
                var s,
                  a = r ? r + "." + o : o;
                if (n && !r && "object" == typeof n)
                  if (Hi.endsWith(o, "{}")) n = JSON.stringify(n);
                  else if (Hi.endsWith(o, "[]") && (s = Hi.toArray(n)))
                    return void s.forEach(function (e) {
                      !Hi.isUndefined(e) && t.append(a, i(e));
                    });
                e(n, a);
              }
            }),
            n.pop());
        } else t.append(r, i(o));
      })(e),
      t
    );
  },
  eo = Xi,
  to = Hi.isStandardBrowserEnv()
    ? {
        write: function (e, t, n, i, o, r) {
          var s = [];
          (s.push(e + "=" + encodeURIComponent(t)),
            Hi.isNumber(n) && s.push("expires=" + new Date(n).toGMTString()),
            Hi.isString(i) && s.push("path=" + i),
            Hi.isString(o) && s.push("domain=" + o),
            !0 === r && s.push("secure"),
            (document.cookie = s.join("; ")));
        },
        read: function (e) {
          var t = document.cookie.match(
            new RegExp("(^|;\\s*)(" + e + ")=([^;]*)")
          );
          return t ? decodeURIComponent(t[3]) : null;
        },
        remove: function (e) {
          this.write(e, "", Date.now() - 864e5);
        },
      }
    : {
        write: function () {},
        read: function () {
          return null;
        },
        remove: function () {},
      },
  no = function (e) {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
  },
  io = function (e, t) {
    return t ? e.replace(/\/+$/, "") + "/" + t.replace(/^\/+/, "") : e;
  },
  oo = [
    "age",
    "authorization",
    "content-length",
    "content-type",
    "etag",
    "expires",
    "from",
    "host",
    "if-modified-since",
    "if-unmodified-since",
    "last-modified",
    "location",
    "max-forwards",
    "proxy-authorization",
    "referer",
    "retry-after",
    "user-agent",
  ],
  ro = Hi.isStandardBrowserEnv()
    ? (function () {
        var e,
          t = /(msie|trident)/i.test(navigator.userAgent),
          n = document.createElement("a");
        function i(e) {
          var i = e;
          return (
            t && (n.setAttribute("href", i), (i = n.href)),
            n.setAttribute("href", i),
            {
              href: n.href,
              protocol: n.protocol ? n.protocol.replace(/:$/, "") : "",
              host: n.host,
              search: n.search ? n.search.replace(/^\?/, "") : "",
              hash: n.hash ? n.hash.replace(/^#/, "") : "",
              hostname: n.hostname,
              port: n.port,
              pathname:
                "/" === n.pathname.charAt(0) ? n.pathname : "/" + n.pathname,
            }
          );
        }
        return (
          (e = i(window.location.href)),
          function (t) {
            var n = Hi.isString(t) ? i(t) : t;
            return n.protocol === e.protocol && n.host === e.host;
          }
        );
      })()
    : function () {
        return !0;
      };
function so(e) {
  (eo.call(this, null == e ? "canceled" : e, eo.ERR_CANCELED),
    (this.name = "CanceledError"));
}
Hi.inherits(so, eo, { __CANCEL__: !0 });
var ao = function (e, t, n) {
    var i = n.config.validateStatus;
    n.status && i && !i(n.status)
      ? t(
          new eo(
            "Request failed with status code " + n.status,
            [eo.ERR_BAD_REQUEST, eo.ERR_BAD_RESPONSE][
              Math.floor(n.status / 100) - 4
            ],
            n.config,
            n.request,
            n
          )
        )
      : e(n);
  },
  co = to,
  uo = function (e, t, n) {
    if (!t) return e;
    var i;
    if (n) i = n(t);
    else if (Hi.isURLSearchParams(t)) i = t.toString();
    else {
      var o = [];
      (Hi.forEach(t, function (e, t) {
        null != e &&
          (Hi.isArray(e) ? (t += "[]") : (e = [e]),
          Hi.forEach(e, function (e) {
            (Hi.isDate(e)
              ? (e = e.toISOString())
              : Hi.isObject(e) && (e = JSON.stringify(e)),
              o.push(Wi(t) + "=" + Wi(e)));
          }));
      }),
        (i = o.join("&")));
    }
    if (i) {
      var r = e.indexOf("#");
      (-1 !== r && (e = e.slice(0, r)),
        (e += (-1 === e.indexOf("?") ? "?" : "&") + i));
    }
    return e;
  },
  lo = function (e, t) {
    return e && !no(t) ? io(e, t) : t;
  },
  ho = function (e) {
    var t,
      n,
      i,
      o = {};
    return e
      ? (Hi.forEach(e.split("\n"), function (e) {
          if (
            ((i = e.indexOf(":")),
            (t = Hi.trim(e.substr(0, i)).toLowerCase()),
            (n = Hi.trim(e.substr(i + 1))),
            t)
          ) {
            if (o[t] && oo.indexOf(t) >= 0) return;
            o[t] =
              "set-cookie" === t
                ? (o[t] ? o[t] : []).concat([n])
                : o[t]
                  ? o[t] + ", " + n
                  : n;
          }
        }),
        o)
      : o;
  },
  vo = ro,
  fo = $i,
  go = so,
  po = function (e) {
    var t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
    return (t && t[1]) || "";
  },
  mo = function (e, t) {
    Hi.forEach(e, function (n, i) {
      i !== t &&
        i.toUpperCase() === t.toUpperCase() &&
        ((e[t] = n), delete e[i]);
    });
  },
  yo = Zi,
  _o = function (e) {
    return new Promise(function (t, n) {
      var i,
        o = e.data,
        r = e.headers,
        s = e.responseType;
      function a() {
        (e.cancelToken && e.cancelToken.unsubscribe(i),
          e.signal && e.signal.removeEventListener("abort", i));
      }
      Hi.isFormData(o) && Hi.isStandardBrowserEnv() && delete r["Content-Type"];
      var c = new XMLHttpRequest();
      if (e.auth) {
        var u = e.auth.username || "",
          l = e.auth.password
            ? unescape(encodeURIComponent(e.auth.password))
            : "";
        r.Authorization = "Basic " + btoa(u + ":" + l);
      }
      var d = lo(e.baseURL, e.url);
      function h() {
        if (c) {
          var i =
              "getAllResponseHeaders" in c
                ? ho(c.getAllResponseHeaders())
                : null,
            o = {
              data:
                s && "text" !== s && "json" !== s ? c.response : c.responseText,
              status: c.status,
              statusText: c.statusText,
              headers: i,
              config: e,
              request: c,
            };
          (ao(
            function (e) {
              (t(e), a());
            },
            function (e) {
              (n(e), a());
            },
            o
          ),
            (c = null));
        }
      }
      if (
        (c.open(
          e.method.toUpperCase(),
          uo(d, e.params, e.paramsSerializer),
          !0
        ),
        (c.timeout = e.timeout),
        "onloadend" in c
          ? (c.onloadend = h)
          : (c.onreadystatechange = function () {
              c &&
                4 === c.readyState &&
                (0 !== c.status ||
                  (c.responseURL && 0 === c.responseURL.indexOf("file:"))) &&
                setTimeout(h);
            }),
        (c.onabort = function () {
          c &&
            (n(new eo("Request aborted", eo.ECONNABORTED, e, c)), (c = null));
        }),
        (c.onerror = function () {
          (n(new eo("Network Error", eo.ERR_NETWORK, e, c, c)), (c = null));
        }),
        (c.ontimeout = function () {
          var t = e.timeout
              ? "timeout of " + e.timeout + "ms exceeded"
              : "timeout exceeded",
            i = e.transitional || fo;
          (e.timeoutErrorMessage && (t = e.timeoutErrorMessage),
            n(
              new eo(
                t,
                i.clarifyTimeoutError ? eo.ETIMEDOUT : eo.ECONNABORTED,
                e,
                c
              )
            ),
            (c = null));
        }),
        Hi.isStandardBrowserEnv())
      ) {
        var v =
          (e.withCredentials || vo(d)) && e.xsrfCookieName
            ? co.read(e.xsrfCookieName)
            : void 0;
        v && (r[e.xsrfHeaderName] = v);
      }
      ("setRequestHeader" in c &&
        Hi.forEach(r, function (e, t) {
          void 0 === o && "content-type" === t.toLowerCase()
            ? delete r[t]
            : c.setRequestHeader(t, e);
        }),
        Hi.isUndefined(e.withCredentials) ||
          (c.withCredentials = !!e.withCredentials),
        s && "json" !== s && (c.responseType = e.responseType),
        "function" == typeof e.onDownloadProgress &&
          c.addEventListener("progress", e.onDownloadProgress),
        "function" == typeof e.onUploadProgress &&
          c.upload &&
          c.upload.addEventListener("progress", e.onUploadProgress),
        (e.cancelToken || e.signal) &&
          ((i = function (e) {
            c && (n(!e || (e && e.type) ? new go() : e), c.abort(), (c = null));
          }),
          e.cancelToken && e.cancelToken.subscribe(i),
          e.signal &&
            (e.signal.aborted ? i() : e.signal.addEventListener("abort", i))),
        o || (o = null));
      var f = po(d);
      f && -1 === ["http", "https", "file"].indexOf(f)
        ? n(new eo("Unsupported protocol " + f + ":", eo.ERR_BAD_REQUEST, e))
        : c.send(o);
    });
  },
  bo = { "Content-Type": "application/x-www-form-urlencoded" };
function So(e, t) {
  !Hi.isUndefined(e) &&
    Hi.isUndefined(e["Content-Type"]) &&
    (e["Content-Type"] = t);
}
var Mo,
  Ao = {
    transitional: fo,
    adapter:
      (("undefined" != typeof XMLHttpRequest ||
        ("undefined" != typeof process &&
          "[object process]" === Object.prototype.toString.call(process))) &&
        (Mo = _o),
      Mo),
    transformRequest: [
      function (e, t) {
        if (
          (mo(t, "Accept"),
          mo(t, "Content-Type"),
          Hi.isFormData(e) ||
            Hi.isArrayBuffer(e) ||
            Hi.isBuffer(e) ||
            Hi.isStream(e) ||
            Hi.isFile(e) ||
            Hi.isBlob(e))
        )
          return e;
        if (Hi.isArrayBufferView(e)) return e.buffer;
        if (Hi.isURLSearchParams(e))
          return (
            So(t, "application/x-www-form-urlencoded;charset=utf-8"),
            e.toString()
          );
        var n,
          i = Hi.isObject(e),
          o = t && t["Content-Type"];
        if ((n = Hi.isFileList(e)) || (i && "multipart/form-data" === o)) {
          var r = this.env && this.env.FormData;
          return yo(n ? { "files[]": e } : e, r && new r());
        }
        return i || "application/json" === o
          ? (So(t, "application/json"),
            (function (e, t, n) {
              if (Hi.isString(e))
                try {
                  return ((t || JSON.parse)(e), Hi.trim(e));
                } catch (e) {
                  if ("SyntaxError" !== e.name) throw e;
                }
              return (n || JSON.stringify)(e);
            })(e))
          : e;
      },
    ],
    transformResponse: [
      function (e) {
        var t = this.transitional || Ao.transitional,
          n = t && t.silentJSONParsing,
          i = t && t.forcedJSONParsing,
          o = !n && "json" === this.responseType;
        if (o || (i && Hi.isString(e) && e.length))
          try {
            return JSON.parse(e);
          } catch (e) {
            if (o) {
              if ("SyntaxError" === e.name)
                throw eo.from(
                  e,
                  eo.ERR_BAD_RESPONSE,
                  this,
                  null,
                  this.response
                );
              throw e;
            }
          }
        return e;
      },
    ],
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    env: { FormData: null },
    validateStatus: function (e) {
      return e >= 200 && e < 300;
    },
    headers: { common: { Accept: "application/json, text/plain, */*" } },
  };
(Hi.forEach(["delete", "get", "head"], function (e) {
  Ao.headers[e] = {};
}),
  Hi.forEach(["post", "put", "patch"], function (e) {
    Ao.headers[e] = Hi.merge(bo);
  }));
var Co = Ao,
  Io = function (e, t, n) {
    var i = this || Co;
    return (
      Hi.forEach(n, function (n) {
        e = n.call(i, e, t);
      }),
      e
    );
  },
  To = function (e) {
    return !(!e || !e.__CANCEL__);
  };
function wo(e) {
  if (
    (e.cancelToken && e.cancelToken.throwIfRequested(),
    e.signal && e.signal.aborted)
  )
    throw new go();
}
var Oo = { version: "0.27.2" },
  Ro = Oo.version,
  No = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach(
  function (e, t) {
    No[e] = function (n) {
      return typeof n === e || "a" + (t < 1 ? "n " : " ") + e;
    };
  }
);
var Lo = {};
No.transitional = function (e, t, n) {
  function i(e, t) {
    return (
      "[Axios v" +
      Ro +
      "] Transitional option '" +
      e +
      "'" +
      t +
      (n ? ". " + n : "")
    );
  }
  return function (n, o, r) {
    if (!1 === e)
      throw new eo(
        i(o, " has been removed" + (t ? " in " + t : "")),
        eo.ERR_DEPRECATED
      );
    return (
      t &&
        !Lo[o] &&
        ((Lo[o] = !0),
        console.warn(
          i(
            o,
            " has been deprecated since v" +
              t +
              " and will be removed in the near future"
          )
        )),
      !e || e(n, o, r)
    );
  };
};
var Eo = {
    assertOptions: function (e, t, n) {
      if ("object" != typeof e)
        throw new eo("options must be an object", eo.ERR_BAD_OPTION_VALUE);
      for (var i = Object.keys(e), o = i.length; o-- > 0; ) {
        var r = i[o],
          s = t[r];
        if (s) {
          var a = e[r],
            c = void 0 === a || s(a, r, e);
          if (!0 !== c)
            throw new eo(
              "option " + r + " must be " + c,
              eo.ERR_BAD_OPTION_VALUE
            );
        } else if (!0 !== n)
          throw new eo("Unknown option " + r, eo.ERR_BAD_OPTION);
      }
    },
    validators: No,
  },
  ko = zi,
  Vo = function (e) {
    return (
      wo(e),
      (e.headers = e.headers || {}),
      (e.data = Io.call(e, e.data, e.headers, e.transformRequest)),
      (e.headers = Hi.merge(
        e.headers.common || {},
        e.headers[e.method] || {},
        e.headers
      )),
      Hi.forEach(
        ["delete", "get", "head", "post", "put", "patch", "common"],
        function (t) {
          delete e.headers[t];
        }
      ),
      (e.adapter || Co.adapter)(e).then(
        function (t) {
          return (
            wo(e),
            (t.data = Io.call(e, t.data, t.headers, e.transformResponse)),
            t
          );
        },
        function (t) {
          return (
            To(t) ||
              (wo(e),
              t &&
                t.response &&
                (t.response.data = Io.call(
                  e,
                  t.response.data,
                  t.response.headers,
                  e.transformResponse
                ))),
            Promise.reject(t)
          );
        }
      )
    );
  },
  Po = function (e, t) {
    t = t || {};
    var n = {};
    function i(e, t) {
      return Hi.isPlainObject(e) && Hi.isPlainObject(t)
        ? Hi.merge(e, t)
        : Hi.isPlainObject(t)
          ? Hi.merge({}, t)
          : Hi.isArray(t)
            ? t.slice()
            : t;
    }
    function o(n) {
      return Hi.isUndefined(t[n])
        ? Hi.isUndefined(e[n])
          ? void 0
          : i(void 0, e[n])
        : i(e[n], t[n]);
    }
    function r(e) {
      if (!Hi.isUndefined(t[e])) return i(void 0, t[e]);
    }
    function s(n) {
      return Hi.isUndefined(t[n])
        ? Hi.isUndefined(e[n])
          ? void 0
          : i(void 0, e[n])
        : i(void 0, t[n]);
    }
    function a(n) {
      return n in t ? i(e[n], t[n]) : n in e ? i(void 0, e[n]) : void 0;
    }
    var c = {
      url: r,
      method: r,
      data: r,
      baseURL: s,
      transformRequest: s,
      transformResponse: s,
      paramsSerializer: s,
      timeout: s,
      timeoutMessage: s,
      withCredentials: s,
      adapter: s,
      responseType: s,
      xsrfCookieName: s,
      xsrfHeaderName: s,
      onUploadProgress: s,
      onDownloadProgress: s,
      decompress: s,
      maxContentLength: s,
      maxBodyLength: s,
      beforeRedirect: s,
      transport: s,
      httpAgent: s,
      httpsAgent: s,
      cancelToken: s,
      socketPath: s,
      responseEncoding: s,
      validateStatus: a,
    };
    return (
      Hi.forEach(Object.keys(e).concat(Object.keys(t)), function (e) {
        var t = c[e] || o,
          i = t(e);
        (Hi.isUndefined(i) && t !== a) || (n[e] = i);
      }),
      n
    );
  },
  Uo = Eo,
  xo = Uo.validators;
function jo(e) {
  ((this.defaults = e),
    (this.interceptors = { request: new ko(), response: new ko() }));
}
((jo.prototype.request = function (e, t) {
  ("string" == typeof e ? ((t = t || {}).url = e) : (t = e || {}),
    (t = Po(this.defaults, t)).method
      ? (t.method = t.method.toLowerCase())
      : this.defaults.method
        ? (t.method = this.defaults.method.toLowerCase())
        : (t.method = "get"));
  var n = t.transitional;
  void 0 !== n &&
    Uo.assertOptions(
      n,
      {
        silentJSONParsing: xo.transitional(xo.boolean),
        forcedJSONParsing: xo.transitional(xo.boolean),
        clarifyTimeoutError: xo.transitional(xo.boolean),
      },
      !1
    );
  var i = [],
    o = !0;
  this.interceptors.request.forEach(function (e) {
    ("function" == typeof e.runWhen && !1 === e.runWhen(t)) ||
      ((o = o && e.synchronous), i.unshift(e.fulfilled, e.rejected));
  });
  var r,
    s = [];
  if (
    (this.interceptors.response.forEach(function (e) {
      s.push(e.fulfilled, e.rejected);
    }),
    !o)
  ) {
    var a = [Vo, void 0];
    for (
      Array.prototype.unshift.apply(a, i),
        a = a.concat(s),
        r = Promise.resolve(t);
      a.length;
    )
      r = r.then(a.shift(), a.shift());
    return r;
  }
  for (var c = t; i.length; ) {
    var u = i.shift(),
      l = i.shift();
    try {
      c = u(c);
    } catch (e) {
      l(e);
      break;
    }
  }
  try {
    r = Vo(c);
  } catch (e) {
    return Promise.reject(e);
  }
  for (; s.length; ) r = r.then(s.shift(), s.shift());
  return r;
}),
  (jo.prototype.getUri = function (e) {
    e = Po(this.defaults, e);
    var t = lo(e.baseURL, e.url);
    return uo(t, e.params, e.paramsSerializer);
  }),
  Hi.forEach(["delete", "get", "head", "options"], function (e) {
    jo.prototype[e] = function (t, n) {
      return this.request(
        Po(n || {}, { method: e, url: t, data: (n || {}).data })
      );
    };
  }),
  Hi.forEach(["post", "put", "patch"], function (e) {
    function t(t) {
      return function (n, i, o) {
        return this.request(
          Po(o || {}, {
            method: e,
            headers: t ? { "Content-Type": "multipart/form-data" } : {},
            url: n,
            data: i,
          })
        );
      };
    }
    ((jo.prototype[e] = t()), (jo.prototype[e + "Form"] = t(!0)));
  }));
var Fo = jo;
function Do(e) {
  if ("function" != typeof e)
    throw new TypeError("executor must be a function.");
  var t;
  this.promise = new Promise(function (e) {
    t = e;
  });
  var n = this;
  (this.promise.then(function (e) {
    if (n._listeners) {
      var t,
        i = n._listeners.length;
      for (t = 0; t < i; t++) n._listeners[t](e);
      n._listeners = null;
    }
  }),
    (this.promise.then = function (e) {
      var t,
        i = new Promise(function (e) {
          (n.subscribe(e), (t = e));
        }).then(e);
      return (
        (i.cancel = function () {
          n.unsubscribe(t);
        }),
        i
      );
    }),
    e(function (e) {
      n.reason || ((n.reason = new go(e)), t(n.reason));
    }));
}
((Do.prototype.throwIfRequested = function () {
  if (this.reason) throw this.reason;
}),
  (Do.prototype.subscribe = function (e) {
    this.reason
      ? e(this.reason)
      : this._listeners
        ? this._listeners.push(e)
        : (this._listeners = [e]);
  }),
  (Do.prototype.unsubscribe = function (e) {
    if (this._listeners) {
      var t = this._listeners.indexOf(e);
      -1 !== t && this._listeners.splice(t, 1);
    }
  }),
  (Do.source = function () {
    var e;
    return {
      token: new Do(function (t) {
        e = t;
      }),
      cancel: e,
    };
  }));
var Bo = Fo,
  Jo = Do,
  Ko = function (e) {
    return function (t) {
      return e.apply(null, t);
    };
  },
  qo = function (e) {
    return Hi.isObject(e) && !0 === e.isAxiosError;
  };
var Ho = (function e(t) {
  var n = new Bo(t),
    i = Ti(Bo.prototype.request, n);
  return (
    Hi.extend(i, Bo.prototype, n),
    Hi.extend(i, n),
    (i.create = function (n) {
      return e(Po(t, n));
    }),
    i
  );
})(Co);
((Ho.Axios = Bo),
  (Ho.CanceledError = go),
  (Ho.CancelToken = Jo),
  (Ho.isCancel = To),
  (Ho.VERSION = Oo.version),
  (Ho.toFormData = yo),
  (Ho.AxiosError = eo),
  (Ho.Cancel = Ho.CanceledError),
  (Ho.all = function (e) {
    return Promise.all(e);
  }),
  (Ho.spread = Ko),
  (Ho.isAxiosError = qo));
var Wo = Ho,
  Go = Ho;
Wo.default = Go;
var zo = Wo;
var Xo = (function (e, t) {
    return (e((t = { exports: {} }), t.exports), t.exports);
  })(function (e) {
    var t = Object.prototype.hasOwnProperty,
      n = "~";
    function i() {}
    function o(e, t, n) {
      ((this.fn = e), (this.context = t), (this.once = n || !1));
    }
    function r(e, t, i, r, s) {
      if ("function" != typeof i)
        throw new TypeError("The listener must be a function");
      var a = new o(i, r || e, s),
        c = n ? n + t : t;
      return (
        e._events[c]
          ? e._events[c].fn
            ? (e._events[c] = [e._events[c], a])
            : e._events[c].push(a)
          : ((e._events[c] = a), e._eventsCount++),
        e
      );
    }
    function s(e, t) {
      0 === --e._eventsCount ? (e._events = new i()) : delete e._events[t];
    }
    function a() {
      ((this._events = new i()), (this._eventsCount = 0));
    }
    (Object.create &&
      ((i.prototype = Object.create(null)), new i().__proto__ || (n = !1)),
      (a.prototype.eventNames = function () {
        var e,
          i,
          o = [];
        if (0 === this._eventsCount) return o;
        for (i in (e = this._events))
          t.call(e, i) && o.push(n ? i.slice(1) : i);
        return Object.getOwnPropertySymbols
          ? o.concat(Object.getOwnPropertySymbols(e))
          : o;
      }),
      (a.prototype.listeners = function (e) {
        var t = n ? n + e : e,
          i = this._events[t];
        if (!i) return [];
        if (i.fn) return [i.fn];
        for (var o = 0, r = i.length, s = new Array(r); o < r; o++)
          s[o] = i[o].fn;
        return s;
      }),
      (a.prototype.listenerCount = function (e) {
        var t = n ? n + e : e,
          i = this._events[t];
        return i ? (i.fn ? 1 : i.length) : 0;
      }),
      (a.prototype.emit = function (e, t, i, o, r, s) {
        var a = n ? n + e : e;
        if (!this._events[a]) return !1;
        var c,
          u,
          l = this._events[a],
          d = arguments.length;
        if (l.fn) {
          switch ((l.once && this.removeListener(e, l.fn, void 0, !0), d)) {
            case 1:
              return (l.fn.call(l.context), !0);
            case 2:
              return (l.fn.call(l.context, t), !0);
            case 3:
              return (l.fn.call(l.context, t, i), !0);
            case 4:
              return (l.fn.call(l.context, t, i, o), !0);
            case 5:
              return (l.fn.call(l.context, t, i, o, r), !0);
            case 6:
              return (l.fn.call(l.context, t, i, o, r, s), !0);
          }
          for (u = 1, c = new Array(d - 1); u < d; u++) c[u - 1] = arguments[u];
          l.fn.apply(l.context, c);
        } else {
          var h,
            v = l.length;
          for (u = 0; u < v; u++)
            switch (
              (l[u].once && this.removeListener(e, l[u].fn, void 0, !0), d)
            ) {
              case 1:
                l[u].fn.call(l[u].context);
                break;
              case 2:
                l[u].fn.call(l[u].context, t);
                break;
              case 3:
                l[u].fn.call(l[u].context, t, i);
                break;
              case 4:
                l[u].fn.call(l[u].context, t, i, o);
                break;
              default:
                if (!c)
                  for (h = 1, c = new Array(d - 1); h < d; h++)
                    c[h - 1] = arguments[h];
                l[u].fn.apply(l[u].context, c);
            }
        }
        return !0;
      }),
      (a.prototype.on = function (e, t, n) {
        return r(this, e, t, n, !1);
      }),
      (a.prototype.once = function (e, t, n) {
        return r(this, e, t, n, !0);
      }),
      (a.prototype.removeListener = function (e, t, i, o) {
        var r = n ? n + e : e;
        if (!this._events[r]) return this;
        if (!t) return (s(this, r), this);
        var a = this._events[r];
        if (a.fn)
          a.fn !== t || (o && !a.once) || (i && a.context !== i) || s(this, r);
        else {
          for (var c = 0, u = [], l = a.length; c < l; c++)
            (a[c].fn !== t || (o && !a[c].once) || (i && a[c].context !== i)) &&
              u.push(a[c]);
          u.length ? (this._events[r] = 1 === u.length ? u[0] : u) : s(this, r);
        }
        return this;
      }),
      (a.prototype.removeAllListeners = function (e) {
        var t;
        return (
          e
            ? ((t = n ? n + e : e), this._events[t] && s(this, t))
            : ((this._events = new i()), (this._eventsCount = 0)),
          this
        );
      }),
      (a.prototype.off = a.prototype.removeListener),
      (a.prototype.addListener = a.prototype.on),
      (a.prefixed = n),
      (a.EventEmitter = a),
      (e.exports = a));
  }),
  Qo = Xo,
  Yo = function (e, t) {
    return (
      (Yo =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (e, t) {
            e.__proto__ = t;
          }) ||
        function (e, t) {
          for (var n in t)
            Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
        }),
      Yo(e, t)
    );
  };
function $o(e, t) {
  if ("function" != typeof t && null !== t)
    throw new TypeError(
      "Class extends value " + String(t) + " is not a constructor or null"
    );
  function n() {
    this.constructor = e;
  }
  (Yo(e, t),
    (e.prototype =
      null === t ? Object.create(t) : ((n.prototype = t.prototype), new n())));
}
var Zo = function () {
  return (
    (Zo =
      Object.assign ||
      function (e) {
        for (var t, n = 1, i = arguments.length; n < i; n++)
          for (var o in (t = arguments[n]))
            Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
        return e;
      }),
    Zo.apply(this, arguments)
  );
};
function er(e, t, n, i) {
  return new (n || (n = Promise))(function (o, r) {
    function s(e) {
      try {
        c(i.next(e));
      } catch (e) {
        r(e);
      }
    }
    function a(e) {
      try {
        c(i.throw(e));
      } catch (e) {
        r(e);
      }
    }
    function c(e) {
      var t;
      e.done
        ? o(e.value)
        : ((t = e.value),
          t instanceof n
            ? t
            : new n(function (e) {
                e(t);
              })).then(s, a);
    }
    c((i = i.apply(e, t || [])).next());
  });
}
function tr(e, t) {
  var n,
    i,
    o,
    r,
    s = {
      label: 0,
      sent: function () {
        if (1 & o[0]) throw o[1];
        return o[1];
      },
      trys: [],
      ops: [],
    };
  return (
    (r = { next: a(0), throw: a(1), return: a(2) }),
    "function" == typeof Symbol &&
      (r[Symbol.iterator] = function () {
        return this;
      }),
    r
  );
  function a(a) {
    return function (c) {
      return (function (a) {
        if (n) throw new TypeError("Generator is already executing.");
        for (; r && ((r = 0), a[0] && (s = 0)), s; )
          try {
            if (
              ((n = 1),
              i &&
                (o =
                  2 & a[0]
                    ? i.return
                    : a[0]
                      ? i.throw || ((o = i.return) && o.call(i), 0)
                      : i.next) &&
                !(o = o.call(i, a[1])).done)
            )
              return o;
            switch (((i = 0), o && (a = [2 & a[0], o.value]), a[0])) {
              case 0:
              case 1:
                o = a;
                break;
              case 4:
                return (s.label++, { value: a[1], done: !1 });
              case 5:
                (s.label++, (i = a[1]), (a = [0]));
                continue;
              case 7:
                ((a = s.ops.pop()), s.trys.pop());
                continue;
              default:
                if (
                  !((o = s.trys),
                  (o = o.length > 0 && o[o.length - 1]) ||
                    (6 !== a[0] && 2 !== a[0]))
                ) {
                  s = 0;
                  continue;
                }
                if (3 === a[0] && (!o || (a[1] > o[0] && a[1] < o[3]))) {
                  s.label = a[1];
                  break;
                }
                if (6 === a[0] && s.label < o[1]) {
                  ((s.label = o[1]), (o = a));
                  break;
                }
                if (o && s.label < o[2]) {
                  ((s.label = o[2]), s.ops.push(a));
                  break;
                }
                (o[2] && s.ops.pop(), s.trys.pop());
                continue;
            }
            a = t.call(e, s);
          } catch (e) {
            ((a = [6, e]), (i = 0));
          } finally {
            n = o = 0;
          }
        if (5 & a[0]) throw a[1];
        return { value: a[0] ? a[1] : void 0, done: !0 };
      })([a, c]);
    };
  }
}
"function" == typeof SuppressedError && SuppressedError;
var nr = function (e) {
    var t = e.method,
      n = void 0 === t ? "POST" : t,
      i = e.url,
      o = e.data,
      r = e.headers;
    return er(void 0, void 0, void 0, function () {
      var e, t;
      return tr(this, function (s) {
        switch (s.label) {
          case 0:
            return (
              s.trys.push([0, 2, , 3]),
              [4, zo({ method: n, url: i, data: o, headers: r })]
            );
          case 1:
            return 200 !== (e = s.sent()).data.code
              ? [2, Promise.reject(e.data)]
              : [2, e.data];
          case 2:
            return ((t = s.sent()), [2, Promise.reject(t)]);
          case 3:
            return [2];
        }
      });
    });
  },
  ir = nr,
  or = (function () {
    function e(e) {
      var t = e.appKey,
        n = e.version,
        i = e.component,
        o = e.nertcVersion,
        r = e.imVersion,
        s = e.os,
        a = void 0 === s ? "" : s,
        c = e.framework,
        u = void 0 === c ? "" : c,
        l = e.language,
        d = void 0 === l ? "" : l,
        h = e.container,
        v = void 0 === h ? "" : h,
        f = e.platform,
        g = void 0 === f ? "Web" : f,
        p = e.channel,
        m = void 0 === p ? "netease" : p;
      ((this.platform = g),
        (this.appKey = t),
        (this.version = n),
        (this.component = i),
        (this.nertcVersion = o),
        (this.imVersion = r),
        (this.channel = m),
        (this.os = a),
        (this.framework = u),
        (this.language = d),
        (this.container = v));
    }
    return (
      (e.prototype.track = function (e, t) {
        return er(this, void 0, void 0, function () {
          var n, i, o, r, s, a, c, u, l, d, h, v, f;
          return tr(this, function (g) {
            switch (g.label) {
              case 0:
                ((i = (n = this).appKey),
                  (o = n.version),
                  (r = n.component),
                  (s = n.nertcVersion),
                  (a = n.imVersion),
                  (c = n.platform),
                  (u = n.channel),
                  (l = n.os),
                  (d = n.framework),
                  (h = n.language),
                  (v = n.container),
                  (f = Date.now()),
                  (g.label = 1));
              case 1:
                return (
                  g.trys.push([1, 3, , 4]),
                  [
                    4,
                    ir({
                      method: "POST",
                      url: "https://statistic.live.126.net/statics/report/xkit/action",
                      data: {
                        appKey: i,
                        version: o,
                        component: r,
                        timeStamp: f,
                        nertcVersion: s,
                        imVersion: a,
                        platform: c,
                        reportType: e,
                        data: t,
                        channel: u,
                        os: l,
                        framework: d,
                        language: h,
                        container: v,
                      },
                    }),
                  ]
                );
              case 2:
              case 3:
                return (g.sent(), [3, 4]);
              case 4:
                return [2];
            }
          });
        });
      }),
      e
    );
  })(),
  rr = or;
!(function (e) {
  function t(t) {
    var n = e.call(this) || this;
    return (
      (n.visibilityState = document.visibilityState),
      (n.entries = []),
      (n._visibilitychange = function () {
        ((n.visibilityState = document.visibilityState), n._trigger());
      }),
      (n.intersectionObserver = new IntersectionObserver(
        n._intersectionObserverHandler.bind(n),
        t
      )),
      document.addEventListener("visibilitychange", n._visibilitychange),
      n
    );
  }
  ($o(t, e),
    (t.prototype.observe = function (e) {
      return this.intersectionObserver.observe(e);
    }),
    (t.prototype.unobserve = function (e) {
      return this.intersectionObserver.unobserve(e);
    }),
    (t.prototype.destroy = function () {
      (this.intersectionObserver.disconnect(),
        document.removeEventListener(
          "visibilitychange",
          this._visibilitychange
        ),
        (this.entries = []));
    }),
    (t.prototype._intersectionObserverHandler = function (e) {
      ((this.entries = e), this._trigger());
    }),
    (t.prototype._trigger = function () {
      var e = this;
      this.entries.forEach(function (t) {
        "visible" !== e.visibilityState || t.intersectionRatio <= 0
          ? e.emit("visibleChange", { visible: !1, target: t.target })
          : e.emit("visibleChange", { visible: !0, target: t.target });
      });
    }));
})(Qo);
var sr =
  "undefined" != typeof globalThis
    ? globalThis
    : "undefined" != typeof window
      ? window
      : "undefined" != typeof global
        ? global
        : "undefined" != typeof self
          ? self
          : {};
var ar = (function (e, t) {
    return (e((t = { exports: {} }), t.exports), t.exports);
  })(function (e) {
    var t, n;
    ((t = sr),
      (n = function () {
        var e = function () {},
          t = "undefined",
          n =
            typeof window !== t &&
            typeof window.navigator !== t &&
            /Trident\/|MSIE /.test(window.navigator.userAgent),
          i = ["trace", "debug", "info", "warn", "error"],
          o = {},
          r = null;
        function s(e, t) {
          var n = e[t];
          if ("function" == typeof n.bind) return n.bind(e);
          try {
            return Function.prototype.bind.call(n, e);
          } catch (t) {
            return function () {
              return Function.prototype.apply.apply(n, [e, arguments]);
            };
          }
        }
        function a() {
          (console.log &&
            (console.log.apply
              ? console.log.apply(console, arguments)
              : Function.prototype.apply.apply(console.log, [
                  console,
                  arguments,
                ])),
            console.trace && console.trace());
        }
        function c() {
          for (var n = this.getLevel(), o = 0; o < i.length; o++) {
            var r = i[o];
            this[r] = o < n ? e : this.methodFactory(r, n, this.name);
          }
          if (
            ((this.log = this.debug),
            typeof console === t && n < this.levels.SILENT)
          )
            return "No console available for logging";
        }
        function u(e) {
          return function () {
            typeof console !== t &&
              (c.call(this), this[e].apply(this, arguments));
          };
        }
        function l(i, o, r) {
          return (
            (function (i) {
              return (
                "debug" === i && (i = "log"),
                typeof console !== t &&
                  ("trace" === i && n
                    ? a
                    : void 0 !== console[i]
                      ? s(console, i)
                      : void 0 !== console.log
                        ? s(console, "log")
                        : e)
              );
            })(i) || u.apply(this, arguments)
          );
        }
        function d(e, n) {
          var s,
            a,
            u,
            d = this,
            h = "loglevel";
          function v() {
            var e;
            if (typeof window !== t && h) {
              try {
                e = window.localStorage[h];
              } catch (e) {}
              if (typeof e === t)
                try {
                  var n = window.document.cookie,
                    i = encodeURIComponent(h),
                    o = n.indexOf(i + "=");
                  -1 !== o &&
                    (e = /^([^;]+)/.exec(n.slice(o + i.length + 1))[1]);
                } catch (e) {}
              return (void 0 === d.levels[e] && (e = void 0), e);
            }
          }
          function f(e) {
            var t = e;
            if (
              ("string" == typeof t &&
                void 0 !== d.levels[t.toUpperCase()] &&
                (t = d.levels[t.toUpperCase()]),
              "number" == typeof t && t >= 0 && t <= d.levels.SILENT)
            )
              return t;
            throw new TypeError(
              "log.setLevel() called with invalid level: " + e
            );
          }
          ("string" == typeof e
            ? (h += ":" + e)
            : "symbol" == typeof e && (h = void 0),
            (d.name = e),
            (d.levels = {
              TRACE: 0,
              DEBUG: 1,
              INFO: 2,
              WARN: 3,
              ERROR: 4,
              SILENT: 5,
            }),
            (d.methodFactory = n || l),
            (d.getLevel = function () {
              return null != u ? u : null != a ? a : s;
            }),
            (d.setLevel = function (e, n) {
              return (
                (u = f(e)),
                !1 !== n &&
                  (function (e) {
                    var n = (i[e] || "silent").toUpperCase();
                    if (typeof window !== t && h) {
                      try {
                        return void (window.localStorage[h] = n);
                      } catch (e) {}
                      try {
                        window.document.cookie =
                          encodeURIComponent(h) + "=" + n + ";";
                      } catch (e) {}
                    }
                  })(u),
                c.call(d)
              );
            }),
            (d.setDefaultLevel = function (e) {
              ((a = f(e)), v() || d.setLevel(e, !1));
            }),
            (d.resetLevel = function () {
              ((u = null),
                (function () {
                  if (typeof window !== t && h) {
                    try {
                      window.localStorage.removeItem(h);
                    } catch (e) {}
                    try {
                      window.document.cookie =
                        encodeURIComponent(h) +
                        "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                    } catch (e) {}
                  }
                })(),
                c.call(d));
            }),
            (d.enableAll = function (e) {
              d.setLevel(d.levels.TRACE, e);
            }),
            (d.disableAll = function (e) {
              d.setLevel(d.levels.SILENT, e);
            }),
            (d.rebuild = function () {
              if ((r !== d && (s = f(r.getLevel())), c.call(d), r === d))
                for (var e in o) o[e].rebuild();
            }),
            (s = f(r ? r.getLevel() : "WARN")));
          var g = v();
          (null != g && (u = f(g)), c.call(d));
        }
        (r = new d()).getLogger = function (e) {
          if (("symbol" != typeof e && "string" != typeof e) || "" === e)
            throw new TypeError(
              "You must supply a name when creating a logger."
            );
          var t = o[e];
          return (t || (t = o[e] = new d(e, r.methodFactory)), t);
        };
        var h = typeof window !== t ? window.log : void 0;
        return (
          (r.noConflict = function () {
            return (
              typeof window !== t && window.log === r && (window.log = h),
              r
            );
          }),
          (r.getLoggers = function () {
            return o;
          }),
          (r.default = r),
          r
        );
      }),
      e.exports ? (e.exports = n()) : (t.log = n()));
  }),
  cr = ar;
function ur(e) {
  var t = [
    "scene/apps/***/",
    '"rtcKey":"***"',
    '"imKey":"***"',
    '"appkey":"***"',
    '"appkey": "***"',
    'appkey:"***"',
    'appkey: "***"',
    '"appkey":***',
    '"appkey": ***',
    "appkey:***",
    "appkey: ***",
  ];
  return (
    [
      "scene/apps/[a-z0-9]{32}/",
      '"rtcKey":"[a-z0-9]{32}"',
      '"imKey":"[a-z0-9]{32}"',
      '"appkey":"[a-z0-9]{32}"',
      '"appkey": "[a-z0-9]{32}"',
      'appkey:"[a-z0-9]{32}"',
      'appkey: "[a-z0-9]{32}"',
      '"appkey":[a-z0-9]{32}',
      '"appkey": [a-z0-9]{32}',
      "appkey:[a-z0-9]{32}",
      "appkey: [a-z0-9]{32}",
    ].forEach(function (n, i) {
      var o = new RegExp(n, "gi");
      e = e.replace(o, t[i]);
    }),
    e
  );
}
var lr,
  dr = function (e) {
    var t,
      n =
        void 0 === e
          ? { appName: "", version: "", storeWindow: !1, needStringify: !0 }
          : e,
      i = n.level,
      o = n.appName,
      r = void 0 === o ? "" : o,
      s = n.storeWindow,
      a = void 0 !== s && s,
      c = n.needStringify,
      u = void 0 === c || c,
      l = function () {
        try {
          var e = navigator.userAgent.toLocaleLowerCase(),
            t = e.match(/(msie|firefox|chrome|opera|version).*?([\d.]+)/) || [];
          return { browser: t[1].replace(/version/, "safari"), ver: t[2] };
        } catch (e) {
          return null;
        }
      },
      d =
        ((t = new Proxy(cr, {
          get: function (e, t) {
            var n, i;
            if (t in e) {
              var o = e[t];
              if (
                !["log", "info", "warn", "error", "trace", "debug"].includes(t)
              )
                return o;
              var s,
                a,
                c,
                d,
                h,
                v,
                f,
                g =
                  ((s = new Date()),
                  (a = s.getFullYear()),
                  (c = s.getMonth() + 1),
                  (d = s.getDate()),
                  (h =
                    s.getHours() < 10
                      ? "0".concat(s.getHours())
                      : s.getHours()),
                  (v =
                    s.getMinutes() < 10
                      ? "0".concat(s.getMinutes())
                      : s.getMinutes()),
                  (f =
                    s.getSeconds() < 10
                      ? "0".concat(s.getSeconds())
                      : s.getSeconds()),
                  ""
                    .concat(a, "-")
                    .concat(c, "-")
                    .concat(d, " ")
                    .concat(h, ":")
                    .concat(v, ":")
                    .concat(f));
              (l() &&
                (g += "["
                  .concat(
                    null === (n = l()) || void 0 === n ? void 0 : n.browser,
                    " "
                  )
                  .concat(
                    null === (i = l()) || void 0 === i ? void 0 : i.ver,
                    "]"
                  )),
                (g +=
                  "[".concat(
                    {
                      log: "L",
                      info: "I",
                      warn: "W",
                      error: "E",
                      trace: "E",
                      debug: "D",
                    }[t],
                    "]"
                  ) +
                  "[".concat(r, "]") +
                  ":"));
              var p = this;
              return function () {
                for (var e = [], t = 0; t < arguments.length; t++)
                  e[t] = arguments[t];
                if (u)
                  for (var n = 0; n < e.length; n++) {
                    if ("object" == typeof e[n])
                      try {
                        e[n] = JSON.stringify(e[n]);
                      } catch (t) {
                        console.warn("[日志打印对象无法序列化]", e[n]);
                      }
                    "string" == typeof e[n] && (e[n] = ur(e[n]));
                  }
                return o.apply(
                  p,
                  (function (e, t, n) {
                    if (n || 2 === arguments.length)
                      for (var i, o = 0, r = t.length; o < r; o++)
                        (!i && o in t) ||
                          (i || (i = Array.prototype.slice.call(t, 0, o)),
                          (i[o] = t[o]));
                    return e.concat(i || Array.prototype.slice.call(t));
                  })(
                    [g],
                    (function (e, t) {
                      var n = "function" == typeof Symbol && e[Symbol.iterator];
                      if (!n) return e;
                      var i,
                        o,
                        r = n.call(e),
                        s = [];
                      try {
                        for (
                          ;
                          (void 0 === t || t-- > 0) && !(i = r.next()).done;
                        )
                          s.push(i.value);
                      } catch (e) {
                        o = { error: e };
                      } finally {
                        try {
                          i && !i.done && (n = r.return) && n.call(r);
                        } finally {
                          if (o) throw o.error;
                        }
                      }
                      return s;
                    })(e),
                    !1
                  )
                );
              };
            }
          },
        })),
        t);
    return (i && d.setLevel(i), a && (window.__LOGGER__ = d), d);
  };
!(function (e) {
  ((e[(e.LOW = 0)] = "LOW"),
    (e[(e.NORMAL = 1)] = "NORMAL"),
    (e[(e.HIGH = 2)] = "HIGH"));
})(lr || (lr = {}));
var hr = (function () {
    function e(e) {
      ((this.appKey = ""),
        (this.component = ""),
        (this.data = {}),
        (this.framework = ""),
        (this.version = ""),
        (this.startTime = 0),
        (this.endTime = 0),
        (this.duration = 0),
        (this.data.startTime = new Date().getTime()),
        (this.data.timeStamp = this.data.startTime),
        (this.eventId = e.eventId),
        (this.priority = e.priority));
    }
    return (
      (e.prototype.end = function () {
        (this.data.endTime && this.data.duration) ||
          ((this.data.endTime = this.data.endTime || new Date().getTime()),
          (this.data.duration =
            this.data.duration || this.data.endTime - this.data.startTime));
      }),
      (e.prototype.setAppInfo = function (e) {
        ((this.appKey = e.appKey),
          (this.component = e.component),
          (this.version = e.version),
          e.framework && (this.framework = e.framework));
      }),
      (e.prototype.endWith = function (e) {
        var t = e.code,
          n = e.msg,
          i = e.requestId,
          o = e.serverCost;
        ((this.data.code = "number" != typeof t ? -2 : t),
          (this.data.message = n),
          (this.data.requestId = i),
          (this.data.serverCost = o),
          this.end());
      }),
      (e.prototype.endWithSuccess = function (e) {
        if (e) {
          var t = e.requestId,
            n = e.serverCost;
          ((this.data.requestId = t), (this.data.serverCost = n));
        }
        ((this.data.code = 0), (this.data.message = "success"), this.end());
      }),
      (e.prototype.endWithFailure = function (e) {
        if (e) {
          var t = e.requestId,
            n = e.serverCost;
          ((this.data.requestId = t), (this.data.serverCost = n));
        }
        ((this.data.code = -1), (this.data.message = "failure"), this.end());
      }),
      (e.prototype.setParams = function (e) {
        return ((this.data.params = Zo({}, e)), this);
      }),
      (e.prototype.addParams = function (e) {
        return ((this.data.params = Zo(Zo({}, this.data.params), e)), this);
      }),
      (e.prototype.setData = function (e) {
        this.data = Zo(Zo({}, this.data), e);
      }),
      (e.prototype.setUserId = function (e) {
        this.data.userId = e;
      }),
      e
    );
  })(),
  vr = (function (e) {
    function t(t) {
      return e.call(this, t) || this;
    }
    return ($o(t, e), t);
  })(hr);
!(function (e) {
  function t(t) {
    var n = e.call(this, t) || this;
    return ((n._stepMap = new Map()), n);
  }
  ($o(t, e),
    (t.prototype.beginStep = function (e) {
      if (this._stepMap.has(e)) return this._stepMap[e];
      var t = new vr({ eventId: e, priority: this.priority });
      return (t.setData({ step: e }), this._stepMap.set(e, t), t);
    }),
    (t.prototype.addStep = function (e) {
      this._stepMap.set(e.eventId, e);
    }),
    (t.prototype.removeStep = function (e) {
      this._stepMap.delete(e);
    }),
    (t.prototype.endWith = function (t) {
      (e.prototype.endWith.call(this, t), this.end());
    }),
    (t.prototype.endWithSuccess = function (t) {
      (e.prototype.endWithSuccess.call(this, t), this.end());
    }),
    (t.prototype.endWithFailure = function (t) {
      (e.prototype.endWithFailure.call(this, t), this.end());
    }),
    (t.prototype.end = function () {
      var t,
        n,
        i = [];
      e.prototype.end.call(this);
      try {
        for (
          var o = (function (e) {
              var t = "function" == typeof Symbol && Symbol.iterator,
                n = t && e[t],
                i = 0;
              if (n) return n.call(e);
              if (e && "number" == typeof e.length)
                return {
                  next: function () {
                    return (
                      e && i >= e.length && (e = void 0),
                      { value: e && e[i++], done: !e }
                    );
                  },
                };
              throw new TypeError(
                t
                  ? "Object is not iterable."
                  : "Symbol.iterator is not defined."
              );
            })(this._stepMap.values()),
            r = o.next();
          !r.done;
          r = o.next()
        ) {
          var s = r.value;
          ((s.data.index = i.length), i.push(s.data));
        }
      } catch (e) {
        t = { error: e };
      } finally {
        try {
          r && !r.done && (n = o.return) && n.call(o);
        } finally {
          if (t) throw t.error;
        }
      }
      i.length > 0 && (this.data.steps = i);
    }));
})(vr);
var fr = "@xkit-yx/im-store-v2",
  gr = "0.8.5",
  pr = dr({ level: "debug", version: gr, appName: fr, needStringify: !1 }),
  mr = function (e, t, n) {
    var i,
      o = [],
      r = !1;
    return function (s) {
      var a = this;
      return new Promise(function (c, u) {
        var l = o.find(function (e) {
          return e.args === s;
        });
        if (
          (l
            ? l.queue.push({ resolve: c, reject: u })
            : o.push({ args: s, queue: [{ resolve: c, reject: u }] }),
          !r)
        ) {
          var d = function (t) {
            t.length &&
              ((r = !0),
              e
                .call(
                  a,
                  t.map(function (e) {
                    return e.args;
                  })
                )
                .then(function (e) {
                  for (
                    var n = function () {
                      var n = t.shift();
                      if (n) {
                        var i = e.find(function (e) {
                          return e.accountId === n.args;
                        });
                        n.queue.forEach(function (e) {
                          return e.resolve(i);
                        });
                      }
                    };
                    t.length;
                  )
                    n();
                })
                .catch(function (e) {
                  for (; t.length; ) {
                    var n = t.shift();
                    n &&
                      n.queue.forEach(function (t) {
                        return t.reject(e);
                      });
                  }
                })
                .finally(function () {
                  ((r = !1), o.length && d(o.splice(0, n)));
                }));
          };
          o.length >= n
            ? (clearTimeout(i), d(o.splice(0, n)))
            : (clearTimeout(i),
              (i = setTimeout(function () {
                d(o.splice(0, n));
              }, t)));
        }
      });
    };
  },
  yr = function (e, o) {
    return function (r) {
      for (var s = [], a = 1; a < arguments.length; a++)
        s[a - 1] = arguments[a];
      return t(this, void 0, void 0, function () {
        var t, a, c, u, l, d, h, v;
        return n(this, function (n) {
          switch (n.label) {
            case 0:
              return r.length ? [3, 2] : [4, e.apply(this, [r].concat(s))];
            case 1:
              (n.sent(), (n.label = 2));
            case 2:
              for (t = [], a = 0; a < r.length; a += o)
                t.push(r.slice(a, a + o));
              n.label = 3;
            case 3:
              (n.trys.push([3, 8, 9, 10]),
                (c = i(t)),
                (u = c.next()),
                (n.label = 4));
            case 4:
              return u.done
                ? [3, 7]
                : ((l = u.value), [4, e.apply(this, [l].concat(s))]);
            case 5:
              (n.sent(), (n.label = 6));
            case 6:
              return ((u = c.next()), [3, 4]);
            case 7:
              return [3, 10];
            case 8:
              return ((d = n.sent()), (h = { error: d }), [3, 10]);
            case 9:
              try {
                u && !u.done && (v = c.return) && v.call(c);
              } finally {
                if (h) throw h.error;
              }
              return [7];
            case 10:
              return [2];
          }
        });
      });
    };
  };
function _r(e) {
  var t, n;
  return "Web" === e
    ? "PC"
    : "H5" === e
      ? "H5"
      : "UniApp" === e
        ? null ===
            (n =
              null ===
                (t =
                  null === uni || void 0 === uni
                    ? void 0
                    : uni.getSystemInfoSync()) || void 0 === t
                ? void 0
                : t.uniPlatform) || void 0 === n
          ? void 0
          : n.toUpperCase()
        : void 0;
}
var br = Object.freeze({
    __proto__: null,
    logDebug: dr,
    logger: pr,
    frequencyControl: mr,
    getFilterMsgs: function (e, t) {
      var n = r([], o(e), !1);
      t && (n = n.filter(t));
      var i,
        s = [],
        a = [];
      return (
        n.forEach(function (e) {
          ((100 === e.messageType &&
            ["beReCallMsg", "reCallMsg"].includes(e.recallType || "")) ||
            void 0 !== i ||
            (i = e.createTime),
            100 === e.messageType &&
            ["beReCallMsg", "reCallMsg"].includes(e.recallType || "")
              ? void 0 !== i && e.createTime >= i
                ? s.push(e)
                : a.push(e)
              : s.push(e));
        }),
        !s.length && a.length ? a : s
      );
    },
    batchRequest: yr,
    detectLanguage: function () {
      var e, t;
      if ("undefined" != typeof window) {
        if (null === window || void 0 === window ? void 0 : window.__VUE__)
          return (
            null ===
              (t =
                null ===
                  (e =
                    null === window || void 0 === window
                      ? void 0
                      : window.Vue) || void 0 === e
                  ? void 0
                  : e.version) || void 0 === t
              ? void 0
              : t.startsWith("2")
          )
            ? "Vue2"
            : "Vue3";
        if (
          null === window || void 0 === window
            ? void 0
            : window.__REACT_DEVTOOLS_GLOBAL_HOOK__
        )
          return "React";
      }
      return "Vue3";
    },
    detectContainer: _r,
  }),
  Sr = (function () {
    function e(e, t) {
      (void 0 === e && (e = 20),
        void 0 === t && (t = "rightToLeft"),
        (this.itemLength = e),
        (this.flow = t),
        (this.queue = []),
        bn(this));
    }
    return (
      (e.prototype.push = function (e, t) {
        (this.queue.push(e), this._handle(t));
      }),
      (e.prototype.unshift = function (e, t) {
        (this.queue.unshift(e), this._handle(t));
      }),
      (e.prototype.pop = function () {
        return this.queue.pop();
      }),
      (e.prototype.shift = function () {
        return this.queue.shift();
      }),
      (e.prototype.resetLimitState = function () {
        this._handle();
      }),
      (e.prototype.clear = function () {
        this.queue.length = 0;
      }),
      (e.prototype.get = function () {
        return this.queue;
      }),
      (e.prototype.set = function (e, t) {
        ((this.queue = e), this._handle(t));
      }),
      Object.defineProperty(e.prototype, "length", {
        get: function () {
          return this.queue.length;
        },
        enumerable: !1,
        configurable: !0,
      }),
      (e.prototype._handle = function (e) {
        (void 0 === e && (e = !1),
          this.queue.length > this.itemLength &&
            !e &&
            ("leftToRight" === this.flow
              ? this.queue.splice(
                  this.itemLength,
                  this.queue.length - this.itemLength
                )
              : this.queue.splice(0, this.queue.length - this.itemLength)));
      }),
      e
    );
  })(),
  Mr = (function () {
    function e(e, t) {
      (void 0 === e && (e = 20),
        void 0 === t && (t = "rightToLeft"),
        (this.itemLength = e),
        (this.flow = t),
        (this.map = new Map()),
        bn(this));
    }
    return (
      (e.prototype.get = function (e) {
        var t;
        return null === (t = this.map.get(e)) || void 0 === t
          ? void 0
          : t.get();
      }),
      (e.prototype.set = function (e, t, n) {
        var i = new Sr(this.itemLength, this.flow);
        (i.set(t, n), this.map.set(e, i));
      }),
      (e.prototype.delete = function (e) {
        var t;
        return (
          null === (t = this.map.get(e)) || void 0 === t || t.clear(),
          this.map.delete(e)
        );
      }),
      (e.prototype.resetLimitState = function () {
        this.map.forEach(function (e) {
          return e.resetLimitState();
        });
      }),
      (e.prototype.clear = function () {
        (this.map.forEach(function (e) {
          return e.clear();
        }),
          this.map.clear());
      }),
      (e.prototype.values = function () {
        return r([], o(this.map.values()), !1)
          .map(function (e) {
            return e.get();
          })
          .flat();
      }),
      e
    );
  })(),
  Ar = (function () {
    function e(e) {
      (void 0 === e && (e = 20),
        (this.map = new Map()),
        (this.pinConversationLimit = 20),
        (this.pinConversationLimit = e),
        bn(this));
    }
    return (
      (e.prototype.set = function (e, t) {
        var n = this.map.get(e) || new Map();
        if (
          (this.map.has(e) && this.map.delete(e),
          t.forEach(function (e) {
            0 !== e.pinState
              ? n.set(e.messageRefer.messageClientId, e)
              : n.delete(e.messageRefer.messageClientId);
          }),
          this.map.set(e, n),
          this.map.size > this.pinConversationLimit)
        ) {
          var i = this.map.keys().next().value;
          i && this.map.delete(i);
        }
      }),
      (e.prototype.get = function (e) {
        var t = this.map.get(e);
        return t ? (this.map.delete(e), this.map.set(e, t), t) : null;
      }),
      (e.prototype.delete = function (e, t) {
        var n = this.map.get(e);
        n &&
          (this.map.delete(e),
          t.forEach(function (e) {
            n.delete(e);
          }),
          this.map.set(e, n));
      }),
      (e.prototype.clear = function () {
        this.map &&
          (this.map.forEach(function (e) {
            e.clear();
          }),
          this.map.clear());
      }),
      e
    );
  })(),
  Cr = (function () {
    function s(e, t, n) {
      ((this.rootStore = e),
        (this.nim = t),
        (this.localOptions = n),
        (this.msgs = new Mr(20, "rightToLeft")),
        (this.replyMsgs = new Map()),
        (this.logger = null),
        (this.pinMsgs = new Ar()),
        (this.collectionMsgs = new Map()),
        bn(this),
        (this.logger = e.logger),
        (this._onReceiveMessages = this._onReceiveMessages.bind(this)),
        (this._onClearHistoryNotifications =
          this._onClearHistoryNotifications.bind(this)),
        (this._onMessageDeletedNotifications =
          this._onMessageDeletedNotifications.bind(this)),
        (this._onMessagePinNotification =
          this._onMessagePinNotification.bind(this)),
        (this._onMessageQuickCommentNotification =
          this._onMessageQuickCommentNotification.bind(this)),
        (this._onMessageRevokeNotifications =
          this._onMessageRevokeNotifications.bind(this)),
        (this._onReceiveP2PMessageReadReceipts =
          this._onReceiveP2PMessageReadReceipts.bind(this)),
        (this._onReceiveTeamMessageReadReceipts =
          this._onReceiveTeamMessageReadReceipts.bind(this)),
        (this._onReceiveMessagesModified =
          this._onReceiveMessagesModified.bind(this)),
        (this.getTeamMsgReadsActive = yr(this.getTeamMsgReadsActive, 50)),
        t.V2NIMMessageService.on("onReceiveMessages", this._onReceiveMessages),
        t.V2NIMMessageService.on(
          "onClearHistoryNotifications",
          this._onClearHistoryNotifications
        ),
        t.V2NIMMessageService.on(
          "onMessageDeletedNotifications",
          this._onMessageDeletedNotifications
        ),
        t.V2NIMMessageService.on(
          "onMessagePinNotification",
          this._onMessagePinNotification
        ),
        t.V2NIMMessageService.on(
          "onMessageQuickCommentNotification",
          this._onMessageQuickCommentNotification
        ),
        t.V2NIMMessageService.on(
          "onMessageRevokeNotifications",
          this._onMessageRevokeNotifications
        ),
        t.V2NIMMessageService.on(
          "onReceiveP2PMessageReadReceipts",
          this._onReceiveP2PMessageReadReceipts
        ),
        t.V2NIMMessageService.on(
          "onReceiveTeamMessageReadReceipts",
          this._onReceiveTeamMessageReadReceipts
        ),
        t.V2NIMMessageService.on(
          "onReceiveMessagesModified",
          this._onReceiveMessagesModified
        ));
    }
    return (
      (s.prototype.resetState = function () {
        (this.msgs.clear(), this.replyMsgs.clear(), this.pinMsgs.clear());
      }),
      (s.prototype.destroy = function () {
        var e = this;
        (this.resetState(),
          this.nim.V2NIMMessageService.off(
            "onReceiveMessages",
            this._onReceiveMessages
          ),
          this.nim.V2NIMMessageService.off(
            "onClearHistoryNotifications",
            this._onClearHistoryNotifications
          ),
          this.nim.V2NIMMessageService.off(
            "onMessageDeletedNotifications",
            this._onMessageDeletedNotifications
          ),
          this.nim.V2NIMMessageService.off(
            "onMessagePinNotification",
            this._onMessagePinNotification
          ),
          this.nim.V2NIMMessageService.off(
            "onMessageQuickCommentNotification",
            this._onMessageQuickCommentNotification
          ),
          this.nim.V2NIMMessageService.off(
            "onMessageRevokeNotifications",
            this._onMessageRevokeNotifications
          ),
          this.nim.V2NIMMessageService.off(
            "onReceiveP2PMessageReadReceipts",
            this._onReceiveP2PMessageReadReceipts
          ),
          this.nim.V2NIMMessageService.off(
            "onReceiveTeamMessageReadReceipts",
            this._onReceiveTeamMessageReadReceipts
          ),
          this.getMsg().forEach(function (t) {
            e._handleClearMsgTimer(t);
          }));
      }),
      (s.prototype.replyMsgActive = function (e) {
        (null == e ? void 0 : e.conversationId) &&
          this.replyMsgs.set(e.conversationId, e);
      }),
      (s.prototype.removeReplyMsgActive = function (e) {
        this.replyMsgs.delete(e);
      }),
      (s.prototype.getReplyMsgActive = function (e) {
        var t = this.replyMsgs.get(e);
        if (t) return this.handleMsgForSDK(t);
      }),
      (s.prototype.reCallMsgActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("reCallMsgActive", e),
                  [
                    4,
                    this.nim.V2NIMMessageService.revokeMessage(
                      this.handleMsgForSDK(e)
                    ),
                  ]
                );
              case 1:
                return (
                  n.sent(),
                  this.removeMsg(e.conversationId, [e.messageClientId]),
                  (t = this._createReCallMsg(e)),
                  this.addMsg(t.conversationId, [t]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("reCallMsgActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (s = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("reCallMsgActive failed: ", e, s),
                  s
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (s.prototype.deleteMsgActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t,
            s,
            a,
            c = this;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("deleteMsgActive", e),
                  [
                    4,
                    this.nim.V2NIMMessageService.deleteMessages(
                      e.map(function (e) {
                        return c.handleMsgForSDK(e);
                      })
                    ),
                  ]
                );
              case 1:
                return (
                  n.sent(),
                  (t = e[0].conversationId) &&
                    ((s = e.map(function (e) {
                      return e.messageClientId;
                    })),
                    this.removeMsg(t, s)),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("deleteMsgActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (a = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.warn(
                      "deleteMsgActive failed, but delete msgs from memory: ",
                      e,
                      a
                    ),
                  a
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (s.prototype.replyMessageByThreadActive = function (e, i, o, r) {
        var s, a, c;
        return t(this, void 0, void 0, function () {
          var t, u;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.log("replyMessageByThreadActive", e, i),
                  [4, this.nim.V2NIMMessageService.replyMessage(e, i, r)]
                );
              case 1:
                return (
                  (t = n.sent()),
                  this.removeReplyMsgActive(o),
                  this._handleSendMsgSuccess(t.message),
                  null === (a = this.logger) ||
                    void 0 === a ||
                    a.log(
                      "replyMessageByThreadActive success",
                      { message: e, repliedMessage: i },
                      t
                    ),
                  [3, 3]
                );
              case 2:
                throw (
                  (u = n.sent()),
                  null === (c = this.logger) ||
                    void 0 === c ||
                    c.error("replyMessageByThreadActive fail", e, i),
                  (e.threadReply = i),
                  this._handleSendMsgSuccess(e),
                  u
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (s.prototype.sendMessageActive = function (i) {
        var o, r, s, a, c, u, l, d, h;
        return t(this, void 0, void 0, function () {
          var t,
            v,
            f,
            g,
            p,
            m,
            y,
            _,
            b,
            S,
            M,
            A,
            C,
            I,
            T,
            w,
            O,
            R = this;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                (null === (o = this.logger) ||
                  void 0 === o ||
                  o.log("sendMessageActive", i),
                  (t = i.msg),
                  (v = i.conversationId),
                  (f = i.conversationType),
                  (g = i.progress),
                  (p = i.sendBefore),
                  (m = i.serverExtension),
                  (y = i.previewImg),
                  (_ = i.onAISend),
                  (b = e({}, t)),
                  (S = {}),
                  (S = (
                    null === (r = this.localOptions) || void 0 === r
                      ? void 0
                      : r.sendReplyMsgByExt
                  )
                    ? this._formatExtField(
                        v,
                        m || JSON.parse(b.serverExtension || "{}")
                      )
                    : m || JSON.parse(b.serverExtension || "{}")),
                  (b.serverExtension = Object.keys(S).length
                    ? JSON.stringify(S)
                    : void 0),
                  (b.senderId = this.rootStore.userStore.myUserInfo.accountId),
                  (b.receiverId =
                    this.nim.V2NIMConversationIdUtil.parseConversationTargetId(
                      v
                    )),
                  (b.conversationId = v),
                  void 0 !== f && (b.conversationType = f),
                  (M = this.getReplyMsgActive(v)) &&
                    0 === b.messageType &&
                    (b.threadReply = M),
                  (b.sendingState = 3),
                  y && (b.previewImg = y),
                  g && (b.uploadProgress = 0),
                  (n.label = 1));
              case 1:
                return (
                  n.trys.push([1, 6, , 7]),
                  [
                    4,
                    null === (a = (s = this.localOptions).sendMsgBefore) ||
                    void 0 === a
                      ? void 0
                      : a.call(s, i),
                  ]
                );
              case 2:
                return !1 === (A = n.sent())
                  ? (null === (c = this.logger) ||
                      void 0 === c ||
                      c.log("sendMessageActive cancel", i, A),
                    [2])
                  : ((C = this._getAIConfig(b)),
                    this.addMsg(b.conversationId, [b]),
                    null == p || p(b),
                    (I =
                      C || (null == A ? void 0 : A.aiConfig)
                        ? e(e({}, C), null == A ? void 0 : A.aiConfig)
                        : void 0),
                    (T = e(e({}, A), {
                      pushConfig:
                        (null == A ? void 0 : A.pushConfig) ||
                        ((null == S ? void 0 : S.yxAitMsg)
                          ? this._formatExtAitToPushInfo(
                              S.yxAitMsg,
                              b.text || ""
                            )
                          : void 0),
                      messageConfig: e(
                        { readReceiptEnabled: !0 },
                        null == A ? void 0 : A.messageConfig
                      ),
                      aiConfig: I,
                    })),
                    null === (u = this.logger) ||
                      void 0 === u ||
                      u.log("sendMessageActive finalParams: ", b, v, T),
                    !M ||
                    (null === (l = this.localOptions) || void 0 === l
                      ? void 0
                      : l.sendReplyMsgByExt) ||
                    0 !== b.messageType
                      ? [3, 4]
                      : ((b.serverExtension = Object.keys(S).length
                          ? JSON.stringify(S)
                          : void 0),
                        [4, this.replyMessageByThreadActive(b, M, v, T)]));
              case 3:
                return (n.sent(), null == p || p(b), [2]);
              case 4:
                return [
                  4,
                  this.nim.V2NIMMessageService.sendMessage(
                    b,
                    v,
                    T,
                    function (t) {
                      if (null == g ? void 0 : g(t)) {
                        var n = R.getMsg(v, [b.messageClientId])[0];
                        n && R.addMsg(v, [e(e({}, n), { uploadProgress: t })]);
                      }
                    }
                  ),
                ];
              case 5:
                return (
                  (w = n.sent().message),
                  I && (null == _ || _(w, I)),
                  (6 !== t.messageType &&
                    1 !== t.messageType &&
                    3 !== t.messageType) ||
                    (w.uploadProgress = 100),
                  this._handleSendMsgSuccess(w),
                  null === (d = this.logger) ||
                    void 0 === d ||
                    d.log("sendMessageActive success", w),
                  0 === b.messageType && this.removeReplyMsgActive(v),
                  [2, w]
                );
              case 6:
                throw (
                  (O = n.sent()),
                  null === (h = this.logger) ||
                    void 0 === h ||
                    h.error("sendMessageActive failed: ", O.toString(), b),
                  191002 === O.code
                    ? this.removeMsg(v, [b.messageClientId])
                    : this._handleSendMsgFail(b, O.code),
                  0 === b.messageType && this.removeReplyMsgActive(v),
                  O
                );
              case 7:
                return [2];
            }
          });
        });
      }),
      (s.prototype.cancelMessageAttachmentUploadActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("cancelMessageAttachmentUploadActive", e),
                  [
                    4,
                    this.nim.V2NIMMessageService.cancelMessageAttachmentUpload(
                      this.handleMsgForSDK(e)
                    ),
                  ]
                );
              case 1:
                return (
                  n.sent(),
                  this.removeMsg(e.conversationId, [e.messageClientId]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("cancelMessageAttachmentUploadActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error(
                      "cancelMessageAttachmentUploadActive failed: ",
                      e,
                      t
                    ),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (s.prototype.sendMsgReceiptActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("sendMsgReceiptActive", e),
                  [
                    4,
                    this.nim.V2NIMMessageService.sendP2PMessageReceipt(
                      this.handleMsgForSDK(e)
                    ),
                  ]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("sendMsgReceiptActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("sendMsgReceiptActive failed: ", e, t.toString()),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (s.prototype.addCollectionActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("addCollectionActive", e),
                  [4, this.nim.V2NIMMessageService.addCollection(e)]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("addCollectionActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("addCollectionActive failed: ", e, t.toString()),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (s.prototype.removeCollectionsActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("removeCollectionsActive", e),
                  [4, this.nim.V2NIMMessageService.removeCollections(e)]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("removeCollectionsActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error(
                      "removeCollectionsActive failed: ",
                      e,
                      t.toString()
                    ),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (s.prototype.getCollectionListByOptionActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t,
            s,
            a = this;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                ((t = []), (n.label = 1));
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("getCollectionListByOptionActive", e),
                  [4, this.nim.V2NIMMessageService.getCollectionListByOption(e)]
                );
              case 2:
                return (
                  (t = n.sent()).forEach(function (e) {
                    var t = JSON.parse(e.collectionData),
                      n = a.nim.V2NIMMessageConverter.messageDeserialization(
                        t.message
                      );
                    n && a.collectionMsgs.set(n.messageClientId, n);
                  }),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getCollectionListByOptionActive success", e),
                  [3, 4]
                );
              case 3:
                throw (
                  (s = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error(
                      "getCollectionListByOptionActive failed: ",
                      e,
                      s.toString()
                    ),
                  s
                );
              case 4:
                return [2, t];
            }
          });
        });
      }),
      (s.prototype.sendTeamMsgReceiptActive = function (e) {
        var i, o, r, s;
        return t(this, void 0, void 0, function () {
          var t,
            a,
            c = this;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 3, , 4]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("sendTeamMsgReceiptActive", e),
                  e.length
                    ? ((t = e.map(function (e) {
                        return c.handleMsgForSDK(e);
                      })),
                      null === (o = this.logger) ||
                        void 0 === o ||
                        o.log("sendTeamMsgReceiptActive finalParams: ", t),
                      [
                        4,
                        this.nim.V2NIMMessageService.sendTeamMessageReceipts(t),
                      ])
                    : [3, 2]
                );
              case 1:
                (n.sent(), (n.label = 2));
              case 2:
                return (
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log("sendTeamMsgReceiptActive success", e),
                  [3, 4]
                );
              case 3:
                throw (
                  (a = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error(
                      "sendTeamMsgReceiptActive failed: ",
                      e,
                      a.toString()
                    ),
                  a
                );
              case 4:
                return [2];
            }
          });
        });
      }),
      (s.prototype.getTeamMessageReceiptDetailsActive = function (e, i) {
        var o, r, s;
        return t(this, void 0, void 0, function () {
          var t, a;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getTeamMessageReceiptDetailsActive", e, i),
                  [
                    4,
                    this.nim.V2NIMMessageService.getTeamMessageReceiptDetail(
                      e,
                      i
                    ),
                  ]
                );
              case 1:
                return (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log(
                      "getTeamMessageReceiptDetailsActive success:",
                      e,
                      i,
                      t
                    ),
                  [2, t]
                );
              case 2:
                throw (
                  (a = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error(
                      "getTeamMessageReceiptDetailsActive failed: ",
                      e,
                      i,
                      a.toString()
                    ),
                  a
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (s.prototype.getHistoryMsgActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s, a, c, u, l, d, h, v, f, g;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 4, , 5]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("getHistoryMsgActive", e),
                  (t = e.conversationId),
                  (s = e.endTime),
                  (a = e.lastMsgId),
                  (c = e.limit),
                  (u = void 0 === c ? 100 : c),
                  (l =
                    this.nim.V2NIMConversationIdUtil.parseConversationType(t)),
                  (d = { conversationId: t, endTime: s, limit: u }),
                  a && (h = this.getMsg(t, [a])[0]) && (d.anchorMessage = h),
                  [4, this.nim.V2NIMMessageService.getMessageList(d)]
                );
              case 1:
                return (
                  (v = n.sent()),
                  this.addMsg(t, v),
                  2 === l && this.rootStore.localOptions.teamMsgReceiptVisible
                    ? ((f = v
                        .filter(function (e) {
                          return e.isSelf;
                        })
                        .filter(function (e) {
                          return ![5, 10].includes(e.messageType);
                        })),
                      [4, this.getTeamMsgReadsActive(f, t)])
                    : [3, 3]
                );
              case 2:
                (n.sent(), (n.label = 3));
              case 3:
                return (
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getHistoryMsgActive success", e, d, v),
                  [2, v]
                );
              case 4:
                throw (
                  (g = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("getHistoryMsgActive failed: ", e, g.toString()),
                  g
                );
              case 5:
                return [2];
            }
          });
        });
      }),
      (s.prototype.forwardMsgActive = function (i, o, r) {
        var s, a, c, u;
        return t(this, void 0, void 0, function () {
          var t, l, d, h, v;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                if (
                  (n.trys.push([0, 5, , 6]),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.log("forwardMsgActive", i, o, r),
                  (t = null == i ? void 0 : i.serverExtension))
                )
                  try {
                    (delete (t = JSON.parse(t)).yxReplyMsg,
                      delete t.yxAitMsg,
                      (t = JSON.stringify(t)));
                  } catch (e) {}
                return (
                  ["canRecall", "reCallTimer", "yxUnread", "yxRead"].forEach(
                    function (e) {
                      delete i[e];
                    }
                  ),
                  "" ===
                    (null === (a = i.pushConfig) || void 0 === a
                      ? void 0
                      : a.pushContent) && delete i.pushConfig.pushContent,
                  (l = this.handleMsgForSDK(
                    e(e({}, i), { serverExtension: t })
                  )),
                  (d = this.nim.V2NIMMessageCreator.createForwardMessage(l))
                    ? [4, this.sendMessageActive({ msg: d, conversationId: o })]
                    : [3, 2]
                );
              case 1:
                (n.sent(), (n.label = 2));
              case 2:
                return r
                  ? ((h = this.nim.V2NIMMessageCreator.createTextMessage(r)),
                    [4, this.sendMessageActive({ msg: h, conversationId: o })])
                  : [3, 4];
              case 3:
                (n.sent(), (n.label = 4));
              case 4:
                return (
                  null === (c = this.logger) ||
                    void 0 === c ||
                    c.log("forwardMsgActive success", i, o, r),
                  [3, 6]
                );
              case 5:
                throw (
                  (v = n.sent()),
                  null === (u = this.logger) ||
                    void 0 === u ||
                    u.error("forwardMsgActive failed: ", v),
                  v
                );
              case 6:
                return [2];
            }
          });
        });
      }),
      (s.prototype.getTeamMsgReadsActive = function (e, i) {
        var o, r;
        return t(this, void 0, void 0, function () {
          var t,
            s,
            a,
            c = this;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                if (
                  (null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getTeamMsgReadsActive", e, i),
                  (t = []),
                  !e.length)
                )
                  return [3, 4];
                n.label = 1;
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  [
                    4,
                    this.nim.V2NIMMessageService.getTeamMessageReceipts(
                      e.map(function (e) {
                        return c.handleMsgForSDK(e);
                      })
                    ),
                  ]
                );
              case 2:
                return ((t = n.sent()), [3, 4]);
              case 3:
                return (
                  (s = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.warn(
                      "getTeamMsgReadsActive failed but continue: ",
                      s.toString()
                    ),
                  [3, 4]
                );
              case 4:
                return (
                  (a = e
                    .filter(function (e) {
                      return t.some(function (t) {
                        return e.messageClientId === t.messageClientId;
                      });
                    })
                    .map(function (e) {
                      var n = t.find(function (t) {
                        return t.messageClientId === e.messageClientId;
                      });
                      return n
                        ? c._updateReceiptMsg(e, {
                            unread: n.unreadCount,
                            read: n.readCount,
                          })
                        : e;
                    })),
                  this.addMsg(i, a),
                  [2]
                );
            }
          });
        });
      }),
      (s.prototype.pinMessageActive = function (e, i) {
        var o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                (null === (o = this.logger) ||
                  void 0 === o ||
                  o.log("pinMessageActive", e, i),
                  (n.label = 1));
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  [4, this.nim.V2NIMMessageService.pinMessage(e, i)]
                );
              case 2:
                return (n.sent(), [3, 4]);
              case 3:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.warn(
                      "pinMessageActive failed but continue: ",
                      t.toString()
                    ),
                  t
                );
              case 4:
                return [2];
            }
          });
        });
      }),
      (s.prototype.unpinMessageActive = function (e, i) {
        var o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                (null === (o = this.logger) ||
                  void 0 === o ||
                  o.log("uppinMessageActive", e, i),
                  (n.label = 1));
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  [4, this.nim.V2NIMMessageService.unpinMessage(e, i)]
                );
              case 2:
                return (n.sent(), [3, 4]);
              case 3:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.warn(
                      "uppinMessageActive failed but continue: ",
                      t.toString()
                    ),
                  t
                );
              case 4:
                return [2];
            }
          });
        });
      }),
      (s.prototype.updatePinMessageActive = function (e, i) {
        var o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                (null === (o = this.logger) ||
                  void 0 === o ||
                  o.log("updatePinMessageActive", e, i),
                  (n.label = 1));
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  [4, this.nim.V2NIMMessageService.updatePinMessage(e, i)]
                );
              case 2:
                return (n.sent(), [3, 4]);
              case 3:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.warn(
                      "updatePinMessageActive failed but continue: ",
                      t.toString()
                    ),
                  t
                );
              case 4:
                return [2];
            }
          });
        });
      }),
      (s.prototype.getPinnedMessageListActive = function (e) {
        return t(this, void 0, void 0, function () {
          var t, i;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  (t = this.pinMsgs.get(e)),
                  (i = []),
                  t ? ((i = r([], o(t.values()), !1)), [3, 3]) : [3, 1]
                );
              case 1:
                return [4, this._getPinnedMessageListByServer(e)];
              case 2:
                ((i = n.sent()), (n.label = 3));
              case 3:
                return [4, this.completePinnedMessageList(e, i)];
              case 4:
                return [
                  2,
                  (i = (i = n.sent())
                    .filter(function (e) {
                      return e.pinState > 0 && e.message;
                    })
                    .sort(function (e, t) {
                      return t.message.createTime - e.message.createTime;
                    })),
                ];
            }
          });
        });
      }),
      (s.prototype.stopAIStreamMessageActive = function (e, i) {
        var o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                (null === (o = this.logger) ||
                  void 0 === o ||
                  o.log("stopAIStreamMessageActive", e),
                  (n.label = 1));
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  [4, this.nim.V2NIMMessageService.stopAIStreamMessage(e, i)]
                );
              case 2:
                return (n.sent(), [3, 4]);
              case 3:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("stopAIStreamMessageActive failed ", t.toString()),
                  t
                );
              case 4:
                return [2];
            }
          });
        });
      }),
      (s.prototype.regenAIMessageActive = function (e, i) {
        var o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                (null === (o = this.logger) ||
                  void 0 === o ||
                  o.log("regenAIMessageActive", e),
                  (n.label = 1));
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  [4, this.nim.V2NIMMessageService.regenAIMessage(e, i)]
                );
              case 2:
                return (n.sent(), [3, 4]);
              case 3:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("regenAIMessageActive failed ", t.toString()),
                  t
                );
              case 4:
                return [2];
            }
          });
        });
      }),
      (s.prototype.voiceToTextActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                if (e.textOfVoice) return [2];
                if (!e.attachment) return [2];
                if (!("url" in e.attachment)) return [2];
                if (!e.attachment.url) return [2];
                if (!("duration" in e.attachment)) return [2];
                if (!e.attachment.duration) return [2];
                (null === (i = this.logger) ||
                  void 0 === i ||
                  i.log("voiceToTextActive", e),
                  (n.label = 1));
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  [
                    4,
                    this.nim.V2NIMMessageService.voiceToText({
                      voiceUrl: e.attachment.url,
                      duration: e.attachment.duration,
                      sceneName: e.attachment.sceneName,
                      mimeType: "aac",
                      sampleRate: "16000",
                    }),
                  ]
                );
              case 2:
                if (!(t = n.sent())) throw new Error("voiceToText empty");
                return (
                  this.updateMsg(e.conversationId, e.messageClientId, {
                    textOfVoice: t,
                  }),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("voiceToTextActive success", t),
                  [3, 4]
                );
              case 3:
                throw (
                  (s = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.warn("voiceToTextActive failed: ", s.toString()),
                  s
                );
              case 4:
                return [2];
            }
          });
        });
      }),
      (s.prototype.addMsg = function (t, n) {
        var i = this,
          s = this.msgs.get(t) || [],
          a = this.pinMsgs.get(t);
        (n
          .filter(function (e) {
            return !!e.messageClientId;
          })
          .map(function (e) {
            return (
              (e = i.handleReceiveAIMsg(e)),
              a && (e = i.handleMsgPinState(e, a)),
              e
            );
          })
          .forEach(function (t) {
            var n = e({}, t),
              i = s.find(function (e) {
                return e.messageClientId === n.messageClientId;
              });
            i
              ? (i.createTime <= n.createTime || 3 === i.sendingState) &&
                (void 0 !== i.canRecall &&
                  void 0 !== i.reCallTimer &&
                  ((n.canRecall = i.canRecall),
                  (n.reCallTimer = i.reCallTimer)),
                i.textOfVoice && (n.textOfVoice = i.textOfVoice),
                s.splice(s.indexOf(i), 1, n))
              : s.push(t);
          }),
          this.msgs.set(
            t,
            r([], o(s), !1).sort(function (e, t) {
              return e.createTime - t.createTime;
            }),
            this.rootStore.uiStore.selectedConversation === t
          ));
      }),
      (s.prototype.removeMsg = function (e, t) {
        var n = this;
        if (!e)
          return (
            this.getMsg().forEach(function (e) {
              n._handleClearMsgTimer(e);
            }),
            void this.msgs.clear()
          );
        var i = this.msgs.get(e);
        return i
          ? t && t.length
            ? void this.msgs.set(
                e,
                i.filter(function (e) {
                  var i =
                    t.includes(e.messageClientId) &&
                    !(100 === e.messageType && "beReCallMsg" === e.recallType);
                  return (i && n._handleClearMsgTimer(e), !i);
                }),
                this.rootStore.uiStore.selectedConversation === e
              )
            : (i.forEach(function (e) {
                n._handleClearMsgTimer(e);
              }),
              void this.msgs.delete(e))
          : void 0;
      }),
      (s.prototype.deletePinInfoByMessageClientId = function (e, t) {
        var n;
        (null === (n = this.logger) ||
          void 0 === n ||
          n.log("deletePinInfoByMessageClientId", e, t),
          this.pinMsgs.delete(e, t));
      }),
      (s.prototype.getMsg = function (e, t) {
        if (!e) return this.msgs.values();
        var n = this.msgs.get(e) || [];
        return t && t.length
          ? n.filter(function (e) {
              return t.includes(e.messageClientId);
            })
          : n;
      }),
      (s.prototype.updateMsg = function (t, n, i) {
        var o = this.msgs.get(t);
        o &&
          o.findIndex(function (e) {
            return e.messageClientId === n;
          }) &&
          this.msgs.set(
            t,
            o.map(function (t) {
              return (t.messageClientId === n && (t = e(e({}, t), i)), t);
            }),
            this.rootStore.uiStore.selectedConversation === t
          );
      }),
      (s.prototype.handleReceiveAIMsg = function (t) {
        var n = this.rootStore.userStore.myUserInfo.accountId,
          i = t.aiConfig,
          o = (i && 2 === i.aiStatus ? i.accountId : t.senderId) === n;
        return e(e({}, t), {
          __kit__isSelf: t.isSelf,
          __kit__senderId: t.senderId,
          isSelf: o,
        });
      }),
      (s.prototype.handleMsgPinState = function (e, t) {
        var n = t.get(e.messageClientId);
        return (
          n && ((e.pinState = n.pinState), (e.operatorId = n.operatorId)),
          e
        );
      }),
      (s.prototype.handleMsgForSDK = function (t) {
        var n = t.__kit__isSelf,
          i = t.__kit__senderId,
          o = (function (e, t) {
            var n = {};
            for (var i in e)
              Object.prototype.hasOwnProperty.call(e, i) &&
                t.indexOf(i) < 0 &&
                (n[i] = e[i]);
            if (
              null != e &&
              "function" == typeof Object.getOwnPropertySymbols
            ) {
              var o = 0;
              for (i = Object.getOwnPropertySymbols(e); o < i.length; o++)
                t.indexOf(i[o]) < 0 &&
                  Object.prototype.propertyIsEnumerable.call(e, i[o]) &&
                  (n[i[o]] = e[i[o]]);
            }
            return n;
          })(t, ["__kit__isSelf", "__kit__senderId"]),
          r = t.senderId,
          s = t.isSelf;
        return (
          n && (s = n),
          i && (r = i),
          e(e({}, o), { senderId: r, isSelf: s })
        );
      }),
      (s.prototype._getMessageListByRefer = function (e) {
        var i;
        return t(this, void 0, void 0, function () {
          var t, o;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                ((t = []), (n.label = 1));
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  [4, this.nim.V2NIMMessageService.getMessageListByRefers(e)]
                );
              case 2:
                return ((t = n.sent()), [3, 4]);
              case 3:
                return (
                  (o = n.sent()),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.warn(
                      "_getMessageListByRefer failed but continue: ",
                      o.toString()
                    ),
                  [3, 4]
                );
              case 4:
                return [2, t];
            }
          });
        });
      }),
      (s.prototype._getPinnedMessageListByServer = function (i) {
        var o, r;
        return t(this, void 0, void 0, function () {
          var t, s, a;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                (null === (o = this.logger) ||
                  void 0 === o ||
                  o.log("_getPinnedMessageListByServer", i),
                  (t = []),
                  (s = []),
                  (n.label = 1));
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  [4, this.nim.V2NIMMessageService.getPinnedMessageList(i)]
                );
              case 2:
                return ((t = n.sent()), [3, 4]);
              case 3:
                return (
                  (a = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.warn(
                      "_getPinnedMessageListByServer failed but continue: ",
                      a.toString()
                    ),
                  [3, 4]
                );
              case 4:
                return (
                  t.forEach(function (t) {
                    s.push(e({ pinState: 1 }, t));
                  }),
                  this.pinMsgs.set(i, s),
                  s.length && this._updateMsgsPinState(i, s),
                  [2, s]
                );
            }
          });
        });
      }),
      (s.prototype.completePinnedMessageList = function (i, o) {
        return t(this, void 0, void 0, function () {
          var t, r;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  (t = []),
                  o.length
                    ? ((r = []),
                      o.forEach(function (e) {
                        e.message || r.push(e.messageRefer);
                      }),
                      r.length ? [4, this._getMessageListByRefer(r)] : [2, o])
                    : [2, o]
                );
              case 1:
                return (
                  (t = n.sent()).length &&
                    ((o = o.map(function (n) {
                      var i = t.find(function (e) {
                        return (
                          e.messageClientId === n.messageRefer.messageClientId
                        );
                      });
                      return (i && (n = e(e({}, n), { message: i })), n);
                    })),
                    this.pinMsgs.set(i, o)),
                  [2, o]
                );
            }
          });
        });
      }),
      (s.prototype._handleSendMsgSuccess = function (e) {
        e && e.conversationId && this.addMsg(e.conversationId, [e]);
      }),
      (s.prototype._handleSendMsgFail = function (t, n) {
        if (t && t.conversationId) {
          var i = this.getMsg(t.conversationId, [t.messageClientId])[0];
          (this._handleClearMsgTimer(i),
            this.addMsg(t.conversationId, [
              e(e(e({}, i), t), {
                messageStatus: { errorCode: n },
                uploadProgress: void 0,
                sendingState: 2,
                errorCode: n,
              }),
            ]));
        }
      }),
      (s.prototype._handleClearMsgTimer = function (e) {
        e && (clearTimeout(e.canEditTimer), clearTimeout(e.reCallTimer));
      }),
      (s.prototype._onReceiveMessages = function (e) {
        var t,
          n,
          i,
          o,
          r = this;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onReceiveMessages: ", e),
          e.forEach(function (e) {
            r.addMsg(e.conversationId, [e]);
          }),
          (
            null === (n = this.rootStore.sdkOptions) || void 0 === n
              ? void 0
              : n.enableV2CloudConversation
          )
            ? null === (i = this.rootStore.conversationStore) ||
              void 0 === i ||
              i.handleConversationWithAit(e)
            : null === (o = this.rootStore.localConversationStore) ||
              void 0 === o ||
              o.handleConversationWithAit(e));
      }),
      (s.prototype._onReceiveMessagesModified = function (e) {
        var t,
          n = this;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onReceiveMessagesModified: ", e),
          e.forEach(function (e) {
            n.addMsg(e.conversationId, [e]);
          }));
      }),
      (s.prototype._onClearHistoryNotifications = function (e) {
        var t,
          n = this;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onClearHistory: ", e),
          e.forEach(function (e) {
            n.removeMsg(e.conversationId);
          }));
      }),
      (s.prototype._onMessageDeletedNotifications = function (e) {
        var t,
          n = this;
        null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onMessageDeletedNotifications: ", e);
        var i = {};
        (e.forEach(function (e) {
          var t = e.messageRefer.conversationId;
          i[t] ? i[t].push(e) : (i[t] = [e]);
        }),
          Object.keys(i).forEach(function (e) {
            var t = i[e].map(function (e) {
              return e.messageRefer.messageClientId;
            });
            (n.removeMsg(e, t), n.deletePinInfoByMessageClientId(e, t));
          }));
      }),
      (s.prototype._onMessagePinNotification = function (e) {
        var t = this,
          n = e.pin,
          i = n.operatorId,
          o = n.messageRefer,
          r = n.serverExtension,
          s = n.createTime,
          a = n.updateTime,
          c = this.pinMsgs.get(o.conversationId);
        if (c) {
          var u = e.pinState,
            l = null == c ? void 0 : c.get(o.messageClientId),
            d = [
              {
                pinState: u,
                messageRefer: o,
                operatorId: i,
                serverExtension: r,
                createTime: (null == l ? void 0 : l.createTime) || s,
                updateTime: a,
              },
            ];
          this.completePinnedMessageList(o.conversationId, d).then(
            function (e) {
              t._updateMsgsPinState(o.conversationId, e);
            }
          );
        }
      }),
      (s.prototype._updateMsgsPinState = function (t, n) {
        var i = this.getMsg(t) || [],
          o = !1;
        (n.forEach(function (t) {
          var n = i.find(function (e) {
            return e.messageClientId === t.messageRefer.messageClientId;
          });
          if (n && n.pinState !== t.pinState) {
            var r = e({}, n);
            ((r.pinState = t.pinState),
              (r.operatorId = t.operatorId),
              i.splice(i.indexOf(n), 1, r),
              (o = !0));
          }
        }),
          o &&
            this.msgs.set(
              t,
              i,
              this.rootStore.uiStore.selectedConversation === t
            ));
      }),
      (s.prototype._onMessageQuickCommentNotification = function () {}),
      (s.prototype._onMessageRevokeNotifications = function (i) {
        var o;
        return t(this, void 0, void 0, function () {
          var r = this;
          return n(this, function (s) {
            return (
              null === (o = this.logger) ||
                void 0 === o ||
                o.log("_onMessageRevokeNotifications: ", i),
              i.forEach(function (i) {
                return t(r, void 0, void 0, function () {
                  var t, o, r, s, a, c, u, l, d, h, v, f, g;
                  return n(this, function (n) {
                    return (
                      ((t = this.getMsg(i.messageRefer.conversationId, [
                        i.messageRefer.messageClientId,
                      ])[0]) &&
                        t.recallType) ||
                        ((o = i.messageRefer.conversationId),
                        (r = [i.messageRefer.messageClientId]),
                        this.removeMsg(o, r),
                        this.deletePinInfoByMessageClientId(o, r),
                        (s = this._createBeReCallMsg(i)),
                        this.addMsg(s.conversationId, [s]),
                        2 === i.messageRefer.conversationType &&
                          (a = (
                            null === (l = this.rootStore.sdkOptions) ||
                            void 0 === l
                              ? void 0
                              : l.enableV2CloudConversation
                          )
                            ? null === (d = this.rootStore.conversationStore) ||
                              void 0 === d
                              ? void 0
                              : d.conversations.get(o)
                            : null ===
                                  (h = this.rootStore.localConversationStore) ||
                                void 0 === h
                              ? void 0
                              : h.conversations.get(o)) &&
                          ((c = a.aitMsgs || []),
                          (u = i.messageRefer.messageClientId),
                          c.includes(u) &&
                            ((c = c.filter(function (e) {
                              return e !== u;
                            })),
                            (
                              null === (v = this.rootStore.sdkOptions) ||
                              void 0 === v
                                ? void 0
                                : v.enableV2CloudConversation
                            )
                              ? null ===
                                  (f = this.rootStore.conversationStore) ||
                                void 0 === f ||
                                f.updateConversation([
                                  e(e({}, a), { aitMsgs: c }),
                                ])
                              : null ===
                                  (g = this.rootStore.localConversationStore) ||
                                void 0 === g ||
                                g.updateConversation([
                                  e(e({}, a), { aitMsgs: c }),
                                ])))),
                      [2]
                    );
                  });
                });
              }),
              [2]
            );
          });
        });
      }),
      (s.prototype._onReceiveP2PMessageReadReceipts = function (t) {
        var n,
          i = this;
        (null === (n = this.logger) ||
          void 0 === n ||
          n.log("_onReceiveP2PMessageReadReceipts: ", t),
          t.forEach(function (t) {
            var n,
              o,
              r,
              s,
              a,
              c,
              u = (
                null === (n = i.rootStore.sdkOptions) || void 0 === n
                  ? void 0
                  : n.enableV2CloudConversation
              )
                ? null === (o = i.rootStore.conversationStore) || void 0 === o
                  ? void 0
                  : o.conversations.get(t.conversationId)
                : null === (r = i.rootStore.localConversationStore) ||
                    void 0 === r
                  ? void 0
                  : r.conversations.get(t.conversationId);
            u &&
              t.timestamp > (u.msgReceiptTime || 0) &&
              ((
                null === (s = i.rootStore.sdkOptions) || void 0 === s
                  ? void 0
                  : s.enableV2CloudConversation
              )
                ? null === (a = i.rootStore.conversationStore) ||
                  void 0 === a ||
                  a.updateConversation([
                    e(e({}, u), { msgReceiptTime: t.timestamp }),
                  ])
                : null === (c = i.rootStore.localConversationStore) ||
                  void 0 === c ||
                  c.updateConversation([
                    e(e({}, u), { msgReceiptTime: t.timestamp }),
                  ]));
          }));
      }),
      (s.prototype._onReceiveTeamMessageReadReceipts = function (e) {
        var t,
          n = this;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onReceiveTeamMessageReadReceipts: ", e),
          e.sort(function (e, t) {
            return e.readCount - t.readCount;
          }),
          e.forEach(function (e) {
            var t = e.conversationId,
              i = n.getMsg(t, [e.messageClientId])[0];
            if (i) {
              var o = n._updateReceiptMsg(i, {
                unread: e.unreadCount,
                read: e.readCount,
              });
              n.addMsg(t, [o]);
            }
          }));
      }),
      (s.prototype._formatExtField = function (e, t) {
        var n = t || {},
          i = this.getReplyMsgActive(e);
        return (
          i &&
            (n.yxReplyMsg = {
              idClient: i.messageClientId,
              scene: i.conversationType,
              from: i.senderId,
              receiverId: i.receiverId,
              to: i.conversationId,
              idServer: i.messageServerId,
              time: i.createTime,
            }),
          n
        );
      }),
      (s.prototype._updateReceiptMsg = function (t, n) {
        return e(e({}, t), {
          yxUnread: Number(n.unread),
          yxRead: Number(n.read),
        });
      }),
      (s.prototype._formatExtAitToPushInfo = function (e, t) {
        var n;
        return {
          forcePushAccountIds:
            ((n = e), Object.keys(n).includes(Ai) ? void 0 : Object.keys(n)),
          forcePush: !0,
          forcePushContent: t,
        };
      }),
      (s.prototype._createReCallMsg = function (t) {
        var n = this,
          i = e(e({}, t), {
            isSelf: !0,
            sendingState: 1,
            messageType: 100,
            recallType: "reCallMsg",
            messageClientId: "recall-".concat(t.messageClientId),
          });
        return (
          [100, 0].includes(t.messageType) &&
            ((i.oldText = t.text),
            (i.canEdit = !0),
            (i.isRecallMsg = !0),
            (i.canEditTimer = setTimeout(function () {
              var t = n.getMsg(i.conversationId, [i.messageClientId])[0];
              t && n.addMsg(t.conversationId, [e(e({}, t), { canEdit: !1 })]);
            }, Ci))),
          i
        );
      }),
      (s.prototype._createBeReCallMsg = function (t) {
        return e(e({}, t.messageRefer), {
          isSelf:
            t.messageRefer.senderId ===
            this.rootStore.userStore.myUserInfo.accountId,
          sendingState: 1,
          messageType: 100,
          recallType: "beReCallMsg",
          messageClientId: "recall-".concat(t.messageRefer.messageClientId),
        });
      }),
      (s.prototype._getAIConfig = function (e) {
        var t,
          n,
          i = this,
          o = e.serverExtension,
          r = e.conversationId,
          s = e.receiverId,
          a = e.messageType,
          c = e.text,
          u = void 0 === c ? "" : c;
        try {
          n = JSON.parse(o || "{}");
        } catch (e) {
          n = {};
        }
        var l = n.yxAitMsg || {},
          d = this.getReplyMsgActive(r),
          h = this.rootStore.uiStore.getRelation(s).relation,
          v = this.rootStore.userStore.myUserInfo.accountId,
          f = void 0;
        if ("ai" === h)
          if (0 === a) {
            var g = (this.msgs.get(r) || []).slice(-30).filter(function (e) {
                return 0 === e.messageType;
              }),
              p = g.findIndex(function (e) {
                return e.senderId === v;
              });
            f = {
              accountId: s,
              content: { msg: u, type: 0 },
              messages: (g = -1 === p ? [] : g.slice(p)).map(function (e) {
                return {
                  role: e.senderId === v ? "user" : "assistant",
                  msg: e.text || "",
                  type: 0,
                };
              }),
            };
          } else f = { accountId: s };
        var m = {};
        Object.keys(l).forEach(function (e) {
          i.rootStore.aiUserStore.aiUsers.has(e) && (m[e] = l[e]);
        });
        var y = this._findMinStart(m),
          _ = this.rootStore.aiUserStore.aiUsers.get(y || "");
        return (
          _ && (f = { accountId: _.accountId, content: { msg: u, type: 0 } }),
          d &&
            f &&
            (0 === d.messageType
              ? (f.messages = [{ role: "user", msg: d.text || "", type: 0 }])
              : (f.messages = void 0)),
          null == f ||
            (f.aiStream =
              null === (t = this.localOptions) || void 0 === t
                ? void 0
                : t.aiStream),
          f
        );
      }),
      (s.prototype._findMinStart = function (e) {
        var t,
          n,
          o = Number.MAX_VALUE,
          r = void 0;
        for (var s in e) {
          var a = e[s].segments;
          try {
            for (
              var c = ((t = void 0), i(a)), u = c.next();
              !u.done;
              u = c.next()
            ) {
              var l = u.value;
              l.start < o && ((o = l.start), (r = s));
            }
          } catch (e) {
            t = { error: e };
          } finally {
            try {
              u && !u.done && (n = c.return) && n.call(c);
            } finally {
              if (t) throw t.error;
            }
          }
        }
        return r;
      }),
      s
    );
  })(),
  Ir = (function () {
    function e(e, t) {
      ((this.rootStore = e),
        (this.nim = t),
        (this.blacklist = []),
        (this.mutes = []),
        (this.logger = null),
        bn(this),
        (this.logger = e.logger),
        (this._onBlockListAdded = this._onBlockListAdded.bind(this)),
        (this._onBlockListRemoved = this._onBlockListRemoved.bind(this)),
        (this._onP2PMessageMuteModeChanged =
          this._onP2PMessageMuteModeChanged.bind(this)),
        t.V2NIMUserService.on("onBlockListAdded", this._onBlockListAdded),
        t.V2NIMUserService.on("onBlockListRemoved", this._onBlockListRemoved),
        t.V2NIMSettingService.on(
          "onP2PMessageMuteModeChanged",
          this._onP2PMessageMuteModeChanged
        ));
    }
    return (
      (e.prototype.resetState = function () {
        ((this.blacklist = []), (this.mutes = []));
      }),
      (e.prototype.destroy = function () {
        (this.resetState(),
          this.nim.V2NIMUserService.off(
            "onBlockListAdded",
            this._onBlockListAdded
          ),
          this.nim.V2NIMUserService.off(
            "onBlockListRemoved",
            this._onBlockListRemoved
          ),
          this.nim.V2NIMSettingService.off(
            "onP2PMessageMuteModeChanged",
            this._onP2PMessageMuteModeChanged
          ));
      }),
      (e.prototype.addBlacklist = function (e) {
        this.blacklist = r([], o(new Set(this.blacklist.concat(e))), !1);
      }),
      (e.prototype.removeBlacklist = function (e) {
        this.blacklist = this.blacklist.filter(function (t) {
          return e.every(function (e) {
            return t !== e;
          });
        });
      }),
      (e.prototype.isInBlacklist = function (e) {
        return this.blacklist.includes(e);
      }),
      (e.prototype.addMutes = function (e) {
        this.mutes = r([], o(new Set(this.mutes.concat(e))), !1);
      }),
      (e.prototype.removeMutes = function (e) {
        this.mutes = this.mutes.filter(function (t) {
          return e.every(function (e) {
            return t !== e;
          });
        });
      }),
      (e.prototype.getBlockListActive = function () {
        var e, i;
        return t(this, void 0, void 0, function () {
          var t, o;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (e = this.logger) ||
                    void 0 === e ||
                    e.log("getBlockListActive"),
                  [4, this.nim.V2NIMUserService.getBlockList()]
                );
              case 1:
                return ((t = n.sent()), this.addBlacklist(t), [2, t]);
              case 2:
                throw (
                  (o = n.sent()),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.error("getBlockListActive failed: ", o),
                  o
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (e.prototype.getP2PMuteListActive = function () {
        var e, i;
        return t(this, void 0, void 0, function () {
          var t, o;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (e = this.logger) ||
                    void 0 === e ||
                    e.log("getP2PMuteListActive"),
                  [4, this.nim.V2NIMSettingService.getP2PMessageMuteList()]
                );
              case 1:
                return ((t = n.sent()), this.addMutes(t), [2, t]);
              case 2:
                throw (
                  (o = n.sent()),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.error("getP2PMuteListActive failed: ", o),
                  o
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (e.prototype.addUserToBlockListActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("addUserToBlockListActive", e),
                  [4, this.nim.V2NIMUserService.addUserToBlockList(e)]
                );
              case 1:
                return (
                  n.sent(),
                  this.addBlacklist([e]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("addUserToBlockListActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("addUserToBlockListActive failed: ", e, t),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (e.prototype.removeUserFromBlockListActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("removeUserFromBlockListActive", e),
                  [4, this.nim.V2NIMUserService.removeUserFromBlockList(e)]
                );
              case 1:
                return (
                  n.sent(),
                  this.removeBlacklist([e]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("removeUserFromBlockListActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("removeUserFromBlockListActive failed: ", e, t),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (e.prototype.setP2PMessageMuteModeActive = function (e, i) {
        var o, r, s;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("setP2PMessageMuteModeActive", e, i),
                  [4, this.nim.V2NIMSettingService.setP2PMessageMuteMode(e, i)]
                );
              case 1:
                return (
                  n.sent(),
                  1 === i
                    ? this.addMutes([e])
                    : 0 === i && this.removeMutes([e]),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log("setP2PMessageMuteModeActive success", {
                      accountId: e,
                      muteMode: i,
                    }),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error(
                      "setP2PMessageMuteModeActive failed: ",
                      { accountId: e, muteMode: i },
                      t
                    ),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (e.prototype._onBlockListAdded = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onBlockListAdded", e),
          this.addBlacklist([e.accountId]));
      }),
      (e.prototype._onBlockListRemoved = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onBlockListRemoved", e),
          this.removeBlacklist([e]));
      }),
      (e.prototype._onP2PMessageMuteModeChanged = function (e, t) {
        var n;
        (null === (n = this.logger) ||
          void 0 === n ||
          n.log("_onP2PMessageMuteModeChanged", e, t),
          1 === t ? this.addMutes([e]) : 0 === t && this.removeMutes([e]));
      }),
      e
    );
  })(),
  Tr = (function () {
    function i(e, t) {
      ((this.rootStore = e),
        (this.nim = t),
        (this.conversations = new Map()),
        (this.totalUnreadCount = 0),
        (this.logger = null),
        bn(this),
        (this._onSyncStarted = this._onSyncStarted.bind(this)),
        (this._onSyncFinished = this._onSyncFinished.bind(this)),
        (this._onSyncFailed = this._onSyncFailed.bind(this)),
        (this._onConversationCreated = this._onConversationCreated.bind(this)),
        (this._onConversationDeleted = this._onConversationDeleted.bind(this)),
        (this._onConversationChanged = this._onConversationChanged.bind(this)),
        (this._onTotalUnreadCountChanged =
          this._onTotalUnreadCountChanged.bind(this)),
        (this.logger = e.logger),
        t.V2NIMConversationService.on("onSyncStarted", this._onSyncStarted),
        t.V2NIMConversationService.on("onSyncFinished", this._onSyncFinished),
        t.V2NIMConversationService.on("onSyncFailed", this._onSyncFailed),
        t.V2NIMConversationService.on(
          "onConversationCreated",
          this._onConversationCreated
        ),
        t.V2NIMConversationService.on(
          "onConversationDeleted",
          this._onConversationDeleted
        ),
        t.V2NIMConversationService.on(
          "onConversationChanged",
          this._onConversationChanged
        ),
        t.V2NIMConversationService.on(
          "onTotalUnreadCountChanged",
          this._onTotalUnreadCountChanged
        ));
    }
    return (
      (i.prototype.resetState = function () {
        var e;
        (null === (e = this.logger) ||
          void 0 === e ||
          e.log("Conversation resetState"),
          this.conversations.clear(),
          (this.totalUnreadCount = 0));
      }),
      (i.prototype.destroy = function () {
        (this.resetState(),
          this.nim.V2NIMConversationService.off(
            "onSyncStarted",
            this._onSyncStarted
          ),
          this.nim.V2NIMConversationService.off(
            "onSyncFinished",
            this._onSyncFinished
          ),
          this.nim.V2NIMConversationService.off(
            "onSyncFailed",
            this._onSyncFailed
          ),
          this.nim.V2NIMConversationService.off(
            "onConversationCreated",
            this._onConversationCreated
          ),
          this.nim.V2NIMConversationService.off(
            "onConversationDeleted",
            this._onConversationDeleted
          ),
          this.nim.V2NIMConversationService.off(
            "onConversationChanged",
            this._onConversationChanged
          ),
          this.nim.V2NIMConversationService.off(
            "onTotalUnreadCountChanged",
            this._onTotalUnreadCountChanged
          ));
      }),
      (i.prototype.addConversation = function (i) {
        var o = this;
        i.filter(function (e) {
          return !!e.conversationId;
        })
          .filter(function (e) {
            return [1, 2].includes(e.type);
          })
          .forEach(function (i) {
            return t(o, void 0, void 0, function () {
              var t;
              return n(this, function (n) {
                return (
                  (t = this.conversations.get(i.conversationId)),
                  this.conversations.set(i.conversationId, e(e({}, t), i)),
                  [2]
                );
              });
            });
          });
      }),
      (i.prototype.updateConversation = function (t) {
        var n = this;
        t.filter(function (e) {
          return !!e.conversationId;
        })
          .filter(function (e) {
            return [1, 2].includes(e.type);
          })
          .forEach(function (t) {
            var i = n.conversations.get(t.conversationId);
            n.conversations.set(t.conversationId, e(e({}, i), t));
          });
      }),
      (i.prototype.removeConversation = function (e) {
        var t = this;
        e.forEach(function (e) {
          (t.conversations.delete(e),
            t.rootStore.uiStore.selectedConversation === e &&
              t.rootStore.uiStore.unselectConversation());
        });
      }),
      (i.prototype.resetConversation = function (e) {
        var i, o, r, s;
        return t(this, void 0, void 0, function () {
          var t, a;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                if (
                  (null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("resetConversation", e),
                  !(t = this.conversations.get(e)))
                )
                  return (
                    null === (o = this.logger) ||
                      void 0 === o ||
                      o.warn(
                        "resetConversation: conversation is not found.",
                        e
                      ),
                    [2]
                  );
                n.label = 1;
              case 1:
                return (
                  n.trys.push([1, 4, , 5]),
                  t.unreadCount
                    ? (this._resetMemoryConversationUnreadCount(t),
                      [
                        4,
                        this.nim.V2NIMConversationService.clearUnreadCountByIds(
                          [t.conversationId]
                        ),
                      ])
                    : [3, 3]
                );
              case 2:
                (n.sent(),
                  this._resetMemoryConversationUnreadCount(t),
                  (n.label = 3));
              case 3:
                return (
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log("resetConversation success"),
                  [3, 5]
                );
              case 4:
                throw (
                  (a = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error("resetConversation failed: ", a),
                  a
                );
              case 5:
                return [2];
            }
          });
        });
      }),
      (i.prototype.insertConversationActive = function (e, i, o) {
        var r, s, a;
        return (
          void 0 === o && (o = !0),
          t(this, void 0, void 0, function () {
            var t, c, u;
            return n(this, function (n) {
              switch (n.label) {
                case 0:
                  if (
                    (n.trys.push([0, 5, , 6]),
                    null === (r = this.logger) ||
                      void 0 === r ||
                      r.log("insertConversationActive", {
                        conversationType: e,
                        receiverId: i,
                        isSelected: o,
                      }),
                    (t = ""),
                    1 === e)
                  )
                    t = this.nim.V2NIMConversationIdUtil.p2pConversationId(i);
                  else {
                    if (2 !== e)
                      throw new Error("Unsupported conversation type");
                    t = this.nim.V2NIMConversationIdUtil.teamConversationId(i);
                  }
                  return this.conversations.has(t)
                    ? [3, 2]
                    : [
                        4,
                        this.nim.V2NIMConversationService.createConversation(t),
                      ];
                case 1:
                  ((c = n.sent()), this.addConversation([c]), (n.label = 2));
                case 2:
                  return o
                    ? [4, this.rootStore.uiStore.selectConversation(t)]
                    : [3, 4];
                case 3:
                  (n.sent(), (n.label = 4));
                case 4:
                  return (
                    null === (s = this.logger) ||
                      void 0 === s ||
                      s.log("insertConversationActive success", {
                        conversationType: e,
                        receiverId: i,
                        isSelected: o,
                      }),
                    [3, 6]
                  );
                case 5:
                  throw (
                    (u = n.sent()),
                    null === (a = this.logger) ||
                      void 0 === a ||
                      a.error(
                        "insertConversationActive failed: ",
                        { conversationType: e, receiverId: i, isSelected: o },
                        u
                      ),
                    u
                  );
                case 6:
                  return [2];
              }
            });
          })
        );
      }),
      (i.prototype.deleteConversationActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                (n.trys.push([0, 6, , 7]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("deleteConversationActive", e),
                  (n.label = 1));
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  [4, this.stickTopConversationActive(e, !1)]
                );
              case 2:
              case 3:
                return (n.sent(), [3, 4]);
              case 4:
                return (
                  this.removeConversation([e]),
                  [
                    4,
                    this.nim.V2NIMConversationService.deleteConversation(e, !1),
                  ]
                );
              case 5:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("deleteConversationActive success"),
                  [3, 7]
                );
              case 6:
                return (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.warn("deleteConversationActive failed but continue: ", t),
                  [3, 7]
                );
              case 7:
                return [2];
            }
          });
        });
      }),
      (i.prototype.stickTopConversationActive = function (e, i) {
        var o, r, s;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("stickTopConversationActive", e, i),
                  [
                    4,
                    this.nim.V2NIMConversationService.stickTopConversation(
                      e,
                      i
                    ),
                  ]
                );
              case 1:
                return (
                  n.sent(),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log("stickTopConversationActive success"),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error("stickTopConversationActive failed: ", t),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.getConversationListActive = function (e, i) {
        var o, r, s;
        return t(this, void 0, void 0, function () {
          var t, a;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 3, , 4]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getConversationListActive", e, i),
                  [
                    4,
                    this.nim.V2NIMConversationService.getConversationList(e, i),
                  ]
                );
              case 1:
                return (
                  (t = n.sent()),
                  this.addConversation(t.conversationList),
                  [
                    4,
                    this.getP2PMessageReceipt(
                      t.conversationList
                        .filter(function (e) {
                          return 1 === e.type;
                        })
                        .map(function (e) {
                          return e.conversationId;
                        })
                    ),
                  ]
                );
              case 2:
                return (
                  n.sent(),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log("getConversationListActive success", e, i, t),
                  [2, t]
                );
              case 3:
                throw (
                  (a = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error("getConversationListActive failed: ", a, e, i),
                  a
                );
              case 4:
                return [2];
            }
          });
        });
      }),
      (i.prototype.getP2PMessageReceipt = function (i) {
        var o, r, s;
        return t(this, void 0, void 0, function () {
          var t,
            a,
            c,
            u = this;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getP2PMessageReceipt", i),
                  [
                    4,
                    Promise.all(
                      i.map(function (e) {
                        return u.nim.V2NIMMessageService.getP2PMessageReceipt(
                          e
                        );
                      })
                    ),
                  ]
                );
              case 1:
                return (
                  (t = n.sent()),
                  (a = t
                    .map(function (t) {
                      var n = u.conversations.get(t.conversationId);
                      if (n)
                        return e(e({}, n), { msgReceiptTime: t.timestamp });
                    })
                    .filter(function (e) {
                      return !!e;
                    })),
                  this.updateConversation(a),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log("getP2PMessageReceipt success", i, t),
                  [2, t]
                );
              case 2:
                throw (
                  (c = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error("getP2PMessageReceipt failed: ", c, i),
                  c
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype._resetMemoryConversationUnreadCount = function (t) {
        var n = this.conversations.get(t.conversationId);
        n && this.updateConversation([e(e({}, n), { unreadCount: 0 })]);
      }),
      (i.prototype.getConversationReadTimeActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("getConversationReadTimeActive", e),
                  [
                    4,
                    this.nim.V2NIMConversationService.getConversationReadTime(
                      e
                    ),
                  ]
                );
              case 1:
                return (
                  (t = n.sent()),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getConversationReadTimeActive success", e, t),
                  [2, t]
                );
              case 2:
                throw (
                  (s = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("getConversationReadTimeActive failed: ", s, e),
                  s
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.markConversationReadActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("markConversationReadActive", e),
                  [4, this.nim.V2NIMConversationService.markConversationRead(e)]
                );
              case 1:
                return (
                  (t = n.sent()),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("markConversationReadActive success", e, t),
                  [2, t]
                );
              case 2:
                throw (
                  (s = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("markConversationReadActive failed: ", s, e),
                  s
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.handleConversationWithAit = function (i) {
        var s = this;
        i.map(function (i) {
          return t(s, void 0, void 0, function () {
            var t, s, a, c, u, l, d;
            return n(this, function (n) {
              switch (n.label) {
                case 0:
                  return 2 !== i.conversationType && 3 !== i.conversationType
                    ? [3, 2]
                    : (null == i ? void 0 : i.serverExtension)
                      ? ((t = this.hasAitMsg([i.serverExtension])),
                        [
                          4,
                          this.getConversationReadTimeActive(i.conversationId),
                        ])
                      : [3, 2];
                case 1:
                  ((s = n.sent()),
                    (a =
                      i.conversationId ==
                      this.rootStore.uiStore.selectedConversation),
                    (c =
                      i.senderId ===
                      (null === (d = this.rootStore.userStore.myUserInfo) ||
                      void 0 === d
                        ? void 0
                        : d.accountId)),
                    i.createTime > s &&
                      t &&
                      !a &&
                      !c &&
                      (u = this.conversations.get(i.conversationId)) &&
                      (0 === (l = u.aitMsgs || []).length
                        ? this.updateConversation([
                            e(e({}, u), { aitMsgs: [i.messageClientId] }),
                          ])
                        : this.updateConversation([
                            e(e({}, u), {
                              aitMsgs: r(
                                r([], o(l), !1),
                                [i.messageClientId],
                                !1
                              ),
                            }),
                          ])),
                    (n.label = 2));
                case 2:
                  return [2];
              }
            });
          });
        });
      }),
      (i.prototype.resetConversationAit = function (t) {
        var n = this.conversations.get(t);
        (2 !== (null == n ? void 0 : n.type) &&
          3 !== (null == n ? void 0 : n.type)) ||
          this.updateConversation([e(e({}, n), { aitMsgs: [] })]);
      }),
      (i.prototype.hasAitMsg = function (e) {
        var t = this,
          n = !1;
        return (
          (null == e ? void 0 : e.length) &&
            (null == e ||
              e.forEach(function (e) {
                var i, o;
                try {
                  var r = JSON.parse(e || "{}").yxAitMsg,
                    s = t.rootStore.userStore.myUserInfo.accountId;
                  r &&
                    (null === (i = Object.keys(r)) ||
                      void 0 === i ||
                      i.forEach(function (e) {
                        (e !== s && e !== Ai) || (n = !0);
                      }));
                } catch (n) {
                  null === (o = t.logger) ||
                    void 0 === o ||
                    o.error("parse serverExtension failed: ", e);
                }
              })),
          n
        );
      }),
      (i.prototype._onSyncStarted = function () {
        var e, t, n;
        (null === (e = this.logger) || void 0 === e || e.log("_onSyncStarted"),
          null === (t = this.rootStore.conversationStore) ||
            void 0 === t ||
            t.getConversationListActive(
              0,
              this.rootStore.localOptions.conversationLimit || 100
            ),
          null === (n = this.logger) ||
            void 0 === n ||
            n.log("_onSyncFinished"));
      }),
      (i.prototype._onSyncFinished = function () {
        var e, i;
        return t(this, void 0, void 0, function () {
          return n(this, function (t) {
            return (
              null === (e = this.rootStore.conversationStore) ||
                void 0 === e ||
                e.getConversationListActive(
                  0,
                  this.rootStore.localOptions.conversationLimit || 100
                ),
              null === (i = this.logger) ||
                void 0 === i ||
                i.log("_onSyncFinished"),
              [2]
            );
          });
        });
      }),
      (i.prototype._onSyncFailed = function (e) {
        var t;
        null === (t = this.logger) || void 0 === t || t.log("_onSyncFailed", e);
      }),
      (i.prototype._onConversationCreated = function (t) {
        var n,
          i = this;
        if (
          (null === (n = this.logger) ||
            void 0 === n ||
            n.log("_onConversationCreated", t),
          2 === t.type)
        )
          this.nim.V2NIMConversationService.getConversation(
            t.conversationId
          ).then(function (t) {
            (i.addConversation([t]),
              t.lastMessage &&
                i.handleConversationWithAit([
                  e(e({}, t.lastMessage), t.lastMessage.messageRefer),
                ]));
          });
        else if ((this.addConversation([t]), 1 === t.type)) {
          var o = t.conversationId;
          this.nim.V2NIMMessageService.getP2PMessageReceipt(o).then(
            function (t) {
              var n = i.conversations.get(o);
              n &&
                i.updateConversation([
                  e(e({}, n), { msgReceiptTime: t.timestamp }),
                ]);
            }
          );
        }
      }),
      (i.prototype._onConversationDeleted = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onConversationDeleted", e),
          this.removeConversation(e));
      }),
      (i.prototype._onConversationChanged = function (e) {
        var i;
        return t(this, void 0, void 0, function () {
          var o = this;
          return n(this, function (r) {
            return (
              null === (i = this.logger) ||
                void 0 === i ||
                i.log("_onConversationChanged", e),
              this.addConversation(e),
              e.forEach(function (e) {
                return t(o, void 0, void 0, function () {
                  var t, i, o, r, s, a;
                  return n(this, function (n) {
                    switch (n.label) {
                      case 0:
                        return (
                          (t =
                            null === (o = e.lastMessage) || void 0 === o
                              ? void 0
                              : o.attachment),
                          (i = null == t ? void 0 : t.type),
                          5 ===
                            (null === (r = e.lastMessage) || void 0 === r
                              ? void 0
                              : r.messageType) &&
                          ((1 === i &&
                            (null === (s = null == t ? void 0 : t.targetIds) ||
                            void 0 === s
                              ? void 0
                              : s.includes(
                                  this.rootStore.userStore.myUserInfo.accountId
                                ))) ||
                            (2 === i &&
                              (null === (a = e.lastMessage) || void 0 === a
                                ? void 0
                                : a.messageRefer.senderId) ===
                                this.rootStore.userStore.myUserInfo
                                  .accountId) ||
                            4 === i)
                            ? [
                                4,
                                this.deleteConversationActive(e.conversationId),
                              ]
                            : [3, 2]
                        );
                      case 1:
                        return (n.sent(), [3, 4]);
                      case 2:
                        return this.rootStore.uiStore.selectedConversation !==
                          e.conversationId
                          ? [3, 4]
                          : [4, this.resetConversation(e.conversationId)];
                      case 3:
                        (n.sent(), (n.label = 4));
                      case 4:
                        return (
                          2 === e.type &&
                            0 == e.unreadCount &&
                            this.resetConversationAit(e.conversationId),
                          [2]
                        );
                    }
                  });
                });
              }),
              [2]
            );
          });
        });
      }),
      (i.prototype._onTotalUnreadCountChanged = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onTotalUnreadCountChanged", e),
          (this.totalUnreadCount = e));
      }),
      i
    );
  })(),
  wr = (function () {
    function i(e, t, n) {
      ((this.rootStore = e),
        (this.nim = t),
        (this.localOptions = n),
        (this.teams = new Map()),
        (this.logger = null),
        bn(this),
        (this.logger = e.logger),
        (this._onReceiveTeamJoinActionInfo =
          this._onReceiveTeamJoinActionInfo.bind(this)),
        (this._onSyncFailed = this._onSyncFailed.bind(this)),
        (this._onSyncFinished = this._onSyncFinished.bind(this)),
        (this._onSyncStarted = this._onSyncStarted.bind(this)),
        (this._onTeamCreated = this._onTeamCreated.bind(this)),
        (this._onTeamDismissed = this._onTeamDismissed.bind(this)),
        (this._onTeamInfoUpdated = this._onTeamInfoUpdated.bind(this)),
        (this._onTeamJoined = this._onTeamJoined.bind(this)),
        (this._onTeamLeft = this._onTeamLeft.bind(this)),
        (this._onTeamMemberInfoUpdated =
          this._onTeamMemberInfoUpdated.bind(this)),
        (this._onTeamMemberJoined = this._onTeamMemberJoined.bind(this)),
        (this._onTeamMemberKicked = this._onTeamMemberKicked.bind(this)),
        (this._onTeamMemberLeft = this._onTeamMemberLeft.bind(this)),
        t.V2NIMTeamService.on(
          "onReceiveTeamJoinActionInfo",
          this._onReceiveTeamJoinActionInfo
        ),
        t.V2NIMTeamService.on("onSyncFailed", this._onSyncFailed),
        t.V2NIMTeamService.on("onSyncFinished", this._onSyncFinished),
        t.V2NIMTeamService.on("onSyncStarted", this._onSyncStarted),
        t.V2NIMTeamService.on("onTeamCreated", this._onTeamCreated),
        t.V2NIMTeamService.on("onTeamDismissed", this._onTeamDismissed),
        t.V2NIMTeamService.on("onTeamInfoUpdated", this._onTeamInfoUpdated),
        t.V2NIMTeamService.on("onTeamJoined", this._onTeamJoined),
        t.V2NIMTeamService.on("onTeamLeft", this._onTeamLeft),
        t.V2NIMTeamService.on(
          "onTeamMemberInfoUpdated",
          this._onTeamMemberInfoUpdated
        ),
        t.V2NIMTeamService.on("onTeamMemberJoined", this._onTeamMemberJoined),
        t.V2NIMTeamService.on("onTeamMemberKicked", this._onTeamMemberKicked),
        t.V2NIMTeamService.on("onTeamMemberLeft", this._onTeamMemberLeft),
        t.V2NIMSettingService.on(
          "onTeamMessageMuteModeChanged",
          this._onTeamMessageMuteModeChanged
        ));
    }
    return (
      (i.prototype.resetState = function () {
        this.teams.clear();
      }),
      (i.prototype.destroy = function () {
        (this.resetState(),
          this.nim.V2NIMTeamService.off(
            "onReceiveTeamJoinActionInfo",
            this._onReceiveTeamJoinActionInfo
          ),
          this.nim.V2NIMTeamService.off("onSyncFailed", this._onSyncFailed),
          this.nim.V2NIMTeamService.off("onSyncFinished", this._onSyncFinished),
          this.nim.V2NIMTeamService.off("onSyncStarted", this._onSyncStarted),
          this.nim.V2NIMTeamService.off("onTeamCreated", this._onTeamCreated),
          this.nim.V2NIMTeamService.off(
            "onTeamDismissed",
            this._onTeamDismissed
          ),
          this.nim.V2NIMTeamService.off(
            "onTeamInfoUpdated",
            this._onTeamInfoUpdated
          ),
          this.nim.V2NIMTeamService.off("onTeamJoined", this._onTeamJoined),
          this.nim.V2NIMTeamService.off("onTeamLeft", this._onTeamLeft),
          this.nim.V2NIMTeamService.off(
            "onTeamMemberInfoUpdated",
            this._onTeamMemberInfoUpdated
          ),
          this.nim.V2NIMTeamService.off(
            "onTeamMemberJoined",
            this._onTeamMemberJoined
          ),
          this.nim.V2NIMTeamService.off(
            "onTeamMemberKicked",
            this._onTeamMemberKicked
          ),
          this.nim.V2NIMTeamService.off(
            "onTeamMemberLeft",
            this._onTeamMemberLeft
          ),
          this.nim.V2NIMSettingService.off(
            "onTeamMessageMuteModeChanged",
            this._onTeamMessageMuteModeChanged
          ));
      }),
      (i.prototype.addTeam = function (e) {
        var t = this;
        e.filter(function (e) {
          return !!e.isValidTeam;
        })
          .filter(function (e) {
            return !!e.teamId;
          })
          .forEach(function (e) {
            t.teams.set(e.teamId, e);
          });
      }),
      (i.prototype.removeTeam = function (e) {
        var t = this;
        e.forEach(function (e) {
          t.teams.delete(e);
        });
      }),
      (i.prototype.updateTeam = function (t) {
        var n = this;
        t.filter(function (e) {
          return !!e.teamId;
        }).forEach(function (t) {
          var i = n.teams.get(t.teamId);
          if (i) {
            var o = e(e({}, i), t);
            n.teams.set(t.teamId, o);
          }
        });
      }),
      (i.prototype.createTeamActive = function (e) {
        var i,
          o,
          r,
          s = e.accounts,
          a = e.type,
          c = void 0 === a ? 1 : a,
          u = e.avatar,
          l = e.name,
          d = e.intro,
          h = e.serverExtension,
          v = e.joinMode,
          f = e.agreeMode,
          g = e.inviteMode,
          p = e.updateInfoMode,
          m = e.updateExtensionMode;
        return t(this, void 0, void 0, function () {
          var e, t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("createTeamActive", {
                      accounts: s,
                      type: c,
                      avatar: u,
                      name: l,
                      intro: d,
                      serverExtension: h,
                    }),
                  [
                    4,
                    this.nim.V2NIMTeamService.createTeam(
                      {
                        avatar: u,
                        teamType: c,
                        joinMode: v || this.localOptions.teamJoinMode,
                        agreeMode: f || this.localOptions.teamAgreeMode,
                        inviteMode: g || this.localOptions.teamInviteMode,
                        updateInfoMode:
                          p || this.localOptions.teamUpdateTeamMode,
                        updateExtensionMode:
                          m || this.localOptions.teamUpdateExtMode,
                        name: l,
                        intro: d,
                        serverExtension: h,
                      },
                      s,
                      ""
                    ),
                  ]
                );
              case 1:
                return (
                  (e = n.sent().team),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("createTeamActive success", e),
                  [2, e]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error(
                      "createTeamActive failed: ",
                      {
                        accounts: s,
                        type: c,
                        avatar: u,
                        name: l,
                        intro: d,
                        serverExtension: h,
                      },
                      t,
                      t.code,
                      t.detail
                    ),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.applyTeamActive = function (e, i) {
        var o, r, s;
        return (
          void 0 === i && (i = 1),
          t(this, void 0, void 0, function () {
            var t, a;
            return n(this, function (n) {
              switch (n.label) {
                case 0:
                  return (
                    n.trys.push([0, 2, , 3]),
                    null === (o = this.logger) ||
                      void 0 === o ||
                      o.log("applyTeamActive", e),
                    [4, this.nim.V2NIMTeamService.applyJoinTeam(e, i)]
                  );
                case 1:
                  return (
                    (t = n.sent()),
                    null === (r = this.logger) ||
                      void 0 === r ||
                      r.log("applyTeamActive success", e),
                    [2, t]
                  );
                case 2:
                  throw (
                    (a = n.sent()),
                    null === (s = this.logger) ||
                      void 0 === s ||
                      s.error("applyTeamActive failed: ", e, a),
                    a
                  );
                case 3:
                  return [2];
              }
            });
          })
        );
      }),
      (i.prototype.leaveTeamActive = function (e, i) {
        var o, r, s;
        return (
          void 0 === i && (i = 1),
          t(this, void 0, void 0, function () {
            var t;
            return n(this, function (n) {
              switch (n.label) {
                case 0:
                  return (
                    n.trys.push([0, 2, , 3]),
                    null === (o = this.logger) ||
                      void 0 === o ||
                      o.log("leaveTeamActive", e),
                    [4, this.nim.V2NIMTeamService.leaveTeam(e, i)]
                  );
                case 1:
                  return (
                    n.sent(),
                    null === (r = this.logger) ||
                      void 0 === r ||
                      r.log("leaveTeamActive success", e),
                    [3, 3]
                  );
                case 2:
                  throw (
                    (t = n.sent()),
                    null === (s = this.logger) ||
                      void 0 === s ||
                      s.error("leaveTeamActive failed: ", e, t),
                    t
                  );
                case 3:
                  return [2];
              }
            });
          })
        );
      }),
      (i.prototype.dismissTeamActive = function (e, i) {
        var o, r, s;
        return (
          void 0 === i && (i = 1),
          t(this, void 0, void 0, function () {
            var t;
            return n(this, function (n) {
              switch (n.label) {
                case 0:
                  return (
                    n.trys.push([0, 2, , 3]),
                    null === (o = this.logger) ||
                      void 0 === o ||
                      o.log("dismissTeamActive", e),
                    [4, this.nim.V2NIMTeamService.dismissTeam(e, i)]
                  );
                case 1:
                  return (
                    n.sent(),
                    null === (r = this.logger) ||
                      void 0 === r ||
                      r.log("dismissTeamActive success", e),
                    [3, 3]
                  );
                case 2:
                  throw (
                    (t = n.sent()),
                    null === (s = this.logger) ||
                      void 0 === s ||
                      s.error("dismissTeamActive failed: ", e, t),
                    t
                  );
                case 3:
                  return [2];
              }
            });
          })
        );
      }),
      (i.prototype.transferTeamActive = function (e) {
        var i,
          o,
          r,
          s = e.teamId,
          a = e.type,
          c = void 0 === a ? 1 : a,
          u = e.account,
          l = e.leave;
        return t(this, void 0, void 0, function () {
          var e;
          return n(this, function (t) {
            switch (t.label) {
              case 0:
                return (
                  t.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("transferTeamActive", {
                      teamId: s,
                      type: c,
                      account: u,
                      leave: l,
                    }),
                  [
                    4,
                    this.nim.V2NIMTeamService.transferTeamOwner(
                      s,
                      c,
                      u,
                      null != l ? l : this.localOptions.leaveOnTransfer
                    ),
                  ]
                );
              case 1:
                return (
                  t.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("transferTeamActive success", {
                      teamId: s,
                      type: c,
                      account: u,
                      leave: l,
                    }),
                  [3, 3]
                );
              case 2:
                throw (
                  (e = t.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error(
                      "transferTeamActive failed: ",
                      { teamId: s, type: c, account: u, leave: l },
                      e
                    ),
                  e
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.setTeamChatBannedActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("muteTeamActive", e),
                  [
                    4,
                    this.nim.V2NIMTeamService.setTeamChatBannedMode(
                      e.teamId,
                      e.type || 1,
                      e.chatBannedMode
                    ),
                  ]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("muteTeamActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("muteTeamActive failed: ", e, t),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.updateTeamActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s, a, c, u;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("updateTeamActive", e),
                  (t = e.teamId),
                  (s = e.type),
                  (a = void 0 === s ? 1 : s),
                  (c = e.info),
                  [4, this.nim.V2NIMTeamService.updateTeamInfo(t, a, c)]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("updateTeamActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (u = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("updateTeamActive failed: ", e, u),
                  u
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.getTeamActive = function (e, i) {
        var o;
        return (
          void 0 === i && (i = 1),
          t(this, void 0, void 0, function () {
            var t;
            return n(this, function (n) {
              switch (n.label) {
                case 0:
                  return (
                    null === (o = this.logger) ||
                      void 0 === o ||
                      o.log("getTeamActive: ", e),
                    (t = this.teams.get(e))
                      ? [2, t]
                      : [4, this.getTeamForceActive(e, i)]
                  );
                case 1:
                  return ((t = n.sent()), this.addTeam([t]), [2, t]);
              }
            });
          })
        );
      }),
      (i.prototype.getTeamForceActive = function (e, i) {
        var o, r, s;
        return (
          void 0 === i && (i = 1),
          t(this, void 0, void 0, function () {
            var t, a;
            return n(this, function (n) {
              switch (n.label) {
                case 0:
                  return (
                    n.trys.push([0, 2, , 3]),
                    null === (o = this.logger) ||
                      void 0 === o ||
                      o.log("getTeamForceActive: ", e),
                    [4, this.nim.V2NIMTeamService.getTeamInfo(e, i)]
                  );
                case 1:
                  return (
                    (t = n.sent()),
                    null === (r = this.logger) ||
                      void 0 === r ||
                      r.log("getTeamForceActive success", t),
                    [2, t]
                  );
                case 2:
                  throw (
                    (a = n.sent()),
                    null === (s = this.logger) ||
                      void 0 === s ||
                      s.error("getTeamForceActive failed: ", e, a),
                    a
                  );
                case 3:
                  return [2];
              }
            });
          })
        );
      }),
      (i.prototype.setTeamMessageMuteModeActive = function (e, i, o) {
        var r, s, a;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log("setTeamMessageMuteModeActive", {
                      teamId: e,
                      teamType: i,
                      muteMode: o,
                    }),
                  [
                    4,
                    this.nim.V2NIMSettingService.setTeamMessageMuteMode(
                      e,
                      i,
                      o
                    ),
                  ]
                );
              case 1:
                return (
                  n.sent(),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.log("setTeamMessageMuteModeActive success", {
                      teamId: e,
                      teamType: i,
                      muteMode: o,
                    }),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (a = this.logger) ||
                    void 0 === a ||
                    a.error(
                      "setTeamMessageMuteModeActive failed: ",
                      { teamId: e, teamType: i, muteMode: o },
                      t
                    ),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.acceptTeamInviteActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("acceptTeamInviteActive: ", e),
                  [4, this.nim.V2NIMTeamService.acceptInvitation(e)]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("acceptTeamInviteActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("acceptTeamInviteActive failed: ", e, t),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.rejectTeamInviteActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("rejectTeamInviteActive: ", e),
                  [4, this.nim.V2NIMTeamService.rejectInvitation(e)]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("rejectTeamInviteActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("rejectTeamInviteActive failed: ", e, t),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.acceptJoinApplicationActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("acceptJoinApplicationActive: ", e),
                  [4, this.nim.V2NIMTeamService.acceptJoinApplication(e)]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("acceptJoinApplicationActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("acceptJoinApplicationActive failed: ", e, t),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.rejectTeamApplyActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("rejectTeamApplyActive: ", e),
                  [4, this.nim.V2NIMTeamService.rejectJoinApplication(e)]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("rejectTeamApplyActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("rejectTeamApplyActive failed: ", e, t),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.updateTeamMemberRoleActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s, a, c, u, l;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("addTeamManagersActive: ", e),
                  (t = e.teamId),
                  (s = e.type),
                  (a = void 0 === s ? 1 : s),
                  (c = e.accounts),
                  (u = e.role),
                  [
                    4,
                    this.nim.V2NIMTeamService.updateTeamMemberRole(t, a, c, u),
                  ]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("addTeamManagersActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (l = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("addTeamManagersActive failed: ", e, l),
                  l
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.getTeamJoinActionInfoListActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("getTeamJoinActionInfoListActive: ", e),
                  [4, this.nim.V2NIMTeamService.getTeamJoinActionInfoList(e)]
                );
              case 1:
                return (
                  (t = n.sent()),
                  this.rootStore.sysMsgStore.addTeamJoinActionMsg(t.infos),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getTeamJoinActionInfoListActive success", t),
                  [2, t]
                );
              case 2:
                throw (
                  (s = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("getTeamJoinActionInfoListActive failed: ", e, s),
                  s
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.getJoinedTeamListActive = function () {
        var e, i, o;
        return t(this, void 0, void 0, function () {
          var t, r;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (e = this.logger) ||
                    void 0 === e ||
                    e.log("getJoinedTeamListActive"),
                  [4, this.nim.V2NIMTeamService.getJoinedTeamList([1])]
                );
              case 1:
                return (
                  (t = n.sent()),
                  this.addTeam(t),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("getJoinedTeamListActive success", t),
                  [2, t]
                );
              case 2:
                throw (
                  (r = n.sent()),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.error("getJoinedTeamListActive failed: ", r),
                  r
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.getTeamMessageMuteModeActive = function (e, i) {
        var o, r, s;
        return t(this, void 0, void 0, function () {
          var t, a;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getTeamMessageMuteModeActive", e, i),
                  [4, this.nim.V2NIMSettingService.getTeamMessageMuteMode(e, i)]
                );
              case 1:
                return (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log("getTeamMessageMuteModeActive success", e, i),
                  [2, t]
                );
              case 2:
                throw (
                  (a = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error("getTeamMessageMuteModeActive failed: ", e, i, a),
                  a
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype._onReceiveTeamJoinActionInfo = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onReceiveTeamJoinActionInfo: ", e),
          this.rootStore.sysMsgStore.addTeamJoinActionMsg([e]));
      }),
      (i.prototype._onSyncFailed = function (e) {
        var t;
        null === (t = this.logger) ||
          void 0 === t ||
          t.log("V2NIMTeamService _onSyncFailed: ", e);
      }),
      (i.prototype._onSyncFinished = function () {
        var e, i;
        return t(this, void 0, void 0, function () {
          return n(this, function (t) {
            return (
              null === (e = this.rootStore.conversationStore) ||
                void 0 === e ||
                e.getConversationListActive(
                  0,
                  this.rootStore.localOptions.conversationLimit || 100
                ),
              null === (i = this.logger) ||
                void 0 === i ||
                i.log("V2NIMTeamService _onSyncFinished"),
              [2]
            );
          });
        });
      }),
      (i.prototype._onSyncStarted = function () {
        var e;
        null === (e = this.logger) ||
          void 0 === e ||
          e.log("V2NIMTeamService _onSyncStarted");
      }),
      (i.prototype._onTeamCreated = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("V2NIMTeamService _onTeamCreated: ", e),
          this.addTeam([e]));
      }),
      (i.prototype._onTeamDismissed = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("V2NIMTeamService _onTeamDismissed: ", e),
          this._handleRemoveTeam(e.teamId));
      }),
      (i.prototype._onTeamInfoUpdated = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("V2NIMTeamService _onTeamInfoUpdated: ", e),
          this.updateTeam([e]));
      }),
      (i.prototype._onTeamJoined = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("V2NIMTeamService _onTeamJoined: ", e),
          this.addTeam([e]));
      }),
      (i.prototype._onTeamLeft = function (e) {
        var i;
        return t(this, void 0, void 0, function () {
          return n(this, function (t) {
            return (
              null === (i = this.logger) ||
                void 0 === i ||
                i.log("V2NIMTeamService _onTeamLeft: ", e),
              this._handleRemoveTeam(e.teamId),
              [2]
            );
          });
        });
      }),
      (i.prototype._onTeamMemberInfoUpdated = function (e) {
        var t;
        null === (t = this.logger) ||
          void 0 === t ||
          t.log("V2NIMTeamService _onTeamMemberInfoUpdated: ", e);
        var n = e[0].teamId;
        this.rootStore.teamMemberStore.updateTeamMember(n, e);
      }),
      (i.prototype._onTeamMemberJoined = function (e) {
        var i;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            return (
              null === (i = this.logger) ||
                void 0 === i ||
                i.log("V2NIMTeamService _onTeamMemberJoined: ", e),
              (t = e[0].teamId),
              this.rootStore.teamMemberStore.addTeamMember(t, e),
              [2]
            );
          });
        });
      }),
      (i.prototype._onTeamMemberKicked = function (e, i) {
        var o;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            return (
              null === (o = this.logger) ||
                void 0 === o ||
                o.log("V2NIMTeamService _onTeamMemberKicked: ", e, i),
              (t = i[0].teamId),
              this.rootStore.teamMemberStore.removeTeamMember(
                t,
                i.map(function (e) {
                  return e.accountId;
                })
              ),
              [2]
            );
          });
        });
      }),
      (i.prototype._onTeamMemberLeft = function (e) {
        var i;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            return (
              null === (i = this.logger) ||
                void 0 === i ||
                i.log("V2NIMTeamService _onTeamMemberLeft: ", e),
              (t = e[0].teamId),
              this.rootStore.teamMemberStore.removeTeamMember(
                t,
                e.map(function (e) {
                  return e.accountId;
                })
              ),
              [2]
            );
          });
        });
      }),
      (i.prototype._handleRemoveTeam = function (e) {
        (this.removeTeam([e]),
          this.rootStore.teamMemberStore.removeTeamMember(e));
      }),
      (i.prototype._onTeamMessageMuteModeChanged = function (e, t, n) {
        var i;
        null === (i = this.logger) ||
          void 0 === i ||
          i.log("V2NIMTeamService _onTeamMessageMuteModeChanged: ", e, t, n);
      }),
      i
    );
  })(),
  Or = (function () {
    function i(e, t) {
      ((this.rootStore = e),
        (this.nim = t),
        (this.teamMembers = new Map()),
        (this.logger = null),
        bn(this),
        (this.logger = e.logger));
    }
    return (
      (i.prototype.resetState = function () {
        this.teamMembers.clear();
      }),
      (i.prototype.destroy = function () {
        this.resetState();
      }),
      (i.prototype.addTeamMemberActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s, a, c, u, l;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("addTeamMemberActive", e),
                  (t = e.teamId),
                  (s = e.type),
                  (a = void 0 === s ? 1 : s),
                  (c = e.accounts),
                  (u = e.ps),
                  [4, this.nim.V2NIMTeamService.inviteMember(t, a, c, u)]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("addTeamMemberActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (l = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("addTeamMemberActive failed: ", e, l),
                  l
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.removeTeamMemberActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s, a, c, u;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("removeTeamMemberActive", e),
                  (t = e.teamId),
                  (s = e.type),
                  (a = void 0 === s ? 1 : s),
                  (c = e.accounts),
                  [4, this.nim.V2NIMTeamService.kickMember(t, a, c)]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("removeTeamMemberActive success", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (u = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("removeTeamMemberActive failed: ", e, u),
                  u
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.getTeamMemberActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s, a, c, u, l;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("getTeamMemberActive", e),
                  (t = e.teamId),
                  (s = e.queryOption),
                  (a = e.type),
                  (c = void 0 === a ? 1 : a),
                  [4, this.nim.V2NIMTeamService.getTeamMemberList(t, c, s)]
                );
              case 1:
                return (
                  (u = n.sent()),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getTeamMemberActive success: ", t, c, s, u),
                  this.setTeamMembers(t, u.memberList),
                  [2, u]
                );
              case 2:
                throw (
                  (l = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("getTeamMemberActive failed: ", e, l),
                  l
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.updateMyMemberInfoActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s, a, c, u;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("updateMyMemberInfo", e),
                  (t = e.teamId),
                  (s = e.type),
                  (a = void 0 === s ? 1 : s),
                  (c = e.memberInfo),
                  [
                    4,
                    this.nim.V2NIMTeamService.updateSelfTeamMemberInfo(t, a, c),
                  ]
                );
              case 1:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("updateMyMemberInfo success: ", e),
                  [3, 3]
                );
              case 2:
                throw (
                  (u = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("updateMyMemberInfo failed: ", e, u),
                  u
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.setTeamMembers = function (e, t) {
        var n = new Map();
        (t.forEach(function (e) {
          n.set(e.accountId, e);
        }),
          this.teamMembers.set(e, n));
      }),
      (i.prototype.addTeamMember = function (e, t) {
        var n = this.teamMembers.get(e);
        (n || (n = new Map()),
          t
            .filter(function (e) {
              return !!e.inTeam;
            })
            .filter(function (e) {
              return !!e.accountId;
            })
            .forEach(function (e) {
              n.set(e.accountId, e);
            }),
          this.teamMembers.set(e, n));
      }),
      (i.prototype.removeTeamMember = function (e, t) {
        if (t && t.length) {
          var n = this.teamMembers.get(e);
          n &&
            (t.forEach(function (e) {
              n.delete(e);
            }),
            this.teamMembers.set(e, n));
        } else this.teamMembers.delete(e);
      }),
      (i.prototype.updateTeamMember = function (t, n) {
        var i = this.teamMembers.get(t);
        i &&
          (n.forEach(function (t) {
            var n = i.get(t.accountId);
            n && ((n = e(e({}, n), t)), i.set(t.accountId, n));
          }),
          this.teamMembers.set(t, i));
      }),
      (i.prototype.getTeamMember = function (e, t) {
        var n,
          i = r(
            [],
            o(
              (null === (n = this.teamMembers.get(e)) || void 0 === n
                ? void 0
                : n.values()) || []
            ),
            !1
          );
        return t && t.length
          ? i.filter(function (e) {
              return t.some(function (t) {
                return t === e.accountId;
              });
            })
          : i;
      }),
      i
    );
  })(),
  Rr = (function () {
    function t(e, t) {
      ((this.rootStore = e),
        (this.nim = t),
        (this.friendApplyMsg = new Map()),
        (this.teamJoinActionMsg = new Map()),
        (this.logger = null),
        bn(this),
        (this.logger = e.logger));
    }
    return (
      (t.prototype.resetState = function () {
        (this.friendApplyMsg.clear(), this.teamJoinActionMsg.clear());
      }),
      (t.prototype.destroy = function () {
        this.resetState();
      }),
      Object.defineProperty(t.prototype, "friendApplyMsgs", {
        get: function () {
          return Array.from(this.friendApplyMsg.values()).sort(function (e, t) {
            return t.timestamp - e.timestamp;
          });
        },
        enumerable: !1,
        configurable: !0,
      }),
      Object.defineProperty(t.prototype, "teamJoinActionMsgs", {
        get: function () {
          return Array.from(this.teamJoinActionMsg.values()).sort(
            function (e, t) {
              return t.timestamp - e.timestamp;
            }
          );
        },
        enumerable: !1,
        configurable: !0,
      }),
      (t.prototype.addFriendApplyMsg = function (e) {
        var t = this;
        e.forEach(function (e) {
          var n = t.createFriendApplyMsgKey(e);
          t.friendApplyMsg.set(n, e);
        });
      }),
      (t.prototype.deleteFriendApplyMsg = function (e) {
        var t = this;
        e.forEach(function (e) {
          var n = t.createFriendApplyMsgKey(e);
          t.friendApplyMsg.delete(n);
        });
      }),
      (t.prototype.updateFriendApplyMsg = function (t) {
        var n = this;
        t.forEach(function (t) {
          var i = n.createFriendApplyMsgKey(t),
            o = n.friendApplyMsg.get(i);
          o && n.friendApplyMsg.set(i, e(e({}, o), t));
        });
      }),
      (t.prototype.addTeamJoinActionMsg = function (e) {
        var t = this;
        e.forEach(function (e) {
          var n = t.createTeamJoinActionMsgKey(e);
          t.teamJoinActionMsg.set(n, e);
        });
      }),
      (t.prototype.deleteTeamJoinActionMsg = function (e) {
        var t = this;
        e.forEach(function (e) {
          var n = t.createTeamJoinActionMsgKey(e);
          t.teamJoinActionMsg.delete(n);
        });
      }),
      (t.prototype.updateTeamJoinActionMsg = function (t) {
        var n = this;
        t.forEach(function (t) {
          var i = n.createTeamJoinActionMsgKey(t),
            o = n.teamJoinActionMsg.get(i),
            r = e(e({}, o), t);
          n.teamJoinActionMsg.set(i, r);
        });
      }),
      (t.prototype.getUnreadFriendApplyMsgsCount = function () {
        return this.friendApplyMsgs.filter(function (e) {
          return !e.isRead;
        }).length;
      }),
      (t.prototype.getUnreadTeamJoinActionMsgsCount = function () {
        return this.teamJoinActionMsgs.filter(function (e) {
          return !e.isRead;
        }).length;
      }),
      (t.prototype.getTotalUnreadMsgsCount = function () {
        return (
          this.getUnreadFriendApplyMsgsCount() +
          this.getUnreadTeamJoinActionMsgsCount()
        );
      }),
      (t.prototype.setAllApplyMsgRead = function () {
        (this.updateFriendApplyMsg(
          this.friendApplyMsgs.map(function (t) {
            return e(e({}, t), { isRead: !0 });
          })
        ),
          this.updateTeamJoinActionMsg(
            this.teamJoinActionMsgs.map(function (t) {
              return e(e({}, t), { isRead: !0 });
            })
          ));
      }),
      (t.prototype.createTeamJoinActionMsgKey = function (e) {
        return ""
          .concat(e.teamId, "_")
          .concat(e.operatorAccountId, "_")
          .concat(e.actionType);
      }),
      (t.prototype.createFriendApplyMsgKey = function (e) {
        return ""
          .concat(e.applicantAccountId, "_")
          .concat(e.recipientAccountId);
      }),
      t
    );
  })(),
  Nr = (function () {
    function e(e, t) {
      ((this.rootStore = e),
        (this.nim = t),
        (this.users = new Map()),
        (this.myUserInfo = {
          accountId: this.nim.V2NIMLoginService.getLoginUser(),
          name: "",
          createTime: Date.now(),
          updateTime: Date.now(),
        }),
        (this.logger = null),
        (this._getUserInfo = mr(this._getUserInfos, 1e3, 100)),
        bn(this),
        (this._onUserProfileChanged = this._onUserProfileChanged.bind(this)),
        (this.logger = e.logger),
        t.V2NIMUserService.on(
          "onUserProfileChanged",
          this._onUserProfileChanged
        ));
    }
    return (
      (e.prototype.resetState = function () {
        (this.users.clear(),
          (this.myUserInfo = {
            accountId: this.nim.V2NIMLoginService.getLoginUser(),
            name: "",
            createTime: Date.now(),
            updateTime: Date.now(),
          }));
      }),
      (e.prototype.destroy = function () {
        (this.resetState(),
          this.nim.V2NIMUserService.off(
            "onUserProfileChanged",
            this._onUserProfileChanged
          ));
      }),
      (e.prototype.addUsers = function (e) {
        var t = this;
        e.filter(function (e) {
          return !!e.accountId;
        }).forEach(function (e) {
          t.users.set(e.accountId, e);
        });
      }),
      (e.prototype.removeUsers = function (e) {
        var t = this;
        e.forEach(function (e) {
          t.users.delete(e);
        });
      }),
      (e.prototype.getMyUserServerExt = function () {
        var e,
          t = {};
        try {
          t = JSON.parse(
            (null === (e = this.myUserInfo) || void 0 === e
              ? void 0
              : e.serverExtension) || "{}"
          );
        } catch (e) {}
        return t;
      }),
      (e.prototype.updateSelfUserProfileActive = function (e, i) {
        var o, r, s, a;
        return t(this, void 0, void 0, function () {
          var t, c, u, l;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                if (
                  (n.trys.push([0, 6, , 7]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("updateSelfUserProfileActive", e, i),
                  !i)
                )
                  return [3, 4];
                n.label = 1;
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  (t = this.nim.V2NIMStorageService.createUploadFileTask({
                    fileObj: i,
                  })),
                  [
                    4,
                    this.nim.V2NIMStorageService.uploadFile(t, function () {}),
                  ]
                );
              case 2:
                return ((c = n.sent()), (e.avatar = c), [3, 4]);
              case 3:
                return (
                  (u = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.warn("upload avatar error and save continue.", u),
                  [3, 4]
                );
              case 4:
                return [4, this.nim.V2NIMUserService.updateSelfUserProfile(e)];
              case 5:
                return (
                  n.sent(),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.log("updateSelfUserProfileActive success", e, i),
                  [3, 7]
                );
              case 6:
                throw (
                  (l = n.sent()),
                  null === (a = this.logger) ||
                    void 0 === a ||
                    a.error("updateSelfUserProfileActive failed:", e, l, i),
                  l
                );
              case 7:
                return [2];
            }
          });
        });
      }),
      (e.prototype.getUserActive = function (e) {
        var i, o;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            return (
              null === (i = this.logger) ||
                void 0 === i ||
                i.log("getUserListActive", e),
              (t = this.users.get(e))
                ? (null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getUserListActive success", t, e),
                  [2, t])
                : [2, this.getUserForceActive(e)]
            );
          });
        });
      }),
      (e.prototype.getUserForceActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("getUserForceActive", e),
                  [4, this._getUserInfo(e)]
                );
              case 1:
                return (
                  (t = n.sent()),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getUserForceActive success", t, e),
                  [2, t]
                );
              case 2:
                throw (
                  (s = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("getUserForceActive failed: ", e, s),
                  s
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (e.prototype.getUserListFromCloudActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("getUserListFromCloudActive", e),
                  [4, this.nim.V2NIMUserService.getUserListFromCloud(e)]
                );
              case 1:
                return (
                  (t = n.sent()),
                  this.addUsers(t),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getUserListFromCloudActive success", t, e),
                  [2, t]
                );
              case 2:
                throw (
                  (s = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error("getUserListFromCloudActive failed: ", e, s),
                  s
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (e.prototype.getMyUserInfoActive = function () {
        var e, i, o;
        return t(this, void 0, void 0, function () {
          var t, r;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (e = this.logger) ||
                    void 0 === e ||
                    e.log("getMyUserInfoActive"),
                  [
                    4,
                    this.nim.V2NIMUserService.getUserList([
                      this.nim.V2NIMLoginService.getLoginUser(),
                    ]),
                  ]
                );
              case 1:
                return (
                  (t = n.sent()),
                  (this.myUserInfo = t[0]),
                  this.addUsers(t),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("getMyUserInfoActive success", t),
                  [2, t[0]]
                );
              case 2:
                throw (
                  (r = n.sent()),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.error("getMyUserInfoActive failed: ", r),
                  r
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (e.prototype._getUserInfos = function (e) {
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return [4, this.nim.V2NIMUserService.getUserList(e)];
              case 1:
                return ((t = n.sent()), this.addUsers(t), [2, t]);
            }
          });
        });
      }),
      (e.prototype._onUserProfileChanged = function (e) {
        var t,
          n = this;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onUserProfileChanged: ", e),
          e.forEach(function (e) {
            e.accountId === n.myUserInfo.accountId && (n.myUserInfo = e);
          }),
          this.addUsers(e));
      }),
      e
    );
  })(),
  Lr = (function () {
    function i(e, t, n) {
      ((this.rootStore = e),
        (this.nim = t),
        (this.localOptions = n),
        (this.aiUsers = new Map()),
        (this.aiReqMsgs = []),
        (this.aiResMsgs = []),
        (this.logger = null),
        (this.onSendAIProxyErrorHandler = function () {}),
        (this.requestIds = []),
        (this.proxyAccountId = ""),
        bn(this),
        (this.logger = e.logger),
        (this._onProxyAIModelCall = this._onProxyAIModelCall.bind(this)),
        this.nim.V2NIMAIService.on(
          "onProxyAIModelCall",
          this._onProxyAIModelCall
        ));
    }
    return (
      Object.defineProperty(i.prototype, "aiProxying", {
        get: function () {
          return this.aiReqMsgs.length > this.aiResMsgs.length;
        },
        enumerable: !1,
        configurable: !0,
      }),
      (i.prototype.resetState = function () {
        (this.aiUsers.clear(), (this.aiReqMsgs = []), (this.aiResMsgs = []));
      }),
      (i.prototype.destroy = function () {
        (this.resetState(),
          this.nim.V2NIMAIService.off(
            "onProxyAIModelCall",
            this._onProxyAIModelCall
          ));
      }),
      (i.prototype.addAIUsers = function (e) {
        var t = this;
        e.filter(function (e) {
          return !!e.accountId;
        }).forEach(function (e) {
          t.aiUsers.set(e.accountId, e);
        });
      }),
      (i.prototype.removeAIUsers = function (e) {
        var t = this;
        e.forEach(function (e) {
          t.aiUsers.delete(e);
        });
      }),
      (i.prototype.getAIUserList = function (e) {
        var t = r([], o(this.aiUsers.values()), !1),
          n = function (e, t) {
            return t.createTime - e.createTime;
          };
        return e && e.length
          ? t
              .filter(function (t) {
                return e.includes(t.accountId);
              })
              .sort(n)
          : t.sort(n);
      }),
      (i.prototype.getAISearchUser = function () {
        var e,
          t,
          n = this.getAIUserList();
        return null ===
          (t =
            null === (e = this.localOptions.aiUserAgentProvider) || void 0 === e
              ? void 0
              : e.getAISearchUser) || void 0 === t
          ? void 0
          : t.call(e, n);
      }),
      (i.prototype.getAITranslateUser = function () {
        var e,
          t,
          n = this.getAIUserList();
        return null ===
          (t =
            null === (e = this.localOptions.aiUserAgentProvider) || void 0 === e
              ? void 0
              : e.getAITranslateUser) || void 0 === t
          ? void 0
          : t.call(e, n);
      }),
      (i.prototype.getAITranslateLangs = function () {
        var e,
          t,
          n = this.getAIUserList();
        return (
          (null ===
            (t =
              null === (e = this.localOptions.aiUserAgentProvider) ||
              void 0 === e
                ? void 0
                : e.getAITranslateLangs) || void 0 === t
            ? void 0
            : t.call(e, n)) || []
        );
      }),
      (i.prototype.getAIUserServerExt = function (e) {
        var t = this.aiUsers.get(e);
        if (!t) return {};
        try {
          return JSON.parse(t.serverExtension || "{}");
        } catch (e) {
          return {};
        }
      }),
      (i.prototype.getAIChatUser = function () {
        var e = this;
        return this.getAIUserList().filter(function (t) {
          return 1 === e.getAIUserServerExt(t.accountId).aiChat;
        });
      }),
      (i.prototype.getAIPinDefaultUser = function () {
        var e = this;
        return this.getAIUserList().filter(function (t) {
          return 1 === e.getAIUserServerExt(t.accountId).pinDefault;
        });
      }),
      (i.prototype.getAIPinUser = function () {
        var e = this.rootStore.userStore.getMyUserServerExt();
        return this.getAIPinDefaultUser().filter(function (t) {
          var n;
          return !(null === (n = e.unpinAIUsers) || void 0 === n
            ? void 0
            : n.includes(t.accountId));
        });
      }),
      (i.prototype.isAIPinUser = function (e) {
        return this.getAIPinUser().some(function (t) {
          return t.accountId === e;
        });
      }),
      (i.prototype.isAISearching = function () {
        var e;
        return (
          this.proxyAccountId ===
          (null === (e = this.getAISearchUser()) || void 0 === e
            ? void 0
            : e.accountId)
        );
      }),
      (i.prototype.isAITranslating = function () {
        var e;
        return (
          this.proxyAccountId ===
          (null === (e = this.getAITranslateUser()) || void 0 === e
            ? void 0
            : e.accountId)
        );
      }),
      (i.prototype.isAIUser = function (e) {
        return this.aiUsers.has(e);
      }),
      (i.prototype.resetAIProxy = function () {
        ((this.requestIds = []),
          (this.aiReqMsgs = []),
          (this.aiResMsgs = []),
          (this.proxyAccountId = ""),
          (this.onSendAIProxyErrorHandler = function () {}));
      }),
      (i.prototype.getAIUserListActive = function () {
        var e, i, o;
        return t(this, void 0, void 0, function () {
          var t, r;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (e = this.logger) ||
                    void 0 === e ||
                    e.log("getAIUserListActive"),
                  [4, this.nim.V2NIMAIService.getAIUserList()]
                );
              case 1:
                return (
                  (t = n.sent()),
                  this.addAIUsers(t),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("getAIUserListActive success:", t),
                  [3, 3]
                );
              case 2:
                return (
                  (r = n.sent()),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("getAIUserListActive failed:", r),
                  [3, 3]
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.sendAIProxyActive = function (i) {
        var o, r, s;
        return t(this, void 0, void 0, function () {
          var t, a;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("sendAIProxyActive", i),
                  (t = e({}, i)),
                  i.requestId
                    ? (this.resetAIProxy(),
                      this.requestIds.push(i.requestId),
                      (this.proxyAccountId = i.accountId))
                    : ((t.requestId = Math.random().toString(36).slice(2)),
                      this.requestIds.push(t.requestId)),
                  i.onSendAIProxyErrorHandler &&
                    (this.onSendAIProxyErrorHandler =
                      i.onSendAIProxyErrorHandler),
                  [4, this.nim.V2NIMAIService.proxyAIModelCall(t)]
                );
              case 1:
                return (
                  n.sent(),
                  this.aiReqMsgs.push(i.content),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log("sendAIProxyActive success:", i),
                  [3, 3]
                );
              case 2:
                throw (
                  (a = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error("sendAIProxyActive failed:", a.toString()),
                  this.onSendAIProxyErrorHandler(a.code),
                  a
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype._onProxyAIModelCall = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("_onProxyAIModelCall", e),
          this.requestIds.includes(e.requestId) &&
            (200 === e.code
              ? this.aiResMsgs.push(e.content.msg)
              : (this.aiReqMsgs.pop(),
                this.onSendAIProxyErrorHandler(e.code))));
      }),
      i
    );
  })(),
  Er = (function () {
    function i(e) {
      ((this.rootStore = e),
        (this.selectedContactType = ""),
        (this.selectedConversation = ""),
        (this.logger = null),
        bn(this),
        (this.logger = e.logger));
    }
    return (
      (i.prototype.resetState = function () {
        ((this.selectedContactType = ""), (this.selectedConversation = ""));
      }),
      (i.prototype.destroy = function () {
        this.resetState();
      }),
      (i.prototype.selectContactType = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("selectContactType: ", e),
          (this.selectedContactType = e));
      }),
      (i.prototype.unselectContactType = function () {
        var e;
        (null === (e = this.logger) ||
          void 0 === e ||
          e.log("unselectContactType"),
          (this.selectedContactType = ""));
      }),
      (i.prototype.selectConversation = function (e) {
        var i, o, r, s, a, c;
        return t(this, void 0, void 0, function () {
          return n(this, function (t) {
            switch (t.label) {
              case 0:
                return (
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("selectConversation: ", e),
                  e === this.selectedConversation
                    ? [2]
                    : (this.rootStore.msgStore.msgs.resetLimitState(),
                      (this.selectedConversation = e),
                      e
                        ? (
                            null === (o = this.rootStore.sdkOptions) ||
                            void 0 === o
                              ? void 0
                              : o.enableV2CloudConversation
                          )
                          ? (null === (r = this.rootStore.conversationStore) ||
                              void 0 === r ||
                              r.resetConversationAit(e),
                            [
                              4,
                              null === (s = this.rootStore.conversationStore) ||
                              void 0 === s
                                ? void 0
                                : s.resetConversation(e),
                            ])
                          : [3, 2]
                        : [3, 4])
                );
              case 1:
                return (t.sent(), [3, 4]);
              case 2:
                return (
                  null === (a = this.rootStore.localConversationStore) ||
                    void 0 === a ||
                    a.resetConversationAit(e),
                  [
                    4,
                    null === (c = this.rootStore.localConversationStore) ||
                    void 0 === c
                      ? void 0
                      : c.resetConversation(e),
                  ]
                );
              case 3:
                (t.sent(), (t.label = 4));
              case 4:
                return [2];
            }
          });
        });
      }),
      (i.prototype.unselectConversation = function () {
        var e;
        (null === (e = this.logger) ||
          void 0 === e ||
          e.log("unselectConversation"),
          (this.selectedConversation = ""),
          this.rootStore.msgStore.msgs.resetLimitState());
      }),
      (i.prototype.getRelation = function (e) {
        return {
          relation:
            this.rootStore.userStore.myUserInfo.accountId === e
              ? "myself"
              : this.rootStore.aiUserStore.aiUsers.has(e)
                ? "ai"
                : this.rootStore.friendStore.friends.has(e)
                  ? "friend"
                  : "stranger",
          isInBlacklist: this.rootStore.relationStore.isInBlacklist(e),
        };
      }),
      (i.prototype.getFriendWithUserNameCard = function (t) {
        var n = this.rootStore.friendStore.friends.get(t) || {
            accountId: "",
            serverExtension: "",
            customerExtension: "",
          },
          i = this.rootStore.userStore.users.get(t) || {
            accountId: "",
            name: "",
            createTime: Date.now(),
          };
        return e(e({}, n), i);
      }),
      (i.prototype.getAppellation = function (e) {
        var t,
          n = e.account,
          i = e.teamId,
          o = void 0 === i ? "" : i,
          r = e.ignoreAlias,
          s = void 0 !== r && r,
          a = e.nickFromMsg,
          c = void 0 === a ? "" : a,
          u = this.rootStore.aiUserStore.aiUsers.get(n);
        if (u) return u.name || n;
        var l = this.rootStore.friendStore.friends.get(n),
          d = this.rootStore.userStore.users.get(n),
          h =
            null === (t = this.rootStore.teamMemberStore.teamMembers.get(o)) ||
            void 0 === t
              ? void 0
              : t.get(n);
        return (
          (!s && (null == l ? void 0 : l.alias)) ||
          (null == h ? void 0 : h.teamNick) ||
          (null == d ? void 0 : d.name) ||
          c ||
          n
        );
      }),
      Object.defineProperty(i.prototype, "friends", {
        get: function () {
          return r([], o(this.rootStore.friendStore.friends.values()), !1);
        },
        enumerable: !1,
        configurable: !0,
      }),
      Object.defineProperty(i.prototype, "conversations", {
        get: function () {
          var e;
          return (
            null === (e = this.rootStore.conversationStore) || void 0 === e
              ? void 0
              : e.conversations.values()
          )
            ? r(
                [],
                o(this.rootStore.conversationStore.conversations.values()),
                !1
              )
            : [];
        },
        enumerable: !1,
        configurable: !0,
      }),
      Object.defineProperty(i.prototype, "localConversations", {
        get: function () {
          var e;
          return (
            null === (e = this.rootStore.localConversationStore) || void 0 === e
              ? void 0
              : e.conversations.values()
          )
            ? r(
                [],
                o(this.rootStore.localConversationStore.conversations.values()),
                !1
              )
            : [];
        },
        enumerable: !1,
        configurable: !0,
      }),
      Object.defineProperty(i.prototype, "users", {
        get: function () {
          return r([], o(this.rootStore.userStore.users.values()), !1);
        },
        enumerable: !1,
        configurable: !0,
      }),
      Object.defineProperty(i.prototype, "teamList", {
        get: function () {
          return r([], o(this.rootStore.teamStore.teams.values()), !1)
            .filter(function (e) {
              return e.isValidTeam;
            })
            .sort(function (e, t) {
              return t.createTime - e.createTime;
            });
        },
        enumerable: !1,
        configurable: !0,
      }),
      Object.defineProperty(i.prototype, "applyMsgs", {
        get: function () {
          return r(
            [],
            o(this.rootStore.sysMsgStore.friendApplyMsg.values()),
            !1
          );
        },
        enumerable: !1,
        configurable: !0,
      }),
      i
    );
  })(),
  kr = (function () {
    function e(e, t) {
      ((this.rootStore = e), (this.nim = t), bn(this));
    }
    return (
      (e.prototype.uploadFileActive = function (e) {
        return t(this, void 0, void 0, function () {
          var t, i, o, r;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                if ((pr.log("uploadFileActive", e), !e))
                  throw (
                    (t = "upload avatar error, no file or filepath"),
                    pr.warn(t),
                    new Error(t)
                  );
                ((i = ""), (n.label = 1));
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  (o = this.nim.V2NIMStorageService.createUploadFileTask({
                    fileObj: e,
                  })),
                  [
                    4,
                    this.nim.V2NIMStorageService.uploadFile(o, function () {}),
                  ]
                );
              case 2:
                return ((i = n.sent()), [3, 4]);
              case 3:
                throw ((r = n.sent()), pr.warn("upload avatar error ", r), r);
              case 4:
                return [2, i];
            }
          });
        });
      }),
      e
    );
  })(),
  Vr = "10.9.30",
  Pr = (function () {
    function i(e, t) {
      ((this.rootStore = e),
        (this.nim = t),
        (this.conversations = new Map()),
        (this.totalUnreadCount = 0),
        (this.logger = null),
        bn(this),
        (this._onSyncStarted = this._onSyncStarted.bind(this)),
        (this._onSyncFinished = this._onSyncFinished.bind(this)),
        (this._onSyncFailed = this._onSyncFailed.bind(this)),
        (this._onConversationCreated = this._onConversationCreated.bind(this)),
        (this._onConversationDeleted = this._onConversationDeleted.bind(this)),
        (this._onConversationChanged = this._onConversationChanged.bind(this)),
        (this._onTotalUnreadCountChanged =
          this._onTotalUnreadCountChanged.bind(this)),
        (this.logger = e.logger),
        t.V2NIMLocalConversationService.on(
          "onSyncStarted",
          this._onSyncStarted
        ),
        t.V2NIMLocalConversationService.on(
          "onSyncFinished",
          this._onSyncFinished
        ),
        t.V2NIMLocalConversationService.on("onSyncFailed", this._onSyncFailed),
        t.V2NIMLocalConversationService.on(
          "onConversationCreated",
          this._onConversationCreated
        ),
        t.V2NIMLocalConversationService.on(
          "onConversationDeleted",
          this._onConversationDeleted
        ),
        t.V2NIMLocalConversationService.on(
          "onConversationChanged",
          this._onConversationChanged
        ),
        t.V2NIMLocalConversationService.on(
          "onTotalUnreadCountChanged",
          this._onTotalUnreadCountChanged
        ));
    }
    return (
      (i.prototype.resetState = function () {
        var e;
        (null === (e = this.logger) ||
          void 0 === e ||
          e.log("LocalConversationStore Conversation resetState"),
          this.conversations.clear(),
          (this.totalUnreadCount = 0));
      }),
      (i.prototype.destroy = function () {
        (this.resetState(),
          this.nim.V2NIMLocalConversationService.off(
            "onSyncStarted",
            this._onSyncStarted
          ),
          this.nim.V2NIMLocalConversationService.off(
            "onSyncFinished",
            this._onSyncFinished
          ),
          this.nim.V2NIMLocalConversationService.off(
            "onSyncFailed",
            this._onSyncFailed
          ),
          this.nim.V2NIMLocalConversationService.off(
            "onConversationCreated",
            this._onConversationCreated
          ),
          this.nim.V2NIMLocalConversationService.off(
            "onConversationDeleted",
            this._onConversationDeleted
          ),
          this.nim.V2NIMLocalConversationService.off(
            "onConversationChanged",
            this._onConversationChanged
          ),
          this.nim.V2NIMLocalConversationService.off(
            "onTotalUnreadCountChanged",
            this._onTotalUnreadCountChanged
          ));
      }),
      (i.prototype.addConversation = function (i) {
        var o = this;
        i.filter(function (e) {
          return !!e.conversationId;
        })
          .filter(function (e) {
            return [1, 2].includes(e.type);
          })
          .forEach(function (i) {
            return t(o, void 0, void 0, function () {
              var t;
              return n(this, function (n) {
                return (
                  (t = this.conversations.get(i.conversationId)),
                  this.conversations.set(i.conversationId, e(e({}, t), i)),
                  [2]
                );
              });
            });
          });
      }),
      (i.prototype.updateConversation = function (t) {
        var n = this;
        t.filter(function (e) {
          return !!e.conversationId;
        })
          .filter(function (e) {
            return [1, 2].includes(e.type);
          })
          .forEach(function (t) {
            var i = n.conversations.get(t.conversationId);
            n.conversations.set(t.conversationId, e(e({}, i), t));
          });
      }),
      (i.prototype.removeConversation = function (e) {
        var t = this;
        e.forEach(function (e) {
          (t.conversations.delete(e),
            t.rootStore.uiStore.selectedConversation === e &&
              t.rootStore.uiStore.unselectConversation());
        });
      }),
      (i.prototype.resetConversation = function (e) {
        var i, o, r, s;
        return t(this, void 0, void 0, function () {
          var t, a;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                if (
                  (null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("LocalConversationStore resetConversation", e),
                  !(t = this.conversations.get(e)))
                )
                  return (
                    null === (o = this.logger) ||
                      void 0 === o ||
                      o.warn(
                        "LocalConversationStore resetConversation: conversation is not found.",
                        e
                      ),
                    [2]
                  );
                n.label = 1;
              case 1:
                return (
                  n.trys.push([1, 4, , 5]),
                  t.unreadCount
                    ? (this._resetMemoryConversationUnreadCount(t),
                      [
                        4,
                        this.nim.V2NIMLocalConversationService.clearUnreadCountByIds(
                          [t.conversationId]
                        ),
                      ])
                    : [3, 3]
                );
              case 2:
                (n.sent(),
                  this._resetMemoryConversationUnreadCount(t),
                  (n.label = 3));
              case 3:
                return (
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log("LocalConversationStore resetConversation success"),
                  [3, 5]
                );
              case 4:
                throw (
                  (a = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error(
                      "LocalConversationStore resetConversation failed: ",
                      a
                    ),
                  a
                );
              case 5:
                return [2];
            }
          });
        });
      }),
      (i.prototype.insertConversationActive = function (e, i, o) {
        var r, s, a;
        return (
          void 0 === o && (o = !0),
          t(this, void 0, void 0, function () {
            var t, c, u;
            return n(this, function (n) {
              switch (n.label) {
                case 0:
                  if (
                    (n.trys.push([0, 5, , 6]),
                    null === (r = this.logger) ||
                      void 0 === r ||
                      r.log("LocalConversationStore insertConversationActive", {
                        conversationType: e,
                        receiverId: i,
                        isSelected: o,
                      }),
                    (t = ""),
                    1 === e)
                  )
                    t = this.nim.V2NIMConversationIdUtil.p2pConversationId(i);
                  else {
                    if (2 !== e)
                      throw new Error("Unsupported conversation type");
                    t = this.nim.V2NIMConversationIdUtil.teamConversationId(i);
                  }
                  return this.conversations.has(t)
                    ? [3, 2]
                    : [
                        4,
                        this.nim.V2NIMLocalConversationService.createConversation(
                          t
                        ),
                      ];
                case 1:
                  ((c = n.sent()), this.addConversation([c]), (n.label = 2));
                case 2:
                  return o
                    ? [4, this.rootStore.uiStore.selectConversation(t)]
                    : [3, 4];
                case 3:
                  (n.sent(), (n.label = 4));
                case 4:
                  return (
                    null === (s = this.logger) ||
                      void 0 === s ||
                      s.log(
                        "LocalConversationStore insertConversationActive success",
                        { conversationType: e, receiverId: i, isSelected: o }
                      ),
                    [3, 6]
                  );
                case 5:
                  throw (
                    (u = n.sent()),
                    null === (a = this.logger) ||
                      void 0 === a ||
                      a.error(
                        "LocalConversationStore insertConversationActive failed: ",
                        { conversationType: e, receiverId: i, isSelected: o },
                        u
                      ),
                    u
                  );
                case 6:
                  return [2];
              }
            });
          })
        );
      }),
      (i.prototype.deleteConversationActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                (n.trys.push([0, 6, , 7]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("LocalConversationStore deleteConversationActive", e),
                  (n.label = 1));
              case 1:
                return (
                  n.trys.push([1, 3, , 4]),
                  [4, this.stickTopConversationActive(e, !1)]
                );
              case 2:
              case 3:
                return (n.sent(), [3, 4]);
              case 4:
                return (
                  this.removeConversation([e]),
                  [
                    4,
                    this.nim.V2NIMLocalConversationService.deleteConversation(
                      e,
                      !1
                    ),
                  ]
                );
              case 5:
                return (
                  n.sent(),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log(
                      "LocalConversationStore deleteConversationActive success"
                    ),
                  [3, 7]
                );
              case 6:
                return (
                  (t = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.warn(
                      "LocalConversationStore deleteConversationActive failed but continue: ",
                      t
                    ),
                  [3, 7]
                );
              case 7:
                return [2];
            }
          });
        });
      }),
      (i.prototype.stickTopConversationActive = function (e, i) {
        var o, r, s;
        return t(this, void 0, void 0, function () {
          var t;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log(
                      "LocalConversationStore stickTopConversationActive",
                      e,
                      i
                    ),
                  [
                    4,
                    this.nim.V2NIMLocalConversationService.stickTopConversation(
                      e,
                      i
                    ),
                  ]
                );
              case 1:
                return (
                  n.sent(),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log(
                      "LocalConversationStore stickTopConversationActive success"
                    ),
                  [3, 3]
                );
              case 2:
                throw (
                  (t = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error(
                      "LocalConversationStore stickTopConversationActive failed: ",
                      t
                    ),
                  t
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.getConversationListActive = function (e, i) {
        var o, r, s;
        return t(this, void 0, void 0, function () {
          var t, a;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 3, , 4]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log(
                      "LocalConversationStore getConversationListActive",
                      e,
                      i
                    ),
                  [
                    4,
                    this.nim.V2NIMLocalConversationService.getConversationList(
                      e,
                      i
                    ),
                  ]
                );
              case 1:
                return (
                  (t = n.sent()),
                  this.addConversation(t.conversationList),
                  [
                    4,
                    this.getP2PMessageReceipt(
                      t.conversationList
                        .filter(function (e) {
                          return 1 === e.type;
                        })
                        .map(function (e) {
                          return e.conversationId;
                        })
                    ),
                  ]
                );
              case 2:
                return (
                  n.sent(),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log(
                      "LocalConversationStore getConversationListActive success",
                      e,
                      i,
                      t
                    ),
                  [2, t]
                );
              case 3:
                throw (
                  (a = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error(
                      "LocalConversationStore getConversationListActive failed: ",
                      a,
                      e,
                      i
                    ),
                  a
                );
              case 4:
                return [2];
            }
          });
        });
      }),
      (i.prototype.getP2PMessageReceipt = function (i) {
        var o, r, s;
        return t(this, void 0, void 0, function () {
          var t,
            a,
            c,
            u = this;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log("LocalConversationStore getP2PMessageReceipt", i),
                  [
                    4,
                    Promise.all(
                      i.map(function (e) {
                        return u.nim.V2NIMMessageService.getP2PMessageReceipt(
                          e
                        );
                      })
                    ),
                  ]
                );
              case 1:
                return (
                  (t = n.sent()),
                  (a = t
                    .map(function (t) {
                      var n = u.conversations.get(t.conversationId);
                      if (n)
                        return e(e({}, n), { msgReceiptTime: t.timestamp });
                    })
                    .filter(function (e) {
                      return !!e;
                    })),
                  this.updateConversation(a),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.log(
                      "LocalConversationStore getP2PMessageReceipt success",
                      i,
                      t
                    ),
                  [2, t]
                );
              case 2:
                throw (
                  (c = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error(
                      "LocalConversationStore getP2PMessageReceipt failed: ",
                      c,
                      i
                    ),
                  c
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype._resetMemoryConversationUnreadCount = function (t) {
        var n = this.conversations.get(t.conversationId);
        n && this.updateConversation([e(e({}, n), { unreadCount: 0 })]);
      }),
      (i.prototype.getConversationReadTimeActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log(
                      "LocalConversationStore getConversationReadTimeActive",
                      e
                    ),
                  [
                    4,
                    this.nim.V2NIMLocalConversationService.getConversationReadTime(
                      e
                    ),
                  ]
                );
              case 1:
                return (
                  (t = n.sent()),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log(
                      "LocalConversationStore getConversationReadTimeActive success",
                      e,
                      t
                    ),
                  [2, t]
                );
              case 2:
                throw (
                  (s = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error(
                      "LocalConversationStore getConversationReadTimeActive failed: ",
                      s,
                      e
                    ),
                  s
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.markConversationReadActive = function (e) {
        var i, o, r;
        return t(this, void 0, void 0, function () {
          var t, s;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log(
                      "LocalConversationStore markConversationReadActive",
                      e
                    ),
                  [
                    4,
                    this.nim.V2NIMLocalConversationService.markConversationRead(
                      e
                    ),
                  ]
                );
              case 1:
                return (
                  (t = n.sent()),
                  null === (o = this.logger) ||
                    void 0 === o ||
                    o.log(
                      "LocalConversationStore markConversationReadActive success",
                      e,
                      t
                    ),
                  [2, t]
                );
              case 2:
                throw (
                  (s = n.sent()),
                  null === (r = this.logger) ||
                    void 0 === r ||
                    r.error(
                      "LocalConversationStore markConversationReadActive failed: ",
                      s,
                      e
                    ),
                  s
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (i.prototype.handleConversationWithAit = function (i) {
        var s = this;
        i.map(function (i) {
          return t(s, void 0, void 0, function () {
            var t, s, a, c, u, l, d;
            return n(this, function (n) {
              switch (n.label) {
                case 0:
                  return 2 !== i.conversationType && 3 !== i.conversationType
                    ? [3, 2]
                    : (null == i ? void 0 : i.serverExtension)
                      ? ((t = this.hasAitMsg([i.serverExtension])),
                        [
                          4,
                          this.getConversationReadTimeActive(i.conversationId),
                        ])
                      : [3, 2];
                case 1:
                  ((s = n.sent()),
                    (a =
                      i.conversationId ==
                      this.rootStore.uiStore.selectedConversation),
                    (c =
                      i.senderId ===
                      (null === (d = this.rootStore.userStore.myUserInfo) ||
                      void 0 === d
                        ? void 0
                        : d.accountId)),
                    i.createTime > s &&
                      t &&
                      !a &&
                      !c &&
                      ((u = this.conversations.get(i.conversationId))
                        ? 0 === (l = u.aitMsgs || []).length
                          ? this.updateConversation([
                              e(e({}, u), { aitMsgs: [i.messageClientId] }),
                            ])
                          : this.updateConversation([
                              e(e({}, u), {
                                aitMsgs: r(
                                  r([], o(l), !1),
                                  [i.messageClientId],
                                  !1
                                ),
                              }),
                            ])
                        : this.addConversation([
                            {
                              conversationId: i.conversationId,
                              type: i.conversationType,
                              aitMsgs: [i.messageClientId],
                            },
                          ])),
                    (n.label = 2));
                case 2:
                  return [2];
              }
            });
          });
        });
      }),
      (i.prototype.resetConversationAit = function (t) {
        var n = this.conversations.get(t);
        (2 !== (null == n ? void 0 : n.type) &&
          3 !== (null == n ? void 0 : n.type)) ||
          this.updateConversation([e(e({}, n), { aitMsgs: [] })]);
      }),
      (i.prototype.hasAitMsg = function (e) {
        var t = this,
          n = !1;
        return (
          (null == e ? void 0 : e.length) &&
            (null == e ||
              e.forEach(function (e) {
                var i, o;
                try {
                  var r = JSON.parse(e || "{}").yxAitMsg,
                    s = t.rootStore.userStore.myUserInfo.accountId;
                  r &&
                    (null === (i = Object.keys(r)) ||
                      void 0 === i ||
                      i.forEach(function (e) {
                        (e !== s && e !== Ai) || (n = !0);
                      }));
                } catch (n) {
                  null === (o = t.logger) ||
                    void 0 === o ||
                    o.error(
                      "LocalConversationStore parse serverExtension failed: ",
                      e
                    );
                }
              })),
          n
        );
      }),
      (i.prototype._onSyncStarted = function () {
        var e, t;
        (null === (e = this.logger) ||
          void 0 === e ||
          e.log("LocalConversationStore _onSyncStarted"),
          null === (t = this.rootStore.localConversationStore) ||
            void 0 === t ||
            t.getConversationListActive(
              0,
              this.rootStore.localOptions.conversationLimit || 100
            ));
      }),
      (i.prototype._onSyncFinished = function () {
        var e, i;
        return t(this, void 0, void 0, function () {
          return n(this, function (t) {
            return (
              null === (e = this.logger) ||
                void 0 === e ||
                e.log("LocalConversationStore _onSyncFinished"),
              null === (i = this.rootStore.localConversationStore) ||
                void 0 === i ||
                i.getConversationListActive(
                  0,
                  this.rootStore.localOptions.conversationLimit || 100
                ),
              [2]
            );
          });
        });
      }),
      (i.prototype._onSyncFailed = function (e) {
        var t;
        null === (t = this.logger) ||
          void 0 === t ||
          t.log("LocalConversationStore _onSyncFailed", e);
      }),
      (i.prototype._onConversationCreated = function (t) {
        var n,
          i = this;
        if (
          (null === (n = this.logger) ||
            void 0 === n ||
            n.log("LocalConversationStore _onConversationCreated", t),
          2 === t.type)
        )
          this.nim.V2NIMLocalConversationService.getConversation(
            t.conversationId
          ).then(function (t) {
            (i.addConversation([t]),
              t.lastMessage &&
                i.handleConversationWithAit([
                  e(e({}, t.lastMessage), t.lastMessage.messageRefer),
                ]));
          });
        else if ((this.addConversation([t]), 1 === t.type)) {
          var o = t.conversationId;
          this.nim.V2NIMMessageService.getP2PMessageReceipt(o).then(
            function (t) {
              var n = i.conversations.get(o);
              n &&
                i.updateConversation([
                  e(e({}, n), { msgReceiptTime: t.timestamp }),
                ]);
            }
          );
        }
      }),
      (i.prototype._onConversationDeleted = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("LocalConversationStore _onConversationDeleted", e),
          this.removeConversation(e));
      }),
      (i.prototype._onConversationChanged = function (e) {
        var i;
        return t(this, void 0, void 0, function () {
          var o = this;
          return n(this, function (r) {
            return (
              null === (i = this.logger) ||
                void 0 === i ||
                i.log("LocalConversationStore _onConversationChanged", e),
              this.addConversation(e),
              e.forEach(function (e) {
                return t(o, void 0, void 0, function () {
                  var t, i, o, r, s, a;
                  return n(this, function (n) {
                    switch (n.label) {
                      case 0:
                        return (
                          (t =
                            null === (o = e.lastMessage) || void 0 === o
                              ? void 0
                              : o.attachment),
                          (i = null == t ? void 0 : t.type),
                          5 ===
                            (null === (r = e.lastMessage) || void 0 === r
                              ? void 0
                              : r.messageType) &&
                          ((1 === i &&
                            (null === (s = null == t ? void 0 : t.targetIds) ||
                            void 0 === s
                              ? void 0
                              : s.includes(
                                  this.rootStore.userStore.myUserInfo.accountId
                                ))) ||
                            (2 === i &&
                              (null === (a = e.lastMessage) || void 0 === a
                                ? void 0
                                : a.messageRefer.senderId) ===
                                this.rootStore.userStore.myUserInfo
                                  .accountId) ||
                            4 === i)
                            ? [
                                4,
                                this.deleteConversationActive(e.conversationId),
                              ]
                            : [3, 2]
                        );
                      case 1:
                        return (n.sent(), [3, 4]);
                      case 2:
                        return this.rootStore.uiStore.selectedConversation !==
                          e.conversationId
                          ? [3, 4]
                          : [4, this.resetConversation(e.conversationId)];
                      case 3:
                        (n.sent(), (n.label = 4));
                      case 4:
                        return (
                          2 === e.type &&
                            0 == e.unreadCount &&
                            this.resetConversationAit(e.conversationId),
                          [2]
                        );
                    }
                  });
                });
              }),
              [2]
            );
          });
        });
      }),
      (i.prototype._onTotalUnreadCountChanged = function (e) {
        var t;
        (null === (t = this.logger) ||
          void 0 === t ||
          t.log("LocalConversationStore _onTotalUnreadCountChanged", e),
          (this.totalUnreadCount = e));
      }),
      i
    );
  })(),
  Ur = (function () {
    function e(e, t) {
      ((this.rootStore = e),
        (this.nim = t),
        (this.stateMap = new Map()),
        (this.logger = null),
        bn(this),
        (this._onUserStatusChanged = this._onUserStatusChanged.bind(this)),
        this.nim.V2NIMSubscriptionService.on(
          "onUserStatusChanged",
          this._onUserStatusChanged
        ),
        (this.logger = e.logger));
    }
    return (
      (e.prototype.resetState = function () {
        var e;
        (null === (e = this.logger) ||
          void 0 === e ||
          e.log("SubscriptionStore resetState"),
          this.stateMap.clear());
      }),
      (e.prototype.destroy = function () {
        (this.resetState(),
          this.nim.V2NIMSubscriptionService.off(
            "onUserStatusChanged",
            this._onUserStatusChanged
          ));
      }),
      (e.prototype.getUserStatus = function (e) {
        return this.stateMap.get(e);
      }),
      (e.prototype.getUserStatusList = function () {
        return r([], o(this.stateMap.values()), !1);
      }),
      (e.prototype.subscribeUserStatusActive = function (e) {
        var i, o, r, s;
        return t(this, void 0, void 0, function () {
          var t, a;
          return n(this, function (n) {
            switch (n.label) {
              case 0:
                return (
                  n.trys.push([0, 2, , 3]),
                  null === (i = this.logger) ||
                    void 0 === i ||
                    i.log("subscribeUserStatusActive", e),
                  [
                    4,
                    this.nim.V2NIMSubscriptionService.subscribeUserStatus({
                      accountIds: e,
                      duration: 604800,
                      immediateSync: !0,
                    }),
                  ]
                );
              case 1:
                return (t = n.sent()).length > 0
                  ? (null === (o = this.logger) ||
                      void 0 === o ||
                      o.warn("subscribeUserStatusActive failed accounts", t),
                    [2, t])
                  : (null === (r = this.logger) ||
                      void 0 === r ||
                      r.log("subscribeUserStatusActive success"),
                    [3, 3]);
              case 2:
                return (
                  (a = n.sent()),
                  null === (s = this.logger) ||
                    void 0 === s ||
                    s.error("subscribeUserStatusActive err", a),
                  [3, 3]
                );
              case 3:
                return [2];
            }
          });
        });
      }),
      (e.prototype._onUserStatusChanged = function (e) {
        var t, n, o;
        null === (o = this.logger) ||
          void 0 === o ||
          o.log("_onUserStatusChanged", e);
        try {
          for (var r = i(e), s = r.next(); !s.done; s = r.next()) {
            var a = s.value;
            this.stateMap.set(a.accountId, a);
          }
        } catch (e) {
          t = { error: e };
        } finally {
          try {
            s && !s.done && (n = r.return) && n.call(r);
          } finally {
            if (t) throw t.error;
          }
        }
      }),
      e
    );
  })(),
  xr = (function () {
    function i(i, o, r) {
      void 0 === r && (r = "Web");
      var s,
        a,
        c,
        u,
        l,
        d = this;
      ((this.localOptions = {
        addFriendNeedVerify: !0,
        teamJoinMode: 0,
        teamAgreeMode: 1,
        teamInviteMode: 0,
        teamUpdateTeamMode: 0,
        teamUpdateExtMode: 1,
        enableTeam: !0,
        enableChangeTeamJoinMode: !0,
        enableChangeTeamAgreeMode: !0,
        leaveOnTransfer: !1,
        needMention: !0,
        p2pMsgReceiptVisible: !1,
        teamMsgReceiptVisible: !1,
        loginStateVisible: !1,
        allowTransferTeamOwner: !1,
        teamManagerVisible: !1,
        aiVisible: !0,
        teamManagerLimit: 10,
        sendMsgBefore: function (e) {
          return t(d, void 0, void 0, function () {
            return n(this, function (t) {
              return [2, e];
            });
          });
        },
        aiUserAgentProvider: {},
        conversationLimit: 100,
        debug: "debug",
        aiStream: !0,
        iconfontUrl: [],
      }),
        (this.sdkOptions = {}),
        (this.conversationStore = null),
        (this.localConversationStore = null),
        (this.logger = null),
        bn(this),
        (this.nim = i),
        (this.localOptions = e(e({}, this.localOptions), o)),
        (this.logger =
          "off" ==
          (null === (s = this.localOptions) || void 0 === s ? void 0 : s.debug)
            ? null
            : dr({
                level:
                  null === (a = this.localOptions) || void 0 === a
                    ? void 0
                    : a.debug,
                version: gr,
                appName: fr,
                needStringify: !1,
              })),
        null === (c = this.logger) ||
          void 0 === c ||
          c.log("store init", { localOptions: this.localOptions }),
        (this.sdkOptions = e(
          {},
          null === (u = this.nim) || void 0 === u ? void 0 : u.getOptions()
        )),
        (this.connectStore = new Si(this, i, this.localOptions)),
        (this.friendStore = new Mi(this, i)),
        (this.msgStore = new Cr(this, i, this.localOptions)),
        (this.relationStore = new Ir(this, i)),
        (
          null === (l = this.sdkOptions) || void 0 === l
            ? void 0
            : l.enableV2CloudConversation
        )
          ? (this.conversationStore = new Tr(this, i))
          : (this.localConversationStore = new Pr(this, i)),
        (this.teamStore = new wr(this, i, this.localOptions)),
        (this.teamMemberStore = new Or(this, i)),
        (this.sysMsgStore = new Rr(this, i)),
        (this.userStore = new Nr(this, i)),
        (this.aiUserStore = new Lr(this, i, this.localOptions)),
        (this.uiStore = new Er(this)),
        (this.storageStore = new kr(this, i)),
        (this.subscriptionStore = new Ur(this, i)));
      ["ContactKit", "ConversationKit", "ChatKit", "SearchKit"].forEach(
        function (e) {
          new rr({
            appKey: d.nim.options.appkey,
            version: "",
            component: e,
            imVersion: Vr,
            platform: r,
            channel: "netease",
            os: "",
            framework: "",
            language: "",
            container: _r(r),
          }).track("init", "");
        }
      );
    }
    return (
      (i.prototype.resetState = function () {
        var e, t, n, i;
        (null === (e = this.logger) ||
          void 0 === e ||
          e.log("store resetState"),
          this.friendStore.resetState(),
          this.msgStore.resetState(),
          this.relationStore.resetState(),
          (
            null === (t = this.sdkOptions) || void 0 === t
              ? void 0
              : t.enableV2CloudConversation
          )
            ? null === (n = this.conversationStore) ||
              void 0 === n ||
              n.resetState()
            : null === (i = this.localConversationStore) ||
              void 0 === i ||
              i.resetState(),
          this.teamStore.resetState(),
          this.teamMemberStore.resetState(),
          this.sysMsgStore.resetState(),
          this.userStore.resetState(),
          this.aiUserStore.resetState(),
          this.uiStore.resetState(),
          this.subscriptionStore.resetState());
      }),
      (i.prototype.destroy = function () {
        var e, t, n;
        (pr.log("store destroyed"),
          this.connectStore.destroy(),
          this.friendStore.destroy(),
          this.msgStore.destroy(),
          this.relationStore.destroy(),
          (
            null === (e = this.sdkOptions) || void 0 === e
              ? void 0
              : e.enableV2CloudConversation
          )
            ? null === (t = this.conversationStore) ||
              void 0 === t ||
              t.destroy()
            : null === (n = this.localConversationStore) ||
              void 0 === n ||
              n.destroy(),
          this.teamStore.destroy(),
          this.teamMemberStore.destroy(),
          this.sysMsgStore.destroy(),
          this.userStore.destroy(),
          this.aiUserStore.destroy(),
          this.uiStore.destroy(),
          this.subscriptionStore.destroy());
      }),
      (i.getInstance = function (e, t, n) {
        return (
          void 0 === n && (n = "Web"),
          this.ins || (this.ins = new i(e, t, n)),
          this.ins
        );
      }),
      i
    );
  })();
export {
  Lr as AIUserStore,
  Si as ConnectStore,
  Tr as ConversationStore,
  Mi as FriendStore,
  Pr as LocalConversationStore,
  Cr as MsgStore,
  Ir as RelationStore,
  xr as RootStore,
  kr as StorageStore,
  Ur as SubscriptionStore,
  Rr as SysMsgStore,
  Or as TeamMemberStore,
  wr as TeamStore,
  Er as UiStore,
  Nr as UserStore,
  Ft as action,
  Kt as autorun,
  Je as computed,
  xr as default,
  bn as makeAutoObservable,
  je as observable,
  Wt as reaction,
  Bt as runInAction,
  Ii as storeConstants,
  br as storeUtils,
  un as when,
};
