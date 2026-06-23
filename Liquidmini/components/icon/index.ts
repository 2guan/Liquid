/** <icon> — an engraved-gold line-art glyph rendered via SVG data URI. */
import { iconDataUri, type IconName } from "../../lib/svg/icons";

Component({
  properties: {
    name: { type: String, value: "home" },
    size: { type: Number, value: 22 },
    color: { type: String, value: "#C8A45D" },
    strokeWidth: { type: Number, value: 1.5 },
  },
  data: { src: "" },
  lifetimes: { attached() { this.rebuild(); } },
  observers: {
    "name, size, color, strokeWidth": function () { this.rebuild(); },
  },
  methods: {
    rebuild() {
      const p = this.properties;
      this.setData({ src: iconDataUri(p.name as IconName, p.size, p.color, p.strokeWidth) });
    },
  },
});
