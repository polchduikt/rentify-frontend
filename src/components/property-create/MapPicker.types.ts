export interface MapPickerProps {
  lat?: number;
  lng?: number;
  onPick: (lat: number, lng: number) => void;
}
