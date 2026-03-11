// Fallback type declarations for packages whose types may not be resolved
// Only declare modules that don't already have types installed

declare module 'leaflet/dist/images/marker-icon-2x.png' {
  const src: string;
  export default src;
}
declare module 'leaflet/dist/images/marker-icon.png' {
  const src: string;
  export default src;
}
declare module 'leaflet/dist/images/marker-shadow.png' {
  const src: string;
  export default src;
}

declare module 'react-i18next' {
  export function useTranslation(): { t: (key: string, options?: any) => string; i18n: any };
  export const initReactI18next: any;
  export const Trans: any;
}
declare module 'i18next' {
  const i18n: any;
  export default i18n;
}
declare module 'i18next-browser-languagedetector' {
  const LanguageDetector: any;
  export default LanguageDetector;
}
declare module 'mapbox-gl' {
  namespace mapboxgl {
    class Map { constructor(options: any); remove(): void; on(event: string, handler: any): void; resize(): void; fitBounds(bounds: any, options?: any): void; }
    class Marker { constructor(options?: any); setLngLat(lnglat: any): Marker; addTo(map: Map): Marker; remove(): void; getElement(): HTMLElement; }
    class LngLatBounds { constructor(); extend(lnglat: any): LngLatBounds; }
    let accessToken: string;
  }
  export = mapboxgl;
  export as namespace mapboxgl;
}
declare module 'qrcode.react' {
  import { ForwardRefExoticComponent, RefAttributes } from 'react';
  export const QRCodeCanvas: ForwardRefExoticComponent<any & RefAttributes<HTMLCanvasElement>>;
  export const QRCodeSVG: any;
}
declare module 'leaflet' {
  namespace L {
    class Map { remove(): void; setView(center: any, zoom: number): Map; }
    class Icon { static Default: any; }
    function map(element: any, options?: any): Map;
    function tileLayer(url: string, options?: any): any;
    function marker(latlng: any, options?: any): any;
    function icon(options: any): any;
    function divIcon(options: any): any;
    function latLng(lat: number, lng: number): any;
    function latLngBounds(corner1: any, corner2: any): any;
  }
  export = L;
  export as namespace L;
}
declare module '@capacitor/core' {
  export const Capacitor: { isNativePlatform(): boolean; getPlatform(): string; };
}
declare module '@capacitor/push-notifications' {
  export const PushNotifications: any;
}
declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: any);
    setFontSize(size: number): void;
    setTextColor(...args: any[]): void;
    text(text: string, x: number, y: number, options?: any): void;
    getNumberOfPages(): number;
    setPage(page: number): void;
    save(filename: string): void;
    internal: any;
    addImage(...args: any[]): void;
  }
}
declare module 'jspdf-autotable' {
  export default function autoTable(doc: any, options: any): void;
}
declare module 'embla-carousel-autoplay' {
  export default function Autoplay(options?: any): any;
}
declare module '@yudiel/react-qr-scanner' {
  export const Scanner: any;
}
declare module 'vite-plugin-pwa' {
  export function VitePWA(options?: any): any;
}
