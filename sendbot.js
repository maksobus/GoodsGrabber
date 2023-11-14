function sendBot(o) {
    const chat_id = localStorage.getItem('chat_id');
    if (chat_id==='')
            {
            alert("Потрібно вказати chat_id групи або користувача!");
            return;
            }
	
	
	const  googlescript = "https://script.google.com/macros/s/AKfycbzTPyoR-4OA1TWmv48-vARFHkL3k2wiBIqnf_vpRkeEVuOdHzscFP4al0T0bgDgunOp/exec";
	
	
	/*
	 * linkarr =Array(
	 * [0]  'Блок посилання',
	 * [1]  'Частина посилання',
	 * [2]  'Іконка',
	 * [3]  'Ціна за посиланням',
	 * [4]  'Ліміт в одні руки',
	 * [5]  'Знижка монетками, %',
	 * [6]  'Доставка',
	 * [7]  'Вартість доставки',
	 * [8]  'Кількість товару',
	 * [9]  'Курс',
	 * [10] 'Мінімальна ціна',
	 * [11] 'Максимальна ціна',
	 * [12] 'Мінімальна ціна по акції',
	 * [13] 'Максимальна ціна по акції',
	 * [14] 'Ліміт, кнопка не активна',
	 * [15] 'Іконка якщо Ліміт, кнопка не активна',
	 * [16] 'Розрахунок ціни з монетками',
	 * )
	*/
	
	let warning = '⚠️';
	let linkarr = [['Монетки','?sourceType=620','🟡'],
				   ['Супер знижки','?sourceType=562','💰'],
				   ['Обмежені пропозиції','?sourceType=561','💸'],
				   //['Інші знижки','?sourceType=504','💰'],
				  ];
	const req = new XMLHttpRequest();	
	let parent = o.parentElement;
	let url = parent.children[0].href;
	let mainurl = /^(.*)\?/gm.exec(url);
	let photo = parent.children[0].children[0].children[0].src;
	photo = photo.substring(0, photo.indexOf("_"));

	o.src="images/tgy48.png";
	let globalimg, product;
	let minPrice, maxPrice;
	linkarr.forEach(function(data){
		req.open("GET", mainurl[1]+data[1], false);
		req.send();
		let strreg = /data: {([\s\S]*?)};/gm.exec(req.response);
		let	jstr = '{'+strreg[1];
		let jobj = JSON.parse(jstr);
console.log(jobj);

		globalimg = jobj['imageComponent']['imagePathList'];
		product = jobj['productInfoComponent']['subject'];
		let foundprice = jobj['priceComponent']['discountPrice']['actCurrencyFormatPrice']; 
			if (foundprice === undefined) {foundprice = jobj['priceComponent']['origPrice']['multiCurrencyFormatPrice'];}

		data[3] = foundprice;
		
		
		
		let purchaseLimit =	jobj['promotionComponent']['purchaseLimitNumMax'];  //  в одни руки
			data[4] = (purchaseLimit === 0) ? '∞' : purchaseLimit;
		
		let promotionactivity =	jobj['promotionComponent']['activity'];//вроде активность
		let shippingFeeText =	jobj['webGeneralFreightCalculateComponent']['shippingFeeText']; //доставка
		let shipping =	jobj.webGeneralFreightCalculateComponent.originalLayoutResultList[0].bizData.formattedPreAmount
		let coinDiscount = 	jobj['priceComponent']['coinDiscountText']; //монетки скидка???
		let currencyRate = jobj['currencyComponent']['currencyRate']; //курс
		let AvailQuantity = jobj['inventoryComponent']['totalAvailQuantity']; //колвл
		let	actMaxPrice = 	jobj['priceComponent']['discountPrice']['actMaxPrice']
		let	actMinPrice = 	jobj['priceComponent']['discountPrice']['actMinPrice']
		let limitTips = jobj['promotionComponent']['limitTips']
		data[5] = (coinDiscount === undefined) ? '' : coinDiscount.replace(/\D/g, '');
		if(	data[5]!== '')
			{
				data[16] = ` (- ${data[5]}% монетками)`;
			}
		
		
		
		
		
		data[14] = limitTips;
		data[15] = (limitTips === undefined) ? '' : warning;
		maxPrice = jobj['priceComponent']['origPrice']['maxPrice']
		minPrice = jobj['priceComponent']['origPrice']['minPrice']

		
		console.log('purchaseLimit ' + purchaseLimit);
		console.log('promotionactivity ' + promotionactivity);
		console.log('shippingFeeText ' + shippingFeeText);
		console.log('shipping ' + shipping);
		console.log('coinDiscount ' + coinDiscount);
		console.log('currencyRate ' + currencyRate);
		console.log('AvailQuantity ' + AvailQuantity);
		console.log('maxPrice ' + maxPrice);
		console.log('minPrice ' + minPrice);
		console.log('actMaxPrice ' + actMaxPrice);
		console.log('actMinPrice ' + actMinPrice);
		console.log('actMaxPriceUAH ' + actMaxPrice * currencyRate);
		console.log('actMinPriceUAH ' + actMinPrice * currencyRate);
		console.log('limitTips ' + limitTips);
		
		
		if(coinDiscount){console.log(coinDiscount.replace(/\D/g, ''));}
		
		data[8] = (AvailQuantity>1000) ? '+1K': AvailQuantity;
		data[6] = shippingFeeText;
	
			});
	//≈
//Create message for TG
	
        let urlf = '<a href="'+mainurl[1]+'">'+product+'</a>';
		let msgblock = '';
		linkarr.forEach(function(data){
		let	coinprice = (data[16] === undefined) ? '' : data[16]
			msgblock += `\n\n${data[2]} ${data[15]} <a href="${mainurl[1] + data[1]}">${data[0]}</a> 
						<b><i>Ціна</i></b>: ${data[3]} 	${coinprice}
						<b><i>Ліміт</i></b>: ${data[4]}	| <b><i>Кількість</i></b>: ${data[8]}
						<b><i>Доставка</i></b>: ${data[6]}`;
				});
		
		
		
	


		
	let media = [];
		media[0] = 
			{
			  "type": "photo",
			  "media": String(photo),
			  "caption": urlf + '\n' + msgblock,
			  "parse_mode": "HTML",
			  "protect_content":true,
			};
	let countimg;
	if (minPrice === maxPrice) {countimg = 5;} else {countimg = 6;}
	for (let i=1;i<globalimg.length && i < countimg;i++)
			{media.push({"type": "photo","media": String(globalimg[i]),});}
			

		
		
        let datapost = {
                method: "sendMediaGroup",
                chat_id: String(chat_id),
				"media": media,
                     };
//console.log(datapost);

	
//Send message
	
		fetch(googlescript, {
		  method: 'POST',
		  headers: {
				"Content-Type": "application/json",
			  },
		  body: JSON.stringify(datapost),
		})
			.then(function(response) {
				if(response.ok) 
					{
						return response.json();
					}
					else
					{
						o.src="images/tgb48.png";
						console.log(response.text());
						o.title = "Check console JS";
					}	
			})
				.then(function(data) {

					if(data['Status']==="Ok")
						{o.src="images/tgr48.png";
						 console.log(data['Status']);
						}
						else
						{	o.src="images/tgb48.png";
							console.log(data['Status']);
							console.log(data['msg']);
							o.title = "Check console JS";
						}
			  
				});
	}

/*
		let originalPrice, discount , saved , remaining;

		originalPrice = 100;
		discount = 25;

		if(originalPrice !== null){

			//calculations
			saved =	discount * originalPrice / 100;
			remaining =	originalPrice - saved;

		}
	
*/
