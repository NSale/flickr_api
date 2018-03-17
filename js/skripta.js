$(document).ready(function(){

	//Cuvamo podatke od interesa u promenljivim
	var api_key = 'api_key=325b6733bb2c01b6ee5a9d73e9eb8cf9';
	var user_id = "";
	var rest_url = "https://api.flickr.com/services/rest/?";
	var format = "format=json";
	var person;

	$("body").on("click", "#btnGalleries", getGalleries);
	$("body").on("click","#btnPublic", getPhotos);
	$("body").on("click","img", getComments);

	$("#btnEmail").click(function(){
		//flickr api zahteva JSONP prenos podataka JSON With Padding
		//Generismo url koji koristimo za poziv flickr api metode
		//api_key i find_email su obavezni parametri za poziv
		//format=json parametar koji govori flicker serveru da zelimo odgovor u JSON formatu
		//jsoncallback=? - parametar potreban zbog JSONP formata odgovora
		var method = "method=flickr.people.findByEmail";
		var find_email = "find_email=" + $("#tbInput").val(); //vrednost input polja je email
		var requestUrl = rest_url+method+"&"+api_key+"&"+find_email+"&"+format+"&jsoncallback=?";

		console.log(requestUrl);
		
		//ajax get poziv
		//requestUrl - url na koji saljemo zahtev https://api.flickr.com/services/rest/?method=flickr.people.findByUsername...
		//postaviKorisnika - callback funkcija koja vrsi obradu odgovora
		//dataType - "json" parametar koji govori o formatu odgovora, potreban zbog cross-origin zahteva
		$.get(requestUrl, postaviKorisnika,"json");
		
	});

	$("#btnUsername").click(function(){
		var method = "method=flickr.people.findByUsername";
		var username  = "username=" + $("#tbInput").val();
		var requestUrl = rest_url+method+"&"+api_key+"&"+username+"&"+format+"&jsoncallback=?";
		console.log(requestUrl);
		
		//$.get(requestUrl, postaviKorisnika,"json");
		$.ajax({
			method: "get",
			url: requestUrl,
			dataType: "jsonp",
			success: postaviKorisnika
		});
	});

	$("#btnUrl").click(function(){
		var method = "method=flickr.urls.lookupUser";
		var url  = "url=" + $("#tbInput").val();
		var requestUrl = rest_url+method+"&"+api_key+"&"+url+"&"+format+"&jsoncallback=?";
		console.log(requestUrl);
		
		$.get(requestUrl, postaviKorisnika,"json");
	});

	function postaviKorisnika(data, status){

		console.log(data);
		//Dobili smo odgovor od servera, dodajemo podatke u DOM
		var $container = $("#data");
		$container.empty(); //Ispraznimo prethodni sadrzaj, stavljamo podatke o novom korisnik
		if(status == "success" && data.stat == "ok"){ //Proveravamo odgovor od servera, da li je zahtev uspesno obradjen
			user_id = "92361032@N05"; //Izvlacimo podatke o ID korisnika, kojie cemo koristi za druge zahteve

			
			var div = $("<div></div>"); //Dinamicki pravimo elemente i dodajemo u DOM
			var h1 = $("<h1></h1>");
			h1.text("Pronasao korisnika: "  + data.user.username._content);
			h1.attr("id","korisnik");
			div.append(h1);
			var $buttonPublic = $("<button></button>");
			$buttonPublic.attr({
				type : "button",
			    id : "btnPublic"
			});
			$buttonPublic.text("Preuzmi sve javne slike za korisnika");
			var $btnGalleries = $("<button></button>");
			$btnGalleries.attr({
				type : "button",
			    id : "btnGalleries"
			});
			$btnGalleries.text("Preuzimi galerije za korisnika");
			div.append($buttonPublic);
			div.append($btnGalleries);
			$container.append(div);
		}else{
			var div = $("<div></div>"); //Ako nije zahtev prosao uspesno, obavestavamo korisnika o tome
			var h1 = $("<h1>Nisam pronasao: "+ $("#tbInput").val() +"</h1>");
			div.append(h1);
			$container.append(div);
		}

		var method = "method=flickr.people.getInfo"; //Preuzimamo dodatne podake o korisniku sa getInfo metodom pomoc user_id parametra

		$.get(rest_url+method+"&"+api_key+"&user_id="+user_id+"&"+format+"&jsoncallback=?",function(data,status){
			person = data.person;
			$("#korisnik").text("Pronasao korisnika: "  + data.person.realname._content);
		},"json");
	};

	function getPhotos(){
		var method= "method=flickr.people.getPublicPhotos";
		var user = "user_id="+user_id;
		var format = "format=json";
		var extras = "extras=url_o,url_s"; //Dodatni podaci url_o - link ka slici sa orignlnom velicinom, url_s link ka maloj slici
		firstPhotoId = null;

		//Moguce je koristiti i druge AJAX metode za get zahteve
		$.getJSON(rest_url+"&"+method+"&"+api_key+"&"+user+"&"+format+"&"+extras+"&jsoncallback=?")
			.success(function(data,status){
				var photos = data.photos.photo; //Preuzimamo fotografije iz odgovora
				var $container = $("#data"); 
				var $divWrapper = $("<div></div>");
				$container.append($divWrapper);
				$divWrapper.addClass("wrapper");
				$.each(photos, function(index, value){ //Za svaku fotografiju pravimo novi div u koji smestamo podake
					var $div =  $("<div></div>");
					$div.css({
						float: "left",
						margin: "5px"
					});
					
					var $img = $("<img></img>");
					$img.attr({
						src: value["url_s"], //Postavljamo url male slike u src tag slike
						alt: value["title"], //Kao alternativni prikaz img taga koristimo naslov slike
						width: 150,
						height: 100,
						id: value["id"]//Dodajemo id slike kako bi mogli da ga iskoristimo za pronalazenje komentara
					});
					
					$div.append($img);
					$divWrapper.append($div);
					
				});
				var $divComments = $("<div></div>");
				$divComments.attr("id", "comments");
				$divWrapper.append($divComments);
			}).error(function(data,status){
				alert("Error: " + error);
			});

	};

	function getGalleries(){
		var method= "method=flickr.galleries.getList";
		var user = "user_id="+user_id;
		var format = "format=json";		

		$.getJSON(rest_url+"&"+method+"&"+api_key+"&"+user+"&"+format+"&"+"&jsoncallback=?")
			.success(function(data,status){
					var gallerys = data.galleries.gallery;
					var $container = $("#data");
					var $ul = $("<ul></ul>");
					$container.append($ul);
					$.each(gallerys, function(index, value){
						var $li = $("<li></li>");
						var $a = $("<a></a>");
						$a.attr("href", value.url);
						$a.text(value.title._content);
						$li.append($a);
						$ul.append($li);
					});

			}).error(function(data,status){
				alert("Error: " + error);
			});
	};

	function getComments(){
		//Izmenjeni $(this) sada pretstavlja img tag na koji smo kliknuli
		//img tag sadrzi atribut id koji predstavlja id nase fotografije
		var method= "method=flickr.photos.comments.getList";
		var photo = "photo_id="+$(this).attr("id");
		var format = "format=json";		

		$.getJSON(rest_url+"&"+method+"&"+api_key+"&"+photo+"&"+format+"&"+"&jsoncallback=?")
			.success(function(data,status){
					var comments = data.comments.comment;
					var $divComments = $("#comments");
					$divComments.empty(); //Izbrisemo komentare koji semo prethodno ucitali
					$.each(comments, function(index, value){ //Ucitamo nove komentare
						var $div = $("<div></div>");
						var $h5 = $("<h4>"+ value.realname + "</h4>")
						var comment = value._content;
						$div.append($h5,comment);
						$divComments.append($div);
					});

			}).error(function(data,status){
				alert("Error: " + error);
			});
	};
});