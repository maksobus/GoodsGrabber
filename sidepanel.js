var alinks = [];


document.addEventListener('DOMContentLoaded', function() {
	if(localStorage.getItem('maxprice')) {
		document.getElementById("maxprice").value = localStorage.getItem('maxprice');
		document.getElementById("quantity").value = localStorage.getItem('quantity');
		document.getElementById("delay").value = localStorage.getItem('delay');
		document.getElementById("chat_id").value = localStorage.getItem('chat_id');
		}
	
}, false);



chrome.runtime.onMessage
    .addListener((message,sender,sendResponse) => {
		if(typeof message=="string"){
			const grabBtn = document.getElementById("grabBtn");
			const newpage = document.getElementById("newpage");
			grabBtn.disabled = false;
			grabBtn.textContent='GRAB NOW';
			if(alinks.length>0){newpage.style = "display: block;";}
		}
		if(typeof message=="object")
			{
				
				alinks.push(message);
		
			}
		sendResponse("OK");
    });


const newpage = document.getElementById("newpage");
newpage.addEventListener("click",() => {
	newpage.style = "display: none;";	
	openGoodsPage(alinks);
})
	
	
	


const grabBtn = document.getElementById("grabBtn");
grabBtn.addEventListener("click",() => {
	document.getElementById('frame').contentWindow.location.reload();
	document.getElementById('newpage').style = "display: none;";

	var motloh = [];
	
	localStorage.setItem('maxprice', document.getElementById('maxprice').value);
    localStorage.setItem('quantity', document.getElementById('quantity').value);
    localStorage.setItem('delay', document.getElementById('delay').value);
	localStorage.setItem('chat_id', document.getElementById('chat_id').value);
	
	var tab;
	alinks = [];
	const infor = document.querySelector("#info_red");
	infor.innerHTML="";
    // Get active browser tab
    chrome.tabs.query({active: true}, function(tabs) {
		
		
		for(let i = 0; i < tabs.length; i++)
		{
			const url = new URL(tabs[i].url);
			if(url.origin == 'https://www.aliexpress.com')
						{tab = tabs[i];
						break;}	
		}
		

		//console.log(tabs);
        //var tab = tabs[0];
		
		
		
		
		
		
		
		
		if (tab) {
            chrome.scripting.executeScript(
                {
                    target:{tabId: tab.id},
                    func:checkContainer
                },
					function (frames) {
						if (!frames || !frames.length) { 
							console.log("Error response frames");
							return;
						}
						else
						{
							if(frames[0].result>0){
								grabBtn.disabled = true;
								grabBtn.textContent='Завантажуємо дані…';
								execScript(tab);
							}
							else
							{
								infor.innerHTML="Ця сторінка не мае контейнерів з класом productContainer ";
							}		
						}
					}
            )
		} 
		else 
		{
			console.log("There are no active tabs")
		}
 
    })
})

function checkContainer() {
    const container = document.querySelectorAll('a[class="productContainer"]');
    return container.length;    
}

/*
const grabBtn = document.getElementById("grabBtn");
grabBtn.addEventListener("click",() => {
	document.getElementById('frame').contentWindow.location.reload();
    // Get active browser tab
    chrome.tabs.query({active: true}, function(tabs) {
        var tab = tabs[0];

        if (tab) {
			if (tab.url.indexOf("superdeal")>0 || tab.url.indexOf("choice")> 0 || tab.url.indexOf("Sale_pc_entrance")> 0)
			{
			grabBtn.disabled = true;
			grabBtn.textContent='Завантажуємо дані…';
            execScript(tab);
			}
			else
			{
				const infor = document.querySelector("#info_red");
				infor.innerHTML="Це сторінка не Super Deals або Choice!";
			}
			
        } 
    })
})
*/


async function execScript(tab) {
	var maxprice =  localStorage.getItem('maxprice');
	var quantity =  localStorage.getItem('quantity');
	var delay =  localStorage.getItem('delay')*1000;
	var motloh = [];
	
	
	if(localStorage.getItem('motloh')) {
		motloh = localStorage.getItem('motloh').split(',');
		}
	
	
    await chrome.scripting.executeScript(
        {
            target:{tabId: tab.id, allFrames: true},
            func:grabGoods,
			args : [ maxprice, quantity, delay, motloh],
        },
        		
		async emptyPromise => {

        // Create a promise that resolves when chrome.runtime.onMessage fires
        const message = new Promise(resolve => {
            const listener = request => {
                chrome.runtime.onMessage.removeListener(listener);
                resolve(request);
           };
            chrome.runtime.onMessage.addListener(listener);
        });

        const result = await message;
        //onResult(result); 
	});
	
}





async function grabGoods(maxprice, quantity, delay, motloh) {
	console.log(motloh.length);
	var mlinks = new Map();
	var sortalinks = [];
	maxprice = maxprice*100;
	maincontainer = document; //.querySelector('div[mod-name="gmod-h5-rax-sd-item-list-v2"]')
	if(maincontainer)
	{
		div_iterator = document.createElement('div');
		div_iterator.id = "iterator";
		div_iterator.style = "display:flex; flex-wrap: wrap; flex-direction: row; justify-content: space-between; align-items: center; width:100%; position: fixed; padding:10px; background: linear-gradient( #de1d30, #f5828d); z-index:1000; box-shadow: 0px 5px 5px #00222266; font-weight: bold;	color: black; color: #ffffff; text-shadow: 3px 3px 3px #000000ff; font-size: 16px;";
		document.body.prepend(div_iterator);

/*
		links = document.querySelectorAll('a[class="productContainer"]');
				links.forEach(function(data) 
				{
					price = data.children[1].children[0].children[0].textContent.replace(/[^\d]/g, '');
					if (price<=maxprice)
					{mlinks.set(data.id,[data.outerHTML,price]);}
				})
*/
		var curent = 0;
		var countmotloh = 0;
		setTimeout(loadSomething, delay);
		
		function loadSomething() {
			 
			window.scrollTo(0, document.body.scrollHeight);
                curent++;
				div_iterator.innerHTML="Ітерація прокрутки сторінки: " + curent + "  <br>Товарів знайдено: " + mlinks.size + "&nbsp;&nbsp;&nbsp;&nbsp;Пропущено мотлоху: " + countmotloh;
					links = document.querySelectorAll('a[class="productContainer"]');
					links.forEach(function(data) 
					{
						price = data.children[1].children[0].children[0].textContent.replace(/[^\d]/g, '');
							if (price<=maxprice )
							{
								if(!mlinks.has(data.id)){
									if(!motloh.includes(data.id)){
										mlinks.set(data.id,[data.outerHTML,price]);
										chrome.runtime.sendMessage([data.outerHTML,price,data.id], function (response) {});
									} else {countmotloh++;}
								}
							}
					})
				
				
			if (quantity > curent) 
			{
				setTimeout(loadSomething, delay);
			}
			else
			{
				div_iterator.remove();
				chrome.runtime.sendMessage('Job end', function (response) {});

			}
		
		}
		
				
	}

}




function openGoodsPage(goods) {
    chrome.tabs.create(
        {"url": "page.html",active:false},(tab) => {
            setTimeout(()=>{
                chrome.tabs.sendMessage(tab.id,goods,(response) => {
                    chrome.tabs.update(tab.id,{active: true});
                });
            },500);
        }
    );
}


