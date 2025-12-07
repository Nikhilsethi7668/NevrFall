/**
 * @Bitespeed Popups
 * @version 4.0.0
 * @last_change reframed the entire popup script
 * @developer Sobhan Bera <https://github.com/sobhanbera>
 */
const bspdVersion = "v4.0.0";
console.log(`Using Bitespeed-Popups ${bspdVersion}`);

// prettier-ignore
const countryMappedTZ = [{ "country": "Afghanistan", "timezones": ["Asia/Kabul"] }, { "country": "Albania", "timezones": ["Europe/Tirane"] }, { "country": "Algeria", "timezones": ["Africa/Algiers"] }, { "country": "Argentina", "timezones": ["America/Argentina/Buenos_Aires", "America/Argentina/Cordoba", "America/Argentina/Salta", "America/Argentina/Jujuy", "America/Argentina/Tucuman", "America/Argentina/Catamarca", "America/Argentina/La_Rioja", "America/Argentina/San_Juan", "America/Argentina/Mendoza", "America/Argentina/San_Luis", "America/Argentina/Rio_Gallegos", "America/Argentina/Ushuaia"] }, { "country": "Armenia", "timezones": ["Asia/Yerevan"] }, { "country": "Australia", "timezones": ["Australia/Lord_Howe", "Antarctica/Macquarie", "Australia/Hobart", "Australia/Currie", "Australia/Melbourne", "Australia/Sydney", "Australia/Broken_Hill", "Australia/Brisbane", "Australia/Lindeman", "Australia/Adelaide", "Australia/Darwin", "Australia/Perth", "Australia/Eucla"] }, { "country": "Austria", "timezones": ["Europe/Vienna"] }, { "country": "Azerbaijan", "timezones": ["Asia/Baku"] }, { "country": "Bahrain", "timezones": ["Asia/Bahrain"] }, { "country": "Bangladesh", "timezones": ["Asia/Dhaka"] }, { "country": "Belarus", "timezones": ["Europe/Minsk"] }, { "country": "Belgium", "timezones": ["Europe/Brussels"] }, { "country": "Belize", "timezones": ["America/Belize"] }, { "country": "Bhutan", "timezones": ["Asia/Thimphu"] }, { "country": "Bolivia", "timezones": ["America/La_Paz"] }, { "country": "Bosnia and Herzegovina", "timezones": ["Europe/Sarajevo"] }, { "country": "Botswana", "timezones": ["Africa/Gaborone"] }, { "country": "Brazil", "timezones": ["America/Noronha", "America/Belem", "America/Fortaleza", "America/Recife", "America/Araguaina", "America/Maceio", "America/Bahia", "America/Sao_Paulo", "America/Campo_Grande", "America/Cuiaba", "America/Santarem", "America/Porto_Velho", "America/Boa_Vista", "America/Manaus", "America/Eirunepe", "America/Rio_Branco"] }, { "country": "Brunei", "timezones": ["Asia/Brunei"] }, { "country": "Bulgaria", "timezones": ["Europe/Sofia"] }, { "country": "Cambodia", "timezones": ["Asia/Phnom_Penh"] }, { "country": "Cameroon", "timezones": ["Africa/Douala"] }, { "country": "Canada", "timezones": ["America/St_Johns", "America/Halifax", "America/Glace_Bay", "America/Moncton", "America/Goose_Bay", "America/Blanc-Sablon", "America/Toronto", "America/Nipigon", "America/Thunder_Bay", "America/Iqaluit", "America/Pangnirtung", "America/Atikokan", "America/Winnipeg", "America/Rainy_River", "America/Resolute", "America/Rankin_Inlet", "America/Regina", "America/Swift_Current", "America/Edmonton", "America/Cambridge_Bay", "America/Yellowknife", "America/Inuvik", "America/Creston", "America/Dawson_Creek", "America/Fort_Nelson", "America/Vancouver", "America/Whitehorse", "America/Dawson"] }, { "country": "Chile", "timezones": ["America/Santiago", "Pacific/Easter"] }, { "country": "China", "timezones": ["Asia/Shanghai", "Asia/Urumqi"] }, { "country": "Colombia", "timezones": ["America/Bogota"] }, { "country": "Congo (DRC)", "timezones": ["Africa/Kinshasa", "Africa/Lubumbashi"] }, { "country": "Costa Rica", "timezones": ["America/Costa_Rica"] }, { "country": "Côte d’Ivoire", "timezones": ["Africa/Abidjan"] }, { "country": "Croatia", "timezones": ["Europe/Zagreb"] }, { "country": "Cuba", "timezones": ["America/Havana"] }, { "country": "Czech Republic", "timezones": ["Europe/Prague"] }, { "country": "Denmark", "timezones": ["Europe/Copenhagen"] }, { "country": "Djibouti", "timezones": ["Africa/Djibouti"] }, { "country": "Dominican Republic", "timezones": ["America/Santo_Domingo"] }, { "country": "Ecuador", "timezones": ["America/Guayaquil", "Pacific/Galapagos"] }, { "country": "Egypt", "timezones": ["Africa/Cairo"] }, { "country": "El Salvador", "timezones": ["America/El_Salvador"] }, { "country": "Eritrea", "timezones": ["Africa/Asmara"] }, { "country": "Estonia", "timezones": ["Europe/Tallinn"] }, { "country": "Ethiopia", "timezones": ["Africa/Addis_Ababa"] }, { "country": "Faroe Islands", "timezones": ["Atlantic/Faroe"] }, { "country": "Finland", "timezones": ["Europe/Helsinki"] }, { "country": "France", "timezones": ["Europe/Paris"] }, { "country": "Georgia", "timezones": ["Asia/Tbilisi"] }, { "country": "Germany", "timezones": ["Europe/Berlin", "Europe/Busingen"] }, { "country": "Greece", "timezones": ["Europe/Athens"] }, { "country": "Greenland", "timezones": ["America/Godthab", "America/Danmarkshavn", "America/Scoresbysund", "America/Thule"] }, { "country": "Guatemala", "timezones": ["America/Guatemala"] }, { "country": "Haiti", "timezones": ["America/Port-au-Prince"] }, { "country": "Honduras", "timezones": ["America/Tegucigalpa"] }, { "country": "Hong Kong SAR", "timezones": ["Asia/Hong_Kong"] }, { "country": "Hungary", "timezones": ["Europe/Budapest"] }, { "country": "Iceland", "timezones": ["Atlantic/Reykjavik"] }, { "country": "India", "timezones": ["Asia/Kolkata", "Asia/Calcutta"] }, { "country": "Indonesia", "timezones": ["Asia/Jakarta", "Asia/Pontianak", "Asia/Makassar", "Asia/Jayapura"] }, { "country": "Iran", "timezones": ["Asia/Tehran"] }, { "country": "Iraq", "timezones": ["Asia/Baghdad"] }, { "country": "Ireland", "timezones": ["Europe/Dublin"] }, { "country": "Israel", "timezones": ["Asia/Jerusalem"] }, { "country": "Italy", "timezones": ["Europe/Rome"] }, { "country": "Jamaica", "timezones": ["America/Jamaica"] }, { "country": "Japan", "timezones": ["Asia/Tokyo"] }, { "country": "Jordan", "timezones": ["Asia/Amman"] }, { "country": "Kazakhstan", "timezones": ["Asia/Almaty", "Asia/Qyzylorda", "Asia/Aqtobe", "Asia/Aqtau", "Asia/Oral"] }, { "country": "Kenya", "timezones": ["Africa/Nairobi"] }, { "country": "Korea", "timezones": ["Asia/Seoul"] }, { "country": "Kuwait", "timezones": ["Asia/Kuwait"] }, { "country": "Kyrgyzstan", "timezones": ["Asia/Bishkek"] }, { "country": "Laos", "timezones": ["Asia/Vientiane"] }, { "country": "Latvia", "timezones": ["Europe/Riga"] }, { "country": "Lebanon", "timezones": ["Asia/Beirut"] }, { "country": "Libya", "timezones": ["Africa/Tripoli"] }, { "country": "Liechtenstein", "timezones": ["Europe/Vaduz"] }, { "country": "Lithuania", "timezones": ["Europe/Vilnius"] }, { "country": "Luxembourg", "timezones": ["Europe/Luxembourg"] }, { "country": "Macao SAR", "timezones": ["Asia/Macau"] }, { "country": "Macedonia, FYRO", "timezones": ["Europe/Skopje"] }, { "country": "Malaysia", "timezones": ["Asia/Kuala_Lumpur", "Asia/Kuching"] }, { "country": "Maldives", "timezones": ["Indian/Maldives"] }, { "country": "Mali", "timezones": ["Africa/Bamako"] }, { "country": "Malta", "timezones": ["Europe/Malta"] }, { "country": "Mexico", "timezones": ["America/Mexico_City", "America/Cancun", "America/Merida", "America/Monterrey", "America/Matamoros", "America/Mazatlan", "America/Chihuahua", "America/Ojinaga", "America/Hermosillo", "America/Tijuana", "America/Bahia_Banderas"] }, { "country": "Moldova", "timezones": ["Europe/Chisinau"] }, { "country": "Monaco", "timezones": ["Europe/Monaco"] }, { "country": "Mongolia", "timezones": ["Asia/Ulaanbaatar", "Asia/Hovd", "Asia/Choibalsan"] }, { "country": "Montenegro", "timezones": ["Europe/Podgorica"] }, { "country": "Morocco", "timezones": ["Africa/Casablanca"] }, { "country": "Myanmar", "timezones": ["Asia/Rangoon"] }, { "country": "Nepal", "timezones": ["Asia/Kathmandu"] }, { "country": "Netherlands", "timezones": ["Europe/Amsterdam"] }, { "country": "New Zealand", "timezones": ["Pacific/Auckland", "Pacific/Chatham"] }, { "country": "Nicaragua", "timezones": ["America/Managua"] }, { "country": "Nigeria", "timezones": ["Africa/Lagos"] }, { "country": "Norway", "timezones": ["Europe/Oslo"] }, { "country": "Oman", "timezones": ["Asia/Muscat"] }, { "country": "Pakistan", "timezones": ["Asia/Karachi"] }, { "country": "Panama", "timezones": ["America/Panama"] }, { "country": "Paraguay", "timezones": ["America/Asuncion"] }, { "country": "Peru", "timezones": ["America/Lima"] }, { "country": "Philippines", "timezones": ["Asia/Manila"] }, { "country": "Poland", "timezones": ["Europe/Warsaw"] }, { "country": "Portugal", "timezones": ["Europe/Lisbon", "Atlantic/Madeira", "Atlantic/Azores"] }, { "country": "Puerto Rico", "timezones": ["America/Puerto_Rico"] }, { "country": "Qatar", "timezones": ["Asia/Qatar"] }, { "country": "Réunion", "timezones": ["Indian/Reunion"] }, { "country": "Romania", "timezones": ["Europe/Bucharest"] }, { "country": "Russia", "timezones": ["Europe/Kaliningrad", "Europe/Moscow", "Europe/Simferopol", "Europe/Volgograd", "Europe/Astrakhan", "Europe/Samara", "Europe/Ulyanovsk", "Asia/Yekaterinburg", "Asia/Omsk", "Asia/Novosibirsk", "Asia/Barnaul", "Asia/Novokuznetsk", "Asia/Krasnoyarsk", "Asia/Irkutsk", "Asia/Chita", "Asia/Yakutsk", "Asia/Khandyga", "Asia/Vladivostok", "Asia/Ust-Nera", "Asia/Magadan", "Asia/Sakhalin", "Asia/Srednekolymsk", "Asia/Kamchatka", "Asia/Anadyr"] }, { "country": "Rwanda", "timezones": ["Africa/Kigali"] }, { "country": "Saudi Arabia", "timezones": ["Asia/Riyadh"] }, { "country": "Senegal", "timezones": ["Africa/Dakar"] }, { "country": "Serbia", "timezones": ["Europe/Belgrade"] }, { "country": "Singapore", "timezones": ["Asia/Singapore"] }, { "country": "Slovakia", "timezones": ["Europe/Bratislava"] }, { "country": "Slovenia", "timezones": ["Europe/Ljubljana"] }, { "country": "Somalia", "timezones": ["Africa/Mogadishu"] }, { "country": "South Africa", "timezones": ["Africa/Johannesburg"] }, { "country": "Spain", "timezones": ["Europe/Madrid", "Africa/Ceuta", "Atlantic/Canary"] }, { "country": "Sri Lanka", "timezones": ["Asia/Colombo"] }, { "country": "Sweden", "timezones": ["Europe/Stockholm"] }, { "country": "Switzerland", "timezones": ["Europe/Zurich"] }, { "country": "Syria", "timezones": ["Asia/Damascus"] }, { "country": "Taiwan", "timezones": ["Asia/Taipei"] }, { "country": "Tajikistan", "timezones": ["Asia/Dushanbe"] }, { "country": "Thailand", "timezones": ["Asia/Bangkok"] }, { "country": "Trinidad and Tobago", "timezones": ["America/Port_of_Spain"] }, { "country": "Tunisia", "timezones": ["Africa/Tunis"] }, { "country": "Turkey", "timezones": ["Europe/Istanbul"] }, { "country": "Turkmenistan", "timezones": ["Asia/Ashgabat"] }, { "country": "Ukraine", "timezones": ["Europe/Kiev", "Europe/Uzhgorod", "Europe/Zaporozhye"] }, { "country": "United Arab Emirates", "timezones": ["Asia/Dubai"] }, { "country": "United Kingdom", "timezones": ["Europe/London"] }, { "country": "United States of America", "timezones": ["America/New_York", "America/Detroit", "America/Kentucky/Louisville", "America/Kentucky/Monticello", "America/Indiana/Indianapolis", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Indiana/Marengo", "America/Indiana/Petersburg", "America/Indiana/Vevay", "America/Chicago", "America/Indiana/Tell_City", "America/Indiana/Knox", "America/Menominee", "America/North_Dakota/Center", "America/North_Dakota/New_Salem", "America/North_Dakota/Beulah", "America/Denver", "America/Boise", "America/Phoenix", "America/Los_Angeles", "America/Anchorage", "America/Juneau", "America/Sitka", "America/Metlakatla", "America/Yakutat", "America/Nome", "America/Adak", "Pacific/Honolulu"] }, { "country": "Uruguay", "timezones": ["America/Montevideo"] }, { "country": "Uzbekistan", "timezones": ["Asia/Samarkand", "Asia/Tashkent"] }, { "country": "Venezuela", "timezones": ["America/Caracas"] }, { "country": "Vietnam", "timezones": ["Asia/Ho_Chi_Minh"] }, { "country": "Yemen", "timezones": ["Asia/Aden"] }, { "country": "Zimbabwe", "timezones": ["Africa/Harare"] }]

let showWAChatWidget, waHandler, hideWAChatWidget, setClassBS, closeWheel, getSpinTheWheelCode, countryCodeBitespeed;

const BSPD_CONTACT_ID_COOKIE_ID = "contactIdBitespeed";
const BSPD_CONTACT_PHONE_COOKIE_ID = "contactPhoneBitespeed";
const BSPD_CONTACT_EMAIL_COOKIE_ID = "contactEmailBitespeed";
const BSPD_UNIQUE_IMPRESSION_COOKIE_ID = "bspdUniqueImpression";
const LAST_VISITED_PAGE_COOKIE_ID = "bspd_last_visited_page";
const BSPD_DEV_TEST_POPUP_ID = "bspdDevTestPopupId";

const DISABLE_CACHING_STORES = ["gant-india.myshopify.com"];
const POPUP_JSONS_KEY = "bitespeedPopupJsons";
const POPUP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

let globalLocationData = {};
const LOCATION_CACHE_KEY = "bspdLocationData";
const LOCATION_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

let globalBackendService = null;
let bitespeed_popups,
  bspdCurrentPopup,
  currentCW,
  product_id_liquid = window.product_id,
  variant_id_liquid = window.current_variant;

let bspdProductChangesOnCart = { added: [], removed: [] },
  lastCartData = {};

let copyElementTimeout;
const ERROR_TEXT_ID = "bitespeedErrorTextElement";
const defaultBorderStyle = {};

window.productsAddedToCartUsingCSP = [];
window.totalCartTrackerCnt = 0;
window.totalCartTrackerInvocationCnt = 0;

class Util {
  static create_UUID = () => {
    try {
      return uuid.v4();
    } catch {
      let dt = Date.now();
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
    }
  };
}

class BspdAPI {
  constructor() {
    this.baseUrl = "https://popups.bitespeed.co";
  }

  get = async (url, query = "") => {
    const response = await fetch(`${this.baseUrl}${url}${query.length > 0 ? `?${query}` : ""}`);
    return response.json();
  };

  post = async (url, body, temporaryURL = "") => {
    const targetUrl = temporaryURL || `${this.baseUrl}${url}`;
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(body),
    });
    return response.json();
  };
}

class BrowserService {
  #browserId = "";
  #shopDomain = "";
  #blockedPopups = [];
  location = null;
  isPhone = window.innerWidth < 508;

  constructor() {
    this.setBrowserId();
    this.#setShopDomain();
    this.#setBlockedPopups();
  }

  getCookie = (cookie) => {
    const cookieJson = {};
    document.cookie.split(";").forEach((el) => {
      const [k, v] = el.split("=");
      cookieJson[k.trim()] = v;
    });
    return cookieJson[cookie];
  };

  setCookie = (cookie, value, days, minutes = 0) => {
    let expires = "";
    if (days && days > 0) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    if (minutes && minutes > 0) {
      const date = new Date();
      date.setTime(date.getTime() + minutes * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = cookie + "=" + (value || "") + expires + "; path=/";
  };

  setBrowserId = (newId = null) => {
    if (newId) this.setCookie("refb", newId, 50);
    let refb = this.getCookie("refb");
    if (!refb || refb?.length == 0) {
      refb = Util.create_UUID();
      this.setCookie("refb", refb, 50);
    }
    this.#browserId = refb;
  };

  #setShopDomain = () => {
    const indexOfwww = location.hostname.indexOf("www");
    const shopDomain = indexOfwww === -1 ? location.hostname : location.hostname.substr(indexOfwww + 4);
    this.#shopDomain = shopDomain;
  };

  #setBlockedPopups = () => {
    const blockedPopups = this.getCookie("blockedPopups");
    if (blockedPopups && blockedPopups.length > 0) {
      this.#blockedPopups = blockedPopups.split(",");
    } else {
      this.#blockedPopups = [];
    }
  };

  getShopDomain = () => {
    return this.#shopDomain;
  };

  getBrowserId = () => {
    return this.#browserId;
  };

  getBlockedPopups = () => {
    return this.#blockedPopups;
  };

  updateBlockedPopups = (popupId) => {
    this.#blockedPopups.push(popupId);
    this.setCookie("blockedPopups", this.#blockedPopups.join(","));
  };

  // getLocation = async () => {
  // const response = await fetch("https://ipapi.co/json/");
  // const data = await response.json();
  // this.location = data;
  // };
}

function replaceHtmlEntities(str = "") {
  const entities = {
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&apos;": "'",
    "&nbsp;": " ",
    "&copy;": "©",
    "&reg;": "®",
    "&#39;": "'",
    "&#60;": "<",
    "&#62;": ">",
    "&#38;": "&",
    "&#34;": '"',
    "&#x27;": "'",
    "&#x3C;": "<",
    "&#x3E;": ">",
    "&#x3c;": "<",
    "&#x3e;": ">",
  };

  return str.replace(/&[a-zA-Z#0-9]+;/g, (match) => entities[match] || match);
}

function arrayBufferToBase64(buffer) {
  return window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function urlBase64ToUint8Array(base64String) {
  const base64 = (base64String + "=".repeat((4 - (base64String.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(window.atob(base64), (c) => c.charCodeAt(0));
}

function getBrowserName() {
  const ua = navigator.userAgent;
  const browsers = [
    { regex: /Edg/, name: "edge", log: "You are using Microsoft Edge" },
    { regex: /Chrome/, name: "chrome", log: "You are using Google Chrome", exclude: /Edg/ },
    { regex: /Firefox/, name: "firefox", log: "You are using Mozilla Firefox" },
    { regex: /Safari/, name: "safari", log: "You are using Apple Safari", exclude: /Chrome/ },
  ];

  for (const { regex, name, log, exclude } of browsers) {
    if (regex.test(ua) && (!exclude || !exclude.test(ua))) {
      return name;
    }
  }

  return "other";
}

async function subscribeUserToPush(registerImpression, setCookie, registration, popupId, popupType) {
  const existingSub = await registration.pushManager.getSubscription();
  if (existingSub) return;

  registerImpression(popupId);

  const vapidPublicKey = "BMSR8tXlLJOlANI7T5d2zhtzfBgW54OsaNX0K79JoOUlxSZz20vJE3cpmJAUtnpRIyAqEM-rp5h8AhxdyXOL3Ws";

  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const { endpoint } = subscription;
    const keys = {
      auth: arrayBufferToBase64(subscription.getKey("auth")),
      p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
    };

    const response = await bitespeed_popups[`${popupId}:bitespeed_popup`].handleConversion(
      {},
      { getDiscount: false, requiredDiscount: {} },
      {
        popupType: "webpush",
        webPushSubscription: { endpoint, keys, browser: getBrowserName() },
      },
    );

    const contactId = response?.results?.[1]?.value?.id || response?.results?.[1]?.id;

    const bsPopup = bitespeed_popups[`${popupId}:bitespeed_popup`];
    bsPopup.browserService.setCookie("contactIdBitespeed", contactId, 1000);
    bsPopup.browserService.setCookie("bspdPushId", endpoint, 1000);
  } catch (error) {
    if (Notification.permission === "denied") return;
  }
}

function performPostConversionBrandActions(data) {
  const shopURL = Shopify.shop || "";
  const { email = "", name = "", phone = "", country = "" } = data || {};

  if (!shopURL) return;

  if (shopURL === "avishya2021.myshopify.com") {
    const clabuid = window.CLabsgbVar?.generalProps?.uid;

    fetch("https://hook.customerlabs.co/source/whats-app_lead-1833", {
      method: "POST",
      body: JSON.stringify({
        account: { id: 897, name: "avishya2021" },
        cluid: clabuid,
        name: name || undefined,
        phone_number: phone ? `+${country}${phone}` : undefined,
        email: email || undefined,
        additional_attributes: {},
        avatar: "",
        custom_attributes: {},
        event: "contact_created",
        headers: {
          Baggage:
            "sentry-environment=production,sentry-release=6264dc822bb66f029b2a22ea6dc1d15577604095,sentry-public_key=831468f3d754434094a06b9c151f5520,sentry-trace_id=148227202ebf415bb0e51d110d7eb1c4",
          Connection: "upgrade",
          "Content-Length": "261",
          "Sentry-Trace": "148227202ebf415bb0e51d110d7eb1c4-91807a0b1bf842a6",
          "X-Real-Ip": "10.1.5.129",
        },
        id: 12038169,
        identifier: null,
        thumbnail: "",
      }),
    });
  } else if (email && shopURL === "lachicos.myshopify.com") {
    const token =
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiNTQwNTBkNzRlNTRlNjQ1YjRhNWRkODgxNzA0MzFjYTcwMzE4N2JhNTM2OGU0OWEyY2E3NDJlNzFlZDY3OTBjMzc3ZjgzNTliMjgxNTk5NjUiLCJpYXQiOjE3NjE1NDU0ODEuMjIzNDIxLCJuYmYiOjE3NjE1NDU0ODEuMjIzNDIzLCJleHAiOjQ5MTcyMTkwODEuMjE2OTUxLCJzdWIiOiIxNzQ5Mjg2Iiwic2NvcGVzIjpbXX0.v-UFvNuQziP8ztKeGOJAWEW-T83iBFjzXcKRGs9-h_hTpiB0q3HCX5m104uSr_H5PalEycgPHCsu4dvbhfzTCbOEIyAq5WlOe08SoK-S1USDYAPw7chLnS5tF0YNADMicqQJhB1N-OVUvPKyUqAYcqpEiAv54G-oubVHyq_KP7kp_GVqLBEgDl8gUjGJGGue1INZgvPicnF2UOeXtASHUmi2qU1Ch5JVbc-0xR6ditHQabdgg7NMsWz3LD1j1QEgb-ThKoCF4TMzCl_tKBJFnWiZrwpDG8-SD6Gi8h2CKkBNTHZmK4taKzSLHbJ8eBxSbhxsXjBWKo6wBVi2DQfezZRGTlyyrnvYXMkq_HAO3K0DNwVOvuwudJwsV01Jq6gsRcWt2FQMd4u4i6G-XN_eXdMr_9WYbxA51jNnA8LkIFLPjYKJt-jXZlkScSGCAWk--YwzNCkEHsckBV4yDaG8pGukiUwoJHPXuFPBnMmOxYy0XTq0WNKhwBe4PlHh8ilO2V6OUMwdGFCRz0QB1vacTdj9NKAN-_EbkKV5763t31YGmJ6YWNTy5RlvJLNBDuIUOZGQz_ck9kUKPLFqo6BI5Bn_-ESI2K-D45F6zWI6XEPxcGrasQF4ezyJOh6a77By7vG9DwKqGp6bIA2sWdzJJ7Fbd2CShOOzLeMtUj7iT14";

    fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email,
        fields: { name },
      }),
    });
  }
}

async function getUpdatedCartData(useBackup = false) {
  if (useBackup && Object.keys(lastCartData).length) return lastCartData;

  try {
    const res = await fetch("/cart.js");
    return await res.json();
  } catch {
    return null;
  }
}

async function clearCartData() {
  try {
    const res = await fetch("/cart/clear.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Failed to clear cart");
    return await res.json();
  } catch (err) {
    console.error("Error clearing cart:", err);
    return null;
  }
}

function findChangesOnCartData(oldCart, newCart) {
  if (!oldCart?.items) return { added: [], removed: [] };

  const diff = (a, b) => a.filter((itemA) => !b.some((itemB) => itemA.key === itemB.key));
  const result = {
    added: diff(newCart.items, oldCart.items),
    removed: diff(oldCart.items, newCart.items),
  };

  for (const oldItem of oldCart.items) {
    const newItem = newCart.items.find((i) => i.key === oldItem.key && i.quantity !== oldItem.quantity);
    if (!newItem) continue;

    const quantityChange = newItem.quantity - oldItem.quantity;
    const adjustedItem = { ...newItem, quantity: Math.abs(quantityChange) };

    (quantityChange > 0 ? result.added : result.removed).push(adjustedItem);
  }

  return result;
}

let bspdCurrentCartSubscriberCnt = 0;
const bspdCartDataSubscribers = new Map();
const subscribeToCartDataChangeEvent = (callback) => {
  if (typeof callback !== "function") {
    throw new TypeError("Callback must be a function");
  }

  const id = ++bspdCurrentCartSubscriberCnt;
  bspdCartDataSubscribers.set(id, {
    callback,
    subscribedAt: new Date(),
    lastInvokedAt: null,
    timesInvoked: 0,
  });

  return {
    id,
    unsubscribe: () => bspdCartDataSubscribers.delete(id),
  };
};
const invokeCartDataChange = (newCartData, productAdded, productRemoved) => {
  for (const sub of bspdCartDataSubscribers.values()) {
    try {
      sub.callback(newCartData, productAdded, productRemoved);
      sub.lastInvokedAt = new Date();
      sub.timesInvoked++;
    } catch (err) {
      console.error("Error in cart data change callback:", err);
    }
  }
};
const observeCartDataChange = () => {
  const cartObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach(async (entry) => {
      const isRelevantRequest =
        ["xmlhttprequest", "fetch"].includes(entry.initiatorType) && /\/cart\//.test(entry.name);

      if (!isRelevantRequest) return;

      const [newCartData, oldCartData] = await Promise.all([
        getUpdatedCartData(),
        Promise.resolve(JSON.parse(localStorage.getItem("bspdCart") || '{"items": []}')),
      ]);

      let changes = findChangesOnCartData(oldCartData, newCartData);

      // Handle session-level change tracking using lastCartData
      if (!changes.added.length && !changes.removed.length) {
        changes = findChangesOnCartData(lastCartData, newCartData);
      }

      invokeCartDataChange(newCartData, changes.added.length > 0, changes.removed.length > 0);
    });
  });

  cartObserver.observe({ entryTypes: ["resource"] });
};

function blenderizer9000(gibberish) {
  return new TextEncoder().encode(gibberish);
}
function juiceIt(bufferSoup) {
  return btoa(String.fromCharCode(...new Uint8Array(bufferSoup)));
}
function unJuiceIt(smoothie) {
  const pulp = atob(smoothie);
  return Uint8Array.from(pulp, (banana) => banana.charCodeAt(0));
}
async function sauceFactory(loveLetter, secretIngredient) {
  const sparkles = crypto.getRandomValues(new Uint8Array(12)); // secret IV juice

  const forbiddenScroll = await crypto.subtle.importKey("raw", blenderizer9000(secretIngredient), "PBKDF2", false, [
    "deriveKey",
  ]);

  const magicWand = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: sparkles,
      iterations: 100000,
      hash: "SHA-256",
    },
    forbiddenScroll,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );

  const hexedMessage = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: sparkles },
    magicWand,
    blenderizer9000(loveLetter),
  );

  return {
    waterCipher: juiceIt(hexedMessage),
    waterIv: juiceIt(sparkles),
  };
}

const AllViewPopupStringKind = [
  "OpenView",
  "Design1View",
  "Design2View",
  "Design3View",
  "Design4View",
  "Design5View",
  "CompletedView",
];

const getDiscountValue = (type = "percentage", amount = 0, value = 0) =>
  type === "percentage" ? (amount * value) / 100 : type === "fixed" ? value : 0;

const getDiscountedAmount = (type = "percentage", amount = 0, value = 0) =>
  amount - getDiscountValue(type, amount, value);

const autoFillCountryCode = (parentEle, selector) => {
  if (globalLocationData?.countryPhoneCode) {
    const countryCodeInput = parentEle.querySelector(selector);
    if (countryCodeInput?.options?.length && countryCodeInput.dataset.autofill === "true") {
      const code = String(globalLocationData.countryPhoneCode).replace("+", "");
      const hasMatch = [...countryCodeInput.options].some((opt) => opt.value.replace("+", "") === code);
      if (hasMatch) countryCodeInput.value = `+${code}`;
    }
  }
};

function sortObjectKeys(obj) {
  if (Array.isArray(obj)) {
    // Sort array elements AND their keys
    return obj.map(sortObjectKeys).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  } else if (obj && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObjectKeys(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

class PopupBS {
  #popupHtml = {};
  #secondaryPopupHtml = {};
  #popupBehaviour = "";
  #popupTargeting = "";
  #backendService = null;

  popupId = "";
  popupType = "";
  browserService = null;
  productId = "";
  variantId = "";
  popupTrigger = "";
  currentView = "";
  teaserSettings = {};
  teaserDisabled = false;
  alreadyShownTeaser = false;
  multiStepPopupFormdata = {};
  alreadyConverted = false;

  constructor(popupJson, browserService, backendService, view = "OpenView", webP13NComponent = "") {
    this.popupJson = popupJson;

    if (!webP13NComponent) {
      this.#popupHtml =
        !popupJson.type.includes("chat") && !popupJson.type.includes("stw") && !popupJson.type.includes("webPush")
          ? JSON.parse(this?.popupJson?.popupHtml)[view]
          : popupJson.type.includes("chat")
            ? JSON.parse(this?.popupJson?.popupHtml)["popupHtmlTop"]
            : this?.popupJson?.popupHtml;
    } else if (
      webP13NComponent === "bar" ||
      popupJson.type.includes("bar") ||
      webP13NComponent === "cross-sell-popup" ||
      popupJson.type.includes("cross-sell-popup")
    ) {
      this.#popupHtml = this.popupJson?.popupHtml;
    }

    this.#secondaryPopupHtml = popupJson.type.includes("chat")
      ? JSON.parse(this?.popupJson?.popupHtml)["popupHtmlBottom"]
      : null;

    this.currentView = view;
    this.teaserSettings = popupJson.unlayerJson?.Teaser || {};
    this.behaviour = popupJson.behaviour;
    this.popupId = popupJson.id;
    this.popupType = popupJson.type;
    this.#popupBehaviour = popupJson.behaviour;
    this.#popupTargeting = popupJson.targeting;
    this.discountType = this.getDiscountType(popupJson?.unlayerJson);
    this.DiscountCodeValuePercentage = this.findFieldInJson(popupJson?.unlayerJson, "DiscountCodeValuePercentage");
    this.DiscountCode = this.findFieldInJson(popupJson?.unlayerJson, "DiscountCode");
    this.browserService = browserService;
    this.#backendService = backendService;
  }

  getPopupHtml = () => this.#popupHtml;

  nextView = (discountCode = "__ __ __ __") => {
    document.querySelector(".u-popup-container")?.remove();
    document.querySelector(`#popup-iframe-open-${this.popupId}`)?.remove();

    const popupHtml = JSON.parse(this.popupJson.popupHtml);

    if (popupHtml["IntermediateView"] && this.currentView === "OpenView") {
      this.#popupHtml = popupHtml["IntermediateView"];
      this.currentView = "IntermediateView";
      this.show();
    } else if (popupHtml["CompletedView"] && this.currentView === "IntermediateView") {
      this.#popupHtml = popupHtml["CompletedView"];
      this.currentView = "CompletedView";
      this.show(discountCode, false);
    } else if (AllViewPopupStringKind.includes(this.currentView)) {
      for (let i = AllViewPopupStringKind.indexOf(this.currentView) + 1; i < AllViewPopupStringKind.length; i++) {
        const nextView = AllViewPopupStringKind[i];
        if (popupHtml[nextView]) {
          this.#popupHtml = popupHtml[nextView];
          this.currentView = nextView;
          this.show(discountCode, false);
          break;
        }
      }
    } else if (this.currentView !== "CompletedView" && popupHtml["CompletedView"]) {
      this.#popupHtml = popupHtml["CompletedView"];
      this.currentView = "CompletedView";
      this.show(discountCode, false);
    }
  };

  checkForNextViewAvailability = () => {
    const popupHtml = JSON.parse(this.popupJson.popupHtml);

    if (AllViewPopupStringKind.includes(this.currentView)) {
      const nextViewIndex = AllViewPopupStringKind.indexOf(this.currentView) + 1;
      const nextView = AllViewPopupStringKind[nextViewIndex];

      if (popupHtml[nextView]) {
        return { isNextViewAvailable: true, nextView };
      }
      return { isNextViewAvailable: true, nextView: "CompletedView" };
    }

    return { isNextViewAvailable: false, nextView: null };
  };

  updateVirtualStateForPopupNextViewIntent = async (popupFormData = {}) => {
    const updatedFormDataFields = {};
    for (const key in popupFormData) {
      if (this.multiStepPopupFormdata[key] === undefined && popupFormData[key] !== undefined) {
        updatedFormDataFields[key] = popupFormData[key];
      }
    }
    if (Object.keys(updatedFormDataFields).length > 0) {
      this.multiStepPopupFormdata = {
        ...this.multiStepPopupFormdata,
        ...updatedFormDataFields,
      };
    }
  };

  showSecondaryHtml = () => {
    if (!this.#secondaryPopupHtml) return;

    const iframe = document.createElement("iframe");
    iframe.id = "chat-popup-iframe-bottom";
    iframe.title = "BiteSpeed Popup Bottom";
    iframe.srcdoc = this.#secondaryPopupHtml;
    iframe.style.cssText = `
      position: fixed;
      ${
        !this.popupType.includes("chat")
          ? "top: 0;"
          : `bottom: ${parseInt(
              this.popupJson.unlayerJson?.Widget?.["Use different icon position for mobile"].selected &&
                this.browserService?.isPhone
                ? this.popupJson.unlayerJson?.Widget?.["Mobile Icon position"].attributes.bottom
                : this.popupJson.unlayerJson?.Widget?.["Icon position"].attributes.bottom,
            )}px;`
      }
      right: 0;
      ${this.popupJson.unlayerJson?.Widget?.["Icon position"]?.selected === "Left" ? "left: 0;" : ""}
      ${
        this.popupJson.unlayerJson?.Widget?.["Use different icon position for mobile"].selected &&
        this.browserService?.isPhone
          ? this.popupJson.unlayerJson?.Widget?.["Mobile Icon position"].selected === "Left"
            ? "left: 0; right: auto;"
            : "right: 0; left: auto;"
          : ""
      }
      height: 45px;
      margin-right: ${
        this.popupJson.unlayerJson?.Widget?.["Icon position"]?.selected === "Right"
          ? `${this.popupJson.unlayerJson?.Widget?.["Icon position"]?.attributes?.distance}px`
          : "auto"
      }; margin-left: ${
        this.popupJson.unlayerJson?.Widget?.["Icon position"]?.selected === "Left"
          ? `${this.popupJson.unlayerJson?.Widget?.["Icon position"]?.attributes?.distance}px`
          : "auto"
      };
      ${
        this.popupJson.unlayerJson?.Widget?.["Use different icon position for mobile"].selected &&
        this.browserService?.isPhone
          ? this.popupJson.unlayerJson?.Widget?.["Mobile Icon position"].selected === "Left"
            ? `margin-left: ${this.popupJson.unlayerJson?.Widget?.["Mobile Icon position"].attributes?.distance}px; margin-right: auto;`
            : `margin-right: ${this.popupJson.unlayerJson?.Widget?.["Mobile Icon position"].attributes?.distance}px; margin-left: auto;`
          : ""
      }
      z-index: ${Shopify.shop === "ugaoo-store.myshopify.com" ? 9 : 999999999};
      background-color: ${!this.popupType.includes("chat") ? "rgba(0, 0, 0, 0.5);" : ";"}
      border: none;
    `;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
      const widgetPreview = innerDoc.getElementById("WidgetPreview");
      if (widgetPreview) {
        iframe.style.width = `${Math.ceil(widgetPreview.getBoundingClientRect().width)}px`;
        if (
          this.popupJson.unlayerJson?.Widget?.["Use different icon position for mobile"].selected &&
          this.browserService?.isPhone
        ) {
          widgetPreview.style.float =
            this.popupJson.unlayerJson?.Widget?.["Mobile Icon position"].selected === "Left" ? "left" : "right";
        }
      }
    };
  };

  close = async () => {
    let currentViewIdSelector = `popup-iframe-open-${this.popupId}`;

    if (this.currentView === "OpenView") {
      currentViewIdSelector = `popup-iframe-open-${this.popupId}`;
      if (!this.alreadyConverted) {
        await this.#backendService.registerImpression(this.popupId, "closed");
      }
    } else if (this.currentView === "CompletedView") {
      currentViewIdSelector = `popup-iframe-completed-${this.popupId}`;
    } else if (
      this.currentView.includes("Design") &&
      this.currentView.includes("View") &&
      this.currentView.startsWith("Design")
    ) {
      currentViewIdSelector = `popup-iframe-${this.currentView}-${this.popupId}`;
      if (!this.alreadyConverted) {
        await this.#backendService.registerImpression(this.popupId, "closed");
      }
    }

    document.getElementById(currentViewIdSelector)?.remove();
    this.currentView = "OpenView";
  };

  toggleTeaser = (show = true) => {
    const popupHtml = JSON.parse(this.popupJson.popupHtml);
    const teaserHtml = popupHtml?.Teaser;
    let teaserIframe = document.querySelector(`#popup-teaser-${this.popupId}`);

    const teaserAlreadyViewed = getCookieGlobal(`viewed_teaser_${this.popupId}`);
    const lastVisitedPage = getCookieGlobal(LAST_VISITED_PAGE_COOKIE_ID);

    const dontShowTeaser =
      !show ||
      this.teaserDisabled ||
      (this.teaserSettings?.stopDisplaying === "page_change" &&
        teaserAlreadyViewed &&
        lastVisitedPage &&
        (lastVisitedPage?.length > 0 || lastVisitedPage !== window.location.href));

    if (dontShowTeaser) {
      teaserIframe?.remove();
      return false;
    }

    if (!teaserHtml || teaserIframe) return false;

    const teaserSize = this.teaserSettings?.size || "55";
    const teaserPosition = this.teaserSettings?.position || "bottom_left";
    const teaserHorizontalSpacing = this.teaserSettings?.spacing?.left;
    const teaserVerticalSpacing = this.teaserSettings?.spacing?.top;
    let position = "";

    switch (teaserPosition) {
      case "top_left":
        position = `top: ${teaserVerticalSpacing}px; left: ${teaserHorizontalSpacing}px;`;
        break;
      case "top_middle":
        position = `top: ${teaserVerticalSpacing}px; left: 50%; transform: translateX(-50%);`;
        break;
      case "top_right":
        position = `top: ${teaserVerticalSpacing}px; right: 0;`;
        break;
      case "bottom_left":
        position = `bottom: ${teaserVerticalSpacing}px; left: ${teaserHorizontalSpacing}px;`;
        break;
      case "bottom_middle":
        position = `bottom: ${teaserVerticalSpacing}px; left: 50%; transform: translateX(-50%);`;
        break;
      case "bottom_right":
        position = `bottom: ${teaserVerticalSpacing}px; right: 0;`;
        break;
      case "middle_left":
        position = `top: 50%; left: ${teaserHorizontalSpacing}px; transform: translateY(-50%);`;
        break;
      case "middle_right":
        position = `top: 50%; right: ${teaserHorizontalSpacing}px; transform: translateY(-50%);`;
        break;
      default:
        break;
    }

    teaserIframe = document.createElement("iframe");
    teaserIframe.id = `popup-teaser-${this.popupId}`;
    teaserIframe.srcdoc = teaserHtml;
    teaserIframe.style.cssText = `
      padding: 0;
      margin: 0;
      box-sizing: border-box;
      position: fixed;
      ${position}
      overflow: visible;
      z-index: 999999999;
      border: none;
      scrollbar-width: none;
      -ms-overflow-style: none;
    `;

    teaserIframe.onload = () => {
      const iframeDoc = teaserIframe.contentDocument || teaserIframe.contentWindow.document;
      const popupTeaser = iframeDoc.querySelector(".popup-teaser");
      if (popupTeaser) {
        teaserIframe.style.cssText = `
          padding: 0 !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          position: fixed;
          ${position}
          height: ${popupTeaser.offsetHeight}px !important;
          width: ${popupTeaser.offsetWidth + 5}px !important;
          overflow: visible !important;
          z-index: 999999999 !important;
          border: none !important;
          scrollbar-width: none;
          -ms-overflow-style: none;
        `;
        const teaserBody = iframeDoc.body;
        if (teaserBody) {
          teaserBody.style.cssText = `
            ${teaserBody.style.cssText};
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          `;
        }
      }
    };

    document.body.appendChild(teaserIframe);

    setCookieGlobal(`viewed_teaser_${this.popupId}`, "true", 5);
    setCookieGlobal(LAST_VISITED_PAGE_COOKIE_ID, window.location.href, 5);
    return true;
  };

  renderProductFeed = async (viewHtml = "") => {
    const storeCurrencySymbol = this.popupJson?.unlayerJson?.currency || "₹";
    const regex = /data-pfid="([^"]+?)BITESPEED"/;
    const match = viewHtml.match(regex);

    if (!match) return viewHtml;

    const pfid = match[1];
    let productsListToRender = [];
    const cartData = await getUpdatedCartData();

    if (cartData?.items?.length > 0) {
      productsListToRender = cartData.items.map((item) => ({
        ...item,
        productId: item.product_id,
        variantId: item.variant_id,
        title: item.title,
        image: item.image,
        handle: item.handle,
        price: item.price / 100,
        compareAtPrice: item.original_price / 100,
        linePrice: item.line_price / 100,
        originalLinePrice: item.original_line_price / 100,
        quantity: item.quantity,
        url: item.url,
      }));
    }

    if (!productsListToRender.length) return "";

    const discountValueString = this.DiscountCodeValuePercentage;
    const discountValue = discountValueString ? Number(discountValueString.replace(/%/g, "")) : 0;
    let discountType = "";
    if (discountValue > 0) {
      if (
        this.discountType === "Dynamic - Percentage" ||
        (this.discountType === "Static" && discountValueString.includes("%"))
      ) {
        discountType = "percentage";
      } else if (
        this.discountType === "Dynamic - Fixed Amount" ||
        (this.discountType === "Static" && !discountValueString.includes("%"))
      ) {
        discountType = "fixed";
      }
    }

    const originalCartValue = cartData.original_total_price / 100;
    const totalDiscountInCart = getDiscountValue(discountType, originalCartValue, discountValue);

    let replacedNumberOfProductsInView = 0;
    for (let i = 0; i < productsListToRender.length; i++) {
      const mainPFIDSelectorRoot = `{{${pfid}.${i}`;
      const productCompareAtPriceToShow = productsListToRender[i].originalLinePrice;
      const contributionToCart = (productCompareAtPriceToShow / originalCartValue) * 100;
      const discountAmountBasedOnContribution =
        discountType === "fixed" ? (discountValue * contributionToCart) / 100 : 0;

      const productPrice =
        discountType === "percentage"
          ? productCompareAtPriceToShow - (productCompareAtPriceToShow * discountValue) / 100
          : discountType === "fixed"
            ? productCompareAtPriceToShow - discountAmountBasedOnContribution
            : productCompareAtPriceToShow;

      const priceToShow = Math.max(productPrice, 0);
      const compareAtPriceToShow = priceToShow < productCompareAtPriceToShow ? productCompareAtPriceToShow : 0;

      const imageWithWidth = productsListToRender[i].image.includes("?")
        ? `${productsListToRender[i].image}&width=300`
        : `${productsListToRender[i].image}?width=300`;

      viewHtml = viewHtml
        .replaceAll(`${mainPFIDSelectorRoot}.Display}}`, "flex")
        .replaceAll(`${mainPFIDSelectorRoot}.Product_URL}}`, productsListToRender[i].url)
        .replaceAll(`${mainPFIDSelectorRoot}.Image_URL}}`, imageWithWidth)
        .replaceAll(
          `${mainPFIDSelectorRoot}.QuantityBadgeDisplay}}`,
          productsListToRender[i].quantity > 1 ? "flex" : "none",
        )
        .replaceAll(`${mainPFIDSelectorRoot}.Product_Quantity}}`, productsListToRender[i].quantity)
        .replaceAll(`${mainPFIDSelectorRoot}.Product_Only_Name}}`, productsListToRender[i].title)
        .replaceAll(`${mainPFIDSelectorRoot}.Product_Name}}`, productsListToRender[i].title)
        .replaceAll(
          `${mainPFIDSelectorRoot}.Product_Price}}`,
          `${storeCurrencySymbol}${priceToShow.toFixed(2).toLocaleString("en-IN")}`,
        )
        .replaceAll(
          `${mainPFIDSelectorRoot}.Product_CompareAtPriceDisplay}}`,
          compareAtPriceToShow > 0 ? "inline-block" : "none",
        )
        .replaceAll(
          `${mainPFIDSelectorRoot}.Product_CompareAtPrice}}`,
          `${storeCurrencySymbol}${compareAtPriceToShow.toFixed(2).toLocaleString("en-IN")}`,
        );

      replacedNumberOfProductsInView += 1;
    }

    for (let i = replacedNumberOfProductsInView; i < 1000; i++) {
      const mainPFIDSelectorRoot = `{{${pfid}.${i}`;
      viewHtml = viewHtml
        .replaceAll(`${mainPFIDSelectorRoot}.Display}}`, "none")
        .replaceAll(`${mainPFIDSelectorRoot}.Product_URL}}`, "")
        .replaceAll(`${mainPFIDSelectorRoot}.Image_URL}}`, "")
        .replaceAll(`${mainPFIDSelectorRoot}.QuantityBadgeDisplay}}`, "none")
        .replaceAll(`${mainPFIDSelectorRoot}.Product_Quantity}}`, "")
        .replaceAll(`${mainPFIDSelectorRoot}.Product_Only_Name}}`, "")
        .replaceAll(`${mainPFIDSelectorRoot}.Product_Name}}`, "")
        .replaceAll(`${mainPFIDSelectorRoot}.Product_Price}}`, "")
        .replaceAll(`${mainPFIDSelectorRoot}.Product_CompareAtPriceDisplay}}`, "none")
        .replaceAll(`${mainPFIDSelectorRoot}.Product_CompareAtPrice}}`, "");
    }

    viewHtml = viewHtml
      .replaceAll(
        `{{${pfid}.CartDiscountAmount}}`,
        `${storeCurrencySymbol}${totalDiscountInCart.toFixed(2).toLocaleString("en-IN")}`,
      )
      .replaceAll(
        `{{${pfid}.CartTotalAmount}}`,
        `${storeCurrencySymbol}${(originalCartValue - totalDiscountInCart).toFixed(2).toLocaleString("en-IN")}`,
      );

    return viewHtml;
  };

  attributeThisPopup = async (event = "popupPFInteracted") => {
    fetch(`${window.Shopify.routes.root}cart/update.js`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attributes: {
          bspdPopupId: this.popupId,
          createdBy: "bitespeed.co",
        },
      }),
    })
      .then(async () => {
        if (!this.alreadyConverted) {
          await this.#backendService.registerImpression(this.popupId, event);
          this.alreadyConverted = true;
        }
      })
      .catch((error) => {
        console.error("Error 2:", error);
      });
  };

  show = async (discountCode, showImpression = true, productDetails = {}) => {
    if (discountCode === "" && productDetails.popupTrigger && productDetails.productId && productDetails.variantId) {
      this.productId = productDetails.productId || "";
      this.variantId = productDetails.variantId || "";
      this.popupTrigger = productDetails.popupTrigger || "";
    }

    if (!this.popupType.includes("chat") || !this.popupType.includes("stw")) {
      document?.querySelector(".u-popup-container")?.remove();
    }

    this.#popupHtml = this.#popupHtml.replace(/\\n/g, "").replace(/`/g, "");
    if (discountCode && discountCode !== "__ __ __ __") {
      this.#popupHtml = this.#popupHtml.replace(/{{DISCOUNT_CODE}}/g, discountCode);
    }

    if (this.#popupHtml && (this.popupType.includes("chat") || this.popupType.includes("stw"))) {
      const isMobileForSpin = this.popupType.includes("stw") && window.matchMedia("(max-width: 600px)").matches;
      const spinWindowHeight =
        this.popupJson.unlayerJson?.ContentSettings?.["mobileSpinWindowHeight"]?.selected || "100";

      const iframe = document.createElement("iframe");
      iframe.title = "BiteSpeed Popup";
      iframe.id = this.popupType.includes("chat")
        ? "chat-popup-iframe"
        : this.popupType.includes("stw")
          ? "stw-popup-iframe"
          : "popup-iframe";
      iframe.srcdoc = this.#popupHtml;
      iframe.style.cssText = `
        position: fixed;
        ${
          !this.popupType.includes("chat")
            ? "top: 0;"
            : `bottom: ${parseInt(this.popupJson.unlayerJson?.Widget?.["Icon position"].attributes.bottom) + 64}px;`
        }
        right: 0;
        ${this.popupJson.unlayerJson?.Widget?.["Icon position"]?.selected === "Left" ? "left: 0;" : ""}
        width: ${!this.popupType.includes("chat") ? "100%;" : !this.browserService?.isPhone ? "380px;" : "100%;"}
        height: ${!this.popupType.includes("chat") ? "100%;" : "500px;"}
        margin-right: ${
          this.browserService?.isPhone
            ? "0px"
            : this.popupJson.unlayerJson?.Widget?.["Icon position"]?.selected === "Right"
              ? `${this.popupJson.unlayerJson?.Widget?.["Icon position"]?.attributes?.distance}px`
              : "auto"
        }; margin-left: ${
          this.browserService?.isPhone
            ? "0px"
            : this.popupJson.unlayerJson?.Widget?.["Icon position"]?.selected === "Left"
              ? `${this.popupJson.unlayerJson?.Widget?.["Icon position"]?.attributes?.distance}px`
              : "auto"
        };
        z-index: 999999999;
        background-color: ${!this.popupType.includes("chat") ? "rgba(0, 0, 0, 0.5);" : ";"}
        border: none;
        display: ${!this.popupType.includes("chat") ? "default;" : "none;"}
      `;

      this.showSecondaryHtml();

      iframe.onload = () => {
        postRenderOperations(this.popupId);
        const view = iframe.contentDocument;
        if (isMobileForSpin) {
          const wheelContainer = view.getElementById("wheelContainerBiteSpeed");
          if (wheelContainer) {
            wheelContainer.style.height = `${spinWindowHeight}%`;
            wheelContainer.style.bottom = "0px";
            wheelContainer.style.top = "auto";
            wheelContainer.style.overflowY = "auto";
          }
        }
        if (this.popupType.includes("stw")) autoFillCountryCode(view, "#STWBiteSpeedWAChatSelect");
        else if (this.popupType.includes("chat")) autoFillCountryCode(view, "#BiteSpeedWAChatSelect");
      };

      document.body.appendChild(iframe);

      if (showImpression) {
        this.#backendService.registerImpression(this.popupId);
      }
      this.browserService.setCookie(
        `view ${this.popupType}`,
        this.popupTrigger === "back_in_stock" ? "false" : "true",
        10,
      );
    } else if (this.#popupHtml) {
      if (this.currentView === "OpenView") {
        const popupHtml = JSON.parse(this.popupJson.popupHtml);

        let openViewIframe = document.querySelector(`#popup-iframe-open-${this.popupId}`);
        if (!openViewIframe) {
          const htmlWithProductFeed = await this.renderProductFeed(popupHtml["OpenView"]);
          if (!htmlWithProductFeed) return null;

          openViewIframe = document.createElement("iframe");
          openViewIframe.id = `popup-iframe-open-${this.popupId}`;
          openViewIframe.srcdoc = htmlWithProductFeed;
          openViewIframe.style.cssText = `
            position: fixed;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: 999999999;
            background-color: rgba(0, 0, 0, 0.5);
            border: none;
            left: -1000%;
          `;
        }

        let completedViewIframe = document.querySelector(`#popup-iframe-completed-${this.popupId}`);
        if (!completedViewIframe) {
          const htmlWithProductFeed = await this.renderProductFeed(popupHtml["CompletedView"]);
          if (!htmlWithProductFeed) return null;

          completedViewIframe = document.createElement("iframe");
          completedViewIframe.id = `popup-iframe-completed-${this.popupId}`;
          completedViewIframe.srcdoc = htmlWithProductFeed;
          completedViewIframe.style.cssText = `
            position: fixed;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: 999999999;
            background-color: rgba(0, 0, 0, 0.5);
            border: none;
            left: -1000%;
          `;
        }

        const displayPopup = (event) => {
          document.getElementById(`popup-iframe-open-${this.popupId}`).style.left = 0;
          if (showImpression) {
            this.#backendService.registerImpression(this.popupId);
          }
          this.browserService.setCookie(
            `view ${this.popupType}`,
            this.popupTrigger === "back_in_stock" ? "false" : "true",
            10,
          );
          event.target.removeEventListener("load", displayPopup);
          postRenderOperations(this.popupId);
        };

        openViewIframe.addEventListener(
          "load",
          (event) => {
            const teaserIframe = document.querySelector(`#popup-teaser-${this.popupId}`);
            const showTeaserOnInitialRender = () => {
              if (this.teaserSettings?.stopDisplaying === "visitor_converts" && this.isACustomer()) {
                displayPopup(event);
              } else {
                this.alreadyShownTeaser = true;
                this.toggleTeaser();
              }
            };
            if (this.teaserSettings?.showPopupOnInitialRender && !this.haveAlreadyViewed()) {
              displayPopup(event);
            } else if (
              this.teaserSettings?.startDisplaying === "before_popup" &&
              !teaserIframe &&
              this.alreadyShownTeaser !== true
            ) {
              showTeaserOnInitialRender();
            } else {
              displayPopup(event);
            }

            const popupIframe = openViewIframe.contentDocument;
            const nextViewButton = popupIframe.querySelector(".bitespeedNextButton");
            if (nextViewButton) nextViewButton.setAttribute("data-popupid", popupId);

            const copyDiscountButton = popupIframe.querySelector("#STWDicountBoxCopy");
            if (copyDiscountButton) copyDiscountButton.setAttribute("data-popupid", popupId);

            const crossButton = popupIframe.querySelector(".u-close-button");
            if (crossButton) crossButton.setAttribute("data-popupid", popupId);

            const backdropElement = popupIframe.querySelector(".u-popup-container");
            if (backdropElement) {
              backdropElement.onclick = () => closePopup({}, popupId);
            }

            const mainPopupContent = popupIframe.querySelector(".u-popup-main");
            if (mainPopupContent) {
              mainPopupContent.onclick = (event) => event.stopPropagation();
            }

            autoFillCountryCode(popupIframe, "#BiteSpeedDialCode");
          },
          { once: true },
        );

        const popupId = this.popupId;

        completedViewIframe.onload = function () {
          const popupIframe = completedViewIframe.contentDocument;
          const copyDiscountButton = popupIframe.querySelector("#STWDicountBoxCopy");
          if (copyDiscountButton) copyDiscountButton.setAttribute("data-popupid", popupId);

          const crossButton = popupIframe.querySelector(".u-close-button");
          if (crossButton) crossButton.setAttribute("data-popupid", popupId);

          const backdropElement = popupIframe.querySelector(".u-popup-container");
          if (backdropElement) {
            backdropElement.onclick = () => closePopup({}, popupId);
          }

          const mainPopupContent = popupIframe.querySelector(".u-popup-main");
          if (mainPopupContent) {
            mainPopupContent.onclick = (event) => event.stopPropagation();
          }

          autoFillCountryCode(popupIframe, "#BiteSpeedDialCode");
        };

        document.body.appendChild(openViewIframe);
        document.body.appendChild(completedViewIframe);

        const entirePopupViews = Object.keys(popupHtml);
        entirePopupViews.forEach(async (view) => {
          if (view !== "OpenView" && view !== "CompletedView" && view.startsWith("Design") && view.endsWith("View")) {
            let designViewIframe = document.querySelector(`popup-iframe-${view}-${this.popupId}`);
            if (!designViewIframe) {
              const htmlWithProductFeed = await this.renderProductFeed(popupHtml[view]);
              if (!htmlWithProductFeed) return;
              designViewIframe = document.createElement("iframe");
              designViewIframe.id = `popup-iframe-${view}-${this.popupId}`;
              designViewIframe.srcdoc = htmlWithProductFeed;
              designViewIframe.style.cssText = `
                position: fixed;
                top: 0;
                width: 100%;
                height: 100%;
                z-index: 999999999;
                background-color: rgba(0, 0, 0, 0.5);
                border: none;
                left: -1000%;
              `;

              const popupId = this.popupId;

              designViewIframe.onload = function () {
                const popupIframe = designViewIframe.contentDocument;
                const nextViewButton = popupIframe.querySelector(".bitespeedNextButton");
                if (nextViewButton) nextViewButton.setAttribute("data-popupid", popupId);

                const copyDiscountButton = popupIframe.querySelector("#STWDicountBoxCopy");
                if (copyDiscountButton) copyDiscountButton.setAttribute("data-popupid", popupId);

                const crossButton = popupIframe.querySelector(".u-close-button");
                if (crossButton) crossButton.setAttribute("data-popupid", popupId);

                const backdropElement = popupIframe.querySelector(".u-popup-container");
                if (backdropElement) {
                  backdropElement.onclick = () => closePopup({}, popupId);
                }

                const mainPopupContent = popupIframe.querySelector(".u-popup-main");
                if (mainPopupContent) {
                  mainPopupContent.onclick = (event) => event.stopPropagation();
                }

                autoFillCountryCode(popupIframe, "#BiteSpeedDialCode");
              };

              document.body.appendChild(designViewIframe);
            }
          }
        });
      } else if (this.currentView.startsWith("Design") && this.currentView.endsWith("View")) {
        const designViewIframe = document.getElementById(`popup-iframe-${this.currentView}-${this.popupId}`);
        const innerDoc = designViewIframe.contentDocument || designViewIframe.contentWindow.document;
        const discountCodeDiv = innerDoc.getElementById("STWDicountBox");
        if (discountCodeDiv && discountCode && discountCode !== "__ __ __ __") {
          discountCodeDiv.innerHTML = discountCode;
        }
        document.getElementById(`popup-iframe-open-${this.popupId}`)?.style.setProperty("left", "-1000%");
        AllViewPopupStringKind.forEach((view) => {
          if (view === this.currentView) return;
          if (view !== "OpenView" && view !== "CompletedView" && view.startsWith("Design") && view.endsWith("View")) {
            document.getElementById(`popup-iframe-${view}-${this.popupId}`)?.style.setProperty("left", "-1000%");
          }
        });
        designViewIframe.style.left = 0;
      } else {
        const completedViewIframe = document.getElementById(`popup-iframe-completed-${this.popupId}`);
        const innerDoc = completedViewIframe.contentDocument || completedViewIframe.contentWindow.document;
        const discountCodeDiv = innerDoc.getElementById("STWDicountBox");
        if (discountCodeDiv && discountCode && discountCode !== "__ __ __ __") {
          discountCodeDiv.innerHTML = discountCode;
        }
        document.getElementById(`popup-iframe-open-${this.popupId}`)?.style.setProperty("left", "-1000%");
        AllViewPopupStringKind.forEach((view) => {
          if (view !== "OpenView" && view !== "CompletedView" && view.startsWith("Design") && view.endsWith("View")) {
            document.getElementById(`popup-iframe-${view}-${this.popupId}`)?.style.setProperty("left", "-1000%");
          }
        });
        completedViewIframe.style.left = 0;
      }
    }
  };

  getDiscountType = (obj) => {
    if (obj?.DiscountCodeType) return obj.DiscountCodeType;
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        const result = this.getDiscountType(obj[key]);
        if (result) return result;
      }
    }
    return null;
  };

  findFieldInJson = (obj, field) => {
    if (obj?.[field]) return obj[field];
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        const result = this.findFieldInJson(obj[key], field);
        if (result) return result;
      }
    }
    return null;
  };

  passWhereCondition = (Where) => {
    const currentUrl = window.location.href.split("?")[0].replace(/\/+$/, "");
    const showPages = this.shouldShowOnPage(Where["Pages to show"], currentUrl);
    const notShowPages = this.shouldNotShowOnPage(Where["Pages NOT to show"], currentUrl);
    return this.applyDeviceFilters(Where["Devices"], showPages && notShowPages);
  };

  shouldShowOnPage = (pageConfig, currentUrl) => {
    if (pageConfig.selected === "All pages") return true;
    if (pageConfig.selected === "Specific pages") {
      const urls = pageConfig.attributes || [];
      return urls.some((url) => this.urlMatchesCondition(url, currentUrl));
    }
    return false;
  };

  shouldNotShowOnPage = (pageConfig, currentUrl) => {
    if (pageConfig.selected === "None") return true;
    if (pageConfig.selected === "Specific pages") {
      const urls = pageConfig.attributes || [];
      return !urls.some((url) => this.urlMatchesCondition(url, currentUrl));
    }
    return true;
  };

  urlMatchesCondition = (urlConfig, currentUrl) => {
    const targetUrl = (urlConfig.url || "").toString().replace(/\/+$/, "");
    switch (urlConfig.type) {
      case "Containing":
        return currentUrl.includes(targetUrl);
      case "Exactly Matching":
        return currentUrl === targetUrl;
      case "Starting With":
        return currentUrl.startsWith(targetUrl);
      case "Ending With":
        return currentUrl.endsWith(targetUrl);
      case "Match with Regex":
        return new RegExp(targetUrl).test(currentUrl);
      default:
        return false;
    }
  };

  applyDeviceFilters = (deviceConfig, baseCondition) => {
    if (!baseCondition) return false;
    switch (deviceConfig.selected) {
      case "All devices":
        return true;
      case "Desktop only":
        return !this.browserService?.isPhone;
      case "Mobile only":
        return !!this.browserService?.isPhone;
      default:
        return true;
    }
  };

  haveAlreadyViewed() {
    const existingCustomer = this.browserService.getCookie(`view ${this.popupType}`);
    const viewedPopup = localStorage.getItem(`bspdViewsCnt-${this.popupId}`);
    return !!(existingCustomer || Number(viewedPopup) > 1);
  }

  isACustomer = () => !!this.browserService.getCookie("contactIdBitespeed");

  hasAlreadyViewedPopup = () => {
    const viewedPopup = this.browserService.getCookie(`view ${this.popupType}`);
    return (
      (this.popupType === "visual popup" || this.popupType === "stw") &&
      (viewedPopup === "true" || viewedPopup === true)
    );
  };

  shouldStopShowingPopup = (Who) => {
    let stopShowingCondition = false;
    const stopShowingSelection = Who?.["Stop Showing"]?.selected;

    if (!stopShowingCondition) {
      const whenType = this.behaviour.When.selected;
      if (whenType === "When product is out of stock") {
        stopShowingCondition = false;
      } else if (this.popupType === "stw" || this.popupType === "visual popup") {
        const alreadyShowsDaysAgo = this.getLastViewedDaysAgo();
        stopShowingCondition = alreadyShowsDaysAgo >= 1;
      }
    }

    if (stopShowingSelection) {
      stopShowingCondition = false;
      switch (stopShowingSelection) {
        case "Never stop showing":
          stopShowingCondition = false;
          break;
        case "After X Views":
          const viewsCntForPopup = localStorage.getItem(`bspdViewsCnt-${this.popupId}`);
          if (viewsCntForPopup && viewsCntForPopup !== "undefined" && Who["Stop Showing"].attributes) {
            const viewsCnt = parseInt(viewsCntForPopup);
            if (viewsCnt >= Who["Stop Showing"].attributes) {
              stopShowingCondition = true;
            }
          }
          break;
        default:
          if (this.popupType === "stw" || this.popupType === "visual popup") {
            const alreadyShowsDaysAgo = this.getLastViewedDaysAgo();
            stopShowingCondition = alreadyShowsDaysAgo >= 1;
          } else stopShowingCondition = false;
      }
    }

    return stopShowingCondition;
  };

  passWhoCondition = (Who, Version = 2) => {
    if (!Who) return true;

    if (Version === 2 || (Who["By Frequency"] && Who["By Visitor"])) {
      if (Who?.["Stop Showing"]?.selected && this.shouldStopShowingPopup(Who)) return false;

      let frequencyCondition = false;
      const frequencySelection = Who?.["By Frequency"]?.selected;
      const visitorSelection = Who["By Visitor"].selected;

      switch (frequencySelection) {
        case "Show only once":
          frequencyCondition = !this.hasAlreadyViewedPopup();
          break;
        case "Show on every page load":
          frequencyCondition = true;
          break;
        case "Show every X days":
          const alreadyShowsDaysAgo = this.getLastViewedDaysAgo();
          if (alreadyShowsDaysAgo > 0 || alreadyShowsDaysAgo === 0) {
            frequencyCondition = alreadyShowsDaysAgo >= Who["By Frequency"].attributes;
          } else if (alreadyShowsDaysAgo === null) {
            frequencyCondition = true;
            this.updateLastViewedDate();
          }
          break;
        default:
          frequencyCondition = false;
      }
      if (frequencySelection && !frequencyCondition) return false;

      switch (visitorSelection) {
        case "Show to only visitors":
        case "Show to all visitors":
        case "Dont show to existing customers":
          return !this.isACustomer();
        case "Show to only subscribers":
        case "Show to all subscribers":
          return this.isACustomer();
        case "Show to both subscribers & visitors":
        case "Show to all subscribers & visitors":
          return true;
        case "Show to any returning visitors":
          const storageKey = `last-viewed-popup-${this.popupId}`;
          const lastView = localStorage.getItem(storageKey);
          return !!lastView;
      }
    }

    if (Who["By Visitor"] && Version !== 2) {
      const visitorSelection = Who["By Visitor"].selected;
      if ((this.popupType === "stw" || this.popupType === "visual popup") && this.shouldStopShowingPopup(Who))
        return false;

      if (this.behaviour.When.selected === "When product is out of stock") return true;
      if (visitorSelection === "Show to all subscribers & visitors") return true;
      switch (visitorSelection) {
        case "Show to all visitors":
          return !this.isACustomer();
        case "Dont show to existing customers":
        case "Show only once to each customer":
          return !this.isACustomer();
        case "Show to all subscribers on every visit":
          return this.isACustomer();
        case "Show only once per subscriber":
          return this.isACustomer() && !this.hasAlreadyViewedPopup();
        case "Show to customer at interval of days":
          return this.handleIntervalBasedDisplay(Who["By Visitor"].attributes);
      }
    }

    if (this.isACustomer() && this.hasAlreadyViewedPopup()) return false;
    return true;
  };

  getLastViewedDaysAgo = () => {
    const storageKey = `last-viewed-popup-${this.popupId}`;
    const lastView = localStorage.getItem(storageKey);
    if (lastView) {
      const lastViewDate = new Date(lastView);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate - lastViewDate);
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    return null;
  };

  updateLastViewedDate = () => {
    const storageKey = `last-viewed-popup-${this.popupId}`;
    localStorage.setItem(storageKey, new Date().toString());
  };

  handleIntervalBasedDisplay = (intervalDays = 1, skipContactIdCheck = false) => {
    const bitespeedContactId = getCookieGlobal("contactIdBitespeed");
    if (!skipContactIdCheck && bitespeedContactId) return false;

    const storageKey = `last-viewed-popup-${this.popupId}`;
    const lastView = localStorage.getItem(storageKey);

    if (!lastView) {
      this.updateLastViewedDate();
      return true;
    }

    const lastViewDate = new Date(lastView);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - lastViewDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= intervalDays) {
      localStorage.setItem(storageKey, new Date().toString());
      return true;
    }
    return false;
  };

  shouldShowForThisCountry = (Who) => {
    const selected = Who["By Location"].selected;
    if (selected.includes("Show to all countries")) return true;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const attributes = Who["By Location"].attributes;

    const userCountry = globalLocationData?.country || "";
    if (userCountry && attributes.includes(userCountry)) {
      if (selected.includes("Show to specific countries")) return true;
      if (selected.includes("Dont show to specific countries")) return false;
    }
    const countryMappedTZ = countryTimezoneMapping.filter(({ timezones }) => timezones.includes(timezone));
    if (countryMappedTZ.length === 1) {
      const { country } = countryMappedTZ[0];
      if (attributes.includes(country)) {
        if (selected.includes("Show to specific countries")) return true;
        if (selected.includes("Dont show to specific countries")) return false;
      }
    }
    return false;
  };

  shouldShowForIndianStates = async (Who) => {
    const selected = String(Who["By Location"].selected).toLowerCase();
    if (selected.includes("show to all indian states")) return true;

    return new Promise((resolve) => {
      const stateAttributes = Who["By Location"].attributes;
      const lowecasedStates = stateAttributes.map((state) => state.toLowerCase());
      const localData = localStorage.getItem("userLiesInState");
      if (localData && localData.includes("matchedState") && localData.includes("expiryDate")) {
        const data = JSON.parse(localData);
        const expiryDate = new Date(data.expiryDate);
        const currentDate = new Date();
        if (currentDate < expiryDate && data.matchedState) {
          return resolve(lowecasedStates.includes(String(data.matchedState).toLowerCase()));
        }
      }
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            try {
              const res = await this.#backendService.checkIfUserLiesInStates(stateAttributes, [longitude, latitude]);
              const response = res.result;
              let isUserInState = response.result;
              let matchedState = response.matchedState;
              let expiryDate = response.expiryDate;

              if (isUserInState === true) {
                localStorage.setItem(
                  "userLiesInState",
                  JSON.stringify({
                    matchedState,
                    expiryDate: expiryDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                  }),
                );
                if (selected.includes("show to specific indian states") && !selected.includes("don't")) resolve(true);
                if (selected.includes("don't show to specific indian states")) resolve(false);
              } else {
                if (selected.includes("show to specific indian states") && !selected.includes("don't")) resolve(false);
                if (selected.includes("don't show to specific indian states")) resolve(true);
              }
            } catch {
              resolve(false);
            }
          },
          () => resolve(false),
        );
      } else {
        resolve(true);
      }
    });
  };

  shouldShowForCurrentRegion = async (Who) => {
    if (!Who || !Who["By Location"]) return true;
    const selected = (Who["By Location"].selected || "").toLowerCase();
    if (selected.includes("countries")) return this.shouldShowForThisCountry(Who);
    if (selected.includes("states")) return this.shouldShowForIndianStates(Who);
    return true;
  };

  shouldShowToTrafficSourceV2 = (TrafficSource) => {
    if (!TrafficSource.Params.length) return true;
    const { Match, Params } = TrafficSource;
    const urlParams = new URLSearchParams(window.location.search);

    if (Match === "All") {
      return Params.every((param) => urlParams.get(param.paramName) === param.paramValue);
    } else if (Match === "Any") {
      return Params.some((param) => urlParams.get(param.paramName) === param.paramValue);
    } else if (Match === "None") {
      return Params.every((param) => urlParams.get(param.paramName) !== param.paramValue);
    }
    return false;
  };

  ifPassedNumberCondition = async (condition, conditionValue, actualValue) => {
    switch (condition) {
      case "greater than":
        return actualValue > conditionValue;
      case "less than":
        return actualValue < conditionValue;
      case "equals to":
        return actualValue === conditionValue;
      case "not equals to":
        return actualValue !== conditionValue;
      case "greater than or equals to":
        return actualValue >= conditionValue;
      case "less than or equals to":
        return actualValue <= conditionValue;
      default:
        return false;
    }
  };

  ifPassedBooleanCondition = async (condition, actualValue) => {
    if (condition === "true" || condition === true) return actualValue;
    if (condition === "false" || condition === false) return !actualValue;
    return false;
  };

  shouldShowToUserInteractionV2 = async (UserInteraction) => {
    if (!UserInteraction || !UserInteraction.Triggers.length) return true;
    const { Match, Triggers: UTTriggers } = UserInteraction;

    const matches = await Promise.all(
      UTTriggers.map(async (trigger) => {
        const { Event, Condition, Value, Array: ArrayValue, ExtraAttribute } = trigger;
        const condition = (Condition + "").toLowerCase();
        let cartData, productData, collectionData;

        if (Event === "No Event Selected") return true;

        if (Event === "On Cart Created") {
          if (
            (window.location.pathname.includes("cart") || window.location.pathname.includes("checkout")) &&
            this.popupJson.type === "cross-sell-popup"
          ) {
            return false;
          }
          return new Promise((resolve) => {
            window.totalCartTrackerCnt += 1;
            const cartDataSub = subscribeToCartDataChangeEvent(async (newCartData, isAnyProductAddedToCart) => {
              if (isAnyProductAddedToCart) {
                const oldCartData = JSON.parse(localStorage.getItem("bspdCart")) || { items: [] };
                let changes = findChangesOnCartData(oldCartData, newCartData);
                if (changes.added.length === 0 && changes.removed.length === 0) {
                  changes = findChangesOnCartData(lastCartData, newCartData);
                }
                window.totalCartTrackerInvocationCnt += 1;
                if (changes.added.length > 0 || changes.removed.length > 0) {
                  bspdProductChangesOnCart = changes;
                  lastCartData = oldCartData;
                  if (window.totalCartTrackerInvocationCnt % window.totalCartTrackerCnt === 0) {
                    localStorage.setItem("bspdCart", JSON.stringify(newCartData));
                  }
                }
                const addedProductIsFromCSP =
                  window.productsAddedToCartUsingCSP.length > 0
                    ? window.productsAddedToCartUsingCSP.some((item) => item.id === changes.added[0]?.id)
                    : false;
                if (addedProductIsFromCSP) {
                  resolve(false);
                  cartDataSub.unsubscribe();
                  return;
                }
                if (changes.added.length <= 0) {
                  resolve(false);
                } else if (!ArrayValue.length) {
                  resolve(true);
                  cartDataSub.unsubscribe();
                } else {
                  const productsIdsInCart = changes.added.map((item) => item.product_id) || [];
                  if (ArrayValue.length > 0) {
                    if (condition === "contains") {
                      const toShow = ArrayValue.some((product) => productsIdsInCart.includes(product.id));
                      if (toShow) {
                        resolve(toShow);
                        cartDataSub.unsubscribe();
                      }
                    } else if (condition === "does not contains") {
                      const toShow = !ArrayValue.some((product) => productsIdsInCart.includes(product.id));
                      if (toShow) {
                        resolve(toShow);
                        cartDataSub.unsubscribe();
                      }
                    }
                  } else if (!ArrayValue.length) {
                    resolve(true);
                    cartDataSub.unsubscribe();
                  }
                }
              }
            });
          });
        }

        if (Event === "Is Cart Created") {
          try {
            cartData = BspdCurrentCart;
          } catch {}
          const isCartCreated = cartData && cartData.items && cartData.items.length > 0;
          return this.ifPassedBooleanCondition(condition, isCartCreated);
        }

        if (Event === "Total Cart Value") {
          try {
            cartData = BspdCurrentCart;
          } catch {}
          const value = isNaN(Value) ? 0 : Number(Value);
          const cartValue = cartData?.total_price / 100;
          return this.ifPassedNumberCondition(condition, value, cartValue);
        }

        if (Event === "Currently Visited Product") {
          try {
            productData = BspdCurrentProduct;
          } catch {}
          if (!productData) return false;
          if (condition === "contains") {
            return ArrayValue.some((product) => product.id === productData.id);
          } else if (condition === "does not contains") {
            return !ArrayValue.some((product) => product.id === productData.id);
          }
          return false;
        }

        if (Event === "Product Price") {
          try {
            productData = BspdCurrentProduct;
          } catch {}
          if (!productData) return false;
          const value = isNaN(Value) ? 0 : Number(Value);
          const productPrice = productData.price / 100;
          return this.ifPassedNumberCondition(condition, value, productPrice);
        }

        if (Event === "Product Variant Inventory Quantity") {
          try {
            productData = BspdCurrentProduct;
          } catch {}
          if (!productData) return false;
          const productInventoryQuantity = await this.#backendService.getQuickProductMetadata(
            window.Shopify.shop,
            [productData.id],
            ["inventoryQuantity"],
          );
          if (!productInventoryQuantity?.result?.[productData.id]) return false;
          const value = isNaN(Value) ? 0 : Number(Value);
          const variantsMetadata = {};
          productInventoryQuantity.result[productData.id].forEach((variant) => {
            variantsMetadata[variant.shopifyId] = { ...variant };
          });
          window.bspdPopupProductMetadata =
            {
              ...variantsMetadata,
              popupId: this.popupId,
              value,
              condition,
            } || {};
          return true;
        }

        if (Event === "Last Visited Product") {
          const lastVisitedProduct = this.browserService.getCookie("bspdLastVisitedProduct");
          if (!isNaN(lastVisitedProduct)) {
            const lastVisitedProductId = Number(lastVisitedProduct);
            if (condition === "contains") {
              return ArrayValue.some((product) => product.id === lastVisitedProductId);
            } else if (condition === "does not contains") {
              return !ArrayValue.some((product) => product.id === lastVisitedProductId);
            }
          }
          return false;
        }

        if (Event === "Currently Visited Collection") {
          try {
            collectionData = BspdCurrentCollection;
          } catch {}
          if (!collectionData) return false;
          if (condition === "contains") {
            return ArrayValue.some((collection) => collection.id === collectionData.id);
          } else if (condition === "does not contains") {
            return !ArrayValue.some((collection) => collection.id === collectionData.id);
          }
          return false;
        }

        if (Event === "Last Visited Collection") {
          const lastVisitedCollection = this.browserService.getCookie("bspdLastVisitedCollection");
          if (!isNaN(lastVisitedCollection)) {
            const lastVisitedCollectionId = Number(lastVisitedCollection);
            if (condition === "contains") {
              return ArrayValue.some((collection) => collection.id === lastVisitedCollectionId);
            } else if (condition === "does not contains") {
              return !ArrayValue.some((collection) => collection.id === lastVisitedCollectionId);
            }
          }
          return false;
        }

        if (Event === "Visit count in past(n) days") {
          const visitCountLocal = localStorage.getItem("bspdLastUserVisitCount") || "{}";
          const visitCount = JSON.parse(visitCountLocal);
          const lastNDaysToCheck = isNaN(ExtraAttribute) ? 0 : Number(ExtraAttribute);
          const currentDate = new Date();
          let count = 0;
          for (let i = 0; i < lastNDaysToCheck; i++) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split("T")[0];
            if (visitCount?.[dateString]) {
              count += visitCount[dateString].count;
            }
          }
          const value = isNaN(Value) ? 0 : Number(Value);
          return this.ifPassedNumberCondition(condition, value, count);
        }
      }),
    );

    if (Match === "All") {
      return matches.every((match) => match === true);
    } else if (Match === "Any") {
      return matches.some((match) => match === true);
    } else if (Match === "None") {
      return matches.every((match) => match === false);
    }
    return false;
  };

  shouldPassThroughConditionsV2 = async (behaviour) => {
    if (!behaviour?.TrafficSource && !behaviour?.UserInteraction) return true;
    const TrafficSource = behaviour.TrafficSource;
    const UserInteraction = behaviour.UserInteraction;
    const passedTrafficSourceV2 = behaviour?.TrafficSource ? this.shouldShowToTrafficSourceV2(TrafficSource) : true;
    if (!passedTrafficSourceV2) return false;
    const passedUserInteractionV2 = behaviour?.UserInteraction
      ? await this.shouldShowToUserInteractionV2(UserInteraction)
      : true;
    if (!passedUserInteractionV2) return false;
    return true;
  };

  shouldShowNowBasedOnTimeBasedTriggers = () => {
    const timeBasedTriggers = this.behaviour?.TimeBasedTrigger || {};
    if (!timeBasedTriggers?.type) return true;

    const currentTime = new Date();
    const currentDate = currentTime.getDate();
    const currentDay = currentTime.toLocaleString("en-US", { weekday: "long" });

    const currentTimeFallsInInterval = (startTimeStr, endTimeStr) => {
      const [startHour, startMinute, startPeriod] = startTimeStr.match(/(\d+):(\d+)\s?(AM|PM|am|pm)/i).slice(1);
      const [endHour, endMinute, endPeriod] = endTimeStr.match(/(\d+):(\d+)\s?(AM|PM|am|pm)/i).slice(1);
      let startDateTime = new Date(currentTime);
      let endDateTime = new Date(currentTime);
      startDateTime.setHours(
        startPeriod.toUpperCase() === "AM" ? Number(startHour) % 12 : (Number(startHour) % 12) + 12,
        Number(startMinute),
        0,
        0,
      );
      endDateTime.setHours(
        endPeriod.toUpperCase() === "AM" ? Number(endHour) % 12 : (Number(endHour) % 12) + 12,
        Number(endMinute),
        0,
        0,
      );
      return currentTime >= startDateTime && currentTime <= endDateTime;
    };

    switch (timeBasedTriggers.type) {
      case "all_time":
        return true;
      case "one_time": {
        const startDate = new Date(timeBasedTriggers.startDate);
        const endDate = new Date(timeBasedTriggers.endDate);
        if (!startDate) return true;
        return currentTime >= startDate && currentTime <= endDate;
      }
      case "specific_hours": {
        const daysOfWeek = timeBasedTriggers.daysOfWeek || [];
        if (daysOfWeek.length > 0 && !daysOfWeek.includes(currentDay)) return false;
        const startTime = timeBasedTriggers.startTime;
        const endTime = timeBasedTriggers.endTime;
        if (startTime && endTime) {
          return currentTimeFallsInInterval(startTime, endTime);
        }
        return true;
      }
      case "multiple_times_a_day": {
        const intervals = timeBasedTriggers.intervals || [];
        if (!intervals.length) return true;
        for (const interval of intervals) {
          if (currentTimeFallsInInterval(interval.start, interval.end)) return true;
        }
        return false;
      }
      case "few_days_a_week": {
        const daysOfWeek = timeBasedTriggers.daysOfWeek || [];
        if (!daysOfWeek.length) return true;
        return daysOfWeek.includes(currentDay);
      }
      case "few_days_a_month": {
        const daysOfMonth = timeBasedTriggers.daysOfMonth || [];
        if (!daysOfMonth.length) return true;
        return daysOfMonth.includes(currentDate);
      }
      default:
        return true;
    }
  };

  addPopupTrigger = async () => {
    return new Promise(async (resolve) => {
      const timeBasedTriggers = this.behaviour?.TimeBasedTrigger || {};
      if (timeBasedTriggers?.type && !this.shouldShowNowBasedOnTimeBasedTriggers()) {
        return resolve(false);
      }
      const whenType = this.behaviour.When.selected;
      const topLevelTriggers = ["X seconds after page load", "After scrolling X% of the page", "afterClick"];
      if (topLevelTriggers.includes(whenType)) {
        await this.handleTopLevelTrigger(whenType, resolve);
        return;
      }
      await this.handleRegularTrigger(whenType, resolve);
    });
  };

  handleTopLevelTrigger = async (whenType, resolve) => {
    const checkAfterTriggerConditions = async () => {
      if (this.behaviour.Version === 2) {
        if (!this.passWhereCondition(this.behaviour.Where) || !this.passWhoCondition(this.behaviour.Who, 2)) {
          return resolve(false);
        }
        const passedV2Conditions = await this.shouldPassThroughConditionsV2(this.behaviour);
        if (!passedV2Conditions) return resolve(false);
      }
      if (
        this.behaviour.Version !== 2 &&
        (!this.passWhereCondition(this.behaviour.Where) || !this.passWhoCondition(this.behaviour.Who, 1))
      ) {
        return resolve(false);
      }
      try {
        const shouldShow = await this.shouldShowForCurrentRegion(this.behaviour.Who);
        if (!shouldShow) return resolve(false);
        return resolve(true);
      } catch (err) {
        console.log(err, "Bspd Popup ERROR Code 7400");
        return resolve(false);
      }
    };

    switch (whenType) {
      case "X seconds after page load": {
        const delay = this.behaviour.When.attributes * 1000;
        setTimeout(checkAfterTriggerConditions, delay);
        break;
      }
      case "After scrolling X% of the page": {
        const scrollThreshold = this.behaviour.When.attributes;
        window.addEventListener("scroll", () => {
          const scrollTop = document.documentElement.scrollTop;
          const docHeight = Math.max(document.body.clientHeight, document.body.scrollHeight || 0);
          const winHeight = document.documentElement.clientHeight;
          const scrollPercent = scrollTop / (docHeight - winHeight);
          const scrollPercentRounded = Math.round(scrollPercent * 100);
          if (scrollPercentRounded >= scrollThreshold) {
            checkAfterTriggerConditions();
          }
        });
        break;
      }
      case "afterClick": {
        window.addEventListener("click", checkAfterTriggerConditions);
        break;
      }
    }
  };

  handleRegularTrigger = async (whenType, resolve) => {
    if (this.behaviour.Version === 2) {
      if (!this.passWhereCondition(this.behaviour.Where) || !this.passWhoCondition(this.behaviour.Who, 2)) {
        return resolve(false);
      }
      const passedV2Conditions = await this.shouldPassThroughConditionsV2(this.behaviour);
      if (!passedV2Conditions) return resolve(false);
    }
    if (
      this.behaviour.Version !== 2 &&
      (!this.passWhereCondition(this.behaviour.Where) || !this.passWhoCondition(this.behaviour.Who, 1))
    ) {
      return resolve(false);
    }
    this.shouldShowForCurrentRegion(this.behaviour.Who)
      .then((shouldShow) => {
        if (!shouldShow) return resolve(false);
        switch (whenType) {
          case "When product is out of stock": {
            const shopDomain = this.browserService.getShopDomain();
            initNotifyFrontendService(this.popupId, this.behaviour.When.attributeText, shopDomain);
            return resolve(false);
          }
          case "When an element is clicked on the page": {
            const idSelector = this.behaviour.When.attributeText;
            if (idSelector) {
              const idWithHash = `#${(idSelector + "").replaceAll("#", "").replaceAll(".", "")}`;
              const element = document.querySelector(idWithHash);
              if (element) {
                element.onclick = () => resolve(true);
              }
            }
            break;
          }
          case "Show immediately on page load":
            resolve(true);
            break;
          case "Show X minutes after cart created": {
            const minutes = Number(this.behaviour.When.attributes);
            if (!minutes) return resolve(false);
            const msInMinutes = 60 * 1000;
            const delayInMS = minutes * msInMinutes;
            let cartCreatedTimestamp = getCookieGlobal("bspd_cart_created_at")
              ? Number.parseInt(getCookieGlobal("bspd_cart_created_at"))
              : null;
            try {
              if (!BspdCurrentCart) return resolve(false);
              // if (BspdCurrentCart.items.length === 0 || BspdCurrentCart.items[0].quantity === 0) return resolve(false);
              if (cartCreatedTimestamp) {
                const minutesPassed = (Date.now() - cartCreatedTimestamp) / msInMinutes;
                if (minutesPassed >= minutes) {
                  return resolve(true);
                } else {
                  const remainingTimeToWait = cartCreatedTimestamp + delayInMS - Date.now();
                  setTimeout(() => resolve(true), remainingTimeToWait);
                }
              } else if (
                !cartCreatedTimestamp ||
                BspdCurrentCart.items.length === 0 ||
                BspdCurrentCart.items?.[0].quantity === 0
              ) {
                const cartDataSub = subscribeToCartDataChangeEvent(() => {
                  cartDataSub.unsubscribe();
                  const cartCreatedTimestamp = getCookieGlobal("bspd_cart_created_at") || Date.now();
                  if (cartCreatedTimestamp) {
                    const minutesPassed = (Date.now() - cartCreatedTimestamp) / msInMinutes;
                    if (minutesPassed >= minutes) {
                      resolve(true);
                    } else {
                      const remainingTimeToWait = cartCreatedTimestamp - Date.now() + delayInMS;
                      setTimeout(() => resolve(true), remainingTimeToWait);
                    }
                  }
                });
              }
            } catch (err) {
              console.error("Error in Show X minutes after cart created:", err);
              return resolve(false);
            }
            break;
          }
          case "When user is leaving a page": {
            if (this.browserService?.isPhone) {
              resolve(true);
              break;
            }
            window.addEventListener("mouseout", (e) => {
              if (e.clientY < 0) {
                resolve(true);
              }
            });
            break;
          }
          case "afterClick": {
            window.addEventListener("click", () => resolve(true));
            break;
          }
        }
      })
      .catch((err) => {
        console.log(err, "Bspd Popup ERROR Code 4006");
        return resolve(false);
      });
  };

  handleConversion = async (
    { country, phone, email, name, consentProvided = true, extraUserAttributes },
    { getDiscount, discountCode, requiredDiscount, staticDiscount },
    { listId, popupType, webPushSubscription },
  ) => {
    const res = await this.#backendService.registerConversion(
      this.popupId,
      {
        country: country?.replace(" ", "")?.replace("+", ""),
        phone,
        email,
        name,
        consentProvided,
        extraUserAttributes,
      },
      { getDiscount, discountCode, requiredDiscount, staticDiscount },
      {
        listId:
          typeof listId === "number"
            ? listId
            : typeof listId === "string" && listId !== ""
              ? Number.parseInt(listId)
              : null,
        popupType,
        webPushSubscription,
      },
      { productId: this.productId, variantId: this.variantId },
      { popupTrigger: this.popupTrigger },
    );
    this.alreadyConverted = true;
    const contactId = res?.results?.[1]?.value?.id || res?.results?.[1]?.id || res?.results?.contactId;
    if (res && contactId) this.browserService.setCookie("contactIdBitespeed", contactId, 1000);
    if (this.popupType === "visual popup" && this.teaserSettings?.stopDisplaying === "visitor_converts") {
      this.teaserDisabled = true;
    }
    return res;
  };

  preloadDiscount = async (getDiscount, requiredDiscount) => {
    await this.#backendService.getDiscountCode(this.popupId, getDiscount, requiredDiscount);
  };
}

