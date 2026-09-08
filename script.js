let dataPenduduk = [];
let modalCallback = null;
let limitTampil = 10; // Load limit untuk tabel

window.onload = function() {
    const temaTersimpan = localStorage.getItem('pilihanTema') || 'dark-default';
    document.documentElement.setAttribute('data-theme', temaTersimpan);
    updateMetaThemeColor(temaTersimpan);
    
    const activeThemeElement = document.querySelector(`.theme-item[data-theme-val="${temaTersimpan}"]`);
    if(activeThemeElement) activeThemeElement.classList.add('active');

    const dataTersimpan = localStorage.getItem('dataRegistrasi');
    if (dataTersimpan) {
        dataPenduduk = JSON.parse(dataTersimpan);
        renderData(true);
    }

    const catatanTersimpan = localStorage.getItem('dataCatatan');
    if (catatanTersimpan) {
        document.getElementById('catatanInput').value = catatanTersimpan;
    }

    updateButtonState('nik');
    updateButtonState('kk');
    updateButtonState('searchInput');
};

/* MANAJEMEN TAB MENU & SUB TAB */
function switchView(viewId, btnElement) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById('view-' + viewId).classList.add('active');
    btnElement.classList.add('active');
}

function switchSubTab(subId) {
    document.querySelectorAll('.sub-tab').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sub-view').forEach(el => el.classList.remove('active'));
    
    document.getElementById('tab-' + subId).classList.add('active');
    document.getElementById('sub-' + subId).classList.add('active');

    // Tampilkan list tabel hanya di sub-tab database
    const listContainer = document.getElementById('data-list-container');
    if (subId === 'database') {
        listContainer.style.display = 'block';
        renderData(true);
    } else {
        listContainer.style.display = 'none';
    }
}

/* MANAJEMEN INPUT TEMPEL & HAPUS */
function updateButtonState(inputId) {
    const input = document.getElementById(inputId);
    const btnPaste = document.getElementById('btnPaste_' + inputId);
    const btnClear = document.getElementById('btnClear_' + inputId);

    if (!input || !btnPaste || !btnClear) return;

    if (input.value.length > 0) {
        btnPaste.style.display = 'none';
        btnClear.style.display = 'flex';
    } else {
        btnPaste.style.display = 'flex';
        btnClear.style.display = 'none';
    }
}

async function tempelInput(targetId) {
    try {
        const text = await navigator.clipboard.readText();
        const inputElement = document.getElementById(targetId);
        inputElement.value = text;
        
        if (targetId === 'searchInput') handleSearchInput(inputElement);
        else handleInputPintar(inputElement);
    } catch (err) {
        showModal("Gagal Tempel", "Tidak dapat membaca clipboard.");
    }
}

function handleInputPintar(inputElement) {
    formatInputPintar(inputElement);
    updateButtonState(inputElement.id);
}

function handleSearchInput(inputElement) {
    updateButtonState(inputElement.id);
    renderData(true); // Reset load limit jika melakukan pencarian
}

function hapusInput(targetId) {
    const inputElement = document.getElementById(targetId);
    inputElement.value = '';
    inputElement.focus();
    updateButtonState(targetId);
    if (targetId === 'searchInput') renderData(true);
}

function formatInputPintar(inputElement) {
    let angkaBersih = inputElement.value.replace(/[^0-9]/g, '');
    if (angkaBersih.length > 16) angkaBersih = angkaBersih.slice(0, 16);
    inputElement.value = angkaBersih;
}

/* MANAJEMEN TEMA & CATATAN */
function pilihTemaItem(tema, element) {
    document.querySelectorAll('.theme-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('pilihanTema', tema);
    updateMetaThemeColor(tema);
}
function updateMetaThemeColor(tema) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', tema.startsWith('dark') ? '#111827' : '#f8fafc');
}
function simpanCatatan() {
    localStorage.setItem('dataCatatan', document.getElementById('catatanInput').value);
}

