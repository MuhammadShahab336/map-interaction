import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';

const PolygonDrawer: React.FC = () => {
    const [positions, setPositions] = useState<LatLngExpression[][]>([]);
    const [currentPolygon, setCurrentPolygon] = useState<LatLngExpression[]>([]);

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                setCurrentPolygon([...currentPolygon, [e.latlng.lat, e.latlng.lng]]);
            },
            dblclick() {
                setPositions([...positions, currentPolygon]);
                setCurrentPolygon([]);
            },
        });
        return null;
    };

    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100vh", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            {positions.map((polygon, idx) => (
                <Polygon key={idx} positions={polygon} />
            ))}
            {currentPolygon.length > 0 && <Polygon positions={currentPolygon} />}
        </MapContainer>
    );
};

export default PolygonDrawer;