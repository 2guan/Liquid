import type { SpiritFamily } from "../tokens";

/**
 * The Zen Atelier flavour library — the "风味实验空间" (product_spec §3.4).
 * Ten categories, a few hundred ingredients. Each carries a colour (for the
 * flavour-graph node + diffusion animation), flavour descriptor tags (fed to the
 * AI harmony analysis) and, where relevant, a SpiritFamily (base spirits and
 * fortified wines) so hidden-recipe combinations and liquid colour still resolve.
 */

export type FlavorCategory =
  | "spirit"
  | "liqueur"
  | "fortified"
  | "bitters"
  | "juice"
  | "fruit"
  | "herb"
  | "spice"
  | "syrup"
  | "mixer"
  | "garnish";

export interface FlavorCategoryMeta {
  id: FlavorCategory;
  name: string;
  nameEn: string;
  color: string;
}

export const FLAVOR_CATEGORIES: FlavorCategoryMeta[] = [
  { id: "spirit", name: "基酒", nameEn: "Base Spirits", color: "#C8923F" },
  { id: "liqueur", name: "利口酒", nameEn: "Liqueurs", color: "#B5683C" },
  { id: "fortified", name: "加强酒", nameEn: "Fortified & Aperitif", color: "#B0414A" },
  { id: "bitters", name: "苦精", nameEn: "Bitters", color: "#7A3B2E" },
  { id: "juice", name: "果汁", nameEn: "Juices", color: "#E0913B" },
  { id: "fruit", name: "水果", nameEn: "Fresh Fruit", color: "#E87A5A" },
  { id: "herb", name: "草本植物", nameEn: "Herbs & Botanicals", color: "#7E8C4E" },
  { id: "spice", name: "香料", nameEn: "Spices", color: "#9C5A33" },
  { id: "syrup", name: "糖浆与甜味", nameEn: "Syrups", color: "#C99A52" },
  { id: "mixer", name: "气泡与软饮", nameEn: "Mixers", color: "#A9B6BC" },
  { id: "garnish", name: "点缀与香氛", nameEn: "Garnish & Aromatics", color: "#CBB78A" },
];

export interface FlavorIngredient {
  id: string;
  name: string;
  nameEn: string;
  category: FlavorCategory;
  color: string;
  flavor: string[];
  family?: SpiritFamily;
}

/* Compact raw rows: [zh, en, color, "tag|tag|tag", family?] */
type Row = [string, string, string, string, SpiritFamily?];

