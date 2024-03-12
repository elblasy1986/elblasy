let data = getData();
const wealth = 186925976000 جنيه;

document.querySelector('.money-bar').textContent = getWealth().toLocaleString("en-US");
const grid = document.querySelector('.items');
if (window.navigator && window.navigator.canShare) {
    const shareBtn = document.querySelector('.share-btn');
    shareBtn.style.visibility = "visible"
    shareBtn.addEventListener('click', function getReceiptImage(e) {
        e.preventDefault();
        html2canvas(document.querySelector('.receipt-wrapper'), {
            onclone: function (doc) {
                const receiptToShare = doc.querySelector('.receipt-wrapper');
                receiptToShare.querySelector('.share-btn').remove();
                receiptToShare.querySelector('.receipt-title').textContent = "ساويرس";
                const receiptImage = document.createElement('img');
                // receiptImage.crossOrigin = "Anonymous";

                receiptImage.src = "../images/logo.jpeg";
                //set receiptImage width
                receiptImage.style.width = '50%%';
                receiptImage.style.height = '90px'
                receiptToShare.insertBefore(receiptImage, receiptToShare.firstChild);

            }
            , allowTaint: false, useCORS: true
        }).then(canvas => {
            let receiptImage = canvas.toDataURL('image/png', 0.4);
            share(receiptImage);
        })
    });
}

getData().forEach(function (item) {
    const gridItem = document.createElement('div');
    gridItem.classList.add('item-wrapper');
    gridItem.innerHTML =
        `<img class="item-img" src="${item.img}">
    <div class="item-name">${item.item}</div>
    <div class="item-cost">${(item.price).toLocaleString("en-us")} جنيه</div>
    <div class="item-controls">
        <button class="item-buy">شراء</button>
        <input type="number" class="item-input" value ='0' min='0'>
        <button disabled="disabled" class="item-sell">بيع</button>                    
        `
    grid.appendChild(gridItem);

})
//click buy or sell button
grid.addEventListener('click', function (event) {
    event.preventDefault();
    const itemConterller = event.target.parentElement;
    const itemName = itemConterller.parentElement.querySelector('.item-name').innerText;
    let item = getItemByName(itemName)[0];
    if (event.target.classList.contains('item-buy') && getWealth() - Number(item.price) >= 0) {
        updateItem(++itemConterller.querySelector('.item-input').value, item);
        toggleSellBtn(itemConterller, item.boughtItems);
    }
    else if (event.target.classList.contains('sell-btn')) {
        updateItem(--itemConterller.querySelector('.item-input').value, item);
        toggleSellBtn(itemConterller, item.boughtItems);
    }
})

//change number of items 
grid.addEventListener('input', function (event) {
    const itemConterller = event.target.parentElement;
    const inputValue = itemConterller.querySelector('.item-input');
    inputChange(itemConterller, inputValue);
})

function inputChange(itemConterller, inputValue) {
    let itemName = itemConterller.parentElement.querySelector('.item-name').innerText;
    let newValue = Number(inputValue.value)
    let item = getItemByName(itemName)[0];
    if (newValue > item.boughtItems) {
        buyMore(getWealth(), item.boughtItems, newValue, item.price, item, inputValue);
    }
    else if (newValue < item.boughtItems) {
        updateItem(newValue, item);
    }
    toggleSellBtn(itemConterller, item.boughtItems);
}


function updateItem(newItems, item) {
    item.boughtItems = newItems;
    data.map(x => {
        if (x.price === item.price) {
            return item;
        }
    });
    getWealth();
}

function toggleSellBtn(itemConterller, newValue) {
    let sellBtn;
    if (itemConterller.querySelector('.sell-btn')) {
        sellBtn = itemConterller.querySelector('.sell-btn');
    }
    else {
        sellBtn = itemConterller.querySelector('.item-sell');
    }

    if (newValue > 0) {
        sellBtn.disabled = false;
        sellBtn.classList.add('sell-btn');
        sellBtn.classList.remove('item-sell');
    }
    else {
        sellBtn.disabled = false;
        sellBtn.classList.add('item-sell');
        sellBtn.classList.remove('sell-btn');
    }
}

