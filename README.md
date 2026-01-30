# e-Defter XML Görüntüleyici
**Electron tabanlı Türkçe e-Defter (e-Defter / e-Ledger) XML görüntüleyici**

XML Viewer IE, Türkiye’de kullanılan e-Defter (Berat, Yevmiye, Kebir vb.) XML dosyalarını
masaüstünde güvenli ve okunabilir şekilde görüntülemek için geliştirilmiş
Electron + React tabanlı bir uygulamadır.

---

## Özellikler

- XML dosyalarını yükleme ve görüntüleme  
- Çoklu XSLT şablon desteği  
  - Berat  
  - Yevmiye  
  - Kebir  
  - Defter Raporu  
- DOMPurify ile güvenli HTML işleme  
- Electron tabanlı masaüstü mimari  
- React ile modern ve hızlı arayüz  
- Dosya dialog üzerinden kolay dosya seçimi  

---

## Desteklenen Dosya Türleri

- **Berat XML**
- **Yevmiye Defteri**
- **Kebir Defteri**
- **Muhasebe / Defter Raporları**

---

## Gereksinimler

- Node.js **14+**
- npm veya yarn

---

## Kurulum

```bash
npm install
```

---

## Geliştirme Ortamı

```bash
npm start
```

Bu komut:
- React geliştirme sunucusunu
- Electron masaüstü uygulamasını  
aynı anda başlatır.

---

## Build / Dağıtım

```bash
npm run build
npm run build-exe
```

- `build`: React production build
- `build-exe`: Windows installer (.exe)

---

## Proje Yapısı

```
├── public/
│   ├── index.html        # HTML şablonu
├── src/
│   ├── App.js            # Ana React bileşeni
│   ├── App.css           # Stil dosyaları
│   ├── index.js          # React giriş noktası
│   └── assets/           # Statik kaynaklar
├── main.js               # Electron main process
├── preload.js            # Electron preload script
├── *.xslt                # XSLT şablonları
├── package.json          # Proje yapılandırması
└── README.md
```

---

## Kullanılan Teknolojiler

- **Frontend**: React 18
- **Desktop**: Electron
- **Build**: electron-builder
- **Security**: DOMPurify

---

## Amaç

Bu proje, e-Defter XML dosyalarının:
- tarayıcıya bağımlı kalmadan
- güvenli
- hızlı
- okunabilir  

şekilde masaüstünde incelenmesini hedefler.
