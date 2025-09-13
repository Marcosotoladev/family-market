// src/components/ui/CustomColorPicker.js
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomColorPicker = ({ value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });
  
  const pickerRef = useRef(null);
  const gradientRef = useRef(null);

  // Convertir hex a HSL
  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  // Convertir HSL a hex
  const hslToHex = (h, s, l) => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Convertir hex a RGB
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  // Inicializar valores cuando cambia el color
  useEffect(() => {
    if (value) {
      const [h, s, l] = hexToHsl(value);
      setHue(h);
      setSaturation(s);
      setLightness(l);
      setRgbValues(hexToRgb(value));
    }
  }, [value]);

  // Actualizar color cuando cambian los valores HSL
  useEffect(() => {
    const newColor = hslToHex(hue, saturation, lightness);
    setRgbValues(hexToRgb(newColor));
    onChange(newColor);
  }, [hue, saturation, lightness]);

  // Cerrar picker al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar clic en el gradiente
  const handleGradientClick = (event) => {
    if (!gradientRef.current) return;
    
    const rect = gradientRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newSaturation = (x / rect.width) * 100;
    const newLightness = 100 - (y / rect.height) * 100;
    
    setSaturation(Math.max(0, Math.min(100, newSaturation)));
    setLightness(Math.max(0, Math.min(100, newLightness)));
  };

  // Colores predefinidos populares
  const presetColors = [
    '#ff0000', '#ff4500', '#ffa500', '#ffff00', '#9acd32', '#00ff00',
    '#00fa9a', '#00ffff', '#0080ff', '#0000ff', '#8a2be2', '#ff1493',
    '#ff69b4', '#dc143c', '#b22222', '#8b4513', '#2f4f4f', '#000000',
    '#696969', '#808080', '#a9a9a9', '#c0c0c0', '#d3d3d3', '#ffffff'
  ];

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      >
        <div
          className="w-6 h-6 rounded border border-gray-300 dark:border-gray-500"
          style={{ backgroundColor: value }}
        />
        <span className="flex-1 text-left text-gray-900 dark:text-gray-100 font-mono text-sm">
          {value}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Color Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
          {/* Color Gradient */}
          <div className="mb-4">
            <div
              ref={gradientRef}
              className="relative w-full h-48 rounded-lg cursor-crosshair border border-gray-200 dark:border-gray-600"
              style={{
                background: `linear-gradient(to bottom, 
                  hsl(${hue}, 100%, 50%) 0%, 
                  hsla(${hue}, 100%, 50%, 0) 50%, 
                  hsl(0, 0%, 0%) 100%), 
                  linear-gradient(to right, 
                  hsl(0, 0%, 100%) 0%, 
                  hsla(0, 0%, 100%, 0) 100%)`
              }}
              onClick={handleGradientClick}
            >
              {/* Cursor indicator */}
              <div
                className="absolute w-3 h-3 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - lightness}%`
                }}
              />
            </div>
          </div>

          {/* Hue Slider */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Matiz
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
                className="w-full h-6 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                }}
              />
            </div>
          </div>

          {/* RGB Inputs */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">R</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgbValues.r}
                onChange={(e) => {
                  const r = Number(e.target.value);
                  const newHex = `#${r.toString(16).padStart(2, '0')}${rgbValues.g.toString(16).padStart(2, '0')}${rgbValues.b.toString(16).padStart(2, '0')}`;
                  onChange(newHex);
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">G</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgbValues.g}
                onChange={(e) => {
                  const g = Number(e.target.value);
                  const newHex = `#${rgbValues.r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${rgbValues.b.toString(16).padStart(2, '0')}`;
                  onChange(newHex);
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">B</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgbValues.b}
                onChange={(e) => {
                  const b = Number(e.target.value);
                  const newHex = `#${rgbValues.r.toString(16).padStart(2, '0')}${rgbValues.g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                  onChange(newHex);
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Hex</label>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  let hex = e.target.value;
                  if (!hex.startsWith('#')) hex = '#' + hex;
                  if (/^#[0-9A-F]{6}$/i.test(hex)) {
                    onChange(hex);
                  }
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
              />
            </div>
          </div>

          {/* Preset Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Colores Predefinidos
            </label>
            <div className="grid grid-cols-12 gap-1">
              {presetColors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onChange(color)}
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomColorPicker;