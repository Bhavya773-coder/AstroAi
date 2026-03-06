import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import * as d3 from 'd3';
import AppNavbar from './AppNavbar';

interface BirthChartData {
  sun_sign: string;
  moon_sign: string;
  ascendant: string;
  dominant_planet: string;
  enhanced_birth_chart_data?: {
    sun_sign: { sign: string; element: string; quality: string; ruler: string; description: string };
    moon_sign: { sign: string; element: string; quality: string; ruler: string; description: string };
    ascendant: { sign: string; element: string; quality: string; ruler: string; description: string };
    dominant_planet: { planet: string; sign: string; element: string; description: string };
  };
  detailed_analysis?: any;
  planetary_positions?: any;
  aspects?: any;
  houses?: any;
}

interface ZodiacSign {
  sign: string;
  element: string;
  quality: string;
  ruler: string;
  symbol: string;
  color: string;
  angle: number;
  description: string;
  traits: string[];
  compatibility: string[];
}

const zodiacIcons: { [key: string]: string } = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓"
};

const zodiacSignsData: ZodiacSign[] = [
  {
    sign: "Aries",
    element: "Fire",
    quality: "Cardinal",
    ruler: "Mars",
    symbol: "♈",
    color: "#EF4444",
    angle: 0,
    description: "The first sign of zodiac, representing new beginnings, courage, and pioneering spirit.",
    traits: ["Courageous", "Energetic", "Independent", "Impulsive", "Competitive"],
    strengths: ["Leadership", "Courage", "Determination", "Confidence"],
    challenges: ["Impatience", "Aggression", "Selfishness", "Impulsiveness"],
    compatibility: ["Leo", "Sagittarius", "Gemini"],
    career_suitability: ["Entrepreneur", "Athlete", "Military", "Sales"],
    love_compatibility: ["Leo", "Sagittarius", "Aquarius"],
    lucky_numbers: [1, 9, 17],
    lucky_colors: ["Red", "Orange"],
    mantra: "I am the pioneer of new beginnings",
    elemental_traits: "Fiery, passionate, initiating energy"
  },
  {
    sign: "Taurus",
    element: "Earth",
    quality: "Fixed",
    ruler: "Venus",
    symbol: "♉",
    color: "#10B981",
    angle: 30,
    description: "The sign of stability, patience, and material comfort, representing earthly pleasures and security.",
    traits: ["Reliable", "Patient", "Practical", "Loyal", "Stubborn"],
    strengths: ["Reliability", "Patience", "Practicality", "Loyalty"],
    challenges: ["Stubbornness", "Possessiveness", "Resistance to change", "Materialism"],
    compatibility: ["Virgo", "Capricorn", "Cancer"],
    career_suitability: ["Banking", "Real Estate", "Agriculture", "Art"],
    love_compatibility: ["Virgo", "Capricorn", "Pisces"],
    lucky_numbers: [2, 6, 14],
    lucky_colors: ["Green", "Pink"],
    mantra: "I build lasting foundations of security and comfort",
    elemental_traits: "Grounded, sensual, stabilizing energy"
  },
  {
    sign: "Gemini",
    element: "Air",
    quality: "Mutable",
    ruler: "Mercury",
    symbol: "♊",
    color: "#F59E0B",
    angle: 60,
    description: "The sign of communication, adaptability, and intellectual curiosity, representing duality and versatility.",
    traits: ["Adaptable", "Outgoing", "Intelligent", "Curious", "Inconsistent"],
    strengths: ["Versatility", "Communication", "Intelligence", "Adaptability"],
    challenges: ["Inconsistency", "Nervousness", "Superficiality", "Indecisiveness"],
    compatibility: ["Libra", "Aquarius", "Aries"],
    career_suitability: ["Journalism", "Teaching", "Sales", "Public Relations"],
    love_compatibility: ["Libra", "Aquarius", "Leo"],
    lucky_numbers: [5, 14, 23],
    lucky_colors: ["Yellow", "Light Blue"],
    mantra: "I communicate ideas and connect with diverse perspectives",
    elemental_traits: "Mental, social, adaptable energy"
  },
  {
    sign: "Cancer",
    element: "Water",
    quality: "Cardinal",
    ruler: "Moon",
    symbol: "♋",
    color: "#3B82F6",
    angle: 90,
    description: "The sign of emotion, nurturing, and intuition, representing home, family, and deep feelings.",
    traits: ["Emotional", "Intuitive", "Protective", "Moody", "Sympathetic"],
    strengths: ["Intuition", "Loyalty", "Empathy", "Protectiveness"],
    challenges: ["Moodiness", "Over-sensitivity", "Clinginess", "Defensiveness"],
    compatibility: ["Scorpio", "Pisces", "Taurus"],
    career_suitability: ["Healthcare", "Hospitality", "Real Estate", "Counseling"],
    love_compatibility: ["Scorpio", "Pisces", "Virgo"],
    lucky_numbers: [2, 7, 11],
    lucky_colors: ["White", "Silver"],
    mantra: "I create emotional security and nurture those I love",
    elemental_traits: "Nurturing, intuitive, protective energy"
  },
  {
    sign: "Leo",
    element: "Fire",
    quality: "Fixed",
    ruler: "Sun",
    symbol: "♌",
    color: "#F97316",
    angle: 120,
    description: "The sign of creativity, leadership, and self-expression, representing royalty and dramatic flair.",
    traits: ["Creative", "Passionate", "Generous", "Arrogant", "Fixed"],
    strengths: ["Leadership", "Creativity", "Generosity", "Confidence"],
    challenges: ["Arrogance", "Stubbornness", "Egotism", "Drama"],
    compatibility: ["Aries", "Sagittarius", "Gemini"],
    career_suitability: ["Entertainment", "Management", "Politics", "Creative Arts"],
    love_compatibility: ["Aries", "Sagittarius", "Libra"],
    lucky_numbers: [1, 4, 10],
    lucky_colors: ["Gold", "Orange"],
    mantra: "I shine my light and inspire others through creative self-expression",
    elemental_traits: "Creative, confident, generous energy"
  },
  {
    sign: "Virgo",
    element: "Earth",
    quality: "Mutable",
    ruler: "Mercury",
    symbol: "♍",
    color: "#059669",
    angle: 150,
    description: "The sign of perfection, service, and analytical thinking, representing purity and practical wisdom.",
    traits: ["Analytical", "Helpful", "Reliable", "Precise", "Critical"],
    strengths: ["Analytical", "Reliability", "Practicality", "Helpfulness"],
    challenges: ["Criticalness", "Perfectionism", "Worry", "Overthinking"],
    compatibility: ["Taurus", "Capricorn", "Cancer"],
    career_suitability: ["Healthcare", "Research", "Accounting", "Editing"],
    love_compatibility: ["Taurus", "Capricorn", "Scorpio"],
    lucky_numbers: [5, 14, 23],
    lucky_colors: ["Navy", "Gray"],
    mantra: "I analyze, organize, and perfect to serve with practical wisdom",
    elemental_traits: "Earthy, analytical, service-oriented energy"
  },
  {
    sign: "Libra",
    element: "Air",
    quality: "Cardinal",
    ruler: "Venus",
    symbol: "♎",
    color: "#EC4899",
    angle: 180,
    description: "The sign of balance, harmony, and relationships, representing justice and aesthetic appreciation.",
    traits: ["Diplomatic", "Fair-minded", "Social", "Indecisive", "Cooperative"],
    strengths: ["Diplomacy", "Fairness", "Social grace", "Cooperation"],
    challenges: ["Indecisiveness", "People-pleasing", "Avoidance of conflict", "Superficiality"],
    compatibility: ["Gemini", "Aquarius", "Leo"],
    career_suitability: ["Law", "Diplomacy", "Art", "Human Resources"],
    love_compatibility: ["Gemini", "Aquarius", "Sagittarius"],
    lucky_numbers: [6, 15, 24],
    lucky_colors: ["Pink", "Light Blue"],
    mantra: "I create balance and harmony in all my relationships",
    elemental_traits: "Social, harmonious, justice-oriented energy"
  },
  {
    sign: "Scorpio",
    element: "Water",
    quality: "Fixed",
    ruler: "Pluto",
    symbol: "♏",
    color: "#7C3AED",
    angle: 210,
    description: "The sign of transformation, intensity, and mystery, representing depth and psychological insight.",
    traits: ["Passionate", "Stubborn", "Resourceful", "Brave", "Jealous"],
    strengths: ["Passion", "Resourcefulness", "Bravery", "Determination"],
    challenges: ["Jealousy", "Stubbornness", "Secrecy", "Intensity"],
    compatibility: ["Cancer", "Pisces", "Virgo"],
    career_suitability: ["Psychology", "Research", "Detective", "Surgery"],
    love_compatibility: ["Cancer", "Pisces", "Capricorn"],
    lucky_numbers: [8, 11, 18],
    lucky_colors: ["Dark Red", "Black"],
    mantra: "I transform through depth and embrace profound change",
    elemental_traits: "Intense, transformative, mysterious energy"
  },
  {
    sign: "Sagittarius",
    element: "Fire",
    quality: "Mutable",
    ruler: "Jupiter",
    symbol: "♐",
    color: "#DC2626",
    angle: 240,
    description: "The sign of exploration, philosophy, and optimism, representing freedom and higher learning.",
    traits: ["Generous", "Idealistic", "Humorous", "Adventurous", "Impatient"],
    strengths: ["Optimism", "Generosity", "Philosophical mind", "Adventure"],
    challenges: ["Impatience", "Restlessness", "Bluntness", "Irresponsibility"],
    compatibility: ["Aries", "Leo", "Libra"],
    career_suitability: ["Travel", "Publishing", "Education", "Philosophy"],
    love_compatibility: ["Aries", "Leo", "Aquarius"],
    lucky_numbers: [3, 9, 21],
    lucky_colors: ["Purple", "Turquoise"],
    mantra: "I explore horizons and seek higher wisdom through experience",
    elemental_traits: "Expansive, optimistic, freedom-loving energy"
  },
  {
    sign: "Capricorn",
    element: "Earth",
    quality: "Cardinal",
    ruler: "Saturn",
    symbol: "♑",
    color: "#047857",
    angle: 270,
    description: "The sign of ambition, discipline, and structure, representing achievement and worldly success.",
    traits: ["Responsible", "Disciplined", "Self-control", "Know-it-all", "Unforgiving"],
    strengths: ["Discipline", "Ambition", "Reliability", "Practicality"],
    challenges: ["Pessimism", "Rigidity", "Workaholism", "Emotional distance"],
    compatibility: ["Taurus", "Virgo", "Scorpio"],
    career_suitability: ["Business", "Finance", "Management", "Engineering"],
    love_compatibility: ["Taurus", "Virgo", "Pisces"],
    lucky_numbers: [8, 10, 22],
    lucky_colors: ["Brown", "Dark Green"],
    mantra: "I build lasting structures through discipline and persistence",
    elemental_traits: "Ambitious, practical, structural energy"
  },
  {
    sign: "Aquarius",
    element: "Air",
    quality: "Fixed",
    ruler: "Uranus",
    symbol: "♒",
    color: "#0891B2",
    angle: 300,
    description: "The sign of innovation, humanitarianism, and rebellion, representing progress and social consciousness.",
    traits: ["Progressive", "Original", "Independent", "Humanitarian", "Unemotional"],
    strengths: ["Innovation", "Independence", "Humanitarianism", "Originality"],
    challenges: ["Emotional detachment", "Rebellion", "Unpredictability", "Stubbornness"],
    compatibility: ["Gemini", "Libra", "Sagittarius"],
    career_suitability: ["Technology", "Science", "Social Work", "Innovation"],
    love_compatibility: ["Gemini", "Libra", "Aries"],
    lucky_numbers: [4, 11, 22],
    lucky_colors: ["Electric Blue", "Silver"],
    mantra: "I innovate for humanity and embrace progressive change",
    elemental_traits: "Intellectual, unconventional, progressive energy"
  },
  {
    sign: "Pisces",
    element: "Water",
    quality: "Mutable",
    ruler: "Neptune",
    symbol: "♓",
    color: "#6366F1",
    angle: 330,
    description: "The sign of spirituality, compassion, and imagination, representing dreams and artistic sensitivity.",
    traits: ["Compassionate", "Artistic", "Intuitive", "Gentle", "Fearful"],
    strengths: ["Compassion", "Intuition", "Artistic sensitivity", "Empathy"],
    challenges: ["Fearfulness", "Escapism", "Over-sensitivity", "Victim mentality"],
    compatibility: ["Cancer", "Scorpio", "Capricorn"],
    career_suitability: ["Arts", "Music", "Spiritual work", "Healing"],
    love_compatibility: ["Cancer", "Scorpio", "Taurus"],
    lucky_numbers: [7, 12, 16],
    lucky_colors: ["Sea Green", "Lavender"],
    mantra: "I flow with cosmic intuition and express divine compassion",
    elemental_traits: "Spiritual, compassionate, imaginative energy"
  }
];

