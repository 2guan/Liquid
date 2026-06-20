/**
 * The poet's lexicon. Word banks the offline generator draws from to compose
 * cocktail names, stories and tasting notes in the voice of The Sip & Sigh.
 * Keyed by spirit family so vocabulary stays in character with the base.
 *
 * `adjs`/`enAdj` and `nouns`/`enNoun` are index-aligned: position i is the same
 * concept in Chinese and English, so a generated name like "孤独的高地海岸" always
 * pairs with "Lonely Highland Coast" rather than an unrelated English phrase.
 */
import type { SpiritFamily } from "@/lib/tokens";

interface FamilyVoice {
  adjs: string[];
  enAdj: string[]; // aligned with adjs
  nouns: string[];
  enNoun: string[]; // aligned with nouns
  scenes: string[];
  taste: string[];
}

export const VOICE: Record<SpiritFamily, FamilyVoice> = {
  whiskyPeat: {
    adjs: ["孤独的", "咸涩的", "烟熏的", "远征的"],
    enAdj: ["Lonely", "Briny", "Smoked", "Distant"],
    nouns: ["高地海岸", "篝火余烬", "盐雾岬角", "孤岛灯塔"],
    enNoun: ["Highland Coast", "Ember", "Brine Cape", "Lone Lighthouse"],
    scenes: [
      "海风把篝火的烟卷向礁石，浪在脚下碎成盐花",
      "灯塔的光每隔七秒扫过黑色的水面，像一句没说完的话",
      "潮水退去，留下一地被海盐腌过的石头与回忆",
    ],
    taste: ["泥煤的篝火烟熏", "海盐与黑胡椒", "碘酒般的咸鲜", "梨与蜂蜡的回甘"],
  },
  whisky: {
    adjs: ["温热的", "醇厚的", "怀旧的", "镀金的"],
    enAdj: ["Warm", "Velvet", "Nostalgic", "Gilded"],
    nouns: ["琥珀回廊", "橡木书房", "黄昏壁炉", "雪莉花园"],
    enNoun: ["Amber Corridor", "Oak Study", "Dusk Hearth", "Sherry Garden"],
    scenes: [
      "壁炉的火舌舔着橡木，时钟走得比平时更慢一些",
      "唱针落下，旧爵士在房间里铺开一层暖金色的尘",
      "窗外的黄昏把所有棱角都磨成了焦糖的弧度",
    ],
    taste: ["焦糖与干果", "橡木与香草", "生姜般的暖意", "蜂蜜与橘皮"],
  },
  gin: {
    adjs: ["清亮的", "轻盈的", "苏醒的", "葱郁的"],
    enAdj: ["Bright", "Weightless", "Waking", "Verdant"],
    nouns: ["晨雾庭院", "杜松山径", "柑橘清晨", "玻璃温室"],
    enNoun: ["Misty Courtyard", "Juniper Path", "Citrus Dawn", "Glasshouse"],
    scenes: [
      "露水还挂在杜松枝头，第一缕阳光穿过温室的玻璃",
      "柑橘的香气随风掠过庭院，把昨夜的沉闷一并带走",
      "薄荷在指尖被揉碎，整个清晨都变得透明起来",
    ],
    taste: ["杜松的清冽", "柑橘与洋甘菊", "草本的辛香", "葡萄柚的微苦"],
  },
  rum: {
    adjs: ["慵懒的", "温暖的", "丰腴的", "热带的"],
    enAdj: ["Languid", "Sun-warmed", "Mellow", "Tropic"],
    nouns: ["甘蔗海湾", "季风渡口", "可可码头", "焦糖落日"],
    enNoun: ["Sugar Bay", "Monsoon Pier", "Cacao Wharf", "Caramel Sunset"],
    scenes: [
      "棕榈的影子在沙上摇晃，季风带来甘蔗与海盐的甜",
      "落日把海面熔成一片流动的焦糖，船帆缓缓收起",
      "码头边的可可豆在阳光下发酵出深褐色的香",
    ],
    taste: ["太妃糖与可可", "甘蔗的甜润", "橙皮与香料", "烤香蕉的暖"],
  },
  tequila: {
    adjs: ["明快的", "炽烈的", "青涩的", "庆典的"],
    enAdj: ["Sunlit", "Blazing", "Green", "Festive"],
    nouns: ["龙舌兰高原", "烈日盐田", "青草荒野", "黎明仙人掌"],
    enNoun: ["Agave Plateau", "Salt Flat", "Wildflower Plain", "Daybreak Cactus"],
    scenes: [
      "烈日把龙舌兰田晒出一层银白，远处传来节庆的鼓声",
      "盐田的风咸而干燥，仙人掌的花在黎明时悄然张开",
      "广场上的人举杯，柠檬与海盐的味道在空气里炸开",
    ],
    taste: ["烤龙舌兰的青草气", "海盐与青柠", "香草与胡椒", "柑橘的明亮"],
  },
  vodka: {
    adjs: ["凛冽的", "纯净的", "透明的", "极简的"],
    enAdj: ["Frostbound", "Pure", "Glacial", "Minimal"],
    nouns: ["雪原黎明", "白桦林", "静默湖面", "霜冻清晨"],
    enNoun: ["Snowfield Dawn", "Birch Wood", "Still Lake", "Frost Morning"],
    scenes: [
      "雪原上没有一丝杂音，呼吸在零度的空气里凝成白雾",
      "白桦的影子落在结冰的湖面，世界被简化成黑与白",
      "霜在窗上画出蕨叶的纹路，清晨干净得像一张白纸",
    ],
    taste: ["小麦芯的微甜", "凛冽的干净", "杏仁的尾韵", "胡椒的细辛"],
  },
  brandy: {
    adjs: ["陈年的", "深沉的", "雍容的", "沉思的"],
    enAdj: ["Aged", "Sombre", "Regal", "Pensive"],
    nouns: ["干邑暮色", "雪松书柜", "旧城阁楼", "丁香壁龛"],
    enNoun: ["Cognac Dusk", "Cedar Shelf", "Old Attic", "Clove Alcove"],
    scenes: [
      "阁楼的木箱里封着几十年的阳光，开启时香气倾泻而出",
      "雪松与蜜饯的味道在旧书之间交叠，时间在此处放缓",
      "暮色压低了天花板，一切都浸在深琥珀色的静默里",
    ],
    taste: ["烤杏仁与丁香", "蜜饯的甜润", "雪松的木质", "葡萄的深邃"],
  },
  absinthe: {
    adjs: ["神秘的", "草木的", "幽绿的", "冥想的"],
    enAdj: ["Mystic", "Herbal", "Verdant", "Hushed"],
    nouns: ["苦艾森林", "茴香雾径", "绿色仙踪", "薄荷深谷"],
    enNoun: ["Wormwood Wood", "Anise Path", "Green Hollow", "Mint Glen"],
    scenes: [
      "苦艾的香气在雾里弥漫，森林深处传来若有若无的钟声",
      "茴香与薄荷在舌尖点燃一簇幽绿的火，思绪缓缓沉降",
      "草木的祭坛上，露水把所有声音都温柔地吸收掉了",
    ],
    taste: ["茴香与苦艾", "薄荷的清凉", "甘草的回甜", "草本的幽深"],
  },
  campari: {
    adjs: ["热烈的", "苦甜的", "猩红的", "悸动的"],
    enAdj: ["Ardent", "Bittersweet", "Crimson", "Pulsing"],
    nouns: ["猩红黄昏", "苦橙广场", "霓虹回声", "玫瑰灰烬"],
    enNoun: ["Crimson Dusk", "Bitter Plaza", "Neon Echo", "Ember Rose"],
    scenes: [
      "霓虹把广场染成猩红，苦橙的香气里藏着一点危险的甜",
      "夜色压下来，心跳与远处的低音鼓渐渐对上了节拍",
      "玫瑰在灰烬里仍然鲜艳，像一句不肯熄灭的告白",
    ],
    taste: ["苦橙与龙胆", "红色浆果的酸", "大黄的草本苦", "丁香的尾韵"],
  },
  vermouth: {
    adjs: ["绵长的", "思念的", "微苦的", "潮湿的"],
    enAdj: ["Lingering", "Longing", "Dim", "Tidal"],
    nouns: ["远洋信笺", "暮色码头", "思念灯塔", "苦橙花园"],
    enNoun: ["Ocean Letter", "Dusk Quay", "Longing Lighthouse", "Bitter Orange Garden"],
    scenes: [
      "海平线吞下最后一点光，信号灯把思念拉成一条长长的线",
      "码头的木板被潮气浸软，香草与苦橙的味道久久不散",
      "灯塔守着空旷的海，等一封永远在路上的信",
    ],
    taste: ["香草与可可", "苦橙皮的香", "丁香的暖", "草本的绵长"],
  },
  wine: {
    adjs: ["深红的", "醇厚的", "天鹅绒的", "陈酿的"],
    enAdj: ["Crimson", "Velvet", "Plush", "Vintage"],
    nouns: ["紫罗兰窖", "葡萄藤架", "深红回廊", "旧年份"],
    enNoun: ["Violet Cellar", "Vine Arbor", "Crimson Corridor", "Old Vintage"],
    scenes: [
      "酒窖的灯光昏黄，每一只木桶里都封着一个旧年份的夏天",
      "葡萄藤的影子爬满回廊，深红在杯中缓缓舒展开来",
    ],
    taste: ["黑樱桃与李子", "皮革与烟草", "天鹅绒般的单宁", "紫罗兰的香"],
  },
  cream: {
    adjs: ["绵密的", "甜软的", "云絮般的", "温柔的"],
    enAdj: ["Creamy", "Soft", "Cloudlike", "Tender"],
    nouns: ["云絮甜点", "奶白晨光", "焦糖布丁", "蜂蜜枕席"],
    enNoun: ["Cloud Dessert", "Morning Milk", "Caramel Custard", "Honey Bed"],
    scenes: [
      "晨光像奶油一样涂在被子上，世界柔软得不忍触碰",
      "焦糖在勺背上慢慢凝固，甜味把所有锋利都包了起来",
    ],
    taste: ["香草奶油的绵密", "焦糖的甜", "蜂蜜的温柔", "坚果的香"],
  },
  default: {
    adjs: ["未命名的", "流动的", "微光的", "暧昧的"],
    enAdj: ["Nameless", "Fluid", "Glowing", "Amber"],
    nouns: ["无名之境", "琥珀梦境", "微光时刻", "流体记忆"],
    enNoun: ["Nameless Realm", "Amber Dream", "Glow Moment", "Liquid Memory"],
    scenes: ["一切尚未被命名，光在杯中缓缓流动", "记忆以液体的形态留存下来"],
    taste: ["层次丰富的平衡", "温暖的回甘", "微妙的复杂度"],
  },
};