const RAW: Record<FlavorCategory, Row[]> = {
  spirit: [
    ["苏格兰调和威士忌", "Blended Scotch", "#B9742A", "橡木|麦芽|蜂蜜", "whisky"],
    ["斯佩塞单一麦芽", "Speyside Single Malt", "#C0822F", "苹果|香草|麦芽", "whisky"],
    ["艾雷岛泥煤威士忌", "Islay Peated", "#9A5B22", "泥煤|海盐|烟熏", "whiskyPeat"],
    ["高地威士忌", "Highland Whisky", "#B16C26", "石楠|焦糖|橡木", "whisky"],
    ["波本威士忌", "Bourbon", "#A85F22", "玉米|香草|焦糖", "whisky"],
    ["黑麦威士忌", "Rye Whiskey", "#9E5A26", "黑麦|辛香|胡椒", "whisky"],
    ["爱尔兰威士忌", "Irish Whiskey", "#C68A3A", "顺滑|青苹果|奶油", "whisky"],
    ["日本威士忌", "Japanese Whisky", "#C8923F", "蜂蜜|檀木|橘皮", "whisky"],
    ["田纳西威士忌", "Tennessee Whiskey", "#A65E22", "枫糖|炭滤|香草", "whisky"],
    ["伦敦干金酒", "London Dry Gin", "#D8E3DA", "杜松|柑橘|草本", "gin"],
    ["老汤姆金酒", "Old Tom Gin", "#CBD9C4", "微甜|杜松|柑橘", "gin"],
    ["普利茅斯金酒", "Plymouth Gin", "#D2DDD2", "柔和|根茎|柑橘", "gin"],
    ["黑刺李金酒", "Sloe Gin", "#7E2233", "黑刺李|杏仁|酸甜", "wine"],
    ["日式金酒", "Japanese Gin", "#D6E2D6", "柚子|山椒|樱花", "gin"],
    ["白朗姆", "White Rum", "#EDE4CC", "甘蔗|椰子|清爽", "rum"],
    ["金朗姆", "Gold Rum", "#C68A45", "焦糖|香草|橡木", "rum"],
    ["黑朗姆", "Dark Rum", "#7A4423", "糖蜜|可可|香料", "rum"],
    ["农业朗姆", "Rhum Agricole", "#D8B36A", "青草|甘蔗汁|矿物", "rum"],
    ["白龙舌兰", "Blanco Tequila", "#E3D5A0", "龙舌兰|青草|柑橘", "tequila"],
    ["微陈龙舌兰", "Reposado", "#D6B25E", "烤龙舌兰|香草|橡木", "tequila"],
    ["梅斯卡尔", "Mezcal", "#C9A85A", "烟熏|青草|矿物", "tequila"],
    ["伏特加", "Vodka", "#F2F4F0", "干净|微甜|中性", "vodka"],
    ["黑麦伏特加", "Rye Vodka", "#ECEEE8", "谷物|胡椒|圆润", "vodka"],
    ["干邑白兰地", "Cognac", "#A8521F", "葡萄|蜜饯|雪松", "brandy"],
    ["雅文邑", "Armagnac", "#9C4A1C", "李子|烟草|焦糖", "brandy"],
    ["卡尔瓦多斯", "Calvados", "#B5651D", "苹果|梨|橡木", "brandy"],
    ["皮斯科", "Pisco", "#E4DBC0", "葡萄|花香|青草", "brandy"],
    ["卡莎萨", "Cachaça", "#E6DCC2", "甘蔗汁|青草|果香", "rum"],
    ["中国白酒", "Baijiu", "#F0F2EC", "高粱|曲香|浓烈", "vodka"],
  ],
  liqueur: [
    ["君度橙酒", "Cointreau", "#E8E0CC", "甜橙|清爽|柑橘", "default"],
    ["金万利", "Grand Marnier", "#C77F35", "橙皮|干邑|焦糖", "brandy"],
    ["蓝橙利口酒", "Blue Curaçao", "#2E7FB0", "苦橙|甜|亮蓝"],
    ["黑樱桃利口酒", "Maraschino", "#E7DEC8", "樱桃核|杏仁|花香"],
    ["阿玛雷托", "Amaretto", "#A85A2C", "杏仁|焦糖|杏核"],
    ["咖啡利口酒", "Coffee Liqueur", "#3A2416", "咖啡|焦糖|可可"],
    ["接骨木花利口酒", "Elderflower", "#E4E6C8", "接骨木|荔枝|花香"],
    ["桃子利口酒", "Peach Schnapps", "#E9A66A", "白桃|甜|多汁"],
    ["椰子利口酒", "Coconut Liqueur", "#EFE8D6", "椰子|奶香|热带"],
    ["可可利口酒", "Crème de Cacao", "#5A3A22", "可可|香草|甜"],
    ["薄荷利口酒", "Crème de Menthe", "#5FB07E", "薄荷|清凉|甜"],
    ["紫罗兰利口酒", "Crème de Violette", "#6E4A86", "紫罗兰|花香|莓果"],
    ["黑加仑利口酒", "Crème de Cassis", "#4A1E33", "黑加仑|莓果|酸甜"],
    ["覆盆子利口酒", "Chambord", "#5A1E33", "覆盆子|黑莓|蜂蜜"],
    ["杏子白兰地", "Apricot Brandy", "#D08A40", "杏|蜜饯|果核"],
    ["樱桃利口酒", "Cherry Heering", "#6E1F2A", "黑樱桃|杏仁|香料"],
    ["绿查特酒", "Green Chartreuse", "#7E8C3A", "草本|薄荷|辛香"],
    ["黄查特酒", "Yellow Chartreuse", "#C9A93E", "蜂蜜|草本|藏红花"],
    ["修士酒", "Bénédictine", "#A87A38", "蜂蜜|草本|香料"],
    ["茴香酒", "Sambuca", "#ECE6D6", "茴香|甘草|甜"],
    ["爱尔兰奶油利口酒", "Irish Cream", "#C8A878", "奶油|可可|威士忌", "cream"],
    ["榛子利口酒", "Frangelico", "#9C6634", "榛子|可可|香草"],
    ["姜味利口酒", "Ginger Liqueur", "#D2A24A", "生姜|蜂蜜|辛香"],
    ["三干橙酒", "Triple Sec", "#E6DECA", "甜橙|清爽|柑橘"],
    ["龙舌兰橙酒", "Orange Curaçao", "#C98A3A", "苦橙|香料|橡木"],
    ["茴香烈酒", "Absinthe", "#9FB45A", "茴香|苦艾|薄荷", "absinthe"],
  ],
  fortified: [
    ["甜味美思", "Sweet Vermouth", "#7E2E30", "香草|可可|苦橙", "vermouth"],
    ["干味美思", "Dry Vermouth", "#C9B98A", "草本|花香|干爽", "vermouth"],
    ["白味美思", "Bianco Vermouth", "#D8CBA0", "香草|花香|微甜", "vermouth"],
    ["菲诺雪莉", "Fino Sherry", "#D8C98A", "杏仁|海盐|干爽", "wine"],
    ["阿蒙提亚多雪莉", "Amontillado", "#B5803E", "榛子|焦糖|坚果", "wine"],
    ["欧罗索雪莉", "Oloroso Sherry", "#8A4A22", "核桃|无花果|橡木", "wine"],
    ["佩德罗-希梅内斯", "Pedro Ximénez", "#3A1C12", "葡萄干|糖蜜|无花果", "wine"],
    ["红宝石波特", "Ruby Port", "#5A1722", "黑莓|李子|甜", "wine"],
    ["茶色波特", "Tawny Port", "#8A3A22", "焦糖|坚果|干果", "wine"],
    ["马德拉", "Madeira", "#7A3A1E", "焦糖|坚果|烟熏", "wine"],
    ["玛萨拉", "Marsala", "#8A4420", "焦糖|杏|坚果", "wine"],
    ["利莱白", "Lillet Blanc", "#E0CF96", "蜜橙|花香|微苦", "vermouth"],
    ["金巴利", "Campari", "#C5384A", "苦橙|龙胆|红莓", "campari"],
    ["阿佩罗", "Aperol", "#E8623A", "苦橙|大黄|微甜", "campari"],
    ["苏兹", "Suze", "#D6C24A", "龙胆|草本|柑橘"],
    ["菲奈特布兰卡", "Fernet-Branca", "#3A2018", "薄荷|草本|苦"],
    ["莎都斯", "Cynar", "#5A3320", "朝鲜蓟|草本|苦甜"],
    ["杜本内", "Dubonnet", "#5A1E2A", "草本|苦橙|可可", "vermouth"],
    ["公鸡美国佬", "Cocchi Americano", "#D8C078", "龙胆|柑橘|草本", "vermouth"],
    ["干型雪莉", "Manzanilla", "#D6C88A", "海盐|杏仁|青苹果", "wine"],
  ],
  bitters: [
    ["安格仕苦精", "Angostura Bitters", "#5A2418", "肉桂|丁香|龙胆"],
    ["橙味苦精", "Orange Bitters", "#B5662A", "橙皮|香料|苦"],
    ["裴乔氏苦精", "Peychaud's Bitters", "#9E2A2A", "茴香|樱桃|花香"],
    ["巧克力苦精", "Chocolate Bitters", "#3A2016", "可可|咖啡|香料"],
    ["芹菜苦精", "Celery Bitters", "#6E7E3A", "芹菜|草本|青涩"],
    ["葡萄柚苦精", "Grapefruit Bitters", "#C9663A", "葡萄柚|苦|柑橘"],
    ["黑核桃苦精", "Black Walnut Bitters", "#4A2E1A", "核桃|烤香|苦"],
    ["樱桃苦精", "Cherry Bitters", "#7A2030", "樱桃|杏仁|香料"],
    ["芳香苦精", "Aromatic Bitters", "#5E2A1C", "香料|木质|草本"],
    ["烟熏苦精", "Smoke Bitters", "#3E2A20", "烟熏|木炭|辛香"],
    ["薰衣草苦精", "Lavender Bitters", "#7E6A9A", "薰衣草|花香|草本"],
    ["小豆蔻苦精", "Cardamom Bitters", "#8A6A3A", "小豆蔻|柑橘|辛香"],
    ["桃子苦精", "Peach Bitters", "#C98A4A", "桃|果香|苦"],
    ["咖啡苦精", "Coffee Bitters", "#3A2418", "咖啡|焦糖|苦"],
    ["茴香苦精", "Fennel Bitters", "#8A9A4A", "茴香|甘草|草本"],
    ["姜味苦精", "Ginger Bitters", "#B5803A", "生姜|辛香|柑橘"],
    ["玫瑰苦精", "Rose Bitters", "#A8506A", "玫瑰|花香|苦"],
    ["焦糖苦精", "Burnt Sugar Bitters", "#6A3A1E", "焦糖|烤香|苦"],
  ],
  juice: [
    ["柠檬汁", "Lemon Juice", "#E8C84A", "酸|柑橘|清爽"],
    ["青柠汁", "Lime Juice", "#9FC24A", "酸|青草|柑橘"],
    ["橙汁", "Orange Juice", "#E8923A", "甜橙|多汁|柑橘"],
    ["血橙汁", "Blood Orange Juice", "#C5402A", "莓果|苦橙|柑橘"],
    ["葡萄柚汁", "Grapefruit Juice", "#E0654A", "苦|酸|柑橘"],
    ["柚子汁", "Yuzu Juice", "#E0C84A", "花香|酸|柑橘"],
    ["菠萝汁", "Pineapple Juice", "#E8C23A", "热带|酸甜|多汁"],
    ["芒果汁", "Mango Juice", "#E8A82A", "热带|甜|浓郁"],
    ["百香果汁", "Passion Fruit Juice", "#D89A2A", "热带|酸|芳香"],
    ["西瓜汁", "Watermelon Juice", "#E0566A", "清爽|多汁|甜"],
    ["苹果汁", "Apple Juice", "#C6B85A", "青苹果|脆|清爽"],
    ["葡萄汁", "Grape Juice", "#5A2A5A", "果香|甜|圆润"],
    ["蔓越莓汁", "Cranberry Juice", "#B5283A", "酸|莓果|涩"],
    ["石榴汁", "Pomegranate Juice", "#A8283A", "莓果|酸甜|涩"],
    ["番茄汁", "Tomato Juice", "#C5402A", "鲜咸|蔬菜|圆润"],
    ["桃汁", "Peach Juice", "#E8A86A", "白桃|甜|多汁"],
    ["荔枝汁", "Lychee Juice", "#E8D0C8", "花香|甜|多汁"],
    ["椰子水", "Coconut Water", "#E4E8DC", "椰子|清爽|微甜"],
  ],
  fruit: [
    ["柠檬", "Lemon", "#E8C84A", "酸|柑橘|清爽"],
    ["青柠", "Lime", "#9FC24A", "酸|青草|柑橘"],
    ["橙子", "Orange", "#E8923A", "甜橙|多汁|柑橘"],
    ["血橙", "Blood Orange", "#C5402A", "莓果|苦橙|柑橘"],
    ["葡萄柚", "Grapefruit", "#E0654A", "苦|酸|柑橘"],
    ["柚子", "Yuzu", "#E0C84A", "花香|酸|柑橘"],
    ["金橘", "Kumquat", "#E8973A", "苦甜|皮香|柑橘"],
    ["草莓", "Strawberry", "#D83A4A", "莓果|甜|多汁"],
    ["覆盆子", "Raspberry", "#C5304A", "莓果|酸甜|花香"],
    ["蓝莓", "Blueberry", "#4A4A8A", "莓果|甜|果酱"],
    ["黑莓", "Blackberry", "#3A1E3A", "莓果|深沉|酸甜"],
    ["蔓越莓", "Cranberry", "#B5283A", "酸|莓果|涩"],
    ["樱桃", "Cherry", "#9E1F2A", "甜|核香|多汁"],
    ["桃子", "Peach", "#E8A86A", "白桃|甜|多汁"],
    ["杏", "Apricot", "#E0913A", "杏|蜜饯|果核"],
    ["李子", "Plum", "#6E2A4A", "酸甜|深沉|果香"],
    ["苹果", "Apple", "#9FC24A", "青苹果|脆|清爽"],
    ["梨", "Pear", "#C9D08A", "多汁|花香|清甜"],
    ["菠萝", "Pineapple", "#E8C23A", "热带|酸甜|多汁"],
    ["芒果", "Mango", "#E8A82A", "热带|甜|浓郁"],
    ["百香果", "Passion Fruit", "#D89A2A", "热带|酸|芳香"],
    ["西瓜", "Watermelon", "#E0566A", "清爽|多汁|甜"],
    ["葡萄", "Grape", "#5A2A5A", "果香|甜|圆润"],
    ["荔枝", "Lychee", "#E8D0C8", "花香|甜|多汁"],
    ["椰子", "Coconut", "#EFE8D6", "奶香|热带|甜"],
    ["石榴", "Pomegranate", "#A8283A", "莓果|酸甜|涩"],
    ["无花果", "Fig", "#6E3A2A", "蜜甜|果酱|籽感"],
    ["黑加仑", "Blackcurrant", "#3A1E3A", "莓果|深沉|酸"],
    ["哈密瓜", "Cantaloupe", "#E8B06A", "清甜|多汁|花香"],
    ["番石榴", "Guava", "#E07A6A", "热带|花香|甜"],
  ],
  herb: [
    ["薄荷", "Mint", "#6EA84A", "清凉|草本|清新"],
    ["留兰香", "Spearmint", "#7EB05A", "柔和薄荷|清新|甜"],
    ["罗勒", "Basil", "#4A8A3A", "草本|辛香|清新"],
    ["迷迭香", "Rosemary", "#5A7A4A", "松针|木质|草本"],
    ["百里香", "Thyme", "#6E8A4A", "草本|泥土|辛香"],
    ["鼠尾草", "Sage", "#8A9A6A", "草本|微苦|木质"],
    ["薰衣草", "Lavender", "#8A6AA8", "花香|草本|镇静"],
    ["紫苏", "Shiso", "#7E5A8A", "草本|薄荷|柑橘"],
    ["香茅", "Lemongrass", "#A8B56A", "柑橘|草本|清新"],
    ["莳萝", "Dill", "#7E9A4A", "草本|茴香|清新"],
    ["龙蒿", "Tarragon", "#6E8A4A", "茴香|草本|微甜"],
    ["香菜", "Cilantro", "#5A8A3A", "草本|柑橘|青涩"],
    ["柠檬马鞭草", "Lemon Verbena", "#A8C26A", "柠檬|草本|清新"],
    ["月桂叶", "Bay Leaf", "#5A7A4A", "木质|草本|辛香"],
    ["苦艾草", "Wormwood", "#8A9A5A", "苦|草本|茴香"],
    ["啤酒花", "Hops", "#9AAB5A", "苦|柑橘|松香"],
    ["芦荟", "Aloe", "#A8C28A", "清新|草本|微甜"],
    ["柠檬香蜂草", "Lemon Balm", "#A8C25A", "柠檬|薄荷|草本"],
    ["香兰叶", "Pandan", "#5A8A4A", "椰香|青草|甜"],
  ],
  spice: [
    ["肉桂", "Cinnamon", "#9C5A2A", "温暖|甜|木质"],
    ["丁香", "Clove", "#5A3320", "辛香|温暖|药香"],
    ["八角", "Star Anise", "#7A3A24", "茴香|甘草|温暖"],
    ["小豆蔻", "Cardamom", "#8A9A5A", "辛香|柑橘|花香"],
    ["黑胡椒", "Black Pepper", "#3A3028", "辛辣|木质|温暖"],
    ["粉红胡椒", "Pink Pepper", "#C56A5A", "果香|辛香|温和"],
    ["生姜", "Ginger", "#C99A4A", "辛辣|温暖|柑橘"],
    ["肉豆蔻", "Nutmeg", "#8A5A34", "温暖|坚果|甜"],
    ["香草", "Vanilla", "#D8C28A", "甜|奶香|花香"],
    ["藏红花", "Saffron", "#C5662A", "花香|蜜甜|药香"],
    ["茴香籽", "Fennel Seed", "#9AAB5A", "茴香|甘草|清凉"],
    ["芫荽籽", "Coriander Seed", "#B5A05A", "柑橘|温暖|木质"],
    ["杜松子", "Juniper Berry", "#5A6A4A", "松针|树脂|草本"],
    ["辣椒", "Chili", "#C5342A", "辛辣|果香|温热"],
    ["烟熏辣椒", "Chipotle", "#8A3A20", "烟熏|辛辣|泥土"],
    ["多香果", "Allspice", "#6E3A20", "丁香|肉桂|肉豆蔻"],
    ["甘草", "Licorice", "#3A2A24", "甘草|甜|药香"],
    ["可可粒", "Cacao Nib", "#4A2A1A", "可可|苦|烤香"],
    ["咖啡豆", "Coffee Bean", "#3A2418", "咖啡|烤香|苦"],
    ["山椒", "Sansho Pepper", "#8A9A4A", "麻|柑橘|清凉"],
    ["桂皮", "Cassia", "#9C5A2A", "肉桂|甜|浓郁"],
    ["孜然", "Cumin", "#9C6634", "泥土|温暖|辛香"],
    ["黑芝麻", "Black Sesame", "#3A322C", "坚果|烤香|醇厚"],
  ],
  syrup: [
    ["单糖浆", "Simple Syrup", "#E6DECA", "纯甜|中性|圆润"],
    ["德梅拉拉糖浆", "Demerara Syrup", "#9C6634", "焦糖|红糖|醇厚"],
    ["蜂蜜糖浆", "Honey Syrup", "#D8A23A", "蜂蜜|花香|甜"],
    ["龙舌兰糖浆", "Agave Syrup", "#C9A24A", "龙舌兰|清甜|温和"],
    ["枫糖浆", "Maple Syrup", "#A8642A", "枫糖|焦糖|木质"],
    ["红石榴糖浆", "Grenadine", "#B5283A", "石榴|莓果|甜"],
    ["杏仁糖浆", "Orgeat", "#E0D2B0", "杏仁|橙花|奶香"],
    ["肉桂糖浆", "Cinnamon Syrup", "#9C5A2A", "肉桂|温暖|甜"],
    ["香草糖浆", "Vanilla Syrup", "#D8C28A", "香草|奶香|甜"],
    ["姜糖浆", "Ginger Syrup", "#C99A4A", "生姜|辛香|甜"],
    ["接骨木花糖浆", "Elderflower Cordial", "#E0E2C0", "花香|荔枝|甜"],
    ["玫瑰糖浆", "Rose Syrup", "#C56A86", "玫瑰|花香|甜"],
    ["薰衣草糖浆", "Lavender Syrup", "#8A6AA8", "薰衣草|花香|甜"],
    ["焦糖糖浆", "Caramel Syrup", "#8A4A1E", "焦糖|烤香|甜"],
    ["百香果糖浆", "Passion Fruit Syrup", "#D89A2A", "百香果|热带|酸甜"],
    ["草莓糖浆", "Strawberry Syrup", "#D83A4A", "草莓|莓果|甜"],
    ["覆盆子糖浆", "Raspberry Syrup", "#C5304A", "覆盆子|莓果|酸甜"],
    ["黑加仑糖浆", "Blackcurrant Syrup", "#4A1E33", "黑加仑|莓果|酸甜"],
    ["桂花糖浆", "Osmanthus Syrup", "#E0B85A", "桂花|蜜甜|杏"],
    ["咖啡糖浆", "Coffee Syrup", "#3A2418", "咖啡|焦糖|甜"],
    ["盐渍焦糖糖浆", "Salted Caramel", "#7A4420", "焦糖|海盐|甜"],
    ["柚子糖浆", "Yuzu Syrup", "#E0C84A", "柚子|柑橘|花香"],
  ],
  mixer: [
    ["苏打水", "Soda Water", "#DCE6EA", "气泡|中性|清爽"],
    ["汤力水", "Tonic Water", "#D6E2E0", "金鸡纳|微苦|气泡"],
    ["姜汁汽水", "Ginger Ale", "#D8C88A", "生姜|气泡|清甜"],
    ["姜啤", "Ginger Beer", "#C9A24A", "生姜|辛香|气泡"],
    ["可乐", "Cola", "#5A3320", "焦糖|香料|气泡"],
    ["柠檬青柠汽水", "Lemon-Lime Soda", "#C9D88A", "柑橘|清爽|气泡"],
    ["苦柠檬汽水", "Bitter Lemon", "#D8D86A", "柠檬|微苦|气泡"],
    ["香槟", "Champagne", "#E0D8A8", "气泡|烤面包|果香", "wine"],
    ["普罗赛克", "Prosecco", "#E4DCB0", "气泡|青苹果|花香", "wine"],
    ["卡瓦", "Cava", "#E0D8A8", "气泡|柑橘|矿物", "wine"],
    ["红葡萄酒", "Red Wine", "#5A1722", "黑果|单宁|橡木", "wine"],
    ["白葡萄酒", "White Wine", "#D8CE96", "青苹果|柑橘|花香", "wine"],
    ["清酒", "Sake", "#E8E4D2", "米香|花香|清雅"],
    ["绿茶", "Green Tea", "#8AA85A", "青草|涩|清雅"],
    ["红茶", "Black Tea", "#8A4A22", "单宁|麦芽|醇厚"],
    ["乌龙茶", "Oolong Tea", "#A8702A", "焙香|花香|醇厚"],
    ["冷萃咖啡", "Cold Brew", "#3A2418", "咖啡|焦糖|顺滑"],
    ["椰奶", "Coconut Milk", "#EFE8D6", "奶香|椰子|顺滑", "cream"],
    ["淡奶油", "Light Cream", "#E8E0C8", "奶香|顺滑|绵密", "cream"],
  ],
  garnish: [
    ["海盐", "Sea Salt", "#E6E6E0", "咸|矿物|提味"],
    ["盐边", "Salt Rim", "#E0E0DA", "咸|脆|提味"],
    ["糖边", "Sugar Rim", "#ECE4D0", "甜|脆|装饰"],
    ["烟熏", "Smoke", "#6A5A4A", "烟熏|木质|香氛"],
    ["蛋白", "Egg White", "#EFE9D8", "绵密|泡沫|圆润"],
    ["鲜奶油", "Cream", "#E8E0C8", "奶香|绵密|顺滑", "cream"],
    ["橙皮", "Orange Peel", "#E8923A", "橙油|芳香|苦甜"],
    ["柠檬皮卷", "Lemon Twist", "#E8C84A", "柠檬油|芳香|清新"],
    ["葡萄柚皮", "Grapefruit Peel", "#E0654A", "果油|苦|芳香"],
    ["黄瓜片", "Cucumber", "#A8C28A", "清爽|青草|多汁"],
    ["橄榄", "Olive", "#7E8A4A", "咸鲜|油润|草本"],
    ["腌洋葱", "Cocktail Onion", "#D8CBA0", "酸|脆|咸鲜"],
    ["马拉斯加樱桃", "Maraschino Cherry", "#9E1F2A", "甜|樱桃|糖渍"],
    ["食用花", "Edible Flower", "#C56A86", "花香|清雅|装饰"],
    ["洋甘菊", "Chamomile", "#D8C86A", "花香|苹果|蜂蜜"],
    ["玫瑰花瓣", "Rose Petal", "#C56A86", "玫瑰|花香|甜"],
    ["茉莉", "Jasmine", "#E0E0C8", "花香|清雅|甜"],
    ["桂花", "Osmanthus", "#E0B85A", "花香|蜜甜|杏"],
    ["接骨木花", "Elderflower", "#E0E2C0", "花香|荔枝|蜂蜜"],
    ["紫罗兰", "Violet", "#7E5A9A", "花香|莓果|甜"],
    ["金箔", "Gold Leaf", "#E3C684", "奢华|装饰|中性"],
    ["可可粉", "Cocoa Powder", "#5A3A2A", "可可|微苦|香氛"],
    ["抹茶粉", "Matcha Powder", "#7EA84A", "青草|微苦|醇厚"],
    ["脱水柑橘片", "Dried Citrus", "#D8923A", "柑橘|焦香|装饰"],
  ],
};

function build(): FlavorIngredient[] {
  const out: FlavorIngredient[] = [];
  (Object.keys(RAW) as FlavorCategory[]).forEach((cat) => {
    RAW[cat].forEach((row, i) => {
      out.push({
        id: `${cat}-${i}`,
        name: row[0],
        nameEn: row[1],
        category: cat,
        color: row[2],
        flavor: row[3].split("|"),
        family: row[4],
      });
    });
  });
  return out;
}

export const FLAVORS: FlavorIngredient[] = build();

export const FLAVOR_COUNT = FLAVORS.length;

export const flavorById = (id: string): FlavorIngredient | undefined =>
  FLAVORS.find((f) => f.id === id);

export const flavorsByCategory = (cat: FlavorCategory): FlavorIngredient[] =>
  FLAVORS.filter((f) => f.category === cat);

export function searchFlavors(query: string): FlavorIngredient[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return FLAVORS.filter(
    (f) =>
      f.name.includes(q) ||
      f.nameEn.toLowerCase().includes(q) ||
      f.flavor.some((t) => t.includes(q)),
  );
}
