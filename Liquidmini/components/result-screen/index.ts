/** The Tasting Card — hero glass + open recipe book. Ported from ResultScreen.tsx. */
import { modeById, glassById, iceById } from "../../lib/data/catalog";
import { geomFor, servedFill } from "../../lib/data/glasses";
import { liquidRamp, isFizzy, rampFromColor } from "../../lib/tokens";
import { makePrepSteps, normalizePrepStepsGlass } from "../../lib/prepSteps";
import { garnishesFor } from "../../lib/data/garnish";
import { iceSwatch } from "../../lib/svg/ice";
import { glassDataUri } from "../../lib/svg/glass";
import { svgToDataUri } from "../../lib/svg/helpers";
import { drawShareCard, drawShareThumb } from "../../lib/share-card";
import { sound } from "../../lib/sound/index";
import { store } from "../../lib/store";
import { sceneForFamily } from "../../lib/config";

function dotColor(fam: string): string {
  return (liquidRamp[fam] || liquidRamp.default)[1];
}

function cardGlassSrc(result: any, targetH: number): string {
  const geom = geomFor(result.glass);
  const size = 200 * (targetH / (geom.content.bottom - geom.content.top));
  return glassDataUri({
    glassType: result.glass,
    family: result.family,
    liquidColor: result.liquidColor || undefined,
    layers: result.layers && result.layers.length ? result.layers : undefined,
    ice: result.ice,
    iceSeed: result.iceSeed || undefined,
    fillLevel: result.fillLevel != null ? result.fillLevel : servedFill(result.glass),
    fizzy: isFizzy(result.ingredients),
    garnishes: garnishesFor(result.ingredients),
    glow: false,
    size,
    fit: false,
    title: result.name,
  });
}

function loadCanvasImage(node: any, src: string, done: (img: any | null) => void): void {
  const tryLoad = (imageSrc: string, timeout: number, next: () => void) => {
    const img = node.createImage();
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (ok) done(img);
      else next();
    };
    const timer = setTimeout(() => finish(false), timeout);
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = imageSrc;
  };

  let completed = false;
  const complete = (img: any | null) => {
    if (completed) return;
    completed = true;
    done(img);
  };

  const tryLocalFile = () => {
    const marker = "data:image/svg+xml;base64,";
    if (!src.startsWith(marker) || typeof wx === "undefined" || !wx.getFileSystemManager || !wx.env) {
      complete(null);
      return;
    }
    try {
      let hash = 0;
      for (let i = 0; i < src.length; i++) hash = (hash * 31 + src.charCodeAt(i)) >>> 0;
      const filePath = `${wx.env.USER_DATA_PATH}/share-glass-${hash}.svg`;
      wx.getFileSystemManager().writeFile({
        filePath,
        data: src.slice(marker.length),
        encoding: "base64",
        success: () => tryLoad(filePath, 6000, () => complete(null)),
        fail: () => complete(null),
      });
    } catch (e) {
      complete(null);
    }
  };

  tryLoad(src, 6000, tryLocalFile);
}

