var domini_com = 'https://comunitat.aim-solo.com/';
var domini_intra = 'https://intra.aim-solo.com/schools';
var user_name;
var user_id;
var entitat_id;
var project_id;
var project_name;
var student_id;
var student_name;
var student_sex;
var comps_masc;
var comps_fem;
var comps_millora;
var comp_name;
var comp_id;
var interes_id;
var habilitat_id;
var nstudents;
var nprojects;
var comps_groups = null;// = [{'id':1,'name':"Societat"}, {'id':2,'name':"Professional"}, {'id':3,'name':"Excel·lència"}];
var current_groups = [];
var i18n;
var emocions;
var ambits;
var lang;
var default_lang;
var interes_comps = {};
var recents_comps = [];
var total_comp_clicks = 0;
var intel_timeout; // Guardem l'id del timeout que treu el missatge d'èxit al modificar una intel
var app_first_open = true;
var dades_comps; // Es guarda l'array que indica per un alumnes si té la competència i si la té compartida

$(document).on('ready',function(){
	default_lang = 'spa';
	$('#logout-popup').popup();
	$('#success-popup').popup();
	$('#info-popup').popup();
	$("#footer").hide();
	$("#footer-emocions").hide();
	$("#comps-footer").hide();
	$("#comp_millora-footer").hide();
	$("#footer-interessos").hide();
	$("#footer-habilitats").hide();
	$("#intels-footer").hide();
	{ // Gestionem traduccions
		$.getJSON("i18n/i18n.json", function(json) {
			i18n = json;
			{ // Recorrem translatables
				$("[data-text]").each(function(){
					text = __($(this).data("text"));
					$(this).text(text);
				});
			}
			{ // Recorrem placeholders
				$("[placeholder]").each(function(){
					$(this).attr('placeholder',__($(this).attr('placeholder')));
				});
			}
			{ // Recorrem 2ns placeholders
				$("[data-filter-placeholder]").each(function(){
					$(this).attr('data-filter-placeholder',__($(this).attr('data-filter-placeholder')))
				});
			}
			{ // Recorrem nivells slides
				$("[data-levels]").each(function(){
					$(this).attr('data-levels',__($(this).attr('data-levels')))
				});
			}
			
			// Els events del loading han d'estar al callback del getJSON pq contenen strings
			$( document ).ajaxStart(function() {
				$.mobile.loading( "show", {
					text: __("UnMoment"),
					textVisible: true,
					theme: 'a',
					textonly: false
				});
			});
			$( document ).ajaxStop(function() {
				$.mobile.loading( "hide" );
			});
		});
	}
	if(app_first_open) {
		$.mobile.changePage("#splash");
		app_first_open  = false;
	}
});

