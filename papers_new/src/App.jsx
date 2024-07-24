
import { Book, ChevronLeft, ChevronRight, Star, Moon, Sun, Rocket, Globe, Wind, Zap } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar } from 'recharts';



const Calculator = ({ label, value, onChange, calculate, result, unit }) => (
  <div className="bg-blue-100 p-4 rounded-md mb-4">
    <label className="block mb-2">
      {label}:
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full p-1 mt-1 border rounded"
      />
    </label>
    <p className="mt-2">{result}: {calculate(value).toFixed(2)} {unit}</p>
  </div>
);


const AtmosphericScaleHeightCalculator = () => {
  const [temperature, setTemperature] = useState(288);
  const [gravity, setGravity] = useState(9.8);
  const calculateScaleHeight = (T, g) => {
    const k = 1.380649e-23;
    const m = 4.8e-26;
    return (k * T) / (m * g) / 1000;
  };
  return (
    <div className="bg-blue-100 p-4 rounded-md mb-4">
      <label className="block mb-2">
        Temperature (K):
        <input 
          type="number" 
          value={temperature} 
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full p-1 mt-1 border rounded"
        />
      </label>
      <label className="block mb-2">
        Surface gravity (m/s²):
        <input 
          type="number" 
          value={gravity} 
          onChange={(e) => setGravity(parseFloat(e.target.value))}
          className="w-full p-1 mt-1 border rounded"
        />
      </label>
      <p className="mt-2">Atmospheric scale height: {calculateScaleHeight(temperature, gravity).toFixed(2)} km</p>
    </div>
  );
};

