import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconMarker from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

interface Props {
  position: [number, number];
  googleMapsLink: string;
  t: any;
}

const defaultIcon = L.icon({
  iconUrl: iconMarker,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function OfficeMap({ position, googleMapsLink, t }: Props) {
  return (
    <MapContainer
      center={position}
      zoom={18}
      scrollWheelZoom={false}
      className="w-full h-full z-10"
    >
      <TileLayer
        attribution="&copy; Google Maps"
        url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
      />

      <Marker position={position} icon={defaultIcon}>
        <Popup>
          <div className="text-center p-1">
            <b className="text-blue-600 block mb-1">
              {t("home.contact.map_popup.title")}
            </b>

            <a
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-xs text-blue-500 underline"
            >
              Xem trên Google Maps
            </a>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
