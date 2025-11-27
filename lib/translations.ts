export type Language = "tr" | "en";

export const translations: Record<Language, any> = {
  tr: {
    // Navigation
    nav: {
      home: "Ana Sayfa",
      products: "Ürünler",
      about: "Hakkımızda",
      contact: "İletişim",
      cart: "Alışveriş Sepeti",
      login: "Giriş Yap",
      register: "Kayıt Ol",
      logout: "Çıkış Yap",
    },
    // Homepage
    home: {
      hero: {
        title: "Valmoré Collective",
        subtitle:
          "Modern bireyler için küratörlü moda. Stilini tanımlayan zamansız parçaları keşfet.",
        cta: "Alışverişe Başla",
      },
      featured: {
        title: "Öne Çıkan Koleksiyon",
        description:
          "Gardırobunuzu yükseltmek için tasarlanmış, en son koleksiyonumuzdan özenle seçilmiş parçalar.",
        viewAll: "Tüm Ürünleri Görüntüle",
      },
      about: {
        title: "Valmoré Collective Hakkında",
        description1:
          "Valmoré Collective'te modanın sadece giyimden ibaret olmadığına inanıyoruz—bu bir kendini ifade etme biçimidir. Küratörlü koleksiyonumuz, kaliteli işçilik ile çağdaş tasarımı harmanlayan zamansız parçalar içerir.",
        description2:
          "Koleksiyonumuzdaki her ürün, mükemmellik standartlarımıza uygunluğunu sağlamak için özenle seçilmiştir. Sürdürülebilirlik ve etik uygulamalara olan bağlılığımızı paylaşan güvenilir tedarikçilerle çalışıyoruz.",
        learnMore: "Daha Fazla Bilgi",
      },
    },
    // Products
    products: {
      title: "Ürünlerimiz",
      description: "Premium moda küratörlü koleksiyonumuzu keşfedin",
      search: "Ürün ara...",
      filter: "Filtrele",
      sort: {
        name: "İsme Göre Sırala",
        priceLow: "Fiyat: Düşükten Yükseğe",
        priceHigh: "Fiyat: Yüksekten Düşüğe",
      },
      noResults: "Arama kriterlerinize uygun ürün bulunamadı",
      all: "Tümü",
      size: "Beden",
      color: "Renk",
      quantity: "Adet",
      addToCart: "Sepete Ekle",
      updateCart: "Sepeti Güncelle",
      cartUpdated: "✓ Güncellendi",
      addedToCart: "Sepete Eklendi!",
      outOfStock: "Stokta Yok",
      productDetails: "Ürün Detayları",
      category: "Kategori",
      stockStatus: "Stok Durumu",
      inStock: "Stokta Var",
      back: "Geri",
      notFound: "Ürün bulunamadı",
      backToProducts: "Ürünlere Dön",
      selectSizeColor: "Lütfen beden ve renk seçiniz",
      quickView: "Hızlı Bak",
      noImage: "Görsel Yok",
      freeShipping: "Ücretsiz Kargo",
      addToFavorites: "Favorilere ekle",
      currency: "TL",
      sizeGuide: "Beden Rehberi",
      productDescription: "Açıklama",
      shippingReturns: "Kargo & İade",
      freeShippingFrom: "30€ üzeri ücretsiz kargo",
      returnPolicy: "30 gün iade hakkı",
      share: "Paylaş",
      categoryLabel: "Kategori:",
      brandLabel: "Marka:",
      relatedProducts: "İlgili Ürünler",
      swipeMore: "Daha fazla ürün için kaydırın",
      count: "Ürün",
      categories: {
        all: "Tümü",
        shirts: "Gömlekler",
        pants: "Pantolonlar",
        outerwear: "Dış Giyim",
        tops: "Üst Giyim",
        tshirts: "Tişörtler",
        sweatshirts: "Sweatshirt",
        accessories: "Aksesuar",
        shoes: "Ayakkabı",
        dresses: "Elbise",
        shorts: "Şort",
      },
      clearFilter: "Filtreleri Temizle",
    },
    // Cart
    cart: {
      title: "Alışveriş Sepeti",
      empty: {
        title: "Sepetiniz boş",
        description: "Alışverişe devam etmek için sepete ürün ekleyin",
        browse: "Ürünlere Göz At",
      },
      size: "Beden",
      color: "Renk",
      orderSummary: "Sipariş Özeti",
      subtotal: "Ara Toplam",
      shipping: "Kargo",
      shippingNote: "Ödemede hesaplanır",
      total: "Toplam",
      items: "ürün",
      proceed: "Ödemeye Geç",
      continue: "Alışverişe Devam Et",
      viewCart: "Sepete Git",
      checkout: "Ödemeye Git",
    },
    // Checkout
    checkout: {
      title: "Ödeme",
      backToCart: "Sepete Dön",
      guestMessageBefore: "",
      guestMessageAfter:
        " ve bilgilerinizin otomatik doldurulmasını sağla veya misafir olarak devam et",
      loggedInMessage:
        "olarak giriş yaptınız. Bilgileriniz otomatik dolduruldu, isterseniz değiştirebilirsiniz",
      shipping: "Teslimat Bilgileri",
      payment: "Ödeme Bilgileri",
      orderSummary: "Sipariş Özeti",
      firstName: "Ad",
      lastName: "Soyad",
      email: "E-posta",
      phone: "Telefon",
      address: "Adres",
      city: "Şehir",
      state: "İlçe",
      zipCode: "Posta Kodu",
      country: "Ülke",
      cardNumber: "Kart Numarası",
      cardName: "Kart Sahibi Adı",
      expiryDate: "Son Kullanma Tarihi",
      cvc: "CVC",
      placeOrder: "Sipariş Ver",
      processing: "İşleniyor...",
      success: {
        title: "Sipariş Başarıyla Verildi!",
        message:
          "Satın aldığınız için teşekkürler. Kısa süre içinde onay e-postası alacaksınız",
        continue: "Alışverişe Devam Et",
      },
      required: "gereklidir",
      invalidEmail: "Geçersiz e-posta formatı",
      invalidCard: "Geçersiz kart numarası",
      invalidExpiry: "Geçersiz format (AA/YY)",
      invalidCVC: "Geçersiz CVC",
    },
    // Auth
    auth: {
      login: {
        emailNotVerified: "Lütfen e-postanızı doğrulayın",
        title: "Giriş Yap",
        noAccount: "Hesabınız yok mu?",
        register: "Kayıt olun",
        email: "E-posta",
        password: "Şifre",
        remember: "Beni hatırla",
        forgot: "Şifrenizi mi unuttunuz?",
        submit: "Giriş Yap",
        loading: "Giriş yapılıyor...",
        error: "E-posta veya şifre hatalı. Lütfen tekrar deneyin",
        back: "Ana Sayfaya Dön",
        or: "veya",
        google: "Google ile Giriş Yap",
      },
      register: {
        title: "Kayıt Ol",
        hasAccount: "Zaten hesabınız var mı?",
        login: "Giriş yapın",
        name: "Ad Soyad",
        email: "E-posta",
        password: "Şifre",
        confirmPassword: "Şifre Tekrar",
        minLength: "En az 6 karakter",
        submit: "Kayıt Ol",
        loading: "Kayıt yapılıyor...",
        passwordMismatch: "Şifreler eşleşmiyor",
        passwordTooShort: "Şifre en az 6 karakter olmalıdır",
        emailExists: "Bu e-posta adresi zaten kullanılıyor",
        back: "Ana Sayfaya Dön",
        google: "Google ile Kayıt Ol",
      },
    },
    // About
    about: {
      title: "Valmoré Collective Hakkında",
      description1:
        "Valmoré Collective'te modanın sadece giyimden ibaret olmadığına inanıyoruz—bu bir kendini ifade etme biçimidir. Misyonumuz, kaliteli işçilik ile çağdaş tasarımı harmanlayan zamansız parçaları küratörlüğünü yaparak, benzersiz stilini ifade etmeni sağlamaktır",
      description2:
        "Koleksiyonumuzdaki her ürün, mükemmellik standartlarımıza uygunluğunu sağlamak için özenle seçilmiştir. Sürdürülebilirlik ve etik uygulamalara olan bağlılığımızı paylaşan güvenilir tedarikçilerle çalışıyoruz, böylece moda tercihlerinin olumlu bir etki yaratmasını sağlıyoruz",
      values: "Değerlerimiz",
      value1:
        "Nicelikten ziyade nitelik - iyi yapılmış, dayanıklı parçalara odaklanıyoruz",
      value2:
        "Sürdürülebilirlik - etik ve çevreye duyarlı uygulamaları önceliklendiriyoruz",
      value3:
        "Zamansız stil - modası hiç geçmeyen klasik tasarımlara inanıyoruz",
      value4: "Müşteri memnuniyeti - deneyimin bizim en büyük önceliğimizdir",
      story: "Hikayemiz",
      storyText:
        "Moda tutkusu ve kaliteye bağlılıkla kurulan Valmoré Collective, küçük bir butik olarak başladı ve kaliteli giyim ve aksesuarları takdir edenler için güvenilir bir adres haline geldi",
    },
    // Contact
    contact: {
      title: "İletişim",
      description:
        "Sizden haber almak isteriz! Aşağıdaki bilgileri kullanarak bizimle iletişime geçin veya formu doldurun",
      email: "E-posta",
      phone: "Telefon",
      address: "Adres",
      name: "İsim",
      message: "Mesaj",
      send: "Mesaj Gönder",
      sent: "Mesaj Gönderildi!",
    },
    // Footer
    footer: {
      description:
        "Modern bireyler için küratörlü moda. Stilini tanımlayan zamansız parçaları keşfet",
      quickLinks: "Hızlı Bağlantılar",
      customerService: "Müşteri Hizmetleri",
      shipping: "Kargo Bilgisi",
      returns: "İade & Değişim",
      sizeGuide: "Beden Rehberi",
      faq: "Sık Sorulan Sorular",
      newsletter: "Bülten",
      newsletterDescription: "Özel teklifler ve güncellemeler için abone olun",
      emailPlaceholder: "E-posta adresiniz",
      joinButton: "KATIL",
      rights: "Tüm hakları saklıdır",
    }, favorites: {
      title: "Favorilerim",
      empty: "Henüz favori ürününüz yok",
      continue: "Alışverişe Devam Et",
      items: "ürün",
    },
  },
  en: {
    // Navigation
    nav: {
      home: "Home",
      products: "Products",
      about: "About",
      contact: "Contact",
      cart: "Shopping Cart",
      login: "Login",
      register: "Register",
      logout: "Logout",
    },
    // Homepage
    home: {
      hero: {
        title: "Valmoré Collective",
        subtitle:
          "Curated fashion for the modern individual. Discover timeless pieces that define your style",
        cta: "Shop Now",
      },
      featured: {
        title: "Featured Collection",
        description:
          "Handpicked selections from our latest collection, designed to elevate your wardrobe",
        viewAll: "View All Products",
      },
      about: {
        title: "About Valmoré Collective",
        description1:
          "At Valmoré Collective, we believe that fashion is more than just clothing—it's a form of self-expression. Our curated collection features timeless pieces that blend quality craftsmanship with contemporary design",
        description2:
          "Every item in our collection is carefully selected to ensure it meets our standards of excellence. We work with trusted suppliers who share our commitment to sustainability and ethical practices",
        learnMore: "Learn More",
      },
    },
    // Products
    products: {
      title: "Our Products",
      description: "Discover our curated collection of premium fashion",
      search: "Search products...",
      filter: "Filter",
      sort: {
        name: "Sort by Name",
        priceLow: "Price: Low to High",
        priceHigh: "Price: High to Low",
      },
      noResults: "No products found matching your criteria",
      all: "All",
      size: "Size",
      color: "Color",
      quantity: "Quantity",
      addToCart: "Add to Cart",
      updateCart: "Update Cart",
      cartUpdated: "✓ Updated",
      addedToCart: "Added to Cart!",
      outOfStock: "Out of Stock",
      productDetails: "Product Details",
      category: "Category",
      stockStatus: "Availability",
      inStock: "In Stock",
      back: "Back",
      notFound: "Product not found",
      backToProducts: "Back to Products",
      selectSizeColor: "Please select both size and color",
      quickView: "Quick View",
      noImage: "No Image",
      freeShipping: "Free Shipping",
      addToFavorites: "Add to favorites",
      currency: "TL",
      sizeGuide: "Size Guide",
      productDescription: "Description",
      shippingReturns: "Shipping & Returns",
      freeShippingFrom: "Free shipping over 30€",
      returnPolicy: "30 day return policy",
      share: "Share",
      categoryLabel: "Category:",
      brandLabel: "Brand:",
      relatedProducts: "Related Products",
      swipeMore: "Swipe for more products",
      count: "Products",
      categories: {
        all: "All",
        shirts: "Shirts",
        pants: "Pants",
        outerwear: "Outerwear",
        tops: "Tops",
        tshirts: "T-Shirts",
        sweatshirts: "Sweatshirts",
        accessories: "Accessories",
        shoes: "Shoes",
        dresses: "Dresses",
        shorts: "Shorts",
      },
      clearFilter: "Clear All",
    },
    // Cart
    cart: {
      title: "Shopping Cart",
      empty: {
        title: "Your cart is empty",
        description: "Start adding items to your cart to continue shopping",
        browse: "Browse Products",
      },
      size: "Size",
      color: "Color",
      orderSummary: "Order Summary",
      subtotal: "Subtotal",
      shipping: "Shipping",
      shippingNote: "Calculated at checkout",
      total: "Total",
      items: "items",
      proceed: "Proceed to Checkout",
      continue: "Continue Shopping",
      viewCart: "View Cart",
      checkout: "Checkout",
    },
    // Checkout
    checkout: {
      title: "Checkout",
      backToCart: "Back to Cart",
      guestMessageBefore: "",
      guestMessageAfter:
        " to have your information automatically filled in. Or continue as a guest",
      loggedInMessage:
        "logged in. Your information has been automatically filled in, you can change it if you wish",
      shipping: "Shipping Information",
      payment: "Payment Information",
      orderSummary: "Order Summary",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      city: "City",
      state: "State",
      zipCode: "Zip Code",
      country: "Country",
      cardNumber: "Card Number",
      cardName: "Cardholder Name",
      expiryDate: "Expiry Date",
      cvc: "CVC",
      placeOrder: "Place Order",
      processing: "Processing...",
      success: {
        title: "Order Placed Successfully!",
        message:
          "Thank you for your purchase. You will receive a confirmation email shortly",
        continue: "Continue Shopping",
      },
      required: "is required",
      invalidEmail: "Invalid email format",
      invalidCard: "Invalid card number",
      invalidExpiry: "Invalid format (MM/YY)",
      invalidCVC: "Invalid CVC",
    },
    // Auth
    auth: {
      login: {
        emailNotVerified: "Please verify your email address before logging in",
        title: "Login",
        noAccount: "Don't have an account?",
        register: "Sign up",
        email: "Email",
        password: "Password",
        remember: "Remember me",
        forgot: "Forgot your password?",
        submit: "Login",
        loading: "Logging in...",
        error: "Invalid email or password. Please try again.",
        back: "Back to Home",
        or: "or",
        google: "Continue with Google",
      },
      register: {
        title: "Register",
        hasAccount: "Already have an account?",
        login: "Login",
        name: "Full Name",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        minLength: "At least 6 characters",
        submit: "Register",
        loading: "Registering...",
        passwordMismatch: "Passwords do not match",
        passwordTooShort: "Password must be at least 6 characters",
        emailExists: "This email address is already in use",
        back: "Back to Home",
        google: "Sign up with Google",
      },
    },
    // About
    about: {
      title: "About Valmoré Collective",
      description1:
        "At Valmoré Collective, we believe that fashion is more than just clothing—it's a form of self-expression. Our mission is to curate timeless pieces that blend quality craftsmanship with contemporary design, allowing you to express your unique style",
      description2:
        "Every item in our collection is carefully selected to ensure it meets our standards of excellence. We work with trusted suppliers who share our commitment to sustainability and ethical practices, ensuring that your fashion choices make a positive impact",
      values: "Our Values",
      value1: "Quality over quantity - we focus on well-made, durable pieces",
      value2:
        "Sustainability - we prioritize ethical and environmentally responsible practices",
      value3:
        "Timeless style - we believe in classic designs that never go out of fashion",
      value4: "Customer satisfaction - your experience is our top priority",
      story: "Our Story",
      storyText:
        "Founded with a passion for fashion and a commitment to quality, Valmoré Collective started as a small boutique and has grown into a trusted destination for those who appreciate fine clothing and accessories",
    },
    // Contact
    contact: {
      title: "Contact Us",
      description:
        "We'd love to hear from you! Get in touch with us using the information below or fill out the form",
      email: "Email",
      phone: "Phone",
      address: "Address",
      name: "Name",
      message: "Message",
      send: "Send Message",
      sent: "Message Sent!",
    },
    // Footer
    footer: {
      description:
        "Curated fashion for the modern individual. Discover timeless pieces that define your style",
      quickLinks: "Quick Links",
      customerService: "Customer Service",
      shipping: "Shipping Info",
      returns: "Returns",
      sizeGuide: "Size Guide",
      faq: "FAQ",
      newsletter: "Newsletter",
      newsletterDescription: "Subscribe for exclusive offers and updates",
      emailPlaceholder: "Your email",
      joinButton: "JOIN",
      rights: "All rights reserved",
    },
    // Favorites
    favorites: {
      title: "My Favorites",
      empty: "No favorite items yet",
      continue: "Continue Shopping",
      items: "items",
    },
  },
};

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split(".");
  let value: string | Record<string, unknown> | undefined = translations[lang];

  for (const k of keys) {
    if (typeof value === "object" && value !== null && k in value) {
      value = value[k] as string | Record<string, unknown>;
    } else {
      value = undefined;
    }
    if (value === undefined) {
      // Fallback to Turkish if translation not found
      let fallbackValue: string | Record<string, unknown> | undefined =
        translations.tr;
      for (const k2 of keys) {
        if (
          typeof fallbackValue === "object" &&
          fallbackValue !== null &&
          k2 in fallbackValue
        ) {
          fallbackValue = fallbackValue[k2] as string | Record<string, unknown>;
        } else {
          fallbackValue = undefined;
          break;
        }
      }
      value = fallbackValue;
      break;
    }
  }

  return typeof value === "string" ? value : key;
}
