function getData(){
    let items = [{
    item: "كيس كاتشب",
    price: 2,
    boughtItems:0,
    img: "../images/01.jpg"
},
{
    item: "ساندوتش فول",
    price: 8,
    boughtItems:0,
    img: "../images/02.jpg"
},
{
    item: "شوب قصب",
    price: 10,
    boughtItems:0,
    img: "../images/03.jpg"
},
{
    item: "لتر صودا",
    price: 19,
    boughtItems:0,
    img: "../images/04.jpg"
},
{
    item: "طبق كشرى",
    price: 28,
    boughtItems:0,
    img: "../images/05.jpg"
},
{
    item: "لتر لبن",
    price: 48,
    boughtItems:0,
    img: "../images/06.jpg"
},
{
    item: "علبة تونة",
    price: 68,
    boughtItems:0,
    img: "../images/07.jpg"
},
{
    item: "ساندوتش شاورما سورى",
    price: 75,
    boughtItems:0,
    img: "../images/08.jpg"
},
{
    item: "ساندوتش برجر كومبو",
    price: 115,
    boughtItems:0,
    img: "../images/09.jpg"
},
{
    item: "قصة أو كتاب",
    price: 125,
    boughtItems:0,
    img: "../images/10.jpg"
},
{
    item: "تذكرة سينما",
    price: 135,
    boughtItems:0,
    img: "../images/11.jpg"
},
{
    item: "شبشب",
    price: 144,
    boughtItems:0,
    img: "../images/12.jpg"
},
{
    item: "كرتونة بيض",
    price: 173,
    boughtItems:0,
    img: "../images/13.jpg"
},
{
    item: "اشتراك واتش ات لمدة سنة",
    price: 200,
    boughtItems:0,
    img: "../images/14.jpg"
},
{
    item: "وجبة فراخ بروست كومبو",
    price: 221,
    boughtItems:0,
    img: "../images/15.jpg"
},
{
    item: "كرسى بلاستيك",
    price: 270,
    boughtItems:0,
    img: "../images/16.jpg"
},
{
    item: "علبة حفاضات",
    price: 335,
    boughtItems:0,
    img: "../images/17.jpg"
},
{ 
    item: "كيلو لحمة",
    price: 360,
    boughtItems:0,
    img: "../images/18.jpg"
},
{ 
    item: "زيت ٥ لتر",
    price: 622,
    boughtItems:0,
    img: "../images/19.jpg"
},
{
    item: "تفويلة بنزين ٩٥",
    price: 750,
    boughtItems:0,
    img: "../images/20.jpg"
},
{
    item: "تذكرة حفلة لعمرو دياب",
    price: 1750,
    boughtItems:0,
    img: "../images/21.jpg"
},
{
    item: "طقم حلل",
    price: 4200,
    boughtItems:0,
    img: "../images/22.jpg"
},
{
    item: "اشتراك بن سبورت لمدة سنة",
    price: 7650,
    boughtItems:0,
    img: "../images/23.jpg"
},
{
    item: "ليلة فى فندق فاخر",
    price: 10800,
    boughtItems:0,
    img: "../images/24.jpg"
},
{
    item: "اشتراك جولدز جيم لمدة سنة",
    price: 13000,
    boughtItems:0,
    img: "../images/25.jpg"
},
{
    item: "سماعات آير بودز",
    price: 15900,
    boughtItems:0,
    img: "../images/26.jpg"
},
{
    item: "زجاجة برفان أصلية",
    price: 19950,
    boughtItems:0,
    img: "../images/27.jpg"
},
{
    item: "بدلة",
    price: 24200,
    boughtItems:0,
    img: "../images/28.jpg"
},
{
    item: "فستان",
    price: 29700,
    boughtItems:0,
    img: "../images/29.jpg"
},
{
    item: "عجلة ترينكس",
    price: 32000,
    boughtItems:0,
    img: "../images/30.jpg"
},
{ 
    item: "غسالة ملابس",
    price: 33100,
    boughtItems:0,
    img: "../images/31.jpg"
},
{
    item: "موتوسيكل حلاوة صينى",
    price: 39000,
    boughtItems:0,
    img: "../images/32.jpg"
},
{
    item: "بلايستيشن ٥",
    price: 40500,
    boughtItems:0,
    img: "../images/33.jpg"
},
{
    item: "عملية تجميل",
    price: 50000,
    boughtItems:0,
    img: "../images/34.jpg"
},
{
    item: "سامسونج جالاكسى إس٢٤",
    price: 65700,
    boughtItems:0,
    img: "../images/35.jpg"
},
{
    item: "رحلة عمرة",
    price: 70000,
    boughtItems:0,
    img: "../images/36.jpg"
},
{
    item: "آيفون ١٥ برو",
    price: 51900,
    boughtItems:0,
    img: "../images/37.jpg"
},
{
    item: "تليفيزيون ٦٥ بوصة",
    price: 55000,
    boughtItems:0,
    img: "../images/38.jpg"
},
{
    item: "توكتوك",
    price: 91000,
    boughtItems:0,
    img: "../images/39.jpg"
},
{
    item: "ماك بوك برو",
    price: 172000,
    boughtItems:0,
    img: "../images/40.jpg"
},
{
    item: "سبيكة ذهب ٥٠ جرام",
    price: 199600,
    boughtItems:0,
    img: "../images/41.jpg"
},
{
    item: "كمبيوتر ألعاب متطور",
    price: 242000,
    boughtItems:0,
    img: "../images/42.jpg"
},
{
    item: "رحلة حج",
    price: 450000,
    boughtItems:0,
    img: "../images/43.jpg"
},
{
    item: "ساعة رولكس",
    price: 482000,
    boughtItems:0,
    img: "../images/44.jpg"
},
{
    item: "موتوسيكل هوندا",
    price:586000 ,
    boughtItems:0,
    img: "../images/45.jpg"
},
{
    item: "خاتم ألماظ",
    price: 612000,
    boughtItems:0,
    img: "../images/46.jpg"
},
{
    item: "نيسان صنى",
    price: 761000,
    boughtItems:0,
    img: "../images/47.jpg"
},
{
    item: "جيت سكى ياماها",
    price: 864000,
    boughtItems:0,
    img: "../images/48.jpg"
},
{
    item: "تويوتا كرولا",
    price: 1800000,
    boughtItems:0,
    img: "../images/49.jpg"
},
{
    item: "فدان أرض زراعية",
    price: 2300000,
    boughtItems:0,
    img: "../images/50.jpg"
},
{
    item: "تيسلا إكس",
    price: 4400000,
    boughtItems:0,
    img: "../images/51.jpg"
},
{
    item: "بى إم دبليو إكس ٦",
    price: 8700000,
    boughtItems:0,
    img: "../images/52.jpg"
},

{
    item: "فيلا فى التجمع",
    price: 9200000,
    boughtItems:0,
    img: "../images/53.jpg"
},
{
    item: "شقة على النيل",
    price: 15200000,
    boughtItems:0,
    img: "../images/54.jpg"
},
{
    item: "فيلا فى الساحل",
    price: 16000000,
    boughtItems:0,
    img: "../images/55.jpg"
},
{
    item: "إنتاج فيلم سينمائى",
    price: 40000000,
    boughtItems:0,
    img: "../images/56.jpg"
},
{
    item: "رحلة أسبوع فى كل دولة",
    price: 50000000,
    boughtItems:0,
    img: "../images/57.jpg"
},
{
    item: "يخت",
    price: 300000000,
    boughtItems:0,
    img: "../images/58.jpg"
},
{
    item: "دبابة",
    price: 310000000,
    boughtItems:0,
    img: "../images/59.jpg"
},
{ 
    item: "هليكوبتر أباتشى",
    price: 1240000000,
    boughtItems:0,
    img: "../images/60.jpg"
},

]
return items;
}