/**
 * Witty pen-names the AI critic signs off with — the playful 落款 at the end of
 * each tasting note (e.g. "千杯不醉的白领酒评师"). The LLM is asked to invent its
 * own; these are the offline pool + fallback.
 */
export const SIGNATURES: string[] = [
  "千杯不醉的白领酒评师",
  "深夜便利店哲学家",
  "把周一调成周五的魔法师",
  "永远差一杯就到家的旅人",
  "微醺比清醒更诚实的诗人",
  "调酒台后的资深失眠者",
  "替你尝遍人间百味的老饕",
  "把心事兑进苏打的调酒师",
  "宿醉也认了的浪漫主义者",
  "只在深夜营业的情绪贩子",
  "杯中窥人的街角观察家",
  "比你更懂今晚的那盏吧台灯",
  "把加班熬成余韵的夜行人",
  "用一杯酒治好电量焦虑的人",
  "醉过才懂分寸的清醒者",
  "总爱在打烊前多斟一杯的店主",
];

/** A random witty sign-off (for the offline / fallback paths). */
export const randomSignature = (): string =>
  SIGNATURES[Math.floor(Math.random() * SIGNATURES.length)];

/** Strip any existing "—— …" sign-off, then append `sig` as the new one. */
export const withSignature = (story: string, sig: string): string =>
  `${story.replace(/\s*\n?\s*——[^\n]*$/, "").trimEnd()}\n—— ${sig}`;

/** Connective fragments used to weave the emotion mapping sentence. */
export const EMOTION_BRIDGES = [
  "你说的{mood}，在我这里是",
  "我把{mood}读成了",
  "若{mood}有味道，大约就是",
  "为这份{mood}，我斟出",
];