class STWPopup extends PopupBS {
  constructor(popupJson, browserService, backendService) {
    super(popupJson, browserService, backendService);
    this.processFinalSliceData();
  }

  findPlateSettings = (obj) => {
    if (!obj) return null;
    if (obj.PlateSettings) return obj.PlateSettings;

    for (const key in obj) {
      if (obj[key] && typeof obj[key] === "object") {
        const result = this.findPlateSettings(obj[key]);
        if (result) return result;
      }
    }
    return null;
  };

  shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  selectPie = (pies) => {
    const shuffledPies = this.shuffle(Object.keys(pies));
    const totalProbability = shuffledPies.reduce((sum, pie) => sum + (parseFloat(pies[pie]) || 0), 0);

    let randomValue = Math.random() * totalProbability;
    for (const pie of shuffledPies) {
      const probability = parseFloat(pies[pie]);
      if (!isNaN(probability)) {
        if (randomValue < probability) return pie;
        randomValue -= probability;
      }
    }
    return null;
  };

  processFinalSliceData = () => {
    const plateSettings = this.findPlateSettings(this.popupJson?.unlayerJson || this.popupJson);
    if (!plateSettings?.totalPies) return;

    const pieProbabilities = {};
    for (let i = 1; i <= plateSettings.totalPies; i++) {
      const prob = plateSettings[`pie${i}`]?.prob;
      if (prob && prob !== 0 && prob !== "0") {
        pieProbabilities[`pie${i}`] = prob;
      }
    }

    const selectedPie = this.selectPie(pieProbabilities);
    if (selectedPie) {
      this.popupJson = { ...this.popupJson, selectedPie };
    }
  };
}