const DarkMatterDistributionGraph = () => {
  const data = [
    { name: 'Visible Matter', value: 15 },
    { name: 'Dark Matter', value: 85 },
  ];
  
  return (
    <div className="bg-gray-100 p-4 rounded-md mb-4">
      <h3 className="font-bold text-lg mb-2">Dark Matter Distribution in a Galaxy</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const HabitableZoneCalculator = () => {
  const [luminosity, setLuminosity] = useState(1);
  const calculateHabitableZone = (L) => {
    const inner = Math.sqrt(L / 1.1);
    const outer = Math.sqrt(L / 0.53);
    return [inner, outer];
  };
  return (
    <div className="bg-blue-100 p-4 rounded-md mb-4">
      <label className="block mb-2">
        Star luminosity (in solar luminosities):
        <input 
          type="number" 
          value={luminosity} 
          onChange={(e) => setLuminosity(parseFloat(e.target.value))}
          className="w-full p-1 mt-1 border rounded"
        />
      </label>
      {(() => {
        const [inner, outer] = calculateHabitableZone(luminosity);
        return (
          <p className="mt-2">Habitable zone: {inner.toFixed(2)} AU to {outer.toFixed(2)} AU</p>
        );
      })()}
    </div>
  );
};

const InteractiveDiagram = ({ title, description, data, XAxisLabel, YAxisLabel }) => (
  <div className="bg-gray-100 p-4 rounded-md mb-4">
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="mb-4">{description}</p>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" label={{ value: XAxisLabel, position: 'bottom', offset: -5 }} />
        <YAxis label={{ value: YAxisLabel, angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const StarFormationCalculator = () => {
  const [density, setDensity] = useState(1.5);
  const calculateFormationTime = (d) => {
    const G = 6.67430e-11;
    return Math.sqrt((3 * Math.PI) / (32 * G * d * 1.989e30 / Math.pow(3.086e16, 3))) / (365.25 * 24 * 60 * 60);
  };
  return (
    <Calculator 
      label="Initial gas density (solar masses per cubic parsec)"
      value={density}
      onChange={setDensity}
      calculate={calculateFormationTime}
      result="Approximate star formation time"
      unit="years"
    />
  );
};

const HubbleLawCalculator = () => {
  const [distance, setDistance] = useState(10);
  const calculateVelocity = (d) => 70 * d; // Using H0 = 70 km/s/Mpc
  return (
    <Calculator 
      label="Distance to galaxy (Mpc)"
      value={distance}
      onChange={setDistance}
      calculate={calculateVelocity}
      result="Recessional velocity"
      unit="km/s"
    />
  );
};

const SchwarzschildRadiusCalculator = () => {
  const [mass, setMass] = useState(10);
  const calculateRadius = (m) => {
    const G = 6.67430e-11;
    const c = 299792458;
    return (2 * G * m * 1.989e30) / (c * c) / 1000;
  };
  return (
    <Calculator 
      label="Black hole mass (solar masses)"
      value={mass}
      onChange={setMass}
      calculate={calculateRadius}
      result="Schwarzschild radius"
      unit="km"
    />
  );
};

const HertzsprungRussellDiagram = () => {
  const data = [
    { temperature: 30000, luminosity: 100000, name: 'O' },
    { temperature: 20000, luminosity: 10000, name: 'B' },
    { temperature: 10000, luminosity: 100, name: 'A' },
    { temperature: 7500, luminosity: 10, name: 'F' },
    { temperature: 6000, luminosity: 1, name: 'G' },
    { temperature: 5000, luminosity: 0.1, name: 'K' },
    { temperature: 3500, luminosity: 0.01, name: 'M' },
  ];

  return (
    <div className="bg-gray-100 p-4 rounded-md mb-4">
      <h3 className="font-bold text-lg mb-2">Hertzsprung-Russell Diagram</h3>
      <p className="mb-4">This diagram plots stars' luminosity against their effective temperature, showing different stages of stellar evolution.</p>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis type="number" dataKey="temperature" name="Temperature (K)" domain={['auto', 'auto']} reversed 
                 label={{ value: 'Temperature (K)', position: 'bottom' }} />
          <YAxis type="number" dataKey="luminosity" name="Luminosity (L☉)" domain={['auto', 'auto']} scale="log"
                 label={{ value: 'Luminosity (L☉)', angle: -90, position: 'insideLeft' }} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Stars" data={data} fill="#8884d8" />
          <Legend />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};


const ExoplanetTransitDepthCalculator = () => {
  const [planetRadius, setPlanetRadius] = useState(1);
  const [starRadius, setStarRadius] = useState(1);
  const calculateTransitDepth = (Rp, Rs) => {
    return Math.pow(Rp / Rs, 2) * 100;
  };
  return (
    <div className="bg-blue-100 p-4 rounded-md mb-4">
      <label className="block mb-2">
        Planet radius (Earth radii):
        <input 
          type="number" 
          value={planetRadius} 
          onChange={(e) => setPlanetRadius(parseFloat(e.target.value))}
          className="w-full p-1 mt-1 border rounded"
        />
      </label>
      <label className="block mb-2">
        Star radius (Solar radii):
        <input 
          type="number" 
          value={starRadius} 
          onChange={(e) => setStarRadius(parseFloat(e.target.value))}
          className="w-full p-1 mt-1 border rounded"
        />
      </label>
      <p className="mt-2">Transit depth: {calculateTransitDepth(planetRadius, starRadius).toFixed(4)}%</p>
    </div>
  );
};

const App = () => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);

  const chapters = [
    {
      title: "Introduction to Astrophysics",
      icon: <Book className="w-8 h-8 text-blue-600" />,
      sections: [
        {
          title: "What is Astrophysics?",
          content: (
            <div className="space-y-4">
              <p>Astrophysics is the branch of astronomy that employs the principles of physics and chemistry to ascertain the nature of celestial bodies, rather than their positions or motions in space.</p>
              <p>This comprehensive field incorporates elements of many disciplines, including:</p>
              <ul className="list-disc pl-5">
                <li>Classical mechanics</li>
                <li>Electromagnetism</li>
                <li>Statistical mechanics</li>
                <li>Quantum mechanics</li>
                <li>Relativity</li>
                <li>Nuclear and particle physics</li>
                <li>Atomic and molecular physics</li>
              </ul>
              <p>Astrophysicists seek to understand the universe and our place in it. This book will guide you through the fundamentals of astrophysics, from the smallest particles to the largest structures in the cosmos.</p>
            </div>
          )
        },
        {
          title: "Historical Development",
          content: (
            <div className="space-y-4">
              <p>The field of astrophysics has a rich history, evolving from ancient astronomical observations to modern-day high-tech explorations of the cosmos.</p>
              <h3 className="font-bold">Key Milestones:</h3>
              <ul className="list-disc pl-5">
                <li>Ancient times: Early astronomical observations and creation of star catalogs</li>
                <li>16th-17th centuries: Copernican Revolution and Kepler's laws of planetary motion</li>
                <li>1687: Newton's law of universal gravitation</li>
                <li>19th century: Development of spectroscopy, allowing study of stellar compositions</li>
                <li>Early 20th century: Einstein's theory of relativity</li>
                <li>1920s: Discovery of galaxies beyond the Milky Way</li>
                <li>1960s onwards: Space-based observations and multi-wavelength astronomy</li>
              </ul>
              <p>Today, astrophysics continues to evolve with new technologies and theoretical breakthroughs, pushing the boundaries of our understanding of the universe.</p>
            </div>
          )
        }
      ]
    },
    {
      title: "Stellar Astrophysics",
      icon: <Star className="w-8 h-8 text-yellow-400" />,
      sections: [
        {
          title: "Star Formation",
          content: (
            <div className="space-y-4">
              <p>Stars form from the gravitational collapse of gas clouds in interstellar space. This process involves several stages:</p>
              <ol className="list-decimal pl-5">
                <li>Molecular cloud fragmentation</li>
                <li>Protostellar collapse</li>
                <li>Accretion and T Tauri phase</li>
                <li>Main sequence star birth</li>
              </ol>
              <h3 className="font-bold mt-4">Star Formation Time:</h3>
              <p className="bg-gray-100 p-2 rounded-md text-center mb-2">t_ff ≈ (3π / 32Gρ)^(1/2)</p>
              <p className="text-sm mb-4">Where t_ff is the free-fall time, G is the gravitational constant, and ρ is the initial density of the gas cloud.</p>
              <StarFormationCalculator />
            </div>
          )
        },
        {
          title: "Stellar Evolution",
          content: (
            <div className="space-y-4">
              <p>Stellar evolution describes the changes a star undergoes during its lifetime. The evolutionary path of a star depends primarily on its initial mass:</p>
              <h3 className="font-bold">Evolutionary Stages:</h3>
              <ul className="list-disc pl-5">
                <li>Protostar</li>
                <li>Main sequence</li>
                <li>Red giant or supergiant</li>
                <li>Planetary nebula or supernova</li>
                <li>White dwarf, neutron star, or black hole</li>
              </ul>
              <p>The Hertzsprung-Russell diagram is a crucial tool in understanding stellar evolution, plotting stars' luminosity against their effective temperature.</p>
              <HertzsprungRussellDiagram />
            </div>
          )
        },
        {
          title: "Stellar Nucleosynthesis",
          content: (
            <div className="space-y-4">
              <p>Stellar nucleosynthesis is the process by which stars produce heavier elements through nuclear fusion reactions in their cores.</p>
              <h3 className="font-bold">Key Fusion Processes:</h3>
              <ul className="list-disc pl-5">
                <li>Proton-proton chain (main sequence stars like the Sun)</li>
                <li>CNO cycle (more massive stars)</li>
                <li>Triple-alpha process (helium fusion in red giants)</li>
                <li>S-process and R-process (production of elements heavier than iron)</li>
              </ul>
              <p>These processes are responsible for creating most of the elements we observe in the universe, including those that make up planets and life itself.</p>
            </div>
          )
        }
      ]
    },
    {
      title: "Planetary Science",
      icon: <Globe className="w-8 h-8 text-green-500" />,
      sections: [
        {
          title: "Solar System Formation",
          content: (
            <div className="space-y-4">
              <p>The solar system formed about 4.6 billion years ago from the gravitational collapse of a giant molecular cloud. This process involved several stages:</p>
              <ol className="list-decimal pl-5">
                <li>Nebular hypothesis: Collapse of a rotating cloud of gas and dust</li>
                <li>Protoplanetary disk formation</li>
                <li>Planetesimal accretion</li>
                <li>Planetary migration and system stabilization</li>
              </ol>
              <p>Understanding solar system formation helps us comprehend the diversity of exoplanetary systems we're discovering.</p>
            </div>
          )
        },
        {
          title: "Planetary Atmospheres",
          content: (
            <div className="space-y-4">
              <p>Planetary atmospheres vary greatly across our solar system and exoplanets. Key factors influencing atmospheric composition and dynamics include:</p>
              <ul className="list-disc pl-5">
                <li>Planet mass and surface gravity</li>
                <li>Distance from the star</li>
                <li>Magnetic field strength</li>
                <li>Presence of geological activity</li>
              </ul>
              <h3 className="font-bold mt-4">Atmospheric Scale Height:</h3>
              <p className="bg-gray-100 p-2 rounded-md text-center mb-2">H = kT / mg</p>
              <p className="text-sm mb-4">Where H is the scale height, k is Boltzmann's constant, T is temperature, m is the mean molecular mass, and g is surface gravity.</p>
              <AtmosphericScaleHeightCalculator />
            </div>
          )
        }
      ]
    },
    {
      title: "Galactic Astrophysics",
      icon: <Wind className="w-8 h-8 text-purple-500" />,
      sections: [
        {
          title: "Galactic Structure",
          content: (
            <div className="space-y-4">
              <p>Galaxies are vast collections of stars, gas, dust, and dark matter. The Milky Way, our home galaxy, is a barred spiral galaxy with several key components:</p>
              <ul className="list-disc pl-5">
                <li>Galactic bulge</li>
                <li>Spiral arms</li>
                <li>Galactic disk</li>
                <li>Galactic halo</li>
                <li>Supermassive black hole at the center (Sagittarius A*)</li>
              </ul>
              <p>Understanding galactic structure helps us comprehend galaxy formation and evolution processes.</p>
            </div>
          )
        },
        {
          title: "Dark Matter",
          content: (
            <div className="space-y-4">
              <p>Dark matter is a hypothetical form of matter that does not interact with electromagnetic radiation (light) but exerts gravitational effects. Evidence for dark matter includes:</p>
              <ul className="list-disc pl-5">
                <li>Galaxy rotation curves</li>
                <li>Gravitational lensing</li>
                <li>Cosmic microwave background anisotropies</li>
              </ul>
              <p>While we can't directly observe dark matter, its effects are crucial in explaining large-scale cosmic structures and galaxy dynamics.</p>
              <DarkMatterDistributionGraph />
            </div>
          )
        }
      ]
    },
    {
      title: "Cosmology",
      icon: <Globe className="w-8 h-8 text-red-500" />,
      sections: [
        {
          title: "Big Bang Theory",
          content: (
            <div className="space-y-4">
              <p>The Big Bang theory is the prevailing cosmological model for the origin and evolution of the universe. Key aspects include:</p>
              <ul className="list-disc pl-5">
                <li>Initial singularity and rapid expansion</li>
                <li>Cosmic inflation</li>
                <li>Formation of fundamental particles</li>
                <li>Nucleosynthesis of light elements</li>
                <li>Recombination and the cosmic microwave background</li>
              </ul>
              <p>The Big Bang theory is supported by multiple lines of evidence, including the expansion of the universe, the abundance of light elements, and the cosmic microwave background radiation.</p>
            </div>
          )
        },
        {
          title: "Cosmic Expansion",
          content: (
            <div className="space-y-4">
              <p>The expansion of the universe is a fundamental concept in modern cosmology. It's described by Hubble's Law:</p>
              <p className="bg-gray-100 p-2 rounded-md text-center mb-2">v = H₀ * d</p>
              <p className="text-sm mb-4">Where v is the recessional velocity, H₀ is the Hubble constant, and d is the distance to the galaxy.</p>
              <HubbleLawCalculator />
              <p>Recent observations suggest that the expansion of the universe is accelerating, leading to the concept of dark energy.</p>
            </div>
          )
        }
      ]
    },
    {
      title: "High-Energy Astrophysics",
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      sections: [
        {
          title: "Black Holes",
          content: (
            <div className="space-y-4">
              <p>Black holes are regions of spacetime where gravity is so strong that nothing, not even light, can escape. Key properties include:</p>
              <ul className="list-disc pl-5">
                <li>Event horizon</li>
                <li>Singularity</li>
                <li>Accretion disk</li>
                <li>Hawking radiation (theoretical)</li>
              </ul>
              <h3 className="font-bold mt-4">Schwarzschild Radius:</h3>
              <p className="bg-gray-100 p-2 rounded-md text-center mb-2">Rs = 2GM / c²</p>
              <p className="text-sm mb-4">Where Rs is the Schwarzschild radius, G is the gravitational constant, M is the mass of the black hole, and c is the speed of light.</p>
              <SchwarzschildRadiusCalculator />
            </div>
          )
        },
        {
          title: "Neutron Stars",
          content: (
            <div className="space-y-4">
              <p>Neutron stars are the collapsed cores of massive stars, formed in supernova explosions. They are characterized by:</p>
              <ul className="list-disc pl-5">
                <li>Extremely high density</li>
                <li>Rapid rotation (pulsars)</li>
                <li>Strong magnetic fields</li>
                <li>Degenerate neutron matter</li>
              </ul>
              <p>Neutron stars provide unique laboratories for studying matter under extreme conditions.</p>
            </div>
          )
        }
      ]
    },
    {
      title: "Astrobiology",
      icon: <Globe className="w-8 h-8 text-green-600" />,
      sections: [
        {
          title: "Habitable Zones",
          content: (
            <div className="space-y-4">
              <p>The habitable zone, often called the "Goldilocks zone," is the region around a star where conditions might allow liquid water on a planet's surface. Factors influencing habitability include:</p>
              <ul className="list-disc pl-5">
                <li>Stellar flux</li>
                <li>Planetary atmosphere</li>
                <li>Planetary mass and composition</li>
                <li>Presence of a magnetic field</li>
              </ul>
              <p>Understanding habitable zones is crucial in the search for potentially life-bearing exoplanets.</p>
            <HabitableZoneCalculator />
            </div>
          )
        },
        {
          title: "Exoplanets",
          content: (
            <div className="space-y-4">
              <p>Exoplanets are planets orbiting stars other than the Sun. Detection methods include:</p>
              <ul className="list-disc pl-5">
                <li>Transit method</li>
                <li>Radial velocity method</li>
                <li>Direct imaging</li>
                <li>Gravitational microlensing</li>
              </ul>
              <p>The study of exoplanets has revolutionized our understanding of planetary systems and the potential for life beyond Earth.</p>
              <ExoplanetTransitDepthCalculator />
            </div>
          )
        },
      ]
    }, 
    {
      title: "Planetary Science",
      sections: [
        {
          title: "Solar System",
          content: (
            <div className="space-y-4">
              <p>Our Solar System consists of the Sun, eight planets, dwarf planets, moons, asteroids, and comets. Key features include:</p>
              <ul className="list-disc pl-5">
                <li>Four inner rocky planets: Mercury, Venus, Earth, and Mars</li>
                <li>Four outer gas giants: Jupiter, Saturn, Uranus, and Neptune</li>
                <li>The asteroid belt between Mars and Jupiter</li>
                <li>The Kuiper Belt and Oort Cloud in the outer Solar System</li>
              </ul>
              <InteractiveDiagram 
                title="Planets of the Solar System" 
                description="This diagram shows the relative sizes of the planets in our Solar System."
                data={[
                  { name: "Mercury", value: 0.383 },
                  { name: "Venus", value: 0.949 },
                  { name: "Earth", value: 1 },
                  { name: "Mars", value: 0.532 },
                  { name: "Jupiter", value: 11.21 },
                  { name: "Saturn", value: 9.45 },
                  { name: "Uranus", value: 4.01 },
                  { name: "Neptune", value: 3.88 }
                ]}
                XAxisLabel="Planet"
                YAxisLabel="Relative Diameter (Earth = 1)"
              />
            </div>
          ),
        },
        {
          title: "Exoplanets",
          content: (
            <div className="space-y-4">
              <p>Exoplanets are planets orbiting stars other than the Sun. Detection methods include:</p>
              <ul className="list-disc pl-5">
                <li>Transit method</li>
                <li>Radial velocity method</li>
                <li>Direct imaging</li>
                <li>Gravitational microlensing</li>
              </ul>
              <p>The study of exoplanets has revolutionized our understanding of planetary systems and the potential for life beyond Earth.</p>
              <ExoplanetTransitDepthCalculator />
              <InteractiveDiagram 
                title="Exoplanet Detection Methods" 
                description="This chart shows the distribution of exoplanet detection methods."
                data={[
                  { name: "Transit", value: 76.8 },
                  { name: "Radial Velocity", value: 19.2 },
                  { name: "Microlensing", value: 2.5 },
                  { name: "Imaging", value: 1.2 },
                  { name: "Other", value: 0.3 }
                ]}
                XAxisLabel="Detection Method"
                YAxisLabel="Percentage of Discoveries"
              />
            </div>
          ),
        },
      ],
    },
  ];

  
  const nextChapter = () => {
    if (currentSection < chapters[currentChapter].sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setCurrentChapter((currentChapter + 1) % chapters.length);
      setCurrentSection(0);
    }
  };

  const prevChapter = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else {
      setCurrentChapter((currentChapter - 1 + chapters.length) % chapters.length);
      setCurrentSection(chapters[(currentChapter - 1 + chapters.length) % chapters.length].sections.length - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-center text-indigo-800 mb-6">Comprehensive Astrophysics Book</h1>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevChapter} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition duration-300">
          Previous
        </button>
        <div>
          <h2 className="text-2xl font-semibold text-center text-indigo-600">{chapters[currentChapter].title}</h2>
          <h3 className="text-xl font-medium text-center text-indigo-400">{chapters[currentChapter].sections[currentSection].title}</h3>
        </div>
        <button onClick={nextChapter} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition duration-300">
          Next
        </button>
      </div>
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md p-6 rounded-lg">
        {chapters[currentChapter].sections[currentSection].content}
      </div>
      <p className="text-center mt-4 text-sm text-gray-600">
        Chapter {currentChapter + 1}.{currentSection + 1} of {chapters.length}.{chapters[currentChapter].sections.length}
      </p>
    </div>
  );
};

export default App;

// const App = () => {
//   const [currentChapter, setCurrentChapter] = useState(0);
//   const [currentSection, setCurrentSection] = useState(0);

//   const chapters = [
//         {
//       title: "Introduction to Astrophysics",
//       icon: <Book className="w-8 h-8 text-blue-600" />,
//       sections: [
//         {
//           title: "What is Astrophysics?",
//           content: (
//             <div className="space-y-4">
//               <p>Astrophysics is the branch of astronomy that employs the principles of physics and chemistry to ascertain the nature of celestial bodies, rather than their positions or motions in space.</p>
//               <p>This comprehensive field incorporates elements of many disciplines, including:</p>
//               <ul className="list-disc pl-5">
//                 <li>Classical mechanics</li>
//                 <li>Electromagnetism</li>
//                 <li>Statistical mechanics</li>
//                 <li>Quantum mechanics</li>
//                 <li>Relativity</li>
//                 <li>Nuclear and particle physics</li>
//                 <li>Atomic and molecular physics</li>
//               </ul>
//               <p>Astrophysicists seek to understand the universe and our place in it. This book will guide you through the fundamentals of astrophysics, from the smallest particles to the largest structures in the cosmos.</p>
//             </div>
//           )
//         },
//         {
//           title: "Historical Development",
//           content: (
//             <div className="space-y-4">
//               <p>The field of astrophysics has a rich history, evolving from ancient astronomical observations to modern-day high-tech explorations of the cosmos.</p>
//               <h3 className="font-bold">Key Milestones:</h3>
//               <ul className="list-disc pl-5">
//                 <li>Ancient times: Early astronomical observations and creation of star catalogs</li>
//                 <li>16th-17th centuries: Copernican Revolution and Kepler's laws of planetary motion</li>
//                 <li>1687: Newton's law of universal gravitation</li>
//                 <li>19th century: Development of spectroscopy, allowing study of stellar compositions</li>
//                 <li>Early 20th century: Einstein's theory of relativity</li>
//                 <li>1920s: Discovery of galaxies beyond the Milky Way</li>
//                 <li>1960s onwards: Space-based observations and multi-wavelength astronomy</li>
//               </ul>
//               <p>Today, astrophysics continues to evolve with new technologies and theoretical breakthroughs, pushing the boundaries of our understanding of the universe.</p>
//             </div>
//           )
//         }
//       ]
//     },
//     {
//       title: "Fundamentals of Astrophysics",
//       sections: [
//         {
//           title: "Introduction to Astrophysics",
//           content: (
//             <div className="space-y-4">
//               <p>Astrophysics is the branch of astronomy that employs the principles of physics and chemistry to ascertain the nature of celestial bodies and phenomena.</p>
//               <InteractiveDiagram 
//                 title="Scale of the Universe"
//                 description="This diagram shows the relative sizes of various astronomical objects."
//                 data={[
//                   { name: "Earth", value: Math.log10(12742) },
//                   { name: "Sun", value: Math.log10(1391000) },
//                   { name: "Red Giant", value: Math.log10(1391000 * 100) },
//                   { name: "Milky Way", value: Math.log10(1.5e18) },
//                   { name: "Observable Universe", value: Math.log10(8.8e26) }
//                 ]}
//                 XAxisLabel="Astronomical Object"
//                 YAxisLabel="Log10(Diameter in km)"
//               />
//             </div>
//           ),
//         },
//       ],
//     },
//     {
//       title: "Stellar Astrophysics",
//       sections: [
//         {
//           title: "Star Formation",
//           content: (
//             <div className="space-y-4">
//               <p>Stars form from the gravitational collapse of molecular clouds.</p>
//               <StarFormationCalculator />
//             </div>
//           ),
//         },
//         {
//           title: "Stellar Evolution",
//           content: (
//             <div className="space-y-4">
//               <p>Stellar evolution describes the changes a star undergoes during its lifetime.</p>
//               <HertzsprungRussellDiagram />
//             </div>
//           ),
//         },
//       ],
//     },
//     {
//       title: "Planetary Science",
//       sections: [
//         {
//           title: "Planetary Atmospheres",
//           content: (
//             <div className="space-y-4">
//               <p>Planetary atmospheres vary greatly across our solar system and exoplanets.</p>
//               <AtmosphericScaleHeightCalculator />
//             </div>
//           ),
//         },
//         {
//           title: "Habitable Zones",
//           content: (
//             <div className="space-y-4">
//               <p>The habitable zone is the region around a star where conditions might allow liquid water on a planet's surface.</p>
//               <HabitableZoneCalculator />
//             </div>
//           ),
//         },
//       ],
//     },
//     {
//       title: "Galactic Astrophysics",
//       sections: [
//         {
//           title: "Dark Matter",
//           content: (
//             <div className="space-y-4">
//               <p>Dark matter is a hypothetical form of matter that accounts for approximately 85% of the matter in the universe.</p>
//               <DarkMatterDistributionGraph />
//             </div>
//           ),
//         },
//       ],
//     },
//     {
//       title: "Cosmology",
//       sections: [
//         {
//           title: "Cosmic Expansion",
//           content: (
//             <div className="space-y-4">
//               <p>The expansion of the universe is described by Hubble's Law.</p>
//               <HubbleLawCalculator />
//             </div>
//           ),
//         },
//       ],
//     },
//   ];

//   const nextChapter = () => {
//     if (currentSection < chapters[currentChapter].sections.length - 1) {
//       setCurrentSection(currentSection + 1);
//     } else {
//       setCurrentChapter((currentChapter + 1) % chapters.length);
//       setCurrentSection(0);
//     }
//   };

//   const prevChapter = () => {
//     if (currentSection > 0) {
//       setCurrentSection(currentSection - 1);
//     } else {
//       setCurrentChapter((currentChapter - 1 + chapters.length) % chapters.length);
//       setCurrentSection(chapters[(currentChapter - 1 + chapters.length) % chapters.length].sections.length - 1);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
//       <h1 className="text-4xl font-bold text-center text-indigo-800 mb-6">Astrophysics</h1>
//       <div className="flex items-center justify-between mb-4">
//         <button onClick={prevChapter} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition duration-300">
//           Previous
//         </button>
//         <div>
//           <h2 className="text-2xl font-semibold text-center text-indigo-600">{chapters[currentChapter].title}</h2>
//           <h3 className="text-xl font-medium text-center text-indigo-400">{chapters[currentChapter].sections[currentSection].title}</h3>
//         </div>
//         <button onClick={nextChapter} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition duration-300">
//           Next
//         </button>
//       </div>
//       <div className="bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md p-6 rounded-lg">
//         {chapters[currentChapter].sections[currentSection].content}
//       </div>
//       <p className="text-center mt-4 text-sm text-gray-600">
//         Chapter {currentChapter + 1}.{currentSection + 1} of {chapters.length}.{chapters[currentChapter].sections.length}
//       </p>
//     </div>
//   );
// };

// export default App;
