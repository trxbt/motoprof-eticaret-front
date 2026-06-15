import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

/**
 * TrackingScripts
 * SettingsContext'ten gelen marketing ID'lerine göre
 * GTM, GA4, FB Pixel, TikTok Pixel, Hotjar, Yandex Metrica scriptlerini
 * DOM'a enjekte eder. Her script yalnızca bir kez eklenir.
 */
const TrackingScripts = () => {
  const { settings } = useSettings();

  // Google Tag Manager
  useEffect(() => {
    if (!settings.gtm_id || document.getElementById('gtm-script')) return;
    const s = document.createElement('script');
    s.id = 'gtm-script';
    s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${settings.gtm_id}');`;
    document.head.appendChild(s);

    // GTM noscript (body başına)
    if (!document.getElementById('gtm-noscript')) {
      const ns = document.createElement('noscript');
      ns.id = 'gtm-noscript';
      ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${settings.gtm_id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(ns, document.body.firstChild);
    }
  }, [settings.gtm_id]);

  // Google Analytics 4
  useEffect(() => {
    if (!settings.ga4_id || document.getElementById('ga4-script')) return;
    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${settings.ga4_id}`;
    document.head.appendChild(s1);

    const s2 = document.createElement('script');
    s2.id = 'ga4-script';
    s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.ga4_id}');`;
    document.head.appendChild(s2);
  }, [settings.ga4_id]);

  // Google Search Console verification
  useEffect(() => {
    if (!settings.gsc_verification || document.getElementById('gsc-meta')) return;
    const m = document.createElement('meta');
    m.id = 'gsc-meta';
    m.name = 'google-site-verification';
    m.content = settings.gsc_verification;
    document.head.appendChild(m);
  }, [settings.gsc_verification]);

  // Yandex verification
  useEffect(() => {
    if (!settings.yandex_verification || document.getElementById('yandex-meta')) return;
    const m = document.createElement('meta');
    m.id = 'yandex-meta';
    m.name = 'yandex-verification';
    m.content = settings.yandex_verification;
    document.head.appendChild(m);
  }, [settings.yandex_verification]);

  // Yandex Metrica
  useEffect(() => {
    if (!settings.yandex_metrica_id || document.getElementById('ym-script')) return;
    const s = document.createElement('script');
    s.id = 'ym-script';
    s.innerHTML = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
ym(${settings.yandex_metrica_id},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});`;
    document.head.appendChild(s);
  }, [settings.yandex_metrica_id]);

  // Facebook Pixel
  useEffect(() => {
    if (!settings.facebook_pixel_id || document.getElementById('fb-pixel-script')) return;
    const s = document.createElement('script');
    s.id = 'fb-pixel-script';
    s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${settings.facebook_pixel_id}');fbq('track','PageView');`;
    document.head.appendChild(s);
  }, [settings.facebook_pixel_id]);

  // TikTok Pixel
  useEffect(() => {
    if (!settings.tiktok_pixel_id || document.getElementById('tt-pixel-script')) return;
    const s = document.createElement('script');
    s.id = 'tt-pixel-script';
    s.innerHTML = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
ttq.load('${settings.tiktok_pixel_id}');ttq.page();}(window,document,'ttq');`;
    document.head.appendChild(s);
  }, [settings.tiktok_pixel_id]);

  // Hotjar
  useEffect(() => {
    if (!settings.hotjar_id || document.getElementById('hj-script')) return;
    const s = document.createElement('script');
    s.id = 'hj-script';
    s.innerHTML = `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
h._hjSettings={hjid:${settings.hotjar_id},hjsv:6};a=o.getElementsByTagName('head')[0];
r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`;
    document.head.appendChild(s);
  }, [settings.hotjar_id]);

  return null;
};

export default TrackingScripts;
