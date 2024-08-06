import React, { useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import * as turf from '@turf/turf';

const MapComponent: React.FC = () => {
    const [polygons, setPolygons] = useState<L.Polygon[]>([]);
    const [invalidPolygon, setInvalidPolygon] = useState<L.Polygon | null>(null);

    // Function to check if polygons intersect
    const checkIntersection = (newPolygon: L.Polygon): boolean => {
        const newPolyCoords = newPolygon.getLatLngs()[0] as L.LatLng[];
        const newPolyTurf: any = turf.polygon([newPolyCoords.map((latLng) => [latLng.lng, latLng.lat])]);

        for (let poly of polygons) {
            const polyCoords = poly.getLatLngs()[0] as L.LatLng[];
            const polyTurf: any = turf.polygon([polyCoords.map((latLng) => [latLng.lng, latLng.lat])]);

            if (turf.intersect(newPolyTurf, polyTurf)) {
                return true;
            }
        }
        return false;
    };

    // Ensure polygon is closed
    const ensureClosedPolygon = (polygon: L.Polygon) => {
        const latlngs = polygon.getLatLngs()[0] as L.LatLng[];
        if (latlngs[0] !== latlngs[latlngs.length - 1]) {
            latlngs.push(latlngs[0]);
            polygon.setLatLngs(latlngs);
        }
    };

    const handleCreate = (e: any) => {
        const layer = e.layer;
        if (layer instanceof L.Polygon) {
            ensureClosedPolygon(layer);

            if (checkIntersection(layer)) {
                layer.setStyle({ color: 'red' });
                setInvalidPolygon(layer);
                return;
            }

            setPolygons((prev) => [...prev, layer]);
        }
    };

    const handleDelete = (e: any) => {
        const layers = e.layers;
        layers.eachLayer((layer: L.Layer) => {
            setPolygons((prev) => prev.filter((polygon) => polygon !== layer));
        });
    };

    const handleEdit = (e: any) => {
        const layers = e.layers;
        let isValid = true;

        layers.eachLayer((layer: L.Layer) => {
            if (layer instanceof L.Polygon) {
                ensureClosedPolygon(layer);

                if (checkIntersection(layer)) {
                    layer.setStyle({ color: 'red' });
                    setInvalidPolygon(layer);
                    isValid = false;
                } else {
                    layer.setStyle({ color: 'blue' });
                    setInvalidPolygon(null);
                }
            }
        });

        if (isValid) {
            layers.eachLayer((layer: L.Layer) => {
                if (layer instanceof L.Polygon) {
                    setPolygons((prev) => prev.map((polygon) => (polygon === layer ? layer : polygon)));
                }
            });
        }
    };

    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <FeatureGroup>
                <EditControl
                    position="topright"
                    onCreated={handleCreate}
                    onDeleted={handleDelete}
                    onEdited={handleEdit}
                    draw={{
                        rectangle: false,
                        circle: false,
                        circlemarker: false,
                        marker: false,
                        polyline: false,
                        polygon: true,
                    }}
                />
            </FeatureGroup>
        </MapContainer>
    );
};

export default MapComponent;