class VisualPopup extends PopupBS {
  constructor(popupJson, browserService, backendService) {
    super(popupJson, browserService, backendService);
  }
}

class ChatWidgetPopup extends PopupBS {
  constructor(popupJson, browserService, backendService) {
    super(popupJson, browserService, backendService);
  }
}

class BarPopup extends PopupBS {
  #backendService = null;
  alreadyRegisteredClickImpression = false;
  cartData = {};
  cartTotalValue = 0;

  constructor(popupJson, browserService, backendService) {
    super(popupJson, browserService, backendService, "", "bar");
    this.#backendService = backendService;

    this.addPopupTrigger().then((shouldShow) => {
      if (shouldShow) {
        this.show();
        const viewsCntKey = `bspdViewsCnt-${this.popupId}`;
        const viewsCnt = Number(localStorage.getItem(viewsCntKey)) || 0;
        localStorage.setItem(viewsCntKey, viewsCnt + 1);
      }
    });
  }

  show = async () => {
    const barHtml = this.getPopupHtml();
    const barConfig = this.popupJson.unlayerJson;
    const cartData = await getUpdatedCartData(true);
    this.cartData = cartData || {};
    this.cartTotalValue = cartData?.original_total_price ? cartData.original_total_price / 100 : 0;

    const barPosition = (barConfig?.bars?.map((bar) => bar.bar.position) || ["top"])[0] || "top";

    const announcementBar = document.createElement("iframe");
    announcementBar.id = `bspd-bar-iframe${this.popupId}`;
    Object.assign(announcementBar.style, {
      width: "100%",
      border: "0px solid white",
      zIndex: "68.2147483647",
      display: "block",
      lineHeight: "0",
    });

    if (barPosition === "top" || !barPosition) {
      const barPlacement = barConfig?.bars?.[0]?.progressBar?.design?.placement;
      const barPlacementSelector = barConfig?.bars?.[0]?.progressBar?.design?.placementSelector;
      const barPlacementSelectorMobile = barConfig?.bars?.[0]?.progressBar?.design?.placementSelectorMobile;
      const viewportWidth = window.innerWidth;

      if (barPlacement === "sticky_with_header") {
        const headerParent = document.querySelector(
          viewportWidth < 1025
            ? barPlacementSelectorMobile || ".sticky-header"
            : barPlacementSelector || ".sticky-header",
        );
        if (headerParent) {
          headerParent.insertBefore(announcementBar, headerParent.firstChild);
        } else {
          document.body.insertBefore(announcementBar, document.body.firstChild);
        }
      } else {
        document.body.insertBefore(announcementBar, document.body.firstChild);
      }
    } else if (barPosition === "bottom") {
      Object.assign(announcementBar.style, {
        position: "fixed",
        bottom: "0",
        left: "0",
      });
      document.body.appendChild(announcementBar);
    }

    const announcementBarDoc = announcementBar.contentDocument || announcementBar.contentWindow.document;
    setTimeout(() => {
      announcementBarDoc.open();
      announcementBarDoc.write(
        `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;font-family:Arial,sans-serif;}</style></head><body>${barHtml}</body></html>`,
      );
      announcementBarDoc.close();
    }, 0);

    // Count user view
    this.#backendService.registerImpression(this.popupId);

    if (window.Shopify?.shop) {
      const body = announcementBarDoc.body;
      const height = Math.min(body.scrollHeight, body.offsetHeight, body.clientHeight);
      if (height > 10) {
        announcementBar.style.height = `${height}px`;
      }
    }

    announcementBar.onload = () => {
      if (this.popupJson.unlayerJson.type === "cart_progress_bar") {
        this.initCartProgressBar();
      } else {
        this.fillInBarVariables();
      }
      this.handleActions();
      this.updateLastViewedDate();

      const barBody = announcementBarDoc.querySelector(".bspd-bar");
      if (barBody) {
        announcementBar.style.cssText = `
          ${announcementBar.style.cssText};
          height: ${barBody.offsetHeight}px !important;
          ${
            barPosition === "bottom"
              ? `
            position: fixed;
            bottom: 0;
            left: 0;
          `
              : ""
          }
        `;
        this.syncBarHeight();
      }
    };
  };

  fillInBarVariables = async () => {
    const thisBar = document.getElementById(`bspd-bar-iframe${this.popupId}`);
    const thisBarDocument = thisBar.contentDocument || thisBar.contentWindow.document;
    const shopCurrency = this.popupJson.unlayerJson?.shopCurrency || "₹";
    const bars = this.popupJson.unlayerJson?.bars || [];

    if (Array.isArray(bars) && bars.length > 0) {
      bars.forEach((bar) => {
        const localBarId = bar?.id;
        const barTextSelector = `#bspd-bar-container${localBarId} .bspd-bar-text`;
        const barTextElement = thisBarDocument.querySelector(barTextSelector);

        if (barTextElement) {
          barTextElement.innerText = barTextElement.innerText
            .replaceAll("{{currency}}", shopCurrency)
            .replaceAll("{{cart_amount}}", this.cartData.total_price / 100 || 0)
            .replaceAll("{{cart_original_amount}}", this.cartData.original_total_price / 100 || 0)
            .replaceAll("{{item_count}}", this.cartData.item_count || 0)
            .replaceAll("{{note}}", this.cartData.note || "")
            .replaceAll("{{total_discount}}", this.cartData.total_discount / 100 || 0);
        }
      });
    }
  };

  syncBarHeight = () => {
    const thisBar = document.getElementById(`bspd-bar-iframe${this.popupId}`);
    const thisBarDocument = thisBar.contentDocument || thisBar.contentWindow.document;
    const barBody = thisBarDocument.querySelector(".bspd-bar");
    if (barBody) {
      thisBar.style.cssText = `
        ${thisBar.style.cssText};
        height: ${barBody.offsetHeight}px !important;
      `;
      void thisBar.style.height;
      void barBody.offsetHeight;
    }
  };

  handleActions = () => {
    const thisBar = document.getElementById(`bspd-bar-iframe${this.popupId}`);
    const thisBarDocument = thisBar.contentDocument || thisBar.contentWindow.document;

    // Cross (close) button
    const crossButton = thisBarDocument.querySelector(".bspd-bar-cross-action-svg");
    if (crossButton) {
      crossButton.onclick = (e) => {
        e.stopPropagation();
        this.handleClose();
      };
    }

    const bars = this.popupJson.unlayerJson?.bars || [];
    if (Array.isArray(bars) && bars.length > 0) {
      bars.forEach((bar) => {
        const localBarId = bar?.id;
        const button = thisBarDocument.getElementById(`bspd-bar-button${localBarId}`);
        if (button) {
          const hrefUrl = button.dataset.href;
          const target = button.dataset.target || "_self";
          button.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (hrefUrl) window.open(hrefUrl, target);
            this.registerClickImpression();
          };
        }

        const discountCodeSpans = thisBarDocument.querySelectorAll(
          `.bspd-bar-discount-text#bspd-bar-discount-text${localBarId} span`,
        );
        discountCodeSpans?.forEach((discountCodeSpan) => {
          if (discountCodeSpan) {
            const discountCode = discountCodeSpan.innerText;
            discountCodeSpan.onclick = async (e) => {
              e.stopPropagation();
              try {
                await navigator.clipboard.writeText(discountCode);
                discountCodeSpan.innerText = "COPIED!";
                setTimeout(() => {
                  discountCodeSpan.innerText = discountCode;
                }, 2000);
              } catch (err) {
                console.error("Failed to copy: ", err);
              }
              this.registerClickImpression();
            };
          }
        });

        const entireBars = thisBarDocument.getElementsByClassName(`bspd-bar-container${localBarId}`);
        Array.from(entireBars).forEach((currentBar) => {
          currentBar.onclick = (e) => {
            e.stopPropagation();
            if (bar?.bar?.isBarClickable === true) {
              const hrefUrl = bar?.bar?.barUrl;
              const target = bar?.bar?.barUrlTarget;
              if (hrefUrl) window.open(hrefUrl, target);
            }
            this.registerClickImpression();
          };
        });
      });
    }

    const thisBarContainerId = this.popupJson.unlayerJson?.id;
    const thisBarContainer = thisBarDocument.getElementById(`bspd-bar${thisBarContainerId}`);
    if (thisBarContainer) {
      thisBarContainer.onclick = (e) => {
        e.stopPropagation();
        this.registerClickImpression();
      };
    }

    this.syncBarHeight();
  };

  makeBarAttributed = async (extraParams = {}) => {
    fetch(`${window.Shopify.routes.root}cart/update.js`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attributes: {
          bspdBarId: this.popupId,
          createdBy: "bitespeed.co",
          ...extraParams,
        },
      }),
    });
  };

  registerClickImpression = async () => {
    if (!this.alreadyRegisteredClickImpression) {
      try {
        this.makeBarAttributed();
        const impressionRegistered = await this.#backendService.registerImpression(this.popupId, "clicked");
        this.alreadyRegisteredClickImpression = true;
        return impressionRegistered;
      } catch {
        return null;
      }
    }
  };

  initCartProgressBar = async () => {
    this.updateProgressBar();
    subscribeToCartDataChangeEvent((cartData) => {
      this.cartData = cartData || {};
      const currentCartValue = cartData?.original_total_price / 100;
      if (this.cartTotalValue !== currentCartValue) {
        this.cartTotalValue = currentCartValue || 0;
        this.updateProgressBar();
      }
    });
  };

  updateProgressBar = async (totalCartValue = this.cartTotalValue) => {
    const thisBar = document.getElementById(`bspd-bar-iframe${this.popupId}`);
    const thisBarDocument = thisBar.contentDocument || thisBar.contentWindow.document;
    const progressBarConfig = this.popupJson.unlayerJson?.bars?.[0]?.progressBar;
    const goalCheckpoints = progressBarConfig?.goals?.map((goal) => goal.minSubtotal) || [];
    const shopCurrency = this.popupJson.unlayerJson?.shopCurrency || "₹";
    const progressBarState = await this.calculateProgressBarMetadata(totalCartValue, goalCheckpoints);
    const nextCheckpointValue = progressBarState?.nextCheckpointValue || 0;

    const titleEle = thisBarDocument.getElementById("bar-progress-title");
    if (titleEle) {
      const barUpdatedTitle = progressBarState.isComplete
        ? progressBarConfig.goalTitle
        : progressBarConfig.title
            .replaceAll("{{store_currency}}", shopCurrency)
            .replaceAll("{{currency}}", shopCurrency)
            .replaceAll("{{remaining_amount}}", `${(nextCheckpointValue - progressBarState.cartValue).toFixed(2)}`)
            .replaceAll("{{next_goal_amount}}", `${nextCheckpointValue.toFixed(2)}`)
            .replaceAll("{{cart_amount}}", `${progressBarState.cartValue.toFixed(2)}`);
      titleEle.innerText = barUpdatedTitle;
    }

    const progressBarEle = thisBarDocument.getElementById("bar-progress-bar-filled");
    if (progressBarEle) {
      progressBarEle.style.width = `${progressBarState.percentage}%`;
    }

    this.syncBarHeight();

    let lastCompletedCheckpointIndex = -1,
      containsFreeShippingDiscount = false,
      lastCompletedContainsFreeShippingDiscount = false;
    goalCheckpoints.forEach((goalMinSubtotal, index) => {
      const goalEle = thisBarDocument.getElementById(`goal-icon-${index}`);
      if (goalEle) {
        const isCompleted = (progressBarState?.startCheckpoint.value || 0) >= goalMinSubtotal;
        if (isCompleted) {
          goalEle.classList.add("completed");
          goalEle.classList.remove("incomplete");
          lastCompletedCheckpointIndex = index;
          for (let i = 0; i <= index; ++i) {
            if (progressBarConfig?.goals?.[i]?.type === "free_shipping") {
              containsFreeShippingDiscount = true;
              if (i === index) lastCompletedContainsFreeShippingDiscount = true;
            }
          }
        } else {
          goalEle.classList.add("incomplete");
          goalEle.classList.remove("completed");
        }
      }
    });

    if (lastCompletedCheckpointIndex >= 0) {
      if (progressBarConfig?.areDiscountsStatic === true) {
        const discountCode = progressBarConfig?.goals?.[lastCompletedCheckpointIndex]?.discountCode || "";
        if (discountCode) {
          await fetch(`${window.location.origin}/discount/${discountCode}`, { method: "GET" });
          await this.makeBarAttributed({
            discountCode: containsFreeShippingDiscount ? undefined : discountCode,
            shippingCode: containsFreeShippingDiscount ? discountCode : undefined,
            barCompletedCheckpoints: lastCompletedCheckpointIndex + 1,
            containsShippingDiscount: containsFreeShippingDiscount,
          });
        }
      } else if (progressBarConfig?.areDiscountsStatic === false) {
        const latestGoalCompleted = progressBarConfig?.goals?.[lastCompletedCheckpointIndex];
        const discountType = ["PERCENTAGE", "percentage"].includes(progressBarConfig.discountType)
          ? "percentage"
          : "fixed";
        const discountValue = ["PERCENTAGE", "percentage"].includes(progressBarConfig.discountType)
          ? latestGoalCompleted.discountPercentage
          : latestGoalCompleted.discountFixed;

        const localCodeKey = `cache-code-${this.popupId}-${discountValue}-${discountType}-${lastCompletedCheckpointIndex}-${latestGoalCompleted.minSubtotal}`;
        const localShippingCodeKey = `cache-shipping-code-${this.popupId}`;
        const locallyStoredCode = localStorage.getItem(localCodeKey);
        const locallyStoredShippingCode = localStorage.getItem(localShippingCodeKey);

        let discountCode = "";
        let shippingCode = "";

        if (lastCompletedContainsFreeShippingDiscount && !locallyStoredShippingCode) {
          shippingCode = await this.#backendService.getSparkles({
            min: latestGoalCompleted.minSubtotal,
            discount: {
              type: discountType,
              value: discountValue,
              withProductDiscount: false,
              withOrderDiscount: false,
              withShippingDiscount: true,
              attachFreeShipping: true,
            },
            products: [],
            name: "Progress Bar: Cart Dicount",
            appliesOnEachItem: false,
          });
        } else if (containsFreeShippingDiscount && (!locallyStoredShippingCode || !locallyStoredCode)) {
          const promises = [];
          if (!locallyStoredShippingCode) {
            promises.push(
              this.#backendService.getSparkles({
                min: latestGoalCompleted.minSubtotal,
                discount: {
                  type: discountType,
                  value: discountValue,
                  withShippingDiscount: true,
                  attachFreeShipping: true,
                },
                products: [],
                name: "Progress Bar: Cart Dicount",
                appliesOnEachItem: false,
              }),
            );
          } else {
            promises.push(locallyStoredShippingCode);
          }
          if (!locallyStoredCode) {
            promises.push(
              this.#backendService.getSparkles({
                min: latestGoalCompleted.minSubtotal,
                discount: {
                  type: discountType,
                  value: discountValue,
                  withShippingDiscount: true,
                  attachFreeShipping: false,
                },
                products: [],
                name: "Progress Bar: Cart Dicount",
                appliesOnEachItem: false,
              }),
            );
          } else {
            promises.push(locallyStoredCode);
          }
          const [shippingCodeDiscount, normalCodeDiscount] = await Promise.all(promises);
          if (shippingCodeDiscount) shippingCode = shippingCodeDiscount;
          if (normalCodeDiscount) discountCode = normalCodeDiscount;
        } else if (containsFreeShippingDiscount && locallyStoredShippingCode) {
          shippingCode = locallyStoredShippingCode || "";
          if (locallyStoredCode) discountCode = locallyStoredCode || "";
        } else if (locallyStoredCode) {
          discountCode = locallyStoredCode || "";
        } else {
          discountCode = await this.#backendService.getSparkles({
            min: latestGoalCompleted.minSubtotal,
            discount: {
              type: discountType,
              value: discountValue,
              withShippingDiscount: true,
              attachFreeShipping: false,
            },
            products: [],
            name: "Progress Bar: Cart Dicount",
            appliesOnEachItem: false,
          });
        }

        if (discountCode) {
          localStorage.setItem(localCodeKey, discountCode);
          await fetch(`${window.location.origin}/discount/${discountCode}`, { method: "GET" });
        }
        if (containsFreeShippingDiscount && shippingCode) {
          localStorage.setItem(localShippingCodeKey, shippingCode);
          await fetch(`${window.location.origin}/discount/${shippingCode}`, { method: "GET" });
        }
        if (discountCode || shippingCode) {
          await this.makeBarAttributed({
            discountCode: discountCode || undefined,
            shippingCode: shippingCode || undefined,
            barCompletedCheckpoints: lastCompletedCheckpointIndex + 1,
            containsShippingDiscount: shippingCode.length > 0,
          });
        }
      }
    }
  };

  calculateProgressBarMetadata = async (totalCartValue = this.cartTotalValue, checkpointValues = []) => {
    if (!Array.isArray(checkpointValues) || checkpointValues.length === 0 || totalCartValue < 0) {
      return {
        cartValue: totalCartValue,
        percentage: 0,
        currentRange: { start: 0, end: 0 },
        startCheckpoint: { value: 0, position: 0 },
        endCheckpoint: { value: 0, position: 0 },
        isComplete: false,
        nextCheckpointValue: null,
      };
    }
    const sortedCheckpoints = [...checkpointValues].sort((a, b) => a - b);
    const numCheckpoints = sortedCheckpoints.length;
    const checkpointPositions = Array.from({ length: numCheckpoints }, (_, i) => ((i + 1) * 100) / numCheckpoints);

    if (totalCartValue === 0) {
      return {
        cartValue: totalCartValue,
        percentage: 0,
        currentRange: { start: 0, end: 1 },
        startCheckpoint: { value: 0, position: 0 },
        endCheckpoint: { value: sortedCheckpoints[0], position: checkpointPositions[0] },
        isComplete: false,
        nextCheckpointValue: sortedCheckpoints[0],
      };
    }

    if (totalCartValue >= sortedCheckpoints[numCheckpoints - 1]) {
      return {
        cartValue: totalCartValue,
        percentage: 100,
        currentRange: { start: numCheckpoints, end: numCheckpoints },
        startCheckpoint: { value: sortedCheckpoints[numCheckpoints - 1], position: 100 },
        endCheckpoint: { value: sortedCheckpoints[numCheckpoints - 1], position: 100 },
        isComplete: true,
        nextCheckpointValue: null,
      };
    }

    let rangeStart = 0,
      rangeEnd = 1,
      startValue = 0,
      endValue = sortedCheckpoints[0],
      startPosition = 0,
      endPosition = checkpointPositions[0];
    for (let i = 0; i < numCheckpoints; i++) {
      if (totalCartValue >= sortedCheckpoints[i]) {
        if (i < numCheckpoints - 1) {
          rangeStart = i + 1;
          rangeEnd = i + 2;
          startValue = sortedCheckpoints[i];
          endValue = sortedCheckpoints[i + 1];
          startPosition = checkpointPositions[i];
          endPosition = checkpointPositions[i + 1];
        }
      } else {
        if (i === 0) {
          rangeStart = 0;
          rangeEnd = 1;
          startValue = 0;
          endValue = sortedCheckpoints[0];
          startPosition = 0;
          endPosition = checkpointPositions[0];
        } else {
          rangeStart = i;
          rangeEnd = i + 1;
          startValue = sortedCheckpoints[i - 1];
          endValue = sortedCheckpoints[i];
          startPosition = checkpointPositions[i - 1];
          endPosition = checkpointPositions[i];
        }
        break;
      }
    }

    const valueProgress = (totalCartValue - startValue) / (endValue - startValue);
    const interpolatedPercentage = startPosition + valueProgress * (endPosition - startPosition);
    const finalPercentage = Math.max(0, Math.min(100, interpolatedPercentage));
    let nextCheckpointValue = null;
    for (let i = 0; i < numCheckpoints; i++) {
      if (sortedCheckpoints[i] > totalCartValue) {
        nextCheckpointValue = sortedCheckpoints[i];
        break;
      }
    }

    return {
      cartValue: totalCartValue,
      percentage: Math.round(finalPercentage * 100) / 100,
      currentRange: { start: rangeStart, end: rangeEnd },
      startCheckpoint: { value: startValue, position: startPosition },
      endCheckpoint: { value: endValue, position: endPosition },
      isComplete: totalCartValue >= sortedCheckpoints[numCheckpoints - 1],
      nextCheckpointValue,
    };
  };

  handleClose = async () => {
    const thisBar = document.getElementById(`bspd-bar-iframe${this.popupId}`);
    if (thisBar) {
      thisBar.style.display = "none";
      await this.#backendService.registerImpression(this.popupId, "closed");
    }
  };
}

