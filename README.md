# RainQR

Saf HTML, CSS ve JavaScript (Vanilla JS) ile geliştirilmiş, tamamen tarayıcı üzerinde (istemci taraflı) çalışan hafif ve özelleştirilebilir QR Kod ve Barkod üreticisi.

## Özellikler

- **İstemci Taraflı Çalışma:** Tüm QR kodları ve barkodlar HTML5 Canvas ve SVG kullanılarak doğrudan kullanıcının tarayıcısında üretilir. Hiçbir veri harici sunuculara veya üçüncü parti API'lere gönderilmez.
- **Çoklu Veri Türleri:**
  - URL / Web bağlantıları
  - Düz metin ve notlar (özel `?view_text=` metin okuyucu modu dahil)
  - WiFi ağ yapılandırması (WPA/WPA2, WEP, gizli ağ desteği)
  - vCard (Dijital kartvizit)
  - E-posta (konu ve mesaj şablonuyla)
  - Telefon numarası ve SMS
  - Coğrafi konum koordinatları
  - Takvim etkinlikleri
- **1D Barkod Desteği:** JsBarcode entegrasyonu ile standart lineer barkodlar (Code 128, EAN-13, EAN-8, UPC, Code 39, ITF vb.).
- **Tasarım ve Özelleştirme:**
  - Nokta stilleri: kare, yuvarlak, noktalar, klasik
  - Köşe kareleri ve iç göz şekli özelleştirme
  - Düz renkler ve doğrusal/radyal degrade (gradient) geçişleri
  - Özel logo yükleme (otomatik ortalama ve kenar boşluğu ile)
  - Çerçeve şablonları ve özel çağrı metinleri ("SCAN ME" vb.)
  - Arka plan filigran görseli ekleme
- **Yüksek Çözünürlüklü Dışa Aktarma:** PNG, SVG, WEBP ve JPEG formatlarında 2000x2000 piksele kadar indirme imkanı.
- **Dahili QR Tarayıcı & Okuyucu:**
  - Cihaz kamerası ile gerçek zamanlı QR tarama (`html5-qrcode`)
  - Görsel dosyası yükleyerek QR çözme
- **Toplu QR Üretimi (Bulk):** Birden fazla bağlantıyı alt alta yapıştırarak tüm QR kodlarını tek seferde ZIP arşivi olarak indirme.
- **10 Dil Desteği:** Türkçe, İngilizce, İspanyolca, Fransızca, Almanca, Çince, Arapça, Hintçe, Rusça, Portekizce.
- **PWA & Karanlık Mod:** Çevrimdışı kullanım için Service Worker önbellekleme, yüklenebilir manifest desteği ve tema geçişi.

## Proje Yapısı

```
RainQR/
├── index.html       # Ana sayfa ve bileşen yapısı
├── script.js        # Üretici motoru, çeviriler ve tarayıcı mantığı
├── style.css        # Arayüz, responsive düzen ve tema stilleri
├── manifest.json    # PWA kurulum yapılandırması
├── sw.js            # Çevrimdışı çalışma için Service Worker
├── robots.txt       # Arama motoru direktifleri
├── server.py        # İsteğe bağlı yerel Python test sunucusu
├── .gitignore       # Git güvenlik filtreleri
├── LICENSE          # MIT Lisansı
└── README.md        # Proje dokümantasyonu
```

## Başlangıç ve Yerel Çalıştırma

Proje derleme adımı (build step) veya paket yöneticisi gerektirmeyen saf statik web teknolojileriyle yazılmıştır.

### 1. Yöntem: Doğrudan Tarayıcıda Açma
`index.html` dosyasına çift tıklayarak doğrudan tarayıcınızda açabilirsiniz.

### 2. Yöntem: Python HTTP Sunucusu
```bash
python -m http.server 3000
```
Ardından tarayıcınızdan `http://localhost:3000` adresine gidin.

### 3. Yöntem: Dahili Geliştirme Sunucusu
```bash
python server.py
```
Uygulamayı port 3000 üzerinde başlatır ve `http://localhost:3000/admin` adresinde temel bir yerel panel sunar.

## Dağıtım (Deployment)

Proje tamamen statik dosyalardan oluştuğu için GitHub Pages, Cloudflare Pages, Netlify veya herhangi bir statik web barındırma hizmetinde doğrudan çalışır.

### GitHub Pages ile Yayınlama
1. Projeyi GitHub reponuza yükleyin.
2. Reponuzun **Settings > Pages** sekmesine gidin.
3. **Branch** kısmından `main` dalını seçip kaydedin.
4. Siteniz birkaç saniye içinde ücretsiz olarak yayına girecektir.

## Kullanılan Kütüphaneler

- [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) - QR kod oluşturma ve SVG/Canvas çizim motoru
- [JsBarcode](https://github.com/lindell/JsBarcode) - 1D barkod üretimi
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) - Kamera ve görsel üzerinden QR kod çözme
- [JSZip](https://github.com/Stuk/jszip) - Toplu üretimde ZIP arşivi oluşturma
- [html2canvas](https://github.com/niklasvh/html2canvas) - Çerçeveli QR kodlarının ekran yakalama ile dışa aktarımı

## Lisans

Bu proje [MIT Lisansı](LICENSE) altında sunulmaktadır.