function getItemByName(itemName) {
    return data.filter(function (item) {
        if (item.item === itemName) {
            return item;
        }
    });
}

function buyMore(totalMoney, oldValue, newValue, cost, item, inputValue) {
    let difference = newValue - oldValue;
    if (totalMoney >= difference * cost) {
        totalMoney -= difference * cost;
    }
    else {
        //get Maximum buy
        let addedItems = Math.floor(totalMoney / cost);
        newValue = oldValue + addedItems;
        totalMoney -= addedItems * cost;
        inputValue.value = newValue;
    }
    document.querySelector('.money-bar').textContent = totalMoney.toLocaleString("en-us");
    oldValue = newValue;
    updateItem(newValue, item);

}
function getWealth() {
    let expneses = 0;
    data.forEach(element => {
        expneses += element.price * element.boughtItems;
    });
    document.querySelector('.money-bar').textContent = (wealth - expneses).toLocaleString("en-us");
    setReceipt(expneses);
    return wealth - expneses;
}
function setReceipt(expneses) {
    let receiptData = data.filter(item => { return item.boughtItems > 0 });
    const receiptList = document.querySelector('.receipt-list');
    receiptList.innerHTML = "";
    receiptData.forEach(item => {
        let receiptItems = `<div class="receipt-items">
        <div class="receipt-item-cost">${(item.boughtItems * item.price).commarize()}</div> 
        <div class="receipt-item-amount">${item.boughtItems.commarize()}x</div>
        <div class="receipt-item-name">${item.item}</div>
    </div> `
        receiptList.innerHTML += receiptItems;
    })
    const receiptTotal = `<div class="receipt-total">
        <div class="receipt-total-money">${expneses.toLocaleString("en-us")}</div> 
        <span>المجموع</span>                                    
        </div> `
    receiptList.insertAdjacentHTML("beforeend", receiptTotal);
}
function commarize() {
    // Alter numbers larger than 1k
    if (this >= 1e3) {
        var units = ["k", "M", "B", "T"];

        // Divide to get SI Unit engineering style numbers (1e3,1e6,1e9, etc)
        let unit = Math.floor(((this).toFixed(0).length - 1) / 3) * 3;
        // Calculate the remainder
        var num = (this / ('1e' + unit)).toFixed(2);
        var unitname = units[Math.floor(unit / 3) - 1];

        // output number remainder + unitname
        return num + unitname;
    }

    // return formatted original number
    return this.toLocaleString();
}
async function share(receiptImage) {
    const blob = await (await fetch(receiptImage)).blob();
    const file = new File([blob], "sawiris.png", { type: blob.type });
    try {
        await navigator.share({
            title: "انا صرفت فلوس ساويرس",
            files: [file],
            text: "صرفت فلوس ساويرس",
            url: location.href
        });
    } catch (err) {
        console.error("Share failed:", err.message);
    }
};


const shareArea = document.querySelector('.share-area');
shareArea.addEventListener('click', (event) => {
    let url = "";
    switch (event.target.classList[0]) {
        case "facebook-btn": url = 'https://www.facebook.com/sharer/sharer.php?u='
            break;
        case "twitter-btn": url = 'https://twitter.com/intent/tweet?text='
            break;
        case "whatsapp-btn": url = 'https://api.whatsapp.com/send?text='
            break;
        case "telegram-btn": url = 'https://telegram.me/share/url?url='
            break;       
        default: url = "https://www.facebook.com/sharer/sharer.php?u=";

    }
    url += encodeURIComponent('https://elblasy.com/sawiris/');
    window.open(url, '_blank');
})
// Add method to prototype. this allows you to use this function on numbers and strings directly
Number.prototype.commarize = commarize
String.prototype.commarize = commarize