class CrossSellPopup extends PopupBS {
  #backendService;

  productsToRender = [];
  discount = {
    type: "none",
    value: 0,
    code: "",
    withProductDiscount: false,
    withOrderDiscount: false,
    withShippingDiscount: false,
  };
  shopCurrency = "";
  offerType = "FBT"; // FBT or YMAL

  checkedVariants = {};
  selectedVariants = {};
  productsAddedToCartSeparately = {};

  alreadyInteractedWithPopup = false;
  alreadyConverted = false;

  crossSellPopupHtml = "";

  preloadedDiscount = "";
  productsIncludedInDiscount = [];

  preloadProductAddedToCartId = null;
  preloadProduct = null;
  isRecommendedProducts = false;

  stopProcessing = false;

  constructor(popupJson, browserService, backendService) {
    super(popupJson, browserService, backendService, "", "cross-sell-popup");
    this.#backendService = backendService;
    this.init(true);
    this.addPopupTrigger()
      .then((shouldShow) => {
        if (shouldShow) {
          this.show();
          const viewsCntKey = `bspdViewsCnt-${this.popupId}`;
          const viewsCnt = Number(localStorage.getItem(viewsCntKey)) || 0;
          localStorage.setItem(viewsCntKey, viewsCnt + 1);
        }
      })
      .catch((err) => {
        console.error("Error in showing popup: ", err);
      });
  }

