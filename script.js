
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('view_text')) {
    document.body.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; background: #f8fafc; font-family: 'Roboto', sans-serif; padding: 20px;">
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 600px; width: 100%; text-align: center;">
                <h2 style="color: #3b82f6; margin-top:0; margin-bottom: 20px;">Okunan Metin / Not</h2>
                <div style="font-size: 1.2rem; line-height: 1.6; color: #333; white-space: pre-wrap; word-break: break-word; text-align: left; background: #f1f5f9; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; max-height: 60vh; overflow-y: auto;">
                    ${decodeURIComponent(urlParams.get('view_text')).replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                </div>
                <a href="/" style="display:inline-block; margin-top:20px; text-decoration:none; background:#3b82f6; color:white; padding: 10px 20px; border-radius: 8px; font-weight:bold;">Kendi QR Kodunu Oluştur</a>
            </div>
        </div>
    `;
    // Stop further script execution by overriding functions
    window.generateQR = function(){};
    throw new Error('View text mode active. Stopped execution.');
}


// Register Service Worker for PWA Offline Support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('PWA ServiceWorker registered successfully');
    }).catch(err => {
      console.log('PWA ServiceWorker registration failed: ', err);
    });
  });
}

const translations = {
    en: { hero_title: "THE 100% FREE QR CODE GENERATOR", hero_sub: "Create custom QR Codes with Logo, Color and Design", sec1: "Enter Content", sec2: "Set Colors", sec3: "Add Logo Image", sec_frame: "Add Frame & Text", sec4: "Customize Design", sec_temp: "Templates", sec_hist: "History (Local)", create_btn: "Create QR Code", create_bar: "Create Barcode", btn_qr: "▦ QR Code Generator", btn_bar: "||| Barcode Generator", tab_bulk: "Bulk", tab_sms: "SMS", tab_loc: "Location", tab_event: "Event" },
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

// Site loaded


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
    if (urlParams.has('view_text')) return;

    // Initialize QR Code
    const qrContainer = document.getElementById("qr-code");
    if (qrContainer) {
        qrCode = new QRCodeStyling({
            width: 300,
            height: 300,
            type: "canvas",
            data: "https://www.example.com",
            image: "",
            dotsOptions: {
                color: "#000000",
                type: "square",
                errorCorrectionLevel: document.getElementById("error-correction") ? document.getElementById("error-correction").value : "Q"
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
                errorCorrectionLevel: document.getElementById("error-correction") ? document.getElementById("error-correction").value : "Q",
                color: "#000000"
            },
            cornersDotOptions: {
                type: "square",
                errorCorrectionLevel: document.getElementById("error-correction") ? document.getElementById("error-correction").value : "Q",
                color: "#000000"
            }
        });

        qrCode.append(qrContainer);
    }

    // Handle normal logo upload
    const logoInput = document.getElementById('logo-file');
    if (logoInput) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    uploadedLogo = event.target.result;
                    generateQR();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle background image upload
    const bgInput = document.getElementById('bg-upload');
    if (bgInput) {
        bgInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    window.uploadedBg = event.target.result;
                    const wrapper = document.getElementById('qr-frame-wrapper');
                    if (wrapper) {
                        wrapper.style.backgroundImage = `url(${window.uploadedBg})`;
                        wrapper.style.backgroundSize = 'cover';
                        wrapper.style.backgroundPosition = 'center';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Quality slider real-time label update
    const qualitySlider = document.getElementById('qr-quality');
    const qualityDisplay = document.getElementById('quality-display');
    if (qualitySlider && qualityDisplay) {
        qualitySlider.addEventListener('input', function() {
            qualityDisplay.textContent = `${this.value}x${this.value} px`;
        });
    }

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
    const pane = document.getElementById('tab-' + tabId);
    if (pane) pane.classList.add('active');
    
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        const btn = document.querySelector(`.tab-btn[onclick*="'${tabId}'"]`);
        if (btn) btn.classList.add('active');
    }
}

function clearLogo() {
    const input = document.getElementById('logo-file');
    if (input) input.value = '';
    uploadedLogo = null;
    generateQR();
}

window.clearBg = function() {
    window.uploadedBg = null;
    const bgInput = document.getElementById('bg-upload');
    if (bgInput) bgInput.value = '';
    const wrapper = document.getElementById('qr-frame-wrapper');
    if (wrapper) wrapper.style.backgroundImage = 'none';
};

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

window.generateQR = function() {
    if (typeof isBarcodeMode !== "undefined" && isBarcodeMode) { generateBarcode(); return; }
    if (currentTab === 'bulk') return; // Bulk handled separately

    const data = getQRData();
    const options = getQROptions(data);
    qrCode.update(options);
    if (typeof isBarcodeMode !== 'undefined' && isBarcodeMode) generateBarcode();
    
    saveToHistory(data);
}


async function downloadQR(extension) {

    if (typeof isBarcodeMode !== 'undefined' && isBarcodeMode) {
        const svg = document.getElementById('barcode');
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svg);
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
        
        if (extension === 'svg') {
            const link = document.createElement('a');
            link.href = url;
            link.download = `RainBarcode_${new Date().getTime()}.svg`;
            link.click();
        } else {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const link = document.createElement('a');
                link.href = canvas.toDataURL(`image/${extension}`);
                link.download = `RainBarcode_${new Date().getTime()}.${extension}`;
                link.click();
            }
            img.src = url;
        }
        return;
    }

    if (currentTab === 'bulk') {
        alert("Use Generate ZIP button for bulk.");
        return;
    }
    const style = document.getElementById('frame-style').value;
    const filename = `RainQR_${new Date().getTime()}`;
    
    if ((style !== 'none' || window.uploadedBg) && (extension === 'png' || extension === 'jpeg' || extension === 'webp')) {
        const wrapper = document.getElementById('qr-frame-wrapper');
        const canvas = await html2canvas(wrapper, { backgroundColor: null, scale: 3, useCORS: true });
        const dataUrl = canvas.toDataURL(`image/${extension}`);
        const link = document.createElement('a');
        link.download = `${filename}.${extension}`;
        link.href = dataUrl;
        link.click();
    } else {
        qrCode.download({ name: filename, extension: extension });
    }
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
    if (!list) return;
    let history = JSON.parse(localStorage.getItem('qr_history') || '[]');
    if (history.length === 0) return;
    
    list.innerHTML = '';
    history.forEach((item) => {
        let div = document.createElement('div');
        div.style.padding = "10px";
        div.style.border = "1px solid var(--border)";
        div.style.borderRadius = "4px";
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";
        div.style.marginBottom = "6px";

        let span = document.createElement('span');
        span.style.overflow = "hidden";
        span.style.textOverflow = "ellipsis";
        span.style.whiteSpace = "nowrap";
        span.style.maxWidth = "80%";
        span.textContent = item;

        let btn = document.createElement('button');
        btn.style.border = "none";
        btn.style.background = "var(--primary)";
        btn.style.color = "white";
        btn.style.padding = "4px 10px";
        btn.style.borderRadius = "3px";
        btn.style.cursor = "pointer";
        btn.textContent = "Load";
        btn.onclick = () => restoreHistory(btoa(unescape(encodeURIComponent(item))));

        div.appendChild(span);
        div.appendChild(btn);
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


window.updateFrame = function() {
    const style = document.getElementById('frame-style').value;
    const text = document.getElementById('frame-text').value;
    const color = document.getElementById('frame-color').value;
    
    const wrapper = document.getElementById('qr-frame-wrapper');
    const topText = document.getElementById('frame-text-top');
    const bottomText = document.getElementById('frame-text-bottom');
    
    wrapper.className = '';
    topText.style.display = 'none';
    bottomText.style.display = 'none';
    wrapper.style.backgroundColor = 'transparent';
    wrapper.style.borderColor = 'transparent';
    topText.style.backgroundColor = 'transparent';
    bottomText.style.backgroundColor = 'transparent';
    topText.style.color = '#fff';
    bottomText.style.color = '#fff';

    topText.innerText = text;
    bottomText.innerText = text;

    if (style === 'bottom-bubble') {
        wrapper.classList.add('frame-bottom-bubble');
        wrapper.style.backgroundColor = color;
        bottomText.style.backgroundColor = color;
    } else if (style === 'top-badge') {
        wrapper.classList.add('frame-top-badge');
        wrapper.style.backgroundColor = color;
        topText.style.backgroundColor = color;
    } else if (style === 'simple-border') {
        wrapper.classList.add('frame-simple-border');
        wrapper.style.borderColor = color;
        bottomText.style.color = color;
    }
}

window.setSocialLogo = function(type) {
    const urls = {
        'whatsapp': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
        'instagram': 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
        'youtube': 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
        'wifi': 'https://upload.wikimedia.org/wikipedia/commons/a/ae/WiFi_Logo.svg',
        'pdf': 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg'
    };
    uploadedLogo = urls[type];
    generateQR();
    toggleSection('section-logo');
}


let isBarcodeMode = false;

window.toggleBarcodeMode = function() {
    isBarcodeMode = !isBarcodeMode;
    const btnQr = document.getElementById('btn-qr-mode');
    const btnBarcode = document.getElementById('btn-barcode-mode');
    
    const qrTabs = document.querySelector('.generator-tabs');
    const qrControls = document.querySelectorAll('.accordion-item:not(#section-content):not(#section-colors)');
    const barcodeControls = document.getElementById('barcode-controls');
    const qrWrapper = document.getElementById('qr-frame-wrapper');
    const barcodeWrapper = document.getElementById('barcode');
    const createBtn = document.querySelector('.generate-btn');
    const tabContent = document.querySelector('.tab-content');

    if (isBarcodeMode) {
        if(btnQr) {
            btnQr.style.background = 'transparent';
            btnQr.style.color = 'var(--text-main)';
            btnBarcode.style.background = 'var(--primary)';
            btnBarcode.style.color = 'white';
        }
        
        qrTabs.style.display = 'none';
        qrControls.forEach(el => el.style.display = 'none');
        tabContent.style.display = 'none';
        
        barcodeControls.style.display = 'block';
        qrWrapper.style.display = 'none';
        barcodeWrapper.style.display = 'block';
        createBtn.innerText = "Create Barcode";
        
        generateBarcode();
    } else {
        if(btnQr) {
            btnQr.style.background = 'var(--primary)';
            btnQr.style.color = 'white';
            btnBarcode.style.background = 'transparent';
            btnBarcode.style.color = 'var(--text-main)';
        }
        
        qrTabs.style.display = ''; 
        qrControls.forEach(el => el.style.display = 'block');
        tabContent.style.display = 'block';
        
        barcodeControls.style.display = 'none';
        qrWrapper.style.display = 'inline-flex';
        barcodeWrapper.style.display = 'none';
        createBtn.innerText = "Create QR Code";
        
        generateQR();
    }
}

window.generateBarcode = function() {
    if (!isBarcodeMode) return;
    const format = document.getElementById('barcode-type').value;
    const value = document.getElementById('barcode-value').value || "123456789012";
    const color = document.getElementById('color-dark').value;
    const background = document.getElementById('color-light').value;
    
    try {
        JsBarcode("#barcode", value, {
            format: format,
            lineColor: color,
            background: background,
            width: 2,
            height: 100,
            displayValue: true
        });
    } catch(e) {
        // Ignore format mismatch errors during typing
    }
}


window.setMode = function(mode) {
    if (mode === 'qr' && isBarcodeMode) {
        toggleBarcodeMode();
    } else if (mode === 'barcode' && !isBarcodeMode) {
        toggleBarcodeMode();
    }
}


window.shareQR = async function() {
    const style = document.getElementById('frame-style').value;
    let canvasElement;
    
    if (typeof isBarcodeMode !== 'undefined' && isBarcodeMode) {
        alert("Barcode sharing requires downloading first for now."); return;
    } else if (style !== 'none' || window.uploadedBg) {
        const wrapper = document.getElementById('qr-frame-wrapper');
        canvasElement = await html2canvas(wrapper, { backgroundColor: null, scale: 2, useCORS: true });
    } else {
        canvasElement = document.querySelector('#qr-code canvas');
    }
    
    if (!canvasElement) {
        alert("Please generate a QR code first.");
        return;
    }

    canvasElement.toBlob(async (blob) => {
        const file = new File([blob], "RainQR.png", { type: "image/png" });
        let clipboardSuccess = false;
        
        try {
            if (navigator.clipboard && window.ClipboardItem) {
                const item = new ClipboardItem({ "image/png": blob });
                await navigator.clipboard.write([item]);
                clipboardSuccess = true;
            }
        } catch (e) {
            console.log("Clipboard write failed:", e);
        }

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'RainQR Code',
                    text: 'Generated with RainQR'
                });
            } catch (err) {}
        } else {
            if (clipboardSuccess) {
                alert("QR Code copied to clipboard! (Ctrl+V to paste)");
            } else {
                alert("Direct sharing is not supported. Please download the image.");
            }
        }
    });
}
