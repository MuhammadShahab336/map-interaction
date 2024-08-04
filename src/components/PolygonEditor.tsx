import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression, LatLng, LeafletEvent } from 'leaflet';
import * as turf from '@turf/turf';

const initialPolygons: LatLngExpression[][] = [
    [
        [51.51, -0.12],
        [51.5, -0.1],
        [51.49, -0.12],
        [51.49, -0.14],
    ],
];

const PolygonEditor: React.FC = () => {
    const [polygons, setPolygons] = useState<LatLngExpression[][]>(initialPolygons);
    const [editablePolygon, setEditablePolygon] = useState<LatLngExpression[]>([]);
    const [editing, setEditing] = useState<boolean>(false);
    const [intersectionError, setIntersectionError] = useState<boolean>(false);

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                if (editing && !intersectionError) {
                    const { latlng } = e as { latlng: LatLng };
                    setEditablePolygon([...editablePolygon, [latlng.lat, latlng.lng]]);
                }
            },
            dblclick() {
                if (editablePolygon.length > 2 && !intersectionError) {
                    setPolygons([...polygons, editablePolygon]);
                    setEditablePolygon([]);
                    setEditing(false);
                }
            },
        });
        return null;
    };

    const handleVertexDrag = (e: LeafletEvent, index: number) => {
        const event = e as any;
        if (event?.latlng) {
            const newPolygon = [...editablePolygon];
            newPolygon[index] = [event.latlng.lat, event.latlng.lng];
            setEditablePolygon(newPolygon);
            checkIntersection(newPolygon);
        }
    };

    const handlePolygonClick = (polygon: LatLngExpression[]) => {
        setEditablePolygon(polygon);
        setEditing(true);
    };

    const handleRemoveVertex = (index: number) => {
        const newPolygon = editablePolygon.filter((_, idx) => idx !== index);
        setEditablePolygon(newPolygon);
        checkIntersection(newPolygon);
    };

    const handleAddVertex = (e: LeafletEvent) => {
        const event = e as any;
        if (event?.latlng) {
            const { latlng } = event;
            const newPolygon: any = [...editablePolygon, [latlng.lat, latlng.lng]];
            setEditablePolygon(newPolygon);
            checkIntersection(newPolygon);
        }
    };

    const checkIntersection = (newPolygon: LatLngExpression[]) => {
        const turfPolygon = turf.polygon([newPolygon.map((coord: any) => [coord[1], coord[0]])]);
        const intersects = polygons.some((polygon) => {
            const existingTurfPolygon = turf.polygon([polygon.map((coord: any) => [coord[1], coord[0]])]);
            return turf.booleanIntersects(turfPolygon, existingTurfPolygon);
        });
        setIntersectionError(intersects);
    };

    return (
        <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            style={{ height: "100vh", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            {polygons.map((polygon, idx) => (
                <Polygon
                    key={idx}
                    positions={polygon}
                    eventHandlers={{
                        click: () => handlePolygonClick(polygon),
                    }}
                    pathOptions={{ color: 'blue' }}
                />
            ))}
            {editablePolygon.length > 0 && (
                <>
                    <Polygon
                        positions={editablePolygon}
                        pathOptions={{ color: intersectionError ? 'red' : 'green' }}
                        eventHandlers={{
                            click: (e) => handleAddVertex(e),
                        }}
                    />
                    {editablePolygon.map((vertex, idx) => (
                        <Marker
                            key={idx}
                            position={vertex as LatLngExpression}
                            draggable
                            eventHandlers={{
                                dragend: (e) => handleVertexDrag(e, idx),
                                click: () => handleRemoveVertex(idx),
                            }}
                        />
                    ))}
                </>
            )}
        </MapContainer>
    );
};

export default PolygonEditor;
