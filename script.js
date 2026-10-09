const translations = {
    en: { hero_title: "THE 100% FREE QR CODE GENERATOR", hero_sub: "Create custom QR Codes with Logo, Color and Design", sec1: "Enter Content", sec2: "Set Colors", sec3: "Add Logo Image", sec4: "Customize Design", create_btn: "Create QR Code" },
    tr: { hero_title: "%100 ÜCRETSİZ QR KOD OLUŞTURUCU", hero_sub: "Logo, Renk ve Tasarım ile özel QR Kodları oluşturun", sec1: "İçerik Girin", sec2: "Renkleri Ayarlayın", sec3: "Logo Ekleyin", sec4: "Tasarımı Özelleştirin", create_btn: "QR Kod Oluştur" },
    es: { hero_title: "GENERADOR DE CÓDIGOS QR 100% GRATIS", hero_sub: "Crea códigos QR personalizados con Logo, Color y Diseño", sec1: "Ingresar Contenido", sec2: "Configurar Colores", sec3: "Añadir Logo", sec4: "Personalizar Diseño", create_btn: "Crear Código QR" },
    fr: { hero_title: "GÉNÉRATEUR DE QR CODE 100% GRATUIT", hero_sub: "Créez des QR Codes personnalisés avec Logo, Couleur et Design", sec1: "Entrer le Contenu", sec2: "Définir les Couleurs", sec3: "Ajouter un Logo", sec4: "Personnaliser le Design", create_btn: "Créer un QR Code" },
    de: { hero_title: "DER 100% KOSTENLOSE QR-CODE-GENERATOR", hero_sub: "Erstellen Sie benutzerdefinierte QR-Codes mit Logo, Farbe und Design", sec1: "Inhalt Eingeben", sec2: "Farben Festlegen", sec3: "Logo Hinzufügen", sec4: "Design Anpassen", create_btn: "QR-Code Erstellen" },
    zh: { hero_title: "100% 免费的二维码生成器", hero_sub: "使用徽标、颜色和设计创建自定义二维码", sec1: "输入内容", sec2: "设置颜色", sec3: "添加标志", sec4: "自定义设计", create_btn: "生成二维码" },
    ar: { hero_title: "مولد رموز QR مجاني 100%", hero_sub: "قم بإنشاء رموز QR مخصصة مع شعار ولون وتصميم", sec1: "إدخال المحتوى", sec2: "تعيين الألوان", sec3: "إضافة شعار", sec4: "تخصيص التصميم", create_btn: "إنشاء رمز QR" },
    hi: { hero_title: "100% मुफ्त क्यूआर कोड जनरेटर", hero_sub: "लोगो, रंग और डिजाइन के साथ कस्टम क्यूआर कोड बनाएं", sec1: "सामग्री दर्ज करें", sec2: "रंग सेट करें", sec3: "लोगो जोड़ें", sec4: "डिज़ाइन कस्टमाइज़ करें", create_btn: "क्यूआर कोड बनाएं" },
    ru: { hero_title: "100% БЕСПЛАТНЫЙ ГЕНЕРАТОР QR-КОДОВ", hero_sub: "Создавайте пользовательские QR-коды с логотипом, цветом и дизайном", sec1: "Введите Содержимое", sec2: "Настройте Цвета", sec3: "Добавьте Логотип", sec4: "Настройте Дизайн", create_btn: "Создать QR-код" },
    pt: { hero_title: "GERADOR DE QR CODE 100% GRATUITO", hero_sub: "Crie códigos QR personalizados com logotipo, cor e design", sec1: "Inserir Conteúdo", sec2: "Definir Cores", sec3: "Adicionar Logo", sec4: "Personalizar Design", create_btn: "Criar QR Code" }
};

let qrCode;
let uploadedLogo = null;
let currentTab = 'url';
let isDarkMode = false;
let html5QrcodeScanner = null;

// Log visit on load
fetch('/api/log_visit', { method: 'POST' }).catch(() => {});

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.innerText = isDarkMode ? '☀️' : '🌙';
}

function changeLanguage() {
    const lang = document.getElementById('lang-select').value;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize QR Code
    qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        type: "canvas",
        data: "https://www.example.com",
        image: "",
        dotsOptions: {
            color: "#000000",
            type: "square"
        },
        backgroundOptions: {
            color: "#ffffff",
        },
        imageOptions: {
            crossOrigin: "anonymous",
            margin: 10
        },
        cornersSquareOptions: {
            type: "square",
            color: "#000000"
        },
        cornersDotOptions: {
            type: "square",
            color: "#000000"
        }
    });

    qrCode.append(document.getElementById("qr-code"));

    // Handle normal logo upload
    document.getElementById('logo-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedLogo = event.target.result;
            }
            reader.readAsDataURL(file);
        }
    });
    
    loadHistory();
});

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const body = section.querySelector('.accordion-body');
    const icon = section.querySelector('.acc-icon');
    const isActive = section.classList.contains('active');
    
    if (isActive) {
        section.classList.remove('active');
        body.style.display = 'none';
        if (icon) icon.innerText = '+';
    } else {
        section.classList.add('active');
        body.style.display = 'block';
        if (icon) icon.innerText = '-';
    }
}