Component({
  options: { styleIsolation: "apply-shared" },
  data: {
    has: false,
    fromJournal: false,
    saved: false,
    toast: "",
    hidden: false,
    modeEn: "",
    name: "",
    nameEn: "",
    emotion: "",
    ingredients: [] as any[],
    steps: [] as string[],
    glassName: "",
    iceName: "",
    taste: "",
    storyBody: "",
    storySig: "",
    heroBg: "",
    // serve chips (small art)
    glassChip: "",
    iceChip: "",
    heroScene: "",
    // hero glass props
    glassType: "rocks",
    family: "whisky",
    liquidColor: "",
    ice: "none",
    fillLevel: 0.5,
    fizzy: false,
    garnishes: [] as any[],
    layers: [] as any[],
    // export-card overlay
    exporting: false,
    showCard: false,
    cardImage: "",
    // fullscreen glass zoom
    zoom: false,
  },

  _unsub: null as null | (() => void),
  _result: null as any,
  _ramp: ["#E8A94E", "#B9742A", "#6E3E12"] as [string, string, string],
  _shareKey: "",

  lifetimes: {
    attached() {
      this._unsub = store.subscribe((s) => {
        this.build(s.lastResult, s.origin);
      });
    },
    detached() {
      if (this._unsub) this._unsub();
    },
  },

  methods: {
    build(last: any, origin: string) {
      if (!last) {
        this.setData({ has: false });
        return;
      }
      const { result, mode } = last;
      this._result = result;
      const modeMeta = modeById(mode);
      const m = result.story.match(/\n?\s*——\s*([^\n]+)\s*$/);
      const storyBody = m ? result.story.slice(0, m.index).replace(/\s+$/, "") : result.story;
      const storySig = m ? m[1].trim() : "";

      const ramp = result.liquidColor ? rampFromColor(result.liquidColor) : (liquidRamp[result.family] || liquidRamp.default);
      this._ramp = ramp;
      const heroBg = `linear-gradient(180deg, ${ramp[2]}cc, #0E0B08 80%)`;

      const fill = result.fillLevel != null ? result.fillLevel : servedFill(result.glass);
      const garnishes = garnishesFor(result.ingredients);
      const fizzy = isFizzy(result.ingredients);
      const normalizedSteps = normalizePrepStepsGlass(result, result.steps);
      const steps = normalizedSteps.length ? normalizedSteps : makePrepSteps(result);

      this.setData({
        has: true,
        fromJournal: origin === "journal",
        saved: origin === "journal",
        hidden: !!result.hidden,
        modeEn: modeMeta.nameEn,
        name: result.name,
        nameEn: result.nameEn,
        emotion: result.emotion_mapping || "",
        ingredients: result.ingredients.map((ing: any) => ({
          name: ing.name,
          nameEn: ing.nameEn || "",
          amount: ing.amount,
          dot: dotColor(ing.family || result.family),
        })),
        steps,
        glassName: glassById(result.glass).name,
        iceName: iceById(result.ice).name,
        taste: result.taste_profile,
        storyBody,
        storySig,
        heroBg,
        heroScene: sceneForFamily(result.family),
        glassChip: glassDataUri({ glassType: result.glass, family: result.family, liquidColor: result.liquidColor, fillLevel: 0.35, fizzy, size: 30, fit: true }),
        iceChip: svgToDataUri(iceSwatch(result.ice, 28)),
        glassType: result.glass,
        family: result.family,
        liquidColor: result.liquidColor || "",
        ice: result.ice,
        iceSeed: result.iceSeed || 0,
        fillLevel: fill,
        fizzy,
        garnishes,
        layers: result.layers || [],
        showCard: false,
        cardImage: "",
      });

      // pre-render the 酒名+酒杯 share thumbnail so the page's onShareAppMessage
      // can hand it to WeChat as imageUrl.
      this.genShareThumb(result);
    },

    /** Render the 5:4 share thumbnail to a temp file and stash it in the store. */
    genShareThumb(result: any) {
      const key = `${result.name}|${result.nameEn}|${result.glass}|${result.ice}|${result.iceSeed || 0}`;
      if (key === this._shareKey) return;
      this._shareKey = key;
      const title = `${result.name} · ${result.nameEn}`;
      store.setShare("", title); // title ready immediately; image follows
      let tries = 0;
      const run = () => {
        wx.createSelectorQuery()
          .in(this)
          .select("#shareCanvas")
          .fields({ node: true, size: true })
          .exec((res: any) => {
            const node = res && res[0] && res[0].node;
            if (!node) {
              if (tries++ < 8) setTimeout(run, 120);
              return;
            }
            const ctx = node.getContext("2d");
            let dpr = 2;
            try { dpr = (wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()).pixelRatio || 2; } catch (e) {}
            loadCanvasImage(node, cardGlassSrc(result, 300), (glassImg) => {
              const { W, H } = drawShareThumb(node, ctx, dpr, result, glassImg);
              const capture = () => wx.canvasToTempFilePath(
                {
                  canvas: node,
                  x: 0, y: 0, width: W, height: H,
                  destWidth: W * dpr, destHeight: H * dpr,
                  fileType: "jpg",
                  success: (rr: any) => store.setShare(rr.tempFilePath, title),
                  fail: () => {},
                },
                this,
              );
              if (node.requestAnimationFrame) node.requestAnimationFrame(capture);
              else capture();
            });
          });
      };
      run();
    },

    handleSave() {
      if (this.data.saved) {
        this.flash("已在日记中");
        return;
      }
      const r = this._result;
      const last = store.get().lastResult;
      store.saveToJournal({
        title: r.name,
        titleEn: r.nameEn,
        mode: last ? last.mode : "pure",
        drink: r.name,
        glass: r.glass,
        ice: r.ice,
        family: r.family,
        recipe: r.ingredients,
        tasting_notes: r.taste_profile,
        ai_poem: r.story,
        liquidColor: r.liquidColor,
        fillLevel: r.fillLevel,
        hidden: r.hidden,
        layers: r.layers,
        steps: r.steps,
        iceSeed: r.iceSeed,
      });
      store.addXp(20);
      this.setData({ saved: true });
      sound.play("save");
      this.flash("已封存进日记 ✦");
    },

    flash(msg: string) {
      this.setData({ toast: msg });
      setTimeout(() => this.setData({ toast: "" }), 1800);
    },

    /* ── export the tasting card as a saveable image — faithful port of the web
     *    canvas card (lib/share-card.ts). ── */
    exportCard() {
      if (this.data.exporting || !this._result) return;
      this.setData({ exporting: true });
      const r = this._result;
      wx.createSelectorQuery()
        .in(this)
        .select("#cardCanvas")
        .fields({ node: true, size: true })
        .exec((res: any) => {
          const node = res && res[0] && res[0].node;
          if (!node) { this.setData({ exporting: false }); this.flash("生成失败"); return; }
          const ctx = node.getContext("2d");
          let dpr = 2;
          try { dpr = (wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()).pixelRatio || 2; } catch (e) {}
          const render = (qrImg: any, glassImg: any) => {
            const { W, H } = drawShareCard(node, ctx, dpr, r, qrImg, glassImg);
            const capture = () => wx.canvasToTempFilePath(
              {
                canvas: node,
                x: 0, y: 0, width: W, height: H,
                destWidth: W * dpr, destHeight: H * dpr,
                fileType: "png",
                success: (rr: any) => this.setData({ exporting: false, showCard: true, cardImage: rr.tempFilePath }),
                fail: () => { this.setData({ exporting: false }); this.flash("生成失败"); },
              },
              this,
            );
            if (node.requestAnimationFrame) node.requestAnimationFrame(capture);
            else capture();
          };
          const renderWithGlass = (qrImg: any) => {
            loadCanvasImage(node, cardGlassSrc(r, 210), (glassImg) => render(qrImg, glassImg));
          };
          // load the mini-program code, but never let a missing/failed asset
          // block the export — fall back to the baked matrix.
          const qr = node.createImage();
          qr.onload = () => renderWithGlass(qr);
          qr.onerror = () => renderWithGlass(null);
          qr.src = "/assets/minicode.png";
        });
    },

    closeCard() {
      this.setData({ showCard: false });
    },
    openZoom() { this.setData({ zoom: true }); },
    closeZoom() { this.setData({ zoom: false }); },
    stop() { /* swallow taps on the card image */ },
    saveToAlbum() {
      if (!this.data.cardImage) return;
      wx.saveImageToPhotosAlbum({
        filePath: this.data.cardImage,
        success: () => this.flash("已保存到相册 ✦"),
        fail: (err: any) => {
          if (err && /auth|deny|permission/i.test(JSON.stringify(err))) {
            wx.openSetting({});
            this.flash("请在设置中允许保存到相册");
          } else {
            this.flash("长按图片即可保存");
          }
        },
      });
    },

    goHome() {
      store.home();
    },
  },
});
