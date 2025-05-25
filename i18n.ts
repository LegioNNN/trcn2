// Define translations
export const translations = {
  tr: {
    appName: "TARCAN",
    welcome: "Çiftçilik Yönetimi ve Planlama Uygulaması",
    login: "Giriş Yap",
    register: "Kayıt Ol",
    or: "ya da",
    googleLogin: "Google ile Giriş",
    phoneNumber: "Telefon Numarası",
    password: "Şifre",
    forgotPassword: "Şifremi Unuttum",
    fullName: "Ad Soyad",
    noAccount: "Hesabınız yok mu?",
    haveAccount: "Zaten hesabınız var mı?",
    dashboard: "Ana Sayfa",
    fields: "Tarlalarım",
    products: "Ürünlerim",
    calendar: "Takvim",
    tasks: "Görevler",
    reports: "Raporlar",
    profile: "Profil",
    settings: "Ayarlar",
    logout: "Çıkış Yap",
    quickAccess: "Hızlı Erişim",
    newField: "Yeni Tarla",
    newTask: "Yeni Görev",
    newProduct: "Yeni Ürün",
    viewAll: "Tümünü Gör",
    myFields: "Tarlalarım",
    upcomingTasks: "Yaklaşan Görevler",
    fieldHealth: "Tarla Sağlık Durumu",
    loading: "Yükleniyor...",
    today: "Bugün",
    tomorrow: "Yarın",
    area: "Alan",
    acres: "dönüm",
    moisture: "Nem",
    temperature: "Sıcaklık",
    plantHealth: "Bitki Sağlığı",
    good: "İyi",
    medium: "Orta",
    poor: "Kötü",
    lastUpdated: "Son güncelleme",
    addNewItem: "Yeni Ekle",
    back: "Geri",
    save: "Kaydet",
    cancel: "İptal",
    delete: "Sil",
    edit: "Düzenle",
    view: "Görüntüle",
    name: "İsim",
    description: "Açıklama",
    location: "Konum",
    size: "Boyut",
    unit: "Birim",
    crop: "Ürün",
    date: "Tarih",
    startTime: "Başlangıç Saati",
    endTime: "Bitiş Saati",
    completed: "Tamamlandı",
    notify: "Hatırlat",
    type: "Tip",
    watering: "Sulama",
    fertilizing: "Gübreleme",
    harvesting: "Hasat",
    planting: "Ekim"
  },
  en: {
    appName: "TARCAN",
    welcome: "Farm Management and Planning Application",
    login: "Login",
    register: "Register",
    or: "or",
    googleLogin: "Login with Google",
    phoneNumber: "Phone Number",
    password: "Password",
    forgotPassword: "Forgot Password",
    fullName: "Full Name",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    dashboard: "Dashboard",
    fields: "My Fields",
    products: "My Products",
    calendar: "Calendar",
    tasks: "Tasks",
    reports: "Reports",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    quickAccess: "Quick Access",
    newField: "New Field",
    newTask: "New Task",
    newProduct: "New Product",
    viewAll: "View All",
    myFields: "My Fields",
    upcomingTasks: "Upcoming Tasks",
    fieldHealth: "Field Health Status",
    loading: "Loading...",
    today: "Today",
    tomorrow: "Tomorrow",
    area: "Area",
    acres: "acres",
    moisture: "Moisture",
    temperature: "Temperature",
    plantHealth: "Plant Health",
    good: "Good",
    medium: "Medium",
    poor: "Poor",
    lastUpdated: "Last updated",
    addNewItem: "Add New",
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    name: "Name",
    description: "Description",
    location: "Location",
    size: "Size",
    unit: "Unit",
    crop: "Crop",
    date: "Date",
    startTime: "Start Time",
    endTime: "End Time",
    completed: "Completed",
    notify: "Notify",
    type: "Type",
    watering: "Watering",
    fertilizing: "Fertilizing",
    harvesting: "Harvesting",
    planting: "Planting"
  }
};

// Get current language from local storage or use default
export function getCurrentLanguage(): 'tr' | 'en' {
  const savedLang = localStorage.getItem('language') as 'tr' | 'en';
  return savedLang || 'tr';
}

// Set the language
export function setLanguage(lang: 'tr' | 'en'): void {
  localStorage.setItem('language', lang);
  window.dispatchEvent(new Event('languageChange'));
}

// Get translation for a key
export function translate(key: string): string {
  const lang = getCurrentLanguage();
  // @ts-ignore
  return translations[lang][key] || key;
}

// Custom hook for using translations
export function useTranslation() {
  return {
    t: translate,
    currentLanguage: getCurrentLanguage(),
    setLanguage
  };
}