  init = async (preLoading = false) => {
    if (preLoading && window?.BspdCurrentProduct === null && !bspdProductChangesOnCart?.added?.[0]?.product_id) {
      return;
    }

    const popupConfig = this.popupJson.unlayerJson;
    let allProductsToShow = popupConfig?.selectedProductsToShow || [];
    this.crossSellPopupHtml = this.getPopupHtml()
      .replaceAll('alt="Trigger Product"', "")
      .replaceAll('width={"256"}', "")
      .replaceAll('height={"256"}', "");

    if (bspdProductChangesOnCart?.added?.[0]?.product_id) {
      this.preloadProductAddedToCartId = bspdProductChangesOnCart.added[0].product_id;
      this.preloadProduct = bspdProductChangesOnCart.added[0];
    } else if (window?.BspdCurrentProduct) {
      this.preloadProductAddedToCartId = window.BspdCurrentProduct.id;
      this.preloadProduct = window.BspdCurrentProduct;
    }

    let htmlFound = true;
    this.isRecommendedProducts = popupConfig?.productSelection === "automatic";
    if (popupConfig?.productSelection === "automatic" && this.preloadProductAddedToCartId) {
      try {
        const res = await fetch(
          `/recommendations/products.json?product_id=${this.preloadProductAddedToCartId}&limit=4&intent=${
            popupConfig?.productToShowIntent || "related"
          }`,
        );
        const shopifyRecommendedProducts = await res.json();
        const dynamicData = await this.#backendService.getDynamicPopupData({
          popupId: this.popupId,
          productId: this.preloadProductAddedToCartId,
          popupConfig,
          products: shopifyRecommendedProducts.products || [],
        });
        if (dynamicData?.html?.length > 0) {
          this.crossSellPopupHtml = dynamicData.html;
          allProductsToShow = dynamicData.products || allProductsToShow || [];
        } else {
          htmlFound = false;
        }
      } catch (err) {
        console.error("Error in fetching dynamic HTML: ", err);
      }
    } else if (popupConfig?.productSelection === "product_feed") {
      const dynamicData = await this.#backendService.getDynamicPopupData({
        popupId: this.popupId,
        productId: this.preloadProductAddedToCartId,
        popupConfig,
        products: [],
      });
      if (dynamicData?.html?.length > 0) {
        this.crossSellPopupHtml = dynamicData.html;
        allProductsToShow = dynamicData.products || allProductsToShow || [];
      } else {
        htmlFound = false;
      }
    }

    const removeProductNameFromVariant = (variantName, productName) =>
      !variantName || !productName
        ? variantName
        : variantName
            .replaceAll(`${productName} - `, "")
            .replaceAll(`${productName}`, "")
            .replace(/^[\s-]+|[\s-]+$/g, "")
            .replaceAll("&amp;", "&")
            .trim() || variantName;

    const productsAvailablity = await Promise.all(
      allProductsToShow.map(async (product) => {
        try {
          const productHandle = product?.handle || product?.producthandle;
          if (!productHandle) {
            return {
              id: product?.id,
              available: true,
              variants: product?.variants || [],
            };
          }
          const res = await fetch(`/products/${productHandle}.js`);
          const productData = await res.json();
          return {
            id: product.id,
            available: productData?.available ?? false,
            variants:
              productData?.variants
                .map((variant) => ({
                  ...variant,
                  name: removeProductNameFromVariant(variant.name, product.name),
                }))
                .sort((a, b) => a.name.localeCompare(b.name)) || [],
          };
        } catch {
          return {
            id: product.id,
            available: false,
            variants: [],
          };
        }
      }),
    );

    if (productsAvailablity.every((product) => !product.available)) {
      this.stopProcessing = true;
      return;
    }

    allProductsToShow = allProductsToShow
      .filter((product) => productsAvailablity.some((p) => p.id === product.id && p.available))
      .map((product) => {
        const productAvailability = productsAvailablity.find((p) => p.id === product.id);
        const availableVariants = productAvailability?.variants || [];
        return {
          ...product,
          variants: (product?.variants || [])
            .filter((variant) =>
              availableVariants.some(
                (availableVariant) => availableVariant.id === variant.id && availableVariant.available,
              ),
            )
            .sort((a, b) => {
              const indexA = productAvailability?.variants?.findIndex((v) => v.id === a.id);
              const indexB = productAvailability?.variants?.findIndex((v) => v.id === b.id);
              return indexA - indexB;
            })
            .map((variant) => ({
              ...variant,
              name: removeProductNameFromVariant(variant.name, product?.name),
            })),
        };
      });

    productsAvailablity.forEach((product) => {
      const placeholderDisplayVar = `[[bspd-csp-product-item-wrapper-${product.id}]]`;
      if (this.crossSellPopupHtml.includes(placeholderDisplayVar)) {
        this.crossSellPopupHtml = this.crossSellPopupHtml.replace(
          placeholderDisplayVar,
          product.available ? "flex" : "none",
        );
      }
      if (product.available) {
        const variantOptionsDisplayVar = `[[bspd-csp-product-variant-options-list-${product.id}]]`;
        let optionsList = "";
        for (let i = 0; i < product.variants.length; i++) {
          const variant = product.variants[i];
          if (variant.available) {
            optionsList += `<option value="${variant.id}"${i === 0 ? " selected" : ""}>${this.#sanitizeHTML(variant.name)}</option>`;
          }
        }
        if (this.crossSellPopupHtml.includes(variantOptionsDisplayVar)) {
          this.crossSellPopupHtml = this.crossSellPopupHtml.replace(variantOptionsDisplayVar, optionsList);
        }
      }
    });

    const defaultCheckedVariants = {};
    const defaultSelectedVariants = {};
    const defaultSeparatelyAddedProducts = {};

    allProductsToShow.forEach((product) => {
      const productId = product?.id;
      const variants = product?.variants || [];
      const defaultVariantId = variants?.[0]?.id;
      defaultCheckedVariants[productId] = true;
      defaultSelectedVariants[productId] = defaultVariantId;
      defaultSeparatelyAddedProducts[productId] = false;
    });

    this.checkedVariants = defaultCheckedVariants;
    this.selectedVariants = defaultSelectedVariants;
    this.productsAddedToCartSeparately = defaultSeparatelyAddedProducts;
    this.productsToRender = allProductsToShow;
    this.discount = popupConfig?.discount || this.discount;
    this.shopCurrency = popupConfig?.shopCurrency;
    this.offerType = popupConfig?.offerType === "frequently_bought_together" ? "FBT" : "YMAL";

    if (!this.preloadedDiscount) {
      await this.preloadDiscount(allProductsToShow.map((product) => product.id));
    }
  };

  show = async () => {
    if (this.stopProcessing) return;
    if (
      (this.isRecommendedProducts &&
        this.preloadProductAddedToCartId !== bspdProductChangesOnCart?.added?.[0]?.product_id) ||
      !this.crossSellPopupHtml
    ) {
      await this.init();
      if (!this.crossSellPopupHtml || this.stopProcessing) return;
    } else {
      this.preloadProduct = bspdProductChangesOnCart?.added?.[0];
    }

    const afterDisplay = (event) => {
      let updatedHtml = this.putInCartChangesUI();
      updatedHtml = updatedHtml
        .replaceAll('alt="Trigger Product"', "")
        .replaceAll('width={"256"}', "")
        .replaceAll('height={"256"}', "");

      this.handleUserInputInteractionsFBT();
      this.handleUserInputInteractionsYMAL();
      this.handleActions();
      this.updateLastViewedDate();
      this.#backendService.registerImpression(this.popupId);

      if (updatedHtml.includes("Trigger Product") || updatedHtml.includes("Product To Show")) {
        crossSellPopup.remove();
        return;
      }
      event.target.removeEventListener("load", afterDisplay);
    };

    const crossSellPopup = document.createElement("iframe");
    crossSellPopup.id = `bspd-csp-iframe${this.popupId}`;
    crossSellPopup.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      z-index: 100000000;
      position: fixed;
      top: 0;
      left: 0;
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    `;
    crossSellPopup.srcdoc = this.crossSellPopupHtml;

    let handled = false;
    const afterDisplayWrapper = (event) => {
      if (handled) return;
      handled = true;
      afterDisplay(event);
    };
    crossSellPopup.addEventListener("load", afterDisplayWrapper);

    setTimeout(() => {
      if (!handled) {
        afterDisplayWrapper({ target: crossSellPopup });
      }
    }, 500);

    document.body.appendChild(crossSellPopup);
  };

  preloadDiscount = async (products = []) => {
    const discountType = this.popupJson.unlayerJson?.discount?.type;
    if (!discountType || discountType === "none") return;
    if (window?.BspdCurrentProduct) {
      const totalCartValue = this.getTotalCartValue();
      this.productsIncludedInDiscount = [...products, window.BspdCurrentProduct.id];
      this.preloadedDiscount = await this.#backendService.getSparkles({
        min: totalCartValue,
        discount: this.discount,
        products: [...products, window.BspdCurrentProduct.id],
        name: "FBT:CSP",
        appliesOnEachItem: false,
      });
    }
  };

  getNumberOfProductsSelected = () => Object.values(this.checkedVariants).filter(Boolean).length;

  getTotalCartValueFromSeparatelyAddedProducts = () => {
    const totalVariantsPrice = this.productsToRender.reduce((acc, product) => {
      if (!this.productsAddedToCartSeparately[product.id]) return acc;
      const selectedVariant = product?.variants?.find(
        (variant) => variant.id === Number(this.selectedVariants[product.id]),
      );
      return selectedVariant ? acc + selectedVariant.price : acc;
    }, 0);
    return this.formatFloat(totalVariantsPrice);
  };

  getTotalCartValue = (selectedProductsToShow = this.productsToRender) => {
    const totalVariantsPrice = selectedProductsToShow.reduce((acc, product) => {
      if (!this.checkedVariants[product.id]) return acc;
      const selectedVariant = product?.variants?.find(
        (variant) => variant.id === Number(this.selectedVariants[product.id]),
      );
      return selectedVariant ? acc + selectedVariant.price : acc;
    }, 0);

    if (this.preloadProduct) {
      const variantPrice = this.preloadProduct?.price ? this.preloadProduct.price / 100 : 0;
      return totalVariantsPrice + variantPrice;
    }
    return this.formatFloat(totalVariantsPrice);
  };
  getTotalCartDiscountAmount = (selectedProductsToShow = this.productsToRender) => {
    const numberOfProductSelected = this.getNumberOfProductsSelected();
    if (numberOfProductSelected <= 0 || numberOfProductSelected < this.productsToRender.length) return 0;
    const totalCartValue = this.getTotalCartValue(selectedProductsToShow);
    const { type: discountType, value: discountValue = 0 } = this.discount;
    if (discountType === "none") return 0;
    if (discountType === "percentage") {
      return this.formatFloat((totalCartValue * discountValue) / 100);
    }
    if (discountType === "fixed") {
      return this.formatFloat(discountValue);
    }
    return 0;
  };
  getTotalCartDiscountedAmount = (selectedProductsToShow = this.productsToRender) => {
    const totalCartValue = this.getTotalCartValue(selectedProductsToShow);
    const discountAmount = this.getTotalCartDiscountAmount(selectedProductsToShow);
    return this.formatFloat(totalCartValue - discountAmount);
  };

  getRelativeDiscountProductAmount = (productId, variantId) => {
    const numberOfProductSelected = this.getNumberOfProductsSelected();
    if (numberOfProductSelected < this.productsToRender.length) return 0;
    const totalCartAmount = this.getTotalCartValue();
    const selectedProduct = this.productsToRender.find((product) => product.id === Number(productId));
    const selectedVariant = selectedProduct?.variants?.find((variant) => variant.id === Number(variantId));
    const selectedVariantPrice = selectedVariant?.price || 0;
    const { type: discountType, value: discountValue = 0 } = this.discount;
    if (discountType === "none") return 0;
    if (discountType === "percentage") {
      return this.formatFloat((selectedVariantPrice * discountValue) / 100);
    }
    if (discountType === "fixed") {
      const productContributionPercToCart = (selectedVariantPrice / totalCartAmount) * 100;
      const productDiscount = (discountValue * productContributionPercToCart) / 100;
      return this.formatFloat(productDiscount);
    }
    return 0;
  };
  getRelativeDiscountedProductAmount = (productId, variantId) => {
    const selectedProduct = this.productsToRender.find((product) => product.id === Number(productId));
    const selectedVariant = selectedProduct?.variants?.find((variant) => variant.id === Number(variantId));
    const discountAmount = this.getRelativeDiscountProductAmount(productId, variantId);
    return this.formatFloat((selectedVariant?.price ?? 0) - discountAmount);
  };

  getDirectDiscountAmount = (productId, variantId) => {
    const selectedProduct = this.productsToRender.find((product) => product.id === Number(productId));
    const selectedVariant = selectedProduct?.variants?.find((variant) => variant.id === Number(variantId));
    const selectedVariantPrice = selectedVariant?.price || 0;
    const { type: discountType, value: discountValue = 0 } = this.discount;
    if (discountType === "none") return 0;
    if (discountType === "percentage") {
      return this.formatFloat((selectedVariantPrice * discountValue) / 100);
    }
    if (discountType === "fixed") {
      return this.formatFloat(discountValue);
    }
    return 0;
  };
  getDirectDiscountedAmount = (productId, variantId) => {
    const selectedProduct = this.productsToRender.find((product) => product.id === Number(productId));
    const selectedVariant = selectedProduct?.variants?.find((variant) => variant.id === Number(variantId));
    const discountAmount = this.getDirectDiscountAmount(productId, variantId);
    return this.formatFloat((selectedVariant?.price ?? 0) - discountAmount);
  };

  putInCartChangesUI = () => {
    if (this.popupJson?.unlayerJson?.offerType !== "frequently_bought_together") return "";
    const thisCSP = document.getElementById(`bspd-csp-iframe${this.popupId}`);
    const thisCSPDocument = thisCSP.contentDocument || thisCSP.contentWindow.document;
    const productCard = thisCSPDocument.querySelector(".bspd-product-added-to-cart");
    const addedProductToCart = this.preloadProduct;
    if (productCard && addedProductToCart) {
      this.updateFooterUI();
      const productImageEle = thisCSPDocument.querySelector(`.bspd-csp-product-image`);
      const productTitleEle = thisCSPDocument.querySelector(`.bspd-csp-product-name`);
      const productPriceEle = thisCSPDocument.querySelector(`.bspd-csp-product-price`);
      const productCompareAtPriceEle = thisCSPDocument.querySelector(`.bspd-csp-product-compareatprice`);
      const { type: discountType, value: discountValue = 0 } = this.discount;
      const orginalPrice = addedProductToCart?.price / 100;
      let finalProductPrice = orginalPrice;
      const numberOfProductSelected = this.getNumberOfProductsSelected();

      if (discountType === "percentage" && numberOfProductSelected === this.productsToRender.length) {
        finalProductPrice = orginalPrice - (orginalPrice * discountValue) / 100;
      } else if (discountType === "fixed" && numberOfProductSelected === this.productsToRender.length) {
        const productContributionPercToCart = (orginalPrice / this.getTotalCartValue()) * 100;
        const productDiscount = (discountValue * productContributionPercToCart) / 100;
        finalProductPrice = this.formatFloat(orginalPrice - productDiscount);
      }

      productImageEle.src = addedProductToCart?.image + "&width=200";
      productTitleEle.innerText = this.#sanitizeHTML(replaceHtmlEntities(addedProductToCart?.title));
      productPriceEle.innerText = `${this.shopCurrency}${this.formatDecimalSeparator(finalProductPrice)}`;
      productCompareAtPriceEle.innerText =
        Math.floor(orginalPrice) === Math.floor(finalProductPrice)
          ? ""
          : `${this.shopCurrency}${this.formatDecimalSeparator(orginalPrice || 0)}`;

      return thisCSPDocument.body.innerHTML
        .replaceAll('alt="Trigger Product"', "")
        .replaceAll('width={"256"}', "")
        .replaceAll('height={"256"}', "");
    }
    return thisCSPDocument.body.innerHTML
      .replaceAll('alt="Trigger Product"', "")
      .replaceAll('width={"256"}', "")
      .replaceAll('height={"256"}', "");
  };

  updateFooterUI = () => {
    if (this.popupJson?.unlayerJson?.offerType !== "frequently_bought_together") return;
    const thisCSP = document.getElementById(`bspd-csp-iframe${this.popupId}`);
    const thisCSPDocument = thisCSP.contentDocument || thisCSP.contentWindow.document;
    const footerPriceEle = thisCSPDocument.querySelector(".footer-total-price-text");
    const footerCompareAtPriceEle = thisCSPDocument.querySelector(".footer-compare-at-price-text");
    const footerDiscountAmountEle = thisCSPDocument.querySelector(".bspd-csp-footer-pricing-desc span");
    const footerAddToCartBtn = thisCSPDocument.querySelector(".bspd-csp-add-to-cart-btn");
    const totalCartValue = this.getTotalCartValue();
    const totalDiscountAmount = this.getTotalCartDiscountAmount();
    const totalDiscountedAmount = this.getTotalCartDiscountedAmount();

    if (totalDiscountedAmount <= 0) {
      footerPriceEle.innerText = `${this.shopCurrency}${this.formatDecimalSeparator(0)}`;
      if (footerCompareAtPriceEle) footerCompareAtPriceEle.innerText = "";
      if (footerDiscountAmountEle)
        footerDiscountAmountEle.innerText = `${this.shopCurrency}${this.formatDecimalSeparator(0)}`;
    } else {
      footerPriceEle.innerText = `${this.shopCurrency}${this.formatDecimalSeparator(totalDiscountedAmount)}`;
      if (footerCompareAtPriceEle) {
        footerCompareAtPriceEle.innerText =
          Math.floor(totalDiscountedAmount) === Math.floor(totalCartValue)
            ? ""
            : `${this.shopCurrency}${this.formatDecimalSeparator(totalCartValue)}`;
      }
      if (footerDiscountAmountEle)
        footerDiscountAmountEle.innerText = `${this.shopCurrency}${this.formatDecimalSeparator(totalDiscountAmount)}`;
    }

    const numberOfProductSelected = this.getNumberOfProductsSelected();
    if (footerAddToCartBtn) {
      footerAddToCartBtn.disabled = numberOfProductSelected <= 0;
      footerAddToCartBtn.style.filter = numberOfProductSelected <= 0 ? "grayscale(100%)" : "grayscale(0%)";
    }
  };

  handleActions = () => {
    const thisCSP = document.getElementById(`bspd-csp-iframe${this.popupId}`);
    const thisCSPDocument = thisCSP.contentDocument || thisCSP.contentWindow.document;
    const crossButton = thisCSPDocument.querySelector(".bspd-csp-header-close");
    if (crossButton) {
      crossButton.addEventListener("click", () => this.handleClose());
    }
    const bspdCSP = thisCSPDocument.querySelector(".bspd-csp");
    if (bspdCSP) {
      bspdCSP.onclick = (e) => e.stopPropagation();
      bspdCSP.ontouchstart = (e) => e.stopPropagation();
    }
  };

  handleUserInputInteractionsFBT = () => {
    if (this.popupJson?.unlayerJson?.offerType !== "frequently_bought_together") return;
    this.updateUIWithSelectedVariant();
    const thisCSP = document.getElementById(`bspd-csp-iframe${this.popupId}`);
    const thisCSPDocument = thisCSP.contentDocument || thisCSP.contentWindow.document;

    const inputs = thisCSPDocument.querySelectorAll("input.bspd-csp-product-checkbox");
    inputs.forEach((input) => {
      const productId = input.dataset.productId;
      if (this.checkedVariants?.[productId] !== undefined && this.checkedVariants?.[productId] !== null) {
        this.checkedVariants[productId] = input.checked;
      }
      input.addEventListener("click", (updatedValue) => {
        if (this.checkedVariants?.[productId] !== undefined && this.checkedVariants?.[productId] !== null) {
          this.checkedVariants[productId] = updatedValue.target.checked;
        }
        this.putInCartChangesUI();
        this.updateUIWithSelectedVariant();
        if (!this.alreadyInteractedWithPopup) {
          this.alreadyInteractedWithPopup = true;
          this.#backendService.registerImpression(this.popupId, "crossSellInteracted");
        }
      });
    });

    const variantSelectors = thisCSPDocument.querySelectorAll("select.bspd-csp-product-variant-select");
    variantSelectors.forEach((variantSelector) => {
      const productId = variantSelector.dataset.productId;
      const variantId = variantSelector.value;
      if (this.selectedVariants?.[productId]) {
        this.selectedVariants[productId] = variantId;
      }
      variantSelector.onchange = (updatedValue) => {
        const selectedVariantId = updatedValue.target.value;
        if (this.selectedVariants?.[productId]) {
          this.selectedVariants[productId] = selectedVariantId;
        }
        this.updateFooterUI();
        this.updateUIWithSelectedVariant();
        if (!this.alreadyInteractedWithPopup) {
          this.alreadyInteractedWithPopup = true;
          this.#backendService.registerImpression(this.popupId, "crossSellInteracted");
        }
      };
    });

    const noThanksButton = thisCSPDocument.querySelector(".bspd-csp-continue-button");
    if (noThanksButton) {
      noThanksButton.addEventListener("click", () => this.handleClose());
    }

    const addToCartButton = thisCSPDocument.querySelector("button.bspd-csp-add-to-cart-btn");
    if (addToCartButton) {
      addToCartButton.addEventListener("click", async () => {
        await this.onAddToCartBulk();
      });
    }
  };

  handleUserInputInteractionsYMAL = () => {
    if (this.popupJson?.unlayerJson?.offerType !== "you_may_also_like") return;
    this.updateUIWithSelectedVariant();
    const thisCSP = document.getElementById(`bspd-csp-iframe${this.popupId}`);
    const thisCSPDocument = thisCSP.contentDocument || thisCSP.contentWindow.document;

    const variantSelectors = thisCSPDocument.querySelectorAll("select.bspd-csp-product-variant-select");
    variantSelectors.forEach((variantSelector) => {
      const productId = variantSelector.dataset.productId;
      const variantId = variantSelector.value;
      if (this.selectedVariants?.[productId]) {
        this.selectedVariants[productId] = variantId;
      }
      variantSelector.onchange = (updatedValue) => {
        const selectedVariantId = updatedValue.target.value;
        if (this.selectedVariants?.[productId]) {
          this.selectedVariants[productId] = selectedVariantId;
        }
        this.updateUIWithSelectedVariant();
        if (!this.alreadyInteractedWithPopup) {
          this.alreadyInteractedWithPopup = true;
          this.#backendService.registerImpression(this.popupId, "crossSellInteracted");
        }
      };
    });

    const addToCartButtons = thisCSPDocument.querySelectorAll("button.bspd-csp-product-add-to-cart-btn");
    addToCartButtons.forEach((addToCartButton) => {
      const productId = addToCartButton.dataset.productId;
      addToCartButton.addEventListener("click", async () => {
        await this.onAddToCartSingle(productId);
      });
    });

    const continueShoppingBtn = thisCSPDocument.querySelector(".bspd-csp-continue-button");
    if (continueShoppingBtn) {
      continueShoppingBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleClose();
      });
    }
  };

  handleClose = async () => {
    const thisCSP = document.getElementById(`bspd-csp-iframe${this.popupId}`);
    const crossSellPopupDoc = thisCSP.contentDocument || thisCSP.contentWindow.document;
    const backdropElement = crossSellPopupDoc.querySelector(".bspd-csp-parent");
    const backdropEnterClass = "bspd-backdrop-enter-animation-class";
    const backdropExitClass = "bspd-backdrop-exit-animation-class";
    const popupCard = crossSellPopupDoc.querySelector("div.bspd-csp");
    const popupEnterClass = "bspd-enter-animation-class";
    const popupExitClass = "bspd-exit-animation-class";
    if (popupCard) {
      popupCard.classList.remove(popupEnterClass);
      popupCard.classList.remove(popupExitClass);
      popupCard.classList.add(popupExitClass);
    }
    if (backdropElement) {
      backdropElement.classList.remove(backdropEnterClass);
      backdropElement.classList.remove(backdropExitClass);
      backdropElement.classList.add(backdropExitClass);
    }

    const popupConfig = this.popupJson.unlayerJson;
    const totalExitDurationInSec =
      (popupConfig?.design?.animation?.duration || 0) + (popupConfig?.design?.animation?.delay || 0);
    setTimeout(() => {
      thisCSP.remove();
    }, totalExitDurationInSec * 1000);

    if (!this.alreadyConverted) {
      await this.#backendService.registerImpression(this.popupId, "closed");
    }
  };

  formatFloat = (num = 0) => parseFloat(Number(num).toFixed(2));
  formatDecimalSeparator = (num, locale = "en-IN") => Number(num).toLocaleString(locale);

  updateUIWithSelectedVariant = () => {
    const thisCSP = document.getElementById(`bspd-csp-iframe${this.popupId}`);
    const thisCSPDocument = thisCSP.contentDocument || thisCSP.contentWindow.document;
    for (const productId in this.selectedVariants) {
      const variantId = this.selectedVariants[productId];
      const productImageEle = thisCSPDocument.querySelector(`.bspd-csp-product-image-${productId}`);
      const productTitleEle = thisCSPDocument.querySelector(`.bspd-csp-product-name-${productId}`);
      const productPriceEle = thisCSPDocument.querySelector(`.bspd-csp-product-price-${productId}`);
      const productCompareAtPriceEle = thisCSPDocument.querySelector(`.bspd-csp-product-compareatprice-${productId}`);
      const productData = this.productsToRender?.find((product) => product.id === Number(productId));
      const variantData = productData?.variants?.find((variant) => variant.id === Number(variantId));
      if (variantData) {
        productImageEle.src = variantData?.image + "&width=200";
        let discountedProdPrice = this.getRelativeDiscountedProductAmount(productId, variantId);
        if (this.offerType === "YMAL") {
          discountedProdPrice = this.getDirectDiscountedAmount(productId, variantId);
        }
        productTitleEle.innerText = this.#sanitizeHTML(replaceHtmlEntities(productData.name));
        productPriceEle.innerText = `${this.shopCurrency}${this.formatDecimalSeparator(discountedProdPrice)}`;
        productCompareAtPriceEle.innerText =
          discountedProdPrice === variantData?.price
            ? ""
            : `${this.shopCurrency}${this.formatDecimalSeparator(variantData?.price)}`;
      }
    }
  };

  onAddToCartSingle = async (productId) => {
    this.productsAddedToCartSeparately = {
      ...this.productsAddedToCartSeparately,
      [productId]: true,
    };
    const thisCSP = document.getElementById(`bspd-csp-iframe${this.popupId}`);
    const thisCSPDocument = thisCSP.contentDocument || thisCSP.contentWindow.document;
    const addToCartButton = thisCSPDocument.querySelector(`button.bspd-csp-product-add-to-cart-btn-${productId}`);
    if (addToCartButton) {
      addToCartButton.classList.add("loader-btn");
      addToCartButton.style.filter = "grayscale(100%)";
      addToCartButton.disabled = true;
    }
    const selectedVariantId = this.selectedVariants[productId];
    const productData = this.productsToRender.find((product) => product.id === Number(productId));
    const variantData = productData?.variants.find((variant) => variant.id === Number(selectedVariantId));
    const variantDataToAdd = [{ id: variantData?.id, quantity: 1 }];
    let discountCode = "";
    const totalCartValue = this.getTotalCartValueFromSeparatelyAddedProducts();
    const productsAddedSeparately = Object.keys(this.productsAddedToCartSeparately).filter(
      (id) => this.productsAddedToCartSeparately[id],
    );
    if (this.discount.type !== "none") {
      discountCode = await this.#backendService.getSparkles({
        min: totalCartValue,
        discount: this.discount,
        products: productsAddedSeparately,
        name: "YMAL:CSP",
        appliesOnEachItem: true,
      });
    }
    window.productsAddedToCartUsingCSP = variantDataToAdd;
    fetch(`${window.Shopify.routes.root}cart/add.js`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attributes: {
          bspdCspId: this.popupId,
          createdBy: "bitespeed.co",
        },
        items: variantDataToAdd,
      }),
    })
      .then(async (response) => {
        if (this.discount.type !== "none" && discountCode) {
          await fetch(`${window.location.origin}/discount/${discountCode}`);
        }
        addToCartButton.classList.remove("loader-btn");
        addToCartButton.innerText = "Added";
        addToCartButton.style.filter = "grayscale(0%)";
        if (!this.alreadyConverted) {
          await this.#backendService.registerImpression(this.popupId, "addToCart", discountCode);
          this.alreadyConverted = true;
        }
        setTimeout(() => {
          addToCartButton.disabled = false;
          addToCartButton.innerText = this.popupJson?.unlayerJson?.design?.buttonText || "Add to cart";
        }, 250);
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  onAddToCartBulk = async () => {
    const thisCSP = document.getElementById(`bspd-csp-iframe${this.popupId}`);
    const thisCSPDocument = thisCSP.contentDocument || thisCSP.contentWindow.document;
    const addToCartButton = thisCSPDocument.querySelector("button.bspd-csp-add-to-cart-btn");
    if (addToCartButton) {
      addToCartButton.classList.add("loader-btn");
      addToCartButton.style.filter = "grayscale(100%)";
      addToCartButton.disabled = true;
    }
    const productsIdsSelected = Object.keys(this.selectedVariants);
    const finalVariantsDataToAdd = [];
    for (const productId of productsIdsSelected) {
      if (this.checkedVariants[productId]) {
        const variantId = this.selectedVariants[productId];
        const productData = this.productsToRender.find((product) => product.id === Number(productId));
        if (productData) {
          const variantData = productData.variants.find((variant) => variant.id === Number(variantId));
          if (variantData) {
            finalVariantsDataToAdd.push({ id: variantData.id, quantity: 1 });
          }
        }
      }
    }
    let discountCode = this.preloadedDiscount || "";
    const totalCartValue = this.getTotalCartValue();
    const numberOfProductSelected = this.getNumberOfProductsSelected();
    if (this.discount.type !== "none" && numberOfProductSelected >= this.productsToRender.length) {
      const lastProductAddedInCart = this.preloadProduct;
      const lastProductId = lastProductAddedInCart?.product_id;
      const selectedProductIds = productsIdsSelected.map(Number);
      const productsInDiscount = [lastProductId, ...selectedProductIds];
      const allProductsAreThereInPreloadedDiscount =
        productsInDiscount.length === this.productsIncludedInDiscount.length &&
        this.productsIncludedInDiscount?.every((productId) => productsInDiscount.includes(productId));
      if (!this.preloadedDiscount || !discountCode || !allProductsAreThereInPreloadedDiscount) {
        discountCode = await this.#backendService.getSparkles({
          min: totalCartValue,
          discount: this.discount,
          products: productsInDiscount,
          name: "FBT:CSP",
          appliesOnEachItem: false,
        });
      }
    }
    window.productsAddedToCartUsingCSP = finalVariantsDataToAdd;
    fetch(`${window.Shopify.routes.root}cart/add.js`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attributes: {
          bspdCspId: this.popupId,
          createdBy: "bitespeed.co",
        },
        items: finalVariantsDataToAdd,
      }),
    })
      .then(async (response) => {
        if (this.discount.type !== "none" && discountCode) {
          await fetch(`${window.location.origin}/discount/${discountCode}`);
        }
        addToCartButton.classList.remove("loader-btn");
        addToCartButton.innerText = "Added";
        addToCartButton.style.filter = "grayscale(0%)";
        if (!this.alreadyConverted) {
          await this.#backendService.registerImpression(this.popupId, "addToCart", discountCode);
          this.alreadyConverted = true;
        }
        setTimeout(() => {
          addToCartButton.disabled = false;
          addToCartButton.innerText = this.popupJson?.unlayerJson?.design?.buttonText || "Add to cart";
          this.handleClose();
          window.location.href = `${window.Shopify.routes.root}cart`;
        }, 250);
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  #sanitizeHTML = (str) => {
    if (typeof str !== "string") return "";
    const tempDiv = document.createElement("div");
    tempDiv.textContent = str;
    return tempDiv.innerHTML;
  };
}

class WebPushPopup extends PopupBS {
  #backendService;

  constructor(popupJson, browserService, backendService) {
    super(popupJson, browserService, backendService);
    this.#backendService = backendService;
  }

  show = async () => {
    if (!("serviceWorker" in navigator && "PushManager" in window)) return;

    const registration = await navigator.serviceWorker.register("/apps/bitespeed/worker.js");
    const { registerImpression } = this.#backendService;
    const { setCookie } = this.browserService;
    const { popupId, popupType } = this;

    const serviceWorker = registration.installing || registration.waiting || registration.active;

    if (!serviceWorker) return;

    const subscribeIfActivated = async () => {
      if (serviceWorker.state === "activated") {
        await subscribeUserToPush(registerImpression, setCookie, registration, popupId, popupType);
      }
    };

    await subscribeIfActivated();

    serviceWorker.addEventListener("statechange", async (e) => {
      if (e.target.state === "activated") {
        await subscribeUserToPush(registerImpression, setCookie, registration, popupId, popupType);
      }
    });

    // Ensure subscription is retrieved (optional, currently unused)
    await registration.pushManager.getSubscription();
  };
}

class LiveChatWidgetPopup extends PopupBS {
  popupJson = {};
  browserService = null;
  #backendService = null;
  widgetSelector = ".woot-widget-bubble";

  constructor(popupJson, browserService, backendService) {
    super(popupJson, browserService, backendService);

    this.popupJson = popupJson;
    this.browserService = browserService;
    this.#backendService = backendService;

    this.show();

    const viewsKey = `bspdViewsCnt-${this.popupId}`;
    const viewsCount = Number(localStorage.getItem(viewsKey)) || 0;
    localStorage.setItem(viewsKey, viewsCount + 1);
  }

  show = async () => {
    const { behaviour } = this.popupJson || {};
    if (behaviour?.UseBehavioralTargeting === true) {
      const shouldShow = await this.addPopupTrigger();
      if (!shouldShow) return;
    }

    this.render();
    this.onDemandTrigger();
  };

  render = () => {
    const CSDB_BASE_URL =
      window.Shopify?.shop === "mechdrift.myshopify.com" ? "https://chat.bitespeed.co" : "https://chat.bitespeed.co";

    if (document.getElementById("bitespeed-livechat-script")) return;

    const popupScript = document.createElement("script");
    popupScript.src = `${CSDB_BASE_URL}/packs/js/sdk.js`;
    popupScript.defer = true;
    popupScript.async = true;
    popupScript.type = "text/javascript";
    popupScript.id = "bitespeed-livechat-script";

    const liveChatSetup = async () => {
      if (this.popupJson?.popupHtml?.includes("websiteToken")) {
        let popupData;
        try {
          popupData = JSON.parse(this.popupJson.popupHtml);
        } catch (e) {
          console.error("Invalid popupHtml JSON", e);
          return;
        }
        const { websiteToken, chatButtonStyles } = popupData;

        const shopifyCart = await getUpdatedCartData(true);

        window.chatwootSDK.run({
          websiteToken,
          baseUrl: CSDB_BASE_URL,
          parentShopify: window.Shopify || {},
          meta: {
            parentShopify: window.Shopify || {},
            origin: window.location.origin,
            popupId: this.popupId,
            browserId: this.browserService.getBrowserId(),
            contactId: getCookieGlobal(BSPD_CONTACT_ID_COOKIE_ID),
            popupType: "live chat widget",
            shopifyCart,
          },
        });

        // window.chatwootSDK.run({
        //   websiteToken: WEBSITE_TOKEN,
        //   baseUrl: "https://csdbtest.bitespeed.co",
        //   parentShopify: "playhop.myshopify.com",
        //   meta: {
        //     parentShopify: "playhop.myshopify.com",
        //     origin: "/mobile-app",
        //     popupId: POPUP_ID,
        //     browserId: BROWSER_ID,
        //     contactId: BSPD_CONTACT_ID_COOKIE_ID,
        //     popupType: "live chat widget",
        //     shopifyCart: SHOPIFY_CART_DATA,
        //   },
        // });

        this.startTrackingEvents();

        const intervalId = setInterval(() => {
          const liveChatBubble = document.querySelector(this.widgetSelector);
          if (liveChatBubble && chatButtonStyles) {
            if (chatButtonStyles.bottom) liveChatBubble.style.bottom = chatButtonStyles.bottom;
            if (chatButtonStyles.left) liveChatBubble.style.left = chatButtonStyles.left;
            if (chatButtonStyles.size) liveChatBubble.style.transform = `scale(${chatButtonStyles.size})`;
            clearInterval(intervalId);
          }
        }, 10);

        await this.#backendService.registerImpression(this.popupId, "");
      }
    };

    popupScript.addEventListener("load", liveChatSetup, { once: true });
    popupScript.addEventListener("error", (e) => console.error("Failed to load the script", e));

    document.head.appendChild(popupScript);
  };

  startTrackingEvents = () => {
    const liveChatWidgetIframe = document.getElementById("chatwoot_live_chat_widget");

    const parseAttributeProducts = (attr) => {
      if (!attr) return [];
      try {
        return typeof attr === "string" ? JSON.parse(attr) : attr;
      } catch (e) {
        console.error("Error parsing bitespeed_cart_products:", e);
        return [];
      }
    };

    // Helper to update cart and notify iframe
    const updateCartAttribute = async (products) => {
      const response = await fetch("/cart/update.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          attributes: {
            bitespeed_cart_products: products,
          },
        }),
      });

      const updatedCartData = await response.json();
      if (liveChatWidgetIframe?.contentWindow) {
        liveChatWidgetIframe.contentWindow.postMessage(
          `chatwoot-widget:${JSON.stringify({ event: "SHOPIFY_CART_UPDATED", cartData: updatedCartData })}`,
          "*",
        );
      }
    };

    subscribeToCartDataChangeEvent(async (newCartData, isProductAdded, isProductRemoved) => {
      try {
        const existingAttribute = newCartData?.attributes?.bitespeed_cart_products;
        const attributeProducts = parseAttributeProducts(existingAttribute);
        const currentCartProducts = newCartData?.items || [];

        if (
          ((!isProductAdded && !isProductRemoved) || isProductRemoved) &&
          attributeProducts.length > 0 &&
          currentCartProducts.length === 0
        ) {
          await updateCartAttribute([]);
          return;
        }

        if ((isProductAdded || isProductRemoved) && attributeProducts.length > 0) {
          const bitespeedProductIds = new Set(attributeProducts.map((item) => item.id));

          const filteredProducts = currentCartProducts
            .filter((item) => bitespeedProductIds.has(item.id))
            .map((item) => ({
              id: item.id,
              quantity: item.quantity,
              currency: newCartData.currency || "INR",
              price: (item.price / 100).toFixed(2),
              shopUrl: window.Shopify?.shop || "",
            }));

          if (
            filteredProducts.length > 0 &&
            JSON.stringify(sortObjectKeys(existingAttribute)) !== JSON.stringify(sortObjectKeys(filteredProducts))
          ) {
            await updateCartAttribute(filteredProducts);
          }
        }
      } catch (error) {
        console.error("Error updating bitespeed_cart_products attribute:", error);
      }
    });

    window.addEventListener("message", async (event) => {
      if (!event?.data?.type) return;

      if (event.data.type === "CART_UPDATED") {
        try {
          const { id, quantity, type, attributes } = event.data.data || {};

          const cartRes = await fetch("/cart.js");
          const cart = await cartRes.json();

          const productIndex = cart?.items?.findIndex((product) => product.id === id) + 1; // Shopify line is 1-based

          if (type === "Add_TO_CART") {
            const requestBody = {
              form_type: "product",
              id,
              quantity,
            };

            // Add attributes if provided
            if (attributes) {
              requestBody.attributes = attributes;
            }

            await fetch("/cart/add.js", {
              method: "POST",
              headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
              },
              body: JSON.stringify(requestBody),
            });
          } else if (type === "QUANTITY_CHANGED") {
            const changeFormData = new URLSearchParams({
              line: productIndex,
              quantity,
            });

            await fetch("/cart/change.js", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
              },
              body: changeFormData.toString(),
            });
          }
        } catch (error) {
          console.error("Error Adding Product to Cart", error);
        }
      }

      if (event.data.type === "UPDATE_CART_ATTRIBUTES") {
        try {
          const response = await fetch("/cart/update.js", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify({
              attributes: event.data.attributes,
            }),
          });

          const data = await response.json();
        } catch (error) {
          console.error("Error Updating Shopify Cart", error);
        }
      }
    });
  };

  triggerLiveChat = () => {
    const liveChatBubble = document.querySelector(this.widgetSelector);
    if (liveChatBubble) {
      liveChatBubble.click();
    }
  };

  onDemandTrigger = async () => {
    const popupConfigString = this.popupJson?.popupHtml || "{}";
    if (!popupConfigString.includes("onDemandTriggers")) return;

    let onDemandTriggers;
    try {
      onDemandTriggers = JSON.parse(popupConfigString)?.onDemandTriggers;
    } catch (e) {
      console.error("Invalid popupHtml JSON for onDemandTriggers", e);
      return;
    }

    if (onDemandTriggers?.onElementClick) {
      const elementSelector = onDemandTriggers.onElementClick;
      const element = document.querySelector(elementSelector);
      if (element) {
        element.addEventListener("click", this.triggerLiveChat, { once: false });
      }
    }
  };
}

class AiNudgePopup extends PopupBS {
  constructor(popupJson, browserService, backendService) {
    super(popupJson, browserService, backendService, "nothing", "ai-nudge");

    this.initPopup();
  }

  initPopup = async () => {
    try {
      const shouldShow = await this.addPopupTrigger();
      if (shouldShow) {
        await this.show();

        const viewsKey = `bspdViewsCnt-${this.popupId}`;
        const viewsCount = Number(localStorage.getItem(viewsKey)) || 0;
        localStorage.setItem(viewsKey, viewsCount + 1);
      }
    } catch (error) {
      console.error("Error in showing ai nudge:", error);
    }
  };

  show = async () => {
    const { unlayerJson } = this.popupJson;
    const quickReplies =
      unlayerJson?.quickReply?.buttons?.map(({ buttonText, nodeId }) => ({
        text: buttonText,
        id: nodeId,
      })) || [];

    const cwConversationToken = getCookieGlobal("cw_conversation");
    const allowAINudge = getCookieGlobal("allow_ai_nudge");

    if (allowAINudge) {
      const shopUrl = window?.Shopify?.shop || "";
      const primaryMessage = unlayerJson?.messages?.primaryMessage || "";

      if (shopUrl && cwConversationToken && primaryMessage) {
        await fetch("https://restapis.bitespeed.co/api/v1/liveChat/sendAINudgeMessage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shopUrl,
            cwConversationToken,
            payload: {
              text: primaryMessage,
              quickReplies,
            },
          }),
        });
      }
    }
  };
}

class PopupFactory {
  browserService = null;
  #backendService = null;

  constructor(browserService, backendService) {
    this.browserService = browserService;
    this.#backendService = backendService;
  }

  #getPopup = (popupJson) => {
    const { type } = popupJson;
    const popupArgs = [popupJson, this.browserService, this.#backendService];
    switch (type) {
      case "stw":
        return new STWPopup(...popupArgs);
      case "visual popup":
        return new VisualPopup(...popupArgs);
      case "chat widget":
        return new ChatWidgetPopup(...popupArgs);
      case "bar":
        return new BarPopup(...popupArgs);
      case "cross-sell-popup":
        return new CrossSellPopup(...popupArgs);
      case "webPush":
        return new WebPushPopup(...popupArgs);
      case "live chat widget":
        return new LiveChatWidgetPopup(...popupArgs);
      case "ai-nudge":
        return new AiNudgePopup(...popupArgs);
      default:
        return null;
    }
  };

  getPopups = (popupJsons) => {
    const popups = {};
    const blockedPopups = this.browserService.getBlockedPopups();

    if (!Array.isArray(popupJsons)) {
      return popups;
    }

    for (const popupJson of popupJsons) {
      const { id: popupId } = popupJson;
      if (blockedPopups.includes(popupId)) continue;
      const key = `${popupId}:bitespeed_popup`;
      const popupInstance = this.#getPopup(popupJson);
      if (popupInstance) {
        popups[key] = popupInstance;
      }
    }
    return popups;
  };
}

/**
 * this method is the exact copy of the method in the PopupBS class
 */
const shouldShowForIndianStates = async (
  Who,
  checkIfUserLiesInStates, // NOTE: this is a function
) => {
  const selected = String(Who["By Location"].selected).toLowerCase();
  if (selected.includes("show to all indian states")) return true;

  return new Promise((resolve) => {
    const stateAttributes = Who["By Location"].attributes;
    const lowecasedStates = stateAttributes.map((state) => state.toLowerCase());
    const localData = localStorage.getItem("userLiesInState");
    if (localData && localData.includes("matchedState") && localData.includes("expiryDate")) {
      const data = JSON.parse(localData);
      const expiryDate = new Date(data.expiryDate);
      const currentDate = new Date();
      if (currentDate < expiryDate && data.matchedState) {
        return resolve(lowecasedStates.includes(String(data.matchedState).toLowerCase()));
      }
    }

    // Wrap the geolocation and BspdAPI call in a Promise
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          try {
            const res = await checkIfUserLiesInStates(stateAttributes, [longitude, latitude]);
            const response = res.result;
            let isUserInState = response.result;
            let matchedState = response.matchedState;
            let expiryDate = response.expiryDate;

            if (isUserInState === true) {
              localStorage.setItem(
                "userLiesInState",
                JSON.stringify({
                  matchedState,
                  expiryDate: expiryDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                }),
              );
              if (selected.includes("show to specific indian states") && !selected.includes("don't")) resolve(true);
              if (selected.includes("don't show to specific indian states")) resolve(false);
            } else {
              if (selected.includes("show to specific indian states") && !selected.includes("don't")) resolve(false);
              if (selected.includes("don't show to specific indian states")) resolve(true);
            }
          } catch {
            resolve(false);
          }
        },
        () => resolve(false),
      );
    } else {
      resolve(true);
    }
  });
};

class BackendService {
  #shopDomain = "";
  #browserId = "";
  #shopUrl = "";

  constructor({ shopDomain, browserId }) {
    this.#shopDomain = shopDomain;
    this.#browserId = browserId;
    this.BspdAPI = new BspdAPI();
  }
  getLocationData = async () => {
    try {
      const cache = localStorage.getItem(LOCATION_CACHE_KEY);
      const now = Date.now();
      if (cache)
        try {
          const { detected, expires } = JSON.parse(cache);
          if (expires > now && detected) return (globalLocationData = detected);
        } catch {}
      const { detected = {} } = (await this.BspdAPI.get("/detect", "")) || {};
      globalLocationData = detected;
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ detected, expires: now + LOCATION_EXPIRY_MS }));
      return detected;
    } catch {
      return null;
    }
  };

  getStorePopups = async () => {
    try {
      let getCountryCode = true;
      countryCodeBitespeed = getCookieGlobal("countryCodeBS");
      if (countryCodeBitespeed && countryCodeBitespeed !== "") getCountryCode = false;

      const shopUrl = window.Shopify?.shop || "";
      this.#shopUrl = shopUrl;

      const res = await fetch(
        `https://dob8mz9t40csq.cloudfront.net/getPopups?shopUrl=${shopUrl}&getCountryCode=${getCountryCode}`,
      );
      const response = await res.json();

      let storePopupItems = response?.storePopups?.Items;
      if (Array.isArray(storePopupItems) && storePopupItems.length > 0) {
        let foundStableStateBasedPopup = false;

        storePopupItems = storePopupItems.sort((a, b) => {
          const aState = a.behaviour?.Who?.["By Location"]?.selected?.toLowerCase().includes("states");
          const bState = b.behaviour?.Who?.["By Location"]?.selected?.toLowerCase().includes("states");
          if (aState && !bState) return -1;
          if (!aState && bState) return 1;
          return 0;
        });

        try {
          for (const popup of storePopupItems) {
            const isStatewisePopup = popup.behaviour?.Who?.["By Location"]?.selected?.toLowerCase().includes("states");
            if (isStatewisePopup && !foundStableStateBasedPopup) {
              const showForState = await shouldShowForIndianStates(popup.behaviour.Who, this.checkIfUserLiesInStates);
              if (showForState) {
                foundStableStateBasedPopup = true;
              }
            }
          }
        } catch (err) {
          console.log("SOMETHING WENT WRONG", err);
        }
      }

      countryCodeBitespeed = response.callingCountryCode || countryCodeBitespeed;
      if (countryCodeBitespeed && countryCodeBitespeed !== "") {
        setCookieGlobal("countryCodeBS", countryCodeBitespeed, 30);
      }
      if (response?.shopUrl) {
        this.#shopUrl = response.shopUrl;
      }
      if (response?.storePopups && storePopupItems) {
        return storePopupItems;
      }
    } catch (e) {
      console.error(`Error in Bitespeed Popups: Error while fetching popups: ${e}`);
    }
  };

  registerImpression = async (popupId, event = "", discountCode = "") => {
    const contactID = getCookieGlobal(BSPD_CONTACT_ID_COOKIE_ID);
    const email = getCookieGlobal(BSPD_CONTACT_EMAIL_COOKIE_ID);
    const phone = getCookieGlobal(BSPD_CONTACT_PHONE_COOKIE_ID);

    const isUniqueEventImpressionVector =
      event === "" ||
      event === "impression" ||
      event === "clicked" ||
      event === "addToCart" ||
      event === "popupPFInteracted";

    let cookieId = "";
    if (event === "impression" || event === "") {
      cookieId = `${BSPD_UNIQUE_IMPRESSION_COOKIE_ID}-${popupId}-${this.#browserId}`;
    } else if (event === "addToCart" || event === "clicked" || event === "popupPFInteracted") {
      cookieId = `${BSPD_UNIQUE_IMPRESSION_COOKIE_ID}-${event}-${popupId}-${this.#browserId}`;
    }

    const isUniqueImpressionRegistered = getCookieGlobal(cookieId);

    if (!isUniqueImpressionRegistered) {
      setCookieGlobal(cookieId, "true", 3);
    }

    this.BspdAPI.post("/impressionsInvoker", {
      type: event || "impression",
      popupId,
      browserId: this.#browserId,
      shopUrl: this.#shopUrl || window.Shopify?.shop || "",
      createdAt: new Date().toISOString(),
      impressionAndConversionId: Util.create_UUID(),
      origin: window.location.href,
      contactID: contactID || undefined,
      discountCode,
      isDiscountEnabled: !!(discountCode && discountCode.length > 0),
      email: email || undefined,
      phone: phone || undefined,
      isUniqueImpression: isUniqueEventImpressionVector && !isUniqueImpressionRegistered,
    });
  };

  registerConversion = async (
    popupId,
    { country = "", phone = "", email = "", name = undefined, consentProvided = true, extraUserAttributes = {} } = {},
    { getDiscount = false, discountCode = "", requiredDiscount, staticDiscount = "" } = {},
    { listId = undefined, popupType = "", webPushSubscription = undefined } = {},
    { productId, variantId } = {
      productId: typeof product_id_liquid !== "undefined" ? product_id_liquid : "",
      variantId: typeof variant_id_liquid !== "undefined" ? variant_id_liquid : "",
    },
    { popupTrigger } = { popupTrigger: "" },
  ) => {
    try {
      const nameSplit = typeof name === "string" ? name.trim().split(/\s+/) : [];
      const firstName = nameSplit.length > 0 ? nameSplit[0] : undefined;
      const lastName = nameSplit.length > 1 ? nameSplit.slice(1).join(" ") : undefined;

      let requestBody = {
        shopUrl: this.#shopUrl || window.Shopify?.shop || "",
        type: "conversion",
        popupType,
        popupId,
        popupTrigger,
        browserId: this.#browserId,
        getDiscount,
        requiredDiscount,
        discountCode,
        staticDiscount,
        isDiscountEnabled: !!(discountCode && discountCode.length > 0),
        country,
        phone,
        email,
        name,
        firstName,
        lastName,
        consentProvided,
        createdAt: new Date().toISOString(),
        listId,
        impressionAndConversionId: Util.create_UUID(),
        origin: window.location.href,
        meta: {
          productId,
          variantId,
        },
        attributes: {
          bspd_dob: extraUserAttributes?.dob || undefined,
          bspd_city: extraUserAttributes?.city || undefined,
          bspd_gender: extraUserAttributes?.gender || undefined,
          bspd_petanimal_name: extraUserAttributes?.petAnimalName || undefined,
          bspd_petanimal_dob: extraUserAttributes?.petAnimalDob || undefined,
          bspd_zodiac_sign: extraUserAttributes?.zodiac || undefined,
          bspd_anniversary: extraUserAttributes?.anniversary || undefined,
          bspd_shoe_size: extraUserAttributes?.shoeSize || undefined,
          bspd_apparel_size: extraUserAttributes?.apparelSize || undefined,
          bspd_natural_number: extraUserAttributes?.naturalNumber || undefined,
        },
      };

      if (String(popupType).toLowerCase() === "webpush") {
        requestBody = {
          ...requestBody,
          webPushSubscription,
          popupType,
        };
      }

      const res = await this.BspdAPI.post("/preConversionHandler", requestBody);

      performPostConversionBrandActions({
        phone,
        email,
        name,
        country,
      });

      return {
        ...res,
        2: res?.results?.errorCode === "USER_ALREADY_CONVERTED",
      };
    } catch (e) {
      console.error(`Error in registering conversion: ${e}`);
    }
  };

  getDiscountCode = async (popupId, getDiscount, requiredDiscount) => {
    try {
      const res = await this.BspdAPI.post(
        "/getDiscountHandler",
        {
          popupId,
          browserId: this.#browserId,
          shopUrl: this.#shopUrl || window.Shopify?.shop || "",
          getDiscount,
          requiredDiscount,
        },
        "https://rwkcgc85i3.execute-api.us-east-1.amazonaws.com/getDiscountHandler",
      );
      const discountCode = findDiscountCodeInResponse(res)?.[0]?.code;

      if (
        bitespeed_popups &&
        bitespeed_popups[`${popupId}:bitespeed_popup`] &&
        bitespeed_popups[`${popupId}:bitespeed_popup`].browserService
      )
        bitespeed_popups[`${popupId}:bitespeed_popup`].browserService.setCookie(
          `${popupId}:discountCode`,
          discountCode,
          0,
          5,
        );
      return res;
    } catch (e) {
      console.error(`Error in fetching discount: ${e}`);
    }
  };

  getSparkles = async (
    options = {
      min: 0,
      discount: {},
      products: [],
      name: "",
    },
  ) => {
    const encryptedDiscountPayload = await sauceFactory(JSON.stringify(options), window.Asdf);

    const code = await this.BspdAPI.post("/getPersonalisedDiscount", {
      shopUrl: window.Shopify?.shop || "",
      data: encryptedDiscountPayload,
    });

    return code.code;
  };

  getQuickProductMetadata = async (shopUrl, productIds, requiredFields) => {
    if (!Array.isArray(productIds) || productIds.length === 0) return null;
    if (!Array.isArray(requiredFields) || requiredFields.length === 0) return null;

    const res = await this.BspdAPI.post("/getQuickProductMetadata", {
      shopUrl: shopUrl || "",
      productIds,
      requiredFields,
    });

    return res;
  };

  getDynamicPopupData = async ({ popupId, productId, popupConfig = {}, products = [] }) => {
    try {
      const getDynamicHTML = await this.BspdAPI.post("/getDynamicPopupData", {
        shopUrl: window.Shopify?.shop || "",
        popupId,
        productId,
        popupConfig: JSON.stringify(popupConfig),
        products: JSON.stringify(products),
      });

      return getDynamicHTML;
    } catch (e) {
      console.error(`Error in fetching dynamic popup data: ${e}`);
    }
  };

  checkIfUserLiesInStates = async (allowedStates, userCoords) => {
    try {
      const res = await this.BspdAPI.post("/checkUserLiesInState", {
        allowedStates,
        userCoords,
      });

      return res;
    } catch (e) {
      console.error(`Error in checking user lies in states: ${e}`);
    }
  };
}

