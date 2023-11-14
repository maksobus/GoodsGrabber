
chrome.runtime.onMessage
    .addListener((message,sender,sendResponse) => {
        addGoodsToContainer(message)
        sendResponse("OK");
    });


function addGoodsToContainer(goods) {
    if (!goods || !goods.length) {
        return;
    }
	goods.sort((a, b) => Number(a[1]) > Number(b[1]) ? 1 : -1);
    const container = document.querySelector(".container");
    goods.forEach(url => addGoodsNode(container, url))
	const info = document.querySelector("#info");
	info.innerHTML="Знайдено товарів: " + goods.length;
}


function addGoodsNode(container, url) {
	price = url[1]/100;
	div = document.createElement('div');
	imgtg = document.createElement('img');
	imgdel = document.createElement('img');
	imgadd = document.createElement('img');
	div.innerHTML=url[0].replaceAll('src="//','src="https://').replace('href="//','href=https://');
	div.className = "card";
	imgtg.src="images/tg48.png";
	imgadd.src="images/add.png";
	imgdel.src="images/delete.png";
	imgtg.title="Send to bot";
	imgadd.title="Check price";
	imgdel.title="Delete on search";
	imgtg.className = "tgbot";
	imgadd.className = "badd";
	imgdel.className = "bdelete";
	imgtg.setAttribute('price', price);
	imgadd.setAttribute('did',url[2]);
	imgdel.setAttribute('did',url[2]);
	imgtg.addEventListener("click", function() {sendBot(this);});
	imgdel.addEventListener("click", function() {motloh(this);});
	div.appendChild(imgtg);
	div.appendChild(imgadd);
	div.appendChild(imgdel);
	container.appendChild(div);
	
}


function motloh(o) {
	parent = o.parentElement;
	if(localStorage.getItem('motloh')) {
		motloh = localStorage.getItem('motloh').split(',');
		}
	else
	{var motloh = [];}
	motloh.push(o.getAttribute('did'));
	localStorage.setItem('motloh', motloh.join());
	parent.remove();
}