{ // Splash screen
	$( "#splash" ).on( "pageshow", function( e ) {
		addToHomescreen();
		{ // Carreguem variables de la memòria local
			user_id = localStorage.getItem('user_id');
			user_name = localStorage.getItem('user_name');
			entitat_id = localStorage.getItem('entitat_id');
			project_id = localStorage.getItem('project_id');
			project_name = localStorage.getItem('project_name');
			comps_masc = JSON.parse(localStorage.getItem('comps_masc'));
			comps_fem = JSON.parse(localStorage.getItem('comps_fem'));
			comps_millora = JSON.parse(localStorage.getItem('comps_millora'));
			comps_groups = JSON.parse(localStorage.getItem('comps_groups'));
			emocions = JSON.parse(localStorage.getItem('emocions'));
			ambits = JSON.parse(localStorage.getItem('ambits'));
			lang = localStorage.getItem('lang');
		}
		
		
		setTimeout(function() {
			if ((user_id != null) && (user_name != null) && (lang != null)) {
				$.mobile.changePage("#projects-page", "fade");
			}
			else {
				$.mobile.changePage("#login-page", "fade");
			}
		}, 2000);
	});
}
{ // Login page
	$('#login-form').submit(function(e) {
		e.preventDefault();
		e.stopPropagation();
		var username = $('#username').val();
		var pwd = $('#pwd').val();
		url = domini_intra + "/assets/php/ajax/APPedupro_login.php?u=" + username + "&p=" + pwd;
		console.log(url);
		$.ajax({
			url: url,
			success: function(data) {
				// Arriba la resposta
				data = JSON.parse(data);
				if (data.success) {
					user_name = data.name;
					user_id = data.user_id;
					entitat_id = data.entitat;
					lang = data.lang;
					localStorage.setItem('user_id', user_id);
					localStorage.setItem('user_name', user_name);
					localStorage.setItem('entitat_id', entitat_id);
					localStorage.setItem('interes_comps', interes_comps);
					localStorage.setItem('recents_comps', recents_comps);
					localStorage.setItem('total_comp_clicks', total_comp_clicks);
					localStorage.setItem('lang', lang);
					sync();
					login();
				}
				else { alert(data.msg); }
			}
		});
	});
	
}
{ // Project page
	$( "#projects-page" ).on( "pageshow", function( e ) {
		console.log('projects page');
		$(this).find('h4').text(__("Projectes de") + " " + user_name);
		{ // Demanem la llista de competències, emocions i àmbits
			if ((comps_masc == null) || (comps_fem == null) || (comps_groups == null) || (comps_millora == null) || (emocions == null)) {
				sync();
				// url = domini_intra + "/assets/php/ajax/ajax_return_competences.php?lang=" + lang + "&id=" + entitat_id;
				// console.log(url);
				// $.ajax({
					// // TODO: Enviar l'idioma en funció del particular
					// url: url,
					// success: function(data) {
						// // Arriba la resposta
						// data = JSON.parse(data);
						// console.log(data);
						// if (data.success) {
							// comps_masc = data.comps_masc;
							// comps_fem = data.comps_fem;
							// comps_groups = data.groups;
							// comps_millora = data.comps_millora;
							// emocions = data.emocions;
							// ambits = data.ambits;
							// lang = data.lang;
							// //comps_groups = data;
							// localStorage.setItem('comps_masc', JSON.stringify(comps_masc));
							// localStorage.setItem('comps_fem', JSON.stringify(comps_fem));
							// localStorage.setItem('comps_groups', JSON.stringify(comps_groups));
							// localStorage.setItem('comps_millora', JSON.stringify(comps_millora));
							// localStorage.setItem('emocions', JSON.stringify(emocions));
							// localStorage.setItem('ambits', JSON.stringify(ambits));
							// localStorage.setItem('lang', JSON.stringify(lang));
							// build_comps_filter();
						// }
					// }
				// });
			}
			else {
				build_comps_filter();
			}
		}
		url = "https://comunitat.aim-solo.com/ajax/getProjectsByTutor?tutor_id=" + user_id;
		console.log(url);
		$.ajax({
			url: url,
			success: function(data) {
				data = JSON.parse(data);
				if (data.success) {
					list = $("#project-list");
					list.empty();
					if (data.projects.length == 1) {
						// Assignar projecte tutor
						project_id = data.projects[0].id;
						project_name = data.projects[0].name;
						$.mobile.navigate("#students-page");
					}
					else {
						data.projects.forEach(function (project, index) {
							var list_item = $('<li><a data-id="' + project.id + '">' + project.name + '</a></li>');
							list.append(list_item).listview('refresh');
						});
					}
				}
				else { alert(data.msg); }
			}
		});
	});
	$(document).on('click', "#project-list li a",function () {
		project_id = $(this).data('id');
		localStorage.setItem('project_id', project_id);
		project_name = $(this).text();
		localStorage.setItem('project_name', project_name);
		$.mobile.navigate("#students-page");
	});
}
{ // Students page
	$("#students-page").on( "pageshow", function( e ) {
		$(this).find('h4').text(__("Estudiants de") + " " + project_name);
		$.ajax({
			url: domini_intra + "/assets/php/ajax/ajax_return_alumnes.php?idt=" + user_id + "&idp=" + project_id,
			success: function(data) {
				// Arriba la resposta
				data = JSON.parse(data);
				if (data.success) {
					list = $("#student-list");
					list.empty();
					nstudents = data.users.length;
					if (nstudents == 1) {
						console.log(data);
						student_id = data.users[0].id;
						student_sex = data.users[0].sex;
						student_name = data.users[0].name + ' ' + data.users[0].lastname;
						$.mobile.navigate("#selector-page");
					}
					else {
						data.users.forEach(function (user, index) {
							var list_item = $('<li><a data-id="' + user.id + '" data-sex="' + user.sex + '">' + user.lastname + ', ' + user.name + '</a></li>');
							list.append(list_item).listview('refresh');
						});
					}
				}
				else { alert(data.msg); }
			}
		});
	});
	$(document).on('click', "#student-list li a",function () {
		student_id = $(this).data('id');
		student_sex = $(this).data('sex');
		student_name = $(this).text();
		$.mobile.navigate("#selector-page");
	});
}
{ // Selector page
	$("#selector-page").on( "pageshow", function( e ) {
		$(this).find('h4').text(__("Alumne") + " " + student_name);					
	});
}
{ // Comps page
	$("#comps-page").on( "pageshow", function( e ) {
		$("#footer").hide();
		$(this).find('h4').text(__("Competències de") + " " + student_name);
		url = domini_intra + "/assets/php/ajax/get_etiquetatge_comp.php?lang=" + lang + "&id=" + entitat_id + "&i=" + student_id + "&tutor_id=" + user_id;
		console.log(url);
		$.get(url, function(data) {
			data = JSON.parse(data);
			console.log(data);
			if(data.success) {
				dades_comps = data.comps;
				build_comp_list();
				// build_interes_comps_list();
			}
		});
	});
	$(document).on('click', "#comps-list li a.info, #interes-comps-list li a.info", function () {
		info_id = $(this).data("id");
		type = 2;
		get_info(type,info_id);
	});
	$(document).on('click', "#comps-list li a.tag .work, #interes-comps-list li a.tag .work", function () {
		comp_id = $(this).parent().parent().data("id");
		state = $(this).data('state');
		update_work('competencia', !state, $(this));
	});
	$(document).on('change', "#comps-list li a.tag select, #interes-comps-list li a.tag select", function () {
		comp_id = $(this).parent().parent().data("id");
		{ // Gestionem la llista de comps destacades
			total_comp_clicks++;
			localStorage.setItem('total_comp_clicks', total_comp_clicks);
			if (comp_id in interes_comps) {
				interes_comps[comp_id]++;
			}
			else {
				interes_comps[comp_id] = 1;
			}
			localStorage.setItem('interes_comps', interes_comps);
			update_recents_comps(comp_id);
			// build_interes_comps_list();
		}
		value = $(this).val();
		update_comp(value);
		
	});
	
	{ //Coses rares comentades...
		$(document).on('change', "#filter-cg input", function () {
			console.log(dades_comps);
			id = $(this).data('id');
			if(this.checked) {
				current_groups.push(id);
			}
			else {
				current_groups.splice(current_groups.indexOf(id), 1);
			}
			build_comp_list();
		});
		
		/*$(document).on('swipeleft swiperight', "#comps-list li", function (e) {
			e.stopPropagation();
			// e.preventDefault();
			comp_id = $(this).data('id');
			comp_name = $(this).text();
			console.log(e.type);
			console.log(e);
			if(e.type == "swipeleft") {
				console.log(e.swipestart);
			}
			else if (e.type == "swiperight") {
				console.log(e.swipestop.coords[0] - e.swipestart.coords[0]);
			}
			
		});*/
	}
}
{ // Comps_millora page
	$("#comps_millora-page").on( "pageshow", function( e ) {
		$("#footer").hide();
		$(this).find('h4').text(__("Competències de millora de") + " " + student_name);
		url = domini_intra + "/assets/php/ajax/get_etiquetatge_comp_millora.php?lang=" + lang + "&id=" + entitat_id + "&i=" + student_id + "&tutor_id=" + user_id;
		console.log(url);
		$.get(url, function(data) {
			data = JSON.parse(data);
			console.log(data);
			if(data.success) {
				build_comp_millora_list(data.comps);
			}
		});
	});
	
	$(document).on('change', "#comps_millora-list li a.tag select",function () {
		comp_id = $(this).parent().parent().data("id");
		value = $(this).val();
		update_comp_millora(value);
	});
	$(document).on('click', "#comps_millora-list li a.tag .work", function () {
		comp_id = $(this).parent().parent().data("id");
		state = $(this).data('state');
		update_work('competencia_millora', !state, $(this));
	});
	$(document).on('click', ".comps_millora_info",function () {
		info_id = $(this).prev().data('id');
		type = 3;
		get_info(type,info_id);
	});
}
{ // Intels page
	$("#intels-page").on( "pageshow", function( e ) {
		$(".intel-slider[type='number']").each(function(e) {
			$(this).hide();
		});
		
		$(this).find('h4').text(__("Intel·ligències de") + " " + student_name);
		
		{ // Carreguem els sliders amb els valors correctes
			url = domini_intra + "/assets/php/ajax/schools_get_intels.php?pro=" + project_id + "&id_user=" + student_id + "&id_tutor=" + user_id;
			$.ajax({
				url: url,
				success: function(data) {
					data = JSON.parse(data);
					if (data.success) {
						$("input.intel-slider").each(function( index ) {
							$(this).val(parseInt(data[index])).slider('refresh');
							$(this).trigger('change');
						});
						$(".intel_work").each(function( index ) {
							$(this).attr('src', 'icons/share/' + data.work[index+1] + '.png');
							$(this).data('state', data.work[index+1]);
						});
					}
					else {
					}
				}
			});
		}
		
		$(document).on('click', ".intel_work", function () {
			comp_id = $(this).data("id_intel");
			state = $(this).data('state');
			update_work('intel', !state, $(this));
		});
	
		$(document).on('click', ".intels_info",function () {
			info_id = $(this).data('id_intel');
			type = 1;
			get_info(type,info_id);
		});
	});
	
	{ // Quan es canvia el nivell de l'slider canvia també l'etiqueta
		$(document).on('change', ".intel-slider",function (e) {
			e.preventDefault();
			level = parseInt($(this).val());
			levels = $(this).data('levels');
			levels = levels.split('|');
			if ($(this).data('id_intel') != 4) {
				level += 2;
			}
			else {
				if(level<4) {
					src = 'icons/intels/inc.png';
				}
				else {
					src = 'icons/intels/ic.png';
				}
				$(this).parents().eq(2).find('img').first().attr('src',src);
			}
			$(this).parent().prev().find('span').text(levels[level]);
		});
	}
	
	{ // Quan es canvia el nivell de l'slider es canvia el número a la base de dades
		$(document).on('slidestop', ".intel-slider",function (e) {
			e.preventDefault();
			level = $(this).val();
			id_intel = $(this).data('id_intel');
			console.log(typeof id_intel);
			if(id_intel > 4)id_intel--;
			levels = $(this).data('levels');
			levels = levels.split('|');
			url = domini_intra + "/assets/php/ajax/ajax_change_one_inteligence_inscrit.php?pro=" + project_id + "&id_user=" + student_id + "&nivell=" + level + "&id_tutor=" + user_id + "&id_intel=" + id_intel;
			console.log(url);
			$.ajax({
				url: url,
				success: function(data) {
					data = JSON.parse(data);
					console.log(data);
					clearTimeout(intel_timeout);
					$("#intels-footer").hide(  );
					$("#intels-footer").show( 400 );
					intel_timeout = setTimeout(function(){
						$("#intels-footer").hide( 400 );
					}, 3000);
				}
			});
		});
	}
	
	
}
{ // Emocions page
	$("#emocions-page").on( "pageshow", function( e ) {
		$(this).find('h4').text(__("Emocions de") + " " + student_name);
		url = domini_intra + "/assets/php/ajax/get_etiquetatge_emocions.php?lang=" + lang + "&id=" + entitat_id + "&i=" + student_id + "&tutor_id=" + user_id;
		console.log(url);
		$.get(url, function(data) {
			data = JSON.parse(data);
			console.log(data);
			if(data.success) {
				build_emocions_list(data.comps);
			}
		});
		
	});

	$(document).on('change', "#emocions-list li a.tag select",function () {
		comp_id = $(this).parent().parent().data("id");
		value = $(this).val();
		update_emocions(value);
	});
	$(document).on('click', "#emocions-list li a.tag .work", function () {
		comp_id = $(this).parent().parent().data("id");
		state = $(this).data('state');
		update_work('emocio', !state, $(this));
	});
	$(document).on('click', ".emocions_info",function () {
		info_id = $(this).prev().data('id');
		type = 4;
		get_info(type,info_id);
	});
}
{ // Interessos page
	$("#interes-page").on( "pageshow", function( e ) {
		$(this).find('h4').text(__("Interessos de") + " " + student_name);
		url = domini_intra + "/assets/php/ajax/get_etiquetatge_i_h.php?lang=" + lang + "&id=" + entitat_id + "&i=" + student_id + "&tutor_id=" + user_id;
		console.log(url);
		$.get(url, function(data) {
			data = JSON.parse(data);
			console.log(data);
			if(data.success) {
				build_ambits_list('i', data.interessos);
			}
		});
	});
	$(document).on('change', "#interessos-list li a.tag select",function () {
		comp_id = $(this).parent().parent().data("id");
		value = $(this).val();
		update_interessos(value);
	});
	$(document).on('click', "#interessos-list li a.info",function () {
		info_id = $(this).data("id");
		type = 5;
		get_info(type,info_id);
	});
}
{ // Habilitats page
	$("#habilitat-page").on( "pageshow", function( e ) {
		$(this).find('h4').text(__("Habilitats de") + " " + student_name);
		url = domini_intra + "/assets/php/ajax/get_etiquetatge_i_h.php?lang=" + lang + "&id=" + entitat_id + "&i=" + student_id + "&tutor_id=" + user_id;
		console.log(url);
		$.get(url, function(data) {
			data = JSON.parse(data);
			console.log(data);
			if(data.success) {
				build_ambits_list('h', data.habilitats);
			}
		});
	});
	
	$(document).on('change', "#habilitats-list li a.tag select",function () {
		comp_id = $(this).parent().parent().data("id");
		value = $(this).val();
		update_habilitats(value);
	});
	$(document).on('click', "#habilitats-list li a.info",function () {
		info_id = $(this).data("id");
		type = 5;
		get_info(type,info_id);
	});
}
function login() {
	$.mobile.navigate( "#projects-page" );
}
function logout() {
	$('#logout-popup').popup('open');
}
function goback() {
	parent.history.back();
	return false;
}
function build_comp_list() {
	comps = dades_comps;
	list = "";
	if (!student_sex) {
		comps_gender = comps_masc;
	}
	else {
		comps_gender = comps_fem;
	}
	console.log('Construïm llista competències amb dades:');
	console.log(comps);
	comps_gender.forEach(function (comp, index) {
		if(current_groups.indexOf(parseInt(comp.group)) > -1 || current_groups.length == 0) {
			list = list + '\
				<li class="ui-field-contain">\
					<a class="tag" data-id="' + comp.id + '" style="padding:0px 16px 0px 16px;">\
						<select class="comp_select" data-role="flipswitch" style="display:inline-block;" data-mini="true" data_id="' + comp.id + '">\
							<option value="0">' + __('No') + '</option>\
							<option value="1"' + (comps[comp.id]['te']?'selected':'') + '>' + __('Sí') + '</option>\
						</select>\
						<label style="display:inline-block; font-size:11px; margin:0px 0px 0px 10px;">' + comp.name + '</label>\
						<span style="float:right">\
							<img class="work" data-state="' + (comps[comp.id]['compartida'] + 0) + '" src="icons/share/' + (comps[comp.id]['compartida'] + 0) + '.png" style="height:25.44px; margin:6.25px; position:relative; top:1.5px">\
						</span>\
					</a>\
					<a class="info" data-theme="a" data-id="' + comp.id + '">Informació</a>\
				</li>';
		}
	});
	
	$("#comps-list").html(list).listview('refresh');
	$("#comps-list").trigger('create');
}
function build_interes_comps_list() {
	list = "";
	// TODO: Noms de les competències en masculí o femení
	if (!student_sex)
		competencies_list = comps_masc;
	else
		competencies_list = comps_fem;
	console.log('Construint la llista, abans d\'ordenar');
	bySortedValue(interes_comps, function(id_comp, interes) {
		var name;
		for(i = 0; i < competencies_list.length; i++) {
		comp = competencies_list[i];
			if (comp.id == id_comp) {
				name = comp.name;
				break;
			}
		}
		list = list + '\
				<li class="ui-field-contain">\
					<a class="tag" data-id="' + id_comp + '" style="padding:0px 16px 0px 16px;">\
						<select class="comp_select" data-role="flipswitch" style="display:inline-block;" data-mini="true" data_id="' + id_comp + '">\
							<option value="0">' + __('No') + '</option>\
							<option value="1"' + (dades_comps[id_comp]['te']?'selected':'') + '>' + __('Sí') + '</option>\
						</select>\
						<label style="display:inline-block; font-size:11px; margin:0px 0px 0px 10px;">' + name + '</label>\
						<span style="float:right">\
							<img class="work" data-state="' + (dades_comps[id_comp]['compartida'] + 0) + '" src="icons/share/' + (dades_comps[id_comp]['compartida'] + 0) + '.png" style="height:25.44px; margin:6.25px; position:relative; top:1.5px">\
						</span>\
					</a>\
					<a class="info" data-theme="a" data-id="' + id_comp + '">Informació</a>\
				</li>';
		// list += '\
			// <li class="ui-field-contain">\
				// <a class="tag" data-id="' + id_comp + '">' + name + '</a></li>';
	});
	$("#interes-comps-list").html(list).listview('refresh');
	$("#interes-comps-list").trigger('create');
	console.log('initialized interes comps list');
}
function build_comp_millora_list(comps) {
	list_millora = "";
	comps_millora.forEach(function (comp, index) {
		if(current_groups.indexOf(comp.id) > 0 || current_groups.length == 0) {
			list_millora = list_millora + '\
				<li class="ui-field-contain">\
					<a class="tag" data-id="' + comp.id + '" style="padding:0px 16px 0px 16px;">\
						<select data-role="flipswitch" style="display:inline-block;" data-mini="true">\
							<option value="0">' + __('No') + '</option>\
							<option value="1"' + (comps[comp.id]['te']?'selected':'') + '>' + __('Sí') + '</option>\
						</select>\
						<label style="display:inline-block; font-size:11px; margin:0px 0px 0px 10px;">' + comp.name + '</label>\
						<span style="float:right">\
							<img class="work" data-state="' + (comps[comp.id]['compartida'] + 0) + '" src="icons/share/' + (comps[comp.id]['compartida'] + 0) + '.png" style="height:25.44px; margin:6.25px; position:relative; top:1.5px">\
						</span>\
					</a>\
					<a class="comps_millora_info" data-theme="a">\
						Informació\
					</a>\
				</li>';
		}
	});
	$("#comps_millora-list").html(list_millora).listview('refresh'); // No es pot inicialitzar abans de crear-lo
	$("#comps_millora-list").trigger('create');
}
function build_emocions_list(comps) {
	list_emocions = "";
	console.log(emocions);
	emocions.forEach(function (emocio, index) {
		if(current_groups.indexOf(emocio.id) > 0 || current_groups.length == 0) {
			list_emocions += '\
				<li class="ui-field-contain">\
					<a class="tag" data-id="' + emocio.id + '" style="padding:0px 16px 0px 16px;">\
						<select data-role="flipswitch" style="display:inline-block;" data-mini="true">\
							<option value="0">' + __('No') + '</option>\
							<option value="1"' + (comps[emocio.id]['te']?'selected':'') + '>' + __('Sí') + '</option>\
						</select>\
						<span>\
							<img style="float:left; height:25.44px; margin:6.25px; position:relative; top:1.5px" src="icons/' + emocio.id + '.png">\
						</span>\
						<label style="display:inline-block; font-size:11px; margin:0px 0px 0px 10px;">' + emocio.name + '</label>\
						<span style="float:right">\
							<img class="work" data-state="' + (comps[emocio.id]['compartida'] + 0) + '" src="icons/share/' + (comps[emocio.id]['compartida'] + 0) + '.png" style="height:25.44px; margin:6.25px; position:relative; top:1.5px">\
						</span>\
					</a>\
					<a class="emocions_info" data-theme="a">\
						Informació\
					</a>\
				</li>';				
		}
	});
	$("#emocions-list").html(list_emocions).listview('refresh'); // No es pot inicialitzar abans de crear-lo
	$("#emocions-list").trigger('create');
}
function build_ambits_list(type, comps) {
	list_ambits = "";
	// console.log(ambits);
	ambits.forEach(function (ambit, index) {
		list_ambits += '\
			<li class="ui-field-contain">\
				<a class="tag" data-id="' + ambit.id + '" style="padding:0px 16px 0px 16px;">\
					<select data-role="flipswitch" style="display:inline-block;" data-mini="true">\
						<option value="0">' + __('No') + '</option>\
						<option value="1"' + (comps[ambit.id]['te']?'selected':'') + '>' + __('Sí') + '</option>\
					</select>\
					<label style="display:inline-block; font-size:11px; margin:0px 0px 0px 10px;">' + ambit.name + '</label>\
				</a>\
				<a class="info" data-theme="a">\
					Informació\
				</a>\
			</li>';		
	});
	if(type == 'i'){
		$("#interessos-list").html(list_ambits).listview('refresh'); // No es pot inicialitzar abans de crear-lo
		$("#interessos-list").trigger('create');
	}
	else if(type == 'h') {
		$("#habilitats-list").html(list_ambits).listview('refresh'); // No es pot inicialitzar abans de crear-lo
		$("#habilitats-list").trigger('create');
	}
}
function build_comps_filter() {
	console.log("Construim filtre de grups amb els grups següents: ");
	console.log(comps_groups);
	filter_buttons = "";
	comps_groups.forEach(function (comp, index) {
		filter_buttons = filter_buttons + '<input type="checkbox" style="display:inline-block" data-id="' + comp.id + '" id="checkbox-' + comp.name + '"><label for="checkbox-' + comp.name + '">' + comp.name + '</label>';
	});
	$("#filter-cg").html(filter_buttons);
	$("#filter-cg").trigger('create');
}
function update_comp(v) {
	$("#footer").hide();
	url = domini_intra + "/assets/php/ajax/ajax_change_competence.php?t=" + user_id + "&p=" + project_id + "&c=" + comp_id + "&v=" + v + "&id=" + student_id;
	dades_comps[comp_id]['te'] = +v;
	$.ajax({
		url: url,
		success: function(data) {
			// console.log('Actualitzem sliders comp a ' + v);
			// $(".comp_select[data_id='" + comp_id + "']").val(v).flipswitch('refresh');
			data = JSON.parse(data);
			console.log(data);
			if (data.success) {
				$("#comps-footer").show( 400 );
				setTimeout( function() {
					$("#comps-footer").hide( 400 );
				}, 4000);
			}
			else { alert(data.msg);
			}
		}
	});
}
function update_comp_millora(v) {
	url = domini_intra + "/assets/php/ajax/ajax_change_competence_cm.php?t=" + user_id + "&p=" + project_id + "&c=" + comp_id + "&v=" + v + "&id=" + student_id;
	$.ajax({
		url: url,
		success: function(data) {
			data = JSON.parse(data);
			if (data.success) {
				$("#comp_millora-footer").show( 400 );
				console.log(data);
				setTimeout(
				 
				function() {
					$("#comp_millora-footer").hide( 400 );
				}, 4000);
				
			}
			else {
				alert(data.msg);
				$("#comps_millora-popup").popup('close');
			}
		}
	});
}
function update_emocions(v) {
	url = domini_intra + "/assets/php/ajax/ajax_change_emocio.php?t=" + user_id + "&p=" + project_id + "&c=" + comp_id + "&v=" + v + "&id=" + student_id;
	$.ajax({
		url: url,
		success: function(data) {
			data = JSON.parse(data);
			if (data.success) {
				$("#footer-emocions").show( 400 );
				setTimeout(
				 
				function() {
					$("#footer-emocions").hide( 400 );
				}, 4000);
				
			}
			else {
				alert(data.msg);
				$("#emocions-popup").popup('close');
			}
		}
	});
}
function update_interessos(v) {
	url = domini_intra + "/assets/php/ajax/ajax_change_interes.php?t=" + user_id + "&p=" + project_id + "&c=" + comp_id + "&v=" + v + "&id=" + student_id + "&m=0";
	console.log(url);
	$.ajax({
		url: url,
		success: function(data) {
			data = JSON.parse(data);
			if (data.success) {
				$("#interessos-popup").popup('close');
				$("#footer-interessos").show( 400 );
				setTimeout(
				 
				function() {
					$("#footer-interessos").hide( 400 );
				}, 4000);
				
			}
			else {
				alert(data.msg);
				$("#interessos-popup").popup('close');
			}
		}
	});
}
function update_habilitats(v) {
	url = domini_intra + "/assets/php/ajax/ajax_change_interes.php?t=" + user_id + "&p=" + project_id + "&c=" + comp_id + "&v=" + v + "&id=" + student_id + "&m=1";
	$.ajax({
		url: url,
		success: function(data) {
			data = JSON.parse(data);
			if (data.success) {
				$("#habilitats-popup").popup('close');
				$("#footer-habilitats").show( 400 );
				setTimeout(
				 
				function() {
					$("#footer-habilitats").hide( 400 );
				}, 4000);
				
			}
			else {
				alert(data.msg);
				$("#habilitats-popup").popup('close');
			}
		}
	});
}
function update_work(type, v, object) {
	url = domini_intra + "/assets/php/ajax/ajax_change_work.php?t=" + user_id + "&p=" + project_id + "&c=" + comp_id + "&v=" + (v * 1) + "&id=" + student_id + "&type=" + type;
	$.ajax({
		url: url,
		success: function(data) {
			data = JSON.parse(data);
			console.log(data);
			if(data.success) {
				object.attr('src', 'icons/share/' + (v+0) + '.png')
				object.data('state', v);
				if(type == "competencia") {
					$("#comps-footer").show( 400 );
					setTimeout( function() {
						$("#comps-footer").hide( 400 );
					}, 4000);
				}
				else if(type == "competencia_millora") {
					$("#comp_millora-footer").show( 400 );
					setTimeout( function() {
						$("#comp_millora-footer").hide( 400 );
					}, 4000);
				}
				else if(type == "emocio") {
					$("#footer-emocions").show( 400 );
					setTimeout( function() {
						$("#footer-emocions").hide( 400 );
					}, 4000);
				}
				else if(type == "intel") {
					$("#intels-footer").show( 400 );
					setTimeout( function() {
						$("#intels-footer").hide( 400 );
					}, 4000);
				}
			}
		}
	});
}
function get_info(type,id) {
	url = domini_intra + "/assets/php/ajax/ajax_return_info.php?lang=" + lang + "&id=" + id + "&t=" + type;
	$.ajax({
		url:url,
		success: function(data) {
			data = JSON.parse(data);
			if (data.success) {
				$("#info_description").html(data.text);
				$("#info-popup").popup('open');
			}
			else {
				$("#info_description").html(__("Error"));
			}
		}
	});
}
function sync() {
	url = domini_intra + "/assets/php/ajax/ajax_return_competences.php?lang=" + lang + "&id=" + entitat_id;
	console.log(url);
	$.ajax({
		// TODO: Enviar l'idioma en funció del particular
		url: url,
		success: function(data) {
			data = JSON.parse(data);
			console.log(data);
			// Arriba la resposta
			if (data.success) {
				comps_masc = data.comps_masc;
				comps_fem = data.comps_fem;
				comps_groups = data.groups;
				comps_millora = data.comps_millora;
				emocions = data.emocions;
				ambits = data.ambits;
				lang = data.lang;
				//comps_groups = data;
				localStorage.removeItem('lang');
				localStorage.setItem('comps_masc', JSON.stringify(comps_masc));
				localStorage.setItem('comps_fem', JSON.stringify(comps_fem));
				localStorage.setItem('comps_groups', JSON.stringify(comps_groups));
				localStorage.setItem('comps_millora', JSON.stringify(comps_millora));
				localStorage.setItem('emocions', JSON.stringify(emocions));
				localStorage.setItem('ambits', JSON.stringify(ambits));
				localStorage.setItem('lang', JSON.stringify(lang));
				console.log(lang);
				build_comps_filter();
				$("#rightpanel").panel("close");
			}
		}
	});
}
function exit() {
	navigator.app.exitApp();
}
$(document).on('click', ".goback_btn", goback);
$(document).on('click', ".si-logout",function () {
	console.log('Clear localStorage and exit');
	localStorage.removeItem('user_id');
	localStorage.removeItem('user_name');
	localStorage.clear();
	$.mobile.navigate( "#login-page" );
});
$(".comp-popup").on("popupafterclose", function(){
	$("#success-popup").popup('open');
});
function showLocalStorage() {
	for (var i = 0; i < localStorage.length; i++){
		console.log(localStorage.getItem[i]);
	}
	console.log(localStorage.getItem('user_id'));
	console.log(localStorage.getItem('project_id'));
}
function __(text) {
	if(lang == 'undefined'){
		lang = default_lang;
	}
	
	if(lang == null){
		lang = default_lang;
	}
	if(text in i18n){
		if(lang in i18n[text])return i18n[text][lang];
	} 
	else return text;
}
function bySortedValue(obj, callback, context) {
	var tuples = [];
	for (var key in obj) tuples.push([key, obj[key]]);
	tuples.sort(function(a, b) {
		{ // Determinem la ponderació de cada posicio
			pos0 = total_comp_clicks * 0.8;console.log(pos0);
			pos1 = total_comp_clicks * 0.5;
			pos2 = total_comp_clicks * 0.3;
			pos3 = total_comp_clicks * 0.2;
			pos4 = total_comp_clicks * 0.1;
		}
		{ // Mirem si la competència A està a la llista de recents
			recent_a = 0.0;
			if (recents_comps[0] == parseInt(a[0])) recent_a += pos0;
			if (recents_comps[1] == parseInt(a[0])) recent_a += pos1;
			if (recents_comps[2] == parseInt(a[0])) recent_a += pos2;
			if (recents_comps[3] == parseInt(a[0])) recent_a += pos3;
			if (recents_comps[4] == parseInt(a[0])) recent_a += pos4;
			valor_a = parseFloat(a[1]) + recent_a;
		}
		
		{ // Mirem si la competència B està a la llista de recents
			// pos_b = recents_comps.indexOf(parseInt(b[0]));
			recent_b = 0.0;
			if (recents_comps[0] == parseInt(b[0])) parseFloat(recent_b += pos0);
			if (recents_comps[1] == parseInt(b[0])) parseFloat(recent_b += pos1);
			if (recents_comps[2] == parseInt(b[0])) parseFloat(recent_b += pos2);
			if (recents_comps[3] == parseInt(b[0])) parseFloat(recent_b += pos3);
			if (recents_comps[4] == parseInt(b[0])) parseFloat(recent_b += pos4);
			valor_b = parseFloat(b[1]) + recent_b;
		}
		
		return valor_b < valor_a ? 1 : valor_b > valor_a ? -1 : 0 
	});
	var length = tuples.length;
	while (length--) callback.call(context, tuples[length][0], tuples[length][1]);
}
function update_recents_comps(id_comp) {
	recents_comps.unshift(id_comp);	// Afegim pel principi
	recents_comps = recents_comps.slice(0,5); // Definim el límit de la llista que guarda els clicks recents
	localStorage.setItem('recents_comps', recents_comps);
}