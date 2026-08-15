export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyCPSko-yh7VsQtpPyKzRmbXJWQOdcCJ8BE";

let googleMapsPromise: Promise<any> | null = null;

export function loadGoogleMapsScript(apiKey: string = GOOGLE_MAPS_API_KEY): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve(null);

  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve((window as any).google.maps);
  }

  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById("google-maps-script");
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          resolve((window as any).google.maps);
        });
        existingScript.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google && (window as any).google.maps) {
          resolve((window as any).google.maps);
        } else {
          reject(new Error("Google Maps failed to load"));
        }
      };
      script.onerror = (err) => {
        reject(err);
      };
      document.head.appendChild(script);
    });
  }

  return googleMapsPromise;
}

// Clean map style matching Nexa dark / modern aesthetic
export const nexaMapStyles = [
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [{ color: "#444444" }],
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [{ saturation: -100 }, { lightness: 45 }],
  },
  {
    featureType: "road.highway",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ color: "#e0f2fe" }, { visibility: "on" }],
  },
];