/* MODAL & DATA */
function showModal(title, message, isConfirm = false, onConfirm = null) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    
    const btnCancel = document.getElementById('modalBtnCancel');
    const btnConfirm = document.getElementById('modalBtnConfirm');
    
    modalCallback = onConfirm;
    if (isConfirm) {
        btnCancel.style.display = 'block';
        btnConfirm.innerText = 'Ya, Lanjutkan';
    } else {
        btnCancel.style.display = 'none';
        btnConfirm.innerText = 'OK';
    }
    document.getElementById('customModal').classList.add('active');
}

function closeModal() {
    document.getElementById('customModal').classList.remove('active');
    modalCallback = null;
}
document.getElementById('modalBtnConfirm').addEventListener('click', () => {
    const callback = modalCallback; closeModal(); if (callback) callback();
});
document.getElementById('modalBtnCancel').addEventListener('click', closeModal);

function simpanKeLokal() { localStorage.setItem('dataRegistrasi', JSON.stringify(dataPenduduk)); }

function eksekusiTambahData(nik, kk) {
    dataPenduduk.unshift({ nik: nik, kk: kk, status: false }); // Menambahkan di urutan awal (teratas)
    simpanKeLokal();
    hapusInput('nik'); hapusInput('kk');
    document.getElementById('nik').focus();
    showModal("Sukses", "Data berhasil ditambahkan.");
}

function tambahData() {
    const nik = document.getElementById('nik').value;
    const kk = document.getElementById('kk').value;

    if (nik.length !== 16) return showModal("Perhatian", "NIK wajib 16 digit!");
    if (kk.length > 0 && kk.length !== 16) return showModal("Perhatian", "KK harus 16 digit atau dikosongkan!");

    if (dataPenduduk.some(d => d.nik === nik)) return showModal("Gagal", "NIK ini sudah tercatat!");
    if (kk && dataPenduduk.some(d => d.kk === kk)) {
        return showModal("Konfirmasi No KK", "No KK ini sudah tersedia. Tetap tambahkan?", true, () => eksekusiTambahData(nik, kk));
    }
    eksekusiTambahData(nik, kk);
}

function hapusData(indexOriginal) {
    showModal("Konfirmasi Hapus", "Yakin ingin menghapus data ini?", true, () => {
        dataPenduduk.splice(indexOriginal, 1);
        simpanKeLokal(); renderData(false);
    });
}
function ubahStatus(indexOriginal, checkbox) {
    dataPenduduk[indexOriginal].status = checkbox.checked;
    simpanKeLokal(); renderData(false);
}

/* RENDER DAN PAGINASI */
function muatLebihBanyak() {
    limitTampil += 10;
    renderData(false);
}

function renderData(resetLimit = false) {
    if (resetLimit) limitTampil = 10;
    const container = document.getElementById('dataContainer');
    const btnDownload = document.getElementById('btnDownload');
    const btnLoadMore = document.getElementById('btnLoadMore');
    const keyword = document.getElementById('searchInput').value.replace(/\s+/g, '').toLowerCase();

    container.innerHTML = '';
    btnLoadMore.style.display = 'none';

    if (dataPenduduk.length === 0) {
        container.innerHTML = '<div class="empty-state">Belum ada data tersimpan</div>';
        btnDownload.style.display = 'none';
        return;
    }

    let dataTampil = dataPenduduk.map((data, index) => ({ ...data, indexOriginal: index }));

    if (keyword) {
        dataTampil = dataTampil.filter(d => d.nik.includes(keyword) || (d.kk && d.kk.includes(keyword)));
    }

    if (dataTampil.length === 0) {
        container.innerHTML = '<div class="empty-state">Data tidak ditemukan</div>';
        btnDownload.style.display = 'block';
        return;
    }

    btnDownload.style.display = 'block';

    const hitungKk = {};
    dataPenduduk.forEach(d => { if (d.kk) hitungKk[d.kk] = (hitungKk[d.kk] || 0) + 1; });

    // Paginasi array (potong berdasarkan batas)
    const dataPaginasi = dataTampil.slice(0, limitTampil);

    dataPaginasi.forEach((data) => {
        const isKkSama = data.kk && hitungKk[data.kk] > 1;
        const kelasMarkKk = isKkSama ? 'mark-kk' : '';
        const isSudah = data.status === true;
        const teksStatus = isSudah ? 'Terdaftar' : 'Belum';
        const kelasTeks = isSudah ? 'status-sudah' : 'status-belum';

        const card = document.createElement('div');
        card.className = 'data-card';
        card.innerHTML = `
            <div class="data-header">
                <div class="header-left">
                    <label class="status-label"><input type="checkbox" ${isSudah ? 'checked' : ''} onchange="ubahStatus(${data.indexOriginal}, this)">
                    <span class="status-text ${kelasTeks}">${teksStatus}</span></label>
                </div>
                <button class="btn-hapus" onclick="hapusData(${data.indexOriginal})">Hapus</button>
            </div>
            <div class="data-row">
                <div class="data-info"><span class="data-label">NIK</span><span class="data-value">${formatAngka(data.nik)}</span></div>
                <button class="btn-salin" onclick="salinTeks('${data.nik}', this)">Salin</button>
            </div>
            <div class="data-row ${kelasMarkKk}">
                <div class="data-info"><span class="data-label">KK</span><span class="data-value">${data.kk ? formatAngka(data.kk) : '-'}</span></div>
                ${data.kk ? `<button class="btn-salin" onclick="salinTeks('${data.kk}', this)">Salin</button>` : ''}
            </div>
        `;
        container.appendChild(card);
    });

    if (dataTampil.length > limitTampil) {
        btnLoadMore.style.display = 'block';
    }
}

