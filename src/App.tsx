import { useState, useEffect } from "react";
import Header from "./component/Header";
import LocationMap from "./component/LocationMap";
import DetailsCard from "./component/DetailsCard";
import { GeoData, Position } from "./types";
import './App.css';

// ⬇️ Direct fetch function using IPify
const fetchIPData = async (ip: string) => {
  const url = ip
    ? `https://geo.ipify.org/api/v2/country,city?apiKey=${import.meta.env.VITE_API_KEY}&ipAddress=${ip}`
    : `https://geo.ipify.org/api/v2/country,city?apiKey=${import.meta.env.VITE_API_KEY}`;
    
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch IP data");
  }
  const data = await response.json();
  return data;
};

function App() {
  const [position, setPosition] = useState<Position>({ latitude: 51.505, longitude: -0.09 });
  const [zoom, setZoom] = useState<number>(13);
  const [ipAddress, setIpAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [geoData, setGeoData] = useState<GeoData>({
    ip: '',
    location: '',
    time_zone: '',
    isp: ''
  });

  useEffect(() => {
    fetchIPData('')
      .then((res) => {
        console.log(res);
        setGeoData({
          ip: res.ip,
          location: `${res.location.city}, ${res.location.region} ${res.location.postalCode}`,
          time_zone: res.location.timezone,
          isp: res.isp
        });
        setPosition({ latitude: res.location.lat, longitude: res.location.lng });
        setError('');
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const validateInput = (input: string) => {
    const ipPattern = new RegExp(
      '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
    );
    if (ipPattern.test(input)) {
      setError('');
      return true;
    } else {
      setError('Invalid IP address');
      return false;
    }
  };

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIpAddress(e.target.value);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateInput(ipAddress)) return;

    setLoading(true);
    fetchIPData(ipAddress)
      .then((res) => {
        console.log(res);
        setGeoData({
          ip: res.ip,
          location: `${res.location.city}, ${res.location.region} ${res.location.postalCode}`,
          time_zone: res.location.timezone,
          isp: res.isp
        });
        setPosition({ latitude: res.location.lat, longitude: res.location.lng });
        setZoom(13);
        setLoading(false);
        setError('');
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  return (
    <div className='relative h-screen w-full m-0 p-0'>
      <div className='absolute inset-0 grid grid-rows-5'>
        <div className='relative row-span-2'>
          <Header
            ipAddress={ipAddress}
            onChange={handleIpChange}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </div>
        <div className='relative row-span-3'>
          <LocationMap position={position} zoom={zoom} />
          <DetailsCard geoData={geoData} />
        </div>
      </div>
    </div>
  );
}

export default App;
