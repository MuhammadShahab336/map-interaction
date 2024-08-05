import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLngTuple } from 'leaflet';
import * as turf from '@turf/turf';

const PolygonDrawer: React.FC = () => {
    const [positions, setPositions] = useState<LatLngExpression[][]>([]);
    const [currentPolygon, setCurrentPolygon] = useState<LatLngExpression[]>([]);
    const [drawing, setDrawing] = useState<boolean>(false);
    const [invalidPolygon, setInvalidPolygon] = useState<boolean>(false);

    const checkIntersection = (polygon: LatLngTuple[]) => {
        if (polygon.length < 4) return false; // A valid polygon needs at least 4 points (3 + 1 to close)

        // Convert polygon to GeoJSON
        const newPolygon = turf.polygon([polygon.map(([lat, lng]) => [lng, lat])]);

        // Check intersection with existing polygons
        for (const pos of positions) {
            if (pos.length < 4) continue; // Skip invalid polygons
            // @ts-ignore
            const existingPolygon = turf.polygon([pos.map(([lat, lng]) => [lng, lat])]);
            if (turf.booleanIntersects(newPolygon, existingPolygon)) {
                return true;
            }
        }
        return false;
    };

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                if (drawing) {
                    const newPoint: LatLngTuple = [e.latlng.lat, e.latlng.lng];
                    const updatedPolygon: any = [...currentPolygon, newPoint];
                    setCurrentPolygon(updatedPolygon);
                    setInvalidPolygon(checkIntersection(updatedPolygon));

                    // Check if the click is near the start point
                    if (currentPolygon.length > 2 && isNearStartPoint(newPoint)) {
                        // Close the polygon by adding the start point to the end
                        const closedPolygon = [...updatedPolygon, updatedPolygon[0]];
                        if (!checkIntersection(closedPolygon)) {
                            setPositions([...positions, closedPolygon]);
                            setCurrentPolygon([]);
                            setDrawing(false);
                            setInvalidPolygon(false);
                        } else {
                            setInvalidPolygon(true);
                        }
                    }
                }
            },
            contextmenu() {
                if (drawing) {
                    setCurrentPolygon([]);
                    setDrawing(false);
                    setInvalidPolygon(false);
                }
            },
        });
        return null;
    };

    const isNearStartPoint = (point: LatLngTuple) => {
        if (currentPolygon.length === 0) return false;
        // @ts-ignore
        const [startLat, startLng] = currentPolygon[0];
        const [lat, lng] = point;
        const threshold = 0.0001; // Distance threshold to consider as "near"
        return Math.abs(startLat - lat) < threshold && Math.abs(startLng - lng) < threshold;
    };

    const startDrawing = () => {
        setDrawing(true);
    };

    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100vh", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            {positions.map((polygon, idx) => (
                <Polygon
                    key={idx}
                    positions={polygon}
                    color="green"
                />
            ))}
            {currentPolygon.length > 0 && (
                <Polygon
                    positions={currentPolygon}
                    color={invalidPolygon ? 'red' : 'blue'}
                    weight={2}
                    opacity={0.7}
                />
            )}
            {!drawing && (
                <button
                    onClick={startDrawing}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        left: '60px',
                        padding: '10px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        zIndex: 1000,
                    }}
                >
                    Start Drawing
                </button>
            )}
        </MapContainer>
    );
};

export default PolygonDrawer;
