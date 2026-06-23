/** <bottle> — a parametric spirit bottle rendered via SVG data URI. */
import type { SpiritFamily } from "../../lib/tokens";
import { bottleDataUri, type BottleShape } from "../../lib/svg/bottle";

Component({
  properties: {
    family: { type: String, value: "whisky" },
    shape: { type: String, value: "" },
    label: { type: String, value: "" },
    fillLevel: { type: Number, value: 0.78 },
    size: { type: Number, value: 110 },
    tilt: { type: Number, value: 0 },
    glow: { type: Boolean, value: false },
    title: { type: String, value: "" },
    cssWidth: { type: String, value: "" },
    cssHeight: { type: String, value: "" },
  },
  data: { src: "" },
  lifetimes: { attached() { this.rebuild(); } },
  observers: {
    "family, shape, label, fillLevel, size, tilt, glow": function () { this.rebuild(); },
  },
  methods: {
    rebuild() {
      const p = this.properties;
      this.setData({
        src: bottleDataUri({
          family: p.family as SpiritFamily,
          shape: (p.shape || undefined) as BottleShape | undefined,
          label: p.label || undefined,
          fillLevel: p.fillLevel,
          size: p.size,
          tilt: p.tilt,
          glow: p.glow,
          title: p.title || undefined,
        }),
      });
    },
  },
});