const customBrandInitLogic = async (interval) => {
  let phone = "",
    email = "",
    name = "";
  const { customerEmail = "", customerPhone = "", customerName = "" } = window || {};
  if (customerEmail.length > 6) email = customerEmail;
  if (customerPhone.length > 6) phone = customerPhone.replace(/\+/g, "");
  if (customerName.length > 6) name = customerName;

  if (phone || email) {
    try {
      const res = await globalBackendService.registerConversion(undefined, { phone, email, name });
      const contactId = res?.results?.[1]?.value?.id ?? res?.results?.[1]?.id ?? res?.results?.contactId;

      if (res && contactId) {
        setCookieGlobal(BSPD_CONTACT_ID_COOKIE_ID, contactId, 1000);
        clearInterval(interval);
      }
    } catch (error) {}
  }
};

const initPopupService = async () => {
  try {
    const browserService = new BrowserService();
    const backendService = new BackendService({
      shopDomain: browserService.getShopDomain(),
      browserId: browserService.getBrowserId(),
    });
    globalBackendService = backendService;
    await globalBackendService.getLocationData();

    let popupJsons = localStorage.getItem(POPUP_JSONS_KEY);
    const isCachingDisabled = DISABLE_CACHING_STORES.includes(window.Shopify?.shop);

    if (isCachingDisabled) {
      popupJsons = await backendService.getStorePopups();
    } else if (
      popupJsons &&
      popupJsons.includes("expires") &&
      popupJsons.includes("popupData") &&
      popupJsons.includes("popupHtml") &&
      popupJsons.includes("behaviour") &&
      (() => {
        try {
          return JSON.parse(popupJsons).expires > Date.now();
        } catch {
          return false;
        }
      })()
    ) {
      popupJsons = JSON.parse(popupJsons).popupData;
    } else {
      popupJsons = await backendService.getStorePopups();
      localStorage.setItem(
        POPUP_JSONS_KEY,
        JSON.stringify({
          popupData: popupJsons,
          expires: Date.now() + POPUP_EXPIRY_MS,
        }),
      );
    }

    const bspdDevTestPopupId = localStorage.getItem(BSPD_DEV_TEST_POPUP_ID);
    if (bspdDevTestPopupId && Array.isArray(popupJsons)) {
      popupJsons = popupJsons.filter(({ id }) => String(id) === String(bspdDevTestPopupId));
    }

    const popupFactory = new PopupFactory(browserService, backendService);
    bitespeed_popups = popupFactory.getPopups(popupJsons);

    const popupPromises = Object.entries(bitespeed_popups || {})
      .filter(([, popup]) => ["stw", "chat widget", "visual popup", "webPush"].includes(popup?.popupType))
      .map(([popupId, popup]) =>
        popup.addPopupTrigger().then((toShow) => {
          if (toShow) {
            const shown = popup.show();
            if (shown === null) {
              return;
            }
            popup.updateLastViewedDate();
            const popupIdd = popupId.split(":")[0];
            const viewsCntKey = `bspdViewsCnt-${popupIdd}`;
            const viewsCnt = Number(localStorage.getItem(viewsCntKey)) || 0;
            localStorage.setItem(viewsCntKey, viewsCnt + 1);
          }

          if (popup?.popupType === "visual popup") bspdCurrentPopup = popup;
        }),
      );

    window.addEventListener("load", () => {
      customBrandInitLogic();
      const interval = setInterval(() => {
        customBrandInitLogic(interval);
      }, 5000);
    });

    await Promise.allSettled(popupPromises);
  } catch (e) {
    console.error(`Error in Bitespeed Popups: ${e} ${e?.stack}`);
  } finally {
    try {
      const url = new URL(window.location.href);
      const contactIdBitespeed = url.searchParams.get("bspdCId");
      if (contactIdBitespeed) {
        setCookieGlobal("contactIdBitespeed", contactIdBitespeed, 1000, 1);
      }
    } catch (err) {
      // Ignore URL parsing errors
    }
  }
};

function addErrorTextBeforeSubmit(
  innerDoc,
  submitBtnID,
  errorText,
  before = true,
  textColor = "red",
  customBtnEle = null,
) {
  const submitBtn =
    customBtnEle || innerDoc.getElementById(submitBtnID) || innerDoc.getElementsByClassName(submitBtnID)[0];
  if (!submitBtn || !submitBtn.parentElement) return;

  const errorTextElement = innerDoc.createElement("p");
  errorTextElement.textContent = errorText; // safer than innerHTML
  errorTextElement.style.color = textColor;
  errorTextElement.style.fontSize = "14px";
  errorTextElement.style.fontFamily = "Arial, sans-serif";
  errorTextElement.style.textAlign = "center";
  errorTextElement.style.padding = "6px 10px";
  errorTextElement.id = ERROR_TEXT_ID;

  if (before) {
    submitBtn.parentElement.insertBefore(errorTextElement, submitBtn);
  } else {
    submitBtn.parentElement.appendChild(errorTextElement);
  }
}

function removeErrorText(innerDoc) {
  const errorTextElement = innerDoc.getElementById(ERROR_TEXT_ID);
  if (errorTextElement) errorTextElement.remove();
}

const getInputElement = (doc, inputId) => doc.getElementById(inputId) || doc.getElementsByClassName(inputId)[0] || null;
const focusErrorBoundaryOnInput = (id, innerDoc, inputId) => {
  const inputElement = getInputElement(innerDoc, inputId);
  if (!inputElement) return;
  if (!Object.prototype.hasOwnProperty.call(defaultBorderStyle, id)) defaultBorderStyle[id] = inputElement.style.border;
  inputElement.style.border = "1px solid red";
  inputElement.focus();
};
const revertErrorBoundaryOnInput = (id, innerDoc, inputId) => {
  const inputElement = getInputElement(innerDoc, inputId);
  if (!inputElement) return;
  if (Object.prototype.hasOwnProperty.call(defaultBorderStyle, id)) inputElement.style.border = defaultBorderStyle[id];
  else inputElement.style.border = "none";
};

const areVisualPopupInputsValid = (
  innerDoc,
  domId = "",
  inputType = "", // name | phone | email | gender | dob
  extraDeps = { country: "" },
) => {
  const inputEl = innerDoc.getElementById(domId);

  removeErrorText(innerDoc);

  if (inputEl) {
    const { value: inputValue = "", required, dataset } = inputEl;
    const trimmedValue = inputValue.trim();

    const isOptional = inputType !== "phone" && inputType !== "email" && (required === false || required === "false");
    const isPhoneOrEmailOptional =
      (inputType === "phone" || inputType === "email") && (dataset?.optional === "true" || dataset?.optional === true);
    if (isOptional || isPhoneOrEmailOptional) return true;

    const addError = (containerId, message) => {
      addErrorTextBeforeSubmit(innerDoc, containerId, message, false);
    };

    switch (inputType) {
      case "name":
        if (trimmedValue.length === 0) {
          addError(`${domId}Container`, "Please enter a valid name.");
          return false;
        }
        break;
      case "phone":
        if (!bitespeedValidatePhoneNumberBS(extraDeps?.country || "", inputValue)) {
          addError("inputWAWidget", "Invalid phone number, please enter a valid phone number.");
          return false;
        }
        break;
      case "email":
        if (!bitespeedValidateEmail(inputValue)) {
          addError("STWemailWAWidget", "Invalid email, please enter a valid email.");
          return false;
        }
        break;
      case "number":
        if (!/^\d+$/.test(trimmedValue)) {
          addError(`${domId}Container`, "Please enter a valid amount.");
          return false;
        }
      case "gender":
        if (!inputValue) {
          addError(`${domId}Container`, "Select a valid gender.");
          return false;
        }
        break;
      case "dob":
        if (!inputValue) {
          addError(`${domId}Container`, "Please enter a valid date of birth.");
          return false;
        }
        if (new Date(inputValue) > new Date()) {
          addError(`${domId}Container`, "Date of birth cannot be in future.");
          return false;
        }
        break;
      default:
        break;
    }
  }

  if (inputType === "phone" && inputEl?.value) {
    setCookieGlobal(BSPD_CONTACT_PHONE_COOKIE_ID, inputEl.value, 1000, 1);
  } else if (inputType === "email" && inputEl?.value) {
    setCookieGlobal(BSPD_CONTACT_EMAIL_COOKIE_ID, inputEl.value, 1000, 1);
  }

  return true;
};

async function nextView(thisButton) {
  const sanitizeInput = (value) => (typeof value === "string" ? value.replace(/[<>]/g, "") : value);
  const getInputValue = (doc, id) => {
    const el = doc.getElementById(id);
    return el ? sanitizeInput(el.value) : undefined;
  };
  const setButtonState = (button, { text, disabled, onClick, cursor }) => {
    button.innerHTML = text;
    button.disabled = disabled;
    button.onclick = onClick;
    if (cursor) button.style.cursor = cursor;
  };

  const popupId = thisButton.getAttribute("data-popupid");
  const popupKey = `${popupId}:bitespeed_popup`;
  const thisPopup = bitespeed_popups[popupKey];

  let viewSelector = `popup-iframe-open-${popupId}`;
  const { currentView } = thisPopup;

  viewSelector =
    currentView === "OpenView"
      ? `popup-iframe-open-${popupId}`
      : currentView === "CompletedView"
        ? `popup-iframe-completed-${popupId}`
        : currentView.includes("Design") && currentView.includes("View") && currentView.startsWith("Design")
          ? `popup-iframe-${currentView}-${popupId}`
          : viewSelector;

  const iframe = document.getElementById(viewSelector);
  if (!iframe) return;

  const innerDoc = iframe.contentDocument || iframe.contentWindow.document;

  const country = getInputValue(innerDoc, "BiteSpeedDialCode") || getInputValue(innerDoc, "BiteSpeedWAChatSelect");

  const phone = getInputValue(innerDoc, "BiteSpeedWAChatInput");
  const email = getInputValue(innerDoc, "STWBiteSpeedWAChatInputEmail");
  const name = getInputValue(innerDoc, "biteSpeedPopupNameInput");
  const gender = getInputValue(innerDoc, "biteSpeedPopupGenderInput");
  const dob = getInputValue(innerDoc, "biteSpeedPopupDOBInput");
  const city = getInputValue(innerDoc, "biteSpeedPopupCityInput");
  const petAnimalName = getInputValue(innerDoc, "biteSpeedPopupPetAnimalNameInput");
  const petAnimalDob = getInputValue(innerDoc, "biteSpeedPopupPetAnimalDOBInput");
  const zodiac = getInputValue(innerDoc, "biteSpeedPopupZodiacSignInput");
  const anniversary = getInputValue(innerDoc, "biteSpeedPopupAnniversaryInput");
  const apparelSize = getInputValue(innerDoc, "biteSpeedPopupApparelSizeInput");
  const shoeSize = getInputValue(innerDoc, "biteSpeedPopupShoeSizeInput");
  const naturalNumber = getInputValue(innerDoc, "biteSpeedPopupNumberInput");

  const consentCheckbox = innerDoc.getElementById("bspdGdprCheckbox");
  const isConsentGiven = consentCheckbox ? consentCheckbox.checked : true;

  const inputFieldsIdMap = {
    phone: ["BiteSpeedWAChatInput"],
    email: ["STWBiteSpeedWAChatInputEmail"],
    name: ["biteSpeedPopupNameInput", "biteSpeedPopupPetAnimalNameInput", "biteSpeedPopupCityInput"],
    number: ["biteSpeedPopupNumberInput"],
    gender: ["biteSpeedPopupGenderInput"],
    dob: ["biteSpeedPopupDOBInput", "biteSpeedPopupPetAnimalDOBInput", "biteSpeedPopupAnniversaryInput"],
    zodiac: ["biteSpeedPopupZodiacSignInput"],
    size: ["biteSpeedPopupApparelSizeInput", "biteSpeedPopupShoeSizeInput"],
  };

  for (const [inputType, inputIds] of Object.entries(inputFieldsIdMap)) {
    for (const domId of inputIds) {
      const isValid = areVisualPopupInputsValid(innerDoc, domId, inputType, { country });
      if (!isValid) return;
    }
  }

  const {
    discountType,
    DiscountCodeValuePercentage,
    DiscountCode,
    browserService,
    behaviour,
    teaserSettings,
    popupType,
    multiStepPopupFormdata,
  } = thisPopup;

  const shouldGetDiscount = discountType?.includes("Dynamic") || false;
  const shouldGetStaticDiscount = discountType?.includes("Static") || false;

  const requiredDiscount = shouldGetDiscount
    ? {
        Value: parseInt(DiscountCodeValuePercentage, 10),
        Type: discountType,
        Label: `${DiscountCodeValuePercentage}% OFF`,
      }
    : {};

  const staticDiscount = !shouldGetDiscount && shouldGetStaticDiscount ? DiscountCode : -1;

  const initialButtonText = thisButton.innerHTML;
  setButtonState(thisButton, { text: "Please wait...", disabled: true, onClick: null });

  let discountCode;
  let discountCodeObj;

  const allUserFields = {
    country: country || undefined,
    phone: phone || undefined,
    email: email || undefined,
    name: name || undefined,
    city: city || undefined,
    gender: gender || undefined,
    dob: dob || undefined,
    petAnimalName: petAnimalName || undefined,
    petAnimalDob: petAnimalDob || undefined,
    zodiac: zodiac || undefined,
    anniversary: anniversary || undefined,
    apparelSize: apparelSize || undefined,
    shoeSize: shoeSize || undefined,
    naturalNumber: naturalNumber || undefined,
  };

  const { isNextViewAvailable, nextView } = thisPopup.checkForNextViewAvailability();
  let nextViewCalled = false;

  if (isNextViewAvailable) {
    thisPopup.updateVirtualStateForPopupNextViewIntent({ ...allUserFields });
    if (nextView !== "CompletedView") {
      nextViewCalled = true;
      thisPopup.nextView();
    }
  } else if (teaserSettings?.startDisplaying === "after_popup") {
    thisPopup.toggleTeaser(true);
  }

  const conversionPayload = {
    country: multiStepPopupFormdata.country || country,
    phone: multiStepPopupFormdata.phone || phone,
    email: multiStepPopupFormdata.email || email,
    name: multiStepPopupFormdata.name || name || undefined,
    consentProvided: isConsentGiven,
    extraUserAttributes: allUserFields,
  };

  const conversionOptions = {
    requiredDiscount,
    staticDiscount,
  };

  if (shouldGetDiscount) {
    const preLoadedDiscount = browserService.getCookie(`${popupId}:discountCode`);
    if (preLoadedDiscount) {
      discountCode = preLoadedDiscount;
      if (!nextViewCalled) thisPopup.nextView(discountCode);

      discountCodeObj = await thisPopup.handleConversion(
        conversionPayload,
        {
          ...conversionOptions,
          getDiscount: false,
          discountCode: preLoadedDiscount,
        },
        {
          listId: behaviour?.List?.selected,
          popupType: "",
          webPushSubscription: null,
        },
      );
    } else {
      discountCodeObj = await thisPopup.handleConversion(
        conversionPayload,
        {
          ...conversionOptions,
          getDiscount: true,
          discountCode: preLoadedDiscount,
        },
        {
          listId: behaviour?.List?.selected,
          popupType,
          webPushSubscription: null,
        },
      );

      if (discountCodeObj[2] === true) {
        addErrorTextBeforeSubmit(
          innerDoc,
          "bitespeedNextButton",
          behaviour?.["Who"]?.["Optin Cooldown Period"]?.warningText || "You've already claimed the discount code.",
          true,
          behaviour?.["Who"]?.["Optin Cooldown Period"]?.warningTextColor || "#ef4040",
          thisButton.parentElement,
        );

        setButtonState(thisButton, {
          text: initialButtonText,
          disabled: false,
          onClick: () => nextView(thisButton),
          cursor: "pointer",
        });

        return;
      }

      discountCode = findDiscountCodeInResponse(discountCodeObj)?.[0]?.code;
      if (!nextViewCalled) thisPopup.nextView(discountCode);
    }
  } else {
    discountCode = DiscountCode;
    if (!nextViewCalled) thisPopup.nextView(discountCode);

    discountCodeObj = await thisPopup.handleConversion(
      conversionPayload,
      {
        ...conversionOptions,
        getDiscount: false,
        discountCode,
        staticDiscount: discountCode,
      },
      {
        listId: behaviour?.List?.selected,
        popupType,
        webPushSubscription: null,
      },
    );
  }
}

async function preloadDiscount() {
  const id = bspdCurrentPopup.popupJson.id;
  const popupKey = `${id}:bitespeed_popup`;
  const popup = bitespeed_popups[popupKey];
  const existingPreLoadedDiscount = popup.browserService.getCookie(`${id}:discountCode`);
  if (existingPreLoadedDiscount) return;

  const shouldGetDiscount = popup?.discountType?.includes("Dynamic") || false;
  if (shouldGetDiscount)
    await popup.preloadDiscount(true, {
      Value: parseInt(bspdCurrentPopup?.DiscountCodeValuePercentage, 10),
      Type: discountType,
      Label: `${bspdCurrentPopup?.DiscountCodeValuePercentage}% OFF`,
    });
}

function closePopup(button, manualPopupId) {
  const popupId = manualPopupId || button.getAttribute("data-popupid");
  const popupKey = `${popupId}:bitespeed_popup`;
  const popup = bitespeed_popups[popupKey];

  popup.close();

  const { teaserSettings = {}, teaserDisabled, isACustomer, toggleTeaser } = popup;
  const { stopDisplaying, startDisplaying } = teaserSettings;

  if (stopDisplaying === "popup_close") {
    toggleTeaser(false);
  } else if (!teaserDisabled && (startDisplaying === "after_popup" || startDisplaying === "before_popup")) {
    if (stopDisplaying === "visitor_converts" && typeof isACustomer === "function" && isACustomer()) {
      return;
    }
    toggleTeaser(true);
  }
}

function closePopupBitespeed(button) {
  const popupId = button.getAttribute("data-popupid");
  const popupKey = `${popupId}:bitespeed_popup`;
  const popup = bitespeed_popups[popupKey];

  popup.close();

  const { teaserSettings = {}, teaserDisabled, isACustomer, toggleTeaser } = popup;
  const { stopDisplaying, startDisplaying } = teaserSettings;

  if (stopDisplaying === "popup_close") {
    toggleTeaser(false);
  } else if (!teaserDisabled && (startDisplaying === "after_popup" || startDisplaying === "before_popup")) {
    if (stopDisplaying === "visitor_converts" && typeof isACustomer === "function" && isACustomer()) {
      return;
    }
    toggleTeaser(true);
  }
}

function findDiscountCodeInResponse(obj) {
  if (!obj || typeof obj !== "object") return null;
  if (obj.nodes) return obj.nodes;
  for (const value of Object.values(obj)) {
    if (typeof value === "object") {
      const result = findDiscountCodeInResponse(value);
      if (result) return result;
    }
  }
  return null;
}

function copyCodeSTW(e) {
  e.preventDefault();
  const iframe = document.getElementById("stw-popup-iframe");
  const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
  if (!doc) return;

  const discountBox = doc.getElementById("STWDicountBox");
  const codeText = discountBox?.textContent?.trim();
  if (!codeText) return;

  const copyEl = doc.getElementById("STWDicountBoxCopy");
  if (!copyEl) return;

  const resetCopyState = () => {
    copyEl.style.color = "";
    copyEl.textContent = "Copy";
  };

  copyEl.textContent = "Copied!";
  copyEl.style.color = "#4CAF50";

  navigator.clipboard
    .writeText(codeText)
    .then(() => {
      copyEl.textContent = "Copied!";
      if (copyElementTimeout) clearTimeout(copyElementTimeout);
      copyElementTimeout = setTimeout(resetCopyState, 3000);
    })
    .catch(() => {
      copyEl.textContent = "Failed to copy";
      copyEl.style.color = "red";
      setTimeout(resetCopyState, 3000);
    });
}

function copyCodeVisualPopup(e) {
  e.preventDefault();
  const popupId = e.target?.dataset?.popupid;
  if (!popupId) return;

  let copyElement;
  const getDiscountCodeFromView = (view) => {
    const iframeId =
      view === "OpenView"
        ? `popup-iframe-open-${popupId}`
        : view === "CompletedView"
          ? `popup-iframe-completed-${popupId}`
          : `popup-iframe-${view}-${popupId}`;
    const iframe = document.getElementById(iframeId);
    if (!iframe) return null;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return null;

    const discountBox = doc.getElementById("STWDicountBox");
    copyElement = doc.getElementById("STWDicountBoxCopy");

    if (copyElement) {
      copyElement.textContent = "Copied!";
      copyElement.style.color = "#4CAF50";
    }

    return discountBox?.textContent?.trim() || null;
  };

  const codeText =
    getDiscountCodeFromView("OpenView") ||
    getDiscountCodeFromView("CompletedView") ||
    getDiscountCodeFromView("Design1View") ||
    getDiscountCodeFromView("Design2View") ||
    getDiscountCodeFromView("Design3View") ||
    getDiscountCodeFromView("Design4View") ||
    getDiscountCodeFromView("Design5View") ||
    getDiscountCodeFromView("Design6View");
  if (!codeText || !copyElement) return;

  const resetCopyState = () => {
    copyElement.style.color = "";
    copyElement.textContent = "Copy";
  };

  navigator.clipboard
    .writeText(codeText)
    .then(() => {
      if (copyElementTimeout) clearTimeout(copyElementTimeout);
      copyElementTimeout = setTimeout(resetCopyState, 3000);
    })
    .catch(() => {
      copyElement.textContent = "Failed to copy";
      copyElement.style.color = "red";
      setTimeout(resetCopyState, 3000);
    });
}

