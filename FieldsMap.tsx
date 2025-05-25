import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Field } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface FieldsMapProps {
  showList?: boolean;
  onFieldSelect?: (field: Field) => void;
}

export const FieldsMap: React.FC<FieldsMapProps> = ({ showList = true, onFieldSelect }) => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

  // Fetch fields data
  const { data: fields, isLoading, isError } = useQuery<Field[]>({
    queryKey: ['/api/fields'],
    staleTime: 60000,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;

    // Check if Leaflet is available
    if (typeof L !== 'undefined') {
      const leafletMap = L.map(mapContainerRef.current).setView([37.8719, 32.4843], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap);
      
      leafletMapRef.current = leafletMap;
      setMap(leafletMap);
      
      return () => {
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }
      };
    }
  }, []);

  // Add field polygons to map
  useEffect(() => {
    if (!map || !fields) return;
    
    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Polygon || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
    
    const fieldLayers: Record<number, L.Polygon> = {};
    const bounds = L.latLngBounds([]);
    
    fields.forEach(field => {
      try {
        // Parse coordinates
        const coords = field.coordinates as { type: string; coordinates: number[][][] };
        
        if (coords && coords.type === 'Polygon' && coords.coordinates && coords.coordinates.length > 0) {
          // Convert to Leaflet format
          const latLngs = coords.coordinates[0].map(point => L.latLng(point[1], point[0]));
          
          // Create polygon with field color
          const polygon = L.polygon(latLngs, {
            color: field.color || '#4CAF50',
            fillOpacity: 0.4,
            weight: 2
          }).addTo(map);
          
          // Add popup
          polygon.bindPopup(`
            <strong>${field.name}</strong><br>
            ${field.size} ${field.unit}
          `);
          
          // Add click handler
          polygon.on('click', () => {
            setSelectedFieldId(field.id);
            if (onFieldSelect) {
              onFieldSelect(field);
            }
          });
          
          // Save reference to the polygon
          fieldLayers[field.id] = polygon;
          
          // Extend bounds
          bounds.extend(latLngs);
        }
      } catch (e) {
        console.error('Error rendering field polygon:', e);
      }
    });
    
    // Fit map to bounds if we have any fields
    if (bounds.isValid()) {
      map.fitBounds(bounds);
    }
    
    // Highlight selected field if any
    if (selectedFieldId && fieldLayers[selectedFieldId]) {
      const layer = fieldLayers[selectedFieldId];
      layer.setStyle({ color: '#FF9800', fillOpacity: 0.6, weight: 3 });
      layer.bringToFront();
    }
  }, [map, fields, selectedFieldId, onFieldSelect]);

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <CardContent className="p-0">
          <Skeleton className="h-44 w-full" />
          {showList && (
            <div className="divide-y divide-gray-100">
              <div className="p-3 flex items-center">
                <Skeleton className="w-3 h-3 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-full ml-1" />
                </div>
              </div>
              <div className="p-3 flex items-center">
                <Skeleton className="w-3 h-3 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <div className="flex">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-full ml-1" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <span className="material-icons text-accent text-3xl mb-2">error_outline</span>
            <p>Failed to load fields data</p>
            <Button variant="outline" size="sm" className="mt-2">
              <span className="material-icons text-sm mr-2">refresh</span> Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
      <CardContent className="p-0">
        {/* Map container */}
        <div className="h-44 bg-green-100 relative" ref={mapContainerRef}>
          <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-20">
            <Button variant="secondary" size="icon" className="w-8 h-8 rounded-full bg-white shadow">
              <span className="material-icons text-gray-600">add</span>
            </Button>
            <Button variant="secondary" size="icon" className="w-8 h-8 rounded-full bg-white shadow">
              <span className="material-icons text-gray-600">remove</span>
            </Button>
            <Button variant="secondary" size="icon" className="w-8 h-8 rounded-full bg-white shadow">
              <span className="material-icons text-gray-600">my_location</span>
            </Button>
          </div>
        </div>
        
        {/* Field list */}
        {showList && fields && fields.length > 0 && (
          <div className="divide-y divide-gray-100">
            {fields.map(field => (
              <div 
                key={field.id} 
                className={`p-3 flex items-center ${selectedFieldId === field.id ? 'bg-gray-50' : ''}`}
                onClick={() => {
                  setSelectedFieldId(field.id);
                  if (onFieldSelect) {
                    onFieldSelect(field);
                  }
                }}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: field.color || '#4CAF50' }}
                ></div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{field.name}</h4>
                  <p className="text-xs text-gray-500">
                    {field.currentCropId ? 'Ürün ekli • ' : ''}
                    {field.size} {field.unit}
                  </p>
                </div>
                <div className="flex text-gray-400">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="p-1 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/fields/${field.id}`);
                    }}
                  >
                    <span className="material-icons text-xl">visibility</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="p-1 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/fields/${field.id}/edit`);
                    }}
                  >
                    <span className="material-icons text-xl">edit</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Empty state */}
        {showList && (!fields || fields.length === 0) && (
          <div className="p-4 text-center">
            <span className="material-icons text-gray-400 text-3xl mb-2">grass</span>
            <p className="text-sm text-gray-500">No fields added yet</p>
            <Button 
              onClick={() => setLocation('/fields/new')}
              variant="outline" 
              className="mt-2"
            >
              <span className="material-icons text-sm mr-2">add</span>
              Add Field
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FieldsMap;
