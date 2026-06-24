import type { GlassType, IceType, Recipe, RecipeCategory, LiquidLayer } from "@/types";
import type { SpiritFamily } from "@/lib/tokens";
import { inferLiquidFamily } from "@/lib/tokens";
import { isGlassId } from "./glasses";

/**
 * Genuinely colour-layered drinks — bands from BOTTOM (densest) to TOP. Smooth
 * sunrise-style gradients (Tequila Sunrise, Golden Dawn…) are NOT here: their
 * `sunrise`/family ramp already renders the gradient. Keyed by nameEn.
 */
const RECIPE_LAYERS: Record<string, LiquidLayer[]> = {
  "B-52": [
    { color: "#2A180B", ratio: 1 }, // 咖啡利口酒 — dark coffee
    { color: "#E7D2A4", ratio: 1 }, // 百利甜 — Irish cream
    { color: "#D6862A", ratio: 1 }, // 金万利 — orange cognac
  ],
  "Black Velvet": [
    { color: "#150B05", ratio: 1 }, // 司陶特 — near-black stout
    { color: "#E2C870", ratio: 1 }, // 香槟 — pale gold
  ],
  "New York Sour": [
    { color: "#C6862F", ratio: 0.72 }, // 威士忌酸酒 — amber sour
    { color: "#5E1B28", ratio: 0.28 }, // 红酒漂浮 — red-wine float
  ],
  "White Russian": [
    { color: "#34200F", ratio: 0.62 }, // 伏特加 + 咖啡利口酒 — coffee
    { color: "#EFE3C6", ratio: 0.38 }, // 鲜奶油 — cream float
  ],
};

/**
 * The Mixology Chronicles recipe book — a few hundred cocktails grouped by era
 * and style (product spec §3.2). Five categories, the last alcohol-free.
 *
 * Recipes are authored in a compact row format and expanded by `build()`. Ratio
 * `parts` (used by the proportion-matching game) are derived automatically from
 * each ingredient's ml amount, so only name + amount need to be written.
 */

export interface RecipeCategoryMeta {
  id: RecipeCategory;
  name: string;
  nameEn: string;
  era: string;
  accent: string;
}

export const RECIPE_CATEGORIES: RecipeCategoryMeta[] = [
  { id: "whisky", name: "炉火琥珀", nameEn: "Whisky", era: "醇厚烈酒", accent: "#B9742A" },
  { id: "gin", name: "松林晨雾", nameEn: "Gin", era: "草本杜松", accent: "#8FA487" },
  { id: "rum", name: "碧海椰风", nameEn: "Rum", era: "甘蔗热带", accent: "#9A5826" },
  { id: "agave", name: "烈日荒漠", nameEn: "Agave", era: "烈日烟熏", accent: "#C9A85A" },
  { id: "vodka", name: "冰雪澄澈", nameEn: "Vodka", era: "纯净清冽", accent: "#A7AEA9" },
  { id: "brandy", name: "暖阳余晖", nameEn: "Brandy", era: "果香陈酿", accent: "#8A3F18" },
  { id: "aperitif", name: "苦甜微醺", nameEn: "Aperitif", era: "开胃微醺", accent: "#A02414" },
  { id: "zero", name: "清欢不醉", nameEn: "Zero-Proof", era: "不含酒精", accent: "#8FB0C4" },
];

const ICES = new Set<IceType>(["none", "sphere", "cube", "cubes", "bullets", "crushed"]);
const FAMILIES = new Set<SpiritFamily>([
  "whisky", "whiskyPeat", "gin", "rum", "rumWhite", "tequila", "vodka", "brandy",
  "absinthe", "campari", "vermouth", "wine", "cream", "default",
]);

/** [name, nameEn, glass, ice, family, difficulty, "ing^amount;…", tasting] */
type Row = [string, string, string, string, string, number, string, string];

