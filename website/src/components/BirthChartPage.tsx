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
  const [isLoadingZodiac, setIsLoadingZodiac] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const fetchBirthChartData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch('/api/profile/insight-status');
        
        if (response.success && response.profile && response.profile.birth_chart_data) {
          setBirthChartData(response.profile.birth_chart_data);
          // Fetch detailed zodiac information for user's signs
          await fetchZodiacDetails(response.profile.birth_chart_data);
        } else if (response.success && response.profile && !response.profile.birth_chart_data) {
          // User doesn't have birth chart data
          setBirthChartData(null);
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
      
      // Add sign symbol with professional styling
      const textAngle = sign.angle * Math.PI / 180;
      const textX = centerX + (radius + 35) * Math.cos(textAngle);
      const textY = centerY + (radius + 35) * Math.sin(textAngle);
      
      // Symbol background circle
      svg.append("circle")
        .attr("cx", textX)
        .attr("cy", textY)
        .attr("r", 18)
        .attr("fill", sign.color + "20")
        .attr("stroke", sign.color)
        .attr("stroke-width", 1)
        .attr("opacity", 0.8);
      
      // Symbol text
      svg.append("text")
        .attr("x", textX)
        .attr("y", textY + 1)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", sign.color)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("font-family", "serif")
        .text(sign.symbol);
      
      // Sign name
      svg.append("text")
        .attr("x", textX)
        .attr("y", textY + 32)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", sign.color)
        .attr("font-size", "11px")
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
      // Get positions for user's signs
      const sunSignData = zodiacSignsData.find(s => s.sign === data.sun_sign);
      const moonSignData = zodiacSignsData.find(s => s.sign === data.moon_sign);
      const ascSignData = zodiacSignsData.find(s => s.sign === data.ascendant);

      // Draw Sun with professional styling
      if (sunSignData) {
        const sunAngle = sunSignData.angle * Math.PI / 180;
        const sunX = centerX + (radius * 0.5) * Math.cos(sunAngle);
        const sunY = centerY + (radius * 0.5) * Math.sin(sunAngle);
        
        // Sun glow effect
        for (let i = 3; i > 0; i--) {
          svg.append("circle")
            .attr("cx", sunX)
            .attr("cy", sunY)
            .attr("r", 25 + (i * 8))
            .attr("fill", "url(#sunGradient)")
            .attr("opacity", 0.1 * i);
        }
        
        // Main sun circle
        svg.append("circle")
          .attr("cx", sunX)
          .attr("cy", sunY)
          .attr("r", 18)
          .attr("fill", "url(#sunGradient)")
          .attr("stroke", "#FDB813")
          .attr("stroke-width", 2)
          .attr("filter", "drop-shadow(0 0 10px rgba(253, 184, 19, 0.5))");
        
        // Sun symbol
        svg.append("text")
          .attr("x", sunX)
          .attr("y", sunY + 4)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#FFFFFF")
          .attr("font-size", "18px")
          .attr("font-weight", "bold")
          .attr("font-family", "serif")
          .text("☉");
      }

      // Draw Moon with professional styling
      if (moonSignData) {
        const moonAngle = moonSignData.angle * Math.PI / 180;
        const moonX = centerX + (radius * 0.7) * Math.cos(moonAngle);
        const moonY = centerY + (radius * 0.7) * Math.sin(moonAngle);
        
        // Moon glow effect
        for (let i = 3; i > 0; i--) {
          svg.append("circle")
            .attr("cx", moonX)
            .attr("cy", moonY)
            .attr("r", 20 + (i * 6))
            .attr("fill", "url(#moonGradient)")
            .attr("opacity", 0.1 * i);
        }
        
        // Main moon circle
        svg.append("circle")
          .attr("cx", moonX)
          .attr("cy", moonY)
          .attr("r", 14)
          .attr("fill", "url(#moonGradient)")
          .attr("stroke", "#6366F1")
          .attr("stroke-width", 2)
          .attr("filter", "drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))");
        
        // Moon symbol
        svg.append("text")
          .attr("x", moonX)
          .attr("y", moonY + 3)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#FFFFFF")
          .attr("font-size", "16px")
          .attr("font-weight", "bold")
          .attr("font-family", "serif")
          .text("☽");
      }

      // Draw Ascendant with professional styling
      if (ascSignData) {
        const ascAngle = ascSignData.angle * Math.PI / 180;
        const ascX = centerX + (radius * 0.3) * Math.cos(ascAngle);
        const ascY = centerY + (radius * 0.3) * Math.sin(ascAngle);
        
        // Ascendant glow effect
        for (let i = 2; i > 0; i--) {
          svg.append("circle")
            .attr("cx", ascX)
            .attr("cy", ascY)
            .attr("r", 15 + (i * 5))
            .attr("fill", "url(#ascGradient)")
            .attr("opacity", 0.1 * i);
        }
        
        // Main ascendant circle
        svg.append("circle")
          .attr("cx", ascX)
          .attr("cy", ascY)
          .attr("r", 11)
          .attr("fill", "url(#ascGradient)")
          .attr("stroke", "#F472B6")
          .attr("stroke-width", 2)
          .attr("filter", "drop-shadow(0 0 6px rgba(244, 114, 182, 0.5))");
        
        // Ascendant symbol
        svg.append("text")
          .attr("x", ascX)
          .attr("y", ascY + 3)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#FFFFFF")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .attr("font-family", "serif")
          .text("⇅");
      }
    }
  };

  useEffect(() => {
    if (birthChartData && svgRef.current) {
      drawCosmicWheel(birthChartData);
    }
  }, [birthChartData]);

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
  const sunSignData = zodiacSignsData.find(s => s.sign === birthChartData?.sun_sign);
  const moonSignData = zodiacSignsData.find(s => s.sign === birthChartData?.moon_sign);
  const ascSignData = zodiacSignsData.find(s => s.sign === birthChartData?.ascendant);

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

        {/* Birth Chart Data Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Professional Cosmic Wheel */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-slate-900/50 to-indigo-900/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Cosmic Wheel</h2>
              <div className="relative">
                <svg
                  ref={svgRef}
                  width="450"
                  height="450"
                  viewBox="0 0 450 450"
                  className="w-full max-w-md rounded-2xl overflow-hidden"
                />
                {/* Legend */}
                <div className="absolute -bottom-4 left-0 right-0 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <div className="flex justify-around text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                      <span className="text-orange-300">Sun</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                      <span className="text-blue-300">Moon</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                      <span className="text-purple-300">Ascendant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Zodiac Information */}
          <div className="space-y-6">
            {/* Sun Sign Details */}
            {isLoadingZodiac ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white text-lg">Loading your zodiac insights...</p>
                </div>
              </div>
            ) : (
              <>
                {sunSignInfo && (
              <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-400/30 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-orange-300 text-sm font-medium uppercase tracking-wider">Sun Sign</div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-orange-400/20 rounded-full flex items-center justify-center mr-4">
                      <span className="text-orange-400 text-2xl">{sunSignInfo.symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-orange-300 mb-1">{sunSignInfo.sign}</div>
                      <div className="text-sm text-orange-200">
                        <span className="font-medium">Element:</span> {sunSignInfo.element} | 
                        <span className="font-medium">Quality:</span> {sunSignInfo.quality}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-white/80 leading-relaxed mb-6">{sunSignInfo.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-orange-300 font-semibold mb-3 flex items-center">
                        <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                        Key Traits
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {sunSignInfo.traits.map((trait, index) => (
                          <span key={index} className="px-3 py-1 bg-orange-400/20 rounded text-xs text-orange-200">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-orange-300 font-semibold mb-3 flex items-center">
                        <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                        Strengths
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {sunSignInfo.strengths.map((strength, index) => (
                          <span key={index} className="px-3 py-1 bg-orange-400/20 rounded text-xs text-orange-200">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-orange-300 font-semibold mb-3 text-sm">Lucky Numbers</h4>
                      <div className="flex gap-2">
                        {sunSignInfo.lucky_numbers.map((num, index) => (
                          <span key={index} className="px-3 py-1 bg-orange-400/20 rounded text-lg text-orange-200">
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-orange-300 font-semibold mb-3 text-sm">Lucky Colors</h4>
                      <div className="flex gap-2">
                        {sunSignInfo.lucky_colors.map((color, index) => (
                          <span key={index} className="px-3 py-1 bg-orange-400/20 rounded text-xs text-orange-200">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-orange-300 font-semibold mb-3 text-sm">Mantra</h4>
                      <p className="text-orange-200 italic text-sm">"{sunSignInfo.mantra}"</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Moon Sign Details */}
            {moonSignInfo && (
              <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-400/30 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-blue-300 text-sm font-medium uppercase tracking-wider">Moon Sign</div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-400 text-2xl">{moonSignInfo.symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-300 mb-1">{moonSignInfo.sign}</div>
                      <div className="text-sm text-blue-200">
                        <span className="font-medium">Element:</span> {moonSignInfo.element} | 
                        <span className="font-medium">Quality:</span> {moonSignInfo.quality}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-white/80 leading-relaxed mb-6">{moonSignInfo.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-blue-300 font-semibold mb-3 flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        Emotional Traits
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {moonSignInfo.traits.map((trait, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-400/20 rounded text-xs text-blue-200">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-blue-300 font-semibold mb-3 flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        Challenges
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {moonSignInfo.challenges.map((challenge, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-400/20 rounded text-xs text-blue-200">
                            {challenge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-blue-300 font-semibold mb-3 text-sm">Career Suitability</h4>
                      <div className="flex flex-wrap gap-2">
                        {moonSignInfo.career_suitability.map((career, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-400/20 rounded text-xs text-blue-200">
                            {career}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-blue-300 font-semibold mb-3 text-sm">Love Compatibility</h4>
                      <div className="flex flex-wrap gap-2">
                        {moonSignInfo.love_compatibility.map((sign, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-400/20 rounded text-xs text-blue-200">
                            {sign}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </>
            )}
            
            {/* Ascendant Details */}
            {ascendantInfo && (
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-purple-300 text-sm font-medium uppercase tracking-wider">Ascendant</div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-purple-400/20 rounded-full flex items-center justify-center mr-4">
                      <span className="text-purple-400 text-2xl">{ascendantInfo.symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-300 mb-1">{ascendantInfo.sign}</div>
                      <div className="text-sm text-purple-200">
                        <span className="font-medium">Element:</span> {ascendantInfo.element} | 
                        <span className="font-medium">Quality:</span> {ascendantInfo.quality}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-white/80 leading-relaxed mb-6">{ascendantInfo.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-purple-300 font-semibold mb-3 flex items-center">
                        <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                        How Others See You
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {ascendantInfo.traits.slice(0, 4).map((trait, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-400/20 rounded text-xs text-purple-200">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-purple-300 font-semibold mb-3 flex items-center">
                        <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                        Elemental Influence
                      </h4>
                      <p className="text-purple-200 text-sm leading-relaxed">{ascendantInfo.elemental_traits}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dominant Planet */}
            {birthChartData.dominant_planet && (
              <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-400/30 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-pink-300 text-sm font-medium uppercase tracking-wider">Dominant Planet</div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-pink-400/20 rounded-full flex items-center justify-center mr-4">
                      <span className="text-pink-400 text-2xl">🪐</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-pink-300 mb-1">{birthChartData.dominant_planet}</div>
                      <p className="text-pink-200 text-sm">Your ruling planetary influence</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthChartPage;