/* UTILS */
function formatAngka(angka) { return angka.replace(/(\d{6})(\d{6})(\d{4})/, '$1 $2 $3'); }
function salinTeks(teks, btnElement) {
    navigator.clipboard.writeText(teks).then(() => {
        const teksAwal = btnElement.innerText;
        btnElement.innerText = 'Disalin!'; btnElement.classList.add('disalin');
        setTimeout(() => { btnElement.innerText = teksAwal; btnElement.classList.remove('disalin'); }, 1500);
    });
}
function downloadTXT() {
    if (dataPenduduk.length === 0) return;
    let isiTeks = "=== DATA REGISTRASI ===\n\n";
    dataPenduduk.forEach((data, index) => {
        isiTeks += `Data Ke-${index + 1} [${data.status ? "SUDAH DAFTAR" : "BELUM DAFTAR"}]\nNIK : ${data.nik}\nKK  : ${data.kk ? data.kk : '-'}\n------------------------\n`;
    });
    const blob = new Blob([isiTeks], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "Data_Registrasi.txt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

/* FITUR SUARA */
function mulaiVoiceInput(targetId) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return showModal("Tidak Didukung", "Browser Anda tidak mendukung fitur ini.");
    const recognition = new SpeechRecognition(), inputElement = document.getElementById(targetId), btnVoice = targetId === 'nik' ? document.getElementById('btnVoiceNik') : document.getElementById('btnVoiceKk');
    recognition.lang = 'id-ID'; recognition.interimResults = false;
    recognition.onstart = () => { btnVoice.classList.add('recording'); inputElement.placeholder = "Mendengarkan..."; };
    recognition.onresult = (e) => { inputElement.value = e.results[0][0].transcript.replace(/\s+/g, ''); handleInputPintar(inputElement); };
    recognition.onend = () => { btnVoice.classList.remove('recording'); inputElement.placeholder = targetId === 'nik' ? "Masukkan 16 digit angka" : "Boleh dikosongkan"; };
    recognition.start();
}
function mulaiVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return showModal("Tidak Didukung", "Browser Anda tidak mendukung fitur ini.");
    const recognition = new SpeechRecognition(), inputElement = document.getElementById('searchInput'), btnVoice = document.getElementById('btnVoiceSearch');
    recognition.lang = 'id-ID'; recognition.interimResults = false;
    recognition.onstart = () => { btnVoice.classList.add('recording'); inputElement.placeholder = "Mendengarkan..."; };
    recognition.onresult = (e) => { inputElement.value = e.results[0][0].transcript.replace(/\s+/g, ''); handleSearchInput(inputElement); };
    recognition.onend = () => { btnVoice.classList.remove('recording'); inputElement.placeholder = "🔍 Cari NIK / KK..."; };
    recognition.start();
}