const RAW: Record<RecipeCategory, Row[]> = {
  whisky: [
    ["古典鸡尾酒", "Old Fashioned", "rocks", "cube", "whisky", 1, "波本威士忌^60ml;德梅拉拉糖浆^10ml;安格仕苦精^2 dash;橙皮^1 片", "焦糖与橙皮包裹橡木，温热绵长"],
    ["曼哈顿", "Manhattan", "cocktail", "none", "whisky", 2, "黑麦威士忌^60ml;甜味美思^30ml;安格仕苦精^2 dash;马拉斯加樱桃^1 颗", "醇厚饱满，黑麦的辛香与味美思交织"],
    ["萨泽拉克", "Sazerac", "rocks", "none", "whisky", 3, "黑麦威士忌^60ml;方糖^1 颗;裴乔氏苦精^3 dash;苦艾酒^润杯;柠檬皮^1 片", "茴香润杯，黑麦与苦精的新奥尔良灵魂"],
    ["威士忌酸酒", "Whiskey Sour", "coupe", "none", "whisky", 2, "波本威士忌^45ml;柠檬汁^25ml;糖浆^15ml;蛋白^1 个", "柠檬明亮托起波本，泡沫如丝绒"],
    ["薄荷茱莉普", "Mint Julep", "rocks", "crushed", "whisky", 1, "波本威士忌^60ml;糖浆^10ml;薄荷叶^8 片", "碎冰霜雾里，薄荷与波本的南方夏日"],
    ["老广场", "Vieux Carré", "rocks", "cube", "whisky", 3, "黑麦威士忌^30ml;干邑白兰地^30ml;甜味美思^30ml;修士酒^7.5ml;苦精^2 dash", "新奥尔良法属老城，层次深邃复杂"],
    ["布鲁克林", "Brooklyn", "coupe", "none", "whisky", 2, "黑麦威士忌^60ml;干味美思^20ml;黑樱桃利口酒^7.5ml;苦精^2 dash", "曼哈顿的对岸表亲，干而锋利"],
    ["罗伯罗伊", "Rob Roy", "coupe", "none", "whisky", 1, "苏格兰调和威士忌^60ml;甜味美思^25ml;苦精^2 dash", "苏格兰版曼哈顿，烟熏与甜的握手"],
    ["血与沙", "Blood and Sand", "coupe", "none", "campari", 2, "苏格兰威士忌^22ml;甜味美思^22ml;樱桃利口酒^22ml;橙汁^22ml", "等比四味，血橙色的银幕浪漫"],
    ["锈钉", "Rusty Nail", "rocks", "cube", "whisky", 1, "苏格兰威士忌^45ml;杜林标利口酒^25ml", "蜂蜜草本裹着威士忌，复古而暖"],
    ["花花公子", "Boulevardier", "rocks", "cube", "whisky", 1, "波本威士忌^45ml;金巴利^30ml;甜味美思^30ml", "威士忌版尼格罗尼，更暖更厚"],
    ["热托迪", "Hot Toddy", "rocks", "none", "whisky", 1, "威士忌^45ml;蜂蜜^15ml;柠檬汁^15ml;热水^顶部补满;肉桂棒^1 根", "暖身的蜂蜜柠檬，冬夜的慰藉"],
    ["勿忘缅因号", "Remember the Maine", "coupe", "none", "whisky", 3, "黑麦威士忌^60ml;甜味美思^22ml;樱桃利口酒^15ml;苦艾酒^2 dash", "古巴战地之名，黑麦樱桃与茴香"],
    ["逍遥自在", "Fancy Free", "rocks", "cube", "whisky", 1, "黑麦威士忌^60ml;黑樱桃利口酒^15ml;橙味苦精^2 dash;安格仕苦精^2 dash", "古典的樱桃变奏，圆润芳香"],
    ["逃避法律者", "Scofflaw", "coupe", "none", "whisky", 2, "黑麦威士忌^45ml;干味美思^25ml;柠檬汁^15ml;红石榴糖浆^15ml", "嘲讽禁酒令的名字，酸甜锋利"],
    ["响尾蛇", "Diamondback", "coupe", "none", "whisky", 2, "黑麦威士忌^45ml;苹果白兰地^22ml;黄查特酒^22ml;柠檬皮卷^1 片", "强劲草本，禁酒令的危险之美"],
    ["玛梅泰勒", "Mamie Taylor", "highball", "cubes", "whisky", 1, "苏格兰威士忌^50ml;姜啤^顶部补满;青柠汁^15ml", "苏格兰版骡子，姜的辛辣"],
    ["阿尔冈昆", "Algonquin", "coupe", "none", "whisky", 1, "黑麦威士忌^45ml;干味美思^22ml;菠萝汁^22ml", "文人圆桌之名，黑麦带菠萝果香"],
    ["第八病房", "Ward Eight", "coupe", "none", "whisky", 2, "黑麦威士忌^60ml;柠檬汁^15ml;橙汁^15ml;红石榴糖浆^10ml;马拉斯加樱桃^1 颗", "波士顿政坛之名，威士忌的果香酸甜"],
    ["狮尾", "Lion's Tail", "coupe", "none", "whisky", 2, "波本威士忌^60ml;多香果利口酒^15ml;青柠汁^15ml;糖浆^7.5ml;苦精^2 dash;青柠角^1 块", "多香果的异域香料，温暖辛甜"],
    ["布朗德比", "Brown Derby", "coupe", "none", "whisky", 1, "波本威士忌^60ml;西柚汁^22ml;蜂蜜糖浆^15ml;橙皮^1 片", "好莱坞名店之作，葡萄柚蜂蜜"],
    ["布斯比", "Boothby", "coupe", "none", "whisky", 2, "黑麦威士忌^60ml;甜味美思^22ml;苦精^2 dash;香槟^漂浮", "曼哈顿顶一抹香槟，气泡升华"],
    ["港口之光", "Port Light", "coupe", "none", "rum", 2, "波本威士忌^45ml;百香果糖浆^22ml;蜂蜜^15ml;柠檬汁^22ml;红石榴糖浆^7.5ml;蛋白^1 个", "波本提基，百香果的明亮"],
    ["哈雷库拉尼", "Halekulani", "coupe", "none", "whisky", 2, "波本威士忌^45ml;橙汁^15ml;柠檬汁^15ml;红石榴糖浆^7.5ml;苦精^1 dash", "夏威夷酒店之名，波本柑橘"],
    ["盘尼西林", "Penicillin", "rocks", "sphere", "whiskyPeat", 2, "调和苏格兰^60ml;蜂蜜姜糖浆^22ml;柠檬汁^22ml;泥煤威士忌^7.5ml 漂浮;柠檬皮卷^1 片", "现代经典，蜂蜜姜与烟熏的良药"],
    ["纸飞机", "Paper Plane", "coupe", "none", "campari", 2, "波本威士忌^22ml;阿佩罗^22ml;阿玛罗^22ml;柠檬汁^22ml", "等比四味的现代杰作，苦甜平衡"],
    ["淘金热", "Gold Rush", "rocks", "sphere", "whisky", 1, "波本威士忌^60ml;蜂蜜糖浆^22ml;柠檬汁^22ml", "威士忌酸酒的蜂蜜进化，圆润浓郁"],
    ["特立尼达酸酒", "Trinidad Sour", "coupe", "none", "campari", 3, "安格仕苦精^45ml;杏仁糖浆^30ml;黑麦威士忌^15ml;柠檬汁^22ml", "以苦精为基酒的颠覆之作"],
    ["纽约酸酒", "New York Sour", "rocks", "cube", "whisky", 2, "黑麦威士忌^60ml;柠檬汁^22ml;糖浆^22ml;红酒^漂浮", "红酒漂浮的酸酒，视觉与风味的层次"],
    ["阿玛雷托酸酒", "Amaretto Sour", "rocks", "cube", "default", 1, "阿玛雷托^45ml;波本威士忌^15ml;柠檬汁^25ml;糖浆^7.5ml;蛋白^1 个", "杏仁的甜与波本的骨，绵密酸甜"],
    ["威士忌击打", "Whiskey Smash", "rocks", "crushed", "whisky", 1, "波本威士忌^60ml;柠檬角^3 块;糖浆^15ml;薄荷叶^8 片", "捣碎柠檬薄荷的夏日威士忌"],
    ["咖啡古典", "Coffee Old Fashioned", "rocks", "sphere", "whisky", 2, "波本威士忌^60ml;咖啡糖浆^10ml;咖啡苦精^2 dash;橙皮^1 片", "咖啡风味的古典进化"],
    ["肯塔基骡子", "Kentucky Mule", "highball", "bullets", "whisky", 1, "波本威士忌^50ml;青柠汁^15ml;姜啤^顶部补满;薄荷^适量", "波本版骡子，姜与橡木的辛香"],
    ["威士忌高球", "Whisky Highball", "highball", "cubes", "whisky", 1, "日本威士忌^45ml;苏打水^顶部补满;柠檬皮卷^1 片", "日式高球，威士忌与气泡的纯粹"],
    ["约翰柯林斯", "John Collins", "collins", "cubes", "whisky", 1, "波本威士忌^45ml;柠檬汁^25ml;糖浆^15ml;苏打水^顶部补满;马拉斯加樱桃^1 颗", "汤姆柯林斯的波本版，金黄气泡"],
    ["爱尔兰咖啡", "Irish Coffee", "irish-coffee", "none", "coffee", 1, "爱尔兰威士忌^45ml;热咖啡^90ml;红糖^10ml;鲜奶油^顶部补满", "热咖啡威士忌，奶盖的暖"],
  ],
  gin: [
    ["马丁内斯", "Martinez", "coupe", "none", "gin", 2, "老汤姆金酒^45ml;甜味美思^30ml;黑樱桃利口酒^7.5ml;橙味苦精^2 dash", "马天尼的祖先，甜润而草本"],
    ["干马天尼", "Dry Martini", "martini", "none", "gin", 2, "金酒^60ml;干味美思^10ml;柠檬皮卷^1 片", "凛冽干爽，杜松悬于零度边缘"],
    ["汤姆柯林斯", "Tom Collins", "highball", "cubes", "gin", 1, "金酒^45ml;柠檬汁^25ml;糖浆^15ml;苏打水^顶部补满", "气泡柠檬汽水，清爽悠长"],
    ["金菲兹", "Gin Fizz", "highball", "cubes", "gin", 2, "金酒^45ml;柠檬汁^25ml;糖浆^15ml;蛋白^1 个;苏打水^顶部补满", "云雾般绵密，柠檬与气泡的清晨"],
    ["三叶草俱乐部", "Clover Club", "coupe", "none", "gin", 2, "金酒^45ml;覆盆子糖浆^15ml;柠檬汁^20ml;蛋白^1 个", "莓果的粉与杜松的清，淑女气派"],
    ["珠宝", "Bijou", "coupe", "none", "gin", 2, "金酒^30ml;绿查特酒^30ml;甜味美思^30ml;橙味苦精^1 dash", "三色如宝石，草本浓郁层叠"],
    ["吉姆雷特", "Gimlet", "coupe", "none", "gin", 1, "金酒^60ml;青柠汁^15ml;糖浆^15ml", "青柠与杜松，简洁的航海记忆"],
    ["飞行", "Aviation", "coupe", "none", "gin", 2, "金酒^45ml;黑樱桃利口酒^15ml;紫罗兰利口酒^7.5ml;柠檬汁^15ml", "天空般的淡紫，花香与樱桃"],
    ["临别赠言", "Last Word", "coupe", "none", "gin", 2, "金酒^22ml;绿查特酒^22ml;黑樱桃利口酒^22ml;青柠汁^22ml", "等比四味的平衡奇迹，草本而锐利"],
    ["亡者复生二号", "Corpse Reviver No.2", "coupe", "none", "gin", 2, "金酒^22ml;君度橙酒^22ml;利莱白^22ml;柠檬汁^22ml;苦艾酒^润杯", "宿醉解药，柑橘清亮带茴香尾"],
    ["汉基潘基", "Hanky Panky", "coupe", "none", "gin", 2, "金酒^45ml;甜味美思^45ml;菲奈特布兰卡^7.5ml", "草本苦韵收尾，萨伏伊的女调酒师杰作"],
    ["布朗克斯", "Bronx", "coupe", "none", "gin", 2, "金酒^45ml;甜味美思^15ml;干味美思^15ml;橙汁^15ml", "完美马天尼加橙汁，柔和果香"],
    ["法兰西75", "French 75", "flute", "none", "gin", 2, "金酒^30ml;柠檬汁^15ml;糖浆^10ml;香槟^顶部补满", "金酒酸酒遇上香槟，如炮火般明亮"],
    ["尼格罗尼", "Negroni", "rocks", "cube", "campari", 1, "金酒^30ml;金巴利^30ml;甜味美思^30ml;橙皮^1 片", "苦橙与草本盛开，杜松收束于干爽"],
    ["金瑞奇", "Gin Rickey", "highball", "cubes", "gin", 1, "金酒^60ml;青柠汁^15ml;苏打水^顶部补满", "无糖的清爽，青柠与气泡的纯粹"],
    ["所得税", "Income Tax", "coupe", "none", "gin", 2, "金酒^45ml;甜味美思^15ml;干味美思^15ml;橙汁^15ml;苦精^2 dash", "布朗克斯加苦精，橙香带草本"],
    ["燕尾服", "Tuxedo", "coupe", "none", "gin", 2, "金酒^45ml;干味美思^45ml;黑樱桃利口酒^5ml;苦艾酒^2 dash;橙味苦精^2 dash", "马天尼的盛装版，复杂干爽"],
    ["蜜蜂之膝", "Bee's Knees", "coupe", "none", "gin", 1, "金酒^60ml;蜂蜜糖浆^22ml;柠檬汁^22ml", "蜂蜜柔化劣质金酒的禁酒令智慧"],
    ["南区", "Southside", "coupe", "none", "gin", 2, "金酒^60ml;青柠汁^22ml;糖浆^22ml;薄荷叶^8 片", "薄荷茱莉普的酸酒版，清新明亮"],
    ["白色佳人", "White Lady", "coupe", "none", "gin", 2, "金酒^45ml;君度橙酒^30ml;柠檬汁^20ml;蛋白^1 个", "金酒版边车，绵密而清雅"],
    ["粉红佳人", "Pink Lady", "coupe", "none", "gin", 2, "金酒^45ml;苹果白兰地^15ml;红石榴糖浆^10ml;柠檬汁^15ml;蛋白^1 个;马拉斯加樱桃^1 颗", "玫瑰色泡沫，复古的优雅"],
    ["猴腺", "Monkey Gland", "coupe", "none", "gin", 2, "金酒^45ml;橙汁^30ml;红石榴糖浆^7.5ml;苦艾酒^2 dash", "巴黎名酒，橙香带一缕茴香"],
    ["野蛮海岸", "Barbary Coast", "coupe", "none", "cream", 2, "金酒^22ml;苏格兰威士忌^22ml;可可利口酒^22ml;鲜奶油^22ml", "旧金山红灯区，烟熏可可奶油"],
    ["金汤力", "Gin & Tonic", "highball", "cubes", "gin", 1, "金酒^50ml;汤力水^顶部补满;青柠角^1 块", "金鸡纳的微苦与杜松，殖民地的清凉"],
    ["金色黎明", "Golden Dawn", "coupe", "none", "gin", 2, "金酒^22ml;苹果白兰地^22ml;杏子白兰地^22ml;橙汁^22ml;红石榴糖浆^1 dash", "日出般的渐变，果香丰盈"],
    ["公园大道", "Park Avenue", "coupe", "none", "gin", 2, "金酒^45ml;甜味美思^15ml;菠萝汁^15ml;君度橙酒^1 dash", "上流社会之名，菠萝柔化的马天尼"],
    ["玉兰", "Magnolia", "coupe", "none", "gin", 2, "金酒^45ml;柠檬汁^15ml;橙汁^15ml;蛋白^1 个;香槟^少量;青柠角^1 块", "花名鸡尾酒，柑橘泡沫的优雅"],
    ["午夜阳光", "Midnight Sun", "coupe", "none", "gin", 2, "金酒^45ml;黄查特酒^15ml;柠檬汁^15ml;蜂蜜^7.5ml", "蜂蜜草本的金色，温暖明亮"],
    ["珍珠纽扣", "Pearl Button", "coupe", "none", "gin", 2, "金酒^45ml;干味美思^15ml;接骨木花利口酒^10ml;柠檬汁^10ml", "接骨木的花香马天尼，清雅"],
    ["金雏菊", "Gin Daisy", "rocks", "crushed", "gin", 1, "金酒^50ml;柠檬汁^22ml;红石榴糖浆^15ml;苏打水^少量", "禁酒令前的雏菊家族，碎冰果香"],
    ["费尔班克斯", "Fairbanks", "coupe", "none", "gin", 2, "金酒^45ml;干味美思^22ml;杏子白兰地^15ml;橙味苦精^2 dash", "默片巨星之名，杏香马天尼"],
    ["土星", "Saturn", "coupe", "none", "gin", 2, "金酒^45ml;百香果糖浆^15ml;柠檬汁^15ml;杏仁糖浆^7.5ml;法勒纳姆^7.5ml", "金酒提基的稀有之作，百香果芳香"],
    ["新加坡司令", "Singapore Sling", "highball", "crushed", "gin", 3, "金酒^30ml;樱桃利口酒^15ml;君度橙酒^7.5ml;修士酒^7.5ml;菠萝汁^60ml;青柠汁^15ml;红石榴糖浆^7.5ml;苦精^1 dash", "莱佛士酒店之魂，复杂热带果香"],
    ["受苦的混蛋", "Suffering Bastard", "highball", "cubes", "gin", 1, "金酒^30ml;白兰地^30ml;青柠汁^15ml;苦精^2 dash;姜啤^顶部补满", "开罗解宿醉名作，姜的辛辣"],
    ["皇家夏威夷", "Royal Hawaiian", "coupe", "none", "default", 1, "金酒^45ml;菠萝汁^30ml;柠檬汁^15ml;杏仁糖浆^7.5ml", "菠萝杏仁的轻盈热带马天尼"],
    ["黑莓荆棘", "Bramble", "rocks", "crushed", "gin", 1, "金酒^50ml;柠檬汁^25ml;糖浆^12ml;黑莓利口酒^15ml", "碎冰上的黑莓渗染，伦敦现代经典"],
    ["茉莉", "Jasmine", "coupe", "none", "gin", 2, "金酒^45ml;金巴利^7.5ml;君度橙酒^7.5ml;柠檬汁^15ml", "西柚般的苦甜花香，现代酸酒"],
    ["金酒罗勒击打", "Gin Basil Smash", "rocks", "crushed", "gin", 1, "金酒^60ml;柠檬汁^25ml;糖浆^15ml;罗勒叶^10 片", "罗勒拍打出的翠绿清香，德式现代"],
    ["东区", "Eastside", "coupe", "crushed", "gin", 1, "金酒^60ml;青柠汁^22ml;糖浆^22ml;黄瓜片^3 片;薄荷叶^6 片", "黄瓜薄荷的清新南区变奏"],
    ["维斯帕", "Vesper", "martini", "none", "gin", 2, "金酒^60ml;伏特加^15ml;利莱白^7.5ml;柠檬皮^1 片", "邦德之名，凛冽而锋利"],
    ["腹地", "Hinterland", "coupe", "none", "gin", 2, "金酒^45ml;接骨木花利口酒^15ml;黄查特酒^7.5ml;青柠汁^15ml", "接骨木与草本的现代花园"],
    ["黄瓜吉姆雷特", "Cucumber Gimlet", "coupe", "none", "gin", 1, "金酒^60ml;青柠汁^22ml;糖浆^15ml;黄瓜片^4 片", "黄瓜的清凉吉姆雷特"],
    ["接骨木气泡", "Elderflower Spritz", "highball", "cubes", "gin", 1, "金酒^30ml;接骨木花利口酒^20ml;普罗赛克^60ml;苏打水^少量", "花香气泡的轻盈开胃"],
    ["黑刺李金菲兹", "Sloe Gin Fizz", "highball", "cubes", "wine", 1, "黑刺李金酒^45ml;柠檬汁^25ml;糖浆^15ml;苏打水^顶部补满", "黑刺李的莓果气泡，红宝石色"],
    ["银快车", "Silver Bullet", "martini", "none", "gin", 2, "金酒^45ml;柠檬汁^15ml;茴香酒^7.5ml", "茴香的银色锋芒，干冽清冽"],
    ["金菲克斯", "Gin Fix", "rocks", "crushed", "gin", 1, "金酒^60ml;柠檬汁^22ml;糖浆^15ml;水^少量", "古老的fix家族，碎冰柠檬清爽"],
    ["吉布森", "Gibson", "martini", "none", "gin", 1, "金酒^60ml;干味美思^10ml;鸡尾酒洋葱^1 颗", "马天尼的洋葱版，咸香微妙"],
    ["五五马天尼", "Fifty-Fifty Martini", "martini", "none", "gin", 1, "金酒^45ml;干味美思^45ml;橙味苦精^1 dash;柠檬皮卷^1 片", "金酒与味美思等量，柔和经典"],
    ["白尼格罗尼", "White Negroni", "rocks", "cube", "default", 2, "金酒^30ml;苏兹龙胆利口酒^30ml;白味美思^30ml;柠檬皮卷^1 片", "尼格罗尼的金色变体，苦甜清亮"],
  ],
  rum: [
    ["黛绮丽", "Daiquiri", "coupe", "none", "rum", 1, "白朗姆^60ml;青柠汁^25ml;糖浆^15ml", "甘蔗甜被青柠收紧，干净利落"],
    ["玛丽碧克馥", "Mary Pickford", "coupe", "none", "rum", 2, "白朗姆^60ml;菠萝汁^45ml;红石榴糖浆^7.5ml;黑樱桃利口酒^5ml", "默片女星之名，菠萝与石榴的甜美"],
    ["海明威黛绮丽", "Hemingway Daiquiri", "coupe", "none", "rum", 2, "白朗姆^60ml;青柠汁^22ml;西柚汁^15ml;黑樱桃利口酒^15ml", "作家特调，更干更酸的葡萄柚版"],
    ["巴卡迪鸡尾酒", "Bacardi Cocktail", "coupe", "none", "rum", 1, "白朗姆^60ml;青柠汁^20ml;红石榴糖浆^10ml", "法院判定必须用巴卡迪的传奇酸甜"],
    ["总统", "El Presidente", "coupe", "none", "rum", 2, "白朗姆^60ml;白味美思^30ml;君度橙酒^7.5ml;红石榴糖浆^5ml", "哈瓦那的优雅，朗姆与味美思的古巴黄金时代"],
    ["民族饭店特调", "Hotel Nacional", "coupe", "none", "rum", 2, "白朗姆^60ml;杏子白兰地^15ml;菠萝汁^30ml;青柠汁^15ml", "古巴名店招牌，杏与菠萝的热带"],
    ["航空邮件", "Air Mail", "coupe", "none", "wine", 2, "金朗姆^45ml;蜂蜜糖浆^15ml;青柠汁^15ml;香槟^顶部补满", "蜂蜜朗姆遇香槟，气泡升空"],
    ["十二海里", "Twelve Mile Limit", "coupe", "none", "rum", 2, "白朗姆^30ml;黑麦威士忌^15ml;白兰地^15ml;红石榴糖浆^15ml;柠檬汁^15ml", "走私船界线之名，三烈酒的大胆"],
    ["古巴自由", "Cuba Libre", "highball", "cubes", "rum", 1, "金朗姆^50ml;可乐^顶部补满;青柠角^1 块", "朗姆可乐加青柠，自由的气泡"],
    ["军舰", "Navy Sour", "sour", "none", "rum", 2, "海军朗姆^50ml;青柠汁^25ml;德梅拉拉糖浆^15ml", "高强度朗姆的酸酒，浓烈甘醇"],
    ["玉米与油", "Corn 'n' Oil", "rocks", "cube", "rum", 1, "黑朗姆^60ml;法勒纳姆^15ml;青柠汁^7.5ml;苦精^2 dash", "巴巴多斯的香料朗姆，深沉甘香"],
    ["佛罗里达", "Floridita", "coupe", "none", "rum", 2, "白朗姆^60ml;甜味美思^7.5ml;君度橙酒^5ml;青柠汁^15ml;红石榴糖浆^5ml", "哈瓦那名吧之名，复杂的甘酸"],
    ["迈泰", "Mai Tai", "tiki-mug", "crushed", "rum", 2, "牙买加朗姆^30ml;农业朗姆^30ml;君度橙酒^15ml;杏仁糖浆^15ml;青柠汁^30ml;马拉斯加樱桃^1 颗;薄荷叶^1 束", "提基之王，朗姆与杏仁青柠的天堂"],
    ["僵尸", "Zombie", "highball", "crushed", "rum", 3, "金朗姆^45ml;黑朗姆^45ml;海军朗姆^30ml;青柠汁^22ml;法勒纳姆^15ml;红石榴糖浆^7.5ml", "三朗姆的危险，限饮两杯的传说"],
    ["止痛药", "Painkiller", "highball", "crushed", "rum", 1, "海军朗姆^60ml;菠萝汁^60ml;橙汁^30ml;椰子奶油^30ml;肉豆蔻^适量", "英属维京群岛之魂，椰香热带"],
    ["椰林飘香", "Piña Colada", "highball", "crushed", "rum", 1, "白朗姆^60ml;椰子奶油^30ml;菠萝汁^90ml", "波多黎各国饮，椰子菠萝的慵懒"],
    ["丛林鸟", "Jungle Bird", "rocks", "crushed", "rum", 2, "黑朗姆^45ml;金巴利^22ml;菠萝汁^45ml;青柠汁^15ml;糖浆^15ml", "吉隆坡名作，苦甜与热带的奇遇"],
    ["海军格罗格", "Navy Grog", "rocks", "crushed", "rum", 3, "金朗姆^30ml;黑朗姆^30ml;海军朗姆^30ml;西柚汁^22ml;青柠汁^22ml;蜂蜜^15ml", "三朗姆配蜂蜜柑橘，水手的安慰"],
    ["雾切", "Fog Cutter", "highball", "crushed", "rum", 3, "白朗姆^45ml;白兰地^15ml;金酒^15ml;橙汁^60ml;柠檬汁^22ml;杏仁糖浆^15ml;雪莉^漂浮", "层层叠叠的烈酒迷雾"],
    ["三点一划", "Three Dots and a Dash", "highball", "crushed", "rum", 3, "陈年朗姆^45ml;海军朗姆^15ml;法勒纳姆^15ml;蜂蜜^7.5ml;青柠汁^15ml;橙汁^15ml;苦精^1 dash", "摩斯密码胜利之名，香料丰盈"],
    ["飓风", "Hurricane", "highball", "crushed", "rum", 1, "金朗姆^30ml;黑朗姆^30ml;百香果糖浆^30ml;柠檬汁^30ml", "新奥尔良的飓风杯，热带果潘趣"],
    ["种植者潘趣", "Planter's Punch", "highball", "crushed", "rum", 1, "黑朗姆^60ml;橙汁^30ml;菠萝汁^30ml;青柠汁^15ml;红石榴糖浆^7.5ml", "牙买加古训：一酸二甜三烈四弱"],
    ["试飞员", "Test Pilot", "highball", "crushed", "rum", 3, "金朗姆^45ml;海军朗姆^22ml;君度橙酒^7.5ml;法勒纳姆^7.5ml;青柠汁^15ml;苦精^2 dash", "Don the Beachcomber 杰作，烈而平衡"],
    ["蝎子", "Scorpion", "highball", "crushed", "rum", 2, "金朗姆^60ml;白兰地^30ml;橙汁^60ml;柠檬汁^30ml;杏仁糖浆^15ml", "波利尼西亚的大份共享，杏仁果香"],
    ["巴哈马妈妈", "Bahama Mama", "highball", "crushed", "rum", 1, "金朗姆^30ml;椰子朗姆^30ml;咖啡利口酒^15ml;菠萝汁^60ml;柠檬汁^15ml", "椰子咖啡与菠萝的加勒比"],
    ["蓝色夏威夷", "Blue Hawaii", "highball", "crushed", "default", 1, "白朗姆^30ml;伏特加^15ml;蓝橙利口酒^15ml;菠萝汁^60ml;甜酸^30ml", "亮蓝海洋色，菠萝热带风情"],
    ["眼镜蛇之牙", "Cobra's Fang", "highball", "crushed", "rum", 2, "黑朗姆^45ml;海军朗姆^15ml;百香果糖浆^15ml;橙汁^22ml;青柠汁^15ml;茴香^1 dash", "Don 的香料毒牙，深色而辛香"],
    ["黑暗风暴", "Dark 'n' Stormy", "highball", "cubes", "rum", 1, "黑朗姆^60ml;姜啤^顶部补满;青柠角^1 块", "百慕大的乌云风暴，姜与黑朗姆"],
    ["朗姆奔跑者", "Rum Runner", "highball", "crushed", "rum", 1, "金朗姆^30ml;黑朗姆^30ml;黑莓利口酒^15ml;香蕉利口酒^15ml;菠萝汁^45ml;红石榴糖浆^7.5ml", "佛州群岛的甜美走私"],
    ["潜水医生", "Doctor Funk", "highball", "crushed", "rum", 2, "黑朗姆^60ml;青柠汁^22ml;红石榴糖浆^15ml;苦艾酒^7.5ml;苏打水^少量", "南太平洋医生之名，茴香尾韵"],
    ["珍珠潜水者", "Pearl Diver", "highball", "crushed", "rum", 3, "金朗姆^45ml;黑朗姆^22ml;橙汁^22ml;青柠汁^15ml;法勒纳姆^15ml;黄油糖香料蜜^15ml", "黄油香料蜜的独特，温暖丰盈"],
    ["可可滩", "Cocoa Beach", "highball", "crushed", "rum", 1, "椰子朗姆^45ml;菠萝汁^45ml;蔓越莓汁^30ml;青柠汁^15ml", "椰子与莓果的沙滩午后"],
    ["波利尼西亚", "Polynesian", "tiki-mug", "crushed", "rum", 2, "白朗姆^45ml;百香果糖浆^15ml;青柠汁^22ml;盐边^适量;薄荷叶^1 束", "海岛酸甜，百香果的明媚"],
    ["珊瑚礁", "Coral Reef", "highball", "crushed", "rum", 1, "白朗姆^45ml;桃子利口酒^15ml;菠萝汁^45ml;橙汁^22ml;红石榴糖浆^7.5ml", "渐变珊瑚色，桃与菠萝"],
    ["热带迷雾", "Tropical Itch", "highball", "crushed", "rum", 2, "黑朗姆^45ml;波本威士忌^15ml;君度橙酒^15ml;百香果汁^60ml;苦精^1 dash", "夏威夷之痒，百香果与波本"],
    ["珊瑚之吻", "Coral Kiss", "coupe", "none", "cream", 1, "白朗姆^45ml;荔枝利口酒^15ml;青柠汁^15ml;椰子奶油^15ml", "荔枝椰子的柔软海岛吻"],
    ["火山碗", "Volcano Bowl", "highball", "crushed", "rum", 3, "金朗姆^45ml;黑朗姆^30ml;白兰地^15ml;橙汁^45ml;菠萝汁^45ml;杏仁糖浆^22ml", "共享火山碗，朗姆与坚果果香"],
    ["椰子云", "Coconut Cloud", "highball", "crushed", "cream", 1, "白朗姆^45ml;椰子奶油^30ml;香蕉利口酒^15ml;菠萝汁^45ml", "云絮般的椰子香蕉奶昔"],
    ["热带雷暴", "Tropical Thunder", "highball", "crushed", "rum", 2, "黑朗姆^45ml;海军朗姆^15ml;百香果糖浆^15ml;青柠汁^22ml;姜啤^少量", "黑朗姆的雷暴，百香与姜"],
    ["冒纳罗亚", "Mauna Loa", "highball", "crushed", "rum", 2, "金朗姆^45ml;黑朗姆^22ml;杏仁糖浆^15ml;菠萝汁^45ml;青柠汁^15ml", "夏威夷火山之名，坚果菠萝"],
    ["鲨鱼牙", "Shark's Tooth", "highball", "crushed", "rum", 2, "海军朗姆^60ml;青柠汁^22ml;红石榴糖浆^15ml;百香果糖浆^7.5ml;苏打水^少量", "高强度朗姆的尖牙，红色凶猛"],
    ["卡瓦碗", "Kava Bowl", "highball", "crushed", "rum", 3, "金朗姆^45ml;白朗姆^22ml;橙汁^30ml;柠檬汁^22ml;杏仁糖浆^15ml", "南太平洋共享碗，杏仁柑橘"],
    ["热黄油朗姆", "Hot Buttered Rum", "rocks", "none", "rum", 1, "黑朗姆^60ml;黄油糖香料蜜^22ml;热水^顶部补满;肉桂棒^1 根", "冬日暖身，黄油香料的丰腴"],
    ["沙滩拾荒者", "Beachcomber", "coupe", "none", "rum", 1, "白朗姆^45ml;君度橙酒^15ml;青柠汁^15ml;红石榴糖浆^5ml", "黛绮丽的热带表亲，柑橘清爽"],
    ["塔希提潘趣", "Tahitian Punch", "highball", "crushed", "rum", 2, "金朗姆^45ml;百香果糖浆^15ml;菠萝汁^45ml;橙汁^30ml;青柠汁^15ml", "塔希提的群果潘趣，阳光满溢"],
    ["莫吉托", "Mojito", "highball", "crushed", "rumWhite", 1, "白朗姆^50ml;青柠汁^25ml;糖浆^20ml;薄荷叶^10 片;苏打水^顶部补满;青柠角^1 块", "古巴的薄荷青柠，气泡里的夏天"],
    ["卡琵莉亚", "Caipirinha", "rocks", "crushed", "rumWhite", 1, "巴西甘蔗酒^60ml;青柠角^4 块;细砂糖^2 勺", "巴西国饮，甘蔗与青柠的质朴鲜活"],
    ["朗姆高球", "Rum Highball", "highball", "cubes", "rum", 1, "金朗姆^45ml;姜汁汽水^顶部补满;青柠角^1 块", "朗姆与姜汁的热带气泡"],
  ],
  agave: [
    ["玛格丽特前身", "Tequila Daisy", "coupe", "none", "tequila", 1, "龙舌兰^50ml;柠檬汁^25ml;君度橙酒^15ml;苏打水^少量", "玛格丽特的雏形，柑橘清爽"],
    ["太平洋日落", "Pacific Sunset", "highball", "crushed", "tequila", 1, "龙舌兰^45ml;芒果汁^45ml;百香果糖浆^15ml;青柠汁^15ml", "龙舌兰提基，芒果百香的落日"],
    ["裸体与名声", "Naked and Famous", "coupe", "none", "default", 2, "梅斯卡尔^22ml;黄查特酒^22ml;阿佩罗^22ml;青柠汁^22ml", "烟熏版临别赠言，等比的危险魅力"],
    ["玛格丽特", "Margarita", "margarita", "none", "tequila", 1, "龙舌兰^50ml;君度橙酒^25ml;青柠汁^25ml;盐边^适量", "咸口起兴，龙舌兰青草与青柠"],
    ["汤米玛格丽特", "Tommy's Margarita", "rocks", "cube", "tequila", 1, "龙舌兰^60ml;青柠汁^30ml;龙舌兰糖浆^15ml", "无橙酒的纯净，龙舌兰本味"],
    ["分界钟", "Division Bell", "coupe", "none", "default", 2, "梅斯卡尔^45ml;阿佩罗^22ml;黑樱桃利口酒^15ml;青柠汁^22ml", "烟熏与苦橙樱桃的现代平衡"],
    ["瓦哈卡古典", "Oaxaca Old Fashioned", "rocks", "sphere", "whiskyPeat", 2, "龙舌兰^45ml;梅斯卡尔^15ml;龙舌兰糖浆^7.5ml;苦精^2 dash", "烟熏版古典，墨西哥的深沉"],
    ["辣味玛格丽特", "Spicy Margarita", "rocks", "cube", "tequila", 2, "龙舌兰^50ml;君度橙酒^15ml;青柠汁^25ml;辣椒^2 片;辣盐边^适量", "辣椒点燃的玛格丽特，热情似火"],
    ["梅斯卡尔骡子", "Mezcal Mule", "highball", "bullets", "whiskyPeat", 1, "梅斯卡尔^45ml;青柠汁^15ml;姜啤^顶部补满", "烟熏版骡子，辛辣升级"],
    ["龙舌兰日出", "Tequila Sunrise", "highball", "cubes", "tequila", 1, "龙舌兰^45ml;橙汁^90ml;红石榴糖浆^15ml", "渐变日出色，橙汁与石榴的清晨"],
    ["帕洛玛", "Paloma", "highball", "cubes", "tequila", 1, "龙舌兰^50ml;西柚汁^60ml;青柠汁^15ml;苏打水^顶部补满;盐边^适量;西柚片^1 片", "西柚气泡，墨西哥的日常清爽"],
  ],
  vodka: [
    ["白色蜘蛛", "White Spider", "coupe", "none", "vodka", 1, "伏特加^45ml;薄荷利口酒^30ml;薄荷叶^点缀", "伏特加版螫刺，冰凉透明"],
    ["秀兰邓波尔成人版", "Adult Shirley", "highball", "cubes", "vodka", 1, "伏特加^45ml;红石榴糖浆^15ml;姜汁汽水^顶部补满;樱桃^1 颗", "童年汽水的成人改写"],
    ["蓝色泻湖", "Blue Lagoon", "highball", "cubes", "vodka", 1, "伏特加^45ml;蓝橙利口酒^22ml;柠檬汽水^顶部补满", "电光蓝的清凉，柑橘汽水"],
    ["毛伊酒杯", "Maui Mule", "highball", "bullets", "vodka", 1, "伏特加^45ml;菠萝汁^30ml;青柠汁^15ml;姜啤^顶部补满", "热带版莫斯科骡子，姜菠萝"],
    ["大都会", "Cosmopolitan", "martini", "none", "campari", 1, "柑橘伏特加^45ml;君度橙酒^15ml;蔓越莓汁^30ml;青柠汁^15ml", "都市女郎的粉红，蔓越莓清爽"],
    ["浓缩咖啡马天尼", "Espresso Martini", "martini", "none", "default", 2, "伏特加^45ml;咖啡利口酒^15ml;浓缩咖啡^30ml;糖浆^7.5ml", "提神又微醺，咖啡油脂的奶泡"],
    ["莫斯科骡子", "Moscow Mule", "highball", "bullets", "vodka", 1, "伏特加^50ml;青柠汁^15ml;姜啤^顶部补满;青柠角^1 块", "铜杯里的辛辣气泡，清爽提神"],
    ["长岛冰茶", "Long Island Iced Tea", "highball", "cubes", "default", 2, "伏特加^15ml;金酒^15ml;白朗姆^15ml;龙舌兰^15ml;君度橙酒^15ml;柠檬汁^22ml;可乐^顶部补满", "五烈酒伪装的茶色，强劲危险"],
    ["血腥玛丽", "Bloody Mary", "highball", "cubes", "vodka", 2, "伏特加^45ml;番茄汁^90ml;柠檬汁^15ml;辣酱^3 dash;伍斯特酱^2 dash;芹菜^1 根", "咸鲜辛辣的早午餐救赎"],
    ["法式马天尼", "French Martini", "martini", "none", "vodka", 1, "伏特加^45ml;覆盆子利口酒^15ml;菠萝汁^45ml", "覆盆子菠萝的丝滑泡沫"],
    ["柠檬滴", "Lemon Drop", "martini", "none", "vodka", 1, "柑橘伏特加^45ml;君度橙酒^15ml;柠檬汁^22ml;糖边^适量", "糖边的柠檬糖果，酸甜活泼"],
    ["色情明星马天尼", "Pornstar Martini", "martini", "none", "default", 2, "香草伏特加^45ml;百香果利口酒^15ml;百香果泥^30ml;青柠汁^15ml;香槟^旁置", "百香果的奢华，配一小杯香槟"],
    ["海风", "Sea Breeze", "highball", "cubes", "vodka", 1, "伏特加^45ml;蔓越莓汁^90ml;西柚汁^30ml", "蔓越莓与葡萄柚的海岸清风"],
    ["灰狗", "Greyhound", "highball", "cubes", "vodka", 1, "伏特加^45ml;西柚汁^120ml", "葡萄柚的纯粹清爽，加盐即咸狗"],
    ["海湾微风", "Bay Breeze", "highball", "cubes", "vodka", 1, "伏特加^45ml;蔓越莓汁^60ml;菠萝汁^30ml;青柠角^1 块", "蔓越莓与菠萝的海岸微风"],
    ["伏特加马天尼", "Vodka Martini", "martini", "none", "vodka", 1, "伏特加^60ml;干味美思^10ml;橄榄^1 颗", "冰凉凛冽，伏特加的纯粹优雅"],
    ["脏马天尼", "Dirty Martini", "martini", "none", "vodka", 2, "伏特加^60ml;干味美思^10ml;橄榄盐水^15ml;橄榄^2 颗", "咸鲜橄榄，浑浊而上瘾"],
    ["苹果马天尼", "Appletini", "martini", "none", "gin", 2, "伏特加^45ml;青苹果利口酒^25ml;柠檬汁^10ml", "青苹果的酸甜，千禧年的明星"],
    ["巧克力马天尼", "Chocolate Martini", "martini", "none", "cream", 2, "伏特加^45ml;可可利口酒^30ml;鲜奶油^15ml;可可粉^适量", "丝滑可可，甜点般的马天尼"],
    ["神风", "Kamikaze", "coupe", "none", "vodka", 1, "伏特加^30ml;君度橙酒^30ml;青柠汁^30ml;青柠角^1 块", "等比三味，凌厉清爽"],
    ["性感沙滩", "Sex on the Beach", "highball", "cubes", "vodka", 1, "伏特加^40ml;水蜜桃利口酒^20ml;蔓越莓汁^40ml;橙汁^40ml;橙片^1 片", "蜜桃与莓果的海滩派对"],
    ["呜呜", "Woo Woo", "highball", "cubes", "vodka", 1, "伏特加^40ml;水蜜桃利口酒^30ml;蔓越莓汁^90ml;青柠角^1 块", "蜜桃蔓越莓的粉红派对"],
    ["白俄罗斯", "White Russian", "rocks", "cube", "cream", 1, "伏特加^45ml;咖啡利口酒^30ml;鲜奶油^30ml", "咖啡奶油，慵懒午后的甜"],
    ["黑俄罗斯", "Black Russian", "rocks", "cube", "coffee", 1, "伏特加^45ml;咖啡利口酒^30ml", "纯粹的咖啡烈酒，深邃苦甜"],
    ["泥石流", "Mudslide", "highball", "cubes", "cream", 1, "伏特加^30ml;咖啡利口酒^30ml;百利甜^30ml;鲜奶油^30ml", "咖啡奶油的浓郁，罪恶的甜"],
  ],
  brandy: [
    ["边车", "Sidecar", "coupe", "none", "brandy", 2, "干邑白兰地^50ml;君度橙酒^20ml;柠檬汁^20ml;糖边^适量", "干邑的雍容与柑橘的酸甜，糖边点睛"],
    ["杰克玫瑰", "Jack Rose", "coupe", "none", "brandy", 1, "苹果白兰地^45ml;红石榴糖浆^15ml;青柠汁^20ml", "苹果与石榴的玫瑰色泽，酸甜可口"],
    ["皮斯科酸酒", "Pisco Sour", "coupe", "none", "brandy", 2, "皮斯科^60ml;青柠汁^25ml;糖浆^20ml;蛋白^1 个;苦精^3 dash", "秘鲁国饮，花香葡萄裹着绵密泡沫"],
    ["螫刺", "Stinger", "rocks", "crushed", "brandy", 1, "干邑白兰地^50ml;薄荷利口酒^20ml", "白兰地与薄荷，深夜的清凉收尾"],
    ["白兰地亚历山大", "Brandy Alexander", "coupe", "none", "cream", 1, "干邑白兰地^30ml;可可利口酒^30ml;鲜奶油^30ml;肉豆蔻^适量", "丝绒般绵密，可可奶油的甜美甜点"],
    ["萨拉托加", "Saratoga", "coupe", "none", "brandy", 2, "干邑白兰地^30ml;黑麦威士忌^30ml;甜味美思^30ml;苦精^2 dash", "双烈酒的曼哈顿，深沉醇厚"],
    ["夹层", "Between the Sheets", "coupe", "none", "brandy", 2, "干邑白兰地^30ml;白朗姆^30ml;君度橙酒^20ml;柠檬汁^20ml", "边车的放浪表亲，烈而柑橘"],
    ["蜜月", "Honeymoon", "coupe", "none", "brandy", 2, "苹果白兰地^45ml;修士酒^15ml;君度橙酒^7.5ml;柠檬汁^15ml", "苹果与蜂蜜草本的甜蜜"],
    ["神枪手", "Sharpshooter", "coupe", "none", "brandy", 2, "干邑白兰地^45ml;咖啡利口酒^15ml;柠檬汁^15ml;糖浆^7.5ml", "咖啡与白兰地的提神酸甜"],
    ["禁果", "Forbidden Fruit", "coupe", "none", "brandy", 2, "苹果白兰地^45ml;西柚利口酒^22ml;柠檬汁^15ml", "苹果与葡萄柚的微苦诱惑"],
  ],
  aperitif: [
    ["香槟鸡尾酒", "Champagne Cocktail", "flute", "none", "wine", 1, "香槟^120ml;方糖^1 颗;安格仕苦精^2 dash", "气泡升腾，方糖在杯底缓缓融化"],
    ["美国佬", "Americano", "highball", "cubes", "campari", 1, "金巴利^30ml;甜味美思^30ml;苏打水^顶部补满", "尼格罗尼去金酒，清爽的苦甜开胃"],
    ["雪莉柯伯乐", "Sherry Cobbler", "highball", "crushed", "wine", 1, "阿蒙提亚多雪莉^90ml;糖浆^15ml;橙片^2 片", "碎冰水果的维多利亚清凉，坚果回甘"],
    ["竹子", "Bamboo", "coupe", "none", "wine", 1, "干味雪莉^45ml;干味美思^45ml;苦精^2 dash", "低酒精的优雅开胃，干爽坚果香"],
    ["阿多尼斯", "Adonis", "coupe", "none", "wine", 1, "干味雪莉^45ml;甜味美思^45ml;橙味苦精^2 dash", "雪莉与味美思的柔和，午后的开胃"],
    ["雪莉蛋蜜", "Sherry Flip", "coupe", "none", "wine", 1, "茶色波特^60ml;全蛋^1 个;糖浆^15ml;肉豆蔻^适量", "整蛋打发的丝滑，坚果蛋奶香"],
    ["菊花", "Chrysanthemum", "coupe", "none", "vermouth", 2, "干味美思^60ml;修士酒^30ml;苦艾酒^3 dash", "低酒精的草本花束，复杂而柔和"],
    ["内格罗尼前身", "Milano-Torino", "rocks", "cube", "campari", 1, "金巴利^30ml;甜味美思^30ml", "米兰与都灵的相遇，纯粹苦甜"],
    ["黑色天鹅绒", "Black Velvet", "highball", "none", "wine", 1, "司陶特啤酒^90ml;香槟^90ml", "黑啤与香槟分层，丝绒般顺滑"],
    ["阿佩罗气泡", "Aperol Spritz", "highball", "cubes", "campari", 1, "阿佩罗^60ml;普罗赛克^90ml;苏打水^少量;橙片^1 片", "威尼斯的橙色午后，微苦气泡"],
    ["雨果气泡", "Hugo Spritz", "highball", "cubes", "wine", 1, "接骨木花利口酒^30ml;普罗赛克^90ml;苏打水^少量;薄荷^适量;青柠^适量", "接骨木薄荷的清新气泡"],
    ["加里波第", "Garibaldi", "highball", "cubes", "campari", 1, "金巴利^60ml;鲜榨橙汁^120ml", "蓬松橙汁裹苦橙，简单而惊艳"],
    ["含羞草", "Mimosa", "coupe", "none", "wine", 1, "香槟^90ml;鲜榨橙汁^90ml", "香槟与橙汁的早午餐经典"],
    ["贝里尼", "Bellini", "coupe", "none", "wine", 1, "普罗赛克^100ml;白桃泥^50ml", "威尼斯哈利酒吧之作，白桃柔美"],
    ["皇家基尔", "Kir Royale", "flute", "none", "wine", 1, "香槟^120ml;黑加仑利口酒^10ml", "气泡升腾，黑醋栗的紫红优雅"],
    ["桑格利亚", "Sangria", "wine-red", "cube", "wine", 1, "红葡萄酒^120ml;白兰地^30ml;橙汁^30ml;橙片^2 片", "西班牙的水果红酒，欢聚之饮"],
    ["金巴利苏打", "Campari Soda", "highball", "cubes", "campari", 1, "金巴利^45ml;苏打水^顶部补满;橙片^1 片", "意式开胃，苦橙气泡"],
    ["雪莉气泡", "Sherry Spritz", "wine-white", "cube", "wine", 1, "菲诺雪莉^60ml;苏打水^60ml;橙片^1 片", "干雪莉的轻盈开胃气泡"],
    ["威末气泡", "Vermouth Spritz", "wine-white", "cube", "vermouth", 1, "干味美思^60ml;苏打水^60ml;橄榄^1 颗", "低度开胃，草本气泡"],
    ["反向马天尼", "Reverse Martini", "rocks", "cube", "vermouth", 1, "干味美思^60ml;金酒^20ml;柠檬皮卷^1 片", "以味美思为主，低度优雅"],
    ["蚱蜢", "Grasshopper", "coupe", "none", "cream", 1, "绿薄荷利口酒^30ml;白可可利口酒^30ml;鲜奶油^30ml", "薄荷巧克力，奶绿色的甜点"],
    ["金色凯迪拉克", "Golden Cadillac", "coupe", "none", "cream", 1, "加利安奴利口酒^30ml;白可可利口酒^30ml;鲜奶油^30ml", "香草可可的金色奶昔"],
    ["B-52", "B-52", "cordial", "none", "coffee", 2, "咖啡利口酒^20ml;百利甜^20ml;金万利^20ml", "三层分层，咖啡奶油橙的经典"],
    ["烤杏仁", "Toasted Almond", "rocks", "cube", "cream", 1, "杏仁利口酒^30ml;咖啡利口酒^30ml;鲜奶油^30ml", "杏仁咖啡奶油，温暖坚果香"],
    ["雪球", "Snowball", "highball", "cubes", "cream", 1, "蛋黄利口酒^60ml;青柠汁^15ml;雪碧^顶部补满", "蛋奶利口酒的圣诞气泡"],
    ["粉红松鼠", "Pink Squirrel", "coupe", "none", "cream", 2, "杏仁利口酒^30ml;白可可利口酒^20ml;鲜奶油^30ml;红石榴糖浆^5ml", "粉红坚果奶昔，复古甜点"],
  ],
  zero: [
    ["维珍莫吉托", "Virgin Mojito", "highball", "crushed", "gin", 1, "青柠汁^25ml;糖浆^20ml;薄荷叶^10 片;苏打水^顶部补满;青柠角^1 块", "无酒精的薄荷青柠清凉"],
    ["秀兰邓波尔", "Shirley Temple", "highball", "cubes", "campari", 1, "姜汁汽水^150ml;红石榴糖浆^15ml;樱桃^1 颗", "童年的甜美汽水，红石榴的玫红"],
    ["维珍椰林飘香", "Virgin Piña Colada", "highball", "crushed", "cream", 1, "菠萝汁^120ml;椰子奶油^45ml;鲜奶油^15ml", "椰子菠萝的热带奶昔，无酒精"],
    ["处女玛丽", "Virgin Mary", "highball", "cubes", "default", 1, "番茄汁^120ml;柠檬汁^15ml;辣酱^3 dash;伍斯特酱^2 dash;芹菜^1 根", "无酒精血腥玛丽，咸鲜开胃"],
    ["罗伊罗杰斯", "Roy Rogers", "highball", "cubes", "default", 1, "可乐^150ml;红石榴糖浆^15ml;樱桃^1 颗", "可乐版邓波尔，牛仔的汽水"],
    ["阿诺帕尔默", "Arnold Palmer", "highball", "cubes", "default", 1, "红茶^90ml;柠檬水^90ml;柠檬片^1 片", "高尔夫名将之名，冰茶柠檬水各半"],
    ["灰姑娘", "Cinderella", "highball", "none", "default", 1, "橙汁^45ml;菠萝汁^45ml;柠檬汁^15ml;苏打水^少量", "三果汁的午夜魔法，清甜活泼"],
    ["西园花园", "Seedlip Garden", "coupe", "none", "gin", 1, "无酒精金酒^50ml;接骨木花糖浆^15ml;柠檬汁^15ml;黄瓜片^3 片", "无酒精蒸馏的草本花园"],
    ["黄瓜清凉", "Cucumber Cooler", "highball", "cubes", "gin", 1, "黄瓜汁^60ml;青柠汁^20ml;糖浆^15ml;苏打水^顶部补满;薄荷^适量", "黄瓜薄荷的盛夏冷饮"],
    ["姜味气泡", "Ginger Fizz", "highball", "cubes", "vodka", 1, "姜汁糖浆^30ml;柠檬汁^20ml;苏打水^顶部补满;姜片^1 片", "辛辣生姜的清爽气泡"],
    ["接骨木气泡水", "Elderflower Soda", "highball", "cubes", "gin", 1, "接骨木花糖浆^30ml;柠檬汁^15ml;苏打水^顶部补满;薄荷^适量", "花香气泡，优雅无酒精"],
    ["石榴气泡", "Pomegranate Fizz", "highball", "cubes", "campari", 1, "石榴汁^60ml;青柠汁^20ml;糖浆^10ml;苏打水^顶部补满", "石榴的酸甜红宝石气泡"],
    ["热带潘趣", "Tropical Punch", "highball", "crushed", "rum", 1, "菠萝汁^60ml;芒果汁^45ml;百香果糖浆^15ml;青柠汁^15ml", "群果热带潘趣，阳光满杯"],
    ["薰衣草柠檬水", "Lavender Lemonade", "highball", "cubes", "vodka", 1, "柠檬汁^30ml;薰衣草糖浆^25ml;水^90ml;薰衣草^点缀", "薰衣草的花香柠檬水，舒缓宁静"],
    ["蜜桃冰茶", "Peach Iced Tea", "highball", "cubes", "wine", 1, "红茶^120ml;桃子糖浆^25ml;柠檬汁^15ml;桃片^1 片", "蜜桃浸润的冰红茶，夏日午后"],
    ["西瓜清凉", "Watermelon Cooler", "highball", "crushed", "default", 1, "西瓜汁^90ml;青柠汁^20ml;糖浆^10ml;薄荷^适量", "西瓜的清甜多汁，碎冰沁凉"],
    ["芒果拉西", "Mango Lassi", "highball", "none", "cream", 1, "芒果泥^90ml;酸奶^90ml;蜂蜜^15ml;小豆蔻^1 撮", "印度的芒果酸奶，绵密香甜"],
    ["闪亮葡萄", "Sparkling Grape", "coupe", "none", "wine", 1, "无酒精起泡葡萄^120ml;白葡萄汁^45ml;青柠汁^10ml", "无酒精起泡的庆典气氛"],
    ["苹果气泡", "Apple Spritz", "highball", "cubes", "default", 1, "苹果汁^90ml;接骨木花糖浆^15ml;苏打水^顶部补满;苹果片^1 片", "青苹果的清脆气泡"],
    ["薄荷柠檬水", "Mint Lemonade", "highball", "crushed", "absinthe", 1, "柠檬汁^30ml;糖浆^25ml;水^90ml;薄荷叶^10 片", "捣碎薄荷的经典柠檬水"],
    ["洛神花清凉", "Hibiscus Cooler", "highball", "cubes", "campari", 1, "洛神花茶^120ml;青柠汁^20ml;蜂蜜^15ml;苏打水^少量", "洛神花的玫红酸甜冷饮"],
    ["百香果气泡", "Passion Fizz", "highball", "none", "default", 1, "百香果泥^45ml;橙汁^45ml;青柠汁^15ml;苏打水^少量", "百香果的酸香气泡"],
    ["椰子清凉", "Coconut Cooler", "highball", "crushed", "cream", 1, "椰子水^120ml;菠萝汁^45ml;青柠汁^15ml;薄荷^适量", "椰子水的轻盈补水热带"],
    ["香料苹果", "Spiced Apple", "rocks", "none", "default", 1, "苹果汁^120ml;肉桂糖浆^15ml;柠檬汁^15ml;肉桂棒^1 根", "温暖的香料苹果，秋日暖意"],
    ["蔓越莓气泡", "Cranberry Fizz", "highball", "cubes", "campari", 1, "蔓越莓汁^90ml;青柠汁^20ml;糖浆^10ml;苏打水^顶部补满", "蔓越莓的酸涩气泡，节日红"],
    ["荔枝清凉", "Lychee Cooler", "highball", "none", "vodka", 1, "荔枝汁^60ml;青柠汁^15ml;接骨木花糖浆^15ml;苏打水^少量", "荔枝的花香清甜"],
    ["柚子苏打", "Yuzu Soda", "highball", "cubes", "vodka", 1, "柚子糖浆^30ml;柠檬汁^15ml;苏打水^顶部补满;柚子皮^1 片", "柚子的清新柑橘气泡"],
    ["抹茶汤力", "Matcha Tonic", "highball", "cubes", "default", 2, "抹茶^60ml;汤力水^顶部补满;蜂蜜^10ml;柠檬^1 片", "抹茶的微苦遇上汤力的清冽"],
    ["冷萃汤力", "Cold Brew Tonic", "highball", "cubes", "default", 1, "冷萃咖啡^60ml;汤力水^90ml;橙皮^1 片", "冷萃咖啡的意外气泡，清爽提神"],
    ["生姜薄荷", "Ginger Mint", "highball", "crushed", "gin", 1, "姜汁糖浆^25ml;青柠汁^20ml;薄荷叶^8 片;苏打水^顶部补满", "生姜薄荷的双重清凉"],
    ["蓝莓罗勒", "Blueberry Basil", "coupe", "none", "default", 1, "蓝莓泥^45ml;柠檬汁^20ml;糖浆^15ml;罗勒叶^4 片;苏打水^少量", "蓝莓与罗勒的现代无酒精"],
    ["玫瑰荔枝", "Rose Lychee", "coupe", "none", "default", 1, "荔枝汁^45ml;玫瑰糖浆^15ml;柠檬汁^15ml;苏打水^少量", "玫瑰荔枝的浪漫花香"],
    ["桂花乌龙", "Osmanthus Oolong", "highball", "cubes", "wine", 1, "乌龙茶^120ml;桂花糖浆^20ml;柠檬汁^10ml", "桂花乌龙的东方茶韵"],
    ["甜瓜薄荷", "Melon Mint", "highball", "crushed", "gin", 1, "哈密瓜汁^90ml;青柠汁^15ml;糖浆^10ml;薄荷^适量", "哈密瓜的清甜薄荷"],
    ["柑橘冷饮", "Citrus Cooler", "highball", "cubes", "vodka", 1, "橙汁^45ml;西柚汁^45ml;柠檬汁^15ml;苏打水^顶部补满", "三柑橘的明亮维C冷饮"],
    ["维珍日出", "Virgin Sunrise", "highball", "cubes", "default", 1, "橙汁^120ml;红石榴糖浆^15ml;青柠汁^15ml", "无酒精的日出渐变，清甜柑橘"],
    ["无酒精尼格罗尼", "No-groni", "rocks", "cube", "campari", 2, "无酒精苦味^30ml;无酒精金酒^30ml;无酒精味美思^30ml;橙皮^1 片", "苦甜平衡的无酒精尼格罗尼"],
    ["莓果柠檬水", "Berry Lemonade", "highball", "crushed", "default", 1, "草莓泥^45ml;柠檬汁^25ml;糖浆^15ml;水^90ml", "草莓柠檬水的盛夏粉红"],
    ["姜青柠苏打", "Ginger Lime Soda", "highball", "cubes", "vodka", 1, "姜汁糖浆^25ml;青柠汁^20ml;苏打水^顶部补满;青柠片^1 片", "姜与青柠的清爽气泡"],
    ["热带落日", "Tropical Sunset", "highball", "crushed", "campari", 1, "芒果汁^60ml;百香果糖浆^15ml;蔓越莓汁^45ml;青柠汁^15ml", "芒果与蔓越莓的落日渐变"],
    ["青葡萄气泡", "Verjus Spritz", "highball", "cubes", "wine", 1, "未熟葡萄汁^45ml;接骨木花糖浆^15ml;苏打水^顶部补满;薄荷^适量", "青葡萄的酸爽气泡开胃"],
  ],
};

