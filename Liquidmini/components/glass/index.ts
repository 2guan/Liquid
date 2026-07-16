/**
 * <glass> — renders a parametric cocktail glass as an SVG data URI inside an
 * <image>. Wraps lib/svg/glass so any screen can drop a faithful glass in with
 * plain properties (mirrors the web build's <Glass> component).
 */
import type { GlassType, IceType, LiquidState } from "../../lib/types";
import type { SpiritFamily, LiquidLayer } from "../../lib/tokens";
import type { GarnishSpec } from "../../lib/data/garnish";
import { glassDataUri } from "../../lib/svg/glass";

Component({
  properties: {
    glassType: { type: String, value: "rocks" },
    fillLevel: { type: Number, value: 0 },
    family: { type: String, value: "whisky" },
    liquidColor: { type: String, value: "" },
    ice: { type: String, value: "none" },
    iceSeed: { type: Number, value: 0 },
    state: { type: String, value: "still" },
    glow: { type: Boolean, value: false },
    size: { type: Number, value: 240 },
    fit: { type: Boolean, value: false },
    fizzy: { type: Boolean, value: false },
    garnishes: { type: Array, value: [] as GarnishSpec[] },
    layers: { type: Array, value: [] as LiquidLayer[] },
    title: { type: String, value: "" },
    /** CSS width/height for the wrapping image (e.g. "100%", "240rpx") */
    cssWidth: { type: String, value: "" },
    cssHeight: { type: String, value: "" },
  },
  data: {
    src: "",
  },
  lifetimes: {
    attached() {
      this.rebuild();
    },
  },
  observers: {
    "glassType, fillLevel, family, liquidColor, ice, iceSeed, state, glow, size, fit, fizzy, garnishes, layers": function () {
      this.rebuild();
    },
  },
  methods: {
    rebuild() {
      const p = this.properties;
      const src = glassDataUri({
        glassType: p.glassType as GlassType,
        fillLevel: p.fillLevel,
        family: p.family as SpiritFamily,
        liquidColor: p.liquidColor || undefined,
        ice: p.ice as IceType,
        iceSeed: p.iceSeed || undefined,
        state: p.state as LiquidState,
        glow: p.glow,
        size: p.size,
        fit: p.fit,
        fizzy: p.fizzy,
        garnishes: (p.garnishes && p.garnishes.length ? p.garnishes : undefined) as GarnishSpec[] | undefined,
        layers: (p.layers && p.layers.length ? p.layers : undefined) as LiquidLayer[] | undefined,
        title: p.title || undefined,
      });
      this.setData({ src });
    },
  },
});