function switchTab(tabId, event) {
    currentTab = tabId;
    
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    if (event) {
        event.currentTarget.classList.add('active');
    }
}

function clearLogo() {
    document.getElementById('logo-file').value = '';
    uploadedLogo = null;
}

function getQRData() {
    if (currentTab === 'url') return document.getElementById('qr-url').value || 'https://example.com';
    if (currentTab === 'text') return document.getElementById('qr-text').value || 'Hello World';
    
    if (currentTab === 'email') {
        const email = document.getElementById('email-address').value;
        const sub = document.getElementById('email-subject').value;
        const msg = document.getElementById('email-message').value;
        return `mailto:${email}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(msg)}`;
    }
    
    if (currentTab === 'phone') {
        return `tel:${document.getElementById('phone-number').value}`;
    }
    
    if (currentTab === 'wifi') {
        const ssid = document.getElementById('wifi-ssid').value;
        const pass = document.getElementById('wifi-password').value;
        const enc = document.getElementById('wifi-encryption').value;
        return `WIFI:T:${enc};S:${ssid};P:${pass};;`;
    }
    
    if (currentTab === 'vcard') {
        const fn = document.getElementById('vcard-fname').value;
        const ln = document.getElementById('vcard-lname').value;
        const phone = document.getElementById('vcard-phone').value;
        const email = document.getElementById('vcard-email').value;
        const comp = document.getElementById('vcard-company').value;
        
        return `BEGIN:VCARD\nVERSION:3.0\nN:${ln};${fn}\nFN:${fn} ${ln}\nORG:${comp}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
    }

    if (currentTab === 'sms') {
        const num = document.getElementById('sms-number').value;
        const msg = document.getElementById('sms-message').value;
        return `SMSTO:${num}:${msg}`;
    }

    if (currentTab === 'location') {
        const lat = document.getElementById('loc-lat').value;
        const lng = document.getElementById('loc-lng').value;
        return `geo:${lat},${lng}`;
    }

    if (currentTab === 'event') {
        const title = document.getElementById('ev-title').value;
        const start = document.getElementById('ev-start').value.replace(/[-:]/g, '');
        const end = document.getElementById('ev-end').value.replace(/[-:]/g, '');
        return `BEGIN:VEVENT\nSUMMARY:${title}\nDTSTART:${start}Z\nDTEND:${end}Z\nEND:VEVENT`;
    }
    
    return 'https://example.com';
}

function getQROptions(data) {
    const colorType = document.getElementById('color-type').value;
    const colorDark = document.getElementById('color-dark').value;
    const colorLight = document.getElementById('color-light').value;
    
    const dotType = document.getElementById('dot-type').value;
    const cornerSquareType = document.getElementById('corner-square-type').value;
    const cornerDotType = document.getElementById('corner-dot-type').value;

    let dotsOptions = { type: dotType };

    if (colorType === 'gradient') {
        const colorDark2 = document.getElementById('color-dark-2').value;
        const gradType = document.getElementById('gradient-type').value;
        dotsOptions.gradient = {
            type: gradType,
            rotation: gradType === 'linear' ? 0 : 0,
            colorStops: [{ offset: 0, color: colorDark }, { offset: 1, color: colorDark2 }]
        };
    } else {
        dotsOptions.color = colorDark;
    }

    let cornersSquareOptions = { type: cornerSquareType };
    let cornersDotOptions = { type: cornerDotType };

    if (document.getElementById('custom-eye-color').checked) {
        cornersSquareOptions.color = document.getElementById('color-eye-outer').value;
        cornersDotOptions.color = document.getElementById('color-eye-inner').value;
    } else {
        cornersSquareOptions.color = colorDark;
        cornersDotOptions.color = colorDark;
    }

    const removeBg = document.getElementById('logo-remove-bg').checked;
    
    let imageOptions = {
        crossOrigin: "anonymous",
        margin: removeBg ? 10 : 0
    };
    
    const size = parseInt(document.getElementById('qr-quality').value) || 1000;

    return {
        width: size,
        height: size,
        data: data,
        image: uploadedLogo || "",
        imageOptions: imageOptions,
        dotsOptions: dotsOptions,
        backgroundOptions: { color: colorLight },
        cornersSquareOptions: cornersSquareOptions,
        cornersDotOptions: cornersDotOptions
    };
}

function generateQR() {
    if (currentTab === 'bulk') return; // Bulk handled separately

    const data = getQRData();
    const options = getQROptions(data);
    qrCode.update(options);
    
    saveToHistory(data);

    fetch('/api/log_qr', { method: 'POST' }).catch(() => {});
}

function downloadQR(extension) {
    if (currentTab === 'bulk') {
        alert("Use Generate ZIP button for bulk.");
        return;
    }
    const filename = `RainQR_${new Date().getTime()}`;
    qrCode.download({ name: filename, extension: extension });
}

function toggleGradientOptions() {
    const isGradient = document.getElementById('color-type').value === 'gradient';
    document.getElementById('gradient-color-group').style.display = isGradient ? 'block' : 'none';
    document.getElementById('gradient-type-group').style.display = isGradient ? 'block' : 'none';
}

function toggleEyeColors() {
    const custom = document.getElementById('custom-eye-color').checked;
    document.getElementById('eye-color-options').style.display = custom ? 'flex' : 'none';
}

/* Templates */
function applyTemplate(type) {
    if(type === 'facebook') {
        document.getElementById('color-dark').value = "#1877F2";
        document.getElementById('dot-type').value = "rounded";
        document.getElementById('corner-square-type').value = "extra-rounded";
    } else if(type === 'twitter') {
        document.getElementById('color-dark').value = "#1DA1F2";
        document.getElementById('dot-type').value = "dots";
        document.getElementById('corner-square-type').value = "dot";
        document.getElementById('corner-dot-type').value = "dot";
    } else if(type === 'youtube') {
        document.getElementById('color-dark').value = "#FF0000";
        document.getElementById('dot-type').value = "square";
        document.getElementById('corner-square-type').value = "square";
    } else if(type === 'modern') {
        document.getElementById('color-type').value = "gradient";
        toggleGradientOptions();
        document.getElementById('color-dark').value = "#FF007A";
        document.getElementById('color-dark-2').value = "#7928CA";
        document.getElementById('dot-type').value = "rounded";
        document.getElementById('corner-square-type').value = "extra-rounded";
    }
    
    // Auto-open colors and design
    toggleSection('section-colors');
    toggleSection('section-design');
    generateQR();
}

/* History */
function loadHistory() {
    const list = document.getElementById('history-list');
    let history = JSON.parse(localStorage.getItem('qr_history') || '[]');
    if(history.length === 0) return;
    
    list.innerHTML = '';
    history.forEach((item, index) => {
        let div = document.createElement('div');
        div.style = "padding:10px; border:1px solid var(--border); border-radius:4px; display:flex; justify-content:space-between;";
        div.innerHTML = `<span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:80%;">${item}</span>
                         <button style="border:none; background:var(--primary); color:white; padding:2px 8px; border-radius:3px; cursor:pointer;" onclick="restoreHistory('${btoa(unescape(encodeURIComponent(item)))}')">Load</button>`;
        list.appendChild(div);
    });
}
window.restoreHistory = function(b64) {
    const data = decodeURIComponent(escape(atob(b64)));
    qrCode.update(getQROptions(data));
}
function saveToHistory(data) {
    let history = JSON.parse(localStorage.getItem('qr_history') || '[]');
    if(history[0] === data) return;
    history.unshift(data);
    if(history.length > 10) history = history.slice(0, 10);
    localStorage.setItem('qr_history', JSON.stringify(history));
    loadHistory();
}

/* Bulk */
async function generateBulk() {
    const text = document.getElementById('bulk-data').value;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if(lines.length === 0) return alert("Enter some URLs!");
    
    const zip = new JSZip();
    const folder = zip.folder("QRCodes");
    
    for(let i=0; i<lines.length; i++) {
        let opt = getQROptions(lines[i]);
        let qr = new QRCodeStyling(opt);
        // getRawData requires library support, so we draw to offscreen canvas
        const blob = await qr.getRawData("png");
        if(blob) {
            folder.file(`QR_${i+1}.png`, blob);
        }
    }
    
    zip.generateAsync({type:"blob"}).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "RainQR_Bulk.zip";
        link.click();
    });
}

/* Scanner */
function openScanner() {
    document.getElementById('scanner-modal').style.display = 'flex';
    html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

function closeScanner() {
    document.getElementById('scanner-modal').style.display = 'none';
    if(html5QrcodeScanner) {
        html5QrcodeScanner.clear();
    }
}

function onScanSuccess(decodedText, decodedResult) {
    document.getElementById('scan-result').innerText = "Found: " + decodedText;
}

function onScanFailure(error) {
    // ignore
}

function handleNavQRUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Create a temporary hidden div for the scanner if it doesn't exist
    let tempDiv = document.getElementById('temp-scanner-div');
    if (!tempDiv) {
        tempDiv = document.createElement('div');
        tempDiv.id = 'temp-scanner-div';
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
    }
    
    const scanner = new Html5Qrcode("temp-scanner-div");
    
    scanner.scanFile(file, true)
    .then(decodedText => {
        alert("QR Code Link Found:\n\n" + decodedText);
        // Put the link into the URL tab directly so they can edit it
        document.getElementById('qr-url').value = decodedText;
        switchTab('url');
    })
    .catch(err => {
        alert("❌ Could not find a valid QR code in this image.");
    })
    .finally(() => {
        event.target.value = ''; // Reset file input
    });
}