function coerceGlass(s: string): GlassType {
  return isGlassId(s) ? s : "rocks";
}
function coerceIce(s: string): IceType {
  return ICES.has(s as IceType) ? (s as IceType) : "cube";
}
function coerceFamily(s: string): SpiritFamily {
  return FAMILIES.has(s as SpiritFamily) ? (s as SpiritFamily) : "default";
}

/** Derive a ratio "part" from a ml amount; non-ml ingredients aren't adjustable. */
function partsFor(amount: string): number {
  const m = amount.match(/(\d+(?:\.\d+)?)\s*ml/);
  if (m) return Math.max(1, Math.round(parseFloat(m[1]) / 10));
  return 0;
}

function build(): Recipe[] {
  const out: Recipe[] = [];
  (Object.keys(RAW) as RecipeCategory[]).forEach((cat) => {
    RAW[cat].forEach((row, i) => {
      const [name, nameEn, glass, ice, family, difficulty, ingStr, tasting] = row;
      const ingredients = ingStr.split(";").map((seg) => {
        const [n, amount] = seg.split("^");
        return { name: n, amount: amount ?? "适量", parts: partsFor(amount ?? "") };
      });
      out.push({
        id: `${cat}-${i}`,
        name,
        nameEn,
        category: cat,
        glass: coerceGlass(glass),
        ice: coerceIce(ice),
        // colour the glass by what's actually in it (cola, juice, curaçao…),
        // using the authored base spirit only as a fallback.
        family: inferLiquidFamily(ingredients, coerceFamily(family)),
        difficulty: (difficulty === 1 || difficulty === 2 || difficulty === 3 ? difficulty : 2) as 1 | 2 | 3,
        ingredients,
        tasting,
        alcoholFree: cat === "zero",
        layers: RECIPE_LAYERS[nameEn],
      });
    });
  });
  return out;
}

export const RECIPES: Recipe[] = build();

export const RECIPE_COUNT = RECIPES.length;

export const recipeById = (id: string): Recipe | undefined =>
  RECIPES.find((r) => r.id === id);

export const recipesByCategory = (cat: RecipeCategory): Recipe[] =>
  RECIPES.filter((r) => r.category === cat);

export function searchRecipes(query: string): Recipe[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return RECIPES.filter(
    (r) =>
      r.name.includes(q) ||
      r.nameEn.toLowerCase().includes(q) ||
      r.ingredients.some((i) => i.name.includes(q)) ||
      r.tasting.includes(q),
  );
}
