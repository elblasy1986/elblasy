
function getData(){
    let items = [{
    item: "كيس كاتشب هاينز",
    price: 1,
    boughtItems:0,
    img: "../images/01.jpg"
},
{
    item: "ساندوتش فول",
    price: 4,
    boughtItems:0,
    img: "../images/02.jpg"
},
{
    item: "شوب قصب",
    price: 5,
    boughtItems:0,
    img: "../images/03.jpg"
},
{
    item: "لتر بيبسي",
    price: 11,
    boughtItems:0,
    img: "../images/04.jpg"
},
{
    item: "طبق كشري",
    price: 15,
    boughtItems:0,
    img: "../images/05.jpg"
},
{
    item: "لتر لبن",
    price: 21,
    boughtItems:0,
    img: "../images/06.jpg"
},
{
    item: "علبة تونة",
    price: 29,
    boughtItems:0,
    img: "../images/07.jpg"
},
{
    item: "ساندوتش شاورما سوري",
    price: 36,
    boughtItems:0,
    img: "../images/08.jpg"
},
{
    item: "ساندوتش بيج ماك كومبو",
    price: 59,
    boughtItems:0,
    img: "../images/09.jpg"
},
{
    item: "قصة أو كتاب",
    price: 60,
    boughtItems:0,
    img: "../images/10.jpg"
},
{
    item: "شبشب",
    price: 75,
    boughtItems:0,
    img: "../images/11.jpg"
},
{
    item: "كرتونة بيض",
    price: 80,
    boughtItems:0,
    img: "../images/12.jpg"
},
{
    item: "تذكرة سينما",
    price: 85,
    boughtItems:0,
    img: "../images/13.jpg"
},
{
    item: "وجبة دينر بوكس كومبو",
    price: 103,
    boughtItems:0,
    img: "../images/14.jpg"
},
{
    item: "كرسي بلاستيك",
    price: 135,
    boughtItems:0,
    img: "../images/15.jpg"
},
{
    item: "علبة حفاضات بامبرز",
    price: 198,
    boughtItems:0,
    img: "../images/16.jpg"
},
{
    item: "تفويلة بنزين ٩٥",
    price: 645,
    boughtItems:0,
    img: "../images/17.jpg"
},
{
    item: "تذكرة لحفلة عمرو دياب",
    price: 1750,
    boughtItems:0,
    img: "../images/18.jpg"
},
{
    item: "اشتراك نتفليكس لمدة سنة",
    price: 1980,
    boughtItems:0,
    img: "../images/19.jpg"
},
{
    item: "طقم حلل تيفال",
    price: 2200,
    boughtItems:0,
    img: "../images/20.jpg"
},
{
    item: "اشتراك بن سبورت لمدة سنة",
    price: 2760,
    boughtItems:0,
    img: "../images/21.jpg"
},
{
    item: "ليلة في فندق فاخر",
    price: 5400,
    boughtItems:0,
    img: "../images/22.jpg"
},
{
    item: "سماعات آير بودز برو",
    price: 6600,
    boughtItems:0,
    img: "../images/23.jpg"
},
{
    item: "اشتراك جولدز جيم لمدة سنة",
    price: 10000,
    boughtItems:0,
    img: "../images/24.jpg"
},
{
    item: "زجاجة برفان ديور",
    price: 11000,
    boughtItems:0,
    img: "../images/25.jpg"
},
{
    item: "بلايستيشن فايف",
    price: 16900,
    boughtItems:0,
    img: "../images/26.jpg"
},
{
    item: "موتوسيكل حلاوة صيني",
    price: 18000,
    boughtItems:0,
    img: "../images/27.jpg"
},
{
    item: "عجلة فونكس",
    price: 18500,
    boughtItems:0,
    img: "../images/28.jpg"
},
{
    item: "فدان أرض زراعية",
    price: 19200,
    boughtItems:0,
    img: "../images/29.jpg"
},
{
    item: "سامسونج إس ٢٢ ألترا ١ تيرا",
    price: 24000,
    boughtItems:0,
    img: "../images/30.jpg"
},
{
    item: "بدلة فاخرة",
    price: 24200,
    boughtItems:0,
    img: "../images/31.jpg"
},
{
    item: "عملية تجميل",
    price: 25000,
    boughtItems:0,
    img: "../images/32.jpg"
},
{
    item: "فستان فاخر",
    price: 29700,
    boughtItems:0,
    img: "../images/33.jpg"
},
{
    item: "رحلة عمرة",
    price: 35000,
    boughtItems:0,
    img: "../images/34.jpg"
},
{
    item: "آيفون ١٤ برو ماكس",
    price: 41800,
    boughtItems:0,
    img: "../images/35.jpg"
},
{
    item: "شاشة ٦٥ بوصة",
    price: 48000,
    boughtItems:0,
    img: "../images/36.jpg"
},
{
    item: "ماك بوك برو ١٤ بوصة إم وان",
    price: 52500,
    boughtItems:0,
    img: "../images/37.jpg"
},
{
    item: "سبيكة ذهب",
    price: 52800,
    boughtItems:0,
    img: "../images/38.jpg"
},
{
    item: "توكتوك",
    price: 60000,
    boughtItems:0,
    img: "../images/39.jpg"
},
{
    item: "رحلة حج",
    price: 92000,
    boughtItems:0,
    img: "../images/40.jpg"
},
{
    item: "كمبيوتر ألعاب متطور",
    price: 120000,
    boughtItems:0,
    img: "../images/41.jpg"
},
{
    item: "ساعة رولكس",
    price: 130000,
    boughtItems:0,
    img: "../images/42.jpg"
},
{
    item: "موتوسيكل هوندا",
    price:180000 ,
    boughtItems:0,
    img: "../images/43.jpg"
},
{
    item: "نيسان صني",
    price: 297000,
    boughtItems:0,
    img: "../images/44.jpg"
},
{
    item: "خاتم ألماظ",
    price: 300000,
    boughtItems:0,
    img: "../images/45.jpg"
},
{
    item: "جيت سكي ياماها",
    price: 370000,
    boughtItems:0,
    img: "../images/46.jpg"
},

{
    item: "تويوتا كرولا",
    price: 420000,
    boughtItems:0,
    img: "../images/47.jpg"
},

{
    item: "تيسلا إكس",
    price: 1170000,
    boughtItems:0,
    img: "../images/48.jpg"
},

{
    item: "بي إم دبليو إكس ٦",
    price: 2500000,
    boughtItems:0,
    img: "../images/49.jpg"
},

{
    item: "فيلا في التجمع",
    price: 4300000,
    boughtItems:0,
    img: "../images/50.jpg"
},
{
    item: "شقة على النيل",
    price: 7500000,
    boughtItems:0,
    img: "../images/51.jpg"
},
{
    item: "فيلا في الساحل",
    price: 8000000,
    boughtItems:0,
    img: "../images/52.jpg"
},
{
    item: "إنتاج فيلم سينمائي",
    price: 20000000,
    boughtItems:0,
    img: "../images/53.jpg"
},
{
    item: "رحلة أسبوع في كل دولة",
    price: 25000000,
    boughtItems:0,
    img: "../images/54.jpg"
},
{
    item: "يخت",
    price: 150000000,
    boughtItems:0,
    img: "../images/55.jpg"
},
{
    item: "دبابة",
    price: 160000000,
    boughtItems:0,
    img: "../images/56.jpg"
},
{ 
    item: "هليكوبتر أباتشي",
    price: 620000000,
    boughtItems:0,
    img: "../images/57.jpg"
},






]
return items;
}