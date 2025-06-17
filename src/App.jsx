import {useState} from 'react'
import {Search, MapPin, Store, Clock, Phone, Globe, Star, BarChart3, TrendingUp} from 'lucide-react';
import './App.css'

function App() {
    const [streetName, setStreetName] = useState('');
    const [city, setCity] = useState('');
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [diversityIndex, setDiversityIndex] = useState(null);
    const [categoryStats, setCategoryStats] = useState([]);

    // Funzione per calcolare l'indice di diversità di Shannon-Weaver
    const calculateDiversityIndex = (shops) => {
        if (shops.length === 0) return 0;

        // Raggruppa i negozi per categoria
        const categories = {};
        shops.forEach(shop => {
            const category = getCategoryGroup(shop.shop);
            categories[category] = (categories[category] || 0) + 1;
        });

        const totalShops = shops.length;
        const categoryData = Object.entries(categories).map(([category, count]) => ({
            category,
            count,
            percentage: (count / totalShops) * 100
        }));

        // Calcola l'indice di Shannon-Weaver: H = -Σ(pi * ln(pi))
        let shannonIndex = 0;
        for (const [category, count] of Object.entries(categories)) {
            const proportion = count / totalShops;
            if (proportion > 0) {
                shannonIndex -= proportion * Math.log(proportion);
            }
        }

        // Normalizza l'indice (0-1) dividendo per ln(numero di categorie)
        const maxPossibleIndex = Math.log(Object.keys(categories).length);
        const normalizedIndex = maxPossibleIndex > 0 ? shannonIndex / maxPossibleIndex : 0;

        return {
            shannonIndex: shannonIndex,
            normalizedIndex: normalizedIndex,
            categoryData: categoryData.sort((a, b) => b.count - a.count),
            totalCategories: Object.keys(categories).length,
            totalShops: totalShops
        };
    };

    // Funzione per raggruppare i tipi di negozio in macro-categorie
    const getCategoryGroup = (shopType) => {
        const categoryMap = {
            // Alimentari
            'supermarket': 'Alimentari',
            'convenience': 'Alimentari',
            'bakery': 'Alimentari',
            'butcher': 'Alimentari',
            'greengrocer': 'Alimentari',
            'deli': 'Alimentari',
            'confectionery': 'Alimentari',
            'alcohol': 'Alimentari',
            'beverages': 'Alimentari',
            'dairy': 'Alimentari',
            'farm': 'Alimentari',
            'frozen_food': 'Alimentari',
            'health_food': 'Alimentari',
            'organic': 'Alimentari',
            'pasta': 'Alimentari',
            'pastry': 'Alimentari',
            'seafood': 'Alimentari',
            'spices': 'Alimentari',
            'tea': 'Alimentari',
            'water': 'Alimentari',
            'wine': 'Alimentari',

            // Abbigliamento e Accessori
            'clothes': 'Abbigliamento',
            'shoes': 'Abbigliamento',
            'fashion': 'Abbigliamento',
            'boutique': 'Abbigliamento',
            'bag': 'Abbigliamento',
            'fabric': 'Abbigliamento',
            'jewelry': 'Abbigliamento',
            'watches': 'Abbigliamento',
            'leather': 'Abbigliamento',
            'tailor': 'Abbigliamento',
            'underwear': 'Abbigliamento',
            'variety_store': 'Abbigliamento',

            // Salute e Benessere
            'pharmacy': 'Salute',
            'optician': 'Salute',
            'medical_supply': 'Salute',
            'hearing_aids': 'Salute',
            'herbalist': 'Salute',
            'massage': 'Salute',

            // Servizi Personali
            'hairdresser': 'Servizi Personali',
            'beauty': 'Servizi Personali',
            'cosmetics': 'Servizi Personali',
            'perfumery': 'Servizi Personali',
            'tattoo': 'Servizi Personali',
            'dry_cleaning': 'Servizi Personali',
            'laundry': 'Servizi Personali',

            // Ristorazione
            'restaurant': 'Ristorazione',
            'cafe': 'Ristorazione',
            'fast_food': 'Ristorazione',
            'ice_cream': 'Ristorazione',
            'pizza': 'Ristorazione',

            // Casa e Arredamento
            'furniture': 'Casa',
            'doityourself': 'Casa',
            'hardware': 'Casa',
            'paint': 'Casa',
            'carpet': 'Casa',
            'curtain': 'Casa',
            'interior_decoration': 'Casa',
            'kitchen': 'Casa',
            'lighting': 'Casa',
            'locksmith': 'Casa',
            'tiles': 'Casa',
            'bathroom_furnishing': 'Casa',
            'bed': 'Casa',
            'window_blind': 'Casa',

            // Elettronica e Tecnologia
            'electronics': 'Tecnologia',
            'computer': 'Tecnologia',
            'mobile_phone': 'Tecnologia',
            'hifi': 'Tecnologia',
            'radiotechnics': 'Tecnologia',
            'video': 'Tecnologia',
            'video_games': 'Tecnologia',

            // Cultura e Intrattenimento
            'books': 'Cultura',
            'music': 'Cultura',
            'musical_instrument': 'Cultura',
            'art': 'Cultura',
            'gallery': 'Cultura',
            'photo': 'Cultura',
            'frame': 'Cultura',
            'games': 'Cultura',
            'hobby': 'Cultura',
            'toys': 'Cultura',

            // Trasporti e Mobilità
            'car': 'Mobilità',
            'car_repair': 'Mobilità',
            'car_parts': 'Mobilità',
            'bicycle': 'Mobilità',
            'motorcycle': 'Mobilità',
            'tyres': 'Mobilità',

            // Servizi Finanziari
            'bank': 'Servizi Finanziari',
            'insurance': 'Servizi Finanziari',
            'money_lender': 'Servizi Finanziari',
            'pawnbroker': 'Servizi Finanziari',

            // Altri
            'florist': 'Altri',
            'garden_centre': 'Altri',
            'pet': 'Altri',
            'lottery': 'Altri',
            'tobacco': 'Altri',
            'newsagent': 'Altri',
            'stationery': 'Altri',
            'copyshop': 'Altri',
            'funeral_directors': 'Altri',
            'travel_agency': 'Altri',
            'ticket': 'Altri',
            'chemist': 'Altri',
            'erotic': 'Altri',
            'gift': 'Altri',
            'second_hand': 'Altri',
            'antiques': 'Altri',
            'charity': 'Altri'
        };

        return categoryMap[shopType] || 'Altri';
    };

    // Funzione per interpretare l'indice di diversità
    const getDiversityInterpretation = (normalizedIndex) => {
        if (normalizedIndex >= 0.8) return {
            level: 'Molto Alta',
            color: 'text-green-600',
            description: 'Eccellente varietà commerciale'
        };
        if (normalizedIndex >= 0.6) return {
            level: 'Alta',
            color: 'text-blue-600',
            description: 'Buona diversità commerciale'
        };
        if (normalizedIndex >= 0.4) return {
            level: 'Media',
            color: 'text-yellow-600',
            description: 'Diversità commerciale moderata'
        };
        if (normalizedIndex >= 0.2) return {
            level: 'Bassa',
            color: 'text-orange-600',
            description: 'Limitata varietà commerciale'
        };
        return {level: 'Molto Bassa', color: 'text-red-600', description: 'Scarsa diversità commerciale'};
    };


    // Funzione per cercare la via e ottenere le coordinate
    const searchStreet = async (street, cityName) => {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&street=${encodeURIComponent(street)}&city=${encodeURIComponent(cityName)}&limit=1`;

        const response = await fetch(nominatimUrl);
        const data = await response.json();

        if (data.length === 0) {
            throw new Error('indirizzo non trovato');
        }

        return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
            displayName: data[0].display_name
        };
    };

    // Funzione per cercare i negozi usando Overpass API
    const searchShops = async (lat, lon, street,city) => {
        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        console.log(lat, lon, street);
        const query = `
      [out:json][timeout:25];
      (
        area["name"="${city}"]["admin_level"="8"]->.torinoCity;
        way(area.torinoCity)["name"="${street}"]["highway"]->.strada;
        (
        node["shop"](around.strada:20)(area.torinoCity);
        node["amenity"~"^(restaurant|cafe|bar|pharmacy|bank)$"](around.strada:20)(area.torinoCity);
        ););
      out center meta;
    `;



        const response = await fetch(overpassUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(query)}`
        });

        const data = await response.json();

        // Esclude le vie (highway)
        const shops = data.elements.filter(element => {
            return element.tags && (
                element.tags.shop ||
                element.tags.amenity ||
                element.tags.craft
            ) && !element.tags.highway;
        });

        return shops;
    };

    // Funzione per processare i dati dei negozi
    const processShopData = (elements) => {
        return elements.map(element => {
            const tags = element.tags || {};

            // Determina le coordinate
            let lat, lon;
            if (element.lat && element.lon) {
                lat = element.lat;
                lon = element.lon;
            } else if (element.center) {
                lat = element.center.lat;
                lon = element.center.lon;
            }

            return {
                id: element.id,
                name: tags.name || 'Nome non disponibile',
                shop: tags.shop || 'Negozio',
                address: `${tags['addr:street'] || ''} ${tags['addr:housenumber'] || ''}`.trim(),
                city: tags['addr:city'] || '',
                postcode: tags['addr:postcode'] || '',
                lat,
                lon,
                brand: tags.brand || '',
                description: tags.description || ''
            };
        }).filter(shop => shop.lat && shop.lon); // Filtra solo i negozi con coordinate valide
    };

    // Funzione principale per cercare i negozi
    const handleSearch = async () => {
        if (!streetName.trim() || !city.trim()) {
            setError('Inserisci sia il nome della via che la città');
            return;
        }

        setLoading(true);
        setError('');
        setShops([]);

        try {
            // 1. Cerca la via
            const streetInfo = await searchStreet(streetName, city);

            // 2. Cerca i negozi
            const shopElements = await searchShops(streetInfo.lat, streetInfo.lon, streetName,city);

            // 3. Processa i dati
            const processedShops = processShopData(shopElements);

            setShops(processedShops);
            if (processedShops.length > 0) {
                const diversity = calculateDiversityIndex(processedShops);
                setDiversityIndex(diversity);
                setCategoryStats(diversity.categoryData);
            } else {
                setDiversityIndex(null);
                setCategoryStats([]);
            }

            if (processedShops.length === 0) {
                setError('Nessun negozio trovato in questa via');
            }

        } catch (err) {
            setError(err.message || 'Errore durante la ricerca');
        } finally {
            setLoading(false);
        }
    };

    // Funzione per aprire la mappa
    const openMap = (lat, lon) => {
        window.open(`https://www.openstreetmap.org/#map=18/${lat}/${lon}`, '_blank');
    };

    // Funzione per tradurre i tipi di negozio
    const translateShopType = (shopType) => {
        const translations = {
            'supermarket': 'Supermercato',
            'convenience': 'Minimarket',
            'bakery': 'Panetteria',
            'butcher': 'Macelleria',
            'clothes': 'Abbigliamento',
            'shoes': 'Calzature',
            'pharmacy': 'Farmacia',
            'hairdresser': 'Parrucchiere',
            'restaurant': 'Ristorante',
            'cafe': 'Bar/Caffè',
            'beauty': 'Centro estetico',
            'books': 'Libreria',
            'electronics': 'Elettronica',
            'furniture': 'Arredamento',
            'hardware': 'Ferramenta',
            'jewelry': 'Gioielleria',
            'optician': 'Ottico',
            'pet': 'Animali',
            'toys': 'Giocattoli',
            'bicycle': 'Biciclette',
            'car': 'Auto',
            'florist': 'Fioraio'
        };
        return translations[shopType] || shopType;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-200 to-pink-200 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
                        <Store className="text-gray-800" size={40}/>
                        Diversometro
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Inserisci un indirizzo e scopri il suo indice di diversità!
                    </p>
                </div>

                {/* Form di ricerca */}
                <div className="bg-stone-100 rounded-2xl shadow-lg p-6 mb-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-base font-semibold text-gray-500 mb-2">
                                Indirizzo
                            </label>
                            <input
                                className="text-black placeholder-gray-400 w-full px-4 py-2 border border-gray-300  rounded-lg focus:ring-2"
                                type="text"
                                value={streetName}
                                onChange={(e) => setStreetName(e.target.value)}
                                placeholder="es. Via Roma"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        <div>
                            <label className="block text-base font-semibold text-gray-500 mb-2">
                                Città
                            </label>
                            <input
                                className="text-black placeholder-gray-400 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="es. Milano"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="cursor-pointer w-full bg-fuchsia-500 hover:bg-fuchsia-700 disabled:bg-fuchsia-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"/>
                                ) : (
                                    <Search size={20}/>
                                )}
                                {loading ? 'Ricerca...' : 'Cerca'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messaggi di errore */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Indice di Diversità */}
                {diversityIndex && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <BarChart3 className="text-fuchsia-600"/>
                            Indice di Diversità Urbana
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Statistiche principali */}
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-600">Indice Shannon-Weaver</span>
                                        <TrendingUp className="text-purple-600" size={20}/>
                                    </div>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {diversityIndex.shannonIndex.toFixed(3)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Normalizzato: {(diversityIndex.normalizedIndex * 100).toFixed(1)}%
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-blue-600">
                                            {diversityIndex.totalCategories}
                                        </div>
                                        <div className="text-xs text-gray-600">Categorie</div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-green-600">
                                            {diversityIndex.totalShops}
                                        </div>
                                        <div className="text-xs text-gray-600">Negozi</div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-gray-700 mb-1">
                                        Livello di Diversità
                                    </div>
                                    <div
                                        className={`text-lg font-bold ${getDiversityInterpretation(diversityIndex.normalizedIndex).color}`}>
                                        {getDiversityInterpretation(diversityIndex.normalizedIndex).level}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {getDiversityInterpretation(diversityIndex.normalizedIndex).description}
                                    </div>
                                </div>
                            </div>

                            {/* Distribuzione per categorie */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    Distribuzione per Categoria
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {categoryStats.map((cat, index) => (
                                        <div key={cat.category}
                                             className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor: `hsl(${(index * 360) / categoryStats.length}, 65%, 55%)`
                                                    }}
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                          {cat.category}
                        </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-gray-800">
                                                    {cat.count}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {cat.percentage.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Barra di progresso visuale */}
                        <div className="mt-6">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Bassa Diversità</span>
                                <span>Alta Diversità</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all duration-500"
                                    style={{width: `${diversityIndex.normalizedIndex * 100}%`}}
                                />
                            </div>
                            <div className="text-center mt-2 text-sm font-medium text-gray-700">
                                {(diversityIndex.normalizedIndex * 100).toFixed(1)}% della massima diversità possibile
                            </div>
                        </div>

                        {/* Spiegazione metodologica */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Come viene calcolato l'indice</h4>
                            <p className="text-sm text-blue-700">
                                L'indice di diversità urbana utilizza la formula di Shannon-Weaver (H = -Σ(pi ×
                                ln(pi))),
                                che misura quanto è distribuita uniformemente l'attività commerciale tra diverse
                                categorie.
                                Un valore più alto indica una maggiore varietà e equilibrio nell'offerta commerciale
                                della via.
                            </p>
                        </div>
                    </div>
                )}


                {/* Risultati */}
                {shops.length > 0 && (
                    <div className="bg-stone-100 rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Store className="text-fuchsia-600"/>
                            Negozi trovati ({shops.length})
                        </h2>

                        <div className="grid gap-4">
                            {shops.map((shop) => (
                                <div
                                    key={shop.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                <Store size={20} className="text-fuchsia-600"/>
                                                {shop.name}
                                            </h3>
                                            <p className="text-sm text-fuchsia-800 font-medium">
                                                {translateShopType(shop.shop)}
                                            </p>

                                        </div>
                                        <button
                                            onClick={() => openMap(shop.lat, shop.lon)}
                                            className="bg-fuchsia-100 hover:bg-fuchsia-200 text-fuchsia-800 p-2 rounded-lg transition-colors duration-200"
                                            title="Visualizza su mappa"
                                        >
                                            <MapPin size={20}/>
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            {shop.address && (
                                                <p className="flex items-center gap-2 mb-1">
                                                    <MapPin size={16}/>
                                                    {shop.address}
                                                    {shop.city && `, ${shop.city}`}
                                                    {shop.postcode && ` ${shop.postcode}`}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            {shop.description && (
                                                <p className="mt-2 text-gray-700">
                                                    {shop.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info footer */}
                <div className="mt-8 text-center text-sm text-gray-600">
                    <p>
                        Dati forniti da{' '}
                        <a
                            href="https://www.openstreetmap.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className=" hover:underline"
                        >
                            OpenStreetMap
                        </a>
                        {' '}e{' '}
                        <a
                            href="https://overpass-api.de/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                        >
                            Overpass API
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App