const getIframeBottomWidgetPreview = () => {
  const iframe = document.getElementById("chat-popup-iframe-bottom");
  const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
  return doc?.getElementById("WidgetPreview") || null;
};

function expandBiteSpeedCW() {
  const iframeTop = document.getElementById("chat-popup-iframe");
  const iframeBottom = document.getElementById("chat-popup-iframe-bottom");
  if (!iframeBottom) return;

  const innerDocBottom = iframeBottom.contentDocument || iframeBottom.contentWindow.document;
  const waIcon = innerDocBottom.getElementById("iconWABiteSpeedCWBottom");
  const closeIcon = innerDocBottom.getElementById("iconCloseBiteSpeedCWBottom");
  const waText = innerDocBottom.getElementById("WidgetPreview__text");
  const widgetPreview = getIframeBottomWidgetPreview();

  if (!iframeTop || !waIcon || !closeIcon) return;

  const isVisible = iframeTop.style.display === "block";

  // Helper to update width and dataset
  const updateWidth = () => {
    if (!widgetPreview) return;
    const bottomWidth = Math.ceil(iframeBottom.getBoundingClientRect().width);
    const widgetWidth = Math.ceil(widgetPreview.getBoundingClientRect().width);

    if (widgetPreview.dataset.width) {
      const savedWidth = widgetPreview.dataset.width;
      widgetPreview.dataset.width = bottomWidth;
      iframeBottom.style.width = savedWidth + "px";
    } else {
      widgetPreview.dataset.width = bottomWidth;
      iframeBottom.style.width = widgetWidth + "px";
    }
  };

  if (isVisible) {
    // Collapse popup
    iframeTop.style.display = "none";
    waIcon.style.display = "flex";
    closeIcon.style.display = "none";
    waText.style.display = waText?.dataset?.display || "flex";

    if (window.innerWidth < 600) iframeBottom.style.display = "block";
    updateWidth();
  } else {
    // Expand popup
    iframeTop.style.display = "block";
    waIcon.style.display = "none";
    closeIcon.style.display = "flex";
    waText.style.display = "none";

    updateWidth();
    if (window.innerWidth < 600) iframeBottom.style.display = "none";
  }
}

async function sendWAConversion(id, convertBeforeRedirect = true) {
  const iframeTop = document.getElementById("chat-popup-iframe");
  if (!iframeTop) return;

  const innerDocTop = iframeTop.contentDocument || iframeTop.contentWindow.document;
  const sendButton = innerDocTop.querySelector(".sendButtonWAWidget");
  const country = innerDocTop.getElementById("BiteSpeedWAChatSelect")?.value;
  const phoneNumber = innerDocTop.getElementById("BiteSpeedWAChatInput")?.value;
  const thisPopup = bitespeed_popups[`${id}:bitespeed_popup`];
  if (!thisPopup) return;

  revertErrorBoundaryOnInput(id, innerDocTop, "BiteSpeedWAChatInput");

  if (!convertBeforeRedirect) {
    redirectToWhatsapp(thisPopup);
    return;
  }
  if (!bitespeedValidatePhoneNumberBS(country, phoneNumber)) {
    focusErrorBoundaryOnInput(id, innerDocTop, "BiteSpeedWAChatInput");
    return;
  }
  // Handle button loading state
  let originalText;
  if (sendButton) {
    originalText = sendButton.innerHTML;
    sendButton.innerHTML = "Please wait...";
    sendButton.disabled = true;
    sendButton.onclick = null;
  }
  // Redirect immediately while conversion happens asynchronously
  redirectToWhatsapp(thisPopup);
  try {
    await thisPopup.handleConversion?.(
      { country, phone: phoneNumber },
      { getDiscount: false, discountCode: "", requiredDiscount: {}, staticDiscount: -1 },
      {
        listId: thisPopup?.popupJson?.unlayerJson?.General?.["Add Subscribers to list"]?.selected,
        popupType: "chat widget",
      },
    );
  } catch (error) {
    console.error("Conversion failed:", error);
  } finally {
    expandBiteSpeedCW();
    if (sendButton) {
      sendButton.innerHTML = originalText || "Send";
      sendButton.disabled = false;
      sendButton.onclick = () => sendWAConversion(id);
    }
  }
}

function redirectToWhatsapp(thisPopup) {
  const unlayerJson = thisPopup?.popupJson?.unlayerJson;
  const general = unlayerJson?.General || {};
  const widgetContent = unlayerJson?.WidgetContent || {};

  const countryCode = general["Support Number"]?.selected?.replace("+", "") || "";
  const phoneNumber = general["Support Number"]?.attributes?.replace(/\s+/g, "") || "";
  const brandPhone = `${countryCode}${phoneNumber}`;

  const currentDomain = encodeURIComponent(window.location.href.split("?")[0]);
  const defaultMessage = encodeURIComponent(widgetContent["Default text"]?.selected || "Hello");

  const baseURL = window.innerWidth < 768 ? "https://api.whatsapp.com/send" : "https://web.whatsapp.com/send";

  const waRedirectionURL = `${baseURL}?phone=${brandPhone}&text=${currentDomain}%0A${defaultMessage}`;
  window.open(waRedirectionURL);
}

function movePositionUp() {
  if (window.innerWidth > 768) return;
  const iframe = document.getElementById("stw-popup-iframe");
  const spinnerPin =
    iframe?.contentDocument?.getElementById("spinnerPin") ||
    iframe?.contentWindow?.document?.getElementById("spinnerPin");
  if (spinnerPin) spinnerPin.style.display = "none";
}

function movePositionDown() {
  if (window.innerWidth > 768) return;

  const iframe = document.getElementById("stw-popup-iframe");
  const spinnerPin =
    iframe?.contentDocument?.getElementById("spinnerPin") ||
    iframe?.contentWindow?.document?.getElementById("spinnerPin");

  if (spinnerPin) spinnerPin.style.display = "block";
}

function getRotationDegrees(element) {
  const matrix = new WebKitCSSMatrix(window.getComputedStyle(element).webkitTransform);
  return Math.round(Math.atan2(matrix.b, matrix.a) * (180 / Math.PI));
}

function closeBSSTW(id) {
  const iframe = document.getElementById("stw-popup-iframe");
  const wheelContainer =
    iframe?.contentDocument?.getElementById("wheelContainerBiteSpeed") ||
    iframe?.contentWindow?.document?.getElementById("wheelContainerBiteSpeed");
  if (!iframe || !wheelContainer) return;
  wheelContainer.style.left = "-100%";
  setTimeout(() => {
    wheelContainer.style.display = "none";
    iframe.style.display = "none";
  }, 1000);
}

const spin_IT_old = (transitionTime = 5) => {
  const mainPlate = document.getElementById("container_stw_aj");
  const spinButton = document.getElementById("bitespeed-spin");
  if (!mainPlate || !spinButton) return;
  const rotationDegree = Math.ceil(Math.random() * 1000) + 5000;
  mainPlate.style.transform = `rotate(${rotationDegree}deg)`;
  setTimeout(nextView, transitionTime * 1000 + 1000);
};

function spin_IT(popupId, transitionTime = 5) {
  const iframe = document.getElementById("stw-popup-iframe");
  const innerDoc = iframe.contentDocument || iframe.contentWindow.document;

  const isMobile = window.matchMedia("(max-width: 450px)").matches;

  const elements = {
    wheelAndInputContainer: innerDoc.getElementById("wheelAndInputContainer"),
    gapDivSTW: innerDoc.getElementById("gapDivSTW"),
    sendBtnContainer: innerDoc.getElementById("STWsendButtonWAWidgetContainer"),
    phoneInput: innerDoc.getElementById("STWinputWAWidget"),
    emailInput: innerDoc.getElementById("STWemailWAWidget"),
    nameInput: innerDoc.getElementById("STWnameWAWidget"),
    dateInput: innerDoc.getElementById("STWdateWAWidget"),
    subHeading: innerDoc.getElementById("STWSubHeadingText"),
    heading: innerDoc.getElementById("STWHeadingText"),
    discountBoxContainer: innerDoc.getElementById("STWdiscountWAWidget"),
    discountBox: innerDoc.getElementById("STWDicountBox"),
    copyCodeBtn: innerDoc.getElementById("copyCodeButtonSTW"),
    disclaimer: innerDoc.getElementById("STWDisclaimerText"),
    country: innerDoc.getElementById("STWBiteSpeedWAChatSelect")?.value,
    phone: innerDoc.getElementById("STWBiteSpeedWAChatInput")?.value,
    email: innerDoc.getElementById("STWBiteSpeedWAChatInputEmail")?.value,
    dob: innerDoc.getElementById("STWBiteSpeedWAChatInputDate")?.value,
    name: innerDoc.getElementById("STWBiteSpeedWAChatInputName"),
  };

  removeErrorText(innerDoc);

  // Validation checks
  if (!bitespeedValidatePhoneNumberBS(elements.country, elements.phone))
    return addErrorTextBeforeSubmit(
      innerDoc,
      "STWsendButtonWAWidgetContainer",
      "Invalid phone number, please enter a valid phone number",
    );

  if (elements.name && !elements.name.value.trim())
    return addErrorTextBeforeSubmit(
      innerDoc,
      "STWsendButtonWAWidgetContainer",
      "Invalid name, please enter a valid name",
    );

  if (elements.email && !bitespeedValidateEmail(elements.email))
    return addErrorTextBeforeSubmit(
      innerDoc,
      "STWsendButtonWAWidgetContainer",
      "Invalid email, please enter a valid email",
    );

  if (elements.dob && !bitespeedValidateDOB(elements.dob))
    return addErrorTextBeforeSubmit(
      innerDoc,
      "STWsendButtonWAWidgetContainer",
      "Invalid DOB, please enter a valid DOB",
    );

  const thisPopup = bitespeed_popups[`${popupId}:bitespeed_popup`];
  const popupJson = thisPopup?.popupJson;
  const selectedPie = popupJson?.selectedPie;
  const unlayerJson = popupJson?.unlayerJson;
  const selectedPieSettings = unlayerJson?.values?.PlateSettings[selectedPie];

  const collectInputsAfterSpin =
    unlayerJson?.InputSettings?.["Input Collection Flow"]?.selected?.includes("Collect Inputs after Spin") || false;

  // Adjust layout before spin
  if (!collectInputsAfterSpin) {
    if (isMobile) {
      elements.wheelAndInputContainer.style.top = "50%";
      elements.gapDivSTW.style.paddingTop = "40vh";
    } else {
      elements.wheelAndInputContainer.style.left = "10%";
      elements.gapDivSTW.style.flex = "0 0 25%";
    }
  }

  const desiredPie = selectedPie;
  const desiredDegree = 360 - (parseInt(desiredPie?.split("pie")[1]) - 1) * 36 + 72;
  const mainSpinPlate = innerDoc.getElementById("container_stw_aj");
  if (!mainSpinPlate) return;

  const currentDegree = getRotationDegrees(mainSpinPlate);
  let diff = desiredDegree - currentDegree + 360 * 10;

  if (!collectInputsAfterSpin) {
    mainSpinPlate.style.transform = `rotate(${currentDegree + diff}deg)`;
  }

  sendSTWConversion(popupId);

  const transitionTimeMs = collectInputsAfterSpin ? 0 : transitionTime * 1000 - 1233;

  setTimeout(() => {
    // Hide input fields and buttons
    ["phoneInput", "emailInput", "nameInput", "dateInput", "sendBtnContainer"].forEach(
      (key) => elements[key] && (elements[key].style.display = "none"),
    );

    if (elements.copyCodeBtn) elements.copyCodeBtn.style.display = "flex";

    const { type, completeViewLabel, label } = selectedPieSettings || {};
    const completedView = unlayerJson?.CompletedView || {};
    const isWinning = type === "Winning";

    if (elements.disclaimer && completedView["Disclaimer Text"]?.selected) {
      elements.disclaimer.innerHTML = isWinning ? completedView["Disclaimer Text"].selected : "";
    }

    if (elements.heading) {
      elements.heading.innerHTML = isWinning
        ? completeViewLabel || `${completedView["Success Message Heading"]?.selected} ${label}`
        : completeViewLabel || completedView["Failure Message Heading"]?.selected;
    }

    if (elements.subHeading) {
      elements.subHeading.innerHTML = isWinning
        ? completedView["Success Message Subheading"]?.selected
        : completedView["Failure Message Subheading"]?.selected;
    }

    if (elements.discountBoxContainer) {
      elements.discountBoxContainer.style.display = isWinning ? "flex" : "none";
      if (elements.discountBox) elements.discountBox.style.boxShadow = "none";
    }

    // Adjust layout after spin
    if (isMobile) {
      elements.wheelAndInputContainer.style.top = "15%";
      elements.gapDivSTW.style.paddingTop = "0";
    } else {
      elements.wheelAndInputContainer.style.left = "-35%";
      elements.gapDivSTW.style.flex = "0 0 0%";
    }
  }, transitionTimeMs);
}

function bitespeedValidatePhoneNumberBS(countryCode, phoneNumber) {
  if (!phoneNumber) return false;
  const isIndia = countryCode === "+91";
  const regex = isIndia ? /^\d{10}$/ : /^\d{7,12}$/;
  const isValid = regex.test(phoneNumber);
  return isValid;
}

function bitespeedValidateEmail(email) {
  if (!email) return false;
  const emailRegex =
    /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

  const [account, domain] = email.split("@") || [];
  if (!account || !domain) return false;

  if (account.length > 64 || domain.length > 255) return false;
  if (domain.split(".").some((part) => part.length > 63)) return false;

  const isValid = emailRegex.test(email);
  return isValid;
}

function bitespeedValidateDOB(dob) {
  const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(dob);
  const isFutureDate = new Date(dob) > new Date();
  if (!isValidFormat || isFutureDate) return false;
  return true;
}

function openPopupBitespeed(thisButton, type, popupId) {
  const popup = bitespeed_popups[`${popupId}:bitespeed_popup`];
  if (!popup) return;

  popup.toggleTeaser(false);
  popup.currentView = "OpenView";
  popup.show("", true, {});
}
function closePopupTeaser(thisButton, popupId) {
  const popup = bitespeed_popups[`${popupId}:bitespeed_popup`];
  if (!popup) return;
  popup.toggleTeaser(false);
}
function handleTeaserTimerEnd(popupId, timerEndAction) {
  const popup = bitespeed_popups[`${popupId}:bitespeed_popup`];
  if (!popup) return;

  if (timerEndAction === "hide_teaser") {
    popup.toggleTeaser(false);
    return;
  }

  if (timerEndAction === "show_message") {
    const iframe = document.getElementById(`popup-teaser-${popupId}`);
    const innerDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!innerDoc) return;

    const messageEl = innerDoc.getElementById("timer-end-message");
    const timerEl = innerDoc.getElementById("timer-wrapper");

    if (timerEl && messageEl) {
      timerEl.style.display = "none";
      messageEl.style.display = "block";
    }
  }
}

function postRenderOperations(popupId) {
  const iframes = [
    { id: "stw-popup-iframe", selectId: "STWBiteSpeedWAChatSelect" },
    { id: "chat-popup-iframe", selectId: "BiteSpeedWAChatSelect" },
    { id: `popup-iframe-open-${popupId}`, selectId: "BiteSpeedWAChatSelect", handleWidth: true },
    { id: `popup-iframe-completed-${popupId}`, selectId: "BiteSpeedWAChatSelect" },
  ];

  iframes.forEach(({ id, selectId, handleWidth }) => {
    const iframe = document.getElementById(id);
    if (!iframe) return;
    const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!innerDoc) return;

    const selectBox = innerDoc.getElementById(selectId);
    if (selectBox && countryCodeBitespeed) {
      selectBox.value = `+${countryCodeBitespeed}`;
    }

    // Handle width resizing only for the "open" popup
    if (handleWidth) {
      const selectElement = innerDoc.getElementById("BiteSpeedDialCode");
      if (selectElement) {
        const updateWidth = () => {
          const tempSpan = innerDoc.createElement("span");
          Object.assign(tempSpan.style, { visibility: "hidden", whiteSpace: "nowrap" });
          innerDoc.body.appendChild(tempSpan);
          tempSpan.textContent = selectElement.options[selectElement.selectedIndex].text;
          const width = tempSpan.offsetWidth + 30; // add padding
          tempSpan.remove();
          selectElement.style.width = `${width}px`;
        };

        selectElement.addEventListener("change", updateWidth);
        updateWidth(); // set initial width
      }
    }
  });
}

async function spinWheel(popupId, transitionTime = 5) {
  const iframe = document.getElementById("stw-popup-iframe");
  if (!iframe) return;

  const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!innerDoc) return;

  const getEl = (id) => innerDoc.getElementById(id);

  const isMobile = window.matchMedia("(max-width: 450px)").matches;

  // Common elements
  const wheelAndInputContainer = getEl("wheelAndInputContainer");
  const gapDivSTW = getEl("gapDivSTW");
  const main_spin_plate = getEl("container_stw_aj");

  if (!wheelAndInputContainer || !gapDivSTW || !main_spin_plate) return;

  // Form elements
  const STWInputCollectorContainer = getEl("inputCollector");
  const STWDisclaimerText = getEl("STWDisclaimerText");
  const STWinputWAWidget = getEl("STWinputWAWidget");
  const STWemailWAWidget = getEl("STWemailWAWidget");
  const STWnameWAWidget = getEl("STWnameWAWidget");
  const STWdateWAWidget = getEl("STWdateWAWidget");
  const STWSendDataBtn = getEl("STWsendButtonWAWidgetContainer");
  const spinWheelBtn = getEl("STWSpinWheelBtn");
  const STWSubHeadingText = getEl("STWSubHeadingText");
  const STWHeadingText = getEl("STWHeadingText");

  // Adjust layout for mobile / desktop
  if (isMobile) {
    wheelAndInputContainer.style.top = "50%";
    gapDivSTW.style.paddingTop = "40vh";
  } else {
    wheelAndInputContainer.style.left = "10%";
    gapDivSTW.style.flex = "0 0 25%";
  }

  const thisPopup = bitespeed_popups?.[`${popupId}:bitespeed_popup`];
  const selectedPie = thisPopup?.popupJson?.selectedPie;
  const selectedPieSettings = thisPopup?.popupJson?.unlayerJson?.values?.PlateSettings?.[selectedPie];
  if (!selectedPieSettings) return;

  const pieNumber = Number(selectedPie?.split("pie")?.[1] || 1);
  const desiredDegree = 360 - (pieNumber - 1) * 36 + 72;

  const currentDegree = getRotationDegrees(main_spin_plate);
  const totalRotation = desiredDegree - currentDegree + 360 * 10;
  main_spin_plate.style.transform = `rotate(${currentDegree + totalRotation}deg)`;

  // Wait for transition animation to finish
  await new Promise((resolve) => setTimeout(resolve, transitionTime * 1000));

  if (STWInputCollectorContainer) STWInputCollectorContainer.style.display = "flex";

  // Update text content after spin
  const { type, completeViewLabel, label } = selectedPieSettings;
  const completedView = thisPopup?.popupJson?.unlayerJson?.CompletedView;
  const isWinning = type === "Winning";
  if (STWHeadingText) {
    STWHeadingText.innerHTML = isWinning
      ? completeViewLabel || `${completedView?.["Success Message Heading"]?.selected || ""} ${label}`
      : completeViewLabel || completedView?.["Failure Message Heading"]?.selected;
  }

  if (STWSubHeadingText) {
    STWSubHeadingText.innerHTML = isWinning
      ? completedView?.["Success Message Subheading"]?.selected
      : completedView?.["Failure Message Subheading"]?.selected;
  }

  // Show/hide input and controls based on result
  if (isWinning) {
    [STWinputWAWidget, STWemailWAWidget, STWnameWAWidget, STWdateWAWidget, STWSendDataBtn].forEach((el) => {
      if (el) el.style.display = "flex";
    });
    if (STWDisclaimerText) STWDisclaimerText.style.display = "block";
  }

  if (spinWheelBtn) spinWheelBtn.style.display = "none";

  // Adjust layout after spin
  if (isMobile) {
    wheelAndInputContainer.style.top = "15%";
    gapDivSTW.style.paddingTop = "0";
  } else {
    wheelAndInputContainer.style.left = "-35%";
    gapDivSTW.style.flex = "0 0 0%";
  }
}

async function sendSTWConversion(id) {
  const iframe = document.getElementById("stw-popup-iframe");
  if (!iframe) return;

  const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!innerDoc) return;

  const getValue = (id) => innerDoc.getElementById(id)?.value || "";
  const inputCollector = innerDoc.getElementById("inputCollector");
  const STWDicountBox = innerDoc.getElementById("STWDicountBox");

  const country = getValue("STWBiteSpeedWAChatSelect");
  const phone = getValue("STWBiteSpeedWAChatInput");
  const email = getValue("STWBiteSpeedWAChatInputEmail");
  const name = getValue("STWBiteSpeedWAChatInputName");
  const dob = getValue("STWBiteSpeedWAChatInputDate");

  const thisPopup = bitespeed_popups?.[`${id}:bitespeed_popup`];
  if (!thisPopup) return;

  const selectedPie = thisPopup.popupJson?.selectedPie;
  const plateSettings = thisPopup.popupJson?.unlayerJson?.values?.PlateSettings;
  const selectedPieSettings = plateSettings?.[selectedPie];
  if (!selectedPieSettings) return;

  const isWinning = selectedPieSettings.type === "Winning";
  const { couponType, value, label, discountCodePrefix, coupon } = selectedPieSettings;

  const shouldGetDiscount = isWinning && couponType !== "Static";
  const requiredDiscount = shouldGetDiscount
    ? { Value: value, Type: couponType, Label: label, Prefix: discountCodePrefix || "" }
    : {};

  const staticDiscount = isWinning && couponType === "Static" ? coupon : -1;

  const discountCodeObj = await thisPopup.handleConversion?.(
    { country, phone, email, name, extraUserAttributes: { dob: dob || undefined } },
    {
      getDiscount: shouldGetDiscount,
      discountCode: shouldGetDiscount ? "" : coupon,
      requiredDiscount,
      staticDiscount,
    },
    {
      listId: thisPopup.popupJson?.unlayerJson?.ContentSettings?.["Add Subscribers to list"]?.selected,
      popupType: "stw",
    },
  );

  // Handle cooldown
  if (discountCodeObj?.[2] === true) {
    inputCollector.style.display = "none";
    addErrorTextBeforeSubmit(
      innerDoc,
      "STWsendButtonWAWidgetContainer",
      thisPopup.behaviour?.["Who"]?.["Optin Cooldown Period"]?.warningText ||
        "You've already claimed the discount code.",
      true,
      thisPopup.behaviour?.["Who"]?.["Optin Cooldown Period"]?.warningTextColor || "#ef4040",
      inputCollector,
    );
    return;
  }

  const discountCode = findDiscountCodeInResponse(discountCodeObj)?.[0]?.code;
  const newBrowserId = discountCodeObj?.results?.[1]?.value?.browserId?.[0];

  if (newBrowserId) thisPopup.browserService.setBrowserId(newBrowserId);

  STWDicountBox.innerHTML = shouldGetDiscount ? discountCode : coupon;
}

const getCookieGlobal = (name) => {
  return document.cookie
    .split("; ")
    .map((c) => c.split("="))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})[name];
};
const setCookieGlobal = (name, value, days, hours = 24) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * hours * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/`;
};

const tempWebPushSubscription = async () => {
  const STORAGE_KEY = "bspdPushSubscribed";
  const SHOP_NAME = "rasoi-shop.myshopify.com";
  const VAPID_PUBLIC_KEY = "BMSR8tXlLJOlANI7T5d2zhtzfBgW54OsaNX0K79JoOUlxSZz20vJE3cpmJAUtnpRIyAqEM-rp5h8AhxdyXOL3Ws";

  if (Shopify.shop !== SHOP_NAME || localStorage.getItem(STORAGE_KEY) === "true") return;
  if (!("serviceWorker" in navigator && "PushManager" in window)) return;

  try {
    const registration = await navigator.serviceWorker.register("/apps/bitespeed/worker.js");
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    const payload = {
      shopUrl: Shopify.shop,
      endpoint: subscription.endpoint,
      auth: arrayBufferToBase64(subscription.getKey("auth")),
      p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
      browser: getBrowserName(),
    };
    await fetch("https://popup-service-767152501284.us-east4.run.app/collectWebPushSubscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    localStorage.setItem(STORAGE_KEY, "true");
  } catch (error) {
    console.error("Web Push subscription failed:", error);
  }
};

function bspdAttributePopup(button, popupId, event = "popupPFInteracted") {
  const popupKey = `${popupId}:bitespeed_popup`;
  const popup = bitespeed_popups[popupKey];
  if (!popup) return;

  popup.attributeThisPopup(event);
}

async function preConversionHandler(body) {
  try {
    const { data } = await axios.post("https://popups.bitespeed.co/preConversionHandler", body, {
      headers: { "Content-Type": "application/json" },
    });
    const contactId = data?.results?.[1]?.value?.id || data?.results?.[1]?.id || data?.results?.contactId;
    if (contactId) setCookieGlobal(BSPD_CONTACT_ID_COOKIE_ID, contactId, 1000);
  } catch (error) {
    console.error("preConversionHandler failed:", error);
  }
}
function performOtherPopupActions() {
  const aliaIntegrationMap = {
    "mechdrift.myshopify.com": ["3685816147677316", null],
    "the-basics-india.myshopify.com": ["3685816147677314", null],
    "great-balls-of-flour.myshopify.com": ["3685816147677624", 32773],
  };

  const shopUrl = window.Shopify?.shop;
  const popupId = aliaIntegrationMap?.[shopUrl]?.[0];
  const listId = aliaIntegrationMap?.[shopUrl]?.[1];
  if (!popupId) return;

  document.addEventListener("alia:signup", ({ detail: { email, phone } }) => {
    const sanitizedPhone = phone?.replace("+", "");
    if (!email && !sanitizedPhone) return;

    preConversionHandler({
      shopUrl,
      type: "conversion",
      popupType: "visual popup",
      popupId,
      popupTrigger: "",
      browserId: getCookieGlobal("ref"),
      getDiscount: false,
      requiredDiscount: {},
      discountCode: "",
      staticDiscount: -1,
      isDiscountEnabled: false,
      country: "",
      phone: sanitizedPhone,
      email,
      createdAt: new Date().toISOString(),
      listId: listId || "",
      impressionAndConversionId: Util.create_UUID(),
      origin: window.location.href,
      attributes: {},
    });
  });
}

const delayedRun = (delay = 0) => {
  setTimeout(async () => {
    lastCartData = await getUpdatedCartData(true);
    observeCartDataChange();
    performOtherPopupActions();
    initPopupService();
    tempWebPushSubscription();
  }, delay);
};
delayedRun(window.Shopify?.shop ? 1 : 1000);