interface ZodiacSign {
  sign: string;
  element: string;
  quality: string;
  ruler: string;
  description: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
  compatibility: string[];
  career_suitability: string[];
  love_compatibility: string[];
  lucky_numbers: number[];
  lucky_colors: string[];
  mantra: string;
  elemental_traits: string;
  symbol: string;
}

const BirthChartPage: React.FC = () => {
  const navigate = useNavigate();
  const [birthChartData, setBirthChartData] = useState<BirthChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sunSignInfo, setSunSignInfo] = useState<ZodiacSign | null>(null);
  const [moonSignInfo, setMoonSignInfo] = useState<ZodiacSign | null>(null);
  const [ascendantInfo, setAscendantInfo] = useState<ZodiacSign | null>(null);
  
  // Individual zodiac signs for display
  const [zodiacData, setZodiacData] = useState({
    sunSign: '',
    moonSign: '',
    ascendant: '',
    dominantPlanet: ''
  });
  
  const [isLoadingZodiac, setIsLoadingZodiac] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const fetchBirthChartData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch('/api/birth-chart');
        
        if (response.success) {
          if (response.birthChart) {
            setBirthChartData(response.birthChart);
            // Store individual zodiac signs for display
            setZodiacData({
              sunSign: response.sunSign || 'Leo',
              moonSign: response.moonSign || 'Taurus',
              ascendant: response.ascendant || 'Leo',
              dominantPlanet: response.dominantPlanet || 'Sun'
            });
            // Fetch detailed zodiac information for user's signs
            await fetchZodiacDetails({
              sun_sign: response.sunSign,
              moon_sign: response.moonSign,
              ascendant: response.ascendant,
              dominant_planet: response.dominantPlanet
            });
          } else if (response.message && response.message.includes('Generate your insights')) {
            // User needs to generate insights first
            setBirthChartData(null);
            setZodiacData({
              sunSign: '',
              moonSign: '',
              ascendant: '',
              dominantPlanet: ''
            });
          } else {
            // Other case where birth chart is not available
            setBirthChartData(null);
            setZodiacData({
              sunSign: '',
              moonSign: '',
              ascendant: '',
              dominantPlanet: ''
            });
          }
        } else {
          setError('Failed to load birth chart data');
        }
      } catch (err: any) {
        console.error('Error fetching birth chart data:', err);
        setError(err.message || 'Failed to load birth chart data');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchZodiacDetails = async (birthChartData: BirthChartData) => {
      try {
        setIsLoadingZodiac(true);
        
        // Get detailed info for user's Sun sign
        if (birthChartData.sun_sign) {
          const sunResponse = await apiFetch('/api/zodiac/sign-info', {
            method: 'POST',
            body: JSON.stringify({ userSign: birthChartData.sun_sign })
          });
          
          if (sunResponse.success) {
            console.log('Sun sign details:', sunResponse.zodiacInfo);
            setSunSignInfo(sunResponse.zodiacInfo);
          }
        }

        // Get detailed info for user's Moon sign
        if (birthChartData.moon_sign) {
          const moonResponse = await apiFetch('/api/zodiac/sign-info', {
            method: 'POST',
            body: JSON.stringify({ userSign: birthChartData.moon_sign })
          });
          
          if (moonResponse.success) {
            console.log('Moon sign details:', moonResponse.zodiacInfo);
            setMoonSignInfo(moonResponse.zodiacInfo);
          }
        }

        // Get detailed info for user's Ascendant
        if (birthChartData.ascendant) {
          const ascResponse = await apiFetch('/api/zodiac/sign-info', {
            method: 'POST',
            body: JSON.stringify({ userSign: birthChartData.ascendant })
          });
          
          if (ascResponse.success) {
            console.log('Ascendant details:', ascResponse.zodiacInfo);
            setAscendantInfo(ascResponse.zodiacInfo);
          }
        }
      } catch (error) {
        console.error('Error fetching zodiac details:', error);
      } finally {
        setIsLoadingZodiac(false);
      }
    };

    fetchBirthChartData();
  }, []);

  // Draw professional cosmic wheel visualization
  const drawCosmicWheel = (data: BirthChartData) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 450;
    const height = 450;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 180;

    // Create professional gradients
    const defs = svg.append("defs");
    
    // Sun gradient
    const sunGradient = defs.append("radialGradient")
      .attr("id", "sunGradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    
    sunGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#FDB813")
      .attr("stop-opacity", 1);
    
    sunGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#F59E0B")
      .attr("stop-opacity", 0.8);

    // Moon gradient
    const moonGradient = defs.append("radialGradient")
      .attr("id", "moonGradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    
    moonGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#E0E7FF")
      .attr("stop-opacity", 1);
    
    moonGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#6366F1")
      .attr("stop-opacity", 0.8);

    // Ascendant gradient
    const ascGradient = defs.append("radialGradient")
      .attr("id", "ascGradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    
    ascGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#F472B6")
      .attr("stop-opacity", 1);
    
    ascGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#A855F7")
      .attr("stop-opacity", 0.8);

    // Background gradient for the wheel
    const bgGradient = defs.append("radialGradient")
      .attr("id", "bgGradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    
    bgGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#1e293b")
      .attr("stop-opacity", 1);
    
    bgGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0f172a")
      .attr("stop-opacity", 1);

    // Draw background circle
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", radius + 10)
      .attr("fill", "url(#bgGradient)")
      .attr("opacity", 0.9);

    // Draw zodiac segments with professional styling
    zodiacSignsData.forEach((sign, index) => {
      const startAngle = sign.angle * Math.PI / 180;
      const endAngle = (sign.angle + 30) * Math.PI / 180;
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
      
      // Draw segment with subtle gradient
      const segmentGradient = defs.append("linearGradient")
        .attr("id", `segment${index}Gradient`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
      
      segmentGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", sign.color)
        .attr("stop-opacity", 0.2);
      
      segmentGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", sign.color)
        .attr("stop-opacity", 0.05);
      
      svg.append("path")
        .attr("d", `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`)
        .attr("fill", `url(#segment${index}Gradient)`)
        .attr("stroke", sign.color)
        .attr("stroke-width", 1)
        .attr("opacity", 0.8);
      
      // Add sign symbol with professional styling and better positioning
      const textAngle = sign.angle * Math.PI / 180;
      const textRadius = radius + 25; // Reduced from 35 to prevent edge cropping
      const textX = centerX + textRadius * Math.cos(textAngle);
      const textY = centerY + textRadius * Math.sin(textAngle);
      
      // Symbol background circle - slightly smaller
      svg.append("circle")
        .attr("cx", textX)
        .attr("cy", textY)
        .attr("r", 15) // Reduced from 18
        .attr("fill", sign.color + "20")
        .attr("stroke", sign.color)
        .attr("stroke-width", 1)
        .attr("opacity", 0.8);
      
      // Symbol text - slightly smaller
      svg.append("text")
        .attr("x", textX)
        .attr("y", textY + 1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", sign.color)
        .attr("font-size", "12px") // Reduced from 14px
        .attr("font-weight", "bold")
        .attr("font-family", "serif")
        .text(sign.symbol);
      
      // Sign name - closer to symbol and smaller
      svg.append("text")
        .attr("x", textX)
        .attr("y", textY + 25) // Reduced from 32
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", sign.color)
        .attr("font-size", "10px") // Reduced from 11px
        .attr("font-weight", "500")
        .attr("opacity", 0.9)
        .text(sign.sign);
    });

    // Draw decorative circles
    [radius * 0.3, radius * 0.6, radius * 0.9].forEach((r, i) => {
      svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.1 + (i * 0.05));
    });

    // Draw center point with glow
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 8)
      .attr("fill", "#ffffff")
      .attr("opacity", 0.9);

    // Draw user's planets based on their birth chart data
    if (data) {
      // Extract zodiac signs from data - handle both string and object formats
      const getSignFromData = (signData: string | any): string => {
        if (typeof signData === 'string') return signData;
        if (signData && typeof signData === 'object') {
          return signData.sign || signData.planet || 'Unknown';
        }
        return 'Unknown';
      };

      const sunSignName = getSignFromData(data.sun_sign);
      const moonSignName = getSignFromData(data.moon_sign);
      const ascSignName = getSignFromData(data.ascendant);

      // Get positions for user's signs
      const sunSignData = zodiacSignsData.find(s => s.sign === sunSignName);
      const moonSignData = zodiacSignsData.find(s => s.sign === moonSignName);
      const ascSignData = zodiacSignsData.find(s => s.sign === ascSignName);

      console.log('Drawing cosmic wheel with signs:', { sunSignName, moonSignName, ascSignName });
      console.log('Found sign data:', { sunSignData, moonSignData, ascSignData });

      // Highlight user's zodiac segments with special styling
      zodiacSignsData.forEach((sign, index) => {
        const isUserSign = sign.sign === sunSignName || sign.sign === moonSignName || sign.sign === ascSignName;
        
        if (isUserSign) {
          const startAngle = sign.angle * Math.PI / 180;
          const endAngle = (sign.angle + 30) * Math.PI / 180;
          
          const x1 = centerX + radius * Math.cos(startAngle);
          const y1 = centerY + radius * Math.sin(startAngle);
          const x2 = centerX + radius * Math.cos(endAngle);
          const y2 = centerY + radius * Math.sin(endAngle);
          
          const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
          
          // Highlight user's segment with brighter gradient
          const userSegmentGradient = defs.append("linearGradient")
            .attr("id", `userSegment${index}Gradient`)
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%");
          
          userSegmentGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", sign.color)
            .attr("stop-opacity", 0.6);
          
          userSegmentGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", sign.color)
            .attr("stop-opacity", 0.3);
          
          // Draw highlighted segment
          svg.append("path")
            .attr("d", `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`)
            .attr("fill", `url(#userSegment${index}Gradient)`)
            .attr("stroke", sign.color)
            .attr("stroke-width", 3)
            .attr("opacity", 1);
          
          // Add user sign label with better positioning
          const labelAngle = (sign.angle + 15) * Math.PI / 180;
          const labelRadius = radius * 0.65; // Move labels closer to center to avoid edge cropping
          const labelX = centerX + labelRadius * Math.cos(labelAngle);
          const labelY = centerY + labelRadius * Math.sin(labelAngle);
          
          let userLabel = '';
          let labelColor = sign.color;
          if (sign.sign === sunSignName) userLabel = 'Your Sun';
          else if (sign.sign === moonSignName) userLabel = 'Your Moon';
          else if (sign.sign === ascSignName) userLabel = 'Your Asc';
          
          if (userLabel) {
            // Smaller label background for better fit
            svg.append("rect")
              .attr("x", labelX - 30)
              .attr("y", labelY - 8)
              .attr("width", 60)
              .attr("height", 16)
              .attr("fill", "#000000")
              .attr("fill-opacity", 0.85)
              .attr("rx", 8);
            
            // Smaller label text
            svg.append("text")
              .attr("x", labelX)
              .attr("y", labelY + 2)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("fill", labelColor)
              .attr("font-size", "10px")
              .attr("font-weight", "bold")
              .attr("font-family", "Arial, sans-serif")
              .text(userLabel);
          }
        }
      });

      // Draw Sun with enhanced styling for user's personal sun sign
      if (sunSignData) {
        const sunAngle = sunSignData.angle * Math.PI / 180;
        const sunX = centerX + (radius * 0.5) * Math.cos(sunAngle);
        const sunY = centerY + (radius * 0.5) * Math.sin(sunAngle);
        
        // Enhanced sun glow effect
        for (let i = 4; i > 0; i--) {
          svg.append("circle")
            .attr("cx", sunX)
            .attr("cy", sunY)
            .attr("r", 30 + (i * 10))
            .attr("fill", "url(#sunGradient)")
            .attr("opacity", 0.15 * i);
        }
        
        // Main sun circle with enhanced styling
        svg.append("circle")
          .attr("cx", sunX)
          .attr("cy", sunY)
          .attr("r", 22)
          .attr("fill", "url(#sunGradient)")
          .attr("stroke", "#FDB813")
          .attr("stroke-width", 3)
          .attr("filter", "drop-shadow(0 0 15px rgba(253, 184, 19, 0.8))");
        
        // Sun symbol with larger size
        svg.append("text")
          .attr("x", sunX)
          .attr("y", sunY + 5)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#FFFFFF")
          .attr("font-size", "22px")
          .attr("font-weight", "bold")
          .attr("font-family", "serif")
          .text("☉");
        
        // Sun sign label with better positioning
        svg.append("text")
          .attr("x", sunX)
          .attr("y", sunY + 35) // Reduced distance to prevent cropping
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#FDB813")
          .attr("font-size", "11px") // Slightly smaller font
          .attr("font-weight", "bold")
          .attr("font-family", "Arial, sans-serif")
          .text(sunSignName);
      }

      // Draw Moon with enhanced styling for user's personal moon sign
      if (moonSignData) {
        const moonAngle = moonSignData.angle * Math.PI / 180;
        const moonX = centerX + (radius * 0.7) * Math.cos(moonAngle);
        const moonY = centerY + (radius * 0.7) * Math.sin(moonAngle);
        
        // Enhanced moon glow effect
        for (let i = 3; i > 0; i--) {
          svg.append("circle")
            .attr("cx", moonX)
            .attr("cy", moonY)
            .attr("r", 20 + (i * 8))
            .attr("fill", "url(#moonGradient)")
            .attr("opacity", 0.15 * i);
        }
        
        // Main moon circle with enhanced styling
        svg.append("circle")
          .attr("cx", moonX)
          .attr("cy", moonY)
          .attr("r", 16)
          .attr("fill", "url(#moonGradient)")
          .attr("stroke", "#6366F1")
          .attr("stroke-width", 3)
          .attr("filter", "drop-shadow(0 0 12px rgba(99, 102, 241, 0.8))");
        
        // Moon symbol with larger size
        svg.append("text")
          .attr("x", moonX)
          .attr("y", moonY + 4)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#FFFFFF")
          .attr("font-size", "18px")
          .attr("font-weight", "bold")
          .attr("font-family", "serif")
          .text("☽");
        
        // Moon sign label with better positioning
        svg.append("text")
          .attr("x", moonX)
          .attr("y", moonY + 30) // Reduced distance to prevent cropping
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#6366F1")
          .attr("font-size", "11px") // Slightly smaller font
          .attr("font-weight", "bold")
          .attr("font-family", "Arial, sans-serif")
          .text(moonSignName);
      }

      // Draw Ascendant with enhanced styling for user's personal ascendant sign
      if (ascSignData) {
        const ascAngle = ascSignData.angle * Math.PI / 180;
        const ascX = centerX + (radius * 0.3) * Math.cos(ascAngle);
        const ascY = centerY + (radius * 0.3) * Math.sin(ascAngle);
        
        // Enhanced ascendant glow effect
        for (let i = 2; i > 0; i--) {
          svg.append("circle")
            .attr("cx", ascX)
            .attr("cy", ascY)
            .attr("r", 15 + (i * 6))
            .attr("fill", "url(#ascGradient)")
            .attr("opacity", 0.15 * i);
        }
        
        // Main ascendant circle with enhanced styling
        svg.append("circle")
          .attr("cx", ascX)
          .attr("cy", ascY)
          .attr("r", 12)
          .attr("fill", "url(#ascGradient)")
          .attr("stroke", "#A855F7")
          .attr("stroke-width", 3)
          .attr("filter", "drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))");
        
        // Ascendant symbol with larger size
        svg.append("text")
          .attr("x", ascX)
          .attr("y", ascY + 3)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#FFFFFF")
          .attr("font-size", "16px")
          .attr("font-weight", "bold")
          .attr("font-family", "serif")
          .text("⇅");
        
        // Ascendant sign label with better positioning
        svg.append("text")
          .attr("x", ascX)
          .attr("y", ascY + 25) // Reduced distance to prevent cropping
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#A855F7")
          .attr("font-size", "11px") // Slightly smaller font
          .attr("font-weight", "bold")
          .attr("font-family", "Arial, sans-serif")
          .text(ascSignName);
      }
    }
  };

  useEffect(() => {
    // ... (rest of the code remains the same)
    if (birthChartData && svgRef.current) {
      // Extract the simple zodiac data from the complex birth chart object
      const zodiacDataForWheel = {
        sun_sign: birthChartData.enhanced_birth_chart_data?.sun_sign?.sign || 
                  birthChartData.sun_sign || 
                  zodiacData.sunSign,
        moon_sign: birthChartData.enhanced_birth_chart_data?.moon_sign?.sign || 
                   birthChartData.moon_sign || 
                   zodiacData.moonSign,
        ascendant: birthChartData.enhanced_birth_chart_data?.ascendant?.sign || 
                  birthChartData.ascendant || 
                  zodiacData.ascendant,
        dominant_planet: birthChartData.enhanced_birth_chart_data?.dominant_planet?.planet || 
                        birthChartData.dominant_planet || 
                        zodiacData.dominantPlanet
      };
      
      console.log('Drawing cosmic wheel with zodiac data:', zodiacDataForWheel);
      drawCosmicWheel(zodiacDataForWheel);
    }
  }, [birthChartData, zodiacData]);

  const handleCompleteGettingStarted = () => {
    navigate('/onboarding/step-1');
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Birth Chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-400 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Birth Chart Error</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border border-white/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // User doesn't have birth chart data - show educational content
  if (!birthChartData) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="chart_g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(560 380) rotate(90) scale(420 640)">
                <stop stopColor="#F59E0B" stopOpacity="0.33" />
                <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1200" height="800" fill="url(#chart_g1)" />
          </svg>
        </div>

        <AppNavbar />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Birth Chart
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Discover your cosmic blueprint - a personalized map of the heavens at the moment of your birth.
            </p>
          </div>

          {/* What is Birth Chart Section */}
          <div className="mb-16 bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">What is a Birth Chart?</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-orange-400 mb-4 flex items-center">
                    <span className="text-2xl mr-3">🌟</span>
                    Your Cosmic Blueprint
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    A birth chart is a snapshot of the sky at the exact moment you were born. It shows the precise positions of the Sun, Moon, planets, and stars in relation to Earth, creating a unique cosmic map that's yours alone.
                  </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
                    <span className="text-2xl mr-3">🔮</span>
                    Personal Insights
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    Through your birth chart, you can understand your personality traits, life patterns, relationship dynamics, career potentials, and spiritual journey with remarkable accuracy.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                    <span className="text-2xl mr-3">⏰</span>
                    Timeless Wisdom
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    This ancient astrological tool, used for thousands of years, combines celestial wisdom with modern understanding to provide practical guidance for your life's journey.
                  </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-pink-400 mb-4 flex items-center">
                    <span className="text-2xl mr-3">🎯</span>
                    Life Navigation
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    Your birth chart serves as a compass, helping you navigate life's challenges, make aligned decisions, and fulfill your highest potential.
                  </p>
                </div>
              </div>
            </div>

            {/* All Zodiac Signs */}
            <h3 className="text-2xl font-bold text-white mb-8 text-center">The Complete Zodiac Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {zodiacSignsData.map((sign) => (
                <div key={sign.sign} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: sign.color + '20' }}>
                        <span className="text-lg" style={{ color: sign.color }}>{sign.symbol}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">{sign.sign}</h4>
                    </div>
                    <div className="text-sm">
                      <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: sign.color + '20', color: sign.color }}>
                        {sign.element}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    {sign.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {sign.traits.map((trait, index) => (
                        <span key={index} className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">
                          {trait}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-white/50 mt-3">
                      <span className="font-medium">Ruler:</span> {sign.ruler} | 
                      <span className="font-medium">Quality:</span> {sign.quality}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-orange-400/10 via-yellow-400/10 to-orange-300/10 border-2 border-orange-400/30 rounded-3xl p-12 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Discover Your Cosmic Blueprint?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Complete your onboarding process to generate your personalized Birth Chart with detailed planetary positions and astrological insights.
              </p>
              <button
                onClick={handleCompleteGettingStarted}
                className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-300 hover:to-yellow-300 text-gray-900 font-bold text-lg py-4 px-12 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Complete Getting Started
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User has birth chart data - display their cosmic chart
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="chart_g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(560 380) rotate(90) scale(420 640)">
              <stop stopColor="#F59E0B" stopOpacity="0.33" />
              <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#chart_g1)" />
        </svg>
      </div>

      <AppNavbar />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
            Your Cosmic Birth Chart
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Your personalized map of the heavens at the moment of your birth
          </p>
        </div>

        {/* Zodiac Profile Display */}
        {zodiacData.sunSign && zodiacData.moonSign && zodiacData.ascendant ? (
          <div className="mb-12">
            <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-400/30 rounded-3xl p-8 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
                <span className="text-4xl mr-3">✨</span>
                Your Zodiac Profile
                <span className="text-4xl ml-3">✨</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sun Sign */}
                <div className="zodiac-card bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-400/30 rounded-2xl p-6 text-center hover:from-orange-500/30 hover:to-yellow-500/30 transition-all duration-300">
                  <div className="text-5xl mb-3">{zodiacIcons[zodiacData.sunSign] || '☉'}</div>
                  <h3 className="text-2xl font-bold text-orange-300 mb-2">{zodiacData.sunSign}</h3>
                  <p className="text-orange-200 text-sm">Sun Sign</p>
                  <p className="text-white/70 text-xs mt-2">Your core identity</p>
                </div>

                {/* Moon Sign */}
                <div className="zodiac-card bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-2xl p-6 text-center hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300">
                  <div className="text-5xl mb-3">{zodiacIcons[zodiacData.moonSign] || '☾'}</div>
                  <h3 className="text-2xl font-bold text-blue-300 mb-2">{zodiacData.moonSign}</h3>
                  <p className="text-blue-200 text-sm">Moon Sign</p>
                  <p className="text-white/70 text-xs mt-2">Your emotional nature</p>
                </div>

                {/* Ascendant */}
                <div className="zodiac-card bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-2xl p-6 text-center hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300">
                  <div className="text-5xl mb-3">{zodiacIcons[zodiacData.ascendant] || '⬆'}</div>
                  <h3 className="text-2xl font-bold text-purple-300 mb-2">{zodiacData.ascendant}</h3>
                  <p className="text-purple-200 text-sm">Ascendant</p>
                  <p className="text-white/70 text-xs mt-2">Your social mask</p>
                </div>

                {/* Dominant Planet */}
                <div className="zodiac-card bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 rounded-2xl p-6 text-center hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300">
                  <div className="text-5xl mb-3">🪐</div>
                  <h3 className="text-2xl font-bold text-emerald-300 mb-2">{zodiacData.dominantPlanet}</h3>
                  <p className="text-emerald-200 text-sm">Dominant Planet</p>
                  <p className="text-white/70 text-xs mt-2">Your ruling influence</p>
                </div>
              </div>

              {/* Summary Description */}
              <div className="mt-8 text-center">
                <p className="text-white/80 leading-relaxed max-w-3xl mx-auto">
                  As a <span className="text-orange-300 font-semibold">{zodiacData.sunSign}</span> with <span className="text-blue-300 font-semibold">{zodiacData.moonSign}</span> moon and <span className="text-purple-300 font-semibold">{zodiacData.ascendant}</span> rising, 
                  you embody a unique cosmic blend of energies, guided by the influence of <span className="text-emerald-300 font-semibold">{zodiacData.dominantPlanet}</span>.
                </p>
              </div>
            </div>
          </div>
        ) : birthChartData === null ? (
          /* User needs to generate insights first */
          <div className="mb-12 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
              <div className="text-6xl mb-6">🔮</div>
              <h3 className="text-2xl font-bold text-white mb-4">Generate Your Birth Chart</h3>
              <p className="text-white/80 text-lg mb-8">
                Complete your birth chart generation to unlock your personalized zodiac insights and cosmic profile.
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-300 hover:to-blue-300 text-white font-bold text-lg py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Generate Birth Chart
              </button>
            </div>
          </div>
        ) : (
          /* Loading state or other error */
          <div className="mb-12 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
              <div className="text-6xl mb-6">⚠️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Birth Chart Data Not Available</h3>
              <p className="text-white/80 text-lg mb-8">
                Your zodiac profile data is not available yet. Please complete your birth chart generation to unlock your personalized cosmic insights.
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-300 hover:to-blue-300 text-white font-bold text-lg py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Complete Birth Chart
              </button>
            </div>
          </div>
        )}

        {/* Birth Chart Data Display */}
        <div className="space-y-8">
          {/* Professional Cosmic Wheel */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-slate-900/50 to-indigo-900/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Your Personal Birth Chart</h2>
              <p className="text-white/70 text-center mb-6">Cosmic wheel showing your Sun, Moon, and Ascendant placements</p>
              <div className="relative">
                <svg
                  ref={svgRef}
                  width="450"
                  height="450"
                  viewBox="0 0 450 450"
                  className="w-full max-w-md rounded-2xl overflow-hidden"
                />
                {/* Enhanced Legend */}
                <div className="absolute -bottom-4 left-0 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex justify-around text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-orange-300 font-semibold">Your Sun</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-blue-300 font-semibold">Your Moon</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-purple-300 font-semibold">Your Ascendant</span>
                    </div>
                  </div>
                  <div className="text-center mt-2 text-white/60 text-xs">
                    Highlighted segments show your personal zodiac signs
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Zodiac Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Sun Sign Details */}
            {isLoadingZodiac ? (
              <div className="lg:col-span-2 xl:col-span-3 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white text-lg">Loading your zodiac insights...</p>
                </div>
              </div>
            ) : (
              <>
                {sunSignInfo && (
                  <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-400/30 rounded-3xl p-6 backdrop-blur-sm hover:from-orange-500/20 hover:to-yellow-500/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-orange-300 text-sm font-medium uppercase tracking-wider">Sun Sign</div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-400/20 rounded-full flex items-center justify-center mr-3">
                          <span className="text-orange-400 text-xl">{sunSignInfo.symbol}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-300">{sunSignInfo.sign}</div>
                          <div className="text-xs text-orange-200">
                            <span className="font-medium">Element:</span> {sunSignInfo.element} | 
                            <span className="font-medium"> Quality:</span> {sunSignInfo.quality}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/80 leading-relaxed mb-4 text-sm">{sunSignInfo.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-orange-300 font-semibold mb-2 text-sm flex items-center">
                          <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                          Key Traits
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {sunSignInfo.traits?.slice(0, 4).map((trait, index) => (
                            <span key={index} className="px-2 py-1 bg-orange-400/20 rounded text-xs text-orange-200">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {moonSignInfo && (
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-3xl p-6 backdrop-blur-sm hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-blue-300 text-sm font-medium uppercase tracking-wider">Moon Sign</div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-400/20 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-400 text-xl">{moonSignInfo.symbol}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-300">{moonSignInfo.sign}</div>
                          <div className="text-xs text-blue-200">
                            <span className="font-medium">Element:</span> {moonSignInfo.element} | 
                            <span className="font-medium"> Quality:</span> {moonSignInfo.quality}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/80 leading-relaxed mb-4 text-sm">{moonSignInfo.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-blue-300 font-semibold mb-2 text-sm flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          Emotional Traits
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {moonSignInfo.traits?.slice(0, 4).map((trait, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-400/20 rounded text-xs text-blue-200">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {ascendantInfo && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-3xl p-6 backdrop-blur-sm hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 lg:col-span-2 xl:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-purple-300 text-sm font-medium uppercase tracking-wider">Ascendant</div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-400/20 rounded-full flex items-center justify-center mr-3">
                          <span className="text-purple-400 text-xl">{ascendantInfo.symbol}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-300">{ascendantInfo.sign}</div>
                          <div className="text-xs text-purple-200">
                            <span className="font-medium">Element:</span> {ascendantInfo.element} | 
                            <span className="font-medium"> Quality:</span> {ascendantInfo.quality}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/80 leading-relaxed mb-4 text-sm">{ascendantInfo.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-purple-300 font-semibold mb-2 text-sm flex items-center">
                          <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                          Social Traits
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {ascendantInfo.traits?.slice(0, 4).map((trait, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-400/20 rounded text-xs text-purple-200">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthChartPage;
